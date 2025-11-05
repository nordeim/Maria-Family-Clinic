/**
 * Monitoring Dashboard Component
 * Sub-Phase 10.6: Monitoring & Alerting Systems
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Shield, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Settings,
  Download,
  Eye,
  Users,
  Clock,
  Zap,
  Database,
  Globe,
  Bell,
  AlertCircle,
  Heart,
  Stethoscope,
  Building2,
  BarChart3,
  LineChart,
} from 'lucide-react';

import { useDashboardData, useAlerts } from '@/hooks/use-monitoring';
import { useRealtimeAlerts } from '@/hooks/use-alerts';

// Dashboard Tab Component
function DashboardTab({ 
  title, 
  icon: Icon, 
  children, 
  alertCount = 0, 
  criticalCount = 0 
}: { 
  title: string; 
  icon: React.ReactNode; 
  children: React.ReactNode;
  alertCount?: number;
  criticalCount?: number;
}) {
  return (
    <TabsTrigger value={title.toLowerCase()} className="flex items-center gap-2">
      {Icon}
      <span>{title}</span>
      {alertCount > 0 && (
        <Badge variant={criticalCount > 0 ? "destructive" : "secondary"} className="ml-1">
          {alertCount}
        </Badge>
      )}
    </TabsTrigger>
  );
}

// Executive Dashboard Component
function ExecutiveDashboard() {
  const { dashboardData, isLoading, error, isRealTime, setIsRealTime, refetch } = useExecutiveDashboard();
  const { alerts } = useAlerts({ severity: 'critical', category: 'healthcare-workflow' });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        <AlertCircle className="h-8 w-8 mr-2" />
        Error loading executive dashboard
      </div>
    );
  }

  const data = dashboardData;
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Executive KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.systemHealth?.score || 0}%</div>
            <p className="text-xs text-muted-foreground">
              {data.systemHealth?.status || 'Unknown'}
            </p>
            <Progress value={data.systemHealth?.score || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patient Satisfaction</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.healthcareKPIs?.patientSatisfaction || 0}/5</div>
            <p className="text-xs text-muted-foreground">
              Healthcare service quality
            </p>
            <Progress value={(data.healthcareKPIs?.patientSatisfaction || 0) * 20} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.complianceStatus?.overall?.score || 0}%</div>
            <p className="text-xs text-muted-foreground">
              PDPA & Healthcare compliance
            </p>
            <Progress value={data.complianceStatus?.overall?.score || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.financialMetrics?.monthly?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{data.financialMetrics?.growth || 0}% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Patient Journey & Risk Assessment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Patient Journey Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Clinic Search to Booking</span>
                <span className="text-sm font-medium">
                  {data.patientJourney?.searchToBooking || 0}%
                </span>
              </div>
              <Progress value={data.patientJourney?.searchToBooking || 0} />
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Profile to Contact</span>
                <span className="text-sm font-medium">
                  {data.patientJourney?.profileToContact || 0}%
                </span>
              </div>
              <Progress value={data.patientJourney?.profileToContact || 0} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Overall Risk Level</span>
                <Badge variant={
                  data.riskAssessment?.overallRisk === 'low' ? 'default' :
                  data.riskAssessment?.overallRisk === 'medium' ? 'secondary' : 'destructive'
                }>
                  {data.riskAssessment?.overallRisk || 'Unknown'}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Security Risk</span>
                  <span>{data.riskAssessment?.security?.level || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Compliance Risk</span>
                  <span>{data.riskAssessment?.compliance?.level || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Operational Risk</span>
                  <span>{data.riskAssessment?.operational?.level || 'N/A'}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts Summary */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Critical Healthcare Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{alert.title}</p>
                    <p className="text-xs text-muted-foreground">{alert.message}</p>
                  </div>
                  <Badge variant="destructive">{alert.severity}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Operations Dashboard Component
