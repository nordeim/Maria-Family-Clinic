// Healthier SG FAQ Section Component
// Intelligent FAQ search with keyword matching and categorization

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { 
  Search, 
  ChevronDown, 
  ChevronRight,
  HelpCircle,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Filter,
  Star,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  Book,
  FileText,
  Phone,
  Mail,
  ExternalLink,
  Lightbulb,
  TrendingUp
} from 'lucide-react'
import { FAQItem, FAQCategory, FAQSearchResult, ProgramInfoComponentProps } from './types'
import { createFAQSearchEngine } from './content-management/faq-search'
import { createValidationEngine } from './content-management/content-validation'
import { createAnalyticsEngine } from './content-management/analytics'

// Mock FAQ data
const mockFAQCategories: FAQCategory[] = [
  {
    id: 'enrollment',
    name: 'Enrollment & Eligibility',
    description: 'Questions about joining Healthier SG and eligibility requirements',
    icon: 'users',
    color: 'blue',
    order: 1,
    questionCount: 24,
    isActive: true
  },
  {
    id: 'benefits',
    name: 'Benefits & Subsidies',
    description: 'Information about healthcare benefits and cost savings',
    icon: 'star',
    color: 'green',
    order: 2,
    questionCount: 18,
    isActive: true
  },
  {
    id: 'health-services',
    name: 'Health Services',
    description: 'Details about screening, vaccinations, and health services',
    icon: 'heart',
    color: 'red',
    order: 3,
    questionCount: 31,
    isActive: true
  },
  {
    id: 'providers',
    name: 'Healthcare Providers',
    description: 'Questions about doctors, clinics, and healthcare networks',
    icon: 'users',
    color: 'purple',
    order: 4,
    questionCount: 15,
    isActive: true
  },
  {
    id: 'timeline',
    name: 'Program Timeline',
    description: 'Important dates, deadlines, and program milestones',
    icon: 'clock',
    color: 'orange',
    order: 5,
    questionCount: 12,
    isActive: true
  },
  {
    id: 'technical',
    name: 'Technical Support',
    description: 'Website issues, account problems, and technical help',
    icon: 'help-circle',
    color: 'gray',
    order: 6,
    questionCount: 22,
    isActive: true
  }
]

