// Content Analytics & Performance Tracking System
// Sub-Phase 8.5: Content Management System

import { ContentAnalytics as IContentAnalytics } from '../types'

// Analytics interfaces
interface UserEngagement {
  userId?: string
  sessionId: string
  timestamp: Date
  contentId: string
  contentType: 'FAQ' | 'OVERVIEW' | 'BENEFITS' | 'GUIDE' | 'NEWS' | 'RESOURCES'
  action: 'view' | 'search' | 'download' | 'share' | 'comment' | 'vote' | 'complete_guide'
  duration?: number
  metadata?: {
    searchQuery?: string
    searchResults?: number
    language?: string
    device?: string
    location?: string
    referrer?: string
  }
}

interface ContentMetrics {
  contentId: string
  contentType: string
  date: Date
  views: number
  uniqueViews: number
  timeSpentTotal: number
  timeSpentAverage: number
  bounces: number
  exits: number
  completions: number
  interactions: number
  shares: number
  downloads: number
  searchesTriggered: number
  relatedContentClicked: number
  languageDistribution: Record<string, number>
  deviceDistribution: Record<string, number>
  geographicDistribution: Record<string, number>
}

interface PerformanceInsights {
  contentId: string
  engagementScore: number
  readabilityScore: number
  conversionRate: number
  trendDirection: 'up' | 'down' | 'stable'
  recommendations: string[]
  benchmarks: {
    avgViews: number
    avgEngagement: number
    avgTimeSpent: number
    avgCompletionRate: number
  }
}

interface ABMTestResult {
  testId: string
  contentId: string
  variantA: {
    content: any
    views: number
    conversions: number
    engagementScore: number
  }
  variantB: {
    content: any
    views: number
    conversions: number
    engagementScore: number
  }
  winner: 'A' | 'B' | 'inconclusive'
  confidence: number
  statisticalSignificance: boolean
}

// Main analytics engine
export class ContentAnalyticsEngine {
  private engagementData: UserEngagement[] = []
  private contentMetrics: Map<string, ContentMetrics[]> = new Map()
  private activeTests: Map<string, ABMTestResult> = new Map()
  
  // Track user engagement
  trackEngagement(engagement: Omit<UserEngagement, 'timestamp'>): void {
    const engagementRecord: UserEngagement = {
      ...engagement,
      timestamp: new Date()
    }
    
    this.engagementData.push(engagementRecord)
    this.updateContentMetrics(engagementRecord)
    
    // Log for real-time processing
    console.log('Engagement tracked:', engagementRecord)
  }

  // Get content performance metrics
  getContentPerformance(
    contentId: string,
    dateRange?: { start: Date; end: Date }
  ): ContentMetrics[] {
    let metrics = this.contentMetrics.get(contentId) || []
    
    if (dateRange) {
      metrics = metrics.filter(m => 
        m.date >= dateRange.start && m.date <= dateRange.end
      )
    }
    
    return metrics.sort((a, b) => a.date.getTime() - b.date.getTime())
  }

  // Generate performance insights
  generateInsights(contentId: string): PerformanceInsights {
    const metrics = this.getContentPerformance(contentId)
    
    if (metrics.length === 0) {
      return {
        contentId,
        engagementScore: 0,
        readabilityScore: 0,
        conversionRate: 0,
        trendDirection: 'stable',
        recommendations: ['No data available for analysis'],
        benchmarks: {
          avgViews: 0,
          avgEngagement: 0,
          avgTimeSpent: 0,
          avgCompletionRate: 0
        }
      }
    }

    const latestMetrics = metrics[metrics.length - 1]
    const previousMetrics = metrics.length > 1 ? metrics[metrics.length - 2] : null

    // Calculate engagement score
    const engagementScore = this.calculateEngagementScore(latestMetrics)
    
    // Calculate readability score (simplified)
    const readabilityScore = this.estimateReadabilityScore(contentId)
    
    // Calculate conversion rate
    const conversionRate = this.calculateConversionRate(latestMetrics)
    
    // Determine trend
    const trendDirection = this.calculateTrend(latestMetrics, previousMetrics)
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(latestMetrics, engagementScore)
    
    // Calculate benchmarks
    const benchmarks = this.calculateBenchmarks(contentId, metrics)

    return {
      contentId,
      engagementScore,
      readabilityScore,
      conversionRate,
      trendDirection,
      recommendations,
      benchmarks
    }
  }

