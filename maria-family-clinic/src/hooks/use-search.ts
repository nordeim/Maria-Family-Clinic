import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useCallback, useEffect } from 'react'
import { api } from '@/lib/trpc/client'
import { SearchFilters, SearchState, ClinicSearchResult, SearchSuggestion } from '@/types/search'

interface UseSearchOptions {
  enableRealTime?: boolean
  debounceMs?: number
  maxSuggestions?: number
  persistFilters?: boolean
  sessionId?: string
}

interface UseSearchResult {
  // Search state
  searchState: SearchState
  filters: SearchFilters
  isLoading: boolean
  error: Error | null
  
  // Search actions
  search: (query?: string) => void
  setFilters: (filters: Partial<SearchFilters>) => void
  resetFilters: () => void
  clearHistory: () => void
  
  // Suggestions
  getSuggestions: (query: string) => SearchSuggestion[]
  
  // Analytics
  getSearchAnalytics: () => any
}

// Default search state
const defaultSearchState: SearchState = {
  filters: {},
  selectedFilters: [],
  isLoading: false,
  results: [],
  totalResults: 0,
  suggestions: [],
  searchHistory: [],
}

export function useSearch(options: UseSearchOptions = {}) {
  const {
    enableRealTime = true,
    debounceMs = 300,
    maxSuggestions = 10,
    persistFilters = true,
    sessionId,
  } = options

  const queryClient = useQueryClient()
  const [searchState, setSearchState] = useState<SearchState>(defaultSearchState)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFiltersState] = useState<SearchFilters>({})
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null)

  // Persist filters to localStorage
  useEffect(() => {
    if (persistFilters && typeof window !== 'undefined') {
      localStorage.setItem('clinic-search-filters', JSON.stringify(filters))
    }
  }, [filters, persistFilters])

  // Load persisted filters
  useEffect(() => {
    if (persistFilters && typeof window !== 'undefined') {
      const saved = localStorage.getItem('clinic-search-filters')
      if (saved) {
        try {
          const parsedFilters = JSON.parse(saved)
          setFiltersState(parsedFilters)
        } catch (error) {
          console.warn('Failed to parse saved filters:', error)
        }
      }
    }
  }, [persistFilters])

  // Load search history
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const history = localStorage.getItem('clinic-search-history')
      if (history) {
        try {
          const parsed = JSON.parse(history)
          setSearchState(prev => ({ ...prev, searchHistory: parsed }))
        } catch (error) {
          console.warn('Failed to parse search history:', error)
        }
      }
    }
  }, [])

  // Save search history
  const saveSearchHistory = useCallback((query: string) => {
    if (typeof window !== 'undefined') {
      setSearchState(prev => {
        const newHistory = [query, ...prev.searchHistory.filter(h => h !== query)].slice(0, 10)
        localStorage.setItem('clinic-search-history', JSON.stringify(newHistory))
        return { ...prev, searchHistory: newHistory }
      })
    }
  }, [])

  // Clear search history
  const clearHistory = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('clinic-search-history')
      setSearchState(prev => ({ ...prev, searchHistory: [] }))
    }
  }, [])

  // Main search query
  const searchMutation = api.clinic.search.useMutation()

  // Get search suggestions query
  const suggestionsQuery = api.clinic.getSuggestions.useQuery(
    { query: searchQuery, limit: maxSuggestions },
    { enabled: searchQuery.length > 1 }
  )

  // Advanced search with filters
  const executeSearch = useCallback(async (query?: string, searchFilters?: SearchFilters) => {
    const currentQuery = query ?? searchQuery
    const currentFilters = searchFilters ?? filters
    const startTime = Date.now()

    setSearchState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const results = await searchMutation.mutateAsync({
        query: currentQuery,
        filters: currentFilters,
        sessionId,
      })

      const responseTime = Date.now() - startTime

      setSearchState(prev => ({
        ...prev,
        isLoading: false,
        results: results.data,
        totalResults: results.pagination?.total || results.data.length,
        selectedFilters: getSelectedFiltersList(currentFilters),
        searchHistory: currentQuery ? [...prev.searchHistory] : prev.searchHistory,
      }))

      // Log search analytics
      if (enableRealTime) {
        await logSearchAnalytics({
          query: currentQuery,
          filters: currentFilters,
          resultsCount: results.data.length,
          responseTime,
          sessionId,
        })
      }

      if (currentQuery) {
        saveSearchHistory(currentQuery)
      }

      return results
    } catch (error) {
      setSearchState(prev => ({
        ...prev,
        isLoading: false,
        error: error as Error,
      }))
      throw error
    }
  }, [searchQuery, filters, searchMutation, sessionId, enableRealTime, saveSearchHistory])

  // Debounced search
  const debouncedSearch = useCallback((query?: string, searchFilters?: SearchFilters) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    const timer = setTimeout(() => {
      executeSearch(query, searchFilters)
    }, debounceMs)

    setDebounceTimer(timer)
  }, [executeSearch, debounceTimer, debounceMs])

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFiltersState(updatedFilters)

    if (enableRealTime) {
      debouncedSearch(undefined, updatedFilters)
    }
  }, [filters, enableRealTime, debouncedSearch])

  // Reset filters
  const resetFilters = useCallback(() => {
    setFiltersState({})
    setSearchQuery('')
    setSearchState(prev => ({ 
      ...defaultSearchState, 
      searchHistory: prev.searchHistory 
    }))
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('clinic-search-filters')
    }
  }, [])

  // Search function
  const search = useCallback((query?: string) => {
    if (query !== undefined) {
      setSearchQuery(query)
    }
    executeSearch(query, filters)
  }, [executeSearch, filters])

  // Get suggestions
  const getSuggestions = useCallback((query: string): SearchSuggestion[] => {
    if (!query || query.length < 2) return []

    const clinicSuggestions: SearchSuggestion[] = []
    const serviceSuggestions: SearchSuggestion[] = []
    const locationSuggestions: SearchSuggestion[] = []

    // This would typically come from the suggestions query
    // For now, we'll implement a simple local suggestion logic
    const queryLower = query.toLowerCase()

    // Add clinic suggestions
    if (queryLower.length > 2) {
      // This would be populated from the actual data
      // clinicSuggestions.push({ type: 'clinic', value: query, displayValue: query })
    }

    // Add service suggestions
    const commonServices = [
      'General Practice',
      'Vaccinations',
      'Health Screening',
      'Chronic Disease Management',
    ]
    
    commonServices.forEach(service => {
      if (service.toLowerCase().includes(queryLower)) {
        serviceSuggestions.push({
          type: 'service',
          value: service,
          displayValue: service,
        })
      }
    })

    // Add location suggestions
    const commonLocations = [
      'Central Singapore',
      'Orchard Road',
      'Marina Bay',
      'Little India',
      'Chinatown',
    ]

    commonLocations.forEach(location => {
      if (location.toLowerCase().includes(queryLower)) {
        locationSuggestions.push({
          type: 'location',
          value: location,
          displayValue: location,
        })
      }
    })

    return [
      ...clinicSuggestions,
      ...serviceSuggestions,
      ...locationSuggestions,
    ].slice(0, maxSuggestions)
  }, [maxSuggestions])

  // Get selected filters as list
  const getSelectedFiltersList = (searchFilters: SearchFilters): string[] => {
    const filters: string[] = []
    if (searchFilters.query) filters.push(searchFilters.query)
    if (searchFilters.services) filters.push(...searchFilters.services)
    if (searchFilters.languages) filters.push(...searchFilters.languages)
    if (searchFilters.operatingHours) filters.push(...searchFilters.operatingHours)
    if (searchFilters.clinicTypes) filters.push(...searchFilters.clinicTypes)
    if (searchFilters.accessibilityFeatures) filters.push(...searchFilters.accessibilityFeatures)
    if (searchFilters.rating) filters.push(searchFilters.rating)
    if (searchFilters.insurance) filters.push(...searchFilters.insurance)
    return filters
  }

  // Log search analytics
  const logSearchAnalytics = async (data: any) => {
    try {
      await fetch('/api/analytics/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    } catch (error) {
      console.warn('Failed to log search analytics:', error)
    }
  }

  // Get search analytics
  const getSearchAnalytics = useCallback(() => {
    return {
      totalSearches: searchState.searchHistory.length,
      popularFilters: {}, // Would be populated from analytics API
      averageResponseTime: 0, // Would be calculated from logged data
      popularQueries: searchState.searchHistory.slice(0, 5),
    }
  }, [searchState.searchHistory])

  return {
    // Search state
    searchState,
    filters,
    isLoading: searchState.isLoading,
    error: searchState.error,
    
    // Search actions
    search,
    setFilters: updateFilters,
    resetFilters,
    clearHistory,
    
    // Suggestions
    getSuggestions,
    
    // Analytics
    getSearchAnalytics,
  }
}

// Hook for nearby clinics search
export function useNearbySearch() {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null)

  const nearbyQuery = api.clinic.getNearby.useQuery(
    location ? {
      latitude: location.latitude,
      longitude: location.longitude,
      radiusKm: 5,
      limit: 20,
    } : undefined,
    { enabled: !!location }
  )

  const getCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
        },
        (error) => {
          console.error('Error getting location:', error)
        }
      )
    }
  }, [])

  return {
    ...nearbyQuery,
    location,
    getCurrentLocation,
    refetchNearby: nearbyQuery.refetch,
  }
}

// Hook for clinic search suggestions
export function useSearchSuggestions(query: string, limit: number = 10) {
  return api.clinic.getSuggestions.useQuery(
    { query, limit },
    { 
      enabled: query.length > 1,
      staleTime: 30000, // 30 seconds
    }
  )
}