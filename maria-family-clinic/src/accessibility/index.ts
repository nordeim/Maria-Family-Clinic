/**
 * Accessibility Module Index
 * Comprehensive WCAG 2.2 AA compliance system for My Family Clinic
 * 
 * This module provides:
 * - WCAG 2.2 AA compliance checking and validation
 * - Healthcare-specific accessibility features
 * - Multi-language accessibility (4 Singapore languages)
 * - Cognitive accessibility support
 * - Screen reader optimization
 * - Keyboard navigation system
 * - Voice navigation and control
 * - Automated testing framework
 * - Performance monitoring
 */

export { default as WCAGComplianceChecker } from './framework/ComplianceChecker'

// Healthcare-specific accessibility components
export * from './healthcare/MedicalTerminologyAccessibility'
export * from './healthcare/HealthcareScreenReaderOptimization'

// Navigation and interaction accessibility
export * from './navigation/HealthcareKeyboardNavigation'
export * from './voice/HealthcareVoiceNavigation'

// Multi-language accessibility
export * from './multi-language/HealthcareMultiLanguageAccessibility'

// Cognitive accessibility
export * from './cognitive/HealthcareCognitiveAccessibility'

// Testing and validation framework
export * from './testing/AccessibilityTestRunner'
export * from './testing/AccessibilityValidationFramework'

// Utilities and common components
export * from './utils/AccessibilityUtils'

// Re-export existing accessibility components
export { 
  AccessibilityProvider,
  useAccessibility,
  useVisualAccessibility,
  useAudioAccessibility,
  useKeyboardAccessibility,
  useScreenReaderAccessibility
} from '@/components/accessibility/provider'

export {
  SkipLink,
  useScreenReader,
  ScreenReaderAnnouncements,
  ScreenReaderText,
  useHighContrast,
  FocusVisible,
  useKeyboardNavigation
} from '@/components/accessibility/screen-reader'

export {
  AccessibilitySettings
} from '@/components/accessibility/accessibility-settings'

export {
  AccessibilityTester
} from '@/components/accessibility/accessibility-tester'

export {
  CulturalAdaptation
} from '@/components/accessibility/cultural-adaptation'

export {
  FontSizeAdjuster
} from '@/components/accessibility/font-size-adjuster'

export {
  HighContrastToggle
} from '@/components/accessibility/high-contrast-toggle'

export {
  LanguageSelector
} from '@/components/accessibility/language-selector'

export {
  ScreenReader
} from '@/components/accessibility/screen-reader'

export {
  ScreenReaderAnnouncer
} from '@/components/accessibility/screen-reader-announcer'

export {
  VoiceNavigation
} from '@/components/accessibility/voice-navigation'

// Accessibility hooks and utilities
export { useAccessibilityUtilities } from './utils/AccessibilityUtils'
export { useFocusManagement } from './utils/AccessibilityUtils'
export { useAria } from './utils/AccessibilityUtils'
export { useKeyboard } from './utils/AccessibilityUtils'
export { useScreenReader as useScreenReaderUtils } from './utils/AccessibilityUtils'
export { useAccessibilityPerformance } from './utils/AccessibilityUtils'
export { useAccessibilityTesting } from './utils/AccessibilityUtils'

// Main provider components
export { AccessibilityProvider as MainAccessibilityProvider } from './utils/AccessibilityUtils'
export { HealthcareScreenReaderProvider } from './healthcare/HealthcareScreenReaderOptimization'
export { KeyboardNavigationProvider } from './navigation/HealthcareKeyboardNavigation'
export { VoiceNavigationProvider } from './voice/HealthcareVoiceNavigation'
export { MultiLanguageAccessibilityProvider } from './multi-language/HealthcareMultiLanguageAccessibility'
export { CognitiveAccessibilityProvider } from './cognitive/HealthcareCognitiveAccessibility'

// Main application providers
export { AccessibilityProvider } from '@/components/accessibility/provider'

// Accessibility testing utilities
export { useAccessibilityTesting } from './testing/AccessibilityValidationFramework'

// Medical terminology accessibility
export { 
  MedicalTerminologyManager,
  MedicalTermAccess,
  MedicalGlossary 
} from './healthcare/MedicalTerminologyAccessibility'

// Healthcare screen reader optimization
export { 
  HealthcareScreenReaderManager,
  useHealthcareScreenReader,
  useAppointmentScreenReader,
  useMedicalResultsScreenReader,
  useDoctorInfoScreenReader
} from './healthcare/HealthcareScreenReaderOptimization'

// Keyboard navigation
export { 
  HealthcareKeyboardNavigationManager,
  useKeyboardNavigation,
  useFocusManagement,
  useKeyboardShortcuts
} from './navigation/HealthcareKeyboardNavigation'

// Voice navigation
export { 
  HealthcareVoiceNavigationManager,
  useVoiceNavigation,
  useClinicVoiceSearch,
  useAppointmentVoiceBooking
} from './voice/HealthcareVoiceNavigation'

