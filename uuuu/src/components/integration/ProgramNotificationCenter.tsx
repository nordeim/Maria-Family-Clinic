"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Bell, 
  Shield, 
  Heart, 
  Calendar, 
  Award, 
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  FileText,
  Stethoscope,
  Users,
  TrendingUp,
  DollarSign,
  Settings,
  Filter,
  X,
  MoreVertical,
  ExternalLink,
  Mail,
  Phone
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

interface ProgramNotificationCenterProps {
  userId?: string
  className?: string
  maxHeight?: string
  showHeader?: boolean
  compact?: boolean
}

interface Notification {
  id: string
  type: 'program' | 'health' | 'appointment' | 'benefit' | 'achievement' | 'alert' | 'system'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  title: string
  message: string
  timestamp: Date
  isRead: boolean
  isActionable: boolean
  actionUrl?: string
  actionLabel?: string
  category: string
  metadata?: {
    clinicId?: string
    doctorId?: string
    serviceId?: string
    appointmentId?: string
    benefitId?: string
    goalId?: string
  }
  relatedEntity?: {
    type: 'clinic' | 'doctor' | 'service' | 'appointment' | 'benefit' | 'goal'
    name: string
    id: string
  }
  expiresAt?: Date
}

export function ProgramNotificationCenter({
  userId,
  className,
  maxHeight = "400px",
  showHeader = true,
  compact = false
}: ProgramNotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<'all' | 'unread' | 'program' | 'urgent'>('all')
  const [showSettings, setShowSettings] = useState(false)

  // Mock notifications - would be fetched from API
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'program',
        priority: 'high',
        title: 'Healthier SG Milestone Reached!',
        message: 'Congratulations! You\'ve successfully completed your first health assessment milestone.',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        isRead: false,
        isActionable: true,
        actionUrl: '/milestones',
        actionLabel: 'View Milestone',
        category: 'Program Progress',
        metadata: { goalId: 'goal-1' },
        relatedEntity: { type: 'goal', name: 'Health Assessment', id: 'goal-1' }
      },
      {
        id: '2',
        type: 'health',
        priority: 'urgent',
        title: 'Blood Pressure Alert',
        message: 'Your recent readings show elevated levels. Please schedule a consultation with your doctor.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        isRead: false,
        isActionable: true,
        actionUrl: '/consultation/book',
        actionLabel: 'Book Consultation',
        category: 'Health Alert',
        metadata: { doctorId: 'doc-1' },
        relatedEntity: { type: 'doctor', name: 'Dr. Sarah Tan', id: 'doc-1' }
      },
      {
        id: '3',
        type: 'appointment',
        priority: 'medium',
        title: 'Appointment Reminder',
        message: 'You have a cardiology consultation scheduled for tomorrow at 2:00 PM with Dr. Sarah Tan.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
        isRead: true,
        isActionable: true,
        actionUrl: '/appointments/upcoming',
        actionLabel: 'View Appointment',
        category: 'Appointment',
        metadata: { appointmentId: 'appt-1' },
        relatedEntity: { type: 'appointment', name: 'Cardiology Consultation', id: 'appt-1' }
      },
      {
        id: '4',
        type: 'benefit',
        priority: 'medium',
        title: 'Benefits Payment Processed',
        message: 'Your Healthier SG benefits of $150 have been processed and added to your account.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
        isRead: true,
        isActionable: false,
        category: 'Benefits',
        metadata: { benefitId: 'benefit-1' },
        relatedEntity: { type: 'benefit', name: 'Healthier SG Benefits', id: 'benefit-1' }
      },
      {
        id: '5',
        type: 'achievement',
        priority: 'low',
        title: 'Exercise Goal Achieved!',
        message: 'Great job! You\'ve completed your weekly exercise goal. Keep up the excellent work!',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
        isRead: true,
        isActionable: true,
        actionUrl: '/goals',
        actionLabel: 'View Goals',
        category: 'Achievement',
        metadata: { goalId: 'goal-2' },
        relatedEntity: { type: 'goal', name: 'Exercise Goal', id: 'goal-2' }
      },
      {
        id: '6',
        type: 'system',
        priority: 'low',
        title: 'System Maintenance',
        message: 'Scheduled maintenance on November 5th from 2:00-4:00 AM. Some features may be temporarily unavailable.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
        isRead: true,
        isActionable: true,
        actionUrl: '/maintenance-info',
        actionLabel: 'More Info',
        category: 'System',
        expiresAt: new Date('2024-11-05T06:00:00Z')
      },
      {
        id: '7',
        type: 'program',
        priority: 'high',
        title: 'Screening Due Soon',
        message: 'Your annual health screening is due next month. Book now to secure your preferred time slot.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        isRead: false,
        isActionable: true,
        actionUrl: '/screenings/book',
        actionLabel: 'Book Screening',
        category: 'Program Requirement',
        metadata: { serviceId: 'screening-1' }
      }
    ]
    setNotifications(mockNotifications)
  }, [userId])

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true
    if (filter === 'unread') return !notification.isRead
    if (filter === 'program') return notification.type === 'program' || notification.type === 'benefit'
    if (filter === 'urgent') return notification.priority === 'urgent'
    return true
  })

  const unreadCount = notifications.filter(n => !n.isRead).length

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true }))
    )
  }

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => 
      prev.filter(n => n.id !== notificationId)
    )
  }

  const getNotificationIcon = (type: string, priority: string) => {
    const iconClass = "h-4 w-4"
    
    if (priority === 'urgent') {
      return <AlertCircle className={cn(iconClass, "text-red-600")} />
    }
    
    switch (type) {
      case 'program': return <Shield className={cn(iconClass, "text-green-600")} />
      case 'health': return <Heart className={cn(iconClass, "text-red-600")} />
      case 'appointment': return <Calendar className={cn(iconClass, "text-blue-600")} />
      case 'benefit': return <DollarSign className={cn(iconClass, "text-yellow-600")} />
      case 'achievement': return <Award className={cn(iconClass, "text-purple-600")} />
      case 'alert': return <AlertCircle className={cn(iconClass, "text-orange-600")} />
      case 'system': return <Settings className={cn(iconClass, "text-gray-600")} />
      default: return <Bell className={cn(iconClass, "text-gray-600")} />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'program': return 'bg-green-100 text-green-800'
      case 'health': return 'bg-red-100 text-red-800'
      case 'appointment': return 'bg-blue-100 text-blue-800'
      case 'benefit': return 'bg-yellow-100 text-yellow-800'
      case 'achievement': return 'bg-purple-100 text-purple-800'
      case 'alert': return 'bg-orange-100 text-orange-800'
      case 'system': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className={cn("w-full", className)}>
      {showHeader && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bell className="h-5 w-5 text-gray-600" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </div>
              <div>
                <CardTitle className="text-lg">Notifications</CardTitle>
                <CardDescription>
                  Stay updated on your health and program progress
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Mark All Read
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      )}

      <CardContent className={cn(compact && "p-4", "p-6")}>
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto">
          {[
            { key: 'all', label: 'All', count: notifications.length },
            { key: 'unread', label: 'Unread', count: unreadCount },
            { key: 'program', label: 'Program', count: notifications.filter(n => n.type === 'program' || n.type === 'benefit').length },
            { key: 'urgent', label: 'Urgent', count: notifications.filter(n => n.priority === 'urgent').length }
          ].map((filterOption) => (
            <Button
              key={filterOption.key}
              variant={filter === filterOption.key ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(filterOption.key as any)}
              className="whitespace-nowrap"
            >
              {filterOption.label}
              {filterOption.count > 0 && (
                <Badge variant="secondary" className="ml-1 h-5">
                  {filterOption.count}
                </Badge>
              )}
            </Button>
          ))}
        </div>

        {/* Notifications List */}
        <ScrollArea className="rounded-md" style={{ maxHeight }}>
          <div className="space-y-2">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No notifications to show</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-3 rounded-lg border transition-colors",
                    !notification.isRead && "bg-blue-50 border-blue-200",
                    notification.priority === 'urgent' && "border-red-200 bg-red-50",
                    "hover:bg-gray-50"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-1">
                      {getNotificationIcon(notification.type, notification.priority)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={cn(
                          "text-sm font-medium",
                          !notification.isRead && "text-gray-900",
                          notification.isRead && "text-gray-700"
                        )}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-1 shrink-0">
                          <Badge 
                            variant="outline" 
                            className={cn("text-xs", getPriorityColor(notification.priority))}
                          >
                            {notification.priority}
                          </Badge>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full" />
                          )}
                        </div>
                      </div>
                      
                      <p className={cn(
                        "text-sm mb-2",
                        notification.isRead ? "text-gray-600" : "text-gray-700"
                      )}>
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="secondary" 
                            className={cn("text-xs", getTypeBadgeColor(notification.type))}
                          >
                            {notification.category}
                          </Badge>
                          {notification.relatedEntity && (
                            <span className="text-xs text-gray-500">
                              {notification.relatedEntity.name}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                          </span>
                          {notification.isActionable && notification.actionUrl && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 px-2 text-xs"
                              onClick={() => {
                                // Handle action
                                window.location.href = notification.actionUrl!
                              }}
                            >
                              {notification.actionLabel || 'Action'}
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {!notification.isRead && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="mt-2 h-6 px-2 text-xs"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Mark as Read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Notification Settings</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Email notifications</span>
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4 mr-1" />
                  Configure
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span>SMS alerts</span>
                <Button variant="outline" size="sm">
                  <Phone className="h-4 w-4 mr-1" />
                  Set Up
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {filteredNotifications.length > 0 && (
          <div className="mt-4 flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Filter className="h-4 w-4 mr-1" />
              More Filters
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Settings className="h-4 w-4 mr-1" />
              Preferences
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export type { ProgramNotificationCenterProps, Notification }