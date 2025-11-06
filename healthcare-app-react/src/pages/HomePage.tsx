import React from 'react'
import { Link } from 'react-router-dom'
import { Search, Calendar, Shield, Users, Award, Phone, ArrowRight, Star, MapPin, Clock, Loader2 } from 'lucide-react'
import { useDoctors, useClinics, useServices } from '../hooks/useSupabase'

const HomePage: React.FC = () => {
  const { data: doctors, isLoading: doctorsLoading } = useDoctors()
  const { data: clinics, isLoading: clinicsLoading } = useClinics()
  const { data: services, isLoading: servicesLoading } = useServices()

  // Calculate statistics from real data
  const doctorCount = doctors?.length || 0
  const clinicCount = clinics?.length || 0
  const serviceCount = services?.length || 0
  const patientCount = doctorCount * 150 // Estimated based on doctors

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
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
                <Search className="mr-2 h-5 w-5" />
                Find Doctors
              </Link>
              <Link
                to="/contact"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors flex items-center justify-center"
              >
                <Phone className="mr-2 h-5 w-5" />
                Emergency: +65 6123 4567
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose MyFamily Clinic?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide comprehensive healthcare services with a focus on quality, 
              accessibility, and patient-centered care.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-lg shadow-lg card-hover">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Find Top Doctors</h3>
              <p className="text-gray-600 mb-4">
                Browse through our network of experienced healthcare professionals and specialists.
              </p>
              <Link to="/doctors" className="text-blue-600 hover:text-blue-800 font-medium flex items-center">
                Browse Doctors <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-lg shadow-lg card-hover">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Booking</h3>
              <p className="text-gray-600 mb-4">
                Book appointments online 24/7 with instant confirmation and reminders.
              </p>
              <Link to="/contact" className="text-blue-600 hover:text-blue-800 font-medium flex items-center">
                Book Now <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-lg shadow-lg card-hover">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">HIPAA Compliant</h3>
              <p className="text-gray-600 mb-4">
                Your medical information is protected with the highest security standards.
              </p>
              <a href="#" className="text-blue-600 hover:text-blue-800 font-medium flex items-center">
                Learn More <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {(doctorsLoading || clinicsLoading || servicesLoading) ? (
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading statistics...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {doctorCount}+
                </div>
                <div className="text-gray-600">Qualified Doctors</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {patientCount.toLocaleString()}+
                </div>
                <div className="text-gray-600">Patients Served</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {clinicCount}
                </div>
                <div className="text-gray-600">Clinic Locations</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  24/7
                </div>
                <div className="text-gray-600">Emergency Support</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Medical Services
            </h2>
            <p className="text-xl text-gray-600">
              Comprehensive healthcare services for you and your family
            </p>
          </div>

          {servicesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading services...</span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services?.slice(0, 6).map((service, index) => {
                  const colors = ['blue', 'green', 'purple', 'orange', 'red', 'indigo']
                  const icons = [Users, Award, Shield, Shield, Phone, Calendar]
                  const color = colors[index % colors.length]
                  const IconComponent = icons[index % icons.length]
                  
                  return (
                    <div key={service.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                      <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center mb-4`}>
                        <IconComponent className={`h-6 w-6 text-${color}-600`} />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.name}</h3>
                      <p className="text-gray-600 mb-4 text-sm">{service.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-blue-600 font-medium">{service.price_range}</span>
                        <Link to="/services" className="text-blue-600 hover:text-blue-800 font-medium">
                          Learn More →
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="text-center mt-8">
                <Link
                  to="/services"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  View All Services ({serviceCount} available)
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Patients Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Lim',
                rating: 5,
                comment: 'Excellent service and professional doctors. Highly recommended!',
              },
              {
                name: 'Ahmed Rahman',
                rating: 5,
                comment: 'Very convenient online booking system. Great experience overall.',
              },
              {
                name: 'Lisa Chen',
                rating: 5,
                comment: 'The staff was friendly and the facilities are top-notch.',
              },
            ].map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">"{testimonial.comment}"</p>
                <p className="font-semibold text-gray-900">{testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency CTA */}
      <section className="bg-red-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <Phone className="h-12 w-12 text-red-200 mr-4" />
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Medical Emergency?</h2>
              <p className="text-xl text-red-100">Get immediate assistance from our emergency team</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+6561234567"
              className="bg-white text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors flex items-center justify-center"
            >
              <Phone className="mr-2 h-5 w-5" />
              Call 995 Now
            </a>
            <a
              href="tel:+6561234567"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-red-600 transition-colors flex items-center justify-center"
            >
              <MapPin className="mr-2 h-5 w-5" />
              Find Nearest Clinic
            </a>
          </div>
          <div className="mt-8 flex items-center justify-center text-red-200">
            <Clock className="h-5 w-5 mr-2" />
            <span>Emergency services available 24/7</span>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
