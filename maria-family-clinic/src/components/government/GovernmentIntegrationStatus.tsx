/**
 * Government Integration Status Component
 * Sub-Phase 8.11: Government Compliance & Security Framework
 * Monitors and displays status of government system integrations
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
  RefreshCw,
  Database,
  Link,
  Lock,
  Key,
  Server,
  Wifi,
  Activity
} from 'lucide-react';

interface GovernmentSystem {
  id: string;
  name: string;
  description: string;
  status: 'online' | 'offline' | 'degraded' | 'error';
  lastSync: Date;
  responseTime: number; // milliseconds
  uptime: number; // percentage
  authenticationStatus: 'authenticated' | 'expired' | 'failed' | 'pending';
  dataSyncStatus: 'synced' | 'pending' | 'failed' | 'partial';
  endpoint: string;
  version: string;
  features: string[];
  complianceLevel: 'full' | 'partial' | 'pending';
  lastIncident?: Date;
  incidentCount: number;
}

interface IntegrationMetrics {
  totalSystems: number;
  onlineSystems: number;
  authenticatedSystems: number;
  syncedSystems: number;
  averageResponseTime: number;
  overallUptime: number;
  complianceScore: number;
  lastGlobalSync: Date;
}

export default function GovernmentIntegrationStatus() {
  const [metrics, setMetrics] = useState<IntegrationMetrics>({
    totalSystems: 0,
    onlineSystems: 0,
    authenticatedSystems: 0,
    syncedSystems: 0,
    averageResponseTime: 0,
    overallUptime: 0,
    complianceScore: 0,
    lastGlobalSync: new Date()
  });

  const [systems, setSystems] = useState<GovernmentSystem[]>([
    {
      id: 'healthhub',
      name: 'HealthHub API',
      description: 'National health records and patient portal integration',
      status: 'online',
      lastSync: new Date(Date.now() - 5 * 60 * 1000),
      responseTime: 245,
      uptime: 99.8,
      authenticationStatus: 'authenticated',
      dataSyncStatus: 'synced',
      endpoint: 'https://api.healthhub.gov.sg/v2',
      version: '2.1.0',
      features: ['Patient Records', 'Health Metrics', 'Appointments', 'Medications'],
      complianceLevel: 'full',
      incidentCount: 0
    },
    {
      id: 'moh-systems',
      name: 'MOH Core Systems',
      description: 'Ministry of Health regulatory and compliance systems',
      status: 'online',
      lastSync: new Date(Date.now() - 12 * 60 * 1000),
      responseTime: 189,
      uptime: 99.5,
      authenticationStatus: 'authenticated',
      dataSyncStatus: 'synced',
      endpoint: 'https://systems.moh.gov.sg/api',
      version: '3.0.1',
      features: ['Regulatory Compliance', 'Program Reporting', 'Benefit Processing'],
      complianceLevel: 'full',
      incidentCount: 2
    },
    {
      id: 'nehr',
      name: 'NEHR Integration',
      description: 'National Electronic Health Record system',
      status: 'online',
      lastSync: new Date(Date.now() - 3 * 60 * 1000),
      responseTime: 312,
      uptime: 99.2,
      authenticationStatus: 'authenticated',
      dataSyncStatus: 'synced',
      endpoint: 'https://nehr.moh.gov.sg/api',
      version: '1.5.2',
      features: ['Patient Records', 'Clinical Data', 'Care Coordination'],
      complianceLevel: 'full',
      incidentCount: 1
    },
    {
      id: 'ndr',
      name: 'NDR Connectivity',
      description: 'National Disease Registry for health tracking',
      status: 'degraded',
      lastSync: new Date(Date.now() - 25 * 60 * 1000),
      responseTime: 456,
      uptime: 97.8,
      authenticationStatus: 'expired',
      dataSyncStatus: 'pending',
      endpoint: 'https://ndr.gov.sg/api',
      version: '2.0.0',
      features: ['Disease Surveillance', 'Health Analytics', 'Outbreak Detection'],
      complianceLevel: 'partial',
      lastIncident: new Date(Date.now() - 2 * 60 * 60 * 1000),
      incidentCount: 3
    },
    {
      id: 'singpass',
      name: 'SingPass Integration',
      description: 'Singapore digital identity and authentication',
      status: 'online',
      lastSync: new Date(Date.now() - 1 * 60 * 1000),
      responseTime: 123,
      uptime: 99.9,
      authenticationStatus: 'authenticated',
      dataSyncStatus: 'synced',
      endpoint: 'https://auth.singpass.gov.sg/api',
      version: '4.0.0',
      features: ['Identity Verification', 'Digital Authentication', 'Consent Management'],
      complianceLevel: 'full',
      incidentCount: 0
    },
    {
      id: 'myinfo',
      name: 'MyInfo Integration',
      description: 'Government digital profile and data service',
      status: 'online',
      lastSync: new Date(Date.now() - 8 * 60 * 1000),
      responseTime: 178,
      uptime: 99.6,
      authenticationStatus: 'authenticated',
      dataSyncStatus: 'synced',
      endpoint: 'https://api.myinfo.gov.sg/api',
      version: '3.2.1',
      features: ['Profile Data', 'Address Verification', 'Consent Framework'],
      complianceLevel: 'full',
      incidentCount: 1
    },
    {
      id: 'chas-system',
      name: 'CHAS Benefits',
      description: 'Community Health Assist Scheme integration',
      status: 'online',
      lastSync: new Date(Date.now() - 15 * 60 * 1000),
      responseTime: 201,
      uptime: 98.9,
      authenticationStatus: 'authenticated',
      dataSyncStatus: 'synced',
      endpoint: 'https://chas.moh.gov.sg/api',
      version: '2.1.0',
      features: ['Benefit Validation', 'Subsidy Processing', 'Card Status'],
      complianceLevel: 'full',
      incidentCount: 4
    },
    {
      id: 'medisave',
      name: 'Medisave System',
      description: 'Medisave account management and transactions',
      status: 'online',
      lastSync: new Date(Date.now() - 6 * 60 * 1000),
      responseTime: 234,
      uptime: 99.1,
      authenticationStatus: 'authenticated',
      dataSyncStatus: 'synced',
      endpoint: 'https://medisave.cpf.gov.sg/api',
      version: '1.8.3',
      features: ['Account Balance', 'Transaction Processing', 'Deduction Validation'],
      complianceLevel: 'full',
      incidentCount: 2
    }
  ]);

  useEffect(() => {
    // Calculate metrics
    const totalSystems = systems.length;
    const onlineSystems = systems.filter(s => s.status === 'online').length;
    const authenticatedSystems = systems.filter(s => s.authenticationStatus === 'authenticated').length;
    const syncedSystems = systems.filter(s => s.dataSyncStatus === 'synced').length;
    const averageResponseTime = Math.round(
      systems.reduce((sum, s) => sum + s.responseTime, 0) / totalSystems
    );
    const overallUptime = Math.round(
      systems.reduce((sum, s) => sum + s.uptime, 0) / totalSystems
    );
    const complianceScore = Math.round(
      systems.reduce((sum, s) => sum + (s.complianceLevel === 'full' ? 100 : s.complianceLevel === 'partial' ? 50 : 0), 0) / totalSystems
    );

    setMetrics({
      totalSystems,
      onlineSystems,
      authenticatedSystems,
      syncedSystems,
      averageResponseTime,
      overallUptime,
      complianceScore,
      lastGlobalSync: new Date()
    });
  }, [systems]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'offline': return 'text-red-600';
      case 'error': return 'text-red-800';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'degraded': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'offline': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-800" />;
      default: return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getAuthStatusBadge = (status: string) => {
    switch (status) {
      case 'authenticated': return <Badge className="bg-green-100 text-green-800">Authenticated</Badge>;
      case 'expired': return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
      case 'failed': return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const getSyncStatusBadge = (status: string) => {
    switch (status) {
      case 'synced': return <Badge className="bg-green-100 text-green-800">Synced</Badge>;
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'failed': return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'partial': return <Badge className="bg-orange-100 text-orange-800">Partial</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const refreshSystems = async () => {
    // Simulate refresh
    setSystems(prev => prev.map(system => ({
      ...system,
      lastSync: new Date(),
      responseTime: Math.floor(Math.random() * 500) + 100
    })));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Government Integration Status</h1>
              <p className="text-gray-600 mt-2">
                Real-time monitoring of Singapore government system integrations
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={refreshSystems}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh All
              </Button>
            </div>
          </div>
        </div>

        {/* Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Systems Online</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {metrics.onlineSystems}/{metrics.totalSystems}
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.round((metrics.onlineSystems / metrics.totalSystems) * 100)}% uptime
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Authentication</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {metrics.authenticatedSystems}
              </div>
              <p className="text-xs text-muted-foreground">
                Active authenticated systems
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Data Sync</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {metrics.syncedSystems}
              </div>
              <p className="text-xs text-muted-foreground">
                Systems in sync
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600">
                {metrics.complianceScore}%
              </div>
              <p className="text-xs text-muted-foreground">
                Government compliance level
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="systems" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="systems">System Status</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>

          {/* System Status Tab */}
          <TabsContent value="systems">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {systems.map((system) => (
                <Card key={system.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(system.status)}
                        <div>
                          <CardTitle className="text-lg">{system.name}</CardTitle>
                          <CardDescription>{system.description}</CardDescription>
                        </div>
                      </div>
                      <Badge variant={system.status === 'online' ? 'default' : 'destructive'}>
                        {system.status.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Response Time</p>
                        <p className="text-sm">{system.responseTime}ms</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Uptime</p>
                        <p className="text-sm">{system.uptime}%</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Authentication</span>
                        {getAuthStatusBadge(system.authenticationStatus)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Data Sync</span>
                        {getSyncStatusBadge(system.dataSyncStatus)}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Features</p>
                      <div className="flex flex-wrap gap-1">
                        {system.features.map((feature) => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">
                      <p>Last sync: {system.lastSync.toLocaleString()}</p>
                      <p>Version: {system.version}</p>
                      {system.incidentCount > 0 && (
                        <p className="text-red-600">
                          {system.incidentCount} incident{system.incidentCount > 1 ? 's' : ''} this month
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Response Time Trends</CardTitle>
                  <CardDescription>Average response times for government APIs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Average Response Time</span>
                      <span className="text-sm font-bold">{metrics.averageResponseTime}ms</span>
                    </div>
                    <Progress value={(metrics.averageResponseTime / 1000) * 100} className="h-2" />
                    
                    <div className="mt-4 space-y-2">
                      {systems.map((system) => (
                        <div key={system.id} className="flex items-center justify-between">
                          <span className="text-sm">{system.name}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">{system.responseTime}ms</span>
                            <div className="w-16 h-2 bg-gray-200 rounded">
                              <div 
                                className={`h-2 rounded ${
                                  system.responseTime < 200 ? 'bg-green-500' :
                                  system.responseTime < 400 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${Math.min((system.responseTime / 1000) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Uptime</CardTitle>
                  <CardDescription>Availability percentage for all systems</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Overall Uptime</span>
                      <span className="text-sm font-bold text-green-600">{metrics.overallUptime}%</span>
                    </div>
                    <Progress value={metrics.overallUptime} className="h-2" />
                    
                    <div className="mt-4 space-y-2">
                      {systems.map((system) => (
                        <div key={system.id} className="flex items-center justify-between">
                          <span className="text-sm">{system.name}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">{system.uptime}%</span>
                            <div className="w-16 h-2 bg-gray-200 rounded">
                              <div 
                                className={`h-2 rounded ${
                                  system.uptime > 99 ? 'bg-green-500' :
                                  system.uptime > 95 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${system.uptime}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Government Compliance Status</CardTitle>
                  <CardDescription>
                    Overall compliance score: {metrics.complianceScore}%
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={metrics.complianceScore} className="h-3" />
                  <div className="mt-4 text-sm text-gray-600">
                    {metrics.complianceScore >= 90 ? (
                      <p className="text-green-600">Excellent compliance with Singapore government standards</p>
                    ) : metrics.complianceScore >= 70 ? (
                      <p className="text-yellow-600">Good compliance with some areas for improvement</p>
                    ) : (
                      <p className="text-red-600">Compliance issues require immediate attention</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {systems.map((system) => (
                  <Card key={system.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{system.name}</CardTitle>
                        <Badge variant={
                          system.complianceLevel === 'full' ? 'default' :
                          system.complianceLevel === 'partial' ? 'secondary' : 'destructive'
                        }>
                          {system.complianceLevel.toUpperCase()} COMPLIANCE
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">PDPA Compliance</span>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Data Protection</span>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Audit Trail</span>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Encryption</span>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        {system.lastIncident && (
                          <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              Last incident: {system.lastIncident.toLocaleDateString()} - {system.incidentCount} total
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}