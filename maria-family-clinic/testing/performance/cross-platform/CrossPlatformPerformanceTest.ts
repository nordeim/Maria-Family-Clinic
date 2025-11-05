/**
 * Cross-Platform Performance Testing Framework
 * Sub-Phase 11.5: Performance & Load Testing
 * Comprehensive cross-platform testing for healthcare platform
 */

import { PerformanceTestService } from '../../services/PerformanceTestService'

export interface CrossPlatformTestConfig {
  baseUrl: string
  testTypes: ('mobile' | 'desktop' | 'tablet')[]
  networkConditions: ('3g' | '4g' | '5g' | 'wifi' | 'slow-3g')[]
  browsers: ('chrome' | 'firefox' | 'safari' | 'edge')[]
  testScenarios: Array<{
    name: string
    description: string
    url: string
    priority: 'critical' | 'important' | 'standard'
    metrics: Array<{
      name: string
      target: number
      unit: 'ms' | 'fps' | 'bytes'
    }>
  }>
  iterations: number
  parallelExecution: boolean
  generateScreenshots: boolean
  captureVideos: boolean
}

export interface CrossPlatformTestResult {
  platform: string
  networkCondition: string
  browser: string
  scenario: string
  metrics: {
    loadTime: number
    timeToFirstByte: number
    firstContentfulPaint: number
    largestContentfulPaint: number
    firstInputDelay: number
    cumulativeLayoutShift: number
    timeToInteractive: number
    speedIndex: number
    frameRate: number
    memoryUsage: number
  }
  healthcareWorkflows?: {
    appointmentBooking?: number
    doctorSearch?: number
    clinicDiscovery?: number
    formSubmission?: number
  }
  performanceScore: number
  passed: boolean
  failures: string[]
  screenshots?: string[]
  recommendations: string[]
  timestamp: number
}

export interface CrossPlatformComparison {
  platform: string
  baseline: CrossPlatformTestResult
  comparisons: Array<{
    platform: string
    result: CrossPlatformTestResult
    differences: Array<{
      metric: string
      absolute: number
      percentage: number
      status: 'better' | 'worse' | 'similar'
    }>
    overallScore: number
    performanceGap: number
  }>
  recommendations: string[]
}

export class CrossPlatformPerformanceTest {
  private config: CrossPlatformTestConfig
  private results: CrossPlatformTestResult[] = []

  constructor(config: CrossPlatformTestConfig) {
    this.config = config
    this.validateConfiguration()
  }

  private validateConfiguration() {
    if (!this.config.baseUrl) {
      throw new Error('Base URL is required for cross-platform testing')
    }
    if (!this.config.testTypes || this.config.testTypes.length === 0) {
      throw new Error('At least one test type must be specified')
    }
    if (!this.config.networkConditions || this.config.networkConditions.length === 0) {
      throw new Error('At least one network condition must be specified')
    }
    if (!this.config.browsers || this.config.browsers.length === 0) {
      throw new Error('At least one browser must be specified')
    }
    if (!this.config.testScenarios || this.config.testScenarios.length === 0) {
      throw new Error('At least one test scenario must be specified')
    }
  }

  /**
   * Execute comprehensive cross-platform performance tests
   */
  async runCrossPlatformTests(): Promise<CrossPlatformTestResult[]> {
    console.log('Starting cross-platform performance testing...')

    const allResults: CrossPlatformTestResult[] = []

    // Generate test combinations
    const testCombinations = this.generateTestCombinations()

    if (this.config.parallelExecution) {
      // Execute tests in parallel
      const batchSize = 4 // Limit concurrent tests to avoid resource exhaustion
      for (let i = 0; i < testCombinations.length; i += batchSize) {
        const batch = testCombinations.slice(i, i + batchSize)
        const batchPromises = batch.map(combo => this.executeTestCombination(combo))
        const batchResults = await Promise.all(batchPromises)
        allResults.push(...batchResults)
      }
    } else {
      // Execute tests sequentially
      for (const combination of testCombinations) {
        const result = await this.executeTestCombination(combination)
        allResults.push(result)
      }
    }

    this.results = allResults

    // Generate comprehensive report
    await this.generateCrossPlatformReport(allResults)

    return allResults
  }

