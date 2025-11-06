/**
 * SEO Components for My Family Clinic
 * React components for implementing SEO functionality in healthcare platform
 */

import React, { useEffect } from 'react'
import { useSEO, useSchemaMarkup } from '../hooks/seo-hooks'
import { SEOMetadata } from '../types/seo.types'

// =============================================================================
// SEO METADATA PROVIDER COMPONENT
// =============================================================================

interface SEOProviderProps {
  children: React.ReactNode
  type: string
  data: any
  language?: string
  enableRealTimeUpdates?: boolean
}

export const SEOProvider: React.FC<SEOProviderProps> = ({
  children,
  type,
  data,
  language = 'en',
  enableRealTimeUpdates = false
}) => {
  const { metadata, updateMetadata, isLoading, error } = useSEO()

  useEffect(() => {
    updateMetadata(type, data, language)
  }, [type, data, language, updateMetadata])

  // Real-time updates based on data changes
  useEffect(() => {
    if (enableRealTimeUpdates && metadata && data) {
      const timer = setTimeout(() => {
        updateMetadata(type, data, language)
      }, 1000) // Debounce updates

      return () => clearTimeout(timer)
    }
  }, [data, enableRealTimeUpdates, metadata, type, language, updateMetadata])

  if (error) {
    console.warn('SEO Provider Error:', error)
  }

  return (
    <>
      {isLoading && (
        <div className="sr-only" aria-live="polite">
          Updating SEO metadata...
        </div>
      )}
      {children}
    </>
  )
}

// =============================================================================
// STRUCTURED DATA PROVIDER COMPONENT
// =============================================================================

interface StructuredDataProviderProps {
  children: React.ReactNode
  schemaType: string
  data: any
  validateSchema?: boolean
  autoInject?: boolean
}

export const StructuredDataProvider: React.FC<StructuredDataProviderProps> = ({
  children,
  schemaType,
  data,
  validateSchema = true,
  autoInject = true
}) => {
  const { structuredData, generateSchema, injectSchemaIntoDOM, isValid, validationErrors } = useSchemaMarkup()

  useEffect(() => {
    if (schemaType && data) {
      generateSchema(schemaType, data)
    }
  }, [schemaType, data, generateSchema])

  useEffect(() => {
    if (autoInject && structuredData) {
      injectSchemaIntoDOM(structuredData)
    }
  }, [structuredData, autoInject, injectSchemaIntoDOM])

  if (validationErrors.length > 0 && validateSchema) {
    console.warn('Schema validation errors:', validationErrors)
  }

  return (
    <>
      {isValid === false && validateSchema && (
        <div className="sr-only" aria-live="polite">
          Schema validation errors detected
        </div>
      )}
      {children}
    </>
  )
}

// =============================================================================
// LOCAL SEO COMPONENT
// =============================================================================

interface LocalSEOProps {
  clinicData: any
  location: string
  children: React.ReactNode
  enableOptimization?: boolean
}

export const LocalSEO: React.FC<LocalSEOProps> = ({
  clinicData,
  location,
  children,
  enableOptimization = true
}) => {
  const { generateLocalSEO, localData, localKeywords, isLoading, error } = useLocalSEO()

  useEffect(() => {
    if (clinicData && location && enableOptimization) {
      generateLocalSEO(clinicData, location)
    }
  }, [clinicData, location, enableOptimization, generateLocalSEO])

  if (error) {
    console.warn('Local SEO Error:', error)
  }

  return (
    <div data-local-seo-optimized={enableOptimization}>
      {isLoading && (
        <div className="sr-only" aria-live="polite">
          Optimizing for local search...
        </div>
      )}
      <div data-local-keywords={localKeywords.join(',')} hidden>
        Local keywords: {localKeywords.join(', ')}
      </div>
      {children}
    </div>
  )
}

// =============================================================================
// HEALTHCARE SEO COMPONENT
// =============================================================================

interface HealthcareSEOProps {
  doctorData?: any
  specialty?: string
  content?: string
  includeEmergencyInfo?: boolean
  children: React.ReactNode
}

