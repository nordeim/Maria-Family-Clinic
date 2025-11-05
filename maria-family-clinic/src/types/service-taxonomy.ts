import { Service, ServiceComplexity, UrgencyLevel, ClinicService, HTPriority } from '@prisma/client'

// Service Category Model Types (replacing enum)
export interface ServiceCategoryModel {
  id: string
  name: string
  displayName: string
  description: string | null
  parentId: string | null
  level: number
  sortOrder: number
  mohCodePrefix: string | null
  mohCategoryName: string | null
  htCategory: string | null
  htPriority: HTPriority
  healthierSGCategory: string | null
  healthierSGLevel: string | null
  translations: Record<string, any>
  isActive: boolean
  isSubsidized: boolean
  priorityLevel: number
  serviceCount: number
  averagePrice: number | null
  createdAt: Date
  updatedAt: Date
  children: ServiceCategoryModel[]
  services: ServiceWithRelations[]
}

export interface CategorySynonym {
  id: string
  categoryId: string
  term: string
  language: string
  searchBoost: number
}

// Enhanced service types
export interface ServiceWithRelations extends Service {
  category: ServiceCategoryModel
  clinics: (ClinicService & {
    clinic: {
      id: string
      name: string
      address: string
      rating: number
    }
  })[]
  alternatives: ServiceAlternative[]
  prerequisites: ServicePrerequisite[]
  relationships: ServiceRelationship[]
  searchIndex: ServiceSearchIndex | null
  pricingStructure: ServicePricingStructure | null
  mohMapping: ServiceMOHMapping | null
}

export interface ServiceAlternative {
  id: string
  primaryServiceId: string
  alternativeServiceId: string
  relationshipType: AlternativeType
  similarityScore: number
  comparisonNotes: string | null
  alternativeService: Service
}

export interface ServicePrerequisite {
  id: string
  serviceId: string
  prerequisiteServiceId: string
  prerequisiteType: PrerequisiteType
  description: string | null
  timeFrameMin: number | null
  isOptional: boolean
  prerequisiteService: Service
}

export interface ServiceRelationship {
  id: string
  primaryServiceId: string
  relatedServiceId: string
  relationshipType: ServiceRelationshipType
  strength: number
  description: string | null
  relatedService: Service
}

export interface ServiceSearchIndex {
  id: string
  serviceId: string
  searchableName: string
  searchableDesc: string
  searchKeywords: string[]
  medicalTerms: string[]
  anatomyTerms: string[]
  conditionTerms: string[]
  procedureTerms: string[]
  searchPhrases: string[]
  searchTranslations: Record<string, any>
  searchBoost: number
  popularityScore: number
}

export interface ServicePricingStructure {
  id: string
  serviceId: string
  basePrice: number
  currency: string
  medisaveCovered: boolean
  medisaveLimit: number | null
  medisavePercentage: number | null
  medishieldCovered: boolean
  medishieldLimit: number | null
  medishieldDeductible: number | null
  chasCovered: boolean
  chasTier: ChasTier | null
  privateInsurance: any[]
  subsidyType: SubsidyType | null
  subsidyAmount: number | null
  subsidyPercentage: number | null
  pricingTiers: any[]
  effectiveDate: Date
  expiryDate: Date | null
}

export interface ServiceMOHMapping {
  id: string
  serviceId: string
  mohCategoryCode: string
  mohCategoryName: string
  mohSubcategory: string | null
  mohCode: string | null
  htCategory: string | null
  htPriority: HTPriority
  healthierSGCategory: string | null
  healthierSGLevel: string | null
  screenForLifeCategory: string | null
  chasCategory: string | null
  effectiveDate: Date | null
  expiryDate: Date | null
  isActive: boolean
  lastVerified: Date | null
}

export interface ServiceAvailability {
  id: string
  serviceId: string
  clinicId: string
  isAvailable: boolean
  nextAvailableDate: Date | null
  estimatedWaitTime: number | null
  scheduleSlots: ScheduleSlot[] | any
  advanceBookingDays: number
  minimumBookingLead: number
  isUrgentAvailable: boolean
  isEmergencySlot: boolean
  isWalkInAvailable: boolean
  dailyCapacity: number | null
  weeklyCapacity: number | null
  currentBookings: number
  serviceOperatingHours: Record<string, any> | any
  status: AvailabilityStatus
  lastUpdated: Date
  updatedBy: string | null
  createdAt: Date
  updatedAt: Date
  clinic: {
    id: string
    name: string
    address: string
    phone?: string
  }
}

export interface ScheduleSlot {
  time: string
  available: boolean
  capacity?: number
  booked?: number
}

export interface ServiceChecklist {
  id: string
  serviceId: string
  category: ChecklistCategory
  item: string
  description: string | null
  isRequired: boolean
  translations: Record<string, any>
  orderIndex: number
  timeframe: string | null
  priority: ChecklistPriority
}

