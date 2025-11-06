/**
 * Voice Navigation and Control System
 * Healthcare-specific voice commands for search, booking, and information access
 */

"use client"

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'

export interface VoiceCommand {
  id: string
  phrase: string
  synonyms: string[]
  action: (params?: any) => void | Promise<void>
  category: 'search' | 'booking' | 'navigation' | 'information' | 'accessibility'
  parameters?: VoiceParameter[]
  confidence: number // Minimum confidence for command recognition
  context?: string // Context where command is available
  description: string
  healthcareSpecific: boolean
}

export interface VoiceParameter {
  name: string
  type: 'string' | 'number' | 'boolean' | 'date'
  required: boolean
  description: string
  validation?: (value: any) => boolean
}

export interface VoiceRecognitionConfig {
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  language: string
  autoStart: boolean
  autoStop: boolean
  noiseSuppression: boolean
  echoCancellation: boolean
}

export interface VoiceFeedbackConfig {
  speechEnabled: boolean
  audioFeedbackEnabled: boolean
  confirmationEnabled: boolean
  errorFeedbackEnabled: boolean
  announceActions: boolean
  speechRate: number // 0.1 to 10
  speechPitch: number // 0 to 2
  speechVolume: number // 0 to 1
}

export class HealthcareVoiceNavigationManager {
  private static instance: HealthcareVoiceNavigationManager
  private recognition: any = null
  private synthesis: SpeechSynthesis
  private commands: Map<string, VoiceCommand> = new Map()
  private isListening = false
  private isSupported = false
  private config: VoiceRecognitionConfig
  private feedbackConfig: VoiceFeedbackConfig
  private currentContext = 'general'
  private commandHistory: Array<{ command: string; timestamp: number }> = []
  private errorCount = 0
  private maxErrors = 3

  constructor() {
    this.config = this.getDefaultRecognitionConfig()
    this.feedbackConfig = this.getDefaultFeedbackConfig()
    this.synthesis = window.speechSynthesis
    this.initializeVoiceRecognition()
    this.initializeHealthcareCommands()
  }

  public static getInstance(): HealthcareVoiceNavigationManager {
    if (!HealthcareVoiceNavigationManager.instance) {
      HealthcareVoiceNavigationManager.instance = new HealthcareVoiceNavigationManager()
    }
    return HealthcareVoiceNavigationManager.instance
  }

  private getDefaultRecognitionConfig(): VoiceRecognitionConfig {
    return {
      continuous: false,
      interimResults: true,
      maxAlternatives: 3,
      language: 'en-SG', // Singapore English
      autoStart: false,
      autoStop: true,
      noiseSuppression: true,
      echoCancellation: true
    }
  }

  private getDefaultFeedbackConfig(): VoiceFeedbackConfig {
    return {
      speechEnabled: true,
      audioFeedbackEnabled: true,
      confirmationEnabled: true,
      errorFeedbackEnabled: true,
      announceActions: true,
      speechRate: 1.0,
      speechPitch: 1.0,
      speechVolume: 0.8
    }
  }

  /**
   * Initialize voice recognition API
   */
  private async initializeVoiceRecognition(): Promise<void> {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported')
      return
    }

    this.isSupported = true

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      this.recognition = new SpeechRecognition()

      this.recognition.continuous = this.config.continuous
      this.recognition.interimResults = this.config.interimResults
      this.recognition.maxAlternatives = this.config.maxAlternatives
      this.recognition.lang = this.config.language

