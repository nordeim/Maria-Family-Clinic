// Intelligent FAQ Search System with Fuzzy Matching
// Sub-Phase 8.5: Content Management System

import { FAQItem, FAQCategory, FAQSearchResult } from '../types'

// Search configuration
const SEARCH_CONFIG = {
  maxResults: 20,
  minQueryLength: 2,
  fuzzyThreshold: 0.6,
  highlightKeywords: true,
  enableSpellCorrection: true,
  enableFacetedSearch: true,
}

// Fuzzy matching utilities
class FuzzyMatcher {
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        )
      }
    }
    
    return matrix[str2.length][str1.length]
  }

  private static similarityScore(str1: string, str2: string): number {
    const distance = this.levenshteinDistance(str1.toLowerCase(), str2.toLowerCase())
    const maxLength = Math.max(str1.length, str2.length)
    return maxLength === 0 ? 1 : 1 - distance / maxLength
  }

  private static tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 0)
  }

  static findMatches(query: string, candidates: string[]): { text: string; score: number }[] {
    if (query.length < SEARCH_CONFIG.minQueryLength) return []
    
    const queryTokens = this.tokenize(query)
    const results: { text: string; score: number }[] = []
    
    for (const candidate of candidates) {
      const candidateTokens = this.tokenize(candidate)
      let totalScore = 0
      let matchedTokens = 0
      
      for (const queryToken of queryTokens) {
        let bestMatch = 0
        
        for (const candidateToken of candidateTokens) {
          const score = this.similarityScore(queryToken, candidateToken)
          bestMatch = Math.max(bestMatch, score)
        }
        
        if (bestMatch >= SEARCH_CONFIG.fuzzyThreshold) {
          totalScore += bestMatch
          matchedTokens++
        }
      }
      
      if (matchedTokens > 0) {
        const finalScore = totalScore / queryTokens.length
        results.push({ text: candidate, score: finalScore })
      }
    }
    
    return results.sort((a, b) => b.score - a.score)
  }
}

