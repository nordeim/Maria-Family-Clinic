// Healthier SG Program Information System - Comprehensive Demo
// Sub-Phase 8.5: Complete Implementation Showcase

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  BookOpen, 
  Users, 
  Heart, 
  Shield,
  Calculator,
  Star,
  FileText,
  Clock,
  Search,
  Download,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Info,
  Lightbulb,
  ArrowRight,
  BarChart3,
  Globe,
  Phone,
  Mail,
  ExternalLink,
  Play,
  Award,
  Target,
  MessageSquare
} from 'lucide-react'

// Import all enhanced components
import {
  HealthierSGOverview,
  BenefitExplanation,
  ProgramComparisonTool,
  SuccessStories,
  ProgramTimeline,
  FAQSection,
  ResourceDownload,
  ProgramNews,
  ProgramGuide,
  InteractiveGuide,
  ProgramInfoComponentProps
} from './index'

// Import content management engines
import { createFAQSearchEngine } from './content-management/faq-search'
import { createValidationEngine } from './content-management/content-validation'
import { createVersionControl } from './content-management/version-control'
import { createAnalyticsEngine } from './content-management/analytics'
import { createComplianceDashboard } from './content-management/content-validation'

interface DemoData {
  analytics: any
  compliance: any
  searchMetrics: any
  versionHistory: any
}

