"use client"

import React, { useState } from "react"
import { 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown, 
  Star, 
  Send, 
  X, 
  User, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Heart,
  Target,
  MapPin,
  DollarSign,
  Languages,
  Clock
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DoctorRecommendation } from "./doctor-recommendation-engine"
import { Doctor } from "@/types/doctor"

// =============================================================================
// FEEDBACK TYPES AND INTERFACES
// =============================================================================

interface RecommendationFeedbackData {
  recommendationId: string
  doctorId: string
  userId?: string
  sessionId?: string
  feedback: RecommendationFeedbackType
  rating?: number
  comments?: string
  timestamp: Date
  context?: FeedbackContext
}

enum RecommendationFeedbackType {
  HELPFUL = "helpful",
  NOT_HELPFUL = "not-helpful",
  BOOKED_APPOINTMENT = "booked",
  VIEWED_PROFILE = "viewed",
  DISMISSED = "dismissed",
  SCHEDULED_CONSULTATION = "scheduled",
  FOLLOWED_UP = "followed-up",
  FOUND_ALTERNATIVE = "found-alternative"
}

interface FeedbackContext {
  positionInList?: number
  recommendationReason?: string
  userJourneyStage?: "initial" | "browsing" | "comparing" | "deciding" | "completed"
  interactionType?: "click" | "hover" | "scroll" | "expand"
  timeSpentMs?: number
  scrollDepth?: number
}

interface FeedbackCategories {
  accuracy: "very-accurate" | "somewhat-accurate" | "neutral" | "somewhat-inaccurate" | "very-inaccurate"
  relevance: "very-relevant" | "relevant" | "neutral" | "somewhat-relevant" | "not-relevant"
  usefulness: "extremely-useful" | "useful" | "neutral" | "somewhat-useful" | "not-useful"
  personalization: "very-personal" | "somewhat-personal" | "neutral" | "not-personal" | "not-applicable"
}

interface FeedbackSession {
  sessionId: string
  userId?: string
  startTime: Date
  recommendations: FeedbackRecommendationSnapshot[]
  interactions: FeedbackInteraction[]
  completedFeedback: RecommendationFeedbackData[]
}

interface FeedbackRecommendationSnapshot {
  recommendationId: string
  doctorId: string
  confidenceScore: number
  recommendationReason: string
  timestamp: Date
}

interface FeedbackInteraction {
  type: "click" | "hover" | "dismiss" | "expand" | "view-profile" | "book"
  recommendationId: string
  timestamp: Date
  duration?: number
  position?: number
}

interface FeedbackAnalytics {
  totalFeedback: number
  feedbackByType: Record<RecommendationFeedbackType, number>
  averageRating: number
  sentimentScore: number
  accuracyRating: number
  relevanceRating: number
  usefulnessRating: number
  personalizationRating: number
  completionRate: number
  helpfulRate: number
}

// =============================================================================
// FEEDBACK COLLECTION COMPONENT
// =============================================================================

interface FeedbackCollectionSystemProps {
  onSubmitFeedback: (feedback: RecommendationFeedbackData) => Promise<void>
  onShowFeedbackDialog?: () => void
  recommendationContext?: RecommendationContext
  showQuickFeedback?: boolean
  showDetailedFeedback?: boolean
  position?: "inline" | "floating" | "modal"
}

export function FeedbackCollectionSystem({
  onSubmitFeedback,
  onShowFeedbackDialog,
  recommendationContext,
  showQuickFeedback = true,
  showDetailedFeedback = true,
  position = "inline"
}: FeedbackCollectionSystemProps) {
  return (
    <div className={cn("space-y-4", position === "floating" && "fixed bottom-4 right-4 z-50")}>
      {showQuickFeedback && (
        <QuickFeedbackButtons
          onSubmit={onSubmitFeedback}
          context={recommendationContext}
        />
      )}
      
      {showDetailedFeedback && (
        <DetailedFeedbackDialog
          onSubmit={onSubmitFeedback}
          context={recommendationContext}
          trigger={
            <Button variant="outline" size="sm" className="w-full">
              <MessageSquare className="h-4 w-4 mr-2" />
              Provide Detailed Feedback
            </Button>
          }
        />
      )}
    </div>
  )
}

// =============================================================================
// QUICK FEEDBACK BUTTONS
// =============================================================================

interface QuickFeedbackButtonsProps {
  onSubmit: (feedback: RecommendationFeedbackData) => Promise<void>
  context?: RecommendationContext
}

