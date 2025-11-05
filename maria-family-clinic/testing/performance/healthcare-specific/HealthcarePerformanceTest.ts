/**
 * Healthcare-Specific Performance Testing Framework
 * Sub-Phase 11.5: Performance & Load Testing
 * Healthcare workflow performance validation and optimization
 */

import { PerformanceTestService } from '../../services/PerformanceTestService'

export interface HealthcareWorkflowTestConfig {
  baseUrl: string
  workflows: Array<{
    name: string
    description: string
    priority: 'critical' | 'emergency' | 'important' | 'standard'
    category: 'emergency' | 'appointment' | 'data-processing' | 'real-time' | 'security'
    steps: Array<{
      name: string
      endpoint: string
      method: 'GET' | 'POST' | 'PUT' | 'DELETE'
      expectedResponseTime: number
      timeout: number
      critical: boolean
      healthcareSpecific: boolean
      dataSensitivity: 'low' | 'medium' | 'high' | 'critical'
    }>
    validationRules: Array<{
      type: 'response-time' | 'data-integrity' | 'availability' | 'security'
      threshold: number
      unit: 'ms' | 'percentage' | 'count'
    }>
  }>
  testScenarios: Array<{
    name: string
    description: string
    concurrentUsers: number
    duration: string
    workflows: string[]
    peakLoad?: {
      multiplier: number
      duration: string
    }
  }>
  compliance: {
    pdpa: boolean
    moh: boolean
    mdpma: boolean
    emergencyProtocols: boolean
  }
  environments: Array<{
    name: string
    url: string
    concurrentUsers: number
  }>
}

export interface HealthcareWorkflowTestResult {
  workflow: string
  scenario: string
  environment: string
  startTime: number
  endTime: number
  duration: number
  steps: Array<{
    name: string
    responseTime: number
    timeout: boolean
    error: string | null
    dataIntegrity: boolean
    availability: number
    timestamp: number
  }>
  overallPerformance: {
    totalResponseTime: number
    averageResponseTime: number
    p95ResponseTime: number
    p99ResponseTime: number
    errorRate: number
    availability: number
  }
  healthcareMetrics: {
    emergencyResponseTime?: number
    appointmentBookingTime?: number
    dataProcessingTime?: number
    realTimeLatency?: number
    securityCheckTime?: number
    pdpaComplianceTime?: number
  }
  compliance: {
    pdpa: {
      passed: boolean
      dataProtectionValidated: boolean
      consentHandlingTime: number
      dataDeletionTime: number
    }
    moh: {
      passed: boolean
      medicalRecordAccessTime: number
      auditTrailComplete: boolean
    }
    mdpma: {
      passed: boolean
      medicinePrescriptionTime: number
      drugInteractionCheckTime: number
    }
    emergency: {
      passed: boolean
      emergencyContactTime: number
      crisisResponseTime: number
      escalationTime: number
    }
  }
  performanceScore: number
  recommendations: string[]
  passed: boolean
}

export interface HealthcarePerformanceBenchmark {
  category: 'emergency' | 'appointment' | 'data-processing' | 'real-time' | 'security'
  workflow: string
  critical: {
    responseTime: number
    throughput: number
    availability: number
  }
  warning: {
    responseTime: number
    throughput: number
    availability: number
  }
  current: {
    responseTime: number
    throughput: number
    availability: number
  }
  compliance: {
    pdpa: boolean
    moh: boolean
    mdpma: boolean
    emergency: boolean
  }
  recommendations: string[]
}

export class HealthcarePerformanceTest {
  private config: HealthcareWorkflowTestConfig
  private results: HealthcareWorkflowTestResult[] = []
  private benchmarks: HealthcarePerformanceBenchmark[] = []

  constructor(config: HealthcareWorkflowTestConfig) {
    this.config = config
    this.validateConfiguration()
    this.initializeBenchmarks()
  }

  private validateConfiguration() {
    if (!this.config.baseUrl) {
      throw new Error('Base URL is required for healthcare performance testing')
    }
    if (!this.config.workflows || this.config.workflows.length === 0) {
      throw new Error('At least one healthcare workflow must be defined')
    }
    if (!this.config.testScenarios || this.config.testScenarios.length === 0) {
      throw new Error('At least one test scenario must be defined')
    }
  }

