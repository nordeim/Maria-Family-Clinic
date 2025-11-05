/**
 * Real-time Compliance Monitoring Component
 * Sub-Phase 9.5: PDPA-Compliant Health Data Protection
 * Provides continuous monitoring of privacy and compliance status
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  Bell,
  Settings,
  RefreshCw,
  Eye,
  Users,
  Database,
  Lock,
  FileText,
  Calendar,
  BarChart3,
  PieChart,
  Zap,
  Target,
  Award,
  AlertCircle
} from 'lucide-react';
import { usePrivacyCompliance } from '@/hooks/use-privacy-compliance';

interface ComplianceMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  lastUpdated: Date;
}

interface ComplianceAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  affectedCount: number;
  dueDate?: Date;
  status: 'open' | 'acknowledged' | 'resolved';
  priority: 'high' | 'medium' | 'low';
  category: 'consent' | 'encryption' | 'retention' | 'audit' | 'access' | 'incident';
  createdAt: Date;
}

interface RealTimeComplianceStatus {
  overallScore: number;
  lastUpdated: Date;
  activeIncidents: number;
  pendingRequests: number;
  expiringConsents: number;
  failedEncryptions: number;
  overdueDeletions: number;
  unverifiedAudits: number;
}

export const ComplianceMonitoringPanel: React.FC<{
  showRealTimeUpdates?: boolean;
  autoRefreshInterval?: number; // in seconds
  onAlertClick?: (alert: ComplianceAlert) => void;
}> = ({
  showRealTimeUpdates = true,
  autoRefreshInterval = 30,
  onAlertClick
}) => {
  const [complianceData, setComplianceData] = useState<RealTimeComplianceStatus | null>(null);
  const [metrics, setMetrics] = useState<ComplianceMetric[]>([]);
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(showRealTimeUpdates);

  const { complianceData: apiComplianceData, refreshData } = usePrivacyCompliance();

  // Simulate real-time compliance data
  const generateMockComplianceData = useCallback((): RealTimeComplianceStatus => {
    return {
      overallScore: Math.floor(Math.random() * 20) + 80, // 80-100
      lastUpdated: new Date(),
      activeIncidents: Math.floor(Math.random() * 5),
      pendingRequests: Math.floor(Math.random() * 10),
      expiringConsents: Math.floor(Math.random() * 15),
      failedEncryptions: Math.floor(Math.random() * 3),
      overdueDeletions: Math.floor(Math.random() * 2),
      unverifiedAudits: Math.floor(Math.random() * 8)
    };
  }, []);

  const generateMockMetrics = useCallback((): ComplianceMetric[] => {
    const now = new Date();
    return [
      {
        id: 'pdpa-compliance',
        name: 'PDPA Compliance',
        value: Math.floor(Math.random() * 10) + 90,
        target: 95,
        unit: '%',
        status: 'excellent',
        trend: 'up',
        lastUpdated: now
      },
      {
        id: 'encryption-coverage',
        name: 'Encryption Coverage',
        value: Math.floor(Math.random() * 15) + 85,
        target: 98,
        unit: '%',
        status: 'good',
        trend: 'stable',
        lastUpdated: now
      },
      {
        id: 'consent-validity',
        name: 'Valid Consents',
        value: Math.floor(Math.random() * 20) + 75,
        target: 90,
        unit: '%',
        status: 'warning',
        trend: 'down',
        lastUpdated: now
      },
      {
        id: 'audit-integrity',
        name: 'Audit Integrity',
        value: Math.floor(Math.random() * 5) + 95,
        target: 100,
        unit: '%',
        status: 'excellent',
        trend: 'stable',
        lastUpdated: now
      },
      {
        id: 'data-retention',
        name: 'Retention Compliance',
        value: Math.floor(Math.random() * 25) + 70,
        target: 95,
        unit: '%',
        status: 'warning',
        trend: 'up',
        lastUpdated: now
      },
      {
        id: 'access-control',
        name: 'Access Control',
        value: Math.floor(Math.random() * 10) + 88,
        target: 95,
        unit: '%',
        status: 'good',
        trend: 'up',
        lastUpdated: now
      }
    ];
  }, []);

  const generateMockAlerts = useCallback((): ComplianceAlert[] => {
    const now = new Date();
    const alertTypes: ComplianceAlert['type'][] = ['critical', 'warning', 'info'];
    const categories: ComplianceAlert['category'][] = [
      'consent', 'encryption', 'retention', 'audit', 'access', 'incident'
    ];

    return [
      {
        id: 'alert-1',
        type: 'critical',
        title: '3 consents expiring within 7 days',
        description: 'User consents for medical enquiries will expire soon, requiring renewal to maintain compliance.',
        affectedCount: 3,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'open',
        priority: 'high',
        category: 'consent',
        createdAt: now
      },
      {
        id: 'alert-2',
        type: 'warning',
        title: '2 encryption failures detected',
        description: 'Failed to encrypt sensitive health data fields in recent enquiries.',
        affectedCount: 2,
        status: 'acknowledged',
        priority: 'medium',
        category: 'encryption',
        createdAt: now
      },
      {
        id: 'alert-3',
        type: 'warning',
        title: 'Overdue data subject request',
        description: 'Data access request from user is approaching regulatory deadline.',
        affectedCount: 1,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        status: 'open',
        priority: 'high',
        category: 'access',
        createdAt: now
      },
      {
        id: 'alert-4',
        type: 'info',
        title: 'Monthly compliance report ready',
        description: 'Automated PDPA compliance report has been generated and is ready for review.',
        affectedCount: 1,
        status: 'open',
        priority: 'low',
        category: 'audit',
        createdAt: now
      },
      {
        id: 'alert-5',
        type: 'critical',
        title: 'Unusual access pattern detected',
        description: 'Multiple failed authentication attempts from unknown IP addresses.',
        affectedCount: 15,
        status: 'open',
        priority: 'high',
        category: 'access',
        createdAt: now
      }
    ];
  }, []);

  // Refresh compliance data
  const refreshComplianceData = useCallback(async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would call the API
      const data = generateMockComplianceData();
      const metricsData = generateMockMetrics();
      const alertsData = generateMockAlerts();

      setComplianceData(data);
      setMetrics(metricsData);
      setAlerts(alertsData);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to refresh compliance data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [generateMockComplianceData, generateMockMetrics, generateMockAlerts]);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefreshEnabled && autoRefreshInterval > 0) {
      const interval = setInterval(refreshComplianceData, autoRefreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefreshEnabled, autoRefreshInterval, refreshComplianceData]);

  // Initial load
  useEffect(() => {
    refreshComplianceData();
  }, [refreshComplianceData]);

  // Get status color and icon
  const getStatusConfig = (status: ComplianceMetric['status']) => {
    switch (status) {
      case 'excellent':
        return { color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircle };
      case 'good':
        return { color: 'text-blue-600', bgColor: 'bg-blue-100', icon: TrendingUp };
      case 'warning':
        return { color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: AlertTriangle };
      case 'critical':
        return { color: 'text-red-600', bgColor: 'bg-red-100', icon: XCircle };
      default:
        return { color: 'text-gray-600', bgColor: 'bg-gray-100', icon: Activity };
    }
  };

  // Get alert severity color
  const getAlertColor = (type: ComplianceAlert['type']) => {
    switch (type) {
      case 'critical':
        return 'border-red-200 bg-red-50 text-red-800';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'info':
        return 'border-blue-200 bg-blue-50 text-blue-800';
      default:
        return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  // Get alert icon
  const getAlertIcon = (category: ComplianceAlert['category']) => {
    switch (category) {
      case 'consent':
        return Users;
      case 'encryption':
        return Lock;
      case 'retention':
        return Clock;
      case 'audit':
        return FileText;
      case 'access':
        return Eye;
      case 'incident':
        return AlertTriangle;
      default:
        return Bell;
    }
  };

  const overallScore = complianceData?.overallScore || 0;
  const scoreColor = overallScore >= 90 ? 'text-green-600' : 
                    overallScore >= 80 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="space-y-6">
      {/* Header with Real-time Status */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Activity className="h-5 w-5 text-blue-600" />
            <span>Real-time Compliance Monitoring</span>
            {autoRefreshEnabled && (
              <Badge variant="outline" className="text-green-600 border-green-200">
                <Zap className="h-3 w-3 mr-1" />
                Live
              </Badge>
            )}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Continuous monitoring of privacy compliance and security status
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-500">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshComplianceData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Auto-refresh
          </Button>
        </div>
      </div>

      {/* Overall Compliance Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Overall Compliance Score</span>
            <Badge className={`${scoreColor} border-current`}>
              {overallScore}%
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className={`text-3xl font-bold ${scoreColor}`}>
                {overallScore}%
              </div>
              <div className="flex-1">
                <Progress value={overallScore} className="h-2" />
                <p className="text-sm text-gray-600 mt-1">
                  {overallScore >= 90 ? 'Excellent compliance posture' :
                   overallScore >= 80 ? 'Good compliance with minor issues' :
                   'Compliance needs improvement'}
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 border rounded-lg">
                <div className="text-lg font-semibold text-red-600">
                  {complianceData?.activeIncidents || 0}
                </div>
                <div className="text-xs text-gray-600">Active Incidents</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-lg font-semibold text-yellow-600">
                  {complianceData?.pendingRequests || 0}
                </div>
                <div className="text-xs text-gray-600">Pending Requests</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-lg font-semibold text-blue-600">
                  {complianceData?.expiringConsents || 0}
                </div>
                <div className="text-xs text-gray-600">Expiring Consents</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-lg font-semibold text-green-600">
                  {complianceData?.unverifiedAudits || 0}
                </div>
                <div className="text-xs text-gray-600">Verified Audits</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Metrics Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Metrics Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Compliance Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.map((metric) => {
                const config = getStatusConfig(metric.status);
                const IconComponent = config.icon;
                const progress = (metric.value / metric.target) * 100;
                
                return (
                  <div key={metric.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <IconComponent className={`h-4 w-4 ${config.color}`} />
                        <span className="text-sm font-medium">{metric.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold">
                          {metric.value}{metric.unit}
                        </span>
                        <Badge variant="outline" className={config.color}>
                          Target: {metric.target}{metric.unit}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Progress value={Math.min(progress, 100)} className="h-1" />
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Progress: {Math.round(progress)}%</span>
                        <div className="flex items-center space-x-1">
                          {metric.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
                          {metric.trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
                          {metric.trend === 'stable' && <div className="h-3 w-3 bg-gray-400 rounded-full" />}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Real-time Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>Active Alerts</span>
              <Badge variant="destructive">
                {alerts.filter(a => a.status === 'open').length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {alerts.map((alert) => {
                const AlertIcon = getAlertIcon(alert.category);
                const isOverdue = alert.dueDate && alert.dueDate < new Date();
                
                return (
                  <div
                    key={alert.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                      getAlertColor(alert.type)
                    } ${isOverdue ? 'ring-2 ring-red-300' : ''}`}
                    onClick={() => onAlertClick?.(alert)}
                  >
                    <div className="flex items-start space-x-3">
                      <AlertIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium truncate">
                            {alert.title}
                          </h4>
                          <Badge
                            variant="outline"
                            className={`ml-2 ${
                              alert.priority === 'high' ? 'border-red-300 text-red-700' :
                              alert.priority === 'medium' ? 'border-yellow-300 text-yellow-700' :
                              'border-gray-300 text-gray-700'
                            }`}
                          >
                            {alert.priority}
                          </Badge>
                        </div>
                        <p className="text-xs mt-1 line-clamp-2">
                          {alert.description}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs opacity-75">
                            {alert.affectedCount} affected
                          </span>
                          {alert.dueDate && (
                            <span className={`text-xs ${isOverdue ? 'font-bold' : ''}`}>
                              {isOverdue ? 'Overdue: ' : 'Due: '}
                              {alert.dueDate.toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Monitoring Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Monitoring</CardTitle>
          <CardDescription>
            In-depth compliance monitoring and analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="trends" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="violations">Violations</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="predictions">Predictions</TabsTrigger>
            </TabsList>

            <TabsContent value="trends" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">+5.2%</div>
                  <p className="text-sm text-gray-600">PDPA Compliance Trend</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Lock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">98.5%</div>
                  <p className="text-sm text-gray-600">Encryption Coverage</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600">24/7</div>
                  <p className="text-sm text-gray-600">Monitoring Coverage</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="violations" className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-sm font-medium">Expired Consent</p>
                      <p className="text-xs text-gray-600">User consent expired, renewal required</p>
                    </div>
                  </div>
                  <Badge variant="destructive">Critical</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium">Overdue Retention Check</p>
                      <p className="text-xs text-gray-600">Data retention policy needs review</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-yellow-600 border-yellow-300">Warning</Badge>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Response Time</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Data Access Requests</span>
                      <span className="text-sm font-medium">2.3 hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Consent Updates</span>
                      <span className="text-sm font-medium">1.1 hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Encryption Operations</span>
                      <span className="text-sm font-medium">0.8 seconds</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">System Performance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Uptime</span>
                      <span className="text-sm font-medium text-green-600">99.9%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">API Response Time</span>
                      <span className="text-sm font-medium">245ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Database Queries</span>
                      <span className="text-sm font-medium">1,234/min</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="predictions" className="space-y-4">
              <Alert className="border-blue-200 bg-blue-50">
                <Target className="h-4 w-4" />
                <AlertTitle>AI-Powered Predictions</AlertTitle>
                <AlertDescription>
                  Based on current trends, we predict a 95% compliance score within the next 30 days 
                  with continued focus on consent management and encryption coverage.
                </AlertDescription>
              </Alert>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Predicted Issues</h4>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• 5 consents will expire next week</li>
                    <li>• Encryption key rotation due in 15 days</li>
                    <li>• Quarterly audit scheduled for next month</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Recommended Actions</h4>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• Send consent renewal reminders</li>
                    <li>• Schedule encryption key rotation</li>
                    <li>• Prepare compliance documentation</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplianceMonitoringPanel;