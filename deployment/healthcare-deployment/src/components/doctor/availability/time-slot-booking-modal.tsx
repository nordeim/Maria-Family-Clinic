/**
 * Time Slot Booking Modal Component
 * Sub-Phase 7.5: Doctor Availability & Scheduling Integration
 * 
 * Comprehensive booking interface with conflict resolution and waitlist integration
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Clock, 
  Users, 
  AlertCircle, 
  CheckCircle, 
  Calendar,
  Phone,
  Mail,
  User,
  MessageSquare,
  AlertTriangle,
  Loader2,
  Timer
} from 'lucide-react';
import { DoctorAvailability, UrgencyLevel } from '@/types/doctor';
import { format, parseISO } from 'date-fns';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  slot: DoctorAvailability;
  doctorId: string;
  onBook: (request: any) => Promise<any>;
  onJoinWaitlist: (request: any) => Promise<any>;
}

interface BookingForm {
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  appointmentType: string;
  urgencyLevel: UrgencyLevel;
  notes: string;
  preferredSlotTime: string;
  isNewPatient: boolean;
  emergencyContact: string;
  specialRequirements: string;
}

export const TimeSlotBookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  slot,
  doctorId,
  onBook,
  onJoinWaitlist,
}) => {
  const [bookingStep, setBookingStep] = useState<'form' | 'confirmation' | 'waitlist'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<any>(null);
  const [formData, setFormData] = useState<BookingForm>({
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    appointmentType: 'consultation',
    urgencyLevel: 'ROUTINE',
    notes: '',
    preferredSlotTime: slot.startTime,
    isNewPatient: true,
    emergencyContact: '',
    specialRequirements: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setBookingStep('form');
      setBookingResult(null);
      setErrors({});
      setFormData(prev => ({
        ...prev,
        preferredSlotTime: slot.startTime,
      }));
    }
  }, [isOpen, slot.startTime]);

  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.patientName.trim()) {
      newErrors.patientName = 'Patient name is required';
    }

    if (!formData.patientPhone.trim()) {
      newErrors.patientPhone = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]{8,}$/.test(formData.patientPhone)) {
      newErrors.patientPhone = 'Please enter a valid phone number';
    }

    if (formData.patientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.patientEmail)) {
      newErrors.patientEmail = 'Please enter a valid email address';
    }

    if (!formData.appointmentType) {
      newErrors.appointmentType = 'Appointment type is required';
    }

    if (slot.isEmergency && formData.urgencyLevel !== 'EMERGENCY') {
      newErrors.urgencyLevel = 'Emergency slot requires emergency appointment type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const bookingRequest = {
        doctorId,
        availabilityId: slot.id,
        patientName: formData.patientName,
        patientPhone: formData.patientPhone,
        patientEmail: formData.patientEmail,
        appointmentType: formData.appointmentType,
        urgencyLevel: formData.urgencyLevel,
        notes: formData.notes,
        preferredSlotTime: formData.preferredSlotTime,
        specialRequirements: formData.specialRequirements,
      };

      const result = await onBook(bookingRequest);

      if (result.success) {
        setBookingResult(result);
        setBookingStep('confirmation');
      } else {
        if (result.alternativeSlots && result.alternativeSlots.length > 0) {
          setBookingResult(result);
          setBookingStep('confirmation');
        } else if (result.waitlistPosition) {
          setBookingResult(result);
          setBookingStep('waitlist');
        } else {
          setErrors({ submit: result.message || 'Booking failed. Please try again.' });
        }
      }
    } catch (error: any) {
      setErrors({ submit: error.message || 'Booking failed. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle join waitlist
  const handleJoinWaitlist = async () => {
    setIsSubmitting(true);

    try {
      const waitlistRequest = {
        doctorId,
        patientName: formData.patientName,
        patientPhone: formData.patientPhone,
        patientEmail: formData.patientEmail,
        appointmentType: formData.appointmentType,
        urgencyLevel: formData.urgencyLevel,
        notes: formData.notes,
        preferredSlotTime: formData.preferredSlotTime,
      };

      const result = await onJoinWaitlist(waitlistRequest);
      setBookingResult(result);
      setBookingStep('waitlist');
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to join waitlist' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get slot type badge
  const getSlotTypeBadge = () => {
    const badges = [];
    
    if (slot.isEmergency) {
      badges.push(<Badge key="emergency" variant="destructive">Emergency</Badge>);
    }
    if (slot.isTelehealth) {
      badges.push(<Badge key="telehealth" variant="secondary">Telehealth</Badge>);
    }
    if (slot.isWalkIn) {
      badges.push(<Badge key="walkin" variant="outline">Walk-in</Badge>);
    }
    
    return badges;
  };

  // Render success/confirmation content
  const renderConfirmationContent = () => (
    <div className="space-y-4">
      <div className="text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-green-700">Booking Confirmed!</h3>
        {bookingResult?.confirmationCode && (
          <p className="text-sm text-gray-600 mt-2">
            Confirmation Code: <span className="font-mono font-semibold">{bookingResult.confirmationCode}</span>
          </p>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Appointment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">Date:</span>
            <span>{format(parseISO(slot.date), 'EEEE, MMMM d, yyyy')}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Time:</span>
            <span>{slot.startTime} - {slot.endTime}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Type:</span>
            <div className="flex gap-1">{getSlotTypeBadge()}</div>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Duration:</span>
            <span>{slot.slotDuration} minutes</span>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <Calendar className="h-4 w-4" />
        <AlertDescription>
          You will receive a confirmation SMS/email with appointment details and preparation instructions.
        </AlertDescription>
      </Alert>
    </div>
  );

  // Render waitlist content
  const renderWaitlistContent = () => (
    <div className="space-y-4">
      <div className="text-center">
        <Timer className="w-16 h-16 text-orange-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-orange-700">Added to Waitlist</h3>
        <p className="text-sm text-gray-600 mt-2">
          We'll notify you when a slot becomes available
        </p>
      </div>

      {bookingResult?.waitlistPosition && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Waitlist Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">Position:</span>
              <Badge variant="outline" className="text-lg px-3 py-1">
                #{bookingResult.waitlistPosition}
              </Badge>
            </div>
            {bookingResult.estimatedWaitTime && (
              <div className="flex items-center justify-between">
                <span className="font-medium">Estimated Wait:</span>
                <span>{bookingResult.estimatedWaitTime}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Alert>
        <MessageSquare className="h-4 w-4" />
        <AlertDescription>
          We'll send you immediate notifications if a slot becomes available. 
          You can cancel from the waitlist at any time.
        </AlertDescription>
      </Alert>
    </div>
  );

  // Render form content
  const renderFormContent = () => (
    <div className="space-y-6">
      {/* Slot Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="w-5 h-5" />
            Selected Time Slot
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-600">Date</div>
              <div className="font-semibold">{format(parseISO(slot.date), 'EEEE, MMMM d, yyyy')}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">Time</div>
              <div className="font-semibold">{slot.startTime} - {slot.endTime}</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-600">
              Available Slots: {slot.availableSlots} / {slot.maxAppointments || slot.availableSlots}
            </div>
            <div className="flex gap-1">{getSlotTypeBadge()}</div>
          </div>

          {slot.notes && (
            <div className="mt-3 p-3 bg-blue-50 rounded-md">
              <div className="text-sm font-medium text-blue-800">Notes:</div>
              <div className="text-sm text-blue-700">{slot.notes}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Patient Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Patient Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="patientName">Full Name *</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="patientName"
                placeholder="Enter full name"
                value={formData.patientName}
                onChange={(e) => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
                className={`pl-10 ${errors.patientName ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.patientName && (
              <div className="text-sm text-red-500">{errors.patientName}</div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="patientPhone">Phone Number *</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="patientPhone"
                placeholder="+65 XXXX XXXX"
                value={formData.patientPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, patientPhone: e.target.value }))}
                className={`pl-10 ${errors.patientPhone ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.patientPhone && (
              <div className="text-sm text-red-500">{errors.patientPhone}</div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="patientEmail">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="patientEmail"
                type="email"
                placeholder="your@email.com"
                value={formData.patientEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, patientEmail: e.target.value }))}
                className={`pl-10 ${errors.patientEmail ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.patientEmail && (
              <div className="text-sm text-red-500">{errors.patientEmail}</div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="isNewPatient">Patient Type</Label>
            <Select 
              value={formData.isNewPatient ? 'new' : 'existing'}
              onValueChange={(value) => setFormData(prev => ({ ...prev, isNewPatient: value === 'new' }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New Patient</SelectItem>
                <SelectItem value="existing">Existing Patient</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="appointmentType">Appointment Type *</Label>
            <Select 
              value={formData.appointmentType}
              onValueChange={(value) => setFormData(prev => ({ ...prev, appointmentType: value }))}
            >
              <SelectTrigger className={errors.appointmentType ? 'border-red-500' : ''}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="consultation">General Consultation</SelectItem>
                <SelectItem value="followup">Follow-up</SelectItem>
                <SelectItem value="checkup">Health Check-up</SelectItem>
                <SelectItem value="procedure">Procedure</SelectItem>
                <SelectItem value="vaccination">Vaccination</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>
            {errors.appointmentType && (
              <div className="text-sm text-red-500">{errors.appointmentType}</div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="urgencyLevel">Urgency Level</Label>
            <Select 
              value={formData.urgencyLevel}
              onValueChange={(value) => setFormData(prev => ({ ...prev, urgencyLevel: value as UrgencyLevel }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ROUTINE">Routine</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
                <SelectItem value="SAME_DAY">Same Day</SelectItem>
                <SelectItem value="EMERGENCY">Emergency</SelectItem>
              </SelectContent>
            </Select>
            {errors.urgencyLevel && (
              <div className="text-sm text-red-500">{errors.urgencyLevel}</div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes / Special Requirements</Label>
          <Textarea
            id="notes"
            placeholder="Any specific requirements, symptoms, or notes for the doctor..."
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="specialRequirements">Medical Conditions / Allergies</Label>
          <Textarea
            id="specialRequirements"
            placeholder="Please list any medical conditions, allergies, or medications we should be aware of..."
            value={formData.specialRequirements}
            onChange={(e) => setFormData(prev => ({ ...prev, specialRequirements: e.target.value }))}
            rows={2}
          />
        </div>
      </div>

      {errors.submit && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{errors.submit}</AlertDescription>
        </Alert>
      )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-2xl max-h-[90vh] overflow-y-auto ${bookingStep === 'form' ? 'max-w-2xl' : 'max-w-lg'}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {bookingStep === 'form' && 'Book Appointment'}
            {bookingStep === 'confirmation' && 'Booking Confirmed'}
            {bookingStep === 'waitlist' && 'Waitlist Status'}
          </DialogTitle>
          <DialogDescription>
            {bookingStep === 'form' && 'Fill in your details to book this time slot'}
            {bookingStep === 'confirmation' && 'Your appointment has been successfully booked'}
            {bookingStep === 'waitlist' && 'You have been added to the waitlist'}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {bookingStep === 'form' && renderFormContent()}
          {bookingStep === 'confirmation' && renderConfirmationContent()}
          {bookingStep === 'waitlist' && renderWaitlistContent()}
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t">
          <div>
            {bookingStep === 'form' && (
              <Button
                variant="outline"
                onClick={() => handleJoinWaitlist()}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Timer className="w-4 h-4 mr-2" />
                )}
                Join Waitlist Instead
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            {bookingStep === 'form' && (
              <>
                <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="min-w-[100px]"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Book Now
                </Button>
              </>
            )}
            
            {bookingStep !== 'form' && (
              <Button onClick={onClose} className="w-full">
                Done
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TimeSlotBookingModal;