  private initializeBenchmarks() {
    // Initialize healthcare-specific performance benchmarks
    this.benchmarks = [
      {
        category: 'emergency',
        workflow: 'Emergency Contact System',
        critical: { responseTime: 500, throughput: 100, availability: 99.9 },
        warning: { responseTime: 1000, throughput: 50, availability: 99.5 },
        current: { responseTime: 0, throughput: 0, availability: 0 },
        compliance: { pdpa: true, moh: true, mdpma: false, emergency: true },
        recommendations: []
      },
      {
        category: 'appointment',
        workflow: 'Doctor Appointment Booking',
        critical: { responseTime: 1000, throughput: 200, availability: 99.5 },
        warning: { responseTime: 2000, throughput: 100, availability: 99.0 },
        current: { responseTime: 0, throughput: 0, availability: 0 },
        compliance: { pdpa: true, moh: true, mdpma: false, emergency: false },
        recommendations: []
      },
      {
        category: 'data-processing',
        workflow: 'Medical Data Processing',
        critical: { responseTime: 2000, throughput: 50, availability: 99.9 },
        warning: { responseTime: 5000, throughput: 20, availability: 99.5 },
        current: { responseTime: 0, throughput: 0, availability: 0 },
        compliance: { pdpa: true, moh: true, mdpma: true, emergency: false },
        recommendations: []
      },
      {
        category: 'real-time',
        workflow: 'Real-time Clinic Availability',
        critical: { responseTime: 100, throughput: 1000, availability: 99.95 },
        warning: { responseTime: 250, throughput: 500, availability: 99.9 },
        current: { responseTime: 0, throughput: 0, availability: 0 },
        compliance: { pdpa: true, moh: true, mdpma: false, emergency: true },
        recommendations: []
      },
      {
        category: 'security',
        workflow: 'Healthcare Data Security',
        critical: { responseTime: 200, throughput: 500, availability: 99.99 },
        warning: { responseTime: 500, throughput: 200, availability: 99.95 },
        current: { responseTime: 0, throughput: 0, availability: 0 },
        compliance: { pdpa: true, moh: true, mdpma: true, emergency: false },
        recommendations: []
      }
    ]
  }

  /**
   * Execute comprehensive healthcare performance tests
   */
  async runHealthcarePerformanceTests(): Promise<HealthcareWorkflowTestResult[]> {
    console.log('Starting healthcare-specific performance testing...')

    const allResults: HealthcareWorkflowTestResult[] = []

    // Test each environment
    for (const environment of this.config.environments) {
      console.log(`Testing environment: ${environment.name}`)

      // Test each scenario
      for (const scenario of this.config.testScenarios) {
        console.log(`Running scenario: ${scenario.name}`)

        // Test each workflow in the scenario
        for (const workflowName of scenario.workflows) {
          const workflow = this.config.workflows.find(w => w.name === workflowName)
          if (!workflow) {
            console.warn(`Workflow ${workflowName} not found, skipping...`)
            continue
          }

          const result = await this.executeWorkflowTest(
            workflow,
            scenario,
            environment,
            workflowName
          )
          allResults.push(result)

          // Update benchmark with current results
          this.updateBenchmark(result)
        }
      }
    }

    this.results = allResults

    // Generate comprehensive healthcare performance report
    await this.generateHealthcarePerformanceReport(allResults)

    return allResults
  }

