/**
 * Consent Management Component
 * Sub-Phase 8.11: Government Compliance & Security Framework
 * Comprehensive consent management and tracking for PDPA compliance
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock,
  User,
  FileText,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Plus,
  UserCheck,
  Lock,
  Globe
} from 'lucide-react';

interface ConsentRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  consentType: 'data_processing' | 'health_data_sharing' | 'government_integration' | 'research_participation' | 'marketing_communications';
  status: 'granted' | 'withdrawn' | 'expired' | 'pending';
  grantedAt: Date;
  withdrawnAt?: Date;
  expiresAt?: Date;
  version: string; // Consent form version
  legalBasis: string; // PDPA legal basis
  purpose: string;
  dataCategories: string[];
  thirdParties: string[];
  retentionPeriod: string;
  ipAddress: string;
  userAgent: string;
  digitalSignature: boolean;
  witnessRequired: boolean;
  witnessId?: string;
  governmentSystem?: string;
  complianceFramework: string[];
}

interface ConsentTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  version: string;
  isActive: boolean;
  lastUpdated: Date;
  legalBasis: string;
  content: string;
  requiredFields: string[];
  complianceFrameworks: string[];
}

interface ConsentMetrics {
  totalUsers: number;
  activeConsents: number;
  withdrawnConsents: number;
  pendingConsents: number;
  expiredConsents: number;
  consentRate: number;
  avgConsentAge: number; // days
  upcomingExpirations: number;
  complianceScore: number;
}

export default function ConsentManagement() {
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [templates, setTemplates] = useState<ConsentTemplate[]>([]);
  const [metrics, setMetrics] = useState<ConsentMetrics>({
    totalUsers: 0,
    activeConsents: 0,
    withdrawnConsents: 0,
    pendingConsents: 0,
    expiredConsents: 0,
    consentRate: 0,
    avgConsentAge: 0,
    upcomingExpirations: 0,
    complianceScore: 0
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');
  const [filteredConsents, setFilteredConsents] = useState<ConsentRecord[]>([]);

  useEffect(() => {
    // Initialize consent data
    initializeConsentData();
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = [...consents];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(consent => 
        consent.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consent.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consent.purpose.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(consent => consent.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(consent => consent.consentType === typeFilter);
    }

    setFilteredConsents(filtered);
  }, [consents, searchTerm, statusFilter, typeFilter, dateRange]);

  const initializeConsentData = () => {
    // Sample consent records
    const sampleConsents: ConsentRecord[] = [
      {
        id: 'CONS-2024-001',
        userId: 'user-123',
        userName: 'Dr. Sarah Lim',
        userEmail: 'sarah.lim@email.com',
        consentType: 'health_data_sharing',
        status: 'granted',
        grantedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        version: '2.1',
        legalBasis: 'Consent for healthcare services',
        purpose: 'Share health data with government health systems for care coordination',
        dataCategories: ['Medical Records', 'Health Metrics', 'Treatment History'],
        thirdParties: ['MOH', 'HealthHub', 'NEHR'],
        retentionPeriod: '7 years',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        digitalSignature: true,
        witnessRequired: false,
        governmentSystem: 'healthhub',
        complianceFramework: ['PDPA', 'Healthcare Services Act', 'MOH Guidelines']
      },
      {
        id: 'CONS-2024-002',
        userId: 'user-456',
        userName: 'Nurse Wong Mei Lin',
        userEmail: 'mei.lin.wong@clinic.sg',
        consentType: 'government_integration',
        status: 'granted',
        grantedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        version: '2.1',
        legalBasis: 'Legal obligation for healthcare providers',
        purpose: 'Integrate with government systems for regulatory compliance',
        dataCategories: ['Professional Information', 'Practice Details'],
        thirdParties: ['MOH', 'SMC', 'CPF Board'],
        retentionPeriod: '10 years',
        ipAddress: '10.0.1.25',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        digitalSignature: true,
        witnessRequired: true,
        witnessId: 'admin-789',
        governmentSystem: 'singpass',
        complianceFramework: ['PDPA', 'Medical Registration Act', 'Cybersecurity Act']
      },
      {
        id: 'CONS-2024-003',
        userId: 'user-789',
        userName: 'John Tan',
        userEmail: 'john.tan@email.com',
        consentType: 'data_processing',
        status: 'withdrawn',
        grantedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        withdrawnAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        version: '2.0',
        legalBasis: 'Consent for service provision',
        purpose: 'Process personal data for healthcare service delivery',
        dataCategories: ['Personal Information', 'Contact Details', 'Health Information'],
        thirdParties: ['Healthcare Providers', 'Insurance Companies'],
        retentionPeriod: '5 years',
        ipAddress: '203.45.67.89',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
        digitalSignature: false,
        witnessRequired: false,
        complianceFramework: ['PDPA']
      },
      {
        id: 'CONS-2024-004',
        userId: 'user-101',
        userName: 'Dr. Kumar Raju',
        userEmail: 'kumar.raju@hospital.sg',
        consentType: 'research_participation',
        status: 'granted',
        grantedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() + 320 * 24 * 60 * 60 * 1000),
        version: '2.1',
        legalBasis: 'Consent for medical research',
        purpose: 'Participate in health outcomes research and analytics',
        dataCategories: ['De-identified Health Data', 'Treatment Outcomes', 'Quality Metrics'],
        thirdParties: ['MOH', 'Research Institutions'],
        retentionPeriod: '15 years',
        ipAddress: '10.0.0.50',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        digitalSignature: true,
        witnessRequired: true,
        witnessId: 'ethics-committee-123',
        governmentSystem: 'health_research_portal',
        complianceFramework: ['PDPA', 'Human Tissue Act', 'Research Ethics Guidelines']
      },
      {
        id: 'CONS-2024-005',
        userId: 'user-202',
        userName: 'Lisa Chen',
        userEmail: 'lisa.chen@email.com',
        consentType: 'marketing_communications',
        status: 'pending',
        grantedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        version: '2.1',
        legalBasis: 'Consent for marketing',
        purpose: 'Receive health tips, program updates, and wellness information',
        dataCategories: ['Contact Information', 'Health Interests'],
        thirdParties: ['Healthcare Partners'],
        retentionPeriod: '3 years',
        ipAddress: '192.168.10.100',
        userAgent: 'Mozilla/5.0 (Android 12; Mobile; rv:68.0) Gecko/68.0 Firefox/88.0',
        digitalSignature: false,
        witnessRequired: false,
        complianceFramework: ['PDPA', 'Spam Control Act']
      }
    ];

    // Sample consent templates
    const sampleTemplates: ConsentTemplate[] = [
      {
        id: 'TEMPLATE-001',
        name: 'Health Data Sharing Consent',
        type: 'health_data_sharing',
        description: 'Consent for sharing health data with government systems',
        version: '2.1',
        isActive: true,
        lastUpdated: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        legalBasis: 'PDPA Section 12 - Consent',
        content: 'I hereby consent to the sharing of my health data with authorized government systems...',
        requiredFields: ['fullName', 'nric', 'signature', 'date'],
        complianceFrameworks: ['PDPA', 'Healthcare Services Act', 'MOH Guidelines']
      },
      {
        id: 'TEMPLATE-002',
        name: 'Government Integration Consent',
        type: 'government_integration',
        description: 'Consent for integration with Singapore government systems',
        version: '2.1',
        isActive: true,
        lastUpdated: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        legalBasis: 'PDPA Section 12 - Consent',
        content: 'I consent to the integration of my personal data with Singapore government systems...',
        requiredFields: ['fullName', 'nric', 'singpassId', 'signature', 'date'],
        complianceFrameworks: ['PDPA', 'Cybersecurity Act', 'Government Data Policy']
      },
      {
        id: 'TEMPLATE-003',
        name: 'Research Participation Consent',
        type: 'research_participation',
        description: 'Consent for participation in health research programs',
        version: '2.1',
        isActive: true,
        lastUpdated: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        legalBasis: 'PDPA Section 12 - Consent',
        content: 'I voluntarily consent to participate in health research and allow the use of my data...',
        requiredFields: ['fullName', 'nric', 'signature', 'witnessSignature', 'date'],
        complianceFrameworks: ['PDPA', 'Human Tissue Act', 'Research Ethics Guidelines']
      }
    ];

    setConsents(sampleConsents);
    setTemplates(sampleTemplates);

    // Calculate metrics
    const totalUsers = sampleConsents.length;
    const activeConsents = sampleConsents.filter(c => c.status === 'granted').length;
    const withdrawnConsents = sampleConsents.filter(c => c.status === 'withdrawn').length;
    const pendingConsents = sampleConsents.filter(c => c.status === 'pending').length;
    const expiredConsents = sampleConsents.filter(c => c.status === 'expired').length;
    const consentRate = Math.round((activeConsents / totalUsers) * 100);
    const avgConsentAge = 35; // days
    const upcomingExpirations = sampleConsents.filter(c => 
      c.expiresAt && new Date(c.expiresAt).getTime() - new Date().getTime() < 30 * 24 * 60 * 60 * 1000
    ).length;
    const complianceScore = 96; // percentage

    setMetrics({
      totalUsers,
      activeConsents,
      withdrawnConsents,
      pendingConsents,
      expiredConsents,
      consentRate,
      avgConsentAge,
      upcomingExpirations,
      complianceScore
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'granted': return 'text-green-600 bg-green-100';
      case 'withdrawn': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'expired': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'granted': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'withdrawn': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'expired': return <Clock className="h-4 w-4 text-gray-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'health_data_sharing': return 'Health Data Sharing';
      case 'government_integration': return 'Government Integration';
      case 'data_processing': return 'Data Processing';
      case 'research_participation': return 'Research Participation';
      case 'marketing_communications': return 'Marketing Communications';
      default: return type;
    }
  };

  const exportConsents = () => {
    const exportData = {
      generatedAt: new Date().toISOString(),
      metrics: metrics,
      consents: filteredConsents.map(consent => ({
        ...consent,
        grantedAt: consent.grantedAt.toISOString(),
        withdrawnAt: consent.withdrawnAt?.toISOString(),
        expiresAt: consent.expiresAt?.toISOString()
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consent-records-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const withdrawConsent = (consentId: string) => {
    setConsents(prev => prev.map(consent => 
      consent.id === consentId 
        ? { ...consent, status: 'withdrawn' as const, withdrawnAt: new Date() }
        : consent
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Consent Management</h1>
              <p className="text-gray-600 mt-2">
                Comprehensive consent tracking and management for PDPA compliance
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={exportConsents}>
                <Download className="w-4 h-4 mr-2" />
                Export Records
              </Button>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Consent Template
              </Button>
            </div>
          </div>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.activeConsents} active consents
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Consent Rate</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{metrics.consentRate}%</div>
              <p className="text-xs text-muted-foreground">
                Average across all consent types
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{metrics.pendingConsents}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting user action
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{metrics.complianceScore}%</div>
              <p className="text-xs text-muted-foreground">
                PDPA compliance rating
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="records" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="records">Consent Records</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Consent Records Tab */}
          <TabsContent value="records">
            {/* Filters */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Filter Consents</CardTitle>
                <CardDescription>
                  Search and filter consent records
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="lg:col-span-2">
                    <Label htmlFor="search">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="search"
                        placeholder="Search by name, email, or purpose..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="granted">Granted</SelectItem>
                        <SelectItem value="withdrawn">Withdrawn</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="health_data_sharing">Health Data Sharing</SelectItem>
                        <SelectItem value="government_integration">Government Integration</SelectItem>
                        <SelectItem value="data_processing">Data Processing</SelectItem>
                        <SelectItem value="research_participation">Research Participation</SelectItem>
                        <SelectItem value="marketing_communications">Marketing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Consent Records */}
            <Card>
              <CardHeader>
                <CardTitle>Consent Records</CardTitle>
                <CardDescription>
                  Showing {filteredConsents.length} of {consents.length} consent records
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredConsents.map((consent) => (
                    <div key={consent.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(consent.status)}
                          <div>
                            <h3 className="font-semibold">{consent.userName}</h3>
                            <p className="text-sm text-gray-600">{consent.userEmail}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(consent.status)}>
                            {consent.status.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">{consent.version}</Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Consent Type</p>
                          <p className="text-sm">{getTypeLabel(consent.consentType)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Granted</p>
                          <p className="text-sm">{consent.grantedAt.toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Expires</p>
                          <p className="text-sm">
                            {consent.expiresAt ? consent.expiresAt.toLocaleDateString() : 'Never'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Digital Signature</p>
                          <p className="text-sm">
                            {consent.digitalSignature ? 'Yes' : 'No'}
                            {consent.witnessRequired && ' (Witnessed)'}
                          </p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700">Purpose</p>
                        <p className="text-sm text-gray-600">{consent.purpose}</p>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Data Categories</p>
                        <div className="flex flex-wrap gap-1">
                          {consent.dataCategories.map((category) => (
                            <Badge key={category} variant="outline" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {consent.governmentSystem && (
                            <Badge variant="secondary" className="text-xs">
                              <Globe className="h-3 w-3 mr-1" />
                              {consent.governmentSystem}
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {consent.complianceFramework.length} frameworks
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {consent.status === 'granted' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => withdrawConsent(consent.id)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Withdraw
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {templates.map((template) => (
                <Card key={template.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{template.name}</CardTitle>
                        <CardDescription>{template.description}</CardDescription>
                      </div>
                      <Badge variant={template.isActive ? 'default' : 'secondary'}>
                        {template.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-700">Version</p>
                        <p>{template.version}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Legal Basis</p>
                        <p>{template.legalBasis}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Compliance Frameworks</p>
                      <div className="flex flex-wrap gap-1">
                        {template.complianceFrameworks.map((framework) => (
                          <Badge key={framework} variant="outline" className="text-xs">
                            {framework}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Required Fields</p>
                      <div className="flex flex-wrap gap-1">
                        {template.requiredFields.map((field) => (
                          <Badge key={field} variant="secondary" className="text-xs">
                            {field}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-gray-500">
                        Updated: {template.lastUpdated.toLocaleDateString()}
                      </span>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Consent Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Granted</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 h-2 bg-gray-200 rounded">
                          <div 
                            className="h-2 bg-green-500 rounded"
                            style={{ width: `${(metrics.activeConsents / metrics.totalUsers) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{metrics.activeConsents}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Withdrawn</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 h-2 bg-gray-200 rounded">
                          <div 
                            className="h-2 bg-red-500 rounded"
                            style={{ width: `${(metrics.withdrawnConsents / metrics.totalUsers) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{metrics.withdrawnConsents}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Pending</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 h-2 bg-gray-200 rounded">
                          <div 
                            className="h-2 bg-yellow-500 rounded"
                            style={{ width: `${(metrics.pendingConsents / metrics.totalUsers) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{metrics.pendingConsents}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Expired</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 h-2 bg-gray-200 rounded">
                          <div 
                            className="h-2 bg-gray-500 rounded"
                            style={{ width: `${(metrics.expiredConsents / metrics.totalUsers) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{metrics.expiredConsents}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Compliance Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Overall Compliance Score</span>
                      <span className="text-lg font-bold text-green-600">{metrics.complianceScore}%</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Average Consent Age</span>
                        <span className="text-sm font-medium">{metrics.avgConsentAge} days</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Upcoming Expirations</span>
                        <span className="text-sm font-medium text-orange-600">{metrics.upcomingExpirations}</span>
                      </div>
                    </div>

                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        {metrics.upcomingExpirations} consents expire within 30 days and require renewal.
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}