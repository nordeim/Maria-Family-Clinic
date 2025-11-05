/**
 * SEO API Routes for My Family Clinic
 * Next.js API routes for SEO functionality including sitemap, robots, and analytics
 */

import { NextRequest, NextResponse } from 'next/server'
import { SitemapGenerator, RobotsConfigGenerator } from '../utils/sitemap-generator'
import { robotsUtils } from '../utils/robots-generator'
import { seoServices } from '../services/seo-services'

// =============================================================================
// SITEMAP INDEX API ROUTE
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const sitemapIndex = await SitemapGenerator.generateSitemapIndex()
    const xml = SitemapGenerator.formatSitemapIndexXML(sitemapIndex)
    
    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800', // 7 days
        'X-Robots-Tag': 'index, follow'
      }
    })
  } catch (error) {
    console.error('Sitemap index generation failed:', error)
    
    return NextResponse.json(
      { error: 'Failed to generate sitemap index' },
      { status: 500 }
    )
  }
}

// =============================================================================
// SITEMAP API ROUTES
// =============================================================================

// Individual sitemap routes
export async function POST(request: NextRequest) {
  try {
    const { type } = await request.json()
    
    if (!type) {
      return NextResponse.json(
        { error: 'Sitemap type is required' },
        { status: 400 }
      )
    }

    const entries = await SitemapGenerator.generateSitemap(type)
    const xml = SitemapGenerator.formatSitemapXML(entries)
    
    return NextResponse.json({
      type,
      entryCount: entries.length,
      xml,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error('Sitemap generation failed:', error)
    
    return NextResponse.json(
      { error: 'Failed to generate sitemap' },
      { status: 500 }
    )
  }
}

// =============================================================================
// HOMEPAGE SITEMAP API
// =============================================================================

export async function HEAD(request: NextRequest) {
  try {
    const entries = await SitemapGenerator.generateSitemap('homepage')
    
    return NextResponse.json({
      entryCount: entries.length,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get homepage sitemap' },
      { status: 500 }
    )
  }
}

// =============================================================================
// CLINICS SITEMAP API
// =============================================================================

export async function OPTIONS(request: NextRequest) {
  const url = new URL(request.url)
  const type = url.searchParams.get('type') || 'all'
  
  try {
    const sitemaps = await SitemapGenerator.generateAllSitemaps()
    
    return NextResponse.json({
      availableSitemaps: Object.keys(sitemaps),
      totalEntries: Object.values(sitemaps).reduce((sum, entries) => sum + entries.length, 0),
      lastUpdated: new Date().toISOString(),
      cacheExpires: new Date(Date.now() + 86400000).toISOString() // 24 hours
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get sitemap information' },
      { status: 500 }
    )
  }
}