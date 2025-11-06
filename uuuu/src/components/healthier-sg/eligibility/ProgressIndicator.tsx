// ProgressIndicator Component for Healthier SG Eligibility Assessment
// Shows assessment progress with visual indicators and completion status

'use client'

import React from 'react'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  User, 
  Heart, 
  Activity, 
  Shield,
  AlertCircle 
} from 'lucide-react'

import { QuestionnaireResponse } from '../types'

interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
  responses: QuestionnaireResponse[]
  className?: string
}

export function ProgressIndicator({
  currentStep,
  totalSteps,
  responses,
  className
}: ProgressIndicatorProps) {
  const steps = [
    {
      id: 1,
      type: 'DEMOGRAPHIC',
      title: 'Personal Information',
      icon: User,
      description: 'Age, citizenship, location',
      questionIds: ['age', 'citizenshipStatus', 'postalCode'],
    },
    {
      id: 2,
      type: 'HEALTH_STATUS',
      title: 'Health Status',
      icon: Heart,
      description: 'Medical conditions, checkups',
      questionIds: ['hasChronicConditions', 'chronicConditionsList', 'lastMedicalCheckup'],
    },
    {
      id: 3,
      type: 'LIFESTYLE',
      title: 'Lifestyle & Habits',
      icon: Activity,
      description: 'Exercise, smoking, diet',
      questionIds: ['smokingStatus', 'exerciseFrequency'],
    },
    {
      id: 4,
      type: 'INSURANCE',
      title: 'Insurance Coverage',
      icon: Shield,
      description: 'Health insurance details',
      questionIds: ['insuranceType'],
    },
    {
      id: 5,
      type: 'COMMITMENT',
      title: 'Program Commitment',
      icon: CheckCircle,
      description: 'Willingness to participate',
      questionIds: ['commitmentLevel', 'consentToScreening'],
    },
  ]

  const progressPercentage = ((currentStep + 1) / totalSteps) * 100

  const getStepStatus = (stepIndex: number) => {
    const step = steps[stepIndex]
    const stepResponses = responses.filter(r => step.questionIds.includes(r.questionId))
    const requiredResponses = step.questionIds.filter(id => {
      // Check if this is a required field based on question
      return ['age', 'citizenshipStatus', 'postalCode', 'hasChronicConditions', 
              'smokingStatus', 'exerciseFrequency', 'insuranceType', 'commitmentLevel', 
              'consentToScreening'].includes(id)
    })
    
    const answeredRequired = stepResponses.filter(r => 
      requiredResponses.includes(r.questionId) && 
      r.value !== null && 
      r.value !== undefined && 
      r.value !== '' &&
      (Array.isArray(r.value) ? r.value.length > 0 : true)
    ).length

    if (stepIndex < currentStep) {
      return answeredRequired === requiredResponses.length ? 'completed' : 'partial'
    } else if (stepIndex === currentStep) {
      return answeredRequired === requiredResponses.length ? 'current-complete' : 'current-incomplete'
    } else {
      return 'upcoming'
    }
  }

  const getStatusIcon = (status: string, IconComponent: any) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'partial':
      case 'current-incomplete':
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      case 'current-complete':
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500'
      case 'partial':
      case 'current-incomplete':
        return 'bg-orange-500'
      case 'current-complete':
        return 'bg-blue-500'
      default:
        return 'bg-muted'
    }
  }

  // Calculate overall completion
  const allRequiredQuestionIds = steps.flatMap(step => step.questionIds)
  const allRequiredResponses = responses.filter(r => allRequiredQuestionIds.includes(r.questionId))
  const totalRequiredAnswers = allRequiredResponses.filter(r => 
    r.value !== null && 
    r.value !== undefined && 
    r.value !== '' &&
    (Array.isArray(r.value) ? r.value.length > 0 : true)
  ).length
  const completionPercentage = (totalRequiredAnswers / allRequiredQuestionIds.length) * 100

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        {/* Overall Progress Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-sm">Assessment Progress</h3>
            <p className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {totalSteps} • {Math.round(progressPercentage)}% complete
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>~5-10 minutes</span>
            </Badge>
            
            {completionPercentage === 100 ? (
              <Badge className="bg-green-500 hover:bg-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Complete
              </Badge>
            ) : completionPercentage > 50 ? (
              <Badge variant="secondary">
                In Progress
              </Badge>
            ) : (
              <Badge variant="outline">
                Getting Started
              </Badge>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress 
            value={completionPercentage} 
            className="h-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{totalRequiredAnswers} of {allRequiredQuestionIds.length} questions answered</span>
            <span>{Math.round(completionPercentage)}% complete</span>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="space-y-3">
          {steps.map((step, index) => {
            const status = getStepStatus(index)
            const IconComponent = step.icon
            
            return (
              <div 
                key={step.id}
                className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                  index === currentStep ? 'bg-primary/10 border border-primary/20' : 
                  status === 'completed' ? 'bg-green-50 border border-green-200' :
                  status === 'partial' ? 'bg-orange-50 border border-orange-200' :
                  'hover:bg-muted/50'
                }`}
              >
                {/* Step Icon */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  index === currentStep ? 'bg-primary text-primary-foreground' :
                  status === 'completed' ? 'bg-green-100 text-green-600' :
                  status === 'partial' ? 'bg-orange-100 text-orange-600' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {getStatusIcon(status, IconComponent)}
                </div>

                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-sm font-medium ${
                      index === currentStep ? 'text-primary' : 
                      status === 'completed' ? 'text-green-700' :
                      status === 'partial' ? 'text-orange-700' :
                      'text-muted-foreground'
                    }`}>
                      {step.title}
                    </h4>
                    
                    <div className="flex items-center space-x-2">
                      {status === 'completed' && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                          Complete
                        </Badge>
                      )}
                      {status === 'partial' && (
                        <Badge variant="outline" className="border-orange-300 text-orange-700 text-xs">
                          Partial
                        </Badge>
                      )}
                      {status === 'current-complete' && (
                        <Badge variant="default" className="bg-blue-500 text-white text-xs">
                          Ready
                        </Badge>
                      )}
                      {index === currentStep && (
                        <Badge variant="outline" className="border-primary text-primary text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-1">
                    {step.description}
                  </p>
                  
                  {/* Progress indicator for current step */}
                  {index === currentStep && (
                    <div className="mt-2">
                      <Progress 
                        value={getStepCompletion(index)} 
                        className="h-1"
                      />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 pt-3 border-t">
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">
              {responses.filter(r => {
                const step = steps.find(s => s.questionIds.includes(r.questionId))
                return step && getStepStatus(steps.indexOf(step)) === 'completed'
              }).length}
            </div>
            <div className="text-xs text-muted-foreground">Completed Steps</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-semibold text-orange-600">
              {responses.filter(r => {
                const step = steps.find(s => s.questionIds.includes(r.questionId))
                return step && ['partial', 'current-incomplete'].includes(getStepStatus(steps.indexOf(step)))
              }).length}
            </div>
            <div className="text-xs text-muted-foreground">In Progress</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-semibold text-muted-foreground">
              {responses.length}
            </div>
            <div className="text-xs text-muted-foreground">Questions Answered</div>
          </div>
        </div>
      </div>
    </Card>
  )
}

// Helper function to calculate completion for a specific step
function getStepCompletion(stepIndex: number): number {
  // This would need access to the responses array
  // For now, return a placeholder - in the full implementation, this would be calculated properly
  return 0
}