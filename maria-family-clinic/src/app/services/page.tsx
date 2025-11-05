"use client"

import React, { useState, useEffect } from "react"
import { Metadata } from "next"
import { ServiceCatalogNavigation } from "@/components/service/service-catalog-navigation"
import { ServiceComparisonTool } from "@/components/service/service-comparison-tool"
import { ServicesNearMe } from "@/components/service/services-near-me"
import { MedicalSearchAutocomplete } from "@/components/search/medical-search-autocomplete"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Grid, List, MapPin, TrendingUp, Star } from "lucide-react"
import { Service } from "@/components/healthcare/service-card"

interface ServiceCategory {
  id: string
  name: string
  icon: string
  color: string
  description: string
  subcategories?: ServiceCategory[]
  services?: Service[]
}

// Mock data - replace with actual API calls
const mockCategories: ServiceCategory[] = [
  {
    id: "general",
    name: "General Practice",
    icon: "🏥",
    color: "bg-green-50 text-green-700",
    description: "Primary healthcare and routine checkups",
    services: [
      {
        id: "1",
        name: "Annual Health Checkup",
        description: "Comprehensive health screening and wellness assessment",
        category: "General",
        duration: "60-90 minutes",
        price: "S$150-200",
        popular: true,
        available: true
      },
      {
        id: "2", 
        name: "General Consultation",
        description: "Regular doctor consultation for common health issues",
        category: "General",
        duration: "20-30 minutes",
        price: "S$50-80",
        available: true
      }
    ]
  },
  {
    id: "specialist",
    name: "Specialist Services",
    icon: "🩺",
    color: "bg-blue-50 text-blue-700",
    description: "Specialized medical care and treatments",
    subcategories: [
      {
        id: "cardiology",
        name: "Cardiology",
        icon: "❤️",
        color: "bg-red-50 text-red-700",
        description: "Heart and cardiovascular care",
        services: [
          {
            id: "3",
            name: "Cardiac Consultation",
            description: "Heart health evaluation and treatment planning",
            category: "Cardiology",
            duration: "45 minutes",
            price: "S$150-250",
            available: true
          },
          {
            id: "4",
            name: "ECG Test",
            description: "Electrocardiogram for heart rhythm analysis",
            category: "Cardiology",
            duration: "15 minutes",
            price: "S$80-120",
            available: true
          }
        ]
      },
      {
        id: "dermatology", 
        name: "Dermatology",
        icon: "🩺",
        color: "bg-orange-50 text-orange-700",
        description: "Skin health and dermatological treatments",
        services: [
          {
            id: "5",
            name: "Skin Consultation",
            description: "Comprehensive skin health evaluation",
            category: "Dermatology", 
            duration: "30 minutes",
            price: "S$100-180",
            available: true
          }
        ]
      }
    ]
  },
  {
    id: "diagnostics",
    name: "Diagnostics",
    icon: "🔬",
    color: "bg-purple-50 text-purple-700",
    description: "Medical imaging and laboratory tests",
    services: [
      {
        id: "6",
        name: "Blood Test",
        description: "Comprehensive blood panel analysis",
        category: "Diagnostics",
        duration: "10 minutes",
        price: "S$60-100",
        available: true
      },
      {
        id: "7",
        name: "X-Ray",
        description: "Digital radiography for bone and tissue imaging",
        category: "Diagnostics",
        duration: "15 minutes",
        price: "S$80-150",
        available: true
      }
    ]
  }
]

const mockAllServices: Service[] = [
  // General Practice
  {
    id: "1",
    name: "Annual Health Checkup",
    description: "Comprehensive health screening and wellness assessment",
    category: "General",
    duration: "60-90 minutes",
    price: "S$150-200",
    popular: true,
    featured: true,
    available: true
  },
  {
    id: "2",
    name: "General Consultation", 
    description: "Regular doctor consultation for common health issues",
    category: "General",
    duration: "20-30 minutes",
    price: "S$50-80",
    available: true
  },
  // Cardiology
  {
    id: "3",
    name: "Cardiac Consultation",
    description: "Heart health evaluation and treatment planning",
    category: "Cardiology",
    duration: "45 minutes",
    price: "S$150-250",
    popular: true,
    available: true
  },
  {
    id: "4", 
    name: "ECG Test",
    description: "Electrocardiogram for heart rhythm analysis",
    category: "Cardiology",
    duration: "15 minutes",
    price: "S$80-120",
    available: true
  },
  // Dermatology
  {
    id: "5",
    name: "Skin Consultation",
    description: "Comprehensive skin health evaluation",
    category: "Dermatology",
    duration: "30 minutes",
    price: "S$100-180",
    available: true
  },
  // Diagnostics
  {
    id: "6",
    name: "Blood Test",
    description: "Comprehensive blood panel analysis", 
    category: "Diagnostics",
    duration: "10 minutes",
    price: "S$60-100",
    featured: true,
    available: true
  },
  {
    id: "7",
    name: "X-Ray",
    description: "Digital radiography for bone and tissue imaging",
    category: "Diagnostics",
    duration: "15 minutes",
    price: "S$80-150",
    available: true
  }
]

