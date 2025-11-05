/**
 * Monitoring Integration Hooks
 * Sub-Phase 10.6: Monitoring & Alerting Systems
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  PerformanceMetrics, 
  SecurityEvent, 
  ComplianceStatus, 
  IntegrationHealth,
  Alert,
  DashboardMetrics,
  TimeRange 
} from '@/performance/monitoring/types';

// Performance Monitoring Hook
export function usePerformanceMonitoring(options?: {
  timeRange?: TimeRange;
  pageUrl?: string;
  refreshInterval?: number;
}) {
  const [isRealTime, setIsRealTime] = useState(false);
  const queryClient = useQueryClient();

  // Fetch performance metrics
  const { data: performanceData, isLoading, error, refetch } = useQuery({
    queryKey: ['performance', options?.timeRange || '24h', options?.pageUrl],
    queryFn: async () => {
      const params = new URLSearchParams({
        timeRange: options?.timeRange || '24h',
        ...(options?.pageUrl && { pageUrl: options.pageUrl }),
      });
      
      const response = await fetch(`/api/monitoring/performance?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch performance data');
      }
      return response.json();
    },
    refetchInterval: isRealTime ? (options?.refreshInterval || 30000) : false,
    staleTime: 10000, // 10 seconds
  });

  // Submit performance metric
  const submitMetric = useMutation({
    mutationFn: async (metric: Partial<PerformanceMetrics>) => {
      const response = await fetch('/api/monitoring/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric),
      });
      if (!response.ok) {
        throw new Error('Failed to submit performance metric');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance'] });
    },
  });

  // Submit workflow metric
  const submitWorkflowMetric = useMutation({
    mutationFn: async (workflow: any) => {
      const response = await fetch('/api/monitoring/performance/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflow),
      });
      if (!response.ok) {
        throw new Error('Failed to submit workflow metric');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance'] });
    },
  });

  // Web Vitals monitoring
  const monitorWebVitals = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Monitor Core Web Vitals
    const monitorLCP = () => {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        submitMetric.mutate({
          pageUrl: window.location.href,
          timestamp: Date.now(),
          metrics: { lcp: lastEntry.startTime },
          sessionId: getSessionId(),
        });
      }).observe({ entryTypes: ['largest-contentful-paint'] });
    };

    const monitorFID = () => {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          submitMetric.mutate({
            pageUrl: window.location.href,
            timestamp: Date.now(),
            metrics: { fid: entry.processingStart - entry.startTime },
            sessionId: getSessionId(),
          });
        });
      }).observe({ entryTypes: ['first-input'] });
    };

    const monitorCLS = () => {
      let clsValue = 0;
      
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        
        submitMetric.mutate({
          pageUrl: window.location.href,
          timestamp: Date.now(),
          metrics: { cls: clsValue },
          sessionId: getSessionId(),
        });
      }).observe({ entryTypes: ['layout-shift'] });
    };

    // Start monitoring
    monitorLCP();
    monitorFID();
    monitorCLS();
  }, [submitMetric]);

  // Healthcare workflow monitoring
  const monitorHealthcareWorkflow = useCallback((workflow: string) => {
    const startTime = Date.now();
    
    return {
      complete: (success: boolean, steps?: any[]) => {
        const duration = Date.now() - startTime;
        
        submitWorkflowMetric.mutate({
          workflow,
          timestamp: Date.now(),
          duration,
          successRate: success ? 100 : 0,
          steps: steps || [],
        });
      },
      step: (stepName: string, duration: number, success: boolean) => {
        // Log individual step
        submitWorkflowMetric.mutate({
          workflow: `${workflow}_step`,
          timestamp: Date.now(),
          duration,
          successRate: success ? 100 : 0,
          steps: [{ name: stepName, duration, success }],
        });
      }
    };
  }, [submitWorkflowMetric]);

  return {
    performanceData,
    isLoading,
    error,
    isRealTime,
    setIsRealTime,
    refetch,
    submitMetric: submitMetric.mutate,
    submitWorkflowMetric: submitWorkflowMetric.mutate,
    monitorWebVitals,
    monitorHealthcareWorkflow,
    isSubmittingMetric: submitMetric.isPending,
    isSubmittingWorkflow: submitWorkflowMetric.isPending,
  };
}

// Security Monitoring Hook
export function useSecurityMonitoring(options?: {
  timeRange?: TimeRange;
  refreshInterval?: number;
}) {
  const [isRealTime, setIsRealTime] = useState(false);
  const queryClient = useQueryClient();

  // Fetch security data
  const { data: securityData, isLoading, error, refetch } = useQuery({
    queryKey: ['security', options?.timeRange || '24h'],
    queryFn: async () => {
      const response = await fetch(`/api/monitoring/security?timeRange=${options?.timeRange || '24h'}`);
      if (!response.ok) {
        throw new Error('Failed to fetch security data');
      }
      return response.json();
    },
    refetchInterval: isRealTime ? (options?.refreshInterval || 30000) : false,
  });

  // Submit security event
  const submitSecurityEvent = useMutation({
    mutationFn: async (event: Partial<SecurityEvent>) => {
      const response = await fetch('/api/monitoring/security/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
      if (!response.ok) {
        throw new Error('Failed to submit security event');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security'] });
    },
  });

  // Track user activity for anomaly detection
  const trackUserActivity = useCallback((activity: {
    type: string;
    userId: string;
    resourceId?: string;
    metadata?: any;
  }) => {
    if (typeof window === 'undefined') return;

    const event: Partial<SecurityEvent> = {
      timestamp: Date.now(),
      eventType: 'suspicious_activity', // or 'login_attempt', etc.
      severity: 'low',
      source: {
        ipAddress: getClientIP(),
        userAgent: navigator.userAgent,
        country: 'SG', // Would be determined server-side
      },
      target: {
        userId: activity.userId,
        resourceId: activity.resourceId || '',
        resourceType: activity.type,
      },
      metadata: activity.metadata,
    };

    submitSecurityEvent.mutate(event);
  }, [submitSecurityEvent]);

  return {
    securityData,
    isLoading,
    error,
    isRealTime,
    setIsRealTime,
    refetch,
    submitSecurityEvent: submitSecurityEvent.mutate,
    trackUserActivity,
    isSubmittingEvent: submitSecurityEvent.isPending,
  };
}

// Compliance Monitoring Hook
export function useComplianceMonitoring(options?: {
  timeRange?: TimeRange;
  refreshInterval?: number;
}) {
  const [isRealTime, setIsRealTime] = useState(false);
  const queryClient = useQueryClient();

  // Fetch compliance data
  const { data: complianceData, isLoading, error, refetch } = useQuery({
    queryKey: ['compliance', options?.timeRange || '7d'],
    queryFn: async () => {
      const params = new URLSearchParams({
        timeRange: options?.timeRange || '7d',
        includeHistory: 'false',
      });
      
      const response = await fetch(`/api/monitoring/compliance?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch compliance data');
      }
      return response.json();
    },
    refetchInterval: isRealTime ? (options?.refreshInterval || 60000) : false,
  });

  // Submit PDPA compliance event
  const submitPDPAEvent = useMutation({
    mutationFn: async (event: any) => {
      const response = await fetch('/api/monitoring/compliance/pdpa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
      if (!response.ok) {
        throw new Error('Failed to submit PDPA event');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance'] });
    },
  });

  // Submit data access event
  const submitDataAccess = useMutation({
    mutationFn: async (access: any) => {
      const response = await fetch('/api/monitoring/compliance/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(access),
      });
      if (!response.ok) {
        throw new Error('Failed to submit data access event');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance'] });
    },
  });

  // PDPA consent management
  const recordConsent = useCallback((consent: {
    userId: string;
    dataSubjectId: string;
    purpose: string;
    lawfulBasis: string;
  }) => {
    const event = {
      timestamp: Date.now(),
      eventType: 'consent_obtained',
      userId: consent.userId,
      dataSubjectId: consent.dataSubjectId,
      purpose: consent.purpose,
      lawfulBasis: consent.lawfulBasis,
      consentTimestamp: Date.now(),
      ipAddress: getClientIP(),
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
      success: true,
    };

    submitPDPAEvent.mutate(event);
  }, [submitPDPAEvent]);

  // Track data access for compliance
  const trackDataAccess = useCallback((access: {
    userId: string;
    userRole: string;
    dataSubjectId: string;
    action: string;
    resourceType: string;
    resourceId: string;
  }) => {
    const event = {
      timestamp: Date.now(),
      userId: access.userId,
      userRole: access.userRole,
      dataSubjectId: access.dataSubjectId,
      action: access.action,
      resourceType: access.resourceType,
      resourceId: access.resourceId,
      ipAddress: getClientIP(),
      location: {
        country: 'SG',
        region: 'Singapore',
        city: 'Singapore',
      },
      riskScore: calculateRiskScore(access),
      authorized: true, // Would be determined by access control
    };

    submitDataAccess.mutate(event);
  }, [submitDataAccess]);

  return {
    complianceData,
    isLoading,
    error,
    isRealTime,
    setIsRealTime,
    refetch,
    recordConsent,
    trackDataAccess,
    isSubmittingPDPA: submitPDPAEvent.isPending,
    isSubmittingAccess: submitDataAccess.isPending,
  };
}

// Integration Health Hook
export function useIntegrationMonitoring(options?: {
  timeRange?: TimeRange;
  refreshInterval?: number;
}) {
  const [isRealTime, setIsRealTime] = useState(false);
  const queryClient = useQueryClient();

  // Fetch integration health
  const { data: integrationData, isLoading, error, refetch } = useQuery({
    queryKey: ['integration', options?.timeRange || '24h'],
    queryFn: async () => {
      const response = await fetch(`/api/monitoring/integration?timeRange=${options?.timeRange || '24h'}`);
      if (!response.ok) {
        throw new Error('Failed to fetch integration data');
      }
      return response.json();
    },
    refetchInterval: isRealTime ? (options?.refreshInterval || 30000) : false,
  });

  // Submit integration health check
  const submitHealthCheck = useMutation({
    mutationFn: async (health: Partial<IntegrationHealth>) => {
      const response = await fetch('/api/monitoring/integration/health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(health),
      });
      if (!response.ok) {
        throw new Error('Failed to submit health check');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integration'] });
    },
  });

  // Track API call
  const trackAPICall = useCallback((call: {
    serviceName: string;
    endpoint: string;
    method: string;
    statusCode: number;
    responseTime: number;
    success: boolean;
    healthcareWorkflowId?: string;
  }) => {
    const apiCall = {
      timestamp: Date.now(),
      serviceName: call.serviceName,
      endpoint: call.endpoint,
      method: call.method,
      statusCode: call.statusCode,
      responseTime: call.responseTime,
      success: call.success,
      healthcareWorkflowId: call.healthcareWorkflowId,
    };

    // Submit as both health check and API call log
    const healthData: Partial<IntegrationHealth> = {
      timestamp: Date.now(),
      serviceName: call.serviceName,
      serviceType: inferServiceType(call.serviceName),
      status: call.success ? 'healthy' : 'degraded',
      responseTime: call.responseTime,
      uptime: 99.9, // Would be calculated
      successRate: call.success ? 100 : 0,
      errorRate: call.success ? 0 : 100,
      lastSuccessfulCall: call.success ? Date.now() : 0,
      lastFailedCall: call.success ? 0 : Date.now(),
    };

    submitHealthCheck.mutate(healthData);
    
    // Also submit to API call log
    fetch('/api/monitoring/integration/api-call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apiCall),
    }).catch(console.error);
  }, [submitHealthCheck]);

  return {
    integrationData,
    isLoading,
    error,
    isRealTime,
    setIsRealTime,
    refetch,
    trackAPICall,
    isSubmittingHealth: submitHealthCheck.isPending,
  };
}

// Dashboard Data Hook
export function useDashboardData(dashboardType: 'executive' | 'operations' | 'compliance' | 'technical', options?: {
  timeRange?: TimeRange;
  refreshInterval?: number;
}) {
  const [isRealTime, setIsRealTime] = useState(false);
  const queryClient = useQueryClient();

  // Fetch dashboard data
  const { data: dashboardData, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard', dashboardType, options?.timeRange || '24h'],
    queryFn: async () => {
      const response = await fetch(`/api/monitoring/dashboard/${dashboardType}?timeRange=${options?.timeRange || '24h'}`);
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      return response.json();
    },
    refetchInterval: isRealTime ? (options?.refreshInterval || 30000) : false,
    staleTime: 10000,
  });

  return {
    dashboardData,
    isLoading,
    error,
    isRealTime,
    setIsRealTime,
    refetch,
  };
}

// Alert Management Hook
export function useAlerts(options?: {
  severity?: string;
  category?: string;
  status?: 'active' | 'resolved';
  timeRange?: TimeRange;
}) {
  const [isRealTime, setIsRealTime] = useState(true);
  const queryClient = useQueryClient();

  // Fetch alerts
  const { data: alertsData, isLoading, error, refetch } = useQuery({
    queryKey: ['alerts', options?.severity, options?.category, options?.status, options?.timeRange || '24h'],
    queryFn: async () => {
      const params = new URLSearchParams({
        ...(options?.severity && { severity: options.severity }),
        ...(options?.category && { category: options.category }),
        ...(options?.status && { status: options.status }),
        timeRange: options?.timeRange || '24h',
        limit: '50',
      });
      
      const response = await fetch(`/api/monitoring/alerts?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch alerts');
      }
      return response.json();
    },
    refetchInterval: isRealTime ? 10000 : false, // Real-time alerts every 10 seconds
  });

  // Acknowledge alert
  const acknowledgeAlert = useMutation({
    mutationFn: async ({ alertId, userId, comment }: { alertId: string; userId: string; comment?: string }) => {
      const response = await fetch(`/api/monitoring/alerts/${alertId}/acknowledge`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, comment }),
      });
      if (!response.ok) {
        throw new Error('Failed to acknowledge alert');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  // Resolve alert
  const resolveAlert = useMutation({
    mutationFn: async ({ 
      alertId, 
      userId, 
      resolution, 
      autoResolved = false 
    }: { 
      alertId: string; 
      userId: string; 
      resolution: string; 
      autoResolved?: boolean;
    }) => {
      const response = await fetch(`/api/monitoring/alerts/${alertId}/resolve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, resolution, autoResolved }),
      });
      if (!response.ok) {
        throw new Error('Failed to resolve alert');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  // Submit new alert
  const submitAlert = useMutation({
    mutationFn: async (alert: Partial<Alert>) => {
      const response = await fetch('/api/monitoring/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alert),
      });
      if (!response.ok) {
        throw new Error('Failed to submit alert');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  return {
    alerts: alertsData?.alerts || [],
    summary: alertsData?.summary,
    isLoading,
    error,
    isRealTime,
    setIsRealTime,
    refetch,
    acknowledgeAlert: acknowledgeAlert.mutate,
    resolveAlert: resolveAlert.mutate,
    submitAlert: submitAlert.mutate,
    isAcknowledging: acknowledgeAlert.isPending,
    isResolving: resolveAlert.isPending,
    isSubmittingAlert: submitAlert.isPending,
  };
}

// Utility functions
function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let sessionId = sessionStorage.getItem('monitoring_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('monitoring_session_id', sessionId);
  }
  return sessionId;
}

function getClientIP(): string {
  // This would be handled server-side in a real implementation
  return 'client_ip_placeholder';
}

function calculateRiskScore(access: any): number {
  let score = 1;
  
  // Increase risk score based on access patterns
  if (access.action === 'delete') score += 3;
  if (access.resourceType.includes('medical')) score += 2;
  if (access.resourceType.includes('patient')) score += 2;
  
  return Math.min(score, 10);
}

function inferServiceType(serviceName: string): string {
  const name = serviceName.toLowerCase();
  
  if (name.includes('healthier') || name.includes('sg')) return 'healthier_sg_api';
  if (name.includes('google') || name.includes('maps')) return 'google_maps';
  if (name.includes('payment') || name.includes('stripe')) return 'payment_gateway';
  if (name.includes('notification')) return 'notification_service';
  
  return 'unknown';
}