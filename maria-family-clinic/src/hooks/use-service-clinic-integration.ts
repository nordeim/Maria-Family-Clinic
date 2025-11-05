import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { api } from '@/trpc/react'
import { toast } from 'sonner'

// =============================================================================
// REAL-TIME AVAILABILITY HOOKS
// =============================================================================

export function useServiceAvailabilityMatrix(serviceId?: string, filters?: any) {
  return useQuery({
    queryKey: ['service-availability-matrix', serviceId, filters],
    queryFn: () => api.serviceClinicIntegration.getAvailabilityMatrix.query({
      serviceId: serviceId!,
      filters,
    }),
    enabled: !!serviceId,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
    staleTime: 10000, // Consider data stale after 10 seconds
  })
}

export function useClinicAvailability(clinicId?: string, date?: string) {
  return useQuery({
    queryKey: ['clinic-availability', clinicId, date],
    queryFn: () => api.serviceClinicIntegration.getClinicAvailability.query({
      clinicId: clinicId!,
      date: date!,
    }),
    enabled: !!clinicId && !!date,
    refetchInterval: 15000, // More frequent for specific clinic
  })
}

// =============================================================================
// SERVICE-CLINIC MATCHING HOOKS
// =============================================================================

export function useClinicsForService(serviceId?: string, filters?: any) {
  return useInfiniteQuery({
    queryKey: ['clinics-for-service', serviceId, filters],
    queryFn: ({ pageParam }) => api.serviceClinicIntegration.findClinicsForService.query({
      serviceId: serviceId!,
      filters,
      cursor: pageParam,
    }),
    enabled: !!serviceId,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null,
  })
}

export function useServiceFilters(serviceId?: string) {
  return useQuery({
    queryKey: ['service-filters', serviceId],
    queryFn: () => api.serviceClinicIntegration.getServiceFilters.query({
      serviceId: serviceId!,
    }),
    enabled: !!serviceId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// =============================================================================
// SERVICE PACKAGE HOOKS
// =============================================================================

export function useServicePackages(filters?: any) {
  return useQuery({
    queryKey: ['service-packages', filters],
    queryFn: () => api.serviceClinicIntegration.getServicePackages.query({ filters }),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function usePackageDetails(packageId?: string) {
  return useQuery({
    queryKey: ['package-details', packageId],
    queryFn: () => api.serviceClinicIntegration.getPackageDetails.query({ packageId: packageId! }),
    enabled: !!packageId,
  })
}

export function usePackageComparison(packageIds: string[]) {
  return useQuery({
    queryKey: ['package-comparison', packageIds],
    queryFn: () => api.serviceClinicIntegration.comparePackages.query({ packageIds }),
    enabled: packageIds.length > 0,
  })
}

// Package booking with optimistic updates
export function useBookPackage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: {
      packageId: string
      preferredDate?: string
      preferredTime?: string
      notes?: string
    }) => api.serviceClinicIntegration.bookPackage.mutate(data),
    onMutate: async (newBooking) => {
      // Optimistic update - add booking to cache
      await queryClient.cancelQueries({ queryKey: ['package-bookings'] })
      
      const previousBookings = queryClient.getQueryData(['package-bookings'])
      
      queryClient.setQueryData(['package-bookings'], (old: any) => ({
        ...old,
        data: [
          ...(old?.data ?? []),
          {
            ...newBooking,
            id: 'temp-' + Date.now(),
            status: 'PENDING',
            createdAt: new Date(),
          },
        ],
      }))
      
      return { previousBookings }
    },
    onError: (err, newBooking, context) => {
      // Rollback optimistic update on error
      queryClient.setQueryData(['package-bookings'], context?.previousBookings)
      toast.error('Failed to book package. Please try again.')
    },
    onSuccess: () => {
      toast.success('Package booked successfully!')
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['package-bookings'] })
      queryClient.invalidateQueries({ queryKey: ['package-details'] })
    },
  })
}

// =============================================================================
// REFERRAL WORKFLOW HOOKS
// =============================================================================

