/**
 * Health Data Privacy & Compliance Dashboard
 * Sub-Phase 9.5: PDPA-Compliant Health Data Protection
 * Comprehensive privacy management interface for health-related enquiries
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Shield,
  Lock,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Database,
  Eye,
  Key,
  FileCheck,
  TrendingUp,
  Settings,
  Download,
  Upload,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  AlertCircle,
  Info,
  Bell,
  RefreshCw,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Copy,
  Share
} from 'lucide-react';

import { usePrivacyCompliance } from '@/hooks/use-privacy-compliance';

interface HealthDataPrivacyDashboardProps {
  userId?: string;
  userRole?: 'admin' | 'staff' | 'user';
  clinicId?: string;
  enquiryId?: string;
}

export const HealthDataPrivacyDashboard: React.FC<HealthDataPrivacyDashboardProps> = ({
  userId,
  userRole = 'user',
  clinicId,
  enquiryId
}) => {
  const {
    complianceData,
    healthMetrics,
    incidents,
    consents,
    auditLogs,
    refreshData,
    isLoading,
    error
  } = usePrivacyCompliance();

  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [filterStatus, setFilterStatus] = useState('all');

  // Calculate compliance score
  const complianceScore = healthMetrics?.healthComplianceScore || 0;
  const getComplianceStatus = (score: number) => {
    if (score >= 90) return { status: 'Excellent', color: 'text-green-600', icon: CheckCircle };
    if (score >= 80) return { status: 'Good', color: 'text-blue-600', icon: CheckCircle };
    if (score >= 70) return { status: 'Fair', color: 'text-yellow-600', icon: AlertCircle };
    return { status: 'Poor', color: 'text-red-600', icon: XCircle };
  };

  const complianceStatus = getComplianceStatus(complianceScore);
  const ComplianceIcon = complianceStatus.icon;

  // Real-time monitoring stats
  const monitoringStats = [
    {
      title: 'Total Health Enquiries',
      value: healthMetrics?.totalHealthEnquiries || 0,
      change: '+12%',
      trend: 'up',
      icon: FileText,
      color: 'text-blue-600'
    },
    {
      title: 'Encrypted Health Data',
      value: healthMetrics?.encryptedHealthEnquiries || 0,
      change: `${healthMetrics?.encryptionRate || 0}%`,
      trend: 'up',
      icon: Lock,
      color: 'text-green-600'
    },
    {
      title: 'PHI Records Protected',
      value: healthMetrics?.phiEnquiries || 0,
      change: '+8%',
      trend: 'up',
      icon: Shield,
      color: 'text-purple-600'
    },
    {
      title: 'Active Consents',
      value: healthMetrics?.activeConsents || 0,
      change: '-2%',
      trend: 'down',
      icon: FileCheck,
      color: 'text-orange-600'
    },
    {
      title: 'Pending Requests',
      value: healthMetrics?.pendingHealthRequests || 0,
      change: '+5',
      trend: 'up',
      icon: Clock,
      color: 'text-yellow-600'
    },
    {
      title: 'Security Incidents',
      value: healthMetrics?.healthIncidents || 0,
      change: '0',
      trend: 'neutral',
      icon: AlertTriangle,
      color: 'text-red-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="h-8 w-8 text-blue-600" />
              Health Data Privacy & Compliance
            </h1>
            <p className="text-gray-600 mt-2">
              PDPA-compliant privacy management for health-related enquiries
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant={complianceScore >= 90 ? 'default' : 'destructive'} className="flex items-center gap-1">
              <ComplianceIcon className="h-4 w-4" />
              {complianceStatus.status}
            </Badge>
            
            <Button 
              onClick={refreshData} 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Alert for issues */}
        {(healthMetrics?.healthIncidents || 0) > 0 && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Security Alert</AlertTitle>
            <AlertDescription>
              {healthMetrics?.healthIncidents || 0} active security incident(s) require immediate attention.
            </AlertDescription>
          </Alert>
        )}

        {/* Compliance Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {monitoringStats.map((stat, index) => {
            const StatIcon = stat.icon;
            return (
              <Card key={index} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className={`text-sm ${stat.color} flex items-center gap-1`}>
                        {stat.trend === 'up' && <TrendingUp className="h-3 w-3" />}
                        {stat.trend === 'down' && <TrendingUp className="h-3 w-3 rotate-180" />}
                        {stat.change}
                      </p>
                    </div>
                    <StatIcon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-8 w-full">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="classification" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Classification
            </TabsTrigger>
            <TabsTrigger value="consents" className="flex items-center gap-2">
              <FileCheck className="h-4 w-4" />
              Consents
            </TabsTrigger>
            <TabsTrigger value="rights" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Data Rights
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="incidents" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Incidents
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Audit Log
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Reports
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Compliance Score */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    PDPA Compliance Score
                  </CardTitle>
                  <CardDescription>
                    Overall health data protection compliance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${complianceStatus.color}`}>
                      {complianceScore}%
                    </div>
                    <Progress value={complianceScore} className="mt-2" />
                    <p className="text-sm text-gray-600 mt-2">
                      Last assessment: {healthMetrics?.lastAssessment ? 
                        new Date(healthMetrics.lastAssessment).toLocaleDateString() : 
                        'Never'
                      }
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Data Encryption</p>
                      <p className="font-medium">{healthMetrics?.encryptionRate || 0}%</p>
                    </div>
                    <div>
                      <p className="text-gray-600">PHI Protection</p>
                      <p className="font-medium">{healthMetrics?.phiProtectionLevel || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Professional Confidentiality</p>
                      <p className="font-medium">{healthMetrics?.professionalConfidentiality || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Audit Events (30d)</p>
                      <p className="font-medium">{healthMetrics?.healthAuditEvents || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Privacy Activity
                  </CardTitle>
                  <CardDescription>
                    Latest privacy and security events
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { event: 'Health enquiry encrypted', time: '2 minutes ago', type: 'success' },
                      { event: 'Consent updated for patient', time: '15 minutes ago', type: 'info' },
                      { event: 'Data subject request submitted', time: '1 hour ago', type: 'warning' },
                      { event: 'Privacy audit completed', time: '2 hours ago', type: 'success' },
                      { event: 'New PHI classification applied', time: '3 hours ago', type: 'info' }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 rounded-lg border">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.type === 'success' ? 'bg-green-500' :
                          activity.type === 'warning' ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.event}</p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Health Data Protection Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Health Data Protection Overview
                </CardTitle>
                <CardDescription>
                  Key metrics and status of health data protection measures
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                      <Lock className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="font-semibold">Data Encryption</h3>
                    <p className="text-2xl font-bold text-green-600">
                      {healthMetrics?.encryptionRate || 0}%
                    </p>
                    <p className="text-sm text-gray-600">
                      of health enquiries encrypted
                    </p>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center">
                      <Shield className="h-8 w-8 text-purple-600" />
                    </div>
                    <h3 className="font-semibold">PHI Protection</h3>
                    <p className="text-2xl font-bold text-purple-600">
                      {healthMetrics?.phiEnquiries || 0}
                    </p>
                    <p className="text-sm text-gray-600">
                      PHI records protected
                    </p>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                      <Key className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold">Access Controls</h3>
                    <p className="text-2xl font-bold text-blue-600">
                      {userRole === 'admin' ? 'Full' : 'Role-based'}
                    </p>
                    <p className="text-sm text-gray-600">
                      current access level
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Health Data Classification Tab */}
          <TabsContent value="classification">
            <HealthDataClassificationPanel 
              userId={userId}
              clinicId={clinicId}
              enquiryId={enquiryId}
            />
          </TabsContent>

          {/* Consent Management Tab */}
          <TabsContent value="consents">
            <ConsentManagementPanel 
              userId={userId}
              userRole={userRole}
            />
          </TabsContent>

          {/* Data Subject Rights Tab */}
          <TabsContent value="rights">
            <DataSubjectRightsPanel 
              userId={userId}
              userRole={userRole}
            />
          </TabsContent>

          {/* Secure Documents Tab */}
          <TabsContent value="documents">
            <SecureDocumentPanel 
              userId={userId}
              userRole={userRole}
            />
          </TabsContent>

          {/* Privacy Incidents Tab */}
          <TabsContent value="incidents">
            <PrivacyIncidentPanel 
              userId={userId}
              userRole={userRole}
            />
          </TabsContent>

          {/* Audit Log Tab */}
          <TabsContent value="audit">
            <AuditLogViewer 
              userId={userId}
              userRole={userRole}
              showHealthData={true}
            />
          </TabsContent>

          {/* Compliance Reports Tab */}
          <TabsContent value="reports">
            <ComplianceReportPanel 
              userId={userId}
              userRole={userRole}
              includeHealthData={true}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HealthDataPrivacyDashboard;