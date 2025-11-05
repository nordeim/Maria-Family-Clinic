/**
 * SEO Utilities for My Family Clinic
 * Core SEO utility functions for healthcare platform optimization
 */

import { 
  SEOMetadata, 
  HealthcareSEOMetadata, 
  LanguageSEO,
  KeywordRanking 
} from '../types/seo.types'
import { SEO_CONFIG, LANGUAGE_CONFIGS, SINGAPORE_SEO_CONFIG, HEALTHCARE_SEO_CONFIG } from '../config/seo.config'

// =============================================================================
// META TAG UTILITIES
// =============================================================================

export class MetaTagManager {
  static generateBaseMeta(overrides: Partial<SEOMetadata> = {}): SEOMetadata {
    const baseMeta: SEOMetadata = {
      title: SEO_CONFIG.defaultTitle,
      description: SEO_CONFIG.defaultDescription,
      robots: SEO_CONFIG.defaultMeta.robots,
      language: SEO_CONFIG.defaultLanguage,
      viewport: SEO_CONFIG.defaultMeta.viewport,
      charset: SEO_CONFIG.defaultMeta.charset,
      canonical: SEO_CONFIG.baseUrl,
      ...overrides
    }

    return baseMeta
  }

  static generateClinicMeta(clinic: any, language: string = 'en'): SEOMetadata {
    const config = LANGUAGE_CONFIGS[language]
    
    return {
      title: `${clinic.name} - My Family Clinic ${clinic.address?.addressLocality || 'Singapore'}`,
      description: `Visit ${clinic.name} for comprehensive healthcare services in ${clinic.address?.addressLocality || 'Singapore'}. ${clinic.description || 'Professional medical care with Healthier SG enrollment.'}`,
      keywords: this.generateClinicKeywords(clinic),
      ogTitle: `${clinic.name} - Healthcare Services in ${clinic.address?.addressLocality || 'Singapore'}`,
      ogDescription: `Book appointments at ${clinic.name}. Comprehensive healthcare services in ${config.culturalAdaptation.healthcareTerms['clinic'] || 'clinic'}.`,
      ogImage: clinic.images?.[0] ? `${SEO_CONFIG.baseUrl}${clinic.images[0]}` : SEO_CONFIG.defaultImage,
      ogUrl: `${SEO_CONFIG.baseUrl}/clinics/${clinic.slug}`,
      twitterTitle: `${clinic.name} - Healthcare Clinic Singapore`,
      twitterDescription: `Professional healthcare services at ${clinic.name}. Book your appointment today.`,
      twitterImage: clinic.images?.[0] ? `${SEO_CONFIG.baseUrl}${clinic.images[0]}` : SEO_CONFIG.defaultImage,
      canonical: `${SEO_CONFIG.baseUrl}/clinics/${clinic.slug}`,
      language: config.hreflang,
      hreflang: this.generateHreflangs(`/clinics/${clinic.slug}`, language),
      structuredData: this.generateClinicStructuredData(clinic)
    }
  }

  static generateDoctorMeta(doctor: any, language: string = 'en'): SEOMetadata {
    const config = LANGUAGE_CONFIGS[language]
    
    return {
      title: `Dr. ${doctor.name} - ${doctor.specialties?.[0] || 'Doctor'} Singapore | My Family Clinic`,
      description: `Consult Dr. ${doctor.name}, ${doctor.specialties?.[0] || 'medical professional'} in Singapore. ${doctor.experienceYears || 0}+ years experience. Book appointment today.`,
      keywords: this.generateDoctorKeywords(doctor),
      ogTitle: `Dr. ${doctor.name} - ${doctor.specialties?.[0] || 'Medical Specialist'} Singapore`,
      ogDescription: `Book consultation with Dr. ${doctor.name}. ${doctor.specialties?.[0] || 'Medical specialist'} with ${doctor.experienceYears || 0}+ years experience.`,
      ogImage: doctor.profileImage ? `${SEO_CONFIG.baseUrl}${doctor.profileImage}` : SEO_CONFIG.defaultImage,
      ogUrl: `${SEO_CONFIG.baseUrl}/doctors/${doctor.slug}`,
      twitterTitle: `Dr. ${doctor.name} - Healthcare Professional Singapore`,
      twitterDescription: `Experienced ${doctor.specialties?.[0] || 'medical professional'} Dr. ${doctor.name} available for consultations.`,
      twitterImage: doctor.profileImage ? `${SEO_CONFIG.baseUrl}${doctor.profileImage}` : SEO_CONFIG.defaultImage,
      canonical: `${SEO_CONFIG.baseUrl}/doctors/${doctor.slug}`,
      language: config.hreflang,
      hreflang: this.generateHreflangs(`/doctors/${doctor.slug}`, language),
      structuredData: this.generateDoctorStructuredData(doctor)
    }
  }

