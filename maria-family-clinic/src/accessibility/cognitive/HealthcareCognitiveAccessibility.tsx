/**
 * Cognitive Accessibility System
 * Support for users with cognitive disabilities through simplified patterns and clear guidance
 */

"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'

export interface CognitiveProfile {
  id: string
  name: string
  description: string
  preferences: CognitivePreferences
  supportedFeatures: CognitiveFeature[]
}

export interface CognitivePreferences {
  simplifiedLanguage: boolean
  reducedComplexity: boolean
  stepByStepGuidance: boolean
  extraTimeForTasks: boolean
  errorPrevention: boolean
  clearNavigation: boolean
  consistentLayout: boolean
  visualCues: boolean
  audioPrompts: boolean
  reducedDistractions: boolean
}

export interface CognitiveFeature {
  id: string
  name: string
  description: string
  type: 'navigation' | 'content' | 'interaction' | 'feedback' | 'assistance'
  implementation: string
  automated: boolean
}

export interface SimplifiedContent {
  title: string
  simplifiedTitle: string
  content: string
  simplifiedContent: string
  keyPoints: string[]
  simplifiedKeyPoints: string[]
  steps: ContentStep[]
  simplifiedSteps: ContentStep[]
  warnings: string[]
  simplifiedWarnings: string[]
}

export interface ContentStep {
  id: string
  title: string
  description: string
  action: string
  expectedOutcome: string
  timeEstimate?: string
  difficulty: 'easy' | 'medium' | 'hard'
  prerequisites?: string[]
  help?: string
}

export interface ErrorPreventionRule {
  id: string
  condition: string
  prevention: string
  message: string
  severity: 'info' | 'warning' | 'error'
  autoFix?: boolean
}

export class CognitiveAccessibilityManager {
  private static instance: CognitiveAccessibilityManager
  private currentProfile: CognitiveProfile | null = null
  private profiles: Map<string, CognitiveProfile> = new Map()
  private simplifiedContentCache: Map<string, SimplifiedContent> = new Map()
  private assistanceLevel: 'minimal' | 'moderate' | 'maximal' = 'moderate'
  private autoAssistanceEnabled = true
  private sessionStartTime: number = Date.now()

  constructor() {
    this.initializeDefaultProfiles()
    this.initializeErrorPrevention()
  }

  public static getInstance(): CognitiveAccessibilityManager {
    if (!CognitiveAccessibilityManager.instance) {
    CognitiveAccessibilityManager.instance = new CognitiveAccessibilityManager()
    }
    return CognitiveAccessibilityManager.instance
  }

