"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Phone, 
  Clock, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Users, 
  Settings, 
  Smartphone,
  Globe,
  Zap,
  TrendingUp,
  Filter,
  Calendar,
  Target,
  BarChart3
} from 'lucide-react'
import { 
  MultiChannelNotification,
  NotificationTrigger,
  NotificationTemplate,
  NotificationAnalytics,
  CommunicationChannel,
  NotificationPriority
} from './types'

// Notification Template Manager
interface NotificationTemplateManagerProps {
  templates: NotificationTemplate[]
  onCreateTemplate: (template: Omit<NotificationTemplate, 'id' | 'sentCount' | 'lastSent'>) => void
  onUpdateTemplate: (id: string, template: Partial<NotificationTemplate>) => void
  onDeleteTemplate: (id: string) => void
}

function NotificationTemplateManager({ 
  templates, 
  onCreateTemplate, 
  onUpdateTemplate, 
  onDeleteTemplate 
}: NotificationTemplateManagerProps) {
  const [selectedChannel, setSelectedChannel] = useState<CommunicationChannel | 'all'>('all')
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null)

  const channels: Array<{ value: CommunicationChannel | 'all', label: string, icon: React.ReactNode }> = [
    { value: 'all', label: 'All Channels', icon: <Globe className="h-4 w-4" /> },
    { value: 'email', label: 'Email', icon: <Mail className="h-4 w-4" /> },
    { value: 'sms', label: 'SMS', icon: <MessageSquare className="h-4 w-4" /> },
    { value: 'push', label: 'Push', icon: <Smartphone className="h-4 w-4" /> },
    { value: 'in_app', label: 'In-App', icon: <Bell className="h-4 w-4" /> }
  ]

  const filteredTemplates = selectedChannel === 'all' 
    ? templates 
    : templates.filter(t => t.channels.includes(selectedChannel))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Multi-Channel Notification Templates</h2>
          <p className="text-gray-600">Manage notification templates for all communication channels</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Bell className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Channel Filter */}
      <div className="flex gap-2 flex-wrap">
        {channels.map(channel => (
          <Button
            key={channel.value}
            variant={selectedChannel === channel.value ? "default" : "outline"}
            onClick={() => setSelectedChannel(channel.value)}
            className="flex items-center gap-2"
          >
            {channel.icon}
            {channel.label}
          </Button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map(template => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedTemplate(template)}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.subject}</CardDescription>
                </div>
                <div className="flex gap-1">
                  {template.channels.map(channel => (
                    <Badge key={channel} variant="secondary" className="text-xs">
                      {channel.replace('_', '-')}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Sent</span>
                  <span className="font-medium">{template.sentCount} times</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-medium text-green-600">{template.successRate}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Status</span>
                  <Badge variant={template.isActive ? "default" : "secondary"}>
                    {template.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                {template.lastSent && (
                  <div className="text-sm text-gray-500">
                    Last sent: {new Date(template.lastSent).toLocaleDateString()}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Template Detail Modal would go here */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">{selectedTemplate.name}</h3>
              <Button variant="ghost" onClick={() => setSelectedTemplate(null)}>
                ×
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Channels</h4>
                <div className="flex gap-2 mt-2">
                  {selectedTemplate.channels.map(channel => (
                    <Badge key={channel} variant="outline">
                      {channel.replace('_', '-')}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium">Content Preview</h4>
                <div className="bg-gray-50 p-4 rounded mt-2">
                  <div className="font-medium mb-2">{selectedTemplate.subject}</div>
                  <div className="text-sm">{selectedTemplate.content}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">Sent Count</h4>
                  <p className="text-2xl font-bold text-blue-600">{selectedTemplate.sentCount}</p>
                </div>
                <div>
                  <h4 className="font-medium">Success Rate</h4>
                  <p className="text-2xl font-bold text-green-600">{selectedTemplate.successRate}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Notification Trigger System
interface NotificationTriggerSystemProps {
  triggers: NotificationTrigger[]
  onCreateTrigger: (trigger: Omit<NotificationTrigger, 'id' | 'triggeredCount' | 'lastTriggered'>) => void
  onUpdateTrigger: (id: string, trigger: Partial<NotificationTrigger>) => void
  onDeleteTrigger: (id: string) => void
}

function NotificationTriggerSystem({ 
  triggers, 
  onCreateTrigger, 
  onUpdateTrigger, 
  onDeleteTrigger 
}: NotificationTriggerSystemProps) {
  const [selectedTrigger, setSelectedTrigger] = useState<NotificationTrigger | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const triggerTypes = [
    { value: 'enquiry_created', label: 'New Enquiry', icon: <Bell className="h-4 w-4" /> },
    { value: 'enquiry_assigned', label: 'Enquiry Assigned', icon: <Users className="h-4 w-4" /> },
    { value: 'enquiry_escalated', label: 'Escalation', icon: <AlertCircle className="h-4 w-4" /> },
    { value: 'enquiry_resolved', label: 'Enquiry Resolved', icon: <CheckCircle className="h-4 w-4" /> },
    { value: 'survey_sent', label: 'Survey Sent', icon: <MessageSquare className="h-4 w-4" /> },
    { value: 'sla_breach', label: 'SLA Breach', icon: <Clock className="h-4 w-4" /> }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Notification Trigger System</h2>
          <p className="text-gray-600">Configure automated triggers for all communication events</p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setIsCreating(true)}
        >
          <Zap className="h-4 w-4 mr-2" />
          Create Trigger
        </Button>
      </div>

      {/* Trigger Types Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {triggerTypes.map(triggerType => {
          const trigger = triggers.find(t => t.type === triggerType.value)
          return (
            <Card 
              key={triggerType.value} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => trigger && setSelectedTrigger(trigger)}
            >
              <CardContent className="p-4 text-center">
                <div className="flex justify-center mb-2">
                  {triggerType.icon}
                </div>
                <h3 className="font-medium text-sm">{triggerType.label}</h3>
                <p className="text-xs text-gray-600 mt-1">
                  {trigger ? `${trigger.triggeredCount} times` : 'Not configured'}
                </p>
                {trigger && (
                  <Badge 
                    variant={trigger.isActive ? "default" : "secondary"} 
                    className="mt-2 text-xs"
                  >
                    {trigger.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Active Triggers List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Active Triggers</h3>
        {triggers.filter(t => t.isActive).map(trigger => (
          <Card key={trigger.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {triggerTypes.find(t => t.value === trigger.type)?.icon}
                    {trigger.name}
                  </CardTitle>
                  <CardDescription>{trigger.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {trigger.triggeredCount} triggered
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onUpdateTrigger(trigger.id, { isActive: !trigger.isActive })}
                  >
                    {trigger.isActive ? 'Disable' : 'Enable'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {trigger.channels.map(channel => (
                    <Badge key={channel} variant="secondary" className="text-xs">
                      {channel.replace('_', '-')}
                    </Badge>
                  ))}
                </div>
                <div className="text-sm text-gray-600">
                  Recipients: {trigger.recipients.join(', ')}
                </div>
                {trigger.lastTriggered && (
                  <div className="text-sm text-gray-500">
                    Last triggered: {new Date(trigger.lastTriggered).toLocaleString()}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Real-time Notification Center
function RealTimeNotificationCenter() {
  const [notifications, setNotifications] = useState<MultiChannelNotification[]>([])
  const [isConnected, setIsConnected] = useState(false)

  // Simulate real-time updates
  useEffect(() => {
    const mockNotifications: MultiChannelNotification[] = [
      {
        id: '1',
        type: 'email',
        title: 'New Enquiry Received',
        message: 'General enquiry from John Doe about appointment booking',
        priority: 'normal',
        status: 'sent',
        recipient: 'staff@clinic.com',
        sentAt: new Date(),
        read: false,
        trigger: 'enquiry_created'
      },
      {
        id: '2',
        type: 'sms',
        title: 'Urgent Escalation',
        message: 'Urgent complaint requires immediate attention',
        priority: 'high',
        status: 'delivered',
        recipient: '+6591234567',
        sentAt: new Date(Date.now() - 300000),
        read: true,
        trigger: 'enquiry_escalated'
      }
    ]
    
    setNotifications(mockNotifications)
    setIsConnected(true)

    // Simulate new notifications
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newNotification: MultiChannelNotification = {
          id: Date.now().toString(),
          type: ['email', 'sms', 'push'][Math.floor(Math.random() * 3)] as CommunicationChannel,
          title: 'System Alert',
          message: 'Automated system notification',
          priority: Math.random() > 0.8 ? 'high' : 'normal',
          status: 'sent',
          recipient: 'system@clinic.com',
          sentAt: new Date(),
          read: false,
          trigger: 'system_alert'
        }
        
        setNotifications(prev => [newNotification, ...prev.slice(0, 9)])
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const getChannelIcon = (type: CommunicationChannel) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4 text-blue-600" />
      case 'sms': return <MessageSquare className="h-4 w-4 text-green-600" />
      case 'push': return <Smartphone className="h-4 w-4 text-purple-600" />
      case 'in_app': return <Bell className="h-4 w-4 text-orange-600" />
    }
  }

  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case 'low': return 'border-l-blue-400'
      case 'normal': return 'border-l-gray-400'
      case 'high': return 'border-l-orange-400'
      case 'urgent': return 'border-l-red-400'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Real-Time Notification Center</h2>
          <p className="text-gray-600">Monitor all notification activities and delivery status</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-600">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Connection Status */}
      <Alert className={isConnected ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
        <Bell className="h-4 w-4" />
        <AlertDescription className={isConnected ? "text-green-800" : "text-red-800"}>
          {isConnected 
            ? 'Real-time notifications are active and monitoring all channels' 
            : 'Connection lost. Attempting to reconnect...'}
        </AlertDescription>
      </Alert>

      {/* Notification Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Live Notification Feed
          </CardTitle>
          <CardDescription>
            Real-time updates from all communication channels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {notifications.map(notification => (
                <div 
                  key={notification.id}
                  className={`p-4 border-l-4 bg-white rounded-r-lg shadow-sm hover:shadow-md transition-shadow ${getPriorityColor(notification.priority)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getChannelIcon(notification.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{notification.recipient}</span>
                          <span>{notification.sentAt.toLocaleTimeString()}</span>
                          <Badge variant="outline" className="text-xs">
                            {notification.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {notification.priority === 'urgent' && (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      {notification.status === 'delivered' && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Channel Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { channel: 'email', status: 'operational', rate: 98.5 },
          { channel: 'sms', status: 'operational', rate: 99.2 },
          { channel: 'push', status: 'degraded', rate: 95.1 },
          { channel: 'in_app', status: 'operational', rate: 100 }
        ].map(({ channel, status, rate }) => (
          <Card key={channel}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getChannelIcon(channel as CommunicationChannel)}
                  <span className="font-medium capitalize">{channel}</span>
                </div>
                <Badge variant={status === 'operational' ? 'default' : 'destructive'} className="text-xs">
                  {status}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Success Rate</span>
                  <span className="font-medium">{rate}%</span>
                </div>
                <Progress value={rate} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Multi-Channel Integration Dashboard
function MultiChannelIntegrationDashboard() {
  const [selectedChannel, setSelectedChannel] = useState<CommunicationChannel>('email')
  const [channelConfig, setChannelConfig] = useState({
    email: { enabled: true, provider: 'SendGrid', rate: 1000 },
    sms: { enabled: true, provider: 'Twilio', rate: 100 },
    push: { enabled: true, provider: 'Firebase', rate: 500 },
    in_app: { enabled: true, provider: 'Internal', rate: 0 }
  })

  const channelSettings = {
    email: {
      title: 'Email Integration',
      description: 'Configure SMTP settings and email templates',
      icon: <Mail className="h-6 w-6 text-blue-600" />,
      config: [
        { key: 'smtp_host', label: 'SMTP Host', value: 'smtp.sendgrid.net' },
        { key: 'smtp_port', label: 'SMTP Port', value: '587' },
        { key: 'api_key', label: 'API Key', value: '••••••••••••' },
        { key: 'from_address', label: 'From Address', value: 'noreply@healthier-sg.com' }
      ]
    },
    sms: {
      title: 'SMS Integration',
      description: 'Configure SMS provider and messaging settings',
      icon: <MessageSquare className="h-6 w-6 text-green-600" />,
      config: [
        { key: 'provider', label: 'Provider', value: 'Twilio' },
        { key: 'account_sid', label: 'Account SID', value: 'AC••••••••••••' },
        { key: 'auth_token', label: 'Auth Token', value: '••••••••••••' },
        { key: 'from_number', label: 'From Number', value: '+1234567890' }
      ]
    },
    push: {
      title: 'Push Notifications',
      description: 'Configure mobile and web push notifications',
      icon: <Smartphone className="h-6 w-6 text-purple-600" />,
      config: [
        { key: 'provider', label: 'Provider', value: 'Firebase FCM' },
        { key: 'server_key', label: 'Server Key', value: 'AIza••••••••••••' },
        { key: 'project_id', label: 'Project ID', value: 'healthier-sg' },
        { key: 'api_key', label: 'API Key', value: '••••••••••••' }
      ]
    },
    in_app: {
      title: 'In-App Messaging',
      description: 'Configure in-browser and mobile app notifications',
      icon: <Bell className="h-6 w-6 text-orange-600" />,
      config: [
        { key: 'provider', label: 'Provider', value: 'Internal System' },
        { key: 'websocket_url', label: 'WebSocket URL', value: 'wss://api.healthier-sg.com/ws' },
        { key: 'api_endpoint', label: 'API Endpoint', value: 'https://api.healthier-sg.com/notifications' },
        { key: 'auth_token', label: 'Auth Token', value: '••••••••••••' }
      ]
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Multi-Channel Integration Dashboard</h2>
        <p className="text-gray-600">Configure and monitor all communication channels</p>
      </div>

      {/* Channel Selection */}
      <div className="flex gap-2">
        {Object.entries(channelSettings).map(([channel, settings]) => (
          <Button
            key={channel}
            variant={selectedChannel === channel ? "default" : "outline"}
            onClick={() => setSelectedChannel(channel as CommunicationChannel)}
            className="flex items-center gap-2"
          >
            {settings.icon}
            {settings.title}
          </Button>
        ))}
      </div>

      {/* Channel Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            {channelSettings[selectedChannel].icon}
            <div>
              <CardTitle>{channelSettings[selectedChannel].title}</CardTitle>
              <CardDescription>{channelSettings[selectedChannel].description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium">Channel Status</h3>
                <p className="text-sm text-gray-600">
                  {channelConfig[selectedChannel].enabled ? 'Enabled and operational' : 'Disabled'}
                </p>
              </div>
              <Button
                variant={channelConfig[selectedChannel].enabled ? "destructive" : "default"}
                onClick={() => setChannelConfig(prev => ({
                  ...prev,
                  [selectedChannel]: {
                    ...prev[selectedChannel],
                    enabled: !prev[selectedChannel].enabled
                  }
                }))}
              >
                {channelConfig[selectedChannel].enabled ? 'Disable' : 'Enable'}
              </Button>
            </div>

            <div className="space-y-3">
              {channelSettings[selectedChannel].config.map((item) => (
                <div key={item.key} className="grid grid-cols-3 gap-4 p-3 border rounded">
                  <Label className="font-medium">{item.label}</Label>
                  <div className="col-span-2">
                    <Input value={item.value} readOnly className="bg-gray-50" />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline">Test Connection</Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Save Configuration
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Daily Limit</p>
                <p className="text-2xl font-bold">
                  {channelConfig[selectedChannel].rate} / day
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Usage</p>
                <p className="text-2xl font-bold">247</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold">98.5%</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Main Multi-Channel Notification System Component
export function MultiChannelNotificationSystem() {
  const [activeTab, setActiveTab] = useState('templates')

  return (
    <div className="space-y-6">
      <div className="border-b">
        <h1 className="text-3xl font-bold">Multi-Channel Notification System</h1>
        <p className="text-gray-600 mt-2">
          Comprehensive communication system supporting email, SMS, push, and in-app notifications
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="triggers">Triggers</TabsTrigger>
          <TabsTrigger value="real-time">Real-time</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
        </TabsList>

        <TabsContent value="templates">
          <NotificationTemplateManager
            templates={[
              {
                id: '1',
                name: 'Enquiry Acknowledgment',
                subject: 'Thank you for contacting us',
                content: 'Dear {{customerName}}, we have received your enquiry...',
                channels: ['email', 'sms'],
                variables: ['customerName', 'enquiryId'],
                isActive: true,
                successRate: 98.5,
                sentCount: 1247,
                createdAt: new Date(),
                updatedAt: new Date()
              },
              {
                id: '2',
                name: 'Urgent Escalation Alert',
                subject: 'URGENT: Immediate attention required',
                content: 'An urgent enquiry requires immediate attention...',
                channels: ['sms', 'push', 'in_app'],
                variables: ['enquiryId', 'customerName', 'priority'],
                isActive: true,
                successRate: 99.8,
                sentCount: 89,
                createdAt: new Date(),
                updatedAt: new Date()
              }
            ]}
            onCreateTemplate={(template) => console.log('Create template:', template)}
            onUpdateTemplate={(id, template) => console.log('Update template:', id, template)}
            onDeleteTemplate={(id) => console.log('Delete template:', id)}
          />
        </TabsContent>

        <TabsContent value="triggers">
          <NotificationTriggerSystem
            triggers={[
              {
                id: '1',
                name: 'New Enquiry Alert',
                type: 'enquiry_created',
                description: 'Send notification when new enquiry is received',
                conditions: {
                  priority: ['HIGH', 'URGENT'],
                  type: ['COMPLAINT', 'TECHNICAL']
                },
                channels: ['email', 'sms'],
                recipients: ['staff@clinic.com', '+6591234567'],
                templateId: '1',
                isActive: true,
                triggeredCount: 156,
                lastTriggered: new Date(),
                createdAt: new Date()
              },
              {
                id: '2',
                name: 'Escalation Warning',
                type: 'enquiry_escalated',
                description: 'Alert managers when enquiry is escalated',
                conditions: {
                  priority: ['URGENT']
                },
                channels: ['email', 'push', 'in_app'],
                recipients: ['manager@clinic.com', 'supervisor@clinic.com'],
                templateId: '2',
                isActive: true,
                triggeredCount: 23,
                lastTriggered: new Date(),
                createdAt: new Date()
              }
            ]}
            onCreateTrigger={(trigger) => console.log('Create trigger:', trigger)}
            onUpdateTrigger={(id, trigger) => console.log('Update trigger:', id, trigger)}
            onDeleteTrigger={(id) => console.log('Delete trigger:', id)}
          />
        </TabsContent>

        <TabsContent value="real-time">
          <RealTimeNotificationCenter />
        </TabsContent>

        <TabsContent value="integration">
          <MultiChannelIntegrationDashboard />
        </TabsContent>
      </Tabs>
    </div>
  )
}