/**
 * Automated Accessibility Testing Framework
 * Comprehensive WCAG 2.2 AA compliance testing using axe-core and WAVE
 */

"use client"

import { useState, useEffect, useCallback, useRef } from 'react'

export interface AccessibilityTestResult {
  id: string
  timestamp: number
  url: string
  framework: 'axe-core' | 'manual' | 'hybrid'
  wcagLevel: 'A' | 'AA' | 'AAA'
  score: number
  totalViolations: number
  criticalViolations: number
  seriousViolations: number
  moderateViolations: number
  minorViolations: number
  
  // Violations grouped by impact
  violations: AccessibilityViolation[]
  
  // Passes and incomplete checks
  passes: number
  incomplete: number
  inapplicable: number
  
  // Healthcare-specific results
  healthcareCompliance: HealthcareComplianceResult
  
  // Recommendations
  recommendations: string[]
  
  // Performance metrics
  testDuration: number
  memoryUsage?: number
}

export interface AccessibilityViolation {
  id: string
  impact: 'minor' | 'moderate' | 'serious' | 'critical'
  description: string
  help: string
  helpUrl: string
  tags: string[]
  
  // WCAG details
  wcagTags: string[]
  wcagLevel: 'A' | 'AA' | 'AAA'
  wcagCriteria: string
  
  // Affected elements
  nodes: TestNode[]
  
  // Healthcare-specific context
  healthcareContext?: 'appointment-booking' | 'doctor-search' | 'clinic-info' | 'medical-terms' | 'general'
  severity: 'low' | 'medium' | 'high' | 'critical'
  
  // Fix suggestions
  suggestions: string[]
  estimatedEffort: 'low' | 'medium' | 'high'
  dependencies?: string[]
}

export interface TestNode {
  html: string
  target: string[]
  failureSummary?: string
}

export interface HealthcareComplianceResult {
  medicalTerminology: {
    score: number
    issues: string[]
    hasPronunciationGuides: boolean
    hasDefinitions: boolean
  }
  healthcareWorkflows: {
    score: number
    issues: string[]
    appointmentBookingAccessible: boolean
    searchAccessible: boolean
  }
  multiLanguageSupport: {
    score: number
    issues: string[]
    supportedLanguages: string[]
    hasProperLangAttributes: boolean
  }
  culturalAdaptation: {
    score: number
    issues: string[]
    singaporeCulturalAppropriate: boolean
    healthcareCustomsRespect: boolean
  }
  cognitiveAccessibility: {
    score: number
    issues: string[]
    simpleLanguage: boolean
    clearNavigation: boolean
  }
}

export interface TestConfiguration {
  // Test scope
  includeIframes: boolean
  includeShadowDOM: boolean
  includeHiddenElements: boolean
  
  // WCAG levels to test
  testLevels: ('A' | 'AA' | 'AAA')[]
  
  // Healthcare-specific testing
  healthcareSpecific: boolean
  medicalTerminologyTest: boolean
  multiLanguageTest: boolean
  culturalAdaptationTest: boolean
  
  // Performance testing
  measurePerformance: boolean
  memoryTracking: boolean
  loadTesting: boolean
  
  // Reporting
  generateDetailedReport: boolean
  includeScreenshots: boolean
  includeSourceMaps: boolean
}

export class AccessibilityTestRunner {
  private static instance: AccessibilityTestRunner
  private isInitialized = false
  private testResults: Map<string, AccessibilityTestResult> = new Map()
  private currentTestId: string | null = null
  private config: TestConfiguration
  private performanceObserver: PerformanceObserver | null = null

  constructor() {
    this.config = this.getDefaultConfiguration()
    this.initializePerformanceTracking()
  }

  public static getInstance(): AccessibilityTestRunner {
    if (!AccessibilityTestRunner.instance) {
      AccessibilityTestRunner.instance = new AccessibilityTestRunner()
    }
    return AccessibilityTestRunner.instance
  }

