"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Shield, 
  Calendar, 
  Heart, 
  TrendingUp, 
  Users, 
  CheckCircle,
  AlertCircle,
  Clock,
  Award,
  Target,
  Activity,
  FileText,
  Settings,
  Bell,
  BarChart3
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface HealthierSGIntegrationPanelProps {
  userId?: string
  className?: string
  isCollapsed?: boolean
}

interface UserHealthProfile {
  enrollmentStatus: 'ACTIVE' | 'PENDING' | 'NOT_ENROLLED' | 'SUSPENDED'
  programTier: 'STANDARD' | 'PRIORITY' | 'PREMIUM' | 'CHRONIC_CARE'
  healthGoals: Array<{
    id: string
    title: string
    type: string
    progress: number
    targetDate: Date
    isCompleted: boolean
  }>
  recentActivities: Array<{
    id: string
    type: 'CONSULTATION' | 'SCREENING' | 'MILESTONE' | 'GOAL'
    title: string
    date: Date
    status: 'COMPLETED' | 'PENDING' | 'MISSED'
  }>
  benefits: {
    totalEarned: number
    totalUsed: number
    currentBalance: number
    nextPayout?: Date
  }
  upcomingAppointments: Array<{
    id: string
    clinicName: string
    serviceName: string
    doctorName: string
    date: Date
    isProgramEligible: boolean
  }>
  programMetrics: {
    enrollmentDate: Date
    participationScore: number
    goalAchievementRate: number
    screeningCompletion: number
  }
}

