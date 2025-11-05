// Compliance Analytics tRPC Router
// Specialized router for compliance and privacy analytics

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, publicProcedure } from '../../server/api/trpc';

// Data Breach Monitoring Schema
const dataBreachSchema = z.object({
  incidentId: z.string().optional(),
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  description: z.string(),
  affectedRecords: z.number().optional(),
  timestamp: z.date().optional(),
  clinicId: z.string().optional(),
});

// Consent Management Schema
const consentSchema = z.object({
  userId: z.string(),
  consentType: z.enum(['essential', 'analytics', 'marketing', 'third_party']),
  granted: z.boolean(),
  timestamp: z.date().optional(),
  expirationDate: z.date().optional(),
  metadata: z.record(z.any()).default({}),
});

// Data Access Request Schema
const dataAccessRequestSchema = z.object({
  userId: z.string(),
  requestType: z.enum(['access', 'rectification', 'erasure', 'portability', 'restriction']),
  dataCategories: z.array(z.string()),
  clinicId: z.string().optional(),
  priority: z.enum(['standard', 'expedited']).default('standard'),
});

// Privacy Impact Assessment Schema
const privacyImpactSchema = z.object({
  activityId: z.string().optional(),
  activityName: z.string(),
  dataTypes: z.array(z.string()),
  processingPurpose: z.string(),
  legalBasis: z.enum(['consent', 'contract', 'legal_obligation', 'vital_interests', 'public_task', 'legitimate_interests']),
  riskLevel: z.enum(['low', 'medium', 'high']),
  mitigationMeasures: z.array(z.string()),
  clinicId: z.string().optional(),
});

// Audit Log Request Schema
const auditLogRequestSchema = z.object({
  userId: z.string().optional(),
  action: z.string().optional(),
  resource: z.string().optional(),
  timeRange: z.enum(['1h', '24h', '7d', '30d', '90d']),
  clinicId: z.string().optional(),
  limit: z.number().default(100),
});

// Data Retention Schema
const dataRetentionSchema = z.object({
  dataCategory: z.string(),
  retentionPeriod: z.number(), // days
  autoDelete: z.boolean().default(true),
  clinicId: z.string().optional(),
});