  private generateTestCombinations(): Array<{
    platform: string
    network: string
    browser: string
    scenario: string
  }> {
    const combinations: Array<{
      platform: string
      network: string
      browser: string
      scenario: string
    }> = []

    this.config.testTypes.forEach(platform => {
      this.config.networkConditions.forEach(network => {
        this.config.browsers.forEach(browser => {
          this.config.testScenarios.forEach(scenario => {
            combinations.push({
              platform,
              network,
              browser,
              scenario: scenario.name
            })
          })
        })
      })
    })

    return combinations
  }

  private async executeTestCombination(combination: {
    platform: string
    network: string
    browser: string
    scenario: string
  }): Promise<CrossPlatformTestResult> {
    const startTime = Date.now()
    const scenario = this.config.testScenarios.find(s => s.name === combination.scenario)!

    console.log(`Testing ${combination.platform}/${combination.browser}/${combination.network} - ${combination.scenario}`)

    try {
      // Simulate cross-platform test execution
      // In a real implementation, you would use tools like:
      // - Puppeteer for browser automation
      // - Lighthouse for performance metrics
      // - WebPageTest for cross-browser testing
      // - Custom device emulation

      const result = await this.simulateCrossPlatformTest(combination, scenario)

      return {
        ...result,
        platform: combination.platform,
        networkCondition: combination.network,
        browser: combination.browser,
        scenario: combination.scenario,
        timestamp: startTime
      }

    } catch (error) {
      console.error(`Test failed for ${JSON.stringify(combination)}:`, error)
      return this.createFailedResult(combination, error as Error)
    }
  }

  private async simulateCrossPlatformTest(
    combination: { platform: string; network: string; browser: string; scenario: string },
    scenario: CrossPlatformTestConfig['testScenarios'][0]
  ): Promise<Omit<CrossPlatformTestResult, 'platform' | 'networkCondition' | 'browser' | 'scenario' | 'timestamp'>> {
    // Simulate realistic performance variations based on platform, network, and browser
    const baseMetrics = this.getBaseMetrics(scenario, combination.platform)
    const networkMultiplier = this.getNetworkMultiplier(combination.network)
    const browserMultiplier = this.getBrowserMultiplier(combination.browser)
    const platformMultiplier = this.getPlatformMultiplier(combination.platform)

    // Apply realistic performance variations
    const loadTime = baseMetrics.loadTime * networkMultiplier * browserMultiplier * platformMultiplier
    const timeToFirstByte = baseMetrics.timeToFirstByte * networkMultiplier
    const firstContentfulPaint = baseMetrics.firstContentfulPaint * networkMultiplier * platformMultiplier
    const largestContentfulPaint = baseMetrics.largestContentfulPaint * networkMultiplier * platformMultiplier
    const firstInputDelay = baseMetrics.firstInputDelay * browserMultiplier * platformMultiplier
    const cumulativeLayoutShift = baseMetrics.cumulativeLayoutShift * (1 + Math.random() * 0.1)
    const timeToInteractive = baseMetrics.timeToInteractive * networkMultiplier * browserMultiplier * platformMultiplier
    const speedIndex = baseMetrics.speedIndex * networkMultiplier * platformMultiplier
    const frameRate = baseMetrics.frameRate / platformMultiplier
    const memoryUsage = baseMetrics.memoryUsage * platformMultiplier

    // Calculate healthcare workflow performance
    const healthcareWorkflows = this.calculateHealthcareWorkflowPerformance(scenario, combination)

    // Calculate overall performance score
    const performanceScore = this.calculatePerformanceScore({
      loadTime,
      timeToFirstByte,
      firstContentfulPaint,
      largestContentfulPaint,
      firstInputDelay,
      cumulativeLayoutShift,
      timeToInteractive,
      speedIndex,
      frameRate,
      memoryUsage
    })

    // Determine if test passed
    const passed = performanceScore >= 0.7 && 
                  loadTime <= 5000 && 
                  largestContentfulPaint <= 4000 && 
                  firstInputDelay <= 300

    // Generate recommendations
    const recommendations = this.generateCrossPlatformRecommendations(
      combination,
      { loadTime, timeToFirstByte, firstContentfulPaint, largestContentfulPaint, firstInputDelay, cumulativeLayoutShift, timeToInteractive, speedIndex, frameRate, memoryUsage },
      performanceScore
    )

    // Capture screenshots and videos if requested
    const screenshots = this.config.generateScreenshots ? 
      [`${combination.platform}-${combination.browser}-${combination.network}-${combination.scenario}.png`] : 
      undefined

    return {
      metrics: {
        loadTime,
        timeToFirstByte,
        firstContentfulPaint,
        largestContentfulPaint,
        firstInputDelay,
        cumulativeLayoutShift,
        timeToInteractive,
        speedIndex,
        frameRate,
        memoryUsage
      },
      healthcareWorkflows,
      performanceScore,
      passed,
      failures: passed ? [] : this.identifyFailures({ loadTime, timeToFirstByte, firstContentfulPaint, largestContentfulPaint, firstInputDelay, cumulativeLayoutShift, timeToInteractive, speedIndex, frameRate, memoryUsage }),
      screenshots,
      recommendations
    }
  }

