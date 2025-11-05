// Healthier SG Program Timeline Component
// Interactive timeline with milestones and progress tracking

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Download,
  ExternalLink,
  Play,
  FileText,
  Users,
  MapPin,
  Bell,
  Settings,
  ArrowRight,
  Star,
  Zap
} from 'lucide-react'
import { Milestone, ProgramInfoComponentProps } from './types'

// Mock timeline data
const mockTimelineData: Milestone[] = [
  {
    id: 'enrollment-2024',
    title: 'Healthier SG Enrollment Period 2024',
    description: 'Main enrollment window for Singapore residents to join Healthier SG program',
    date: new Date('2024-01-01'),
    status: 'COMPLETED',
    type: 'ENROLLMENT',
    progress: 100,
    requirements: [
      { description: 'Complete eligibility assessment', completed: true, optional: false },
      { description: 'Choose participating family doctor', completed: true, optional: false },
      { description: 'Sign participation agreement', completed: true, optional: false },
      { description: 'Complete initial health screening', completed: true, optional: true }
    ],
    resources: [
      {
        title: 'Enrollment Guide',
        type: 'GUIDE',
        url: '/resources/enrollment-guide-2024.pdf',
        description: 'Step-by-step enrollment instructions'
      },
      {
        title: 'Eligibility Checklist',
        type: 'CHECKLIST',
        url: '/resources/eligibility-checklist.pdf',
        description: 'Requirements verification checklist'
      }
    ],
    notifications: [
      {
        type: 'REMINDER',
        message: 'Enrollment deadline approaching - 30 days remaining',
        sendAt: new Date('2024-12-01'),
        conditions: { daysBefore: 30 }
      },
      {
        type: 'DEADLINE',
        message: 'Final call - Healthier SG enrollment closes today',
        sendAt: new Date('2024-12-31'),
        conditions: {}
      }
    ]
  },
  {
    id: 'health-screening-phase',
    title: 'Comprehensive Health Screening Phase',
    description: 'Initial health assessments and baseline measurements for all participants',
    date: new Date('2024-03-01'),
    status: 'IN_PROGRESS',
    type: 'HEALTH_CHECK',
    progress: 75,
    requirements: [
      { description: 'Schedule initial screening appointment', completed: true, optional: false },
      { description: 'Complete blood work and tests', completed: true, optional: false },
      { description: 'Receive screening results and interpretation', completed: true, optional: false },
      { description: 'Discuss results with family doctor', completed: false, optional: false },
      { description: 'Create personalized health plan', completed: false, optional: false }
    ],
    resources: [
      {
        title: 'Screening Preparation Guide',
        type: 'GUIDE',
        url: '/resources/screening-prep.pdf',
        description: 'What to expect during health screening'
      },
      {
        title: 'Health Plan Template',
        type: 'FORM',
        url: '/resources/health-plan-template.pdf',
        description: 'Template for creating your health plan'
      }
    ],
    notifications: [
      {
        type: 'REMINDER',
        message: 'Complete your health screening within 6 months of enrollment',
        sendAt: new Date('2024-09-01'),
        conditions: { daysBefore: 30 }
      }
    ]
  },
  {
    id: 'health-plan-development',
    title: 'Personalized Health Plan Development',
    description: 'Work with family doctor to create individualized health improvement plan',
    date: new Date('2024-05-01'),
    status: 'IN_PROGRESS',
    type: 'MILESTONE',
    progress: 60,
    requirements: [
      { description: 'Complete health risk assessment', completed: true, optional: false },
      { description: 'Set health improvement goals', completed: true, optional: false },
      { description: 'Define lifestyle modification targets', completed: false, optional: false },
      { description: 'Schedule regular follow-up appointments', completed: false, optional: false },
      { description: 'Agree on monitoring schedule', completed: false, optional: false }
    ],
    resources: [
      {
        title: 'Goal Setting Workshop',
        type: 'GUIDE',
        url: '/workshops/goal-setting',
        description: 'Interactive workshop on setting realistic health goals'
      },
      {
        title: 'Lifestyle Modification Guide',
        type: 'GUIDE',
        url: '/resources/lifestyle-modifications.pdf',
        description: 'Evidence-based strategies for healthy lifestyle changes'
      }
    ],
    notifications: [
      {
        type: 'REMINDER',
        message: 'Health plan review due in 30 days',
        sendAt: new Date('2024-10-15'),
        conditions: { daysBefore: 30 }
      }
    ]
  },
  {
    id: 'first-progress-review',
    title: 'First Progress Review',
    description: '6-month assessment of health improvements and plan adjustments',
    date: new Date('2024-09-01'),
    status: 'UPCOMING',
    type: 'REVIEW',
    progress: 0,
    requirements: [
      { description: 'Complete 6-month health assessment', completed: false, optional: false },
      { description: 'Review progress against goals', completed: false, optional: false },
      { description: 'Adjust health plan as needed', completed: false, optional: false },
      { description: 'Schedule next review period', completed: false, optional: false }
    ],
    resources: [
      {
        title: 'Progress Tracking Tool',
        type: 'INTERACTIVE',
        url: '/tools/progress-tracker',
        description: 'Online tool to track your health improvements'
      }
    ],
    notifications: [
      {
        type: 'REMINDER',
        message: 'Your 6-month progress review is scheduled for next week',
        sendAt: new Date('2024-08-25'),
        conditions: { daysBefore: 7 }
      }
    ]
  },
  {
    id: 'annual-health-check',
    title: 'Annual Health Check & Plan Renewal',
    description: 'Comprehensive annual health review and health plan updates',
    date: new Date('2025-01-01'),
    status: 'UPCOMING',
    type: 'HEALTH_CHECK',
    progress: 0,
    requirements: [
      { description: 'Complete annual comprehensive screening', completed: false, optional: false },
      { description: 'Review year-long progress', completed: false, optional: false },
      { description: 'Update health plan for next year', completed: false, optional: false },
      { description: 'Assess need for additional support', completed: false, optional: true }
    ],
    resources: [
      {
        title: 'Annual Review Checklist',
        type: 'CHECKLIST',
        url: '/resources/annual-review-checklist.pdf',
        description: 'Comprehensive checklist for annual health review'
      }
    ],
    notifications: [
      {
        type: 'REMINDER',
        message: 'Annual health check due within 30 days',
        sendAt: new Date('2024-12-02'),
        conditions: { daysBefore: 30 }
      }
    ]
  },
  {
    id: 'program-anniversary',
    title: 'Healthier SG Program Anniversary',
    description: 'Celebration and assessment of program impact at 1-year mark',
    date: new Date('2025-03-01'),
    status: 'UPCOMING',
    type: 'MILESTONE',
    progress: 0,
    requirements: [
      { description: 'Complete satisfaction survey', completed: false, optional: true },
      { description: 'Share success story (optional)', completed: false, optional: true },
      { description: 'Provide program feedback', completed: false, optional: true }
    ],
    resources: [
      {
        title: 'Success Story Submission',
        type: 'FORM',
        url: '/forms/success-story',
        description: 'Share your Healthier SG journey with others'
      }
    ],
    notifications: [
      {
        type: 'UPDATE',
        message: 'Share your Healthier SG success story to inspire others',
        sendAt: new Date('2025-02-15'),
        conditions: { daysBefore: 14 }
      }
    ]
  }
]

