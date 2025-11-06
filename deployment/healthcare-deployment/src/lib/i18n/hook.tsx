/**
 * Healthier SG Internationalization Hook
 * Provides language switching, translation management, and cultural adaptation
 */

"use client"

import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react'
import { SUPPORTED_LANGUAGES, type LanguageCode, type CulturalContext, DEFAULT_CULTURAL_CONTEXT, type TranslationContext } from './config'

interface I18nContextType {
  // Language state
  currentLanguage: LanguageCode
  isLoading: boolean
  fallbackLanguage: LanguageCode
  
  // Translation functions
  t: (key: string, params?: Record<string, any>, context?: TranslationContext) => string
  translateWithContext: (key: string, context: TranslationContext, params?: Record<string, any>) => string
  
  // Language management
  setLanguage: (language: LanguageCode) => void
  getLanguageDisplayName: (code?: LanguageCode) => string
  getLanguageNativeName: (code?: LanguageCode) => string
  
  // Cultural context
  culturalContext: CulturalContext
  setCulturalContext: (context: CulturalContext) => void
  
  // Translation quality and validation
  getTranslationQuality: (key: string, language: LanguageCode) => 'machine' | 'professional' | 'medical-review'
  validateTranslation: (key: string, text: string, language: LanguageCode) => Promise<boolean>
  
  // Accessibility helpers
  announceLanguageChange: (oldLang: LanguageCode, newLang: LanguageCode) => void
  
  // Utilities
  formatDate: (date: Date, format?: string) => string
  formatNumber: (number: number, options?: Intl.NumberFormatOptions) => string
  formatCurrency: (amount: number, currency?: string) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

// Translation storage with version control
interface TranslationBundle {
  [language: string]: {
    [key: string]: {
      value: string
      context?: TranslationContext
      quality: 'machine' | 'professional' | 'medical-review'
      version: string
      lastUpdated: string
      reviewedBy?: string
      isApproved: boolean
    }
  }
}

class TranslationManager {
  private translations: TranslationBundle = {}
  private version = '1.0.0'
  
  async loadTranslations(language: LanguageCode): Promise<void> {
    try {
      // Load base translations
      const baseTranslations = await import(`../../content/translations/${language}.json`)
      this.translations[language] = { ...baseTranslations.default }
      
      // Load healthcare-specific translations
      const healthcareTranslations = await import(`../../content/translations/healthcare/${language}.json`)
      this.translations[language] = { ...this.translations[language], ...healthcareTranslations.default }
      
      console.log(`Loaded translations for ${language}`)
    } catch (error) {
      console.warn(`Failed to load translations for ${language}:`, error)
      // Fallback to English if available
      if (language !== 'en' && this.translations['en']) {
        this.translations[language] = { ...this.translations['en'] }
      }
    }
  }
  
  getTranslation(
    key: string, 
    language: LanguageCode, 
    params?: Record<string, any>,
    context?: TranslationContext
  ): string {
    const bundle = this.translations[language] || this.translations['en'] || {}
    const translation = bundle[key]
    
    if (!translation) {
      console.warn(`Translation missing for key: ${key} in ${language}`)
      // Return key with brackets to indicate missing translation
      return `[${key}]`
    }
    
    let value = translation.value
    
    // Apply parameters
    if (params) {
      Object.keys(params).forEach(param => {
        value = value.replace(new RegExp(`{{${param}}}`, 'g'), params[param])
      })
    }
    
    // Apply cultural adaptation if context is provided
    if (context) {
      value = this.applyCulturalAdaptation(value, context, language)
    }
    
    return value
  }
  
  private applyCulturalAdaptation(text: string, context: CulturalContext, language: LanguageCode): string {
    // This is a simplified version - in production, this would be more sophisticated
    // considering cultural nuances, dietary restrictions, health beliefs, etc.
    
    let adaptedText = text
    
    // Apply dietary restrictions
    if (context.dietaryRestrictions.length > 0) {
      adaptedText = this.adaptDietaryReferences(adaptedText, context.dietaryRestrictions, language)
    }
    
    // Apply religious considerations
    if (context.religiousConsiderations.length > 0) {
      adaptedText = this.adaptReligiousReferences(adaptedText, context.religiousConsiderations, language)
    }
    
    return adaptedText
  }
  
