// Marketing Dashboard Component
// Sub-Phase 10.1: Advanced Analytics & Tracking System Architecture

'use client';

import React, { useMemo } from 'react';
import { RealTimeMetrics, TimeRangeKey, DashboardWidget } from '../../types/analytics.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Target, 
  Mail,
  Phone,
  Search,
  Globe,
  Share2,
  BarChart3,
  PieChart,
  MousePointer,
  Eye,
  Calendar,
  Star,
  Megaphone,
  Activity,
  UserCheck
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
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  FunnelChart,
  Funnel,
  LabelList,
  ComposedChart,
  Scatter,
  ScatterChart,
} from 'recharts';

interface MarketingDashboardProps {
  clinicId?: string;
  metrics: RealTimeMetrics | null;
  timeRange: TimeRangeKey;
  isRealTimeActive: boolean;
  customWidgets?: DashboardWidget[];
}

// Mock data for marketing metrics
const marketingMetrics = {
  campaignPerformance: [
    {
      name: 'Healthier SG Awareness',
      impressions: 125000,
      clicks: 4500,
      conversions: 320,
      cost: 8500,
      ctr: 3.6,
      conversionRate: 7.1,
      roas: 4.8,
      status: 'excellent',
    },
    {
      name: 'New Patient Acquisition',
      impressions: 95000,
      clicks: 3800,
      conversions: 245,
      cost: 7200,
      ctr: 4.0,
      conversionRate: 6.4,
      roas: 3.2,
      status: 'good',
    },
    {
      name: 'Service Promotion',
      impressions: 78000,
      clicks: 2900,
      conversions: 180,
      cost: 5800,
      ctr: 3.7,
      conversionRate: 6.2,
      roas: 2.8,
      status: 'good',
    },
    {
      name: 'Doctor Profile Promotion',
      impressions: 62000,
      clicks: 2100,
      conversions: 95,
      cost: 4200,
      ctr: 3.4,
      conversionRate: 4.5,
      roas: 2.1,
      status: 'warning',
    },
  ],
  userAcquisition: {
    total: 3247,
    organic: 1450,
    paid: 890,
    referral: 507,
    social: 400,
    email: 285,
    direct: 215,
  },
  conversionFunnel: [
    { stage: 'Landing Page', visitors: 15420, percentage: 100 },
    { stage: 'Service Interest', visitors: 12450, percentage: 80.7 },
    { stage: 'Contact Form', visitors: 8230, percentage: 53.4 },
    { stage: 'Phone Call', visitors: 4560, percentage: 29.6 },
    { stage: 'Appointment Booked', visitors: 2450, percentage: 15.9 },
  ],
  channelPerformance: [
    { channel: 'Google Ads', sessions: 8450, cost: 12500, conversions: 420, revenue: 45000 },
    { channel: 'Facebook Ads', sessions: 6320, cost: 8900, conversions: 310, revenue: 32000 },
    { channel: 'SEO', sessions: 12500, cost: 0, conversions: 380, revenue: 52000 },
    { channel: 'Email Marketing', sessions: 2100, cost: 500, conversions: 95, revenue: 15000 },
    { channel: 'Referral', sessions: 890, cost: 200, conversions: 45, revenue: 8500 },
  ],
  customerJourney: {
    discovery: { sessions: 45230, bounceRate: 35.2, avgTime: 185 },
    research: { sessions: 28950, bounceRate: 28.5, avgTime: 245 },
    consideration: { sessions: 18320, bounceRate: 22.1, avgTime: 320 },
    decision: { sessions: 12450, bounceRate: 18.9, avgTime: 280 },
    retention: { sessions: 8920, bounceRate: 12.3, avgTime: 420 },
  },
  contentPerformance: [
    { contentType: 'Doctor Profiles', views: 18500, engagement: 7.8, conversions: 124 },
    { contentType: 'Service Pages', views: 15200, engagement: 6.2, conversions: 98 },
    { contentType: 'Healthier SG Info', views: 12300, engagement: 8.5, conversions: 156 },
    { contentType: 'Blog Articles', views: 9800, engagement: 4.2, conversions: 45 },
    { contentType: 'FAQ', views: 7600, engagement: 9.1, conversions: 78 },
  ],
  geographicPerformance: [
    { region: 'Central', clicks: 8500, conversions: 420, cost: 8500 },
    { region: 'East', clicks: 7200, conversions: 380, cost: 7200 },
    { region: 'North', clicks: 5800, conversions: 285, cost: 5800 },
    { region: 'West', clicks: 4900, conversions: 220, cost: 4900 },
    { region: 'South', clicks: 3200, conversions: 165, cost: 3200 },
  ],
  abTestResults: [
    {
      testName: 'CTA Button Color',
      variantA: { name: 'Blue', conversions: 156, visitors: 2800 },
      variantB: { name: 'Green', conversions: 189, visitors: 2750 },
      confidence: 95.2,
      winner: 'Green',
      improvement: 21.2,
    },
    {
      testName: 'Hero Section Layout',
      variantA: { name: 'Text Left', conversions: 142, visitors: 2400 },
      variantB: { name: 'Image Left', conversions: 178, visitors: 2380 },
      confidence: 87.8,
      winner: 'Image Left',
      improvement: 25.4,
    },
  ],
  weeklyMetrics: [
    { week: 'W1', conversions: 89, cost: 4200, roas: 3.2 },
    { week: 'W2', conversions: 105, cost: 4600, roas: 3.8 },
    { week: 'W3', conversions: 124, cost: 5100, roas: 4.1 },
    { week: 'W4', conversions: 118, cost: 4800, roas: 4.2 },
    { week: 'W5', conversions: 135, cost: 5200, roas: 4.5 },
    { week: 'W6', conversions: 142, cost: 5450, roas: 4.7 },
  ],
};

