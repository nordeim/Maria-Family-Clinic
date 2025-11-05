'use client'

import { useQueryClient } from '@tanstack/react-query'
import { trpc } from '@/lib/trpc/client'
import type { RouterOutputs } from '@/lib/trpc/client'

/**
 * React Query Utilities for optimal performance
 */

// Query key factory
export const queryKeys = {
  // User queries
  user: {
    me: () => ['user', 'me'] as const,
    dashboard: () => ['user', 'dashboard'] as const,
    profile: () => ['user', 'profile'] as const,
  },

  // Clinic queries
  clinic: {
    all: (filters?: any) => ['clinic', 'all', filters] as const,
    byId: (id: string) => ['clinic', 'byId', id] as const,
    nearby: (location: any) => ['clinic', 'nearby', location] as const,
    stats: () => ['clinic', 'stats'] as const,
  },

  // Doctor queries
  doctor: {
    all: (filters?: any) => ['doctor', 'all', filters] as const,
    byId: (id: string) => ['doctor', 'byId', id] as const,
    availability: (doctorId: string, date?: Date) => 
      ['doctor', 'availability', doctorId, date?.toISOString()] as const,
    stats: () => ['doctor', 'stats'] as const,
  },

  // Service queries
  service: {
    all: (filters?: any) => ['service', 'all', filters] as const,
    byId: (id: string) => ['service', 'byId', id] as const,
    categories: () => ['service', 'categories'] as const,
    popular: (limit?: number) => ['service', 'popular', limit] as const,
  },

  // Appointment queries
  appointment: {
    my: (filters?: any) => ['appointment', 'my', filters] as const,
    byId: (id: string) => ['appointment', 'byId', id] as const,
    stats: () => ['appointment', 'stats'] as const,
  },

  // Enquiry queries
  enquiry: {
    all: (filters?: any) => ['enquiry', 'all', filters] as const,
    byId: (id: string) => ['enquiry', 'byId', id] as const,
    stats: () => ['enquiry', 'stats'] as const,
  },

  // Healthier SG queries
  healthierSg: {
    program: () => ['healthierSg', 'program'] as const,
    enrollment: () => ['healthierSg', 'enrollment'] as const,
    eligibility: (age: number, conditions?: boolean) => 
      ['healthierSg', 'eligibility', age, conditions] as const,
    clinics: (filters?: any) => ['healthierSg', 'clinics', filters] as const,
  },

  // Analytics queries
  analytics: {
    dashboard: (clinicId?: string, dateRange?: string) => 
      ['analytics', 'dashboard', clinicId, dateRange] as const,
    trends: (clinicId?: string, period?: any) => 
      ['analytics', 'trends', clinicId, period] as const,
    popularServices: (clinicId?: string) => 
      ['analytics', 'popularServices', clinicId] as const,
  },
}

/**
 * Query configuration presets
 */
export const queryConfigs = {
  // Short-lived queries (frequent updates)
  short: {
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  },

  // Medium-lived queries
  medium: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  },

  // Long-lived queries (infrequent updates)
  long: {
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  },

  // User-specific queries (security)
  user: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  },

  // Real-time queries (appointments, notifications)
  realtime: {
    staleTime: 0, // Always stale
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // 30 seconds
    refetchIntervalInBackground: true,
  },
}

/**
 * Prefetch utilities
 * Note: Disabled due to tRPC client-side limitations
 */
export function usePrefetchQueries() {
  // const queryClient = useQueryClient()

  const prefetchUserData = async () => {
    // Prefetch functionality commented out - use tRPC hooks directly
  }

  const prefetchClinicData = async (filters?: any) => {
    // Prefetch functionality commented out - use tRPC hooks directly
  }

  const prefetchDoctorData = async (filters?: any) => {
    // Prefetch functionality commented out - use tRPC hooks directly
  }

  const prefetchServiceCategories = async () => {
    // Prefetch functionality commented out - use tRPC hooks directly
  }

  const prefetchHealthierSgData = async () => {
    // Prefetch functionality commented out - use tRPC hooks directly
  }

  return {
    prefetchUserData,
    prefetchClinicData,
    prefetchDoctorData,
    prefetchServiceCategories,
    prefetchHealthierSgData,
  }
}

