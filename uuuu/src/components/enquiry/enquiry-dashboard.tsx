'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RefreshCw, Plus, AlertTriangle, CheckCircle, Clock, Users, TrendingUp, Filter } from 'lucide-react'
import { 
  EnquiryStats, 
  EnquiryData, 
  EnquiryFilters, 
  EnquiryNotification,
  EnquiryDashboardConfig 
} from './types'
import { EnquiryList } from './enquiry-list'
import { EnquiryStats as EnquiryStatsComponent } from './enquiry-stats'
import { EnquiryFilters as EnquiryFiltersComponent } from './enquiry-filters'
import { EnquiryNotificationCenter } from './enquiry-notification-center'
import { EnquiryAnalytics } from './enquiry-analytics'
import { useToast } from '@/hooks/use-toast'
import { useEnquiry } from '@/hooks/use-enquiry'
import { format, isAfter, isBefore, subHours } from 'date-fns'

interface EnquiryDashboardProps {
  userId?: string
  userRole: 'STAFF' | 'ADMIN'
  clinicId?: string
  config?: Partial<EnquiryDashboardConfig>
}

export default function EnquiryDashboard({
  userId,
  userRole,
  clinicId,
  config = {}
}: EnquiryDashboardProps) {
  const [enquiries, setEnquiries] = useState<EnquiryData[]>([])
  const [stats, setStats] = useState<EnquiryStats | null>(null)
  const [notifications, setNotifications] = useState<EnquiryNotification[]>([])
  const [filters, setFilters] = useState<EnquiryFilters>({})
  const [selectedEnquiry, setSelectedEnquiry] = useState<EnquiryData | null>(null)
  const [view, setView] = useState<'list' | 'grid' | 'kanban'>(config.defaultView || 'list')
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(config.autoRefresh || true)
  const [activeTab, setActiveTab] = useState('overview')
  const [alerts, setAlerts] = useState<Array<{ type: 'warning' | 'info' | 'success', message: string }>>([])

  const { toast } = useToast()
  const enquiryAPI = useEnquiry()

  // Auto-refresh logic
  useEffect(() => {
    if (!autoRefresh || !config.refreshInterval) return

    const interval = setInterval(() => {
      handleRefresh()
    }, config.refreshInterval * 1000)

    return () => clearInterval(interval)
  }, [autoRefresh, config.refreshInterval])

  // Check for overdue items and generate alerts
  useEffect(() => {
    if (!enquiries.length) return

    const overdueItems = enquiries.filter(enquiry => {
      if (enquiry.status === 'RESOLVED' || enquiry.status === 'CLOSED') return false
      
      const createdAt = new Date(enquiry.createdAt)
      const now = new Date()
      const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
      
      // Define SLA targets
      const slaTargets = {
        URGENT: 2,      // 2 hours for urgent
        HIGH: 4,        // 4 hours for high priority
        NORMAL: 8,      // 8 hours for normal
        LOW: 24         // 24 hours for low
      }
      
      const target = slaTargets[enquiry.priority] || 8
      return hoursDiff > target
    })

    const newAlerts = []
    
    if (overdueItems.length > 0) {
      newAlerts.push({
        type: 'warning' as const,
        message: `${overdueItems.length} enquiry${overdueItems.length > 1 ? 's are' : ' is'} overdue and require immediate attention`
      })
    }

    const urgentItems = enquiries.filter(e => e.priority === 'URGENT' && e.status !== 'RESOLVED' && e.status !== 'CLOSED')
    if (urgentItems.length > 0) {
      newAlerts.push({
        type: 'info' as const,
        message: `${urgentItems.length} urgent enquiry${urgentItems.length > 1 ? 's' : ''} awaiting response`
      })
    }

    setAlerts(newAlerts)
  }, [enquiries])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([loadEnquiries(), loadStats(), loadNotifications()])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh data. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const loadEnquiries = async () => {
    setIsLoading(true)
    try {
      const response = await enquiryAPI.getAll({
        page: 1,
        limit: 50,
        ...filters
      })
      setEnquiries(response.data)
    } catch (error) {
      console.error('Failed to load enquiries:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const statsData = await enquiryAPI.getStats()
      setStats(statsData)
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const loadNotifications = async () => {
    try {
      const notificationsData = await enquiryAPI.getNotifications()
      setNotifications(notificationsData)
    } catch (error) {
      console.error('Failed to load notifications:', error)
    }
  }

  const handleFilterChange = (newFilters: EnquiryFilters) => {
    setFilters(newFilters)
    loadEnquiries()
  }

  const handleEnquiryUpdate = (updatedEnquiry: EnquiryData) => {
    setEnquiries(prev => 
      prev.map(e => e.id === updatedEnquiry.id ? updatedEnquiry : e)
    )
    if (selectedEnquiry?.id === updatedEnquiry.id) {
      setSelectedEnquiry(updatedEnquiry)
    }
    loadStats() // Refresh stats
  }

  const handleBulkAction = async (enquiryIds: string[], action: string, parameters: any) => {
    try {
      await enquiryAPI.bulkAction({ enquiryIds, action, parameters })
      await loadEnquiries()
      await loadStats()
      
      toast({
        title: "Success",
        description: `Bulk action "${action}" completed successfully.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to perform bulk action. Please try again.",
        variant: "destructive"
      })
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'destructive'
      case 'HIGH': return 'secondary'
      case 'NORMAL': return 'default'
      case 'LOW': return 'outline'
      default: return 'default'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'secondary'
      case 'IN_PROGRESS': return 'default'
      case 'PENDING': return 'outline'
      case 'RESOLVED': return 'default'
      case 'CLOSED': return 'secondary'
      default: return 'default'
    }
  }

  // Initial load
  useEffect(() => {
    handleRefresh()
  }, [filters, clinicId])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enquiry Management</h1>
          <p className="text-muted-foreground">
            Manage and track patient enquiries with automated workflow
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-green-50' : ''}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Auto-refresh
          </Button>
          <Button onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {alerts.map((alert, index) => (
        <Alert key={index} variant={alert.type === 'warning' ? 'destructive' : 'default'}>
          {alert.type === 'warning' && <AlertTriangle className="h-4 w-4" />}
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      ))}

      {/* Stats Overview */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Enquiries</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.today} today, {stats.thisWeek} this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Response</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.new + stats.pending}</div>
              <p className="text-xs text-muted-foreground">
                {stats.inProgress} in progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.resolved}</div>
              <p className="text-xs text-muted-foreground">
                {stats.closed} closed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.satisfactionScore.toFixed(1)}/5</div>
              <p className="text-xs text-muted-foreground">
                Avg. {Math.round(stats.averageResponseTime)}h response time
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="enquiries">Enquiries</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="notifications">
            Notifications
            {notifications.filter(n => !n.isRead).length > 0 && (
              <Badge variant="destructive" className="ml-2 h-2 w-2 rounded-full p-0" />
            )}
          </TabsTrigger>
          {userRole === 'ADMIN' && (
            <TabsTrigger value="settings">Settings</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <EnquiryStatsComponent
              stats={stats}
              isLoading={isLoading}
            />
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest enquiry updates and responses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {enquiries.slice(0, 5).map((enquiry) => (
                    <div key={enquiry.id} className="flex items-center space-x-4">
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {enquiry.subject}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {enquiry.name} • {format(new Date(enquiry.createdAt), 'MMM d, h:mm a')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getStatusColor(enquiry.status)} className="text-xs">
                          {enquiry.status}
                        </Badge>
                        <Badge variant={getPriorityColor(enquiry.priority)} className="text-xs">
                          {enquiry.priority}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="enquiries" className="space-y-4">
          <div className="flex items-center justify-between">
            <EnquiryFiltersComponent
              filters={filters}
              onFiltersChange={handleFilterChange}
              clinicId={clinicId}
            />
          </div>

          <EnquiryList
            enquiries={enquiries}
            selectedEnquiry={selectedEnquiry}
            onEnquirySelect={setSelectedEnquiry}
            onEnquiryUpdate={handleEnquiryUpdate}
            onBulkAction={handleBulkAction}
            view={view}
            onViewChange={setView}
            isLoading={isLoading}
            userRole={userRole}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <EnquiryAnalytics
            enquiries={enquiries}
            stats={stats}
            clinicId={clinicId}
          />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <EnquiryNotificationCenter
            notifications={notifications}
            onMarkAsRead={(id) => {
              setNotifications(prev => 
                prev.map(n => n.id === id ? { ...n, isRead: true, readAt: new Date() } : n)
              )
            }}
            onActionTaken={(id) => {
              setNotifications(prev => 
                prev.filter(n => n.id !== id)
              )
            }}
          />
        </TabsContent>

        {userRole === 'ADMIN' && (
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Enquiry Management Settings</CardTitle>
                <CardDescription>
                  Configure workflow automation, SLA targets, and escalation rules
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Settings panel will be implemented here with configuration options for:
                </p>
                <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                  <li>• SLA target configuration</li>
                  <li>• Auto-assignment rules</li>
                  <li>• Escalation workflows</li>
                  <li>• Notification preferences</li>
                  <li>• Response templates</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}