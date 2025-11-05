/**
 * Network Quality Indicator Component
 * Sub-Phase 10.2: Core Web Vitals & Performance Optimization
 * Real-time network quality monitoring and adaptive loading strategies
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useNetworkQuality } from '../hooks'
import {
  Wifi,
  WifiOff,
  Zap,
  AlertTriangle,
  CheckCircle,
  Activity,
  Smartphone,
  Globe,
} from 'lucide-react'

interface NetworkConfig {
  quality: 'excellent' | 'good' | 'fair' | 'poor'
  downloadSpeed: string
  latency: string
  recommendations: string[]
  adaptiveMode: boolean
}

export function NetworkQualityIndicator() {
  const networkData = useNetworkQuality()
  const [connectionHistory, setConnectionHistory] = useState<Array<{
    timestamp: number
    effectiveType: string
    downlink: number
    rtt: number
  }>>([])
  const [isAdaptiveMode, setIsAdaptiveMode] = useState(true)

  useEffect(() => {
    if (!networkData.effectiveType) return

    const snapshot = {
      timestamp: Date.now(),
      effectiveType: networkData.effectiveType,
      downlink: networkData.downlink || 0,
      rtt: networkData.rtt || 0,
    }

    setConnectionHistory(prev => {
      const updated = [...prev, snapshot]
      return updated.slice(-20) // Keep last 20 snapshots
    })
  }, [networkData])

  const getNetworkConfiguration = (): NetworkConfig => {
    if (!networkData.effectiveType) {
      return {
        quality: 'poor',
        downloadSpeed: 'Unknown',
        latency: 'Unknown',
        recommendations: ['Network information not available'],
        adaptiveMode: false,
      }
    }

    const { effectiveType, downlink, rtt } = networkData

    // Determine quality
    let quality: NetworkConfig['quality'] = 'poor'
    if (effectiveType === '4g' && downlink && downlink > 10) {
      quality = 'excellent'
    } else if (effectiveType === '4g') {
      quality = 'good'
    } else if (effectiveType === '3g') {
      quality = 'fair'
    } else {
      quality = 'poor'
    }

    // Format download speed
    const downloadSpeed = downlink ? `${downlink} Mbps` : 'Unknown'

    // Format latency
    const latency = rtt ? `${rtt}ms` : 'Unknown'

    // Generate recommendations
    const recommendations = generateRecommendations(quality, effectiveType, downlink, rtt)

    return {
      quality,
      downloadSpeed,
      latency,
      recommendations,
      adaptiveMode: isAdaptiveMode,
    }
  }

  const generateRecommendations = (
    quality: string,
    effectiveType: string | null,
    downlink?: number | null,
    rtt?: number | null
  ): string[] => {
    const recommendations: string[] = []

    if (quality === 'poor') {
      recommendations.push('Consider downloading content over WiFi')
      recommendations.push('Enable data saver mode')
    } else if (quality === 'fair') {
      recommendations.push('Disable auto-play videos')
      recommendations.push('Use lower quality images')
    }

    if (effectiveType === '2g') {
      recommendations.push('Avoid large file downloads')
      recommendations.push('Use text-only mode when possible')
    }

    if (rtt && rtt > 300) {
      recommendations.push('High latency detected - expect slower responses')
    }

    if (downlink && downlink < 1) {
      recommendations.push('Very slow connection - prioritize critical content')
    }

    if (networkData.saveData) {
      recommendations.push('Data saver mode is enabled')
      recommendations.push('Images will be optimized for minimal data usage')
    }

    return recommendations
  }

  const getQualityIcon = (quality: string) => {
    switch (quality) {
      case 'excellent': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'good': return <Wifi className="h-5 w-5 text-green-500" />
      case 'fair': return <Wifi className="h-5 w-5 text-yellow-500" />
      case 'poor': return <AlertTriangle className="h-5 w-5 text-red-500" />
      default: return <WifiOff className="h-5 w-5 text-gray-500" />
    }
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200'
      case 'good': return 'text-green-600 bg-green-50 border-green-200'
      case 'fair': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'poor': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const applyNetworkOptimizations = () => {
    if (!isAdaptiveMode) return

    // Apply adaptive loading based on network quality
    const config = getNetworkConfiguration()
    
    if (config.quality === 'poor' || config.quality === 'fair') {
      // Reduce image quality
      document.documentElement.style.setProperty('--image-quality', '0.6')
      
      // Disable non-critical animations
      document.documentElement.style.setProperty('--animation-duration', '0.1s')
      
      // Enable data saving optimizations
      if (networkData.saveData) {
        // Additional data saving measures
        console.log('Applying data saver optimizations')
      }
    } else {
      // Reset to full quality
      document.documentElement.style.setProperty('--image-quality', '1.0')
      document.documentElement.style.setProperty('--animation-duration', '0.3s')
    }
  }

  useEffect(() => {
    applyNetworkOptimizations()
  }, [isAdaptiveMode, networkData])

  const config = getNetworkConfiguration()

  return (
    <div className="space-y-6">
      {/* Network Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Wifi className="h-5 w-5 text-blue-500" />
              Network Quality Monitor
            </span>
            <div className="flex items-center gap-2">
              {getQualityIcon(config.quality)}
              <Badge variant="secondary" className={getQualityColor(config.quality)}>
                {config.quality.replace('-', ' ')}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {networkData.effectiveType?.toUpperCase() || 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Connection Type</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {config.downloadSpeed}
              </div>
              <div className="text-sm text-gray-600">Download Speed</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {config.latency}
              </div>
              <div className="text-sm text-gray-600">Latency</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {networkData.saveData ? 'ON' : 'OFF'}
              </div>
              <div className="text-sm text-gray-600">Data Saver</div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Adaptive Loading</h4>
              <p className="text-sm text-gray-600">
                Automatically adjust content quality based on network conditions
              </p>
            </div>
            <button
              onClick={() => setIsAdaptiveMode(!isAdaptiveMode)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isAdaptiveMode
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {isAdaptiveMode ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Network History */}
      {connectionHistory.length > 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-500" />
              Connection History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Connection Type Changes
                </h4>
                <div className="flex items-end gap-2 h-24">
                  {connectionHistory.slice(-10).map((snapshot, index) => {
                    const getHeight = (type: string) => {
                      switch (type) {
                        case '4g': return 100
                        case '3g': return 60
                        case '2g': return 30
                        default: return 10
                      }
                    }
                    
                    const getColor = (type: string) => {
                      switch (type) {
                        case '4g': return 'bg-green-500'
                        case '3g': return 'bg-yellow-500'
                        case '2g': return 'bg-red-500'
                        default: return 'bg-gray-500'
                      }
                    }
                    
                    const height = getHeight(snapshot.effectiveType || '')
                    
                    return (
                      <div
                        key={index}
                        className={`w-6 flex-1 min-w-0 ${getColor(snapshot.effectiveType || '')} rounded-t`}
                        style={{ height: `${Math.max(height, 10)}%` }}
                        title={`${snapshot.effectiveType?.toUpperCase()} at ${new Date(snapshot.timestamp).toLocaleTimeString()}`}
                      />
                    )
                  })}
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>10 minutes ago</span>
                  <span>Connection Type</span>
                  <span>Now</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Network Quality Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-indigo-500" />
            Network Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Current Status</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Connection Quality</span>
                  <Badge variant="secondary" className={getQualityColor(config.quality)}>
                    {config.quality.replace('-', ' ')}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Network Type</span>
                  <span className="text-sm font-medium">
                    {networkData.effectiveType?.toUpperCase() || 'Unknown'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Download Speed</span>
                  <span className="text-sm font-medium">{config.downloadSpeed}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Round Trip Time</span>
                  <span className="text-sm font-medium">{config.latency}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Data Saver</span>
                  <span className="text-sm font-medium">
                    {networkData.saveData ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
              <div className="space-y-2">
                {config.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Zap className="h-3 w-3 text-blue-500 mt-1 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Adaptive Loading Status */}
      {isAdaptiveMode && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Smartphone className="h-5 w-5" />
              Adaptive Loading Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-blue-800">
              <p className="text-sm">
                Network-adaptive optimizations are currently applied based on your connection quality.
              </p>
              
              {config.quality === 'poor' || config.quality === 'fair' ? (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Applied Optimizations:</div>
                  <ul className="text-sm space-y-1">
                    <li>• Image quality reduced for faster loading</li>
                    <li>• Non-critical animations disabled</li>
                    <li>• Content prioritization enabled</li>
                    {networkData.saveData && <li>• Data saver mode optimizations active</li>}
                  </ul>
                </div>
              ) : (
                <div className="text-sm">
                  Full quality content is being loaded for optimal user experience.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Network Performance Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Network Performance Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">For Users</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Connect to WiFi for large downloads</li>
                <li>• Enable data saver on mobile networks</li>
                <li>• Close unnecessary tabs and applications</li>
                <li>• Use airplane mode temporarily to reset connection</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">For Developers</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Implement responsive image loading</li>
                <li>• Use network-aware API requests</li>
                <li>• Prioritize critical content loading</li>
                <li>• Provide offline capabilities</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default NetworkQualityIndicator
