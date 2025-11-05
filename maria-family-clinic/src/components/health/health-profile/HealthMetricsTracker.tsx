'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Heart, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Save, 
  Calendar,
  AlertCircle,
  CheckCircle2,
  Target,
  Zap,
  Thermometer,
  Droplets,
  Users,
  Brain,
  Shield,
  Clock
} from 'lucide-react';
import { HealthProfile, HealthGoal } from './HealthProfileDashboard';

interface HealthMetricsTrackerProps {
  healthProfile: HealthProfile;
  onUpdate: (profile: HealthProfile) => void;
  compact?: boolean;
  className?: string;
}

interface HealthMetric {
  id: string;
  name: string;
  category: 'vitals' | 'measurements' | 'lifestyle';
  unit: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  currentValue?: number;
  lastRecorded?: Date;
  normalRange?: { min: number; max: number };
  optimalRange?: { min: number; max: number };
  trend: 'up' | 'down' | 'stable';
  status: 'optimal' | 'normal' | 'warning' | 'critical';
  recordingHistory: { date: Date; value: number }[];
}

const METRIC_DEFINITIONS: Omit<HealthMetric, 'currentValue' | 'lastRecorded' | 'recordingHistory'>[] = [
  // Vital Signs
  {
    id: 'blood-pressure-systolic',
    name: 'Blood Pressure (Systolic)',
    category: 'vitals',
    unit: 'mmHg',
    icon: Heart,
    color: 'text-red-500',
    normalRange: { min: 90, max: 140 },
    optimalRange: { min: 110, max: 120 },
    trend: 'stable',
    status: 'normal'
  },
  {
    id: 'blood-pressure-diastolic',
    name: 'Blood Pressure (Diastolic)',
    category: 'vitals',
    unit: 'mmHg',
    icon: Heart,
    color: 'text-red-500',
    normalRange: { min: 60, max: 90 },
    optimalRange: { min: 70, max: 80 },
    trend: 'stable',
    status: 'normal'
  },
  {
    id: 'heart-rate',
    name: 'Heart Rate',
    category: 'vitals',
    unit: 'bpm',
    icon: Activity,
    color: 'text-green-500',
    normalRange: { min: 60, max: 100 },
    optimalRange: { min: 60, max: 80 },
    trend: 'stable',
    status: 'normal'
  },
  {
    id: 'temperature',
    name: 'Body Temperature',
    category: 'vitals',
    unit: '°C',
    icon: Thermometer,
    color: 'text-blue-500',
    normalRange: { min: 36.1, max: 37.2 },
    optimalRange: { min: 36.5, max: 36.8 },
    trend: 'stable',
    status: 'normal'
  },
  {
    id: 'blood-sugar',
    name: 'Blood Sugar (Fasting)',
    category: 'vitals',
    unit: 'mg/dL',
    icon: Droplets,
    color: 'text-purple-500',
    normalRange: { min: 70, max: 140 },
    optimalRange: { min: 70, max: 100 },
    trend: 'down',
    status: 'normal'
  },
  {
    id: 'cholesterol-total',
    name: 'Total Cholesterol',
    category: 'vitals',
    unit: 'mg/dL',
    icon: Shield,
    color: 'text-orange-500',
    normalRange: { min: 0, max: 200 },
    optimalRange: { min: 0, max: 150 },
    trend: 'stable',
    status: 'normal'
  },

  // Physical Measurements
  {
    id: 'weight',
    name: 'Weight',
    category: 'measurements',
    unit: 'kg',
    icon: Target,
    color: 'text-blue-600',
    normalRange: { min: 45, max: 120 },
    optimalRange: { min: 55, max: 75 },
    trend: 'down',
    status: 'normal'
  },
  {
    id: 'height',
    name: 'Height',
    category: 'measurements',
    unit: 'cm',
    icon: TrendingUp,
    color: 'text-green-600',
    normalRange: { min: 150, max: 200 },
    optimalRange: { min: 160, max: 180 },
    trend: 'stable',
    status: 'normal'
  },
  {
    id: 'bmi',
    name: 'BMI',
    category: 'measurements',
    unit: '',
    icon: Target,
    color: 'text-indigo-500',
    normalRange: { min: 18.5, max: 24.9 },
    optimalRange: { min: 18.5, max: 22.9 },
    trend: 'stable',
    status: 'normal'
  },
  {
    id: 'body-fat',
    name: 'Body Fat Percentage',
    category: 'measurements',
    unit: '%',
    icon: Users,
    color: 'text-pink-500',
    normalRange: { min: 10, max: 25 },
    optimalRange: { min: 12, max: 20 },
    trend: 'down',
    status: 'normal'
  },
  {
    id: 'muscle-mass',
    name: 'Muscle Mass',
    category: 'measurements',
    unit: 'kg',
    icon: Zap,
    color: 'text-yellow-500',
    normalRange: { min: 25, max: 45 },
    optimalRange: { min: 30, max: 40 },
    trend: 'up',
    status: 'normal'
  },

  // Lifestyle Metrics
  {
    id: 'steps',
    name: 'Daily Steps',
    category: 'lifestyle',
    unit: '',
    icon: TrendingUp,
    color: 'text-green-500',
    normalRange: { min: 5000, max: 15000 },
    optimalRange: { min: 8000, max: 12000 },
    trend: 'up',
    status: 'normal'
  },
  {
    id: 'exercise-minutes',
    name: 'Exercise Minutes',
    category: 'lifestyle',
    unit: 'min',
    icon: Activity,
    color: 'text-blue-500',
    normalRange: { min: 30, max: 300 },
    optimalRange: { min: 150, max: 210 },
    trend: 'stable',
    status: 'normal'
  },
  {
    id: 'sleep-hours',
    name: 'Sleep Duration',
    category: 'lifestyle',
    unit: 'hours',
    icon: Clock,
    color: 'text-purple-500',
    normalRange: { min: 6, max: 10 },
    optimalRange: { min: 7, max: 9 },
    trend: 'stable',
    status: 'normal'
  },
  {
    id: 'stress-level',
    name: 'Stress Level',
    category: 'lifestyle',
    unit: '/10',
    icon: Brain,
    color: 'text-orange-500',
    normalRange: { min: 1, max: 7 },
    optimalRange: { min: 1, max: 4 },
    trend: 'down',
    status: 'normal'
  }
];