export const HealthcareSEO: React.FC<HealthcareSEOProps> = ({
  doctorData,
  specialty,
  content,
  includeEmergencyInfo = false,
  children
}) => {
  const {
    medicalKeywords,
    healthierSGKeywords,
    emergencyKeywords,
    contentValidation,
    generateMedicalKeywords,
    loadHealthierSGKeywords,
    loadEmergencyKeywords,
    validateMedicalContent
  } = useHealthcareSEO()

  useEffect(() => {
    if (doctorData) {
      generateMedicalKeywords(doctorData)
    }
    loadHealthierSGKeywords()
    loadEmergencyKeywords()
  }, [doctorData, generateMedicalKeywords, loadHealthierSGKeywords, loadEmergencyKeywords])

  useEffect(() => {
    if (content) {
      validateMedicalContent(content)
    }
  }, [content, validateMedicalContent])

  const hasEmergencyInfo = includeEmergencyInfo && emergencyKeywords.length > 0
  const medicalCompliance = contentValidation?.medicalCompliance || false

  return (
    <div 
      data-healthcare-seo 
      data-specialty={specialty}
      data-compliance-score={medicalCompliance ? 100 : 0}
    >
      {/* Emergency information for screen readers */}
      {hasEmergencyInfo && (
        <div className="sr-only" aria-live="polite">
          Emergency medical services available 24/7. Call 995 for immediate assistance.
        </div>
      )}
      
      {/* Medical compliance indicator for developers */}
      {contentValidation && (
        <div 
          data-medical-compliance={medicalCompliance}
          data-content-score={contentValidation.isOptimized ? 100 : 0}
          hidden
        >
          Medical content validation score: {contentValidation.isOptimized ? 'Optimized' : 'Needs improvement'}
        </div>
      )}

      {children}
    </div>
  )
}

// =============================================================================
// MULTI-LANGUAGE SEO COMPONENT
// =============================================================================

interface MultiLanguageSEOProps {
  currentPath: string
  currentLanguage: string
  supportedLanguages?: string[]
  children: React.ReactNode
  enableLanguageSwitching?: boolean
}

export const MultiLanguageSEO: React.FC<MultiLanguageSEOProps> = ({
  currentPath,
  currentLanguage,
  supportedLanguages = ['en', 'zh', 'ms', 'ta'],
  children,
  enableLanguageSwitching = true
}) => {
  const { 
    supportedLanguages: loadedLanguages,
    generateHreflangTags,
    switchLanguage,
    hreflangTags,
    isLoading
  } = useMultiLanguageSEO()

  useEffect(() => {
    if (currentPath && currentLanguage) {
      generateHreflangTags(currentPath, currentLanguage)
    }
  }, [currentPath, currentLanguage, generateHreflangTags])

  const handleLanguageSwitch = (newLanguage: string) => {
    if (enableLanguageSwitching && newLanguage !== currentLanguage) {
      switchLanguage(newLanguage)
      // In a real implementation, this would trigger a route change
      console.log(`Switching to language: ${newLanguage}`)
    }
  }

  return (
    <div 
      data-current-language={currentLanguage}
      data-supported-languages={loadedLanguages.join(',')}
    >
      {/* Language switching controls for accessibility */}
      {enableLanguageSwitching && (
        <div className="sr-only" role="navigation" aria-label="Language selection">
          <div>Current language: {currentLanguage}</div>
          <div>Available languages: {loadedLanguages.join(', ')}</div>
        </div>
      )}

      {/* Hreflang tags for search engines */}
      {hreflangTags.length > 0 && (
        <div hidden>
          Hreflang alternates: {hreflangTags.map(tag => `${tag.hreflang}:${tag.href}`).join(', ')}
        </div>
      )}

      {isLoading && (
        <div className="sr-only" aria-live="polite">
          Loading multi-language SEO data...
        </div>
      )}

      {children}
    </div>
  )
}

// =============================================================================
// SEO MONITORING DASHBOARD COMPONENT
// =============================================================================

