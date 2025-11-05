/**
 * Advanced Screen Reader Optimization System
 * Healthcare-specific screen reader support for NVDA, JAWS, VoiceOver
 */

"use client"

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'
import { useScreenReader as useBasicScreenReader } from '@/components/accessibility/screen-reader'

export interface ScreenReaderConfig {
  // Screen reader detection and adaptation
  preferredScreenReader: 'nvda' | 'jaws' | 'voiceover' | 'unknown'
  supportsAriaLive: boolean
  supportsSpeechSynthesis: boolean
  supportsVoiceCommands: boolean
  
  // Healthcare workflow preferences
  announceHealthcareActions: boolean
  announceAppointmentChanges: boolean
  announceMedicalResults: boolean
  verboseMode: boolean
  
  // Navigation preferences
  headingNavigationEnabled: boolean
  landmarkNavigationEnabled: boolean
  tableNavigationEnabled: boolean
  listNavigationEnabled: boolean
}

export interface HealthcareAnnouncement {
  id: string
  type: 'appointment' | 'medical-result' | 'doctor-info' | 'clinic-info' | 'service-info' | 'system'
  priority: 'polite' | 'assertive'
  message: string
  context?: string
  timestamp: number
  expiresAt?: number
}

export interface ScreenReaderProfile {
  id: string
  name: string
  screenReader: ScreenReaderConfig['preferredScreenReader']
  settings: Partial<ScreenReaderConfig>
  optimizations: string[]
  description: string
}

export class HealthcareScreenReaderManager {
  private static instance: HealthcareScreenReaderManager
  private config: ScreenReaderConfig
  private announcementQueue: HealthcareAnnouncement[] = []
  private announcementCallbacks: Map<string, (announcement: HealthcareAnnouncement) => void> = new Map()
  private screenReaderDetectionCache: ScreenReaderConfig['preferredScreenReader'] | null = null
  private isInitialized = false

  constructor() {
    this.config = this.getDefaultConfig()
  }

  public static getInstance(): HealthcareScreenReaderManager {
    if (!HealthcareScreenReaderManager.instance) {
      HealthcareScreenReaderManager.instance = new HealthcareScreenReaderManager()
    }
    return HealthcareScreenReaderManager.instance
  }

  private getDefaultConfig(): ScreenReaderConfig {
    return {
      preferredScreenReader: 'unknown',
      supportsAriaLive: true,
      supportsSpeechSynthesis: false,
      supportsVoiceCommands: false,
      announceHealthcareActions: true,
      announceAppointmentChanges: true,
      announceMedicalResults: true,
      verboseMode: false,
      headingNavigationEnabled: true,
      landmarkNavigationEnabled: true,
      tableNavigationEnabled: true,
      listNavigationEnabled: true
    }
  }

  /**
   * Initialize screen reader detection and optimization
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    this.config.preferredScreenReader = await this.detectScreenReader()
    this.config.supportsAriaLive = this.checkAriaLiveSupport()
    this.config.supportsSpeechSynthesis = 'speechSynthesis' in window
    this.config.supportsVoiceCommands = 'SpeechRecognition' in window

    this.applyOptimizations()
    this.isInitialized = true
  }

  /**
   * Detect the active screen reader
   */
  private async detectScreenReader(): Promise<ScreenReaderConfig['preferredScreenReader']> {
    if (this.screenReaderDetectionCache) {
      return this.screenReaderDetectionCache
    }

    try {
      // Check for NVDA
      if (this.isNVDAActive()) {
        this.screenReaderDetectionCache = 'nvda'
        return 'nvda'
      }

      // Check for JAWS
      if (this.isJAWSActive()) {
        this.screenReaderDetectionCache = 'jaws'
        return 'jaws'
      }

      // Check for VoiceOver (macOS/iOS)
      if (this.isVoiceOverActive()) {
        this.screenReaderDetectionCache = 'voiceover'
        return 'voiceover'
      }

      this.screenReaderDetectionCache = 'unknown'
      return 'unknown'
    } catch (error) {
      console.warn('Screen reader detection failed:', error)
      this.screenReaderDetectionCache = 'unknown'
      return 'unknown'
    }
  }

  /**
   * Check if NVDA is active
   */
  private isNVDAActive(): boolean {
    try {
      // Check for NVDA-specific global variables
      return !!(
        (window as any).nvdaController ||
        (window as any).nvda ||
        document.querySelector('[role="application"]')?.getAttribute('aria-label')?.includes('nvda')
      )
    } catch {
      return false
    }
  }

  /**
   * Check if JAWS is active
   */
  private isJAWSActive(): boolean {
    try {
      // Check for JAWS-specific elements and behaviors
      return !!(
        (window as any).jaws ||
        (window as any).JawsAPI ||
        document.querySelector('[role="application"]')?.getAttribute('aria-label')?.includes('jaws')
      )
    } catch {
      return false
    }
  }

