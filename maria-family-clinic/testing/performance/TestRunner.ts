#!/usr/bin/env tsx

/**
 * Main Performance Testing Runner
 * Sub-Phase 11.5: Performance & Load Testing
 * Comprehensive healthcare performance testing execution
 */

import { ComprehensiveHealthcarePerformanceTest } from './ComprehensiveHealthcarePerformanceTest'
import { PerformanceTestService } from '../services/PerformanceTestService'

interface TestRunnerConfig {
  testSuites: string[]
  environments: string[]
  generateReports: boolean
  parallelExecution: boolean
  outputFormat: 'json' | 'html' | 'markdown'
  alertOnFailure: boolean
  continuous: boolean
  interval?: number
}

interface TestExecutionResult {
  suite: string
  environment: string
  status: 'passed' | 'failed' | 'warning'
  score: number
  duration: number
  criticalIssues: string[]
  timestamp: number
}

class HealthcarePerformanceTestRunner {
  private config: TestRunnerConfig
  private service: PerformanceTestService
  private results: TestExecutionResult[] = []
  private isRunning: boolean = false

  constructor(config: TestRunnerConfig) {
    this.config = config
    this.service = new PerformanceTestService()
    this.validateConfiguration()
  }

  private validateConfiguration() {
    if (!this.config.testSuites || this.config.testSuites.length === 0) {
      throw new Error('At least one test suite must be specified')
    }
    if (!this.config.environments || this.config.environments.length === 0) {
      throw new Error('At least one environment must be specified')
    }
    if (this.config.continuous && (!this.config.interval || this.config.interval < 60)) {
      throw new Error('Continuous mode requires interval >= 60 seconds')
    }
  }

  /**
   * Run comprehensive performance tests
   */
  async runTests(): Promise<TestExecutionResult[]> {
    console.log('🚀 Starting Healthcare Performance Test Runner')
    console.log(`📋 Test Suites: ${this.config.testSuites.join(', ')}`)
    console.log(`🌍 Environments: ${this.config.environments.join(', ')}`)
    console.log(`⚡ Parallel Execution: ${this.config.parallelExecution}`)
    console.log(`📊 Generate Reports: ${this.config.generateReports}`)
    console.log(`🚨 Alert on Failure: ${this.config.alertOnFailure}`)
    console.log('')

    this.isRunning = true
    const startTime = Date.now()

    try {
      if (this.config.continuous) {
        return await this.runContinuousTests()
      } else {
        return await this.runSingleTestExecution()
      }
    } finally {
      this.isRunning = false
      const totalDuration = Date.now() - startTime
      console.log(`\n⏱️ Total execution time: ${(totalDuration / 1000 / 60).toFixed(2)} minutes`)
    }
  }

  private async runSingleTestExecution(): Promise<TestExecutionResult[]> {
    const results: TestExecutionResult[] = []

    if (this.config.parallelExecution) {
      // Execute test suites in parallel
      const testPromises = this.config.testSuites.map(suite => 
        this.executeTestSuite(suite)
      )
      const suiteResults = await Promise.all(testPromises)
      
      for (const suiteResult of suiteResults) {
        results.push(...suiteResult)
      }
    } else {
      // Execute test suites sequentially
      for (const suite of this.config.testSuites) {
        const suiteResults = await this.executeTestSuite(suite)
        results.push(...suiteResults)
      }
    }

    this.results = results
    await this.generateFinalReport()

    if (this.config.alertOnFailure) {
      await this.checkAndSendAlerts()
    }

    return results
  }

  private async runContinuousTests(): Promise<TestExecutionResult[]> {
    console.log('🔄 Starting continuous performance monitoring...')
    
    const results: TestExecutionResult[] = []
    let iteration = 1

    while (this.isRunning) {
      console.log(`\n📊 Iteration ${iteration} - ${new Date().toISOString()}`)
      
      try {
        const iterationResults = await this.runSingleTestExecution()
        results.push(...iterationResults)
        
        // Check for critical issues
        const criticalIssues = iterationResults.filter(r => r.status === 'failed' && r.score < 0.5)
        if (criticalIssues.length > 0) {
          console.log('⚠️ Critical performance issues detected:', criticalIssues.length)
          if (this.config.alertOnFailure) {
            await this.sendCriticalAlert(criticalIssues)
          }
        }

        iteration++
        
        if (this.isRunning) {
          console.log(`⏳ Waiting ${this.config.interval} seconds before next iteration...`)
          await this.delay(this.config.interval! * 1000)
        }
        
      } catch (error) {
        console.error('❌ Continuous test execution error:', error)
        await this.sendExecutionErrorAlert(error as Error)
        
        // Continue running even if one iteration fails
        await this.delay(this.config.interval! * 1000)
        iteration++
      }
    }

    console.log('🛑 Continuous performance monitoring stopped')
    this.results = results
    return results
  }