const mockFAQItems: FAQItem[] = [
  {
    id: 'faq-001',
    question: 'Who is eligible to join Healthier SG?',
    answer: {
      short: 'Singapore citizens and permanent residents aged 18 and above are eligible for Healthier SG.',
      detailed: 'Healthier SG is open to all Singapore citizens and permanent residents who are 18 years and above. The program is designed to help residents work with their family doctors to improve their health through personalized health plans. There are no income restrictions, and anyone who meets the basic eligibility criteria can participate. The program focuses on preventive care and early intervention for chronic conditions.',
      sources: [
        {
          title: 'MOH Healthier SG Eligibility Guidelines',
          url: 'https://www.moh.gov.sg/healthier-sg/eligibility',
          type: 'OFFICIAL'
        }
      ]
    },
    category: 'enrollment',
    tags: ['eligibility', 'citizenship', 'age', 'residents'],
    priority: 'HIGH',
    lastUpdated: new Date('2025-03-15'),
    governmentVerified: true,
    verifiedBy: 'MOH',
    searchKeywords: ['eligible', 'citizen', 'permanent resident', '18 years', 'join', 'who can'],
    viewCount: 2847,
    helpfulVotes: { up: 234, down: 12 }
  },
  {
    id: 'faq-002',
    question: 'How much does Healthier SG cost?',
    answer: {
      short: 'Healthier SG is free to enroll in. Most services are subsidized by the government.',
      detailed: 'Enrollment in Healthier SG is completely free for eligible participants. The program provides significant government subsidies for health screenings, consultations, and chronic disease management. Participants only pay minimal fees for certain services, with government subsidies covering 60-90% of costs. Specific costs include: Free health screenings, $5 consultation fees (90% subsidy), discounted medications, and no annual fees.',
      sources: [
        {
          title: 'Healthier SG Benefits and Costs',
          url: 'https://www.moh.gov.sg/healthier-sg/benefits',
          type: 'OFFICIAL'
        }
      ]
    },
    category: 'benefits',
    tags: ['cost', 'free', 'subsidies', 'fees', 'pricing'],
    priority: 'HIGH',
    lastUpdated: new Date('2025-03-10'),
    governmentVerified: true,
    verifiedBy: 'MOH',
    searchKeywords: ['cost', 'free', 'price', 'fees', 'subsidy', 'expensive', 'pay'],
    viewCount: 3256,
    helpfulVotes: { up: 298, down: 8 }
  },
  {
    id: 'faq-003',
    question: 'What health screenings are included in Healthier SG?',
    answer: {
      short: 'Comprehensive health screening including blood tests, BMI, and age-appropriate screenings.',
      detailed: 'Healthier SG provides comprehensive health screening that includes: Basic health assessment (blood pressure, BMI, heart rate), Blood tests (cholesterol, blood sugar, kidney function), Age-specific screenings (mammograms, colonoscopies, bone density), Risk factor assessment (smoking, alcohol, family history), Mental health screening, and Lifestyle evaluation. Screening frequency depends on age and risk factors, typically every 2-3 years for most adults.',
      sources: [
        {
          title: 'Health Screening Guidelines',
          url: 'https://www.moh.gov.sg/healthier-sg/screening',
          type: 'OFFICIAL'
        }
      ]
    },
    category: 'health-services',
    tags: ['screening', 'tests', 'health check', 'early detection'],
    priority: 'HIGH',
    lastUpdated: new Date('2025-03-20'),
    governmentVerified: true,
    verifiedBy: 'MOH',
    searchKeywords: ['screening', 'test', 'check-up', 'blood test', 'mammogram', 'early detection'],
    viewCount: 1923,
    helpfulVotes: { up: 156, down: 4 }
  },
  {
    id: 'faq-004',
    question: 'How do I choose a family doctor for Healthier SG?',
    answer: {
      short: 'You can choose from participating Healthier SG clinics using our clinic finder tool.',
      detailed: 'Choosing a family doctor is an important step in Healthier SG. You can select any doctor from the participating clinic network. Factors to consider include: Location convenience, Clinic hours and availability, Doctor\'s experience and specialty, Language preferences, Patient reviews and ratings. Use our clinic finder tool to search for participating clinics near you, read doctor profiles, and check availability. You can change your family doctor if needed by contacting Healthier SG support.',
      sources: [
        {
          title: 'Clinic Finder Guide',
          url: 'https://www.moh.gov.sg/healthier-sg/clinics',
          type: 'OFFICIAL'
        }
      ]
    },
    category: 'providers',
    tags: ['family doctor', 'clinic', 'choose', 'selection', 'near me'],
    priority: 'MEDIUM',
    lastUpdated: new Date('2025-03-08'),
    governmentVerified: true,
    verifiedBy: 'MOH',
    searchKeywords: ['doctor', 'clinic', 'choose', 'family doctor', 'near me', 'selection'],
    viewCount: 1654,
    helpfulVotes: { up: 142, down: 9 }
  },
  {
    id: 'faq-005',
    question: 'When do I need to complete my Healthier SG enrollment?',
    answer: {
      short: 'Enrollment periods are announced by MOH. Current enrollment is ongoing.',
      detailed: 'Healthier SG enrollment is conducted in phases announced by the Ministry of Health. The main enrollment periods are typically announced 3-6 months in advance. Once enrollment opens for your age group, you typically have 6-12 months to complete the process. Early enrollment is recommended to ensure you can secure your preferred family doctor and clinic. If you miss an enrollment period, you can usually join during the next announced period. Check the official MOH website for current enrollment schedules.',
      sources: [
        {
          title: 'Healthier SG Enrollment Timeline',
          url: 'https://www.moh.gov.sg/healthier-sg/enrollment',
          type: 'OFFICIAL'
        }
      ]
    },
    category: 'timeline',
    tags: ['enrollment', 'deadline', 'timeline', 'when', 'dates'],
    priority: 'HIGH',
    lastUpdated: new Date('2025-03-25'),
    governmentVerified: true,
    verifiedBy: 'MOH',
    searchKeywords: ['enrollment', 'deadline', 'when', 'timeline', 'dates', 'sign up'],
    viewCount: 2156,
    helpfulVotes: { up: 189, down: 15 }
  },
  {
    id: 'faq-006',
    question: 'Can I use my Medisave for Healthier SG services?',
    answer: {
      short: 'Yes, Healthier SG services can be paid using Medisave with additional subsidies.',
      detailed: 'Healthier SG integrates seamlessly with Medisave and other government subsidies. You can use your Medisave account to pay for services like consultations, medications, and certain treatments. The government provides additional subsidies on top of Medisave coverage, significantly reducing your out-of-pocket expenses. Typical cost structure includes: Consultations: $5 copay (after 90% subsidy), Medications: Up to 75% subsidy, Screenings: Usually fully covered, Chronic disease management: Heavy subsidy with Medisave top-up. Your family doctor will explain the cost structure for your specific needs.',
      sources: [
        {
          title: 'Medisave and Healthier SG Integration',
          url: 'https://www.moh.gov.sg/healthier-sg/medisave',
          type: 'OFFICIAL'
        }
      ]
    },
    category: 'benefits',
    tags: ['medisave', 'payment', 'cost', 'subsidies', 'money'],
    priority: 'HIGH',
    lastUpdated: new Date('2025-03-18'),
    governmentVerified: true,
    verifiedBy: 'MOH',
    searchKeywords: ['medisave', 'payment', 'cost', 'money', 'pay', 'subsidy'],
    viewCount: 1876,
    helpfulVotes: { up: 167, down: 6 }
  }
]

