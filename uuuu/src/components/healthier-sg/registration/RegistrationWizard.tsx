import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Save, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { toast } from '@/hooks/use-toast'
import { RegistrationStepPersonalInfo } from './steps/RegistrationStepPersonalInfo'
import { RegistrationStepIdentity } from './steps/RegistrationStepIdentity'
import { RegistrationStepConsent } from './steps/RegistrationStepConsent'
import { RegistrationStepDocuments } from './steps/RegistrationStepDocuments'
import { RegistrationStepGoals } from './steps/RegistrationStepGoals'
import { RegistrationStepReview } from './steps/RegistrationStepReview'
import { RegistrationStepConfirmation } from './steps/RegistrationStepConfirmation'
import type { 
  RegistrationWizardData, 
  RegistrationStep, 
  RegistrationProgress,
  SaveDraftPayload 
} from '../types/registration'

export interface RegistrationWizardProps {
  eligibilityAssessmentId: string
  onComplete: (registrationId: string) => void
  onCancel: () => void
  className?: string
}

const REGISTRATION_STEPS: RegistrationStep[] = [
  {
    id: 'personal-info',
    title: 'Personal Information',
    description: 'Update your personal details',
    required: true,
    stepNumber: 1,
    estimatedMinutes: 5,
  },
  {
    id: 'identity-verification',
    title: 'Identity Verification',
    description: 'Verify your identity using SingPass MyInfo',
    required: true,
    stepNumber: 2,
    estimatedMinutes: 3,
  },
  {
    id: 'digital-consent',
    title: 'Digital Consent',
    description: 'Review and agree to program terms',
    required: true,
    stepNumber: 3,
    estimatedMinutes: 8,
  },
  {
    id: 'document-upload',
    title: 'Document Upload',
    description: 'Upload required documents',
    required: true,
    stepNumber: 4,
    estimatedMinutes: 6,
  },
  {
    id: 'health-goals',
    title: 'Health Goals',
    description: 'Set your health objectives',
    required: false,
    stepNumber: 5,
    estimatedMinutes: 4,
  },
  {
    id: 'review-submit',
    title: 'Review & Submit',
    description: 'Review all information before submission',
    required: true,
    stepNumber: 6,
    estimatedMinutes: 3,
  },
  {
    id: 'confirmation',
    title: 'Confirmation',
    description: 'Registration completed successfully',
    required: true,
    stepNumber: 7,
    estimatedMinutes: 2,
  },
]

