/**
 * Compliance Dashboard Component
 * Sub-Phase 8.11: Government Compliance & Security Framework
 * Main comprehensive compliance monitoring and reporting dashboard
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock,
  FileText,
  Users,
  Database,
  Lock,
  Eye,
  Activity,
  TrendingUp,
  TrendingDown,
  Globe,
  Gavel,
  Key,
  Server,
  RefreshCw,
  Download,
  Settings
} from 'lucide-react';

interface ComplianceScore {
  overall: number;
  pdpa: number;
  cybersecurity: number;
  healthDataProtection: number;
  governmentIntegration: number;
  auditCompliance: number;
}

interface ComplianceMetrics {
  complianceScores: ComplianceScore;
  totalPolicies: number;
  policiesCompliant: number;
  activeUsers: number;
  dataBreaches: number;
  auditFindings: number;
  governmentReports: number;
  lastAuditDate: Date;
  nextAuditDate: Date;
  incidentsThisMonth: number;
  complianceTrends: {
    period: string;
    score: number;
  }[];
}

interface ComplianceAlert {
  id: string;
  type: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  regulation: string;
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: Date;
  dueDate: Date;
  assignedTo?: string;
}

interface RegulatoryRequirement {
  id: string;
  name: string;
  regulation: string;
  status: 'compliant' | 'non_compliant' | 'partial' | 'pending';
  lastAssessment: Date;
  nextReview: Date;
  complianceLevel: number;
  requirements: string[];
  evidence: string[];
  owner: string;
}

export default function ComplianceDashboard() {
  const [metrics, setMetrics] = useState<ComplianceMetrics>({
    complianceScores: {
      overall: 0,
      pdpa: 0,
      cybersecurity: 0,
      healthDataProtection: 0,
      governmentIntegration: 0,
      auditCompliance: 0
    },
    totalPolicies: 0,
    policiesCompliant: 0,
    activeUsers: 0,
    dataBreaches: 0,
    auditFindings: 0,
    governmentReports: 0,
    lastAuditDate: new Date(),
    nextAuditDate: new Date(),
    incidentsThisMonth: 0,
    complianceTrends: []
  });

  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [requirements, setRequirements] = useState<RegulatoryRequirement[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Initialize compliance data
    initializeComplianceData();
  }, []);

  const initializeComplianceData = () => {
    // Compliance scores
    const complianceScores: ComplianceScore = {
      overall: 94,
      pdpa: 97,
      cybersecurity: 91,
      healthDataProtection: 95,
      governmentIntegration: 89,
      auditCompliance: 96
    };

    // Compliance trends
    const trends = [
      { period: 'Jan', score: 87 },
      { period: 'Feb', score: 89 },
      { period: 'Mar', score: 91 },
      { period: 'Apr', score: 93 },
      { period: 'May', score: 92 },
      { period: 'Jun', score: 94 },
      { period: 'Jul', score: 94 }
    ];

    // Generate sample alerts
    const sampleAlerts: ComplianceAlert[] = [
      {
        id: 'ALT-001',
        type: 'high',
        title: 'NDR System Authentication Token Expired',
        description: 'National Disease Registry integration requires token renewal',
        regulation: 'Healthcare Data Protection Act',
        status: 'in_progress',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        assignedTo: 'IT Security Team'
      },
      {
        id: 'ALT-002',
        type: 'medium',
        title: 'PDPA Consent Review Due',
        description: 'Quarterly PDPA consent compliance review scheduled',
        regulation: 'Personal Data Protection Act',
        status: 'open',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        assignedTo: 'Compliance Officer'
      },
      {
        id: 'ALT-003',
        type: 'critical',
        title: 'Unusual Data Access Pattern Detected',
        description: 'Multiple failed access attempts from single IP address',
        regulation: 'Cybersecurity Act',
        status: 'resolved',
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
        assignedTo: 'Security Operations'
      }
    ];

    // Regulatory requirements
    const sampleRequirements: RegulatoryRequirement[] = [
      {
        id: 'REQ-001',
        name: 'PDPA Data Protection Requirements',
        regulation: 'Personal Data Protection Act',
        status: 'compliant',
        lastAssessment: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        nextReview: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000),
        complianceLevel: 97,
        requirements: [
          'Data minimization principles',
          'Purpose limitation compliance',
          'Consent management framework',
          'Data retention policies'
        ],
        evidence: [
          'Privacy policy documentation',
          'Consent forms and records',
          'Data retention logs',
          'Privacy impact assessments'
        ],
        owner: 'Privacy Officer'
      },
      {
        id: 'REQ-002',
        name: 'Healthcare Data Security Standards',
        regulation: 'Healthcare Services Act',
        status: 'compliant',
        lastAssessment: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        nextReview: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        complianceLevel: 95,
        requirements: [
          'End-to-end encryption',
          'Access control mechanisms',
          'Audit logging requirements',
          'Data breach procedures'
        ],
        evidence: [
          'Encryption implementation docs',
          'Access control matrices',
          'Audit log samples',
          'Incident response procedures'
        ],
        owner: 'IT Security Manager'
      },
      {
        id: 'REQ-003',
        name: 'Government System Integration Security',
        regulation: 'Government Cybersecurity Standards',
        status: 'partial',
        lastAssessment: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        nextReview: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        complianceLevel: 89,
        requirements: [
          'Government authentication protocols',
          'Secure API integration',
          'Data transmission encryption',
          'System monitoring and logging'
        ],
        evidence: [
          'API security documentation',
          'Authentication flow diagrams',
          'Security test results',
          'Monitoring dashboard screenshots'
        ],
        owner: 'Integration Team Lead'
      }
    ];

    setMetrics({
      complianceScores,
      totalPolicies: 24,
      policiesCompliant: 23,
      activeUsers: 15847,
      dataBreaches: 0,
      auditFindings: 3,
      governmentReports: 12,
      lastAuditDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      nextAuditDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      incidentsThisMonth: 1,
      complianceTrends: trends
    });

    setAlerts(sampleAlerts);
    setRequirements(sampleRequirements);
  };

  const refreshData = async () => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      initializeComplianceData();
      setRefreshing(false);
    }, 2000);
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-blue-500 bg-blue-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-600 bg-green-100';
      case 'non_compliant': return 'text-red-600 bg-red-100';
      case 'partial': return 'text-yellow-600 bg-yellow-100';
      case 'pending': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 90) return 'text-blue-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const generateComplianceReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      complianceScores: metrics.complianceScores,
      alerts: alerts,
      requirements: requirements,
      summary: {
        overallCompliance: metrics.complianceScores.overall,
        totalPolicies: metrics.totalPolicies,
        compliantPolicies: metrics.policiesCompliant,
        activeAlerts: alerts.filter(a => a.status !== 'resolved').length,
        overdueItems: alerts.filter(a => new Date(a.dueDate) < new Date() && a.status !== 'resolved').length
      }
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getDaysUntilAudit = () => {
    const now = new Date();
    const auditDate = metrics.nextAuditDate;
    const diffTime = auditDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Compliance Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Comprehensive government compliance monitoring and regulatory reporting
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={generateComplianceReport}>
                <Download className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
              <Button variant="outline" onClick={refreshData} disabled={refreshing}>
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Compliance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Compliance</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getScoreColor(metrics.complianceScores.overall)}`}>
                {metrics.complianceScores.overall}%
              </div>
              <p className="text-xs text-muted-foreground">
                Next audit in {getDaysUntilAudit()} days
              </p>
              <Progress value={metrics.complianceScores.overall} className="h-2 mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Policy Compliance</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {metrics.policiesCompliant}/{metrics.totalPolicies}
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.round((metrics.policiesCompliant / metrics.totalPolicies) * 100)}% compliant policies
              </p>
              <Progress value={(metrics.policiesCompliant / metrics.totalPolicies) * 100} className="h-2 mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {metrics.activeUsers.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {metrics.incidentsThisMonth} security incidents this month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="regulations">Regulations</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Compliance Scores */}
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Scores</CardTitle>
                  <CardDescription>
                    Current compliance status across all regulatory frameworks
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">PDPA Compliance</span>
                      <span className={`text-sm font-bold ${getScoreColor(metrics.complianceScores.pdpa)}`}>
                        {metrics.complianceScores.pdpa}%
                      </span>
                    </div>
                    <Progress value={metrics.complianceScores.pdpa} className="h-2" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Cybersecurity</span>
                      <span className={`text-sm font-bold ${getScoreColor(metrics.complianceScores.cybersecurity)}`}>
                        {metrics.complianceScores.cybersecurity}%
                      </span>
                    </div>
                    <Progress value={metrics.complianceScores.cybersecurity} className="h-2" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Health Data Protection</span>
                      <span className={`text-sm font-bold ${getScoreColor(metrics.complianceScores.healthDataProtection)}`}>
                        {metrics.complianceScores.healthDataProtection}%
                      </span>
                    </div>
                    <Progress value={metrics.complianceScores.healthDataProtection} className="h-2" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Government Integration</span>
                      <span className={`text-sm font-bold ${getScoreColor(metrics.complianceScores.governmentIntegration)}`}>
                        {metrics.complianceScores.governmentIntegration}%
                      </span>
                    </div>
                    <Progress value={metrics.complianceScores.governmentIntegration} className="h-2" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Audit Compliance</span>
                      <span className={`text-sm font-bold ${getScoreColor(metrics.complianceScores.auditCompliance)}`}>
                        {metrics.complianceScores.auditCompliance}%
                      </span>
                    </div>
                    <Progress value={metrics.complianceScores.auditCompliance} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Recent Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Compliance Alerts</CardTitle>
                  <CardDescription>
                    Active alerts requiring attention
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {alerts.filter(a => a.status !== 'resolved').slice(0, 5).map((alert) => (
                      <div key={alert.id} className={`p-3 rounded-lg border ${getAlertColor(alert.type)}`}>
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm">{alert.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {alert.type.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{alert.description}</p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">{alert.regulation}</span>
                          <span className="text-gray-500">
                            Due: {new Date(alert.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Compliance Metrics Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Data Breaches</CardTitle>
                  <Lock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{metrics.dataBreaches}</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Audit Findings</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{metrics.auditFindings}</div>
                  <p className="text-xs text-muted-foreground">Open findings</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Gov Reports</CardTitle>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{metrics.governmentReports}</div>
                  <p className="text-xs text-muted-foreground">Submitted this quarter</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Next Audit</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {getDaysUntilAudit()}
                  </div>
                  <p className="text-xs text-muted-foreground">Days remaining</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Regulations Tab */}
          <TabsContent value="regulations">
            <Card>
              <CardHeader>
                <CardTitle>Regulatory Requirements</CardTitle>
                <CardDescription>
                  Compliance status for all regulatory frameworks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {requirements.map((req) => (
                    <div key={req.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{req.name}</h3>
                          <p className="text-sm text-gray-600">{req.regulation}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(req.status)}>
                            {req.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <span className="text-sm font-bold">{req.complianceLevel}%</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2">Requirements</h4>
                          <ul className="text-sm space-y-1">
                            {req.requirements.map((req, index) => (
                              <li key={index} className="flex items-center">
                                <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                                {req}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium mb-2">Evidence & Documentation</h4>
                          <ul className="text-sm space-y-1">
                            {req.evidence.map((ev, index) => (
                              <li key={index} className="flex items-center">
                                <FileText className="h-3 w-3 text-blue-500 mr-2" />
                                {ev}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                        <span>Owner: {req.owner}</span>
                        <span>
                          Next Review: {new Date(req.nextReview).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Alerts</CardTitle>
                <CardDescription>
                  All alerts and notifications requiring attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div key={alert.id} className={`p-4 rounded-lg border ${getAlertColor(alert.type)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{alert.id}</Badge>
                          <Badge variant={alert.type === 'critical' ? 'destructive' : 'secondary'}>
                            {alert.type.toUpperCase()}
                          </Badge>
                        </div>
                        <Badge variant={alert.status === 'resolved' ? 'default' : 'outline'}>
                          {alert.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>

                      <h3 className="font-semibold mb-1">{alert.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{alert.description}</p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-700">Regulation</p>
                          <p>{alert.regulation}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Created</p>
                          <p>{alert.createdAt.toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Due Date</p>
                          <p className={new Date(alert.dueDate) < new Date() ? 'text-red-600' : ''}>
                            {alert.dueDate.toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {alert.assignedTo && (
                        <div className="mt-2 text-sm">
                          <span className="font-medium text-gray-700">Assigned to: </span>
                          <span>{alert.assignedTo}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Reports</CardTitle>
                  <CardDescription>
                    Generate and download compliance reports
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    PDPA Compliance Report
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Shield className="w-4 h-4 mr-2" />
                    Cybersecurity Assessment
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Globe className="w-4 h-4 mr-2" />
                    Government Integration Report
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    Audit Trail Report
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Regulatory Submissions</CardTitle>
                  <CardDescription>
                    Government-required compliance submissions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Database className="w-4 h-4 mr-2" />
                    MOH Monthly Report
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Activity className="w-4 h-4 mr-2" />
                    PDPC Annual Return
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Gavel className="w-4 h-4 mr-2" />
                    Cybersecurity Compliance
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Key className="w-4 h-4 mr-2" />
                    Data Protection Impact Assessment
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Trends</CardTitle>
                <CardDescription>
                  Historical compliance performance over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-64 flex items-end justify-between space-x-2">
                    {metrics.complianceTrends.map((trend, index) => (
                      <div key={trend.period} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full bg-blue-500 rounded-t"
                          style={{ 
                            height: `${(trend.score / 100) * 200}px`,
                            minHeight: '20px'
                          }}
                        />
                        <span className="text-xs text-gray-600 mt-1">{trend.period}</span>
                        <span className="text-xs font-medium">{trend.score}%</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Improvement trend</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">
                          +{metrics.complianceTrends[metrics.complianceTrends.length - 1].score - 
                             metrics.complianceTrends[0].score}% overall
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}