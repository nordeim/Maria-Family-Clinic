import { useState } from 'react';
import { Card, CardContent } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog';
import { Textarea } from '~/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Star, Shield, CheckCircle, Clock, ThumbsUp, Flag, Filter } from 'lucide-react';
import { cn } from '~/lib/utils';

interface ServiceReview {
  id: string;
  serviceId: string;
  serviceName: string;
  clinicId: string;
  clinicName: string;
  userId: string;
  userName: string;
  userInitial?: string;
  rating: number; // 1-5
  comment?: string;
  isVerified: boolean; // Verified patient review
  verifiedDate?: string;
  isForService: boolean;
  waitTime?: number; // in minutes
  doctorName?: string;
  appointmentDate?: string;
  helpfulVotes: number;
  createdAt: string;
  tags: string[];
}

interface ServiceReviewSystemProps {
  serviceId: string;
  reviews: ServiceReview[];
  clinicId?: string;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  onSubmitReview?: (review: Partial<ServiceReview>) => void;
  onMarkHelpful?: (reviewId: string) => void;
  onReportReview?: (reviewId: string, reason: string) => void;
  className?: string;
}

export function ServiceReviewSystem({
  serviceId,
  reviews,
  clinicId,
  averageRating,
  totalReviews,
  ratingDistribution,
  onSubmitReview,
  onMarkHelpful,
  onReportReview,
  className
}: ServiceReviewSystemProps) {
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [filterVerified, setFilterVerified] = useState<'all' | 'verified'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful'>('newest');
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: '',
    waitTime: '',
    doctorName: '',
    tags: [] as string[]
  });

  const filteredReviews = reviews
    .filter(review => {
      if (filterRating !== 'all' && review.rating !== filterRating) return false;
      if (filterVerified === 'verified' && !review.isVerified) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        case 'helpful':
          return b.helpfulVotes - a.helpfulVotes;
        default:
          return 0;
      }
    });

  const renderStars = (rating: number, size = 'h-4 w-4') => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              size,
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            )}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-SG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSubmitReview = () => {
    if (newReview.rating === 0) return;
    
    onSubmitReview?.({
      serviceId,
      clinicId,
      rating: newReview.rating,
      comment: newReview.comment,
      waitTime: newReview.waitTime ? parseInt(newReview.waitTime) : undefined,
      doctorName: newReview.doctorName,
      tags: newReview.tags,
      isForService: true
    });
    
    setShowSubmitDialog(false);
    setNewReview({
      rating: 0,
      comment: '',
      waitTime: '',
      doctorName: '',
      tags: []
    });
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Rating Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">{averageRating.toFixed(1)}</div>
              <div className="flex justify-center mb-2">
                {renderStars(Math.round(averageRating), 'h-6 w-6')}
              </div>
              <p className="text-gray-600">{totalReviews} reviews</p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = ratingDistribution[rating as keyof typeof ratingDistribution];
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                
                return (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="text-sm w-8">{rating}★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-8">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Verification Badge */}
          <div className="flex items-center justify-center gap-2 mt-4 p-3 bg-green-50 rounded-lg">
            <Shield className="h-5 w-5 text-green-600" />
            <span className="text-sm text-green-700">
              {reviews.filter(r => r.isVerified).length} verified patient reviews
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Sort */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4">
          <Select value={filterRating.toString()} onValueChange={(value) => setFilterRating(value === 'all' ? 'all' : parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              <SelectItem value="5">5 Stars</SelectItem>
              <SelectItem value="4">4 Stars</SelectItem>
              <SelectItem value="3">3 Stars</SelectItem>
              <SelectItem value="2">2 Stars</SelectItem>
              <SelectItem value="1">1 Star</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterVerified} onValueChange={(value: any) => setFilterVerified(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reviews</SelectItem>
              <SelectItem value="verified">Verified Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-4">
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="highest">Highest Rated</SelectItem>
              <SelectItem value="lowest">Lowest Rated</SelectItem>
              <SelectItem value="helpful">Most Helpful</SelectItem>
            </SelectContent>
          </Select>

          <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
            <DialogTrigger asChild>
              <Button>
                Write Review
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Review this Service</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Rating */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Rating</label>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setNewReview(prev => ({ ...prev, rating }))}
                        className="p-1"
                      >
                        <Star
                          className={cn(
                            'h-6 w-6',
                            rating <= newReview.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Comment</label>
                  <Textarea
                    placeholder="Share your experience with this service..."
                    value={newReview.comment}
                    onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                  />
                </div>

                {/* Wait Time */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Wait Time (minutes)</label>
                  <Select value={newReview.waitTime} onValueChange={(value) => setNewReview(prev => ({ ...prev, waitTime: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select wait time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No wait</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2+ hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Doctor Name */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Doctor Name</label>
                  <input
                    type="text"
                    placeholder="Doctor's name (optional)"
                    className="w-full px-3 py-2 border rounded-md"
                    value={newReview.doctorName}
                    onChange={(e) => setNewReview(prev => ({ ...prev, doctorName: e.target.value }))}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleSubmitReview}
                    disabled={newReview.rating === 0}
                    className="flex-1"
                  >
                    Submit Review
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowSubmitDialog(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Avatar>
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {review.userInitial || review.userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{review.userName}</h4>
                    {review.isVerified && (
                      <Badge variant="outline" className="text-green-700 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified Patient
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    {renderStars(review.rating)}
                    <span className="text-sm text-gray-500">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>

                  {review.comment && (
                    <p className="text-gray-700 mb-3">{review.comment}</p>
                  )}

                  {/* Review Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    {review.waitTime !== undefined && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <Clock className="h-4 w-4" />
                        Wait: {review.waitTime} min
                      </div>
                    )}
                    
                    {review.doctorName && (
                      <div className="text-gray-600">
                        Doctor: {review.doctorName}
                      </div>
                    )}
                    
                    <div className="text-gray-600">
                      Clinic: {review.clinicName}
                    </div>
                  </div>

                  {/* Tags */}
                  {review.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {review.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-4 mt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onMarkHelpful?.(review.id)}
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      Helpful ({review.helpfulVotes})
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const reason = prompt('Report reason:');
                        if (reason) onReportReview?.(review.id, reason);
                      }}
                    >
                      <Flag className="h-4 w-4 mr-1" />
                      Report
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredReviews.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No reviews match your current filters.
        </div>
      )}
    </div>
  );
}