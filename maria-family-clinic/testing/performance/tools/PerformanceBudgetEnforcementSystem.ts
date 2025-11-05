/**
 * Performance Budget Enforcement System
 * Sub-Phase 10.7: Performance Testing & Validation
 * Automated performance budget monitoring and enforcement for healthcare platforms
 */

import {
  PerformanceBudget,
  PerformanceBudgetViolation,
  PerformanceBudgetCompliance,
  BudgetViolation,
  BudgetRecommendation,
  HealthcareBudgetImpact
} from '../types'

export class PerformanceBudgetEnforcementSystem {
  private budgets: Map<string, PerformanceBudget> = new Map()
  private violations: Map<string, PerformanceBudgetViolation[]> = new Map()
  private complianceResults: Map<string, PerformanceBudgetCompliance> = new Map()
  private monitoring: boolean = false
  private alertChannels: Map<string, any[]> = new Map()
  private enforcementRules: EnforcementRule[] = []

  constructor() {
    this.initializeDefaultBudgets()
    this.initializeEnforcementRules()
  }

  /**
   * Initialize default performance budgets for healthcare platform
   */
  private initializeDefaultBudgets() {
    // Core Web Vitals budgets
    this.addBudget({
      id: 'web-vitals-lcp',
      name: 'Largest Contentful Paint',
      category: 'page-load',
      metric: {
        type: 'web-vital',
        name: 'largestContentfulPaint',
        unit: 'ms',
        direction: 'lower-is-better',
        calculation: 'average',
        source: 'browser',
        validation: {
          enabled: true,
          rules: [],
          alerts: [],
          suppression: { enabled: false, duration: 0, conditions: [], maxSuppressations: 0 }
        }
      },
      environments: [
        {
          name: 'production',
          thresholds: [
            { level: 'warning', value: 2000, unit: 'ms', action: 'alert', healthcareOverride: false },
            { level: 'error', value: 2500, unit: 'ms', action: 'alert', healthcareOverride: false },
            { level: 'critical', value: 4000, unit: 'ms', action: 'block', healthcareOverride: true }
          ],
          conditions: [],
          dependencies: [],
          healthcareSettings: {
            emergencyMode: false,
            criticalWorkflowOverride: true,
            pdpaComplianceMode: true,
            medicalDataProtection: true,
            healthcareApiPrioritization: true
          }
        },
        {
          name: 'staging',
          thresholds: [
            { level: 'warning', value: 2500, unit: 'ms', action: 'alert', healthcareOverride: false },
            { level: 'error', value: 3000, unit: 'ms', action: 'alert', healthcareOverride: false },
            { level: 'critical', value: 5000, unit: 'ms', action: 'block', healthcareOverride: true }
          ],
          conditions: [],
          dependencies: [],
          healthcareSettings: {
            emergencyMode: false,
            criticalWorkflowOverride: false,
            pdpaComplianceMode: true,
            medicalDataProtection: true,
            healthcareApiPrioritization: false
          }
        }
      ],
      healthcareSpecific: true,
      complianceRequired: true,
      priority: 'high',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags: ['core-web-vitals', 'patient-experience', 'healthcare-workflow'],
      dependencies: ['healthcare-workflows']
    })

    this.addBudget({
      id: 'appointment-booking-performance',
      name: 'Appointment Booking Workflow Performance',
      category: 'healthcare-workflow',
      metric: {
        type: 'healthcare-workflow',
        name: 'appointmentBookingTime',
        unit: 'ms',
        direction: 'lower-is-better',
        calculation: 'p95',
        source: 'synthetic',
        validation: {
          enabled: true,
          rules: [
            {
              type: 'healthcare-context',
              condition: 'workflow-type',
              value: 'appointment-booking',
              message: 'Healthcare workflow performance threshold exceeded',
              critical: true
            }
          ],
          alerts: [
            {
              type: 'critical',
              condition: 'performance-threshold',
              threshold: 5000,
              channels: [
                { type: 'email', config: { recipients: ['healthcare-ops@clinic.sg'] }, enabled: true, recipients: ['healthcare-ops@clinic.sg'] },
                { type: 'slack', config: { channel: '#healthcare-critical' }, enabled: true, recipients: [] },
                { type: 'dashboard', config: {}, enabled: true, recipients: [] }
              ],
              escalation: {
                enabled: true,
                levels: [
                  {
                    level: 1,
                    delay: 300,
                    channels: [
                      { type: 'email', config: { recipients: ['healthcare-ops@clinic.sg'] }, enabled: true, recipients: ['healthcare-ops@clinic.sg'] }
                    ],
                    conditions: []
                  },
                  {
                    level: 2,
                    delay: 900,
                    channels: [
                      { type: 'sms', config: { recipients: ['+65-9123-4567'] }, enabled: true, recipients: ['+65-9123-4567'] }
                    ],
                    conditions: []
                  }
                ],
                maxLevel: 2,
                timeout: 1800
              }
            }
          ],
          suppression: {
            enabled: true,
            duration: 3600,
            conditions: [
              {
                type: 'maintenance-window',
                pattern: 'maintenance',
                description: 'Scheduled maintenance window',
                startTime: 0,
                endTime: 0
              },
              {
                type: 'emergency-healthcare',
                pattern: 'emergency',
                description: 'Emergency healthcare override',
                startTime: 0,
                endTime: 0
              }
            ],
            maxSuppressations: 5
          }
        }
      },
      environments: [
        {
          name: 'production',
          thresholds: [
            { level: 'warning', value: 2500, unit: 'ms', action: 'alert', healthcareOverride: false },
            { level: 'error', value: 3500, unit: 'ms', action: 'alert', healthcareOverride: false },
            { level: 'critical', value: 5000, unit: 'ms', action: 'block', healthcareOverride: true }
          ],
          conditions: [
            {
              type: 'time-based',
              condition: 'peak-hours',
              value: '09:00-17:00',
              impact: 'Higher threshold during peak healthcare hours'
            }
          ],
          dependencies: ['appointment-system', 'doctor-availability'],
          healthcareSettings: {
            emergencyMode: false,
            criticalWorkflowOverride: true,
            pdpaComplianceMode: true,
            medicalDataProtection: true,
            healthcareApiPrioritization: true
          }
        }
      ],
      healthcareSpecific: true,
      complianceRequired: true,
      priority: 'critical',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags: ['healthcare-workflow', 'appointment-booking', 'patient-journey'],
      dependencies: ['appointment-system', 'doctor-availability', 'clinic-locations']
    })

    // Bundle size budget
    this.addBudget({
      id: 'bundle-size-main',
      name: 'Main Application Bundle Size',
      category: 'bundle',
      metric: {
        type: 'bundle-size',
        name: 'mainBundleSize',
        unit: 'KB',
        direction: 'lower-is-better',
        calculation: 'total',
        source: 'build',
        validation: {
          enabled: true,
          rules: [],
          alerts: [
            {
              type: 'warning',
              condition: 'size-threshold',
              threshold: 500,
              channels: [
                { type: 'email', config: { recipients: ['dev-team@clinic.sg'] }, enabled: true, recipients: ['dev-team@clinic.sg'] }
              ],
              escalation: { enabled: false, levels: [], maxLevel: 0, timeout: 0 }
            }
          ],
          suppression: { enabled: false, duration: 0, conditions: [], maxSuppressations: 0 }
        }
      },
      environments: [
        {
          name: 'production',
          thresholds: [
            { level: 'warning', value: 400, unit: 'KB', action: 'monitor', healthcareOverride: false },
            { level: 'error', value: 600, unit: 'KB', action: 'alert', healthcareOverride: false },
            { level: 'critical', value: 800, unit: 'KB', action: 'fail-build', healthcareOverride: false }
          ],
          conditions: [],
          dependencies: [],
          healthcareSettings: {
            emergencyMode: false,
            criticalWorkflowOverride: false,
            pdpaComplianceMode: false,
            medicalDataProtection: false,
            healthcareApiPrioritization: false
          }
        }
      ],
      healthcareSpecific: false,
      complianceRequired: false,
      priority: 'medium',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags: ['bundle-size', 'performance', 'optimization'],
      dependencies: ['build-process']
    })

    // Memory usage budget
    this.addBudget({
      id: 'memory-usage-main',
      name: 'Application Memory Usage',
      category: 'memory',
      metric: {
        type: 'memory-usage',
        name: 'heapMemoryUsage',
        unit: 'MB',
        direction: 'lower-is-better',
        calculation: 'peak',
        source: 'browser',
        validation: {
          enabled: true,
          rules: [],
          alerts: [
            {
              type: 'warning',
              condition: 'memory-threshold',
              threshold: 50,
              channels: [
                { type: 'dashboard', config: {}, enabled: true, recipients: [] }
              ],
              escalation: { enabled: false, levels: [], maxLevel: 0, timeout: 0 }
            }
          ],
          suppression: { enabled: false, duration: 0, conditions: [], maxSuppressations: 0 }
        }
      },
      environments: [
        {
          name: 'production',
          thresholds: [
            { level: 'warning', value: 40, unit: 'MB', action: 'monitor', healthcareOverride: false },
            { level: 'error', value: 60, unit: 'MB', action: 'alert', healthcareOverride: false },
            { level: 'critical', value: 80, unit: 'MB', action: 'alert', healthcareOverride: false }
          ],
          conditions: [],
          dependencies: [],
          healthcareSettings: {
            emergencyMode: false,
            criticalWorkflowOverride: false,
            pdpaComplianceMode: false,
            medicalDataProtection: false,
            healthcareApiPrioritization: false
          }
        }
      ],
      healthcareSpecific: false,
      complianceRequired: false,
      priority: 'low',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags: ['memory', 'performance', 'optimization'],
      dependencies: ['garbage-collection']
    })
  }

