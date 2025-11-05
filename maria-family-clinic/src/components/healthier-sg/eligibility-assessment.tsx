// Healthier SG Main Eligibility Assessment Component
// Orchestrates the entire eligibility checking process

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useSession } from 'next-auth/react'
import { 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  RefreshCw, 
  FileText, 
  User, 
  Clock,
  AlertCircle,
  Shield,
  Heart
} from 'lucide-react'

import { 
  EligibilityAssessment,
  QuestionnaireResponse,
  MyInfoData,
  MobileEligibilityState,
  EligibilityCheckResponse
} from './types'

import { EligibilityQuestionnaire } from './eligibility-questionnaire'
import { EligibilityResults } from './eligibility-results'
import { ProgressIndicator, ProgressStep } from './progress-indicator'
import { EligibilitySummaryCard } from './eligibility-summary-card'

interface EligibilityAssessmentProps {
  initialAssessment?: EligibilityAssessment
  onComplete?: (assessment: EligibilityAssessment) => void
  onSaveProgress?: (responses: QuestionnaireResponse[]) => void
  myInfoData?: MyInfoData
  enableRealTimeEvaluation?: boolean
  showProgress?: boolean
  className?: string
}

export function EligibilityAssessment({
  initialAssessment,
  onComplete,
  onSaveProgress,
  myInfoData,
  enableRealTimeEvaluation = true,
  showProgress = true,
  className
}: EligibilityAssessmentProps) {
  const { data: session } = useSession()
  const [currentStep, setCurrentStep] = useState<'welcome' | 'questionnaire' | 'results'>('welcome')
  const [assessment, setAssessment] = useState<EligibilityAssessment | null>(initialAssessment || null)
  const [responses, setResponses] = useState<QuestionnaireResponse[]>(initialAssessment?.responses || [])
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [evaluation, setEvaluation] = useState<EligibilityCheckResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Get progress steps
  const getProgressSteps = (): ProgressStep[] => {
    const steps: ProgressStep[] = [
      {
        id: 'welcome',
        title: 'Welcome',
        description: 'Introduction to eligibility assessment',
        status: currentStep === 'welcome' ? 'current' : 'completed',
      },
      {
        id: 'questionnaire',
        title: 'Assessment',
        description: 'Complete eligibility questionnaire',
        status: currentStep === 'questionnaire' ? 'current' : 
               currentStep === 'results' ? 'completed' : 'pending',
      },
      {
        id: 'results',
        title: 'Results',
        description: 'View eligibility results and recommendations',
        status: currentStep === 'results' ? 'current' : 'pending',
      }
    ]

    return steps
  }

  // Handle assessment completion
  const handleAssessmentComplete = useCallback(async (completedAssessment: EligibilityAssessment) => {
    setIsEvaluating(true)
    setError(null)

    try {
      // In a real implementation, this would call the tRPC API
      // For now, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate API delay

      const updatedAssessment = {
        ...completedAssessment,
        status: 'COMPLETED' as const,
        completedAt: new Date(),
        eligibilityResult: completedAssessment.eligibilityResult || {
          isEligible: Math.random() > 0.3, // Simulate eligibility
          confidence: 0.85 + Math.random() * 0.15,
          reason: 'Based on provided responses and Healthier SG criteria',
          score: 70 + Math.random() * 30,
          criteria: [
            { name: 'Age Requirement', passed: true, weight: 25, description: 'Meets age criteria' },
            { name: 'Citizenship Status', passed: true, weight: 30, description: 'Valid residency status' },
            { name: 'Health Screening Consent', passed: true, weight: 15, description: 'Consent provided' },
            { name: 'Program Commitment', passed: true, weight: 10, description: 'High commitment level' },
            { name: 'Clinic Accessibility', passed: true, weight: 10, description: 'Participating clinic available' },
          ]
        }
      }

      setAssessment(updatedAssessment)
      setCurrentStep('results')

      if (onComplete) {
        onComplete(updatedAssessment)
      }
    } catch (err) {
      setError('Failed to complete assessment. Please try again.')
      console.error('Assessment completion error:', err)
    } finally {
      setIsEvaluating(false)
    }
  }, [onComplete])

  // Handle progress saving
  const handleSaveProgress = useCallback((savedResponses: QuestionnaireResponse[]) => {
    setResponses(savedResponses)
    if (onSaveProgress) {
      onSaveProgress(savedResponses)
    }
  }, [onSaveProgress])

  // Handle starting new assessment
  const handleStartAssessment = () => {
    setCurrentStep('questionnaire')
    setAssessment(null)
    setResponses([])
    setEvaluation(null)
    setError(null)
  }

  // Handle restarting assessment
  const handleRestartAssessment = () => {
    setCurrentStep('welcome')
    setAssessment(null)
    setResponses([])
    setEvaluation(null)
    setError(null)
  }

  // Handle going back to questionnaire
  const handleBackToQuestionnaire = () => {
    setCurrentStep('questionnaire')
  }

  // Render welcome step
  const renderWelcomeStep = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Heart className="h-16 w-16 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Healthier SG Eligibility Assessment</CardTitle>
          <CardDescription className="text-lg">
            Find out if you're eligible for Singapore's national health program
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <Shield className="h-8 w-8 text-blue-600 mb-2" />
              <h4 className="font-medium mb-1">What is Healthier SG?</h4>
              <p className="text-sm text-muted-foreground">
                A national initiative to help Singapore residents take steps towards better health through comprehensive care and screening.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 mb-2" />
              <h4 className="font-medium mb-1">What You'll Get</h4>
              <p className="text-sm text-muted-foreground">
                Annual health screening, personalized care plans, nutrition guidance, and regular follow-ups.
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium mb-2">Eligibility Requirements</h4>
            <ul className="text-sm space-y-1">
              <li>• Singapore Citizens and Permanent Residents</li>
              <li>• Age 40 and above (or have chronic conditions)</li>
              <li>• Willingness to participate in health program</li>
              <li>• Access to participating clinic</li>
            </ul>
          </div>

          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              This assessment takes approximately 5-10 minutes to complete.
            </AlertDescription>
          </Alert>

          <div className="flex flex-col space-y-3">
            <Button onClick={handleStartAssessment} size="lg" className="w-full">
              Start Eligibility Assessment
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            
            {session && (
              <Button onClick={() => window.open('/healthier-sg/history', '_blank')} variant="outline" size="lg" className="w-full">
                View Previous Assessments
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // Render results step
  const renderResultsStep = () => {
    if (!assessment) return null

    return (
      <div className="space-y-6">
        <EligibilityResults
          assessment={assessment}
          onReassess={handleBackToQuestionnaire}
          onRequestAppeal={() => {
            // Handle appeal request
            window.open('/healthier-sg/appeal', '_blank')
          }}
          onFindClinic={() => {
            // Handle find clinic
            window.open('/clinics?healthier-sg=true', '_blank')
          }}
          onDownloadReport={() => {
            // Handle download report
            console.log('Downloading report...')
          }}
          onShareResults={() => {
            // Handle share results
            if (navigator.share) {
              navigator.share({
                title: 'My Healthier SG Eligibility Results',
                text: `I ${assessment.eligibilityResult?.isEligible ? 'am' : 'am not'} eligible for Healthier SG!`,
                url: window.location.href,
              })
            }
          }}
        />

        <div className="flex justify-center space-x-4">
          <Button onClick={handleRestartAssessment} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Start New Assessment
          </Button>
          <Button onClick={handleBackToQuestionnaire} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Review Answers
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Healthier SG Eligibility Checker</h1>
          <p className="text-gray-600">
            Interactive assessment to determine your eligibility for Singapore's national health program
          </p>
        </div>

        {/* Progress Indicator */}
        {showProgress && currentStep !== 'welcome' && (
          <div className="max-w-4xl mx-auto mb-8">
            <ProgressIndicator
              steps={getProgressSteps()}
              currentStep={0}
              orientation="horizontal"
              showLabels={true}
            />
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="max-w-2xl mx-auto mb-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Step Content */}
        <div className="max-w-6xl mx-auto">
          {currentStep === 'welcome' && renderWelcomeStep()}
          
          {currentStep === 'questionnaire' && (
            <div className="space-y-6">
              <EligibilityQuestionnaire
                existingAssessment={assessment}
                onComplete={handleAssessmentComplete}
                onSave={handleSaveProgress}
                myInfoData={myInfoData}
                enableRealTimeEvaluation={enableRealTimeEvaluation}
                showProgress={showProgress}
              />
              
              {isEvaluating && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-center space-x-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Evaluating your responses...</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          
          {currentStep === 'results' && renderResultsStep()}
        </div>

        {/* Summary Card (when available) */}
        {assessment && assessment.eligibilityResult && (
          <div className="max-w-4xl mx-auto mt-12">
            <Separator className="mb-6" />
            <EligibilitySummaryCard
              assessment={assessment}
              showActions={false}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// Mobile-optimized version
export function MobileEligibilityAssessment(props: EligibilityAssessmentProps) {
  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 py-6">
        <EligibilityAssessment {...props} className="min-h-0 bg-transparent" />
      </div>
    </div>
  )
}