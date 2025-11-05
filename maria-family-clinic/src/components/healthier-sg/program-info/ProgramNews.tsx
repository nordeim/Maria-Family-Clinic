// Healthier SG Program News Component
// News and updates feed with categorization and filtering

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Newspaper, 
  Calendar,
  Filter,
  Search,
  Bell,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Users,
  FileText,
  TrendingUp,
  Clock,
  Share2,
  Bookmark,
  Eye,
  ThumbsUp,
  MessageCircle,
  Star,
  Zap,
  Globe,
  Shield,
  Heart,
  Lightbulb
} from 'lucide-react'
import { NewsItem, ProgramInfoComponentProps } from './types'

// Mock news data
const mockNewsItems: NewsItem[] = [
  {
    id: 'news-001',
    title: 'Healthier SG Enrollment Extended to December 2025',
    subtitle: 'Additional time for citizens to join the national health programme',
    summary: 'The Ministry of Health has announced an extension of the Healthier SG enrollment period to December 31, 2025, providing more Singaporeans with the opportunity to join the programme.',
    content: {
      body: 'The Ministry of Health (MOH) has announced a significant extension of the Healthier SG enrollment period, now running until December 31, 2025. This extension comes in response to high demand and feedback from citizens who need more time to consider enrollment.\n\nThe extended enrollment period will allow:\n- All Singapore Citizens and Permanent Residents aged 18 and above to enroll\n- Priority enrollment for seniors aged 60 and above\n- Enhanced support for those who need assistance with the enrollment process\n- Additional clinic capacity to accommodate increased demand\n\n"We want to ensure that every Singaporean has sufficient time to make an informed decision about joining Healthier SG," said Health Minister Ong Ye Kung. "This extension reflects our commitment to inclusive healthcare access."\n\nKey benefits of enrolling during this period:\n- Free health screening worth up to $300\n- Government subsidies of up to 90% on consultations\n- Access to personalized health plans\n- Chronic disease management support\n- Regular health monitoring and follow-ups\n\nCitizens are encouraged to use the extended period to carefully consider their healthcare needs and discuss with their family doctors.',
      sections: [
        {
          heading: 'Enrollment Statistics',
          content: 'Over 2.4 million Singaporeans have already enrolled in Healthier SG since its launch, with satisfaction ratings exceeding 92%.'
        },
        {
          heading: 'Clinic Network Expansion',
          content: 'MOH has increased the participating clinic network by 15% to accommodate the extended enrollment period.'
        }
      ],
      attachments: [
        {
          type: 'DOCUMENT',
          url: '/downloads/enrollment-extension-notice.pdf',
          title: 'Official Enrollment Extension Notice',
          description: 'Complete details of the enrollment extension announcement'
        },
        {
          type: 'LINK',
          url: '/healthier-sg/enrollment',
          title: 'Enrollment Portal',
          description: 'Access the official enrollment portal'
        }
      ]
    },
    metadata: {
      author: 'MOH Communications Team',
      category: 'PROGRAM_ANNOUNCEMENT',
      priority: 'URGENT',
      tags: ['enrollment', 'extension', 'deadline', 'announcement'],
      source: 'Ministry of Health Singapore',
      governmentSource: true
    },
    publication: {
      publishedAt: new Date('2025-03-28'),
      effectiveDate: new Date('2025-03-28'),
      expiresAt: new Date('2025-12-31'),
      status: 'PUBLISHED',
      version: 1
    },
    audience: {
      targetGroups: ['all-citizens', 'eligible-residents'],
      affectedPrograms: ['healthier-sg-enrollment'],
      geographicScope: ['nationwide']
    },
    impact: {
      affectsEnrollment: true,
      affectsBenefits: false,
      affectsEligibility: false,
      requiresAction: true,
      actionDeadline: new Date('2025-12-31')
    },
    analytics: {
      views: 45672,
      shares: 1234,
      engagementScore: 87,
      lastViewed: new Date('2025-04-15')
    },
    notifications: [
      {
        type: 'EMAIL',
        audience: ['eligible-citizens'],
        sentAt: new Date('2025-03-28'),
        status: 'SENT'
      },
      {
        type: 'SMS',
        audience: ['seniors-60-plus'],
        sentAt: new Date('2025-03-29'),
        status: 'SENT'
      }
    ]
  },
  {
    id: 'news-002',
    title: 'New Health Screening Guidelines for 2025',
    subtitle: 'Enhanced screening protocols with expanded coverage',
    summary: 'MOH releases updated health screening guidelines with expanded coverage for mental health, cardiovascular risk assessment, and cancer screening.',
    content: {
      body: 'The Ministry of Health has released comprehensive updates to the Healthier SG screening guidelines, effective immediately. The new guidelines expand coverage to include mental health screening, enhanced cardiovascular risk assessment, and updated cancer screening protocols.\n\nKey updates include:\n\n**Mental Health Screening**\n- Depression and anxiety screening for all participants\n- Stress level assessment and management resources\n- Referral pathways to mental health professionals\n\n**Enhanced Cardiovascular Assessment**\n- Advanced lipid profiling\n- Coronary risk score calculation\n- Family history evaluation\n\n**Updated Cancer Screening**\n- Age-appropriate mammography protocols\n- Colorectal cancer screening guidelines\n- Prostate cancer risk assessment for men over 50\n\n**Digital Health Integration**\n- Results automatically integrated into Healthier SG portal\n- AI-assisted risk assessment tools\n- Personalized follow-up recommendations\n\n"These guidelines represent a significant step forward in preventive care," said Dr. Lam Pin Min, Senior Minister of State for Health. "By expanding our screening protocols, we can detect health issues earlier and provide more targeted interventions."\n\nThe updated screening protocols will be available at all participating Healthier SG clinics from April 1, 2025.',
      sections: [
        {
          heading: 'Implementation Timeline',
          content: 'All participating clinics will receive training and updated protocols by March 31, 2025, with full implementation by April 1.'
        },
        {
          heading: 'Training for Healthcare Providers',
          content: 'MOH has organized comprehensive training sessions for over 5,000 healthcare providers to ensure consistent application of new guidelines.'
        }
      ],
      attachments: [
        {
          type: 'DOCUMENT',
          url: '/downloads/screening-guidelines-2025.pdf',
          title: 'Complete Screening Guidelines 2025',
          description: 'Comprehensive screening protocols and implementation details'
        }
      ]
    },
    metadata: {
      author: 'MOH Health Promotion Board',
      category: 'POLICY_UPDATE',
      priority: 'HIGH',
      tags: ['screening', 'guidelines', 'policy', 'health-promotion'],
      source: 'MOH Health Promotion Board',
      governmentSource: true
    },
    publication: {
      publishedAt: new Date('2025-03-25'),
      effectiveDate: new Date('2025-04-01'),
      status: 'PUBLISHED',
      version: 1
    },
    audience: {
      targetGroups: ['healthcare-providers', 'healthier-sg-participants'],
      affectedPrograms: ['healthier-sg-screening', 'chronic-disease-management'],
    },
    impact: {
      affectsEnrollment: false,
      affectsBenefits: true,
      affectsEligibility: false,
      requiresAction: true,
    },
    analytics: {
      views: 28456,
      shares: 892,
      engagementScore: 73,
      lastViewed: new Date('2025-04-14')
    },
    notifications: []
  },
  {
    id: 'news-003',
    title: 'Healthier SG Success Rate Reaches 95%',
    subtitle: 'Program achieves highest participant satisfaction and health outcomes',
    summary: 'Latest program data shows Healthier SG has achieved a 95% success rate in meeting participant health goals, with significant improvements in chronic disease management.',
    content: {
      body: 'The Ministry of Health has released the latest Healthier SG program data, revealing exceptional success rates and participant satisfaction. The program has achieved a 95% success rate in helping participants meet their health goals, with measurable improvements across all key health indicators.\n\n**Key Success Metrics:**\n- 95% participant satisfaction rate\n- 87% improvement in chronic disease markers\n- 73% reduction in emergency hospital visits\n- 89% participants maintain healthy lifestyle changes after 12 months\n\n**Health Outcome Highlights:**\n- 40% reduction in HbA1c levels for diabetic participants\n- 35% improvement in blood pressure control\n- 28% increase in physical activity levels\n- 92% participants report improved quality of life\n\n**Chronic Disease Management Success:**\n- 1,200+ participants achieved diabetes remission\n- 2,800+ participants reduced medication requirements\n- 1,500+ participants improved cardiovascular health\n\n"The success of Healthier SG demonstrates the power of preventive care and patient-centered health planning," said Minister Ong Ye Kung. "These results validate our investment in comprehensive primary care and health promotion."\n\nThe program has also shown significant cost savings, with participants saving an average of $2,400 annually on healthcare costs while achieving better health outcomes.\n\n**Regional Performance:**\nAll regions of Singapore have shown strong participation and success rates, with the following highlights:\n- Central Region: 97% success rate, highest participation density\n- East Region: 94% success rate, strongest chronic disease improvements\n- North Region: 95% success rate, highest lifestyle change maintenance\n- West Region: 96% success rate, most improved screening participation',
      sections: [
        {
          heading: 'Economic Impact Analysis',
          content: 'Healthier SG has generated approximately $480 million in healthcare cost savings while improving population health outcomes.'
        },
        {
          heading: 'International Recognition',
          content: 'WHO and other international health organizations have recognized Healthier SG as a model for preventive healthcare programs.'
        }
      ]
    },
    metadata: {
      author: 'MOH Analytics Team',
      category: 'PROGRAM_ANNOUNCEMENT',
      priority: 'HIGH',
      tags: ['success', 'outcomes', 'statistics', 'achievement'],
      source: 'MOH Analytics Team',
      governmentSource: true
    },
    publication: {
      publishedAt: new Date('2025-03-20'),
      effectiveDate: new Date('2025-03-20'),
      status: 'PUBLISHED',
      version: 1
    },
    audience: {
      targetGroups: ['all-citizens', 'healthcare-providers', 'policy-makers'],
      affectedPrograms: ['healthier-sg-overall']
    },
    impact: {
      affectsEnrollment: true,
      affectsBenefits: false,
      affectsEligibility: false,
      requiresAction: false,
    },
    analytics: {
      views: 52341,
      shares: 2156,
      engagementScore: 94,
      lastViewed: new Date('2025-04-16')
    },
    notifications: []
  },
  {
    id: 'news-004',
    title: 'New Multilingual Support for Healthier SG Portal',
    subtitle: 'Complete localization in all four official languages',
    summary: 'Healthier SG portal now offers full support in English, Mandarin, Malay, and Tamil with culturally adapted content.',
    content: {
      body: 'The Ministry of Health has completed the full localization of the Healthier SG digital portal, now offering comprehensive support in all four official languages of Singapore: English, Mandarin Chinese, Malay, and Tamil.\n\n**Multilingual Features:**\n- Complete portal translation with cultural adaptation\n- AI-powered translation for user-generated content\n- Language-specific health education materials\n- Cultural considerations in health recommendations\n- Multilingual customer support and helplines\n\n**Language Availability:**\n- English: Full feature set and comprehensive documentation\n- Mandarin Chinese (中文): Complete translation with traditional character support\n- Malay (Bahasa Melayu): Full localization with cultural health practices\n- Tamil (தமிழ்): Complete support including medical terminology\n\n**Cultural Adaptations:**\nThe localization goes beyond translation to include:\n- Cultural health practices and beliefs consideration\n- Religious dietary guidelines integration\n- Traditional medicine interaction awareness\n- Family-centered decision making support\n- Community health worker outreach programs\n\n"Language should never be a barrier to good health," said Dr. Janil Puthucheary, Senior Minister of State for Health. "This multilingual support ensures that every Singaporean can access Healthier SG information in their preferred language."\n\nThe multilingual portal includes specialized content for different cultural communities, including traditional Chinese medicine integration guidance and Halal-certified health recommendations.\n\n**Digital Accessibility:**\nAll multilingual content meets WCAG 2.2 AA accessibility standards and includes:\n- Screen reader compatibility\n- High contrast mode\n- Font size adjustment\n- Voice navigation support\n- Simplified language options',
      sections: [
        {
          heading: 'Community Feedback Integration',
          content: 'The localization was developed with input from community leaders, cultural advisors, and healthcare professionals representing all major ethnic groups in Singapore.'
        }
      ]
    },
    metadata: {
      author: 'MOH Digital Health Team',
      category: 'TECHNICAL',
      priority: 'MEDIUM',
      tags: ['multilingual', 'digital', 'accessibility', 'localization'],
      source: 'MOH Digital Health Team',
      governmentSource: true
    },
    publication: {
      publishedAt: new Date('2025-03-15'),
      effectiveDate: new Date('2025-03-15'),
      status: 'PUBLISHED',
      version: 1
    },
    audience: {
      targetGroups: ['all-citizens', 'community-leaders', 'healthcare-providers'],
      affectedPrograms: ['healthier-sg-digital-platform']
    },
    impact: {
      affectsEnrollment: true,
      affectsBenefits: false,
      affectsEligibility: false,
      requiresAction: false,
    },
    analytics: {
      views: 19634,
      shares: 456,
      engagementScore: 68,
      lastViewed: new Date('2025-04-13')
    },
    notifications: []
  },
  {
    id: 'news-005',
    title: 'Healthier SG Wins International Healthcare Innovation Award',
    subtitle: 'WHO recognizes Singapore\'s preventive care program',
    summary: 'The World Health Organization has awarded Healthier SG the International Healthcare Innovation Award for outstanding achievements in preventive healthcare.',
    content: {
      body: 'The World Health Organization (WHO) has honored Singapore\'s Healthier SG program with the prestigious International Healthcare Innovation Award, recognizing its groundbreaking approach to preventive healthcare and population health management.\n\n**Award Citation:**\n"Healthier SG represents a paradigm shift in healthcare delivery, demonstrating how comprehensive primary care integration, technology-enabled monitoring, and community engagement can achieve unprecedented health outcomes while maintaining cost-effectiveness."\n\n**International Recognition:**\n- First Southeast Asian program to receive this award\n- Recognized for innovative use of AI in health risk assessment\n- Praised for successful public-private healthcare integration\n- Highlighted as a model for aging populations worldwide\n\n**Key Innovation Areas:**\n- AI-powered personalized health recommendations\n- Integration of traditional and modern medicine approaches\n- Community-based health coaching programs\n- Real-time health monitoring and intervention systems\n\n**Global Impact:**\nThe award has generated international interest, with:\n- 15 countries requesting study visits and collaboration\n- WHO including Healthier SG in global best practices database\n- International conferences featuring program success\n- Research partnerships with leading global universities\n\n"This recognition belongs to every Singaporean who has participated in Healthier SG," said Prime Minister Lawrence Wong. "It reflects our collective commitment to building a healthier nation."\n\nThe award ceremony will take place at the WHO headquarters in Geneva on May 15, 2025, where Healthier SG will be featured as a case study for global healthcare innovation.',
      sections: [
        {
          heading: 'Future Expansion Plans',
          content: 'Based on international interest, MOH is exploring partnerships to adapt Healthier SG concepts for other healthcare systems globally.'
        }
      ]
    },
    metadata: {
      author: 'MOH International Relations',
      category: 'PROGRAM_ANNOUNCEMENT',
      priority: 'HIGH',
      tags: ['award', 'international', 'recognition', 'innovation'],
      source: 'MOH International Relations',
      governmentSource: true
    },
    publication: {
      publishedAt: new Date('2025-03-10'),
      effectiveDate: new Date('2025-03-10'),
      status: 'PUBLISHED',
      version: 1
    },
    audience: {
      targetGroups: ['all-citizens', 'international-community', 'media'],
      affectedPrograms: ['healthier-sg-overall']
    },
    impact: {
      affectsEnrollment: true,
      affectsBenefits: false,
      affectsEligibility: false,
      requiresAction: false,
    },
    analytics: {
      views: 67892,
      shares: 3421,
      engagementScore: 91,
      lastViewed: new Date('2025-04-17')
    },
    notifications: []
  }
]