export function HealthMetricsTracker({
  healthProfile,
  onUpdate,
  compact = false,
  className = ''
}: HealthMetricsTrackerProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'vitals' | 'measurements' | 'lifestyle'>('all');
  const [selectedMetric, setSelectedMetric] = useState<HealthMetric | null>(null);
  const [newValue, setNewValue] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAddingMetric, setIsAddingMetric] = useState(false);

  // Initialize metrics with existing health profile data
  const initializeMetrics = (): HealthMetric[] => {
    return METRIC_DEFINITIONS.map(definition => {
      let currentValue: number | undefined;
      let lastRecorded: Date | undefined;
      let recordingHistory: { date: Date; value: number }[] = [];

      // Populate from existing health profile data
      switch (definition.id) {
        case 'weight':
          currentValue = healthProfile.personalInfo.weight;
          lastRecorded = healthProfile.currentHealth.measurements.bmi?.date;
          if (currentValue) {
            recordingHistory.push({ date: new Date(), value: currentValue });
          }
          break;
        case 'height':
          currentValue = healthProfile.personalInfo.height;
          lastRecorded = new Date(); // Assume current for height
          break;
        case 'bmi':
          currentValue = healthProfile.currentHealth.measurements.bmi?.value;
          lastRecorded = healthProfile.currentHealth.measurements.bmi?.date;
          break;
        case 'blood-pressure-systolic':
          currentValue = healthProfile.currentHealth.vitals.bloodPressure?.systolic;
          lastRecorded = healthProfile.currentHealth.vitals.bloodPressure?.date;
          break;
        case 'blood-pressure-diastolic':
          currentValue = healthProfile.currentHealth.vitals.bloodPressure?.diastolic;
          lastRecorded = healthProfile.currentHealth.vitals.bloodPressure?.date;
          break;
        case 'heart-rate':
          currentValue = healthProfile.currentHealth.vitals.heartRate?.value;
          lastRecorded = healthProfile.currentHealth.vitals.heartRate?.date;
          break;
        case 'temperature':
          currentValue = healthProfile.currentHealth.vitals.temperature?.value;
          lastRecorded = healthProfile.currentHealth.vitals.temperature?.date;
          break;
        case 'blood-sugar':
          currentValue = healthProfile.currentHealth.vitals.bloodSugar?.value;
          lastRecorded = healthProfile.currentHealth.vitals.bloodSugar?.date;
          break;
        case 'cholesterol-total':
          currentValue = healthProfile.currentHealth.vitals.cholesterol?.total;
          lastRecorded = healthProfile.currentHealth.vitals.cholesterol?.date;
          break;
        case 'steps':
          currentValue = Math.floor(Math.random() * 5000) + 5000; // Mock data
          recordingHistory = Array.from({ length: 7 }, (_, i) => ({
            date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000),
            value: Math.floor(Math.random() * 5000) + 5000
          }));
          break;
        case 'exercise-minutes':
          currentValue = 30; // Mock data
          break;
        case 'sleep-hours':
          currentValue = healthProfile.currentHealth.lifestyle.sleepHours;
          break;
        case 'stress-level':
          currentValue = healthProfile.currentHealth.lifestyle.stressLevel;
          break;
      }

      return {
        ...definition,
        currentValue,
        lastRecorded,
        recordingHistory: recordingHistory.length > 0 ? recordingHistory : 
          (currentValue ? [{ date: new Date(), value: currentValue }] : [])
      };
    });
  };

  const [metrics, setMetrics] = useState<HealthMetric[]>(initializeMetrics());

  const filteredMetrics = metrics.filter(metric => 
    selectedCategory === 'all' || metric.category === selectedCategory
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'text-green-600 bg-green-50 border-green-200';
      case 'normal': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'optimal': return <CheckCircle2 className="w-4 h-4" />;
      case 'normal': return <Target className="w-4 h-4" />;
      case 'warning': return <AlertCircle className="w-4 h-4" />;
      case 'critical': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'stable': return <Target className="w-4 h-4 text-blue-500" />;
      default: return null;
    }
  };

  const calculateStatus = (value: number, normalRange: { min: number; max: number }, optimalRange: { min: number; max: number }) => {
    if (value >= optimalRange.min && value <= optimalRange.max) {
      return 'optimal';
    } else if (value >= normalRange.min && value <= normalRange.max) {
      return 'normal';
    } else if (value < normalRange.min || value > normalRange.max) {
      // Calculate how far outside normal range
      const deviation = Math.max(
        Math.abs(value - normalRange.min),
        Math.abs(value - normalRange.max)
      );
      return deviation > (normalRange.max - normalRange.min) * 0.5 ? 'critical' : 'warning';
    }
    return 'normal';
  };

  const handleAddMetric = () => {
    if (!selectedMetric || !newValue) return;

    const value = parseFloat(newValue);
    if (isNaN(value)) return;

    const updatedMetrics = metrics.map(metric => {
      if (metric.id === selectedMetric.id) {
        const updatedHistory = [
          ...metric.recordingHistory,
          { date: new Date(newDate), value }
        ].sort((a, b) => b.date.getTime() - a.date.getTime());

        const updatedMetric = {
          ...metric,
          currentValue: value,
          lastRecorded: new Date(newDate),
          recordingHistory: updatedHistory,
          status: calculateStatus(value, metric.normalRange!, metric.optimalRange!)
        };

        // Update health profile with new values
        const updatedProfile = { ...healthProfile };
        updateHealthProfileFromMetric(updatedProfile, updatedMetric);

        return updatedMetric;
      }
      return metric;
    });

    setMetrics(updatedMetrics);
    onUpdate({ ...healthProfile });
    setNewValue('');
    setSelectedMetric(null);
    setIsAddingMetric(false);
  };

  const updateHealthProfileFromMetric = (profile: HealthProfile, metric: HealthMetric) => {
    const { id, currentValue } = metric;
    
    if (currentValue === undefined) return;

    switch (id) {
      case 'weight':
        profile.personalInfo.weight = currentValue;
        break;
      case 'height':
        profile.personalInfo.height = currentValue;
        break;
      case 'bmi':
        profile.currentHealth.measurements.bmi = {
          value: currentValue,
          date: metric.lastRecorded!
        };
        break;
      case 'blood-pressure-systolic':
        profile.currentHealth.vitals.bloodPressure = {
          systolic: currentValue,
          diastolic: profile.currentHealth.vitals.bloodPressure?.diastolic || 80,
          date: metric.lastRecorded!
        };
        break;
      case 'blood-pressure-diastolic':
        if (profile.currentHealth.vitals.bloodPressure) {
          profile.currentHealth.vitals.bloodPressure.diastolic = currentValue;
        }
        break;
      case 'heart-rate':
        profile.currentHealth.vitals.heartRate = {
          value: currentValue,
          date: metric.lastRecorded!
        };
        break;
      case 'temperature':
        profile.currentHealth.vitals.temperature = {
          value: currentValue,
          date: metric.lastRecorded!
        };
        break;
      case 'blood-sugar':
        profile.currentHealth.vitals.bloodSugar = {
          value: currentValue,
          date: metric.lastRecorded!
        };
        break;
      case 'cholesterol-total':
        profile.currentHealth.vitals.cholesterol = {
          total: currentValue,
          date: metric.lastRecorded!
        };
        break;
      case 'sleep-hours':
        profile.currentHealth.lifestyle.sleepHours = currentValue;
        break;
      case 'stress-level':
        profile.currentHealth.lifestyle.stressLevel = currentValue as 1 | 2 | 3 | 4 | 5;
        break;
    }

    profile.lastUpdated = new Date();
  };

  if (compact) {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 ${className}`}>
        {metrics.filter(m => m.currentValue !== undefined).slice(0, 6).map((metric) => (
          <Card key={metric.id} className={`cursor-pointer hover:shadow-md transition-shadow ${getStatusColor(metric.status)}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <metric.icon className={`w-4 h-4 ${metric.color}`} />
                {getTrendIcon(metric.trend)}
              </div>
              <div className="text-xs text-gray-600 mb-1">{metric.name}</div>
              <div className="text-lg font-bold">
                {metric.currentValue} {metric.unit}
              </div>
              {metric.lastRecorded && (
                <div className="text-xs text-gray-500 mt-1">
                  {metric.lastRecorded.toLocaleDateString()}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Health Metrics Tracker</h3>
          <p className="text-sm text-gray-600">Record and monitor your health measurements</p>
        </div>
        <Button onClick={() => setIsAddingMetric(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Measurement
        </Button>
      </div>

      {/* Category Filter */}
      <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Metrics</TabsTrigger>
          <TabsTrigger value="vitals">Vital Signs</TabsTrigger>
          <TabsTrigger value="measurements">Measurements</TabsTrigger>
          <TabsTrigger value="lifestyle">Lifestyle</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-4">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMetrics.map((metric) => (
              <Card key={metric.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center">
                      <metric.icon className={`w-5 h-5 mr-2 ${metric.color}`} />
                      {metric.name}
                    </CardTitle>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(metric.status)}
                      {getTrendIcon(metric.trend)}
                    </div>
                  </div>
                  <CardDescription>{metric.category}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {metric.currentValue !== undefined ? (
                    <>
                      <div className="text-center">
                        <div className="text-3xl font-bold">
                          {metric.currentValue} <span className="text-sm font-normal text-gray-600">{metric.unit}</span>
                        </div>
                        <Badge className={getStatusColor(metric.status)}>
                          {metric.status}
                        </Badge>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Normal Range:</span>
                          <span>{metric.normalRange!.min} - {metric.normalRange!.max} {metric.unit}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Optimal Range:</span>
                          <span>{metric.optimalRange!.min} - {metric.optimalRange!.max} {metric.unit}</span>
                        </div>
                        {metric.lastRecorded && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Last Recorded:</span>
                            <span>{metric.lastRecorded.toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => {
                          setSelectedMetric(metric);
                          setNewValue(metric.currentValue?.toString() || '');
                        }}
                      >
                        Update Value
                      </Button>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <metric.icon className={`w-12 h-12 mx-auto mb-4 ${metric.color}`} />
                      <p className="text-gray-500 mb-4">No data recorded yet</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedMetric(metric);
                          setIsAddingMetric(true);
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Reading
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add/Update Metric Modal */}
      {isAddingMetric && selectedMetric && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>
                {selectedMetric.currentValue !== undefined ? 'Update' : 'Add'} {selectedMetric.name}
              </CardTitle>
              <CardDescription>
                Enter your {selectedMetric.name.toLowerCase()} measurement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="metric-value">
                  Value ({selectedMetric.unit})
                </Label>
                <Input
                  id="metric-value"
                  type="number"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder={`Enter ${selectedMetric.name.toLowerCase()}`}
                  step="0.1"
                />
              </div>
              
              <div>
                <Label htmlFor="metric-date">Date</Label>
                <Input
                  id="metric-date"
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                />
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-sm">
                  <div className="font-medium mb-1">Reference Ranges:</div>
                  <div>Normal: {selectedMetric.normalRange!.min} - {selectedMetric.normalRange!.max} {selectedMetric.unit}</div>
                  <div>Optimal: {selectedMetric.optimalRange!.min} - {selectedMetric.optimalRange!.max} {selectedMetric.unit}</div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button variant="outline" onClick={() => {
                  setIsAddingMetric(false);
                  setSelectedMetric(null);
                  setNewValue('');
                }}>
                  Cancel
                </Button>
                <Button onClick={handleAddMetric} disabled={!newValue}>
                  <Save className="w-4 h-4 mr-2" />
                  {selectedMetric.currentValue !== undefined ? 'Update' : 'Add'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}