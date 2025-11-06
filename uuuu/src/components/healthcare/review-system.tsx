import * as React from "react"
import { 
  Star, 
  StarHalf, 
  ThumbsUp, 
  ThumbsDown, 
  Shield, 
  CheckCircle, 
  MessageSquare,
  Calendar,
  User,
  Flag,
  TrendingUp,
  TrendingDown
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

// Star Rating Component
interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onRatingChange?: (rating: number) => void
  className?: string
}

const StarRating = React.forwardRef<HTMLDivElement, StarRatingProps>(
  ({ rating, maxRating = 5, size = 'md', interactive = false, onRatingChange, className, ...props }, ref) => {
    const [hoverRating, setHoverRating] = React.useState(0)
    
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6'
    }

    const renderStar = (index: number) => {
      const filled = (hoverRating || rating) >= index + 1
      const halfFilled = (hoverRating || rating) >= index + 0.5 && (hoverRating || rating) < index + 1
      
      const baseClasses = cn(
        sizeClasses[size],
        interactive ? 'cursor-pointer hover:scale-110 transition-transform' : '',
        className
      )

      if (halfFilled) {
        return (
          <div key={index} className={baseClasses}>
            <StarHalf className="h-full w-full fill-yellow-400 text-yellow-400" />
          </div>
        )
      }

      return (
        <div
          key={index}
          className={baseClasses}
          onClick={() => interactive && onRatingChange?.(index + 1)}
          onMouseEnter={() => interactive && setHoverRating(index + 1)}
          onMouseLeave={() => interactive && setHoverRating(0)}
        >
          <Star
            className={cn(
              "h-full w-full",
              filled ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            )}
          />
        </div>
      )
    }

    return (
      <div ref={ref} className="flex items-center gap-0.5" {...props}>
        {Array.from({ length: maxRating }, (_, index) => renderStar(index))}
      </div>
    )
  }
)
StarRating.displayName = "StarRating"

// Rating Summary Component
interface RatingSummaryProps {
  overallRating: number
  totalReviews: number
  ratingDistribution?: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
  showDistribution?: boolean
  className?: string
}

const RatingSummary = React.forwardRef<HTMLDivElement, RatingSummaryProps>(
  ({ overallRating, totalReviews, ratingDistribution, showDistribution = false, className, ...props }, ref) => {
    const getRatingLevel = (rating: number) => {
      if (rating >= 4.5) return 'Excellent'
      if (rating >= 4.0) return 'Very Good'
      if (rating >= 3.5) return 'Good'
      if (rating >= 3.0) return 'Average'
      return 'Needs Improvement'
    }

    const getRatingColor = (rating: number) => {
      if (rating >= 4.5) return 'text-green-600'
      if (rating >= 4.0) return 'text-blue-600'
      if (rating >= 3.5) return 'text-yellow-600'
      if (rating >= 3.0) return 'text-orange-600'
      return 'text-red-600'
    }

    const level = getRatingLevel(overallRating)
    const colorClass = getRatingColor(overallRating)

    return (
      <div ref={ref} className={cn("space-y-3", className)} {...props}>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className={cn("text-3xl font-bold", colorClass)}>
              {overallRating.toFixed(1)}
            </div>
            <StarRating rating={overallRating} size="md" interactive={false} />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">{level}</div>
            <div className="text-sm text-gray-500">
              Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {showDistribution && ratingDistribution && (
          <div className="space-y-1">
            {Object.entries(ratingDistribution)
              .sort(([a], [b]) => Number(b) - Number(a))
              .map(([stars, count]) => (
                <div key={stars} className="flex items-center gap-2 text-sm">
                  <span className="w-3">{stars}★</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 transition-all duration-300"
                      style={{
                        width: `${totalReviews > 0 ? (count / totalReviews) * 100 : 0}%`
                      }}
                    />
                  </div>
                  <span className="w-8 text-xs text-gray-500">{count}</span>
                </div>
              ))}
          </div>
        )}
      </div>
    )
  }
)
RatingSummary.displayName = "RatingSummary"

// Review Card Component
interface Review {
  id: string
  userId?: string
  userName?: string
  userAvatar?: string
  rating: number
  comment: string
  date: Date
  isVerified: boolean
  isAnonymous?: boolean
  helpfulVotes?: number
  notHelpfulVotes?: number
  serviceType?: string
  waitTime?: string
  wouldRecommend?: boolean
}

interface ReviewCardProps {
  review: Review
  onHelpful?: (reviewId: string) => void
  onReport?: (reviewId: string) => void
  className?: string
}

