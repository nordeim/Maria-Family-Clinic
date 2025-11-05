"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { 
  Search, 
  MapPin, 
  Star, 
  Phone, 
  Navigation, 
  Heart, 
  Filter,
  RefreshCw,
  Volume2,
  Settings,
  Home,
  Calendar,
  User,
  Menu,
  ChevronUp,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { MobileClinicCard } from "@/components/mobile/mobile-clinic-card"
import { MobileClinicMap } from "@/components/mobile/mobile-clinic-map"
import { PullToRefreshContainer } from "@/components/mobile/pull-to-refresh"
import { 
  NavigationButton, 
  MobileNavigation, 
  SafeArea, 
  TouchTarget 
} from "@/components/mobile/mobile-ui"
import { useVoiceSearch } from "@/hooks/use-voice-search"
import { useHapticFeedback } from "@/hooks/use-haptic-feedback"
import { useScreenReader } from "@/components/accessibility/screen-reader"

// Sample clinic data
const sampleClinics = [
  {
    id: "1",
    name: "Singapore General Clinic",
    address: "123 Orchard Road, Singapore 238823",
    phone: "+65 6738 1234",
    hours: "Mon-Fri: 8AM-6PM, Sat: 8AM-1PM",
    rating: 4.5,
    totalReviews: 128,
    distance: "0.5km",
    specialties: ["General Practice", "Health Screening"],
    image: "",
    isOpen: true,
    waitTime: "15 min",
    doctorCount: 8,
    established: 2010,
    isMOHVerified: true,
    hasParking: true,
    isWheelchairAccessible: true,
    acceptsInsurance: true,
  },
  {
    id: "2",
    name: "HealthCare@Orchard",
    address: "456 Orchard Boulevard, Singapore 248694",
    phone: "+65 6738 5678",
    hours: "Mon-Sun: 7AM-10PM",
    rating: 4.8,
    totalReviews: 89,
    distance: "1.2km",
    specialties: ["Family Medicine", "Pediatrics"],
    image: "",
    isOpen: true,
    waitTime: "25 min",
    doctorCount: 12,
    established: 2015,
    isMOHVerified: true,
    hasParking: true,
    isWheelchairAccessible: true,
    acceptsInsurance: true,
  },
  {
    id: "3",
    name: "City Medical Centre",
    address: "789 Bras Basah Complex, Singapore 189561",
    phone: "+65 6338 9012",
    hours: "Mon-Fri: 9AM-5PM",
    rating: 4.2,
    totalReviews: 156,
    distance: "2.1km",
    specialties: ["Cardiology", "Internal Medicine"],
    image: "",
    isOpen: false,
    waitTime: "30 min",
    doctorCount: 15,
    established: 2008,
    isMOHVerified: true,
    hasParking: false,
    isWheelchairAccessible: true,
    acceptsInsurance: false,
  },
]

const mapData = [
  {
    id: "1",
    name: "Singapore General Clinic",
    latitude: 1.3521,
    longitude: 103.8198,
    type: "POLYCLINIC" as const,
    rating: 4.5,
    totalReviews: 128,
    phoneNumber: "+65 6738 1234",
    services: ["General Practice", "Health Screening"],
    address: "123 Orchard Road, Singapore 238823",
    isOpen: true,
    distance: 500,
  },
  {
    id: "2", 
    name: "HealthCare@Orchard",
    latitude: 1.3550,
    longitude: 103.8225,
    type: "PRIVATE" as const,
    rating: 4.8,
    totalReviews: 89,
    phoneNumber: "+65 6738 5678",
    services: ["Family Medicine", "Pediatrics"],
    address: "456 Orchard Boulevard, Singapore 248694",
    isOpen: true,
    distance: 1200,
  },
  {
    id: "3",
    name: "City Medical Centre",
    latitude: 1.3489,
    longitude: 103.8270,
    type: "SPECIALIST" as const,
    rating: 4.2,
    totalReviews: 156,
    phoneNumber: "+65 6338 9012",
    services: ["Cardiology", "Internal Medicine"],
    address: "789 Bras Basah Complex, Singapore 189561",
    isOpen: false,
    distance: 2100,
  },
]

