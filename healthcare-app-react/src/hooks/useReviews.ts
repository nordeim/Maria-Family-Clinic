import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, Review } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

// Get reviews for a doctor
export function useDoctorReviews(doctorId: string) {
  return useQuery({
    queryKey: ['reviews', 'doctor', doctorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(`Error fetching reviews: ${error.message}`)
      }

      return data as Review[]
    },
    enabled: !!doctorId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Get user's reviews
export function useUserReviews() {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['reviews', 'user', user?.id],
    queryFn: async () => {
      if (!user) return []
      
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(`Error fetching user reviews: ${error.message}`)
      }

      return data as Review[]
    },
    enabled: !!user,
  })
}

// Create review
export function useCreateReview() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (reviewData: Omit<Review, 'id' | 'user_id' | 'is_approved' | 'created_at'>) => {
      if (!user) throw new Error('User must be logged in to submit reviews')

      const { data, error } = await supabase
        .from('reviews')
        .insert({
          ...reviewData,
          user_id: user.id,
          is_approved: false,
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Error creating review: ${error.message}`)
      }

      return data as Review
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', 'doctor', variables.doctor_id] })
      queryClient.invalidateQueries({ queryKey: ['reviews', 'user'] })
    },
  })
}

// Calculate average rating
export function useAverageRating(doctorId: string) {
  const { data: reviews } = useDoctorReviews(doctorId)
  
  if (!reviews || reviews.length === 0) return null
  
  const total = reviews.reduce((sum, review) => sum + review.rating, 0)
  return {
    average: total / reviews.length,
    count: reviews.length
  }
}
