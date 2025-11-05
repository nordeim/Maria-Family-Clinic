import React, { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ContactType, contactFormSchema, CONTACT_TYPES } from '@/lib/validations/contact-form';
import { useContactForm } from './contact-form-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Circle, FileText, Upload, User, AlertTriangle, Send } from 'lucide-react';
import { FormContactTypeStep } from './steps/form-contact-type-step';
import { FormBasicInfoStep } from './steps/form-basic-info-step';
import { FormDetailsStep } from './steps/form-details-step';
import { FormAttachmentsStep } from './steps/form-attachments-step';
import { FormReviewSubmitStep } from './steps/form-review-submit-step';
import { FormConfirmationStep } from './steps/form-confirmation-step';
import { FormErrorBoundary } from './form-error-boundary';
import { cn } from '@/lib/utils';

interface ContactFormWizardProps {
  className?: string;
  initialFormType?: ContactType;
  onFormSubmit?: (data: any) => Promise<void>;
  onFormTypeChange?: (type: ContactType) => void;
  showProgress?: boolean;
  compactMode?: boolean;
  autoSaveEnabled?: boolean;
}

// Step configuration
const STEP_CONFIG = [
  {
    id: 'type',
    title: 'Contact Type',
    description: 'What type of inquiry do you have?',
    icon: FileText,
    component: FormContactTypeStep,
    isRequired: true,
  },
  {
    id: 'basic',
    title: 'Basic Information',
    description: 'Your contact details',
    icon: User,
    component: FormBasicInfoStep,
    isRequired: true,
  },
  {
    id: 'details',
    title: 'Details',
    description: 'Provide specific information',
    icon: AlertTriangle,
    component: FormDetailsStep,
    isRequired: true,
  },
  {
    id: 'attachments',
    title: 'Attachments',
    description: 'Upload medical documents (optional)',
    icon: Upload,
    component: FormAttachmentsStep,
    isRequired: false,
  },
  {
    id: 'review',
    title: 'Review & Submit',
    description: 'Review your information',
    icon: CheckCircle,
    component: FormReviewSubmitStep,
    isRequired: true,
  },
] as const;