  /**
   * Initialize enforcement rules
   */
  private initializeEnforcementRules() {
    this.enforcementRules = [
      {
        id: 'critical-healthcare-workflow',
        condition: 'metric-threshold',
        action: 'immediate-alert',
        parameters: {
          metrics: ['appointmentBookingTime', 'doctorSearchTime', 'clinicDiscoveryTime'],
          threshold: 'critical',
          environments: ['production'],
          escalation: {
            immediate: ['email', 'slack'],
            after5Min: ['sms'],
            after15Min: ['phone-call']
          }
        },
        healthcareContext: true,
        priority: 'critical'
      },
      {
        id: 'performance-regression',
        condition: 'baseline-comparison',
        action: 'block-deployment',
        parameters: {
          regressionThreshold: 20, // 20% degradation
          metrics: ['loadTime', 'largestContentfulPaint', 'firstInputDelay'],
          comparisonPeriod: '24h',
          requireApproval: true
        },
        healthcareContext: true,
        priority: 'high'
      },
      {
        id: 'bundle-size-growth',
        condition: 'bundle-size-increase',
        action: 'fail-build',
        parameters: {
          increaseThreshold: 10, // 10% increase
          gracePeriod: '7d',
          emergencyOverride: true
        },
        healthcareContext: false,
        priority: 'medium'
      }
    ]
  }

