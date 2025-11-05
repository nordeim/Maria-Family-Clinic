/**
 * Healthier SG Accessibility Provider
 * Comprehensive accessibility management for WCAG 2.2 AA compliance
 */

"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { useScreenReader } from './screen-reader'
import {
  HealthcareScreenReaderOptimization,
  HealthcareKeyboardNavigation,
  HealthcareVoiceNavigation
} from '@/accessibility'

export interface AccessibilityPreferences {
  // Visual accessibility
  highContrast: boolean
  fontSize: 'small' | 'medium' | 'large' | 'extra-large'
  reduceMotion: boolean
  colorBlindSupport: 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia'
  
  // Audio accessibility
  voiceNavigation: boolean
  audioDescriptions: boolean
  soundNotifications: boolean
  speechSpeed: number // 0.5 to 2.0
  
  // Keyboard navigation
  keyboardNavigation: boolean
  skipLinks: boolean
  focusIndicator: boolean
  
  // Screen reader support
  screenReaderOptimized: boolean
  headingNavigation: boolean
  landmarkNavigation: boolean
  
  // Cognitive accessibility
  simpleLanguage: boolean
  reducedComplexity: boolean
  consistentNavigation: boolean
  
  // Motor accessibility
  largeTargets: boolean
  dragAndDropAlternative: boolean
  dwellClicking: boolean
}

export interface AccessibilityContextType {
  // Current state
  preferences: AccessibilityPreferences
  isEnabled: boolean
  
  // Feature management
  enableFeature: (feature: keyof AccessibilityPreferences) => void
  disableFeature: (feature: keyof AccessibilityPreferences) => void
  toggleFeature: (feature: keyof AccessibilityPreferences) => void
  updatePreferences: (preferences: Partial<AccessibilityPreferences>) => void
  resetToDefaults: () => void
  
  // System detection
  detectSystemPreferences: () => Partial<AccessibilityPreferences>
  getWCAGCompliance: () => 'A' | 'AA' | 'AAA'
  
  // Announcements
  announce: (message: string, priority?: 'polite' | 'assertive') => void
  setAriaLabel: (element: HTMLElement, label: string) => void
  setAriaDescribedBy: (element: HTMLElement, description: string) => void
  
  // Testing helpers
  enableTestMode: () => void
  disableTestMode: () => void
  isTestMode: boolean
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

const DEFAULT_PREFERENCES: AccessibilityPreferences = {
  highContrast: false,
  fontSize: 'medium',
  reduceMotion: false,
  colorBlindSupport: 'none',
  voiceNavigation: false,
  audioDescriptions: false,
  soundNotifications: true,
  speechSpeed: 1.0,
  keyboardNavigation: false,
  skipLinks: true,
  focusIndicator: true,
  screenReaderOptimized: false,
  headingNavigation: true,
  landmarkNavigation: true,
  simpleLanguage: false,
  reducedComplexity: false,
  consistentNavigation: true,
  largeTargets: false,
  dragAndDropAlternative: true,
  dwellClicking: false
}

class AccessibilityManager {
  private preferences: AccessibilityPreferences = { ...DEFAULT_PREFERENCES }
  private listeners: ((preferences: AccessibilityPreferences) => void)[] = []
  
  setPreferences(prefs: Partial<AccessibilityPreferences>) {
    this.preferences = { ...this.preferences, ...prefs }
    this.notifyListeners()
    this.persistPreferences()
    this.applyStyles()
  }
  
  getPreferences(): AccessibilityPreferences {
    return { ...this.preferences }
  }
  
  toggleFeature(feature: keyof AccessibilityPreferences) {
    this.setPreferences({ [feature]: !this.preferences[feature] } as any)
  }
  
  enableFeature(feature: keyof AccessibilityPreferences) {
    this.setPreferences({ [feature]: true } as any)
  }
  