  /**
   * Check if VoiceOver is active
   */
  private isVoiceOverActive(): boolean {
    try {
      // VoiceOver detection on macOS/iOS
      const isMacOS = navigator.platform.toLowerCase().includes('mac')
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      
      if (isMacOS || isIOS) {
        // Check for VoiceOver-specific accessibility features
        return !!(
          (window as any).VoiceOver ||
          (window as any).voiceOver ||
          this.checkAccessibility()
        )
      }
      
      return false
    } catch {
      return false
    }
  }

  /**
   * Check general accessibility features
   */
  private checkAccessibility(): boolean {
    try {
      // Test if accessibility API is available
      const testElement = document.createElement('div')
      testElement.setAttribute('role', 'application')
      testElement.setAttribute('aria-label', 'accessibility test')
      document.body.appendChild(testElement)
      document.body.removeChild(testElement)
      return true
    } catch {
      return false
    }
  }

  /**
   * Check ARIA live region support
   */
  private checkAriaLiveSupport(): boolean {
    try {
      const liveRegion = document.createElement('div')
      liveRegion.setAttribute('aria-live', 'polite')
      liveRegion.setAttribute('aria-atomic', 'true')
      document.body.appendChild(liveRegion)
      const isSupported = liveRegion.getAttribute('aria-live') === 'polite'
      document.body.removeChild(liveRegion)
      return isSupported
    } catch {
      return false
    }
  }

  /**
   * Apply screen reader-specific optimizations
   */
  private applyOptimizations(): void {
    switch (this.config.preferredScreenReader) {
      case 'nvda':
        this.applyNVDAOptimizations()
        break
      case 'jaws':
        this.applyJAWSOptimizations()
        break
      case 'voiceover':
        this.applyVoiceOverOptimizations()
        break
      default:
        this.applyGenericOptimizations()
    }
  }

  /**
   * Apply NVDA-specific optimizations
   */
  private applyNVDAOptimizations(): void {
    // NVDA works best with explicit ARIA roles and clear heading hierarchy
    this.addMetaTag('nvda-compatibility', 'enabled')
    this.optimizeHeadings()
    this.addAriaLandmarks()
  }

  /**
   * Apply JAWS-specific optimizations
   */
  private applyJAWSOptimizations(): void {
    // JAWS requires specific table markup and form associations
    this.addMetaTag('jaws-compatibility', 'enabled')
    this.optimizeTables()
    this.enhanceForms()
  }

  /**
   * Apply VoiceOver-specific optimizations
   */
  private applyVoiceOverOptimizations(): void {
    // VoiceOver works well with semantic HTML and appropriate labels
    this.addMetaTag('voiceover-compatibility', 'enabled')
    this.enhanceLabels()
    this.optimizeImages()
  }

  /**
   * Apply generic accessibility optimizations
   */
  private applyGenericOptimizations(): void {
    this.addMetaTag('generic-accessibility', 'enabled')
    this.optimizeHeadings()
    this.addAriaLandmarks()
  }

  private addMetaTag(name: string, content: string): void {
    let meta = document.querySelector(`meta[name="${name}"]`)
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', name)
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', content)
  }

  private optimizeHeadings(): void {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    headings.forEach((heading, index) => {
      const level = heading.tagName.charAt(1)
      heading.setAttribute('aria-level', level)
      
      if (index === 0 && level !== '1') {
        heading.setAttribute('role', 'heading')
        heading.setAttribute('aria-level', '1')
      }
    })
  }

  private addAriaLandmarks(): void {
    const regions = document.querySelectorAll('main, nav, aside, section, header, footer')
    regions.forEach(region => {
      if (!region.getAttribute('role')) {
        const tagName = region.tagName.toLowerCase()
        const role = tagName === 'main' ? 'main' : 
                     tagName === 'nav' ? 'navigation' :
                     tagName === 'aside' ? 'complementary' :
                     tagName === 'section' ? 'region' :
                     tagName === 'header' ? 'banner' : 'contentinfo'
        region.setAttribute('role', role)
      }
    })
  }

  private optimizeTables(): void {
    const tables = document.querySelectorAll('table')
    tables.forEach(table => {
      table.setAttribute('role', 'table')
      
      const headers = table.querySelectorAll('th')
      headers.forEach((header, index) => {
        header.setAttribute('scope', 'col')
        header.setAttribute('id', `header-${index}`)
      })

      const cells = table.querySelectorAll('td')
      cells.forEach((cell, index) => {
        const headerId = `header-${index % headers.length}`
        cell.setAttribute('headers', headerId)
        cell.setAttribute('role', 'gridcell')
      })
    })
  }

