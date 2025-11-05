// UX System Type Definitions for My Family Clinic
// Healthcare-specific UX types with mobile-first optimization

export interface MicroInteractionConfig {
  id: string;
  type: 'hover' | 'click' | 'focus' | 'loading' | 'success' | 'error' | 'transition';
  duration: number;
  easing: string;
  disabled?: boolean;
  healthcareContext?: 'appointment' | 'medical-info' | 'emergency' | 'insurance';
  hapticFeedback?: boolean;
  voiceAnnouncement?: string;
}

export interface TrustIndicator {
  id: string;
  type: 'moh-verified' | 'medical-accreditation' | 'insurance-accepted' | 'patient-reviews' | 'quality-certification';
  title: string;
  description: string;
  icon: string;
  verified: boolean;
  dateVerified?: string;
  authority?: string;
  badgeColor: 'green' | 'blue' | 'orange' | 'purple';
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
  skeleton?: boolean;
  estimatedTime?: number;
  healthcareContext?: 'booking' | 'verification' | 'search' | 'payment';
}

export interface FormValidation {
  field: string;
  isValid: boolean;
  errorMessage?: string;
  suggestions?: string[];
  medicalTerminology?: boolean;
  culturalSensitivity?: boolean;
  recoveryActions?: string[];
}

export interface PersonalizationData {
  userType: 'patient' | 'clinic-staff' | 'doctor' | 'admin';
  medicalHistory?: string[];
  preferredLanguage: 'en' | 'zh' | 'ms' | 'ta';
  culturalPreferences?: string[];
  accessibilityNeeds?: string[];
  deviceType: 'mobile' | 'tablet' | 'desktop';
  healthGoals?: string[];
  appointmentHistory?: string[];
  insuranceProvider?: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

export interface AIRecommendation {
  id: string;
  type: 'clinic' | 'doctor' | 'service' | 'health-goal' | 'appointment';
  title: string;
  description: string;
  confidence: number;
  reasoning: string[];
  context: {
    medicalCondition?: string;
    location?: string;
    insurance?: string;
    preferences?: string[];
  };
  actions: {
    primary: string;
    secondary?: string[];
  };
}

export interface HealthcareWorkflowStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
  estimatedTime: number;
  medicalContext?: string;
  prerequisites?: string[];
  nextSteps?: string[];
}

export interface VoiceNavigationConfig {
  enabled: boolean;
  commands: string[];
  medicalTerms?: boolean;
  language: 'en' | 'zh' | 'ms' | 'ta';
  accessibilityMode: boolean;
}

export interface MobileOptimizationConfig {
  touchTargetSize: number; // Minimum 44px for healthcare elements
  swipeGestures: {
    enabled: boolean;
    patterns: ('left' | 'right' | 'up' | 'down')[];
  };
  hapticFeedback: {
    enabled: boolean;
    intensity: 'light' | 'medium' | 'strong';
    medicalContexts: string[];
  };
  offlineMode: {
    enabled: boolean;
    cachedFeatures: string[];
    syncQueue: boolean;
  };
}

export interface HealthGoal {
  id: string;
  title: string;
  description: string;
  category: 'preventive' | 'chronic-care' | 'mental-health' | 'fitness' | 'nutrition';
  progress: number;
  target: number;
  unit: string;
  deadline?: string;
  reminders: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time?: string;
    message: string;
  }[];
  medicalRelevance: string[];
  incentives?: {
    type: 'badges' | 'points' | 'rewards';
    description: string;
  }[];
}

export interface EmergencyUXConfig {
  immediateCareThreshold: number; // minutes for emergency response
  urgentCareThreshold: number; // minutes for urgent care
  emergencyContacts: {
    type: 'police' | 'ambulance' | 'fire' | 'hospital';
    number: string;
    description: string;
  }[];
  gpsIntegration: boolean;
  autoCall: boolean;
  accessibilityEmergencyMode: boolean;
}

export interface InsuranceUXConfig {
  realTimeVerification: boolean;
  coverageIndicators: boolean;
  transparentPricing: boolean;
  paymentOptimization: boolean;
  supportedProviders: string[];
  medisaveIntegration: boolean;
  medishieldIntegration: boolean;
}

export interface HealthLiteracySupport {
  enabled: boolean;
  patientFriendlyLanguage: boolean;
  medicalTermExplanations: boolean;
  progressiveDisclosure: boolean;
  culturalSensitivity: boolean;
  multilingualSupport: boolean;
  accessibilityCompliance: boolean;
  healthEducationContent: boolean;
}

export interface AnimationConfig {
  duration: {
    quick: number;
    standard: number;
    slow: number;
    loading: number;
  };
  easing: {
    easeOut: string;
    easeIn: string;
    easeInOut: string;
    bounce: string;
    spring: string;
  };
  healthcareContexts: {
    appointment: {
      success: string;
      loading: string;
      error: string;
    };
    medical: {
      information: string;
      urgent: string;
      emergency: string;
    };
  };
}

export interface UXAnalyticsEvent {
  eventType: 'interaction' | 'conversion' | 'error' | 'accessibility';
  component: string;
  action: string;
  context: string;
  metadata?: Record<string, any>;
  timestamp: number;
  userId?: string;
  sessionId: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  healthcareContext?: string;
}

export interface MicroInteractionState {
  isAnimating: boolean;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  progress: number;
  message?: string;
  nextAction?: string;
}

export interface UXContextState {
  personalization: PersonalizationData;
  accessibility: {
    fontSize: number;
    highContrast: boolean;
    reducedMotion: boolean;
    screenReader: boolean;
    voiceNavigation: boolean;
  };
  performance: {
    isSlowConnection: boolean;
    isLowPowerMode: boolean;
    cacheStatus: 'fresh' | 'stale' | 'none';
  };
  medicalContext: {
    currentVisitType?: 'routine' | 'urgent' | 'emergency' | 'follow-up';
    sensitiveInformation: boolean;
    requiresPrivacy: boolean;
  };
}