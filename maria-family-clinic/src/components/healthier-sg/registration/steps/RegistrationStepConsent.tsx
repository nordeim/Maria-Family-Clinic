import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FileText, CheckCircle, AlertCircle, Shield, Eye, Download, ArrowDown, ArrowUp } from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { toast } from '@/hooks/use-toast'
import type { DigitalConsentStep } from '../../types/registration'

export interface RegistrationStepConsentProps {
  data: DigitalConsentStep | null
  onUpdate: (data: DigitalConsentStep) => void
  onNext: () => void
  eligibilityAssessmentId: string
  className?: string
}

const CONSENT_DOCUMENTS = [
  {
    id: 'program-participation',
    title: 'Healthier SG Program Participation Agreement',
    description: 'Terms and conditions for participating in the Healthier SG program',
    required: true,
    category: 'program',
  },
  {
    id: 'data-collection',
    title: 'Data Collection and Processing Consent',
    description: 'Consent for collecting and processing your health data',
    required: true,
    category: 'data',
  },
  {
    id: 'healthcare-data',
    title: 'Healthcare Data Sharing Agreement',
    description: 'Consent for sharing your health information with healthcare providers',
    required: true,
    category: 'healthcare',
  },
  {
    id: 'research-participation',
    title: 'Research Participation Consent (Optional)',
    description: 'Consent to use your anonymized data for health research',
    required: false,
    category: 'research',
  },
  {
    id: 'marketing-communication',
    title: 'Marketing and Communication Consent (Optional)',
    description: 'Consent to receive health tips and program updates',
    required: false,
    category: 'communication',
  },
  {
    id: 'third-party-sharing',
    title: 'Third-Party Data Sharing (Optional)',
    description: 'Consent to share relevant health data with MOH systems',
    required: false,
    category: 'government',
  },
]