  /**
   * Initialize default cognitive accessibility profiles
   */
  private initializeDefaultProfiles(): void {
    // Profile for users who need simplified content
    this.profiles.set('simplified-content', {
      id: 'simplified-content',
      name: 'Simplified Content',
      description: 'For users who benefit from simpler language and clear structure',
      preferences: {
        simplifiedLanguage: true,
        reducedComplexity: true,
        stepByStepGuidance: true,
        extraTimeForTasks: false,
        errorPrevention: true,
        clearNavigation: true,
        consistentLayout: true,
        visualCues: true,
        audioPrompts: false,
        reducedDistractions: false
      },
      supportedFeatures: [
        {
          id: 'simplified-text',
          name: 'Simplified Text',
          description: 'Uses simpler words and shorter sentences',
          type: 'content',
          implementation: 'automatic',
          automated: true
        },
        {
          id: 'clear-structure',
          name: 'Clear Structure',
          description: 'Well-organized content with clear headings',
          type: 'content',
          implementation: 'automatic',
          automated: true
        },
        {
          id: 'step-by-step',
          name: 'Step-by-Step Guide',
          description: 'Breaks complex tasks into simple steps',
          type: 'assistance',
          implementation: 'manual',
          automated: false
        }
      ]
    })

    // Profile for users who need extra time and reduced complexity
    this.profiles.set('extra-time', {
      id: 'extra-time',
      name: 'Extra Time & Reduced Complexity',
      description: 'For users who need more time and prefer less complex interfaces',
      preferences: {
        simplifiedLanguage: true,
        reducedComplexity: true,
        stepByStepGuidance: true,
        extraTimeForTasks: true,
        errorPrevention: true,
        clearNavigation: true,
        consistentLayout: true,
        visualCues: true,
        audioPrompts: true,
        reducedDistractions: true
      },
      supportedFeatures: [
        {
          id: 'time-extension',
          name: 'Extended Time',
          description: 'Longer time limits for timed tasks',
          type: 'assistance',
          implementation: 'automatic',
          automated: true
        },
        {
          id: 'reduced-motion',
          name: 'Reduced Motion',
          description: 'Less animation and movement',
          type: 'content',
          implementation: 'automatic',
          automated: true
        },
        {
          id: 'audio-cues',
          name: 'Audio Cues',
          description: 'Audio feedback for actions',
          type: 'feedback',
          implementation: 'automatic',
          automated: true
        }
      ]
    })

    // Profile for users with attention difficulties
    this.profiles.set('focus-assistance', {
      id: 'focus-assistance',
      name: 'Focus Assistance',
      description: 'For users with attention difficulties who benefit from focus guidance',
      preferences: {
        simplifiedLanguage: false,
        reducedComplexity: true,
        stepByStepGuidance: true,
        extraTimeForTasks: true,
        errorPrevention: true,
        clearNavigation: true,
        consistentLayout: true,
        visualCues: true,
        audioPrompts: true,
        reducedDistractions: true
      },
      supportedFeatures: [
        {
          id: 'focus-highlighting',
          name: 'Focus Highlighting',
          description: 'Clear visual focus indicators',
          type: 'interaction',
          implementation: 'automatic',
          automated: true
        },
        {
          id: 'attention-guidance',
          name: 'Attention Guidance',
          description: 'Visual cues to guide attention',
          type: 'assistance',
          implementation: 'automatic',
          automated: true
        },
        {
          id: 'reduced-distractions',
          name: 'Reduced Distractions',
          description: 'Minimizes non-essential visual elements',
          type: 'content',
          implementation: 'automatic',
          automated: true
        }
      ]
    })
  }

  /**
   * Initialize error prevention rules
   */
  private initializeErrorPrevention(): void {
    // Add common error prevention rules for healthcare workflows
    this.addErrorPreventionRule({
      id: 'appointment-date-validation',
      condition: 'appointment booking date is in the past',
      prevention: 'block booking and suggest future dates',
      message: 'Please select a future date for your appointment',
      severity: 'warning',
      autoFix: false
    })

    this.addErrorPreventionRule({
      id: 'contact-format-validation',
      condition: 'phone number format is invalid',
      prevention: 'format validation with example',
      message: 'Please enter your phone number in the format: +65 9123 4567',
      severity: 'info',
      autoFix: false
    })

    this.addErrorPreventionRule({
      id: 'medical-term-misunderstanding',
      condition: 'complex medical term is used without explanation',
      prevention: 'automatic explanation popup',
      message: 'Medical term explained: [term] means [definition]',
      severity: 'info',
      autoFix: true
    })
  }

  /**
   * Set cognitive accessibility profile
   */
  setProfile(profileId: string): void {
    const profile = this.profiles.get(profileId)
    if (!profile) {
      console.warn(`Cognitive profile ${profileId} not found`)
      return
    }

    this.currentProfile = profile
    this.applyProfilePreferences(profile.preferences)
    this.saveProfilePreference(profileId)
  }

  /**
   * Get current cognitive profile
   */
  getCurrentProfile(): CognitiveProfile | null {
    return this.currentProfile
  }

