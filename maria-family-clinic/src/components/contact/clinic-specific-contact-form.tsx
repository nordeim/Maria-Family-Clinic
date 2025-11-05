// ========================================
// CLINIC-SPECIFIC CONTACT FORM
// Sub-Phase 9.4: Personalized Contact Forms with Clinic Integration
// Healthcare Platform Contact System Design
// ========================================

"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Loader2, 
  Send, 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  MessageSquare,
  CheckCircle,
  AlertCircle,
  User,
  Stethoscope,
  Heart,
  Calendar,
  Languages
} from 'lucide-react';
import { ContactMethod, PatientType, UrgencyLevel } from '../../lib/types/contact-system';

// Contact form schema
const clinicContactFormSchema = z.object({
  // Basic contact information
  contactName: z.string().min(2, 'Name must be at least 2 characters'),
  contactEmail: z.string().email('Please enter a valid email address'),
  contactPhone: z.string().optional(),
  preferredContactMethod: z.enum(['EMAIL', 'PHONE', 'SMS', 'CHAT']).default('EMAIL'),
  
  // Subject and message
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(20, 'Message must be at least 20 characters'),
  
  // Clinic context
  serviceContext: z.string().optional(),
  appointmentType: z.string().optional(),
  requiresAppointment: z.boolean().default(false),
  followUpRequired: z.boolean().default(false),
  
  // Patient context
  patientType: z.enum(['NEW', 'EXISTING', 'RETURNING', 'REFERRAL', 'EMERGENCY', 'WALK_IN']).default('NEW'),
  isReturningPatient: z.boolean().default(false),
  preferredLanguage: z.string().default('en'),
  
  // Medical context
  medicalInformation: z.string().optional(),
  conditionType: z.string().optional(),
  urgencyOverride: z.enum(['LOW', 'ROUTINE', 'NORMAL', 'HIGH', 'URGENT', 'CRITICAL', 'EMERGENCY']).default('NORMAL'),
  
  // Routing preferences
  preferredStaffId: z.string().optional(),
  preferredResponseTime: z.number().optional(),
  avoidCommunication: z.array(z.string()).default([]),
  
  // Consent
  privacyConsent: z.boolean().refine(val => val === true, 'Privacy consent is required'),
  marketingConsent: z.boolean().default(false)
});

type ClinicContactFormData = z.infer<typeof clinicContactFormSchema>;

interface ClinicSpecificContactFormProps {
  clinicId: string;
  clinicName: string;
  clinicSettings?: any;
  onSubmit: (data: ClinicContactFormData) => Promise<any>;
  initialData?: Partial<ClinicContactFormData>;
  className?: string;
}

interface ClinicContactFormProps {
  clinicId: string;
  onSubmitSuccess?: (result: any) => void;
  onSubmitError?: (error: string) => void;
}

