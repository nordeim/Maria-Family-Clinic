// Healthier SG Eligibility Results Display
// Personalized results with detailed explanation and next steps

'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  Download, 
  Share, 
  RefreshCw, 
  Phone, 
  Mail,
  Calendar,
  MapPin,
  FileText,
  Shield,
  Heart,
  Users,
  Clock,
  ArrowRight
} from 'lucide-react'

import { EligibilityAssessment, EligibilityCheckResponse } from './types'

interface EligibilityResultsProps {
  assessment: EligibilityAssessment
  onReassess?: () => void
  onRequestAppeal?: () => void
  onFindClinic?: () => void
  onDownloadReport?: () => void
  onShareResults?: () => void
  className?: string
}

export function EligibilityResults({
  assessment,
  onReassess,
  onRequestAppeal,
  onFindClinic,
  onDownloadReport,
  onShareResults,
  className
}: EligibilityResultsProps) {
  const result = assessment.eligibilityResult
  const isEligible = result?.isEligible || false
  const confidence = result?.confidence || 0
  const score = result?.score || 0

  const getStatusIcon = () => {
    if (isEligible) return <CheckCircle className="h-6 w-6 text-green-600" />
    return <XCircle className="h-6 w-6 text-red-600" />
  }

  const getStatusColor = () => {
    if (isEligible) return 'bg-green-50 border-green-200'
    return 'bg-red-50 border-red-200'
  }

  const getActionButtons = () => {
    const buttons = []

    if (isEligible) {
      buttons.push(
        <Button key="find-clinic" onClick={onFindClinic} className="w-full">
          <MapPin className="h-4 w-4 mr-2" />
          Find Participating Clinic
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      )
    }

    buttons.push(
      <Button key="reassess" variant="outline" onClick={onReassess} className="w-full">
        <RefreshCw className="h-4 w-4 mr-2" />
        Reassess Eligibility
      </Button>
    )

    if (!isEligible) {
      buttons.push(
        <Button key="appeal" variant="outline" onClick={onRequestAppeal} className="w-full">
          <FileText className="h-4 w-4 mr-2" />
          Request Review
        </Button>
      )
    }

    buttons.push(
      <Button key="download" variant="ghost" onClick={onDownloadReport} className="w-full">
        <Download className="h-4 w-4 mr-2" />
        Download Report
      </Button>,
      <Button key="share" variant="ghost" onClick={onShareResults} className="w-full">
        <Share className="h-4 w-4 mr-2" />
        Share Results
      </Button>
    )

    return buttons
  }

  const getNextSteps = () => {
    if (isEligible) {
      return [
        {
          title: 'Choose Your Healthcare Partner',
          description: 'Select a participating clinic near you for your Healthier SG journey',
          priority: 'HIGH' as const,
          icon: <MapPin className="h-5 w-5" />,
        },
        {
          title: 'Schedule Health Screening',
          description: 'Book your comprehensive health assessment appointment',
          priority: 'HIGH' as const,
          icon: <Calendar className="h-5 w-5" />,
        },
        {
          title: 'Prepare Documentation',
          description: 'Gather your ID, insurance details, and medical history',
          priority: 'MEDIUM' as const,
          icon: <FileText className="h-5 w-5" />,
        },
        {
          title: 'Set Health Goals',
          description: 'Think about your personal health objectives for the program',
          priority: 'MEDIUM' as const,
          icon: <Heart className="h-5 w-5" />,
        },
      ]
    }

    return [
      {
        title: 'Review Eligibility Criteria',
        description: 'Understand what factors affect your eligibility for Healthier SG',
        priority: 'HIGH' as const,
        icon: <Info className="h-5 w-5" />,
      },
      {
        title: 'Consider Lifestyle Changes',
        description: 'Explore ways to improve your health profile for future eligibility',
        priority: 'MEDIUM' as const,
        icon: <Heart className="h-5 w-5" />,
      },
      {
        title: 'Contact Support',
        description: 'Reach out to our support team for guidance and clarification',
        priority: 'MEDIUM' as const,
        icon: <Phone className="h-5 w-5" />,
      },
      {
        title: 'Reassess Periodically',
        description: 'Your circumstances may change - reassess eligibility in the future',
        priority: 'LOW' as const,
        icon: <Clock className="h-5 w-5" />,
      },
    ]
  }

  const getCriteriaBreakdown = () => {
    if (!result?.criteria) return []

    return result.criteria.map(criterion => ({
      name: criterion.name,
      passed: criterion.passed,
      weight: criterion.weight,
      description: criterion.description,
      icon: criterion.passed ? (
        <CheckCircle className="h-4 w-4 text-green-600" />
      ) : (
        <XCircle className="h-4 w-4 text-red-600" />
      )
    }))
  }

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* Main Result Card */}
      <Card className={`${getStatusColor()}`}>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <CardTitle className="text-2xl">
            {isEligible ? 'You are eligible for Healthier SG!' : 'Not Currently Eligible'}
          </CardTitle>
          <CardDescription className="text-lg">
            {result?.reason || 'Eligibility assessment completed'}
          </CardDescription>
          
          {/* Score Display */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Eligibility Score</span>
              <span className="font-medium">{Math.round(score)}%</span>
            </div>
            <Progress value={score} className="h-2" />
            <div className="text-xs text-muted-foreground">
              Confidence: {Math.round(confidence * 100)}%
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Quick Summary */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Assessment completed on:</strong> {new Date(assessment.completedAt || assessment.updatedAt).toLocaleDateString()}
              <br />
              <strong>Assessment ID:</strong> {assessment.id}
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {getActionButtons()}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Criteria Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Eligibility Criteria Breakdown
            </CardTitle>
            <CardDescription>
              Detailed analysis of each eligibility requirement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {getCriteriaBreakdown().map((criterion, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg border">
                {criterion.icon}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{criterion.name}</h4>
                    <Badge variant={criterion.passed ? 'default' : 'destructive'}>
                      {criterion.passed ? 'Passed' : 'Not Met'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {criterion.description}
                  </p>
                  <div className="text-xs text-muted-foreground mt-1">
                    Weight: {criterion.weight}%
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ArrowRight className="h-5 w-5 mr-2" />
              Recommended Next Steps
            </CardTitle>
            <CardDescription>
              Action items based on your eligibility status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {getNextSteps().map((step, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg border">
                <div className={`mt-1 ${
                  step.priority === 'HIGH' ? 'text-red-600' :
                  step.priority === 'MEDIUM' ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {step.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{step.title}</h4>
                    <Badge variant={
                      step.priority === 'HIGH' ? 'destructive' :
                      step.priority === 'MEDIUM' ? 'default' : 'secondary'
                    }>
                      {step.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Support Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Need Help?
          </CardTitle>
          <CardDescription>
            Support resources and contact information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-4 border rounded-lg">
              <Phone className="h-8 w-8 text-blue-600" />
              <div>
                <h4 className="font-medium">Call Support</h4>
                <p className="text-sm text-muted-foreground">1800-123-4567</p>
                <p className="text-xs text-muted-foreground">Mon-Fri, 9AM-6PM</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 border rounded-lg">
              <Mail className="h-8 w-8 text-green-600" />
              <div>
                <h4 className="font-medium">Email Support</h4>
                <p className="text-sm text-muted-foreground">healthiersg@support.gov.sg</p>
                <p className="text-xs text-muted-foreground">Response within 24 hours</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 border rounded-lg">
              <FileText className="h-8 w-8 text-purple-600" />
              <div>
                <h4 className="font-medium">FAQs</h4>
                <p className="text-sm text-muted-foreground">Common questions answered</p>
                <p className="text-xs text-muted-foreground">Updated regularly</p>
              </div>
            </div>
          </div>
          
          {!isEligible && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Important Note</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    If you believe this assessment is incorrect or your circumstances have changed, 
                    you can request a manual review or submit an appeal within 30 days.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer Information */}
      <div className="text-center text-sm text-muted-foreground space-y-2">
        <p>
          This assessment is based on your responses and current Healthier SG eligibility criteria.
          Final determination may require additional verification or documentation.
        </p>
        <p>
          Assessment results are valid for 90 days from completion date.
        </p>
      </div>
    </div>
  )
}

// Utility component for mobile-optimized results
export function MobileEligibilityResults(props: EligibilityResultsProps) {
  return (
    <div className="px-4 pb-4">
      {/* Mobile-specific layout with collapsible sections */}
      <div className="space-y-4">
        <div className="sticky top-4 z-10">
          <EligibilityResults {...props} className="max-w-full" />
        </div>
      </div>
    </div>
  )
}