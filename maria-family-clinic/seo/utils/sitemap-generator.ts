/**
 * Sitemap Generator for My Family Clinic
 * Dynamic sitemap generation for healthcare platform with priority ranking
 */

import { SitemapEntry, SitemapIndex } from '../types/seo.types'
import { SEO_CONFIG, SITEMAP_CONFIG } from '../config/seo.config'

// =============================================================================
// SITEMAP ENTRY BUILDER
// =============================================================================

class SitemapEntryBuilder {
  static createEntry(
    url: string, 
    options: {
      lastmod?: string
      changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
      priority?: number
      alternateLanguages?: string[]
    } = {}
  ): SitemapEntry {
    const entry: SitemapEntry = {
      loc: this.normalizeUrl(url),
      lastmod: options.lastmod,
      changefreq: options.changefreq,
      priority: options.priority
    }

    if (options.alternateLanguages && options.alternateLanguages.length > 0) {
      entry.alternate = options.alternateLanguages.map(lang => ({
        hreflang: lang,
        href: this.buildLanguageUrl(url, lang)
      }))
    }

    return entry
  }

  private static normalizeUrl(url: string): string {
    // Ensure URL starts with base URL and is properly formatted
    if (url.startsWith('http')) {
      return url
    }
    
    return `${SEO_CONFIG.baseUrl}${url.startsWith('/') ? '' : '/'}${url}`
  }

  private static buildLanguageUrl(url: string, language: string): string {
    // For English, use the base URL
    if (language === 'en') {
      return this.normalizeUrl(url)
    }
    
    // For other languages, add language prefix
    const langPrefix = `/${language}`
    const pathWithoutLang = url.replace(/^\/[a-z]{2}\//, '/') // Remove existing lang prefix if present
    
    return this.normalizeUrl(`${langPrefix}${pathWithoutLang}`)
  }
}

// =============================================================================
// HOMEPAGE SITEMAP GENERATOR
// =============================================================================

class HomepageSitemapGenerator {
  static generateHomepageEntries(): SitemapEntry[] {
    const entries: SitemapEntry[] = []
    
    // Main homepage
    entries.push(SitemapEntryBuilder.createEntry('/', {
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: 1.0,
      alternateLanguages: ['zh', 'ms', 'ta']
    }))

    // Alternative homepages for other languages
    const languages = ['zh', 'ms', 'ta']
    languages.forEach(lang => {
      entries.push(SitemapEntryBuilder.createEntry(`/${lang}`, {
        lastmod: new Date().toISOString(),
        changefreq: 'daily',
        priority: 1.0,
        alternateLanguages: ['en', ...languages.filter(l => l !== lang)]
      }))
    })

    return entries
  }
}

// =============================================================================
// CLINIC SITEMAP GENERATOR
// =============================================================================

class ClinicSitemapGenerator {
  static async generateClinicEntries(): Promise<SitemapEntry[]> {
    const entries: SitemapEntry[] = []

    // In a real implementation, this would fetch from database
    // For now, we'll create sample entries based on typical structure
    
    try {
      // Sample clinic data structure - in real app, fetch from DB
      const clinicData = await this.fetchClinicData()
      
      clinicData.forEach(clinic => {
        // Main clinic page
        entries.push(SitemapEntryBuilder.createEntry(`/clinics/${clinic.slug}`, {
          lastmod: clinic.updatedAt || new Date().toISOString(),
          changefreq: 'weekly',
          priority: 0.8,
          alternateLanguages: ['zh', 'ms', 'ta']
        }))

        // Location-specific clinic pages
        if (clinic.address?.addressLocality) {
          const locationSlug = clinic.address.addressLocality
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
          
          entries.push(SitemapEntryBuilder.createEntry(`/clinics/${locationSlug}`, {
            lastmod: clinic.updatedAt || new Date().toISOString(),
            changefreq: 'weekly',
            priority: 0.7,
            alternateLanguages: ['zh', 'ms', 'ta']
          }))
        }

        // Multi-language versions
        const languages = ['zh', 'ms', 'ta']
        languages.forEach(lang => {
          entries.push(SitemapEntryBuilder.createEntry(`/${lang}/clinics/${clinic.slug}`, {
            lastmod: clinic.updatedAt || new Date().toISOString(),
            changefreq: 'weekly',
            priority: 0.8,
            alternateLanguages: ['en', ...languages.filter(l => l !== lang)]
          }))
        })
      })
    } catch (error) {
      console.warn('Failed to fetch clinic data for sitemap generation:', error)
    }

    return entries
  }