  /**
   * Add new performance budget
   */
  addBudget(budget: PerformanceBudget): void {
    this.budgets.set(budget.id, budget)
    console.log(`Performance budget added: ${budget.name} (${budget.id})`)
  }

  /**
   * Remove performance budget
   */
  removeBudget(budgetId: string): boolean {
    const removed = this.budgets.delete(budgetId)
    if (removed) {
      this.violations.delete(budgetId)
      this.complianceResults.delete(budgetId)
      console.log(`Performance budget removed: ${budgetId}`)
    }
    return removed
  }

  /**
   * Start real-time performance monitoring
   */
  startMonitoring(config: {
    interval: number // milliseconds
    environments: string[]
    metrics: string[]
    healthcareWorkflows: string[]
  }): void {
    if (this.monitoring) {
      console.warn('Performance monitoring is already running')
      return
    }

    this.monitoring = true
    console.log('Starting real-time performance budget monitoring...')

    setInterval(async () => {
      try {
        await this.checkAllBudgets(config.environments)
      } catch (error) {
        console.error('Error during performance monitoring:', error)
      }
    }, config.interval)
  }

  /**
   * Stop real-time performance monitoring
   */
  stopMonitoring(): void {
    this.monitoring = false
    console.log('Performance budget monitoring stopped')
  }

  /**
   * Check all performance budgets
   */
  private async checkAllBudgets(environments: string[]): Promise<void> {
    for (const [budgetId, budget] of this.budgets.entries()) {
      if (environments.includes('all') || budget.environments.some(env => environments.includes(env.name))) {
        try {
          await this.checkBudgetCompliance(budgetId)
        } catch (error) {
          console.error(`Error checking budget ${budgetId}:`, error)
        }
      }
    }
  }

