/**
 * Multi-Language Accessibility System
 * Support for Singapore's 4 official languages with cultural adaptation
 */

"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'

export interface LanguageConfig {
  code: 'en' | 'zh' | 'ms' | 'ta'
  name: string
  nativeName: string
  rtl: boolean
  defaultFont: string
  screenReaderVoice: string
  medicalTerminology: boolean
  culturalAdaptation: boolean
}

export interface AccessibilityLanguageContent {
  [key: string]: {
    en: string
    zh?: string
    ms?: string
    ta?: string
    pronunciation?: {
      zh?: string
      ms?: string
      ta?: string
    }
  }
}

export interface CulturalAdaptationSettings {
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'DD-MMM-YYYY'
  timeFormat: '12h' | '24h'
  numberFormat: '1,234.56' | '1.234,56'
  currencyFormat: 'S$ 1,234.56' | 'S$1,234.56'
  culturalSensitivity: 'high' | 'medium' | 'low'
  healthcareCustoms: boolean
  emergencyInfoPriority: boolean
}

export interface ScreenReaderLanguageSupport {
  currentLanguage: string
  availableVoices: SpeechSynthesisVoice[]
  preferredVoice: SpeechSynthesisVoice | null
  announcementLanguage: string
  pronunciationGuides: boolean
  voiceSpeed: number
  voicePitch: number
}

export class MultiLanguageAccessibilityManager {
  private static instance: MultiLanguageAccessibilityManager
  private currentLanguage: 'en' | 'zh' | 'ms' | 'ta' = 'en'
  private languageConfigs: Map<string, LanguageConfig> = new Map()
  private accessibilityContent: AccessibilityLanguageContent = new Map()
  private culturalSettings: CulturalAdaptationSettings
  private screenReaderSupport: ScreenReaderLanguageSupport
  private languageChangeCallbacks: Map<string, (lang: string) => void> = new Map()

  constructor() {
    this.initializeLanguageConfigs()
    this.initializeCulturalSettings()
    this.initializeScreenReaderSupport()
    this.loadSavedLanguage()
  }

  public static getInstance(): MultiLanguageAccessibilityManager {
    if (!MultiLanguageAccessibilityManager.instance) {
      MultiLanguageAccessibilityManager.instance = new MultiLanguageAccessibilityManager()
    }
    return MultiLanguageAccessibilityManager.instance
  }

  /**
   * Initialize language configurations for Singapore's official languages
   */
  private initializeLanguageConfigs(): void {
    this.languageConfigs.set('en', {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      rtl: false,
      defaultFont: 'system-ui, -apple-system, sans-serif',
      screenReaderVoice: 'en-US',
      medicalTerminology: true,
      culturalAdaptation: true
    })

    this.languageConfigs.set('zh', {
      code: 'zh',
      name: 'Chinese (Simplified)',
      nativeName: '中文',
      rtl: false,
      defaultFont: 'Noto Sans SC, Microsoft YaHei, SimHei, sans-serif',
      screenReaderVoice: 'zh-CN',
      medicalTerminology: true,
      culturalAdaptation: true
    })

    this.languageConfigs.set('ms', {
      code: 'ms',
      name: 'Malay',
      nativeName: 'Melayu',
      rtl: false,
      defaultFont: 'Noto Sans, Arial, sans-serif',
      screenReaderVoice: 'ms-MY',
      medicalTerminology: true,
      culturalAdaptation: true
    })

    this.languageConfigs.set('ta', {
      code: 'ta',
      name: 'Tamil',
      nativeName: 'தமிழ்',
      rtl: false,
      defaultFont: 'Noto Sans Tamil, Tamil Sangam MN, sans-serif',
      screenReaderVoice: 'ta-IN',
      medicalTerminology: true,
      culturalAdaptation: true
    })
  }