function QuickFeedbackButtons({ onSubmit, context }: QuickFeedbackButtonsProps) {
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleQuickFeedback = async (feedbackType: RecommendationFeedbackType) => {
    if (!context?.recommendation) return

    setSubmitting(true)

    try {
      await onSubmit({
        recommendationId: context.recommendation.id,
        doctorId: context.recommendation.doctor.id,
        userId: context.userId,
        sessionId: context.sessionId,
        feedback: feedbackType,
        timestamp: new Date(),
        context: {
          positionInList: context.position,
          recommendationReason: context.recommendation.recommendationReason,
          userJourneyStage: context.journeyStage
        }
      })

      setFeedbackSubmitted(true)
      
      // Reset after 3 seconds
      setTimeout(() => setFeedbackSubmitted(false), 3000)
    } catch (error) {
      console.error("Failed to submit feedback:", error)
    } finally {
      setSubmitting(false)
    }
  }

  if (feedbackSubmitted) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Thank you for your feedback!</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleQuickFeedback(RecommendationFeedbackType.HELPFUL)}
        disabled={submitting}
        className="flex-1 text-green-600 hover:text-green-700 hover:bg-green-50"
      >
        <ThumbsUp className="h-4 w-4 mr-1" />
        Helpful
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleQuickFeedback(RecommendationFeedbackType.NOT_HELPFUL)}
        disabled={submitting}
        className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        <ThumbsDown className="h-4 w-4 mr-1" />
        Not Helpful
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleQuickFeedback(RecommendationFeedbackType.BOOKED_APPOINTMENT)}
        disabled={submitting}
        className="flex-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
      >
        <Calendar className="h-4 w-4 mr-1" />
        Booked
      </Button>
    </div>
  )
}

// =============================================================================
// DETAILED FEEDBACK DIALOG
// =============================================================================

interface DetailedFeedbackDialogProps {
  onSubmit: (feedback: RecommendationFeedbackData) => Promise<void>
  context?: RecommendationContext
  trigger: React.ReactNode
}

