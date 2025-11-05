/**
 * SEO Analytics & Monitoring Service for My Family Clinic
 * Comprehensive SEO performance tracking and analytics for Singapore healthcare platform
 */

import {
  SEOAnalytics,
  SearchPerformanceMetrics,
  KeywordRanking,
  TechnicalSEOCheck,
  LocalSEOPerformance,
  HealthcareSEOPerformance,
  SEOScore
} from '../types/seo.types'
import { SEO_CONFIG, SEO_PERFORMANCE_TARGETS } from '../config/seo.config'
import { SEOMonitoringService } from '../services/seo-services'

// =============================================================================
// SEO PERFORMANCE TRACKER
// =============================================================================

export class SEOPerformanceTracker {
  private static instance: SEOPerformanceTracker
  private performanceData: SearchPerformanceMetrics
  private keywordRankings: Map<string, KeywordRanking> = new Map()
  private alerts: Alert[] = []

  constructor() {
    this.performanceData = this.initializePerformanceData()
  }

  static getInstance(): SEOPerformanceTracker {
    if (!SEOPerformanceTracker.instance) {
      SEOPerformanceTracker.instance = new SEOPerformanceTracker()
    }
    return SEOPerformanceTracker.instance
  }

  private initializePerformanceData(): SearchPerformanceMetrics {
    return {
      queries: {
        total: 0,
        successful: 0,
        failed: 0,
        averageResponseTime: 0
      },
      indexing: {
        pagesIndexed: 0,
        indexErrors: 0,
        lastIndexingRun: new Date(),
        indexingRate: 0
      },
      rankings: {
        totalKeywords: 0,
        averagePosition: 0,
        topTenKeywords: 0,
        improvedKeywords: 0,
        declinedKeywords: 0
      },
      technicalHealth: {
        crawlErrors: 0,
        pageSpeedIssues: 0,
        mobileUsabilityErrors: 0,
        securityIssues: 0
      }
    }
  }

  async updateKeywordRanking(keyword: string, ranking: KeywordRanking): Promise<void> {
    const existingRanking = this.keywordRankings.get(keyword)
    this.keywordRankings.set(keyword, ranking)

    // Track changes
    if (existingRanking) {
      if (ranking.position < existingRanking.position) {
        this.performanceData.rankings.improvedKeywords++
        this.addAlert('keyword_improvement', `Keyword "${keyword}" improved from position ${existingRanking.position} to ${ranking.position}`)
      } else if (ranking.position > existingRanking.position) {
        this.performanceData.rankings.declinedKeywords++
        this.addAlert('keyword_decline', `Keyword "${keyword}" declined from position ${existingRanking.position} to ${ranking.position}`)
      }
    }

    this.performanceData.rankings.totalKeywords = this.keywordRankings.size
  }

  async getTopPerformingKeywords(limit: number = 10): Promise<KeywordRanking[]> {
    return Array.from(this.keywordRankings.values())
      .sort((a, b) => a.position - b.position)
      .slice(0, limit)
  }

  async getWorstPerformingKeywords(limit: number = 10): Promise<KeywordRanking[]> {
    return Array.from(this.keywordRankings.values())
      .sort((a, b) => b.position - a.position)
      .slice(0, limit)
  }

  async getKeywordOpportunities(): Promise<KeywordRanking[]> {
    // Keywords with positions 4-20 that have potential for improvement
    return Array.from(this.keywordRankings.values())
      .filter(ranking => ranking.position >= 4 && ranking.position <= 20)
      .sort((a, b) => b.searchVolume - a.searchVolume)
  }

  private addAlert(type: string, message: string): void {
    const alert: Alert = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date(),
      severity: this.getAlertSeverity(type)
    }
    
