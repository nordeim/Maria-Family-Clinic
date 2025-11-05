// Healthcare Analytics tRPC Router
// Specialized router for healthcare-specific analytics

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, publicProcedure } from '../../server/api/trpc';
import { TimeRangeKey } from '../../types/analytics.types';

// Healthcare Doctor Performance Schema
const doctorPerformanceSchema = z.object({
  doctorId: z.string().optional(),
  timeRange: z.enum(['1h', '24h', '7d', '30d', '90d', '1y']),
  clinicId: z.string().optional(),
  includePatientSatisfaction: z.boolean().default(true),
  includeUtilizationMetrics: z.boolean().default(true),
});

// Service Performance Schema
const servicePerformanceSchema = z.object({
  serviceId: z.string().optional(),
  timeRange: z.enum(['1h', '24h', '7d', '30d', '90d', '1y']),
  clinicId: z.string().optional(),
  includePricingAnalytics: z.boolean().default(true),
  includePopularityTrends: z.boolean().default(true),
});

// Patient Flow Schema
const patientFlowSchema = z.object({
  timeRange: z.enum(['1h', '24h', '7d', '30d', '90d', '1y']),
  clinicId: z.string().optional(),
  includeWaitTimes: z.boolean().default(true),
  includeConversionRates: z.boolean().default(true),
});

// Healthcare Router
export const healthcareRouter = createTRPCRouter({
  // Doctor Performance Metrics
  getDoctorPerformance: publicProcedure
    .input(doctorPerformanceSchema)
    .query(async ({ input, ctx }) => {
      try {
        const { doctorId, timeRange, clinicId, includePatientSatisfaction, includeUtilizationMetrics } = input;
        const analyticsService = ctx.analyticsService;

        const metrics = await analyticsService.getDoctorPerformance(
          doctorId,
          timeRange,
          clinicId,
          {
            includePatientSatisfaction,
            includeUtilizationMetrics,
          }
        );

        return metrics;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to get doctor performance: ${error.message}`,
        });
      }
    }),

  // Service Performance Metrics
  getServicePerformance: publicProcedure
    .input(servicePerformanceSchema)
    .query(async ({ input, ctx }) => {
      try {
        const { serviceId, timeRange, clinicId, includePricingAnalytics, includePopularityTrends } = input;
        const analyticsService = ctx.analyticsService;

        const metrics = await analyticsService.getServicePerformance(
          serviceId,
          timeRange,
          clinicId,
          {
            includePricingAnalytics,
            includePopularityTrends,
          }
        );

        return metrics;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to get service performance: ${error.message}`,
        });
      }
    }),

  // Patient Flow Analysis
  getPatientFlowAnalysis: publicProcedure
    .input(patientFlowSchema)
    .query(async ({ input, ctx }) => {
      try {
        const { timeRange, clinicId, includeWaitTimes, includeConversionRates } = input;
        const analyticsService = ctx.analyticsService;

        const flow = await analyticsService.getPatientFlowAnalysis(
          timeRange,
          clinicId,
          {
            includeWaitTimes,
            includeConversionRates,
          }
        );

        return flow;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to get patient flow analysis: ${error.message}`,
        });
      }
    }),

  // Healthier SG Program Metrics
  getHealthierSGMetrics: publicProcedure
    .input(z.object({
      timeRange: z.enum(['1h', '24h', '7d', '30d', '90d', '1y']),
      clinicId: z.string().optional(),
      includeEnrollmentFunnel: z.boolean().default(true),
      includeEligibilityChecks: z.boolean().default(true),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const analyticsService = ctx.analyticsService;

        const metrics = await analyticsService.getHealthierSGMetrics(
          input.timeRange,
          input.clinicId,
          {
            includeEnrollmentFunnel: input.includeEnrollmentFunnel,
            includeEligibilityChecks: input.includeEligibilityChecks,
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

  // Clinic Capacity Planning
  getCapacityPlanning: publicProcedure
    .input(z.object({
      timeRange: z.enum(['7d', '30d', '90d', '1y']),
      clinicId: z.string().optional(),
      includePredictions: z.boolean().default(true),
      includeOptimizations: z.boolean().default(true),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const predictiveService = ctx.predictiveAnalyticsService;

        const capacity = await predictiveService.getCapacityPlanning(
          input.timeRange,
          input.clinicId,
          {
            includePredictions: input.includePredictions,
            includeOptimizations: input.includeOptimizations,
          }
        );

        return capacity;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to get capacity planning: ${error.message}`,
        });
      }
    }),

  // Medical Specialty Analytics
  getSpecialtyAnalytics: publicProcedure
    .input(z.object({
      specialtyId: z.string().optional(),
      timeRange: z.enum(['1h', '24h', '7d', '30d', '90d', '1y']),
      clinicId: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const analyticsService = ctx.analyticsService;

        const analytics = await analyticsService.getSpecialtyAnalytics(
          input.specialtyId,
          input.timeRange,
          input.clinicId
        );

        return analytics;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to get specialty analytics: ${error.message}`,
        });
      }
    }),

  // Appointment Optimization
  getAppointmentOptimization: publicProcedure
    .input(z.object({
      timeRange: z.enum(['7d', '30d', '90d']),
      clinicId: z.string().optional(),
      doctorId: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const predictiveService = ctx.predictiveAnalyticsService;

        const optimization = await predictiveService.getAppointmentOptimization(
          input.timeRange,
          input.clinicId,
          input.doctorId
        );

        return optimization;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to get appointment optimization: ${error.message}`,
        });
      }
    }),

  // Patient Satisfaction Analytics
  getPatientSatisfactionAnalytics: publicProcedure
    .input(z.object({
      timeRange: z.enum(['1h', '24h', '7d', '30d', '90d', '1y']),
      clinicId: z.string().optional(),
      includeBreakdownByService: z.boolean().default(true),
      includeBreakdownByDoctor: z.boolean().default(true),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const analyticsService = ctx.analyticsService;

        const analytics = await analyticsService.getPatientSatisfactionAnalytics(
          input.timeRange,
          input.clinicId,
          {
            includeBreakdownByService: input.includeBreakdownByService,
            includeBreakdownByDoctor: input.includeBreakdownByDoctor,
          }
        );

        return analytics;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to get patient satisfaction analytics: ${error.message}`,
        });
      }
    }),

  // Health Screening Performance
  getHealthScreeningPerformance: publicProcedure
    .input(z.object({
      timeRange: z.enum(['1h', '24h', '7d', '30d', '90d', '1y']),
      clinicId: z.string().optional(),
      includePackageBreakdown: z.boolean().default(true),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const analyticsService = ctx.analyticsService;

        const performance = await analyticsService.getHealthScreeningPerformance(
          input.timeRange,
          input.clinicId,
          {
            includePackageBreakdown: input.includePackageBreakdown,
          }
        );

        return performance;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to get health screening performance: ${error.message}`,
        });
      }
    }),
});