  /**
   * Check compliance for specific budget
   */
  async checkBudgetCompliance(budgetId: string, environment: string = 'production'): Promise<PerformanceBudgetCompliance> {
    const budget = this.budgets.get(budgetId)
    if (!budget) {
      throw new Error(`Budget not found: ${budgetId}`)
    }

    const envConfig = budget.environments.find(env => env.name === environment)
    if (!envConfig) {
      throw new Error(`Environment ${environment} not configured for budget ${budgetId}`)
    }

    // Collect current performance metrics
    const currentMetrics = await this.collectCurrentMetrics(budget.metric, environment)
    const violations: PerformanceBudgetViolation[] = []
    
    // Check each threshold
    for (const threshold of envConfig.thresholds) {
      if (this.shouldCheckThreshold(currentMetrics.value, threshold, envConfig.conditions)) {
        const violation = this.createBudgetViolation(budget, currentMetrics, threshold, environment)
        violations.push(violation)
        
        // Trigger enforcement actions
        await this.enforceBudgetViolation(violation, budget, threshold)
      }
    }

    // Calculate compliance score
    const complianceScore = this.calculateComplianceScore(violations, envConfig.thresholds.length)
    const status = this.determineComplianceStatus(complianceScore, violations.length, budget.priority)

    // Store results
    const result: PerformanceBudgetCompliance = {
      budgetId,
      budgetName: budget.name,
      violations,
      complianceScore,
      status,
      lastCheck: Date.now()
    }
    
    this.complianceResults.set(`${budgetId}-${environment}`, result)
    
    // Store violations
    if (violations.length > 0) {
      const existingViolations = this.violations.get(budgetId) || []
      this.violations.set(budgetId, [...existingViolations, ...violations])
    }

    // Clean up old violations (keep last 1000)
    const allViolations = this.violations.get(budgetId) || []
    if (allViolations.length > 1000) {
      this.violations.set(budgetId, allViolations.slice(-1000))
    }

    return result
  }

  /**
   * Collect current performance metrics
   */
  private async collectCurrentMetrics(metric: any, environment: string): Promise<{ value: number; timestamp: number; source: string }> {
    // In a real implementation, this would collect actual metrics from various sources
    // For now, we'll simulate metric collection
    
    const mockValue = await this.simulateMetricCollection(metric, environment)
    
    return {
      value: mockValue,
      timestamp: Date.now(),
      source: metric.source
    }
  }

  /**
   * Simulate metric collection for testing
   */
  private async simulateMetricCollection(metric: any, environment: string): Promise<number> {
    // Simulate realistic metric values with some variance
    let baseValue = 0
    
    switch (metric.type) {
      case 'web-vital':
        switch (metric.name) {
          case 'largestContentfulPaint':
            baseValue = environment === 'production' ? 1800 : 2200
            break
          case 'firstInputDelay':
            baseValue = environment === 'production' ? 80 : 120
            break
          case 'cumulativeLayoutShift':
            baseValue = environment === 'production' ? 0.08 : 0.12
            break
          default:
            baseValue = environment === 'production' ? 1000 : 1500
        }
        break
      case 'healthcare-workflow':
        switch (metric.name) {
          case 'appointmentBookingTime':
            baseValue = environment === 'production' ? 2200 : 2800
            break
          case 'doctorSearchTime':
            baseValue = environment === 'production' ? 1200 : 1600
            break
          case 'clinicDiscoveryTime':
            baseValue = environment === 'production' ? 1800 : 2400
            break
          default:
            baseValue = environment === 'production' ? 2000 : 2500
        }
        break
      case 'bundle-size':
        baseValue = environment === 'production' ? 380 : 450
        break
      case 'memory-usage':
        baseValue = environment === 'production' ? 35 : 45
        break
      default:
        baseValue = 1000
    }
    
    // Add random variance ±30%
    const variance = 0.7 + Math.random() * 0.6
    return baseValue * variance
  }

  /**
   * Check if threshold should be evaluated
   */
  private shouldCheckThreshold(value: number, threshold: any, conditions: any[]): boolean {
    // Apply environmental conditions
    for (const condition of conditions) {
      if (condition.type === 'time-based' && condition.condition === 'peak-hours') {
        const now = new Date()
        const hour = now.getHours()
        const isPeakHour = hour >= 9 && hour <= 17 // 9 AM to 5 PM
        if (isPeakHour && threshold.level === 'warning') {
          // Allow slightly higher values during peak hours
          return value > threshold.value * 1.2
        }
      }
    }
    
    // Check if value exceeds threshold
    return value > threshold.value
  }

