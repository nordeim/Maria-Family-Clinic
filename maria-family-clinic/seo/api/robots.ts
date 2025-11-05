/**
 * Robots.txt API Route for My Family Clinic
 * Dynamic robots.txt generation for healthcare platform
 */

import { NextRequest, NextResponse } from 'next/server'
import { RobotsConfigGenerator, RobotsValidator } from '../utils/robots-generator'

// =============================================================================
// ROBOTS.TXT API ROUTE
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const environment = url.searchParams.get('env') || process.env.NODE_ENV || 'production'
    
    let robotsContent = ''
    
    // Different robots.txt for different environments
    switch (environment) {
      case 'development':
        robotsContent = RobotsConfigGenerator.generateDevelopmentRobotsTxt()
        break
      
      case 'staging':
        robotsContent = RobotsConfigGenerator.generateRobotsTxt()
        break
      
      case 'emergency':
        robotsContent = RobotsConfigGenerator.generateEmergencyRobotsTxt()
        break
      
      default:
        robotsContent = RobotsConfigGenerator.generateRobotsTxt()
    }
    
    // Validate robots configuration
    const config = RobotsConfigGenerator.generateConfig()
    const validation = RobotsValidator.validateRobotsRules(config)
    
    // Add validation warnings in development
    if (process.env.NODE_ENV === 'development' && !validation.isValid) {
      console.warn('Robots.txt validation warnings:', validation.warnings)
    }
    
    return new NextResponse(robotsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800', // 7 days
        'X-Robots-Tag': 'index, follow'
      }
    })
  } catch (error) {
    console.error('Robots.txt generation failed:', error)
    
    // Fallback robots.txt
    const fallbackRobots = `User-agent: *
Disallow: /api/
Disallow: /admin/
Disallow: /dashboard/
Allow: /
Sitemap: ${process.env.NEXT_PUBLIC_BASE_URL || 'https://myfamilyclinic.sg'}/sitemap.xml`

    return new NextResponse(fallbackRobots, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8'
      }
    })
  }
}

// =============================================================================
// ROBOTS VALIDATION API
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const { config } = await request.json()
    
    if (!config) {
      return NextResponse.json(
        { error: 'Robots configuration is required' },
        { status: 400 }
      )
    }
    
    const validation = RobotsValidator.validateRobotsRules(config)
    
    return NextResponse.json({
      isValid: validation.isValid,
      warnings: validation.warnings,
      errors: validation.errors,
      analyzedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Robots validation failed:', error)
    
    return NextResponse.json(
      { error: 'Failed to validate robots configuration' },
      { status: 500 }
    )
  }
}

// =============================================================================
// ROBOTS ANALYTICS API
// =============================================================================

export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const action = url.searchParams.get('action')
    
    switch (action) {
      case 'generate':
        return await handleGenerateRobots(request)
      
      case 'emergency':
        return await handleEmergencyRobots(request)
      
      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Robots analytics API error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleGenerateRobots(request: NextRequest) {
  const config = RobotsConfigGenerator.generateConfig()
  const robotsContent = RobotsConfigGenerator.generateRobotsTxt()
  const validation = RobotsValidator.validateRobotsRules(config)
  
  return NextResponse.json({
    config,
    robotsContent,
    validation,
    generatedAt: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  })
}

async function handleEmergencyRobots(request: NextRequest) {
  const emergencyRobots = RobotsConfigGenerator.generateEmergencyRobotsTxt()
  
  return NextResponse.json({
    emergencyMode: true,
    robotsContent: emergencyRobots,
    message: 'Emergency robots.txt generated - only emergency information is accessible',
    generatedAt: new Date().toISOString()
  })
}