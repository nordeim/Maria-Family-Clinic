import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  ArrowLeft, Star, MapPin, Clock, Phone, Calendar, Award, 
  GraduationCap, Languages, Briefcase, Heart, Share2, 
  Loader2, Mail, Check, Shield, DollarSign
} from 'lucide-react'
import { useDoctor } from '../hooks/useSupabase'
import AppointmentBooking from '../components/appointments/AppointmentBooking'
import DoctorReviews from '../components/reviews/DoctorReviews'

const DoctorDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: doctorData, isLoading, error } = useDoctor(id || '')
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading doctor profile...</p>
        </div>
      </div>
    )
  }

  if (error || !doctorData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Doctor Not Found</h2>
          <p className="text-gray-600 mb-4">The doctor you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/doctors')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Back to Doctors
          </button>
        </div>
      </div>
    )
  }

  const doctor = doctorData as any

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/doctors')}
            className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Doctors
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Doctor Header Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Doctor Photo */}
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto md:mx-0">
                    {doctor.image_url ? (
                      <img 
                        src={doctor.image_url} 
                        alt={doctor.name}
                        className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-5xl md:text-6xl font-bold text-blue-600">
                        {doctor.name.split(' ').map((n: string) => n[0]).join('')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Doctor Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        {doctor.name}
                      </h1>
                      <p className="text-xl text-blue-600 font-medium mb-3">
                        {doctor.specialty}
                      </p>
                    </div>
                    <button
                      onClick={() => setIsFavorite(!isFavorite)}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <Heart
                        className={`h-6 w-6 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                      />
                    </button>
                  </div>

                  {/* Rating and Experience */}
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <div className="flex items-center">
                      <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                        <Star className="h-5 w-5 text-yellow-400 fill-current mr-1" />
                        <span className="text-lg font-semibold text-gray-900">
                          {doctor.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Briefcase className="h-5 w-5 mr-2" />
                      <span className="font-medium">{doctor.experience_years} years experience</span>
                    </div>
                    {doctor.is_verified && (
                      <div className="flex items-center text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                        <Shield className="h-4 w-4 mr-1" />
                        <span className="text-sm font-medium">Verified</span>
                      </div>
                    )}
                  </div>

                  {/* Quick Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {doctor.clinic && (
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-5 w-5 mr-2 text-gray-400 flex-shrink-0" />
                        <span>{doctor.clinic.name}</span>
                      </div>
                    )}
                    {doctor.languages && doctor.languages.length > 0 && (
                      <div className="flex items-center text-gray-600">
                        <Languages className="h-5 w-5 mr-2 text-gray-400 flex-shrink-0" />
                        <span>{doctor.languages.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* About Section */}
            {doctor.bio && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
                <p className="text-gray-700 leading-relaxed">{doctor.bio}</p>
              </div>
            )}

            {/* Education & Qualifications */}
            {doctor.education && doctor.education.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-4">
                  <GraduationCap className="h-6 w-6 text-blue-600 mr-2" />
                  <h2 className="text-2xl font-bold text-gray-900">Education & Qualifications</h2>
                </div>
                <ul className="space-y-3">
                  {doctor.education.map((edu: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{edu}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Specializations */}
            {doctor.specializations && doctor.specializations.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-4">
                  <Award className="h-6 w-6 text-blue-600 mr-2" />
                  <h2 className="text-2xl font-bold text-gray-900">Areas of Expertise</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {doctor.specializations.map((spec: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Clinic Information */}
            {doctor.clinic && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Practice Location</h2>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {doctor.clinic.name}
                  </h3>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                      <span>{doctor.clinic.address}</span>
                    </div>
                    {doctor.clinic.phone && (
                      <div className="flex items-center">
                        <Phone className="h-5 w-5 mr-2 text-gray-400 flex-shrink-0" />
                        <a href={`tel:${doctor.clinic.phone}`} className="text-blue-600 hover:text-blue-800">
                          {doctor.clinic.phone}
                        </a>
                      </div>
                    )}
                    {doctor.clinic.opening_hours && (
                      <div className="flex items-start">
                        <Clock className="h-5 w-5 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                        <div className="space-y-1">
                          {Object.entries(doctor.clinic.opening_hours as Record<string, string>).map(([day, hours]) => (
                            <div key={day} className="flex justify-between">
                              <span className="font-medium capitalize w-24">{day}:</span>
                              <span>{hours}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    <Link
                      to={`/clinics/${doctor.clinic.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View Clinic Details →
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <DoctorReviews 
              doctorId={doctor.id} 
              doctorName={doctor.name} 
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Booking Card */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Consultation Fee</span>
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                      <span className="text-2xl font-bold text-gray-900">
                        {doctor.consultation_fee}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">Per session</p>
                </div>

                <button
                  onClick={() => setIsBookingOpen(true)}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center mb-3"
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  Book Appointment
                </button>

                {doctor.clinic?.phone && (
                  <a
                    href={`tel:${doctor.clinic.phone}`}
                    className="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                  >
                    <Phone className="h-5 w-5 mr-2" />
                    Call Clinic
                  </a>
                )}
              </div>

              {/* Languages Spoken */}
              {doctor.languages && doctor.languages.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center mb-3">
                    <Languages className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Languages</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {doctor.languages.map((lang: string, index: number) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Share Profile */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <button className="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center">
                  <Share2 className="h-5 w-5 mr-2" />
                  Share Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Booking Modal */}
      {isBookingOpen && doctor.clinic && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <AppointmentBooking
            doctorId={doctor.id}
            doctorName={doctor.name}
            clinicId={doctor.clinic.id}
            clinicName={doctor.clinic.name}
            consultationFee={doctor.consultation_fee}
            onClose={() => setIsBookingOpen(false)}
            onSuccess={() => {
              // Optionally refresh data or show success message
            }}
          />
        </div>
      )}
    </div>
  )
}

export default DoctorDetailPage
