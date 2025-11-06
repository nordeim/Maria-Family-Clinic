"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  ClockIcon,
  CalendarDaysIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  MapPinIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';
import { useAvailabilityTracker } from '@/hooks/service/use-availability-tracker';
import { conflictResolutionService, ConflictType } from '@/lib/service/conflict-resolution';

interface TimeSlotBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  slotId: string;
  serviceId: string;
  clinicId?: string;
  doctorId?: string;
}

interface BookingForm {
  patientInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    nric: string;
  };
  appointmentDetails: {
    symptoms: string;
    notes: string;
    isUrgent: boolean;
    preferredLanguage: string;
    requiresInterpreter: boolean;
    specialNeeds: string;
  };
  preferences: {
    exactTime: boolean;
    flexibleSchedule: boolean;
    sameDayPreferred: boolean;
    preferredDoctorIds: string[];
    preferredClinicIds: string[];
    allowWaitlist: boolean;
  };
  consent: {
    privacyConsent: boolean;
    termsConsent: boolean;
    marketingConsent: boolean;
  };
}

export function TimeSlotBookingModal({
  isOpen,
  onClose,
  slotId,
  serviceId,
  clinicId,
  doctorId,
}: TimeSlotBookingModalProps) {
  const [step, setStep] = useState<'details' | 'confirmation' | 'processing' | 'success' | 'error'>('details');
  const [formData, setFormData] = useState<BookingForm>({
    patientInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      nric: '',
    },
    appointmentDetails: {
      symptoms: '',
      notes: '',
      isUrgent: false,
      preferredLanguage: 'en',
      requiresInterpreter: false,
      specialNeeds: '',
    },
    preferences: {
      exactTime: true,
      flexibleSchedule: false,
      sameDayPreferred: false,
      preferredDoctorIds: [],
      preferredClinicIds: [],
      allowWaitlist: true,
    },
    consent: {
      privacyConsent: false,
      termsConsent: false,
      marketingConsent: false,
    },
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [bookingResult, setBookingResult] = useState<any>(null);
  const [conflictResolution, setConflictResolution] = useState<any>(null);

  const { 
    bookAppointment, 
    isBooking,
    availability,
    isSlotAvailable 
  } = useAvailabilityTracker({
    serviceId,
    clinicId,
    doctorId,
  });

  // Get slot details
  const slot = availability
    ?.flatMap(avail => avail.timeSlots)
    .find(s => s.id === slotId);

  useEffect(() => {
    if (!isOpen) {
      setStep('details');
      setErrors({});
      setBookingResult(null);
      setConflictResolution(null);
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Patient info validation
    if (!formData.patientInfo.firstName.trim()) {
      newErrors['patientInfo.firstName'] = 'First name is required';
    }
    if (!formData.patientInfo.lastName.trim()) {
      newErrors['patientInfo.lastName'] = 'Last name is required';
    }
    if (!formData.patientInfo.email.trim()) {
      newErrors['patientInfo.email'] = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.patientInfo.email)) {
      newErrors['patientInfo.email'] = 'Invalid email format';
    }
    if (!formData.patientInfo.phone.trim()) {
      newErrors['patientInfo.phone'] = 'Phone number is required';
    }

    // Consent validation
    if (!formData.consent.privacyConsent) {
      newErrors['consent.privacyConsent'] = 'Privacy consent is required';
    }
    if (!formData.consent.termsConsent) {
      newErrors['consent.termsConsent'] = 'Terms of service consent is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: any) => {
    const [section, key] = field.split('.');
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof BookingForm],
        [key]: value,
      },
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setStep('processing');

    try {
      const bookingRequest = {
        serviceId,
        clinicId: clinicId || '',
        doctorId: doctorId || '',
        preferredSlotId: slotId,
        patientId: 'current-user-id', // This would come from auth context
        appointmentDetails: {
          symptoms: formData.appointmentDetails.symptoms,
          notes: formData.appointmentDetails.notes,
          isUrgent: formData.appointmentDetails.isUrgent,
          preferredLanguage: formData.appointmentDetails.preferredLanguage,
        },
        flexibility: {
          timeFlexibility: formData.preferences.flexibleSchedule ? 80 : 20,
          doctorFlexibility: formData.preferences.preferredDoctorIds.length > 0 ? 30 : 80,
          clinicFlexibility: formData.preferences.preferredClinicIds.length > 0 ? 30 : 80,
          dateFlexibility: formData.preferences.sameDayPreferred ? 20 : 60,
        },
        constraints: {
          earliestAcceptable: new Date().toISOString(),
          latestAcceptable: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          mustHaveTimeSlot: !formData.preferences.allowWaitlist,
          preferredDoctorIds: formData.preferences.preferredDoctorIds,
          preferredClinicIds: formData.preferences.preferredClinicIds,
        },
      };

      const result = await bookAppointment(bookingRequest);
      
      if (result.success) {
        setBookingResult(result);
        setStep('success');
      } else {
        // Handle conflicts
        if (result.conflictResolution) {
          setConflictResolution(result.conflictResolution);
          setStep('confirmation');
        } else {
          setStep('error');
        }
      }
    } catch (error) {
      console.error('Booking failed:', error);
      setStep('error');
    }
  };

  const handleConflictResolution = async (resolution: any) => {
    setStep('processing');

    try {
      // Apply the resolution
      const result = await conflictResolutionService.resolveConflicts([{
        id: 'booking-conflict',
        type: resolution.type,
        severity: resolution.severity,
        description: resolution.description,
        conflictingSlots: resolution.conflictingSlots,
        originalSlot: slot!,
        overlappingSlots: resolution.overlappingSlots,
        patientIds: ['current-user-id'],
        doctorId: doctorId || '',
        clinicId: clinicId || '',
        serviceId,
        detectedAt: new Date().toISOString(),
        priority: 1,
        impactAnalysis: {} as any,
      }]);

      if (result.success) {
        setStep('success');
      } else {
        setStep('error');
      }
    } catch (error) {
      console.error('Conflict resolution failed:', error);
      setStep('error');
    }
  };

  const formatSlotTime = () => {
    if (!slot) return '';
    const startTime = new Date(slot.startTime);
    return startTime.toLocaleString();
  };

  const getStepIndicator = () => {
    const steps = ['details', 'confirmation', 'processing', 'success', 'error'];
    const currentIndex = steps.indexOf(step);
    
    return (
      <div className="flex items-center justify-center space-x-2 mb-6">
        {steps.map((stepName, index) => (
          <div
            key={stepName}
            className={`w-3 h-3 rounded-full ${
              index <= currentIndex ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (!slot) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <div className="text-center py-8">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p>Time slot not found or no longer available.</p>
            <Button onClick={onClose} className="mt-4">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CalendarDaysIcon className="h-5 w-5 text-blue-500" />
            <span>Book Appointment</span>
          </DialogTitle>
        </DialogHeader>

        {getStepIndicator()}

        {/* Step 1: Booking Details */}
        {step === 'details' && (
          <div className="space-y-6">
            {/* Slot Information */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Selected Time Slot</h3>
              <div className="flex items-center space-x-4 text-sm text-blue-800">
                <div className="flex items-center space-x-1">
                  <ClockIcon className="h-4 w-4" />
                  <span>{formatSlotTime()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPinIcon className="h-4 w-4" />
                  <span>{slot.duration} minutes</span>
                </div>
              </div>
            </div>

            {/* Patient Information */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 flex items-center">
                <UserIcon className="h-4 w-4 mr-2" />
                Patient Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.patientInfo.firstName}
                    onChange={(e) => handleInputChange('patientInfo.firstName', e.target.value)}
                    className={errors['patientInfo.firstName'] ? 'border-red-500' : ''}
                  />
                  {errors['patientInfo.firstName'] && (
                    <p className="text-red-500 text-sm mt-1">{errors['patientInfo.firstName']}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.patientInfo.lastName}
                    onChange={(e) => handleInputChange('patientInfo.lastName', e.target.value)}
                    className={errors['patientInfo.lastName'] ? 'border-red-500' : ''}
                  />
                  {errors['patientInfo.lastName'] && (
                    <p className="text-red-500 text-sm mt-1">{errors['patientInfo.lastName']}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.patientInfo.email}
                    onChange={(e) => handleInputChange('patientInfo.email', e.target.value)}
                    className={errors['patientInfo.email'] ? 'border-red-500' : ''}
                  />
                  {errors['patientInfo.email'] && (
                    <p className="text-red-500 text-sm mt-1">{errors['patientInfo.email']}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.patientInfo.phone}
                    onChange={(e) => handleInputChange('patientInfo.phone', e.target.value)}
                    className={errors['patientInfo.phone'] ? 'border-red-500' : ''}
                  />
                  {errors['patientInfo.phone'] && (
                    <p className="text-red-500 text-sm mt-1">{errors['patientInfo.phone']}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Appointment Details */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Appointment Details</h3>
              
              <div>
                <Label htmlFor="symptoms">Symptoms / Reason for Visit</Label>
                <Textarea
                  id="symptoms"
                  value={formData.appointmentDetails.symptoms}
                  onChange={(e) => handleInputChange('appointmentDetails.symptoms', e.target.value)}
                  placeholder="Please describe your symptoms or reason for the appointment..."
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.appointmentDetails.notes}
                  onChange={(e) => handleInputChange('appointmentDetails.notes', e.target.value)}
                  placeholder="Any additional information or special requests..."
                  rows={2}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isUrgent"
                  checked={formData.appointmentDetails.isUrgent}
                  onCheckedChange={(checked) => 
                    handleInputChange('appointmentDetails.isUrgent', checked)
                  }
                />
                <Label htmlFor="isUrgent">This is an urgent appointment</Label>
              </div>
            </div>

            {/* Preferences */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Preferences</h3>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allowWaitlist"
                    checked={formData.preferences.allowWaitlist}
                    onCheckedChange={(checked) => 
                      handleInputChange('preferences.allowWaitlist', checked)
                    }
                  />
                  <Label htmlFor="allowWaitlist">
                    Allow me to join the waitlist if the selected time is not available
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="flexibleSchedule"
                    checked={formData.preferences.flexibleSchedule}
                    onCheckedChange={(checked) => 
                      handleInputChange('preferences.flexibleSchedule', checked)
                    }
                  />
                  <Label htmlFor="flexibleSchedule">
                    I have flexible timing and can adjust my schedule
                  </Label>
                </div>
              </div>
            </div>

            {/* Consent */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Consent & Agreements</h3>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="privacyConsent"
                    checked={formData.consent.privacyConsent}
                    onCheckedChange={(checked) => 
                      handleInputChange('consent.privacyConsent', checked)
                    }
                    className={errors['consent.privacyConsent'] ? 'border-red-500' : ''}
                  />
                  <Label htmlFor="privacyConsent" className="text-sm">
                    I consent to the collection and use of my personal data for healthcare services *
                  </Label>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="termsConsent"
                    checked={formData.consent.termsConsent}
                    onCheckedChange={(checked) => 
                      handleInputChange('consent.termsConsent', checked)
                    }
                    className={errors['consent.termsConsent'] ? 'border-red-500' : ''}
                  />
                  <Label htmlFor="termsConsent" className="text-sm">
                    I agree to the Terms of Service and Cancellation Policy *
                  </Label>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="marketingConsent"
                    checked={formData.consent.marketingConsent}
                    onCheckedChange={(checked) => 
                      handleInputChange('consent.marketingConsent', checked)
                    }
                  />
                  <Label htmlFor="marketingConsent" className="text-sm">
                    I would like to receive health tips and clinic updates via email
                  </Label>
                </div>
              </div>
              
              {(errors['consent.privacyConsent'] || errors['consent.termsConsent']) && (
                <Alert>
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  <AlertDescription>
                    {errors['consent.privacyConsent'] || errors['consent.termsConsent']}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isBooking}>
                {isBooking ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Book Appointment'
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Conflict Resolution */}
        {step === 'confirmation' && conflictResolution && (
          <div className="space-y-6">
            <Alert>
              <ExclamationTriangleIcon className="h-4 w-4" />
              <AlertDescription>
                The selected time slot is no longer available. We found alternative options for you.
              </AlertDescription>
            </Alert>

            {/* Conflict Information */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-medium text-yellow-900 mb-2">Scheduling Conflict Detected</h3>
              <p className="text-yellow-800 text-sm">{conflictResolution.description}</p>
            </div>

            {/* Alternative Options */}
            {conflictResolution.alternatives && conflictResolution.alternatives.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Alternative Time Slots</h3>
                <div className="space-y-2">
                  {conflictResolution.alternatives.map((alternative: any, index: number) => (
                    <div 
                      key={index}
                      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">
                            {new Date(alternative.startTime).toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">
                            {alternative.benefits?.join(', ') || 'Available alternative'}
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          Select
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Waitlist Option */}
            {formData.preferences.allowWaitlist && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Waitlist Option</h3>
                <p className="text-blue-800 text-sm mb-3">
                  You can join the waitlist for your preferred time slot. We'll notify you if a spot becomes available.
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleConflictResolution({ type: 'waitlist' })}
                >
                  Join Waitlist
                </Button>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="outline" onClick={() => setStep('details')}>
                Back to Details
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Processing */}
        {step === 'processing' && (
          <div className="text-center py-12">
            <ArrowPathIcon className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Processing Your Booking</h3>
            <p className="text-gray-600">
              Please wait while we confirm your appointment and handle any scheduling conflicts.
            </p>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 'success' && bookingResult && (
          <div className="text-center py-8">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">Appointment Booked Successfully!</h3>
            
            {bookingResult.confirmation && (
              <div className="bg-green-50 p-4 rounded-lg mt-4 text-left">
                <h4 className="font-medium text-green-900 mb-3">Appointment Details</h4>
                <div className="space-y-2 text-sm text-green-800">
                  <div>Date & Time: {bookingResult.confirmation.appointmentDate}</div>
                  <div>Service: {bookingResult.confirmation.serviceName}</div>
                  <div>Clinic: {bookingResult.confirmation.clinicName}</div>
                  <div>Doctor: {bookingResult.confirmation.doctorName}</div>
                  <div>Duration: {bookingResult.confirmation.estimatedDuration} minutes</div>
                </div>
              </div>
            )}
            
            {bookingResult.waitlistPosition && (
              <Alert className="mt-4">
                <UserIcon className="h-4 w-4" />
                <AlertDescription>
                  You're #{bookingResult.waitlistPosition} on the waitlist. We'll notify you if a spot becomes available.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-center space-x-3 mt-6">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button onClick={() => window.print()}>
                Print Confirmation
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Error */}
        {step === 'error' && (
          <div className="text-center py-8">
            <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">Booking Failed</h3>
            <p className="text-gray-600 mb-4">
              We encountered an error while processing your booking. Please try again.
            </p>
            
            <div className="flex justify-center space-x-3">
              <Button variant="outline" onClick={() => setStep('details')}>
                Try Again
              </Button>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}