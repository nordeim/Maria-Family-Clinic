// Compliance Dashboard Component
// Sub-Phase 10.1: Advanced Analytics & Tracking System Architecture

'use client';

import React, { useMemo } from 'react';
import { RealTimeMetrics, TimeRangeKey, DashboardWidget } from '../../types/analytics.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Lock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Eye,
  FileText,
  UserCheck,
  Clock,
  Key,
  Server,
  Globe,
  Download,
  Upload,
  Search,
  Activity,
  Users,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  FileLock,
  Database,
  EyeOff
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
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  RadialBarChart,
  RadialBar,
} from 'recharts';

interface ComplianceDashboardProps {
  clinicId?: string;
  metrics: RealTimeMetrics | null;
  timeRange: TimeRangeKey;
  isRealTimeActive: boolean;
  customWidgets?: DashboardWidget[];
}

// Mock data for compliance metrics
const complianceMetrics = {
  pdpaCompliance: {
    overallScore: 94.2,
    dataCollection: 96.8,
    consentManagement: 92.5,
    dataRetention: 89.7,
    userRights: 97.1,
    breachPrevention: 95.3,
    anonymization: 93.8,
  },
  dataProcessing: [
    { month: 'Jan', requests: 1245, approved: 1198, pending: 47, denied: 0 },
    { month: 'Feb', requests: 1380, approved: 1325, pending: 55, denied: 0 },
    { month: 'Mar', requests: 1425, approved: 1368, pending: 57, denied: 0 },
    { month: 'Apr', requests: 1580, approved: 1520, pending: 58, denied: 2 },
    { month: 'May', requests: 1650, approved: 1589, pending: 61, denied: 0 },
    { month: 'Jun', requests: 1725, approved: 1658, pending: 67, denied: 0 },
  ],
  dataBreachMonitoring: {
    totalEvents: 0,
    lowRisk: 0,
    mediumRisk: 0,
    highRisk: 0,
    criticalRisk: 0,
    resolvedEvents: 0,
    avgResolutionTime: 0,
    preventionRate: 99.8,
  },
  accessControl: {
    totalUsers: 287,
    adminUsers: 12,
    healthcareProviders: 45,
    supportStaff: 230,
    activeSessions: 156,
    failedLogins: 23,
    suspiciousActivities: 2,
    permissions: {
      fullAccess: 15,
      partialAccess: 120,
      limitedAccess: 152,
    },
  },
  auditLogs: [
    {
      id: 1,
      timestamp: '2024-11-05T14:30:00Z',
      user: 'Dr. Sarah Lim',
      action: 'Patient Record Access',
      resource: 'Patient #12345',
      result: 'success',
      ipAddress: '192.168.1.100',
      location: 'Singapore Central',
    },
    {
      id: 2,
      timestamp: '2024-11-05T14:25:00Z',
      user: 'Admin User',
      action: 'Data Export',
      resource: 'Analytics Report',
      result: 'success',
      ipAddress: '192.168.1.50',
      location: 'Singapore Central',
    },
    {
      id: 3,
      timestamp: '2024-11-05T14:20:00Z',
      user: 'System',
      action: 'Failed Login Attempt',
      resource: 'Admin Portal',
      result: 'failed',
      ipAddress: '203.0.113.45',
      location: 'External',
    },
    {
      id: 4,
      timestamp: '2024-11-05T14:15:00Z',
      user: 'Dr. Michael Tan',
      action: 'Medical Record Update',
      resource: 'Patient #67890',
      result: 'success',
      ipAddress: '192.168.1.105',
      location: 'Singapore Central',
    },
    {
      id: 5,
      timestamp: '2024-11-05T14:10:00Z',
      user: 'Patient Portal',
      action: 'Data Access Request',
      resource: 'Personal Records',
      result: 'success',
      ipAddress: '203.0.113.78',
      location: 'Singapore East',
    },
  ],
  dataRetention: {
    activeData: 15680,
    archivedData: 8450,
    dataAging: [
      { age: '0-30 days', count: 8450, percentage: 35.2 },
      { age: '31-90 days', count: 4200, percentage: 17.5 },
      { age: '91-365 days', count: 3800, percentage: 15.8 },
      { age: '1-3 years', count: 2980, percentage: 12.4 },
      { age: '3-5 years', count: 2150, percentage: 9.0 },
      { age: '5+ years', count: 2350, percentage: 9.8 },
      { age: 'Archived', count: 8450, percentage: 35.2 },
    ],
    scheduledDeletions: 1245,
    retentionCompliance: 96.8,
  },
  encryptionStatus: {
    dataAtRest: {
      status: 'compliant',
      coverage: 100,
      algorithm: 'AES-256',
      keyRotation: '30 days',
      lastRotation: '2024-10-01T00:00:00Z',
    },
    dataInTransit: {
      status: 'compliant',
      coverage: 100,
      protocol: 'TLS 1.3',
      certificateExpiry: '2025-03-15T00:00:00Z',
      hstsEnabled: true,
    },
    keyManagement: {
      masterKeys: 5,
      backupKeys: 3,
      hardwareSecurityModule: 'enabled',
      escrowKeys: 2,
      rotationSchedule: 'monthly',
    },
  },
  incidentResponse: {
    totalIncidents: 2,
    resolvedIncidents: 2,
    avgResponseTime: 12, // minutes
    avgResolutionTime: 45, // minutes
    severityBreakdown: [
      { severity: 'Critical', count: 0, avgResolution: 0 },
      { severity: 'High', count: 0, avgResolution: 0 },
      { severity: 'Medium', count: 1, avgResolution: 60 },
      { severity: 'Low', count: 1, avgResolution: 30 },
    ],
    incidents: [
      {
        id: 'INC-2024-001',
        timestamp: '2024-11-03T09:15:00Z',
        type: 'Unauthorized Access Attempt',
        severity: 'Medium',
        status: 'Resolved',
        assignedTo: 'Security Team',
        resolutionTime: 60,
      },
      {
        id: 'INC-2024-002',
        timestamp: '2024-11-01T14:30:00Z',
        type: 'Suspicious Login Pattern',
        severity: 'Low',
        status: 'Resolved',
        assignedTo: 'IT Support',
        resolutionTime: 30,
      },
    ],
  },
  privacyImpact: {
    highRiskActivities: 3,
    mediumRiskActivities: 8,
    lowRiskActivities: 24,
    mitigationStrategies: 35,
    regularAssessments: 12,
    lastAssessment: '2024-10-15T00:00:00Z',
    nextAssessment: '2025-01-15T00:00:00Z',
  },
  securityEvents: {
    totalEvents: 158,
    failedLogins: 89,
    unauthorizedAttempts: 12,
    policyViolations: 5,
    malwareDetections: 0,
    suspiciousIPs: 3,
    geographicAnomalies: 8,
    dataExports: 45,
  },
  regulatoryCompliance: {
    pdpaStatus: 'compliant',
    hcsaStatus: 'compliant',
    iso27001Status: 'certified',
    hipaaStatus: 'not-applicable',
    gdprStatus: 'compliant',
    lastAudit: '2024-08-15T00:00:00Z',
    nextAudit: '2025-02-15T00:00:00Z',
    certifications: [
      { name: 'ISO 27001', status: 'valid', expiryDate: '2025-08-15' },
      { name: 'PDPA Compliance', status: 'valid', expiryDate: '2025-12-31' },
      { name: 'HCSA Registration', status: 'valid', expiryDate: '2025-06-30' },
    ],
  },
};

