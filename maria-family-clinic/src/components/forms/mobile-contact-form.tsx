import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useContactForm } from '../contact-form-provider';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  X, 
  User, 
  Mail, 
  Phone, 
  MessageSquare,
  Upload,
  CheckCircle,
  AlertCircle,
  Star,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileContactFormProps {
  onSubmit: (data: any) => void;
  initialStep?: number;
  className?: string;
  showStepIndicator?: boolean;
  allowSwipe?: boolean;
}

// Mobile-optimized step indicator
function MobileStepIndicator({ currentStep, totalSteps, steps }: {
  currentStep: number;
  totalSteps: number;
  steps: Array<{ id: string; title: string; icon: React.ComponentType<any> }>;
}) {
  return (
    <div className="w-full bg-white border-b border-gray-200 p-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Step {currentStep + 1} of {totalSteps}</span>
          <span className="text-gray-500">{Math.round(((currentStep + 1) / totalSteps) * 100)}%</span>
        </div>
        <Progress value={((currentStep + 1) / totalSteps) * 100} className="h-1" />
        <div className="flex justify-between">
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            const IconComponent = step.icon;
            
            return (
              <div key={step.id} className="flex flex-col items-center space-y-1 flex-1">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center border-2',
                  isCompleted && 'bg-green-500 border-green-500 text-white',
                  isActive && 'bg-blue-500 border-blue-500 text-white',
                  !isActive && !isCompleted && 'bg-gray-100 border-gray-300 text-gray-400'
                )}>
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <IconComponent className="w-4 h-4" />
                  )}
                </div>
                <span className={cn(
                  'text-xs text-center',
                  isActive && 'text-blue-600 font-medium',
                  isCompleted && 'text-green-600',
                  !isActive && !isCompleted && 'text-gray-500'
                )}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Mobile form step wrapper