export function ClinicSpecificContactForm({ 
  clinicId, 
  clinicName,
  clinicSettings,
  onSubmit,
  initialData,
  className = ""
}: ClinicSpecificContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<any>(null);
  const [suggestedFAQs, setSuggestedFAQs] = useState<any[]>([]);
  const [availableStaff, setAvailableStaff] = useState<any[]>([]);
  const [autoSuggestions, setAutoSuggestions] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset
  } = useForm<ClinicContactFormData>({
    resolver: zodResolver(clinicContactFormSchema),
    defaultValues: {
      preferredContactMethod: 'EMAIL',
      patientType: 'NEW',
      isReturningPatient: false,
      preferredLanguage: 'en',
      urgencyOverride: 'NORMAL',
      requiresAppointment: false,
      followUpRequired: false,
      avoidCommunication: [],
      privacyConsent: false,
      marketingConsent: false,
      ...initialData
    }
  });

  const watchedFields = watch();
  const messageText = watchedFields.message;
  const serviceContext = watchedFields.serviceContext;

  // Load clinic data and personalization
  useEffect(() => {
    loadClinicData();
  }, [clinicId]);

  // Auto-suggest FAQ based on message content
  useEffect(() => {
    if (messageText && messageText.length > 20) {
      getAutoSuggestions(messageText);
    }
  }, [messageText, serviceContext]);

  const loadClinicData = async () => {
    try {
      // Load clinic contact settings and staff
      const response = await fetch(`/api/clinic-contact-integration/contact-forms/get-personalized-form?clinicId=${clinicId}`);
      const data = await response.json();
      
      setAvailableStaff(data.availableStaff || []);
      setSuggestedFAQs(data.faqs || []);
    } catch (error) {
      console.error('Failed to load clinic data:', error);
    }
  };

  const getAutoSuggestions = async (content: string) => {
    try {
      const response = await fetch(`/api/clinic-contact-integration/faq/get-suggested-faqs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicId,
          contactContent: content,
          serviceType: serviceContext
        })
      });
      const suggestions = await response.json();
      setAutoSuggestions(suggestions.map((faq: any) => faq.question));
    } catch (error) {
      console.error('Failed to get auto suggestions:', error);
    }
  };

  const handleFormSubmit = async (data: ClinicContactFormData) => {
    setIsSubmitting(true);
    try {
      const result = await onSubmit({
        ...data,
        clinicId
      });
      
      setSubmitResult(result);
      setShowSuccess(true);
      reset();
      setCurrentStep(1);
      
      if (onSubmitSuccess) {
        onSubmitSuccess(result);
      }
    } catch (error: any) {
      console.error('Form submission error:', error);
      if (onSubmitError) {
        onSubmitError(error.message || 'Failed to submit form');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess && submitResult) {
    return (
      <Card className={`w-full max-w-2xl mx-auto ${className}`}>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h3 className="text-2xl font-semibold text-gray-900">Form Submitted Successfully</h3>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Reference Number:</p>
              <p className="text-lg font-mono font-bold text-blue-600">{submitResult.referenceNumber}</p>
            </div>
            <div className="space-y-2">
              <p className="text-gray-600">
                We've received your message and will get back to you within{' '}
                <span className="font-semibold">{submitResult.estimatedResponseTime} hours</span>.
              </p>
              <p className="text-sm text-gray-500">
                You'll receive updates at {watchedFields.contactEmail}
              </p>
            </div>
            <div className="flex gap-3 justify-center pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowSuccess(false)}
              >
                Submit Another Query
              </Button>
              <Button 
                onClick={() => window.location.href = `/clinics/${clinicId}`}
              >
                View Clinic Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full max-w-2xl mx-auto ${className}`}>
      <CardHeader className="text-center">
        <CardTitle className="flex items-center gap-2 justify-center">
          <Stethoscope className="h-6 w-6" />
          Contact {clinicName}
        </CardTitle>
        <CardDescription>
          Get personalized assistance for your healthcare needs
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Clinic Information Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border">
          <div className="flex items-center gap-4">
            <MapPin className="h-5 w-5 text-blue-600" />
            <div>
              <h4 className="font-semibold text-gray-900">{clinicName}</h4>
              <p className="text-sm text-gray-600">
                Response time: {clinicSettings?.responseTimeTarget || 24} hours
              </p>
            </div>
            {availableStaff.length > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {availableStaff.length} staff available
              </Badge>
            )}
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center space-x-4">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {currentStep > step ? '✓' : step}
              </div>
              {step < 4 && (
                <div
                  className={`w-12 h-1 mx-2 ${
                    currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Step 1: Contact Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="h-5 w-5" />
                Contact Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactName">Full Name *</Label>
                  <Input
                    id="contactName"
                    {...register('contactName')}
                    placeholder="Your full name"
                    className={errors.contactName ? 'border-red-500' : ''}
                  />
                  {errors.contactName && (
                    <p className="text-sm text-red-500 mt-1">{errors.contactName.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="contactEmail">Email Address *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    {...register('contactEmail')}
                    placeholder="your.email@example.com"
                    className={errors.contactEmail ? 'border-red-500' : ''}
                  />
                  {errors.contactEmail && (
                    <p className="text-sm text-red-500 mt-1">{errors.contactEmail.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactPhone">Phone Number</Label>
                  <Input
                    id="contactPhone"
                    {...register('contactPhone')}
                    placeholder="+65 9123 4567"
                  />
                </div>

                <div>
                  <Label htmlFor="preferredContactMethod">Preferred Contact Method</Label>
                  <Select 
                    value={watchedFields.preferredContactMethod} 
                    onValueChange={(value) => setValue('preferredContactMethod', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EMAIL">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email
                        </div>
                      </SelectItem>
                      <SelectItem value="PHONE">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Phone Call
                        </div>
                      </SelectItem>
                      <SelectItem value="SMS">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          SMS
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Healthcare Context */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Healthcare Context
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="patientType">Patient Type</Label>
                  <Select 
                    value={watchedFields.patientType} 
                    onValueChange={(value) => setValue('patientType', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NEW">New Patient</SelectItem>
                      <SelectItem value="EXISTING">Existing Patient</SelectItem>
                      <SelectItem value="RETURNING">Returning Patient</SelectItem>
                      <SelectItem value="REFERRAL">Referral</SelectItem>
                      <SelectItem value="EMERGENCY">Emergency</SelectItem>
                      <SelectItem value="WALK_IN">Walk-in</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="preferredLanguage">Preferred Language</Label>
                  <Select 
                    value={watchedFields.preferredLanguage} 
                    onValueChange={(value) => setValue('preferredLanguage', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="zh">中文 (Chinese)</SelectItem>
                      <SelectItem value="ms">Melayu (Malay)</SelectItem>
                      <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isReturningPatient"
                  checked={watchedFields.isReturningPatient}
                  onCheckedChange={(checked) => setValue('isReturningPatient', !!checked)}
                />
                <Label htmlFor="isReturningPatient">I am a returning patient</Label>
              </div>

              <div>
                <Label htmlFor="serviceContext">Service Interest (Optional)</Label>
                <Input
                  id="serviceContext"
                  {...register('serviceContext')}
                  placeholder="e.g., General Consultation, Healthier SG, Vaccination"
                />
              </div>

              <div>
                <Label htmlFor="conditionType">Medical Condition (Optional)</Label>
                <Input
                  id="conditionType"
                  {...register('conditionType')}
                  placeholder="Brief description of condition or concern"
                />
              </div>

              <div>
                <Label htmlFor="urgencyOverride">Urgency Level</Label>
                <Select 
                  value={watchedFields.urgencyOverride} 
                  onValueChange={(value) => setValue('urgencyOverride', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low - General inquiry</SelectItem>
                    <SelectItem value="ROUTINE">Routine - Standard care</SelectItem>
                    <SelectItem value="NORMAL">Normal - Regular appointment</SelectItem>
                    <SelectItem value="HIGH">High - Priority attention</SelectItem>
                    <SelectItem value="URGENT">Urgent - Same day needed</SelectItem>
                    <SelectItem value="CRITICAL">Critical - Immediate attention</SelectItem>
                    <SelectItem value="EMERGENCY">Emergency - Life threatening</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 3: Message Details */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Message Details</h3>

              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  {...register('subject')}
                  placeholder="Brief description of your inquiry"
                  className={errors.subject ? 'border-red-500' : ''}
                />
                {errors.subject && (
                  <p className="text-sm text-red-500 mt-1">{errors.subject.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  {...register('message')}
                  placeholder="Please provide detailed information about your inquiry..."
                  rows={6}
                  className={errors.message ? 'border-red-500' : ''}
                />
                {errors.message && (
                  <p className="text-sm text-red-500 mt-1">{errors.message.message}</p>
                )}
                
                {/* Auto-suggestions */}
                {autoSuggestions.length > 0 && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">
                      💡 Suggested FAQ answers:
                    </h4>
                    <div className="space-y-1">
                      {autoSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          className="block text-left text-sm text-blue-700 hover:text-blue-900 underline"
                          onClick={() => setValue('message', suggestion)}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="medicalInformation">Additional Medical Information (Optional)</Label>
                <Textarea
                  id="medicalInformation"
                  {...register('medicalInformation')}
                  placeholder="Any relevant medical history, medications, or current symptoms..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="appointmentType">Appointment Type (Optional)</Label>
                  <Select 
                    value={watchedFields.appointmentType || ''} 
                    onValueChange={(value) => setValue('appointmentType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select appointment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">General Consultation</SelectItem>
                      <SelectItem value="followup">Follow-up Visit</SelectItem>
                      <SelectItem value="vaccination">Vaccination</SelectItem>
                      <SelectItem value="screening">Health Screening</SelectItem>
                      <SelectItem value="healthier_sg">Healthier SG Program</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="preferredResponseTime">Preferred Response Time (hours)</Label>
                  <Input
                    id="preferredResponseTime"
                    type="number"
                    {...register('preferredResponseTime', { valueAsNumber: true })}
                    placeholder="24"
                    min="1"
                    max="168"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Preferences and Consent */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Preferences & Consent</h3>

              {/* Appointment and Follow-up */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="requiresAppointment"
                    checked={watchedFields.requiresAppointment}
                    onCheckedChange={(checked) => setValue('requiresAppointment', !!checked)}
                  />
                  <Label htmlFor="requiresAppointment">I need to schedule an appointment</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="followUpRequired"
                    checked={watchedFields.followUpRequired}
                    onCheckedChange={(checked) => setValue('followUpRequired', !!checked)}
                  />
                  <Label htmlFor="followUpRequired">I would like a follow-up call</Label>
                </div>
              </div>

              {/* Staff Preference */}
              {availableStaff.length > 0 && (
                <div>
                  <Label htmlFor="preferredStaffId">Preferred Staff Member (Optional)</Label>
                  <Select 
                    value={watchedFields.preferredStaffId || ''} 
                    onValueChange={(value) => setValue('preferredStaffId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any available staff" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any available staff</SelectItem>
                      {availableStaff.map((staff) => (
                        <SelectItem key={staff.id} value={staff.id}>
                          {staff.staffName} - {staff.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Consent */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="privacyConsent"
                    checked={watchedFields.privacyConsent}
                    onCheckedChange={(checked) => setValue('privacyConsent', !!checked)}
                    className="mt-1"
                  />
                  <Label htmlFor="privacyConsent" className="text-sm leading-5">
                    I consent to the collection and use of my personal information for the purpose of 
                    responding to my inquiry. I understand that this information will be handled in 
                    accordance with the Personal Data Protection Act (PDPA). *
                  </Label>
                </div>
                {errors.privacyConsent && (
                  <p className="text-sm text-red-500">{errors.privacyConsent.message}</p>
                )}

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="marketingConsent"
                    checked={watchedFields.marketingConsent}
                    onCheckedChange={(checked) => setValue('marketingConsent', !!checked)}
                    className="mt-1"
                  />
                  <Label htmlFor="marketingConsent" className="text-sm leading-5">
                    I would like to receive health tips, clinic updates, and promotional information 
                    from this clinic. (Optional)
                  </Label>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              Previous
            </Button>

            {currentStep < 4 ? (
              <Button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Form
                  </>
                )}
              </Button>
            )}
          </div>
        </form>

        {/* Contact Information */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>24/7 online</span>
            </div>
            <div className="flex items-center gap-1">
              <Mail className="h-4 w-4" />
              <span>Email support</span>
            </div>
            <div className="flex items-center gap-1">
              <Phone className="h-4 w-4" />
              <span>Phone support</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ClinicSpecificContactForm;
