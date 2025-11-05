"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Heart, 
  Shield, 
  TrendingUp, 
  Target, 
  Calendar, 
  Award,
  Activity,
  Clock,
  Users,
  FileText,
  Bell,
  Settings,
  Plus,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  BarChart3,
  PieChart,
  LineChart,
  Zap,
  Stethoscope,
  User,
  MapPin,
  Phone,
  Mail
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface UnifiedHealthDashboardProps {
  userId?: string
  className?: string
  isCollapsed?: boolean
}

interface HealthDataSummary {
  // General Health Metrics
  overallHealth: {
    score: number
    trend: 'improving' | 'stable' | 'declining'
    lastUpdated: Date
  }
  vitalSigns: {
    bloodPressure?: { systolic: number; diastolic: number; date: Date }
    heartRate?: { value: number; date: Date }
    weight?: { value: number; date: Date }
    bloodSugar?: { value: number; date: Date }
  }
  healthGoals: Array<{
    id: string
    title: string
    type: 'general' | 'program'
    progress: number
    targetValue: number
    currentValue: number
    targetDate: Date
    isCompleted: boolean
    priority: 'low' | 'medium' | 'high' | 'critical'
  }>
  
  // Healthier SG Program Data
  programData: {
    enrollmentStatus: 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'COMPLETED'
    programTier: 'STANDARD' | 'PRIORITY' | 'PREMIUM' | 'CHRONIC_CARE'
    enrollmentDate: Date
    participationScore: number
    completionPercentage: number
    nextMilestone?: {
      title: string
      dueDate: Date
      description: string
    }
    benefits: {
      totalEarned: number
      totalUsed: number
      available: number
      nextPayout?: Date
    }
  }
  
  // Upcoming Appointments and Activities
  upcomingItems: Array<{
    id: string
    type: 'appointment' | 'screening' | 'consultation' | 'milestone' | 'followup'
    title: string
    description: string
    date: Date
    clinicName?: string
    doctorName?: string
    isProgramEligible: boolean
    priority: 'low' | 'medium' | 'high' | 'urgent'
    status: 'scheduled' | 'confirmed' | 'pending' | 'cancelled'
  }>
  
  // Health Insights and Recommendations
  insights: Array<{
    id: string
    type: 'achievement' | 'recommendation' | 'alert' | 'milestone'
    title: string
    description: string
    priority: 'low' | 'medium' | 'high' | 'urgent'
    isRead: boolean
    actionRequired: boolean
    actionUrl?: string
    createdAt: Date
  }>
  
  // Recent Health Activities
  recentActivities: Array<{
    id: string
    type: 'consultation' | 'screening' | 'medication' | 'goal' | 'program'
    title: string
    description: string
    date: Date
    outcome?: string
    isProgramRelated: boolean
  }>
  
  // Health Analytics
  analytics: {
    healthScore: {
      current: number
      target: number
      trend: number[]
    }
    programEngagement: {
      current: number
      target: number
      streak: number
    }
    goalProgress: {
      completed: number
      inProgress: number
      overdue: number
    }
  }
}

