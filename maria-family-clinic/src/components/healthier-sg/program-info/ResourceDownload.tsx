// Healthier SG Resource Download Component
// Downloadable guides, materials, and educational resources

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Download, 
  FileText, 
  Play,
  BookOpen,
  Star,
  Filter,
  Search,
  Calendar,
  Eye,
  Users,
  CheckCircle2,
  Clock,
  Globe,
  HardDrive,
  Share2,
  Heart,
  Shield,
  FileIcon,
  Video,
  Image as ImageIcon,
  Headphones,
  ExternalLink,
  AlertCircle,
  TrendingUp
} from 'lucide-react'
import { DownloadableResource, ResourceCategory, ProgramInfoComponentProps } from './types'

// Mock resource data
const mockResourceCategories: ResourceCategory[] = [
  {
    id: 'guides',
    name: 'Program Guides',
    description: 'Comprehensive guides to help you understand and navigate Healthier SG',
    icon: 'book-open',
    resourceCount: 12,
    isActive: true,
    sortOrder: 1
  },
  {
    id: 'forms',
    name: 'Forms & Applications',
    description: 'Official forms and applications for enrollment and services',
    icon: 'file-text',
    resourceCount: 8,
    isActive: true,
    sortOrder: 2
  },
  {
    id: 'checklists',
    name: 'Checklists',
    description: 'Step-by-step checklists to help you complete important tasks',
    icon: 'check',
    resourceCount: 15,
    isActive: true,
    sortOrder: 3
  },
  {
    id: 'education',
    name: 'Educational Materials',
    description: 'Videos, infographics, and interactive content for health education',
    icon: 'play',
    resourceCount: 25,
    isActive: true,
    sortOrder: 4
  },
  {
    id: 'legal',
    name: 'Legal & Compliance',
    description: 'Terms, conditions, privacy policies, and legal information',
    icon: 'shield',
    resourceCount: 6,
    isActive: true,
    sortOrder: 5
  },
  {
    id: 'statistics',
    name: 'Reports & Statistics',
    description: 'Program statistics, performance reports, and data analysis',
    icon: 'chart',
    resourceCount: 10,
    isActive: true,
    sortOrder: 6
  }
]

