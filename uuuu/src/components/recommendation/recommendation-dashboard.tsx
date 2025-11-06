"use client"

import React, { useState, useEffect } from "react"
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target, 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  Eye, 
  MousePointer, 
  Clock,
  DollarSign,
  MapPin,
  Heart,
  Award,
  Brain,
  Activity,
  Calendar,
  CheckCircle
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DoctorRecommendation, RecommendationType, RecommendationFeedback } from "./doctor-recommendation-engine"

// =============================================================================
// ANALYTICS AND METRICS TYPES
// =============================================================================

interface RecommendationMetrics {
  totalRecommendations: number
  clickThroughRate: number
  conversionRate: number
  satisfactionScore: number
  averageConfidenceScore: number
  diversityScore: number
  personalizationScore: number
  feedbackRate: number
  helpfulRate: number
  appointmentConversionRate: number
  rebookingRate: number
}

interface RecommendationAnalytics {
  overview: RecommendationMetrics
  trendsOverTime: TimeSeriesData[]
  specialtyPerformance: SpecialtyMetric[]
  feedbackBreakdown: FeedbackMetric[]
  algorithmPerformance: AlgorithmMetric[]
  userSegmentAnalysis: SegmentMetric[]
  geographicPerformance: GeographicMetric[]
}

interface TimeSeriesData {
  date: string
  recommendations: number
  clicks: number
  conversions: number
  satisfaction: number
}

interface SpecialtyMetric {
  specialty: string
  recommendationCount: number
  clickThroughRate: number
  conversionRate: number
  satisfactionScore: number
  averageConfidence: number
}

interface FeedbackMetric {
  feedbackType: "helpful" | "not-helpful" | "booked" | "viewed" | "dismissed"
  count: number
  percentage: number
  trend: number
}

interface AlgorithmMetric {
  algorithm: string
  accuracy: number
  precision: number
  recall: number
  f1Score: number
  usageCount: number
  improvement: number
}

interface SegmentMetric {
  segment: string
  userCount: number
  satisfactionScore: number
  conversionRate: number
  averageRecommendations: number
  topSpecialties: string[]
}

interface GeographicMetric {
  region: string
  recommendationCount: number
  satisfactionScore: number
  conversionRate: number
  popularSpecialties: string[]
}

interface ABTestConfig {
  id: string
  name: string
  description: string
  variants: ABTestVariant[]
  status: "draft" | "running" | "paused" | "completed"
  startDate?: Date
  endDate?: Date
  targetMetric: string
  significanceThreshold: number
  minimumSampleSize: number
}

interface ABTestVariant {
  id: string
  name: string
  description: string
  algorithm: string
  weights: Record<string, number>
  allocationPercentage: number
  results?: ABTestResults
}

interface ABTestResults {
  impressions: number
  clicks: number
  conversions: number
  satisfactionScore: number
  confidenceScore: number
  significance: number
  winner?: boolean
}

// =============================================================================
// DUMMY DATA FOR DEMONSTRATION
// =============================================================================

