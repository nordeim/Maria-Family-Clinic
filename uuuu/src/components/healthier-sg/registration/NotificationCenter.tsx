import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Clock,
  X,
  MarkAsRead,
  Filter,
  Mail,
  Phone,
  MessageCircle
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { toast } from '@/hooks/use-toast'
import type { RegistrationNotification } from '../types/registration'

export interface NotificationCenterProps {
  userId?: string
  registrationId?: string
  maxNotifications?: number
  showFilters?: boolean
  className?: string
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  userId,
  registrationId,
  maxNotifications = 50,
  showFilters = true,
  className = '',
}) => {
  const [notifications, setNotifications] = useState<RegistrationNotification[]>([])
  const [filteredNotifications, setFilteredNotifications] = useState<RegistrationNotification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  // Get notifications
  const { data: notificationData, refetch } = trpc.healthierSg.getRegistrationNotifications.useQuery(
    { registrationId: registrationId || '', limit: maxNotifications },
    { enabled: !!registrationId }
  )

  // Mark notification as read
  const markAsReadMutation = trpc.healthierSg.markNotificationAsRead.useMutation({
    onSuccess: () => {
      refetch()
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  // Mark all notifications as read
  const markAllAsReadMutation = trpc.healthierSg.markAllNotificationsAsRead.useMutation({
    onSuccess: () => {
      toast({
        title: "All Marked as Read",
        description: "All notifications have been marked as read.",
      })
      refetch()
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  // Delete notification
  const deleteNotificationMutation = trpc.healthierSg.deleteNotification.useMutation({
    onSuccess: () => {
      refetch()
      toast({
        title: "Notification Deleted",
        description: "Notification has been deleted.",
      })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  useEffect(() => {
    if (notificationData) {
      setNotifications(notificationData.notifications || [])
      setIsLoading(false)
    }
  }, [notificationData])

  useEffect(() => {
    let filtered = [...notifications]

    // Filter by read/unread status
    if (filter === 'read') {
      filtered = filtered.filter(n => n.read)
    } else if (filter === 'unread') {
      filtered = filtered.filter(n => !n.read)
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(n => n.type === typeFilter)
    }

    setFilteredNotifications(filtered)
  }, [notifications, filter, typeFilter])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'step_completed':
      case 'registration_approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'document_rejected':
      case 'registration_rejected':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'reminder':
        return <Clock className="h-4 w-4 text-orange-600" />
      case 'system_update':
        return <Info className="h-4 w-4 text-blue-600" />
      default:
        return <Bell className="h-4 w-4 text-gray-600" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'info':
        return 'bg-blue-50 border-blue-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Success</Badge>
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Warning</Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
      case 'info':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Info</Badge>
      default:
        return <Badge variant="secondary">General</Badge>
    }
  }

  const handleMarkAsRead = (notificationId: string) => {
    markAsReadMutation.mutate({ notificationId })
  }

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate({ registrationId: registrationId || '' })
  }

  const handleDeleteNotification = (notificationId: string) => {
    deleteNotificationMutation.mutate({ notificationId })
  }

  const getNotificationActionUrl = (notification: RegistrationNotification) => {
    // Determine action URL based on notification type and metadata
    if (notification.actionUrl) {
      return notification.actionUrl
    }

    switch (notification.type) {
      case 'step_completed':
        return '/healthier-sg/registration'
      case 'document_rejected':
        return '/healthier-sg/registration?tab=documents'
      case 'registration_submitted':
        return '/healthier-sg/status'
      case 'registration_approved':
        return '/healthier-sg/dashboard'
      default:
        return null
    }
  }

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
    
    return timestamp.toLocaleDateString()
  }

  const unreadCount = notifications.filter(n => !n.read).length
  const notificationTypes = [...new Set(notifications.map(n => n.type))]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-600" />
              Notification Center
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount} new
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                  <MarkAsRead className="h-4 w-4 mr-2" />
                  Mark All Read
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => refetch()}>
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">Status:</span>
                <div className="flex gap-1">
                  {(['all', 'unread', 'read'] as const).map((filterOption) => (
                    <Button
                      key={filterOption}
                      variant={filter === filterOption ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilter(filterOption)}
                    >
                      {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              {notificationTypes.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Type:</span>
                  <Select
                    value={typeFilter}
                    onValueChange={setTypeFilter}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {notificationTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Notifications ({filteredNotifications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {notifications.length === 0 
                  ? 'No notifications yet' 
                  : 'No notifications match your current filters'
                }
              </p>
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {filteredNotifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`
                      p-4 rounded-lg border transition-all hover:shadow-sm
                      ${notification.read ? 'bg-white' : getSeverityColor(notification.severity)}
                      ${notification.read ? 'border-gray-200' : ''}
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={`text-sm font-medium ${
                                notification.read ? 'text-gray-700' : 'text-gray-900'
                              }`}>
                                {notification.title}
                              </h4>
                              {getSeverityBadge(notification.severity)}
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                              )}
                            </div>
                            <p className={`text-sm ${
                              notification.read ? 'text-gray-600' : 'text-gray-700'
                            } mb-2`}>
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                {getTimeAgo(notification.timestamp)}
                              </span>
                              <div className="flex items-center gap-2">
                                {notification.actionUrl && notification.actionLabel && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="text-xs"
                                    onClick={() => window.open(notification.actionUrl, '_blank')}
                                  >
                                    {notification.actionLabel}
                                  </Button>
                                )}
                                {!notification.read && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleMarkAsRead(notification.id)}
                                  >
                                    Mark Read
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteNotification(notification.id)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="text-center">
            <h4 className="font-medium text-blue-900 mb-2">Need Help?</h4>
            <p className="text-sm text-blue-700 mb-4">
              If you have questions about your registration or need assistance, our support team is here to help.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button variant="outline" size="sm" className="bg-white">
                <Phone className="h-4 w-4 mr-2" />
                Call Support
              </Button>
              <Button variant="outline" size="sm" className="bg-white">
                <Mail className="h-4 w-4 mr-2" />
                Email Support
              </Button>
              <Button variant="outline" size="sm" className="bg-white">
                <MessageCircle className="h-4 w-4 mr-2" />
                Live Chat
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}