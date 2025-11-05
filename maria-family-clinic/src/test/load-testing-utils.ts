/**
 * Load Testing Utility Functions
 * Sub-Phase 9.10 - Testing, Quality Assurance & Performance Optimization
 */

import type { ContactForm, Enquiry, User, Clinic, Doctor } from '@/lib/types/contact-system'

export class loadTester {
  private userCount: number = 0
  private activeUsers: Map<string, any> = new Map()
  private performanceMetrics: any[] = []

  async initialize(userCount: number): Promise<void> {
    this.userCount = userCount
    this.activeUsers.clear()
    this.performanceMetrics = []
    
    console.log(`Load tester initialized for ${userCount} users`)
  }

  async simulateUser(userConfig: {
    userId: string
    formData: ContactForm
    delay?: number
  }): Promise<any> {
    if (userConfig.delay) {
      await new Promise(resolve => setTimeout(resolve, userConfig.delay))
    }

    const startTime = performance.now()
    const sessionId = `session-${userConfig.userId}-${Date.now()}`

    try {
      // Simulate user session
      const session = {
        userId: userConfig.userId,
        sessionId,
        startTime,
        formData: userConfig.formData,
      }

      this.activeUsers.set(sessionId, session)

      // Simulate form submission
      const submitTime = await this.simulateFormSubmission(userConfig.formData)
      
      const endTime = performance.now()
      const totalTime = endTime - startTime

      const result = {
        userId: userConfig.userId,
        sessionId,
        success: true,
        responseTime: totalTime,
        submitTime,
        timestamp: Date.now(),
      }

      this.performanceMetrics.push(result)
      this.activeUsers.delete(sessionId)

      return result

    } catch (error) {
      const endTime = performance.now()
      const totalTime = endTime - startTime

      const result = {
        userId: userConfig.userId,
        sessionId,
        success: false,
        responseTime: totalTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      }

      this.performanceMetrics.push(result)
      this.activeUsers.delete(sessionId)

      return result
    }
  }

  private async simulateFormSubmission(formData: ContactForm): Promise<number> {
    const submitStartTime = performance.now()

    // Simulate form processing
    await new Promise(resolve => setTimeout(resolve, Math.random() * 50 + 10)) // 10-60ms

    // Simulate database operations
    await new Promise(resolve => setTimeout(resolve, Math.random() * 20 + 5)) // 5-25ms

    // Simulate email notification
    await new Promise(resolve => setTimeout(resolve, Math.random() * 10 + 2)) // 2-12ms

    const submitEndTime = performance.now()
    return submitEndTime - submitStartTime
  }

  async getPerformanceMetrics(): Promise<any> {
    const totalRequests = this.performanceMetrics.length
    const successfulRequests = this.performanceMetrics.filter(r => r.success).length
    const failedRequests = totalRequests - successfulRequests

    const responseTimes = this.performanceMetrics.map(r => r.responseTime)
    const submitTimes = this.performanceMetrics.map(r => r.submitTime)

    const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
    const avgSubmitTime = submitTimes.reduce((sum, time) => sum + time, 0) / submitTimes.length

    // Calculate percentiles
    const sortedResponseTimes = responseTimes.sort((a, b) => a - b)
    const p50 = sortedResponseTimes[Math.floor(0.50 * sortedResponseTimes.length)]
    const p95 = sortedResponseTimes[Math.floor(0.95 * sortedResponseTimes.length)]
    const p99 = sortedResponseTimes[Math.floor(0.99 * sortedResponseTimes.length)]

    const throughput = totalRequests / (Math.max(...this.performanceMetrics.map(r => r.timestamp)) - Math.min(...this.performanceMetrics.map(r => r.timestamp)) / 1000)

    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      successRate: successfulRequests / totalRequests,
      errorRate: failedRequests / totalRequests,
      avgResponseTime,
      avgSubmitTime,
      p50ResponseTime: p50,
      p95ResponseTime: p95,
      p99ResponseTime: p99,
      maxResponseTime: Math.max(...responseTimes),
      throughput,
    }
  }

  async stop(): Promise<void> {
    this.activeUsers.clear()
    console.log('Load tester stopped')
  }

  getActiveUserCount(): number {
    return this.activeUsers.size
  }

  getPerformanceData(): any[] {
    return [...this.performanceMetrics]
  }
}

export class performanceMonitor {
  private metrics: Map<string, number[]> = new Map()
  private alerts: any[] = []
  private isRunning = false
  private monitoringInterval?: NodeJS.Timeout
  private config: any = {}

  async start(config: {
    metrics: string[]
    alertThresholds: {
      responseTime: number
      errorRate: number
      memoryUsage: number
    }
    interval?: number
  }): Promise<void> {
    this.config = config
    this.isRunning = true
    
    // Initialize metric storage
    config.metrics.forEach(metric => {
      this.metrics.set(metric, [])
    })

    // Start monitoring interval
    this.monitoringInterval = setInterval(() => {
      this.checkThresholds()
    }, config.interval || 5000) // Default 5-second intervals

    console.log('Performance monitoring started')
  }

  async recordMetric(metricName: string, value: number): Promise<void> {
    if (!this.metrics.has(metricName)) {
      this.metrics.set(metricName, [])
    }
    
    this.metrics.get(metricName)!.push({
      value,
      timestamp: Date.now(),
    })

    // Check immediate thresholds
    this.checkThreshold(metricName, value)
  }

