import { useState } from 'react'
import { 
  Stethoscope, 
  Heart, 
  Baby, 
  Eye, 
  Brain, 
  Activity, 
  Shield, 
  Phone,
  ArrowRight,
  CheckCircle,
  Clock,
  DollarSign
} from 'lucide-react'

export function ServicesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')

  const services = [
    {
      id: 1,
      name: "General Consultation",
      category: "primary",
      description: "Comprehensive health check-ups and general medical consultations with experienced family physicians.",
      icon: Stethoscope,
      price: "From $80",
      duration: "30-45 minutes",
      available: true,
      features: [
        "Complete health assessment",
        "Vital signs monitoring", 
        "Basic laboratory tests",
        "Prescription medication",
        "Health advice and counseling"
      ],
      covered: ["Medisave", "Company Insurance"]
    },
    {
      id: 2,
      name: "Cardiology Services",
      category: "specialist",
      description: "Specialized heart and cardiovascular care includingECG, echocardiogram, and cardiac risk assessment.",
      icon: Heart,
      price: "From $150",
      duration: "45-60 minutes",
      available: true,
      features: [
        "Electrocardiogram (ECG)",
        "Echocardiogram",
        "Cardiac stress test",
        "Blood pressure monitoring",
        "Cholesterol screening"
      ],
      covered: ["Medisave", "Company Insurance", "Private Insurance"]
    },
    {
      id: 3,
      name: "Pediatric Care",
      category: "specialist",
      description: "Comprehensive healthcare services for infants, children, and adolescents up to 18 years old.",
      icon: Baby,
      price: "From $100",
      duration: "30-40 minutes",
      available: true,
      features: [
        "Child development assessment",
        "Vaccination schedules",
        "Growth monitoring",
        "Nutrition counseling",
        "Behavioral health support"
      ],
      covered: ["Medisave", "Company Insurance", "Baby Bonus Scheme"]
    },
    {
      id: 4,
      name: "Eye Care & Ophthalmology",
      category: "specialist",
      description: "Complete eye health services including vision screening, eye exams, and treatment of eye conditions.",
      icon: Eye,
      price: "From $120",
      duration: "30-45 minutes",
      available: true,
      features: [
        "Visual acuity testing",
        "Retinal examination",
        "Intraocular pressure test",
        "Prescription glasses/contacts",
        "Diabetic eye screening"
      ],
      covered: ["Medisave", "Company Insurance"]
    },
    {
      id: 5,
      name: "Mental Health & Psychiatry",
      category: "specialist",
      description: "Professional mental health support including counseling, therapy, and psychiatric consultations.",
      icon: Brain,
      price: "From $180",
      duration: "60 minutes",
      available: true,
      features: [
        "Psychological assessment",
        "Individual counseling",
        "Stress management",
        "Depression/anxiety treatment",
        "Family therapy sessions"
      ],
      covered: ["Company Insurance", "Medisave (Limited)"]
    },
    {
      id: 6,
      name: "Health Screening Packages",
      category: "preventive",
      description: "Comprehensive health screening packages for early detection and prevention of diseases.",
      icon: Shield,
      price: "From $200",
      duration: "2-3 hours",
      available: true,
      features: [
        "Complete blood count",
        "Cholesterol & diabetes screening",
        "Liver & kidney function tests",
        "Cancer markers screening",
        "Detailed medical report"
      ],
      covered: ["Medisave", "Company Insurance"]
    }
  ]

  const categories = [
    { id: 'all', name: 'All Services' },
    { id: 'primary', name: 'Primary Care' },
    { id: 'specialist', name: 'Specialist Care' },
    { id: 'preventive', name: 'Preventive Care' }
  ]

  const filteredServices = services.filter(service => {
    return selectedCategory === 'all' || service.category === selectedCategory
  })

  const getIconColor = (category: string) => {
    switch (category) {
      case 'primary': return 'text-blue-600 bg-blue-100'
      case 'specialist': return 'text-purple-600 bg-purple-100'
      case 'preventive': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Our Services</h1>
          <p className="text-lg text-gray-600">
            Comprehensive healthcare services delivered by qualified medical professionals
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredServices.map((service) => {
            const IconComponent = service.icon
            return (
              <div key={service.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Service Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${getIconColor(service.category)}`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">{service.price}</div>
                      <div className="text-sm text-gray-500">per consultation</div>
                    </div>
                  </div>

                  {/* Service Info */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {service.name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {service.description}
                  </p>

                  {/* Duration and Availability */}
                  <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {service.duration}
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                      {service.available ? 'Available' : 'Coming Soon'}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">What's Included:</h4>
                    <ul className="space-y-1">
                      {service.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    {service.features.length > 3 && (
                      <p className="text-sm text-blue-600 mt-1">
                        +{service.features.length - 3} more features
                      </p>
                    )}
                  </div>

                  {/* Insurance Coverage */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Covered By:</h4>
                    <div className="flex flex-wrap gap-2">
                      {service.covered.map((coverage, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                        >
                          {coverage}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3">
                    <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
                      Book Now
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </button>
                    <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                      Learn More
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Stethoscope className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No services found
            </h3>
            <p className="text-gray-600">
              Try selecting a different category
            </p>
          </div>
        )}

        {/* Emergency Contact */}
        <div className="mt-16 bg-red-50 rounded-lg p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center">
              <Phone className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Need Immediate Medical Attention?
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Our emergency care team is available 24/7 to assist you
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+6561234567"
              className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors inline-flex items-center justify-center"
            >
              <Phone className="h-5 w-5 mr-2" />
              Call Emergency Line
            </a>
            <button className="border border-red-600 text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors">
              Visit Nearest Clinic
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}