  static generateServiceMeta(service: any, language: string = 'en'): SEOMetadata {
    const config = LANGUAGE_CONFIGS[language]
    
    return {
      title: `${service.name} - ${service.category?.name || 'Healthcare Service'} Singapore | My Family Clinic`,
      description: `Professional ${service.name.toLowerCase()} in Singapore. ${service.description || 'Comprehensive healthcare service with experienced professionals.'} Book your appointment.`,
      keywords: this.generateServiceKeywords(service),
      ogTitle: `${service.name} - ${service.category?.name || 'Healthcare Service'} Singapore`,
      ogDescription: `Get ${service.name.toLowerCase()} at My Family Clinic. ${config.culturalAdaptation.healthcareTerms['medical check-up'] || 'medical check-up'} and preventive care.`,
      ogImage: service.image ? `${SEO_CONFIG.baseUrl}${service.image}` : SEO_CONFIG.defaultImage,
      ogUrl: `${SEO_CONFIG.baseUrl}/services/${service.slug}`,
      twitterTitle: `${service.name} - Healthcare Service Singapore`,
      twitterDescription: `Book ${service.name.toLowerCase()} today. Professional healthcare services in Singapore.`,
      twitterImage: service.image ? `${SEO_CONFIG.baseUrl}${service.image}` : SEO_CONFIG.defaultImage,
      canonical: `${SEO_CONFIG.baseUrl}/services/${service.slug}`,
      language: config.hreflang,
      hreflang: this.generateHreflangs(`/services/${service.slug}`, language),
      structuredData: this.generateServiceStructuredData(service)
    }
  }

  static generateLocationMeta(location: string, language: string = 'en'): SEOMetadata {
    const config = LANGUAGE_CONFIGS[language]
    const locationFormatted = this.formatLocation(location)
    
    return {
      title: `Healthcare Clinics ${locationFormatted} - Find Doctors Near Me | My Family Clinic`,
      description: `Find the best healthcare clinics and doctors in ${locationFormatted}, Singapore. Book appointments, health screening, and medical consultations.`,
      keywords: this.generateLocationKeywords(location),
      ogTitle: `Healthcare Services ${locationFormatted} - My Family Clinic Singapore`,
      ogDescription: `Visit our clinics in ${locationFormatted}. Professional healthcare services with Healthier SG enrollment.`,
      ogUrl: `${SEO_CONFIG.baseUrl}/clinics/${location.toLowerCase().replace(' ', '-')}`,
      canonical: `${SEO_CONFIG.baseUrl}/clinics/${location.toLowerCase().replace(' ', '-')}`,
      language: config.hreflang,
      hreflang: this.generateHreflangs(`/clinics/${location.toLowerCase().replace(' ', '-')}`, language),
      structuredData: this.generateLocationStructuredData(location)
    }
  }

