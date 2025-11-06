import * as React from "react"
import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  Star,
  Users,
  MessageSquare,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Target,
  Award,
  AlertCircle,
  CheckCircle,
  Clock,
  ThumbsUp,
  Eye,
  Filter,
  Download,
  Refresh
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { ReviewAnalytics, RatingDimensions, RatingTrend } from "./types"

interface ReviewAnalyticsDashboardProps {
  doctorId: string
  doctorName: string
  className?: string
  dateRange?: '7d' | '30d' | '90d' | '1y' | 'all'
}

interface AnalyticsData {
  ratingTrends: RatingTrend[]
  sentimentData: { name: string; value: number; color: string }[]
  categoryBreakdown: { category: string; rating: number; count: number }[]
  monthlyData: { month: string; reviews: number; avgRating: number }[]
  topKeywords: { word: string; count: number; sentiment: 'positive' | 'negative' | 'neutral' }[]
  comparativeData: { metric: string; doctor: number; specialty: number; national: number }[]
}

export function ReviewAnalyticsDashboard({
  doctorId,
  doctorName,
  className,
  dateRange = '30d'
}: ReviewAnalyticsDashboardProps) {
  const [selectedMetric, setSelectedMetric] = useState<'rating' | 'volume' | 'sentiment'>('rating')
  const [viewMode, setViewMode] = useState<'overview' | 'trends' | 'comparison'>('overview')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Mock data - in real app this would come from API
  const mockAnalyticsData: AnalyticsData = {
    ratingTrends: [
      { period: 'Jan', date: new Date('2024-01'), overallRating: 4.2, dimensions: {
        overall: 4.2, bedsideManner: 4.5, communication: 4.3, waitTime: 3.8,
        treatmentEffectiveness: 4.1, facilityEnvironment: 4.0, painManagement: 0, followUpCare: 4.2
      }, reviewCount: 12, confidence: 0.85 },
      { period: 'Feb', date: new Date('2024-02'), overallRating: 4.4, dimensions: {
        overall: 4.4, bedsideManner: 4.6, communication: 4.5, waitTime: 4.0,
        treatmentEffectiveness: 4.3, facilityEnvironment: 4.1, painManagement: 0, followUpCare: 4.4
      }, reviewCount: 18, confidence: 0.88 },
      { period: 'Mar', date: new Date('2024-03'), overallRating: 4.3, dimensions: {
        overall: 4.3, bedsideManner: 4.4, communication: 4.4, waitTime: 3.9,
        treatmentEffectiveness: 4.2, facilityEnvironment: 4.2, painManagement: 0, followUpCare: 4.3
      }, reviewCount: 15, confidence: 0.82 },
      { period: 'Apr', date: new Date('2024-04'), overallRating: 4.6, dimensions: {
        overall: 4.6, bedsideManner: 4.7, communication: 4.6, waitTime: 4.2,
        treatmentEffectiveness: 4.5, facilityEnvironment: 4.4, painManagement: 0, followUpCare: 4.6
      }, reviewCount: 22, confidence: 0.91 },
      { period: 'May', date: new Date('2024-05'), overallRating: 4.5, dimensions: {
        overall: 4.5, bedsideManner: 4.6, communication: 4.5, waitTime: 4.1,
        treatmentEffectiveness: 4.4, facilityEnvironment: 4.3, painManagement: 0, followUpCare: 4.5
      }, reviewCount: 19, confidence: 0.89 },
    ],
    sentimentData: [
      { name: 'Positive', value: 78, color: '#10B981' },
      { name: 'Neutral', value: 16, color: '#6B7280' },
      { name: 'Negative', value: 6, color: '#EF4444' },
    ],
    categoryBreakdown: [
      { category: 'Bedside Manner', rating: 4.6, count: 86 },
      { category: 'Communication', rating: 4.5, count: 86 },
      { category: 'Treatment', rating: 4.4, count: 75 },
      { category: 'Wait Time', rating: 4.1, count: 86 },
      { category: 'Facility', rating: 4.2, count: 86 },
      { category: 'Follow-up', rating: 4.5, count: 68 },
    ],
    monthlyData: [
      { month: 'Jan', reviews: 12, avgRating: 4.2 },
      { month: 'Feb', reviews: 18, avgRating: 4.4 },
      { month: 'Mar', reviews: 15, avgRating: 4.3 },
      { month: 'Apr', reviews: 22, avgRating: 4.6 },
      { month: 'May', reviews: 19, avgRating: 4.5 },
    ],
    topKeywords: [
      { word: 'professional', count: 45, sentiment: 'positive' },
      { word: 'caring', count: 38, sentiment: 'positive' },
      { word: 'thorough', count: 32, sentiment: 'positive' },
      { word: 'patient', count: 28, sentiment: 'positive' },
      { word: 'wait', count: 25, sentiment: 'negative' },
      { word: 'experienced', count: 22, sentiment: 'positive' },
      { word: 'rushed', count: 18, sentiment: 'negative' },
      { word: 'helpful', count: 35, sentiment: 'positive' },
    ],
    comparativeData: [
      { metric: 'Overall Rating', doctor: 4.5, specialty: 4.2, national: 4.1 },
      { metric: 'Bedside Manner', doctor: 4.6, specialty: 4.3, national: 4.2 },
      { metric: 'Communication', doctor: 4.5, specialty: 4.2, national: 4.1 },
      { metric: 'Wait Time', doctor: 4.1, specialty: 3.8, national: 3.7 },
      { metric: 'Treatment', doctor: 4.4, specialty: 4.1, national: 4.0 },
    ]
  }

  const analyticsSummary = {
    totalReviews: 86,
    verifiedReviews: 72,
    averageRating: 4.5,
    ratingChange: 0.3,
    monthlyReviewCount: 19,
    sentimentScore: 0.85,
    percentileRank: 85,
    responseRate: 0.78
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsRefreshing(false)
  }

  const renderOverviewCards = () => {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">Avg Rating</span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-green-600">+{analyticsSummary.ratingChange}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold">{analyticsSummary.averageRating.toFixed(1)}</p>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-3 w-3",
                        i < Math.floor(analyticsSummary.averageRating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      )}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {analyticsSummary.percentileRank}th percentile
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Total Reviews</span>
              </div>
              <p className="text-2xl font-bold">{analyticsSummary.totalReviews}</p>
              <p className="text-xs text-muted-foreground">
                {analyticsSummary.verifiedReviews} verified
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${(analyticsSummary.verifiedReviews / analyticsSummary.totalReviews) * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Monthly Reviews</span>
              </div>
              <p className="text-2xl font-bold">{analyticsSummary.monthlyReviewCount}</p>
              <p className="text-xs text-muted-foreground">This month</p>
              <div className="flex items-center gap-1 text-xs">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-600">+12% vs last month</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">Sentiment</span>
              </div>
              <p className="text-2xl font-bold">{Math.round(analyticsSummary.sentimentScore * 100)}%</p>
              <p className="text-xs text-muted-foreground">Positive sentiment</p>
              <div className="flex items-center gap-1 text-xs">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span className="text-green-600">Strong performance</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderRatingTrends = () => {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Rating Trends
            </CardTitle>
            <div className="flex gap-2">
              <Select value={selectedMetric} onValueChange={(value: any) => setSelectedMetric(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="volume">Volume</SelectItem>
                  <SelectItem value="sentiment">Sentiment</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockAnalyticsData.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="avgRating" 
                  stroke="#3B82F6" 
                  fill="#3B82F6" 
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderCategoryBreakdown = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Category Ratings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockAnalyticsData.categoryBreakdown.map((category) => (
              <div key={category.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{category.category}</span>
                    <Badge variant="outline" className="text-xs">
                      {category.count} reviews
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium">{category.rating.toFixed(1)}</span>
                    <div className="flex">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-3 w-3",
                            i < Math.round(category.rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full" 
                    style={{ width: `${(category.rating / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderSentimentAnalysis = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            Sentiment Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockAnalyticsData.sentimentData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {mockAnalyticsData.sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium">Top Keywords</h4>
                <div className="flex flex-wrap gap-2">
                  {mockAnalyticsData.topKeywords.map((keyword) => (
                    <Badge
                      key={keyword.word}
                      variant="outline"
                      className={cn(
                        "cursor-pointer",
                        keyword.sentiment === 'positive' && "border-green-200 text-green-700",
                        keyword.sentiment === 'negative' && "border-red-200 text-red-700",
                        keyword.sentiment === 'neutral' && "border-gray-200 text-gray-700"
                      )}
                    >
                      {keyword.word} ({keyword.count})
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Sentiment Score</h4>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-green-500 h-3 rounded-full" 
                      style={{ width: `${analyticsSummary.sentimentScore * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {Math.round(analyticsSummary.sentimentScore * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderComparison = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Performance Comparison
          </CardTitle>
          <CardDescription>
            How Dr. {doctorName} compares to specialty and national averages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockAnalyticsData.comparativeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metric" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Bar dataKey="doctor" fill="#3B82F6" name="Dr. Smith" />
                <Bar dataKey="specialty" fill="#10B981" name="Specialty Avg" />
                <Bar dataKey="national" fill="#6B7280" name="National Avg" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Review Analytics Dashboard
              </CardTitle>
              <CardDescription>
                Insights and trends for Dr. {doctorName}'s reviews
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <Refresh className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overview Cards */}
          {renderOverviewCards()}

          {/* View Mode Selector */}
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'overview' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('overview')}
            >
              Overview
            </Button>
            <Button
              variant={viewMode === 'trends' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('trends')}
            >
              Trends
            </Button>
            <Button
              variant={viewMode === 'comparison' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('comparison')}
            >
              Comparison
            </Button>
          </div>

          {/* Content based on view mode */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {viewMode === 'overview' && (
              <>
                {renderSentimentAnalysis()}
                {renderCategoryBreakdown()}
              </>
            )}
            
            {viewMode === 'trends' && (
              <>
                {renderRatingTrends()}
                {renderSentimentAnalysis()}
              </>
            )}
            
            {viewMode === 'comparison' && (
              <>
                {renderComparison()}
                {renderCategoryBreakdown()}
              </>
            )}
          </div>

          {/* Export Options */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="font-medium">Export Data</h4>
                  <p className="text-sm text-muted-foreground">
                    Download analytics reports and insights
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    PDF Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
