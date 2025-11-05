import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Shield, CheckCircle, AlertCircle, ExternalLink, Lock } from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { toast } from '@/hooks/use-toast'
import type { IdentityVerificationStep } from '../../types/registration'

export interface RegistrationStepIdentityProps {
  data: IdentityVerificationStep | null
  onUpdate: (data: IdentityVerificationStep) => void
  onNext: () => void
  eligibilityAssessmentId: string
  className?: string
}

export const RegistrationStepIdentity: React.FC<RegistrationStepIdentityProps> = ({
  data,
  onUpdate,
  onNext,
  eligibilityAssessmentId,
  className = '',
}) => {
  const [formData, setFormData] = useState<IdentityVerificationStep>(
    data || {
      verified: false,
      verificationMethod: 'singpass',
      nric: '',
      verificationData: undefined,
      verifiedAt: undefined,
      verificationId: undefined,
    }
  )

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isVerifying, setIsVerifying] = useState(false)
  const [showManualEntry, setShowManualEntry] = useState(false)

  // SingPass integration mutation
  const singPassMutation = trpc.healthierSg.initiateSingPassAuth.useMutation({
    onSuccess: (result) => {
      // Redirect to SingPass authentication
      window.open(result.authenticationUrl, '_blank', 'width=600,height=700')
      toast({
        title: "SingPass Window Opened",
        description: "Complete verification in the SingPass window that opened.",
      })
    },
    onError: (error) => {
      toast({
        title: "SingPass Error",
        description: error.message,
        variant: "destructive",
      })
      setIsVerifying(false)
    },
  })

  // Verify SingPass callback
  const verifySingPassMutation = trpc.healthierSg.verifySingPassAuth.useMutation({
    onSuccess: (result) => {
      setFormData(prev => ({
        ...prev,
        verified: result.verified,
        verificationData: result.userInfo,
        verifiedAt: new Date(),
        verificationId: result.verificationId,
      }))
      
      onUpdate({
        ...formData,
        verified: result.verified,
        verificationData: result.userInfo,
        verifiedAt: new Date(),
        verificationId: result.verificationId,
      })

      toast({
        title: "Identity Verified",
        description: "Your identity has been successfully verified through SingPass.",
      })
    },
    onError: (error) => {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      })
    },
    onSettled: () => {
      setIsVerifying(false)
    },
  })

  // Check for SingPass callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const singPassCode = urlParams.get('singpass_code')
    const state = urlParams.get('state')
    
    if (singPassCode && state) {
      handleSingPassCallback(singPassCode, state)
    }
  }, [])

  const handleSingPassCallback = async (code: string, state: string) => {
    setIsVerifying(true)
    
    try {
      await verifySingPassMutation.mutateAsync({
        code,
        state,
        eligibilityAssessmentId,
      })
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    } catch (error) {
      console.error('SingPass verification error:', error)
    }
  }

  const initiateSingPass = async () => {
    setIsVerifying(true)
    
    try {
      await singPassMutation.mutateAsync({
        eligibilityAssessmentId,
        redirectUri: window.location.href.split('?')[0],
      })
    } catch (error) {
      // Error handled by mutation
    }
  }

  const validateManualEntry = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.nric.trim()) {
      newErrors.nric = 'NRIC is required'
    } else {
      // NRIC validation (basic format)
      const nricRegex = /^[STFG]\d{7}[A-Z]$/
      if (!nricRegex.test(formData.nric.toUpperCase())) {
        newErrors.nric = 'Please enter a valid NRIC (e.g., S1234567A)'
      }
    }

    if (formData.verificationMethod === 'manual' && !formData.verificationData?.name?.trim()) {
      newErrors.name = 'Name is required for manual verification'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleManualVerification = async () => {
    if (!validateManualEntry()) {
      return
    }

    setIsVerifying(true)
    
    try {
      // For manual verification, we'll update the data
      // In a real implementation, this would trigger a manual review process
      const verificationData = {
        name: formData.verificationData?.name || formData.nric,
        dateOfBirth: formData.verificationData?.dateOfBirth || '',
        address: formData.verificationData?.address || '',
        nationality: formData.verificationData?.nationality || '',
      }

      setFormData(prev => ({
        ...prev,
        verified: false, // Manual verification requires approval
        verificationData,
        verifiedAt: new Date(),
        verificationId: `manual-${Date.now()}`,
      }))

      onUpdate({
        ...formData,
        verified: false,
        verificationData,
        verifiedAt: new Date(),
        verificationId: `manual-${Date.now()}`,
      })

      toast({
        title: "Manual Verification Submitted",
        description: "Your identity verification has been submitted for manual review. You can proceed with registration.",
      })
    } catch (error) {
      toast({
        title: "Verification Error",
        description: "Failed to submit manual verification. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      verificationData: {
        ...prev.verificationData,
        [field]: value,
      },
    }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }))
    }
  }

  const canProceed = formData.verified || (formData.verificationMethod === 'manual' && formData.nric)

  const getVerificationMethodInfo = () => {
    switch (formData.verificationMethod) {
      case 'singpass':
        return {
          title: 'SingPass MyInfo Verification',
          description: 'Secure government-backed identity verification',
          benefits: [
            'Instant verification',
            'Government-secured data',
            'No manual document upload required',
            'Highest security standard',
          ],
        }
      case 'manual':
        return {
          title: 'Manual Identity Verification',
          description: 'Submit NRIC details for manual review',
          benefits: [
            'No SingPass account required',
            'Suitable for all users',
            'Manual review process',
            'Additional documentation may be required',
          ],
        }
    }
  }

  const methodInfo = getVerificationMethodInfo()

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Step Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Identity Verification</h3>
        </div>
        <Badge variant={formData.verified ? 'default' : 'secondary'}>
          {formData.verified ? 'Verified' : 'Not Verified'}
        </Badge>
      </div>

      {/* Verification Method Selection */}
      {!formData.verified && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Choose Verification Method</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="singpass"
                  checked={formData.verificationMethod === 'singpass'}
                  onCheckedChange={(checked) => {
                    setFormData(prev => ({
                      ...prev,
                      verificationMethod: 'singpass',
                    }))
                    setShowManualEntry(false)
                  }}
                />
                <Label htmlFor="singpass" className="flex-1">
                  <div className="flex items-center gap-2">
                    <img src="/icons/singpass-logo.svg" alt="SingPass" className="h-5 w-5" />
                    <span className="font-medium">SingPass MyInfo</span>
                    <Badge variant="outline">Recommended</Badge>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="manual"
                  checked={formData.verificationMethod === 'manual'}
                  onCheckedChange={(checked) => {
                    setFormData(prev => ({
                      ...prev,
                      verificationMethod: 'manual',
                    }))
                    setShowManualEntry(true)
                  }}
                />
                <Label htmlFor="manual" className="flex-1">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span className="font-medium">Manual Verification</span>
                  </div>
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SingPass Verification */}
      {formData.verificationMethod === 'singpass' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{methodInfo.title}</CardTitle>
            <p className="text-sm text-gray-600">{methodInfo.description}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Benefits List */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Benefits:</h4>
              <ul className="space-y-1">
                {methodInfo.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            {/* SingPass Action */}
            {!formData.verified ? (
              <div className="space-y-4">
                <Alert>
                  <Lock className="h-4 w-4" />
                  <AlertDescription>
                    You will be redirected to SingPass MyInfo to securely verify your identity. 
                    Your personal information will be retrieved directly from government records.
                  </AlertDescription>
                </Alert>

                <Button
                  onClick={initiateSingPass}
                  disabled={isVerifying}
                  className="w-full"
                  size="lg"
                >
                  {isVerifying ? (
                    'Opening SingPass...'
                  ) : (
                    <>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Verify with SingPass
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-700 mb-2">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Identity Verified Successfully</span>
                </div>
                <div className="text-sm text-green-600 space-y-1">
                  <p><strong>Name:</strong> {formData.verificationData?.name}</p>
                  <p><strong>NRIC:</strong> {formData.nric}</p>
                  <p><strong>Verified:</strong> {formData.verifiedAt?.toLocaleString()}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Manual Verification */}
      {formData.verificationMethod === 'manual' && showManualEntry && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{methodInfo.title}</CardTitle>
            <p className="text-sm text-gray-600">{methodInfo.description}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your identity will be verified manually by our team. This process typically takes 1-2 business days.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nric">NRIC (IC) Number *</Label>
                <Input
                  id="nric"
                  value={formData.nric}
                  onChange={(e) => setFormData(prev => ({ ...prev, nric: e.target.value.toUpperCase() }))}
                  placeholder="S1234567A"
                  className={errors.nric ? 'border-red-500' : ''}
                  maxLength={9}
                />
                {errors.nric && (
                  <p className="text-sm text-red-500">{errors.nric}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.verificationData?.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="As shown on NRIC"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.verificationData?.dateOfBirth || ''}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.verificationData?.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Address as per NRIC"
                />
              </div>

              <Button
                onClick={handleManualVerification}
                disabled={isVerifying}
                className="w-full"
              >
                {isVerifying ? 'Submitting...' : 'Submit for Verification'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Privacy Notice */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-base text-blue-800">Privacy & Security Notice</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-700 space-y-2">
          <p>Your identity information is protected under Singapore's Personal Data Protection Act (PDPA).</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Information is encrypted and stored securely</li>
            <li>Only authorized personnel can access your data</li>
            <li>Data will be used only for Healthier SG program purposes</li>
            <li>You can request to view or delete your data at any time</li>
          </ul>
        </CardContent>
      </Card>

      {/* Continue Button */}
      {canProceed && (
        <div className="flex items-center justify-between pt-6 border-t">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">
              {formData.verificationMethod === 'singpass' 
                ? 'Identity verified successfully' 
                : 'Manual verification submitted'}
            </span>
          </div>

          <Button onClick={onNext} className="min-w-32">
            Continue
          </Button>
        </div>
      )}
    </div>
  )
}