export const ProgramTimeline: React.FC<ProgramInfoComponentProps> = ({
  className = '',
  language = 'en',
  userType = 'citizen',
  isMobile = false,
  showGovernmentDisclaimer = true,
  enableAnalytics = true
}) => {
  const [timeline, setTimeline] = useState<Milestone[]>([])
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null)
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'timeline' | 'calendar'>('timeline')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTimeline = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 600))
      setTimeline(mockTimelineData)
      setSelectedMilestone(mockTimelineData[0])
      setLoading(false)
    }
    loadTimeline()
  }, [])

  const filteredTimeline = timeline.filter(milestone => {
    if (activeFilter === 'all') return true
    if (activeFilter === 'completed') return milestone.status === 'COMPLETED'
    if (activeFilter === 'upcoming') return milestone.status === 'UPCOMING'
    if (activeFilter === 'progress') return milestone.status === 'IN_PROGRESS'
    return true
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'IN_PROGRESS':
        return <Clock className="h-5 w-5 text-blue-500" />
      case 'UPCOMING':
        return <AlertCircle className="h-5 w-5 text-gray-400" />
      case 'DELAYED':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'UPCOMING':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'DELAYED':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ENROLLMENT':
        return <Users className="h-4 w-4" />
      case 'HEALTH_CHECK':
        return <TrendingUp className="h-4 w-4" />
      case 'MILESTONE':
        return <Star className="h-4 w-4" />
      case 'DEADLINE':
        return <AlertCircle className="h-4 w-4" />
      case 'REVIEW':
        return <FileText className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'bg-green-500'
    if (progress >= 60) return 'bg-blue-500'
    if (progress >= 30) return 'bg-yellow-500'
    return 'bg-gray-300'
  }

  const calculateOverallProgress = () => {
    const completedMilestones = timeline.filter(m => m.status === 'COMPLETED').length
    return Math.round((completedMilestones / timeline.length) * 100)
  }

  if (loading) {
    return (
      <div className={`container mx-auto p-6 ${className}`}>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Healthier SG Program Timeline</h1>
          <p className="text-lg text-gray-600">
            Track your progress through the Healthier SG program with key milestones and deadlines
          </p>
        </div>

        {/* Overall Progress */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Your Program Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {calculateOverallProgress()}%
                </div>
                <div className="text-sm text-gray-600">Overall Progress</div>
                <Progress value={calculateOverallProgress()} className="mt-2" />
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {timeline.filter(m => m.status === 'COMPLETED').length}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {timeline.filter(m => m.status === 'IN_PROGRESS').length}
                </div>
                <div className="text-sm text-gray-600">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-600 mb-2">
                  {timeline.filter(m => m.status === 'UPCOMING').length}
                </div>
                <div className="text-sm text-gray-600">Upcoming</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters and View Toggle */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={activeFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter('all')}
            >
              All Milestones
            </Button>
            <Button
              variant={activeFilter === 'completed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter('completed')}
            >
              Completed
            </Button>
            <Button
              variant={activeFilter === 'progress' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter('progress')}
            >
              In Progress
            </Button>
            <Button
              variant={activeFilter === 'upcoming' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter('upcoming')}
            >
              Upcoming
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'timeline' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('timeline')}
            >
              Timeline View
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('calendar')}
            >
              Calendar View
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Timeline */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Program Milestones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {filteredTimeline.map((milestone, index) => (
                    <div
                      key={milestone.id}
                      className={`relative flex items-start space-x-4 cursor-pointer transition-all hover:bg-gray-50 p-3 rounded-lg ${
                        selectedMilestone?.id === milestone.id ? 'bg-blue-50 border border-blue-200' : ''
                      }`}
                      onClick={() => setSelectedMilestone(milestone)}
                    >
                      {/* Timeline connector */}
                      {index < filteredTimeline.length - 1 && (
                        <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
                      )}
                      
                      {/* Status icon */}
                      <div className="relative flex-shrink-0">
                        <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${
                          milestone.status === 'COMPLETED' ? 'bg-green-100 border-green-300' :
                          milestone.status === 'IN_PROGRESS' ? 'bg-blue-100 border-blue-300' :
                          'bg-gray-100 border-gray-300'
                        }`}>
                          {getStatusIcon(milestone.status)}
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-semibold">{milestone.title}</h3>
                            <Badge className={`text-xs ${getStatusColor(milestone.status)}`}>
                              {milestone.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500">
                            {milestone.date.toLocaleDateString()}
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mb-3">{milestone.description}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {getTypeIcon(milestone.type)}
                            <span className="text-sm font-medium">{milestone.type.replace('_', ' ')}</span>
                          </div>
                          
                          {milestone.status === 'IN_PROGRESS' && (
                            <div className="flex items-center space-x-2">
                              <Progress value={milestone.progress} className="w-20" />
                              <span className="text-sm text-gray-600">{milestone.progress}%</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Requirements preview */}
                        <div className="mt-3">
                          <div className="text-sm text-gray-600 mb-1">
                            Requirements: {milestone.requirements.filter(r => r.completed).length} / {milestone.requirements.length}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${getProgressColor(milestone.progress)}`}
                              style={{ width: `${milestone.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Milestone Details */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  {selectedMilestone && getTypeIcon(selectedMilestone.type)}
                  <span className="ml-2">Milestone Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedMilestone ? (
                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div>
                      <h3 className="font-semibold mb-2">{selectedMilestone.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{selectedMilestone.description}</p>
                      
                      <div className="flex items-center justify-between mb-4">
                        <Badge className={getStatusColor(selectedMilestone.status)}>
                          {selectedMilestone.status.replace('_', ' ')}
                        </Badge>
                        <div className="text-sm text-gray-600 flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {selectedMilestone.date.toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Progress */}
                    {selectedMilestone.status === 'IN_PROGRESS' && (
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Progress</span>
                          <span className="text-sm text-gray-600">{selectedMilestone.progress}%</span>
                        </div>
                        <Progress value={selectedMilestone.progress} />
                      </div>
                    )}

                    {/* Requirements */}
                    <div>
                      <h4 className="font-medium mb-3">Requirements</h4>
                      <div className="space-y-2">
                        {selectedMilestone.requirements.map((req, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            {req.completed ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            ) : (
                              <div className="h-4 w-4 border-2 border-gray-300 rounded mt-0.5 flex-shrink-0" />
                            )}
                            <div className="flex-1">
                              <div className={`text-sm ${req.completed ? 'text-gray-900' : 'text-gray-600'}`}>
                                {req.description}
                              </div>
                              {req.optional && (
                                <div className="text-xs text-gray-500">Optional</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Resources */}
                    {selectedMilestone.resources.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3">Resources & Downloads</h4>
                        <div className="space-y-2">
                          {selectedMilestone.resources.map((resource, index) => (
                            <div key={index} className="border rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center">
                                  {resource.type === 'GUIDE' && <FileText className="h-4 w-4 text-blue-600 mr-2" />}
                                  {resource.type === 'CHECKLIST' && <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />}
                                  {resource.type === 'FORM' && <FileText className="h-4 w-4 text-purple-600 mr-2" />}
                                  {resource.type === 'INTERACTIVE' && <Play className="h-4 w-4 text-orange-600 mr-2" />}
                                  <span className="text-sm font-medium">{resource.title}</span>
                                </div>
                              </div>
                              <p className="text-xs text-gray-600 mb-2">{resource.description}</p>
                              <Button size="sm" variant="outline" className="w-full">
                                {resource.type === 'INTERACTIVE' ? (
                                  <>
                                    <Play className="h-3 w-3 mr-1" />
                                    Open Tool
                                  </>
                                ) : (
                                  <>
                                    <Download className="h-3 w-3 mr-1" />
                                    Download
                                  </>
                                )}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notifications */}
                    {selectedMilestone.notifications.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3">Notifications</h4>
                        <div className="space-y-2">
                          {selectedMilestone.notifications.map((notification, index) => (
                            <div key={index} className="flex items-start space-x-2 p-2 bg-blue-50 rounded">
                              <Bell className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <div className="text-sm">{notification.message}</div>
                                {notification.sendAt && (
                                  <div className="text-xs text-gray-600 mt-1">
                                    {notification.sendAt.toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="pt-4 border-t">
                      <div className="space-y-2">
                        {selectedMilestone.status === 'UPCOMING' && (
                          <Button className="w-full">
                            <Bell className="h-4 w-4 mr-2" />
                            Set Reminder
                          </Button>
                        )}
                        {selectedMilestone.status === 'IN_PROGRESS' && (
                          <Button variant="outline" className="w-full">
                            <Settings className="h-4 w-4 mr-2" />
                            Update Progress
                          </Button>
                        )}
                        <Button variant="outline" className="w-full">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          More Information
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Select a milestone to view details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Program Overview */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              What's Next?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Complete Enrollment</h3>
                <p className="text-sm text-gray-600 mb-4">
                  If you haven't already, complete your Healthier SG enrollment
                </p>
                <Button size="sm" asChild>
                  <a href="/healthier-sg/eligibility">Start Enrollment</a>
                </Button>
              </div>
              
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Schedule Health Check</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Book your comprehensive health screening appointment
                </p>
                <Button size="sm" asChild>
                  <a href="/clinics">Find Clinics</a>
                </Button>
              </div>
              
              <div className="text-center p-6 bg-purple-50 rounded-lg">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Track Progress</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Monitor your health improvements and achievements
                </p>
                <Button size="sm" asChild>
                  <a href="/healthier-sg/progress">View Progress</a>
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
                <Calendar className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Official Program Timeline</span>
              </div>
              <p className="text-sm text-gray-600">
                This timeline reflects the official Healthier SG program schedule. 
                Dates and requirements are subject to government updates. For current information, visit{' '}
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