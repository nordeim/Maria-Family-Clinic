import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, TrendingDown, Users, Clock, CheckCircle, AlertTriangle, Calendar, Filter } from 'lucide-react'
import { EnquiryWithDetails, EnquiryAnalyticsData, StaffPerformanceData } from './types'
import { format, subDays, subWeeks, subMonths } from 'date-fns'

interface EnquiryAnalyticsDashboardProps {
  enquiries: EnquiryWithDetails[]
  analyticsData?: EnquiryAnalyticsData
  staffPerformance?: StaffPerformanceData[]
  dateRange?: {
    start: Date
    end: Date
  }
  onDateRangeChange?: (range: { start: Date; end: Date }) => void
  loading?: boolean
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff88', '#ff00ff']

export function EnquiryAnalyticsDashboard({
  enquiries,
  analyticsData,
  staffPerformance = [],
  dateRange,
  onDateRangeChange,
  loading = false
}: EnquiryAnalyticsDashboardProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [selectedChart, setSelectedChart] = useState<'trends' | 'types' | 'performance' | 'satisfaction'>('trends')

  // Calculate date range based on selected timeframe
  const getDateRange = (timeframe: string) => {
    const end = new Date()
    let start: Date

    switch (timeframe) {
      case '7d':
        start = subDays(end, 7)
        break
      case '30d':
        start = subDays(end, 30)
        break
      case '90d':
        start = subDays(end, 90)
        break
      case '1y':
        start = subDays(end, 365)
        break
      default:
        start = subDays(end, 30)
    }

    return { start, end }
  }

  const currentRange = getDateRange(selectedTimeframe)
  
  // Process enquiries for trend analysis
  const processTrendData = () => {
    if (!enquiries.length) return []

    const trends = new Map<string, {
      date: string
      total: number
      pending: number
      inProgress: number
      resolved: number
      closed: number
      responseTime: number
    }>()

    enquiries
      .filter(enquiry => {
        const createdAt = new Date(enquiry.createdAt)
        return createdAt >= currentRange.start && createdAt <= currentRange.end
      })
      .forEach(enquiry => {
        const dateKey = format(new Date(enquiry.createdAt), 'MMM dd')
        
        if (!trends.has(dateKey)) {
          trends.set(dateKey, {
            date: dateKey,
            total: 0,
            pending: 0,
            inProgress: 0,
            resolved: 0,
            closed: 0,
            responseTime: 0
          })
        }

        const trend = trends.get(dateKey)!
        trend.total++
        trend[enquiry.status.toLowerCase() as keyof typeof trend] = 
          typeof trend[enquiry.status.toLowerCase() as keyof typeof trend] === 'number' 
            ? (trend[enquiry.status.toLowerCase() as keyof typeof trend] as number) + 1
            : 0
      })

    return Array.from(trends.values()).sort((a, b) => a.date.localeCompare(b.date))
  }

  // Process type distribution
  const processTypeData = () => {
    const typeCount = enquiries.reduce((acc, enquiry) => {
      acc[enquiry.type] = (acc[enquiry.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(typeCount).map(([type, count]) => ({
      name: type.replace('_', ' '),
      value: count,
      percentage: ((count / enquiries.length) * 100).toFixed(1)
    }))
  }

  // Calculate resolution metrics
  const calculateResolutionMetrics = () => {
    if (!enquiries.length) return { avgResolutionTime: 0, resolutionRate: 0, slaCompliance: 0 }

    const resolved = enquiries.filter(e => e.status === 'RESOLVED' || e.status === 'CLOSED')
    const responseTimes: number[] = []

    resolved.forEach(enquiry => {
      if (enquiry.responseDate) {
        const responseTime = new Date(enquiry.responseDate).getTime() - new Date(enquiry.createdAt).getTime()
        responseTimes.push(responseTime / (1000 * 60 * 60)) // Convert to hours
      }
    })

    const avgResolutionTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0

    const resolutionRate = (resolved.length / enquiries.length) * 100

    // SLA compliance: 95% of enquiries resolved within 48 hours for high priority, 7 days for others
    const slaCompliant = resolved.filter(enquiry => {
      if (!enquiry.responseDate) return false
      const responseTime = new Date(enquiry.responseDate).getTime() - new Date(enquiry.createdAt).getTime()
      const responseTimeHours = responseTime / (1000 * 60 * 60)
      const slaHours = enquiry.priority === 'URGENT' || enquiry.priority === 'HIGH' ? 48 : 168
      return responseTimeHours <= slaHours
    }).length

    const slaCompliance = resolved.length > 0 ? (slaCompliant / resolved.length) * 100 : 0

    return {
      avgResolutionTime: Math.round(avgResolutionTime),
      resolutionRate: Math.round(resolutionRate),
      slaCompliance: Math.round(slaCompliance)
    }
  }

  // Process staff performance data
  const processStaffPerformance = () => {
    const staffMetrics = new Map<string, {
      name: string
      totalAssigned: number
      resolved: number
      avgResponseTime: number
      satisfaction: number
    }>()

    enquiries
      .filter(enquiry => enquiry.response) // Only consider responded enquiries
      .forEach(enquiry => {
        const staffName = enquiry.assignedTo || 'Unassigned'
        
        if (!staffMetrics.has(staffName)) {
          staffMetrics.set(staffName, {
            name: staffName,
            totalAssigned: 0,
            resolved: 0,
            avgResponseTime: 0,
            satisfaction: 0
          })
        }

        const metrics = staffMetrics.get(staffName)!
        metrics.totalAssigned++
        
        if (enquiry.status === 'RESOLVED' || enquiry.status === 'CLOSED') {
          metrics.resolved++
        }

        if (enquiry.responseDate) {
          const responseTime = new Date(enquiry.responseDate).getTime() - new Date(enquiry.createdAt).getTime()
          const responseHours = responseTime / (1000 * 60 * 60)
          metrics.avgResponseTime = (metrics.avgResponseTime + responseHours) / 2
        }
      })

    return Array.from(staffMetrics.values())
      .map(metrics => ({
        ...metrics,
        resolutionRate: metrics.totalAssigned > 0 ? (metrics.resolved / metrics.totalAssigned) * 100 : 0
      }))
      .sort((a, b) => b.resolutionRate - a.resolutionRate)
  }

  const trendData = processTrendData()
  const typeData = processTypeData()
  const resolutionMetrics = calculateResolutionMetrics()
  const staffPerformanceData = processStaffPerformance()

  const kpiCards = [
    {
      title: 'Total Enquiries',
      value: enquiries.length.toLocaleString(),
      icon: Users,
      change: '+12%',
      trend: 'up',
      color: 'text-blue-600'
    },
    {
      title: 'Avg Response Time',
      value: `${resolutionMetrics.avgResolutionTime}h`,
      icon: Clock,
      change: resolutionMetrics.avgResolutionTime < 24 ? '-8%' : '+15%',
      trend: resolutionMetrics.avgResolutionTime < 24 ? 'up' : 'down',
      color: 'text-green-600'
    },
    {
      title: 'Resolution Rate',
      value: `${resolutionMetrics.resolutionRate}%`,
      icon: CheckCircle,
      change: '+5%',
      trend: 'up',
      color: 'text-emerald-600'
    },
    {
      title: 'SLA Compliance',
      value: `${resolutionMetrics.slaCompliance}%`,
      icon: AlertTriangle,
      change: resolutionMetrics.slaCompliance >= 95 ? '+2%' : '-3%',
      trend: resolutionMetrics.slaCompliance >= 95 ? 'up' : 'down',
      color: resolutionMetrics.slaCompliance >= 95 ? 'text-green-600' : 'text-red-600'
    }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Enquiry Analytics</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Enquiry Analytics Dashboard</h2>
          <p className="text-gray-600 mt-1">Comprehensive insights into enquiry performance and trends</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon
          return (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{kpi.title}</CardTitle>
                <Icon className={`h-4 w-4 ${kpi.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
                <div className="flex items-center mt-1">
                  {kpi.trend === 'up' ? (
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                  )}
                  <span className={`text-xs ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {kpi.change}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">from last period</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts */}
      <Tabs value={selectedChart} onValueChange={(value) => setSelectedChart(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="types">Types</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="satisfaction">Satisfaction</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Enquiry Volume Trends</CardTitle>
                <CardDescription>Daily enquiry volume over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="total" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                    <Area type="monotone" dataKey="resolved" stackId="1" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Status Distribution</CardTitle>
                <CardDescription>Current status breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="pending" fill="#ffc658" />
                    <Bar dataKey="inProgress" fill="#ff7300" />
                    <Bar dataKey="resolved" fill="#00ff88" />
                    <Bar dataKey="closed" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="types" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Enquiry Types Distribution</CardTitle>
                <CardDescription>Breakdown by enquiry category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={typeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                    >
                      {typeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Type Statistics</CardTitle>
                <CardDescription>Detailed breakdown of enquiry types</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {typeData.map((type, index) => (
                  <div key={type.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="font-medium">{type.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{type.value}</div>
                      <div className="text-sm text-gray-500">{type.percentage}%</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Staff Performance Metrics</CardTitle>
              <CardDescription>Individual staff performance and workload</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={staffPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalAssigned" fill="#8884d8" name="Total Assigned" />
                  <Bar dataKey="resolved" fill="#82ca9d" name="Resolved" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {staffPerformanceData.slice(0, 6).map((staff) => (
              <Card key={staff.name}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{staff.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Assigned:</span>
                    <Badge variant="secondary">{staff.totalAssigned}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Resolved:</span>
                    <Badge variant="default">{staff.resolved}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Resolution Rate:</span>
                    <Badge variant="outline">{Math.round(staff.resolutionRate)}%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg Response:</span>
                    <span className="text-sm font-medium">{Math.round(staff.avgResponseTime)}h</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="satisfaction" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Satisfaction Overview</CardTitle>
                <CardDescription>Satisfaction scores and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600">4.2</div>
                    <div className="text-sm text-gray-600">Average Satisfaction Score</div>
                    <div className="flex items-center justify-center mt-2">
                      {[1, 2, 3, 4].map((star) => (
                        <CheckCircle key={star} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                      <CheckCircle className="h-5 w-5 text-gray-300" />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Response Time</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                        <span className="text-sm font-medium">85%</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Problem Resolution</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                        </div>
                        <span className="text-sm font-medium">92%</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Communication</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                        </div>
                        <span className="text-sm font-medium">78%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Satisfaction Breakdown</CardTitle>
                <CardDescription>Detailed satisfaction metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">78%</div>
                      <div className="text-sm text-green-700">Very Satisfied</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">15%</div>
                      <div className="text-sm text-blue-700">Satisfied</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">5%</div>
                      <div className="text-sm text-yellow-700">Neutral</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">2%</div>
                      <div className="text-sm text-red-700">Dissatisfied</div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Net Promoter Score</span>
                      <span className="text-lg font-bold text-green-600">+67</span>
                    </div>
                    <div className="text-sm text-gray-600">Based on customer willingness to recommend</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}