function DetailedFeedbackDialog({ onSubmit, context, trigger }: DetailedFeedbackDialogProps) {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [feedbackData, setFeedbackData] = useState<Partial<RecommendationFeedbackData>>({
    feedback: RecommendationFeedbackType.HELPFUL,
    rating: 5
  })

  const handleSubmit = async (data: typeof feedbackData) => {
    if (!context?.recommendation) return

    setSubmitting(true)

    try {
      await onSubmit({
        recommendationId: context.recommendation.id,
        doctorId: context.recommendation.doctor.id,
        userId: context.userId,
        sessionId: context.sessionId,
        feedback: data.feedback!,
        rating: data.rating,
        comments: data.comments,
        timestamp: new Date(),
        context: {
          positionInList: context.position,
          recommendationReason: context.recommendation.recommendationReason,
          userJourneyStage: context.journeyStage
        }
      })

      setOpen(false)
      setFeedbackData({ feedback: RecommendationFeedbackType.HELPFUL, rating: 5 })
    } catch (error) {
      console.error("Failed to submit detailed feedback:", error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Help Us Improve Recommendations
          </DialogTitle>
        </DialogHeader>
        
        {context?.recommendation && (
          <div className="space-y-6">
            {/* Recommendation Summary */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{context.recommendation.doctor.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {context.recommendation.recommendationReason}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        Confidence: {context.recommendation.confidenceScore}%
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Rank #{context.position || 1}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Main Feedback Form */}
            <div className="space-y-4">
              {/* Overall Feedback Type */}
              <div>
                <Label className="text-base font-medium">How would you describe this recommendation?</Label>
                <Select 
                  value={feedbackData.feedback} 
                  onValueChange={(value) => setFeedbackData(prev => ({ ...prev, feedback: value as RecommendationFeedbackType }))}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={RecommendationFeedbackType.HELPFUL}>
                      <div className="flex items-center gap-2">
                        <ThumbsUp className="h-4 w-4 text-green-600" />
                        <span>Helpful - This recommendation was useful</span>
                      </div>
                    </SelectItem>
                    <SelectItem value={RecommendationFeedbackType.NOT_HELPFUL}>
                      <div className="flex items-center gap-2">
                        <ThumbsDown className="h-4 w-4 text-red-600" />
                        <span>Not Helpful - This recommendation wasn't relevant</span>
                      </div>
                    </SelectItem>
                    <SelectItem value={RecommendationFeedbackType.BOOKED_APPOINTMENT}>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span>Booked Appointment - I scheduled with this doctor</span>
                      </div>
                    </SelectItem>
                    <SelectItem value={RecommendationFeedbackType.VIEWED_PROFILE}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-600" />
                        <span>Viewed Profile - I looked at the doctor's profile</span>
                      </div>
                    </SelectItem>
                    <SelectItem value={RecommendationFeedbackType.DISMISSED}>
                      <div className="flex items-center gap-2">
                        <X className="h-4 w-4 text-orange-600" />
                        <span>Dismissed - Not interested in this doctor</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Star Rating */}
              <div>
                <Label className="text-base font-medium">How would you rate this recommendation?</Label>
                <div className="flex items-center gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Button
                      key={star}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "p-1",
                        star <= (feedbackData.rating || 0) && "text-yellow-500"
                      )}
                      onClick={() => setFeedbackData(prev => ({ ...prev, rating: star }))}
                    >
                      <Star className="h-6 w-6 fill-current" />
                    </Button>
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">
                    {feedbackData.rating ? `${feedbackData.rating} out of 5 stars` : "No rating"}
                  </span>
                </div>
              </div>

              {/* Detailed Ratings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CategoryRating
                  label="Accuracy"
                  icon={<Target className="h-4 w-4" />}
                  value={feedbackData.categories?.accuracy}
                  onChange={(value) => setFeedbackData(prev => ({
                    ...prev,
                    categories: { ...prev.categories, accuracy: value }
                  }))}
                />
                
                <CategoryRating
                  label="Relevance"
                  icon={<Heart className="h-4 w-4" />}
                  value={feedbackData.categories?.relevance}
                  onChange={(value) => setFeedbackData(prev => ({
                    ...prev,
                    categories: { ...prev.categories, relevance: value }
                  }))}
                />
                
                <CategoryRating
                  label="Usefulness"
                  icon={<CheckCircle className="h-4 w-4" />}
                  value={feedbackData.categories?.usefulness}
                  onChange={(value) => setFeedbackData(prev => ({
                    ...prev,
                    categories: { ...prev.categories, usefulness: value }
                  }))}
                />
                
                <CategoryRating
                  label="Personalization"
                  icon={<User className="h-4 w-4" />}
                  value={feedbackData.categories?.personalization}
                  onChange={(value) => setFeedbackData(prev => ({
                    ...prev,
                    categories: { ...prev.categories, personalization: value }
                  }))}
                />
              </div>

              {/* Specific Feedback Questions */}
              <div className="space-y-4">
                <h4 className="font-medium">Specific Feedback</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Why was this recommendation helpful/not helpful?</Label>
                    <Select 
                      value={feedbackData.helpfulReason} 
                      onValueChange={(value) => setFeedbackData(prev => ({ ...prev, helpfulReason: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a reason..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="specialty-match">Matched my medical specialty needs</SelectItem>
                        <SelectItem value="location">Good location and accessibility</SelectItem>
                        <SelectItem value="language">Speaks my preferred language</SelectItem>
                        <SelectItem value="rating">High patient ratings and reviews</SelectItem>
                        <SelectItem value="experience">Extensive experience and expertise</SelectItem>
                        <SelectItem value="availability">Good availability and scheduling</SelectItem>
                        <SelectItem value="cost">Affordable consultation fees</SelectItem>
                        <SelectItem value="insurance">Accepts my insurance</SelectItem>
                        <SelectItem value="not-relevant">Not relevant to my needs</SelectItem>
                        <SelectItem value="poor-ratings">Concerns about patient feedback</SelectItem>
                        <SelectItem value="location-issues">Location not convenient</SelectItem>
                        <SelectItem value="availability-issues">Limited availability</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Doctor characteristics that matter most to you</Label>
                    <Select 
                      value={feedbackData.importantFactor} 
                      onValueChange={(value) => setFeedbackData(prev => ({ ...prev, importantFactor: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select most important..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="experience">Years of experience</SelectItem>
                        <SelectItem value="specialties">Medical specializations</SelectItem>
                        <SelectItem value="patient-rating">Patient satisfaction ratings</SelectItem>
                        <SelectItem value="location">Proximity to my location</SelectItem>
                        <SelectItem value="availability">Appointment availability</SelectItem>
                        <SelectItem value="communication">Communication style</SelectItem>
                        <SelectItem value="cost">Consultation fees</SelectItem>
                        <SelectItem value="insurance">Insurance acceptance</SelectItem>
                        <SelectItem value="language">Language compatibility</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Comments */}
              <div>
                <Label htmlFor="comments">Additional comments (optional)</Label>
                <Textarea
                  id="comments"
                  placeholder="Tell us more about your experience with this recommendation..."
                  value={feedbackData.comments || ""}
                  onChange={(e) => setFeedbackData(prev => ({ ...prev, comments: e.target.value }))}
                  className="mt-2"
                  rows={4}
                />
              </div>

              {/* Contact Permission */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Your feedback helps us improve the recommendation system. 
                  We may contact you for additional insights about your healthcare experience.
                  <div className="mt-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input 
                        type="checkbox" 
                        checked={feedbackData.contactPermission || false}
                        onChange={(e) => setFeedbackData(prev => ({ ...prev, contactPermission: e.target.checked }))}
                        className="rounded"
                      />
                      Yes, you can contact me for follow-up questions about this recommendation
                    </label>
                  </div>
                </AlertDescription>
              </Alert>
            </div>

            {/* Submit Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={() => handleSubmit(feedbackData)}
                disabled={submitting || !feedbackData.feedback}
                className="flex-1"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Feedback
                  </>
                )}
              </Button>
              
              <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// =============================================================================
// CATEGORY RATING COMPONENT
// =============================================================================

interface CategoryRatingProps {
  label: string
  icon: React.ReactNode
  value?: keyof FeedbackCategories
  onChange: (value: keyof FeedbackCategories) => void
}

function CategoryRating({ label, icon, value, onChange }: CategoryRatingProps) {
  const options: { value: keyof FeedbackCategories; label: string; color: string }[] = [
    { value: "very-accurate", label: "Very Accurate", color: "text-green-600" },
    { value: "somewhat-accurate", label: "Somewhat Accurate", color: "text-green-500" },
    { value: "neutral", label: "Neutral", color: "text-gray-500" },
    { value: "somewhat-inaccurate", label: "Somewhat Inaccurate", color: "text-orange-500" },
    { value: "very-inaccurate", label: "Very Inaccurate", color: "text-red-600" }
  ]

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        {icon}
        {label}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select rating..." />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <span className={option.color}>{option.label}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

// =============================================================================
// CONTEXT INTERFACE
// =============================================================================

interface RecommendationContext {
  recommendation: DoctorRecommendation
  position?: number
  userId?: string
  sessionId?: string
  journeyStage?: "initial" | "browsing" | "comparing" | "deciding" | "completed"
}

// =============================================================================
// FEEDBACK ANALYTICS DASHBOARD
// =============================================================================

interface FeedbackAnalyticsDashboardProps {
  analytics: FeedbackAnalytics
  timeRange: string
  onRefresh?: () => void
}

export function FeedbackAnalyticsDashboard({ analytics, timeRange, onRefresh }: FeedbackAnalyticsDashboardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Feedback Analytics
          </span>
          <Badge variant="outline">{timeRange}</Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <MetricCard
            title="Total Feedback"
            value={analytics.totalFeedback}
            icon={<MessageSquare className="h-5 w-5" />}
            color="text-blue-600"
          />
          
          <MetricCard
            title="Helpful Rate"
            value={analytics.helpfulRate}
            unit="%"
            icon={<ThumbsUp className="h-5 w-5" />}
            color="text-green-600"
          />
          
          <MetricCard
            title="Average Rating"
            value={analytics.averageRating}
            unit="/5"
            icon={<Star className="h-5 w-5" />}
            color="text-yellow-600"
            decimals={1}
          />
          
          <MetricCard
            title="Completion Rate"
            value={analytics.completionRate}
            unit="%"
            icon={<CheckCircle className="h-5 w-5" />}
            color="text-purple-600"
          />
          
          <MetricCard
            title="Accuracy Rating"
            value={analytics.accuracyRating}
            unit="/5"
            icon={<Target className="h-5 w-5" />}
            color="text-indigo-600"
            decimals={1}
          />
          
          <MetricCard
            title="Personalization"
            value={analytics.personalizationRating}
            unit="/5"
            icon={<User className="h-5 w-5" />}
            color="text-pink-600"
            decimals={1}
          />
        </div>
        
        {/* Feedback Type Breakdown */}
        <div className="mt-8">
          <h4 className="font-semibold mb-4">Feedback Type Breakdown</h4>
          <div className="space-y-3">
            {Object.entries(analytics.feedbackByType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {type === "helpful" && <ThumbsUp className="h-4 w-4 text-green-600" />}
                  {type === "not-helpful" && <ThumbsDown className="h-4 w-4 text-red-600" />}
                  {type === "booked" && <Calendar className="h-4 w-4 text-blue-600" />}
                  {type === "viewed" && <User className="h-4 w-4 text-gray-600" />}
                  {type === "dismissed" && <X className="h-4 w-4 text-orange-600" />}
                  <span className="capitalize">{type.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{count}</span>
                  <Badge variant="outline" className="text-xs">
                    {((count / analytics.totalFeedback) * 100).toFixed(1)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Helper MetricCard component
interface MetricCardProps {
  title: string
  value: number
  unit?: string
  icon: React.ReactNode
  color: string
  decimals?: number
}

function MetricCard({ title, value, unit = "", icon, color, decimals = 0 }: MetricCardProps) {
  const displayValue = decimals > 0 ? value.toFixed(decimals) : value.toFixed(decimals)
  
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className={cn("p-2 rounded-lg bg-muted", color)}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold">{displayValue}{unit}</div>
      <p className="text-sm text-muted-foreground">{title}</p>
    </div>
  )
}

export type {
  RecommendationFeedbackData,
  FeedbackContext,
  FeedbackCategories,
  FeedbackSession,
  FeedbackAnalytics,
  RecommendationContext
}

export { RecommendationFeedbackType }