export function useCreateReferral() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: {
      serviceId: string
      referringClinicId: string
      referredClinicId: string
      patientInfo?: {
        patientId?: string
        name?: string
        email?: string
        phone?: string
      }
      referralDetails: {
        urgencyLevel: string
        clinicalNotes?: string
        preferredDate?: string
        specialRequests?: string
      }
    }) => api.serviceClinicIntegration.createReferral.mutate(data),
    onSuccess: () => {
      toast.success('Referral created successfully!')
      queryClient.invalidateQueries({ queryKey: ['referrals'] })
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create referral')
    },
  })
}

export function useReferrals(filters?: any) {
  return useQuery({
    queryKey: ['referrals', filters],
    queryFn: () => api.serviceClinicIntegration.getReferrals.query({ filters }),
  })
}

export function useReferralDetails(referralId?: string) {
  return useQuery({
    queryKey: ['referral-details', referralId],
    queryFn: () => api.serviceClinicIntegration.getReferralDetails.query({ referralId: referralId! }),
    enabled: !!referralId,
  })
}

export function useUpdateReferralStatus() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: {
      referralId: string
      status: string
      notes?: string
    }) => api.serviceClinicIntegration.updateReferralStatus.mutate(data),
    onSuccess: () => {
      toast.success('Referral status updated!')
      queryClient.invalidateQueries({ queryKey: ['referrals'] })
      queryClient.invalidateQueries({ queryKey: ['referral-details'] })
    },
  })
}

// =============================================================================
// CLINIC EXPERTISE HOOKS
// =============================================================================

export function useClinicExpertise(filters?: any) {
  return useQuery({
    queryKey: ['clinic-expertise', filters],
    queryFn: () => api.serviceClinicIntegration.getClinicExpertise.query({ filters }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useExpertiseComparison(clinicIds: string[], serviceId?: string) {
  return useQuery({
    queryKey: ['expertise-comparison', clinicIds, serviceId],
    queryFn: () => api.serviceClinicIntegration.compareExpertise.query({
      clinicIds,
      serviceId,
    }),
    enabled: clinicIds.length > 0,
  })
}

export function useExpertiseDetails(expertiseId?: string) {
  return useQuery({
    queryKey: ['expertise-details', expertiseId],
    queryFn: () => api.serviceClinicIntegration.getExpertiseDetails.query({ expertiseId: expertiseId! }),
    enabled: !!expertiseId,
  })
}

// =============================================================================
// SERVICE REVIEWS AND RATINGS
// =============================================================================

export function useServiceReviews(serviceId?: string, clinicId?: string) {
  return useInfiniteQuery({
    queryKey: ['service-reviews', serviceId, clinicId],
    queryFn: ({ pageParam }) => api.serviceClinicIntegration.getServiceReviews.query({
      serviceId: serviceId!,
      clinicId,
      cursor: pageParam,
    }),
    enabled: !!serviceId,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null,
  })
}

export function useSubmitReview() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: {
      serviceId: string
      clinicId: string
      rating: number
      review: string
      isVerified: boolean
    }) => api.serviceClinicIntegration.submitReview.mutate(data),
    onSuccess: () => {
      toast.success('Review submitted successfully!')
      queryClient.invalidateQueries({ queryKey: ['service-reviews'] })
      queryClient.invalidateQueries({ queryKey: ['service-expertise'] })
    },
  })
}

// =============================================================================
// BOOKING INTEGRATION HOOKS
// =============================================================================

export function useIntegratedBooking() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: {
      serviceId: string
      clinicId: string
      doctorId?: string
      appointmentDate: string
      appointmentTime: string
      patientInfo?: any
      isPackageBooking?: boolean
      packageId?: string
    }) => api.serviceClinicIntegration.createIntegratedBooking.mutate(data),
    onMutate: async (newBooking) => {
      // Optimistic update for appointment slots
      await queryClient.cancelQueries({ queryKey: ['clinic-availability'] })
      
      const previousAvailability = queryClient.getQueryData(['clinic-availability', newBooking.clinicId, newBooking.appointmentDate])
      
      // Update availability to show slot as booked
      queryClient.setQueryData(['clinic-availability', newBooking.clinicId, newBooking.appointmentDate], (old: any) => ({
        ...old,
        slots: old?.slots?.map((slot: any) =>
          slot.time === newBooking.appointmentTime
            ? { ...slot, isAvailable: false, isPending: true }
            : slot
        ) ?? [],
      }))
      
      return { previousAvailability }
    },
    onError: (err, newBooking, context) => {
      // Rollback on error
      queryClient.setQueryData(['clinic-availability', newBooking.clinicId, newBooking.appointmentDate], context?.previousAvailability)
      toast.error('Booking failed. Please try a different time slot.')
    },
    onSuccess: () => {
      toast.success('Appointment booked successfully!')
      queryClient.invalidateQueries({ queryKey: ['clinic-availability'] })
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    },
  })
}

