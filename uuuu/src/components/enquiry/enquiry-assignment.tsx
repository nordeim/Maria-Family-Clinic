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
import { 
  User, 
  Clock, 
  Target, 
  CheckCircle, 
  AlertTriangle, 
  Zap,
  Users,
  Calendar,
  MessageSquare
} from 'lucide-react'
import { EnquiryData, EnquiryAssignment as EnquiryAssignmentType } from './types'
import { format } from 'date-fns'

interface EnquiryAssignmentProps {
  enquiry: EnquiryData
  onAssignmentChange: (enquiry: EnquiryData) => void
  availableStaff?: Array<{ id: string; name: string; email: string; role: string; workload: number }>
  currentUser?: { id: string; name: string }
}

export function EnquiryAssignment({ 
  enquiry, 
  onAssignmentChange,
  availableStaff = [],
  currentUser
}: EnquiryAssignmentProps) {
  const [isAssigning, setIsAssigning] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState('')
  const [reason, setReason] = useState('')
  const [estimatedTime, setEstimatedTime] = useState('')
  const [notes, setNotes] = useState('')
  const [priority, setPriority] = useState(enquiry.priority)

  const handleAssign = async () => {
    if (!selectedStaff) return

    setIsAssigning(true)
    try {
      // This would typically call the assignment API
      const assignmentData: EnquiryAssignmentType = {
        enquiryId: enquiry.id,
        assignTo: selectedStaff,
        reason,
        priority: priority as any,
        estimatedResponseTime: estimatedTime ? parseInt(estimatedTime) : undefined,
        notes
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Update the enquiry with new assignment
      const assignedStaff = availableStaff.find(s => s.id === selectedStaff)
      const updatedEnquiry = {
        ...enquiry,
        assignedTo: selectedStaff,
        assignedStaff: assignedStaff ? {
          id: assignedStaff.id,
          name: assignedStaff.name,
          email: assignedStaff.email,
          role: assignedStaff.role
        } : undefined,
        priority: priority as any
      }

      onAssignmentChange(updatedEnquiry)
      setSelectedStaff('')
      setReason('')
      setEstimatedTime('')
      setNotes('')
    } catch (error) {
      console.error('Failed to assign enquiry:', error)
    } finally {
      setIsAssigning(false)
    }
  }

  const handleUnassign = async () => {
    setIsAssigning(true)
    try {
      const updatedEnquiry = {
        ...enquiry,
        assignedTo: undefined,
        assignedStaff: undefined
      }
      onAssignmentChange(updatedEnquiry)
    } catch (error) {
      console.error('Failed to unassign enquiry:', error)
    } finally {
      setIsAssigning(false)
    }
  }

  const getStaffWorkloadColor = (workload: number) => {
    if (workload <= 5) return 'text-green-600'
    if (workload <= 10) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getWorkloadLevel = (workload: number) => {
    if (workload <= 5) return 'Low'
    if (workload <= 10) return 'Medium'
    return 'High'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>Assignment</span>
        </CardTitle>
        <CardDescription>
          Assign this enquiry to a staff member
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {enquiry.assignedStaff ? (
          <div className="space-y-4">
            {/* Current Assignment */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{enquiry.assignedStaff.name}</span>
                  <span className="text-sm text-muted-foreground">
                    ({enquiry.assignedStaff.role})
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {enquiry.assignedStaff.email}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUnassign}
                  disabled={isAssigning}
                >
                  Unassign
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Reassign
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Reassign Enquiry</DialogTitle>
                      <DialogDescription>
                        Select a new staff member to handle this enquiry
                      </DialogDescription>
                    </DialogHeader>
                    <AssignmentForm
                      availableStaff={availableStaff}
                      onAssign={(data) => {
                        setSelectedStaff(data.staffId)
                        setReason(data.reason)
                        setEstimatedTime(data.estimatedTime?.toString() || '')
                        setNotes(data.notes)
                        handleAssign()
                      }}
                      currentUser={currentUser}
                      priority={priority}
                      onPriorityChange={setPriority}
                      estimatedTime={estimatedTime}
                      onEstimatedTimeChange={setEstimatedTime}
                      reason={reason}
                      onReasonChange={setReason}
                      notes={notes}
                      onNotesChange={setNotes}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Assignment Details */}
            <div className="grid gap-2 text-sm">
              {enquiry.assignedStaff && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Workload:</span>
                  <div className="flex items-center space-x-2">
                    <span className={getStaffWorkloadColor(enquiry.assignedStaff.workload || 0)}>
                      {getWorkloadLevel(enquiry.assignedStaff.workload || 0)} 
                      ({enquiry.assignedStaff.workload || 0} enquiries)
                    </span>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Priority:</span>
                <span className="capitalize">{enquiry.priority.toLowerCase()}</span>
              </div>
              {estimatedTime && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Est. Response:</span>
                  <span>{estimatedTime} hours</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center py-4">
              <User className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Not assigned</p>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <User className="h-4 w-4 mr-2" />
                  Assign Enquiry
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Assign Enquiry</DialogTitle>
                  <DialogDescription>
                    Select a staff member to handle this enquiry
                  </DialogDescription>
                </DialogHeader>
                <AssignmentForm
                  availableStaff={availableStaff}
                  onAssign={(data) => {
                    setSelectedStaff(data.staffId)
                    setReason(data.reason)
                    setEstimatedTime(data.estimatedTime?.toString() || '')
                    setNotes(data.notes)
                    handleAssign()
                  }}
                  currentUser={currentUser}
                  priority={priority}
                  onPriorityChange={setPriority}
                  estimatedTime={estimatedTime}
                  onEstimatedTimeChange={setEstimatedTime}
                  reason={reason}
                  onReasonChange={setReason}
                  notes={notes}
                  onNotesChange={setNotes}
                />
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Quick Assignment Actions */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Quick Actions</p>
          <div className="grid grid-cols-2 gap-2">
            {currentUser && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedStaff(currentUser.id)
                  setReason('Self-assigned')
                  handleAssign()
                }}
                disabled={enquiry.assignedTo === currentUser.id}
              >
                <User className="h-4 w-4 mr-1" />
                Assign to Me
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Auto-assign to least busy staff member
                const leastBusy = availableStaff
                  .sort((a, b) => (a.workload || 0) - (b.workload || 0))[0]
                if (leastBusy) {
                  setSelectedStaff(leastBusy.id)
                  setReason('Auto-assigned (least busy)')
                  handleAssign()
                }
              }}
            >
              <Target className="h-4 w-4 mr-1" />
              Auto-Assign
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Assignment Form Component
function AssignmentForm({
  availableStaff,
  onAssign,
  currentUser,
  priority,
  onPriorityChange,
  estimatedTime,
  onEstimatedTimeChange,
  reason,
  onReasonChange,
  notes,
  onNotesChange
}: any) {
  const [selectedStaff, setSelectedStaff] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStaff) return

    onAssign({
      staffId: selectedStaff,
      reason,
      estimatedTime: estimatedTime ? parseInt(estimatedTime) : undefined,
      notes
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="staff">Assign to</Label>
        <Select value={selectedStaff} onValueChange={setSelectedStaff}>
          <SelectTrigger>
            <SelectValue placeholder="Select staff member" />
          </SelectTrigger>
          <SelectContent>
            {availableStaff.map((staff: any) => (
              <SelectItem key={staff.id} value={staff.id}>
                <div className="flex items-center justify-between w-full">
                  <span>{staff.name}</span>
                  <div className="flex items-center space-x-2 ml-4">
                    <span className="text-xs text-muted-foreground">
                      {staff.role}
                    </span>
                    <span className={`text-xs ${
                      (staff.workload || 0) <= 5 ? 'text-green-600' :
                      (staff.workload || 0) <= 10 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {staff.workload || 0} active
                    </span>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="priority">Priority</Label>
        <Select value={priority} onValueChange={onPriorityChange}>
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

      <div>
        <Label htmlFor="estimated-time">Estimated Response Time (hours)</Label>
        <Input
          id="estimated-time"
          type="number"
          min="1"
          max="72"
          value={estimatedTime}
          onChange={(e) => onEstimatedTimeChange(e.target.value)}
          placeholder="e.g., 2"
        />
      </div>

      <div>
        <Label htmlFor="reason">Reason</Label>
        <Input
          id="reason"
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
          placeholder="Reason for assignment"
        />
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          rows={3}
          placeholder="Additional notes for the assignee"
        />
      </div>

      <div className="flex space-x-2">
        <Button type="button" variant="outline" className="flex-1">
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={!selectedStaff}>
          Assign
        </Button>
      </div>
    </form>
  )
}