  private static generateClinicKeywords(clinic: any): string[] {
    const baseKeywords = [
      'clinic',
      'GP',
      'healthcare',
      'medical',
      'Singapore',
      'Healthier SG',
      'CHAS'
    ]

    const locationKeywords = clinic.address?.addressLocality ? [
      clinic.address.addressLocality,
      `${clinic.address.addressLocality} clinic`,
      `GP ${clinic.address.addressLocality}`,
      `doctor ${clinic.address.addressLocality}`
    ] : []

    const serviceKeywords = clinic.specialties?.map((specialty: string) => [
      specialty.toLowerCase(),
      `${specialty} clinic`,
      `${specialty} Singapore`
    ]).flat() || []

    return [...baseKeywords, ...locationKeywords, ...serviceKeywords].slice(0, 15)
  }

  private static generateDoctorKeywords(doctor: any): string[] {
    const baseKeywords = [
      'doctor',
      'medical professional',
      'healthcare',
      'Singapore',
      'appointment',
      'consultation'
    ]

    const specialtyKeywords = doctor.specialties?.map((specialty: string) => [
      specialty.toLowerCase(),
      `${specialty} doctor`,
      `${specialty} Singapore`,
      `${specialty} consultation`
    ]).flat() || []

    const experienceKeywords = doctor.experienceYears ? [
      `${doctor.experienceYears} years experience`,
      'experienced doctor',
      'senior physician'
    ] : []

    const nameKeywords = doctor.name ? [
      `Dr. ${doctor.name}`,
      doctor.name,
      `${doctor.name} doctor`
    ] : []

    return [...baseKeywords, ...specialtyKeywords, ...experienceKeywords, ...nameKeywords].slice(0, 15)
  }

  private static generateServiceKeywords(service: any): string[] {
    const baseKeywords = [
      'healthcare service',
      'medical service',
      'health screening',
      'medical consultation',
      'Singapore',
      'Healthier SG'
    ]

    const serviceNameKeywords = [
      service.name.toLowerCase(),
      `${service.name} Singapore`,
      `${service.name} clinic`,
      `${service.name} doctor`
    ]

    const categoryKeywords = service.category?.name ? [
      service.category.name.toLowerCase(),
      `${service.category.name} Singapore`,
      `${service.category.name} clinic`
    ] : []

    const conditionKeywords = service.conditions?.map((condition: any) => [
      condition.name.toLowerCase(),
      `${condition.name} treatment`,
      `${condition.name} screening`
    ]).flat() || []

    return [...baseKeywords, ...serviceNameKeywords, ...categoryKeywords, ...conditionKeywords].slice(0, 15)
  }

  private static generateLocationKeywords(location: string): string[] {
    const locationFormatted = this.formatLocation(location)
    
    return [
      `clinic ${locationFormatted}`,
      `doctor ${locationFormatted}`,
      `GP ${locationFormatted}`,
      `healthcare ${locationFormatted}`,
      `medical ${locationFormatted}`,
      `${locationFormatted} clinic`,
      `clinic near me ${locationFormatted}`,
      `doctor near me ${locationFormatted}`
    ]
  }

  private static generateHreflangs(path: string, currentLanguage: string) {
    return Object.entries(LANGUAGE_CONFIGS)
      .filter(([code]) => LANGUAGE_CONFIGS[code].supported)
      .map(([code, config]) => ({
        href: `${SEO_CONFIG.baseUrl}${config.contentPath}${path}`,
        hreflang: config.hreflang
      }))
  }

  private static formatLocation(location: string): string {
    return location
      .replace(/\b\w/g, l => l.toUpperCase())
      .replace(/\bSg\b/g, 'Singapore')
      .replace(/\bSg\b/g, 'Singapore')
      .replace(/[\s-]+/g, ' ')
      .trim()
  }

