/**
 * Performance Monitoring Utility Functions
 * Sub-Phase 9.10 - Testing, Quality Assurance & Performance Optimization
 */

import type { ContactForm, Enquiry, User, Clinic, Doctor, ContactCategory, ContactAnalytics } from '@/lib/types/contact-system'

export class performanceMonitor {
  private metrics: Map<string, { values: number[], timestamps: number[], unit: string }> = new Map()
  private alerts: any[] = []
  private isRunning = false
  private monitoringInterval?: NodeJS.Timeout
  private config: any = {}
  private originalDateNow: () => number

  constructor() {
    this.originalDateNow = Date.now
  }

  async start(config: {
    metrics: string[]
    alertThresholds: {
      [key: string]: number
    }
    interval?: number
  }): Promise<void> {
    this.config = config
    this.isRunning = true
    
    // Initialize metric storage
    config.metrics.forEach(metric => {
      this.metrics.set(metric, {
        values: [],
        timestamps: [],
        unit: this.getUnitForMetric(metric),
      })
    })

    // Start monitoring interval
    this.monitoringInterval = setInterval(() => {
      this.checkThresholds()
    }, config.interval || 5000) // Default 5-second intervals

    console.log('Performance monitoring started')
  }

  private getUnitForMetric(metric: string): string {
    const unitMap: { [key: string]: string } = {
      response_time: 'ms',
      throughput: 'req/s',
      error_rate: '%',
      memory_usage: 'MB',
      cpu_usage: '%',
      response_time: 'ms',
    }
    return unitMap[metric] || 'count'
  }

  async recordMetric(metricName: string, value: number): Promise<void> {
    if (!this.metrics.has(metricName)) {
      this.metrics.set(metricName, {
        values: [],
        timestamps: [],
        unit: this.getUnitForMetric(metricName),
      })
    }
    
    const metricData = this.metrics.get(metricName)!
    metricData.values.push(value)
    metricData.timestamps.push(Date.now())

    // Keep only last 100 measurements to prevent memory issues
    if (metricData.values.length > 100) {
      metricData.values = metricData.values.slice(-100)
      metricData.timestamps = metricData.timestamps.slice(-100)
    }

    // Check immediate thresholds
    this.checkThreshold(metricName, value)
  }

  private checkThreshold(metricName: string, value: number): void {
    const thresholds = this.config.alertThresholds || {}
    
    if (thresholds[metricName] && this.shouldTriggerAlert(metricName, value, thresholds[metricName])) {
      this.alerts.push({
        id: `alert-${Date.now()}-${Math.random()}`,
        metric: metricName,
        value,
        threshold: thresholds[metricName],
        severity: this.getAlertSeverity(metricName, value, thresholds[metricName]),
        message: `${metricName} exceeded threshold: ${value} > ${thresholds[metricName]}`,
        timestamp: Date.now(),
      })

      // Keep only last 50 alerts
      if (this.alerts.length > 50) {
        this.alerts = this.alerts.slice(-50)
      }
    }
  }

  private shouldTriggerAlert(metricName: string, value: number, threshold: number): boolean {
    // Special handling for different metrics
    switch (metricName) {
      case 'response_time':
        return value > threshold
      case 'error_rate':
        return value > threshold
      case 'memory_usage':
        return value > threshold
      case 'cpu_usage':
        return value > threshold
      default:
        return value > threshold
    }
  }

  private getAlertSeverity(metricName: string, value: number, threshold: number): 'INFO' | 'WARNING' | 'CRITICAL' {
    const ratio = value / threshold
    
    if (ratio < 1.2) return 'INFO'
    if (ratio < 1.5) return 'WARNING'
    return 'CRITICAL'
  }

  private checkThresholds(): void {
    if (!this.isRunning) return

    // Check system-level metrics
    this.checkSystemMetrics()
  }