  /**
   * Create budget violation object
   */
  private createBudgetViolation(
    budget: PerformanceBudget,
    currentMetrics: { value: number; timestamp: number; source: string },
    threshold: any,
    environment: string
  ): PerformanceBudgetViolation {
    const violation: PerformanceBudgetViolation = {
      id: `violation-${budget.id}-${Date.now()}`,
      budgetId: budget.id,
      violationType: threshold.level === 'critical' ? 'threshold-exceeded' : 'threshold-exceeded',
      metric: budget.metric.name,
      actualValue: currentMetrics.value,
      thresholdValue: threshold.value,
      severity: threshold.level,
      timestamp: currentMetrics.timestamp,
      environment,
      buildId: process.env.BUILD_ID || 'unknown',
      commitHash: process.env.GIT_COMMIT || 'unknown',
      healthcareWorkflow: budget.healthcareSpecific ? this.getHealthcareWorkflow(budget) : 'general',
      impact: this.calculateViolationImpact(budget, currentMetrics.value, threshold.value),
      recommendations: this.generateViolationRecommendations(budget, currentMetrics.value, threshold.value),
      status: 'open'
    }
    
    return violation
  }

  /**
   * Calculate impact of violation
   */
  private calculateViolationImpact(budget: PerformanceBudget, actualValue: number, thresholdValue: number): string {
    const percentage = ((actualValue - thresholdValue) / thresholdValue * 100).toFixed(1)
    
    if (budget.healthcareSpecific) {
      switch (budget.category) {
        case 'healthcare-workflow':
          if (actualValue > thresholdValue * 2) {
            return `Critical: Healthcare workflow performance severely impacted (${percentage}% over threshold). May affect patient care quality and clinic operations.`
          } else {
            return `Moderate: Healthcare workflow performance degraded (${percentage}% over threshold). May impact patient experience during appointments.`
          }
        case 'page-load':
          return `User Experience: Page load performance impacted (${percentage}% over threshold). May affect patient journey completion rates and satisfaction.`
        default:
          return `Performance: ${budget.name} performance degraded by ${percentage}%.`
      }
    } else {
      return `Performance: ${budget.name} exceeds threshold by ${percentage}%.`
    }
  }

  /**
   * Generate recommendations for violation
   */
  private generateViolationRecommendations(budget: PerformanceBudget, actualValue: number, thresholdValue: number): string[] {
    const recommendations: string[] = []
    
    if (budget.healthcareSpecific) {
      switch (budget.category) {
        case 'healthcare-workflow':
          recommendations.push('Optimize healthcare workflow API endpoints and database queries')
          recommendations.push('Implement caching for frequently accessed healthcare data')
          recommendations.push('Consider implementing progressive enhancement for slower connections')
          recommendations.push('Review and optimize healthcare workflow user interface components')
          break
        case 'page-load':
          recommendations.push('Optimize images using next/image component with WebP/AVIF formats')
          recommendations.push('Implement code splitting and lazy loading for healthcare components')
          recommendations.push('Minimize JavaScript bundle size for healthcare-specific features')
          recommendations.push('Optimize Critical Rendering Path for faster first contentful paint')
          break
      }
    } else {
      switch (budget.category) {
        case 'bundle':
          recommendations.push('Implement dynamic imports for non-critical healthcare features')
          recommendations.push('Remove unused dependencies from healthcare bundle')
          recommendations.push('Consider tree-shaking for healthcare-specific code paths')
          break
        case 'memory':
          recommendations.push('Implement proper cleanup for healthcare data structures')
          recommendations.push('Optimize memory usage in healthcare workflow components')
          recommendations.push('Review for memory leaks in healthcare application state')
          break
      }
    }
    
    return recommendations
  }

  /**
   * Get healthcare workflow name for budget
   */
  private getHealthcareWorkflow(budget: PerformanceBudget): string {
    if (budget.metric.name.includes('appointment')) {
      return 'appointment-booking'
    } else if (budget.metric.name.includes('doctor')) {
      return 'doctor-search'
    } else if (budget.metric.name.includes('clinic')) {
      return 'clinic-discovery'
    } else {
      return 'general-healthcare-workflow'
    }
  }

