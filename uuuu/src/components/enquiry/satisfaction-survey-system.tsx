"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Star, 
  Send, 
  BarChart3, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  Clock, 
  Mail, 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown, 
  Meh,
  PieChart,
  Target,
  Award,
  AlertCircle,
  Calendar,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react'
import { 
  SatisfactionSurvey,
  SatisfactionMetrics,
  SurveyTemplate,
  SurveyResponse,
  NPSScore,
  FeedbackAnalysis,
  SurveyAnalytics,
  QualityMetrics
} from './types'

// NPS Score Calculator
function NPSScoreCard({ score, responses, trend }: { score: number, responses: number, trend: 'up' | 'down' | 'stable' }) {
  const getScoreColor = (nps: number) => {
    if (nps >= 50) return 'text-green-600'
    if (nps >= 0) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreLabel = (nps: number) => {
    if (nps >= 50) return 'Excellent'
    if (nps >= 0) return 'Good'
    return 'Needs Improvement'
  }

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down': return <TrendingUp className="h-4 w-4 text-red-600 transform rotate-180" />
      default: return <BarChart3 className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-600">Net Promoter Score</CardTitle>
          {getTrendIcon()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold mb-1">
          <span className={getScoreColor(score)}>{score}</span>
          <span className="text-sm text-gray-500 font-normal">/100</span>
        </div>
        <p className={`text-sm font-medium ${getScoreColor(score)}`}>
          {getScoreLabel(score)}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Based on {responses} responses
        </p>
      </CardContent>
    </Card>
  )
}

// Survey Builder Interface
interface SurveyBuilderProps {
  onSave: (template: Omit<SurveyTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usage'>) => void
  existingTemplate?: SurveyTemplate
}

function SurveyBuilder({ onSave, existingTemplate }: SurveyBuilderProps) {
  const [template, setTemplate] = useState<Omit<SurveyTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usage'>>(
    existingTemplate || {
      name: '',
      subject: 'How was your experience with us?',
      message: 'We value your feedback. Please take a moment to rate your experience.',
      questions: [
        {
          id: '1',
          type: 'rating',
          question: 'How satisfied are you with the response time?',
          required: true,
          scale: { min: 1, max: 5, labels: ['Very Dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very Satisfied'] }
        }
      ],
      isActive: true
    }
  )
  const [isEditingQuestion, setIsEditingQuestion] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState(false)

  const questionTypes = [
    { value: 'rating', label: 'Star Rating (1-5)' },
    { value: 'text', label: 'Open Text' },
    { value: 'multiple_choice', label: 'Multiple Choice' },
    { value: 'boolean', label: 'Yes/No' },
    { value: 'nps', label: 'NPS (0-10)' }
  ]

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now().toString(),
      type: 'rating' as const,
      question: 'New question',
      required: false,
      scale: { min: 1, max: 5, labels: ['1', '2', '3', '4', '5'] }
    }
    setTemplate(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }))
  }

  const updateQuestion = (questionId: string, updates: Partial<SurveyTemplate['questions'][0]>) => {
    setTemplate(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? { ...q, ...updates } : q
      )
    }))
  }

  const removeQuestion = (questionId: string) => {
    setTemplate(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Survey Builder</h2>
          <p className="text-gray-600">Create and customize customer satisfaction surveys</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? 'Edit' : 'Preview'}
          </Button>
          <Button 
            onClick={() => onSave(template)}
            disabled={!template.name || template.questions.length === 0}
          >
            Save Survey
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Builder Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Survey Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="survey-name">Survey Name</Label>
              <Input
                id="survey-name"
                value={template.name}
                onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Post-Resolution Feedback Survey"
              />
            </div>
            
            <div>
              <Label htmlFor="survey-subject">Email Subject</Label>
              <Input
                id="survey-subject"
                value={template.subject}
                onChange={(e) => setTemplate(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="How was your experience with us?"
              />
            </div>

            <div>
              <Label htmlFor="survey-message">Invitation Message</Label>
              <Textarea
                id="survey-message"
                value={template.message}
                onChange={(e) => setTemplate(prev => ({ ...prev, message: e.target.value }))}
                rows={3}
                placeholder="We value your feedback. Please take a moment to rate your experience."
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="survey-active">Survey Status</Label>
              <Select 
                value={template.isActive ? 'active' : 'inactive'}
                onValueChange={(value) => setTemplate(prev => ({ ...prev, isActive: value === 'active' }))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Questions Panel */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Survey Questions</CardTitle>
              <Button onClick={addQuestion} size="sm">
                Add Question
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {template.questions.map((question, index) => (
                  <div key={question.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-sm font-medium text-gray-500">Question {index + 1}</span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsEditingQuestion(question.id)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeQuestion(question.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{question.type}</Badge>
                        {question.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                      </div>
                      <p className="font-medium">{question.question}</p>
                      
                      {question.type === 'rating' && question.scale && (
                        <div className="flex items-center gap-1 mt-2">
                          {Array.from({ length: question.scale.max - question.scale.min + 1 }, (_, i) => (
                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                          <span className="text-sm text-gray-600 ml-2">
                            ({question.scale.labels[0]} to {question.scale.labels[question.scale.labels.length - 1]})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Survey Preview */}
      {previewMode && (
        <Card>
          <CardHeader>
            <CardTitle>Survey Preview</CardTitle>
            <CardDescription>How your survey will appear to customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold">{template.subject}</h3>
                <p className="text-gray-600">{template.message}</p>
              </div>
              
              <div className="space-y-4">
                {template.questions.map((question, index) => (
                  <div key={question.id} className="border rounded-lg p-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-500">Q{index + 1}</span>
                        {question.required && <span className="text-red-500">*</span>}
                      </div>
                      <p className="font-medium">{question.question}</p>
                      
                      {question.type === 'rating' && (
                        <div className="flex items-center gap-2">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star key={i} className="h-6 w-6 fill-gray-200 text-gray-200 cursor-pointer hover:fill-yellow-400 hover:text-yellow-400" />
                          ))}
                        </div>
                      )}
                      
                      {question.type === 'text' && (
                        <Textarea placeholder="Your response..." rows={3} disabled />
                      )}
                      
                      {question.type === 'boolean' && (
                        <div className="flex gap-4">
                          <Button variant="outline" size="sm" disabled>Yes</Button>
                          <Button variant="outline" size="sm" disabled>No</Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-center">
                <Button disabled>Submit Survey</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Satisfaction Analytics Dashboard
function SatisfactionAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('30d')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const mockData = {
    nps: {
      score: 73,
      responses: 342,
      trend: 'up' as const,
      promoters: 78,
      passives: 21,
      detractors: 15
    },
    satisfaction: {
      overall: 4.2,
      responseTime: 4.1,
      problemResolution: 4.3,
      communication: 4.0
    },
    surveyMetrics: {
      totalSent: 487,
      responseRate: 68,
      averageCompletionTime: '3.2 minutes',
      dropOffRate: 12
    },
    feedback: [
      { theme: 'Response Speed', positive: 85, negative: 15 },
      { theme: 'Staff Professionalism', positive: 92, negative: 8 },
      { theme: 'Problem Resolution', positive: 78, negative: 22 },
      { theme: 'Communication Quality', positive: 81, negative: 19 }
    ]
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate API call
    setTimeout(() => setIsRefreshing(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Satisfaction Analytics</h2>
          <p className="text-gray-600">Track customer satisfaction metrics and feedback trends</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <NPSScoreCard 
          score={mockData.nps.score}
          responses={mockData.nps.responses}
          trend={mockData.nps.trend}
        />
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overall Satisfaction</p>
                <p className="text-2xl font-bold">{mockData.satisfaction.overall}/5</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Survey Response Rate</p>
                <p className="text-2xl font-bold">{mockData.surveyMetrics.responseRate}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Responses</p>
                <p className="text-2xl font-bold">{mockData.nps.responses}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Satisfaction Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Satisfaction by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(mockData.satisfaction).map(([category, score]) => (
                <div key={category} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize">{category.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="font-medium">{score}/5</span>
                  </div>
                  <Progress value={(score / 5) * 100} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              NPS Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Promoters (9-10)</span>
                </div>
                <div className="text-right">
                  <span className="font-medium">{mockData.nps.promoters}%</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${mockData.nps.promoters}%` }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Meh className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">Passives (7-8)</span>
                </div>
                <div className="text-right">
                  <span className="font-medium">{mockData.nps.passives}%</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ width: `${mockData.nps.passives}%` }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ThumbsDown className="h-4 w-4 text-red-600" />
                  <span className="text-sm">Detractors (0-6)</span>
                </div>
                <div className="text-right">
                  <span className="font-medium">{mockData.nps.detractors}%</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ width: `${mockData.nps.detractors}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Feedback Theme Analysis
          </CardTitle>
          <CardDescription>
            Sentiment analysis of customer feedback by theme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockData.feedback.map((feedback) => (
              <div key={feedback.theme} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{feedback.theme}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${feedback.positive}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-green-600">
                      {feedback.positive}% positive
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-500 rounded" />
                    <span>Positive</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-500 rounded" />
                    <span>Negative</span>
                  </div>
                  <span className="ml-auto">
                    {feedback.positive}% / {feedback.negative}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Survey Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Survey Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{mockData.surveyMetrics.totalSent}</div>
              <div className="text-sm text-gray-600">Surveys Sent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{mockData.surveyMetrics.responseRate}%</div>
              <div className="text-sm text-gray-600">Response Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{mockData.surveyMetrics.averageCompletionTime}</div>
              <div className="text-sm text-gray-600">Avg. Completion</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{mockData.surveyMetrics.dropOffRate}%</div>
              <div className="text-sm text-gray-600">Drop-off Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Survey Management System
function SurveyManagementSystem() {
  const [activeTab, setActiveTab] = useState('analytics')
  const [surveys, setSurveys] = useState<SatisfactionSurvey[]>([
    {
      id: '1',
      enquiryId: 'enq-123',
      enquirySubject: 'Appointment booking inquiry',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      status: 'RESPONDED',
      sentAt: new Date(Date.now() - 86400000),
      respondedAt: new Date(Date.now() - 3600000),
      overallRating: 5,
      responseTimeRating: 4,
      problemResolutionRating: 5,
      communicationRating: 5,
      recommendationLikelihood: 9,
      feedback: 'Excellent service, very quick response time.',
      followUpRequired: false,
      problemResolved: true,
      responseQuality: 'excellent',
      surveyTemplate: 'default'
    },
    {
      id: '2',
      enquiryId: 'enq-456',
      enquirySubject: 'Complaint about service',
      customerName: 'Jane Smith',
      customerEmail: 'jane@example.com',
      status: 'SENT',
      sentAt: new Date(),
      overallRating: 3,
      responseTimeRating: 3,
      problemResolutionRating: 2,
      communicationRating: 4,
      recommendationLikelihood: 6,
      followUpRequired: true,
      problemResolved: false,
      responseQuality: 'fair',
      surveyTemplate: 'default'
    }
  ])

  return (
    <div className="space-y-6">
      <div className="border-b">
        <h1 className="text-3xl font-bold">Satisfaction Survey & Feedback System</h1>
        <p className="text-gray-600 mt-2">
          Comprehensive customer satisfaction tracking with automated surveys and feedback analysis
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="surveys">Survey Management</TabsTrigger>
          <TabsTrigger value="builder">Survey Builder</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          <SatisfactionAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="surveys" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Survey Management</h2>
              <p className="text-gray-600">Monitor and manage customer satisfaction surveys</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {surveys.map(survey => (
              <Card key={survey.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium">{survey.customerName}</h3>
                        <Badge variant={survey.status === 'RESPONDED' ? 'default' : 'secondary'}>
                          {survey.status.toLowerCase()}
                        </Badge>
                        {survey.followUpRequired && (
                          <Badge variant="destructive" className="text-xs">
                            Follow-up Required
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        Enquiry: {survey.enquirySubject}
                      </p>
                      {survey.respondedAt && (
                        <p className="text-sm text-gray-500">
                          Responded: {survey.respondedAt.toLocaleDateString()} at {survey.respondedAt.toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                    <div className="text-right space-y-2">
                      {survey.overallRating && (
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${i < survey.overallRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                            />
                          ))}
                          <span className="text-sm text-gray-600 ml-2">
                            {survey.overallRating}/5
                          </span>
                        </div>
                      )}
                      {survey.recommendationLikelihood && (
                        <div className="text-sm">
                          <span className="text-gray-600">NPS: </span>
                          <span className="font-medium">{survey.recommendationLikelihood}/10</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {survey.feedback && (
                    <div className="mt-4 p-3 bg-gray-50 rounded">
                      <p className="text-sm italic">"{survey.feedback}"</p>
                    </div>
                  )}

                  <div className="mt-4 flex justify-between items-center">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">View Details</Button>
                      {survey.status === 'SENT' && (
                        <Button variant="outline" size="sm">Send Reminder</Button>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {survey.problemResolved ? (
                        <span className="text-green-600">✓ Problem Resolved</span>
                      ) : (
                        <span className="text-orange-600">⚠ Follow-up Needed</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="builder">
          <SurveyBuilder
            onSave={(template) => console.log('Save survey template:', template)}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export { SurveyManagementSystem, SurveyBuilder, SatisfactionAnalyticsDashboard, NPSScoreCard }