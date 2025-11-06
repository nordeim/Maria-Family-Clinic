import React, { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ContactFormProvider, useContactForm } from './contact-form-provider';
import { ContactFormWizard } from './contact-form-wizard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, 
  Mail, 
  Phone, 
  MessageSquare, 
  Clock, 
  Shield, 
  Info,
  CheckCircle,
  AlertTriangle,
  HelpCircle
} from 'lucide-react';
import { ContactType, contactFormSchema } from '@/lib/validations/contact-form';
import { cn } from '@/lib/utils';

interface ContactFormContainerProps {
  className?: string;
  initialFormType?: ContactType;
  onFormSubmit?: (data: any) => Promise<void>;
  onFormTypeChange?: (type: ContactType) => void;
  showProgress?: boolean;
  compactMode?: boolean;
  autoSaveEnabled?: boolean;
  contextData?: {
    doctorId?: string;
    clinicId?: string;
    serviceId?: string;
    appointmentId?: string;
    userId?: string;
    previousInteractionId?: string;
  };
}

// Reference number generation utility
function generateReferenceNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `MFC-${timestamp}-${random}`;
}

// Mock submission function
async function submitContactForm(data: any) {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Mock successful submission
  const referenceNumber = generateReferenceNumber();
  
  return {
    success: true,
    referenceNumber,
    message: 'Your inquiry has been received and will be processed by our team. We typically respond within 1-2 business days.',
    estimatedResponse: '1-2 business days',
    submittedAt: new Date().toISOString(),
  };
}

function ContactFormContent({ 
  className,
  initialFormType,
  onFormSubmit,
  onFormTypeChange,
  showProgress = true,
  compactMode = false,
  autoSaveEnabled = true,
  contextData = {},
}: ContactFormContainerProps) {
  const { state, setFormType, updateFormData } = useContactForm();
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [submissionResult, setSubmissionResult] = React.useState<any>(null);

  // Form submission mutation
  const formMutation = useMutation({
    mutationFn: onFormSubmit || submitContactForm,
    onSuccess: (result) => {
      setSubmissionResult(result);
      setIsSubmitted(true);
      toast.success('Form submitted successfully!');
    },
    onError: (error) => {
      console.error('Form submission failed:', error);
      toast.error('Failed to submit form. Please try again.');
    },
  });

  // Pre-fill from context data
  useEffect(() => {
    if (contextData) {
      const prefillData: any = {};
      
      if (contextData.doctorId) {
        prefillData.doctorName = `Doctor ${contextData.doctorId}`;
      }
      
      if (contextData.clinicId) {
        prefillData.clinicName = `Clinic ${contextData.clinicId}`;
      }
      
      if (contextData.serviceId) {
        prefillData.serviceType = contextData.serviceId;
      }
      
      if (contextData.appointmentId) {
        prefillData.appointmentId = contextData.appointmentId;
      }
      
      if (Object.keys(prefillData).length > 0) {
        updateFormData(prefillData);
      }
    }
  }, [contextData, updateFormData]);

  // Handle form type change
  const handleFormTypeChange = (type: ContactType) => {
    setFormType(type);
    onFormTypeChange?.(type);
  };

  return (
    <div className={cn('w-full', className)}>
      {!isSubmitted ? (
        <ContactFormWizard
          initialFormType={initialFormType}
          onFormSubmit={formMutation.mutateAsync}
          onFormTypeChange={handleFormTypeChange}
          showProgress={showProgress}
          compactMode={compactMode}
          autoSaveEnabled={autoSaveEnabled}
        />
      ) : (
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center bg-gradient-to-r from-green-50 to-emerald-50 py-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl text-green-800 mb-2">
              Submission Successful!
            </CardTitle>
            <CardDescription className="text-green-700">
              Thank you for contacting My Family Clinic
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {submissionResult && (
              <>
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">Reference Number</p>
                  <Badge variant="outline" className="text-lg px-4 py-2 font-mono">
                    {submissionResult.referenceNumber}
                  </Badge>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    {submissionResult.message}
                  </AlertDescription>
                </Alert>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsSubmitted(false);
                      setSubmissionResult(null);
                    }}
                    className="flex-1"
                  >
                    Submit Another Form
                  </Button>
                  <Button
                    onClick={() => window.location.href = '/'}
                    className="flex-1"
                  >
                    Return to Home
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Quick Contact Form Component (simplified)
interface QuickContactFormProps {
  className?: string;
  variant?: 'compact' | 'full';
  defaultType?: ContactType;
}

export function QuickContactForm({ 
  className, 
  variant = 'full',
  defaultType = 'general'
}: QuickContactFormProps) {
  const [formData, setFormData] = React.useState({
    contactType: defaultType,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    consentGiven: false,
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.message) {
        throw new Error('Please fill in all required fields');
      }
      
      if (!formData.consentGiven) {
        throw new Error('Please provide consent to proceed');
      }

      const result = await submitContactForm(formData);
      alert(`Form submitted successfully! Reference: ${result.referenceNumber}`);
      
      // Reset form
      setFormData({
        contactType: defaultType,
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        consentGiven: false,
      });
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Submission failed'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (variant === 'compact') {
    return (
      <Card className={cn('border-0 shadow-md', className)}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-lg">
            <MessageSquare className="w-5 h-5" />
            <span>Quick Contact</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="How can we help you?"
                className="min-h-[80px]"
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="consentGiven"
                checked={formData.consentGiven}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, consentGiven: checked === true }))}
                required
              />
              <Label htmlFor="consentGiven" className="text-sm">
                I consent to the processing of my data
              </Label>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('border-0 shadow-lg', className)}>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl flex items-center justify-center space-x-2">
          <MessageSquare className="w-6 h-6" />
          <span>Contact Us</span>
        </CardTitle>
        <CardDescription>
          Get in touch with our healthcare team
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Brief description of your inquiry"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Please provide details about your inquiry..."
              className="min-h-[120px]"
              required
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="consentGiven"
                checked={formData.consentGiven}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, consentGiven: checked === true }))}
                required
              />
              <Label htmlFor="consentGiven" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                I consent to the processing of my personal data for the purpose of handling this inquiry *
              </Label>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
            size="lg"
          >
            {isSubmitting ? 'Sending Message...' : 'Send Message'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// Main Contact Form Container Component
export function ContactFormContainer(props: ContactFormContainerProps) {
  return (
    <ContactFormProvider
      initialFormType={props.initialFormType}
      autoSaveEnabled={props.autoSaveEnabled}
      onFormTypeChange={props.onFormTypeChange}
    >
      <ContactFormContent {...props} />
    </ContactFormProvider>
  );
}