  private async executeTestSuite(suite: string): Promise<TestExecutionResult[]> {
    console.log(`\n🧪 Executing test suite: ${suite}`)
    const suiteStartTime = Date.now()
    
    try {
      // Configure comprehensive test based on suite type
      const testConfig = await this.createTestConfiguration(suite)
      const tester = new ComprehensiveHealthcarePerformanceTest(testConfig)
      
      const results = await tester.runComprehensiveTests()
      
      // Convert results to execution format
      const executionResults = this.config.environments.map(env => {
        const envResults = results.filter(r => r.environment === env)
        const avgScore = envResults.length > 0 ? 
          envResults.reduce((sum, r) => sum + r.summary.overallScore, 0) / envResults.length : 0
        const hasCriticalIssues = envResults.some(r => !r.passed && r.summary.overallScore < 0.5)
        const status = hasCriticalIssues ? 'failed' : 
                      envResults.some(r => !r.passed) ? 'warning' : 'passed'

        return {
          suite,
          environment: env,
          status,
          score: avgScore,
          duration: Date.now() - suiteStartTime,
          criticalIssues: envResults
            .filter(r => !r.passed)
            .map(r => `${r.scenario}: ${r.recommendations.slice(0, 2).join('; ')}`)
            .slice(0, 5),
          timestamp: Date.now()
        }
      })

      console.log(`✅ Suite ${suite} completed`)
      return executionResults

    } catch (error) {
      console.error(`❌ Suite ${suite} failed:`, error)
      
      // Return failed execution results
      return this.config.environments.map(env => ({
        suite,
        environment: env,
        status: 'failed' as const,
        score: 0,
        duration: Date.now() - suiteStartTime,
        criticalIssues: [`Test suite execution failed: ${(error as Error).message}`],
        timestamp: Date.now()
      }))
    }
  }

