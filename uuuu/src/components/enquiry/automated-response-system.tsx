"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Send, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Mail, 
  MessageSquare, 
  Phone, 
  Bell, 
  Template, 
  Bot, 
  Users, 
  TrendingUp, 
  Zap, 
  Target,
  Settings,
  Plus,
  Edit,
  Copy,
  Trash2,
  Eye,
  BarChart3
} from 'lucide-react'
import { 
  EnquiryData, 
  EnquiryResponseTemplate, 
  AutomatedWorkflow, 
  ResponseTimeEstimation,
  MultiChannelNotification,
  AcknowledgmentSystem,
  WorkflowTrigger,
  TemplateVariable
} from './types'

// Template Management System
interface TemplateManagerProps {
  templates: EnquiryResponseTemplate[]
  onCreateTemplate: (template: Omit<EnquiryResponseTemplate, 'id' | 'usageCount' | 'lastUsed'>) => void
  onUpdateTemplate: (id: string, template: Partial<EnquiryResponseTemplate>) => void
  onDeleteTemplate: (id: string) => void
  onDuplicateTemplate: (id: string) => void
}

function TemplateManager({ templates, onCreateTemplate, onUpdateTemplate, onDeleteTemplate, onDuplicateTemplate }: TemplateManagerProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<EnquiryResponseTemplate | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [templateFilter, setTemplateFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(false)

  const templateCategories = [
    { value: 'all', label: 'All Templates' },
    { value: 'GENERAL', label: 'General' },
    { value: 'APPOINTMENT', label: 'Appointment' },
    { value: 'HEALTHIER_SG', label: 'Healthier SG' },
    { value: 'COMPLAINT', label: 'Complaint' },
    { value: 'FEEDBACK', label: 'Feedback' }
  ]

  const filteredTemplates = templateFilter === 'all' 
    ? templates 
    : templates.filter(t => t.category === templateFilter)

  const [newTemplate, setNewTemplate] = useState<Omit<EnquiryResponseTemplate, 'id' | 'usageCount' | 'lastUsed'>>({
    name: '',
    category: 'GENERAL',
    subject: '',
    content: '',
    variables: [],
    isActive: true,
    createdBy: 'system',
    createdAt: new Date(),
    updatedAt: new Date()
  })

  const handleCreateTemplate = async () => {
    setIsLoading(true)
    try {
      await onCreateTemplate(newTemplate)
      setIsCreateDialogOpen(false)
      setNewTemplate({
        name: '',
        category: 'GENERAL',
        subject: '',
        content: '',
        variables: [],
        isActive: true,
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Failed to create template:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Response Template Manager</h2>
          <p className="text-gray-600">Create and manage intelligent response templates</p>
        </div>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Label htmlFor="category-filter">Filter by Category:</Label>
        <Select value={templateFilter} onValueChange={setTemplateFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {templateCategories.map(category => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map(template => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <Badge variant="outline" className="mt-1">
                    {template.category}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onDuplicateTemplate(template.id)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onDeleteTemplate(template.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Subject:</Label>
                  <p className="text-sm text-gray-600 truncate">{template.subject}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={template.isActive ? "default" : "secondary"}>
                      {template.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      Used {template.usageCount} times
                    </span>
                  </div>
                </div>
                {template.lastUsed && (
                  <div className="text-sm text-gray-500">
                    Last used: {new Date(template.lastUsed).toLocaleDateString()}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Template Preview Dialog */}
      <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Template Preview: {selectedTemplate?.name}</DialogTitle>
            <DialogDescription>
              Review and manage this response template
            </DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Subject</Label>
                    <p className="text-sm bg-gray-50 p-2 rounded">{selectedTemplate.subject}</p>
                  </div>
                  <div>
                    <Label>Category</Label>
                    <p className="text-sm bg-gray-50 p-2 rounded">{selectedTemplate.category}</p>
                  </div>
                </div>
                <div>
                  <Label>Content</Label>
                  <div className="text-sm bg-gray-50 p-4 rounded border max-h-64 overflow-y-auto">
                    {selectedTemplate.content}
                  </div>
                </div>
                {selectedTemplate.variables.length > 0 && (
                  <div>
                    <Label>Variables Used</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedTemplate.variables.map(variable => (
                        <Badge key={variable} variant="outline" className="text-xs">
                          {`{${variable}}`}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => onUpdateTemplate(selectedTemplate.id, { 
                      isActive: !selectedTemplate.isActive 
                    })}
                  >
                    {selectedTemplate.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button onClick={() => setSelectedTemplate(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Template Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
            <DialogDescription>
              Design a new automated response template
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4">
              <div>
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  placeholder="e.g., General Enquiry Acknowledgment"
                />
              </div>
              <div>
                <Label htmlFor="template-category">Category</Label>
                <Select 
                  value={newTemplate.category} 
                  onValueChange={(value) => setNewTemplate({ ...newTemplate, category: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {templateCategories.slice(1).map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="template-subject">Email Subject</Label>
                <Input
                  id="template-subject"
                  value={newTemplate.subject}
                  onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                  placeholder="e.g., Thank you for contacting us about {{subject}}"
                />
              </div>
              <div>
                <Label htmlFor="template-content">Email Content</Label>
                <Textarea
                  id="template-content"
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                  rows={8}
                  placeholder="Dear {{customerName}},&#10;&#10;Thank you for contacting us about {{enquirySubject}}. We have received your enquiry and will respond within {{estimatedResponseTime}}.&#10;&#10;Best regards,&#10;Healthcare Support Team"
                />
              </div>
              <div>
                <Label>Template Variables</Label>
                <p className="text-sm text-gray-600 mb-2">
                  Use these variables in your template: customerName, enquiryId, subject, estimatedResponseTime, clinicName, staffName
                </p>
                <div className="flex flex-wrap gap-2">
                  {['customerName', 'enquiryId', 'subject', 'estimatedResponseTime', 'clinicName', 'staffName'].map(variable => (
                    <Badge 
                      key={variable} 
                      variant="outline" 
                      className="cursor-pointer hover:bg-blue-50"
                      onClick={() => {
                        const variables = newTemplate.variables.includes(variable) 
                          ? newTemplate.variables.filter(v => v !== variable)
                          : [...newTemplate.variables, variable]
                        setNewTemplate({ ...newTemplate, variables })
                      }}
                    >
                      {`{${variable}}`}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateTemplate}
              disabled={isLoading || !newTemplate.name || !newTemplate.subject}
            >
              {isLoading ? 'Creating...' : 'Create Template'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Response Time Calculator
interface ResponseTimeCalculatorProps {
  enquiry: EnquiryData
  staffAvailability: Array<{
    staffId: string
    staffName: string
    currentWorkload: number
    responseTime: number
  }>
}

function ResponseTimeCalculator({ enquiry, staffAvailability }: ResponseTimeCalculatorProps) {
  const [estimatedTime, setEstimatedTime] = useState<ResponseTimeEstimation | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const calculateResponseTime = async () => {
    setIsCalculating(true)
    
    // Simulate API call to calculate response time
    setTimeout(() => {
      const baseTimeByType = {
        'GENERAL': 4,
        'APPOINTMENT': 2,
        'HEALTHIER_SG': 6,
        'CLINIC_INFORMATION': 3,
        'DOCTOR_INFORMATION': 4,
        'SERVICE_INFORMATION': 3,
        'COMPLAINT': 1,
        'FEEDBACK': 8
      }

      const baseTime = baseTimeByType[enquiry.type] || 4

      // Adjust based on priority
      const priorityMultiplier = {
        'LOW': 1.5,
        'NORMAL': 1.0,
        'HIGH': 0.5,
        'URGENT': 0.25
      }[enquiry.priority] || 1.0

      // Adjust based on staff availability
      const availableStaff = staffAvailability.filter(s => s.currentWorkload < 5)
      const avgWorkload = availableStaff.length > 0 
        ? availableStaff.reduce((sum, s) => sum + s.currentWorkload, 0) / availableStaff.length
        : 3

      const workloadAdjustment = Math.max(0.5, 1 - (avgWorkload * 0.1))

      const estimated = {
        hours: Math.round(baseTime * priorityMultiplier * workloadAdjustment),
        businessDays: Math.ceil((baseTime * priorityMultiplier * workloadAdjustment) / 8),
        confidence: Math.min(95, 70 + (availableStaff.length * 5)),
        factors: [
          `Base time for ${enquiry.type}: ${baseTime} hours`,
          `Priority adjustment: ${Math.round((1 - priorityMultiplier) * 100)}% faster`,
          `Staff availability: ${availableStaff.length} staff available`,
          `Current workload impact: ${Math.round((1 - workloadAdjustment) * 100)}% delay`
        ]
      }

      setEstimatedTime(estimated)
      setIsCalculating(false)
    }, 1500)
  }

  useEffect(() => {
    calculateResponseTime()
  }, [enquiry, staffAvailability])

  if (isCalculating) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 animate-spin" />
            Calculating Response Time...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Analyzing workload, priority, and staff availability...</p>
        </CardContent>
      </Card>
    )
  }

  if (!estimatedTime) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Unable to Calculate</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Could not determine estimated response time</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          Response Time Estimate
        </CardTitle>
        <CardDescription>
          Calculated based on enquiry type, priority, and current staff availability
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {estimatedTime.hours}h
              </div>
              <div className="text-sm text-gray-600">Estimated Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {estimatedTime.businessDays}d
              </div>
              <div className="text-sm text-gray-600">Business Days</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {estimatedTime.confidence}%
              </div>
              <div className="text-sm text-gray-600">Confidence</div>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Calculation Factors:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {estimatedTime.factors.map((factor, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                  {factor}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Automated Acknowledgment System
interface AutomatedAcknowledgmentSystemProps {
  enquiry: EnquiryData
  isEnabled: boolean
  onToggle: (enabled: boolean) => void
  onSendCustom: (message: string) => void
  templates: EnquiryResponseTemplate[]
}

function AutomatedAcknowledgmentSystem({ 
  enquiry, 
  isEnabled, 
  onToggle, 
  onSendCustom, 
  templates 
}: AutomatedAcknowledgmentSystemProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<EnquiryResponseTemplate | null>(null)
  const [customMessage, setCustomMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [acknowledgmentSent, setAcknowledgmentSent] = useState(false)
  const [sentAt, setSentAt] = useState<Date | null>(null)

  const relevantTemplates = templates.filter(t => 
    t.category === enquiry.type && t.isActive
  )

  const handleSendAcknowledgment = async (template: EnquiryResponseTemplate | null = null) => {
    setIsSending(true)
    
    try {
      // Simulate API call to send acknowledgment
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setSentAt(new Date())
      setAcknowledgmentSent(true)
      
      if (template) {
        // Update template usage
        // In real implementation, this would call the API
        console.log('Template used:', template.name)
      }
    } catch (error) {
      console.error('Failed to send acknowledgment:', error)
    } finally {
      setIsSending(false)
    }
  }

  const handleSendCustom = () => {
    if (customMessage.trim()) {
      onSendCustom(customMessage)
      setCustomMessage('')
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-green-600" />
              Automated Acknowledgment System
            </CardTitle>
            <CardDescription>
              Send immediate confirmations to customers
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="acknowledgment-enabled" className="text-sm">
              {isEnabled ? 'Enabled' : 'Disabled'}
            </Label>
            <Switch
              id="acknowledgment-enabled"
              checked={isEnabled}
              onCheckedChange={onToggle}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isEnabled && !acknowledgmentSent ? (
          <div className="space-y-4">
            <Alert>
              <Bot className="h-4 w-4" />
              <AlertDescription>
                Send an automatic acknowledgment to {enquiry.name} about their enquiry: "{enquiry.subject}"
              </AlertDescription>
            </Alert>

            {relevantTemplates.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Recommended Templates</h4>
                <div className="space-y-2">
                  {relevantTemplates.map(template => (
                    <div 
                      key={template.id}
                      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-sm text-gray-600">{template.subject}</div>
                        </div>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSendAcknowledgment(template)
                          }}
                          disabled={isSending}
                        >
                          {isSending ? 'Sending...' : 'Send'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="font-medium mb-3">Custom Message</h4>
              <Textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Write a custom acknowledgment message..."
                rows={4}
              />
              <div className="flex justify-end mt-2">
                <Button
                  onClick={handleSendCustom}
                  disabled={!customMessage.trim() || isSending}
                  variant="outline"
                >
                  {isSending ? 'Sending...' : 'Send Custom'}
                </Button>
              </div>
            </div>
          </div>
        ) : acknowledgmentSent ? (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Acknowledgment sent successfully to {enquiry.email} at {sentAt?.toLocaleTimeString()}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="text-center py-8">
            <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Automated acknowledgments are disabled</p>
            <Button 
              variant="outline" 
              className="mt-2"
              onClick={() => onToggle(true)}
            >
              Enable Automation
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Main Component
interface AutomatedResponseSystemProps {
  enquiry: EnquiryData
  staffAvailability: Array<{
    staffId: string
    staffName: string
    currentWorkload: number
    responseTime: number
  }>
  templates: EnquiryResponseTemplate[]
  onCreateTemplate: (template: Omit<EnquiryResponseTemplate, 'id' | 'usageCount' | 'lastUsed'>) => void
  onUpdateTemplate: (id: string, template: Partial<EnquiryResponseTemplate>) => void
  onDeleteTemplate: (id: string) => void
  onDuplicateTemplate: (id: string) => void
}

export function AutomatedResponseSystem({
  enquiry,
  staffAvailability,
  templates,
  onCreateTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  onDuplicateTemplate
}: AutomatedResponseSystemProps) {
  const [activeTab, setActiveTab] = useState('templates')
  const [isAcknowledgmentEnabled, setIsAcknowledgmentEnabled] = useState(true)

  return (
    <div className="space-y-6">
      <div className="border-b">
        <h1 className="text-3xl font-bold">Automated Response & Confirmation Workflows</h1>
        <p className="text-gray-600 mt-2">
          Intelligent automation system for efficient enquiry handling and customer communication
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="acknowledgment">Acknowledgment</TabsTrigger>
          <TabsTrigger value="response-time">Response Time</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <TemplateManager
            templates={templates}
            onCreateTemplate={onCreateTemplate}
            onUpdateTemplate={onUpdateTemplate}
            onDeleteTemplate={onDeleteTemplate}
            onDuplicateTemplate={onDuplicateTemplate}
          />
        </TabsContent>

        <TabsContent value="acknowledgment" className="space-y-6">
          <AutomatedAcknowledgmentSystem
            enquiry={enquiry}
            isEnabled={isAcknowledgmentEnabled}
            onToggle={setIsAcknowledgmentEnabled}
            onSendCustom={(message) => console.log('Custom message:', message)}
            templates={templates}
          />
        </TabsContent>

        <TabsContent value="response-time" className="space-y-6">
          <ResponseTimeCalculator
            enquiry={enquiry}
            staffAvailability={staffAvailability}
          />
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  Smart Escalation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Automatically escalate enquiries based on time, priority, and complexity
                </p>
                <Button variant="outline" className="w-full">
                  Configure Rules
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-blue-600" />
                  Follow-up System
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Schedule and send automated follow-ups and reminders
                </p>
                <Button variant="outline" className="w-full">
                  Manage Follow-ups
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  Multi-Channel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Send notifications via email, SMS, and in-app messaging
                </p>
                <Button variant="outline" className="w-full">
                  Configure Channels
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Templates Created</p>
                    <p className="text-2xl font-bold">{templates.length}</p>
                  </div>
                  <Template className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                    <p className="text-2xl font-bold">4.2h</p>
                  </div>
                  <Clock className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Auto-Response Rate</p>
                    <p className="text-2xl font-bold">78%</p>
                  </div>
                  <Bot className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Customer Satisfaction</p>
                    <p className="text-2xl font-bold">4.6★</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}