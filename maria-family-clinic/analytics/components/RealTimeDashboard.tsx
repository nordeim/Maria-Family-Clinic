// Real-Time Healthcare Analytics Dashboard
// Sub-Phase 10.1: Advanced Analytics & Tracking System Architecture

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  DashboardType, 
  RealTimeMetrics,
  WebSocketMessage,
  DashboardWidget,
  Alert,
  TimeRangeKey 
} from '../types/analytics.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert as AlertComponent, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Users, 
  Clock, 
  TrendingUp, 
  Shield, 
  AlertTriangle,
  RefreshCw,
  Settings,
  Download,
  Bell,
  Play,
  Pause
} from 'lucide-react';

// Individual dashboard components
import { ExecutiveDashboard } from './dashboards/ExecutiveDashboard';
import { OperationalDashboard } from './dashboards/OperationalDashboard';
import { HealthcareDashboard } from './dashboards/HealthcareDashboard';
import { MarketingDashboard } from './dashboards/MarketingDashboard';
import { ComplianceDashboard } from './dashboards/ComplianceDashboard';

// Dashboard controls component
interface DashboardControlsProps {
  isRealTimeActive: boolean;
  refreshInterval: number;
  selectedTimeRange: TimeRangeKey;
  onToggleRealTime: () => void;
  onRefreshIntervalChange: (interval: number) => void;
  onTimeRangeChange: (range: TimeRangeKey) => void;
  onExport: () => void;
  onSettings: () => void;
}

function DashboardControls({
  isRealTimeActive,
  refreshInterval,
  selectedTimeRange,
  onToggleRealTime,
  onRefreshIntervalChange,
  onTimeRangeChange,
  onExport,
  onSettings,
}: DashboardControlsProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center space-x-2">
        <Button
          variant={isRealTimeActive ? "default" : "outline"}
          size="sm"
          onClick={onToggleRealTime}
        >
          {isRealTimeActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {isRealTimeActive ? 'Live' : 'Paused'}
        </Button>
        
        <select
          value={selectedTimeRange}
          onChange={(e) => onTimeRangeChange(e.target.value as TimeRangeKey)}
          className="px-3 py-1 text-sm border rounded"
        >
          <option value="1h">Last Hour</option>
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
        
        <select
          value={refreshInterval}
          onChange={(e) => onRefreshIntervalChange(Number(e.target.value))}
          className="px-3 py-1 text-sm border rounded"
        >
          <option value={5}>5s</option>
          <option value={10}>10s</option>
          <option value={30}>30s</option>
          <option value={60}>1m</option>
        </select>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="h-4 w-4" />
          Export
        </Button>
        <Button variant="outline" size="sm" onClick={onSettings}>
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      </div>
    </div>
  );
}

// Alert panel component
interface AlertPanelProps {
  alerts: Alert[];
  onAcknowledge: (alertId: string) => void;
}

