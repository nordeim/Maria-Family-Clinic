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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Star,
  MessageSquare,
  Send,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Calendar,
  ThumbsUp,
  Flag,
  MoreHorizontal,
  Save,
  X,
  Copy,
  Mail,
  Users
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Review, DoctorResponse } from "./types"

interface DoctorResponseSystemProps {
  doctorId: string
  doctorName: string
  reviews: Review[]
  onCreateResponse?: (reviewId: string, response: Omit<DoctorResponse, 'id' | 'date' | 'doctorId'>) => Promise<void>
  onUpdateResponse?: (reviewId: string, responseId: string, updates: Partial<DoctorResponse>) => Promise<void>
  onDeleteResponse?: (reviewId: string, responseId: string) => Promise<void>
  onFlagReview?: (reviewId: string, reason: string) => Promise<void>
  className?: string
}

interface ResponseTemplate {
  id: string
  name: string
  category: 'positive' | 'neutral' | 'negative' | 'general'
  content: string
  isPublic: boolean
  usageCount: number
}

export function DoctorResponseSystem({
  doctorId,
  doctorName,
  reviews,
  onCreateResponse,
  onUpdateResponse,
  onDeleteResponse,
  onFlagReview,
  className
}: DoctorResponseSystemProps) {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [showResponseDialog, setShowResponseDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [responseContent, setResponseContent] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<ResponseTemplate | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | 'responded' | 'pending'>('all')
  const [filterRating, setFilterRating] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all')

  // Response templates
  const responseTemplates: ResponseTemplate[] = [
    {
      id: '1',
      name: 'Thank Positive Review',
      category: 'positive',
      content: 'Thank you so much for your wonderful review! It truly means a lot to me and my team to know that we provided excellent care. We look forward to serving you again in the future.',
      isPublic: true,
      usageCount: 45
    },
    {
      id: '2',
      name: 'Address Concerns',
      category: 'neutral',
      content: 'Thank you for your feedback. I take all patient concerns seriously and would appreciate the opportunity to discuss your experience further. Please feel free to contact our clinic directly so we can address any issues and improve our service.',
      isPublic: true,
      usageCount: 23
    },
    {
      id: '3',
      name: 'Apologize for Negative Experience',
      category: 'negative',
      content: 'I sincerely apologize that your experience did not meet expectations. Patient satisfaction is my top priority, and I would like to learn more about what we could have done better. Please contact our clinic so we can address your concerns personally.',
      isPublic: true,
      usageCount: 12
    },
    {
      id: '4',
      name: 'General Professional Response',
      category: 'general',
      content: 'Thank you for taking the time to share your feedback. Every patient\'s experience is valuable to me as I strive to provide the best possible care. I appreciate your input and will use it to continue improving our service.',
      isPublic: true,
      usageCount: 34
    }
  ]

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-SG', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRatingCategory = (rating: number) => {
    if (rating >= 4) return 'positive'
    if (rating >= 3) return 'neutral'
    return 'negative'
  }

  const getFilteredReviews = () => {
    let filtered = reviews

    if (filterStatus === 'responded') {
      filtered = filtered.filter(review => review.response)
    } else if (filterStatus === 'pending') {
      filtered = filtered.filter(review => !review.response)
    }

    if (filterRating !== 'all') {
      filtered = filtered.filter(review => getRatingCategory(review.overallRating) === filterRating)
    }

    return filtered
  }

  const handleCreateResponse = async () => {
    if (!selectedReview || !responseContent.trim()) return

    setIsSubmitting(true)
    try {
      await onCreateResponse?.(selectedReview.id, {
        text: responseContent,
        isPublic,
        status: 'active',
      })
      
      setShowResponseDialog(false)
      setSelectedReview(null)
      setResponseContent('')
      setSelectedTemplate(null)
    } catch (error) {
      console.error('Error creating response:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateResponse = async (review: Review) => {
    if (!review.response || !responseContent.trim()) return

    setIsSubmitting(true)
    try {
      await onUpdateResponse?.(review.id, review.response.id, {
        text: responseContent,
        isPublic,
      })
      
      setShowResponseDialog(false)
      setSelectedReview(null)
      setResponseContent('')
      setSelectedTemplate(null)
    } catch (error) {
      console.error('Error updating response:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteResponse = async () => {
    if (!selectedReview || !selectedReview.response) return

    setIsSubmitting(true)
    try {
      await onDeleteResponse?.(selectedReview.id, selectedReview.response.id)
      setShowDeleteDialog(false)
      setSelectedReview(null)
    } catch (error) {
      console.error('Error deleting response:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const openResponseDialog = (review: Review, isEdit = false) => {
    setSelectedReview(review)
    if (isEdit && review.response) {
      setResponseContent(review.response.text)
      setIsPublic(review.response.isPublic)
    } else {
      setResponseContent('')
      setIsPublic(true)
    }
    setShowResponseDialog(true)
  }

  const applyTemplate = (template: ResponseTemplate) => {
    setResponseContent(template.content)
    setIsPublic(template.isPublic)
    setSelectedTemplate(template)
  }

  const renderReviewItem = (review: Review) => {
    const hasResponse = !!review.response
    const ratingCategory = getRatingCategory(review.overallRating)

    return (
      <Card key={review.id} className={cn(
        "border-l-4",
        ratingCategory === 'positive' && "border-l-green-400",
        ratingCategory === 'neutral' && "border-l-yellow-400",
        ratingCategory === 'negative' && "border-l-red-400",
        hasResponse && "border-l-blue-400"
      )}>
        <CardContent className="pt-4">
          <div className="space-y-4">
            {/* Review Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {review.isAnonymous ? 'A' : review.patientInitial}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {review.isAnonymous ? 'Anonymous Patient' : review.patientName}
                    </span>
                    <div className="flex items-center gap-1">
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
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {review.overallRating.toFixed(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(review.date)}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {review.service}
                    </Badge>
                    {review.isVerified && (
                      <Badge variant="outline" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge className={cn(
                  "text-xs",
                  ratingCategory === 'positive' && "bg-green-100 text-green-800",
                  ratingCategory === 'neutral' && "bg-yellow-100 text-yellow-800",
                  ratingCategory === 'negative' && "bg-red-100 text-red-800"
                )}>
                  {ratingCategory.charAt(0).toUpperCase() + ratingCategory.slice(1)}
                </Badge>
                
                {hasResponse && (
                  <Badge className="text-xs bg-blue-100 text-blue-800">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Responded
                  </Badge>
                )}
              </div>
            </div>

            {/* Review Content */}
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm leading-relaxed">{review.comment}</p>
            </div>

            {/* Response Actions */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-2">
                {!hasResponse ? (
                  <Button
                    size="sm"
                    onClick={() => openResponseDialog(review)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Respond
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openResponseDialog(review, true)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Response
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedReview(review)
                        setShowDeleteDialog(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onFlagReview?.(review.id, 'doctor_reported')}
                >
                  <Flag className="h-4 w-4" />
                </Button>
              </div>

              {hasResponse && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Responded {formatDate(review.response!.date)}
                </div>
              )}
            </div>

            {/* Doctor Response Display */}
            {hasResponse && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-medium">DR</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium">Dr. {doctorName}</span>
                      <Badge variant="outline" className="text-xs">
                        {review.response!.isPublic ? 'Public' : 'Private'}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {review.response!.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-blue-800 leading-relaxed">
                      {review.response!.text}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Doctor Response System
          </CardTitle>
          <CardDescription>
            Respond to patient reviews and manage professional communications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters and Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Filter by Status</Label>
              <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reviews</SelectItem>
                  <SelectItem value="pending">Pending Response</SelectItem>
                  <SelectItem value="responded">Responded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Filter by Rating</Label>
              <Select value={filterRating} onValueChange={(value: any) => setFilterRating(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="positive">Positive (4-5 stars)</SelectItem>
                  <SelectItem value="neutral">Neutral (3 stars)</SelectItem>
                  <SelectItem value="negative">Negative (1-2 stars)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Quick Stats</Label>
              <div className="text-sm text-muted-foreground">
                {getFilteredReviews().filter(r => !r.response).length} pending responses
              </div>
            </div>
          </div>

          {/* Response Guidelines */}
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-medium text-yellow-800">Response Guidelines</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Be professional and empathetic in all responses</li>
                  <li>• Never disclose patient-specific medical information</li>
                  <li>• Focus on general service improvements, not individual cases</li>
                  <li>• Use templates for consistency but personalize when possible</li>
                  <li>• Respond within 48 hours when possible</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {getFilteredReviews().map(renderReviewItem)}
            
            {getFilteredReviews().length === 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground" />
                    <h3 className="font-medium">No reviews found</h3>
                    <p className="text-sm text-muted-foreground">
                      {filterStatus === 'all' 
                        ? "No reviews match your current filters."
                        : `No ${filterStatus} reviews found.`
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Response Dialog */}
      <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {selectedReview?.response ? 'Edit Response' : 'Create Response'}
            </DialogTitle>
            <DialogDescription>
              Respond professionally to patient feedback
            </DialogDescription>
          </DialogHeader>

          {selectedReview && (
            <div className="space-y-4">
              {/* Original Review Summary */}
              <div className="bg-gray-50 p-3 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-3 w-3",
                          i < selectedReview.overallRating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        )}
                      />
                    ))}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {selectedReview.overallRating.toFixed(1)} stars
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {selectedReview.isAnonymous ? 'Anonymous' : selectedReview.patientName}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {selectedReview.comment}
                </p>
              </div>

              {/* Response Templates */}
              <div className="space-y-2">
                <Label>Templates (Click to use)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {responseTemplates.map((template) => (
                    <Button
                      key={template.id}
                      variant="outline"
                      size="sm"
                      onClick={() => applyTemplate(template)}
                      className="justify-start text-left h-auto p-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-xs">{template.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {template.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {template.content}
                        </p>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Response Content */}
              <div className="space-y-2">
                <Label htmlFor="response-content">Your Response</Label>
                <Textarea
                  id="response-content"
                  placeholder="Write your professional response..."
                  value={responseContent}
                  onChange={(e) => setResponseContent(e.target.value)}
                  rows={4}
                />
                <div className="text-xs text-muted-foreground">
                  {responseContent.length}/500 characters
                </div>
              </div>

              {/* Response Settings */}
              <div className="space-y-3">
                <Label>Response Settings</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is-public"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="is-public" className="text-sm flex items-center gap-2">
                    {isPublic ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    {isPublic ? 'Public Response' : 'Private Response'}
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  {isPublic 
                    ? 'This response will be visible to other patients viewing this review.'
                    : 'This response will only be visible to the patient and clinic staff.'
                  }
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResponseDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => selectedReview?.response 
                ? handleUpdateResponse(selectedReview)
                : handleCreateResponse()
              }
              disabled={!responseContent.trim() || isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (
                selectedReview?.response ? 'Update Response' : 'Post Response'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Response Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Response</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your response? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteResponse}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? 'Deleting...' : 'Delete Response'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
