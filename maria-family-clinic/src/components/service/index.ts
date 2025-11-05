// Service-Clinic Integration System Exports
// This file exports all integration components and hooks for easy importing

// Main Integration Components
export { ServiceClinicIntegrationSystem } from './service-clinic-integration-system'
export { MobileServiceClinicIntegration } from './mobile-service-clinic-integration'

// Enhanced Components
export { ServiceAvailabilityMatrix } from './service-availability-matrix'
export { ServicePackagesBundle } from './service-packages-bundle'
export { ServiceReferralWorkflow } from './service-referral-workflow'
export { ServiceExpertiseIndicators } from './service-expertise-indicators'

// React Query Hooks
export * from '@/hooks/use-service-clinic-integration'

// Integration Types
export interface ServiceClinicFilters {
  location?: {
    latitude: number
    longitude: number
    radius?: number // in km
  }
  insuranceAccepted?: string[]
  chasTier?: string[]
  availability?: 'AVAILABLE' | 'LIMITED' | 'WAITLIST' | 'UNAVAILABLE'
  rating?: number
  priceRange?: {
    min: number
    max: number
  }
  urgencyLevel?: 'ROUTINE' | 'URGENT' | 'SAME_DAY' | 'EMERGENCY'
  expertiseLevel?: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT' | 'PIONEER'
  dateRange?: {
    start: string
    end: string
  }
}

export interface AvailabilityMatrix {
  serviceId: string
  serviceName: string
  clinics: {
    id: string
    name: string
    distance: string
    rating: number
    reviewCount: number
    availability: {
      status: 'AVAILABLE' | 'LIMITED' | 'WAITLIST' | 'UNAVAILABLE'
      nextAvailable?: string
      availableSlots?: {
        date: string
        time: string
        isAvailable: boolean
      }[]
    }
    pricing: {
      originalPrice?: number
      finalPrice: number
      currency: string
      discounts?: {
        type: string
        amount: number
      }[]
    }
    insurance?: {
      medisave: boolean
      medishield: boolean
      chas: boolean
      healthierSG: boolean
    }
  }[]
  lastUpdated: string
}

export interface ServicePackage {
  id: string
  name: string
  description: string
  packageType: 'BUNDLE' | 'MEMBERSHIP' | 'SEASONAL' | 'CORPORATE' | 'FAMILY' | 'DISCOUNT'
  originalPrice?: number
  packagePrice: number
  discountAmount?: number
  discountPercent?: number
  validityPeriod?: number
  maxUsage?: number
  isActive: boolean
  items: {
    serviceId: string
    serviceName: string
    includedSessions: number
    isOptional: boolean
  }[]
  clinicId?: string
  rating?: number
  totalBookings: number
  tags: string[]
}

export interface ServiceReferral {
  id: string
  referringClinicId: string
  referringClinicName: string
  referredClinicId: string
  referredClinicName: string
  serviceId: string
  serviceName: string
  patientId?: string
  patientName?: string
  referralType: 'SERVICE_SPECIALIZATION' | 'EQUIPMENT_UNAVAILABLE' | 'URGENT_CARE' | 'SECOND_OPINION' | 'FOLLOW_UP_CARE' | 'DIAGNOSTIC_REFERAL'
  urgencyLevel: 'ROUTINE' | 'URGENT' | 'SAME_DAY' | 'EMERGENCY'
  status: 'PENDING' | 'SENT' | 'RECEIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'REJECTED'
  clinicalNotes?: string
  requestedDate?: string
  preferredDoctor?: string
  specialRequests?: string
  appointmentDate?: string
  followUpRequired: boolean
  createdAt: string
  updatedAt: string
}

export interface ServiceExpertise {
  id: string
  clinicId: string
  clinicName: string
  serviceId: string
  serviceName: string
  expertiseLevel: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT' | 'PIONEER'
  certificationBody?: string
  totalProcedures: number
  successRate?: number
  complicationRate?: number
  patientSatisfaction?: number
  yearsOfExperience: number
  lastPerformed?: string
  subspecialty?: string
  techniquesUsed: string[]
  requiresReferral: boolean
  isActive: boolean
  isVerified: boolean
  certifications: {
    certificationName: string
    certificationBody: string
    issueDate: string
    expiryDate?: string
    isVerified: boolean
  }[]
}

export interface IntegratedBookingData {
  serviceId: string
  serviceName: string
  clinicId: string
  clinicName: string
  doctorId?: string
  appointmentDate: string
  appointmentTime: string
  patientInfo?: {
    name: string
    email: string
    phone: string
    nric?: string
    dateOfBirth?: string
    gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY'
  }
  bookingNotes?: string
  isPackageBooking?: boolean
  packageId?: string
  insuranceInfo?: {
    medisave: boolean
    medishield: boolean
    chas: boolean
    healthierSG: boolean
  }
}

