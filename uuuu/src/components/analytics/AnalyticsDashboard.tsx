// Real-time Analytics Dashboard
// Sub-Phase 9.8: Performance metrics dashboard for contact system efficiency

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Clock, 
  MessageSquare, 
  BarChart3,
  Eye,
  MousePointer,
  Zap,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Filter,
  Calendar,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { 
  TimeRangeKey, 
  TIME_RANGES, 
  PerformanceKPI, 
  ContactAnalyticsEvent,
  FormAnalytics,
  CustomerSatisfactionMetrics,
  PredictiveAnalytics 
} from '@/types/analytics';

// Real-time KPI Card Component
interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  target?: number;
  change?: number;
  trend: 'up' | 'down' | 'stable';
  status: 'excellent' | 'good' | 'warning' | 'critical';
  icon: React.ReactNode;
  description?: string;
}

function KPICard({ title, value, unit, target, change, trend, status, icon, description }: KPICardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <div className="h-4 w-4" />;
  };

  const getTargetProgress = () => {
    if (!target) return null;
    const progress = (Number(value) / target) * 100;
    return (
      <div className="mt-2">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={Math.min(progress, 100)} className="h-1" />
      </div>
    );
  };

  return (
    <Card className={`transition-all hover:shadow-md ${getStatusColor(status)}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-2xl font-bold">
              {typeof value === 'number' ? value.toLocaleString() : value}
              {unit && <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>}
            </div>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
          </div>
          {change !== undefined && (
            <div className="flex items-center space-x-1">
              {getTrendIcon()}
              <span className={`text-sm font-medium ${
                change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-500'
              }`}>
                {change > 0 ? '+' : ''}{change}%
              </span>
            </div>
          )}
        </div>
        {getTargetProgress()}
      </CardContent>
    </Card>
  );
}

// Real-time Activity Feed Component
function ActivityFeed() {
  const { data: events, isLoading } = useQuery({
    queryKey: ['analytics', 'realtime-events'],
    queryFn: () => api.analytics.getDashboardData({ timeRange: '1h' }),
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Real-time Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg animate-pulse">
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
                  <div className="h-2 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const recentEvents = events?.data?.recentEvents || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Real-time Activity</span>
        </CardTitle>
        <CardDescription>Latest contact form interactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentEvents.length > 0 ? recentEvents.slice(0, 10).map((event: any, index: number) => (
            <div key={event.id || index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                {event.eventType === 'form_complete' ? (
                  <CheckCircle className="h-8 w-8 text-green-500" />
                ) : event.eventType === 'form_abandon' ? (
                  <AlertTriangle className="h-8 w-8 text-yellow-500" />
                ) : (
                  <MousePointer className="h-8 w-8 text-blue-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {event.eventName || 'Form Interaction'}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(event.timestamp).toLocaleTimeString()} • 
                  {event.deviceInfo?.deviceType || 'Unknown'} • 
                  {event.location?.country || 'Unknown'}
                </p>
              </div>
              <div className="text-xs text-gray-400">
                {event.performanceMetrics?.loadTime ? `${event.performanceMetrics.loadTime}ms` : 'N/A'}
              </div>
            </div>
          )) : (
            <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Form Analytics Chart Component
function FormAnalyticsChart() {
  const { data: formData, isLoading } = useQuery({
    queryKey: ['analytics', 'form-analytics'],
    queryFn: () => api.analytics.getFormAnalytics({ timeRange: '7d' }),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Form Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  const analytics = formData as FormAnalytics;
  const conversionData = [
    { name: 'Views', value: analytics?.totalViews || 0, color: '#3b82f6' },
    { name: 'Starts', value: analytics?.totalStarts || 0, color: '#8b5cf6' },
    { name: 'Completions', value: analytics?.totalCompletions || 0, color: '#10b981' },
    { name: 'Abandons', value: analytics?.totalAbandons || 0, color: '#ef4444' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Form Performance</CardTitle>
        <CardDescription>Conversion funnel analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {conversionData.map((item, index) => (
            <div key={item.name} className="flex items-center space-x-3">
              <div 
                className="w-4 h-4 rounded" 
                style={{ backgroundColor: item.color }}
              ></div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-sm text-gray-500">
                    {item.value.toLocaleString()}
                  </span>
                </div>
                {index > 0 && (
                  <Progress 
                    value={(item.value / Math.max(conversionData[0].value, 1)) * 100} 
                    className="h-1 mt-1"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Performance Metrics Chart Component
function PerformanceChart() {
  const { data: performanceData, isLoading } = useQuery({
    queryKey: ['analytics', 'performance-kpis'],
    queryFn: () => api.analytics.getPerformanceKPIs({ timeRange: '24h' }),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  const kpis = performanceData as PerformanceKPI[];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Metrics</CardTitle>
        <CardDescription>Core Web Vitals and system performance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {kpis.map((kpi) => (
            <div key={kpi.name} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{kpi.name}</span>
                <Badge variant={
                  kpi.status === 'excellent' ? 'default' :
                  kpi.status === 'good' ? 'secondary' :
                  kpi.status === 'warning' ? 'destructive' : 'destructive'
                }>
                  {kpi.status}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-lg font-bold">
                  {kpi.currentValue.toLocaleString()} {kpi.unit}
                </div>
                <div className="text-sm text-gray-500">
                  target: {kpi.targetValue.toLocaleString()} {kpi.unit}
                </div>
              </div>
              <Progress 
                value={(kpi.currentValue / kpi.targetValue) * 100} 
                className="h-2"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Customer Satisfaction Dashboard Component
function SatisfactionDashboard() {
  const { data: satisfactionData, isLoading } = useQuery({
    queryKey: ['analytics', 'customer-satisfaction'],
    queryFn: () => api.analytics.getCustomerSatisfaction({ timeRange: '30d' }),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer Satisfaction</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  const satisfaction = satisfactionData?.metrics as CustomerSatisfactionMetrics;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Satisfaction</CardTitle>
        <CardDescription>CSAT, NPS, and satisfaction trends</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {satisfaction?.overallCSAT?.toFixed(1) || 'N/A'}
            </div>
            <div className="text-sm text-gray-500">CSAT Score</div>
            <div className="text-xs text-gray-400">out of 10</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {satisfaction?.npsScore || 'N/A'}
            </div>
            <div className="text-sm text-gray-500">NPS Score</div>
            <div className="text-xs text-gray-400">Promoters - Detractors</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {satisfaction?.cesScore?.toFixed(1) || 'N/A'}
            </div>
            <div className="text-sm text-gray-500">CES Score</div>
            <div className="text-xs text-gray-400">Customer Effort</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {satisfaction?.totalResponses || 0}
            </div>
            <div className="text-sm text-gray-500">Responses</div>
            <div className="text-xs text-gray-400">This period</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Predictive Analytics Component
function PredictiveAnalyticsWidget() {
  const { data: predictiveData, isLoading } = useQuery({
    queryKey: ['analytics', 'predictive'],
    queryFn: () => api.analytics.getPredictiveInsights({ timeRange: '30d' }),
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Predictive Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 bg-gray-100 rounded-lg animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  const predictions = predictiveData as PredictiveAnalytics;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Predictive Analytics</CardTitle>
        <CardDescription>AI-powered insights and forecasts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Volume Forecast (Next 7 Days)</h4>
            <div className="flex space-x-4">
              {predictions?.enquiryVolumeForecast?.slice(0, 3).map((forecast, index) => (
                <div key={index} className="flex-1 p-2 bg-blue-50 rounded">
                  <div className="text-sm text-gray-600">
                    {new Date(forecast.date).toLocaleDateString()}
                  </div>
                  <div className="text-lg font-semibold">
                    {forecast.predictedVolume}
                  </div>
                  <div className="text-xs text-gray-500">
                    {Math.round(forecast.confidence * 100)}% confidence
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Top Recommendations</h4>
            <div className="space-y-2">
              {predictions?.formOptimizationOpportunities?.slice(0, 2).map((opportunity, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{opportunity.title}</span>
                    <Badge variant={opportunity.priority === 'high' ? 'destructive' : 'secondary'}>
                      {opportunity.priority}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {opportunity.description}
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    Expected impact: +{opportunity.potentialImpact}% improvement
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Main Analytics Dashboard Component
export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<TimeRangeKey>('24h');
  const [selectedClinic, setSelectedClinic] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  const { data: dashboardData, refetch, isLoading } = useQuery({
    queryKey: ['analytics', 'dashboard', timeRange, selectedClinic],
    queryFn: () => api.analytics.getDashboardData({
      timeRange,
      filters: selectedClinic ? { clinicId: selectedClinic } : {},
    }),
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const handleExport = () => {
    // Export dashboard data
    const data = {
      timeRange,
      clinicId: selectedClinic,
      data: dashboardData,
      exportedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-dashboard-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculate main KPIs
  const keyMetrics = dashboardData?.data?.keyMetrics || {};
  const kpis: KPICardProps[] = [
    {
      title: 'Total Enquiries',
      value: keyMetrics.totalEnquiries || 0,
      change: 12.5,
      trend: 'up',
      status: 'excellent',
      icon: <MessageSquare className="h-4 w-4" />,
      description: 'Last 24 hours',
    },
    {
      title: 'Average Response Time',
      value: keyMetrics.averageResponseTime || 0,
      unit: 'min',
      target: 30,
      change: -8.3,
      trend: 'up',
      status: 'good',
      icon: <Clock className="h-4 w-4" />,
      description: 'Target: 30 minutes',
    },
    {
      title: 'Form Completion Rate',
      value: keyMetrics.formCompletionRate || 0,
      unit: '%',
      target: 70,
      change: 5.2,
      trend: 'up',
      status: 'good',
      icon: <CheckCircle className="h-4 w-4" />,
      description: 'Target: 70%',
    },
    {
      title: 'Customer Satisfaction',
      value: keyMetrics.customerSatisfaction || 0,
      unit: '/10',
      target: 8.5,
      change: 2.1,
      trend: 'up',
      status: 'excellent',
      icon: <Users className="h-4 w-4" />,
      description: 'CSAT Score',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-gray-600">Real-time insights and performance monitoring</p>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Select value={timeRange} onValueChange={(value: TimeRangeKey) => setTimeRange(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(TIME_RANGES).map((range) => (
                <SelectItem key={range.key} value={range.key}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Input
            placeholder="Filter by clinic ID..."
            value={selectedClinic}
            onChange={(e) => setSelectedClinic(e.target.value)}
            className="w-40"
          />
          
          <div className="flex space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <KPICard key={index} {...kpi} />
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="satisfaction">Satisfaction</TabsTrigger>
          <TabsTrigger value="predictive">Predictive</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FormAnalyticsChart />
            <PerformanceChart />
          </div>
        </TabsContent>

        <TabsContent value="forms" className="space-y-4">
          <FormAnalyticsChart />
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <PerformanceChart />
        </TabsContent>

        <TabsContent value="satisfaction" className="space-y-4">
          <SatisfactionDashboard />
        </TabsContent>

        <TabsContent value="predictive" className="space-y-4">
          <PredictiveAnalyticsWidget />
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <ActivityFeed />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AnalyticsDashboard;