// Analytics API Client
// Sub-Phase 10.1: Advanced Analytics & Tracking System Architecture

import React from 'react';
import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import superjson from 'superjson';

import type { AnalyticsAppRouter } from '../server/routers';

export const analyticsApi = createTRPCReact<AnalyticsAppRouter>();

export const analyticsTrpcClient = analyticsApi.createClient({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: '/api/trpc/analytics',
    }),
  ],
});

// Real-time Analytics Hook
export function useRealTimeAnalytics() {
  const trpc = analyticsApi.useContext();
  const [isConnected, setIsConnected] = React.useState(false);
  const [metrics, setMetrics] = React.useState(null);
  const subscriptionRef = React.useRef(null);

  const subscribe = React.useCallback((clinicId?: string, metrics?: string[]) => {
    try {
      const subscription = trpc.realTime.subscribeToUpdates.useSubscription(
        { clinicId, metrics: metrics || ['users', 'conversions', 'errors'] },
        {
          onData: (data) => {
            setMetrics(data);
            setIsConnected(true);
          },
          onError: (error) => {
            console.warn('Real-time subscription error:', error);
            setIsConnected(false);
          },
        }
      );
      
      subscriptionRef.current = subscription;
      return subscription;
    } catch (error) {
      console.warn('Failed to subscribe to real-time updates:', error);
      return null;
    }
  }, [trpc]);

  const unsubscribe = React.useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
      setIsConnected(false);
    }
  }, []);

  React.useEffect(() => {
    return () => {
      unsubscribe();
    };
  }, [unsubscribe]);

  return {
    isConnected,
    metrics,
    subscribe,
    unsubscribe,
  };
}

// Dashboard Data Hook
export function useDashboardData(dashboardType: 'executive' | 'operational' | 'healthcare' | 'marketing' | 'compliance') {
  return analyticsApi.dashboard.getDashboardData.useQuery(
    { dashboardType, timeRange: '30d' },
    {
      refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
      staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
    }
  );
}

// Healthcare KPIs Hook
export function useHealthcareKPIs(timeRange: '1h' | '24h' | '7d' | '30d' | '90d' | '1y' = '30d') {
  return analyticsApi.analytics.getHealthcareKPIs.useQuery(
    { timeRange, includePredictions: true },
    {
      refetchInterval: 15 * 60 * 1000, // Refetch every 15 minutes
    }
  );
}

// A/B Testing Hook
export function useABTestResults(testId: string) {
  return analyticsApi.analytics.getABTestResults.useQuery(
    { testId },
    {
      enabled: !!testId,
      refetchInterval: 60 * 1000, // Refetch every minute for active tests
    }
  );
}

// User Journey Analysis Hook
export function useUserJourneyAnalysis(userId?: string, sessionId?: string) {
  return analyticsApi.analytics.getUserJourneyAnalysis.useQuery(
    { userId, sessionId, timeRange: '7d' },
    {
      enabled: !!(userId || sessionId),
    }
  );
}

// Compliance Status Hook
export function useComplianceStatus() {
  return analyticsApi.compliance.getPDPAComplianceScore.useQuery(
    {},
    {
      refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes
    }
  );
}