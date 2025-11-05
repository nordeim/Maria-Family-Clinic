/**
 * Core Web Vitals Tracker Component
 * Sub-Phase 10.2: Core Web Vitals & Performance Optimization
 * Real-time Core Web Vitals monitoring with visual indicators
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  useWebVitals,
  usePerformanceMark,
  useComponentPerformance,
} from '../hooks'
import {
  Activity,
  Eye,
  Timer,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Zap,
} from 'lucide-react'

interface MetricDisplayProps {
  name: string
  value: number
  target: number
  unit: string
  score: 'good' | 'needs-improvement' | 'poor'
  trend?: 'up' | 'down' | 'stable'
  description: string
}

function MetricDisplay({ 
  name, 
  value, 
  target, 
  unit, 
  score, 
  trend, 
  description 
}: MetricDisplayProps) {
  const getScoreColor = (score: string) => {
    switch (score) {
      case 'good': return 'text-green-600 bg-green-50 border-green-200'
      case 'needs-improvement': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'poor': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getScoreIcon = (score: string) => {
    switch (score) {
      case 'good': return <CheckCircle className="h-4 w-4" />
      case 'needs-improvement': return <AlertTriangle className="h-4 w-4" />
      case 'poor': return <AlertTriangle className="h-4 w-4" />
      default: return null
    }
  }

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-red-500" />
      case 'down': return <TrendingDown className="h-3 w-3 text-green-500" />
      default: return null
    }
  }

  const progressValue = Math.min((value / target) * 100, 100)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">{name}</span>
          {trend && getTrendIcon()}
        </div>
        <Badge variant="secondary" className={getScoreColor(score)}>
          {getScoreIcon(score)}
          <span className="ml-1 capitalize">{score.replace('-', ' ')}</span>
        </Badge>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold text-gray-900">
            {typeof value === 'number' ? value.toFixed(0) : value}
            <span className="text-sm text-gray-500 ml-1">{unit}</span>
          </span>
          <span className="text-sm text-gray-500">
            Target: {target}{unit}
          </span>
        </div>
        
        <Progress 
          value={progressValue} 
          className={`h-2 ${
            score === 'good' ? '[&>div]:bg-green-500' :
            score === 'needs-improvement' ? '[&>div]:bg-yellow-500' :
            '[&>div]:bg-red-500'
          }`}
        />
        
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </div>
  )
}

export function CoreWebVitalsTracker() {
  const webVitals = useWebVitals()
  const { mark } = usePerformanceMark()
  const componentPerformance = useComponentPerformance('CoreWebVitalsTracker')
  
  const [historicalData, setHistoricalData] = useState<Array<{
    timestamp: number
    lcp: number
    fid: number
    cls: number
  }>>([])

  const [isRecording, setIsRecording] = useState(false)

  // Mark component render
  useEffect(() => {
    mark('web-vitals-tracker-render')
  })

  // Record historical data
  useEffect(() => {
    if (!webVitals.metrics || !isRecording) return

    const newDataPoint = {
      timestamp: Date.now(),
      lcp: webVitals.metrics.lcp,
      fid: webVitals.metrics.fid,
      cls: webVitals.metrics.cls,
    }

    setHistoricalData(prev => {
      const updated = [...prev, newDataPoint]
      return updated.slice(-50) // Keep last 50 data points
    })
  }, [webVitals.metrics, isRecording])

  // Calculate trends
  const getTrend = (metric: 'lcp' | 'fid' | 'cls') => {
    if (historicalData.length < 2) return undefined
    
    const recent = historicalData.slice(-3)
    const older = historicalData.slice(-6, -3)
    
    if (recent.length === 0 || older.length === 0) return undefined
    
    const recentAvg = recent.reduce((sum, data) => sum + data[metric], 0) / recent.length
    const olderAvg = older.reduce((sum, data) => sum + data[metric], 0) / older.length
    
    if (recentAvg > olderAvg * 1.05) return 'up'
    if (recentAvg < olderAvg * 0.95) return 'down'
    return 'stable'
  }

  const startRecording = () => {
    setIsRecording(true)
    mark('web-vitals-recording-started')
  }

  const stopRecording = () => {
    setIsRecording(false)
    mark('web-vitals-recording-stopped')
  }

  const exportData = () => {
    const data = {
      webVitals: webVitals.metrics,
      historical: historicalData,
      componentMetrics: {
        renderCount: componentPerformance.renderCount,
        timestamp: Date.now(),
      },
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `core-web-vitals-${new Date().toISOString().slice(0, 19)}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    mark('web-vitals-data-exported')
  }

  if (!webVitals.metrics) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Activity className="h-8 w-8 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Loading Core Web Vitals...</p>
        </CardContent>
      </Card>
    )
  }

  const overallScore = webVitals.score
  const getOverallScoreColor = (score: string) => {
    switch (score) {
      case 'good': return 'bg-green-500'
      case 'needs-improvement': return 'bg-yellow-500'
      case 'poor': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-500" />
              Core Web Vitals Tracker
            </span>
            <div className="flex items-center gap-2">
              <Badge 
                className={`px-3 py-1 text-white ${getOverallScoreColor(overallScore)}`}
              >
                <span className="capitalize">{overallScore.replace('-', ' ')}</span>
              </Badge>
              <Badge variant="outline" className="text-xs">
                Rendered {componentPerformance.renderCount}x
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* LCP */}
            <MetricDisplay
              name="Largest Contentful Paint"
              value={webVitals.metrics.lcp}
              target={1200}
              unit="ms"
              score={webVitals.lcpScore || 'good'}
              trend={getTrend('lcp')}
              description="Time to load the largest content element"
            />

            {/* FID */}
            <MetricDisplay
              name="First Input Delay"
              value={webVitals.metrics.fid}
              target={100}
              unit="ms"
              score={webVitals.fidScore || 'good'}
              trend={getTrend('fid')}
              description="Delay in responding to first user interaction"
            />

            {/* CLS */}
            <MetricDisplay
              name="Cumulative Layout Shift"
              value={webVitals.metrics.cls}
              target={0.1}
              unit=""
              score={webVitals.clsScore || 'good'}
              trend={getTrend('cls')}
              description="Visual stability metric"
            />
          </div>
        </CardContent>
      </Card>

      {/* Additional Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-purple-500" />
            Additional Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">
                {webVitals.metrics.fcp.toFixed(0)}ms
              </div>
              <div className="text-sm text-gray-600">First Contentful Paint</div>
            </div>
            
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">
                {webVitals.metrics.ttfb.toFixed(0)}ms
              </div>
              <div className="text-sm text-gray-600">Time to First Byte</div>
            </div>
            
            <div className="text-center">
              <div className="text-xl font-bold text-orange-600">
                {webVitals.metrics.searchComplete.toFixed(0)}ms
              </div>
              <div className="text-sm text-gray-600">Search Available</div>
            </div>
            
            <div className="text-center">
              <div className="text-xl font-bold text-purple-600">
                {webVitals.metrics.clinicListRendered.toFixed(0)}ms
              </div>
              <div className="text-sm text-gray-600">Clinic List Ready</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {(webVitals.lcpScore === 'poor' || webVitals.fidScore === 'poor' || webVitals.clsScore === 'poor') && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="font-semibold mb-2">Performance Issues Detected</div>
            <ul className="space-y-1">
              {webVitals.lcpScore === 'poor' && (
                <li>• LCP is critically slow ({webVitals.metrics.lcp.toFixed(0)}ms)</li>
              )}
              {webVitals.fidScore === 'poor' && (
                <li>• FID is too high ({webVitals.metrics.fid.toFixed(0)}ms)</li>
              )}
              {webVitals.clsScore === 'poor' && (
                <li>• CLS is causing layout shifts ({webVitals.metrics.cls.toFixed(3)})</li>
              )}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Activity className="h-4 w-4" />
                Start Recording
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                Stop Recording
              </button>
            )}
            
            <button
              onClick={exportData}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export Data
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Refresh
            </button>
          </div>
          
          {isRecording && (
            <div className="mt-4 flex items-center gap-2 text-sm text-blue-600">
              <Activity className="h-4 w-4 animate-pulse" />
              Recording performance data... ({historicalData.length} data points)
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historical Trend Chart */}
      {historicalData.length > 5 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* LCP Trend */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">LCP Trend (last {historicalData.length} measurements)</h4>
                <div className="flex items-end gap-1 h-16">
                  {historicalData.map((data, index) => {
                    const maxLCP = Math.max(...historicalData.map(d => d.lcp))
                    const height = (data.lcp / maxLCP) * 100
                    return (
                      <div
                        key={index}
                        className="bg-blue-500 w-2 flex-1 min-w-0"
                        style={{ height: `${Math.max(height, 5)}%` }}
                        title={`LCP: ${data.lcp.toFixed(0)}ms`}
                      />
                    )
                  })}
                </div>
              </div>
              
              {/* FID Trend */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">FID Trend</h4>
                <div className="flex items-end gap-1 h-16">
                  {historicalData.map((data, index) => {
                    const maxFID = Math.max(...historicalData.map(d => d.fid))
                    const height = (data.fid / maxFID) * 100
                    return (
                      <div
                        key={index}
                        className="bg-green-500 w-2 flex-1 min-w-0"
                        style={{ height: `${Math.max(height, 5)}%` }}
                        title={`FID: ${data.fid.toFixed(0)}ms`}
                      />
                    )
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default CoreWebVitalsTracker
