/**
 * SEO Services for My Family Clinic
 * Core SEO business logic services for healthcare platform optimization
 */

import { 
  SEOMetadata, 
  HealthcareSEOMetadata, 
  SEOAnalytics,
  KeywordRanking,
  SEOScore,
  SearchPerformanceMetrics,
  LocalSEOPerformance,
  HealthcareSEOPerformance
} from '../types/seo.types'
import { SEO_CONFIG, HEALTHCARE_SEO_CONFIG, SINGAPORE_SEO_CONFIG } from '../config/seo.config'
import { MetaTagManager, URLOptimizer, KeywordOptimizer, LocalSEOHelper, HealthcareSEOHelper } from '../utils/seo-utils'
import { SchemaFactory } from '../schemas/schema-generators'
import { SitemapGenerator } from '../utils/sitemap-generator'
import { RobotsConfigGenerator, RobotsValidator } from '../utils/robots-generator'

// =============================================================================
// CORE SEO SERVICE
// =============================================================================

export class CoreSEOService {
  static async generatePageMetadata(
    type: string, 
    data: any, 
    language: string = 'en'
  ): Promise<SEOMetadata> {
    switch (type) {
      case 'homepage':
        return this.generateHomepageMetadata(language)
      
      case 'clinic':
        return MetaTagManager.generateClinicMeta(data, language)
      
      case 'doctor':
        return MetaTagManager.generateDoctorMeta(data, language)
      
      case 'service':
        return MetaTagManager.generateServiceMeta(data, language)
      
      case 'location':
        return MetaTagManager.generateLocationMeta(data, language)
      
      default:
        return MetaTagManager.generateBaseMeta()
    }
  }

  private static generateHomepageMetadata(language: string): SEOMetadata {
    const config = SEO_CONFIG
    
    return {
      title: 'My Family Clinic - Singapore Primary Care Network | Healthier SG Enrolled',
      description: 'Find doctors, book appointments, and manage your healthcare journey in Singapore\'s comprehensive primary care network. Healthier SG enrolled with CHAS subsidies available.',
      keywords: [
        'Singapore healthcare',
        'clinic finder',
        'doctor appointments',
        'Healthier SG',
        'primary care',
        'GP Singapore',
        'CHAS clinic',
        'health screening',
        'medical consultation',
        'family doctor'
      ],
      ogTitle: 'My Family Clinic - Singapore\'s Premier Healthcare Network',
      ogDescription: 'Join Singapore\'s Healthier SG program. Find qualified doctors, book appointments, and access comprehensive healthcare services across multiple locations.',
      ogImage: `${config.baseUrl}/images/og-homepage.jpg`,
      ogUrl: config.baseUrl,
      twitterTitle: 'My Family Clinic - Healthcare Singapore',
      twitterDescription: 'Singapore\'s comprehensive primary care network. Healthier SG enrolled with expert doctors and modern facilities.',
      twitterImage: `${config.baseUrl}/images/twitter-homepage.jpg`,
      canonical: config.baseUrl,
      language: language === 'en' ? 'en-SG' : `${language}-SG`,
      hreflang: this.generateHreflangs('/', language),
      structuredData: this.generateHomepageStructuredData()
    }
  }

  private static generateHreflangs(path: string, currentLanguage: string) {
    return Object.entries(SEO_CONFIG.languages || { en: 'en-SG' })
      .map(([code, hreflang]) => ({
        href: `${SEO_CONFIG.baseUrl}${code === 'en' ? '' : `/${code}`}${path}`,
        hreflang
      }))
  }