// Compliance Status Card Component
interface ComplianceKPICardProps {
  title: string;
  value: number;
  target: number;
  unit: string;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  icon: React.ReactNode;
  description?: string;
  trend?: 'up' | 'down' | 'stable';
}

function ComplianceKPICard({ 
  title, value, target, unit, status, icon, description, trend 
}: ComplianceKPICardProps) {
  const percentage = (value / target) * 100;
  const getStatusColor = () => {
    switch (status) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getProgressColor = () => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 95) return 'bg-blue-500';
    if (percentage >= 85) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {typeof value === 'number' && value % 1 !== 0 ? value.toFixed(1) : value.toLocaleString()}
          <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        <div className="flex items-center space-x-2 mt-2">
          <div className="flex-1">
            <Progress 
              value={Math.min(percentage, 100)} 
              className="h-2"
            />
          </div>
          <span className="text-xs text-muted-foreground">
            {percentage.toFixed(1)}%
          </span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-1">
            {trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
            {trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
            {trend === 'stable' && <div className="h-3 w-3 bg-gray-400 rounded-full" />}
            <span className={`text-xs ${getStatusColor()}`}>
              {target >= 100 ? 'of target' : 'compliance'}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            Target: {target}{unit}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// Security Events Timeline
function SecurityEventsTimeline() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Events</CardTitle>
        <CardDescription>
          Recent security-related activities and incidents
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {complianceMetrics.auditLogs.slice(0, 5).map((log) => (
            <div key={log.id} className="flex items-center space-x-4 p-3 border rounded-lg">
              <div className="flex-shrink-0">
                {log.result === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{log.action}</h4>
                  <span className="text-xs text-muted-foreground">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {log.user} • {log.resource} • {log.location}
                </p>
              </div>
              <div className="flex-shrink-0">
                <Badge 
                  variant={log.result === 'success' ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {log.result}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Data Retention Chart
function DataRetentionChart() {
  const chartData = complianceMetrics.dataRetention.dataAging.filter(item => item.age !== 'Archived');
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Retention Status</CardTitle>
        <CardDescription>
          Data lifecycle and retention compliance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 border rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {complianceMetrics.dataRetention.activeData.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Active Records</div>
          </div>
          <div className="text-center p-3 border rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {complianceMetrics.dataRetention.retentionCompliance}%
            </div>
            <div className="text-sm text-muted-foreground">Compliance Rate</div>
          </div>
          <div className="text-center p-3 border rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {complianceMetrics.dataRetention.scheduledDeletions.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Scheduled Deletions</div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="age" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#3B82F6" name="Records" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// PDPA Compliance Radar Chart
function PDPAComplianceChart() {
  const radarData = [
    { subject: 'Data Collection', score: 96.8, fullMark: 100 },
    { subject: 'Consent Management', score: 92.5, fullMark: 100 },
    { subject: 'Data Retention', score: 89.7, fullMark: 100 },
    { subject: 'User Rights', score: 97.1, fullMark: 100 },
    { subject: 'Breach Prevention', score: 95.3, fullMark: 100 },
    { subject: 'Anonymization', score: 93.8, fullMark: 100 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>PDPA Compliance Breakdown</CardTitle>
        <CardDescription>
          Detailed compliance scores by category
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RadialBarChart data={radarData} innerRadius="20%" outerRadius="80%">
            <RadialBar
              dataKey="score"
              cornerRadius={10}
              fill="#3B82F6"
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-2 gap-2 mt-4">
          {radarData.map((item) => (
            <div key={item.subject} className="flex items-center justify-between text-sm">
              <span>{item.subject}</span>
              <span className="font-semibold">{item.score}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Access Control Overview
function AccessControlOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Access Control & User Management</CardTitle>
        <CardDescription>
          User access patterns and security controls
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 border rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {complianceMetrics.accessControl.totalUsers}
            </div>
            <div className="text-sm text-muted-foreground">Total Users</div>
          </div>
          <div className="text-center p-3 border rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {complianceMetrics.accessControl.activeSessions}
            </div>
            <div className="text-sm text-muted-foreground">Active Sessions</div>
          </div>
          <div className="text-center p-3 border rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {complianceMetrics.accessControl.failedLogins}
            </div>
            <div className="text-sm text-muted-foreground">Failed Logins</div>
          </div>
          <div className="text-center p-3 border rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {complianceMetrics.accessControl.suspiciousActivities}
            </div>
            <div className="text-sm text-muted-foreground">Suspicious Activities</div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">User Roles Distribution</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Healthcare Providers</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${(complianceMetrics.accessControl.healthcareProviders / complianceMetrics.accessControl.totalUsers) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {complianceMetrics.accessControl.healthcareProviders}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Support Staff</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(complianceMetrics.accessControl.supportStaff / complianceMetrics.accessControl.totalUsers) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {complianceMetrics.accessControl.supportStaff}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Admin Users</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-600 h-2 rounded-full"
                      style={{ width: `${(complianceMetrics.accessControl.adminUsers / complianceMetrics.accessControl.totalUsers) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {complianceMetrics.accessControl.adminUsers}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Regulatory Compliance Status
function RegulatoryComplianceStatus() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Regulatory Compliance Status</CardTitle>
        <CardDescription>
          Current compliance status with healthcare regulations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Object.entries(complianceMetrics.regulatoryCompliance)
            .filter(([key]) => key.endsWith('Status'))
            .map(([key, status]) => {
              const keyMap = {
                pdpaStatus: 'PDPA Compliance',
                hcsaStatus: 'HCSA Compliance',
                iso27001Status: 'ISO 27001',
                hipaaStatus: 'HIPAA',
                gdprStatus: 'GDPR',
              };
              const title = keyMap[key] || key;
              return (
                <div key={key} className="text-center p-3 border rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    {status === 'compliant' || status === 'certified' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div className="font-semibold">{title}</div>
                  <Badge 
                    variant={status === 'compliant' || status === 'certified' ? 'default' : 'secondary'}
                    className="mt-1"
                  >
                    {status}
                  </Badge>
                </div>
              );
            })}
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Certifications</h4>
            <div className="space-y-2">
              {complianceMetrics.regulatoryCompliance.certifications.map((cert) => (
                <div key={cert.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h5 className="font-medium">{cert.name}</h5>
                    <p className="text-sm text-muted-foreground">
                      Expires: {new Date(cert.expiryDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={cert.status === 'valid' ? 'default' : 'destructive'}>
                    {cert.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Data Processing Trends
function DataProcessingTrends() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Processing Trends</CardTitle>
        <CardDescription>
          User data requests and processing patterns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={complianceMetrics.dataProcessing}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="approved" 
              stackId="1" 
              stroke="#10B981" 
              fill="#10B981"
              name="Approved"
            />
            <Area 
              type="monotone" 
              dataKey="pending" 
              stackId="1" 
              stroke="#F59E0B" 
              fill="#F59E0B"
              name="Pending"
            />
            <Area 
              type="monotone" 
              dataKey="denied" 
              stackId="1" 
              stroke="#EF4444" 
              fill="#EF4444"
              name="Denied"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Main Compliance Dashboard Component
export function ComplianceDashboard({
  clinicId,
  metrics,
  timeRange,
  isRealTimeActive,
  customWidgets,
}: ComplianceDashboardProps) {
  // Calculate real-time compliance indicators
  const complianceIndicators = useMemo(() => {
    if (!metrics) return null;

    return {
      securityStatus: complianceMetrics.dataBreachMonitoring.totalEvents === 0 ? 'secure' : 'monitoring',
      dataIntegrity: 'high',
      accessControls: complianceMetrics.accessControl.failedLogins < 50 ? 'secure' : 'warning',
      encryptionStatus: 'compliant',
    };
  }, [metrics]);

  // Calculate compliance KPIs
  const complianceKPIs = useMemo(() => [
    {
      title: 'PDPA Compliance Score',
      value: complianceMetrics.pdpaCompliance.overallScore,
      target: 95,
      unit: '%',
      status: complianceMetrics.pdpaCompliance.overallScore >= 95 ? 'excellent' : 'good' as const,
      icon: <Shield className="h-4 w-4" />,
      description: 'Overall compliance score',
      trend: 'stable' as const,
    },
    {
      title: 'Active Incidents',
      value: complianceMetrics.incidentResponse.totalIncidents,
      target: 0,
      unit: 'incidents',
      status: complianceMetrics.incidentResponse.totalIncidents === 0 ? 'excellent' : 'warning' as const,
      icon: <AlertTriangle className="h-4 w-4" />,
      description: 'Currently open incidents',
      trend: 'down' as const,
    },
    {
      title: 'Encryption Coverage',
      value: 100,
      target: 100,
      unit: '%',
      status: 'excellent' as const,
      icon: <Lock className="h-4 w-4" />,
      description: 'Data encryption coverage',
      trend: 'stable' as const,
    },
    {
      title: 'Access Control Score',
      value: 97.8,
      target: 95,
      unit: '%',
      status: 'excellent' as const,
      icon: <UserCheck className="h-4 w-4" />,
      description: 'Access control effectiveness',
      trend: 'up' as const,
    },
  ], []);

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
      {/* Real-time Compliance Status */}
      {metrics && complianceIndicators && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <Shield className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              Security: Secure
            </span>
          </div>
          <div className="flex items-center space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Lock className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              Encryption: 100%
            </span>
          </div>
          <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">
              {complianceMetrics.accessControl.failedLogins} Failed Logins
            </span>
          </div>
          <div className="flex items-center space-x-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <Eye className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">
              2 Incidents (Resolved)
            </span>
          </div>
        </div>
      )}

      {/* Compliance KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {complianceKPIs.map((kpi) => (
          <ComplianceKPICard key={kpi.title} {...kpi} />
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PDPAComplianceChart />
            <DataProcessingTrends />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <RegulatoryComplianceStatus />
            <DataRetentionChart />
            <AccessControlOverview />
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Encryption Status</CardTitle>
                <CardDescription>Encryption and key management</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Data at Rest</h4>
                      <Badge variant="default">Compliant</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Algorithm: {complianceMetrics.encryptionStatus.dataAtRest.algorithm}</p>
                      <p>Coverage: {complianceMetrics.encryptionStatus.dataAtRest.coverage}%</p>
                      <p>Last Rotation: {new Date(complianceMetrics.encryptionStatus.dataAtRest.lastRotation).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Data in Transit</h4>
                      <Badge variant="default">Compliant</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Protocol: {complianceMetrics.encryptionStatus.dataInTransit.protocol}</p>
                      <p>Coverage: {complianceMetrics.encryptionStatus.dataInTransit.coverage}%</p>
                      <p>HSTS: {complianceMetrics.encryptionStatus.dataInTransit.hstsEnabled ? 'Enabled' : 'Disabled'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <SecurityEventsTimeline />
          </div>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PDPAComplianceChart />
            <Card>
              <CardHeader>
                <CardTitle>Privacy Impact Assessment</CardTitle>
                <CardDescription>Risk assessment and mitigation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {complianceMetrics.privacyImpact.highRiskActivities}
                    </div>
                    <div className="text-sm text-muted-foreground">High Risk</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {complianceMetrics.privacyImpact.mediumRiskActivities}
                    </div>
                    <div className="text-sm text-muted-foreground">Medium Risk</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {complianceMetrics.privacyImpact.lowRiskActivities}
                    </div>
                    <div className="text-sm text-muted-foreground">Low Risk</div>
                  </div>
                </div>
                <div className="text-sm">
                  <p><strong>Last Assessment:</strong> {new Date(complianceMetrics.privacyImpact.lastAssessment).toLocaleDateString()}</p>
                  <p><strong>Next Assessment:</strong> {new Date(complianceMetrics.privacyImpact.nextAssessment).toLocaleDateString()}</p>
                  <p><strong>Mitigation Strategies:</strong> {complianceMetrics.privacyImpact.mitigationStrategies} active</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <SecurityEventsTimeline />
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <RegulatoryComplianceStatus />
          <DataRetentionChart />
        </TabsContent>

        <TabsContent value="incidents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Incident Response</CardTitle>
              <CardDescription>Security incidents and response metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {complianceMetrics.incidentResponse.totalIncidents}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Incidents</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {complianceMetrics.incidentResponse.resolvedIncidents}
                  </div>
                  <div className="text-sm text-muted-foreground">Resolved</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {complianceMetrics.incidentResponse.avgResponseTime}m
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Response Time</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {complianceMetrics.incidentResponse.avgResolutionTime}m
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Resolution Time</div>
                </div>
              </div>
              
              <div className="space-y-4">
                {complianceMetrics.incidentResponse.incidents.map((incident) => (
                  <div key={incident.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{incident.id}: {incident.type}</h4>
                      <Badge variant={incident.status === 'Resolved' ? 'default' : 'destructive'}>
                        {incident.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p><strong>Severity:</strong> {incident.severity}</p>
                      <p><strong>Assigned to:</strong> {incident.assignedTo}</p>
                      <p><strong>Resolution Time:</strong> {incident.resolutionTime} minutes</p>
                      <p><strong>Timestamp:</strong> {new Date(incident.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Compliance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Insights & Recommendations</CardTitle>
          <CardDescription>
            Security posture assessment and improvement suggestions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                Compliance Strengths
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  100% encryption coverage for data at rest and in transit
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  PDPA compliance score of 94.2% exceeds industry standard
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  No critical security incidents in the last quarter
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  ISO 27001 certification maintained with 99.8% availability
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-yellow-600" />
                Areas for Improvement
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-yellow-600 mr-2">•</span>
                  Data retention compliance at 89.7% - review retention policies
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-600 mr-2">•</span>
                  3 high-risk privacy activities require additional controls
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-600 mr-2">•</span>
                  Schedule next privacy impact assessment for January 2025
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-600 mr-2">•</span>
                  Consider implementing additional monitoring for suspicious login patterns
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}