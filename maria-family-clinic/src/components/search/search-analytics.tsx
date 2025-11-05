'use client'

import React from 'react'
import { 
  Search, 
  TrendingUp, 
  Clock, 
  MapPin, 
  Star,
  BarChart3,
  Eye,
  MousePointer,
  Timer,
  Users,
  Activity
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface SearchAnalyticsProps {
  searchQuery: string
  resultCount: number
  responseTimeMs?: number
  clickedResults?: string[]
  sessionId: string
  searchFilters?: Record<string, any>
  className?: string
}

interface PopularSearchData {
  term: string
  count: number
  trend: 'up' | 'down' | 'stable'
  change: number
}

interface SearchTrend {
  period: string
  searches: number
  uniqueUsers: number
  avgResultCount: number
  avgResponseTime: number
}

export function SearchAnalytics({
  searchQuery,
  resultCount,
  responseTimeMs,
  clickedResults = [],
  sessionId,
  searchFilters,
  className
}: SearchAnalyticsProps) {
  // Mock data for demonstration
  const [analyticsData] = React.useState(() => ({
    totalSearches: 12847,
    uniqueSearches: 8932,
    avgResultCount: 24.6,
    avgResponseTime: 142,
    popularSearches: [
      { term: 'Cardiology consultation', count: 1247, trend: 'up' as const, change: 15.2 },
      { term: 'Skin specialist', count: 1089, trend: 'up' as const, change: 8.7 },
      { term: 'Pediatrician near me', count: 967, trend: 'stable' as const, change: 0.3 },
      { term: 'Mental health therapy', count: 834, trend: 'up' as const, change: 12.1 },
      { term: 'Eye doctor', count: 723, trend: 'down' as const, change: -3.4 },
      { term: 'General practitioner', count: 689, trend: 'stable' as const, change: 1.1 },
    ],
    searchTrends: [
      { period: 'This Week', searches: 3247, uniqueUsers: 2156, avgResultCount: 23.8, avgResponseTime: 138 },
      { period: 'Last Week', searches: 3101, uniqueUsers: 2089, avgResultCount: 24.2, avgResponseTime: 145 },
      { period: '2 Weeks Ago', searches: 2989, uniqueUsers: 2034, avgResultCount: 25.1, avgResponseTime: 152 },
      { period: '3 Weeks Ago', searches: 2856, uniqueUsers: 1967, avgResultCount: 24.7, avgResponseTime: 147 },
    ],
    specialtyBreakdown: [
      { specialty: 'General Practice', searches: 2847, percentage: 22.2 },
      { specialty: 'Cardiology', searches: 1834, percentage: 14.3 },
      { specialty: 'Dermatology', searches: 1678, percentage: 13.1 },
      { specialty: 'Orthopedics', searches: 1456, percentage: 11.3 },
      { specialty: 'Pediatrics', searches: 1289, percentage: 10.0 },
      { specialty: 'Mental Health', searches: 1089, percentage: 8.5 },
    ]
  }))

  const searchSuccessRate = resultCount > 0 ? Math.min((clickedResults.length / Math.max(resultCount, 1)) * 100, 100) : 0
  const performanceRating = responseTimeMs ? 
    (responseTimeMs < 100 ? 'excellent' : 
     responseTimeMs < 200 ? 'good' : 
     responseTimeMs < 500 ? 'fair' : 'poor') : 'unknown'

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return '↗️'
      case 'down': return '↘️'
      case 'stable': return '→'
    }
  }

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return 'text-green-600'
      case 'down': return 'text-red-600'
      case 'stable': return 'text-gray-600'
    }
  }

  return (
    <div className={className}>
      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="current">Current Search</TabsTrigger>
          <TabsTrigger value="trends">Search Trends</TabsTrigger>
          <TabsTrigger value="insights">Search Insights</TabsTrigger>
        </TabsList>

        {/* Current Search Analytics */}
        <TabsContent value="current" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Performance */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Timer className="h-4 w-4" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Response Time</span>
                    <Badge variant={performanceRating === 'excellent' ? 'default' : 'secondary'}>
                      {responseTimeMs ? `${responseTimeMs}ms` : 'N/A'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Results Found</span>
                    <span className="text-sm font-medium">{resultCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Click Rate</span>
                    <span className="text-sm font-medium">{searchSuccessRate.toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Search Quality */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <BarChart3 className="h-4 w-4" />
                  Search Quality
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>Relevance Score</span>
                      <span className="font-medium">92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>Result Diversity</span>
                      <span className="font-medium">87%</span>
                    </div>
                    <Progress value={87} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Engagement */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4" />
                  Engagement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Profile Views</span>
                    <span className="text-sm font-medium">8</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Appointments</span>
                    <span className="text-sm font-medium">2</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Messages Sent</span>
                    <span className="text-sm font-medium">3</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search Query Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Search Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Search Terms</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Query: "{searchQuery}"</span>
                        <Badge variant="outline">{resultCount} results</Badge>
                      </div>
                      {searchFilters && Object.keys(searchFilters).length > 0 && (
                        <div className="text-sm text-muted-foreground">
                          Applied filters: {Object.keys(searchFilters).join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Match Quality</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Exact Matches</span>
                        <span className="font-medium">12</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Partial Matches</span>
                        <span className="font-medium">8</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Related Results</span>
                        <span className="font-medium">4</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Performance Metrics</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Time to First Result</span>
                        <span className="font-medium">{responseTimeMs ? `${responseTimeMs}ms` : 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Index Usage</span>
                        <Badge variant="outline">Optimized</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Cache Hit Rate</span>
                        <span className="font-medium">94%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">User Satisfaction</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">(Based on similar searches)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Search Trends */}
        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Searches</p>
                    <p className="text-2xl font-bold">{analyticsData.totalSearches.toLocaleString()}</p>
                  </div>
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Unique Searches</p>
                    <p className="text-2xl font-bold">{analyticsData.uniqueSearches.toLocaleString()}</p>
                  </div>
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Results</p>
                    <p className="text-2xl font-bold">{analyticsData.avgResultCount}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Response</p>
                    <p className="text-2xl font-bold">{analyticsData.avgResponseTime}ms</p>
                  </div>
                  <Timer className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Popular Searches */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Popular Search Terms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyticsData.popularSearches.map((search, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <span className="font-medium">{search.term}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        {search.count.toLocaleString()} searches
                      </span>
                      <div className={cn("flex items-center gap-1", getTrendColor(search.trend))}>
                        <span className="text-sm">{getTrendIcon(search.trend)}</span>
                        <span className="text-sm font-medium">
                          {search.change > 0 ? '+' : ''}{search.change.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Search Trends Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Search Volume Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.searchTrends.map((trend, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{trend.period}</span>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{trend.searches} searches</span>
                        <span>{trend.uniqueUsers} users</span>
                        <span>{trend.avgResponseTime}ms avg</span>
                      </div>
                    </div>
                    <Progress value={(trend.searches / 3500) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Search Insights */}
        <TabsContent value="insights" className="space-y-4">
          {/* Specialty Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Most Searched Specialties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.specialtyBreakdown.map((specialty, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{specialty.specialty}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {specialty.searches.toLocaleString()} searches
                        </span>
                        <Badge variant="outline">{specialty.percentage}%</Badge>
                      </div>
                    </div>
                    <Progress value={specialty.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Search Optimization Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance Optimization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Cache Hit Rate</span>
                  <Badge variant="default">94.2%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Index Efficiency</span>
                  <Badge variant="default">Excellent</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Query Optimization</span>
                  <Badge variant="default">Optimized</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Memory Usage</span>
                  <Badge variant="secondary">Normal</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">User Experience</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Avg Session Duration</span>
                  <span className="text-sm font-medium">4m 23s</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Search Success Rate</span>
                  <Badge variant="default">87.3%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Zero Result Searches</span>
                  <span className="text-sm font-medium">2.1%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">User Satisfaction</span>
                  <Badge variant="default">4.6/5</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export type { SearchAnalyticsProps, PopularSearchData, SearchTrend }