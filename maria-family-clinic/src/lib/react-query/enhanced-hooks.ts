'use client'

import React from 'react'
import { useQuery, useMutation, useQueryClient, useInfiniteQuery, useInfiniteQuery as useInfiniteQueryType } from '@tanstack/react-query'
import { trpc } from '@/lib/trpc/client'
import type { RouterOutputs } from '@/lib/trpc/client'
import { useCallback, useEffect, useRef } from 'react'
import { getGlobalPerformanceMonitor, withPerformanceMonitoring } from '@/lib/utils/performance-monitor'
import { useOfflineFavorites } from '@/lib/utils/offline-storage'

/**
 * Enhanced React Query hooks for optimized clinic search and discovery
 */

// Enhanced clinic list hook with infinite scroll and background prefetching
export function useClinicListInfinite(
  filters?: {
    search?: string
    isActive?: boolean
    isHealthierSgPartner?: boolean
    languages?: string[]
    services?: string[]
    location?: {
      latitude: number
      longitude: number
      radiusKm: number
    }
    orderBy?: 'name' | 'distance' | 'rating' | 'createdAt'
    orderDirection?: 'asc' | 'desc'
  }
) {
  const queryClient = useQueryClient()

  // Performance monitoring
  const performanceMonitor = getGlobalPerformanceMonitor()

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch
  } = useInfiniteQuery({
    queryKey: ['clinic', 'infinite', filters],
    queryFn: withPerformanceMonitoring(
      async ({ pageParam = 1 }) => {
        const result = await trpc.clinic.getAll.fetch({
          ...filters,
          page: pageParam,
          limit: 50 // Increased limit for better virtualization
        })
        return result
      },
      'clinicInfiniteFetch',
      performanceMonitor
    ),
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage?.pagination) return undefined
      const { page, totalPages } = lastPage.pagination
      return page < totalPages ? page + 1 : undefined
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes for infinite queries
    refetchOnWindowFocus: false,
    refetchOnMount: 'always',
  })

  // Prefetch next page when approaching the end
  const prefetchNextPage = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      queryClient.prefetchInfiniteQuery({
        queryKey: ['clinic', 'infinite', filters],
        queryFn: ({ pageParam = 1 }) => 
          trpc.clinic.getAll.fetch({ ...filters, page: pageParam, limit: 50 }),
        getNextPageParam: (lastPage) => {
          if (!lastPage?.pagination) return undefined
          const { page, totalPages } = lastPage.pagination
          return page < totalPages ? page + 1 : undefined
        }
      })
    }
  }, [queryClient, filters, hasNextPage, isFetchingNextPage])

  // Background prefetch clinic details when user hovers over clinic cards
  const prefetchClinicDetails = useCallback(async (clinicId: string) => {
    await queryClient.prefetchQuery({
      queryKey: ['clinic', 'getById', clinicId],
      queryFn: () => trpc.clinic.getById.fetch({ id: clinicId }),
      staleTime: 10 * 60 * 1000, // 10 minutes
    })
  }, [queryClient])

  // Flatten clinic data from infinite pages
  const clinics = data?.pages.flatMap(page => page.data) || []

  // Prefetch nearby clinics when location changes
  useEffect(() => {
    if (filters?.location?.latitude && filters.location.longitude) {
      queryClient.prefetchQuery({
        queryKey: ['clinic', 'nearby', filters.location],
        queryFn: () => trpc.clinic.getNearby.fetch({
          latitude: filters.location!.latitude,
          longitude: filters.location!.longitude,
          radiusKm: filters.location!.radiusKm,
          limit: 20
        }),
        staleTime: 2 * 60 * 1000, // 2 minutes
      })
    }
  }, [filters?.location?.latitude, filters?.location?.longitude, queryClient])

  return {
    clinics,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
    prefetchNextPage,
    prefetchClinicDetails
  }
}