  private adaptDietaryReferences(text: string, restrictions: string[], language: LanguageCode): string {
    // Simplified adaptation - replace dietary terms based on restrictions
    let adapted = text
    
    if (restrictions.includes('vegetarian')) {
      adapted = adapted.replace(/pork|beef|chicken|fish/g, (match) => {
        const vegetarianAlternatives: Record<string, Record<string, string>> = {
          en: { pork: 'tofu', beef: 'tempeh', chicken: 'mushroom protein', fish: 'textured vegetable protein' },
          zh: { pork: '豆腐', beef: '豆制品', chicken: '蘑菇蛋白', fish: '植物蛋白' },
          ms: { pork: 'tauhu', beef: 'tempeh', chicken: 'protein kulat', fish: 'protein sayuran' },
          ta: { pork: 'தோழி', beef: 'தேம்பாட்', chicken: 'காளான் புரதம்', fish: 'காய்கறி புரதம்' }
        }
        return vegetarianAlternatives[language]?.[match] || match
      })
    }
    
    if (restrictions.includes('halal')) {
      adapted = adapted.replace(/pork|alcohol/g, (match) => {
        const halalAlternatives: Record<string, Record<string, string>> = {
          en: { pork: 'chicken', alcohol: 'fruit juice' },
          zh: { pork: '鸡肉', alcohol: '果汁' },
          ms: { pork: 'ayam', alcohol: 'jus buah' },
          ta: { pork: 'கோழி', alcohol: 'பழச்சாறு' }
        }
        return halalAlternatives[language]?.[match] || match
      })
    }
    
    return adapted
  }
  
