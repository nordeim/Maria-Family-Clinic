/**
 * Performance Regression Testing Framework
 * Sub-Phase 10.2: Core Web Vitals & Performance Optimization
 * Automated performance testing with baseline comparison and alerting
 */

import { Page, Browser } from 'puppeteer'
import { performance } from 'perf_hooks'

export interface PerformanceTestResult {
  testName: string
  timestamp: number
  duration: number
  webVitals: {
    lcp: number
    fid: number
    cls: number
    fcp: number
    ttfb: number
  }
  metrics: {
    memoryUsage: number
    bundleSize: number
    resourceCount: number
    longTaskCount: number
  }
  passed: boolean
  score: 'good' | 'needs-improvement' | 'poor'
  issues: string[]
  recommendations: string[]
}

export interface PerformanceBenchmark {
  name: string
  threshold: number
  unit: string
  critical: boolean
  description: string
}

export interface PerformanceThresholds {
  lcp: PerformanceBenchmark
  fid: PerformanceBenchmark
  cls: PerformanceBenchmark
  fcp: PerformanceBenchmark
  ttfb: PerformanceBenchmark
  bundleSize: PerformanceBenchmark
  memoryUsage: PerformanceBenchmark
  longTasks: PerformanceBenchmark
}

export class PerformanceTestRunner {
  private thresholds: PerformanceThresholds = {
    lcp: { name: 'Largest Contentful Paint', threshold: 1200, unit: 'ms', critical: true, description: 'Time to load largest content element' },
    fid: { name: 'First Input Delay', threshold: 100, unit: 'ms', critical: true, description: 'Delay in responding to user input' },
    cls: { name: 'Cumulative Layout Shift', threshold: 0.1, unit: '', critical: true, description: 'Visual stability metric' },
    fcp: { name: 'First Contentful Paint', threshold: 1800, unit: 'ms', critical: false, description: 'Time to first content paint' },
    ttfb: { name: 'Time to First Byte', threshold: 600, unit: 'ms', critical: false, description: 'Server response time' },
    bundleSize: { name: 'Bundle Size', threshold: 500, unit: 'KB', critical: false, description: 'Total JavaScript bundle size' },
    memoryUsage: { name: 'Memory Usage', threshold: 50, unit: 'MB', critical: false, description: 'JavaScript heap usage' },
    longTasks: { name: 'Long Tasks', threshold: 0, unit: '', critical: false, description: 'Tasks running longer than 50ms' },
  }

  private baselines: Map<string, PerformanceTestResult> = new Map()

  constructor() {
    this.loadBaselines()
  }