  private async createTestConfiguration(suite: string) {
    const baseUrl = this.getEnvironmentUrl('staging') // Default to staging
    
    // Configure based on suite type
    switch (suite.toLowerCase()) {
      case 'emergency':
        return {
          baseUrl,
          testSuites: [
            {
              name: 'Emergency Performance Suite',
              description: 'Critical emergency healthcare system performance testing',
              priority: 'critical' as const,
              scenarios: this.getEmergencyScenarios(),
              targetUsers: 1000,
              duration: '30m',
              compliance: {
                pdpa: true,
                moh: true,
                mdpma: false,
                emergency: true
              }
            }
          ],
          environments: {
            development: { url: this.getEnvironmentUrl('development'), users: 50 },
            staging: { url: this.getEnvironmentUrl('staging'), users: 500 },
            production: { url: this.getEnvironmentUrl('production'), users: 1000 }
          },
          reporting: {
            generateHtmlReport: this.config.generateReports,
            generateJsonExport: this.config.generateReports,
            includeScreenshots: false,
            includeVideos: false,
            alertOnFailures: this.config.alertOnFailure
          }
        }

      case 'appointment':
        return {
          baseUrl,
          testSuites: [
            {
              name: 'Appointment Booking Performance',
              description: 'Healthcare appointment booking system performance testing',
              priority: 'important' as const,
              scenarios: this.getAppointmentScenarios(),
              targetUsers: 500,
              duration: '20m',
              compliance: {
                pdpa: true,
                moh: true,
                mdpma: false,
                emergency: false
              }
            }
          ],
          environments: {
            development: { url: this.getEnvironmentUrl('development'), users: 25 },
            staging: { url: this.getEnvironmentUrl('staging'), users: 300 },
            production: { url: this.getEnvironmentUrl('production'), users: 500 }
          },
          reporting: {
            generateHtmlReport: this.config.generateReports,
            generateJsonExport: this.config.generateReports,
            includeScreenshots: true,
            includeVideos: false,
            alertOnFailures: this.config.alertOnFailure
          }
        }

      case 'enrollment':
        return {
          baseUrl,
          testSuites: [
            {
              name: 'Healthier SG Enrollment Performance',
              description: 'Government health program enrollment system performance',
              priority: 'important' as const,
              scenarios: this.getEnrollmentScenarios(),
              targetUsers: 300,
              duration: '25m',
              compliance: {
                pdpa: true,
                moh: true,
                mdpma: true,
                emergency: false
              }
            }
          ],
          environments: {
            development: { url: this.getEnvironmentUrl('development'), users: 30 },
            staging: { url: this.getEnvironmentUrl('staging'), users: 200 },
            production: { url: this.getEnvironmentUrl('production'), users: 300 }
          },
          reporting: {
            generateHtmlReport: this.config.generateReports,
            generateJsonExport: this.config.generateReports,
            includeScreenshots: true,
            includeVideos: true,
            alertOnFailures: this.config.alertOnFailure
          }
        }

      case 'scalability':
        return {
          baseUrl,
          testSuites: [
            {
              name: 'Scalability Testing Suite',
              description: 'Large-scale healthcare platform scalability testing',
              priority: 'standard' as const,
              scenarios: this.getScalabilityScenarios(),
              targetUsers: 5000,
              duration: '60m',
              compliance: {
                pdpa: true,
                moh: true,
                mdpma: true,
                emergency: true
              }
            }
          ],
          environments: {
            staging: { url: this.getEnvironmentUrl('staging'), users: 2000 },
            production: { url: this.getEnvironmentUrl('production'), users: 5000 }
          },
          reporting: {
            generateHtmlReport: this.config.generateReports,
            generateJsonExport: this.config.generateReports,
            includeScreenshots: false,
            includeVideos: false,
            alertOnFailures: this.config.alertOnFailure
          }
        }

      case 'comprehensive':
      default:
        return {
          baseUrl,
          testSuites: [
            {
              name: 'Comprehensive Performance Suite',
              description: 'Complete healthcare platform performance validation',
              priority: 'critical' as const,
              scenarios: this.getAllScenarios(),
              targetUsers: 1000,
              duration: '90m',
              compliance: {
                pdpa: true,
                moh: true,
                mdpma: true,
                emergency: true
              }
            }
          ],
          environments: {
            development: { url: this.getEnvironmentUrl('development'), users: 50 },
            staging: { url: this.getEnvironmentUrl('staging'), users: 500 },
            production: { url: this.getEnvironmentUrl('production'), users: 1000 }
          },
          reporting: {
            generateHtmlReport: this.config.generateReports,
            generateJsonExport: this.config.generateReports,
            includeScreenshots: true,
            includeVideos: true,
            alertOnFailures: this.config.alertOnFailure
          }
        }
    }
  }

  private getEnvironmentUrl(environment: string): string {
    const urls: Record<string, string> = {
      development: process.env.DEV_URL || 'http://localhost:3000',
      staging: process.env.STAGING_URL || 'https://staging.myfamilyclinic.com',
      production: process.env.PRODUCTION_URL || 'https://myfamilyclinic.com'
    }
    return urls[environment] || urls.staging
  }

  private getEmergencyScenarios() {
    return [
      {
        id: 'emergency-clinic-search',
        name: 'Emergency Clinic Search',
        description: 'Critical emergency healthcare facility search during crisis',
        category: 'emergency' as const,
        criticalMetrics: {
          responseTime: 500,
          throughput: 100,
          availability: 99.9,
          errorRate: 0.1
        },
        userJourney: {
          steps: [
            {
              action: 'Emergency search initiation',
              endpoint: '/api/emergency/search',
              method: 'POST' as const,
              expectedTime: 200,
              critical: true
            },
            {
              action: 'Real-time clinic availability',
              endpoint: '/api/emergency/availability',
              method: 'GET' as const,
              expectedTime: 100,
              critical: true
            },
            {
              action: 'Emergency contact dispatch',
              endpoint: '/api/emergency/dispatch',
              method: 'POST' as const,
              expectedTime: 300,
              critical: true
            }
          ]
        },
        loadProfile: {
          pattern: 'spike' as const,
          initialUsers: 100,
          peakUsers: 500,
          duration: '15m',
          spikeMultiplier: 3
        },
        successCriteria: [
          { metric: 'responseTime', threshold: 500, unit: 'ms', critical: true },
          { metric: 'availability', threshold: 99.9, unit: 'percentage', critical: true },
          { metric: 'errorRate', threshold: 0.1, unit: 'percentage', critical: true }
        ]
      }
    ]
  }