  /**
   * Initialize cultural adaptation settings for Singapore
   */
  private initializeCulturalSettings(): void {
    this.culturalSettings = {
      dateFormat: 'DD/MM/YYYY', // Singapore standard
      timeFormat: '24h',
      numberFormat: '1,234.56',
      currencyFormat: 'S$ 1,234.56',
      culturalSensitivity: 'high',
      healthcareCustoms: true,
      emergencyInfoPriority: true
    }
  }

  /**
   * Initialize screen reader language support
   */
  private initializeScreenReaderSupport(): void {
    this.screenReaderSupport = {
      currentLanguage: 'en',
      availableVoices: [],
      preferredVoice: null,
      announcementLanguage: 'en',
      pronunciationGuides: true,
      voiceSpeed: 1.0,
      voicePitch: 1.0
    }

    this.loadVoices()
  }

  /**
   * Load available text-to-speech voices
   */
  private loadVoices(): void {
    if ('speechSynthesis' in window) {
      const updateVoices = () => {
        this.screenReaderSupport.availableVoices = speechSynthesis.getVoices()
        this.updatePreferredVoice()
      }

      updateVoices()
      speechSynthesis.addEventListener('voiceschanged', updateVoices)
    }
  }

  /**
   * Update preferred voice based on current language
   */
  private updatePreferredVoice(): void {
    const config = this.languageConfigs.get(this.currentLanguage)
    if (!config || !this.screenReaderSupport.availableVoices.length) return

    // Find best matching voice for current language
    const matchingVoices = this.screenReaderSupport.availableVoices.filter(voice =>
      voice.lang.startsWith(config.screenReaderVoice.split('-')[0])
    )

    if (matchingVoices.length > 0) {
      // Prefer Singapore/regional voices if available
      const sgVoice = matchingVoices.find(voice => 
        voice.name.includes('Singapore') || 
        voice.name.includes('SG') ||
        voice.lang.includes('SG')
      )
      
      this.screenReaderSupport.preferredVoice = sgVoice || matchingVoices[0]
      this.screenReaderSupport.announcementLanguage = config.screenReaderVoice
    }
  }

  /**
   * Load saved language preference
   */
  private loadSavedLanguage(): void {
    try {
      const saved = localStorage.getItem('my-family-clinic-language')
      if (saved && this.languageConfigs.has(saved)) {
        this.setLanguage(saved as 'en' | 'zh' | 'ms' | 'ta')
      }
    } catch (error) {
      console.warn('Failed to load saved language preference:', error)
    }
  }

  /**
   * Save language preference
   */
  private saveLanguage(): void {
    try {
      localStorage.setItem('my-family-clinic-language', this.currentLanguage)
    } catch (error) {
      console.warn('Failed to save language preference:', error)
    }
  }

  /**
   * Set current language
   */
  setLanguage(language: 'en' | 'zh' | 'ms' | 'ta'): void {
    if (!this.languageConfigs.has(language)) {
      console.warn(`Language ${language} not supported`)
      return
    }

    const previousLanguage = this.currentLanguage
    this.currentLanguage = language

    // Update document language and direction
    this.updateDocumentLanguage(language)

    // Update screen reader support
    this.screenReaderSupport.currentLanguage = language
    this.updatePreferredVoice()

    // Apply cultural adaptations
    this.applyCulturalAdaptations()

    // Save preference
    this.saveLanguage()

    // Notify callbacks
    this.languageChangeCallbacks.forEach(callback => {
      try {
        callback(language)
      } catch (error) {
        console.error('Language change callback error:', error)
      }
    })

    // Announce language change to screen readers
    this.announceLanguageChange(previousLanguage, language)
  }

  /**
   * Get current language
   */
  getCurrentLanguage(): 'en' | 'zh' | 'ms' | 'ta' {
    return this.currentLanguage
  }

  /**
   * Get language configuration
   */
  getLanguageConfig(language?: string): LanguageConfig | null {
    const lang = language || this.currentLanguage
    return this.languageConfigs.get(lang) || null
  }

