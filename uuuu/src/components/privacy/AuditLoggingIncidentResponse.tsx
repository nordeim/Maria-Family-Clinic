/**
 * Audit Logging & Incident Response
 * Comprehensive audit trail management and security incident handling
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Shield, 
  AlertTriangle, 
  Clock, 
  User, 
  Database,
  Search,
  Download,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  Eye,
  TrendingUp,
  Activity,
  Bell
} from 'lucide-react';

interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  userRole: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'login' | 'logout' | 'export' | 'search';
  resource: string;
  resourceId: string;
  fieldChanged?: string;
  oldValue?: string;
  newValue?: string;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  dataSensitivity: 'public' | 'internal' | 'confidential' | 'restricted';
  complianceFlags: ('pdpa' | 'gdpr' | 'smc' | 'hipaa')[];
  status: 'success' | 'failed' | 'blocked';
  reason?: string;
}

interface SecurityIncident {
  id: string;
  type: 'data_breach' | 'unauthorized_access' | 'consent_violation' | 'privacy_breach' | 'system_intrusion';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'detected' | 'investigating' | 'contained' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  title: string;
  description: string;
  affectedRecords: number;
  affectedDoctors: string[];
  reportedBy: string;
  assignedTo?: string;
  reportedAt: Date;
  detectedAt: Date;
  resolvedAt?: Date;
  actionsTaken: string[];
  preventionMeasures: string[];
  regulatoryReporting: boolean;
  regulatoryReportSent?: Date;
  impactAssessment: {
    confidentiality: 'none' | 'low' | 'medium' | 'high';
    integrity: 'none' | 'low' | 'medium' | 'high';
    availability: 'none' | 'low' | 'medium' | 'high';
  };
}

interface ComplianceAlert {
  id: string;
  type: 'consent_expiry' | 'policy_violation' | 'audit_required' | 'regulatory_change';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  affectedCount: number;
  dueDate?: Date;
  status: 'open' | 'acknowledged' | 'resolved';
  createdAt: Date;
}

export default function AuditLoggingIncidentResponse() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: 'audit-001',
      timestamp: new Date('2024-11-04T10:15:00'),
      userId: 'user-001',
      userName: 'Dr. Lim Wei Ming',
      userRole: 'provider',
      action: 'read',
      resource: 'doctor_profile',
      resourceId: 'doc-002',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      sessionId: 'sess-abc123',
      dataSensitivity: 'confidential',
      complianceFlags: ['pdpa', 'smc'],
      status: 'success'
    },
    {
      id: 'audit-002',
      timestamp: new Date('2024-11-04T10:30:00'),
      userId: 'user-002',
      userName: 'Sarah Johnson',
      userRole: 'clinic_admin',
      action: 'update',
      resource: 'doctor_profile',
      resourceId: 'doc-003',
      fieldChanged: 'contact_information',
      oldValue: 'Private',
      newValue: 'Public',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      sessionId: 'sess-def456',
      dataSensitivity: 'confidential',
      complianceFlags: ['pdpa'],
      status: 'success'
    },
    {
      id: 'audit-003',
      timestamp: new Date('2024-11-04T11:00:00'),
      userId: 'user-003',
      userName: 'Michael Chen',
      userRole: 'staff',
      action: 'export',
      resource: 'doctor_data',
      resourceId: 'bulk-export',
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      sessionId: 'sess-ghi789',
      dataSensitivity: 'restricted',
      complianceFlags: ['pdpa', 'gdpr'],
      status: 'blocked',
      reason: 'Insufficient permissions for restricted data export'
    }
  ]);

  const [securityIncidents, setSecurityIncidents] = useState<SecurityIncident[]>([
    {
      id: 'INC-2024-001',
      type: 'unauthorized_access',
      severity: 'high',
      status: 'investigating',
      priority: 'high',
      title: 'Unauthorized Access Attempt to Doctor Profile',
      description: 'Multiple failed attempts to access restricted doctor profile information',
      affectedRecords: 5,
      affectedDoctors: ['Dr. Sarah Chen', 'Dr. Ahmad Rahman'],
      reportedBy: 'System Alert',
      detectedAt: new Date('2024-11-04T08:45:00'),
      reportedAt: new Date('2024-11-04T08:45:00'),
      actionsTaken: [
        'Blocked suspicious IP addresses',
        'Enhanced monitoring activated',
        'Security team notified'
      ],
      preventionMeasures: [
        'Review access control policies',
        'Implement additional authentication',
        'Conduct security awareness training'
      ],
      regulatoryReporting: true,
      impactAssessment: {
        confidentiality: 'medium',
        integrity: 'low',
        availability: 'none'
      }
    },
    {
      id: 'INC-2024-002',
      type: 'consent_violation',
      severity: 'medium',
      status: 'resolved',
      priority: 'normal',
      title: 'Missing PDPA Consent for Profile Update',
      description: 'Doctor profile updated without proper PDPA consent documentation',
      affectedRecords: 1,
      affectedDoctors: ['Dr. Sarah Chen'],
      reportedBy: 'Compliance Team',
      detectedAt: new Date('2024-11-03T14:20:00'),
      reportedAt: new Date('2024-11-03T14:30:00'),
      resolvedAt: new Date('2024-11-04T09:15:00'),
      actionsTaken: [
        'Updated consent documentation',
        'Retrained staff on consent procedures',
        'Implemented consent verification check'
      ],
      preventionMeasures: [
        'Mandatory consent verification before updates',
        'Regular consent audits',
        'Staff training program enhancement'
      ],
      regulatoryReporting: false,
      impactAssessment: {
        confidentiality: 'low',
        integrity: 'low',
        availability: 'none'
      }
    }
  ]);

  const [complianceAlerts, setComplianceAlerts] = useState<ComplianceAlert[]>([
    {
      id: 'alert-001',
      type: 'consent_expiry',
      severity: 'warning',
      title: '12 Doctor Consents Expiring Soon',
      description: 'PDPA consents for 12 doctors will expire within the next 30 days',
      affectedCount: 12,
      dueDate: new Date('2024-12-04'),
      status: 'open',
      createdAt: new Date('2024-11-04')
    },
    {
      id: 'alert-002',
      type: 'audit_required',
      severity: 'critical',
      title: 'Quarterly Security Audit Due',
      description: 'Quarterly security audit is due and must be completed within 15 days',
      affectedCount: 156,
      dueDate: new Date('2024-11-19'),
      status: 'open',
      createdAt: new Date('2024-11-04')
    },
    {
      id: 'alert-003',
      type: 'regulatory_change',
      severity: 'info',
      title: 'SMC Guidelines Updated',
      description: 'Singapore Medical Council has updated professional guidelines',
      affectedCount: 156,
      status: 'acknowledged',
      createdAt: new Date('2024-11-01')
    }
  ]);

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'create': return <Badge className="bg-green-100 text-green-800">Create</Badge>;
      case 'read': return <Badge className="bg-blue-100 text-blue-800">Read</Badge>;
      case 'update': return <Badge className="bg-yellow-100 text-yellow-800">Update</Badge>;
      case 'delete': return <Badge className="bg-red-100 text-red-800">Delete</Badge>;
      case 'login': return <Badge className="bg-purple-100 text-purple-800">Login</Badge>;
      case 'logout': return <Badge className="bg-purple-100 text-purple-800">Logout</Badge>;
      case 'export': return <Badge className="bg-orange-100 text-orange-800">Export</Badge>;
      case 'search': return <Badge className="bg-gray-100 text-gray-800">Search</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const getStatusBadge = (status: string, type: 'log' | 'incident' | 'alert' = 'log') => {
    if (type === 'incident') {
      switch (status) {
        case 'detected': return <Badge className="bg-red-100 text-red-800">Detected</Badge>;
        case 'investigating': return <Badge className="bg-yellow-100 text-yellow-800">Investigating</Badge>;
        case 'contained': return <Badge className="bg-blue-100 text-blue-800">Contained</Badge>;
        case 'resolved': return <Badge className="bg-green-100 text-green-800">Resolved</Badge>;
        case 'closed': return <Badge className="bg-gray-100 text-gray-800">Closed</Badge>;
        default: return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
      }
    }
    
    if (type === 'alert') {
      switch (status) {
        case 'open': return <Badge className="bg-red-100 text-red-800">Open</Badge>;
        case 'acknowledged': return <Badge className="bg-yellow-100 text-yellow-800">Acknowledged</Badge>;
        case 'resolved': return <Badge className="bg-green-100 text-green-800">Resolved</Badge>;
        default: return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
      }
    }

    switch (status) {
      case 'success': return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case 'failed': return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'blocked': return <Badge className="bg-yellow-100 text-yellow-800">Blocked</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return <Badge className="bg-red-100 text-red-800 border-red-200">Critical</Badge>;
      case 'high': return <Badge className="bg-orange-100 text-orange-800 border-orange-200">High</Badge>;
      case 'medium': return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Medium</Badge>;
      case 'low': return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Low</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const getSensitivityColor = (sensitivity: string) => {
    switch (sensitivity) {
      case 'public': return 'text-green-600';
      case 'internal': return 'text-blue-600';
      case 'confidential': return 'text-yellow-600';
      case 'restricted': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const auditStats = {
    totalLogs: auditLogs.length,
    blockedActions: auditLogs.filter(log => log.status === 'blocked').length,
    sensitiveAccess: auditLogs.filter(log => 
      ['confidential', 'restricted'].includes(log.dataSensitivity)
    ).length,
    openIncidents: securityIncidents.filter(inc => 
      ['detected', 'investigating'].includes(inc.status)
    ).length,
    criticalAlerts: complianceAlerts.filter(alt => alt.severity === 'critical').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Audit Logging & Incident Response</h2>
          <p className="text-gray-600 mt-1">
            Comprehensive audit trail management and security incident handling
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Logs
          </Button>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Logs</p>
                <p className="text-2xl font-bold">{auditStats.totalLogs}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Blocked Actions</p>
                <p className="text-2xl font-bold text-red-600">{auditStats.blockedActions}</p>
              </div>
              <Shield className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sensitive Access</p>
                <p className="text-2xl font-bold text-yellow-600">{auditStats.sensitiveAccess}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Open Incidents</p>
                <p className="text-2xl font-bold text-orange-600">{auditStats.openIncidents}</p>
              </div>
              <Activity className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical Alerts</p>
                <p className="text-2xl font-bold text-red-600">{auditStats.criticalAlerts}</p>
              </div>
              <Bell className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="audit-logs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="audit-logs">Audit Logs</TabsTrigger>
          <TabsTrigger value="incidents">Security Incidents</TabsTrigger>
          <TabsTrigger value="alerts">Compliance Alerts</TabsTrigger>
          <TabsTrigger value="incident-response">Incident Response</TabsTrigger>
        </TabsList>

        {/* Audit Logs Tab */}
        <TabsContent value="audit-logs">
          <Card>
            <CardHeader>
              <CardTitle>Audit Trail Log</CardTitle>
              <CardDescription>
                Comprehensive audit trail of all system activities and data access
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input 
                      placeholder="Search audit logs..." 
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="create">Create</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                    <SelectItem value="delete">Delete</SelectItem>
                    <SelectItem value="export">Export</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by sensitivity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sensitivity Levels</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="internal">Internal</SelectItem>
                    <SelectItem value="confidential">Confidential</SelectItem>
                    <SelectItem value="restricted">Restricted</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Apply Filters
                </Button>
              </div>

              {/* Audit Log Entries */}
              <div className="space-y-4">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Activity className="h-4 w-4" />
                        <div>
                          <h4 className="font-medium">{log.action.toUpperCase()} {log.resource}</h4>
                          <p className="text-sm text-gray-600">
                            {log.userName} ({log.userRole}) - {log.timestamp.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getActionBadge(log.action)}
                        {getStatusBadge(log.status)}
                        <span className={`text-sm font-medium ${getSensitivityColor(log.dataSensitivity)}`}>
                          {log.dataSensitivity}
                        </span>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          Details
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Resource ID</p>
                        <p className="font-medium">{log.resourceId}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">IP Address</p>
                        <p className="font-medium">{log.ipAddress}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Compliance</p>
                        <div className="flex space-x-1">
                          {log.complianceFlags.map((flag) => (
                            <Badge key={flag} variant="outline" className="text-xs">
                              {flag.toUpperCase()}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-600">Session</p>
                        <p className="font-medium">{log.sessionId}</p>
                      </div>
                    </div>

                    {log.fieldChanged && (
                      <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                        <strong>Field Changed:</strong> {log.fieldChanged}
                        {log.oldValue && log.newValue && (
                          <div className="mt-1">
                            <span className="text-red-600">{log.oldValue}</span>
                            <span className="mx-2">→</span>
                            <span className="text-green-600">{log.newValue}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {log.reason && (
                      <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                        <strong>Block Reason:</strong> {log.reason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Incidents Tab */}
        <TabsContent value="incidents">
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
                  <div key={incident.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        <div>
                          <h4 className="font-medium">{incident.title}</h4>
                          <p className="text-sm text-gray-600">
                            {incident.type.replace('_', ' ')} - {incident.id}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getSeverityBadge(incident.severity)}
                        {getStatusBadge(incident.status, 'incident')}
                        <Button variant="outline" size="sm">
                          Investigate
                        </Button>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 mb-3">{incident.description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                      <div>
                        <p className="text-gray-600">Affected Records</p>
                        <p className="font-medium">{incident.affectedRecords}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Detected</p>
                        <p className="font-medium">{incident.detectedAt.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Priority</p>
                        <Badge variant="outline">{incident.priority}</Badge>
                      </div>
                      <div>
                        <p className="text-gray-600">Regulatory Reporting</p>
                        <div className="flex items-center space-x-1">
                          {incident.regulatoryReporting ? (
                            <CheckCircle className="h-4 w-4 text-red-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-xs text-gray-600 mb-1">Affected Doctors:</p>
                      <div className="flex flex-wrap gap-1">
                        {incident.affectedDoctors.map((doctor) => (
                          <Badge key={doctor} variant="outline" className="text-xs">
                            {doctor}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 mb-1">Actions Taken:</p>
                        <ul className="space-y-1">
                          {incident.actionsTaken.map((action, index) => (
                            <li key={index} className="flex items-center space-x-1">
                              <CheckCircle className="h-3 w-3 text-green-600" />
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">Prevention Measures:</p>
                        <ul className="space-y-1">
                          {incident.preventionMeasures.map((measure, index) => (
                            <li key={index} className="flex items-center space-x-1">
                              <Shield className="h-3 w-3 text-blue-600" />
                              <span>{measure}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">Impact Assessment:</p>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>Confidentiality:</span>
                            <Badge variant="outline" className="text-xs">
                              {incident.impactAssessment.confidentiality}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Integrity:</span>
                            <Badge variant="outline" className="text-xs">
                              {incident.impactAssessment.integrity}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Availability:</span>
                            <Badge variant="outline" className="text-xs">
                              {incident.impactAssessment.availability}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center space-x-3">
                <Button>
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Report New Incident
                </Button>
                <Button variant="outline">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Alerts Tab */}
        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Alerts</CardTitle>
              <CardDescription>
                Monitor compliance requirements and regulatory notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceAlerts.map((alert) => (
                  <div key={alert.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <Bell className="h-5 w-5 text-orange-600" />
                        <div>
                          <h4 className="font-medium">{alert.title}</h4>
                          <p className="text-sm text-gray-600">
                            {alert.type.replace('_', ' ')} - {alert.id}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {alert.severity === 'critical' && (
                          <Badge className="bg-red-100 text-red-800">Critical</Badge>
                        )}
                        {alert.severity === 'warning' && (
                          <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
                        )}
                        {alert.severity === 'info' && (
                          <Badge className="bg-blue-100 text-blue-800">Info</Badge>
                        )}
                        {getStatusBadge(alert.status, 'alert')}
                        <Button variant="outline" size="sm">
                          Handle
                        </Button>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 mb-3">{alert.description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Affected Count</p>
                        <p className="font-medium">{alert.affectedCount}</p>
                      </div>
                      {alert.dueDate && (
                        <div>
                          <p className="text-gray-600">Due Date</p>
                          <p className="font-medium text-red-600">{alert.dueDate.toLocaleDateString()}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-gray-600">Created</p>
                        <p className="font-medium">{alert.createdAt.toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Incident Response Tab */}
        <TabsContent value="incident-response">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Incident Response Playbook</CardTitle>
                <CardDescription>
                  Step-by-step procedures for handling security incidents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                      <h4 className="font-medium">Detection & Assessment</h4>
                    </div>
                    <p className="text-sm text-gray-600 ml-8">
                      Identify and assess the severity of the security incident
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                      <h4 className="font-medium">Containment</h4>
                    </div>
                    <p className="text-sm text-gray-600 ml-8">
                      Isolate affected systems and prevent further damage
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-6 h-6 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-sm font-bold">3</div>
                      <h4 className="font-medium">Investigation</h4>
                    </div>
                    <p className="text-sm text-gray-600 ml-8">
                      Conduct thorough investigation and document findings
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">4</div>
                      <h4 className="font-medium">Recovery</h4>
                    </div>
                    <p className="text-sm text-gray-600 ml-8">
                      Restore systems and verify security controls
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold">5</div>
                      <h4 className="font-medium">Lessons Learned</h4>
                    </div>
                    <p className="text-sm text-gray-600 ml-8">
                      Review incident and implement preventive measures
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  Key contacts for incident response and compliance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium">Security Team</h4>
                      <Badge variant="outline">24/7</Badge>
                    </div>
                    <p className="text-sm text-gray-600">security@clinic.com</p>
                    <p className="text-sm text-gray-600">+65 6123 4567</p>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium">Compliance Officer</h4>
                      <Badge variant="outline">Business Hours</Badge>
                    </div>
                    <p className="text-sm text-gray-600">compliance@clinic.com</p>
                    <p className="text-sm text-gray-600">+65 6123 4568</p>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium">Legal Team</h4>
                      <Badge variant="outline">On Call</Badge>
                    </div>
                    <p className="text-sm text-gray-600">legal@clinic.com</p>
                    <p className="text-sm text-gray-600">+65 6123 4569</p>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium">IT Support</h4>
                      <Badge variant="outline">24/7</Badge>
                    </div>
                    <p className="text-sm text-gray-600">support@clinic.com</p>
                    <p className="text-sm text-gray-600">+65 6123 4570</p>
                  </div>
                </div>

                <Alert className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    In case of critical incidents, immediately contact the security team and document all actions taken.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}