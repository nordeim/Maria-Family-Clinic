// Benefits System Components Export

// Main Dashboard
export { default as BenefitsDashboard } from './BenefitsDashboard'

// Interactive Components
export { default as BenefitsCalculator } from './BenefitsCalculator'
export { default as IncentiveTracker } from './IncentiveTracker'

// Management Components
export { default as ScreeningReminder } from './ScreeningReminder'
export { default as PaymentHistory } from './PaymentHistory'

// Display Components
export { default as BenefitsCard } from './BenefitsCard'
export { default as RewardsGallery } from './RewardsGallery'
export { default as BenefitsFAQ } from './BenefitsFAQ'

// Types
export * from './types'

// Re-export commonly used types
export type {
  BenefitsEligibility,
  IncentiveTracking,
  ScreeningSchedule,
  PaymentTransaction,
  BenefitsHistory,
  BenefitsTier,
  IncentiveCategory,
  IncentiveStatus,
  ScreeningType,
  ScreeningStatus,
  PaymentMethod,
  TransactionType,
  TransactionStatus,
  ChangeType,
  CalculatorInputs,
  BenefitsEstimate,
  MilestoneProgress,
  Achievement,
  ScreeningAppointment,
  ScreeningRecommendation,
  PaymentSummary,
  BenefitsOverview,
  RewardLevel,
  FAQItem,
  ContactMethod,
  BenefitsSummaryResponse,
  BenefitsCalculationResponse,
  BenefitsCardProps,
  IncentiveTrackerProps,
  BenefitsCalculatorProps,
  ScreeningReminderProps,
  PaymentHistoryProps,
  RewardsGalleryProps,
  BenefitsFAQProps,
  HealthGoal,
  HealthProfile,
  ClinicInfo,
  BenefitsError,
  BenefitsConfiguration
} from './types'