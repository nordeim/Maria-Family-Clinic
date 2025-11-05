/**
 * Performance Alerts API Route
 * Monitors and alerts on performance threshold violations
 */

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const severity = searchParams.get('severity') // 'critical', 'warning', 'info'
  
  // Mock alert data
  const alerts = [
    {
      id: 'alert-1',
      type: 'performance-threshold',
      severity: 'warning',
      metric: 'lcp',
      message: 'Largest Contentful Paint is 1350ms (threshold: 1200ms)',
      timestamp: Date.now() - 600000,
      resolved: false,
      url: 'http://localhost:3000/clinics',
      recommendation: 'Optimize image loading and critical CSS',
    },
    {
      id: 'alert-2',
      type: 'bundle-size',
      severity: 'info',
      metric: 'bundleSize',
      message: 'Bundle size increased by 15% this week',
      timestamp: Date.now() - 3600000,
      resolved: false,
      recommendation: 'Review recently added dependencies',
    },
  ]

  let filteredAlerts = alerts
  
  if (severity) {
    filteredAlerts = alerts.filter(alert => alert.severity === severity)
  }

  return NextResponse.json({
    alerts: filteredAlerts,
    summary: {
      total: filteredAlerts.length,
      critical: filteredAlerts.filter(a => a.severity === 'critical').length,
      warnings: filteredAlerts.filter(a => a.severity === 'warning').length,
      info: filteredAlerts.filter(a => a.severity === 'info').length,
      unresolved: filteredAlerts.filter(a => !a.resolved).length,
    },
    lastChecked: Date.now(),
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Create new alert
    const alert = {
      id: `alert-${Date.now()}`,
      ...body,
      timestamp: Date.now(),
      resolved: false,
    }
    
    console.log('New performance alert:', alert)
    
    return NextResponse.json({
      success: true,
      alert,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid alert data' },
      { status: 400 }
    )
  }
}
