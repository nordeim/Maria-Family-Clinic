"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Zap, 
  Bot, 
  BarChart3, 
  TrendingUp, 
  Target, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Activity, 
  Settings, 
  Mail, 
  MessageSquare, 
  Bell, 
  Star, 
  Workflow, 
  Database, 
  Shield, 
  Cpu, 
  HardDrive, 
  Wifi,
  RefreshCw,
  Download,
  Eye,
  ArrowRight,
  TrendingDown
} from 'lucide-react'
import { 
  AutomatedResponseSystem,
  MultiChannelNotificationSystem,
  SurveyManagementSystem,
  WorkflowAutomationEngine,
  CRMIntegrationSystem
} from './index'
import { 
  AutomationPerformanceMetrics,
  SystemHealthMetrics,
  CustomerJourney,
  AutomatedWorkflow,
  NotificationTemplate,
  CRMIntegration
} from './types'

// Main Automation Dashboard
function AutomationOverview() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // Mock performance data
  const performanceMetrics: AutomationPerformanceMetrics = {
    automationRate: 78.5,
    timeSaved: 156.2, // hours per week
    costReduction: 3420, // dollars per month
    qualityImprovement: 23.7, // percentage
    customerSatisfactionIncrease: 18.4, // percentage
    slaCompliance: 94.2
  }

  const systemHealth: SystemHealthMetrics = {
    systemUptime: 99.8,
    responseTime: 145, // milliseconds
    errorRate: 0.3, // percentage
    throughput: 1247, // requests per hour
    resourceUtilization: {
      cpu: 34.2,
      memory: 67.8,
      storage: 45.1
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false)
      setLastUpdate(new Date())
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Automation Performance Overview</h2>
          <p className="text-gray-600">Real-time metrics and system health monitoring</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Automation Rate</p>
                <p className="text-2xl font-bold text-blue-600">{performanceMetrics.automationRate}%</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-600">+5.2% from last month</span>
                </div>
              </div>
              <Bot className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Time Saved</p>
                <p className="text-2xl font-bold text-green-600">{performanceMetrics.timeSaved}h</p>
                <p className="text-xs text-gray-500">per week</p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cost Reduction</p>
                <p className="text-2xl font-bold text-purple-600">${performanceMetrics.costReduction}</p>
                <p className="text-xs text-gray-500">per month</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">SLA Compliance</p>
                <p className="text-2xl font-bold text-orange-600">{performanceMetrics.slaCompliance}%</p>
                <div className="flex items-center gap-1 mt-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-600">Target: 95%</span>
                </div>
              </div>
              <Shield className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Health Status
          </CardTitle>
          <CardDescription>
            Last updated: {lastUpdate.toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">System Uptime</span>
                <span className="text-sm text-green-600">{systemHealth.systemUptime}%</span>
              </div>
              <Progress value={systemHealth.systemUptime} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Response Time</span>
                <span className="text-sm text-blue-600">{systemHealth.responseTime}ms</span>
              </div>
              <Progress value={90} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Error Rate</span>
                <span className="text-sm text-red-600">{systemHealth.errorRate}%</span>
              </div>
              <Progress value={95} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Throughput</span>
                <span className="text-sm text-purple-600">{systemHealth.throughput}/hr</span>
              </div>
              <Progress value={80} className="h-2" />
            </div>
          </div>

          {/* Resource Utilization */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Cpu className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <div className="text-sm text-gray-600">CPU Usage</div>
              <div className="text-xl font-bold">{systemHealth.resourceUtilization.cpu}%</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <HardDrive className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <div className="text-sm text-gray-600">Memory Usage</div>
              <div className="text-xl font-bold">{systemHealth.resourceUtilization.memory}%</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Database className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <div className="text-sm text-gray-600">Storage Usage</div>
              <div className="text-xl font-bold">{systemHealth.resourceUtilization.storage}%</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Template Management</h3>
                <p className="text-sm text-gray-600">Create and manage response templates</p>
              </div>
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Workflow Automation</h3>
                <p className="text-sm text-gray-600">Configure automated workflows</p>
              </div>
              <Workflow className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">CRM Integration</h3>
                <p className="text-sm text-gray-600">Manage customer relationships</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// System Health Monitor
function SystemHealthMonitor() {
  const [alerts, setAlerts] = useState([
    {
      id: '1',
      severity: 'low' as const,
      message: 'Template usage exceeded 80% capacity',
      component: 'templates',
      timestamp: new Date(Date.now() - 3600000)
    },
    {
      id: '2',
      severity: 'medium' as const,
      message: 'Notification queue processing delay',
      component: 'notifications',
      timestamp: new Date(Date.now() - 7200000)
    }
  ])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">System Health Monitor</h2>
          <p className="text-gray-600">Monitor system health and performance alerts</p>
        </div>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Configure Alerts
        </Button>
      </div>

      {/* Component Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { name: 'Automation Engine', status: 'operational', uptime: 99.9, icon: <Zap className="h-5 w-5" /> },
          { name: 'Notification System', status: 'operational', uptime: 99.7, icon: <Bell className="h-5 w-5" /> },
          { name: 'CRM Integration', status: 'degraded', uptime: 98.2, icon: <Database className="h-5 w-5" /> },
          { name: 'Survey System', status: 'operational', uptime: 99.8, icon: <Star className="h-5 w-5" /> }
        ].map((component) => (
          <Card key={component.name}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {component.icon}
                  <span className="font-medium text-sm">{component.name}</span>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  component.status === 'operational' ? 'bg-green-500' :
                  component.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Status</span>
                  <span className={`capitalize font-medium ${
                    component.status === 'operational' ? 'text-green-600' :
                    component.status === 'degraded' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {component.status}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Uptime</span>
                  <span className="font-medium">{component.uptime}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Active Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.map(alert => (
              <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  alert.severity === 'low' ? 'bg-blue-500' :
                  alert.severity === 'medium' ? 'bg-yellow-500' :
                  alert.severity === 'high' ? 'bg-orange-500' : 'bg-red-500'
                }`} />
                <div className="flex-1">
                  <p className="font-medium text-sm">{alert.message}</p>
                  <p className="text-xs text-gray-600">
                    {alert.component} • {alert.timestamp.toLocaleString()}
                  </p>
                </div>
                <Button variant="outline" size="sm">Resolve</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Main Sub-Phase 9.6 Component
export function AutomatedResponseConfirmationWorkflows() {
  const [activeTab, setActiveTab] = useState('overview')
  const [enquiry] = useState({
    id: 'enq-001',
    name: 'John Doe',
    email: 'john@example.com',
    subject: 'General inquiry about services',
    type: 'GENERAL' as const,
    status: 'PENDING' as const,
    priority: 'NORMAL' as const
  })

  const [staffAvailability] = useState([
    { staffId: '1', staffName: 'Dr. Smith', currentWorkload: 3, responseTime: 2.5 },
    { staffId: '2', staffName: 'Dr. Johnson', currentWorkload: 1, responseTime: 1.8 },
    { staffId: '3', staffName: 'Dr. Wilson', currentWorkload: 5, responseTime: 3.2 }
  ])

  const [templates] = useState<NotificationTemplate[]>([
    {
      id: '1',
      name: 'Enquiry Acknowledgment',
      subject: 'Thank you for contacting us',
      content: 'Dear {{customerName}}, we have received your enquiry about {{subject}}...',
      channels: ['email', 'sms'],
      variables: ['customerName', 'enquiryId'],
      isActive: true,
      successRate: 98.5,
      sentCount: 1247,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Automated Response & Confirmation Workflows
              </h1>
              <p className="text-gray-600 mt-1">
                Comprehensive automation system for efficient enquiry handling and customer communication
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>12 active workflows</span>
            </div>
            <div className="flex items-center gap-1">
              <Activity className="h-4 w-4 text-blue-500" />
              <span>247 executions today</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>94.2% SLA compliance</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="p-6">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="responses">Response System</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="surveys">Surveys</TabsTrigger>
              <TabsTrigger value="automation">Workflows</TabsTrigger>
              <TabsTrigger value="crm">CRM Integration</TabsTrigger>
              <TabsTrigger value="health">System Health</TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="overview">
                <AutomationOverview />
              </TabsContent>

              <TabsContent value="responses">
                <AutomatedResponseSystem
                  enquiry={enquiry}
                  staffAvailability={staffAvailability}
                  templates={templates}
                  onCreateTemplate={(template) => console.log('Create template:', template)}
                  onUpdateTemplate={(id, template) => console.log('Update template:', id, template)}
                  onDeleteTemplate={(id) => console.log('Delete template:', id)}
                  onDuplicateTemplate={(id) => console.log('Duplicate template:', id)}
                />
              </TabsContent>

              <TabsContent value="notifications">
                <MultiChannelNotificationSystem />
              </TabsContent>

              <TabsContent value="surveys">
                <SurveyManagementSystem />
              </TabsContent>

              <TabsContent value="automation">
                <WorkflowAutomationEngine />
              </TabsContent>

              <TabsContent value="crm">
                <CRMIntegrationSystem />
              </TabsContent>

              <TabsContent value="health">
                <SystemHealthMonitor />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
}