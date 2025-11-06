import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useContactForm } from '../contact-form-provider';
import { ContactType } from '@/lib/validations/contact-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Clock, AlertTriangle, CreditCard, FileText, Stethoscope, MessageCircle, Star, Phone, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormDetailsStepProps {
  onNext: () => void;
  onPrev: () => void;
  compactMode?: boolean;
}

export function FormDetailsStep({ onNext, onPrev, compactMode = false }: FormDetailsStepProps) {
  const { state } = useContactForm();
  const { register, watch, setValue, formState: { errors } } = useFormContext();
  
  const formType = state.formType;
  const watchedValues = watch();

  const handleContinue = () => {
    onNext();
  };

  // Render appointment-specific fields
  const renderAppointmentFields = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Appointment Details</span>
          </CardTitle>
          <CardDescription>
            Help us schedule the most appropriate appointment for you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Urgency Level *</span>
              </Label>
              <RadioGroup 
                value={watchedValues.urgency || 'routine'} 
                onValueChange={(value) => setValue('urgency', value)}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="routine" id="routine" />
                  <Label htmlFor="routine" className="text-sm">Routine - Regular checkup or follow-up</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="urgent" id="urgent" />
                  <Label htmlFor="urgent" className="text-sm">Urgent - Need to be seen within 24-48 hours</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="emergency" id="emergency" />
                  <Label htmlFor="emergency" className="text-sm">Emergency - Medical emergency (call 995)</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="appointmentType">Appointment Type *</Label>
              <Select 
                value={watchedValues.appointmentType || ''} 
                onValueChange={(value) => setValue('appointmentType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select appointment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultation">New Consultation</SelectItem>
                  <SelectItem value="follow-up">Follow-up Visit</SelectItem>
                  <SelectItem value="emergency">Emergency Visit</SelectItem>
                  <SelectItem value="health-screening">Health Screening</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="preferredDate">Preferred Date (Optional)</Label>
              <Input
                id="preferredDate"
                type="date"
                {...register('preferredDate')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredTime">Preferred Time</Label>
              <Select 
                value={watchedValues.preferredTime || 'any'} 
                onValueChange={(value) => setValue('preferredTime', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select preferred time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning (8 AM - 12 PM)</SelectItem>
                  <SelectItem value="afternoon">Afternoon (12 PM - 5 PM)</SelectItem>
                  <SelectItem value="evening">Evening (5 PM - 8 PM)</SelectItem>
                  <SelectItem value="any">Any time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="symptoms" className="flex items-center space-x-2">
              <Stethoscope className="w-4 h-4" />
              <span>Symptoms / Reason for Visit *</span>
            </Label>
            <Textarea
              id="symptoms"
              placeholder="Please describe your symptoms, concerns, or reason for the appointment. Include when symptoms started and how they have changed."
              className="min-h-[100px]"
              {...register('symptoms')}
            />
            {errors.symptoms && (
              <p className="text-sm text-red-600">{errors.symptoms.message}</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="hasInsurance"
                checked={watchedValues.hasInsurance || false}
                onCheckedChange={(checked) => setValue('hasInsurance', checked === true)}
              />
              <Label htmlFor="hasInsurance" className="text-sm font-medium">
                I have health insurance
              </Label>
            </div>

            {watchedValues.hasInsurance && (
              <div className="space-y-2">
                <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                <Input
                  id="insuranceProvider"
                  placeholder="e.g., AIA, Great Eastern, NTUC Income"
                  {...register('insuranceProvider')}
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="previousVisits"
                checked={watchedValues.previousVisits || false}
                onCheckedChange={(checked) => setValue('previousVisits', checked === true)}
              />
              <Label htmlFor="previousVisits" className="text-sm font-medium">
                I have visited this clinic before
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Render medical question fields
  const renderMedicalQuestionFields = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Stethoscope className="w-5 h-5" />
            <span>Medical Question Details</span>
          </CardTitle>
          <CardDescription>
            Please provide details about your medical question
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              placeholder="Brief description of your question"
              {...register('subject')}
            />
            {errors.subject && (
              <p className="text-sm text-red-600">{errors.subject.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="questionCategory">Question Category</Label>
              <Select 
                value={watchedValues.questionCategory || ''} 
                onValueChange={(value) => setValue('questionCategory', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medication">Medication</SelectItem>
                  <SelectItem value="treatment">Treatment</SelectItem>
                  <SelectItem value="diagnosis">Diagnosis</SelectItem>
                  <SelectItem value="prevention">Prevention</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="doctorName">Specific Doctor (Optional)</Label>
              <Input
                id="doctorName"
                placeholder="Name of doctor you've seen before"
                {...register('doctorName')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="flex items-center space-x-2">
              <MessageCircle className="w-4 h-4" />
              <span>Your Question *</span>
            </Label>
            <Textarea
              id="message"
              placeholder="Please provide your medical question in detail. Include relevant medical history, current medications, and any specific concerns."
              className="min-h-[120px]"
              {...register('message')}
            />
            {errors.message && (
              <p className="text-sm text-red-600">{errors.message.message}</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="hasSymptoms"
                checked={watchedValues.hasSymptoms || false}
                onCheckedChange={(checked) => setValue('hasSymptoms', checked === true)}
              />
              <Label htmlFor="hasSymptoms" className="text-sm font-medium">
                This question relates to current symptoms
              </Label>
            </div>

            {watchedValues.hasSymptoms && (
              <div className="space-y-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="symptomDetails">Symptom Details</Label>
                  <Textarea
                    id="symptomDetails"
                    placeholder="Describe your symptoms in detail"
                    className="min-h-[80px]"
                    {...register('symptomDetails')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="durationOfSymptoms">Duration of Symptoms</Label>
                    <Input
                      id="durationOfSymptoms"
                      placeholder="e.g., 2 days, 1 week, 3 months"
                      {...register('durationOfSymptoms')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currentMedications">Current Medications</Label>
                    <Textarea
                      id="currentMedications"
                      placeholder="List any medications you're currently taking"
                      className="min-h-[60px]"
                      {...register('currentMedications')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allergies">Allergies</Label>
                  <Textarea
                    id="allergies"
                    placeholder="List any known allergies (medications, foods, etc.)"
                    className="min-h-[60px]"
                    {...register('allergies')}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Render general inquiry fields
  const renderGeneralInquiryFields = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5" />
            <span>General Inquiry Details</span>
          </CardTitle>
          <CardDescription>
            Tell us how we can help you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              placeholder="Brief description of your inquiry"
              {...register('subject')}
            />
            {errors.subject && (
              <p className="text-sm text-red-600">{errors.subject.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="inquiryCategory">Category</Label>
            <Select 
              value={watchedValues.inquiryCategory || ''} 
              onValueChange={(value) => setValue('inquiryCategory', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="service-info">Service Information</SelectItem>
                <SelectItem value="billing">Billing Questions</SelectItem>
                <SelectItem value="appointment-changes">Appointment Changes</SelectItem>
                <SelectItem value="feedback">Feedback</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Your Message *</span>
            </Label>
            <Textarea
              id="message"
              placeholder="Please provide details about your inquiry"
              className="min-h-[120px]"
              {...register('message')}
            />
            {errors.message && (
              <p className="text-sm text-red-600">{errors.message.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="isUrgent"
              checked={watchedValues.isUrgent || false}
              onCheckedChange={(checked) => setValue('isUrgent', checked === true)}
            />
            <Label htmlFor="isUrgent" className="text-sm font-medium">
              This is urgent and needs immediate attention
            </Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Render billing inquiry fields
  const renderBillingInquiryFields = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5" />
            <span>Billing Inquiry Details</span>
          </CardTitle>
          <CardDescription>
            Help us assist you with your billing questions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              placeholder="Brief description of billing issue"
              {...register('subject')}
            />
            {errors.subject && (
              <p className="text-sm text-red-600">{errors.subject.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Invoice/Bill Number (Optional)</Label>
              <Input
                id="invoiceNumber"
                placeholder="e.g., INV-2024-001"
                {...register('invoiceNumber')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceDate">Service Date (Optional)</Label>
              <Input
                id="serviceDate"
                type="date"
                {...register('serviceDate')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select 
                value={watchedValues.paymentMethod || ''} 
                onValueChange={(value) => setValue('paymentMethod', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Credit/Debit Card</SelectItem>
                  <SelectItem value="insurance">Insurance</SelectItem>
                  <SelectItem value="medi-save">MediSave</SelectItem>
                  <SelectItem value="cdg">CDG Voucher</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (SGD) (Optional)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('amount', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Description *</span>
            </Label>
            <Textarea
              id="message"
              placeholder="Please describe your billing question or concern in detail"
              className="min-h-[100px]"
              {...register('message')}
            />
            {errors.message && (
              <p className="text-sm text-red-600">{errors.message.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="hasInsurance"
              checked={watchedValues.hasInsurance || false}
              onCheckedChange={(checked) => setValue('hasInsurance', checked === true)}
            />
            <Label htmlFor="hasInsurance" className="text-sm font-medium">
              This relates to insurance coverage
            </Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Render feedback fields
  const renderFeedbackFields = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="w-5 h-5" />
            <span>Your Feedback</span>
          </CardTitle>
          <CardDescription>
            We value your experience and would love to hear from you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              placeholder="Brief description of your feedback"
              {...register('subject')}
            />
            {errors.subject && (
              <p className="text-sm text-red-600">{errors.subject.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedbackType">Type of Feedback</Label>
            <Select 
              value={watchedValues.feedbackType || ''} 
              onValueChange={(value) => setValue('feedbackType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select feedback type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compliment">Compliment</SelectItem>
                <SelectItem value="suggestion">Suggestion</SelectItem>
                <SelectItem value="complaint">Complaint</SelectItem>
                <SelectItem value="technical-issue">Technical Issue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="serviceRating">Service Rating (Optional)</Label>
            <Select 
              value={watchedValues.serviceRating?.toString() || ''} 
              onValueChange={(value) => setValue('serviceRating', value ? parseInt(value) : undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Rate your experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">⭐ Poor</SelectItem>
                <SelectItem value="2">⭐⭐ Fair</SelectItem>
                <SelectItem value="3">⭐⭐⭐ Good</SelectItem>
                <SelectItem value="4">⭐⭐⭐⭐ Very Good</SelectItem>
                <SelectItem value="5">⭐⭐⭐⭐⭐ Excellent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clinicName">Clinic Name (Optional)</Label>
              <Input
                id="clinicName"
                placeholder="Which clinic did you visit?"
                {...register('clinicName')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="doctorName">Doctor Name (Optional)</Label>
              <Input
                id="doctorName"
                placeholder="Which doctor did you see?"
                {...register('doctorName')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Your Feedback *</span>
            </Label>
            <Textarea
              id="message"
              placeholder="Please share your detailed feedback. What went well? What could we improve?"
              className="min-h-[120px]"
              {...register('message')}
            />
            {errors.message && (
              <p className="text-sm text-red-600">{errors.message.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="wouldRecommend"
              checked={watchedValues.wouldRecommend}
              onCheckedChange={(checked) => setValue('wouldRecommend', checked === true)}
            />
            <Label htmlFor="wouldRecommend" className="text-sm font-medium">
              I would recommend My Family Clinic to others
            </Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Render the appropriate form fields based on contact type
  const renderFormFields = () => {
    switch (formType) {
      case 'appointment':
        return renderAppointmentFields();
      case 'medical':
        return renderMedicalQuestionFields();
      case 'general':
        return renderGeneralInquiryFields();
      case 'billing':
        return renderBillingInquiryFields();
      case 'feedback':
        return renderFeedbackFields();
      default:
        return null;
    }
  };

  if (compactMode) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Details</h3>
          <p className="text-sm text-muted-foreground">
            Please provide the specific details for your inquiry
          </p>
        </div>
        
        {renderFormFields()}
        
        <Button onClick={handleContinue} className="w-full">
          Continue
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">
          Provide Details
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Please provide specific information about your inquiry to help us assist you better.
        </p>
      </div>

      {renderFormFields()}

      <div className="flex justify-end">
        <Button onClick={handleContinue} size="lg">
          Continue to Attachments
        </Button>
      </div>
    </div>
  );
}