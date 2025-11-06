import React, { useState } from 'react'
import { Star, ThumbsUp, CheckCircle, User } from 'lucide-react'
import { format } from 'date-fns'
import { useDoctorReviews, useCreateReview, useAverageRating } from '../../hooks/useReviews'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'sonner'

interface DoctorReviewsProps {
  doctorId: string
  doctorName: string
}

export const DoctorReviews: React.FC<DoctorReviewsProps> = ({ doctorId, doctorName }) => {
  const { user } = useAuth()
  const { data: reviews, isLoading } = useDoctorReviews(doctorId)
  const averageRating = useAverageRating(doctorId)
  const createReview = useCreateReview()

  const [showReviewForm, setShowReviewForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast.error('Please sign in to leave a review')
      return
    }

    try {
      await createReview.mutateAsync({
        doctor_id: doctorId,
        rating,
        comment,
      })

      toast.success('Review submitted successfully! It will be visible after approval.')
      setShowReviewForm(false)
      setRating(5)
      setComment('')
    } catch (error) {
      toast.error('Failed to submit review. Please try again.')
    }
  }

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Loading reviews...</div>
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header with Average Rating */}
      <div className="border-b border-gray-200 pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Patient Reviews</h2>
            {averageRating && (
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(averageRating.average)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {averageRating.average.toFixed(1)}
                </span>
                <span className="text-gray-600">({averageRating.count} reviews)</span>
              </div>
            )}
          </div>
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Write a Review
          </button>
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Share Your Experience with {doctorName}
          </h3>
          <form onSubmit={handleSubmitReview}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-8 w-8 cursor-pointer transition-colors ${
                        star <= rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300 hover:text-yellow-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tell others about your experience..."
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createReview.isPending || !user}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {createReview.isPending ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      {!reviews || reviews.length === 0 ? (
        <div className="text-center py-12">
          <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No reviews yet. Be the first to review!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    {format(new Date(review.created_at), 'MMMM d, yyyy')}
                  </p>
                </div>
              </div>
              {review.comment && (
                <p className="text-gray-700 leading-relaxed mb-3">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DoctorReviews
