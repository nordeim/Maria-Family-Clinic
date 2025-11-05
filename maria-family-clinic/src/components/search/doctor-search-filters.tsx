'use client'

import React from 'react'
import { 
  Heart, 
  Clock, 
  GraduationCap, 
  Award, 
  Globe, 
  User, 
  Building, 
  Shield,
  Accessibility as AccessibilityIcon,
  MapPin,
  Star,
  Users,
  Phone
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Checkbox,
  Label,
  Slider,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Input,
  RadioGroup,
  RadioGroupItem,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui'

interface DoctorSearchFiltersProps {
  filters: {
    // Text search
    search: string
    specialty: string[]
    subSpecialty: string[]
    conditionsTreated: string[]
    
    // Location
    radiusKm: number
    location: string
    
    // Language and Communication
    languages: string[]
    languageProficiency: string[]
    
    // Availability
    availabilityDate: string
    timeSlots: string[]
    nextAvailable: boolean
    
    // Experience and Qualifications
    experienceYears: {
      min: number
      max: number
    }
    qualifications: string[]
    certifications: string[]
    
    // Demographics
    gender: string
    
    // Clinic Details
    clinicTypes: string[]
    clinicRatings: number
    clinicAffiliations: string[]
    
    // Services
    services: string[]
    acceptsInsurance: boolean
    insuranceTypes: string[]
    
    // Accessibility
    accessibility: string[]
    
    // Sorting
    sortBy: 'relevance' | 'distance' | 'rating' | 'experience' | 'availability'
    sortDirection: 'asc' | 'desc'
  }
  onFiltersChange: (filters: any) => void
}

// Medical specialties aligned with Singapore MOH categories
const medicalSpecialties = [
  'General Practice',
  'Cardiology',
  'Dermatology',
  'Endocrinology',
  'Gastroenterology',
  'General Surgery',
  'Neurology',
  'Obstetrics & Gynecology',
  'Oncology',
  'Ophthalmology',
  'Orthopedics',
  'Otolaryngology (ENT)',
  'Pediatrics',
  'Psychiatry',
  'Pulmonology',
  'Radiology',
  'Rheumatology',
  'Urology',
  'Emergency Medicine',
  'Family Medicine',
  'Internal Medicine',
  'Pathology',
  'Anesthesiology',
  'Rehabilitation Medicine',
]

const subSpecialties = {
  'Cardiology': ['Interventional Cardiology', 'Electrophysiology', 'Heart Failure', 'Pediatric Cardiology'],
  'Dermatology': ['Dermatopathology', 'Mohs Surgery', 'Pediatric Dermatology', 'Cosmetic Dermatology'],
  'Neurology': ['Stroke Medicine', 'Epilepsy', 'Movement Disorders', 'Neurophysiology'],
  'Orthopedics': ['Spine Surgery', 'Joint Replacement', 'Sports Medicine', 'Pediatric Orthopedics'],
  'Surgery': ['Laparoscopic Surgery', 'Robotic Surgery', 'Vascular Surgery', 'Transplant Surgery'],
}

const commonConditions = [
  'Diabetes',
  'Hypertension',
  'Heart Disease',
  'Arthritis',
  'Asthma',
  'Depression',
  'Anxiety',
  'Back Pain',
  'Migraine',
  'Skin Conditions',
  'Eye Problems',
  'Digestive Issues',
]

const languages = [
  'English',
  'Mandarin',
  'Malay',
  'Tamil',
  'Hokkien',
  'Cantonese',
  'Teochew',
  'Hindi',
  'Bengali',
  'Punjabi',
  'Japanese',
  'Korean',
]

const qualifications = [
  'MBBS',
  'MRCP',
  'FRCP',
  'MD',
  'PhD',
  'Masters in Medicine',
  'Board Certification',
  'Fellowship',
]

const clinicTypes = [
  'Private Clinic',
  'Polyclinic',
  'Hospital',
  'Specialist Centre',
  'Medical Centre',
]

const insuranceTypes = [
  'Medisave',
  'Medishield',
  'Integrated Shield Plan',
  'CHAS Blue',
  'CHAS Orange',
  'CHAS Green',
  'Private Insurance',
]

const accessibilityFeatures = [
  'Wheelchair Access',
  'Hearing Loop',
  'Sign Language Interpreter',
  'Large Print Materials',
  'Voice Recognition Software',
  'Elevator Access',
  'Ramp Access',
  'Accessible Parking',
]

export function DoctorSearchFilters({
  filters,
  onFiltersChange,
}: DoctorSearchFiltersProps) {
  const handleSpecialtyChange = (specialty: string) => {
    const newSpecialties = filters.specialty.includes(specialty)
      ? filters.specialty.filter(s => s !== specialty)
      : [...filters.specialty, specialty]
    
    onFiltersChange({
      ...filters,
      specialty: newSpecialties,
      subSpecialty: [] // Reset sub-specialties when specialty changes
    })
  }

  const handleSubSpecialtyChange = (subSpecialty: string) => {
    const newSubSpecialties = filters.subSpecialty.includes(subSpecialty)
      ? filters.subSpecialty.filter(s => s !== subSpecialty)
      : [...filters.subSpecialty, subSpecialty]
    
    onFiltersChange({
      ...filters,
      subSpecialty: newSubSpecialties
    })
  }

  const handleConditionChange = (condition: string) => {
    const newConditions = filters.conditionsTreated.includes(condition)
      ? filters.conditionsTreated.filter(c => c !== condition)
      : [...filters.conditionsTreated, condition]
    
    onFiltersChange({
      ...filters,
      conditionsTreated: newConditions
    })
  }

  const handleLanguageChange = (language: string) => {
    const newLanguages = filters.languages.includes(language)
      ? filters.languages.filter(l => l !== language)
      : [...filters.languages, language]
    
    onFiltersChange({
      ...filters,
      languages: newLanguages
    })
  }

  const handleServiceChange = (service: string) => {
    const newServices = filters.services.includes(service)
      ? filters.services.filter(s => s !== service)
      : [...filters.services, service]
    
    onFiltersChange({
      ...filters,
      services: newServices
    })
  }

  const handleClinicTypeChange = (clinicType: string) => {
    const newClinicTypes = filters.clinicTypes.includes(clinicType)
      ? filters.clinicTypes.filter(t => t !== clinicType)
      : [...filters.clinicTypes, clinicType]
    
    onFiltersChange({
      ...filters,
      clinicTypes: newClinicTypes
    })
  }

  const handleAccessibilityChange = (feature: string) => {
    const newAccessibility = filters.accessibility.includes(feature)
      ? filters.accessibility.filter(a => a !== feature)
      : [...filters.accessibility, feature]
    
    onFiltersChange({
      ...filters,
      accessibility: newAccessibility
    })
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="medical" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="medical">Medical</TabsTrigger>
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="clinic">Clinic</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* Medical Information Tab */}
        <TabsContent value="medical" className="space-y-6">
          {/* Medical Specialties */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Medical Specialties
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {medicalSpecialties.map((specialty) => (
                  <Button
                    key={specialty}
                    variant={filters.specialty.includes(specialty) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSpecialtyChange(specialty)}
                    className="justify-start text-left h-auto py-2"
                  >
                    <div className="text-left">
                      <div className="font-medium">{specialty}</div>
                      {subSpecialties[specialty as keyof typeof subSpecialties] && (
                        <div className="text-xs text-muted-foreground">
                          + {subSpecialties[specialty as keyof typeof subSpecialties].length} sub-specialties
                        </div>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sub-specialties */}
          {filters.specialty.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-blue-500" />
                  Sub-specialties
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filters.specialty.map((specialty) => {
                    const subSpecs = subSpecialties[specialty as keyof typeof subSpecialties] || []
                    return (
                      <div key={specialty} className="space-y-2">
                        <Label className="font-medium">{specialty}</Label>
                        <div className="flex flex-wrap gap-2">
                          {subSpecs.map((subSpec) => (
                            <Button
                              key={subSpec}
                              variant={filters.subSpecialty.includes(subSpec) ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleSubSpecialtyChange(subSpec)}
                            >
                              {subSpec}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Conditions Treated */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-500" />
                Conditions Treated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {commonConditions.map((condition) => (
                  <Button
                    key={condition}
                    variant={filters.conditionsTreated.includes(condition) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleConditionChange(condition)}
                  >
                    {condition}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Experience Range */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-500" />
                Years of Experience
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Slider
                  value={[filters.experienceYears.min, filters.experienceYears.max]}
                  onValueChange={(value) => 
                    onFiltersChange({
                      ...filters,
                      experienceYears: { min: value[0], max: value[1] }
                    })
                  }
                  max={50}
                  min={0}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{filters.experienceYears.min} years</span>
                  <span>{filters.experienceYears.max} years</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Personal Information Tab */}
        <TabsContent value="personal" className="space-y-6">
          {/* Languages Spoken */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-500" />
                Languages Spoken
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {languages.map((language) => (
                  <div key={language} className="flex items-center space-x-2">
                    <Checkbox
                      id={language}
                      checked={filters.languages.includes(language)}
                      onCheckedChange={() => handleLanguageChange(language)}
                    />
                    <Label htmlFor={language} className="text-sm">
                      {language}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Gender Preference */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-pink-500" />
                Doctor Gender Preference
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={filters.gender}
                onValueChange={(value) => 
                  onFiltersChange({ ...filters, gender: value === filters.gender ? '' : value })
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="MALE" id="male" />
                  <Label htmlFor="male">Male Doctor</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="FEMALE" id="female" />
                  <Label htmlFor="female">Female Doctor</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="" id="no-preference" />
                  <Label htmlFor="no-preference">No Preference</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Availability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" />
                Availability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="next-available"
                  checked={filters.nextAvailable}
                  onCheckedChange={(checked) => 
                    onFiltersChange({ ...filters, nextAvailable: !!checked })
                  }
                />
                <Label htmlFor="next-available">Next Available Appointment</Label>
              </div>
              
              <div className="space-y-2">
                <Label>Specific Date</Label>
                <Input
                  type="date"
                  value={filters.availabilityDate}
                  onChange={(e) => 
                    onFiltersChange({ ...filters, availabilityDate: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Time Preference</Label>
                <Select
                  value={filters.timeSlots[0] || ''}
                  onValueChange={(value) => 
                    onFiltersChange({ 
                      ...filters, 
                      timeSlots: value ? [value] : [] 
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning (8AM - 12PM)</SelectItem>
                    <SelectItem value="afternoon">Afternoon (12PM - 5PM)</SelectItem>
                    <SelectItem value="evening">Evening (5PM - 9PM)</SelectItem>
                    <SelectItem value="weekend">Weekend</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Clinic Information Tab */}
        <TabsContent value="clinic" className="space-y-6">
          {/* Clinic Type */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-green-500" />
                Clinic Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {clinicTypes.map((clinicType) => (
                  <div key={clinicType} className="flex items-center space-x-2">
                    <Checkbox
                      id={clinicType}
                      checked={filters.clinicTypes.includes(clinicType)}
                      onCheckedChange={() => handleClinicTypeChange(clinicType)}
                    />
                    <Label htmlFor={clinicType}>{clinicType}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Clinic Rating */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Minimum Clinic Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={filters.clinicRatings.toString()}
                onValueChange={(value) => 
                  onFiltersChange({ ...filters, clinicRatings: parseFloat(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any Rating</SelectItem>
                  <SelectItem value="3">3+ Stars</SelectItem>
                  <SelectItem value="3.5">3.5+ Stars</SelectItem>
                  <SelectItem value="4">4+ Stars</SelectItem>
                  <SelectItem value="4.5">4.5+ Stars</SelectItem>
                  <SelectItem value="5">5 Stars Only</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Services Offered */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Services Offered
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  'Consultation',
                  'Surgery',
                  'Diagnostics',
                  'Therapy',
                  'Health Screening',
                  'Vaccination',
                  'Emergency Care',
                  'Telemedicine'
                ].map((service) => (
                  <div key={service} className="flex items-center space-x-2">
                    <Checkbox
                      id={service}
                      checked={filters.services.includes(service)}
                      onCheckedChange={() => handleServiceChange(service)}
                    />
                    <Label htmlFor={service}>{service}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Insurance & Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-500" />
                Insurance & Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="accepts-insurance"
                  checked={filters.acceptsInsurance}
                  onCheckedChange={(checked) => 
                    onFiltersChange({ ...filters, acceptsInsurance: !!checked })
                  }
                />
                <Label htmlFor="accepts-insurance">Accepts Insurance</Label>
              </div>

              {filters.acceptsInsurance && (
                <div className="space-y-2">
                  <Label>Insurance Types</Label>
                  <div className="space-y-2">
                    {insuranceTypes.map((insurance) => (
                      <div key={insurance} className="flex items-center space-x-2">
                        <Checkbox
                          id={insurance}
                          checked={filters.insuranceTypes.includes(insurance)}
                          onCheckedChange={() => {
                            const newInsuranceTypes = filters.insuranceTypes.includes(insurance)
                              ? filters.insuranceTypes.filter(i => i !== insurance)
                              : [...filters.insuranceTypes, insurance]
                            onFiltersChange({ ...filters, insuranceTypes: newInsuranceTypes })
                          }}
                        />
                        <Label htmlFor={insurance}>{insurance}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Filters Tab */}
        <TabsContent value="advanced" className="space-y-6">
          {/* Qualifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-purple-500" />
                Qualifications & Certifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {qualifications.map((qualification) => (
                  <div key={qualification} className="flex items-center space-x-2">
                    <Checkbox
                      id={qualification}
                      checked={filters.qualifications.includes(qualification)}
                      onCheckedChange={() => {
                        const newQualifications = filters.qualifications.includes(qualification)
                          ? filters.qualifications.filter(q => q !== qualification)
                          : [...filters.qualifications, qualification]
                        onFiltersChange({ ...filters, qualifications: newQualifications })
                      }}
                    />
                    <Label htmlFor={qualification}>{qualification}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Accessibility Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AccessibilityIcon className="h-5 w-5 text-indigo-500" />
                Accessibility Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {accessibilityFeatures.map((feature) => (
                  <div key={feature} className="flex items-center space-x-2">
                    <Checkbox
                      id={feature}
                      checked={filters.accessibility.includes(feature)}
                      onCheckedChange={() => handleAccessibilityChange(feature)}
                    />
                    <Label htmlFor={feature}>{feature}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Location Radius */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-500" />
                Search Radius
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Slider
                  value={[filters.radiusKm]}
                  onValueChange={(value) => 
                    onFiltersChange({ ...filters, radiusKm: value[0] })
                  }
                  max={50}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="text-sm text-muted-foreground text-center">
                  {filters.radiusKm} km radius
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Filter Summary */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="text-sm font-medium">Active Filters Summary</div>
            <div className="text-xs text-muted-foreground space-y-1">
              {filters.specialty.length > 0 && (
                <div>Specialties: {filters.specialty.join(', ')}</div>
              )}
              {filters.languages.length > 0 && (
                <div>Languages: {filters.languages.join(', ')}</div>
              )}
              {filters.conditionsTreated.length > 0 && (
                <div>Conditions: {filters.conditionsTreated.join(', ')}</div>
              )}
              {filters.gender && (
                <div>Gender: {filters.gender === 'MALE' ? 'Male' : 'Female'} Doctor</div>
              )}
              {filters.acceptsInsurance && (
                <div>Accepts Insurance</div>
              )}
              {filters.nextAvailable && (
                <div>Next Available Appointment</div>
              )}
              {filters.clinicTypes.length > 0 && (
                <div>Clinic Types: {filters.clinicTypes.join(', ')}</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}