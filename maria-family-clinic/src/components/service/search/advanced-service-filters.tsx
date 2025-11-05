'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  X,
  Clock,
  AlertCircle,
  Users,
  Activity,
  Shield,
  Stethoscope,
  Heart,
  Brain,
  Eye,
  Baby,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { 
  SearchFilters, 
  FilterCategory, 
  MedicalSpecialty, 
  ServiceType, 
  UrgencyLevel, 
  ServiceDuration,
  ComplexityLevel,
  PatientType,
  InsuranceType
} from '@/types/search'
import { useState } from 'react'

interface AdvancedServiceFiltersProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  onClearFilters: () => void
  className?: string
}

// Medical specialties configuration
const MEDICAL_SPECIALTIES: Array<{
  id: MedicalSpecialty
  label: string
  icon: React.ReactNode
  commonServices: string[]
}> = [
  {
    id: 'general_practice',
    label: 'General Practice',
    icon: <Stethoscope className="w-4 h-4" />,
    commonServices: ['Primary Care', 'Health Screening', 'Vaccinations']
  },
  {
    id: 'cardiology',
    label: 'Cardiology',
    icon: <Heart className="w-4 h-4" />,
    commonServices: ['Heart Checkup', 'ECG', 'Blood Pressure Management']
  },
  {
    id: 'neurology',
    label: 'Neurology',
    icon: <Brain className="w-4 h-4" />,
    commonServices: ['Headache Assessment', 'Memory Evaluation', 'Neurological Exam']
  },
  {
    id: 'ophthalmology',
    label: 'Ophthalmology',
    icon: <Eye className="w-4 h-4" />,
    commonServices: ['Eye Exam', 'Vision Test', 'Glaucoma Screening']
  },
  {
    id: 'pediatrics',
    label: 'Pediatrics',
    icon: <Baby className="w-4 h-4" />,
    commonServices: ['Child Checkup', 'Vaccinations', 'Growth Monitoring']
  },
  {
    id: 'dermatology',
    label: 'Dermatology',
    icon: <Users className="w-4 h-4" />,
    commonServices: ['Skin Assessment', 'Mole Check', 'Acne Treatment']
  },
  {
    id: 'orthopedics',
    label: 'Orthopedics',
    icon: <Activity className="w-4 h-4" />,
    commonServices: ['Joint Pain', 'Fracture Care', 'Spine Assessment']
  },
  {
    id: 'psychiatry',
    label: 'Psychiatry',
    icon: <Brain className="w-4 h-4" />,
    commonServices: ['Mental Health', 'Depression Screening', 'Anxiety Assessment']
  },
  {
    id: 'gastroenterology',
    label: 'Gastroenterology',
    icon: <Activity className="w-4 h-4" />,
    commonServices: ['Digestive Health', 'Stomach Pain', 'Endoscopy']
  },
  {
    id: 'endocrinology',
    label: 'Endocrinology',
    icon: <Heart className="w-4 h-4" />,
    commonServices: ['Diabetes Care', 'Hormone Assessment', 'Thyroid Check']
  },
  {
    id: 'pulmonology',
    label: 'Pulmonology',
    icon: <Activity className="w-4 h-4" />,
    commonServices: ['Lung Function Test', 'Asthma Care', 'Breathing Problems']
  },
  {
    id: 'rheumatology',
    label: 'Rheumatology',
    icon: <Activity className="w-4 h-4" />,
    commonServices: ['Arthritis Care', 'Joint Inflammation', 'Autoimmune']
  },
  {
    id: 'urology',
    label: 'Urology',
    icon: <Users className="w-4 h-4" />,
    commonServices: ['Urinary Health', 'Prostate Check', 'Kidney Stones']
  },
  {
    id: 'oncology',
    label: 'Oncology',
    icon: <Shield className="w-4 h-4" />,
    commonServices: ['Cancer Screening', 'Tumor Markers', 'Second Opinion']
  },
  {
    id: 'nephrology',
    label: 'Nephrology',
    icon: <Shield className="w-4 h-4" />,
    commonServices: ['Kidney Function', 'Dialysis', 'Hypertension']
  }
]