  private getAppointmentScenarios() {
    return [
      {
        id: 'flu-season-appointments',
        name: 'Flu Season Appointment Booking',
        description: 'Doctor appointment booking during flu season peak',
        category: 'appointment' as const,
        criticalMetrics: {
          responseTime: 1000,
          throughput: 200,
          availability: 99.5,
          errorRate: 0.5
        },
        userJourney: {
          steps: [
            {
              action: 'Navigate to appointment booking',
              endpoint: '/appointments/flu-vaccination',
              method: 'GET' as const,
              expectedTime: 1200,
              critical: false
            },
            {
              action: 'Check doctor availability',
              endpoint: '/api/doctors/available',
              method: 'GET' as const,
              expectedTime: 800,
              critical: true
            },
            {
              action: 'Book appointment slot',
              endpoint: '/api/appointments/book',
              method: 'POST' as const,
              expectedTime: 1500,
              critical: true
            }
          ]
        },
        loadProfile: {
          pattern: 'wave' as const,
          initialUsers: 50,
          peakUsers: 300,
          duration: '20m'
        },
        successCriteria: [
          { metric: 'responseTime', threshold: 2000, unit: 'ms', critical: false },
          { metric: 'availability', threshold: 99.0, unit: 'percentage', critical: true },
          { metric: 'throughput', threshold: 100, unit: 'requests', critical: false }
        ]
      }
    ]
  }

  private getEnrollmentScenarios() {
    return [
      {
        id: 'healthier-sg-enrollment',
        name: 'Healthier SG Program Enrollment',
        description: 'Government health program enrollment processing',
        category: 'enrollment' as const,
        criticalMetrics: {
          responseTime: 2000,
          throughput: 150,
          availability: 99.0,
          errorRate: 1.0
        },
        userJourney: {
          steps: [
            {
              action: 'Access enrollment portal',
              endpoint: '/healthier-sg/portal',
              method: 'GET' as const,
              expectedTime: 1500,
              critical: false
            },
            {
              action: 'Verify eligibility',
              endpoint: '/api/healthier-sg/verify',
              method: 'POST' as const,
              expectedTime: 1000,
              critical: true
            },
            {
              action: 'Submit enrollment',
              endpoint: '/api/healthier-sg/apply',
              method: 'POST' as const,
              expectedTime: 2000,
              critical: true
            }
          ]
        },
        loadProfile: {
          pattern: 'ramp-up' as const,
          initialUsers: 20,
          peakUsers: 200,
          duration: '25m',
          rampUpTime: '5m'
        },
        successCriteria: [
          { metric: 'responseTime', threshold: 3000, unit: 'ms', critical: false },
          { metric: 'successRate', threshold: 95, unit: 'percentage', critical: true },
          { metric: 'dataConsistency', threshold: 99, unit: 'percentage', critical: true }
        ]
      }
    ]
  }

  private getScalabilityScenarios() {
    return [
      {
        id: 'multi-clinic-scale',
        name: 'Multi-Clinic Data Processing',
        description: 'Medical data processing for 10,000+ clinics',
        category: 'data-processing' as const,
        criticalMetrics: {
          responseTime: 3000,
          throughput: 50,
          availability: 99.9,
          errorRate: 0.5
        },
        userJourney: {
          steps: [
            {
              action: 'Initiate bulk clinic update',
              endpoint: '/api/admin/bulk-update',
              method: 'POST' as const,
              expectedTime: 2500,
              critical: false
            },
            {
              action: 'Process clinic data',
              endpoint: '/api/admin/bulk-process',
              method: 'POST' as const,
              expectedTime: 4000,
              critical: true
            }
          ]
        },
        loadProfile: {
          pattern: 'stress' as const,
          initialUsers: 100,
          peakUsers: 5000,
          duration: '60m'
        },
        successCriteria: [
          { metric: 'scalability', threshold: 1000, unit: 'users', critical: true },
          { metric: 'dataIntegrity', threshold: 99.5, unit: 'percentage', critical: true },
          { metric: 'systemStability', threshold: 95, unit: 'percentage', critical: true }
        ]
      }
    ]
  }

