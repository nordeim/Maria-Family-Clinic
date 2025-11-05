/**
 * Integration Monitoring API Routes
 * Sub-Phase 10.6: Monitoring & Alerting Systems
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { 
  IntegrationHealth,
  APIHealthCheck,
  ServiceDependency,
  IntegrationAlert,
  ThirdPartyServiceStatus
} from '@/performance/monitoring/types'

// Validation schemas
const integrationHealthSchema = z.object({
  timestamp: z.number(),
  serviceName: z.string(),
  serviceType: z.enum([
    'google_maps', 'healthier_sg_api', 'payment_gateway', 'insurance_verification',
    'notification_service', 'authentication_service', 'database', 'cache'
  ]),
  status: z.enum(['healthy', 'degraded', 'down', 'maintenance']),
  responseTime: z.number(),
  uptime: z.number(),
  successRate: z.number(),
  errorRate: z.number(),
  lastSuccessfulCall: z.number(),
  lastFailedCall: z.number().optional(),
  metadata: z.record(z.any()).optional(),
})

const apiCallSchema = z.object({
  timestamp: z.number(),
  serviceName: z.string(),
  endpoint: z.string(),
  method: z.string(),
  statusCode: z.number(),
  responseTime: z.number(),
  success: z.boolean(),
  errorMessage: z.string().optional(),
  requestSize: z.number().optional(),
  responseSize: z.number().optional(),
  retryCount: z.number().default(0),
  healthcareWorkflowId: z.string().optional(),
  userId: z.string().optional(),
})

const dependencySchema = z.object({
  timestamp: z.number(),
  serviceName: z.string(),
  dependencies: z.array(z.object({
    name: z.string(),
    status: z.enum(['healthy', 'degraded', 'down']),
    responseTime: z.number(),
    impact: z.enum(['none', 'degraded', 'unavailable']),
  })),
  cascadingFailure: z.boolean(),
  recoveryTime: z.number().optional(),
})

// Store integration data in memory (in production, use database)
let integrationHealth: IntegrationHealth[] = []
let apiCallLogs: APIHealthCheck[] = []
let dependencyStatus: ServiceDependency[] = []

// GET /api/monitoring/integration - Get integration health dashboard
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '24h'
    const serviceType = searchParams.get('serviceType')
    const includeDependencies = searchParams.get('includeDependencies') === 'true'

    // Calculate time range
    const now = Date.now()
    const timeRangeMs = {
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
    }[timeRange] || 24 * 60 * 60 * 1000

    // Filter integration health data
    let filteredHealth = integrationHealth.filter(health => 
      now - health.timestamp <= timeRangeMs
    )

    if (serviceType) {
      filteredHealth = filteredHealth.filter(health => 
        health.serviceType === serviceType
      )
    }

    // Filter API call logs
    let filteredCalls = apiCallLogs.filter(call => 
      now - call.timestamp <= timeRangeMs
    )

    // Calculate overall integration health
    const overallHealth = calculateOverallIntegrationHealth(filteredHealth, filteredCalls)

    // Get service status
    const serviceStatus = calculateServiceStatus(filteredHealth)

    // Check for integration alerts
    const alerts = checkIntegrationAlerts(filteredHealth, filteredCalls)

    const response: any = {
      overallHealth,
      serviceStatus,
      alerts,
      timestamp: now,
      timeRange,
    }

    if (includeDependencies) {
      response.dependencies = dependencyStatus
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Integration monitoring API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch integration data' },
      { status: 500 }
    )
  }
}

// POST /api/monitoring/integration/health - Submit integration health data
export async function POST_health(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = integrationHealthSchema.parse(body)

    // Create health record
    const healthRecord: IntegrationHealth = {
      ...validatedData,
      id: `health-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }

    integrationHealth.push(healthRecord)

    // Keep only recent records
    if (integrationHealth.length > 20000) {
      integrationHealth = integrationHealth.slice(-10000)
    }

    // Check for immediate health alerts
    const alerts = checkHealthAlerts(healthRecord)

    return NextResponse.json({
      success: true,
      id: healthRecord.id,
      alerts: alerts.length > 0 ? alerts : undefined,
    })

  } catch (error) {
    console.error('Integration health submission API error:', error)
    return NextResponse.json(
      { error: 'Invalid integration health data' },
      { status: 400 }
    )
  }
}

// POST /api/monitoring/integration/api-call - Submit API call log
export async function POST_api_call(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = apiCallSchema.parse(body)

    // Create API call record
    const callRecord: APIHealthCheck = {
      ...validatedData,
      id: `api-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }

    apiCallLogs.push(callRecord)

    // Keep only recent records
    if (apiCallLogs.length > 100000) {
      apiCallLogs = apiCallLogs.slice(-50000)
    }

    // Check for API health issues
    const issues = checkAPIHealthIssues(callRecord)

    return NextResponse.json({
      success: true,
      id: callRecord.id,
      issues: issues.length > 0 ? issues : undefined,
    })

  } catch (error) {
    console.error('API call log submission API error:', error)
    return NextResponse.json(
      { error: 'Invalid API call data' },
      { status: 400 }
    )
  }
}

// POST /api/monitoring/integration/dependencies - Submit dependency status
export async function POST_dependencies(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = dependencySchema.parse(body)

    // Create dependency record
    const dependencyRecord: ServiceDependency = {
      ...validatedData,
      id: `dep-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }

    dependencyStatus.push(dependencyRecord)

    // Keep only recent records
    if (dependencyStatus.length > 5000) {
      dependencyStatus = dependencyStatus.slice(-2500)
    }

    // Check for cascading failure alerts
    const alerts = checkCascadingFailureAlerts(dependencyRecord)

    return NextResponse.json({
      success: true,
      id: dependencyRecord.id,
      alerts: alerts.length > 0 ? alerts : undefined,
    })

  } catch (error) {
    console.error('Dependency status submission API error:', error)
    return NextResponse.json(
      { error: 'Invalid dependency data' },
      { status: 400 }
    )
  }
}

// GET /api/monitoring/integration/services - Get specific service health
export async function GET_services(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const serviceName = searchParams.get('serviceName')
    const serviceType = searchParams.get('serviceType')

    let filteredServices = integrationHealth

    if (serviceName) {
      filteredServices = filteredServices.filter(s => s.serviceName === serviceName)
    }

    if (serviceType) {
      filteredServices = filteredServices.filter(s => s.serviceType === serviceType)
    }

    // Group by service name and calculate summary
    const serviceGroups = filteredServices.reduce((acc, service) => {
      if (!acc[service.serviceName]) {
        acc[service.serviceName] = []
      }
      acc[service.serviceName].push(service)
      return acc
    }, {} as Record<string, IntegrationHealth[]>)

    const serviceSummaries = Object.entries(serviceGroups).map(([name, services]) => {
      const latest = services.sort((a, b) => b.timestamp - a.timestamp)[0]
      const avgResponseTime = services.reduce((sum, s) => sum + s.responseTime, 0) / services.length
      const avgUptime = services.reduce((sum, s) => sum + s.uptime, 0) / services.length
      const avgSuccessRate = services.reduce((sum, s) => sum + s.successRate, 0) / services.length

      return {
        serviceName: name,
        serviceType: latest.serviceType,
        currentStatus: latest.status,
        avgResponseTime: Math.round(avgResponseTime),
        avgUptime: Math.round(avgUptime * 100) / 100,
        avgSuccessRate: Math.round(avgSuccessRate * 100) / 100,
        lastHealthCheck: latest.timestamp,
      }
    })

    return NextResponse.json({
      services: serviceSummaries,
      totalServices: serviceSummaries.length,
      timestamp: Date.now(),
    })

  } catch (error) {
    console.error('Service health API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch service health data' },
      { status: 500 }
    )
  }
}

// GET /api/monitoring/integration/healthier-sg - Healthier SG API specific monitoring
export async function GET_healthier_sg(request: NextRequest) {
  try {
    const now = Date.now()
    const last24h = now - 24 * 60 * 60 * 1000

    // Filter Healthier SG API calls
    const healthierSgCalls = apiCallLogs.filter(call => 
      call.serviceName.toLowerCase().includes('healthier_sg') && 
      call.timestamp > last24h
    )

    // Calculate Healthier SG specific metrics
    const totalCalls = healthierSgCalls.length
    const successfulCalls = healthierSgCalls.filter(call => call.success).length
    const avgResponseTime = healthierSgCalls.length > 0 
      ? healthierSgCalls.reduce((sum, call) => sum + call.responseTime, 0) / healthierSgCalls.length
      : 0

    // Healthcare workflow specific metrics
    const workflowCalls = healthierSgCalls.filter(call => call.healthcareWorkflowId)
    const workflowSuccess = workflowCalls.filter(call => call.success).length

    return NextResponse.json({
      apiStatus: {
        overall: totalCalls > 0 ? (successfulCalls / totalCalls) * 100 : 0,
        responseTime: Math.round(avgResponseTime),
        uptime: calculateServiceUptime('healthier_sg_api'),
      },
      healthcareWorkflows: {
        totalCalls: workflowCalls.length,
        successRate: workflowCalls.length > 0 ? (workflowSuccess / workflowCalls.length) * 100 : 0,
        avgResponseTime: workflowCalls.length > 0 
          ? workflowCalls.reduce((sum, call) => sum + call.responseTime, 0) / workflowCalls.length 
          : 0,
      },
      endpoints: analyzeEndpointHealth(healthierSgCalls),
      timestamp: now,
    })

  } catch (error) {
    console.error('Healthier SG monitoring API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Healthier SG monitoring data' },
      { status: 500 }
    )
  }
}

// Helper functions
function calculateOverallIntegrationHealth(healthData: IntegrationHealth[], apiCalls: APIHealthCheck[]) {
  const now = Date.now()
  const lastHour = now - 60 * 60 * 1000

  // Recent API calls
  const recentCalls = apiCalls.filter(call => call.timestamp > lastHour)
  const recentHealth = healthData.filter(h => h.timestamp > lastHour)

  if (recentHealth.length === 0) {
    return {
      status: 'unknown',
      score: 0,
      totalServices: 0,
      healthyServices: 0,
      degradedServices: 0,
      downServices: 0,
    }
  }

  // Count services by status
  const statusCounts = recentHealth.reduce((acc, health) => {
    acc[health.status] = (acc[health.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const totalServices = Object.values(statusCounts).reduce((sum, count) => sum + count, 0)
  const healthyServices = statusCounts.healthy || 0
  const degradedServices = statusCounts.degraded || 0
  const downServices = statusCounts.down || 0

  // Calculate overall score
  let score = 100
  if (degradedServices > 0) score -= (degradedServices * 10)
  if (downServices > 0) score -= (downServices * 25)
  score = Math.max(0, score)

  // Determine overall status
  let status: 'healthy' | 'degraded' | 'down' = 'healthy'
  if (downServices > 0) status = 'down'
  else if (degradedServices > 0) status = 'degraded'

  // API performance metrics
  const apiMetrics = {
    totalCalls: recentCalls.length,
    successRate: recentCalls.length > 0 ? (recentCalls.filter(c => c.success).length / recentCalls.length) * 100 : 0,
    avgResponseTime: recentCalls.length > 0 
      ? recentCalls.reduce((sum, call) => sum + call.responseTime, 0) / recentCalls.length 
      : 0,
    errorRate: recentCalls.length > 0 ? (recentCalls.filter(c => !c.success).length / recentCalls.length) * 100 : 0,
  }

  return {
    status,
    score: Math.round(score),
    totalServices,
    healthyServices,
    degradedServices,
    downServices,
    apiMetrics,
    lastUpdated: now,
  }
}

function calculateServiceStatus(healthData: IntegrationHealth[]) {
  const serviceGroups = healthData.reduce((acc, health) => {
    if (!acc[health.serviceName]) {
      acc[health.serviceName] = []
    }
    acc[health.serviceName].push(health)
    return acc
  }, {} as Record<string, IntegrationHealth[]>)

  const serviceStatus = Object.entries(serviceGroups).map(([name, services]) => {
    const latest = services.sort((a, b) => b.timestamp - a.timestamp)[0]
    const recent = services.filter(s => Date.now() - s.timestamp <= 60 * 60 * 1000) // Last hour

    const avgResponseTime = recent.reduce((sum, s) => sum + s.responseTime, 0) / recent.length
    const avgUptime = recent.reduce((sum, s) => sum + s.uptime, 0) / recent.length
    const avgSuccessRate = recent.reduce((sum, s) => sum + s.successRate, 0) / recent.length

    return {
      serviceName: name,
      serviceType: latest.serviceType,
      status: latest.status,
      responseTime: Math.round(avgResponseTime),
      uptime: Math.round(avgUptime * 100) / 100,
      successRate: Math.round(avgSuccessRate * 100) / 100,
      lastCheck: latest.timestamp,
      healthcareCritical: isHealthcareCritical(latest.serviceType),
    }
  })

  return serviceStatus.sort((a, b) => {
    // Healthcare critical services first
    if (a.healthcareCritical && !b.healthcareCritical) return -1
    if (!a.healthcareCritical && b.healthcareCritical) return 1
    
    // Then by status (down > degraded > healthy)
    if (a.status !== b.status) {
      if (a.status === 'down') return -1
      if (b.status === 'down') return 1
      if (a.status === 'degraded' && b.status === 'healthy') return -1
      if (a.status === 'healthy' && b.status === 'degraded') return 1
    }
    
    return 0
  })
}

function checkIntegrationAlerts(healthData: IntegrationHealth[], apiCalls: APIHealthCheck[]): IntegrationAlert[] {
  const alerts: IntegrationAlert[] = []
  const now = Date.now()

  // Service down alerts
  healthData.filter(health => health.status === 'down').forEach(health => {
    alerts.push({
      id: `down-${health.serviceName}-${now}`,
      type: 'critical',
      category: 'service-down',
      serviceName: health.serviceName,
      serviceType: health.serviceType,
      message: `${health.serviceName} is down`,
      timestamp: now,
      severity: 'critical',
      impact: 'Service unavailable',
      healthcareImpact: isHealthcareCritical(health.serviceType) 
        ? 'Healthcare workflows may be severely impacted'
        : 'Non-critical service impact',
      estimatedResolution: null,
      autoResolve: false,
    })
  })

  // Response time degradation alerts
  healthData.filter(health => health.status === 'degraded').forEach(health => {
    alerts.push({
      id: `degraded-${health.serviceName}-${now}`,
      type: 'warning',
      category: 'performance-degradation',
      serviceName: health.serviceName,
      serviceType: health.serviceType,
      message: `${health.serviceName} response time degraded (${health.responseTime}ms)`,
      timestamp: now,
      severity: 'medium',
      impact: 'Performance degraded',
      healthcareImpact: isHealthcareCritical(health.serviceType) 
        ? 'Healthcare workflows may experience delays'
        : 'Minor impact on user experience',
      estimatedResolution: null,
      autoResolve: true,
    })
  })

  // High error rate alerts
  apiCalls.filter(call => !call.success).forEach(call => {
    // Check if this is part of a pattern
    const recentFailures = apiCalls.filter(c => 
      c.serviceName === call.serviceName && 
      !c.success && 
      now - c.timestamp <= 60 * 1000 // Last minute
    )

    if (recentFailures.length >= 3) {
      alerts.push({
        id: `errors-${call.serviceName}-${now}`,
        type: 'warning',
        category: 'high-error-rate',
        serviceName: call.serviceName,
        serviceType: 'unknown', // Would need to look up from health data
        message: `High error rate detected for ${call.serviceName} (${recentFailures.length} failures in last minute)`,
        timestamp: now,
        severity: 'high',
        impact: 'Service reliability compromised',
        healthcareImpact: 'Patient service reliability may be affected',
        estimatedResolution: null,
        autoResolve: true,
      })
    }
  })

  return alerts
}

function checkHealthAlerts(health: IntegrationHealth): IntegrationAlert[] {
  const alerts: IntegrationAlert[] = []

  if (health.status === 'down') {
    alerts.push({
      id: `immediate-down-${health.serviceName}-${health.id}`,
      type: 'critical',
      category: 'service-down',
      serviceName: health.serviceName,
      serviceType: health.serviceType,
      message: `${health.serviceName} is now down`,
      timestamp: health.timestamp,
      severity: 'critical',
      impact: 'Service completely unavailable',
      healthcareImpact: isHealthcareCritical(health.serviceType) 
        ? 'CRITICAL: Healthcare services are unavailable'
        : 'Non-critical service impact',
      estimatedResolution: null,
      autoResolve: false,
    })
  }

  if (health.responseTime > 5000 && health.status === 'degraded') {
    alerts.push({
      id: `critical-slow-${health.serviceName}-${health.id}`,
      type: 'warning',
      category: 'critical-slow-response',
      serviceName: health.serviceName,
      serviceType: health.serviceType,
      message: `${health.serviceName} response time critically slow (${health.responseTime}ms)`,
      timestamp: health.timestamp,
      severity: 'high',
      impact: 'Severely degraded performance',
      healthcareImpact: 'Healthcare workflow delays likely',
      estimatedResolution: null,
      autoResolve: true,
    })
  }

  return alerts
}

function checkAPIHealthIssues(call: APIHealthCheck): IntegrationAlert[] {
  const alerts: IntegrationAlert[] = []

  // Critical error
  if (!call.success && call.statusCode >= 500) {
    alerts.push({
      id: `server-error-${call.id}`,
      type: 'warning',
      category: 'server-error',
      serviceName: call.serviceName,
      serviceType: 'unknown',
      message: `Server error (${call.statusCode}) on ${call.endpoint}`,
      timestamp: call.timestamp,
      severity: 'high',
      impact: 'Service may be experiencing issues',
      healthcareImpact: 'Healthcare operations may be affected',
      autoResolve: call.retryCount < 2,
    })
  }

  // Slow response for healthcare workflow
  if (call.responseTime > 10000 && call.healthcareWorkflowId) {
    alerts.push({
      id: `slow-healthcare-${call.id}`,
      type: 'warning',
      category: 'slow-response',
      serviceName: call.serviceName,
      serviceType: 'unknown',
      message: `Healthcare workflow ${call.healthcareWorkflowId} experiencing slow response (${call.responseTime}ms)`,
      timestamp: call.timestamp,
      severity: 'medium',
      impact: 'Healthcare workflow delays',
      healthcareImpact: 'Patient experience may be degraded',
      autoResolve: false,
    })
  }

  return alerts
}

function checkCascadingFailureAlerts(dependency: ServiceDependency): IntegrationAlert[] {
  const alerts: IntegrationAlert[] = []

  if (dependency.cascadingFailure) {
    alerts.push({
      id: `cascading-${dependency.serviceName}-${dependency.id}`,
      type: 'critical',
      category: 'cascading-failure',
      serviceName: dependency.serviceName,
      serviceType: 'unknown',
      message: `Cascading failure detected in ${dependency.serviceName}`,
      timestamp: dependency.timestamp,
      severity: 'critical',
      impact: 'Multiple services affected',
      healthcareImpact: 'CRITICAL: Multiple healthcare services may be affected',
      estimatedResolution: dependency.recoveryTime ? new Date(dependency.timestamp + dependency.recoveryTime).toISOString() : null,
      autoResolve: false,
    })
  }

  // Check for healthcare critical dependencies down
  const healthcareCriticalDown = dependency.dependencies.filter(dep => 
    dep.impact === 'unavailable' && 
    ['healthier_sg_api', 'payment_gateway', 'notification_service'].includes(dep.name)
  )

  if (healthcareCriticalDown.length > 0) {
    alerts.push({
      id: `healthcare-down-${dependency.serviceName}-${dependency.id}`,
      type: 'critical',
      category: 'healthcare-service-down',
      serviceName: dependency.serviceName,
      serviceType: 'unknown',
      message: `Healthcare critical dependency ${healthcareCriticalDown.map(d => d.name).join(', ')} is down`,
      timestamp: dependency.timestamp,
      severity: 'critical',
      impact: 'Healthcare services unavailable',
      healthcareImpact: 'CRITICAL: Core healthcare functionality affected',
      autoResolve: false,
    })
  }

  return alerts
}

function isHealthcareCritical(serviceType: string): boolean {
  const criticalServices = [
    'healthier_sg_api',
    'payment_gateway',
    'insurance_verification',
    'notification_service',
    'authentication_service'
  ]
  return criticalServices.includes(serviceType)
}

function calculateServiceUptime(serviceName: string): number {
  const now = Date.now()
  const last24h = now - 24 * 60 * 60 * 1000

  const healthRecords = integrationHealth.filter(health => 
    health.serviceName.toLowerCase().includes(serviceName.toLowerCase()) &&
    health.timestamp > last24h
  )

  if (healthRecords.length === 0) return 100

  const uptimeRecords = healthRecords.filter(health => health.status !== 'down')
  return (uptimeRecords.length / healthRecords.length) * 100
}

function analyzeEndpointHealth(calls: APIHealthCheck[]) {
  const endpointGroups = calls.reduce((acc, call) => {
    if (!acc[call.endpoint]) {
      acc[call.endpoint] = []
    }
    acc[call.endpoint].push(call)
    return acc
  }, {} as Record<string, APIHealthCheck[]>)

  return Object.entries(endpointGroups).map(([endpoint, calls]) => {
    const totalCalls = calls.length
    const successfulCalls = calls.filter(c => c.success).length
    const avgResponseTime = calls.reduce((sum, c) => sum + c.responseTime, 0) / calls.length

    return {
      endpoint,
      totalCalls,
      successRate: totalCalls > 0 ? (successfulCalls / totalCalls) * 100 : 0,
      avgResponseTime: Math.round(avgResponseTime),
      lastUsed: Math.max(...calls.map(c => c.timestamp)),
    }
  }).sort((a, b) => b.totalCalls - a.totalCalls)
}