const mockResources: DownloadableResource[] = [
  {
    id: 'resource-001',
    title: 'Healthier SG Enrollment Guide',
    description: 'Complete step-by-step guide to enrolling in Healthier SG program, including eligibility requirements and application process.',
    category: 'guides',
    type: 'PDF',
    format: {
      language: ['en', 'zh', 'ms', 'ta'],
      fileFormats: ['PDF'],
      accessibility: {
        screenReader: true,
        highContrast: true,
        largeText: true
      }
    },
    downloadUrl: '/downloads/healthier-sg-enrollment-guide.pdf',
    fileSize: 2048000, // 2MB
    lastUpdated: new Date('2025-03-20'),
    version: '3.2',
    governmentVerified: true,
    verifiedBy: 'MOH Communications Team',
    downloadCount: 12847,
    rating: {
      average: 4.8,
      count: 324
    },
    tags: ['enrollment', 'guide', 'eligibility', 'application'],
    relatedTopics: ['enrollment-process', 'eligibility-requirements', 'document-submission'],
    requiresRegistration: false,
    metadata: {
      author: 'MOH Healthier SG Team',
      reviewDate: new Date('2025-03-15'),
      expirationDate: new Date('2025-12-31'),
      keywords: ['healthier sg', 'enrollment', 'guide', 'singapore', 'healthcare', 'government']
    }
  },
  {
    id: 'resource-002',
    title: 'Health Screening Preparation Checklist',
    description: 'Everything you need to know and prepare for your comprehensive health screening appointment.',
    category: 'checklists',
    type: 'PDF',
    format: {
      language: ['en', 'zh', 'ms', 'ta'],
      fileFormats: ['PDF'],
      accessibility: {
        screenReader: true,
        highContrast: true,
        largeText: true
      }
    },
    downloadUrl: '/downloads/screening-preparation-checklist.pdf',
    fileSize: 512000, // 512KB
    lastUpdated: new Date('2025-03-18'),
    version: '2.1',
    governmentVerified: true,
    verifiedBy: 'MOH Health Promotion Board',
    downloadCount: 8943,
    rating: {
      average: 4.6,
      count: 198
    },
    tags: ['screening', 'checklist', 'preparation', 'health-check'],
    relatedTopics: ['health-screening', 'appointment-preparation', 'what-to-expect'],
    requiresRegistration: false,
    metadata: {
      author: 'MOH Health Promotion Board',
      reviewDate: new Date('2025-03-10'),
      keywords: ['screening', 'checklist', 'health check', 'preparation', 'appointment']
    }
  },
  {
    id: 'resource-003',
    title: 'Understanding Your Health Benefits',
    description: 'Interactive guide explaining all Healthier SG benefits, subsidies, and cost savings with calculators.',
    category: 'education',
    type: 'INTERACTIVE',
    format: {
      language: ['en', 'zh', 'ms', 'ta'],
      fileFormats: ['HTML'],
      accessibility: {
        screenReader: true,
        highContrast: true,
        largeText: true
      }
    },
    downloadUrl: '/interactive/benefits-guide.html',
    lastUpdated: new Date('2025-03-25'),
    version: '1.5',
    governmentVerified: true,
    verifiedBy: 'MOH Benefits Team',
    downloadCount: 15632,
    rating: {
      average: 4.9,
      count: 445
    },
    tags: ['benefits', 'interactive', 'calculator', 'subsidies'],
    relatedTopics: ['cost-savings', 'subsidies', 'medisave', 'consultation-fees'],
    requiresRegistration: false,
    metadata: {
      author: 'MOH Benefits Team',
      reviewDate: new Date('2025-03-20'),
      keywords: ['benefits', 'subsidies', 'interactive', 'calculator', 'cost savings']
    }
  },
  {
    id: 'resource-004',
    title: 'Healthier SG Enrollment Application Form',
    description: 'Official application form for Healthier SG enrollment. Complete this form to begin your application process.',
    category: 'forms',
    type: 'FORM',
    format: {
      language: ['en'],
      fileFormats: ['PDF'],
      accessibility: {
        screenReader: true,
        highContrast: true,
        largeText: true
      }
    },
    downloadUrl: '/downloads/enrollment-application-form.pdf',
    fileSize: 768000, // 768KB
    lastUpdated: new Date('2025-03-22'),
    version: '4.0',
    governmentVerified: true,
    verifiedBy: 'MOH Applications Team',
    downloadCount: 22156,
    rating: {
      average: 4.2,
      count: 567
    },
    tags: ['form', 'application', 'enrollment', 'official'],
    relatedTopics: ['enrollment-process', 'required-documents', 'application-status'],
    requiresRegistration: false,
    metadata: {
      author: 'MOH Applications Team',
      reviewDate: new Date('2025-03-18'),
      keywords: ['form', 'application', 'enrollment', 'official document']
    }
  },
  {
    id: 'resource-005',
    title: 'Healthier SG Success Stories Video Series',
    description: 'Inspiring video testimonials from Singaporeans who have transformed their health through Healthier SG.',
    category: 'education',
    type: 'VIDEO',
    format: {
      language: ['en', 'zh', 'ms'],
      fileFormats: ['MP4'],
      accessibility: {
        screenReader: false,
        highContrast: true,
        largeText: false
      }
    },
    downloadUrl: '/downloads/healthier-sg-success-stories.mp4',
    fileSize: 157286400, // 150MB
    lastUpdated: new Date('2025-03-15'),
    version: '1.0',
    governmentVerified: true,
    verifiedBy: 'MOH Communications',
    downloadCount: 7654,
    rating: {
      average: 4.7,
      count: 289
    },
    tags: ['video', 'success-stories', 'testimonials', 'inspiration'],
    relatedTopics: ['participant-journey', 'health-improvements', 'program-impact'],
    requiresRegistration: false,
    metadata: {
      author: 'MOH Communications',
      reviewDate: new Date('2025-03-12'),
      keywords: ['video', 'success stories', 'testimonials', 'participant journey']
    }
  },
  {
    id: 'resource-006',
    title: 'Program Performance Report 2024',
    description: 'Comprehensive annual report on Healthier SG program performance, statistics, and outcomes.',
    category: 'statistics',
    type: 'PDF',
    format: {
      language: ['en'],
      fileFormats: ['PDF'],
      accessibility: {
        screenReader: true,
        highContrast: true,
        largeText: true
      }
    },
    downloadUrl: '/downloads/healthier-sg-performance-report-2024.pdf',
    fileSize: 5242880, // 5MB
    lastUpdated: new Date('2025-02-28'),
    version: '2024.1',
    governmentVerified: true,
    verifiedBy: 'MOH Analytics Team',
    downloadCount: 4321,
    rating: {
      average: 4.4,
      count: 156
    },
    tags: ['report', 'statistics', 'performance', 'data'],
    relatedTopics: ['program-metrics', 'health-outcomes', 'enrollment-statistics'],
    requiresRegistration: false,
    metadata: {
      author: 'MOH Analytics Team',
      reviewDate: new Date('2025-02-25'),
      keywords: ['report', 'statistics', 'performance', 'data analysis', 'annual report']
    }
  }
]

