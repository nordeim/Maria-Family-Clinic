/**
 * Notification System Component
 * Sub-Phase 7.5: Doctor Availability & Scheduling Integration
 * 
 * Comprehensive notification system for scheduling updates, conflicts, and waitlist alerts
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  BellRing,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  Calendar,
  Phone,
  Mail,
  MessageSquare,
  X,
  Settings,
  Trash2,
  RefreshCw
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'booking_confirmed' | 'booking_cancelled' | 'waitlist_notified' | 'conflict_detected' | 'slot_released' | 'reminder' | 'schedule_changed';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  data?: any;
  channels: Array<'in_app' | 'sms' | 'email' | 'push'>;
}

interface NotificationPreferences {
  enabledChannels: Array<'in_app' | 'sms' | 'email' | 'push'>;
  quietHours: { start: string; end: string };
  notificationTypes: Record<Notification['type'], boolean>;
  urgencyLevels: Record<Notification['priority'], boolean>;
}

interface NotificationSystemProps {
  doctorId: string;
  isConnected: boolean;
  conflicts: string[];
  waitlistPositions: Record<string, number>;
  onNotificationAction?: (notificationId: string, action: string) => void;
}

export const NotificationSystem: React.FC<NotificationSystemProps> = ({
  doctorId,
  isConnected,
  conflicts,
  waitlistPositions,
  onNotificationAction
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    enabledChannels: ['in_app', 'push'],
    quietHours: { start: '22:00', end: '07:00' },
    notificationTypes: {
      booking_confirmed: true,
      booking_cancelled: true,
      waitlist_notified: true,
      conflict_detected: true,
      slot_released: true,
      reminder: true,
      schedule_changed: true
    },
    urgencyLevels: {
      urgent: true,
      high: true,
      normal: true,
      low: false
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent'>('all');

  // Load notifications
  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/notifications/${doctorId}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
        if (data.preferences) {
          setPreferences(data.preferences);
        }
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
      // Generate demo notifications
      generateDemoNotifications();
    } finally {
      setIsLoading(false);
    }
  };

  // Generate demo notifications for demonstration
  const generateDemoNotifications = () => {
    const demoNotifications: Notification[] = [
      {
        id: '1',
        type: 'booking_confirmed',
        title: 'Appointment Confirmed',
        message: 'Patient John Doe has confirmed appointment for tomorrow at 2:00 PM',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        isRead: false,
        priority: 'normal',
        channels: ['in_app', 'sms']
      },
      {
        id: '2',
        type: 'conflict_detected',
        title: 'Scheduling Conflict',
        message: 'Double booking detected for Dr. Smith slot at 3:00 PM on Dec 15',
        timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        isRead: false,
        priority: 'high',
        channels: ['in_app', 'email']
      },
      {
        id: '3',
        type: 'slot_released',
        title: 'Time Slot Released',
        message: 'Dr. Johnson has cancelled 10:00 AM appointment - available for waitlist',
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        isRead: true,
        priority: 'normal',
        channels: ['in_app', 'push']
      },
      {
        id: '4',
        type: 'waitlist_notified',
        title: 'Waitlist Update',
        message: 'Patient moved from waitlist to confirmed - 2 patients remain in queue',
        timestamp: new Date(Date.now() - 1000 * 60 * 90), // 1.5 hours ago
        isRead: true,
        priority: 'low',
        channels: ['in_app']
      },
      {
        id: '5',
        type: 'reminder',
        title: 'Appointment Reminder',
        message: 'You have 3 appointments scheduled for today. First one is at 9:00 AM.',
        timestamp: new Date(Date.now() - 1000 * 60 * 180), // 3 hours ago
        isRead: true,
        priority: 'normal',
        channels: ['in_app', 'push']
      }
    ];

    setNotifications(demoNotifications);
    setUnreadCount(demoNotifications.filter(n => !n.isRead).length);
  };

  // Load notifications on mount and when doctor changes
  useEffect(() => {
    loadNotifications();
  }, [doctorId]);

  // Filter notifications based on current filter
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'urgent') return notification.priority === 'urgent' || notification.priority === 'high';
    return true;
  });

  // Get notification icon
  const getNotificationIcon = (type: Notification['type'], priority: Notification['priority']) => {
    const iconClass = `w-5 h-5 ${priority === 'urgent' || priority === 'high' ? 'text-red-500' : 'text-gray-500'}`;
    
    switch (type) {
      case 'booking_confirmed':
        return <CheckCircle className={`${iconClass} text-green-500`} />;
      case 'booking_cancelled':
        return <X className={`${iconClass} text-red-500`} />;
      case 'waitlist_notified':
        return <Users className={`${iconClass} text-blue-500`} />;
      case 'conflict_detected':
        return <AlertCircle className={`${iconClass} text-orange-500`} />;
      case 'slot_released':
        return <Clock className={`${iconClass} text-green-500`} />;
      case 'reminder':
        return <Bell className={`${iconClass} text-yellow-500`} />;
      case 'schedule_changed':
        return <Calendar className={`${iconClass} text-purple-500`} />;
      default:
        return <Bell className={iconClass} />;
    }
  };

  // Get priority badge
  const getPriorityBadge = (priority: Notification['priority']) => {
    const badges = {
      urgent: <Badge variant="destructive" className="text-xs">Urgent</Badge>,
      high: <Badge variant="destructive" className="text-xs bg-orange-500 hover:bg-orange-600">High</Badge>,
      normal: <Badge variant="secondary" className="text-xs">Normal</Badge>,
      low: <Badge variant="outline" className="text-xs">Low</Badge>
    };
    
    return badges[priority];
  };

  // Handle mark as read
  const markAsRead = async (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Handle delete notification
  const deleteNotification = async (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && !notification.isRead) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  // Handle mark all as read
  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  // Handle send test notification
  const sendTestNotification = async (type: Notification['type']) => {
    const testNotification: Notification = {
      id: Date.now().toString(),
      type,
      title: 'Test Notification',
      message: `This is a test ${type} notification`,
      timestamp: new Date(),
      isRead: false,
      priority: 'normal',
      channels: ['in_app']
    };

    setNotifications(prev => [testNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  // Get notification statistics
  const getStats = () => {
    const total = notifications.length;
    const unread = unreadCount;
    const urgent = notifications.filter(n => n.priority === 'urgent' || n.priority === 'high').length;
    const today = notifications.filter(n => {
      const today = new Date();
      const notificationDate = new Date(n.timestamp);
      return notificationDate.toDateString() === today.toDateString();
    }).length;

    return { total, unread, urgent, today };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Notifications</h2>
          <p className="text-gray-600">
            Real-time updates for scheduling, conflicts, and waitlist alerts
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={markAllAsRead}
            >
              Mark all read
            </Button>
          )}
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-4 h-4 mr-1" />
            Settings
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={loadNotifications}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-xs text-gray-600">Total</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BellRing className="w-5 h-5 text-red-500" />
              <div>
                <div className="text-2xl font-bold">{stats.unread}</div>
                <div className="text-xs text-gray-600">Unread</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">{stats.urgent}</div>
                <div className="text-xs text-gray-600">Urgent</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{stats.today}</div>
                <div className="text-xs text-gray-600">Today</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notifications List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Recent Notifications
                </CardTitle>
                
                {/* Filter Tabs */}
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant={filter === 'all' ? 'default' : 'outline'}
                    onClick={() => setFilter('all')}
                  >
                    All
                  </Button>
                  <Button
                    size="sm"
                    variant={filter === 'unread' ? 'default' : 'outline'}
                    onClick={() => setFilter('unread')}
                  >
                    Unread
                  </Button>
                  <Button
                    size="sm"
                    variant={filter === 'urgent' ? 'default' : 'outline'}
                    onClick={() => setFilter('urgent')}
                  >
                    Urgent
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No notifications found</p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border rounded-lg transition-all hover:shadow-sm ${
                      !notification.isRead ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getNotificationIcon(notification.type, notification.priority)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium truncate">{notification.title}</h4>
                          {getPriorityBadge(notification.priority)}
                          {!notification.isRead && (
                            <Badge variant="outline" className="text-xs">New</Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {notification.timestamp.toLocaleString()}
                          </span>
                          
                          <div className="flex items-center gap-1">
                            <div className="flex gap-1">
                              {notification.channels.map(channel => {
                                const icons = {
                                  in_app: <div className="w-2 h-2 bg-blue-500 rounded-full" />,
                                  sms: <Phone className="w-3 h-3" />,
                                  email: <Mail className="w-3 h-3" />,
                                  push: <Bell className="w-3 h-3" />
                                };
                                return (
                                  <div key={channel} title={channel} className="text-gray-400">
                                    {icons[channel]}
                                  </div>
                                );
                              })}
                            </div>
                            
                            {!notification.isRead && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => markAsRead(notification.id)}
                                className="text-xs"
                              >
                                Mark read
                              </Button>
                            )}
                            
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteNotification(notification.id)}
                              className="text-xs text-red-500"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Connection Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              
              <div className="text-sm text-gray-600">
                Last update: {new Date().toLocaleTimeString()}
              </div>
            </CardContent>
          </Card>

          {/* Active Conflicts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Active Issues</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {conflicts.length > 0 ? (
                conflicts.slice(0, 3).map((conflict, index) => (
                  <Alert key={index} className="p-3">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      Scheduling conflict detected
                    </AlertDescription>
                  </Alert>
                ))
              ) : (
                <div className="text-sm text-green-600">
                  <CheckCircle className="w-4 h-4 inline mr-1" />
                  No active conflicts
                </div>
              )}
              
              {Object.keys(waitlistPositions).length > 0 && (
                <Alert className="p-3">
                  <Users className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    {Object.values(waitlistPositions).reduce((sum, pos) => sum + pos, 0)} patients on waitlist
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Test Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Test Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => sendTestNotification('booking_confirmed')}
                className="w-full text-left"
              >
                Test Booking Confirmation
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => sendTestNotification('conflict_detected')}
                className="w-full text-left"
              >
                Test Conflict Alert
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => sendTestNotification('slot_released')}
                className="w-full text-left"
              >
                Test Slot Release
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Channels</h4>
                <div className="space-y-2">
                  {(['in_app', 'sms', 'email', 'push'] as const).map(channel => (
                    <label key={channel} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={preferences.enabledChannels.includes(channel)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setPreferences(prev => ({
                              ...prev,
                              enabledChannels: [...prev.enabledChannels, channel]
                            }));
                          } else {
                            setPreferences(prev => ({
                              ...prev,
                              enabledChannels: prev.enabledChannels.filter(c => c !== channel)
                            }));
                          }
                        }}
                      />
                      <span className="capitalize">{channel}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Notification Types</h4>
                <div className="space-y-2">
                  {Object.entries(preferences.notificationTypes).map(([type, enabled]) => (
                    <label key={type} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) => {
                          setPreferences(prev => ({
                            ...prev,
                            notificationTypes: {
                              ...prev.notificationTypes,
                              [type]: e.target.checked
                            }
                          }));
                        }}
                      />
                      <span className="capitalize text-sm">{type.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NotificationSystem;