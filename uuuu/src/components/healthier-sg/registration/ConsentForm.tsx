import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Shield, Download, Eye, CheckCircle, AlertCircle, FileText } from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { toast } from '@/hooks/use-toast'
import type { DigitalConsentStep } from '../types/registration'

export interface ConsentFormProps {
  consentData: DigitalConsentStep
  onUpdate: (data: DigitalConsentStep) => void
  onComplete: () => void
  eligibilityAssessmentId: string
  className?: string
}

interface ConsentDocument {
  id: string
  title: string
  content: string
  version: string
  lastUpdated: Date
  type: 'terms' | 'privacy' | 'data_sharing' | 'medical_consent'
}

const CONSENT_DOCUMENTS: ConsentDocument[] = [
  {
    id: 'program-participation',
    title: 'Healthier SG Program Participation Agreement',
    content: `This agreement outlines the terms and conditions for participating in Singapore's Healthier SG program.

    PROGRAM OVERVIEW:
    Healthier SG is a national initiative to help Singapore residents take steps towards better health through primary care. The program provides comprehensive health screening, personalized care plans, and ongoing support.

    PARTICIPANT COMMITMENTS:
    1. Attend scheduled health screenings and follow-up appointments
    2. Follow recommended health plans and lifestyle modifications
    3. Provide accurate health information and updates
    4. Participate in program evaluations and feedback activities

    PROGRAM BENEFITS:
    - Annual comprehensive health screening
    - Personalized care plans based on health needs
    - Access to healthcare professionals and support
    - Health education and lifestyle guidance
    - Regular monitoring and follow-up care

    PARTICIPATION TERMS:
    Participation in Healthier SG is voluntary and can be withdrawn at any time by providing written notice. The program reserves the right to modify or discontinue services with appropriate notice.

    By participating, you agree to work collaboratively with healthcare providers to achieve your health goals while maintaining the highest standards of medical care.`,
    version: '2.1',
    lastUpdated: new Date('2024-11-01'),
    type: 'terms',
  },
  {
    id: 'data-collection',
    title: 'Data Collection and Processing Consent',
    content: `This consent governs the collection, use, and disclosure of your personal data in accordance with Singapore's Personal Data Protection Act (PDPA).

    DATA COLLECTION:
    We collect the following categories of personal data:
    - Basic identification information (name, NRIC, contact details)
    - Health information (medical history, current conditions, medications)
    - Lifestyle information (diet, exercise, habits)
    - Program participation data (appointments, goals, progress)

    PURPOSES OF COLLECTION:
    Your data is collected and used for:
    1. Determining eligibility for Healthier SG program
    2. Providing personalized healthcare services
    3. Creating and managing your health profile
    4. Coordinating care with healthcare providers
    5. Program administration and quality improvement
    6. Health outcomes research and analytics

    DATA SHARING:
    Your data may be shared with:
    - Your selected healthcare provider(s)
    - Government health authorities (MOH)
    - Healthcare professionals involved in your care
    - Program administrators (with appropriate safeguards)

    YOUR RIGHTS:
    Under PDPA, you have the right to:
    - Access your personal data
    - Correct inaccurate data
    - Withdraw consent for data use
    - Request data deletion (subject to legal requirements)
    - Lodge complaints with the PDPC

    DATA RETENTION:
    Your data will be retained for the duration of your program participation and as required by law. After program completion, data will be archived or deleted according to our data retention policy.`,
    version: '2.1',
    lastUpdated: new Date('2024-11-01'),
    type: 'privacy',
  },
  {
    id: 'healthcare-data',
    title: 'Healthcare Data Sharing Agreement',
    content: `This agreement enables the secure sharing of your health information among authorized healthcare providers and systems.

    INFORMATION SHARING:
    By signing this consent, you authorize the sharing of your health information between:
    - Healthcare providers participating in Healthier SG
    - Government health systems and databases
    - Medical laboratories and diagnostic facilities
    - Specialist healthcare professionals (when referrals are made)

    TYPES OF INFORMATION SHARED:
    - Health screening results and medical reports
    - Medication lists and prescription information
    - Treatment plans and care recommendations
    - Health goals and progress tracking
    - Appointment schedules and attendance records

    SECURITY MEASURES:
    All health information is protected through:
    - End-to-end encryption for data transmission
    - Secure access controls and authentication
    - Regular security audits and monitoring
    - Compliance with healthcare data standards
    - Staff training on data protection protocols

    PURPOSE AND BENEFITS:
    Information sharing enables:
    - Coordinated and continuous care
    - Avoidance of duplicate testing and procedures
    - Timely interventions and recommendations
    - Comprehensive health management
    - Improved health outcomes

    CONSENT SCOPE:
    This consent covers the sharing of health information relevant to your participation in Healthier SG. You may specify restrictions or limitations on information sharing by contacting our Data Protection Officer.

    WITHDRAWAL:
    You may withdraw this consent at any time, which may affect the level of care coordination available through the program.`,
    version: '2.1',
    lastUpdated: new Date('2024-11-01'),
    type: 'medical_consent',
  },
]

