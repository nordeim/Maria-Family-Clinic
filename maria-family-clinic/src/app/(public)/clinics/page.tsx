'use client'

import * as React from 'react'
import { MapPin, Search, SlidersHorizontal, Loader2, Map as MapIcon, List, Clock, Accessibility as AccessibilityIcon } from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { useDebounce } from '@/hooks/use-debounce'
import {
  getLocationWithFallback,
  formatDistance,
  type LocationCoordinates,
} from '@/lib/utils/geolocation'

// UI Components
import {
  Button,
  Input,
  Card,
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Stack,
  Grid,
  Container,
  Loading,
  EmptyState,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui'
import { ClinicCard } from '@/components/healthcare'
import { ClinicMap, type ClinicMapData } from '@/components/maps/clinic-map'
import { toast } from 'sonner'

interface ClinicSearchFilters {
  search: string
  radiusKm: number
  languages: string[]
  services: string[]
  openNow: boolean
  weekendHours: boolean
  lateNight: boolean
  clinicTypes: string[]
  accessibility: string[]
  rating: number | null
}

export function ClinicSearchPage() {
  // Location state
  const [userLocation, setUserLocation] = React.useState<LocationCoordinates | null>(null)
  const [locationLoading, setLocationLoading] = React.useState(true)
  const [locationError, setLocationError] = React.useState<string | null>(null)

  // Search and filters state
  const [filters, setFilters] = React.useState<ClinicSearchFilters>({
    search: '',
    radiusKm: 5,
    languages: [],
    services: [],
    openNow: false,
    weekendHours: false,
    lateNight: false,
    clinicTypes: [],
    accessibility: [],
    rating: null,
  })

  // Favorites state (stored in localStorage)
  const [favorites, setFavorites] = React.useState<Set<string>>(new Set())

  // Load favorites from localStorage on mount
  React.useEffect(() => {
    const stored = localStorage.getItem('clinic-favorites')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setFavorites(new Set(parsed))
      } catch (e) {
        console.error('Failed to parse favorites:', e)
      }
    }
  }, [])

  // Save favorites to localStorage whenever they change
  const handleToggleFavorite = React.useCallback((clinicId: string, isFavorite: boolean) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (isFavorite) {
        newFavorites.add(clinicId)
      } else {
        newFavorites.delete(clinicId)
      }
      localStorage.setItem('clinic-favorites', JSON.stringify(Array.from(newFavorites)))
      toast.success(isFavorite ? 'Added to favorites' : 'Removed from favorites')
      return newFavorites
    })
  }, [])

  // View mode state
  const [viewMode, setViewMode] = React.useState<'list' | 'map'>('list')

  // Debounced search
  const debouncedSearch = useDebounce(filters.search, 300)

  // Filter drawer state (mobile)
  const [filterDrawerOpen, setFilterDrawerOpen] = React.useState(false)

  // Get user location on mount
  React.useEffect(() => {
    async function getUserLocation() {
      setLocationLoading(true)
      try {
        const result = await getLocationWithFallback()
        setUserLocation(result.coords)
        
        if (result.error) {
          setLocationError(result.error)
          toast.info(result.error)
        } else {
          toast.success('Location detected successfully')
        }
      } catch (error) {
        setLocationError('Unable to determine location')
        toast.error('Unable to determine your location')
      } finally {
        setLocationLoading(false)
      }
    }

    getUserLocation()
  }, [])

  // Search clinics query
  const { data: clinicsData, isLoading: clinicsLoading } = trpc.clinic.getAll.useQuery(
    {
      page: 1,
      limit: 20,
      search: debouncedSearch || undefined,
      location: userLocation
        ? {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            radiusKm: filters.radiusKm,
          }
        : undefined,
      languages: filters.languages.length > 0 ? filters.languages : undefined,
      isActive: true,
      orderBy: userLocation ? 'distance' : 'name',
      orderDirection: 'asc',
    },
    {
      enabled: !!userLocation && !locationLoading,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  )

  const clinics = clinicsData?.data || []

  // Transform clinics data for map
  const clinicsForMap: ClinicMapData[] = React.useMemo(() => {
    return clinics.map((clinic: any) => ({
      id: clinic.id,
      name: clinic.name,
      latitude: clinic.latitude || 0,
      longitude: clinic.longitude || 0,
      type: determineClinicType(clinic.type),
      rating: clinic.rating || 0,
      totalReviews: clinic.totalReviews || 0,
      phoneNumber: clinic.phone,
      services: clinic.services?.map((s: any) => s.name).slice(0, 5) || [],
      address: clinic.address,
      isOpen: checkIfOpen(clinic.operatingHours),
      distance: 'distance' in clinic ? (clinic.distance as number) : undefined,
    }))
  }, [clinics])

  // Loading state
  if (locationLoading) {
    return (
      <Container className="py-12">
        <Loading
          size="lg"
          text="Detecting your location..."
          fullScreen
        />
      </Container>
    )
  }

  return (
    <Container className="py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Find Healthcare Clinics Near You
        </h1>
        <p className="text-muted-foreground">
          Discover trusted healthcare providers in Singapore
        </p>
      </div>

      {/* Search Bar */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col gap-4 sm:flex-row">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by clinic name, area, or postal code..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10"
            />
          </div>

          {/* Radius Select */}
          <div className="w-full sm:w-48">
            <Select
              value={filters.radiusKm.toString()}
              onValueChange={(value) =>
                setFilters({ ...filters, radiusKm: parseFloat(value) })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Within" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Within 1 km</SelectItem>
                <SelectItem value="2">Within 2 km</SelectItem>
                <SelectItem value="5">Within 5 km</SelectItem>
                <SelectItem value="10">Within 10 km</SelectItem>
                <SelectItem value="20">Within 20 km</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filter Button (Mobile) */}
          <Sheet open={filterDrawerOpen} onOpenChange={setFilterDrawerOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="sm:w-auto">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filters
                {(filters.languages.length > 0 || 
                  filters.services.length > 0 || 
                  filters.clinicTypes.length > 0 || 
                  filters.accessibility.length > 0 ||
                  filters.openNow || 
                  filters.weekendHours || 
                  filters.lateNight ||
                  filters.rating) && (
                  <Badge variant="default" className="ml-2">
                    {filters.languages.length + 
                     filters.services.length + 
                     filters.clinicTypes.length + 
                     filters.accessibility.length +
                     (filters.openNow ? 1 : 0) +
                     (filters.weekendHours ? 1 : 0) +
                     (filters.lateNight ? 1 : 0) +
                     (filters.rating ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md overflow-y-auto h-[90vh]">
              <SheetHeader>
                <SheetTitle>Filter Clinics</SheetTitle>
              </SheetHeader>
              <FilterPanel filters={filters} onFiltersChange={setFilters} />
            </SheetContent>
          </Sheet>
        </div>

        {/* Active Filters Display */}
        {(filters.languages.length > 0 || 
          filters.services.length > 0 || 
          filters.clinicTypes.length > 0 ||
          filters.accessibility.length > 0 ||
          filters.openNow || 
          filters.weekendHours || 
          filters.lateNight ||
          filters.rating) && (
          <div className="flex flex-wrap gap-2 mt-4">
            {filters.languages.map((lang) => (
              <Badge key={lang} variant="secondary">
                {lang}
                <button
                  onClick={() =>
                    setFilters({
                      ...filters,
                      languages: filters.languages.filter((l) => l !== lang),
                    })
                  }
                  className="ml-1"
                >
                  ×
                </button>
              </Badge>
            ))}
            {filters.services.map((service) => (
              <Badge key={service} variant="secondary">
                {service}
                <button
                  onClick={() =>
                    setFilters({
                      ...filters,
                      services: filters.services.filter((s) => s !== service),
                    })
                  }
                  className="ml-1"
                >
                  ×
                </button>
              </Badge>
            ))}
            {filters.clinicTypes.map((type) => (
              <Badge key={type} variant="secondary">
                {type}
                <button
                  onClick={() =>
                    setFilters({
                      ...filters,
                      clinicTypes: filters.clinicTypes.filter((t) => t !== type),
                    })
                  }
                  className="ml-1"
                >
                  ×
                </button>
              </Badge>
            ))}
            {filters.accessibility.map((access) => (
              <Badge key={access} variant="secondary">
                {access}
                <button
                  onClick={() =>
                    setFilters({
                      ...filters,
                      accessibility: filters.accessibility.filter((a) => a !== access),
                    })
                  }
                  className="ml-1"
                >
                  ×
                </button>
              </Badge>
            ))}
            {filters.openNow && (
              <Badge variant="secondary">
                Open Now
                <button
                  onClick={() => setFilters({ ...filters, openNow: false })}
                  className="ml-1"
                >
                  ×
                </button>
              </Badge>
            )}
            {filters.weekendHours && (
              <Badge variant="secondary">
                Weekend Hours
                <button
                  onClick={() => setFilters({ ...filters, weekendHours: false })}
                  className="ml-1"
                >
                  ×
                </button>
              </Badge>
            )}
            {filters.lateNight && (
              <Badge variant="secondary">
                Late Night
                <button
                  onClick={() => setFilters({ ...filters, lateNight: false })}
                  className="ml-1"
                >
                  ×
                </button>
              </Badge>
            )}
            {filters.rating && (
              <Badge variant="secondary">
                {filters.rating}+ stars
                <button
                  onClick={() => setFilters({ ...filters, rating: null })}
                  className="ml-1"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        )}
      </Card>

      {/* Location Info */}
      {userLocation && (
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>
            Showing results near your location
            {locationError && ` (${locationError})`}
          </span>
        </div>
      )}

      {/* View Mode Tabs */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'list' | 'map')} className="mb-6">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            List View
          </TabsTrigger>
          <TabsTrigger value="map" className="flex items-center gap-2">
            <MapIcon className="h-4 w-4" />
            Map View
          </TabsTrigger>
        </TabsList>

        {/* List View */}
        <TabsContent value="list" className="mt-6">
          {clinicsLoading ? (
            <div className="grid gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                    <div className="h-4 bg-muted rounded w-full" />
                  </div>
                </Card>
              ))}
            </div>
          ) : clinics.length === 0 ? (
            <EmptyState
              title="No clinics found"
              description="Try adjusting your search criteria or increasing the search radius"
              action={{
                label: 'Clear Filters',
                onClick: () =>
                  setFilters({
                    search: '',
                    radiusKm: 5,
                    languages: [],
                    services: [],
                    openNow: false,
                    weekendHours: false,
                    lateNight: false,
                    clinicTypes: [],
                    accessibility: [],
                    rating: null,
                  }),
              }}
            />
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Found {clinics.length} {clinics.length === 1 ? 'clinic' : 'clinics'}
              </p>
              <Grid cols={1} gap="md" className="md:grid-cols-2">
                {clinics.map((clinic: any) => {
                  const distance = 'distance' in clinic ? clinic.distance as number : null
                  const rating = clinic.rating || undefined
                  const totalReviews = clinic.totalReviews || undefined
                  const doctorCount = clinic.doctors?.length
                  const yearEstablished = clinic.createdAt ? new Date(clinic.createdAt).getFullYear() : undefined

                  return (
                    <ClinicCard
                      key={clinic.id}
                      clinic={{
                        id: clinic.id,
                        name: clinic.name,
                        address: clinic.address,
                        phone: clinic.phone || '',
                        hours: formatOperatingHours(clinic.operatingHours),
                        ...(rating && { rating }),
                        ...(totalReviews && { totalReviews }),
                        ...(distance && { distance: formatDistance(distance) }),
                        specialties: clinic.services?.map((s: any) => s.name) || [],
                        isOpen: checkIfOpen(clinic.operatingHours),
                        waitTime: '15-30 min',
                        ...(doctorCount && { doctorCount }),
                        ...(yearEstablished && { established: yearEstablished }),
                        isMOHVerified: true,
                        hasParking: true,
                        isWheelchairAccessible: true,
                        acceptsInsurance: true,
                      }}
                      isFavorite={favorites.has(clinic.id)}
                      onToggleFavorite={handleToggleFavorite}
                      onBookAppointment={(id) => {
                        // Navigate to booking page
                        window.location.href = `/booking/${id}`
                      }}
                      onGetDirections={() => {
                        if (userLocation && clinic.latitude && clinic.longitude) {
                          const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${clinic.latitude},${clinic.longitude}`
                          window.open(url, '_blank')
                        }
                      }}
                    />
                  )
                })}
              </Grid>
            </div>
          )}
        </TabsContent>

        {/* Map View */}
        <TabsContent value="map" className="mt-6">
          {clinicsLoading ? (
            <Card className="p-6 h-[600px] flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-2" />
                <p className="text-sm text-muted-foreground">Loading map...</p>
              </div>
            </Card>
          ) : clinics.length === 0 ? (
            <EmptyState
              title="No clinics to display on map"
              description="Try adjusting your search criteria or increasing the search radius"
              action={{
                label: 'Clear Filters',
                onClick: () =>
                  setFilters({
                    search: '',
                    radiusKm: 5,
                    languages: [],
                    services: [],
                    openNow: false,
                    weekendHours: false,
                    lateNight: false,
                    clinicTypes: [],
                    accessibility: [],
                    rating: null,
                  }),
              }}
            />
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Showing {clinics.length} {clinics.length === 1 ? 'clinic' : 'clinics'} on map
              </p>
              <ClinicMap
                clinics={clinicsForMap}
                userLocation={userLocation}
                onClinicSelect={(clinicId) => {
                  // Could add sidebar or details panel
                  console.log('Selected clinic:', clinicId)
                }}
                onBoundsChange={(bounds) => {
                  // Could trigger search for clinics in visible area
                  console.log('Map bounds changed:', bounds)
                }}
                height="600px"
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Container>
  )
}

// Filter Panel Component
function FilterPanel({
  filters,
  onFiltersChange,
}: {
  filters: ClinicSearchFilters
  onFiltersChange: (filters: ClinicSearchFilters) => void
}) {
  const languages = [
    'English',
    'Mandarin',
    'Malay',
    'Tamil',
    'Hokkien',
    'Cantonese',
    'Teochew',
  ]

  const services = [
    'General Practice',
    'Specialist Consultation',
    'Vaccinations',
    'Health Screening',
    'Chronic Disease Management',
    'Emergency Care',
    'Mental Health',
    'Women\'s Health',
  ]

  const clinicTypes = [
    'Polyclinic',
    'Private Clinic',
    'Hospital-linked',
    'Government Clinic',
  ]

  const accessibilityFeatures = [
    'Wheelchair Access',
    'Hearing Loop',
    'Parking Available',
    'Lift Access',
  ]

  return (
    <Stack direction="vertical" spacing="lg" className="mt-6">
      {/* Services */}
      <div>
        <h3 className="text-sm font-medium mb-3">Services</h3>
        <div className="flex flex-wrap gap-2">
          {services.map((service) => (
            <Button
              key={service}
              variant={filters.services.includes(service) ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                const newServices = filters.services.includes(service)
                  ? filters.services.filter((s) => s !== service)
                  : [...filters.services, service]
                onFiltersChange({ ...filters, services: newServices })
              }}
            >
              {service}
            </Button>
          ))}
        </div>
      </div>

      {/* Operating Hours */}
      <div>
        <h3 className="text-sm font-medium mb-3">Operating Hours</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filters.openNow ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFiltersChange({ ...filters, openNow: !filters.openNow })}
          >
            <Clock className="mr-2 h-4 w-4" />
            Open Now
          </Button>
          <Button
            variant={filters.weekendHours ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFiltersChange({ ...filters, weekendHours: !filters.weekendHours })}
          >
            Weekend Hours
          </Button>
          <Button
            variant={filters.lateNight ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFiltersChange({ ...filters, lateNight: !filters.lateNight })}
          >
            Late Night (8PM+)
          </Button>
        </div>
      </div>

      {/* Clinic Type */}
      <div>
        <h3 className="text-sm font-medium mb-3">Clinic Type</h3>
        <div className="flex flex-wrap gap-2">
          {clinicTypes.map((type) => (
            <Button
              key={type}
              variant={filters.clinicTypes.includes(type) ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                const newTypes = filters.clinicTypes.includes(type)
                  ? filters.clinicTypes.filter((t) => t !== type)
                  : [...filters.clinicTypes, type]
                onFiltersChange({ ...filters, clinicTypes: newTypes })
              }}
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      {/* Accessibility */}
      <div>
        <h3 className="text-sm font-medium mb-3">Accessibility</h3>
        <div className="flex flex-wrap gap-2">
          {accessibilityFeatures.map((feature) => (
            <Button
              key={feature}
              variant={filters.accessibility.includes(feature) ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                const newAccessibility = filters.accessibility.includes(feature)
                  ? filters.accessibility.filter((a) => a !== feature)
                  : [...filters.accessibility, feature]
                onFiltersChange({ ...filters, accessibility: newAccessibility })
              }}
            >
              <AccessibilityIcon className="mr-2 h-3 w-3" />
              {feature}
            </Button>
          ))}
        </div>
      </div>

      {/* Languages */}
      <div>
        <h3 className="text-sm font-medium mb-3">Languages</h3>
        <div className="flex flex-wrap gap-2">
          {languages.map((lang) => (
            <Button
              key={lang}
              variant={filters.languages.includes(lang) ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                const newLanguages = filters.languages.includes(lang)
                  ? filters.languages.filter((l) => l !== lang)
                  : [...filters.languages, lang]
                onFiltersChange({ ...filters, languages: newLanguages })
              }}
            >
              {lang}
            </Button>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <h3 className="text-sm font-medium mb-3">Minimum Rating</h3>
        <div className="flex gap-2">
          {[4, 4.5, 5].map((rating) => (
            <Button
              key={rating}
              variant={filters.rating === rating ? 'default' : 'outline'}
              size="sm"
              onClick={() =>
                onFiltersChange({
                  ...filters,
                  rating: filters.rating === rating ? null : rating,
                })
              }
            >
              {rating}+ stars
            </Button>
          ))}
        </div>
      </div>

      {/* Clear All */}
      <Button
        variant="outline"
        onClick={() =>
          onFiltersChange({
            search: filters.search,
            radiusKm: filters.radiusKm,
            languages: [],
            services: [],
            openNow: false,
            weekendHours: false,
            lateNight: false,
            clinicTypes: [],
            accessibility: [],
            rating: null,
          })
        }
      >
        Clear All Filters
      </Button>
    </Stack>
  )
}

// Utility function to format operating hours
function formatOperatingHours(hours: any): string {
  if (!hours || typeof hours !== 'object') {
    return 'Hours not available'
  }

  // Simple format for now - can be enhanced
  return 'Mon-Fri: 8AM-6PM' // Placeholder
}

// Utility function to determine clinic type
function determineClinicType(type: string | undefined): ClinicMapData['type'] {
  if (!type) return 'PRIVATE'
  
  const upperType = type.toUpperCase()
  if (upperType.includes('POLYCLINIC')) return 'POLYCLINIC'
  if (upperType.includes('HOSPITAL')) return 'HOSPITAL'
  if (upperType.includes('SPECIALIST')) return 'SPECIALIST'
  if (upperType.includes('DENTAL')) return 'DENTAL'
  
  return 'PRIVATE'
}

// Utility function to check if clinic is currently open
function checkIfOpen(_hours: any): boolean {
  // Simple implementation - can be enhanced with actual time checking
  // For now, return true by default
  return true
}

// Default export
export default ClinicSearchPage
