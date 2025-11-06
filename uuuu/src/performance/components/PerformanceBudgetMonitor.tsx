/**
 * Performance Budget Monitor Component
 * Sub-Phase 10.2: Core Web Vitals & Performance Optimization
 * Monitors and alerts on performance budget violations
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  usePerformanceBudget,
  useMemoryUsage,
  useNetworkQuality,
} from '../hooks'
import {
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Zap,
  Smartphone,
  Wifi,
  HardDrive,
  Cpu,
} from 'lucide-react'

interface BudgetItem {
  name: string
  current: number
  budget: number
  unit: string
  severity: 'good' | 'warning' | 'error'
  description: string
  recommendations?: string[]
}

function BudgetItem({ name, current, budget, unit, severity, description, recommendations }: BudgetItem) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'good': return 'text-green-600 bg-green-50 border-green-200'
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'error': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'good': return <CheckCircle className="h-4 w-4" />
      case 'warning': return <AlertTriangle className="h-4 w-4" />
      case 'error': return <AlertTriangle className="h-4 w-4" />
      default: return null
    }
  }

  const getProgressColor = (severity: string) => {
    switch (severity) {
      case 'good': return 'bg-green-500'
      case 'warning': return 'bg-yellow-500'
      case 'error': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const percentage = (current / budget) * 100
  const progressValue = Math.min(percentage, 100)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">{name}</span>
          <Badge variant="secondary" className={getSeverityColor(severity)}>
            {getSeverityIcon(severity)}
            <span className="ml-1 capitalize">{severity}</span>
          </Badge>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-gray-900">
            {current.toFixed(1)}{unit}
          </span>
          <span className="text-sm text-gray-500 ml-1">
            / {budget}{unit}
          </span>
        </div>
      </div>
      
      <div className="space-y-2">
        <Progress 
          value={progressValue} 
          className={`h-3 [&>div]:${getProgressColor(severity)}`}
        />
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">{description}</span>
          <span className={`font-medium ${
            percentage > 100 ? 'text-red-600' :
            percentage > 80 ? 'text-yellow-600' :
            'text-green-600'
          }`}>
            {percentage.toFixed(0)}%
          </span>
        </div>
        
        {recommendations && recommendations.length > 0 && (
          <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
            <div className="font-medium text-gray-700 mb-1">Recommendations:</div>
            <ul className="space-y-1">
              {recommendations.map((rec, index) => (
                <li key={index} className="text-gray-600">• {rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export function PerformanceBudgetMonitor() {
  const budgetData = usePerformanceBudget()
  const memoryData = useMemoryUsage()
  const networkData = useNetworkQuality()
  
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([])
  const [totalScore, setTotalScore] = useState(100)

  useEffect(() => {
    const items: BudgetItem[] = [
      // Core Web Vitals
      {
        name: 'Largest Contentful Paint',
        current: budgetData.violations.find(v => v.metric === 'LCP')?.value || 0,
        budget: 1200,
        unit: 'ms',
        severity: budgetData.violations.some(v => v.metric === 'LCP') ? 
          (budgetData.violations.find(v => v.metric === 'LCP')!.severity === 'error' ? 'error' : 'warning') : 'good',
        description: 'Time to load largest content element',
        recommendations: [
          'Optimize images with next/image component',
          'Implement critical CSS inlining',
          'Use regional CDN for faster loading',
        ],
      },
      {
        name: 'First Input Delay',
        current: budgetData.violations.find(v => v.metric === 'FID')?.value || 0,
        budget: 100,
        unit: 'ms',
        severity: budgetData.violations.some(v => v.metric === 'FID') ? 
          (budgetData.violations.find(v => v.metric === 'FID')!.severity === 'error' ? 'error' : 'warning') : 'good',
        description: 'Delay in responding to first interaction',
        recommendations: [
          'Implement JavaScript code splitting',
          'Optimize event handlers',
          'Reduce main thread work',
        ],
      },
      {
        name: 'Cumulative Layout Shift',
        current: budgetData.violations.find(v => v.metric === 'CLS')?.value || 0,
        budget: 0.1,
        unit: '',
        severity: budgetData.violations.some(v => v.metric === 'CLS') ? 
          (budgetData.violations.find(v => v.metric === 'CLS')!.severity === 'error' ? 'error' : 'warning') : 'good',
        description: 'Visual stability metric',
        recommendations: [
          'Add width/height to images',
          'Reserve space for dynamic content',
          'Use font-display: swap',
        ],
      },
      
      // Resource Budgets
      {
        name: 'JavaScript Bundle Size',
        current: budgetData.violations.find(v => v.metric === 'Bundle Size')?.value || 0,
        budget: 500,
        unit: 'KB',
        severity: budgetData.violations.some(v => v.metric === 'Bundle Size') ? 
          (budgetData.violations.find(v => v.metric === 'Bundle Size')!.severity === 'error' ? 'error' : 'warning') : 'good',
        description: 'Total JavaScript bundle size',
        recommendations: [
          'Implement code splitting',
          'Remove unused dependencies',
          'Use dynamic imports',
        ],
      },
      
      // Memory Usage
      {
        name: 'Memory Usage',
        current: memoryData?.percentage || 0,
        budget: 80,
        unit: '%',
        severity: memoryData ? 
          (memoryData.percentage > 90 ? 'error' : memoryData.percentage > 70 ? 'warning' : 'good') : 'good',
        description: 'JavaScript heap memory usage',
        recommendations: [
          'Optimize memory leaks',
          'Implement proper cleanup',
          'Use WeakMap/WeakSet appropriately',
        ],
      },
    ]

    setBudgetItems(items)

    // Calculate total score
    let score = 100
    items.forEach(item => {
      if (item.severity === 'error') score -= 20
      else if (item.severity === 'warning') score -= 10
    })
    setTotalScore(Math.max(0, score))

  }, [budgetData, memoryData])

  const getOverallScore = () => {
    if (totalScore >= 90) return 'excellent'
    if (totalScore >= 80) return 'good'
    if (totalScore >= 60) return 'needs-improvement'
    return 'poor'
  }

  const getScoreColor = (score: string) => {
    switch (score) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200'
      case 'good': return 'text-green-600 bg-green-50 border-green-200'
      case 'needs-improvement': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'poor': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getScoreIcon = (score: string) => {
    switch (score) {
      case 'excellent': return <CheckCircle className="h-4 w-4" />
      case 'good': return <CheckCircle className="h-4 w-4" />
      case 'needs-improvement': return <AlertTriangle className="h-4 w-4" />
      case 'poor': return <AlertTriangle className="h-4 w-4" />
      default: return null
    }
  }

  const exportBudgetReport = () => {
    const report = {
      timestamp: Date.now(),
      totalScore,
      overallScore: getOverallScore(),
      budgets: budgetItems,
      violations: budgetData.violations,
      networkInfo: networkData,
      memoryInfo: memoryData,
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `performance-budget-${new Date().toISOString().slice(0, 19)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const resetBudgets = () => {
    // In a real implementation, this would reset budget thresholds
    console.log('Budgets reset to defaults')
  }

  return (
    <div className="space-y-6">
      {/* Header with Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              Performance Budget Monitor
            </span>
            <Badge variant="secondary" className={getScoreColor(getOverallScore())}>
              {getScoreIcon(getOverallScore())}
              <span className="ml-1">{totalScore.toFixed(0)}% - {getOverallScore().replace('-', ' ')}</span>
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {totalScore.toFixed(0)}%
            </div>
            <p className="text-gray-600">
              Performance Budget Score
            </p>
          </div>

          {/* Key Metrics Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Target className="h-6 w-6 text-blue-500 mx-auto mb-1" />
              <div className="text-lg font-bold text-gray-900">
                {budgetItems.filter(item => item.severity === 'good').length}
              </div>
              <div className="text-xs text-gray-600">Within Budget</div>
            </div>
            
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-yellow-500 mx-auto mb-1" />
              <div className="text-lg font-bold text-yellow-700">
                {budgetItems.filter(item => item.severity === 'warning').length}
              </div>
              <div className="text-xs text-yellow-600">Near Limit</div>
            </div>
            
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <TrendingUp className="h-6 w-6 text-red-500 mx-auto mb-1" />
              <div className="text-lg font-bold text-red-700">
                {budgetItems.filter(item => item.severity === 'error').length}
              </div>
              <div className="text-xs text-red-600">Exceeded</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Wifi className="h-6 w-6 text-green-500 mx-auto mb-1" />
              <div className="text-lg font-bold text-green-700">
                {networkData.effectiveType?.toUpperCase() || 'N/A'}
              </div>
              <div className="text-xs text-green-600">Network</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Violations Alert */}
      {budgetData.hasViolations && (
        <Alert className={`border-l-4 ${
          budgetData.hasErrors 
            ? 'border-red-500 bg-red-50' 
            : 'border-yellow-500 bg-yellow-50'
        }`}>
          <AlertTriangle className={`h-4 w-4 ${
            budgetData.hasErrors ? 'text-red-600' : 'text-yellow-600'
          }`} />
          <AlertDescription className={budgetData.hasErrors ? 'text-red-800' : 'text-yellow-800'}>
            <div className="font-semibold mb-2">
              Performance Budget Violations ({budgetData.violations.length})
            </div>
            <ul className="space-y-1">
              {budgetData.violations.map((violation, index) => (
                <li key={index}>
                  • {violation.metric}: {violation.value.toFixed(1)} 
                  (threshold: {violation.threshold.toFixed(1)})
                  <Badge 
                    variant="secondary" 
                    className={`ml-2 text-xs ${
                      violation.severity === 'error' 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {violation.severity}
                  </Badge>
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Budget Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-500" />
            Performance Budget Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {budgetItems.map((item, index) => (
              <BudgetItem key={index} {...item} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Budget Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-500" />
            Budget Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Current Budgets</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(budgetData.budgets).map(([key, value]) => (
                  <div key={key} className="text-center p-3 border rounded-lg">
                    <div className="text-lg font-bold text-gray-900">
                      {typeof value === 'number' && key.includes('Size') 
                        ? `${(value / 1024).toFixed(0)}KB` 
                        : `${value}${!key.includes('Size') ? (key === 'cls' ? '' : 'ms') : 'KB'}`
                      }
                    </div>
                    <div className="text-xs text-gray-600 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={exportBudgetReport}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                Export Report
              </button>
              
              <button
                onClick={resetBudgets}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Zap className="h-4 w-4" />
                Reset Budgets
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-indigo-500" />
            Budget Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {budgetItems.filter(item => item.severity !== 'good').map((item, index) => (
              <div key={index} className="p-4 border-l-4 border-yellow-500 bg-yellow-50 rounded-r-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-yellow-800">{item.name}</h4>
                    <p className="text-sm text-yellow-700 mt-1">{item.description}</p>
                  </div>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                    {((item.current / item.budget) * 100).toFixed(0)}% of budget
                  </Badge>
                </div>
                {item.recommendations && (
                  <div className="mt-3">
                    <div className="text-sm font-medium text-yellow-800 mb-2">Recommendations:</div>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {item.recommendations.map((rec, recIndex) => (
                        <li key={recIndex}>• {rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PerformanceBudgetMonitor
