/**
 * Performance Monitoring Integration Examples
 * Sub-Phase 10.2: Core Web Vitals & Performance Optimization
 * Demonstrates how to integrate performance monitoring into healthcare workflows
 */

import React from 'react'
import {
  PerformanceMonitoringDashboard,
  CoreWebVitalsTracker,
  PerformanceBudgetMonitor,
  BundleAnalyzer,
  ImageOptimizationService,
  LongTaskDetector,
  MemoryUsageMonitor,
  NetworkQualityIndicator,
  useWebVitals,
  usePerformanceMonitoring,
  useBundleSize,
  useImageOptimization,
  usePerformanceBudget,
  PerformanceBudget,
  WebVitalsData
} from './index'
import { PerformanceCacheService } from './services/PerformanceCacheService'

// Example 1: Basic Performance Monitoring Setup
export function BasicPerformanceMonitoring() {
  const { webVitals, isLoading } = useWebVitals({
    enableTracking: true,
    endpoint: '/api/performance/web-vitals',
    batchSize: 10,
    batchTimeout: 5000
  })

  return (
    <div className="performance-monitoring">
      <h2>Performance Metrics</h2>
      {isLoading ? (
        <div>Loading performance data...</div>
      ) : (
        <CoreWebVitalsTracker vitals={webVitals} />
      )}
    </div>
  )
}

