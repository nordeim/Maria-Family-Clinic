/**
 * SEO Analytics API Route for My Family Clinic
 * Comprehensive SEO analytics and performance monitoring
 */

import { NextRequest, NextResponse } from 'next/server'
import { seoAnalytics } from '../analytics/seo-analytics'
import { seoServices } from '../services/seo-services'

// =============================================================================
// SEO ANALYTICS API ROUTE
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const action = url.searchParams.get('action') || 'overview'
    
    switch (action) {
      case 'overview':
        return await getSEOOverview()
      
      case 'keywords':
        return await getKeywordAnalytics(request)
      
      case 'local':
        return await getLocalSEOAnalytics(request)
      
      case 'healthcare':
        return await getHealthcareSEOAnalytics(request)
      
      case 'competitor':
        return await getCompetitorAnalysis(request)
      
      case 'performance':
        return await getPerformanceMetrics(request)
      
      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('SEO Analytics API error:', error)
    
    return NextResponse.json(
      { error: 'Failed to fetch SEO analytics' },
      { status: 500 }
    )
  }
}

async function getSEOOverview() {
  const analytics = await seoServices.monitoring.getSEOPerformance()
  const seoScore = seoServices.monitoring.calculateSEOScore(analytics)
  
  return NextResponse.json({
    analytics,
    seoScore,
    summary: {
      overallScore: seoScore.overall,
      totalKeywords: analytics.keywordRankings.length,
      organicTraffic: analytics.organicTraffic.sessions,
      localVisibility: analytics.localSEOPerformance.localPackAppearances,
      lastUpdated: new Date().toISOString()
    }
  })
}

