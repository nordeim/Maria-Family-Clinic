'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Clock, 
  AlertTriangle, 
  Users, 
  MessageSquare, 
  Calendar,
  Trash2,
  Settings,
  Filter,
  Search,
  X
} from 'lucide-react'
import { EnquiryNotification } from './types'
import { formatDistanceToNow } from 'date-fns'

interface EnquiryNotificationCenterProps {
  notifications: EnquiryNotification[]
  onMarkAsRead: (id: string) => void
  onActionTaken: (id: string) => void
  onMarkAllAsRead?: () => void
  onClearAll?: () => void
}

export function EnquiryNotificationCenter({ 
  notifications, 
  onMarkAsRead, 
  onActionTaken,
  onMarkAllAsRead,
  onClearAll
}: EnquiryNotificationCenterProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')

  const unreadCount = notifications.filter(n => !n.isRead).length
  const urgentCount = notifications.filter(n => n.priority === 'urgent' && !n.isRead).length

  const filteredNotifications = notifications.filter(notification => {
    if (searchQuery && !notification.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !notification.message.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    if (filterType !== 'all' && notification.type !== filterType) return false
    if (filterPriority !== 'all' && notification.priority !== filterPriority) return false
    return true
  })

  const groupedNotifications = {
    unread: filteredNotifications.filter(n => !n.isRead),
    read: filteredNotifications.filter(n => n.isRead)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'assignment': return <Users className="h-4 w-4" />
      case 'escalation': return <AlertTriangle className="h-4 w-4" />
      case 'overdue': return <Clock className="h-4 w-4" />
      case 'sla_warning': return <AlertTriangle className="h-4 w-4" />
      case 'follow_up_due': return <Calendar className="h-4 w-4" />
      case 'satisfaction_survey': return <MessageSquare className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive'
      case 'high': return 'secondary'
      case 'medium': return 'default'
      case 'low': return 'outline'
      default: return 'default'
    }
  }

  const getTypeLabel = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Notifications</h3>
          <p className="text-sm text-muted-foreground">
            {unreadCount} unread, {urgentCount} urgent
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && onMarkAllAsRead && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onMarkAllAsRead}
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all read
            </Button>
          )}
          {notifications.length > 0 && onClearAll && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onClearAll}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col space-y-3 md:flex-row md:items-center md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-1 border rounded text-sm"
              >
                <option value="all">All types</option>
                <option value="assignment">Assignment</option>
                <option value="escalation">Escalation</option>
                <option value="overdue">Overdue</option>
                <option value="sla_warning">SLA Warning</option>
                <option value="follow_up_due">Follow-up</option>
                <option value="satisfaction_survey">Survey</option>
              </select>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-1 border rounded text-sm"
              >
                <option value="all">All priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Tabs */}
      <Tabs defaultValue="unread" className="space-y-4">
        <TabsList>
          <TabsTrigger value="unread" className="relative">
            Unread
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value="unread" className="space-y-4">
          {groupedNotifications.unread.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No unread notifications</p>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-2">
                {groupedNotifications.unread.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={onMarkAsRead}
                    onActionTaken={onActionTaken}
                    getNotificationIcon={getNotificationIcon}
                    getPriorityColor={getPriorityColor}
                    getTypeLabel={getTypeLabel}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {filteredNotifications.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No notifications found</p>
                  </CardContent>
                </Card>
              ) : (
                filteredNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={onMarkAsRead}
                    onActionTaken={onActionTaken}
                    getNotificationIcon={getNotificationIcon}
                    getPriorityColor={getPriorityColor}
                    getTypeLabel={getTypeLabel}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Individual Notification Item Component
function NotificationItem({ 
  notification, 
  onMarkAsRead, 
  onActionTaken,
  getNotificationIcon,
  getPriorityColor,
  getTypeLabel
}: {
  notification: EnquiryNotification
  onMarkAsRead: (id: string) => void
  onActionTaken: (id: string) => void
  getNotificationIcon: (type: string) => any
  getPriorityColor: (priority: string) => any
  getTypeLabel: (type: string) => string
}) {
  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!notification.isRead) {
      onMarkAsRead(notification.id)
    }
  }

  const handleActionTaken = (e: React.MouseEvent) => {
    e.stopPropagation()
    onActionTaken(notification.id)
  }

  return (
    <Card 
      className={`transition-colors cursor-pointer ${
        !notification.isRead ? 'bg-primary/5 border-primary' : 'hover:bg-muted/50'
      }`}
      onClick={!notification.isRead ? handleMarkAsRead : undefined}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className={`flex-shrink-0 p-2 rounded-full ${
            notification.priority === 'urgent' ? 'bg-red-100' :
            notification.priority === 'high' ? 'bg-yellow-100' :
            notification.priority === 'medium' ? 'bg-blue-100' : 'bg-gray-100'
          }`}>
            {getNotificationIcon(notification.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <h4 className={`text-sm font-medium ${
                  !notification.isRead ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {notification.title}
                </h4>
                <Badge 
                  variant={getPriorityColor(notification.priority)} 
                  className="text-xs"
                >
                  {notification.priority}
                </Badge>
              </div>
              <div className="flex items-center space-x-1">
                {!notification.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAsRead}
                    className="h-6 w-6 p-0"
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                )}
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
            
            <p className={`text-sm mb-2 ${
              !notification.isRead ? 'text-foreground' : 'text-muted-foreground'
            }`}>
              {notification.message}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <span>{getTypeLabel(notification.type)}</span>
                <span>•</span>
                <span>{notification.recipientType}</span>
              </div>
              
              {notification.actionRequired && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleActionTaken}
                  className="h-6 px-2 text-xs"
                >
                  Action Required
                </Button>
              )}
            </div>
            
            {notification.actionDeadline && (
              <div className="mt-2 text-xs text-orange-600">
                <Clock className="h-3 w-3 inline mr-1" />
                Action deadline: {formatDistanceToNow(new Date(notification.actionDeadline), { addSuffix: true })}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}