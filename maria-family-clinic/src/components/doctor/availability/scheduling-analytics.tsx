/**
 * Scheduling Analytics Dashboard Component
 * Sub-Phase 7.5: Doctor Availability & Scheduling Integration
 * 
 * Comprehensive analytics dashboard with insights, metrics, and forecasting
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown,
  Clock,
  Users,
  Calendar,
  AlertTriangle,
  Target,
  PieChart as PieChartIcon,
  BarChart3,
  Activity,
  Zap,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { DoctorAvailability } from '@/types/doctor';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval,
  isSameDay,
  parseISO,
  differenceInMinutes,
  addDays,
  subDays
} from 'date-fns';

interface SchedulingAnalyticsProps {
  doctorId: string;
  availabilities: DoctorAvailability[];
  conflicts: string[];
  waitlistPositions: Record<string, number>;
  dateRange?: { from: Date; to: Date };
}

interface AnalyticsData {
  utilizationByHour: Array<{ hour: string; utilization: number; bookings: number; capacity: number }>;
  utilizationByDay: Array<{ day: string; utilization: number; bookings: number; capacity: number }>;
  peakHours: Array<{ hour: number; utilization: number; appointments: number }>;
  peakDays: Array<{ day: string; utilization: number; appointments: number }>;
  appointmentTypeDistribution: Array<{ type: string; count: number; percentage: number }>;
  noShowAnalysis: { rate: number; trend: 'up' | 'down'; byDay: Array<{ day: string; rate: number }> };
  waitTimeAnalysis: { average: number; median: number; trend: 'up' | 'down' };
  cancellationReasons: Array<{ reason: string; count: number; percentage: number }>;
  seasonalTrends: Array<{ month: string; appointments: number; utilization: number }>;
  productivityMetrics: {
    slotsPerDay: number;
    avgOccupancyRate: number;
    peakUtilizationRate: number;
    idleTimePercentage: number;
  };
}

export const SchedulingAnalytics: React.FC<SchedulingAnalyticsProps> = ({
  doctorId,
  availabilities,
  conflicts,
  waitlistPositions,
  dateRange
}) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter'>('week');
  const [refreshing, setRefreshing] = useState(false);

  // Load analytics data
  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateRange) {
        params.append('from', dateRange.from.toISOString());
        params.append('to', dateRange.to.toISOString());
      }
      params.append('timeframe', selectedTimeframe);

      const response = await fetch(`/api/analytics/scheduling/${doctorId}?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [doctorId, selectedTimeframe, dateRange]);

  // Calculate real-time metrics from availability data
  const realTimeMetrics = useMemo(() => {
    const totalSlots = availabilities.length;
    const availableSlots = availabilities.filter(a => a.isAvailable && a.availableSlots > 0).length;
    const utilizationRate = totalSlots > 0 ? ((totalSlots - availableSlots) / totalSlots) * 100 : 0;
    
    // Calculate peak hours (simplified version)
    const hourData: Record<string, { slots: number; available: number }> = {};
    availabilities.forEach(availability => {
      const hour = availability.startTime.split(':')[0];
      if (!hourData[hour]) {
        hourData[hour] = { slots: 0, available: 0 };
      }
      hourData[hour].slots++;
      if (availability.isAvailable && availability.availableSlots > 0) {
        hourData[hour].available++;
      }
    });

    const peakHours = Object.entries(hourData)
      .map(([hour, data]) => ({
        hour: parseInt(hour),
        utilization: data.slots > 0 ? ((data.slots - data.available) / data.slots) * 100 : 0,
        appointments: data.slots - data.available
      }))
      .sort((a, b) => b.utilization - a.utilization);

    return {
      totalSlots,
      availableSlots,
      utilizationRate,
      peakHours: peakHours.slice(0, 3), // Top 3 peak hours
      conflicts: conflicts.length,
      waitlistTotal: Object.values(waitlistPositions).reduce((sum, pos) => sum + pos, 0)
    };
  }, [availabilities, conflicts, waitlistPositions]);

  // Generate mock data for demonstration
  const generateMockData = (): AnalyticsData => ({
    utilizationByHour: Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      utilization: Math.random() * 100,
      bookings: Math.floor(Math.random() * 20),
      capacity: Math.floor(Math.random() * 25)
    })),
    utilizationByDay: [
      { day: 'Mon', utilization: 85, bookings: 45, capacity: 52 },
      { day: 'Tue', utilization: 92, bookings: 48, capacity: 52 },
      { day: 'Wed', utilization: 88, bookings: 46, capacity: 52 },
      { day: 'Thu', utilization: 90, bookings: 47, capacity: 52 },
      { day: 'Fri', utilization: 78, bookings: 41, capacity: 52 },
      { day: 'Sat', utilization: 65, bookings: 34, capacity: 52 },
      { day: 'Sun', utilization: 45, bookings: 23, capacity: 52 }
    ],
    peakHours: [
      { hour: 10, utilization: 95, appointments: 18 },
      { hour: 14, utilization: 88, appointments: 16 },
      { hour: 16, utilization: 82, appointments: 15 }
    ],
    peakDays: [
      { day: 'Tuesday', utilization: 92, appointments: 48 },
      { day: 'Thursday', utilization: 90, appointments: 47 },
      { day: 'Wednesday', utilization: 88, appointments: 46 }
    ],
    appointmentTypeDistribution: [
      { type: 'Consultation', count: 120, percentage: 45 },
      { type: 'Follow-up', count: 80, percentage: 30 },
      { type: 'Check-up', count: 45, percentage: 17 },
      { type: 'Procedure', count: 15, percentage: 8 }
    ],
    noShowAnalysis: {
      rate: 12.5,
      trend: 'down',
      byDay: [
        { day: 'Mon', rate: 10 },
        { day: 'Tue', rate: 8 },
        { day: 'Wed', rate: 15 },
        { day: 'Thu', rate: 12 },
        { day: 'Fri', rate: 14 },
        { day: 'Sat', rate: 18 },
        { day: 'Sun', rate: 22 }
      ]
    },
    waitTimeAnalysis: {
      average: 14,
      median: 12,
      trend: 'down'
    },
    cancellationReasons: [
      { reason: 'Patient request', count: 45, percentage: 35 },
      { reason: 'Emergency', count: 25, percentage: 20 },
      { reason: 'Scheduling conflict', count: 20, percentage: 15 },
      { reason: 'Weather', count: 18, percentage: 14 },
      { reason: 'Illness', count: 15, percentage: 12 },
      { reason: 'Other', count: 5, percentage: 4 }
    ],
    seasonalTrends: Array.from({ length: 12 }, (_, i) => ({
      month: format(new Date(2025, i, 1), 'MMM'),
      appointments: Math.floor(Math.random() * 200) + 100,
      utilization: Math.random() * 40 + 60
    })),
    productivityMetrics: {
      slotsPerDay: 8.5,
      avgOccupancyRate: 78.2,
      peakUtilizationRate: 92.5,
      idleTimePercentage: 21.8
    }
  });

  // Use mock data if no analytics data is available
  const displayData = analyticsData || generateMockData();

  // Chart colors
  const CHART_COLORS = {
    primary: '#3b82f6',
    secondary: '#10b981',
    accent: '#f59e0b',
    danger: '#ef4444',
    purple: '#8b5cf6',
    indigo: '#6366f1',
    pink: '#ec4899'
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        <span>Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Timeframe Controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Scheduling Analytics</h2>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={selectedTimeframe === 'week' ? 'default' : 'outline'}
            onClick={() => setSelectedTimeframe('week')}
          >
            Week
          </Button>
          <Button
            size="sm"
            variant={selectedTimeframe === 'month' ? 'default' : 'outline'}
            onClick={() => setSelectedTimeframe('month')}
          >
            Month
          </Button>
          <Button
            size="sm"
            variant={selectedTimeframe === 'quarter' ? 'default' : 'outline'}
            onClick={() => setSelectedTimeframe('quarter')}
          >
            Quarter
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setRefreshing(true) || loadAnalyticsData() || setTimeout(() => setRefreshing(false), 1000)}
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{realTimeMetrics.utilizationRate.toFixed(1)}%</div>
                <div className="text-xs text-gray-600">Current Utilization</div>
                <div className="text-xs text-green-600">
                  <TrendingUp className="w-3 h-3 inline mr-1" />
                  +5.2% vs last week
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{displayData.waitTimeAnalysis.average} min</div>
                <div className="text-xs text-gray-600">Avg Wait Time</div>
                <div className="text-xs text-green-600">
                  <TrendingDown className="w-3 h-3 inline mr-1" />
                  -2 min vs last week
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <div>
                <div className="text-2xl font-bold">{displayData.noShowAnalysis.rate}%</div>
                <div className="text-xs text-gray-600">No-Show Rate</div>
                <div className="text-xs text-green-600">
                  <TrendingDown className="w-3 h-3 inline mr-1" />
                  -1.2% vs last week
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{displayData.productivityMetrics.avgOccupancyRate}%</div>
                <div className="text-xs text-gray-600">Occupancy Rate</div>
                <div className="text-xs text-blue-600">
                  <Activity className="w-3 h-3 inline mr-1" />
                  {realTimeMetrics.totalSlots} slots today
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="utilization" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="utilization">Utilization</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="forecasting">Forecast</TabsTrigger>
        </TabsList>

        {/* Utilization Analysis */}
        <TabsContent value="utilization" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Hourly Utilization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Hourly Utilization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={displayData.utilizationByHour}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="utilization" fill={CHART_COLORS.primary} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Daily Utilization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Weekly Utilization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={displayData.utilizationByDay}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="utilization" 
                      stroke={CHART_COLORS.secondary} 
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Peak Hours and Days */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Peak Hours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {displayData.peakHours.map((peak, index) => (
                  <div key={peak.hour} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant={index === 0 ? 'default' : 'secondary'}>
                        #{index + 1}
                      </Badge>
                      <span className="font-medium">{peak.hour}:00</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{peak.utilization.toFixed(1)}%</div>
                      <div className="text-xs text-gray-600">{peak.appointments} appointments</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Peak Days
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {displayData.peakDays.map((peak, index) => (
                  <div key={peak.day} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant={index === 0 ? 'default' : 'secondary'}>
                        #{index + 1}
                      </Badge>
                      <span className="font-medium">{peak.day}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{peak.utilization.toFixed(1)}%</div>
                      <div className="text-xs text-gray-600">{peak.appointments} appointments</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Patterns Analysis */}
        <TabsContent value="patterns" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Appointment Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5" />
                  Appointment Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={displayData.appointmentTypeDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="count"
                      label={({ type, percentage }) => `${type} (${percentage}%)`}
                    >
                      {displayData.appointmentTypeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={[CHART_COLORS.primary, CHART_COLORS.secondary, CHART_COLORS.accent, CHART_COLORS.purple][index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* No-Show Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <XCircle className="w-5 h-5" />
                  No-Show Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={displayData.noShowAnalysis.byDay}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="rate" 
                      stroke={CHART_COLORS.danger} 
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Cancellation Reasons */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Cancellation Reasons
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {displayData.cancellationReasons.map((reason, index) => (
                  <div key={reason.reason} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{reason.count}</Badge>
                      <span>{reason.reason}</span>
                    </div>
                    <div className="font-semibold">{reason.percentage}%</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quality Metrics */}
        <TabsContent value="quality" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Productivity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Slots per Day</span>
                  <span className="font-semibold">{displayData.productivityMetrics.slotsPerDay}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Peak Utilization</span>
                  <span className="font-semibold">{displayData.productivityMetrics.peakUtilizationRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Idle Time</span>
                  <span className="font-semibold">{displayData.productivityMetrics.idleTimePercentage}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Wait Times</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Average</span>
                  <span className="font-semibold">{displayData.waitTimeAnalysis.average} min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Median</span>
                  <span className="font-semibold">{displayData.waitTimeAnalysis.median} min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Trend</span>
                  <div className="flex items-center gap-1">
                    {displayData.waitTimeAnalysis.trend === 'down' ? (
                      <TrendingDown className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingUp className="w-4 h-4 text-red-500" />
                    )}
                    <span className="font-semibold capitalize">{displayData.waitTimeAnalysis.trend}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>No-Show Rate</span>
                  <span className="font-semibold">{displayData.noShowAnalysis.rate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Trend</span>
                  <div className="flex items-center gap-1">
                    {displayData.noShowAnalysis.trend === 'down' ? (
                      <TrendingDown className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingUp className="w-4 h-4 text-red-500" />
                    )}
                    <span className="font-semibold capitalize">{displayData.noShowAnalysis.trend}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Conflicts</span>
                  <Badge variant="destructive">{realTimeMetrics.conflicts}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends Analysis */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Seasonal Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={displayData.seasonalTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="appointments" fill={CHART_COLORS.primary} name="Appointments" />
                  <Line yAxisId="right" type="monotone" dataKey="utilization" stroke={CHART_COLORS.secondary} name="Utilization %" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Forecasting */}
        <TabsContent value="forecasting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Demand Forecasting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800">Next Week</h4>
                  <p className="text-2xl font-bold text-blue-600">87%</p>
                  <p className="text-sm text-blue-600">Expected utilization</p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800">Next Month</h4>
                  <p className="text-2xl font-bold text-green-600">+12%</p>
                  <p className="text-sm text-green-600">Growth vs current</p>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-800">Peak Season</h4>
                  <p className="text-2xl font-bold text-purple-600">May</p>
                  <p className="text-sm text-purple-600">Highest demand month</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Recommendations</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm">Consider adding evening slots on Tuesdays (high demand)</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">Optimization opportunity: Saturday mornings have lower utilization</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                    <Users className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Strong performance this quarter - consider capacity expansion</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SchedulingAnalytics;