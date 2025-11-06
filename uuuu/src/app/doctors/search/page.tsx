'use client'

import * as React from 'react'
import { 
  Search, 
  SlidersHorizontal, 
  MapPin, 
  Star, 
  Clock, 
  Calendar,
  Loader2,
  Mic,
  Filter,
  List,
  Grid,
  Users,
  Award,
  Phone,
  Heart,
  Accessibility as AccessibilityIcon,
  Navigation
} from 'lucide-react'
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
  Grid as UIGrid,
  Container,
  Loading,
  EmptyState,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Checkbox,
  RadioGroup,
  RadioGroupItem,
  Label,
} from '@/components/ui'
import { DoctorCard } from '@/components/healthcare/enhanced-doctor-card'
import { DoctorSearchAutocomplete } from '@/components/search/doctor-search-autocomplete'
import { DoctorSearchFilters } from '@/components/search/doctor-search-filters'
import { DoctorRankingAlgorithm } from '@/components/search/doctor-ranking-algorithm'
import { SearchAnalytics } from '@/components/search/search-analytics'
import { toast } from 'sonner'

interface DoctorSearchFilters {
  // Text search
  search: string
  specialty: string[]
  subSpecialty: string[]
  conditionsTreated: string[]
  
  // Location
  radiusKm: number
  location: string
  
  // Language and Communication
  languages: string[]
  languageProficiency: string[]
  
  // Availability
  availabilityDate: string
  timeSlots: string[]
  nextAvailable: boolean
  
  // Experience and Qualifications
  experienceYears: {
    min: number
    max: number
  }
  qualifications: string[]
  certifications: string[]
  
  // Demographics
  gender: string
  
  // Clinic Details
  clinicTypes: string[]
  clinicRatings: number
  clinicAffiliations: string[]
  
  // Services
  services: string[]
  acceptsInsurance: boolean
  insuranceTypes: string[]
  
  // Accessibility
  accessibility: string[]
  
  // Sorting
  sortBy: 'relevance' | 'distance' | 'rating' | 'experience' | 'availability'
  sortDirection: 'asc' | 'desc'
}

interface DoctorSearchResults {
  id: string
  name: string
  specialties: string[]
  languages: string[]
  experience: number
  rating: number
  reviewCount: number
  clinicAffiliations: Array<{
    id: string
    name: string
    address: string
    distance?: number
    rating?: number
    nextAvailable?: string
    clinicType?: string
    isPrimary?: boolean
  }>
  qualifications: string[]
  certifications: string[]
  imageUrl?: string
  conditionsTreated: string[]
  services: string[]
  acceptsInsurance: boolean
  isMOHVerified: boolean
  yearsOfPractice: number
  gender: 'MALE' | 'FEMALE'
  consultationFee?: number
  currency?: string
  nextAvailableDate?: string
  availabilityScore?: number
  patientRecommendations?: number
  hasVideoConsultation?: boolean
}