  private checkThreshold(metricName: string, value: number): void {
    const thresholds = this.config.alertThresholds || {}
    
    if (thresholds[metricName] && value > thresholds[metricName]) {
      this.alerts.push({
        id: `alert-${Date.now()}-${Math.random()}`,
        metric: metricName,
        value,
        threshold: thresholds[metricName],
        severity: 'WARNING',
        message: `${metricName} exceeded threshold: ${value} > ${thresholds[metricName]}`,
        timestamp: Date.now(),
      })
    }
  }

  private checkThresholds(): void {
    if (!this.isRunning) return

    // Check aggregated metrics
    const memoryUsage = process.memoryUsage()
    if (this.config.alertThresholds?.memoryUsage && memoryUsage.heapUsed > this.config.alertThresholds.memoryUsage) {
      this.alerts.push({
        id: `alert-${Date.now()}-memory`,
        metric: 'memory_usage',
        value: memoryUsage.heapUsed,
        threshold: this.config.alertThresholds.memoryUsage,
        severity: 'WARNING',
        message: `Memory usage exceeded threshold: ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`,
        timestamp: Date.now(),
      })
    }
  }

  async getCurrentMetrics(): Promise<any> {
    const currentMetrics: any = {}
    
    for (const [metricName, values] of this.metrics.entries()) {
      const recentValues = values.slice(-10) // Last 10 values
      if (recentValues.length === 0) continue

      const numericValues = recentValues.map(v => v.value)
      
      currentMetrics[metricName] = {
        avg: numericValues.reduce((sum, v) => sum + v, 0) / numericValues.length,
        min: Math.min(...numericValues),
        max: Math.max(...numericValues),
        latest: numericValues[numericValues.length - 1],
        count: numericValues.length,
      }
    }

    return currentMetrics
  }

  async getAlerts(): Promise<any[]> {
    return [...this.alerts]
  }

  async stop(): Promise<void> {
    this.isRunning = false
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
    }
    console.log('Performance monitoring stopped')
  }

  isMonitoring(): boolean {
    return this.isRunning
  }

  clearAlerts(): void {
    this.alerts = []
  }

  clearMetrics(): void {
    for (const values of this.metrics.values()) {
      values.length = 0
    }
  }
}

export class concurrencyTester {
  private semaphore: Promise<void>[] = []
  private maxConcurrency: number
  private running: number = 0

  constructor(maxConcurrency: number) {
    this.maxConcurrency = maxConcurrency
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Wait if at max concurrency
    if (this.running >= this.maxConcurrency) {
      const completed = await Promise.race(this.semaphore)
      await completed
    }

    this.running++
    
    try {
      const result = await fn()
      return result
    } finally {
      this.running--
      // Remove first completed promise from queue
      const completed = this.semaphore.shift()
      if (completed) {
        await completed
      }
    }
  }

  async batch<T>(tasks: (() => Promise<T>)[], maxConcurrency?: number): Promise<T[]> {
    const concurrency = maxConcurrency || this.maxConcurrency
    const batches: (() => Promise<T>)[][] = []
    
    for (let i = 0; i < tasks.length; i += concurrency) {
      batches.push(tasks.slice(i, i + concurrency))
    }

    const results: T[] = []
    
    for (const batch of batches) {
      const batchResults = await Promise.all(
        batch.map(task => this.execute(task))
      )
      results.push(...batchResults)
    }

    return results
  }
}

export class responseTimeAnalyzer {
  private measurements: number[] = []

  record(time: number): void {
    this.measurements.push(time)
  }

  getStats(): {
    count: number
    avg: number
    min: number
    max: number
    p50: number
    p95: number
    p99: number
  } {
    if (this.measurements.length === 0) {
      return {
        count: 0,
        avg: 0,
        min: 0,
        max: 0,
        p50: 0,
        p95: 0,
        p99: 0,
      }
    }

    const sorted = [...this.measurements].sort((a, b) => a - b)
    const count = sorted.length

    return {
      count,
      avg: sorted.reduce((sum, val) => sum + val, 0) / count,
      min: sorted[0],
      max: sorted[count - 1],
      p50: sorted[Math.floor(0.50 * count)],
      p95: sorted[Math.floor(0.95 * count)],
      p99: sorted[Math.floor(0.99 * count)],
    }
  }

  clear(): void {
    this.measurements = []
  }
}

export class throughputMonitor {
  private startTime: number = 0
  private completedRequests: number = 0
  private totalRequests: number = 0

  start(): void {
    this.startTime = performance.now()
    this.completedRequests = 0
    this.totalRequests = 0
  }

  recordRequest(): void {
    this.completedRequests++
    this.totalRequests++
  }

  getThroughput(): number {
    if (this.startTime === 0) return 0
    
    const elapsedSeconds = (performance.now() - this.startTime) / 1000
    return this.completedRequests / elapsedSeconds
  }

  getAverageResponseTime(): number {
    // This would need individual response time tracking
    return 0 // Placeholder
  }

  reset(): void {
    this.startTime = performance.now()
    this.completedRequests = 0
    this.totalRequests = 0
  }
}