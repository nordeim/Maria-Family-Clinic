/**
 * Performance Monitoring API Routes
 * Sub-Phase 10.6: Monitoring & Alerting Systems
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { 
  PerformanceMetrics, 
  SystemHealthMetrics, 
  WorkflowMetrics,
  PerformanceAlert,
  TimeRange 
} from '@/performance/monitoring/types'

// Validation schemas
const performanceMetricsSchema = z.object({
  pageUrl: z.string(),
  timestamp: z.number(),
  metrics: z.object({
    lcp: z.number().optional(),
    fid: z.number().optional(),
    cls: z.number().optional(),
    fcp: z.number().optional(),
    ttfb: z.number().optional(),
  }),
  userAgent: z.string().optional(),
  sessionId: z.string(),
})

const workflowMetricsSchema = z.object({
  workflow: z.enum(['clinic-search', 'doctor-profile', 'appointment-booking', 'contact-form']),
  timestamp: z.number(),
  duration: z.number(),
  successRate: z.number(),
  steps: z.array(z.object({
    name: z.string(),
    duration: z.number(),
    success: z.boolean(),
  })),
})

// Store performance data in memory (in production, use Redis or database)
let performanceData: PerformanceMetrics[] = []
let workflowData: WorkflowMetrics[] = []

// GET /api/monitoring/performance - Get performance metrics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') as TimeRange || '24h'
    const pageUrl = searchParams.get('pageUrl')
    const limit = parseInt(searchParams.get('limit') || '100')

    // Calculate time range
    const now = Date.now()
    const timeRangeMs = {
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    }[timeRange] || 24 * 60 * 60 * 1000

    // Filter data by time range
    let filteredData = performanceData.filter(record => 
      now - record.timestamp <= timeRangeMs
    )

    // Apply page filter if specified
    if (pageUrl) {
      filteredData = filteredData.filter(record => 
        record.pageUrl.includes(pageUrl)
      )
    }

    // Sort by timestamp and limit
    filteredData = filteredData
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)

    // Calculate summary statistics
    const summary = calculatePerformanceSummary(filteredData)

    // Check for alerts
    const alerts = checkPerformanceAlerts(filteredData)

    return NextResponse.json({
      data: filteredData,
      summary,
      alerts,
      timeRange,
      generatedAt: Date.now(),
    })

  } catch (error) {
    console.error('Performance metrics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch performance metrics' },
      { status: 500 }
    )
  }
}

// POST /api/monitoring/performance - Submit performance metrics
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = performanceMetricsSchema.parse(body)

    // Create performance record
    const record: PerformanceMetrics = {
      ...validatedData,
      id: `perf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }

    performanceData.push(record)

    // Keep only recent records to prevent memory issues
    if (performanceData.length > 10000) {
      performanceData = performanceData.slice(-5000)
    }

    // Check for real-time alerts
    const alerts = checkRealtimeAlerts(record)

    return NextResponse.json({
      success: true,
      id: record.id,
      alerts: alerts.length > 0 ? alerts : undefined,
    })

  } catch (error) {
    console.error('Performance submission API error:', error)
    return NextResponse.json(
      { error: 'Invalid performance data' },
      { status: 400 }
    )
  }
}

// GET /api/monitoring/performance/workflows - Get workflow performance
export async function GET_workflows(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workflow = searchParams.get('workflow') as any
    const timeRange = searchParams.get('timeRange') as TimeRange || '24h'

    // Calculate time range
    const now = Date.now()
    const timeRangeMs = {
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    }[timeRange] || 24 * 60 * 60 * 1000

    // Filter workflow data
    let filteredWorkflows = workflowData.filter(workflow => 
      now - workflow.timestamp <= timeRangeMs
    )

    if (workflow) {
      filteredWorkflows = filteredWorkflows.filter(w => w.workflow === workflow)
    }

    // Calculate workflow summary
    const summary = calculateWorkflowSummary(filteredWorkflows)

    return NextResponse.json({
      data: filteredWorkflows,
      summary,
      timeRange,
      generatedAt: Date.now(),
    })

  } catch (error) {
    console.error('Workflow metrics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workflow metrics' },
      { status: 500 }
    )
  }
}

// POST /api/monitoring/performance/workflows - Submit workflow metrics
export async function POST_workflows(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = workflowMetricsSchema.parse(body)

    // Create workflow record
    const record: WorkflowMetrics = {
      ...validatedData,
      id: `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }

    workflowData.push(record)

    // Keep only recent records
    if (workflowData.length > 5000) {
      workflowData = workflowData.slice(-2500)
    }

    return NextResponse.json({
      success: true,
      id: record.id,
    })

  } catch (error) {
    console.error('Workflow submission API error:', error)
    return NextResponse.json(
      { error: 'Invalid workflow data' },
      { status: 400 }
    )
  }
}

// GET /api/monitoring/performance/health - Get system health metrics
export async function GET_health(request: NextRequest) {
  try {
    const healthMetrics = calculateSystemHealth()

    return NextResponse.json({
      health: healthMetrics,
      timestamp: Date.now(),
      status: healthMetrics.status === 'healthy' ? 'ok' : 
             healthMetrics.status === 'degraded' ? 'warning' : 'critical',
    })

  } catch (error) {
    console.error('System health API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch system health' },
      { status: 500 }
    )
  }
}

// Helper functions
function calculatePerformanceSummary(data: PerformanceMetrics[]) {
  if (data.length === 0) {
    return {
      count: 0,
      metrics: {
        lcp: { average: 0, p95: 0, trend: 'stable' },
        fid: { average: 0, p95: 0, trend: 'stable' },
        cls: { average: 0, p95: 0, trend: 'stable' },
        fcp: { average: 0, p95: 0, trend: 'stable' },
        ttfb: { average: 0, p95: 0, trend: 'stable' },
      },
      trend: 'stable',
    }
  }

  const metrics = data[0].metrics
  const summary: any = {
    count: data.length,
    metrics: {},
    trend: 'stable',
  }

  // Calculate metrics for each Core Web Vital
  Object.keys(metrics).forEach(metric => {
    const values = data.map(d => d.metrics[metric as keyof typeof metrics]).filter(Boolean) as number[]
    
    if (values.length > 0) {
      values.sort((a, b) => a - b)
      const average = values.reduce((sum, val) => sum + val, 0) / values.length
      const p95 = values[Math.floor(0.95 * values.length)]
      
      summary.metrics[metric] = {
        average: Math.round(average),
        p95: Math.round(p95),
        trend: calculateTrend(values),
      }
    }
  })

  // Calculate overall trend
  const recent = data.slice(0, Math.floor(data.length / 4))
  const older = data.slice(Math.floor(data.length * 3 / 4))
  
  if (recent.length > 0 && older.length > 0) {
    const recentAvg = recent.reduce((sum, d) => {
      const lcp = d.metrics.lcp || 0
      return sum + lcp
    }, 0) / recent.length
    
    const olderAvg = older.reduce((sum, d) => {
      const lcp = d.metrics.lcp || 0
      return sum + lcp
    }, 0) / older.length

    if (recentAvg > olderAvg * 1.1) summary.trend = 'degrading'
    else if (recentAvg < olderAvg * 0.9) summary.trend = 'improving'
  }

  return summary
}

function calculateWorkflowSummary(data: WorkflowMetrics[]) {
  if (data.length === 0) {
    return {
      workflows: [],
      overallSuccess: 0,
      averageDuration: 0,
      trend: 'stable',
    }
  }

  const workflowGroups = data.reduce((acc, workflow) => {
    if (!acc[workflow.workflow]) {
      acc[workflow.workflow] = []
    }
    acc[workflow.workflow].push(workflow)
    return acc
  }, {} as Record<string, WorkflowMetrics[]>)

  const summaries = Object.entries(workflowGroups).map(([name, workflows]) => {
    const avgDuration = workflows.reduce((sum, w) => sum + w.duration, 0) / workflows.length
    const avgSuccess = workflows.reduce((sum, w) => sum + w.successRate, 0) / workflows.length
    
    return {
      name,
      count: workflows.length,
      averageDuration: Math.round(avgDuration),
      successRate: Math.round(avgSuccess * 100) / 100,
      trend: calculateWorkflowTrend(workflows),
    }
  })

  const overallSuccess = summaries.reduce((sum, s) => sum + s.successRate, 0) / summaries.length
  const averageDuration = summaries.reduce((sum, s) => sum + s.averageDuration, 0) / summaries.length

  return {
    workflows: summaries,
    overallSuccess: Math.round(overallSuccess * 100) / 100,
    averageDuration: Math.round(averageDuration),
    trend: 'stable', // Calculate overall trend
  }
}

function calculateTrend(values: number[]) {
  if (values.length < 2) return 'stable'
  
  const midPoint = Math.floor(values.length / 2)
  const firstHalf = values.slice(0, midPoint)
  const secondHalf = values.slice(midPoint)
  
  const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length
  
  if (secondAvg > firstAvg * 1.1) return 'degrading'
  if (secondAvg < firstAvg * 0.9) return 'improving'
  return 'stable'
}

function calculateWorkflowTrend(data: WorkflowMetrics[]) {
  if (data.length < 2) return 'stable'
  
  const midPoint = Math.floor(data.length / 2)
  const firstHalf = data.slice(0, midPoint)
  const secondHalf = data.slice(midPoint)
  
  const firstAvg = firstHalf.reduce((sum, w) => sum + w.duration, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((sum, w) => sum + w.duration, 0) / secondHalf.length
  
  if (secondAvg > firstAvg * 1.1) return 'slowing'
  if (secondAvg < firstAvg * 0.9) return 'improving'
  return 'stable'
}

function checkPerformanceAlerts(data: PerformanceMetrics[]): PerformanceAlert[] {
  const alerts: PerformanceAlert[] = []
  const now = Date.now()
  
  // Check recent data (last hour)
  const recentData = data.filter(record => 
    now - record.timestamp <= 60 * 60 * 1000
  )

  if (recentData.length === 0) return alerts

  // LCP alerts
  const lcpValues = recentData.map(d => d.metrics.lcp).filter(Boolean) as number[]
  if (lcpValues.length > 0) {
    const avgLCP = lcpValues.reduce((sum, val) => sum + val, 0) / lcpValues.length
    
    if (avgLCP > 2500) {
      alerts.push({
        id: `lcp-critical-${Date.now()}`,
        type: 'critical',
        category: 'performance',
        title: 'Largest Contentful Paint Critical',
        message: `Average LCP ${Math.round(avgLCP)}ms exceeds critical threshold (2500ms)`,
        timestamp: now,
        metric: 'lcp',
        value: avgLCP,
        threshold: 2500,
        healthcareImpact: 'Patient journey significantly impacted',
        actionable: true,
        autoResolve: false,
      })
    } else if (avgLCP > 1200) {
      alerts.push({
        id: `lcp-warning-${Date.now()}`,
        type: 'warning',
        category: 'performance',
        title: 'Largest Contentful Paint Needs Improvement',
        message: `Average LCP ${Math.round(avgLCP)}ms exceeds good threshold (1200ms)`,
        timestamp: now,
        metric: 'lcp',
        value: avgLCP,
        threshold: 1200,
        healthcareImpact: 'Patient experience degraded',
        actionable: true,
        autoResolve: false,
      })
    }
  }

  // Workflow performance alerts
  recentData.forEach(record => {
    // Check for clinic search performance
    if (record.pageUrl.includes('doctor') && record.metrics.lcp && record.metrics.lcp > 3000) {
      alerts.push({
        id: `clinic-search-critical-${Date.now()}`,
        type: 'critical',
        category: 'healthcare-workflow',
        title: 'Clinic Search Performance Critical',
        message: 'Doctor profile loading is critically slow',
        timestamp: record.timestamp,
        metric: 'lcp',
        value: record.metrics.lcp,
        threshold: 3000,
        healthcareImpact: 'Patient doctor selection severely impacted',
        actionable: true,
        autoResolve: false,
      })
    }
  })

  return alerts
}

function checkRealtimeAlerts(record: PerformanceMetrics): PerformanceAlert[] {
  const alerts: PerformanceAlert[] = []
  const now = Date.now()

  // Check if this specific record breaches thresholds
  if (record.metrics.lcp && record.metrics.lcp > 4000) {
    alerts.push({
      id: `realtime-lcp-${record.id}`,
      type: 'critical',
      category: 'performance',
      title: 'Critical Performance Degradation',
      message: `Page ${record.pageUrl} has LCP of ${record.metrics.lcp}ms`,
      timestamp: now,
      metric: 'lcp',
      value: record.metrics.lcp,
      threshold: 4000,
      healthcareImpact: 'Healthcare workflow severely impacted',
      actionable: true,
      autoResolve: true,
    })
  }

  return alerts
}

function calculateSystemHealth() {
  const now = Date.now()
  const recentData = performanceData.filter(record => 
    now - record.timestamp <= 15 * 60 * 1000 // Last 15 minutes
  )

  let status: 'healthy' | 'degraded' | 'critical' = 'healthy'
  let score = 100

  if (recentData.length === 0) {
    status = 'degraded'
    score = 70
  } else {
    // Calculate average LCP in recent data
    const lcpValues = recentData.map(d => d.metrics.lcp).filter(Boolean) as number[]
    
    if (lcpValues.length > 0) {
      const avgLCP = lcpValues.reduce((sum, val) => sum + val, 0) / lcpValues.length
      
      if (avgLCP > 2500) {
        status = 'critical'
        score = Math.max(0, 100 - (avgLCP - 2500) / 100)
      } else if (avgLCP > 1200) {
        status = 'degraded'
        score = Math.max(70, 100 - (avgLCP - 1200) / 200 * 30)
      }
    }
  }

  return {
    status,
    score: Math.round(score),
    lastChecked: now,
    metrics: {
      responseTime: status === 'healthy' ? 'good' : status === 'degraded' ? 'degraded' : 'critical',
      throughput: 'good',
      errorRate: 'good',
      availability: 'good',
    },
    healthcare: {
      patientJourney: status,
      bookingSystem: 'good',
      searchPerformance: status,
      compliance: 'good',
    },
  }
}