interface ResourceDownloadProps extends ProgramInfoComponentProps {
  categoryFilter?: string
  showSearch?: boolean
  showRatings?: boolean
  maxResults?: number
}

export type { ResourceDownloadProps }

export const ResourceDownload: React.FC<ResourceDownloadProps> = ({
  className = '',
  language = 'en',
  userType = 'citizen',
  isMobile = false,
  showGovernmentDisclaimer = true,
  enableAnalytics = true,
  categoryFilter = 'all',
  showSearch = true,
  showRatings = true,
  maxResults = undefined
}) => {
  const [resources, setResources] = useState<DownloadableResource[]>([])
  const [categories, setCategories] = useState<ResourceCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryFilter)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'rating' | 'name'>('recent')
  const [filteredResources, setFilteredResources] = useState<DownloadableResource[]>([])
  const [activeTab, setActiveTab] = useState('browse')
  const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({})
  const [downloadedResources, setDownloadedResources] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadResources = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 600))
      setResources(mockResources)
      setCategories(mockResourceCategories)
      setLoading(false)
    }
    loadResources()
  }, [])

  useEffect(() => {
    let filtered = resources

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(resource => resource.category === selectedCategory)
    }

    // Filter by language
    filtered = filtered.filter(resource => 
      resource.format.language.includes(language as any)
    )

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(query) ||
        resource.description.toLowerCase().includes(query) ||
        resource.tags.some(tag => tag.toLowerCase().includes(query)) ||
        resource.metadata.keywords.some(keyword => keyword.toLowerCase().includes(query))
      )
    }

    // Sort resources
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
        case 'popular':
          return b.downloadCount - a.downloadCount
        case 'rating':
          return b.rating.average - a.rating.average
        case 'name':
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

    // Limit results if specified
    if (maxResults) {
      filtered = filtered.slice(0, maxResults)
    }

    setFilteredResources(filtered)
  }, [resources, selectedCategory, searchQuery, sortBy, language, maxResults])

  const handleDownload = async (resource: DownloadableResource) => {
    // Simulate download progress
    setDownloadProgress(prev => ({ ...prev, [resource.id]: 0 }))

    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        const current = prev[resource.id] || 0
        if (current >= 100) {
          clearInterval(interval)
          setDownloadedResources(prev => new Set([...prev, resource.id]))
          return { ...prev, [resource.id]: 100 }
        }
        return { ...prev, [resource.id]: current + 10 }
      })
    }, 200)

    // Simulate download completion
    setTimeout(() => {
      clearInterval(interval)
      setDownloadProgress(prev => ({ ...prev, [resource.id]: 100 }))
      setDownloadedResources(prev => new Set([...prev, resource.id]))
      
      // Track analytics
      if (enableAnalytics) {
        console.log('Resource downloaded:', {
          resourceId: resource.id,
          resourceTitle: resource.title,
          category: resource.category,
          timestamp: new Date().toISOString()
        })
      }
    }, 2000)
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'PDF': return <FileText className="h-5 w-5 text-red-600" />
      case 'VIDEO': return <Video className="h-5 w-5 text-blue-600" />
      case 'INTERACTIVE': return <Play className="h-5 w-5 text-green-600" />
      case 'FORM': return <FileIcon className="h-5 w-5 text-purple-600" />
      case 'AUDIO': return <Headphones className="h-5 w-5 text-orange-600" />
      default: return <FileText className="h-5 w-5 text-gray-600" />
    }
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : i < rating 
            ? 'text-yellow-400 fill-current opacity-50' 
            : 'text-gray-300'
        }`}
      />
    ))
  }

  const getLanguageFlags = (languages: string[]) => {
    const flagMap: Record<string, string> = {
      en: '🇬🇧',
      zh: '🇨🇳',
      ms: '🇲🇾',
      ta: '🇮🇳'
    }
    return languages.map(lang => flagMap[lang] || '🌐').join(' ')
  }

  if (loading) {
    return (
      <div className={`container mx-auto p-6 ${className}`}>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Resource Library</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Download comprehensive guides, forms, checklists, and educational materials 
            to help you make the most of Healthier SG.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="browse">Browse Resources</TabsTrigger>
            <TabsTrigger value="search">Search & Filter</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Search className="h-5 w-5 mr-2" />
                  Search Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search and Filter Controls */}
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      type="text"
                      placeholder="Search resources... (e.g., 'enrollment', 'screening', 'benefits')"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="all">All Categories</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="recent">Most Recent</option>
                      <option value="popular">Most Popular</option>
                      <option value="rating">Highest Rated</option>
                      <option value="name">Name A-Z</option>
                    </select>
                  </div>
                </div>

                {/* Quick Filters */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Filter className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium">Quick Filters:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSearchQuery('government verified')}
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      Government Verified
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSearchQuery('multilingual')}
                    >
                      <Globe className="h-3 w-3 mr-1" />
                      Multilingual
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSearchQuery('accessible')}
                    >
                      <Users className="h-3 w-3 mr-1" />
                      Accessible
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSearchQuery('interactive')}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Interactive
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="browse" className="mt-8">
            {/* Category Tabs */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('all')}
                >
                  All Resources ({resources.length})
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <span className="mr-2">
                      {category.icon === 'book-open' && <BookOpen className="h-4 w-4" />}
                      {category.icon === 'file-text' && <FileText className="h-4 w-4" />}
                      {category.icon === 'check' && <CheckCircle2 className="h-4 w-4" />}
                      {category.icon === 'play' && <Play className="h-4 w-4" />}
                      {category.icon === 'shield' && <Shield className="h-4 w-4" />}
                      {category.icon === 'chart' && <TrendingUp className="h-4 w-4" />}
                    </span>
                    {category.name} ({category.resourceCount})
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Results Summary */}
        {(searchQuery || selectedCategory !== 'all') && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">
                    {filteredResources.length} resources found
                  </span>
                  {searchQuery && (
                    <span className="text-gray-600 ml-2">
                      for "{searchQuery}"
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    Sort by:
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="popular">Most Popular</option>
                    <option value="rating">Highest Rated</option>
                    <option value="name">Name A-Z</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <Card key={resource.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(resource.type)}
                    <div>
                      <CardTitle className="text-lg leading-tight">{resource.title}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {resource.type}
                        </Badge>
                        {resource.governmentVerified && (
                          <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 line-clamp-3">
                  {resource.description}
                </p>

                {/* Resource Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {resource.lastUpdated.toLocaleDateString()}
                    </span>
                  </div>
                  
                  {resource.fileSize && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">File Size:</span>
                      <span className="flex items-center">
                        <HardDrive className="h-3 w-3 mr-1" />
                        {formatFileSize(resource.fileSize)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Downloads:</span>
                    <span className="flex items-center">
                      <Download className="h-3 w-3 mr-1" />
                      {resource.downloadCount.toLocaleString()}
                    </span>
                  </div>

                  {showRatings && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Rating:</span>
                      <div className="flex items-center space-x-1">
                        {renderStars(resource.rating.average)}
                        <span className="text-xs text-gray-500 ml-1">
                          ({resource.rating.count})
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Languages:</span>
                    <span className="text-xs">
                      {getLanguageFlags(resource.format.language)}
                    </span>
                  </div>
                </div>

                {/* Accessibility Features */}
                <div>
                  <div className="text-sm font-medium mb-2">Accessibility:</div>
                  <div className="flex flex-wrap gap-1">
                    {resource.format.accessibility.screenReader && (
                      <Badge variant="secondary" className="text-xs">Screen Reader</Badge>
                    )}
                    {resource.format.accessibility.highContrast && (
                      <Badge variant="secondary" className="text-xs">High Contrast</Badge>
                    )}
                    {resource.format.accessibility.largeText && (
                      <Badge variant="secondary" className="text-xs">Large Text</Badge>
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <div className="flex flex-wrap gap-1">
                    {resource.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {resource.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{resource.tags.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  {downloadProgress[resource.id] !== undefined && downloadProgress[resource.id] < 100 && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Downloading...</span>
                        <span>{downloadProgress[resource.id]}%</span>
                      </div>
                      <Progress value={downloadProgress[resource.id]} className="h-2" />
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button
                      className="flex-1"
                      onClick={() => handleDownload(resource)}
                      disabled={downloadedResources.has(resource.id)}
                    >
                      {downloadedResources.has(resource.id) ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Downloaded
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </>
                      )}
                    </Button>
                    
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <Button variant="ghost" size="sm" className="w-full text-blue-600">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View Online
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredResources.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No resources found</h3>
              <p className="text-gray-600 mb-6">
                We couldn't find any resources matching your criteria. Try adjusting your search or filters.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('all')
                }}>
                  Clear All Filters
                </Button>
                <Button variant="outline" onClick={() => setActiveTab('browse')}>
                  Browse All Resources
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Featured Resources */}
        {!searchQuery && selectedCategory === 'all' && (
          <Card className="mt-12">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-5 w-5 mr-2" />
                Popular Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {resources
                  .sort((a, b) => b.downloadCount - a.downloadCount)
                  .slice(0, 4)
                  .map((resource) => (
                    <div key={resource.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-2 mb-2">
                        {getFileIcon(resource.type)}
                        <span className="text-sm font-medium truncate">{resource.title}</span>
                      </div>
                      <div className="text-xs text-gray-600 mb-3">
                        {resource.downloadCount.toLocaleString()} downloads
                      </div>
                      <Button size="sm" variant="outline" className="w-full">
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Card className="mt-12 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Need Help Finding Resources?
              </h3>
              <p className="text-gray-600 mb-6">
                Our support team can help you find the right resources for your specific needs
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild>
                  <a href="/contact">
                    <Users className="h-4 w-4 mr-2" />
                    Contact Support
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/healthier-sg/faq">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Browse FAQ
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
                <Shield className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Official Government Resources</span>
              </div>
              <p className="text-sm text-gray-600">
                All resources are provided by the Ministry of Health (MOH), Singapore. 
                Materials are regularly updated and verified for accuracy. For the latest versions, visit{' '}
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