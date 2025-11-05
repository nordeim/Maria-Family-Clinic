'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Heart, 
  Activity, 
  Thermometer, 
  Droplets,
  Shield,
  Clock,
  Bell,
  X,
  Info,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface HealthAlert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  category: 'vitals' | 'medication' | 'appointment' | 'screening' | 'trends' | 'goals';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved';
  source: 'manual' | 'automatic' | 'device' | 'appointment' | 'screening';
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  expiresAt?: string;
  actionItems: Array<{
    id: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    completed: boolean;
    actionUrl?: string;
  }>;
  relatedMetrics?: Array<{
    metricName: string;
    currentValue: number;
    targetValue: number;
    unit: string;
    trend: 'up' | 'down' | 'stable';
    status: 'normal' | 'borderline' | 'abnormal';
  }>;
  recommendations: string[];
  contactInfo?: {
    type: 'doctor' | 'clinic' | 'emergency';
    name: string;
    phone: string;
    address?: string;
    isAvailable: boolean;
  };
  tags: string[];
}

interface HealthAlertProps {
  userId: string;
  alerts?: HealthAlert[];
  onAlertAcknowledge?: (alertId: string) => void;
  onAlertResolve?: (alertId: string) => void;
  onActionComplete?: (alertId: string, actionId: string) => void;
  className?: string;
}

