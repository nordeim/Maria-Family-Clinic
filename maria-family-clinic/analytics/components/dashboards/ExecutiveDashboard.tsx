// Executive Dashboard Component
// Sub-Phase 10.1: Advanced Analytics & Tracking System Architecture

'use client';

import React, { useMemo } from 'react';
import { RealTimeMetrics, TimeRangeKey, DashboardWidget } from '../../types/analytics.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Target, 
  Calendar,
  Award,
  Clock,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

interface ExecutiveDashboardProps {
  clinicId?: string;
  metrics: RealTimeMetrics | null;
  timeRange: TimeRangeKey;
  isRealTimeActive: boolean;
  customWidgets?: DashboardWidget[];
}

// Mock data for executive metrics
const executiveMetrics = {
  kpis: [
    {
      name: 'Total Revenue',
      value: 245680,
      target: 250000,
      unit: 'SGD',
      trend: 'up',
      change: 12.3,
      status: 'good' as const,
      icon: <DollarSign className="h-4 w-4" />,
    },
    {
      name: 'Patient Satisfaction',
      value: 4.7,
      target: 4.5,
      unit: '/5',
      trend: 'stable',
      change: 0.1,
      status: 'excellent' as const,
      icon: <Award className="h-4 w-4" />,
    },
    {
      name: 'Appointment Conversion',
      value: 18.5,
      target: 20.0,
      unit: '%',
      trend: 'up',
      change: 2.8,
      status: 'good' as const,
      icon: <Target className="h-4 w-4" />,
    },
    {
      name: 'Active Patients',
      value: 3247,
      target: 3000,
      unit: 'patients',
      trend: 'up',
      change: 8.2,
      status: 'excellent' as const,
      icon: <Users className="h-4 w-4" />,
    },
  ],
  revenueData: [
    { month: 'Jan', revenue: 195000, target: 200000 },
    { month: 'Feb', revenue: 210000, target: 200000 },
    { month: 'Mar', revenue: 225000, target: 220000 },
    { month: 'Apr', revenue: 218000, target: 220000 },
    { month: 'May', revenue: 235000, target: 230000 },
    { month: 'Jun', revenue: 245680, target: 250000 },
  ],
  patientFlowData: [
    { month: 'Jan', new: 245, returning: 1200 },
    { month: 'Feb', new: 280, returning: 1350 },
    { month: 'Mar', new: 320, returning: 1480 },
    { month: 'Apr', new: 290, returning: 1420 },
    { month: 'May', new: 340, returning: 1580 },
    { month: 'Jun', new: 380, returning: 1650 },
  ],
  serviceMix: [
    { name: 'General Consultation', value: 45, color: '#3B82F6' },
    { name: 'Health Screening', value: 25, color: '#10B981' },
    { name: 'Specialist Consultation', value: 20, color: '#F59E0B' },
    { name: 'Vaccination', value: 10, color: '#EF4444' },
  ],
  regionalPerformance: [
    { region: 'Central', patients: 1250, revenue: 98500, satisfaction: 4.8 },
    { region: 'East', patients: 980, revenue: 76500, satisfaction: 4.6 },
    { region: 'North', patients: 720, revenue: 58000, satisfaction: 4.5 },
    { region: 'West', patients: 297, revenue: 22680, satisfaction: 4.7 },
  ],
  growthMetrics: {
    patientGrowthRate: 15.8,
    revenueGrowthRate: 12.3,
    satisfactionTrend: 0.2,
    conversionImprovement: 8.5,
  },
  monthlyComparison: [
    { metric: 'Revenue', current: 245680, previous: 218000, change: 12.7 },
    { metric: 'Patients', current: 3247, previous: 2980, change: 9.0 },
    { metric: 'Appointments', current: 1285, previous: 1150, change: 11.7 },
    { metric: 'Satisfaction', current: 4.7, previous: 4.5, change: 4.4 },
  ],
};

// KPI Card Component
interface KPICardProps {
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  icon: React.ReactNode;
}