  disableFeature(feature: keyof AccessibilityPreferences) {
    this.setPreferences({ [feature]: false } as any)
  }
  
  subscribe(listener: (preferences: AccessibilityPreferences) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }
  
  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.preferences))
  }
  
  private persistPreferences() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('healthier-sg-accessibility', JSON.stringify(this.preferences))
    }
  }
  
  private loadPreferences(): AccessibilityPreferences {
    if (typeof window === 'undefined') return { ...DEFAULT_PREFERENCES }
    
    try {
      const saved = localStorage.getItem('healthier-sg-accessibility')
      if (saved) {
        const parsed = JSON.parse(saved)
        return { ...DEFAULT_PREFERENCES, ...parsed }
      }
    } catch (error) {
      console.warn('Failed to load accessibility preferences:', error)
    }
    
    return { ...DEFAULT_PREFERENCES }
  }
  
  private applyStyles() {
    if (typeof window === 'undefined') return
    
    const root = document.documentElement
    
    // Apply font size
    const fontSizes = {
      'small': '14px',
      'medium': '16px',
      'large': '18px',
      'extra-large': '20px'
    }
    root.style.setProperty('--base-font-size', fontSizes[this.preferences.fontSize])
    
    // Apply high contrast
    if (this.preferences.highContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }
    
    // Apply reduced motion
    if (this.preferences.reduceMotion) {
      root.classList.add('reduce-motion')
    } else {
      root.classList.remove('reduce-motion')
    }
    
    // Apply color blind support
    if (this.preferences.colorBlindSupport !== 'none') {
      root.classList.add(`colorblind-${this.preferences.colorBlindSupport}`)
    } else {
      root.classList.remove('colorblind-deuteranopia', 'colorblind-protanopia', 'colorblind-tritanopia')
    }
    
    // Apply large targets
    if (this.preferences.largeTargets) {
      root.classList.add('large-targets')
    } else {
      root.classList.remove('large-targets')
    }
    
    // Apply simple language
    if (this.preferences.simpleLanguage) {
      root.classList.add('simple-language')
    } else {
      root.classList.remove('simple-language')
    }
  }
  
  detectSystemPreferences(): Partial<AccessibilityPreferences> {
    if (typeof window === 'undefined') return {}
    
    const detected: Partial<AccessibilityPreferences> = {}
    
    // Detect prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      detected.reduceMotion = true
    }
    
    // Detect prefers-contrast: high
    if (window.matchMedia('(prefers-contrast: high)').matches) {
      detected.highContrast = true
    }
    
    // Detect prefers-color-scheme
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      // Could be used for dark mode detection
    }
    
    return detected
  }
  
  initialize() {
    this.preferences = this.loadPreferences()
    const systemPrefs = this.detectSystemPreferences()
    if (Object.keys(systemPrefs).length > 0) {
      this.setPreferences(systemPrefs)
    } else {
      this.applyStyles()
    }
  }
}

