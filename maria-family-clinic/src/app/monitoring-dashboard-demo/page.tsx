/**
 * Monitoring Dashboard Demo Page
 * Sub-Phase 10.6: Monitoring & Alerting Systems
 */

'use client';

import React, { useState, useEffect } from 'react';
import MonitoringDashboard from '@/components/monitoring/MonitoringDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Play,
  Pause,
  Info,
} from 'lucide-react';

// Demo Data Generator
class MonitoringDemoData {
  private static generatePerformanceData() {
    return {
      timestamp: Date.now(),
      metrics: {
        lcp: Math.round(800 + Math.random() * 1200), // 800-2000ms
        fid: Math.round(50 + Math.random() * 100), // 50-150ms
        cls: Math.round((Math.random() * 0.1) * 1000) / 1000, // 0-0.1
        fcp: Math.round(600 + Math.random() * 800), // 600-1400ms
        ttfb: Math.round(200 + Math.random() * 300), // 200-500ms
      },
      systemHealth: {
        status: 'healthy',
        score: 85 + Math.round(Math.random() * 15),
        uptime: 99.5 + Math.random() * 0.5,
        responseTime: 120 + Math.round(Math.random() * 80),
      },
      alerts: [
        {
          id: 'demo-1',
          title: 'High LCP detected',
          message: 'Largest Contentful Paint exceeded threshold',
          severity: 'warning',
          timestamp: Date.now() - 300000,
        },
        {
          id: 'demo-2', 
          title: 'API response time increased',
          message: 'Average response time above normal',
          severity: 'medium',
          timestamp: Date.now() - 600000,
        },
      ],
    };
  }

  private static generateExecutiveData() {
    return {
      timestamp: Date.now(),
      systemHealth: {
        status: 'healthy',
        score: 88 + Math.round(Math.random() * 10),
      },
      healthcareKPIs: {
        systemUptime: 99.2 + Math.random() * 0.8,
        patientSatisfaction: 4.1 + Math.random() * 0.8,
        complianceScore: 92 + Math.random() * 8,
        revenue: {
          monthly: 125000 + Math.round(Math.random() * 25000),
          growth: 8 + Math.round(Math.random() * 7),
        },
        riskLevel: Math.random() > 0.7 ? 'medium' : 'low',
      },
      patientJourney: {
        searchToBooking: 78 + Math.round(Math.random() * 15),
        profileToContact: 65 + Math.round(Math.random() * 20),
        overallSatisfaction: 4.2 + Math.random() * 0.6,
      },
      complianceStatus: {
        overall: {
          score: 94 + Math.round(Math.random() * 6),
        },
      },
      financialMetrics: {
        monthly: 132000 + Math.round(Math.random() * 18000),
        growth: 9 + Math.round(Math.random() * 6),
      },
      regulatoryCompliance: {
        pdpa: {
          score: 96 + Math.round(Math.random() * 4),
        },
      },
      riskAssessment: {
        overallRisk: Math.random() > 0.8 ? 'medium' : 'low',
        security: { level: 'low' },
        compliance: { level: 'low' },
        operational: { level: 'low' },
      },
    };
  }

