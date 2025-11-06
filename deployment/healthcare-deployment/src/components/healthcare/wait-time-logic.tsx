import * as React from "react"
import { Clock, TrendingUp, TrendingDown, Activity, Users, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

// Wait Time Estimation Types
export interface WaitTimeData {
  clinicId: string
  currentWaitTime: number // in minutes
  historicalAverage: number // average wait time in minutes
  peakHours: string[] // times when wait is typically longer
  trend: 'increasing' | 'decreasing' | 'stable'
  confidence: 'high' | 'medium' | 'low' // confidence in the estimation
  lastUpdated: Date
  factors: WaitTimeFactor[]
  queuePosition?: number
  estimatedServiceTime?: number // expected consultation duration
}

export interface WaitTimeFactor {
  type: 'time' | 'day' | 'season' | 'event' | 'staff' | 'capacity'
  impact: 'increase' | 'decrease' | 'neutral'
  value: string
  description: string
  severity: 'low' | 'medium' | 'high'
}

// Wait Time Estimator Component
interface WaitTimeEstimatorProps {
  data: WaitTimeData
  showFactors?: boolean
  showTrend?: boolean
  className?: string
}

const WaitTimeEstimator = React.forwardRef<HTMLDivElement, WaitTimeEstimatorProps>(
  ({ data, showFactors = true, showTrend = true, className, ...props }, ref) => {
    const getWaitTimeLevel = (minutes: number) => {
      if (minutes <= 15) return { level: 'short', color: 'text-green-700', bgColor: 'bg-green-50', borderColor: 'border-green-200' }
      if (minutes <= 30) return { level: 'medium', color: 'text-yellow-700', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' }
      if (minutes <= 60) return { level: 'long', color: 'text-orange-700', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' }
      return { level: 'very-long', color: 'text-red-700', bgColor: 'bg-red-50', borderColor: 'border-red-200' }
    }

    const getTrendIcon = () => {
      switch (data.trend) {
        case 'increasing':
          return <TrendingUp className="h-4 w-4 text-red-500" />
        case 'decreasing':
          return <TrendingDown className="h-4 w-4 text-green-500" />
        default:
          return <Activity className="h-4 w-4 text-blue-500" />
      }
    }

    const getConfidenceColor = () => {
      switch (data.confidence) {
        case 'high':
          return 'text-green-600'
        case 'medium':
          return 'text-yellow-600'
        default:
          return 'text-red-600'
      }
    }

    const getConfidenceText = () => {
      switch (data.confidence) {
        case 'high':
          return 'High confidence'
        case 'medium':
          return 'Medium confidence'
        default:
          return 'Low confidence'
      }
    }

    const waitLevel = getWaitTimeLevel(data.currentWaitTime)

    return (
      <div ref={ref} className={cn(
        "rounded-lg border p-4 space-y-3",
        waitLevel.bgColor,
        waitLevel.borderColor,
        className
      )} {...props}>
        {/* Main Wait Time Display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className={cn("h-5 w-5", waitLevel.color)} />
            <span className={cn("font-semibold text-lg", waitLevel.color)}>
              {data.currentWaitTime} min
            </span>
            <span className={cn("text-sm font-medium px-2 py-1 rounded-full border", 
              waitLevel.color, waitLevel.bgColor, waitLevel.borderColor
            )}>
              {waitLevel.level} wait
            </span>
          </div>
          
          {showTrend && (
            <div className="flex items-center gap-1 text-sm">
              {getTrendIcon()}
              <span className={cn(
                "capitalize",
                data.trend === 'increasing' ? 'text-red-600' : 
                data.trend === 'decreasing' ? 'text-green-600' : 'text-blue-600'
              )}>
                {data.trend}
              </span>
            </div>
          )}
        </div>

        {/* Additional Information */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            {data.queuePosition && (
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>Queue: {data.queuePosition}</span>
              </div>
            )}
            {data.estimatedServiceTime && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Consult: {data.estimatedServiceTime}min</span>
              </div>
            )}
          </div>
          
          <div className={cn("text-xs", getConfidenceColor())}>
            {getConfidenceText()}
          </div>
        </div>

        {/* Historical Comparison */}
        <div className="text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Historical average:</span>
            <span className="font-medium">{data.historicalAverage} min</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Compared to average:</span>
            <span className={cn(
              "font-medium",
              data.currentWaitTime > data.historicalAverage ? 'text-red-600' : 'text-green-600'
            )}>
              {data.currentWaitTime > data.historicalAverage ? '+' : ''}
              {data.currentWaitTime - data.historicalAverage} min
            </span>
          </div>
        </div>

        {/* Wait Time Factors */}
        {showFactors && data.factors.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Current factors affecting wait time:</h4>
            <div className="space-y-1">
              {data.factors.slice(0, 3).map((factor, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    factor.impact === 'increase' ? 'bg-red-400' :
                    factor.impact === 'decrease' ? 'bg-green-400' : 'bg-gray-400'
                  )} />
                  <span className="text-gray-600">{factor.description}</span>
                  <span className={cn(
                    "ml-auto px-1.5 py-0.5 rounded text-xs",
                    factor.severity === 'high' ? 'bg-red-100 text-red-700' :
                    factor.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  )}>
                    {factor.severity}
                  </span>
                </div>
              ))}
              {data.factors.length > 3 && (
                <div className="text-xs text-gray-500">
                  +{data.factors.length - 3} more factors
                </div>
              )}
            </div>
          </div>
        )}

        {/* Last Updated */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Last updated: {data.lastUpdated.toLocaleTimeString()}</span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span>Live</span>
          </div>
        </div>
      </div>
    )
  }
)
WaitTimeEstimator.displayName = "WaitTimeEstimator"

// Wait Time History Component
interface WaitTimeHistoryProps {
  data: {
    date: Date
    waitTime: number
    dayOfWeek: string
    isWeekend?: boolean
  }[]
  showComparison?: boolean
  className?: string
}

const WaitTimeHistory = React.forwardRef<HTMLDivElement, WaitTimeHistoryProps>(
  ({ data, showComparison = true, className, ...props }, ref) => {
    if (data.length === 0) {
      return (
        <div ref={ref} className={cn("text-center py-4 text-gray-500", className)} {...props}>
          No wait time history available
        </div>
      )
    }

    const averageWaitTime = data.reduce((sum, entry) => sum + entry.waitTime, 0) / data.length
    const maxWaitTime = Math.max(...data.map(entry => entry.waitTime))
    const minWaitTime = Math.min(...data.map(entry => entry.waitTime))

    const getBarHeight = (waitTime: number) => {
      return `${Math.max((waitTime / maxWaitTime) * 100, 10)}%`
    }

    return (
      <div ref={ref} className={cn("space-y-4", className)} {...props}>
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-sm font-medium text-gray-700">Average</div>
            <div className="text-lg font-semibold">{Math.round(averageWaitTime)}min</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-700">Shortest</div>
            <div className="text-lg font-semibold text-green-600">{minWaitTime}min</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-700">Longest</div>
            <div className="text-lg font-semibold text-red-600">{maxWaitTime}min</div>
          </div>
        </div>

        {/* Historical Chart */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Wait Time History</h4>
          <div className="flex items-end gap-2 h-32 p-2 bg-gray-50 rounded-lg">
            {data.slice(-14).map((entry, index) => (
              <div key={index} className="flex flex-col items-center gap-1 flex-1">
                <div 
                  className="w-full bg-blue-500 rounded-t min-h-[4px] transition-all"
                  style={{ height: getBarHeight(entry.waitTime) }}
                  title={`${entry.waitTime} minutes`}
                />
                <span className="text-xs text-gray-600 rotate-45 origin-left">
                  {entry.dayOfWeek.slice(0, 3)}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Past 2 weeks</span>
            <span>Minutes</span>
          </div>
        </div>

        {/* Recent Entries */}
        <div className="space-y-1">
          <h4 className="text-sm font-medium text-gray-700">Recent Wait Times</h4>
          <div className="space-y-1">
            {data.slice(-5).reverse().map((entry, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className={cn(
                  "text-gray-600",
                  entry.isWeekend && "font-medium"
                )}>
                  {entry.dayOfWeek} {entry.date.toLocaleDateString()}
                </span>
                <span className="font-medium">{entry.waitTime} minutes</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
)
WaitTimeHistory.displayName = "WaitTimeHistory"

// Wait Time Prediction Component
interface WaitTimePredictionProps {
  currentWaitTime: number
  predictedWaitTime: number
  predictionTime: Date
  confidence: 'high' | 'medium' | 'low'
  factors: string[]
  className?: string
}

const WaitTimePrediction = React.forwardRef<HTMLDivElement, WaitTimePredictionProps>(
  ({ 
    currentWaitTime, 
    predictedWaitTime, 
    predictionTime, 
    confidence, 
    factors = [], 
    className, 
    ...props 
  }, ref) => {
    const timeDifference = Math.floor((predictionTime.getTime() - new Date().getTime()) / (1000 * 60))
    
    const getChangeIndicator = () => {
      const change = predictedWaitTime - currentWaitTime
      if (Math.abs(change) < 2) return null
      
      return {
        direction: change > 0 ? 'increase' : 'decrease',
        value: Math.abs(change),
        color: change > 0 ? 'text-red-600' : 'text-green-600'
      }
    }

    const change = getChangeIndicator()

    return (
      <div ref={ref} className={cn(
        "rounded-lg border p-4 bg-blue-50 border-blue-200",
        className
      )} {...props}>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-blue-900">Predicted Wait Time</h4>
          <div className="text-xs text-blue-700">
            in {timeDifference}min
          </div>
        </div>
        
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl font-bold text-blue-900">
            {predictedWaitTime} min
          </span>
          {change && (
            <div className={cn("flex items-center gap-1 text-sm", change.color)}>
              {change.direction === 'increase' ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>{change.value} min {change.direction}</span>
            </div>
          )}
        </div>

        {factors.length > 0 && (
          <div className="space-y-1">
            <div className="text-xs font-medium text-blue-800">Contributing factors:</div>
            {factors.slice(0, 2).map((factor, index) => (
              <div key={index} className="text-xs text-blue-700">
                • {factor}
              </div>
            ))}
          </div>
        )}

        <div className="mt-3 text-xs text-blue-600">
          Prediction confidence: {confidence}
        </div>
      </div>
    )
  }
)
WaitTimePrediction.displayName = "WaitTimePrediction"

// Wait Time Analytics Dashboard Component
interface WaitTimeAnalyticsProps {
  clinicId: string
  timeRange: 'today' | 'week' | 'month'
  onTimeRangeChange?: (range: 'today' | 'week' | 'month') => void
  className?: string
}

const WaitTimeAnalytics = React.forwardRef<HTMLDivElement, WaitTimeAnalyticsProps>(
  ({ clinicId, timeRange, onTimeRangeChange, className, ...props }, ref) => {
    // This would typically fetch real data from an API
    const mockData = {
      today: {
        current: 25,
        average: 22,
        peak: 45,
        low: 8,
        trend: 'increasing' as const,
        confidence: 'high' as const
      },
      week: {
        current: 28,
        average: 26,
        peak: 52,
        low: 12,
        trend: 'stable' as const,
        confidence: 'medium' as const
      },
      month: {
        current: 30,
        average: 28,
        peak: 58,
        low: 10,
        trend: 'decreasing' as const,
        confidence: 'low' as const
      }
    }

    const currentData = mockData[timeRange]

    return (
      <div ref={ref} className={cn("space-y-4", className)} {...props}>
        {/* Time Range Selector */}
        <div className="flex gap-2">
          {(['today', 'week', 'month'] as const).map((range) => (
            <button
              key={range}
              onClick={() => onTimeRangeChange?.(range)}
              className={cn(
                "px-3 py-1 text-sm rounded-md transition-colors",
                timeRange === range
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-gray-900">{currentData.current}</div>
            <div className="text-xs text-gray-600">Current</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-gray-900">{currentData.average}</div>
            <div className="text-xs text-gray-600">Average</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-red-600">{currentData.peak}</div>
            <div className="text-xs text-gray-600">Peak</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-green-600">{currentData.low}</div>
            <div className="text-xs text-gray-600">Lowest</div>
          </div>
        </div>

        {/* Trend Indicator */}
        <div className="flex items-center justify-center gap-2">
          <div className={cn(
            "flex items-center gap-1 px-2 py-1 rounded text-sm",
            currentData.trend === 'increasing' ? 'bg-red-100 text-red-700' :
            currentData.trend === 'decreasing' ? 'bg-green-100 text-green-700' :
            'bg-blue-100 text-blue-700'
          )}>
            {currentData.trend === 'increasing' ? (
              <TrendingUp className="h-4 w-4" />
            ) : currentData.trend === 'decreasing' ? (
              <TrendingDown className="h-4 w-4" />
            ) : (
              <Activity className="h-4 w-4" />
            )}
            <span className="capitalize">{currentData.trend} trend</span>
          </div>
        </div>
      </div>
    )
  }
)
WaitTimeAnalytics.displayName = "WaitTimeAnalytics"

export {
  WaitTimeEstimator,
  WaitTimeHistory,
  WaitTimePrediction,
  WaitTimeAnalytics
}

export type {
  WaitTimeEstimatorProps,
  WaitTimeHistoryProps,
  WaitTimePredictionProps,
  WaitTimeAnalyticsProps
}