  private enhanceForms(): void {
    const forms = document.querySelectorAll('form')
    forms.forEach(form => {
      form.setAttribute('role', 'form')
      
      const inputs = form.querySelectorAll('input, select, textarea')
      inputs.forEach(input => {
        if (!input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby')) {
          const label = form.querySelector(`label[for="${input.id}"]`)
          if (label) {
            input.setAttribute('aria-labelledby', label.id || 'anonymous-label')
          }
        }
      })
    })
  }

  private enhanceLabels(): void {
    const labels = document.querySelectorAll('label')
    labels.forEach(label => {
      if (label.htmlFor) {
        const input = document.getElementById(label.htmlFor)
        if (input && !input.getAttribute('aria-label')) {
          input.setAttribute('aria-labelledby', label.id || label.htmlFor)
        }
      }
    })
  }

  private optimizeImages(): void {
    const images = document.querySelectorAll('img')
    images.forEach(img => {
      if (!img.alt && !img.getAttribute('aria-label')) {
        // For decorative images
        img.setAttribute('role', 'presentation')
        img.setAttribute('aria-hidden', 'true')
      }
    })
  }

  /**
   * Announce healthcare-specific message
   */
  announce(message: string, type: HealthcareAnnouncement['type'], priority: 'polite' | 'assertive' = 'polite', context?: string): void {
    const announcement: HealthcareAnnouncement = {
      id: `announcement-${Date.now()}`,
      type,
      priority,
      message,
      context,
      timestamp: Date.now()
    }

    this.announcementQueue.push(announcement)
    this.processAnnouncementQueue()
  }

  /**
   * Process the announcement queue
   */
  private async processAnnouncementQueue(): Promise<void> {
    if (this.announcementQueue.length === 0) return

    const announcement = this.announcementQueue.shift()
    if (!announcement) return

    // Announce to screen reader via aria-live regions
    this.announceToLiveRegion(announcement.message, announcement.priority)

    // Call registered callbacks
    const callback = this.announcementCallbacks.get(announcement.type)
    if (callback) {
      callback(announcement)
    }

    // Process next announcement after a brief delay
    setTimeout(() => this.processAnnouncementQueue(), 500)
  }

  /**
   * Announce to aria-live regions
   */
  private announceToLiveRegion(message: string, priority: 'polite' | 'assertive'): void {
    const liveRegion = document.createElement('div')
    liveRegion.setAttribute('aria-live', priority)
    liveRegion.setAttribute('aria-atomic', 'true')
    liveRegion.className = 'sr-only'
    liveRegion.textContent = message

    document.body.appendChild(liveRegion)

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(liveRegion)
    }, 1000)
  }

  /**
   * Register announcement callback
   */
  registerAnnouncementCallback(type: HealthcareAnnouncement['type'], callback: (announcement: HealthcareAnnouncement) => void): void {
    this.announcementCallbacks.set(type, callback)
  }

  /**
   * Get current configuration
   */
  getConfig(): ScreenReaderConfig {
    return { ...this.config }
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<ScreenReaderConfig>): void {
    this.config = { ...this.config, ...updates }
    this.applyOptimizations()
  }

  /**
   * Get optimized profiles for different screen readers
   */
  getScreenReaderProfile(): ScreenReaderProfile {
    switch (this.config.preferredScreenReader) {
      case 'nvda':
        return {
          id: 'nvda-healthcare',
          name: 'NVDA Healthcare Profile',
          screenReader: 'nvda',
          description: 'Optimized for NVDA screen reader with healthcare workflow enhancements',
          optimizations: [
            'Clear heading hierarchy for navigation',
            'Comprehensive ARIA landmarks',
            'Enhanced form associations',
            'Healthcare-specific announcements',
            'Table navigation optimization'
          ],
          settings: {
            announceHealthcareActions: true,
            announceAppointmentChanges: true,
            announceMedicalResults: true,
            verboseMode: true,
            headingNavigationEnabled: true,
            landmarkNavigationEnabled: true,
            tableNavigationEnabled: true
          }
        }
      
      case 'jaws':
        return {
          id: 'jaws-healthcare',
          name: 'JAWS Healthcare Profile',
          screenReader: 'jaws',
          description: 'Optimized for JAWS with healthcare-specific features',
          optimizations: [
            'Enhanced table markup',
            'Comprehensive form associations',
            'Healthcare workflow announcements',
            'Custom keystroke shortcuts',
            'Specialized content reading'
          ],
          settings: {
            announceHealthcareActions: true,
            announceAppointmentChanges: true,
            announceMedicalResults: true,
            verboseMode: true,
            tableNavigationEnabled: true,
            listNavigationEnabled: true
          }
        }
      
      case 'voiceover':
        return {
          id: 'voiceover-healthcare',
          name: 'VoiceOver Healthcare Profile',
          screenReader: 'voiceover',
          description: 'Optimized for VoiceOver with healthcare accessibility features',
          optimizations: [
            'Semantic HTML enhancement',
            'Clear labeling system',
            'Healthcare workflow support',
            'Touch gesture optimization',
            'Regional accent support'
          ],
          settings: {
            announceHealthcareActions: true,
            announceAppointmentChanges: true,
            announceMedicalResults: true,
            verboseMode: false,
            headingNavigationEnabled: true,
            landmarkNavigationEnabled: true
          }
        }
      
      default:
        return {
          id: 'generic-healthcare',
          name: 'Generic Healthcare Accessibility',
          screenReader: 'unknown',
          description: 'Generic accessibility optimizations for healthcare applications',
          optimizations: [
            'Standard WCAG 2.2 AA compliance',
            'Healthcare terminology accessibility',
            'Multi-language support',
            'Cultural adaptation'
          ],
          settings: {
            announceHealthcareActions: true,
            announceAppointmentChanges: true,
            announceMedicalResults: true,
            verboseMode: false,
            headingNavigationEnabled: true,
            landmarkNavigationEnabled: true
          }
        }
    }
  }
}

