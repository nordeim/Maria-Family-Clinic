"use client"

import { useCallback, useEffect, useRef, useState } from 'react'

interface PerformanceMetrics {
  // Navigation timings
  navigationStart: number
  domContentLoaded: number
  loadComplete: number
  
  // Memory usage (if available)
  usedJSHeapSize?: number
  totalJSHeapSize?: number
  
  // Network timings
  connectionType?: string
  effectiveType?: string
  downlink?: number
  
  // Long task detection
  longTasks: Array<{ startTime: number; duration: number }>
  
  // Cumulative Layout Shift
  cls: number
  
  // First Input Delay
  fid: number
  
  // Largest Contentful Paint
  lcp: number
  
  // Custom timing markers
  customMarkers: Array<{ name: string; timestamp: number }>
}

interface PerformanceMonitorOptions {
  enableLongTaskDetection?: boolean
  enableMemoryMonitoring?: boolean
  enableNetworkMonitoring?: boolean
  reportInterval?: number
  longTaskThreshold?: number
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics
  private options: Required<PerformanceMonitorOptions>
  private reportCallbacks: Array<(metrics: PerformanceMetrics) => void> = []
  private intervalId?: NodeJS.Timeout
  private observer?: PerformanceObserver
  private fidObserver?: PerformanceObserver

  constructor(options: PerformanceMonitorOptions = {}) {
    this.options = {
      enableLongTaskDetection: true,
      enableMemoryMonitoring: true,
      enableNetworkMonitoring: true,
      reportInterval: 5000, // 5 seconds
      longTaskThreshold: 50, // 50ms
      ...options
    }

    this.metrics = {
      navigationStart: 0,
      domContentLoaded: 0,
      loadComplete: 0,
      longTasks: [],
      cls: 0,
      fid: 0,
      lcp: 0,
      customMarkers: []
    }

    this.initialize()
  }

  private initialize() {
    if (typeof window === 'undefined') return

    // Record navigation timings
    this.metrics.navigationStart = performance.timing.navigationStart
    this.metrics.domContentLoaded = this.getNavigationTiming('domContentLoadedEventEnd')
    this.metrics.loadComplete = this.getNavigationTiming('loadEventEnd')

    // Monitor Long Tasks
    if (this.options.enableLongTaskDetection && 'PerformanceObserver' in window) {
      this.observeLongTasks()
    }

    // Monitor Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      this.observeLargestContentfulPaint()
    }

    // Monitor First Input Delay
    if ('PerformanceObserver' in window) {
      this.observeFirstInputDelay()
    }

    // Monitor Cumulative Layout Shift
    if ('PerformanceObserver' in window) {
      this.observeCumulativeLayoutShift()
    }

    // Start periodic reporting
    this.startPeriodicReporting()

    // Report initial metrics after a short delay
    setTimeout(() => this.report(), 1000)
  }

  private getNavigationTiming(metric: string): number {
    const timing = performance.timing
    return timing[metric as keyof typeof timing] - timing.navigationStart
  }

  private observeLongTasks() {
    try {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > this.options.longTaskThreshold) {
            this.metrics.longTasks.push({
              startTime: entry.startTime,
              duration: entry.duration
            })
          }
        }
      })
      this.observer.observe({ entryTypes: ['longtask'] })
    } catch (e) {
      console.warn('Long task monitoring not supported:', e)
    }
  }

  private observeLargestContentfulPaint() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        if (lastEntry) {
          this.metrics.lcp = lastEntry.startTime
        }
      })
      observer.observe({ entryTypes: ['largest-contentful-paint'] })
    } catch (e) {
      console.warn('LCP monitoring not supported:', e)
    }
  }

  private observeFirstInputDelay() {
    try {
      this.fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        for (const entry of entries) {
          this.metrics.fid = entry.processingStart - entry.startTime
        }
      })
      this.fidObserver.observe({ entryTypes: ['first-input'] })
    } catch (e) {
      console.warn('FID monitoring not supported:', e)
    }
  }

  private observeCumulativeLayoutShift() {
    try {
      let clsValue = 0
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value
          }
        }
        this.metrics.cls = clsValue
      })
      observer.observe({ entryTypes: ['layout-shift'] })
    } catch (e) {
      console.warn('CLS monitoring not supported:', e)
    }
  }

  private startPeriodicReporting() {
    this.intervalId = setInterval(() => {
      this.report()
    }, this.options.reportInterval)
  }

  public addCustomMarker(name: string) {
    this.metrics.customMarkers.push({
      name,
      timestamp: performance.now()
    })
  }

  public measureFunction<T>(name: string, fn: () => T): T {
    const start = performance.now()
    const result = fn()
    const end = performance.now()
    
    this.metrics.customMarkers.push({
      name: `${name} (${end - start}ms)`,
      timestamp: end
    })
    
    return result
  }

  public async measureAsyncFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now()
    try {
      const result = await fn()
      const end = performance.now()
      
      this.metrics.customMarkers.push({
        name: `${name} (${end - start}ms)`,
        timestamp: end
      })
      
      return result
    } catch (error) {
      const end = performance.now()
      
      this.metrics.customMarkers.push({
        name: `${name} ERROR (${end - start}ms)`,
        timestamp: end
      })
      
      throw error
    }
  }

  public onReport(callback: (metrics: PerformanceMetrics) => void) {
    this.reportCallbacks.push(callback)
  }

  public report() {
    // Add current memory usage if available
    if (this.options.enableMemoryMonitoring && 'memory' in performance) {
      const memory = (performance as any).memory
      this.metrics.usedJSHeapSize = memory.usedJSHeapSize
      this.metrics.totalJSHeapSize = memory.totalJSHeapSize
    }

    // Add network information if available
    if (this.options.enableNetworkMonitoring && 'connection' in navigator) {
      const connection = (navigator as any).connection
      this.metrics.connectionType = connection.effectiveType || connection.type
      this.metrics.downlink = connection.downlink
    }

    // Report to all callbacks
    this.reportCallbacks.forEach(callback => {
      try {
        callback({ ...this.metrics })
      } catch (e) {
        console.error('Performance report callback error:', e)
      }
    })
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  public reset() {
    this.metrics.longTasks = []
    this.metrics.customMarkers = []
    this.metrics.cls = 0
    this.metrics.fid = 0
    this.metrics.lcp = 0
  }

  public destroy() {
    if (this.observer) {
      this.observer.disconnect()
    }
    if (this.fidObserver) {
      this.fidObserver.disconnect()
    }
    if (this.intervalId) {
      clearInterval(this.intervalId)
    }
    this.reportCallbacks = []
  }
}