// Highlighting utilities
class Highlighter {
  static highlightText(text: string, keywords: string[]): { text: string; highlighted: boolean }[] {
    if (!SEARCH_CONFIG.highlightKeywords || keywords.length === 0) {
      return [{ text, highlighted: false }]
    }
    
    const results: { text: string; highlighted: boolean }[] = []
    let lastIndex = 0
    
    // Create regex pattern for keywords
    const pattern = new RegExp(`(${keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi')
    const matches = [...text.matchAll(pattern)]
    
    for (const match of matches) {
      // Add text before match
      if (match.index! > lastIndex) {
        results.push({ text: text.substring(lastIndex, match.index), highlighted: false })
      }
      
      // Add highlighted match
      results.push({ text: match[0], highlighted: true })
      lastIndex = match.index! + match[0].length
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      results.push({ text: text.substring(lastIndex), highlighted: false })
    }
    
    return results
  }
}

// Search query processing
class QueryProcessor {
  private static readonly STOPWORDS = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those'
  ])

  static processQuery(rawQuery: string): { 
    original: string
    normalized: string
    keywords: string[]
    expandedTerms: string[]
  } {
    const normalized = rawQuery.toLowerCase().trim()
    const tokens = this.tokenize(normalized)
    const keywords = tokens.filter(token => !this.STOPWORDS.has(token))
    
    // Expand keywords with synonyms and related terms
    const expandedTerms = this.expandKeywords(keywords)
    
    return {
      original: rawQuery,
      normalized,
      keywords,
      expandedTerms: [...keywords, ...expandedTerms]
    }
  }

  private static tokenize(text: string): string[] {
    return text
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 0)
  }

  private static expandKeywords(keywords: string[]): string[] {
    const synonyms: Record<string, string[]> = {
      'healthier': ['healthy', 'wellness', 'health'],
      'eligible': ['qualification', 'eligibility', 'apply'],
      'benefit': ['advantage', 'subsidy', 'coverage'],
      'screening': ['check-up', 'test', 'assessment'],
      'chronic': ['diabetes', 'hypertension', 'long-term'],
      'clinic': ['doctor', 'healthcare', 'hospital'],
      'enrollment': ['register', 'join', 'sign-up'],
      'subsidy': ['discount', 'rebate', 'financial aid']
    }

    const expanded: string[] = []
    
    for (const keyword of keywords) {
      if (synonyms[keyword]) {
        expanded.push(...synonyms[keyword])
      }
    }
    
    return expanded
  }
}

// Main FAQ Search Engine
export class FAQSearchEngine {
  private faqs: FAQItem[]
  private categories: FAQCategory[]
  
  constructor(faqs: FAQItem[], categories: FAQCategory[]) {
    this.faqs = faqs
    this.categories = categories
  }

  async search(
    query: string,
    filters: {
      categories?: string[]
      priority?: 'HIGH' | 'MEDIUM' | 'LOW'
      governmentVerified?: boolean
    } = {}
  ): Promise<FAQSearchResult> {
    const startTime = Date.now()
    
    // Process query
    const processedQuery = QueryProcessor.processQuery(query)
    
    // Get searchable text fields
    const searchableTexts = this.faqs.flatMap(faq => [
      faq.question,
      faq.answer.short,
      faq.answer.detailed,
      ...faq.searchKeywords,
      ...faq.tags
    ])
    
    // Perform fuzzy matching
    const fuzzyMatches = FuzzyMatcher.findMatches(
      processedQuery.normalized,
      searchableTexts
    )
    
    // Score and rank FAQs
    const scoredFaqs = this.faqs.map(faq => {
      let score = 0
      const matchedTerms: string[] = []
      
      // Question match (highest weight)
      const questionMatches = FuzzyMatcher.findMatches(
        processedQuery.normalized,
        [faq.question]
      )
      if (questionMatches.length > 0) {
        score += questionMatches[0].score * 1.0
        matchedTerms.push(...questionMatches.slice(0, 3).map(m => m.text))
      }
      
      // Answer match (medium weight)
      const answerTexts = [faq.answer.short, faq.answer.detailed]
      const answerMatches = FuzzyMatcher.findMatches(
        processedQuery.normalized,
        answerTexts
      )
      if (answerMatches.length > 0) {
        score += answerMatches[0].score * 0.7
        matchedTerms.push(...answerMatches.slice(0, 2).map(m => m.text))
      }
      
      // Keywords and tags match (lower weight)
      const keywordTexts = [...faq.searchKeywords, ...faq.tags]
      const keywordMatches = FuzzyMatcher.findMatches(
        processedQuery.normalized,
        keywordTexts
      )
      if (keywordMatches.length > 0) {
        score += keywordMatches[0].score * 0.5
        matchedTerms.push(...keywordMatches.slice(0, 2).map(m => m.text))
      }
      
      // Boost score for government verified content
      if (faq.governmentVerified) {
        score *= 1.1
      }
      
      // Boost score for high priority content
      if (faq.priority === 'HIGH') {
        score *= 1.05
      }
      
      // Apply filters
      if (filters.categories && !filters.categories.includes(faq.category)) {
        score *= 0.3
      }
      
      if (filters.priority && faq.priority !== filters.priority) {
        score *= 0.5
      }
      
      if (filters.governmentVerified !== undefined && faq.governmentVerified !== filters.governmentVerified) {
        score *= 0.2
      }
      
      return {
        faq,
        relevanceScore: score,
        matchedTerms: [...new Set(matchedTerms)],
        highlight: this.createHighlight(processedQuery.keywords, faq)
      }
    })
    
    // Filter out low-scoring results and sort
    const results = scoredFaqs
      .filter(result => result.relevanceScore > 0.3)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, SEARCH_CONFIG.maxResults)
    
    // Generate category statistics
    const categoryStats = this.generateCategoryStats(results, processedQuery.keywords)
    
    // Generate search suggestions
    const suggestions = this.generateSuggestions(processedQuery.keywords, results)
    
    const searchTime = Date.now() - startTime
    
    return {
      query: processedQuery.original,
      results,
      categories: categoryStats,
      suggestions,
      totalResults: results.length,
      searchTime
    }
  }

  private createHighlight(keywords: string[], faq: FAQItem) {
    return {
      question: Highlighter.highlightText(faq.question, keywords),
      answer: Highlighter.highlightText(faq.answer.short, keywords)
    }
  }

  private generateCategoryStats(results: any[], keywords: string[]) {
    const categoryMap = new Map()
    
    for (const result of results) {
      const category = this.categories.find(c => c.id === result.faq.category)
      if (category) {
        const existing = categoryMap.get(category.id)
        if (existing) {
          existing.resultCount++
        } else {
          categoryMap.set(category.id, {
            category,
            resultCount: 1
          })
        }
      }
    }
    
    return Array.from(categoryMap.values()).sort((a, b) => b.resultCount - a.resultCount)
  }

  private generateSuggestions(keywords: string[], results: any[]): string[] {
    const suggestions = new Set<string>()
    
    // Add popular related keywords from results
    for (const result of results.slice(0, 5)) {
      result.faq.tags.forEach((tag: string) => {
        if (!keywords.includes(tag)) {
          suggestions.add(tag)
        }
      })
    }
    
    // Add common question starters
    const commonStarters = [
      'How to',
      'What is',
      'When can',
      'Where to',
      'Who is'
    ]
    
    if (keywords.length > 0) {
      for (const starter of commonStarters) {
        suggestions.add(`${starter} ${keywords[0]}`)
      }
    }
    
    return Array.from(suggestions).slice(0, 5)
  }

  // Get popular FAQs for quick access
  getPopularFaqs(limit: number = 10): FAQItem[] {
    return this.faqs
      .filter(faq => faq.viewCount > 0 || faq.helpfulVotes.up > 0)
      .sort((a, b) => (b.viewCount + b.helpfulVotes.up) - (a.viewCount + a.helpfulVotes.up))
      .slice(0, limit)
  }

  // Get related FAQs
  getRelatedFaqs(faqId: string, limit: number = 5): FAQItem[] {
    const faq = this.faqs.find(f => f.id === faqId)
    if (!faq) return []
    
    const relatedFaqs = this.faqs
      .filter(f => f.id !== faqId)
      .map(f => {
        // Calculate similarity based on tags and category
        const sharedTags = f.tags.filter(tag => faq.tags.includes(tag)).length
        const sameCategory = f.category === faq.category ? 1 : 0
        
        return {
          faq: f,
          similarity: sharedTags * 2 + sameCategory
        }
      })
      .filter(item => item.similarity > 0)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map(item => item.faq)
    
    return relatedFaqs
  }
}

// Export utility functions
export const createFAQSearchEngine = (faqs: FAQItem[], categories: FAQCategory[]) => {
  return new FAQSearchEngine(faqs, categories)
}

export const highlightSearchTerms = (text: string, keywords: string[]) => {
  return Highlighter.highlightText(text, keywords)
}

export const processSearchQuery = (query: string) => {
  return QueryProcessor.processQuery(query)
}