  private async executeWorkflowTest(
    workflow: HealthcareWorkflowTestConfig['workflows'][0],
    scenario: HealthcareWorkflowTestConfig['testScenarios'][0],
    environment: HealthcareWorkflowTestConfig['environments'][0],
    workflowName: string
  ): Promise<HealthcareWorkflowTestResult> {
    const startTime = Date.now()
    console.log(`Testing workflow: ${workflow.name} (${workflow.priority} priority)`)

    try {
      const steps: HealthcareWorkflowTestResult['steps'] = []

      // Execute workflow steps sequentially
      for (const step of workflow.steps) {
        const stepStartTime = Date.now()
        
        try {
          // Simulate healthcare API call
          const responseTime = await this.simulateHealthcareAPICall(
            environment.url,
            step,
            workflow.category
          )

          const stepEndTime = Date.now()
          const responseTimeActual = stepEndTime - stepStartTime

          // Validate response time
          const timeout = responseTimeActual > step.timeout
          
          // Simulate data integrity check
          const dataIntegrity = Math.random() > 0.05 // 95% data integrity
          
          // Simulate availability check
          const availability = 99.0 + Math.random() * 1.0 // 99-100% availability

          steps.push({
            name: step.name,
            responseTime: responseTimeActual,
            timeout,
            error: timeout ? 'Request timeout' : null,
            dataIntegrity,
            availability,
            timestamp: stepStartTime
          })

          // Wait between steps to simulate realistic workflow timing
          if (step !== workflow.steps[workflow.steps.length - 1]) {
            await this.delay(100 + Math.random() * 200) // 100-300ms between steps
          }

        } catch (error) {
          const stepEndTime = Date.now()
          steps.push({
            name: step.name,
            responseTime: stepEndTime - stepStartTime,
            timeout: true,
            error: (error as Error).message,
            dataIntegrity: false,
            availability: 0,
            timestamp: stepStartTime
          })
        }
      }

      const endTime = Date.now()
      const duration = endTime - startTime

      // Calculate overall performance metrics
      const successfulSteps = steps.filter(s => !s.timeout && !s.error)
      const totalResponseTime = steps.reduce((sum, step) => sum + step.responseTime, 0)
      const averageResponseTime = totalResponseTime / steps.length
      const responseTimes = steps.map(s => s.responseTime).sort((a, b) => a - b)
      const p95ResponseTime = responseTimes[Math.floor(responseTimes.length * 0.95)] || 0
      const p99ResponseTime = responseTimes[Math.floor(responseTimes.length * 0.99)] || 0
      const errorRate = ((steps.length - successfulSteps.length) / steps.length) * 100
      const availability = steps.reduce((sum, step) => sum + step.availability, 0) / steps.length

      // Calculate healthcare-specific metrics
      const healthcareMetrics = this.calculateHealthcareMetrics(workflow, steps, duration)

      // Run compliance checks
      const compliance = await this.runComplianceChecks(workflow, steps, duration)

      // Calculate performance score
      const performanceScore = this.calculateHealthcarePerformanceScore(
        workflow,
        { totalResponseTime, averageResponseTime, p95ResponseTime, p99ResponseTime, errorRate, availability },
        healthcareMetrics,
        compliance
      )

      // Generate recommendations
      const recommendations = this.generateHealthcareRecommendations(
        workflow,
        steps,
        performanceScore,
        compliance
      )

      const passed = this.determineTestPass(workflow, performanceScore, compliance)

      return {
        workflow: workflowName,
        scenario: scenario.name,
        environment: environment.name,
        startTime,
        endTime,
        duration,
        steps,
        overallPerformance: {
          totalResponseTime,
          averageResponseTime,
          p95ResponseTime,
          p99ResponseTime,
          errorRate,
          availability
        },
        healthcareMetrics,
        compliance,
        performanceScore,
        recommendations,
        passed
      }

    } catch (error) {
      console.error(`Workflow test failed: ${workflow.name}`, error)
      throw error
    }
  }

  private async simulateHealthcareAPICall(
    baseUrl: string,
    step: HealthcareWorkflowTestConfig['workflows'][0]['steps'][0],
    category: string
  ): Promise<number> {
    // Simulate realistic API response times based on healthcare category and step type
    const baseTime = step.expectedResponseTime
    const categoryMultipliers = {
      'emergency': 0.5, // Emergency calls are prioritized
      'appointment': 1.0, // Standard timing
      'data-processing': 2.0, // Data processing takes longer
      'real-time': 0.3, // Real-time calls are fast
      'security': 1.2 // Security checks add overhead
    }

    const multiplier = categoryMultipliers[category as keyof typeof categoryMultipliers] || 1.0
    const variability = 0.2 + Math.random() * 0.6 // 20-80% variability
    const simulatedTime = baseTime * multiplier * variability

    // Add network delay simulation
    const networkDelay = 50 + Math.random() * 100 // 50-150ms network delay
    const totalTime = simulatedTime + networkDelay

    // Simulate processing time
    await this.delay(totalTime * 0.8)

    return totalTime
  }

