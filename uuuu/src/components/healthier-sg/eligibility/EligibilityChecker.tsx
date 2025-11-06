// Healthier SG Interactive Eligibility Checker System
// Comprehensive, user-friendly eligibility assessment with real-time evaluation

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  User, 
  Heart, 
  Activity, 
  Shield,
  ArrowRight,
  ArrowLeft,
  Save,
  HelpCircle,
  FileText,
  Smartphone,
  Globe
} from 'lucide-react'
import { toast } from '@/lib/notifications/toasts'

import { QuestionCard } from './QuestionCard'
import { ProgressIndicator } from './ProgressIndicator'
import { ResultsDisplay } from './ResultsDisplay'
import { EligibilityHistory } from './EligibilityHistory'
import {
  Question,
  QuestionnaireResponse,
  EligibilityAssessment,
  MobileEligibilityState,
  EligibilityCheckResponse,
  MyInfoData,
  DEFAULT_HEALTHIER_SG_QUESTIONS
} from '../types'

import { api } from '@/lib/trpc/client'

interface EligibilityCheckerProps {
  onComplete?: (assessment: EligibilityAssessment) => void
  onSave?: (responses: QuestionnaireResponse[]) => void
  existingAssessment?: EligibilityAssessment
  myInfoData?: MyInfoData
  enableRealTimeEvaluation?: boolean
  showProgress?: boolean
  enableMultilingual?: boolean
  enableOfflineMode?: boolean
  className?: string
}