  private static async fetchClinicData(): Promise<any[]> {
    // In real implementation, fetch from database
    // This is a placeholder structure
    return [
      {
        id: '1',
        slug: 'marina-bay-clinic',
        name: 'Marina Bay Medical Centre',
        updatedAt: new Date().toISOString(),
        address: {
          addressLocality: 'Marina Bay',
          streetAddress: '6 Raffes Boulevard'
        }
      },
      {
        id: '2',
        slug: 'orchard-health-centre',
        name: 'Orchard Health Centre',
        updatedAt: new Date().toISOString(),
        address: {
          addressLocality: 'Orchard',
          streetAddress: '123 Orchard Road'
        }
      },
      {
        id: '3',
        slug: 'clemenceau-medical',
        name: 'Clemenceau Medical',
        updatedAt: new Date().toISOString(),
        address: {
          addressLocality: 'Clemenceau',
          streetAddress: '456 Clemenceau Avenue'
        }
      }
    ]
  }
}

// =============================================================================
// DOCTOR SITEMAP GENERATOR
// =============================================================================

class DoctorSitemapGenerator {
  static async generateDoctorEntries(): Promise<SitemapEntry[]> {
    const entries: SitemapEntry[] = []

    try {
      const doctorData = await this.fetchDoctorData()
      
      doctorData.forEach(doctor => {
        // Main doctor page
        entries.push(SitemapEntryBuilder.createEntry(`/doctors/${doctor.slug}`, {
          lastmod: doctor.updatedAt || new Date().toISOString(),
          changefreq: 'weekly',
          priority: 0.8,
          alternateLanguages: ['zh', 'ms', 'ta']
        }))

        // Specialty-based doctor pages
        if (doctor.specialties && doctor.specialties.length > 0) {
          doctor.specialties.forEach((specialty: string) => {
            const specialtySlug = specialty
              .toLowerCase()
              .replace(/\s+/g, '-')
              .replace(/[^a-z0-9-]/g, '')
            
            entries.push(SitemapEntryBuilder.createEntry(`/doctors/specialists/${specialtySlug}`, {
              lastmod: doctor.updatedAt || new Date().toISOString(),
              changefreq: 'weekly',
              priority: 0.7,
              alternateLanguages: ['zh', 'ms', 'ta']
            }))
          })
        }

        // Multi-language versions
        const languages = ['zh', 'ms', 'ta']
        languages.forEach(lang => {
          entries.push(SitemapEntryBuilder.createEntry(`/${lang}/doctors/${doctor.slug}`, {
            lastmod: doctor.updatedAt || new Date().toISOString(),
            changefreq: 'weekly',
            priority: 0.8,
            alternateLanguages: ['en', ...languages.filter(l => l !== lang)]
          }))
        })
      })
    } catch (error) {
      console.warn('Failed to fetch doctor data for sitemap generation:', error)
    }

    return entries
  }

  private static async fetchDoctorData(): Promise<any[]> {
    // In real implementation, fetch from database
    return [
      {
        id: '1',
        slug: 'dr-sarah-lim',
        name: 'Dr. Sarah Lim',
        specialties: ['General Practice', 'Family Medicine'],
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        slug: 'dr-chen-wei-ming',
        name: 'Dr. Chen Wei Ming',
        specialties: ['Cardiology', 'Internal Medicine'],
        updatedAt: new Date().toISOString()
      },
      {
        id: '3',
        slug: 'dr-amira-hassan',
        name: 'Dr. Amira Hassan',
        specialties: ['Pediatrics'],
        updatedAt: new Date().toISOString()
      }
    ]
  }
}

// =============================================================================
// SERVICE SITEMAP GENERATOR
// =============================================================================

class ServiceSitemapGenerator {
  static async generateServiceEntries(): Promise<SitemapEntry[]> {
    const entries: SitemapEntry[] = []

    try {
      const serviceData = await this.fetchServiceData()
      
      serviceData.forEach(service => {
        // Main service page
        entries.push(SitemapEntryBuilder.createEntry(`/services/${service.slug}`, {
          lastmod: service.updatedAt || new Date().toISOString(),
          changefreq: 'monthly',
          priority: 0.7,
          alternateLanguages: ['zh', 'ms', 'ta']
        }))

        // Category-based service pages
        if (service.category?.slug) {
          entries.push(SitemapEntryBuilder.createEntry(`/services/${service.category.slug}`, {
            lastmod: service.updatedAt || new Date().toISOString(),
            changefreq: 'monthly',
            priority: 0.6,
            alternateLanguages: ['zh', 'ms', 'ta']
          }))
        }

        // Condition-specific service pages
        if (service.conditions && service.conditions.length > 0) {
          service.conditions.forEach((condition: any) => {
            const conditionSlug = condition.name
              .toLowerCase()
              .replace(/\s+/g, '-')
              .replace(/[^a-z0-9-]/g, '')
            
            entries.push(SitemapEntryBuilder.createEntry(`/services/conditions/${conditionSlug}`, {
              lastmod: service.updatedAt || new Date().toISOString(),
              changefreq: 'monthly',
              priority: 0.6,
              alternateLanguages: ['zh', 'ms', 'ta']
            }))
          })
        }

        // Multi-language versions
        const languages = ['zh', 'ms', 'ta']
        languages.forEach(lang => {
          entries.push(SitemapEntryBuilder.createEntry(`/${lang}/services/${service.slug}`, {
            lastmod: service.updatedAt || new Date().toISOString(),
            changefreq: 'monthly',
            priority: 0.7,
            alternateLanguages: ['en', ...languages.filter(l => l !== lang)]
          }))
        })
      })
    } catch (error) {
      console.warn('Failed to fetch service data for sitemap generation:', error)
    }

    return entries
  }

