// Healthier SG Eligibility Appeal and Manual Review System
// Handles appeals, manual reviews, and exceptional circumstances

'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  FileText, 
  AlertTriangle, 
  Send, 
  Upload, 
  Clock, 
  CheckCircle, 
  XCircle,
  User,
  Calendar,
  Phone,
  Mail,
  Info,
  AlertCircle,
  HelpCircle
} from 'lucide-react'

import { Appeal, EligibilityAssessment } from './types'

const appealFormSchema = z.object({
  appealReason: z.enum([
    'INCORRECT_INFORMATION',
    'MISSING_DOCUMENTATION',
    'EXCEPTIONAL_CIRCUMSTANCES',
    'POLICY_CLARIFICATION',
    'OTHER'
  ]),
  description: z.string().min(10, 'Please provide a detailed explanation'),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email().optional(),
  urgentReview: z.boolean().default(false),
  supportingDocuments: z.array(z.string()).optional(),
})

type AppealFormData = z.infer<typeof appealFormSchema>

interface EligibilityAppealProps {
  assessment: EligibilityAssessment
  onSubmitAppeal?: (appealData: AppealFormData) => Promise<void>
  onCancel?: () => void
  className?: string
}

export function EligibilityAppeal({
  assessment,
  onSubmitAppeal,
  onCancel,
  className
}: EligibilityAppealProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<AppealFormData>({
    resolver: zodResolver(appealFormSchema),
    defaultValues: {
      appealReason: undefined,
      description: '',
      contactPhone: '',
      contactEmail: '',
      urgentReview: false,
      supportingDocuments: [],
    },
  })

  const handleSubmit = async (data: AppealFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      if (onSubmitAppeal) {
        await onSubmitAppeal(data)
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setSubmitted(true)
    } catch (err) {
      setError('Failed to submit appeal. Please try again.')
      console.error('Appeal submission error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case 'INCORRECT_INFORMATION': return 'Incorrect Information Provided'
      case 'MISSING_DOCUMENTATION': return 'Missing Required Documentation'
      case 'EXCEPTIONAL_CIRCUMSTANCES': return 'Exceptional Circumstances'
      case 'POLICY_CLARIFICATION': return 'Policy Clarification Needed'
      case 'OTHER': return 'Other'
      default: return reason
    }
  }

  const getReasonDescription = (reason: string) => {
    switch (reason) {
      case 'INCORRECT_INFORMATION': 
        return 'I believe there was an error in the information I provided or how it was interpreted.'
      case 'MISSING_DOCUMENTATION': 
        return 'I have additional documentation that should be considered for my eligibility.'
      case 'EXCEPTIONAL_CIRCUMSTANCES': 
        return 'My situation involves exceptional circumstances that should be reviewed manually.'
      case 'POLICY_CLARIFICATION': 
        return 'I need clarification on how specific eligibility criteria apply to my case.'
      case 'OTHER': 
        return 'My appeal reason does not fit the above categories.'
      default: 
        return ''
    }
  }

  if (submitted) {
    return (
      <div className={`max-w-2xl mx-auto space-y-6 ${className}`}>
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Appeal Submitted Successfully</CardTitle>
            <CardDescription>
              Your appeal has been received and will be reviewed within 5-7 business days
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Appeal Reference:</strong> Appeal-{Date.now()}
                <br />
                <strong>Expected Review Time:</strong> 5-7 business days
                <br />
                <strong>Status Updates:</strong> You will receive email notifications about the progress
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <h4 className="font-medium">What happens next?</h4>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-sm">Initial Review</p>
                    <p className="text-xs text-muted-foreground">Our team reviews your appeal and supporting documents</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-sm">Detailed Assessment</p>
                    <p className="text-xs text-muted-foreground">Your case is evaluated against Healthier SG criteria</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-sm">Decision & Notification</p>
                    <p className="text-xs text-muted-foreground">You will be notified of the final decision via email</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              <Button onClick={onCancel} className="w-full">
                Return to Dashboard
              </Button>
              <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
                Submit Another Appeal
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`max-w-3xl mx-auto space-y-6 ${className}`}>
      {/* Appeal Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-6 w-6 text-orange-600" />
            <CardTitle>Request Eligibility Review</CardTitle>
          </div>
          <CardDescription>
            If you believe your eligibility assessment is incorrect, you can request a manual review
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Current Assessment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Current Assessment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-muted-foreground">Assessment Result</Label>
              <div className="flex items-center space-x-2 mt-1">
                {assessment.eligibilityResult?.isEligible ? (
                  <Badge variant="default">Eligible</Badge>
                ) : (
                  <Badge variant="secondary">Not Eligible</Badge>
                )}
                <span className="text-sm">
                  Score: {Math.round(assessment.eligibilityResult?.score || 0)}%
                </span>
              </div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Assessment Date</Label>
              <p className="text-sm font-medium mt-1">
                {new Date(assessment.completedAt || assessment.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div>
            <Label className="text-sm text-muted-foreground">Reason for Assessment Result</Label>
            <p className="text-sm mt-1 p-3 bg-gray-50 rounded">
              {assessment.eligibilityResult?.reason || 'No detailed reason available'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Appeal Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Appeal Details</CardTitle>
          <CardDescription>
            Please provide detailed information about why you are requesting a review
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Appeal Reason */}
            <div className="space-y-3">
              <Label>Reason for Appeal *</Label>
              <Select 
                onValueChange={(value) => form.setValue('appealReason', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select the reason for your appeal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INCORRECT_INFORMATION">
                    <div>
                      <div className="font-medium">Incorrect Information</div>
                      <div className="text-xs text-muted-foreground">Error in provided information</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="MISSING_DOCUMENTATION">
                    <div>
                      <div className="font-medium">Missing Documentation</div>
                      <div className="text-xs text-muted-foreground">Additional documents available</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="EXCEPTIONAL_CIRCUMSTANCES">
                    <div>
                      <div className="font-medium">Exceptional Circumstances</div>
                      <div className="text-xs text-muted-foreground">Special situation requiring review</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="POLICY_CLARIFICATION">
                    <div>
                      <div className="font-medium">Policy Clarification</div>
                      <div className="text-xs text-muted-foreground">Need clarity on eligibility criteria</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="OTHER">
                    <div>
                      <div className="font-medium">Other</div>
                      <div className="text-xs text-muted-foreground">Other reasons not listed</div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {form.watch('appealReason') && (
                <p className="text-sm text-muted-foreground">
                  {getReasonDescription(form.watch('appealReason'))}
                </p>
              )}
              {form.formState.errors.appealReason && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.appealReason.message}
                </p>
              )}
            </div>

            {/* Detailed Description */}
            <div className="space-y-3">
              <Label htmlFor="description">Detailed Explanation *</Label>
              <Textarea
                id="description"
                placeholder="Please provide a detailed explanation of your appeal. Include any relevant information that should be considered..."
                className="min-h-32"
                {...form.register('description')}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Minimum 10 characters required</span>
                <span>{form.watch('description')?.length || 0} characters</span>
              </div>
              {form.formState.errors.description && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label htmlFor="contactPhone">Contact Phone (Optional)</Label>
                <Input
                  id="contactPhone"
                  placeholder="+65 1234 5678"
                  {...form.register('contactPhone')}
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="contactEmail">Contact Email (Optional)</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="your.email@example.com"
                  {...form.register('contactEmail')}
                />
                {form.formState.errors.contactEmail && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.contactEmail.message}
                  </p>
                )}
              </div>
            </div>

            {/* Urgent Review */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="urgentReview"
                {...form.register('urgentReview')}
                className="rounded border-gray-300"
              />
              <div>
                <Label htmlFor="urgentReview" className="text-sm font-medium">
                  Request Urgent Review
                </Label>
                <p className="text-xs text-muted-foreground">
                  Check this if your situation requires immediate attention
                </p>
              </div>
            </div>

            {/* File Upload */}
            <div className="space-y-3">
              <Label>Supporting Documents (Optional)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Upload relevant documents to support your appeal
                </p>
                <Button type="button" variant="outline" size="sm">
                  Choose Files
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Accepted formats: PDF, JPG, PNG (max 5MB each)
                </p>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Important Information */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> Appeals are reviewed by our eligibility team and decisions are final. 
                Please ensure all information provided is accurate and complete.
              </AlertDescription>
            </Alert>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-3">
              <Button 
                type="submit" 
                disabled={isSubmitting || !form.formState.isValid}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Submitting Appeal...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Appeal
                  </>
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Help and Support */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <HelpCircle className="h-5 w-5 mr-2" />
            Need Help?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Appeal Status Tracking Component
interface AppealStatusProps {
  appeals: Appeal[]
  className?: string
}

export function AppealStatusTracking({ appeals, className }: AppealStatusProps) {
  const getStatusIcon = (status: Appeal['status']) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-5 w-5 text-yellow-600" />
      case 'UNDER_REVIEW': return <FileText className="h-5 w-5 text-blue-600" />
      case 'APPROVED': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'REJECTED': return <XCircle className="h-5 w-5 text-red-600" />
    }
  }

  const getStatusBadge = (status: Appeal['status']) => {
    switch (status) {
      case 'PENDING': return <Badge variant="outline">Pending</Badge>
      case 'UNDER_REVIEW': return <Badge variant="default">Under Review</Badge>
      case 'APPROVED': return <Badge variant="default">Approved</Badge>
      case 'REJECTED': return <Badge variant="destructive">Rejected</Badge>
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {appeals.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Appeals Submitted</h3>
            <p className="text-muted-foreground">
              You haven't submitted any appeals for your eligibility assessments.
            </p>
          </CardContent>
        </Card>
      ) : (
        appeals.map((appeal) => (
          <Card key={appeal.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  {getStatusIcon(appeal.status)}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">
                        {getReasonLabel(appeal.reason)}
                      </h4>
                      {getStatusBadge(appeal.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Submitted on {new Date(appeal.submittedAt).toLocaleDateString()}
                    </p>
                    {appeal.reviewNotes && (
                      <div className="p-3 bg-gray-50 rounded text-sm">
                        <strong>Review Notes:</strong> {appeal.reviewNotes}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <div>Appeal ID: {appeal.id.slice(-8)}</div>
                  {appeal.reviewedAt && (
                    <div>Reviewed: {new Date(appeal.reviewedAt).toLocaleDateString()}</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}