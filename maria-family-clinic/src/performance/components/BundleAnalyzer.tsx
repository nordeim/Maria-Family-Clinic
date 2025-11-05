/**
 * Bundle Analyzer and Monitoring Tools
 * Sub-Phase 10.2: Core Web Vitals & Performance Optimization
 */

'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  HardDrive,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  Code,
  Zap,
  Database,
  Download,
  BarChart3,
} from 'lucide-react'

interface BundleEntry {
  name: string
  size: number
  gzippedSize?: number
  type: 'chunk' | 'vendor' | 'app' | 'library'
  url: string
  timestamp?: number
}

interface BundleAnalysis {
  totalSize: number
  totalGzipped?: number
  chunks: BundleEntry[]
  largestChunks: BundleEntry[]
  chunkCount: number
  vendorSize: number
  appSize: number
  libraries: BundleEntry[]
}

interface BundleAnalyzerProps {
  onAnalysisComplete?: (analysis: BundleAnalysis) => void
  enableRealTimeMonitoring?: boolean
  alertThreshold?: number // KB
}

export function BundleAnalyzer({ 
  onAnalysisComplete, 
  enableRealTimeMonitoring = true,
  alertThreshold = 500 
}: BundleAnalyzerProps) {
  const [analysis, setAnalysis] = useState<BundleAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [historicalData, setHistoricalData] = useState<Array<{
    timestamp: number
    totalSize: number
    chunkCount: number
  }>>([])

  const analyzeBundles = useCallback(async () => {
    if (typeof window === 'undefined') return

    setIsAnalyzing(true)

    try {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
      
      // Filter JavaScript resources
      const jsResources = resources.filter(resource => {
        const url = resource.name.toLowerCase()
        return url.includes('.js') || 
               url.includes('/_next/') || 
               url.includes('/static/') ||
               url.includes('chunk') ||
               url.includes('vendor')
      })

      // Categorize and process bundles
      const chunks = jsResources.map(resource => {
        const url = new URL(resource.name)
        const fileName = url.pathname.split('/').pop() || 'unknown'
        
        let type: BundleEntry['type'] = 'chunk'
        if (fileName.includes('vendor') || fileName.includes('node_modules')) {
          type = 'vendor'
        } else if (fileName.includes('main') || fileName.includes('app')) {
          type = 'app'
        } else if (fileName.includes('chunk') || fileName.includes('_next')) {
          type = 'chunk'
        } else {
          // Check if it's a well-known library
          const libraries = ['react', 'next', 'lodash', 'moment', 'axios']
          if (libraries.some(lib => fileName.toLowerCase().includes(lib))) {
            type = 'library'
          }
        }

        return {
          name: fileName,
          size: resource.transferSize || resource.decodedBodySize || 0,
          gzippedSize: resource.transferSize, // Approximation
          type,
          url: resource.name,
          timestamp: Date.now(),
        }
      }).filter(chunk => chunk.size > 0)

      // Calculate metrics
      const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0)
      const vendorSize = chunks.filter(c => c.type === 'vendor').reduce((sum, c) => sum + c.size, 0)
      const appSize = chunks.filter(c => c.type === 'app').reduce((sum, c) => sum + c.size, 0)
      const libraries = chunks.filter(c => c.type === 'library')
      
      // Sort by size and get largest chunks
      const largestChunks = [...chunks]
        .sort((a, b) => b.size - a.size)
        .slice(0, 10)

      const newAnalysis: BundleAnalysis = {
        totalSize,
        chunks,
        largestChunks,
        chunkCount: chunks.length,
        vendorSize,
        appSize,
        libraries,
      }

      setAnalysis(newAnalysis)
      
      // Add to historical data
      setHistoricalData(prev => {
        const newData = [...prev, {
          timestamp: Date.now(),
          totalSize,
          chunkCount: chunks.length,
        }]
        return newData.slice(-20) // Keep last 20 data points
      })

      onAnalysisComplete?.(newAnalysis)

      // Check for threshold violations
      const sizeInKB = totalSize / 1024
      if (sizeInKB > alertThreshold) {
        console.warn(`Bundle size exceeded threshold: ${sizeInKB.toFixed(1)}KB > ${alertThreshold}KB`)
      }

    } catch (error) {
      console.error('Bundle analysis failed:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }, [onAnalysisComplete, alertThreshold])

  // Auto-analyze on mount and periodically
  useEffect(() => {
    analyzeBundles()
    
    if (enableRealTimeMonitoring) {
      const interval = setInterval(analyzeBundles, 30000) // Every 30 seconds
      return () => clearInterval(interval)
    }
  }, [analyzeBundles, enableRealTimeMonitoring])

  const getScoreFromSize = useCallback((sizeInKB: number) => {
    if (sizeInKB <= 250) return 'good'
    if (sizeInKB <= 500) return 'needs-improvement'
    return 'poor'
  }, [])

  const formatSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }, [])

  const getChunkIcon = (type: BundleEntry['type']) => {
    switch (type) {
      case 'vendor': return <Database className="h-4 w-4" />
      case 'app': return <Code className="h-4 w-4" />
      case 'library': return <Zap className="h-4 w-4" />
      default: return <HardDrive className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: BundleEntry['type']) => {
    switch (type) {
      case 'vendor': return 'bg-blue-100 text-blue-700'
      case 'app': return 'bg-green-100 text-green-700'
      case 'library': return 'bg-purple-100 text-purple-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (!analysis) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Button 
            onClick={analyzeBundles} 
            disabled={isAnalyzing}
            className="flex items-center gap-2"
          >
            {isAnalyzing ? (
              <>Analyzing...</>
            ) : (
              <>
                <BarChart3 className="h-4 w-4" />
                Analyze Bundles
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    )
  }

  const totalSizeKB = analysis.totalSize / 1024
  const score = getScoreFromSize(totalSizeKB)
  const trend = historicalData.length >= 2 
    ? (analysis.totalSize > historicalData[historicalData.length - 2].totalSize ? 'up' : 
       analysis.totalSize < historicalData[historicalData.length - 2].totalSize ? 'down' : 'stable')
    : 'stable'

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-blue-500" />
              Bundle Analysis Summary
            </span>
            <div className="flex items-center gap-2">
              {trend === 'up' && <TrendingUp className="h-4 w-4 text-red-500" />}
              {trend === 'down' && <TrendingDown className="h-4 w-4 text-green-500" />}
              {trend === 'stable' && <Minus className="h-4 w-4 text-gray-500" />}
              <Badge variant="secondary" className={score === 'good' ? 'bg-green-100 text-green-700' : score === 'needs-improvement' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}>
                {score === 'good' ? 'Good' : score === 'needs-improvement' ? 'Needs Improvement' : 'Poor'}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {formatSize(analysis.totalSize)}
              </div>
              <div className="text-sm text-gray-600">Total Size</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {analysis.chunkCount}
              </div>
              <div className="text-sm text-gray-600">Chunks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatSize(analysis.vendorSize)}
              </div>
              <div className="text-sm text-gray-600">Vendor</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatSize(analysis.appSize)}
              </div>
              <div className="text-sm text-gray-600">App Code</div>
            </div>
          </div>

          {/* Performance Budget Alert */}
          {totalSizeKB > alertThreshold && (
            <Alert className="mt-4 border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                Bundle size ({totalSizeKB.toFixed(1)}KB) exceeds performance budget ({alertThreshold}KB). 
                Consider implementing code splitting or removing unused dependencies.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Largest Chunks */}
      <Card>
        <CardHeader>
          <CardTitle>Largest Chunks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analysis.largestChunks.map((chunk, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3 flex-1">
                  {getChunkIcon(chunk.type)}
                  <div className="flex-1">
                    <div className="font-medium text-sm">{chunk.name}</div>
                    <Badge variant="secondary" className={`text-xs ${getTypeColor(chunk.type)}`}>
                      {chunk.type}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatSize(chunk.size)}</div>
                  <div className="text-xs text-gray-500">
                    {((chunk.size / analysis.totalSize) * 100).toFixed(1)}% of total
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* All Chunks with Filtering */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>All Chunks</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const data = JSON.stringify(analysis, null, 2)
                const blob = new Blob([data], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `bundle-analysis-${new Date().toISOString().slice(0, 19)}.json`
                a.click()
                URL.revokeObjectURL(url)
              }}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {analysis.chunks
              .sort((a, b) => b.size - a.size)
              .map((chunk, index) => (
                <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {getChunkIcon(chunk.type)}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{chunk.name}</div>
                      <div className="text-xs text-gray-500">{chunk.type}</div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-sm font-medium">{formatSize(chunk.size)}</div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Historical Trends */}
      {historicalData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Historical Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Bundle Size Trend</h4>
                <div className="flex items-end gap-1 h-20">
                  {historicalData.slice(-10).map((data, index) => {
                    const maxSize = Math.max(...historicalData.slice(-10).map(d => d.totalSize))
                    const height = (data.totalSize / maxSize) * 100
                    return (
                      <div
                        key={index}
                        className="bg-blue-500 w-4 flex-1"
                        style={{ height: `${height}%` }}
                        title={`${formatSize(data.totalSize)}`}
                      />
                    )
                  })}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Chunk Count Trend</h4>
                <div className="flex items-end gap-1 h-20">
                  {historicalData.slice(-10).map((data, index) => {
                    const maxCount = Math.max(...historicalData.slice(-10).map(d => d.chunkCount))
                    const height = (data.chunkCount / maxCount) * 100
                    return (
                      <div
                        key={index}
                        className="bg-green-500 w-4 flex-1"
                        style={{ height: `${height}%` }}
                        title={`${data.chunkCount} chunks`}
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

// Real-time Bundle Monitor Component
export function RealTimeBundleMonitor() {
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [currentSize, setCurrentSize] = useState<number | null>(null)
  const [alerts, setAlerts] = useState<Array<{ timestamp: number; size: number; type: 'warning' | 'error' }>>([])

  useEffect(() => {
    if (!isMonitoring) return

    const monitor = () => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
      const totalSize = resources
        .filter(r => r.name.includes('.js'))
        .reduce((sum, r) => sum + (r.transferSize || 0), 0)

      setCurrentSize(totalSize)

      // Check for alerts
      const sizeKB = totalSize / 1024
      if (sizeKB > 750) {
        setAlerts(prev => [...prev.slice(-4), {
          timestamp: Date.now(),
          size: totalSize,
          type: 'error',
        }])
      } else if (sizeKB > 500) {
        setAlerts(prev => [...prev.slice(-4), {
          timestamp: Date.now(),
          size: totalSize,
          type: 'warning',
        }])
      }
    }

    monitor()
    const interval = setInterval(monitor, 5000)

    return () => clearInterval(interval)
  }, [isMonitoring])

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span>Bundle Monitor</span>
          <Button
            size="sm"
            variant={isMonitoring ? "default" : "outline"}
            onClick={() => setIsMonitoring(!isMonitoring)}
          >
            {isMonitoring ? 'Stop' : 'Start'}
          </Button>
        </CardTitle>
      </CardHeader>
      {currentSize !== null && (
        <CardContent>
          <div className="text-center mb-2">
            <div className="text-lg font-bold">
              {(currentSize / 1024).toFixed(1)} KB
            </div>
            <div className="text-xs text-gray-500">Current bundle size</div>
          </div>
          
          {alerts.length > 0 && (
            <div className="space-y-1">
              {alerts.slice(-3).map((alert, index) => (
                <Alert 
                  key={index} 
                  className={`text-xs ${alert.type === 'error' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}`}
                >
                  <AlertTriangle className="h-3 w-3" />
                  <AlertDescription className="text-xs">
                    {alert.type === 'error' ? 'Critical' : 'Warning'}: {(alert.size / 1024).toFixed(1)} KB
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

export { BundleAnalyzer }
export type { BundleAnalysis, BundleEntry }
