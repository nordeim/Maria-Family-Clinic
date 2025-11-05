/**
 * SEO System TypeScript Types for My Family Clinic
 * Comprehensive SEO implementation for Singapore healthcare platform
 * Supporting technical SEO, healthcare-specific optimization, and multi-language SEO
 */

// =============================================================================
// CORE SEO TYPES
// =============================================================================

export interface SEOMetadata {
  title: string
  description: string
  keywords?: string[]
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogUrl?: string
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string
  canonical?: string
  robots?: string
  language?: string
  hreflang?: HreflangEntry[]
  structuredData?: StructuredData
  viewport?: string
  charset?: string
}

export interface HreflangEntry {
  href: string
  hreflang: string
  rel?: string
}

export interface StructuredData {
  [key: string]: any
}

// =============================================================================
// HEALTHCARE-SPECIFIC SEO TYPES
// =============================================================================

export interface HealthcareSEOMetadata extends SEOMetadata {
  medicalKeywords?: string[]
  conditionKeywords?: string[]
  procedureKeywords?: string[]
  serviceCategory?: string
  medicalSpecialty?: string
  healthcareContext?: string
}

export interface LocalBusinessSEO {
  name: string
  description: string
  url: string
  telephone: string
  address: {
    streetAddress: string
    addressLocality: string
    addressRegion: string
    postalCode: string
    addressCountry: string
  }
  geo?: {
    latitude: number
    longitude: number
  }
  openingHours?: OpeningHours[]
  serviceArea?: {
    type: string
    name: string
  }[]
  priceRange?: string
  paymentAccepted?: string[]
  currenciesAccepted?: string[]
  images?: string[]
  reviews?: Review[]
  aggregateRating?: AggregateRating
}

export interface OpeningHours {
  '@type': 'OpeningHoursSpecification'
  dayOfWeek: string | string[]
  opens: string
  closes: string
  validFrom?: string
  validThrough?: string
}

export interface Review {
  '@type': 'Review'
  author: {
    '@type': 'Person'
    name: string
  }
  datePublished: string
  reviewBody: string
  reviewRating: {
    '@type': 'Rating'
    bestRating: number
    worstRating: number
    ratingValue: number
  }
}

export interface AggregateRating {
  '@type': 'AggregateRating'
  ratingValue: number
  reviewCount: number
  bestRating?: number
  worstRating?: number
}

// =============================================================================
// DOCTOR SEO TYPES
// =============================================================================

export interface DoctorSEO extends StructuredData {
  '@context': 'https://schema.org'
  '@type': 'Physician'
  name: string
  description?: string
  image?: string
  url?: string
  telephone?: string
  medicalSpecialty?: string[]
  qualification?: string[]
  affiliation?: {
    '@type': 'Organization'
    name: string
    url?: string
  }[]
  workLocation?: {
    '@type': 'MedicalClinic'
    name: string
    address: {
      '@type': 'PostalAddress'
      streetAddress: string
      addressLocality: string
      addressRegion: string
      postalCode: string
      addressCountry: string
    }
  }[]
  patientReview?: Review[]
  aggregateRating?: AggregateRating
  medicalCondition?: {
    '@type': 'MedicalCondition'
    name: string
    associatedAnatomy?: {
      '@type': 'AnatomicalSystem'
      name: string
    }
  }[]
  medicalTherapy?: {
    '@type': 'TherapeuticProcedure'
    name: string
  }[]
}

// =============================================================================
// CLINIC SEO TYPES
// =============================================================================

export interface ClinicSEO extends StructuredData {
  '@context': 'https://schema.org'
  '@type': 'MedicalClinic'
  name: string
  description?: string
  url: string
  telephone: string
  email?: string
  address: {
    '@type': 'PostalAddress'
    streetAddress: string
    addressLocality: string
    addressRegion: string
    postalCode: string
    addressCountry: string
  }
  geo?: {
    '@type': 'GeoCoordinates'
    latitude: number
    longitude: number
  }
  openingHours?: OpeningHours[]
  serviceArea?: {
    '@type': 'GeoCircle'
    geoMidpoint: {
      '@type': 'GeoCoordinates'
      latitude: number
      longitude: number
    }
    geoRadius: string
  }
  medicalSpecialty?: string[]
  hasOfferCatalog?: {
    '@type': 'OfferCatalog'
    name: string
    itemListElement: OfferCatalogItem[]
  }
  paymentAccepted?: string[]
  priceRange?: string
  amenities?: string[]
  images?: string[]
  review?: Review[]
  aggregateRating?: AggregateRating
}

export interface OfferCatalogItem {
  '@type': 'Offer'
  itemOffered: {
    '@type': 'MedicalService'
    name: string
    description?: string
    medicalSpecialty?: string[]
  }
  price?: string
  priceCurrency?: string
}

// =============================================================================
// SERVICE SEO TYPES
// =============================================================================

export interface MedicalServiceSEO extends StructuredData {
  '@context': 'https://schema.org'
  '@type': 'MedicalService'
  name: string
  description?: string
  url?: string
  provider?: {
    '@type': 'MedicalClinic'
    name: string
    address: {
      '@type': 'PostalAddress'
      streetAddress: string
      addressLocality: string
      addressRegion: string
      postalCode: string
      addressCountry: string
    }
  }
  medicalSpecialty?: string
  areaServed?: {
    '@type': 'Country'
    name: string
    sameAs?: string
  }
  audience?: {
    '@type': 'Audience'
    audienceType: string
  }
  serviceType?: string
  relevantSpecialty?: string[]
  bodyLocation?: {
    '@type': 'AnatomicalSystem'
    name: string
  }
  hasOfferCatalog?: {
    '@type': 'OfferCatalog'
    name: string
    itemListElement: OfferItem[]
  }
  fee?: {
    '@type': 'PriceSpecification'
    price: number
    priceCurrency: string
  }
}