export function ContactFormWizard({ 
  className,
  initialFormType,
  onFormSubmit,
  onFormTypeChange,
  showProgress = true,
  compactMode = false,
  autoSaveEnabled = true,
}: ContactFormWizardProps) {
  const {
    state,
    setFormType,
    nextStep,
    prevStep,
    updateFormData,
    isFirstStep,
    isLastStep,
    progress,
    nextStepLabel,
  } = useContactForm();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    referenceNumber: string;
    message: string;
    estimatedResponse: string;
  } | null>(null);

  // Form setup
  const form = useForm({
    resolver: zodResolver(contactFormSchema),
    mode: 'onChange',
    defaultValues: state.formData,
  });

  // Update form when state changes
  useEffect(() => {
    form.reset(state.formData);
  }, [state.formData, form]);

  // Get current step component
  const getCurrentStep = () => {
    const currentStepConfig = STEP_CONFIG[state.currentStep];
    if (!currentStepConfig) return null;

    const StepComponent = currentStepConfig.component;
    return (
      <StepComponent
        form={form}
        onNext={handleNext}
        onPrev={handlePrev}
        compactMode={compactMode}
      />
    );
  };

  const handleNext = async () => {
    // Validate current step before proceeding
    const currentStepConfig = STEP_CONFIG[state.currentStep];
    if (currentStepConfig?.isRequired) {
      const isValid = await form.trigger();
      if (!isValid) {
        return;
      }
    }

    nextStep();
    form.trigger(); // Validate next step
  };

  const handlePrev = () => {
    prevStep();
  };

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // Call onFormSubmit if provided
      if (onFormSubmit) {
        await onFormSubmit(data);
      } else {
        // Default submission logic
        const response = await fetch('/api/contact/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        
        if (!response.ok) {
          throw new Error('Failed to submit form');
        }
        
        const result = await response.json();
        setSubmissionResult(result);
      }
      
      setIsSubmitted(true);
    } catch (error) {
      console.error('Form submission failed:', error);
      // Handle submission error
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle confirmation step
  if (isSubmitted && submissionResult) {
    return (
      <div className={cn('w-full max-w-2xl mx-auto', className)}>
        <FormConfirmationStep
          result={submissionResult}
          onStartNew={() => {
            setIsSubmitted(false);
            setSubmissionResult(null);
            setFormType(initialFormType || 'general');
          }}
        />
      </div>
    );
  }

  const currentStepConfig = STEP_CONFIG[state.currentStep];
  const StepIcon = currentStepConfig?.icon || Circle;

  return (
    <FormErrorBoundary>
      <div className={cn('w-full max-w-4xl mx-auto', className)}>
        <Card className="border-0 shadow-lg">
          {/* Header */}
          <CardHeader className={cn(
            'bg-gradient-to-r from-blue-50 to-indigo-50',
            compactMode && 'py-4'
          )}>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className={cn('text-2xl', compactMode && 'text-xl')}>
                  Contact Us
                </CardTitle>
                <CardDescription className={cn('text-base', compactMode && 'text-sm')}>
                  We're here to help with your healthcare needs
                </CardDescription>
              </div>
              {state.formType && (
                <Badge variant="secondary" className="text-sm">
                  {CONTACT_TYPES[state.formType].label}
                </Badge>
              )}
            </div>

            {/* Progress Bar */}
            {showProgress && state.totalSteps > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    Step {state.currentStep + 1} of {state.totalSteps}
                  </span>
                  <span>{Math.round(progress)}% complete</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </CardHeader>

          {/* Step Navigation */}
          {showProgress && !compactMode && (
            <div className="px-6 py-4 border-b bg-gray-50/50">
              <nav className="flex items-center space-x-2 overflow-x-auto">
                {STEP_CONFIG.map((step, index) => {
                  const isActive = index === state.currentStep;
                  const isCompleted = index < state.currentStep;
                  const StepComponent = step.icon;

                  return (
                    <div
                      key={step.id}
                      className={cn(
                        'flex items-center space-x-2 px-3 py-2 rounded-lg whitespace-nowrap transition-colors',
                        isActive && 'bg-blue-100 text-blue-700',
                        isCompleted && 'bg-green-100 text-green-700',
                        !isActive && !isCompleted && 'text-muted-foreground'
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <StepComponent className="w-4 h-4" />
                      )}
                      <span className="text-sm font-medium">{step.title}</span>
                    </div>
                  );
                })}
              </nav>
            </div>
          )}

          <CardContent className={cn(
            'p-6',
            compactMode && 'p-4'
          )}>
            <FormProvider {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                {/* Current Step */}
                <div className="min-h-[400px]">
                  {getCurrentStep()}
                </div>

                <Separator />

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {!isFirstStep && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handlePrev}
                        disabled={isSubmitting}
                      >
                        Previous
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* Auto-save indicator */}
                    {autoSaveEnabled && state.lastSaved && (
                      <div className="text-xs text-muted-foreground flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>Auto-saved {state.lastSaved.toLocaleTimeString()}</span>
                      </div>
                    )}

                    {/* Submit Button */}
                    {isLastStep ? (
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="min-w-[120px]"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Submitting...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Send className="w-4 h-4" />
                            <span>Submit Form</span>
                          </div>
                        )}
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={handleNext}
                        disabled={isSubmitting}
                        className="min-w-[100px]"
                      >
                        {nextStepLabel}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Form Errors */}
                {Object.keys(state.errors).length > 0 && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2 text-red-700">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="font-medium">Please fix the following errors:</span>
                    </div>
                    <ul className="mt-2 text-sm text-red-600 list-disc list-inside">
                      {Object.entries(state.errors).map(([field, error]) => (
                        <li key={field}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Help Text */}
                {!compactMode && (
                  <div className="text-center text-sm text-muted-foreground">
                    <p>
                      Need help? Call us at{' '}
                      <a href="tel:+6561234567" className="text-blue-600 hover:underline">
                        +65 6123 4567
                      </a>{' '}
                      or email{' '}
                      <a href="mailto:help@myfamilyclinic.sg" className="text-blue-600 hover:underline">
                        help@myfamilyclinic.sg
                      </a>
                    </p>
                  </div>
                )}
              </form>
            </FormProvider>
          </CardContent>
        </Card>
      </div>
    </FormErrorBoundary>
  );
}

export default ContactFormWizard;