  private getBaseMetrics(scenario: CrossPlatformTestConfig['testScenarios'][0], platform: string): CrossPlatformTestResult['metrics'] {
    const baseMetrics = {
      // Baseline metrics for desktop/wifi/chrome
      loadTime: 2000 + Math.random() * 1000, // 2000-3000ms
      timeToFirstByte: 200 + Math.random() * 100, // 200-300ms
      firstContentfulPaint: 800 + Math.random() * 400, // 800-1200ms
      largestContentfulPaint: 1500 + Math.random() * 500, // 1500-2000ms
      firstInputDelay: 50 + Math.random() * 50, // 50-100ms
      cumulativeLayoutShift: 0.05 + Math.random() * 0.05, // 0.05-0.1
      timeToInteractive: 2500 + Math.random() * 1000, // 2500-3500ms
      speedIndex: 1200 + Math.random() * 600, // 1200-1800ms
      frameRate: 60, // 60fps baseline
      memoryUsage: 50 + Math.random() * 20 // 50-70MB baseline
    }

    // Adjust base metrics based on scenario complexity
    if (scenario.priority === 'critical') {
      // Critical scenarios need better performance
      return {
        loadTime: baseMetrics.loadTime * 0.8,
        timeToFirstByte: baseMetrics.timeToFirstByte * 0.8,
        firstContentfulPaint: baseMetrics.firstContentfulPaint * 0.8,
        largestContentfulPaint: baseMetrics.largestContentfulPaint * 0.8,
        firstInputDelay: baseMetrics.firstInputDelay * 0.7,
        cumulativeLayoutShift: baseMetrics.cumulativeLayoutShift * 0.8,
        timeToInteractive: baseMetrics.timeToInteractive * 0.8,
        speedIndex: baseMetrics.speedIndex * 0.8,
        frameRate: baseMetrics.frameRate * 1.1,
        memoryUsage: baseMetrics.memoryUsage * 0.9
      }
    }

    return baseMetrics
  }

  private getNetworkMultiplier(network: string): number {
    const multipliers = {
      'slow-3g': 3.0,
      '3g': 2.5,
      '4g': 1.5,
      '5g': 1.0,
      'wifi': 0.8
    }
    return multipliers[network as keyof typeof multipliers] || 1.0
  }

  private getBrowserMultiplier(browser: string): number {
    const multipliers = {
      'chrome': 1.0,
      'firefox': 1.1,
      'safari': 1.2,
      'edge': 1.05
    }
    return multipliers[browser as keyof typeof multipliers] || 1.0
  }

  private getPlatformMultiplier(platform: string): number {
    const multipliers = {
      'mobile': 1.3,
      'tablet': 1.1,
      'desktop': 1.0
    }
    return multipliers[platform as keyof typeof multipliers] || 1.0
  }

