import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { 
  Heart, 
  Shield, 
  Clock, 
  Users, 
  FileText, 
  Stethoscope,
  AlertTriangle,
  CheckCircle,
  Lock,
  Database,
  Activity,
  Smartphone,
  Globe,
  Search,
  Calendar,
  UserCheck,
  Eye
} from 'lucide-react';
import type { HealthcareWorkflowMetrics as HealthcareWorkflowMetricsType } from '../types';

interface HealthcareWorkflowMetricsProps {
  data: HealthcareWorkflowMetricsType | null;
  detailed?: boolean;
  className?: string;
}

export const HealthcareWorkflowMetrics: React.FC<HealthcareWorkflowMetricsProps> = ({ 
  data, 
  detailed = false,
  className = '' 
}) => {
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('patient-journey');
  const [selectedCompliance, setSelectedCompliance] = useState<string>('pdpa');

  if (!data) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Healthcare Workflow Metrics</CardTitle>
          <CardDescription>No healthcare-specific metrics available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Run healthcare workflow tests to view metrics
          </div>
        </CardContent>
      </Card>
    );
  }

  const getComplianceStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'non-compliant': return 'bg-red-100 text-red-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getWorkflowIcon = (workflowName: string) => {
    switch (workflowName.toLowerCase()) {
      case 'patient-journey': return <Users className="h-4 w-4" />;
      case 'appointment-booking': return <Calendar className="h-4 w-4" />;
      case 'medical-records': return <FileText className="h-4 w-4" />;
      case 'emergency-access': return <AlertTriangle className="h-4 w-4" />;
      case 'telehealth': return <Smartphone className="h-4 w-4" />;
      case 'prescription-management': return <Stethoscope className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  // Process data for charts
  const workflowPerformanceData = Object.entries(data.workflowPerformance || {}).map(([workflow, metrics]) => ({
    workflow: workflow.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    avgCompletionTime: metrics.avgCompletionTime / 1000, // Convert to seconds
    successRate: metrics.successRate * 100,
    patientSatisfaction: metrics.patientSatisfaction || 0,
    errorRate: metrics.errorRate * 100
  }));

  const complianceStatusData = Object.entries(data.complianceStatus || {}).map(([framework, status]) => ({
    framework,
    compliant: status === 'compliant' ? 100 : status === 'partial' ? 50 : 0,
    status
  }));

  const pdpaMetricsData = data.pdpaCompliance?.dataProcessingTime ? [
    { metric: 'Data Access', time: data.pdpaCompliance.dataAccessTime, target: 100 },
    { metric: 'Data Processing', time: data.pdpaCompliance.dataProcessingTime, target: 200 },
    { metric: 'Data Deletion', time: data.pdpaCompliance.dataDeletionTime, target: 500 },
    { metric: 'Consent Handling', time: data.pdpaCompliance.consentProcessingTime, target: 150 }
  ] : [];

  const medicalDataHandlingData = Object.entries(data.medicalDataHandling || {}).map(([operation, metrics]) => ({
    operation: operation.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
    encryption: (metrics.encryptionTime / metrics.totalTime) * 100,
    validation: (metrics.validationTime / metrics.totalTime) * 100,
    storage: (metrics.storageTime / metrics.totalTime) * 100,
    totalTime: metrics.totalTime
  }));

  const securityMetricsData = data.securityMetrics ? [
    { name: 'Authentication', value: (1 - data.securityMetrics.authenticationLatency / 2000) * 100 },
    { name: 'Authorization', value: (1 - data.securityMetrics.authorizationLatency / 1500) * 100 },
    { name: 'Encryption', value: (1 - data.securityMetrics.encryptionLatency / 1000) * 100 },
    { name: 'Audit Logging', value: (1 - data.securityMetrics.auditLoggingLatency / 500) * 100 }
  ] : [];

  const emergencyResponseData = data.emergencyResponse ? [
    { time: 1, response: data.emergencyResponse.averageResponseTime },
    { time: 5, response: data.emergencyResponse.averageResponseTime * 1.1 },
    { time: 10, response: data.emergencyResponse.averageResponseTime * 1.05 },
    { time: 15, response: data.emergencyResponse.averageResponseTime * 1.15 },
    { time: 30, response: data.emergencyResponse.averageResponseTime * 1.2 }
  ] : [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className={`healthcare-workflow-metrics ${className}`}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">PDPA Compliance</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge className={getComplianceStatusColor(data.pdpaCompliance?.status || 'unknown')}>
              {data.pdpaCompliance?.status?.toUpperCase() || 'UNKNOWN'}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Data protection compliance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workflows Tested</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(data.workflowPerformance || {}).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Healthcare workflows validated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {data.securityMetrics ? ((
                (1 - data.securityMetrics.authenticationLatency / 2000) +
                (1 - data.securityMetrics.authorizationLatency / 1500) +
                (1 - data.securityMetrics.encryptionLatency / 1000) +
                (1 - data.securityMetrics.auditLoggingLatency / 500)
              ) / 4 * 100).toFixed(1) : 0}%
            </div>
            <Progress 
              value={data.securityMetrics ? ((
                (1 - data.securityMetrics.authenticationLatency / 2000) +
                (1 - data.securityMetrics.authorizationLatency / 1500) +
                (1 - data.securityMetrics.encryptionLatency / 1000) +
                (1 - data.securityMetrics.auditLoggingLatency / 500)
              ) / 4 * 100) : 0} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emergency Response</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.emergencyResponse ? formatDuration(data.emergencyResponse.averageResponseTime) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Average response time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {data.pdpaCompliance?.status === 'non-compliant' && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            PDPA compliance violations detected. Immediate action required to ensure data protection compliance.
          </AlertDescription>
        </Alert>
      )}

      {data.pdpaCompliance?.status === 'partial' && (
        <Alert className="mb-6 border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Partial PDPA compliance detected. Review and address compliance gaps to achieve full compliance.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="emergency">Emergency</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Workflow Performance Overview</CardTitle>
                <CardDescription>
                  Average completion times across healthcare workflows
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={workflowPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="workflow" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${Number(value).toFixed(2)}s`, 'Completion Time']} />
                    <Bar dataKey="avgCompletionTime" fill="#0088FE" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Status</CardTitle>
                <CardDescription>
                  Healthcare data protection compliance framework status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(data.complianceStatus || {}).map(([framework, status]) => (
                    <div key={framework} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{framework.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                      </div>
                      <Badge className={getComplianceStatusColor(status)}>
                        {status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Healthcare Workflow Performance</CardTitle>
              <CardDescription>
                Detailed analysis of patient journey and clinical workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(data.workflowPerformance || {}).map(([workflowName, metrics]) => (
                  <div key={workflowName} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        {getWorkflowIcon(workflowName)}
                        <h4 className="font-semibold">
                          {workflowName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </h4>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {((metrics.successRate || 0) * 100).toFixed(1)}% Success
                        </Badge>
                        <Badge variant="outline">
                          {formatDuration(metrics.avgCompletionTime)} Avg
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Completion Time</div>
                        <div className="font-semibold">{formatDuration(metrics.avgCompletionTime)}</div>
                        <Progress value={(metrics.avgCompletionTime / 5000) * 100} className="mt-1" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Success Rate</div>
                        <div className="font-semibold">{((metrics.successRate || 0) * 100).toFixed(1)}%</div>
                        <Progress value={(metrics.successRate || 0) * 100} className="mt-1" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Error Rate</div>
                        <div className="font-semibold">{((metrics.errorRate || 0) * 100).toFixed(2)}%</div>
                        <Progress value={(metrics.errorRate || 0) * 100} className="mt-1" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Satisfaction</div>
                        <div className="font-semibold">{((metrics.patientSatisfaction || 0) * 100).toFixed(0)}%</div>
                        <Progress value={(metrics.patientSatisfaction || 0) * 100} className="mt-1" />
                      </div>
                    </div>

                    {metrics.steps && (
                      <div>
                        <h5 className="font-medium mb-2">Workflow Steps</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {Object.entries(metrics.steps).map(([step, stepMetrics]) => (
                            <div key={step} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                              <span>{step.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                              <span className="font-medium">{formatDuration(stepMetrics.processingTime)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>PDPA Compliance Metrics</CardTitle>
                <CardDescription>
                  Personal Data Protection Act performance analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data.pdpaCompliance ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">✓</div>
                        <div className="text-sm text-muted-foreground">Data Access</div>
                        <div className="font-semibold">{formatDuration(data.pdpaCompliance.dataAccessTime)}</div>
                      </div>
                      <div className="text-center p-3 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">✓</div>
                        <div className="text-sm text-muted-foreground">Data Deletion</div>
                        <div className="font-semibold">{formatDuration(data.pdpaCompliance.dataDeletionTime)}</div>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium mb-2">Processing Times</h5>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={pdpaMetricsData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="metric" />
                          <YAxis />
                          <Tooltip formatter={(value) => [`${value}ms`, 'Processing Time']} />
                          <Bar dataKey="time" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No PDPA compliance data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Medical Data Handling</CardTitle>
                <CardDescription>
                  Healthcare data processing and storage performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                {Object.keys(data.medicalDataHandling || {}).length > 0 ? (
                  <div>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={medicalDataHandlingData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="operation" angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Time Share']} />
                        <Bar dataKey="encryption" stackId="a" fill="#0088FE" />
                        <Bar dataKey="validation" stackId="a" fill="#00C49F" />
                        <Bar dataKey="storage" stackId="a" fill="#FFBB28" />
                        <Legend />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No medical data handling metrics available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Performance Metrics</CardTitle>
              <CardDescription>
                Authentication, authorization, and encryption performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.securityMetrics ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatDuration(data.securityMetrics.authenticationLatency)}
                      </div>
                      <div className="text-sm text-muted-foreground">Authentication</div>
                      <Progress value={Math.max(0, 100 - (data.securityMetrics.authenticationLatency / 20))} className="mt-2" />
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {formatDuration(data.securityMetrics.authorizationLatency)}
                      </div>
                      <div className="text-sm text-muted-foreground">Authorization</div>
                      <Progress value={Math.max(0, 100 - (data.securityMetrics.authorizationLatency / 15))} className="mt-2" />
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {formatDuration(data.securityMetrics.encryptionLatency)}
                      </div>
                      <div className="text-sm text-muted-foreground">Encryption</div>
                      <Progress value={Math.max(0, 100 - (data.securityMetrics.encryptionLatency / 10))} className="mt-2" />
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {formatDuration(data.securityMetrics.auditLoggingLatency)}
                      </div>
                      <div className="text-sm text-muted-foreground">Audit Logging</div>
                      <Progress value={Math.max(0, 100 - (data.securityMetrics.auditLoggingLatency / 5))} className="mt-2" />
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Security Performance Radar</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={securityMetricsData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="name" />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} />
                        <Radar name="Performance" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.1} />
                        <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Performance']} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No security metrics available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emergency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Response Performance</CardTitle>
              <CardDescription>
                Critical healthcare system response times during emergency scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.emergencyResponse ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {formatDuration(data.emergencyResponse.averageResponseTime)}
                      </div>
                      <div className="text-sm text-muted-foreground">Average Response</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {formatDuration(data.emergencyResponse.maximumResponseTime)}
                      </div>
                      <div className="text-sm text-muted-foreground">Maximum Response</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {((data.emergencyResponse.successRate || 0) * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Success Rate</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Response Time Under Load</h4>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={emergencyResponseData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value}ms`, 'Response Time']} />
                        <Legend />
                        <Line type="monotone" dataKey="response" stroke="#ff7300" name="Response Time" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {data.emergencyResponse.criticalEndpoints && (
                    <div>
                      <h4 className="font-semibold mb-3">Critical Endpoint Performance</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(data.emergencyResponse.criticalEndpoints).map(([endpoint, responseTime]) => (
                          <div key={endpoint} className="flex justify-between items-center p-3 border rounded-lg">
                            <span className="font-medium">{endpoint}</span>
                            <Badge variant="outline">
                              {formatDuration(responseTime)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No emergency response metrics available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};