  private static generateClinicStructuredData(clinic: any): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'MedicalClinic',
      name: clinic.name,
      description: clinic.description,
      url: `${SEO_CONFIG.baseUrl}/clinics/${clinic.slug}`,
      telephone: clinic.phone || '+65-6123-4567',
      address: clinic.address ? {
        '@type': 'PostalAddress',
        streetAddress: clinic.address.streetAddress || '',
        addressLocality: clinic.address.addressLocality || 'Singapore',
        addressRegion: clinic.address.addressRegion || 'Singapore',
        postalCode: clinic.address.postalCode || '',
        addressCountry: 'SG'
      } : undefined
    }
  }

  private static generateDoctorStructuredData(doctor: any): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'Physician',
      name: `Dr. ${doctor.name}`,
      description: doctor.bio,
      url: `${SEO_CONFIG.baseUrl}/doctors/${doctor.slug}`,
      telephone: doctor.phone || '+65-6123-4567',
      medicalSpecialty: doctor.specialties
    }
  }

  private static generateServiceStructuredData(service: any): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'MedicalService',
      name: service.name,
      description: service.description,
      url: `${SEO_CONFIG.baseUrl}/services/${service.slug}`,
      provider: {
        '@type': 'Organization',
        name: 'My Family Clinic'
      }
    }
  }

  private static generateLocationStructuredData(location: string): any {
    const locationFormatted = this.formatLocation(location)
    
    return {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: `Healthcare Clinics ${locationFormatted}`,
      description: `Healthcare clinics and medical services in ${locationFormatted}, Singapore`,
      url: `${SEO_CONFIG.baseUrl}/clinics/${location.toLowerCase().replace(' ', '-')}`,
      address: {
        '@type': 'PostalAddress',
        addressLocality: locationFormatted,
        addressCountry: 'SG'
      }
    }
  }
}

// =============================================================================
// URL OPTIMIZATION UTILITIES
// =============================================================================

export class URLOptimizer {
  static generateSEOFriendlyUrl(type: string, data: any, language?: string): string {
    const basePath = this.getBasePath(type, language)
    const slug = this.generateSlug(data)
    
    return `${basePath}/${slug}`
  }

  private static getBasePath(type: string, language?: string): string {
    const basePaths = {
      clinic: '/clinics',
      doctor: '/doctors',
      service: '/services',
      location: '/clinics',
      blog: '/blog',
      page: ''
    }

    const basePath = basePaths[type as keyof typeof basePaths] || '/'
    const langPrefix = language && language !== 'en' ? `/${language}` : ''
    
    return `${langPrefix}${basePath}`
  }

  private static generateSlug(data: any): string {
    if (data.slug) return data.slug
    
    // Generate slug from name/title
    const name = data.name || data.title || data.displayName || ''
    
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim()
  }

  static addCanonicalParams(url: string, params: Record<string, string>): string {
    const urlObj = new URL(url)
    
    Object.entries(params).forEach(([key, value]) => {
      urlObj.searchParams.set(key, value)
    })
    
    return urlObj.toString()
  }

  static isSEOFriendlyUrl(url: string): boolean {
    // Check for SEO-friendly URL patterns
    const patterns = [
      /^\/[a-z]{2}\/clinics\/[a-z0-9-]+\/?$/, // /lang/clinics/slug
      /^\/clinics\/[a-z0-9-]+\/?$/, // /clinics/slug
      /^\/[a-z]{2}\/doctors\/[a-z0-9-]+\/?$/, // /lang/doctors/slug
      /^\/doctors\/[a-z0-9-]+\/?$/, // /doctors/slug
      /^\/[a-z]{2}\/services\/[a-z0-9-]+\/?$/, // /lang/services/slug
      /^\/services\/[a-z0-9-]+\/?$/ // /services/slug
    ]

    return patterns.some(pattern => pattern.test(url))
  }
}

// =============================================================================
// KEYWORD OPTIMIZATION UTILITIES
// =============================================================================

export class KeywordOptimizer {
  static extractPrimaryKeyword(title: string): string {
    // Extract the most important keyword from title
    const words = title.toLowerCase().split(' ')
    
    // Healthcare-specific priority words
    const priorityWords = [
      'doctor', 'clinic', 'healthcare', 'medical', 'service',
      'singapore', 'healthier sg', 'chas', 'appointment'
    ]
    
    // Find priority words first
    const priorityMatch = words.find(word => 
      priorityWords.some(priority => word.includes(priority))
    )
    
    if (priorityMatch) return priorityMatch
    
    // Return first meaningful word
    return words.find(word => word.length > 2) || words[0] || ''
  }