export function EligibilityChecker({
  onComplete,
  onSave,
  existingAssessment,
  myInfoData,
  enableRealTimeEvaluation = true,
  showProgress = true,
  enableMultilingual = true,
  enableOfflineMode = true,
  className
}: EligibilityCheckerProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [responses, setResponses] = useState<QuestionnaireResponse[]>([])
  const [mobileState, setMobileState] = useState<MobileEligibilityState>({
    currentStep: 0,
    totalSteps: 0,
    responses: {},
    isValidating: false,
    showValidationErrors: false,
    hasUnsavedChanges: false,
  })
  const [evaluation, setEvaluation] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [language, setLanguage] = useState<'en' | 'zh' | 'ms' | 'ta'>('en')

  // API mutations
  const evaluateEligibilityMutation = api.healthierSg.evaluateEligibility.useMutation()
  const trackAssessmentMutation = api.healthierSg.trackEligibilityAssessment.useMutation()

  // Initialize mobile state and load existing data
  useEffect(() => {
    const totalSteps = 5 // Demographic, Health, Lifestyle, Insurance, Commitment
    setMobileState(prev => ({
      ...prev,
      totalSteps,
    }))
  }, [])

  // Load existing responses
  useEffect(() => {
    if (existingAssessment?.responses) {
      setResponses(existingAssessment.responses)
      
      // Pre-fill mobile state
      const responseMap: Record<string, any> = {}
      existingAssessment.responses.forEach(response => {
        responseMap[response.questionId] = response.value
      })
      
      setMobileState(prev => ({
        ...prev,
        responses: responseMap,
      }))
    }
  }, [existingAssessment])

  // Auto-save functionality
  const debouncedSave = useCallback(
    debounce(async (currentResponses: QuestionnaireResponse[]) => {
      if (onSave && currentResponses.length > 0) {
        setIsAutoSaving(true)
        try {
          await onSave(currentResponses)
          
          // Track save analytics
          trackAssessmentMutation.mutate({
            action: 'PROGRESS',
            deviceType: getDeviceType(),
            browserInfo: navigator.userAgent,
          })
          
        } catch (error) {
          console.error('Auto-save failed:', error)
        } finally {
          setIsAutoSaving(false)
          setMobileState(prev => ({ ...prev, hasUnsavedChanges: false, lastSaved: new Date() }))
        }
      }
    }, 2000),
    [onSave, trackAssessmentMutation]
  )

  // Auto-save responses
  useEffect(() => {
    if (responses.length > 0) {
      setMobileState(prev => ({ ...prev, hasUnsavedChanges: true }))
      debouncedSave(responses)
    }
  }, [responses, debouncedSave])

  // Real-time evaluation
  const evaluateInRealTime = useCallback(async () => {
    if (!enableRealTimeEvaluation || responses.length === 0) return

    try {
      const result = await evaluateEligibilityMutation.mutateAsync({
        responses,
      })
      
      if (result.data) {
        setEvaluation(result.data)
      }
    } catch (error) {
      console.error('Real-time evaluation failed:', error)
      // Don't show error to user for background evaluation
    }
  }, [responses, enableRealTimeEvaluation, evaluateEligibilityMutation])

  useEffect(() => {
    if (enableRealTimeEvaluation && responses.length > 3) { // Start evaluation after some responses
      const timeoutId = setTimeout(evaluateInRealTime, 1000) // Debounce evaluation
      return () => clearTimeout(timeoutId)
    }
  }, [responses, evaluateInRealTime, enableRealTimeEvaluation])

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

    // Track question interaction
    trackAssessmentMutation.mutate({
      action: 'PROGRESS',
      questionId,
      deviceType: getDeviceType(),
      browserInfo: navigator.userAgent,
    })
  }

  const validateCurrentStep = () => {
    const currentQuestions = getCurrentStepQuestions()
    const errors: string[] = []
    
    currentQuestions.forEach(question => {
      const response = responses.find(r => r.questionId === question.id)
      const value = response?.value
      
      if (question.required && (
        value === undefined || 
        value === null || 
        value === '' || 
        (Array.isArray(value) && value.length === 0)
      )) {
        errors.push(`${question.text} is required`)
      }
    })

    return errors
  }

  const getCurrentStepQuestions = (): Question[] => {
    const questionTypes = ['DEMOGRAPHIC', 'HEALTH_STATUS', 'LIFESTYLE', 'INSURANCE', 'COMMITMENT']
    const currentType = questionTypes[currentStep]
    return DEFAULT_HEALTHIER_SG_QUESTIONS.filter(q => q.type === currentType)
  }

  const nextStep = () => {
    const errors = validateCurrentStep()
    if (errors.length > 0) {
      setMobileState(prev => ({ ...prev, showValidationErrors: true }))
      setError('Please complete all required questions before proceeding.')
      return
    }

    if (currentStep < mobileState.totalSteps - 1) {
      setCurrentStep(prev => prev + 1)
      setMobileState(prev => ({ 
        ...prev, 
        currentStep: prev.currentStep + 1,
        showValidationErrors: false,
      }))
      setError(null)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
      setMobileState(prev => ({ ...prev, showValidationErrors: false }))
      setError(null)
    }
  }

  const handleSubmit = async () => {
    const errors = validateCurrentStep()
    if (errors.length > 0) {
      setMobileState(prev => ({ ...prev, showValidationErrors: true }))
      setError('Please complete all required questions before submitting.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Track completion analytics
      trackAssessmentMutation.mutate({
        action: 'COMPLETED',
        assessmentId: existingAssessment?.id,
        deviceType: getDeviceType(),
        browserInfo: navigator.userAgent,
      })

      // Perform final evaluation
      const result = await evaluateEligibilityMutation.mutateAsync({
        responses,
        assessmentId: existingAssessment?.id,
      })

      if (result.success && result.data) {
        const assessment: EligibilityAssessment = {
          id: result.assessmentId || `assessment-${Date.now()}`,
          userId: existingAssessment?.userId,
          myInfoData,
          responses,
          status: 'COMPLETED',
          eligibilityResult: {
            isEligible: result.data.isEligible,
            confidence: result.data.confidence,
            reason: result.data.isEligible 
              ? 'Meets all eligibility criteria for Healthier SG'
              : 'Does not meet required eligibility criteria',
            score: result.data.score,
            criteria: result.data.criteriaResults.map(cr => ({
              name: cr.name,
              passed: cr.passed,
              weight: cr.score,
              description: cr.description,
            })),
          },
          createdAt: existingAssessment?.createdAt || new Date(),
          updatedAt: new Date(),
          completedAt: new Date(),
        }

        setEvaluation(result.data)
        setShowResults(true)

        if (onComplete) {
          await onComplete(assessment)
        }

        toast.success(
          result.data.isEligible 
            ? 'You are eligible for Healthier SG!' 
            : 'Assessment completed',
          result.data.isEligible 
            ? 'Proceed to clinic selection and enrollment.' 
            : 'Please review your results and consider future reassessment.'
        )
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to complete assessment. Please try again.'
      setError(errorMessage)
      toast.error('Assessment Failed', errorMessage)
      
      // Track error analytics
      trackAssessmentMutation.mutate({
        action: 'ABANDONED',
        deviceType: getDeviceType(),
        browserInfo: navigator.userAgent,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'DEMOGRAPHIC': return <User className="h-4 w-4" />
      case 'HEALTH_STATUS': return <Heart className="h-4 w-4" />
      case 'LIFESTYLE': return <Activity className="h-4 w-4" />
      case 'INSURANCE': return <Shield className="h-4 w-4" />
      case 'COMMITMENT': return <CheckCircle className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getDeviceType = (): 'DESKTOP' | 'MOBILE' | 'TABLET' => {
    if (typeof window === 'undefined') return 'DESKTOP'
    const width = window.innerWidth
    if (width < 768) return 'MOBILE'
    if (width < 1024) return 'TABLET'
    return 'DESKTOP'
  }

  // If showing results, render results display
  if (showResults && evaluation) {
    return (
      <ResultsDisplay
        evaluation={evaluation}
        onReset={() => {
          setShowResults(false)
          setCurrentStep(0)
          setResponses([])
          setEvaluation(null)
        }}
        onViewHistory={() => setShowHistory(true)}
        language={language}
        className={className}
      />
    )
  }

  // If showing history, render history component
  if (showHistory) {
    return (
      <EligibilityHistory
        onBack={() => setShowHistory(false)}
        onStartNew={() => {
          setShowHistory(false)
          setCurrentStep(0)
          setResponses([])
          setEvaluation(null)
        }}
        className={className}
      />
    )
  }

  const currentQuestions = getCurrentStepQuestions()
  const stepTypes = ['DEMOGRAPHIC', 'HEALTH_STATUS', 'LIFESTYLE', 'INSURANCE', 'COMMITMENT']
  const currentStepType = stepTypes[currentStep]

  return (
    <div className={`max-w-4xl mx-auto p-4 space-y-6 ${className}`}>
      {/* Header with language and history controls */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <CardTitle className="text-2xl font-bold text-primary">
            Healthier SG Eligibility Checker
          </CardTitle>
          {evaluation && (
            <Badge 
              variant={evaluation.isEligible ? 'default' : 'secondary'}
              className="ml-2"
            >
              Score: {Math.round(evaluation.score)}%
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {enableMultilingual && (
            <div className="flex items-center space-x-1">
              <Globe className="h-4 w-4" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="en">English</option>
                <option value="zh">中文</option>
                <option value="ms">Bahasa Melayu</option>
                <option value="ta">தமிழ்</option>
              </select>
            </div>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHistory(true)}
          >
            <FileText className="h-4 w-4 mr-2" />
            History
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getStepIcon(currentStepType)}
              <div>
                <CardTitle className="text-xl">
                  Step {currentStep + 1}: {getStepTitle(currentStepType, language)}
                </CardTitle>
                <CardDescription>
                  {getStepDescription(currentStepType, language)}
                </CardDescription>
              </div>
            </div>
            
            {isAutoSaving && (
              <Badge variant="outline" className="flex items-center space-x-1">
                <Save className="h-3 w-3" />
                <span>Saving...</span>
              </Badge>
            )}
          </div>
          
          {showProgress && (
            <ProgressIndicator
              currentStep={currentStep}
              totalSteps={mobileState.totalSteps}
              responses={responses}
              className="mt-4"
            />
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Real-time Evaluation Preview */}
          {evaluation && enableRealTimeEvaluation && (
            <Alert className="border-primary/20 bg-primary/5">
              <CheckCircle className="h-4 w-4 text-primary" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium">Current Assessment Status</p>
                  <p>
                    Eligibility Score: {Math.round(evaluation.score)}% 
                    {evaluation.isEligible 
                      ? ' - You appear to be eligible!' 
                      : ' - Additional information may be required.'}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {evaluation.criteriaResults.slice(0, 3).map((criteria: any, index: number) => (
                      <Badge 
                        key={index}
                        variant={criteria.passed ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {criteria.name}
                      </Badge>
                    ))}
                    {evaluation.criteriaResults.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{evaluation.criteriaResults.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Question Cards */}
          <div className="space-y-6">
            {currentQuestions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                value={mobileState.responses[question.id]}
                onChange={(value) => handleResponseChange(question.id, value)}
                showValidationErrors={mobileState.showValidationErrors}
                language={language}
              />
            ))}
          </div>

          {/* Help Tooltip */}
          <div className="flex items-start space-x-2 p-3 bg-muted/50 rounded-lg">
            <HelpCircle className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">Need help?</p>
              <p>
                {getStepHelpText(currentStepType, language)} 
                Contact our support team at 1800-777-9999 or healthiersg@health.gov.sg
              </p>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex items-center space-x-2">
              {/* Mobile Device Indicator */}
              {getDeviceType() === 'MOBILE' && (
                <Badge variant="outline" className="flex items-center space-x-1">
                  <Smartphone className="h-3 w-3" />
                  <span>Mobile</span>
                </Badge>
              )}

              {/* Auto-save Status */}
              {mobileState.lastSaved && !mobileState.hasUnsavedChanges && (
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>Saved</span>
                </div>
              )}

              {currentStep === mobileState.totalSteps - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="min-w-[140px]"
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Complete Assessment
                      <CheckCircle className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              ) : (
                <Button onClick={nextStep}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper functions for multilingual support
function getStepTitle(stepType: string, language: string): string {
  const titles = {
    en: {
      DEMOGRAPHIC: 'Personal Information',
      HEALTH_STATUS: 'Health Status',
      LIFESTYLE: 'Lifestyle & Habits',
      INSURANCE: 'Insurance Coverage',
      COMMITMENT: 'Program Commitment'
    },
    zh: {
      DEMOGRAPHIC: '个人信息',
      HEALTH_STATUS: '健康状况',
      LIFESTYLE: '生活方式',
      INSURANCE: '保险覆盖',
      COMMITMENT: '项目承诺'
    },
    ms: {
      DEMOGRAPHIC: 'Maklumat Peribadi',
      HEALTH_STATUS: 'Status Kesihatan',
      LIFESTYLE: 'Gaya Hidup',
      INSURANCE: 'Liputan Insurans',
      COMMITMENT: 'Komitmen Program'
    },
    ta: {
      DEMOGRAPHIC: 'தனிப்பட்ட தகவல்',
      HEALTH_STATUS: 'உடல்நல நிலை',
      LIFESTYLE: 'வாழ்க்கை முறை',
      INSURANCE: 'காப்பீடு விவரங்கள்',
      COMMITMENT: 'திட்ட அர்ப்பணிப்பு'
    }
  }
  return titles[language]?.[stepType] || titles.en[stepType]
}

function getStepDescription(stepType: string, language: string): string {
  const descriptions = {
    en: {
      DEMOGRAPHIC: 'Basic information about your age and residency status',
      HEALTH_STATUS: 'Information about your current health and medical conditions',
      LIFESTYLE: 'Your daily habits and lifestyle choices',
      INSURANCE: 'Your current health insurance coverage',
      COMMITMENT: 'Your willingness to participate in the Healthier SG program'
    },
    zh: {
      DEMOGRAPHIC: '关于您的年龄和居住身份的基本信息',
      HEALTH_STATUS: '关于您当前健康状况和医疗条件的信息',
      LIFESTYLE: '您的日常习惯和生活方式选择',
      INSURANCE: '您当前的健康保险覆盖',
      COMMITMENT: '您参与健康SG项目的意愿'
    }
  }
  return descriptions[language]?.[stepType] || descriptions.en[stepType]
}

function getStepHelpText(stepType: string, language: string): string {
  const helpTexts = {
    en: {
      DEMOGRAPHIC: 'Your age and citizenship status determine your basic eligibility for Healthier SG.',
      HEALTH_STATUS: 'Your health information helps us provide personalized care recommendations.',
      LIFESTYLE: 'Lifestyle factors can influence your health goals and care plan.',
      INSURANCE: 'Insurance information helps us understand your coverage options.',
      COMMITMENT: 'Your commitment level ensures successful participation in the program.'
    }
  }
  return helpTexts[language]?.[stepType] || helpTexts.en[stepType]
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