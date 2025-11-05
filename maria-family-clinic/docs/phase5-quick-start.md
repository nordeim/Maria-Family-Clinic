# Phase 5: Clinic Search & Discovery - Quick Start Guide

## Current Status
Foundation complete (~40% of full scope). Core search functionality is operational.

## What's Working Now

### 1. Clinic Search Page
**URL:** `/clinics` (when app is running)

**Features:**
- Real-time search by clinic name, area, or postal code
- Automatic location detection with fallback
- Distance-based filtering (1-20km radius)
- Language filtering (7 languages)
- Rating filtering (4+, 4.5+, 5 stars)
- Mobile-responsive filter drawer
- Distance and travel time display

### 2. Location Services
**File:** `src/lib/utils/geolocation.ts`

**Usage:**
```typescript
import { getLocationWithFallback, calculateDistance, formatDistance } from '@/lib/utils/geolocation'

// Get user location with automatic fallback
const location = await getLocationWithFallback()

// Calculate distance between two points
const distance = calculateDistance(lat1, lon1, lat2, lon2)

// Format distance for display
const formatted = formatDistance(distance) // "2.3km" or "500m"
```

## Quick Setup

### 1. Install Dependencies
All dependencies from Phase 4 are sufficient. No additional installations needed.

### 2. Run the Application
```bash
cd /workspace/my-family-clinic
npm run dev
```

### 3. Access Clinic Search
Navigate to: `http://localhost:3000/clinics`

### 4. Test Location Features
- Allow location permission when prompted
- Search for clinics by name (e.g., "clinic", "health")
- Adjust search radius
- Apply language and rating filters

## API Endpoints Available

### Search Clinics
```typescript
const { data } = api.clinic.getAll.useQuery({
  page: 1,
  limit: 20,
  search: "clinic name",
  location: {
    latitude: 1.3521,
    longitude: 103.8198,
    radiusKm: 5,
  },
  languages: ["English", "Mandarin"],
  isActive: true,
  orderBy: "distance",
  orderDirection: "asc",
})
```

### Find Nearby Clinics
```typescript
const { data } = api.clinic.getNearby.useQuery({
  latitude: 1.3521,
  longitude: 103.8198,
  radiusKm: 5,
  limit: 10,
  isActive: true,
})
```

## Next Development Steps

### Priority 1: Google Maps Integration (2 hours)

**Required:**
1. Obtain Google Maps API key
2. Add to environment variables:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
   ```

**Implementation:**
```typescript
// src/components/maps/clinic-map.tsx
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api'

export function ClinicMap({ clinics, center }) {
  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        center={center}
        zoom={13}
        mapContainerStyle={{ width: '100%', height: '500px' }}
      >
        {clinics.map(clinic => (
          <Marker
            key={clinic.id}
            position={{ lat: clinic.latitude, lng: clinic.longitude }}
          />
        ))}
      </GoogleMap>
    </LoadScript>
  )
}
```

**Install Required:**
```bash
npm install @react-google-maps/api
```

### Priority 2: Enhanced Filtering (1.5 hours)

**Add Service Filters:**
```typescript
// Update FilterPanel component
const services = [
  'General Practice',
  'Specialist Consultations',
  'Vaccinations',
  'Health Screenings',
  'Chronic Disease Management',
  'Minor Surgery',
]

// Add to filter state
services: string[]

// Update tRPC query
services: filters.services.length > 0 ? filters.services : undefined
```

**Add Operating Hours Filter:**
```typescript
// Add "Open Now" functionality
const isOpenNow = (operatingHours: any): boolean => {
  const now = new Date()
  const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' })
  const currentTime = now.toLocaleTimeString('en-US', { hour12: false })
  
  // Check if clinic is open based on operating hours
  // Implementation depends on operatingHours data structure
  return true // Placeholder
}