const generateDummyAnalytics = (): RecommendationAnalytics => ({
  overview: {
    totalRecommendations: 15240,
    clickThroughRate: 18.5,
    conversionRate: 12.3,
    satisfactionScore: 4.2,
    averageConfidenceScore: 78.4,
    diversityScore: 85.2,
    personalizationScore: 82.1,
    feedbackRate: 34.7,
    helpfulRate: 76.8,
    appointmentConversionRate: 8.9,
    rebookingRate: 23.4
  },
  trendsOverTime: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    recommendations: Math.floor(Math.random() * 200) + 300,
    clicks: Math.floor(Math.random() * 50) + 80,
    conversions: Math.floor(Math.random() * 20) + 30,
    satisfaction: 3.8 + Math.random() * 0.8
  })),
  specialtyPerformance: [
    { specialty: "General Practice", recommendationCount: 3240, clickThroughRate: 21.2, conversionRate: 14.8, satisfactionScore: 4.1, averageConfidence: 82.3 },
    { specialty: "Cardiology", recommendationCount: 1180, clickThroughRate: 19.5, conversionRate: 11.2, satisfactionScore: 4.3, averageConfidence: 85.7 },
    { specialty: "Dermatology", recommendationCount: 980, clickThroughRate: 22.1, conversionRate: 15.6, satisfactionScore: 4.2, averageConfidence: 79.8 },
    { specialty: "Pediatrics", recommendationCount: 860, clickThroughRate: 16.8, conversionRate: 9.3, satisfactionScore: 4.4, averageConfidence: 88.1 },
    { specialty: "Psychiatry", recommendationCount: 720, clickThroughRate: 15.2, conversionRate: 8.7, satisfactionScore: 4.0, averageConfidence: 75.9 }
  ],
  feedbackBreakdown: [
    { feedbackType: "helpful", count: 4280, percentage: 76.8, trend: 5.2 },
    { feedbackType: "not-helpful", count: 980, percentage: 17.6, trend: -2.1 },
    { feedbackType: "booked", count: 1320, percentage: 23.7, trend: 3.4 },
    { feedbackType: "viewed", count: 2890, percentage: 51.8, trend: 1.8 },
    { feedbackType: "dismissed", count: 670, percentage: 12.0, trend: -1.5 }
  ],
  algorithmPerformance: [
    { algorithm: "Collaborative Filtering", accuracy: 78.5, precision: 82.1, recall: 75.3, f1Score: 78.6, usageCount: 8420, improvement: 12.3 },
    { algorithm: "Content-Based", accuracy: 72.8, precision: 79.2, recall: 67.1, f1Score: 72.7, usageCount: 5680, improvement: 8.7 },
    { algorithm: "Hybrid", accuracy: 81.2, precision: 84.5, recall: 78.4, f1Score: 81.3, usageCount: 1140, improvement: 15.6 },
    { algorithm: "Deep Learning", accuracy: 85.7, precision: 88.3, recall: 83.1, f1Score: 85.6, usageCount: 0, improvement: 0 }
  ],
  userSegmentAnalysis: [
    { segment: "Young Adults (18-30)", userCount: 2340, satisfactionScore: 4.1, conversionRate: 14.2, averageRecommendations: 6.8, topSpecialties: ["General Practice", "Dermatology", "Mental Health"] },
    { segment: "Families (31-50)", userCount: 4120, satisfactionScore: 4.3, conversionRate: 16.8, averageRecommendations: 8.2, topSpecialties: ["Pediatrics", "General Practice", "Cardiology"] },
    { segment: "Seniors (51+)", userCount: 1870, satisfactionScore: 4.0, conversionRate: 9.1, averageRecommendations: 7.4, topSpecialties: ["Cardiology", "General Practice", "Endocrinology"] },
    { segment: "Expatriates", userCount: 980, satisfactionScore: 3.9, conversionRate: 11.5, averageRecommendations: 5.9, topSpecialties: ["General Practice", "Internal Medicine", "Dermatology"] }
  ],
  geographicPerformance: [
    { region: "Central Singapore", recommendationCount: 5680, satisfactionScore: 4.2, conversionRate: 13.1, popularSpecialties: ["General Practice", "Specialists"] },
    { region: "East Singapore", recommendationCount: 3420, satisfactionScore: 4.3, conversionRate: 14.8, popularSpecialties: ["General Practice", "Pediatrics"] },
    { region: "West Singapore", recommendationCount: 2890, satisfactionScore: 4.1, conversionRate: 11.9, popularSpecialties: ["General Practice", "Family Medicine"] },
    { region: "North Singapore", recommendationCount: 1980, satisfactionScore: 4.4, conversionRate: 15.2, popularSpecialties: ["General Practice", "Specialists"] },
    { region: "North-East Singapore", recommendationCount: 1270, satisfactionScore: 4.0, conversionRate: 10.7, popularSpecialties: ["General Practice"] }
  ]
})

