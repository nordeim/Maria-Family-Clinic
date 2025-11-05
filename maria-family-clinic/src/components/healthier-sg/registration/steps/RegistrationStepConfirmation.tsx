import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  CheckCircle, 
  Download, 
  Calendar, 
  Clock, 
  Phone, 
  Mail,
  MapPin,
  FileText,
  Share2,
  Home,
  RefreshCw
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { toast } from '@/hooks/use-toast'
import type { ConfirmationStep } from '../../types/registration'

export interface RegistrationStepConfirmationProps {
  registrationId?: string
  onComplete: (registrationId: string) => void
  eligibilityAssessmentId: string
  className?: string
}

export const RegistrationStepConfirmation: React.FC<RegistrationStepConfirmationProps> = ({
  registrationId,
  onComplete,
  eligibilityAssessmentId,
  className = '',
}) => {
  const [confirmationData, setConfirmationData] = useState<ConfirmationStep | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeElapsed, setTimeElapsed] = useState(0)

  // Get registration status
  const { data: registrationStatus } = trpc.healthierSg.getRegistrationStatus.useQuery(
    { registrationId: registrationId! },
    { enabled: !!registrationId }
  )

  // Generate confirmation document
  const generateConfirmationMutation = trpc.healthierSg.generateRegistrationConfirmation.useMutation({
    onSuccess: (result) => {
      // Download or display the confirmation document
      const link = document.createElement('a')
      link.href = result.documentUrl
      link.download = `HealthierSG-Registration-${result.confirmationNumber}.pdf`
      link.click()
      
      toast({
        title: "Confirmation Downloaded",
        description: "Your registration confirmation has been downloaded.",
      })
    },
    onError: (error) => {
      toast({
        title: "Download Failed",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  // Load confirmation data
  useEffect(() => {
    const loadConfirmationData = async () => {
      if (!registrationId) return

      setIsLoading(true)
      try {
        const confirmation: ConfirmationStep = {
          registrationId,
          status: 'submitted',
          submissionDate: new Date(),
          estimatedCompletion: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
          confirmationNumber: `HGR-${registrationId.slice(-8).toUpperCase()}`,
          nextActions: [
            {
              title: 'Schedule Initial Consultation',
              description: 'Contact your selected clinic to schedule your first health screening',
              actionRequired: true,
              timeline: 'Within 2 weeks',
              contactInfo: {
                department: 'Clinic Appointment',
                phone: '1800-FIND-CLINIC',
                email: 'appointments@healthiersg.gov.sg',
              },
            },
            {
              title: 'Prepare for Health Screening',
              description: 'Gather your medical history and current medications',
              actionRequired: true,
              timeline: 'Before your appointment',
            },
            {
              title: 'Receive Program Welcome Pack',
              description: 'You will receive your digital welcome pack within 1 week',
              actionRequired: false,
              timeline: 'Within 1 week',
            },
          ],
        }

        setConfirmationData(confirmation)
      } catch (error) {
        toast({
          title: "Error Loading Confirmation",
          description: "Unable to load registration confirmation details.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadConfirmationData()
  }, [registrationId, eligibilityAssessmentId])

  // Update time elapsed
  useEffect(() => {
    if (!confirmationData) return

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - confirmationData.submissionDate.getTime()) / 1000)
      setTimeElapsed(elapsed)
    }, 1000)

    return () => clearInterval(interval)
  }, [confirmationData])

  const handleDownloadConfirmation = () => {
    if (!registrationId) return
    
    generateConfirmationMutation.mutate({
      registrationId,
      format: 'pdf',
    })
  }

  const handleShareRegistration = async () => {
    if (!confirmationData) return

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Healthier SG Registration',
          text: `I have successfully registered for Singapore's Healthier SG program. Confirmation: ${confirmationData.confirmationNumber}`,
          url: window.location.href,
        })
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback to copying to clipboard
      await navigator.clipboard.writeText(
        `I have successfully registered for Singapore's Healthier SG program. Confirmation: ${confirmationData.confirmationNumber}`
      )
      
      toast({
        title: "Copied to Clipboard",
        description: "Registration information has been copied to your clipboard.",
      })
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold mb-2">Processing Your Registration</h3>
          <p className="text-gray-600">Please wait while we finalize your enrollment...</p>
        </div>
      </div>
    )
  }

  if (!confirmationData) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Confirmation Not Found</h3>
        <p className="text-gray-600 mb-4">We could not load your registration confirmation details.</p>
        <Button onClick={() => window.location.reload()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="bg-green-100 rounded-full p-6 w-24 h-24 mx-auto flex items-center justify-center">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Registration Successful!</h2>
          <p className="text-gray-600 mt-2">
            Thank you for registering for Singapore's Healthier SG program
          </p>
        </div>
      </div>

      {/* Confirmation Details */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-base text-green-800">Registration Confirmation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-green-700">Confirmation Number:</span>
              <p className="text-green-900 font-mono">{confirmationData.confirmationNumber}</p>
            </div>
            <div>
              <span className="font-medium text-green-700">Registration ID:</span>
              <p className="text-green-900 font-mono">{confirmationData.registrationId}</p>
            </div>
            <div>
              <span className="font-medium text-green-700">Submission Date:</span>
              <p className="text-green-900">{confirmationData.submissionDate.toLocaleString()}</p>
            </div>
            <div>
              <span className="font-medium text-green-700">Status:</span>
              <Badge className="bg-green-100 text-green-800 border-green-200">
                {confirmationData.status.toUpperCase()}
              </Badge>
            </div>
          </div>

          <div className="pt-4 border-t border-green-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-700">Processing Time Elapsed:</span>
              <span className="text-green-900 font-mono">{formatTime(timeElapsed)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your Next Steps</CardTitle>
          <p className="text-sm text-gray-600">
            Here are the important actions you should take now
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {confirmationData.nextActions.map((action, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
                  <span className="text-blue-600 font-semibold text-sm">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{action.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <Badge variant="outline">
                      <Clock className="h-3 w-3 mr-1" />
                      {action.timeline}
                    </Badge>
                    {action.actionRequired && (
                      <Badge variant="destructive">Action Required</Badge>
                    )}
                  </div>
                  {action.contactInfo && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium">Contact Information:</p>
                      <div className="text-sm text-gray-600 space-y-1 mt-1">
                        {action.contactInfo.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3" />
                            {action.contactInfo.phone}
                          </div>
                        )}
                        {action.contactInfo.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3" />
                            {action.contactInfo.email}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Processing Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 rounded-full p-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Application Submitted</p>
                <p className="text-sm text-gray-600">{confirmationData.submissionDate.toLocaleString()}</p>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700">Complete</Badge>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-blue-100 rounded-full p-2">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Document Review</p>
                <p className="text-sm text-gray-600">Currently processing</p>
              </div>
              <Badge variant="secondary">In Progress</Badge>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-gray-100 rounded-full p-2">
                <Calendar className="h-4 w-4 text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Final Approval</p>
                <p className="text-sm text-gray-600">
                  Expected by {confirmationData.estimatedCompletion.toLocaleDateString()}
                </p>
              </div>
              <Badge variant="outline">Pending</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Information */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-base text-blue-800">Important Information</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-700 space-y-3">
          <div className="space-y-2">
            <h4 className="font-medium">What happens next?</h4>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>You will receive email updates on your application status</li>
              <li>All uploaded documents will be verified within 2-3 business days</li>
              <li>Once approved, you will receive your official enrollment confirmation</li>
              <li>You can schedule your first health screening appointment</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Need help?</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>Call: 1800-HEALTHIER (1800-4325843)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>Email: support@healthiersg.gov.sg</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
        <Button
          onClick={handleDownloadConfirmation}
          variant="outline"
          disabled={generateConfirmationMutation.isLoading}
          className="flex-1"
        >
          {generateConfirmationMutation.isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Download Confirmation
            </>
          )}
        </Button>

        <Button
          onClick={handleShareRegistration}
          variant="outline"
          className="flex-1"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share Registration
        </Button>

        <Button
          onClick={() => onComplete(confirmationData.registrationId)}
          className="flex-1"
        >
          <Home className="h-4 w-4 mr-2" />
          Continue to Dashboard
        </Button>
      </div>
    </div>
  )
}