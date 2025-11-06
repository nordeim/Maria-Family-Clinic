// Healthier SG Interactive Eligibility Questionnaire
// Progressive, dynamic questionnaire with real-time evaluation

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  User, 
  Heart, 
  Activity, 
  FileText, 
  Shield,
  ArrowRight,
  ArrowLeft,
  Save
} from 'lucide-react'

import { 
  Question, 
  QuestionnaireResponse, 
  EligibilityAssessment,
  QuestionType,
  EligibilityRuleEngine,
  DEFAULT_HEALTHIER_SG_RULES,
  PROGRESSIVE_DISCLOSURE_RULES,
  DEFAULT_RULE_ENGINE_CONFIG,
  MobileEligibilityState,
  MobileEligibilityStateSchema
} from './types'

import { EligibilityRuleEngine as RuleEngineClass } from './eligibility-rule-engine'

const QUESTIONS: Question[] = [
  // Demographic Questions
  {
    id: 'age',
    type: 'DEMOGRAPHIC',
    text: 'What is your age?',
    description: 'Age is a key factor in Healthier SG eligibility',
    required: true,
    inputType: 'number',
    validation: { minAge: 18, maxAge: 120 },
    options: [],
  },
  {
    id: 'citizenshipStatus',
    type: 'DEMOGRAPHIC',
    text: 'What is your citizenship status?',
    description: 'Healthier SG is available to Singapore Citizens and Permanent Residents',
    required: true,
    inputType: 'select',
    options: [
      { value: 'CITIZEN', label: 'Singapore Citizen', eligible: true },
      { value: 'PR', label: 'Permanent Resident', eligible: true },
      { value: 'FOREIGNER', label: 'Foreigner/Work Pass Holder', eligible: false },
    ],
  },
  {
    id: 'postalCode',
    type: 'DEMOGRAPHIC',
    text: 'What is your postal code?',
    description: 'This helps us find participating clinics near you',
    required: true,
    inputType: 'text',
  },

  // Health Status Questions
  {
    id: 'hasChronicConditions',
    type: 'HEALTH_STATUS',
    text: 'Do you have any chronic conditions?',
    description: 'Chronic conditions include diabetes, hypertension, heart disease, etc.',
    required: true,
    inputType: 'boolean',
    options: [
      { value: 'true', label: 'Yes', eligible: true },
      { value: 'false', label: 'No', eligible: false },
    ],
  },
  {
    id: 'chronicConditionsList',
    type: 'HEALTH_STATUS',
    text: 'Which chronic conditions do you have?',
    description: 'Select all that apply',
    required: false,
    inputType: 'multiselect',
    options: [
      { value: 'DIABETES', label: 'Diabetes' },
      { value: 'HYPERTENSION', label: 'High Blood Pressure' },
      { value: 'HEART_DISEASE', label: 'Heart Disease' },
      { value: 'ASTHMA', label: 'Asthma' },
      { value: 'KIDNEY_DISEASE', label: 'Kidney Disease' },
      { value: 'CANCER', label: 'Cancer (in remission)' },
      { value: 'MENTAL_HEALTH', label: 'Mental Health Conditions' },
      { value: 'OTHER', label: 'Other' },
    ],
  },
  {
    id: 'lastMedicalCheckup',
    type: 'HEALTH_STATUS',
    text: 'When was your last comprehensive medical checkup?',
    description: 'This helps assess your current health status',
    required: false,
    inputType: 'select',
    options: [
      { value: 'WITHIN_6_MONTHS', label: 'Within the last 6 months' },
      { value: '6_TO_12_MONTHS', label: '6-12 months ago' },
      { value: '1_TO_2_YEARS', label: '1-2 years ago' },
      { value: 'OVER_2_YEARS', label: 'Over 2 years ago' },
      { value: 'NEVER', label: 'Never had a comprehensive checkup' },
    ],
  },

  // Lifestyle Questions
  {
    id: 'smokingStatus',
    type: 'LIFESTYLE',
    text: 'What is your smoking status?',
    description: 'Smoking history affects your health profile',
    required: true,
    inputType: 'select',
    options: [
      { value: 'NEVER', label: 'Never smoked' },
      { value: 'FORMER', label: 'Former smoker' },
      { value: 'CURRENT', label: 'Current smoker' },
    ],
  },
  {
    id: 'exerciseFrequency',
    type: 'LIFESTYLE',
    text: 'How often do you exercise?',
    description: 'Regular physical activity is important for health',
    required: true,
    inputType: 'select',
    options: [
      { value: 'DAILY', label: 'Daily' },
      { value: 'SEVERAL_TIMES_WEEK', label: 'Several times a week' },
      { value: 'ONCE_WEEK', label: 'Once a week' },
      { value: 'MONTHLY', label: 'Monthly' },
      { value: 'RARELY', label: 'Rarely or never' },
    ],
  },

  // Insurance and Preferences
  {
    id: 'insuranceType',
    type: 'INSURANCE',
    text: 'What type of health insurance do you have?',
    description: 'This helps us understand your healthcare coverage',
    required: true,
    inputType: 'select',
    options: [
      { value: 'MEDISAVE', label: 'Medisave/Medishield' },
      { value: 'PRIVATE', label: 'Private Insurance' },
      { value: 'EMPLOYER', label: 'Employer Health Benefits' },
      { value: 'NONE', label: 'No health insurance' },
    ],
  },

  // Commitment Questions
  {
    id: 'commitmentLevel',
    type: 'COMMITMENT',
    text: 'How committed are you to improving your health?',
    description: 'Healthier SG requires active participation',
    required: true,
    inputType: 'select',
    options: [
      { value: 'HIGH', label: 'Very committed - ready to make changes' },
      { value: 'MODERATE', label: 'Moderately committed - willing to try' },
      { value: 'LOW', label: 'Not very committed' },
    ],
  },
  {
    id: 'consentToScreening',
    type: 'COMMITMENT',
    text: 'Do you consent to health screening and data collection?',
    description: 'Required for participation in Healthier SG',
    required: true,
    inputType: 'boolean',
    options: [
      { value: 'true', label: 'Yes, I consent', eligible: true },
      { value: 'false', label: 'No, I do not consent', eligible: false },
    ],
  },
]

