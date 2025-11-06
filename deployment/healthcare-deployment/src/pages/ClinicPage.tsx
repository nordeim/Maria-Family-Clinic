import { useState } from 'react'
import { MapPin, Phone, Clock, Star, Users, Navigation } from 'lucide-react'

export function ClinicPage() {
  const [selectedLocation, setSelectedLocation] = useState('all')

  const clinics = [
    {
      id: 1,
      name: "MyFamily Clinic Central",
      address: "123 Orchard Road, #03-15, Singapore 238858",
      phone: "+65 6123 4567",
      hours: {
        weekdays: "8:00 AM - 8:00 PM",
        saturday: "9:00 AM - 6:00 PM", 
        sunday: "10:00 AM - 4:00 PM"
      },
      rating: 4.8,
      reviews: 342,
      doctors: 15,
      specialties: ["General Practice", "Pediatrics", "Cardiology", "Dermatology"],
      services: ["General Consultation", "Health Screening", "Vaccination", "Emergency Care"],
      facilities: ["Parking Available", "Wheelchair Accessible", "Pharmacy On-site"],
      image: "/api/placeholder/400/250"
    },
    {
      id: 2,
      name: "MyFamily Clinic North",
      address: "456 Woodlands Drive, #02-08, Singapore 730456",
      phone: "+65 6123 4568",
      hours: {
        weekdays: "8:00 AM - 7:00 PM",
        saturday: "9:00 AM - 5:00 PM",
        sunday: "10:00 AM - 3:00 PM"
      },
      rating: 4.7,
      reviews: 289,
      doctors: 12,
      specialties: ["General Practice", "Orthopedics", "Neurology"],
      services: ["General Consultation", "Specialist Referrals", "Physiotherapy"],
      facilities: ["Parking Available", "X-ray Facility", "Laboratory"],
      image: "/api/placeholder/400/250"
    },
    {
      id: 3,
      name: "MyFamily Clinic East",
      address: "789 Tampines Central, #04-12, Singapore 529456",
      phone: "+65 6123 4569",
      hours: {
        weekdays: "7:30 AM - 8:30 PM",
        saturday: "8:30 AM - 6:30 PM",
        sunday: "9:30 AM - 4:30 PM"
      },
      rating: 4.9,
      reviews: 415,
      doctors: 18,
      specialties: ["General Practice", "Pediatrics", "OB-GYN", "ENT", "Ophthalmology"],
      services: ["General Consultation", "Women's Health", "Child Care", "Eye Care"],
      facilities: ["Parking Available", "Maternity Care", "Pediatric Wing"],
      image: "/api/placeholder/400/250"
    }
  ]

  const filteredClinics = clinics.filter(clinic => {
    if (selectedLocation === 'all') return true
    return clinic.name.toLowerCase().includes(selectedLocation.toLowerCase())
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Our Clinics</h1>
          <p className="text-lg text-gray-600">
            Visit any of our conveniently located clinics across Singapore
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <label className="font-medium text-gray-700">Filter by location:</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Locations</option>
              <option value="central">Central</option>
              <option value="north">North</option>
              <option value="east">East</option>
            </select>
          </div>
        </div>

        {/* Clinics Grid */}
        <div className="space-y-8">
          {filteredClinics.map((clinic) => (
            <div key={clinic.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="md:flex">
                {/* Clinic Image */}
                <div className="md:w-1/3">
                  <div className="h-64 md:h-full bg-gray-200 rounded-l-lg"></div>
                </div>

                {/* Clinic Details */}
                <div className="md:w-2/3 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {clinic.name}
                      </h2>
                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPin className="h-4 w-4 mr-2" />
                        {clinic.address}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        {clinic.phone}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center mb-1">
                        <Star className="h-5 w-5 text-yellow-400 fill-current mr-1" />
                        <span className="font-semibold">{clinic.rating}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {clinic.reviews} reviews
                      </div>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Operating Hours
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Mon-Fri:</span> {clinic.hours.weekdays}
                      </div>
                      <div>
                        <span className="font-medium">Saturday:</span> {clinic.hours.saturday}
                      </div>
                      <div>
                        <span className="font-medium">Sunday:</span> {clinic.hours.sunday}
                      </div>
                    </div>
                  </div>

                  {/* Doctors Count */}
                  <div className="flex items-center text-gray-600 mb-4">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{clinic.doctors} doctors available</span>
                  </div>

                  {/* Specialties */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Specialties</h4>
                    <div className="flex flex-wrap gap-2">
                      {clinic.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Services */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Services</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {clinic.services.map((service, index) => (
                        <li key={index} className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                          {service}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Facilities */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-2">Facilities</h4>
                    <div className="flex flex-wrap gap-2">
                      {clinic.facilities.map((facility, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                        >
                          {facility}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Book Appointment
                    </button>
                    <button className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center">
                      <Navigation className="h-4 w-4 mr-2" />
                      Get Directions
                    </button>
                    <a
                      href={`tel:${clinic.phone}`}
                      className="border border-green-500 text-green-600 px-6 py-2 rounded-lg hover:bg-green-50 transition-colors text-center"
                    >
                      Call Clinic
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredClinics.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <MapPin className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No clinics found
            </h3>
            <p className="text-gray-600">
              Try adjusting your location filter
            </p>
          </div>
        )}
      </div>
    </div>
  )
}