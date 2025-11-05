// UX System Export Index for My Family Clinic Healthcare Platform
// Central export point for all UX components, hooks, and utilities

// Provider and Context
export { UXProvider, useUXContext } from './contexts/UXContext';

// Core Components
export { 
  HealthcareSkeleton,
  HealthcareLoadingSpinner,
  ProgressiveLoading,
} from './components/LoadingStates';

export {
  MicroInteractionWrapper,
  AppointmentCardMicroInteraction,
  MedicalInfoMicroInteraction,
} from './components/MicroInteractions';

export {
  TrustIndicatorBadge,
  TrustIndicatorsContainer,
  MOHVerificationBadge,
  InsuranceAcceptedBadge,
} from './components/TrustIndicators';

export {
  TouchTarget,
  SwipeNavigation,
  VoiceNavigation,
  OfflineManager,
} from './components/MobileOptimizations';

export {
  PersonalizationEngine,
  AIRecommendationCard,
  HealthGoalTracker,
} from './components/PersonalizationAI';

export {
  AppointmentBookingWorkflow,
} from './components/HealthcareWorkflow';

export { UXProvider as default } from './components/UXProvider';

// Hooks
export {
  useMicroInteraction,
  useAccessibility,
  usePerformanceMonitoring,
  useTrustIndicators,
  usePersonalization,
  useVoiceNavigation,
  useOfflineManager,
} from './hooks';

// Types
export type {
  MicroInteractionConfig,
  TrustIndicator,
  LoadingState,
  FormValidation,
  PersonalizationData,
  AIRecommendation,
  HealthcareWorkflowStep,
  VoiceNavigationConfig,
  MobileOptimizationConfig,
  HealthGoal,
  EmergencyUXConfig,
  InsuranceUXConfig,
  HealthLiteracySupport,
  AnimationConfig,
  UXAnalyticsEvent,
  MicroInteractionState,
  UXContextState,
} from './types';

// Utilities
export {
  ANIMATION_CONFIG,
  MOBILE_OPTIMIZATION_CONFIG,
  EMERGENCY_UX_CONFIG,
  INSURANCE_UX_CONFIG,
  HEALTHCARE_ANIMATION_VARIANTS,
  ACCESSIBILITY_UTILS,
  PERFORMANCE_UTILS,
  HEALTHCARE_UTILS,
  STORAGE_UTILS,
  UXUtils,
  cn,
} from './utils';

// Feature flags and configuration
export const UX_FEATURES = {
  MICRO_INTERACTIONS: true,
  TRUST_INDICATORS: true,
  MOBILE_OPTIMIZATION: true,
  PERSONALIZATION: true,
  VOICE_NAVIGATION: true,
  OFFLINE_MODE: true,
  ACCESSIBILITY: true,
  PERFORMANCE_MONITORING: true,
  HEALTH_GOALS: true,
  APPOINTMENT_WORKFLOW: true,
  EMERGENCY_UX: true,
  INSURANCE_INTEGRATION: true,
} as const;

// Healthcare-specific constants
export const HEALTHCARE_CONSTANTS = {
  TOUCH_TARGET_SIZE: 44, // Minimum 44px for accessibility
  ANIMATION_DURATION: {
    QUICK: 150,
    STANDARD: 300,
    SLOW: 500,
    LOADING: 1000,
  },
  EMERGENCY_THRESHOLDS: {
    IMMEDIATE: 15, // 15 minutes
    URGENT: 60, // 1 hour
  },
  SUPPORTED_LANGUAGES: ['en', 'zh', 'ms', 'ta'] as const,
  MEDICAL_URGENCY_LEVELS: ['routine', 'urgent', 'emergency'] as const,
  TRUST_INDICATOR_TYPES: [
    'moh-verified',
    'medical-accreditation',
    'insurance-accepted',
    'patient-reviews',
    'quality-certification',
  ] as const,
} as const;

// Accessibility configuration
export const ACCESSIBILITY_CONFIG = {
  FONT_SIZE: {
    MIN: 12,
    MAX: 24,
    DEFAULT: 16,
  },
  CONTRAST_THRESHOLD: 4.5,
  TOUCH_TARGET_SIZE: 44,
  ANNOUNCEMENT_TIMEOUT: 1000,
} as const;

