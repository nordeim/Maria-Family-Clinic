"use client";

import React, { useState } from 'react';
import { useServiceData } from '@/hooks/use-service-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  StarIcon,
  ChevronDownIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  ChatBubbleLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  FlagIcon,
  UserIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface ServiceReviewsSectionProps {
  category: string;
  serviceSlug: string;
  locale: string;
}

interface ReviewResponse {
  author: string;
  role: string;
  content: string;
  date: string;
}

interface PatientReview {
  id: string;
  patientName?: string;
  patientInitials: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  clinicName: string;
  doctorName?: string;
  verified: boolean;
  helpful: number;
  notHelpful: number;
  response?: ReviewResponse;
  language: string;
  recommendation: 'yes' | 'no' | 'maybe';
  waitTime: string;
  overallExperience: 'excellent' | 'good' | 'average' | 'poor';
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  recommendationPercentage: number;
  verifiedPercentage: number;
}

export function ServiceReviewsSection({ category, serviceSlug, locale }: ServiceReviewsSectionProps) {
  const { data: service, isLoading } = useServiceData(category, serviceSlug, locale);
  const [selectedFilter, setSelectedFilter] = useState<'all' | '5' | '4' | '3' | '2' | '1' | 'recent'>('all');
  const [expandedReview, setExpandedReview] = useState<string | null>(null);
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, 'yes' | 'no' | null>>({});

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="h-96 bg-gray-200 rounded" />
      </div>
    );
  }

  if (!service) return null;

  // Mock review statistics
  const reviewStats: ReviewStats = {
    totalReviews: 247,
    averageRating: 4.6,
    ratingDistribution: {
      5: 156,
      4: 58,
      3: 23,
      2: 7,
      1: 3
    },
    recommendationPercentage: 89,
    verifiedPercentage: 92
  };

  // Mock patient reviews
  const patientReviews: PatientReview[] = [
    {
      id: 'review-1',
      patientInitials: 'S.M.',
      rating: 5,
      title: 'Excellent care and professional service',
      content: `I was initially nervous about the procedure, but Dr. Johnson and her team made me feel completely comfortable. The preparation instructions were clear and easy to follow. The procedure itself was smooth with minimal discomfort. The follow-up care was excellent, and I felt supported throughout the entire process.

The clinic facility is modern and clean, and the staff are knowledgeable and caring. I would definitely recommend this service to others who need similar care.`,
      date: '2024-10-28',
      clinicName: 'My Family Clinic - Orchard',
      doctorName: 'Dr. Sarah Johnson',
      verified: true,
      helpful: 24,
      notHelpful: 1,
      recommendation: 'yes',
      waitTime: '15 minutes',
      overallExperience: 'excellent',
      language: 'en'
    },
    {
      id: 'review-2',
      patientInitials: 'M.L.',
      rating: 4,
      title: 'Good experience with minor wait time',
      content: `Overall positive experience. The doctor was thorough and explained everything clearly. The procedure went well and recovery was faster than expected. 

One small issue was the wait time - arrived 10 minutes early but waited about 20 minutes past my appointment time. However, the quality of care made up for the delay. The cost was reasonable and covered by my insurance.`,
      date: '2024-10-25',
      clinicName: 'My Family Clinic - Novena',
      doctorName: 'Dr. Michael Chen',
      verified: true,
      helpful: 18,
      notHelpful: 0,
      recommendation: 'yes',
      waitTime: '20 minutes',
      overallExperience: 'good',
      language: 'en',
      response: {
        author: 'Dr. Michael Chen',
        role: 'Treating Physician',
        content: 'Thank you for your feedback. We apologize for the wait time and are working to improve our scheduling. We\'re pleased you had a positive outcome and appreciate your recommendation.',
        date: '2024-10-26'
      }
    },
    {
      id: 'review-3',
      patientInitials: 'J.K.',
      rating: 5,
      title: 'Highly recommend for comprehensive care',
      content: `This service exceeded my expectations. The online preparation checklist was incredibly helpful, and the team at Woodlands clinic made sure I understood everything before proceeding.

The procedure was well-organized, and I felt safe throughout. The post-care instructions were detailed and easy to follow. Recovery was smooth with excellent support via their 24/7 hotline.`,
      date: '2024-10-20',
      clinicName: 'My Family Clinic - Woodlands',
      doctorName: 'Dr. Priya Sharma',
      verified: true,
      helpful: 31,
      notHelpful: 0,
      recommendation: 'yes',
      waitTime: '5 minutes',
      overallExperience: 'excellent',
      language: 'en'
    },
    {
      id: 'review-4',
      patientInitials: 'A.T.',
      rating: 3,
      title: 'Good care but room for improvement',
      content: `The medical care was professional and thorough. Dr. Johnson explained the procedure well and answered all my questions. However, the scheduling process could be improved - it took several calls to get an appointment time that worked for me.

The actual procedure and follow-up care were satisfactory. I would consider using this service again but hope the booking process becomes more streamlined.`,
      date: '2024-10-18',
      clinicName: 'My Family Clinic - Orchard',
      doctorName: 'Dr. Sarah Johnson',
      verified: true,
      helpful: 12,
      notHelpful: 3,
      recommendation: 'maybe',
      waitTime: '25 minutes',
      overallExperience: 'average',
      language: 'en'
    },
    {
      id: 'review-5',
      patientInitials: 'R.C.',
      rating: 4,
      title: 'Professional service with good outcomes',
      content: `The team was professional and the facility was clean and modern. The procedure was explained clearly, and I felt confident in the care I was receiving. 

Recovery was as expected, and the follow-up care was thorough. The only minor issue was that it took a bit longer than estimated, but the quality of care made it worthwhile.`,
      date: '2024-10-15',
      clinicName: 'My Family Clinic - Novena',
      doctorName: 'Dr. Michael Chen',
      verified: true,
      helpful: 16,
      notHelpful: 1,
      recommendation: 'yes',
      waitTime: '10 minutes',
      overallExperience: 'good',
      language: 'en'
    }
  ];

  const filterOptions = [
    { value: 'all', label: 'All Reviews', count: reviewStats.totalReviews },
    { value: '5', label: '5 Stars', count: reviewStats.ratingDistribution[5] },
    { value: '4', label: '4 Stars', count: reviewStats.ratingDistribution[4] },
    { value: '3', label: '3 Stars', count: reviewStats.ratingDistribution[3] },
    { value: 'recent', label: 'Most Recent', count: patientReviews.filter(r => {
      const reviewDate = new Date(r.date);
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      return reviewDate > twoWeeksAgo;
    }).length }
  ];

  const filteredReviews = patientReviews.filter(review => {
    switch (selectedFilter) {
      case 'all': return true;
      case 'recent':
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        return new Date(review.date) > twoWeeksAgo;
      default: return review.rating === parseInt(selectedFilter);
    }
  });

  const renderStars = (rating: number, size: 'sm' | 'md' = 'md') => {
    const sizeClass = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={cn(
              sizeClass,
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            )}
          />
        ))}
      </div>
    );
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'yes': return 'text-green-700 bg-green-100';
      case 'no': return 'text-red-700 bg-red-100';
      case 'maybe': return 'text-yellow-700 bg-yellow-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getExperienceColor = (experience: string) => {
    switch (experience) {
      case 'excellent': return 'text-green-700 bg-green-100';
      case 'good': return 'text-blue-700 bg-blue-100';
      case 'average': return 'text-yellow-700 bg-yellow-100';
      case 'poor': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const toggleReview = (reviewId: string) => {
    setExpandedReview(expandedReview === reviewId ? null : reviewId);
  };

  const handleHelpfulVote = (reviewId: string, vote: 'yes' | 'no') => {
    setHelpfulVotes(prev => ({
      ...prev,
      [reviewId]: prev[reviewId] === vote ? null : vote
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-SG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div id="reviews" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <StarIcon className="h-5 w-5 text-yellow-500" />
            <span>Patient Reviews & Ratings</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Real experiences from patients who have received this service
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Review Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {reviewStats.averageRating}
                </div>
                <div className="mb-2">{renderStars(reviewStats.averageRating)}</div>
                <div className="text-sm text-blue-700">
                  {reviewStats.totalReviews} reviews
                </div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {reviewStats.recommendationPercentage}%
                </div>
                <div className="text-sm text-green-700">
                  Would recommend
                </div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {reviewStats.verifiedPercentage}%
                </div>
                <div className="text-sm text-purple-700">
                  Verified patients
                </div>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  {Math.round(
                    patientReviews.reduce((sum, review) => sum + review.helpful, 0) / 
                    patientReviews.length
                  )}
                </div>
                <div className="text-sm text-orange-700">
                  Average helpful votes
                </div>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Rating Distribution</h4>
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 w-16">
                    <span className="text-sm text-gray-600">{rating}</span>
                    <StarIcon className="h-3 w-3 text-yellow-400 fill-current" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{
                        width: `${(reviewStats.ratingDistribution[rating as keyof typeof reviewStats.ratingDistribution] / reviewStats.totalReviews) * 100}%`
                      }}
                    />
                  </div>
                  <div className="text-sm text-gray-600 w-8">
                    {reviewStats.ratingDistribution[rating as keyof typeof reviewStats.ratingDistribution]}
                  </div>
                </div>
              ))}
            </div>

            {/* Filter Options */}
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={selectedFilter === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFilter(option.value as any)}
                  className="text-xs"
                >
                  {option.label} ({option.count})
                </Button>
              ))}
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
              {filteredReviews.map((review) => {
                const isExpanded = expandedReview === review.id;
                const userVote = helpfulVotes[review.id];
                
                return (
                  <Card key={review.id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* Review Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <UserIcon className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">{review.patientInitials}</div>
                                  <div className="text-sm text-gray-500 flex items-center space-x-2">
                                    <span>{formatDate(review.date)}</span>
                                    {review.verified && (
                                      <Badge variant="secondary" className="text-xs">
                                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                                        Verified
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-1">
                              {renderStars(review.rating)}
                              <h4 className="font-medium text-gray-900">{review.title}</h4>
                            </div>
                          </div>
                          
                          <div className="text-right space-y-1">
                            <Badge 
                              variant="outline" 
                              className={cn("text-xs", getRecommendationColor(review.recommendation))}
                            >
                              {review.recommendation === 'yes' ? 'Recommends' : 
                               review.recommendation === 'no' ? 'Does not recommend' : 'Maybe recommends'}
                            </Badge>
                            <div className="text-xs text-gray-500">{review.clinicName}</div>
                          </div>
                        </div>

                        {/* Review Content Preview */}
                        <div className="text-sm text-gray-700">
                          {isExpanded ? (
                            <div className="whitespace-pre-wrap">{review.content}</div>
                          ) : (
                            <div className="line-clamp-3">
                              {review.content}
                            </div>
                          )}
                          {review.content.length > 200 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleReview(review.id)}
                              className="p-0 h-auto text-blue-600 hover:text-blue-700 mt-1"
                            >
                              {isExpanded ? 'Show less' : 'Read more'}
                              <ChevronDownIcon className={cn(
                                "h-3 w-3 ml-1 transition-transform",
                                isExpanded ? "rotate-180" : ""
                              )} />
                            </Button>
                          )}
                        </div>

                        {/* Review Metadata */}
                        <div className="flex flex-wrap gap-2 text-xs">
                          <Badge variant="outline" className={getExperienceColor(review.overallExperience)}>
                            {review.overallExperience} experience
                          </Badge>
                          <Badge variant="outline">Wait time: {review.waitTime}</Badge>
                          {review.doctorName && (
                            <Badge variant="outline">Dr. {review.doctorName.split(' ')[1]}</Badge>
                          )}
                        </div>

                        {/* Helpful Votes */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="text-gray-600">Was this helpful?</span>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleHelpfulVote(review.id, 'yes')}
                                className={cn(
                                  "p-1 h-6 text-xs",
                                  userVote === 'yes' ? "text-green-600" : "text-gray-500"
                                )}
                              >
                                <ThumbsUpIcon className="h-3 w-3 mr-1" />
                                {review.helpful + (userVote === 'yes' ? 1 : 0)}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleHelpfulVote(review.id, 'no')}
                                className={cn(
                                  "p-1 h-6 text-xs",
                                  userVote === 'no' ? "text-red-600" : "text-gray-500"
                                )}
                              >
                                <ThumbsDownIcon className="h-3 w-3 mr-1" />
                                {review.notHelpful + (userVote === 'no' ? 1 : 0)}
                              </Button>
                            </div>
                          </div>
                          
                          <Button variant="ghost" size="sm" className="p-1 h-6">
                            <FlagIcon className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Doctor Response */}
                        {review.response && (
                          <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                            <div className="flex items-start space-x-2">
                              <CheckCircleIcon className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="text-sm font-medium text-blue-800">
                                    {review.response.author}
                                  </span>
                                  <span className="text-xs text-blue-600">
                                    ({review.response.role})
                                  </span>
                                </div>
                                <p className="text-sm text-blue-700">
                                  {review.response.content}
                                </p>
                                <div className="text-xs text-blue-600 mt-1">
                                  {formatDate(review.response.date)}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Show More Button */}
            {filteredReviews.length >= 5 && (
              <div className="text-center">
                <Button variant="outline">
                  Load More Reviews
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Review Guidelines */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start space-x-2">
            <InformationCircleIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-800 mb-2">Review Guidelines</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Only patients who have received this service can leave reviews</li>
                <li>• Reviews are moderated for authenticity and appropriateness</li>
                <li>• Personal health information should not be shared in reviews</li>
                <li>• Constructive feedback helps us improve our services</li>
                <li>• For medical concerns, please contact our clinic directly</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}