  private getAllScenarios() {
    return [
      ...this.getEmergencyScenarios(),
      ...this.getAppointmentScenarios(),
      ...this.getEnrollmentScenarios(),
      ...this.getScalabilityScenarios(),
      {
        id: 'real-time-availability',
        name: 'Real-time Clinic Availability',
        description: 'Live clinic availability updates',
        category: 'real-time' as const,
        criticalMetrics: {
          responseTime: 100,
          throughput: 1000,
          availability: 99.95,
          errorRate: 0.1
        },
        userJourney: {
          steps: [
            {
              action: 'Subscribe to availability updates',
              endpoint: '/api/clinics/availability/stream',
              method: 'GET' as const,
              expectedTime: 50,
              critical: true
            }
          ]
        },
        loadProfile: {
          pattern: 'steady' as const,
          initialUsers: 200,
          peakUsers: 1000,
          duration: '30m'
        },
        successCriteria: [
          { metric: 'latency', threshold: 100, unit: 'ms', critical: true },
          { metric: 'reliability', threshold: 99.9, unit: 'percentage', critical: true }
        ]
      }
    ]
  }

  private async generateFinalReport(): Promise<void> {
    const totalTests = this.results.length
    const passedTests = this.results.filter(r => r.status === 'passed').length
    const failedTests = this.results.filter(r => r.status === 'failed').length
    const warningTests = this.results.filter(r => r.status === 'warning').length
    const avgScore = this.results.reduce((sum, r) => sum + r.score, 0) / totalTests

    console.log('\n📊 FINAL PERFORMANCE TEST SUMMARY')
    console.log('=================================')
    console.log(`Total Tests: ${totalTests}`)
    console.log(`✅ Passed: ${passedTests} (${((passedTests / totalTests) * 100).toFixed(1)}%)`)
    console.log(`⚠️ Warnings: ${warningTests} (${((warningTests / totalTests) * 100).toFixed(1)}%)`)
    console.log(`❌ Failed: ${failedTests} (${((failedTests / totalTests) * 100).toFixed(1)}%)`)
    console.log(`📈 Average Score: ${(avgScore * 100).toFixed(1)}%`)
    console.log(`🎯 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`)

    if (failedTests > 0) {
      console.log('\n🚨 CRITICAL ISSUES:')
      this.results
        .filter(r => r.status === 'failed')
        .forEach(result => {
          console.log(`  ${result.suite}/${result.environment}: ${result.score.toFixed(1)}% - ${result.criticalIssues[0]}`)
        })
    }

    if (warningTests > 0) {
      console.log('\n⚠️ PERFORMANCE WARNINGS:')
      this.results
        .filter(r => r.status === 'warning')
        .slice(0, 5) // Show first 5 warnings
        .forEach(result => {
          console.log(`  ${result.suite}/${result.environment}: ${result.score.toFixed(1)}%`)
        })
    }

    // Export results if requested
    if (this.config.generateReports) {
      await this.exportResults()
    }
  }

  private async exportResults(): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    
    // Export JSON
    if (this.config.outputFormat === 'json') {
      const jsonPath = `testing/performance/results/performance-test-results-${timestamp}.json`
      console.log(`\n💾 Exporting results to ${jsonPath}`)
      // In real implementation, write to file
    }

    // Export summary report
    const reportPath = `testing/performance/results/performance-test-report-${timestamp}.md`
    console.log(`📄 Generating summary report: ${reportPath}`)
    