// Enhanced clinic hook with smart caching
export function useClinic(id: string, options?: { 
  enabled?: boolean
  staleTime?: number
  prefetchOnMount?: boolean
}) {
  const queryClient = useQueryClient()
  const performanceMonitor = getGlobalPerformanceMonitor()
  const { enabled = true, staleTime = 10 * 60 * 1000, prefetchOnMount = true } = options || {}

  const query = trpc.clinic.getById.useQuery(
    { id },
    {
      enabled: enabled && !!id,
      staleTime,
      gcTime: 30 * 60 * 1000,
    }
  )

  // Background prefetch when component mounts
  useEffect(() => {
    if (prefetchOnMount && id && !query.data) {
      queryClient.prefetchQuery({
        queryKey: ['clinic', 'getById', id],
        queryFn: withPerformanceMonitoring(
          () => trpc.clinic.getById.fetch({ id }),
          'clinicPrefetch',
          performanceMonitor
        ),
        staleTime,
      })
    }
  }, [id, queryClient, staleTime, prefetchOnMount, query.data, performanceMonitor])

  // Prefetch when user hovers over clinic card
  const prefetchOnHover = useCallback(async (clinicId: string) => {
    await queryClient.prefetchQuery({
      queryKey: ['clinic', 'getById', clinicId],
      queryFn: () => trpc.clinic.getById.fetch({ id: clinicId }),
      staleTime,
    })
  }, [queryClient, staleTime])

  // Prefetch related clinics (nearby, same services, etc.)
  const prefetchRelatedClinics = useCallback(async (clinicData: any) => {
    if (clinicData?.location) {
      // Prefetch nearby clinics
      await queryClient.prefetchQuery({
        queryKey: ['clinic', 'nearby', clinicData.location],
        queryFn: () => trpc.clinic.getNearby.fetch({
          latitude: clinicData.location.latitude,
          longitude: clinicData.location.longitude,
          radiusKm: 5,
          limit: 10
        }),
        staleTime: 2 * 60 * 1000,
      })
    }

    if (clinicData?.services?.length) {
      // Prefetch clinics with similar services
      const serviceNames = clinicData.services.slice(0, 3).map((s: any) => s.name)
      await queryClient.prefetchQuery({
        queryKey: ['clinic', 'similar', serviceNames],
        queryFn: () => trpc.clinic.getAll.fetch({
          services: serviceNames,
          limit: 20
        }),
        staleTime: 5 * 60 * 1000,
      })
    }
  }, [queryClient])

  return {
    ...query,
    prefetchOnHover,
    prefetchRelatedClinics
  }
}

// Enhanced nearby clinics hook with location-based optimization
export function useNearbyClinicsOptimized(
  location: {
    latitude: number
    longitude: number
    radiusKm?: number
    limit?: number
    services?: string[]
    isActive?: boolean
  },
  enabled = true
) {
  const queryClient = useQueryClient()
  const performanceMonitor = getGlobalPerformanceMonitor()

  const {
    data: clinics,
    isLoading,
    error,
    refetch,
    isStale
  } = trpc.clinic.getNearby.useQuery(location, {
    enabled: enabled && !!location.latitude && !!location.longitude,
    staleTime: 2 * 60 * 1000, // 2 minutes for nearby search
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  // Prefetch expanded nearby results in background
  const prefetchExpandedResults = useCallback(async () => {
    await queryClient.prefetchQuery({
      queryKey: ['clinic', 'nearby', 'expanded', location],
      queryFn: withPerformanceMonitoring(
        () => trpc.clinic.getNearby.fetch({
          ...location,
          limit: 50 // Larger batch for background
        }),
        'nearbyExpandedPrefetch',
        performanceMonitor
      ),
      staleTime: 2 * 60 * 1000,
    })
  }, [queryClient, location, performanceMonitor])

  // Calculate nearby clinics with multiple radius options
  const getClinicsByRadius = useCallback((radiusKm: number) => {
    const cacheKey = ['clinic', 'nearby', 'byRadius', location.latitude, location.longitude, radiusKm]
    return queryClient.fetchQuery({
      queryKey: cacheKey,
      queryFn: () => trpc.clinic.getNearby.fetch({
        ...location,
        radiusKm,
        limit: 20
      }),
      staleTime: 2 * 60 * 1000,
    })
  }, [queryClient, location])

  return {
    clinics,
    isLoading,
    error,
    refetch,
    isStale,
    prefetchExpandedResults,
    getClinicsByRadius
  }
}

// Optimized clinic creation with better optimistic updates
export function useCreateClinicOptimized() {
  const queryClient = useQueryClient()
  const performanceMonitor = getGlobalPerformanceMonitor()

  return trpc.clinic.create.useMutation({
    onMutate: async (newClinic) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['clinic.getAll'] })
      await queryClient.cancelQueries({ queryKey: ['clinic', 'infinite'] })

      // Snapshot previous values
      const previousClinics = queryClient.getQueryData(['clinic.getAll'])
      const previousInfiniteData = queryClient.getQueryData(['clinic', 'infinite'])

      // Create optimistic clinic data
      const optimisticClinic = {
        ...newClinic,
        id: 'temp-' + Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Update regular clinic list
      queryClient.setQueryData(['clinic.getAll'], (old: any) => {
        if (!old) return old
        return {
          ...old,
          data: [...old.data, optimisticClinic],
          pagination: {
            ...old.pagination,
            total: old.pagination.total + 1,
          },
        }
      })

      // Update infinite query data
      queryClient.setQueryData(['clinic', 'infinite'], (old: any) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: [...page.data, optimisticClinic],
            pagination: {
              ...page.pagination,
              total: page.pagination.total + 1,
            }
          }))
        }
      })

      return { previousClinics, previousInfiniteData, optimisticClinic }
    },
    onError: (err, newClinic, context) => {
      // Rollback optimistic updates
      if (context?.previousClinics) {
        queryClient.setQueryData(['clinic.getAll'], context.previousClinics)
      }
      if (context?.previousInfiniteData) {
        queryClient.setQueryData(['clinic', 'infinite'], context.previousInfiniteData)
      }
    },
    onSettled: () => {
      // Invalidate and refetch both regular and infinite queries
      queryClient.invalidateQueries({ queryKey: ['clinic.getAll'] })
      queryClient.invalidateQueries({ queryKey: ['clinic', 'infinite'] })
      queryClient.invalidateQueries({ queryKey: ['clinic', 'nearby'] })
    },
  })
}