// Add filter
openNow: boolean
```

### Priority 3: Enhanced Clinic Cards (1 hour)

**Add Favorites Functionality:**
```typescript
// src/hooks/use-favorites.ts
import { useState, useEffect } from 'react'

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('favoritesClinics')
    if (stored) {
      setFavorites(JSON.parse(stored))
    }
  }, [])

  const addFavorite = (clinicId: string) => {
    const updated = [...favorites, clinicId]
    setFavorites(updated)
    localStorage.setItem('favoriteClinics', JSON.stringify(updated))
  }

  const removeFavorite = (clinicId: string) => {
    const updated = favorites.filter(id => id !== clinicId)
    setFavorites(updated)
    localStorage.setItem('favoriteClinics', JSON.stringify(updated))
  }

  const isFavorite = (clinicId: string) => favorites.includes(clinicId)

  return { favorites, addFavorite, removeFavorite, isFavorite }
}
```

## Troubleshooting

### Location Not Working
1. Check browser console for permission errors
2. Ensure HTTPS (geolocation requires secure context)
3. Fallback to IP-based location should activate automatically
4. Final fallback uses Singapore center coordinates

### Search Not Returning Results
1. Check if database has clinic data (run seed script)
2. Verify tRPC connection is working
3. Check browser console for API errors
4. Try increasing search radius

### Filters Not Working
1. Check React Query devtools for query parameters
2. Verify filter state is updating correctly
3. Check backend router supports the filter parameter

## Testing Checklist

### Manual Testing
- [ ] Location permission prompt appears
- [ ] Location is detected correctly
- [ ] Search returns relevant results
- [ ] Distance-based filtering works
- [ ] Language filters apply correctly
- [ ] Rating filters apply correctly
- [ ] Mobile filter drawer opens and closes
- [ ] Active filters can be removed
- [ ] Results update in real-time
- [ ] Loading states display correctly
- [ ] Empty state shows when no results

### Browser Testing
- [ ] Chrome (latest)
- [ ] Safari (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Performance Testing
- [ ] Search response < 2 seconds
- [ ] Filter application instant
- [ ] Page load < 3 seconds
- [ ] No layout shift on load

## File Structure

```
src/
├── app/
│   └── (public)/
│       └── clinics/
│           └── page.tsx              # Main search page ✅
├── components/
│   ├── healthcare/
│   │   └── clinic-card.tsx           # From Phase 4 ✅
│   ├── ui/                            # From Phase 4 ✅
│   └── maps/                          # TODO: Create
│       ├── clinic-map.tsx             # Google Maps component
│       ├── clinic-marker.tsx          # Custom markers
│       └── map-controls.tsx           # Map controls
├── hooks/
│   ├── use-debounce.ts                # Debounce hook ✅
│   ├── use-favorites.ts               # TODO: Favorites hook
│   └── use-voice-search.ts            # TODO: Voice search
├── lib/
│   └── utils/
│       ├── geolocation.ts             # Location utilities ✅
│       ├── clinic-utils.ts            # TODO: Clinic utilities
│       └── map-clustering.ts          # TODO: Clustering
└── server/
    └── api/
        └── routers/
            └── clinic.ts              # Backend API ✅
```

## Common Code Patterns

### Using Location in Component
```typescript
import { getLocationWithFallback } from '@/lib/utils/geolocation'

const [userLocation, setUserLocation] = useState<LocationCoordinates | null>(null)

useEffect(() => {
  async function loadLocation() {
    try {
      const result = await getLocationWithFallback()
      setUserLocation(result.coords)
    } catch (error) {
      toast.error('Unable to determine location')
    }
  }
  loadLocation()
}, [])
```

### Using Clinic Query
```typescript
const { data, isLoading } = api.clinic.getAll.useQuery(
  {
    page: 1,
    limit: 20,
    location: userLocation ? {
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      radiusKm: 5,
    } : undefined,
  },
  {
    enabled: !!userLocation,
    staleTime: 5 * 60 * 1000,
  }
)
```

## Resources

### Documentation
- [Phase 5 Implementation Summary](./phase5-implementation-summary.md)
- [Component Library Guide](./component-library.md)
- [Phase 4 Summary](./phase4-implementation-summary.md)

### External APIs
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [ipapi.co Documentation](https://ipapi.co/api/)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

### Related Code
- tRPC Clinic Router: `src/server/api/routers/clinic.ts`
- Database Schema: `prisma/schema.prisma`
- UI Components: `src/components/ui/`
- Healthcare Components: `src/components/healthcare/`

## Support

For questions or issues:
1. Check implementation summary for detailed explanations
2. Review existing code patterns in the codebase
3. Refer to Phase 4 component documentation
4. Check browser console for error messages

---

**Last Updated:** 2025-11-04  
**Status:** Foundation Complete - Ready for Continuation  
**Estimated Remaining:** 3-4 hours