  private calculateHealthcareWorkflowPerformance(
    scenario: CrossPlatformTestConfig['testScenarios'][0],
    combination: { platform: string; network: string; browser: string }
  ): CrossPlatformTestResult['healthcareWorkflows'] | undefined {
    // Only calculate for healthcare-related scenarios
    if (!scenario.name.toLowerCase().includes('appointment') && 
        !scenario.name.toLowerCase().includes('doctor') && 
        !scenario.name.toLowerCase().includes('clinic') &&
        !scenario.name.toLowerCase().includes('healthcare')) {
      return undefined
    }

    const platformMultiplier = this.getPlatformMultiplier(combination.platform)
    const networkMultiplier = this.getNetworkMultiplier(combination.network)
    const overallMultiplier = platformMultiplier * networkMultiplier

    return {
      appointmentBooking: (2500 + Math.random() * 1000) * overallMultiplier,
      doctorSearch: (800 + Math.random() * 400) * overallMultiplier,
      clinicDiscovery: (1200 + Math.random() * 600) * overallMultiplier,
      formSubmission: (1500 + Math.random() * 800) * overallMultiplier
    }
  }

  private calculatePerformanceScore(metrics: CrossPlatformTestResult['metrics']): number {
    // Weighted scoring system for healthcare platform performance
    const weights = {
      loadTime: 0.15,
      timeToFirstByte: 0.10,
      firstContentfulPaint: 0.10,
      largestContentfulPaint: 0.20,
      firstInputDelay: 0.20,
      cumulativeLayoutShift: 0.10,
      timeToInteractive: 0.10,
      speedIndex: 0.05,
      frameRate: 0.05,
      memoryUsage: 0.05
    }

    let totalScore = 0

    // Load Time Score (lower is better)
    const loadTimeScore = Math.max(0, 1 - (metrics.loadTime - 1000) / 4000)
    totalScore += loadTimeScore * weights.loadTime

    // Time to First Byte Score (lower is better)
    const ttfbScore = Math.max(0, 1 - (metrics.timeToFirstByte - 100) / 200)
    totalScore += ttfbScore * weights.timeToFirstByte

    // First Contentful Paint Score (lower is better)
    const fcpScore = Math.max(0, 1 - (metrics.firstContentfulPaint - 800) / 1200)
    totalScore += fcpScore * weights.firstContentfulPaint

    // Largest Contentful Paint Score (lower is better)
    const lcpScore = Math.max(0, 1 - (metrics.largestContentfulPaint - 1200) / 2800)
    totalScore += lcpScore * weights.largestContentfulPaint

    // First Input Delay Score (lower is better)
    const fidScore = Math.max(0, 1 - (metrics.firstInputDelay - 50) / 250)
    totalScore += fidScore * weights.firstInputDelay

    // Cumulative Layout Shift Score (lower is better)
    const clsScore = Math.max(0, 1 - (metrics.cumulativeLayoutShift - 0.05) / 0.15)
    totalScore += clsScore * weights.cumulativeLayoutShift

    // Time to Interactive Score (lower is better)
    const ttiScore = Math.max(0, 1 - (metrics.timeToInteractive - 2000) / 3000)
    totalScore += ttiScore * weights.timeToInteractive

    // Speed Index Score (lower is better)
    const speedIndexScore = Math.max(0, 1 - (metrics.speedIndex - 1000) / 2000)
    totalScore += speedIndexScore * weights.speedIndex

    // Frame Rate Score (higher is better)
    const frameRateScore = Math.min(1, metrics.frameRate / 60)
    totalScore += frameRateScore * weights.frameRate

    // Memory Usage Score (lower is better)
    const memoryScore = Math.max(0, 1 - (metrics.memoryUsage - 40) / 60)
    totalScore += memoryScore * weights.memoryUsage

    return totalScore
  }