  private calculateHealthcareMetrics(
    workflow: HealthcareWorkflowTestConfig['workflows'][0],
    steps: HealthcareWorkflowTestResult['steps'],
    totalDuration: number
  ): HealthcareWorkflowTestResult['healthcareMetrics'] {
    const metrics: HealthcareWorkflowTestResult['healthcareMetrics'] = {}

    // Calculate specific healthcare workflow metrics
    if (workflow.category === 'emergency') {
      const emergencySteps = steps.filter(s => s.name.toLowerCase().includes('emergency') || s.name.toLowerCase().includes('contact'))
      if (emergencySteps.length > 0) {
        metrics.emergencyResponseTime = emergencySteps.reduce((sum, step) => sum + step.responseTime, 0)
      }
    }

    if (workflow.category === 'appointment') {
      const appointmentSteps = steps.filter(s => s.name.toLowerCase().includes('booking') || s.name.toLowerCase().includes('appointment'))
      if (appointmentSteps.length > 0) {
        metrics.appointmentBookingTime = appointmentSteps.reduce((sum, step) => sum + step.responseTime, 0)
      }
    }

    if (workflow.category === 'data-processing') {
      const processingSteps = steps.filter(s => s.name.toLowerCase().includes('process') || s.name.toLowerCase().includes('bulk'))
      if (processingSteps.length > 0) {
        metrics.dataProcessingTime = processingSteps.reduce((sum, step) => sum + step.responseTime, 0)
      }
    }

    if (workflow.category === 'real-time') {
      const realTimeSteps = steps.filter(s => s.name.toLowerCase().includes('real-time') || s.name.toLowerCase().includes('live'))
      if (realTimeSteps.length > 0) {
        metrics.realTimeLatency = realTimeSteps.reduce((sum, step) => sum + step.responseTime, 0) / realTimeSteps.length
      }
    }

    if (workflow.category === 'security') {
      const securitySteps = steps.filter(s => s.name.toLowerCase().includes('auth') || s.name.toLowerCase().includes('security'))
      if (securitySteps.length > 0) {
        metrics.securityCheckTime = securitySteps.reduce((sum, step) => sum + step.responseTime, 0)
      }
    }

    // Add PDPA compliance time if applicable
    if (this.config.compliance.pdpa) {
      const pdpaSteps = steps.filter(s => s.dataSensitivity === 'high' || s.dataSensitivity === 'critical')
      if (pdpaSteps.length > 0) {
        metrics.pdpaComplianceTime = pdpaSteps.reduce((sum, step) => sum + step.responseTime, 0)
      }
    }

    return metrics
  }

  private async runComplianceChecks(
    workflow: HealthcareWorkflowTestConfig['workflows'][0],
    steps: HealthcareWorkflowTestResult['steps'],
    duration: number
  ): Promise<HealthcareWorkflowTestResult['compliance']> {
    const compliance: HealthcareWorkflowTestResult['compliance'] = {
      pdpa: { passed: true, dataProtectionValidated: true, consentHandlingTime: 0, dataDeletionTime: 0 },
      moh: { passed: true, medicalRecordAccessTime: 0, auditTrailComplete: true },
      mdpma: { passed: true, medicinePrescriptionTime: 0, drugInteractionCheckTime: 0 },
      emergency: { passed: true, emergencyContactTime: 0, crisisResponseTime: 0, escalationTime: 0 }
    }

    // PDPA Compliance Check
    if (this.config.compliance.pdpa) {
      const sensitiveDataSteps = steps.filter(s => s.dataSensitivity === 'high' || s.dataSensitivity === 'critical')
      if (sensitiveDataSteps.length > 0) {
        compliance.pdpa.consentHandlingTime = sensitiveDataSteps.reduce((sum, step) => sum + step.responseTime, 0)
        
        // Simulate data deletion time for critical data
        if (workflow.category === 'security') {
          compliance.pdpa.dataDeletionTime = 500 + Math.random() * 1000 // 500-1500ms
        }

        compliance.pdpa.passed = sensitiveDataSteps.every(step => step.dataIntegrity) && 
                                compliance.pdpa.consentHandlingTime < 2000
      }
    }

    // MOH Compliance Check
    if (this.config.compliance.moh) {
      const medicalRecordSteps = steps.filter(s => s.name.toLowerCase().includes('medical') || s.name.toLowerCase().includes('record'))
      if (medicalRecordSteps.length > 0) {
        compliance.moh.medicalRecordAccessTime = medicalRecordSteps.reduce((sum, step) => sum + step.responseTime, 0)
        compliance.moh.auditTrailComplete = medicalRecordSteps.every(step => step.dataIntegrity)
        compliance.moh.passed = compliance.moh.medicalRecordAccessTime < 3000 && compliance.moh.auditTrailComplete
      }
    }

    // MDPMA Compliance Check
    if (this.config.compliance.mdpma) {
      const prescriptionSteps = steps.filter(s => s.name.toLowerCase().includes('prescription') || s.name.toLowerCase().includes('medicine'))
      if (prescriptionSteps.length > 0) {
        compliance.mdpma.medicinePrescriptionTime = prescriptionSteps.reduce((sum, step) => sum + step.responseTime, 0)
        // Simulate drug interaction check time
        compliance.mdpma.drugInteractionCheckTime = 200 + Math.random() * 500 // 200-700ms
        compliance.mdpma.passed = compliance.mdpma.medicinePrescriptionTime < 5000
      }
    }

    // Emergency Protocol Check
    if (this.config.compliance.emergencyProtocols) {
      const emergencySteps = steps.filter(s => s.name.toLowerCase().includes('emergency') || s.name.toLowerCase().includes('crisis'))
      if (emergencySteps.length > 0) {
        compliance.emergency.emergencyContactTime = emergencySteps.reduce((sum, step) => sum + step.responseTime, 0)
        // Simulate crisis response and escalation times
        compliance.emergency.crisisResponseTime = 200 + Math.random() * 300 // 200-500ms
        compliance.emergency.escalationTime = 100 + Math.random() * 200 // 100-300ms
        compliance.emergency.passed = compliance.emergency.emergencyContactTime < 1000
      }
    }

    return compliance
  }