async function getKeywordAnalytics(request: NextRequest) {
  const url = new URL(request.url)
  const limit = parseInt(url.searchParams.get('limit') || '50')
  const specialty = url.searchParams.get('specialty')
  const location = url.searchParams.get('location')
  
  try {
    const performanceTracker = seoAnalytics.performance.getInstance()
    const topKeywords = await performanceTracker.getTopPerformingKeywords(limit)
    const worstKeywords = await performanceTracker.getWorstPerformingKeywords(10)
    const opportunities = await performanceTracker.getKeywordOpportunities()
    
    let filteredKeywords = topKeywords
    
    // Apply filters
    if (specialty) {
      filteredKeywords = filteredKeywords.filter(k => 
        k.keyword.toLowerCase().includes(specialty.toLowerCase())
      )
    }
    
    if (location) {
      filteredKeywords = filteredKeywords.filter(k => 
        k.location.toLowerCase().includes(location.toLowerCase())
      )
    }
    
    return NextResponse.json({
      keywords: filteredKeywords,
      worstPerforming: worstKeywords,
      opportunities,
      totalTracked: filteredKeywords.length,
      filters: { specialty, location },
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch keyword analytics' },
      { status: 500 }
    )
  }
}

async function getLocalSEOAnalytics(request: NextRequest) {
  const url = new URL(request.url)
  const location = url.searchParams.get('location')
  
  try {
    // Mock clinic data for demonstration
    const clinicData = [
      {
        id: '1',
        name: 'Marina Bay Clinic',
        address: { addressLocality: 'Marina Bay' },
        reviewCount: 150,
        rating: 4.5,
        localPackAppearances: 25
      },
      {
        id: '2',
        name: 'Orchard Health Centre',
        address: { addressLocality: 'Orchard' },
        reviewCount: 200,
        rating: 4.7,
        localPackAppearances: 30
      }
    ]
    
    const analysis = await seoAnalytics.local.analyzeLocalSEOPerformance(clinicData)
    
    return NextResponse.json({
      analysis,
      clinics: clinicData,
      location: location || 'Singapore',
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch local SEO analytics' },
      { status: 500 }
    )
  }
}

async function getHealthcareSEOAnalytics(request: NextRequest) {
  const url = new URL(request.url)
  const specialty = url.searchParams.get('specialty')
  const content = url.searchParams.get('content')
  
  try {
    if (content) {
      const medicalContent = {
        title: `Healthcare Content for ${specialty || 'General Practice'}`,
        description: 'Medical content for Singapore healthcare platform',
        body: content,
        medicalTerms: ['healthcare', 'medical', 'treatment', 'consultation'],
        conditions: ['general health'],
        services: ['consultation', 'screening']
      }
      
      const analysis = await seoAnalytics.healthcare.analyzeMedicalContentSEO(medicalContent)
      
      return NextResponse.json({
        contentAnalysis: analysis,
        specialty: specialty || 'General Practice',
        lastUpdated: new Date().toISOString()
      })
    } else {
      // Return healthcare SEO summary
      return NextResponse.json({
        healthcareSEOScore: 85,
        medicalKeywordsTracked: 250,
        specialistContentScore: 78,
        emergencyCareVisibility: 92,
        healthierSGContentScore: 88,
        lastUpdated: new Date().toISOString()
      })
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch healthcare SEO analytics' },
      { status: 500 }
    )
  }
}

async function getCompetitorAnalysis(request: NextRequest) {
  try {
    // Mock competitor data
    const competitors = [
      {
        name: 'HealthHub Singapore',
        url: 'https://healthhub.sg',
        keywords: ['singapore healthcare', 'doctor appointment', 'health screening'],
        backlinks: 15000,
        domainAuthority: 85
      },
      {
        name: 'Speedoc',
        url: 'https://speedoc.com',
        keywords: ['doctor near me', 'home visit doctor', 'medical consultation'],
        backlinks: 8000,
        domainAuthority: 72
      },
      {
        MaNaDr: 'MaNaDr',
        url: 'https://manadr.com',
        keywords: ['telemedicine singapore', 'online doctor', 'medical app'],
        backlinks: 5000,
        domainAuthority: 68
      }
    ]
    
    const analysis = await seoAnalytics.competitor.analyzeCompetitors(competitors)
    
    return NextResponse.json({
      competitorAnalysis: analysis,
      competitors,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch competitor analysis' },
      { status: 500 }
    )
  }
}

async function getPerformanceMetrics(request: NextRequest) {
  try {
    const performanceTracker = seoAnalytics.performance.getInstance()
    const metrics = await performanceTracker.getPerformanceMetrics()
    const alerts = performanceTracker.getRecentAlerts(10)
    
    return NextResponse.json({
      performanceMetrics: metrics,
      alerts,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch performance metrics' },
      { status: 500 }
    )
  }
}

// =============================================================================
// SEO ANALYTICS ACTIONS (POST)
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json()
    
    switch (action) {
      case 'updateKeywordRanking':
        return await updateKeywordRanking(data)
      
      case 'validateSEO':
        return await validateSEOContent(data)
      
      case 'generateReport':
        return await generateSEOReport(data)
      
      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('SEO Analytics POST error:', error)
    
    return NextResponse.json(
      { error: 'Failed to process SEO analytics request' },
      { status: 500 }
    )
  }
}

async function updateKeywordRanking(data: any) {
  const { keyword, ranking } = data
  
  if (!keyword || !ranking) {
    return NextResponse.json(
      { error: 'Keyword and ranking data are required' },
      { status: 400 }
    )
  }
  
  try {
    const performanceTracker = seoAnalytics.performance.getInstance()
    await performanceTracker.updateKeywordRanking(keyword, ranking)
    
    return NextResponse.json({
      success: true,
      keyword,
      ranking,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update keyword ranking' },
      { status: 500 }
    )
  }
}

async function validateSEOContent(data: any) {
  const { type, content, targetKeywords } = data
  
  if (!content) {
    return NextResponse.json(
      { error: 'Content is required for validation' },
      { status: 400 }
    )
  }
  
  try {
    let validation = null
    
    switch (type) {
      case 'healthcare':
        validation = seoAnalytics.healthcare.analyzeMedicalContentSEO(content)
        break
      
      case 'local':
        // Mock local SEO validation
        validation = {
          score: 85,
          recommendations: ['Add more local keywords', 'Optimize Google My Business'],
          napConsistency: 95,
          reviewOptimization: 78
        }
        break
      
      default:
        // General SEO validation
        validation = {
          score: 80,
          recommendations: ['Improve meta description', 'Add structured data'],
          technicalSEO: 85,
          contentOptimization: 75
        }
    }
    
    return NextResponse.json({
      validation,
      type,
      analyzedAt: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to validate SEO content' },
      { status: 500 }
    )
  }
}

async function generateSEOReport(data: any) {
  const { reportType, dateRange, includeCompetitor } = data
  
  try {
    const analytics = await seoServices.monitoring.getSEOPerformance()
    const seoScore = seoServices.monitoring.calculateSEOScore(analytics)
    
    const report = {
      reportType: reportType || 'comprehensive',
      dateRange: dateRange || 'last-30-days',
      analytics,
      seoScore,
      generatedAt: new Date().toISOString(),
      summary: {
        overallScore: seoScore.overall,
        keyFindings: [
          'Strong performance in local SEO',
          'Opportunities in healthcare content optimization',
          'Need for improved technical SEO in mobile experience'
        ],
        recommendations: [
          'Focus on healthcare-specific content creation',
          'Improve Core Web Vitals scores',
          'Enhance local citation building',
          'Optimize for Healthier SG keywords'
        ]
      }
    }
    
    return NextResponse.json(report)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate SEO report' },
      { status: 500 }
    )
  }
}