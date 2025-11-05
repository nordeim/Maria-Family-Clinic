/**
 * Robots.txt Generator for My Family Clinic
 * Healthcare platform robots.txt configuration with crawling directives
 */

import { RobotsRule, RobotsConfig, RobotsRule } from '../types/seo.types'
import { SEO_CONFIG } from '../config/seo.config'

// =============================================================================
// ROBOTS RULE BUILDER
// =============================================================================

class RobotsRuleBuilder {
  static createAllowRule(userAgent: string, path: string, crawlDelay?: number): RobotsRule {
    const rule: RobotsRule = {
      userAgent,
      allow: [path]
    }

    if (crawlDelay !== undefined) {
      rule.crawlDelay = crawlDelay
    }

    return rule
  }

  static createDisallowRule(userAgent: string, path: string, crawlDelay?: number): RobotsRule {
    const rule: RobotsRule = {
      userAgent,
      disallow: [path]
    }

    if (crawlDelay !== undefined) {
      rule.crawlDelay = crawlDelay
    }

    return rule
  }

  static createBlockedRule(userAgent: string, path: string): RobotsRule {
    return {
      userAgent,
      disallow: [path],
      crawlDelay: 0
    }
  }
}

// =============================================================================
// HEALTHCARE-SPECIFIC ROBOTS RULES
// =============================================================================

class HealthcareRobotsRules {
  static generatePatientDataRules(): RobotsRule[] {
    return [
      // Protect sensitive patient data
      RobotsRuleBuilder.createBlockedRule('*', '/api/patient-data/'),
      RobotsRuleBuilder.createBlockedRule('*', '/dashboard/patient/'),
      RobotsRuleBuilder.createBlockedRule('*', '/medical-records/'),
      RobotsRuleBuilder.createBlockedRule('*', '/appointments/private/'),
      
      // Protect authentication pages
      RobotsRuleBuilder.createBlockedRule('*', '/login'),
      RobotsRuleBuilder.createBlockedRule('*', '/signup'),
      RobotsRuleBuilder.createBlockedRule('*', '/auth/'),
      
      // Protect admin and management areas
      RobotsRuleBuilder.createBlockedRule('*', '/admin/'),
      RobotsRuleBuilder.createBlockedRule('*', '/management/'),
      RobotsRuleBuilder.createBlockedRule('*', '/staff/'),
      
      // Protect development and staging content
      RobotsRuleBuilder.createBlockedRule('*', '/dev/'),
      RobotsRuleBuilder.createBlockedRule('*', '/staging/'),
      RobotsRuleBuilder.createBlockedRule('*', '/test/'),
      RobotsRuleBuilder.createBlockedRule('*', '/_next/'),
      RobotsRuleBuilder.createBlockedRule('*', '/api/'),
    ]
  }

  static generatePublicContentRules(): RobotsRule[] {
    return [
      // Allow public healthcare content
      RobotsRuleBuilder.createAllowRule('*', '/clinics/'),
      RobotsRuleBuilder.createAllowRule('*', '/doctors/'),
      RobotsRuleBuilder.createAllowRule('*', '/services/'),
      RobotsRuleBuilder.createAllowRule('*', '/healthier-sg/'),
      RobotsRuleBuilder.createAllowRule('*', '/blog/'),
      RobotsRuleBuilder.createAllowRule('*', '/contact'),
      RobotsRuleBuilder.createAllowRule('*', '/about'),
      RobotsRuleBuilder.createAllowRule('*', '/privacy-policy'),
      RobotsRuleBuilder.createAllowRule('*', '/terms-of-service'),
      
      // Allow search engines to crawl images
      RobotsRuleBuilder.createAllowRule('*', '/images/public/'),
      
      // Allow CSS and JS for proper rendering
      RobotsRuleBuilder.createAllowRule('*', '/_next/static/'),
      RobotsRuleBuilder.createAllowRule('*', '/css/'),
      RobotsRuleBuilder.createAllowRule('*', '/js/'),
      
      // Allow static assets
      RobotsRuleBuilder.createAllowRule('*', '/public/'),
    ]
  }

  static generateMultiLanguageRules(): RobotsRule[] {
    return [
      // Allow all language versions
      RobotsRuleBuilder.createAllowRule('*', '/zh/'),
      RobotsRuleBuilder.createAllowRule('*', '/ms/'),
      RobotsRuleBuilder.createAllowRule('*', '/ta/'),
      
      // Allow hreflang alternate versions
      RobotsRuleBuilder.createAllowRule('*', '/zh/*'),
      RobotsRuleBuilder.createAllowRule('*', '/ms/*'),
      RobotsRuleBuilder.createAllowRule('*', '/ta/*'),
    ]
  }