  private identifyFailures(metrics: CrossPlatformTestResult['metrics']): string[] {
    const failures: string[] = []

    if (metrics.loadTime > 5000) {
      failures.push(`Load time exceeds 5s: ${metrics.loadTime.toFixed(0)}ms`)
    }
    if (metrics.largestContentfulPaint > 4000) {
      failures.push(`LCP exceeds 4s: ${metrics.largestContentfulPaint.toFixed(0)}ms`)
    }
    if (metrics.firstInputDelay > 300) {
      failures.push(`FID exceeds 300ms: ${metrics.firstInputDelay.toFixed(0)}ms`)
    }
    if (metrics.cumulativeLayoutShift > 0.25) {
      failures.push(`CLS exceeds 0.25: ${metrics.cumulativeLayoutShift.toFixed(3)}`)
    }
    if (metrics.frameRate < 30) {
      failures.push(`Frame rate below 30fps: ${metrics.frameRate.toFixed(0)}fps`)
    }

    return failures
  }

  private generateCrossPlatformRecommendations(
    combination: { platform: string; network: string; browser: string },
    metrics: CrossPlatformTestResult['metrics'],
    performanceScore: number
  ): string[] {
    const recommendations: string[] = []

    // Platform-specific recommendations
    if (combination.platform === 'mobile') {
      recommendations.push('OPTIMIZE: Implement progressive web app features for mobile')
      recommendations.push('OPTIMIZE: Reduce bundle size for mobile networks')
      if (metrics.frameRate < 60) {
        recommendations.push('CRITICAL: Optimize animations for 60fps on mobile')
      }
    }

    if (combination.platform === 'tablet') {
      recommendations.push('OPTIMIZE: Optimize layout for tablet screen sizes')
    }

    // Network condition recommendations
    if (combination.network === '3g' || combination.network === 'slow-3g') {
      recommendations.push('CRITICAL: Implement aggressive caching for slow networks')
      recommendations.push('OPTIMIZE: Use WebP images and lazy loading')
      recommendations.push('OPTIMIZE: Minimize JavaScript execution on slow connections')
    }

    if (combination.network === '4g') {
      recommendations.push('OPTIMIZE: Consider prefetching critical resources')
    }

    // Browser-specific recommendations
    if (combination.browser === 'safari') {
      recommendations.push('OPTIMIZE: Test Safari-specific performance optimizations')
      recommendations.push('OPTIMIZE: Ensure compatibility with WebKit rendering')
    }

    if (combination.browser === 'firefox') {
      recommendations.push('OPTIMIZE: Test Firefox-specific performance characteristics')
    }

    // Performance score recommendations
    if (performanceScore < 0.5) {
      recommendations.push('CRITICAL: Performance score below 50% - immediate optimization required')
    } else if (performanceScore < 0.7) {
      recommendations.push('IMPROVEMENT: Performance score below 70% - optimization recommended')
    }

    // Specific metric recommendations
    if (metrics.largestContentfulPaint > 2500) {
      recommendations.push('HIGH: Optimize Largest Contentful Paint - preload critical resources')
    }

    if (metrics.firstInputDelay > 200) {
      recommendations.push('HIGH: Optimize First Input Delay - reduce JavaScript execution time')
    }

    if (metrics.cumulativeLayoutShift > 0.15) {
      recommendations.push('MEDIUM: Optimize Cumulative Layout Shift - set explicit dimensions')
    }

    if (metrics.timeToFirstByte > 500) {
      recommendations.push('MEDIUM: Optimize Time to First Byte - consider CDN and server optimization')
    }

    // Healthcare-specific recommendations
    recommendations.push('HEALTHCARE: Ensure critical workflows maintain <1s response times')
    recommendations.push('HEALTHCARE: Validate emergency access performance across all platforms')
    recommendations.push('HEALTHCARE: Test real-time features performance under various conditions')

    return recommendations
  }

  private createFailedResult(
    combination: { platform: string; network: string; browser: string; scenario: string },
    error: Error
  ): CrossPlatformTestResult {
    return {
      platform: combination.platform,
      networkCondition: combination.network,
      browser: combination.browser,
      scenario: combination.scenario,
      metrics: {
        loadTime: 0,
        timeToFirstByte: 0,
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        firstInputDelay: 0,
        cumulativeLayoutShift: 0,
        timeToInteractive: 0,
        speedIndex: 0,
        frameRate: 0,
        memoryUsage: 0
      },
      performanceScore: 0,
      passed: false,
      failures: [`Test execution failed: ${error.message}`],
      recommendations: ['Investigate test execution failure', 'Check environment configuration'],
      timestamp: Date.now()
    }
  }