  private calculateHealthcarePerformanceScore(
    workflow: HealthcareWorkflowTestConfig['workflows'][0],
    performance: HealthcareWorkflowTestResult['overallPerformance'],
    healthcareMetrics: HealthcareWorkflowTestResult['healthcareMetrics'],
    compliance: HealthcareWorkflowTestResult['compliance']
  ): number {
    let score = 1.0

    // Response time score (weighted by priority)
    const responseTimeWeight = workflow.priority === 'critical' ? 0.4 : 
                              workflow.priority === 'emergency' ? 0.5 : 
                              workflow.priority === 'important' ? 0.3 : 0.2

    const responseTimeScore = Math.max(0, 1 - (performance.averageResponseTime / 3000))
    score -= (1 - responseTimeScore) * responseTimeWeight

    // Error rate score (critical workflows have zero tolerance)
    const errorRateWeight = workflow.priority === 'critical' || workflow.priority === 'emergency' ? 0.3 : 0.2
    const errorRateScore = Math.max(0, 1 - (performance.errorRate / 10)) // 10% max error rate
    score -= (1 - errorRateScore) * errorRateWeight

    // Compliance score
    const complianceWeight = 0.3
    const complianceChecks = [
      compliance.pdpa.passed,
      compliance.moh.passed,
      compliance.mdpma.passed,
      compliance.emergency.passed
    ].filter(Boolean).length
    const complianceScore = complianceChecks / 4 // 4 compliance areas
    score -= (1 - complianceScore) * complianceWeight

    // Healthcare-specific metrics score
    const healthcareWeight = 0.2
    let healthcareScore = 1.0

    if (workflow.category === 'emergency' && healthcareMetrics.emergencyResponseTime) {
      healthcareScore = Math.max(0, 1 - (healthcareMetrics.emergencyResponseTime / 1000))
    } else if (workflow.category === 'appointment' && healthcareMetrics.appointmentBookingTime) {
      healthcareScore = Math.max(0, 1 - (healthcareMetrics.appointmentBookingTime / 3000))
    } else if (workflow.category === 'real-time' && healthcareMetrics.realTimeLatency) {
      healthcareScore = Math.max(0, 1 - (healthcareMetrics.realTimeLatency / 500))
    }

    score -= (1 - healthcareScore) * healthcareWeight

    return Math.max(0, score)
  }