// Multi-language accessibility
export { 
  MultiLanguageAccessibilityManager,
  useMultiLanguageAccessibility,
  useLanguageSelector,
  useCulturalAdaptation,
  useScreenReaderMultiLanguage,
  AccessibleLanguageSelector,
  CulturalAdaptationIndicator
} from './multi-language/HealthcareMultiLanguageAccessibility'

// Cognitive accessibility
export { 
  CognitiveAccessibilityManager,
  useCognitiveAccessibility,
  useSimplifiedContent,
  useErrorPrevention,
  useStepByStepGuidance,
  CognitiveProfileSelector,
  StepByStepGuide
} from './cognitive/HealthcareCognitiveAccessibility'

// Testing framework
export { 
  AccessibilityTestRunner,
  AccessibilityValidationFramework,
  useAccessibilityTesting 
} from './testing/AccessibilityValidationFramework'

// Common accessibility components
export {
  FocusTrap,
  SkipLink,
  LiveRegion,
  AccessibleButton,
  AccessibleFormField,
  AccessibleModal
} from './utils/AccessibilityUtils'

// Accessibility utilities manager
export { AccessibilityUtilitiesManager } from './utils/AccessibilityUtils'

// Types and interfaces
export type {
  AccessibilityTestResult,
  AccessibilityViolation,
  ComplianceResult,
  AccessibilityTestSuite,
  AccessibilityTest,
  TestResult,
  ManualTestResults,
  UserTestingResults
} from './testing/AccessibilityValidationFramework'

export type {
  MedicalTerm,
  MedicalTermAccessProps
} from './healthcare/MedicalTerminologyAccessibility'

export type {
  ScreenReaderConfig,
  HealthcareAnnouncement,
  ScreenReaderProfile
} from './healthcare/HealthcareScreenReaderOptimization'

export type {
  KeyboardShortcut,
  FocusManager,
  KeyboardNavigationConfig
} from './navigation/HealthcareKeyboardNavigation'

export type {
  VoiceCommand,
  VoiceParameter,
  VoiceRecognitionConfig,
  VoiceFeedbackConfig
} from './voice/HealthcareVoiceNavigation'

export type {
  LanguageConfig,
  AccessibilityLanguageContent,
  CulturalAdaptationSettings,
  ScreenReaderLanguageSupport
} from './multi-language/HealthcareMultiLanguageAccessibility'

export type {
  CognitiveProfile,
  CognitivePreferences,
  CognitiveFeature,
  SimplifiedContent,
  ContentStep,
  ErrorPreventionRule
} from './cognitive/HealthcareCognitiveAccessibility'

export type {
  AccessibilityUtilities,
  FocusManagementUtilities,
  AriaUtilities,
  KeyboardUtilities,
  ScreenReaderUtilities,
  PerformanceUtilities,
  TestingUtilities,
  AccessibilityPerformanceMetrics
} from './utils/AccessibilityUtils'

// Configuration and constants
export const ACCESSIBILITY_CONSTANTS = {
  WCAG_LEVELS: {
    A: 'A',
    AA: 'AA',
    AAA: 'AAA'
  } as const,

  IMPACT_LEVELS: {
    MINOR: 'minor',
    MODERATE: 'moderate',
    SERIOUS: 'serious',
    CRITICAL: 'critical'
  } as const,

  LANGUAGES: {
    ENGLISH: 'en' as const,
    CHINESE: 'zh' as const,
    MALAY: 'ms' as const,
    TAMIL: 'ta' as const
  } as const,

  SCREEN_READERS: {
    NVDA: 'nvda' as const,
    JAWS: 'jaws' as const,
    VOICEOVER: 'voiceover' as const,
    UNKNOWN: 'unknown' as const
  } as const
}

// Accessibility feature flags for conditional rendering
export const ACCESSIBILITY_FEATURES = {
  MEDICAL_TERMINOLOGY: true,
  VOICE_NAVIGATION: 'speechSynthesis' in window && 'SpeechRecognition' in window,
  MULTI_LANGUAGE: true,
  COGNITIVE_ACCESSIBILITY: true,
  AUTOMATED_TESTING: true,
  PERFORMANCE_MONITORING: true,
  HIGH_CONTRAST: true,
  SCREEN_READER_SUPPORT: true,
  KEYBOARD_NAVIGATION: true,
  FOCUS_MANAGEMENT: true
}

// Compliance levels and thresholds
export const COMPLIANCE_THRESHOLDS = {
  WCAG_AA: {
    MINIMUM_SCORE: 85,
    MAX_CRITICAL_VIOLATIONS: 0,
    MAX_TOTAL_VIOLATIONS: 10
  },
  WCAG_AAA: {
    MINIMUM_SCORE: 95,
    MAX_CRITICAL_VIOLATIONS: 0,
    MAX_TOTAL_VIOLATIONS: 5
  },
  HEALTHCARE_SPECIFIC: {
    MINIMUM_SCORE: 90,
    MAX_CRITICAL_VIOLATIONS: 0,
    MAX_TOTAL_VIOLATIONS: 8
  },
  PERFORMANCE: {
    MAX_LOAD_TIME: 3000, // 3 seconds
    MAX_MEMORY_USAGE: 50000000, // 50MB
    MIN_ACCESSIBILITY_SCORE: 90
  }
}

