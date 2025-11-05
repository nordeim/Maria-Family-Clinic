/**
 * Performance Monitoring Dashboard
 * Sub-Phase 10.2: Core Web Vitals & Performance Optimization
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  useWebVitals,
  usePerformanceMonitor,
  useBundleSize,
  useMemoryUsage,
  useNetworkQuality,
  usePerformanceBudget,
  useLongTasks,
  useComponentPerformance,
} from '../hooks'
import {
  Activity,
  Zap,
  Database,
  Wifi,
  Smartphone,
  Monitor,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Timer,
  HardDrive,
  Cpu,
  Eye,
} from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  score: 'good' | 'needs-improvement' | 'poor'
  threshold: { good: number; poor: number }
  unit?: string
  icon: React.ComponentType<any>
  trend?: 'up' | 'down' | 'stable'
  description?: string
}

function MetricCard({ 
  title, 
  value, 
  score, 
  threshold, 
  unit = '', 
  icon: Icon,
  trend,
  description 
}: MetricCardProps) {
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
      case 'stable': return <Minus className="h-3 w-3 text-gray-500" />
      default: return null
    }
  }

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <Icon className="h-4 w-4" />
            {title}
          </CardTitle>
          {trend && getTrendIcon()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {typeof value === 'number' ? value.toFixed(0) : value}
              {unit && <span className="text-sm text-gray-500 ml-1">{unit}</span>}
            </div>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
          </div>
          <Badge variant="secondary" className={getScoreColor(score)}>
            {getScoreIcon(score)}
            <span className="ml-1 capitalize">{score.replace('-', ' ')}</span>
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

function getScoreFromValue(value: number, goodThreshold: number, poorThreshold: number): 'good' | 'needs-improvement' | 'poor' {
  if (value <= goodThreshold) return 'good'
  if (value <= poorThreshold) return 'needs-improvement'
  return 'poor'
}

export function PerformanceMonitoringDashboard() {
  // Initialize performance monitoring
  const { mark } = useComponentPerformance('PerformanceDashboard')
  
  const webVitals = useWebVitals()
  const performanceData = usePerformanceMonitor()
  const bundleData = useBundleSize()
  const memoryData = useMemoryUsage()
  const networkData = useNetworkQuality()
  const budgetData = usePerformanceBudget()
  const longTasks = useLongTasks()

  const [lastUpdate, setLastUpdate] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Mark when dashboard is ready
  useEffect(() => {
    if (webVitals.metrics) {
      mark('dashboard-ready')
    }
  }, [webVitals.metrics, mark])

  const overallScore = webVitals.score
  const getOverallScoreColor = (score: string) => {
    switch (score) {
      case 'good': return 'bg-green-500'
      case 'needs-improvement': return 'bg-yellow-500'
      case 'poor': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const lcpScore = webVitals.lcpScore || 'good'
  const fidScore = webVitals.fidScore || 'good'
  const clsScore = webVitals.clsScore || 'good'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Activity className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Performance Monitoring Dashboard
            </h1>
          </div>
          <p className="text-gray-600 mb-4">
            Real-time Core Web Vitals and performance metrics tracking
          </p>
          
          {/* Overall Score */}
          <div className="inline-flex items-center gap-3 bg-white rounded-lg px-6 py-3 shadow-lg">
            <span className="text-lg font-semibold text-gray-700">Overall Score:</span>
            <Badge 
              className={`px-4 py-2 text-white ${getOverallScoreColor(overallScore)}`}
            >
              <span className="capitalize text-lg">{overallScore.replace('-', ' ')}</span>
            </Badge>
            <span className="text-sm text-gray-500">
              Updated {lastUpdate.toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Core Web Vitals */}
        {webVitals.metrics && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Core Web Vitals
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard
                title="Largest Contentful Paint"
                value={webVitals.metrics.lcp}
                score={lcpScore}
                threshold={{ good: 1200, poor: 2500 }}
                unit="ms"
                icon={Eye}
                description="Time to load the largest content element"
              />
              <MetricCard
                title="First Input Delay"
                value={webVitals.metrics.fid}
                score={fidScore}
                threshold={{ good: 100, poor: 300 }}
                unit="ms"
                icon={Timer}
                description="Delay in responding to first user interaction"
              />
              <MetricCard
                title="Cumulative Layout Shift"
                value={webVitals.metrics.cls.toFixed(3)}
                score={clsScore}
                threshold={{ good: 0.1, poor: 0.25 }}
                icon={Activity}
                description="Visual stability metric"
              />
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Monitor className="h-5 w-5 text-blue-500" />
            Performance Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Bundle Size"
              value={(bundleData.total / 1024).toFixed(1)}
              score={bundleData.totalScore}
              threshold={{ good: 250, poor: 500 }}
              unit="KB"
              icon={HardDrive}
              description="Total JavaScript bundle size"
            />
            
            <MetricCard
              title="Memory Usage"
              value={memoryData ? (memoryData.percentage).toFixed(1) : 0}
              score={memoryData ? memoryData.percentage > 80 ? 'poor' : memoryData.percentage > 60 ? 'needs-improvement' : 'good' : 'good'}
              threshold={{ good: 60, poor: 80 }}
              unit="%"
              icon={Database}
              description="JavaScript heap usage"
            />
            
            <MetricCard
              title="Network Quality"
              value={networkData.effectiveType || 'Unknown'}
              score={networkData.quality === 'excellent' ? 'good' : networkData.quality === 'good' ? 'needs-improvement' : 'poor'}
              threshold={{ good: 4, poor: 2 }}
              icon={Wifi}
              description={`${networkData.downlink || 0} Mbps downlink`}
            />
            
            <MetricCard
              title="Long Tasks"
              value={longTasks.length}
              score={longTasks.length === 0 ? 'good' : longTasks.length <= 2 ? 'needs-improvement' : 'poor'}
              threshold={{ good: 0, poor: 3 }}
              icon={Cpu}
              description="Tasks running longer than 50ms"
            />
          </div>
        </div>

        {/* Performance Budget Violations */}
        {budgetData.hasViolations && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <div className="font-semibold mb-2">Performance Budget Violations:</div>
              <ul className="space-y-1">
                {budgetData.violations.map((violation, index) => (
                  <li key={index} className="text-sm">
                    • {violation.metric}: {violation.value.toFixed(0)} (threshold: {violation.threshold.toFixed(0)})
                    <Badge 
                      variant="secondary" 
                      className={`ml-2 ${violation.severity === 'error' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}
                    >
                      {violation.severity}
                    </Badge>
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Bundle Analysis */}
        {bundleData.chunks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5 text-purple-500" />
                Bundle Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {bundleData.chunks.slice(0, 10).map((chunk, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-700">{chunk.name}</span>
                      <Progress 
                        value={(chunk.size / (500 * 1024)) * 100} 
                        className="h-2 mt-1"
                      />
                    </div>
                    <div className="ml-4 text-right">
                      <div className="text-sm font-medium">{(chunk.size / 1024).toFixed(1)} KB</div>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${
                          chunk.size <= 100 * 1024 ? 'bg-green-100 text-green-700' :
                          chunk.size <= 250 * 1024 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}
                      >
                        {chunk.size <= 100 * 1024 ? 'Small' : chunk.size <= 250 * 1024 ? 'Medium' : 'Large'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Healthcare Workflow Performance */}
        {webVitals.metrics && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-green-500" />
                Healthcare Workflow Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {webVitals.metrics.searchComplete.toFixed(0)}ms
                  </div>
                  <div className="text-sm text-gray-600">Search Available</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {webVitals.metrics.clinicListRendered.toFixed(0)}ms
                  </div>
                  <div className="text-sm text-gray-600">Clinic List Rendered</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {webVitals.metrics.mapLoaded.toFixed(0)}ms
                  </div>
                  <div className="text-sm text-gray-600">Map Loaded</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {webVitals.metrics.contactFormInteractive.toFixed(0)}ms
                  </div>
                  <div className="text-sm text-gray-600">Form Interactive</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Performance Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="flex items-center gap-2"
              >
                <Activity className="h-4 w-4" />
                Refresh Metrics
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  const metrics = webVitals.metrics
                  if (metrics) {
                    console.log('Current Web Vitals:', metrics)
                    alert('Web Vitals logged to console')
                  }
                }}
                className="flex items-center gap-2"
              >
                <Database className="h-4 w-4" />
                Export Metrics
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  const link = document.createElement('a')
                  link.href = '/api/performance/report'
                  link.download = 'performance-report.json'
                  link.click()
                }}
                className="flex items-center gap-2"
              >
                <Monitor className="h-4 w-4" />
                Download Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default PerformanceMonitoringDashboard
