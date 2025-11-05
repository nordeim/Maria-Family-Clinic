// ResultsDisplay Component for Healthier SG Eligibility Assessment
// Shows comprehensive eligibility results with breakdown and actionable next steps

'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  ArrowRight,
  RefreshCw,
  FileText,
  Clock,
  Award,
  Target,
  Users,
  Phone,
  Mail,
  Calendar,
  Download,
  Share,
  AlertTriangle,
  Info
} from 'lucide-react'
import { toast } from '@/lib/notifications/toasts'

import { api } from '@/lib/trpc/client'

interface CriteriaResult {
  name: string
  passed: boolean
  score: number
  description: string
  recommendation?: string
}

interface NextStep {
  title: string
  description: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  actionRequired: boolean
}

interface EvaluationResult {
  isEligible: boolean
  confidence: number
  score: number
  criteriaResults: CriteriaResult[]
  nextSteps: NextStep[]
  appealsAvailable?: boolean
  appealDeadline?: Date
}

interface ResultsDisplayProps {
  evaluation: EvaluationResult
  onReset: () => void
  onViewHistory?: () => void
  onStartEnrollment?: () => void
  language?: 'en' | 'zh' | 'ms' | 'ta'
  className?: string
}

export function ResultsDisplay({
  evaluation,
  onReset,
  onViewHistory,
  onStartEnrollment,
  language = 'en',
  className
}: ResultsDisplayProps) {
  const [showDetailedBreakdown, setShowDetailedBreakdown] = useState(false)
  const [isSubmittingAppeal, setIsSubmittingAppeal] = useState(false)
  const [appealReason, setAppealReason] = useState('')
  const [showAppealForm, setShowAppealForm] = useState(false)

  const submitAppealMutation = api.healthierSg.submitAppeal.useMutation()

  const handleShare = async () => {
    const shareData = {
      title: 'Healthier SG Eligibility Assessment Results',
      text: `I scored ${Math.round(evaluation.score)}% on the Healthier SG eligibility assessment. ${
        evaluation.isEligible ? 'I am eligible!' : 'I am not currently eligible.'
      }`,
      url: window.location.href,
    }

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData)
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(
          `${shareData.text}\n\nVisit: ${shareData.url}`
        )
        toast.success('Results copied to clipboard!')
      }
    } catch (error) {
      console.error('Error sharing:', error)
      toast.error('Unable to share results')
    }
  }

  const handleDownloadPDF = async () => {
    // Create a downloadable summary
    const summary = {
      title: 'Healthier SG Eligibility Assessment Results',
      date: new Date().toISOString(),
      overallScore: evaluation.score,
      eligibilityStatus: evaluation.isEligible ? 'Eligible' : 'Not Eligible',
      confidence: evaluation.confidence,
      criteriaBreakdown: evaluation.criteriaResults,
      nextSteps: evaluation.nextSteps,
    }

    // Convert to text format for download
    const textContent = Object.entries(summary)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}:\n${value.map(item => `  • ${item}`).join('\n')}`
        }
        return `${key}: ${value}`
      })
      .join('\n\n')

    const blob = new Blob([textContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `healthier-sg-results-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('Results downloaded successfully!')
  }

  const handleSubmitAppeal = async () => {
    if (!appealReason.trim()) {
      toast.error('Please provide a reason for your appeal')
      return
    }

    setIsSubmittingAppeal(true)

    try {
      await submitAppealMutation.mutateAsync({
        assessmentId: `assessment-${Date.now()}`, // This would come from the actual assessment
        reason: 'OTHER', // This would be determined by form selection
        description: appealReason,
      })

      toast.success('Appeal submitted successfully! You will receive a response within 5-7 business days.')
      setShowAppealForm(false)
      setAppealReason('')
    } catch (error: any) {
      toast.error('Failed to submit appeal. Please try again.')
    } finally {
      setIsSubmittingAppeal(false)
    }
  }

  const getStatusColor = (passed: boolean) => {
    return passed ? 'text-green-600' : 'text-red-600'
  }

  const getStatusIcon = (passed: boolean) => {
    return passed ? (
      <CheckCircle className="h-5 w-5 text-green-600" />
    ) : (
      <XCircle className="h-5 w-5 text-red-600" />
    )
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'LOW':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const passedCriteria = evaluation.criteriaResults.filter(c => c.passed)
  const failedCriteria = evaluation.criteriaResults.filter(c => !c.passed)

  return (
    <div className={`max-w-4xl mx-auto p-4 space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <CardTitle className="text-3xl font-bold">
            Eligibility Assessment Results
          </CardTitle>
          {evaluation.isEligible ? (
            <Award className="h-8 w-8 text-yellow-500" />
          ) : (
            <AlertCircle className="h-8 w-8 text-orange-500" />
          )}
        </div>
        
        <p className="text-muted-foreground">
          Completed on {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Main Result Card */}
      <Card className={`border-2 ${evaluation.isEligible ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
        <CardHeader className="text-center">
          <div className="space-y-4">
            {/* Overall Status */}
            <div>
              {evaluation.isEligible ? (
                <div className="space-y-2">
                  <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
                  <div>
                    <h2 className="text-2xl font-bold text-green-800">Congratulations!</h2>
                    <p className="text-green-700">You are eligible for Healthier SG</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <XCircle className="h-16 w-16 text-red-600 mx-auto" />
                  <div>
                    <h2 className="text-2xl font-bold text-red-800">Not Currently Eligible</h2>
                    <p className="text-red-700">You do not meet the eligibility criteria at this time</p>
                  </div>
                </div>
              )}
            </div>

            {/* Score Display */}
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">{Math.round(evaluation.score)}%</div>
                  <div className="text-sm text-muted-foreground">Overall Score</div>
                </div>
                <Separator orientation="vertical" className="h-12" />
                <div className="text-center">
                  <div className="text-3xl font-bold">{Math.round(evaluation.confidence * 100)}%</div>
                  <div className="text-sm text-muted-foreground">Confidence</div>
                </div>
              </div>
              <Progress 
                value={evaluation.score} 
                className="h-3"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Quick Summary */}
          <Alert className={evaluation.isEligible ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}>
            <Info className="h-4 w-4" />
            <AlertDescription>
              {evaluation.isEligible ? (
                <div className="space-y-2">
                  <p className="font-medium text-green-800">
                    ✓ You meet the requirements for Healthier SG enrollment
                  </p>
                  <p className="text-green-700">
                    You can now proceed to choose a participating clinic and complete your enrollment. 
                    The program provides comprehensive health screening, personalized care plans, 
                    and ongoing support for better health outcomes.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="font-medium text-red-800">
                    Some eligibility criteria were not met
                  </p>
                  <p className="text-red-700">
                    Review the detailed breakdown below to understand which requirements need to be addressed. 
                    You may become eligible in the future as circumstances change.
                  </p>
                </div>
              )}
            </AlertDescription>
          </Alert>

          {/* Next Steps */}
          {evaluation.nextSteps.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <h3 className="text-lg font-semibold">
                  {evaluation.isEligible ? 'Recommended Next Steps' : 'How to Become Eligible'}
                </h3>
              </div>
              
              <div className="grid gap-3">
                {evaluation.nextSteps.map((step, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <Badge className={getPriorityColor(step.priority)}>
                          {step.priority}
                        </Badge>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{step.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                        {step.actionRequired && (
                          <div className="flex items-center space-x-1 mt-2">
                            <Clock className="h-3 w-3 text-orange-500" />
                            <span className="text-xs text-orange-600">Action Required</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Breakdown Toggle */}
          <div className="space-y-4">
            <Button
              variant="outline"
              onClick={() => setShowDetailedBreakdown(!showDetailedBreakdown)}
              className="w-full"
            >
              {showDetailedBreakdown ? 'Hide' : 'Show'} Detailed Criteria Breakdown
              <ArrowRight className={`h-4 w-4 ml-2 transition-transform ${showDetailedBreakdown ? 'rotate-90' : ''}`} />
            </Button>

            {showDetailedBreakdown && (
              <div className="grid gap-4">
                {/* Passed Criteria */}
                {passedCriteria.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span>Criteria Met ({passedCriteria.length})</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {passedCriteria.map((criteria, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(true)}
                            <div>
                              <h4 className="font-medium">{criteria.name}</h4>
                              <p className="text-sm text-muted-foreground">{criteria.description}</p>
                              {criteria.recommendation && (
                                <p className="text-sm text-green-600 mt-1">{criteria.recommendation}</p>
                              )}
                            </div>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            +{criteria.score} pts
                          </Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Failed Criteria */}
                {failedCriteria.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-red-600">
                        <XCircle className="h-5 w-5" />
                        <span>Criteria Not Met ({failedCriteria.length})</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {failedCriteria.map((criteria, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(false)}
                            <div>
                              <h4 className="font-medium">{criteria.name}</h4>
                              <p className="text-sm text-muted-foreground">{criteria.description}</p>
                              {criteria.recommendation && (
                                <p className="text-sm text-red-600 mt-1">{criteria.recommendation}</p>
                              )}
                            </div>
                          </div>
                          <Badge variant="outline" className="border-red-300 text-red-600">
                            {criteria.score} pts
                          </Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t">
            {evaluation.isEligible ? (
              <>
                <Button onClick={onStartEnrollment} className="flex-1 min-w-[200px]">
                  <Users className="h-4 w-4 mr-2" />
                  Find Participating Clinics
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button variant="outline" onClick={handleDownloadPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Results
                </Button>
                <Button variant="outline" onClick={handleShare}>
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={onReset}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retake Assessment
                </Button>
                {evaluation.appealsAvailable && (
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAppealForm(true)}
                    disabled={isSubmittingAppeal}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Submit Appeal
                  </Button>
                )}
                <Button variant="outline" onClick={handleDownloadPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Results
                </Button>
                <Button variant="outline" onClick={handleShare}>
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </>
            )}
            
            {onViewHistory && (
              <Button variant="outline" onClick={onViewHistory}>
                <Clock className="h-4 w-4 mr-2" />
                View History
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Appeal Form Modal */}
      {showAppealForm && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Submit Eligibility Appeal</span>
            </CardTitle>
            <CardDescription>
              If you believe there was an error in your assessment or you have exceptional circumstances, 
              you can submit an appeal for review.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Reason for Appeal</label>
              <textarea
                value={appealReason}
                onChange={(e) => setAppealReason(e.target.value)}
                className="w-full mt-1 p-3 border rounded-lg"
                rows={4}
                placeholder="Please explain why you believe your assessment was incorrect or provide details about exceptional circumstances..."
              />
            </div>
            
            <div className="flex space-x-3">
              <Button 
                onClick={handleSubmitAppeal}
                disabled={isSubmittingAppeal}
                className="flex-1"
              >
                {isSubmittingAppeal ? 'Submitting...' : 'Submit Appeal'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowAppealForm(false)}
                disabled={isSubmittingAppeal}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact Information */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h3 className="font-semibold">Need Help?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">1800-777-9999</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">healthiersg@health.gov.sg</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Our support team is available Monday to Friday, 9 AM to 5 PM
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}