  private static generateOperationsData() {
    return {
      timestamp: Date.now(),
      operationalKPIs: {
        appointmentSuccessRate: 92 + Math.round(Math.random() * 6),
        doctorUtilizationRate: 75 + Math.round(Math.random() * 20),
        patientWaitTime: 12 + Math.round(Math.random() * 8),
        clinicCapacity: 78 + Math.round(Math.random() * 15),
      },
      doctorPerformance: [
        {
          name: 'Dr. Sarah Lim',
          specialty: 'General Practice',
          patientSatisfaction: 4.5,
          utilization: 82,
        },
        {
          name: 'Dr. Michael Chen',
          specialty: 'Cardiology',
          patientSatisfaction: 4.3,
          utilization: 78,
        },
        {
          name: 'Dr. Emily Wong',
          specialty: 'Dermatology',
          patientSatisfaction: 4.7,
          utilization: 85,
        },
        {
          name: 'Dr. David Tan',
          specialty: 'Orthopedics',
          patientSatisfaction: 4.2,
          utilization: 73,
        },
        {
          name: 'Dr. Lisa Ng',
          specialty: 'Pediatrics',
          patientSatisfaction: 4.6,
          utilization: 88,
        },
      ],
      clinicUtilization: [
        {
          clinicName: 'Orchard Medical Centre',
          avgOccupancy: 82,
          peakUtilization: 95,
          avgWaitTime: 15,
        },
        {
          clinicName: 'Raffles Place Clinic',
          avgOccupancy: 78,
          peakUtilization: 91,
          avgWaitTime: 12,
        },
        {
          clinicName: 'Tiong Bahru Health Hub',
          avgOccupancy: 75,
          peakUtilization: 88,
          avgWaitTime: 18,
        },
      ],
      appointmentSystem: {
        bookingSuccessRate: 94,
        noShowRate: 6,
        rescheduleRate: 8,
      },
      patientFlow: {
        arrivalToConsultation: 18,
        consultationToCompletion: 25,
        overallFlowScore: 82,
      },
      realTimeMetrics: {
        activePatients: 34,
        currentAppointments: 12,
        averageWaitTime: 14,
        doctorAvailability: 8,
        systemLoad: 65 + Math.round(Math.random() * 20),
      },
    };
  }

  private static generateComplianceData() {
    return {
      timestamp: Date.now(),
      complianceKPIs: {
        pdpaCompliance: 96 + Math.round(Math.random() * 4),
        securityScore: 94 + Math.round(Math.random() * 6),
        auditTrailCompleteness: 98 + Math.round(Math.random() * 2),
        violationCount: Math.round(Math.random() * 3),
      },
      pdpaCompliance: {
        status: 'compliant',
        score: 97 + Math.round(Math.random() * 3),
      },
      healthcareDataProtection: {
        encryptionStatus: 'active',
        accessControlsScore: 95 + Math.round(Math.random() * 5),
        dataClassificationCompliance: 94 + Math.round(Math.random() * 6),
      },
      securityStatus: {
        status: 'secure',
        score: 96 + Math.round(Math.random() * 4),
      },
      violations: [
        {
          type: 'Minor Data Access Delay',
          description: 'Slight delay in consent verification',
          severity: 'low',
          timestamp: Date.now() - 3600000,
        },
        {
          type: 'Audit Log Gap',
          description: 'Missing entry in audit trail',
          severity: 'medium',
          timestamp: Date.now() - 7200000,
        },
      ],
      recommendations: [
        {
          category: 'Access Control',
          recommendation: 'Review and update access permissions for non-essential users',
          priority: 'medium',
        },
        {
          category: 'Data Retention',
          recommendation: 'Implement automated data retention policy enforcement',
          priority: 'high',
        },
        {
          category: 'Audit Logging',
          recommendation: 'Enhance audit trail coverage for healthcare data access',
          priority: 'low',
        },
      ],
      auditTrail: {
        status: 'complete',
        completeness: 99 + Math.round(Math.random() * 1),
      },
    };
  }

