"use client"

import { useState, useCallback, useMemo } from "react"
import { APIProvider, Map, AdvancedMarker, InfoWindow } from "@vis.gl/react-google-maps"
import { 
  MapPin, 
  Navigation, 
  Layers, 
  Search, 
  Star, 
  Phone, 
  ChevronRight, 
  ChevronUp,
  ChevronDown,
  X,
  Volume2,
  Accessibility,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { 
  calculateDistance, 
  formatDistance, 
  type LocationCoordinates 
} from "@/lib/utils/geolocation"
import { useHapticFeedback } from "@/hooks/use-haptic-feedback"
import { useVoiceSearch } from "@/hooks/use-voice-search"
import { useSwipeGesture } from "@/hooks/use-swipe-gesture"

// Singapore coordinates
const SINGAPORE_CENTER = { lat: 1.3521, lng: 103.8198 }
const DEFAULT_ZOOM = 12

// Clinic type colors
const CLINIC_COLORS = {
  POLYCLINIC: "#3B82F6", // Blue
  PRIVATE: "#10B981", // Green
  HOSPITAL: "#EF4444", // Red
  SPECIALIST: "#F59E0B", // Amber
  DENTAL: "#8B5CF6", // Purple
} as const

export interface ClinicMapData {
  id: string
  name: string
  latitude: number
  longitude: number
  type: keyof typeof CLINIC_COLORS
  rating: number
  totalReviews: number
  phoneNumber: string | null
  services: string[]
  address: string
  isOpen?: boolean
  distance?: number
}

interface MobileClinicMapProps {
  clinics: ClinicMapData[]
  userLocation?: LocationCoordinates | null
  onClinicSelect?: (clinicId: string) => void
  onBoundsChange?: (bounds: google.maps.LatLngBounds) => void
  className?: string
  height?: string
}

// Bottom Sheet Modal
interface ClinicDetailModalProps {
  clinic: ClinicMapData
  isOpen: boolean
  onClose: () => void
  onGetDirections: () => void
  onCallClinic: () => void
  onBookAppointment: () => void
}

function ClinicDetailModal({
  clinic,
  isOpen,
  onClose,
  onGetDirections,
  onCallClinic,
  onBookAppointment,
}: ClinicDetailModalProps) {
  const { triggerHaptic } = useHapticFeedback()
  const [dragY, setDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [sheetHeight, setSheetHeight] = useState(0)

  const swipeHandlers = useSwipeGesture({
    onSwipeUp: () => {
      triggerHaptic("light")
      setSheetHeight(100)
    },
    onSwipeDown: () => {
      triggerHaptic("medium")
      onClose()
    },
  }, 30)

  const handleDragStart = useCallback((e: React.TouchEvent) => {
    if (!e.touches[0]) return
    setIsDragging(true)
    setDragY(e.touches[0].clientY)
  }, [])

  const handleDragMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || !e.touches[0]) return
    const deltaY = e.touches[0].clientY - dragY
    if (deltaY > 0) {
      // Prevent default scrolling
      e.preventDefault()
      const newHeight = Math.max(0, Math.min(100, deltaY))
      setSheetHeight(newHeight)
    }
  }, [isDragging, dragY])

  const handleDragEnd = useCallback(() => {
    if (sheetHeight > 50) {
      triggerHaptic("medium")
      onClose()
    } else {
      triggerHaptic("light")
      setSheetHeight(0)
    }
    setIsDragging(false)
  }, [sheetHeight, onClose, triggerHaptic])

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm sm:hidden"
      onClick={onClose}
      aria-hidden={!isOpen}
      aria-label="Close clinic details"
    >
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl transition-transform duration-300 ease-out",
          "transform-gpu",
          sheetHeight > 0 && `translate-y-[${sheetHeight}%]`
        )}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="clinic-modal-title"
        aria-describedby="clinic-modal-description"
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
        {/* Drag Handle */}
        <div className="flex justify-center py-3">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Content */}
        <div className="px-4 pb-6 max-h-[80vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <h2 
                id="clinic-modal-title"
                className="text-xl font-semibold text-gray-900 leading-tight"
              >
                {clinic.name}
              </h2>
              <p 
                id="clinic-modal-description"
                className="mt-1 text-sm text-gray-600"
              >
                {clinic.address}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <Badge 
                  variant={clinic.isOpen ? "default" : "secondary"}
                  className="text-xs"
                >
                  {clinic.isOpen ? "Open Now" : "Closed"}
                </Badge>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium text-gray-900">{clinic.rating.toFixed(1)}</span>
                  <span className="text-sm text-gray-500">({clinic.totalReviews})</span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="min-w-[44px] min-h-[44px] -mt-2"
              aria-label="Close details"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <Button
              onClick={onCallClinic}
              className="flex flex-col gap-2 py-4 min-h-[80px]"
              disabled={!clinic.phoneNumber}
            >
              <Phone className="h-6 w-6" />
              <span className="text-xs">Call</span>
            </Button>
            <Button
              variant="outline"
              onClick={onGetDirections}
              className="flex flex-col gap-2 py-4 min-h-[80px]"
            >
              <Navigation className="h-6 w-6" />
              <span className="text-xs">Directions</span>
            </Button>
            <Button
              variant="outline"
              onClick={onBookAppointment}
              className="flex flex-col gap-2 py-4 min-h-[80px]"
            >
              <ChevronRight className="h-6 w-6" />
              <span className="text-xs">Book</span>
            </Button>
          </div>

          {/* Details */}
          <div className="space-y-4">
            {/* Distance */}
            {clinic.distance !== undefined && (
              <div className="flex items-center gap-2 text-sm">
                <Navigation className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">
                  {formatDistance(clinic.distance)} away
                </span>
              </div>
            )}

            {/* Services */}
            {clinic.services.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Services</h3>
                <div className="flex flex-wrap gap-2">
                  {clinic.services.map((service) => (
                    <Badge key={service} variant="outline" className="text-xs">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Accessibility Info */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <Accessibility className="h-4 w-4" />
                Accessibility
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Wheelchair accessible entrance</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Accessible parking available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Elevator access to all floors</span>
                </div>
              </div>
            </div>
          </div>

          {/* Full-width Action Button */}
          <Button
            onClick={onBookAppointment}
            className="w-full mt-6 min-h-[48px] text-lg"
          >
            Book Appointment
          </Button>
        </div>
      </div>
    </div>
  )
}

// Custom Marker Component
function ClinicMarker({
  clinic,
  selected,
  onClick,
}: {
  clinic: ClinicMapData
  selected: boolean
  onClick: () => void
}) {
  const { triggerHaptic } = useHapticFeedback()
  const color = CLINIC_COLORS[clinic.type] || CLINIC_COLORS.PRIVATE

  const handleClick = () => {
    triggerHaptic("light")
    onClick()
  }

  return (
    <AdvancedMarker
      position={{ lat: clinic.latitude, lng: clinic.longitude }}
      onClick={handleClick}
      title={clinic.name}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-full border-2 border-white shadow-lg transition-all touch-manipulation",
          "active:scale-90 active:shadow-md",
          selected && "scale-125 ring-2 ring-offset-2",
        )}
        style={{
          backgroundColor: color,
          width: selected ? "44px" : "36px",
          height: selected ? "44px" : "36px",
        }}
        role="button"
        aria-label={`${clinic.name} - ${clinic.rating} stars`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            handleClick()
          }
        }}
      >
        <MapPin className="h-6 w-6 text-white" />
      </div>
    </AdvancedMarker>
  )
}

