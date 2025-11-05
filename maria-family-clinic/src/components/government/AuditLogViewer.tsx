/**
 * Audit Log Viewer Component
 * Sub-Phase 8.11: Government Compliance & Security Framework
 * Comprehensive audit logging and activity tracking for regulatory compliance
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Eye,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Key,
  Database,
  Lock,
  Activity,
  Calendar,
  RefreshCw
} from 'lucide-react';

interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId?: string;
  userRole?: string;
  action: string;
  resource: string;
  resourceId?: string;
  outcome: 'SUCCESS' | 'FAILURE' | 'PARTIAL';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  ipAddress: string;
  userAgent: string;
  sessionId?: string;
  details: Record<string, any>;
  complianceRelated: boolean;
  dataSensitivity: 'PUBLIC' | 'INTERNAL' | 'SENSITIVE' | 'HIGHLY_SENSITIVE' | 'MEDICAL' | 'CONFIDENTIAL';
  governmentSystem?: string;
  regulationCompliance: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  auditCategory: 'SECURITY' | 'PRIVACY' | 'DATA_ACCESS' | 'COMPLIANCE' | 'SYSTEM' | 'GOVERNMENT_INTEGRATION';
}

interface AuditMetrics {
  totalLogs: number;
  criticalEvents: number;
  complianceViolations: number;
  securityIncidents: number;
  governmentAccessEvents: number;
  dataAccessEvents: number;
  failedLogins: number;
  unusualActivities: number;
  periodStart: Date;
  periodEnd: Date;
}

export default function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLogEntry[]>([]);
  const [metrics, setMetrics] = useState<AuditMetrics>({
    totalLogs: 0,
    criticalEvents: 0,
    complianceViolations: 0,
    securityIncidents: 0,
    governmentAccessEvents: 0,
    dataAccessEvents: 0,
    failedLogins: 0,
    unusualActivities: 0,
    periodStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    periodEnd: new Date()
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [outcomeFilter, setOutcomeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('7days');
  const [complianceFilter, setComplianceFilter] = useState<string>('all');

  useEffect(() => {
    // Generate sample audit logs
    const generateSampleLogs = (): AuditLogEntry[] => {
      const sampleLogs: AuditLogEntry[] = [
        {
          id: 'AUD-2024-001',
          timestamp: new Date(Date.now() - 2 * 60 * 1000),
          userId: 'user-123',
          userRole: 'PATIENT',
          action: 'LOGIN',
          resource: 'authentication',
          outcome: 'SUCCESS',
          severity: 'LOW',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          sessionId: 'sess-456',
          details: { method: 'singpass', device: 'desktop' },
          complianceRelated: true,
          dataSensitivity: 'PUBLIC',
          governmentSystem: 'singpass',
          regulationCompliance: ['PDPA', 'Cybersecurity Act'],
          riskLevel: 'LOW',
          auditCategory: 'SECURITY'
        },
        {
          id: 'AUD-2024-002',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          userId: 'admin-789',
          userRole: 'ADMIN',
          action: 'VIEW_PATIENT_RECORD',
          resource: 'patient_data',
          resourceId: 'patient-456',
          outcome: 'SUCCESS',
          severity: 'HIGH',
          ipAddress: '10.0.0.50',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          details: { 
            patientId: 'patient-456', 
            dataAccessed: ['basic_info', 'health_metrics'],
            justification: 'Routine checkup review'
          },
          complianceRelated: true,
          dataSensitivity: 'MEDICAL',
          governmentSystem: 'nehr',
          regulationCompliance: ['PDPA', 'Healthcare Services Act', 'MOH Guidelines'],
          riskLevel: 'MEDIUM',
          auditCategory: 'GOVERNMENT_INTEGRATION'
        },
        {
          id: 'AUD-2024-003',
          timestamp: new Date(Date.now() - 45 * 60 * 1000),
          userId: 'doctor-101',
          userRole: 'DOCTOR',
          action: 'UPDATE_MEDICAL_RECORD',
          resource: 'health_record',
          resourceId: 'record-789',
          outcome: 'SUCCESS',
          severity: 'MEDIUM',
          ipAddress: '10.0.1.25',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          details: { 
            fields: ['diagnosis', 'prescription', 'notes'],
            encryption: 'AES-256-GCM'
          },
          complianceRelated: true,
          dataSensitivity: 'HIGHLY_SENSITIVE',
          regulationCompliance: ['PDPA', 'Medical Records Act', 'MOH Guidelines'],
          riskLevel: 'MEDIUM',
          auditCategory: 'PRIVACY'
        },
        {
          id: 'AUD-2024-004',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
          userId: 'user-999',
          userRole: 'PATIENT',
          action: 'FAILED_LOGIN_ATTEMPT',
          resource: 'authentication',
          outcome: 'FAILURE',
          severity: 'HIGH',
          ipAddress: '203.45.67.89',
          userAgent: 'curl/7.68.0',
          details: { 
            reason: 'invalid_credentials',
            attempts: 3,
            blocked: false
          },
          complianceRelated: true,
          dataSensitivity: 'PUBLIC',
          regulationCompliance: ['Cybersecurity Act'],
          riskLevel: 'HIGH',
          auditCategory: 'SECURITY'
        },
        {
          id: 'AUD-2024-005',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          userId: 'system',
          userRole: 'SYSTEM',
          action: 'DATA_EXPORT',
          resource: 'health_data',
          outcome: 'SUCCESS',
          severity: 'CRITICAL',
          ipAddress: '10.0.0.1',
          userAgent: 'Internal-System',
          details: { 
            exportType: 'compliance_report',
            recordsExported: 1250,
            format: 'encrypted_csv',
            authorizedBy: 'compliance-officer-123'
          },
          complianceRelated: true,
          dataSensitivity: 'SENSITIVE',
          regulationCompliance: ['PDPA', 'Government Reporting Requirements'],
          riskLevel: 'CRITICAL',
          auditCategory: 'COMPLIANCE'
        },
        {
          id: 'AUD-2024-006',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
          userId: 'clinic-admin-555',
          userRole: 'CLINIC_ADMIN',
          action: 'BENEFIT_PROCESSING',
          resource: 'healthier_sg_benefits',
          resourceId: 'benefit-claim-123',
          outcome: 'SUCCESS',
          severity: 'MEDIUM',
          ipAddress: '192.168.10.50',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          details: { 
            benefitType: 'health_screening',
            amount: 150.00,
            governmentSystem: 'chas'
          },
          complianceRelated: true,
          dataSensitivity: 'CONFIDENTIAL',
          governmentSystem: 'chas',
          regulationCompliance: ['CHAS Act', 'PDPA', 'Government Benefits Act'],
          riskLevel: 'MEDIUM',
          auditCategory: 'GOVERNMENT_INTEGRATION'
        },
        {
          id: 'AUD-2024-007',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          userId: 'user-888',
          userRole: 'PATIENT',
          action: 'CONSENT_WITHDRAWN',
          resource: 'data_consent',
          outcome: 'SUCCESS',
          severity: 'HIGH',
          ipAddress: '203.45.67.100',
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
          details: { 
            consentTypes: ['health_data_sharing', 'government_integration'],
            effectiveDate: new Date(),
            reason: 'privacy_concerns'
          },
          complianceRelated: true,
          dataSensitivity: 'CONFIDENTIAL',
          regulationCompliance: ['PDPA', 'Data Protection Regulations'],
          riskLevel: 'HIGH',
          auditCategory: 'PRIVACY'
        },
        {
          id: 'AUD-2024-008',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
          userId: 'system',
          userRole: 'SYSTEM',
          action: 'SECURITY_SCAN',
          resource: 'system_security',
          outcome: 'SUCCESS',
          severity: 'MEDIUM',
          ipAddress: '10.0.0.1',
          userAgent: 'Security-Scanner/2.1',
          details: { 
            scanType: 'vulnerability_assessment',
            threatsFound: 0,
            complianceChecked: true
          },
          complianceRelated: true,
          dataSensitivity: 'INTERNAL',
          regulationCompliance: ['Cybersecurity Act', 'ISO 27001'],
          riskLevel: 'LOW',
          auditCategory: 'SECURITY'
        }
      ];

      return sampleLogs;
    };

    const generatedLogs = generateSampleLogs();
    setLogs(generatedLogs);
    setFilteredLogs(generatedLogs);
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = [...logs];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.userRole && log.userRole.toLowerCase().includes(searchTerm.toLowerCase())) ||
        log.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Severity filter
    if (severityFilter !== 'all') {
      filtered = filtered.filter(log => log.severity === severityFilter);
    }

    // Outcome filter
    if (outcomeFilter !== 'all') {
      filtered = filtered.filter(log => log.outcome === outcomeFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(log => log.auditCategory === categoryFilter);
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      const rangeStart = new Date();
      
      switch (dateRange) {
        case '1hour':
          rangeStart.setHours(now.getHours() - 1);
          break;
        case '24hours':
          rangeStart.setDate(now.getDate() - 1);
          break;
        case '7days':
          rangeStart.setDate(now.getDate() - 7);
          break;
        case '30days':
          rangeStart.setDate(now.getDate() - 30);
          break;
      }
      
      filtered = filtered.filter(log => log.timestamp >= rangeStart);
    }

    setFilteredLogs(filtered);

    // Calculate metrics
    const totalLogs = filtered.length;
    const criticalEvents = filtered.filter(log => log.severity === 'CRITICAL').length;
    const complianceViolations = filtered.filter(log => 
      log.outcome === 'FAILURE' || log.complianceRelated
    ).length;
    const securityIncidents = filtered.filter(log => 
      log.auditCategory === 'SECURITY' && log.severity !== 'LOW'
    ).length;
    const governmentAccessEvents = filtered.filter(log => 
      log.governmentSystem !== undefined
    ).length;
    const dataAccessEvents = filtered.filter(log => 
      log.auditCategory === 'DATA_ACCESS' || log.action.includes('DATA')
    ).length;
    const failedLogins = filtered.filter(log => 
      log.action === 'FAILED_LOGIN_ATTEMPT'
    ).length;
    const unusualActivities = filtered.filter(log => 
      log.riskLevel === 'HIGH' || log.riskLevel === 'CRITICAL'
    ).length;

    setMetrics({
      totalLogs,
      criticalEvents,
      complianceViolations,
      securityIncidents,
      governmentAccessEvents,
      dataAccessEvents,
      failedLogins,
      unusualActivities,
      periodStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      periodEnd: new Date()
    });
  }, [logs, searchTerm, severityFilter, outcomeFilter, categoryFilter, dateRange, complianceFilter]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'text-red-800 bg-red-100';
      case 'HIGH': return 'text-red-600 bg-red-50';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50';
      case 'LOW': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'SUCCESS': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'FAILURE': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'PARTIAL': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const exportLogs = () => {
    // Create CSV content
    const headers = ['Timestamp', 'User', 'Action', 'Resource', 'Outcome', 'Severity', 'IP Address', 'Compliance'];
    const csvContent = [
      headers.join(','),
      ...filteredLogs.map(log => [
        log.timestamp.toISOString(),
        log.userId || 'system',
        log.action,
        log.resource,
        log.outcome,
        log.severity,
        log.ipAddress,
        log.regulationCompliance.join(';')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Audit Log Viewer</h1>
              <p className="text-gray-600 mt-2">
                Comprehensive audit trail and compliance monitoring
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={exportLogs}>
                <Download className="w-4 h-4 mr-2" />
                Export Logs
              </Button>
              <Button variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalLogs}</div>
              <p className="text-xs text-muted-foreground">
                Last 7 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Events</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{metrics.criticalEvents}</div>
              <p className="text-xs text-muted-foreground">
                Requires immediate attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gov Access</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{metrics.governmentAccessEvents}</div>
              <p className="text-xs text-muted-foreground">
                Government system access
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
              <Lock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{metrics.failedLogins}</div>
              <p className="text-xs text-muted-foreground">
                Security incidents
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filter Logs</CardTitle>
            <CardDescription>
              Filter and search audit logs for specific events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="lg:col-span-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search logs..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="severity">Severity</Label>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All severities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="outcome">Outcome</Label>
                <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All outcomes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Outcomes</SelectItem>
                    <SelectItem value="SUCCESS">Success</SelectItem>
                    <SelectItem value="FAILURE">Failure</SelectItem>
                    <SelectItem value="PARTIAL">Partial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="SECURITY">Security</SelectItem>
                    <SelectItem value="PRIVACY">Privacy</SelectItem>
                    <SelectItem value="DATA_ACCESS">Data Access</SelectItem>
                    <SelectItem value="COMPLIANCE">Compliance</SelectItem>
                    <SelectItem value="GOVERNMENT_INTEGRATION">Government</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="dateRange">Time Range</Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1hour">Last Hour</SelectItem>
                    <SelectItem value="24hours">Last 24 Hours</SelectItem>
                    <SelectItem value="7days">Last 7 Days</SelectItem>
                    <SelectItem value="30days">Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audit Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Audit Log Entries</CardTitle>
            <CardDescription>
              Showing {filteredLogs.length} of {logs.length} log entries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      {getOutcomeIcon(log.outcome)}
                      <div>
                        <p className="font-medium">{log.action}</p>
                        <p className="text-sm text-gray-600">{log.resource}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getSeverityColor(log.severity)}>
                        {log.severity}
                      </Badge>
                      <Badge variant="outline">{log.auditCategory}</Badge>
                      <span className="text-sm text-gray-500">
                        {log.timestamp.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-700">User Information</p>
                      <p>ID: {log.userId || 'System'}</p>
                      <p>Role: {log.userRole || 'N/A'}</p>
                      <p>IP: {log.ipAddress}</p>
                    </div>
                    
                    <div>
                      <p className="font-medium text-gray-700">Compliance</p>
                      {log.governmentSystem && (
                        <p>Gov System: {log.governmentSystem}</p>
                      )}
                      <p>Regulations: {log.regulationCompliance.join(', ')}</p>
                      <p>Sensitivity: {log.dataSensitivity}</p>
                    </div>
                    
                    <div>
                      <p className="font-medium text-gray-700">Details</p>
                      <p>Risk: {log.riskLevel}</p>
                      {log.sessionId && <p>Session: {log.sessionId}</p>}
                      {log.complianceRelated && (
                        <p className="text-blue-600">Compliance Related</p>
                      )}
                    </div>
                  </div>
                  
                  {log.details && Object.keys(log.details).length > 0 && (
                    <div className="mt-3 p-2 bg-gray-50 rounded">
                      <p className="text-sm font-medium text-gray-700 mb-1">Additional Details</p>
                      <pre className="text-xs text-gray-600 overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {filteredLogs.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No audit logs found matching your criteria</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}