export const RegistrationWizard: React.FC<RegistrationWizardProps> = ({
  eligibilityAssessmentId,
  onComplete,
  onCancel,
  className = '',
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [wizardData, setWizardData] = useState<RegistrationWizardData>({
    personalInfo: null,
    identityVerification: null,
    digitalConsent: null,
    documents: [],
    healthGoals: null,
    reviewSubmit: null,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null)

  // Save draft mutation
  const saveDraftMutation = trpc.healthierSg.saveRegistrationDraft.useMutation({
    onSuccess: () => {
      setLastSaveTime(new Date())
      setSaveError(null)
    },
    onError: (error) => {
      setSaveError(error.message)
    },
  })

  // Get registration progress
  const { data: progress } = trpc.healthierSg.getRegistrationProgress.useQuery({
    eligibilityAssessmentId,
  })

  // Submit registration mutation
  const submitMutation = trpc.healthierSg.submitRegistration.useMutation({
    onSuccess: (result) => {
      onComplete(result.registrationId)
      toast({
        title: "Registration Complete",
        description: "Your Healthier SG registration has been submitted successfully.",
      })
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      })
      setIsSubmitting(false)
    },
  })

  // Auto-save functionality
  const debounceSave = useCallback(
    debounce((data: RegistrationWizardData) => {
      saveDraftMutation.mutate({
        eligibilityAssessmentId,
        data,
        stepId: REGISTRATION_STEPS[currentStepIndex].id,
      })
    }, 2000),
    [eligibilityAssessmentId, currentStepIndex, saveDraftMutation]
  )

  // Load draft on mount
  useEffect(() => {
    loadDraft()
  }, [eligibilityAssessmentId])

  // Auto-save on data changes
  useEffect(() => {
    if (wizardData && currentStepIndex < REGISTRATION_STEPS.length - 1) {
      debounceSave(wizardData)
    }
  }, [wizardData, currentStepIndex, debounceSave])

  const loadDraft = async () => {
    // Load existing draft data
    // Implementation would fetch draft data from backend
  }

  const updateWizardData = (stepId: string, data: any) => {
    setWizardData(prev => ({
      ...prev,
      [stepId]: data,
    }))
  }

  const canProceedToStep = (stepIndex: number): boolean => {
    const step = REGISTRATION_STEPS[stepIndex]
    
    // Check if required steps are completed
    if (step.required) {
      const stepData = wizardData[step.id as keyof RegistrationWizardData]
      
      switch (step.id) {
        case 'personal-info':
          return !!stepData?.firstName && !!stepData?.lastName && !!stepData?.phone
        case 'identity-verification':
          return stepData?.verified === true
        case 'digital-consent':
          return stepData?.consentsSigned === true
        case 'document-upload':
          return (wizardData.documents?.length || 0) >= 1 // At least one document
        case 'health-goals':
          return true // Optional step
        case 'review-submit':
          return true // Final validation happens during submission
        default:
          return false
      }
    }
    
    return true
  }

  const goToStep = (stepIndex: number) => {
    // Validate that we can proceed to this step
    if (stepIndex > 0 && !canProceedToStep(stepIndex - 1)) {
      toast({
        title: "Step Required",
        description: "Please complete the previous step before proceeding.",
        variant: "destructive",
      })
      return
    }
    
    setCurrentStepIndex(stepIndex)
  }

  const goToNextStep = () => {
    if (currentStepIndex < REGISTRATION_STEPS.length - 1 && canProceedToStep(currentStepIndex)) {
      setCurrentStepIndex(prev => prev + 1)
    }
  }

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      await submitMutation.mutateAsync({
        eligibilityAssessmentId,
        data: wizardData,
      })
    } catch (error) {
      // Error handled by mutation onError
    }
  }

  const getStepStatus = (stepIndex: number): 'completed' | 'current' | 'pending' | 'error' => {
    if (stepIndex < currentStepIndex) return 'completed'
    if (stepIndex === currentStepIndex) return 'current'
    return 'pending'
  }

  const currentStep = REGISTRATION_STEPS[currentStepIndex]
  const progressPercentage = ((currentStepIndex + 1) / REGISTRATION_STEPS.length) * 100

  const renderCurrentStep = () => {
    switch (currentStep.id) {
      case 'personal-info':
        return (
          <RegistrationStepPersonalInfo
            data={wizardData.personalInfo}
            onUpdate={(data) => updateWizardData('personalInfo', data)}
            onNext={goToNextStep}
            eligibilityAssessmentId={eligibilityAssessmentId}
          />
        )
      case 'identity-verification':
        return (
          <RegistrationStepIdentity
            data={wizardData.identityVerification}
            onUpdate={(data) => updateWizardData('identityVerification', data)}
            onNext={goToNextStep}
            eligibilityAssessmentId={eligibilityAssessmentId}
          />
        )
      case 'digital-consent':
        return (
          <RegistrationStepConsent
            data={wizardData.digitalConsent}
            onUpdate={(data) => updateWizardData('digitalConsent', data)}
            onNext={goToNextStep}
            eligibilityAssessmentId={eligibilityAssessmentId}
          />
        )
      case 'document-upload':
        return (
          <RegistrationStepDocuments
            data={wizardData.documents}
            onUpdate={(data) => updateWizardData('documents', data)}
            onNext={goToNextStep}
            eligibilityAssessmentId={eligibilityAssessmentId}
          />
        )
      case 'health-goals':
        return (
          <RegistrationStepGoals
            data={wizardData.healthGoals}
            onUpdate={(data) => updateWizardData('healthGoals', data)}
            onNext={goToNextStep}
            eligibilityAssessmentId={eligibilityAssessmentId}
          />
        )
      case 'review-submit':
        return (
          <RegistrationStepReview
            data={wizardData}
            onUpdate={updateWizardData}
            onSubmit={handleSubmit}
            onNext={goToNextStep}
            eligibilityAssessmentId={eligibilityAssessmentId}
          />
        )
      case 'confirmation':
        return (
          <RegistrationStepConfirmation
            registrationId={wizardData.reviewSubmit?.registrationId}
            onComplete={() => onComplete(wizardData.reviewSubmit?.registrationId || '')}
            eligibilityAssessmentId={eligibilityAssessmentId}
          />
        )
      default:
        return <div>Step not found</div>
    }
  }

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">Healthier SG Registration</h1>
            <p className="text-gray-600 mt-2">
              Complete your registration to join Singapore's national health program
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">
              {lastSaveTime ? `Last saved: ${lastSaveTime.toLocaleTimeString()}` : 'Not saved yet'}
            </div>
            <Badge variant={saveError ? 'destructive' : 'default'}>
              {saveError ? 'Save Error' : 'Auto-save On'}
            </Badge>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Step {currentStepIndex + 1} of {REGISTRATION_STEPS.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(progressPercentage)}% Complete
            </span>
          </div>
          <Progress value={progressPercentage} className="w-full" />
        </div>

        {/* Save Error Alert */}
        {saveError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Auto-save failed: {saveError}. Please save manually before continuing.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Step Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-2 mb-8">
        {REGISTRATION_STEPS.map((step, index) => {
          const status = getStepStatus(index)
          return (
            <Button
              key={step.id}
              variant={status === 'current' ? 'default' : 'outline'}
              size="sm"
              onClick={() => goToStep(index)}
              disabled={index > currentStepIndex && !canProceedToStep(index - 1)}
              className="flex flex-col items-center p-3 h-auto"
            >
              <div className="flex items-center justify-center mb-1">
                {status === 'completed' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <span className="text-xs font-semibold">{step.stepNumber}</span>
                )}
              </div>
              <span className="text-xs text-center leading-tight">
                {step.title}
              </span>
              <Badge 
                variant={step.required ? 'default' : 'secondary'} 
                className="text-xs mt-1"
              >
                {step.estimatedMinutes}min
              </Badge>
            </Button>
          )
        })}
      </div>

      {/* Current Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {currentStep.title}
          </CardTitle>
          <p className="text-gray-600">{currentStep.description}</p>
        </CardHeader>
        <CardContent className="p-6">
          {renderCurrentStep()}
        </CardContent>
      </Card>

      {/* Navigation Controls */}
      {currentStepIndex < REGISTRATION_STEPS.length - 1 && (
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="outline"
            onClick={goToPreviousStep}
            disabled={currentStepIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onCancel}
            >
              Save & Exit
            </Button>
            
            <Button
              onClick={goToNextStep}
              disabled={!canProceedToStep(currentStepIndex)}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}