// Map Controls Component
function MapControls({
  mapType,
  onMapTypeChange,
  onRecenter,
  onSearchArea,
  showSearchArea,
}: {
  mapType: "roadmap" | "satellite"
  onMapTypeChange: (type: "roadmap" | "satellite") => void
  onRecenter: () => void
  onSearchArea: () => void
  showSearchArea: boolean
}) {
  const { triggerHaptic } = useHapticFeedback()
  const { startListening, isListening } = useVoiceSearch({
    language: "en-SG",
    onResult: (text) => {
      console.log("Voice search:", text)
    },
  })

  return (
    <div className="absolute left-1/2 top-4 z-10 flex -translate-x-1/2 gap-2">
      {showSearchArea && (
        <Button
          onClick={() => {
            triggerHaptic("medium")
            onSearchArea()
          }}
          size="sm"
          className="shadow-lg min-h-[44px] touch-manipulation"
          variant="default"
        >
          <Search className="mr-2 h-4 w-4" />
          Search This Area
        </Button>
      )}

      <div className="flex gap-2 rounded-lg bg-white p-1 shadow-lg">
        <Button
          onClick={() => {
            triggerHaptic("light")
            onRecenter()
          }}
          size="sm"
          variant="ghost"
          className="min-w-[44px] min-h-[44px] touch-manipulation"
          title="Return to current location"
          aria-label="Return to current location"
        >
          <Navigation className="h-4 w-4" />
        </Button>

        <Button
          onClick={() => {
            triggerHaptic("light")
            onMapTypeChange(mapType === "roadmap" ? "satellite" : "roadmap")
          }}
          size="sm"
          variant="ghost"
          className="min-w-[44px] min-h-[44px] touch-manipulation"
          title="Toggle map type"
          aria-label="Toggle map type"
        >
          <Layers className="h-4 w-4" />
        </Button>

        <Button
          onClick={() => {
            triggerHaptic("light")
            startListening()
          }}
          size="sm"
          variant="ghost"
          className={cn(
            "min-w-[44px] min-h-[44px] touch-manipulation",
            isListening && "text-blue-600 bg-blue-50"
          )}
          title="Voice search"
          aria-label="Voice search"
        >
          <Volume2 className={cn("h-4 w-4", isListening && "animate-pulse")} />
        </Button>
      </div>
    </div>
  )
}