  private static generateHomepageStructuredData(): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'My Family Clinic',
      description: 'Singapore\'s premier primary care network providing comprehensive healthcare services with Healthier SG enrollment.',
      url: SEO_CONFIG.baseUrl,
      logo: `${SEO_CONFIG.baseUrl}/images/logo.png`,
      image: `${SEO_CONFIG.baseUrl}/images/hero-image.jpg`,
      sameAs: [
        'https://facebook.com/MyFamilyClinicSG',
        'https://twitter.com/MyFamilyClinicSG',
        'https://instagram.com/MyFamilyClinicSG'
      ],
      address: {
        '@type': 'PostalAddress',
        streetAddress: '6 Raffles Boulevard',
        addressLocality: 'Singapore',
        addressRegion: 'Singapore',
        postalCode: '018956',
        addressCountry: 'SG'
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+65-6123-4567',
        contactType: 'customer service',
        availableLanguage: ['English', 'Chinese', 'Malay', 'Tamil']
      },
      medicalSpecialty: HEALTHCARE_SEO_CONFIG.specialties,
      hasCredential: ['MOH Licensed', 'CHAS Accredited', 'Healthier SG Enrolled']
    }
  }

  static generateStructuredData(type: string, data: any): any {
    const schemaFactory = new SchemaFactory()
    return schemaFactory.createSchema(type, data)
  }

  static validateSEOMetadata(metadata: SEOMetadata): {
    isValid: boolean
    score: number
    recommendations: string[]
  } {
    const recommendations: string[] = []
    let score = 0
    let maxScore = 0

    // Title validation (25 points)
    maxScore += 25
    if (metadata.title) {
      if (metadata.title.length >= 30 && metadata.title.length <= 60) {
        score += 20
      } else if (metadata.title.length >= 20 && metadata.title.length <= 70) {
        score += 15
      } else {
        recommendations.push('Optimize title length (30-60 characters recommended)')
      }
    } else {
      recommendations.push('Add page title')
    }

    // Description validation (25 points)
    maxScore += 25
    if (metadata.description) {
      if (metadata.description.length >= 120 && metadata.description.length <= 160) {
        score += 20
      } else if (metadata.description.length >= 100 && metadata.description.length <= 170) {
        score += 15
      } else {
        recommendations.push('Optimize meta description length (120-160 characters recommended)')
      }
    } else {
      recommendations.push('Add meta description')
    }

    // Keywords validation (15 points)
    maxScore += 15
    if (metadata.keywords && metadata.keywords.length > 0) {
      if (metadata.keywords.length >= 5 && metadata.keywords.length <= 15) {
        score += 15
      } else if (metadata.keywords.length >= 3 && metadata.keywords.length <= 20) {
        score += 10
      } else {
        recommendations.push('Optimize keyword count (5-15 keywords recommended)')
      }
    }

    // Open Graph validation (15 points)
    maxScore += 15
    if (metadata.ogTitle && metadata.ogDescription && metadata.ogImage) {
      score += 15
    } else {
      recommendations.push('Add Open Graph tags for social media sharing')
    }

    // Canonical URL validation (10 points)
    maxScore += 10
    if (metadata.canonical) {
      score += 10
    } else {
      recommendations.push('Add canonical URL')
    }

    // Hreflang validation (10 points)
    maxScore += 10
    if (metadata.hreflang && metadata.hreflang.length > 0) {
      score += 10
    }

    return {
      isValid: score >= maxScore * 0.7,
      score: Math.round((score / maxScore) * 100),
      recommendations
    }
  }
}

// =============================================================================
// LOCAL SEO SERVICE
// =============================================================================

export class LocalSEOService {
  static generateLocalBusinessData(clinic: any): any {
    return LocalSEOHelper.generateNAPConsistentData(clinic)
  }

  static generateLocalKeywords(location: string): string[] {
    return LocalSEOHelper.generateLocalKeywords(location)
  }

  static getLocalSchema(location: string): any {
    return LocalSEOHelper.getLocalSchema(location)
  }

  static async analyzeLocalSEO(
    clinicData: any[], 
    searchQueries: string[]
  ): Promise<LocalSEOPerformance> {
    // Simulate local SEO analysis
    const analysis = {
      localPackAppearances: Math.floor(Math.random() * 50) + 10,
      averageLocalRank: Math.round((Math.random() * 3 + 1) * 10) / 10,
      gmbEngagement: {
        views: Math.floor(Math.random() * 1000) + 500,
        actions: Math.floor(Math.random() * 200) + 100,
        photos: Math.floor(Math.random() * 50) + 10
      },
      reviews: {
        count: Math.floor(Math.random() * 200) + 50,
        rating: Math.round((Math.random() * 2 + 3.5) * 10) / 10,
        responseRate: Math.round((Math.random() * 40 + 60) * 10) / 10
      },
      citations: Math.floor(Math.random() * 100) + 50
    }

    return analysis
  }

  static optimizeForLocalSearch(
    clinicData: any,
    targetLocation: string
  ): {
    optimizedData: any
    keywords: string[]
    structuredData: any
  } {
    const keywords = this.generateLocalKeywords(targetLocation)
    const structuredData = this.getLocalSchema(targetLocation)
    const optimizedData = {
      ...clinicData,
      address: {
        ...clinicData.address,
        addressLocality: targetLocation
      },
      serviceArea: [
        {
          name: targetLocation,
          radius: '10000',
          type: 'City'
        }
      ]
    }

    return {
      optimizedData,
      keywords,
      structuredData
    }
  }
}

