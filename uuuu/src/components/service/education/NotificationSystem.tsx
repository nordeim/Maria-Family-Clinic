"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BellIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  UserIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  DocumentTextIcon,
  PlayIcon,
  BookmarkIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface NotificationTemplate {
  id: string;
  type: 'reminder' | 'instruction' | 'warning' | 'support' | 'appointment';
  title: {
    en: string;
    zh: string;
    ms: string;
    ta: string;
  };
  message: {
    en: string;
    zh: string;
    ms: string;
    ta: string;
  };
  trigger: {
    type: 'time' | 'event' | 'manual';
    value: string | number; // e.g., "24h", "7d", or specific event
  };
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actions: NotificationAction[];
  medicalVerified: boolean;
  verifiedBy?: string;
  channels: ('email' | 'sms' | 'push' | 'in-app')[];
}

interface NotificationAction {
  id: string;
  type: 'link' | 'contact' | 'download' | 'complete-task';
  label: {
    en: string;
    zh: string;
    ms: string;
    ta: string;
  };
  target?: string;
  icon?: string;
}

interface NotificationSchedule {
  id: string;
  patientId: string;
  serviceId: string;
  templateId: string;
  scheduledFor: Date;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'clicked';
  channel: 'email' | 'sms' | 'push' | 'in-app';
  locale: string;
  data?: any;
}

interface NotificationSystemProps {
  patientId: string;
  serviceId: string;
  serviceName: string;
  procedureDate: Date;
  locale: string;
  onNotificationAction?: (actionId: string, data?: any) => void;
}

export function NotificationSystem({
  patientId,
  serviceId,
  serviceName,
  procedureDate,
  locale = 'en',
  onNotificationAction
}: NotificationSystemProps) {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [scheduledNotifications, setScheduledNotifications] = useState<NotificationSchedule[]>([]);
  const [notificationHistory, setNotificationHistory] = useState<NotificationSchedule[]>([]);
  const [preferences, setPreferences] = useState({
    email: true,
    sms: true,
    push: true,
    inApp: true,
    reminderDays: [7, 3, 1, 0],
    quietHours: { start: '22:00', end: '08:00' }
  });

  // Comprehensive notification templates database
  const notificationTemplates: NotificationTemplate[] = [
    // Reminder Notifications
    {
      id: 'prep-reminder-7d',
      type: 'reminder',
      title: {
        en: 'Preparation Reminder: 1 Week to Go',
        zh: '准备提醒：还有1周时间',
        ms: 'Peringatan Persediaan: 1 Minggu Lagi',
        ta: 'தயாரிப்பு நினைவூட்டல்: வரும் 1 வாரம்'
      },
      message: {
        en: `Your ${serviceName} is scheduled for next week. Please review your preparation guidelines and complete any required tests.`,
        zh: `您的${serviceName}计划在下周进行。请查看您的准备指南并完成任何必要的检查。`,
        ms: `${serviceName} anda dijadualkan minggu depan. Sila semak garis panduan persediaan anda dan lengapkan sebarang ujian yang diperlukan.`,
        ta: `உங்கள் ${serviceName} அடுத்த வாரத்திற்கு திட்டமிடப்பட்டுள்ளது. உங்கள் தயாரிப்பு வழிகாட்டிகளை மதிப்பாய்வு செய்து தேவையான சோதனைகளை முடிக்கவும்.`
      },
      trigger: {
        type: 'time',
        value: '7d'
      },
      priority: 'medium',
      actions: [
        {
          id: 'view-prep-guide',
          type: 'link',
          label: {
            en: 'View Preparation Guide',
            zh: '查看准备指南',
            ms: 'Lihat Panduan Persediaan',
            ta: 'தயாரிப்பு வழிகாட்டியை பார்க்கவும்'
          },
          target: '/education/preparation'
        },
        {
          id: 'contact-nurse',
          type: 'contact',
          label: {
            en: 'Ask a Nurse',
            zh: '咨询护士',
            ms: 'Tanya Jururawat',
            ta: 'செவிலியரிடம் கேளுங்கள்'
          },
          icon: 'phone'
        }
      ],
      medicalVerified: true,
      verifiedBy: 'Patient Education Team',
      channels: ['email', 'push', 'in-app']
    },
    {
      id: 'prep-reminder-3d',
      type: 'reminder',
      title: {
        en: 'Important: 3 Days Until Your Procedure',
        zh: '重要：3天后进行您的手术',
        ms: 'Penting: 3 Hari Lagi Prosedur Anda',
        ta: 'முக்கியமானது: உங்கள் நடைமுறைக்கு 3 நாட்கள்'
      },
      message: {
        en: `Your ${serviceName} is in 3 days. Please confirm your appointment and review the fasting instructions.`,
        zh: `您的${serviceName}将在3天后进行。请确认您的预约并查看禁食指示。`,
        ms: `${serviceName} anda dalam 3 hari. Sila sahkan janji temu anda dan semak arahan puasa.`,
        ta: `உங்கள் ${serviceName} 3 நாட்களில் உள்ளது. உங்கள் சந்திப்பை உறுதிப்படுத்தவும் மற்றும் நோன்பு வழிமுறைகளை மதிப்பாய்வு செய்யுங்கள்.`
      },
      trigger: {
        type: 'time',
        value: '3d'
      },
      priority: 'high',
      actions: [
        {
          id: 'confirm-appointment',
          type: 'link',
          label: {
            en: 'Confirm Appointment',
            zh: '确认预约',
            ms: 'Sahkan Janji Temu',
            ta: 'சந்திப்பை உறுதிப்படுத்கவும்'
          },
          target: '/appointments/confirm'
        },
        {
          id: 'review-fasting',
          type: 'download',
          label: {
            en: 'Download Fasting Guide',
            zh: '下载禁食指南',
            ms: 'Muat Turun Panduan Puasa',
            ta: 'நோன்பு வழிகாட்டியைப் பதிவிறக்கவும்'
          }
        }
      ],
      medicalVerified: true,
      verifiedBy: 'Nursing Team',
      channels: ['email', 'sms', 'push', 'in-app']
    },
    {
      id: 'prep-reminder-1d',
      type: 'reminder',
      title: {
        en: 'Final Reminder: Tomorrow is Your Procedure Day',
        zh: '最后提醒：明天是您的手术日',
        ms: 'Peringatan Akhir: Besok Hari Prosedur Anda',
        ta: 'இறுதி நினைவூட்டல்: நாளை உங்கள் நடைமுறை நாள்'
      },
      message: {
        en: `Your ${serviceName} is tomorrow. Please review the final checklist and prepare for your arrival.`,
        zh: `您的${serviceName}在明天。请查看最终检查清单并准备到达。`,
        ms: `${serviceName} anda esok. Sila semak senarai semak akhir dan sediakan ketibaan anda.`,
        ta: `உங்கள் ${serviceName} நாளை உள்ளது. இறுதி சேக்லிஸ்டை மதிப்பாய்வு செய்து உங்கள் வருகையை தயாரிக்கவும்.`
      },
      trigger: {
        type: 'time',
        value: '1d'
      },
      priority: 'urgent',
      actions: [
        {
          id: 'final-checklist',
          type: 'link',
          label: {
            en: 'View Final Checklist',
            zh: '查看最终检查清单',
            ms: 'Lihat Senarai Semak Akhir',
            ta: 'இறுதி சேக்லிஸ்டை பார்க்கவும்'
          },
          target: '/education/checklist'
        },
        {
          id: 'get-directions',
          type: 'link',
          label: {
            en: 'Get Directions',
            zh: '获取路线',
            ms: 'Dapatkan Arah',
            ta: 'வழிகாட்டிகளைப் பெறுங்கள்'
          },
          target: '/directions'
        }
      ],
      medicalVerified: true,
      verifiedBy: 'Care Coordination Team',
      channels: ['email', 'sms', 'push', 'in-app']
    },

    // Instruction Notifications
    {
      id: 'dietary-instructions',
      type: 'instruction',
      title: {
        en: 'Important Dietary Instructions',
        zh: '重要饮食指示',
        ms: 'Arahan Diet Penting',
        ta: 'முக்கியமான உணவு வழிமுறைகள்'
      },
      message: {
        en: 'Please review important dietary restrictions and fasting requirements for your procedure.',
        zh: '请查看您手术的重要饮食限制和禁食要求。',
        ms: 'Sila semak sekatan diet penting dan keperluan puasa untuk prosedur anda.',
        ta: 'உங்கள் நடைமுறைக்கான முக்கியமான உணவு கட்டுப்பாடுகள் மற்றும் நோன்பு தேவைகளை மதிப்பாய்வு செய்யுங்கள்.'
      },
      trigger: {
        type: 'time',
        value: '24h'
      },
      priority: 'urgent',
      actions: [
        {
          id: 'view-dietary-guide',
          type: 'download',
          label: {
            en: 'Download Dietary Guide',
            zh: '下载饮食指南',
            ms: 'Muat Turun Panduan Diet',
            ta: 'உணவு வழிகாட்டியைப் பதிவிறக்கவும்'
          }
        },
        {
          id: 'nutritionist-contact',
          type: 'contact',
          label: {
            en: 'Contact Nutritionist',
            zh: '联系营养师',
            ms: 'Hubungi Pakar Pemakanan',
            ta: 'ஊட்டச்சத்து நிபுணரைத் தொடர்பு கொள்ளுங்கள்'
          },
          icon: 'phone'
        }
      ],
      medicalVerified: true,
      verifiedBy: 'Nutritionist Team',
      channels: ['email', 'in-app']
    },

    // Warning Notifications
    {
      id: 'medication-warning',
      type: 'warning',
      title: {
        en: 'Important Medication Information',
        zh: '重要药物信息',
        ms: 'Maklumat Ubat Penting',
        ta: 'முக்கியமான மருந்து தகவல்'
      },
      message: {
        en: 'Please review important information about your medications before the procedure.',
        zh: '请在手术前查看关于您药物的重要信息。',
        ms: 'Sila semak maklumat penting tentang ubat anda sebelum prosedur.',
        ta: 'நடைமுறைக்கு முன் உங்கள் மருந்துகள் பற்றிய முக்கியமான தகவலை மதிப்பாய்வு செய்யுங்கள்.'
      },
      trigger: {
        type: 'time',
        value: '48h'
      },
      priority: 'urgent',
      actions: [
        {
          id: 'medication-review',
          type: 'link',
          label: {
            en: 'Review Medications',
            zh: '查看药物',
            ms: 'Semak Ubat',
            ta: 'மருந்துகளை மதிப்பாய்வு செய்யுங்கள்'
          },
          target: '/medications/review'
        },
        {
          id: 'pharmacy-contact',
          type: 'contact',
          label: {
            en: 'Contact Pharmacy',
            zh: '联系药房',
            ms: 'Hubungi Farmasi',
            ta: 'மருத்துவமனையைத் தொடர்பு கொள்ளுங்கள்'
          },
          icon: 'phone'
        }
      ],
      medicalVerified: true,
      verifiedBy: 'Pharmacy Team',
      channels: ['email', 'sms', 'push', 'in-app']
    },

    // Support Notifications
    {
      id: 'support-available',
      type: 'support',
      title: {
        en: 'Need Help? Support is Available',
        zh: '需要帮助？支持可随时获得',
        ms: 'Perlu Bantuan? Sokongan Tersedia',
        ta: 'உதவி வேண்டுமா? ஆதரவு கிடைக்கிறது'
      },
      message: {
        en: 'Our patient support team is available 24/7 to answer any questions about your preparation.',
        zh: '我们的患者支持团队全天候为您提供任何关于准备的问题。',
        ms: 'Pasukan sokongan pesakit kami tersedia 24/7 untuk menjawab sebarang soalan tentang persediaan anda.',
        ta: 'உங்கள் தயாரிப்பு பற்றிய எந்த கேள்விகளுக்கும் பதிலளிக்க நோயாளி ஆதரவு குழு 24/7 கிடைக்கிறது.'
      },
      trigger: {
        type: 'manual',
        value: 'ongoing'
      },
      priority: 'medium',
      actions: [
        {
          id: 'live-chat',
          type: 'link',
          label: {
            en: 'Start Live Chat',
            zh: '开始在线聊天',
            ms: 'Mula Chat Langsung',
            ta: 'நேரடி அரட்டையைத் தொடங்குங்கள்'
          },
          target: '/support/chat',
          icon: 'chat'
        },
        {
          id: 'call-nurse',
          type: 'contact',
          label: {
            en: 'Call Nurse Hotline',
            zh: '致电护士热线',
            ms: 'Panggil Hotline Jururawat',
            ta: 'செவிலியர் கோட்லைனை அழைக்கவும்'
          },
          icon: 'phone'
        },
        {
          id: 'faq',
          type: 'link',
          label: {
            en: 'View FAQs',
            zh: '查看常见问题',
            ms: 'Lihat FAQ',
            ta: 'FAQ களைப் பார்க்கவும்'
          },
          target: '/faq'
        }
      ],
      medicalVerified: true,
      channels: ['in-app', 'push']
    },

    // Appointment Notifications
    {
      id: 'appointment-confirmation',
      type: 'appointment',
      title: {
        en: 'Appointment Confirmed',
        zh: '预约已确认',
        ms: 'Janji Temu Disahkan',
        ta: 'சந்திப்பு உறுதிப்படுத்தப்பட்டது'
      },
      message: {
        en: `Your ${serviceName} appointment has been confirmed for [DATE] at [TIME]. Please arrive 30 minutes early.`,
        zh: `您的${serviceName}预约已确认，时间为[DATE] [TIME]。请提前30分钟到达。`,
        ms: `Janji temu ${serviceName} anda telah disahkan untuk [TARIKH] pada [MASA]. Sila tiba 30 minit lebih awal.`,
        ta: `உங்கள் ${serviceName} சந்திப்பு [DATE] அன்று [TIME] மணிக்கு உறுதிப்படுத்தப்பட்டுள்ளது. 30 நிமிடங்கள் முன்பே வருகை தரவும்.`
      },
      trigger: {
        type: 'event',
        value: 'appointment_booked'
      },
      priority: 'high',
      actions: [
        {
          id: 'add-calendar',
          type: 'complete-task',
          label: {
            en: 'Add to Calendar',
            zh: '添加到日历',
            ms: 'Tambah ke Kalendar',
            ta: 'காலெண்டரில் சேர்க்கவும்'
          },
          icon: 'calendar'
        },
        {
          id: 'reschedule',
          type: 'link',
          label: {
            en: 'Reschedule',
            zh: '重新安排',
            ms: 'Jadual Semula',
            ta: 'மறு திட்டமிடுங்கள்'
          },
          target: '/appointments/reschedule'
        }
      ],
      medicalVerified: true,
      channels: ['email', 'sms', 'push']
    }
  ];

  // Generate notification schedule based on procedure date
  useEffect(() => {
    const schedules: NotificationSchedule[] = [];
    
    // Generate reminders based on templates with time triggers
    notificationTemplates.forEach(template => {
      if (template.trigger.type === 'time') {
        const triggerValue = template.trigger.value;
        let scheduledDate: Date;
        
        if (triggerValue.includes('d')) {
          // Days before procedure
          const days = parseInt(triggerValue.replace('d', ''));
          scheduledDate = new Date(procedureDate);
          scheduledDate.setDate(scheduledDate.getDate() - days);
        } else if (triggerValue.includes('h')) {
          // Hours before procedure
          const hours = parseInt(triggerValue.replace('h', ''));
          scheduledDate = new Date(procedureDate);
          scheduledDate.setHours(scheduledDate.getHours() - hours);
        } else {
          return; // Skip unknown trigger types
        }
        
        // Only schedule if it's in the future
        if (scheduledDate > new Date()) {
          const schedule: NotificationSchedule = {
            id: `${template.id}-${Date.now()}`,
            patientId,
            serviceId,
            templateId: template.id,
            scheduledFor: scheduledDate,
            status: 'pending',
            channel: template.channels[0], // Use first preferred channel
            locale
          };
          schedules.push(schedule);
        }
      }
    });
    
    setScheduledNotifications(schedules);
  }, [procedureDate, patientId, serviceId, locale]);

  const getLocalizedText = (textObj: any) => {
    return textObj[locale as keyof typeof textObj] || textObj.en;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'sent': return 'text-blue-600 bg-blue-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'read': return 'text-purple-600 bg-purple-100';
      case 'clicked': return 'text-indigo-600 bg-indigo-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return ExclamationTriangleIcon;
      case 'high': return ExclamationTriangleIcon;
      case 'medium': return InformationCircleIcon;
      case 'low': return InformationCircleIcon;
      default: return InformationCircleIcon;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-blue-600 bg-blue-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleNotificationAction = (scheduleId: string, actionId: string) => {
    const schedule = scheduledNotifications.find(s => s.id === scheduleId);
    const template = notificationTemplates.find(t => t.id === schedule?.templateId);
    
    if (template) {
      onNotificationAction?.(actionId, {
        scheduleId,
        actionId,
        templateId: template.id,
        patientId,
        serviceId
      });
    }
  };

  const upcomingNotifications = scheduledNotifications.filter(n => n.status === 'pending');
  const recentNotifications = notificationHistory.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BellIcon className="h-5 w-5 text-blue-500" />
              <span>Patient Education & Reminders</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {upcomingNotifications.length} Upcoming
              </Badge>
              <Button variant="outline" size="sm">
                Settings
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-blue-600">
                {upcomingNotifications.filter(n => n.priority === 'urgent').length}
              </div>
              <div className="text-sm text-gray-500">Urgent Reminders</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-orange-600">
                {upcomingNotifications.filter(n => n.priority === 'high').length}
              </div>
              <div className="text-sm text-gray-500">High Priority</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-green-600">
                {notificationHistory.filter(n => n.status === 'read').length}
              </div>
              <div className="text-sm text-gray-500">Messages Read</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-purple-600">
                {notificationHistory.filter(n => n.status === 'clicked').length}
              </div>
              <div className="text-sm text-gray-500">Actions Taken</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Content */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b px-6 pt-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="upcoming">
                  Upcoming ({upcomingNotifications.length})
                </TabsTrigger>
                <TabsTrigger value="history">
                  History ({notificationHistory.length})
                </TabsTrigger>
                <TabsTrigger value="preferences">
                  Preferences
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="upcoming" className="space-y-4">
                {upcomingNotifications.length > 0 ? (
                  upcomingNotifications
                    .sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime())
                    .map((schedule) => {
                      const template = notificationTemplates.find(t => t.id === schedule.templateId);
                      if (!template) return null;
                      
                      const PriorityIcon = getPriorityIcon(template.priority);
                      const timeUntil = Math.floor(
                        (schedule.scheduledFor.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                      );
                      
                      return (
                        <Card key={schedule.id} className={cn(
                          "border-l-4",
                          template.priority === 'urgent' && "border-l-red-500",
                          template.priority === 'high' && "border-l-orange-500",
                          template.priority === 'medium' && "border-l-blue-500"
                        )}>
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <PriorityIcon className={cn(
                                      "h-4 w-4",
                                      getPriorityColor(template.priority).split(' ')[0]
                                    )} />
                                    <h4 className="font-medium text-gray-900">
                                      {getLocalizedText(template.title)}
                                    </h4>
                                    <Badge className={cn("text-xs", getPriorityColor(template.priority))}>
                                      {template.priority}
                                    </Badge>
                                  </div>
                                  
                                  <p className="text-sm text-gray-600">
                                    {getLocalizedText(template.message)}
                                  </p>
                                  
                                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                                    <span className="flex items-center space-x-1">
                                      <ClockIcon className="h-3 w-3" />
                                      <span>
                                        {timeUntil > 0 ? `In ${timeUntil} day${timeUntil > 1 ? 's' : ''}` : 'Today'}
                                      </span>
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                      {schedule.channel}
                                    </Badge>
                                    <span>{schedule.scheduledFor.toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </div>
                              
                              {template.actions.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
                                  {template.actions.map((action) => (
                                    <Button
                                      key={action.id}
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleNotificationAction(schedule.id, action.id)}
                                      className="flex items-center space-x-1"
                                    >
                                      {action.type === 'contact' && <PhoneIcon className="h-3 w-3" />}
                                      {action.type === 'link' && <DocumentTextIcon className="h-3 w-3" />}
                                      {action.type === 'download' && <DocumentTextIcon className="h-3 w-3" />}
                                      <span>{getLocalizedText(action.label)}</span>
                                    </Button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                ) : (
                  <div className="text-center py-8">
                    <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No upcoming reminders
                    </h3>
                    <p className="text-gray-500">
                      You're all caught up with your preparation!
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                {recentNotifications.length > 0 ? (
                  <div className="space-y-3">
                    {recentNotifications.map((schedule) => {
                      const template = notificationTemplates.find(t => t.id === schedule.templateId);
                      if (!template) return null;
                      
                      return (
                        <div key={schedule.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Badge className={cn("text-xs", getStatusColor(schedule.status))}>
                              {schedule.status}
                            </Badge>
                            <div>
                              <div className="font-medium text-sm">
                                {getLocalizedText(template.title)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {schedule.scheduledFor.toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {schedule.channel}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No notification history
                    </h3>
                    <p className="text-gray-500">
                      Your notification history will appear here
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="preferences" className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Notification Preferences</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Notification Channels</h4>
                      <div className="space-y-2">
                        {Object.entries(preferences).map(([key, value]) => {
                          if (typeof value !== 'boolean') return null;
                          if (key === 'quietHours') return null;
                          
                          return (
                            <label key={key} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={value}
                                onChange={(e) => setPreferences(prev => ({
                                  ...prev,
                                  [key]: e.target.checked
                                }))}
                                className="rounded"
                              />
                              <span className="capitalize">{key}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Reminder Schedule</h4>
                      <div className="text-sm text-gray-600">
                        Reminders will be sent {preferences.reminderDays.join(', ')} days before your procedure
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserIcon className="h-5 w-5 text-green-500" />
            <span>Need Help?</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-start h-auto p-4">
              <ChatBubbleLeftRightIcon className="h-5 w-5 mr-3 text-blue-500" />
              <div className="text-left">
                <div className="font-medium">Live Chat Support</div>
                <div className="text-sm text-gray-500">Get instant answers</div>
              </div>
            </Button>
            
            <Button variant="outline" className="justify-start h-auto p-4">
              <PhoneIcon className="h-5 w-5 mr-3 text-green-500" />
              <div className="text-left">
                <div className="font-medium">24/7 Nurse Hotline</div>
                <div className="text-sm text-gray-500">(65) 6789 1234</div>
              </div>
            </Button>
            
            <Button variant="outline" className="justify-start h-auto p-4">
              <DocumentTextIcon className="h-5 w-5 mr-3 text-orange-500" />
              <div className="text-left">
                <div className="font-medium">Download Resources</div>
                <div className="text-sm text-gray-500">PDF guides & checklists</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}