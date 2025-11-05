import * as React from "react"
import { useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Calendar,
  MoreHorizontal,
  Flag,
  Edit,
  Shield,
  Camera,
  FileText,
  Heart,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  X,
  Eye,
  EyeOff,
  Lock
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Review, ReviewDimensions, DoctorResponse } from "./types"

interface ReviewDisplayProps {
  review: Review
  onMarkHelpful?: (reviewId: string, helpful: boolean) => void
  onReport?: (reviewId: string, reason: string) => void
  onEdit?: (reviewId: string) => void
  onDelete?: (reviewId: string) => void
  onViewPrivateFeedback?: (reviewId: string) => void
  className?: string
  showFullDetails?: boolean
  compact?: boolean
}

export function ReviewDisplay({
  review,
  onMarkHelpful,
  onReport,
  onEdit,
  onDelete,
  onViewPrivateFeedback,
  className,
  showFullDetails = true,
  compact = false,
}: ReviewDisplayProps) {
  const [showFullComment, setShowFullComment] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [localHelpful, setLocalHelpful] = useState(review.helpful)
  const [localNotHelpful, setLocalNotHelpful] = useState(review.notHelpful)

  const getRatingStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'sm') => {
    const starSizes = {
      sm: "h-4 w-4",
      md: "h-5 w-5", 
      lg: "h-6 w-6"
    }
    const starSize = starSizes[size]
    
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          starSize,
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        )}
      />
    ))
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-SG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getDimensionRating = (dimension: keyof ReviewDimensions) => {
    return review.dimensions[dimension] || 0
  }

  const handleHelpfulVote = (helpful: boolean) => {
    setLocalHelpful(prev => helpful ? prev + 1 : prev)
    setLocalNotHelpful(prev => !helpful ? prev + 1 : prev)
    onMarkHelpful?.(review.id, helpful)
  }

  const getPatientDisplayName = () => {
    return review.isAnonymous ? 'Anonymous Patient' : review.patientName
  }

  const getPatientInitial = () => {
    return review.isAnonymous ? 'A' : review.patientInitial
  }

  const getVerificationBadge = () => {
    const badges = {
      'appointment': { label: 'Verified Patient', color: 'bg-green-100 text-green-800' },
      'verified_patient': { label: 'Identity Verified', color: 'bg-blue-100 text-blue-800' },
      'identity_verified': { label: 'ID Verified', color: 'bg-purple-100 text-purple-800' },
      'manual': { label: 'Manual Verification', color: 'bg-gray-100 text-gray-800' }
    }
    
    const badge = badges[review.verificationMethod]
    if (!badge) return null

    return (
      <Badge variant="secondary" className={cn("text-xs", badge.color)}>
        {badge.label}
      </Badge>
    )
  }

  const getStatusIndicator = () => {
    switch (review.status) {
      case 'pending_moderation':
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  Pending Review
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>This review is under moderation review</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      case 'flagged':
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="destructive" className="text-xs">
                  <Flag className="h-3 w-3 mr-1" />
                  Flagged
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>This review has been flagged for review</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      default:
        return null
    }
  }

  const getSentimentIndicator = () => {
    const overallRating = review.overallRating
    if (overallRating >= 4) {
      return (
        <div className="flex items-center gap-1 text-green-600">
          <TrendingUp className="h-4 w-4" />
          <span className="text-xs font-medium">Positive</span>
        </div>
      )
    } else if (overallRating <= 2) {
      return (
        <div className="flex items-center gap-1 text-red-600">
          <TrendingDown className="h-4 w-4" />
          <span className="text-xs font-medium">Negative</span>
        </div>
      )
    } else {
      return (
        <div className="flex items-center gap-1 text-gray-600">
          <span className="text-xs font-medium">Neutral</span>
        </div>
      )
    }
  }

  const getCredibilityScore = () => {
    const score = review.credibilityScore
    if (score >= 80) {
      return { label: 'High', color: 'text-green-600', icon: Shield }
    } else if (score >= 60) {
      return { label: 'Medium', color: 'text-yellow-600', icon: AlertTriangle }
    } else {
      return { label: 'Low', color: 'text-red-600', icon: AlertTriangle }
    }
  }

  const credibility = getCredibilityScore()
  const CredibilityIcon = credibility.icon

  const renderDimensionRatings = () => {
    if (compact) return null

    const dimensions = [
      { key: 'bedsideManner' as keyof ReviewDimensions, label: 'Bedside Manner', icon: Heart },
      { key: 'communication' as keyof ReviewDimensions, label: 'Communication', icon: MessageSquare },
      { key: 'waitTime' as keyof ReviewDimensions, label: 'Wait Time', icon: Clock },
      { key: 'treatmentEffectiveness' as keyof ReviewDimensions, label: 'Treatment', icon: CheckCircle },
    ]

    return (
      <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg">
        {dimensions.map(({ key, label, icon: Icon }) => {
          const rating = getDimensionRating(key)
          if (rating === 0) return null

          return (
            <div key={key} className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className="text-xs font-medium">{rating}/5</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {getRatingStars(rating, 'sm')}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const renderAttachments = () => {
    if (!review.attachments || review.attachments.length === 0 || compact) return null

    return (
      <div className="flex flex-wrap gap-2">
        {review.attachments.map((attachment) => {
          const icons = {
            photo: Camera,
            document: FileText,
            prescription: FileText,
            report: FileText,
          }
          const Icon = icons[attachment.type]

          return (
            <TooltipProvider key={attachment.id}>
              <Tooltip>
                <TooltipTrigger>
                  <Button variant="outline" size="sm" className="h-8 px-2">
                    <Icon className="h-3 w-3 mr-1" />
                    {attachment.type}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{attachment.fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {attachment.isPHIRedacted ? 'PHI Redacted' : 'Pending Review'}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        })}
      </div>
    )
  }

  const renderOutcome = () => {
    if (!review.outcome || compact) return null

    return (
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <Heart className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">Treatment Outcome</span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Effectiveness:</span>
            <div className="capitalize font-medium">{review.outcome.effectiveness.replace('_', ' ')}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Would Recommend:</span>
            <div className="font-medium">
              {review.outcome.wouldRecommend ? 'Yes' : 'No'}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderComment = () => {
    const maxLength = compact ? 150 : 500
    const comment = review.comment
    const isLongComment = comment.length > maxLength
    const displayComment = showFullComment || !isLongComment 
      ? comment 
      : comment.substring(0, maxLength) + '...'

    return (
      <div className="space-y-2">
        <p className={cn(
          "text-sm leading-relaxed",
          compact && "line-clamp-3"
        )}>
          {displayComment}
        </p>
        {isLongComment && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFullComment(!showFullComment)}
            className="h-auto p-0 text-xs"
          >
            {showFullComment ? (
              <>
                <EyeOff className="h-3 w-3 mr-1" />
                Show Less
              </>
            ) : (
              <>
                <Eye className="h-3 w-3 mr-1" />
                Show More
              </>
            )}
          </Button>
        )}
      </div>
    )
  }

  const renderTags = () => {
    if (!review.tags || review.tags.length === 0 || compact) return null

    return (
      <div className="flex flex-wrap gap-1">
        {review.tags.map((tag) => (
          <Badge key={tag} variant="outline" className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>
    )
  }

  return (
    <>
      <Card className={cn("border-l-4", className, {
        "border-l-green-400": review.overallRating >= 4,
        "border-l-yellow-400": review.overallRating === 3,
        "border-l-red-400": review.overallRating <= 2,
        "border-l-gray-300": review.status !== 'active',
      })}>
        <CardContent className="pt-4">
          <div className="space-y-4">
            {/* Review Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className={cn("flex-shrink-0", compact ? "h-8 w-8" : "h-10 w-10")}>
                  <AvatarFallback className={cn(
                    "font-medium",
                    review.isAnonymous 
                      ? "bg-gray-100 text-gray-600" 
                      : "bg-primary/10 text-primary"
                  )}>
                    {getPatientInitial()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm truncate">
                      {getPatientDisplayName()}
                    </p>
                    {getVerificationBadge()}
                    {getStatusIndicator()}
                    {review.isAnonymous && (
                      <Badge variant="secondary" className="text-xs">
                        <EyeOff className="h-3 w-3 mr-1" />
                        Anonymous
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <div className="flex items-center gap-1">
                      {getRatingStars(review.overallRating, compact ? 'sm' : 'md')}
                      <span className="text-sm font-medium ml-1">
                        {review.overallRating.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(review.date)}
                    </span>
                    {getSentimentIndicator()}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <CredibilityIcon className={cn("h-3 w-3", credibility.color)} />
                      <span className={credibility.color}>
                        {credibility.label} Credibility
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex-shrink-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => onEdit?.(review.id)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Review
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onViewPrivateFeedback?.(review.id)}>
                    <Lock className="h-4 w-4 mr-2" />
                    View Private Feedback
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setShowReportDialog(true)}
                    className="text-red-600"
                  >
                    <Flag className="h-4 w-4 mr-2" />
                    Report Review
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-red-600"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Delete Review
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Service & Clinic Info */}
            {showFullDetails && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-xs">
                  {review.service}
                </Badge>
                <span>•</span>
                <span>{review.clinic}</span>
                {review.appointmentId && (
                  <>
                    <span>•</span>
                    <Badge variant="outline" className="text-xs">
                      Verified Appointment
                    </Badge>
                  </>
                )}
              </div>
            )}

            {/* Dimension Ratings */}
            {renderDimensionRatings()}

            {/* Comment */}
            {renderComment()}

            {/* Tags */}
            {renderTags()}

            {/* Attachments */}
            {renderAttachments()}

            {/* Treatment Outcome */}
            {renderOutcome()}

            {/* Actions & Footer */}
            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex items-center gap-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleHelpfulVote(true)}
                        className="h-8 px-2"
                      >
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        <span className="text-xs">
                          Helpful ({localHelpful})
                        </span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Mark this review as helpful</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleHelpfulVote(false)}
                        className="h-8 px-2"
                      >
                        <ThumbsDown className="h-3 w-3 mr-1" />
                        <span className="text-xs">
                          Not Helpful ({localNotHelpful})
                        </span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Mark this review as not helpful</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {review.response && (
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    <span className="text-xs">Doctor Responded</span>
                  </Button>
                )}
              </div>

              <div className="text-xs text-muted-foreground">
                Review ID: {review.id.slice(-8)}
              </div>
            </div>

            {/* Doctor Response */}
            {review.response && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 ml-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                      DR
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-sm font-medium">Doctor Response</p>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(review.response.date)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {review.response.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-blue-800 leading-relaxed">
                      {review.response.text}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Report Dialog */}
      <AlertDialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Report Review</AlertDialogTitle>
            <AlertDialogDescription>
              Please let us know why you are reporting this review. All reports are reviewed by our moderation team.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason for reporting:</label>
              <div className="grid gap-2">
                {[
                  'Spam or fake review',
                  'Inappropriate content',
                  'Violence or harassment',
                  'Medical advice',
                  'Privacy violation',
                  'Other'
                ].map((reason) => (
                  <Button
                    key={reason}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onReport?.(review.id, reason)
                      setShowReportDialog(false)
                    }}
                    className="justify-start text-left"
                  >
                    {reason}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this review? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete?.(review.id)
                setShowDeleteDialog(false)
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Review
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