// =============================================================================
// HEALTHCARE SEO SERVICE
// =============================================================================

export class HealthcareSEOService {
  static generateMedicalKeywords(doctor: any): string[] {
    return HealthcareSEOHelper.generateMedicalKeywords(doctor)
  }

  static generateHealthierSGKeywords(): string[] {
    return HealthcareSEOHelper.generateHealthierSGKeywords()
  }

  static generateEmergencyCareKeywords(): string[] {
    return HealthcareSEOHelper.generateEmergencyCareKeywords()
  }

  static validateMedicalContent(content: string): {
    isOptimized: boolean
    recommendations: string[]
    medicalCompliance: boolean
  } {
    return HealthcareSEOHelper.validateMedicalContent(content)
  }

  static generateSpecialistContent(
    specialty: string, 
    conditions?: string[]
  ): {
    title: string
    description: string
    keywords: string[]
    structuredData: any
  } {
    const specialtyKeywords = [
      `${specialty} Singapore`,
      `${specialty} doctor`,
      `${specialty} consultation`,
      `${specialty} treatment`,
      `${specialty} clinic`
    ]

    if (conditions && conditions.length > 0) {
      conditions.forEach(condition => {
        specialtyKeywords.push(
          `${condition} ${specialty}`,
          `${condition} treatment Singapore`,
          `${specialty} ${condition}`,
          `manage ${condition} Singapore`
        )
      })
    }

    const description = `Expert ${specialty.toLowerCase()} care in Singapore. Our experienced ${specialty.toLowerCase()} specialists provide comprehensive diagnosis, treatment, and ongoing care for various medical conditions. Book your consultation today.`

    const title = `${specialty} Specialist Singapore - Expert ${specialty} Care | My Family Clinic`

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'MedicalClinic',
      name: `${specialty} Care - My Family Clinic`,
      description,
      medicalSpecialty: specialty,
      availableService: conditions?.map(condition => ({
        '@type': 'MedicalService',
        name: `${specialty} for ${condition}`,
        description: `Professional ${specialty.toLowerCase()} treatment for ${condition}`
      })),
      provider: {
        '@type': 'Organization',
        name: 'My Family Clinic'
      }
    }

    return {
      title,
      description,
      keywords: specialtyKeywords,
      structuredData
    }
  }
}

// =============================================================================
// MULTI-LANGUAGE SEO SERVICE
// =============================================================================

export class MultiLanguageSEOService {
  static getSupportedLanguages(): string[] {
    return Object.keys(SEO_CONFIG.languages || { en: 'en-SG' })
  }

  static generateHreflangTags(path: string, currentLanguage: string): any[] {
    const languages = this.getSupportedLanguages()
    return languages.map(lang => ({
      href: `${SEO_CONFIG.baseUrl}${lang === 'en' ? '' : `/${lang}`}${path}`,
      hreflang: lang === 'en' ? 'en-SG' : `${lang}-SG`
    }))
  }

  static translateSEOMetadata(
    metadata: SEOMetadata,
    sourceLanguage: string,
    targetLanguage: string
  ): SEOMetadata {
    // In a real implementation, this would use translation services
    // For now, return a basic structure with language code changes
    return {
      ...metadata,
      language: targetLanguage === 'en' ? 'en-SG' : `${targetLanguage}-SG`,
      hreflang: this.generateHreflangTags(metadata.canonical?.replace(SEO_CONFIG.baseUrl, '') || '/', targetLanguage)
    }
  }

  static validateLanguageSEO(
    content: Record<string, any>,
    supportedLanguages: string[]
  ): {
    isComplete: boolean
    missingLanguages: string[]
    recommendations: string[]
  } {
    const missingLanguages = supportedLanguages.filter(
      lang => !content[lang] || !content[lang].title || !content[lang].description
    )

    const recommendations = []
    if (missingLanguages.length > 0) {
      recommendations.push(`Add missing content for languages: ${missingLanguages.join(', ')}`)
    }

    // Check for hreflang implementation
    const hasHreflang = supportedLanguages.every(lang => {
      const hreflang = lang === 'en' ? 'en-SG' : `${lang}-SG`
      return content[lang]?.hreflang?.includes(hreflang)
    })

    if (!hasHreflang) {
      recommendations.push('Implement proper hreflang attributes for all languages')
    }

    return {
      isComplete: missingLanguages.length === 0,
      missingLanguages,
      recommendations
    }
  }
}

