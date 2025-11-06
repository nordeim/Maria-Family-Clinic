/**
 * Geolocation Utilities for Singapore Healthcare Platform
 * Provides location services, geocoding, and spatial calculations
 */

export interface LocationCoordinates {
  latitude: number
  longitude: number
  accuracy?: number
}

export interface GeolocationResult {
  coords: LocationCoordinates
  timestamp: number
  error?: string
}

export interface AddressComponents {
  street?: string
  postalCode?: string
  area?: string
  city?: string
  country?: string
}

/**
 * Get user's current location using HTML5 Geolocation API
 */
export async function getCurrentLocation(options?: PositionOptions): Promise<GeolocationResult> {
  if (!('geolocation' in navigator)) {
    throw new Error('Geolocation is not supported by this browser')
  }

  return new Promise((resolve, reject) => {
    const defaultOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000, // 5 minutes
      ...options,
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          },
          timestamp: position.timestamp,
        })
      },
      (error) => {
        let errorMessage = 'Unknown geolocation error'
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied by user'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out'
            break
        }

        reject(new Error(errorMessage))
      },
      defaultOptions
    )
  })
}

/**
 * Get approximate location from IP address (fallback method)
 * Uses ipapi.co service for IP geolocation
 */
export async function getLocationFromIP(): Promise<LocationCoordinates> {
  try {
    const response = await fetch('https://ipapi.co/json/')
    const data = await response.json()
    
    if (data.latitude && data.longitude) {
      return {
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
      }
    }
    
    // Default to Singapore center if IP lookup fails
    return getSingaporeCenter()
  } catch (error) {
    // Fallback to Singapore center
    return getSingaporeCenter()
  }
}

/**
 * Get Singapore's center coordinates
 */
export function getSingaporeCenter(): LocationCoordinates {
  return {
    latitude: 1.3521,
    longitude: 103.8198,
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Radius of Earth in kilometers
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  
  return Math.round(distance * 100) / 100 // Round to 2 decimal places
}

/**
 * Calculate distance in meters (for more precise calculations)
 */
export function calculateDistanceInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  return calculateDistance(lat1, lon1, lat2, lon2) * 1000
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Format distance for display
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`
  }
  return `${distanceKm.toFixed(1)}km`
}

/**
 * Validate Singapore postal code
 */
export function isValidSingaporePostalCode(postalCode: string): boolean {
  return /^[0-9]{6}$/.test(postalCode)
}

/**
 * Format Singapore phone number
 */
export function formatSingaporePhone(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '')
  
  // Check if it starts with country code
  if (digits.startsWith('65')) {
    const number = digits.slice(2)
    return `+65 ${number.slice(0, 4)} ${number.slice(4)}`
  }
  
  // Format local number
  if (digits.length === 8) {
    return `${digits.slice(0, 4)} ${digits.slice(4)}`
  }
  
  return phone
}

/**
 * Get estimated travel time based on distance and mode
 */
export function getEstimatedTravelTime(
  distanceKm: number,
  mode: 'walking' | 'driving' | 'transit' = 'driving'
): number {
  // Average speeds in km/h
  const speeds = {
    walking: 5,
    driving: 40, // Singapore average with traffic
    transit: 30, // Public transport average
  }
  
  const speed = speeds[mode]
  const hours = distanceKm / speed
  const minutes = Math.ceil(hours * 60)
  
  return minutes
}

/**
 * Format travel time for display
 */
export function formatTravelTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (remainingMinutes === 0) {
    return `${hours} hr`
  }
  
  return `${hours} hr ${remainingMinutes} min`
}

/**
 * Check if location is within Singapore bounds
 */
export function isWithinSingapore(latitude: number, longitude: number): boolean {
  // Singapore approximate bounds
  const bounds = {
    north: 1.47,
    south: 1.16,
    east: 104.09,
    west: 103.60,
  }
  
  return (
    latitude >= bounds.south &&
    latitude <= bounds.north &&
    longitude >= bounds.west &&
    longitude <= bounds.east
  )
}

/**
 * Get location with user-friendly error handling
 */
export async function getLocationWithFallback(): Promise<GeolocationResult> {
  try {
    // Try HTML5 Geolocation first
    const location = await getCurrentLocation()
    
    // Verify location is in Singapore
    if (!isWithinSingapore(location.coords.latitude, location.coords.longitude)) {
      // Use Singapore center if user is outside Singapore
      const sgCenter = getSingaporeCenter()
      return {
        coords: sgCenter,
        timestamp: Date.now(),
        error: 'Location detected outside Singapore, using default location',
      }
    }
    
    return location
  } catch (error) {
    // Fallback to IP-based location
    try {
      const coords = await getLocationFromIP()
      return {
        coords,
        timestamp: Date.now(),
        error: 'Using approximate location from IP address',
      }
    } catch {
      // Final fallback to Singapore center
      return {
        coords: getSingaporeCenter(),
        timestamp: Date.now(),
        error: 'Using default Singapore location',
      }
    }
  }
}

/**
 * Request location permission with explanation
 */
export async function requestLocationPermission(): Promise<PermissionState> {
  if (!('permissions' in navigator)) {
    return 'prompt'
  }
  
  try {
    const result = await navigator.permissions.query({ name: 'geolocation' })
    return result.state
  } catch {
    return 'prompt'
  }
}

/**
 * Store last known location in localStorage
 */
export function saveLastKnownLocation(coords: LocationCoordinates): void {
  try {
    localStorage.setItem('lastKnownLocation', JSON.stringify({
      ...coords,
      timestamp: Date.now(),
    }))
  } catch {
    // Silently fail if localStorage is not available
  }
}

/**
 * Get last known location from localStorage
 */
export function getLastKnownLocation(): LocationCoordinates | null {
  try {
    const stored = localStorage.getItem('lastKnownLocation')
    if (!stored) return null
    
    const data = JSON.parse(stored)
    const age = Date.now() - data.timestamp
    
    // Only use if less than 1 hour old
    if (age < 3600000) {
      return {
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: data.accuracy,
      }
    }
  } catch {
    // Silently fail
  }
  
  return null
}