// Clustering algorithm
function clusterMarkers(
  clinics: ClinicMapData[],
  zoom: number,
  bounds: google.maps.LatLngBounds | null,
): { clusters: MarkerCluster[]; singles: ClinicMapData[] } {
  if (!bounds || zoom >= 15) {
    return { clusters: [], singles: clinics }
  }

  const CLUSTER_RADIUS = 50 / Math.pow(2, zoom - 10)
  const clusters: MarkerCluster[] = []
  const singles: ClinicMapData[] = []
  const processed = new Set<string>()

  clinics.forEach((clinic) => {
    if (processed.has(clinic.id)) return

    const nearbyClinicIds = clinics
      .filter((other) => {
        if (processed.has(other.id) || clinic.id === other.id) return false
        const distance = calculateDistance(
          clinic.latitude,
          clinic.longitude,
          other.latitude,
          other.longitude,
        )
        return distance < CLUSTER_RADIUS
      })
      .map((c) => c.id)

    if (nearbyClinicIds.length > 0) {
      const clusterClinics = [clinic, ...clinics.filter((c) => nearbyClinicIds.includes(c.id))]

      const avgLat = clusterClinics.reduce((sum, c) => sum + c.latitude, 0) / clusterClinics.length
      const avgLng = clusterClinics.reduce((sum, c) => sum + c.longitude, 0) / clusterClinics.length

      clusters.push({
        position: { lat: avgLat, lng: avgLng },
        clinics: clusterClinics,
      })

      clusterClinics.forEach((c) => processed.add(c.id))
    } else {
      singles.push(clinic)
      processed.add(clinic.id)
    }
  })

  return { clusters, singles }
}

interface MarkerCluster {
  position: google.maps.LatLngLiteral
  clinics: ClinicMapData[]
}

