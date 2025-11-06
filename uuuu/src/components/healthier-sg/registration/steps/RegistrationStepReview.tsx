import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  CheckCircle, 
  AlertCircle, 
  Edit, 
  FileText, 
  Shield, 
  Target, 
  Upload,
  User,
  Phone,
  MapPin,
  Clock,
  ExternalLink,
  Download
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { toast } from '@/hooks/use-toast'
import type { 
  RegistrationWizardData, 
  ReviewSubmitStep, 
  DataValidation,
  ValidationError 
} from '../../types/registration'

export interface RegistrationStepReviewProps {
  data: RegistrationWizardData
  onUpdate: (stepId: string, data: any) => void
  onSubmit: () => void
  onNext: () => void
  eligibilityAssessmentId: string
  className?: string
}

export const RegistrationStepReview: React.FC<RegistrationStepReviewProps> = ({
  data,
  onUpdate,
  onSubmit,
  onNext,
  eligibilityAssessmentId,
  className = '',
}) => {
  const [validation, setValidation] = useState<DataValidation>({
    personalInfo: false,
    identityVerification: false,
    digitalConsent: false,
    documents: false,
    healthGoals: true, // Optional step
    overall: false,
    validationErrors: [],
  })
  
  const [isValidating, setIsValidating] = useState(false)
  const [validationComplete, setValidationComplete] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['personal-info']))

  // Validate all registration data
  const validateAllData = async () => {
    setIsValidating(true)
    const errors: ValidationError[] = []

    try {
      // Validate personal information
      if (!data.personalInfo?.firstName || !data.personalInfo?.lastName) {
        errors.push({
          step: 'personal-info',
          field: 'name',
          message: 'Full name is required',
          severity: 'error',
        })
      }

      if (!data.personalInfo?.phone) {
        errors.push({
          step: 'personal-info',
          field: 'phone',
          message: 'Phone number is required',
          severity: 'error',
        })
      }

      if (!data.personalInfo?.address?.street || !data.personalInfo?.address?.postalCode) {
        errors.push({
          step: 'personal-info',
          field: 'address',
          message: 'Complete address is required',
          severity: 'error',
        })
      }

      // Validate identity verification
      if (!data.identityVerification?.verified) {
        errors.push({
          step: 'identity-verification',
          field: 'verification',
          message: 'Identity must be verified before submission',
          severity: 'error',
        })
      }

      // Validate digital consent
      if (!data.digitalConsent?.consentsSigned) {
        errors.push({
          step: 'digital-consent',
          field: 'consents',
          message: 'All required consents must be signed',
          severity: 'error',
        })
      }

      // Validate documents
      const requiredDocs = ['nric_front', 'nric_back']
      const uploadedDocTypes = data.documents?.uploadedDocuments.map(doc => doc.fileName.toLowerCase()) || []
      const hasRequiredDocs = requiredDocs.every(req => 
        uploadedDocTypes.some(uploaded => uploaded.includes(req))
      )

      if (!hasRequiredDocs) {
        errors.push({
          step: 'document-upload',
          field: 'documents',
          message: 'Required documents (NRIC front and back) must be uploaded',
          severity: 'error',
        })
      }

      // Check for any documents with rejected status
      const rejectedDocs = data.documents?.uploadedDocuments.filter(doc => 
        doc.verificationStatus === 'rejected'
      ) || []

      if (rejectedDocs.length > 0) {
        errors.push({
          step: 'document-upload',
          field: 'verification',
          message: 'Some documents have been rejected. Please re-upload these documents.',
          severity: 'error',
        })
      }

      // Update validation state
      const newValidation: DataValidation = {
        personalInfo: errors.filter(e => e.step === 'personal-info').length === 0,
        identityVerification: errors.filter(e => e.step === 'identity-verification').length === 0,
        digitalConsent: errors.filter(e => e.step === 'digital-consent').length === 0,
        documents: errors.filter(e => e.step === 'document-upload').length === 0,
        healthGoals: true, // Optional
        overall: errors.filter(e => e.severity === 'error').length === 0,
        validationErrors: errors,
      }

      setValidation(newValidation)
      setValidationComplete(true)

      // Save validation results
      await trpc.healthierSg.validateRegistrationData.mutateAsync({
        eligibilityAssessmentId,
        data,
        validation: newValidation,
      })

    } catch (error) {
      toast({
        title: "Validation Failed",
        description: "Unable to validate registration data. Please review manually.",
        variant: "destructive",
      })
    } finally {
      setIsValidating(false)
    }
  }

  // Auto-validate when component mounts
  useEffect(() => {
    validateAllData()
  }, [data])

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId)
      } else {
        newSet.add(sectionId)
      }
      return newSet
    })
  }

  const getValidationIcon = (isValid: boolean) => {
    return isValid ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <AlertCircle className="h-4 w-4 text-red-600" />
    )
  }

  const getValidationStatus = (isValid: boolean) => {
    return isValid ? (
      <Badge className="bg-green-100 text-green-800 border-green-200">Complete</Badge>
    ) : (
      <Badge variant="destructive">Incomplete</Badge>
    )
  }

  const getSectionErrors = (sectionId: string) => {
    return validation.validationErrors.filter(error => error.step === sectionId)
  }

  const handleSubmit = async () => {
    if (!validation.overall) {
      toast({
        title: "Validation Failed",
        description: "Please resolve all validation errors before submitting.",
        variant: "destructive",
      })
      return
    }

    try {
      const submissionData = {
        finalData: data,
        submissionTimestamp: new Date(),
        estimatedProcessingTime: '2-3 business days',
        nextSteps: [
          {
            title: 'Application Review',
            description: 'Your application will be reviewed by our team',
            actionRequired: false,
            timeline: '2-3 business days',
          },
          {
            title: 'Document Verification',
            description: 'All uploaded documents will be verified',
            actionRequired: false,
            timeline: '1-2 business days',
          },
          {
            title: 'Final Approval',
            description: 'You will receive confirmation of your enrollment',
            actionRequired: false,
            timeline: 'Upon completion',
          },
        ],
      }

      await onSubmit()
      
      onUpdate('reviewSubmit', {
        reviewCompleted: true,
        dataValidation: validation,
        submissionData,
      })

    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Failed to submit registration. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getCompletionPercentage = () => {
    const requiredSections = ['personalInfo', 'identityVerification', 'digitalConsent', 'documents']
    const completedSections = requiredSections.filter(section => {
      switch (section) {
        case 'personalInfo': return validation.personalInfo
        case 'identityVerification': return validation.identityVerification
        case 'digitalConsent': return validation.digitalConsent
        case 'documents': return validation.documents
        default: return false
      }
    })
    return Math.round((completedSections.length / requiredSections.length) * 100)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Step Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Review & Submit</h3>
        </div>
        <Badge variant={validation.overall ? 'default' : 'secondary'}>
          {getCompletionPercentage()}% Complete
        </Badge>
      </div>

      {/* Validation Status */}
      {isValidating && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            Validating your registration data...
          </AlertDescription>
        </Alert>
      )}

      {/* Validation Errors */}
      {validation.validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Please resolve the following issues:</p>
              <ul className="list-disc list-inside space-y-1">
                {validation.validationErrors
                  .filter(error => error.severity === 'error')
                  .map((error, index) => (
                    <li key={index}>
                      <strong>{error.step.replace('-', ' ').toUpperCase()}:</strong> {error.message}
                    </li>
                  ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Registration Summary */}
      <div className="space-y-4">
        {/* Personal Information Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                Personal Information
                {getValidationIcon(validation.personalInfo)}
              </CardTitle>
              {getValidationStatus(validation.personalInfo)}
            </div>
          </CardHeader>
          {expandedSections.has('personal-info') && (
            <CardContent>
              {data.personalInfo && (
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium">Name:</span>
                      <p>{data.personalInfo.firstName} {data.personalInfo.lastName}</p>
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span>
                      <p>{data.personalInfo.phone}</p>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Address:</span>
                    <p>
                      {data.personalInfo.address.street}
                      {data.personalInfo.address.unit && `, ${data.personalInfo.address.unit}`}
                      <br />
                      Singapore {data.personalInfo.address.postalCode}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Emergency Contact:</span>
                    <p>
                      {data.personalInfo.emergencyContact.name} ({data.personalInfo.emergencyContact.relationship})
                      <br />
                      {data.personalInfo.emergencyContact.phone}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          )}
          <div className="px-6 pb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleSection('personal-info')}
            >
              {expandedSections.has('personal-info') ? 'Hide Details' : 'Show Details'}
            </Button>
          </div>
        </Card>

        {/* Identity Verification Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Identity Verification
                {getValidationIcon(validation.identityVerification)}
              </CardTitle>
              {getValidationStatus(validation.identityVerification)}
            </div>
          </CardHeader>
          {expandedSections.has('identity-verification') && (
            <CardContent>
              {data.identityVerification && (
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant={data.identityVerification.verified ? 'default' : 'secondary'}>
                      {data.identityVerification.verificationMethod.toUpperCase()}
                    </Badge>
                    {data.identityVerification.verified && (
                      <Badge className="bg-green-100 text-green-800">Verified</Badge>
                    )}
                  </div>
                  <div>
                    <span className="font-medium">NRIC:</span>
                    <p>{data.identityVerification.nric}</p>
                  </div>
                  {data.identityVerification.verificationData && (
                    <div>
                      <span className="font-medium">Verified Name:</span>
                      <p>{data.identityVerification.verificationData.name}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          )}
          <div className="px-6 pb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleSection('identity-verification')}
            >
              {expandedSections.has('identity-verification') ? 'Hide Details' : 'Show Details'}
            </Button>
          </div>
        </Card>

        {/* Digital Consent Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Digital Consent
                {getValidationIcon(validation.digitalConsent)}
              </CardTitle>
              {getValidationStatus(validation.digitalConsent)}
            </div>
          </CardHeader>
          {expandedSections.has('digital-consent') && (
            <CardContent>
              {data.digitalConsent && (
                <div className="space-y-3 text-sm">
                  <div className="space-y-2">
                    {Object.entries(data.digitalConsent.consentData).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        {value ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 border-t">
                    <span className="font-medium">Consent Version:</span>
                    <p>{data.digitalConsent.consentVersion}</p>
                    <span className="font-medium">Signed:</span>
                    <p>{data.digitalConsent.consentMetadata.timestamp.toLocaleString()}</p>
                  </div>
                </div>
              )}
            </CardContent>
          )}
          <div className="px-6 pb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleSection('digital-consent')}
            >
              {expandedSections.has('digital-consent') ? 'Hide Details' : 'Show Details'}
            </Button>
          </div>
        </Card>

        {/* Document Upload Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Documents
                {getValidationIcon(validation.documents)}
              </CardTitle>
              {getValidationStatus(validation.documents)}
            </div>
          </CardHeader>
          {expandedSections.has('document-upload') && (
            <CardContent>
              <div className="space-y-3">
                {data.documents?.uploadedDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4" />
                      <div>
                        <p className="text-sm font-medium">{doc.fileName}</p>
                        <p className="text-xs text-gray-500">
                          {Math.round(doc.fileSize / 1024)}KB • {doc.uploadDate.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={
                          doc.verificationStatus === 'approved' ? 'default' :
                          doc.verificationStatus === 'rejected' ? 'destructive' :
                          'secondary'
                        }
                      >
                        {doc.verificationStatus}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )) || (
                  <p className="text-sm text-gray-500">No documents uploaded</p>
                )}
              </div>
            </CardContent>
          )}
          <div className="px-6 pb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleSection('document-upload')}
            >
              {expandedSections.has('document-upload') ? 'Hide Details' : 'Show Details'}
            </Button>
          </div>
        </Card>

        {/* Health Goals Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4" />
                Health Goals
                <Badge variant="outline">Optional</Badge>
              </CardTitle>
            </div>
          </CardHeader>
          {expandedSections.has('health-goals') && (
            <CardContent>
              {data.healthGoals ? (
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium">Priority Level:</span>
                    <p className="capitalize">{data.healthGoals.priorityLevel}</p>
                  </div>
                  <div>
                    <span className="font-medium">Time Frame:</span>
                    <p className="capitalize">{data.healthGoals.timeFrame}</p>
                  </div>
                  <div>
                    <span className="font-medium">Selected Goals:</span>
                    <ul className="list-disc list-inside space-y-1">
                      {data.healthGoals.selectedGoals.map((goal) => (
                        <li key={goal.id}>{goal.title}</li>
                      ))}
                    </ul>
                  </div>
                  {data.healthGoals.customGoals.length > 0 && (
                    <div>
                      <span className="font-medium">Custom Goals:</span>
                      <ul className="list-disc list-inside space-y-1">
                        {data.healthGoals.customGoals.map((goal) => (
                          <li key={goal.id}>{goal.title}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No health goals selected</p>
              )}
            </CardContent>
          )}
          <div className="px-6 pb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleSection('health-goals')}
            >
              {expandedSections.has('health-goals') ? 'Hide Details' : 'Show Details'}
            </Button>
          </div>
        </Card>
      </div>

      {/* Next Steps Preview */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-base text-blue-800">What Happens Next?</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-700 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-medium mb-1">Application Review</h4>
              <p className="text-xs">2-3 business days</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-medium mb-1">Document Verification</h4>
              <p className="text-xs">1-2 business days</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-medium mb-1">Final Approval</h4>
              <p className="text-xs">Upon completion</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 border-t">
        <div className="flex items-center gap-4">
          {validation.overall ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">All validations passed</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                {validation.validationErrors.filter(e => e.severity === 'error').length} issues need resolution
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => window.print()}
          >
            <Download className="h-4 w-4 mr-2" />
            Print Summary
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!validation.overall || isValidating}
            size="lg"
          >
            {isValidating ? 'Validating...' : 'Submit Registration'}
          </Button>
        </div>
      </div>
    </div>
  )
}