// Example 2: Comprehensive Performance Dashboard
export function HealthcarePerformanceDashboard() {
  const { 
    webVitals, 
    bundleSize, 
    memoryUsage, 
    networkQuality 
  } = usePerformanceMonitoring({
    enableBundleAnalysis: true,
    enableMemoryMonitoring: true,
    enableNetworkMonitoring: true,
    updateInterval: 5000
  })

  // Healthcare-specific performance budgets
  const budgets: PerformanceBudget[] = [
    {
      id: 'lcp-healthcare',
      name: 'Healthcare LCP Budget',
      metric: 'lcp',
      threshold: 1200, // 1.2s target
      unit: 'ms',
      enabled: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: 'fid-healthcare',
      name: 'Healthcare FID Budget',
      metric: 'fid',
      threshold: 100, // 100ms target
      unit: 'ms',
      enabled: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: 'cls-healthcare',
      name: 'Healthcare CLS Budget',
      metric: 'cls',
      threshold: 0.1, // 0.1 target
      unit: 'score',
      enabled: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  ]

  return (
    <div className="healthcare-performance-dashboard">
      <h1>Healthcare Performance Dashboard</h1>
      
      {/* Core Web Vitals */}
      <section>
        <h2>Core Web Vitals</h2>
        <CoreWebVitalsTracker vitals={webVitals} />
      </section>

      {/* Performance Budgets */}
      <section>
        <h2>Performance Budgets</h2>
        <PerformanceBudgetMonitor budgets={budgets} />
      </section>

      {/* Bundle Analysis */}
      <section>
        <h2>Bundle Analysis</h2>
        <BundleAnalyzer 
          data={bundleSize}
          enableRecommendations={true}
          alertThreshold={500000} // 500KB
        />
      </section>

      {/* System Performance */}
      <section>
        <h2>System Performance</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <MemoryUsageMonitor 
            usage={memoryUsage}
            enableAlerts={true}
            threshold={80} // 80% memory usage
          />
          <NetworkQualityIndicator 
            quality={networkQuality}
            showRecommendations={true}
          />
        </div>
      </section>

      {/* Long Task Detection */}
      <section>
        <h2>Main Thread Performance</h2>
        <LongTaskDetector 
          threshold={50} // 50ms
          enableAlerts={true}
          onLongTask={(task) => {
            console.log('Long task detected:', task)
            // Could send to analytics
          }}
        />
      </section>
    </div>
  )
}

// Example 3: Image Optimization for Healthcare Content
export function OptimizedHealthcareImages() {
  const { 
    optimizedImages, 
    optimizationStats,
    isOptimizing 
  } = useImageOptimization({
    enableFormats: ['avif', 'webp'],
    quality: 85,
    lazyLoad: true
  })

  return (
    <div className="optimized-images">
      <h2>Optimized Healthcare Images</h2>
      
      <ImageOptimizationService
        images={[
          {
            src: '/doctor-profile.jpg',
            alt: 'Dr. Smith - Family Medicine',
            width: 400,
            height: 400,
            priority: true // Above-the-fold doctor image
          },
          {
            src: '/clinic-exterior.jpg',
            alt: 'Family Clinic Exterior',
            width: 800,
            height: 600,
            priority: false
          },
          {
            src: '/medical-equipment.jpg',
            alt: 'Modern Medical Equipment',
            width: 600,
            height: 450,
            priority: false
          }
        ]}
        formats={['avif', 'webp', 'jpeg']}
        quality={85}
        responsive={true}
        lazyLoading={true}
        priorityLoading={true}
      />

      <div className="optimization-stats">
        <h3>Optimization Statistics</h3>
        <p>Images optimized: {optimizationStats.optimizedCount}</p>
        <p>Total size saved: {Math.round(optimizationStats.totalSavings / 1024)}KB</p>
        <p>Average compression: {optimizationStats.averageCompression}%</p>
        {isOptimizing && <p>Optimizing images...</p>}
      </div>
    </div>
  )
}

// Example 4: Performance Budget Management
export function PerformanceBudgetManagement() {
  const { 
    budgets, 
    violations, 
    updateBudget,
    resetBudgets 
  } = usePerformanceBudget({
    budgets: [
      {
        id: 'lcp-critical',
        name: 'Critical LCP Budget',
        metric: 'lcp',
        threshold: 1000, // Aggressive 1s target
        unit: 'ms',
        enabled: true,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ],
    alertOnViolation: true,
    autoDisableOnViolation: false
  })

  return (
    <div className="budget-management">
      <h2>Performance Budget Management</h2>
      
      <PerformanceBudgetMonitor 
        budgets={budgets}
        showHistory={true}
        showProjections={true}
      />

      {violations.length > 0 && (
        <div className="budget-violations">
          <h3>Budget Violations</h3>
          {violations.map(violation => (
            <div key={violation.id} className="violation-alert">
              <strong>Alert:</strong> {violation.metric} exceeded budget
              <br />
              Current: {violation.currentValue} | Budget: {violation.thresholdValue}
            </div>
          ))}
        </div>
      )}

      <button onClick={() => resetBudgets()}>
        Reset All Budgets
      </button>
    </div>
  )
}

// Example 5: Healthcare Workflow Performance Tracking
export function HealthcareWorkflowPerformance() {
  const [workflowMetrics, setWorkflowMetrics] = React.useState({
    appointmentBooking: 0,
    doctorSearch: 0,
    patientRegistration: 0,
    formSubmission: 0
  })

  const trackWorkflowStep = React.useCallback((step: string, startTime: number) => {
    const duration = performance.now() - startTime
    setWorkflowMetrics(prev => ({
      ...prev,
      [step]: duration
    }))

    // Log to performance monitoring
    console.log(`Workflow step '${step}' completed in ${duration}ms`)
  }, [])

  return (
    <div className="workflow-performance">
      <h2>Healthcare Workflow Performance</h2>
      
      <div className="workflow-metrics">
        <div className="metric">
          <span>Appointment Booking:</span>
          <span>{workflowMetrics.appointmentBooking.toFixed(0)}ms</span>
        </div>
        <div className="metric">
          <span>Doctor Search:</span>
          <span>{workflowMetrics.doctorSearch.toFixed(0)}ms</span>
        </div>
        <div className="metric">
          <span>Patient Registration:</span>
          <span>{workflowMetrics.patientRegistration.toFixed(0)}ms</span>
        </div>
        <div className="metric">
          <span>Form Submission:</span>
          <span>{workflowMetrics.formSubmission.toFixed(0)}ms</span>
        </div>
      </div>

      {/* Performance Test Button */}
      <button onClick={() => {
        const startTime = performance.now()
        
        // Simulate appointment booking workflow
        setTimeout(() => {
          trackWorkflowStep('appointmentBooking', startTime)
        }, Math.random() * 500 + 100)
      }}>
        Test Appointment Booking Performance
      </button>
    </div>
  )
}

// Example 6: Complete Performance Integration
export function PerformanceProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = React.useState(false)

  React.useEffect(() => {
    const initializePerformanceMonitoring = async () => {
      try {
        // Initialize performance cache service
        const cacheService = PerformanceCacheService.getInstance()
        await cacheService.initialize()

        // Set up performance monitoring
        const { webVitals } = useWebVitals({
          enableTracking: true,
          endpoint: '/api/performance/web-vitals'
        })

        // Start monitoring long tasks
        const longTaskDetector = new LongTaskDetector({
          threshold: 50,
          enableAlerts: true
        })

        setIsInitialized(true)
        console.log('Performance monitoring initialized')
      } catch (error) {
        console.error('Failed to initialize performance monitoring:', error)
      }
    }

    initializePerformanceMonitoring()
  }, [])

  if (!isInitialized) {
    return <div>Initializing performance monitoring...</div>
  }

  return <>{children}</>
}

// Default export showing complete integration
export default function PerformanceIntegration() {
  return (
    <PerformanceProvider>
      <div className="performance-integration">
        <h1>Performance Monitoring Integration</h1>
        <p>Comprehensive performance monitoring for healthcare applications</p>
        
        {/* Navigation */}
        <nav style={{ marginBottom: '2rem' }}>
          <a href="#basic">Basic Monitoring</a> |{' '}
          <a href="#dashboard">Dashboard</a> |{' '}
          <a href="#images">Image Optimization</a> |{' '}
          <a href="#budgets">Budget Management</a> |{' '}
          <a href="#workflows">Workflow Tracking</a>
        </nav>

        {/* Integration Examples */}
        <div id="basic">
          <BasicPerformanceMonitoring />
        </div>

        <div id="dashboard">
          <HealthcarePerformanceDashboard />
        </div>

        <div id="images">
          <OptimizedHealthcareImages />
        </div>

        <div id="budgets">
          <PerformanceBudgetManagement />
        </div>

        <div id="workflows">
          <HealthcareWorkflowPerformance />
        </div>
      </div>
    </PerformanceProvider>
  )
}