// KPI Card Component for Marketing
interface MarketingKPICardProps {
  title: string;
  value: number;
  target?: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  icon: React.ReactNode;
  description?: string;
}

function MarketingKPICard({ 
  title, value, target, unit, trend, change, status, icon, description 
}: MarketingKPICardProps) {
  const percentage = target ? (value / target) * 100 : null;
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
    if (percentage === null) return 'bg-gray-500';
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 90) return 'bg-blue-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {typeof value === 'number' && value % 1 !== 0 ? value.toFixed(1) : value.toLocaleString()}
          <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {percentage && (
          <div className="flex items-center space-x-2 mt-2">
            <div className="flex-1">
              <Progress 
                value={Math.min(percentage, 100)} 
                className="h-2"
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {percentage.toFixed(0)}%
            </span>
          </div>
        )}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-1">
            {trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
            {trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
            {trend === 'stable' && <div className="h-3 w-3 bg-gray-400 rounded-full" />}
            <span className={`text-xs ${getStatusColor()}`}>
              {change > 0 ? '+' : ''}{change}%
            </span>
          </div>
          {target && (
            <span className="text-xs text-muted-foreground">
              Target: {target.toLocaleString()}{unit}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Campaign Performance Table Component
function CampaignPerformanceTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Performance</CardTitle>
        <CardDescription>
          Detailed metrics for all marketing campaigns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {marketingMetrics.campaignPerformance.map((campaign) => (
            <div key={campaign.name} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold">{campaign.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {campaign.impressions.toLocaleString()} impressions • {campaign.clicks.toLocaleString()} clicks
                  </p>
                </div>
                <Badge 
                  variant={campaign.status === 'excellent' ? 'default' : campaign.status === 'good' ? 'secondary' : 'outline'}
                >
                  {campaign.status}
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">CTR</span>
                  <div className="font-semibold">{campaign.ctr}%</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Conversion Rate</span>
                  <div className="font-semibold">{campaign.conversionRate}%</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Cost</span>
                  <div className="font-semibold">${campaign.cost.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Conversions</span>
                  <div className="font-semibold">{campaign.conversions}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">ROAS</span>
                  <div className="font-semibold">{campaign.roas}x</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Cost/Conversion</span>
                  <div className="font-semibold">
                    ${(campaign.cost / campaign.conversions).toFixed(0)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Conversion Funnel Component
function ConversionFunnelChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversion Funnel</CardTitle>
        <CardDescription>
          User journey from landing to appointment booking
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <FunnelChart>
            <Tooltip />
            <Funnel
              dataKey="visitors"
              data={marketingMetrics.conversionFunnel}
              isAnimationActive
            >
              <LabelList position="center" fill="#fff" stroke="none" />
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>
        <div className="space-y-2 mt-4">
          {marketingMetrics.conversionFunnel.map((stage, index) => (
            <div key={stage.stage} className="flex items-center justify-between text-sm">
              <span className="flex items-center">
                <div 
                  className="w-4 h-4 rounded mr-2"
                  style={{ backgroundColor: `hsl(${240 - (index * 20)}, 70%, 50%)` }}
                />
                {stage.stage}
              </span>
              <div className="text-right">
                <div className="font-semibold">{stage.visitors.toLocaleString()}</div>
                <div className="text-muted-foreground">{stage.percentage.toFixed(1)}%</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Channel Performance Chart
function ChannelPerformanceChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Marketing Channel Performance</CardTitle>
        <CardDescription>
          Cost vs Revenue analysis by channel
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={marketingMetrics.channelPerformance}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="channel" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="cost" fill="#EF4444" name="Cost" />
            <Bar yAxisId="left" dataKey="revenue" fill="#10B981" name="Revenue" />
            <Line yAxisId="right" type="monotone" dataKey="conversions" stroke="#3B82F6" name="Conversions" />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Customer Journey Analysis
function CustomerJourneyAnalysis() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Journey Analysis</CardTitle>
        <CardDescription>
          Engagement metrics across journey stages
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(marketingMetrics.customerJourney).map(([stage, data]) => (
            <div key={stage} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold capitalize">{stage}</h4>
                <span className="text-sm text-muted-foreground">
                  {data.sessions.toLocaleString()} sessions
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Bounce Rate</span>
                  <div className="font-semibold">{data.bounceRate}%</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Avg. Time</span>
                  <div className="font-semibold">{data.avgTime}s</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Conversions</span>
                  <div className="font-semibold">
                    {((100 - data.bounceRate) / 100 * data.sessions / 100).toFixed(0)}
                  </div>
                </div>
              </div>
              <Progress value={100 - data.bounceRate} className="mt-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Content Performance Chart
function ContentPerformanceChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Performance</CardTitle>
        <CardDescription>
          Views and engagement by content type
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={marketingMetrics.contentPerformance}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="contentType" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="views" fill="#3B82F6" name="Views" />
            <Bar dataKey="conversions" fill="#10B981" name="Conversions" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// A/B Testing Results
function ABTestingResults() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>A/B Testing Results</CardTitle>
        <CardDescription>
          Statistical analysis of ongoing experiments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {marketingMetrics.abTestResults.map((test) => (
            <div key={test.testName} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">{test.testName}</h4>
                <Badge variant="outline">
                  {test.confidence.toFixed(1)}% Confidence
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="p-3 bg-blue-50 rounded">
                  <div className="font-semibold text-blue-800">{test.variantA.name}</div>
                  <div className="text-sm text-blue-600">
                    {test.variantA.conversions}/{test.variantA.visitors} 
                    ({(test.variantA.conversions / test.variantA.visitors * 100).toFixed(1)}%)
                  </div>
                </div>
                <div className="p-3 bg-green-50 rounded">
                  <div className="font-semibold text-green-800">{test.variantB.name}</div>
                  <div className="text-sm text-green-600">
                    {test.variantB.conversions}/{test.variantB.visitors} 
                    ({(test.variantB.conversions / test.variantB.visitors * 100).toFixed(1)}%)
                  </div>
                </div>
              </div>
              <div className="text-sm">
                <span className="font-semibold">Winner: {test.winner}</span>
                <span className="text-muted-foreground ml-2">
                  (+{test.improvement}% improvement)
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Weekly Trends Chart
function WeeklyTrendsChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Performance Trends</CardTitle>
        <CardDescription>
          Marketing performance metrics over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={marketingMetrics.weeklyMetrics}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="conversions" stroke="#10B981" name="Conversions" />
            <Line yAxisId="right" type="monotone" dataKey="roas" stroke="#3B82F6" name="ROAS" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Main Marketing Dashboard Component
export function MarketingDashboard({
  clinicId,
  metrics,
  timeRange,
  isRealTimeActive,
  customWidgets,
}: MarketingDashboardProps) {
  // Calculate real-time marketing indicators
  const marketingIndicators = useMemo(() => {
    if (!metrics) return null;

    return {
      leadQuality: metrics.conversionRate > 0.15 ? 'high' : metrics.conversionRate > 0.10 ? 'medium' : 'low',
      userEngagement: metrics.activeUsers > 500 ? 'high' : metrics.activeUsers > 200 ? 'medium' : 'low',
      campaignPerformance: metrics.conversionRate > 0.15 ? 'excellent' : 'good',
      costEfficiency: (metrics.currentLoadTime < 2000) ? 'high' : 'medium',
    };
  }, [metrics]);

  // Calculate marketing KPIs
  const marketingKPIs = useMemo(() => {
    const totalCost = marketingMetrics.campaignPerformance.reduce((sum, campaign) => sum + campaign.cost, 0);
    const totalConversions = marketingMetrics.campaignPerformance.reduce((sum, campaign) => sum + campaign.conversions, 0);
    const totalImpressions = marketingMetrics.campaignPerformance.reduce((sum, campaign) => sum + campaign.impressions, 0);
    const totalClicks = marketingMetrics.campaignPerformance.reduce((sum, campaign) => sum + campaign.clicks, 0);
    
    return [
      {
        title: 'Total Conversions',
        value: totalConversions,
        target: 1000,
        unit: 'appointments',
        trend: 'up' as const,
        change: 18.5,
        status: 'good' as const,
        icon: <Target className="h-4 w-4" />,
        description: 'From all marketing channels',
      },
      {
        title: 'Cost per Acquisition',
        value: totalCost / totalConversions,
        target: 50,
        unit: 'SGD',
        trend: 'down' as const,
        change: -12.3,
        status: 'excellent' as const,
        icon: <TrendingDown className="h-4 w-4" />,
        description: 'Lower is better',
      },
      {
        title: 'Click-through Rate',
        value: (totalClicks / totalImpressions) * 100,
        target: 3.5,
        unit: '%',
        trend: 'up' as const,
        change: 8.2,
        status: 'excellent' as const,
        icon: <MousePointer className="h-4 w-4" />,
        description: 'Across all campaigns',
      },
      {
        title: 'ROAS',
        value: 4.1,
        target: 3.5,
        unit: 'x',
        trend: 'up' as const,
        change: 15.6,
        status: 'excellent' as const,
        icon: <BarChart3 className="h-4 w-4" />,
        description: 'Return on ad spend',
      },
    ];
  }, []);

  if (customWidgets && customWidgets.length > 0) {
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
      {/* Real-time Marketing Status */}
      {metrics && marketingIndicators && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <Target className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              Lead Quality: High
            </span>
          </div>
          <div className="flex items-center space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Users className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              {metrics.activeUsers} Active Users
            </span>
          </div>
          <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <Megaphone className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">
              4 Active Campaigns
            </span>
          </div>
          <div className="flex items-center space-x-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <BarChart3 className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">
              4.1x ROAS
            </span>
          </div>
        </div>
      )}

      {/* Marketing KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {marketingKPIs.map((kpi) => (
          <MarketingKPICard key={kpi.title} {...kpi} />
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="testing">A/B Tests</TabsTrigger>
          <TabsTrigger value="journey">Journey</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WeeklyTrendsChart />
            <ConversionFunnelChart />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Acquisition</CardTitle>
                <CardDescription>Breakdown by acquisition channel</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(marketingMetrics.userAcquisition).map(([source, count]) => (
                    <div key={source} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{source}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(count / marketingMetrics.userAcquisition.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-12 text-right">
                          {count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <ChannelPerformanceChart />
            <ContentPerformanceChart />
          </div>
        </TabsContent>

        <TabsContent value="campaigns">
          <CampaignPerformanceTable />
        </TabsContent>

        <TabsContent value="channels">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChannelPerformanceChart />
            <Card>
              <CardHeader>
                <CardTitle>Geographic Performance</CardTitle>
                <CardDescription>Performance breakdown by region</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {marketingMetrics.geographicPerformance.map((region) => (
                    <div key={region.region} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{region.region}</h4>
                        <p className="text-sm text-muted-foreground">
                          {region.clicks.toLocaleString()} clicks
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{region.conversions} conversions</div>
                        <div className="text-sm text-muted-foreground">
                          ${region.cost.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content">
          <ContentPerformanceChart />
        </TabsContent>

        <TabsContent value="testing">
          <ABTestingResults />
        </TabsContent>

        <TabsContent value="journey">
          <CustomerJourneyAnalysis />
        </TabsContent>
      </Tabs>

      {/* Marketing Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Marketing Insights & Recommendations</CardTitle>
          <CardDescription>
            AI-powered insights and actionable recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                Top Performers
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  Healthier SG awareness campaign exceeding ROAS target by 37%
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  SEO organic traffic showing 23% growth month-over-month
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  FAQ content achieving highest engagement rate at 9.1%
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  A/B test on hero section improving conversions by 25.4%
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 flex items-center">
                <Target className="h-4 w-4 mr-2 text-yellow-600" />
                Optimization Opportunities
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-yellow-600 mr-2">•</span>
                  Increase budget allocation to high-performing Google Ads campaigns
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-600 mr-2">•</span>
                  Optimize doctor profile promotion with better targeting
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-600 mr-2">•</span>
                  Focus on Central region expansion due to high conversion rates
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-600 mr-2">•</span>
                  Implement retargeting for users in consideration stage
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}