  static generateCrawlerSpecificRules(): RobotsRule[] {
    const googleBot = RobotsRuleBuilder.createAllowRule('Googlebot', '/', 1)
    googleBot.allow = ['/']
    googleBot.disallow = [
      '/api/',
      '/admin/',
      '/dashboard/',
      '/_next/',
      '/*.json$',
      '/temp/'
    ]
    googleBot.sitemap = [`${SEO_CONFIG.baseUrl}/sitemap.xml`]

    const bingBot = RobotsRuleBuilder.createAllowRule('bingbot', '/', 2)
    bingBot.sitemap = [`${SEO_CONFIG.baseUrl}/sitemap.xml`]

    const facebookBot = RobotsRuleBuilder.createAllowRule('facebookexternalhit', '/', 1)
    facebookBot.sitemap = [`${SEO_CONFIG.baseUrl}/sitemap.xml`]

    return [googleBot, bingBot, facebookBot]
  }

  static generateEmergencyCareRules(): RobotsRule[] {
    return [
      // Ensure emergency information is always accessible
      RobotsRuleBuilder.createAllowRule('*', '/emergency-care/'),
      RobotsRuleBuilder.createAllowRule('*', '/urgent-care/'),
      RobotsRuleBuilder.createAllowRule('*', '/after-hours/'),
      
      // Allow emergency contact information
      RobotsRuleBuilder.createAllowRule('*', '/contact/emergency'),
      
      // High priority for emergency pages
      { 
        userAgent: '*',
        allow: ['/emergency-care/'],
        crawlDelay: 0.5,
        sitemap: [`${SEO_CONFIG.baseUrl}/sitemap.xml`]
      }
    ]
  }
}

// =============================================================================
// SINGAPORE-SPECIFIC ROBOTS RULES
// =============================================================================

class SingaporeRobotsRules {
  static generateLocalSEORules(): RobotsRule[] {
    return [
      // Allow location-based content
      RobotsRuleBuilder.createAllowRule('*', '/clinics/singapore/'),
      RobotsRuleBuilder.createAllowRule('*', '/clinics/central/'),
      RobotsRuleBuilder.createAllowRule('*', '/clinics/north/'),
      RobotsRuleBuilder.createAllowRule('*', '/clinics/south/'),
      RobotsRuleBuilder.createAllowRule('*', '/clinics/east/'),
      RobotsRuleBuilder.createAllowRule('*', '/clinics/west/'),
      
      // Allow Healthier SG content
      RobotsRuleBuilder.createAllowRule('*', '/healthier-sg/'),
      
      // Allow CHAS and government program information
      RobotsRuleBuilder.createAllowRule('*', '/government-programs/'),
      RobotsRuleBuilder.createAllowRule('*', '/subsidies/'),
      RobotsRuleBuilder.createAllowRule('*', '/medisave/'),
      RobotsRuleBuilder.createAllowRule('*', '/medishield/'),
    ]
  }

  static generateHealthcareAuthorityRules(): RobotsRule[] {
    return [
      // Special rules for healthcare authorities
      { 
        userAgent: 'MOH-Singapore-Crawler',
        allow: ['/'],
        crawlDelay: 5,
        sitemap: [`${SEO_CONFIG.baseUrl}/sitemap.xml`]
      },
      
      { 
        userAgent: 'HealthHub-Crawler',
        allow: ['/'],
        crawlDelay: 3,
        sitemap: [`${SEO_CONFIG.baseUrl}/sitemap.xml`]
      }
    ]
  }
}

// =============================================================================
// MOBILE AND ACCESSIBILITY RULES
// =============================================================================

class MobileAccessibilityRules {
  static generateMobileOptimizedRules(): RobotsRule[] {
    return [
      // Mobile-specific resources
      RobotsRuleBuilder.createAllowRule('*', '/mobile/'),
      RobotsRuleBuilder.createAllowRule('*', '/amp/'),
      
      // Progressive Web App resources
      RobotsRuleBuilder.createAllowRule('*', '/manifest.json'),
      RobotsRuleBuilder.createAllowRule('*', '/service-worker.js'),
      RobotsRuleBuilder.createAllowRule('*', '/offline.html'),
    ]
  }

  static generateAccessibilityRules(): RobotsRule[] {
    return [
      // Accessibility resources
      RobotsRuleBuilder.createAllowRule('*', '/accessibility/'),
      RobotsRuleBuilder.createAllowRule('*', '/screen-reader/'),
      RobotsRuleBuilder.createAllowRule('*', '/high-contrast/'),
    ]
  }
}

