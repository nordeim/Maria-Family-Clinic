'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Workflow, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Play, 
  Pause, 
  SkipForward,
  Settings,
  Zap,
  Target,
  Users
} from 'lucide-react'
import { EnquiryData, EnquiryWorkflow as EnquiryWorkflowType, EnquiryStage, EnquiryAction } from './types'
import { format, formatDistanceToNow } from 'date-fns'

interface EnquiryWorkflowProps {
  enquiry: EnquiryData
  onWorkflowUpdate: (enquiry: EnquiryData) => void
  workflowConfig?: EnquiryWorkflowType
}

export function EnquiryWorkflow({ 
  enquiry, 
  onWorkflowUpdate,
  workflowConfig 
}: EnquiryWorkflowProps) {
  const [currentStage, setCurrentStage] = useState<EnquiryStage>('intake')
  const [isPaused, setIsPaused] = useState(false)
  const [autoActionsEnabled, setAutoActionsEnabled] = useState(true)

  useEffect(() => {
    // Determine current stage based on enquiry status and progress
    const determineStage = (): EnquiryStage => {
      if (!enquiry.responseDate) return 'intake'
      if (!enquiry.assignedTo) return 'assignment'
      if (enquiry.status === 'NEW') return 'intake'
      if (enquiry.status === 'IN_PROGRESS') return 'investigation'
      if (enquiry.status === 'PENDING') return 'response'
      if (enquiry.status === 'RESOLVED') return 'resolution'
      if (enquiry.status === 'CLOSED') return 'closed'
      return 'intake'
    }
    
    setCurrentStage(determineStage())
  }, [enquiry.status, enquiry.responseDate, enquiry.assignedTo])

  const stages: Array<{
    id: EnquiryStage
    name: string
    description: string
    icon: any
    color: string
    completed: boolean
    active: boolean
  }> = [
    {
      id: 'intake',
      name: 'Intake',
      description: 'Initial enquiry received and logged',
      icon: Workflow,
      color: 'bg-blue-500',
      completed: !!enquiry.createdAt,
      active: currentStage === 'intake'
    },
    {
      id: 'assignment',
      name: 'Assignment',
      description: 'Assigned to appropriate staff member',
      icon: Users,
      completed: !!enquiry.assignedTo,
      active: currentStage === 'assignment'
    },
    {
      id: 'investigation',
      name: 'Investigation',
      description: 'Staff member reviews and investigates',
      icon: Clock,
      completed: enquiry.status === 'IN_PROGRESS' || enquiry.status === 'PENDING',
      active: currentStage === 'investigation'
    },
    {
      id: 'response',
      name: 'Response',
      description: 'Customer service response prepared and sent',
      icon: CheckCircle,
      completed: !!enquiry.responseDate,
      active: currentStage === 'response'
    },
    {
      id: 'resolution',
      name: 'Resolution',
      description: 'Enquiry resolved and confirmed with customer',
      icon: Target,
      completed: enquiry.status === 'RESOLVED',
      active: currentStage === 'resolution'
    },
    {
      id: 'follow_up',
      name: 'Follow-up',
      description: 'Customer satisfaction check and documentation',
      icon: AlertTriangle,
      completed: enquiry.followUpRequired || false,
      active: currentStage === 'follow_up'
    },
    {
      id: 'closed',
      name: 'Closed',
      description: 'Enquiry formally closed and archived',
      icon: CheckCircle,
      completed: enquiry.status === 'CLOSED',
      active: currentStage === 'closed'
    }
  ]

  const getStageProgress = () => {
    const completedStages = stages.filter(s => s.completed).length
    return (completedStages / stages.length) * 100
  }

  const getSLAStatus = () => {
    if (enquiry.status === 'RESOLVED' || enquiry.status === 'CLOSED') return 'completed'
    
    const createdAt = new Date(enquiry.createdAt)
    const now = new Date()
    const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
    
    const slaTargets = {
      URGENT: 2,
      HIGH: 4,
      NORMAL: 8,
      LOW: 24
    }
    
    const target = slaTargets[enquiry.priority] || 8
    const progress = (hoursDiff / target) * 100
    
    if (progress >= 100) return 'overdue'
    if (progress >= 80) return 'warning'
    if (progress >= 50) return 'caution'
    return 'on_track'
  }

  const handleStageAction = (action: string) => {
    // This would typically trigger workflow actions
    console.log(`Triggering action: ${action}`)
  }

  const getSLAInfo = () => {
    const status = getSLAStatus()
    const createdAt = new Date(enquiry.createdAt)
    const hoursElapsed = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60)
    
    const slaTargets = {
      URGENT: 2,
      HIGH: 4,
      NORMAL: 8,
      LOW: 24
    }
    
    const target = slaTargets[enquiry.priority] || 8
    const progress = Math.min((hoursElapsed / target) * 100, 100)
    
    return {
      status,
      progress,
      hoursElapsed: Math.round(hoursElapsed * 10) / 10,
      target,
      timeRemaining: Math.max(target - hoursElapsed, 0)
    }
  }

  const slaInfo = getSLAInfo()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Workflow className="h-5 w-5" />
          <span>Workflow</span>
        </CardTitle>
        <CardDescription>
          Track enquiry progress through the service workflow
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Overview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">
              {Math.round(getStageProgress())}% complete
            </span>
          </div>
          <Progress value={getStageProgress()} className="h-2" />
        </div>

        {/* SLA Status */}
        <div className="p-4 border rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">SLA Status</span>
            <Badge variant={
              slaInfo.status === 'overdue' ? 'destructive' :
              slaInfo.status === 'warning' ? 'secondary' :
              slaInfo.status === 'caution' ? 'outline' : 'default'
            }>
              {slaInfo.status.replace('_', ' ')}
            </Badge>
          </div>
          <div className="space-y-1 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Elapsed time:</span>
              <span>{slaInfo.hoursElapsed} hours</span>
            </div>
            <div className="flex justify-between">
              <span>SLA target:</span>
              <span>{slaInfo.target} hours</span>
            </div>
            {slaInfo.status !== 'overdue' && (
              <div className="flex justify-between">
                <span>Time remaining:</span>
                <span>{Math.round(slaInfo.timeRemaining * 10) / 10} hours</span>
              </div>
            )}
          </div>
          <Progress 
            value={slaInfo.progress} 
            className={`h-2 mt-2 ${
              slaInfo.status === 'overdue' ? 'bg-red-100' :
              slaInfo.status === 'warning' ? 'bg-yellow-100' :
              slaInfo.status === 'caution' ? 'bg-orange-100' : 'bg-green-100'
            }`} 
          />
        </div>

        {/* Stage Pipeline */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Process Pipeline</span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPaused(!isPaused)}
              >
                {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                {isPaused ? 'Resume' : 'Pause'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoActionsEnabled(!autoActionsEnabled)}
              >
                <Zap className={`h-4 w-4 ${autoActionsEnabled ? 'text-green-600' : 'text-gray-400'}`} />
                Auto Actions
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {stages.map((stage, index) => {
              const Icon = stage.icon
              return (
                <div 
                  key={stage.id} 
                  className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                    stage.active ? 'bg-primary/5 border-primary' : 
                    stage.completed ? 'bg-green-50 border-green-200' : 'bg-muted/50'
                  }`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    stage.completed ? 'bg-green-500' : 
                    stage.active ? 'bg-primary' : 'bg-gray-300'
                  }`}>
                    {stage.completed ? (
                      <CheckCircle className="h-4 w-4 text-white" />
                    ) : (
                      <Icon className={`h-4 w-4 ${
                        stage.active ? 'text-white' : 'text-gray-600'
                      }`} />
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{stage.name}</span>
                      {stage.active && !isPaused && (
                        <Badge variant="secondary" className="text-xs">
                          Active
                        </Badge>
                      )}
                      {stage.completed && (
                        <Badge variant="default" className="text-xs">
                          Complete
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {stage.description}
                    </p>
                  </div>
                  
                  {stage.active && (
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStageAction(`complete_${stage.id}`)}
                      >
                        <SkipForward className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStageAction(`skip_${stage.id}`)}
                      >
                        Skip
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Workflow Actions */}
        {currentStage !== 'closed' && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Available Actions</p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStageAction('auto_assign')}
                disabled={!!enquiry.assignedTo}
              >
                <Users className="h-4 w-4 mr-1" />
                Auto Assign
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStageAction('send_reminder')}
              >
                <Clock className="h-4 w-4 mr-1" />
                Send Reminder
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStageAction('escalate')}
              >
                <AlertTriangle className="h-4 w-4 mr-1" />
                Escalate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStageAction('close_enquiry')}
                disabled={!enquiry.response}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Close
              </Button>
            </div>
          </div>
        )}

        {/* Automation Rules */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Automation Rules</p>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Auto-assignment</span>
              <Badge variant={autoActionsEnabled ? 'default' : 'outline'}>
                {autoActionsEnabled ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Auto-responses</span>
              <Badge variant={autoActionsEnabled ? 'default' : 'outline'}>
                {autoActionsEnabled ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>SLA warnings</span>
              <Badge variant={autoActionsEnabled ? 'default' : 'outline'}>
                {autoActionsEnabled ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}