// Compliance Router
export const complianceRouter = createTRPCRouter({
  // PDPA Compliance Score
  getPDPAComplianceScore: publicProcedure
    .input(z.object({
      clinicId: z.string().optional(),
      includeBreakdown: z.boolean().default(true),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const analyticsService = ctx.analyticsService;

        const score = await analyticsService.getPDPAComplianceScore(
          input.clinicId,
          input.includeBreakdown
        );

        return score;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to get PDPA compliance score: ${error.message}`,
        });
      }
    }),

  // Data Breach Monitoring
  reportDataBreach: publicProcedure
    .input(dataBreachSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const analyticsService = ctx.analyticsService;

        const incident = await analyticsService.reportDataBreach({
          id: `breach_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...input,
          timestamp: input.timestamp || new Date(),
          status: 'reported',
          assignedTo: null,
          createdAt: new Date(),
        });

        // Trigger immediate alert for critical/high severity breaches
        if (input.severity === 'critical' || input.severity === 'high') {
          await ctx.realTimeAnalyticsService.createAlert({
            type: 'data_breach',
            severity: input.severity,
            message: `Data breach reported: ${input.description}`,
            clinicId: input.clinicId,
          });
        }

        return {
          success: true,
          incidentId: incident.id,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to report data breach: ${error.message}`,
        });
      }
    }),

  // Get Data Breach Incidents
  getDataBreachIncidents: publicProcedure
    .input(z.object({
      clinicId: z.string().optional(),
      status: z.enum(['open', 'investigating', 'resolved', 'closed']).optional(),
      severity: z.enum(['critical', 'high', 'medium', 'low']).optional(),
      timeRange: z.enum(['24h', '7d', '30d', '90d', '1y']).optional(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const analyticsService = ctx.analyticsService;

        const incidents = await analyticsService.getDataBreachIncidents(
          input.clinicId,
          input.status,
          input.severity,
          input.timeRange
        );

        return incidents;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to get data breach incidents: ${error.message}`,
        });
      }
    }),

  // Consent Management
  recordConsent: publicProcedure
    .input(consentSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const analyticsService = ctx.analyticsService;

        await analyticsService.recordConsent(
          input.userId,
          input.consentType,
          input.granted,
          input.timestamp || new Date(),
          input.expirationDate,
          input.metadata
        );

        return {
          success: true,
          timestamp: input.timestamp || new Date(),
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to record consent: ${error.message}`,
        });
      }
    }),

  // Get Consent Records
  getConsentRecords: publicProcedure
    .input(z.object({
      userId: z.string(),
      clinicId: z.string().optional(),
      includeExpired: z.boolean().default(false),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const analyticsService = ctx.analyticsService;

        const records = await analyticsService.getConsentRecords(
          input.userId,
          input.clinicId,
          input.includeExpired
        );

        return records;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to get consent records: ${error.message}`,
        });
      }
    }),

  // Data Access Request Management
  createDataAccessRequest: publicProcedure
    .input(dataAccessRequestSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const analyticsService = ctx.analyticsService;

        const request = await analyticsService.createDataAccessRequest({
          id: `dar_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...input,
          status: 'pending',
          createdAt: new Date(),
          assignedTo: null,
          dueDate: new Date(Date.now() + (input.priority === 'expedited' ? 7 : 30) * 24 * 60 * 60 * 1000),
        });

        return {
          success: true,
          requestId: request.id,
          dueDate: request.dueDate,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to create data access request: ${error.message}`,
        });
      }
    }),

  // Process Data Access Request
  processDataAccessRequest: publicProcedure
    .input(z.object({
      requestId: z.string(),
      status: z.enum(['approved', 'rejected', 'in_progress', 'completed']),
      responseData: z.record(z.any()).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const analyticsService = ctx.analyticsService;

        await analyticsService.processDataAccessRequest(
          input.requestId,
          input.status,
          input.responseData,
          input.notes
        );

        return {
          success: true,
          processedAt: new Date(),
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to process data access request: ${error.message}`,
        });
      }
    }),

  // Privacy Impact Assessment
  createPrivacyImpactAssessment: publicProcedure
    .input(privacyImpactSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const analyticsService = ctx.analyticsService;

        const assessment = await analyticsService.createPrivacyImpactAssessment({
          id: `pia_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...input,
          status: 'draft',
          createdAt: new Date(),
          reviewedBy: null,
          approvalDate: null,
        });

        return {
          success: true,
          assessmentId: assessment.id,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to create privacy impact assessment: ${error.message}`,
        });
      }
    }),

  // Get Privacy Impact Assessments
  getPrivacyImpactAssessments: publicProcedure
    .input(z.object({
      clinicId: z.string().optional(),
      riskLevel: z.enum(['low', 'medium', 'high']).optional(),
      status: z.enum(['draft', 'under_review', 'approved', 'rejected']).optional(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const analyticsService = ctx.analyticsService;

        const assessments = await analyticsService.getPrivacyImpactAssessments(
          input.clinicId,
          input.riskLevel,
          input.status
        );

        return assessments;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to get privacy impact assessments: ${error.message}`,
        });
      }
    }),

  // Audit Log Search
  searchAuditLogs: publicProcedure
    .input(auditLogRequestSchema)
    .query(async ({ input, ctx }) => {
      try {
        const analyticsService = ctx.analyticsService;

        const logs = await analyticsService.searchAuditLogs(
          input.userId,
          input.action,
          input.resource,
          input.timeRange,
          input.clinicId,
          input.limit
        );

        return logs;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to search audit logs: ${error.message}`,
        });
      }
    }),

  // Data Retention Management
  configureDataRetention: publicProcedure
    .input(dataRetentionSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const analyticsService = ctx.analyticsService;

        await analyticsService.configureDataRetention(
          input.dataCategory,
          input.retentionPeriod,
          input.autoDelete,
          input.clinicId
        );

        return {
          success: true,
          configuredAt: new Date(),
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to configure data retention: ${error.message}`,
        });
      }
    }),

  // Get Data Retention Status
  getDataRetentionStatus: publicProcedure
    .input(z.object({
      clinicId: z.string().optional(),
      includeRecommendations: z.boolean().default(true),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const analyticsService = ctx.analyticsService;

        const status = await analyticsService.getDataRetentionStatus(
          input.clinicId,
          input.includeRecommendations
        );

        return status;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to get data retention status: ${error.message}`,
        });
      }
    }),

  // Anonymization Analytics
  getAnonymizationMetrics: publicProcedure
    .input(z.object({
      timeRange: z.enum(['1h', '24h', '7d', '30d', '90d']),
      clinicId: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const analyticsService = ctx.analyticsService;

        const metrics = await analyticsService.getAnonymizationMetrics(
          input.timeRange,
          input.clinicId
        );

        return metrics;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to get anonymization metrics: ${error.message}`,
        });
      }
    }),

  // Security Event Monitoring
  getSecurityEvents: publicProcedure
    .input(z.object({
      timeRange: z.enum(['1h', '24h', '7d', '30d']),
      severity: z.enum(['critical', 'high', 'medium', 'low']).optional(),
      eventType: z.string().optional(),
      clinicId: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const realTimeService = ctx.realTimeAnalyticsService;

        const events = await realTimeService.getSecurityEvents(
          input.timeRange,
          input.severity,
          input.eventType,
          input.clinicId
        );

        return events;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to get security events: ${error.message}`,
        });
      }
    }),

  // Compliance Reporting
  generateComplianceReport: publicProcedure
    .input(z.object({
      reportType: z.enum(['pdpa', 'hcsa', 'iso27001', 'comprehensive']),
      timeRange: z.enum(['30d', '90d', '1y']),
      clinicId: z.string().optional(),
      format: z.enum(['json', 'pdf']).default('pdf'),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const analyticsService = ctx.analyticsService;

        const report = await analyticsService.generateComplianceReport(
          input.reportType,
          input.timeRange,
          input.clinicId,
          input.format
        );

        return {
          success: true,
          report,
          downloadUrl: `/api/compliance/reports/${Date.now()}.${input.format}`,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to generate compliance report: ${error.message}`,
        });
      }
    }),

  // Risk Assessment
  getRiskAssessment: publicProcedure
    .input(z.object({
      clinicId: z.string().optional(),
      includeMitigationStrategies: z.boolean().default(true),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const analyticsService = ctx.analyticsService;

        const assessment = await analyticsService.getRiskAssessment(
          input.clinicId,
          input.includeMitigationStrategies
        );

        return assessment;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to get risk assessment: ${error.message}`,
        });
      }
    }),

  // Data Classification
  classifyData: publicProcedure
    .input(z.object({
      dataType: z.string(),
      containsPersonalInfo: z.boolean(),
      containsHealthInfo: z.boolean(),
      sensitivityLevel: z.enum(['public', 'internal', 'confidential', 'restricted']),
      clinicId: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const analyticsService = ctx.analyticsService;

        const classification = await analyticsService.classifyData(
          input.dataType,
          input.containsPersonalInfo,
          input.containsHealthInfo,
          input.sensitivityLevel,
          input.clinicId
        );

        return {
          success: true,
          classification,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to classify data: ${error.message}`,
        });
      }
    }),
});