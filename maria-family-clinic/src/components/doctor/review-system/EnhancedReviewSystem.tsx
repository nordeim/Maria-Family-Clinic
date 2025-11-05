import * as React from "react"
import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  DialogDescription as AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Star,
  MessageSquare,
  Filter,
  Calendar,
  Plus,
  Settings,
  BarChart3,
  Shield,
  Eye,
  EyeOff,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Users,
  Clock,
  TrendingUp,
  Award,
  CheckCircle,
  AlertCircle,
  X,
  Edit,
  Trash2,
  Heart,
  Activity,
  Target
} from "lucide-react"
import { cn } from "@/lib/utils"

// Import all review system components
import {
  ReviewSubmission,
  ReviewDisplay,
  ReviewModerationDashboard,
  ReviewAnalyticsDashboard,
  DoctorResponseSystem,
  AnonymousReviewSystem,
  type Review,
  type Doctor,
  type ReviewAnalytics,
  type ReviewSubmission as ReviewSubmissionType,
  type PrivateFeedback,
  type ModerationAction,
  type DoctorResponse
} from './index'

interface EnhancedReviewSystemProps {
  doctorId: string
  doctorName: string
  doctorRating?: {
    average: number
    count: number
    dimensions?: any
    credibilityScore?: number
  }
  className?: string
  userRole?: 'patient' | 'doctor' | 'moderator' | 'admin'
  isVerifiedPatient?: boolean
  onReviewSubmit?: (submission: ReviewSubmissionType) => Promise<void>
  onPrivateFeedbackSubmit?: (feedback: PrivateFeedback) => Promise<void>
}

interface ReviewSystemState {
  showSubmission: boolean
  showAnonymous: boolean
  showAnalytics: boolean
  showModeration: boolean
  showResponse: boolean
  selectedReview: Review | null
  filterRating: 'all' | '5' | '4' | '3' | '2' | '1'
  filterStatus: 'all' | 'verified' | 'anonymous' | 'recent'
  sortBy: 'date' | 'rating' | 'helpfulness' | 'verified'
  viewMode: 'list' | 'cards' | 'compact'
}

