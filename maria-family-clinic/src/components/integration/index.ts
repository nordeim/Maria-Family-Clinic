/**
 * Integration Components Index
 * 
 * This file exports all Healthier SG integration components that seamlessly connect
 * the Healthier SG program with existing My Family Clinic features from Phases 1-7.
 */

// Integration Dashboard Components
export { HealthierSGIntegrationPanel } from './HealthierSGIntegrationPanel'
export type { 
  IntegrationPanelProps,
  IntegrationData,
  UserStats,
  HealthGoals,
  AppointmentInfo,
  NotificationInfo
} from './HealthierSGIntegrationPanel'

export { UnifiedHealthDashboard } from './UnifiedHealthDashboard'
export type {
  UnifiedDashboardProps,
  HealthMetrics,
  UnifiedAppointment,
  GoalProgress,
  ProgramData,
  HealthRecommendations
} from './UnifiedHealthDashboard'

// Clinic Integration Components
export { ProgramClinicCard } from './ProgramClinicCard'
export type {
  ProgramClinicCardProps,
  ClinicParticipationInfo,
  ServiceCapacityInfo,
  ProgramBadge,
  ClinicBookingInfo
} from './ProgramClinicCard'

// Doctor Integration Components
export { HealthierSGDoctorBadge } from './HealthierSGDoctorBadge'
export type {
  DoctorBadgeProps,
  ProgramCertification,
  BadgeVariant,
  CertificationLevel,
  SpecializationInfo
} from './HealthierSGDoctorBadge'

// Service Integration Components
export { ProgramServiceTag } from './ProgramServiceTag'
export type {
  ServiceTagProps,
  CoverageInfo,
  BenefitInfo,
  EligibilityInfo,
  ProgramServiceDetails
} from './ProgramServiceTag'

// Navigation and UI Components
export { HealthierSGNavigation } from './HealthierSGNavigation'
export type {
  NavigationProps,
  NavigationItem,
  SubNavigationItem,
  ProgramSection
} from './HealthierSGNavigation'

export { ProgramNotificationCenter } from './ProgramNotificationCenter'
export type {
  NotificationCenterProps,
  IntegratedNotification,
  NotificationFilter,
  NotificationPreferences
} from './ProgramNotificationCenter'

// Component Composition Utilities
export {
  createIntegratedClinicList,
  createIntegratedDoctorList,
  createIntegratedServiceList,
  createUnifiedDashboardLayout
} from './component-utils'

// Type definitions for integration
export interface IntegrationConfig {
  enableHealthierSG: boolean
  enableProgramBadges: boolean
  enableCoverageDisplay: boolean
  enableProgramFiltering: boolean
  enableUnifiedSearch: boolean
}

export interface IntegrationState {
  isLoading: boolean
  error: string | null
  data: {
    clinics: any[]
    doctors: any[]
    services: any[]
    userProfile: any
  }
}

// Component variant types for consistent styling
export type CardVariant = 'default' | 'featured' | 'compact' | 'detailed'
export type BadgeVariant = 'success' | 'info' | 'warning' | 'premium' | 'certified'
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost'
export type NotificationVariant = 'info' | 'success' | 'warning' | 'error'

// Integration hook types
export interface UseIntegrationOptions {
  autoFetch?: boolean
  enableCaching?: boolean
  cacheTimeout?: number
  retries?: number
}

export interface IntegrationContextType {
  isHealthierSGEnabled: boolean
  userEnrollmentStatus: 'enrolled' | 'not_enrolled' | 'pending' | 'unknown'
  programPreferences: any
  healthGoals: string[]
  currentConditions: string[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

// Export all types for external use
export type {
  // Clinic types
  Clinic,
  ClinicParticipation,
  
  // Doctor types
  Doctor,
  DoctorParticipation,
  CertificationLevel,
  
  // Service types
  Service,
  ServiceCoverage,
  CoverageType,
  
  // User types
  UserProfile,
  UserParticipation,
  HealthGoal
} from '@prisma/client'

// Default export for convenience
export { HealthierSGIntegrationPanel as default } from './HealthierSGIntegrationPanel'