  /**
   * Update document language and direction
   */
  private updateDocumentLanguage(language: string): void {
    const config = this.languageConfigs.get(language)
    if (!config) return

    // Update HTML lang attribute
    document.documentElement.lang = language
    document.documentElement.dir = config.rtl ? 'rtl' : 'ltr'

    // Update font family
    document.documentElement.style.fontFamily = config.defaultFont

    // Add language class for styling
    document.documentElement.className = document.documentElement.className
      .replace(/language-\w+/g, '')
      .concat(` language-${language}`)
  }

  /**
   * Apply cultural adaptations
   */
  private applyCulturalAdaptations(): void {
    const config = this.languageConfigs.get(this.currentLanguage)
    if (!config || !config.culturalAdaptation) return

    // Apply date format
    this.applyDateFormat()

    // Apply number format
    this.applyNumberFormat()

    // Apply currency format
    this.applyCurrencyFormat()

    // Apply healthcare customs
    this.applyHealthcareCustoms()
  }

  /**
   * Apply Singapore date format
   */
  private applyDateFormat(): void {
    // Update date input formats
    const dateInputs = document.querySelectorAll('input[type="date"], input[data-type="date"]')
    dateInputs.forEach(input => {
      const placeholder = input.getAttribute('placeholder')
      if (placeholder?.includes('YYYY-MM-DD')) {
        input.setAttribute('placeholder', 'DD/MM/YYYY')
      }
    })

    // Update date display formatting
    const dateElements = document.querySelectorAll('[data-date-format]')
    dateElements.forEach(element => {
      element.setAttribute('data-date-format', this.culturalSettings.dateFormat)
    })
  }

  /**
   * Apply number formatting
   */
  private applyNumberFormat(): void {
    const numberInputs = document.querySelectorAll('input[type="number"], input[data-type="number"]')
    numberInputs.forEach(input => {
      // Add formatting attributes
      input.setAttribute('data-number-format', this.culturalSettings.numberFormat)
    })
  }

  /**
   * Apply currency formatting
   */
  private applyCurrencyFormat(): void {
    const currencyElements = document.querySelectorAll('[data-currency], .currency')
    currencyElements.forEach(element => {
      element.setAttribute('data-currency-format', this.culturalSettings.currencyFormat)
    })
  }

  /**
   * Apply healthcare customs
   */
  private applyHealthcareCustoms(): void {
    // Add healthcare-specific cultural markers
    const healthcareElements = document.querySelectorAll('[data-healthcare="true"]')
    healthcareElements.forEach(element => {
      element.setAttribute('data-cultural-context', 'singapore')
      
      // Add MOH references if not present
      if (!element.querySelector('[data-moh-reference]')) {
        const mohRef = document.createElement('span')
        mohRef.setAttribute('data-moh-reference', 'true')
        mohRef.className = 'sr-only'
        mohRef.textContent = this.getLocalizedText('moh_reference')
        element.appendChild(mohRef)
      }
    })
  }

  /**
   * Announce language change to screen readers
   */
  private announceLanguageChange(from: string, to: string): void {
    const fromConfig = this.languageConfigs.get(from)
    const toConfig = this.languageConfigs.get(to)
    
    if (!fromConfig || !toConfig) return

    const announcement = `Language changed from ${fromConfig.name} to ${toConfig.nativeName}`
    this.announceToScreenReader(announcement)
  }

  /**
   * Announce message to screen reader
   */
  private announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const liveRegion = document.createElement('div')
    liveRegion.setAttribute('aria-live', priority)
    liveRegion.setAttribute('aria-atomic', 'true')
    liveRegion.className = 'sr-only'
    liveRegion.textContent = message

    document.body.appendChild(liveRegion)