export default function MobileAccessibilityDemo() {
  const [view, setView] = useState<"list" | "map">("list")
  const [clinics, setClinics] = useState(sampleClinics)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<string[]>([])
  const [selectedClinic, setSelectedClinic] = useState<string | null>(null)

  const { triggerHaptic, triggerSuccess, triggerWarning } = useHapticFeedback()
  const { announce } = useScreenReader()

  const {
    isListening,
    transcript,
    isSupported: voiceSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceSearch({
    language: "en-SG",
    onResult: (text, confidence) => {
      setSearchQuery(text)
      triggerSuccess()
      announce(`Voice search result: ${text}`)
    },
    onError: (error) => {
      triggerWarning()
      announce(`Voice search error: ${error}`)
    },
  })

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    triggerHaptic("light")
    announce("Refreshing clinic list")
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Simulate random success/failure
    if (Math.random() > 0.2) {
      setClinics([...clinics])
      announce("Clinic list refreshed successfully")
      triggerSuccess()
    } else {
      setError("Failed to load clinics. Please try again.")
      triggerWarning()
    }
    
    setIsLoading(false)
  }, [clinics, announce, triggerHaptic, triggerSuccess, triggerWarning])

  // Handle voice search
  const handleVoiceSearch = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  // Handle clinic actions
  const handleViewDetails = (clinicId: string) => {
    triggerHaptic("medium")
    announce(`Viewing details for clinic ${clinicId}`)
    setSelectedClinic(clinicId)
  }

  const handleGetDirections = (clinicId: string) => {
    triggerHaptic("medium")
    const clinic = clinics.find(c => c.id === clinicId)
    announce(`Getting directions to ${clinic?.name}`)
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${clinic?.address}`, "_blank")
  }

  const handleBookAppointment = (clinicId: string) => {
    triggerHaptic("medium")
    const clinic = clinics.find(c => c.id === clinicId)
    announce(`Booking appointment at ${clinic?.name}`)
    // Simulate booking
    announce("Booking appointment - feature coming soon")
  }

  const handleCallClinic = (clinicId: string) => {
    triggerHaptic("medium")
    const clinic = clinics.find(c => c.id === clinicId)
    announce(`Calling ${clinic?.name}`)
    window.open(`tel:${clinic?.phone}`, "_self")
  }

  const handleToggleFavorite = (clinicId: string, isFavorite: boolean) => {
    triggerHaptic("light")
    if (isFavorite) {
      setFavorites(prev => [...prev, clinicId])
      announce("Added clinic to favorites")
    } else {
      setFavorites(prev => prev.filter(id => id !== clinicId))
      announce("Removed clinic from favorites")
    }
  }

  // Filter clinics based on search
  const filteredClinics = clinics.filter(clinic =>
    clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    clinic.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <SafeArea className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TouchTarget size="lg">
                <Menu className="h-6 w-6" />
              </TouchTarget>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">My Family Clinic</h1>
                <p className="text-xs text-gray-500">Healthcare at your fingertips</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TouchTarget>
                <Badge variant="secondary" className="text-xs">
                  {filteredClinics.length} clinics
                </Badge>
              </TouchTarget>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-3 relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search clinics, services, doctors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-20 h-12 text-base border-2 focus:border-blue-500"
                aria-label="Search clinics"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                {voiceSupported && (
                  <TouchTarget
                    onClick={handleVoiceSearch}
                    className={cn(
                      "rounded-md p-1.5 transition-colors",
                      isListening && "bg-blue-100 text-blue-600"
                    )}
                    aria-label="Voice search"
                  >
                    <Volume2 className={cn("h-4 w-4", isListening && "animate-pulse")} />
                  </TouchTarget>
                )}
                <TouchTarget
                  onClick={() => triggerHaptic("light")}
                  className="rounded-md p-1.5 hover:bg-gray-100"
                  aria-label="Filter results"
                >
                  <Filter className="h-4 w-4" />
                </TouchTarget>
              </div>
            </div>
            
            {/* Voice Search Result */}
            {transcript && (
              <div className="mt-2 p-2 bg-blue-50 rounded-md border border-blue-200">
                <p className="text-sm text-blue-700 flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  Voice search: "{transcript}"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex border-t border-gray-200">
          <button
            onClick={() => {
              setView("list")
              triggerHaptic("light")
              announce("Switched to list view")
            }}
            className={cn(
              "flex-1 py-3 px-4 text-sm font-medium transition-colors min-h-[44px] touch-manipulation",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset",
              view === "list" 
                ? "text-blue-600 bg-blue-50 border-b-2 border-blue-600" 
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            )}
            aria-pressed={view === "list"}
            aria-label="List view"
          >
            List View
          </button>
          <button
            onClick={() => {
              setView("map")
              triggerHaptic("light")
              announce("Switched to map view")
            }}
            className={cn(
              "flex-1 py-3 px-4 text-sm font-medium transition-colors min-h-[44px] touch-manipulation",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset",
              view === "map" 
                ? "text-blue-600 bg-blue-50 border-b-2 border-blue-600" 
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            )}
            aria-pressed={view === "map"}
            aria-label="Map view"
          >
            Map View
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 pb-20">
        {view === "list" ? (
          <PullToRefreshContainer
            onRefresh={handleRefresh}
            isLoading={isLoading}
            error={error}
            emptyState={
              <div className="text-center py-12">
                <MapPin className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No clinics found</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Try adjusting your search criteria
                </p>
              </div>
            }
          >
            <div className="p-4 space-y-4">
              {filteredClinics.map((clinic) => (
                <MobileClinicCard
                  key={clinic.id}
                  clinic={clinic}
                  onViewDetails={handleViewDetails}
                  onGetDirections={handleGetDirections}
                  onBookAppointment={handleBookAppointment}
                  onCallClinic={handleCallClinic}
                  onToggleFavorite={handleToggleFavorite}
                  isFavorite={favorites.includes(clinic.id)}
                />
              ))}
            </div>
          </PullToRefreshContainer>
        ) : (
          <div className="h-[calc(100vh-140px)]">
            <MobileClinicMap
              clinics={mapData}
              onClinicSelect={(clinicId) => {
                triggerHaptic("light")
                const clinic = clinics.find(c => c.id === clinicId)
                announce(`Selected ${clinic?.name}`)
                setSelectedClinic(clinicId)
              }}
              height="100%"
            />
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNavigation>
        <NavigationButton
          icon={<Home className="h-5 w-5" />}
          label="Home"
          active={true}
        />
        <NavigationButton
          icon={<Search className="h-5 w-5" />}
          label="Search"
          badge={3}
        />
        <NavigationButton
          icon={<Calendar className="h-5 w-5" />}
          label="Appointments"
        />
        <NavigationButton
          icon={<User className="h-5 w-5" />}
          label="Profile"
        />
      </MobileNavigation>

      {/* Demo Information Panel */}
      <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-30">
        <Card className="border-l-4 border-l-blue-500 bg-blue-50/95 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-900 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Mobile-First Demo
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-blue-800 space-y-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3" />
                <span>Swipe clinic cards (left: directions, right: call, up: details)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3" />
                <span>Pull to refresh in list view</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3" />
                <span>Voice search enabled</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3" />
                <span>44px minimum touch targets</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3" />
                <span>Keyboard navigation support</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3" />
                <span>Screen reader announcements</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3" />
                <span>High contrast mode available</span>
              </div>
            </div>
            <p className="text-blue-700 mt-3 pt-2 border-t border-blue-200">
              Test with assistive technologies: 
              <br />• Use Tab key for keyboard navigation
              <br />• Enable screen reader for voice announcements
              <br />• Toggle high contrast in accessibility controls
            </p>
          </CardContent>
        </Card>
      </div>
    </SafeArea>
  )
}