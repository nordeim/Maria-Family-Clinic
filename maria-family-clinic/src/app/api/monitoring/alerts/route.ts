/**
 * Alert Management API Routes
 * Sub-Phase 10.6: Monitoring & Alerting Systems
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { 
  AlertRule,
  Alert,
  IncidentResponse,
  EscalationPolicy,
  NotificationChannel,
  AlertSummary
} from '@/performance/monitoring/types'

// Validation schemas
const alertRuleSchema = z.object({
  name: z.string(),
  description: z.string(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  category: z.enum([
    'performance', 'compliance', 'security', 'integration', 
    'healthcare-workflow', 'business-logic'
  ]),
  conditions: z.object({
    metric: z.string(),
    operator: z.enum(['gt', 'lt', 'eq', 'gte', 'lte']),
    threshold: z.number(),
    timeWindow: z.number().optional(),
  }),
  escalation: z.object({
    enabled: z.boolean(),
    levels: z.array(z.object({
      level: z.number(),
      delay: z.number(),
      recipients: z.array(z.string()),
      channels: z.array(z.enum(['email', 'sms', 'slack', 'teams', 'webhook'])),
    })),
  }),
  autoResolve: z.boolean().default(false),
  healthcareSpecific: z.boolean().default(false),
})

const alertSchema = z.object({
  ruleId: z.string(),
  ruleName: z.string(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  category: z.enum([
    'performance', 'compliance', 'security', 'integration', 
    'healthcare-workflow', 'business-logic'
  ]),
  title: z.string(),
  message: z.string(),
  timestamp: z.number(),
  source: z.string(),
  metric: z.string(),
  value: z.number(),
  threshold: z.number(),
  context: z.record(z.any()).optional(),
  healthcareImpact: z.string().optional(),
  actionable: z.boolean().default(true),
})

const incidentResponseSchema = z.object({
  alertId: z.string(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  type: z.string(),
  title: z.string(),
  description: z.string(),
  assignedTo: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  estimatedResolution: z.number().optional(),
})

// Store alert data in memory (in production, use database)
let alertRules: AlertRule[] = []
let activeAlerts: Alert[] = []
let alertHistory: Alert[] = []
let incidents: IncidentResponse[] = []

// Initialize default alert rules
initializeDefaultAlertRules()

// GET /api/monitoring/alerts - Get dashboard alerts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const severity = searchParams.get('severity')
    const category = searchParams.get('category')
    const status = searchParams.get('status') || 'active'
    const timeRange = searchParams.get('timeRange') || '24h'
    const limit = parseInt(searchParams.get('limit') || '50')

    // Calculate time range
    const now = Date.now()
    const timeRangeMs = {
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    }[timeRange] || 24 * 60 * 60 * 1000

    // Filter alerts by time range
    const timeFiltered = (status === 'active' ? activeAlerts : alertHistory).filter(alert => 
      now - alert.timestamp <= timeRangeMs
    )

    // Apply filters
    let filteredAlerts = timeFiltered

    if (severity) {
      filteredAlerts = filteredAlerts.filter(alert => alert.severity === severity)
    }

    if (category) {
      filteredAlerts = filteredAlerts.filter(alert => alert.category === category)
    }

    // Sort by severity and timestamp
    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
    filteredAlerts.sort((a, b) => {
      const severityDiff = (severityOrder[b.severity] - severityOrder[a.severity])
      if (severityDiff !== 0) return severityDiff
      return b.timestamp - a.timestamp
    })

    // Calculate alert summary
    const summary = calculateAlertSummary(filteredAlerts)

    return NextResponse.json({
      alerts: filteredAlerts.slice(0, limit),
      summary,
      totalAlerts: filteredAlerts.length,
      timestamp: now,
      timeRange,
    })

  } catch (error) {
    console.error('Alert management API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}

// POST /api/monitoring/alerts - Create new alert
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = alertSchema.parse(body)

    // Create alert record
    const alert: Alert = {
      ...validatedData,
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'active',
      acknowledged: false,
      resolved: false,
      acknowledgments: [],
      notifications: [],
    }

    // Add to active alerts
    activeAlerts.push(alert)

    // Check if alert should trigger incident
    if (alert.severity === 'critical' || alert.severity === 'high') {
      await createIncidentForAlert(alert)
    }

    // Process alert rule escalation
    await processEscalation(alert)

    // Send notifications
    await sendNotifications(alert)

    return NextResponse.json({
      success: true,
      alert: {
        id: alert.id,
        status: alert.status,
        incidentCreated: alert.severity === 'critical' || alert.severity === 'high',
      },
    })

  } catch (error) {
    console.error('Alert creation API error:', error)
    return NextResponse.json(
      { error: 'Invalid alert data' },
      { status: 400 }
    )
  }
}

// PUT /api/monitoring/alerts/[id]/acknowledge - Acknowledge alert
export async function PUT_acknowledge(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const alertId = searchParams.get('id')
    const body = await request.json()
    const { userId, comment } = body

    if (!alertId) {
      return NextResponse.json(
        { error: 'Alert ID required' },
        { status: 400 }
      )
    }

    const alertIndex = activeAlerts.findIndex(a => a.id === alertId)
    if (alertIndex === -1) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      )
    }

    const alert = activeAlerts[alertIndex]

    // Add acknowledgment
    alert.acknowledged = true
    alert.acknowledgments.push({
      userId,
      timestamp: Date.now(),
      comment,
    })

    return NextResponse.json({
      success: true,
      alert,
    })

  } catch (error) {
    console.error('Alert acknowledgment API error:', error)
    return NextResponse.json(
      { error: 'Failed to acknowledge alert' },
      { status: 500 }
    )
  }
}

// PUT /api/monitoring/alerts/[id]/resolve - Resolve alert
export async function PUT_resolve(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const alertId = searchParams.get('id')
    const body = await request.json()
    const { userId, resolution, autoResolved = false } = body

    if (!alertId) {
      return NextResponse.json(
        { error: 'Alert ID required' },
        { status: 400 }
      )
    }

    const alertIndex = activeAlerts.findIndex(a => a.id === alertId)
    if (alertIndex === -1) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      )
    }

    const alert = activeAlerts[alertIndex]

    // Mark as resolved
    alert.resolved = true
    alert.status = 'resolved'
    alert.resolution = {
      timestamp: Date.now(),
      userId,
      resolution,
      autoResolved,
    }

    // Move to history
    alertHistory.push(alert)
    activeAlerts.splice(alertIndex, 1)

    // Update any related incidents
    updateRelatedIncidents(alertId, 'resolved', userId, resolution)

    return NextResponse.json({
      success: true,
      alert,
    })

  } catch (error) {
    console.error('Alert resolution API error:', error)
    return NextResponse.json(
      { error: 'Failed to resolve alert' },
      { status: 500 }
    )
  }
}

// GET /api/monitoring/alerts/rules - Get alert rules
export async function GET_rules(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const healthcareOnly = searchParams.get('healthcareOnly') === 'true'

    let filteredRules = alertRules

    if (category) {
      filteredRules = filteredRules.filter(rule => rule.category === category)
    }

    if (healthcareOnly) {
      filteredRules = filteredRules.filter(rule => rule.healthcareSpecific)
    }

    return NextResponse.json({
      rules: filteredRules,
      totalRules: filteredRules.length,
      timestamp: Date.now(),
    })

  } catch (error) {
    console.error('Alert rules API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alert rules' },
      { status: 500 }
    )
  }
}

// POST /api/monitoring/alerts/rules - Create alert rule
export async function POST_rules(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = alertRuleSchema.parse(body)

    // Create alert rule
    const rule: AlertRule = {
      ...validatedData,
      id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      enabled: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastTriggered: null,
      triggerCount: 0,
    }

    alertRules.push(rule)

    return NextResponse.json({
      success: true,
      rule,
    })

  } catch (error) {
    console.error('Alert rule creation API error:', error)
    return NextResponse.json(
      { error: 'Invalid alert rule data' },
      { status: 400 }
    )
  }
}

// GET /api/monitoring/alerts/incidents - Get incidents
export async function GET_incidents(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const severity = searchParams.get('severity')
    const timeRange = searchParams.get('timeRange') || '7d'

    // Calculate time range
    const now = Date.now()
    const timeRangeMs = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    }[timeRange] || 7 * 24 * 60 * 60 * 1000

    let filteredIncidents = incidents.filter(incident => 
      now - incident.timestamp <= timeRangeMs
    )

    if (status) {
      filteredIncidents = filteredIncidents.filter(incident => incident.status === status)
    }

    if (severity) {
      filteredIncidents = filteredIncidents.filter(incident => incident.severity === severity)
    }

    // Calculate incident metrics
    const metrics = calculateIncidentMetrics(filteredIncidents)

    return NextResponse.json({
      incidents: filteredIncidents.sort((a, b) => b.timestamp - a.timestamp),
      metrics,
      timestamp: now,
    })

  } catch (error) {
    console.error('Incident management API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch incidents' },
      { status: 500 }
    )
  }
}

// POST /api/monitoring/alerts/incidents - Create incident
export async function POST_incidents(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = incidentResponseSchema.parse(body)

    // Create incident record
    const incident: IncidentResponse = {
      ...validatedData,
      id: `incident-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      status: 'open',
      assignedTo: validatedData.assignedTo || null,
      actionsTaken: [],
      resolutionTime: null,
      affectedSystems: [],
      impact: 1,
      escalationLevel: getEscalationLevel(validatedData.severity),
      healthcareWorkflows: [],
    }

    incidents.push(incident)

    // Trigger escalation if needed
    if (incident.escalationLevel > 2) {
      await triggerEscalation(incident)
    }

    return NextResponse.json({
      success: true,
      incident,
    })

  } catch (error) {
    console.error('Incident creation API error:', error)
    return NextResponse.json(
      { error: 'Invalid incident data' },
      { status: 400 }
    )
  }
}

// PUT /api/monitoring/alerts/incidents/[id] - Update incident
export async function PUT_incidents(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const incidentId = searchParams.get('id')
    const body = await request.json()
    const { status, assignedTo, actionsTaken, resolutionTime } = body

    if (!incidentId) {
      return NextResponse.json(
        { error: 'Incident ID required' },
        { status: 400 }
      )
    }

    const incidentIndex = incidents.findIndex(i => i.id === incidentId)
    if (incidentIndex === -1) {
      return NextResponse.json(
        { error: 'Incident not found' },
        { status: 404 }
      )
    }

    const incident = incidents[incidentIndex]

    // Update incident fields
    if (status) incident.status = status
    if (assignedTo) incident.assignedTo = assignedTo
    if (actionsTaken) incident.actionsTaken = [...incident.actionsTaken, ...actionsTaken]
    if (resolutionTime) incident.resolutionTime = resolutionTime

    incidents[incidentIndex] = incident

    return NextResponse.json({
      success: true,
      incident,
    })

  } catch (error) {
    console.error('Incident update API error:', error)
    return NextResponse.json(
      { error: 'Failed to update incident' },
      { status: 500 }
    )
  }
}

// Helper functions
function initializeDefaultAlertRules() {
  // Performance Alert Rules
  alertRules.push(
    {
      id: 'lcp-critical',
      name: 'Critical LCP Performance Alert',
      description: 'Triggers when Largest Contentful Paint exceeds critical threshold',
      severity: 'critical',
      category: 'performance',
      conditions: {
        metric: 'lcp',
        operator: 'gt',
        threshold: 2500,
        timeWindow: 300000, // 5 minutes
      },
      escalation: {
        enabled: true,
        levels: [
          {
            level: 1,
            delay: 0,
            recipients: ['devops@clinic.sg'],
            channels: ['email', 'slack'],
          },
          {
            level: 2,
            delay: 900000, // 15 minutes
            recipients: ['tech-lead@clinic.sg', 'devops@clinic.sg'],
            channels: ['email', 'slack', 'sms'],
          },
        ],
      },
      autoResolve: false,
      healthcareSpecific: true,
      enabled: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastTriggered: null,
      triggerCount: 0,
    },
    {
      id: 'healthcare-workflow-failure',
      name: 'Healthcare Workflow Failure',
      description: 'Triggers when critical healthcare workflow fails',
      severity: 'critical',
      category: 'healthcare-workflow',
      conditions: {
        metric: 'workflow_success_rate',
        operator: 'lt',
        threshold: 0.8,
        timeWindow: 300000,
      },
      escalation: {
        enabled: true,
        levels: [
          {
            level: 1,
            delay: 0,
            recipients: ['healthcare-ops@clinic.sg'],
            channels: ['email', 'slack', 'teams'],
          },
        ],
      },
      autoResolve: false,
      healthcareSpecific: true,
      enabled: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastTriggered: null,
      triggerCount: 0,
    },
    {
      id: 'pdpa-violation',
      name: 'PDPA Compliance Violation',
      description: 'Triggers when PDPA compliance violation detected',
      severity: 'critical',
      category: 'compliance',
      conditions: {
        metric: 'compliance_violation',
        operator: 'eq',
        threshold: 1,
        timeWindow: 0,
      },
      escalation: {
        enabled: true,
        levels: [
          {
            level: 1,
            delay: 0,
            recipients: ['privacy-officer@clinic.sg', 'legal@clinic.sg'],
            channels: ['email', 'slack'],
          },
        ],
      },
      autoResolve: false,
      healthcareSpecific: true,
      enabled: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastTriggered: null,
      triggerCount: 0,
    },
    {
      id: 'security-breach',
      name: 'Security Breach Detection',
      description: 'Triggers when security breach or unauthorized access detected',
      severity: 'critical',
      category: 'security',
      conditions: {
        metric: 'security_event',
        operator: 'eq',
        threshold: 1,
        timeWindow: 0,
      },
      escalation: {
        enabled: true,
        levels: [
          {
            level: 1,
            delay: 0,
            recipients: ['security@clinic.sg', 'it-director@clinic.sg'],
            channels: ['email', 'slack', 'sms'],
          },
        ],
      },
      autoResolve: false,
      healthcareSpecific: true,
      enabled: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastTriggered: null,
      triggerCount: 0,
    }
  )
}

function calculateAlertSummary(alerts: Alert[]): AlertSummary {
  const now = Date.now()
  const last24h = now - 24 * 60 * 60 * 1000
  const lastHour = now - 60 * 60 * 1000

  const recentAlerts = alerts.filter(alert => alert.timestamp > lastHour)
  const dayAlerts = alerts.filter(alert => alert.timestamp > last24h)

  // Count by severity
  const bySeverity = alerts.reduce((acc, alert) => {
    acc[alert.severity] = (acc[alert.severity] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Count by category
  const byCategory = alerts.reduce((acc, alert) => {
    acc[alert.category] = (acc[alert.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Healthcare-specific alerts
  const healthcareAlerts = alerts.filter(alert => 
    alert.category === 'healthcare-workflow' || 
    alert.category === 'compliance' ||
    alert.healthcareImpact
  )

  return {
    total: alerts.length,
    critical: bySeverity.critical || 0,
    high: bySeverity.high || 0,
    medium: bySeverity.medium || 0,
    low: bySeverity.low || 0,
    healthcareSpecific: healthcareAlerts.length,
    last24h: dayAlerts.length,
    lastHour: recentAlerts.length,
    byCategory,
    trends: calculateAlertTrends(alerts),
    responseTime: calculateResponseTime(alerts),
  }
}

function calculateAlertTrends(alerts: Alert[]) {
  const now = Date.now()
  const last24h = now - 24 * 60 * 60 * 1000
  const previous24h = now - 48 * 60 * 60 * 1000

  const recent = alerts.filter(a => a.timestamp > last24h)
  const previous = alerts.filter(a => a.timestamp > previous24h && a.timestamp <= last24h)

  const recentCount = recent.length
  const previousCount = previous.length

  let trend = 'stable'
  if (recentCount > previousCount * 1.2) trend = 'increasing'
  else if (recentCount < previousCount * 0.8) trend = 'decreasing'

  return {
    trend,
    change: previousCount > 0 ? ((recentCount - previousCount) / previousCount) * 100 : 0,
  }
}

function calculateResponseTime(alerts: Alert[]) {
  const resolvedAlerts = alerts.filter(alert => alert.resolved && alert.resolution)
  
  if (resolvedAlerts.length === 0) return 0

  const totalResponseTime = resolvedAlerts.reduce((sum, alert) => {
    if (alert.resolution) {
      return sum + (alert.resolution.timestamp - alert.timestamp)
    }
    return sum
  }, 0)

  return Math.round(totalResponseTime / resolvedAlerts.length / (1000 * 60)) // Convert to minutes
}

async function createIncidentForAlert(alert: Alert) {
  const incident: IncidentResponse = {
    id: `auto-incident-${alert.id}`,
    alertId: alert.id,
    timestamp: Date.now(),
    severity: alert.severity,
    type: 'automated_incident',
    title: `Incident: ${alert.title}`,
    description: `Auto-generated incident for alert: ${alert.message}`,
    status: 'open',
    assignedTo: null,
    actionsTaken: [],
    resolutionTime: null,
    affectedSystems: [alert.source],
    impact: calculateAlertImpact(alert),
    escalationLevel: getEscalationLevel(alert.severity),
    healthcareWorkflows: alert.healthcareImpact ? [alert.healthcareImpact] : [],
  }

  incidents.push(incident)
}

async function processEscalation(alert: Alert) {
  const rule = alertRules.find(r => r.id === alert.ruleId)
  if (!rule || !rule.escalation.enabled) return

  // Process escalation levels
  for (const level of rule.escalation.levels) {
    setTimeout(async () => {
      // Check if alert is still active
      if (alert.status === 'resolved') return

      // Send escalation notification
      await sendEscalationNotification(alert, level)
    }, level.delay)
  }
}

async function sendNotifications(alert: Alert) {
  // In a real implementation, this would send actual notifications
  console.log('Sending notifications for alert:', alert.id, alert.title)
  
  alert.notifications.push({
    timestamp: Date.now(),
    channel: 'webhook', // Example
    status: 'sent',
    recipient: 'system',
  })
}

async function sendEscalationNotification(alert: Alert, level: any) {
  console.log(`Escalating alert ${alert.id} to level ${level.level}`, level.recipients)
  
  alert.notifications.push({
    timestamp: Date.now(),
    channel: 'escalation',
    status: 'sent',
    recipient: level.recipients.join(','),
  })
}

function updateRelatedIncidents(alertId: string, status: string, userId?: string, resolution?: string) {
  incidents.forEach(incident => {
    if (incident.alertId === alertId) {
      incident.status = status === 'resolved' ? 'closed' : status
      if (resolution) {
        incident.actionsTaken.push(`Resolved by ${userId}: ${resolution}`)
      }
    }
  })
}

function getEscalationLevel(severity: string): number {
  switch (severity) {
    case 'critical': return 3
    case 'high': return 2
    case 'medium': return 1
    default: return 0
  }
}

function calculateAlertImpact(alert: Alert): number {
  let impact = 1

  if (alert.severity === 'critical') impact = 5
  else if (alert.severity === 'high') impact = 3
  else if (alert.severity === 'medium') impact = 2

  // Healthcare specific impact multipliers
  if (alert.category === 'healthcare-workflow') impact *= 1.5
  if (alert.category === 'compliance') impact *= 2
  if (alert.category === 'security') impact *= 2

  return Math.round(impact)
}

async function triggerEscalation(incident: IncidentResponse) {
  console.log('Triggering escalation for incident:', incident.id)
  // In a real implementation, this would send escalations to management
}

function calculateIncidentMetrics(incidents: IncidentResponse[]) {
  const now = Date.now()
  const last24h = now - 24 * 60 * 60 * 1000

  const recentIncidents = incidents.filter(i => i.timestamp > last24h)
  const resolvedIncidents = incidents.filter(i => i.status === 'closed')
  const criticalIncidents = incidents.filter(i => i.severity === 'critical')

  // Calculate average resolution time
  const resolvedWithTime = resolvedIncidents.filter(i => i.resolutionTime)
  const avgResolutionTime = resolvedWithTime.length > 0
    ? resolvedWithTime.reduce((sum, i) => sum + (i.resolutionTime! - i.timestamp), 0) / resolvedWithTime.length
    : 0

  return {
    total: incidents.length,
    active: incidents.filter(i => i.status === 'open').length,
    resolved: resolvedIncidents.length,
    critical: criticalIncidents.length,
    last24h: recentIncidents.length,
    avgResolutionTime: Math.round(avgResolutionTime / (1000 * 60)), // Convert to minutes
    escalationRate: incidents.length > 0 
      ? (incidents.filter(i => i.escalationLevel > 1).length / incidents.length) * 100 
      : 0,
  }
}