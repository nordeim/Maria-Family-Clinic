"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Users, 
  UserCheck, 
  UserX, 
  Mail, 
  Phone, 
  MessageSquare, 
  Calendar, 
  Star, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Clock, 
  Target, 
  Award, 
  BarChart3, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  RefreshCw,
  ExternalLink,
  Shield,
  Database,
  Zap,
  Search,
  Filter,
  Download
} from 'lucide-react'
import { 
  CRMIntegration,
  CustomerJourney,
  CustomerInteraction,
  CRMAnalytics,
  CustomerSegment,
  CustomerLifetimeValue,
  RetentionMetrics,
  InteractionHistory
} from './types'

// Customer Journey Timeline
interface CustomerJourneyTimelineProps {
  journey: CustomerJourney
  onInteractionClick: (interaction: CustomerInteraction) => void
}

function CustomerJourneyTimeline({ journey, onInteractionClick }: CustomerJourneyTimelineProps) {
  const [selectedInteraction, setSelectedInteraction] = useState<CustomerInteraction | null>(null)

  const getInteractionIcon = (type: CustomerInteraction['type']) => {
    switch (type) {
      case 'enquiry': return <MessageSquare className="h-4 w-4 text-blue-600" />
      case 'appointment': return <Calendar className="h-4 w-4 text-green-600" />
      case 'followup': return <Phone className="h-4 w-4 text-purple-600" />
      case 'survey': return <Star className="h-4 w-4 text-yellow-600" />
      case 'call': return <Phone className="h-4 w-4 text-orange-600" />
    }
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return <Mail className="h-3 w-3" />
      case 'sms': return <MessageSquare className="h-3 w-3" />
      case 'in_app': return <Activity className="h-3 w-3" />
      case 'phone': return <Phone className="h-3 w-3" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RESOLVED': return 'text-green-600 bg-green-100'
      case 'IN_PROGRESS': return 'text-blue-600 bg-blue-100'
      case 'PENDING': return 'text-yellow-600 bg-yellow-100'
      case 'CLOSED': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold">Customer Journey: {journey.customerName}</h3>
          <p className="text-gray-600">Complete interaction history and timeline</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync
          </Button>
        </div>
      </div>

      {/* Customer Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Interactions</p>
                <p className="text-2xl font-bold">{journey.interactions.length}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Enquiries</p>
                <p className="text-2xl font-bold">{journey.totalEnquiries}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold">{Math.round(journey.averageResponseTime)}h</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Satisfaction</p>
                <p className="text-2xl font-bold">{journey.satisfactionScore.toFixed(1)}★</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Journey Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Interaction Timeline
          </CardTitle>
          <CardDescription>
            Chronological view of all customer interactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {journey.interactions
                .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                .map((interaction, index) => (
                  <div 
                    key={interaction.id}
                    className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setSelectedInteraction(interaction)
                      onInteractionClick(interaction)
                    }}
                  >
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center">
                        {getInteractionIcon(interaction.type)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm capitalize">{interaction.type}</h4>
                          <div className="flex items-center gap-1">
                            {getChannelIcon(interaction.channel)}
                            <span className="text-xs text-gray-500 capitalize">{interaction.channel.replace('_', '-')}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`text-xs ${getStatusColor(interaction.status)}`}>
                            {interaction.status}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {interaction.timestamp.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{interaction.subject}</p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                          {interaction.staffMember && (
                            <span>Staff: {interaction.staffMember}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {interaction.satisfaction && (
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span>{interaction.satisfaction}/5</span>
                            </div>
                          )}
                          <span>{interaction.timestamp.toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Interaction Detail Modal */}
      {selectedInteraction && (
        <Dialog open={!!selectedInteraction} onOpenChange={() => setSelectedInteraction(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getInteractionIcon(selectedInteraction.type)}
                Interaction Details
              </DialogTitle>
              <DialogDescription>
                {selectedInteraction.type} • {selectedInteraction.timestamp.toLocaleString()}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <p className="text-sm bg-gray-50 p-2 rounded capitalize">{selectedInteraction.type}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Channel</Label>
                  <p className="text-sm bg-gray-50 p-2 rounded capitalize">{selectedInteraction.channel.replace('_', '-')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge variant="outline" className={getStatusColor(selectedInteraction.status)}>
                    {selectedInteraction.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Satisfaction</Label>
                  <p className="text-sm bg-gray-50 p-2 rounded">
                    {selectedInteraction.satisfaction ? `${selectedInteraction.satisfaction}/5` : 'Not rated'}
                  </p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Subject</Label>
                <p className="text-sm bg-gray-50 p-2 rounded">{selectedInteraction.subject}</p>
              </div>
              
              {selectedInteraction.notes && (
                <div>
                  <Label className="text-sm font-medium">Notes</Label>
                  <p className="text-sm bg-gray-50 p-2 rounded">{selectedInteraction.notes}</p>
                </div>
              )}
              
              {selectedInteraction.staffMember && (
                <div>
                  <Label className="text-sm font-medium">Assigned Staff</Label>
                  <p className="text-sm bg-gray-50 p-2 rounded">{selectedInteraction.staffMember}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

// CRM Integration Manager
interface CRMIntegrationManagerProps {
  integrations: CRMIntegration[]
  onUpdateIntegration: (id: string, integration: Partial<CRMIntegration>) => void
  onCreateIntegration: (integration: Omit<CRMIntegration, 'id'>) => void
  onDeleteIntegration: (id: string) => void
}

function CRMIntegrationManager({ 
  integrations, 
  onUpdateIntegration, 
  onCreateIntegration, 
  onDeleteIntegration 
}: CRMIntegrationManagerProps) {
  const [selectedIntegration, setSelectedIntegration] = useState<CRMIntegration | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<Record<string, 'connected' | 'disconnected' | 'error'>>({})

  const crmTypes = [
    { value: 'salesforce', label: 'Salesforce', icon: '🔷' },
    { value: 'hubspot', label: 'HubSpot', icon: '🧡' },
    { value: 'zoho', label: 'Zoho CRM', icon: '🔴' },
    { value: 'internal', label: 'Internal System', icon: '⚪' }
  ]

  const testConnection = async (integrationId: string, type: string) => {
    setConnectionStatus(prev => ({ ...prev, [integrationId]: 'connected' }))
    // In real implementation, this would test the actual API connection
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">CRM Integration Management</h2>
          <p className="text-gray-600">Connect and manage customer relationship management systems</p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setIsCreating(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Integration
        </Button>
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrations.map(integration => {
          const crmType = crmTypes.find(t => t.value === integration.type)
          const status = connectionStatus[integration.id] || (integration.isActive ? 'connected' : 'disconnected')
          
          return (
            <Card key={integration.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{crmType?.icon}</div>
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <CardDescription className="capitalize">{integration.type} Integration</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      status === 'connected' ? 'bg-green-500' : 
                      status === 'error' ? 'bg-red-500' : 'bg-gray-400'
                    }`} />
                    <Switch
                      checked={integration.isActive}
                      onCheckedChange={(checked) => 
                        onUpdateIntegration(integration.id, { isActive: checked })
                      }
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Sync Interval:</span>
                      <p className="font-medium">{integration.configuration.syncInterval} min</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <p className={`font-medium capitalize ${
                        status === 'connected' ? 'text-green-600' : 
                        status === 'error' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {status}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => testConnection(integration.id, integration.type)}
                    >
                      Test Connection
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedIntegration(integration)}
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      Configure
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onDeleteIntegration(integration.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Create Integration Dialog */}
      {isCreating && (
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add CRM Integration</DialogTitle>
              <DialogDescription>
                Configure a new customer relationship management system integration
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="integration-name">Integration Name</Label>
                <Input id="integration-name" placeholder="e.g., Salesforce Production" />
              </div>
              
              <div>
                <Label>CRM Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select CRM system" />
                  </SelectTrigger>
                  <SelectContent>
                    {crmTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <span>{type.icon}</span>
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="api-endpoint">API Endpoint</Label>
                <Input id="api-endpoint" placeholder="https://api.crm-system.com/v1" />
              </div>

              <div>
                <Label htmlFor="api-key">API Key</Label>
                <Input id="api-key" type="password" placeholder="Enter API key" />
              </div>

              <div>
                <Label htmlFor="sync-interval">Sync Interval (minutes)</Label>
                <Input id="sync-interval" type="number" defaultValue="30" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsCreating(false)}>
                Create Integration
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Configuration Dialog */}
      {selectedIntegration && (
        <Dialog open={!!selectedIntegration} onOpenChange={() => setSelectedIntegration(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configure {selectedIntegration.name}
              </DialogTitle>
              <DialogDescription>
                Manage integration settings and field mappings
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-3">Connection Settings</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>API Endpoint</Label>
                      <Input value={selectedIntegration.configuration.apiEndpoint || ''} />
                    </div>
                    <div>
                      <Label>API Key</Label>
                      <Input type="password" value={selectedIntegration.configuration.apiKey || ''} />
                    </div>
                    <div>
                      <Label>Webhook URL</Label>
                      <Input value={selectedIntegration.configuration.webhookUrl || ''} />
                    </div>
                    <div>
                      <Label>Sync Interval (minutes)</Label>
                      <Input 
                        type="number" 
                        value={selectedIntegration.configuration.syncInterval}
                        onChange={(e) => onUpdateIntegration(selectedIntegration.id, {
                          configuration: {
                            ...selectedIntegration.configuration,
                            syncInterval: parseInt(e.target.value)
                          }
                        })}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Field Mappings</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm">Customer Fields</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {Object.entries(selectedIntegration.mappings.customerFields).map(([local, crm]) => (
                          <div key={local} className="flex gap-2">
                            <Input value={local} placeholder="Local field" readOnly />
                            <span className="self-center">→</span>
                            <Input value={crm} placeholder="CRM field" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

// Customer Segmentation
function CustomerSegmentation() {
  const [segments, setSegments] = useState<CustomerSegment[]>([])
  const [selectedSegment, setSelectedSegment] = useState<CustomerSegment | null>(null)

  // Mock customer segments
  const mockSegments: CustomerSegment[] = [
    {
      id: '1',
      name: 'High Value Customers',
      description: 'Customers with high lifetime value and frequent interactions',
      criteria: {
        lifetimeValue: { min: 1000, operator: 'greater_than' },
        interactionCount: { min: 5, operator: 'greater_than' },
        satisfactionScore: { min: 4, operator: 'greater_than' }
      },
      customerCount: 45,
      averageValue: 2850,
      color: '#10B981'
    },
    {
      id: '2',
      name: 'At-Risk Customers',
      description: 'Customers with declining satisfaction or no recent contact',
      criteria: {
        lastContactDays: { max: 90, operator: 'greater_than' },
        satisfactionScore: { max: 3, operator: 'less_than' }
      },
      customerCount: 12,
      averageValue: 850,
      color: '#EF4444'
    },
    {
      id: '3',
      name: 'New Customers',
      description: 'Recent customers within first 30 days',
      criteria: {
        firstContactDays: { max: 30, operator: 'less_than' }
      },
      customerCount: 28,
      averageValue: 450,
      color: '#3B82F6'
    }
  ]

  useEffect(() => {
    setSegments(mockSegments)
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Customer Segmentation</h2>
          <p className="text-gray-600">Analyze and segment customers for targeted communication</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Segment
        </Button>
      </div>

      {/* Segment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {segments.map(segment => (
          <Card 
            key={segment.id} 
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedSegment(segment)}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: segment.color }}
                />
                <CardTitle className="text-lg">{segment.name}</CardTitle>
              </div>
              <CardDescription>{segment.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Customers</span>
                  <span className="font-medium">{segment.customerCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Avg. Value</span>
                  <span className="font-medium">${segment.averageValue}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full" 
                    style={{ 
                      backgroundColor: segment.color,
                      width: `${(segment.customerCount / 100) * 100}%`
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Segment Detail Modal */}
      {selectedSegment && (
        <Dialog open={!!selectedSegment} onOpenChange={() => setSelectedSegment(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: selectedSegment.color }}
                />
                {selectedSegment.name}
              </DialogTitle>
              <DialogDescription>{selectedSegment.description}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-3">Segmentation Criteria</h3>
                <div className="space-y-2">
                  {Object.entries(selectedSegment.criteria).map(([key, criteria]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="text-sm text-gray-600">
                        {criteria.operator} {criteria.min || criteria.max}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Customer Count</h3>
                  <p className="text-2xl font-bold text-blue-600">{selectedSegment.customerCount}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Average Value</h3>
                  <p className="text-2xl font-bold text-green-600">${selectedSegment.averageValue}</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

// Main CRM Integration System
export function CRMIntegrationSystem() {
  const [activeTab, setActiveTab] = useState('journeys')
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerJourney | null>(null)
  const [integrations] = useState<CRMIntegration[]>([
    {
      id: '1',
      name: 'Salesforce Production',
      type: 'salesforce',
      isActive: true,
      configuration: {
        apiEndpoint: 'https://api.salesforce.com/v54.0',
        apiKey: 'sf_••••••••••••',
        webhookUrl: 'https://api.healthier-sg.com/webhooks/salesforce',
        syncInterval: 15
      },
      mappings: {
        customerFields: {
          email: 'Email',
          name: 'Name',
          phone: 'Phone'
        },
        enquiryFields: {
          subject: 'Subject',
          status: 'Status',
          priority: 'Priority'
        },
        customFields: {}
      }
    }
  ])

  const mockCustomerJourneys: CustomerJourney[] = [
    {
      id: '1',
      customerId: 'cust-001',
      customerName: 'John Doe',
      customerEmail: 'john.doe@example.com',
      interactions: [
        {
          id: 'int-001',
          type: 'enquiry',
          timestamp: new Date(Date.now() - 86400000),
          channel: 'email',
          subject: 'Appointment booking inquiry',
          status: 'RESOLVED',
          satisfaction: 5,
          notes: 'Very helpful staff',
          staffMember: 'Dr. Smith'
        },
        {
          id: 'int-002',
          type: 'appointment',
          timestamp: new Date(Date.now() - 43200000),
          channel: 'in_app',
          subject: 'Follow-up appointment scheduled',
          status: 'RESOLVED',
          staffMember: 'Reception Team'
        },
        {
          id: 'int-003',
          type: 'survey',
          timestamp: new Date(Date.now() - 21600000),
          channel: 'email',
          subject: 'Post-visit satisfaction survey',
          status: 'COMPLETED',
          satisfaction: 5
        }
      ],
      totalEnquiries: 1,
      resolvedEnquiries: 1,
      averageResponseTime: 2.5,
      satisfactionScore: 5.0,
      lastContact: new Date(Date.now() - 21600000),
      status: 'active'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="border-b">
        <h1 className="text-3xl font-bold">CRM Integration & Customer Journey Tracking</h1>
        <p className="text-gray-600 mt-2">
          Complete customer relationship management with journey tracking and CRM system integration
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="journeys">Customer Journeys</TabsTrigger>
          <TabsTrigger value="integrations">CRM Integrations</TabsTrigger>
          <TabsTrigger value="segments">Customer Segments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="journeys" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Customer Journey Management</h2>
            <div className="flex gap-2">
              <Button variant="outline">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          {selectedCustomer ? (
            <CustomerJourneyTimeline
              journey={selectedCustomer}
              onInteractionClick={(interaction) => console.log('Interaction clicked:', interaction)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockCustomerJourneys.map(journey => (
                <Card 
                  key={journey.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedCustomer(journey)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      {journey.customerName}
                    </CardTitle>
                    <CardDescription>{journey.customerEmail}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Status</span>
                        <Badge variant={journey.status === 'active' ? 'default' : 'secondary'}>
                          {journey.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Interactions</span>
                        <span className="font-medium">{journey.interactions.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Satisfaction</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{journey.satisfactionScore.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="integrations">
          <CRMIntegrationManager
            integrations={integrations}
            onUpdateIntegration={(id, integration) => console.log('Update integration:', id, integration)}
            onCreateIntegration={(integration) => console.log('Create integration:', integration)}
            onDeleteIntegration={(id) => console.log('Delete integration:', id)}
          />
        </TabsContent>

        <TabsContent value="segments">
          <CustomerSegmentation />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Customers</p>
                    <p className="text-2xl font-bold">1,247</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Customers</p>
                    <p className="text-2xl font-bold">892</p>
                  </div>
                  <UserCheck className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg. Lifetime Value</p>
                    <p className="text-2xl font-bold">$1,250</p>
                  </div>
                  <Target className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Retention Rate</p>
                    <p className="text-2xl font-bold">87%</p>
                  </div>
                  <Award className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Customer Engagement Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { metric: 'New Customers This Month', value: '+23%', trend: 'up', icon: <UserCheck className="h-5 w-5 text-green-600" /> },
                  { metric: 'Customer Satisfaction', value: '4.6/5', trend: 'up', icon: <Star className="h-5 w-5 text-yellow-600" /> },
                  { metric: 'Average Response Time', value: '-15%', trend: 'up', icon: <Clock className="h-5 w-5 text-blue-600" /> },
                  { metric: 'Repeat Interactions', value: '+32%', trend: 'up', icon: <Activity className="h-5 w-5 text-purple-600" /> }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span className="font-medium">{item.metric}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-green-600">{item.value}</span>
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}