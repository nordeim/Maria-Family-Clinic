"use client"

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { Search, Filter, MapPin, Star, Clock, X, Heart, Navigation } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'
import { useClinicList, useHealthierSgParticipatingClinics } from '@/lib/react-query/hooks'
import { ClinicCard } from '@/components/healthcare/clinic-card'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { VirtualizedList } from './virtualized-list'
import { ClinicSearchFilters } from './clinic-search-filters'
import { HealthierSGFilterPanel } from '@/components/clinics/HealthierSGFilterPanel'
import { HealthierSGClinicCard } from '@/components/clinics/HealthierSGClinicCard'
import { useUserLocation } from '@/hooks/use-user-location'
import { showInfo, showSuccess, showWarning } from '@/lib/notifications/toasts'

interface ClinicSearchProps {
  initialSearchTerm?: string
  onClinicSelect?: (clinicId: string) => void
  onToggleFavorite?: (clinicId: string, isFavorite: boolean) => void
  favorites?: string[]
  className?: string
}

interface SearchFilters {
  search: string
  isActive?: boolean
  isHealthierSgPartner?: boolean
  languages?: string[]
  services?: string[]
  location?: {
    latitude: number
    longitude: number
    radiusKm: number
  }
  orderBy: 'name' | 'distance' | 'rating' | 'createdAt'
  orderDirection: 'asc' | 'desc'
  // Healthier SG specific filters
  healthierSGProgramCategories?: string[]
  healthierSGServiceCategories?: string[]
  healthierSGParticipationType?: string[]
  healthierSGClinicStatus?: string[]
  healthierSGCapacityLevel?: 'any' | 'high' | 'medium' | 'low'
  healthierSGWaitTime?: 'any' | '<30min' | '30-60min' | '>1hr'
  healthierSGHasVaccination?: boolean
  healthierSGHasHealthScreening?: boolean
  healthierSGHasChronicCare?: boolean
}