  private static generateTechnicalData() {
    return {
      timestamp: Date.now(),
      technicalKPIs: {
        systemPerformance: {
          score: 85 + Math.round(Math.random() * 12),
        },
        apiResponseTime: 180 + Math.round(Math.random() * 120),
        errorRate: Math.round(Math.random() * 2 * 10) / 10,
        uptime: 99.5 + Math.random() * 0.5,
      },
      systemPerformance: {
        lcp: 1200 + Math.round(Math.random() * 600),
        fid: 80 + Math.round(Math.random() * 40),
        cls: Math.round((Math.random() * 0.05 + 0.02) * 1000) / 1000,
        score: 85 + Math.round(Math.random() * 12),
      },
      apiHealth: {
        averageResponseTime: 185 + Math.round(Math.random() * 115),
        successRate: 99.2 + Math.random() * 0.8,
        uptime: 99.6 + Math.random() * 0.4,
      },
      integrationStatus: {
        healthierSgAPI: 'healthy',
        googleMaps: 'healthy',
        paymentGateway: 'degraded',
        notificationService: 'healthy',
      },
      errorRates: {
        errorRate: Math.round(Math.random() * 1.5 * 10) / 10,
        errorTypes: {
          'network_timeout': 3,
          'validation_error': 2,
          'database_connection': 1,
          'external_api': 4,
        },
      },
      capacityPlanning: {
        currentUtilization: 65 + Math.round(Math.random() * 20),
        projectedUsage: 70 + Math.round(Math.random() * 15),
        scalingRecommendation: 'monitor',
      },
    };
  }

  static getDashboardData(type: 'executive' | 'operations' | 'compliance' | 'technical') {
    switch (type) {
      case 'executive':
        return this.generateExecutiveData();
      case 'operations':
        return this.generateOperationsData();
      case 'compliance':
        return this.generateComplianceData();
      case 'technical':
        return this.generateTechnicalData();
      default:
        return this.generatePerformanceData();
    }
  }
}

