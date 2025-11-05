'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { SearchFilters, ClinicSearchResult, SavedSearch, SearchSuggestion } from '@/types/search'
import { medicalTermRecognizer } from '@/lib/medical-terms'
import { debounce } from 'lodash'

interface UseAdvancedServiceSearchOptions {
  initialQuery?: string
  initialFilters?: SearchFilters
  enableVoiceSearch?: boolean
  enableRealTimeSearch?: boolean
  debounceMs?: number
  maxResults?: number
  enableCaching?: boolean
  persistHistory?: boolean
}

interface UseAdvancedServiceSearchResult {
  // Search state
  query: string
  filters: SearchFilters
  results: ClinicSearchResult[]
  isLoading: boolean
  error: Error | null
  totalResults: number
  page: number
  hasMore: boolean

  // Search actions
  search: (query?: string, searchFilters?: SearchFilters) => void
  updateFilters: (newFilters: SearchFilters) => void
  clearFilters: () => void
  loadMore: () => void
  reset: () => void

  // Voice search
  voiceQuery: string
  recognizedTerms: string[]
  isListening: boolean
  startVoiceSearch: () => void
  stopVoiceSearch: () => void
  clearVoiceQuery: () => void

  // Medical intelligence
  medicalTermRecognition: {
    recognizedTerms: string[]
    specialties: string[]
    urgencyLevel?: string
    confidence: number
  }
  suggestedFilters: Partial<SearchFilters>

  // Suggestions and history
  suggestions: SearchSuggestion[]
  searchHistory: string[]
  clearHistory: () => void

  // Saved searches
  savedSearches: SavedSearch[]
  saveCurrentSearch: (name: string, enableAlerts?: boolean) => void
  loadSavedSearch: (savedSearch: SavedSearch) => void
  deleteSavedSearch: (id: string) => void

  // Performance metrics
  searchMetrics: {
    responseTime: number
    resultCount: number
    filterCount: number
    lastSearchAt: Date | null
  }
}

const STORAGE_KEYS = {
  SEARCH_HISTORY: 'service-search-history',
  SAVED_SEARCHES: 'service-saved-searches',
  SEARCH_FILTERS: 'service-search-filters'
}