// =============================================================================
// MALICIOUS BOT PROTECTION
// =============================================================================

class SecurityRobotsRules {
  static generateMaliciousBotProtection(): RobotsRule[] {
    return [
      // Block malicious bots
      RobotsRuleBuilder.createBlockedRule('BadBot', '/'),
      RobotsRuleBuilder.createBlockedRule('EvilBot', '/'),
      RobotsRuleBuilder.createBlockedRule('Wget', '/'),
      RobotsRuleBuilder.createBlockedRule('curl', '/'),
      RobotsRuleBuilder.createBlockedRule('python-requests', '/'),
      RobotsRuleBuilder.createBlockedRule('scrapy', '/'),
      RobotsRuleBuilder.createBlockedRule('crawler', '/'),
      
      // Limit aggressive crawlers
      { 
        userAgent: 'SemrushBot',
        allow: ['/'],
        crawlDelay: 10,
        sitemap: [`${SEO_CONFIG.baseUrl}/sitemap.xml`]
      },
      
      { 
        userAgent: 'AhrefsBot',
        allow: ['/'],
        crawlDelay: 10,
        sitemap: [`${SEO_CONFIG.baseUrl}/sitemap.xml`]
      },
    ]
  }

  static generateRateLimitingRules(): RobotsRule[] {
    return [
      // Conservative crawling for unknown bots
      { 
        userAgent: '*',
        allow: ['/'],
        crawlDelay: 1,
        sitemap: [`${SEO_CONFIG.baseUrl}/sitemap.xml`]
      }
    ]
  }
}

// =============================================================================
// MAIN ROBOTS CONFIG GENERATOR
// =============================================================================

export class RobotsConfigGenerator {
  static generateConfig(): RobotsConfig {
    const rules: RobotsRule[] = []

    // Add all rule categories
    rules.push(...HealthcareRobotsRules.generatePatientDataRules())
    rules.push(...HealthcareRobotsRules.generatePublicContentRules())
    rules.push(...HealthcareRobotsRules.generateMultiLanguageRules())
    rules.push(...HealthcareRobotsRules.generateCrawlerSpecificRules())
    rules.push(...HealthcareRobotsRules.generateEmergencyCareRules())
    rules.push(...SingaporeRobotsRules.generateLocalSEORules())
    rules.push(...SingaporeRobotsRules.generateHealthcareAuthorityRules())
    rules.push(...MobileAccessibilityRules.generateMobileOptimizedRules())
    rules.push(...MobileAccessibilityRules.generateAccessibilityRules())
    rules.push(...SecurityRobotsRules.generateMaliciousBotProtection())
    rules.push(...SecurityRobotsRules.generateRateLimitingRules())

    return {
      rules,
      userAgent: SEO_CONFIG.robots.userAgent,
      rulesEnabled: true,
      debug: process.env.NODE_ENV === 'development'
    }
  }

  static generateRobotsTxt(): string {
    const config = this.generateConfig()
    let robotsTxt = ''

    // Add header comments
    robotsTxt += `# Robots.txt for My Family Clinic - Singapore Healthcare Platform\n`
    robotsTxt += `# Generated on: ${new Date().toISOString()}\n`
    robotsTxt += `# Healthcare-specific crawling directives\n`
    robotsTxt += `# Optimized for Singapore healthcare market\n\n`

    // Add Sitemap location
    robotsTxt += `Sitemap: ${SEO_CONFIG.baseUrl}/sitemap.xml\n`
    robotsTxt += `Sitemap: ${SEO_CONFIG.baseUrl}/sitemap-index.xml\n\n`

    // Group rules by user agent
    const userAgentGroups = this.groupRulesByUserAgent(config.rules)

    Object.entries(userAgentGroups).forEach(([userAgent, rules]) => {
      robotsTxt += `User-agent: ${userAgent}\n`

      // Add allow rules first (more specific)
      const allowRules = rules.filter(rule => rule.allow && rule.allow.length > 0)
      allowRules.forEach(rule => {
        rule.allow!.forEach(path => {
          robotsTxt += `Allow: ${path}\n`
        })
      })

      // Add disallow rules
      const disallowRules = rules.filter(rule => rule.disallow && rule.disallow.length > 0)
      disallowRules.forEach(rule => {
        rule.disallow!.forEach(path => {
          robotsTxt += `Disallow: ${path}\n`
        })
      })

      // Add crawl delay if specified
      const crawlDelay = rules.find(rule => rule.crawlDelay !== undefined)?.crawlDelay
      if (crawlDelay !== undefined) {
        robotsTxt += `Crawl-delay: ${crawlDelay}\n`
      }

      // Add sitemaps if specified
      const sitemaps = rules.flatMap(rule => rule.sitemap || [])
      sitemaps.forEach(sitemap => {
        robotsTxt += `Sitemap: ${sitemap}\n`
      })

      robotsTxt += '\n'
    })

    // Add default wildcard rule if not present
    if (!userAgentGroups['*']) {
      robotsTxt += `User-agent: *\n`
      robotsTxt += `Disallow: /api/\n`
      robotsTxt += `Disallow: /admin/\n`
      robotsTxt += `Disallow: /dashboard/\n`
      robotsTxt += `Disallow: /_next/\n`
      robotsTxt += `Disallow: /*?*\n`
      robotsTxt += `Crawl-delay: 1\n\n`
    }

    return robotsTxt
  }