  private checkSystemMetrics(): void {
    // Check memory usage
    const memoryUsage = process.memoryUsage()
    const memoryThreshold = this.config.alertThresholds?.memory_usage || 500 * 1024 * 1024
    
    if (memoryUsage.heapUsed > memoryThreshold) {
      this.alerts.push({
        id: `alert-${Date.now()}-memory`,
        metric: 'memory_usage',
        value: memoryUsage.heapUsed,
        threshold: memoryThreshold,
        severity: memoryUsage.heapUsed > memoryThreshold * 1.5 ? 'CRITICAL' : 'WARNING',
        message: `Memory usage exceeded threshold: ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`,
        timestamp: Date.now(),
      })
    }

    // Check event loop lag
    this.checkEventLoopLag()
  }

  private checkEventLoopLag(): void {
    const start = performance.now()
    setImmediate(() => {
      const lag = performance.now() - start
      if (lag > 10) { // More than 10ms is concerning
        this.alerts.push({
          id: `alert-${Date.now()}-eventloop`,
          metric: 'event_loop_lag',
          value: lag,
          threshold: 10,
          severity: lag > 50 ? 'CRITICAL' : 'WARNING',
          message: `Event loop lag detected: ${lag.toFixed(2)}ms`,
          timestamp: Date.now(),
        })
      }
    })
  }

  async getCurrentMetrics(): Promise<any> {
    const currentMetrics: any = {}
    
    for (const [metricName, data] of this.metrics.entries()) {
      if (data.values.length === 0) continue

      const recentValues = data.values.slice(-10) // Last 10 values
      const numericValues = recentValues
      
      currentMetrics[metricName] = {
        avg: numericValues.reduce((sum, v) => sum + v, 0) / numericValues.length,
        min: Math.min(...numericValues),
        max: Math.max(...numericValues),
        latest: numericValues[numericValues.length - 1],
        count: numericValues.length,
        unit: data.unit,
      }
    }

    // Add system metrics
    const memoryUsage = process.memoryUsage()
    currentMetrics.system = {
      memory: {
        heapUsed: memoryUsage.heapUsed,
        heapTotal: memoryUsage.heapTotal,
        external: memoryUsage.external,
        rss: memoryUsage.rss,
      },
      cpu: {
        usage: process.cpuUsage(),
        loadAverage: process.platform !== 'win32' ? process.loadavg() : [0, 0, 0],
      },
    }

    return currentMetrics
  }

  async getAlerts(severity?: 'INFO' | 'WARNING' | 'CRITICAL'): Promise<any[]> {
    if (severity) {
      return this.alerts.filter(alert => alert.severity === severity)
    }
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
    for (const data of this.metrics.values()) {
      data.values.length = 0
      data.timestamps.length = 0
    }
  }