    const report = this.generateSummaryReport()
    console.log(report)
  }

  private generateSummaryReport(): string {
    const totalTests = this.results.length
    const passedTests = this.results.filter(r => r.status === 'passed').length
    const avgScore = this.results.reduce((sum, r) => sum + r.score, 0) / totalTests

    return `
# Healthcare Performance Test Summary

## Test Execution Details
- **Execution Date**: ${new Date().toISOString()}
- **Test Suites**: ${this.config.testSuites.join(', ')}
- **Environments**: ${this.config.environments.join(', ')}
- **Parallel Execution**: ${this.config.parallelExecution}

## Results Summary
- **Total Tests**: ${totalTests}
- **Passed**: ${passedTests} (${((passedTests / totalTests) * 100).toFixed(1)}%)
- **Average Score**: ${(avgScore * 100).toFixed(1)}%

## Performance Assessment
${avgScore > 0.8 ? '✅ **EXCELLENT**: Platform meets healthcare performance standards' :
  avgScore > 0.6 ? '⚠️ **GOOD**: Platform shows good performance with room for improvement' :
  '❌ **NEEDS IMPROVEMENT**: Platform requires significant performance optimization'}

## Next Steps
${passedTests / totalTests > 0.8 ? 
  '- Proceed with production deployment\n- Implement continuous performance monitoring\n- Schedule regular performance regression tests' :
  '- Address failed performance tests immediately\n- Optimize performance bottlenecks\n- Re-run comprehensive testing before production'
}
    `.trim()
  }

  private async checkAndSendAlerts(): Promise<void> {
    const failedTests = this.results.filter(r => r.status === 'failed')
    const criticalFailures = failedTests.filter(r => r.score < 0.3)

    if (criticalFailures.length > 0) {
      await this.sendCriticalAlert(criticalFailures)
    }

    const warningTests = this.results.filter(r => r.status === 'warning')
    if (warningTests.length > this.results.length * 0.3) {
      await this.sendWarningAlert(warningTests)
    }
  }

  private async sendCriticalAlert(failures: TestExecutionResult[]): Promise<void> {
    const alert = {
      type: 'critical',
      title: 'Healthcare Performance Test Failures',
      message: `${failures.length} critical performance test failures detected`,
      details: failures.map(f => `${f.suite}/${f.environment}: ${f.criticalIssues.join('; ')}`),
      timestamp: new Date().toISOString()
    }
    
    console.log('🚨 CRITICAL ALERT:', alert)
    // In real implementation, send to Slack, email, etc.
  }

  private async sendWarningAlert(warnings: TestExecutionResult[]): Promise<void> {
    const alert = {
      type: 'warning',
      title: 'Healthcare Performance Test Warnings',
      message: `${warnings.length} performance test warnings detected`,
      details: warnings.map(w => `${w.suite}/${w.environment}: Score ${(w.score * 100).toFixed(1)}%`),
      timestamp: new Date().toISOString()
    }
    
    console.log('⚠️ WARNING ALERT:', alert)
    // In real implementation, send to monitoring system
  }

  private async sendExecutionErrorAlert(error: Error): Promise<void> {
    const alert = {
      type: 'error',
      title: 'Healthcare Performance Test Execution Error',
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }
    
    console.log('❌ EXECUTION ERROR ALERT:', alert)
    // In real implementation, send to alerting system
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Stop continuous testing
   */
  stop(): void {
    this.isRunning = false
    console.log('🛑 Performance test runner stopped')
  }

  /**
   * Get current execution status
   */
  getStatus(): { isRunning: boolean; totalTests: number; completedTests: number } {
    return {
      isRunning: this.isRunning,
      totalTests: this.config.testSuites.length * this.config.environments.length,
      completedTests: this.results.length
    }
  }

  /**
   * Get all test results
   */
  getResults(): TestExecutionResult[] {
    return this.results
  }
}

/**
 * CLI Interface for Performance Test Runner
 */
async function main() {
  const args = process.argv.slice(2)
  
  if (args.includes('--help') || args.includes('-h')) {
    showHelp()
    process.exit(0)
  }

  const config: TestRunnerConfig = {
    testSuites: parseTestSuites(args),
    environments: parseEnvironments(args),
    generateReports: !args.includes('--no-reports'),
    parallelExecution: args.includes('--parallel'),
    outputFormat: parseOutputFormat(args),
    alertOnFailure: !args.includes('--no-alerts'),
    continuous: args.includes('--continuous'),
    interval: parseInterval(args)
  }

  console.log('🏥 Healthcare Performance Test Runner')
  console.log('=====================================')

  try {
    const runner = new HealthcarePerformanceTestRunner(config)
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Received SIGINT, stopping tests...')
      runner.stop()
      process.exit(0)
    })

    process.on('SIGTERM', () => {
      console.log('\n🛑 Received SIGTERM, stopping tests...')
      runner.stop()
      process.exit(0)
    })

    const results = await runner.runTests()
    
    // Exit with error code if tests failed
    const failedTests = results.filter(r => r.status === 'failed').length
    if (failedTests > 0) {
      console.log(`\n❌ ${failedTests} tests failed`)
      process.exit(1)
    } else {
      console.log('\n✅ All tests passed')
      process.exit(0)
    }

  } catch (error) {
    console.error('❌ Test runner failed:', error)
    process.exit(1)
  }
}