const mockAlerts: HealthAlert[] = [
  {
    id: '1',
    type: 'warning',
    category: 'vitals',
    title: 'Blood Pressure Reading Elevated',
    message: 'Your recent blood pressure readings have been consistently above the normal range (140/90 mmHg). This requires attention to prevent complications.',
    severity: 'high',
    status: 'active',
    source: 'device',
    createdAt: '2024-01-15T09:30:00Z',
    actionItems: [
      {
        id: '1a',
        title: 'Schedule Doctor Appointment',
        description: 'Book an appointment within the next 1-2 weeks to discuss your blood pressure management',
        priority: 'high',
        completed: false,
        actionUrl: '/appointments/book?type=consultation'
      },
      {
        id: '1b',
        title: 'Monitor Blood Pressure Daily',
        description: 'Take blood pressure readings at the same time each day for one week',
        priority: 'medium',
        completed: false
      },
      {
        id: '1c',
        title: 'Review Medication',
        description: 'Check if you have been taking your blood pressure medication as prescribed',
        priority: 'high',
        completed: false
      }
    ],
    relatedMetrics: [
      {
        metricName: 'Systolic BP',
        currentValue: 145,
        targetValue: 130,
        unit: 'mmHg',
        trend: 'up',
        status: 'abnormal'
      },
      {
        metricName: 'Diastolic BP',
        currentValue: 92,
        targetValue: 85,
        unit: 'mmHg',
        trend: 'up',
        status: 'borderline'
      }
    ],
    recommendations: [
      'Reduce sodium intake to less than 2,300mg per day',
      'Engage in 30 minutes of moderate exercise daily',
      'Maintain a healthy weight',
      'Limit alcohol consumption',
      'Practice stress management techniques'
    ],
    contactInfo: {
      type: 'doctor',
      name: 'Dr. Sarah Lim',
      phone: '+65 6123 4567',
      address: 'My Family Clinic - Bedok',
      isAvailable: true
    },
    tags: ['blood-pressure', 'cardiovascular', 'high-priority']
  },
  {
    id: '2',
    type: 'info',
    category: 'screening',
    title: 'Annual Health Screening Due',
    message: 'Your comprehensive health screening is due based on your age and risk factors. Early detection can prevent serious health issues.',
    severity: 'medium',
    status: 'active',
    source: 'automatic',
    createdAt: '2024-01-14T10:00:00Z',
    expiresAt: '2024-02-14T10:00:00Z',
    actionItems: [
      {
        id: '2a',
        title: 'Book Health Screening',
        description: 'Schedule your annual comprehensive health screening',
        priority: 'high',
        completed: false,
        actionUrl: '/appointments/book?type=health-screening'
      },
      {
        id: '2b',
        title: 'Prepare Medical History',
        description: 'Gather information about family medical history and current symptoms',
        priority: 'medium',
        completed: false
      }
    ],
    recommendations: [
      'Screenings include blood pressure, cholesterol, diabetes, and cancer screenings',
      'Fast for 12 hours before blood tests',
      'Bring your ID and insurance card',
      'Wear comfortable clothing for physical examination'
    ],
    tags: ['screening', 'prevention', 'annual-checkup']
  },
  {
    id: '3',
    type: 'critical',
    category: 'medication',
    title: 'Medication Refill Required',
    message: 'Your blood pressure medication is running low. Please refill within 3 days to avoid missing doses.',
    severity: 'critical',
    status: 'active',
    source: 'automatic',
    createdAt: '2024-01-15T14:20:00Z',
    expiresAt: '2024-01-18T14:20:00Z',
    actionItems: [
      {
        id: '3a',
        title: 'Contact Pharmacy',
        description: 'Call or visit your pharmacy to request a refill',
        priority: 'critical',
        completed: false
      },
      {
        id: '3b',
        title: 'Schedule Doctor Visit',
        description: 'Book appointment for prescription renewal if needed',
        priority: 'high',
        completed: false
      }
    ],
    relatedMetrics: [
      {
        metricName: 'Medication Supply',
        currentValue: 3,
        targetValue: 7,
        unit: 'days',
        trend: 'down',
        status: 'abnormal'
      }
    ],
    recommendations: [
      'Never stop blood pressure medication without consulting your doctor',
      'Set up automatic refill reminders',
      'Keep a backup supply when traveling'
    ],
    contactInfo: {
      type: 'clinic',
      name: 'Guardian Pharmacy',
      phone: '+65 6234 5678',
      address: 'Bedok Mall, Singapore',
      isAvailable: true
    },
    tags: ['medication', 'refill', 'urgent']
  },
  {
    id: '4',
    type: 'success',
    category: 'goals',
    title: 'Weight Loss Goal Achieved!',
    message: 'Congratulations! You have successfully reached your target weight loss goal. Your progress is excellent.',
    severity: 'low',
    status: 'active',
    source: 'automatic',
    createdAt: '2024-01-15T16:45:00Z',
    actionItems: [
      {
        id: '4a',
        title: 'Set New Maintenance Goals',
        description: 'Consider setting new health goals to maintain your progress',
        priority: 'medium',
        completed: false,
        actionUrl: '/health/goals'
      }
    ],
    relatedMetrics: [
      {
        metricName: 'Weight',
        currentValue: 68,
        targetValue: 70,
        unit: 'kg',
        trend: 'stable',
        status: 'normal'
      }
    ],
    recommendations: [
      'Focus on maintaining your current weight through balanced nutrition',
      'Continue your current exercise routine',
      'Schedule regular check-ins to track maintenance'
    ],
    tags: ['achievement', 'weight-loss', 'milestone']
  }
];

const alertTypeConfig = {
  critical: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  },
  info: {
    icon: Info,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  success: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  }
};

const categoryIcons = {
  vitals: Heart,
  medication: Shield,
  appointment: Clock,
  screening: Activity,
  trends: TrendingUp,
  goals: CheckCircle
};

const severityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800'
};