  private loadBaselines() {
    // Load previous test results as baselines
    const saved = localStorage.getItem('performance-baselines')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        Object.entries(data).forEach(([key, value]) => {
          this.baselines.set(key, value as PerformanceTestResult)
        })
      } catch (e) {
        console.warn('Failed to load performance baselines:', e)
      }
    }
  }

  private saveBaseline(testName: string, result: PerformanceTestResult) {
    this.baselines.set(testName, result)
    const data = Object.fromEntries(this.baselines.entries())
    localStorage.setItem('performance-baselines', JSON.stringify(data))
  }

  async runPagePerformanceTest(
    page: Page,
    testName: string,
    url: string,
    interactions?: Array<{ type: string; selector: string; delay?: number }>
  ): Promise<PerformanceTestResult> {
    const startTime = performance.now()
    console.log(`Running performance test: ${testName}`)

    try {
      // Navigate to page
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })

      // Perform interactions if specified
      if (interactions) {
        for (const interaction of interactions) {
          await page.waitForSelector(interaction.selector)
          
          if (interaction.type === 'click') {
            await page.click(interaction.selector)
          } else if (interaction.type === 'type') {
            await page.type(interaction.selector, 'test input')
          } else if (interaction.type === 'scroll') {
            await page.evaluate(selector => {
              const element = document.querySelector(selector)
              element?.scrollIntoView()
            }, interaction.selector)
          }
          
          if (interaction.delay) {
            await page.waitForTimeout(interaction.delay)
          }
        }
      }

      // Wait for page to stabilize
      await page.waitForTimeout(2000)

      // Collect performance metrics
      const metrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        const paint = performance.getEntriesByType('paint')
        const resources = performance.getEntriesByType('resource')
        
        // Web Vitals (using PerformanceObserver API)
        const getWebVitals = () => {
          return new Promise<{ lcp: number; fid: number; cls: number }>((resolve) => {
            const vitals = { lcp: 0, fid: 0, cls: 0 }
            let clsValue = 0

            // LCP Observer
            if ('PerformanceObserver' in window) {
              try {
                const lcpObserver = new PerformanceObserver((list) => {
                  const entries = list.getEntries()
                  vitals.lcp = entries[entries.length - 1].startTime
                })
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

                // FID Observer
                const fidObserver = new PerformanceObserver((list) => {
                  const entries = list.getEntries()
                  for (const entry of entries as any[]) {
                    vitals.fid = entry.processingStart - entry.startTime
                  }
                })
                fidObserver.observe({ entryTypes: ['first-input'] })

                // CLS Observer
                const clsObserver = new PerformanceObserver((list) => {
                  for (const entry of list.getEntries() as any[]) {
                    if (!entry.hadRecentInput) {
                      clsValue += entry.value
                    }
                  }
                  vitals.cls = clsValue
                })
                clsObserver.observe({ entryTypes: ['layout-shift'] })

                // Resolve after observing
                setTimeout(() => {
                  lcpObserver.disconnect()
                  fidObserver.disconnect()
                  clsObserver.disconnect()
                  resolve(vitals)
                }, 5000)
              } catch (e) {
                resolve({ lcp: 0, fid: 0, cls: 0 })
              }
            } else {
              resolve({ lcp: 0, fid: 0, cls: 0 })
            }
          })
        }

        // Memory usage
        const memoryUsage = (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0

        // Bundle size (sum of JS resources)
        const jsResources = resources.filter(r => r.name.includes('.js'))
        const bundleSize = jsResources.reduce((sum, r) => sum + r.transferSize, 0)

        // Resource count
        const resourceCount = resources.length

        // Long tasks
        const longTasks = performance.getEntriesByType('longtask')

        return {
          navigation: {
            ttfb: navigation.responseStart - navigation.requestStart,
            fcp: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
          },
          memoryUsage,
          bundleSize,
          resourceCount,
          longTaskCount: longTasks.length,
        }
      })

      // Get Web Vitals
      const webVitals = await page.evaluate(() => {
        return new Promise<{ lcp: number; fid: number; cls: number }>((resolve) => {
          const vitals = { lcp: 0, fid: 0, cls: 0 }
          let clsValue = 0

          if ('PerformanceObserver' in window) {
            try {
              const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries()
                vitals.lcp = entries[entries.length - 1].startTime
              })
              lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

              const fidObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries()
                for (const entry of entries as any[]) {
                  vitals.fid = entry.processingStart - entry.startTime
                }
              })
              fidObserver.observe({ entryTypes: ['first-input'] })

              const clsObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries() as any[]) {
                  if (!entry.hadRecentInput) {
                    clsValue += entry.value
                  }
                }
                vitals.cls = clsValue
              })
              clsObserver.observe({ entryTypes: ['layout-shift'] })

              setTimeout(() => {
                lcpObserver.disconnect()
                fidObserver.disconnect()
                clsObserver.disconnect()
                resolve(vitals)
              }, 3000)
            } catch (e) {
              resolve({ lcp: 0, fid: 0, cls: 0 })
            }
          } else {
            resolve({ lcp: 0, fid: 0, cls: 0 })
          }
        })
      })

      const endTime = performance.now()
      const duration = endTime - startTime

      // Evaluate results
      const issues: string[] = []
      const recommendations: string[] = []
      let passed = true
      let score: 'good' | 'needs-improvement' | 'poor' = 'good'

      // Check thresholds
      Object.entries({
        lcp: webVitals.lcp,
        fid: webVitals.fid,
        cls: webVitals.cls,
        fcp: metrics.navigation.fcp,
        ttfb: metrics.navigation.ttfb,
        bundleSize: metrics.bundleSize / 1024, // Convert to KB
        memoryUsage: metrics.memoryUsage / (1024 * 1024), // Convert to MB
        longTasks: metrics.longTaskCount,
      }).forEach(([key, value]) => {
        const threshold = this.thresholds[key as keyof PerformanceThresholds]
        if (!threshold) return

        if (value > threshold.threshold) {
          passed = false
          const severity = threshold.critical ? 'critical' : 'warning'
          issues.push(`${threshold.name} exceeded threshold: ${value.toFixed(1)}${threshold.unit} > ${threshold.threshold}${threshold.unit} (${severity})`)
          
          if (threshold.critical) {
            score = 'poor'
          } else if (score === 'good') {
            score = 'needs-improvement'
          }

          // Generate recommendations
          switch (key) {
            case 'lcp':
              recommendations.push('Optimize images, use next/image component, implement lazy loading')
              break
            case 'fid':
              recommendations.push('Reduce JavaScript bundle size, implement code splitting, optimize event handlers')
              break
            case 'cls':
              recommendations.push('Add width/height to images, reserve space for dynamic content, use font-display: swap')
              break
            case 'bundleSize':
              recommendations.push('Implement code splitting, remove unused dependencies, use dynamic imports')
              break
            case 'memoryUsage':
              recommendations.push('Optimize memory usage, implement proper cleanup, avoid memory leaks')
              break
          }
        }
      })

      const result: PerformanceTestResult = {
        testName,
        timestamp: Date.now(),
        duration,
        webVitals: {
          ...webVitals,
          fcp: metrics.navigation.fcp,
          ttfb: metrics.navigation.ttfb,
        },
        metrics: {
          memoryUsage: metrics.memoryUsage / (1024 * 1024), // MB
          bundleSize: metrics.bundleSize / 1024, // KB
          resourceCount: metrics.resourceCount,
          longTaskCount: metrics.longTaskCount,
        },
        passed,
        score,
        issues,
        recommendations,
      }

      console.log(`Test completed: ${testName} - Score: ${score}, Passed: ${passed}`)
      return result

    } catch (error) {
      console.error(`Performance test failed: ${testName}`, error)
      return {
        testName,
        timestamp: Date.now(),
        duration: performance.now() - startTime,
        webVitals: { lcp: 0, fid: 0, cls: 0, fcp: 0, ttfb: 0 },
        metrics: { memoryUsage: 0, bundleSize: 0, resourceCount: 0, longTaskCount: 0 },
        passed: false,
        score: 'poor',
        issues: [`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        recommendations: ['Fix test setup and re-run'],
      }
    }
  }

  async runRegressionTest(
    browser: Browser,
    testCases: Array<{
      name: string
      url: string
      interactions?: Array<{ type: string; selector: string; delay?: number }>
    }>
  ): Promise<{
    results: PerformanceTestResult[]
    summary: {
      total: number
      passed: number
      failed: number
      averageScore: number
      criticalIssues: number
    }
  }> {
    console.log('Starting performance regression test suite...')
    
    const results: PerformanceTestResult[] = []
    const page = await browser.newPage()

    try {
      for (const testCase of testCases) {
        const result = await this.runPagePerformanceTest(
          page,
          testCase.name,
          testCase.url,
          testCase.interactions
        )
        
        results.push(result)
        
        // Update baseline for successful tests
        if (result.passed) {
          this.saveBaseline(testCase.name, result)
        }

        // Add delay between tests
        await page.waitForTimeout(2000)
      }
    } finally {
      await page.close()
    }

    const summary = {
      total: results.length,
      passed: results.filter(r => r.passed).length,
      failed: results.filter(r => !r.passed).length,
      averageScore: this.calculateAverageScore(results),
      criticalIssues: results.reduce((sum, r) => sum + r.issues.filter(i => i.includes('critical')).length, 0),
    }

    console.log('Performance regression test completed:', summary)
    return { results, summary }
  }

  private calculateAverageScore(results: PerformanceTestResult[]): number {
    const scores = results.map(r => {
      switch (r.score) {
        case 'good': return 3
        case 'needs-improvement': return 2
        case 'poor': return 1
        default: return 0
      }
    })
    return scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0
  }

  compareWithBaseline(testName: string, currentResult: PerformanceTestResult): {
    improved: boolean
    changes: Array<{
      metric: string
      previous: number
      current: number
      change: number
      changePercent: number
      impact: 'positive' | 'negative' | 'neutral'
    }>
  } {
    const baseline = this.baselines.get(testName)
    if (!baseline) {
      return {
        improved: false,
        changes: [],
      }
    }

    const changes: Array<{
      metric: string
      previous: number
      current: number
      change: number
      changePercent: number
      impact: 'positive' | 'negative' | 'neutral'
    }> = []

    // Compare Web Vitals (lower is better for all)
    const vitalsComparison = [
      { name: 'LCP', previous: baseline.webVitals.lcp, current: currentResult.webVitals.lcp },
      { name: 'FID', previous: baseline.webVitals.fid, current: currentResult.webVitals.fid },
      { name: 'CLS', previous: baseline.webVitals.cls, current: currentResult.webVitals.cls },
    ]

    vitalsComparison.forEach(({ name, previous, current }) => {
      if (previous > 0) { // Avoid division by zero
        const change = current - previous
        const changePercent = (change / previous) * 100
        const impact = change < 0 ? 'positive' : change > 0 ? 'negative' : 'neutral'

        changes.push({
          metric: name,
          previous,
          current,
          change,
          changePercent,
          impact,
        })
      }
    })

    const improved = changes.every(change => change.impact !== 'negative')

    return { improved, changes }
  }

  getThresholds(): PerformanceThresholds {
    return { ...this.thresholds }
  }

  getBaselines(): Map<string, PerformanceTestResult> {
    return new Map(this.baselines)
  }

  clearBaselines() {
    this.baselines.clear()
    localStorage.removeItem('performance-baselines')
  }

  exportResults(results: PerformanceTestResult[]): string {
    const exportData = {
      timestamp: Date.now(),
      thresholds: this.thresholds,
      results: results.map(r => ({
        ...r,
        date: new Date(r.timestamp).toISOString(),
      })),
      summary: {
        total: results.length,
        passed: results.filter(r => r.passed).length,
        failed: results.filter(r => !r.passed).length,
        averageScore: this.calculateAverageScore(results),
      },
    }

    return JSON.stringify(exportData, null, 2)
  }
}

// Healthcare-specific test cases
export const HEALTHCARE_TEST_CASES = [
  {
    name: 'Clinic Search Page',
    url: 'http://localhost:3000/clinics',
    interactions: [
      { type: 'click', selector: 'input[placeholder*="search"]', delay: 500 },
      { type: 'type', selector: 'input[placeholder*="search"]', delay: 1000 },
      { type: 'scroll', selector: '.clinic-list', delay: 2000 },
    ],
  },
  {
    name: 'Doctor Profile Page',
    url: 'http://localhost:3000/doctors/1',
    interactions: [
      { type: 'scroll', selector: '.doctor-profile', delay: 2000 },
      { type: 'click', selector: 'button[data-testid="book-appointment"]', delay: 1000 },
    ],
  },
  {
    name: 'Service Details Page',
    url: 'http://localhost:3000/services/1',
    interactions: [
      { type: 'scroll', selector: '.service-details', delay: 3000 },
      { type: 'click', selector: 'button[data-testid="find-clinics"]', delay: 1000 },
    ],
  },
  {
    name: 'Contact Form',
    url: 'http://localhost:3000/contact',
    interactions: [
      { type: 'click', selector: 'form input[name="name"]', delay: 500 },
      { type: 'type', selector: 'form input[name="name"]', delay: 1000 },
      { type: 'scroll', selector: '.contact-form', delay: 1000 },
    ],
  },
]

export { PerformanceTestRunner }
export type { PerformanceTestResult, PerformanceThresholds, PerformanceBenchmark }