const dummyABTests: ABTestConfig[] = [
  {
    id: "test-1",
    name: "Algorithm Weight Optimization",
    description: "Testing different weight combinations for matching factors",
    variants: [
      {
        id: "control",
        name: "Current Algorithm",
        description: "Baseline algorithm with current weights",
        algorithm: "Hybrid v1.2",
        weights: { conditionMatch: 0.25, specialtyMatch: 0.20, location: 0.15, language: 0.10 },
        allocationPercentage: 50,
        results: {
          impressions: 12840,
          clicks: 2378,
          conversions: 294,
          satisfactionScore: 4.18,
          confidenceScore: 78.2,
          significance: 0.0
        }
      },
      {
        id: "variant-a",
        name: "Increased Location Weight",
        description: "Prioritizing location-based matching",
        algorithm: "Hybrid v1.2",
        weights: { conditionMatch: 0.20, specialtyMatch: 0.20, location: 0.25, language: 0.10 },
        allocationPercentage: 50,
        results: {
          impressions: 12920,
          clicks: 2521,
          conversions: 341,
          satisfactionScore: 4.25,
          confidenceScore: 79.1,
          significance: 85.2,
          winner: true
        }
      }
    ],
    status: "completed",
    startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
    targetMetric: "conversion_rate",
    significanceThreshold: 95,
    minimumSampleSize: 1000
  },
  {
    id: "test-2",
    name: "Confidence Score Display",
    description: "Testing impact of showing confidence scores to users",
    variants: [
      {
        id: "control",
        name: "No Confidence Score",
        description: "Recommendations without confidence display",
        algorithm: "Current",
        weights: {},
        allocationPercentage: 50,
        results: {
          impressions: 8960,
          clicks: 1534,
          conversions: 178,
          satisfactionScore: 4.12,
          confidenceScore: 0,
          significance: 0.0
        }
      },
      {
        id: "variant-b",
        name: "With Confidence Score",
        description: "Recommendations with confidence score display",
        algorithm: "Current",
        weights: {},
        allocationPercentage: 50,
        results: {
          impressions: 8940,
          clicks: 1698,
          conversions: 201,
          satisfactionScore: 4.28,
          confidenceScore: 78.5,
          significance: 92.8,
          winner: true
        }
      }
    ],
    status: "running",
    startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    targetMetric: "satisfaction_score",
    significanceThreshold: 90,
    minimumSampleSize: 800
  }
]

// =============================================================================
// MAIN DASHBOARD COMPONENT
// =============================================================================

interface RecommendationDashboardProps {
  analytics?: RecommendationAnalytics
  abTests?: ABTestConfig[]
  onCreateABTest?: (test: Omit<ABTestConfig, "id" | "status">) => void
  onUpdateABTest?: (testId: string, updates: Partial<ABTestConfig>) => void
}