// Performance configuration
export const PERFORMANCE_CONFIG = {
  CORE_WEB_VITALS_THRESHOLDS: {
    FCP: 1800, // First Contentful Paint
    LCP: 2500, // Largest Contentful Paint
    FID: 100, // First Input Delay
    CLS: 0.1, // Cumulative Layout Shift
  },
  DEBOUNCE_DELAY: 300,
  THROTTLE_LIMIT: 100,
  LAZY_LOADING_THRESHOLD: 50,
} as const;

// Medical context configurations
export const MEDICAL_CONTEXTS = {
  APPOINTMENT: {
    allowedActions: ['book', 'reschedule', 'cancel', 'view'],
    urgencyLevels: ['routine', 'follow-up', 'urgent'],
    workflows: ['booking', 'confirmation', 'reminder', 'follow-up'],
  },
  EMERGENCY: {
    responseTime: 15, // seconds
    escalationLevels: [1, 2, 3, 4],
    autoActions: ['location', 'contact', 'protocol'],
  },
  INSURANCE: {
    verificationDelay: 2000, // ms
    supportedProviders: [
      'AIA', 'Prudential', 'NTUC Income', 'Great Eastern',
      'AXA', 'Manulife', 'Raffles Health Insurance'
    ],
    coverageTypes: ['Medisave', 'MediShield', 'Private Insurance', 'Cash'],
  },
} as const;

// Version and compatibility information
export const UX_SYSTEM_INFO = {
  version: '1.0.0',
  compatibility: {
    react: '>=18.0.0',
    next: '>=13.0.0',
    framerMotion: '>=10.0.0',
    typescript: '>=4.9.0',
  },
  browserSupport: {
    chrome: '>=90',
    firefox: '>=88',
    safari: '>=14',
    edge: '>=90',
  },
  features: {
    webSpeechAPI: 'Voice navigation',
    serviceWorker: 'Offline functionality',
    intersectionObserver: 'Lazy loading',
    performanceObserver: 'Performance monitoring',
    mediaQueries: 'Accessibility preferences',
  },
} as const;

// Helper function for conditional feature usage
export const useFeature = (feature: keyof typeof UX_FEATURES) => {
  return UX_FEATURES[feature];
};

// Helper function to check browser capabilities
export const getBrowserCapabilities = () => {
  if (typeof window === 'undefined') return {};

  return {
    webSpeechAPI: 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window,
    serviceWorker: 'serviceWorker' in navigator,
    intersectionObserver: 'IntersectionObserver' in window,
    performanceObserver: 'PerformanceObserver' in window,
    vibrate: 'vibrate' in navigator,
    localStorage: 'localStorage' in window,
    indexedDB: 'indexedDB' in window,
    touchEvents: 'ontouchstart' in window,
    devicePixelRatio: window.devicePixelRatio,
  };
};

// Export all types for easy importing
export type {
  UXProviderProps,
  EnhancedUXProviderProps,
  VisitTypeStepProps,
  TimeSlotStepProps,
  PatientInfoStepProps,
  InsurancePaymentStepProps,
  ConfirmationStepProps,
} from './components/UXProvider';

export type {
  AppointmentBookingWorkflowProps,
  HealthcareWorkflowStep,
} from './components/HealthcareWorkflow';

export type {
  TouchTargetProps,
  SwipeNavigationProps,
  VoiceNavigationProps,
  OfflineManagerProps,
} from './components/MobileOptimizations';

export type {
  TrustIndicatorBadgeProps,
  TrustIndicatorsContainerProps,
  MOHVerificationBadgeProps,
  InsuranceAcceptedBadgeProps,
} from './components/TrustIndicators';

export type {
  AIRecommendationCardProps,
  HealthGoalTrackerProps,
  PersonalizationEngineProps,
} from './components/PersonalizationAI';

export type {
  HealthcareSkeletonProps,
  HealthcareLoadingSpinnerProps,
  ProgressiveLoadingProps,
} from './components/LoadingStates';

export type {
  MicroInteractionWrapperProps,
  AppointmentCardInteractionProps,
  MedicalInfoMicroInteractionProps,
} from './components/MicroInteractions';