    this.alerts.push(alert)
    
    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100)
    }
  }

  private getAlertSeverity(type: string): 'low' | 'medium' | 'high' {
    switch (type) {
      case 'keyword_improvement':
        return 'low'
      case 'keyword_decline':
        return 'medium'
      case 'technical_error':
        return 'high'
      default:
        return 'medium'
    }
  }

  getRecentAlerts(limit: number = 10): Alert[] {
    return this.alerts
      .slice(-limit)
      .reverse()
  }

  async getPerformanceMetrics(): Promise<SearchPerformanceMetrics> {
    // Update metrics based on current state
    this.updatePerformanceMetrics()
    return this.performanceData
  }

  private updatePerformanceMetrics(): void {
    this.performanceData.rankings.averagePosition = this.calculateAveragePosition()
    this.performanceData.rankings.topTenKeywords = this.getTopTenKeywordsCount()
  }

  private calculateAveragePosition(): number {
    if (this.keywordRankings.size === 0) return 0
    
    const totalPosition = Array.from(this.keywordRankings.values())
      .reduce((sum, ranking) => sum + ranking.position, 0)
    
    return Math.round((totalPosition / this.keywordRankings.size) * 10) / 10
  }

  private getTopTenKeywordsCount(): number {
    return Array.from(this.keywordRankings.values())
      .filter(ranking => ranking.position <= 10).length
  }
}

// =============================================================================
// HEALTHCARE SEO ANALYTICS
// =============================================================================

export class HealthcareSEOAnalytics {
  static async analyzeMedicalContentSEO(content: {
    title: string
    description: string
    body: string
    medicalTerms?: string[]
    conditions?: string[]
    services?: string[]
  }): Promise<{
    score: number
    recommendations: string[]
    medicalCompliance: {
      hasDisclaimers: boolean
      hasEmergencyInfo: boolean
      hasProfessionalLanguage: boolean
      complianceScore: number
    }
    keywordOptimization: {
      primaryKeyword: string
      keywordDensity: number
      medicalKeywordsUsed: string[]
      missingOpportunities: string[]
    }
  }> {
    const recommendations: string[] = []
    let score = 0
    let maxScore = 100

    // Content length check (15 points)
    const wordCount = content.body.split(/\s+/).length
    if (wordCount >= 300) {
      score += 15
    } else {
      recommendations.push(`Increase content length (current: ${wordCount} words, recommended: 300+)`)
    }

    // Medical keyword usage (20 points)
    const medicalKeywordsUsed = this.extractMedicalKeywords(content.body)
    const expectedMedicalKeywords = content.medicalTerms || []
    const keywordCoverage = expectedMedicalKeywords.filter(keyword =>
      medicalKeywordsUsed.some(used => used.toLowerCase().includes(keyword.toLowerCase()))
    ).length

    if (keywordCoverage >= expectedMedicalKeywords.length * 0.7) {
      score += 20
    } else {
      recommendations.push('Include more medical-specific keywords')
    }

    // Medical disclaimers (15 points)
    const hasDisclaimers = this.checkMedicalDisclaimers(content.body)
    const hasEmergencyInfo = this.checkEmergencyInfo(content.body)
    
    if (hasDisclaimers) {
      score += 10
    } else {
      recommendations.push('Add medical disclaimer for compliance')
    }

    if (hasEmergencyInfo) {
      score += 5
    } else {
      recommendations.push('Include emergency contact information where appropriate')
    }

    // Professional language (15 points)
    if (this.checkProfessionalLanguage(content.body)) {
      score += 15
    } else {
      recommendations.push('Use more professional medical language')
    }

    // Title optimization (10 points)
    if (this.isOptimizedTitle(content.title)) {
      score += 10
    } else {
      recommendations.push('Optimize title for medical keywords and user intent')
    }

    // Description optimization (10 points)
    if (this.isOptimizedDescription(content.description)) {
      score += 10
    } else {
      recommendations.push('Optimize meta description for medical services')
    }

    // Healthcare-specific formatting (15 points)
    if (this.checkHealthcareFormatting(content.body)) {
      score += 15
    } else {
      recommendations.push('Add healthcare-specific formatting (headings, lists, etc.)')
    }

    const complianceScore = this.calculateComplianceScore(hasDisclaimers, hasEmergencyInfo)

    return {
      score: Math.round((score / maxScore) * 100),
      recommendations,
      medicalCompliance: {
        hasDisclaimers,
        hasEmergencyInfo,
        hasProfessionalLanguage: this.checkProfessionalLanguage(content.body),
        complianceScore
      },
      keywordOptimization: {
        primaryKeyword: this.extractPrimaryKeyword(content.title),
        keywordDensity: this.calculateKeywordDensity(content.body, content.title),
        medicalKeywordsUsed,
        missingOpportunities: expectedMedicalKeywords.filter(keyword =>
          !medicalKeywordsUsed.some(used => used.toLowerCase().includes(keyword.toLowerCase()))
        )
      }
    }
  }