    // Also use speech synthesis if available
    if (this.screenReaderSupport.preferredVoice && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message)
      utterance.voice = this.screenReaderSupport.preferredVoice
      utterance.lang = this.screenReaderSupport.announcementLanguage
      utterance.rate = this.screenReaderSupport.voiceSpeed
      utterance.pitch = this.screenReaderSupport.voicePitch
      speechSynthesis.speak(utterance)
    }

    setTimeout(() => {
      document.body.removeChild(liveRegion)
    }, 2000)
  }

  /**
   * Get localized text
   */
  getLocalizedText(key: string, fallback?: string): string {
    const content = this.accessibilityContent.get(key)
    if (!content) return fallback || key

    return content[this.currentLanguage] || content.en || fallback || key
  }

  /**
   * Register accessibility content
   */
  registerAccessibilityContent(key: string, content: AccessibilityLanguageContent[keyof AccessibilityLanguageContent]): void {
    this.accessibilityContent.set(key, content)
  }

  /**
   * Register language change callback
   */
  onLanguageChange(callback: (language: string) => void): () => void {
    const id = Math.random().toString(36).substr(2, 9)
    this.languageChangeCallbacks.set(id, callback)
    
    return () => {
      this.languageChangeCallbacks.delete(id)
    }
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): LanguageConfig[] {
    return Array.from(this.languageConfigs.values())
  }

  /**
   * Get cultural settings
   */
  getCulturalSettings(): CulturalAdaptationSettings {
    return { ...this.culturalSettings }
  }

  /**
   * Update cultural settings
   */
  updateCulturalSettings(updates: Partial<CulturalAdaptationSettings>): void {
    this.culturalSettings = { ...this.culturalSettings, ...updates }
    this.applyCulturalAdaptations()
  }

  /**
   * Get screen reader support info
   */
  getScreenReaderSupport(): ScreenReaderLanguageSupport {
    return { ...this.screenReaderSupport }
  }

  /**
   * Update screen reader settings
   */
  updateScreenReaderSettings(updates: Partial<ScreenReaderLanguageSupport>): void {
    this.screenReaderSupport = { ...this.screenReaderSupport, ...updates }
    
    // Apply updates immediately
    if (updates.voiceSpeed || updates.voicePitch) {
      this.updatePreferredVoice()
    }
  }

  /**
   * Get medical terminology in current language
   */
  getMedicalTerminology(term: string): string {
    const medicalTerms: Record<string, Record<string, string>> = {
      'appointment': {
        en: 'Appointment',
        zh: '预约',
        ms: 'Temu janji',
        ta: 'சந்திப்பு'
      },
      'doctor': {
        en: 'Doctor',
        zh: '医生',
        ms: 'Doktor',
        ta: 'மருத்துவர்'
      },
      'clinic': {
        en: 'Clinic',
        zh: '诊所',
        ms: 'Klinik',
        ta: 'சுகாதрудகம்'
      },
      'medicine': {
        en: 'Medicine',
        zh: '药物',
        ms: 'Ubat-ubatan',
        ta: 'மருந்து'
      },
      'health': {
        en: 'Health',
        zh: '健康',
        ms: 'Kesihatan',
        ta: 'ஆரோக்கியம்'
      },
      'emergency': {
        en: 'Emergency',
        zh: '紧急情况',
        ms: 'Kecemasan',
        ta: 'அவசரநிலை'
      }
    }

    return medicalTerms[term]?.[this.currentLanguage] || medicalTerms[term]?.en || term
  }

  /**
   * Get pronunciation guide for term
   */
  getPronunciationGuide(term: string): string | null {
    const pronunciationGuides: Record<string, Record<string, string>> = {
      'appointment': {
        zh: 'yù-yuē',
        ms: 'tuh-moo jahn-jee',
        ta: 'san-thi-p-pum'
      },
      'doctor': {
        zh: 'yī-shēng',
        ms: 'dok-tor',
        ta: 'ma-ru-thu-va-ran'
      },
      'clinic': {
        zh: 'zhěn-suǒ',
        ms: 'kli-nik',
        ta: 'su-ka-ru-dha-kam'
      }
    }

    return pronunciationGuides[term]?.[this.currentLanguage] || null
  }

  /**
   * Initialize accessibility content for common healthcare terms
   */
  initializeHealthcareAccessibilityContent(): void {
    const commonContent: AccessibilityLanguageContent = {
      'language_selector_label': {
        en: 'Select Language',
        zh: '选择语言',
        ms: 'Pilih Bahasa',
        ta: 'மொழியைத் தேர்ந்தெடு'
      },
      'skip_to_main_content': {
        en: 'Skip to main content',
        zh: '跳到主要内容',
        ms: 'Langkau ke kandungan utama',
        ta: 'முக்கிய உள்ளடக்கத்திற்கு செல்லவும்'
      },
      'appointment_booking': {
        en: 'Appointment Booking',
        zh: '预约挂号',
        ms: 'Temu Janji',
        ta: 'சந்திப்பு முன்பதிவு'
      },
      'doctor_search': {
        en: 'Doctor Search',
        zh: '医生搜索',
        ms: 'Carian Doktor',
        ta: 'மருத்துவர் தேடல்'
      },
      'clinic_finder': {
        en: 'Clinic Finder',
        zh: '诊所查找',
        ms: 'Pencari Klinik',
        ta: 'சுகாதрудகம் கண்டுபிடி'
      },
      'moh_reference': {
        en: 'Verified by Singapore Ministry of Health',
        zh: '新加坡卫生部验证',
        ms: 'Disahkan oleh Kementerian Kesihatan Singapura',
        ta: 'சிங்கப்பூர் சுகாதார அமைச்சரால் சரிபார்க்கப்பட்டது'
      },
      'emergency_info': {
        en: 'Emergency Information',
        zh: '紧急信息',
        ms: 'Maklumat Kecemasan',
        ta: 'அவசர தகவல்'
      }
    }

    Object.entries(commonContent).forEach(([key, content]) => {
      this.registerAccessibilityContent(key, content)
    })
  }
}

