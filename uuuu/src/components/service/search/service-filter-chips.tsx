'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, Clock, Star, MapPin, Activity, AlertCircle, Users, Heart, Brain } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SearchFilters, SearchFilterChip } from '@/types/search'

interface ServiceFilterChipsProps {
  filters: SearchFilters
  onFilterRemove: (filterType: string, value: string) => void
  onClearAll: () => void
  className?: string
}

const SPECIALTY_LABELS: Record<string, string> = {
  general_practice: 'General Practice',
  cardiology: 'Cardiology',
  neurology: 'Neurology',
  ophthalmology: 'Ophthalmology',
  pediatrics: 'Pediatrics',
  dermatology: 'Dermatology',
  orthopedics: 'Orthopedics',
  psychiatry: 'Psychiatry',
  gastroenterology: 'Gastroenterology',
  endocrinology: 'Endocrinology',
  pulmonology: 'Pulmonology',
  rheumatology: 'Rheumatology',
  urology: 'Urology',
  oncology: 'Oncology',
  nephrology: 'Nephrology',
  hematology: 'Hematology',
  infectious_disease: 'Infectious Disease',
  immunology: 'Immunology',
  allergy: 'Allergy',
  respiratory: 'Respiratory Medicine',
  anesthesiology: 'Anesthesiology',
  radiology: 'Radiology',
  pathology: 'Pathology',
  emergency_medicine: 'Emergency Medicine',
  family_medicine: 'Family Medicine',
  internal_medicine: 'Internal Medicine',
  general_surgery: 'General Surgery',
  plastic_surgery: 'Plastic Surgery',
  neurosurgery: 'Neurosurgery',
  cardiac_surgery: 'Cardiac Surgery',
  thoracic_surgery: 'Thoracic Surgery',
  vascular_surgery: 'Vascular Surgery',
  colorectal_surgery: 'Colorectal Surgery',
  orthopedic_surgery: 'Orthopedic Surgery',
  urological_surgery: 'Urological Surgery',
  pediatric_surgery: 'Pediatric Surgery',
  gynecologic_surgery: 'Gynecologic Surgery',
  ophthalmic_surgery: 'Ophthalmic Surgery',
  ENT_surgery: 'ENT Surgery'
}

const SERVICE_TYPE_LABELS: Record<string, string> = {
  consultation: 'Consultation',
  procedure: 'Procedure',
  screening: 'Screening',
  vaccination: 'Vaccination',
  therapy: 'Therapy',
  diagnostic: 'Diagnostic',
  treatment: 'Treatment',
  surgery: 'Surgery',
  rehabilitation: 'Rehabilitation',
  preventive_care: 'Preventive Care'
}

const URGENCY_LABELS: Record<string, string> = {
  emergency: 'Emergency',
  urgent: 'Urgent',
  routine: 'Routine',
  preventive: 'Preventive'
}

const DURATION_LABELS: Record<string, string> = {
  '15min': '15 minutes',
  '30min': '30 minutes',
  '1hour': '1 hour',
  multi_session: 'Multi-session',
  half_day: 'Half day',
  full_day: 'Full day'
}

const COMPLEXITY_LABELS: Record<string, string> = {
  simple: 'Simple',
  moderate: 'Moderate',
  complex: 'Complex',
  specialized: 'Specialized'
}

const PATIENT_TYPE_LABELS: Record<string, string> = {
  adult: 'Adult',
  pediatric: 'Pediatric',
  geriatric: 'Geriatric',
  womens_health: 'Women\'s Health',
  mental_health: 'Mental Health',
  chronic_care: 'Chronic Care'
}

const INSURANCE_LABELS: Record<string, string> = {
  medisave: 'Medisave',
  medishield: 'Medishield',
  private_insurance: 'Private Insurance',
  cash_only: 'Cash Only'
}

