import * as React from 'react'
import { useSearch, useNearbySearch } from '@/hooks/use-search'
import { SearchFilters } from '@/components/search/search-filters'
import { ClinicCard } from '@/components/healthcare/clinic-card'
import { EmptyState } from '@/components/ui/empty-state'
import { Loading } from '@/components/ui/loading'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Search as SearchIcon, 
  MapPin, 
  Filter, 
  Star, 
  Clock, 
  Navigation,
  RefreshCw,
  Zap
} from 'lucide-react'
import { SearchFilters as SearchFiltersType } from '@/types/search'

interface SearchPageProps {
  initialQuery?: string
  className?: string
}

export function SearchPage({ 
  initialQuery = '', 
  className 
}: SearchPageProps) {
  const {
    searchState,
    filters,
    isLoading,
    error,
    search,
    setFilters,
    resetFilters,
    clearHistory,
    getSuggestions,
  } = useSearch({
    enableRealTime: true,
    debounceMs: 300,
    maxSuggestions: 10,
    persistFilters: true,
  })

  const {
    location,
    getCurrentLocation,
    refetchNearby,
    isLoading: nearbyLoading,
  } = useNearbySearch()

  const [showAdvancedFilters, setShowAdvancedFilters] = React.useState(false)

  // Handle search
  const handleSearch = React.useCallback((query: string) => {
    search(query)
  }, [search])

  // Handle location request
  const handleLocationRequest = React.useCallback(() => {
    getCurrentLocation()
  }, [getCurrentLocation])

  // Auto-search when location is obtained
  React.useEffect(() => {
    if (location && !searchState.results.length) {
      setFilters({
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          radiusKm: 5,
        }
      })
    }
  }, [location, setFilters, searchState.results.length])

  // Initial search
  React.useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery)
    } else if (location) {
      // Search nearby clinics when location is available
      setFilters({
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          radiusKm: 5,
        }
      })
    }
  }, [initialQuery, location, handleSearch, setFilters])

  // Calculate average response time from search history
  const averageResponseTime = React.useMemo(() => {
    // This would typically come from analytics
    return 85 // ms - simulated
  }, [searchState])

  // Get suggestion list for input component
  const suggestions = React.useMemo(() => {
    if (!searchState.searchHistory.length) return []
    return getSuggestions('')
  }, [getSuggestions, searchState.searchHistory])

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>
            An error occurred while searching. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Search Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Find Healthcare Near You
              </h1>
              <p className="text-muted-foreground mt-1">
                Discover trusted clinics and healthcare providers in Singapore
              </p>
            </div>
            
            {location && (
              <Badge variant="outline" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Location Enabled
              </Badge>
            )}
          </div>

          {/* Performance Indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4" />
              <span>Searching with real-time filters...</span>
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <SearchFilters
          filters={filters}
          isLoading={isLoading}
          resultCount={searchState.totalResults}
          onFiltersChange={setFilters}
          onLocationRequest={handleLocationRequest}
          showSearchHistory={true}
          searchHistory={searchState.searchHistory}
          onClearHistory={clearHistory}
          onFilterReset={resetFilters}
        />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Search Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Response Time</span>
                  <Badge variant="outline">
                    <Clock className="h-3 w-3 mr-1" />
                    {averageResponseTime}ms
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Active Filters</span>
                  <Badge variant="outline">
                    <Filter className="h-3 w-3 mr-1" />
                    {searchState.selectedFilters.length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Searches Today</span>
                  <Badge variant="outline">
                    <SearchIcon className="h-3 w-3 mr-1" />
                    {searchState.searchHistory.length}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Location Quick Actions */}
            {!location && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Location Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleLocationRequest}
                    disabled={nearbyLoading}
                    className="w-full"
                    size="sm"
                  >
                    {nearbyLoading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <MapPin className="h-4 w-4 mr-2" />
                    )}
                    Enable Location
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Results */}
          <div className="lg:col-span-3 space-y-6">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold">
                  {isLoading ? 'Searching...' : `${searchState.totalResults} Clinics Found`}
                </h2>
                {!isLoading && searchState.totalResults > 0 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Star className="h-4 w-4" />
                    <span>Sorted by relevance</span>
                  </div>
                )}
              </div>

              {searchState.totalResults > 0 && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Navigation className="h-4 w-4 mr-2" />
                    View on Map
                  </Button>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    More Filters
                  </Button>
                </div>
              )}
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="grid gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-48 bg-muted rounded-lg" />
                  </div>
                ))}
              </div>
            )}

            {/* Results Grid */}
            {!isLoading && searchState.results.length > 0 && (
              <div className="grid gap-6">
                {searchState.results.map((clinic) => (
                  <ClinicCard
                    key={clinic.id}
                    clinic={{
                      id: clinic.id,
                      name: clinic.name,
                      address: clinic.address,
                      phone: clinic.phone || '',
                      hours: clinic.operatingHours?.monday || 'Contact for hours',
                      rating: clinic.rating,
                      totalReviews: clinic.totalReviews,
                      distance: clinic.distance ? `${clinic.distance.toFixed(1)} km` : undefined,
                      specialties: clinic.doctors?.map(d => `${d.firstName} ${d.lastName}`).slice(0, 3) || [],
                      isOpen: clinic.isActive,
                      isMOHVerified: clinic.accreditationStatus === 'accredited',
                      hasParking: clinic.facilities?.includes('parking') || false,
                      isWheelchairAccessible: clinic.facilities?.includes('wheelchair_accessible') || false,
                      acceptsInsurance: true, // Would be determined from actual data
                      doctorCount: clinic.doctors?.length || 0,
                      established: 2020, // Would come from actual data
                    }}
                    onViewDetails={(id) => console.log('View clinic:', id)}
                    onGetDirections={(id) => console.log('Get directions:', id)}
                    onBookAppointment={(id) => console.log('Book appointment:', id)}
                    onToggleFavorite={(id, isFavorite) => console.log('Toggle favorite:', id, isFavorite)}
                  />
                ))}
              </div>
            )}

            {/* No Results */}
            {!isLoading && searchState.results.length === 0 && (
              <EmptyState
                icon={SearchIcon}
                title="No clinics found"
                description={
                  searchState.selectedFilters.length > 0
                    ? "Try adjusting your filters or search terms"
                    : "Start by searching for a clinic or enabling location services"
                }
              >
                <div className="flex gap-2">
                  {searchState.selectedFilters.length > 0 && (
                    <Button variant="outline" onClick={resetFilters}>
                      Clear Filters
                    </Button>
                  )}
                  {!location && (
                    <Button onClick={handleLocationRequest}>
                      <MapPin className="h-4 w-4 mr-2" />
                      Enable Location
                    </Button>
                  )}
                </div>
              </EmptyState>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}