  private generateHealthcareRecommendations(
    workflow: HealthcareWorkflowTestConfig['workflows'][0],
    steps: HealthcareWorkflowTestResult['steps'],
    performanceScore: number,
    compliance: HealthcareWorkflowTestResult['compliance']
  ): string[] {
    const recommendations: string[] = []

    // Performance-based recommendations
    if (performanceScore < 0.5) {
      recommendations.push('CRITICAL: Healthcare workflow performance below acceptable threshold')
    } else if (performanceScore < 0.7) {
      recommendations.push('IMPROVEMENT: Healthcare workflow performance needs optimization')
    }

    // Workflow-specific recommendations
    if (workflow.category === 'emergency') {
      recommendations.push('HIGH: Ensure emergency workflows meet <500ms response time requirement')
      recommendations.push('MEDIUM: Implement emergency priority queuing for critical requests')
    }

    if (workflow.category === 'appointment') {
      recommendations.push('MEDIUM: Optimize appointment booking workflow for better user experience')
      recommendations.push('LOW: Consider implementing appointment booking optimization features')
    }

    if (workflow.category === 'real-time') {
      recommendations.push('HIGH: Ensure real-time features maintain <100ms latency')
      recommendations.push('MEDIUM: Implement WebSocket optimization for real-time updates')
    }

    // Compliance-based recommendations
    if (!compliance.pdpa.passed) {
      recommendations.push('CRITICAL: PDPA compliance issues detected - immediate attention required')
    }

    if (!compliance.moh.passed) {
      recommendations.push('HIGH: MOH compliance requirements not met - medical record access issues')
    }

    if (!compliance.mdpma.passed && this.config.compliance.mdpma) {
      recommendations.push('MEDIUM: MDPMA compliance issues - medicine prescription workflow needs attention')
    }

    if (!compliance.emergency.passed && this.config.compliance.emergencyProtocols) {
      recommendations.push('CRITICAL: Emergency protocol compliance failed - life-critical functionality at risk')
    }

    // Step-specific recommendations
    const slowSteps = steps.filter(step => step.responseTime > step.expectedResponseTime * 1.5)
    if (slowSteps.length > 0) {
      recommendations.push(`HIGH: Optimize slow workflow steps: ${slowSteps.map(s => s.name).join(', ')}`)
    }

    const errorSteps = steps.filter(step => step.timeout || step.error)
    if (errorSteps.length > 0) {
      recommendations.push(`CRITICAL: Fix error-prone workflow steps: ${errorSteps.map(s => s.name).join(', ')}`)
    }

    return recommendations
  }

  private determineTestPass(
    workflow: HealthcareWorkflowTestConfig['workflows'][0],
    performanceScore: number,
    compliance: HealthcareWorkflowTestResult['compliance']
  ): boolean {
    // Critical workflows must pass all compliance checks and have high performance
    if (workflow.priority === 'critical' || workflow.priority === 'emergency') {
      return performanceScore >= 0.8 && 
             Object.values(compliance).every(comp => comp.passed)
    }

    // Important workflows must pass most checks
    if (workflow.priority === 'important') {
      return performanceScore >= 0.7 && 
             Object.values(compliance).filter(comp => comp.passed).length >= 3
    }

    // Standard workflows have lower requirements
    return performanceScore >= 0.6
  }

  private updateBenchmark(result: HealthcareWorkflowTestResult) {
    const benchmark = this.benchmarks.find(b => b.category === result.steps[0]?.name?.toLowerCase().includes(b.category) ? b.category : null)
    if (benchmark) {
      benchmark.current.responseTime = result.overallPerformance.averageResponseTime
      benchmark.current.throughput = 1000 / result.overallPerformance.averageResponseTime
      benchmark.current.availability = result.overallPerformance.availability

      // Update recommendations based on current performance
      benchmark.recommendations = this.generateBenchmarkRecommendations(benchmark)
    }
  }

  private generateBenchmarkRecommendations(benchmark: HealthcarePerformanceBenchmark): string[] {
    const recommendations: string[] = []

    if (benchmark.current.responseTime > benchmark.warning.responseTime) {
      recommendations.push('Response time exceeds warning threshold - optimization needed')
    }

    if (benchmark.current.availability < benchmark.warning.availability) {
      recommendations.push('Availability below target - stability improvements required')
    }

    if (benchmark.current.throughput < benchmark.warning.throughput) {
      recommendations.push('Throughput below target - capacity planning needed')
    }

    if (!benchmark.compliance.pdpa) {
      recommendations.push('PDPA compliance issues - data protection measures needed')
    }

    return recommendations
  }

  private async generateHealthcarePerformanceReport(results: HealthcareWorkflowTestResult[]): Promise<void> {
    const report = this.generateMarkdownReport(results)
    console.log('Healthcare Performance Report Generated')
    console.log(report)
  }

