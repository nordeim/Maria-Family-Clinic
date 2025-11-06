// ========================================
// CLINIC CONTACT PERFORMANCE METRICS DASHBOARD
// Sub-Phase 9.4: Contact Analytics and Performance Monitoring
// Healthcare Platform Contact System Design
// ========================================

"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  BarChart3, 
  Clock, 
  Users, 
  Star,
  MessageSquare,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
  Target,
  Award,
  Calendar,
  Filter,
  Download,
  Refresh,
  Loader2,
  Activity,
  Zap,
  Globe,
  Timer
} from 'lucide-react';

interface ClinicContactMetricsProps {
  clinicId: string;
  onMetricSelect?: (metric: any) => void;
}

interface MetricsData {
  period: string;
  totalEnquiries: number;
  avgResponseTime: number;
  satisfactionScore: number;
  trends: {
    enquiryTrend: string;
    satisfactionTrend: string;
    responseTimeTrend: string;
  };
  breakdown: {
    byChannel: Record<string, number>;
    byPriority: Record<string, number>;
    byUrgency: Record<string, number>;
  };
}

/**
 * Main Contact Performance Dashboard
 */
export function ClinicContactMetricsDashboard({ 
  clinicId,
  onMetricSelect 
}: ClinicContactMetricsProps) {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [realTimeMetrics, setRealTimeMetrics] = useState<any>(null);
  const [staffPerformance, setStaffPerformance] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('MONTHLY');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    loadMetrics();
    loadRealTimeMetrics();
    loadStaffPerformance();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadRealTimeMetrics();
    }, 30000);

    return () => clearInterval(interval);
  }, [clinicId, selectedPeriod]);

  const loadMetrics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/clinic-contact-integration/metrics/get-metrics?clinicId=${clinicId}&period=${selectedPeriod}`);
      const data = await response.json();
      setMetrics(data[0] || null); // Get most recent period
    } catch (error) {
      console.error('Failed to load metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRealTimeMetrics = async () => {
    try {
      const response = await fetch(`/api/clinic-contact-integration/metrics/get-real-time-metrics?clinicId=${clinicId}`);
      const data = await response.json();
      setRealTimeMetrics(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load real-time metrics:', error);
    }
  };

  const loadStaffPerformance = async () => {
    try {
      const response = await fetch(`/api/clinic-contact-integration/metrics/get-dashboard-data?clinicId=${clinicId}`);
      const data = await response.json();
      setStaffPerformance(data.topStaff || []);
    } catch (error) {
      console.error('Failed to load staff performance:', error);
    }
  };

  const exportMetrics = async () => {
    try {
      const response = await fetch(`/api/clinic-contact-integration/metrics/export?clinicId=${clinicId}&period=${selectedPeriod}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contact-metrics-${clinicId}-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export metrics:', error);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'INCREASING':
      case 'IMPROVING':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'DECREASING':
      case 'DECLINING':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'STABLE':
        return <Minus className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'INCREASING':
      case 'IMPROVING':
        return 'text-green-600';
      case 'DECREASING':
      case 'DECLINING':
        return 'text-red-600';
      case 'STABLE':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  if (isLoading && !metrics) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-3 text-lg">Loading contact metrics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6" />
                Contact Performance Dashboard
              </CardTitle>
              <CardDescription>
                Real-time insights into contact handling performance
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DAILY">Daily</SelectItem>
                  <SelectItem value="WEEKLY">Weekly</SelectItem>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={loadRealTimeMetrics}>
                <Refresh className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={exportMetrics}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Real-time Metrics */}
      {realTimeMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Today's Enquiries</p>
                  <p className="text-2xl font-bold">{realTimeMetrics.todayEnquiries}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {realTimeMetrics.responseRate.toFixed(1)}% response rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Cases</p>
                  <p className="text-2xl font-bold">{realTimeMetrics.activeAssignments}</p>
                </div>
                <Activity className="h-8 w-8 text-orange-500" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Being processed now
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Response</p>
                  <p className="text-2xl font-bold">{realTimeMetrics.avgResponseTime}m</p>
                </div>
                <Timer className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Today average
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Response Rate</p>
                  <p className="text-2xl font-bold">{realTimeMetrics.responseRate.toFixed(1)}%</p>
                </div>
                <Target className="h-8 w-8 text-purple-500" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {realTimeMetrics.todayResponses} responses today
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Volume and Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total Enquiries</p>
                  <p className="text-3xl font-bold text-blue-600">{metrics.totalEnquiries}</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    {getTrendIcon(metrics.trends.enquiryTrend)}
                    <span className={`text-xs ${getTrendColor(metrics.trends.enquiryTrend)}`}>
                      {metrics.trends.enquiryTrend}
                    </span>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600">Avg Response Time</p>
                  <p className="text-3xl font-bold text-green-600">{Math.round(metrics.avgResponseTime)}m</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    {getTrendIcon(metrics.trends.responseTimeTrend)}
                    <span className={`text-xs ${getTrendColor(metrics.trends.responseTimeTrend)}`}>
                      {metrics.trends.responseTimeTrend}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Customer Satisfaction</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">{metrics.satisfactionScore.toFixed(1)}/5</span>
                    {getTrendIcon(metrics.trends.satisfactionTrend)}
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: `${(metrics.satisfactionScore / 5) * 100}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Poor</span>
                  <span>Average</span>
                  <span>Excellent</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Channel Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Contact Channels
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(metrics.breakdown.byChannel).map(([channel, count]) => {
                const percentage = (count / metrics.totalEnquiries) * 100;
                const icons = {
                  EMAIL: <Mail className="h-4 w-4" />,
                  PHONE: <Phone className="h-4 w-4" />,
                  SMS: <MessageSquare className="h-4 w-4" />,
                  CHAT: <MessageSquare className="h-4 w-4" />
                };

                return (
                  <div key={channel} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {icons[channel as keyof typeof icons] || <MessageSquare className="h-4 w-4" />}
                        <span className="text-sm font-medium">{channel}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold">{count}</span>
                        <span className="text-xs text-gray-500 ml-1">({percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Staff Performance */}
      {staffPerformance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Top Performing Staff
            </CardTitle>
            <CardDescription>
              Staff members with highest quality scores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {staffPerformance.map((staff, index) => (
                <div key={staff.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                      <span className="text-sm font-semibold text-blue-600">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{staff.staffName || 'Unknown Staff'}</p>
                      <p className="text-sm text-gray-600">{staff.role} • {staff.department}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {staff.qualityScore && (
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Quality</p>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="font-semibold">{staff.qualityScore.toFixed(1)}</span>
                        </div>
                      </div>
                    )}
                    
                    {staff.satisfactionScore && (
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Satisfaction</p>
                        <div className="flex items-center gap-1">
                          <Award className="h-4 w-4 text-green-500" />
                          <span className="font-semibold">{staff.satisfactionScore.toFixed(1)}</span>
                        </div>
                      </div>
                    )}
                    
                    {staff.avgResponseTime && (
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Response</p>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <span className="font-semibold">{staff.avgResponseTime}m</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="h-20 flex flex-col items-center gap-2">
              <MessageSquare className="h-6 w-6" />
              <span className="text-sm">View All Enquiries</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex flex-col items-center gap-2">
              <Users className="h-6 w-6" />
              <span className="text-sm">Staff Performance</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex flex-col items-center gap-2">
              <Calendar className="h-6 w-6" />
              <span className="text-sm">Schedule Report</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex flex-col items-center gap-2">
              <Target className="h-6 w-6" />
              <span className="text-sm">Set Targets</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Last Updated */}
      <div className="text-center text-sm text-gray-500">
        Last updated: {lastUpdated.toLocaleTimeString()}
      </div>
    </div>
  );
}

/**
 * Individual Metric Card Component
 */
interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: {
    direction: 'up' | 'down' | 'stable';
    value: string;
  };
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'red';
  description?: string;
}

export function MetricCard({ 
  title, 
  value, 
  trend, 
  icon, 
  color = 'blue',
  description 
}: MetricCardProps) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50 border-blue-200',
    green: 'text-green-600 bg-green-50 border-green-200',
    orange: 'text-orange-600 bg-orange-50 border-orange-200',
    purple: 'text-purple-600 bg-purple-50 border-purple-200',
    red: 'text-red-600 bg-red-50 border-red-200'
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    switch (trend.direction) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'stable':
        return <Minus className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <Card className={`${colorClasses[color]} border`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {description && (
              <p className="text-xs opacity-70 mt-1">{description}</p>
            )}
          </div>
          <div className="opacity-80">
            {icon}
          </div>
        </div>
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            {getTrendIcon()}
            <span className="text-xs">{trend.value}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Contact Performance Comparison Chart
 */
export function ContactPerformanceComparison({ 
  clinicId,
  compareWith 
}: { 
  clinicId: string;
  compareWith?: string[];
}) {
  const [comparisonData, setComparisonData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (compareWith && compareWith.length > 0) {
      loadComparisonData();
    }
  }, [clinicId, compareWith]);

  const loadComparisonData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/clinic-contact-integration/metrics/compare?clinicId=${clinicId}&compareWith=${compareWith?.join(',')}`);
      const data = await response.json();
      setComparisonData(data);
    } catch (error) {
      console.error('Failed to load comparison data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading comparison...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Comparison</CardTitle>
        <CardDescription>
          Compare your clinic's contact performance with others
        </CardDescription>
      </CardHeader>
      <CardContent>
        {comparisonData.length > 0 ? (
          <div className="space-y-4">
            {comparisonData.map((data, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{data.clinicName}</p>
                  <p className="text-sm text-gray-600">
                    {data.totalEnquiries} enquiries • {Math.round(data.avgResponseTime)}m avg response
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">{data.satisfactionScore.toFixed(1)}/5</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-gray-600">Satisfaction</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No comparison data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default {
  ClinicContactMetricsDashboard,
  MetricCard,
  ContactPerformanceComparison
};