export function HealthierSGIntegrationPanel({
  userId,
  className,
  isCollapsed = false
}: HealthierSGIntegrationPanelProps) {
  // Mock data - would be fetched from API
  const profile: UserHealthProfile = {
    enrollmentStatus: 'ACTIVE',
    programTier: 'PREMIUM',
    healthGoals: [
      {
        id: '1',
        title: 'Blood Pressure Management',
        type: 'CHRONIC_CARE',
        progress: 75,
        targetDate: new Date('2024-12-31'),
        isCompleted: false
      },
      {
        id: '2', 
        title: 'Weight Loss Target',
        type: 'LIFESTYLE',
        progress: 60,
        targetDate: new Date('2024-11-30'),
        isCompleted: false
      }
    ],
    recentActivities: [
      {
        id: '1',
        type: 'SCREENING',
        title: 'Annual Health Screening',
        date: new Date('2024-10-15'),
        status: 'COMPLETED'
      },
      {
        id: '2',
        type: 'CONSULTATION',
        title: 'Cardiology Consultation',
        date: new Date('2024-10-20'),
        status: 'COMPLETED'
      }
    ],
    benefits: {
      totalEarned: 1200,
      totalUsed: 800,
      currentBalance: 400,
      nextPayout: new Date('2024-11-01')
    },
    upcomingAppointments: [
      {
        id: '1',
        clinicName: 'HealthHub Clinic',
        serviceName: 'Healthier SG Consultation',
        doctorName: 'Dr. Sarah Tan',
        date: new Date('2024-11-05'),
        isProgramEligible: true
      }
    ],
    programMetrics: {
      enrollmentDate: new Date('2024-01-15'),
      participationScore: 85,
      goalAchievementRate: 70,
      screeningCompletion: 90
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'SUSPENDED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'PREMIUM': return 'bg-purple-100 text-purple-800'
      case 'PRIORITY': return 'bg-blue-100 text-blue-800'
      case 'CHRONIC_CARE': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isCollapsed) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              <span className="font-medium">Healthier SG</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(profile.enrollmentStatus)}>
                {profile.enrollmentStatus}
              </Badge>
              <Badge className={getTierColor(profile.programTier)}>
                {profile.programTier}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-green-600" />
            <div>
              <CardTitle className="text-lg">Healthier SG Program</CardTitle>
              <CardDescription>
                Your integrated health management dashboard
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(profile.enrollmentStatus)}>
              {profile.enrollmentStatus}
            </Badge>
            <Badge className={getTierColor(profile.programTier)}>
              {profile.programTier}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="goals">Health Goals</TabsTrigger>
            <TabsTrigger value="benefits">Benefits</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Program Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Participation</span>
                </div>
                <div className="text-2xl font-bold text-green-900">
                  {profile.programMetrics.participationScore}%
                </div>
                <Progress value={profile.programMetrics.participationScore} className="mt-2" />
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Goal Achievement</span>
                </div>
                <div className="text-2xl font-bold text-blue-900">
                  {profile.programMetrics.goalAchievementRate}%
                </div>
                <Progress value={profile.programMetrics.goalAchievementRate} className="mt-2" />
              </div>

              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">Screenings</span>
                </div>
                <div className="text-2xl font-bold text-purple-900">
                  {profile.programMetrics.screeningCompletion}%
                </div>
                <Progress value={profile.programMetrics.screeningCompletion} className="mt-2" />
              </div>

              <div className="bg-orange-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800">Enrolled</span>
                </div>
                <div className="text-2xl font-bold text-orange-900">
                  {Math.floor((Date.now() - profile.programMetrics.enrollmentDate.getTime()) / (1000 * 60 * 60 * 24))}
                </div>
                <div className="text-xs text-orange-700">days</div>
              </div>
            </div>

            {/* Benefits Summary */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Benefits Summary</h3>
                <Award className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    ${profile.benefits.totalEarned}
                  </div>
                  <div className="text-sm text-gray-600">Total Earned</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    ${profile.benefits.totalUsed}
                  </div>
                  <div className="text-sm text-gray-600">Total Used</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    ${profile.benefits.currentBalance}
                  </div>
                  <div className="text-sm text-gray-600">Available</div>
                </div>
              </div>
            </div>

            {/* Upcoming Appointments */}
            <div>
              <h3 className="font-semibold mb-3">Upcoming Appointments</h3>
              {profile.upcomingAppointments.length > 0 ? (
                <div className="space-y-2">
                  {profile.upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{appointment.serviceName}</div>
                        <div className="text-sm text-gray-600">{appointment.clinicName}</div>
                        <div className="text-sm text-gray-500">
                          {appointment.date.toLocaleDateString()} • Dr. {appointment.doctorName}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {appointment.isProgramEligible && (
                          <Badge variant="default" className="bg-green-600">
                            <Shield className="h-3 w-3 mr-1" />
                            Program
                          </Badge>
                        )}
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No upcoming appointments</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Book Appointment
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="goals" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Health Goals</h3>
              <Button size="sm" variant="outline">
                <Target className="h-4 w-4 mr-2" />
                Add Goal
              </Button>
            </div>
            <div className="space-y-4">
              {profile.healthGoals.map((goal) => (
                <Card key={goal.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{goal.title}</h4>
                      <Badge variant={goal.isCompleted ? "default" : "secondary"}>
                        {goal.isCompleted ? "Completed" : "In Progress"}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{goal.progress}%</span>
                      </div>
                      <Progress value={goal.progress} />
                      <div className="text-xs text-gray-500">
                        Target: {goal.targetDate.toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="benefits" className="space-y-4">
            <div className="grid gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">Available Benefits</h3>
                <div className="text-3xl font-bold text-green-900 mb-1">
                  ${profile.benefits.currentBalance}
                </div>
                <p className="text-sm text-green-700">
                  {profile.benefits.nextPayout && (
                    <>Next payout: {profile.benefits.nextPayout.toLocaleDateString()}</>
                  )}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      ${profile.benefits.totalEarned}
                    </div>
                    <div className="text-sm text-gray-600">Total Earned</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      ${profile.benefits.totalUsed}
                    </div>
                    <div className="text-sm text-gray-600">Total Used</div>
                  </CardContent>
                </Card>
              </div>

              <Button className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                View Benefits History
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="activities" className="space-y-4">
            <h3 className="font-semibold">Recent Activities</h3>
            <div className="space-y-3">
              {profile.recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-full",
                      activity.status === 'COMPLETED' ? "bg-green-100" : "bg-yellow-100"
                    )}>
                      {activity.type === 'CONSULTATION' && <Heart className="h-4 w-4 text-green-600" />}
                      {activity.type === 'SCREENING' && <Activity className="h-4 w-4 text-blue-600" />}
                      {activity.type === 'MILESTONE' && <Award className="h-4 w-4 text-purple-600" />}
                      {activity.type === 'GOAL' && <Target className="h-4 w-4 text-orange-600" />}
                    </div>
                    <div>
                      <div className="font-medium">{activity.title}</div>
                      <div className="text-sm text-gray-500">
                        {activity.date.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Badge variant={activity.status === 'COMPLETED' ? "default" : "secondary"}>
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export type { HealthierSGIntegrationPanelProps, UserHealthProfile }