import * as React from "react"
import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Star,
  Shield,
  AlertTriangle,
  CheckCircle,
  X,
  Flag,
  UserCheck,
  Clock,
  Filter,
  Search,
  Calendar,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Camera,
  FileText,
  Brain,
  Bot,
  User,
  Eye,
  EyeOff,
  Lock,
  Trash2,
  Edit,
  Send,
  BarChart3
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { 
  ModerationQueue, 
  ModerationAction, 
  Review, 
  DoctorResponse,
  FlagReason 
} from "./types"

interface ReviewModerationDashboardProps {
  className?: string
  onModerateReview?: (reviewId: string, action: ModerationAction) => Promise<void>
  onAssignReviewer?: (queueId: string, reviewerId: string) => Promise<void>
}

interface ModerationStats {
  total: number
  pending: number
  approved: number
  rejected: number
  flagged: number
  averageResponseTime: number
  autoModerated: number
  manuallyReviewed: number
}

export function ReviewModerationDashboard({
  className,
  onModerateReview,
  onAssignReviewer,
}: ReviewModerationDashboardProps) {
  const [selectedQueue, setSelectedQueue] = useState<ModerationQueue | null>(null)
  const [showActionDialog, setShowActionDialog] = useState(false)
  const [actionType, setActionType] = useState<ModerationAction['type'] | null>(null)
  const [moderationNotes, setModerationNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("queue")
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPriority, setFilterPriority] = useState<string>('all')

  // Mock data - in real app this would come from API
  const moderationStats: ModerationStats = {
    total: 1247,
    pending: 23,
    approved: 1089,
    rejected: 89,
    flagged: 46,
    averageResponseTime: 4.2,
    autoModerated: 892,
    manuallyReviewed: 355
  }

  const moderationQueue: ModerationQueue[] = [
    {
      id: '1',
      type: 'new_review',
      reviewId: 'review_1',
      priority: 'high',
      status: 'pending',
      createdDate: new Date('2024-11-03'),
      deadline: new Date('2024-11-05'),
      reviewerNotes: 'Auto-detected potential spam content'
    },
    {
      id: '2',
      type: 'flagged_review',
      reviewId: 'review_2',
      priority: 'urgent',
      status: 'in_review',
      assignedTo: 'moderator_1',
      createdDate: new Date('2024-11-02'),
      deadline: new Date('2024-11-04'),
      reviewerNotes: 'Multiple user reports for inappropriate content'
    },
    {
      id: '3',
      type: 'photo_upload',
      priority: 'medium',
      status: 'pending',
      createdDate: new Date('2024-11-03'),
      reviewerNotes: 'Photo requires PHI redaction verification'
    },
    {
      id: '4',
      type: 'edit_request',
      reviewId: 'review_4',
      priority: 'low',
      status: 'pending',
      createdDate: new Date('2024-11-01'),
      reviewerNotes: 'User requested edit to remove personal information'
    }
  ]

  const aiModerationResults = [
    {
      reviewId: 'review_5',
      confidence: 0.92,
      action: 'approve' as const,
      reasons: ['legitimate_patient_experience', 'appropriate_language'],
      flags: []
    },
    {
      reviewId: 'review_6',
      confidence: 0.87,
      action: 'flag' as const,
      reasons: ['potential_spam', 'repetitive_content'],
      flags: ['spam_detection', 'content_similarity']
    },
    {
      reviewId: 'review_7',
      confidence: 0.76,
      action: 'review' as const,
      reasons: ['medical_advice_mentioned'],
      flags: ['medical_advice']
    }
  ]

  const mockReviews: Record<string, Review> = {
    'review_1': {
      id: 'review_1',
      patientName: 'John Doe',
      patientInitial: 'JD',
      isAnonymous: false,
      dimensions: {
        overallRating: 5,
        bedsideManner: 5,
        communication: 5,
        waitTime: 3,
        treatmentEffectiveness: 5,
        facilityEnvironment: 4,
        painManagement: 0,
        followUpCare: 5,
      },
      overallRating: 5,
      comment: 'Dr. Smith was amazing! She took time to explain everything clearly and made me feel comfortable throughout my treatment. Highly recommended!',
      date: new Date('2024-11-03'),
      service: 'General Consultation',
      clinic: 'My Family Clinic',
      isVerified: true,
      verificationMethod: 'appointment',
      helpful: 15,
      notHelpful: 2,
      isFlagged: false,
      status: 'pending_moderation',
      credibilityScore: 85,
      tags: ['helpful', 'thorough'],
      outcome: {
        effectiveness: 'very_effective',
        improvementTimeframe: 'Immediate',
        sideEffects: [],
        wouldRecommend: true,
        wouldReturn: true
      }
    },
    'review_2': {
      id: 'review_2',
      patientName: 'Jane Smith',
      patientInitial: 'JS',
      isAnonymous: true,
      dimensions: {
        overallRating: 2,
        bedsideManner: 1,
        communication: 2,
        waitTime: 5,
        treatmentEffectiveness: 1,
        facilityEnvironment: 2,
        painManagement: 0,
        followUpCare: 1,
      },
      overallRating: 2,
      comment: 'Terrible experience. Doctor was rude and didn\'t listen to my concerns. Wait time was over 2 hours. Would not recommend.',
      date: new Date('2024-11-02'),
      service: 'Follow-up Consultation',
      clinic: 'My Family Clinic',
      isVerified: true,
      verificationMethod: 'verified_patient',
      helpful: 3,
      notHelpful: 8,
      isFlagged: true,
      flagReasons: [
        {
          type: 'inappropriate',
          reason: 'Inappropriate language towards healthcare professional',
          reportedBy: 'multiple_users',
          reportedDate: new Date('2024-11-02'),
          severity: 'medium'
        }
      ],
      status: 'flagged',
      credibilityScore: 45,
      tags: ['negative', 'wait_time'],
    }
  }

  const getPriorityColor = (priority: ModerationQueue['priority']) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    }
    return colors[priority]
  }

  const getStatusColor = (status: ModerationQueue['status']) => {
    const colors = {
      pending: 'bg-blue-100 text-blue-800',
      in_review: 'bg-purple-100 text-purple-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      needs_revision: 'bg-yellow-100 text-yellow-800'
    }
    return colors[status]
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-SG', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeUntilDeadline = (deadline: Date) => {
    const now = new Date()
    const diff = deadline.getTime() - now.getTime()
    const hours = Math.ceil(diff / (1000 * 60 * 60))
    
    if (hours < 0) return 'Overdue'
    if (hours < 24) return `${hours}h remaining`
    return `${Math.ceil(hours / 24)}d remaining`
  }

  const handleModerationAction = async () => {
    if (!selectedQueue || !actionType) return

    setIsSubmitting(true)
    try {
      const action: ModerationAction = {
        type: actionType,
        reason: moderationNotes,
        notes: moderationNotes,
        performedBy: 'current_moderator',
        performedDate: new Date(),
        userNotification: true
      }

      await onModerateReview?.(selectedQueue.reviewId!, action)
      setShowActionDialog(false)
      setSelectedQueue(null)
      setActionType(null)
      setModerationNotes('')
    } catch (error) {
      console.error('Error performing moderation action:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderQueueItem = (queue: ModerationQueue) => {
    const review = queue.reviewId ? mockReviews[queue.reviewId] : null
    
    return (
      <Card key={queue.id} className="border-l-4 border-l-orange-400">
        <CardContent className="pt-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className={cn("text-xs", getPriorityColor(queue.priority))}>
                  {queue.priority.toUpperCase()}
                </Badge>
                <Badge className={cn("text-xs", getStatusColor(queue.status))}>
                  {queue.status.replace('_', ' ').toUpperCase()}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {queue.type.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                {getTimeUntilDeadline(queue.deadline!)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Created:</span>
                <div className="font-medium">{formatDate(queue.createdDate)}</div>
              </div>
              {queue.assignedTo && (
                <div>
                  <span className="text-muted-foreground">Assigned to:</span>
                  <div className="font-medium">{queue.assignedTo}</div>
                </div>
              )}
            </div>

            {queue.reviewerNotes && (
              <div className="bg-yellow-50 p-2 rounded text-xs">
                <span className="font-medium">Moderator Notes:</span> {queue.reviewerNotes}
              </div>
            )}

            {review && (
              <div className="bg-gray-50 p-3 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-3 w-3",
                          i < review.overallRating 
                            ? "fill-yellow-400 text-yellow-400" 
                            : "text-gray-300"
                        )}
                      />
                    ))}
                    <span className="text-sm font-medium ml-1">
                      {review.overallRating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {review.patientName}
                  </span>
                  {review.isAnonymous && (
                    <Badge variant="secondary" className="text-xs">
                      <EyeOff className="h-3 w-3 mr-1" />
                      Anonymous
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {review.comment}
                </p>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                onClick={() => setSelectedQueue(queue)}
                disabled={queue.status === 'approved' || queue.status === 'rejected'}
              >
                <Eye className="h-4 w-4 mr-1" />
                Review
              </Button>
              {queue.status === 'pending' && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onAssignReviewer?.(queue.id, 'current_moderator')}
                >
                  <UserCheck className="h-4 w-4 mr-1" />
                  Assign to Me
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderAIModeration = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">AI Moderation Results</h4>
          <Badge variant="outline" className="text-xs">
            <Bot className="h-3 w-3 mr-1" />
            Automated
          </Badge>
        </div>
        
        {aiModerationResults.map((result) => (
          <Card key={result.reviewId} className="border-l-4 border-l-blue-400">
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={cn(
                      "text-xs",
                      result.action === 'approve' ? "bg-green-100 text-green-800" :
                      result.action === 'flag' ? "bg-red-100 text-red-800" :
                      "bg-yellow-100 text-yellow-800"
                    )}>
                      {result.action.toUpperCase()} ({Math.round(result.confidence * 100)}%)
                    </Badge>
                  </div>
                  <Button size="sm" variant="outline">
                    <Eye className="h-3 w-3 mr-1" />
                    View Details
                  </Button>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-muted-foreground">Detection Reasons:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {result.reasons.map((reason) => (
                        <Badge key={reason} variant="outline" className="text-xs">
                          {reason.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {result.flags.length > 0 && (
                    <div>
                      <span className="text-xs text-muted-foreground">Flags:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {result.flags.map((flag) => (
                          <Badge key={flag} variant="destructive" className="text-xs">
                            {flag.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const renderStatsOverview = () => {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-center space-y-1">
              <p className="text-2xl font-bold text-blue-600">{moderationStats.pending}</p>
              <p className="text-xs text-muted-foreground">Pending Review</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="text-center space-y-1">
              <p className="text-2xl font-bold text-green-600">{moderationStats.approved}</p>
              <p className="text-xs text-muted-foreground">Approved</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="text-center space-y-1">
              <p className="text-2xl font-bold text-red-600">{moderationStats.flagged}</p>
              <p className="text-xs text-muted-foreground">Flagged</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="text-center space-y-1">
              <p className="text-2xl font-bold text-purple-600">{moderationStats.averageResponseTime}h</p>
              <p className="text-xs text-muted-foreground">Avg Response</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Review Moderation Dashboard
          </CardTitle>
          <CardDescription>
            Manage review moderation queue, AI-powered detection, and quality control
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stats Overview */}
          {renderStatsOverview()}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="queue" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Moderation Queue
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                AI Detection
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="queue" className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search reviews..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Queue Items */}
              <div className="space-y-4">
                {moderationQueue
                  .filter(queue => filterPriority === 'all' || queue.priority === filterPriority)
                  .map(renderQueueItem)}
              </div>
            </TabsContent>

            <TabsContent value="ai">
              {renderAIModeration()}
            </TabsContent>

            <TabsContent value="analytics">
              <Card>
                <CardContent className="pt-4">
                  <div className="text-center space-y-2">
                    <BarChart3 className="h-8 w-8 mx-auto text-muted-foreground" />
                    <h4 className="font-medium">Moderation Analytics</h4>
                    <p className="text-sm text-muted-foreground">
                      Detailed analytics and insights coming soon
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Review Action Dialog */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Moderate Review</DialogTitle>
            <DialogDescription>
              Review the content and take appropriate action
            </DialogDescription>
          </DialogHeader>
          
          {selectedQueue && selectedQueue.reviewId && (
            <div className="space-y-4">
              {selectedQueue.reviewId && mockReviews[selectedQueue.reviewId] && (
                <div className="bg-gray-50 p-4 rounded">
                  <h4 className="font-medium mb-2">Review Content</h4>
                  <p className="text-sm">{mockReviews[selectedQueue.reviewId].comment}</p>
                </div>
              )}

              <div className="space-y-3">
                <Label>Action</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'approve', label: 'Approve', icon: CheckCircle, color: 'text-green-600' },
                    { value: 'reject', label: 'Reject', icon: X, color: 'text-red-600' },
                    { value: 'edit', label: 'Request Edit', icon: Edit, color: 'text-yellow-600' },
                    { value: 'flag', label: 'Flag for Review', icon: Flag, color: 'text-orange-600' },
                  ].map((action) => (
                    <Button
                      key={action.value}
                      variant={actionType === action.value ? "default" : "outline"}
                      onClick={() => setActionType(action.value as any)}
                      className="justify-start"
                    >
                      <action.icon className={cn("h-4 w-4 mr-2", action.color)} />
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="moderation-notes">Moderation Notes</Label>
                <Textarea
                  id="moderation-notes"
                  placeholder="Add notes about your decision..."
                  value={moderationNotes}
                  onChange={(e) => setModerationNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="notify-user"
                  className="rounded"
                />
                <Label htmlFor="notify-user" className="text-sm">
                  Notify user of moderation decision
                </Label>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActionDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleModerationAction}
              disabled={!actionType || isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Confirm Action'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
