import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useContactForm } from '../contact-form-provider';
import { ContactType, CONTACT_TYPES } from '@/lib/validations/contact-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  User, 
  Phone, 
  Mail, 
  MessageSquare, 
  Calendar, 
  FileText, 
  Upload,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Stethoscope,
  CreditCard,
  Star,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormReviewSubmitStepProps {
  onNext: () => void;
  onPrev: () => void;
  compactMode?: boolean;
}

export function FormReviewSubmitStep({ onNext, onPrev, compactMode = false }: FormReviewSubmitStepProps) {
  const { state } = useContactForm();
  const { watch, setValue, formState: { errors } } = useFormContext();
  
  const formData = watch();
  const formType = state.formType as ContactType;

  const handleConsentChange = (field: 'consentGiven' | 'privacyAcknowledged', checked: boolean) => {
    setValue(field, checked, { shouldValidate: true });
  };

  const handleSubmit = () => {
    // Validation for required consent fields
    if (!formData.consentGiven || !formData.privacyAcknowledged) {
      return;
    }
    onNext();
  };

  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'contact': return User;
      case 'details': return MessageSquare;
      case 'attachments': return Upload;
      default: return FileText;
    }
  };

  const renderContactInfo = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-lg">
          <User className="w-5 h-5" />
          <span>Contact Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <User className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{formData.firstName} {formData.lastName}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{formData.email}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{formData.phone}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Preferred Contact</p>
              <p className="font-medium capitalize">{formData.preferredContact}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Preferred Language</p>
            <p className="font-medium capitalize">{formData.preferredLanguage}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderAppointmentDetails = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-lg">
          <Calendar className="w-5 h-5" />
          <span>Appointment Details</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Urgency</p>
              <Badge variant={formData.urgency === 'emergency' ? 'destructive' : 'secondary'}>
                {formData.urgency}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Stethoscope className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Appointment Type</p>
              <p className="font-medium capitalize">{formData.appointmentType?.replace('-', ' ')}</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-start space-x-3">
            <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Symptoms / Reason</p>
              <p className="font-medium">{formData.symptoms}</p>
            </div>
          </div>
        </div>
        
        {(formData.preferredDate || formData.preferredTime) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.preferredDate && (
              <div className="flex items-center space-x-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Preferred Date</p>
                  <p className="font-medium">{new Date(formData.preferredDate).toLocaleDateString()}</p>
                </div>
              </div>
            )}
            
            {formData.preferredTime && (
              <div className="flex items-center space-x-3">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Preferred Time</p>
                  <p className="font-medium capitalize">{formData.preferredTime}</p>
                </div>
              </div>
            )}
          </div>
        )}
        
        {formData.hasInsurance && (
          <div className="flex items-center space-x-3">
            <Shield className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Insurance</p>
              <p className="font-medium">{formData.insuranceProvider || 'Yes'}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderMedicalQuestionDetails = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-lg">
          <Stethoscope className="w-5 h-5" />
          <span>Medical Question Details</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-start space-x-3">
            <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Subject</p>
              <p className="font-medium">{formData.subject}</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-start space-x-3">
            <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Question</p>
              <p className="font-medium">{formData.message}</p>
            </div>
          </div>
        </div>
        
        {formData.questionCategory && (
          <div className="flex items-center space-x-3">
            <Stethoscope className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Category</p>
              <p className="font-medium capitalize">{formData.questionCategory}</p>
            </div>
          </div>
        )}
        
        {formData.hasSymptoms && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
            <p className="text-sm font-medium text-amber-800">Symptom Information</p>
            {formData.symptomDetails && (
              <p className="text-sm text-amber-700">{formData.symptomDetails}</p>
            )}
            {formData.durationOfSymptoms && (
              <p className="text-sm text-amber-700">Duration: {formData.durationOfSymptoms}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderGeneralInquiryDetails = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-lg">
          <MessageSquare className="w-5 h-5" />
          <span>Inquiry Details</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-start space-x-3">
            <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Subject</p>
              <p className="font-medium">{formData.subject}</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-start space-x-3">
            <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Message</p>
              <p className="font-medium">{formData.message}</p>
            </div>
          </div>
        </div>
        
        {formData.isUrgent && (
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <div>
              <p className="text-sm text-muted-foreground">Priority</p>
              <Badge variant="destructive">Urgent</Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderBillingInquiryDetails = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-lg">
          <CreditCard className="w-5 h-5" />
          <span>Billing Details</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-start space-x-3">
            <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Subject</p>
              <p className="font-medium">{formData.subject}</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formData.invoiceNumber && (
            <div className="flex items-center space-x-3">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Invoice Number</p>
                <p className="font-medium">{formData.invoiceNumber}</p>
              </div>
            </div>
          )}
          
          {formData.serviceDate && (
            <div className="flex items-center space-x-3">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Service Date</p>
                <p className="font-medium">{new Date(formData.serviceDate).toLocaleDateString()}</p>
              </div>
            </div>
          )}
        </div>
        
        {formData.paymentMethod && (
          <div className="flex items-center space-x-3">
            <CreditCard className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Payment Method</p>
              <p className="font-medium capitalize">{formData.paymentMethod.replace('-', ' ')}</p>
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <div className="flex items-start space-x-3">
            <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="font-medium">{formData.message}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderFeedbackDetails = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-lg">
          <Star className="w-5 h-5" />
          <span>Feedback Details</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-start space-x-3">
            <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Subject</p>
              <p className="font-medium">{formData.subject}</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formData.feedbackType && (
            <div className="flex items-center space-x-3">
              <Star className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="font-medium capitalize">{formData.feedbackType}</p>
              </div>
            </div>
          )}
          
          {formData.serviceRating && (
            <div className="flex items-center space-x-3">
              <Star className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Rating</p>
                <p className="font-medium">{formData.serviceRating} / 5 stars</p>
              </div>
            </div>
          )}
        </div>
        
        {(formData.clinicName || formData.doctorName) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.clinicName && (
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Clinic</p>
                  <p className="font-medium">{formData.clinicName}</p>
                </div>
              </div>
            )}
            
            {formData.doctorName && (
              <div className="flex items-center space-x-3">
                <User className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Doctor</p>
                  <p className="font-medium">{formData.doctorName}</p>
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="space-y-2">
          <div className="flex items-start space-x-3">
            <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Feedback</p>
              <p className="font-medium">{formData.message}</p>
            </div>
          </div>
        </div>
        
        {formData.wouldRecommend !== undefined && (
          <div className="flex items-center space-x-3">
            <CheckCircle className={`w-4 h-4 ${formData.wouldRecommend ? 'text-green-500' : 'text-gray-400'}`} />
            <div>
              <p className="text-sm text-muted-foreground">Would Recommend</p>
              <p className="font-medium">{formData.wouldRecommend ? 'Yes' : 'No'}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderAttachments = () => {
    if (!formData.attachments || formData.attachments.length === 0) {
      return null;
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Upload className="w-5 h-5" />
            <span>Attachments ({formData.attachments.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {formData.attachments.map((attachment: any, index: number) => (
              <div key={index} className="flex items-center space-x-3 p-2 border rounded">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{attachment.fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {attachment.fileType} • {Math.round(attachment.fileSize / 1024)}KB
                  </p>
                </div>
                {attachment.isMedicalDocument && (
                  <Badge variant="outline" className="text-xs">Medical</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderDetailsByType = () => {
    switch (formType) {
      case 'appointment':
        return renderAppointmentDetails();
      case 'medical':
        return renderMedicalQuestionDetails();
      case 'general':
        return renderGeneralInquiryDetails();
      case 'billing':
        return renderBillingInquiryDetails();
      case 'feedback':
        return renderFeedbackDetails();
      default:
        return null;
    }
  };

  if (compactMode) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Review & Submit</h3>
          <p className="text-sm text-muted-foreground">
            Please review your information before submitting
          </p>
        </div>

        <div className="space-y-4">
          {renderContactInfo()}
          {renderDetailsByType()}
          {renderAttachments()}
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="consentGiven"
              checked={formData.consentGiven || false}
              onCheckedChange={(checked) => handleConsentChange('consentGiven', checked === true)}
            />
            <label htmlFor="consentGiven" className="text-sm">
              I consent to the processing of my personal data for the purpose of handling this inquiry
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="privacyAcknowledged"
              checked={formData.privacyAcknowledged || false}
              onCheckedChange={(checked) => handleConsentChange('privacyAcknowledged', checked === true)}
            />
            <label htmlFor="privacyAcknowledged" className="text-sm">
              I acknowledge that I have read and understood the{' '}
              <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>
            </label>
          </div>
        </div>

        <Button onClick={handleSubmit} className="w-full" disabled={!formData.consentGiven || !formData.privacyAcknowledged}>
          Submit Form
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">
          Review Your Information
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Please review all the information below before submitting your {CONTACT_TYPES[formType]?.label.toLowerCase()}.
        </p>
      </div>

      <div className="space-y-6">
        {renderContactInfo()}
        {renderDetailsByType()}
        {renderAttachments()}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Shield className="w-5 h-5" />
            <span>Consent & Privacy</span>
          </CardTitle>
          <CardDescription>
            Please confirm your consent to proceed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="consentGiven"
                checked={formData.consentGiven || false}
                onCheckedChange={(checked) => handleConsentChange('consentGiven', checked === true)}
                className="mt-1"
              />
              <div className="space-y-1">
                <Label htmlFor="consentGiven" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Data Processing Consent *
                </Label>
                <p className="text-sm text-muted-foreground">
                  I consent to the processing of my personal data for the purpose of handling this inquiry. 
                  My data will be stored securely and used only for the purpose of responding to my request.
                </p>
                {errors.consentGiven && (
                  <p className="text-sm text-red-600">{errors.consentGiven.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="privacyAcknowledged"
                checked={formData.privacyAcknowledged || false}
                onCheckedChange={(checked) => handleConsentChange('privacyAcknowledged', checked === true)}
                className="mt-1"
              />
              <div className="space-y-1">
                <Label htmlFor="privacyAcknowledged" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Privacy Policy Acknowledgment *
                </Label>
                <p className="text-sm text-muted-foreground">
                  I acknowledge that I have read and understood the{' '}
                  <a href="/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                    Privacy Policy
                  </a>{' '}
                  and how my personal data will be handled.
                </p>
                {errors.privacyAcknowledged && (
                  <p className="text-sm text-red-600">{errors.privacyAcknowledged.message}</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          Back to Edit
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={!formData.consentGiven || !formData.privacyAcknowledged} 
          size="lg"
          className="min-w-[150px]"
        >
          Submit Form
        </Button>
      </div>
    </div>
  );
}