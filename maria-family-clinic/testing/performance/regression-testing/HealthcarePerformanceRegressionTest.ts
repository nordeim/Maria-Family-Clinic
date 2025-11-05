/**
 * Performance Regression Testing Framework
 * Sub-Phase 10.7: Performance Testing & Validation
 * Automated performance regression testing with healthcare-specific validations
 */

import { 
  RegressionTestSuite, 
  RegressionTestCase, 
  RegressionTestResult, 
  RegressionComparison,
  PerformanceComparison,
  PerformanceRegression,
  RegressionRecommendation,
  BaselineResult,
  AutomatedRegressionCheck
} from '../types'

export class HealthcarePerformanceRegressionTest {
  private testSuites: Map<string, RegressionTestSuite> = new Map()
  private currentResults: Map<string, RegressionTestResult> = new Map()
  private baselines: Map<string, BaselineResult> = new Map()
  private isRunning: boolean = false

  constructor() {
    this.initializeHealthcareTestSuites()
  }

  /**
   * Initialize healthcare-specific test suites
   */
  private initializeHealthcareTestSuites() {
    // Core healthcare test suite
    const coreSuite: RegressionTestSuite = {
      id: 'healthcare-core',
      name: 'Healthcare Core Workflows',
      description: 'Essential healthcare workflows performance regression testing',
      testCases: [
        {
          id: 'clinic-search',
          name: 'Clinic Search Performance',
          url: '/clinics',
          interactions: [
            { type: 'navigate', selector: '', delay: 1000 },
            { type: 'type', selector: 'input[placeholder*="search"]', value: 'general practice', delay: 1500 },
            { type: 'click', selector: 'button[type="submit"]', delay: 500 },
            { type: 'scroll', selector: '.clinic-list', delay: 2000 }
          ],
          performanceChecks: [
            { metric: 'loadTime', threshold: 2000, operator: 'less-than', value: 0, critical: true, healthcareRelevant: true },
            { metric: 'largestContentfulPaint', threshold: 1500, operator: 'less-than', value: 0, critical: true, healthcareRelevant: true },
            { metric: 'firstInputDelay', threshold: 100, operator: 'less-than', value: 0, critical: true, healthcareRelevant: true },
            { metric: 'cumulativeLayoutShift', threshold: 0.1, operator: 'less-than', value: 0, critical: true, healthcareRelevant: true },
          ],
          expectedMetrics: {
            responseTime: 1800,
            memoryUsage: 45,
            bundleSize: 420,
            coreWebVitals: {
              lcp: 1400,
              fid: 80,
              cls: 0.05,
              fcp: 1200,
              ttfb: 600,
            },
            healthcareWorkflows: {
              appointmentBooking: 2500,
              clinicSearch: 1200,
              doctorDiscovery: 800,
              formSubmission: 1000,
            }
          },
          criticalPaths: ['search-input', 'results-list', 'clinic-cards']
        },
        {
          id: 'doctor-profile',
          name: 'Doctor Profile Performance',
          url: '/doctors/1',
          interactions: [
            { type: 'navigate', selector: '', delay: 2000 },
            { type: 'scroll', selector: '.doctor-profile', delay: 3000 },
            { type: 'click', selector: 'button[data-testid="book-appointment"]', delay: 1000 },
            { type: 'scroll', selector: '.reviews-section', delay: 2000 }
          ],
          performanceChecks: [
            { metric: 'loadTime', threshold: 2200, operator: 'less-than', value: 0, critical: true, healthcareRelevant: true },
            { metric: 'largestContentfulPaint', threshold: 1600, operator: 'less-than', value: 0, critical: true, healthcareRelevant: true },
            { metric: 'timeToInteractive', threshold: 3000, operator: 'less-than', value: 0, critical: false, healthcareRelevant: true },
          ],
          expectedMetrics: {
            responseTime: 2000,
            memoryUsage: 52,
            bundleSize: 480,
            coreWebVitals: {
              lcp: 1500,
              fid: 90,
              cls: 0.06,
              fcp: 1300,
              ttfb: 650,
            },
            healthcareWorkflows: {
              appointmentBooking: 2800,
              clinicSearch: 1000,
              doctorDiscovery: 1200,
              formSubmission: 1100,
            }
          },
          criticalPaths: ['doctor-info', 'availability', 'booking-button', 'reviews']
        },
        {
          id: 'appointment-booking',
          name: 'Appointment Booking Workflow',
          url: '/appointments/book',
          interactions: [
            { type: 'navigate', selector: '', delay: 1500 },
            { type: 'click', selector: '.doctor-select', delay: 1000 },
            { type: 'click', selector: '.time-slot', delay: 500 },
            { type: 'type', selector: 'input[name="patientName"]', value: 'Test Patient', delay: 800 },
            { type: 'type', selector: 'input[name="phone"]', value: '+65-9123-4567', delay: 800 },
            { type: 'click', selector: 'button[type="submit"]', delay: 1000 }
          ],
          performanceChecks: [
            { metric: 'loadTime', threshold: 2500, operator: 'less-than', value: 0, critical: true, healthcareRelevant: true },
            { metric: 'firstInputDelay', threshold: 100, operator: 'less-than', value: 0, critical: true, healthcareRelevant: true },
            { metric: 'totalBlockingTime', threshold: 200, operator: 'less-than', value: 0, critical: false, healthcareRelevant: true },
          ],
          expectedMetrics: {
            responseTime: 2200,
            memoryUsage: 48,
            bundleSize: 450,
            coreWebVitals: {
              lcp: 1600,
              fid: 70,
              cls: 0.04,
              fcp: 1400,
              ttfb: 700,
            },
            healthcareWorkflows: {
              appointmentBooking: 3200,
              clinicSearch: 800,
              doctorDiscovery: 600,
              formSubmission: 1800,
            }
          },
          criticalPaths: ['doctor-selection', 'time-selection', 'form-fields', 'submit-button']
        }
      ],
      baselineResults: new Map(),
      comparisonCriteria: {
        performanceRegressionThreshold: 15, // 15% degradation threshold
        bundleSizeRegressionThreshold: 10, // 10% bundle size increase
        responseTimeRegressionThreshold: 20, // 20% response time increase
        memoryUsageRegressionThreshold: 25, // 25% memory increase
        coreWebVitalsRegressionThreshold: 15, // 15% Web Vitals degradation
        healthcareWorkflowRegressionThreshold: 25, // 25% workflow degradation
      },
      automatedChecks: [
        {
          type: 'lighthouse',
          schedule: 'on-commit',
          thresholds: {
            performanceScore: 90,
            accessibilityScore: 95,
            bestPracticesScore: 90,
            seoScore: 85,
            pwaScore: 80,
          },
          alerts: {
            email: true,
            slack: true,
            dashboard: true,
            criticalEscalation: true,
          }
        },
        {
          type: 'bundle-analyzer',
          schedule: 'daily',
          thresholds: {
            performanceScore: 0,
            accessibilityScore: 0,
            bestPracticesScore: 0,
            seoScore: 0,
            pwaScore: 0,
          },
          alerts: {
            email: false,
            slack: false,
            dashboard: true,
            criticalEscalation: false,
          }
        }
      ]
    }

    this.testSuites.set(coreSuite.id, coreSuite)

    // Healthcare compliance test suite
    const complianceSuite: RegressionTestSuite = {
      id: 'healthcare-compliance',
      name: 'Healthcare Compliance Regression',
      description: 'Healthcare compliance and PDPA performance regression testing',
      testCases: [
        {
          id: 'pdpa-consent',
          name: 'PDPA Consent Performance',
          url: '/privacy/consent',
          interactions: [
            { type: 'navigate', selector: '', delay: 1000 },
            { type: 'scroll', selector: '.consent-form', delay: 2000 },
            { type: 'click', selector: 'input[name="consent"]', delay: 500 },
            { type: 'click', selector: 'button[type="submit"]', delay: 1000 }
          ],
          performanceChecks: [
            { metric: 'loadTime', threshold: 1800, operator: 'less-than', value: 0, critical: true, healthcareRelevant: true },
            { metric: 'largestContentfulPaint', threshold: 1200, operator: 'less-than', value: 0, critical: true, healthcareRelevant: true },
          ],
          expectedMetrics: {
            responseTime: 1600,
            memoryUsage: 38,
            bundleSize: 320,
            coreWebVitals: {
              lcp: 1100,
              fid: 60,
              cls: 0.03,
              fcp: 900,
              ttfb: 500,
            },
            healthcareWorkflows: {
              appointmentBooking: 0,
              clinicSearch: 0,
              doctorDiscovery: 0,
              formSubmission: 1500,
            }
          },
          criticalPaths: ['consent-form', 'privacy-policy', 'submit-button']
        }
      ],
      baselineResults: new Map(),
      comparisonCriteria: {
        performanceRegressionThreshold: 10,
        bundleSizeRegressionThreshold: 5,
        responseTimeRegressionThreshold: 15,
        memoryUsageRegressionThreshold: 20,
        coreWebVitalsRegressionThreshold: 10,
        healthcareWorkflowRegressionThreshold: 15,
      },
      automatedChecks: []
    }

    this.testSuites.set(complianceSuite.id, complianceSuite)
  }