  private static async fetchServiceData(): Promise<any[]> {
    // In real implementation, fetch from database
    return [
      {
        id: '1',
        slug: 'health-screening',
        name: 'Health Screening',
        category: {
          slug: 'general-practice',
          name: 'General Practice'
        },
        conditions: [
          { name: 'Diabetes' },
          { name: 'Hypertension' }
        ],
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        slug: 'cardiology-consultation',
        name: 'Cardiology Consultation',
        category: {
          slug: 'specialist-care',
          name: 'Specialist Care'
        },
        conditions: [
          { name: 'Heart Disease' }
        ],
        updatedAt: new Date().toISOString()
      }
    ]
  }
}

// =============================================================================
// HEALTHIER SG SITEMAP GENERATOR
// =============================================================================

class HealthierSGSitemapGenerator {
  static generateHealthierSGEntries(): SitemapEntry[] {
    const entries: SitemapEntry[] = []

    // Healthier SG program pages
    const healthierSGPages = [
      {
        path: '/healthier-sg',
        priority: 0.9,
        description: 'Main Healthier SG program page'
      },
      {
        path: '/healthier-sg/enrollment',
        priority: 0.8,
        description: 'Healthier SG enrollment process'
      },
      {
        path: '/healthier-sg/benefits',
        priority: 0.7,
        description: 'Healthier SG benefits and features'
      },
      {
        path: '/healthier-sg/eligibility',
        priority: 0.7,
        description: 'Healthier SG eligibility criteria'
      },
      {
        path: '/healthier-sg/clinics',
        priority: 0.8,
        description: 'Healthier SG participating clinics'
      }
    ]

    healthierSGPages.forEach(page => {
      entries.push(SitemapEntryBuilder.createEntry(page.path, {
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: page.priority,
        alternateLanguages: ['zh', 'ms', 'ta']
      }))

      // Multi-language versions
      const languages = ['zh', 'ms', 'ta']
      languages.forEach(lang => {
        entries.push(SitemapEntryBuilder.createEntry(`/${lang}/healthier-sg${page.path.replace('/healthier-sg', '')}`, {
          lastmod: new Date().toISOString(),
          changefreq: 'monthly',
          priority: page.priority,
          alternateLanguages: ['en', ...languages.filter(l => l !== lang)]
        }))
      })
    })

    return entries
  }
}

// =============================================================================
// BLOG/CONTENT SITEMAP GENERATOR
// =============================================================================

class BlogSitemapGenerator {
  static async generateBlogEntries(): Promise<SitemapEntry[]> {
    const entries: SitemapEntry[] = []

    try {
      const blogData = await this.fetchBlogData()
      
      blogData.forEach(blogPost => {
        // Main blog post
        entries.push(SitemapEntryBuilder.createEntry(`/blog/${blogPost.slug}`, {
          lastmod: blogPost.updatedAt || blogPost.createdAt,
          changefreq: 'weekly',
          priority: 0.6,
          alternateLanguages: ['zh', 'ms', 'ta']
        }))

        // Category pages
        if (blogPost.category) {
          entries.push(SitemapEntryBuilder.createEntry(`/blog/category/${blogPost.category}`, {
            lastmod: new Date().toISOString(),
            changefreq: 'weekly',
            priority: 0.5,
            alternateLanguages: ['zh', 'ms', 'ta']
          }))
        }

        // Tag pages
        if (blogPost.tags && blogPost.tags.length > 0) {
          blogPost.tags.forEach((tag: string) => {
            const tagSlug = tag
              .toLowerCase()
              .replace(/\s+/g, '-')
              .replace(/[^a-z0-9-]/g, '')
            
            entries.push(SitemapEntryBuilder.createEntry(`/blog/tag/${tagSlug}`, {
              lastmod: blogPost.updatedAt || blogPost.createdAt,
              changefreq: 'weekly',
              priority: 0.4,
              alternateLanguages: ['zh', 'ms', 'ta']
            }))
          })
        }

        // Multi-language versions
        const languages = ['zh', 'ms', 'ta']
        languages.forEach(lang => {
          entries.push(SitemapEntryBuilder.createEntry(`/${lang}/blog/${blogPost.slug}`, {
            lastmod: blogPost.updatedAt || blogPost.createdAt,
            changefreq: 'weekly',
            priority: 0.6,
            alternateLanguages: ['en', ...languages.filter(l => l !== lang)]
          }))
        })
      })
    } catch (error) {
      console.warn('Failed to fetch blog data for sitemap generation:', error)
    }

    return entries
  }

