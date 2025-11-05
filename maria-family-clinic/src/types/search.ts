export interface SearchFilters {
  query?: string
  services?: MedicalSpecialty[]
  serviceTypes?: ServiceType[]
  urgency?: UrgencyLevel[]
  duration?: ServiceDuration[]
  complexity?: ComplexityLevel[]
  patientTypes?: PatientType[]
  languages?: string[]
  operatingHours?: OperatingHoursFilter[]
  clinicTypes?: ClinicType[]
  accessibilityFeatures?: AccessibilityFeature[]
  rating?: RatingFilter
  insurance?: InsuranceType[]
  location?: {
    latitude: number
    longitude: number
    radiusKm: number
  }
  // Advanced search features
  medicalTerms?: string[]
  synonyms?: boolean
  rankingBy?: RankingCriteria[]
}

export type OperatingHoursFilter = 
  | 'open_now'
  | 'weekend'
  | 'late_night'
  | '24_hour'
  | 'sunday'
  | 'holiday'

export type ClinicType = 
  | 'polyclinic'
  | 'private'
  | 'hospital_linked'
  | 'family_clinic'
  | 'specialist_clinic'

export type AccessibilityFeature = 
  | 'wheelchair_accessible'
  | 'hearing_loop'
  | 'parking'
  | 'elevator'
  | 'wide_aisles'

export type RatingFilter = 
  | '4_plus'
  | '4_5_plus'
  | '5_stars'

export type InsuranceType = 
  | 'medisave'
  | 'medishield'
  | 'private_insurance'
  | 'cash_only'

// Advanced search types
export type ServiceType = 
  | 'consultation'
  | 'procedure'
  | 'screening'
  | 'vaccination'
  | 'therapy'
  | 'diagnostic'
  | 'treatment'
  | 'surgery'

export type UrgencyLevel = 
  | 'emergency'
  | 'urgent'
  | 'routine'
  | 'preventive'

export type ServiceDuration = 
  | '15min'
  | '30min'
  | '1hour'
  | 'multi_session'
  | 'half_day'
  | 'full_day'

export type ComplexityLevel = 
  | 'simple'
  | 'moderate'
  | 'complex'
  | 'specialized'

export type PatientType = 
  | 'adult'
  | 'pediatric'
  | 'geriatric'
  | 'womens_health'
  | 'mental_health'
  | 'chronic_care'

export type RankingCriteria = 
  | 'relevance'
  | 'availability'
  | 'proximity'
  | 'rating'
  | 'price'
  | 'waiting_time'

export type VoiceSearchSupported = 
  | 'medical_terms'
  | 'location_names'
  | 'symptoms'
  | 'specialty_conditions'

export interface SavedSearch {
  id: string
  name: string
  filters: SearchFilters
  alertEnabled: boolean
  createdAt: Date
  lastUsed?: Date
  resultCount: number
  searchCount: number
}

export interface FilterOption {
  id: string
  label: string
  value: string
  count?: number
  icon?: string
  disabled?: boolean
}

export interface FilterCategory {
  id: string
  title: string
  type: 'checkbox' | 'radio' | 'range' | 'select' | 'autocomplete'
  options: FilterOption[]
  placeholder?: string
  searchable?: boolean
  icon?: string
  description?: string
}

export interface SearchState {
  filters: SearchFilters
  selectedFilters: string[]
  isLoading: boolean
  results: any[]
  totalResults: number
  suggestions: string[]
  searchHistory: string[]
}

export interface ClinicSearchResult {
  id: string
  name: string
  address: string
  phone: string
  email: string
  website?: string
  rating?: number
  totalReviews?: number
  distance?: number
  isOpen?: boolean
  specialties?: string[]
  services?: string[]
  languages?: string[]
  operatingHours?: any
  facilities?: string[]
  accessibilityFeatures?: AccessibilityFeature[]
  clinicType?: ClinicType
  insuranceAccepted?: InsuranceType[]
  waitTime?: string
  doctorCount?: number
  isHealthierSgPartner?: boolean
  images?: string[]
}

export interface SearchSuggestion {
  type: 'clinic' | 'service' | 'location' | 'specialty' | 'medical_term' | 'symptom' | 'condition'
  value: string
  displayValue: string
  count?: number
  confidence?: number
  category?: string
  synonyms?: string[]
  relatedTerms?: string[]
  medicalSpecialty?: string
  urgencyLevel?: UrgencyLevel
  patientType?: PatientType
}