  /**
   * Calculate compliance score
   */
  private calculateComplianceScore(violations: PerformanceBudgetViolation[], totalThresholds: number): number {
    if (violations.length === 0) {
      return 100
    }
    
    const criticalViolations = violations.filter(v => v.severity === 'critical').length
    const errorViolations = violations.filter(v => v.severity === 'error').length
    const warningViolations = violations.filter(v => v.severity === 'warning').length
    
    // Deduct points based on violation severity
    let score = 100
    score -= criticalViolations * 30
    score -= errorViolations * 15
    score -= warningViolations * 5
    
    return Math.max(0, score)
  }

  /**
   * Determine compliance status
   */
  private determineComplianceStatus(complianceScore: number, violationCount: number, priority: string): 'compliant' | 'warning' | 'violation' | 'critical' {
    if (violationCount === 0) {
      return 'compliant'
    }
    
    if (priority === 'critical' && violationCount > 0) {
      return 'critical'
    }
    
    if (complianceScore >= 80) {
      return 'warning'
    } else if (complianceScore >= 50) {
      return 'violation'
    } else {
      return 'critical'
    }
  }

  /**
   * Enforce budget violation
   */
  private async enforceBudgetViolation(
    violation: PerformanceBudgetViolation,
    budget: PerformanceBudget,
    threshold: any
  ): Promise<void> {
    console.log(`Enforcing budget violation: ${budget.name} - ${threshold.level}`)
    
    // Execute enforcement actions based on threshold action
    switch (threshold.action) {
      case 'block':
        if (threshold.healthcareOverride && violation.severity === 'critical') {
          await this.triggerHealthcareEmergencyProtocol(violation, budget)
        } else {
          await this.triggerDeploymentBlock(violation, budget)
        }
        break
      case 'fail-build':
        await this.triggerBuildFailure(violation, budget)
        break
      case 'alert':
        await this.triggerAlerts(violation, budget, threshold)
        break
      case 'monitor':
        await this.logViolation(violation, budget)
        break
    }
  }

  /**
   * Trigger healthcare emergency protocol
   */
  private async triggerHealthcareEmergencyProtocol(violation: PerformanceBudgetViolation, budget: PerformanceBudget): Promise<void> {
    console.log(`🚨 HEALTHCARE EMERGENCY PROTOCOL TRIGGERED 🚨`)
    console.log(`Critical violation in healthcare workflow: ${violation.healthcareWorkflow}`)
    console.log(`Impact: ${violation.impact}`)
    
    // In a real implementation, this would:
    // 1. Send immediate alerts to healthcare operations team
    // 2. Activate emergency performance monitoring
    // 3. Potentially trigger automatic remediation
    // 4. Log critical incident for compliance audit trail
    
    const emergencyAlert = {
      type: 'healthcare-emergency',
      severity: 'critical',
      title: 'Healthcare Workflow Critical Performance Issue',
      message: `Critical performance violation in ${violation.healthcareWorkflow}: ${violation.impact}`,
      timestamp: Date.now(),
      workflow: violation.healthcareWorkflow,
      affectedPatients: this.estimateAffectedPatients(violation),
      escalationRequired: true,
      complianceAction: 'immediate-review-required'
    }
    
    // Store emergency alert
    const alerts = this.alertChannels.get('healthcare-emergency') || []
    alerts.push(emergencyAlert)
    this.alertChannels.set('healthcare-emergency', alerts)
  }

  /**
   * Trigger deployment block
   */
  private async triggerDeploymentBlock(violation: PerformanceBudgetViolation, budget: PerformanceBudget): Promise<void> {
    console.log(`Blocking deployment due to performance budget violation: ${budget.name}`)
    
    // In a real implementation, this would:
    // 1. Set deployment flag to blocked
    // 2. Notify CI/CD pipeline
    // 3. Require manual approval for override
    // 4. Log compliance violation
    
    const blockAlert = {
      type: 'deployment-block',
      title: 'Performance Budget Violation - Deployment Blocked',
      message: `Deployment blocked due to ${budget.name} violation: ${violation.impact}`,
      timestamp: Date.now(),
      budgetId: budget.id,
      requiresApproval: true,
      approvers: ['healthcare-ops-lead', 'engineering-lead']
    }
    
    const alerts = this.alertChannels.get('deployment-blocks') || []
    alerts.push(blockAlert)
    this.alertChannels.set('deployment-blocks', alerts)
  }