  private adaptReligiousReferences(text: string, considerations: string[], language: LanguageCode): string {
    // Simplified religious adaptation
    let adapted = text
    
    if (considerations.includes('islamic')) {
      // Replace non-Halal imagery with neutral alternatives
      adapted = adapted.replace(/pork|alcohol|liquor/g, (match) => {
        const islamicAlternatives: Record<string, Record<string, string>> = {
          en: { pork: 'poultry', alcohol: 'beverages', liquor: 'drinks' },
          zh: { pork: '家禽', alcohol: '饮料', liquor: '饮品' },
          ms: { pork: 'unggas', alcohol: 'minuman', liquor: 'minuman' },
          ta: { pork: 'பறவை', alcohol: 'பானங்கள்', liquor: 'பானங்கள்' }
        }
        return islamicAlternatives[language]?.[match] || match
      })
    }
    
    return adapted
  }
}

const translationManager = new TranslationManager()

export function I18nProvider({ 
  children, 
  defaultLanguage = 'en' as LanguageCode,
  initialCulturalContext = DEFAULT_CULTURAL_CONTEXT 
}: { 
  children: ReactNode
  defaultLanguage?: LanguageCode
  initialCulturalContext?: CulturalContext 
}) {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(defaultLanguage)
  const [culturalContext, setCulturalContextState] = useState<CulturalContext>(initialCulturalContext)
  const [isLoading, setIsLoading] = useState(true)
  const [translationsLoaded, setTranslationsLoaded] = useState(false)
  
  // Detect user's preferred language on first load
  useEffect(() => {
    const detectLanguage = async () => {
      try {
        // Check localStorage first
        const savedLanguage = localStorage.getItem('healthier-sg-language')
        if (savedLanguage && SUPPORTED_LANGUAGES[savedLanguage as LanguageCode]) {
          setCurrentLanguage(savedLanguage as LanguageCode)
          return
        }
        
        // Check browser language
        const browserLang = navigator.language.split('-')[0] as LanguageCode
        if (SUPPORTED_LANGUAGES[browserLang]) {
          setCurrentLanguage(browserLang)
          return
        }
        
        // Check system preferences
        const systemLang = navigator.language as LanguageCode
        if (SUPPORTED_LANGUAGES[systemLang]) {
          setCurrentLanguage(systemLang)
        }
      } catch (error) {
        console.warn('Failed to detect language preference:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    detectLanguage()
  }, [])
  
  // Load translations when language changes
  useEffect(() => {
    const loadLanguageTranslations = async () => {
      setIsLoading(true)
      try {
        await translationManager.loadTranslations(currentLanguage)
        setTranslationsLoaded(true)
      } catch (error) {
        console.error(`Failed to load translations for ${currentLanguage}:`, error)
      } finally {
        setIsLoading(false)
      }
    }
    
    if (currentLanguage) {
      loadLanguageTranslations()
    }
  }, [currentLanguage])
  
  // Save language preference
  const setLanguage = (language: LanguageCode) => {
    const oldLanguage = currentLanguage
    setCurrentLanguage(language)
    localStorage.setItem('healthier-sg-language', language)
    
    // Announce language change for screen readers
    if (typeof window !== 'undefined') {
      announceLanguageChange(oldLanguage, language)
    }
  }
  
  // Translation function with context support
  const t = (key: string, params?: Record<string, any>, context?: TranslationContext): string => {
    if (!translationsLoaded) {
      return `[Loading...] ${key}`
    }
    return translationManager.getTranslation(key, currentLanguage, params, context)
  }
  
  const translateWithContext = (key: string, context: TranslationContext, params?: Record<string, any>): string => {
    return t(key, params, context)
  }
  
  // Language display helpers
  const getLanguageDisplayName = (code?: LanguageCode): string => {
    const langCode = code || currentLanguage
    return SUPPORTED_LANGUAGES[langCode].name
  }
  
  const getLanguageNativeName = (code?: LanguageCode): string => {
    const langCode = code || currentLanguage
    return SUPPORTED_LANGUAGES[langCode].nativeName
  }
  
  // Cultural context management
  const setCulturalContext = (context: CulturalContext) => {
    setCulturalContextState(context)
    localStorage.setItem('healthier-sg-cultural-context', JSON.stringify(context))
  }
  
  // Load saved cultural context
  useEffect(() => {
    try {
      const savedContext = localStorage.getItem('healthier-sg-cultural-context')
      if (savedContext) {
        const parsedContext = JSON.parse(savedContext)
        setCulturalContextState({ ...DEFAULT_CULTURAL_CONTEXT, ...parsedContext })
      }
    } catch (error) {
      console.warn('Failed to load saved cultural context:', error)
    }
  }, [])
  
  // Translation quality management
  const getTranslationQuality = (key: string, language: LanguageCode) => {
    // This would integrate with your translation management system
    // For now, return a default quality
    return 'professional' as const
  }
  
  const validateTranslation = async (key: string, text: string, language: LanguageCode): Promise<boolean> => {
    // This would validate translation accuracy, especially for medical terms
    // For now, return true
    return true
  }
  
  // Accessibility announcements
  const announceLanguageChange = (oldLang: LanguageCode, newLang: LanguageCode) => {
    if (typeof window !== 'undefined') {
      const announcement = `Language changed from ${SUPPORTED_LANGUAGES[oldLang].name} to ${SUPPORTED_LANGUAGES[newLang].name}`
      
      // Create a custom event for screen readers
      const event = new CustomEvent('language-change-announcement', {
        detail: { announcement, language: newLang }
      })
      window.dispatchEvent(event)
    }
  }
  
  // Formatting utilities
  const formatDate = (date: Date, format?: string): string => {
    const locale = SUPPORTED_LANGUAGES[currentLanguage].locale
    const formatString = format || SUPPORTED_LANGUAGES[currentLanguage].dateFormat
    
    // Use Intl.DateTimeFormat for proper localization
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date)
  }
  
  const formatNumber = (number: number, options?: Intl.NumberFormatOptions): string => {
    const locale = SUPPORTED_LANGUAGES[currentLanguage].locale
    return new Intl.NumberFormat(locale, options).format(number)
  }
  
  const formatCurrency = (amount: number, currency = 'SGD'): string => {
    const locale = SUPPORTED_LANGUAGES[currentLanguage].locale
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency
    }).format(amount)
  }
  
  const contextValue: I18nContextType = useMemo(() => ({
    currentLanguage,
    isLoading,
    fallbackLanguage: 'en',
    t,
    translateWithContext,
    setLanguage,
    getLanguageDisplayName,
    getLanguageNativeName,
    culturalContext,
    setCulturalContext,
    getTranslationQuality,
    validateTranslation,
    announceLanguageChange,
    formatDate,
    formatNumber,
    formatCurrency
  }), [currentLanguage, isLoading, culturalContext, translationsLoaded])
  
  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

// Specialized hooks for specific use cases
export function useTranslation(key: string, params?: Record<string, any>) {
  const { t } = useI18n()
  return t(key, params)
}

export function useLanguage() {
  const { currentLanguage, setLanguage, getLanguageDisplayName, getLanguageNativeName } = useI18n()
  return {
    currentLanguage,
    setLanguage,
    displayName: getLanguageDisplayName(),
    nativeName: getLanguageNativeName()
  }
}

export function useCulturalContext() {
  const { culturalContext, setCulturalContext } = useI18n()
  return {
    culturalContext,
    setCulturalContext
  }
}