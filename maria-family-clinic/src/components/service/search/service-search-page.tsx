'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Search, 
  Filter, 
  MapPin, 
  SortAsc, 
  SortDesc, 
  Grid3X3, 
  List,
  Settings,
  HelpCircle,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { 
  SearchFilters, 
  ClinicSearchResult, 
  RankingCriteria,
  SavedSearch,
  SearchSuggestion
} from '@/types/search'
import { ServiceSearchInput } from './service-search-input'
import { AdvancedServiceFilters } from './advanced-service-filters'
import { ServiceFilterChips } from './service-filter-chips'
import { SavedSearches } from './saved-searches'
import { useDebounce } from '@/hooks/use-debounce'
import { useMedicalVoiceSearch } from '@/hooks/use-voice-search'
import { medicalTermRecognizer } from '@/lib/medical-terms'

interface ServiceSearchPageProps {
  onSearch?: (query: string, filters: SearchFilters) => void
  results?: ClinicSearchResult[]
  isLoading?: boolean
  className?: string
}

type ViewMode = 'grid' | 'list'
type SortOrder = 'asc' | 'desc'

export function ServiceSearchPage({
  onSearch,
  results = [],
  isLoading = false,
  className
}: ServiceSearchPageProps) {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<SearchFilters>({})
  const [showFilters, setShowFilters] = useState(false)
  const [showSavedSearches, setShowSavedSearches] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<RankingCriteria>('relevance')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const debouncedQuery = useDebounce(query, 300)
  const { 
    isListening, 
    transcript, 
    recognizedTerms,
    startListening,
    stopListening,
    error: voiceError 
  } = useMedicalVoiceSearch()

  // Load recent searches
  useEffect(() => {
    const stored = localStorage.getItem('service-search-history')
    if (stored) {
      try {
        const history = JSON.parse(stored)
        setRecentSearches(history)
      } catch (error) {
        console.warn('Failed to parse search history:', error)
      }
    }
  }, [])

  // Save search to history
  const saveSearchHistory = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return

    setRecentSearches(prev => {
      const newHistory = [searchQuery, ...prev.filter(h => h !== searchQuery)].slice(0, 10)
      localStorage.setItem('service-search-history', JSON.stringify(newHistory))
      return newHistory
    })
  }, [])

  // Handle search
  const handleSearch = useCallback((searchQuery: string, searchFilters?: SearchFilters) => {
    const currentFilters = searchFilters || filters
    setQuery(searchQuery)
    setFilters(currentFilters)
    
    // Update ranking criteria based on search
    const searchBoost = medicalTermRecognizer.getSearchBoost(searchQuery)
    if (searchBoost.boostScore > 0) {
      setSortBy('relevance')
    }
    
    // Execute search
    onSearch?.(searchQuery, currentFilters)
    saveSearchHistory(searchQuery)
  }, [filters, onSearch, saveSearchHistory])

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters)
    if (query) {
      onSearch?.(query, newFilters)
    }
  }, [query, onSearch])

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setFilters({})
    setQuery('')
    if (onSearch) {
      onSearch('', {})
    }
  }, [onSearch])

  // Remove specific filter
  const removeFilter = useCallback((filterType: string, value: string) => {
    const updatedFilters = { ...filters }
    
    switch (filterType) {
      case 'service':
        updatedFilters.services = (updatedFilters.services || []).filter(s => s !== value)
        break
      case 'serviceType':
        updatedFilters.serviceTypes = (updatedFilters.serviceTypes || []).filter(s => s !== value)
        break
      case 'urgency':
        updatedFilters.urgency = (updatedFilters.urgency || []).filter(u => u !== value)
        break
      case 'duration':
        updatedFilters.duration = (updatedFilters.duration || []).filter(d => d !== value)
        break
      case 'complexity':
        updatedFilters.complexity = (updatedFilters.complexity || []).filter(c => c !== value)
        break
      case 'patientType':
        updatedFilters.patientTypes = (updatedFilters.patientTypes || []).filter(p => p !== value)
        break
      case 'insurance':
        updatedFilters.insurance = (updatedFilters.insurance || []).filter(i => i !== value)
        break
      case 'location':
        updatedFilters.location = undefined
        break
      case 'rating':
        updatedFilters.rating = undefined
        break
    }

    setFilters(updatedFilters)
    if (query) {
      onSearch?.(query, updatedFilters)
    }
  }, [filters, query, onSearch])

  // Handle location request
  const handleLocationRequest = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newFilters = {
            ...filters,
            location: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              radiusKm: 5
            }
          }
          setFilters(newFilters)
          if (query) {
            onSearch?.(query, newFilters)
          }
        },
        (error) => {
          console.error('Error getting location:', error)
          // Show error message to user
        }
      )
    }
  }, [filters, query, onSearch])

  // Handle voice search results
  const handleVoiceSearch = useCallback((voiceQuery: string) => {
    setQuery(voiceQuery)
    // Process medical terms from voice input
    const recognition = medicalTermRecognizer.recognizeTerms(voiceQuery)
    if (recognition.recognizedTerms.length > 0) {
      const suggestedFilters = medicalTermRecognizer.suggestFilters(recognition.recognizedTerms)
      const updatedFilters = { ...filters, ...suggestedFilters }
      setFilters(updatedFilters)
    }
  }, [filters])

  // Load saved search
  const handleLoadSavedSearch = useCallback((savedSearch: SavedSearch) => {
    setQuery('')
    setFilters(savedSearch.filters)
    if (onSearch) {
      onSearch('', savedSearch.filters)
    }
    
    // Update last used time
    const updatedSearch = {
      ...savedSearch,
      lastUsed: new Date(),
      searchCount: savedSearch.searchCount + 1
    }
    
    // This would be handled by the parent component in a real implementation
    console.log('Loading saved search:', updatedSearch)
  }, [onSearch])

  // Clear recent searches
  const handleClearRecent = useCallback(() => {
    setRecentSearches([])
    localStorage.removeItem('service-search-history')
  }, [])

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0
    if (filters.services?.length) count += filters.services.length
    if (filters.serviceTypes?.length) count += filters.serviceTypes.length
    if (filters.urgency?.length) count += filters.urgency.length
    if (filters.duration?.length) count += filters.duration.length
    if (filters.complexity?.length) count += filters.complexity.length
    if (filters.patientTypes?.length) count += filters.patientTypes.length
    if (filters.insurance?.length) count += filters.insurance.length
    if (filters.location) count += 1
    if (filters.rating) count += 1
    return count
  }

  const activeFilterCount = getActiveFilterCount()

  return (
    <div className={cn("w-full max-w-7xl mx-auto p-4 space-y-6", className)}>
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Service Search</h1>
            <p className="text-gray-600">
              Find medical services, specialists, and healthcare providers
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSavedSearches(!showSavedSearches)}
            >
              <Search className="w-4 h-4 mr-2" />
              Saved Searches
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Search Input */}
        <ServiceSearchInput
          onSearch={handleSearch}
          onVoiceSearch={handleVoiceSearch}
          onLocationRequest={handleLocationRequest}
          placeholder="Search medical services, specialties, or symptoms..."
          suggestions={suggestions}
          recentSearches={recentSearches}
          onClearRecent={handleClearRecent}
          showVoiceSearch={true}
          showLocationSearch={true}
          showFilters={true}
        />

        {/* Voice Search Status */}
        {isListening && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                <span className="text-sm text-blue-800">
                  Listening... Speak clearly for best results
                </span>
              </div>
              {transcript && (
                <div className="mt-2 text-sm text-blue-700">
                  "{transcript}"
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Voice Search Error */}
        {voiceError && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-800">{voiceError}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Medical Terms Recognition */}
        {recognizedTerms.length > 0 && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2 mb-2">
                <Info className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Medical Terms Recognized
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {recognizedTerms.map((term, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    🩺 {term}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters Sidebar */}
        {showFilters && (
          <div className="lg:w-80 space-y-4">
            <AdvancedServiceFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={clearAllFilters}
            />
          </div>
        )}

        {/* Results Area */}
        <div className="flex-1 space-y-4">
          {/* Active Filters */}
          {activeFilterCount > 0 && (
            <ServiceFilterChips
              filters={filters}
              onFilterRemove={removeFilter}
              onClearAll={clearAllFilters}
            />
          )}

          {/* Results Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold">
                Search Results
                {!isLoading && results.length > 0 && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({results.length} found)
                  </span>
                )}
              </h2>
              
              {isLoading && (
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span>Searching...</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {/* Sort Controls */}
              <div className="flex items-center space-x-1">
                <Button
                  variant={sortOrder === 'asc' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortOrder('asc')}
                  title="Sort ascending"
                >
                  <SortAsc className="w-4 h-4" />
                </Button>
                <Button
                  variant={sortOrder === 'desc' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortOrder('desc')}
                  title="Sort descending"
                >
                  <SortDesc className="w-4 h-4" />
                </Button>
              </div>

              {/* View Mode */}
              <div className="flex items-center border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Search Results */}
          <div className="space-y-4">
            {results.length === 0 && !isLoading && query && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Search className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No results found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search terms or filters
                  </p>
                  <Button variant="outline" onClick={clearAllFilters}>
                    Clear all filters
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Results Grid/List would go here */}
            <div className={cn(
              "grid gap-4",
              viewMode === 'grid' 
                ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" 
                : "grid-cols-1"
            )}>
              {/* This would be populated with actual clinic/service cards */}
              {results.map((result) => (
                <Card key={result.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg">{result.name}</h3>
                        <p className="text-gray-600 text-sm">{result.address}</p>
                      </div>
                      
                      {result.rating && (
                        <div className="flex items-center space-x-1">
                          <span className="text-yellow-500">★</span>
                          <span className="font-medium">{result.rating}</span>
                          <span className="text-gray-500 text-sm">
                            ({result.totalReviews} reviews)
                          </span>
                        </div>
                      )}
                      
                      {result.specialties && result.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {result.specialties.slice(0, 3).map((specialty, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Saved Searches Sidebar */}
        {showSavedSearches && (
          <div className="lg:w-80">
            <SavedSearches
              onLoadSearch={handleLoadSavedSearch}
              onDeleteSearch={(id) => console.log('Delete search:', id)}
              onUpdateSearch={(id, updates) => console.log('Update search:', id, updates)}
            />
          </div>
        )}
      </div>
    </div>
  )
}