  private extractMedicalKeywords(text: string): string[] {
    const medicalTerms = [
      'diagnosis', 'treatment', 'consultation', 'examination', 'therapy',
      'medication', 'prescription', 'screening', 'prevention', 'chronic',
      'acute', 'symptoms', 'condition', 'disorder', 'syndrome',
      'cardiology', 'dermatology', 'endocrinology', 'neurology', 'oncology'
    ]

    return medicalTerms.filter(term =>
      text.toLowerCase().includes(term.toLowerCase())
    )
  }

  private checkMedicalDisclaimers(text: string): boolean {
    const disclaimerTerms = [
      'medical advice', 'consult your doctor', 'seek professional',
      'not a substitute', 'medical consultation', 'professional medical'
    ]

    return disclaimerTerms.some(term =>
      text.toLowerCase().includes(term.toLowerCase())
    )
  }

  private checkEmergencyInfo(text: string): boolean {
    const emergencyTerms = ['emergency', 'urgent', '995', 'call immediately']
    
    return emergencyTerms.some(term =>
      text.toLowerCase().includes(term.toLowerCase())
    )
  }

  private checkProfessionalLanguage(text: string): boolean {
    const professionalTerms = [
      'patient', 'physician', 'specialist', 'diagnosis', 'treatment plan',
      'medical history', 'clinical', 'therapeutic', 'pharmaceutical'
    ]

    return professionalTerms.filter(term =>
      text.toLowerCase().includes(term.toLowerCase())
    ).length >= 3
  }

  private isOptimizedTitle(title: string): boolean {
    return title.length >= 30 && title.length <= 60 &&
           /[A-Za-z]/.test(title) &&
           /doctor|specialist|clinic|healthcare|medical/i.test(title)
  }

  private isOptimizedDescription(description: string): boolean {
    return description.length >= 120 && description.length <= 160
  }

  private checkHealthcareFormatting(text: string): boolean {
    const hasHeadings = /^#{1,3}\s|^\*\*.*\*\*$/m.test(text)
    const hasLists = /^[\-\*]\s|^[\d]+\.\s/m.test(text)
    const hasStructure = hasHeadings || hasLists

    return hasStructure
  }

  private extractPrimaryKeyword(title: string): string {
    const words = title.toLowerCase().split(' ')
    const priorityWords = ['doctor', 'clinic', 'healthcare', 'medical', 'singapore']
    
    const priorityMatch = words.find(word =>
      priorityWords.some(priority => word.includes(priority))
    )
    
    return priorityMatch || words.find(word => word.length > 3) || words[0] || ''
  }

  private calculateKeywordDensity(text: string, keyword: string): number {
    const cleanText = text.toLowerCase()
    const keywordLower = keyword.toLowerCase()
    const wordCount = cleanText.split(/\s+/).length
    const keywordCount = (cleanText.match(new RegExp(keywordLower, 'g')) || []).length
    
    return wordCount > 0 ? Math.round((keywordCount / wordCount) * 1000) / 10 : 0
  }

  private calculateComplianceScore(hasDisclaimers: boolean, hasEmergencyInfo: boolean): number {
    let score = 0
    
    if (hasDisclaimers) score += 60
    if (hasEmergencyInfo) score += 40
    
    return score
  }
}

// =============================================================================
// LOCAL SEO ANALYTICS
// =============================================================================