// =============================================================================
// SEO MONITORING SERVICE
// =============================================================================

export class SEOMonitoringService {
  static async getSEOPerformance(): Promise<SEOAnalytics> {
    // In real implementation, this would fetch from analytics APIs
    return {
      organicTraffic: {
        sessions: Math.floor(Math.random() * 10000) + 5000,
        users: Math.floor(Math.random() * 8000) + 4000,
        pageViews: Math.floor(Math.random() * 25000) + 15000,
        bounceRate: Math.round((Math.random() * 30 + 35) * 10) / 10,
        avgSessionDuration: Math.floor(Math.random() * 300) + 180,
        conversionRate: Math.round((Math.random() * 3 + 2) * 10) / 10
      },
      keywordRankings: await this.getKeywordRankings(),
      richSnippets: {
        implemented: ['Doctor', 'MedicalClinic', 'MedicalService', 'LocalBusiness'],
        missing: ['FAQ', 'HowTo', 'Review'],
        errors: []
      },
      technicalSEO: {
        coreWebVitals: {
          lcp: Math.round((Math.random() * 1.5 + 1.5) * 100) / 100,
          fid: Math.floor(Math.random() * 50) + 75,
          cls: Math.round((Math.random() * 0.05 + 0.05) * 100) / 100
        },
        pageSpeed: {
          mobile: Math.floor(Math.random() * 20 + 70),
          desktop: Math.floor(Math.random() * 15 + 80)
        },
        crawlability: {
          indexedPages: Math.floor(Math.random() * 500) + 800,
          blockedPages: Math.floor(Math.random() * 5) + 1,
          errors: Math.floor(Math.random() * 10) + 2
        },
        structuredData: {
          valid: Math.floor(Math.random() * 50) + 120,
          invalid: Math.floor(Math.random() * 5) + 1,
          warnings: Math.floor(Math.random() * 10) + 3
        }
      },
      localSEOPerformance: await LocalSEOService.analyzeLocalSEO([], []),
      healthcareSEOPerformance: await this.getHealthcareSEOPerformance()
    }
  }

  private static async getKeywordRankings(): Promise<KeywordRanking[]> {
    // Mock keyword ranking data
    return [
      {
        keyword: 'clinic near me singapore',
        position: Math.floor(Math.random() * 10) + 1,
        url: '/clinics/singapore',
        searchVolume: Math.floor(Math.random() * 5000) + 2000,
        difficulty: Math.floor(Math.random() * 50) + 30,
        trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as any,
        language: 'en',
        device: 'mobile',
        location: 'Singapore',
        lastUpdated: new Date()
      },
      {
        keyword: 'GP singapore',
        position: Math.floor(Math.random() * 15) + 1,
        url: '/doctors/general-practice',
        searchVolume: Math.floor(Math.random() * 3000) + 1000,
        difficulty: Math.floor(Math.random() * 60) + 40,
        trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as any,
        language: 'en',
        device: 'desktop',
        location: 'Singapore',
        lastUpdated: new Date()
      }
    ]
  }

  private static async getHealthcareSEOPerformance(): Promise<HealthcareSEOPerformance> {
    return {
      medicalKeywordRankings: await this.getKeywordRankings(),
      healthcareRichSnippets: {
        doctorProfiles: Math.floor(Math.random() * 20) + 15,
        clinicInfo: Math.floor(Math.random() * 30) + 25,
        medicalServices: Math.floor(Math.random() * 25) + 20,
        reviews: Math.floor(Math.random() * 15) + 10
      },
      emergencyCareSEO: {
        urgentCareRankings: await this.getKeywordRankings(),
        afterHoursVisibility: Math.floor(Math.random() * 50) + 75
      },
      specializationVisibility: {
        'General Practice': {
          rankings: await this.getKeywordRankings(),
          searchVolume: Math.floor(Math.random() * 5000) + 3000,
          competitionLevel: 'high' as any
        },
        'Cardiology': {
          rankings: await this.getKeywordRankings(),
          searchVolume: Math.floor(Math.random() * 2000) + 1000,
          competitionLevel: 'medium' as any
        }
      }
    }
  }

