'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Award, 
  Calendar, 
  Activity,
  Heart,
  Scale,
  Zap,
  CheckCircle2,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { HealthProfile, HealthGoal } from './HealthProfileDashboard';

interface HealthProgressChartProps {
  healthProfile: HealthProfile;
  goals: HealthGoal[];
  timeRange?: '1week' | '1month' | '3months' | '6months' | '1year' | 'all';
  className?: string;
}

// Mock data for demonstration
const generateMockProgressData = (timeRange: string) => {
  const periods = {
    '1week': 7,
    '1month': 30,
    '3months': 90,
    '6months': 180,
    '1year': 365,
    'all': 365
  };
  
  const days = periods[timeRange as keyof typeof periods] || 30;
  const data = [];
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      weight: 75 + Math.sin(i * 0.1) * 2 + Math.random() * 1,
      bloodPressure: 120 + Math.sin(i * 0.05) * 10 + Math.random() * 5,
      bloodSugar: 100 + Math.sin(i * 0.03) * 8 + Math.random() * 3,
      cholesterol: 200 + Math.cos(i * 0.02) * 15 + Math.random() * 8,
      heartRate: 72 + Math.sin(i * 0.08) * 5 + Math.random() * 3,
      steps: 8000 + Math.sin(i * 0.15) * 2000 + Math.random() * 1000,
      exerciseMinutes: 30 + Math.sin(i * 0.12) * 15 + Math.random() * 5
    });
  }
  
  return data;
};

const goalProgressData = [
  { name: 'Weight Loss', progress: 75, target: 100, color: '#3B82F6' },
  { name: 'Blood Pressure', progress: 60, target: 100, color: '#EF4444' },
  { name: 'Exercise', progress: 90, target: 100, color: '#10B981' },
  { name: 'Nutrition', progress: 45, target: 100, color: '#F59E0B' },
  { name: 'Sleep', progress: 85, target: 100, color: '#8B5CF6' },
  { name: 'Stress Mgmt', progress: 70, target: 100, color: '#EC4899' }
];

const healthMetricsData = [
  { metric: 'BMI', value: 24.5, target: 22.0, unit: '', status: 'warning' },
  { metric: 'Blood Pressure', value: 125, target: 120, unit: 'mmHg', status: 'good' },
  { metric: 'Heart Rate', value: 72, target: 70, unit: 'bpm', status: 'good' },
  { metric: 'Cholesterol', value: 180, target: 150, unit: 'mg/dL', status: 'warning' },
  { metric: 'Blood Sugar', value: 95, target: 90, unit: 'mg/dL', status: 'good' }
];

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