const HealthierSGProgramInfoDemo: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState('overview')
  const [demoData, setDemoData] = useState<DemoData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeDemo = async () => {
      setLoading(true)
      
      // Initialize all content management engines
      const analyticsEngine = createAnalyticsEngine()
      const validationEngine = createValidationEngine()
      const versionControl = createVersionControl()
      const complianceDashboard = createComplianceDashboard()
      
      // Simulate system-wide analytics
      const dashboardData = analyticsEngine.getDashboardData('week')
      const complianceReport = {
        totalItems: 156,
        compliantItems: 142,
        partiallyCompliantItems: 11,
        nonCompliantItems: 3,
        commonIssues: [
          { issue: 'Missing alt text on images', count: 8, severity: 'warning' },
          { issue: 'External links without disclaimer', count: 5, severity: 'warning' },
          { issue: 'Reading level too complex', count: 3, severity: 'info' }
        ],
        recommendations: [
          'Implement automated content validation in the content creation workflow',
          'Schedule regular compliance audits with healthcare professionals',
          'Provide content creators with comprehensive guidelines and training'
        ]
      }
      
      const searchMetrics = {
        totalSearches: 2847,
        popularQueries: [
          { query: 'eligibility', count: 423, avgTime: 1.2 },
          { query: 'cost', count: 389, avgTime: 0.8 },
          { query: 'screening', count: 312, avgTime: 1.5 },
          { query: 'enrollment', count: 267, avgTime: 1.1 },
          { query: 'benefits', count: 234, avgTime: 0.9 }
        ],
        searchSuccessRate: 0.87,
        avgSearchTime: 1.1
      }
      
      setDemoData({
        analytics: dashboardData,
        compliance: complianceReport,
        searchMetrics,
        versionHistory: versionControl.getVersionHistory('overview-001')
      })
      
      setLoading(false)
    }
    
    initializeDemo()
  }, [])

  const renderSystemMetrics = () => {
    if (!demoData) return null
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Content Views</p>
                <p className="text-2xl font-bold text-blue-600">
                  {demoData.analytics.summary.totalViews.toLocaleString()}
                </p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Compliance Rate</p>
                <p className="text-2xl font-bold text-green-600">
                  {Math.round((demoData.compliance.compliantItems / demoData.compliance.totalItems) * 100)}%
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">FAQ Searches</p>
                <p className="text-2xl font-bold text-purple-600">
                  {demoData.searchMetrics.totalSearches.toLocaleString()}
                </p>
              </div>
              <Search className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">User Engagement</p>
                <p className="text-2xl font-bold text-orange-600">
                  {Math.round(demoData.analytics.summary.averageSessionDuration / 60)}m
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderComplianceDashboard = () => {
    if (!demoData) return null
    
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-blue-600" />
            Content Management Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Compliance Status */}
            <div>
              <h3 className="font-semibold mb-3">Compliance Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                    <span className="font-medium">Fully Compliant</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    {demoData.compliance.compliantItems} items
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
                    <span className="font-medium">Partially Compliant</span>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    {demoData.compliance.partiallyCompliantItems} items
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                    <span className="font-medium">Non-Compliant</span>
                  </div>
                  <Badge className="bg-red-100 text-red-800">
                    {demoData.compliance.nonCompliantItems} items
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Search Analytics */}
            <div>
              <h3 className="font-semibold mb-3">Search Analytics</h3>
              <div className="space-y-2">
                {demoData.searchMetrics.popularQueries.slice(0, 3).map((query, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">{query.query}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-600">{query.count} searches</span>
                      <Badge variant="secondary" className="text-xs">
                        {query.avgTime}s avg
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-xs text-gray-600">
                Success Rate: {Math.round(demoData.searchMetrics.searchSuccessRate * 100)}%
              </div>
            </div>
          </div>
          
          {/* Recommendations */}
          <div className="mt-6">
            <h3 className="font-semibold mb-3 flex items-center">
              <Lightbulb className="h-4 w-4 mr-2 text-yellow-600" />
              Recommendations
            </h3>
            <div className="space-y-2">
              {demoData.compliance.recommendations.slice(0, 2).map((rec, index) => (
                <div key={index} className="flex items-start p-3 bg-blue-50 rounded-lg">
                  <Info className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const componentProps: ProgramInfoComponentProps = {
    language: 'en',
    userType: 'citizen',
    isMobile: false,
    showGovernmentDisclaimer: true,
    enableAnalytics: true
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Healthier SG Program Information System...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              Healthier SG Program Information System
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-6">
              Comprehensive content management and intelligent information system for Singapore's national health program. 
              Featuring government-compliant content, intelligent search, and user education tools.
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Government Compliant
              </div>
              <div className="flex items-center">
                <Globe className="h-4 w-4 mr-2" />
                Multi-language Support
              </div>
              <div className="flex items-center">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics Enabled
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                User-Focused Design
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* System Metrics */}
        {renderSystemMetrics()}
        
        {/* Compliance Dashboard */}
        {renderComplianceDashboard()}

        {/* Demo Navigation */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Interactive Components Demo</CardTitle>
            <p className="text-gray-600">
              Explore the comprehensive Healthier SG program information system with enhanced content management, 
              intelligent search, and user education features.
            </p>
          </CardHeader>
          <CardContent>
            <Tabs value={activeDemo} onValueChange={setActiveDemo} className="w-full">
              <TabsList className="grid w-full grid-cols-5 lg:grid-cols-9">
                <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                <TabsTrigger value="benefits" className="text-xs">Benefits</TabsTrigger>
                <TabsTrigger value="guide" className="text-xs">Guide</TabsTrigger>
                <TabsTrigger value="faq" className="text-xs">FAQ</TabsTrigger>
                <TabsTrigger value="interactive" className="text-xs">Interactive</TabsTrigger>
                <TabsTrigger value="timeline" className="text-xs">Timeline</TabsTrigger>
                <TabsTrigger value="stories" className="text-xs">Stories</TabsTrigger>
                <TabsTrigger value="resources" className="text-xs">Resources</TabsTrigger>
                <TabsTrigger value="news" className="text-xs">News</TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <TabsContent value="overview" className="mt-0">
                  <div className="space-y-6">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Comprehensive program overview with key statistics, testimonials, and next steps.
                      </AlertDescription>
                    </Alert>
                    <HealthierSGOverview {...componentProps} />
                  </div>
                </TabsContent>

                <TabsContent value="benefits" className="mt-0">
                  <div className="space-y-6">
                    <Alert>
                      <Calculator className="h-4 w-4" />
                      <AlertDescription>
                        Interactive benefit explanation with visual guides and calculation tools.
                      </AlertDescription>
                    </Alert>
                    <BenefitExplanation {...componentProps} />
                  </div>
                </TabsContent>

                <TabsContent value="guide" className="mt-0">
                  <div className="space-y-6">
                    <Alert>
                      <BookOpen className="h-4 w-4" />
                      <AlertDescription>
                        Step-by-step program walkthrough with progressive disclosure and interactive elements.
                      </AlertDescription>
                    </Alert>
                    <ProgramGuide {...componentProps} />
                  </div>
                </TabsContent>

                <TabsContent value="faq" className="mt-0">
                  <div className="space-y-6">
                    <Alert>
                      <Search className="h-4 w-4" />
                      <AlertDescription>
                        Intelligent FAQ system with fuzzy matching, categorization, and government compliance validation.
                      </AlertDescription>
                    </Alert>
                    <FAQSection 
                      {...componentProps}
                      showSearch={true}
                      showFeedback={true}
                      maxQuestions={undefined}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="interactive" className="mt-0">
                  <div className="space-y-6">
                    <Alert>
                      <Play className="h-4 w-4" />
                      <AlertDescription>
                        Interactive enrollment guide with forms, calculators, and progress tracking.
                      </AlertDescription>
                    </Alert>
                    <InteractiveGuide 
                      {...componentProps}
                      guideId="enrollment-guide"
                      showProgress={true}
                      allowResume={true}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="timeline" className="mt-0">
                  <div className="space-y-6">
                    <Alert>
                      <Clock className="h-4 w-4" />
                      <AlertDescription>
                        Program timeline with milestones, deadlines, and progress tracking.
                      </AlertDescription>
                    </Alert>
                    <ProgramTimeline {...componentProps} />
                  </div>
                </TabsContent>

                <TabsContent value="stories" className="mt-0">
                  <div className="space-y-6">
                    <Alert>
                      <Heart className="h-4 w-4" />
                      <AlertDescription>
                        Success stories and testimonials with program participant journeys and outcomes.
                      </AlertDescription>
                    </Alert>
                    <SuccessStories {...componentProps} />
                  </div>
                </TabsContent>

                <TabsContent value="resources" className="mt-0">
                  <div className="space-y-6">
                    <Alert>
                      <Download className="h-4 w-4" />
                      <AlertDescription>
                        Downloadable guides, PDFs, and educational materials with accessibility features.
                      </AlertDescription>
                    </Alert>
                    <ResourceDownload {...componentProps} />
                  </div>
                </TabsContent>

                <TabsContent value="news" className="mt-0">
                  <div className="space-y-6">
                    <Alert>
                      <FileText className="h-4 w-4" />
                      <AlertDescription>
                        Program news and updates with official announcements and government communications.
                      </AlertDescription>
                    </Alert>
                    <ProgramNews {...componentProps} />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <Search className="h-8 w-8 text-blue-600 mr-3" />
                <h3 className="font-semibold text-lg">Intelligent Search</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Advanced FAQ search with fuzzy matching, keyword highlighting, and intelligent recommendations.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Fuzzy string matching</li>
                <li>• Real-time suggestions</li>
                <li>• Category filtering</li>
                <li>• Government verification</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <Shield className="h-8 w-8 text-green-600 mr-3" />
                <h3 className="font-semibold text-lg">Compliance Validation</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Automated content validation ensuring government compliance and medical accuracy.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• MOH guidelines compliance</li>
                <li>• Medical expert review</li>
                <li>• Accessibility standards</li>
                <li>• Source attribution</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <BarChart3 className="h-8 w-8 text-purple-600 mr-3" />
                <h3 className="font-semibold text-lg">Analytics & Insights</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Comprehensive analytics tracking user engagement and content performance.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• User engagement tracking</li>
                <li>• Content performance metrics</li>
                <li>• A/B testing support</li>
                <li>• Performance recommendations</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <Globe className="h-8 w-8 text-orange-600 mr-3" />
                <h3 className="font-semibold text-lg">Multi-Language Support</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Content framework prepared for Singapore's official languages and accessibility features.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• English, Chinese, Malay, Tamil</li>
                <li>• Screen reader compatibility</li>
                <li>• High contrast support</li>
                <li>• Keyboard navigation</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <Play className="h-8 w-8 text-red-600 mr-3" />
                <h3 className="font-semibold text-lg">Interactive Education</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Step-by-step guides with interactive elements and progressive disclosure.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Progressive disclosure</li>
                <li>• Interactive forms & calculators</li>
                <li>• Progress tracking</li>
                <li>• Bookmark & resume</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <Users className="h-8 w-8 text-indigo-600 mr-3" />
                <h3 className="font-semibold text-lg">User-Centered Design</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Mobile-first responsive design optimized for accessibility and ease of use.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Mobile-first approach</li>
                <li>• WCAG 2.2 AA compliant</li>
                <li>• Touch-optimized interface</li>
                <li>• Fast content loading</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Implementation Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle2 className="h-5 w-5 mr-2 text-green-600" />
              Implementation Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">✅ Completed Features</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                    Comprehensive program information architecture
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                    Intelligent FAQ search with fuzzy matching
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                    Content validation and compliance system
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                    Version control and workflow management
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                    Analytics and performance tracking
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                    Interactive guide with progressive disclosure
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                    Mobile-responsive design with accessibility
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                    Government-compliant content framework
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">🎯 Key Benefits</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center">
                    <Award className="h-4 w-4 text-blue-600 mr-2" />
                    Improved user engagement through interactive features
                  </li>
                  <li className="flex items-center">
                    <Award className="h-4 w-4 text-blue-600 mr-2" />
                    Enhanced content discoverability via intelligent search
                  </li>
                  <li className="flex items-center">
                    <Award className="h-4 w-4 text-blue-600 mr-2" />
                    Government compliance through automated validation
                  </li>
                  <li className="flex items-center">
                    <Award className="h-4 w-4 text-blue-600 mr-2" />
                    Data-driven content optimization via analytics
                  </li>
                  <li className="flex items-center">
                    <Award className="h-4 w-4 text-blue-600 mr-2" />
                    Accessibility compliance for inclusive design
                  </li>
                  <li className="flex items-center">
                    <Award className="h-4 w-4 text-blue-600 mr-2" />
                    Scalable content management infrastructure
                  </li>
                  <li className="flex items-center">
                    <Award className="h-4 w-4 text-blue-600 mr-2" />
                    Multi-language framework preparation
                  </li>
                  <li className="flex items-center">
                    <Award className="h-4 w-4 text-blue-600 mr-2" />
                    Integration-ready architecture
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Next Steps</h4>
              <p className="text-blue-800 text-sm">
                The content management system is ready for integration with backend services, 
                database implementation, and deployment to production environments. 
                All components are designed with government compliance and user accessibility as primary considerations.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Support Information */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="font-semibold text-lg mb-4">Need Help or Support?</h3>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  24/7 Healthier SG Helpline: 1800-223-1422
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Email: healthier.sg@moh.gov.sg
                </div>
                <div className="flex items-center">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Official Website: www.healthier-sg.gov.sg
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Add missing import for Eye icon
const Eye: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)

export default HealthierSGProgramInfoDemo