export interface OfferItem {
  '@type': 'Offer'
  price?: string
  priceCurrency?: string
  availability?: string
  validFrom?: string
  validThrough?: string
}

// =============================================================================
// MULTI-LANGUAGE SEO TYPES
// =============================================================================

export interface LanguageSEO {
  code: string
  name: string
  nativeName: string
  rtl?: boolean
  default: boolean
  supported: boolean
  hreflang: string
  domain?: string
  contentPath?: string
  metaTags: {
    description: string
    keywords?: string[]
  }
  culturalAdaptation: {
    dateFormat: string
    timeFormat: string
    currency: string
    numberFormat: string
    healthcareTerms: Record<string, string>
  }
}

export interface LocalizedContent {
  language: string
  title: string
  description: string
  keywords?: string[]
  content: string
  medicalTerms: Record<string, string>
  culturalContext: {
    healthcareSystem: string
    paymentMethod: string
    insuranceTerms: Record<string, string>
  }
}

// =============================================================================
// SINGAPORE-SPECIFIC SEO TYPES
// =============================================================================

export interface SingaporeSEO {
  location: {
    country: 'Singapore'
    region: string
    district: string
    postalCode?: string
    landmark?: string
    mrtStation?: string
    busStop?: string
  }
  healthcareContext: {
    mohGuidelines: string
    healthierSGProgram: boolean
    subsidyEligibility: 'CHAS' | 'Medisave' | 'Medishield' | 'ElderShield' | 'CareShield Life'
    waitingTime?: string
    appointmentRequired?: boolean
  }
  localKeywords: string[]
  culturalKeywords: string[]
  searchVolume: {
    high: string[]
    medium: string[]
    low: string[]
  }
  competitorAnalysis?: {
    keywords: string[]
    gaps: string[]
    opportunities: string[]
  }
}

// =============================================================================
// SEO MONITORING TYPES
// =============================================================================

export interface SEOAnalytics {
  organicTraffic: {
    sessions: number
    users: number
    pageViews: number
    bounceRate: number
    avgSessionDuration: number
    conversionRate: number
  }
  keywordRankings: KeywordRanking[]
  richSnippets: {
    implemented: string[]
    missing: string[]
    errors: string[]
  }
  technicalSEO: TechnicalSEOCheck
  localSEOPerformance: LocalSEOPerformance
  healthcareSEOPerformance: HealthcareSEOPerformance
}

export interface KeywordRanking {
  keyword: string
  position: number
  url: string
  searchVolume: number
  difficulty: number
  trend: 'up' | 'down' | 'stable'
  language: string
  device: 'desktop' | 'mobile' | 'tablet'
  location: string
  lastUpdated: Date
}

export interface TechnicalSEOCheck {
  coreWebVitals: {
    lcp: number // Largest Contentful Paint
    fid: number // First Input Delay
    cls: number // Cumulative Layout Shift
  }
  pageSpeed: {
    mobile: number
    desktop: number
  }
  crawlability: {
    indexedPages: number
    blockedPages: number
    errors: number
  }
  structuredData: {
    valid: number
    invalid: number
    warnings: number
  }
}

export interface LocalSEOPerformance {
  localPackAppearances: number
  averageLocalRank: number
  gmbEngagement: {
    views: number
    actions: number
    photos: number
  }
  reviews: {
    count: number
    rating: number
    responseRate: number
  }
  citations: number
}

export interface HealthcareSEOPerformance {
  medicalKeywordRankings: KeywordRanking[]
  healthcareRichSnippets: {
    doctorProfiles: number
    clinicInfo: number
    medicalServices: number
    reviews: number
  }
  emergencyCareSEO: {
    urgentCareRankings: KeywordRanking[]
    afterHoursVisibility: number
  }
  specializationVisibility: {
    [specialty: string]: {
      rankings: KeywordRanking[]
      searchVolume: number
      competitionLevel: 'low' | 'medium' | 'high'
    }
  }
}

// =============================================================================
// SITEMAP TYPES
// =============================================================================

export interface SitemapEntry {
  loc: string
  lastmod?: string
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
  alternate?: {
    hreflang: string
    href: string
  }[]
}

export interface SitemapIndex {
  sitemap: SitemapEntry[]
}

// =============================================================================
// ROBOTS.TXT TYPES
// =============================================================================

export interface RobotsRule {
  userAgent: string
  allow?: string[]
  disallow?: string[]
  crawlDelay?: number
  sitemap?: string[]
}

export interface RobotsConfig {
  rules: RobotsRule[]
  host?: string
  userAgent?: string
  rulesEnabled: boolean
  debug: boolean
}

// =============================================================================
// SEARCH PERFORMANCE TYPES
// =============================================================================

export interface SearchPerformanceMetrics {
  queries: {
    total: number
    successful: number
    failed: number
    averageResponseTime: number
  }
  indexing: {
    pagesIndexed: number
    indexErrors: number
    lastIndexingRun: Date
    indexingRate: number
  }
  rankings: {
    totalKeywords: number
    averagePosition: number
    topTenKeywords: number
    improvedKeywords: number
    declinedKeywords: number
  }
  technicalHealth: {
    crawlErrors: number
    pageSpeedIssues: number
    mobileUsabilityErrors: number
    securityIssues: number
  }
}

export interface SEOScore {
  overall: number
  technical: number
  content: number
  local: number
  healthcare: number
  performance: number
  userExperience: number
  factors: {
    factor: string
    score: number
    weight: number
    impact: 'low' | 'medium' | 'high'
  }[]
}