export interface ServiceReview {
  id: string
  serviceId: string
  clinicId: string
  userId: string
  userName: string
  rating: number
  review: string
  isVerified: boolean
  isPublic: boolean
  helpfulVotes: number
  clinicResponse?: string
  respondedAt?: string
  createdAt: string
}

// Integration Configuration
export const INTEGRATION_CONFIG = {
  // Real-time update intervals (in milliseconds)
  REALTIME_INTERVALS: {
    AVAILABILITY_MATRIX: 30000,      // 30 seconds
    CLINIC_AVAILABILITY: 15000,      // 15 seconds
    PACKAGE_DATA: 120000,            // 2 minutes
    EXPERTISE_DATA: 300000,          // 5 minutes
  },

  // Search and filtering defaults
  DEFAULTS: {
    SEARCH_RADIUS: 10,              // 10km radius
    MIN_RATING: 0,                  // No minimum rating filter
    MAX_RESULTS_PER_PAGE: 20,       // Pagination limit
    REFRESH_ON_FOCUS: true,         // Refresh when window regains focus
  },

  // Booking configuration
  BOOKING: {
    MIN_LEAD_TIME: 60,              // Minimum 1 hour before appointment
    MAX_ADVANCE_BOOKING: 90,        // Maximum 90 days in advance
    AUTO_CONFIRM: false,            // Manual confirmation required
    ALLOW_WALK_INS: false,          // No walk-ins for integrated bookings
  },

  // Cache durations (in milliseconds)
  CACHE_DURATIONS: {
    AVAILABILITY: 10000,            // 10 seconds
    PACKAGES: 120000,               // 2 minutes
    EXPERTISE: 300000,              // 5 minutes
    REFERRALS: 60000,               // 1 minute
    REVIEWS: 180000,                // 3 minutes
  },

  // Mobile breakpoints
  MOBILE: {
    MAX_WIDTH: 768,                 // px
    TABLET_WIDTH: 1024,             // px
    DESKTOP_WIDTH: 1280,            // px
  },

  // Error handling
  ERROR_HANDLING: {
    MAX_RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,              // 1 second
    SHOW_ERROR_TOASTS: true,
    LOG_ERRORS: true,
  },
} as const

// Integration utilities
export const IntegrationUtils = {
  // Format price with currency
  formatPrice: (price: number, currency: string = 'SGD'): string => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(price)
  },

  // Calculate distance between two points
  calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  },

  // Format distance for display
  formatDistance: (distance: number): string => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`
    }
    return `${distance.toFixed(1)}km`
  },

  // Get time slot label
  getTimeSlotLabel: (time: string): string => {
    const [hour, minute] = time.split(':').map(Number)
    const period = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`
  },

  // Check if slot is available
  isSlotAvailable: (slot: any): boolean => {
    return slot.isAvailable && !slot.isPending && !slot.isBooked
  },

  // Get availability status color
  getAvailabilityColor: (status: string): string => {
    switch (status) {
      case 'AVAILABLE': return 'text-green-600'
      case 'LIMITED': return 'text-yellow-600'
      case 'WAITLIST': return 'text-orange-600'
      case 'UNAVAILABLE': return 'text-red-600'
      default: return 'text-gray-600'
    }
  },

  // Get expertise level badge variant
  getExpertiseBadgeVariant: (level: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (level) {
      case 'EXPERT':
      case 'PIONEER': return 'default'
      case 'ADVANCED': return 'secondary'
      case 'INTERMEDIATE': return 'outline'
      case 'BASIC': return 'destructive'
      default: return 'outline'
    }
  },
}

// Default export with all integration features
export const ServiceClinicIntegration = {
  // Components
  System: ServiceClinicIntegrationSystem,
  Mobile: MobileServiceClinicIntegration,
  
  // Enhanced components
  AvailabilityMatrix: ServiceAvailabilityMatrix,
  Packages: ServicePackagesBundle,
  Referral: ServiceReferralWorkflow,
  Expertise: ServiceExpertiseIndicators,
  
  // Hooks (re-exported from use-service-clinic-integration)
  hooks: {
    useAvailabilityMatrix: () => import('@/hooks/use-service-clinic-integration').then(m => m.useServiceAvailabilityMatrix),
    useClinicsForService: () => import('@/hooks/use-service-clinic-integration').then(m => m.useClinicsForService),
    usePackages: () => import('@/hooks/use-service-clinic-integration').then(m => m.useServicePackages),
    useCreateReferral: () => import('@/hooks/use-service-clinic-integration').then(m => m.useCreateReferral),
    useExpertise: () => import('@/hooks/use-service-clinic-integration').then(m => m.useClinicExpertise),
    useIntegratedBooking: () => import('@/hooks/use-service-clinic-integration').then(m => m.useIntegratedBooking),
  },
  
  // Utilities
  Utils: IntegrationUtils,
  
  // Configuration
  config: INTEGRATION_CONFIG,
}