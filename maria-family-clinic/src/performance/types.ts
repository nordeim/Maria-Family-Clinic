/**
 * Performance Monitoring Types
 * Sub-Phase 10.2: Core Web Vitals & Performance Optimization
 * TypeScript type definitions for performance monitoring system
 */

// Core Web Vitals Types
export interface WebVitalsData {
  lcp?: number // Largest Contentful Paint (ms)
  fid?: number // First Input Delay (ms)
  cls?: number // Cumulative Layout Shift
  fcp?: number // First Contentful Paint (ms)
  ttfb?: number // Time to First Byte (ms)
  timestamp: number
  url: string
  userAgent: string
}

// Performance Metric Types
export interface PerformanceMetric {
  id: string
  name: string
  value: number
  unit: 'ms' | 's' | 'bytes' | 'score'
  threshold: number
  status: 'good' | 'needs-improvement' | 'poor'
  timestamp: number
  metadata?: Record<string, any>
}

// Bundle Analysis Types
export interface BundleAnalysisData {
  totalSize: number
  gzippedSize: number
  chunks: BundleChunk[]
  modules: BundleModule[]
  timestamp: number
  url: string
}

export interface BundleChunk {
  id: string
  name: string
  size: number
  modules: string[]
  dependencies: string[]
}

export interface BundleModule {
  id: string
  name: string
  size: number
  chunks: string[]
  isDuplicate?: boolean
}

// Performance Alert Types
export interface PerformanceAlert {
  id: string
  type: 'threshold-exceeded' | 'regression' | 'anomaly'
  severity: 'low' | 'medium' | 'high' | 'critical'
  metric: string
  currentValue: number
  thresholdValue: number
  message: string
  timestamp: number
  acknowledged: boolean
  resolvedAt?: number
}

// Performance Report Types
export interface PerformanceReport {
  id: string
  generatedAt: number
  period: {
    start: number
    end: number
  }
  summary: {
    totalMetrics: number
    averageScore: number
    criticalAlerts: number
    improvementTrend: 'improving' | 'stable' | 'degrading'
  }
  vitals: {
    lcp: PerformanceMetric
    fid: PerformanceMetric
    cls: PerformanceMetric
  }
  recommendations: string[]
}

// Performance Budget Types
export interface PerformanceBudget {
  id: string
  name: string
  metric: keyof WebVitalsData
  threshold: number
  unit: 'ms' | 's' | 'bytes' | 'score'
  enabled: boolean
  createdAt: number
  updatedAt: number
}

// Image Optimization Types
export interface ImageOptimizationConfig {
  formats: ('avif' | 'webp' | 'jpeg' | 'png')[]
  quality: number
  responsiveBreakpoints: number[]
  lazyLoading: boolean
  priorityLoading: boolean
}

// Network Quality Types
export interface NetworkQuality {
  effectiveType: '4g' | '3g' | '2g' | 'slow-2g'
  downlink: number // Mbps
  rtt: number // ms
  saveData: boolean
}

// Memory Usage Types
export interface MemoryUsage {
  used: number // bytes
  total: number // bytes
  limit?: number // bytes
  percentage: number
  timestamp: number
}

// Long Task Detection Types
export interface LongTask {
  startTime: number
  duration: number
  attribution: string[]
  type: 'long-task'
}

// Performance Observer Types
export interface PerformanceObserverConfig {
  entryTypes: string[]
  buffered?: boolean
  durationThreshold?: number
}

// Performance Monitoring Hook Types
export interface UseWebVitalsOptions {
  enableTracking?: boolean
  endpoint?: string
  batchSize?: number
  batchTimeout?: number
}

export interface UsePerformanceMonitoringOptions {
  enableBundleAnalysis?: boolean
  enableMemoryMonitoring?: boolean
  enableNetworkMonitoring?: boolean
  updateInterval?: number
}

export interface UseBundleSizeOptions {
  analyzeDependencies?: boolean
  trackDuplicates?: boolean
  alertThreshold?: number
}

export interface UseImageOptimizationOptions {
  enableFormats?: ('avif' | 'webp')[]
  quality?: number
  lazyLoad?: boolean
}

export interface UsePerformanceBudgetOptions {
  budgets: PerformanceBudget[]
  alertOnViolation?: boolean
  autoDisableOnViolation?: boolean
}

// Healthcare-specific Performance Types
export interface HealthcareWorkflowMetrics {
  appointmentBooking: number
  doctorSearch: number
  patientRegistration: number
  formSubmission: number
  pageLoad: number
  timestamp: number
}

// API Response Types
export interface PerformanceApiResponse<T = any> {
  success: boolean
  data: T
  error?: string
  timestamp: number
}

export interface PerformanceApiError {
  code: string
  message: string
  details?: Record<string, any>
}

// Export all types as default for easier importing
export default {}