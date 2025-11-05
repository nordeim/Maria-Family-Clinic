/**
 * Performance Monitoring React Hooks
 * Sub-Phase 10.2: Core Web Vitals & Performance Optimization
 */

import { useEffect, useState, useCallback, useRef } from 'react'
import { getWebVitalsTracker, WebVitalsMetrics, getCurrentWebVitals, WEB_VITALS_THRESHOLDS } from '../utils/web-vitals'
import { PerformanceMonitor } from '@/lib/utils/performance-monitor'
import { getGlobalPerformanceMonitor } from '@/lib/utils/performance-monitor'

// Web Vitals Hook
export function useWebVitals() {
  const [metrics, setMetrics] = useState<WebVitalsMetrics | null>(null)
  const [score, setScore] = useState<'good' | 'needs-improvement' | 'poor'>('good')

  useEffect(() => {
    const tracker = getWebVitalsTracker()
    
    const updateMetrics = (newMetrics: WebVitalsMetrics) => {
      setMetrics(newMetrics)
      setScore(tracker.getOverallScore())
    }

    tracker.onUpdate(updateMetrics)
    
    // Initial metrics
    setMetrics(tracker.getMetrics())
    setScore(tracker.getOverallScore())

    return () => {
      // Cleanup is handled by tracker.destroy()
    }
  }, [])

  return {
    metrics,
    score,
    isLoading: !metrics,
    lcpScore: metrics ? getWebVitalsTracker().getScore('lcp') : 'good',
    fidScore: metrics ? getWebVitalsTracker().getScore('fid') : 'good',
    clsScore: metrics ? getWebVitalsTracker().getScore('cls') : 'good',
  }
}

// Performance Monitor Hook
export function usePerformanceMonitor(options?: Parameters<typeof PerformanceMonitor>[0]) {
  const [metrics, setMetrics] = useState<any>(null)
  const monitorRef = useRef<PerformanceMonitor | null>(null)

  useEffect(() => {
    monitorRef.current = new PerformanceMonitor(options)
    
    const unsubscribe = monitorRef.current.onReport((newMetrics) => {
      setMetrics(newMetrics)
    })

    return () => {
      monitorRef.current?.destroy()
      unsubscribe()
    }
  }, [JSON.stringify(options)])

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
    addCustomMarker,
    monitor: monitorRef.current,
  }
}

// Bundle Size Monitoring Hook
export function useBundleSize() {
  const [bundleSizes, setBundleSizes] = useState<{
    total: number
    chunks: Array<{ name: string; size: number }>
    lastUpdated: Date | null
  }>({
    total: 0,
    chunks: [],
    lastUpdated: null,
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateBundleSizes = () => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
      
      const jsFiles = resources.filter(resource => 
        resource.name.includes('.js') && 
        !resource.name.includes('chunk') &&
        !resource.name.includes('vendor')
      )

      const chunks = resources.filter(resource => 
        resource.name.includes('chunk') || 
        resource.name.includes('vendor')
      ).map(chunk => ({
        name: chunk.name.split('/').pop() || 'unknown',
        size: chunk.transferSize || 0,
      }))

      const total = jsFiles.reduce((sum, file) => sum + (file.transferSize || 0), 0)

      setBundleSizes({
        total,
        chunks,
        lastUpdated: new Date(),
      })
    }

    // Update on load and every 30 seconds
    updateBundleSizes()
    const interval = setInterval(updateBundleSizes, 30000)

    return () => clearInterval(interval)
  }, [])

  const getBundleScore = useCallback((size: number) => {
    // Bundle size thresholds in bytes
    if (size <= 250 * 1024) return 'good' // 250KB
    if (size <= 500 * 1024) return 'needs-improvement' // 500KB
    return 'poor'
  }, [])

  return {
    ...bundleSizes,
    totalScore: getBundleScore(bundleSizes.total),
    chunkScores: bundleSizes.chunks.map(chunk => ({
      ...chunk,
      score: getBundleScore(chunk.size),
    })),
  }
}

// Memory Usage Hook
export function useMemoryUsage() {
  const [memory, setMemory] = useState<{
    used: number
    total: number
    percentage: number
    trend: 'increasing' | 'decreasing' | 'stable'
  } | null>(null)

  const previousUsageRef = useRef<number[]>([])

  useEffect(() => {
    if (typeof window === 'undefined' || !('memory' in performance)) return

    const updateMemory = () => {
      const mem = (performance as any).memory
      const used = mem.usedJSHeapSize
      const total = mem.totalJSHeapSize
      const percentage = (used / total) * 100

      // Track trend
      previousUsageRef.current.push(used)
      if (previousUsageRef.current.length > 10) {
        previousUsageRef.current.shift()
      }

      let trend: 'increasing' | 'decreasing' | 'stable' = 'stable'
      if (previousUsageRef.current.length >= 3) {
        const recent = previousUsageRef.current.slice(-3)
        if (recent[2] > recent[1] * 1.1) trend = 'increasing'
        else if (recent[2] < recent[1] * 0.9) trend = 'decreasing'
      }

      setMemory({
        used,
        total,
        percentage,
        trend,
      })
    }

    updateMemory()
    const interval = setInterval(updateMemory, 5000)

    return () => clearInterval(interval)
  }, [])

  return memory
}

