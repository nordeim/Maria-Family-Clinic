/**
 * Compliance Monitoring API Routes
 * Sub-Phase 10.6: Monitoring & Alerting Systems
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { 
  ComplianceStatus,
  PDPACompliance,
  HealthcareDataAccess,
  ComplianceAlert,
  AuditEvent
} from '@/performance/monitoring/types'

// Validation schemas
const pdpaComplianceSchema = z.object({
  timestamp: z.number(),
  eventType: z.enum(['consent_obtained', 'data_accessed', 'data_deleted', 'breach_detected']),
  userId: z.string(),
  dataSubjectId: z.string(),
  purpose: z.string(),
  lawfulBasis: z.string(),
  consentTimestamp: z.number().optional(),
  ipAddress: z.string(),
  userAgent: z.string(),
  success: z.boolean(),
  details: z.record(z.any()).optional(),
})

const dataAccessSchema = z.object({
  timestamp: z.number(),
  userId: z.string(),
  userRole: z.string(),
  dataSubjectId: z.string(),
  action: z.enum(['view', 'edit', 'delete', 'export']),
  resourceType: z.enum(['medical_record', 'appointment', 'consent', 'contact_info']),
  resourceId: z.string(),
  ipAddress: z.string(),
  location: z.object({
    country: z.string(),
    region: z.string(),
    city: z.string(),
  }).optional(),
  riskScore: z.number(),
  authorized: z.boolean(),
})

const auditEventSchema = z.object({
  timestamp: z.number(),
  eventType: z.string(),
  userId: z.string(),
  userRole: z.string(),
  action: z.string(),
  resource: z.string(),
  outcome: z.enum(['success', 'failure', 'denied']),
  ipAddress: z.string(),
  userAgent: z.string(),
  metadata: z.record(z.any()).optional(),
})

// Store compliance data in memory (in production, use database)
let pdpaData: PDPACompliance[] = []
let dataAccessLog: HealthcareDataAccess[] = []
let auditEvents: AuditEvent[] = []

// GET /api/monitoring/compliance - Get compliance status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '7d'
    const includeHistory = searchParams.get('includeHistory') === 'true'

    // Calculate time range
    const now = Date.now()
    const timeRangeMs = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    }[timeRange] || 7 * 24 * 60 * 60 * 1000

    // Filter data by time range
    const filteredPDPA = pdpaData.filter(record => 
      now - record.timestamp <= timeRangeMs
    )
    const filteredAccess = dataAccessLog.filter(record => 
      now - record.timestamp <= timeRangeMs
    )
    const filteredAudit = auditEvents.filter(record => 
      now - record.timestamp <= timeRangeMs
    )

    // Calculate compliance summary
    const complianceSummary = calculateComplianceSummary(
      filteredPDPA, 
      filteredAccess, 
      filteredAudit
    )

    // Check for compliance alerts
    const alerts = checkComplianceAlerts(filteredPDPA, filteredAccess, filteredAudit)

    const response: any = {
      compliance: complianceSummary,
      alerts,
      timestamp: now,
      timeRange,
    }

    if (includeHistory) {
      response.history = {
        pdpa: filteredPDPA.slice(-100), // Last 100 events
        dataAccess: filteredAccess.slice(-100),
        auditEvents: filteredAudit.slice(-100),
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Compliance API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch compliance data' },
      { status: 500 }
    )
  }
}

// POST /api/monitoring/compliance/pdpa - Submit PDPA compliance event
export async function POST_pdpa(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = pdpaComplianceSchema.parse(body)

    // Create PDPA compliance record
    const record: PDPACompliance = {
      ...validatedData,
      id: `pdpa-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }

    pdpaData.push(record)

    // Keep only recent records
    if (pdpaData.length > 10000) {
      pdpaData = pdpaData.slice(-5000)
    }

    // Check for immediate compliance violations
    const violations = checkPDPAViolations(record)

    return NextResponse.json({
      success: true,
      id: record.id,
      violations: violations.length > 0 ? violations : undefined,
    })

  } catch (error) {
    console.error('PDPA submission API error:', error)
    return NextResponse.json(
      { error: 'Invalid PDPA data' },
      { status: 400 }
    )
  }
}

// POST /api/monitoring/compliance/access - Submit data access event
export async function POST_access(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = dataAccessSchema.parse(body)

    // Create data access record
    const record: HealthcareDataAccess = {
      ...validatedData,
      id: `access-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }

    dataAccessLog.push(record)

    // Keep only recent records
    if (dataAccessLog.length > 20000) {
      dataAccessLog = dataAccessLog.slice(-10000)
    }

    // Check for unauthorized access patterns
    const accessViolations = checkAccessViolations(record)

    return NextResponse.json({
      success: true,
      id: record.id,
      violations: accessViolations.length > 0 ? accessViolations : undefined,
    })

  } catch (error) {
    console.error('Data access submission API error:', error)
    return NextResponse.json(
      { error: 'Invalid data access data' },
      { status: 400 }
    )
  }
}

// POST /api/monitoring/compliance/audit - Submit audit event
export async function POST_audit(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = auditEventSchema.parse(body)

    // Create audit event record
    const record: AuditEvent = {
      ...validatedData,
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }

    auditEvents.push(record)

    // Keep only recent records
    if (auditEvents.length > 50000) {
      auditEvents = auditEvents.slice(-25000)
    }

    return NextResponse.json({
      success: true,
      id: record.id,
    })

  } catch (error) {
    console.error('Audit event submission API error:', error)
    return NextResponse.json(
      { error: 'Invalid audit event data' },
      { status: 400 }
    )
  }
}

// GET /api/monitoring/compliance/violations - Get compliance violations
export async function GET_violations(request: NextRequest) {
  try {
    const violations = calculateComplianceViolations()
    const alerts = checkComplianceAlerts(pdpaData, dataAccessLog, auditEvents)

    return NextResponse.json({
      violations,
      alerts: alerts.filter(a => a.type === 'violation'),
      timestamp: Date.now(),
    })

  } catch (error) {
    console.error('Compliance violations API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch compliance violations' },
      { status: 500 }
    )
  }
}

// GET /api/monitoring/compliance/report - Generate compliance report
export async function GET_report(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'json'
    const timeRange = searchParams.get('timeRange') || '30d'

    const report = generateComplianceReport(timeRange)

    if (format === 'json') {
      return NextResponse.json(report)
    } else {
      // For CSV or PDF format, set appropriate headers
      const filename = `compliance-report-${new Date().toISOString().slice(0, 19)}.${format}`
      
      return new NextResponse(JSON.stringify(report, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      })
    }

  } catch (error) {
    console.error('Compliance report API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate compliance report' },
      { status: 500 }
    )
  }
}

// Helper functions
function calculateComplianceSummary(
  pdpaData: PDPACompliance[],
  accessData: HealthcareDataAccess[],
  auditData: AuditEvent[]
) {
  const now = Date.now()
  const last24h = now - 24 * 60 * 60 * 1000

  // PDPA Compliance Metrics
  const pdpaEvents24h = pdpaData.filter(d => d.timestamp > last24h)
  const consentObtained = pdpaEvents24h.filter(d => d.eventType === 'consent_obtained').length
  const consentBreaches = pdpaEvents24h.filter(d => d.eventType === 'breach_detected').length
  const dataAccess = pdpaEvents24h.filter(d => d.eventType === 'data_accessed').length
  const dataDeleted = pdpaEvents24h.filter(d => d.eventType === 'data_deleted').length

  // Access Control Metrics
  const accessEvents24h = accessData.filter(d => d.timestamp > last24h)
  const unauthorizedAttempts = accessEvents24h.filter(d => !d.authorized).length
  const highRiskAccess = accessEvents24h.filter(d => d.riskScore > 7).length
  const uniqueUsers = new Set(accessEvents24h.map(d => d.userId)).size

  // Audit Trail Metrics
  const auditEvents24h = auditData.filter(d => d.timestamp > last24h)
  const failedActions = auditEvents24h.filter(d => d.outcome === 'failure').length
  const deniedActions = auditEvents24h.filter(d => d.outcome === 'denied').length

  // Overall Compliance Status
  let status: 'compliant' | 'warning' | 'non-compliant' = 'compliant'
  let complianceScore = 100

  // Breach detection
  if (consentBreaches > 0) {
    status = 'non-compliant'
    complianceScore = Math.max(0, 100 - (consentBreaches * 20))
  } else if (unauthorizedAttempts > 5 || highRiskAccess > 10) {
    status = 'warning'
    complianceScore = Math.max(70, 100 - (unauthorizedAttempts * 5))
  }

  return {
    overall: {
      status,
      score: Math.round(complianceScore),
      lastChecked: now,
      totalViolations: consentBreaches + unauthorizedAttempts + failedActions,
    },
    pdpa: {
      consentObtained,
      dataAccess,
      dataDeleted,
      breaches: consentBreaches,
      complianceRate: consentBreaches === 0 ? 100 : Math.max(0, 100 - (consentBreaches * 20)),
    },
    accessControl: {
      totalAccess: accessEvents24h.length,
      unauthorizedAttempts,
      highRiskAccess,
      uniqueUsers,
      authorizationRate: accessEvents24h.length > 0 ? 
        Math.round(((accessEvents24h.length - unauthorizedAttempts) / accessEvents24h.length) * 100) : 100,
    },
    auditTrail: {
      totalEvents: auditEvents24h.length,
      failedActions,
      deniedActions,
      integrityScore: auditEvents24h.length > 0 ? 
        Math.round(((auditEvents24h.length - failedActions - deniedActions) / auditEvents24h.length) * 100) : 100,
    },
    healthcareSpecific: {
      patientConsent: consentObtained > 0 ? 'up-to-date' : 'missing',
      dataMinimization: dataAccess < 100 ? 'compliant' : 'excessive',
      retentionCompliance: dataDeleted > 0 ? 'compliant' : 'no-deletions',
      crossBorderCompliance: checkCrossBorderCompliance(accessData),
    },
  }
}

function checkComplianceAlerts(
  pdpaData: PDPACompliance[],
  accessData: HealthcareDataAccess[],
  auditData: AuditEvent[]
): ComplianceAlert[] {
  const alerts: ComplianceAlert[] = []
  const now = Date.now()
  const lastHour = now - 60 * 60 * 1000

  // PDPA Breach Alerts
  const recentBreaches = pdpaData.filter(d => 
    d.eventType === 'breach_detected' && d.timestamp > lastHour
  )

  recentBreaches.forEach(breach => {
    alerts.push({
      id: `breach-${breach.id}`,
      type: 'critical',
      category: 'pdpa-violation',
      title: 'PDPA Breach Detected',
      message: `Data breach detected for user ${breach.userId}: ${breach.details?.type || 'Unknown breach type'}`,
      timestamp: breach.timestamp,
      severity: 'critical',
      affectedRecords: breach.details?.affectedRecords || 1,
      userId: breach.userId,
      dataSubjectId: breach.dataSubjectId,
      regulatoryImpact: 'Requires immediate notification to PDPC',
      actionable: true,
      autoResolve: false,
      healthcareImpact: 'Patient data protection compromised',
    })
  })

  // Unauthorized Access Alerts
  const recentUnauthorized = accessData.filter(d => 
    !d.authorized && d.timestamp > lastHour
  )

  if (recentUnauthorized.length > 0) {
    alerts.push({
      id: `unauthorized-${now}`,
      type: 'warning',
      category: 'access-control',
      title: 'Multiple Unauthorized Access Attempts',
      message: `${recentUnauthorized.length} unauthorized access attempts in the last hour`,
      timestamp: now,
      severity: 'high',
      affectedRecords: recentUnauthorized.length,
      userId: 'multiple',
      dataSubjectId: 'multiple',
      regulatoryImpact: 'Potential security breach',
      actionable: true,
      autoResolve: false,
      healthcareImpact: 'Patient data access compromised',
    })
  }

  // High Risk Access Alerts
  const recentHighRisk = accessData.filter(d => 
    d.riskScore > 8 && d.timestamp > lastHour
  )

  if (recentHighRisk.length > 3) {
    alerts.push({
      id: `high-risk-${now}`,
      type: 'warning',
      category: 'access-control',
      title: 'High Risk Data Access Pattern',
      message: `${recentHighRisk.length} high-risk data access events detected`,
      timestamp: now,
      severity: 'medium',
      affectedRecords: recentHighRisk.length,
      regulatoryImpact: 'Review access permissions',
      actionable: true,
      autoResolve: false,
      healthcareImpact: 'Unusual access patterns detected',
    })
  }

  // Audit Trail Integrity Alerts
  const recentAuditGaps = auditData.filter(d => 
    d.outcome === 'failure' && d.timestamp > lastHour
  )

  if (recentAuditGaps.length > 10) {
    alerts.push({
      id: `audit-failures-${now}`,
      type: 'warning',
      category: 'audit-trail',
      title: 'High Rate of Audit Failures',
      message: `${recentAuditGaps.length} audit failures detected in the last hour`,
      timestamp: now,
      severity: 'medium',
      affectedRecords: recentAuditGaps.length,
      regulatoryImpact: 'Audit trail integrity compromised',
      actionable: true,
      autoResolve: false,
      healthcareImpact: 'System audit trail may be unreliable',
    })
  }

  return alerts
}

function checkPDPAViolations(record: PDPACompliance): ComplianceAlert[] {
  const alerts: ComplianceAlert[] = []

  // Check for missing consent
  if (record.eventType === 'data_accessed' && !record.consentTimestamp) {
    alerts.push({
      id: `missing-consent-${record.id}`,
      type: 'critical',
      category: 'pdpa-violation',
      title: 'Data Accessed Without Consent',
      message: `User ${record.userId} accessed data without valid consent`,
      timestamp: record.timestamp,
      severity: 'critical',
      userId: record.userId,
      dataSubjectId: record.dataSubjectId,
      regulatoryImpact: 'PDPA violation - immediate action required',
      actionable: true,
      autoResolve: false,
      healthcareImpact: 'Patient privacy rights violated',
    })
  }

  return alerts
}

function checkAccessViolations(record: HealthcareDataAccess): ComplianceAlert[] {
  const alerts: ComplianceAlert[] = []

  // Check for high risk access without authorization
  if (record.riskScore > 8 && !record.authorized) {
    alerts.push({
      id: `unauthorized-high-risk-${record.id}`,
      type: 'critical',
      category: 'access-control',
      title: 'High Risk Unauthorized Access Attempt',
      message: `User ${record.userId} attempted high-risk access without authorization`,
      timestamp: record.timestamp,
      severity: 'critical',
      affectedRecords: 1,
      userId: record.userId,
      dataSubjectId: record.dataSubjectId,
      regulatoryImpact: 'Security breach - potential data compromise',
      actionable: true,
      autoResolve: false,
      healthcareImpact: 'Unauthorized patient data access attempted',
    })
  }

  return alerts
}

function calculateComplianceViolations() {
  const now = Date.now()
  const last30d = now - 30 * 24 * 60 * 60 * 1000

  const violations = []

  // PDPA Violations
  const pdpaViolations = pdpaData.filter(d => 
    d.eventType === 'breach_detected' && d.timestamp > last30d
  )

  violations.push(...pdpaViolations.map(v => ({
    type: 'PDPA Violation',
    severity: 'critical',
    timestamp: v.timestamp,
    description: `Data breach detected: ${v.details?.type || 'Unknown'}`,
    recordsAffected: v.details?.affectedRecords || 1,
  })))

  // Access Control Violations
  const accessViolations = dataAccessLog.filter(d => 
    !d.authorized && d.timestamp > last30d
  )

  violations.push(...accessViolations.map(v => ({
    type: 'Unauthorized Access',
    severity: 'high',
    timestamp: v.timestamp,
    description: `${v.userRole} attempted unauthorized ${v.action} of ${v.resourceType}`,
    recordsAffected: 1,
    userId: v.userId,
  })))

  return violations
}

function checkCrossBorderCompliance(accessData: HealthcareDataAccess[]) {
  const now = Date.now()
  const last24h = now - 24 * 60 * 60 * 1000

  const recentAccess = accessData.filter(d => d.timestamp > last24h)
  const countries = new Set(recentAccess.map(d => d.location?.country).filter(Boolean))

  // Check if data is being accessed from non-SG locations
  const nonSGAccess = recentAccess.filter(d => 
    d.location?.country && d.location.country !== 'Singapore'
  )

  if (nonSGAccess.length === 0) {
    return 'compliant'
  } else if (nonSGAccess.length < 5) {
    return 'warning'
  } else {
    return 'violation'
  }
}

function generateComplianceReport(timeRange: string) {
  const now = Date.now()
  const timeRangeMs = {
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
    '90d': 90 * 24 * 60 * 60 * 1000,
  }[timeRange] || 30 * 24 * 60 * 60 * 1000

  const startTime = now - timeRangeMs

  const filteredPDPA = pdpaData.filter(d => d.timestamp >= startTime)
  const filteredAccess = dataAccessLog.filter(d => d.timestamp >= startTime)
  const filteredAudit = auditEvents.filter(d => d.timestamp >= startTime)

  const summary = calculateComplianceSummary(filteredPDPA, filteredAccess, filteredAudit)
  const violations = calculateComplianceViolations().filter(v => 
    v.timestamp >= startTime
  )

  return {
    reportId: `compliance-${Date.now()}`,
    generatedAt: new Date(now).toISOString(),
    timeRange,
    executiveSummary: {
      overallCompliance: summary.overall.status,
      complianceScore: summary.overall.score,
      criticalViolations: violations.filter(v => v.severity === 'critical').length,
      highRiskIncidents: violations.filter(v => v.severity === 'high').length,
      totalUsersAffected: new Set(filteredAccess.map(d => d.dataSubjectId)).size,
    },
    detailedMetrics: summary,
    violations: violations.map(v => ({
      ...v,
      timestamp: new Date(v.timestamp).toISOString(),
    })),
    recommendations: generateComplianceRecommendations(summary, violations),
    regulatoryCompliance: {
      pdpa: summary.pdpa.complianceRate >= 95 ? 'compliant' : 'non-compliant',
      hipaa: checkHIPAASummary(filteredAccess),
      sox: summary.auditTrail.integrityScore >= 90 ? 'compliant' : 'non-compliant',
    },
  }
}

function checkHIPAASummary(accessData: HealthcareDataAccess[]) {
  const authorizedAccess = accessData.filter(d => d.authorized).length
  const totalAccess = accessData.length
  const rate = totalAccess > 0 ? (authorizedAccess / totalAccess) * 100 : 100

  if (rate >= 98) return 'compliant'
  if (rate >= 95) return 'minor-violations'
  return 'non-compliant'
}

function generateComplianceRecommendations(summary: any, violations: any[]) {
  const recommendations = []

  // PDPA Recommendations
  if (summary.pdpa.breaches > 0) {
    recommendations.push({
      priority: 'critical',
      category: 'PDPA',
      recommendation: 'Implement immediate breach response procedures and review data protection measures',
      impact: 'High',
      effort: 'Medium',
    })
  }

  if (summary.pdpa.consentObtained < 50) {
    recommendations.push({
      priority: 'high',
      category: 'PDPA',
      recommendation: 'Review and update consent collection processes',
      impact: 'Medium',
      effort: 'Low',
    })
  }

  // Access Control Recommendations
  if (summary.accessControl.unauthorizedAttempts > 0) {
    recommendations.push({
      priority: 'high',
      category: 'Access Control',
      recommendation: 'Implement stricter access controls and user authentication',
      impact: 'High',
      effort: 'Medium',
    })
  }

  // Healthcare Specific Recommendations
  if (summary.healthcareSpecific.patientConsent === 'missing') {
    recommendations.push({
      priority: 'critical',
      category: 'Healthcare Privacy',
      recommendation: 'Ensure all patient data access has valid consent documentation',
      impact: 'Critical',
      effort: 'Low',
    })
  }

  return recommendations
}