function KPICard({ name, value, target, unit, trend, change, status, icon }: KPICardProps) {
  const percentage = (value / target) * 100;
  const getStatusColor = () => {
    switch (status) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getProgressColor = () => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 90) return 'bg-blue-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{name}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {typeof value === 'number' && value % 1 !== 0 ? value.toFixed(1) : value.toLocaleString()}
          <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>
        </div>
        <div className="flex items-center space-x-2 mt-2">
          <div className="flex-1">
            <Progress 
              value={Math.min(percentage, 100)} 
              className="h-2"
              style={{ 
                background: `${getProgressColor()}20` 
              }}
            />
          </div>
          <span className="text-xs text-muted-foreground">
            {percentage.toFixed(0)}%
          </span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-1">
            {trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
            {trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
            {trend === 'stable' && <div className="h-3 w-3 bg-gray-400 rounded-full" />}
            <span className={`text-xs ${getStatusColor()}`}>
              {change > 0 ? '+' : ''}{change}%
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            Target: {target.toLocaleString()}{unit}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// Revenue Trend Chart Component
function RevenueTrendChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Trend vs Target</CardTitle>
        <CardDescription>
          Monthly revenue performance compared to targets
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={executiveMetrics.revenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [
                `$${value.toLocaleString()}`,
                name === 'revenue' ? 'Actual Revenue' : 'Target'
              ]}
            />
            <Area 
              type="monotone" 
              dataKey="target" 
              stroke="#EF4444" 
              fill="#EF444420"
              strokeDasharray="5 5"
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#3B82F6" 
              fill="#3B82F6"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Patient Flow Chart Component
function PatientFlowChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient Acquisition & Retention</CardTitle>
        <CardDescription>
          New patient acquisitions vs returning patients
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={executiveMetrics.patientFlowData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="new" fill="#10B981" name="New Patients" />
            <Bar dataKey="returning" fill="#3B82F6" name="Returning Patients" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Service Mix Pie Chart Component
function ServiceMixChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Mix Distribution</CardTitle>
        <CardDescription>
          Revenue distribution by service category
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={executiveMetrics.serviceMix}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, value }) => `${name}: ${value}%`}
            >
              {executiveMetrics.serviceMix.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Regional Performance Table Component
function RegionalPerformanceTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Regional Performance</CardTitle>
        <CardDescription>
          Clinic performance breakdown by region
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {executiveMetrics.regionalPerformance.map((region) => (
            <div key={region.region} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">{region.region}</h4>
                <p className="text-sm text-muted-foreground">
                  {region.patients} patients • ${region.revenue.toLocaleString()} revenue
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">
                    <Award className="h-3 w-3 mr-1" />
                    {region.satisfaction}/5
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Monthly Comparison Component
function MonthlyComparison() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Month-over-Month Comparison</CardTitle>
        <CardDescription>
          Key performance metrics comparison with previous month
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {executiveMetrics.monthlyComparison.map((item) => (
            <div key={item.metric} className="flex items-center justify-between">
              <div>
                <span className="font-medium">{item.metric}</span>
                <div className="text-sm text-muted-foreground">
                  {typeof item.current === 'number' && item.current % 1 !== 0 
                    ? item.current.toFixed(1) 
                    : item.current.toLocaleString()}
                  {' vs '}
                  {typeof item.previous === 'number' && item.previous % 1 !== 0 
                    ? item.previous.toFixed(1) 
                    : item.previous.toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <Badge variant={item.change > 0 ? "default" : "destructive"}>
                  {item.change > 0 ? '+' : ''}{item.change}%
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Growth Metrics Component
function GrowthMetrics() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Growth Metrics</CardTitle>
        <CardDescription>
          Key growth indicators and trends
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 border rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {executiveMetrics.growthMetrics.patientGrowthRate}%
            </div>
            <div className="text-sm text-muted-foreground">Patient Growth</div>
          </div>
          <div className="text-center p-3 border rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {executiveMetrics.growthMetrics.revenueGrowthRate}%
            </div>
            <div className="text-sm text-muted-foreground">Revenue Growth</div>
          </div>
          <div className="text-center p-3 border rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              +{executiveMetrics.growthMetrics.conversionImprovement}%
            </div>
            <div className="text-sm text-muted-foreground">Conversion Improvement</div>
          </div>
          <div className="text-center p-3 border rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {executiveMetrics.growthMetrics.satisfactionTrend > 0 ? '+' : ''}
              {executiveMetrics.growthMetrics.satisfactionTrend}
            </div>
            <div className="text-sm text-muted-foreground">Satisfaction Trend</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Main Executive Dashboard Component
export function ExecutiveDashboard({
  clinicId,
  metrics,
  timeRange,
  isRealTimeActive,
  customWidgets,
}: ExecutiveDashboardProps) {
  // Calculate real-time performance indicators
  const performanceIndicators = useMemo(() => {
    if (!metrics) return null;

    return {
      systemHealth: metrics.errorRate < 0.05 ? 'excellent' : metrics.errorRate < 0.1 ? 'good' : 'warning',
      userEngagement: metrics.activeUsers > 500 ? 'high' : metrics.activeUsers > 200 ? 'medium' : 'low',
      operationalEfficiency: (metrics.currentLoadTime < 2000) ? 'high' : 'medium',
      conversionHealth: (metrics.conversionRate > 0.15) ? 'excellent' : metrics.conversionRate > 0.10 ? 'good' : 'warning',
    };
  }, [metrics]);

  if (customWidgets && customWidgets.length > 0) {
    // Render custom widgets if provided
    return (
      <div className="space-y-6">
        {customWidgets.map((widget) => (
          <Card key={widget.id}>
            <CardHeader>
              <CardTitle>{widget.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div dangerouslySetInnerHTML={{ __html: widget.dataSource }} />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Real-time Status Indicator */}
      {metrics && performanceIndicators && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-green-800">System Health: Excellent</span>
          </div>
          <div className="flex items-center space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Users className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              {metrics.activeUsers} Active Users
            </span>
          </div>
          <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <Clock className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">
              Load: {metrics.currentLoadTime}ms
            </span>
          </div>
          <div className="flex items-center space-x-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <Target className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">
              Conversion: {(metrics.conversionRate * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {executiveMetrics.kpis.map((kpi) => (
          <KPICard key={kpi.name} {...kpi} />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueTrendChart />
        <PatientFlowChart />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ServiceMixChart />
        <GrowthMetrics />
        <MonthlyComparison />
      </div>

      {/* Regional Performance */}
      <RegionalPerformanceTable />

      {/* Executive Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Executive Summary</CardTitle>
          <CardDescription>
            Key insights and recommendations for leadership
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                Key Achievements
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  Patient satisfaction exceeds target by 4.4%
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  Revenue growth of 12.3% year-over-year
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  Active patients exceeded target by 8.2%
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  Central region shows strongest performance
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2 text-yellow-600" />
                Areas for Improvement
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-yellow-600 mr-2">•</span>
                  Appointment conversion rate 7.5% below target
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-600 mr-2">•</span>
                  West region underperforming in patient volume
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-600 mr-2">•</span>
                  Specialist consultation uptake lower than expected
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-600 mr-2">•</span>
                  Consider expanding Healthier SG program reach
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}