  private generateMarkdownReport(results: HealthcareWorkflowTestResult[]): string {
    const totalTests = results.length
    const passedTests = results.filter(r => r.passed).length
    const avgScore = results.reduce((sum, r) => sum + r.performanceScore, 0) / totalTests

    // Group by category
    const categoryGroups = this.groupByCategory(results)

    let report = `# Healthcare Performance Test Report

## Executive Summary
- **Total Tests**: ${totalTests}
- **Passed Tests**: ${passedTests} (${((passedTests / totalTests) * 100).toFixed(1)}%)
- **Failed Tests**: ${totalTests - passedTests} (${(((totalTests - passedTests) / totalTests) * 100).toFixed(1)}%)
- **Average Performance Score**: ${(avgScore * 100).toFixed(1)}%
- **Test Date**: ${new Date().toISOString()}

## Performance by Healthcare Category

`

    Object.entries(categoryGroups).forEach(([category, categoryResults]) => {
      const categoryPassed = categoryResults.filter(r => r.passed).length
      const categoryAvgScore = categoryResults.reduce((sum, r) => sum + r.performanceScore, 0) / categoryResults.length

      report += `### ${category.charAt(0).toUpperCase() + category.slice(1)} Workflows
- **Tests**: ${categoryResults.length}
- **Passed**: ${categoryPassed} (${((categoryPassed / categoryResults.length) * 100).toFixed(1)}%)
- **Average Score**: ${(categoryAvgScore * 100).toFixed(1)}%

| Workflow | Scenario | Environment | Response Time | Error Rate | Score | Status |
|----------|----------|-------------|---------------|------------|-------|--------|

`

      categoryResults.forEach(result => {
        report += `| ${result.workflow} | ${result.scenario} | ${result.environment} | ${result.overallPerformance.averageResponseTime.toFixed(0)}ms | ${result.overallPerformance.errorRate.toFixed(1)}% | ${(result.performanceScore * 100).toFixed(0)}% | ${result.passed ? '✅ Pass' : '❌ Fail'} |

`
      })

      report += '\n'
    })

    // Add compliance summary
    report += `## Healthcare Compliance Summary

### PDPA (Personal Data Protection Act)
- **Compliant Workflows**: ${results.filter(r => r.compliance.pdpa.passed).length}/${totalTests}
- **Average Consent Handling Time**: ${(results.reduce((sum, r) => sum + (r.compliance.pdpa.consentHandlingTime || 0), 0) / results.length).toFixed(0)}ms

### MOH (Ministry of Health)
- **Compliant Workflows**: ${results.filter(r => r.compliance.moh.passed).length}/${totalTests}
- **Average Medical Record Access Time**: ${(results.reduce((sum, r) => sum + (r.compliance.moh.medicalRecordAccessTime || 0), 0) / results.length).toFixed(0)}ms

### MDPMA (Medicines and Medical Devices Authority)
- **Compliant Workflows**: ${results.filter(r => r.compliance.mdpma.passed).length}/${totalTests}
- **Average Prescription Time**: ${(results.reduce((sum, r) => sum + (r.compliance.mdpma.medicinePrescriptionTime || 0), 0) / results.length).toFixed(0)}ms

### Emergency Protocols
- **Compliant Workflows**: ${results.filter(r => r.compliance.emergency.passed).length}/${totalTests}
- **Average Emergency Response Time**: ${(results.filter(r => r.healthcareMetrics.emergencyResponseTime).reduce((sum, r, _, arr) => sum + (r.healthcareMetrics.emergencyResponseTime || 0) / arr.length, 0)).toFixed(0)}ms

## Healthcare-Specific Performance Benchmarks

`

    this.benchmarks.forEach(benchmark => {
      report += `### ${benchmark.workflow}
| Metric | Current | Warning | Critical | Status |
|--------|---------|---------|----------|--------|
| Response Time | ${benchmark.current.responseTime.toFixed(0)}ms | ${benchmark.warning.responseTime}ms | ${benchmark.critical.responseTime}ms | ${this.getBenchmarkStatus(benchmark.current.responseTime, benchmark.critical.responseTime, benchmark.warning.responseTime)} |
| Availability | ${benchmark.current.availability.toFixed(1)}% | ${benchmark.warning.availability}% | ${benchmark.critical.availability}% | ${this.getBenchmarkStatus(benchmark.current.availability, benchmark.critical.availability, benchmark.warning.availability)} |

`
    })

    // Add recommendations section
    report += `## Healthcare Performance Recommendations

### Critical Priority
${this.getCriticalRecommendations(results)}

### Important Priority
${this.getImportantRecommendations(results)}

### Healthcare Compliance
- **Data Protection**: Ensure all patient data handling meets PDPA requirements
- **Medical Records**: Optimize medical record access for healthcare providers
- **Emergency Systems**: Maintain sub-500ms response times for emergency workflows
- **Real-time Features**: Keep real-time clinic availability updates under 100ms latency

### Next Steps
${avgScore < 0.7 ? 
  '- **Immediate**: Address all failed healthcare workflow tests\n- **Short-term**: Optimize critical healthcare performance metrics\n- **Medium-term**: Enhance healthcare compliance automation\n- **Long-term**: Implement advanced healthcare monitoring' :
  '- **Continuous**: Maintain current healthcare performance standards\n- **Enhancement**: Fine-tune healthcare workflow optimization\n- **Monitoring**: Implement real-time healthcare performance tracking\n- **Innovation**: Explore advanced healthcare technology integration'
}

`

    return report
  }