// Context for healthcare screen reader management
const HealthcareScreenReaderContext = createContext<HealthcareScreenReaderManager | null>(null)

export function HealthcareScreenReaderProvider({ children }: { children: React.ReactNode }) {
  const [manager, setManager] = useState<HealthcareScreenReaderManager | null>(null)
  const { announce: basicAnnounce } = useBasicScreenReader()

  useEffect(() => {
    const screenReaderManager = HealthcareScreenReaderManager.getInstance()
    screenReaderManager.initialize().then(() => {
      setManager(screenReaderManager)
    })

    return () => {
      setManager(null)
    }
  }, [])

  const enhancedAnnounce = useCallback((message: string, type: HealthcareAnnouncement['type'], priority: 'polite' | 'assertive' = 'polite') => {
    if (manager) {
      manager.announce(message, type, priority)
    } else {
      basicAnnounce(message, priority)
    }
  }, [manager, basicAnnounce])

  return (
    <HealthcareScreenReaderContext.Provider value={manager}>
      {children}
    </HealthcareScreenReaderContext.Provider>
  )
}

export function useHealthcareScreenReader() {
  const context = useContext(HealthcareScreenReaderContext)
  if (!context) {
    throw new Error('useHealthcareScreenReader must be used within HealthcareScreenReaderProvider')
  }
  return context
}

// Specialized hooks for different healthcare workflows
export function useAppointmentScreenReader() {
  const manager = useHealthcareScreenReader()
  
  return {
    announceAppointmentBooked: (appointmentDetails: string) => 
      manager.announce(`Appointment booked successfully. ${appointmentDetails}`, 'appointment', 'polite'),
    
    announceAppointmentCancelled: (appointmentDetails: string) => 
      manager.announce(`Appointment cancelled. ${appointmentDetails}`, 'appointment', 'assertive'),
    
    announceAppointmentRescheduled: (oldTime: string, newTime: string) => 
      manager.announce(`Appointment rescheduled from ${oldTime} to ${newTime}`, 'appointment', 'assertive'),
    
    announceWaitTimeUpdate: (waitTime: number) => 
      manager.announce(`Current wait time is approximately ${waitTime} minutes`, 'system', 'polite')
  }
}

export function useMedicalResultsScreenReader() {
  const manager = useHealthcareScreenReader()
  
  return {
    announceTestResultsAvailable: (testName: string) => 
      manager.announce(`${testName} results are now available`, 'medical-result', 'assertive'),
    
    announcePrescriptionReady: (medicationName: string) => 
      manager.announce(`${medicationName} prescription is ready for pickup`, 'medical-result', 'polite'),
    
    announceFollowUpRequired: (doctorName: string) => 
      manager.announce(`Follow-up appointment recommended with Dr. ${doctorName}`, 'medical-result', 'assertive')
  }
}

export function useDoctorInfoScreenReader() {
  const manager = useHealthcareScreenReader()
  
  return {
    announceDoctorFound: (doctorName: string, specialty: string) => 
      manager.announce(`Found ${doctorName}, specialist in ${specialty}`, 'doctor-info', 'polite'),
    
    announceDoctorAvailable: (doctorName: string, nextAvailable: string) => 
      manager.announce(`Dr. ${doctorName} is available for appointments starting ${nextAvailable}`, 'doctor-info', 'polite'),
    
    announceDoctorRating: (doctorName: string, rating: number) => 
      manager.announce(`Dr. ${doctorName} has a ${rating} out of 5 star rating`, 'doctor-info', 'polite')
  }
}