const accessibilityManager = new AccessibilityManager()

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(DEFAULT_PREFERENCES)
  const [isTestMode, setIsTestMode] = useState(false)
  const { announce } = useScreenReader()
  
  // Initialize accessibility manager
  useEffect(() => {
    accessibilityManager.initialize()
    const unsubscribe = accessibilityManager.subscribe(setPreferences)
    setPreferences(accessibilityManager.getPreferences())
    
    return unsubscribe
  }, [])
  
  // Keyboard event handlers for global shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + H: Toggle high contrast
      if (e.altKey && e.key === 'h') {
        e.preventDefault()
        toggleFeature('highContrast')
        announce('High contrast ' + (preferences.highContrast ? 'disabled' : 'enabled'))
      }
      
      // Alt + F: Toggle font size cycling
      if (e.altKey && e.key === 'f') {
        e.preventDefault()
        const sizes: AccessibilityPreferences['fontSize'][] = ['small', 'medium', 'large', 'extra-large']
        const currentIndex = sizes.indexOf(preferences.fontSize)
        const nextSize = sizes[(currentIndex + 1) % sizes.length]
        updatePreferences({ fontSize: nextSize })
        announce(`Font size changed to ${nextSize}`)
      }
      
      // Alt + V: Toggle voice navigation
      if (e.altKey && e.key === 'v') {
        e.preventDefault()
        toggleFeature('voiceNavigation')
        announce('Voice navigation ' + (preferences.voiceNavigation ? 'disabled' : 'enabled'))
      }
      
      // Alt + K: Toggle keyboard navigation
      if (e.altKey && e.key === 'k') {
        e.preventDefault()
        toggleFeature('keyboardNavigation')
        announce('Keyboard navigation ' + (preferences.keyboardNavigation ? 'disabled' : 'enabled'))
      }
      
      // Alt + A: Open accessibility settings
      if (e.altKey && e.key === 'a') {
        e.preventDefault()
        // This would open the accessibility settings modal
        announce('Opening accessibility settings')
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [preferences])
  
  const enableFeature = useCallback((feature: keyof AccessibilityPreferences) => {
    accessibilityManager.enableFeature(feature)
    announce(`${feature.replace(/([A-Z])/g, ' $1').toLowerCase()} enabled`)
  }, [announce])
  
  const disableFeature = useCallback((feature: keyof AccessibilityPreferences) => {
    accessibilityManager.disableFeature(feature)
    announce(`${feature.replace(/([A-Z])/g, ' $1').toLowerCase()} disabled`)
  }, [announce])
  
  const toggleFeature = useCallback((feature: keyof AccessibilityPreferences) => {
    accessibilityManager.toggleFeature(feature)
  }, [])
  
  const updatePreferences = useCallback((newPrefs: Partial<AccessibilityPreferences>) => {
    accessibilityManager.setPreferences(newPrefs)
  }, [])
  
  const resetToDefaults = useCallback(() => {
    accessibilityManager.setPreferences(DEFAULT_PREFERENCES)
    announce('Accessibility settings reset to defaults')
  }, [announce])
  
  const detectSystemPreferences = useCallback(() => {
    return accessibilityManager.detectSystemPreferences()
  }, [])
  
  const getWCAGCompliance = useCallback((): 'A' | 'AA' | 'AAA' => {
    // Analyze current preferences against WCAG guidelines
    let score = 0
    const total = 20 // Total WCAG 2.2 AA criteria relevant to our app
    
    if (preferences.highContrast) score += 1
    if (preferences.fontSize !== 'medium') score += 1
    if (preferences.reduceMotion) score += 1
    if (preferences.keyboardNavigation) score += 1
    if (preferences.skipLinks) score += 1
    if (preferences.focusIndicator) score += 1
    if (preferences.screenReaderOptimized) score += 1
    if (preferences.headingNavigation) score += 1
    if (preferences.landmarkNavigation) score += 1
    if (preferences.largeTargets) score += 1
    if (preferences.dragAndDropAlternative) score += 1
    if (preferences.simpleLanguage) score += 1
    if (preferences.voiceNavigation) score += 1
    if (preferences.audioDescriptions) score += 1
    if (preferences.soundNotifications) score += 1
    if (preferences.colorBlindSupport !== 'none') score += 1
    if (preferences.consistentNavigation) score += 1
    if (preferences.reducedComplexity) score += 1
    if (preferences.dwellClicking) score += 1
    if (preferences.speechSpeed > 0.5 && preferences.speechSpeed < 2.0) score += 1
    
    const complianceLevel = (score / total) * 100
    
    if (complianceLevel >= 90) return 'AAA'
    if (complianceLevel >= 70) return 'AA'
    return 'A'
  }, [preferences])
  
  const setAriaLabel = useCallback((element: HTMLElement, label: string) => {
    if (element) {
      element.setAttribute('aria-label', label)
    }
  }, [])
  
  const setAriaDescribedBy = useCallback((element: HTMLElement, description: string) => {
    if (element) {
      // Create or get description element
      let descElement = document.getElementById(description)
      if (!descElement) {
        descElement = document.createElement('div')
        descElement.id = description
        descElement.className = 'sr-only'
        descElement.textContent = description
        document.body.appendChild(descElement)
      }
      element.setAttribute('aria-describedby', description)
    }
  }, [])
  
  const enableTestMode = useCallback(() => {
    setIsTestMode(true)
    document.body.classList.add('accessibility-test-mode')
  }, [])
  
  const disableTestMode = useCallback(() => {
    setIsTestMode(false)
    document.body.classList.remove('accessibility-test-mode')
  }, [])
  
  const contextValue: AccessibilityContextType = {
    preferences,
    isEnabled: true,
    enableFeature,
    disableFeature,
    toggleFeature,
    updatePreferences,
    resetToDefaults,
    detectSystemPreferences,
    getWCAGCompliance,
    announce,
    setAriaLabel,
    setAriaDescribedBy,
    enableTestMode,
    disableTestMode,
    isTestMode
  }
  
  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
      
      {/* Healthcare-specific accessibility optimizations */}
      <HealthcareScreenReaderOptimization />
      <HealthcareKeyboardNavigation />
      <HealthcareVoiceNavigation />
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider')
  }
  return context
}

