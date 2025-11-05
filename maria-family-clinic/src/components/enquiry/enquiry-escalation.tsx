'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  User, 
  Zap, 
  Target, 
  Shield,
  FileText,
  Calendar
} from 'lucide-react'
import { EnquiryData, EnquiryEscalation as EnquiryEscalationType } from './types'
import { format } from 'date-fns'

interface EnquiryEscalationProps {
  enquiry: EnquiryData
  onEscalationChange: (enquiry: EnquiryData) => void
  escalationRules?: Array<{
    id: string
    name: string
    conditions: string[]
    actions: string[]
    isActive: boolean
  }>
  availableManagers?: Array<{ id: string; name: string; role: string; department: string }>
}

export function EnquiryEscalation({ 
  enquiry, 
  onEscalationChange,
  escalationRules = [],
  availableManagers = []
}: EnquiryEscalationProps) {
  const [isEscalating, setIsEscalating] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState(1)
  const [reason, setReason] = useState('')
  const [escalatedTo, setEscalatedTo] = useState('')
  const [actionRequired, setActionRequired] = useState('')
  const [deadline, setDeadline] = useState('')
  const [notes, setNotes] = useState('')

  const shouldEscalate = () => {
    if (enquiry.status === 'RESOLVED' || enquiry.status === 'CLOSED') return false
    
    const createdAt = new Date(enquiry.createdAt)
    const now = new Date()
    const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
    
    // Define escalation thresholds
    const escalationThresholds = {
      1: 8,   // Level 1: 8 hours
      2: 24,  // Level 2: 24 hours
      3: 48   // Level 3: 48 hours
    }
    
    const currentLevel = enquiry.escalationLevel || 0
    const threshold = escalationThresholds[currentLevel + 1 as keyof typeof escalationThresholds] || 48
    
    return hoursDiff > threshold
  }

  const handleEscalate = async () => {
    setIsEscalating(true)
    try {
      const escalationData: EnquiryEscalationType = {
        enquiryId: enquiry.id,
        level: selectedLevel,
        reason,
        escalatedBy: 'current-user', // This would be actual current user
        escalatedTo,
        actionRequired,
        deadline: deadline ? new Date(deadline) : undefined,
        notes
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      const updatedEnquiry = {
        ...enquiry,
        escalationLevel: selectedLevel,
        assignedTo: escalatedTo || enquiry.assignedTo, // Reassign if needed
        priority: selectedLevel >= 2 ? 'URGENT' as any : enquiry.priority
      }

      onEscalationChange(updatedEnquiry)
      
      // Reset form
      setReason('')
      setEscalatedTo('')
      setActionRequired('')
      setDeadline('')
      setNotes('')
      setSelectedLevel(1)
    } catch (error) {
      console.error('Failed to escalate enquiry:', error)
    } finally {
      setIsEscalating(false)
    }
  }

  const getEscalationLevel = (level: number) => {
    const levels = {
      1: { name: 'Level 1', color: 'bg-yellow-500', description: 'Supervisor review' },
      2: { name: 'Level 2', color: 'bg-orange-500', description: 'Manager review' },
      3: { name: 'Level 3', color: 'bg-red-500', description: 'Senior management' }
    }
    return levels[level as keyof typeof levels] || levels[1]
  }

  const canEscalate = () => {
    return shouldEscalate() || enquiry.priority === 'URGENT' || enquiry.type === 'COMPLAINT'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5" />
          <span>Escalation</span>
        </CardTitle>
        <CardDescription>
          Manage escalation workflow and hierarchy
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {enquiry.escalationLevel ? (
          <div className="space-y-4">
            {/* Current Escalation Status */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getEscalationLevel(enquiry.escalationLevel).color}`} />
                  <span className="font-medium">
                    {getEscalationLevel(enquiry.escalationLevel).name} Escalated
                  </span>
                </div>
                <Badge variant="outline">
                  Level {enquiry.escalationLevel}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {getEscalationLevel(enquiry.escalationLevel).description}
              </p>
            </div>

            {/* Escalation History would go here */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Escalation Details</p>
              <div className="text-sm space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Level:</span>
                  <span>{enquiry.escalationLevel}</span>
                </div>
                {enquiry.assignedStaff && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Escalated to:</span>
                    <span>{enquiry.assignedStaff.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Auto-escalation indicators */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Time-based escalation status</span>
              </div>
              {shouldEscalate() ? (
                <div className="flex items-center space-x-2 p-2 bg-red-50 border border-red-200 rounded">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-700">
                    This enquiry should be escalated
                  </span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 p-2 bg-green-50 border border-green-200 rounded">
                  <Target className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700">
                    Within normal response time
                  </span>
                </div>
              )}
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  className="w-full" 
                  disabled={!canEscalate()}
                  variant={canEscalate() ? "default" : "outline"}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  {canEscalate() ? 'Escalate Enquiry' : 'Cannot Escalate'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Escalate Enquiry</DialogTitle>
                  <DialogDescription>
                    Escalate this enquiry to higher management
                  </DialogDescription>
                </DialogHeader>
                <EscalationForm
                  selectedLevel={selectedLevel}
                  onLevelChange={setSelectedLevel}
                  reason={reason}
                  onReasonChange={setReason}
                  escalatedTo={escalatedTo}
                  onEscalatedToChange={setEscalatedTo}
                  actionRequired={actionRequired}
                  onActionRequiredChange={setActionRequired}
                  deadline={deadline}
                  onDeadlineChange={setDeadline}
                  notes={notes}
                  onNotesChange={setNotes}
                  availableManagers={availableManagers}
                  onSubmit={handleEscalate}
                  isLoading={isEscalating}
                  getEscalationLevel={getEscalationLevel}
                />
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Quick Escalation Actions */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Quick Actions</p>
          <div className="grid grid-cols-1 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (canEscalate()) {
                  setSelectedLevel(1)
                  setReason('Time-based escalation')
                  handleEscalate()
                }
              }}
              disabled={!canEscalate()}
            >
              <Zap className="h-4 w-4 mr-1" />
              Quick Level 1 Escalation
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (enquiry.priority !== 'URGENT') {
                  const updatedEnquiry = {
                    ...enquiry,
                    priority: 'URGENT' as any
                  }
                  onEscalationChange(updatedEnquiry)
                }
              }}
              disabled={enquiry.priority === 'URGENT'}
            >
              <Shield className="h-4 w-4 mr-1" />
              Mark as Urgent
            </Button>
          </div>
        </div>

        {/* Escalation Rules */}
        {escalationRules.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Active Escalation Rules</p>
            <div className="space-y-2">
              {escalationRules.filter(rule => rule.isActive).map((rule) => (
                <div key={rule.id} className="p-2 border rounded text-sm">
                  <div className="font-medium">{rule.name}</div>
                  <div className="text-muted-foreground text-xs">
                    {rule.conditions.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Escalation Form Component
function EscalationForm({
  selectedLevel,
  onLevelChange,
  reason,
  onReasonChange,
  escalatedTo,
  onEscalatedToChange,
  actionRequired,
  onActionRequiredChange,
  deadline,
  onDeadlineChange,
  notes,
  onNotesChange,
  availableManagers,
  onSubmit,
  isLoading,
  getEscalationLevel
}: any) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason.trim()) return
    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="level">Escalation Level</Label>
        <Select value={selectedLevel.toString()} onValueChange={(value) => onLevelChange(parseInt(value))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3].map((level) => (
              <SelectItem key={level} value={level.toString()}>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${getEscalationLevel(level).color}`} />
                  <span>Level {level} - {getEscalationLevel(level).name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="escalated-to">Escalate To</Label>
        <Select value={escalatedTo} onValueChange={onEscalatedToChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select manager" />
          </SelectTrigger>
          <SelectContent>
            {availableManagers.map((manager: any) => (
              <SelectItem key={manager.id} value={manager.id}>
                {manager.name} - {manager.role} ({manager.department})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="reason">Reason for Escalation *</Label>
        <Textarea
          id="reason"
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
          rows={3}
          placeholder="Explain why this enquiry needs escalation"
          required
        />
      </div>

      <div>
        <Label htmlFor="action-required">Required Action</Label>
        <Textarea
          id="action-required"
          value={actionRequired}
          onChange={(e) => onActionRequiredChange(e.target.value)}
          rows={2}
          placeholder="What action needs to be taken?"
        />
      </div>

      <div>
        <Label htmlFor="deadline">Response Deadline</Label>
        <Input
          id="deadline"
          type="datetime-local"
          value={deadline}
          onChange={(e) => onDeadlineChange(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          rows={2}
          placeholder="Any additional context or notes"
        />
      </div>

      <div className="flex space-x-2">
        <Button type="button" variant="outline" className="flex-1">
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={isLoading || !reason.trim()}>
          {isLoading ? 'Escalating...' : 'Escalate'}
        </Button>
      </div>
    </form>
  )
}