  static generateEmergencyRobotsTxt(): string {
    const emergencyRules = [
      `User-agent: *`,
      `Allow: /emergency-care/`,
      `Allow: /urgent-care/`,
      `Allow: /contact/emergency`,
      `Disallow: /`,
      ``,
      `Sitemap: ${SEO_CONFIG.baseUrl}/sitemap.xml`
    ]

    return emergencyRules.join('\n')
  }

  static generateDevelopmentRobotsTxt(): string {
    const devRules = [
      `User-agent: *`,
      `Disallow: /`,
      ``,
      `# Development environment - no crawling allowed`,
      `# Sitemap only for development reference`,
      `Sitemap: ${SEO_CONFIG.baseUrl}/sitemap.xml`
    ]

    return devRules.join('\n')
  }

  private static groupRulesByUserAgent(rules: RobotsRule[]): Record<string, RobotsRule[]> {
    const grouped: Record<string, RobotsRule[]> = {}

    rules.forEach(rule => {
      if (!grouped[rule.userAgent]) {
        grouped[rule.userAgent] = []
      }
      grouped[rule.userAgent].push(rule)
    })

    // Sort by specificity (more specific user agents first)
    const sortedAgents = Object.keys(grouped).sort((a, b) => {
      if (a === '*') return 1 // Wildcard last
      if (b === '*') return -1
      return b.length - a.length // Longer names first (more specific)
    })

    const sortedGrouped: Record<string, RobotsRule[]> = {}
    sortedAgents.forEach(agent => {
      sortedGrouped[agent] = grouped[agent]
    })

    return sortedGrouped
  }
}

// =============================================================================
// ROBOTS VALIDATION
// =============================================================================

export class RobotsValidator {
  static validateRobotsRules(config: RobotsConfig): {
    isValid: boolean
    warnings: string[]
    errors: string[]
  } {
    const warnings: string[] = []
    const errors: string[] = []

    // Check if rules are enabled
    if (!config.rulesEnabled) {
      warnings.push('SEO rules are disabled - this may impact search engine crawling')
    }

    // Check for sitemap entries
    const hasSitemap = config.rules.some(rule => rule.sitemap && rule.sitemap.length > 0)
    if (!hasSitemap) {
      warnings.push('No sitemap references found in robots.txt')
    }

    // Check for overly restrictive rules
    const overlyRestrictive = config.rules.filter(rule => {
      const totalPaths = (rule.allow?.length || 0) + (rule.disallow?.length || 0)
      return rule.userAgent === '*' && totalPaths > 20
    })

    if (overlyRestrictive.length > 0) {
      warnings.push('Overly restrictive rules detected for wildcard user-agent')
    }

    // Check for conflicting allow/disallow rules
    config.rules.forEach(rule => {
      if (rule.allow && rule.disallow) {
        const conflictingPaths = rule.allow.filter(allow => 
          rule.disallow!.some(disallow => 
            disallow === allow || disallow === '/' || allow.startsWith(disallow)
          )
        )
        if (conflictingPaths.length > 0) {
          errors.push(`Conflicting allow/disallow rules for user-agent ${rule.userAgent}`)
        }
      }
    })

    // Check for missing public content
    const hasPublicContent = config.rules.some(rule => 
      rule.allow?.some(path => 
        path.includes('/clinics/') || 
        path.includes('/doctors/') || 
        path.includes('/services/')
      )
    )

    if (!hasPublicContent) {
      errors.push('No public healthcare content allowed for crawling')
    }

    return {
      isValid: errors.length === 0,
      warnings,
      errors
    }
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export const robotsUtils = {
  builder: RobotsRuleBuilder,
  healthcare: HealthcareRobotsRules,
  singapore: SingaporeRobotsRules,
  mobile: MobileAccessibilityRules,
  security: SecurityRobotsRules,
  generator: RobotsConfigGenerator,
  validator: RobotsValidator
}

export default robotsUtils