  // A/B Testing for content optimization
  startABTest(
    testId: string,
    contentId: string,
    variantA: any,
    variantB: any
  ): ABMTestResult {
    const testResult: ABMTestResult = {
      testId,
      contentId,
      variantA: {
        content: variantA,
        views: 0,
        conversions: 0,
        engagementScore: 0
      },
      variantB: {
        content: variantB,
        views: 0,
        conversions: 0,
        engagementScore: 0
      },
      winner: 'inconclusive',
      confidence: 0,
      statisticalSignificance: false
    }

    this.activeTests.set(testId, testResult)
    return testResult
  }

  // Track A/B test engagement
  trackABTestEngagement(
    testId: string,
    variant: 'A' | 'B',
    engagement: UserEngagement
  ): void {
    const test = this.activeTests.get(testId)
    if (!test) return

    const targetVariant = variant === 'A' ? test.variantA : test.variantB
    targetVariant.views++
    
    // Track conversions (specific actions)
    if (['download', 'share', 'complete_guide'].includes(engagement.action)) {
      targetVariant.conversions++
    }
    
    // Update engagement score
    targetVariant.engagementScore = this.calculateVariantEngagement(targetVariant)
    
    // Check for statistical significance
    this.evaluateTestSignificance(test)
  }

  // Get analytics dashboard data
  getDashboardData(timeframe: 'day' | 'week' | 'month' | 'year' = 'week') {
    const endDate = new Date()
    const startDate = this.getStartDate(endDate, timeframe)
    
    const filteredEngagement = this.engagementData.filter(e => 
      e.timestamp >= startDate && e.timestamp <= endDate
    )

    return {
      summary: {
        totalViews: filteredEngagement.filter(e => e.action === 'view').length,
        uniqueUsers: new Set(filteredEngagement.filter(e => e.userId).map(e => e.userId)).size,
        totalTimeSpent: filteredEngagement.reduce((sum, e) => sum + (e.duration || 0), 0),
        averageSessionDuration: this.calculateAverageSessionDuration(filteredEngagement),
        topPerformingContent: this.getTopPerformingContent(filteredEngagement, 10),
        mostSearchedTerms: this.getMostSearchedTerms(filteredEngagement, 10),
        languageBreakdown: this.getLanguageBreakdown(filteredEngagement),
        deviceBreakdown: this.getDeviceBreakdown(filteredEngagement)
      },
      trends: {
        viewsOverTime: this.getViewsOverTime(filteredEngagement, timeframe),
        engagementOverTime: this.getEngagementOverTime(filteredEngagement, timeframe),
        popularCategories: this.getPopularCategories(filteredEngagement),
        peakUsageHours: this.getPeakUsageHours(filteredEngagement)
      },
      content: {
        totalContentItems: new Set(filteredEngagement.map(e => e.contentId)).size,
        avgViewsPerContent: this.calculateAverageViewsPerContent(filteredEngagement),
        avgEngagementRate: this.calculateAverageEngagementRate(filteredEngagement),
        topConverters: this.getTopConvertingContent(filteredEngagement, 10)
      }
    }
  }

  // Private helper methods
  private updateContentMetrics(engagement: UserEngagement): void {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const contentId = engagement.contentId
    const existingMetrics = this.contentMetrics.get(contentId) || []
    const todayMetrics = existingMetrics.find(m => m.date.getTime() === today.getTime())
    
    if (todayMetrics) {
      // Update existing metrics
      this.updateDailyMetrics(todayMetrics, engagement)
    } else {
      // Create new daily metrics
      const newMetrics: ContentMetrics = {
        contentId,
        contentType: engagement.contentType,
        date: today,
        views: 0,
        uniqueViews: 0,
        timeSpentTotal: 0,
        timeSpentAverage: 0,
        bounces: 0,
        exits: 0,
        completions: 0,
        interactions: 0,
        shares: 0,
        downloads: 0,
        searchesTriggered: 0,
        relatedContentClicked: 0,
        languageDistribution: {},
        deviceDistribution: {},
        geographicDistribution: {}
      }
      
      this.updateDailyMetrics(newMetrics, engagement)
      existingMetrics.push(newMetrics)
      this.contentMetrics.set(contentId, existingMetrics)
    }
  }

