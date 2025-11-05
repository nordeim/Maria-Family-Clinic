import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, adminProcedure, calculatePagination } from '../trpc'
import { TRPCError } from '@trpc/server'
import { Prisma } from '@prisma/client'

const auditLogSelect = {
  id: true,
  action: true,
  resource: true,
  resourceId: true,
  oldValue: true,
  newValue: true,
  details: true,
  ipAddress: true,
  userAgent: true,
  sessionId: true,
  timestamp: true,
  dataSensitivity: true,
  complianceFramework: true,
  accessReason: true,
  isPrivileged: true,
  consentRequired: true,
  consentGiven: true,
  isGovernmentRequest: true,
  governmentAgency: true,
  regulatoryReference: true,
  legalBasis: true,
  user: {
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  },
}

/**
 * Government Compliance & Security Router
 * Handles audit logging, consent management, security events, compliance reporting,
 * and government integration monitoring for PDPA and Singapore government compliance.
 */
export const complianceRouter = createTRPCRouter({
  /**
   * Get audit logs with enhanced filtering for compliance (admin only)
   */
  getAuditLogs: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        userId: z.string().uuid().optional(),
        action: z.string().optional(),
        resource: z.string().optional(),
        resourceId: z.string().optional(),
        dataSensitivity: z.enum(['PUBLIC', 'STANDARD', 'SENSITIVE', 'HIGHLY_SENSITIVE', 'MEDICAL', 'CONFIDENTIAL', 'RESTRICTED']).optional(),
        complianceFramework: z.array(z.string()).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        search: z.string().optional(),
        isGovernmentRequest: z.boolean().optional(),
        legalBasis: z.string().optional(),
        orderBy: z.enum(['timestamp', 'action', 'resource', 'dataSensitivity']).default('timestamp'),
        orderDirection: z.enum(['asc', 'desc']).default('desc'),
      })
    )
    .query(async ({ ctx, input }) => {
      const { 
        page, 
        limit, 
        userId, 
        action, 
        resource, 
        resourceId, 
        dataSensitivity,
        complianceFramework,
        startDate, 
        endDate, 
        search, 
        isGovernmentRequest,
        legalBasis,
        orderBy, 
        orderDirection 
      } = input
      const skip = (page - 1) * limit

      // Build where clause
      const where: Prisma.AuditLogWhereInput = {}

      if (userId) where.userId = userId
      if (action) where.action = { contains: action, mode: 'insensitive' }
      if (resource) where.resource = { contains: resource, mode: 'insensitive' }
      if (resourceId) where.resourceId = resourceId
      if (dataSensitivity) where.dataSensitivity = dataSensitivity
      if (complianceFramework?.length) where.complianceFramework = { hasEvery: complianceFramework }
      if (isGovernmentRequest !== undefined) where.isGovernmentRequest = isGovernmentRequest
      if (legalBasis) where.legalBasis = { contains: legalBasis, mode: 'insensitive' }

      if (startDate || endDate) {
        where.timestamp = {}
        if (startDate) where.timestamp.gte = startDate
        if (endDate) where.timestamp.lte = endDate
      }

      if (search) {
        where.OR = [
          { action: { contains: search, mode: 'insensitive' } },
          { resource: { contains: search, mode: 'insensitive' } },
          { accessReason: { contains: search, mode: 'insensitive' } },
          { user: { is: { email: { contains: search, mode: 'insensitive' } } } },
          { user: { is: { name: { contains: search, mode: 'insensitive' } } } },
        ]
      }

      // Build orderBy clause
      let orderByClause: Prisma.AuditLogOrderByWithRelationInput = {}
      if (orderBy === 'timestamp') {
        orderByClause = { timestamp: orderDirection }
      } else if (orderBy === 'action') {
        orderByClause = { action: orderDirection }
      } else if (orderBy === 'resource') {
        orderByClause = { resource: orderDirection }
      } else if (orderBy === 'dataSensitivity') {
        orderByClause = { dataSensitivity: orderDirection }
      }

      try {
        const [auditLogs, total] = await Promise.all([
          ctx.prisma.auditLog.findMany({
            where,
            select: auditLogSelect,
            skip,
            take: limit,
            orderBy: orderByClause,
          }),
          ctx.prisma.auditLog.count({ where }),
        ])

        return {
          data: auditLogs,
          pagination: calculatePagination(page, limit, total),
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch audit logs',
          cause: error,
        })
      }
    }),

  /**
   * Create audit log entry for compliance tracking
   */
  createAuditLog: protectedProcedure
    .input(
      z.object({
        action: z.string(),
        resource: z.string(),
        resourceId: z.string().optional(),
        oldValue: z.record(z.unknown()).optional(),
        newValue: z.record(z.unknown()).optional(),
        details: z.record(z.unknown()).default({}),
        dataSensitivity: z.enum(['PUBLIC', 'STANDARD', 'SENSITIVE', 'HIGHLY_SENSITIVE', 'MEDICAL', 'CONFIDENTIAL', 'RESTRICTED']).default('STANDARD'),
        complianceFramework: z.array(z.string()).default([]),
        accessReason: z.string().optional(),
        isPrivileged: z.boolean().default(false),
        consentRequired: z.boolean().default(false),
        consentGiven: z.boolean().optional(),
        isGovernmentRequest: z.boolean().default(false),
        governmentAgency: z.string().optional(),
        regulatoryReference: z.string().optional(),
        legalBasis: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const auditLog = await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          sessionId: ctx.session.sessionId,
          ...input,
          ipAddress: ctx.request.headers.get('x-forwarded-for') || 
                     ctx.request.headers.get('x-real-ip') || 
                     'unknown',
          userAgent: ctx.request.headers.get('user-agent') || 'unknown',
          timestamp: new Date(),
        },
        select: auditLogSelect,
      })

      return auditLog
    }),

  /**
   * Get consent records for a user (for PDPA compliance)
   */
  getConsentRecords: protectedProcedure
    .input(
      z.object({
        userId: z.string().uuid().optional(),
        consentType: z.enum([
          'DATA_PROCESSING',
          'DATA_SHARING',
          'MARKETING',
          'RESEARCH',
          'HEALTH_RECORD_ACCESS',
          'THIRD_PARTY_SHARING',
          'DATA_EXPORT',
          'LOCATION_TRACKING',
          'BIOMETRIC_COLLECTION',
          'SENSITIVE_DATA_PROCESSING'
        ]).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId, consentType, isActive } = input
      const targetUserId = userId || ctx.session.user.id

      // Users can only access their own consent records unless they're admin
      if (targetUserId !== ctx.session.user.id && ctx.session.user.role !== 'ADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only access your own consent records',
        })
      }

      const where: Prisma.ConsentRecordWhereInput = { userId: targetUserId }
      if (consentType) where.consentType = consentType
      if (isActive !== undefined) where.isActive = isActive

      const consentRecords = await ctx.prisma.consentRecord.findMany({
        where,
        orderBy: { consentDate: 'desc' },
      })

      return consentRecords
    }),

  /**
   * Create or update consent record (PDPA compliance)
   */
  createConsentRecord: protectedProcedure
    .input(
      z.object({
        consentType: z.enum([
          'DATA_PROCESSING',
          'DATA_SHARING',
          'MARKETING',
          'RESEARCH',
          'HEALTH_RECORD_ACCESS',
          'THIRD_PARTY_SHARING',
          'DATA_EXPORT',
          'LOCATION_TRACKING',
          'BIOMETRIC_COLLECTION',
          'SENSITIVE_DATA_PROCESSING'
        ]),
        consentGiven: z.boolean(),
        consentScope: z.string().optional(),
        purpose: z.string(),
        legalBasis: z.string().optional(),
        dataCategories: z.array(z.string()).default([]),
        processingActivities: z.array(z.string()).default([]),
        consentMethod: z.enum([
          'WEB_FORM',
          'MOBILE_APP',
          'PAPER_FORM',
          'VERBAL',
          'DIGITAL_SIGNATURE',
          'INFERRED',
          'IMPLIED'
        ]),
        consentContext: z.string().optional(),
        isExplicit: z.boolean().default(false),
        isInferred: z.boolean().default(false),
        thirdPartySharing: z.boolean().default(false),
        thirdParties: z.array(z.string()).default([]),
        dataTransferCountries: z.array(z.string()).default([]),
        expiryDate: z.date().optional(),
        consentSource: z.string().optional(),
        witness: z.string().optional(),
        verificationMethod: z.string().optional(),
        digitalSignature: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const consentRecord = await ctx.prisma.consentRecord.create({
        data: {
          userId: ctx.session.user.id,
          ...input,
          governmentReportingRequired: ['HEALTH_RECORD_ACCESS', 'SENSITIVE_DATA_PROCESSING', 'DATA_SHARING'].includes(input.consentType),
        },
      })

      return consentRecord
    }),

  /**
   * Withdraw consent (PDPA compliance)
   */
  withdrawConsent: protectedProcedure
    .input(
      z.object({
        consentId: z.string().uuid(),
        withdrawalReason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { consentId, withdrawalReason } = input

      // Verify the consent belongs to the current user
      const consent = await ctx.prisma.consentRecord.findUnique({
        where: { id: consentId },
        select: { userId: true },
      })

      if (!consent || consent.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only withdraw your own consent',
        })
      }

      const updatedConsent = await ctx.prisma.consentRecord.update({
        where: { id: consentId },
        data: {
          withdrawalDate: new Date(),
          isActive: false,
        },
      })

      return updatedConsent
    }),

  /**
   * Get security events (admin only)
   */
  getSecurityEvents: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(20),
        eventType: z.enum([
          'UNAUTHORIZED_ACCESS',
          'DATA_BREACH',
          'MALWARE_DETECTION',
          'PHISHING_ATTEMPT',
          'BRUTE_FORCE_ATTACK',
          'PRIVILEGE_ESCALATION',
          'SQL_INJECTION',
          'XSS_ATTEMPT',
          'CSRF_ATTACK',
          'RANSOMWARE',
          'DDOS_ATTACK',
          'INSIDER_THREAT',
          'DATA_EXFILTRATION',
          'SYSTEM_COMPROMISE',
          'CONFIGURATION_CHANGE',
          'POLICY_VIOLATION',
          'COMPLIANCE_VIOLATION'
        ]).optional(),
        severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO', 'NEGLIGIBLE']).optional(),
        status: z.enum(['OPEN', 'ACKNOWLEDGED', 'INVESTIGATING', 'CONTAINED', 'RESOLVED', 'CLOSED', 'FALSE_POSITIVE']).optional(),
        pdpaReportable: z.boolean().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, eventType, severity, status, pdpaReportable, startDate, endDate } = input
      const skip = (page - 1) * limit

      const where: Prisma.SecurityEventWhereInput = {}
      if (eventType) where.eventType = eventType
      if (severity) where.severity = severity
      if (status) where.status = status
      if (pdpaReportable !== undefined) where.pdpaReportable = pdpaReportable

      if (startDate || endDate) {
        where.detectedAt = {}
        if (startDate) where.detectedAt.gte = startDate
        if (endDate) where.detectedAt.lte = endDate
      }

      const [securityEvents, total] = await Promise.all([
        ctx.prisma.securityEvent.findMany({
          where,
          skip,
          take: limit,
          orderBy: { detectedAt: 'desc' },
        }),
        ctx.prisma.securityEvent.count({ where }),
      ])

      return {
        data: securityEvents,
        pagination: calculatePagination(page, limit, total),
      }
    }),

  /**
   * Create security event
   */
  createSecurityEvent: adminProcedure
    .input(
      z.object({
        eventType: z.enum([
          'UNAUTHORIZED_ACCESS',
          'DATA_BREACH',
          'MALWARE_DETECTION',
          'PHISHING_ATTEMPT',
          'BRUTE_FORCE_ATTACK',
          'PRIVILEGE_ESCALATION',
          'SQL_INJECTION',
          'XSS_ATTEMPT',
          'CSRF_ATTACK',
          'RANSOMWARE',
          'DDOS_ATTACK',
          'INSIDER_THREAT',
          'DATA_EXFILTRATION',
          'SYSTEM_COMPROMISE',
          'CONFIGURATION_CHANGE',
          'POLICY_VIOLATION',
          'COMPLIANCE_VIOLATION'
        ]),
        eventCategory: z.enum([
          'ACCESS_CONTROL',
          'DATA_PROTECTION',
          'NETWORK_SECURITY',
          'APPLICATION_SECURITY',
          'PHYSICAL_SECURITY',
          'PERSONNEL_SECURITY',
          'COMPLIANCE',
          'INCIDENT_RESPONSE'
        ]),
        severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO', 'NEGLIGIBLE']),
        title: z.string(),
        description: z.string().optional(),
        details: z.record(z.unknown()).default({}),
        sourceIp: z.string().optional(),
        sourceLocation: z.string().optional(),
        targetResource: z.string().optional(),
        affectedUsers: z.array(z.string()).default([]),
        affectedRecords: z.array(z.string()).default([]),
        attackVector: z.string().optional(),
        threatLevel: z.enum(['VERY_LOW', 'LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH', 'EXTREME']),
        attackType: z.string().optional(),
        vulnerabilityCve: z.string().optional(),
        dataBreach: z.boolean().default(false),
        personalDataAccessed: z.boolean().default(false),
        pdpaReportable: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const eventId = `SEC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      
      const securityEvent = await ctx.prisma.securityEvent.create({
        data: {
          eventId,
          ...input,
          complianceImpact: input.dataBreach ? 'SEVERE' : 'NONE',
          regulatoryNotificationRequired: input.pdpaReportable || input.dataBreach,
          lawEnforcementNotified: input.severity === 'CRITICAL',
          governmentAgencyInformed: input.pdpaReportable ? 'PDPC' : '',
        },
      })

      return securityEvent
    }),

  /**
   * Get government integration status
   */
  getGovernmentIntegrations: adminProcedure
    .query(async ({ ctx }) => {
      const integrations = await ctx.prisma.governmentIntegration.findMany({
        orderBy: { systemName: 'asc' },
      })

      return integrations
    }),

  /**
   * Update government integration status
   */
  updateIntegrationStatus: adminProcedure
    .input(
      z.object({
        integrationId: z.string().uuid(),
        status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'ERROR', 'DEGRADED', 'OFFLINE', 'TESTING', 'DEPRECATED']),
        healthCheckResults: z.record(z.unknown()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { integrationId, status, healthCheckResults } = input

      const updatedIntegration = await ctx.prisma.governmentIntegration.update({
        where: { id: integrationId },
        data: {
          status,
          lastHealthCheck: new Date(),
          healthCheckResults: healthCheckResults || {},
          integrationLogs: {
            push: {
              timestamp: new Date().toISOString(),
              status,
              healthCheck: healthCheckResults,
            },
          },
        },
      })

      return updatedIntegration
    }),

  /**
   * Get compliance reports
   */
  getComplianceReports: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(20),
        reportType: z.enum([
          'PDPA_COMPLIANCE',
          'SECURITY_INCIDENT',
          'DATA_BREACH_NOTIFICATION',
          'AUDIT_TRAIL',
          'ACCESS_LOG',
          'CONSENT_MANAGEMENT',
          'DATA_RETENTION',
          'THIRD_PARTY_ASSESSMENT',
          'VULNERABILITY_ASSESSMENT',
          'PENETRATION_TEST',
          'SECURITY_REVIEW',
          'COMPLIANCE_CHECK',
          'REGULATORY_SUBMISSION',
          'GOVERNMENT_REPORT',
          'RISK_ASSESSMENT'
        ]).optional(),
        framework: z.string().optional(),
        submissionStatus: z.enum(['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'REQUIRES_REVISION', 'ACCEPTED', 'ARCHIVED']).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, reportType, framework, submissionStatus } = input
      const skip = (page - 1) * limit

      const where: Prisma.ComplianceReportWhereInput = {}
      if (reportType) where.reportType = reportType
      if (framework) where.framework = { contains: framework, mode: 'insensitive' }
      if (submissionStatus) where.submissionStatus = submissionStatus

      const [reports, total] = await Promise.all([
        ctx.prisma.complianceReport.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        ctx.prisma.complianceReport.count({ where }),
      ])

      return {
        data: reports,
        pagination: calculatePagination(page, limit, total),
      }
    }),

  /**
   * Generate compliance report
   */
  generateComplianceReport: adminProcedure
    .input(
      z.object({
        reportType: z.enum([
          'PDPA_COMPLIANCE',
          'SECURITY_INCIDENT',
          'DATA_BREACH_NOTIFICATION',
          'AUDIT_TRAIL',
          'ACCESS_LOG',
          'CONSENT_MANAGEMENT',
          'DATA_RETENTION',
          'THIRD_PARTY_ASSESSMENT',
          'VULNERABILITY_ASSESSMENT',
          'PENETRATION_TEST',
          'SECURITY_REVIEW',
          'COMPLIANCE_CHECK',
          'REGULATORY_SUBMISSION',
          'GOVERNMENT_REPORT',
          'RISK_ASSESSMENT'
        ]),
        reportName: z.string(),
        description: z.string().optional(),
        reportPeriod: z.string(),
        framework: z.string(),
        dataPeriod: z.object({
          startDate: z.date(),
          endDate: z.date(),
        }),
        submissionRequired: z.boolean().default(false),
        governmentAgency: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { reportType, reportName, description, reportPeriod, framework, dataPeriod, submissionRequired, governmentAgency } = input

      // Calculate compliance metrics
      const totalRecords = await ctx.prisma.auditLog.count({
        where: {
          timestamp: {
            gte: dataPeriod.startDate,
            lte: dataPeriod.endDate,
          },
        },
      })

      const compliantRecords = await ctx.prisma.auditLog.count({
        where: {
          timestamp: {
            gte: dataPeriod.startDate,
            lte: dataPeriod.endDate,
          },
          consentRequired: false,
        },
      })

      const complianceScore = totalRecords > 0 ? (compliantRecords / totalRecords) * 100 : 100

      const complianceReport = await ctx.prisma.complianceReport.create({
        data: {
          reportType,
          reportName,
          reportPeriod,
          description,
          generatedBy: ctx.session.user.id,
          framework,
          dataPeriod,
          totalRecords,
          compliantRecords,
          nonCompliantRecords: totalRecords - compliantRecords,
          complianceScore,
          overallRiskLevel: complianceScore >= 95 ? 'LOW' : complianceScore >= 80 ? 'MEDIUM' : 'HIGH',
          submissionRequired,
          governmentAgency,
        },
      })

      return complianceReport
    }),

  /**
   * Get compliance dashboard statistics
   */
  getComplianceStats: adminProcedure
    .query(async ({ ctx }) => {
      const [
        totalAuditLogs,
        securityEvents,
        openSecurityEvents,
        pdpaReportableEvents,
        activeConsents,
        expiredConsents,
        governmentIntegrations,
        activeIntegrations,
        complianceReports,
        pendingReports,
      ] = await Promise.all([
        ctx.prisma.auditLog.count(),
        ctx.prisma.securityEvent.count(),
        ctx.prisma.securityEvent.count({ where: { status: { in: ['OPEN', 'ACKNOWLEDGED'] } } }),
        ctx.prisma.securityEvent.count({ where: { pdpaReportable: true } }),
        ctx.prisma.consentRecord.count({ where: { isActive: true } }),
        ctx.prisma.consentRecord.count({ where: { expiryDate: { lt: new Date() } } }),
        ctx.prisma.governmentIntegration.count(),
        ctx.prisma.governmentIntegration.count({ where: { status: 'ACTIVE' } }),
        ctx.prisma.complianceReport.count(),
        ctx.prisma.complianceReport.count({ where: { submissionStatus: 'DRAFT' } }),
      ])

      return {
        auditLogs: {
          total: totalAuditLogs,
          recentActivity: totalAuditLogs, // Could be filtered for recent activity
        },
        securityEvents: {
          total: securityEvents,
          open: openSecurityEvents,
          pdpaReportable: pdpaReportableEvents,
        },
        consentManagement: {
          active: activeConsents,
          expired: expiredConsents,
          total: activeConsents + expiredConsents,
        },
        governmentIntegrations: {
          total: governmentIntegrations,
          active: activeIntegrations,
          uptime: governmentIntegrations > 0 ? (activeIntegrations / governmentIntegrations) * 100 : 100,
        },
        complianceReports: {
          total: complianceReports,
          pending: pendingReports,
        },
      }
    }),
})