function MobileFormStep({ 
  children, 
  onNext, 
  onPrev, 
  isFirst, 
  isLast, 
  canProceed = true, 
  nextLabel = 'Continue',
  prevLabel = 'Back',
  compact = false 
}: {
  children: React.ReactNode;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
  canProceed?: boolean;
  nextLabel?: string;
  prevLabel?: string;
  compact?: boolean;
}) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && !isLast && canProceed) {
      onNext();
    }
    if (isRightSwipe && !isFirst) {
      onPrev();
    }
  };

  return (
    <div 
      className="flex flex-col h-full"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="flex-1 p-4 overflow-y-auto">
        {children}
      </div>

      {/* Sticky Navigation */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 space-y-3">
        {/* Validation Summary */}
        {!canProceed && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Please complete required fields</span>
            </div>
          </div>
        )}

        <div className="flex space-x-3">
          {!isFirst && (
            <Button
              type="button"
              variant="outline"
              onClick={onPrev}
              className="flex-1"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              {prevLabel}
            </Button>
          )}
          
          <Button
            type="button"
            onClick={onNext}
            disabled={!canProceed}
            className={cn(
              'flex-1',
              !isFirst && 'flex-[2]'
            )}
          >
            {isLast ? (
              <>
                <Check className="w-4 h-4 mr-1" />
                Submit
              </>
            ) : (
              <>
                {nextLabel}
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Mobile contact information step
function MobileContactInfoStep({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const { register, watch, formState: { errors } } = useFormContext();
  const [firstName, lastName, email, phone] = watch(['firstName', 'lastName', 'email', 'phone']);
  
  const canProceed = firstName && lastName && email && phone && Object.keys(errors).length === 0;

  return (
    <MobileFormStep
      onNext={onNext}
      onPrev={onPrev}
      isFirst={true}
      isLast={false}
      canProceed={!!canProceed}
    >
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold">Contact Information</h2>
          <p className="text-sm text-gray-600">
            Please provide your contact details
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-medium">
                First Name *
              </Label>
              <Input
                id="firstName"
                placeholder="John"
                {...register('firstName')}
                className={errors.firstName ? 'border-red-500' : ''}
              />
              {errors.firstName && (
                <p className="text-xs text-red-600">{errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-medium">
                Last Name *
              </Label>
              <Input
                id="lastName"
                placeholder="Doe"
                {...register('lastName')}
                className={errors.lastName ? 'border-red-500' : ''}
              />
              {errors.lastName && (
                <p className="text-xs text-red-600">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium flex items-center space-x-1">
              <Mail className="w-4 h-4" />
              <span>Email *</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="john.doe@example.com"
              {...register('email')}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium flex items-center space-x-1">
              <Phone className="w-4 h-4" />
              <span>Phone *</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+65 9123 4567"
              {...register('phone')}
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && (
              <p className="text-xs text-red-600">{errors.phone.message}</p>
            )}
          </div>
        </div>
      </div>
    </MobileFormStep>
  );
}

// Mobile message/details step
function MobileMessageStep({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const { state } = useContactForm();
  const { register, watch, formState: { errors } } = useFormContext();
  
  const [subject, message] = watch(['subject', 'message']);
  const canProceed = subject && message && Object.keys(errors).length === 0;

  return (
    <MobileFormStep
      onNext={onNext}
      onPrev={onPrev}
      isFirst={false}
      isLast={false}
      canProceed={!!canProceed}
    >
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold">Your Message</h2>
          <p className="text-sm text-gray-600">
            Tell us how we can help you
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-sm font-medium">
              Subject *
            </Label>
            <Input
              id="subject"
              placeholder="Brief description of your inquiry"
              {...register('subject')}
              className={errors.subject ? 'border-red-500' : ''}
            />
            {errors.subject && (
              <p className="text-xs text-red-600">{errors.subject.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium flex items-center space-x-1">
              <MessageSquare className="w-4 h-4" />
              <span>Message *</span>
            </Label>
            <Textarea
              id="message"
              placeholder="Please provide details about your inquiry..."
              className="min-h-[120px] resize-none"
              {...register('message')}
            />
            {errors.message && (
              <p className="text-xs text-red-600">{errors.message.message}</p>
            )}
          </div>

          {state.formType === 'appointment' && (
            <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800">Appointment Request</h3>
              <p className="text-xs text-blue-600">
                This is an appointment request. Our team will contact you to schedule a convenient time.
              </p>
            </div>
          )}
        </div>
      </div>
    </MobileFormStep>
  );
}

// Mobile consent and submit step
function MobileConsentStep({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const { watch, setValue } = useFormContext();
  const [consentGiven, privacyAcknowledged] = watch(['consentGiven', 'privacyAcknowledged']);
  
  const canProceed = consentGiven && privacyAcknowledged;

  return (
    <MobileFormStep
      onNext={onNext}
      onPrev={onPrev}
      isFirst={false}
      isLast={true}
      canProceed={!!canProceed}
      nextLabel="Submit"
    >
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold">Confirm & Submit</h2>
          <p className="text-sm text-gray-600">
            Please review and confirm your submission
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Ready to Submit</span>
            </div>
            <p className="text-sm text-green-600 mt-1">
              Your message will be sent to our healthcare team
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="consentGiven"
                checked={consentGiven}
                onCheckedChange={(checked) => setValue('consentGiven', checked === true)}
                className="mt-1"
              />
              <div className="space-y-1">
                <Label htmlFor="consentGiven" className="text-sm font-medium leading-none">
                  Data Processing Consent *
                </Label>
                <p className="text-xs text-gray-600">
                  I consent to the processing of my personal data for handling this inquiry.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="privacyAcknowledged"
                checked={privacyAcknowledged}
                onCheckedChange={(checked) => setValue('privacyAcknowledged', checked === true)}
                className="mt-1"
              />
              <div className="space-y-1">
                <Label htmlFor="privacyAcknowledged" className="text-sm font-medium leading-none">
                  Privacy Policy *
                </Label>
                <p className="text-xs text-gray-600">
                  I acknowledge the{' '}
                  <a href="/privacy" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>Expected response: 1-2 business days</p>
          </div>
        </div>
      </div>
    </MobileFormStep>
  );
}

export function MobileContactForm({ 
  onSubmit, 
  initialStep = 0, 
  className,
  showStepIndicator = true,
  allowSwipe = true 
}: MobileContactFormProps) {
  const { state, nextStep, prevStep } = useContactForm();
  const [currentStep, setCurrentStep] = useState(initialStep);

  const steps = [
    { id: 'contact', title: 'Contact', icon: User },
    { id: 'message', title: 'Message', icon: MessageSquare },
    { id: 'submit', title: 'Submit', icon: CheckCircle },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      nextStep();
    } else {
      // Submit form
      onSubmit(state.formData);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      prevStep();
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return <MobileContactInfoStep onNext={handleNext} onPrev={handlePrev} />;
      case 1:
        return <MobileMessageStep onNext={handleNext} onPrev={handlePrev} />;
      case 2:
        return <MobileConsentStep onNext={handleNext} onPrev={handlePrev} />;
      default:
        return null;
    }
  };

  return (
    <div className={cn('w-full h-screen flex flex-col bg-gray-50', className)}>
      {/* Step Indicator */}
      {showStepIndicator && (
        <MobileStepIndicator 
          currentStep={currentStep} 
          totalSteps={steps.length} 
          steps={steps} 
        />
      )}

      {/* Form Content */}
      <div className="flex-1 overflow-hidden">
        {renderCurrentStep()}
      </div>
    </div>
  );
}