// Global performance monitor instance
let globalMonitor: PerformanceMonitor | null = null

export function getGlobalPerformanceMonitor(): PerformanceMonitor {
  if (!globalMonitor) {
    globalMonitor = new PerformanceMonitor()
  }
  return globalMonitor
}

// React hook for performance monitoring
export function usePerformanceMonitor(options?: PerformanceMonitorOptions) {
  const monitorRef = useRef<PerformanceMonitor | null>(null)
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)

  useEffect(() => {
    monitorRef.current = new PerformanceMonitor(options)
    
    const unsubscribe = monitorRef.current.onReport((newMetrics) => {
      setMetrics(newMetrics)
    })

    return () => {
      monitorRef.current?.destroy()
      unsubscribe()
    }
  }, [])

  const measureFunction = useCallback((name: string, fn: () => any) => {
    return monitorRef.current?.measureFunction(name, fn)
  }, [])

  const measureAsyncFunction = useCallback(async (name: string, fn: () => Promise<any>) => {
    return await monitorRef.current?.measureAsyncFunction(name, fn)
  }, [])

  const addCustomMarker = useCallback((name: string) => {
    monitorRef.current?.addCustomMarker(name)
  }, [])

  return {
    metrics,
    measureFunction,
    measureAsyncFunction,
    addCustomMarker
  }
}

// Performance threshold alerts
export class PerformanceAlert {
  private thresholds = {
    lcp: 2500, // Largest Contentful Paint should be under 2.5s
    fid: 100, // First Input Delay should be under 100ms
    cls: 0.1, // Cumulative Layout Shift should be under 0.1
    longTaskDuration: 50, // Long tasks should be under 50ms
    memoryUsage: 50 * 1024 * 1024, // 50MB threshold for JS heap
  }

  public checkThresholds(metrics: PerformanceMetrics): string[] {
    const alerts: string[] = []

    if (metrics.lcp > this.thresholds.lcp) {
      alerts.push(`Slow Largest Contentful Paint: ${Math.round(metrics.lcp)}ms (target: ${this.thresholds.lcp}ms)`)
    }

    if (metrics.fid > this.thresholds.fid) {
      alerts.push(`High First Input Delay: ${Math.round(metrics.fid)}ms (target: ${this.thresholds.fid}ms)`)
    }

    if (metrics.cls > this.thresholds.cls) {
      alerts.push(`High Cumulative Layout Shift: ${metrics.cls.toFixed(3)} (target: ${this.thresholds.cls})`)
    }

    const worstLongTask = metrics.longTasks[metrics.longTasks.length - 1]
    if (worstLongTask && worstLongTask.duration > this.thresholds.longTaskDuration) {
      alerts.push(`Long task detected: ${Math.round(worstLongTask.duration)}ms (target: <${this.thresholds.longTaskDuration}ms)`)
    }

    if (metrics.usedJSHeapSize && metrics.usedJSHeapSize > this.thresholds.memoryUsage) {
      alerts.push(`High memory usage: ${Math.round(metrics.usedJSHeapSize / 1024 / 1024)}MB (target: <${this.thresholds.memoryUsage / 1024 / 1024}MB)`)
    }

    return alerts
  }
}

// Utility to wrap async operations with performance monitoring
export function withPerformanceMonitoring<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  name: string,
  monitor?: PerformanceMonitor
) {
  return async (...args: T): Promise<R> => {
    const monitorToUse = monitor || getGlobalPerformanceMonitor()
    return await monitorToUse.measureAsyncFunction(name, () => fn(...args))
  }
}