      this.setupRecognitionHandlers()
    } catch (error) {
      console.error('Failed to initialize speech recognition:', error)
    }
  }

  /**
   * Setup speech recognition event handlers
   */
  private setupRecognitionHandlers(): void {
    if (!this.recognition) return

    this.recognition.onstart = () => {
      this.isListening = true
      this.speak('Voice recognition started')
      this.onListeningStart?.()
    }

    this.recognition.onend = () => {
      this.isListening = false
      if (this.config.autoStart) {
        setTimeout(() => this.startListening(), 1000)
      }
      this.onListeningEnd?.()
    }

    this.recognition.onresult = (event: any) => {
      this.handleRecognitionResult(event)
    }

    this.recognition.onerror = (event: any) => {
      this.handleRecognitionError(event)
    }

    this.recognition.onnomatch = () => {
      this.handleNoMatch()
    }
  }

  /**
   * Handle speech recognition results
   */
  private handleRecognitionResult(event: any): void {
    const results = Array.from(event.results)
    const lastResult = results[results.length - 1]

    if (!lastResult.isFinal) return

    const transcript = lastResult[0].transcript.trim().toLowerCase()
    const confidence = lastResult[0].confidence

    // Add to command history
    this.commandHistory.push({
      command: transcript,
      timestamp: Date.now()
    })

    // Find matching command
    const matchingCommand = this.findMatchingCommand(transcript, confidence)
    
    if (matchingCommand) {
      this.executeCommand(matchingCommand, transcript)
    } else {
      this.handleNoCommandMatch(transcript)
    }
  }

  /**
   * Handle recognition errors
   */
  private handleRecognitionError(event: any): void {
    this.errorCount++
    
    let errorMessage = 'Voice recognition error'
    switch (event.error) {
      case 'no-speech':
        errorMessage = 'No speech detected'
        break
      case 'audio-capture':
        errorMessage = 'Microphone not accessible'
        break
      case 'not-allowed':
        errorMessage = 'Microphone permission denied'
        break
      case 'network':
        errorMessage = 'Network error occurred'
        break
    }

    this.speak(errorMessage, 'error')
    this.onError?.(errorMessage)

    if (this.errorCount >= this.maxErrors) {
      this.stopListening()
      this.errorCount = 0
    }
  }

  /**
   * Handle no speech match
   */
  private handleNoMatch(): void {
    this.speak("I didn't understand that command. Please try again.")
  }

  /**
   * Find matching voice command
   */
  private findMatchingCommand(transcript: string, confidence: number): VoiceCommand | null {
    for (const command of this.commands.values()) {
      // Check if command is available in current context
      if (command.context && command.context !== this.currentContext) {
        continue
      }

      // Check confidence threshold
      if (confidence < command.confidence) {
        continue
      }

      // Check if transcript matches command phrase or any synonym
      if (this.matchesCommand(command, transcript)) {
        return command
      }
    }

    return null
  }

  /**
   * Check if transcript matches command
   */
  private matchesCommand(command: VoiceCommand, transcript: string): boolean {
    const phrases = [command.phrase, ...command.synonyms]
    
    return phrases.some(phrase => {
      const normalizedPhrase = phrase.toLowerCase().trim()
      return transcript.includes(normalizedPhrase) || 
             normalizedPhrase.includes(transcript)
    })
  }

  /**
   * Execute voice command
   */
  private async executeCommand(command: VoiceCommand, transcript: string): Promise<void> {
    try {
      // Extract parameters from transcript
      const params = this.extractParameters(command, transcript)
      
      // Confirm command execution
      if (this.feedbackConfig.confirmationEnabled) {
        this.speak(`Executing ${command.description}`)
      }

      // Execute command action
      await command.action(params)

      // Announce successful execution
      if (this.feedbackConfig.announceActions) {
        this.speak(`${command.description} completed`)
      }

      this.onCommandExecuted?.(command, params)
      this.errorCount = 0 // Reset error count on success
    } catch (error) {
      this.handleCommandError(command, error as Error)
    }
  }

  /**
   * Handle command execution errors
   */
  private handleCommandError(command: VoiceCommand, error: Error): void {
    console.error(`Voice command error:`, error)
    
    if (this.feedbackConfig.errorFeedbackEnabled) {
      this.speak(`Error executing ${command.description}: ${error.message}`, 'error')
    }
    
    this.onCommandError?.(command, error)
  }

  /**
   * Handle no command match
   */
  private handleNoCommandMatch(transcript: string): void {
    this.speak(`I don't recognize the command "${transcript}". Say "help" for available commands.`)
    this.onNoCommandMatch?.(transcript)
  }

  /**
   * Extract parameters from transcript
   */
  private extractParameters(command: VoiceCommand, transcript: string): any {
    if (!command.parameters) return {}

    const params: any = {}

    command.parameters.forEach(param => {
      const value = this.extractParameterValue(param, transcript)
      if (value !== null) {
        params[param.name] = this.validateParameter(param, value)
      }
    })

    return params
  }

  /**
   * Extract specific parameter value from transcript
   */
  private extractParameterValue(param: VoiceParameter, transcript: string): any {
    // Simple extraction - in a real implementation, this would use NLP
    switch (param.type) {
      case 'number':
        const numberMatch = transcript.match(/\d+/)
        return numberMatch ? parseInt(numberMatch[0]) : null
        
      case 'string':
        // Extract words that might be names, locations, etc.
        const words = transcript.split(' ')
        return words.length > 1 ? words.slice(1).join(' ') : null
        
      case 'date':
        const datePatterns = [
          /\b(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
          /\b(next week|next month)\b/i,
          /\b(\d{1,2}\/\d{1,2}\/\d{4})\b/
        ]
        
        for (const pattern of datePatterns) {
          const match = transcript.match(pattern)
          if (match) return match[0]
        }
        return null
        
      default:
        return null
    }
  }

  /**
   * Validate parameter value
   */
  private validateParameter(param: VoiceParameter, value: any): any {
    if (!param.validation) return value

    try {
      return param.validation(value) ? value : null
    } catch {
      return null
    }
  }

  /**
   * Initialize healthcare-specific voice commands
   */
  private initializeHealthcareCommands(): void {
    // Search commands
    this.registerCommand({
      id: 'search-doctors',
      phrase: 'search for doctors',
      synonyms: ['find doctors', 'look for doctors', 'search doctors', 'find a doctor'],
      action: async (params) => {
        this.announceAction('Navigating to doctor search')
        // Navigate to doctor search page or focus search field
        const doctorSearchInput = document.querySelector('[data-search-type="doctors"] input')
        if (doctorSearchInput) {
          (doctorSearchInput as HTMLInputElement).focus()
        } else {
          window.location.href = '/doctors/search'
        }
      },
      category: 'search',
      parameters: [
        {
          name: 'specialty',
          type: 'string',
          required: false,
          description: 'Medical specialty to search for'
        },
        {
          name: 'location',
          type: 'string',
          required: false,
          description: 'Location or area to search in'
        }
      ],
      confidence: 0.7,
      description: 'Search for doctors',
      healthcareSpecific: true
    })

    this.registerCommand({
      id: 'search-clinics',
      phrase: 'search for clinics',
      synonyms: ['find clinics', 'look for clinics', 'search clinics', 'find a clinic'],
      action: async (params) => {
        this.announceAction('Navigating to clinic search')
        const clinicSearchInput = document.querySelector('[data-search-type="clinics"] input')
        if (clinicSearchInput) {
          (clinicSearchInput as HTMLInputElement).focus()
        } else {
          window.location.href = '/clinics/search'
        }
      },
      category: 'search',
      confidence: 0.7,
      description: 'Search for clinics',
      healthcareSpecific: true
    })

    this.registerCommand({
      id: 'search-services',
      phrase: 'search for services',
      synonyms: ['find services', 'look for services', 'search services', 'find a service'],
      action: async (params) => {
        this.announceAction('Navigating to service search')
        const serviceSearchInput = document.querySelector('[data-search-type="services"] input')
        if (serviceSearchInput) {
          (serviceSearchInput as HTMLInputElement).focus()
        } else {
          window.location.href = '/services/search'
        }
      },
      category: 'search',
      confidence: 0.7,
      description: 'Search for healthcare services',
      healthcareSpecific: true
    })

    // Booking commands
    this.registerCommand({
      id: 'book-appointment',
      phrase: 'book an appointment',
      synonyms: ['make appointment', 'schedule appointment', 'book appointment', 'schedule visit'],
      action: async (params) => {
        this.announceAction('Starting appointment booking')
        const bookingButton = document.querySelector('[data-action="start-booking"]')
        if (bookingButton) {
          (bookingButton as HTMLElement).click()
        } else {
          window.location.href = '/appointments/book'
        }
      },
      category: 'booking',
      parameters: [
        {
          name: 'doctor',
          type: 'string',
          required: false,
          description: 'Doctor name to book with'
        },
        {
          name: 'date',
          type: 'date',
          required: false,
          description: 'Preferred appointment date'
        }
      ],
      confidence: 0.8,
      description: 'Book an appointment',
      healthcareSpecific: true
    })

    this.registerCommand({
      id: 'view-appointments',
      phrase: 'view my appointments',
      synonyms: ['show appointments', 'my appointments', 'appointment list', 'see appointments'],
      action: async () => {
        this.announceAction('Navigating to appointments page')
        window.location.href = '/appointments'
      },
      category: 'booking',
      confidence: 0.8,
      description: 'View appointment list',
      healthcareSpecific: true
    })

    this.registerCommand({
      id: 'cancel-appointment',
      phrase: 'cancel appointment',
      synonyms: ['cancel booking', 'remove appointment', 'delete appointment'],
      action: async (params) => {
        this.announceAction('Opening appointment cancellation')
        // This would typically open a cancellation dialog
        const cancelButton = document.querySelector('[data-action="cancel-appointment"]')
        if (cancelButton) {
          (cancelButton as HTMLElement).click()
        }
      },
      category: 'booking',
      parameters: [
        {
          name: 'appointmentId',
          type: 'string',
          required: false,
          description: 'Specific appointment to cancel'
        }
      ],
      confidence: 0.8,
      description: 'Cancel an appointment',
      healthcareSpecific: true
    })

    // Navigation commands
    this.registerCommand({
      id: 'go-to-home',
      phrase: 'go to home',
      synonyms: ['home page', 'main page', 'go home', 'home'],
      action: async () => {
        this.announceAction('Navigating to home page')
        window.location.href = '/'
      },
      category: 'navigation',
      confidence: 0.9,
      description: 'Navigate to home page',
      healthcareSpecific: false
    })

    this.registerCommand({
      id: 'go-back',
      phrase: 'go back',
      synonyms: ['back', 'previous', 'return'],
      action: async () => {
        this.announceAction('Going back')
        window.history.back()
      },
      category: 'navigation',
      confidence: 0.8,
      description: 'Navigate back',
      healthcareSpecific: false
    })

    // Information commands
    this.registerCommand({
      id: 'show-help',
      phrase: 'show help',
      synonyms: ['help', 'what can I say', 'commands', 'voice help'],
      action: async () => {
        this.announceAction('Showing available voice commands')
        this.showVoiceCommands()
      },
      category: 'information',
      confidence: 0.9,
      description: 'Show voice commands help',
      healthcareSpecific: false
    })

    this.registerCommand({
      id: 'read-page',
      phrase: 'read this page',
      synonyms: ['read page', 'summarize page', 'page summary'],
      action: async () => {
        this.announceAction('Reading page content')
        this.readPageContent()
      },
      category: 'information',
      confidence: 0.7,
      description: 'Read current page content',
      healthcareSpecific: false
    })

    // Accessibility commands
    this.registerCommand({
      id: 'increase-font',
      phrase: 'increase font size',
      synonyms: ['bigger text', 'larger text', 'zoom in text'],
      action: async () => {
        this.announceAction('Increasing font size')
        const fontButton = document.querySelector('[data-accessibility="font-increase"]')
        if (fontButton) {
          (fontButton as HTMLElement).click()
        }
      },
      category: 'accessibility',
      confidence: 0.8,
      description: 'Increase font size',
      healthcareSpecific: false
    })

    this.registerCommand({
      id: 'decrease-font',
      phrase: 'decrease font size',
      synonyms: ['smaller text', 'reduce text', 'zoom out text'],
      action: async () => {
        this.announceAction('Decreasing font size')
        const fontButton = document.querySelector('[data-accessibility="font-decrease"]')
        if (fontButton) {
          (fontButton as HTMLElement).click()
        }
      },
      category: 'accessibility',
      confidence: 0.8,
      description: 'Decrease font size',
      healthcareSpecific: false
    })

    this.registerCommand({
      id: 'toggle-contrast',
      phrase: 'toggle high contrast',
      synonyms: ['high contrast mode', 'contrast mode', 'toggle contrast'],
      action: async () => {
        this.announceAction('Toggling high contrast mode')
        const contrastToggle = document.querySelector('[data-accessibility="high-contrast"]')
        if (contrastToggle) {
          (contrastToggle as HTMLElement).click()
        }
      },
      category: 'accessibility',
      confidence: 0.8,
      description: 'Toggle high contrast mode',
      healthcareSpecific: false
    })
  }

  /**
   * Register voice command
   */
  registerCommand(command: VoiceCommand): void {
    this.commands.set(command.id, command)
  }

  /**
   * Unregister voice command
   */
  unregisterCommand(commandId: string): void {
    this.commands.delete(commandId)
  }

  /**
   * Start voice recognition
   */
  startListening(): boolean {
    if (!this.isSupported || this.isListening) return false

    try {
      this.recognition.start()
      return true
    } catch (error) {
      console.error('Failed to start voice recognition:', error)
      return false
    }
  }

  /**
   * Stop voice recognition
   */
  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
    }
  }

  /**
   * Toggle voice recognition
   */
  toggleListening(): boolean {
    if (this.isListening) {
      this.stopListening()
      return false
    } else {
      return this.startListening()
    }
  }

  /**
   * Speak text using speech synthesis
   */
  speak(text: string, type: 'normal' | 'error' | 'confirmation' = 'normal'): void {
    if (!this.feedbackConfig.speechEnabled) return

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = this.feedbackConfig.speechRate
    utterance.pitch = this.feedbackConfig.speechPitch
    utterance.volume = this.feedbackConfig.speechVolume

    // Set voice based on type
    switch (type) {
      case 'error':
        utterance.pitch = 0.8
        utterance.rate = 0.9
        break
      case 'confirmation':
        utterance.pitch = 1.2
        utterance.rate = 1.1
        break
    }

    this.synthesis.speak(utterance)
  }

  /**
   * Announce action to user
   */
  private announceAction(action: string): void {
    if (this.feedbackConfig.announceActions) {
      this.speak(action)
    }
  }

  /**
   * Show available voice commands
   */
  private showVoiceCommands(): void {
    const commandsByCategory = this.groupCommandsByCategory()
    
    let message = 'Available voice commands: '
    Object.entries(commandsByCategory).forEach(([category, commands]) => {
      message += `${category}: `
      commands.forEach(command => {
        message += `"${command.phrase}", `
      })
    })

    this.speak(message)
  }

  /**
   * Group commands by category
   */
  private groupCommandsByCategory(): Record<string, VoiceCommand[]> {
    const grouped: Record<string, VoiceCommand[]> = {}
    
    for (const command of this.commands.values()) {
      if (!grouped[command.category]) {
        grouped[command.category] = []
      }
      grouped[command.category].push(command)
    }
    
    return grouped
  }

  /**
   * Read page content
   */
  private readPageContent(): void {
    const content = document.querySelector('main, [role="main"]')
    if (content) {
      const text = content.textContent || ''
      const truncatedText = text.length > 500 ? text.substring(0, 500) + '...' : text
      this.speak(truncatedText)
    }
  }

  /**
   * Set current context
   */
  setContext(context: string): void {
    this.currentContext = context
  }

  /**
   * Get current context
   */
  getContext(): string {
    return this.currentContext
  }

  /**
   * Get available commands
   */
  getAvailableCommands(): VoiceCommand[] {
    return Array.from(this.commands.values()).filter(command => 
      !command.context || command.context === this.currentContext
    )
  }

  /**
   * Event callbacks
   */
  public onListeningStart?: () => void
  public onListeningEnd?: () => void
  public onCommandExecuted?: (command: VoiceCommand, params: any) => void
  public onCommandError?: (command: VoiceCommand, error: Error) => void
  public onNoCommandMatch?: (transcript: string) => void
  public onError?: (error: string) => void

  /**
   * Get configuration
   */
  getConfig(): { recognition: VoiceRecognitionConfig; feedback: VoiceFeedbackConfig } {
    return {
      recognition: { ...this.config },
      feedback: { ...this.feedbackConfig }
    }
  }

  /**
   * Update configuration
   */
  updateConfig(updates: { recognition?: Partial<VoiceRecognitionConfig>; feedback?: Partial<VoiceFeedbackConfig> }): void {
    if (updates.recognition) {
      this.config = { ...this.config, ...updates.recognition }
      if (this.recognition) {
        this.recognition.continuous = this.config.continuous
        this.recognition.interimResults = this.config.interimResults
        this.recognition.maxAlternatives = this.config.maxAlternatives
        this.recognition.lang = this.config.language
      }
    }

    if (updates.feedback) {
      this.feedbackConfig = { ...this.feedbackConfig, ...updates.feedback }
    }
  }

  /**
   * Get status
   */
  getStatus(): { isSupported: boolean; isListening: boolean; currentContext: string } {
    return {
      isSupported: this.isSupported,
      isListening: this.isListening,
      currentContext: this.currentContext
    }
  }
}

