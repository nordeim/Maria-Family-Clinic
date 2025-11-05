import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  TrendingUp, 
  TrendingDown,
  Send,
  Eye,
  Filter,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  Users
} from 'lucide-react'
import { EnquiryWithDetails, SatisfactionSurvey, SatisfactionMetrics } from './types'
import { format } from 'date-fns'

interface CustomerSatisfactionTrackerProps {
  enquiries: EnquiryWithDetails[]
  satisfactionSurveys?: SatisfactionSurvey[]
  metrics?: SatisfactionMetrics
  onSendSurvey?: (enquiryId: string) => void
  onUpdateSurvey?: (surveyId: string, rating: number, feedback?: string) => void
  loading?: boolean
}

interface SurveyTemplate {
  id: string
  name: string
  subject: string
  message: string
  questions: {
    id: string
    type: 'rating' | 'text' | 'multiple_choice'
    question: string
    required: boolean
    options?: string[]
  }[]
}

const DEFAULT_SURVEY_TEMPLATE: SurveyTemplate = {
  id: 'default',
  name: 'Enquiry Follow-up Survey',
  subject: 'How was your experience with our enquiry service?',
  message: `Dear {customerName},

Thank you for contacting us. We would appreciate your feedback on the service you received.

This survey should take less than 2 minutes to complete.

Best regards,
The Healthcare Team`,
  questions: [
    {
      id: 'overall_satisfaction',
      type: 'rating',
      question: 'How satisfied are you with the overall service you received?',
      required: true
    },
    {
      id: 'response_time',
      type: 'rating',
      question: 'How satisfied are you with our response time?',
      required: true
    },
    {
      id: 'problem_resolution',
      type: 'rating',
      question: 'Was your problem resolved to your satisfaction?',
      required: true
    },
    {
      id: 'communication',
      type: 'rating',
      question: 'How would you rate our communication during the process?',
      required: true
    },
    {
      id: 'recommendation',
      type: 'multiple_choice',
      question: 'How likely are you to recommend our services to others?',
      required: true,
      options: ['Very likely', 'Likely', 'Neutral', 'Unlikely', 'Very unlikely']
    },
    {
      id: 'additional_feedback',
      type: 'text',
      question: 'Do you have any additional comments or suggestions?',
      required: false
    }
  ]
}