  static generateKeywordVariations(baseKeyword: string): string[] {
    const variations = [baseKeyword]
    
    // Add location variations
    variations.push(`${baseKeyword} Singapore`)
    variations.push(`${baseKeyword} near me`)
    variations.push(`${baseKeyword} clinic`)
    variations.push(`${baseKeyword} doctor`)
    
    // Add intent variations
    variations.push(`best ${baseKeyword}`)
    variations.push(`${baseKeyword} appointment`)
    variations.push(`${baseKeyword} booking`)
    
    return variations
  }

  static calculateKeywordDensity(text: string, targetKeyword: string): number {
    const cleanText = text.toLowerCase()
    const wordCount = cleanText.split(/\s+/).length
    const keywordCount = (cleanText.match(new RegExp(targetKeyword.toLowerCase(), 'g')) || []).length
    
    return wordCount > 0 ? (keywordCount / wordCount) * 100 : 0
  }

  static isKeywordOptimized(content: string, targetKeywords: string[]): boolean {
    const wordCount = content.split(/\s+/).length
    const minWordCount = 300 // Minimum content length
    
    if (wordCount < minWordCount) return false
    
    // Check if target keywords are present
    const hasKeywords = targetKeywords.some(keyword => 
      content.toLowerCase().includes(keyword.toLowerCase())
    )
    
    // Check keyword density (should be between 1-3%)
    const keywordDensities = targetKeywords.map(keyword => 
      this.calculateKeywordDensity(content, keyword)
    )
    const avgDensity = keywordDensities.reduce((a, b) => a + b, 0) / keywordDensities.length
    
    return hasKeywords && avgDensity >= 1 && avgDensity <= 3
  }
}

// =============================================================================
// LOCAL SEO UTILITIES
// =============================================================================

export class LocalSEOHelper {
  static generateLocalKeywords(location: string): string[] {
    const formattedLocation = this.formatLocation(location)
    
    return [
      `${formattedLocation} clinic`,
      `${formattedLocation} GP`,
      `${formattedLocation} doctor`,
      `${formattedLocation} healthcare`,
      `${formattedLocation} medical center`,
      `clinic near ${formattedLocation}`,
      `doctor near ${formattedLocation}`,
      `healthcare ${formattedLocation}`,
      `${formattedLocation} Healthier SG`,
      `${formattedLocation} CHAS clinic`
    ]
  }

  static generateNAPConsistentData(clinic: any): Record<string, any> {
    return {
      name: clinic.name,
      address: {
        street: clinic.address?.streetAddress || '',
        city: clinic.address?.addressLocality || 'Singapore',
        region: clinic.address?.addressRegion || 'Singapore',
        postal: clinic.address?.postalCode || '',
        country: 'SG'
      },
      phone: clinic.phone || '+65-6123-4567',
      email: clinic.email || 'info@myfamilyclinic.sg',
      website: `${SEO_CONFIG.baseUrl}/clinics/${clinic.slug}`,
      hours: clinic.openingHours || this.getDefaultHours(),
      categories: clinic.specialties || ['Healthcare'],
      description: clinic.description || '',
      images: clinic.images || []
    }
  }

  static getLocalSchema(location: string): any {
    const formattedLocation = this.formatLocation(location)
    
    return {
      '@context': 'https://schema.org',
      '@type': 'GeoCircle',
      name: `Healthcare Services in ${formattedLocation}`,
      geoMidpoint: {
        '@type': 'GeoCoordinates',
        // Default to Singapore center - would need actual coordinates
        latitude: 1.3521,
        longitude: 103.8198
      },
      geoRadius: '25000'
    }
  }

  private static formatLocation(location: string): string {
    return location
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
      .replace(/\bSg\b/g, 'Singapore')
  }