// Context for voice navigation management
const VoiceNavigationContext = createContext<HealthcareVoiceNavigationManager | null>(null)

export function VoiceNavigationProvider({ children }: { children: React.ReactNode }) {
  const [manager, setManager] = useState<HealthcareVoiceNavigationManager | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    const voiceManager = HealthcareVoiceNavigationManager.getInstance()
    
    // Set up event handlers
    voiceManager.onListeningStart = () => setIsListening(true)
    voiceManager.onListeningEnd = () => setIsListening(false)
    
    setManager(voiceManager)
    setIsSupported(voiceManager.getStatus().isSupported)

    return () => {
      setManager(null)
    }
  }, [])

  const toggleListening = useCallback(() => {
    if (manager) {
      manager.toggleListening()
    }
  }, [manager])

  return (
    <VoiceNavigationContext.Provider value={manager}>
      {children}
      {/* Voice navigation status indicator */}
      {isSupported && (
        <div className="voice-navigation-status" role="status" aria-live="polite">
          <button
            onClick={toggleListening}
            className={`voice-toggle-btn ${isListening ? 'listening' : ''}`}
            aria-pressed={isListening}
            aria-label={isListening ? 'Stop voice recognition' : 'Start voice recognition'}
          >
            {isListening ? '🎤 Listening...' : '🎤 Voice Command'}
          </button>
        </div>
      )}
    </VoiceNavigationContext.Provider>
  )
}