export function useAdvancedServiceSearch(options: UseAdvancedServiceSearchOptions = {}): UseAdvancedServiceSearchResult {
  const {
    initialQuery = '',
    initialFilters = {},
    enableVoiceSearch = true,
    enableRealTimeSearch = true,
    debounceMs = 300,
    maxResults = 50,
    enableCaching = true,
    persistHistory = true
  } = options

  // Core state
  const [query, setQuery] = useState(initialQuery)
  const [filters, setFilters] = useState<SearchFilters>(initialFilters)
  const [page, setPage] = useState(1)
  const [results, setResults] = useState<ClinicSearchResult[]>([])
  const [totalResults, setTotalResults] = useState(0)
  const [searchMetrics, setSearchMetrics] = useState({
    responseTime: 0,
    resultCount: 0,
    filterCount: 0,
    lastSearchAt: null as Date | null
  })

  // Voice search state
  const [voiceQuery, setVoiceQuery] = useState('')
  const [recognizedTerms, setRecognizedTerms] = useState<string[]>([])
  const [isListening, setIsListening] = useState(false)

  // History and saved searches
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])

  // Medical term recognition
  const medicalTermRecognition = useMemo(() => {
    const searchText = query || voiceQuery
    if (!searchText.trim()) {
      return {
        recognizedTerms: [],
        specialties: [],
        urgencyLevel: undefined,
        confidence: 0
      }
    }

    return medicalTermRecognizer.recognizeTerms(searchText)
  }, [query, voiceQuery])

  // Suggested filters based on medical terms
  const suggestedFilters = useMemo(() => {
    if (medicalTermRecognition.recognizedTerms.length > 0) {
      return medicalTermRecognizer.suggestFilters(medicalTermRecognition.recognizedTerms)
    }
    return {}
  }, [medicalTermRecognition.recognizedTerms])

  // Load persisted data
  useEffect(() => {
    if (persistHistory && typeof window !== 'undefined') {
      try {
        // Load search history
        const historyData = localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY)
        if (historyData) {
          setSearchHistory(JSON.parse(historyData))
        }

        // Load saved searches
        const savedData = localStorage.getItem(STORAGE_KEYS.SAVED_SEARCHES)
        if (savedData) {
          setSavedSearches(JSON.parse(savedData))
        }

        // Load last filters
        const filtersData = localStorage.getItem(STORAGE_KEYS.SEARCH_FILTERS)
        if (filtersData) {
          setFilters(JSON.parse(filtersData))
        }
      } catch (error) {
        console.warn('Failed to load persisted search data:', error)
      }
    }
  }, [persistHistory])

  // Persist search history
  const saveToHistory = useCallback((searchQuery: string) => {
    if (!searchQuery.trim() || !persistHistory) return

    setSearchHistory(prev => {
      const newHistory = [searchQuery, ...prev.filter(h => h !== searchQuery)].slice(0, 20)
      localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(newHistory))
      return newHistory
    })
  }, [persistHistory])

  // Debounced search function
  const debouncedSearch = useMemo(
    () => debounce((searchQuery: string, searchFilters: SearchFilters, searchPage: number) => {
      performSearch(searchQuery, searchFilters, searchPage)
    }, debounceMs),
    [debounceMs]
  )

  // Perform the actual search
  const performSearch = useCallback(async (searchQuery: string, searchFilters: SearchFilters, searchPage: number = 1) => {
    const startTime = Date.now()
    setSearchMetrics(prev => ({ ...prev, lastSearchAt: new Date() }))

    try {
      // In a real implementation, this would make an API call
      // For now, we'll simulate search results
      const mockResults: ClinicSearchResult[] = [
        {
          id: '1',
          name: 'Singapore General Hospital',
          address: 'Outram Rd, Singapore 169608',
          phone: '+65 6321 4311',
          rating: 4.5,
          totalReviews: 1250,
          specialties: ['Cardiology', 'Neurology', 'General Surgery'],
          services: ['Emergency Care', 'Surgery', 'Consultation'],
          isOpen: true,
          distance: 2.3,
          isHealthierSgPartner: true
        },
        {
          id: '2',
          name: 'National University Hospital',
          address: '5 Lower Kent Ridge Rd, Singapore 119074',
          phone: '+65 6779 5555',
          rating: 4.3,
          totalReviews: 890,
          specialties: ['Pediatrics', 'Oncology', 'Emergency Medicine'],
          services: ['Pediatric Care', 'Cancer Treatment', 'Emergency Services'],
          isOpen: true,
          distance: 4.1
        }
      ]

      // Apply medical intelligence ranking
      const rankedResults = mockResults.map(result => {
        const ranking = calculateSearchResultRanking(result, searchQuery, searchFilters)
        return { ...result, ranking }
      }).sort((a, b) => (b.ranking?.overallScore || 0) - (a.ranking?.overallScore || 0))

      const responseTime = Date.now() - startTime
      
      if (searchPage === 1) {
        setResults(rankedResults)
      } else {
        setResults(prev => [...prev, ...rankedResults])
      }
      
      setTotalResults(rankedResults.length * searchPage) // Mock total
      
      setSearchMetrics(prev => ({
        ...prev,
        responseTime,
        resultCount: rankedResults.length * searchPage,
        filterCount: Object.keys(searchFilters).length
      }))

      // Save to history if it's a new query
      if (searchQuery && searchPage === 1) {
        saveToHistory(searchQuery)
      }

    } catch (error) {
      console.error('Search failed:', error)
    }
  }, [saveToHistory])

  // Search function
  const search = useCallback((searchQuery?: string, searchFilters?: SearchFilters) => {
    const currentQuery = searchQuery !== undefined ? searchQuery : query
    const currentFilters = searchFilters !== undefined ? searchFilters : filters
    const currentPage = 1

    setQuery(currentQuery)
    setFilters(currentFilters)
    setPage(currentPage)

    if (enableRealTimeSearch) {
      debouncedSearch(currentQuery, currentFilters, currentPage)
    } else {
      performSearch(currentQuery, currentFilters, currentPage)
    }
  }, [query, filters, enableRealTimeSearch, debouncedSearch, performSearch])

  // Update filters
  const updateFilters = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters)
    if (enableRealTimeSearch && query) {
      debouncedSearch(query, newFilters, page)
    }
    
    // Persist filters
    if (persistHistory) {
      localStorage.setItem(STORAGE_KEYS.SEARCH_FILTERS, JSON.stringify(newFilters))
    }
  }, [query, page, enableRealTimeSearch, debouncedSearch, persistHistory])

  // Clear all filters
  const clearFilters = useCallback(() => {
    const emptyFilters = {}
    setFilters(emptyFilters)
    if (persistHistory) {
      localStorage.removeItem(STORAGE_KEYS.SEARCH_FILTERS)
    }
    
    if (enableRealTimeSearch && query) {
      debouncedSearch(query, emptyFilters, page)
    }
  }, [query, page, enableRealTimeSearch, debouncedSearch, persistHistory])

  // Load more results
  const loadMore = useCallback(() => {
    const nextPage = page + 1
    setPage(nextPage)
    
    if (enableRealTimeSearch) {
      debouncedSearch(query, filters, nextPage)
    } else {
      performSearch(query, filters, nextPage)
    }
  }, [query, filters, page, enableRealTimeSearch, debouncedSearch, performSearch])

  // Reset search
  const reset = useCallback(() => {
    setQuery('')
    setFilters({})
    setPage(1)
    setResults([])
    setTotalResults(0)
    setVoiceQuery('')
    setRecognizedTerms([])
    setSearchMetrics({
      responseTime: 0,
      resultCount: 0,
      filterCount: 0,
      lastSearchAt: null
    })
  }, [])

  // Voice search functions
  const startVoiceSearch = useCallback(() => {
    setIsListening(true)
    // Voice search implementation would go here
  }, [])

  const stopVoiceSearch = useCallback(() => {
    setIsListening(false)
  }, [])

  const clearVoiceQuery = useCallback(() => {
    setVoiceQuery('')
    setRecognizedTerms([])
  }, [])

  // History functions
  const clearHistory = useCallback(() => {
    setSearchHistory([])
    if (persistHistory) {
      localStorage.removeItem(STORAGE_KEYS.SEARCH_HISTORY)
    }
  }, [persistHistory])

  // Saved search functions
  const saveCurrentSearch = useCallback((name: string, enableAlerts: boolean = false) => {
    const newSavedSearch: SavedSearch = {
      id: Date.now().toString(),
      name,
      filters: { ...filters },
      alertEnabled: enableAlerts,
      createdAt: new Date(),
      resultCount: results.length,
      searchCount: 1
    }

    const updated = [...savedSearches, newSavedSearch]
    setSavedSearches(updated)
    
    if (persistHistory) {
      localStorage.setItem(STORAGE_KEYS.SAVED_SEARCHES, JSON.stringify(updated))
    }
  }, [filters, results.length, savedSearches, persistHistory])

  const loadSavedSearch = useCallback((savedSearch: SavedSearch) => {
    setQuery('')
    setFilters(savedSearch.filters)
    setPage(1)
    
    // Update last used and search count
    const updated = savedSearches.map(s => 
      s.id === savedSearch.id 
        ? { ...s, lastUsed: new Date(), searchCount: s.searchCount + 1 }
        : s
    )
    setSavedSearches(updated)
    
    if (persistHistory) {
      localStorage.setItem(STORAGE_KEYS.SAVED_SEARCHES, JSON.stringify(updated))
    }
  }, [savedSearches, persistHistory])

  const deleteSavedSearch = useCallback((id: string) => {
    const updated = savedSearches.filter(s => s.id !== id)
    setSavedSearches(updated)
    
    if (persistHistory) {
      localStorage.setItem(STORAGE_KEYS.SAVED_SEARCHES, JSON.stringify(updated))
    }
  }, [savedSearches, persistHistory])

  // Suggestions (mock implementation)
  const suggestions: SearchSuggestion[] = useMemo(() => {
    const searchText = query || voiceQuery
    if (!searchText || searchText.length < 2) return []

    // Mock suggestions based on medical terms
    return [
      {
        type: 'service',
        value: 'cardiology consultation',
        displayValue: 'Cardiology Consultation',
        category: 'Specialty',
        medicalSpecialty: 'cardiology'
      },
      {
        type: 'service',
        value: 'pediatric care',
        displayValue: 'Pediatric Care',
        category: 'Specialty',
        medicalSpecialty: 'pediatrics'
      },
      {
        type: 'service',
        value: 'emergency services',
        displayValue: 'Emergency Services',
        category: 'Urgency',
        urgencyLevel: 'emergency'
      }
    ].filter(s => s.value.toLowerCase().includes(searchText.toLowerCase()))
  }, [query, voiceQuery])

  // Calculate if there are more results
  const hasMore = results.length < totalResults

  // Auto-search when query changes (if real-time is enabled)
  useEffect(() => {
    if (enableRealTimeSearch && (query || Object.keys(filters).length > 0)) {
      debouncedSearch(query, filters, 1)
    }
  }, [query, filters, enableRealTimeSearch, debouncedSearch])

  return {
    // Search state
    query,
    filters,
    results,
    isLoading: searchMetrics.responseTime === 0 && searchMetrics.resultCount > 0,
    error: null,
    totalResults,
    page,
    hasMore,

    // Search actions
    search,
    updateFilters,
    clearFilters,
    loadMore,
    reset,

    // Voice search
    voiceQuery,
    recognizedTerms,
    isListening,
    startVoiceSearch,
    stopVoiceSearch,
    clearVoiceQuery,

    // Medical intelligence
    medicalTermRecognition,
    suggestedFilters,

    // Suggestions and history
    suggestions,
    searchHistory,
    clearHistory,

    // Saved searches
    savedSearches,
    saveCurrentSearch,
    loadSavedSearch,
    deleteSavedSearch,

    // Performance metrics
    searchMetrics
  }
}

