/**
 * Bundle Analysis API Route
 * Handles JavaScript bundle size analysis and optimization recommendations
 */

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Analyze bundle data
    const { totalSize, chunks } = body
    
    const analysis = {
      totalSize,
      chunkCount: chunks.length,
      largestChunks: chunks
        .sort((a: any, b: any) => b.size - a.size)
        .slice(0, 10),
      sizeByType: chunks.reduce((acc: any, chunk: any) => {
        acc[chunk.type] = (acc[chunk.type] || 0) + chunk.size
        return acc
      }, {}),
      recommendations: generateBundleRecommendations(totalSize, chunks),
      score: getBundleScore(totalSize),
    }
    
    return NextResponse.json({
      success: true,
      analysis,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid bundle analysis data' },
      { status: 400 }
    )
  }
}

function generateBundleRecommendations(totalSize: number, chunks: any[]) {
  const recommendations = []
  const sizeInKB = totalSize / 1024
  
  if (sizeInKB > 500) {
    recommendations.push({
      type: 'critical',
      message: 'Bundle size exceeds 500KB threshold',
      action: 'Implement aggressive code splitting',
    })
  }
  
  if (sizeInKB > 250) {
    recommendations.push({
      type: 'warning',
      message: 'Bundle size is larger than recommended',
      action: 'Review and optimize dependencies',
    })
  }
  
  // Check for large individual chunks
  const largeChunks = chunks.filter(chunk => chunk.size > 100 * 1024)
  if (largeChunks.length > 0) {
    recommendations.push({
      type: 'info',
      message: `${largeChunks.length} chunks are larger than 100KB`,
      action: 'Consider breaking down large chunks',
    })
  }
  
  return recommendations
}

function getBundleScore(totalSize: number): 'good' | 'needs-improvement' | 'poor' {
  const sizeInKB = totalSize / 1024
  
  if (sizeInKB <= 250) return 'good'
  if (sizeInKB <= 500) return 'needs-improvement'
  return 'poor'
}
