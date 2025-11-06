"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  UsersIcon,
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  CalendarDaysIcon,
  Cog6ToothIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { ServiceAvailability } from '@/hooks/service/use-availability-tracker';

interface CapacityManagementDashboardProps {
  availability: ServiceAvailability[];
  clinicId?: string;
  serviceId?: string;
  timeRange?: 'today' | 'week' | 'month';
}

interface CapacityMetrics {
  totalCapacity: number;
  usedCapacity: number;
  utilizationRate: number;
  peakHours: string[];
  bottlenecks: BottleneckAnalysis[];
  recommendations: CapacityRecommendation[];
  staffEfficiency: number;
  equipmentUtilization: number;
  patientFlowRate: number;
}

interface BottleneckAnalysis {
  area: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  impact: number; // percentage impact on capacity
  causes: string[];
  solutions: string[];
  estimatedImprovement: number;
}

interface CapacityRecommendation {
  id: string;
  type: 'immediate' | 'short_term' | 'long_term';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: {
    capacityIncrease: number;
    waitTimeReduction: number;
    cost: number;
  };
  implementation: {
    difficulty: 'easy' | 'moderate' | 'difficult';
    timeframe: string;
    resources: string[];
  };
}

export function CapacityManagementDashboard({
  availability,
  clinicId,
  serviceId,
  timeRange = 'today',
}: CapacityManagementDashboardProps) {
  const [selectedView, setSelectedView] = useState<'overview' | 'bottlenecks' | 'recommendations'>('overview');
  const [refreshing, setRefreshing] = useState(false);

  // Calculate capacity metrics
  const capacityMetrics = useMemo(() => {
    if (!availability || availability.length === 0) {
      return getEmptyMetrics();
    }

    const allSlots = availability.flatMap(avail => avail.timeSlots);
    const totalSlots = allSlots.length;
    const bookedSlots = allSlots.filter(slot => slot.isBooked).length;
    const usedSlots = allSlots.filter(slot => slot.isBooked || slot.isReserved).length;
    
    const utilizationRate = totalSlots > 0 ? (usedSlots / totalSlots) * 100 : 0;
    
    // Mock data for demonstration
    const peakHours = ['09:00', '10:30', '14:00', '15:30'];
    const staffEfficiency = 85;
    const equipmentUtilization = 78;
    const patientFlowRate = 12; // patients per hour

    const bottlenecks: BottleneckAnalysis[] = [
      {
        area: 'Registration Process',
        severity: 'medium',
        impact: 15,
        causes: ['Manual form filling', 'Insurance verification delays'],
        solutions: ['Digital check-in kiosks', 'Automated insurance verification'],
        estimatedImprovement: 25,
      },
      {
        area: 'Doctor Consultation',
        severity: 'low',
        impact: 8,
        causes: ['Extended consultations', 'Consultation overruns'],
        solutions: ['Time management coaching', 'Consultation time alerts'],
        estimatedImprovement: 12,
      },
      {
        area: 'Laboratory Tests',
        severity: 'high',
        impact: 22,
        causes: ['Equipment limitations', 'Staff shortage'],
        solutions: ['Add laboratory capacity', 'Cross-train staff'],
        estimatedImprovement: 35,
      },
    ];

    const recommendations: CapacityRecommendation[] = [
      {
        id: 'rec-1',
        type: 'immediate',
        priority: 'high',
        title: 'Implement Digital Check-in',
        description: 'Replace manual registration with digital kiosks to reduce registration time by 60%',
        impact: {
          capacityIncrease: 15,
          waitTimeReduction: 25,
          cost: 5000,
        },
        implementation: {
          difficulty: 'moderate',
          timeframe: '2-4 weeks',
          resources: ['IT support', 'Hardware purchase', 'Staff training'],
        },
      },
      {
        id: 'rec-2',
        type: 'short_term',
        priority: 'medium',
        title: 'Extend Peak Hour Coverage',
        description: 'Add additional doctor during peak hours (9-11 AM and 2-4 PM)',
        impact: {
          capacityIncrease: 20,
          waitTimeReduction: 30,
          cost: 8000,
        },
        implementation: {
          difficulty: 'moderate',
          timeframe: '1-2 months',
          resources: ['Additional staffing', 'Scheduling adjustments'],
        },
      },
      {
        id: 'rec-3',
        type: 'long_term',
        priority: 'high',
        title: 'Equipment Upgrade',
        description: 'Upgrade laboratory equipment to increase testing capacity',
        impact: {
          capacityIncrease: 35,
          waitTimeReduction: 40,
          cost: 25000,
        },
        implementation: {
          difficulty: 'difficult',
          timeframe: '3-6 months',
          resources: ['Capital investment', 'Equipment installation', 'Staff training'],
        },
      },
    ];

    return {
      totalCapacity: totalSlots,
      usedCapacity: usedSlots,
      utilizationRate,
      peakHours,
      bottlenecks,
      recommendations,
      staffEfficiency,
      equipmentUtilization,
      patientFlowRate,
    };
  }, [availability]);

  const getEmptyMetrics = (): CapacityMetrics => ({
    totalCapacity: 0,
    usedCapacity: 0,
    utilizationRate: 0,
    peakHours: [],
    bottlenecks: [],
    recommendations: [],
    staffEfficiency: 0,
    equipmentUtilization: 0,
    patientFlowRate: 0,
  });

  const getUtilizationColor = (rate: number) => {
    if (rate >= 90) return 'text-red-600';
    if (rate >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getUtilizationBg = (rate: number) => {
    if (rate >= 90) return 'bg-red-50 border-red-200';
    if (rate >= 75) return 'bg-yellow-50 border-yellow-200';
    return 'bg-green-50 border-green-200';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Capacity Management</h2>
          <p className="text-gray-600">Monitor and optimize clinic capacity utilization</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            {timeRange} view
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      <Tabs value={selectedView} onValueChange={(value: any) => setSelectedView(value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bottlenecks">Bottlenecks</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Utilization Rate */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Utilization Rate</p>
                    <p className={`text-3xl font-bold ${getUtilizationColor(capacityMetrics.utilizationRate)}`}>
                      {capacityMetrics.utilizationRate.toFixed(1)}%
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-blue-100">
                    <ChartBarIcon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <Progress 
                  value={capacityMetrics.utilizationRate} 
                  className="mt-3"
                />
                <p className="text-xs text-gray-500 mt-2">
                  {capacityMetrics.usedCapacity} of {capacityMetrics.totalCapacity} slots used
                </p>
              </CardContent>
            </Card>

            {/* Staff Efficiency */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Staff Efficiency</p>
                    <p className="text-3xl font-bold text-green-600">
                      {capacityMetrics.staffEfficiency}%
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-green-100">
                    <UsersIcon className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-3">
                  <TrendingUpIcon className="h-4 w-4 text-green-500 inline mr-1" />
                  <span className="text-xs text-green-600">+5% from last week</span>
                </div>
              </CardContent>
            </Card>

            {/* Patient Flow */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Patient Flow Rate</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {capacityMetrics.patientFlowRate}
                    </p>
                    <p className="text-xs text-gray-500">patients/hour</p>
                  </div>
                  <div className="p-3 rounded-full bg-blue-100">
                    <ClockIcon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-3">
                  <TrendingDownIcon className="h-4 w-4 text-red-500 inline mr-1" />
                  <span className="text-xs text-red-600">-2 from target</span>
                </div>
              </CardContent>
            </Card>

            {/* Equipment Utilization */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Equipment Usage</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {capacityMetrics.equipmentUtilization}%
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-purple-100">
                    <Cog6ToothIcon className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <Progress 
                  value={capacityMetrics.equipmentUtilization} 
                  className="mt-3"
                />
              </CardContent>
            </Card>
          </div>

          {/* Utilization Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ChartBarIcon className="h-5 w-5 text-blue-500" />
                <span>Hourly Utilization</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-12 gap-2 h-64">
                {Array.from({ length: 12 }, (_, i) => {
                  const hour = i + 8; // 8 AM to 7 PM
                  const utilization = Math.floor(Math.random() * 100);
                  return (
                    <div key={hour} className="flex flex-col items-center">
                      <div 
                        className={`w-full rounded-t ${
                          utilization >= 90 ? 'bg-red-500' :
                          utilization >= 75 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ height: `${utilization}%` }}
                        title={`${hour}:00 - ${utilization}% utilized`}
                      />
                      <span className="text-xs text-gray-600 mt-1">
                        {hour}:00
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Peak Hours Alert */}
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <BellIcon className="h-5 w-5 text-orange-600" />
                <div>
                  <h3 className="font-medium text-orange-900">Peak Hours Analysis</h3>
                  <p className="text-sm text-orange-800">
                    Highest utilization during: {capacityMetrics.peakHours.join(', ')}
                  </p>
                  <p className="text-xs text-orange-700 mt-1">
                    Consider adding staff during these hours to improve patient flow
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bottlenecks Tab */}
        <TabsContent value="bottlenecks" className="space-y-4">
          {capacityMetrics.bottlenecks.map((bottleneck, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{bottleneck.area}</CardTitle>
                  <Badge className={getSeverityColor(bottleneck.severity)}>
                    {bottleneck.severity.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Impact on Capacity</span>
                    <span className="text-sm font-bold text-gray-900">-{bottleneck.impact}%</span>
                  </div>
                  <Progress value={bottleneck.impact * 4} className="h-2" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Identified Causes</h4>
                    <ul className="space-y-1">
                      {bottleneck.causes.map((cause, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start">
                          <ExclamationTriangleIcon className="h-3 w-3 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                          {cause}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Recommended Solutions</h4>
                    <ul className="space-y-1">
                      {bottleneck.solutions.map((solution, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start">
                          <div className="h-3 w-3 bg-green-500 rounded-full mr-2 mt-0.5 flex-shrink-0" />
                          {solution}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-900">
                      Expected Improvement
                    </span>
                    <span className="text-lg font-bold text-green-600">
                      +{bottleneck.estimatedImprovement}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          {capacityMetrics.recommendations.map((recommendation, index) => (
            <Card key={recommendation.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{recommendation.title}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge className={getPriorityColor(recommendation.priority)}>
                      {recommendation.priority.toUpperCase()}
                    </Badge>
                    <Badge variant="outline">
                      {recommendation.type.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">{recommendation.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      +{recommendation.impact.capacityIncrease}%
                    </div>
                    <div className="text-sm text-blue-800">Capacity Increase</div>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      -{recommendation.impact.waitTimeReduction}%
                    </div>
                    <div className="text-sm text-green-800">Wait Time Reduction</div>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      ${recommendation.impact.cost.toLocaleString()}
                    </div>
                    <div className="text-sm text-purple-800">Implementation Cost</div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Implementation Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Difficulty:</span>
                      <span className="ml-2 font-medium capitalize">
                        {recommendation.implementation.difficulty}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Timeframe:</span>
                      <span className="ml-2 font-medium">
                        {recommendation.implementation.timeframe}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <span className="text-gray-600 text-sm">Required Resources:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {recommendation.implementation.resources.map((resource, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {resource}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}