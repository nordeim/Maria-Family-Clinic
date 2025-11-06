import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Search, 
  MapPin, 
  Calendar, 
  Shield, 
  Clock, 
  Users, 
  Star,
  ArrowRight,
  Phone,
  Heart,
  Award,
  CheckCircle
} from 'lucide-react'

export function HomePage() {
  const [featuredDoctors] = useState([
    {
      id: 1,
      name: "Dr. Sarah Chen",
      specialty: "Cardiology",
      experience: "15 years",
      rating: 4.9,
      reviews: 156,
      image: "/api/placeholder/200/200",
      nextAvailable: "Today 2:30 PM"
    },
    {
      id: 2,
      name: "Dr. Michael Tan",
      specialty: "Pediatrics", 
      experience: "12 years",
      rating: 4.8,
      reviews: 203,
      image: "/api/placeholder/200/200",
      nextAvailable: "Tomorrow 9:00 AM"
    },
    {
      id: 3,
      name: "Dr. Emily Wong",
      specialty: "Dermatology",
      experience: "18 years", 
      rating: 4.9,
      reviews: 189,
      image: "/api/placeholder/200/200",
      nextAvailable: "Today 4:15 PM"
    }
  ])

  const [stats] = useState({
    doctors: 150,
    patients: 25000,
    clinics: 25,
    satisfaction: 98
  })

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Your Health, <br />
              <span className="text-blue-200">Our Priority</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Find the best healthcare providers in Singapore. Book appointments, 
              access medical records, and manage your family's health with ease.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/doctors"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center"
              >
                <Search className="h-5 w-5 mr-2" />
                Find Doctors
              </Link>
              <a
                href="tel:+6561234567"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors flex items-center justify-center"
              >
                <Phone className="h-5 w-5 mr-2" />
                Call Now
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="bg-white shadow-lg -mt-12 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              Find Healthcare Providers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Doctor name or specialty"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Location in Singapore"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <Link
                to="/doctors"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                Search
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose MyFamily Clinic?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide comprehensive healthcare services with cutting-edge technology 
              and compassionate care.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Expert Doctors</h3>
              <p className="text-gray-600">
                Over 150 qualified healthcare professionals across all specialties
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">24/7 Availability</h3>
              <p className="text-gray-600">
                Round-the-clock emergency care and consultation services
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure & Private</h3>
              <p className="text-gray-600">
                HIPAA-compliant platform ensuring your medical data is safe
              </p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Compassionate Care</h3>
              <p className="text-gray-600">
                Patient-centered approach with personalized treatment plans
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Doctors Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Featured Doctors
              </h2>
              <p className="text-xl text-gray-600">
                Meet our top-rated healthcare professionals
              </p>
            </div>
            <Link
              to="/doctors"
              className="text-blue-600 hover:text-blue-700 font-semibold flex items-center"
            >
              View All <ArrowRight className="h-5 w-5 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredDoctors.map((doctor) => (
              <div key={doctor.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{doctor.name}</h3>
                      <p className="text-gray-600">{doctor.specialty}</p>
                      <p className="text-sm text-gray-500">{doctor.experience} experience</p>
                    </div>
                  </div>
                  <div className="flex items-center mb-4">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm text-gray-600">
                      {doctor.rating} ({doctor.reviews} reviews)
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-green-600 mb-4">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span>Next available: {doctor.nextAvailable}</span>
                  </div>
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                    Book Appointment
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">{stats.doctors}+</div>
              <div className="text-blue-200">Qualified Doctors</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">{stats.patients.toLocaleString()}+</div>
              <div className="text-blue-200">Patients Served</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">{stats.clinics}</div>
              <div className="text-blue-200">Clinic Locations</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">{stats.satisfaction}%</div>
              <div className="text-blue-200">Patient Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Section */}
      <section className="py-16 bg-red-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center">
                <Phone className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Medical Emergency?
            </h2>
            <p className="text-xl text-gray-600 mb-6">
              Don't wait. Our emergency care team is available 24/7.
            </p>
            <a
              href="tel:+6561234567"
              className="bg-red-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-red-700 transition-colors inline-flex items-center"
            >
              <Phone className="h-5 w-5 mr-2" />
              Call Emergency: +65 6123 4567
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}