export interface SearchAnalytics {
  totalSearches: number
  popularFilters: Record<string, number>
  averageResponseTime: number
  popularQueries: string[]
  filterEffectiveness: Record<string, number>
  voiceSearchUsage: Record<string, number>
  medicalTermRecognitions: MedicalTermAnalytics[]
  searchConversionRates: SearchConversionData[]
  userBehaviorPatterns: UserBehaviorData
}

export interface MedicalTermAnalytics {
  term: string
  synonymRecognitions: number
  successfulMatches: number
  searchSuccessRate: number
  category: string
  complexity: ComplexityLevel
}

export interface SearchConversionData {
  query: string
  searches: number
  bookings: number
  conversionRate: number
  averageBookingValue?: number
}

export interface UserBehaviorData {
  averageSessionTime: number
  filtersUsed: Record<string, number>
  searchPatterns: SearchPattern[]
  deviceBreakdown: DeviceData
  peakSearchHours: number[]
}

export interface SearchPattern {
  pattern: string
  frequency: number
  avgResultsCount: number
  avgFiltersApplied: number
}

export interface DeviceData {
  mobile: number
  desktop: number
  tablet: number
}

export interface VoiceSearchResult {
  recognizedText: string
  confidence: number
  medicalTermsRecognized: string[]
  needsCorrection: boolean
  suggestion?: string
}

// Advanced search configuration
export interface MedicalTermDictionary {
  [key: string]: {
    synonyms: string[]
    category: string
    specialty: string
    commonSymptoms?: string[]
    relatedConditions?: string[]
    urgencyLevel?: UrgencyLevel
  }
}

export interface SearchAlert {
  id: string
  savedSearchId: string
  clinicId: string
  alertType: 'availability' | 'rating_change' | 'new_service' | 'price_change'
  conditions: Record<string, any>
  lastChecked: Date
  active: boolean
  createdAt: Date
}

export interface AdvancedSearchConfig {
  enableVoiceSearch: boolean
  enableMedicalTermRecognition: boolean
  enableSynonymSearch: boolean
  enableSmartRanking: boolean
  realTimeThreshold: number // milliseconds
  maxSearchHistory: number
  enableAlerts: boolean
  voiceSearchLanguages: string[]
  medicalTermConfidence: number
}

export interface SearchEngine {
  searchClinic: (query: string, filters: SearchFilters) => Promise<ClinicSearchResult[]>
  recognizeMedicalTerms: (text: string) => Promise<string[]>
  findSynonyms: (term: string) => Promise<string[]>
  rankResults: (results: ClinicSearchResult[], criteria: RankingCriteria[]) => Promise<ClinicSearchResult[]>
  getSuggestions: (query: string, limit?: number) => Promise<SearchSuggestion[]>
}

export interface SearchCache {
  searchResults: Map<string, { data: ClinicSearchResult[], timestamp: number, expiry: number }>
  suggestions: Map<string, { data: SearchSuggestion[], timestamp: number }>
  medicalTerms: MedicalTermDictionary
  lastUpdated: Date
}

export interface SearchFilterChip {
  id: string
  type: string
  label: string
  value: string
  icon?: React.ReactNode
  color?: string
  removable?: boolean
}

export type MedicalSpecialty = 
  | 'general_practice'
  | 'cardiology'
  | 'neurology'
  | 'ophthalmology'
  | 'pediatrics'
  | 'dermatology'
  | 'orthopedics'
  | 'psychiatry'
  | 'gastroenterology'
  | 'endocrinology'
  | 'pulmonology'
  | 'rheumatology'
  | 'urology'
  | 'oncology'
  | 'nephrology'
  | 'hematology'
  | 'infectious_disease'
  | 'immunology'
  | 'allergy'
  | 'respiratory'
  | 'anesthesiology'
  | 'radiology'
  | 'pathology'
  | 'emergency_medicine'
  | 'family_medicine'
  | 'internal_medicine'
  | 'general_surgery'
  | 'plastic_surgery'
  | 'neurosurgery'
  | 'cardiac_surgery'
  | 'thoracic_surgery'
  | 'vascular_surgery'
  | 'colorectal_surgery'
  | 'orthopedic_surgery'
  | 'urological_surgery'
  | 'pediatric_surgery'
  | 'gynecologic_surgery'
  | 'ophthalmic_surgery'
  | 'ENT_surgery'