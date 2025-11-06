/**
 * Privacy & Compliance Dashboard for Medical Professionals
 * Sub-Phase 7.9: Privacy, Compliance & Security for Medical Professionals
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Shield, 
  Lock, 
  Eye, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  UserCheck,
  Database,
  Settings,
  Download,
  RefreshCw,
  Bell
} from 'lucide-react';

interface ComplianceStatus {
  pdpaCompliance: 'compliant' | 'partial' | 'non-compliant';
  smcCompliance: 'compliant' | 'partial' | 'non-compliant';
  dataEncryption: 'compliant' | 'partial' | 'non-compliant';
  accessControl: 'compliant' | 'partial' | 'non-compliant';
  auditLogging: 'compliant' | 'partial' | 'non-compliant';
}

interface PrivacyMetrics {
  totalDoctors: number;
  consentGranted: number;
  consentPending: number;
  consentWithdrawn: number;
  profileVisibilityPublic: number;
  profileVisibilityPrivate: number;
  dataRetentionDays: number;
  lastAuditDate: Date;
  upcomingAuditDate: Date;
}

interface SecurityIncident {
  id: string;
  type: 'access_denied' | 'data_breach' | 'unauthorized_access' | 'consent_issue';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved';
  description: string;
  affectedDoctor: string;
  reportedAt: Date;
  resolvedAt?: Date;
}

export default function PrivacyComplianceDashboard() {
  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus>({
    pdpaCompliance: 'compliant',
    smcCompliance: 'compliant',
    dataEncryption: 'compliant',
    accessControl: 'partial',
    auditLogging: 'compliant'
  });

  const [privacyMetrics, setPrivacyMetrics] = useState<PrivacyMetrics>({
    totalDoctors: 156,
    consentGranted: 142,
    consentPending: 8,
    consentWithdrawn: 6,
    profileVisibilityPublic: 89,
    profileVisibilityPrivate: 67,
    dataRetentionDays: 2555,
    lastAuditDate: new Date('2024-10-15'),
    upcomingAuditDate: new Date('2025-01-15')
  });

  const [securityIncidents, setSecurityIncidents] = useState<SecurityIncident[]>([
    {
      id: 'INC-2024-001',
      type: 'access_denied',
      severity: 'low',
      status: 'resolved',
      description: 'Unauthorized access attempt to Dr. Lim\'s personal information',
      affectedDoctor: 'Dr. Lim Wei Ming',
      reportedAt: new Date('2024-11-01'),
      resolvedAt: new Date('2024-11-02')
    },
    {
      id: 'INC-2024-002',
      type: 'consent_issue',
      severity: 'medium',
      status: 'investigating',
      description: 'Missing PDPA consent for Dr. Sarah Chen profile update',
      affectedDoctor: 'Dr. Sarah Chen',
      reportedAt: new Date('2024-11-03')
    }
  ]);

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-600';
      case 'partial': return 'text-yellow-600';
      case 'non-compliant': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getComplianceBadge = (status: string) => {
    switch (status) {
      case 'compliant': return <Badge className="bg-green-100 text-green-800">Compliant</Badge>;
      case 'partial': return <Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>;
      case 'non-compliant': return <Badge className="bg-red-100 text-red-800">Non-Compliant</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-blue-500 bg-blue-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const consentRate = Math.round((privacyMetrics.consentGranted / privacyMetrics.totalDoctors) * 100);
  const publicVisibilityRate = Math.round((privacyMetrics.profileVisibilityPublic / privacyMetrics.totalDoctors) * 100);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Privacy & Compliance Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Comprehensive privacy protection and regulatory compliance for medical professionals
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">PDPA Compliance</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getComplianceBadge(complianceStatus.pdpaCompliance)}</div>
              <p className="text-xs text-muted-foreground">Singapore Personal Data Protection Act</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">SMC Compliance</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getComplianceBadge(complianceStatus.smcCompliance)}</div>
              <p className="text-xs text-muted-foreground">Singapore Medical Council Guidelines</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Data Encryption</CardTitle>
              <Lock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getComplianceBadge(complianceStatus.dataEncryption)}</div>
              <p className="text-xs text-muted-foreground">End-to-end encryption status</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Doctors</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{privacyMetrics.totalDoctors}</div>
              <p className="text-xs text-muted-foreground">Total registered medical professionals</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="compliance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="compliance">Compliance Status</TabsTrigger>
            <TabsTrigger value="consent">Consent Management</TabsTrigger>
            <TabsTrigger value="privacy">Privacy Controls</TabsTrigger>
            <TabsTrigger value="security">Security Incidents</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Compliance Status Tab */}
          <TabsContent value="compliance">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Regulatory Compliance Status</CardTitle>
                  <CardDescription>
                    Current compliance status with Singapore healthcare regulations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Shield className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">PDPA Compliance</p>
                        <p className="text-sm text-gray-600">Personal Data Protection Act</p>
                      </div>
                    </div>
                    <div className={getComplianceColor(complianceStatus.pdpaCompliance)}>
                      {getComplianceBadge(complianceStatus.pdpaCompliance)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <UserCheck className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">SMC Guidelines</p>
                        <p className="text-sm text-gray-600">Singapore Medical Council</p>
                      </div>
                    </div>
                    <div className={getComplianceColor(complianceStatus.smcCompliance)}>
                      {getComplianceBadge(complianceStatus.smcCompliance)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Lock className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium">Data Encryption</p>
                        <p className="text-sm text-gray-600">Healthcare data security</p>
                      </div>
                    </div>
                    <div className={getComplianceColor(complianceStatus.dataEncryption)}>
                      {getComplianceBadge(complianceStatus.dataEncryption)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Eye className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="font-medium">Access Control</p>
                        <p className="text-sm text-gray-600">Role-based access management</p>
                      </div>
                    </div>
                    <div className={getComplianceColor(complianceStatus.accessControl)}>
                      {getComplianceBadge(complianceStatus.accessControl)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="font-medium">Audit Logging</p>
                        <p className="text-sm text-gray-600">Comprehensive audit trail</p>
                      </div>
                    </div>
                    <div className={getComplianceColor(complianceStatus.auditLogging)}>
                      {getComplianceBadge(complianceStatus.auditLogging)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Compliance Reviews</CardTitle>
                  <CardDescription>
                    Scheduled compliance assessments and audits
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Next Audit:</strong> {privacyMetrics.upcomingAuditDate.toLocaleDateString()} 
                      {' '}in {Math.ceil((privacyMetrics.upcomingAuditDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24))} days
                    </AlertDescription>
                  </Alert>

                  <div className="mt-4 space-y-3">
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Monthly PDPA Review</h4>
                        <Badge variant="outline">Due in 12 days</Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        Review of personal data handling practices and consent management
                      </p>
                    </div>

                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">SMC Guidelines Update</h4>
                        <Badge variant="outline">Due in 30 days</Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        Review compliance with latest Singapore Medical Council guidelines
                      </p>
                    </div>

                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Security Assessment</h4>
                        <Badge variant="outline">Due in 45 days</Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        Comprehensive security audit and penetration testing
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Consent Management Tab */}
          <TabsContent value="consent">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Doctor Consent Overview</CardTitle>
                  <CardDescription>
                    Current consent status across all registered medical professionals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Consent Granted</Label>
                        <span className="text-sm font-medium">{consentRate}%</span>
                      </div>
                      <Progress value={consentRate} className="h-2" />
                      <p className="text-xs text-gray-600 mt-1">
                        {privacyMetrics.consentGranted} of {privacyMetrics.totalDoctors} doctors
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Public Profile Visibility</Label>
                        <span className="text-sm font-medium">{publicVisibilityRate}%</span>
                      </div>
                      <Progress value={publicVisibilityRate} className="h-2" />
                      <p className="text-xs text-gray-600 mt-1">
                        {privacyMetrics.profileVisibilityPublic} doctors with public profiles
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{privacyMetrics.consentGranted}</div>
                        <div className="text-sm text-gray-600">Consent Granted</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">{privacyMetrics.consentPending}</div>
                        <div className="text-sm text-gray-600">Pending Review</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{privacyMetrics.consentWithdrawn}</div>
                        <div className="text-sm text-gray-600">Withdrawn</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Manage consent and privacy settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <UserCheck className="w-4 h-4 mr-2" />
                    Bulk Consent Review
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    Privacy Settings
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    Consent Forms
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Policy Updates
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Privacy Controls Tab */}
          <TabsContent value="privacy">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Doctor Privacy Controls</CardTitle>
                  <CardDescription>
                    Manage visibility and access controls for doctor information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Public Profile Display</Label>
                      <p className="text-sm text-gray-600">Show doctor profiles publicly</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Contact Information Visibility</Label>
                      <p className="text-sm text-gray-600">Display clinic contact details</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Schedule Visibility</Label>
                      <p className="text-sm text-gray-600">Show availability to patients</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Reviews and Ratings</Label>
                      <p className="text-sm text-gray-600">Enable patient review display</p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Professional Achievements</Label>
                      <p className="text-sm text-gray-600">Display awards and certifications</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Research Publications</Label>
                      <p className="text-sm text-gray-600">Show academic publications</p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Data Retention Policy</CardTitle>
                  <CardDescription>
                    Configure data retention and deletion policies
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Data Retention Period</Label>
                    <div className="text-2xl font-bold text-blue-600">
                      {privacyMetrics.dataRetentionDays} days
                    </div>
                    <p className="text-sm text-gray-600">
                      Current retention period for doctor data
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Automatic Deletion</Label>
                    <div className="flex items-center space-x-2">
                      <Switch defaultChecked />
                      <span className="text-sm">Enable auto-deletion after retention period</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Backup Retention</Label>
                    <div className="flex items-center space-x-2">
                      <Switch defaultChecked />
                      <span className="text-sm">Rettain backups for compliance</span>
                    </div>
                  </div>

                  <Alert>
                    <Bell className="h-4 w-4" />
                    <AlertDescription>
                      Next data cleanup scheduled for: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </AlertDescription>
                  </Alert>

                  <Button className="w-full">
                    <Settings className="w-4 h-4 mr-2" />
                    Configure Retention Policy
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Incidents Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Incidents</CardTitle>
                <CardDescription>
                  Track and manage security incidents and privacy breaches
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {securityIncidents.map((incident) => (
                    <div key={incident.id} className={`p-4 border rounded-lg ${getSeverityColor(incident.severity)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant={
                            incident.severity === 'critical' ? 'destructive' :
                            incident.severity === 'high' ? 'default' :
                            incident.severity === 'medium' ? 'secondary' : 'outline'
                          }>
                            {incident.severity.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">{incident.id}</Badge>
                        </div>
                        <Badge variant={
                          incident.status === 'resolved' ? 'default' :
                          incident.status === 'investigating' ? 'secondary' : 'outline'
                        }>
                          {incident.status}
                        </Badge>
                      </div>

                      <h4 className="font-medium mb-1">{incident.description}</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Affected Doctor: {incident.affectedDoctor}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Reported: {incident.reportedAt.toLocaleString()}</span>
                        {incident.resolvedAt && (
                          <span>Resolved: {incident.resolvedAt.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <Button variant="outline" className="w-full">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Report New Incident
                  </Button>
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
                    <UserCheck className="w-4 h-4 mr-2" />
                    SMC Guidelines Report
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Lock className="w-4 h-4 mr-2" />
                    Security Audit Report
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    Privacy Impact Assessment
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Data Export</CardTitle>
                  <CardDescription>
                    Export doctor data for compliance purposes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Doctor Profiles
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Consent Records
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Audit Logs
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Security Logs
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}