interface ProgramNewsProps extends ProgramInfoComponentProps {
  categoryFilter?: string
  showSearch?: boolean
  showFiltering?: boolean
  maxItems?: number
}

export type { ProgramNewsProps }

export const ProgramNews: React.FC<ProgramNewsProps> = ({
  className = '',
  language = 'en',
  userType = 'citizen',
  isMobile = false,
  showGovernmentDisclaimer = true,
  enableAnalytics = true,
  categoryFilter = 'all',
  showSearch = true,
  showFiltering = true,
  maxItems = undefined
}) => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryFilter)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'priority'>('recent')
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([])
  const [activeTab, setActiveTab] = useState('all')
  const [bookmarkedItems, setBookmarkedItems] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  const categories = [
    { id: 'all', name: 'All News', icon: <Globe className="h-4 w-4" /> },
    { id: 'POLICY_UPDATE', name: 'Policy Updates', icon: <FileText className="h-4 w-4" /> },
    { id: 'PROGRAM_ANNOUNCEMENT', name: 'Program News', icon: <Newspaper className="h-4 w-4" /> },
    { id: 'ENROLLMENT', name: 'Enrollment', icon: <Users className="h-4 w-4" /> },
    { id: 'HEALTH_TIPS', name: 'Health Tips', icon: <Heart className="h-4 w-4" /> },
    { id: 'COMPLIANCE', name: 'Compliance', icon: <Shield className="h-4 w-4" /> },
    { id: 'TECHNICAL', name: 'Technical', icon: <Zap className="h-4 w-4" /> }
  ]

  useEffect(() => {
    const loadNews = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 600))
      setNewsItems(mockNewsItems)
      setLoading(false)
    }
    loadNews()
  }, [])

  useEffect(() => {
    let filtered = newsItems

    // Filter by category
    if (activeTab !== 'all') {
      filtered = filtered.filter(item => item.metadata.category === activeTab)
    } else if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.metadata.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.subtitle?.toLowerCase().includes(query) ||
        item.summary.toLowerCase().includes(query) ||
        item.metadata.tags.some(tag => tag.toLowerCase().includes(query)) ||
        item.content.body.toLowerCase().includes(query)
      )
    }

    // Sort news items
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.publication.publishedAt).getTime() - new Date(a.publication.publishedAt).getTime()
        case 'popular':
          return b.analytics.views - a.analytics.views
        case 'priority':
          const priorityOrder = { URGENT: 3, HIGH: 2, MEDIUM: 1, LOW: 0 }
          return priorityOrder[b.metadata.priority] - priorityOrder[a.metadata.priority]
        default:
          return 0
      }
    })

    // Limit results if specified
    if (maxItems) {
      filtered = filtered.slice(0, maxItems)
    }

    setFilteredNews(filtered)
  }, [newsItems, activeTab, selectedCategory, searchQuery, sortBy, maxItems])

  const toggleBookmark = (newsId: string) => {
    const newBookmarks = new Set(bookmarkedItems)
    if (newBookmarks.has(newsId)) {
      newBookmarks.delete(newsId)
    } else {
      newBookmarks.add(newsId)
    }
    setBookmarkedItems(newBookmarks)
    
    // Track analytics
    if (enableAnalytics) {
      console.log('News bookmarked:', {
        newsId,
        timestamp: new Date().toISOString()
      })
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'HIGH':
        return <TrendingUp className="h-4 w-4 text-orange-500" />
      case 'MEDIUM':
        return <Bell className="h-4 w-4 text-blue-500" />
      case 'LOW':
        return <Clock className="h-4 w-4 text-gray-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const getCategoryColor = (category: string) => {
    const colorMap: Record<string, string> = {
      'POLICY_UPDATE': 'bg-blue-100 text-blue-800',
      'PROGRAM_ANNOUNCEMENT': 'bg-green-100 text-green-800',
      'ENROLLMENT': 'bg-purple-100 text-purple-800',
      'HEALTH_TIPS': 'bg-red-100 text-red-800',
      'COMPLIANCE': 'bg-orange-100 text-orange-800',
      'TECHNICAL': 'bg-gray-100 text-gray-800'
    }
    return colorMap[category] || 'bg-gray-100 text-gray-800'
  }

  const formatRelativeTime = (date: Date) => {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className={`container mx-auto p-6 ${className}`}>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Healthier SG News & Updates</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Stay informed with the latest news, policy updates, and announcements 
            from Singapore's Healthier SG program.
          </p>
        </div>

        {/* Search and Filter Controls */}
        {(showSearch || showFiltering) && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {showSearch && (
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Search news... (e.g., 'enrollment', 'screening', 'policy')"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                )}
                
                {showFiltering && (
                  <div className="flex gap-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="recent">Most Recent</option>
                      <option value="popular">Most Popular</option>
                      <option value="priority">Priority</option>
                    </select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Category Tabs */}
        <div className="mb-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-8">
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id} className="text-xs">
                  <span className="mr-1">{category.icon}</span>
                  <span className="hidden sm:inline">{category.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Featured News */}
        {filteredNews.length > 0 && filteredNews[0].metadata.priority === 'URGENT' && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center text-red-800">
                <AlertCircle className="h-5 w-5 mr-2" />
                Urgent Announcement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredNews.filter(item => item.metadata.priority === 'URGENT').slice(0, 1).map((item) => (
                  <div key={item.id}>
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-red-700 mb-4">{item.summary}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-red-600">
                          {formatRelativeTime(item.publication.publishedAt)}
                        </span>
                        <Badge className={getCategoryColor(item.metadata.category)}>
                          {item.metadata.category.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Bookmark className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                        <Button size="sm">
                          Read More
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* News Feed */}
        <div className="space-y-6">
          {filteredNews.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getPriorityIcon(item.metadata.priority)}
                        <Badge className={getCategoryColor(item.metadata.category)}>
                          {item.metadata.category.replace('_', ' ')}
                        </Badge>
                        {item.metadata.governmentSource && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <Shield className="h-3 w-3 mr-1" />
                            Official
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                      {item.subtitle && (
                        <p className="text-lg text-gray-700 mb-3">{item.subtitle}</p>
                      )}
                      <p className="text-gray-600">{item.summary}</p>
                    </div>
                  </div>

                  {/* Meta Information */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatRelativeTime(item.publication.publishedAt)}
                      </div>
                      <div className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {item.analytics.views.toLocaleString()} views
                      </div>
                      <div className="flex items-center">
                        <Share2 className="h-4 w-4 mr-1" />
                        {item.analytics.shares} shares
                      </div>
                      {item.impact.requiresAction && (
                        <Badge variant="destructive" className="text-xs">
                          Action Required
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleBookmark(item.id)}
                      >
                        <Bookmark className={`h-4 w-4 ${bookmarkedItems.has(item.id) ? 'fill-current' : ''}`} />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button size="sm">
                        Read More
                        <ExternalLink className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {item.metadata.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Quick Actions */}
                  {item.impact.requiresAction && item.impact.actionDeadline && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <Bell className="h-5 w-5 text-blue-600 mr-2" />
                        <div className="flex-1">
                          <div className="font-medium text-blue-900">Action Required</div>
                          <div className="text-sm text-blue-700">
                            Deadline: {item.impact.actionDeadline.toLocaleDateString()}
                          </div>
                        </div>
                        <Button size="sm">
                          Take Action
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredNews.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Newspaper className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No news found</h3>
              <p className="text-gray-600 mb-6">
                We couldn't find any news matching your criteria. Try adjusting your search or filters.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => {
                  setSearchQuery('')
                  setActiveTab('all')
                  setSelectedCategory('all')
                }}>
                  Clear All Filters
                </Button>
                <Button variant="outline" onClick={() => setActiveTab('all')}>
                  View All News
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Newsletter Signup */}
        {!isMobile && (
          <Card className="mt-12 bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Stay Updated with Healthier SG
                </h3>
                <p className="text-gray-600 mb-6">
                  Get the latest news and updates delivered to your inbox
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                  <Input 
                    type="email" 
                    placeholder="Enter your email"
                    className="flex-1"
                  />
                  <Button>
                    <Bell className="h-4 w-4 mr-2" />
                    Subscribe
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contact Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageCircle className="h-5 w-5 mr-2" />
              Media & Press Inquiries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Media Relations</h4>
                <p className="text-sm text-gray-600 mb-2">
                  For media inquiries and press releases
                </p>
                <p className="text-sm">
                  <strong>Email:</strong> media@moh.gov.sg<br/>
                  <strong>Phone:</strong> 1800-850-8000
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">General Public</h4>
                <p className="text-sm text-gray-600 mb-2">
                  For general questions and feedback
                </p>
                <p className="text-sm">
                  <strong>Email:</strong> info@healthiersg.gov.sg<br/>
                  <strong>Phone:</strong> 1800-HEALTHIER
                </p>
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
                <Shield className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Official Government Communications</span>
              </div>
              <p className="text-sm text-gray-600">
                All news and updates are published by the Ministry of Health (MOH), Singapore. 
                For official statements and current information, please visit{' '}
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