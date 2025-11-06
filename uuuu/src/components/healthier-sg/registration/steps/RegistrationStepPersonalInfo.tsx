import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { User, Phone, MapPin, Clock, AlertCircle, CheckCircle } from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { toast } from '@/hooks/use-toast'
import type { PersonalInfoStep } from '../../types/registration'

export interface RegistrationStepPersonalInfoProps {
  data: PersonalInfoStep | null
  onUpdate: (data: PersonalInfoStep) => void
  onNext: () => void
  eligibilityAssessmentId: string
  className?: string
}

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'zh', label: '中文 (Chinese)' },
  { value: 'ms', label: 'Bahasa Melayu (Malay)' },
  { value: 'ta', label: 'தமிழ் (Tamil)' },
]

const RELATIONSHIPS = [
  'Spouse',
  'Parent',
  'Child',
  'Sibling',
  'Friend',
  'Guardian',
  'Other'
]

export const RegistrationStepPersonalInfo: React.FC<RegistrationStepPersonalInfoProps> = ({
  data,
  onUpdate,
  onNext,
  eligibilityAssessmentId,
  className = '',
}) => {
  const [formData, setFormData] = useState<PersonalInfoStep>(
    data || {
      firstName: '',
      lastName: '',
      phone: '',
      address: {
        street: '',
        unit: '',
        postalCode: '',
        country: 'Singapore',
      },
      emergencyContact: {
        name: '',
        relationship: '',
        phone: '',
      },
      preferredLanguage: 'en',
      communicationPreferences: {
        email: true,
        sms: true,
        phone: false,
      },
    }
  )

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isValidating, setIsValidating] = useState(false)

  // Load existing profile data
  const { data: existingProfile } = trpc.user.getProfile.useQuery()

  // Auto-populate from existing profile
  useEffect(() => {
    if (existingProfile && !data) {
      setFormData(prev => ({
        ...prev,
        firstName: existingProfile.firstName || '',
        lastName: existingProfile.lastName || '',
        phone: existingProfile.phone || '',
        address: {
          street: existingProfile.address || '',
          unit: existingProfile.unit || '',
          postalCode: existingProfile.postalCode || '',
          country: 'Singapore',
        },
      }))
    }
  }, [existingProfile, data])

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Required fields
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    // Phone validation (Singapore format)
    const phoneRegex = /^[689]\d{7}$/
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!phoneRegex.test(formData.phone.replace(/\s+/g, ''))) {
      newErrors.phone = 'Please enter a valid Singapore phone number (8 digits, starting with 6, 8, or 9)'
    }

    // Address validation
    if (!formData.address.street.trim()) {
      newErrors.address = 'Street address is required'
    }

    if (!formData.address.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required'
    } else if (!/^\d{6}$/.test(formData.address.postalCode)) {
      newErrors.postalCode = 'Please enter a valid 6-digit postal code'
    }

    // Emergency contact validation
    if (!formData.emergencyContact.name.trim()) {
      newErrors.emergencyContactName = 'Emergency contact name is required'
    }

    if (!formData.emergencyContact.phone.trim()) {
      newErrors.emergencyContactPhone = 'Emergency contact phone is required'
    } else if (!phoneRegex.test(formData.emergencyContact.phone.replace(/\s+/g, ''))) {
      newErrors.emergencyContactPhone = 'Please enter a valid Singapore phone number'
    }

    if (!formData.emergencyContact.relationship) {
      newErrors.emergencyContactRelationship = 'Relationship is required'
    }

    // At least one communication preference
    if (!formData.communicationPreferences.email && 
        !formData.communicationPreferences.sms && 
        !formData.communicationPreferences.phone) {
      newErrors.communicationPreferences = 'At least one communication method is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1]
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }))
    } else if (field.startsWith('emergencyContact.')) {
      const contactField = field.split('.')[1]
      setFormData(prev => ({
        ...prev,
        emergencyContact: {
          ...prev.emergencyContact,
          [contactField]: value,
        },
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }))
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }))
    }
  }

  const handleCommunicationPreferenceChange = (type: 'email' | 'sms' | 'phone', checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      communicationPreferences: {
        ...prev.communicationPreferences,
        [type]: checked,
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please correct the errors before proceeding.",
        variant: "destructive",
      })
      return
    }

    setIsValidating(true)
    try {
      // Update user profile
      await trpc.user.updateProfile.mutateAsync({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        address: formData.address.street,
        unit: formData.address.unit,
        postalCode: formData.address.postalCode,
      })

      // Update local state
      onUpdate(formData)
      
      toast({
        title: "Personal Information Updated",
        description: "Your personal information has been saved successfully.",
      })

      onNext()
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update personal information. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsValidating(false)
    }
  }

  const getCompletionStatus = () => {
    const requiredFields = [
      formData.firstName,
      formData.lastName,
      formData.phone,
      formData.address.street,
      formData.address.postalCode,
      formData.emergencyContact.name,
      formData.emergencyContact.phone,
      formData.emergencyContact.relationship,
    ]

    const completedFields = requiredFields.filter(field => field && field.toString().trim().length > 0).length
    return Math.round((completedFields / requiredFields.length) * 100)
  }

  const completionStatus = getCompletionStatus()

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Step Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Personal Information</h3>
        </div>
        <Badge variant={completionStatus === 100 ? 'default' : 'secondary'}>
          {completionStatus}% Complete
        </Badge>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Personal Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Enter your first name"
                  className={errors.firstName ? 'border-red-500' : ''}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500">{errors.firstName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Enter your last name"
                  className={errors.lastName ? 'border-red-500' : ''}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="8-digit phone number (e.g., 81234567)"
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Address Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="street">Street Address *</Label>
              <Input
                id="street"
                value={formData.address.street}
                onChange={(e) => handleInputChange('address.street', e.target.value)}
                placeholder="Enter your street address"
                className={errors.address ? 'border-red-500' : ''}
              />
              {errors.address && (
                <p className="text-sm text-red-500">{errors.address}</p>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit">Unit Number</Label>
                <Input
                  id="unit"
                  value={formData.address.unit}
                  onChange={(e) => handleInputChange('address.unit', e.target.value)}
                  placeholder="#01-123"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code *</Label>
                <Input
                  id="postalCode"
                  value={formData.address.postalCode}
                  onChange={(e) => handleInputChange('address.postalCode', e.target.value)}
                  placeholder="123456"
                  className={errors.postalCode ? 'border-red-500' : ''}
                  maxLength={6}
                />
                {errors.postalCode && (
                  <p className="text-sm text-red-500">{errors.postalCode}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.address.country}
                  disabled
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Emergency Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emergencyContactName">Contact Name *</Label>
              <Input
                id="emergencyContactName"
                value={formData.emergencyContact.name}
                onChange={(e) => handleInputChange('emergencyContact.name', e.target.value)}
                placeholder="Full name of emergency contact"
                className={errors.emergencyContactName ? 'border-red-500' : ''}
              />
              {errors.emergencyContactName && (
                <p className="text-sm text-red-500">{errors.emergencyContactName}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyContactRelationship">Relationship *</Label>
                <Select
                  value={formData.emergencyContact.relationship}
                  onValueChange={(value) => handleInputChange('emergencyContact.relationship', value)}
                >
                  <SelectTrigger className={errors.emergencyContactRelationship ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    {RELATIONSHIPS.map(relationship => (
                      <SelectItem key={relationship} value={relationship}>
                        {relationship}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.emergencyContactRelationship && (
                  <p className="text-sm text-red-500">{errors.emergencyContactRelationship}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyContactPhone">Phone Number *</Label>
                <Input
                  id="emergencyContactPhone"
                  value={formData.emergencyContact.phone}
                  onChange={(e) => handleInputChange('emergencyContact.phone', e.target.value)}
                  placeholder="8-digit phone number"
                  className={errors.emergencyContactPhone ? 'border-red-500' : ''}
                />
                {errors.emergencyContactPhone && (
                  <p className="text-sm text-red-500">{errors.emergencyContactPhone}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Communication Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Communication Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="preferredLanguage">Preferred Language</Label>
              <Select
                value={formData.preferredLanguage}
                onValueChange={(value) => handleInputChange('preferredLanguage', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map(language => (
                    <SelectItem key={language.value} value={language.value}>
                      {language.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Contact Methods (select at least one) *</Label>
              {(['email', 'sms', 'phone'] as const).map(method => (
                <div key={method} className="flex items-center space-x-2">
                  <Checkbox
                    id={method}
                    checked={formData.communicationPreferences[method]}
                    onCheckedChange={(checked) => 
                      handleCommunicationPreferenceChange(method, checked as boolean)
                    }
                  />
                  <Label htmlFor={method} className="text-sm font-normal capitalize">
                    {method === 'sms' ? 'SMS/Text Messages' : method === 'phone' ? 'Phone Calls' : 'Email'}
                  </Label>
                </div>
              ))}
              {errors.communicationPreferences && (
                <p className="text-sm text-red-500">{errors.communicationPreferences}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-6 border-t">
          <div className="flex items-center gap-4">
            {completionStatus === 100 ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">All information complete</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-orange-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">
                  {100 - completionStatus}% remaining ({8 - Math.ceil(completionStatus / 12.5)} fields)
                </span>
              </div>
            )}
          </div>

          <Button 
            type="submit" 
            disabled={isValidating || completionStatus < 80}
            className="min-w-32"
          >
            {isValidating ? 'Saving...' : 'Continue'}
          </Button>
        </div>
      </form>
    </div>
  )
}