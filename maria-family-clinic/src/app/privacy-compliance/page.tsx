/**
 * Privacy & Compliance Management Page
 * Central hub for all privacy, compliance, and security management
 * Sub-Phase 7.9: Privacy, Compliance & Security for Medical Professionals
 */

'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  UserCheck, 
  Lock, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Bell,
  Settings,
  Activity,
  Database
} from 'lucide-react';
import {
  PrivacyComplianceDashboard,
  DoctorConsentManagement,
  SecurityControlsAccessManagement,
  AuditLoggingIncidentResponse,
  HealthDataPrivacyDashboard,
  ConsentManagementPanel,
  HealthDataClassificationPanel,
  DataSubjectRightsPanel
} from '@/components/privacy';

export default function PrivacyCompliancePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                <Shield className="h-8 w-8 text-blue-600" />
                <span>Privacy, Compliance & Security</span>
              </h1>
              <p className="text-gray-600 mt-2">
                Comprehensive privacy protection and regulatory compliance for medical professionals
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                System Operational
              </Badge>
            </div>
          </div>
        </div>

        {/* Quick Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Compliance</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">92%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">↑ 2% from last month</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Consents</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">142/156</div>
              <p className="text-xs text-muted-foreground">
                91% doctor consent rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security Score</CardTitle>
              <Lock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">A+</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-blue-600">Excellent security posture</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">2</div>
              <p className="text-xs text-muted-foreground">
                Under investigation
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Regulatory Compliance Notice */}
        <Alert className="mb-8 border-blue-200 bg-blue-50">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Compliance Status:</strong> All systems are compliant with Singapore Personal Data Protection Act (PDPA), 
            Singapore Medical Council (SMC) guidelines, and international healthcare data security standards. 
            Next quarterly audit scheduled for January 15, 2025.
          </AlertDescription>
        </Alert>

        {/* Main Privacy & Compliance Management */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="consent" className="flex items-center space-x-2">
              <UserCheck className="h-4 w-4" />
              <span>Doctor Consent</span>
            </TabsTrigger>
            <TabsTrigger value="health-consent" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Health Data</span>
            </TabsTrigger>
            <TabsTrigger value="classification" className="flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <span>Data Classification</span>
            </TabsTrigger>
            <TabsTrigger value="subject-rights" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Data Rights</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <Lock className="h-4 w-4" />
              <span>Security</span>
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Audit</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Reports</span>
            </TabsTrigger>
          </TabsList>

          {/* Privacy Compliance Dashboard */}
          <TabsContent value="dashboard">
            <HealthDataPrivacyDashboard 
              userId={undefined}
              userRole="admin"
              clinicId={undefined}
            />
          </TabsContent>

          {/* Doctor Consent Management */}
          <TabsContent value="consent">
            <DoctorConsentManagement />
          </TabsContent>

          {/* Health Data Consent Management */}
          <TabsContent value="health-consent">
            <ConsentManagementPanel 
              userId={undefined}
              showEnquiryLevel={true}
              showPurposeSpecific={true}
            />
          </TabsContent>

          {/* Data Classification */}
          <TabsContent value="classification">
            <HealthDataClassificationPanel 
              showStatistics={true}
              showRecommendations={true}
            />
          </TabsContent>

          {/* Data Subject Rights */}
          <TabsContent value="subject-rights">
            <DataSubjectRightsPanel 
              showAdminView={true}
              userId={undefined}
            />
          </TabsContent>

          {/* Security Controls */}
          <TabsContent value="security">
            <SecurityControlsAccessManagement />
          </TabsContent>

          {/* Audit & Incident Response */}
          <TabsContent value="audit">
            <AuditLoggingIncidentResponse />
          </TabsContent>

          {/* Reports and Analytics */}
          <TabsContent value="reports">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Privacy & Compliance Reports</h2>
                  <p className="text-gray-600 mt-1">
                    Generate comprehensive reports for regulatory compliance and internal review
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Compliance Reports</CardTitle>
                    <CardDescription>
                      Generate regulatory compliance reports for audit and review
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <button className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <Shield className="h-5 w-5 text-blue-600" />
                        <div>
                          <h4 className="font-medium">PDPA Compliance Report</h4>
                          <p className="text-sm text-gray-600">Personal Data Protection Act compliance status</p>
                        </div>
                      </div>
                    </button>

                    <button className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <UserCheck className="h-5 w-5 text-green-600" />
                        <div>
                          <h4 className="font-medium">SMC Guidelines Report</h4>
                          <p className="text-sm text-gray-600">Singapore Medical Council compliance status</p>
                        </div>
                      </div>
                    </button>

                    <button className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <Lock className="h-5 w-5 text-purple-600" />
                        <div>
                          <h4 className="font-medium">Security Audit Report</h4>
                          <p className="text-sm text-gray-600">Comprehensive security assessment and findings</p>
                        </div>
                      </div>
                    </button>

                    <button className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-orange-600" />
                        <div>
                          <h4 className="font-medium">Privacy Impact Assessment</h4>
                          <p className="text-sm text-gray-600">Data protection and privacy risk assessment</p>
                        </div>
                      </div>
                    </button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Data Export & Analytics</CardTitle>
                    <CardDescription>
                      Export data and access detailed analytics for compliance monitoring
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <button className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <h4 className="font-medium">Doctor Profiles Export</h4>
                          <p className="text-sm text-gray-600">Export anonymized doctor profile data</p>
                        </div>
                      </div>
                    </button>

                    <button className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <UserCheck className="h-5 w-5 text-green-600" />
                        <div>
                          <h4 className="font-medium">Consent Records Export</h4>
                          <p className="text-sm text-gray-600">Export consent and privacy preference data</p>
                        </div>
                      </div>
                    </button>

                    <button className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <Activity className="h-5 w-5 text-red-600" />
                        <div>
                          <h4 className="font-medium">Audit Logs Export</h4>
                          <p className="text-sm text-gray-600">Export comprehensive audit trail logs</p>
                        </div>
                      </div>
                    </button>

                    <button className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                        <div>
                          <h4 className="font-medium">Analytics Dashboard</h4>
                          <p className="text-sm text-gray-600">Interactive analytics and trend analysis</p>
                        </div>
                      </div>
                    </button>
                  </CardContent>
                </Card>
              </div>

              {/* Compliance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Metrics Summary</CardTitle>
                  <CardDescription>
                    Key performance indicators for privacy and compliance management
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-3xl font-bold text-green-600 mb-2">99.8%</div>
                      <p className="text-sm font-medium">Data Accuracy</p>
                      <p className="text-xs text-gray-600">Audit data integrity score</p>
                    </div>

                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
                      <p className="text-sm font-medium">Monitoring Coverage</p>
                      <p className="text-xs text-gray-600">Continuous security monitoring</p>
                    </div>

                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-3xl font-bold text-purple-600 mb-2">0</div>
                      <p className="text-sm font-medium">Data Breaches</p>
                      <p className="text-xs text-gray-600">Confirmed security incidents</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Compliance Activities */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Compliance Activities</CardTitle>
                  <CardDescription>
                    Latest privacy and compliance activities and updates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 p-3 border rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Monthly PDPA Compliance Review Completed</p>
                        <p className="text-xs text-gray-600">All privacy controls verified and up to date</p>
                      </div>
                      <span className="text-xs text-gray-500">2 hours ago</span>
                    </div>

                    <div className="flex items-center space-x-4 p-3 border rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Security Policies Updated</p>
                        <p className="text-xs text-gray-600">Enhanced access control policies implemented</p>
                      </div>
                      <span className="text-xs text-gray-500">1 day ago</span>
                    </div>

                    <div className="flex items-center space-x-4 p-3 border rounded-lg">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Consent Renewal Campaign Launched</p>
                        <p className="text-xs text-gray-600">12 doctors notified about expiring consents</p>
                      </div>
                      <span className="text-xs text-gray-500">2 days ago</span>
                    </div>

                    <div className="flex items-center space-x-4 p-3 border rounded-lg">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Security Incident Resolved</p>
                        <p className="text-xs text-gray-600">Unauthorized access attempt successfully blocked</p>
                      </div>
                      <span className="text-xs text-gray-500">3 days ago</span>
                    </div>
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