import * as React from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Star,
  ThumbsUp,
  MessageSquare,
  Calendar,
  Filter,
  MoreHorizontal,
  Heart,
  ThumbsDown,
  Flag
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Doctor {
  id: string
  firstName: string
  lastName: string
  rating?: {
    average: number
    count: number
  }
}

interface Review {
  id: string
  patientName: string
  patientInitial: string
  rating: number
  comment: string
  date: Date
  service: string
  clinic: string
  helpful: number
  verified: boolean
  response?: {
    text: string
    date: Date
  }
}

interface DoctorReviewsSectionProps {
  doctor: Doctor
  className?: string
}

export function DoctorReviewsSection({ doctor, className }: DoctorReviewsSectionProps) {
  // Mock reviews data - in real app this would come from API
  const reviews: Review[] = [
    {
      id: "1",
      patientName: "Sarah Chen",
      patientInitial: "SC",
      rating: 5,
      comment: "Dr. Lim is absolutely amazing! She took the time to explain everything thoroughly and made me feel comfortable throughout the consultation. Her bedside manner is exceptional and I felt genuinely cared for. Highly recommend!",
      date: new Date("2024-11-15"),
      service: "General Consultation",
      clinic: "My Family Clinic",
      helpful: 12,
      verified: true,
      response: {
        text: "Thank you for your wonderful feedback, Sarah! It's always a pleasure to provide care for patients like you. Wishing you continued health and wellness.",
        date: new Date("2024-11-16")
      }
    },
    {
      id: "2", 
      patientName: "Michael Tan",
      patientInitial: "MT",
      rating: 5,
      comment: "Professional, knowledgeable, and very patient. Dr. Lim answered all my questions without making me feel rushed. The clinic is also well-organized and efficient.",
      date: new Date("2024-11-10"),
      service: "Follow-up Consultation",
      clinic: "My Family Clinic",
      helpful: 8,
      verified: true
    },
    {
      id: "3",
      patientName: "Jennifer Wong",
      patientInitial: "JW", 
      rating: 4,
      comment: "Good experience overall. Dr. Lim is skilled and thorough. Wait time was a bit longer than expected but the quality of care made up for it.",
      date: new Date("2024-11-08"),
      service: "Health Screening",
      clinic: "My Family Clinic",
      helpful: 6,
      verified: true
    },
    {
      id: "4",
      patientName: "David Lee",
      patientInitial: "DL",
      rating: 5,
      comment: "Exceptional doctor! Dr. Lim's expertise and caring approach made my treatment journey much easier. She provided clear explanations and was always available for follow-up questions.",
      date: new Date("2024-11-05"),
      service: "Chronic Disease Management",
      clinic: "My Family Clinic", 
      helpful: 15,
      verified: true
    },
    {
      id: "5",
      patientName: "Lisa Wang",
      patientInitial: "LW",
      rating: 5,
      comment: "Dr. Lim is fantastic! Very thorough examination and she genuinely cares about her patients' wellbeing. The consultation felt personalized and not rushed.",
      date: new Date("2024-11-02"),
      service: "Preventive Care",
      clinic: "My Family Clinic",
      helpful: 9,
      verified: true
    }
  ]

  // Rating distribution
  const ratingDistribution = [
    { stars: 5, count: 98, percentage: 70 },
    { stars: 4, count: 28, percentage: 20 },
    { stars: 3, count: 9, percentage: 6 },
    { stars: 2, count: 4, percentage: 3 },
    { stars: 1, count: 2, percentage: 1 }
  ]

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-SG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getRatingStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const starSize = size === 'md' ? "h-5 w-5" : "h-4 w-4"
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

  const renderReview = (review: Review) => (
    <Card key={review.id} className="border-l-4 border-l-blue-200">
      <CardContent className="pt-4">
        <div className="space-y-3">
          {/* Review Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {review.patientInitial}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{review.patientName}</p>
                  {review.verified && (
                    <Badge variant="secondary" className="text-xs">
                      Verified Patient
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center">
                    {getRatingStars(review.rating)}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(review.date)}
                  </span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>

          {/* Service Info */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="text-xs">
              {review.service}
            </Badge>
            <span>•</span>
            <span>{review.clinic}</span>
          </div>

          {/* Review Comment */}
          <div className="space-y-2">
            <p className="text-sm leading-relaxed">{review.comment}</p>
          </div>

          {/* Helpful Actions */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <ThumbsUp className="h-3 w-3 mr-1" />
                <span className="text-xs">Helpful ({review.helpful})</span>
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <MessageSquare className="h-3 w-3 mr-1" />
                <span className="text-xs">Reply</span>
              </Button>
            </div>
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <Flag className="h-3 w-3" />
            </Button>
          </div>

          {/* Doctor Response */}
          {review.response && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 ml-6">
              <div className="flex items-start gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                    DL
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium">Dr. {doctor.lastName}</p>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(review.response.date)}
                    </span>
                  </div>
                  <p className="text-sm text-blue-800">{review.response.text}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Patient Reviews
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              Write Review
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Rating Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Main Rating */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <span className="text-4xl font-bold">
                {doctor.rating?.average.toFixed(1) || "0.0"}
              </span>
              <div className="flex items-center">
                {getRatingStars(Math.round(doctor.rating?.average || 0), 'md')}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Based on {doctor.rating?.count || 0} reviews
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-center sm:text-left">Rating Distribution</p>
            {ratingDistribution.map((dist) => (
              <div key={dist.stars} className="flex items-center gap-2">
                <div className="flex items-center gap-1 w-12">
                  <span className="text-xs">{dist.stars}</span>
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full" 
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

        <div className="h-px bg-border" />

        {/* Reviews List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Recent Reviews</h4>
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Sort by Date
            </Button>
          </div>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {reviews.map((review) => renderReview(review))}
          </div>
          
          {/* Load More */}
          <div className="text-center pt-4">
            <Button variant="outline">
              Load More Reviews
            </Button>
          </div>
        </div>

        {/* Review Guidelines */}
        <div className="bg-muted/30 p-4 rounded-lg">
          <h5 className="text-sm font-semibold mb-2">Review Guidelines</h5>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Reviews should be based on your personal experience</li>
            <li>• Please be respectful and constructive in your feedback</li>
            <li>• Avoid sharing personal health information</li>
            <li>• Verified patients' reviews are marked for authenticity</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}