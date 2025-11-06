'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Filter, 
  X, 
  MapPin, 
  Search, 
  SlidersHorizontal,
  ChevronUp,
  ChevronDown,
  Star,
  Clock,
  Activity,
  Heart,
  Users,
  Brain,
  Shield
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { 
  SearchFilters, 
  ClinicSearchResult, 
  MedicalSpecialty,
  ServiceType,
  UrgencyLevel,
  ServiceDuration,
  ComplexityLevel,
  PatientType,
  InsuranceType
} from '@/types/search'
import { AdvancedServiceFilters } from './advanced-service-filters'
import { ServiceFilterChips } from './service-filter-chips'

interface MobileServiceSearchProps {
  onSearch: (query: string, filters: SearchFilters) => void
  results: ClinicSearchResult[]
  isLoading: boolean
  className?: string
}

// Mobile-optimized service search with bottom sheet filters
export function MobileServiceSearch({
  onSearch,
  results = [],
  isLoading = false,
  className
}: MobileServiceSearchProps) {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<SearchFilters>({})
  const [showFilters, setShowFilters] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [sortBy, setSortBy] = useState<'relevance' | 'distance' | 'rating'>('relevance')

  // Quick filter options for mobile
  const QUICK_FILTERS = {
    urgent: [
      { id: 'emergency', label: 'Emergency', icon: <Shield className="w-4 h-4" />, color: 'red' },
      { id: 'urgent', label: 'Urgent (24h)', icon: <Clock className="w-4 h-4" />, color: 'orange' }
    ],
    patientType: [
      { id: 'pediatric', label: 'Children', icon: <Users className="w-4 h-4" />, color: 'blue' },
      { id: 'womens_health', label: 'Women', icon: <Heart className="w-4 h-4" />, color: 'pink' },
      { id: 'mental_health', label: 'Mental Health', icon: <Brain className="w-4 h-4" />, color: 'purple' }
    ],
    specialty: [
      { id: 'cardiology', label: 'Heart', icon: <Heart className="w-4 h-4" />, color: 'red' },
      { id: 'dermatology', label: 'Skin', icon: <Activity className="w-4 h-4" />, color: 'green' },
      { id: 'neurology', label: 'Brain', icon: <Brain className="w-4 h-4" />, color: 'blue' }
    ]
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.services?.length) count += filters.services.length
    if (filters.serviceTypes?.length) count += filters.serviceTypes.length
    if (filters.urgency?.length) count += filters.urgency.length
    if (filters.duration?.length) count += filters.duration.length
    if (filters.complexity?.length) count += filters.complexity.length
    if (filters.patientTypes?.length) count += filters.patientTypes.length
    if (filters.insurance?.length) count += filters.insurance.length
    return count
  }

  const activeFilterCount = getActiveFilterCount()

  const handleQuickFilter = (type: string, id: string) => {
    const updatedFilters = { ...filters }
    
    switch (type) {
      case 'urgent':
        updatedFilters.urgency = [id as UrgencyLevel]
        break
      case 'patientType':
        updatedFilters.patientTypes = [id as PatientType]
        break
      case 'specialty':
        updatedFilters.services = [id as MedicalSpecialty]
        break
    }
    
    setFilters(updatedFilters)
    if (query) {
      onSearch(query, updatedFilters)
    }
  }

  const clearAllFilters = () => {
    setFilters({})
    if (query) {
      onSearch(query, {})
    }
  }

  const handleLocationSearch = () => {
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
            onSearch(query, newFilters)
          }
        },
        (error) => {
          console.error('Error getting location:', error)
        }
      )
    }
  }

  const removeFilter = (filterType: string, value: string) => {
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
      case 'patientType':
        updatedFilters.patientTypes = (updatedFilters.patientTypes || []).filter(p => p !== value)
        break
    }

    setFilters(updatedFilters)
    if (query) {
      onSearch(query, updatedFilters)
    }
  }

  return (
    <div className={cn("min-h-screen bg-gray-50", className)}>
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 p-4">
        <div className="space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search medical services..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onSearch(query, filters)
                  setShowResults(true)
                }
              }}
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              onClick={handleLocationSearch}
            >
              <MapPin className="w-4 h-4" />
            </Button>
          </div>

          {/* Quick Filters */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">Quick Filters</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(true)}
                className="text-xs"
              >
                <SlidersHorizontal className="w-4 h-4 mr-1" />
                All Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </div>

            <div className="flex space-x-2 overflow-x-auto pb-2">
              {/* Urgency Filters */}
              <div className="flex-shrink-0">
                <div className="text-xs text-gray-600 mb-1">Urgency</div>
                <div className="flex space-x-1">
                  {QUICK_FILTERS.urgent.map((filter) => (
                    <Button
                      key={filter.id}
                      variant={filters.urgency?.includes(filter.id as UrgencyLevel) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleQuickFilter('urgent', filter.id)}
                      className="text-xs h-auto py-1 px-2"
                    >
                      {filter.icon}
                      <span className="ml-1">{filter.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Patient Type Filters */}
              <div className="flex-shrink-0">
                <div className="text-xs text-gray-600 mb-1">Patient Type</div>
                <div className="flex space-x-1">
                  {QUICK_FILTERS.patientType.map((filter) => (
                    <Button
                      key={filter.id}
                      variant={filters.patientTypes?.includes(filter.id as PatientType) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleQuickFilter('patientType', filter.id)}
                      className="text-xs h-auto py-1 px-2"
                    >
                      {filter.icon}
                      <span className="ml-1">{filter.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Specialty Filters */}
              <div className="flex-shrink-0">
                <div className="text-xs text-gray-600 mb-1">Specialty</div>
                <div className="flex space-x-1">
                  {QUICK_FILTERS.specialty.map((filter) => (
                    <Button
                      key={filter.id}
                      variant={filters.services?.includes(filter.id as MedicalSpecialty) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleQuickFilter('specialty', filter.id)}
                      className="text-xs h-auto py-1 px-2"
                    >
                      {filter.icon}
                      <span className="ml-1">{filter.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="px-4 py-2 bg-white border-b border-gray-200">
          <ServiceFilterChips
            filters={filters}
            onFilterRemove={removeFilter}
            onClearAll={clearAllFilters}
          />
        </div>
      )}

      {/* Search Results */}
      <div className="flex-1 p-4">
        {showResults || results.length > 0 ? (
          <div className="space-y-4">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Results ({results.length})
              </h2>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Sort:</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const options = ['relevance', 'distance', 'rating'] as const
                    const currentIndex = options.indexOf(sortBy)
                    const nextIndex = (currentIndex + 1) % options.length
                    setSortBy(options[nextIndex])
                  }}
                  className="text-xs"
                >
                  {sortBy}
                  <ChevronUp className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>

            {/* Results List */}
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {results.map((result) => (
                  <Card key={result.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg leading-tight">
                              {result.name}
                            </h3>
                            <p className="text-gray-600 text-sm">
                              {result.address}
                            </p>
                          </div>
                          
                          {result.rating && (
                            <div className="flex items-center space-x-1 text-sm">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span className="font-medium">{result.rating}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-4 text-gray-500">
                            {result.distance && (
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-4 h-4" />
                                <span>{result.distance.toFixed(1)} km</span>
                              </div>
                            )}
                            
                            {result.isOpen !== undefined && (
                              <div className={cn(
                                "flex items-center space-x-1",
                                result.isOpen ? "text-green-600" : "text-red-600"
                              )}>
                                <Clock className="w-4 h-4" />
                                <span>{result.isOpen ? 'Open' : 'Closed'}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Specialties/Services */}
                        {(result.specialties || result.services) && (
                          <div className="flex flex-wrap gap-1">
                            {(result.specialties || result.services)?.slice(0, 2).map((item, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {item}
                              </Badge>
                            ))}
                            {(result.specialties?.length || result.services?.length || 0) > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{(result.specialties?.length || result.services?.length || 0) - 2} more
                              </Badge>
                            )}
                          </div>
                        )}

                        <Button className="w-full" size="sm">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">Search for Medical Services</h3>
            <p className="text-sm mb-4">
              Find specialists, services, and clinics near you
            </p>
            <Button
              onClick={() => setShowFilters(true)}
              variant="outline"
            >
              <Filter className="w-4 h-4 mr-2" />
              Browse All Filters
            </Button>
          </div>
        )}
      </div>

      {/* Bottom Sheet Filters */}
      <Sheet open={showFilters} onOpenChange={setShowFilters}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-lg">
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between">
              <span>Service Filters</span>
              <div className="flex items-center space-x-2">
                {activeFilterCount > 0 && (
                  <Badge variant="secondary">
                    {activeFilterCount} active
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear All
                </Button>
              </div>
            </SheetTitle>
            <SheetDescription>
              Refine your search with detailed filters
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 h-full overflow-y-auto pb-20">
            <AdvancedServiceFilters
              filters={filters}
              onFiltersChange={(newFilters) => {
                setFilters(newFilters)
                if (query) {
                  onSearch(query, newFilters)
                }
              }}
              onClearFilters={clearAllFilters}
              className="border-none shadow-none"
            />
          </div>

          {/* Fixed Bottom Actions */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowFilters(false)
                  setShowResults(true)
                  if (query) {
                    onSearch(query, filters)
                  }
                }}
                className="flex-1"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}