// Context for multi-language accessibility management
const MultiLanguageAccessibilityContext = createContext<MultiLanguageAccessibilityManager | null>(null)

export function MultiLanguageAccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [manager, setManager] = useState<MultiLanguageAccessibilityManager | null>(null)
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'zh' | 'ms' | 'ta'>('en')

  useEffect(() => {
    const langManager = MultiLanguageAccessibilityManager.getInstance()
    
    // Initialize healthcare content
    langManager.initializeHealthcareAccessibilityContent()
    
    // Set up language change listener
    const unsubscribe = langManager.onLanguageChange((language) => {
      setCurrentLanguage(language as 'en' | 'zh' | 'ms' | 'ta')
    })
    
    setManager(langManager)
    setCurrentLanguage(langManager.getCurrentLanguage())

    return () => {
      unsubscribe()
      setManager(null)
    }
  }, [])

  const changeLanguage = useCallback((language: 'en' | 'zh' | 'ms' | 'ta') => {
    if (manager) {
      manager.setLanguage(language)
    }
  }, [manager])

  return (
    <MultiLanguageAccessibilityContext.Provider value={manager}>
      {children}
      {/* Language indicator for screen readers */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Current language: {manager?.getLanguageConfig()?.nativeName}
      </div>
    </MultiLanguageAccessibilityContext.Provider>
  )
}

export function useMultiLanguageAccessibility() {
  const context = useContext(MultiLanguageAccessibilityContext)
  if (!context) {
    throw new Error('useMultiLanguageAccessibility must be used within MultiLanguageAccessibilityProvider')
  }
  return context
}

// React hooks for different aspects of multi-language accessibility
export function useLanguageSelector() {
  const manager = useMultiLanguageAccessibility()
  const [currentLang, setCurrentLang] = useState<'en' | 'zh' | 'ms' | 'ta'>('en')

  useEffect(() => {
    setCurrentLang(manager.getCurrentLanguage())
    
    const unsubscribe = manager.onLanguageChange((lang) => {
      setCurrentLang(lang as 'en' | 'zh' | 'ms' | 'ta')
    })
    
    return unsubscribe
  }, [manager])

  const supportedLanguages = manager.getSupportedLanguages()

  return {
    currentLanguage: currentLang,
    supportedLanguages,
    changeLanguage: manager.setLanguage.bind(manager),
    getLocalizedText: manager.getLocalizedText.bind(manager)
  }
}