export function CustomerSatisfactionTracker({
  enquiries,
  satisfactionSurveys = [],
  metrics,
  onSendSurvey,
  onUpdateSurvey,
  loading = false
}: CustomerSatisfactionTrackerProps) {
  const [selectedSurvey, setSelectedSurvey] = useState<SurveyTemplate | null>(DEFAULT_SURVEY_TEMPLATE)
  const [activeTab, setActiveTab] = useState<'overview' | 'surveys' | 'feedback' | 'analytics'>('overview')
  const [filterStatus, setFilterStatus] = useState<'all' | 'sent' | 'responded' | 'pending'>('all')
  const [selectedEnquiry, setSelectedEnquiry] = useState<EnquiryWithDetails | null>(null)
  const [surveyDialogOpen, setSurveyDialogOpen] = useState(false)

  // Calculate satisfaction metrics from actual data
  const calculateMetrics = (): SatisfactionMetrics => {
    const respondedSurveys = satisfactionSurveys.filter(s => s.status === 'RESPONDED')
    const totalSurveys = satisfactionSurveys.length

    if (respondedSurveys.length === 0) {
      return {
        averageRating: 0,
        totalSurveys: 0,
        responseRate: 0,
        satisfactionTrend: 'neutral',
        responseTime: 0
      }
    }

    const totalRating = respondedSurveys.reduce((sum, survey) => sum + survey.overallRating, 0)
    const averageRating = totalRating / respondedSurveys.length
    const responseRate = (respondedSurveys.length / totalSurveys) * 100

    // Calculate response time (days from send to response)
    const responseTimes = respondedSurveys
      .filter(s => s.sentAt && s.respondedAt)
      .map(s => {
        const sent = new Date(s.sentAt!)
        const responded = new Date(s.respondedAt!)
        return Math.floor((responded.getTime() - sent.getTime()) / (1000 * 60 * 60 * 24))
      })

    const avgResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0

    // Calculate trend (compare last 30 days to previous 30 days)
    const now = new Date()
    const last30Days = now.getTime() - (30 * 24 * 60 * 60 * 1000)
    const previous30Days = last30Days - (30 * 24 * 60 * 60 * 1000)

    const recentSurveys = respondedSurveys.filter(s => 
      s.respondedAt && new Date(s.respondedAt).getTime() >= last30Days
    )
    const previousSurveys = respondedSurveys.filter(s => 
      s.respondedAt && new Date(s.respondedAt).getTime() >= previous30Days && 
      new Date(s.respondedAt).getTime() < last30Days
    )

    const recentAvg = recentSurveys.length > 0 
      ? recentSurveys.reduce((sum, s) => sum + s.overallRating, 0) / recentSurveys.length
      : 0
    const previousAvg = previousSurveys.length > 0
      ? previousSurveys.reduce((sum, s) => sum + s.overallRating, 0) / previousSurveys.length
      : 0

    let satisfactionTrend: 'up' | 'down' | 'neutral' = 'neutral'
    if (recentAvg > previousAvg + 0.1) satisfactionTrend = 'up'
    else if (recentAvg < previousAvg - 0.1) satisfactionTrend = 'down'

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalSurveys,
      responseRate: Math.round(responseRate),
      satisfactionTrend,
      responseTime: Math.round(avgResponseTime)
    }
  }

  const currentMetrics = metrics || calculateMetrics()

  // Filter surveys based on status
  const filteredSurveys = satisfactionSurveys.filter(survey => {
    if (filterStatus === 'all') return true
    return survey.status.toLowerCase() === filterStatus
  })

  // Get recent feedback (last 30 days)
  const recentFeedback = satisfactionSurveys
    .filter(s => s.status === 'RESPONDED' && s.respondedAt)
    .sort((a, b) => new Date(b.respondedAt!).getTime() - new Date(a.respondedAt!).getTime())
    .slice(0, 10)

  // Generate NPS (Net Promoter Score) from recommendation responses
  const calculateNPS = () => {
    const recommendationResponses = recentFeedback
      .map(f => f.recommendationLikelihood)
      .filter(r => r !== null)

    if (recommendationResponses.length === 0) return 0

    const promoters = recommendationResponses.filter(r => r >= 9).length
    const detractors = recommendationResponses.filter(r => r <= 6).length
    const total = recommendationResponses.length

    return Math.round(((promoters - detractors) / total) * 100)
  }

  const nps = calculateNPS()

  const handleSendSurvey = (enquiry: EnquiryWithDetails) => {
    if (onSendSurvey) {
      onSendSurvey(enquiry.id)
    }
    setSelectedEnquiry(enquiry)
    setSurveyDialogOpen(true)
  }

  const handleSubmitSurvey = (rating: number, feedback?: string) => {
    if (selectedSurvey && selectedEnquiry && onUpdateSurvey) {
      // In a real implementation, this would create/update a survey record
      onUpdateSurvey(selectedEnquiry.id, rating, feedback)
    }
  }

  const overviewCards = [
    {
      title: 'Average Rating',
      value: currentMetrics.averageRating || 'N/A',
      icon: Star,
      color: 'text-yellow-500',
      suffix: currentMetrics.averageRating ? '/5' : '',
      description: 'Overall satisfaction score'
    },
    {
      title: 'Response Rate',
      value: `${currentMetrics.responseRate || 0}%`,
      icon: TrendingUp,
      color: 'text-green-500',
      description: 'Survey completion rate'
    },
    {
      title: 'Response Time',
      value: `${currentMetrics.responseTime || 0}d`,
      icon: Clock,
      color: 'text-blue-500',
      description: 'Average time to respond'
    },
    {
      title: 'Net Promoter Score',
      value: nps.toString(),
      icon: Users,
      color: nps > 0 ? 'text-green-500' : 'text-red-500',
      description: 'Customer recommendation likelihood',
      showTrend: true
    }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Customer Satisfaction</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customer Satisfaction Tracking</h2>
          <p className="text-gray-600 mt-1">Monitor and improve customer experience through feedback</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Reports
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewCards.map((card, index) => {
          const Icon = card.icon
          return (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{card.title}</CardTitle>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {card.value}{card.suffix}
                </div>
                {card.showTrend && (
                  <div className="flex items-center mt-1">
                    {nps > 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                    )}
                    <span className={`text-xs ${nps > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {nps > 0 ? 'Promoter' : 'Detractor'}
                    </span>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">{card.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="surveys">Surveys</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Satisfaction Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Satisfaction Trends</CardTitle>
                <CardDescription>Rating trends over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {currentMetrics.satisfactionTrend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : currentMetrics.satisfactionTrend === 'down' ? (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      ) : (
                        <div className="h-4 w-4 bg-gray-400 rounded-full" />
                      )}
                      <span className="text-sm font-medium">30-day trend</span>
                    </div>
                    <Badge variant={currentMetrics.satisfactionTrend === 'up' ? 'default' : 'secondary'}>
                      {currentMetrics.satisfactionTrend}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Very Satisfied (5★)</span>
                      <span>78%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Satisfied (4★)</span>
                      <span>15%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '15%' }}></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Neutral (3★)</span>
                      <span>5%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '5%' }}></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Dissatisfied (1-2★)</span>
                      <span>2%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-600 h-2 rounded-full" style={{ width: '2%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common satisfaction management tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => setActiveTab('surveys')}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Satisfaction Survey
                </Button>
                
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => setActiveTab('feedback')}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  View Recent Feedback
                </Button>
                
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => setActiveTab('analytics')}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Detailed Analytics
                </Button>
                
                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium mb-2">Pending Surveys</h4>
                  <div className="text-2xl font-bold text-orange-600">
                    {satisfactionSurveys.filter(s => s.status === 'SENT').length}
                  </div>
                  <p className="text-xs text-gray-500">Awaiting customer response</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Feedback Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Feedback</CardTitle>
              <CardDescription>Latest customer satisfaction responses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentFeedback.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No feedback received yet</p>
                    <p className="text-sm">Send surveys to start collecting feedback</p>
                  </div>
                ) : (
                  recentFeedback.map((feedback, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">
                            {feedback.customerName?.charAt(0) || 'A'}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-gray-900">
                            {feedback.customerName || 'Anonymous'}
                          </p>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < (feedback.overallRating || 0)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {feedback.feedback && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {feedback.feedback}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {feedback.respondedAt ? format(new Date(feedback.respondedAt), 'MMM dd, yyyy') : ''}
                        </p>
                      </div>
                      {feedback.problemResolved ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="surveys" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Surveys</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="responded">Responded</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Survey Management</CardTitle>
                  <CardDescription>Manage satisfaction surveys and track responses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredSurveys.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Send className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No surveys found</p>
                        <p className="text-sm">Start by sending surveys to resolved enquiries</p>
                      </div>
                    ) : (
                      filteredSurveys.map((survey, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <MessageSquare className="h-5 w-5 text-gray-500" />
                            </div>
                            <div>
                              <p className="font-medium">{survey.enquirySubject || 'Enquiry Survey'}</p>
                              <p className="text-sm text-gray-500">
                                {survey.customerEmail} • {format(new Date(survey.sentAt || new Date()), 'MMM dd, yyyy')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={
                                survey.status === 'RESPONDED' ? 'default' :
                                survey.status === 'SENT' ? 'secondary' : 'outline'
                              }
                            >
                              {survey.status.toLowerCase()}
                            </Badge>
                            {survey.status === 'RESPONDED' && (
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${
                                      i < (survey.overallRating || 0)
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Send New Survey</CardTitle>
                  <CardDescription>Select resolved enquiries to survey</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Enquiry</Label>
                    <Select onValueChange={(value) => {
                      const enquiry = enquiries.find(e => e.id === value)
                      if (enquiry) handleSendSurvey(enquiry)
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose enquiry..." />
                      </SelectTrigger>
                      <SelectContent>
                        {enquiries
                          .filter(e => e.status === 'RESOLVED' || e.status === 'CLOSED')
                          .map(enquiry => (
                            <SelectItem key={enquiry.id} value={enquiry.id}>
                              {enquiry.subject}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium mb-2">Survey Templates</h4>
                    <div className="space-y-2">
                      <div className="p-3 border rounded-lg">
                        <p className="text-sm font-medium">Default Survey</p>
                        <p className="text-xs text-gray-500">5 questions • 2-3 minutes</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Feedback</CardTitle>
              <CardDescription>Detailed feedback and ratings from customers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {recentFeedback.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No feedback yet</h3>
                    <p>Customer feedback will appear here once surveys are sent and responses are received.</p>
                  </div>
                ) : (
                  recentFeedback.map((feedback, index) => (
                    <div key={index} className="border rounded-lg p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {feedback.customerName?.charAt(0) || 'A'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{feedback.customerName || 'Anonymous'}</p>
                            <p className="text-sm text-gray-500">{feedback.customerEmail}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center mb-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < (feedback.overallRating || 0)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <Badge variant="outline">
                            {feedback.respondedAt ? format(new Date(feedback.respondedAt), 'MMM dd, yyyy') : ''}
                          </Badge>
                        </div>
                      </div>

                      {feedback.feedback && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-700">{feedback.feedback}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Response Time Satisfaction</span>
                            <span className="font-medium">{feedback.responseTimeRating}/5</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(feedback.responseTimeRating || 0) * 20}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Problem Resolution</span>
                            <span className="font-medium">{feedback.problemResolutionRating}/5</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${(feedback.problemResolutionRating || 0) * 20}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-2">
                          {feedback.problemResolved ? (
                            <>
                              <ThumbsUp className="h-4 w-4 text-green-500" />
                              <span className="text-sm text-green-700">Problem Resolved</span>
                            </>
                          ) : (
                            <>
                              <ThumbsDown className="h-4 w-4 text-red-500" />
                              <span className="text-sm text-red-700">Problem Not Resolved</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">Recommendation:</span>
                          <Badge variant="outline">
                            {feedback.recommendationLikelihood ? `${feedback.recommendationLikelihood}/10` : 'N/A'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Satisfaction Breakdown</CardTitle>
                <CardDescription>Detailed satisfaction metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-green-600">{currentMetrics.averageRating}</div>
                    <div className="text-sm text-gray-600">Average Rating</div>
                    <div className="flex items-center justify-center mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-6 w-6 ${
                            i < (currentMetrics.averageRating || 0)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Response Time</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                        <span className="text-sm font-medium">4.2/5</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Problem Resolution</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                        </div>
                        <span className="text-sm font-medium">4.6/5</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Communication</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                        </div>
                        <span className="text-sm font-medium">3.9/5</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Net Promoter Score</CardTitle>
                <CardDescription>Customer loyalty and recommendation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-6">
                  <div className="text-6xl font-bold text-green-600">+{nps}</div>
                  <div className="text-sm text-gray-600">NPS Score</div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-green-600">Promoters (9-10)</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: '67%' }}></div>
                        </div>
                        <span className="text-sm font-medium">67%</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-yellow-600">Passives (7-8)</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '24%' }}></div>
                        </div>
                        <span className="text-sm font-medium">24%</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-red-600">Detractors (0-6)</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div className="bg-red-600 h-2 rounded-full" style={{ width: '9%' }}></div>
                        </div>
                        <span className="text-sm font-medium">9%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t text-left">
                    <div className="text-sm text-gray-600">
                      <p className="mb-1"><strong>World-class:</strong> 70+</p>
                      <p className="mb-1"><strong>Excellent:</strong> 50-70</p>
                      <p className="mb-1"><strong>Good:</strong> 0-50</p>
                      <p><strong>Needs Improvement:</strong> Below 0</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Survey Dialog */}
      <Dialog open={surveyDialogOpen} onOpenChange={setSurveyDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Satisfaction Survey</DialogTitle>
            <DialogDescription>
              Send a satisfaction survey to {selectedEnquiry?.name} regarding their recent enquiry.
            </DialogDescription>
          </DialogHeader>
          
          {selectedSurvey && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Subject Line</Label>
                <Input 
                  value={selectedSurvey.subject} 
                  readOnly 
                  className="bg-gray-50"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea 
                  value={selectedSurvey.message} 
                  readOnly 
                  className="bg-gray-50 min-h-32"
                />
              </div>
              
              <div className="space-y-4">
                <Label>Survey Questions Preview</Label>
                <div className="space-y-3">
                  {selectedSurvey.questions.map((question, index) => (
                    <div key={question.id} className="p-3 border rounded-lg">
                      <p className="text-sm font-medium">{index + 1}. {question.question}</p>
                      {question.type === 'rating' && (
                        <div className="flex items-center gap-1 mt-2">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 text-gray-300" />
                          ))}
                        </div>
                      )}
                      {question.type === 'multiple_choice' && question.options && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {question.options.map((option, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {option}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setSurveyDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  // In a real implementation, this would send the survey
                  setSurveyDialogOpen(false)
                }}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Survey
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}