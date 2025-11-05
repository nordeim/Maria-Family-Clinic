/**
 * Performance Components Index
 * Sub-Phase 10.2: Core Web Vitals & Performance Optimization
 * All performance-related components exports
 */

// Utils and Core Services
export { WebVitalsTracker } from './utils/web-vitals'
export { PerformanceCacheService } from './services/PerformanceCacheService'

// React Hooks
export {
  useWebVitals,
  usePerformanceMonitoring,
  useBundleSize,
  useImageOptimization,
  usePerformanceBudget
} from './hooks'

// Main Dashboard and Monitoring Components
export { PerformanceMonitoringDashboard } from './components/PerformanceMonitoringDashboard'
export { CoreWebVitalsTracker } from './components/CoreWebVitalsTracker'
export { PerformanceBudgetMonitor } from './components/PerformanceBudgetMonitor'

// Analysis and Optimization Components
export { BundleAnalyzer } from './components/BundleAnalyzer'
export { ImageOptimizationService } from './components/ImageOptimizationService'

// Performance Detection and Monitoring Components
export { LongTaskDetector } from './components/LongTaskDetector'
export { MemoryUsageMonitor } from './components/MemoryUsageMonitor'
export { NetworkQualityIndicator } from './components/NetworkQualityIndicator'

// Testing Components
export { PerformanceTestRunner } from './testing/PerformanceTestRunner'

// API Route Types (for client-side usage)
export type {
  WebVitalsData,
  PerformanceMetric,
  BundleAnalysisData,
  PerformanceAlert,
  PerformanceReport
} from './types'

// Default export for the performance module
export { PerformanceMonitoringDashboard as default } from './components/PerformanceMonitoringDashboard'