function OperationsDashboard() {
  const { dashboardData, isLoading, error, isRealTime, setIsRealTime, refetch } = useOperationsDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        <AlertCircle className="h-8 w-8 mr-2" />
        Error loading operations dashboard
      </div>
    );
  }

  const data = dashboardData;
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Operational KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointment Success Rate</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.operationalKPIs?.appointmentSuccessRate || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Patient booking efficiency
            </p>
            <Progress value={data.operationalKPIs?.appointmentSuccessRate || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doctor Utilization</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.operationalKPIs?.doctorUtilizationRate || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Professional time efficiency
            </p>
            <Progress value={data.operationalKPIs?.doctorUtilizationRate || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Wait Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.operationalKPIs?.patientWaitTime || 0} min
            </div>
            <p className="text-xs text-muted-foreground">
              Patient experience metric
            </p>
            <Progress value={100 - ((data.operationalKPIs?.patientWaitTime || 0) / 60 * 100)} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clinic Capacity</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.operationalKPIs?.clinicCapacity || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Facility utilization
            </p>
            <Progress value={data.operationalKPIs?.clinicCapacity || 0} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Real-time Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Real-time Operations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {data.realTimeMetrics?.activePatients || 0}
              </div>
              <div className="text-xs text-muted-foreground">Active Patients</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {data.realTimeMetrics?.currentAppointments || 0}
              </div>
              <div className="text-xs text-muted-foreground">Current Appointments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {data.realTimeMetrics?.averageWaitTime || 0}min
              </div>
              <div className="text-xs text-muted-foreground">Avg Wait Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {data.realTimeMetrics?.doctorAvailability || 0}
              </div>
              <div className="text-xs text-muted-foreground">Available Doctors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {Math.round(data.realTimeMetrics?.systemLoad || 0)}%
              </div>
              <div className="text-xs text-muted-foreground">System Load</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Doctor Performance & Patient Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Doctor Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.doctorPerformance?.slice(0, 5).map((doctor: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{doctor.name}</p>
                    <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{doctor.patientSatisfaction}/5</div>
                    <div className="text-sm text-muted-foreground">
                      {doctor.utilization}% utilized
                    </div>
                  </div>
                </div>
              )) || (
                <p className="text-sm text-muted-foreground">No doctor performance data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Patient Flow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Arrival to Consultation</span>
                <span className="text-sm font-medium">
                  {data.patientFlow?.arrivalToConsultation || 0} min
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Consultation to Completion</span>
                <span className="text-sm font-medium">
                  {data.patientFlow?.consultationToCompletion || 0} min
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Overall Flow Score</span>
                <Badge variant={
                  (data.patientFlow?.overallFlowScore || 0) > 80 ? 'default' :
                  (data.patientFlow?.overallFlowScore || 0) > 60 ? 'secondary' : 'destructive'
                }>
                  {data.patientFlow?.overallFlowScore || 0}/100
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Compliance Dashboard Component
function ComplianceDashboard() {
  const { dashboardData, isLoading, error, isRealTime, setIsRealTime, refetch } = useComplianceDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        <AlertCircle className="h-8 w-8 mr-2" />
        Error loading compliance dashboard
      </div>
    );
  }

  const data = dashboardData;
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Compliance KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">PDPA Compliance</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.complianceKPIs?.pdpaCompliance || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Personal data protection
            </p>
            <Progress value={data.complianceKPIs?.pdpaCompliance || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.complianceKPIs?.securityScore || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Healthcare data security
            </p>
            <Progress value={data.complianceKPIs?.securityScore || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Audit Trail</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.complianceKPIs?.auditTrailCompleteness || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Complete audit records
            </p>
            <Progress value={data.complianceKPIs?.auditTrailCompleteness || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Violations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {data.violations?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Requires immediate attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Healthcare Data Protection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Healthcare Data Protection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium mb-2">Encryption Status</h4>
              <Badge variant={
                data.healthcareDataProtection?.encryptionStatus === 'active' ? 'default' : 'destructive'
              }>
                {data.healthcareDataProtection?.encryptionStatus || 'Unknown'}
              </Badge>
            </div>
            <div>
              <h4 className="font-medium mb-2">Access Controls</h4>
              <div className="text-2xl font-bold">
                {data.healthcareDataProtection?.accessControlsScore || 0}%
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Data Classification</h4>
              <div className="text-2xl font-bold">
                {data.healthcareDataProtection?.dataClassificationCompliance || 0}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Violations and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Active Violations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.violations?.slice(0, 5).map((violation: any, index: number) => (
                <div key={index} className="flex items-start justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{violation.type}</p>
                    <p className="text-xs text-muted-foreground">{violation.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(violation.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="destructive">{violation.severity}</Badge>
                </div>
              )) || (
                <p className="text-sm text-muted-foreground">No active violations</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Compliance Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recommendations?.slice(0, 5).map((recommendation: any, index: number) => (
                <div key={index} className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">{recommendation.category}</p>
                      <p className="text-xs text-muted-foreground">{recommendation.recommendation}</p>
                    </div>
                    <Badge variant={
                      recommendation.priority === 'critical' ? 'destructive' :
                      recommendation.priority === 'high' ? 'secondary' : 'default'
                    }>
                      {recommendation.priority}
                    </Badge>
                  </div>
                </div>
              )) || (
                <p className="text-sm text-muted-foreground">No recommendations available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Technical Dashboard Component
function TechnicalDashboard() {
  const { dashboardData, isLoading, error, isRealTime, setIsRealTime, refetch } = useTechnicalDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        <AlertCircle className="h-8 w-8 mr-2" />
        Error loading technical dashboard
      </div>
    );
  }

  const data = dashboardData;
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Technical KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Performance</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.technicalKPIs?.systemPerformance?.score || 0}/100
            </div>
            <p className="text-xs text-muted-foreground">
              Overall system health
            </p>
            <Progress value={data.technicalKPIs?.systemPerformance?.score || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Response Time</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.technicalKPIs?.apiResponseTime || 0}ms
            </div>
            <p className="text-xs text-muted-foreground">
              Average API latency
            </p>
            <Progress value={100 - Math.min((data.technicalKPIs?.apiResponseTime || 0) / 10, 100)} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.technicalKPIs?.errorRate || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              System reliability
            </p>
            <Progress value={100 - (data.technicalKPIs?.errorRate || 0)} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.technicalKPIs?.uptime || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Service availability
            </p>
            <Progress value={data.technicalKPIs?.uptime || 0} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* System Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            System Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {data.systemPerformance?.lcp || 0}ms
              </div>
              <div className="text-xs text-muted-foreground">LCP (Largest Contentful Paint)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {data.systemPerformance?.fid || 0}ms
              </div>
              <div className="text-xs text-muted-foreground">FID (First Input Delay)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {(data.systemPerformance?.cls || 0).toFixed(3)}
              </div>
              <div className="text-xs text-muted-foreground">CLS (Cumulative Layout Shift)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {data.systemPerformance?.score || 0}/100
              </div>
              <div className="text-xs text-muted-foreground">Performance Score</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration Status & Error Rates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Integration Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Healthier SG API</span>
                <Badge variant={
                  data.integrationStatus?.healthierSgAPI === 'healthy' ? 'default' : 'destructive'
                }>
                  {data.integrationStatus?.healthierSgAPI || 'Unknown'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Google Maps</span>
                <Badge variant={
                  data.integrationStatus?.googleMaps === 'healthy' ? 'default' : 'destructive'
                }>
                  {data.integrationStatus?.googleMaps || 'Unknown'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Payment Gateway</span>
                <Badge variant={
                  data.integrationStatus?.paymentGateway === 'healthy' ? 'default' : 'destructive'
                }>
                  {data.integrationStatus?.paymentGateway || 'Unknown'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Notification Service</span>
                <Badge variant={
                  data.integrationStatus?.notificationService === 'healthy' ? 'default' : 'destructive'
                }>
                  {data.integrationStatus?.notificationService || 'Unknown'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Error Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Error Rate</span>
                <span className="text-sm font-medium">
                  {data.errorRates?.errorRate || 0}%
                </span>
              </div>
              <Progress value={data.errorRates?.errorRate || 0} />
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Error Types</h4>
                {Object.entries(data.errorRates?.errorTypes || {}).map(([type, count]) => (
                  <div key={type} className="flex justify-between text-sm">
                    <span className="capitalize">{type.replace('_', ' ')}</span>
                    <span>{count as number}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Main Monitoring Dashboard Component
export default function MonitoringDashboard() {
  const [activeTab, setActiveTab] = useState('executive');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  
  // Real-time alerts connection
  const { isConnected: isAlertsConnected } = useRealtimeAlerts();
  
  // Alert counts for each dashboard
  const { alerts: executiveAlerts } = useAlerts({ category: 'healthcare-workflow', status: 'active' });
  const { alerts: operationsAlerts } = useAlerts({ category: 'performance', status: 'active' });
  const { alerts: complianceAlerts } = useAlerts({ category: 'compliance', status: 'active' });
  const { alerts: technicalAlerts } = useAlerts({ category: 'performance', severity: 'high', status: 'active' });

  const handleRefresh = () => {
    setLastRefresh(new Date());
    // Trigger refetch in all dashboard hooks
  };

  const handleExport = () => {
    // Export dashboard data functionality
    console.log('Exporting dashboard data...');
  };

  const handleSettings = () => {
    // Open settings modal
    console.log('Opening dashboard settings...');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Healthcare Monitoring Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Real-time monitoring and compliance oversight for My Family Clinic
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isAlertsConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600">
                {isAlertsConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            
            {/* Last Refresh */}
            <span className="text-sm text-gray-600">
              Last refresh: {lastRefresh.toLocaleTimeString()}
            </span>

            {/* Action Buttons */}
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleSettings}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <DashboardTab 
              title="Executive" 
              icon={<Eye className="h-4 w-4" />}
              alertCount={executiveAlerts.length}
              criticalCount={executiveAlerts.filter(a => a.severity === 'critical').length}
            />
            <DashboardTab 
              title="Operations" 
              icon={<Activity className="h-4 w-4" />}
              alertCount={operationsAlerts.length}
              criticalCount={operationsAlerts.filter(a => a.severity === 'critical').length}
            />
            <DashboardTab 
              title="Compliance" 
              icon={<Shield className="h-4 w-4" />}
              alertCount={complianceAlerts.length}
              criticalCount={complianceAlerts.filter(a => a.severity === 'critical').length}
            />
            <DashboardTab 
              title="Technical" 
              icon={<BarChart3 className="h-4 w-4" />}
              alertCount={technicalAlerts.length}
              criticalCount={technicalAlerts.filter(a => a.severity === 'critical').length}
            />
          </TabsList>

          <TabsContent value="executive" className="space-y-6">
            <ExecutiveDashboard />
          </TabsContent>

          <TabsContent value="operations" className="space-y-6">
            <OperationsDashboard />
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <ComplianceDashboard />
          </TabsContent>

          <TabsContent value="technical" className="space-y-6">
            <TechnicalDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}