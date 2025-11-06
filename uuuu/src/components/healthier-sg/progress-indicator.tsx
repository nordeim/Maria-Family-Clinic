// Healthier SG Progress Indicator
// Visual progress tracking for eligibility assessment

'use client'

import React from 'react'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Circle, Clock, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProgressStep {
  id: string
  title: string
  description?: string
  status: 'completed' | 'current' | 'pending' | 'error'
  isOptional?: boolean
}

interface ProgressIndicatorProps {
  steps: ProgressStep[]
  currentStep: number
  className?: string
  showLabels?: boolean
  orientation?: 'horizontal' | 'vertical'
}

export function ProgressIndicator({
  steps,
  currentStep,
  className,
  showLabels = true,
  orientation = 'horizontal'
}: ProgressIndicatorProps) {
  const completedSteps = steps.filter(step => step.status === 'completed').length
  const totalSteps = steps.length
  const progressPercentage = (completedSteps / totalSteps) * 100

  const getStepIcon = (step: ProgressStep, index: number) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'current':
        return <Clock className="h-5 w-5 text-blue-600 animate-pulse" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return <Circle className="h-5 w-5 text-gray-300" />
    }
  }

  const getStepColor = (step: ProgressStep) => {
    switch (step.status) {
      case 'completed':
        return 'border-green-600 bg-green-50'
      case 'current':
        return 'border-blue-600 bg-blue-50'
      case 'error':
        return 'border-red-600 bg-red-50'
      default:
        return 'border-gray-300 bg-gray-50'
    }
  }

  if (orientation === 'vertical') {
    return (
      <div className={cn('space-y-4', className)}>
        {/* Overall Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span>{completedSteps}/{totalSteps} steps</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-start space-x-3">
              <div className={cn(
                'flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors',
                getStepColor(step)
              )}>
                {getStepIcon(step, index)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className={cn(
                    'text-sm font-medium',
                    step.status === 'current' ? 'text-blue-900' :
                    step.status === 'completed' ? 'text-green-900' :
                    step.status === 'error' ? 'text-red-900' : 'text-gray-500'
                  )}>
                    {step.title}
                  </h4>
                  {step.isOptional && (
                    <Badge variant="outline" className="text-xs">
                      Optional
                    </Badge>
                  )}
                  {step.status === 'error' && (
                    <Badge variant="destructive" className="text-xs">
                      Error
                    </Badge>
                  )}
                </div>
                {step.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Overall Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Assessment Progress</span>
          <span>{completedSteps}/{totalSteps} completed</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Horizontal Step Display */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center space-y-2">
              <div className={cn(
                'w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-200',
                getStepColor(step)
              )}>
                {getStepIcon(step, index)}
              </div>
              {showLabels && (
                <div className="text-center max-w-20">
                  <p className={cn(
                    'text-xs font-medium leading-tight',
                    step.status === 'current' ? 'text-blue-900' :
                    step.status === 'completed' ? 'text-green-900' :
                    step.status === 'error' ? 'text-red-900' : 'text-gray-500'
                  )}>
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-xs text-muted-foreground mt-1 leading-tight">
                      {step.description}
                    </p>
                  )}
                </div>
              )}
            </div>
            
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className={cn(
                'flex-1 h-0.5 mx-2 transition-colors duration-200',
                step.status === 'completed' ? 'bg-green-600' : 'bg-gray-200'
              )} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

// Mobile-optimized progress indicator
export function MobileProgressIndicator(props: ProgressIndicatorProps) {
  return (
    <div className="px-4 py-2 bg-white border-b">
      <ProgressIndicator 
        {...props} 
        orientation="horizontal"
        showLabels={true}
        className="max-w-full"
      />
    </div>
  )
}

// Mini progress indicator for compact spaces
export function MiniProgressIndicator({
  steps,
  currentStep,
  className
}: Omit<ProgressIndicatorProps, 'showLabels' | 'orientation'>) {
  const completedSteps = steps.filter(step => step.status === 'completed').length
  const totalSteps = steps.length
  const progressPercentage = (completedSteps / totalSteps) * 100

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <Progress value={progressPercentage} className="h-1 flex-1" />
      <span className="text-xs text-muted-foreground">
        {completedSteps}/{totalSteps}
      </span>
    </div>
  )
}

// Assessment completion indicator
export function CompletionIndicator({
  isCompleted,
  completedAt,
  totalSteps,
  completedSteps
}: {
  isCompleted: boolean
  completedAt?: Date
  totalSteps: number
  completedSteps: number
}) {
  if (!isCompleted) {
    return (
      <Badge variant="outline" className="text-xs">
        {completedSteps}/{totalSteps} steps
      </Badge>
    )
  }

  return (
    <Badge variant="default" className="text-xs">
      <CheckCircle className="h-3 w-3 mr-1" />
      Completed {completedAt && new Date(completedAt).toLocaleDateString()}
    </Badge>
  )
}