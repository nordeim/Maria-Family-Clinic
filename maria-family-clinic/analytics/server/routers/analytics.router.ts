// Analytics tRPC Router
// Sub-Phase 10.1: Advanced Analytics & Tracking System Architecture

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, publicProcedure } from '../../server/api/trpc';
import { 
  AnalyticsEvent,
  TimeRangeKey,
  DashboardType,
  ConversionGoal,
  UserJourneyStep,
  HealthcareMetric,
  ABTestConfig,
  PredictiveModel,
  RealTimeMetrics,
  HealthcareKPIs,
  MarketingMetrics,
  ComplianceMetrics,
} from '../types/analytics.types';

// Analytics Event Tracking Schema
const trackEventSchema = z.object({
  eventType: z.string(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  clinicId: z.string().optional(),
  properties: z.record(z.any()).default({}),
  timestamp: z.date().optional(),
  metadata: z.record(z.any()).default({}),
});

// Dashboard Data Request Schema
const dashboardDataSchema = z.object({
  dashboardType: z.enum(['executive', 'operational', 'healthcare', 'marketing', 'compliance']),
  timeRange: z.enum(['1h', '24h', '7d', '30d', '90d', '1y']),
  clinicId: z.string().optional(),
  filters: z.record(z.any()).default({}),
});

// KPIs Request Schema
const kpisRequestSchema = z.object({
  timeRange: z.enum(['1h', '24h', '7d', '30d', '90d', '1y']),
  clinicId: z.string().optional(),
  categories: z.array(z.string()).optional(),
  includePredictions: z.boolean().default(false),
});

// Real-time Metrics Schema
const realTimeMetricsSchema = z.object({
  clinicId: z.string().optional(),
  includeHistorical: z.boolean().default(true),
});

// A/B Test Management Schema
const abTestConfigSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  hypothesis: z.string(),
  variants: z.array(z.object({
    name: z.string(),
    weight: z.number().min(0).max(100),
    config: z.record(z.any()),
  })),
  targetMetrics: z.array(z.string()),
  startDate: z.date(),
  endDate: z.date().optional(),
  sampleSize: z.number().optional(),
  significanceLevel: z.number().default(0.05),
});

const abTestAssignmentSchema = z.object({
  testId: z.string(),
  userId: z.string(),
  attributes: z.record(z.any()).default({}),
});

const abTestResultsSchema = z.object({
  testId: z.string(),
  timeRange: z.enum(['1h', '24h', '7d', '30d', '90d']).optional(),
});

// Healthcare Metrics Schema
const healthcareMetricsSchema = z.object({
  timeRange: z.enum(['1h', '24h', '7d', '30d', '90d', '1y']),
  clinicId: z.string().optional(),
  includeDoctorMetrics: z.boolean().default(true),
  includeServiceMetrics: z.boolean().default(true),
  includePatientFlowMetrics: z.boolean().default(true),
});

// Predictive Analytics Schema
const predictiveRequestSchema = z.object({
  type: z.enum(['demand', 'revenue', 'patient', 'capacity']),
  timeRange: z.enum(['7d', '30d', '90d', '1y']),
  clinicId: z.string().optional(),
  includeConfidence: z.boolean().default(true),
});

const exportDataSchema = z.object({
  format: z.enum(['csv', 'json', 'pdf']),
  timeRange: z.enum(['1d', '7d', '30d', '90d', '1y']),
  clinicId: z.string().optional(),
  sections: z.array(z.string()),
});