  /**
   * Trigger build failure
   */
  private async triggerBuildFailure(violation: PerformanceBudgetViolation, budget: PerformanceBudget): Promise<void> {
    console.log(`Failing build due to performance budget violation: ${budget.name}`)
    
    // In a real implementation, this would:
    // 1. Set build status to failed
    // 2. Provide detailed failure reason
    // 3. Suggest performance optimizations
    // 4. Block artifact publication
    
    const buildFailure = {
      type: 'build-failure',
      status: 'failed',
      title: 'Performance Budget Violation',
      message: `Build failed due to ${budget.name} exceeding threshold: ${violation.actualValue} > ${violation.thresholdValue}`,
      timestamp: Date.now(),
      budgetId: budget.id,
      recommendations: violation.recommendations
    }
    
    const alerts = this.alertChannels.get('build-status') || []
    alerts.push(buildFailure)
    this.alertChannels.set('build-status', alerts)
  }

  /**
   * Trigger alerts for violation
   */
  private async triggerAlerts(
    violation: PerformanceBudgetViolation,
    budget: PerformanceBudget,
    threshold: any
  ): Promise<void> {
    console.log(`Sending alerts for budget violation: ${budget.name}`)
    
    // Find alert configuration in budget metric validation
    const alerts = budget.metric.validation?.alerts || []
    const matchingAlert = alerts.find(alert => 
      alert.severity === threshold.level || 
      (threshold.level === 'error' && alert.type === 'warning')
    )
    
    if (matchingAlert) {
      for (const channel of matchingAlert.channels) {
        if (channel.enabled) {
          await this.sendAlert(channel, violation, budget, threshold)
        }
      }
    }
  }

  /**
   * Send alert through specific channel
   */
  private async sendAlert(
    channel: any,
    violation: PerformanceBudgetViolation,
    budget: PerformanceBudget,
    threshold: any
  ): Promise<void> {
    const alertPayload = {
      type: 'performance-budget-violation',
      budget: budget.name,
      violation: violation.severity,
      message: `${budget.name} exceeded ${threshold.level} threshold: ${violation.actualValue.toFixed(1)} > ${violation.thresholdValue}`,
      impact: violation.impact,
      recommendations: violation.recommendations,
      timestamp: Date.now(),
      healthcareWorkflow: violation.healthcareWorkflow,
      environment: violation.environment
    }
    
    switch (channel.type) {
      case 'email':
        console.log(`Sending email alert to ${channel.recipients}:`, alertPayload)
        // In real implementation: send email via SMTP
        break
      case 'slack':
        console.log(`Sending Slack alert to ${channel.config.channel}:`, alertPayload)
        // In real implementation: send Slack message via webhook
        break
      case 'dashboard':
        console.log(`Displaying alert on dashboard:`, alertPayload)
        // In real implementation: store in database for dashboard
        break
      case 'sms':
        console.log(`Sending SMS alert to ${channel.recipients}:`, alertPayload)
        // In real implementation: send SMS via SMS gateway
        break
      case 'webhook':
        console.log(`Sending webhook alert:`, alertPayload)
        // In real implementation: POST to webhook URL
        break
    }
  }

  /**
   * Log violation for monitoring
   */
  private async logViolation(violation: PerformanceBudgetViolation, budget: PerformanceBudget): Promise<void> {
    console.log(`Performance budget violation logged: ${budget.name} - ${violation.severity}`)
    // In real implementation: store in performance monitoring database
  }

  /**
   * Estimate number of affected patients
   */
  private estimateAffectedPatients(violation: PerformanceBudgetViolation): number {
    // Simplified estimation based on workflow type and violation severity
    const basePatients = {
      'appointment-booking': 50,
      'doctor-search': 30,
      'clinic-discovery': 25,
      'general-healthcare-workflow': 40
    }
    
    const baseEstimate = basePatients[violation.healthcareWorkflow as keyof typeof basePatients] || 20
    
    switch (violation.severity) {
      case 'critical':
        return baseEstimate * 3
      case 'error':
        return baseEstimate * 2
      case 'warning':
        return baseEstimate * 1.5
      default:
        return baseEstimate
    }
  }

  /**
   * Get all budgets
   */
  getBudgets(): Map<string, PerformanceBudget> {
    return new Map(this.budgets)
  }

  /**
   * Get budget by ID
   */
  getBudget(budgetId: string): PerformanceBudget | undefined {
    return this.budgets.get(budgetId)
  }