const ReviewCard = React.forwardRef<HTMLDivElement, ReviewCardProps>(
  ({ review, onHelpful, onReport, className, ...props }, ref) => {
    const formatDate = (date: Date) => {
      const now = new Date()
      const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
      
      if (diffInDays === 0) return 'Today'
      if (diffInDays === 1) return 'Yesterday'
      if (diffInDays < 7) return `${diffInDays} days ago`
      if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
      if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`
      return date.toLocaleDateString()
    }

    return (
      <Card ref={ref} className={cn("", className)} {...props}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={review.userAvatar} />
              <AvatarFallback>
                {review.isAnonymous ? 'U' : (review.userName || 'U').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">
                    {review.isAnonymous ? 'Anonymous User' : review.userName || 'User'}
                  </span>
                  {review.isVerified && (
                    <Badge variant="success" className="text-xs gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-gray-500">{formatDate(review.date)}</span>
              </div>

              <div className="flex items-center gap-2">
                <StarRating rating={review.rating} size="sm" />
                <span className="text-sm font-medium">{review.rating}/5</span>
                {review.waitTime && (
                  <Badge variant="outline" className="text-xs">
                    Wait: {review.waitTime}
                  </Badge>
                )}
                {review.serviceType && (
                  <Badge variant="secondary" className="text-xs">
                    {review.serviceType}
                  </Badge>
                )}
              </div>

              <p className="text-sm text-gray-700 leading-relaxed">{review.comment}</p>

              {review.wouldRecommend !== undefined && (
                <div className="flex items-center gap-1 text-xs">
                  {review.wouldRecommend ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <span className={cn(
                    "text-xs",
                    review.wouldRecommend ? "text-green-600" : "text-red-600"
                  )}>
                    {review.wouldRecommend ? 'Would recommend' : 'Would not recommend'}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-4 pt-2">
                {onHelpful && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs"
                    onClick={() => onHelpful(review.id)}
                  >
                    <ThumbsUp className="h-3 w-3 mr-1" />
                    Helpful
                    {review.helpfulVotes && review.helpfulVotes > 0 && (
                      <span className="ml-1">({review.helpfulVotes})</span>
                    )}
                  </Button>
                )}
                
                {onReport && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs text-gray-500"
                    onClick={() => onReport(review.id)}
                  >
                    <Flag className="h-3 w-3 mr-1" />
                    Report
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
)
ReviewCard.displayName = "ReviewCard"

// Reviews List Component
interface ReviewsListProps {
  reviews: Review[]
  onHelpful?: (reviewId: string) => void
  onReport?: (reviewId: string) => void
  showLoadMore?: boolean
  onLoadMore?: () => void
  isLoading?: boolean
  className?: string
}

const ReviewsList = React.forwardRef<HTMLDivElement, ReviewsListProps>(
  ({ 
    reviews, 
    onHelpful, 
    onReport, 
    showLoadMore = false, 
    onLoadMore, 
    isLoading = false, 
    className,
    ...props 
  }, ref) => {
    if (reviews.length === 0) {
      return (
        <div ref={ref} className="text-center py-8" {...props}>
          <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
          <p className="text-gray-500">Be the first to share your experience!</p>
        </div>
      )
    }

    return (
      <div ref={ref} className={cn("space-y-4", className)} {...props}>
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            onHelpful={onHelpful}
            onReport={onReport}
          />
        ))}
        
        {showLoadMore && onLoadMore && (
          <div className="text-center pt-4">
            <Button
              variant="outline"
              onClick={onLoadMore}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Load More Reviews'}
            </Button>
          </div>
        )}
      </div>
    )
  }
)
ReviewsList.displayName = "ReviewsList"

// Review Summary Component
interface ReviewSummaryProps {
  summary: {
    totalReviews: number
    overallRating: number
    ratingDistribution: {
      5: number
      4: number
      3: number
      2: number
      1: number
    }
    recentTrend: 'improving' | 'declining' | 'stable'
    verifiedPercentage: number
  }
  className?: string
}

const ReviewSummary = React.forwardRef<HTMLDivElement, ReviewSummaryProps>(
  ({ summary, className, ...props }, ref) => {
    const { totalReviews, overallRating, ratingDistribution, recentTrend, verifiedPercentage } = summary

    const getTrendIcon = () => {
      switch (recentTrend) {
        case 'improving':
          return <TrendingUp className="h-4 w-4 text-green-600" />
        case 'declining':
          return <TrendingDown className="h-4 w-4 text-red-600" />
        default:
          return null
      }
    }

    const getTrendText = () => {
      switch (recentTrend) {
        case 'improving':
          return 'Rating improving'
        case 'declining':
          return 'Rating declining'
        default:
          return 'Rating stable'
      }
    }

    return (
      <Card ref={ref} className={cn("", className)} {...props}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Reviews Summary</span>
            {recentTrend !== 'stable' && (
              <div className="flex items-center gap-1 text-sm">
                {getTrendIcon()}
                <span className={cn(
                  "text-xs",
                  recentTrend === 'improving' ? "text-green-600" : "text-red-600"
                )}>
                  {getTrendText()}
                </span>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RatingSummary
            overallRating={overallRating}
            totalReviews={totalReviews}
            ratingDistribution={ratingDistribution}
            showDistribution={true}
          />
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="text-gray-600">{verifiedPercentage}% verified reviews</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
)
ReviewSummary.displayName = "ReviewSummary"

// Add Review Form Component
interface AddReviewFormProps {
  onSubmit: (review: Omit<Review, 'id' | 'date'>) => void
  onCancel?: () => void
  isLoading?: boolean
  serviceTypes?: string[]
  className?: string
}

const AddReviewForm = React.forwardRef<HTMLDivElement, AddReviewFormProps>(
  ({ onSubmit, onCancel, isLoading = false, serviceTypes = [], className, ...props }, ref) => {
    const [rating, setRating] = React.useState(0)
    const [comment, setComment] = React.useState('')
    const [serviceType, setServiceType] = React.useState('')
    const [waitTime, setWaitTime] = React.useState('')
    const [wouldRecommend, setWouldRecommend] = React.useState<boolean | null>(null)
    const [isAnonymous, setIsAnonymous] = React.useState(false)
    const [errors, setErrors] = React.useState<Record<string, string>>({})

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      
      const newErrors: Record<string, string> = {}
      if (!rating) newErrors.rating = 'Please select a rating'
      if (!comment.trim()) newErrors.comment = 'Please write a review'
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        return
      }

      onSubmit({
        rating,
        comment: comment.trim(),
        isVerified: true,
        isAnonymous,
        serviceType: serviceType || undefined,
        waitTime: waitTime || undefined,
        wouldRecommend: wouldRecommend !== null ? wouldRecommend : undefined
      })
    }

    const waitTimeOptions = [
      'Under 15 min',
      '15-30 min',
      '30-45 min',
      '45-60 min',
      'Over 1 hour'
    ]

    return (
      <Card ref={ref} className={cn("", className)} {...props}>
        <CardHeader>
          <CardTitle className="text-lg">Write a Review</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Rating */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Rating *</label>
              <div className="flex items-center gap-2">
                <StarRating
                  rating={rating}
                  interactive={true}
                  onRatingChange={setRating}
                />
                <span className="text-sm text-gray-600">
                  {rating > 0 && `${rating} out of 5 stars`}
                </span>
              </div>
              {errors.rating && <p className="text-sm text-red-600">{errors.rating}</p>}
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Review *</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this clinic..."
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                maxLength={1000}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>{errors.comment}</span>
                <span>{comment.length}/1000</span>
              </div>
            </div>

            {/* Service Type */}
            {serviceTypes.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Service Type</label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a service</option>
                  {serviceTypes.map((service) => (
                    <option key={service} value={service}>{service}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Wait Time */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Wait Time</label>
              <select
                value={waitTime}
                onChange={(e) => setWaitTime(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select wait time</option>
                {waitTimeOptions.map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>

            {/* Would Recommend */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Would you recommend this clinic?</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={wouldRecommend === true}
                    onChange={() => setWouldRecommend(true)}
                    className="text-blue-600"
                  />
                  <span className="text-sm">Yes</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={wouldRecommend === false}
                    onChange={() => setWouldRecommend(false)}
                    className="text-blue-600"
                  />
                  <span className="text-sm">No</span>
                </label>
              </div>
            </div>

            {/* Anonymous */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="anonymous"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="text-blue-600"
              />
              <label htmlFor="anonymous" className="text-sm">Post review anonymously</label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Submitting...' : 'Submit Review'}
              </Button>
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    )
  }
)
AddReviewForm.displayName = "AddReviewForm"

export {
  StarRating,
  RatingSummary,
  ReviewCard,
  ReviewsList,
  ReviewSummary,
  AddReviewForm
}

export type {
  Review,
  ReviewCardProps,
  ReviewsListProps,
  RatingSummaryProps,
  ReviewSummaryProps,
  AddReviewFormProps,
  StarRatingProps
}