  // Health check method
  async getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy'
    checks: {
      memory: boolean
      eventLoop: boolean
      responseTime: boolean
    }
  }> {
    const checks = {
      memory: true,
      eventLoop: true,
      responseTime: true,
    }

    // Check memory health
    const memoryUsage = process.memoryUsage()
    if (memoryUsage.heapUsed > 400 * 1024 * 1024) { // 400MB
      checks.memory = false
    }

    // Check response time health
    const responseTimeData = this.metrics.get('response_time')
    if (responseTimeData && responseTimeData.values.length > 0) {
      const recentAvg = responseTimeData.values.slice(-5).reduce((sum, v) => sum + v, 0) / 5
      if (recentAvg > 200) { // 200ms threshold
        checks.responseTime = false
      }
    }

    // Determine overall health
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
    const failedChecks = Object.values(checks).filter(check => !check).length
    
    if (failedChecks === 0) {
      status = 'healthy'
    } else if (failedChecks <= 1) {
      status = 'degraded'
    } else {
      status = 'unhealthy'
    }

    return { status, checks }
  }

  // Get performance trends
  getTrends(timeWindowMinutes: number = 60): any {
    const cutoffTime = Date.now() - (timeWindowMinutes * 60 * 1000)
    const trends: any = {}

    for (const [metricName, data] of this.metrics.entries()) {
      const relevantData = data.values.filter((_, index) => 
        data.timestamps[index] >= cutoffTime
      )

      if (relevantData.length < 2) continue

      // Calculate trend
      const firstHalf = relevantData.slice(0, Math.floor(relevantData.length / 2))
      const secondHalf = relevantData.slice(Math.floor(relevantData.length / 2))
      
      const firstHalfAvg = firstHalf.reduce((sum, v) => sum + v, 0) / firstHalf.length
      const secondHalfAvg = secondHalf.reduce((sum, v) => sum + v, 0) / secondHalf.length
      
      const trend = secondHalfAvg - firstHalfAvg
      const trendDirection = trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable'

      trends[metricName] = {
        trend,
        direction: trendDirection,
        magnitude: Math.abs(trend),
        dataPoints: relevantData.length,
      }
    }

    return trends
  }

  // Benchmark comparison
  compareToBaseline(baseline: any): {
    improvement: boolean
    metrics: { [key: string]: { current: number, baseline: number, change: number, changePercent: number } }
  } {
    const currentMetrics = {}
    const comparisons: any = {}

    for (const [metricName, data] of this.metrics.entries()) {
      if (data.values.length === 0) continue
      
      const current = data.values[data.values.length - 1]
      const baselineValue = baseline[metricName]?.baseline || baseline[metricName]?.avg || baseline[metricName]
      
      if (baselineValue !== undefined) {
        const change = current - baselineValue
        const changePercent = (change / baselineValue) * 100
        
        comparisons[metricName] = {
          current,
          baseline: baselineValue,
          change,
          changePercent,
        }
      }
    }

    // Determine if overall performance improved
    const metricCount = Object.keys(comparisons).length
    const improvingMetrics = Object.values(comparisons).filter((comp: any) => {
      // Lower is better for response time, memory, error rate
      const lowerIsBetter = ['response_time', 'error_rate', 'memory_usage', 'cpu_usage']
      const metricName = Object.keys(comparisons).find(name => comparisons[name] === comp)
      return lowerIsBetter.includes(metricName!) ? comp.change < 0 : comp.change > 0
    }).length

    const improvement = improvingMetrics > metricCount / 2

    return {
      improvement,
      metrics: comparisons,
    }
  }
}

export class systemResourceMonitor {
  private metrics: any[] = []
  private isCollecting = false
  private collectionInterval?: NodeJS.Timeout

  start(intervalMs: number = 5000): void {
    this.isCollecting = true
    this.collectionInterval = setInterval(() => {
      this.collectMetrics()
    }, intervalMs)
  }

  stop(): void {
    this.isCollecting = false
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval)
    }
  }

  private collectMetrics(): void {
    if (!this.isCollecting) return

    const metrics = {
      timestamp: Date.now(),
      cpu: this.getCPUUsage(),
      memory: this.getMemoryUsage(),
      eventLoop: this.getEventLoopStats(),
      gc: this.getGCStats(),
    }

    this.metrics.push(metrics)

    // Keep only last 100 measurements
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100)
    }
  }

  private getCPUUsage(): any {
    const usage = process.cpuUsage()
    return {
      user: usage.user,
      system: usage.system,
      percent: ((usage.user + usage.system) / 100000) * 100,
    }
  }

  private getMemoryUsage(): any {
    const mem = process.memoryUsage()
    return {
      heapUsed: mem.heapUsed,
      heapTotal: mem.heapTotal,
      external: mem.external,
      rss: mem.rss,
      arrayBuffers: (mem as any).arrayBuffers || 0,
    }
  }

  private getEventLoopStats(): any {
    return {
      // These would be calculated from event loop metrics
      lag: 0, // Placeholder
      throughput: 0, // Placeholder
    }
  }

  private getGCStats(): any {
    return {
      // Garbage collection statistics would go here
      collections: 0,
      timeSpent: 0,
    }
  }

  getLatestMetrics(): any {
    return this.metrics[this.metrics.length - 1] || null
  }

  getAverageMetrics(windowSize: number = 10): any {
    const recentMetrics = this.metrics.slice(-windowSize)
    if (recentMetrics.length === 0) return null

    const averages = {
      timestamp: recentMetrics[recentMetrics.length - 1].timestamp,
      cpu: {
        percent: recentMetrics.reduce((sum, m) => sum + m.cpu.percent, 0) / recentMetrics.length,
      },
      memory: {
        heapUsed: recentMetrics.reduce((sum, m) => sum + m.memory.heapUsed, 0) / recentMetrics.length,
        heapTotal: recentMetrics.reduce((sum, m) => sum + m.memory.heapTotal, 0) / recentMetrics.length,
        rss: recentMetrics.reduce((sum, m) => sum + m.memory.rss, 0) / recentMetrics.length,
      },
    }

    return averages
  }
}

