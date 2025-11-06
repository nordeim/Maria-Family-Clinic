import React from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  ArrowLeft, MapPin, Phone, Clock, Star, Mail, Navigation,
  Loader2, Calendar, Users, Shield, Award, Car, Accessibility
} from 'lucide-react'
import { useClinic } from '../hooks/useSupabase'

const ClinicDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: clinicData, isLoading, error } = useClinic(id || '')

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading clinic information...</p>
        </div>
      </div>
    )
  }

  if (error || !clinicData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Clinic Not Found</h2>
          <p className="text-gray-600 mb-4">The clinic you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/clinics')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Back to Clinics
          </button>
        </div>
      </div>
    )
  }

  const clinic = clinicData as any

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/clinics')}
            className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Clinics
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Clinic Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
              {clinic.image_url && (
                <div className="mb-6 rounded-lg overflow-hidden">
                  <img 
                    src={clinic.image_url} 
                    alt={clinic.name}
                    className="w-full h-64 object-cover"
                  />
                </div>
              )}
              
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    {clinic.name}
                  </h1>
                  {clinic.rating && (
                    <div className="flex items-center">
                      <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                        <Star className="h-5 w-5 text-yellow-400 fill-current mr-1" />
                        <span className="text-lg font-semibold text-gray-900">
                          {clinic.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-3 mb-6">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">{clinic.address}</span>
                </div>
                
                {clinic.phone && (
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                    <a 
                      href={`tel:${clinic.phone}`} 
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {clinic.phone}
                    </a>
                  </div>
                )}

                {clinic.email && (
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                    <a 
                      href={`mailto:${clinic.email}`} 
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {clinic.email}
                    </a>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Book Appointment
                </button>
                {clinic.latitude && clinic.longitude && (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${clinic.latitude},${clinic.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                  >
                    <Navigation className="h-5 w-5 mr-2" />
                    Get Directions
                  </a>
                )}
              </div>
            </div>

            {/* Opening Hours */}
            {clinic.hours && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-4">
                  <Clock className="h-6 w-6 text-blue-600 mr-2" />
                  <h2 className="text-2xl font-bold text-gray-900">Opening Hours</h2>
                </div>
                <div className="space-y-2">
                  {Object.entries(clinic.hours as Record<string, string>).map(([day, hours]) => (
                    <div key={day} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                      <span className="font-medium text-gray-900 capitalize">{day}</span>
                      <span className="text-gray-600">{hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Services */}
            {clinic.services && clinic.services.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-4">
                  <Award className="h-6 w-6 text-blue-600 mr-2" />
                  <h2 className="text-2xl font-bold text-gray-900">Medical Services</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {clinic.services.map((service: string, index: number) => (
                    <div key={index} className="flex items-center bg-blue-50 px-4 py-3 rounded-lg">
                      <Shield className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{service}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Facilities */}
            {clinic.facilities && clinic.facilities.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Facilities & Amenities</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {clinic.facilities.map((facility: string, index: number) => {
                    // Choose icon based on facility name
                    let Icon = Award
                    if (facility.toLowerCase().includes('parking')) Icon = Car
                    if (facility.toLowerCase().includes('wheelchair') || facility.toLowerCase().includes('accessible')) Icon = Accessibility
                    
                    return (
                      <div key={index} className="flex items-center bg-green-50 px-4 py-3 rounded-lg">
                        <Icon className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{facility}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Doctors at this Clinic */}
            {clinic.doctors && clinic.doctors.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-4">
                  <Users className="h-6 w-6 text-blue-600 mr-2" />
                  <h2 className="text-2xl font-bold text-gray-900">Our Doctors</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {clinic.doctors.map((doctor: any) => (
                    <Link
                      key={doctor.id}
                      to={`/doctors/${doctor.id}`}
                      className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mr-4">
                        {doctor.image_url ? (
                          <img 
                            src={doctor.image_url} 
                            alt={doctor.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-bold text-blue-600">
                            {doctor.name.split(' ').map((n: string) => n[0]).join('')}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
                        <p className="text-sm text-blue-600">{doctor.specialty}</p>
                        {doctor.rating && (
                          <div className="flex items-center mt-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-gray-600 ml-1">
                              {doctor.rating.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Map */}
              {clinic.latitude && clinic.longitude && (
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Location</h3>
                  <div className="aspect-video rounded-lg overflow-hidden bg-gray-200">
                    <iframe
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      style={{ border: 0 }}
                      src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyCO0kKndUNlmQi3B5mxy4dblg_8WYcuKuk&q=${clinic.latitude},${clinic.longitude}&zoom=15`}
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              {/* Quick Contact */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Assistance?</h3>
                <p className="text-gray-600 mb-4 text-sm">
                  Our team is here to help you with appointments, inquiries, and medical concerns.
                </p>
                {clinic.phone && (
                  <a
                    href={`tel:${clinic.phone}`}
                    className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center mb-2"
                  >
                    <Phone className="h-5 w-5 mr-2" />
                    Call Now
                  </a>
                )}
                <Link
                  to="/contact"
                  className="w-full border border-gray-300 bg-white text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  <Mail className="h-5 w-5 mr-2" />
                  Send Message
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClinicDetailPage
