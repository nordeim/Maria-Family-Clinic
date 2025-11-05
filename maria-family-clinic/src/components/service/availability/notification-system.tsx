"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BellIcon,
  BellSlashIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  PhoneIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  XMarkIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

interface NotificationPreference {
  id: string;
  type: 'availability_change' | 'appointment_confirmation' | 'waitlist_update' | 'reminder' | 'cancellation';
  title: string;
  description: string;
  enabled: boolean;
  channels: {
    push: boolean;
    sms: boolean;
    email: boolean;
  };
  timing: {
    immediate: boolean;
    scheduled: boolean;
    reminder: number; // minutes before
  };
  conditions: {
    clinicId?: string;
    serviceId?: string;
    doctorId?: string;
    priority?: 'all' | 'high' | 'urgent';
  };
}

interface AvailabilityNotificationSystemProps {
  userId?: string;
  clinicId?: string;
  serviceId?: string;
  doctorId?: string;
  onNotificationSettingsChange?: (preferences: NotificationPreference[]) => void;
}

interface ActiveNotification {
  id: string;
  type: NotificationPreference['type'];
  title: string;
  message: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high';
  actionRequired?: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export function AvailabilityNotificationSystem({
  userId,
  clinicId,
  serviceId,
  doctorId,
  onNotificationSettingsChange,
}: AvailabilityNotificationSystemProps) {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [activeNotifications, setActiveNotifications] = useState<ActiveNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');

  // Default notification preferences
  const defaultPreferences: NotificationPreference[] = [
    {
      id: 'availability_change',
      type: 'availability_change',
      title: 'Availability Changes',
      description: 'Get notified when service availability changes',
      enabled: true,
      channels: { push: true, sms: false, email: true },
      timing: { immediate: true, scheduled: false, reminder: 0 },
      conditions: {},
    },
    {
      id: 'appointment_confirmation',
      type: 'appointment_confirmation',
      title: 'Appointment Confirmations',
      description: 'Confirmations for booked appointments',
      enabled: true,
      channels: { push: true, sms: true, email: true },
      timing: { immediate: true, scheduled: false, reminder: 60 },
      conditions: {},
    },
    {
      id: 'waitlist_update',
      type: 'waitlist_update',
      title: 'Waitlist Updates',
      description: 'Updates about waitlist position changes',
      enabled: true,
      channels: { push: true, sms: false, email: true },
      timing: { immediate: true, scheduled: false, reminder: 0 },
      conditions: {},
    },
    {
      id: 'reminder',
      type: 'reminder',
      title: 'Appointment Reminders',
      description: 'Reminders before your appointments',
      enabled: true,
      channels: { push: true, sms: false, email: true },
      timing: { immediate: false, scheduled: false, reminder: 120 },
      conditions: {},
    },
  ];

  useEffect(() => {
    loadPreferences();
    loadActiveNotifications();
    checkNotificationPermission();
  }, []);

  const loadPreferences = async () => {
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        setPreferences(data.preferences || defaultPreferences);
      } else {
        setPreferences(defaultPreferences);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
      setPreferences(defaultPreferences);
    }
  };

  const savePreferences = async (newPreferences: NotificationPreference[]) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: newPreferences }),
      });

      if (response.ok) {
        setPreferences(newPreferences);
        onNotificationSettingsChange?.(newPreferences);
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadActiveNotifications = async () => {
    try {
      const response = await fetch('/api/notifications/active', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        setActiveNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Failed to load active notifications:', error);
    }
  };

  const checkNotificationPermission = async () => {
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      
      if (permission === 'granted') {
        // Register for push notifications
        await registerPushNotifications();
      }
    }
  };

  const registerPushNotifications = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: 'YOUR_VAPID_PUBLIC_KEY' // Replace with actual key
      });
      
      // Send subscription to server
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          subscription,
          clinicId,
          serviceId,
          doctorId 
        }),
      });
    } catch (error) {
      console.error('Failed to register push notifications:', error);
    }
  };

  const updatePreference = (id: string, updates: Partial<NotificationPreference>) => {
    const newPreferences = preferences.map(pref =>
      pref.id === id ? { ...pref, ...updates } : pref
    );
    savePreferences(newPreferences);
  };

  const updateChannel = (id: string, channel: keyof NotificationPreference['channels'], enabled: boolean) => {
    const newPreferences = preferences.map(pref =>
      pref.id === id 
        ? { ...pref, channels: { ...pref.channels, [channel]: enabled } }
        : pref
    );
    savePreferences(newPreferences);
  };

  const dismissNotification = (id: string) => {
    setActiveNotifications(prev => prev.filter(n => n.id !== id));
    
    // Optionally notify server
    fetch(`/api/notifications/dismiss/${id}`, { method: 'POST' });
  };

  const getNotificationIcon = (type: NotificationPreference['type']) => {
    switch (type) {
      case 'availability_change':
        return ClockIcon;
      case 'appointment_confirmation':
        return CheckCircleIcon;
      case 'waitlist_update':
        return UserGroupIcon;
      case 'reminder':
        return BellIcon;
      case 'cancellation':
        return ExclamationTriangleIcon;
      default:
        return BellIcon;
    }
  };

  const getPriorityColor = (priority: ActiveNotification['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Permission Request */}
      {permissionStatus === 'default' && (
        <Alert>
          <BellIcon className="h-4 w-4" />
          <AlertDescription>
            Enable notifications to receive real-time updates about availability changes and appointment confirmations.
            <div className="mt-2">
              <Button 
                size="sm" 
                onClick={requestNotificationPermission}
                variant="outline"
              >
                Enable Notifications
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Permission Denied */}
      {permissionStatus === 'denied' && (
        <Alert>
          <BellSlashIcon className="h-4 w-4" />
          <AlertDescription>
            Notifications are blocked. Please enable them in your browser settings to receive real-time updates.
          </AlertDescription>
        </Alert>
      )}

      {/* Active Notifications */}
      {activeNotifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BellIcon className="h-5 w-5 text-blue-500" />
              <span>Active Notifications</span>
              <Badge variant="secondary">{activeNotifications.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeNotifications.map((notification) => {
                const NotificationIcon = getNotificationIcon(notification.type);
                return (
                  <div 
                    key={notification.id}
                    className={`p-4 rounded-lg border ${getPriorityColor(notification.priority)}`}
                  >
                    <div className="flex items-start space-x-3">
                      <NotificationIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium">{notification.title}</div>
                        <div className="text-sm mt-1">{notification.message}</div>
                        <div className="text-xs text-gray-500 mt-2">
                          {new Date(notification.timestamp).toLocaleString()}
                        </div>
                        {notification.actionRequired && notification.actionUrl && (
                          <Button size="sm" variant="outline" className="mt-2">
                            Take Action
                          </Button>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismissNotification(notification.id)}
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Cog6ToothIcon className="h-5 w-5 text-gray-500" />
            <span>Notification Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {preferences.map((preference) => (
              <div key={preference.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{preference.title}</h4>
                    <p className="text-sm text-gray-600">{preference.description}</p>
                  </div>
                  <Switch
                    checked={preference.enabled}
                    onCheckedChange={(enabled) => 
                      updatePreference(preference.id, { enabled })
                    }
                  />
                </div>

                {preference.enabled && (
                  <div className="space-y-4">
                    {/* Notification Channels */}
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">
                        Notification Channels
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <DevicePhoneMobileIcon className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">Push Notifications</span>
                          </div>
                          <Switch
                            checked={preference.channels.push}
                            onCheckedChange={(checked) => 
                              updateChannel(preference.id, 'push', checked)
                            }
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <EnvelopeIcon className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">Email</span>
                          </div>
                          <Switch
                            checked={preference.channels.email}
                            onCheckedChange={(checked) => 
                              updateChannel(preference.id, 'email', checked)
                            }
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <PhoneIcon className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">SMS</span>
                          </div>
                          <Switch
                            checked={preference.channels.sms}
                            onCheckedChange={(checked) => 
                              updateChannel(preference.id, 'sms', checked)
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* Timing Settings */}
                    {preference.type === 'reminder' && (
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">
                          Reminder Timing
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">Send reminder</span>
                          <select
                            value={preference.timing.reminder}
                            onChange={(e) => 
                              updatePreference(preference.id, {
                                timing: {
                                  ...preference.timing,
                                  reminder: parseInt(e.target.value)
                                }
                              })
                            }
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                          >
                            <option value={15}>15 minutes before</option>
                            <option value={30}>30 minutes before</option>
                            <option value={60}>1 hour before</option>
                            <option value={120}>2 hours before</option>
                            <option value={1440}>1 day before</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}