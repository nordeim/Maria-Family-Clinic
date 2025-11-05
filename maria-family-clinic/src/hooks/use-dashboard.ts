/**
 * Dashboard Data Management Hook
 * Sub-Phase 10.6: Monitoring & Alerting Systems
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ExecutiveDashboardData,
  OperationsDashboardData,
  ComplianceDashboardData,
  TechnicalDashboardData,
  DashboardMetrics,
  KPIData 
} from '@/performance/monitoring/types';

interface UseDashboardOptions {
  timeRange?: '1h' | '6h' | '24h' | '7d' | '30d';
  refreshInterval?: number;
  autoRefresh?: boolean;
  enableRealTime?: boolean;
}

// Base Dashboard Hook
function useDashboard<T>(
  dashboardType: 'executive' | 'operations' | 'compliance' | 'technical',
  options: UseDashboardOptions = {}
) {
  const [isRealTime, setIsRealTime] = useState(options.enableRealTime ?? false);
  const [timeRange, setTimeRange] = useState(options.timeRange || '24h');
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const queryClient = useQueryClient();

  // Fetch dashboard data
  const { 
    data: dashboardData, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['dashboard', dashboardType, timeRange],
    queryFn: async () => {
      const response = await fetch(`/api/monitoring/dashboard/${dashboardType}?timeRange=${timeRange}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${dashboardType} dashboard data`);
      }
      return response.json() as Promise<T>;
    },
    refetchInterval: isRealTime ? (options.refreshInterval || 30000) : false,
    staleTime: 10000,
  });

  // Manual refresh
  const refreshDashboard = useCallback(() => {
    setLastRefresh(new Date());
    refetch();
  }, [refetch]);

  // Update time range
  const updateTimeRange = useCallback((newTimeRange: '1h' | '6h' | '24h' | '7d' | '30d') => {
    setTimeRange(newTimeRange);
  }, []);

  // Auto-refresh configuration
  const configureAutoRefresh = useCallback((interval: number, enabled: boolean) => {
    queryClient.setDefaultOptions({
      queries: {
        refetchInterval: enabled ? interval : false,
      },
    });
  }, [queryClient]);

  // Get refresh status
  const getRefreshStatus = useCallback(() => {
    return {
      lastRefresh,
      isRealTime,
      timeRange,
      nextRefresh: isRealTime && options.refreshInterval && lastRefresh 
        ? new Date(lastRefresh.getTime() + options.refreshInterval)
        : null,
    };
  }, [lastRefresh, isRealTime, timeRange, options.refreshInterval]);

  return {
    dashboardData,
    isLoading,
    error,
    isRealTime,
    setIsRealTime,
    timeRange,
    updateTimeRange,
    refreshDashboard,
    configureAutoRefresh,
    getRefreshStatus,
    refetch,
  };
}

// Executive Dashboard Hook
export function useExecutiveDashboard(options: UseDashboardOptions = {}) {
  const dashboard = useDashboard<ExecutiveDashboardData>('executive', options);
  
  // Additional executive-specific functions
  const getSystemHealthStatus = useCallback(() => {
    return dashboard.dashboardData?.systemHealth?.status || 'unknown';
  }, [dashboard.dashboardData]);

  const getComplianceScore = useCallback(() => {
    return dashboard.dashboardData?.regulatoryCompliance?.pdpa?.score || 0;
  }, [dashboard.dashboardData]);

  const getRiskLevel = useCallback(() => {
    return dashboard.dashboardData?.riskAssessment?.overallRisk || 'unknown';
  }, [dashboard.dashboardData]);

  const getKPISummary = useCallback(() => {
    const data = dashboard.dashboardData;
    if (!data?.healthcareKPIs) return null;
    
    return {
      systemUptime: data.healthcareKPIs.systemUptime,
      patientSatisfaction: data.healthcareKPIs.patientSatisfaction,
      complianceScore: data.healthcareKPIs.complianceScore,
      revenue: data.healthcareKPIs.revenue?.monthly || 0,
      riskLevel: data.healthcareKPIs.riskLevel,
    };
  }, [dashboard.dashboardData]);

  return {
    ...dashboard,
    getSystemHealthStatus,
    getComplianceScore,
    getRiskLevel,
    getKPISummary,
  };
}

// Operations Dashboard Hook
export function useOperationsDashboard(options: UseDashboardOptions = {}) {
  const dashboard = useDashboard<OperationsDashboardData>('operations', options);
  
  // Additional operations-specific functions
  const getDoctorPerformance = useCallback(() => {
    return dashboard.dashboardData?.doctorPerformance || [];
  }, [dashboard.dashboardData]);

  const getClinicUtilization = useCallback(() => {
    return dashboard.dashboardData?.clinicUtilization || [];
  }, [dashboard.dashboardData]);

  const getAppointmentMetrics = useCallback(() => {
    const data = dashboard.dashboardData;
    if (!data?.appointmentSystem) return null;
    
    return {
      bookingSuccessRate: data.appointmentSystem.bookingSuccessRate,
      noShowRate: data.appointmentSystem.noShowRate,
      averageWaitTime: data.appointmentSystem.averageWaitTime,
    };
  }, [dashboard.dashboardData]);

  const getPatientFlowStatus = useCallback(() => {
    return dashboard.dashboardData?.patientFlow || { status: 'unknown', metrics: {} };
  }, [dashboard.dashboardData]);

  const getRealTimeMetrics = useCallback(() => {
    return dashboard.dashboardData?.realTimeMetrics || {};
  }, [dashboard.dashboardData]);

  return {
    ...dashboard,
    getDoctorPerformance,
    getClinicUtilization,
    getAppointmentMetrics,
    getPatientFlowStatus,
    getRealTimeMetrics,
  };
}

// Compliance Dashboard Hook
export function useComplianceDashboard(options: UseDashboardOptions = {}) {
  const dashboard = useDashboard<ComplianceDashboardData>('compliance', options);
  
  // Additional compliance-specific functions
  const getPDPAComplianceStatus = useCallback(() => {
    return dashboard.dashboardData?.pdpaCompliance || { status: 'unknown', score: 0 };
  }, [dashboard.dashboardData]);

  const getSecurityStatus = useCallback(() => {
    return dashboard.dashboardData?.securityStatus || { status: 'unknown', score: 0 };
  }, [dashboard.dashboardData]);

  const getActiveViolations = useCallback(() => {
    return dashboard.dashboardData?.violations || [];
  }, [dashboard.dashboardData]);

  const getComplianceRecommendations = useCallback(() => {
    return dashboard.dashboardData?.recommendations || [];
  }, [dashboard.dashboardData]);

  const getAuditTrailStatus = useCallback(() => {
    return dashboard.dashboardData?.auditTrail || { status: 'unknown', completeness: 0 };
  }, [dashboard.dashboardData]);

  return {
    ...dashboard,
    getPDPAComplianceStatus,
    getSecurityStatus,
    getActiveViolations,
    getComplianceRecommendations,
    getAuditTrailStatus,
  };
}

// Technical Dashboard Hook
export function useTechnicalDashboard(options: UseDashboardOptions = {}) {
  const dashboard = useDashboard<TechnicalDashboardData>('technical', options);
  
  // Additional technical-specific functions
  const getSystemPerformance = useCallback(() => {
    return dashboard.dashboardData?.systemPerformance || {};
  }, [dashboard.dashboardData]);

  const getAPIHealth = useCallback(() => {
    return dashboard.dashboardData?.apiHealth || {};
  }, [dashboard.dashboardData]);

  const getIntegrationStatus = useCallback(() => {
    return dashboard.dashboardData?.integrationStatus || {};
  }, [dashboard.dashboardData]);

  const getErrorRates = useCallback(() => {
    return dashboard.dashboardData?.errorRates || {};
  }, [dashboard.dashboardData]);

  const getCapacityPlanning = useCallback(() => {
    return dashboard.dashboardData?.capacityPlanning || {};
  }, [dashboard.dashboardData]);

  const getDetailedMetrics = useCallback(() => {
    return dashboard.dashboardData?.detailedMetrics || {};
  }, [dashboard.dashboardData]);

  return {
    ...dashboard,
    getSystemPerformance,
    getAPIHealth,
    getIntegrationStatus,
    getErrorRates,
    getCapacityPlanning,
    getDetailedMetrics,
  };
}

// Dashboard KPIs Hook
export function useDashboardKPIs(options: {
  dashboardTypes?: string[];
  timeRange?: string;
} = {}) {
  const [isRealTime, setIsRealTime] = useState(false);
  
  // Fetch KPIs for all or specified dashboard types
  const { 
    data: kpisData, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['dashboard-kpis', options.timeRange, options.dashboardTypes?.join(',')],
    queryFn: async () => {
      const params = new URLSearchParams({
        timeRange: options.timeRange || '24h',
        ...(options.dashboardTypes && { types: options.dashboardTypes.join(',') }),
      });
      
      const response = await fetch(`/api/monitoring/dashboard/kpis?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard KPIs');
      }
      return response.json();
    },
    refetchInterval: isRealTime ? 30000 : false,
  });

  return {
    kpis: kpisData?.kpis || {},
    isLoading,
    error,
    isRealTime,
    setIsRealTime,
    refetch,
  };
}

// Dashboard Configuration Hook
export function useDashboardConfig(dashboardType: string) {
  const queryClient = useQueryClient();
  const [config, setConfig] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load dashboard configuration
  const { refetch } = useQuery({
    queryKey: ['dashboard-config', dashboardType],
    queryFn: async () => {
      const response = await fetch(`/api/monitoring/dashboard/config?dashboardType=${dashboardType}`);
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard config');
      }
      return response.json();
    },
    onSuccess: (data) => {
      setConfig(data.config || {});
      setIsLoading(false);
    },
    onError: () => {
      setIsLoading(false);
    },
  });

  // Update dashboard configuration
  const updateConfig = useMutation({
    mutationFn: async (newConfig: any) => {
      const response = await fetch('/api/monitoring/dashboard/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dashboardType,
          config: newConfig,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to update dashboard config');
      }
      return response.json();
    },
    onSuccess: (data) => {
      setConfig(data.config);
      queryClient.invalidateQueries({ queryKey: ['dashboard-config', dashboardType] });
    },
  });

  // Reset to default configuration
  const resetConfig = useCallback(() => {
    updateConfig.mutate({}); // Empty config resets to defaults
  }, [updateConfig]);

  return {
    config,
    isLoading,
    updateConfig: updateConfig.mutate,
    resetConfig,
    isUpdating: updateConfig.isPending,
  };
}

// Dashboard Export Hook
export function useDashboardExport() {
  const [isExporting, setIsExporting] = useState(false);

  // Export dashboard data
  const exportData = useCallback(async (
    dashboardType: string,
    format: 'json' | 'csv' | 'pdf',
    options: {
      timeRange?: string;
      includeCharts?: boolean;
      includeRawData?: boolean;
    } = {}
  ) => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams({
        dashboardType,
        format,
        ...(options.timeRange && { timeRange: options.timeRange }),
        ...(options.includeCharts && { includeCharts: 'true' }),
        ...(options.includeRawData && { includeRawData: 'true' }),
      });

      const response = await fetch(`/api/monitoring/dashboard/export?${params}`);
      if (!response.ok) {
        throw new Error('Failed to export dashboard data');
      }

      if (format === 'json') {
        const data = await response.json();
        return data;
      } else {
        // For CSV and PDF, trigger download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${dashboardType}-dashboard-${Date.now()}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  }, []);

  return {
    exportData,
    isExporting,
  };
}

// Dashboard Comparison Hook
export function useDashboardComparison() {
  const [selectedDashboards, setSelectedDashboards] = useState<string[]>([]);
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Add dashboard to comparison
  const addToComparison = useCallback((dashboardType: string) => {
    setSelectedDashboards(prev => {
      if (prev.includes(dashboardType)) return prev;
      return [...prev, dashboardType].slice(0, 4); // Max 4 dashboards
    });
  }, []);

  // Remove dashboard from comparison
  const removeFromComparison = useCallback((dashboardType: string) => {
    setSelectedDashboards(prev => prev.filter(d => d !== dashboardType));
  }, []);

  // Clear all comparisons
  const clearComparison = useCallback(() => {
    setSelectedDashboards([]);
    setComparisonData(null);
  }, []);

  // Fetch comparison data
  const fetchComparisonData = useCallback(async (timeRange: string) => {
    if (selectedDashboards.length < 2) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        dashboards: selectedDashboards.join(','),
        timeRange,
      });

      const response = await fetch(`/api/monitoring/dashboard/compare?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch comparison data');
      }

      const data = await response.json();
      setComparisonData(data);
    } catch (error) {
      console.error('Comparison fetch failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDashboards]);

  return {
    selectedDashboards,
    comparisonData,
    isLoading,
    addToComparison,
    removeFromComparison,
    clearComparison,
    fetchComparisonData,
  };
}

// Real-time Dashboard Updates Hook
export function useRealtimeDashboardUpdates(dashboardType: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [updates, setUpdates] = useState<any[]>([]);
  const queryClient = useQueryClient();

  // Connect to WebSocket for real-time dashboard updates
  const connect = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      const ws = new WebSocket(
        `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/monitoring/dashboard/ws?type=${dashboardType}`
      );
      
      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const update = JSON.parse(event.data);
          setLastUpdate(new Date());
          setUpdates(prev => [update, ...prev.slice(0, 99)]); // Keep last 100 updates
          
          // Update dashboard cache
          queryClient.setQueryData(['dashboard', dashboardType], (old: any) => {
            if (!old) return old;
            return { ...old, ...update };
          });
        } catch (error) {
          console.error('Failed to parse dashboard update:', error);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
      };

      ws.onerror = (error) => {
        console.error('Dashboard WebSocket error:', error);
        setIsConnected(false);
      };

      return ws;
    } catch (error) {
      console.error('Failed to connect to dashboard WebSocket:', error);
    }
  }, [dashboardType, queryClient]);

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    // Implementation would depend on WebSocket library used
    setIsConnected(false);
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    const ws = connect();
    
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [connect]);

  return {
    isConnected,
    lastUpdate,
    updates,
    connect,
    disconnect,
  };
}