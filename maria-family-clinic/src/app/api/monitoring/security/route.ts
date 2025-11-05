/**
 * Security Monitoring API Routes
 * Sub-Phase 10.6: Monitoring & Alerting Systems
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { 
  SecurityEvent,
  SecurityAlert,
  AnomalyDetection,
  ThreatIntelligence,
  IncidentResponse
} from '@/performance/monitoring/types'

// Validation schemas
const securityEventSchema = z.object({
  timestamp: z.number(),
  eventType: z.enum([
    'login_attempt', 'failed_login', 'suspicious_activity', 
    'data_breach', 'malware_detected', 'unauthorized_access',
    'privilege_escalation', 'data_exfiltration', 'ddos_attack'
  ]),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  source: z.object({
    ipAddress: z.string(),
    userAgent: z.string(),
    country: z.string().optional(),
    region: z.string().optional(),
    city: z.string().optional(),
  }),
  target: z.object({
    userId: z.string().optional(),
    resourceId: z.string(),
    resourceType: z.string(),
  }),
  metadata: z.record(z.any()).optional(),
  affectedRecords: z.number().optional(),
  dataClassification: z.enum(['public', 'internal', 'confidential', 'restricted']),
})

const anomalySchema = z.object({
  timestamp: z.number(),
  anomalyType: z.enum([
    'unusual_login_time', 'multiple_failed_logins', 'unusual_data_access',
    'bulk_data_download', 'unusual_geographic_access', 'privilege_escalation_attempt'
  ]),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  baseline: z.object({
    normalFrequency: z.number(),
    observedFrequency: z.number(),
    deviation: z.number(),
  }),
  context: z.object({
    userId: z.string(),
    resourceId: z.string(),
    geographicPattern: z.string().optional(),
    timePattern: z.string().optional(),
  }),
  riskScore: z.number(),
  healthcareImpact: z.string(),
})

// Store security data in memory (in production, use secure database)
let securityEvents: SecurityEvent[] = []
let anomalies: AnomalyDetection[] = []
let activeIncidents: IncidentResponse[] = []

// GET /api/monitoring/security - Get security dashboard data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '24h'
    const severity = searchParams.get('severity')
    const eventType = searchParams.get('eventType')

    // Calculate time range
    const now = Date.now()
    const timeRangeMs = {
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    }[timeRange] || 24 * 60 * 60 * 1000

    // Filter security events
    let filteredEvents = securityEvents.filter(event => 
      now - event.timestamp <= timeRangeMs
    )

    // Apply filters
    if (severity) {
      filteredEvents = filteredEvents.filter(event => event.severity === severity)
    }

    if (eventType) {
      filteredEvents = filteredEvents.filter(event => event.eventType === eventType)
    }

    // Calculate security metrics
    const metrics = calculateSecurityMetrics(filteredEvents, timeRangeMs)

    // Get current threats
    const threats = identifyCurrentThreats(filteredEvents)

    // Check for active incidents
    const incidents = activeIncidents.filter(incident => 
      incident.status === 'active'
    )

    return NextResponse.json({
      metrics,
      threats,
      incidents,
      events: filteredEvents.slice(0, 100), // Last 100 events
      timestamp: now,
      timeRange,
    })

  } catch (error) {
    console.error('Security monitoring API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch security data' },
      { status: 500 }
    )
  }
}

// POST /api/monitoring/security/events - Submit security event
export async function POST_events(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = securityEventSchema.parse(body)

    // Create security event record
    const event: SecurityEvent = {
      ...validatedData,
      id: `security-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }

    securityEvents.push(event)

    // Keep only recent records
    if (securityEvents.length > 50000) {
      securityEvents = securityEvents.slice(-25000)
    }

    // Check for immediate threats
    const threats = checkImmediateThreats(event)

    // Trigger automated responses if needed
    if (threats.length > 0) {
      await triggerAutomatedResponse(event, threats)
    }

    return NextResponse.json({
      success: true,
      id: event.id,
      threats: threats.length > 0 ? threats : undefined,
    })

  } catch (error) {
    console.error('Security event submission API error:', error)
    return NextResponse.json(
      { error: 'Invalid security event data' },
      { status: 400 }
    )
  }
}

// POST /api/monitoring/security/anomalies - Submit anomaly detection
export async function POST_anomalies(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = anomalySchema.parse(body)

    // Create anomaly record
    const anomaly: AnomalyDetection = {
      ...validatedData,
      id: `anomaly-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }

    anomalies.push(anomaly)

    // Keep only recent records
    if (anomalies.length > 10000) {
      anomalies = anomalies.slice(-5000)
    }

    // Check for critical anomalies
    const criticalAnomalies = checkCriticalAnomalies(anomaly)

    return NextResponse.json({
      success: true,
      id: anomaly.id,
      criticalAnomalies: criticalAnomalies.length > 0 ? criticalAnomalies : undefined,
    })

  } catch (error) {
    console.error('Anomaly submission API error:', error)
    return NextResponse.json(
      { error: 'Invalid anomaly data' },
      { status: 400 }
    )
  }
}

// GET /api/monitoring/security/threats - Get current threats
export async function GET_threats(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const severity = searchParams.get('severity') || 'medium'
    const timeRange = searchParams.get('timeRange') || '24h'

    const threats = identifyCurrentThreats(securityEvents, severity, timeRange)

    return NextResponse.json({
      threats,
      timestamp: Date.now(),
      totalThreats: threats.length,
    })

  } catch (error) {
    console.error('Threat intelligence API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch threat intelligence' },
      { status: 500 }
    )
  }
}

// GET /api/monitoring/security/incidents - Get incident response data
export async function GET_incidents(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let filteredIncidents = activeIncidents

    if (status) {
      filteredIncidents = filteredIncidents.filter(incident => 
        incident.status === status
      )
    }

    // Calculate incident metrics
    const metrics = calculateIncidentMetrics(filteredIncidents)

    return NextResponse.json({
      incidents: filteredIncidents.sort((a, b) => b.timestamp - a.timestamp),
      metrics,
      timestamp: Date.now(),
    })

  } catch (error) {
    console.error('Incident management API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch incident data' },
      { status: 500 }
    )
  }
}

// POST /api/monitoring/security/incidents - Create new incident
export async function POST_incidents(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventId, severity, type, title, description } = body

    const incident: IncidentResponse = {
      id: `incident-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      eventId,
      timestamp: Date.now(),
      severity,
      type,
      title,
      description,
      status: 'active',
      assignedTo: null,
      actionsTaken: [],
      resolutionTime: null,
      affectedSystems: [],
      impact: calculateIncidentImpact(eventId),
      escalationLevel: calculateEscalationLevel(severity),
    }

    activeIncidents.push(incident)

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

// PUT /api/monitoring/security/incidents/[id] - Update incident
export async function PUT_incidents(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, actionsTaken, resolutionTime } = body

    const incidentIndex = activeIncidents.findIndex(i => i.id === id)
    if (incidentIndex === -1) {
      return NextResponse.json(
        { error: 'Incident not found' },
        { status: 404 }
      )
    }

    const incident = activeIncidents[incidentIndex]

    // Update incident
    incident.status = status || incident.status
    if (actionsTaken) {
      incident.actionsTaken = [...incident.actionsTaken, ...actionsTaken]
    }
    if (resolutionTime) {
      incident.resolutionTime = resolutionTime
    }

    // Update incident record
    activeIncidents[incidentIndex] = incident

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
function calculateSecurityEvents(events: SecurityEvent[], timeRange: number) {
  const now = Date.now()
  const recentEvents = events.filter(e => now - e.timestamp <= timeRange)

  // Count by severity
  const bySeverity = recentEvents.reduce((acc, event) => {
    acc[event.severity] = (acc[event.severity] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Count by type
  const byType = recentEvents.reduce((acc, event) => {
    acc[event.eventType] = (acc[event.eventType] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Calculate attack patterns
  const attackPatterns = detectAttackPatterns(recentEvents)

  // Geographic distribution
  const geoDistribution = calculateGeographicDistribution(recentEvents)

  return {
    totalEvents: recentEvents.length,
    bySeverity,
    byType,
    attackPatterns,
    geoDistribution,
    trends: calculateSecurityTrends(recentEvents),
  }
}

function calculateSecurityMetrics(events: SecurityEvent[], timeRange: number) {
  const metrics = calculateSecurityEvents(events, timeRange)
  const now = Date.now()
  const lastHour = now - 60 * 60 * 1000

  // Recent activity (last hour)
  const recentActivity = events.filter(e => e.timestamp > lastHour)
  const criticalRecent = recentActivity.filter(e => e.severity === 'critical').length
  const highRecent = recentActivity.filter(e => e.severity === 'high').length

  // Security posture score
  const totalEvents = metrics.totalEvents
  const criticalEvents = metrics.bySeverity.critical || 0
  const highEvents = metrics.bySeverity.high || 0
  
  let postureScore = 100
  if (criticalEvents > 0) postureScore -= criticalEvents * 10
  if (highEvents > 0) postureScore -= highEvents * 3
  postureScore = Math.max(0, postureScore)

  // Healthcare-specific security metrics
  const healthcareEvents = events.filter(e => 
    e.target.resourceType.includes('patient') || 
    e.target.resourceType.includes('medical') ||
    e.target.resourceType.includes('appointment')
  )

  const dataBreachEvents = events.filter(e => e.eventType === 'data_breach').length
  const unauthorizedAccess = events.filter(e => e.eventType === 'unauthorized_access').length

  return {
    postureScore,
    recentActivity: {
      total: recentActivity.length,
      critical: criticalRecent,
      high: highRecent,
    },
    threatsDetected: {
      dataBreaches: dataBreachEvents,
      unauthorizedAccess,
      malware: events.filter(e => e.eventType === 'malware_detected').length,
      ddos: events.filter(e => e.eventType === 'ddos_attack').length,
    },
    attackVectors: metrics.attackPatterns,
    geographicRisk: metrics.geoDistribution,
    healthcareSecurity: {
      patientDataAccess: healthcareEvents.length,
      medicalRecordBreaches: dataBreachEvents,
      appointmentSystemSecurity: unauthorizedAccess,
      complianceRisk: postureScore < 80 ? 'high' : postureScore < 90 ? 'medium' : 'low',
    },
    lastUpdated: now,
  }
}

function identifyCurrentThreats(events: SecurityEvent[], minSeverity: string = 'medium', timeRange: string = '24h') {
  const now = Date.now()
  const timeRangeMs = {
    '1h': 60 * 60 * 1000,
    '6h': 6 * 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
  }[timeRange] || 24 * 60 * 60 * 1000

  const recentEvents = events.filter(e => now - e.timestamp <= timeRangeMs)
  const threatLevel = getThreatLevel(recentEvents)

  const threats = []

  // Data breach threats
  const breachEvents = recentEvents.filter(e => e.eventType === 'data_breach')
  if (breachEvents.length > 0) {
    threats.push({
      type: 'data_breach',
      level: 'critical',
      title: 'Data Breach Detected',
      description: `${breachEvents.length} data breach event(s) detected`,
      affectedRecords: breachEvents.reduce((sum, e) => sum + (e.affectedRecords || 1), 0),
      confidence: 0.95,
      indicators: breachEvents.map(e => ({ ip: e.source.ipAddress, timestamp: e.timestamp })),
    })
  }

  // DDoS threats
  const ddosEvents = recentEvents.filter(e => e.eventType === 'ddos_attack')
  if (ddosEvents.length > 0) {
    threats.push({
      type: 'ddos_attack',
      level: 'high',
      title: 'DDoS Attack Detected',
      description: `Distributed Denial of Service attack detected`,
      attackVectors: ddosEvents.length,
      confidence: 0.90,
    })
  }

  // Unauthorized access patterns
  const authEvents = recentEvents.filter(e => 
    e.eventType === 'unauthorized_access' || e.eventType === 'failed_login'
  )
  if (authEvents.length > 10) {
    threats.push({
      type: 'brute_force',
      level: 'medium',
      title: 'Brute Force Attack Pattern',
      description: `${authEvents.length} unauthorized access attempts detected`,
      attackVectors: new Set(authEvents.map(e => e.source.ipAddress)).size,
      confidence: 0.85,
    })
  }

  return threats
}

function checkImmediateThreats(event: SecurityEvent): SecurityAlert[] {
  const alerts: SecurityAlert[] = []

  // Critical event processing
  if (event.severity === 'critical') {
    alerts.push({
      id: `critical-${event.id}`,
      type: 'critical',
      category: 'security-breach',
      title: 'Critical Security Event Detected',
      message: `Critical ${event.eventType} detected from ${event.source.ipAddress}`,
      timestamp: event.timestamp,
      severity: event.severity,
      sourceIP: event.source.ipAddress,
      affectedRecords: event.affectedRecords || 1,
      dataClassification: event.dataClassification,
      autoResponse: true,
      escalationRequired: true,
    })
  }

  // Data breach detection
  if (event.eventType === 'data_breach') {
    alerts.push({
      id: `breach-${event.id}`,
      type: 'critical',
      category: 'data-breach',
      title: 'Data Breach Event Detected',
      message: `Data breach involving ${event.affectedRecords || 1} records of ${event.dataClassification} data`,
      timestamp: event.timestamp,
      severity: 'critical',
      affectedRecords: event.affectedRecords || 1,
      dataClassification: event.dataClassification,
      regulatoryImpact: 'PDPA notification required within 72 hours',
      autoResponse: true,
      escalationRequired: true,
    })
  }

  // Healthcare-specific threats
  if (event.target.resourceType.includes('patient') || event.target.resourceType.includes('medical')) {
    alerts.push({
      id: `healthcare-${event.id}`,
      type: 'high',
      category: 'healthcare-security',
      title: 'Healthcare Data Security Event',
      message: `Healthcare data ${event.eventType} detected`,
      timestamp: event.timestamp,
      severity: event.severity,
      healthcareImpact: 'Patient data protection compromised',
      regulatoryImpact: 'Healthcare compliance violations possible',
      autoResponse: event.severity === 'critical',
      escalationRequired: true,
    })
  }

  return alerts
}

function checkCriticalAnomalies(anomaly: AnomalyDetection): SecurityAlert[] {
  const alerts: SecurityAlert[] = []

  if (anomaly.riskScore > 8 || anomaly.severity === 'critical') {
    alerts.push({
      id: `anomaly-${anomaly.id}`,
      type: 'high',
      category: 'anomaly-detection',
      title: 'Critical Security Anomaly Detected',
      message: `Anomalous ${anomaly.anomalyType} behavior detected for user ${anomaly.context.userId}`,
      timestamp: anomaly.timestamp,
      severity: anomaly.severity,
      riskScore: anomaly.riskScore,
      healthcareImpact: anomaly.healthcareImpact,
      autoResponse: anomaly.riskScore > 9,
      escalationRequired: true,
    })
  }

  return alerts
}

function detectAttackPatterns(events: SecurityEvent[]) {
  const patterns = []
  const now = Date.now()

  // Multiple failed logins from same IP
  const failedLogins = events.filter(e => e.eventType === 'failed_login')
  const ipGroups = failedLogins.reduce((acc, event) => {
    if (!acc[event.source.ipAddress]) acc[event.source.ipAddress] = []
    acc[event.source.ipAddress].push(event)
    return acc
  }, {} as Record<string, SecurityEvent[]>)

  Object.entries(ipGroups).forEach(([ip, events]) => {
    if (events.length > 5) {
      patterns.push({
        type: 'brute_force',
        indicator: ip,
        frequency: events.length,
        timeWindow: `${Math.min(...events.map(e => e.timestamp))} - ${Math.max(...events.map(e => e.timestamp))}`,
        confidence: Math.min(0.95, events.length / 10),
      })
    }
  })

  return patterns
}

function calculateGeographicDistribution(events: SecurityEvent[]) {
  const distribution = events.reduce((acc, event) => {
    const country = event.source.country || 'Unknown'
    if (!acc[country]) {
      acc[country] = { count: 0, events: [] }
    }
    acc[country].count++
    acc[country].events.push(event.eventType)
    return acc
  }, {} as Record<string, { count: number; events: string[] }>)

  return distribution
}

function calculateSecurityTrends(events: SecurityEvent[]) {
  const now = Date.now()
  const last24h = now - 24 * 60 * 60 * 1000
  const previous24h = now - 48 * 60 * 60 * 1000

  const recent = events.filter(e => e.timestamp > last24h)
  const previous = events.filter(e => e.timestamp > previous24h && e.timestamp <= last24h)

  const recentCount = recent.length
  const previousCount = previous.length

  let trend = 'stable'
  if (recentCount > previousCount * 1.5) trend = 'increasing'
  else if (recentCount < previousCount * 0.7) trend = 'decreasing'

  return {
    trend,
    change: previousCount > 0 ? ((recentCount - previousCount) / previousCount) * 100 : 0,
    recent24h: recentCount,
    previous24h,
  }
}

function getThreatLevel(events: SecurityEvent[]): 'low' | 'medium' | 'high' | 'critical' {
  const critical = events.filter(e => e.severity === 'critical').length
  const high = events.filter(e => e.severity === 'high').length
  const total = events.length

  if (critical > 0 || high > 5) return 'critical'
  if (high > 2 || total > 50) return 'high'
  if (high > 0 || total > 20) return 'medium'
  return 'low'
}

async function triggerAutomatedResponse(event: SecurityEvent, threats: any[]) {
  // In a real implementation, this would trigger automated responses
  console.log('Triggering automated response for:', event.id, threats)
  
  // Create incident record
  if (event.severity === 'critical' || threats.some(t => t.level === 'critical')) {
    const incident: IncidentResponse = {
      id: `auto-incident-${Date.now()}`,
      eventId: event.id,
      timestamp: Date.now(),
      severity: event.severity,
      type: 'automated_response',
      title: `Automated Response: ${event.eventType}`,
      description: `Automated response triggered for ${event.eventType} from ${event.source.ipAddress}`,
      status: 'active',
      assignedTo: 'security_system',
      actionsTaken: ['automated_response_triggered'],
      resolutionTime: null,
      affectedSystems: [event.target.resourceType],
      impact: event.affectedRecords || 1,
      escalationLevel: event.severity === 'critical' ? 3 : 2,
    }
    activeIncidents.push(incident)
  }
}

async function triggerEscalation(incident: IncidentResponse) {
  console.log('Triggering escalation for incident:', incident.id)
  // In a real implementation, this would send notifications to security team
}

function calculateIncidentImpact(eventId: string): number {
  const event = securityEvents.find(e => e.id === eventId)
  if (!event) return 1

  // Healthcare data has higher impact
  if (event.target.resourceType.includes('patient') || event.target.resourceType.includes('medical')) {
    return event.affectedRecords || 5
  }

  return event.affectedRecords || 1
}

function calculateEscalationLevel(severity: string): number {
  switch (severity) {
    case 'critical': return 3
    case 'high': return 2
    case 'medium': return 1
    default: return 0
  }
}

function calculateIncidentMetrics(incidents: IncidentResponse[]) {
  const now = Date.now()
  const last24h = now - 24 * 60 * 60 * 1000

  const recentIncidents = incidents.filter(i => i.timestamp > last24h)
  const resolvedIncidents = incidents.filter(i => i.status === 'resolved')

  // Calculate average resolution time
  const resolvedWithTime = resolvedIncidents.filter(i => i.resolutionTime)
  const avgResolutionTime = resolvedWithTime.length > 0
    ? resolvedWithTime.reduce((sum, i) => sum + (i.resolutionTime! - i.timestamp), 0) / resolvedWithTime.length
    : 0

  return {
    totalIncidents: incidents.length,
    activeIncidents: incidents.filter(i => i.status === 'active').length,
    recentIncidents: recentIncidents.length,
    resolvedIncidents: resolvedIncidents.length,
    avgResolutionTime: Math.round(avgResolutionTime / (1000 * 60 * 60 * 60)), // Convert to hours
    escalationRate: incidents.length > 0 
      ? (incidents.filter(i => i.escalationLevel > 1).length / incidents.length) * 100 
      : 0,
  }
}