export function useVoiceNavigation() {
  const context = useContext(VoiceNavigationContext)
  if (!context) {
    throw new Error('useVoiceNavigation must be used within VoiceNavigationProvider')
  }
  return context
}

// Specialized hooks for different healthcare workflows
export function useClinicVoiceSearch() {
  const manager = useVoiceNavigation()
  
  return {
    searchNearbyClinics: () => manager.registerCommand({
      id: 'voice-search-nearby-clinics',
      phrase: 'find clinics near me',
      synonyms: ['clinics near me', 'nearby clinics', 'local clinics'],
      action: async () => {
        // Trigger location-based clinic search
        const searchButton = document.querySelector('[data-action="search-nearby-clinics"]')
        if (searchButton) {
          (searchButton as HTMLElement).click()
        }
      },
      category: 'search',
      confidence: 0.8,
      description: 'Search for nearby clinics',
      healthcareSpecific: true
    }),
    
    searchBySpecialty: (specialty: string) => manager.registerCommand({
      id: `voice-search-${specialty}`,
      phrase: `find ${specialty} clinics`,
      synonyms: [`${specialty} doctor`, `${specialty} specialist`],
      action: async () => {
        // Focus specialty search
        const specialtyInput = document.querySelector(`[data-specialty="${specialty}"]`)
        if (specialtyInput) {
          (specialtyInput as HTMLInputElement).focus()
        }
      },
      category: 'search',
      confidence: 0.7,
      description: `Search for ${specialty} clinics`,
      healthcareSpecific: true
    })
  }
}