export const ConsentForm: React.FC<ConsentFormProps> = ({
  consentData,
  onUpdate,
  onComplete,
  eligibilityAssessmentId,
  className = '',
}) => {
  const [formData, setFormData] = useState<DigitalConsentStep>(consentData)
  const [expandedDocuments, setExpandedDocuments] = useState<Set<string>>(new Set())
  const [signature, setSignature] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Submit consent mutation
  const submitConsentMutation = trpc.healthierSg.submitConsent.useMutation({
    onSuccess: () => {
      toast({
        title: "Consent Submitted",
        description: "Your digital consent has been successfully submitted.",
      })
      onComplete()
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  useEffect(() => {
    // Initialize consent metadata
    setFormData(prev => ({
      ...prev,
      consentMetadata: {
        ...prev.consentMetadata,
        ipAddress: '192.168.1.1', // Would get actual IP
        userAgent: navigator.userAgent,
        timestamp: new Date(),
        digitalSignature: signature,
      },
    }))
  }, [signature])

  const toggleDocument = (documentId: string) => {
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

    // Clear error when consent is provided
    if (checked && errors[consentType]) {
      setErrors(prev => ({
        ...prev,
        [consentType]: '',
      }))
    }
  }

  const validateConsents = (): boolean => {
    const newErrors: Record<string, string> = {}
    const requiredConsents = ['programParticipation', 'dataCollection', 'healthcareData']

    requiredConsents.forEach(consent => {
      if (!formData.consentData[consent]) {
        newErrors[consent] = 'This consent is required'
      }
    })

    if (!signature.trim()) {
      newErrors.signature = 'Digital signature is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateConsents()) {
      toast({
        title: "Consent Required",
        description: "Please provide all required consents and digital signature.",
        variant: "destructive",
      })
      return
    }

    const updatedData = {
      ...formData,
      consentsSigned: true,
      consentMetadata: {
        ...formData.consentMetadata,
        digitalSignature: signature,
      },
    }

    try {
      await submitConsentMutation.mutateAsync({
        eligibilityAssessmentId,
        consentData: updatedData,
      })
      onUpdate(updatedData)
    } catch (error) {
      // Error handled by mutation
    }
  }

  const getConsentProgress = () => {
    const totalConsents = Object.keys(formData.consentData).length
    const completedConsents = Object.values(formData.consentData).filter(Boolean).length
    return Math.round((completedConsents / totalConsents) * 100)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Digital Consent & Agreement</h2>
        <p className="text-gray-600">
          Please review and accept the terms and conditions to proceed with your Healthier SG registration
        </p>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Consent Progress</span>
            <Badge variant={getConsentProgress() === 100 ? 'default' : 'secondary'}>
              {getConsentProgress()}%
            </Badge>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getConsentProgress()}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Consent Documents */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Review Terms & Conditions</h3>
        
        {CONSENT_DOCUMENTS.map((document) => (
          <Card key={document.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div>
                    <CardTitle className="text-base">{document.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        Version {document.version}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        Updated: {document.lastUpdated.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => toggleDocument(document.id)}>
                    <Eye className="h-4 w-4 mr-2" />
                    {expandedDocuments.has(document.id) ? 'Hide' : 'View'}
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            {expandedDocuments.has(document.id) && (
              <CardContent>
                <ScrollArea className="h-64 w-full rounded border p-4">
                  <div className="text-sm leading-relaxed whitespace-pre-line">
                    {document.content}
                  </div>
                </ScrollArea>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Consent Checkboxes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Consent Agreements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(formData.consentData).map(([key, value]) => {
            const documentId = key.replace(/([A-Z])/g, match => 
              match === key.charAt(0) ? match.toLowerCase() : `-${match.toLowerCase()}`
            )
            const document = CONSENT_DOCUMENTS.find(doc => doc.id === documentId)
            
            return (
              <div key={key} className="flex items-start gap-3">
                <Checkbox
                  id={key}
                  checked={value}
                  onCheckedChange={(checked) => 
                    handleConsentChange(key as keyof typeof formData.consentData, checked as boolean)
                  }
                />
                <div className="flex-1">
                  <Label htmlFor={key} className="text-sm font-medium cursor-pointer">
                    I agree to the {document?.title || key}
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  {errors[key] && (
                    <p className="text-sm text-red-500 mt-1">{errors[key]}</p>
                  )}
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Digital Signature */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Digital Signature</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Your electronic signature confirms that you have read, understood, and agree to all terms above.
              This digital signature has the same legal effect as a handwritten signature.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="signature">Type your full name as digital signature *</Label>
            <Input
              id="signature"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="Enter your full name"
              className={errors.signature ? 'border-red-500' : ''}
            />
            {errors.signature && (
              <p className="text-sm text-red-500">{errors.signature}</p>
            )}
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p><strong>Date:</strong> {formData.consentMetadata.timestamp.toLocaleDateString()}</p>
            <p><strong>Time:</strong> {formData.consentMetadata.timestamp.toLocaleTimeString()}</p>
            <p><strong>IP Address:</strong> {formData.consentMetadata.ipAddress}</p>
          </div>
        </CardContent>
      </Card>

      {/* PDPA Notice */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-base text-blue-800">Your Rights Under PDPA</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-700 space-y-2">
          <p>Singapore's Personal Data Protection Act (PDPA) grants you the following rights:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>Access:</strong> Request access to your personal data</li>
            <li><strong>Correction:</strong> Request correction of inaccurate data</li>
            <li><strong>Withdrawal:</strong> Withdraw consent at any time</li>
            <li><strong>Deletion:</strong> Request data deletion (subject to legal requirements)</li>
            <li><strong>Complaints:</strong> Lodge complaints with the Personal Data Protection Commission</li>
          </ul>
          <p className="mt-3">
            <strong>Data Protection Officer:</strong> dpo@healthiersg.gov.sg | +65 1234 5678
          </p>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 border-t">
        <div className="flex items-center gap-2 text-green-600">
          {getConsentProgress() === 100 && signature.trim() ? (
            <>
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">All consents completed</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Please complete all required consents</span>
            </>
          )}
        </div>

        <Button 
          onClick={handleSubmit}
          disabled={getConsentProgress() < 100 || !signature.trim() || submitConsentMutation.isLoading}
          size="lg"
        >
          {submitConsentMutation.isLoading ? 'Submitting...' : 'Submit Consent'}
        </Button>
      </div>
    </div>
  )
}