// Service types
const SERVICE_TYPES: Array<{
  id: ServiceType
  label: string
  description: string
  icon: React.ReactNode
}> = [
  {
    id: 'consultation',
    label: 'Consultation',
    description: 'Medical consultation and assessment',
    icon: <Stethoscope className="w-4 h-4" />
  },
  {
    id: 'procedure',
    label: 'Procedure',
    description: 'Medical procedures and treatments',
    icon: <Activity className="w-4 h-4" />
  },
  {
    id: 'screening',
    label: 'Screening',
    description: 'Health screening and checkups',
    icon: <Shield className="w-4 h-4" />
  },
  {
    id: 'vaccination',
    label: 'Vaccination',
    description: 'Vaccines and immunizations',
    icon: <Zap className="w-4 h-4" />
  },
  {
    id: 'therapy',
    label: 'Therapy',
    description: 'Physical and rehabilitation therapy',
    icon: <Activity className="w-4 h-4" />
  },
  {
    id: 'diagnostic',
    label: 'Diagnostic',
    description: 'Tests and diagnostic procedures',
    icon: <Activity className="w-4 h-4" />
  },
  {
    id: 'treatment',
    label: 'Treatment',
    description: 'Treatment and management',
    icon: <Heart className="w-4 h-4" />
  }
]

// Urgency levels
const URGENCY_LEVELS: Array<{
  id: UrgencyLevel
  label: string
  description: string
  color: 'red' | 'orange' | 'blue' | 'green'
  icon: React.ReactNode
}> = [
  {
    id: 'emergency',
    label: 'Emergency',
    description: 'Immediate medical attention required',
    color: 'red',
    icon: <AlertCircle className="w-4 h-4" />
  },
  {
    id: 'urgent',
    label: 'Urgent',
    description: 'Should be seen within 24-48 hours',
    color: 'orange',
    icon: <Clock className="w-4 h-4" />
  },
  {
    id: 'routine',
    label: 'Routine',
    description: 'Regular scheduled appointments',
    color: 'blue',
    icon: <Clock className="w-4 h-4" />
  },
  {
    id: 'preventive',
    label: 'Preventive',
    description: 'Preventive care and wellness',
    color: 'green',
    icon: <Shield className="w-4 h-4" />
  }
]

// Durations
const SERVICE_DURATIONS: Array<{
  id: ServiceDuration
  label: string
  description: string
}> = [
  { id: '15min', label: '15 minutes', description: 'Quick consultation' },
  { id: '30min', label: '30 minutes', description: 'Standard consultation' },
  { id: '1hour', label: '1 hour', description: 'Extended consultation' },
  { id: 'multi_session', label: 'Multi-session', description: 'Multiple appointments' },
  { id: 'half_day', label: 'Half day', description: 'Extended procedure' },
  { id: 'full_day', label: 'Full day', description: 'Comprehensive assessment' }
]

// Complexity levels
const COMPLEXITY_LEVELS: Array<{
  id: ComplexityLevel
  label: string
  description: string
  color: string
}> = [
  { id: 'simple', label: 'Simple', description: 'Basic procedures', color: 'green' },
  { id: 'moderate', label: 'Moderate', description: 'Intermediate complexity', color: 'blue' },
  { id: 'complex', label: 'Complex', description: 'Advanced procedures', color: 'orange' },
  { id: 'specialized', label: 'Specialized', description: 'Highly specialized', color: 'red' }
]

// Patient types
const PATIENT_TYPES: Array<{
  id: PatientType
  label: string
  description: string
  icon: React.ReactNode
}> = [
  {
    id: 'adult',
    label: 'Adult',
    description: 'General adult healthcare',
    icon: <Users className="w-4 h-4" />
  },
  {
    id: 'pediatric',
    label: 'Pediatric',
    description: 'Children and adolescents',
    icon: <Baby className="w-4 h-4" />
  },
  {
    id: 'geriatric',
    label: 'Geriatric',
    description: 'Elderly patients',
    icon: <Users className="w-4 h-4" />
  },
  {
    id: 'womens_health',
    label: 'Women\'s Health',
    description: 'Gynecological and reproductive health',
    icon: <Heart className="w-4 h-4" />
  },
  {
    id: 'mental_health',
    label: 'Mental Health',
    description: 'Psychiatric and psychological care',
    icon: <Brain className="w-4 h-4" />
  },
  {
    id: 'chronic_care',
    label: 'Chronic Care',
    description: 'Long-term condition management',
    icon: <Heart className="w-4 h-4" />
  }
]

// Insurance types
const INSURANCE_TYPES: Array<{
  id: InsuranceType
  label: string
  description: string
}> = [
  { id: 'medisave', label: 'Medisave', description: 'CPF Medisave account' },
  { id: 'medishield', label: 'Medishield', description: 'Basic medical insurance' },
  { id: 'private_insurance', label: 'Private Insurance', description: 'Private health insurance' },
  { id: 'cash_only', label: 'Cash Only', description: 'Self-pay patients' }
]