export function useAppointmentVoiceBooking() {
  const manager = useVoiceNavigation()
  
  return {
    quickBook: () => manager.registerCommand({
      id: 'voice-quick-book',
      phrase: 'quick book',
      synonyms: ['fast booking', 'rapid booking'],
      action: async () => {
        // Open quick booking dialog
        const quickBookBtn = document.querySelector('[data-action="quick-book"]')
        if (quickBookBtn) {
          (quickBookBtn as HTMLElement).click()
        }
      },
      category: 'booking',
      confidence: 0.8,
      description: 'Start quick appointment booking',
      healthcareSpecific: true
    }),
    
    rescheduleToday: () => manager.registerCommand({
      id: 'voice-reschedule-today',
      phrase: 'reschedule for today',
      synonyms: ['move appointment today', 'book today'],
      action: async () => {
        // Set booking date to today
        const dateInput = document.querySelector('[data-booking="date"]')
        if (dateInput) {
          (dateInput as HTMLInputElement).value = new Date().toISOString().split('T')[0]
          const changeEvent = new Event('change', { bubbles: true })
          dateInput.dispatchEvent(changeEvent)
        }
      },
      category: 'booking',
      confidence: 0.7,
      description: 'Reschedule appointment for today',
      healthcareSpecific: true
    })
  }
}