export function UnifiedHealthDashboard({
  userId,
  className,
  isCollapsed = false
}: UnifiedHealthDashboardProps) {
  // Mock data - would be fetched from unified API
  const healthData: HealthDataSummary = {
    overallHealth: {
      score: 78,
      trend: 'improving',
      lastUpdated: new Date()
    },
    vitalSigns: {
      bloodPressure: { systolic: 120, diastolic: 80, date: new Date('2024-10-20') },
      heartRate: { value: 72, date: new Date('2024-10-20') },
      weight: { value: 70, date: new Date('2024-10-19') },
      bloodSugar: { value: 95, date: new Date('2024-10-18') }
    },
    healthGoals: [
      {
        id: '1',
        title: 'Blood Pressure Control',
        type: 'program',
        progress: 85,
        targetValue: 120,
        currentValue: 122,
        targetDate: new Date('2024-12-31'),
        isCompleted: false,
        priority: 'high'
      },
      {
        id: '2',
        title: 'Weight Management',
        type: 'general',
        progress: 60,
        targetValue: 65,
        currentValue: 70,
        targetDate: new Date('2024-11-30'),
        isCompleted: false,
        priority: 'medium'
      },
      {
        id: '3',
        title: 'Exercise Routine',
        type: 'program',
        progress: 90,
        targetValue: 150,
        currentValue: 135,
        targetDate: new Date('2024-10-31'),
        isCompleted: false,
        priority: 'medium'
      }
    ],
    programData: {
      enrollmentStatus: 'ACTIVE',
      programTier: 'PREMIUM',
      enrollmentDate: new Date('2024-01-15'),
      participationScore: 92,
      completionPercentage: 68,
      nextMilestone: {
        title: 'Complete Health Screening',
        dueDate: new Date('2024-11-15'),
        description: 'Annual comprehensive health screening and assessment'
      },
      benefits: {
        totalEarned: 2400,
        totalUsed: 1800,
        available: 600,
        nextPayout: new Date('2024-11-01')
      }
    },
    upcomingItems: [
      {
        id: '1',
        type: 'consultation',
        title: 'Cardiology Follow-up',
        description: 'Dr. Sarah Tan - Heart health monitoring',
        date: new Date('2024-11-05'),
        clinicName: 'HealthHub Medical Center',
        doctorName: 'Dr. Sarah Tan',
        isProgramEligible: true,
        priority: 'high',
        status: 'confirmed'
      },
      {
        id: '2',
        type: 'screening',
        title: 'Annual Health Screening',
        description: 'Comprehensive health assessment',
        date: new Date('2024-11-12'),
        clinicName: 'Wellness Clinic',
        isProgramEligible: true,
        priority: 'high',
        status: 'scheduled'
      },
      {
        id: '3',
        type: 'milestone',
        title: 'Program Milestone Review',
        description: 'Quarterly progress assessment',
        date: new Date('2024-11-20'),
        isProgramEligible: true,
        priority: 'medium',
        status: 'scheduled'
      }
    ],
    insights: [
      {
        id: '1',
        type: 'achievement',
        title: 'Goal Achievement!',
        description: 'You\'ve successfully maintained your exercise routine for 30 consecutive days',
        priority: 'medium',
        isRead: false,
        actionRequired: false,
        createdAt: new Date('2024-10-21')
      },
      {
        id: '2',
        type: 'recommendation',
        title: 'Health Screening Due',
        description: 'Your annual health screening is scheduled for next month',
        priority: 'high',
        isRead: false,
        actionRequired: true,
        actionUrl: '/screening',
        createdAt: new Date('2024-10-20')
      },
      {
        id: '3',
        type: 'alert',
        title: 'Blood Pressure Monitoring',
        description: 'Your recent readings show elevated levels. Consider consulting your doctor.',
        priority: 'urgent',
        isRead: false,
        actionRequired: true,
        actionUrl: '/consultation',
        createdAt: new Date('2024-10-19')
      }
    ],
    recentActivities: [
      {
        id: '1',
        type: 'consultation',
        title: 'Cardiology Consultation',
        description: 'Dr. Sarah Tan - Heart health assessment',
        date: new Date('2024-10-18'),
        outcome: 'Blood pressure slightly elevated, continue monitoring',
        isProgramRelated: true
      },
      {
        id: '2',
        type: 'screening',
        title: 'Blood Test Results',
        description: 'Cholesterol and blood sugar levels',
        date: new Date('2024-10-15'),
        outcome: 'All levels within normal range',
        isProgramRelated: true
      },
      {
        id: '3',
        type: 'goal',
        title: 'Exercise Milestone',
        description: 'Completed 30-day exercise challenge',
        date: new Date('2024-10-10'),
        outcome: 'Goal achieved successfully',
        isProgramRelated: true
      }
    ],
    analytics: {
      healthScore: {
        current: 78,
        target: 85,
        trend: [72, 75, 78, 76, 78]
      },
      programEngagement: {
        current: 92,
        target: 90,
        streak: 45
      },
      goalProgress: {
        completed: 8,
        inProgress: 12,
        overdue: 2
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'SUSPENDED': return 'bg-red-100 text-red-800'
      case 'COMPLETED': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'achievement': return <Award className="h-4 w-4 text-yellow-600" />
      case 'recommendation': return <Target className="h-4 w-4 text-blue-600" />
      case 'alert': return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'milestone': return <CheckCircle className="h-4 w-4 text-green-600" />
      default: return <Bell className="h-4 w-4 text-gray-600" />
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'consultation': return <Stethoscope className="h-4 w-4 text-blue-600" />
      case 'screening': return <Activity className="h-4 w-4 text-green-600" />
      case 'medication': return <Heart className="h-4 w-4 text-red-600" />
      case 'goal': return <Target className="h-4 w-4 text-purple-600" />
      case 'program': return <Shield className="h-4 w-4 text-green-600" />
      default: return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  if (isCollapsed) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              <span className="font-medium">Health Dashboard</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(healthData.programData.enrollmentStatus)}>
                {healthData.programData.enrollmentStatus}
              </Badge>
              <div className="text-2xl font-bold text-green-600">
                {healthData.overallHealth.score}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Unified Health Dashboard</CardTitle>
                <CardDescription>
                  Your complete health and Healthier SG program overview
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  {healthData.overallHealth.score}%
                </div>
                <div className="text-sm text-gray-500">Overall Health</div>
              </div>
              <Badge className={getStatusColor(healthData.programData.enrollmentStatus)}>
                {healthData.programData.enrollmentStatus}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Health Score and Program Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Heart className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Health Score</h3>
                    <p className="text-sm text-gray-500">Overall wellness rating</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{healthData.overallHealth.score}</span>
                    <span className="text-sm text-green-600">↗ Improving</span>
                  </div>
                  <Progress value={healthData.overallHealth.score} />
                  <div className="text-sm text-gray-500">
                    Target: {healthData.analytics.healthScore.target}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Shield className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Program Status</h3>
                    <p className="text-sm text-gray-500">Healthier SG participation</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{healthData.programData.participationScore}</span>
                    <span className="text-sm text-green-600">{healthData.programData.completionPercentage}% complete</span>
                  </div>
                  <Progress value={healthData.programData.participationScore} />
                  <div className="text-sm text-gray-500">
                    {healthData.programData.programTier} Tier
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Award className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Benefits</h3>
                    <p className="text-sm text-gray-500">Available balance</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">${healthData.programData.benefits.available}</span>
                    <span className="text-sm text-blue-600">{healthData.analytics.goalProgress.completed} goals completed</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Next payout: {healthData.programData.benefits.nextPayout?.toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-800">Goals Progress</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {healthData.analytics.goalProgress.inProgress}
              </div>
              <div className="text-xs text-gray-500">in progress</div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Completed</span>
              </div>
              <div className="text-2xl font-bold text-green-900">
                {healthData.analytics.goalProgress.completed}
              </div>
              <div className="text-xs text-green-600">goals achieved</div>
            </div>

            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">Overdue</span>
              </div>
              <div className="text-2xl font-bold text-red-900">
                {healthData.analytics.goalProgress.overdue}
              </div>
              <div className="text-xs text-red-600">need attention</div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Streak</span>
              </div>
              <div className="text-2xl font-bold text-purple-900">
                {healthData.analytics.programEngagement.streak}
              </div>
              <div className="text-xs text-purple-600">days active</div>
            </div>
          </div>

          {/* Next Milestone */}
          {healthData.programData.nextMilestone && (
            <Card className="bg-gradient-to-r from-blue-50 to-green-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Target className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900">Next Milestone</h3>
                      <p className="text-blue-700">{healthData.programData.nextMilestone.title}</p>
                      <p className="text-sm text-blue-600">{healthData.programData.nextMilestone.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-900">
                      {Math.ceil((healthData.programData.nextMilestone.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))}
                    </div>
                    <div className="text-sm text-blue-600">days left</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Vital Signs Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Vital Signs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {healthData.vitalSigns.bloodPressure && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Blood Pressure</div>
                    <div className="text-lg font-semibold">
                      {healthData.vitalSigns.bloodPressure.systolic}/{healthData.vitalSigns.bloodPressure.diastolic}
                    </div>
                    <div className="text-xs text-gray-500">
                      {healthData.vitalSigns.bloodPressure.date.toLocaleDateString()}
                    </div>
                  </div>
                )}
                {healthData.vitalSigns.heartRate && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Heart Rate</div>
                    <div className="text-lg font-semibold">{healthData.vitalSigns.heartRate.value}</div>
                    <div className="text-xs text-gray-500">bpm</div>
                  </div>
                )}
                {healthData.vitalSigns.weight && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Weight</div>
                    <div className="text-lg font-semibold">{healthData.vitalSigns.weight.value}</div>
                    <div className="text-xs text-gray-500">kg</div>
                  </div>
                )}
                {healthData.vitalSigns.bloodSugar && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Blood Sugar</div>
                    <div className="text-lg font-semibold">{healthData.vitalSigns.bloodSugar.value}</div>
                    <div className="text-xs text-gray-500">mg/dL</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Health Goals</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
          </div>
          
          <div className="grid gap-4">
            {healthData.healthGoals.map((goal) => (
              <Card key={goal.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {goal.type === 'program' ? (
                        <Shield className="h-5 w-5 text-green-600" />
                      ) : (
                        <Heart className="h-5 w-5 text-red-600" />
                      )}
                      <div>
                        <h3 className="font-medium">{goal.title}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {goal.type === 'program' ? 'Program Goal' : 'General Health'}
                          </Badge>
                          <Badge className={getPriorityColor(goal.priority)}>
                            {goal.priority}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">{goal.progress}%</div>
                      <div className="text-sm text-gray-500">
                        {goal.currentValue}/{goal.targetValue}
                      </div>
                    </div>
                  </div>
                  <Progress value={goal.progress} className="mb-2" />
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Target: {goal.targetDate.toLocaleDateString()}</span>
                    {goal.isCompleted && (
                      <Badge variant="default" className="bg-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-6">
          <h2 className="text-lg font-semibold">Upcoming Appointments & Activities</h2>
          <div className="space-y-3">
            {healthData.upcomingItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        item.isProgramEligible ? "bg-green-100" : "bg-gray-100"
                      )}>
                        {item.type === 'consultation' && <Stethoscope className="h-4 w-4 text-blue-600" />}
                        {item.type === 'screening' && <Activity className="h-4 w-4 text-green-600" />}
                        {item.type === 'milestone' && <Target className="h-4 w-4 text-purple-600" />}
                        {item.type === 'followup' && <ArrowRight className="h-4 w-4 text-orange-600" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{item.title}</h3>
                        <p className="text-sm text-gray-600">{item.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {item.clinicName && (
                            <span className="text-xs text-gray-500">{item.clinicName}</span>
                          )}
                          {item.doctorName && (
                            <span className="text-xs text-gray-500">• Dr. {item.doctorName}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{item.date.toLocaleDateString()}</div>
                      <div className="text-sm text-gray-500">{item.date.toLocaleDateString('en', { weekday: 'short' })}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getPriorityColor(item.priority)}>
                          {item.priority}
                        </Badge>
                        {item.isProgramEligible && (
                          <Badge variant="default" className="bg-green-600">
                            <Shield className="h-3 w-3 mr-1" />
                            Program
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <h2 className="text-lg font-semibold">Health Insights & Recommendations</h2>
          <div className="space-y-3">
            {healthData.insights.map((insight) => (
              <Card key={insight.id} className={cn(
                "border-l-4",
                insight.priority === 'urgent' ? "border-l-red-500" :
                insight.priority === 'high' ? "border-l-orange-500" :
                insight.priority === 'medium' ? "border-l-yellow-500" : "border-l-gray-500"
              )}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-1">
                      {getInsightIcon(insight.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium">{insight.title}</h3>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(insight.priority)}>
                            {insight.priority}
                          </Badge>
                          {insight.actionRequired && (
                            <Badge variant="default" className="bg-blue-600">
                              Action Required
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {insight.createdAt.toLocaleDateString()}
                        </span>
                        {insight.actionUrl && (
                          <Button size="sm" variant="outline">
                            Take Action
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <h2 className="text-lg font-semibold">Health Analytics</h2>
          
          {/* Health Score Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Health Score Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Current Score</span>
                  <span className="text-2xl font-bold">{healthData.analytics.healthScore.current}</span>
                </div>
                <Progress value={(healthData.analytics.healthScore.current / healthData.analytics.healthScore.target) * 100} />
                <div className="text-sm text-gray-500">
                  Target: {healthData.analytics.healthScore.target}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Program Engagement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Program Engagement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {healthData.analytics.programEngagement.current}
                    </div>
                    <div className="text-sm text-gray-500">Current Score</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {healthData.analytics.programEngagement.streak}
                    </div>
                    <div className="text-sm text-gray-500">Day Streak</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {healthData.analytics.programEngagement.target}
                    </div>
                    <div className="text-sm text-gray-500">Target</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {healthData.recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{activity.title}</h4>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      {activity.outcome && (
                        <p className="text-sm text-green-600 mt-1">{activity.outcome}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        {activity.date.toLocaleDateString()}
                      </div>
                      {activity.isProgramRelated && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          <Shield className="h-3 w-3 mr-1" />
                          Program
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export type { UnifiedHealthDashboardProps, HealthDataSummary }