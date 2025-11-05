"use client"

import React, { useState, useEffect } from "react"
import { MapPin, Navigation, Clock, Star, Phone, Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ServiceCard } from "@/components/healthcare/service-card"
import { useUserLocation } from "@/hooks/use-user-location"
import { Service } from "@/components/healthcare/service-card"

interface Clinic {
  id: string
  name: string
  address: string
  coordinates: {
    lat: number
    lng: number
  }
  phone?: string
  website?: string
  hours?: string
  specialties?: string[]
  distance?: number
  rating?: number
  services: Service[]
}

interface ServicesNearMeProps {
  clinics: Clinic[]
  onServiceSelect: (service: Service) => void
  onClinicSelect?: (clinic: Clinic) => void
  maxDistance?: number
  userLocation?: { lat: number; lng: number }
  autoDetectLocation?: boolean
  className?: string
}

interface DistanceResult {
  clinic: Clinic
  distance: number
  duration: string
}

export function ServicesNearMe({
  clinics,
  onServiceSelect,
  onClinicSelect,
  maxDistance = 50, // km
  userLocation: providedUserLocation,
  autoDetectLocation = true,
  className
}: ServicesNearMeProps) {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(
    providedUserLocation || null
  )
  const [searchRadius, setSearchRadius] = useState(maxDistance)
  const [nearestClinic, setNearestClinic] = useState<Clinic | null>(null)
  const [nearbyClinics, setNearbyClinics] = useState<DistanceResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Auto-detect user location
  const { getCurrentLocation } = useUserLocation()

  useEffect(() => {
    if (autoDetectLocation && !userLocation) {
      detectUserLocation()
    }
  }, [autoDetectLocation, userLocation])

  // Calculate distances when user location changes
  useEffect(() => {
    if (userLocation && clinics.length > 0) {
      calculateDistances()
    }
  }, [userLocation, clinics])

  const detectUserLocation = async () => {
    try {
      setLoading(true)
      const location = await getCurrentLocation()
      setUserLocation(location)
      setError(null)
    } catch (err) {
      setError("Unable to detect your location. Please enable location services or enter your address manually.")
      setLoading(false)
    }
  }

  const calculateDistances = () => {
    if (!userLocation) return

    const results: DistanceResult[] = clinics
      .map(clinic => {
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          clinic.coordinates.lat,
          clinic.coordinates.lng
        )
        return {
          clinic: { ...clinic, distance },
          distance,
          duration: calculateDriveTime(distance)
        }
      })
      .filter(result => result.distance <= searchRadius)
      .sort((a, b) => a.distance - b.distance)

    setNearbyClinics(results)
    if (results.length > 0) {
      setNearestClinic(results[0].clinic)
    }
    setLoading(false)
  }

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  const calculateDriveTime = (distance: number): string => {
    // Assuming average city driving speed of 30 km/h
    const hours = distance / 30
    if (hours < 1) {
      const minutes = Math.round(hours * 60)
      return `${minutes} min drive`
    } else {
      return `${hours.toFixed(1)} hr drive`
    }
  }

  const formatDistance = (distance: number): string => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`
    } else {
      return `${distance.toFixed(1)}km`
    }
  }

  const handleManualAddressSearch = (address: string) => {
    // In a real implementation, this would use a geocoding service
    // For now, we'll simulate location detection
    console.log("Searching for address:", address)
  }

  if (loading) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          <span>Detecting your location...</span>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="text-center space-y-4">
          <div className="text-muted-foreground">
            <Navigation className="h-12 w-12 mx-auto mb-2" />
          </div>
          <div>
            <h3 className="font-semibold mb-2">Location Access Required</h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={detectUserLocation} disabled={loading}>
                <MapPin className="h-4 w-4 mr-2" />
                Enable Location
              </Button>
              <Button variant="outline" onClick={() => setError(null)}>
                Enter Address Manually
              </Button>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  if (!userLocation) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="text-center space-y-4">
          <div className="text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-2" />
          </div>
          <div>
            <h3 className="font-semibold mb-2">Find Services Near You</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Enable location access to find healthcare services in your area
            </p>
            <div className="space-y-2">
              <Button onClick={detectUserLocation} className="w-full">
                <Navigation className="h-4 w-4 mr-2" />
                Enable Location Detection
              </Button>
              <div className="relative">
                <Input
                  placeholder="Enter your address..."
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleManualAddressSearch((e.target as HTMLInputElement).value)
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Location Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Services Near You
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Found {nearbyClinics.length} clinics within {searchRadius}km
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                📍 Your Location
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={detectUserLocation}
            >
              <Navigation className="h-4 w-4 mr-2" />
              Update Location
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm">Radius:</span>
              <select
                value={searchRadius}
                onChange={(e) => setSearchRadius(Number(e.target.value))}
                className="text-sm border rounded px-2 py-1"
              >
                <option value={5}>5km</option>
                <option value={10}>10km</option>
                <option value={25}>25km</option>
                <option value={50}>50km</option>
                <option value={100}>100km</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nearest Clinic Highlight */}
      {nearestClinic && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Nearest Clinic
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{nearestClinic.name}</h3>
                  <p className="text-sm text-muted-foreground">{nearestClinic.address}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <Badge className="bg-green-100 text-green-800">
                      {formatDistance(nearestClinic.distance!)} away
                    </Badge>
                    <Badge variant="outline">
                      {nearestClinic.services.length} services
                    </Badge>
                    {nearestClinic.rating && (
                      <Badge variant="outline">
                        ⭐ {nearestClinic.rating}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {nearestClinic.phone && (
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4 mr-1" />
                      Call
                    </Button>
                  )}
                  {nearestClinic.website && (
                    <Button variant="outline" size="sm">
                      <Globe className="h-4 w-4 mr-1" />
                      Website
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Nearby Services */}
              <div>
                <h4 className="font-medium mb-3">Popular Services</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {nearestClinic.services
                    .filter(service => service.popular || service.available)
                    .slice(0, 4)
                    .map(service => (
                      <ServiceCard
                        key={service.id}
                        service={service}
                        onBookService={() => onServiceSelect(service)}
                        onLearnMore={() => onServiceSelect(service)}
                      />
                    ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Nearby Clinics */}
      {nearbyClinics.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>All Nearby Clinics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {nearbyClinics.slice(1).map(({ clinic, distance, duration }) => (
                <div
                  key={clinic.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer"
                  onClick={() => onClinicSelect?.(clinic)}
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{clinic.name}</h4>
                    <p className="text-sm text-muted-foreground">{clinic.address}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">
                        📍 {formatDistance(distance)} away
                      </Badge>
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        {duration}
                      </Badge>
                      {clinic.rating && (
                        <Badge variant="outline">
                          ⭐ {clinic.rating}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    {clinic.services.length} services
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {nearbyClinics.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No Clinics Found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              No healthcare services found within {searchRadius}km of your location.
            </p>
            <Button onClick={() => setSearchRadius(100)}>
              Expand Search to 100km
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}