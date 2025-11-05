// Real-time Analytics tRPC Router
// Specialized router for real-time analytics and monitoring

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, publicProcedure } from '../../server/api/trpc';

// Real-time Metrics Schema
const realTimeMetricsSchema = z.object({
  clinicId: z.string().optional(),
  includeHistorical: z.boolean().default(true),
  timeWindow: z.enum(['1m', '5m', '15m', '1h']).default('5m'),
});

// WebSocket Subscription Schema
const subscriptionSchema = z.object({
  clinicId: z.string().optional(),
  metrics: z.array(z.string()),
  filters: z.record(z.any()).default({}),
});

// Alert Configuration Schema
const alertConfigSchema = z.object({
  metric: z.string(),
  condition: z.enum(['above', 'below', 'equals']),
  threshold: z.number(),
  clinicId: z.string().optional(),
  enabled: z.boolean().default(true),
});

// Performance Monitoring Schema
const performanceSchema = z.object({
  timeRange: z.enum(['1m', '5m', '15m', '1h', '24h']),
  clinicId: z.string().optional(),
  includeBreakdown: z.boolean().default(true),
});

// Real-time Router
export const realTimeRouter = createTRPCRouter({
  // Get Current Real-time Metrics
  getCurrentMetrics: publicProcedure
    .input(realTimeMetricsSchema)
    .query(async ({ input, ctx }) => {
      try {
        const realTimeService = ctx.realTimeAnalyticsService;

        const metrics = await realTimeService.getCurrentMetrics(
          input.clinicId,
          input.timeWindow
        );

        if (input.includeHistorical) {
          const historical = await realTimeService.getHistoricalMetrics(
            input.timeWindow,
            input.clinicId
          );

          return {
            current: metrics,
            historical,
          };
        }

        return { current: metrics };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to get current metrics: ${error.message}`,
        });
      }
    }),

  // Subscribe to Real-time Updates (WebSocket)
  subscribeToUpdates: publicProcedure
    .input(subscriptionSchema)
    .subscription(async ({ input, ctx }) => {
      try {
        const realTimeService = ctx.realTimeAnalyticsService;

        return realTimeService.createSubscription(
          input.clinicId,
          input.metrics,
          input.filters
        );
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to create subscription: ${error.message}`,
        });
      }
    }),

  // Get Performance Metrics
  getPerformanceMetrics: publicProcedure
    .input(performanceSchema)
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

  // Get System Health
  getSystemHealth: publicProcedure
    .input(z.object({
      clinicId: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const realTimeService = ctx.realTimeAnalyticsService;

        const health = await realTimeService.getSystemHealth(input.clinicId);

        return health;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to get system health: ${error.message}`,
        });
      }
    }),

  // Configure Alerts
  configureAlert: publicProcedure
    .input(alertConfigSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const realTimeService = ctx.realTimeAnalyticsService;

        const alert = await realTimeService.configureAlert({
          id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...input,
          createdAt: new Date(),
        });

        return {
          success: true,
          alertId: alert.id,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to configure alert: ${error.message}`,
        });
      }
    }),

  // Get Active Alerts
  getActiveAlerts: publicProcedure
    .input(z.object({
      clinicId: z.string().optional(),
      severity: z.enum(['critical', 'high', 'medium', 'low']).optional(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const realTimeService = ctx.realTimeAnalyticsService;

        const alerts = await realTimeService.getActiveAlerts(
          input.clinicId,
          input.severity
        );

        return alerts;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to get active alerts: ${error.message}`,
        });
      }
    }),

  // Acknowledge Alert
  acknowledgeAlert: publicProcedure
    .input(z.object({
      alertId: z.string(),
      userId: z.string(),
      comment: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const realTimeService = ctx.realTimeAnalyticsService;

        await realTimeService.acknowledgeAlert(
          input.alertId,
          input.userId,
          input.comment
        );

        return {
          success: true,
          acknowledgedAt: new Date(),
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to acknowledge alert: ${error.message}`,
        });
      }
    }),

  // Get Live User Sessions
  getLiveSessions: publicProcedure
    .input(z.object({
      clinicId: z.string().optional(),
      includeDetails: z.boolean().default(false),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const realTimeService = ctx.realTimeAnalyticsService;

        const sessions = await realTimeService.getLiveSessions(
          input.clinicId,
          input.includeDetails
        );

        return sessions;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to get live sessions: ${error.message}`,
        });
      }
    }),

  // Get Real-time Conversion Tracking
  getLiveConversions: publicProcedure
    .input(z.object({
      timeWindow: z.enum(['5m', '15m', '1h']).default('15m'),
      clinicId: z.string().optional(),
      goal: z.enum(['appointment', 'contact', 'registration']).optional(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const realTimeService = ctx.realTimeAnalyticsService;

        const conversions = await realTimeService.getLiveConversions(
          input.timeWindow,
          input.clinicId,
          input.goal
        );

        return conversions;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to get live conversions: ${error.message}`,
        });
      }
    }),

  // Get Real-time Geographic Distribution
  getGeographicDistribution: publicProcedure
    .input(z.object({
      timeWindow: z.enum(['5m', '15m', '1h', '24h']).default('1h'),
      clinicId: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const realTimeService = ctx.realTimeAnalyticsService;

        const distribution = await realTimeService.getGeographicDistribution(
          input.timeWindow,
          input.clinicId
        );

        return distribution;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to get geographic distribution: ${error.message}`,
        });
      }
    }),

  // Get Real-time Device Analytics
  getDeviceAnalytics: publicProcedure
    .input(z.object({
      timeWindow: z.enum(['5m', '15m', '1h', '24h']).default('1h'),
      clinicId: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const realTimeService = ctx.realTimeAnalyticsService;

        const analytics = await realTimeService.getDeviceAnalytics(
          input.timeWindow,
          input.clinicId
        );

        return analytics;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to get device analytics: ${error.message}`,
        });
      }
    }),

  // Get Real-time API Performance
  getAPIPerformance: publicProcedure
    .input(z.object({
      timeWindow: z.enum(['5m', '15m', '1h']).default('15m'),
      includeEndpointBreakdown: z.boolean().default(true),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const realTimeService = ctx.realTimeAnalyticsService;

        const performance = await realTimeService.getAPIPerformance(
          input.timeWindow,
          input.includeEndpointBreakdown
        );

        return performance;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to get API performance: ${error.message}`,
        });
      }
    }),

  // Get Database Performance Metrics
  getDatabasePerformance: publicProcedure
    .input(z.object({
      timeWindow: z.enum(['5m', '15m', '1h']).default('15m'),
      includeSlowQueries: z.boolean().default(true),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const realTimeService = ctx.realTimeAnalyticsService;

        const performance = await realTimeService.getDatabasePerformance(
          input.timeWindow,
          input.includeSlowQueries
        );

        return performance;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to get database performance: ${error.message}`,
        });
      }
    }),

  // Get Cache Hit Rates
  getCacheMetrics: publicProcedure
    .input(z.object({
      timeWindow: z.enum(['5m', '15m', '1h']).default('15m'),
      includeBreakdownByCache: z.boolean().default(true),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const realTimeService = ctx.realTimeAnalyticsService;

        const metrics = await realTimeService.getCacheMetrics(
          input.timeWindow,
          input.includeBreakdownByCache
        );

        return metrics;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to get cache metrics: ${error.message}`,
        });
      }
    }),

  // Get Real-time Error Tracking
  getErrorTracking: publicProcedure
    .input(z.object({
      timeWindow: z.enum(['5m', '15m', '1h']).default('15m'),
      includeStackTraces: z.boolean().default(false),
      clinicId: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const realTimeService = ctx.realTimeAnalyticsService;

        const errors = await realTimeService.getErrorTracking(
          input.timeWindow,
          input.includeStackTraces,
          input.clinicId
        );

        return errors;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to get error tracking: ${error.message}`,
        });
      }
    }),

  // Get Real-time Security Events
  getSecurityEvents: publicProcedure
    .input(z.object({
      timeWindow: z.enum(['5m', '15m', '1h', '24h']).default('1h'),
      severity: z.enum(['critical', 'high', 'medium', 'low']).optional(),
      clinicId: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const realTimeService = ctx.realTimeAnalyticsService;

        const events = await realTimeService.getSecurityEvents(
          input.timeWindow,
          input.severity,
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

  // Get Real-time Custom Metrics
  getCustomMetrics: publicProcedure
    .input(z.object({
      metricNames: z.array(z.string()),
      timeWindow: z.enum(['5m', '15m', '1h']).default('15m'),
      clinicId: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const realTimeService = ctx.realTimeAnalyticsService;

        const metrics = await realTimeService.getCustomMetrics(
          input.metricNames,
          input.timeWindow,
          input.clinicId
        );

        return metrics;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to get custom metrics: ${error.message}`,
        });
      }
    }),

  // Reset Real-time Counters
  resetCounters: publicProcedure
    .input(z.object({
      clinicId: z.string().optional(),
      metricNames: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const realTimeService = ctx.realTimeAnalyticsService;

        await realTimeService.resetCounters(
          input.clinicId,
          input.metricNames
        );

        return {
          success: true,
          resetAt: new Date(),
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to reset counters: ${error.message}`,
        });
      }
    }),
});