// Operational Dashboard Component
// Sub-Phase 10.1: Advanced Analytics & Tracking System Architecture

'use client';

import React, { useMemo } from 'react';
import { RealTimeMetrics, TimeRangeKey, DashboardWidget } from '../../types/analytics.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Users,
  Calendar,
  Zap,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Gauge
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  ScatterChart,
  Scatter,
} from 'recharts';

interface OperationalDashboardProps {
  clinicId?: string;
  metrics: RealTimeMetrics | null;
  timeRange: TimeRangeKey;
  isRealTimeActive: boolean;
  customWidgets?: DashboardWidget[];
}

// Mock operational data
const operationalMetrics = {
  systemHealth: {
    overall: 95.2,
    components: [
      { name: 'Web Application', status: 'healthy', uptime: 99.9, responseTime: 120 },
      { name: 'Database', status: 'healthy', uptime: 99.8, responseTime: 45 },
      { name: 'API Gateway', status: 'warning', uptime: 98.5, responseTime: 180 },
      { name: 'Analytics Engine', status: 'healthy', uptime: 99.7, responseTime: 89 },
    ],
  },
  performanceMetrics: {
    avgLoadTime: 1250,
    avgResponseTime: 340,
    errorRate: 0.8,
    throughput: 1250, // requests per minute
    uptime: 99.7,
    availability: 99.9,
  },
  capacityMetrics: {
    currentLoad: 68,
    peakLoad: 85,
    memoryUsage: 72,
    cpuUsage: 45,
    networkUtilization: 38,
    storageUsage: 56,
  },
  realTimeData: [
    { time: '00:00', activeUsers: 45, responseTime: 280, errorRate: 0.2 },
    { time: '04:00', activeUsers: 12, responseTime: 220, errorRate: 0.1 },
    { time: '08:00', activeUsers: 120, responseTime: 340, errorRate: 0.5 },
    { time: '12:00', activeUsers: 280, responseTime: 420, errorRate: 0.8 },
    { time: '16:00', activeUsers: 180, responseTime: 360, errorRate: 0.6 },
    { time: '20:00', activeUsers: 95, responseTime: 290, errorRate: 0.3 },
  ],
  errorAnalysis: [
    { type: 'Network Timeout', count: 45, percentage: 35, severity: 'medium' },
    { type: 'Database Query', count: 32, percentage: 25, severity: 'high' },
    { type: 'API Rate Limit', count: 28, percentage: 22, severity: 'low' },
    { type: 'Client Error', count: 23, percentage: 18, severity: 'low' },
  ],
  resourceUtilization: [
    { resource: 'CPU', usage: 45, threshold: 80, status: 'normal' },
    { resource: 'Memory', usage: 72, threshold: 85, status: 'warning' },
    { resource: 'Storage', usage: 56, threshold: 90, status: 'normal' },
    { resource: 'Network', usage: 38, threshold: 75, status: 'normal' },
  ],
  incidents: [
    {
      id: 'INC-001',
      title: 'High Response Time - API Gateway',
      status: 'investigating',
      severity: 'medium',
      time: '10:23',
      assignedTo: 'DevOps Team',
    },
    {
      id: 'INC-002',
      title: 'Database Performance Degradation',
      status: 'resolved',
      severity: 'high',
      time: '09:15',
      resolvedAt: '09:45',
      assignedTo: 'Database Team',
    },
  ],
};

