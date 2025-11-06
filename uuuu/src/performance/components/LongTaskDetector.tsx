/**
 * Long Task Detector Component
 * Sub-Phase 10.2: Core Web Vitals & Performance Optimization
 * Detects and monitors JavaScript long tasks that block the main thread
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useLongTasks } from '../hooks'
import {
  Cpu,
  AlertTriangle,
  Clock,
  Activity,
  TrendingUp,
  X,
} from 'lucide-react'

interface LongTaskInfo {
  startTime: number
  duration: number
  name?: string
}

export function LongTaskDetector() {
  const longTasks = useLongTasks()
  const [isMonitoring, setIsMonitoring] = useState(true)
  const [taskHistory, setTaskHistory] = useState<LongTaskInfo[]>([])
  const [alerts, setAlerts] = useState<Array<{ id: string; message: string; timestamp: number }>>([])

  useEffect(() => {
    if (!isMonitoring) return

    // Monitor new long tasks
    const latestTasks = longTasks.slice(-3) // Last 3 tasks
    if (latestTasks.length > 0) {
      setTaskHistory(prev => {
        const newTasks = latestTasks.filter(newTask => 
          !prev.some(existing => 
            Math.abs(existing.startTime - newTask.startTime) < 100 &&
            Math.abs(existing.duration - newTask.duration) < 10
          )
        )
        return [...prev, ...newTasks].slice(-20) // Keep last 20
      })

      // Create alerts for critical long tasks
      latestTasks.forEach(task => {
        if (task.duration > 100) { // More than 100ms is critical
          const alertId = `task-${task.startTime}`
          if (!alerts.find(a => a.id === alertId)) {
            setAlerts(prev => [...prev, {
              id: alertId,
              message: `Long task detected: ${task.duration.toFixed(0)}ms`,
              timestamp: Date.now(),
            }])

            // Auto-dismiss after 5 seconds
            setTimeout(() => {
              setAlerts(currentAlerts => 
                currentAlerts.filter(a => a.id !== alertId)
              )
            }, 5000)
          }
        }
      })
    }
  }, [longTasks, isMonitoring, alerts])

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId))
  }

  const getTaskSeverity = (duration: number) => {
    if (duration > 200) return 'critical'
    if (duration > 100) return 'warning'
    if (duration > 50) return 'info'
    return 'normal'
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />
      case 'warning': return <Clock className="h-4 w-4" />
      case 'info': return <Activity className="h-4 w-4" />
      default: return <Cpu className="h-4 w-4" />
    }
  }

  const clearHistory = () => {
    setTaskHistory([])
    setAlerts([])
  }

  const statistics = {
    totalTasks: taskHistory.length,
    criticalTasks: taskHistory.filter(t => getTaskSeverity(t.duration) === 'critical').length,
    averageDuration: taskHistory.length > 0 
      ? taskHistory.reduce((sum, t) => sum + t.duration, 0) / taskHistory.length 
      : 0,
    longestTask: taskHistory.length > 0 
      ? Math.max(...taskHistory.map(t => t.duration)) 
      : 0,
  }

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map(alert => (
            <div key={alert.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-red-800">{alert.message}</span>
              </div>
              <button
                onClick={() => dismissAlert(alert.id)}
                className="text-red-600 hover:text-red-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-purple-500" />
              Long Task Detector
            </span>
            <div className="flex items-center gap-2">
              <Badge variant={isMonitoring ? "default" : "outline"}>
                {isMonitoring ? 'Monitoring' : 'Paused'}
              </Badge>
              <button
                onClick={() => setIsMonitoring(!isMonitoring)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {isMonitoring ? 'Pause' : 'Resume'}
              </button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {statistics.totalTasks}
              </div>
              <div className="text-sm text-gray-600">Total Tasks</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {statistics.criticalTasks}
              </div>
              <div className="text-sm text-gray-600">Critical Tasks</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {statistics.averageDuration.toFixed(0)}ms
              </div>
              <div className="text-sm text-gray-600">Average Duration</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {statistics.longestTask.toFixed(0)}ms
              </div>
              <div className="text-sm text-gray-600">Longest Task</div>
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={clearHistory}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
            >
              Clear History
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Task History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            Task History ({taskHistory.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {taskHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Cpu className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No long tasks detected</p>
              <p className="text-sm">Tasks longer than 50ms will appear here</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {taskHistory
                .sort((a, b) => b.startTime - a.startTime)
                .map((task, index) => {
                  const severity = getTaskSeverity(task.duration)
                  return (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg border ${getSeverityColor(severity)}`}
                    >
                      <div className="flex items-center gap-3">
                        {getSeverityIcon(severity)}
                        <div>
                          <div className="font-medium">
                            Task #{taskHistory.length - index}
                          </div>
                          <div className="text-sm text-gray-600">
                            Started at {new Date(task.startTime).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">
                          {task.duration.toFixed(0)}ms
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {severity}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Impact */}
      {statistics.criticalTasks > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <TrendingUp className="h-5 w-5" />
              Performance Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-orange-800">
              <p className="text-sm">
                <strong>{statistics.criticalTasks}</strong> critical long tasks detected.
                These tasks are blocking the main thread and impacting user experience.
              </p>
              
              <div className="space-y-2">
                <h4 className="font-semibold">Recommendations:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Break down large functions into smaller chunks</li>
                  <li>• Use Web Workers for heavy computations</li>
                  <li>• Implement requestAnimationFrame for DOM updates</li>
                  <li>• Optimize JavaScript bundle size</li>
                  <li>• Use code splitting to reduce initial load</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default LongTaskDetector
