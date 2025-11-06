import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  BarChart3,
  CheckCircle, 
  Clock, 
  Calendar,
  User,
  Shield,
  FileText,
  Target,
  TrendingUp,
  Award,
  Bell,
  Settings,
  Phone,
  Mail,
  MessageCircle,
  ExternalLink,
  Download,
  AlertCircle
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { toast } from '@/hooks/use-toast'
import type { RegistrationStatus } from '../types/registration'

export interface RegistrationDashboardProps {
  userId?: string
  registrationId?: string
  className?: string
}

export const RegistrationDashboard: React.FC<RegistrationDashboardProps> = ({
  userId,
  registrationId,
  className = '',
}) => {
  const [registrationStatus, setRegistrationStatus] = useState<RegistrationStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Get registration status
  const { data: statusData, refetch } = trpc.healthierSg.getRegistrationStatus.useQuery(
    { registrationId: registrationId || '' },
    { enabled: !!registrationId }
  )

  // Get user's health profile
  const { data: profile } = trpc.user.getProfile.useQuery()

  // Get recent notifications
  const { data: notifications } = trpc.healthierSg.getRegistrationNotifications.useQuery(
    { registrationId: registrationId || '', limit: 5 },
    { enabled: !!registrationId }
  )

  // Get health goals progress
  const { data: healthGoals } = trpc.healthierSg.getHealthGoalsProgress.useQuery(
    { registrationId: registrationId || '' },
    { enabled: !!registrationId }
  )

  useEffect(() => {
    if (statusData) {
      setRegistrationStatus(statusData)
      setIsLoading(false)
    }
  }, [statusData])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'submitted':
      case 'under_review':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'needs_revision':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  }

  const getNextMilestone = () => {
    if (!registrationStatus) return null

    const milestones = [
      { id: 'submitted', title: 'Application Submitted', completed: true },
      { id: 'under_review', title: 'Document Review', completed: ['under_review', 'approved'].includes(registrationStatus.status) },
      { id: 'approved', title: 'Program Approval', completed: registrationStatus.status === 'approved' },
      { id: 'enrollment', title: 'Program Enrollment', completed: false },
      { id: 'first_visit', title: 'Initial Consultation', completed: false },
    ]

    return milestones.find(m => !m.completed) || milestones[milestones.length - 1]
  }

  const getDashboardActions = () => {
    if (!registrationStatus) return []

    switch (registrationStatus.status) {
      case 'approved':
        return [
          {
            title: 'Schedule First Appointment',
            description: 'Book your initial health screening',
            icon: Calendar,
            action: () => window.open('/appointments/book', '_blank'),
            variant: 'default' as const,
          },
          {
            title: 'View Health Profile',
            description: 'Access your personalized health dashboard',
            icon: User,
            action: () => window.open('/health-profile', '_blank'),
            variant: 'outline' as const,
          },
          {
            title: 'Contact Support',
            description: 'Get help from our team',
            icon: Phone,
            action: () => window.open('/support', '_blank'),
            variant: 'outline' as const,
          },
        ]
      
      case 'submitted':
      case 'under_review':
        return [
          {
            title: 'Track Application Status',
            description: 'View detailed progress updates',
            icon: CheckCircle,
            action: () => window.open('/healthier-sg/status', '_blank'),
            variant: 'outline' as const,
          },
          {
            title: 'Prepare for Screening',
            description: 'Learn what to expect',
            icon: FileText,
            action: () => window.open('/preparation-guide', '_blank'),
            variant: 'outline' as const,
          },
        ]

      case 'needs_revision':
        return [
          {
            title: 'Complete Required Updates',
            description: 'Address application feedback',
            icon: Shield,
            action: () => window.open('/healthier-sg/registration', '_blank'),
            variant: 'default' as const,
          },
          {
            title: 'Contact Support',
            description: 'Get help with updates',
            icon: MessageCircle,
            action: () => window.open('/support', '_blank'),
            variant: 'outline' as const,
          },
        ]

      default:
        return []
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold mb-2">Loading Dashboard</h3>
          <p className="text-gray-600">Please wait while we fetch your registration information...</p>
        </div>
      </div>
    )
  }

  if (!registrationStatus) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Registration Not Found</h3>
          <p className="text-gray-600 mb-4">
            We couldn't find your Healthier SG registration. You may need to start a new application.
          </p>
          <Button>
            Start Registration
          </Button>
        </CardContent>
      </Card>
    )
  }

  const dashboardActions = getDashboardActions()
  const nextMilestone = getNextMilestone()
  const unreadNotifications = notifications?.notifications?.filter(n => !n.read).length || 0

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Welcome Header */}
      <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <CardContent className="pt-8 pb-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">
              Welcome to Healthier SG, {profile?.firstName || 'Participant'}!
            </h1>
            <p className="text-blue-100 mb-6">
              Track your registration progress and access your personalized health dashboard
            </p>
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Secure Registration</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Government Approved</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Personalized Care</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Registration Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Registration Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <Badge className={getStatusColor(registrationStatus.status)}>
                {registrationStatus.status.replace('_', ' ').toUpperCase()}
              </Badge>
              <span className="text-sm text-gray-500">
                {registrationStatus.progress?.completionPercentage || 0}% Complete
              </span>
            </div>
            <Progress value={registrationStatus.progress?.completionPercentage || 0} className="w-full" />
            <p className="text-xs text-gray-500 mt-2">
              Current Step: {registrationStatus.currentStep.replace('-', ' ')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Next Milestone</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 rounded-full p-2">
                <Clock className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="font-medium text-sm">{nextMilestone?.title}</p>
                <p className="text-xs text-gray-500">
                  {registrationStatus.status === 'approved' ? 'Ready to proceed' : 'In progress'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4 text-gray-600" />
                <span className="text-sm">Updates Available</span>
              </div>
              {unreadNotifications > 0 && (
                <Badge variant="destructive">
                  {unreadNotifications} new
                </Badge>
              )}
            </div>
            {unreadNotifications === 0 && (
              <p className="text-xs text-gray-500 mt-1">All caught up!</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Progress Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Registration Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { id: 'personal-info', title: 'Personal Information', icon: User, completed: true },
              { id: 'identity-verification', title: 'Identity Verification', icon: Shield, completed: true },
              { id: 'digital-consent', title: 'Digital Consent', icon: FileText, completed: true },
              { id: 'document-upload', title: 'Document Upload', icon: FileText, completed: true },
              { id: 'health-goals', title: 'Health Goals', icon: Target, completed: true },
              { id: 'review-submit', title: 'Review & Submit', icon: CheckCircle, completed: true },
            ].map((step, index) => {
              const isCompleted = index < 4 || registrationStatus.progress?.completedSteps.includes(step.id)
              const isCurrent = registrationStatus.currentStep === step.id
              
              return (
                <div key={step.id} className="flex items-center gap-4">
                  <div className={`
                    rounded-full p-2 
                    ${isCompleted ? 'bg-green-100' : isCurrent ? 'bg-blue-100' : 'bg-gray-100'}
                  `}>
                    <step.icon className={`
                      h-4 w-4 
                      ${isCompleted ? 'text-green-600' :
                        isCurrent ? 'text-blue-600' :
                        'text-gray-400'}
                    `} />
                  </div>
                  <div className="flex-1">
                    <p className={`
                      font-medium text-sm 
                      ${isCompleted ? 'text-green-900' :
                        isCurrent ? 'text-blue-900' :
                        'text-gray-500'}
                    `}>
                      {step.title}
                    </p>
                    {isCompleted && (
                      <p className="text-xs text-green-600">✓ Completed</p>
                    )}
                    {isCurrent && (
                      <p className="text-xs text-blue-600">Currently active</p>
                    )}
                  </div>
                  <Badge 
                    variant={isCompleted ? 'default' : 'secondary'}
                    className={isCompleted ? 'bg-green-100 text-green-800' : ''}
                  >
                    {isCompleted ? 'Complete' : 
                     isCurrent ? 'Active' : 'Pending'}
                  </Badge>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant}
                className="h-auto p-4 justify-start"
                onClick={action.action}
              >
                <div className="flex items-center gap-3">
                  <action.icon className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-medium">{action.title}</p>
                    <p className="text-xs opacity-70">{action.description}</p>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Health Goals Progress */}
      {healthGoals && healthGoals.goals && healthGoals.goals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4" />
              Health Goals Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {healthGoals.goals.slice(0, 3).map((goal, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{goal.title}</span>
                    <span className="text-gray-500">{goal.progress || 0}%</span>
                  </div>
                  <Progress value={goal.progress || 0} className="w-full" />
                </div>
              ))}
              {healthGoals.goals.length > 3 && (
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View All Goals
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Notifications */}
      {notifications && notifications.notifications && notifications.notifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Recent Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32">
              <div className="space-y-3">
                {notifications.notifications.slice(0, 3).map((notification) => (
                  <div key={notification.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
                    <div className={`
                      rounded-full p-1 mt-1
                      ${notification.severity === 'success' ? 'bg-green-100' :
                        notification.severity === 'warning' ? 'bg-yellow-100' :
                        notification.severity === 'error' ? 'bg-red-100' :
                        'bg-blue-100'}
                    `}>
                      {notification.severity === 'success' ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : notification.severity === 'warning' ? (
                        <Clock className="h-3 w-3 text-yellow-600" />
                      ) : notification.severity === 'error' ? (
                        <AlertCircle className="h-3 w-3 text-red-600" />
                      ) : (
                        <Bell className="h-3 w-3 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-xs text-gray-600 truncate">{notification.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Support & Resources */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-base text-blue-800">Support & Resources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="bg-white justify-start">
              <Phone className="h-4 w-4 mr-2" />
              Call Support: 1800-HEALTHIER
            </Button>
            <Button variant="outline" className="bg-white justify-start">
              <Mail className="h-4 w-4 mr-2" />
              Email: support@healthiersg.gov.sg
            </Button>
            <Button variant="outline" className="bg-white justify-start">
              <MessageCircle className="h-4 w-4 mr-2" />
              Live Chat Support
            </Button>
          </div>

          <div className="flex flex-wrap gap-3 pt-4 border-t border-blue-200">
            <Button variant="ghost" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download User Guide
            </Button>
            <Button variant="ghost" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              FAQ & Help
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Account Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}