  private updateDailyMetrics(metrics: ContentMetrics, engagement: UserEngagement): void {
    if (engagement.action === 'view') {
      metrics.views++
      if (engagement.userId) {
        metrics.uniqueViews++
      }
      if (engagement.duration) {
        metrics.timeSpentTotal += engagement.duration
        metrics.timeSpentAverage = metrics.timeSpentTotal / metrics.views
      }
    }
    
    if (engagement.action === 'download') {
      metrics.downloads++
    }
    
    if (engagement.action === 'share') {
      metrics.shares++
    }
    
    if (engagement.action === 'complete_guide') {
      metrics.completions++
    }
    
    if (engagement.action === 'search') {
      metrics.searchesTriggered++
    }
    
    if (engagement.metadata?.language) {
      const lang = engagement.metadata.language
      metrics.languageDistribution[lang] = (metrics.languageDistribution[lang] || 0) + 1
    }
    
    if (engagement.metadata?.device) {
      const device = engagement.metadata.device
      metrics.deviceDistribution[device] = (metrics.deviceDistribution[device] || 0) + 1
    }
  }

  private calculateEngagementScore(metrics: ContentMetrics): number {
    const viewsWeight = 0.2
    const uniqueViewsWeight = 0.25
    const timeWeight = 0.25
    const interactionWeight = 0.15
    const completionWeight = 0.15
    
    // Normalize metrics to 0-100 scale
    const viewsScore = Math.min(metrics.views / 100 * 100, 100)
    const uniqueViewsScore = Math.min(metrics.uniqueViews / 50 * 100, 100)
    const timeScore = Math.min((metrics.timeSpentAverage / 300) * 100, 100) // 5 min = 100%
    const interactionScore = Math.min((metrics.interactions / metrics.views) * 100, 100)
    const completionScore = metrics.views > 0 ? (metrics.completions / metrics.views) * 100 : 0
    
    return (
      viewsScore * viewsWeight +
      uniqueViewsScore * uniqueViewsWeight +
      timeScore * timeWeight +
      interactionScore * interactionWeight +
      completionScore * completionWeight
    )
  }

  private estimateReadabilityScore(contentId: string): number {
    // This would typically analyze actual content
    // For now, return a placeholder based on content type
    const baseScore = {
      'FAQ': 85,
      'OVERVIEW': 80,
      'BENEFITS': 75,
      'GUIDE': 90,
      'NEWS': 70,
      'RESOURCES': 85
    }
    
    return baseScore[contentId.split('-')[0] as keyof typeof baseScore] || 75
  }

  private calculateConversionRate(metrics: ContentMetrics): number {
    const conversions = metrics.downloads + metrics.shares + metrics.completions
    return metrics.views > 0 ? (conversions / metrics.views) * 100 : 0
  }

  private calculateTrend(latest: ContentMetrics, previous: ContentMetrics | null): 'up' | 'down' | 'stable' {
    if (!previous) return 'stable'
    
    const latestScore = this.calculateEngagementScore(latest)
    const previousScore = this.calculateEngagementScore(previous)
    
    const changePercent = ((latestScore - previousScore) / previousScore) * 100
    
    if (changePercent > 5) return 'up'
    if (changePercent < -5) return 'down'
    return 'stable'
  }

