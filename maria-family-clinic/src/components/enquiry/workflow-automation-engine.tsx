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
import { 
  Zap, 
  Clock, 
  Users, 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  Play, 
  Pause, 
  Settings, 
  BarChart3, 
  TrendingUp,
  Shield,
  Timer,
  Activity,
  Workflow,
  Settings2,
  Plus,
  Edit,
  Trash2,
  Eye,
  Copy
} from 'lucide-react'
import { 
  AutomatedWorkflow,
  WorkflowTrigger,
  WorkflowAction,
  WorkflowCondition,
  WorkflowExecution,
  AutomationRule,
  EscalationRule,
  FollowUpRule,
  SLAThreshold,
  WorkflowAnalytics
} from './types'

// Workflow Rule Builder
interface WorkflowRuleBuilderProps {
  onSave: (rule: Omit<AutomationRule, 'id' | 'createdAt' | 'updatedAt' | 'executionCount' | 'lastExecuted'>) => void
  existingRule?: AutomationRule
}

function WorkflowRuleBuilder({ onSave, existingRule }: WorkflowRuleBuilderProps) {
  const [rule, setRule] = useState<Omit<AutomationRule, 'id' | 'createdAt' | 'updatedAt' | 'executionCount' | 'lastExecuted'>>(
    existingRule || {
      name: '',
      description: '',
      isActive: true,
      priority: 'NORMAL',
      conditions: [],
      actions: [],
      triggers: ['enquiry_created']
    }
  )
  const [isCreatingCondition, setIsCreatingCondition] = useState(false)
  const [isCreatingAction, setIsCreatingAction] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  const conditionTypes = [
    { value: 'priority', label: 'Priority Level' },
    { value: 'type', label: 'Enquiry Type' },
    { value: 'status', label: 'Current Status' },
    { value: 'response_time', label: 'Response Time' },
    { value: 'customer_rating', label: 'Customer Rating' },
    { value: 'assignee_workload', label: 'Assignee Workload' },
    { value: 'time_of_day', label: 'Time of Day' },
    { value: 'day_of_week', label: 'Day of Week' }
  ]

  const actionTypes = [
    { value: 'send_email', label: 'Send Email' },
    { value: 'send_sms', label: 'Send SMS' },
    { value: 'assign_to_staff', label: 'Assign to Staff Member' },
    { value: 'update_priority', label: 'Update Priority' },
    { value: 'add_tag', label: 'Add Tag' },
    { value: 'schedule_followup', label: 'Schedule Follow-up' },
    { value: 'escalate', label: 'Escalate' },
    { value: 'send_notification', label: 'Send Notification' },
    { value: 'create_task', label: 'Create Task' }
  ]

  const triggerTypes = [
    { value: 'enquiry_created', label: 'New Enquiry Created' },
    { value: 'enquiry_assigned', label: 'Enquiry Assigned' },
    { value: 'response_submitted', label: 'Response Submitted' },
    { value: 'status_changed', label: 'Status Changed' },
    { value: 'sla_breach', label: 'SLA Breach' },
    { value: 'low_rating', label: 'Low Customer Rating' },
    { value: 'time_based', label: 'Time-based Trigger' }
  ]

  const addCondition = () => {
    const newCondition: WorkflowCondition = {
      id: Date.now().toString(),
      type: 'priority',
      operator: 'equals',
      value: 'HIGH'
    }
    setRule(prev => ({
      ...prev,
      conditions: [...prev.conditions, newCondition]
    }))
  }

  const addAction = () => {
    const newAction: WorkflowAction = {
      id: Date.now().toString(),
      type: 'send_email',
      parameters: {
        template: 'default',
        recipient: 'customer'
      },
      delay: 0
    }
    setRule(prev => ({
      ...prev,
      actions: [...prev.actions, newAction]
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Workflow Rule Builder</h2>
          <p className="text-gray-600">Create and manage automated workflow rules</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
            {previewMode ? 'Edit' : 'Preview'}
          </Button>
          <Button onClick={() => onSave(rule)}>
            Save Rule
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rule Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Rule Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="rule-name">Rule Name</Label>
              <Input
                id="rule-name"
                value={rule.name}
                onChange={(e) => setRule(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Urgent Enquiry Auto-Escalation"
              />
            </div>
            
            <div>
              <Label htmlFor="rule-description">Description</Label>
              <Input
                id="rule-description"
                value={rule.description}
                onChange={(e) => setRule(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of what this rule does"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rule-priority">Priority</Label>
                <Select 
                  value={rule.priority} 
                  onValueChange={(value) => setRule(prev => ({ ...prev, priority: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="NORMAL">Normal</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="rule-active"
                    checked={rule.isActive}
                    onCheckedChange={(checked) => setRule(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor="rule-active">Active</Label>
                </div>
              </div>
            </div>

            <div>
              <Label>Trigger Events</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {triggerTypes.map(trigger => (
                  <div key={trigger.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={trigger.value}
                      checked={rule.triggers.includes(trigger.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setRule(prev => ({ ...prev, triggers: [...prev.triggers, trigger.value] }))
                        } else {
                          setRule(prev => ({ ...prev, triggers: prev.triggers.filter(t => t !== trigger.value) }))
                        }
                      }}
                    />
                    <Label htmlFor={trigger.value} className="text-sm">{trigger.label}</Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conditions */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Conditions</CardTitle>
              <Button onClick={addCondition} size="sm">
                Add Condition
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rule.conditions.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No conditions defined</p>
              ) : (
                rule.conditions.map((condition, index) => (
                  <div key={condition.id} className="border rounded p-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <div className="grid grid-cols-3 gap-2">
                          <Select 
                            value={condition.type} 
                            onValueChange={(value) => {
                              setRule(prev => ({
                                ...prev,
                                conditions: prev.conditions.map(c => 
                                  c.id === condition.id ? { ...c, type: value as any } : c
                                )
                              }))
                            }}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {conditionTypes.map(type => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          <Select 
                            value={condition.operator} 
                            onValueChange={(value) => {
                              setRule(prev => ({
                                ...prev,
                                conditions: prev.conditions.map(c => 
                                  c.id === condition.id ? { ...c, operator: value as any } : c
                                )
                              }))
                            }}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="equals">Equals</SelectItem>
                              <SelectItem value="not_equals">Not Equals</SelectItem>
                              <SelectItem value="greater_than">Greater Than</SelectItem>
                              <SelectItem value="less_than">Less Than</SelectItem>
                              <SelectItem value="contains">Contains</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Input
                            value={condition.value}
                            onChange={(e) => {
                              setRule(prev => ({
                                ...prev,
                                conditions: prev.conditions.map(c => 
                                  c.id === condition.id ? { ...c, value: e.target.value } : c
                                )
                              }))
                            }}
                            placeholder="Value"
                            className="h-8"
                          />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setRule(prev => ({
                            ...prev,
                            conditions: prev.conditions.filter(c => c.id !== condition.id)
                          }))
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Actions</CardTitle>
              <Button onClick={addAction} size="sm">
                Add Action
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rule.actions.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No actions defined</p>
              ) : (
                rule.actions.map((action, index) => (
                  <div key={action.id} className="border rounded p-4">
                    <div className="grid grid-cols-4 gap-4 items-end">
                      <div>
                        <Label>Action Type</Label>
                        <Select 
                          value={action.type} 
                          onValueChange={(value) => {
                            setRule(prev => ({
                              ...prev,
                              actions: prev.actions.map(a => 
                                a.id === action.id ? { ...a, type: value as any } : a
                              )
                            }))
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {actionTypes.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Delay (minutes)</Label>
                        <Input
                          type="number"
                          value={action.delay || 0}
                          onChange={(e) => {
                            setRule(prev => ({
                              ...prev,
                              actions: prev.actions.map(a => 
                                a.id === action.id ? { ...a, delay: parseInt(e.target.value) || 0 } : a
                              )
                            }))
                          }}
                          placeholder="0"
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <Label>Parameters (JSON)</Label>
                        <Input
                          value={JSON.stringify(action.parameters)}
                          onChange={(e) => {
                            try {
                              const params = JSON.parse(e.target.value)
                              setRule(prev => ({
                                ...prev,
                                actions: prev.actions.map(a => 
                                  a.id === action.id ? { ...a, parameters: params } : a
                                )
                              }))
                            } catch (error) {
                              // Invalid JSON, ignore
                            }
                          }}
                          placeholder='{"template": "default"}'
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end mt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setRule(prev => ({
                            ...prev,
                            actions: prev.actions.filter(a => a.id !== action.id)
                          }))
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rule Preview */}
      {previewMode && (
        <Card>
          <CardHeader>
            <CardTitle>Rule Preview</CardTitle>
            <CardDescription>How this rule will be evaluated and executed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-2">Trigger</div>
                  <div className="space-y-1">
                    {rule.triggers.map(trigger => (
                      <Badge key={trigger} variant="outline" className="block">
                        {triggerTypes.find(t => t.value === trigger)?.label}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-2">Conditions</div>
                  <div className="space-y-1">
                    {rule.conditions.length === 0 ? (
                      <Badge variant="secondary">Always True</Badge>
                    ) : (
                      rule.conditions.map(condition => (
                        <Badge key={condition.id} variant="outline" className="block text-xs">
                          {conditionTypes.find(t => t.value === condition.type)?.label} {condition.operator} {condition.value}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-2">Actions</div>
                  <div className="space-y-1">
                    {rule.actions.map(action => (
                      <Badge key={action.id} variant="outline" className="block text-xs">
                        {actionTypes.find(t => t.value === action.type)?.label}
                        {action.delay > 0 && ` (${action.delay}m delay)`}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <Alert>
                <Workflow className="h-4 w-4" />
                <AlertDescription>
                  This rule will execute when {rule.triggers.length} trigger(s) occur and all {rule.conditions.length} condition(s) are met, 
                  performing {rule.actions.length} action(s) with {rule.priority} priority.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// SLA Threshold Management
interface SLAThresholdManagerProps {
  thresholds: SLAThreshold[]
  onUpdateThreshold: (id: string, threshold: Partial<SLAThreshold>) => void
  onCreateThreshold: (threshold: Omit<SLAThreshold, 'id'>) => void
}

function SLAThresholdManager({ thresholds, onUpdateThreshold, onCreateThreshold }: SLAThresholdManagerProps) {
  const [selectedType, setSelectedType] = useState<'response' | 'resolution' | 'escalation'>('response')

  const thresholdTypes = [
    { value: 'response', label: 'Response Time', icon: <Clock className="h-4 w-4" /> },
    { value: 'resolution', label: 'Resolution Time', icon: <CheckCircle className="h-4 w-4" /> },
    { value: 'escalation', label: 'Escalation Time', icon: <AlertTriangle className="h-4 w-4" /> }
  ]

  const priorityLevels = ['LOW', 'NORMAL', 'HIGH', 'URGENT']

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">SLA Threshold Management</h2>
          <p className="text-gray-600">Configure service level agreement targets and warning thresholds</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Threshold
        </Button>
      </div>

      {/* Threshold Type Selection */}
      <div className="flex gap-2">
        {thresholdTypes.map(type => (
          <Button
            key={type.value}
            variant={selectedType === type.value ? "default" : "outline"}
            onClick={() => setSelectedType(type.value as any)}
            className="flex items-center gap-2"
          >
            {type.icon}
            {type.label}
          </Button>
        ))}
      </div>

      {/* SLA Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {priorityLevels.map(priority => {
          const threshold = thresholds.find(t => t.type === selectedType && t.priority === priority)
          return (
            <Card key={priority} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  {priority}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Target Time</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      type="number"
                      value={threshold?.targetTime || 24}
                      onChange={(e) => onUpdateThreshold(threshold?.id || '', { 
                        targetTime: parseInt(e.target.value) 
                      })}
                      className="w-20"
                    />
                    <span className="text-sm text-gray-600">hours</span>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Warning Threshold</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      type="number"
                      value={threshold?.warningThreshold || 75}
                      onChange={(e) => onUpdateThreshold(threshold?.id || '', { 
                        warningThreshold: parseInt(e.target.value) 
                      })}
                      className="w-20"
                    />
                    <span className="text-sm text-gray-600">%</span>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Critical Threshold</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      type="number"
                      value={threshold?.criticalThreshold || 90}
                      onChange={(e) => onUpdateThreshold(threshold?.id || '', { 
                        criticalThreshold: parseInt(e.target.value) 
                      })}
                      className="w-20"
                    />
                    <span className="text-sm text-gray-600">%</span>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <Badge variant={threshold ? "default" : "secondary"}>
                      {threshold ? 'Active' : 'Not Set'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* SLA Compliance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            SLA Compliance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {thresholdTypes.map(type => (
              <div key={type.value} className="space-y-3">
                <h3 className="font-medium flex items-center gap-2">
                  {type.icon}
                  {type.label}
                </h3>
                <div className="space-y-2">
                  {priorityLevels.map(priority => {
                    const compliance = Math.random() * 30 + 70 // Mock compliance percentage
                    return (
                      <div key={priority} className="flex items-center justify-between text-sm">
                        <span>{priority}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={compliance} className="w-16 h-2" />
                          <span className={`w-10 text-right ${compliance >= 90 ? 'text-green-600' : compliance >= 75 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {Math.round(compliance)}%
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Workflow Execution Monitor
function WorkflowExecutionMonitor() {
  const [executions, setExecutions] = useState<WorkflowExecution[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [selectedExecution, setSelectedExecution] = useState<WorkflowExecution | null>(null)

  // Mock data
  const mockExecutions: WorkflowExecution[] = [
    {
      id: '1',
      ruleId: 'rule-1',
      ruleName: 'Urgent Enquiry Auto-Escalation',
      status: 'completed',
      startedAt: new Date(Date.now() - 300000),
      completedAt: new Date(Date.now() - 240000),
      trigger: 'enquiry_created',
      conditionsMatched: true,
      actionsExecuted: 3,
      errors: []
    },
    {
      id: '2',
      ruleId: 'rule-2',
      ruleName: 'Low Rating Follow-up',
      status: 'running',
      startedAt: new Date(Date.now() - 60000),
      trigger: 'low_rating',
      conditionsMatched: true,
      actionsExecuted: 1,
      errors: []
    }
  ]

  useEffect(() => {
    setExecutions(mockExecutions)
  }, [])

  const getStatusIcon = (status: WorkflowExecution['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'running': return <Clock className="h-4 w-4 text-blue-600 animate-spin" />
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'cancelled': return <Pause className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: WorkflowExecution['status']) => {
    switch (status) {
      case 'completed': return 'border-green-200 bg-green-50'
      case 'running': return 'border-blue-200 bg-blue-50'
      case 'failed': return 'border-red-200 bg-red-50'
      case 'cancelled': return 'border-gray-200 bg-gray-50'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Workflow Execution Monitor</h2>
          <p className="text-gray-600">Real-time monitoring of automated workflow executions</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-600">
            {isRunning ? 'Active' : 'Inactive'}
          </span>
          <Button
            variant="outline"
            onClick={() => setIsRunning(!isRunning)}
            className="ml-4"
          >
            {isRunning ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {isRunning ? 'Pause' : 'Start'} Automation
          </Button>
        </div>
      </div>

      {/* Execution Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Executions', value: executions.length, icon: <Activity className="h-5 w-5" /> },
          { label: 'Successful', value: executions.filter(e => e.status === 'completed').length, icon: <CheckCircle className="h-5 w-5 text-green-600" /> },
          { label: 'Running', value: executions.filter(e => e.status === 'running').length, icon: <Clock className="h-5 w-5 text-blue-600" /> },
          { label: 'Failed', value: executions.filter(e => e.status === 'failed').length, icon: <AlertTriangle className="h-5 w-5 text-red-600" /> }
        ].map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                {stat.icon}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Execution History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5" />
            Recent Executions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {executions.map(execution => (
              <div 
                key={execution.id}
                className={`p-4 border rounded-lg hover:shadow-sm transition-shadow cursor-pointer ${getStatusColor(execution.status)}`}
                onClick={() => setSelectedExecution(execution)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(execution.status)}
                    <div>
                      <h4 className="font-medium">{execution.ruleName}</h4>
                      <p className="text-sm text-gray-600">
                        Triggered by: {execution.trigger} • 
                        {execution.actionsExecuted} action(s) executed
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <div>{execution.startedAt.toLocaleTimeString()}</div>
                    {execution.completedAt && (
                      <div>Duration: {Math.round((execution.completedAt.getTime() - execution.startedAt.getTime()) / 1000)}s</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Execution Detail Modal */}
      {selectedExecution && (
        <Dialog open={!!selectedExecution} onOpenChange={() => setSelectedExecution(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getStatusIcon(selectedExecution.status)}
                Execution Details
              </DialogTitle>
              <DialogDescription>
                {selectedExecution.ruleName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <p className="text-sm bg-gray-50 p-2 rounded">{selectedExecution.status}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Trigger</Label>
                  <p className="text-sm bg-gray-50 p-2 rounded">{selectedExecution.trigger}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Started</Label>
                  <p className="text-sm bg-gray-50 p-2 rounded">{selectedExecution.startedAt.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Duration</Label>
                  <p className="text-sm bg-gray-50 p-2 rounded">
                    {selectedExecution.completedAt 
                      ? `${Math.round((selectedExecution.completedAt.getTime() - selectedExecution.startedAt.getTime()) / 1000)} seconds`
                      : 'In progress'
                    }
                  </p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Actions Executed</Label>
                <p className="text-sm bg-gray-50 p-2 rounded">{selectedExecution.actionsExecuted}</p>
              </div>
              
              {selectedExecution.errors.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-red-600">Errors</Label>
                  <div className="bg-red-50 border border-red-200 rounded p-2">
                    {selectedExecution.errors.map((error, index) => (
                      <p key={index} className="text-sm text-red-700">{error}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

// Main Workflow Automation Engine
export function WorkflowAutomationEngine() {
  const [activeTab, setActiveTab] = useState('rules')
  const [slaThresholds] = useState<SLAThreshold[]>([
    {
      id: '1',
      type: 'response',
      priority: 'URGENT',
      targetTime: 1,
      warningThreshold: 75,
      criticalThreshold: 90
    },
    {
      id: '2',
      type: 'response',
      priority: 'HIGH',
      targetTime: 4,
      warningThreshold: 75,
      criticalThreshold: 90
    }
  ])

  return (
    <div className="space-y-6">
      <div className="border-b">
        <h1 className="text-3xl font-bold">Workflow Automation Engine</h1>
        <p className="text-gray-600 mt-2">
          Intelligent automation system for workflow management, escalation, and SLA compliance
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="rules">Workflow Rules</TabsTrigger>
          <TabsTrigger value="sla">SLA Management</TabsTrigger>
          <TabsTrigger value="monitor">Execution Monitor</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="rules">
          <WorkflowRuleBuilder
            onSave={(rule) => console.log('Save workflow rule:', rule)}
          />
        </TabsContent>

        <TabsContent value="sla">
          <SLAThresholdManager
            thresholds={slaThresholds}
            onUpdateThreshold={(id, threshold) => console.log('Update SLA threshold:', id, threshold)}
            onCreateThreshold={(threshold) => console.log('Create SLA threshold:', threshold)}
          />
        </TabsContent>

        <TabsContent value="monitor">
          <WorkflowExecutionMonitor />
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Rules</p>
                    <p className="text-2xl font-bold">12</p>
                  </div>
                  <Settings className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Executions Today</p>
                    <p className="text-2xl font-bold">247</p>
                  </div>
                  <Activity className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold">96.8%</p>
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
                    <p className="text-2xl font-bold">94.2%</p>
                  </div>
                  <Shield className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Automation Impact</CardTitle>
              <CardDescription>Performance improvements from workflow automation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { metric: 'Response Time Reduction', improvement: '-35%', icon: <Timer className="h-5 w-5" /> },
                  { metric: 'Manual Workload Reduction', improvement: '-68%', icon: <Users className="h-5 w-5" /> },
                  { metric: 'SLA Breach Prevention', improvement: '+92%', icon: <Shield className="h-5 w-5" /> },
                  { metric: 'Customer Satisfaction', improvement: '+18%', icon: <TrendingUp className="h-5 w-5" /> }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span className="font-medium">{item.metric}</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">{item.improvement}</span>
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