  /**
   * Get all violations for budget
   */
  getViolations(budgetId?: string): Map<string, PerformanceBudgetViolation[]> {
    if (budgetId) {
      return new Map([[budgetId, this.violations.get(budgetId) || []]])
    }
    return new Map(this.violations)
  }

  /**
   * Get compliance results
   */
  getComplianceResults(): Map<string, PerformanceBudgetCompliance> {
    return new Map(this.complianceResults)
  }

  /**
   * Get recent violations
   */
  getRecentViolations(hours: number = 24): PerformanceBudgetViolation[] {
    const cutoff = Date.now() - (hours * 60 * 60 * 1000)
    const recentViolations: PerformanceBudgetViolation[] = []
    
    for (const violations of this.violations.values()) {
      recentViolations.push(...violations.filter(v => v.timestamp > cutoff))
    }
    
    return recentViolations.sort((a, b) => b.timestamp - a.timestamp)
  }

  /**
   * Generate budget compliance report
   */
  generateComplianceReport(timeRange: { start: number; end: number }): string {
    const report = {
      generatedAt: Date.now(),
      timeRange,
      summary: {
        totalBudgets: this.budgets.size,
        activeBudgets: Array.from(this.budgets.values()).filter(b => 
          b.environments.some(env => env.name === 'production')
        ).length,
        healthcareBudgets: Array.from(this.budgets.values()).filter(b => b.healthcareSpecific).length,
        criticalBudgets: Array.from(this.budgets.values()).filter(b => b.priority === 'critical').length
      },
      complianceScores: Array.from(this.complianceResults.values()).map(result => ({
        budgetId: result.budgetId,
        budgetName: result.budgetName,
        score: result.complianceScore,
        status: result.status,
        lastCheck: result.lastCheck,
        violations: result.violations.length
      })),
      violations: {
        total: this.getRecentViolations().length,
        critical: this.getRecentViolations().filter(v => v.severity === 'critical').length,
        byBudget: this.getRecentViolations().reduce((acc, v) => {
          acc[v.budgetId] = (acc[v.budgetId] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      },
      recommendations: this.generateSystemRecommendations()
    }
    
    return JSON.stringify(report, null, 2)
  }

  /**
   * Generate system-wide recommendations
   */
  private generateSystemRecommendations(): string[] {
    const recommendations: string[] = []
    const recentViolations = this.getRecentViolations(7) // Last 7 days
    
    const criticalViolations = recentViolations.filter(v => v.severity === 'critical')
    if (criticalViolations.length > 0) {
      recommendations.push('URGENT: Address critical performance violations in healthcare workflows immediately')
    }
    
    const healthcareViolations = recentViolations.filter(v => v.healthcareWorkflow !== 'general')
    if (healthcareViolations.length > 5) {
      recommendations.push('Review and optimize healthcare-specific performance budgets')
    }
    
    const trendingBudgets = this.identifyTrendingViolations(recentViolations)
    if (trendingBudgets.length > 0) {
      recommendations.push(`Focus on improving performance for consistently violating budgets: ${trendingBudgets.join(', ')}`)
    }
    
    return recommendations
  }

  /**
   * Identify budgets with trending violations
   */
  private identifyTrendingViolations(violations: PerformanceBudgetViolation[]): string[] {
    const violationCounts = violations.reduce((acc, v) => {
      acc[v.budgetId] = (acc[v.budgetId] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return Object.entries(violationCounts)
      .filter(([_, count]) => count >= 3)
      .map(([budgetId, _]) => budgetId)
  }

  /**
   * Clear old violations
   */
  clearOldViolations(retentionDays: number = 30): void {
    const cutoff = Date.now() - (retentionDays * 24 * 60 * 60 * 1000)
    
    for (const [budgetId, violations] of this.violations.entries()) {
      const recentViolations = violations.filter(v => v.timestamp > cutoff)
      this.violations.set(budgetId, recentViolations)
    }
    
    console.log(`Cleared violations older than ${retentionDays} days`)
  }
}

// Enforcement rule interface
interface EnforcementRule {
  id: string
  condition: string
  action: string
  parameters: Record<string, any>
  healthcareContext: boolean
  priority: string
}

export { PerformanceBudgetEnforcementSystem }
export type { PerformanceBudgetViolation, PerformanceBudgetCompliance }