  /**
   * Apply profile preferences to the interface
   */
  private applyProfilePreferences(preferences: CognitivePreferences): void {
    const root = document.documentElement

    // Apply simplified language
    if (preferences.simplifiedLanguage) {
      root.classList.add('cognitive-simplified-language')
    } else {
      root.classList.remove('cognitive-simplified-language')
    }

    // Apply reduced complexity
    if (preferences.reducedComplexity) {
      root.classList.add('cognitive-reduced-complexity')
    } else {
      root.classList.remove('cognitive-reduced-complexity')
    }

    // Apply step-by-step guidance
    if (preferences.stepByStepGuidance) {
      root.classList.add('cognitive-step-by-step')
    } else {
      root.classList.remove('cognitive-step-by-step')
    }

    // Apply reduced distractions
    if (preferences.reducedDistractions) {
      root.classList.add('cognitive-reduced-distractions')
    } else {
      root.classList.remove('cognitive-reduced-distractions')
    }

    // Apply visual cues
    if (preferences.visualCues) {
      root.classList.add('cognitive-visual-cues')
    } else {
      root.classList.remove('cognitive-visual-cues')
    }

    // Apply consistent layout
    if (preferences.consistentLayout) {
      root.classList.add('cognitive-consistent-layout')
    } else {
      root.classList.remove('cognitive-consistent-layout')
    }

    // Apply extra time for tasks
    if (preferences.extraTimeForTasks) {
      root.classList.add('cognitive-extra-time')
    } else {
      root.classList.remove('cognitive-extra-time')
    }
  }

  /**
   * Simplify content for cognitive accessibility
   */
  simplifyContent(originalContent: string, context: string = 'general'): SimplifiedContent {
    const cacheKey = `${context}-${originalContent.substring(0, 50)}`
    
    if (this.simplifiedContentCache.has(cacheKey)) {
      return this.simplifiedContentCache.get(cacheKey)!
    }

    // For demo purposes, use simple text transformations
    // In a real implementation, this would use AI/NLP services
    const simplifiedContent = this.applyTextSimplification(originalContent)
    
    const result: SimplifiedContent = {
      title: this.extractTitle(originalContent) || 'Information',
      simplifiedTitle: this.extractTitle(simplifiedContent) || 'Simple Information',
      content: originalContent,
      simplifiedContent,
      keyPoints: this.extractKeyPoints(originalContent),
      simplifiedKeyPoints: this.extractKeyPoints(simplifiedContent),
      steps: this.extractSteps(originalContent),
      simplifiedSteps: this.extractSteps(simplifiedContent),
      warnings: this.extractWarnings(originalContent),
      simplifiedWarnings: this.extractWarnings(simplifiedContent)
    }

    this.simplifiedContentCache.set(cacheKey, result)
    return result
  }

  /**
   * Apply text simplification rules
   */
  private applyTextSimplification(content: string): string {
    let simplified = content

    // Replace complex medical terms with simpler alternatives
    const medicalTermReplacements: Record<string, string> = {
      'hypertension': 'high blood pressure',
      'diagnosis': 'finding out what is wrong',
      'prescription': 'medicine instructions',
      'appointment': 'meeting with doctor',
      'consultation': 'talking with doctor',
      'symptoms': 'signs of illness',
      'medication': 'medicine',
      'treatment': 'care plan',
      'procedure': 'medical process',
      'examination': 'check-up'
    }

    Object.entries(medicalTermReplacements).forEach(([complex, simple]) => {
      const regex = new RegExp(complex, 'gi')
      simplified = simplified.replace(regex, simple)
    })

    // Break long sentences into shorter ones
    simplified = simplified.replace(/[,;:]\s+/g, '. ')
    
    // Simplify complex sentence structures
    simplified = simplified.replace(/\b(however|nevertheless|furthermore|therefore|consequently)\b/gi, 'also')
    
    // Remove unnecessary filler words
    simplified = simplified.replace(/\b(really|very|actually|basically|literally)\b/gi, '')
    
    return simplified
  }

  /**
   * Extract title from content
   */
  private extractTitle(content: string): string | null {
    const titleMatch = content.match(/^(.+?)(?:\n|\.|$)/)
    return titleMatch ? titleMatch[1].trim() : null
  }