  private static async fetchBlogData(): Promise<any[]> {
    // In real implementation, fetch from database
    return [
      {
        id: '1',
        slug: 'understanding-healthier-sg-program',
        title: 'Understanding the Healthier SG Program',
        category: 'healthier-sg',
        tags: ['Healthier SG', 'preventive care', 'Singapore healthcare'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        slug: 'importance-regular-health-screening',
        title: 'The Importance of Regular Health Screening',
        category: 'preventive-care',
        tags: ['health screening', 'preventive care', 'early detection'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
  }
}

// =============================================================================
// STATIC PAGES SITEMAP GENERATOR
// =============================================================================

class StaticPagesSitemapGenerator {
  static generateStaticPageEntries(): SitemapEntry[] {
    const entries: SitemapEntry[] = []

    const staticPages = [
      { path: '/contact', priority: 0.6, changefreq: 'monthly' },
      { path: '/about', priority: 0.5, changefreq: 'monthly' },
      { path: '/privacy-policy', priority: 0.3, changefreq: 'yearly' },
      { path: '/terms-of-service', priority: 0.3, changefreq: 'yearly' },
      { path: '/patient-rights', priority: 0.4, changefreq: 'yearly' },
      { path: '/emergency-care', priority: 0.7, changefreq: 'monthly' },
      { path: '/insurance', priority: 0.5, changefreq: 'monthly' },
      { path: '/faq', priority: 0.6, changefreq: 'monthly' }
    ]

    staticPages.forEach(page => {
      entries.push(SitemapEntryBuilder.createEntry(page.path, {
        lastmod: new Date().toISOString(),
        changefreq: page.changefreq as any,
        priority: page.priority,
        alternateLanguages: ['zh', 'ms', 'ta']
      }))

      // Multi-language versions
      const languages = ['zh', 'ms', 'ta']
      languages.forEach(lang => {
        entries.push(SitemapEntryBuilder.createEntry(`/${lang}${page.path}`, {
          lastmod: new Date().toISOString(),
          changefreq: page.changefreq as any,
          priority: page.priority,
          alternateLanguages: ['en', ...languages.filter(l => l !== lang)]
        }))
      })
    })

    return entries
  }
}

// =============================================================================
// MAIN SITEMAP GENERATOR
// =============================================================================

export class SitemapGenerator {
  static async generateSitemapIndex(): Promise<SitemapIndex> {
    const sitemaps = [
      { path: '/sitemap-homepage.xml', description: 'Homepage and main pages' },
      { path: '/sitemap-clinics.xml', description: 'Clinic pages and locations' },
      { path: '/sitemap-doctors.xml', description: 'Doctor profiles and specialties' },
      { path: '/sitemap-services.xml', description: 'Healthcare services and categories' },
      { path: '/sitemap-healthier-sg.xml', description: 'Healthier SG program pages' },
      { path: '/sitemap-blog.xml', description: 'Blog posts and articles' },
      { path: '/sitemap-static.xml', description: 'Static pages and information' }
    ]

    const sitemapEntries: SitemapEntry[] = sitemaps.map(sitemap => ({
      loc: `${SEO_CONFIG.baseUrl}${sitemap.path}`,
      lastmod: new Date().toISOString()
    }))

    return {
      sitemap: sitemapEntries
    }
  }

  static async generateSitemap(type: string): Promise<SitemapEntry[]> {
    switch (type) {
      case 'homepage':
        return HomepageSitemapGenerator.generateHomepageEntries()
      
      case 'clinics':
        return await ClinicSitemapGenerator.generateClinicEntries()
      
      case 'doctors':
        return await DoctorSitemapGenerator.generateDoctorEntries()
      
      case 'services':
        return await ServiceSitemapGenerator.generateServiceEntries()
      
      case 'healthier-sg':
        return HealthierSGSitemapGenerator.generateHealthierSGEntries()
      
      case 'blog':
        return await BlogSitemapGenerator.generateBlogEntries()
      
      case 'static':
        return StaticPagesSitemapGenerator.generateStaticPageEntries()
      
      default:
        // Generate all sitemaps
        const allEntries: SitemapEntry[] = []
        allEntries.push(...HomepageSitemapGenerator.generateHomepageEntries())
        allEntries.push(...await ClinicSitemapGenerator.generateClinicEntries())
        allEntries.push(...await DoctorSitemapGenerator.generateDoctorEntries())
        allEntries.push(...await ServiceSitemapGenerator.generateServiceEntries())
        allEntries.push(...HealthierSGSitemapGenerator.generateHealthierSGEntries())
        allEntries.push(...await BlogSitemapGenerator.generateBlogEntries())
        allEntries.push(...StaticPagesSitemapGenerator.generateStaticPageEntries())
        
        return allEntries
    }
  }

  static async generateAllSitemaps(): Promise<Record<string, SitemapEntry[]>> {
    const sitemapTypes = ['homepage', 'clinics', 'doctors', 'services', 'healthier-sg', 'blog', 'static']
    const sitemaps: Record<string, SitemapEntry[]> = {}

    for (const type of sitemapTypes) {
      try {
        sitemaps[type] = await this.generateSitemap(type)
      } catch (error) {
        console.warn(`Failed to generate ${type} sitemap:`, error)
        sitemaps[type] = []
      }
    }

    return sitemaps
  }

  static formatSitemapXML(entries: SitemapEntry[]): string {
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n'
    const urlsetOpening = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    const urlsetClosing = '</urlset>'

    const urlEntries = entries.map(entry => this.formatURLEntry(entry)).join('\n')

    return xmlHeader + urlsetOpening + urlEntries + '\n' + urlsetClosing
  }

  static formatSitemapIndexXML(sitemapIndex: SitemapIndex): string {
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n'
    const sitemapIndexOpening = '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    const sitemapIndexClosing = '</sitemapindex>'

    const sitemapEntries = sitemapIndex.sitemap.map(entry => this.formatSitemapEntry(entry)).join('\n')

    return xmlHeader + sitemapIndexOpening + sitemapEntries + '\n' + sitemapIndexClosing
  }

  private static formatURLEntry(entry: SitemapEntry): string {
    let urlEntry = '  <url>\n'
    urlEntry += `    <loc>${this.escapeXML(entry.loc)}</loc>\n`
    
    if (entry.lastmod) {
      urlEntry += `    <lastmod>${entry.lastmod}</lastmod>\n`
    }
    
    if (entry.changefreq) {
      urlEntry += `    <changefreq>${entry.changefreq}</changefreq>\n`
    }
    
    if (entry.priority !== undefined) {
      urlEntry += `    <priority>${entry.priority.toFixed(1)}</priority>\n`
    }
    
    if (entry.alternate && entry.alternate.length > 0) {
      entry.alternate.forEach(alt => {
        urlEntry += `    <xhtml:link rel="alternate" hreflang="${alt.hreflang}" href="${this.escapeXML(alt.href)}" />\n`
      })
    }
    
    urlEntry += '  </url>'
    return urlEntry
  }

  private static formatSitemapEntry(entry: SitemapEntry): string {
    let sitemapEntry = '  <sitemap>\n'
    sitemapEntry += `    <loc>${this.escapeXML(entry.loc)}</loc>\n`
    
    if (entry.lastmod) {
      sitemapEntry += `    <lastmod>${entry.lastmod}</lastmod>\n`
    }
    
    sitemapEntry += '  </sitemap>'
    return sitemapEntry
  }

  private static escapeXML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }
}

// =============================================================================
// SITEMAP UTILS
// =============================================================================

export const sitemapUtils = {
  builder: SitemapEntryBuilder,
  homepage: HomepageSitemapGenerator,
  clinics: ClinicSitemapGenerator,
  doctors: DoctorSitemapGenerator,
  services: ServiceSitemapGenerator,
  healthierSG: HealthierSGSitemapGenerator,
  blog: BlogSitemapGenerator,
  staticPages: StaticPagesSitemapGenerator,
  generator: SitemapGenerator
}

export default sitemapUtils