// Network Quality Hook
export function useNetworkQuality() {
  const [network, setNetwork] = useState<{
    effectiveType: string | null
    downlink: number | null
    rtt: number | null
    saveData: boolean
    quality: 'excellent' | 'good' | 'fair' | 'poor'
  }>({
    effectiveType: null,
    downlink: null,
    rtt: null,
    saveData: false,
    quality: 'good',
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !('connection' in navigator)) return

    const updateNetworkInfo = () => {
      const connection = (navigator as any).connection
      
      const effectiveType = connection?.effectiveType || null
      const downlink = connection?.downlink || null
      const rtt = connection?.rtt || null
      const saveData = connection?.saveData || false

      // Determine quality
      let quality: 'excellent' | 'good' | 'fair' | 'poor' = 'good'
      if (effectiveType === '4g' && downlink && downlink > 10) quality = 'excellent'
      else if (effectiveType === '4g') quality = 'good'
      else if (effectiveType === '3g') quality = 'fair'
      else quality = 'poor'

      setNetwork({
        effectiveType,
        downlink,
        rtt,
        saveData,
        quality,
      })
    }

    updateNetworkInfo()
    
    const connection = (navigator as any).connection
    if (connection) {
      connection.addEventListener('change', updateNetworkInfo)
      return () => connection.removeEventListener('change', updateNetworkInfo)
    }
  }, [])

  return network
}

// Performance Budget Hook
export function usePerformanceBudget() {
  const [violations, setViolations] = useState<Array<{
    metric: string
    value: number
    threshold: number
    severity: 'warning' | 'error'
  }>>([])

  const budgets = {
    lcp: 1200, // 1.2s
    fid: 100, // 100ms
    cls: 0.1, // 0.1
    bundleSize: 500 * 1024, // 500KB
    memoryUsage: 50 * 1024 * 1024, // 50MB
  }

  useEffect(() => {
    const checkBudgets = () => {
      const newViolations: typeof violations = []
      const metrics = getCurrentWebVitals()

      // Check Core Web Vitals
      if (metrics.lcp > budgets.lcp) {
        newViolations.push({
          metric: 'LCP',
          value: metrics.lcp,
          threshold: budgets.lcp,
          severity: metrics.lcp > budgets.lcp * 1.5 ? 'error' : 'warning',
        })
      }

      if (metrics.fid > budgets.fid) {
        newViolations.push({
          metric: 'FID',
          value: metrics.fid,
          threshold: budgets.fid,
          severity: metrics.fid > budgets.fid * 1.5 ? 'error' : 'warning',
        })
      }

      if (metrics.cls > budgets.cls) {
        newViolations.push({
          metric: 'CLS',
          value: metrics.cls,
          threshold: budgets.cls,
          severity: metrics.cls > budgets.cls * 1.5 ? 'error' : 'warning',
        })
      }

      // Check memory usage
      if (('memory' in performance)) {
        const mem = (performance as any).memory
        if (mem.usedJSHeapSize > budgets.memoryUsage) {
          newViolations.push({
            metric: 'Memory',
            value: mem.usedJSHeapSize,
            threshold: budgets.memoryUsage,
            severity: mem.usedJSHeapSize > budgets.memoryUsage * 1.5 ? 'error' : 'warning',
          })
        }
      }

      setViolations(newViolations)
    }

    const interval = setInterval(checkBudgets, 5000)
    checkBudgets() // Initial check

    return () => clearInterval(interval)
  }, [JSON.stringify(budgets)])

  return {
    violations,
    budgets,
    hasViolations: violations.length > 0,
    hasErrors: violations.some(v => v.severity === 'error'),
  }
}

// Long Task Detection Hook
export function useLongTasks() {
  const [longTasks, setLongTasks] = useState<Array<{
    startTime: number
    duration: number
    name?: string
  }>>([])

  useEffect(() => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) { // Long task threshold
          setLongTasks(prev => [...prev.slice(-9), {
            startTime: entry.startTime,
            duration: entry.duration,
            name: entry.name,
          }])
        }
      }
    })

    try {
      observer.observe({ entryTypes: ['longtask'] })
    } catch (e) {
      console.warn('Long task monitoring not supported:', e)
    }

    return () => observer.disconnect()
  }, [])

  return longTasks
}

// Performance Mark Hook
export function usePerformanceMark() {
  const mark = useCallback((name: string) => {
    if (typeof performance !== 'undefined') {
      performance.mark(name)
      getWebVitalsTracker().addMark(name)
    }
  }, [])

  const measure = useCallback((name: string, startMark: string, endMark?: string) => {
    if (typeof performance !== 'undefined') {
      getWebVitalsTracker().addMeasure(name, startMark, endMark)
    }
  }, [])

  return { mark, measure }
}

// Component Render Performance Hook
export function useComponentPerformance(componentName: string) {
  const renderCountRef = useRef(0)
  const lastRenderTimeRef = useRef<number | null>(null)

  useEffect(() => {
    renderCountRef.current += 1
    
    const now = performance.now()
    if (lastRenderTimeRef.current !== null) {
      const renderTime = now - lastRenderTimeRef.current
      if (renderTime > 16) { // Slower than 60fps
        console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`)
      }
    }
    lastRenderTimeRef.current = now

    getWebVitalsTracker().addMark(`${componentName}-render-${renderCountRef.current}`)
  })

  return {
    renderCount: renderCountRef.current,
  }
}

export {
  WEB_VITALS_THRESHOLDS,
}