export class LocalSEOAnalytics {
  static async analyzeLocalSEOPerformance(
    clinicData: any[],
    competitorData?: any[]
  ): Promise<{
    score: number
    localPackVisibility: number
    citations: CitationAnalysis
    reviews: ReviewAnalysis
    rankings: LocalKeywordRanking[]
    recommendations: string[]
  }> {
    const recommendations: string[] = []
    let score = 0

    // Analyze local pack visibility (25 points)
    const localPackVisibility = await this.calculateLocalPackVisibility(clinicData)
    if (localPackVisibility >= 80) {
      score += 25
    } else if (localPackVisibility >= 60) {
      score += 20
      recommendations.push('Improve local pack visibility through better Google My Business optimization')
    } else {
      score += 10
      recommendations.push('Significant improvement needed in local pack visibility')
    }

    // Analyze citations (20 points)
    const citations = await this.analyzeCitations(clinicData)
    if (citations.consistent > 20) {
      score += 20
    } else {
      score += citations.consistent * 0.8
      recommendations.push('Increase local citations for better local SEO')
    }

    // Analyze reviews (25 points)
    const reviews = await this.analyzeReviews(clinicData)
    if (reviews.avgRating >= 4.5 && reviews.totalCount >= 50) {
      score += 25
    } else if (reviews.avgRating >= 4.0) {
      score += 20
      recommendations.push('Encourage more patient reviews and improve average rating')
    } else {
      score += reviews.avgRating * 5
      recommendations.push('Focus on improving patient satisfaction and review generation')
    }

    // Analyze local keyword rankings (30 points)
    const rankings = await this.analyzeLocalKeywordRankings(clinicData)
    const avgLocalRank = rankings.reduce((sum, r) => sum + r.position, 0) / rankings.length
    
    if (avgLocalRank <= 3) {
      score += 30
    } else if (avgLocalRank <= 7) {
      score += 25
      recommendations.push('Improve local keyword rankings through content optimization')
    } else {
      score += Math.max(0, 30 - (avgLocalRank - 7) * 3)
      recommendations.push('Significant improvement needed in local keyword rankings')
    }

    return {
      score: Math.round(Math.min(score, 100)),
      localPackVisibility,
      citations,
      reviews,
      rankings,
      recommendations
    }
  }

  private static async calculateLocalPackVisibility(clinicData: any[]): Promise<number> {
    // Simulate local pack visibility calculation
    // In real implementation, this would analyze Google My Business data
    const visibility = clinicData.reduce((sum, clinic) => {
      return sum + (clinic.localPackAppearances || 0)
    }, 0) / clinicData.length

    return Math.min(visibility / 10 * 100, 100)
  }

  private static async analyzeCitations(clinicData: any[]): Promise<CitationAnalysis> {
    // Simulate citation analysis
    return {
      total: Math.floor(Math.random() * 50) + 30,
      consistent: Math.floor(Math.random() * 30) + 15,
      inconsistent: Math.floor(Math.random() * 10) + 5,
      missing: Math.floor(Math.random() * 15) + 10
    }
  }

  private static async analyzeReviews(clinicData: any[]): Promise<ReviewAnalysis> {
    const totalReviews = clinicData.reduce((sum, clinic) => sum + (clinic.reviewCount || 0), 0)
    const totalRating = clinicData.reduce((sum, clinic) => 
      sum + ((clinic.rating || 0) * (clinic.reviewCount || 0)), 0
    )

    return {
      totalCount: totalReviews,
      avgRating: totalReviews > 0 ? totalRating / totalReviews : 0,
      responseRate: Math.floor(Math.random() * 30) + 70,
      sentimentDistribution: {
        positive: 75,
        neutral: 20,
        negative: 5
      }
    }
  }

  private static async analyzeLocalKeywordRankings(clinicData: any[]): Promise<LocalKeywordRanking[]> {
    // Simulate local keyword rankings
    return [
      {
        keyword: 'clinic near me singapore',
        position: Math.floor(Math.random() * 8) + 1,
        localPack: true,
        searchVolume: Math.floor(Math.random() * 5000) + 2000,
        difficulty: Math.floor(Math.random() * 50) + 40
      },
      {
        keyword: 'GP singapore',
        position: Math.floor(Math.random() * 12) + 1,
        localPack: true,
        searchVolume: Math.floor(Math.random() * 3000) + 1500,
        difficulty: Math.floor(Math.random() * 60) + 50
      },
      {
        keyword: 'healthcare singapore',
        position: Math.floor(Math.random() * 15) + 5,
        localPack: false,
        searchVolume: Math.floor(Math.random() * 4000) + 1000,
        difficulty: Math.floor(Math.random() * 70) + 30
      }
    ]
  }
}

// =============================================================================
// COMPETITOR ANALYSIS
// =============================================================================