// Service search and filter types
export interface ServiceSearchFilters {
  query?: string
  categoryId?: string
  subcategory?: string
  complexityLevel?: ServiceComplexity
  urgencyLevel?: UrgencyLevel
  priceRange?: {
    min?: number
    max?: number
  }
  isHealthierSGCovered?: boolean
  location?: {
    latitude: number
    longitude: number
    radius: number // in kilometers
  }
  availability?: {
    date?: Date
    timeSlots?: string[]
    urgent?: boolean
    walkIn?: boolean
  }
  insurance?: {
    medisave?: boolean
    medishield?: boolean
    chas?: ChasTier
  }
  sortBy?: 'relevance' | 'name' | 'price' | 'distance' | 'rating' | 'availability'
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

export interface ServiceSearchResult {
  services: (ServiceWithRelations & {
    searchScore?: number
    distance?: number
    availability?: ServiceAvailability
  })[]
  total: number
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  facets?: {
    categories: Array<{
      category: ServiceCategoryModel
      count: number
      services: ServiceWithRelations[]
    }>
    priceRanges: Array<{
      range: string
      count: number
    }>
    locations: Array<{
      area: string
      count: number
    }>
  }
  suggestions?: string[]
}

// Service recommendation types
export interface ServiceRecommendation {
  service: ServiceWithRelations
  reason: string
  confidence: number // 0-1
  relatedTo?: string[] // symptoms or conditions that led to recommendation
}

export interface PatientProfile {
  age?: number
  gender?: 'MALE' | 'FEMALE' | 'OTHER'
  medicalHistory?: string[]
  currentMedications?: string[]
  allergies?: string[]
  riskFactors?: string[]
  preferredLanguage?: string
  budget?: {
    min?: number
    max?: number
  }
  location?: {
    latitude: number
    longitude: number
    maxTravelDistance?: number
  }
  urgency?: UrgencyLevel
}

// Service taxonomy tree structure
export interface ServiceTaxonomyNode {
  category: ServiceCategoryModel
  categoryName: string
  description: string
  mohCodePrefix: string
  isSubsidized: boolean
  priorityLevel: number
  subcategories: ServiceSubcategoryNode[]
  serviceCount: number
  averagePrice: number
  healthierSGPercentage: number
}

export interface ServiceSubcategoryNode {
  subcategory: string
  services: ServiceWithRelations[]
  serviceCount: number
  averagePrice: number
}

// Service relationship visualization
export interface ServiceRelationshipGraph {
  nodes: Array<{
    id: string
    name: string
    category: ServiceCategoryModel
    complexityLevel: ServiceComplexity
  }>
  edges: Array<{
    source: string
    target: string
    type: ServiceRelationshipType
    strength: number
    label?: string
  }>
}

// Analytics and statistics
export interface ServiceAnalytics {
  totalServices: number
  servicesByCategory: Array<{
    categoryId: string
    count: number
    percentage: string
  }>
  complexityDistribution: Array<{
    level: ServiceComplexity
    count: number
    percentage: string
  }>
  averagePriceByCategory: Record<string, number>
  healthierSGStats: {
    totalCovered: number
    percentageCovered: string
    averageSavings: number
  }
  popularServices: Array<{
    service: ServiceWithRelations
    bookingCount: number
    viewCount: number
    rating: number
  }>
  searchPatterns: Array<{
    term: string
    frequency: number
    categoryId: string | null
    successRate: number
  }>
}

// Service comparison types
export interface ServiceComparison {
  services: ServiceWithRelations[]
  comparison: {
    [key: string]: {
      values: (string | number | boolean | null)[]
      labels: string[]
    }
  }
  recommendations: {
    bestFor: string[]
    cheapest: string
    mostPopular: string
    highestRated: string
  }
}

// Form validation types
export interface ServiceFormData {
  name: string
  description: string
  categoryId: string
  subcategory: string
  mohCode: string
  typicalDurationMin: number
  complexityLevel: ServiceComplexity
  urgencyLevel: UrgencyLevel
  basePrice: number
  isHealthierSGCovered: boolean
  medicalDescription: string
  patientFriendlyDesc: string
  synonyms: string[]
  searchTerms: string[]
  tags: string[]
  prerequisites: string[]
  preparationSteps: string[]
  postCareInstructions: string[]
}

export interface ServiceFormErrors {
  [key: string]: string | undefined
}

// Re-export Prisma enums for convenience
export {
  HTPriority,
  ChasTier,
  SubsidyType,
  ChecklistPriority,
  EquipmentType,
  OutcomeType,
  RiskLevel,
  ClinicServiceStatus,
  ChecklistCategory,
  ServiceComplexity,
  UrgencyLevel,
  AlternativeType,
  PrerequisiteType,
  ServiceRelationshipType,
  SynonymType,
  AvailabilityStatus
} from '@prisma/client'