export function EnhancedReviewSystem({
  doctorId,
  doctorName,
  doctorRating,
  className,
  userRole = 'patient',
  isVerifiedPatient = false,
  onReviewSubmit,
  onPrivateFeedbackSubmit,
}: EnhancedReviewSystemProps) {
  const [state, setState] = useState<ReviewSystemState>({
    showSubmission: false,
    showAnonymous: false,
    showAnalytics: false,
    showModeration: false,
    showResponse: false,
    selectedReview: null,
    filterRating: 'all',
    filterStatus: 'all',
    sortBy: 'date',
    viewMode: 'cards'
  })

  const [activeTab, setActiveTab] = useState('reviews')
  const [isLoading, setIsLoading] = useState(false)

  // Mock data - in real app this would come from API
  const mockReviews: Review[] = [
    {
      id: '1',
      patientName: 'Sarah Chen',
      patientInitial: 'SC',
      isAnonymous: false,
      dimensions: {
        overallRating: 5,
        bedsideManner: 5,
        communication: 5,
        waitTime: 4,
        treatmentEffectiveness: 5,
        facilityEnvironment: 4,
        painManagement: 0,
        followUpCare: 5,
      },
      overallRating: 5,
      comment: 'Dr. Lim was absolutely exceptional! She took the time to explain everything thoroughly and made me feel comfortable throughout the consultation. Her bedside manner is outstanding and I felt genuinely cared for. The treatment was very effective and I would highly recommend her to anyone seeking quality healthcare.',
      date: new Date('2024-11-15'),
      service: 'General Consultation',
      clinic: 'My Family Clinic',
      isVerified: true,
      verificationMethod: 'appointment',
      helpful: 15,
      notHelpful: 2,
      isFlagged: false,
      status: 'active',
      credibilityScore: 85,
      tags: ['professional', 'thorough', 'caring'],
      outcome: {
        effectiveness: 'very_effective',
        improvementTimeframe: 'Immediate relief',
        sideEffects: [],
        wouldRecommend: true,
        wouldReturn: true
      },
      response: {
        id: 'resp_1',
        text: 'Thank you so much for your wonderful feedback, Sarah! It truly means a lot to me and my team to know that we provided excellent care. We look forward to serving you again in the future.',
        date: new Date('2024-11-16'),
        doctorId,
        isPublic: true,
        status: 'active'
      }
    },
    {
      id: '2',
      patientName: 'Michael Tan',
      patientInitial: 'MT',
      isAnonymous: false,
      dimensions: {
        overallRating: 5,
        bedsideManner: 5,
        communication: 5,
        waitTime: 3,
        treatmentEffectiveness: 4,
        facilityEnvironment: 5,
        painManagement: 0,
        followUpCare: 4,
      },
      overallRating: 5,
      comment: 'Professional, knowledgeable, and very patient. Dr. Lim answered all my questions without making me feel rushed. The clinic is also well-organized and efficient. Great experience overall!',
      date: new Date('2024-11-10'),
      service: 'Follow-up Consultation',
      clinic: 'My Family Clinic',
      isVerified: true,
      verificationMethod: 'appointment',
      helpful: 8,
      notHelpful: 1,
      isFlagged: false,
      status: 'active',
      credibilityScore: 90,
      tags: ['professional', 'efficient']
    },
    {
      id: '3',
      patientName: 'Anonymous Patient',
      patientInitial: 'A',
      isAnonymous: true,
      dimensions: {
        overallRating: 4,
        bedsideManner: 4,
        communication: 4,
        waitTime: 2,
        treatmentEffectiveness: 4,
        facilityEnvironment: 3,
        painManagement: 0,
        followUpCare: 4,
      },
      overallRating: 4,
      comment: 'Good experience overall. Dr. Lim is skilled and thorough. Wait time was a bit longer than expected but the quality of care made up for it. Would recommend.',
      date: new Date('2024-11-08'),
      service: 'Health Screening',
      clinic: 'My Family Clinic',
      isVerified: true,
      verificationMethod: 'verified_patient',
      helpful: 6,
      notHelpful: 1,
      isFlagged: false,
      status: 'active',
      credibilityScore: 75,
      tags: ['thorough', 'wait_time'],
    }
  ]

  const mockAnalytics: ReviewAnalytics = {
    doctorId,
    totalReviews: 3,
    verifiedReviews: 3,
    averageRatings: {
      overall: 4.7,
      bedsideManner: 4.7,
      communication: 4.7,
      waitTime: 3.0,
      treatmentEffectiveness: 4.3,
      facilityEnvironment: 4.0,
      painManagement: 0,
      followUpCare: 4.3
    },
    ratingTrends: [],
    sentimentAnalysis: {
      positive: 85,
      neutral: 10,
      negative: 5,
      keywords: [
        { word: 'professional', frequency: 15, sentiment: 'positive' },
        { word: 'thorough', frequency: 12, sentiment: 'positive' },
        { word: 'caring', frequency: 10, sentiment: 'positive' },
      ]
    },
    commonThemes: [
      {
        theme: 'Bedside Manner',
        frequency: 3,
        sentiment: 'positive',
        examples: ['Exceptional care', 'Made me feel comfortable'],
        impact: 0.9
      },
      {
        theme: 'Communication',
        frequency: 3,
        sentiment: 'positive',
        examples: ['Clear explanations', 'Took time to answer questions'],
        impact: 0.9
      }
    ],
    recentChanges: [],
    credibilityMetrics: {
      authenticity: 0.85,
      recency: 0.90,
      verification: 1.0,
      consistency: 0.88,
      communityValidation: 0.85,
      overall: 0.87
    }
  }

  const handleReviewSubmit = async (submission: ReviewSubmissionType) => {
    setIsLoading(true)
    try {
      await onReviewSubmit?.(submission)
      setState(prev => ({ ...prev, showSubmission: false, showAnonymous: false }))
      // Refresh reviews
    } catch (error) {
      console.error('Error submitting review:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrivateFeedbackSubmit = async (feedback: PrivateFeedback) => {
    setIsLoading(true)
    try {
      await onPrivateFeedbackSubmit?.(feedback)
      setState(prev => ({ ...prev, showAnonymous: false }))
    } catch (error) {
      console.error('Error submitting private feedback:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleModerateReview = async (reviewId: string, action: ModerationAction) => {
    // Handle review moderation
    console.log('Moderating review:', reviewId, action)
  }

  const handleCreateResponse = async (reviewId: string, response: Omit<DoctorResponse, 'id' | 'date' | 'doctorId'>) => {
    // Handle creating doctor response
    console.log('Creating response for review:', reviewId, response)
  }

  const getFilteredAndSortedReviews = () => {
    let filtered = [...mockReviews]

    // Apply filters
    if (state.filterRating !== 'all') {
      filtered = filtered.filter(review => 
        Math.floor(review.overallRating) === parseInt(state.filterRating)
      )
    }

    if (state.filterStatus === 'verified') {
      filtered = filtered.filter(review => review.isVerified)
    } else if (state.filterStatus === 'anonymous') {
      filtered = filtered.filter(review => review.isAnonymous)
    } else if (state.filterStatus === 'recent') {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      filtered = filtered.filter(review => review.date >= thirtyDaysAgo)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (state.sortBy) {
        case 'rating':
          return b.overallRating - a.overallRating
        case 'helpfulness':
          return b.helpful - a.helpful
        case 'verified':
          return (b.isVerified ? 1 : 0) - (a.isVerified ? 1 : 0)
        default: // date
          return b.date.getTime() - a.date.getTime()
      }
    })

    return filtered
  }

  const renderRatingSummary = () => {
    const ratingDistribution = [
      { stars: 5, count: 2, percentage: 67 },
      { stars: 4, count: 1, percentage: 33 },
      { stars: 3, count: 0, percentage: 0 },
      { stars: 2, count: 0, percentage: 0 },
      { stars: 1, count: 0, percentage: 0 },
    ]

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Main Rating */}
        <div className="text-center space-y-3">
          <div className="space-y-2">
            <div className="text-5xl font-bold text-primary">
              {doctorRating?.average?.toFixed(1) || '0.0'}
            </div>
            <div className="flex items-center justify-center gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-6 w-6",
                    i < Math.round(doctorRating?.average || 0)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  )}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Based on {doctorRating?.count || 0} verified reviews
            </p>
          </div>

          {doctorRating?.credibilityScore && (
            <div className="flex items-center justify-center gap-2">
              <Badge variant="outline" className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                {Math.round(doctorRating.credibilityScore)}% Credible
              </Badge>
            </div>
          )}
        </div>

        {/* Rating Distribution */}
        <div className="space-y-3">
          <h4 className="font-medium text-center sm:text-left">Rating Breakdown</h4>
          {ratingDistribution.map((dist) => (
            <div key={dist.stars} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-12">
                <span className="text-sm">{dist.stars}</span>
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${dist.percentage}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-8">
                {dist.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderReviewFilters = () => (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
      <div className="flex flex-wrap gap-2">
        <Select value={state.filterRating} onValueChange={(value: any) => 
          setState(prev => ({ ...prev, filterRating: value }))
        }>
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="5">5★</SelectItem>
            <SelectItem value="4">4★</SelectItem>
            <SelectItem value="3">3★</SelectItem>
            <SelectItem value="2">2★</SelectItem>
            <SelectItem value="1">1★</SelectItem>
          </SelectContent>
        </Select>

        <Select value={state.filterStatus} onValueChange={(value: any) => 
          setState(prev => ({ ...prev, filterStatus: value }))
        }>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reviews</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="anonymous">Anonymous</SelectItem>
            <SelectItem value="recent">Recent</SelectItem>
          </SelectContent>
        </Select>

        <Select value={state.sortBy} onValueChange={(value: any) => 
          setState(prev => ({ ...prev, sortBy: value }))
        }>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Latest</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="helpfulness">Most Helpful</SelectItem>
            <SelectItem value="verified">Verified First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setState(prev => ({ ...prev, showAnonymous: true }))}
        >
          <EyeOff className="h-4 w-4 mr-2" />
          Anonymous
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setState(prev => ({ ...prev, showSubmission: true }))}
        >
          <Plus className="h-4 w-4 mr-2" />
          Write Review
        </Button>
      </div>
    </div>
  )

  const renderReviewContent = () => {
    const filteredReviews = getFilteredAndSortedReviews()

    if (filteredReviews.length === 0) {
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground" />
              <h3 className="font-medium">No reviews found</h3>
              <p className="text-sm text-muted-foreground">
                No reviews match your current filters.
              </p>
              <Button 
                variant="outline" 
                onClick={() => setState(prev => ({ ...prev, filterRating: 'all', filterStatus: 'all' }))}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <ReviewDisplay
            key={review.id}
            review={review}
            compact={state.viewMode === 'compact'}
            showFullDetails={state.viewMode === 'cards'}
            onMarkHelpful={(reviewId, helpful) => {
              console.log('Mark helpful:', reviewId, helpful)
            }}
            onReport={(reviewId, reason) => {
              console.log('Report review:', reviewId, reason)
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Patient Reviews & Ratings
              </CardTitle>
              <CardDescription>
                Comprehensive reviews and ratings for Dr. {doctorName}
              </CardDescription>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('analytics')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
              
              {userRole === 'moderator' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('moderation')}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Moderate
                </Button>
              )}
              
              {userRole === 'doctor' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('responses')}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Respond
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              {userRole === 'moderator' && (
                <TabsTrigger value="moderation">Moderation</TabsTrigger>
              )}
              {userRole === 'doctor' && (
                <TabsTrigger value="responses">Responses</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="reviews" className="space-y-6">
              {/* Rating Summary */}
              {renderRatingSummary()}

              <div className="h-px bg-border" />

              {/* Filters */}
              {renderReviewFilters()}

              {/* Reviews Content */}
              {renderReviewContent()}
            </TabsContent>

            <TabsContent value="analytics">
              <ReviewAnalyticsDashboard
                doctorId={doctorId}
                doctorName={doctorName}
              />
            </TabsContent>

            {userRole === 'moderator' && (
              <TabsContent value="moderation">
                <ReviewModerationDashboard
                  onModerateReview={handleModerateReview}
                />
              </TabsContent>
            )}

            {userRole === 'doctor' && (
              <TabsContent value="responses">
                <DoctorResponseSystem
                  doctorId={doctorId}
                  doctorName={doctorName}
                  reviews={mockReviews}
                  onCreateResponse={handleCreateResponse}
                />
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>

      {/* Review Submission Dialog */}
      <Dialog open={state.showSubmission} onOpenChange={(open) => 
        setState(prev => ({ ...prev, showSubmission: open }))
      }>
        <DialogContent className="max-w-4xl">
          <ReviewSubmission
            doctorId={doctorId}
            doctorName={doctorName}
            isVerifiedPatient={isVerifiedPatient}
            onSubmit={handleReviewSubmit}
            onCancel={() => setState(prev => ({ ...prev, showSubmission: false }))}
          />
        </DialogContent>
      </Dialog>

      {/* Anonymous Review Dialog */}
      <Dialog open={state.showAnonymous} onOpenChange={(open) => 
        setState(prev => ({ ...prev, showAnonymous: open }))
      }>
        <DialogContent className="max-w-4xl">
          <AnonymousReviewSystem
            doctorId={doctorId}
            doctorName={doctorName}
            onSubmitAnonymous={handleReviewSubmit}
            onSubmitPrivate={handlePrivateFeedbackSubmit}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