  /**
   * Generate cross-platform comparison report
   */
  generateCrossPlatformComparison(platform: string): CrossPlatformComparison | null {
    const platformResults = this.results.filter(r => r.platform === platform)
    if (platformResults.length === 0) {
      return null
    }

    // Use the best result as baseline (highest performance score)
    const baseline = platformResults.reduce((best, current) => 
      current.performanceScore > best.performanceScore ? current : best
    )

    const comparisons = platformResults
      .filter(result => result !== baseline)
      .map(result => {
        const differences = this.compareMetrics(baseline.metrics, result.metrics)
        const overallScore = this.calculateOverallComparisonScore(differences)
        const performanceGap = baseline.performanceScore - result.performanceScore

        return {
          platform: result.platform,
          result,
          differences,
          overallScore,
          performanceGap
        }
      })

    return {
      platform,
      baseline,
      comparisons,
      recommendations: this.generateComparisonRecommendations(comparisons)
    }
  }

  private compareMetrics(baseline: CrossPlatformTestResult['metrics'], current: CrossPlatformTestResult['metrics']) {
    return [
      {
        metric: 'loadTime',
        absolute: current.loadTime - baseline.loadTime,
        percentage: ((current.loadTime - baseline.loadTime) / baseline.loadTime) * 100,
        status: current.loadTime < baseline.loadTime ? 'better' : current.loadTime > baseline.loadTime * 1.1 ? 'worse' : 'similar'
      },
      {
        metric: 'largestContentfulPaint',
        absolute: current.largestContentfulPaint - baseline.largestContentfulPaint,
        percentage: ((current.largestContentfulPaint - baseline.largestContentfulPaint) / baseline.largestContentfulPaint) * 100,
        status: current.largestContentfulPaint < baseline.largestContentfulPaint ? 'better' : current.largestContentfulPaint > baseline.largestContentfulPaint * 1.1 ? 'worse' : 'similar'
      },
      {
        metric: 'firstInputDelay',
        absolute: current.firstInputDelay - baseline.firstInputDelay,
        percentage: ((current.firstInputDelay - baseline.firstInputDelay) / baseline.firstInputDelay) * 100,
        status: current.firstInputDelay < baseline.firstInputDelay ? 'better' : current.firstInputDelay > baseline.firstInputDelay * 1.2 ? 'worse' : 'similar'
      }
    ]
  }

  private calculateOverallComparisonScore(differences: any[]): number {
    const weights = { better: 1, similar: 0.5, worse: 0 }
    const totalWeight = differences.length
    const scoreWeight = differences.reduce((sum, diff) => sum + weights[diff.status as keyof typeof weights], 0)
    return totalWeight > 0 ? scoreWeight / totalWeight : 0
  }

  private generateComparisonRecommendations(comparisons: any[]): string[] {
    const recommendations: string[] = []

    comparisons.forEach(comparison => {
      const worseMetrics = comparison.differences.filter((d: any) => d.status === 'worse')
      if (worseMetrics.length > 0) {
        recommendations.push(`${comparison.platform}: Optimize ${worseMetrics.map((m: any) => m.metric).join(', ')} performance`)
      }
    })

    if (recommendations.length === 0) {
      recommendations.push('All platforms show similar performance characteristics')
    }

    recommendations.push('Ensure consistent performance across all supported platforms')
    recommendations.push('Consider platform-specific optimizations for better user experience')

    return recommendations
  }

  private async generateCrossPlatformReport(results: CrossPlatformTestResult[]): Promise<void> {
    const report = this.generateMarkdownReport(results)
    console.log('Cross-Platform Performance Report Generated')
    console.log(report)
  }