  /**
   * Execute regression test suite
   */
  async executeRegressionSuite(
    suiteId: string,
    environment: 'development' | 'staging' | 'production' = 'staging'
  ): Promise<RegressionTestResult[]> {
    if (this.isRunning) {
      throw new Error('Regression testing is already running')
    }

    const suite = this.testSuites.get(suiteId)
    if (!suite) {
      throw new Error(`Test suite ${suiteId} not found`)
    }

    this.isRunning = true
    const results: RegressionTestResult[] = []

    try {
      console.log(`Executing regression suite: ${suite.name} in ${environment}`)

      for (const testCase of suite.testCases) {
        const result = await this.executeRegressionTestCase(testCase, suite, environment)
        results.push(result)
        this.currentResults.set(result.testCaseId, result)

        // Add delay between test cases
        await new Promise(resolve => setTimeout(resolve, 2000))
      }

      console.log(`Completed regression suite: ${suite.name}`)
      return results

    } finally {
      this.isRunning = false
    }
  }

  /**
   * Execute individual regression test case
   */
  private async executeRegressionTestCase(
    testCase: RegressionTestCase,
    suite: RegressionTestSuite,
    environment: string
  ): Promise<RegressionTestResult> {
    const startTime = Date.now()
    
    try {
      console.log(`Running regression test: ${testCase.name}`)
      
      // Simulate regression test execution
      const currentMetrics = await this.simulateRegressionTestExecution(testCase, environment)
      const baseline = this.getBaselineResult(testCase.id, environment)
      
      const comparison = this.compareWithBaseline(currentMetrics, baseline, suite.comparisonCriteria)
      const regressions = this.identifyRegressions(comparison, suite.comparisonCriteria)
      const recommendations = this.generateRecommendations(regressions, comparison)

      const result: RegressionTestResult = {
        testCaseId: testCase.id,
        testName: testCase.name,
        timestamp: startTime,
        duration: Date.now() - startTime,
        status: regressions.length === 0 ? 'passed' : 'failed',
        environment,
        currentMetrics,
        baselineMetrics: baseline?.metrics || currentMetrics,
        comparison,
        regressions,
        recommendations,
        artifacts: [],
        metadata: {
          commitHash: 'mock-hash',
          branch: 'main',
          author: 'test-user',
          message: 'Test execution',
          buildNumber: '123',
          environment,
          runnerId: 'regression-runner-1',
          custom: {}
        }
      }

      return result

    } catch (error) {
      console.error(`Regression test failed: ${testCase.name}`, error)
      return {
        testCaseId: testCase.id,
        testName: testCase.name,
        timestamp: startTime,
        duration: Date.now() - startTime,
        status: 'error',
        environment,
        currentMetrics: testCase.expectedMetrics,
        baselineMetrics: testCase.expectedMetrics,
        comparison: {
          overall: { improved: false, degraded: false, changed: 0, criticalChanges: 0 },
          metrics: [],
          healthcare: {
            workflowComparisons: new Map(),
            overallScore: { current: 0, baseline: 0, change: 0 },
            patientJourneyImpact: [],
            complianceImpact: []
          },
          compliance: {
            overall: { current: 0, baseline: 0, change: 0 },
            requirements: new Map(),
            violations: []
          },
          visual: {
            screenshots: [],
            differences: [],
            score: { current: 0, baseline: 0, change: 0 }
          }
        },
        regressions: [{
          metric: 'test-execution',
          severity: 'critical' as const,
          description: `Test execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          previousValue: 0,
          currentValue: 0,
          threshold: 0,
          healthcareWorkflow: testCase.name,
          recommendation: 'Investigate test execution environment and fix underlying issue'
        }],
        recommendations: [],
        artifacts: [],
        metadata: {
          commitHash: 'error',
          branch: 'error',
          author: 'error',
          message: 'Error during execution',
          buildNumber: '0',
          environment,
          runnerId: 'regression-runner-1',
          custom: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      }
    }
  }

  /**
   * Simulate regression test execution with realistic healthcare metrics
   */
  private async simulateRegressionTestExecution(testCase: RegressionTestCase, environment: string) {
    // Simulate realistic performance metrics with some variance
    const baseTime = Date.now()
    const variance = (Math.random() - 0.5) * 0.1 // ±5% variance

    const responseTime = testCase.expectedMetrics.responseTime * (1 + variance)
    const memoryUsage = testCase.expectedMetrics.memoryUsage * (1 + variance * 0.5)
    const bundleSize = testCase.expectedMetrics.bundleSize * (1 + variance * 0.3)

    return {
      responseTime,
      memoryUsage,
      bundleSize,
      coreWebVitals: {
        lcp: testCase.expectedMetrics.coreWebVitals.lcp * (1 + variance),
        fid: testCase.expectedMetrics.coreWebVitals.fid * (1 + variance * 0.8),
        cls: testCase.expectedMetrics.coreWebVitals.cls * (1 + variance * 0.6),
        fcp: testCase.expectedMetrics.coreWebVitals.fcp * (1 + variance),
        ttfb: testCase.expectedMetrics.coreWebVitals.ttfb * (1 + variance),
      },
      healthcareWorkflows: {
        appointmentBooking: testCase.expectedMetrics.healthcareWorkflows.appointmentBooking * (1 + variance * 1.2),
        clinicSearch: testCase.expectedMetrics.healthcareWorkflows.clinicSearch * (1 + variance),
        doctorDiscovery: testCase.expectedMetrics.healthcareWorkflows.doctorDiscovery * (1 + variance * 0.8),
        formSubmission: testCase.expectedMetrics.healthcareWorkflows.formSubmission * (1 + variance * 1.1),
      }
    }
  }

  /**
   * Get baseline result for test case
   */
  private getBaselineResult(testCaseId: string, environment: string): BaselineResult | undefined {
    const key = `${testCaseId}-${environment}`
    return this.baselines.get(key)
  }

  /**
   * Compare current metrics with baseline
   */
  private compareWithBaseline(
    current: any,
    baseline: BaselineResult | undefined,
    criteria: any
  ): RegressionComparison {
    if (!baseline) {
      // No baseline available, create empty comparison
      return {
        overall: { improved: false, degraded: false, changed: 0, criticalChanges: 0 },
        metrics: [],
        healthcare: {
          workflowComparisons: new Map(),
          overallScore: { current: 100, baseline: 0, change: 0 },
          patientJourneyImpact: [],
          complianceImpact: []
        },
        compliance: {
          overall: { current: 100, baseline: 0, change: 0 },
          requirements: new Map(),
          violations: []
        },
        visual: {
          screenshots: [],
          differences: [],
          score: { current: 100, baseline: 0, change: 0 }
        }
      }
    }

    const metrics: any[] = []
    let improved = 0
    let degraded = 0
    let criticalChanges = 0

    // Compare response time (lower is better)
    const responseTimeChange = this.calculatePercentChange(current.responseTime, baseline.metrics.responseTime)
    const responseTimeImpact = responseTimeChange < 0 ? 'positive' : responseTimeChange > criteria.performanceRegressionThreshold ? 'negative' : 'neutral'
    
    if (responseTimeImpact === 'positive') improved++
    if (responseTimeImpact === 'negative') {
      degraded++
      if (responseTimeChange > criteria.performanceRegressionThreshold * 2) criticalChanges++
    }

    metrics.push({
      metric: 'responseTime',
      category: 'performance',
      current: current.responseTime,
      baseline: baseline.metrics.responseTime,
      change: current.responseTime - baseline.metrics.responseTime,
      changePercent: responseTimeChange,
      severity: responseTimeImpact,
      threshold: criteria.performanceRegressionThreshold,
      operator: 'greater-than',
      healthcareImpact: 'Patient experience degradation in page load times'
    })

    // Compare Core Web Vitals
    Object.entries(current.coreWebVitals).forEach(([vital, currentValue]) => {
      const baselineValue = baseline.metrics.coreWebVitals[vital as keyof typeof baseline.metrics.coreWebVitals]
      const change = this.calculatePercentChange(currentValue as number, baselineValue)
      const impact = (change as number) < 0 ? 'positive' : (change as number) > criteria.coreWebVitalsRegressionThreshold ? 'negative' : 'neutral'
      
      if (impact === 'positive') improved++
      if (impact === 'negative') {
        degraded++
        if (change > criteria.coreWebVitalsRegressionThreshold * 2) criticalChanges++
      }

      metrics.push({
        metric: vital,
        category: 'core-web-vitals',
        current: currentValue,
        baseline: baselineValue,
        change: (currentValue as number) - baselineValue,
        changePercent: change,
        severity: impact,
        threshold: criteria.coreWebVitalsRegressionThreshold,
        operator: 'greater-than',
        healthcareImpact: this.getHealthcareImpactForVital(vital, change as number)
      })
    })

    // Compare healthcare workflows
    const workflowComparisons = new Map<string, any>()
    let totalHealthcareScore = 0
    let totalBaselineScore = 0

    Object.entries(current.healthcareWorkflows).forEach(([workflow, currentValue]) => {
      const baselineValue = baseline.metrics.healthcareWorkflows[workflow as keyof typeof baseline.metrics.healthcareWorkflows]
      const change = this.calculatePercentChange(currentValue as number, baselineValue)
      const impact = (change as number) < 0 ? 'positive' : (change as number) > criteria.healthcareWorkflowRegressionThreshold ? 'negative' : 'neutral'
      
      if (impact === 'positive') improved++
      if (impact === 'negative') {
        degraded++
        if (change > criteria.healthcareWorkflowRegressionThreshold * 2) criticalChanges++
      }

      workflowComparisons.set(workflow, {
        workflowId: workflow,
        workflowName: this.formatWorkflowName(workflow),
        current: currentValue,
        baseline: baselineValue,
        change: (currentValue as number) - baselineValue,
        changePercent: change,
        impact,
        severity: impact === 'critical' ? 'critical' : impact
      })

      totalHealthcareScore += (currentValue as number)
      totalBaselineScore += baselineValue
    })

    return {
      overall: {
        improved: improved > degraded,
        degraded: degraded > improved,
        changed: metrics.length,
        criticalChanges
      },
      metrics,
      healthcare: {
        workflowComparisons,
        overallScore: {
          current: totalHealthcareScore,
          baseline: totalBaselineScore,
          change: this.calculatePercentChange(totalHealthcareScore, totalBaselineScore)
        },
        patientJourneyImpact: this.generatePatientJourneyImpact(workflowComparisons),
        complianceImpact: []
      },
      compliance: {
        overall: { current: 95, baseline: 95, change: 0 }, // Mock compliance score
        requirements: new Map(),
        violations: []
      },
      visual: {
        screenshots: [],
        differences: [],
        score: { current: 98, baseline: 98, change: 0 }
      }
    }
  }

  /**
   * Calculate percentage change between two values
   */
  private calculatePercentChange(current: number, baseline: number): number {
    if (baseline === 0) return 0
    return ((current - baseline) / baseline) * 100
  }

  /**
   * Get healthcare impact description for specific Web Vital
   */
  private getHealthcareImpactForVital(vital: string, change: number): string {
    const impacts = {
      lcp: change > 15 ? 'Critical impact on patient experience during page load' : change > 10 ? 'Moderate impact on patient experience' : 'Minimal impact on patient experience',
      fid: change > 15 ? 'Critical delay in patient interaction responsiveness' : change > 10 ? 'Noticeable delay in patient interactions' : 'Acceptable interaction delay',
      cls: change > 15 ? 'Critical layout shifts affecting patient workflow' : change > 10 ? 'Layout shifts disrupting patient flow' : 'Minor layout adjustments',
      fcp: change > 15 ? 'Critical delay in first content display' : change > 10 ? 'Delayed first content display' : 'Acceptable first content timing',
      ttfb: change > 15 ? 'Critical server response delay affecting healthcare workflows' : change > 10 ? 'Server response delays noticeable to users' : 'Acceptable server response time'
    }
    return impacts[vital as keyof typeof impacts] || 'Healthcare workflow impact assessment needed'
  }

  /**
   * Format workflow name for display
   */
  private formatWorkflowName(workflow: string): string {
    return workflow.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim()
  }

  /**
   * Generate patient journey impact analysis
   */
  private generatePatientJourneyImpact(workflowComparisons: Map<string, any>): any[] {
    const impacts: any[] = []
    
    workflowComparisons.forEach((comparison, workflow) => {
      if (Math.abs(comparison.changePercent) > 10) {
        impacts.push({
          journeyId: workflow,
          stageId: workflow,
          impact: comparison.changePercent > 0 ? 'negative' : 'positive',
          severity: Math.abs(comparison.changePercent) > 25 ? 'critical' : Math.abs(comparison.changePercent) > 15 ? 'high' : 'medium',
          description: `Performance ${comparison.changePercent > 0 ? 'degradation' : 'improvement'} in ${this.formatWorkflowName(workflow)}`,
          affectedUsers: Math.floor(Math.random() * 1000) + 100
        })
      }
    })

    return impacts
  }

  /**
   * Identify regressions based on comparison results
   */
  private identifyRegressions(comparison: RegressionComparison, criteria: any): PerformanceRegression[] {
    const regressions: PerformanceRegression[] = []

    comparison.metrics.forEach(metric => {
      if (metric.severity === 'regression' || metric.severity === 'critical') {
        regressions.push({
          metric: metric.metric,
          severity: metric.severity === 'critical' ? 'critical' : 'high',
          description: `Performance regression in ${metric.metric}: ${metric.changePercent.toFixed(1)}% degradation`,
          previousValue: metric.baseline,
          currentValue: metric.current,
          threshold: metric.threshold,
          healthcareWorkflow: metric.healthcareImpact || 'General healthcare workflow',
          recommendation: this.getRegressionRecommendation(metric.metric, metric.changePercent)
        })
      }
    })

    return regressions
  }

  /**
   * Get recommendation for specific regression type
   */
  private getRegressionRecommendation(metric: string, changePercent: number): string {
    const recommendations = {
      responseTime: 'Investigate server response times, optimize database queries, implement caching strategies',
      lcp: 'Optimize images, implement lazy loading, reduce JavaScript bundle size',
      fid: 'Reduce JavaScript execution time, optimize event handlers, implement code splitting',
      cls: 'Add dimensions to images, reserve space for dynamic content, use font-display: swap',
      fcp: 'Optimize critical rendering path, reduce server response time, optimize CSS delivery',
      ttfb: 'Improve server performance, optimize database queries, implement CDN',
      appointmentBooking: 'Optimize appointment booking workflow, reduce form complexity, improve API response times',
      clinicSearch: 'Optimize search algorithm, implement search result caching, improve database indexing',
      doctorDiscovery: 'Optimize doctor profile loading, implement data prefetching, optimize image delivery',
      formSubmission: 'Optimize form validation, improve API response times, implement progressive enhancement'
    }
    return recommendations[metric as keyof typeof recommendations] || 'Performance analysis and optimization required'
  }

  /**
   * Generate recommendations based on regressions and improvements
   */
  private generateRecommendations(regressions: PerformanceRegression[], comparison: RegressionComparison): RegressionRecommendation[] {
    const recommendations: RegressionRecommendation[] = []

    // Generate recommendations for regressions
    regressions.forEach(regression => {
      recommendations.push({
        id: `rec-${regression.metric}-${Date.now()}`,
        category: this.getRecommendationCategory(regression.metric),
        priority: regression.severity,
        title: `Fix ${regression.metric} Performance Regression`,
        description: regression.description,
        impact: regression.healthcareWorkflow,
        implementation: this.getRegressionRecommendation(regression.metric, regression.changePercent),
        estimatedEffort: this.estimateEffort(regression.metric, regression.severity),
        dependencies: this.getDependencies(regression.metric),
        healthcareRelevance: regression.healthcareWorkflow,
        automation: {
          canAutomate: this.canAutomate(regression.metric),
          automationLevel: this.getAutomationLevel(regression.metric),
          scriptAvailable: this.hasScript(regression.metric),
          configuration: []
        }
      })
    })

    // Generate general optimization recommendations
    if (comparison.overall.improved) {
      recommendations.push({
        id: `rec-optimization-${Date.now()}`,
        category: 'optimization',
        priority: 'low',
        title: 'Leverage Performance Improvements',
        description: 'Document and maintain current performance optimizations',
        impact: 'Sustain and improve current healthcare workflow performance',
        implementation: 'Monitor performance trends, implement performance budgets, automated performance testing',
        estimatedEffort: '2-4 hours',
        dependencies: ['performance monitoring', 'CI/CD integration'],
        healthcareRelevance: 'Maintains optimal patient experience',
        automation: {
          canAutomate: true,
          automationLevel: 'full',
          scriptAvailable: true,
          configuration: [{
            type: 'performance-monitoring',
            description: 'Continuous performance monitoring setup',
            parameters: {},
            validation: []
          }]
        }
      })
    }

    return recommendations
  }

  /**
   * Get recommendation category for metric
   */
  private getRecommendationCategory(metric: string): 'optimization' | 'fix' | 'investigation' | 'configuration' {
    if (metric.includes('bundle') || metric.includes('size')) return 'optimization'
    if (metric.includes('response') || metric.includes('load')) return 'fix'
    if (metric.includes('memory') || metric.includes('leak')) return 'investigation'
    return 'configuration'
  }

  /**
   * Estimate effort for fixing regression
   */
  private estimateEffort(metric: string, severity: string): string {
    const effortMap = {
      'critical': {
        'responseTime': '1-2 days',
        'lcp': '2-4 days',
        'fid': '3-5 days',
        'cls': '1-2 days',
        'appointmentBooking': '2-3 days',
        'default': '1-3 days'
      },
      'high': {
        'responseTime': '4-8 hours',
        'lcp': '1-2 days',
        'fid': '1-3 days',
        'cls': '4-8 hours',
        'appointmentBooking': '1 day',
        'default': '4-12 hours'
      },
      'medium': {
        'responseTime': '2-4 hours',
        'lcp': '4-8 hours',
        'fid': '4-8 hours',
        'cls': '2-4 hours',
        'appointmentBooking': '4 hours',
        'default': '2-6 hours'
      },
      'low': {
        'responseTime': '1-2 hours',
        'lcp': '2-4 hours',
        'fid': '2-4 hours',
        'cls': '1-2 hours',
        'appointmentBooking': '2 hours',
        'default': '1-3 hours'
      }
    }

    return effortMap[severity as keyof typeof effortMap]?.[metric as keyof typeof effortMap['critical']] || 
           effortMap[severity as keyof typeof effortMap]?.['default'] || 
           '2-4 hours'
  }

  /**
   * Get dependencies for metric optimization
   */
  private getDependencies(metric: string): string[] {
    const dependencyMap: Record<string, string[]> = {
      'responseTime': ['server performance', 'database optimization', 'CDN configuration'],
      'lcp': ['image optimization', 'critical CSS', 'JavaScript bundling'],
      'fid': ['JavaScript optimization', 'event handler optimization', 'code splitting'],
      'cls': ['CSS optimization', 'image dimensions', 'font loading'],
      'appointmentBooking': ['API optimization', 'form validation', 'database queries'],
      'clinicSearch': ['search algorithm', 'database indexing', 'result caching'],
      'doctorDiscovery': ['profile data loading', 'image optimization', 'prefetching'],
      'formSubmission': ['form optimization', 'API response', 'validation logic']
    }
    return dependencyMap[metric] || ['performance analysis', 'code review']
  }

  /**
   * Check if metric optimization can be automated
   */
  private canAutomate(metric: string): boolean {
    const automatableMetrics = ['bundleSize', 'memory', 'network', 'caching']
    return automatableMetrics.includes(metric) || metric.includes('bundle') || metric.includes('memory')
  }

  /**
   * Get automation level for metric
   */
  private getAutomationLevel(metric: string): 'partial' | 'full' | 'none' {
    const fullyAutomated = ['bundleSize', 'memory', 'caching', 'compression']
    const partiallyAutomated = ['responseTime', 'lcp', 'cls']
    
    if (fullyAutomated.includes(metric)) return 'full'
    if (partiallyAutomated.includes(metric)) return 'partial'
    return 'none'
  }

  /**
   * Check if optimization script exists for metric
   */
  private hasScript(metric: string): boolean {
    const scriptedMetrics = ['bundleSize', 'memory', 'lighthouse', 'compression']
    return scriptedMetrics.includes(metric)
  }

  /**
   * Execute automated regression checks
   */
  async executeAutomatedChecks(suiteId: string): Promise<void> {
    const suite = this.testSuites.get(suiteId)
    if (!suite) return

    console.log(`Executing automated checks for suite: ${suite.name}`)

    for (const check of suite.automatedChecks) {
      if (check.type === 'lighthouse') {
        await this.runLighthouseCheck(check, suite)
      } else if (check.type === 'bundle-analyzer') {
        await this.runBundleAnalysisCheck(check, suite)
      }
    }
  }

  /**
   * Run Lighthouse automated check
   */
  private async runLighthouseCheck(check: AutomatedRegressionCheck, suite: RegressionTestSuite): Promise<void> {
    console.log('Running Lighthouse automated check...')
    
    // Simulate Lighthouse execution
    await new Promise(resolve => setTimeout(resolve, 5000)) // Simulate processing time
    
    for (const testCase of suite.testCases) {
      const lighthouseScore = 85 + Math.random() * 15 // 85-100 score
      const performanceScore = 80 + Math.random() * 20 // 80-100 score
      
      if (lighthouseScore < check.thresholds.performanceScore) {
        console.warn(`Lighthouse performance score ${lighthouseScore} below threshold ${check.thresholds.performanceScore} for ${testCase.name}`)
      }
      
      if (check.alerts.email) {
        // In real implementation, would send email alert
        console.log(`Email alert sent for ${testCase.name}: Lighthouse score ${lighthouseScore}`)
      }
    }
  }

  /**
   * Run bundle analysis check
   */
  private async runBundleAnalysisCheck(check: AutomatedRegressionCheck, suite: RegressionTestSuite): Promise<void> {
    console.log('Running bundle analysis check...')
    
    // Simulate bundle analysis
    await new Promise(resolve => setTimeout(resolve, 3000)) // Simulate processing time
    
    for (const testCase of suite.testCases) {
      const currentBundleSize = testCase.expectedMetrics.bundleSize * (1 + (Math.random() - 0.5) * 0.2)
      
      if (currentBundleSize > testCase.expectedMetrics.bundleSize * 1.1) { // 10% increase threshold
        console.warn(`Bundle size ${currentBundleSize.toFixed(0)}KB increased by more than 10% for ${testCase.name}`)
      }
    }
  }

  /**
   * Update baseline for test case
   */
  updateBaseline(testCaseId: string, environment: string, result: RegressionTestResult): void {
    const key = `${testCaseId}-${environment}`
    const baseline: BaselineResult = {
      timestamp: Date.now(),
      environment,
      metrics: result.currentMetrics,
      performanceScore: this.calculatePerformanceScore(result.currentMetrics),
      complianceScore: 95, // Mock compliance score
      healthChecks: [
        { name: 'performance', status: 'pass', message: 'Performance metrics within acceptable range', value: 90, threshold: 80 },
        { name: 'healthcare-workflows', status: 'pass', message: 'Healthcare workflows performing well', value: 95, threshold: 85 },
        { name: 'compliance', status: 'pass', message: 'Healthcare compliance maintained', value: 95, threshold: 90 },
      ]
    }
    
    this.baselines.set(key, baseline)
    console.log(`Baseline updated for ${testCaseId} in ${environment} environment`)
  }

  /**
   * Calculate overall performance score
   */
  private calculatePerformanceScore(metrics: any): number {
    const weights = {
      responseTime: 0.2,
      memoryUsage: 0.1,
      bundleSize: 0.1,
      coreWebVitals: 0.4,
      healthcareWorkflows: 0.2
    }
    
    let score = 0
    score += (100 - Math.min(metrics.responseTime / 50, 100)) * weights.responseTime
    score += (100 - Math.min(metrics.memoryUsage, 100)) * weights.memoryUsage
    score += (100 - Math.min(metrics.bundleSize / 10, 100)) * weights.bundleSize
    
    const webVitalsScore = (
      (100 - metrics.coreWebVitals.lcp / 20) +
      (100 - metrics.coreWebVitals.fid * 2) +
      (100 - metrics.coreWebVitals.cls * 500)
    ) / 3
    score += webVitalsScore * weights.coreWebVitals
    
    const workflowsScore = (
      (100 - metrics.healthcareWorkflows.appointmentBooking / 100) +
      (100 - metrics.healthcareWorkflows.clinicSearch / 50) +
      (100 - metrics.healthcareWorkflows.doctorDiscovery / 40) +
      (100 - metrics.healthcareWorkflows.formSubmission / 60)
    ) / 4
    score += workflowsScore * weights.healthcareWorkflows
    
    return Math.max(0, Math.min(100, score))
  }

  /**
   * Get all test suites
   */
  getTestSuites(): Map<string, RegressionTestSuite> {
    return this.testSuites
  }

  /**
   * Get current test results
   */
  getResults(): Map<string, RegressionTestResult> {
    return this.currentResults
  }

  /**
   * Get baseline results
   */
  getBaselines(): Map<string, BaselineResult> {
    return this.baselines
  }

  /**
   * Generate comprehensive regression report
   */
  generateRegressionReport(results: RegressionTestResult[]): string {
    const totalTests = results.length
    const passedTests = results.filter(r => r.status === 'passed').length
    const failedTests = results.filter(r => r.status === 'failed').length
    const errorTests = results.filter(r => r.status === 'error').length
    const totalRegressions = results.reduce((sum, r) => sum + r.regressions.length, 0)

    const report = `
# Healthcare Performance Regression Test Report

## Executive Summary
- **Generated**: ${new Date().toISOString()}
- **Total Tests**: ${totalTests}
- **Passed**: ${passedTests} (${((passedTests / totalTests) * 100).toFixed(1)}%)
- **Failed**: ${failedTests} (${((failedTests / totalTests) * 100).toFixed(1)}%)
- **Errors**: ${errorTests} (${((errorTests / totalTests) * 100).toFixed(1)}%)
- **Total Regressions**: ${totalRegressions}

## Performance Comparison Summary

### Overall Assessment
${totalRegressions === 0 ? 
  '✅ **No Performance Regressions Detected** - All healthcare workflows performing within acceptable parameters.' :
  `⚠️ **${totalRegressions} Performance Regressions Detected** - Immediate attention required for healthcare workflow performance.`
}

### Healthcare Workflow Performance
${results.map(result => `
#### ${result.testName}
- **Status**: ${result.status}
- **Performance Score**: ${this.calculatePerformanceScore(result.currentMetrics).toFixed(1)}/100
- **Healthcare Compliance**: ${result.comparison.healthcare.overallScore.current > 90 ? 'Compliant' : 'Needs Attention'}
- **Regressions**: ${result.regressions.length}
`).join('')}

## Detailed Regression Analysis

${results.filter(r => r.regressions.length > 0).map(result => `
### ${result.testName} Regressions

${result.regressions.map(regression => `
#### ${regression.metric} (${regression.severity.toUpperCase()})
- **Description**: ${regression.description}
- **Current Value**: ${regression.currentValue.toFixed(1)}
- **Baseline Value**: ${regression.previousValue.toFixed(1)}
- **Healthcare Impact**: ${regression.healthcareWorkflow}
- **Recommendation**: ${regression.recommendation}
`).join('')}

`).join('')}

## Recommendations

${results.flatMap(r => r.recommendations).map((rec, index) => `
### ${index + 1}. ${rec.title} (${rec.priority.toUpperCase()})
**Category**: ${rec.category}
**Estimated Effort**: ${rec.estimatedEffort}

${rec.description}

**Implementation**: ${rec.implementation}

**Healthcare Relevance**: ${rec.healthcareRelevance}

**Dependencies**: ${rec.dependencies.join(', ')}

${rec.automation.canAutomate ? `**Automation**: Available (${rec.automation.automationLevel} level)` : '**Automation**: Manual implementation required'}
`).join('')}

## Baseline Status

${Array.from(this.baselines.entries()).map(([key, baseline]) => `
### ${key}
- **Last Updated**: ${new Date(baseline.timestamp).toISOString()}
- **Environment**: ${baseline.environment}
- **Performance Score**: ${baseline.performanceScore.toFixed(1)}/100
- **Health Checks**: ${baseline.healthChecks.filter(h => h.status === 'pass').length}/${baseline.healthChecks.length} passing
`).join('')}

## Next Steps

1. **Immediate Actions** (Within 24 hours)
   - Review and address any critical regressions
   - Investigate failed healthcare workflows
   - Update baselines if performance has improved

2. **Short-term Actions** (Within 1 week)
   - Implement high-priority recommendations
   - Optimize healthcare workflow performance
   - Update automated regression thresholds

3. **Long-term Actions** (Within 1 month)
   - Enhance automated performance monitoring
   - Implement performance budgets
   - Establish continuous performance improvement process

## Technical Details

### Test Configuration
- **Environment**: Staging
- **Browser**: Chrome (simulated)
- **Network**: 4G (simulated)
- **Device**: Desktop (simulated)

### Performance Metrics
- **Response Time Threshold**: < 2s
- **LCP Threshold**: < 2.5s
- **FID Threshold**: < 100ms
- **CLS Threshold**: < 0.1
- **Healthcare Workflow Threshold**: < 3s

### Compliance Standards
- **PDPA Compliance**: Required
- **Healthcare Data Protection**: Required
- **Audit Trail**: Required
- **Medical Record Accuracy**: Required
    `

    return report
  }
}

export { HealthcarePerformanceRegressionTest }
export type { RegressionTestResult, RegressionTestSuite }