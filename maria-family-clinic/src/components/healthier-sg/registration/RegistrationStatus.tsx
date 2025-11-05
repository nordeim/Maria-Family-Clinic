import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  FileText, 
  Shield, 
  Calendar,
  User,
  Phone,
  Download,
  RefreshCw,
  Eye
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { toast } from '@/hooks/use-toast'
import type { RegistrationStatus } from '../types/registration'

export interface RegistrationStatusProps {
  userId?: string
  registrationId?: string
  className?: string
}

export const RegistrationStatus: React.FC<RegistrationStatusProps> = ({
  userId,
  registrationId,
  className = '',
}) => {
  const [status, setStatus] = useState<RegistrationStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Get registration status
  const { data: registrationData, refetch } = trpc.healthierSg.getRegistrationStatus.useQuery(
    { registrationId: registrationId || '' },
    { enabled: !!registrationId }
  )

  // Get current user ID from session if not provided
  const { data: profile } = trpc.user.getProfile.useQuery()

  useEffect(() => {
    if (profile?.userId && !userId) {
      setIsLoading(true)
      // Would fetch user's registration status here
    }
  }, [profile, userId])

  useEffect(() => {
    if (registrationData) {
      setStatus(registrationData)
      setIsLoading(false)
    }
  }, [registrationData])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'submitted':
      case 'under_review':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'needs_revision':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'withdrawn':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4" />
      case 'submitted':
      case 'under_review':
        return <Clock className="h-4 w-4" />
      case 'needs_revision':
        return <AlertCircle className="h-4 w-4" />
      case 'rejected':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getStepStatus = (stepId: string, currentStep: string) => {
    if (currentStep === stepId) return 'current'
    if (status?.progress?.completedSteps.includes(stepId)) return 'completed'
    return 'pending'
  }

  const formatTimeRemaining = () => {
    if (!status?.progress?.estimatedTimeRemaining) return 'Unknown'
    
    const hours = Math.floor(status.progress.estimatedTimeRemaining / 3600)
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''}`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`
    return 'Less than 1 hour'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading registration status...</p>
        </div>
      </div>
    )
  }

  if (!status) {
    return (
      <Card className="text-center py-8">
        <CardContent>
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Registration Found</h3>
          <p className="text-gray-600 mb-4">
            No Healthier SG registration found for this user.
          </p>
          <Button variant="outline">
            Start Registration
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Registration Status
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(status.status)}
              <span className="font-medium capitalize">
                {status.status.replace('_', ' ')}
              </span>
            </div>
            <Badge className={getStatusColor(status.status)}>
              {status.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Registration ID:</span>
              <p className="font-mono">{status.id}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Current Step:</span>
              <p>{status.currentStep.replace('-', ' ').toUpperCase()}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Progress:</span>
              <p>{status.progress?.completionPercentage || 0}% Complete</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Time Elapsed:</span>
              <p>{Math.floor((Date.now() - status.progress?.lastUpdated.getTime()) / (1000 * 60 * 60))} hours</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Registration Progress</span>
              <span>{status.progress?.completionPercentage || 0}%</span>
            </div>
            <Progress value={status.progress?.completionPercentage || 0} className="w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Step Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Registration Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { id: 'personal-info', title: 'Personal Information', icon: User },
              { id: 'identity-verification', title: 'Identity Verification', icon: Shield },
              { id: 'digital-consent', title: 'Digital Consent', icon: FileText },
              { id: 'document-upload', title: 'Document Upload', icon: FileText },
              { id: 'health-goals', title: 'Health Goals', icon: Calendar },
              { id: 'review-submit', title: 'Review & Submit', icon: CheckCircle },
            ].map((step) => {
              const stepStatus = getStepStatus(step.id, status.currentStep)
              const Icon = step.icon
              
              return (
                <div key={step.id} className="flex items-center gap-3">
                  <div className={`
                    rounded-full p-2 
                    ${stepStatus === 'completed' ? 'bg-green-100' :
                      stepStatus === 'current' ? 'bg-blue-100' :
                      'bg-gray-100'}
                  `}>
                    <Icon className={`
                      h-4 w-4 
                      ${stepStatus === 'completed' ? 'text-green-600' :
                        stepStatus === 'current' ? 'text-blue-600' :
                        'text-gray-400'}
                    `} />
                  </div>
                  <div className="flex-1">
                    <p className={`
                      font-medium 
                      ${stepStatus === 'completed' ? 'text-green-900' :
                        stepStatus === 'current' ? 'text-blue-900' :
                        'text-gray-500'}
                    `}>
                      {step.title}
                    </p>
                    {stepStatus === 'completed' && (
                      <p className="text-sm text-green-600">✓ Completed</p>
                    )}
                    {stepStatus === 'current' && (
                      <p className="text-sm text-blue-600">Currently active</p>
                    )}
                  </div>
                  <Badge 
                    variant={stepStatus === 'completed' ? 'default' : 'secondary'}
                    className={stepStatus === 'completed' ? 'bg-green-100 text-green-800' : ''}
                  >
                    {stepStatus === 'completed' ? 'Complete' : 
                     stepStatus === 'current' ? 'Active' : 'Pending'}
                  </Badge>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      {status.auditLog && status.auditLog.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Activity Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-4">
                {status.auditLog
                  .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                  .map((entry) => (
                    <div key={entry.id} className="flex items-start gap-3">
                      <div className="bg-blue-100 rounded-full p-1 mt-1">
                        <div className="w-2 h-2 bg-blue-600 rounded-full" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{entry.action}</p>
                        <p className="text-sm text-gray-600">
                          {entry.timestamp.toLocaleString()}
                        </p>
                        {entry.stepId && (
                          <Badge variant="outline" className="mt-1">
                            {entry.stepId.replace('-', ' ')}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Status-Specific Messages */}
      <Card>
        <CardContent className="pt-6">
          {status.status === 'submitted' && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                <strong>Registration Submitted!</strong> Your application is currently under review. 
                Estimated processing time: {formatTimeRemaining()}. You will receive email updates on the status.
              </AlertDescription>
            </Alert>
          )}

          {status.status === 'under_review' && (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Under Review</strong> Our team is reviewing your documents and information. 
                This process typically takes 2-3 business days.
              </AlertDescription>
            </Alert>
          )}

          {status.status === 'needs_revision' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Revision Required</strong> Please review the feedback provided and make the necessary 
                changes to your registration. {status.revisionRequired?.length} items need attention.
              </AlertDescription>
            </Alert>
          )}

          {status.status === 'approved' && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Registration Approved!</strong> Congratulations! You are now enrolled in the 
                Healthier SG program. You will receive your welcome information shortly.
              </AlertDescription>
            </Alert>
          )}

          {status.status === 'rejected' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Registration Rejected</strong> Unfortunately, your application was not approved. 
                Reason: {status.rejectionReason || 'Please contact support for more information.'}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {status.status === 'needs_revision' && (
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Revise Registration
          </Button>
        )}

        {(status.status === 'submitted' || status.status === 'under_review') && (
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Contact Support
          </Button>
        )}

        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Download Status Report
        </Button>

        {status.status === 'approved' && (
          <Button>
            <CheckCircle className="h-4 w-4 mr-2" />
            Access Dashboard
          </Button>
        )}
      </div>
    </div>
  )
}