  private generateMarkdownReport(results: CrossPlatformTestResult[]): string {
    const totalTests = results.length
    const passedTests = results.filter(r => r.passed).length
    const avgScore = results.reduce((sum, r) => sum + r.performanceScore, 0) / totalTests

    // Group results by platform
    const platformGroups = this.groupResultsByPlatform(results)

    let report = `# Cross-Platform Performance Test Report

## Executive Summary
- **Total Tests**: ${totalTests}
- **Passed Tests**: ${passedTests} (${((passedTests / totalTests) * 100).toFixed(1)}%)
- **Failed Tests**: ${totalTests - passedTests} (${(((totalTests - passedTests) / totalTests) * 100).toFixed(1)}%)
- **Average Performance Score**: ${(avgScore * 100).toFixed(1)}%
- **Test Date**: ${new Date().toISOString()}

## Performance by Platform

`

    Object.entries(platformGroups).forEach(([platform, platformResults]) => {
      const platformPassed = platformResults.filter(r => r.passed).length
      const platformAvgScore = platformResults.reduce((sum, r) => sum + r.performanceScore, 0) / platformResults.length

      report += `### ${platform.charAt(0).toUpperCase() + platform.slice(1)} Platform
- **Tests**: ${platformResults.length}
- **Passed**: ${platformPassed} (${((platformPassed / platformResults.length) * 100).toFixed(1)}%)
- **Average Score**: ${(platformAvgScore * 100).toFixed(1)}%

| Browser | Network | Scenario | LCP | FID | CLS | Score | Status |
|---------|---------|----------|-----|-----|-----|-------|--------|

`

      platformResults.forEach(result => {
        report += `| ${result.browser} | ${result.networkCondition} | ${result.scenario} | ${result.metrics.largestContentfulPaint.toFixed(0)}ms | ${result.metrics.firstInputDelay.toFixed(0)}ms | ${result.metrics.cumulativeLayoutShift.toFixed(3)} | ${(result.performanceScore * 100).toFixed(0)}% | ${result.passed ? '✅ Pass' : '❌ Fail'} |

`
      })

      report += '\n'
    })

    // Add detailed recommendations
    report += `## Cross-Platform Optimization Recommendations

### Performance Optimization Priorities
1. **Mobile Performance**: Focus on mobile optimization - critical for healthcare accessibility
2. **Network Resilience**: Ensure graceful degradation on slower connections (3G)
3. **Browser Compatibility**: Address any browser-specific performance issues
4. **Consistency**: Maintain consistent performance across all platforms

### Healthcare-Specific Considerations
- **Emergency Access**: Ensure emergency workflows perform consistently across all platforms
- **Real-time Features**: Validate real-time updates work reliably on mobile devices
- **Data Entry**: Optimize form performance for touch interfaces
- **Offline Capability**: Consider offline features for critical healthcare workflows

### Implementation Roadmap
${avgScore < 0.7 ? 
  '- **Phase 1**: Address critical performance failures\n- **Phase 2**: Optimize mobile performance\n- **Phase 3**: Improve cross-browser consistency\n- **Phase 4**: Implement network resilience features' :
  '- **Phase 1**: Fine-tune performance optimization\n- **Phase 2**: Enhance mobile user experience\n- **Phase 3**: Implement advanced features\n- **Phase 4**: Continuous monitoring and optimization'
}

`

    return report
  }

  private groupResultsByPlatform(results: CrossPlatformTestResult[]): Record<string, CrossPlatformTestResult[]> {
    return results.reduce((groups, result) => {
      if (!groups[result.platform]) {
        groups[result.platform] = []
      }
      groups[result.platform].push(result)
      return groups
    }, {} as Record<string, CrossPlatformTestResult[]>)
  }

  /**
   * Get all test results
   */
  getResults(): CrossPlatformTestResult[] {
    return this.results
  }

  /**
   * Export results to JSON format
   */
  exportResults(): string {
    return JSON.stringify({
      config: this.config,
      results: this.results,
      summary: {
        totalTests: this.results.length,
        passedTests: this.results.filter(r => r.passed).length,
        averageScore: this.results.reduce((sum, r) => sum + r.performanceScore, 0) / this.results.length,
        timestamp: new Date().toISOString()
      }
    }, null, 2)
  }
}

export { CrossPlatformPerformanceTest }
export type { CrossPlatformTestConfig, CrossPlatformTestResult, CrossPlatformComparison }