// Enhanced clinic updates with immediate UI feedback
export function useUpdateClinicOptimized() {
  const queryClient = useQueryClient()

  return trpc.clinic.update.useMutation({
    onMutate: async (updatedClinic) => {
      const clinicId = updatedClinic.id

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['clinic.getAll'] })
      await queryClient.cancelQueries({ queryKey: ['clinic', 'getById', clinicId] })
      await queryClient.cancelQueries({ queryKey: ['clinic', 'infinite'] })

      // Snapshot previous values
      const previousClinics = queryClient.getQueryData(['clinic.getAll'])
      const previousClinic = queryClient.getQueryData(['clinic', 'getById', clinicId])
      const previousInfiniteData = queryClient.getQueryData(['clinic', 'infinite'])

      // Optimistically update individual clinic
      queryClient.setQueryData(['clinic', 'getById', clinicId], (old: any) => {
        return old ? { ...old, ...updatedClinic } : old
      })

      // Optimistically update clinic list
      queryClient.setQueryData(['clinic.getAll'], (old: any) => {
        if (!old) return old
        return {
          ...old,
          data: old.data.map((clinic: any) =>
            clinic.id === clinicId ? { ...clinic, ...updatedClinic } : clinic
          ),
        }
      })

      // Optimistically update infinite data
      queryClient.setQueryData(['clinic', 'infinite'], (old: any) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: page.data.map((clinic: any) =>
              clinic.id === clinicId ? { ...clinic, ...updatedClinic } : clinic
            )
          }))
        }
      })

      return { previousClinics, previousClinic, previousInfiniteData, clinicId }
    },
    onError: (err, updatedClinic, context) => {
      // Rollback optimistic updates
      if (context?.previousClinics) {
        queryClient.setQueryData(['clinic.getAll'], context.previousClinics)
      }
      if (context?.previousClinic) {
        queryClient.setQueryData(['clinic', 'getById', context.clinicId], context.previousClinic)
      }
      if (context?.previousInfiniteData) {
        queryClient.setQueryData(['clinic', 'infinite'], context.previousInfiniteData)
      }
    },
    onSettled: (data, error, variables) => {
      // Invalidate related queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['clinic.getAll'] })
      queryClient.invalidateQueries({ queryKey: ['clinic', 'getById', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['clinic', 'infinite'] })
      queryClient.invalidateQueries({ queryKey: ['clinic', 'nearby'] })
    },
  })
}

// Enhanced favorites management with offline support
export function useClinicFavorites() {
  const { favorites, toggleFavorite, isFavorite } = useOfflineFavorites()
  const queryClient = useQueryClient()

  // Sync favorites with server when online
  const syncFavoritesWithServer = useCallback(async () => {
    try {
      // This would typically sync with the server
      // For now, we'll just invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['user', 'favorites'] })
    } catch (error) {
      console.warn('Failed to sync favorites with server:', error)
    }
  }, [queryClient])

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    syncFavoritesWithServer
  }
}

// Smart search hook with debouncing and caching
export function useClinicSearch(
  initialQuery: string = '',
  filters?: any
) {
  const [searchQuery, setSearchQuery] = React.useState(initialQuery)
  const debouncedQuery = useDebouncedValue(searchQuery, 300)
  const queryClient = useQueryClient()

  // Execute search when debounced query changes
  const searchResults = useClinicListInfinite({
    ...filters,
    search: debouncedQuery
  })

  // Prefetch common searches
  const prefetchSearch = useCallback((query: string) => {
    queryClient.prefetchQuery({
      queryKey: ['clinic', 'search', query, filters],
      queryFn: () => trpc.clinic.getAll.fetch({
        ...filters,
        search: query,
        limit: 50
      }),
      staleTime: 5 * 60 * 1000,
    })
  }, [queryClient, filters])

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('')
  }, [])

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    prefetchSearch,
    clearSearch
  }
}

// Debounce hook (simple implementation)
function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value)

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}