interface EligibilityQuestionnaireProps {
  onComplete?: (assessment: EligibilityAssessment) => void
  onSave?: (responses: QuestionnaireResponse[]) => void
  existingAssessment?: EligibilityAssessment
  myInfoData?: any
  enableRealTimeEvaluation?: boolean
  showProgress?: boolean
  className?: string
}

export function EligibilityQuestionnaire({
  onComplete,
  onSave,
  existingAssessment,
  myInfoData,
  enableRealTimeEvaluation = true,
  showProgress = true,
  className
}: EligibilityQuestionnaireProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [responses, setResponses] = useState<QuestionnaireResponse[]>([])
  const [mobileState, setMobileState] = useState<MobileEligibilityState>({
    currentStep: 0,
    totalSteps: QUESTIONS.length,
    responses: {},
    isValidating: false,
    showValidationErrors: false,
    hasUnsavedChanges: false,
  })
  const [evaluation, setEvaluation] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null)

  // Initialize rule engine
  const ruleEngine = React.useMemo(() => {
    const engine = new RuleEngineClass(DEFAULT_RULE_ENGINE_CONFIG)
    engine.loadRules(DEFAULT_HEALTHIER_SG_RULES, PROGRESSIVE_DISCLOSURE_RULES)
    return engine
  }, [])

  // Initialize form with existing data
  const form = useForm({
    resolver: zodResolver(z.object({
      age: z.number().min(18).max(120),
      citizenshipStatus: z.enum(['CITIZEN', 'PR', 'FOREIGNER']),
      postalCode: z.string().min(6).max(6),
      hasChronicConditions: z.boolean(),
      chronicConditionsList: z.array(z.string()).optional(),
      lastMedicalCheckup: z.string().optional(),
      smokingStatus: z.enum(['NEVER', 'FORMER', 'CURRENT']),
      exerciseFrequency: z.enum(['DAILY', 'SEVERAL_TIMES_WEEK', 'ONCE_WEEK', 'MONTHLY', 'RARELY']),
      insuranceType: z.enum(['MEDISAVE', 'PRIVATE', 'EMPLOYER', 'NONE']),
      commitmentLevel: z.enum(['HIGH', 'MODERATE', 'LOW']),
      consentToScreening: z.boolean(),
    })),
    defaultValues: {
      age: myInfoData?.age || 0,
      citizenshipStatus: myInfoData?.citizenshipStatus || undefined,
      postalCode: myInfoData?.postalCode || '',
      hasChronicConditions: false,
      chronicConditionsList: [],
      lastMedicalCheckup: undefined,
      smokingStatus: 'NEVER',
      exerciseFrequency: 'SEVERAL_TIMES_WEEK',
      insuranceType: 'MEDISAVE',
      commitmentLevel: 'HIGH',
      consentToScreening: false,
    },
  })

  // Load existing responses
  useEffect(() => {
    if (existingAssessment?.responses) {
      setResponses(existingAssessment.responses)
      // Pre-fill form with existing data
      existingAssessment.responses.forEach(response => {
        const question = QUESTIONS.find(q => q.id === response.questionId)
        if (question) {
          form.setValue(response.questionId as any, response.value as any)
        }
      })
    }
  }, [existingAssessment, form])

  // Auto-save functionality
  const debouncedSave = useCallback(
    debounce((currentResponses: QuestionnaireResponse[]) => {
      if (onSave) {
        onSave(currentResponses)
      }
    }, 1000),
    [onSave]
  )

  // Real-time evaluation
  useEffect(() => {
    if (enableRealTimeEvaluation && responses.length > 0) {
      const evaluationResult = ruleEngine.evaluateEligibility(responses)
      setEvaluation(evaluationResult)
    }
  }, [responses, enableRealTimeEvaluation, ruleEngine])

  // Auto-save responses
  useEffect(() => {
    if (responses.length > 0) {
      debouncedSave(responses)
    }
  }, [responses, debouncedSave])

  const handleResponseChange = (questionId: string, value: any) => {
    const newResponse: QuestionnaireResponse = {
      questionId,
      value,
      timestamp: new Date(),
    }

    setResponses(prev => {
      const updated = prev.filter(r => r.questionId !== questionId)
      updated.push(newResponse)
      return updated
    })

    setMobileState(prev => ({
      ...prev,
      responses: { ...prev.responses, [questionId]: value },
      hasUnsavedChanges: true,
    }))

    // Clear auto-save timer and set new one
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer)
    }
    
    const timer = setTimeout(() => {
      setMobileState(prev => ({ ...prev, hasUnsavedChanges: false, lastSaved: new Date() }))
    }, 2000)
    
    setAutoSaveTimer(timer)
  }

  const validateCurrentStep = () => {
    const currentQuestions = getCurrentStepQuestions()
    const errors: string[] = []
    
    currentQuestions.forEach(question => {
      const response = responses.find(r => r.questionId === question.id)
      if (question.required && (!response || response.value === undefined || response.value === '')) {
        errors.push(`${question.text} is required`)
      }
    })

    return errors
  }

  const getCurrentStepQuestions = (): Question[] => {
    // Group questions by type for step-by-step progression
    const questionTypes = [
      'DEMOGRAPHIC',
      'HEALTH_STATUS',
      'LIFESTYLE',
      'INSURANCE',
      'COMMITMENT'
    ]
    
    const currentType = questionTypes[currentStep]
    return QUESTIONS.filter(q => q.type === currentType)
  }

  const nextStep = () => {
    const errors = validateCurrentStep()
    if (errors.length > 0) {
      setMobileState(prev => ({ ...prev, showValidationErrors: true }))
      return
    }

    if (currentStep < getTotalSteps() - 1) {
      setCurrentStep(prev => prev + 1)
      setMobileState(prev => ({ 
        ...prev, 
        currentStep: prev.currentStep + 1,
        showValidationErrors: false 
      }))
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const getTotalSteps = () => {
    return 5 // Demographic, Health, Lifestyle, Insurance, Commitment
  }

  const handleSubmit = async () => {
    const errors = validateCurrentStep()
    if (errors.length > 0) {
      setMobileState(prev => ({ ...prev, showValidationErrors: true }))
      return
    }

    setIsSubmitting(true)

    try {
      // Perform final evaluation
      const finalEvaluation = ruleEngine.evaluateEligibility(responses)
      
      const assessment: EligibilityAssessment = {
        id: existingAssessment?.id || `assessment-${Date.now()}`,
        userId: existingAssessment?.userId,
        myInfoData,
        responses,
        status: 'COMPLETED',
        eligibilityResult: {
          isEligible: finalEvaluation.isEligible,
          confidence: finalEvaluation.confidence,
          reason: finalEvaluation.isEligible 
            ? 'Meets all eligibility criteria for Healthier SG'
            : 'Does not meet required eligibility criteria',
          score: finalEvaluation.score,
          criteria: finalEvaluation.criteria,
        },
        createdAt: existingAssessment?.createdAt || new Date(),
        updatedAt: new Date(),
        completedAt: new Date(),
      }

      if (onComplete) {
        await onComplete(assessment)
      }
    } catch (error) {
      console.error('Error completing assessment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStepIcon = (type: QuestionType) => {
    switch (type) {
      case 'DEMOGRAPHIC': return <User className="h-4 w-4" />
      case 'HEALTH_STATUS': return <Heart className="h-4 w-4" />
      case 'LIFESTYLE': return <Activity className="h-4 w-4" />
      case 'INSURANCE': return <Shield className="h-4 w-4" />
      case 'COMMITMENT': return <CheckCircle className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const renderQuestion = (question: Question) => {
    const currentValue = responses.find(r => r.questionId === question.id)?.value

    switch (question.inputType) {
      case 'number':
        return (
          <FormField
            control={form.control}
            name={question.id as any}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{question.text}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => {
                      field.onChange(parseInt(e.target.value) || 0)
                      handleResponseChange(question.id, parseInt(e.target.value) || 0)
                    }}
                    placeholder="Enter your age"
                  />
                </FormControl>
                {question.description && (
                  <FormDescription>{question.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        )

      case 'select':
        return (
          <FormField
            control={form.control}
            name={question.id as any}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{question.text}</FormLabel>
                <Select onValueChange={(value) => {
                  field.onChange(value)
                  handleResponseChange(question.id, value)
                }} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {question.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {question.description && (
                  <FormDescription>{question.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        )

      case 'boolean':
        return (
          <FormField
            control={form.control}
            name={question.id as any}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{question.text}</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={(value) => {
                      field.onChange(value === 'true')
                      handleResponseChange(question.id, value === 'true')
                    }}
                    defaultValue={field.value ? 'true' : 'false'}
                    className="flex flex-col space-y-2"
                  >
                    {question.options?.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={`${question.id}-${option.value}`} />
                        <FormLabel htmlFor={`${question.id}-${option.value}`}>
                          {option.label}
                        </FormLabel>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
                {question.description && (
                  <FormDescription>{question.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        )

      case 'multiselect':
        return (
          <FormField
            control={form.control}
            name={question.id as any}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{question.text}</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    {question.options?.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${question.id}-${option.value}`}
                          checked={field.value?.includes(option.value)}
                          onCheckedChange={(checked) => {
                            const updated = checked
                              ? [...(field.value || []), option.value]
                              : field.value?.filter((v: string) => v !== option.value) || []
                            field.onChange(updated)
                            handleResponseChange(question.id, updated)
                          }}
                        />
                        <FormLabel htmlFor={`${question.id}-${option.value}`}>
                          {option.label}
                        </FormLabel>
                      </div>
                    ))}
                  </div>
                </FormControl>
                {question.description && (
                  <FormDescription>{question.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        )

      default:
        return (
          <FormField
            control={form.control}
            name={question.id as any}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{question.text}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) => {
                      field.onChange(e.target.value)
                      handleResponseChange(question.id, e.target.value)
                    }}
                  />
                </FormControl>
                {question.description && (
                  <FormDescription>{question.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        )
    }
  }

  const currentQuestions = getCurrentStepQuestions()
  const stepTypes = ['DEMOGRAPHIC', 'HEALTH_STATUS', 'LIFESTYLE', 'INSURANCE', 'COMMITMENT']
  const currentStepType = stepTypes[currentStep]

  return (
    <div className={`max-w-2xl mx-auto p-4 ${className}`}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getStepIcon(currentStepType)}
              <CardTitle>Healthier SG Eligibility Assessment</CardTitle>
            </div>
            {evaluation && (
              <Badge variant={evaluation.isEligible ? 'default' : 'secondary'}>
                Score: {Math.round(evaluation.score)}%
              </Badge>
            )}
          </div>
          {showProgress && (
            <div className="space-y-2">
              <Progress value={(currentStep / getTotalSteps()) * 100} />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Step {currentStep + 1} of {getTotalSteps()}</span>
                <span>{Math.round((currentStep / getTotalSteps()) * 100)}% complete</span>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {currentQuestions.map((question) => (
                <div key={question.id}>
                  {renderQuestion(question)}
                </div>
              ))}

              {mobileState.showValidationErrors && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please complete all required questions before proceeding.
                  </AlertDescription>
                </Alert>
              )}

              {evaluation && enableRealTimeEvaluation && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Current eligibility score: {Math.round(evaluation.score)}%
                    {evaluation.isEligible 
                      ? ' - You appear to be eligible!' 
                      : ' - Additional information may be required.'}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                <div className="flex space-x-2">
                  {mobileState.hasUnsavedChanges && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Saving...
                    </Button>
                  )}

                  {currentStep === getTotalSteps() - 1 ? (
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : 'Complete Assessment'}
                    </Button>
                  ) : (
                    <Button type="button" onClick={nextStep}>
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

// Utility function for debouncing
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => func(...args), wait)
  }
}