export class benchmarkSuite {
  private results: any[] = []
  private baselines: Map<string, any> = new Map()

  async runBenchmark(name: string, testFn: () => Promise<void> | void, iterations: number = 100): Promise<any> {
    const times: number[] = []
    const memorySnapshots: any[] = []

    console.log(`Running benchmark: ${name} (${iterations} iterations)`)

    for (let i = 0; i < iterations; i++) {
      const memoryBefore = process.memoryUsage()
      const startTime = performance.now()

      await testFn()

      const endTime = performance.now()
      const memoryAfter = process.memoryUsage()

      times.push(endTime - startTime)
      memorySnapshots.push({
        before: memoryBefore,
        after: memoryAfter,
        diff: {
          heapUsed: memoryAfter.heapUsed - memoryBefore.heapUsed,
          heapTotal: memoryAfter.heapTotal - memoryBefore.heapTotal,
          rss: memoryAfter.rss - memoryBefore.rss,
        }
      })

      // Add small delay between iterations
      if (i < iterations - 1) {
        await new Promise(resolve => setTimeout(resolve, 1))
      }
    }

    const result = this.calculateStats(times, memorySnapshots)
    result.name = name
    result.iterations = iterations

    this.results.push(result)
    return result
  }

  private calculateStats(times: number[], memorySnapshots: any[]): any {
    const sorted = [...times].sort((a, b) => a - b)
    const count = sorted.length

    const stats = {
      min: sorted[0],
      max: sorted[count - 1],
      avg: times.reduce((sum, time) => sum + time, 0) / count,
      median: sorted[Math.floor(count / 2)],
      p95: sorted[Math.floor(0.95 * count)],
      p99: sorted[Math.floor(0.99 * count)],
      standardDeviation: this.calculateStdDev(times),
    }

    const avgMemoryDiff = {
      heapUsed: memorySnapshots.reduce((sum, snap) => sum + snap.diff.heapUsed, 0) / memorySnapshots.length,
      heapTotal: memorySnapshots.reduce((sum, snap) => sum + snap.diff.heapTotal, 0) / memorySnapshots.length,
      rss: memorySnapshots.reduce((sum, snap) => sum + snap.diff.rss, 0) / memorySnapshots.length,
    }

    return {
      ...stats,
      memory: avgMemoryDiff,
    }
  }

  private calculateStdDev(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2))
    const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / squaredDiffs.length
    return Math.sqrt(avgSquaredDiff)
  }

  setBaseline(name: string, result: any): void {
    this.baselines.set(name, result)
  }

  getBaseline(name: string): any {
    return this.baselines.get(name)
  }

  compareToBaseline(name: string): any {
    const current = this.results.find(r => r.name === name)
    const baseline = this.getBaseline(name)
    
    if (!current || !baseline) return null

    return {
      name,
      improvement: current.avg < baseline.avg,
      avg: {
        current: current.avg,
        baseline: baseline.avg,
        change: current.avg - baseline.avg,
        changePercent: ((current.avg - baseline.avg) / baseline.avg) * 100,
      },
      p95: {
        current: current.p95,
        baseline: baseline.p95,
        change: current.p95 - baseline.p95,
        changePercent: ((current.p95 - baseline.p95) / baseline.p95) * 100,
      },
    }
  }

  getReport(): string {
    let report = 'Performance Benchmark Report\n'
    report += '============================\n\n'

    for (const result of this.results) {
      report += `${result.name}:\n`
      report += `  Average: ${result.avg.toFixed(2)}ms\n`
      report += `  P95: ${result.p95.toFixed(2)}ms\n`
      report += `  P99: ${result.p99.toFixed(2)}ms\n`
      report += `  Min: ${result.min.toFixed(2)}ms\n`
      report += `  Max: ${result.max.toFixed(2)}ms\n`
      report += `  Memory (heap): ${(result.memory.heapUsed / 1024 / 1024).toFixed(2)}MB\n`
      report += '\n'
    }

    return report
  }
}