function AlertPanel({ alerts, onAcknowledge }: AlertPanelProps) {
  const [showAll, setShowAll] = useState(false);
  
  const visibleAlerts = showAll ? alerts : alerts.slice(0, 5);
  const criticalAlerts = alerts.filter(a => a.severity === 'critical' && !a.acknowledged);

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Alerts & Notifications</span>
            {criticalAlerts.length > 0 && (
              <Badge variant="destructive">{criticalAlerts.length}</Badge>
            )}
          </CardTitle>
          <Badge variant={criticalAlerts.length > 0 ? "destructive" : "secondary"}>
            {alerts.filter(a => !a.acknowledged).length} Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <p className="text-muted-foreground text-sm">No active alerts</p>
        ) : (
          <div className="space-y-2">
            {visibleAlerts.map((alert) => (
              <Alert 
                key={alert.id} 
                className={`${alert.severity === 'critical' ? 'border-red-500' : 
                           alert.severity === 'warning' ? 'border-yellow-500' : 'border-blue-500'}`}
              >
                <AlertTriangle className="h-4 w-4" />
                <div className="flex-1">
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{alert.title}</span>
                        <p className="text-sm text-muted-foreground">{alert.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {alert.timestamp.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={
                          alert.severity === 'critical' ? 'destructive' :
                          alert.severity === 'warning' ? 'default' : 'secondary'
                        }>
                          {alert.severity}
                        </Badge>
                        {!alert.acknowledged && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onAcknowledge(alert.id)}
                          >
                            Acknowledge
                          </Button>
                        )}
                      </div>
                    </div>
                  </AlertDescription>
                </div>
              </Alert>
            ))}
            
            {alerts.length > 5 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? 'Show Less' : `Show ${alerts.length - 5} More`}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Main Real-Time Dashboard component
interface RealTimeDashboardProps {
  clinicId?: string;
  userRole: 'admin' | 'manager' | 'staff' | 'analyst';
  enableAlerts?: boolean;
  enableExport?: boolean;
  customWidgets?: DashboardWidget[];
}

export function RealTimeDashboard({
  clinicId,
  userRole,
  enableAlerts = true,
  enableExport = true,
  customWidgets,
}: RealTimeDashboardProps) {
  const [activeDashboard, setActiveDashboard] = useState<DashboardType>(DashboardType.EXECUTIVE);
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetrics | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isRealTimeActive, setIsRealTimeActive] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRangeKey>('24h');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // WebSocket connection
  useEffect(() => {
    if (!isRealTimeActive) return;

    // Simulate WebSocket connection for real-time data
    const connection = new WebSocket('ws://localhost:3000/analytics/stream');
    
    connection.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        handleWebSocketMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    connection.onerror = (error) => {
      console.error('WebSocket connection error:', error);
      // Fallback to polling
      startPolling();
    };

    // Clean up connection on unmount
    return () => {
      connection.close();
      stopPolling();
    };
  }, [isRealTimeActive, refreshInterval]);

  const handleWebSocketMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case 'analytics_update':
        setRealTimeMetrics(message.payload);
        setLastUpdate(new Date());
        break;
      case 'alert':
        setAlerts(prev => {
          const updated = [...prev];
          const existingIndex = updated.findIndex(a => a.id === message.payload.id);
          if (existingIndex >= 0) {
            updated[existingIndex] = message.payload;
          } else {
            updated.unshift(message.payload);
          }
          return updated.slice(0, 50); // Keep only last 50 alerts
        });
        break;
      case 'dashboard_refresh':
        // Handle dashboard-specific updates
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  };

  // Polling fallback
  let pollingInterval: NodeJS.Timeout | null = null;
  
  const startPolling = () => {
    pollingInterval = setInterval(async () => {
      await fetchRealTimeMetrics();
    }, refreshInterval * 1000);
  };

  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  };

  const fetchRealTimeMetrics = async () => {
    try {
      const response = await fetch(`/api/analytics/realtime?clinicId=${clinicId}&range=${selectedTimeRange}`);
      const data = await response.json();
      
      if (data.success) {
        setRealTimeMetrics(data.data);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error fetching real-time metrics:', error);
    }
  };

  // Initial load
  useEffect(() => {
    fetchRealTimeMetrics();
  }, [clinicId, selectedTimeRange]);

  // Auto-refresh when not using WebSocket
  useEffect(() => {
    if (!isRealTimeActive) {
      startPolling();
      return () => stopPolling();
    }
  }, [isRealTimeActive, refreshInterval, selectedTimeRange]);

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await fetch('/api/analytics/alerts/acknowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId }),
      });
      
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, acknowledged: true, resolvedAt: new Date() }
          : alert
      ));
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const handleExport = () => {
    const data = {
      dashboardType: activeDashboard,
      metrics: realTimeMetrics,
      alerts: alerts.filter(a => !a.acknowledged),
      lastUpdate,
      timeRange: selectedTimeRange,
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-dashboard-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSettings = () => {
    // Open settings modal/drawer
    console.log('Opening dashboard settings');
  };

  // Dashboard access control
  const getAccessibleDashboards = (): DashboardType[] => {
    switch (userRole) {
      case 'admin':
        return Object.values(DashboardType);
      case 'manager':
        return [DashboardType.EXECUTIVE, DashboardType.OPERATIONAL, DashboardType.HEALTHCARE];
      case 'staff':
        return [DashboardType.OPERATIONAL, DashboardType.HEALTHCARE];
      case 'analyst':
        return [DashboardType.MARKETING, DashboardType.COMPLIANCE];
      default:
        return [DashboardType.HEALTHCARE];
    }
  };

  const accessibleDashboards = getAccessibleDashboards();

  // Get dashboard title and description
  const getDashboardInfo = (dashboard: DashboardType) => {
    switch (dashboard) {
      case DashboardType.EXECUTIVE:
        return {
          title: 'Executive Dashboard',
          description: 'High-level KPIs and business metrics for clinic administrators',
          icon: <TrendingUp className="h-5 w-5" />,
        };
      case DashboardType.OPERATIONAL:
        return {
          title: 'Operational Dashboard',
          description: 'Real-time clinic performance and capacity metrics',
          icon: <Activity className="h-5 w-5" />,
        };
      case DashboardType.HEALTHCARE:
        return {
          title: 'Healthcare Dashboard',
          description: 'Medical service popularity, doctor utilization, patient flow',
          icon: <Users className="h-5 w-5" />,
        };
      case DashboardType.MARKETING:
        return {
          title: 'Marketing Dashboard',
          description: 'Campaign performance, user acquisition, retention metrics',
          icon: <TrendingUp className="h-5 w-5" />,
        };
      case DashboardType.COMPLIANCE:
        return {
          title: 'Compliance Dashboard',
          description: 'PDPA compliance metrics, security monitoring, audit trails',
          icon: <Shield className="h-5 w-5" />,
        };
      default:
        return {
          title: 'Dashboard',
          description: 'Analytics dashboard',
          icon: <Activity className="h-5 w-5" />,
        };
    }
  };

  const dashboardInfo = getDashboardInfo(activeDashboard);

  // Memoized dashboard components
  const renderDashboard = useMemo(() => {
    const commonProps = {
      clinicId,
      metrics: realTimeMetrics,
      timeRange: selectedTimeRange,
      isRealTimeActive,
      customWidgets,
    };

    switch (activeDashboard) {
      case DashboardType.EXECUTIVE:
        return <ExecutiveDashboard {...commonProps} />;
      case DashboardType.OPERATIONAL:
        return <OperationalDashboard {...commonProps} />;
      case DashboardType.HEALTHCARE:
        return <HealthcareDashboard {...commonProps} />;
      case DashboardType.MARKETING:
        return <MarketingDashboard {...commonProps} />;
      case DashboardType.COMPLIANCE:
        return <ComplianceDashboard {...commonProps} />;
      default:
        return <div>Dashboard not implemented</div>;
    }
  }, [activeDashboard, realTimeMetrics, selectedTimeRange, isRealTimeActive, clinicId, customWidgets]);

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Real-Time Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive healthcare analytics and performance monitoring
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Last Updated</div>
            <div className="font-medium">{lastUpdate.toLocaleTimeString()}</div>
          </div>
          <Badge variant={isRealTimeActive ? "default" : "secondary"}>
            {isRealTimeActive ? (
              <><RefreshCw className="h-3 w-3 mr-1 animate-spin" />Live</>
            ) : (
              <>Paused</>
            )}
          </Badge>
        </div>
      </div>

      {/* Quick Metrics Overview */}
      {realTimeMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{realTimeMetrics.activeUsers}</div>
              <p className="text-xs text-muted-foreground">
                Real-time concurrent users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Appointments</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{realTimeMetrics.concurrentAppointments}</div>
              <p className="text-xs text-muted-foreground">
                Ongoing consultations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Load Time</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{realTimeMetrics.currentLoadTime}ms</div>
              <p className="text-xs text-muted-foreground">
                Average page load time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(realTimeMetrics.conversionRate * 100).toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Appointment bookings
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alerts Panel */}
      {enableAlerts && alerts.length > 0 && (
        <AlertPanel 
          alerts={alerts.filter(a => !a.acknowledged)} 
          onAcknowledge={handleAcknowledgeAlert}
        />
      )}

      {/* Dashboard Controls */}
      <DashboardControls
        isRealTimeActive={isRealTimeActive}
        refreshInterval={refreshInterval}
        selectedTimeRange={selectedTimeRange}
        onToggleRealTime={() => setIsRealTimeActive(!isRealTimeActive)}
        onRefreshIntervalChange={setRefreshInterval}
        onTimeRangeChange={setSelectedTimeRange}
        onExport={enableExport ? handleExport : () => {}}
        onSettings={handleSettings}
      />

      {/* Dashboard Tabs */}
      <Tabs value={activeDashboard} onValueChange={(value) => setActiveDashboard(value as DashboardType)}>
        <TabsList className="grid w-full grid-cols-5">
          {accessibleDashboards.map((dashboard) => {
            const info = getDashboardInfo(dashboard);
            return (
              <TabsTrigger key={dashboard} value={dashboard} className="flex items-center space-x-2">
                {info.icon}
                <span className="hidden md:inline">{info.title.split(' ')[0]}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {accessibleDashboards.map((dashboard) => {
          const info = getDashboardInfo(dashboard);
          return (
            <TabsContent key={dashboard} value={dashboard}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {info.icon}
                    <span>{info.title}</span>
                  </CardTitle>
                  <CardDescription>{info.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {renderDashboard}
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Connection Status */}
      <div className="fixed bottom-4 right-4">
        <Card className="p-2">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isRealTimeActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-xs text-muted-foreground">
              {isRealTimeActive ? 'WebSocket Connected' : 'Polling Mode'}
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}