function showHelp(): void {
  console.log(`
Healthcare Performance Test Runner

USAGE:
  pnpm run test:performance [OPTIONS]

OPTIONS:
  --suite <name>              Test suite to run (emergency|appointment|enrollment|scalability|comprehensive)
                              Can be specified multiple times
  --env <name>                Environment to test (development|staging|production)
                              Can be specified multiple times
  --parallel                  Run tests in parallel
  --no-reports                Don't generate reports
  --no-alerts                 Don't send alerts on failure
  --continuous                Run tests continuously
  --interval <seconds>        Interval between continuous test runs (default: 300)
  --output <format>           Output format (json|html|markdown)
  --help, -h                  Show this help message

EXAMPLES:
  # Run emergency performance tests
  pnpm run test:performance --suite emergency --env staging

  # Run comprehensive tests across all environments
  pnpm run test:performance --suite comprehensive --env development --env staging --env production

  # Run parallel appointment tests with alerts
  pnpm run test:performance --suite appointment --parallel --alert-on-failure

  # Continuous monitoring of scalability tests
  pnpm run test:performance --suite scalability --continuous --interval 600

  # Performance testing with custom output format
  pnpm run test:performance --suite comprehensive --output json

TEST SUITES:
  emergency         - Critical emergency healthcare system performance
  appointment       - Healthcare appointment booking performance
  enrollment        - Healthier SG program enrollment performance
  scalability       - Large-scale healthcare platform scalability
  comprehensive     - Complete healthcare platform performance validation

ENVIRONMENTS:
  development       - Local development environment
  staging           - Pre-production staging environment
  production        - Production environment
  `)
}

function parseTestSuites(args: string[]): string[] {
  const suites: string[] = []
  const suiteIndex = args.indexOf('--suite')
  
  if (suiteIndex !== -1 && suiteIndex < args.length - 1) {
    // Parse multiple --suite arguments
    for (let i = suiteIndex; i < args.length && args[i] === '--suite'; i += 2) {
      if (args[i + 1]) {
        suites.push(args[i + 1])
      }
    }
  }
  
  // Default to comprehensive if no suites specified
  return suites.length > 0 ? suites : ['comprehensive']
}

function parseEnvironments(args: string[]): string[] {
  const envs: string[] = []
  const envIndex = args.indexOf('--env')
  
  if (envIndex !== -1 && envIndex < args.length - 1) {
    // Parse multiple --env arguments
    for (let i = envIndex; i < args.length && args[i] === '--env'; i += 2) {
      if (args[i + 1]) {
        envs.push(args[i + 1])
      }
    }
  }
  
  // Default to staging if no environments specified
  return envs.length > 0 ? envs : ['staging']
}

function parseOutputFormat(args: string[]): 'json' | 'html' | 'markdown' {
  const formatIndex = args.indexOf('--output')
  if (formatIndex !== -1 && formatIndex < args.length - 1) {
    const format = args[formatIndex + 1]
    if (['json', 'html', 'markdown'].includes(format)) {
      return format as 'json' | 'html' | 'markdown'
    }
  }
  return 'markdown'
}

function parseInterval(args: string[]): number | undefined {
  const intervalIndex = args.indexOf('--interval')
  if (intervalIndex !== -1 && intervalIndex < args.length - 1) {
    const interval = parseInt(args[intervalIndex + 1], 10)
    if (!isNaN(interval) && interval >= 60) {
      return interval
    }
  }
  return undefined
}

// Run the CLI if this file is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
}

export { HealthcarePerformanceTestRunner }
export type { TestRunnerConfig, TestExecutionResult }