  private generateRecommendations(metrics: ContentMetrics, engagementScore: number): string[] {
    const recommendations: string[] = []
    
    if (engagementScore < 40) {
      recommendations.push('Content engagement is low. Consider improving headline and visual elements.')
      recommendations.push('Review content length and readability for better user experience.')
    }
    
    if (metrics.timeSpentAverage < 60) {
      recommendations.push('Users spend less than a minute on content. Consider adding interactive elements.')
    }
    
    if (metrics.bounces / metrics.views > 0.6) {
      recommendations.push('High bounce rate detected. Review content relevance and loading speed.')
    }
    
    if (metrics.searchesTriggered > metrics.views * 0.3) {
      recommendations.push('Many users search within content. Consider improving navigation and organization.')
    }
    
    if (metrics.languageDistribution['zh'] > metrics.languageDistribution['en'] * 0.1) {
      recommendations.push('Significant Mandarin audience. Consider providing more bilingual content.')
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Content performance is good. Continue monitoring and optimizing.')
    }
    
    return recommendations
  }

  private calculateBenchmarks(contentId: string, metrics: ContentMetrics[]) {
    const avgViews = metrics.reduce((sum, m) => sum + m.views, 0) / metrics.length
    const avgEngagement = metrics.reduce((sum, m) => sum + this.calculateEngagementScore(m), 0) / metrics.length
    const avgTimeSpent = metrics.reduce((sum, m) => sum + m.timeSpentAverage, 0) / metrics.length
    const avgCompletionRate = metrics.reduce((sum, m) => sum + (m.completions / m.views), 0) / metrics.length * 100
    
    return {
      avgViews: Math.round(avgViews),
      avgEngagement: Math.round(avgEngagement),
      avgTimeSpent: Math.round(avgTimeSpent),
      avgCompletionRate: Math.round(avgCompletionRate)
    }
  }

  private calculateVariantEngagement(variant: ABMTestResult['variantA']): number {
    if (variant.views === 0) return 0
    return (variant.conversions / variant.views) * 100 + Math.min(variant.views / 100 * 50, 50)
  }

  private evaluateTestSignificance(test: ABMTestResult): void {
    const totalViews = test.variantA.views + test.variantB.views
    const totalConversions = test.variantA.conversions + test.variantB.conversions
    
    if (totalViews < 100 || totalConversions < 10) {
      test.winner = 'inconclusive'
      test.confidence = 0
      test.statisticalSignificance = false
      return
    }
    
    // Simple significance test (would use proper statistical methods in production)
    const conversionRateA = test.variantA.conversions / test.variantA.views
    const conversionRateB = test.variantB.conversions / test.variantB.views
    
    const difference = Math.abs(conversionRateA - conversionRateB)
    const threshold = 0.05 // 5% difference threshold
    
    if (difference > threshold) {
      test.winner = conversionRateA > conversionRateB ? 'A' : 'B'
      test.confidence = Math.min(difference * 1000, 95) // Simplified confidence calculation
      test.statisticalSignificance = test.confidence > 80
    } else {
      test.winner = 'inconclusive'
      test.confidence = 0
      test.statisticalSignificance = false
    }
  }

  private getStartDate(endDate: Date, timeframe: string): Date {
    const startDate = new Date(endDate)
    
    switch (timeframe) {
      case 'day':
        startDate.setDate(endDate.getDate() - 1)
        break
      case 'week':
        startDate.setDate(endDate.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1)
        break
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1)
        break
    }
    