export function DoctorSearchPage() {
  // Location state
  const [userLocation, setUserLocation] = React.useState<LocationCoordinates | null>(null)
  const [locationLoading, setLocationLoading] = React.useState(true)
  const [locationError, setLocationError] = React.useState<string | null>(null)

  // Search and filters state
  const [filters, setFilters] = React.useState<DoctorSearchFilters>({
    search: '',
    specialty: [],
    subSpecialty: [],
    conditionsTreated: [],
    radiusKm: 10,
    location: '',
    languages: [],
    languageProficiency: [],
    availabilityDate: '',
    timeSlots: [],
    nextAvailable: false,
    experienceYears: {
      min: 0,
      max: 50
    },
    qualifications: [],
    certifications: [],
    gender: '',
    clinicTypes: [],
    clinicRatings: 0,
    clinicAffiliations: [],
    services: [],
    acceptsInsurance: false,
    insuranceTypes: [],
    accessibility: [],
    sortBy: 'relevance',
    sortDirection: 'desc',
  })

  // Favorites state (stored in localStorage)
  const [favorites, setFavorites] = React.useState<Set<string>>(new Set())

  // Search history state
  const [searchHistory, setSearchHistory] = React.useState<string[]>([])

  // View state
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = React.useState(false)

  // Load favorites and search history from localStorage
  React.useEffect(() => {
    const storedFavorites = localStorage.getItem('doctor-favorites')
    if (storedFavorites) {
      try {
        const parsed = JSON.parse(storedFavorites)
        setFavorites(new Set(parsed))
      } catch (e) {
        console.error('Failed to parse favorites:', e)
      }
    }

    const storedHistory = localStorage.getItem('doctor-search-history')
    if (storedHistory) {
      try {
        const parsed = JSON.parse(storedHistory)
        setSearchHistory(parsed)
      } catch (e) {
        console.error('Failed to parse search history:', e)
      }
    }
  }, [])

  // Save favorites to localStorage
  const handleToggleFavorite = React.useCallback((doctorId: string, isFavorite: boolean) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (isFavorite) {
        newFavorites.add(doctorId)
      } else {
        newFavorites.delete(doctorId)
      }
      localStorage.setItem('doctor-favorites', JSON.stringify(Array.from(newFavorites)))
      toast.success(isFavorite ? 'Added to favorites' : 'Removed from favorites')
      return newFavorites
    })
  }, [])

  // Save search to history
  const addToSearchHistory = React.useCallback((searchTerm: string) => {
    if (!searchTerm.trim()) return
    
    setSearchHistory(prev => {
      const newHistory = [searchTerm, ...prev.filter(term => term !== searchTerm)].slice(0, 10)
      localStorage.setItem('doctor-search-history', JSON.stringify(newHistory))
      return newHistory
    })
  }, [])

  // Debounced search
  const debouncedSearch = useDebounce(filters.search, 300)

  // Get user location
  React.useEffect(() => {
    async function getUserLocation() {
      setLocationLoading(true)
      try {
        const result = await getLocationWithFallback()
        setUserLocation(result.coords)
        
        if (result.error) {
          setLocationError(result.error)
        }
      } catch (error) {
        setLocationError('Unable to determine location')
      } finally {
        setLocationLoading(false)
      }
    }

    getUserLocation()
  }, [])

  // Mock data for demonstration - replace with actual API call
  const mockDoctors: DoctorSearchResults[] = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      specialties: ['Cardiology', 'Internal Medicine'],
      languages: ['English', 'Mandarin'],
      experience: 15,
      rating: 4.8,
      reviewCount: 156,
      clinicAffiliations: [
        {
          id: 'c1',
          name: 'Heart Care Medical Centre',
          address: '123 Orchard Road, Singapore 238858',
          distance: 0.5,
          rating: 4.7,
          nextAvailable: 'Tomorrow 2:00 PM',
          clinicType: 'Private Clinic',
          isPrimary: true
        }
      ],
      qualifications: ['MBBS', 'MRCP', 'Cardiology Fellowship'],
      certifications: ['American Board of Cardiology', 'European Society of Cardiology'],
      conditionsTreated: ['Heart Failure', 'Coronary Artery Disease', 'Hypertension'],
      services: ['Echocardiogram', 'Cardiac Catheterization', 'Stress Testing'],
      acceptsInsurance: true,
      isMOHVerified: true,
      yearsOfPractice: 15,
      gender: 'FEMALE',
      consultationFee: 150,
      currency: 'SGD',
      nextAvailableDate: '2024-11-06T14:00:00Z',
      availabilityScore: 85,
      patientRecommendations: 94,
      hasVideoConsultation: true
    },
    {
      id: '2',
      name: 'Dr. Michael Chen',
      specialties: ['Neurology'],
      languages: ['English', 'Mandarin', 'Cantonese'],
      experience: 12,
      rating: 4.9,
      reviewCount: 89,
      clinicAffiliations: [
        {
          id: 'c2',
          name: 'Neurological Institute Singapore',
          address: '456 Mount Elizabeth Road, Singapore 228510',
          distance: 1.2,
          rating: 4.9,
          nextAvailable: 'Today 4:30 PM',
          clinicType: 'Specialist Centre',
          isPrimary: true
        }
      ],
      qualifications: ['MBBS', 'MRCP', 'Neurology Residency'],
      certifications: ['Board Certified Neurologist'],
      conditionsTreated: ['Stroke', 'Epilepsy', 'Parkinson\'s Disease'],
      services: ['EEG', 'MRI Interpretation', 'Neurological Consultation'],
      acceptsInsurance: true,
      isMOHVerified: true,
      yearsOfPractice: 12,
      gender: 'MALE',
      consultationFee: 180,
      currency: 'SGD',
      nextAvailableDate: '2024-11-04T16:30:00Z',
      availabilityScore: 95,
      patientRecommendations: 98,
      hasVideoConsultation: false
    }
  ]

  // Filtered results based on search criteria
  const filteredDoctors = React.useMemo(() => {
    let results = mockDoctors

    // Text search filter
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase()
      results = results.filter(doctor => 
        doctor.name.toLowerCase().includes(searchLower) ||
        doctor.specialties.some(s => s.toLowerCase().includes(searchLower)) ||
        doctor.conditionsTreated.some(c => c.toLowerCase().includes(searchLower)) ||
        doctor.services.some(s => s.toLowerCase().includes(searchLower))
      )
      addToSearchHistory(debouncedSearch)
    }

    // Specialty filter
    if (filters.specialty.length > 0) {
      results = results.filter(doctor => 
        doctor.specialties.some(s => filters.specialty.includes(s))
      )
    }

    // Language filter
    if (filters.languages.length > 0) {
      results = results.filter(doctor => 
        filters.languages.every(lang => doctor.languages.includes(lang))
      )
    }

    // Experience filter
    results = results.filter(doctor => 
      doctor.experience >= filters.experienceYears.min &&
      doctor.experience <= filters.experienceYears.max
    )

    // Gender filter
    if (filters.gender) {
      results = results.filter(doctor => doctor.gender === filters.gender)
    }

    // Insurance filter
    if (filters.acceptsInsurance) {
      results = results.filter(doctor => doctor.acceptsInsurance)
    }

    // Sorting
    results.sort((a, b) => {
      let comparison = 0
      switch (filters.sortBy) {
        case 'rating':
          comparison = a.rating - b.rating
          break
        case 'experience':
          comparison = a.experience - b.experience
          break
        case 'distance':
          const aDistance = a.clinics[0]?.distance ?? Infinity
          const bDistance = b.clinics[0]?.distance ?? Infinity
          comparison = aDistance - bDistance
          break
        case 'availability':
          // Simplified - sort by whether doctor has availability
          comparison = a.clinics[0]?.nextAvailable ? -1 : 1
          break
        default:
          // relevance - keep original order
          comparison = 0
      }
      
      return filters.sortDirection === 'desc' ? -comparison : comparison
    })

    return results
  }, [debouncedSearch, filters, mockDoctors, addToSearchHistory])

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
          Find Expert Doctors Near You
        </h1>
        <p className="text-muted-foreground">
          Connect with qualified healthcare professionals in Singapore
        </p>
      </div>

      {/* Advanced Search Bar */}
      <Card className="p-6 mb-6">
        <div className="space-y-4">
          {/* Main Search Input */}
          <DoctorSearchAutocomplete
            value={filters.search}
            onChange={(value) => setFilters(prev => ({ ...prev, search: value }))}
            onSelect={(suggestion) => {
              setFilters(prev => ({ ...prev, search: suggestion.text }))
              addToSearchHistory(suggestion.text)
            }}
            placeholder="Search by doctor name, specialty, condition, or service..."
            recentSearches={searchHistory}
            popularSearches={[
              'Dr. Sarah Johnson',
              'Cardiology consultation',
              'Skin specialist',
              'Chest pain',
              'Pediatrician',
              'Mental health therapy',
              'Eye doctor',
              'Heart specialist',
              'Back pain treatment'
            ]}
            searchContext="doctors"
            showVoiceSearch={true}
            enableFuzzySearch={true}
            className="w-full"
          />

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-3 pt-4 border-t">
            {/* Location Search */}
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter location..."
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                className="w-40"
              />
            </div>

            {/* Radius Selector */}
            <Select
              value={filters.radiusKm.toString()}
              onValueChange={(value) => 
                setFilters(prev => ({ ...prev, radiusKm: parseInt(value) }))
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Radius" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">Within 5km</SelectItem>
                <SelectItem value="10">Within 10km</SelectItem>
                <SelectItem value="20">Within 20km</SelectItem>
                <SelectItem value="50">Within 50km</SelectItem>
              </SelectContent>
            </Select>

            {/* Availability Toggle */}
            <Button
              variant={filters.nextAvailable ? "default" : "outline"}
              size="sm"
              onClick={() => setFilters(prev => ({ ...prev, nextAvailable: !prev.nextAvailable }))}
            >
              <Clock className="mr-2 h-4 w-4" />
              Next Available
            </Button>

            {/* Advanced Filters Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
              {(filters.specialty.length + 
                filters.languages.length + 
                filters.conditionsTreated.length +
                (filters.gender ? 1 : 0) +
                (filters.acceptsInsurance ? 1 : 0)) > 0 && (
                <Badge variant="default" className="ml-2">
                  {filters.specialty.length + 
                   filters.languages.length + 
                   filters.conditionsTreated.length +
                   (filters.gender ? 1 : 0) +
                   (filters.acceptsInsurance ? 1 : 0)}
                </Badge>
              )}
            </Button>

            {/* View Mode Toggle */}
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="border-t pt-4">
              <DoctorSearchFilters
                filters={filters}
                onFiltersChange={setFilters}
              />
            </div>
          )}

          {/* Active Filters Display */}
          {(filters.specialty.length > 0 || 
            filters.languages.length > 0 || 
            filters.conditionsTreated.length > 0 ||
            filters.gender ||
            filters.acceptsInsurance ||
            filters.nextAvailable) && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Active Filters:</p>
              <div className="flex flex-wrap gap-2">
                {filters.specialty.map((specialty) => (
                  <Badge key={specialty} variant="secondary">
                    {specialty}
                    <button
                      onClick={() => setFilters(prev => ({
                        ...prev,
                        specialty: prev.specialty.filter(s => s !== specialty)
                      }))}
                      className="ml-2 hover:text-red-500"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
                {filters.languages.map((language) => (
                  <Badge key={language} variant="secondary">
                    {language}
                    <button
                      onClick={() => setFilters(prev => ({
                        ...prev,
                        languages: prev.languages.filter(l => l !== language)
                      }))}
                      className="ml-2 hover:text-red-500"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
                {filters.conditionsTreated.map((condition) => (
                  <Badge key={condition} variant="secondary">
                    {condition}
                    <button
                      onClick={() => setFilters(prev => ({
                        ...prev,
                        conditionsTreated: prev.conditionsTreated.filter(c => c !== condition)
                      }))}
                      className="ml-2 hover:text-red-500"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
                {filters.gender && (
                  <Badge variant="secondary">
                    {filters.gender === 'MALE' ? 'Male Doctor' : 'Female Doctor'}
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, gender: '' }))}
                      className="ml-2 hover:text-red-500"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {filters.acceptsInsurance && (
                  <Badge variant="secondary">
                    Accepts Insurance
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, acceptsInsurance: false }))}
                      className="ml-2 hover:text-red-500"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {filters.nextAvailable && (
                  <Badge variant="secondary">
                    Next Available
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, nextAvailable: false }))}
                      className="ml-2 hover:text-red-500"
                    >
                      ×
                    </button>
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters({
                  search: filters.search,
                  specialty: [],
                  subSpecialty: [],
                  conditionsTreated: [],
                  radiusKm: 10,
                  location: filters.location,
                  languages: [],
                  languageProficiency: [],
                  availabilityDate: '',
                  timeSlots: [],
                  nextAvailable: false,
                  experienceYears: { min: 0, max: 50 },
                  qualifications: [],
                  certifications: [],
                  gender: '',
                  clinicTypes: [],
                  clinicRatings: 0,
                  clinicAffiliations: [],
                  services: [],
                  acceptsInsurance: false,
                  insuranceTypes: [],
                  accessibility: [],
                  sortBy: 'relevance',
                  sortDirection: 'desc',
                })}
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Location Info */}
      {userLocation && (
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>
            Showing results {filters.location ? `near ${filters.location}` : 'near your location'}
            {locationError && ` (${locationError})`}
          </span>
        </div>
      )}

      {/* Results Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <p className="text-lg font-medium">
            Found {filteredDoctors.length} {filteredDoctors.length === 1 ? 'doctor' : 'doctors'}
          </p>
          {filters.search && (
            <p className="text-sm text-muted-foreground">
              for "{filters.search}"
            </p>
          )}
        </div>
        
        {/* Sort Options */}
        <div className="flex items-center gap-2">
          <Label htmlFor="sort-by" className="text-sm font-medium">
            Sort by:
          </Label>
          <Select
            value={filters.sortBy}
            onValueChange={(value: any) => 
              setFilters(prev => ({ ...prev, sortBy: value }))
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="distance">Distance</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="experience">Experience</SelectItem>
              <SelectItem value="availability">Availability</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilters(prev => ({ 
              ...prev, 
              sortDirection: prev.sortDirection === 'asc' ? 'desc' : 'asc' 
            }))}
          >
            {filters.sortDirection === 'asc' ? '↑' : '↓'}
          </Button>
        </div>
      </div>

      {/* Search Results */}
      {filteredDoctors.length === 0 ? (
        <EmptyState
          title="No doctors found"
          description="Try adjusting your search criteria or filters"
          action={{
            label: 'Clear All Filters',
            onClick: () => setFilters(prev => ({
              ...prev,
              specialty: [],
              languages: [],
              conditionsTreated: [],
              gender: '',
              acceptsInsurance: false,
              nextAvailable: false,
            }))
          }}
        />
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredDoctors.map((doctor) => (
            <DoctorCard
              key={doctor.id}
              doctor={{
                id: doctor.id,
                name: doctor.name,
                specialties: doctor.specialties,
                qualifications: doctor.qualifications,
                experience: `${doctor.experience} years`,
                experienceYears: doctor.yearsOfPractice,
                rating: doctor.rating,
                reviewCount: doctor.reviewCount,
                availableSlots: doctor.clinicAffiliations[0]?.nextAvailable ? [doctor.clinicAffiliations[0].nextAvailable] : undefined,
                clinics: doctor.clinicAffiliations.map(c => c.name),
                clinicAffiliations: doctor.clinicAffiliations,
                image: doctor.imageUrl,
                languages: doctor.languages,
                certifications: doctor.certifications,
                conditionsTreated: doctor.conditionsTreated,
                services: doctor.services,
                acceptsInsurance: doctor.acceptsInsurance,
                isMOHVerified: doctor.isMOHVerified,
                gender: doctor.gender,
                consultationFee: doctor.consultationFee,
                currency: doctor.currency,
                nextAvailableDate: doctor.nextAvailableDate,
                availabilityScore: doctor.availabilityScore,
                patientRecommendations: doctor.patientRecommendations,
                hasVideoConsultation: doctor.hasVideoConsultation,
              }}
              onBookAppointment={(doctorId, clinicId) => {
                const clinicName = doctor.clinicAffiliations.find(c => c.id === clinicId)?.name || 'clinic'
                toast.success(`Booking appointment with ${doctor.name} at ${clinicName}`)
              }}
              onViewProfile={(doctorId) => {
                toast.success(`Viewing profile for ${doctor.name}`)
              }}
              onCallDoctor={(doctorId) => {
                toast.success(`Calling ${doctor.name}`)
              }}
              onGetDirections={(doctorId, clinicId) => {
                const clinic = doctor.clinicAffiliations.find(c => c.id === clinicId) || doctor.clinicAffiliations[0]
                if (clinic) {
                  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinic.name + ' ' + clinic.address)}`
                  window.open(url, '_blank')
                }
              }}
              onSendMessage={(doctorId) => {
                toast.success(`Messaging ${doctor.name}`)
              }}
              onVideoConsultation={(doctorId) => {
                if (doctor.hasVideoConsultation) {
                  toast.success(`Starting video consultation with ${doctor.name}`)
                } else {
                  toast.info(`${doctor.name} does not offer video consultations`)
                }
              }}
              onToggleFavorite={handleToggleFavorite}
              isFavorite={favorites.has(doctor.id)}
              variant={viewMode === 'list' ? 'list' : 'grid'}
              showFullDetails={viewMode === 'grid'}
              showClinicDetails={true}
            />
          ))}
        </div>
      )}

      {/* Search Analytics Section */}
      {filters.search && (
        <div className="mt-12 border-t pt-8">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Search Analytics</h3>
            <p className="text-sm text-muted-foreground">
              Performance and insights for your search
            </p>
          </div>
          <SearchAnalytics
            searchQuery={filters.search}
            resultCount={filteredDoctors.length}
            responseTimeMs={Math.floor(Math.random() * 200) + 50} // Mock response time
            clickedResults={[]}
            sessionId="session-123"
            searchFilters={{
              specialties: filters.specialty,
              languages: filters.languages,
              experience: filters.experienceYears,
              gender: filters.gender,
              location: filters.location,
              insurance: filters.acceptsInsurance
            }}
          />
        </div>
      )}
    </Container>
  )
}

// Default export
export default DoctorSearchPage