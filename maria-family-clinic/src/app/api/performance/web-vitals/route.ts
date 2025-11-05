/**
 * Web Vitals API Route
 * Handles Core Web Vitals data collection and retrieval
 */

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const metric = searchParams.get('metric')
  const url = searchParams.get('url')
  
  // Mock data for demonstration
  const mockData = [
    {
      id: '1',
      metric: 'lcp',
      value: 1150,
      url: 'http://localhost:3000/clinics',
      timestamp: Date.now() - 300000,
    },
    {
      id: '2',
      metric: 'fid',
      value: 85,
      url: 'http://localhost:3000/clinics',
      timestamp: Date.now() - 240000,
    },
    {
      id: '3',
      metric: 'cls',
      value: 0.08,
      url: 'http://localhost:3000/clinics',
      timestamp: Date.now() - 180000,
    },
  ]

  let filteredData = mockData
  
  if (metric) {
    filteredData = filteredData.filter(record => record.metric === metric)
  }
  
  if (url) {
    filteredData = filteredData.filter(record => record.url.includes(url))
  }

  return NextResponse.json({
    data: filteredData,
    summary: {
      lcp: { avg: 1150, score: 'good' },
      fid: { avg: 85, score: 'good' },
      cls: { avg: 0.08, score: 'good' },
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate and store web vitals data
    console.log('Web Vitals received:', body)
    
    return NextResponse.json({
      success: true,
      message: 'Web Vitals data received',
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid data format' },
      { status: 400 }
    )
  }
}