/**
 * Optimistic update utilities
 */
export function useOptimisticUpdates() {
  const queryClient = useQueryClient()

  const updateClinicOptimistically = (clinicId: string, updates: any) => {
    queryClient.setQueryData(queryKeys.clinic.byId(clinicId), (old: any) => {
      return old ? { ...old, ...updates } : old
    })
  }

  const updateAppointmentStatus = (appointmentId: string, status: string) => {
    // Update in my appointments list
    queryClient.setQueryData(queryKeys.appointment.my(), (old: any) => {
      if (!old) return old
      return {
        ...old,
        data: old.data.map((appointment: any) =>
          appointment.id === appointmentId 
            ? { ...appointment, status }
            : appointment
        ),
      }
    })

    // Update individual appointment
    queryClient.setQueryData(queryKeys.appointment.byId(appointmentId), (old: any) => {
      return old ? { ...old, status } : old
    })
  }

  const addAppointmentOptimistically = (newAppointment: any) => {
    queryClient.setQueryData(queryKeys.appointment.my(), (old: any) => {
      if (!old) return old
      return {
        ...old,
        data: [newAppointment, ...old.data],
        pagination: {
          ...old.pagination,
          total: old.pagination.total + 1,
        },
      }
    })
  }

  const updateUserProfile = (updates: any) => {
    queryClient.setQueryData(queryKeys.user.me(), (old: any) => {
      if (!old) return old
      return {
        ...old,
        profile: { ...old.profile, ...updates },
      }
    })
  }

  return {
    updateClinicOptimistically,
    updateAppointmentStatus,
    addAppointmentOptimistically,
    updateUserProfile,
  }
}

/**
 * Cache invalidation utilities
 */
export function useInvalidateQueries() {
  const queryClient = useQueryClient()

  const invalidateUserQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['user'] })
  }

  const invalidateClinicQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['clinic'] })
  }

  const invalidateAppointmentQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['appointment'] })
  }

  const invalidateEnquiryQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['enquiry'] })
  }

  const invalidateHealthierSgQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['healthierSg'] })
  }

  const invalidateAnalyticsQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['analytics'] })
  }

  const invalidateAllQueries = () => {
    queryClient.invalidateQueries()
  }

  return {
    invalidateUserQueries,
    invalidateClinicQueries,
    invalidateAppointmentQueries,
    invalidateEnquiryQueries,
    invalidateHealthierSgQueries,
    invalidateAnalyticsQueries,
    invalidateAllQueries,
  }
}

/**
 * Background refetch utilities
 */
export function useBackgroundRefetch() {
  const queryClient = useQueryClient()

  const startBackgroundRefetch = () => {
    // This would set up background refetching for critical data
    // Implementation depends on specific requirements
  }

  const stopBackgroundRefetch = () => {
    // Stop all background refetching
    queryClient.clear()
  }

  return {
    startBackgroundRefetch,
    stopBackgroundRefetch,
  }
}

/**
 * Query status helpers
 */
export function useQueryStatus() {
  const queryClient = useQueryClient()

  const getQueryStatus = (queryKey: any[]) => {
    const query = queryClient.getQueryState(queryKey)
    return {
      isLoading: query?.status === 'pending',
      isError: query?.status === 'error',
      isSuccess: query?.status === 'success',
      isStale: query?.dataUpdatedAt ? Date.now() - query.dataUpdatedAt > 60000 : true,
      error: query?.error,
      data: query?.data,
    }
  }

  const isAnyQueryLoading = (queryKeys: any[][]) => {
    return queryKeys.some(key => {
      const query = queryClient.getQueryState(key)
      return query?.status === 'pending'
    })
  }

  const getCacheSize = () => {
    return queryClient.getQueryCache().getAll().length
  }

  return {
    getQueryStatus,
    isAnyQueryLoading,
    getCacheSize,
  }
}

/**
 * Export everything as a comprehensive utility object
 */
export const reactQueryUtils = {
  queryKeys,
  queryConfigs,
  prefetch: usePrefetchQueries,
  optimistic: useOptimisticUpdates,
  invalidate: useInvalidateQueries,
  background: useBackgroundRefetch,
  status: useQueryStatus,
}