// Analytics Router Index
// Sub-Phase 10.1: Advanced Analytics & Tracking System Architecture

import { createTRPCRouter } from '../server/api/trpc';
import { analyticsRouter } from './routers/analytics.router';
import { healthcareRouter } from './routers/healthcare.router';
import { realTimeRouter } from './routers/real-time.router';
import { complianceRouter } from './routers/compliance.router';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const analyticsAppRouter = createTRPCRouter({
  analytics: analyticsRouter,
  healthcare: healthcareRouter,
  realTime: realTimeRouter,
  compliance: complianceRouter,
});

// Export type definition of API
export type AnalyticsAppRouter = typeof analyticsAppRouter;