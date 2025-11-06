/**
 * Healthier SG Internationalization Configuration
 * Supports Singapore's 4 official languages: English, Mandarin, Malay, Tamil
 */

export const SUPPORTED_LANGUAGES = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    direction: 'ltr' as const,
    locale: 'en-SG',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: 'h:mm a',
    numberFormat: 'en-SG'
  },
  zh: {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
    direction: 'ltr' as const,
    locale: 'zh-SG',
    dateFormat: 'yyyy年MM月dd日',
    timeFormat: 'ah:mm',
    numberFormat: 'zh-SG'
  },
  ms: {
    code: 'ms',
    name: 'Malay',
    nativeName: 'Bahasa Melayu',
    flag: '🇲🇾',
    direction: 'ltr' as const,
    locale: 'ms-SG',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: 'h:mm a',
    numberFormat: 'ms-SG'
  },
  ta: {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    flag: '🇮🇳',
    direction: 'ltr' as const,
    locale: 'ta-SG',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: 'h:mm a',
    numberFormat: 'ta-SG'
  }
} as const

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES

export interface TranslationContext {
  section: 'common' | 'healthier-sg' | 'clinics' | 'doctors' | 'services' | 'forms' | 'navigation'
  domain: string
  priority: 'low' | 'medium' | 'high'
  lastUpdated: string
}

export interface CulturalContext {
  culturalGroup: 'chinese' | 'malay' | 'indian' | 'mixed' | 'western'
  dietaryRestrictions: string[]
  religiousConsiderations: string[]
  healthBeliefs: string[]
  familyStructure: 'nuclear' | 'extended' | 'multi-generational'
}

export const CULTURAL_CONFIGS = {
  chinese: {
    colorPreferences: ['red', 'gold', 'green'], // Lucky colors
    numberPreferences: [8, 6, 9], // Lucky numbers
    avoidNumbers: [4], // Unlucky number
    dietaryConsiders: ['halal', 'vegetarian', 'seafood', 'no-pork', 'no-beef'],
    healthApproaches: ['traditional-medicine', 'holistic', 'preventive'],
    familyHierarchy: 'vertical' as const,
    communicationStyle: 'indirect' as const
  },
  malay: {
    colorPreferences: ['green', 'white', 'blue'], // Traditional colors
    numberPreferences: [7, 3, 1],
    avoidNumbers: [4],
    dietaryConsiders: ['halal', 'no-pork', 'no-alcohol', 'spicy-acceptable'],
    healthApproaches: ['halal-medicine', 'natural-remedies', 'community-support'],
    familyHierarchy: 'horizontal' as const,
    communicationStyle: 'direct' as const
  },
  indian: {
    colorPreferences: ['orange', 'yellow', 'white'], // Traditional colors
    numberPreferences: [8, 1, 3, 9],
    avoidNumbers: [0],
    dietaryConsiders: ['vegetarian', 'no-beef', 'no-pork', 'spicy-essential', 'halal'],
    healthApproaches: ['ayurveda', 'natural-remedies', 'holistic'],
    familyHierarchy: 'vertical' as const,
    communicationStyle: 'direct' as const
  },
  mixed: {
    colorPreferences: ['blue', 'green', 'white'],
    numberPreferences: [5, 7, 3],
    avoidNumbers: [],
    dietaryConsiders: ['flexible', 'varied-preferences'],
    healthApproaches: ['western-medicine', 'integrative', 'evidence-based'],
    familyHierarchy: 'horizontal' as const,
    communicationStyle: 'direct' as const
  },
  western: {
    colorPreferences: ['blue', 'green', 'white'],
    numberPreferences: [7, 3, 9],
    avoidNumbers: [],
    dietaryConsiders: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free'],
    healthApproaches: ['evidence-based', 'preventive', 'wellness-focused'],
    familyHierarchy: 'horizontal' as const,
    communicationStyle: 'direct' as const
  }
} as const

export const DEFAULT_CULTURAL_CONTEXT: CulturalContext = {
  culturalGroup: 'mixed',
  dietaryRestrictions: [],
  religiousConsiderations: [],
  healthBeliefs: [],
  familyStructure: 'nuclear'
}

// Healthcare-specific translation contexts
export const HEALTHCARE_TRANSLATION_CONTEXTS = {
  symptoms: {
    section: 'common' as const,
    domain: 'healthcare-symptoms',
    priority: 'high' as const,
    lastUpdated: '2025-01-01'
  },
  procedures: {
    section: 'services' as const,
    domain: 'healthcare-procedures',
    priority: 'high' as const,
    lastUpdated: '2025-01-01'
  },
  medications: {
    section: 'common' as const,
    domain: 'healthcare-medications',
    priority: 'high' as const,
    lastUpdated: '2025-01-01'
  },
  eligibility: {
    section: 'healthier-sg' as const,
    domain: 'healthier-sg-eligibility',
    priority: 'high' as const,
    lastUpdated: '2025-01-01'
  },
  appointments: {
    section: 'forms' as const,
    domain: 'appointment-booking',
    priority: 'medium' as const,
    lastUpdated: '2025-01-01'
  }
} as const

// Translation quality levels
export const TRANSLATION_QUALITY_LEVELS = {
  MACHINE_TRANSLATED: {
    level: 'machine',
    accuracy: 70,
    culturalAdaptation: false,
    requiresReview: true
  },
  PROFESSIONALLY_TRANSLATED: {
    level: 'professional',
    accuracy: 95,
    culturalAdaptation: true,
    requiresReview: true
  },
  MEDICALLY_REVIEWED: {
    level: 'medical-review',
    accuracy: 98,
    culturalAdaptation: true,
    requiresReview: false
  }
} as const

export type TranslationQuality = keyof typeof TRANSLATION_QUALITY_LEVELS