// Mock clinic data for "Services Near Me"
const mockClinics = [
  {
    id: "clinic-1",
    name: "Family Health Clinic",
    address: "123 Orchard Road, Singapore 238858",
    coordinates: { lat: 1.3048, lng: 103.8318 },
    phone: "+65 6234 5678",
    website: "https://familyhealth.sg",
    hours: "Mon-Fri 8AM-6PM, Sat 8AM-2PM",
    rating: 4.5,
    distance: 1.2,
    services: mockAllServices.slice(0, 4)
  },
  {
    id: "clinic-2", 
    name: "Wellness Medical Center",
    address: "456 Marina Bay, Singapore 018989",
    coordinates: { lat: 1.2834, lng: 103.8607 },
    phone: "+65 6345 7890",
    hours: "Daily 7AM-10PM",
    rating: 4.8,
    distance: 2.8,
    services: mockAllServices.slice(2, 6)
  },
  {
    id: "clinic-3",
    name: "Heart & Vascular Specialists",
    address: "789 Tanglin Road, Singapore 247964", 
    coordinates: { lat: 1.3067, lng: 103.8278 },
    phone: "+65 6123 4567",
    specialty: "Cardiology",
    hours: "Mon-Fri 9AM-5PM, Sat 9AM-1PM",
    rating: 4.9,
    distance: 3.5,
    services: mockAllServices.filter(s => s.category === "Cardiology")
  }
]

// Popular and featured services data
const popularServices = mockAllServices.filter(s => s.popular)
const featuredServices = mockAllServices.filter(s => s.featured)
const recentServices = mockAllServices.slice(-3)

export default function ServicesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [showComparison, setShowComparison] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service)
    // Navigate to service detail page
    window.location.href = `/services/${service.id}`
  }

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
  }

  const filteredServices = searchQuery 
    ? mockAllServices.filter(service =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : selectedCategory 
      ? mockAllServices.filter(service => service.category.toLowerCase().includes(selectedCategory.toLowerCase()))
      : mockAllServices

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Healthcare Services
          </h1>
          <p className="text-lg text-gray-600">
            Discover and compare healthcare services across Singapore
          </p>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <MedicalSearchAutocomplete
              value={searchQuery}
              onChange={setSearchQuery}
              onSelect={(suggestion) => {
                console.log("Selected:", suggestion)
                // Handle suggestion selection
              }}
              placeholder="Search for symptoms, services, or specialists..."
              recentSearches={["Annual checkup", "Blood test", "Cardiology consultation"]}
              popularSearches={["COVID-19 test", "Health screening", "Mental health"]}
            />
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Service Catalog Navigation */}
          <div className="xl:col-span-1">
            <ServiceCatalogNavigation
              categories={mockCategories}
              services={mockAllServices}
              onServiceSelect={handleServiceSelect}
              onCategorySelect={handleCategorySelect}
              selectedCategory={selectedCategory}
              recentServices={recentServices}
              popularServices={popularServices}
              featuredServices={featuredServices}
              userLocation={{ lat: 1.3521, lng: 103.8198 }} // Singapore center
            />
          </div>

          {/* Main Content Area */}
          <div className="xl:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all" className="flex items-center gap-2">
                  <Grid className="h-4 w-4" />
                  All Services
                </TabsTrigger>
                <TabsTrigger value="popular" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Popular
                </TabsTrigger>
                <TabsTrigger value="featured" className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Featured
                </TabsTrigger>
                <TabsTrigger value="nearby" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Nearby
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                <ServiceComparisonTool
                  services={filteredServices}
                  onServiceSelect={handleServiceSelect}
                  maxComparisons={3}
                />
              </TabsContent>

              <TabsContent value="popular" className="mt-6">
                <ServiceComparisonTool
                  services={popularServices}
                  onServiceSelect={handleServiceSelect}
                  maxComparisons={3}
                />
              </TabsContent>

              <TabsContent value="featured" className="mt-6">
                <ServiceComparisonTool
                  services={featuredServices}
                  onServiceSelect={handleServiceSelect}
                  maxComparisons={3}
                />
              </TabsContent>

              <TabsContent value="nearby" className="mt-6">
                <ServicesNearMe
                  clinics={mockClinics}
                  onServiceSelect={handleServiceSelect}
                  onClinicSelect={(clinic) => console.log("Selected clinic:", clinic)}
                  maxDistance={10}
                  userLocation={{ lat: 1.3521, lng: 103.8198 }}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Service Statistics */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-center">
                {mockAllServices.length}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-center">
              <p className="text-sm text-muted-foreground">Total Services</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-center text-green-600">
                {mockAllServices.filter(s => s.available).length}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-center">
              <p className="text-sm text-muted-foreground">Available Now</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-center text-blue-600">
                {mockClinics.length}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-center">
              <p className="text-sm text-muted-foreground">Partner Clinics</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-center text-purple-600">
                {mockCategories.length}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-center">
              <p className="text-sm text-muted-foreground">Categories</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}