/**
 * SEO System Main Export
 * My Family Clinic Healthcare Platform SEO System
 * 
 * Comprehensive SEO implementation for Singapore healthcare market
 */

export * from './types/seo.types'
export * from './config/seo.config'
export * from './services/seo-services'
export * from './utils/seo-utils'
export * from './utils/sitemap-generator'
export * from './utils/robots-generator'
export * from './schemas/schema-generators'
export * from './analytics/seo-analytics'
export * from './hooks/seo-hooks'
export * from './components/seo-components'

// Main SEO system export
export const MyFamilyClinicSEO = {
  // Core services
  services: {
    core: 'CoreSEOService',
    local: 'LocalSEOService', 
    healthcare: 'HealthcareSEOService',
    multiLanguage: 'MultiLanguageSEOService',
    monitoring: 'SEOMonitoringService'
  },
  
  // Utilities
  utils: {
    seo: 'SEO Utilities',
    sitemap: 'Sitemap Generator',
    robots: 'Robots Generator'
  },
  
  // Analytics
  analytics: {
    performance: 'SEO Performance Tracker',
    healthcare: 'Healthcare SEO Analytics',
    local: 'Local SEO Analytics',
    competitor: 'Competitor SEO Analysis'
  },
  
  // React Components
  components: {
    SEOProvider: 'Automatic metadata management',
    StructuredDataProvider: 'Schema markup injection',
    LocalSEO: 'Local business optimization',
    HealthcareSEO: 'Medical content optimization',
    MultiLanguageSEO: 'Multi-language support',
    SEOMonitoringDashboard: 'Performance tracking',
    KeywordResearch: 'Content optimization',
    SocialMediaOptimization: 'Social sharing optimization'
  },
  
  // React Hooks
  hooks: {
    useSEO: 'Meta tag management',
    useLocalSEO: 'Local SEO optimization',
    useHealthcareSEO: 'Healthcare content optimization',
    useMultiLanguageSEO: 'Multi-language SEO',
    useSEOMonitoring: 'SEO performance monitoring',
    useKeywordResearch: 'Keyword analysis',
    useSchemaMarkup: 'Schema markup management'
  },
  
  // Configuration
  config: {
    seo: 'SEO Configuration',
    healthcare: 'Healthcare SEO Config',
    singapore: 'Singapore Local SEO Config'
  },
  
  // Features
  features: {
    technicalSEO: 'Meta tags, structured data, sitemaps, robots.txt',
    healthcareSEO: 'Medical schemas, compliance, emergency care',
    localSEO: 'Singapore location optimization, NAP consistency',
    multiLanguageSEO: '4 official Singapore languages (EN, ZH, MS, TA)',
    performanceMonitoring: 'Real-time analytics and tracking',
    schemaMarkup: 'Healthcare-specific structured data',
    contentOptimization: 'Medical content analysis and optimization',
    competitorAnalysis: 'Healthcare market competitive analysis'
  }
}

// Quick setup function for Next.js
export const setupSEO = (config?: {
  baseUrl?: string
  supportedLanguages?: string[]
  enableMonitoring?: boolean
}) => {
  const defaultConfig = {
    baseUrl: 'https://myfamilyclinic.sg',
    supportedLanguages: ['en', 'zh', 'ms', 'ta'],
    enableMonitoring: true,
    ...config
  }
  
  console.log('My Family Clinic SEO System Initialized', {
    config: defaultConfig,
    features: Object.keys(MyFamilyClinicSEO.features),
    timestamp: new Date().toISOString()
  })
  
  return defaultConfig
}

// Default export
export default MyFamilyClinicSEO