export function ClinicSearch({
  initialSearchTerm = '',
  onClinicSelect,
  onToggleFavorite,
  favorites = [],
  className
}: ClinicSearchProps) {
  // State management
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm)
  const [filters, setFilters] = useState<SearchFilters>({
    search: initialSearchTerm,
    orderBy: 'name',
    orderDirection: 'asc'
  })
  const [showFilters, setShowFilters] = useState(false)
  const [filterMode, setFilterMode] = useState<'standard' | 'healthier-sg'>('standard')
  const [selectedIndex, setSelectedIndex] = useState(-1)

  // Location hooks
  const { location, error: locationError } = useUserLocation()

  // Debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300) // 300ms delay as requested

  // Update filters when debounced search changes
  useEffect(() => {
    setFilters(prev => ({ ...prev, search: debouncedSearchTerm }))
  }, [debouncedSearchTerm])

  // Update location in filters when user location changes
  useEffect(() => {
    if (location) {
      setFilters(prev => ({
        ...prev,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          radiusKm: 10 // Default 10km radius
        }
      }))
    }
  }, [location])

  // React Query with optimized caching
  const {
    data: clinicResponse,
    isLoading: isLoadingClinics,
    error: clinicError,
    isError
  } = useClinicList(
    filterMode === 'standard' 
      ? {
          ...filters,
          limit: 50,
          page: 1
        }
      : undefined
  )

  // Healthier SG clinic finder hook
  const {
    data: healthierSgResponse,
    isLoading: isLoadingHealthierSg,
    error: healthierSgError,
    isError: isHealthierSgError
  } = useHealthierSgParticipatingClinics(
    filterMode === 'healthier-sg'
      ? {
          ...filters,
          limit: 50,
          page: 1
        }
      : undefined
  )

  // Flatten clinic data from pagination
  const clinics = useMemo(() => {
    if (filterMode === 'standard' && clinicResponse?.data) return clinicResponse.data
    if (filterMode === 'healthier-sg' && healthierSgResponse?.data) return healthierSgResponse.data
    return []
  }, [clinicResponse, healthierSgResponse, filterMode])

  // Handle search input changes
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value)
    setSelectedIndex(-1) // Reset selection
  }, [])

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setSelectedIndex(-1) // Reset selection
  }, [])

  // Handle filter mode change
  const handleFilterModeChange = useCallback((mode: 'standard' | 'healthier-sg') => {
    setFilterMode(mode)
    setShowFilters(false) // Close filters when switching modes
  }, [])

  // Clear search
  const handleClearSearch = useCallback(() => {
    setSearchTerm('')
    setFilters(prev => ({ ...prev, search: '' }))
  }, [])

  // Handle clinic selection with keyboard navigation
  const handleClinicSelect = useCallback((clinicId: string, index?: number) => {
    const actualIndex = index !== undefined ? index : clinics.findIndex(c => c.id === clinicId)
    setSelectedIndex(actualIndex)
    onClinicSelect?.(clinicId)
  }, [clinics, onClinicSelect])

  // Toggle favorite with optimistic update
  const handleToggleFavorite = useCallback((clinicId: string, isFavorite: boolean) => {
    onToggleFavorite?.(clinicId, isFavorite)
    
    if (isFavorite) {
      showSuccess('Added to favorites')
    } else {
      showSuccess('Removed from favorites')
    }
  }, [onToggleFavorite])

  // Show location request if no location available
  useEffect(() => {
    if (locationError && !location) {
      showInfo('Enable location services to find nearby clinics')
    }
  }, [locationError, location])

  // Loading skeletons for initial load
  const LoadingSkeleton = () => (
    <Card className="p-6 space-y-4">
      <div className="flex items-start gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 flex-1" />
      </div>
    </Card>
  )

  // Error state
  if (isError) {
    return (
      <Card className="p-6 text-center">
        <div className="text-red-500 mb-4">
          <Search className="h-12 w-12 mx-auto mb-2" />
          <h3 className="text-lg font-semibold">Unable to load clinics</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Please check your connection and try again
          </p>
        </div>
        <Button onClick={() => window.location.reload()} variant="outline">
          Retry
        </Button>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search Header */}
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search clinics, services, or locations..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              onClick={handleClearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Search Stats */}
        {(filterMode === 'standard' ? clinicResponse?.pagination : healthierSgResponse?.pagination) && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              {filterMode === 'healthier-sg' && <Heart className="h-4 w-4 text-green-600" />}
              Found {(filterMode === 'standard' ? clinicResponse?.pagination : healthierSgResponse?.pagination)?.total} clinic{(filterMode === 'standard' ? clinicResponse?.pagination : healthierSgResponse?.pagination)?.total !== 1 ? 's' : ''}
              {filterMode === 'healthier-sg' && (
                <Badge variant="outline" className="text-green-600 border-green-200">
                  Healthier SG Participating
                </Badge>
              )}
            </span>
            {location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>Using your location</span>
              </div>
            )}
          </div>
        )}

        {/* Filter Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={filterMode === 'standard' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterModeChange('standard')}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Standard Search
          </Button>
          <Button
            variant={filterMode === 'healthier-sg' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterModeChange('healthier-sg')}
            className="gap-2 bg-green-600 hover:bg-green-700 text-white"
          >
            <Heart className="h-4 w-4" />
            Healthier SG
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2 ml-auto"
          >
            <Filter className="h-4 w-4" />
            Filters
            {(() => {
              const activeFilterCount = Object.keys(filters).filter(key => 
                key !== 'search' && 
                key !== 'orderBy' && 
                key !== 'orderDirection' &&
                (filters as any)[key] !== undefined && 
                (filters as any)[key] !== '' && 
                (filters as any)[key] !== 'any'
              ).length
              return activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 text-xs">
                  {activeFilterCount}
                </Badge>
              )
            })()}
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        filterMode === 'healthier-sg' ? (
          <HealthierSGFilterPanel
            filters={filters}
            onChange={handleFilterChange}
            onClose={() => setShowFilters(false)}
          />
        ) : (
          <ClinicSearchFilters
            filters={filters}
            onChange={handleFilterChange}
            onClose={() => setShowFilters(false)}
          />
        )
      )}

      {/* Results */}
      <div className="space-y-4">
        {isLoadingClinics && !clinics.length ? (
          // Initial loading skeleton
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <LoadingSkeleton key={i} />
            ))}
          </div>
        ) : clinics.length === 0 ? (
          // Empty state
          <Card className="p-8 text-center">
            <div className="text-muted-foreground">
              {filterMode === 'healthier-sg' ? (
                <Heart className="h-12 w-12 mx-auto mb-4 text-green-500" />
              ) : (
                <Search className="h-12 w-12 mx-auto mb-4" />
              )}
              <h3 className="text-lg font-semibold mb-2">
                {filterMode === 'healthier-sg' ? 'No Healthier SG clinics found' : 'No clinics found'}
              </h3>
              <p className="text-sm mb-4">
                {debouncedSearchTerm
                  ? filterMode === 'healthier-sg'
                    ? `No Healthier SG clinics match "${debouncedSearchTerm}"`
                    : `No clinics match "${debouncedSearchTerm}"`
                  : filterMode === 'healthier-sg'
                    ? "No Healthier SG participating clinics available in your area"
                    : "No clinics available in your area"}
              </p>
              {debouncedSearchTerm && (
                <Button variant="outline" onClick={handleClearSearch}>
                  Clear search
                </Button>
              )}
            </div>
          </Card>
        ) : (
          // Virtualized clinic list
          <VirtualizedList
            items={clinics}
            itemHeight={300} // Approximate height of clinic card
            overscan={5}
            renderItem={(clinic, index) => (
              filterMode === 'healthier-sg' ? (
                // Use HealthierSGClinicCard for Healthier SG mode
                <HealthierSGClinicCard
                  key={clinic.id}
                  clinic={clinic}
                  onViewDetails={(id) => handleClinicSelect(id, index)}
                  onGetDirections={(id) => {
                    // Handle directions
                    showInfo('Opening directions...')
                  }}
                  onBookAppointment={(id) => {
                    // Handle booking
                    showInfo('Opening booking...')
                  }}
                  onToggleFavorite={(id, isFavorite) => handleToggleFavorite(id, isFavorite)}
                  isFavorite={favorites.includes(clinic.id)}
                />
              ) : (
                // Use regular ClinicCard for standard mode
                <ClinicCard
                  key={clinic.id}
                  clinic={{
                    id: clinic.id,
                    name: clinic.name,
                    address: clinic.address,
                    phone: clinic.phone || '',
                    hours: typeof clinic.operatingHours === 'object' && clinic.operatingHours !== null && 'monday' in clinic.operatingHours 
                      ? String((clinic.operatingHours as any).monday) 
                      : 'Hours not available',
                    rating: 4.2, // Mock rating - should come from API
                    distance: undefined,
                    specialties: clinic.services?.map(s => s.name) || [],
                    isOpen: true, // Mock open status
                    isMOHVerified: clinic.isHealthierSgPartner || false,
                    isWheelchairAccessible: Array.isArray(clinic.facilities) ? clinic.facilities.includes('wheelchair_access') : false,
                    hasParking: Array.isArray(clinic.facilities) ? clinic.facilities.includes('parking') : false,
                    acceptsInsurance: true,
                  }}
                  onViewDetails={(id) => handleClinicSelect(id, index)}
                  onGetDirections={(id) => {
                    // Handle directions
                    showInfo('Opening directions...')
                  }}
                  onBookAppointment={(id) => {
                    // Handle booking
                    showInfo('Opening booking...')
                  }}
                  onToggleFavorite={(id, isFavorite) => handleToggleFavorite(id, isFavorite)}
                  isFavorite={favorites.includes(clinic.id)}
                />
              )
            )}
            className="grid gap-4 md:grid-cols-2"
          />
        )}
      </div>
    </div>
  )
}