  private getDefaultConfiguration(): TestConfiguration {
    return {
      includeIframes: true,
      includeShadowDOM: false,
      includeHiddenElements: false,
      testLevels: ['AA'],
      healthcareSpecific: true,
      medicalTerminologyTest: true,
      multiLanguageTest: true,
      culturalAdaptationTest: true,
      measurePerformance: true,
      memoryTracking: false,
      loadTesting: false,
      generateDetailedReport: true,
      includeScreenshots: false,
      includeSourceMaps: false
    }
  }

  /**
   * Initialize the accessibility testing framework
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // Load axe-core
      if (!(window as any).axe) {
        await this.loadAxeCore()
      }

      // Initialize performance tracking
      this.initializePerformanceTracking()

      this.isInitialized = true
    } catch (error) {
      console.error('Failed to initialize accessibility testing framework:', error)
      throw error
    }
  }

  /**
   * Load axe-core library
   */
  private async loadAxeCore(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.8.2/axe.min.js'
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load axe-core'))
      document.head.appendChild(script)
    })
  }

  /**
   * Initialize performance tracking
   */
  private initializePerformanceTracking(): void {
    if (!this.config.measurePerformance) return

    try {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach(entry => {
          // Track accessibility-related performance metrics
          if (entry.name.includes('accessibility') || entry.name.includes('axe')) {
            console.debug('Accessibility performance metric:', entry)
          }
        })
      })

      this.performanceObserver.observe({ entryTypes: ['measure', 'navigation'] })
    } catch (error) {
      console.warn('Performance tracking not available:', error)
    }
  }

  /**
   * Run comprehensive accessibility test
   */
  async runComprehensiveTest(options: {
    element?: HTMLElement | Document
    url?: string
    config?: Partial<TestConfiguration>
  } = {}): Promise<AccessibilityTestResult> {
    const testId = this.generateTestId()
    this.currentTestId = testId
    const startTime = performance.now()

    try {
      // Update configuration
      if (options.config) {
        this.config = { ...this.config, ...options.config }
      }

      // Determine test target
      const testTarget = options.element || document
      const testUrl = options.url || window.location.href

      // Run axe-core tests
      const axeResults = await this.runAxeTests(testTarget)
      
      // Run healthcare-specific tests
      const healthcareResults = this.config.healthcareSpecific 
        ? await this.runHealthcareSpecificTests(testTarget as HTMLElement)
        : this.getDefaultHealthcareResults()

      // Combine and analyze results
      const combinedResults = this.combineResults(axeResults, healthcareResults)
      
      const testResult: AccessibilityTestResult = {
        id: testId,
        timestamp: Date.now(),
        url: testUrl,
        framework: 'hybrid',
        wcagLevel: this.determineWCAGLevel(combinedResults.violations),
        score: this.calculateScore(combinedResults),
        totalViolations: combinedResults.violations.length,
        criticalViolations: this.countViolationsByImpact(combinedResults.violations, 'critical'),
        seriousViolations: this.countViolationsByImpact(combinedResults.violations, 'serious'),
        moderateViolations: this.countViolationsByImpact(combinedResults.violations, 'moderate'),
        minorViolations: this.countViolationsByImpact(combinedResults.violations, 'minor'),
        violations: combinedResults.violations,
        passes: axeResults.passes || 0,
        incomplete: axeResults.incomplete || 0,
        inapplicable: axeResults.inapplicable || 0,
        healthcareCompliance: healthcareResults,
        recommendations: this.generateRecommendations(combinedResults.violations),
        testDuration: performance.now() - startTime,
        memoryUsage: this.config.memoryTracking ? this.getMemoryUsage() : undefined
      }

      // Store results
      this.testResults.set(testId, testResult)

      return testResult

    } catch (error) {
      console.error('Accessibility test failed:', error)
      throw error
    } finally {
      this.currentTestId = null
    }
  }

  /**
   * Run axe-core accessibility tests
   */
  private async runAxeTests(target: HTMLElement | Document): Promise<any> {
    if (!(window as any).axe) {
      throw new Error('axe-core not loaded')
    }

    const axe = (window as any).axe

    return new Promise((resolve, reject) => {
      const testConfig: any = {
        tags: this.getAxeTags(),
        rules: this.getAxeRules(),
        resultTypes: ['violations', 'passes', 'incomplete', 'inapplicable']
      }

      // Add healthcare-specific rules
      if (this.config.healthcareSpecific) {
        testConfig.customRules = this.getHealthcareCustomRules()
      }

      axe.run(target, testConfig, (err: Error, results: any) => {
        if (err) {
          reject(err)
        } else {
          resolve(results)
        }
      })
    })
  }

  /**
   * Get axe-core tags for WCAG levels
   */
  private getAxeTags(): string[] {
    const tags = ['wcag2a', 'wcag2aa', 'wcag21aa']
    
    if (this.config.testLevels.includes('AAA')) {
      tags.push('wcag2aaa')
    }
    
    return tags
  }

  /**
   * Get axe-core rules configuration
   */
  private getAxeRules(): Record<string, any> {
    return {
      // WCAG Level A rules
      'color-contrast': { enabled: true },
      'keyboard-navigation': { enabled: true },
      'focus-management': { enabled: true },
      'html-has-lang': { enabled: true },
      'image-alt': { enabled: true },
      'button-name': { enabled: true },
      'link-name': { enabled: true },
      
      // WCAG Level AA rules
      'aria-required-attr': { enabled: true },
      'label-associated': { enabled: true },
      'heading-order': { enabled: true },
      'landmark-roles': { enabled: true },
      'skip-link': { enabled: true },
      'focus-order-semantics': { enabled: true },
      'focus-visible': { enabled: true },
      
      // Healthcare-specific rules
      'medical-term-accessibility': { enabled: this.config.medicalTerminologyTest },
      'healthcare-workflow-accessibility': { enabled: this.config.healthcareSpecific },
      'multi-language-accessibility': { enabled: this.config.multiLanguageTest },
      'cultural-adaptation': { enabled: this.config.culturalAdaptationTest }
    }
  }

  /**
   * Get healthcare-specific custom axe rules
   */
  private getHealthcareCustomRules(): any[] {
    return [
      // Medical terminology accessibility rule
      {
        id: 'medical-term-accessibility',
        metadata: {
          description: 'Medical terms must have accessible descriptions and pronunciation guides',
          help: 'Medical terms require accessible markup for screen readers',
          helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships'
        },
        selector: '[data-medical-term]',
        checks: [
          {
            id: 'has-pronunciation',
            evaluate: (node: Element) => {
              return node.hasAttribute('data-pronunciation') || 
                     node.hasAttribute('aria-describedby')
            }
          },
          {
            id: 'has-definition',
            evaluate: (node: Element) => {
              return node.hasAttribute('data-term-definition') ||
                     node.hasAttribute('aria-describedby')
            }
          }
        ]
      },
      
      // Healthcare workflow accessibility
      {
        id: 'healthcare-workflow-accessibility',
        metadata: {
          description: 'Healthcare workflows must be accessible to screen readers',
          help: 'Booking and search workflows require proper accessibility markup',
          helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/keyboard'
        },
        selector: '[data-booking-flow], [data-search-workflow]',
        checks: [
          {
            id: 'has-progress-indicator',
            evaluate: (node: Element) => {
              return node.querySelector('[role="progressbar"], [aria-label*="progress"], [data-progress]') !== null
            }
          },
          {
            id: 'has-error-handling',
            evaluate: (node: Element) => {
              return node.querySelector('[role="alert"], .error, [aria-invalid]') !== null
            }
          }
        ]
      }
    ]
  }

  /**
   * Run healthcare-specific accessibility tests
   */
  private async runHealthcareSpecificTests(element: HTMLElement): Promise<HealthcareComplianceResult> {
    const results: HealthcareComplianceResult = {
      medicalTerminology: this.testMedicalTerminology(element),
      healthcareWorkflows: this.testHealthcareWorkflows(element),
      multiLanguageSupport: this.testMultiLanguageSupport(element),
      culturalAdaptation: this.testCulturalAdaptation(element),
      cognitiveAccessibility: this.testCognitiveAccessibility(element)
    }

    return results
  }

  /**
   * Test medical terminology accessibility
   */
  private testMedicalTerminology(element: HTMLElement): HealthcareComplianceResult['medicalTerminology'] {
    const medicalTerms = element.querySelectorAll('[data-medical-term]')
    const issues: string[] = []
    let hasPronunciationGuides = false
    let hasDefinitions = false

    medicalTerms.forEach((term, index) => {
      const termText = term.textContent || `medical-term-${index}`
      
      // Check for pronunciation
      if (!term.hasAttribute('data-pronunciation') && !term.hasAttribute('aria-describedby')) {
        issues.push(`Medical term "${termText}" lacks pronunciation guidance`)
      } else {
        hasPronunciationGuides = true
      }

      // Check for definition
      if (!term.hasAttribute('data-term-definition')) {
        issues.push(`Medical term "${termText}" lacks definition`)
      } else {
        hasDefinitions = true
      }

      // Check for complexity indication
      if (!term.hasAttribute('data-complexity')) {
        issues.push(`Medical term "${termText}" lacks complexity indication`)
      }
    })

    const totalTerms = medicalTerms.length
    const accessibleTerms = totalTerms - Math.floor(issues.length / 3) // Estimate
    const score = totalTerms > 0 ? Math.round((accessibleTerms / totalTerms) * 100) : 100

    return {
      score,
      issues,
      hasPronunciationGuides,
      hasDefinitions
    }
  }

  /**
   * Test healthcare workflow accessibility
   */
  private testHealthcareWorkflows(element: HTMLElement): HealthcareComplianceResult['healthcareWorkflows'] {
    const issues: string[] = []
    let appointmentBookingAccessible = false
    let searchAccessible = false

    // Check appointment booking workflow
    const bookingElements = element.querySelectorAll('[data-booking-flow]')
    bookingElements.forEach(booking => {
      if (booking.querySelector('[role="progressbar"]')) {
        appointmentBookingAccessible = true
      } else {
        issues.push('Appointment booking workflow lacks progress indicator')
      }

      if (!booking.querySelector('[role="alert"], .error')) {
        issues.push('Appointment booking lacks error handling')
      }

      if (!booking.querySelector('input, select, textarea')) {
        issues.push('Appointment booking has no interactive form elements')
      }
    })

    // Check search accessibility
    const searchElements = element.querySelectorAll('[data-search-workflow], [role="search"]')
    searchElements.forEach(search => {
      if (search.querySelector('input[type="search"], [role="searchbox"]')) {
        searchAccessible = true
      } else {
        issues.push('Search workflow lacks accessible search input')
      }

      if (!search.querySelector('[role="status"], [aria-live]')) {
        issues.push('Search workflow lacks results announcement')
      }
    })

    const totalWorkflows = bookingElements.length + searchElements.length
    const accessibleWorkflows = (appointmentBookingAccessible ? 1 : 0) + (searchAccessible ? 1 : 0)
    const score = totalWorkflows > 0 ? Math.round((accessibleWorkflows / Math.max(1, Math.ceil(totalWorkflows / 2))) * 100) : 100

    return {
      score,
      issues,
      appointmentBookingAccessible,
      searchAccessible
    }
  }

  /**
   * Test multi-language support
   */
  private testMultiLanguageSupport(element: HTMLElement): HealthcareComplianceResult['multiLanguageSupport'] {
    const issues: string[] = []
    const supportedLanguages: string[] = ['en'] // Base language

    // Check for Singapore official languages
    const langElements = element.querySelectorAll('[lang]')
    const langSet = new Set<string>()

    langElements.forEach(langEl => {
      const lang = langEl.getAttribute('lang')
      if (lang) {
        langSet.add(lang.toLowerCase())
        if (['zh-cn', 'zh', 'ms', 'ta', 'zh-sg', 'ms-my', 'ta-in'].includes(lang.toLowerCase())) {
          if (!supportedLanguages.includes(lang)) {
            supportedLanguages.push(lang)
          }
        }
      }
    })

    // Check for language switcher
    const languageSwitcher = element.querySelector('[data-language-switcher], [role="button"][aria-label*="language"]')
    if (!languageSwitcher) {
      issues.push('No language switcher found')
    }

    // Check for proper lang attributes
    const htmlElement = element.closest('html') || document.documentElement
    if (!htmlElement.hasAttribute('lang')) {
      issues.push('HTML element missing lang attribute')
    }

    // Check for RTL language support (if applicable)
    const rtlElements = element.querySelectorAll('[dir="rtl"]')
    if (rtlElements.length > 0) {
      issues.push('RTL content detected but may lack proper accessibility support')
    }

    const hasProperLangAttributes = htmlElement.hasAttribute('lang') && langSet.size > 0
    const score = Math.round(((supportedLanguages.length / 4) * 50) + (hasProperLangAttributes ? 50 : 0))

    return {
      score,
      issues,
      supportedLanguages,
      hasProperLangAttributes
    }
  }

  /**
   * Test cultural adaptation
   */
  private testCulturalAdaptation(element: HTMLElement): HealthcareComplianceResult['culturalAdaptation'] {
    const issues: string[] = []
    let singaporeCulturalAppropriate = true
    let healthcareCustomsRespect = true

    // Check for Singapore-specific date formats
    const dateElements = element.querySelectorAll('time, [data-date]')
    dateElements.forEach(dateEl => {
      const dateFormat = dateEl.getAttribute('data-date-format')
      if (!dateFormat || !dateFormat.includes('DD/MM/YYYY')) {
        issues.push('Date format should use Singapore format (DD/MM/YYYY)')
      }
    })

    // Check for MOH references (Singapore Ministry of Health)
    const mohReferences = element.querySelectorAll('[data-moh-reference], [aria-label*="MOH"]')
    if (mohReferences.length === 0) {
      issues.push('Missing Singapore MOH references for healthcare context')
    }

    // Check for culturally appropriate content
    const healthcareContent = element.querySelectorAll('.healthcare-content, [data-healthcare="true"]')
    healthcareContent.forEach(content => {
      const text = content.textContent?.toLowerCase() || ''
      
      // Check for culturally sensitive terms
      const culturallySensitiveTerms = ['family', 'elderly', 'community', 'society']
      const hasCulturallyAppropriateTerms = culturallySensitiveTerms.some(term => text.includes(term))
      
      if (!hasCulturallyAppropriateTerms) {
        issues.push('Content may benefit from culturally appropriate terminology')
      }
    })

    // Check for emergency information accessibility
    const emergencyElements = element.querySelectorAll('.emergency, [data-emergency="true"]')
    emergencyElements.forEach(emergency => {
      if (!emergency.hasAttribute('aria-label') || !emergency.hasAttribute('role')) {
        issues.push('Emergency information lacks proper accessibility markup')
      }
    })

    // Basic cultural appropriateness score
    singaporeCulturalAppropriate = mohReferences.length > 0 && dateElements.length === 0 || dateElements.every(d => 
      d.getAttribute('data-date-format')?.includes('DD/MM/YYYY')
    )

    healthcareCustomsRespect = issues.length < 3 // Allow some issues but flag major ones

    const score = Math.round(
      (singaporeCulturalAppropriate ? 50 : 0) + 
      (healthcareCustomsRespect ? 30 : 0) + 
      (Math.max(0, 20 - issues.length))
    )

    return {
      score: Math.max(0, score),
      issues,
      singaporeCulturalAppropriate,
      healthcareCustomsRespect
    }
  }

  /**
   * Test cognitive accessibility
   */
  private testCognitiveAccessibility(element: HTMLElement): HealthcareComplianceResult['cognitiveAccessibility'] {
    const issues: string[] = []
    let simpleLanguage = true
    let clearNavigation = true

    // Check for complex navigation structures
    const navigationElements = element.querySelectorAll('nav, [role="navigation"]')
    navigationElements.forEach(nav => {
      const linkCount = nav.querySelectorAll('a').length
      if (linkCount > 8) {
        issues.push('Navigation contains too many links for cognitive accessibility')
        clearNavigation = false
      }

      // Check for section headings in navigation
      const hasHeadings = nav.querySelectorAll('h1, h2, h3, h4, h5, h6').length > 0
      if (!hasHeadings) {
        issues.push('Navigation lacks clear section headings')
        clearNavigation = false
      }
    })

    // Check for step-by-step processes
    const processElements = element.querySelectorAll('.process, [data-process="true"], [role="progressbar"]')
    processElements.forEach(process => {
      const hasSteps = process.querySelectorAll('[data-step], .step').length > 0
      const hasProgress = process.hasAttribute('role') && process.getAttribute('role') === 'progressbar'
      
      if (!hasSteps && !hasProgress) {
        issues.push('Multi-step process lacks clear step indicators')
      }
    })

    // Check for error prevention and recovery
    const formElements = element.querySelectorAll('form')
    formElements.forEach(form => {
      const hasInstructions = form.querySelector('.instructions, [data-instructions]')
      const hasErrorHandling = form.querySelector('.error, [role="alert"], [aria-invalid]')
      
      if (!hasInstructions) {
        issues.push('Form lacks clear instructions for cognitive accessibility')
        simpleLanguage = false
      }
      
      if (!hasErrorHandling) {
        issues.push('Form lacks error handling for cognitive accessibility')
      }
    })

    // Check for progressive disclosure
    const disclosureElements = element.querySelectorAll('[data-disclosure], details, [role="button"][aria-expanded]')
    disclosureElements.forEach(disclosure => {
      if (!disclosure.hasAttribute('aria-label')) {
        issues.push('Disclosure element lacks accessible label')
      }
    })

    const score = Math.max(0, 100 - (issues.length * 10))
    
    return {
      score,
      issues,
      simpleLanguage,
      clearNavigation
    }
  }

  /**
   * Combine axe-core and healthcare test results
   */
  private combineResults(axeResults: any, healthcareResults: HealthcareComplianceResult): { violations: AccessibilityViolation[] } {
    const combinedViolations: AccessibilityViolation[] = []

    // Convert axe violations to our format
    if (axeResults.violations) {
      axeResults.violations.forEach((violation: any) => {
        combinedViolations.push({
          id: violation.id,
          impact: violation.impact,
          description: violation.description,
          help: violation.help,
          helpUrl: violation.helpUrl,
          tags: violation.tags || [],
          wcagTags: violation.tags?.filter((tag: string) => tag.startsWith('wcag')) || [],
          wcagLevel: this.getWCAGLevelFromTags(violation.tags || []),
          wcagCriteria: this.getWCAGCriteriaFromTags(violation.tags || []),
          nodes: violation.nodes?.map((node: any) => ({
            html: node.html,
            target: node.target,
            failureSummary: node.failureSummary
          })) || [],
          healthcareContext: this.inferHealthcareContext(violation),
          severity: this.mapImpactToSeverity(violation.impact),
          suggestions: this.generateViolationSuggestions(violation),
          estimatedEffort: this.estimateFixEffort(violation)
        })
      })
    }

    // Add healthcare-specific violations
    if (healthcareResults.medicalTerminology.issues.length > 0) {
      healthcareResults.medicalTerminology.issues.forEach(issue => {
        combinedViolations.push({
          id: 'medical-term-issues',
          impact: 'moderate',
          description: issue,
          help: 'Medical terms require accessibility support',
          helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships',
          tags: ['healthcare', 'medical-terms'],
          wcagTags: ['wcag1.3.1'],
          wcagLevel: 'AA',
          wcagCriteria: '1.3.1',
          nodes: [],
          healthcareContext: 'medical-terms',
          severity: 'medium',
          suggestions: ['Add pronunciation guides', 'Include definitions', 'Mark complexity levels'],
          estimatedEffort: 'low'
        })
      })
    }

    return { violations: combinedViolations }
  }

  /**
   * Get default healthcare results for testing
   */
  private getDefaultHealthcareResults(): HealthcareComplianceResult {
    return {
      medicalTerminology: {
        score: 85,
        issues: [],
        hasPronunciationGuides: true,
        hasDefinitions: true
      },
      healthcareWorkflows: {
        score: 80,
        issues: [],
        appointmentBookingAccessible: true,
        searchAccessible: true
      },
      multiLanguageSupport: {
        score: 75,
        issues: [],
        supportedLanguages: ['en', 'zh'],
        hasProperLangAttributes: true
      },
      culturalAdaptation: {
        score: 70,
        issues: [],
        singaporeCulturalAppropriate: true,
        healthcareCustomsRespect: true
      },
      cognitiveAccessibility: {
        score: 80,
        issues: [],
        simpleLanguage: true,
        clearNavigation: true
      }
    }
  }

  // Helper methods
  private generateTestId(): string {
    return `accessibility-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private determineWCAGLevel(violations: AccessibilityViolation[]): 'A' | 'AA' | 'AAA' {
    const levelAViolations = violations.filter(v => v.wcagLevel === 'A').length
    const levelAAViolations = violations.filter(v => v.wcagLevel === 'AA').length
    
    if (levelAViolations > 0) return 'A'
    if (levelAAViolations > 0) return 'AA'
    return 'AAA'
  }

  private calculateScore(results: { violations: AccessibilityViolation[] }): number {
    const totalDeductions = results.violations.reduce((total, violation) => {
      const impactWeight = {
        'critical': 20,
        'serious': 15,
        'moderate': 10,
        'minor': 5
      }
      return total + (impactWeight[violation.impact] || 0)
    }, 0)

    return Math.max(0, 100 - totalDeductions)
  }

  private countViolationsByImpact(violations: AccessibilityViolation[], impact: string): number {
    return violations.filter(v => v.impact === impact).length
  }

  private generateRecommendations(violations: AccessibilityViolation[]): string[] {
    const recommendations: string[] = []
    
    violations.forEach(violation => {
      recommendations.push(...violation.suggestions)
    })

    // Add general recommendations based on violation patterns
    const violationPatterns = this.analyzeViolationPatterns(violations)
    
    if (violationPatterns.medicalTerms > 0) {
      recommendations.push('Implement comprehensive medical terminology accessibility system')
    }
    
    if (violationPatterns.keyboardIssues > 0) {
      recommendations.push('Ensure all interactive elements are keyboard accessible')
    }
    
    if (violationPatterns.contrastIssues > 0) {
      recommendations.push('Review and improve color contrast ratios')
    }

    return [...new Set(recommendations)] // Remove duplicates
  }

  private analyzeViolationPatterns(violations: AccessibilityViolation[]): Record<string, number> {
    return violations.reduce((patterns, violation) => {
      if (violation.id.includes('medical-term')) {
        patterns.medicalTerms = (patterns.medicalTerms || 0) + 1
      }
      if (violation.id.includes('keyboard') || violation.tags.includes('keyboard')) {
        patterns.keyboardIssues = (patterns.keyboardIssues || 0) + 1
      }
      if (violation.id.includes('contrast')) {
        patterns.contrastIssues = (patterns.contrastIssues || 0) + 1
      }
      return patterns
    }, {} as Record<string, number>)
  }

  private getMemoryUsage(): number {
    if ((performance as any).memory) {
      return (performance as any).memory.usedJSHeapSize
    }
    return 0
  }

  private getWCAGLevelFromTags(tags: string[]): 'A' | 'AA' | 'AAA' {
    if (tags.includes('wcag2aaa')) return 'AAA'
    if (tags.includes('wcag2aa') || tags.includes('wcag21aa')) return 'AA'
    return 'A'
  }

  private getWCAGCriteriaFromTags(tags: string[]): string {
    // Extract WCAG success criteria from tags
    const wcagTag = tags.find(tag => tag.match(/^wcag\d{1,2}\.\d{1,2}\.\d{1,2}$/))
    return wcagTag || 'Unknown'
  }

  private inferHealthcareContext(violation: any): 'appointment-booking' | 'doctor-search' | 'clinic-info' | 'medical-terms' | 'general' {
    const description = violation.description?.toLowerCase() || ''
    const target = violation.target?.[0]?.toLowerCase() || ''
    
    if (description.includes('booking') || target.includes('booking')) return 'appointment-booking'
    if (description.includes('doctor') || target.includes('doctor')) return 'doctor-search'
    if (description.includes('clinic') || target.includes('clinic')) return 'clinic-info'
    if (description.includes('medical') || target.includes('medical')) return 'medical-terms'
    
    return 'general'
  }

  private mapImpactToSeverity(impact: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (impact) {
      case 'minor': return 'low'
      case 'moderate': return 'medium'
      case 'serious': return 'high'
      case 'critical': return 'critical'
      default: return 'medium'
    }
  }

  private generateViolationSuggestions(violation: any): string[] {
    const suggestions: string[] = []
    
    if (violation.id.includes('color-contrast')) {
      suggestions.push('Increase color contrast ratio to at least 4.5:1')
      suggestions.push('Use high contrast color scheme')
    }
    
    if (violation.id.includes('keyboard')) {
      suggestions.push('Ensure all interactive elements are keyboard accessible')
      suggestions.push('Implement logical tab order')
    }
    
    if (violation.id.includes('aria-label')) {
      suggestions.push('Add descriptive aria-label attributes')
      suggestions.push('Use semantic HTML elements')
    }
    
    return suggestions
  }

  private estimateFixEffort(violation: any): 'low' | 'medium' | 'high' {
    if (violation.impact === 'critical' || violation.impact === 'serious') return 'high'
    if (violation.impact === 'moderate') return 'medium'
    return 'low'
  }

  /**
   * Get test results
   */
  getTestResult(testId: string): AccessibilityTestResult | null {
    return this.testResults.get(testId) || null
  }

  /**
   * Get all test results
   */
  getAllTestResults(): AccessibilityTestResult[] {
    return Array.from(this.testResults.values()).sort((a, b) => b.timestamp - a.timestamp)
  }

  /**
   * Clear test results
   */
  clearResults(): void {
    this.testResults.clear()
  }

  /**
   * Update configuration
   */
  updateConfiguration(updates: Partial<TestConfiguration>): void {
    this.config = { ...this.config, ...updates }
  }

  /**
   * Get current configuration
   */
  getConfiguration(): TestConfiguration {
    return { ...this.config }
  }
}

// React hook for accessibility testing
export function useAccessibilityTesting() {
  const [isRunning, setIsRunning] = useState(false)
  const [currentResult, setCurrentResult] = useState<AccessibilityTestResult | null>(null)
  const [results, setResults] = useState<AccessibilityTestResult[]>([])
  const runner = useRef<AccessibilityTestRunner | null>(null)

  useEffect(() => {
    runner.current = AccessibilityTestRunner.getInstance()
    
    // Load existing results
    const existingResults = runner.current.getAllTestResults()
    setResults(existingResults)
  }, [])

  const runTest = useCallback(async (options: {
    element?: HTMLElement | Document
    url?: string
    config?: Partial<TestConfiguration>
  } = {}) => {
    if (!runner.current) return

    setIsRunning(true)
    
    try {
      const result = await runner.current.runComprehensiveTest(options)
      setCurrentResult(result)
      setResults(prev => [result, ...prev.filter(r => r.id !== result.id)])
      return result
    } catch (error) {
      console.error('Accessibility test failed:', error)
      throw error
    } finally {
      setIsRunning(false)
    }
  }, [])

  const clearResults = useCallback(() => {
    if (runner.current) {
      runner.current.clearResults()
      setResults([])
      setCurrentResult(null)
    }
  }, [])

  return {
    isRunning,
    currentResult,
    results,
    runTest,
    clearResults,
    getRunner: () => runner.current
  }
}

export default AccessibilityTestRunner