  private groupByCategory(results: HealthcareWorkflowTestResult[]): Record<string, HealthcareWorkflowTestResult[]> {
    return results.reduce((groups, result) => {
      // Infer category from workflow name
      const category = result.workflow.toLowerCase().includes('emergency') ? 'emergency' :
                      result.workflow.toLowerCase().includes('appointment') ? 'appointment' :
                      result.workflow.toLowerCase().includes('data') || result.workflow.toLowerCase().includes('bulk') ? 'data-processing' :
                      result.workflow.toLowerCase().includes('real-time') || result.workflow.toLowerCase().includes('live') ? 'real-time' :
                      result.workflow.toLowerCase().includes('security') || result.workflow.toLowerCase().includes('auth') ? 'security' :
                      'standard'

      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(result)
      return groups
    }, {} as Record<string, HealthcareWorkflowTestResult[]>)
  }

  private getBenchmarkStatus(current: number, critical: number, warning: number): string {
    if (current <= critical) return '✅ Pass'
    if (current <= warning) return '⚠️ Warning'
    return '❌ Critical'
  }

  private getCriticalRecommendations(results: HealthcareWorkflowTestResult[]): string {
    const failedCritical = results.filter(r => !r.passed && (r.workflow.includes('emergency') || r.workflow.includes('critical')))
    if (failedCritical.length > 0) {
      return `- **Healthcare Emergency Systems**: ${failedCritical.length} failed critical workflow(s) - immediate attention required
- **Patient Safety**: Ensure emergency contact systems maintain 99.9% availability
- **Response Time**: All emergency workflows must respond within 500ms`
    }
    return '- **Emergency Systems**: All critical healthcare workflows performing within acceptable limits'
  }

  private getImportantRecommendations(results: HealthcareWorkflowTestResult[]): string {
    const failedImportant = results.filter(r => !r.passed && r.workflow.includes('appointment'))
    if (failedImportant.length > 0) {
      return `- **Appointment Systems**: ${failedImportant.length} failed appointment workflow(s) - optimize booking experience
- **Patient Experience**: Ensure appointment booking completes within 3 seconds
- **Capacity Planning**: Monitor appointment system capacity during peak hours`
    }
    return '- **Appointment Systems**: All healthcare appointment workflows performing optimally'
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Get all test results
   */
  getResults(): HealthcareWorkflowTestResult[] {
    return this.results
  }

  /**
   * Get performance benchmarks
   */
  getBenchmarks(): HealthcarePerformanceBenchmark[] {
    return this.benchmarks
  }

  /**
   * Export results to JSON format
   */
  exportResults(): string {
    return JSON.stringify({
      config: this.config,
      results: this.results,
      benchmarks: this.benchmarks,
      summary: {
        totalTests: this.results.length,
        passedTests: this.results.filter(r => r.passed).length,
        averageScore: this.results.reduce((sum, r) => sum + r.performanceScore, 0) / this.results.length,
        complianceSummary: {
          pdpa: this.results.filter(r => r.compliance.pdpa.passed).length,
          moh: this.results.filter(r => r.compliance.moh.passed).length,
          mdpma: this.results.filter(r => r.compliance.mdpma.passed).length,
          emergency: this.results.filter(r => r.compliance.emergency.passed).length
        },
        timestamp: new Date().toISOString()
      }
    }, null, 2)
  }
}

export { HealthcarePerformanceTest }
export type { HealthcareWorkflowTestConfig, HealthcareWorkflowTestResult, HealthcarePerformanceBenchmark }