export function ServiceFilterChips({
  filters,
  onFilterRemove,
  onClearAll,
  className
}: ServiceFilterChipsProps) {
  const chips: SearchFilterChip[] = []

  // Medical specialties
  if (filters.services) {
    filters.services.forEach(service => {
      chips.push({
        id: `service-${service}`,
        type: 'service',
        label: SPECIALTY_LABELS[service] || service,
        value: service,
        icon: <Heart className="w-3 h-3" />,
        color: 'blue'
      })
    })
  }

  // Service types
  if (filters.serviceTypes) {
    filters.serviceTypes.forEach(type => {
      chips.push({
        id: `serviceType-${type}`,
        type: 'serviceType',
        label: SERVICE_TYPE_LABELS[type] || type,
        value: type,
        icon: <Activity className="w-3 h-3" />,
        color: 'green'
      })
    })
  }

  // Urgency levels
  if (filters.urgency) {
    filters.urgency.forEach(urgency => {
      const colors = {
        emergency: 'red' as const,
        urgent: 'orange' as const,
        routine: 'blue' as const,
        preventive: 'green' as const
      }
      
      chips.push({
        id: `urgency-${urgency}`,
        type: 'urgency',
        label: URGENCY_LABELS[urgency] || urgency,
        value: urgency,
        icon: <AlertCircle className="w-3 h-3" />,
        color: colors[urgency] || 'gray'
      })
    })
  }

  // Duration
  if (filters.duration) {
    filters.duration.forEach(duration => {
      chips.push({
        id: `duration-${duration}`,
        type: 'duration',
        label: DURATION_LABELS[duration] || duration,
        value: duration,
        icon: <Clock className="w-3 h-3" />,
        color: 'purple'
      })
    })
  }

  // Complexity
  if (filters.complexity) {
    filters.complexity.forEach(complexity => {
      const colors = {
        simple: 'green' as const,
        moderate: 'blue' as const,
        complex: 'orange' as const,
        specialized: 'red' as const
      }
      
      chips.push({
        id: `complexity-${complexity}`,
        type: 'complexity',
        label: COMPLEXITY_LABELS[complexity] || complexity,
        value: complexity,
        icon: <AlertCircle className="w-3 h-3" />,
        color: colors[complexity] || 'gray'
      })
    })
  }

  // Patient types
  if (filters.patientTypes) {
    filters.patientTypes.forEach(type => {
      const icons = {
        adult: <Users className="w-3 h-3" />,
        pediatric: <Users className="w-3 h-3" />,
        geriatric: <Users className="w-3 h-3" />,
        womens_health: <Heart className="w-3 h-3" />,
        mental_health: <Brain className="w-3 h-3" />,
        chronic_care: <Heart className="w-3 h-3" />
      }
      
      chips.push({
        id: `patientType-${type}`,
        type: 'patientType',
        label: PATIENT_TYPE_LABELS[type] || type,
        value: type,
        icon: icons[type] || <Users className="w-3 h-3" />,
        color: 'indigo'
      })
    })
  }

  // Insurance
  if (filters.insurance) {
    filters.insurance.forEach(insurance => {
      chips.push({
        id: `insurance-${insurance}`,
        type: 'insurance',
        label: INSURANCE_LABELS[insurance] || insurance,
        value: insurance,
        icon: <MapPin className="w-3 h-3" />,
        color: 'emerald'
      })
    })
  }

  // Location
  if (filters.location) {
    chips.push({
      id: 'location',
      type: 'location',
      label: `Within ${filters.location.radiusKm}km`,
      value: `${filters.location.latitude},${filters.location.longitude}`,
      icon: <MapPin className="w-3 h-3" />,
      color: 'red'
    })
  }

  // Rating
  if (filters.rating) {
    const ratingLabel = filters.rating === '4_plus' ? '4+ stars' : 
                       filters.rating === '4_5_plus' ? '4.5+ stars' : 
                       filters.rating === '5_stars' ? '5 stars only' : filters.rating
    
    chips.push({
      id: 'rating',
      type: 'rating',
      label: ratingLabel,
      value: filters.rating,
      icon: <Star className="w-3 h-3" />,
      color: 'yellow'
    })
  }

  if (chips.length === 0) {
    return null
  }

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      gray: 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.gray
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">
          Active Filters ({chips.length})
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="h-auto p-1 text-xs text-gray-500 hover:text-gray-700"
        >
          Clear all
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <Badge
            key={chip.id}
            variant="outline"
            className={cn(
              "inline-flex items-center gap-1 px-3 py-1 text-sm cursor-pointer hover:opacity-80 transition-opacity",
              getColorClasses(chip.color)
            )}
            onClick={() => onFilterRemove(chip.type, chip.value)}
          >
            {chip.icon}
            <span>{chip.label}</span>
            <X className="w-3 h-3 ml-1 hover:text-red-600" />
          </Badge>
        ))}
      </div>
      
      {/* Filter Summary */}
      <div className="text-xs text-gray-500 bg-gray-50 rounded-md p-2">
        <div className="flex items-center justify-between">
          <span>
            Showing results for {chips.length} active filter{chips.length !== 1 ? 's' : ''}
          </span>
          {filters.rankingBy && filters.rankingBy.length > 0 && (
            <span>
              Sorted by: {filters.rankingBy.join(', ')}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}