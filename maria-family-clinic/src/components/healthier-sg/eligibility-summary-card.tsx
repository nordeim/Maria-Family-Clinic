// Healthier SG Eligibility Summary Card
// Compact summary display for integration into other components

'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Calendar, 
  ArrowRight, 
  RefreshCw, 
  FileText,
  MapPin,
  Heart,
  Info
} from 'lucide-react'

import { EligibilityAssessment, EligibilitySummary } from './types'

interface EligibilitySummaryCardProps {
  assessment: EligibilityAssessment
  showActions?: boolean
  onReassess?: () => void
  onFindClinic?: () => void
  onViewDetails?: () => void
  className?: string
}

export function EligibilitySummaryCard({
  assessment,
  showActions = true,
  onReassess,
  onFindClinic,
  onViewDetails,
  className
}: EligibilitySummaryCardProps) {
  const result = assessment.eligibilityResult
  const isEligible = result?.isEligible || false
  const score = result?.score || 0
  const completedDate = assessment.completedAt || assessment.updatedAt

  const getStatusIcon = () => {
    if (!result) return <Clock className="h-5 w-5 text-yellow-600" />
    return isEligible 
      ? <CheckCircle className="h-5 w-5 text-green-600" />
      : <XCircle className="h-5 w-5 text-red-600" />
  }

  const getStatusBadge = () => {
    if (!result) return <Badge variant="outline">In Progress</Badge>
    return isEligible 
      ? <Badge variant="default">Eligible</Badge>
      : <Badge variant="secondary">Not Eligible</Badge>
  }

  const getPriorityActions = () => {
    if (!result) return []
    
    if (isEligible) {
      return [
        {
          title: 'Find Clinic',
          description: 'Locate participating clinics near you',
          action: onFindClinic,
          icon: <MapPin className="h-4 w-4" />,
          primary: true,
        },
        {
          title: 'Learn More',
          description: 'Understand Healthier SG benefits',
          action: onViewDetails,
          icon: <Info className="h-4 w-4" />,
          primary: false,
        }
      ]
    } else {
      return [
        {
          title: 'Reassess',
          description: 'Check eligibility again if circumstances changed',
          action: onReassess,
          icon: <RefreshCw className="h-4 w-4" />,
          primary: true,
        },
        {
          title: 'Appeal',
          description: 'Request manual review of your case',
          action: onViewDetails,
          icon: <FileText className="h-4 w-4" />,
          primary: false,
        }
      ]
    }
  }

  const actions = getPriorityActions()

  return (
    <Card className={`border-l-4 ${isEligible ? 'border-l-green-500' : 'border-l-red-500'} ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <CardTitle className="text-lg">Healthier SG Eligibility</CardTitle>
          </div>
          {getStatusBadge()}
        </div>
        <CardDescription>
          Assessment completed on {new Date(completedDate).toLocaleDateString('en-SG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Score Display */}
        {result && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Eligibility Score</span>
              <span className="font-medium">{Math.round(score)}%</span>
            </div>
            <Progress 
              value={score} 
              className={`h-2 ${isEligible ? '[&>div]:bg-green-600' : '[&>div]:bg-red-600'}`}
            />
            <div className="text-xs text-muted-foreground">
              Confidence: {Math.round(result.confidence * 100)}%
            </div>
          </div>
        )}

        {/* Result Summary */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Result Summary</h4>
          <p className="text-sm text-muted-foreground">
            {result?.reason || 'Assessment in progress'}
          </p>
        </div>

        {/* Key Criteria */}
        {result?.criteria && result.criteria.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Key Criteria</h4>
            <div className="space-y-1">
              {result.criteria.slice(0, 3).map((criterion, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <span className="flex items-center space-x-1">
                    {criterion.passed ? (
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    ) : (
                      <XCircle className="h-3 w-3 text-red-600" />
                    )}
                    <span>{criterion.name}</span>
                  </span>
                  <span className="text-muted-foreground">{criterion.weight}%</span>
                </div>
              ))}
              {result.criteria.length > 3 && (
                <div className="text-xs text-muted-foreground">
                  +{result.criteria.length - 3} more criteria
                </div>
              )}
            </div>
          </div>
        )}

        {/* Next Steps */}
        {result && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Recommended Next Steps</h4>
            <div className="text-sm text-muted-foreground">
              {isEligible ? (
                'You are eligible! Start by finding a participating clinic near you.'
              ) : (
                'Review your eligibility criteria and consider reassessing if circumstances change.'
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {showActions && result && (
          <div className="flex flex-col space-y-2">
            {actions.map((action, index) => (
              <Button
                key={index}
                onClick={action.action}
                variant={action.primary ? 'default' : 'outline'}
                size="sm"
                className="w-full justify-between"
              >
                <div className="flex items-center space-x-2">
                  {action.icon}
                  <span>{action.title}</span>
                </div>
                <ArrowRight className="h-3 w-3" />
              </Button>
            ))}
          </div>
        )}

        {/* Status Information */}
        <div className="pt-2 border-t space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Assessment ID</span>
            <span className="font-mono">{assessment.id.slice(-8)}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Status</span>
            <span className="capitalize">{assessment.status.toLowerCase().replace('_', ' ')}</span>
          </div>
          {assessment.reviewNotes && (
            <div className="text-xs text-muted-foreground mt-2 p-2 bg-gray-50 rounded">
              <strong>Review Notes:</strong> {assessment.reviewNotes}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Compact version for tight spaces
export function CompactEligibilitySummary({
  assessment,
  className
}: Omit<EligibilitySummaryCardProps, 'showActions' | 'onReassess' | 'onFindClinic' | 'onViewDetails'>) {
  const result = assessment.eligibilityResult
  const isEligible = result?.isEligible || false
  const score = result?.score || 0

  return (
    <div className={`flex items-center space-x-3 p-3 border rounded-lg ${className}`}>
      <div className="flex-shrink-0">
        {result ? (
          isEligible ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600" />
          )
        ) : (
          <Clock className="h-5 w-5 text-yellow-600" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm">Healthier SG</h4>
          <Badge variant={isEligible ? 'default' : result ? 'secondary' : 'outline'} className="text-xs">
            {result ? (isEligible ? 'Eligible' : 'Not Eligible') : 'Pending'}
          </Badge>
        </div>
        {result && (
          <div className="mt-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Score</span>
              <span>{Math.round(score)}%</span>
            </div>
            <Progress value={score} className="h-1 mt-1" />
          </div>
        )}
      </div>
      
      <div className="text-xs text-muted-foreground">
        {new Date(assessment.completedAt || assessment.updatedAt).toLocaleDateString()}
      </div>
    </div>
  )
}

// Dashboard widget version
export function DashboardEligibilityWidget({
  assessment,
  onClick,
  className
}: {
  assessment: EligibilityAssessment
  onClick?: () => void
  className?: string
}) {
  const result = assessment.eligibilityResult
  const isEligible = result?.isEligible || false
  const score = result?.score || 0

  return (
    <Card 
      className={`cursor-pointer hover:shadow-md transition-shadow ${className}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium flex items-center">
            <Heart className="h-4 w-4 mr-2 text-green-600" />
            Healthier SG
          </h4>
          <Badge variant={isEligible ? 'default' : result ? 'secondary' : 'outline'} className="text-xs">
            {result ? (isEligible ? 'Eligible' : 'Not Eligible') : 'Pending'}
          </Badge>
        </div>
        
        {result ? (
          <div className="space-y-2">
            <div className="text-2xl font-bold text-center">{Math.round(score)}%</div>
            <Progress value={score} className="h-2" />
            <div className="text-xs text-center text-muted-foreground">
              {isEligible ? 'Ready to enroll!' : 'Review criteria'}
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            <Clock className="h-6 w-6 mx-auto mb-1" />
            <div className="text-sm">Assessment pending</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}