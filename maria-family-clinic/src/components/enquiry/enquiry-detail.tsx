'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Mail, 
  Phone, 
  MessageSquare, 
  Calendar, 
  User, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Edit, 
  Send, 
  Archive, 
  MoreHorizontal,
  FileText,
  TrendingUp,
  Star
} from 'lucide-react'
import { EnquiryData } from './types'
import { EnquiryAssignment } from './enquiry-assignment'
import { EnquiryEscalation } from './enquiry-escalation'
import { EnquiryFollowUp } from './enquiry-follow-up'
import { EnquirySatisfactionSurvey } from './enquiry-satisfaction-survey'
import { format, formatDistanceToNow } from 'date-fns'

interface EnquiryDetailProps {
  enquiry: EnquiryData
  onUpdate: (enquiry: EnquiryData) => void
  onClose: () => void
  userRole: 'STAFF' | 'ADMIN'
}

export function EnquiryDetail({ 
  enquiry, 
  onUpdate, 
  onClose, 
  userRole 
}: EnquiryDetailProps) {
  const [activeTab, setActiveTab] = useState('details')
  const [isEditing, setIsEditing] = useState(false)
  const [responseText, setResponseText] = useState(enquiry.response || '')
  const [status, setStatus] = useState(enquiry.status)
  const [priority, setPriority] = useState(enquiry.priority)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'destructive'
      case 'HIGH': return 'secondary'
      case 'NORMAL': return 'default'
      case 'LOW': return 'outline'
      default: return 'default'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'secondary'
      case 'IN_PROGRESS': return 'default'
      case 'PENDING': return 'outline'
      case 'RESOLVED': return 'default'
      case 'CLOSED': return 'secondary'
      default: return 'default'
    }
  }

  const isOverdue = (enquiry: EnquiryData) => {
    if (enquiry.status === 'RESOLVED' || enquiry.status === 'CLOSED') return false
    
    const createdAt = new Date(enquiry.createdAt)
    const now = new Date()
    const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
    
    const slaTargets = {
      URGENT: 2,      // 2 hours for urgent
      HIGH: 4,        // 4 hours for high priority
      NORMAL: 8,      // 8 hours for normal
      LOW: 24         // 24 hours for low
    }
    
    const target = slaTargets[enquiry.priority] || 8
    return hoursDiff > target
  }

  const handleSave = async () => {
    setIsSubmitting(true)
    try {
      // This would typically call the update API
      const updatedEnquiry = {
        ...enquiry,
        status,
        priority,
        response: responseText,
        responseDate: responseText && !enquiry.responseDate ? new Date() : enquiry.responseDate
      }
      onUpdate(updatedEnquiry)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update enquiry:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus as any)
    if (newStatus === 'RESOLVED' && !enquiry.resolution) {
      // Auto-generate resolution summary
      setResponseText(`Enquiry resolved. ${enquiry.message.substring(0, 100)}...`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">{enquiry.subject}</h2>
          <div className="flex items-center space-x-2">
            <Badge variant={getStatusColor(enquiry.status)}>
              {enquiry.status}
            </Badge>
            <Badge variant={getPriorityColor(enquiry.priority)}>
              {enquiry.priority}
            </Badge>
            {isOverdue(enquiry) && (
              <Badge variant="destructive" className="flex items-center space-x-1">
                <AlertTriangle className="h-3 w-3" />
                <span>Overdue</span>
              </Badge>
            )}
            <span className="text-sm text-muted-foreground">
              ID: {enquiry.id.slice(0, 8)}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {!isEditing ? (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save'}
              </Button>
            </>
          )}
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{enquiry.name}</p>
                    <p className="text-sm text-muted-foreground">Customer Name</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{enquiry.email}</p>
                    <p className="text-sm text-muted-foreground">Email Address</p>
                  </div>
                </div>

                {enquiry.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{enquiry.phone}</p>
                      <p className="text-sm text-muted-foreground">Phone Number</p>
                    </div>
                  </div>
                )}

                {enquiry.patient && (
                  <div className="flex items-center space-x-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {enquiry.patient.firstName} {enquiry.patient.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">Registered Patient</p>
                    </div>
                  </div>
                )}

                {enquiry.clinic && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{enquiry.clinic.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {enquiry.clinic.address}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Enquiry Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Enquiry Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Type</Label>
                  <Badge variant="outline" className="mt-1">
                    {enquiry.type.replace('_', ' ')}
                  </Badge>
                </div>

                <div>
                  <Label>Source</Label>
                  <p className="font-medium mt-1 capitalize">
                    {enquiry.source.replace('_', ' ')}
                  </p>
                </div>

                <div>
                  <Label>Preferred Language</Label>
                  <p className="font-medium mt-1">
                    {enquiry.preferredLanguage === 'en' ? 'English' : 
                     enquiry.preferredLanguage === 'zh' ? 'Chinese' :
                     enquiry.preferredLanguage === 'ms' ? 'Malay' :
                     enquiry.preferredLanguage === 'ta' ? 'Tamil' : 
                     enquiry.preferredLanguage}
                  </p>
                </div>

                <div>
                  <Label>Created</Label>
                  <p className="font-medium mt-1">
                    {format(new Date(enquiry.createdAt), 'PPP p')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(enquiry.createdAt), { addSuffix: true })}
                  </p>
                </div>

                {enquiry.responseDate && (
                  <div>
                    <Label>Responded</Label>
                    <p className="font-medium mt-1">
                      {format(new Date(enquiry.responseDate), 'PPP p')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(enquiry.responseDate), { addSuffix: true })}
                    </p>
                  </div>
                )}

                {enquiry.assignedStaff && (
                  <div>
                    <Label>Assigned To</Label>
                    <p className="font-medium mt-1">
                      {enquiry.assignedStaff.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {enquiry.assignedStaff.role}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Message Content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Message</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg">
                <p className="whitespace-pre-wrap">{enquiry.message}</p>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          {enquiry.tags && enquiry.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {enquiry.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="communication" className="space-y-4">
          {isEditing ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Response</CardTitle>
                <CardDescription>
                  Provide a professional response to the customer
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={status} onValueChange={handleStatusChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NEW">New</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="RESOLVED">Resolved</SelectItem>
                        <SelectItem value="CLOSED">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={priority} onValueChange={setPriority}>
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
                </div>
                <div>
                  <Label htmlFor="response">Response Message</Label>
                  <Textarea
                    id="response"
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    rows={6}
                    placeholder="Type your response here..."
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Response</CardTitle>
              </CardHeader>
              <CardContent>
                {enquiry.response ? (
                  <div className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="whitespace-pre-wrap">{enquiry.response}</p>
                    </div>
                    {enquiry.responseDate && (
                      <p className="text-sm text-muted-foreground">
                        Responded on {format(new Date(enquiry.responseDate), 'PPP p')}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No response yet</p>
                    <Button 
                      className="mt-4" 
                      onClick={() => setIsEditing(true)}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Add Response
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">Enquiry Created</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(enquiry.createdAt), 'PPP p')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(enquiry.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>

                {enquiry.responseDate && (
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">Response Sent</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(enquiry.responseDate), 'PPP p')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(enquiry.responseDate), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                )}

                {enquiry.updatedAt !== enquiry.createdAt && (
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-2 h-2 bg-gray-500 rounded-full mt-2" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">Last Updated</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(enquiry.updatedAt), 'PPP p')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(enquiry.updatedAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <EnquiryAssignment
              enquiry={enquiry}
              onAssignmentChange={(updatedEnquiry) => onUpdate(updatedEnquiry)}
            />
            
            <EnquiryEscalation
              enquiry={enquiry}
              onEscalationChange={(updatedEnquiry) => onUpdate(updatedEnquiry)}
            />
          </div>

          <EnquiryFollowUp
            enquiry={enquiry}
            onFollowUpChange={(updatedEnquiry) => onUpdate(updatedEnquiry)}
          />

          {enquiry.satisfactionScore && (
            <EnquirySatisfactionSurvey
              enquiry={enquiry}
            />
          )}

          {/* Additional Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Button variant="outline" className="justify-start">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
                <Button variant="outline" className="justify-start">
                  <Phone className="h-4 w-4 mr-2" />
                  Make Call
                </Button>
                <Button variant="outline" className="justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Follow-up
                </Button>
                <Button variant="outline" className="justify-start">
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}