export default function HealthAlert({
  userId,
  alerts = mockAlerts,
  onAlertAcknowledge,
  onAlertResolve,
  onActionComplete,
  className
}: HealthAlertProps) {
  const [selectedAlert, setSelectedAlert] = useState<HealthAlert | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'acknowledged' | 'resolved'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | HealthAlert['category']>('all');

  const filteredAlerts = alerts.filter(alert => {
    const statusMatch = filter === 'all' || alert.status === filter;
    const categoryMatch = categoryFilter === 'all' || alert.category === categoryFilter;
    return statusMatch && categoryMatch;
  });

  const activeAlerts = alerts.filter(alert => alert.status === 'active');
  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical' && alert.status === 'active');

  const handleAlertAction = (alertId: string, action: 'acknowledge' | 'resolve') => {
    if (action === 'acknowledge') {
      onAlertAcknowledge?.(alertId);
      toast.success('Alert acknowledged');
    } else {
      onAlertResolve?.(alertId);
      toast.success('Alert resolved');
    }
  };

  const handleActionComplete = (alertId: string, actionId: string) => {
    onActionComplete?.(alertId, actionId);
    toast.success('Action completed');
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-orange-500" />
            Health Alerts
          </h2>
          <p className="text-gray-600 mt-1">
            Important health notifications and action items
          </p>
        </div>
        
        {/* Alert Summary */}
        <div className="flex gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{criticalAlerts.length}</div>
            <div className="text-sm text-gray-600">Critical</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{activeAlerts.length}</div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Status:</label>
          <div className="flex gap-2">
            {['all', 'active', 'acknowledged', 'resolved'].map(status => (
              <Button
                key={status}
                variant={filter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(status as any)}
                className="capitalize"
              >
                {status}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Category:</label>
          <div className="flex gap-2">
            {['all', 'vitals', 'medication', 'appointment', 'screening', 'trends', 'goals'].map(category => (
              <Button
                key={category}
                variant={categoryFilter === category ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryFilter(category as any)}
                className="capitalize"
              >
                {category === 'all' ? 'All' : category.replace('-', ' ')}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Critical Alerts Banner */}
      {criticalAlerts.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Critical Alert{criticalAlerts.length > 1 ? 's' : ''}</AlertTitle>
          <AlertDescription className="text-red-700">
            {criticalAlerts.length} critical alert{criticalAlerts.length > 1 ? 's' : ''} require immediate attention.
            {criticalAlerts.length <= 3 && (
              <ul className="mt-2 list-disc list-inside">
                {criticalAlerts.map(alert => (
                  <li key={alert.id}>{alert.title}</li>
                ))}
              </ul>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => {
          const config = alertTypeConfig[alert.type];
          const IconComponent = config.icon;
          const CategoryIcon = categoryIcons[alert.category];
          const isExpanded = selectedAlert?.id === alert.id;
          
          return (
            <Card key={alert.id} className={`${config.borderColor} ${config.bgColor} border-2 transition-all duration-200 ${alert.status === 'resolved' ? 'opacity-75' : ''}`}>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 rounded-lg bg-white">
                      <CategoryIcon className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <IconComponent className={`h-5 w-5 ${config.color}`} />
                        {alert.title}
                        {alert.status === 'resolved' && (
                          <Badge className="bg-green-100 text-green-800">Resolved</Badge>
                        )}
                        {alert.status === 'acknowledged' && (
                          <Badge variant="secondary">Acknowledged</Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {alert.message}
                      </CardDescription>
                    </div>
                  </div>
                  
                  <div className="text-right text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {getTimeAgo(alert.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2 mt-3">
                  <Badge className={severityColors[alert.severity]}>
                    {alert.severity}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {alert.category.replace('-', ' ')}
                  </Badge>
                  <Badge variant="outline">
                    {alert.source}
                  </Badge>
                  {alert.expiresAt && (
                    <Badge variant="outline" className="text-red-600 border-red-300">
                      Expires {new Date(alert.expiresAt).toLocaleDateString()}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Related Metrics */}
                {alert.relatedMetrics && alert.relatedMetrics.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Affected Health Metrics</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {alert.relatedMetrics.map((metric, index) => (
                        <div key={index} className="p-3 bg-white rounded-lg border">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-sm">{metric.metricName}</div>
                              <div className="text-xs text-gray-600">
                                {metric.currentValue} {metric.unit} (Target: {metric.targetValue} {metric.unit})
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-sm ${
                                metric.status === 'normal' ? 'text-green-600' :
                                metric.status === 'borderline' ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {metric.status}
                              </div>
                              <div className="text-xs">
                                {metric.trend === 'up' ? '↗️' : metric.trend === 'down' ? '↘️' : '➡️'}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Items Preview */}
                {alert.actionItems.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Action Items</h4>
                    <div className="space-y-2">
                      {alert.actionItems.slice(0, 2).map((action) => (
                        <div key={action.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                          <div className="flex-1">
                            <div className={`font-medium text-sm ${action.completed ? 'line-through text-gray-500' : ''}`}>
                              {action.title}
                            </div>
                            <div className="text-xs text-gray-600">{action.description}</div>
                            {!action.completed && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2"
                                onClick={() => handleActionComplete(alert.id, action.id)}
                              >
                                Mark Complete
                              </Button>
                            )}
                          </div>
                          {action.completed && (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                        </div>
                      ))}
                      {alert.actionItems.length > 2 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedAlert(isExpanded ? null : alert)}
                        >
                          View All Actions ({alert.actionItems.length})
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedAlert(isExpanded ? null : alert)}
                  >
                    {isExpanded ? 'Show Less' : 'View Details'}
                  </Button>
                  
                  <div className="flex gap-2">
                    {alert.status === 'active' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleAlertAction(alert.id, 'acknowledge')}
                        >
                          Acknowledge
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleAlertAction(alert.id, 'resolve')}
                        >
                          Resolve
                        </Button>
                      </>
                    )}
                    {alert.status === 'acknowledged' && (
                      <Button
                        size="sm"
                        onClick={() => handleAlertAction(alert.id, 'resolve')}
                      >
                        Mark Resolved
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>

              {/* Detailed View */}
              {isExpanded && (
                <div className="border-t p-6 bg-white space-y-6">
                  <Tabs defaultValue="details" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="details">Details</TabsTrigger>
                      <TabsTrigger value="actions">Actions</TabsTrigger>
                      <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="details" className="space-y-4">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-2">Alert Information</h4>
                          <div className="space-y-2 text-sm">
                            <div><span className="text-gray-600">Type:</span> {alert.type}</div>
                            <div><span className="text-gray-600">Category:</span> {alert.category}</div>
                            <div><span className="text-gray-600">Severity:</span> {alert.severity}</div>
                            <div><span className="text-gray-600">Status:</span> {alert.status}</div>
                            <div><span className="text-gray-600">Source:</span> {alert.source}</div>
                            <div><span className="text-gray-600">Created:</span> {new Date(alert.createdAt).toLocaleString()}</div>
                            {alert.acknowledgedAt && (
                              <div><span className="text-gray-600">Acknowledged:</span> {new Date(alert.acknowledgedAt).toLocaleString()}</div>
                            )}
                            {alert.resolvedAt && (
                              <div><span className="text-gray-600">Resolved:</span> {new Date(alert.resolvedAt).toLocaleString()}</div>
                            )}
                          </div>
                        </div>
                        
                        {alert.contactInfo && (
                          <div>
                            <h4 className="font-medium mb-2">Contact Information</h4>
                            <div className="space-y-2 text-sm">
                              <div><span className="text-gray-600">Type:</span> {alert.contactInfo.type}</div>
                              <div><span className="text-gray-600">Name:</span> {alert.contactInfo.name}</div>
                              <div><span className="text-gray-600">Phone:</span> {alert.contactInfo.phone}</div>
                              {alert.contactInfo.address && (
                                <div><span className="text-gray-600">Address:</span> {alert.contactInfo.address}</div>
                              )}
                              <div><span className="text-gray-600">Available:</span> {alert.contactInfo.isAvailable ? 'Yes' : 'No'}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="actions" className="space-y-3">
                      {alert.actionItems.map((action) => (
                        <div key={action.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className={`font-medium ${action.completed ? 'line-through text-gray-500' : ''}`}>
                                {action.title}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">{action.description}</div>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className={severityColors[action.priority]}>
                                  {action.priority}
                                </Badge>
                                {action.actionUrl && (
                                  <Button variant="outline" size="sm" asChild>
                                    <a href={action.actionUrl}>Take Action</a>
                                  </Button>
                                )}
                              </div>
                            </div>
                            {action.completed && (
                              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 ml-4" />
                            )}
                          </div>
                        </div>
                      ))}
                    </TabsContent>
                    
                    <TabsContent value="recommendations" className="space-y-3">
                      {alert.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div className="text-sm">{recommendation}</div>
                        </div>
                      ))}
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {filteredAlerts.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Alerts Found</h3>
            <p className="text-gray-600">
              No alerts match your current filters. {filter !== 'all' || categoryFilter !== 'all' ? 'Try adjusting your filters.' : 'Great! You have no active health alerts.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}