  /**
   * Extract key points from content
   */
  private extractKeyPoints(content: string): string[] {
    const sentences = content.split(/[.!?]+/)
    return sentences
      .filter(sentence => sentence.trim().length > 0)
      .map(sentence => sentence.trim())
      .slice(0, 5) // Limit to 5 key points
  }

  /**
   * Extract steps from content
   */
  private extractSteps(content: string): ContentStep[] {
    const stepPattern = /\b(step\s*\d+|first|second|third|next|then|finally)\b/gi
    const matches = content.match(stepPattern)
    
    if (!matches) return []

    return matches.map((match, index) => ({
      id: `step-${index}`,
      title: `Step ${index + 1}`,
      description: `Perform action ${index + 1}`,
      action: `Complete step ${index + 1}`,
      expectedOutcome: `Success for step ${index + 1}`,
      difficulty: 'easy'
    }))
  }

  /**
   * Extract warnings from content
   */
  private extractWarnings(content: string): string[] {
    const warningPatterns = [
      /\b(warning|caution|important|note|remember)\b.*?(?=[.!?]|$)/gi,
      /\b(do not|don't|avoid|never)\b.*?(?=[.!?]|$)/gi,
      /\b(should|must|required|necessary)\b.*?(?=[.!?]|$)/gi
    ]

    const warnings: string[] = []
    
    warningPatterns.forEach(pattern => {
      const matches = content.match(pattern)
      if (matches) {
        warnings.push(...matches)
      }
    })

    return warnings.map(warning => warning.trim()).slice(0, 3)
  }

  /**
   * Add error prevention rule
   */
  addErrorPreventionRule(rule: ErrorPreventionRule): void {
    // Store rule in a global registry
    ;(window as any).__cognitive_error_prevention_rules = (window as any).__cognitive_error_prevention_rules || []
    ;(window as any).__cognitive_error_prevention_rules.push(rule)
  }

  /**
   * Check for potential errors and prevent them
   */
  async checkAndPreventError(element: HTMLElement, value: any): Promise<ErrorPreventionResult> {
    const rules = (window as any).__cognitive_error_prevention_rules || []
    const warnings: ErrorPreventionRule[] = []
    let autoFixed = false

    for (const rule of rules) {
      if (this.evaluateCondition(rule.condition, element, value)) {
        warnings.push(rule)
        
        if (rule.autoFix) {
          const fixed = await this.applyAutoFix(rule, element, value)
          if (fixed) {
            autoFixed = true
          }
        }
      }
    }

    return {
      hasWarnings: warnings.length > 0,
      warnings,
      autoFixed,
      blocked: warnings.some(w => w.severity === 'error')
    }
  }

  /**
   * Evaluate error prevention rule condition
   */
  private evaluateCondition(condition: string, element: HTMLElement, value: any): boolean {
    // Simple condition evaluation for demo
    // In production, this would be more sophisticated
    
    if (condition.includes('appointment booking date is in the past')) {
      if (element.getAttribute('type') === 'date' && value) {
        const inputDate = new Date(value)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return inputDate < today
      }
    }
    
    if (condition.includes('phone number format is invalid')) {
      if (element.getAttribute('type') === 'tel') {
        const phonePattern = /^\+65\s?\d{4}\s?\d{4}$/
        return !phonePattern.test(value)
      }
    }
    
    return false
  }

  /**
   * Apply automatic fix for error
   */
  private async applyAutoFix(rule: ErrorPreventionRule, element: HTMLElement, value: any): Promise<boolean> {
    // Simple auto-fix implementation
    if (rule.condition.includes('phone number format is invalid')) {
      const phonePattern = /(\d{4})(\d{4})/
      const match = value.replace(/\D/g, '').match(phonePattern)
      if (match) {
        const formatted = `+65 ${match[1]} ${match[2]}`
        ;(element as HTMLInputElement).value = formatted
        return true
      }
    }
    
    return false
  }

  /**
   * Generate step-by-step guidance for complex tasks
   */
  generateStepByStepGuidance(task: string, context: string = 'general'): ContentStep[] {
    const healthcareTasks: Record<string, ContentStep[]> = {
      'book-appointment': [
        {
          id: 'step-1',
          title: 'Choose Doctor',
          description: 'Find and select the doctor you want to see',
          action: 'Click on doctor name or photo',
          expectedOutcome: 'Doctor information is displayed',
          difficulty: 'easy',
          help: 'You can search by name or specialty'
        },
        {
          id: 'step-2',
          title: 'Select Date',
          description: 'Pick when you want your appointment',
          action: 'Click on calendar date',
          expectedOutcome: 'Available times are shown',
          timeEstimate: '2-3 minutes',
          difficulty: 'easy',
          help: 'Choose a date in the future'
        },
        {
          id: 'step-3',
          title: 'Choose Time',
          description: 'Select your preferred appointment time',
          action: 'Click on available time slot',
          expectedOutcome: 'Time is selected',
          difficulty: 'easy'
        },
        {
          id: 'step-4',
          title: 'Confirm Details',
          description: 'Review your appointment information',
          action: 'Check all details are correct',
          expectedOutcome: 'All information looks right',
          difficulty: 'easy'
        },
        {
          id: 'step-5',
          title: 'Book Appointment',
          description: 'Confirm and book your appointment',
          action: 'Click "Book Appointment" button',
          expectedOutcome: 'Appointment is confirmed',
          difficulty: 'easy',
          help: 'You will receive confirmation message'
        }
      ],
      'search-doctor': [
        {
          id: 'step-1',
          title: 'Enter Search',
          description: 'Type the doctor name or specialty you want',
          action: 'Type in search box',
          expectedOutcome: 'Search results appear',
          difficulty: 'easy'
        },
        {
          id: 'step-2',
          title: 'Review Results',
          description: 'Look at the doctor information shown',
          action: 'Read doctor details',
          expectedOutcome: 'You see doctor profiles',
          difficulty: 'easy'
        },
        {
          id: 'step-3',
          title: 'Select Doctor',
          description: 'Choose the doctor you want to see',
          action: 'Click on doctor name',
          expectedOutcome: 'Doctor page opens',
          difficulty: 'easy'
        }
      ]
    }

    return healthcareTasks[task] || this.generateGenericSteps(task)
  }

  /**
   * Generate generic steps for unknown tasks
   */
  private generateGenericSteps(task: string): ContentStep[] {
    return [
      {
        id: 'step-1',
        title: 'Start Task',
        description: `Begin ${task}`,
        action: `Click to start ${task}`,
        expectedOutcome: 'Task interface is ready',
        difficulty: 'easy'
      },
      {
        id: 'step-2',
        title: 'Follow Instructions',
        description: 'Complete each step as shown',
        action: 'Complete each step shown',
        expectedOutcome: 'All steps completed',
        difficulty: 'easy'
      },
      {
        id: 'step-3',
        title: 'Finish Task',
        description: 'Complete the final action',
        action: 'Click finish or submit',
        expectedOutcome: 'Task is complete',
        difficulty: 'easy'
      }
    ]
  }

  /**
   * Provide assistance based on current context and user profile
   */
  provideAssistance(context: string, action: string, userNeeds: string[]): AssistanceRecommendation {
    const profile = this.getCurrentProfile()
    
    if (!profile) {
      return {
        type: 'none',
        recommendations: [],
        steps: [],
        warnings: []
      }
    }

    const recommendations: string[] = []
    const warnings: string[] = []
    let steps: ContentStep[] = []
    let assistanceType: 'minimal' | 'moderate' | 'maximal' = 'minimal'

    // Determine assistance level based on profile and context
    if (profile.preferences.extraTimeForTasks) {
      assistanceType = 'maximal'
      recommendations.push('Take your time - there is no rush')
    }

    if (profile.preferences.stepByStepGuidance) {
      steps = this.generateStepByStepGuidance(action, context)
      assistanceType = 'maximal'
      recommendations.push('Follow the step-by-step guide')
    }

    if (profile.preferences.errorPrevention) {
      warnings.push('Be careful with entering personal information')
      recommendations.push('Double-check all information before submitting')
    }

    if (profile.preferences.audioPrompts) {
      recommendations.push('Listen carefully to audio instructions')
    }

    return {
      type: assistanceType,
      recommendations,
      steps,
      warnings
    }
  }

  /**
   * Save profile preference
   */
  private saveProfilePreference(profileId: string): void {
    try {
      localStorage.setItem('cognitive-accessibility-profile', profileId)
    } catch (error) {
      console.warn('Failed to save cognitive profile preference:', error)
    }
  }

  /**
   * Load saved profile preference
   */
  loadSavedProfile(): void {
    try {
      const saved = localStorage.getItem('cognitive-accessibility-profile')
      if (saved && this.profiles.has(saved)) {
        this.setProfile(saved)
      }
    } catch (error) {
      console.warn('Failed to load cognitive profile preference:', error)
    }
  }

  /**
   * Get all available profiles
   */
  getAvailableProfiles(): CognitiveProfile[] {
    return Array.from(this.profiles.values())
  }

  /**
   * Get assistance level
   */
  getAssistanceLevel(): 'minimal' | 'moderate' | 'maximal' {
    return this.assistanceLevel
  }

  /**
   * Set assistance level
   */
  setAssistanceLevel(level: 'minimal' | 'moderate' | 'maximal'): void {
    this.assistanceLevel = level
  }

  /**
   * Get session metrics
   */
  getSessionMetrics(): SessionMetrics {
    return {
      sessionDuration: Date.now() - this.sessionStartTime,
      assistanceUsed: this.assistanceLevel,
      profileActive: this.currentProfile?.name || 'none',
      errorsPrevented: 0, // Would be tracked in real implementation
      stepsCompleted: 0 // Would be tracked in real implementation
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.simplifiedContentCache.clear()
    this.profiles.clear()
    this.currentProfile = null
  }
}

interface ErrorPreventionResult {
  hasWarnings: boolean
  warnings: ErrorPreventionRule[]
  autoFixed: boolean
  blocked: boolean
}

interface AssistanceRecommendation {
  type: 'minimal' | 'moderate' | 'maximal'
  recommendations: string[]
  steps: ContentStep[]
  warnings: string[]
}

interface SessionMetrics {
  sessionDuration: number
  assistanceUsed: 'minimal' | 'moderate' | 'maximal'
  profileActive: string
  errorsPrevented: number
  stepsCompleted: number
}

// Context for cognitive accessibility management
const CognitiveAccessibilityContext = createContext<CognitiveAccessibilityManager | null>(null)

export function CognitiveAccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [manager, setManager] = useState<CognitiveAccessibilityManager | null>(null)

  useEffect(() => {
    const cognitiveManager = CognitiveAccessibilityManager.getInstance()
    
    // Load saved profile
    cognitiveManager.loadSavedProfile()
    
    setManager(cognitiveManager)

    return () => {
      cognitiveManager.destroy()
      setManager(null)
    }
  }, [])

  return (
    <CognitiveAccessibilityContext.Provider value={manager}>
      {children}
    </CognitiveAccessibilityContext.Provider>
  )
}

export function useCognitiveAccessibility() {
  const context = useContext(CognitiveAccessibilityContext)
  if (!context) {
    throw new Error('useCognitiveAccessibility must be used within CognitiveAccessibilityProvider')
  }
  return context
}

// Specialized hooks for different cognitive accessibility features
export function useSimplifiedContent() {
  const manager = useCognitiveAccessibility()
  
  return {
    simplifyContent: manager.simplifyContent.bind(manager),
    getCurrentProfile: manager.getCurrentProfile,
    setProfile: manager.setProfile.bind(manager)
  }
}

export function useErrorPrevention() {
  const manager = useCognitiveAccessibility()
  
  return {
    checkAndPreventError: manager.checkAndPreventError.bind(manager),
    addErrorPreventionRule: manager.addErrorPreventionRule.bind(manager)
  }
}

export function useStepByStepGuidance() {
  const manager = useCognitiveAccessibility()
  
  return {
    generateGuidance: manager.generateStepByStepGuidance.bind(manager),
    provideAssistance: manager.provideAssistance.bind(manager)
  }
}

// Components for cognitive accessibility features
export function CognitiveProfileSelector({ 
  onProfileChange,
  className = '' 
}: { 
  onProfileChange?: (profileId: string) => void
  className?: string 
}) {
  const manager = useCognitiveAccessibility()
  const [currentProfile, setCurrentProfile] = useState<CognitiveProfile | null>(null)

  useEffect(() => {
    setCurrentProfile(manager.getCurrentProfile())
  }, [manager])

  const profiles = manager.getAvailableProfiles()

  const handleProfileChange = (profileId: string) => {
    manager.setProfile(profileId)
    setCurrentProfile(manager.getCurrentProfile())
    onProfileChange?.(profileId)
  }

  return (
    <div className={`cognitive-profile-selector ${className}`} role="group" aria-label="Accessibility Preferences">
      <h3>Choose Your Accessibility Preference</h3>
      
      {profiles.map((profile) => (
        <div key={profile.id} className="profile-option">
          <input
            type="radio"
            id={profile.id}
            name="cognitive-profile"
            value={profile.id}
            checked={currentProfile?.id === profile.id}
            onChange={() => handleProfileChange(profile.id)}
          />
          <label htmlFor={profile.id}>
            <div className="profile-name">{profile.name}</div>
            <div className="profile-description">{profile.description}</div>
            <div className="profile-features">
              {profile.supportedFeatures.slice(0, 3).map(feature => (
                <span key={feature.id} className="feature-tag">
                  {feature.name}
                </span>
              ))}
            </div>
          </label>
        </div>
      ))}
    </div>
  )
}

export function StepByStepGuide({ 
  steps,
  currentStep,
  onStepComplete,
  className = '' 
}: { 
  steps: ContentStep[]
  currentStep: number
  onStepComplete: (stepId: string) => void
  className?: string 
}) {
  return (
    <div className={`step-by-step-guide ${className}`} role="region" aria-label="Step-by-step guidance">
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          role="progressbar"
          aria-valuenow={currentStep + 1}
          aria-valuemin={1}
          aria-valuemax={steps.length}
          aria-label={`Step ${currentStep + 1} of ${steps.length}`}
        />
      </div>

      {steps.map((step, index) => (
        <div 
          key={step.id} 
          className={`step ${index === currentStep ? 'current' : index < currentStep ? 'completed' : 'upcoming'}`}
          aria-current={index === currentStep ? 'step' : undefined}
        >
          <div className="step-header">
            <div className="step-number">{index + 1}</div>
            <h4 className="step-title">{step.title}</h4>
            {step.difficulty === 'easy' && <span className="difficulty-badge easy">Easy</span>}
          </div>
          
          <div className="step-content">
            <p className="step-description">{step.description}</p>
            
            <div className="step-action">
              <strong>Do this:</strong> {step.action}
            </div>
            
            <div className="step-outcome">
              <strong>Expected result:</strong> {step.expectedOutcome}
            </div>

            {step.timeEstimate && (
              <div className="step-time">
                <strong>Time needed:</strong> {step.timeEstimate}
              </div>
            )}

            {step.help && (
              <div className="step-help">
                <strong>Help:</strong> {step.help}
              </div>
            )}

            {index === currentStep && (
              <button 
                className="complete-step-btn"
                onClick={() => onStepComplete(step.id)}
                aria-label={`Complete ${step.title}`}
              >
                I did this step
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}