export function useBookingConflicts() {
  return useMutation({
    mutationFn: (data: {
      serviceId: string
      clinicId: string
      appointmentDate: string
      appointmentTime: string
      excludeBookingId?: string
    }) => api.serviceClinicIntegration.checkBookingConflicts.query(data),
  })
}

// =============================================================================
// REAL-TIME UPDATES HOOK
// =============================================================================

export function useRealTimeUpdates(enabled: boolean = true) {
  const queryClient = useQueryClient()
  
  useEffect(() => {
    if (!enabled) return
    
    // Set up real-time subscriptions or polling
    const interval = setInterval(() => {
      // Refresh critical queries
      queryClient.invalidateQueries({ queryKey: ['service-availability-matrix'] })
      queryClient.invalidateQueries({ queryKey: ['clinic-availability'] })
    }, 30000) // Every 30 seconds
    
    return () => clearInterval(interval)
  }, [enabled, queryClient])
  
  return {
    refreshAll: () => {
      queryClient.invalidateQueries()
    },
    refreshAvailability: () => {
      queryClient.invalidateQueries({ queryKey: ['service-availability-matrix'] })
      queryClient.invalidateQueries({ queryKey: ['clinic-availability'] })
    },
  }
}

// =============================================================================
// SEARCH AND FILTERING HOOKS
// =============================================================================

export function useServiceSearch(query?: string, filters?: any) {
  return useInfiniteQuery({
    queryKey: ['service-search', query, filters],
    queryFn: ({ pageParam }) => api.serviceClinicIntegration.searchServices.query({
      query: query!,
      filters,
      cursor: pageParam,
    }),
    enabled: !!query && query.length >= 2,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null,
    staleTime: 30000, // 30 seconds
  })
}

export function useClinicSearch(query?: string, location?: any, filters?: any) {
  return useInfiniteQuery({
    queryKey: ['clinic-search', query, location, filters],
    queryFn: ({ pageParam }) => api.serviceClinicIntegration.searchClinics.query({
      query: query!,
      location,
      filters,
      cursor: pageParam,
    }),
    enabled: !!query,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null,
  })
}

// =============================================================================
// DASHBOARD AND ANALYTICS HOOKS
// =============================================================================

export function useServiceClinicStats(filters?: any) {
  return useQuery({
    queryKey: ['service-clinic-stats', filters],
    queryFn: () => api.serviceClinicIntegration.getServiceClinicStats.query({ filters }),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function usePopularServices(limit: number = 10) {
  return useQuery({
    queryKey: ['popular-services', limit],
    queryFn: () => api.serviceClinicIntegration.getPopularServices.query({ limit }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useTopClinics(serviceId?: string, limit: number = 10) {
  return useQuery({
    queryKey: ['top-clinics', serviceId, limit],
    queryFn: () => api.serviceClinicIntegration.getTopClinics.query({ serviceId, limit }),
    enabled: !!serviceId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// =============================================================================
// ERROR HANDLING AND RETRY
// =============================================================================

export function useRetryBooking() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (bookingData: any) => api.serviceClinicIntegration.createIntegratedBooking.mutate(bookingData),
    onError: (error: any) => {
      console.error('Booking retry failed:', error)
      toast.error('Unable to complete booking. Please contact support.')
    },
  })
}

// =============================================================================
// UTILITY HOOKS
// =============================================================================

export function useClearCache() {
  const queryClient = useQueryClient()
  
  return {
    clearAll: () => queryClient.clear(),
    clearServiceCache: () => queryClient.removeQueries({ queryKey: ['service-'] }),
    clearClinicCache: () => queryClient.removeQueries({ queryKey: ['clinic-'] }),
    clearPackageCache: () => queryClient.removeQueries({ queryKey: ['package-'] }),
    clearReferralCache: () => queryClient.removeQueries({ queryKey: ['referral-'] }),
  }
}