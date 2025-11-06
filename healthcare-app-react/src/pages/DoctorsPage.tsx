import React, { useState, useMemo } from 'react'
import { Search, Filter, Star, MapPin, Clock, Award, Loader2, SlidersHorizontal, DollarSign } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useDoctors, useSearchDoctors, useClinic } from '../hooks/useSupabase'
import AppointmentBooking from '../components/appointments/AppointmentBooking'
import { Doctor } from '../lib/supabase'

const DoctorsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('')
  const [sortBy, setSortBy] = useState<'rating' | 'experience' | 'price_low' | 'price_high' | 'name'>('rating')
  const [minRating, setMinRating] = useState<number>(0)
  const [maxPrice, setMaxPrice] = useState<number>(500)
  const [minExperience, setMinExperience] = useState<number>(0)
  const [showFilters, setShowFilters] = useState(false)
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null)
  
  // Fetch clinic data for the selected doctor
  const { data: selectedClinic } = useClinic(bookingDoctor?.clinic_id || '')
  
  const { data: allDoctors, isLoading: doctorsLoading } = useDoctors()
  const { data: searchResults, isLoading: searchLoading } = useSearchDoctors(
    searchQuery, 
    selectedSpecialty || undefined
  )

  // Use search results if searching, otherwise use all doctors
  const rawDoctors = searchQuery || selectedSpecialty ? searchResults : allDoctors

  // Apply advanced filters and sorting
  const doctors = useMemo(() => {
    if (!rawDoctors) return []
    
    let filtered = rawDoctors.filter(doctor => {
      if (minRating > 0 && doctor.rating < minRating) return false
      if (maxPrice < 500 && doctor.consultation_fee > maxPrice) return false
      if (minExperience > 0 && doctor.experience_years < minExperience) return false
      return true
    })

    // Sort doctors
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating
        case 'experience':
          return b.experience_years - a.experience_years
        case 'price_low':
          return a.consultation_fee - b.consultation_fee
        case 'price_high':
          return b.consultation_fee - a.consultation_fee
        case 'name':
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })
  }, [rawDoctors, minRating, maxPrice, minExperience, sortBy])

  // Get unique specialties for filter
  const specialties = useMemo(() => {
    if (!allDoctors) return []
    const uniqueSpecialties = [...new Set(allDoctors.map(doctor => doctor.specialty))]
    return uniqueSpecialties.sort()
  }, [allDoctors])

  // Filter out empty search results
  const hasResults = doctors && doctors.length > 0

  // Count active filters
  const activeFilterCount = [
    minRating > 0,
    maxPrice < 500,
    minExperience > 0,
    selectedSpecialty !== ''
  ].filter(Boolean).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Find Your Doctor</h1>
          <p className="text-gray-600">
            Browse through our network of qualified healthcare professionals
          </p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by name, specialty, or condition..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Sort By */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-[180px]"
                >
                  <option value="rating">Highest Rated</option>
                  <option value="experience">Most Experienced</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>

              {/* Advanced Filters Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center min-w-[140px]"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
              <div className="bg-gray-50 rounded-lg p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Specialty Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Specialty
                    </label>
                    <div className="relative">
                      <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <select
                        value={selectedSpecialty}
                        onChange={(e) => setSelectedSpecialty(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                      >
                        <option value="">All Specialties</option>
                        {specialties.map(specialty => (
                          <option key={specialty} value={specialty}>
                            {specialty}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Rating Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Rating: {minRating > 0 ? `${minRating}+ stars` : 'Any'}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="0.5"
                      value={minRating}
                      onChange={(e) => setMinRating(parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Any</span>
                      <span>5 stars</span>
                    </div>
                  </div>

                  {/* Experience Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Experience: {minExperience > 0 ? `${minExperience}+ years` : 'Any'}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      step="5"
                      value={minExperience}
                      onChange={(e) => setMinExperience(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Any</span>
                      <span>30+ years</span>
                    </div>
                  </div>

                  {/* Price Filter */}
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Consultation Fee: {maxPrice < 500 ? `$${maxPrice}` : 'Any'}
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="500"
                      step="25"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>$50</span>
                      <span>$500+</span>
                    </div>
                  </div>
                </div>

                {/* Clear Filters */}
                {activeFilterCount > 0 && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        setSelectedSpecialty('')
                        setMinRating(0)
                        setMaxPrice(500)
                        setMinExperience(0)
                      }}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {(doctorsLoading || searchLoading) && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading doctors...</span>
          </div>
        )}

        {/* No Results */}
        {!doctorsLoading && !searchLoading && !hasResults && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No doctors found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or browse all doctors
            </p>
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedSpecialty('')
              }}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Doctor Results */}
        {hasResults && (
          <>
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-gray-600">
                Found {doctors.length} doctor{doctors.length !== 1 ? 's' : ''}
                {searchQuery && ` matching "${searchQuery}"`}
                {selectedSpecialty && ` in ${selectedSpecialty}`}
              </p>
            </div>

            {/* Doctor Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doctor) => (
                <div key={doctor.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    {/* Doctor Image */}
                    <div className="flex items-center mb-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                        {doctor.image_url ? (
                          <img 
                            src={doctor.image_url} 
                            alt={doctor.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl font-bold text-gray-500">
                            {doctor.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{doctor.name}</h3>
                        <p className="text-blue-600 font-medium">{doctor.specialty}</p>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center mb-3">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="ml-1 text-sm font-medium text-gray-900">
                          {doctor.rating.toFixed(1)}
                        </span>
                      </div>
                      <span className="ml-2 text-sm text-gray-500">
                        ({doctor.experience_years} years exp.)
                      </span>
                    </div>

                    {/* Education */}
                    {doctor.education.length > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <Award className="h-4 w-4 mr-1" />
                          <span className="truncate">{doctor.education[0]}</span>
                        </div>
                      </div>
                    )}

                    {/* Consultation Fee */}
                    <div className="mb-4">
                      <div className="text-lg font-semibold text-gray-900">
                        ${doctor.consultation_fee}
                      </div>
                      <div className="text-sm text-gray-500">Consultation fee</div>
                    </div>

                    {/* Bio */}
                    {doctor.bio && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {doctor.bio}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        to={`/doctors/${doctor.id}`}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center text-sm font-medium"
                      >
                        View Profile
                      </Link>
                      <button 
                        onClick={() => setBookingDoctor(doctor)}
                        className="flex-1 border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Appointment Booking Modal */}
      {bookingDoctor && selectedClinic && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <AppointmentBooking
            doctorId={bookingDoctor.id}
            doctorName={bookingDoctor.name}
            clinicId={selectedClinic.id}
            clinicName={selectedClinic.name}
            consultationFee={bookingDoctor.consultation_fee}
            onClose={() => setBookingDoctor(null)}
            onSuccess={() => setBookingDoctor(null)}
          />
        </div>
      )}
    </div>
  )
}

export default DoctorsPage