interface FAQSectionProps extends ProgramInfoComponentProps {
  initialCategory?: string
  showSearch?: boolean
  showFeedback?: boolean
  maxQuestions?: number
}

export type { FAQSectionProps }

export const FAQSection: React.FC<FAQSectionProps> = ({
  className = '',
  language = 'en',
  userType = 'citizen',
  isMobile = false,
  showGovernmentDisclaimer = true,
  enableAnalytics = true,
  initialCategory = 'all',
  showSearch = true,
  showFeedback = true,
  maxQuestions = undefined
}) => {
  const [faqs, setFaqs] = useState<FAQItem[]>([])
  const [categories, setCategories] = useState<FAQCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<FAQSearchResult | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState('browse')
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, { up: number; down: number }>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadFAQData = async () => {
      setLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600))
      setFaqs(mockFAQItems)
      setCategories(mockFAQCategories)
      
      // Initialize helpful votes
      const initialVotes: Record<string, { up: number; down: number }> = {}
      mockFAQItems.forEach(faq => {
        initialVotes[faq.id] = faq.helpfulVotes
      })
      setHelpfulVotes(initialVotes)
      setLoading(false)
    }
    loadFAQData()
  }, [])

  // Initialize content management engines
  const [searchEngine] = useState(() => createFAQSearchEngine(mockFAQItems, mockFAQCategories))
  const [validationEngine] = useState(() => createValidationEngine())
  const [analyticsEngine] = useState(() => createAnalyticsEngine())

  // Search functionality with intelligent matching
  const searchFAQs = async (query: string, filters?: { categories?: string[]; governmentVerified?: boolean }) => {
    if (!query.trim()) {
      setSearchResults(null)
      return
    }

    setIsSearching(true)
    
    try {
      // Use intelligent FAQ search engine
      const searchResult = await searchEngine.search(query, {
        categories: filters?.categories,
        governmentVerified: filters?.governmentVerified
      })
      
      setSearchResults(searchResult)
      
      // Track search analytics
      if (enableAnalytics) {
        analyticsEngine.trackEngagement({
          sessionId: `session-${Date.now()}`,
          contentId: 'faq-search',
          contentType: 'FAQ',
          action: 'search',
          metadata: {
            searchQuery: query,
            searchResults: searchResult.totalResults,
            language: language,
            device: isMobile ? 'mobile' : 'desktop'
          }
        })
      }
      
      // Validate search results for compliance
      searchResult.results.forEach(result => {
        const compliance = validationEngine.validateContent(result.faq, 'FAQ')
        if (compliance.overallStatus !== 'COMPLIANT') {
          console.warn('FAQ content compliance issue:', compliance)
        }
      })
      
    } catch (error) {
      console.error('FAQ search failed:', error)
      setSearchResults(null)
    } finally {
      setIsSearching(false)
    }
        }
        
        return {
          faq,
          relevanceScore: score,
          matchedTerms: [...new Set(matchedTerms)],
          highlight: {
            question: buildHighlight(faq.question, searchTerms),
            answer: buildHighlight(faq.answer.short, searchTerms)
          }
        }
      })
      .filter(result => result.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)

    const categoryResults = categories.map(category => ({
      category,
      resultCount: results.filter(r => r.faq.category === category.id).length
    }))

    setSearchResults({
      query,
      results,
      categories: categoryResults,
      suggestions: generateSuggestions(searchTerms),
      totalResults: results.length,
      searchTime: Math.random() * 200 + 50 // Simulated search time
    })
    
    setIsSearching(false)
  }

  const buildHighlight = (text: string, searchTerms: string[]) => {
    return text.split(' ').map(word => ({
      text: word,
      highlighted: searchTerms.some(term => word.toLowerCase().includes(term))
    }))
  }

  const generateSuggestions = (terms: string[]) => {
    // Simple suggestion logic
    const commonSuggestions = [
      'eligibility requirements',
      'cost and subsidies',
      'health screenings',
      'choose family doctor',
      'enrollment process'
    ]
    return commonSuggestions.filter(suggestion => 
      !terms.some(term => suggestion.toLowerCase().includes(term.toLowerCase()))
    ).slice(0, 3)
  }

  // Filter FAQs by category
  const filteredFAQs = useMemo(() => {
    if (selectedCategory === 'all') return faqs
    return faqs.filter(faq => faq.category === selectedCategory)
  }, [faqs, selectedCategory])

  // Limit questions if specified
  const displayFAQs = useMemo(() => {
    return maxQuestions ? filteredFAQs.slice(0, maxQuestions) : filteredFAQs
  }, [filteredFAQs, maxQuestions])

  const toggleExpanded = (faqId: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(faqId)) {
      newExpanded.delete(faqId)
    } else {
      newExpanded.add(faqId)
    }
    setExpandedItems(newExpanded)
  }

  const handleVote = (faqId: string, voteType: 'up' | 'down', result?: any) => {
    setHelpfulVotes(prev => ({
      ...prev,
      [faqId]: {
        up: prev[faqId].up + (voteType === 'up' ? 1 : 0),
        down: prev[faqId].down + (voteType === 'down' ? 1 : 0)
      }
    }))
    
    // Track analytics and engagement
    if (enableAnalytics) {
      const faqItem = result?.faq || faqs.find(f => f.id === faqId)
      
      // Track vote
      analyticsEngine.trackEngagement({
        sessionId: `session-${Date.now()}`,
        contentId: faqId,
        contentType: 'FAQ',
        action: 'vote',
        metadata: {
          voteType,
          language: language,
          device: isMobile ? 'mobile' : 'desktop'
        }
      })
      
      // Validate content on vote (compliance check)
      if (faqItem) {
        const compliance = validationEngine.validateContent(faqItem, 'FAQ')
        if (compliance.overallStatus !== 'COMPLIANT') {
          console.warn('FAQ content compliance issue on vote:', compliance)
        }
      }
      
      console.log('FAQ vote tracked:', { faqId, voteType, timestamp: new Date().toISOString() })
    }
  }

  const handleFAQView = (faqId: string) => {
    if (enableAnalytics) {
      const faqItem = faqs.find(f => f.id === faqId)
      
      analyticsEngine.trackEngagement({
        sessionId: `session-${Date.now()}`,
        contentId: faqId,
        contentType: 'FAQ',
        action: 'view',
        duration: Date.now(), // Track view start time
        metadata: {
          language: language,
          device: isMobile ? 'mobile' : 'desktop',
          referrer: document.referrer
        }
      })
      
      // Generate performance insights
      const insights = analyticsEngine.generateInsights(faqId)
      if (insights.recommendations.length > 0) {
        console.log('FAQ performance insights:', insights)
      }
    }
  }

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    switch (categoryId) {
      case 'enrollment': return <Users className="h-5 w-5" />
      case 'benefits': return <Star className="h-5 w-5" />
      case 'health-services': return <Heart className="h-5 w-5" />
      case 'providers': return <Users className="h-5 w-5" />
      case 'timeline': return <Clock className="h-5 w-5" />
      case 'technical': return <HelpCircle className="h-5 w-5" />
      default: return <HelpCircle className="h-5 w-5" />
    }
  }

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    const colorMap = {
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      red: 'bg-red-100 text-red-800',
      purple: 'bg-purple-100 text-purple-800',
      orange: 'bg-orange-100 text-orange-800',
      gray: 'bg-gray-100 text-gray-800'
    }
    return colorMap[category?.color as keyof typeof colorMap] || colorMap.blue
  }

  const renderHighlightedText = (parts: Array<{ text: string; highlighted: boolean }>) => {
    return parts.map((part, index) => (
      <span key={index} className={part.highlighted ? 'bg-yellow-200 font-semibold' : ''}>
        {part.text}{' '}
      </span>
    ))
  }

  if (loading) {
    return (
      <div className={`container mx-auto p-6 ${className}`}>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about Healthier SG. Can't find what you're looking for? 
            Search our comprehensive FAQ database or contact support.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="browse">Browse by Category</TabsTrigger>
            <TabsTrigger value="search">Search FAQs</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="mt-8">
            {/* Search Bar */}
            {showSearch && (
              <Card className="mb-8">
                <CardContent className="p-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search FAQs... (e.g., 'eligibility', 'cost', 'screening')"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value)
                        searchFAQs(e.target.value)
                      }}
                      className="pl-10 pr-4 py-3 text-lg"
                    />
                    {isSearching && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                  </div>
                  
                  {/* Quick Search Suggestions */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="text-sm text-gray-600">Popular searches:</span>
                    {['eligibility', 'cost', 'screening', 'enrollment'].map((suggestion) => (
                      <Button
                        key={suggestion}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearchQuery(suggestion)
                          searchFAQs(suggestion)
                        }}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Search Results */}
            {searchResults && (
              <div className="space-y-6">
                {/* Search Summary */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">
                          Found {searchResults.totalResults} results for "{searchResults.query}"
                        </h3>
                        <p className="text-sm text-gray-600">
                          Search completed in {Math.round(searchResults.searchTime)}ms
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">
                          {searchResults.categories.reduce((sum, cat) => sum + cat.resultCount, 0)} total
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Category breakdown */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {searchResults.categories
                        .filter(cat => cat.resultCount > 0)
                        .map(category => (
                          <Badge key={category.category.id} variant="outline">
                            {category.category.name}: {category.resultCount}
                          </Badge>
                        ))
                      }
                    </div>
                  </CardContent>
                </Card>

                {/* Search Suggestions */}
                {searchResults.suggestions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <Lightbulb className="h-5 w-5 mr-2" />
                        Related Searches
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {searchResults.suggestions.map((suggestion, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSearchQuery(suggestion)
                              searchFAQs(suggestion)
                            }}
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* FAQ Results */}
                <div className="space-y-4">
                  {searchResults.results.map((result) => (
                    <Card key={result.faq.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            {getCategoryIcon(result.faq.category)}
                            <Badge className={getCategoryColor(result.faq.category)}>
                              {categories.find(c => c.id === result.faq.category)?.name}
                            </Badge>
                            {result.faq.governmentVerified && (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {result.faq.viewCount.toLocaleString()} views
                          </div>
                        </div>
                        
                        <Collapsible>
                          <CollapsibleTrigger asChild>
                            <Button 
                              variant="ghost" 
                              className="w-full justify-start p-0 h-auto"
                              onClick={() => {
                                toggleExpanded(result.faq.id)
                                handleFAQView(result.faq.id)
                              }}
                            >
                              <h3 className="text-lg font-semibold text-left">
                                {renderHighlightedText(result.highlight.question)}
                              </h3>
                              {expandedItems.has(result.faq.id) ? (
                                <ChevronDown className="h-5 w-5 ml-auto flex-shrink-0" />
                              ) : (
                                <ChevronRight className="h-5 w-5 ml-auto flex-shrink-0" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                          
                          <CollapsibleContent className="mt-4">
                            <div className="space-y-4">
                              <p className="text-gray-700">
                                {renderHighlightedText(result.highlight.answer)}
                              </p>
                              
                              {result.faq.answer.detailed && expandedItems.has(result.faq.id) && (
                                <div className="border-t pt-4">
                                  <h4 className="font-medium mb-2">Detailed Information:</h4>
                                  <p className="text-gray-600 text-sm leading-relaxed">
                                    {result.faq.answer.detailed}
                                  </p>
                                </div>
                              )}
                              
                              {result.faq.answer.sources && result.faq.answer.sources.length > 0 && (
                                <div className="border-t pt-4">
                                  <h4 className="font-medium mb-2">Official Sources:</h4>
                                  <ul className="space-y-1">
                                    {result.faq.answer.sources.map((source, index) => (
                                      <li key={index}>
                                        <a 
                                          href={source.url} 
                                          className="text-blue-600 hover:underline text-sm flex items-center"
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                        >
                                          <ExternalLink className="h-3 w-3 mr-1" />
                                          {source.title}
                                          {source.type === 'OFFICIAL' && (
                                            <Badge variant="secondary" className="ml-2 text-xs">
                                              Official
                                            </Badge>
                                          )}
                                        </a>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {showFeedback && (
                                <div className="border-t pt-4">
                                  <h4 className="font-medium mb-2">Was this helpful?</h4>
                                  <div className="flex items-center space-x-4">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleVote(result.faq.id, 'up')}
                                    >
                                      <ThumbsUp className="h-4 w-4 mr-1" />
                                      Yes ({helpfulVotes[result.faq.id]?.up || 0})
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleVote(result.faq.id, 'down')}
                                    >
                                      <ThumbsDown className="h-4 w-4 mr-1" />
                                      No ({helpfulVotes[result.faq.id]?.down || 0})
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {searchResults.results.length === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
                      <p className="text-gray-600 mb-4">
                        We couldn't find any FAQs matching "{searchResults.query}". Try different keywords or browse by category.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button onClick={() => setSearchQuery('')} variant="outline">
                          Clear Search
                        </Button>
                        <Button onClick={() => setActiveTab('browse')}>
                          Browse Categories
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="browse" className="mt-8">
            {/* Category Filter */}
            <div className="mb-8">
              <div className="flex items-center space-x-2 mb-4">
                <Filter className="h-5 w-5 text-gray-600" />
                <span className="font-medium">Browse by Category:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('all')}
                >
                  All Categories ({faqs.length})
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <span className="mr-2">{getCategoryIcon(category.id)}</span>
                    {category.name} ({category.questionCount})
                  </Button>
                ))}
              </div>
            </div>

            {/* FAQ List */}
            <div className="space-y-4">
              {displayFAQs.map((faq) => (
                <Card key={faq.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getCategoryIcon(faq.category)}
                        <Badge className={getCategoryColor(faq.category)}>
                          {categories.find(c => c.id === faq.category)?.name}
                        </Badge>
                        {faq.governmentVerified && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        {faq.priority === 'HIGH' && (
                          <Badge variant="destructive" className="text-xs">
                            Important
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {faq.viewCount.toLocaleString()} views
                      </div>
                    </div>
                    
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start p-0 h-auto"
                          onClick={() => {
                            toggleExpanded(faq.id)
                            handleFAQView(faq.id)
                          }}
                        >
                          <h3 className="text-lg font-semibold text-left">{faq.question}</h3>
                          {expandedItems.has(faq.id) ? (
                            <ChevronDown className="h-5 w-5 ml-auto flex-shrink-0" />
                          ) : (
                            <ChevronRight className="h-5 w-5 ml-auto flex-shrink-0" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent className="mt-4">
                        <div className="space-y-4">
                          <p className="text-gray-700">{faq.answer.short}</p>
                          
                          {faq.answer.detailed && expandedItems.has(faq.id) && (
                            <div className="border-t pt-4">
                              <h4 className="font-medium mb-2">Detailed Information:</h4>
                              <p className="text-gray-600 text-sm leading-relaxed">
                                {faq.answer.detailed}
                              </p>
                            </div>
                          )}
                          
                          {/* Tags */}
                          <div className="border-t pt-4">
                            <h4 className="font-medium mb-2">Related Topics:</h4>
                            <div className="flex flex-wrap gap-2">
                              {faq.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          {faq.answer.sources && faq.answer.sources.length > 0 && (
                            <div className="border-t pt-4">
                              <h4 className="font-medium mb-2">Official Sources:</h4>
                              <ul className="space-y-1">
                                {faq.answer.sources.map((source, index) => (
                                  <li key={index}>
                                    <a 
                                      href={source.url} 
                                      className="text-blue-600 hover:underline text-sm flex items-center"
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                    >
                                      <ExternalLink className="h-3 w-3 mr-1" />
                                      {source.title}
                                      {source.type === 'OFFICIAL' && (
                                        <Badge variant="secondary" className="ml-2 text-xs">
                                          Official
                                        </Badge>
                                      )}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          <div className="border-t pt-4 text-xs text-gray-500">
                            Last updated: {faq.lastUpdated.toLocaleDateString()}
                            {faq.verifiedBy && (
                              <span className="ml-4">
                                Verified by: {faq.verifiedBy}
                              </span>
                            )}
                          </div>
                          
                          {showFeedback && (
                            <div className="border-t pt-4">
                              <h4 className="font-medium mb-2">Was this helpful?</h4>
                              <div className="flex items-center space-x-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleVote(faq.id, 'up')}
                                >
                                  <ThumbsUp className="h-4 w-4 mr-1" />
                                  Yes ({helpfulVotes[faq.id]?.up || 0})
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleVote(faq.id, 'down')}
                                >
                                  <ThumbsDown className="h-4 w-4 mr-1" />
                                  No ({helpfulVotes[faq.id]?.down || 0})
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </CardContent>
                </Card>
              ))}
            </div>

            {displayFAQs.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No FAQs in this category</h3>
                  <p className="text-gray-600 mb-4">
                    This category doesn't have any questions yet. Try browsing other categories or use search.
                  </p>
                  <Button onClick={() => setSelectedCategory('all')}>
                    View All FAQs
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Contact Support */}
        <Card className="mt-12 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Still have questions?
              </h3>
              <p className="text-gray-600 mb-6">
                Our support team is here to help you with any questions about Healthier SG
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild>
                  <a href="tel:18008508000">
                    <Phone className="h-4 w-4 mr-2" />
                    Call 1800-850-8000
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="mailto:healthiersg@moh.gov.sg">
                    <Mail className="h-4 w-4 mr-2" />
                    Email Support
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/contact">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact Form
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Government Disclaimer */}
      {showGovernmentDisclaimer && (
        <div className="mt-16 bg-gray-100 border-t">
          <div className="container mx-auto px-6 py-6">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <CheckCircle2 className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Official FAQ Database</span>
              </div>
              <p className="text-sm text-gray-600">
                All FAQs are verified by the Ministry of Health (MOH) and updated regularly. 
                For the most current information, please visit{' '}
                <a href="https://www.moh.gov.sg" className="text-blue-600 hover:underline">
                  moh.gov.sg
                </a>.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}