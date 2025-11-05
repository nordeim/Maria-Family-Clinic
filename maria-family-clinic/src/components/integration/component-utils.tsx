import React from 'react'
import { ClinicCard } from '@/components/ui/clinic-card'
import { DoctorCard } from '@/components/ui/doctor-card'
import { ServiceCard } from '@/components/ui/service-card'
import { ProgramClinicCard } from './ProgramClinicCard'
import { HealthierSGDoctorBadge } from './HealthierSGDoctorBadge'
import { ProgramServiceTag } from './ProgramServiceTag'
import type { 
  ProgramClinicCardProps,
  DoctorBadgeProps,
  ServiceTagProps
} from './index'

/**
 * Component Utilities for Healthier SG Integration
 * 
 * These utility functions help create integrated component compositions
 * that seamlessly blend Healthier SG program features with existing
 * My Family Clinic components from Phases 1-7.
 */

/**
 * Create an integrated clinic list that combines regular clinic cards
 * with Healthier SG enhanced clinic cards based on user enrollment
 */
export function createIntegratedClinicList(
  clinics: any[],
  options: {
    showProgramBadges?: boolean
    userEnrolled?: boolean
    compactView?: boolean
    onClinicSelect?: (clinic: any) => void
    onProgramEnrollment?: (clinicId: string) => void
  } = {}
) {
  const { 
    showProgramBadges = true, 
    userEnrolled = false, 
    compactView = false,
    onClinicSelect,
    onProgramEnrollment 
  } = options

  return clinics.map(clinic => {
    const isProgramParticipating = clinic.isHealthierSGParticipating || 
      (clinic.clinicParticipation && clinic.clinicParticipation.length > 0)

    if (showProgramBadges && isProgramParticipating && userEnrolled) {
      // Use enhanced ProgramClinicCard for Healthier SG participating clinics
      const programClinicProps: ProgramClinicCardProps = {
        clinic,
        showProgramBadges: true,
        showCapacity: true,
        showBooking: true,
        onSelect: onClinicSelect,
        onProgramEnrollment,
        compact: compactView,
        enrollmentStatus: 'eligible',
      }
      return React.createElement(ProgramClinicCard, {
        key: clinic.id,
        ...programClinicProps
      })
    } else {
      // Use regular clinic card for non-participating clinics
      return React.createElement(ClinicCard, {
        key: clinic.id,
        clinic,
        onSelect: onClinicSelect,
        compact: compactView
      })
    }
  })
}

/**
 * Create an integrated doctor list that combines regular doctor cards
 * with Healthier SG doctor badges based on program certifications
 */
export function createIntegratedDoctorList(
  doctors: any[],
  options: {
    showProgramBadges?: boolean
    showCertifications?: boolean
    onDoctorSelect?: (doctor: any) => void
  } = {}
) {
  const { 
    showProgramBadges = true, 
    showCertifications = true,
    onDoctorSelect 
  } = options

  return doctors.map(doctor => {
    const hasProgramCertifications = doctor.doctorParticipation && 
      doctor.doctorParticipation.length > 0

    if (showProgramBadges && hasProgramCertifications && showCertifications) {
      // Create enhanced doctor card with program badges
      return React.createElement('div', {
        key: doctor.id,
        className: 'space-y-2'
      }, [
        React.createElement(DoctorCard, {
          key: 'card',
          doctor,
          onSelect: onDoctorSelect
        }),
        React.createElement(HealthierSGDoctorBadge, {
          key: 'badges',
          doctor,
          showCertifications: true,
          variant: 'compact'
        } as DoctorBadgeProps)
      ])
    } else {
      // Use regular doctor card
      return React.createElement(DoctorCard, {
        key: doctor.id,
        doctor,
        onSelect: onDoctorSelect
      })
    }
  })
}

/**
 * Create an integrated service list that combines regular service cards
 * with Healthier SG coverage information
 */
export function createIntegratedServiceList(
  services: any[],
  options: {
    showCoverage?: boolean
    userEnrolled?: boolean
    onServiceSelect?: (service: any) => void
    onCoverageInquiry?: (serviceId: string) => void
  } = {}
) {
  const { 
    showCoverage = true, 
    userEnrolled = false,
    onServiceSelect,
    onCoverageInquiry 
  } = options

  return services.map(service => {
    const hasCoverage = service.isHealthierSGCovered || 
      (service.coverageInfo && service.coverageInfo.length > 0)

    if (showCoverage && hasCoverage && userEnrolled) {
      // Use enhanced service card with coverage tags
      const serviceTagProps: ServiceTagProps = {
        service,
        showCoverage: true,
        showBenefits: true,
        onSelect: onServiceSelect,
        onCoverageInquiry,
        compact: false,
      }
      return React.createElement('div', {
        key: service.id,
        className: 'space-y-2'
      }, [
        React.createElement(ServiceCard, {
          key: 'card',
          service,
          onSelect: onServiceSelect
        }),
        React.createElement(ProgramServiceTag, {
          key: 'tag',
          ...serviceTagProps
        })
      ])
    } else {
      // Use regular service card
      return React.createElement(ServiceCard, {
        key: service.id,
        service,
        onSelect: onServiceSelect
      })
    }
  })
}

/**
 * Create a unified dashboard layout that combines general health data
 * with Healthier SG program data
 */
