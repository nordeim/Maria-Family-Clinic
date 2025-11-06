import { useState } from 'react'
import { Search, Filter, Star, MapPin, Calendar, CheckCircle } from 'lucide-react'

export function DoctorSearchPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('all')

  const doctors = [
    {
      id: 1,
      name: "Dr. Sarah Chen",
      specialty: "Cardiology",
      experience: "15 years",
      rating: 4.9,
      reviews: 156,
      education: "MBBS, MRCP, FAMS",
      hospital: "Singapore General Hospital",
      location: "Central Singapore",
      nextAvailable: "Today 2:30 PM",
      languages: ["English", "Mandarin"],
      price: "From $120",
      verified: true
    },
    {
      id: 2,
      name: "Dr. Michael Tan",
      specialty: "Pediatrics",
      experience: "12 years", 
      rating: 4.8,
      reviews: 203,
      education: "MBBS, MMed (Paediatrics)",
      hospital: "KK Women's and Children's Hospital",
      location: "North-East Singapore",
      nextAvailable: "Tomorrow 9:00 AM",
      languages: ["English", "Mandarin", "Malay"],
      price: "From $100",
      verified: true
    },
    {
      id: 3,
      name: "Dr. Emily Wong",
      specialty: "Dermatology",
      experience: "18 years",
      rating: 4.9,
      reviews: 189,
      education: "MBBS, MRCP, FAMS",
      hospital: "National Skin Centre",
      location: "Central Singapore",
      nextAvailable: "Today 4:15 PM", 
      languages: ["English", "Mandarin"],
      price: "From $150",
      verified: true
    },
    {
      id: 4,
      name: "Dr. David Lim",
      specialty: "Orthopedics",
      experience: "20 years",
      rating: 4.7,
      reviews: 167,
      education: "MBBS, MMed (Orthopaedic Surgery)",
      hospital: "Raffles Hospital",
      location: "Central Singapore",
      nextAvailable: "Tomorrow 10:30 AM",
      languages: ["English", "Mandarin"],
      price: "From $180",
      verified: true
    }
  ]

  const specialties = [
    'All Specialties',
    'Cardiology',
    'Pediatrics', 
    'Dermatology',
    'Orthopedics',
    'Neurology',
    'Psychiatry',
    'Ophthalmology',
    'ENT'
  ]

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpecialty = selectedSpecialty === 'all' || doctor.specialty === selectedSpecialty
    return matchesSearch && matchesSpecialty
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Find Doctors</h1>
          <p className="text-lg text-gray-600">
            Search from our network of qualified healthcare professionals
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </h2>
              
              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Doctor name or specialty"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Specialty */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialty
                </label>
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {specialties.map((specialty) => (
                    <option key={specialty} value={specialty === 'All Specialties' ? 'all' : specialty}>
                      {specialty}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Singapore area"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Rating */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Rating
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>Any rating</option>
                  <option>4.5+ stars</option>
                  <option>4.0+ stars</option>
                  <option>3.5+ stars</option>
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>Any price</option>
                  <option>Under $100</option>
                  <option>$100 - $150</option>
                  <option>$150 - $200</option>
                  <option>Over $200</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <p className="text-gray-600">
                Found {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="space-y-6">
              {filteredDoctors.map((doctor) => (
                <div key={doctor.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:space-x-6">
                      {/* Doctor Image */}
                      <div className="flex-shrink-0 mb-4 md:mb-0">
                        <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
                      </div>

                      {/* Doctor Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="text-xl font-semibold text-gray-900">
                                {doctor.name}
                              </h3>
                              {doctor.verified && (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              )}
                            </div>
                            <p className="text-blue-600 font-medium mb-1">{doctor.specialty}</p>
                            <p className="text-gray-600 text-sm mb-2">{doctor.education}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">{doctor.price}</div>
                            <div className="text-sm text-gray-500">Consultation fee</div>
                          </div>
                        </div>

                        {/* Rating and Reviews */}
                        <div className="flex items-center space-x-4 mb-3">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="ml-1 text-sm text-gray-600">
                              {doctor.rating} ({doctor.reviews} reviews)
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {doctor.experience} experience
                          </div>
                        </div>

                        {/* Hospital and Location */}
                        <div className="flex items-center space-x-4 mb-3 text-sm text-gray-600">
                          <span>{doctor.hospital}</span>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {doctor.location}
                          </div>
                        </div>

                        {/* Languages */}
                        <div className="mb-3">
                          <span className="text-sm text-gray-600">Languages: </span>
                          <span className="text-sm text-gray-800">
                            {doctor.languages.join(', ')}
                          </span>
                        </div>

                        {/* Next Available */}
                        <div className="flex items-center text-sm text-green-600 mb-4">
                          <Calendar className="h-4 w-4 mr-1" />
                          Next available: {doctor.nextAvailable}
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-3">
                          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                            Book Appointment
                          </button>
                          <button className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                            View Profile
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredDoctors.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No doctors found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search criteria or filters
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}