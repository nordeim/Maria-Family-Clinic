/**
 * Core Web Vitals Tracking and Reporting
 * Sub-Phase 10.2: Core Web Vitals & Performance Optimization
 * Targets: LCP < 1.2s, FID < 100ms, CLS < 0.1
 */

import { getGlobalPerformanceMonitor } from '@/lib/utils/performance-monitor'

export interface WebVitalsMetrics {
  // Core Web Vitals
  lcp: number // Largest Contentful Paint
  fid: number // First Input Delay  
  cls: number // Cumulative Layout Shift
  
  // Additional metrics
  fcp: number // First Contentful Paint
  ttfb: number // Time to First Byte
  speedIndex: number
  
  // Performance marks
  marks: Array<{ name: string; timestamp: number }>
  measures: Array<{ name: string; duration: number; startTime: number }>
  
  // Custom healthcare workflow metrics
  searchComplete: number
  clinicListRendered: number
  mapLoaded: number
  contactFormInteractive: number
}

export interface WebVitalsThresholds {
  lcp: {
    good: number
    needsImprovement: number
    poor: number
  }
  fid: {
    good: number
    needsImprovement: number
    poor: number
  }
  cls: {
    good: number
    needsImprovement: number
    poor: number
  }
  fcp: {
    good: number
    needsImprovement: number
    poor: number
  }
}

export class WebVitalsTracker {
  private metrics: Partial<WebVitalsMetrics> = {}
  private listeners: Array<(metrics: WebVitalsMetrics) => void> = []
  private isTracking = false
  private observer?: PerformanceObserver

  // Core Web Vitals thresholds
  private thresholds: WebVitalsThresholds = {
    lcp: { good: 1200, needsImprovement: 2500, poor: Infinity },
    fid: { good: 100, needsImprovement: 300, poor: Infinity },
    cls: { good: 0.1, needsImprovement: 0.25, poor: Infinity },
    fcp: { good: 1800, needsImprovement: 3000, poor: Infinity },
  }

  constructor() {
    this.initializeTracking()
  }

  private initializeTracking() {
    if (typeof window === 'undefined') return

    this.isTracking = true
    this.trackNavigationTiming()
    this.trackLargestContentfulPaint()
    this.trackFirstInputDelay()
    this.trackCumulativeLayoutShift()
    this.trackFirstContentfulPaint()
    this.trackCustomHealthcareMetrics()
  }