// Analytics Router
export const analyticsRouter = createTRPCRouter({
  // Event Tracking
  trackEvent: publicProcedure
    .input(trackEventSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const analyticsService = ctx.analyticsService;
        
        const event: AnalyticsEvent = {
          id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: input.timestamp || new Date(),
          eventType: input.eventType,
          userId: input.userId,
          sessionId: input.sessionId,
          clinicId: input.clinicId,
          properties: input.properties,
          metadata: input.metadata,
          ip: ctx.ip,
          userAgent: ctx.userAgent,
          sessionDuration: input.metadata.sessionDuration || null,
        };

        await analyticsService.trackEvent(event);
        
        return {
          success: true,
          eventId: event.id,
          timestamp: event.timestamp,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to track event: ${error.message}`,
        });
      }
    }),

  // Batch Event Tracking
  trackEventsBatch: publicProcedure
    .input(z.object({
      events: z.array(trackEventSchema),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const analyticsService = ctx.analyticsService;
        
        const events: AnalyticsEvent[] = input.events.map((event, index) => ({
          id: `evt_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: event.timestamp || new Date(),
          eventType: event.eventType,
          userId: event.userId,
          sessionId: event.sessionId,
          clinicId: event.clinicId,
          properties: event.properties,
          metadata: event.metadata,
          ip: ctx.ip,
          userAgent: ctx.userAgent,
          sessionDuration: event.metadata.sessionDuration || null,
        }));

        await analyticsService.trackEventsBatch(events);
        
        return {
          success: true,
          trackedCount: events.length,
          timestamp: new Date(),
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to track events batch: ${error.message}`,
        });
      }
    }),

  // Dashboard Data
  getDashboardData: publicProcedure
    .input(dashboardDataSchema)
    .query(async ({ input, ctx }) => {
      try {
        const { dashboardType, timeRange, clinicId, filters } = input;
        const analyticsService = ctx.analyticsService;

        switch (dashboardType) {
          case 'executive':
            return await analyticsService.getExecutiveDashboardData(timeRange, clinicId, filters);
          
          case 'operational':
            return await analyticsService.getOperationalDashboardData(timeRange, clinicId, filters);
          
          case 'healthcare':
            return await analyticsService.getHealthcareDashboardData(timeRange, clinicId, filters);
          
          case 'marketing':
            return await analyticsService.getMarketingDashboardData(timeRange, clinicId, filters);
          
          case 'compliance':
            return await analyticsService.getComplianceDashboardData(timeRange, clinicId, filters);
          
          default:
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Invalid dashboard type',
            });
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to get dashboard data: ${error.message}`,
        });
      }
    }),

  // Healthcare KPIs
  getHealthcareKPIs: publicProcedure
    .input(kpisRequestSchema)
    .query(async ({ input, ctx }) => {
      try {
        const { timeRange, clinicId, categories, includePredictions } = input;
        const analyticsService = ctx.analyticsService;

        const kpis = await analyticsService.getHealthcareKPIs(timeRange, clinicId, categories);
        
        if (includePredictions) {
          const predictions = await analyticsService.getPredictiveAnalytics('demand', timeRange, clinicId);
          return {
            kpis,
            predictions,
          };
        }

        return { kpis };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to get healthcare KPIs: ${error.message}`,
        });
      }
    }),

  // Real-time Metrics
  getRealTimeMetrics: publicProcedure
    .input(realTimeMetricsSchema)
    .query(async ({ input, ctx }) => {
      try {
        const { clinicId, includeHistorical } = input;
        const realTimeService = ctx.realTimeAnalyticsService;

        const metrics = await realTimeService.getCurrentMetrics(clinicId);
        
        if (includeHistorical) {
          const historical = await realTimeService.getHistoricalMetrics('1h', clinicId);
          return {
            current: metrics,
            historical,
          };
        }

        return { current: metrics };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to get real-time metrics: ${error.message}`,
        });
      }
    }),

  // Subscribe to Real-time Updates
  subscribeToRealTime: publicProcedure
    .input(z.object({
      clinicId: z.string().optional(),
      metrics: z.array(z.string()),
    }))
    .subscription(async ({ input, ctx }) => {
      try {
        const realTimeService = ctx.realTimeAnalyticsService;
        
        return realTimeService.subscribeToUpdates(input.clinicId, input.metrics, (update) => {
          // This will be handled by the WebSocket connection
          return update;
        });
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to subscribe to real-time updates: ${error.message}`,
        });
      }
    }),

  // A/B Testing Management
  createABTest: publicProcedure
    .input(abTestConfigSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const abTestingService = ctx.abTestingService;
        
        const testConfig: ABTestConfig = {
          id: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...input,
          status: 'draft',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await abTestingService.createTest(testConfig);
        
        return {
          success: true,
          testId: testConfig.id,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to create A/B test: ${error.message}`,
        });
      }
    }),

  // A/B Test Assignment
  assignToABTest: publicProcedure
    .input(abTestAssignmentSchema)
    .query(async ({ input, ctx }) => {
      try {
        const abTestingService = ctx.abTestingService;
        
        const assignment = await abTestingService.assignUser(input.testId, input.userId, input.attributes);
        
        return assignment;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to assign to A/B test: ${error.message}`,
        });
      }
    }),

  // A/B Test Results
  getABTestResults: publicProcedure
    .input(abTestResultsSchema)
    .query(async ({ input, ctx }) => {
      try {
        const abTestingService = ctx.abTestingService;
        
        const results = await abTestingService.getTestResults(input.testId, input.timeRange);
        
        return results;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to get A/B test results: ${error.message}`,
        });
      }
    }),

  // Healthcare Metrics
  getHealthcareMetrics: publicProcedure
    .input(healthcareMetricsSchema)
    .query(async ({ input, ctx }) => {
      try {
        const analyticsService = ctx.analyticsService;
        
        const metrics = await analyticsService.getHealthcareMetrics(
          input.timeRange,
          input.clinicId,
          {
            includeDoctorMetrics: input.includeDoctorMetrics,
            includeServiceMetrics: input.includeServiceMetrics,
            includePatientFlowMetrics: input.includePatientFlowMetrics,
          }
        );
        
        return metrics;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to get healthcare metrics: ${error.message}`,
        });
      }
    }),

  // Predictive Analytics
  getPredictiveAnalytics: publicProcedure
    .input(predictiveRequestSchema)
    .query(async ({ input, ctx }) => {
      try {
        const predictiveService = ctx.predictiveAnalyticsService;
        
        const predictions = await predictiveService.generatePrediction(
          input.type as keyof PredictiveModel,
          input.timeRange,
          input.clinicId,
          {
            includeConfidence: input.includeConfidence,
          }
        );
        
        return predictions;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to get predictive analytics: ${error.message}`,
        });
      }
    }),

  // User Journey Analysis
  getUserJourneyAnalysis: publicProcedure
    .input(z.object({
      userId: z.string().optional(),
      sessionId: z.string().optional(),
      timeRange: z.enum(['1h', '24h', '7d', '30d', '90d']),
      clinicId: z.string().optional(),
      steps: z.array(z.string()).optional(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const analyticsService = ctx.analyticsService;
        
        const journey = await analyticsService.analyzeUserJourney(
          input.userId,
          input.sessionId,
          input.timeRange,
          input.clinicId,
          input.steps
        );
        
        return journey;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to get user journey analysis: ${error.message}`,
        });
      }
    }),

  // Conversion Funnel Analysis
  getConversionFunnel: publicProcedure
    .input(z.object({
      goal: z.enum(['appointment', 'contact', 'registration']),
      timeRange: z.enum(['1h', '24h', '7d', '30d', '90d']),
      clinicId: z.string().optional(),
      steps: z.array(z.string()),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const analyticsService = ctx.analyticsService;
        
        const funnel = await analyticsService.analyzeConversionFunnel(
          input.goal,
          input.timeRange,
          input.clinicId,
          input.steps
        );
        
        return funnel;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to get conversion funnel: ${error.message}`,
        });
      }
    }),

  // Data Export
  exportAnalyticsData: publicProcedure
    .input(exportDataSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const analyticsService = ctx.analyticsService;
        
        const exportData = await analyticsService.exportData(
          input.format,
          input.timeRange,
          input.clinicId,
          input.sections
        );
        
        return {
          success: true,
          data: exportData,
          downloadUrl: `/api/analytics/export/${Date.now()}.${input.format}`,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to export analytics data: ${error.message}`,
        });
      }
    }),

  // Healthier SG Metrics
  getHealthierSGMetrics: publicProcedure
    .input(z.object({
      timeRange: z.enum(['1h', '24h', '7d', '30d', '90d', '1y']),
      clinicId: z.string().optional(),
      includeEnrollmentFunnel: z.boolean().default(true),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const analyticsService = ctx.analyticsService;
        
        const metrics = await analyticsService.getHealthierSGMetrics(
          input.timeRange,
          input.clinicId,
          {
            includeEnrollmentFunnel: input.includeEnrollmentFunnel,
          }
        );
        
        return metrics;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to get Healthier SG metrics: ${error.message}`,
        });
      }
    }),

  // Geographic Analytics
  getGeographicAnalytics: publicProcedure
    .input(z.object({
      region: z.string().optional(),
      timeRange: z.enum(['1h', '24h', '7d', '30d', '90d', '1y']),
      clinicId: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const analyticsService = ctx.analyticsService;
        
        const analytics = await analyticsService.getGeographicAnalytics(
          input.region,
          input.timeRange,
          input.clinicId
        );
        
        return analytics;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to get geographic analytics: ${error.message}`,
        });
      }
    }),

  // Performance Metrics
  getPerformanceMetrics: publicProcedure
    .input(z.object({
      timeRange: z.enum(['1h', '24h', '7d', '30d', '90d']),
      clinicId: z.string().optional(),
      includeBreakdown: z.boolean().default(true),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const realTimeService = ctx.realTimeAnalyticsService;
        
        const metrics = await realTimeService.getPerformanceMetrics(
          input.timeRange,
          input.clinicId,
          input.includeBreakdown
        );
        
        return metrics;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to get performance metrics: ${error.message}`,
        });
      }
    }),

  // Consent Management (PDPA Compliance)
  recordConsent: publicProcedure
    .input(z.object({
      userId: z.string(),
      consentType: z.string(),
      granted: z.boolean(),
      timestamp: z.date().optional(),
      metadata: z.record(z.any()).default({}),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const analyticsService = ctx.analyticsService;
        
        await analyticsService.recordConsent(
          input.userId,
          input.consentType,
          input.granted,
          input.timestamp || new Date(),
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

  // Privacy-compliant Analytics
  trackAnonymizedEvent: publicProcedure
    .input(z.object({
      eventType: z.string(),
      hashedUserId: z.string().optional(),
      properties: z.record(z.any()).default({}),
      timestamp: z.date().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const analyticsService = ctx.analyticsService;
        
        const event: AnalyticsEvent = {
          id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: input.timestamp || new Date(),
          eventType: input.eventType,
          userId: input.hashedUserId, // Hashed for privacy
          properties: input.properties,
          metadata: {
            ...input.properties,
            privacyMode: true, // Indicates this is privacy-compliant tracking
          },
          ip: undefined, // Not stored for privacy compliance
          userAgent: ctx.userAgent,
          sessionDuration: input.properties.sessionDuration || null,
        };

        await analyticsService.trackEvent(event);
        
        return {
          success: true,
          eventId: event.id,
          timestamp: event.timestamp,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to track anonymized event: ${error.message}`,
        });
      }
    }),

  // Data Retention Compliance
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
});