  static calculateSEOScore(analytics: SEOAnalytics): SEOScore {
    const weights = {
      technical: 0.25,
      content: 0.20,
      local: 0.20,
      healthcare: 0.15,
      performance: 0.10,
      userExperience: 0.10
    }

    // Calculate individual scores (simplified)
    const technical = this.calculateTechnicalScore(analytics.technicalSEO)
    const content = this.calculateContentScore(analytics.organicTraffic, analytics.richSnippets)
    const local = this.calculateLocalScore(analytics.localSEOPerformance)
    const healthcare = this.calculateHealthcareScore(analytics.healthcareSEOPerformance)
    const performance = this.calculatePerformanceScore(analytics.organicTraffic)
    const userExperience = this.calculateUserExperienceScore(analytics.organicTraffic, analytics.technicalSEO)

    const overall = (
      technical * weights.technical +
      content * weights.content +
      local * weights.local +
      healthcare * weights.healthcare +
      performance * weights.performance +
      userExperience * weights.userExperience
    )

    return {
      overall: Math.round(overall),
      technical: Math.round(technical),
      content: Math.round(content),
      local: Math.round(local),
      healthcare: Math.round(healthcare),
      performance: Math.round(performance),
      userExperience: Math.round(userExperience),
      factors: [
        { factor: 'Core Web Vitals', score: technical, weight: 0.15, impact: 'high' as any },
        { factor: 'Page Speed', score: performance, weight: 0.10, impact: 'medium' as any },
        { factor: 'Local SEO', score: local, weight: 0.20, impact: 'high' as any },
        { factor: 'Medical Content', score: healthcare, weight: 0.15, impact: 'high' as any },
        { factor: 'Mobile Optimization', score: technical, weight: 0.10, impact: 'medium' as any },
        { factor: 'User Experience', score: userExperience, weight: 0.10, impact: 'medium' as any }
      ]
    }
  }

  private static calculateTechnicalScore(seo: any): number {
    const lcpScore = seo.coreWebVitals.lcp <= 2.5 ? 90 : seo.coreWebVitals.lcp <= 4.0 ? 70 : 50
    const fidScore = seo.coreWebVitals.fid <= 100 ? 90 : seo.coreWebVitals.fid <= 300 ? 70 : 50
    const clsScore = seo.coreWebVitals.cls <= 0.1 ? 90 : seo.coreWebVitals.cls <= 0.25 ? 70 : 50
    
    return Math.round((lcpScore + fidScore + clsScore) / 3)
  }

  private static calculateContentScore(traffic: any, snippets: any): number {
    const trafficScore = Math.min(traffic.conversionRate * 30, 90)
    const snippetScore = (snippets.implemented.length / (snippets.implemented.length + snippets.missing.length)) * 100
    
    return Math.round((trafficScore + snippetScore) / 2)
  }

  private static calculateLocalScore(performance: any): number {
    const packScore = Math.min((50 - performance.averageLocalRank) * 20, 90)
    const reviewScore = Math.min(performance.reviews.rating * 20, 90)
    
    return Math.round((packScore + reviewScore) / 2)
  }

  private static calculateHealthcareScore(performance: any): number {
    const doctorSnippetScore = Math.min(performance.healthcareRichSnippets.doctorProfiles * 5, 90)
    const clinicSnippetScore = Math.min(performance.healthcareRichSnippets.clinicInfo * 3, 90)
    
    return Math.round((doctorSnippetScore + clinicSnippetScore) / 2)
  }

  private static calculatePerformanceScore(traffic: any): number {
    return Math.min(traffic.avgSessionDuration / 4, 90)
  }

  private static calculateUserExperienceScore(traffic: any, seo: any): number {
    const bounceScore = Math.max(90 - traffic.bounceRate, 30)
    const speedScore = seo.pageSpeed.mobile
    
    return Math.round((bounceScore + speedScore) / 2)
  }
}

// =============================================================================
// SEO EXPORT
// =============================================================================

export const seoServices = {
  core: CoreSEOService,
  local: LocalSEOService,
  healthcare: HealthcareSEOService,
  multiLanguage: MultiLanguageSEOService,
  monitoring: SEOMonitoringService,
  schemaFactory: SchemaFactory,
  sitemapGenerator: SitemapGenerator,
  robotsGenerator: RobotsConfigGenerator,
  robotsValidator: RobotsValidator
}

export default seoServices