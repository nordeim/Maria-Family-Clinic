/**
 * Memory Usage Monitor Component
 * Sub-Phase 10.2: Core Web Vitals & Performance Optimization
 * Real-time memory usage monitoring and optimization
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useMemoryUsage } from '../hooks'
import {
  Database,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  HardDrive,
  Zap,
  Activity,
} from 'lucide-react'

interface MemorySnapshot {
  timestamp: number
  used: number
  total: number
  percentage: number
  trend: 'increasing' | 'decreasing' | 'stable'
}

export function MemoryUsageMonitor() {
  const memoryData = useMemoryUsage()
  const [history, setHistory] = useState<MemorySnapshot[]>([])
  const [alerts, setAlerts] = useState<Array<{ id: string; message: string; severity: 'warning' | 'error' }>>([])

  useEffect(() => {
    if (!memoryData) return

    const snapshot: MemorySnapshot = {
      timestamp: Date.now(),
      used: memoryData.used,
      total: memoryData.total,
      percentage: memoryData.percentage,
      trend: memoryData.trend,
    }

    setHistory(prev => {
      const updated = [...prev, snapshot]
      return updated.slice(-50) // Keep last 50 snapshots
    })

    // Check for memory alerts
    if (memoryData.percentage > 80) {
      const alertId = `memory-${Date.now()}`
      setAlerts(prev => [...prev, {
        id: alertId,
        message: `High memory usage: ${memoryData.percentage.toFixed(1)}%`,
        severity: memoryData.percentage > 90 ? 'error' : 'warning',
      }])

      // Auto-dismiss after 10 seconds
      setTimeout(() => {
        setAlerts(currentAlerts => 
          currentAlerts.filter(a => a.id !== alertId)
        )
      }, 10000)
    }
  }, [memoryData])

  const getMemoryScore = (percentage: number) => {
    if (percentage <= 50) return 'excellent'
    if (percentage <= 70) return 'good'
    if (percentage <= 85) return 'fair'
    return 'poor'
  }

  const getScoreColor = (score: string) => {
    switch (score) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200'
      case 'good': return 'text-green-600 bg-green-50 border-green-200'
      case 'fair': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'poor': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-3 w-3 text-red-500" />
      case 'decreasing': return <TrendingDown className="h-3 w-3 text-green-500" />
      case 'stable': return <Activity className="h-3 w-3 text-gray-500" />
      default: return null
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const calculateStatistics = () => {
    if (history.length === 0) {
      return {
        average: 0,
        peak: 0,
        minimum: 0,
        growth: 0,
      }
    }

    const percentages = history.map(snapshot => snapshot.percentage)
    const average = percentages.reduce((sum, p) => sum + p, 0) / percentages.length
    const peak = Math.max(...percentages)
    const minimum = Math.min(...percentages)
    
    // Calculate growth (last 10 vs first 10)
    const recent = percentages.slice(-10)
    const older = percentages.slice(0, 10)
    const recentAvg = recent.reduce((sum, p) => sum + p, 0) / recent.length
    const olderAvg = older.length > 0 ? older.reduce((sum, p) => sum + p, 0) / older.length : recentAvg
    const growth = recentAvg - olderAvg

    return { average, peak, minimum, growth }
  }

  const clearAlerts = () => {
    setAlerts([])
  }

  const exportMemoryReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      current: memoryData,
      history,
      statistics: calculateStatistics(),
      alerts,
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `memory-report-${new Date().toISOString().slice(0, 19)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const stats = calculateStatistics()
  const currentScore = memoryData ? getMemoryScore(memoryData.percentage) : 'unknown'

  if (!memoryData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Database className="h-8 w-8 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Memory monitoring not available</p>
          <p className="text-sm text-gray-400 mt-2">
            This feature requires a browser with memory API support
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map(alert => (
            <div
              key={alert.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                alert.severity === 'error' 
                  ? 'border-red-200 bg-red-50' 
                  : 'border-yellow-200 bg-yellow-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className={`h-4 w-4 ${
                  alert.severity === 'error' ? 'text-red-600' : 'text-yellow-600'
                }`} />
                <span className={alert.severity === 'error' ? 'text-red-800' : 'text-yellow-800'}>
                  {alert.message}
                </span>
              </div>
              <button
                onClick={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}
                className={`text-sm ${
                  alert.severity === 'error' ? 'text-red-600' : 'text-yellow-600'
                } hover:opacity-70`}
              >
                Dismiss
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Current Memory Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-500" />
              Memory Usage Monitor
            </span>
            <div className="flex items-center gap-2">
              {getTrendIcon(memoryData.trend)}
              <Badge variant="secondary" className={getScoreColor(currentScore)}>
                {currentScore}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Main metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {memoryData.percentage.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Memory Usage</div>
                <Progress 
                  value={memoryData.percentage} 
                  className={`mt-2 h-3 ${
                    memoryData.percentage > 80 ? '[&>div]:bg-red-500' :
                    memoryData.percentage > 60 ? '[&>div]:bg-yellow-500' :
                    '[&>div]:bg-green-500'
                  }`}
                />
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {formatBytes(memoryData.used)}
                </div>
                <div className="text-sm text-gray-600">Used Memory</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {formatBytes(memoryData.total)}
                </div>
                <div className="text-sm text-gray-600">Total Memory</div>
              </div>
            </div>

            {/* Memory details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <HardDrive className="h-5 w-5 text-gray-500 mx-auto mb-1" />
                <div className="text-lg font-bold text-gray-900">
                  {formatBytes(memoryData.total - memoryData.used)}
                </div>
                <div className="text-xs text-gray-600">Available</div>
              </div>
              
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Zap className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
                <div className="text-lg font-bold text-gray-900">
                  {stats.average.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-600">Average</div>
              </div>
              
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-red-500 mx-auto mb-1" />
                <div className="text-lg font-bold text-gray-900">
                  {stats.peak.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-600">Peak</div>
              </div>
              
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Activity className="h-5 w-5 text-green-500 mx-auto mb-1" />
                <div className={`text-lg font-bold ${
                  stats.growth > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {stats.growth > 0 ? '+' : ''}{stats.growth.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-600">Growth</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={exportMemoryReport}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Database className="h-4 w-4" />
                Export Report
              </button>
              
              <button
                onClick={clearAlerts}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <AlertTriangle className="h-4 w-4" />
                Clear Alerts
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Memory History Chart */}
      {history.length > 5 && (
        <Card>
          <CardHeader>
            <CardTitle>Memory Usage History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Memory Usage Trend (last {history.length} measurements)
                </h4>
                <div className="flex items-end gap-1 h-32">
                  {history.map((snapshot, index) => {
                    const height = (snapshot.percentage / 100) * 100
                    const color = snapshot.percentage > 80 ? 'bg-red-500' :
                                 snapshot.percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                    return (
                      <div
                        key={index}
                        className={`w-3 flex-1 min-w-0 ${color} rounded-t`}
                        style={{ height: `${Math.max(height, 2)}%` }}
                        title={`${snapshot.percentage.toFixed(1)}% at ${new Date(snapshot.timestamp).toLocaleTimeString()}`}
                      />
                    )
                  })}
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{new Date(history[0].timestamp).toLocaleTimeString()}</span>
                  <span>Memory Usage</span>
                  <span>{new Date(history[history.length - 1].timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Memory Optimization Recommendations */}
      {memoryData.percentage > 60 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <Zap className="h-5 w-5" />
              Memory Optimization Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-yellow-800">
              {memoryData.percentage > 80 && (
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <h4 className="font-semibold mb-2">Critical: High Memory Usage</h4>
                  <p className="text-sm mb-2">
                    Memory usage is critically high. This may cause performance issues.
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• Implement memory cleanup in components</li>
                    <li>• Check for memory leaks in event listeners</li>
                    <li>• Optimize image loading and caching</li>
                    <li>• Consider reducing cache sizes</li>
                  </ul>
                </div>
              )}
              
              {memoryData.trend === 'increasing' && (
                <div className="p-3 bg-blue-100 rounded-lg">
                  <h4 className="font-semibold mb-2">Memory Usage Increasing</h4>
                  <p className="text-sm mb-2">
                    Memory usage is trending upward. Monitor for potential memory leaks.
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• Check for growing data structures</li>
                    <li>• Implement proper component unmounting</li>
                    <li>• Review subscription and timer cleanup</li>
                    <li>• Use WeakMap/WeakSet where appropriate</li>
                  </ul>
                </div>
              )}

              <div className="p-3 bg-green-100 rounded-lg">
                <h4 className="font-semibold mb-2">General Optimization Tips</h4>
                <ul className="text-sm space-y-1">
                  <li>• Use React.memo for expensive components</li>
                  <li>• Implement proper cleanup in useEffect</li>
                  <li>• Optimize state management (avoid unnecessary re-renders)</li>
                  <li>• Use lazy loading for large datasets</li>
                  <li>• Implement virtual scrolling for long lists</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default MemoryUsageMonitor