  private trackNavigationTiming() {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const timing = performance.timing
        this.metrics.ttfb = timing.responseStart - timing.navigationStart
        
        // Mark navigation complete
        performance.mark('navigation-complete')
      }, 0)
    })
  }

  private trackLargestContentfulPaint() {
    if (!('PerformanceObserver' in window)) return

    try {
      this.observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as any
        if (lastEntry) {
          this.metrics.lcp = lastEntry.startTime
          this.reportMetric('lcp', this.metrics.lcp)
        }
      })
      this.observer.observe({ entryTypes: ['largest-contentful-paint'] })
    } catch (e) {
      console.warn('LCP tracking not supported:', e)
    }
  }

  private trackFirstInputDelay() {
    if (!('PerformanceObserver' in window)) return

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          this.metrics.fid = entry.processingStart - entry.startTime
          this.reportMetric('fid', this.metrics.fid)
        })
      })
      observer.observe({ entryTypes: ['first-input'] })
    } catch (e) {
      console.warn('FID tracking not supported:', e)
    }
  }

  private trackCumulativeLayoutShift() {
    if (!('PerformanceObserver' in window)) return

    try {
      let clsValue = 0
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutShift = entry as any
          if (!layoutShift.hadRecentInput) {
            clsValue += layoutShift.value
          }
        }
        this.metrics.cls = clsValue
        this.reportMetric('cls', this.metrics.cls)
      })
      observer.observe({ entryTypes: ['layout-shift'] })
    } catch (e) {
      console.warn('CLS tracking not supported:', e)
    }
  }

  private trackFirstContentfulPaint() {
    if (!('PerformanceObserver' in window)) return

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        for (const entry of entries) {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.fcp = entry.startTime
            this.reportMetric('fcp', this.metrics.fcp)
          }
        }
      })
      observer.observe({ entryTypes: ['paint'] })
    } catch (e) {
      console.warn('FCP tracking not supported:', e)
    }
  }

  private trackCustomHealthcareMetrics() {
    // Mark when search functionality becomes available
    document.addEventListener('DOMContentLoaded', () => {
      performance.mark('search-available')
    })

    // Mark when clinic list is rendered
    const observeClinicList = () => {
      const clinicList = document.querySelector('[data-testid="clinic-list"], .clinic-list')
      if (clinicList) {
        performance.mark('clinic-list-rendered')
      }
    }

    // Observe when clinic list appears in DOM
    const observer = new MutationObserver(() => {
      observeClinicList()
    })
    observer.observe(document.body, { childList: true, subtree: true })

    // Mark when contact form becomes interactive
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement
      if (target.closest('form, [data-testid="contact-form"]')) {
        performance.mark('contact-form-interactive')
      }
    }, { once: true })
  }

  private reportMetric(metric: string, value: number) {
    const fullMetrics = this.getMetrics()
    
    // Report to all listeners
    this.listeners.forEach(listener => {
      try {
        listener(fullMetrics)
      } catch (e) {
        console.error('Web vitals listener error:', e)
      }
    })

    // Report to external analytics if configured
    this.reportToAnalytics(metric, value)
  }

  private reportToAnalytics(metric: string, value: number) {
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
      gtag('event', 'web_vitals', {
        metric_name: metric,
        value: Math.round(value),
        event_category: 'Web Vitals',
        custom_parameter: true,
      })
    }

    // Send to custom performance endpoint
    if (typeof fetch !== 'undefined') {
      fetch('/api/performance/web-vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metric,
          value,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: Date.now(),
        }),
        keepalive: true,
      }).catch(() => {}) // Silent fail
    }
  }

  public addMark(name: string) {
    performance.mark(name)
    if (!this.metrics.marks) this.metrics.marks = []
    this.metrics.marks.push({ name, timestamp: performance.now() })
  }

  public addMeasure(name: string, startMark: string, endMark?: string) {
    if (endMark) {
      performance.measure(name, startMark, endMark)
    } else {
      performance.measure(name, startMark)
    }
    
    const measure = performance.getEntriesByName(name, 'measure')[0] as any
    if (measure) {
      if (!this.metrics.measures) this.metrics.measures = []
      this.metrics.measures.push({
        name,
        duration: measure.duration,
        startTime: measure.startTime,
      })
    }
  }

  public getMetrics(): WebVitalsMetrics {
    return {
      lcp: this.metrics.lcp || 0,
      fid: this.metrics.fid || 0,
      cls: this.metrics.cls || 0,
      fcp: this.metrics.fcp || 0,
      ttfb: this.metrics.ttfb || 0,
      speedIndex: this.metrics.speedIndex || 0,
      marks: this.metrics.marks || [],
      measures: this.metrics.measures || [],
      searchComplete: this.getMarkTime('search-available') || 0,
      clinicListRendered: this.getMarkTime('clinic-list-rendered') || 0,
      mapLoaded: this.getMarkTime('map-loaded') || 0,
      contactFormInteractive: this.getMarkTime('contact-form-interactive') || 0,
    }
  }

  private getMarkTime(name: string): number | undefined {
    const mark = this.metrics.marks?.find(m => m.name === name)
    return mark?.timestamp
  }

  public onUpdate(callback: (metrics: WebVitalsMetrics) => void) {
    this.listeners.push(callback)
  }

  public getScore(metric: keyof WebVitalsThresholds): 'good' | 'needs-improvement' | 'poor' {
    const value = (this.metrics as any)[metric]
    const threshold = this.thresholds[metric]
    
    if (value <= threshold.good) return 'good'
    if (value <= threshold.needsImprovement) return 'needs-improvement'
    return 'poor'
  }

  public getOverallScore(): 'good' | 'needs-improvement' | 'poor' {
    const scores = ['lcp', 'fid', 'cls'].map(metric => this.getScore(metric as keyof WebVitalsThresholds))
    
    if (scores.includes('poor')) return 'poor'
    if (scores.includes('needs-improvement')) return 'needs-improvement'
    return 'good'
  }

  public destroy() {
    this.isTracking = false
    this.listeners = []
    if (this.observer) {
      this.observer.disconnect()
    }
  }
}

// Global web vitals tracker instance
let globalWebVitals: WebVitalsTracker | null = null

export function getWebVitalsTracker(): WebVitalsTracker {
  if (!globalWebVitals) {
    globalWebVitals = new WebVitalsTracker()
  }
  return globalWebVitals
}

// Utility function to get current web vitals
export function getCurrentWebVitals(): WebVitalsMetrics {
  return getWebVitalsTracker().getMetrics()
}

// Export thresholds for use in components
export const WEB_VITALS_THRESHOLDS = {
  LCP: { GOOD: 1200, NEEDS_IMPROVEMENT: 2500 },
  FID: { GOOD: 100, NEEDS_IMPROVEMENT: 300 },
  CLS: { GOOD: 0.1, NEEDS_IMPROVEMENT: 0.25 },
  FCP: { GOOD: 1800, NEEDS_IMPROVEMENT: 3000 },
}