export function AdvancedServiceFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  className
}: AdvancedServiceFiltersProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    specialty: true,
    serviceType: true,
    urgency: true,
    duration: false,
    complexity: false,
    patientType: false,
    insurance: false
  })

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const getSelectedCount = () => {
    let count = 0
    if (filters.services?.length) count += filters.services.length
    if (filters.serviceTypes?.length) count += filters.serviceTypes.length
    if (filters.urgency?.length) count += filters.urgency.length
    if (filters.duration?.length) count += filters.duration.length
    if (filters.complexity?.length) count += filters.complexity.length
    if (filters.patientTypes?.length) count += filters.patientTypes.length
    if (filters.insurance?.length) count += filters.insurance.length
    return count
  }

  const selectedCount = getSelectedCount()

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Service Filters</CardTitle>
          <div className="flex items-center space-x-2">
            {selectedCount > 0 && (
              <Badge variant="secondary" className="text-sm">
                {selectedCount} active
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-xs"
            >
              <X className="w-3 h-3 mr-1" />
              Clear All
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Medical Specialties */}
        <Collapsible
          open={openSections.specialty}
          onOpenChange={() => toggleSection('specialty')}
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded-md">
            <div className="flex items-center space-x-2">
              <Stethoscope className="w-4 h-4" />
              <span className="font-medium">Medical Specialties</span>
              {filters.services?.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {filters.services.length}
                </Badge>
              )}
            </div>
            {openSections.specialty ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <div className="space-y-2">
              {MEDICAL_SPECIALTIES.map((specialty) => (
                <div key={specialty.id} className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={specialty.id}
                      checked={filters.services?.includes(specialty.id) || false}
                      onCheckedChange={(checked) => {
                        const current = filters.services || []
                        if (checked) {
                          updateFilter('services', [...current, specialty.id])
                        } else {
                          updateFilter('services', current.filter(id => id !== specialty.id))
                        }
                      }}
                    />
                    <Label htmlFor={specialty.id} className="flex items-center space-x-2 cursor-pointer">
                      {specialty.icon}
                      <span className="text-sm font-medium">{specialty.label}</span>
                    </Label>
                  </div>
                  <div className="ml-6 text-xs text-gray-500">
                    {specialty.commonServices.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Service Types */}
        <Collapsible
          open={openSections.serviceType}
          onOpenChange={() => toggleSection('serviceType')}
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded-md">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span className="font-medium">Service Type</span>
              {filters.serviceTypes?.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {filters.serviceTypes.length}
                </Badge>
              )}
            </div>
            {openSections.serviceType ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <div className="space-y-2">
              {SERVICE_TYPES.map((type) => (
                <div key={type.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={type.id}
                    checked={filters.serviceTypes?.includes(type.id) || false}
                    onCheckedChange={(checked) => {
                      const current = filters.serviceTypes || []
                      if (checked) {
                        updateFilter('serviceTypes', [...current, type.id])
                      } else {
                        updateFilter('serviceTypes', current.filter(id => id !== type.id))
                      }
                    }}
                  />
                  <Label htmlFor={type.id} className="flex items-center space-x-2 cursor-pointer">
                    {type.icon}
                    <div>
                      <div className="text-sm font-medium">{type.label}</div>
                      <div className="text-xs text-gray-500">{type.description}</div>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Urgency Level */}
        <Collapsible
          open={openSections.urgency}
          onOpenChange={() => toggleSection('urgency')}
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded-md">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span className="font-medium">Urgency Level</span>
              {filters.urgency?.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {filters.urgency.length}
                </Badge>
              )}
            </div>
            {openSections.urgency ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <RadioGroup
              value={filters.urgency?.[0] || ''}
              onValueChange={(value) => {
                if (value) {
                  updateFilter('urgency', [value as UrgencyLevel])
                } else {
                  updateFilter('urgency', [])
                }
              }}
            >
              {URGENCY_LEVELS.map((urgency) => (
                <div key={urgency.id} className="flex items-center space-x-2">
                  <RadioGroupItem id={urgency.id} value={urgency.id} />
                  <Label htmlFor={urgency.id} className="flex items-center space-x-2 cursor-pointer flex-1">
                    <span className={cn(
                      "w-2 h-2 rounded-full",
                      urgency.color === 'red' && "bg-red-500",
                      urgency.color === 'orange' && "bg-orange-500",
                      urgency.color === 'blue' && "bg-blue-500",
                      urgency.color === 'green' && "bg-green-500"
                    )} />
                    {urgency.icon}
                    <div>
                      <div className="text-sm font-medium">{urgency.label}</div>
                      <div className="text-xs text-gray-500">{urgency.description}</div>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CollapsibleContent>
        </Collapsible>

        {/* Duration */}
        <Collapsible
          open={openSections.duration}
          onOpenChange={() => toggleSection('duration')}
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded-md">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span className="font-medium">Duration</span>
              {filters.duration?.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {filters.duration.length}
                </Badge>
              )}
            </div>
            {openSections.duration ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <div className="space-y-2">
              {SERVICE_DURATIONS.map((duration) => (
                <div key={duration.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={duration.id}
                    checked={filters.duration?.includes(duration.id) || false}
                    onCheckedChange={(checked) => {
                      const current = filters.duration || []
                      if (checked) {
                        updateFilter('duration', [...current, duration.id])
                      } else {
                        updateFilter('duration', current.filter(id => id !== duration.id))
                      }
                    }}
                  />
                  <Label htmlFor={duration.id} className="cursor-pointer flex-1">
                    <div className="text-sm font-medium">{duration.label}</div>
                    <div className="text-xs text-gray-500">{duration.description}</div>
                  </Label>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Complexity Level */}
        <Collapsible
          open={openSections.complexity}
          onOpenChange={() => toggleSection('complexity')}
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded-md">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">Complexity Level</span>
              {filters.complexity?.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {filters.complexity.length}
                </Badge>
              )}
            </div>
            {openSections.complexity ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <div className="space-y-2">
              {COMPLEXITY_LEVELS.map((complexity) => (
                <div key={complexity.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={complexity.id}
                    checked={filters.complexity?.includes(complexity.id) || false}
                    onCheckedChange={(checked) => {
                      const current = filters.complexity || []
                      if (checked) {
                        updateFilter('complexity', [...current, complexity.id])
                      } else {
                        updateFilter('complexity', current.filter(id => id !== complexity.id))
                      }
                    }}
                  />
                  <Label htmlFor={complexity.id} className="cursor-pointer flex-1">
                    <div className="text-sm font-medium">{complexity.label}</div>
                    <div className="text-xs text-gray-500">{complexity.description}</div>
                  </Label>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Patient Type */}
        <Collapsible
          open={openSections.patientType}
          onOpenChange={() => toggleSection('patientType')}
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded-md">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span className="font-medium">Patient Type</span>
              {filters.patientTypes?.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {filters.patientTypes.length}
                </Badge>
              )}
            </div>
            {openSections.patientType ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <div className="space-y-2">
              {PATIENT_TYPES.map((type) => (
                <div key={type.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={type.id}
                    checked={filters.patientTypes?.includes(type.id) || false}
                    onCheckedChange={(checked) => {
                      const current = filters.patientTypes || []
                      if (checked) {
                        updateFilter('patientTypes', [...current, type.id])
                      } else {
                        updateFilter('patientTypes', current.filter(id => id !== type.id))
                      }
                    }}
                  />
                  <Label htmlFor={type.id} className="flex items-center space-x-2 cursor-pointer">
                    {type.icon}
                    <div>
                      <div className="text-sm font-medium">{type.label}</div>
                      <div className="text-xs text-gray-500">{type.description}</div>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Insurance Coverage */}
        <Collapsible
          open={openSections.insurance}
          onOpenChange={() => toggleSection('insurance')}
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded-md">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span className="font-medium">Insurance Coverage</span>
              {filters.insurance?.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {filters.insurance.length}
                </Badge>
              )}
            </div>
            {openSections.insurance ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <div className="space-y-2">
              {INSURANCE_TYPES.map((type) => (
                <div key={type.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={type.id}
                    checked={filters.insurance?.includes(type.id) || false}
                    onCheckedChange={(checked) => {
                      const current = filters.insurance || []
                      if (checked) {
                        updateFilter('insurance', [...current, type.id])
                      } else {
                        updateFilter('insurance', current.filter(id => id !== type.id))
                      }
                    }}
                  />
                  <Label htmlFor={type.id} className="cursor-pointer flex-1">
                    <div className="text-sm font-medium">{type.label}</div>
                    <div className="text-xs text-gray-500">{type.description}</div>
                  </Label>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}