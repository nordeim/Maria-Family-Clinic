import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Activity, TrendingUp, AlertTriangle, CheckCircle, Clock, Shield, Users, Database } from 'lucide-react';

interface QualityMetric {
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
}

interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'critical';
  uptime: number;
  responseTime: number;
  errorRate: number;
  activeIncidents: number;
}

interface TestCoverageData {
  lines: number;
  statements: number;
  branches: number;
  functions: number;
  files: Array<{
    path: string;
    coverage: number;
    status: 'good' | 'warning' | 'critical';
  }>;
}

interface SecurityMetrics {
  vulnerabilities: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  securityScore: number;
  lastScan: Date;
  complianceStatus: {
    pdpa: 'compliant' | 'non-compliant' | 'pending';
    moh: 'compliant' | 'non-compliant' | 'pending';
  };
}

interface PerformanceMetrics {
  coreWebVitals: {
    lcp: number; // Largest Contentful Paint
    fid: number; // First Input Delay
    cls: number; // Cumulative Layout Shift
  };
  apiPerformance: {
    averageResponseTime: number;
    p95ResponseTime: number;
    throughput: number;
  };
  resourceUsage: {
    cpu: number;
    memory: number;
    disk: number;
  };
}

export default function RealTimeQualityDashboard() {
  const [metrics, setMetrics] = useState<QualityMetric[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [testCoverage, setTestCoverage] = useState<TestCoverageData | null>(null);
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Fetch real-time metrics
  const fetchMetrics = useCallback(async () => {
    try {
      // In a real implementation, these would be API calls
      const mockMetrics: QualityMetric[] = [
        {
          name: 'Test Coverage',
          value: 94.2,
          target: 95,
          unit: '%',
          trend: 'up',
          status: 'warning'
        },
        {
          name: 'Build Success Rate',
          value: 98.5,
          target: 99,
          unit: '%',
          trend: 'stable',
          status: 'good'
        },
        {
          name: 'Code Quality Score',
          value: 87.3,
          target: 90,
          unit: '/100',
          trend: 'up',
          status: 'warning'
        },
        {
          name: 'Security Score',
          value: 92.1,
          target: 95,
          unit: '/100',
          trend: 'stable',
          status: 'good'
        },
        {
          name: 'Performance Score',
          value: 89.7,
          target: 90,
          unit: '/100',
          trend: 'up',
          status: 'warning'
        },
        {
          name: 'Healthcare Compliance',
          value: 96.8,
          target: 100,
          unit: '%',
          trend: 'stable',
          status: 'good'
        }
      ];

      const mockSystemHealth: SystemHealth = {
        overall: 'healthy',
        uptime: 99.9,
        responseTime: 245,
        errorRate: 0.02,
        activeIncidents: 0
      };

      const mockTestCoverage: TestCoverageData = {
        lines: 94.2,
        statements: 95.1,
        branches: 89.3,
        functions: 96.4,
        files: [
          { path: 'src/healthcare/PatientService.ts', coverage: 98.5, status: 'good' },
          { path: 'src/appointments/AppointmentService.ts', coverage: 92.1, status: 'warning' },
          { path: 'src/security/EncryptionService.ts', coverage: 89.7, status: 'critical' },
          { path: 'src/emergency/EmergencyService.ts', coverage: 95.3, status: 'good' },
          { path: 'src/compliance/PDPAService.ts', coverage: 97.8, status: 'good' }
        ]
      };

      const mockSecurityMetrics: SecurityMetrics = {
        vulnerabilities: {
          critical: 0,
          high: 2,
          medium: 5,
          low: 8
        },
        securityScore: 92.1,
        lastScan: new Date(),
        complianceStatus: {
          pdpa: 'compliant',
          moh: 'compliant'
        }
      };

      const mockPerformanceMetrics: PerformanceMetrics = {
        coreWebVitals: {
          lcp: 1.8,
          fid: 45,
          cls: 0.08
        },
        apiPerformance: {
          averageResponseTime: 245,
          p95ResponseTime: 680,
          throughput: 1250
        },
        resourceUsage: {
          cpu: 45.2,
          memory: 67.8,
          disk: 34.5
        }
      };

      setMetrics(mockMetrics);
      setSystemHealth(mockSystemHealth);
      setTestCoverage(mockTestCoverage);
      setSecurityMetrics(mockSecurityMetrics);
      setPerformanceMetrics(mockPerformanceMetrics);
      setLastUpdated(new Date());

    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
    
    // Update metrics every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'good': return 'default';
      case 'warning': return 'secondary';
      case 'critical': return 'destructive';
      default: return 'outline';
    }
  };

  const formatTrend = (trend: string) => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      case 'stable': return '➡️';
      default: return '';
    }
  };

  // Sample data for charts
  const trendData = [
    { date: '2025-11-01', coverage: 93.5, quality: 86.2, security: 91.8, performance: 88.1 },
    { date: '2025-11-02', coverage: 94.1, quality: 87.1, security: 92.3, performance: 88.9 },
    { date: '2025-11-03', coverage: 93.8, quality: 86.8, security: 91.9, performance: 89.2 },
    { date: '2025-11-04', coverage: 94.2, quality: 87.3, security: 92.1, performance: 89.7 },
    { date: '2025-11-05', coverage: 94.2, quality: 87.3, security: 92.1, performance: 89.7 }
  ];

  const vulnerabilityData = [
    { name: 'Critical', value: 0, color: '#ef4444' },
    { name: 'High', value: 2, color: '#f97316' },
    { name: 'Medium', value: 5, color: '#eab308' },
    { name: 'Low', value: 8, color: '#22c55e' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quality Metrics Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time monitoring of system quality, security, and compliance metrics
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${systemHealth?.overall === 'healthy' ? 'bg-green-500' : systemHealth?.overall === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'}`} />
            <span className="text-sm font-medium">
              System {systemHealth?.overall || 'Loading...'}
            </span>
          </div>
          <Badge variant="outline">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </Badge>
        </div>
      </div>

      {/* System Health Overview */}
      {systemHealth && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemHealth.uptime}%</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemHealth.responseTime}ms</div>
              <p className="text-xs text-muted-foreground">P95: 680ms</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemHealth.errorRate}%</div>
              <p className="text-xs text-muted-foreground">Last hour</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemHealth.activeIncidents}</div>
              <p className="text-xs text-muted-foreground">Require attention</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="coverage">Test Coverage</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Quality Metrics Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {metrics.map((metric) => (
              <Card key={metric.name}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                  <span className="text-xs text-muted-foreground">
                    {formatTrend(metric.trend)}
                  </span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metric.value}{metric.unit}
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Target: {metric.target}{metric.unit}</span>
                      <Badge variant={getStatusBadgeVariant(metric.status)}>
                        {metric.status}
                      </Badge>
                    </div>
                    <Progress 
                      value={(metric.value / metric.target) * 100} 
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Quality Metrics Trend</CardTitle>
              <CardDescription>Quality metrics over the last 5 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="coverage" stroke="#8884d8" name="Coverage %" />
                  <Line type="monotone" dataKey="quality" stroke="#82ca9d" name="Quality Score" />
                  <Line type="monotone" dataKey="security" stroke="#ffc658" name="Security Score" />
                  <Line type="monotone" dataKey="performance" stroke="#ff7300" name="Performance Score" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coverage" className="space-y-4">
          {testCoverage && (
            <>
              {/* Coverage Overview */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Line Coverage</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{testCoverage.lines}%</div>
                    <Progress value={testCoverage.lines} className="mt-2" />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Statement Coverage</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{testCoverage.statements}%</div>
                    <Progress value={testCoverage.statements} className="mt-2" />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Branch Coverage</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{testCoverage.branches}%</div>
                    <Progress value={testCoverage.branches} className="mt-2" />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Function Coverage</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{testCoverage.functions}%</div>
                    <Progress value={testCoverage.functions} className="mt-2" />
                  </CardContent>
                </Card>
              </div>

              {/* File Coverage Details */}
              <Card>
                <CardHeader>
                  <CardTitle>File Coverage Details</CardTitle>
                  <CardDescription>Coverage status by component</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {testCoverage.files.map((file) => (
                      <div key={file.path} className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{file.path}</p>
                          <div className="mt-1 flex items-center space-x-2">
                            <Progress value={file.coverage} className="h-2 flex-1" />
                            <span className="text-sm text-muted-foreground">
                              {file.coverage}%
                            </span>
                          </div>
                        </div>
                        <Badge variant={getStatusBadgeVariant(file.status)}>
                          {file.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          {securityMetrics && (
            <>
              {/* Security Overview */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Score</CardTitle>
                    <CardDescription>Overall security posture</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-center">
                      {securityMetrics.securityScore}/100
                    </div>
                    <Progress value={securityMetrics.securityScore} className="mt-4" />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Vulnerabilities</CardTitle>
                    <CardDescription>Security issues by severity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={vulnerabilityData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                        >
                          {vulnerabilityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Compliance Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Status</CardTitle>
                  <CardDescription>Healthcare regulatory compliance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">PDPA Compliance</span>
                      <Badge variant={securityMetrics.complianceStatus.pdpa === 'compliant' ? 'default' : 'destructive'}>
                        {securityMetrics.complianceStatus.pdpa}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">MOH Compliance</span>
                      <Badge variant={securityMetrics.complianceStatus.moh === 'compliant' ? 'default' : 'destructive'}>
                        {securityMetrics.complianceStatus.moh}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          {performanceMetrics && (
            <>
              {/* Core Web Vitals */}
              <Card>
                <CardHeader>
                  <CardTitle>Core Web Vitals</CardTitle>
                  <CardDescription>Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {performanceMetrics.coreWebVitals.lcp}s
                      </div>
                      <p className="text-xs text-muted-foreground">LCP (Target: &lt;2.5s)</p>
                      <Progress 
                        value={Math.min((2.5 / performanceMetrics.coreWebVitals.lcp) * 100, 100)} 
                        className="mt-2" 
                      />
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {performanceMetrics.coreWebVitals.fid}ms
                      </div>
                      <p className="text-xs text-muted-foreground">FID (Target: &lt;100ms)</p>
                      <Progress 
                        value={Math.min((100 / performanceMetrics.coreWebVitals.fid) * 100, 100)} 
                        className="mt-2" 
                      />
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {performanceMetrics.coreWebVitals.cls}
                      </div>
                      <p className="text-xs text-muted-foreground">CLS (Target: &lt;0.1)</p>
                      <Progress 
                        value={Math.min((0.1 / performanceMetrics.coreWebVitals.cls) * 100, 100)} 
                        className="mt-2" 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* API Performance */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>API Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Avg Response Time</span>
                        <span className="text-sm font-medium">
                          {performanceMetrics.apiPerformance.averageResponseTime}ms
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">P95 Response Time</span>
                        <span className="text-sm font-medium">
                          {performanceMetrics.apiPerformance.p95ResponseTime}ms
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Throughput</span>
                        <span className="text-sm font-medium">
                          {performanceMetrics.apiPerformance.throughput}/min
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Resource Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>CPU</span>
                          <span>{performanceMetrics.resourceUsage.cpu}%</span>
                        </div>
                        <Progress value={performanceMetrics.resourceUsage.cpu} />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Memory</span>
                          <span>{performanceMetrics.resourceUsage.memory}%</span>
                        </div>
                        <Progress value={performanceMetrics.resourceUsage.memory} />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Disk</span>
                          <span>{performanceMetrics.resourceUsage.disk}%</span>
                        </div>
                        <Progress value={performanceMetrics.resourceUsage.disk} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Healthcare Compliance Dashboard</CardTitle>
              <CardDescription>Regulatory compliance monitoring and certification tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* PDPA Compliance */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium">PDPA Compliance</p>
                      <p className="text-sm text-muted-foreground">
                        Personal Data Protection Act compliance status
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="default">Compliant</Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      Last audit: Oct 15, 2025
                    </p>
                  </div>
                </div>

                {/* MOH Compliance */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">MOH Regulation Compliance</p>
                      <p className="text-sm text-muted-foreground">
                        Ministry of Health regulation compliance
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="default">Compliant</Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      Last audit: Oct 20, 2025
                    </p>
                  </div>
                </div>

                {/* Healthier SG Integration */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Database className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="font-medium">Healthier SG Integration</p>
                      <p className="text-sm text-muted-foreground">
                        Government health program integration status
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="default">Active</Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      Integration verified: Nov 1, 2025
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Certification Status */}
          <Card>
            <CardHeader>
              <CardTitle>Certification & Audit Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">ISO 27001 Information Security</span>
                  <Badge variant="outline">Valid until Dec 2025</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">SOC 2 Type II</span>
                  <Badge variant="outline">Valid until Mar 2026</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Healthcare Data Protection Certification</span>
                  <Badge variant="default">Current</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Alert for Issues */}
      {(metrics.some(m => m.status === 'critical') || systemHealth?.overall === 'critical') && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Critical quality issues detected. Immediate attention required.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}