'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Mail,
  Phone,
  MessageSquare,
  Calendar,
  Star,
  BarChart3
} from 'lucide-react'
import { EnquiryStats as EnquiryStatsType } from './types'
import { format } from 'date-fns'

interface EnquiryStatsProps {
  stats: EnquiryStatsType | null
  isLoading: boolean
}

export function EnquiryStats({ stats, isLoading }: EnquiryStatsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-8 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No statistics available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getResponseTimeColor = (hours: number) => {
    if (hours <= 4) return 'text-green-600'
    if (hours <= 8) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getSatisfactionColor = (score: number) => {
    if (score >= 4) return 'text-green-600'
    if (score >= 3) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getStatusColor = (count: number, total: number) => {
    const percentage = (count / total) * 100
    if (percentage >= 70) return 'text-green-600'
    if (percentage >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enquiries</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.thisMonth} this month
            </p>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span>New: {stats.new}</span>
                <span>In Progress: {stats.inProgress}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Resolved: {stats.resolved}</span>
                <span>Closed: {stats.closed}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getResponseTimeColor(stats.averageResponseTime)}`}>
              {Math.round(stats.averageResponseTime)}h
            </div>
            <p className="text-xs text-muted-foreground">
              Avg. response time
            </p>
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span>Resolution</span>
                <span>{Math.round(stats.averageResolutionTime)}h</span>
              </div>
              <Progress 
                value={Math.min((24 - stats.averageResponseTime) / 24 * 100, 100)} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getSatisfactionColor(stats.satisfactionScore)}`}>
              {stats.satisfactionScore.toFixed(1)}/5
            </div>
            <p className="text-xs text-muted-foreground">
              Average rating
            </p>
            <div className="mt-2 flex space-x-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor(stats.satisfactionScore)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
            <div className="mt-2">
              <Progress 
                value={Math.min((stats.overdue / stats.total) * 100, 100)} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Status Breakdown</CardTitle>
          <CardDescription>Current enquiry status distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { label: 'New', value: stats.new, color: 'bg-blue-500', icon: Clock },
              { label: 'In Progress', value: stats.inProgress, color: 'bg-yellow-500', icon: MessageSquare },
              { label: 'Pending', value: stats.pending, color: 'bg-orange-500', icon: Clock },
              { label: 'Resolved', value: stats.resolved, color: 'bg-green-500', icon: CheckCircle },
              { label: 'Closed', value: stats.closed, color: 'bg-gray-500', icon: CheckCircle }
            ].map((item) => {
              const percentage = stats.total > 0 ? (item.value / stats.total) * 100 : 0
              const Icon = item.icon
              
              return (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">
                        {item.value} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Enquiry Types</CardTitle>
          <CardDescription>Distribution by enquiry type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(stats.byType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm font-medium capitalize">
                  {type.toLowerCase().replace('_', ' ')}
                </span>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{count}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Priority Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Priority Levels</CardTitle>
          <CardDescription>Distribution by priority level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(stats.byPriority).map(([priority, count]) => {
              const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0
              const colors = {
                LOW: 'bg-green-500',
                NORMAL: 'bg-blue-500',
                HIGH: 'bg-orange-500',
                URGENT: 'bg-red-500'
              }
              
              return (
                <div key={priority} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">{priority.toLowerCase()}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">
                        {count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <Progress 
                    value={percentage} 
                    className="h-2"
                  />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Staff Workload */}
      {stats.staffWorkload && stats.staffWorkload.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Staff Workload</CardTitle>
            <CardDescription>Current workload distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.staffWorkload.map((staff) => (
                <div key={staff.staffId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{staff.staffName}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span>{staff.assignedCount} assigned</span>
                      <span>•</span>
                      <span>{staff.resolvedCount} resolved</span>
                      <span>•</span>
                      <span>{Math.round(staff.averageResponseTime)}h avg</span>
                    </div>
                  </div>
                  <Progress 
                    value={Math.min((staff.assignedCount / 20) * 100, 100)} 
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Summary</CardTitle>
          <CardDescription>Recent enquiry activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Today</p>
              <p className="text-2xl font-bold">{stats.today}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">This Week</p>
              <p className="text-2xl font-bold">{stats.thisWeek}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">This Month</p>
              <p className="text-2xl font-bold">{stats.thisMonth}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}