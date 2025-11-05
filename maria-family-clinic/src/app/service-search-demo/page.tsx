'use client'

import React from 'react'
import { ServiceSearchPage, MobileServiceSearch, useAdvancedServiceSearch } from '@/components/service/search'
import { SearchFilters, ClinicSearchResult } from '@/types/search'

// Demo component showing the advanced service search system
export default function ServiceSearchDemo() {
  // Mock search results for demonstration
  const mockResults: ClinicSearchResult[] = [
    {
      id: '1',
      name: 'Singapore General Hospital - Cardiology Centre',
      address: 'Outram Rd, Singapore 169608',
      phone: '+65 6321 4311',
      email: 'cardiology@sgh.com.sg',
      website: 'https://www.sgh.com.sg/cardiology',
      rating: 4.8,
      totalReviews: 1250,
      specialties: ['Cardiology', 'Interventional Cardiology', 'Cardiac Surgery'],
      services: ['Heart Consultation', 'ECG', 'Echocardiogram', 'Cardiac Catheterization'],
      languages: ['English', 'Mandarin', 'Malay'],
      operatingHours: {
        monday: '8:00 AM - 6:00 PM',
        tuesday: '8:00 AM - 6:00 PM',
        wednesday: '8:00 AM - 6:00 PM',
        thursday: '8:00 AM - 6:00 PM',
        friday: '8:00 AM - 6:00 PM',
        saturday: '8:00 AM - 2:00 PM',
        sunday: 'Closed'
      },
      clinicType: 'polyclinic',
      accessibilityFeatures: ['wheelchair_accessible', 'parking', 'elevator'],
      insuranceAccepted: ['medisave', 'medishield', 'private_insurance'],
      waitTime: '15-30 minutes',
      doctorCount: 12,
      isHealthierSgPartner: true,
      distance: 2.3,
      isOpen: true,
      patientTypes: ['adult', 'geriatric']
    },
    {
      id: '2',
      name: 'National University Hospital - Children\'s Medical Centre',
      address: '5 Lower Kent Ridge Rd, Singapore 119074',
      phone: '+65 6779 5555',
      email: 'pediatrics@nuh.com.sg',
      rating: 4.6,
      totalReviews: 890,
      specialties: ['Pediatrics', 'Pediatric Emergency', 'Neonatology'],
      services: ['Child Consultation', 'Vaccinations', 'Growth Monitoring', 'Pediatric Emergency'],
      languages: ['English', 'Mandarin', 'Malay', 'Tamil'],
      operatingHours: {
        monday: '24 Hours',
        tuesday: '24 Hours',
        wednesday: '24 Hours',
        thursday: '24 Hours',
        friday: '24 Hours',
        saturday: '24 Hours',
        sunday: '24 Hours'
      },
      clinicType: 'hospital_linked',
      insuranceAccepted: ['medisave', 'medishield', 'private_insurance'],
      waitTime: '30-60 minutes',
      doctorCount: 25,
      distance: 4.1,
      isOpen: true,
      patientTypes: ['pediatric']
    },
    {
      id: '3',
      name: 'Mount Elizabeth Hospital - Specialist Centre',
      address: '3 Mount Elizabeth, Singapore 228510',
      phone: '+65 6737 2666',
      rating: 4.7,
      totalReviews: 654,
      specialties: ['Dermatology', 'Plastic Surgery', 'Ophthalmology'],
      services: ['Skin Treatment', 'Cosmetic Surgery', 'Eye Surgery', 'Laser Treatment'],
      languages: ['English', 'Mandarin', 'Japanese', 'Korean'],
      operatingHours: {
        monday: '8:00 AM - 7:00 PM',
        tuesday: '8:00 AM - 7:00 PM',
        wednesday: '8:00 AM - 7:00 PM',
        thursday: '8:00 AM - 7:00 PM',
        friday: '8:00 AM - 7:00 PM',
        saturday: '8:00 AM - 5:00 PM',
        sunday: '9:00 AM - 1:00 PM'
      },
      clinicType: 'specialist_clinic',
      insuranceAccepted: ['private_insurance', 'cash_only'],
      waitTime: '20-45 minutes',
      doctorCount: 8,
      distance: 1.8,
      isOpen: true,
      patientTypes: ['adult', 'womens_health']
    },
    {
      id: '4',
      name: 'Tan Tock Seng Hospital - Emergency Department',
      address: '11 Jln Tan Tock Seng, Singapore 308433',
      phone: '+65 6357 7000',
      rating: 4.4,
      totalReviews: 2100,
      specialties: ['Emergency Medicine', 'Trauma Care', 'Acute Care'],
      services: ['Emergency Care', 'Trauma Treatment', 'Ambulance Services', 'Critical Care'],
      operatingHours: {
        monday: '24 Hours',
        tuesday: '24 Hours',
        wednesday: '24 Hours',
        thursday: '24 Hours',
        friday: '24 Hours',
        saturday: '24 Hours',
        sunday: '24 Hours'
      },
      clinicType: 'polyclinic',
      insuranceAccepted: ['medisave', 'medishield', 'private_insurance'],
      waitTime: '2-4 hours (triage by urgency)',
      doctorCount: 45,
      distance: 3.2,
      isOpen: true,
      patientTypes: ['adult', 'pediatric', 'geriatric']
    },
    {
      id: '5',
      name: 'Thomson ParentChild Clinic',
      address: '339 Thomson Rd, Singapore 307677',
      phone: '+65 6358 0638',
      rating: 4.9,
      totalReviews: 320,
      specialties: ['Pediatrics', 'Developmental Medicine'],
      services: ['Child Health', 'Developmental Assessment', 'Vaccination', 'Parenting Support'],
      languages: ['English', 'Mandarin', 'Cantonese'],
      operatingHours: {
        monday: '8:30 AM - 6:00 PM',
        tuesday: '8:30 AM - 6:00 PM',
        wednesday: '8:30 AM - 6:00 PM',
        thursday: '8:30 AM - 6:00 PM',
        friday: '8:30 AM - 6:00 PM',
        saturday: '9:00 AM - 1:00 PM',
        sunday: 'Closed'
      },
      clinicType: 'private',
      insuranceAccepted: ['private_insurance', 'cash_only'],
      waitTime: '10-20 minutes',
      doctorCount: 3,
      distance: 1.5,
      isOpen: true,
      patientTypes: ['pediatric']
    }
  ]

  // Handle search
  const handleSearch = (query: string, filters: SearchFilters) => {
    console.log('Search query:', query)
    console.log('Applied filters:', filters)
    // In a real app, this would trigger an API call
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Advanced Medical Service Search
            </h1>
            <p className="text-gray-600">
              Intelligent search with medical term recognition, voice input, and multi-dimensional filtering
            </p>
          </div>
        </div>
      </div>

      {/* Demo Features Banner */}
      <div className="bg-blue-50 border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
              <span className="font-medium text-blue-800">Medical Term Recognition</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-600 rounded-full"></span>
              <span className="font-medium text-green-800">Voice Search</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
              <span className="font-medium text-purple-800">Smart Filtering</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-orange-600 rounded-full"></span>
              <span className="font-medium text-orange-800">Real-time Ranking</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-red-600 rounded-full"></span>
              <span className="font-medium text-red-800">Saved Searches</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Search Interface */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <ServiceSearchPage
          onSearch={handleSearch}
          results={mockResults}
          isLoading={false}
        />
      </div>

      {/* Mobile Demo Section */}
      <div className="lg:hidden mt-12 border-t pt-8">
        <div className="max-w-md mx-auto px-4">
          <h2 className="text-xl font-semibold mb-4 text-center">Mobile Experience</h2>
          <p className="text-gray-600 text-center mb-6">
            Optimized for mobile with bottom sheet filters and touch-friendly interface
          </p>
          <div className="bg-white rounded-lg shadow-lg p-4 border">
            <MobileServiceSearch
              onSearch={handleSearch}
              results={mockResults.slice(0, 3)}
              isLoading={false}
            />
          </div>
        </div>
      </div>

      {/* Feature Showcase */}
      <div className="bg-white mt-12 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">System Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Medical Intelligence */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🩺</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Medical Intelligence</h3>
              <p className="text-gray-600 text-sm">
                Recognizes medical terms, symptoms, and specialties to provide intelligent search results
              </p>
            </div>

            {/* Voice Search */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎤</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Voice Search</h3>
              <p className="text-gray-600 text-sm">
                Speech-to-text search with medical term recognition and confidence scoring
              </p>
            </div>

            {/* Multi-dimensional Filtering */}
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Smart Filtering</h3>
              <p className="text-gray-600 text-sm">
                Filter by medical specialty, urgency, patient type, insurance, and more
              </p>
            </div>

            {/* Real-time Ranking */}
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Real-time Ranking</h3>
              <p className="text-gray-600 text-sm">
                Results ranked by medical relevance, proximity, availability, and patient needs
              </p>
            </div>

            {/* Saved Searches */}
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💾</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Saved Searches</h3>
              <p className="text-gray-600 text-sm">
                Save frequently used searches with alerts for new matching services
              </p>
            </div>

            {/* Mobile Optimized */}
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Mobile Optimized</h3>
              <p className="text-gray-600 text-sm">
                Touch-friendly interface with bottom sheet filters and quick access presets
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Example Prompts */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">Try These Search Examples</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold mb-3">🩺 Medical Terms</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div>"heart condition consultation"</div>
                <div>"pediatric fever treatment"</div>
                <div>"skin rash dermatology"</div>
                <div>"chest pain emergency"</div>
                <div>"diabetes endocrinology"</div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold mb-3">🎤 Voice Commands</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div>"Find urgent pediatric care near me"</div>
                <div>"Search for cardiology consultation"</div>
                <div>"Emergency room that's open now"</div>
                <div>"Women's health specialist"</div>
                <div>"Mental health counseling services"</div>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-600 mb-4">
              The system will recognize medical terms, suggest relevant filters, and rank results by medical relevance
            </p>
            <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
              <span className="w-2 h-2 bg-green-600 rounded-full"></span>
              <span>System Ready - Try searching above!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}