// Default accessibility configurations
export const DEFAULT_CONFIGS = {
  KEYBOARD_NAVIGATION: {
    shortcutsEnabled: true,
    focusIndicatorsVisible: true,
    skipLinksEnabled: true,
    logicalTabOrder: true
  },

  SCREEN_READER: {
    announceHealthcareActions: true,
    announceAppointmentChanges: true,
    verboseMode: false,
    headingNavigationEnabled: true
  },

  MULTI_LANGUAGE: {
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'zh', 'ms', 'ta'],
    culturalAdaptation: true,
    medicalTerminologySupport: true
  },

  COGNITIVE_ACCESSIBILITY: {
    simplifiedLanguage: false,
    stepByStepGuidance: true,
    errorPrevention: true,
    clearNavigation: true
  },

  PERFORMANCE: {
    measureAccessibilityPerformance: true,
    optimizeForAccessibility: true,
    monitorImpact: true
  }
}

// Helper function to check if accessibility features are available
export function checkAccessibilitySupport() {
  return {
    speechSynthesis: 'speechSynthesis' in window,
    speechRecognition: 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window,
    colorContrast: typeof window !== 'undefined' && 'matchMedia' in window,
    focusManagement: typeof document !== 'undefined',
    keyboardNavigation: typeof document !== 'undefined',
    highContrast: typeof window !== 'undefined' && 'matchMedia' in window,
    prefersReducedMotion: typeof window !== 'undefined' && 'matchMedia' in window,
    prefersColorScheme: typeof window !== 'undefined' && 'matchMedia' in window,
    screenReader: typeof window !== 'undefined' && 'navigator' in window
  }
}

// Initialize accessibility system
export async function initializeAccessibility() {
  try {
    // Check browser support
    const support = checkAccessibilitySupport()
    
    if (!support.focusManagement) {
      console.warn('Focus management not supported')
    }

    if (!support.speechSynthesis) {
      console.warn('Speech synthesis not supported')
    }

    // Initialize core managers
    const complianceChecker = WCAGComplianceChecker.getInstance()
    await complianceChecker.initialize?.()

    console.log('Accessibility system initialized successfully')
    
    return {
      success: true,
      support,
      managers: {
        complianceChecker
      }
    }
  } catch (error) {
    console.error('Failed to initialize accessibility system:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      support: checkAccessibilitySupport()
    }
  }
}

// Export accessibility CSS classes (to be implemented)
export const ACCESSIBILITY_CSS = {
  VISUALLY_HIDDEN: 'sr-only',
  FOCUS_VISIBLE: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
  HIGH_CONTRAST: 'high-contrast',
  REDUCED_MOTION: 'reduce-motion',
  LARGE_FONTS: 'text-size-large',
  COGNITIVE_SIMPLIFIED: 'cognitive-simplified-language',
  COGNITIVE_REDUCED_COMPLEXITY: 'cognitive-reduced-complexity',
  LANGUAGE_EN: 'language-en',
  LANGUAGE_ZH: 'language-zh',
  LANGUAGE_MS: 'language-ms',
  LANGUAGE_TA: 'language-ta'
}

// Export utility functions
export function createAccessibilityLogger() {
  return {
    log: (message: string, data?: any) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Accessibility] ${message}`, data)
      }
    },
    warn: (message: string, data?: any) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[Accessibility] ${message}`, data)
      }
    },
    error: (message: string, error?: any) => {
      console.error(`[Accessibility] ${message}`, error)
    }
  }
}

// Main accessibility module version
export const ACCESSIBILITY_MODULE_VERSION = '1.0.0'

// Default export for convenience
export default {
  // Core components
  WCAGComplianceChecker,
  AccessibilityTestRunner,
  AccessibilityValidationFramework,
  
  // Healthcare-specific components
  MedicalTerminologyAccessibility: MedicalTerminologyAccessibility,
  HealthcareScreenReaderOptimization,
  HealthcareKeyboardNavigation,
  HealthcareVoiceNavigation,
  HealthcareMultiLanguageAccessibility,
  HealthcareCognitiveAccessibility,
  
  // Providers
  AccessibilityUtilitiesProvider,
  HealthcareScreenReaderProvider,
  KeyboardNavigationProvider,
  VoiceNavigationProvider,
  MultiLanguageAccessibilityProvider,
  CognitiveAccessibilityProvider,
  
  // Utilities
  AccessibilityUtilitiesManager,
  useAccessibilityUtilities,
  
  // Constants and configurations
  ACCESSIBILITY_CONSTANTS,
  ACCESSIBILITY_FEATURES,
  COMPLIANCE_THRESHOLDS,
  DEFAULT_CONFIGS,
  
  // Functions
  checkAccessibilitySupport,
  initializeAccessibility,
  createAccessibilityLogger
}