export function useCulturalAdaptation() {
  const manager = useMultiLanguageAccessibility()
  const [settings, setSettings] = useState(manager.getCulturalSettings())

  useEffect(() => {
    setSettings(manager.getCulturalSettings())
  }, [manager])

  const updateSettings = useCallback((updates: Partial<CulturalAdaptationSettings>) => {
    manager.updateCulturalSettings(updates)
    setSettings(manager.getCulturalSettings())
  }, [manager])

  return {
    settings,
    updateSettings,
    getMedicalTerm: manager.getMedicalTerminology.bind(manager),
    getPronunciation: manager.getPronunciationGuide.bind(manager)
  }
}

export function useScreenReaderMultiLanguage() {
  const manager = useMultiLanguageAccessibility()
  const [support, setSupport] = useState(manager.getScreenReaderSupport())

  useEffect(() => {
    setSupport(manager.getScreenReaderSupport())
  }, [manager])

  const updateSupport = useCallback((updates: Partial<ScreenReaderLanguageSupport>) => {
    manager.updateScreenReaderSettings(updates)
    setSupport(manager.getScreenReaderSupport())
  }, [manager])

  return {
    support,
    updateSupport,
    announce: (message: string, priority?: 'polite' | 'assertive') => {
      // This would use the manager's internal announce method
      manager.getScreenReaderSupport() // This is a placeholder
    }
  }
}

// Accessibility component for language switching
export function AccessibleLanguageSelector({ 
  onLanguageChange,
  className = '',
  showLabels = true,
  showPronunciation = false
}: {
  onLanguageChange?: (language: string) => void
  className?: string
  showLabels?: boolean
  showPronunciation?: boolean
}) {
  const { currentLanguage, supportedLanguages, changeLanguage } = useLanguageSelector()
  const { getPronunciation } = useCulturalAdaptation()

  const handleLanguageChange = (languageCode: string) => {
    changeLanguage(languageCode as 'en' | 'zh' | 'ms' | 'ta')
    onLanguageChange?.(languageCode)
  }

  return (
    <div 
      className={`accessible-language-selector ${className}`}
      role="group"
      aria-label="Language Selection"
      aria-describedby="language-selector-description"
    >
      {showLabels && (
        <div id="language-selector-description" className="sr-only">
          Select your preferred language for accessibility features and content
        </div>
      )}

      {supportedLanguages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleLanguageChange(lang.code)}
          className={`language-option ${currentLanguage === lang.code ? 'active' : ''}`}
          aria-pressed={currentLanguage === lang.code}
          aria-label={`Switch to ${lang.nativeName}`}
        >
          <span className="language-native-name">{lang.nativeName}</span>
          {showLabels && (
            <span className="language-english-name">{lang.name}</span>
          )}
          {showPronunciation && lang.code !== 'en' && (
            <span className="language-pronunciation">
              {getPronunciation('language') || `(${lang.code})`}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

// Cultural adaptation indicator component
export function CulturalAdaptationIndicator({ className = '' }: { className?: string }) {
  const { settings } = useCulturalAdaptation()

  return (
    <div className={`cultural-adaptation-indicator ${className}`} role="status" aria-live="polite">
      <span className="adaptation-label">Cultural Adaptations:</span>
      <div className="adaptation-features">
        {settings.dateFormat === 'DD/MM/YYYY' && (
          <span className="feature">Singapore Date Format</span>
        )}
        {settings.timeFormat === '24h' && (
          <span className="feature">24-hour Time</span>
        )}
        {settings.healthcareCustoms && (
          <span className="feature">Healthcare Customs</span>
        )}
        {settings.emergencyInfoPriority && (
          <span className="feature">Emergency Priority</span>
        )}
      </div>
    </div>
  )
}