export function HealthProgressChart({
  healthProfile,
  goals,
  timeRange = '6months',
  className = ''
}: HealthProgressChartProps) {
  const progressData = useMemo(() => generateMockProgressData(timeRange), [timeRange]);
  
  const currentMetrics = healthProfile.currentHealth;
  const bmi = currentMetrics.measurements.bmi?.value;
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{formatDate(label)}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}{entry.unit || ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vitals">Vitals</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {healthMetricsData.map((metric) => (
              <Card key={metric.metric}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.metric}</CardTitle>
                  {getStatusIcon(metric.status)}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metric.value} {metric.unit}
                  </div>
                  <div className="flex items-center text-xs text-gray-600 mt-1">
                    <span>Target: {metric.target} {metric.unit}</span>
                  </div>
                  <Progress 
                    value={Math.min((metric.value / metric.target) * 100, 100)} 
                    className="mt-2 h-2"
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Goal Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Goal Progress Overview
              </CardTitle>
              <CardDescription>Track your health goals progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={goalProgressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="progress" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vitals Tab */}
        <TabsContent value="vitals" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weight Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Scale className="w-5 h-5 mr-2" />
                  Weight Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={progressData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={formatDate}
                        interval="preserveStartEnd"
                      />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Line 
                        type="monotone" 
                        dataKey="weight" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 flex justify-between text-sm text-gray-600">
                  <span>Current: {progressData[progressData.length - 1]?.weight?.toFixed(1)} kg</span>
                  <span>Target: 70 kg</span>
                </div>
              </CardContent>
            </Card>

            {/* Blood Pressure Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="w-5 h-5 mr-2" />
                  Blood Pressure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={progressData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={formatDate}
                        interval="preserveStartEnd"
                      />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="bloodPressure" 
                        stroke="#EF4444" 
                        fill="#EF4444" 
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 flex justify-between text-sm text-gray-600">
                  <span>Current: {progressData[progressData.length - 1]?.bloodPressure?.toFixed(0)} mmHg</span>
                  <span>Target: 120 mmHg</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Multiple Vitals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Health Metrics Trends
              </CardTitle>
              <CardDescription>Track multiple health indicators over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate}
                      interval="preserveStartEnd"
                    />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="heartRate" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      name="Heart Rate"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="bloodSugar" 
                      stroke="#F59E0B" 
                      strokeWidth={2}
                      name="Blood Sugar"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="cholesterol" 
                      stroke="#8B5CF6" 
                      strokeWidth={2}
                      name="Cholesterol"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-6">
          {/* Goal Progress Radar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Goal Progress Analysis
              </CardTitle>
              <CardDescription>Visualize progress across different health goals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" data={goalProgressData}>
                    <RadialBar 
                      minAngle={15} 
                      label={{ position: 'insideStart', fill: '#fff' }} 
                      background 
                      clockWise 
                      dataKey="progress" 
                    />
                    <Tooltip />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Individual Goal Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goalProgressData.map((goal, index) => (
              <Card key={goal.name}>
                <CardHeader>
                  <CardTitle className="text-lg">{goal.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Progress</span>
                      <Badge variant="secondary">{goal.progress}%</Badge>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {goal.progress >= 100 ? (
                          <span className="flex items-center text-green-600">
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Achieved
                          </span>
                        ) : goal.progress >= 75 ? (
                          <span className="flex items-center text-blue-600">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            On Track
                          </span>
                        ) : (
                          <span className="flex items-center text-yellow-600">
                            <Clock className="w-4 h-4 mr-1" />
                            In Progress
                          </span>
                        )}
                      </span>
                      <span className="text-gray-500">{goal.target}% target</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          {/* Activity Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Activity & Exercise Trends
              </CardTitle>
              <CardDescription>Monitor your physical activity and exercise patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate}
                      interval="preserveStartEnd"
                    />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="steps" 
                      stackId="1"
                      stroke="#10B981" 
                      fill="#10B981" 
                      fillOpacity={0.6}
                      name="Steps"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="exerciseMinutes" 
                      stackId="2"
                      stroke="#3B82F6" 
                      fill="#3B82F6" 
                      fillOpacity={0.6}
                      name="Exercise Minutes"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Health Score Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Health Score Trend</CardTitle>
              <CardDescription>Your composite health score over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressData.map((item, index) => ({
                    ...item,
                    healthScore: 75 + Math.sin(index * 0.1) * 10 + Math.random() * 5
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate}
                      interval="preserveStartEnd"
                    />
                    <YAxis domain={[0, 100]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="healthScore" 
                      stroke="#8B5CF6" 
                      strokeWidth={3}
                      dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          {/* Achievement Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Recent Achievements
              </CardTitle>
              <CardDescription>Celebrate your health milestones and accomplishments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mr-2" />
                    <span className="font-medium text-green-800">Goal Achieved</span>
                  </div>
                  <p className="text-sm text-green-700">Lost 5kg in 3 months</p>
                  <p className="text-xs text-green-600 mt-1">2 days ago</p>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="font-medium text-blue-800">Streak</span>
                  </div>
                  <p className="text-sm text-blue-700">30 days of exercise</p>
                  <p className="text-xs text-blue-600 mt-1">1 week ago</p>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Target className="w-5 h-5 text-purple-600 mr-2" />
                    <span className="font-medium text-purple-800">Milestone</span>
                  </div>
                  <p className="text-sm text-purple-700">Blood pressure controlled</p>
                  <p className="text-xs text-purple-600 mt-1">2 weeks ago</p>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Activity className="w-5 h-5 text-yellow-600 mr-2" />
                    <span className="font-medium text-yellow-800">Improvement</span>
                  </div>
                  <p className="text-sm text-yellow-700">Reduced stress levels</p>
                  <p className="text-xs text-yellow-600 mt-1">3 weeks ago</p>
                </div>
                
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Heart className="w-5 h-5 text-orange-600 mr-2" />
                    <span className="font-medium text-orange-800">Health Check</span>
                  </div>
                  <p className="text-sm text-orange-700">Annual checkup completed</p>
                  <p className="text-xs text-orange-600 mt-1">1 month ago</p>
                </div>
                
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <TrendingUp className="w-5 h-5 text-indigo-600 mr-2" />
                    <span className="font-medium text-indigo-800">Progress</span>
                  </div>
                  <p className="text-sm text-indigo-700">BMI improved by 2 points</p>
                  <p className="text-xs text-indigo-600 mt-1">1 month ago</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Upcoming Milestones
              </CardTitle>
              <CardDescription>Your next health goals and targets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Target Weight: 70kg</h4>
                    <p className="text-sm text-gray-600">Due in 2 months</p>
                  </div>
                  <Badge variant="outline">In Progress</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Exercise 150 min/week</h4>
                    <p className="text-sm text-gray-600">Ongoing target</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">On Track</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Blood Pressure &lt; 120/80</h4>
                    <p className="text-sm text-gray-600">Due next month</p>
                  </div>
                  <Badge variant="outline">In Progress</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}