  private static getDefaultHours(): any[] {
    return [
      { day: 'Monday', opens: '08:00', closes: '17:00' },
      { day: 'Tuesday', opens: '08:00', closes: '17:00' },
      { day: 'Wednesday', opens: '08:00', closes: '17:00' },
      { day: 'Thursday', opens: '08:00', closes: '17:00' },
      { day: 'Friday', opens: '08:00', closes: '17:00' },
      { day: 'Saturday', opens: '08:00', closes: '12:00' },
      { day: 'Sunday', opens: 'Closed', closes: 'Closed' }
    ]
  }
}

// =============================================================================
// HEALTHCARE SEO UTILITIES
// =============================================================================

export class HealthcareSEOHelper {
  static generateMedicalKeywords(doctor: any): string[] {
    const keywords = []
    
    // Specialty-based keywords
    doctor.specialties?.forEach((specialty: string) => {
      keywords.push(
        specialty.toLowerCase(),
        `${specialty} doctor Singapore`,
        `${specialty} specialist`,
        `${specialty} consultation`,
        `${specialty} treatment`
      )
    })
    
    // Condition-based keywords
    keywords.push(
      'health screening',
      'medical check up',
      'preventive care',
      'chronic disease management',
      'health consultation'
    )
    
    // Location-based keywords
    doctor.clinics?.forEach((clinic: any) => {
      if (clinic.clinic?.address?.addressLocality) {
        keywords.push(
          `${specialty.toLowerCase()} ${clinic.clinic.address.addressLocality}`,
          `doctor ${clinic.clinic.address.addressLocality}`,
          `clinic ${clinic.clinic.address.addressLocality}`
        )
      }
    })
    
    return [...new Set(keywords)].slice(0, 20)
  }

  static generateHealthierSGKeywords(): string[] {
    return [
      'Healthier SG',
      'Healthier SG enrollment',
      'Healthier SG programme',
      'Singapore health programme',
      'preventive healthcare Singapore',
      'chronic disease prevention',
      'health screening Singapore',
      'MOH health programme'
    ]
  }

  static generateEmergencyCareKeywords(): string[] {
    return [
      'emergency healthcare',
      'urgent care Singapore',
      'after hours clinic',
      'emergency appointment',
      'same day appointment',
      'walk in clinic',
      'emergency medical care',
      'urgent medical attention'
    ]
  }

  static validateMedicalContent(content: string): {
    isOptimized: boolean
    recommendations: string[]
    medicalCompliance: boolean
  } {
    const recommendations = []
    let isOptimized = true
    let medicalCompliance = true

    // Check for medical disclaimers
    const hasDisclaimer = content.toLowerCase().includes('medical advice') || 
                         content.toLowerCase().includes('consult your doctor') ||
                         content.toLowerCase().includes('seek professional')
    
    if (!hasDisclaimer) {
      recommendations.push('Add medical disclaimer for compliance')
      medicalCompliance = false
    }

    // Check for emergency information
    const hasEmergencyInfo = content.toLowerCase().includes('emergency') ||
                           content.toLowerCase().includes('urgent')
    
    if (hasEmergencyInfo && !content.toLowerCase().includes('995')) {
      recommendations.push('Include emergency contact number (995)')
    }

    // Check content length
    if (content.length < 300) {
      recommendations.push('Increase content length for better SEO (minimum 300 words)')
      isOptimized = false
    }

    // Check for healthcare terms
    const healthcareTerms = ['doctor', 'clinic', 'healthcare', 'medical', 'treatment', 'consultation']
    const hasHealthcareTerms = healthcareTerms.some(term => 
      content.toLowerCase().includes(term)
    )

    if (!hasHealthcareTerms) {
      recommendations.push('Include relevant healthcare terms')
      isOptimized = false
    }

    return {
      isOptimized,
      recommendations,
      medicalCompliance
    }
  }
}

// =============================================================================
// UTILITY EXPORTS
// =============================================================================

export const seoUtils = {
  metaTags: MetaTagManager,
  urls: URLOptimizer,
  keywords: KeywordOptimizer,
  localSEO: LocalSEOHelper,
  healthcareSEO: HealthcareSEOHelper
}

export default seoUtils