export const RegistrationStepConsent: React.FC<RegistrationStepConsentProps> = ({
  data,
  onUpdate,
  onNext,
  eligibilityAssessmentId,
  className = '',
}) => {
  const [formData, setFormData] = useState<DigitalConsentStep>(
    data || {
      consentsSigned: false,
      consentVersion: '2.1',
      consentData: {
        programParticipation: false,
        dataCollection: false,
        healthcareData: false,
        researchParticipation: false,
        marketingCommunication: false,
        thirdPartySharing: false,
      },
      consentMetadata: {
        ipAddress: '',
        userAgent: '',
        timestamp: new Date(),
      },
      ageVerification: {
        isOver18: true,
        guardianConsentRequired: false,
      },
    }
  )

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [expandedDocuments, setExpandedDocuments] = useState<Set<string>>(new Set())
  const [digitalSignature, setDigitalSignature] = useState('')

  // Load consent documents
  const { data: consentDocuments } = trpc.healthierSg.getConsentDocuments.useQuery({
    consentVersion: formData.consentVersion,
  })

  // Get user's age for guardian consent check
  const { data: profile } = trpc.user.getProfile.useQuery()

  // Initialize consent metadata
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      consentMetadata: {
        ...prev.consentMetadata,
        ipAddress: '192.168.1.1', // Would get actual IP
        userAgent: navigator.userAgent,
        timestamp: new Date(),
      },
    }))
    setIsLoading(false)
  }, [])

  // Check if guardian consent is required (under 18)
  useEffect(() => {
    if (profile?.dateOfBirth) {
      const age = calculateAge(profile.dateOfBirth)
      const needsGuardianConsent = age < 18
      
      setFormData(prev => ({
        ...prev,
        ageVerification: {
          ...prev.ageVerification,
          isOver18: age >= 18,
          guardianConsentRequired: needsGuardianConsent,
        },
      }))
    }
  }, [profile])

  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  const toggleDocumentExpansion = (documentId: string) => {
    setExpandedDocuments(prev => {
      const newSet = new Set(prev)
      if (newSet.has(documentId)) {
        newSet.delete(documentId)
      } else {
        newSet.add(documentId)
      }
      return newSet
    })
  }

  const handleConsentChange = (consentType: keyof typeof formData.consentData, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      consentData: {
        ...prev.consentData,
        [consentType]: checked,
      },
    }))

    // Clear errors when user provides consent
    if (checked && errors[consentType]) {
      setErrors(prev => ({
        ...prev,
        [consentType]: '',
      }))
    }
  }

  const handleGuardianSignature = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      ageVerification: {
        ...prev.ageVerification,
        guardianDetails: {
          ...prev.ageVerification.guardianDetails,
          [field]: value,
        },
      },
    }))
  }

  const validateConsents = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Check required consents
    const requiredConsents = ['programParticipation', 'dataCollection', 'healthcareData']
    requiredConsents.forEach(consent => {
      if (!formData.consentData[consent as keyof typeof formData.consentData]) {
        newErrors[consent] = 'This consent is required for program participation'
      }
    })

    // Guardian consent validation
    if (formData.ageVerification.guardianConsentRequired) {
      const guardian = formData.ageVerification.guardianDetails
      if (!guardian?.name?.trim()) {
        newErrors.guardianName = 'Guardian name is required'
      }
      if (!guardian?.nric?.trim()) {
        newErrors.guardianNric = 'Guardian NRIC is required'
      }
      if (!guardian?.signature?.trim()) {
        newErrors.guardianSignature = 'Guardian signature is required'
      }
    }

    // Digital signature validation
    if (!digitalSignature.trim()) {
      newErrors.digitalSignature = 'Digital signature is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateConsents()) {
      toast({
        title: "Consent Required",
        description: "Please review and provide all required consents.",
        variant: "destructive",
      })
      return
    }

    try {
      const updatedData = {
        ...formData,
        consentsSigned: true,
        consentMetadata: {
          ...formData.consentMetadata,
          digitalSignature,
        },
      }

      // Submit consent to backend
      await trpc.healthierSg.submitConsent.mutateAsync({
        eligibilityAssessmentId,
        consentData: updatedData,
      })

      onUpdate(updatedData)
      toast({
        title: "Consents Submitted",
        description: "Your digital consents have been submitted successfully.",
      })

      onNext()
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Failed to submit consent. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getRequiredConsentsCompleted = () => {
    const requiredConsents = ['programParticipation', 'dataCollection', 'healthcareData']
    return requiredConsents.filter(consent => formData.consentData[consent as keyof typeof formData.consentData]).length
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading consent documents...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Step Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Digital Consent & Agreement</h3>
        </div>
        <Badge variant={getRequiredConsentsCompleted() === 3 ? 'default' : 'secondary'}>
          {getRequiredConsentsCompleted()}/3 Required
        </Badge>
      </div>

      {/* Age Verification Alert */}
      {formData.ageVerification.guardianConsentRequired && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You are under 18 years old. Guardian consent is required to proceed with registration.
          </AlertDescription>
        </Alert>
      )}

      {/* Guardian Consent Section */}
      {formData.ageVerification.guardianConsentRequired && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-base text-orange-800">Guardian Consent Required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="guardianName">Guardian Full Name *</Label>
                <Input
                  id="guardianName"
                  value={formData.ageVerification.guardianDetails?.name || ''}
                  onChange={(e) => handleGuardianSignature('name', e.target.value)}
                  placeholder="Guardian's full name"
                  className={errors.guardianName ? 'border-red-500' : ''}
                />
                {errors.guardianName && (
                  <p className="text-sm text-red-500">{errors.guardianName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="guardianNric">Guardian NRIC *</Label>
                <Input
                  id="guardianNric"
                  value={formData.ageVerification.guardianDetails?.nric || ''}
                  onChange={(e) => handleGuardianSignature('nric', e.target.value.toUpperCase())}
                  placeholder="S1234567A"
                  maxLength={9}
                  className={errors.guardianNric ? 'border-red-500' : ''}
                />
                {errors.guardianNric && (
                  <p className="text-sm text-red-500">{errors.guardianNric}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="guardianRelationship">Relationship</Label>
              <Input
                id="guardianRelationship"
                value={formData.ageVerification.guardianDetails?.relationship || ''}
                onChange={(e) => handleGuardianSignature('relationship', e.target.value)}
                placeholder="e.g., Parent, Legal Guardian"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guardianSignature">Guardian Digital Signature *</Label>
              <Input
                id="guardianSignature"
                value={formData.ageVerification.guardianDetails?.signature || ''}
                onChange={(e) => handleGuardianSignature('signature', e.target.value)}
                placeholder="Type full name as signature"
                className={errors.guardianSignature ? 'border-red-500' : ''}
              />
              {errors.guardianSignature && (
                <p className="text-sm text-red-500">{errors.guardianSignature}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Consent Documents */}
      <div className="space-y-4">
        <h4 className="font-medium">Review and Accept Terms</h4>
        
        {CONSENT_DOCUMENTS.map((document) => (
          <Card key={document.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id={document.id}
                    checked={formData.consentData[document.id as keyof typeof formData.consentData]}
                    onCheckedChange={(checked) => 
                      handleConsentChange(document.id as keyof typeof formData.consentData, checked as boolean)
                    }
                    disabled={document.required && formData.ageVerification.guardianConsentRequired}
                  />
                  <div className="flex-1">
                    <Label 
                      htmlFor={document.id} 
                      className={`text-sm font-medium ${document.required ? 'text-red-700' : ''}`}
                    >
                      {document.title}
                      {document.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <p className="text-xs text-gray-600 mt-1">{document.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={document.required ? 'destructive' : 'outline'}>
                    {document.required ? 'Required' : 'Optional'}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleDocumentExpansion(document.id)}
                  >
                    {expandedDocuments.has(document.id) ? (
                      <ArrowUp className="h-4 w-4" />
                    ) : (
                      <ArrowDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            {expandedDocuments.has(document.id) && (
              <CardContent className="pt-0">
                <ScrollArea className="h-32 w-full rounded border p-3 bg-gray-50">
                  <div className="text-sm">
                    {/* Document content would be loaded here */}
                    <p className="text-gray-700 leading-relaxed">
                      {document.description}
                    </p>
                    <p className="text-gray-600 mt-2">
                      This document contains the complete terms and conditions for {document.title.toLowerCase()}. 
                      Please review carefully before providing your consent.
                    </p>
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Full Text
                        </Button>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            )}
            
            {errors[document.id] && (
              <div className="px-6 pb-4">
                <p className="text-sm text-red-500">{errors[document.id]}</p>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Digital Signature */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Digital Signature</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              By typing your name below, you confirm that you have read, understood, and agree to all the terms above. 
              Your electronic signature has the same legal effect as a handwritten signature.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="digitalSignature">Type your full name as digital signature *</Label>
            <Input
              id="digitalSignature"
              value={digitalSignature}
              onChange={(e) => setDigitalSignature(e.target.value)}
              placeholder={`${profile?.firstName || ''} ${profile?.lastName || ''}`.trim()}
              className={errors.digitalSignature ? 'border-red-500' : ''}
            />
            {errors.digitalSignature && (
              <p className="text-sm text-red-500">{errors.digitalSignature}</p>
            )}
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p>Date: {formData.consentMetadata.timestamp.toLocaleDateString()}</p>
            <p>Time: {formData.consentMetadata.timestamp.toLocaleTimeString()}</p>
            <p>IP Address: {formData.consentMetadata.ipAddress}</p>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Notice */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-base text-blue-800">Privacy & Data Protection</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-700 space-y-2">
          <p>Your consent is governed by Singapore's Personal Data Protection Act (PDPA). You have the right to:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Withdraw your consent at any time</li>
            <li>Request access to your personal data</li>
            <li>Request correction of your personal data</li>
            <li>Request deletion of your personal data (subject to legal requirements)</li>
            <li>Limit the use of your personal data</li>
          </ul>
          <p className="mt-2">
            For any privacy concerns, contact our Data Protection Officer at dpo@healthiersg.gov.sg
          </p>
        </CardContent>
      </Card>

      {/* Continue Button */}
      <div className="flex items-center justify-between pt-6 border-t">
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm font-medium">
            {getRequiredConsentsCompleted() === 3 ? 'All required consents completed' : `${getRequiredConsentsCompleted()}/3 consents completed`}
          </span>
        </div>

        <Button 
          onClick={handleSubmit}
          disabled={getRequiredConsentsCompleted() < 3 || (formData.ageVerification.guardianConsentRequired && !formData.ageVerification.guardianDetails?.signature)}
          className="min-w-32"
        >
          Accept & Continue
        </Button>
      </div>
    </div>
  )
}