export function RecommendationDashboard({
  analytics = generateDummyAnalytics(),
  abTests = dummyABTests,
  onCreateABTest,
  onUpdateABTest
}: RecommendationDashboardProps) {
  const [timeRange, setTimeRange] = useState("30d")
  const [selectedMetric, setSelectedMetric] = useState("clickThroughRate")
  const [activeTab, setActiveTab] = useState<"overview" | "performance" | "feedback" | "abtests" | "geography">("overview")

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`
  const formatNumber = (value: number) => value.toLocaleString()

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case "clickThroughRate": return <MousePointer className="h-4 w-4" />
      case "conversionRate": return <Target className="h-4 w-4" />
      case "satisfactionScore": return <Star className="h-4 w-4" />
      case "feedbackRate": return <ThumbsUp className="h-4 w-4" />
      default: return <BarChart3 className="h-4 w-4" />
    }
  }

  const getMetricColor = (value: number, target: number = 20) => {
    if (value >= target) return "text-green-600"
    if (value >= target * 0.8) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Recommendation Analytics Dashboard</h2>
            <p className="text-muted-foreground">
              Performance metrics and optimization insights for doctor recommendations
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
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
          
          <Button onClick={() => {/* Refresh analytics */}}>
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="abtests">A/B Tests</TabsTrigger>
          <TabsTrigger value="geography">Geography</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Click-Through Rate"
              value={analytics.overview.clickThroughRate}
              target={20}
              unit="%"
              icon={<MousePointer className="h-5 w-5" />}
              color={getMetricColor(analytics.overview.clickThroughRate, 20)}
            />
            
            <MetricCard
              title="Conversion Rate"
              value={analytics.overview.conversionRate}
              target={15}
              unit="%"
              icon={<Target className="h-5 w-5" />}
              color={getMetricColor(analytics.overview.conversionRate, 15)}
            />
            
            <MetricCard
              title="Satisfaction Score"
              value={analytics.overview.satisfactionScore}
              target={4.0}
              unit="/5"
              icon={<Star className="h-5 w-5" />}
              color={getMetricColor(analytics.overview.satisfactionScore * 20, 80)}
              decimals={1}
            />
            
            <MetricCard
              title="Avg Confidence"
              value={analytics.overview.averageConfidenceScore}
              target={80}
              unit="%"
              icon={<Brain className="h-5 w-5" />}
              color={getMetricColor(analytics.overview.averageConfidenceScore, 80)}
            />
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <MetricCard
              title="Personalization Score"
              value={analytics.overview.personalizationScore}
              target={85}
              unit="%"
              icon={<Users className="h-5 w-5" />}
              color={getMetricColor(analytics.overview.personalizationScore, 85)}
              compact
            />
            
            <MetricCard
              title="Diversity Score"
              value={analytics.overview.diversityScore}
              target={80}
              unit="%"
              icon={<Activity className="h-5 w-5" />}
              color={getMetricColor(analytics.overview.diversityScore, 80)}
              compact
            />
            
            <MetricCard
              title="Feedback Rate"
              value={analytics.overview.feedbackRate}
              target={30}
              unit="%"
              icon={<ThumbsUp className="h-5 w-5" />}
              color={getMetricColor(analytics.overview.feedbackRate, 30)}
              compact
            />
          </div>

          {/* Trends Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                  <p>Interactive chart would be rendered here</p>
                  <p className="text-sm">Showing {timeRange} trends over time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Algorithm Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.algorithmPerformance.map((algorithm, index) => (
                  <AlgorithmPerformanceRow key={index} algorithm={algorithm} />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Specialty Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.specialtyPerformance.map((specialty, index) => (
                  <SpecialtyPerformanceRow key={index} specialty={specialty} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feedback Tab */}
        <TabsContent value="feedback" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Feedback Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Feedback Breakdown</h4>
                  {analytics.feedbackBreakdown.map((feedback, index) => (
                    <FeedbackMetricRow key={index} feedback={feedback} />
                  ))}
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold">User Segment Performance</h4>
                  {analytics.userSegmentAnalysis.map((segment, index) => (
                    <SegmentPerformanceRow key={index} segment={segment} />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* A/B Tests Tab */}
        <TabsContent value="abtests" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">A/B Testing Framework</h3>
            <Button onClick={() => {/* Open create test dialog */}}>
              Create New Test
            </Button>
          </div>
          
          <div className="space-y-4">
            {abTests.map((test) => (
              <ABTestCard key={test.id} test={test} onUpdate={onUpdateABTest} />
            ))}
          </div>
        </TabsContent>

        {/* Geography Tab */}
        <TabsContent value="geography" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Geographic Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.geographicPerformance.map((region, index) => (
                  <GeographicPerformanceRow key={index} region={region} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

interface MetricCardProps {
  title: string
  value: number
  target?: number
  unit: string
  icon: React.ReactNode
  color: string
  compact?: boolean
  decimals?: number
}

function MetricCard({ title, value, target, unit, icon, color, compact = false, decimals = 0 }: MetricCardProps) {
  const displayValue = decimals > 0 ? value.toFixed(decimals) : value.toFixed(decimals)
  
  return (
    <Card>
      <CardContent className={cn("p-6", compact && "p-4")}>
        <div className="flex items-center justify-between">
          <div className={cn("p-2 rounded-lg bg-muted", !compact && "p-3")}>
            <div className={cn(color)}>
              {icon}
            </div>
          </div>
          {target && (
            <Badge variant="outline" className="text-xs">
              Target: {decimals > 0 ? target.toFixed(decimals) : target}{unit}
            </Badge>
          )}
        </div>
        
        <div className="mt-4">
          <div className={cn("text-2xl font-bold", color)}>
            {displayValue}{unit}
          </div>
          <p className="text-sm text-muted-foreground">{title}</p>
          
          {target && (
            <Progress 
              value={Math.min(100, (value / target) * 100)} 
              className="mt-2 h-2"
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function AlgorithmPerformanceRow({ algorithm }: { algorithm: AlgorithmMetric }) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex-1">
        <h4 className="font-semibold">{algorithm.algorithm}</h4>
        <p className="text-sm text-muted-foreground">
          Used {algorithm.usageCount.toLocaleString()} times
        </p>
      </div>
      
      <div className="flex items-center space-x-6 text-sm">
        <div className="text-center">
          <div className="font-semibold">{algorithm.accuracy.toFixed(1)}%</div>
          <div className="text-muted-foreground">Accuracy</div>
        </div>
        
        <div className="text-center">
          <div className="font-semibold">{algorithm.f1Score.toFixed(1)}%</div>
          <div className="text-muted-foreground">F1 Score</div>
        </div>
        
        <div className={cn(
          "text-center",
          algorithm.improvement >= 0 ? "text-green-600" : "text-red-600"
        )}>
          <div className="font-semibold flex items-center gap-1">
            {algorithm.improvement >= 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingUp className="h-3 w-3 rotate-180" />
            )}
            {Math.abs(algorithm.improvement).toFixed(1)}%
          </div>
          <div className="text-muted-foreground">vs Baseline</div>
        </div>
      </div>
    </div>
  )
}

function SpecialtyPerformanceRow({ specialty }: { specialty: SpecialtyMetric }) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex-1">
        <h4 className="font-semibold">{specialty.specialty}</h4>
        <p className="text-sm text-muted-foreground">
          {specialty.recommendationCount.toLocaleString()} recommendations
        </p>
      </div>
      
      <div className="flex items-center space-x-4 text-sm">
        <div className="text-center">
          <div className="font-semibold">{specialty.clickThroughRate.toFixed(1)}%</div>
          <div className="text-muted-foreground">CTR</div>
        </div>
        
        <div className="text-center">
          <div className="font-semibold">{specialty.conversionRate.toFixed(1)}%</div>
          <div className="text-muted-foreground">Conv.</div>
        </div>
        
        <div className="text-center">
          <div className="font-semibold">{specialty.satisfactionScore.toFixed(1)}/5</div>
          <div className="text-muted-foreground">Rating</div>
        </div>
        
        <div className="text-center">
          <div className="font-semibold">{specialty.averageConfidence.toFixed(0)}%</div>
          <div className="text-muted-foreground">Conf.</div>
        </div>
      </div>
    </div>
  )
}

function FeedbackMetricRow({ feedback }: { feedback: FeedbackMetric }) {
  const getIcon = (type: string) => {
    switch (type) {
      case "helpful": return <ThumbsUp className="h-4 w-4 text-green-600" />
      case "not-helpful": return <ThumbsDown className="h-4 w-4 text-red-600" />
      case "booked": return <Calendar className="h-4 w-4 text-blue-600" />
      case "viewed": return <Eye className="h-4 w-4 text-gray-600" />
      case "dismissed": return <ThumbsDown className="h-4 w-4 text-orange-600" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  return (
    <div className="flex items-center justify-between p-3 border rounded">
      <div className="flex items-center gap-3">
        {getIcon(feedback.feedbackType)}
        <span className="font-medium capitalize">{feedback.feedbackType.replace('-', ' ')}</span>
      </div>
      
      <div className="flex items-center gap-4">
        <span className="text-sm font-semibold">{feedback.count.toLocaleString()}</span>
        <span className="text-sm text-muted-foreground">{feedback.percentage.toFixed(1)}%</span>
        <div className={cn(
          "text-xs flex items-center gap-1",
          feedback.trend >= 0 ? "text-green-600" : "text-red-600"
        )}>
          {feedback.trend >= 0 ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingUp className="h-3 w-3 rotate-180" />
          )}
          {Math.abs(feedback.trend).toFixed(1)}%
        </div>
      </div>
    </div>
  )
}

function SegmentPerformanceRow({ segment }: { segment: SegmentMetric }) {
  return (
    <div className="p-3 border rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold">{segment.segment}</h4>
        <Badge variant="outline">{segment.userCount.toLocaleString()} users</Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Satisfaction:</span>
          <span className="ml-2 font-semibold">{segment.satisfactionScore.toFixed(1)}/5</span>
        </div>
        <div>
          <span className="text-muted-foreground">Conversion:</span>
          <span className="ml-2 font-semibold">{segment.conversionRate.toFixed(1)}%</span>
        </div>
      </div>
      
      <div className="mt-2">
        <div className="text-xs text-muted-foreground mb-1">Top specialties:</div>
        <div className="flex gap-1">
          {segment.topSpecialties.slice(0, 3).map((specialty, idx) => (
            <Badge key={idx} variant="outline" className="text-xs">
              {specialty}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}

function ABTestCard({ test, onUpdate }: { test: ABTestConfig; onUpdate?: (id: string, updates: Partial<ABTestConfig>) => void }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "running": return "bg-blue-100 text-blue-800"
      case "completed": return "bg-green-100 text-green-800"
      case "paused": return "bg-yellow-100 text-yellow-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const runningTest = test.variants.find(v => v.results)
  const hasWinner = test.variants.some(v => v.results?.winner)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{test.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{test.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={getStatusColor(test.status)}>
              {test.status}
            </Badge>
            {test.status === "running" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpdate?.(test.id, { status: "paused" })}
              >
                Pause
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {test.variants.map((variant) => (
              <div
                key={variant.id}
                className={cn(
                  "p-4 border rounded-lg",
                  variant.results?.winner && "bg-green-50 border-green-200"
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">{variant.name}</h4>
                  <div className="flex items-center gap-2">
                    {variant.results?.winner && (
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        <Award className="h-3 w-3 mr-1" />
                        Winner
                      </Badge>
                    )}
                    <Badge variant="outline">{variant.allocationPercentage}%</Badge>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">{variant.description}</p>
                
                {variant.results && (
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Impressions:</span>
                      <span className="ml-2 font-semibold">{variant.results.impressions.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Clicks:</span>
                      <span className="ml-2 font-semibold">{variant.results.clicks.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Conversions:</span>
                      <span className="ml-2 font-semibold">{variant.results.conversions}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Satisfaction:</span>
                      <span className="ml-2 font-semibold">{variant.results.satisfactionScore.toFixed(1)}/5</span>
                    </div>
                  </div>
                )}
                
                {variant.results?.significance && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Statistical Significance</span>
                      <div className="flex items-center gap-2">
                        <Progress value={variant.results.significance} className="w-20 h-2" />
                        <span className="text-sm font-semibold">
                          {variant.results.significance.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {test.status === "completed" && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Test completed on {test.endDate?.toLocaleDateString()}. 
                {hasWinner ? "A winning variant has been identified." : "No significant difference found."}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function GeographicPerformanceRow({ region }: { region: GeographicMetric }) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <MapPin className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h4 className="font-semibold">{region.region}</h4>
          <p className="text-sm text-muted-foreground">
            {region.recommendationCount.toLocaleString()} recommendations
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-6 text-sm">
        <div className="text-center">
          <div className="font-semibold">{region.satisfactionScore.toFixed(1)}/5</div>
          <div className="text-muted-foreground">Satisfaction</div>
        </div>
        
        <div className="text-center">
          <div className="font-semibold">{region.conversionRate.toFixed(1)}%</div>
          <div className="text-muted-foreground">Conversion</div>
        </div>
        
        <div className="flex gap-1">
          {region.popularSpecialties.slice(0, 2).map((specialty, idx) => (
            <Badge key={idx} variant="outline" className="text-xs">
              {specialty}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}

export type {
  RecommendationAnalytics,
  RecommendationMetrics,
  ABTestConfig,
  ABTestVariant,
  ABTestResults,
  TimeSeriesData,
  SpecialtyMetric,
  FeedbackMetric,
  AlgorithmMetric,
  SegmentMetric,
  GeographicMetric
}