/**
 * Alert Management Hook
 * Sub-Phase 10.6: Monitoring & Alerting Systems
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert, AlertRule, IncidentResponse } from '@/performance/monitoring/types';

interface UseAlertsOptions {
  severity?: 'low' | 'medium' | 'high' | 'critical';
  category?: string;
  status?: 'active' | 'resolved' | 'acknowledged';
  timeRange?: '1h' | '6h' | '24h' | '7d' | '30d';
  limit?: number;
  realTime?: boolean;
}

interface AlertFilters {
  severity?: string;
  category?: string;
  status?: string;
  timeRange?: string;
  search?: string;
}

// Alert Management Hook
export function useAlerts(options: UseAlertsOptions = {}) {
  const [isRealTime, setIsRealTime] = useState(options.realTime ?? true);
  const [filters, setFilters] = useState<AlertFilters>({
    severity: options.severity,
    category: options.category,
    status: options.status,
    timeRange: options.timeRange || '24h',
  });
  const queryClient = useQueryClient();

  // Fetch alerts with filters
  const { 
    data: alertsData, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['alerts', filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        ...(filters.severity && { severity: filters.severity }),
        ...(filters.category && { category: filters.category }),
        ...(filters.status && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
        timeRange: filters.timeRange || '24h',
        limit: String(options.limit || 50),
      });
      
      const response = await fetch(`/api/monitoring/alerts?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch alerts');
      }
      return response.json();
    },
    refetchInterval: isRealTime ? 10000 : false, // 10 second refresh for real-time
    staleTime: 5000,
  });

  // Acknowledge alert
  const acknowledgeAlert = useMutation({
    mutationFn: async ({ 
      alertId, 
      userId, 
      comment 
    }: { 
      alertId: string; 
      userId: string; 
      comment?: string;
    }) => {
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

  // Create custom alert
  const createAlert = useMutation({
    mutationFn: async (alert: Partial<Alert>) => {
      const response = await fetch('/api/monitoring/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alert),
      });
      if (!response.ok) {
        throw new Error('Failed to create alert');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  // Filter alerts
  const updateFilters = useCallback((newFilters: Partial<AlertFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Get alerts by severity
  const getAlertsBySeverity = useCallback((severity: string) => {
    if (!alertsData?.alerts) return [];
    return alertsData.alerts.filter((alert: Alert) => alert.severity === severity);
  }, [alertsData]);

  // Get critical alerts
  const getCriticalAlerts = useCallback(() => {
    return getAlertsBySeverity('critical');
  }, [getAlertsBySeverity]);

  // Check if there are active critical alerts
  const hasCriticalAlerts = useCallback(() => {
    return getCriticalAlerts().length > 0;
  }, [getCriticalAlerts]);

  return {
    alerts: alertsData?.alerts || [],
    summary: alertsData?.summary,
    isLoading,
    error,
    isRealTime,
    setIsRealTime,
    filters,
    updateFilters,
    refetch,
    
    // Actions
    acknowledgeAlert: acknowledgeAlert.mutate,
    resolveAlert: resolveAlert.mutate,
    createAlert: createAlert.mutate,
    
    // States
    isAcknowledging: acknowledgeAlert.isPending,
    isResolving: resolveAlert.isPending,
    isCreatingAlert: createAlert.isPending,
    
    // Utility functions
    getAlertsBySeverity,
    getCriticalAlerts,
    hasCriticalAlerts,
  };
}

// Alert Rules Hook
export function useAlertRules() {
  const [isRealTime, setIsRealTime] = useState(false);
  const queryClient = useQueryClient();

  // Fetch alert rules
  const { data: rulesData, isLoading, error, refetch } = useQuery({
    queryKey: ['alert-rules'],
    queryFn: async () => {
      const response = await fetch('/api/monitoring/alerts/rules');
      if (!response.ok) {
        throw new Error('Failed to fetch alert rules');
      }
      return response.json();
    },
    refetchInterval: isRealTime ? 60000 : false,
  });

  // Create alert rule
  const createRule = useMutation({
    mutationFn: async (rule: Partial<AlertRule>) => {
      const response = await fetch('/api/monitoring/alerts/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rule),
      });
      if (!response.ok) {
        throw new Error('Failed to create alert rule');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-rules'] });
    },
  });

  // Update alert rule
  const updateRule = useMutation({
    mutationFn: async ({ ruleId, updates }: { ruleId: string; updates: Partial<AlertRule> }) => {
      const response = await fetch(`/api/monitoring/alerts/rules/${ruleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new Error('Failed to update alert rule');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-rules'] });
    },
  });

  // Delete alert rule
  const deleteRule = useMutation({
    mutationFn: async (ruleId: string) => {
      const response = await fetch(`/api/monitoring/alerts/rules/${ruleId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete alert rule');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-rules'] });
    },
  });

  // Toggle rule enabled status
  const toggleRule = useMutation({
    mutationFn: async ({ ruleId, enabled }: { ruleId: string; enabled: boolean }) => {
      return updateRule.mutateAsync({ 
        ruleId, 
        updates: { enabled } 
      });
    },
  });

  return {
    rules: rulesData?.rules || [],
    isLoading,
    error,
    isRealTime,
    setIsRealTime,
    refetch,
    
    // Actions
    createRule: createRule.mutate,
    updateRule: updateRule.mutate,
    deleteRule: deleteRule.mutate,
    toggleRule: toggleRule.mutate,
    
    // States
    isCreating: createRule.isPending,
    isUpdating: updateRule.isPending,
    isDeleting: deleteRule.isPending,
    isToggling: toggleRule.isPending,
  };
}

// Incident Management Hook
export function useIncidents(options: {
  status?: string;
  severity?: string;
  timeRange?: string;
} = {}) {
  const [isRealTime, setIsRealTime] = useState(false);
  const queryClient = useQueryClient();

  // Fetch incidents
  const { data: incidentsData, isLoading, error, refetch } = useQuery({
    queryKey: ['incidents', options],
    queryFn: async () => {
      const params = new URLSearchParams({
        ...(options.status && { status: options.status }),
        ...(options.severity && { severity: options.severity }),
        ...(options.timeRange && { timeRange: options.timeRange }),
      });
      
      const response = await fetch(`/api/monitoring/alerts/incidents?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch incidents');
      }
      return response.json();
    },
    refetchInterval: isRealTime ? 30000 : false,
  });

  // Create incident
  const createIncident = useMutation({
    mutationFn: async (incident: Partial<IncidentResponse>) => {
      const response = await fetch('/api/monitoring/alerts/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incident),
      });
      if (!response.ok) {
        throw new Error('Failed to create incident');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    },
  });

  // Update incident
  const updateIncident = useMutation({
    mutationFn: async ({ 
      incidentId, 
      updates 
    }: { 
      incidentId: string; 
      updates: Partial<IncidentResponse>;
    }) => {
      const response = await fetch(`/api/monitoring/alerts/incidents/${incidentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new Error('Failed to update incident');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    },
  });

  return {
    incidents: incidentsData?.incidents || [],
    metrics: incidentsData?.metrics,
    isLoading,
    error,
    isRealTime,
    setIsRealTime,
    refetch,
    
    // Actions
    createIncident: createIncident.mutate,
    updateIncident: updateIncident.mutate,
    
    // States
    isCreating: createIncident.isPending,
    isUpdating: updateIncident.isPending,
  };
}

// Alert Notification Hook
export function useAlertNotifications() {
  const [notifications, setNotifications] = useState<Alert[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [desktopNotifications, setDesktopNotifications] = useState(false);

  // Add new alert notification
  const addNotification = useCallback((alert: Alert) => {
    setNotifications(prev => [
      {
        ...alert,
        id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
      },
      ...prev.slice(0, 9) // Keep only last 10 notifications
    ]);

    // Play sound for critical alerts
    if (soundEnabled && alert.severity === 'critical') {
      playAlertSound();
    }

    // Show desktop notification
    if (desktopNotifications && 'Notification' in window && Notification.permission === 'granted') {
      showDesktopNotification(alert);
    }
  }, [soundEnabled, desktopNotifications]);

  // Remove notification
  const removeNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Request desktop notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setDesktopNotifications(permission === 'granted');
      return permission === 'granted';
    }
    return false;
  }, []);

  // Play alert sound
  const playAlertSound = useCallback(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio('/sounds/alert.mp3'); // Assuming alert sound file
      audio.play().catch(console.error);
    }
  }, []);

  // Show desktop notification
  const showDesktopNotification = useCallback((alert: Alert) => {
    if (Notification.permission === 'granted') {
      new Notification(`Alert: ${alert.title}`, {
        body: alert.message,
        icon: '/icons/alert-icon.png',
        tag: alert.id,
        requireInteraction: alert.severity === 'critical',
      });
    }
  }, []);

  // Auto-remove notifications after timeout
  useEffect(() => {
    const timeouts = notifications.map(notification => 
      setTimeout(() => {
        removeNotification(notification.id);
      }, 10000) // 10 second timeout
    );

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [notifications, removeNotification]);

  return {
    notifications,
    soundEnabled,
    desktopNotifications,
    setSoundEnabled,
    setDesktopNotifications,
    addNotification,
    removeNotification,
    clearNotifications,
    requestNotificationPermission,
  };
}

// Alert Analytics Hook
export function useAlertAnalytics(timeRange: string = '24h') {
  // Fetch alert analytics data
  const { data: analyticsData, isLoading, error, refetch } = useQuery({
    queryKey: ['alert-analytics', timeRange],
    queryFn: async () => {
      const response = await fetch(`/api/monitoring/alerts/analytics?timeRange=${timeRange}`);
      if (!response.ok) {
        throw new Error('Failed to fetch alert analytics');
      }
      return response.json();
    },
    refetchInterval: 300000, // 5 minutes
  });

  // Calculate alert trends
  const getAlertTrends = useCallback(() => {
    if (!analyticsData?.trends) return [];
    return analyticsData.trends;
  }, [analyticsData]);

  // Get most active categories
  const getTopCategories = useCallback(() => {
    if (!analyticsData?.topCategories) return [];
    return analyticsData.topCategories;
  }, [analyticsData]);

  // Get response time metrics
  const getResponseTimeMetrics = useCallback(() => {
    if (!analyticsData?.responseTime) return null;
    return analyticsData.responseTime;
  }, [analyticsData]);

  return {
    analytics: analyticsData,
    isLoading,
    error,
    refetch,
    getAlertTrends,
    getTopCategories,
    getResponseTimeMetrics,
  };
}

// Real-time Alert Monitoring Hook
export function useRealtimeAlerts() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const alertRef = useRef<EventSource | null>(null);
  const queryClient = useQueryClient();

  // Connect to WebSocket for real-time alerts
  const connect = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      // Create WebSocket connection for real-time alerts
      const ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/monitoring/alerts/ws`);
      
      ws.onopen = () => {
        setIsConnected(true);
        setLastUpdate(new Date());
      };

      ws.onmessage = (event) => {
        try {
          const alert: Alert = JSON.parse(event.data);
          setLastUpdate(new Date());
          
          // Update cache with new alert
          queryClient.setQueryData(['alerts'], (old: any) => {
            if (!old?.alerts) return old;
            return {
              ...old,
              alerts: [alert, ...old.alerts.slice(0, 49)], // Keep first 50
            };
          });
        } catch (error) {
          console.error('Failed to parse alert:', error);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        // Attempt to reconnect after 5 seconds
        setTimeout(connect, 5000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

      alertRef.current = ws;
    } catch (error) {
      console.error('Failed to connect to alert WebSocket:', error);
    }
  }, [queryClient]);

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    if (alertRef.current) {
      alertRef.current.close();
      alertRef.current = null;
      setIsConnected(false);
    }
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    lastUpdate,
    connect,
    disconnect,
  };
}