export function createUnifiedDashboardLayout(
  data: {
    generalHealth: any
    programData: any
    upcomingAppointments: any[]
    healthGoals: any[]
  },
  options: {
    showProgramOverview?: boolean
    showHealthMetrics?: boolean
    showGoalProgress?: boolean
  } = {}
) {
  const { 
    showProgramOverview = true,
    showHealthMetrics = true,
    showGoalProgress = true 
  } = options

  return {
    sections: [
      // Health metrics section
      ...(showHealthMetrics ? [{
        id: 'health-metrics',
        title: 'Health Overview',
        component: 'health-metrics'
      }] : []),
      
      // Program overview section
      ...(showProgramOverview ? [{
        id: 'program-overview',
        title: 'Healthier SG Program',
        component: 'program-overview'
      }] : []),
      
      // Appointments section
      {
        id: 'appointments',
        title: 'Upcoming Appointments',
        component: 'appointments',
        data: data.upcomingAppointments
      },
      
      // Goal progress section
      ...(showGoalProgress ? [{
        id: 'goal-progress',
        title: 'Health Goals',
        component: 'goal-progress',
        data: data.healthGoals
      }] : []),
    ],
    layout: 'dashboard'
  }
}

/**
 * Utility function to determine if a component should show program features
 */
export function shouldShowProgramFeatures(
  userProfile: any,
  options: {
    requireEnrollment?: boolean
    showToAll?: boolean
  } = {}
): boolean {
  const { requireEnrollment = true, showToAll = false } = options
  
  if (showToAll) return true
  
  if (requireEnrollment) {
    return userProfile?.healthierSgEnrolled === true
  }
  
  return true
}

/**
 * Utility function to get the appropriate card variant based on program status
 */
export function getCardVariant(
  hasProgramParticipation: boolean,
  userEnrolled: boolean,
  baseVariant: 'default' | 'featured' | 'compact' = 'default'
): 'default' | 'featured' | 'compact' {
  if (hasProgramParticipation && userEnrolled) {
    return 'featured' // Highlight program-participating items
  }
  return baseVariant
}

/**
 * Utility function to format program benefits for display
 */
export function formatProgramBenefits(
  benefits: any[],
  format: 'bullet' | 'comma' | 'list' = 'bullet'
): string {
  if (!benefits || benefits.length === 0) return ''
  
  switch (format) {
    case 'bullet':
      return benefits.map(benefit => `• ${benefit}`).join('\n')
    case 'comma':
      return benefits.join(', ')
    case 'list':
      return benefits.join('\n')
    default:
      return benefits.join(', ')
  }
}

/**
 * Utility function to calculate program savings
 */
export function calculateProgramSavings(
  originalPrice: number,
  coveragePercentage: number,
  copayAmount: number = 0
): {
  savings: number
  patientCost: number
  totalCoverage: number
  isFullyCovered: boolean
} {
  const coverageAmount = originalPrice * (coveragePercentage / 100)
  const patientCost = Math.max(0, originalPrice - coverageAmount - copayAmount)
  const savings = originalPrice - patientCost
  const totalCoverage = coverageAmount + copayAmount
  
  return {
    savings,
    patientCost,
    totalCoverage,
    isFullyCovered: patientCost === 0
  }
}

/**
 * Utility function to get recommendation priority color
 */
export function getRecommendationPriorityColor(
  priority: 'high' | 'medium' | 'low'
): string {
  switch (priority) {
    case 'high':
      return 'text-red-600 bg-red-50 border-red-200'
    case 'medium':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case 'low':
      return 'text-green-600 bg-green-50 border-green-200'
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

/**
 * Utility function to check if user is eligible for program
 */
export function checkProgramEligibility(
  userProfile: any,
  eligibilityCriteria: any[]
): {
  isEligible: boolean
  missingCriteria: string[]
  reasons: string[]
} {
  const missingCriteria: string[] = []
  const reasons: string[] = []
  
  // Check enrollment status
  if (!userProfile?.healthierSgEnrolled) {
    missingCriteria.push('Healthier SG enrollment')
    reasons.push('Must be enrolled in Healthier SG program')
  }
  
  // Check age requirements
  const age = userProfile?.age
  if (age && eligibilityCriteria.includes('age_40_plus') && age < 40) {
    missingCriteria.push('Age 40+ requirement')
    reasons.push('Program requires age 40 or above')
  }
  
  // Check medical conditions
  const conditions = userProfile?.currentConditions || []
  const requiredConditions = eligibilityCriteria.filter(c => 
    !c.startsWith('age_') && !c.startsWith('income_') && !c.startsWith('geographic_')
  )
  
  const hasRequiredConditions = requiredConditions.every(condition => 
    conditions.includes(condition)
  )
  
  if (requiredConditions.length > 0 && !hasRequiredConditions) {
    missingCriteria.push('Required medical conditions')
    reasons.push('Must have specific medical conditions for this program')
  }
  
  return {
    isEligible: missingCriteria.length === 0,
    missingCriteria,
    reasons
  }
}

/**
 * Integration state management utilities
 */
export const integrationState = {
  /**
   * Create initial integration state
   */
  createInitial: () => ({
    isLoading: false,
    error: null,
    data: {
      clinics: [],
      doctors: [],
      services: [],
      userProfile: null
    }
  }),
  
  /**
   * Create loading state
   */
  createLoading: (currentState: any) => ({
    ...currentState,
    isLoading: true,
    error: null
  }),
  
  /**
   * Create success state
   */
  createSuccess: (currentState: any, data: any) => ({
    ...currentState,
    isLoading: false,
    error: null,
    data
  }),
  
  /**
   * Create error state
   */
  createError: (currentState: any, error: string) => ({
    ...currentState,
    isLoading: false,
    error
  })
}