export function MobileClinicMap({
  clinics,
  userLocation,
  onClinicSelect,
  onBoundsChange,
  className,
  height = "100vh",
}: MobileClinicMapProps) {
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null)
  const [mapType, setMapType] = useState<"roadmap" | "satellite">("roadmap")
  const [currentZoom, setCurrentZoom] = useState(DEFAULT_ZOOM)
  const [currentBounds, setCurrentBounds] = useState<google.maps.LatLngBounds | null>(null)
  const [showSearchAreaButton, setShowSearchAreaButton] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    return (
      <div 
        className={cn("flex items-center justify-center rounded-lg border bg-gray-50", className)} 
        style={{ height }}
        role="alert"
        aria-label="Google Maps API key not configured"
      >
        <div className="text-center">
          <MapPin className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">Google Maps API key not configured</p>
        </div>
      </div>
    )
  }

  // Calculate center point
  const center = useMemo(() => {
    if (userLocation) {
      return { lat: userLocation.latitude, lng: userLocation.longitude }
    }
    return SINGAPORE_CENTER
  }, [userLocation])

  // Add distance to clinics
  const clinicsWithDistance = useMemo(() => {
    if (!userLocation) return clinics

    return clinics.map((clinic) => ({
      ...clinic,
      distance: calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        clinic.latitude,
        clinic.longitude,
      ),
    }))
  }, [clinics, userLocation])

  // Cluster markers
  const { clusters, singles } = useMemo(() => {
    return clusterMarkers(clinicsWithDistance, currentZoom, currentBounds)
  }, [clinicsWithDistance, currentZoom, currentBounds])

  const selectedClinic = clinicsWithDistance.find((c) => c.id === selectedClinicId)

  const handleMarkerClick = (clinicId: string) => {
    setSelectedClinicId(clinicId)
    onClinicSelect?.(clinicId)
  }

  const handleClusterClick = (_cluster: MarkerCluster) => {
    setCurrentZoom((prev) => Math.min(prev + 2, 18))
  }

  const handleRecenter = () => {
    setCurrentZoom(DEFAULT_ZOOM)
    setShowSearchAreaButton(false)
  }

  const handleSearchArea = () => {
    if (currentBounds) {
      onBoundsChange?.(currentBounds)
      setShowSearchAreaButton(false)
    }
  }

  const handleShowModal = () => {
    if (selectedClinic) {
      setShowModal(true)
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedClinicId(null)
  }

  const handleGetDirections = () => {
    if (!selectedClinic) return
    const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedClinic.latitude},${selectedClinic.longitude}`
    window.open(url, "_blank")
  }

  const handleCallClinic = () => {
    if (!selectedClinic?.phoneNumber) return
    window.open(`tel:${selectedClinic.phoneNumber}`, "_self")
  }

  const handleBookAppointment = () => {
    if (!selectedClinic) return
    window.location.href = `/clinics/${selectedClinic.id}/book`
  }

  return (
    <APIProvider apiKey={apiKey} region="SG">
      <div 
        className={cn("relative overflow-hidden rounded-lg", className)} 
        style={{ height }}
        role="application"
        aria-label="Interactive clinic map"
      >
        <Map
          defaultCenter={center}
          defaultZoom={DEFAULT_ZOOM}
          mapId="clinic-map"
          mapTypeId={mapType}
          gestureHandling="greedy"
          disableDefaultUI={false} // Keep default UI for better mobile experience
          onZoomChanged={(e) => {
            const map = e.map
            const zoom = map.getZoom()
            if (zoom !== undefined) setCurrentZoom(zoom)
          }}
          onBoundsChanged={(e) => {
            const map = e.map
            const bounds = map.getBounds()
            if (bounds) {
              setCurrentBounds(bounds)
              setShowSearchAreaButton(true)
            }
          }}
          style={{ width: "100%", height: "100%" }}
          aria-describedby="map-instructions"
        >
          {/* User location marker */}
          {userLocation && (
            <AdvancedMarker position={{ lat: userLocation.latitude, lng: userLocation.longitude }}>
              <div 
                className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-blue-500 shadow-lg"
                aria-label="Your location"
              >
                <div className="h-2 w-2 rounded-full bg-white" />
              </div>
            </AdvancedMarker>
          )}

          {/* Cluster markers */}
          {clusters.map((cluster, idx) => 
            cluster.clinics[0] ? (
              <ClinicMarker
                key={`cluster-${idx}`}
                clinic={cluster.clinics[0]}
                selected={false}
                onClick={() => handleClusterClick(cluster)}
              />
            ) : null
          )}

          {/* Individual clinic markers */}
          {singles.map((clinic) => (
            <ClinicMarker
              key={clinic.id}
              clinic={clinic}
              selected={clinic.id === selectedClinicId}
              onClick={() => handleMarkerClick(clinic.id)}
            />
          ))}
        </Map>

        {/* Map controls */}
        <MapControls
          mapType={mapType}
          onMapTypeChange={setMapType}
          onRecenter={handleRecenter}
          onSearchArea={handleSearchArea}
          showSearchArea={showSearchAreaButton}
        />

        {/* Selected Clinic Info */}
        {selectedClinic && (
          <div className="absolute bottom-4 left-4 right-4 rounded-lg bg-white p-4 shadow-lg sm:hidden">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {selectedClinic.name}
                </h3>
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{selectedClinic.rating.toFixed(1)}</span>
                  </div>
                  {selectedClinic.distance && (
                    <span className="text-sm text-gray-600">
                      {formatDistance(selectedClinic.distance)}
                    </span>
                  )}
                </div>
              </div>
              <Button
                onClick={handleShowModal}
                size="sm"
                className="min-w-[44px] min-h-[44px] shrink-0"
                aria-label="View clinic details"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 right-4 hidden lg:block rounded-lg bg-white p-3 shadow-lg">
          <h4 className="mb-2 text-xs font-semibold text-gray-700">Clinic Types</h4>
          <div className="space-y-1">
            {Object.entries(CLINIC_COLORS).map(([type, color]) => (
              <div key={type} className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full border border-white shadow-sm"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-gray-600">
                  {type.charAt(0) + type.slice(1).toLowerCase()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Map Instructions */}
        <div id="map-instructions" className="sr-only">
          Use pinch to zoom, drag to pan, and tap markers to view clinic information
        </div>

        {/* Modal */}
        {selectedClinic && (
          <ClinicDetailModal
            clinic={selectedClinic}
            isOpen={showModal}
            onClose={handleCloseModal}
            onGetDirections={handleGetDirections}
            onCallClinic={handleCallClinic}
            onBookAppointment={handleBookAppointment}
          />
        )}
      </div>
    </APIProvider>
  )
}