// System Health Component
function SystemHealthCard() {
  const healthPercentage = operationalMetrics.systemHealth.overall;
  const getHealthColor = () => {
    if (healthPercentage >= 95) return 'text-green-600';
    if (healthPercentage >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthStatus = () => {
    if (healthPercentage >= 95) return 'Healthy';
    if (healthPercentage >= 85) return 'Warning';
    return 'Critical';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <span>System Health</span>
          <Badge variant={healthPercentage >= 95 ? "default" : "destructive"}>
            {getHealthStatus()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <div className={`text-3xl font-bold ${getHealthColor()}`}>
              {healthPercentage}%
            </div>
            <div className="text-sm text-muted-foreground">Overall System Health</div>
          </div>
          
          <div className="space-y-2">
            {operationalMetrics.systemHealth.components.map((component) => (
              <div key={component.name} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    component.status === 'healthy' ? 'bg-green-500' : 
                    component.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <span className="text-sm font-medium">{component.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{component.uptime}% uptime</div>
                  <div className="text-xs text-muted-foreground">{component.responseTime}ms</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Performance Metrics Component
function PerformanceMetricsCard() {
  const { avgLoadTime, avgResponseTime, errorRate, throughput, uptime } = operationalMetrics.performanceMetrics;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Gauge className="h-5 w-5" />
          <span>Performance Metrics</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 border rounded-lg">
            <div className="text-xl font-bold text-blue-600">{avgLoadTime}ms</div>
            <div className="text-xs text-muted-foreground">Avg Load Time</div>
          </div>
          <div className="text-center p-3 border rounded-lg">
            <div className="text-xl font-bold text-green-600">{avgResponseTime}ms</div>
            <div className="text-xs text-muted-foreground">Avg Response Time</div>
          </div>
          <div className="text-center p-3 border rounded-lg">
            <div className="text-xl font-bold text-purple-600">{errorRate}%</div>
            <div className="text-xs text-muted-foreground">Error Rate</div>
          </div>
          <div className="text-center p-3 border rounded-lg">
            <div className="text-xl font-bold text-orange-600">{throughput}</div>
            <div className="text-xs text-muted-foreground">Req/Min</div>
          </div>
        </div>
        
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>System Uptime</span>
            <span className="font-medium">{uptime}%</span>
          </div>
          <Progress value={uptime} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}

// Capacity Utilization Component
function CapacityUtilizationCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5" />
          <span>Resource Utilization</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {operationalMetrics.resourceUtilization.map((resource) => {
            const getStatusColor = () => {
              if (resource.status === 'normal') return 'bg-green-500';
              if (resource.status === 'warning') return 'bg-yellow-500';
              return 'bg-red-500';
            };

            return (
              <div key={resource.resource} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{resource.resource}</span>
                  <span>{resource.usage}%</span>
                </div>
                <Progress 
                  value={resource.usage} 
                  className="h-2"
                  style={{
                    background: `${getStatusColor()}20`,
                  }}
                />
                <div className="text-xs text-muted-foreground">
                  Threshold: {resource.threshold}%
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Real-time Performance Chart Component
function RealTimePerformanceChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Real-time Performance</CardTitle>
        <CardDescription>
          System performance metrics over the last 24 hours
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={operationalMetrics.realTimeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Bar yAxisId="left" dataKey="activeUsers" fill="#3B82F6" name="Active Users" />
            <Line yAxisId="right" type="monotone" dataKey="responseTime" stroke="#EF4444" name="Response Time (ms)" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Error Analysis Component
function ErrorAnalysisCard() {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <XCircle className="h-5 w-5" />
          <span>Error Analysis</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {operationalMetrics.errorAnalysis.map((error) => (
            <div key={error.type} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm">{error.type}</span>
                  <Badge className={getSeverityColor(error.severity)}>
                    {error.severity}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {error.count} occurrences ({error.percentage}%)
                </div>
              </div>
              <div className="w-16 h-2 bg-gray-200 rounded">
                <div 
                  className="h-2 bg-red-500 rounded"
                  style={{ width: `${error.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Incident Management Component
function IncidentManagementCard() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'investigating': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      default: return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'investigating': return <Badge variant="default">Investigating</Badge>;
      case 'resolved': return <Badge variant="secondary">Resolved</Badge>;
      default: return <Badge variant="destructive">Open</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="h-5 w-5" />
          <span>Incident Management</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {operationalMetrics.incidents.map((incident) => (
            <div key={incident.id} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(incident.status)}
                  <span className="font-medium text-sm">{incident.id}</span>
                </div>
                {getStatusBadge(incident.status)}
              </div>
              <div className="text-sm font-medium mb-1">{incident.title}</div>
              <div className="text-xs text-muted-foreground">
                Started: {incident.time} • Assigned to: {incident.assignedTo}
              </div>
              {incident.resolvedAt && (
                <div className="text-xs text-green-600 mt-1">
                  Resolved: {incident.resolvedAt}
                </div>
              )}
            </div>
          ))}
          
          <Button variant="outline" className="w-full">
            View All Incidents
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Capacity Planning Component
function CapacityPlanningCard() {
  const { currentLoad, peakLoad, memoryUsage, cpuUsage } = operationalMetrics.capacityMetrics;

  const capacityData = [
    { hour: '00', load: 25, capacity: 100 },
    { hour: '04', load: 15, capacity: 100 },
    { hour: '08', load: 45, capacity: 100 },
    { hour: '12', load: 68, capacity: 100 },
    { hour: '16', load: 55, capacity: 100 },
    { hour: '20', load: 35, capacity: 100 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5" />
          <span>Capacity Planning</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 border rounded-lg">
              <div className="text-xl font-bold text-blue-600">{currentLoad}%</div>
              <div className="text-xs text-muted-foreground">Current Load</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-xl font-bold text-orange-600">{peakLoad}%</div>
              <div className="text-xs text-muted-foreground">Peak Load</div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={capacityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="capacity" 
                stroke="#E5E7EB" 
                fill="#E5E7EB"
                fillOpacity={0.3}
              />
              <Area 
                type="monotone" 
                dataKey="load" 
                stroke="#3B82F6" 
                fill="#3B82F6"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// Operational Alerts Component
function OperationalAlerts() {
  const alerts = [
    {
      id: 1,
      type: 'warning',
      message: 'API Gateway response time exceeded 150ms',
      time: '2 minutes ago',
      severity: 'medium',
    },
    {
      id: 2,
      type: 'info',
      message: 'Database backup completed successfully',
      time: '15 minutes ago',
      severity: 'low',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5" />
          <span>Operational Alerts</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`p-3 border rounded-lg ${
                alert.type === 'warning' ? 'border-yellow-200 bg-yellow-50' : 'border-blue-200 bg-blue-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-sm font-medium">{alert.message}</div>
                  <div className="text-xs text-muted-foreground mt-1">{alert.time}</div>
                </div>
                <Badge variant="outline" className="ml-2">
                  {alert.severity}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Main Operational Dashboard Component
export function OperationalDashboard({
  clinicId,
  metrics,
  timeRange,
  isRealTimeActive,
  customWidgets,
}: OperationalDashboardProps) {
  // Calculate real-time operational status
  const operationalStatus = useMemo(() => {
    if (!metrics) return null;

    return {
      systemLoad: metrics.currentLoadTime < 2000 ? 'normal' : 'high',
      errorStatus: metrics.errorRate < 0.05 ? 'normal' : metrics.errorRate < 0.1 ? 'warning' : 'critical',
      responseStatus: metrics.currentLoadTime < 1500 ? 'optimal' : 'degraded',
    };
  }, [metrics]);

  if (customWidgets && customWidgets.length > 0) {
    return (
      <div className="space-y-6">
        {customWidgets.map((widget) => (
          <Card key={widget.id}>
            <CardHeader>
              <CardTitle>{widget.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div dangerouslySetInnerHTML={{ __html: widget.dataSource }} />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Real-time Status Overview */}
      {metrics && operationalStatus && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`flex items-center space-x-2 p-3 border rounded-lg ${
            operationalStatus.systemLoad === 'normal' ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              operationalStatus.systemLoad === 'normal' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
            }`} />
            <span className="text-sm font-medium">
              System Load: {operationalStatus.systemLoad}
            </span>
          </div>
          <div className={`flex items-center space-x-2 p-3 border rounded-lg ${
            operationalStatus.errorStatus === 'normal' ? 'bg-green-50 border-green-200' : 
            operationalStatus.errorStatus === 'warning' ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              operationalStatus.errorStatus === 'normal' ? 'bg-green-500 animate-pulse' : 
              operationalStatus.errorStatus === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
            <span className="text-sm font-medium">
              Error Rate: {operationalStatus.errorStatus}
            </span>
          </div>
          <div className={`flex items-center space-x-2 p-3 border rounded-lg ${
            operationalStatus.responseStatus === 'optimal' ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              operationalStatus.responseStatus === 'optimal' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
            }`} />
            <span className="text-sm font-medium">
              Response: {operationalStatus.responseStatus}
            </span>
          </div>
        </div>
      )}

      {/* System Health and Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SystemHealthCard />
        <PerformanceMetricsCard />
        <CapacityUtilizationCard />
      </div>

      {/* Real-time Performance Chart */}
      <RealTimePerformanceChart />

      {/* Operational Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ErrorAnalysisCard />
        <IncidentManagementCard />
      </div>

      {/* Capacity Planning and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CapacityPlanningCard />
        <OperationalAlerts />
      </div>

      {/* Operational Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Operational Summary</CardTitle>
          <CardDescription>
            Current system status and key operational insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                System Status
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center justify-between">
                  <span>Overall System Health</span>
                  <Badge variant="default">Excellent (95.2%)</Badge>
                </li>
                <li className="flex items-center justify-between">
                  <span>Current Load</span>
                  <Badge variant="outline">68% (Normal)</Badge>
                </li>
                <li className="flex items-center justify-between">
                  <span>Error Rate</span>
                  <Badge variant="outline">0.8% (Acceptable)</Badge>
                </li>
                <li className="flex items-center justify-between">
                  <span>Active Users</span>
                  <Badge variant="outline">{metrics?.activeUsers || 0}</Badge>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-blue-600" />
                Performance Trends
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center justify-between">
                  <span>Response Time Trend</span>
                  <Badge variant="secondary">Stable</Badge>
                </li>
                <li className="flex items-center justify-between">
                  <span>Throughput</span>
                  <Badge variant="secondary">1,250 req/min</Badge>
                </li>
                <li className="flex items-center justify-between">
                  <span>Memory Usage</span>
                  <Badge variant="destructive">72% (Warning)</Badge>
                </li>
                <li className="flex items-center justify-between">
                  <span>Uptime</span>
                  <Badge variant="default">99.7%</Badge>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}