// Specialized hooks for different accessibility features
export function useVisualAccessibility() {
  const { preferences, toggleFeature, updatePreferences } = useAccessibility()
  return {
    highContrast: preferences.highContrast,
    fontSize: preferences.fontSize,
    reduceMotion: preferences.reduceMotion,
    colorBlindSupport: preferences.colorBlindSupport,
    toggleHighContrast: () => toggleFeature('highContrast'),
    setFontSize: (size: AccessibilityPreferences['fontSize']) => updatePreferences({ fontSize: size }),
    toggleReduceMotion: () => toggleFeature('reduceMotion'),
    setColorBlindSupport: (type: AccessibilityPreferences['colorBlindSupport']) => 
      updatePreferences({ colorBlindSupport: type })
  }
}

export function useAudioAccessibility() {
  const { preferences, toggleFeature, updatePreferences } = useAccessibility()
  return {
    voiceNavigation: preferences.voiceNavigation,
    audioDescriptions: preferences.audioDescriptions,
    soundNotifications: preferences.soundNotifications,
    speechSpeed: preferences.speechSpeed,
    toggleVoiceNavigation: () => toggleFeature('voiceNavigation'),
    toggleAudioDescriptions: () => toggleFeature('audioDescriptions'),
    toggleSoundNotifications: () => toggleFeature('soundNotifications'),
    setSpeechSpeed: (speed: number) => updatePreferences({ speechSpeed: speed })
  }
}

export function useKeyboardAccessibility() {
  const { preferences, toggleFeature } = useAccessibility()
  return {
    keyboardNavigation: preferences.keyboardNavigation,
    skipLinks: preferences.skipLinks,
    focusIndicator: preferences.focusIndicator,
    toggleKeyboardNavigation: () => toggleFeature('keyboardNavigation'),
    toggleSkipLinks: () => toggleFeature('skipLinks'),
    toggleFocusIndicator: () => toggleFeature('focusIndicator')
  }
}

export function useScreenReaderAccessibility() {
  const { preferences, toggleFeature } = useAccessibility()
  return {
    screenReaderOptimized: preferences.screenReaderOptimized,
    headingNavigation: preferences.headingNavigation,
    landmarkNavigation: preferences.landmarkNavigation,
    toggleScreenReaderOptimized: () => toggleFeature('screenReaderOptimized'),
    toggleHeadingNavigation: () => toggleFeature('headingNavigation'),
    toggleLandmarkNavigation: () => toggleFeature('landmarkNavigation')
  }
}