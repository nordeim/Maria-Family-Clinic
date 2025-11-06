/**
 * SEO React Hooks for My Family Clinic
 * Custom hooks for implementing SEO functionality in React components
 */

import { useState, useEffect, useCallback } from 'react'
import { 
  SEOMetadata, 
  HealthcareSEOMetadata, 
  SEOAnalytics,
  KeywordRanking,
  SearchPerformanceMetrics,
  SEOScore
} from '../types/seo.types'
import {
  CoreSEOService,
  LocalSEOService,
  HealthcareSEOService,
  MultiLanguageSEOService,
  SEOMonitoringService
} from '../services/seo-services'
import { SEO_CONFIG } from '../config/seo.config'

// =============================================================================
// META TAG MANAGEMENT HOOK
// =============================================================================

export function useSEO() {
  const [metadata, setMetadata] = useState<SEOMetadata | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateMetadata = useCallback(async (type: string, data: any, language: string = 'en') => {
    setIsLoading(true)
    setError(null)
    
    try {
      const newMetadata = await CoreSEOService.generatePageMetadata(type, data, language)
      setMetadata(newMetadata)
      
      // Update document head
      updateDocumentHead(newMetadata)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update SEO metadata'
      setError(errorMessage)
      console.error('SEO metadata update failed:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateDocumentHead = (meta: SEOMetadata) => {
    // Update title
    if (typeof window !== 'undefined' && window.document) {
      document.title = meta.title

      // Update meta description
      let descriptionMeta = document.querySelector('meta[name="description"]')
      if (!descriptionMeta) {
        descriptionMeta = document.createElement('meta')
        descriptionMeta.setAttribute('name', 'description')
        document.head.appendChild(descriptionMeta)
      }
      descriptionMeta.setAttribute('content', meta.description)

      // Update keywords
      let keywordsMeta = document.querySelector('meta[name="keywords"]')
      if (meta.keywords && meta.keywords.length > 0) {
        if (!keywordsMeta) {
          keywordsMeta = document.createElement('meta')
          keywordsMeta.setAttribute('name', 'keywords')
          document.head.appendChild(keywordsMeta)
        }
        keywordsMeta.setAttribute('content', meta.keywords.join(', '))
      }

      // Update Open Graph tags
      if (meta.ogTitle) {
        updateOrCreateMetaTag('property', 'og:title', meta.ogTitle)
      }
      if (meta.ogDescription) {
        updateOrCreateMetaTag('property', 'og:description', meta.ogDescription)
      }
      if (meta.ogImage) {
        updateOrCreateMetaTag('property', 'og:image', meta.ogImage)
      }
      if (meta.ogUrl) {
        updateOrCreateMetaTag('property', 'og:url', meta.ogUrl)
      }

      // Update Twitter Card tags
      if (meta.twitterTitle) {
        updateOrCreateMetaTag('name', 'twitter:title', meta.twitterTitle)
      }
      if (meta.twitterDescription) {
        updateOrCreateMetaTag('name', 'twitter:description', meta.twitterDescription)
      }
      if (meta.twitterImage) {
        updateOrCreateMetaTag('name', 'twitter:image', meta.twitterImage)
      }

      // Update canonical URL
      if (meta.canonical) {
        updateOrCreateLinkTag('canonical', meta.canonical)
      }

      // Update robots meta
      if (meta.robots) {
        updateOrCreateMetaTag('name', 'robots', meta.robots)
      }

      // Update language
      if (meta.language) {
        document.documentElement.lang = meta.language.split('-')[0]
      }

      // Add hreflang tags
      if (meta.hreflang && meta.hreflang.length > 0) {
        // Remove existing hreflang tags
        document.querySelectorAll('link[hreflang]').forEach(el => el.remove())
        
        // Add new hreflang tags
        meta.hreflang.forEach(hreflang => {
          const linkTag = document.createElement('link')
          linkTag.setAttribute('rel', 'alternate')
          linkTag.setAttribute('hreflang', hreflang.hreflang)
          linkTag.setAttribute('href', hreflang.href)
          document.head.appendChild(linkTag)
        })
      }

      // Add structured data
      if (meta.structuredData) {
        // Remove existing structured data
        const existingStructuredData = document.querySelector('script[type="application/ld+json"]')
        if (existingStructuredData) {
          existingStructuredData.remove()
        }

        // Add new structured data
        const script = document.createElement('script')
        script.type = 'application/ld+json'
        script.textContent = JSON.stringify(meta.structuredData)
        document.head.appendChild(script)
      }
    }
  }

  const updateOrCreateMetaTag = (attribute: string, value: string, content: string) => {
    const selector = attribute === 'property' ? `meta[property="${value}"]` : `meta[name="${value}"]`
    let metaTag = document.querySelector(selector) as HTMLMetaElement
    
    if (!metaTag) {
      metaTag = document.createElement('meta')
      metaTag.setAttribute(attribute, value)
      document.head.appendChild(metaTag)
    }
    metaTag.setAttribute('content', content)
  }

  const updateOrCreateLinkTag = (rel: string, href: string) => {
    let linkTag = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement
    
    if (!linkTag) {
      linkTag = document.createElement('link')
      linkTag.setAttribute('rel', rel)
      document.head.appendChild(linkTag)
    }
    linkTag.setAttribute('href', href)
  }

  const validateMetadata = useCallback((meta: SEOMetadata) => {
    return CoreSEOService.validateSEOMetadata(meta)
  }, [])

  return {
    metadata,
    isLoading,
    error,
    updateMetadata,
    validateMetadata
  }
}

// =============================================================================
// LOCAL SEO HOOK
// =============================================================================

export function useLocalSEO() {
  const [localData, setLocalData] = useState<any>(null)
  const [localKeywords, setLocalKeywords] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateLocalSEO = useCallback(async (clinicData: any, location: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const { optimizedData, keywords, structuredData } = 
        LocalSEOService.optimizeForLocalSearch(clinicData, location)
      
      setLocalData({ optimizedData, structuredData })
      setLocalKeywords(keywords)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate local SEO data'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getLocalKeywords = useCallback(async (location: string) => {
    try {
      const keywords = LocalSEOService.generateLocalKeywords(location)
      setLocalKeywords(keywords)
      return keywords
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate local keywords')
      return []
    }
  }, [])

  const generateLocalSchema = useCallback(async (location: string) => {
    try {
      return LocalSEOService.getLocalSchema(location)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate local schema')
      return null
    }
  }, [])

  return {
    localData,
    localKeywords,
    isLoading,
    error,
    generateLocalSEO,
    getLocalKeywords,
    generateLocalSchema
  }
}

// =============================================================================
// HEALTHCARE SEO HOOK
// =============================================================================

export function useHealthcareSEO() {
  const [medicalKeywords, setMedicalKeywords] = useState<string[]>([])
  const [healthierSGKeywords, setHealthierSGKeywords] = useState<string[]>([])
  const [emergencyKeywords, setEmergencyKeywords] = useState<string[]>([])
  const [contentValidation, setContentValidation] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateMedicalKeywords = useCallback(async (doctorData: any) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const keywords = HealthcareSEOService.generateMedicalKeywords(doctorData)
      setMedicalKeywords(keywords)
      return keywords
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate medical keywords'
      setError(errorMessage)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadHealthierSGKeywords = useCallback(async () => {
    try {
      const keywords = HealthcareSEOService.generateHealthierSGKeywords()
      setHealthierSGKeywords(keywords)
      return keywords
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load Healthier SG keywords')
      return []
    }
  }, [])

  const loadEmergencyKeywords = useCallback(async () => {
    try {
      const keywords = HealthcareSEOService.generateEmergencyCareKeywords()
      setEmergencyKeywords(keywords)
      return keywords
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load emergency keywords')
      return []
    }
  }, [])

  const validateMedicalContent = useCallback(async (content: string) => {
    try {
      const validation = HealthcareSEOService.validateMedicalContent(content)
      setContentValidation(validation)
      return validation
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate medical content')
      return null
    }
  }, [])

  const generateSpecialistContent = useCallback(async (specialty: string, conditions?: string[]) => {
    try {
      return HealthcareSEOService.generateSpecialistContent(specialty, conditions)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate specialist content')
      return null
    }
  }, [])

  return {
    medicalKeywords,
    healthierSGKeywords,
    emergencyKeywords,
    contentValidation,
    isLoading,
    error,
    generateMedicalKeywords,
    loadHealthierSGKeywords,
    loadEmergencyKeywords,
    validateMedicalContent,
    generateSpecialistContent
  }
}

// =============================================================================
// MULTI-LANGUAGE SEO HOOK
// =============================================================================

export function useMultiLanguageSEO() {
  const [supportedLanguages, setSupportedLanguages] = useState<string[]>([])
  const [currentLanguage, setCurrentLanguage] = useState<string>('en')
  const [hreflangTags, setHreflangTags] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadSupportedLanguages = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const languages = MultiLanguageSEOService.getSupportedLanguages()
      setSupportedLanguages(languages)
      return languages
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load supported languages'
      setError(errorMessage)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  const generateHreflangTags = useCallback(async (path: string, currentLang: string) => {
    try {
      const tags = MultiLanguageSEOService.generateHreflangTags(path, currentLang)
      setHreflangTags(tags)
      return tags
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate hreflang tags')
      return []
    }
  }, [])

  const translateMetadata = useCallback(async (
    metadata: SEOMetadata,
    sourceLanguage: string,
    targetLanguage: string
  ) => {
    setIsLoading(true)
    setError(null)
    
    try {
      return MultiLanguageSEOService.translateSEOMetadata(metadata, sourceLanguage, targetLanguage)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to translate metadata'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const validateLanguageSEO = useCallback(async (content: Record<string, any>) => {
    try {
      return MultiLanguageSEOService.validateLanguageSEO(content, supportedLanguages)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate language SEO')
      return null
    }
  }, [supportedLanguages])

  const switchLanguage = useCallback((language: string) => {
    setCurrentLanguage(language)
    // In a real implementation, this would trigger a route change or content update
  }, [])

  return {
    supportedLanguages,
    currentLanguage,
    hreflangTags,
    isLoading,
    error,
    loadSupportedLanguages,
    generateHreflangTags,
    translateMetadata,
    validateLanguageSEO,
    switchLanguage
  }
}

// =============================================================================
// SEO MONITORING HOOK
// =============================================================================

export function useSEOMonitoring() {
  const [analytics, setAnalytics] = useState<SEOAnalytics | null>(null)
  const [performanceMetrics, setPerformanceMetrics] = useState<SearchPerformanceMetrics | null>(null)
  const [seoScore, setSeoScore] = useState<SEOScore | null>(null)
  const [topKeywords, setTopKeywords] = useState<KeywordRanking[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadSEOAnalytics = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const data = await SEOMonitoringService.getSEOPerformance()
      setAnalytics(data)
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load SEO analytics'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadPerformanceMetrics = useCallback(async () => {
    try {
      const metrics = await SEOMonitoringService.getSEOPerformance()
      setPerformanceMetrics(metrics)
      return metrics
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load performance metrics')
      return null
    }
  }, [])

  const calculateSEOScore = useCallback(async (analyticsData?: SEOAnalytics) => {
    try {
      const data = analyticsData || analytics
      if (!data) return null

      const score = SEOMonitoringService.calculateSEOScore(data)
      setSeoScore(score)
      return score
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate SEO score')
      return null
    }
  }, [analytics])

  const loadTopKeywords = useCallback(async (limit: number = 10) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const keywords = await SEOMonitoringService.getSEOPerformance()
        .then(analytics => analytics.keywordRankings)
        .then(rankings => rankings.slice(0, limit))
      
      setTopKeywords(keywords)
      return keywords
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load top keywords'
      setError(errorMessage)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Auto-refresh analytics every 5 minutes
  useEffect(() => {
    loadSEOAnalytics()
    
    const interval = setInterval(() => {
      loadSEOAnalytics()
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [loadSEOAnalytics])

  return {
    analytics,
    performanceMetrics,
    seoScore,
    topKeywords,
    isLoading,
    error,
    loadSEOAnalytics,
    loadPerformanceMetrics,
    calculateSEOScore,
    loadTopKeywords
  }
}

// =============================================================================
// KEYWORD RESEARCH HOOK
// =============================================================================

export function useKeywordResearch() {
  const [keywordOpportunities, setKeywordOpportunities] = useState<any[]>([])
  const [competitorKeywords, setCompetitorKeywords] = useState<any[]>([])
  const [keywordDensity, setKeywordDensity] = useState<number>(0)
  const [primaryKeyword, setPrimaryKeyword] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyzeKeywords = useCallback(async (content: string, targetKeywords: string[]) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const density = targetKeywords.map(keyword => 
        calculateKeywordDensity(content, keyword)
      ).reduce((sum, d) => sum + d, 0) / targetKeywords.length

      setKeywordDensity(density)
      
      const primary = extractPrimaryKeyword(content)
      setPrimaryKeyword(primary)

      return {
        density,
        primary,
        opportunities: generateKeywordOpportunities(content, targetKeywords)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze keywords'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const calculateKeywordDensity = (text: string, keyword: string): number => {
    const cleanText = text.toLowerCase()
    const keywordLower = keyword.toLowerCase()
    const wordCount = cleanText.split(/\s+/).length
    const keywordCount = (cleanText.match(new RegExp(keywordLower, 'g')) || []).length
    
    return wordCount > 0 ? Math.round((keywordCount / wordCount) * 1000) / 10 : 0
  }

  const extractPrimaryKeyword = (text: string): string => {
    const words = text.toLowerCase().split(' ')
    const priorityWords = ['doctor', 'clinic', 'healthcare', 'medical', 'singapore']
    
    const priorityMatch = words.find(word =>
      priorityWords.some(priority => word.includes(priority))
    )
    
    return priorityMatch || words.find(word => word.length > 3) || words[0] || ''
  }

  const generateKeywordOpportunities = (content: string, targetKeywords: string[]) => {
    const medicalTerms = [
      'health screening', 'medical consultation', 'preventive care',
      'chronic disease management', 'health check up', 'GP consultation',
      'specialist referral', 'health education', 'wellness programme'
    ]

    return medicalTerms.filter(term => 
      !content.toLowerCase().includes(term.toLowerCase())
    ).slice(0, 5)
  }

  return {
    keywordOpportunities,
    competitorKeywords,
    keywordDensity,
    primaryKeyword,
    isLoading,
    error,
    analyzeKeywords
  }
}

// =============================================================================
// SCHEMA MARKUP HOOK
// =============================================================================

export function useSchemaMarkup() {
  const [structuredData, setStructuredData] = useState<any>(null)
  const [schemaType, setSchemaType] = useState<string>('')
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateSchema = useCallback(async (type: string, data: any) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const schema = CoreSEOService.generateStructuredData(type, data)
      setStructuredData(schema)
      setSchemaType(type)
      
      // Validate schema
      const validation = validateStructuredData(schema)
      setIsValid(validation.isValid)
      setValidationErrors(validation.errors)
      
      return schema
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate schema markup'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const validateStructuredData = (data: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []
    
    if (!data['@context']) {
      errors.push('Missing @context property')
    }
    if (!data['@type']) {
      errors.push('Missing @type property')
    }
    
    // Type-specific validations
    if (data['@type'] === 'Physician') {
      if (!data.name) errors.push('Doctor schema missing name property')
      if (!data.medicalSpecialty) errors.push('Doctor schema missing medicalSpecialty property')
    }
    
    if (data['@type'] === 'MedicalClinic') {
      if (!data.name) errors.push('Clinic schema missing name property')
      if (!data.address) errors.push('Clinic schema missing address property')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  const injectSchemaIntoDOM = useCallback((schema: any) => {
    if (typeof window !== 'undefined' && window.document) {
      // Remove existing schema
      const existingSchema = document.querySelector('script[type="application/ld+json"]')
      if (existingSchema) {
        existingSchema.remove()
      }
      
      // Add new schema
      const script = document.createElement('script')
      script.type = 'application/ld+json'
      script.textContent = JSON.stringify(schema)
      document.head.appendChild(script)
    }
  }, [])

  return {
    structuredData,
    schemaType,
    isValid,
    validationErrors,
    isLoading,
    error,
    generateSchema,
    injectSchemaIntoDOM
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export const seoHooks = {
  useSEO,
  useLocalSEO,
  useHealthcareSEO,
  useMultiLanguageSEO,
  useSEOMonitoring,
  useKeywordResearch,
  useSchemaMarkup
}

export default seoHooks