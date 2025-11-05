"use client"

import { useState, useEffect, useCallback } from 'react'

interface UserLocation {
  latitude: number
  longitude: number
  accuracy?: number
  timestamp?: number
}

interface UseUserLocationReturn {
  location: UserLocation | null
  error: string | null
  isLoading: boolean
  requestLocation: () => void
  hasPermission: boolean
}

const LOCATION_TIMEOUT = 10000 // 10 seconds
const MINIMUM_ACCURACY = 100 // meters

export function useUserLocation(): UseUserLocationReturn {
  const [location, setLocation] = useState<UserLocation | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasPermission, setHasPermission] = useState(false)

  // Check permission status
  useEffect(() => {
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setHasPermission(result.state === 'granted')
        
        result.onchange = () => {
          setHasPermission(result.state === 'granted')
        }
      })
    } else {
      // Fallback for older browsers
      setHasPermission(true)
    }
  }, [])

  // Request location with timeout and retry logic
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser')
      return
    }

    setIsLoading(true)
    setError(null)

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: LOCATION_TIMEOUT,
      maximumAge: 5 * 60 * 1000, // 5 minutes cache
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords
        
        // Validate accuracy
        if (accuracy && accuracy > MINIMUM_ACCURACY) {
          setError(`Location accuracy is poor (${Math.round(accuracy)}m). Please try again.`)
          setIsLoading(false)
          return
        }

        const locationData: UserLocation = {
          latitude,
          longitude,
          accuracy,
          timestamp: position.timestamp,
        }

        setLocation(locationData)
        setIsLoading(false)
        setError(null)

        // Cache location in localStorage for offline use
        try {
          localStorage.setItem('user_location', JSON.stringify(locationData))
        } catch (e) {
          // Storage might be disabled
          console.warn('Could not cache location:', e)
        }
      },
      (positionError) => {
        let errorMessage = 'Unable to retrieve your location'
        
        switch (positionError.code) {
          case positionError.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location services and refresh the page.'
            break
          case positionError.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable. Please try again.'
            break
          case positionError.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.'
            break
        }
        
        setError(errorMessage)
        setIsLoading(false)
      },
      options
    )
  }, [])

  // Load cached location on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem('user_location')
      if (cached) {
        const locationData = JSON.parse(cached) as UserLocation
        
        // Check if cached location is recent (within 30 minutes)
        const now = Date.now()
        const thirtyMinutes = 30 * 60 * 1000
        
        if (!locationData.timestamp || (now - locationData.timestamp) < thirtyMinutes) {
          setLocation(locationData)
        }
      }
    } catch (e) {
      console.warn('Could not load cached location:', e)
    }
  }, [])

  // Watch position changes when location is obtained
  useEffect(() => {
    if (!location || !navigator.geolocation) return

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords
        
        // Only update if accuracy is better or significantly different
        const distance = calculateDistance(
          location.latitude,
          location.longitude,
          latitude,
          longitude
        )
        
        if (distance > 50 || (accuracy && location.accuracy && accuracy < location.accuracy)) {
          setLocation({
            latitude,
            longitude,
            accuracy,
            timestamp: position.timestamp,
          })
          
          // Update cache
          try {
            localStorage.setItem('user_location', JSON.stringify({
              latitude,
              longitude,
              accuracy,
              timestamp: position.timestamp,
            }))
          } catch (e) {
            console.warn('Could not cache updated location:', e)
          }
        }
      },
      (error) => {
        console.warn('Position watch error:', error)
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 60000,
      }
    )

    return () => {
      navigator.geolocation.clearWatch(watchId)
    }
  }, [location])

  return {
    location,
    error,
    isLoading,
    requestLocation,
    hasPermission,
  }
}

// Helper function to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}