export class CompetitorSEOAnalysis {
  static async analyzeCompetitors(
    competitors: CompetitorData[]
  ): Promise<{
    gapAnalysis: GapAnalysis
    keywordOpportunities: KeywordOpportunity[]
    contentOpportunities: ContentOpportunity[]
    technicalOpportunities: TechnicalOpportunity[]
  }> {
    const gapAnalysis = await this.analyzeKeywordGaps(competitors)
    const keywordOpportunities = await this.findKeywordOpportunities(competitors)
    const contentOpportunities = await this.findContentOpportunities(competitors)
    const technicalOpportunities = await this.findTechnicalOpportunities(competitors)

    return {
      gapAnalysis,
      keywordOpportunities,
      contentOpportunities,
      technicalOpportunities
    }
  }

  private static async analyzeKeywordGaps(competitors: CompetitorData[]): Promise<GapAnalysis> {
    const allCompetitorKeywords = competitors.flatMap(c => c.keywords || [])
    const ourKeywords = [] // In real implementation, get our keywords
    
    const competitorOnlyKeywords = allCompetitorKeywords.filter(keyword =>
      !ourKeywords.includes(keyword)
    )

    return {
      missingKeywords: competitorOnlyKeywords,
      opportunityScore: competitorOnlyKeywords.length * (Math.random() * 5 + 3),
      priorityKeywords: competitorOnlyKeywords.slice(0, 20)
    }
  }

  private static async findKeywordOpportunities(competitors: CompetitorData[]): Promise<KeywordOpportunity[]> {
    return competitors.map(competitor => ({
      keyword: 'low competition keyword',
      competitorRank: Math.floor(Math.random() * 10) + 1,
      ourRank: Math.floor(Math.random() * 50) + 20,
      opportunity: Math.floor(Math.random() * 100) + 50,
      difficulty: Math.floor(Math.random() * 30) + 20,
      volume: Math.floor(Math.random() * 2000) + 500
    }))
  }

  private static async findContentOpportunities(competitors: CompetitorData[]): Promise<ContentOpportunity[]> {
    return [
      {
        topic: 'Healthier SG Program Guide',
        competitorCoverage: 80,
        ourCoverage: 20,
        opportunity: 85,
        contentGaps: [
          'Comprehensive enrollment guide',
          'Benefits breakdown',
          'Success stories'
        ]
      }
    ]
  }

  private static async findTechnicalOpportunities(competitors: CompetitorData[]): Promise<TechnicalOpportunity[]> {
    return [
      {
        area: 'Core Web Vitals',
        ourScore: 75,
        competitorAverage: 85,
        opportunity: 90,
        improvements: [
          'Optimize Largest Contentful Paint',
          'Reduce Cumulative Layout Shift',
          'Improve First Input Delay'
        ]
      }
    ]
  }
}

// =============================================================================
// ALERT SYSTEM
// =============================================================================

interface Alert {
  id: string
  type: string
  message: string
  timestamp: Date
  severity: 'low' | 'medium' | 'high'
}

interface CitationAnalysis {
  total: number
  consistent: number
  inconsistent: number
  missing: number
}

interface ReviewAnalysis {
  totalCount: number
  avgRating: number
  responseRate: number
  sentimentDistribution: {
    positive: number
    neutral: number
    negative: number
  }
}

interface LocalKeywordRanking {
  keyword: string
  position: number
  localPack: boolean
  searchVolume: number
  difficulty: number
}

interface CompetitorData {
  name: string
  url: string
  keywords?: string[]
  backlinks?: number
  domainAuthority?: number
}

interface GapAnalysis {
  missingKeywords: string[]
  opportunityScore: number
  priorityKeywords: string[]
}

interface KeywordOpportunity {
  keyword: string
  competitorRank: number
  ourRank: number
  opportunity: number
  difficulty: number
  volume: number
}

interface ContentOpportunity {
  topic: string
  competitorCoverage: number
  ourCoverage: number
  opportunity: number
  contentGaps: string[]
}

interface TechnicalOpportunity {
  area: string
  ourScore: number
  competitorAverage: number
  opportunity: number
  improvements: string[]
}

// =============================================================================
// EXPORTS
// =============================================================================

export const seoAnalytics = {
  performance: SEOPerformanceTracker,
  healthcare: HealthcareSEOAnalytics,
  local: LocalSEOAnalytics,
  competitor: CompetitorSEOAnalysis
}

export default seoAnalytics