// Demo Controls Component
function DemoControls({ 
  isPlaying, 
  onPlay, 
  onStop, 
  onRefresh 
}: { 
  isPlaying: boolean; 
  onPlay: () => void; 
  onStop: () => void; 
  onRefresh: () => void; 
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          Demo Controls
        </CardTitle>
        <CardDescription>
          Control the demo data generation and monitoring simulation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <Button 
            onClick={isPlaying ? onStop : onPlay}
            variant={isPlaying ? "destructive" : "default"}
          >
            {isPlaying ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Stop Demo
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start Demo
              </>
            )}
          </Button>
          
          <Button variant="outline" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          
          <Badge variant={isPlaying ? "default" : "secondary"}>
            {isPlaying ? 'Running' : 'Stopped'}
          </Badge>
        </div>
        
        <div className="mt-4 text-sm text-muted-foreground">
          The demo generates realistic healthcare monitoring data including:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Real-time performance metrics</li>
            <li>Healthcare workflow analytics</li>
            <li>PDPA compliance monitoring</li>
            <li>Security event simulation</li>
            <li>Integration health status</li>
            <li>Automated alerts and incidents</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

// Feature Showcase Component
function FeatureShowcase() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          Key Features
        </CardTitle>
        <CardDescription>
          Comprehensive monitoring capabilities for healthcare platforms
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboards</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Executive Dashboard</h4>
                <p className="text-sm text-muted-foreground">
                  High-level KPIs, patient satisfaction, revenue metrics, and risk assessment
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Operations Dashboard</h4>
                <p className="text-sm text-muted-foreground">
                  Real-time clinic operations, doctor performance, patient flow, and capacity planning
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Compliance Dashboard</h4>
                <p className="text-sm text-muted-foreground">
                  PDPA compliance, security status, audit trails, and regulatory monitoring
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Technical Dashboard</h4>
                <p className="text-sm text-muted-foreground">
                  System performance, API health, integration status, and error analysis
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="monitoring" className="space-y-4">
            <div className="space-y-3">
              <div>
                <h4 className="font-medium">Real-time Performance Monitoring</h4>
                <p className="text-sm text-muted-foreground">
                  Continuous tracking of Core Web Vitals, healthcare workflows, and system capacity
                </p>
              </div>
              <div>
                <h4 className="font-medium">Healthcare-Specific Monitoring</h4>
                <p className="text-sm text-muted-foreground">
                  Patient journey tracking, appointment booking success, doctor utilization metrics
                </p>
              </div>
              <div>
                <h4 className="font-medium">Integration Health Monitoring</h4>
                <p className="text-sm text-muted-foreground">
                  Healthier SG API, Google Maps, payment gateways, and third-party service status
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="alerts" className="space-y-4">
            <div className="space-y-3">
              <div>
                <h4 className="font-medium">Intelligent Alerting</h4>
                <p className="text-sm text-muted-foreground">
                  Contextual alerts with healthcare impact assessment and automated response
                </p>
              </div>
              <div>
                <h4 className="font-medium">Multi-channel Notifications</h4>
                <p className="text-sm text-muted-foreground">
                  Email, SMS, Slack, Teams, and webhook integrations for critical alerts
                </p>
              </div>
              <div>
                <h4 className="font-medium">Incident Management</h4>
                <p className="text-sm text-muted-foreground">
                  Automated incident creation, escalation policies, and resolution tracking
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="compliance" className="space-y-4">
            <div className="space-y-3">
              <div>
                <h4 className="font-medium">PDPA Compliance Monitoring</h4>
                <p className="text-sm text-muted-foreground">
                  Real-time personal data protection compliance with breach detection
                </p>
              </div>
              <div>
                <h4 className="font-medium">Healthcare Data Security</h4>
                <p className="text-sm text-muted-foreground">
                  Encryption status, access controls, and data classification compliance
                </p>
              </div>
              <div>
                <h4 className="font-medium">Audit Trail Integrity</h4>
                <p className="text-sm text-muted-foreground">
                  Complete audit logging with regulatory compliance reporting
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Main Demo Page Component
export default function MonitoringDashboardDemo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Demo data simulation
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setLastUpdate(new Date());
      // In a real implementation, this would trigger actual data updates
      console.log('Demo data updated at:', new Date().toISOString());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [isPlaying]);

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handleStop = () => {
    setIsPlaying(false);
  };

  const handleRefresh = () => {
    setLastUpdate(new Date());
    // Trigger data refresh
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Healthcare Monitoring & Alerting Systems
              </h1>
              <p className="text-lg text-gray-600">
                Sub-Phase 10.6: Real-time performance monitoring, compliance oversight, and specialized dashboards
              </p>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              Demo Mode
            </Badge>
          </div>
          
          {/* Demo Status */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              <span>Demo {isPlaying ? 'Running' : 'Stopped'}</span>
            </div>
            <div>
              Last Update: {lastUpdate.toLocaleTimeString()}
            </div>
            <div>
              Data Source: Simulated Healthcare Metrics
            </div>
          </div>
        </div>

        {/* Demo Controls and Features */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <DemoControls 
              isPlaying={isPlaying}
              onPlay={handlePlay}
              onStop={handleStop}
              onRefresh={handleRefresh}
            />
          </div>
          <div>
            <FeatureShowcase />
          </div>
        </div>

        {/* Dashboard Sections */}
        <div className="space-y-8">
          {/* Introduction Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6" />
                Healthcare Monitoring Overview
              </CardTitle>
              <CardDescription>
                Comprehensive monitoring system designed specifically for healthcare platforms like My Family Clinic
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Eye className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-medium mb-2">Executive Insights</h3>
                  <p className="text-sm text-muted-foreground">
                    High-level dashboards for healthcare leadership with KPIs and strategic metrics
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Activity className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-medium mb-2">Operations Control</h3>
                  <p className="text-sm text-muted-foreground">
                    Real-time monitoring of clinic operations, doctor performance, and patient flow
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Shield className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="font-medium mb-2">Compliance Assurance</h3>
                  <p className="text-sm text-muted-foreground">
                    PDPA compliance, healthcare data protection, and regulatory monitoring
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Zap className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="font-medium mb-2">Technical Performance</h3>
                  <p className="text-sm text-muted-foreground">
                    System performance, API health, integration monitoring, and error analysis
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Monitoring Dashboard */}
          <MonitoringDashboard />
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            Healthcare Monitoring & Alerting Systems - Sub-Phase 10.6 Implementation
          </p>
          <p className="mt-2">
            Built with Next.js, TypeScript, Tailwind CSS, and React Query for real-time healthcare data monitoring
          </p>
        </div>
      </div>
    </div>
  );
}