    return startDate
  }

  private calculateAverageSessionDuration(engagementData: UserEngagement[]): number {
    const sessions = new Map<string, number>()
    
    engagementData.forEach(engagement => {
      const session = sessions.get(engagement.sessionId) || 0
      sessions.set(engagement.sessionId, session + (engagement.duration || 0))
    })
    
    const durations = Array.from(sessions.values())
    return durations.length > 0 ? durations.reduce((sum, d) => sum + d, 0) / durations.length : 0
  }

  private getTopPerformingContent(engagementData: UserEngagement[], limit: number) {
    const contentViews = new Map<string, number>()
    
    engagementData.forEach(engagement => {
      if (engagement.action === 'view') {
        const count = contentViews.get(engagement.contentId) || 0
        contentViews.set(engagement.contentId, count + 1)
      }
    })
    
    return Array.from(contentViews.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([contentId, views]) => ({ contentId, views }))
  }

  private getMostSearchedTerms(engagementData: UserEngagement[], limit: number) {
    const searchTerms = new Map<string, number>()
    
    engagementData.forEach(engagement => {
      if (engagement.action === 'search' && engagement.metadata?.searchQuery) {
        const count = searchTerms.get(engagement.metadata.searchQuery) || 0
        searchTerms.set(engagement.metadata.searchQuery, count + 1)
      }
    })
    
    return Array.from(searchTerms.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([query, count]) => ({ query, count }))
  }

  private getLanguageBreakdown(engagementData: UserEngagement[]) {
    const languageCounts = new Map<string, number>()
    
    engagementData.forEach(engagement => {
      if (engagement.metadata?.language) {
        const count = languageCounts.get(engagement.metadata.language) || 0
        languageCounts.set(engagement.metadata.language, count + 1)
      }
    })
    
    return Object.fromEntries(languageCounts)
  }

  private getDeviceBreakdown(engagementData: UserEngagement[]) {
    const deviceCounts = new Map<string, number>()
    
    engagementData.forEach(engagement => {
      if (engagement.metadata?.device) {
        const count = deviceCounts.get(engagement.metadata.device) || 0
        deviceCounts.set(engagement.metadata.device, count + 1)
      }
    })
    
    return Object.fromEntries(deviceCounts)
  }

  private getViewsOverTime(engagementData: UserEngagement[], timeframe: string) {
    const viewsByDay = new Map<string, number>()
    
    engagementData.forEach(engagement => {
      if (engagement.action === 'view') {
        const dateKey = engagement.timestamp.toISOString().split('T')[0]
        const count = viewsByDay.get(dateKey) || 0
        viewsByDay.set(dateKey, count + 1)
      }
    })
    
    return Array.from(viewsByDay.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, views]) => ({ date, views }))
  }

  private getEngagementOverTime(engagementData: UserEngagement[], timeframe: string) {
    // Similar to views over time but for engagement actions
    return this.getViewsOverTime(engagementData, timeframe) // Simplified
  }

  private getPopularCategories(engagementData: UserEngagement[]) {
    const categoryCounts = new Map<string, number>()
    
    engagementData.forEach(engagement => {
      const count = categoryCounts.get(engagement.contentType) || 0
      categoryCounts.set(engagement.contentType, count + 1)
    })
    
    return Array.from(categoryCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([category, count]) => ({ category, count }))
  }

  private getPeakUsageHours(engagementData: UserEngagement[]) {
    const hourCounts = new Map<number, number>()
    
    engagementData.forEach(engagement => {
      const hour = engagement.timestamp.getHours()
      const count = hourCounts.get(hour) || 0
      hourCounts.set(hour, count + 1)
    })
    
    return Array.from(hourCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 24)
      .map(([hour, count]) => ({ hour, count }))
  }

  private calculateAverageViewsPerContent(engagementData: UserEngagement[]): number {
    const uniqueContent = new Set(engagementData.map(e => e.contentId))
    const totalViews = engagementData.filter(e => e.action === 'view').length
    return uniqueContent.size > 0 ? totalViews / uniqueContent.size : 0
  }

  private calculateAverageEngagementRate(engagementData: UserEngagement[]): number {
    const totalViews = engagementData.filter(e => e.action === 'view').length
    const totalEngagements = engagementData.filter(e => 
      ['download', 'share', 'complete_guide'].includes(e.action)
    ).length
    return totalViews > 0 ? (totalEngagements / totalViews) * 100 : 0
  }

  private getTopConvertingContent(engagementData: UserEngagement[], limit: number) {
    const conversions = new Map<string, number>()
    
    engagementData.forEach(engagement => {
      if (['download', 'share', 'complete_guide'].includes(engagement.action)) {
        const count = conversions.get(engagement.contentId) || 0
        conversions.set(engagement.contentId, count + 1)
      }
    })
    
    return Array.from(conversions.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([contentId, conversions]) => ({ contentId, conversions }))
  }
}

// Export factory function
export const createAnalyticsEngine = () => new ContentAnalyticsEngine()

// Export types
export type { 
  UserEngagement, 
  ContentMetrics, 
  PerformanceInsights, 
  ABMTestResult 
}