// Calculate search result ranking based on medical intelligence
function calculateSearchResultRanking(
  result: ClinicSearchResult,
  query: string,
  filters: SearchFilters
): any {
  let score = 0
  const reasons: string[] = []

  // Basic relevance scoring
  if (query) {
    const queryLower = query.toLowerCase()
    
    // Check name match
    if (result.name.toLowerCase().includes(queryLower)) {
      score += 0.3
      reasons.push('Name match')
    }
    
    // Check specialty match
    if (result.specialties) {
      const specialtyMatches = result.specialties.filter(s => 
        s.toLowerCase().includes(queryLower)
      )
      if (specialtyMatches.length > 0) {
        score += 0.4
        reasons.push(`Specialty: ${specialtyMatches[0]}`)
      }
    }
    
    // Check service match
    if (result.services) {
      const serviceMatches = result.services.filter(s => 
        s.toLowerCase().includes(queryLower)
      )
      if (serviceMatches.length > 0) {
        score += 0.2
        reasons.push('Service match')
      }
    }
  }

  // Rating bonus
  if (result.rating && result.rating >= 4.5) {
    score += 0.1
    reasons.push('High rating')
  }

  // Proximity bonus
  if (result.distance && result.distance <= 2) {
    score += 0.1
    reasons.push('Close location')
  }

  return {
    overallScore: Math.min(score, 1),
    reasons
  }
}