interface SEOMonitoringDashboardProps {
  refreshInterval?: number
  showAdvancedMetrics?: boolean
  compact?: boolean
}

export const SEOMonitoringDashboard: React.FC<SEOMonitoringDashboardProps> = ({
  refreshInterval = 300000, // 5 minutes
  showAdvancedMetrics = false,
  compact = false
}) => {
  const { analytics, seoScore, loadSEOAnalytics, loadTopKeywords, isLoading } = useSEOMonitoring()
  const [topKeywords, setTopKeywords] = React.useState<any[]>([])

  useEffect(() => {
    loadSEOAnalytics()
    loadTopKeywords(5).then(setTopKeywords)

    const interval = setInterval(() => {
      loadSEOAnalytics()
      loadTopKeywords(5).then(setTopKeywords)
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [loadSEOAnalytics, loadTopKeywords, refreshInterval])

  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-4" role="status" aria-live="polite">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-900">SEO Score</div>
            <div className="text-2xl font-bold text-blue-600">
              {seoScore?.overall || 0}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">Keywords Tracked</div>
            <div className="text-2xl font-bold text-green-600">
              {analytics?.keywordRankings.length || 0}
            </div>
          </div>
        </div>
        {isLoading && (
          <div className="text-sm text-gray-500 mt-2">Updating...</div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6" role="region" aria-label="SEO Performance Dashboard">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">SEO Performance</h2>
        {isLoading && (
          <div className="text-sm text-gray-500">Updating...</div>
        )}
      </div>

      {/* SEO Score */}
      {seoScore && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{seoScore.overall}</div>
            <div className="text-sm text-gray-600">Overall SEO</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{seoScore.technical}</div>
            <div className="text-sm text-gray-600">Technical</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{seoScore.local}</div>
            <div className="text-sm text-gray-600">Local SEO</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{seoScore.healthcare}</div>
            <div className="text-sm text-gray-600">Healthcare</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{seoScore.performance}</div>
            <div className="text-sm text-gray-600">Performance</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">{seoScore.userExperience}</div>
            <div className="text-sm text-gray-600">User Experience</div>
          </div>
        </div>
      )}

      {/* Top Keywords */}
      {topKeywords.length > 0 && (
        <div className="mb-6">
          <h3 className="text-md font-semibold text-gray-900 mb-3">Top Performing Keywords</h3>
          <div className="space-y-2">
            {topKeywords.map((keyword, index) => (
              <div key={index} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                <span className="text-sm font-medium">{keyword.keyword}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">#{keyword.position}</span>
                  <span className="text-xs text-gray-500">{keyword.searchVolume.toLocaleString()} searches</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Core Web Vitals */}
      {analytics?.technicalSEO?.coreWebVitals && (
        <div className="mb-6">
          <h3 className="text-md font-semibold text-gray-900 mb-3">Core Web Vitals</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-lg font-semibold">
                {analytics.technicalSEO.coreWebVitals.lcp}s
              </div>
              <div className="text-sm text-gray-600">LCP</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-lg font-semibold">
                {analytics.technicalSEO.coreWebVitals.fid}ms
              </div>
              <div className="text-sm text-gray-600">FID</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-lg font-semibold">
                {analytics.technicalSEO.coreWebVitals.cls}
              </div>
              <div className="text-sm text-gray-600">CLS</div>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Metrics */}
      {showAdvancedMetrics && analytics && (
        <div>
          <h3 className="text-md font-semibold text-gray-900 mb-3">Advanced Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded">
              <div className="text-lg font-semibold text-blue-600">
                {analytics.organicTraffic.sessions.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Organic Sessions</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded">
              <div className="text-lg font-semibold text-green-600">
                {analytics.organicTraffic.conversionRate}%
              </div>
              <div className="text-sm text-gray-600">Conversion Rate</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded">
              <div className="text-lg font-semibold text-purple-600">
                {analytics.localSEOPerformance.localPackAppearances}
              </div>
              <div className="text-sm text-gray-600">Local Pack</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded">
              <div className="text-lg font-semibold text-orange-600">
                {analytics.healthcareSEOPerformance.healthcareRichSnippets.doctorProfiles}
              </div>
              <div className="text-sm text-gray-600">Rich Snippets</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// =============================================================================
// KEYWORD RESEARCH COMPONENT
// =============================================================================

interface KeywordResearchProps {
  content: string
  targetKeywords?: string[]
  showDensityAnalysis?: boolean
  showOpportunities?: boolean
}

export const KeywordResearch: React.FC<KeywordResearchProps> = ({
  content,
  targetKeywords = [],
  showDensityAnalysis = true,
  showOpportunities = true
}) => {
  const { analyzeKeywords, keywordDensity, primaryKeyword, keywordOpportunities } = useKeywordResearch()

  useEffect(() => {
    if (content && targetKeywords.length > 0) {
      analyzeKeywords(content, targetKeywords)
    }
  }, [content, targetKeywords, analyzeKeywords])

  if (!content) return null

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6" role="region" aria-label="Keyword Research">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Keyword Analysis</h2>
      
      {/* Primary Keyword */}
      {primaryKeyword && (
        <div className="mb-4 p-3 bg-blue-50 rounded">
          <div className="text-sm text-gray-600">Primary Keyword</div>
          <div className="text-lg font-semibold text-blue-600">{primaryKeyword}</div>
        </div>
      )}

      {/* Keyword Density */}
      {showDensityAnalysis && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Average Keyword Density</span>
            <span className="text-sm text-gray-600">{keywordDensity.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                keywordDensity >= 1 && keywordDensity <= 3 ? 'bg-green-500' : 'bg-orange-500'
              }`}
              style={{ width: `${Math.min(keywordDensity * 10, 100)}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Recommended: 1-3%
          </div>
        </div>
      )}

      {/* Keyword Opportunities */}
      {showOpportunities && keywordOpportunities.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Keyword Opportunities</h3>
          <div className="space-y-2">
            {keywordOpportunities.map((opportunity, index) => (
              <div key={index} className="flex justify-between items-center py-2 px-3 bg-yellow-50 rounded">
                <span className="text-sm">{opportunity}</span>
                <span className="text-xs text-yellow-600 font-medium">Opportunity</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// =============================================================================
// SOCIAL MEDIA OPTIMIZATION COMPONENT
// =============================================================================

interface SocialMediaOptimizationProps {
  title: string
  description: string
  image?: string
  url: string
  siteName?: string
  showPreview?: boolean
}

export const SocialMediaOptimization: React.FC<SocialMediaOptimizationProps> = ({
  title,
  description,
  image,
  url,
  siteName = 'My Family Clinic',
  showPreview = true
}) => {
  useEffect(() => {
    // Update Open Graph meta tags
    const updateMetaTag = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute('property', property)
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', content)
    }

    // Open Graph tags
    updateMetaTag('og:title', title)
    updateMetaTag('og:description', description)
    updateMetaTag('og:url', url)
    updateMetaTag('og:type', 'website')
    updateMetaTag('og:site_name', siteName)
    if (image) {
      updateMetaTag('og:image', image)
    }

    // Twitter Card tags
    const updateTwitterTag = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute('name', name)
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', content)
    }

    updateTwitterTag('twitter:card', image ? 'summary_large_image' : 'summary')
    updateTwitterTag('twitter:title', title)
    updateTwitterTag('twitter:description', description)
    if (image) {
      updateTwitterTag('twitter:image', image)
    }
  }, [title, description, image, url, siteName])

  return (
    <div className="sr-only" aria-hidden="true">
      <div>Social media optimization active for: {title}</div>
      {image && <div>Image configured: {image}</div>}
      <div>URL: {url}</div>
    </div>
  )
}

// =============================================================================
// EXPORTS
// =============================================================================

export const SEOComponents = {
  SEOProvider,
  StructuredDataProvider,
  LocalSEO,
  HealthcareSEO,
  MultiLanguageSEO,
  SEOMonitoringDashboard,
  KeywordResearch,
  SocialMediaOptimization
}

export default SEOComponents