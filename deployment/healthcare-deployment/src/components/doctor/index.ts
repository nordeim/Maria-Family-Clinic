// Main doctor profile page components
export { DoctorProfileHeader } from './doctor-profile-header'
export { DoctorProfessionalInfo } from './doctor-professional-info'
export { DoctorCredentialsSection } from './doctor-credentials-section'
export { DoctorClinicAffiliations } from './doctor-clinic-affiliations'
export { DoctorPatientInfo } from './doctor-patient-info'
export { DoctorTrustIndicators } from './doctor-trust-indicators'
export { DoctorInteractiveActions } from './doctor-interactive-actions'
export { DoctorReviewsSection } from './doctor-reviews-section'
export { DoctorMobileLayout } from './doctor-mobile-layout'

// Layout components
export { DoctorProfileLayout, DoctorPrintLayout } from './profile-layouts'

// Enhanced Review System Components (Sub-Phase 7.7)
export { 
  EnhancedReviewSystem,
  ReviewSubmission, 
  ReviewDisplay, 
  ReviewModerationDashboard,
  ReviewAnalyticsDashboard,
  DoctorResponseSystem,
  AnonymousReviewSystem
} from './review-system'

// Types
export type { 
  DoctorProfileHeaderProps,
  DoctorProfessionalInfoProps,
  DoctorCredentialsSectionProps,
  DoctorClinicAffiliationsProps,
  DoctorPatientInfoProps,
  DoctorTrustIndicatorsProps,
  DoctorInteractiveActionsProps,
  DoctorReviewsSectionProps,
  DoctorMobileLayoutProps,
  DoctorProfileLayoutProps,
  DoctorPrintLayoutProps
} from './types'

// Review System Types
export type {
  Doctor,
  Review,
  ReviewDimensions,
  RatingDimensions,
  DoctorResponse,
  ReviewAttachment,
  FlagReason,
  CommunityVote,
  TreatmentOutcome,
  PrivateFeedback,
  ReviewAnalytics,
  ModerationQueue,
  ModerationAction,
  ReviewSubmission as ReviewSubmissionData,
  ReviewModerationConfig,
} from './review-system/types'