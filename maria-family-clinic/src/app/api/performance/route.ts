/**
 * Performance Monitoring API Routes
 * Sub-Phase 10.2: Core Web Vitals & Performance Optimization
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Web Vitals submission schema
const webVitalsSchema = z.object({
  metric: z.string(),
  value: z.number(),
  url: z.string(),
  userAgent: z.string().optional(),
  timestamp: z.number(),
  metadata: z.object({
    page: z.string().optional(),
    userId: z.string().optional(),
    sessionId: z.string().optional(),
  }).optional(),
})

// Performance data storage (in production, this would be a database)
const performanceData: Array<{
  id: string
  timestamp: number
  metric: string
  value: number
  url: string
  userAgent?: string
  metadata?: any
}> = []

// Bundle analysis schema
const bundleAnalysisSchema = z.object({
  totalSize: z.number(),
  chunks: z.array(z.object({
    name: z.string(),
    size: z.number(),
    type: z.string(),
    url: z.string(),
  })),
  timestamp: z.number(),
  url: z.string(),
})

// Performance report schema
const performanceReportSchema = z.object({
  url: z.string(),
  timestamp: z.number(),
  webVitals: z.object({
    lcp: z.number().optional(),
    fid: z.number().optional(),
    cls: z.number().optional(),
    fcp: z.number().optional(),
    ttfb: z.number().optional(),
  }),
  metrics: z.object({
    memoryUsage: z.number().optional(),
    bundleSize: z.number().optional(),
    resourceCount: z.number().optional(),
    longTaskCount: z.number().optional(),
  }),
  score: z.enum(['good', 'needs-improvement', 'poor']),
  issues: z.array(z.string()),
  recommendations: z.array(z.string()),
})

// POST /api/performance/web-vitals
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = webVitalsSchema.parse(body)

    // Store the performance data
    const record = {
      id: `web-vitals-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: validatedData.timestamp,
      metric: validatedData.metric,
      value: validatedData.value,
      url: validatedData.url,
      userAgent: validatedData.userAgent,
      metadata: validatedData.metadata,
    }

    performanceData.push(record)

    // Keep only last 1000 records to prevent memory issues
    if (performanceData.length > 1000) {
      performanceData.splice(0, performanceData.length - 1000)
    }

    // Check for performance alerts
    const alerts = checkPerformanceAlerts(record)

    return NextResponse.json({
      success: true,
      id: record.id,
      alerts: alerts.length > 0 ? alerts : undefined,
    })

  } catch (error) {
    console.error('Web Vitals API error:', error)
    return NextResponse.json(
      { error: 'Invalid request data' },
      { status: 400 }
    )
  }
}

// GET /api/performance/web-vitals
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const metric = searchParams.get('metric')
  const url = searchParams.get('url')
  const timeRange = searchParams.get('timeRange') || '24h'
  const limit = parseInt(searchParams.get('limit') || '100')

  try {
    let filteredData = performanceData

    // Apply filters
    if (metric) {
      filteredData = filteredData.filter(record => record.metric === metric)
    }

    if (url) {
      filteredData = filteredData.filter(record => record.url.includes(url))
    }

    // Apply time range filter
    const now = Date.now()
    const timeRangeMs = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    }[timeRange] || 24 * 60 * 60 * 1000

    filteredData = filteredData.filter(record => 
      now - record.timestamp <= timeRangeMs
    )

    // Sort by timestamp descending and limit
    filteredData = filteredData
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)

    // Calculate summary statistics
    const summary = calculateSummaryStatistics(filteredData)

    return NextResponse.json({
      data: filteredData,
      summary,
      totalCount: filteredData.length,
      timeRange,
      generatedAt: Date.now(),
    })

  } catch (error) {
    console.error('Error fetching Web Vitals data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch performance data' },
      { status: 500 }
    )
  }
}

// POST /api/performance/bundle-analysis
export async function POST_bundle_analysis(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = bundleAnalysisSchema.parse(body)

    // In production, this would be stored in a database
    // For now, we'll just validate and return success

    // Check bundle size thresholds
    const sizeInKB = validatedData.totalSize / 1024
    const alerts = []

    if (sizeInKB > 750) {
      alerts.push({
        type: 'error',
        message: `Bundle size (${sizeInKB.toFixed(1)}KB) is critically large`,
        recommendation: 'Implement aggressive code splitting and remove unused dependencies',
      })
    } else if (sizeInKB > 500) {
      alerts.push({
        type: 'warning',
        message: `Bundle size (${sizeInKB.toFixed(1)}KB) exceeds recommended threshold`,
        recommendation: 'Consider optimizing bundle size',
      })
    }

    // Analyze chunk distribution
    const chunkAnalysis = analyzeChunkDistribution(validatedData.chunks)

    return NextResponse.json({
      success: true,
      analysis: {
        ...validatedData,
        alerts,
        chunkAnalysis,
        score: getBundleScore(sizeInKB),
      },
    })

  } catch (error) {
    console.error('Bundle analysis API error:', error)
    return NextResponse.json(
      { error: 'Invalid bundle analysis data' },
      { status: 400 }
    )
  }
}

// POST /api/performance/report
export async function POST_performance_report(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = performanceReportSchema.parse(body)

    // Store performance report
    const reportId = `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // In production, this would be stored in a database
    console.log('Performance report received:', {
      id: reportId,
      url: validatedData.url,
      score: validatedData.score,
      issuesCount: validatedData.issues.length,
    })

    // Generate recommendations based on issues
    const enhancedRecommendations = generateEnhancedRecommendations(
      validatedData.webVitals,
      validatedData.metrics,
      validatedData.issues
    )

    return NextResponse.json({
      success: true,
      reportId,
      recommendations: enhancedRecommendations,
      nextSteps: generateNextSteps(validatedData.score, validatedData.issues),
    })

  } catch (error) {
    console.error('Performance report API error:', error)
    return NextResponse.json(
      { error: 'Invalid performance report data' },
      { status: 400 }
    )
  }
}

// GET /api/performance/report
export async function GET_performance_report(request: NextRequest) {
  try {
    // Generate comprehensive performance report
    const report = generatePerformanceReport()

    // Set appropriate headers for file download
    const filename = `performance-report-${new Date().toISOString().slice(0, 19)}.json`
    
    return new NextResponse(JSON.stringify(report, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })

  } catch (error) {
    console.error('Error generating performance report:', error)
    return NextResponse.json(
      { error: 'Failed to generate performance report' },
      { status: 500 }
    )
  }
}

// GET /api/performance/alerts
export async function GET_performance_alerts(request: NextRequest) {
  try {
    const alerts = checkSystemWideAlerts()

    return NextResponse.json({
      alerts,
      timestamp: Date.now(),
      severity: alerts.some(a => a.severity === 'critical') ? 'critical' : 
               alerts.some(a => a.severity === 'warning') ? 'warning' : 'ok',
    })

  } catch (error) {
    console.error('Error checking performance alerts:', error)
    return NextResponse.json(
      { error: 'Failed to check performance alerts' },
      { status: 500 }
    )
  }
}

// Helper functions
function checkPerformanceAlerts(record: typeof performanceData[0]) {
  const alerts = []
  
  // Core Web Vitals thresholds
  const thresholds = {
    lcp: { good: 1200, poor: 2500 },
    fid: { good: 100, poor: 300 },
    cls: { good: 0.1, poor: 0.25 },
  }

  const threshold = thresholds[record.metric as keyof typeof thresholds]
  if (threshold) {
    if (record.value > threshold.poor) {
      alerts.push({
        type: 'critical',
        metric: record.metric,
        value: record.value,
        threshold: threshold.poor,
        message: `${record.metric} is critically high: ${record.value}`,
      })
    } else if (record.value > threshold.good) {
      alerts.push({
        type: 'warning',
        metric: record.metric,
        value: record.value,
        threshold: threshold.good,
        message: `${record.metric} needs improvement: ${record.value}`,
      })
    }
  }

  return alerts
}

function calculateSummaryStatistics(data: typeof performanceData) {
  if (data.length === 0) {
    return {
      count: 0,
      average: 0,
      min: 0,
      max: 0,
      p95: 0,
      trend: 'stable',
    }
  }

  const values = data.map(record => record.value).sort((a, b) => a - b)
  const count = values.length
  const average = values.reduce((sum, val) => sum + val, 0) / count
  const min = values[0]
  const max = values[count - 1]
  const p95 = values[Math.floor(0.95 * count)]

  // Calculate trend (simple implementation)
  const recentValues = values.slice(-10)
  const olderValues = values.slice(0, 10)
  const recentAvg = recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length
  const olderAvg = olderValues.reduce((sum, val) => sum + val, 0) / olderValues.length
  
  let trend = 'stable'
  if (recentAvg > olderAvg * 1.1) trend = 'increasing'
  else if (recentAvg < olderAvg * 0.9) trend = 'decreasing'

  return {
    count,
    average,
    min,
    max,
    p95,
    trend,
  }
}

function analyzeChunkDistribution(chunks: any[]) {
  const distribution = chunks.reduce((acc, chunk) => {
    acc[chunk.type] = (acc[chunk.type] || 0) + chunk.size
    return acc
  }, {} as Record<string, number>)

  const total = Object.values(distribution).reduce((sum, size) => sum + size, 0)

  return {
    distribution: Object.entries(distribution).map(([type, size]) => ({
      type,
      size,
      percentage: (size / total) * 100,
    })),
    totalChunks: chunks.length,
    largestChunk: chunks.reduce((largest, chunk) => 
      chunk.size > largest.size ? chunk : largest, chunks[0]
    ),
  }
}

function getBundleScore(sizeInKB: number): 'good' | 'needs-improvement' | 'poor' {
  if (sizeInKB <= 250) return 'good'
  if (sizeInKB <= 500) return 'needs-improvement'
  return 'poor'
}

function generateEnhancedRecommendations(webVitals: any, metrics: any, issues: string[]) {
  const recommendations = [...issues]

  // LCP recommendations
  if (webVitals.lcp > 1200) {
    recommendations.push('Optimize images with next/image component and AVIF/WebP formats')
    recommendations.push('Implement critical CSS inlining for above-the-fold content')
    recommendations.push('Use regional CDN for Singapore healthcare users')
  }

  // FID recommendations
  if (webVitals.fid > 100) {
    recommendations.push('Implement JavaScript code splitting and tree shaking')
    recommendations.push('Add dynamic imports for non-critical functionality')
    recommendations.push('Optimize event handlers with debouncing and throttling')
  }

  // CLS recommendations
  if (webVitals.cls > 0.1) {
    recommendations.push('Add explicit width/height to all images')
    recommendations.push('Use font-display: swap for web fonts')
    recommendations.push('Reserve space for dynamic content to prevent layout shifts')
  }

  // Memory recommendations
  if (metrics.memoryUsage > 50) {
    recommendations.push('Implement proper component cleanup and memory management')
    recommendations.push('Optimize TanStack Query caching strategies')
  }

  return recommendations
}

function generateNextSteps(score: string, issues: string[]) {
  const nextSteps = []

  if (score === 'poor' || issues.length > 3) {
    nextSteps.push('URGENT: Address critical performance issues immediately')
    nextSteps.push('Run Lighthouse CI to identify specific optimization opportunities')
  }

  if (score === 'needs-improvement') {
    nextSteps.push('Schedule performance optimization sprint')
    nextSteps.push('Implement automated performance monitoring')
  }

  nextSteps.push('Continue monitoring Core Web Vitals in production')
  nextSteps.push('Set up performance regression testing')

  return nextSteps
}

function checkSystemWideAlerts() {
  const alerts = []
  const now = Date.now()
  const recentData = performanceData.filter(record => 
    now - record.timestamp <= 60 * 60 * 1000 // Last hour
  )

  // Check for recent performance degradations
  const metricGroups = recentData.reduce((acc, record) => {
    if (!acc[record.metric]) acc[record.metric] = []
    acc[record.metric].push(record)
    return acc
  }, {} as Record<string, typeof performanceData>)

  Object.entries(metricGroups).forEach(([metric, records]) => {
    const recent = records.slice(-10) // Last 10 records
    const older = records.slice(-20, -10) // Previous 10 records
    
    if (recent.length > 0 && older.length > 0) {
      const recentAvg = recent.reduce((sum, r) => sum + r.value, 0) / recent.length
      const olderAvg = older.reduce((sum, r) => sum + r.value, 0) / older.length
      
      if (recentAvg > olderAvg * 1.2) {
        alerts.push({
          type: 'performance-degradation',
          severity: 'warning',
          metric,
          message: `${metric} performance has degraded by ${((recentAvg - olderAvg) / olderAvg * 100).toFixed(1)}%`,
          timestamp: now,
        })
      }
    }
  })

  return alerts
}

function generatePerformanceReport() {
  const now = Date.now()
  const report = {
    generatedAt: new Date(now).toISOString(),
    summary: {
      totalMetrics: performanceData.length,
      timeRange: '24h',
      averageScores: calculateAverageScores(),
      alertsCount: performanceData.filter(record => 
        now - record.timestamp <= 24 * 60 * 60 * 1000
      ).length,
    },
    webVitals: calculateWebVitalsSummary(),
    recommendations: generateSystemRecommendations(),
    health: calculateSystemHealth(),
  }

  return report
}

function calculateAverageScores() {
  const metrics = ['lcp', 'fid', 'cls']
  const scores = metrics.map(metric => {
    const data = performanceData.filter(record => record.metric === metric)
    if (data.length === 0) return { metric, score: 'unknown', average: 0 }

    const average = data.reduce((sum, record) => sum + record.value, 0) / data.length
    let score: 'good' | 'needs-improvement' | 'poor' = 'good'
    
    if (metric === 'lcp') {
      if (average > 2500) score = 'poor'
      else if (average > 1200) score = 'needs-improvement'
    } else if (metric === 'fid') {
      if (average > 300) score = 'poor'
      else if (average > 100) score = 'needs-improvement'
    } else if (metric === 'cls') {
      if (average > 0.25) score = 'poor'
      else if (average > 0.1) score = 'needs-improvement'
    }

    return { metric, score, average }
  })

  return scores
}

function calculateWebVitalsSummary() {
  const summary: Record<string, any> = {}
  
  ['lcp', 'fid', 'cls'].forEach(metric => {
    const data = performanceData.filter(record => record.metric === metric)
    if (data.length > 0) {
      summary[metric] = {
        count: data.length,
        average: data.reduce((sum, record) => sum + record.value, 0) / data.length,
        latest: data[data.length - 1].value,
        trend: calculateTrend(data.slice(-20)),
      }
    }
  })

  return summary
}

function calculateTrend(data: typeof performanceData) {
  if (data.length < 2) return 'stable'
  
  const values = data.map(record => record.value)
  const midPoint = Math.floor(values.length / 2)
  const firstHalf = values.slice(0, midPoint)
  const secondHalf = values.slice(midPoint)
  
  const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length
  
  if (secondAvg > firstAvg * 1.1) return 'degrading'
  if (secondAvg < firstAvg * 0.9) return 'improving'
  return 'stable'
}

function generateSystemRecommendations() {
  const recommendations = []
  const avgScores = calculateAverageScores()
  
  avgScores.forEach(({ metric, score, average }) => {
    if (score === 'poor' || score === 'needs-improvement') {
      recommendations.push({
        priority: score === 'poor' ? 'high' : 'medium',
        metric,
        currentValue: average,
        message: getRecommendationMessage(metric, score),
      })
    }
  })

  return recommendations
}

function getRecommendationMessage(metric: string, score: string) {
  const messages = {
    lcp: score === 'poor' 
      ? 'Optimize LCP with image compression, critical CSS inlining, and CDN optimization'
      : 'Improve LCP by optimizing largest content elements and reducing render-blocking resources',
    fid: score === 'poor'
      ? 'Reduce FID by implementing code splitting, optimizing JavaScript execution, and debouncing events'
      : 'Improve FID by optimizing event handlers and reducing main thread work',
    cls: score === 'poor'
      ? 'Fix CLS by adding dimensions to images, reserving space for dynamic content, and using font-display: swap'
      : 'Improve CLS by optimizing layout stability and content loading strategies',
  }
  
  return messages[metric as keyof typeof messages] || `Optimize ${metric.toUpperCase()} performance`
}

function calculateSystemHealth() {
  const avgScores = calculateAverageScores()
  const poorMetrics = avgScores.filter(score => score.score === 'poor').length
  const needsImprovementMetrics = avgScores.filter(score => score.score === 'needs-improvement').length
  
  let health: 'healthy' | 'degraded' | 'critical' = 'healthy'
  let score = 100
  
  if (poorMetrics > 0) {
    health = 'critical'
    score = Math.max(0, 100 - (poorMetrics * 30) - (needsImprovementMetrics * 10))
  } else if (needsImprovementMetrics > 0) {
    health = 'degraded'
    score = Math.max(70, 100 - (needsImprovementMetrics * 15))
  }

  return {
    status: health,
    score,
    issues: {
      critical: poorMetrics,
      warnings: needsImprovementMetrics,
    },
    lastChecked: Date.now(),
  }
}
