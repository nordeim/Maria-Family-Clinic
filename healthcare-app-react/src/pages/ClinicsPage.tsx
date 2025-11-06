import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { 
  MapPin, Phone, Clock, Star, Navigation, Search, Filter, 
  Loader2, Map as MapIcon, List, ChevronDown
} from 'lucide-react'
import { useClinics } from '../hooks/useSupabase'
import { APIProvider, Map, Marker, InfoWindow } from '@vis.gl/react-google-maps'

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyCO0kKndUNlmQi3B5mxy4dblg_8WYcuKuk'

// Singapore center coordinates
const SINGAPORE_CENTER = { lat: 1.3521, lng: 103.8198 }

const ClinicsPage: React.FC = () => {
  const { data: clinics, isLoading } = useClinics()
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [selectedClinic, setSelectedClinic] = useState<any>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    hasParking: false,
    hasWheelchairAccess: false,
    has24Hours: false,
  })

  // Filter and search clinics
  const filteredClinics = useMemo(() => {
    if (!clinics) return []
    
    let filtered = clinics

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(clinic =>
        clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        clinic.address.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Facility filters
    if (filters.hasParking) {
      filtered = filtered.filter(clinic => 
        clinic.facilities?.includes('Parking Available')
      )
    }
    if (filters.hasWheelchairAccess) {
      filtered = filtered.filter(clinic => 
        clinic.facilities?.includes('Wheelchair Accessible')
      )
    }

    return filtered
  }, [clinics, searchQuery, filters])

  // Calculate map center
  const mapCenter = useMemo(() => {
    if (!filteredClinics || filteredClinics.length === 0) return SINGAPORE_CENTER
    
    const avgLat = filteredClinics.reduce((sum, clinic) => sum + (clinic.latitude || 0), 0) / filteredClinics.length
    const avgLng = filteredClinics.reduce((sum, clinic) => sum + (clinic.longitude || 0), 0) / filteredClinics.length
    
    return { lat: avgLat, lng: avgLng }
  }, [filteredClinics])

  const ClinicCard = ({ clinic, showActions = true }: { clinic: any, showActions?: boolean }) => (
    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{clinic.name}</h3>
          {clinic.rating && (
            <div className="flex items-center mb-2">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="ml-1 text-sm font-medium text-gray-900">
                {clinic.rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-3 mb-4">
        <div className="flex items-start">
          <MapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
          <span className="text-gray-600 text-sm">{clinic.address}</span>
        </div>
        
        {clinic.phone && (
          <div className="flex items-center">
            <Phone className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
            <a 
              href={`tel:${clinic.phone}`} 
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              {clinic.phone}
            </a>
          </div>
        )}
        
        {clinic.hours && (
          <div className="flex items-start">
            <Clock className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-sm text-gray-600">
              <div className="font-medium text-gray-900 mb-1">Opening Hours:</div>
              {Object.entries(clinic.hours as Record<string, string>).slice(0, 2).map(([day, hours]) => (
                <div key={day} className="capitalize">
                  {day}: {hours}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Services */}
      {clinic.services && clinic.services.length > 0 && (
        <div className="mb-4">
          <div className="text-sm font-semibold text-gray-900 mb-2">Services:</div>
          <div className="flex flex-wrap gap-2">
            {clinic.services.slice(0, 3).map((service: string, index: number) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700"
              >
                {service}
              </span>
            ))}
            {clinic.services.length > 3 && (
              <span className="text-xs text-gray-500 self-center">
                +{clinic.services.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Facilities */}
      {clinic.facilities && clinic.facilities.length > 0 && (
        <div className="mb-4">
          <div className="text-sm font-semibold text-gray-900 mb-2">Facilities:</div>
          <div className="flex flex-wrap gap-2">
            {clinic.facilities.slice(0, 3).map((facility: string, index: number) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700"
              >
                {facility}
              </span>
            ))}
          </div>
        </div>
      )}

      {showActions && (
        <div className="space-y-2">
          <Link
            to={`/clinics/${clinic.id}`}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center block text-sm font-medium"
          >
            View Details
          </Link>
          {clinic.latitude && clinic.longitude && (
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${clinic.latitude},${clinic.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-center flex items-center justify-center text-sm font-medium"
            >
              <Navigation className="h-4 w-4 mr-2" />
              Get Directions
            </a>
          )}
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Our Clinic Locations</h1>
          <p className="text-gray-600">
            Find convenient healthcare facilities across Singapore
          </p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* View Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <List className="h-4 w-4 mr-2" />
                List
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                  viewMode === 'map'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <MapIcon className="h-4 w-4 mr-2" />
                Map
              </button>
            </div>

            {/* Filters */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.hasParking}
                    onChange={(e) => setFilters({ ...filters, hasParking: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Parking Available</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.hasWheelchairAccess}
                    onChange={(e) => setFilters({ ...filters, hasWheelchairAccess: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Wheelchair Accessible</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading clinics...</span>
          </div>
        ) : filteredClinics.length === 0 ? (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No clinics found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-gray-600">
                Found {filteredClinics.length} clinic{filteredClinics.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* List View */}
            {viewMode === 'list' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredClinics.map((clinic) => (
                  <ClinicCard key={clinic.id} clinic={clinic} />
                ))}
              </div>
            )}

            {/* Map View */}
            {viewMode === 'map' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {filteredClinics.map((clinic) => (
                    <ClinicCard 
                      key={clinic.id} 
                      clinic={clinic} 
                      showActions={false}
                    />
                  ))}
                </div>
                <div className="h-[600px] rounded-lg overflow-hidden shadow-lg sticky top-24">
                  <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                    <Map
                      defaultCenter={mapCenter}
                      defaultZoom={12}
                      mapId="clinic-map"
                    >
                      {filteredClinics.map((clinic) => (
                        clinic.latitude && clinic.longitude && (
                          <Marker
                            key={clinic.id}
                            position={{ lat: clinic.latitude, lng: clinic.longitude }}
                            onClick={() => setSelectedClinic(clinic)}
                          />
                        )
                      ))}
                      
                      {selectedClinic && selectedClinic.latitude && selectedClinic.longitude && (
                        <InfoWindow
                          position={{ lat: selectedClinic.latitude, lng: selectedClinic.longitude }}
                          onCloseClick={() => setSelectedClinic(null)}
                        >
                          <div className="p-2 max-w-xs">
                            <h3 className="font-bold text-gray-900 mb-1">{selectedClinic.name}</h3>
                            <p className="text-sm text-gray-600 mb-2">{selectedClinic.address}</p>
                            <Link
                              to={`/clinics/${selectedClinic.id}`}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              View Details →
                            </Link>
                          </div>
                        </InfoWindow>
                      )}
                    </Map>
                  </APIProvider>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ClinicsPage
