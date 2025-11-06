'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, 
  Target, 
  Activity, 
  TrendingUp, 
  Calendar, 
  FileText, 
  Users,
  Award,
  AlertCircle,
  CheckCircle2,
  PlusCircle,
  Eye,
  BarChart3
} from 'lucide-react';
import { HealthAssessmentForm } from './HealthAssessmentForm';
import { GoalSettingWizard } from './GoalSettingWizard';
import { HealthProgressChart } from './HealthProgressChart';
import { HealthRecommendation } from './HealthRecommendation';
import { HealthMetricsTracker } from './HealthMetricsTracker';
import { HealthGoalCard } from './HealthGoalCard';
import { HealthAlert } from './HealthAlert';
import { Language } from '@/components/healthier-sg/program-info';

export interface HealthProfile {
  id: string;
  userId: string;
  personalInfo: {
    name: string;
    dateOfBirth: Date;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    height: number;
    weight: number;
    bloodType?: string;
  };
  medicalHistory: {
    chronicConditions: string[];
    familyHistory: string[];
    allergies: string[];
    medications: string[];
    surgeries: string[];
    vaccinationHistory: string[];
  };
  currentHealth: {
    vitals: {
      bloodPressure?: { systolic: number; diastolic: number; date: Date };
      heartRate?: { value: number; date: Date };
      temperature?: { value: number; date: Date };
      bloodSugar?: { value: number; date: Date };
      cholesterol?: { total?: number; hdl?: number; ldl?: number; date: Date };
    };
    measurements: {
      bmi: { value: number; date: Date };
      bodyFat?: { value: number; date: Date };
      muscleMass?: { value: number; date: Date };
    };
    lifestyle: {
      smokingStatus: 'NEVER' | 'FORMER' | 'CURRENT';
      exerciseFrequency: 'NEVER' | 'RARELY' | 'WEEKLY_1_2' | 'WEEKLY_3_4' | 'DAILY';
      alcoholConsumption: 'NONE' | 'OCCASIONAL' | 'REGULAR';
      sleepHours: number;
      stressLevel: 1 | 2 | 3 | 4 | 5;
    };
  };
  riskAssessment: {
    cardiovascularRisk: 'LOW' | 'MODERATE' | 'HIGH';
    diabetesRisk: 'LOW' | 'MODERATE' | 'HIGH';
    cancerRisk: 'LOW' | 'MODERATE' | 'HIGH';
    overallRisk: 'LOW' | 'MODERATE' | 'HIGH';
  };
  healthGoals: HealthGoal[];
  lastUpdated: Date;
  createdAt: Date;
}

export interface HealthGoal {
  id: string;
  profileId: string;
  goalType: 'WEIGHT_MANAGEMENT' | 'BLOOD_PRESSURE_CONTROL' | 'DIABETES_MANAGEMENT' | 'PHYSICAL_ACTIVITY' | 'NUTRITION_IMPROVEMENT' | 'SMOKING_CESSATION' | 'STRESS_MANAGEMENT' | 'PREVENTIVE_SCREENING';
  title: string;
  description: string;
  targetValue?: number;
  currentValue?: number;
  targetDate: Date;
  status: 'ACTIVE' | 'ON_TRACK' | 'BEHIND_SCHEDULE' | 'ACHIEVED' | 'PAUSED';
  progress: number;
  milestones: {
    id: string;
    title: string;
    targetDate: Date;
    completed: boolean;
    completedDate?: Date;
  }[];
  strategies: string[];
  supportResources: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface HealthProfileDashboardProps {
  healthProfile: HealthProfile;
  language?: Language;
  onProfileUpdate: (profile: HealthProfile) => void;
  onGoalUpdate: (goal: HealthGoal) => void;
  className?: string;
}

export function HealthProfileDashboard({
  healthProfile,
  language = Language.English,
  onProfileUpdate,
  onGoalUpdate,
  className = ''
}: HealthProfileDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAssessment, setShowAssessment] = useState(false);
  const [showGoalWizard, setShowGoalWizard] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<HealthGoal | null>(null);

  // Calculate health metrics
  const calculateBMI = (weight: number, height: number) => {
    const heightInM = height / 100;
    return +(weight / (heightInM * heightInM)).toFixed(1);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Underweight', color: 'bg-blue-500' };
    if (bmi < 25) return { category: 'Normal', color: 'bg-green-500' };
    if (bmi < 30) return { category: 'Overweight', color: 'bg-yellow-500' };
    return { category: 'Obese', color: 'bg-red-500' };
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'bg-green-500';
      case 'MODERATE': return 'bg-yellow-500';
      case 'HIGH': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const activeGoals = healthProfile.healthGoals.filter(g => g.status === 'ACTIVE');
  const achievedGoals = healthProfile.healthGoals.filter(g => g.status === 'ACHIEVED');
  const onTrackGoals = healthProfile.healthGoals.filter(g => g.status === 'ON_TRACK');

  const bmi = healthProfile.personalInfo.weight && healthProfile.personalInfo.height 
    ? calculateBMI(healthProfile.personalInfo.weight, healthProfile.personalInfo.height)
    : null;
  
  const bmiCategory = bmi ? getBMICategory(bmi) : null;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-xl p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Health Profile Dashboard</h1>
            <p className="text-blue-100">Welcome back, {healthProfile.personalInfo.name}</p>
            <div className="flex items-center space-x-4 mt-4">
              <Badge variant="secondary" className="bg-white/20 text-white">
                <Heart className="w-4 h-4 mr-1" />
                BMI: {bmiCategory?.category || 'N/A'}
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white">
                <Target className="w-4 h-4 mr-1" />
                {activeGoals.length} Active Goals
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white">
                <Award className="w-4 h-4 mr-1" />
                {achievedGoals.length} Achieved
              </Badge>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="secondary" 
              onClick={() => setShowAssessment(true)}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              New Assessment
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => setShowGoalWizard(true)}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <Target className="w-4 h-4 mr-2" />
              Set Goal
            </Button>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {healthProfile.riskAssessment.overallRisk === 'HIGH' && (
        <HealthAlert
          type="high-risk"
          title="High Health Risk Detected"
          message="Your overall health risk assessment indicates high risk. Please consult with your healthcare provider."
          onDismiss={() => {}}
        />
      )}

      {/* Main Dashboard Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">
            <Eye className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="assessments">
            <FileText className="w-4 h-4 mr-2" />
            Assessments
          </TabsTrigger>
          <TabsTrigger value="goals">
            <Target className="w-4 h-4 mr-2" />
            Goals
          </TabsTrigger>
          <TabsTrigger value="metrics">
            <BarChart3 className="w-4 h-4 mr-2" />
            Metrics
          </TabsTrigger>
          <TabsTrigger value="progress">
            <TrendingUp className="w-4 h-4 mr-2" />
            Progress
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            <Users className="w-4 h-4 mr-2" />
            Recommendations
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Health Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-red-500" />
                  Health Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">BMI</span>
                    <span className="font-medium">
                      {bmi} ({bmiCategory?.category})
                    </span>
                  </div>
                  {bmi && (
                    <Progress 
                      value={Math.min((bmi / 40) * 100, 100)} 
                      className="h-2"
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Blood Pressure</span>
                    <span className="font-medium">
                      {healthProfile.currentHealth.vitals.bloodPressure 
                        ? `${healthProfile.currentHealth.vitals.bloodPressure.systolic}/${healthProfile.currentHealth.vitals.bloodPressure.diastolic}`
                        : 'Not recorded'
                      }
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Overall Risk</span>
                    <Badge className={getRiskColor(healthProfile.riskAssessment.overallRisk)}>
                      {healthProfile.riskAssessment.overallRisk}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Goals Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2 text-blue-500" />
                  Active Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeGoals.slice(0, 3).map((goal) => (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 truncate">{goal.title}</span>
                      <span className="text-sm font-medium">{goal.progress}%</span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                  </div>
                ))}
                {activeGoals.length === 0 && (
                  <p className="text-sm text-gray-500">No active goals. Set your first health goal!</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-green-500" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Health Assessment Completed</p>
                    <p className="text-xs text-gray-500">2 days ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Goal Milestone Achieved</p>
                    <p className="text-xs text-gray-500">1 week ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Blood Pressure Check Due</p>
                    <p className="text-xs text-gray-500">3 days ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Health Metrics Quick View */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Health Metrics</CardTitle>
              <CardDescription>Your current vital signs and measurements</CardDescription>
            </CardHeader>
            <CardContent>
              <HealthMetricsTracker 
                healthProfile={healthProfile}
                onUpdate={(updatedProfile) => onProfileUpdate(updatedProfile)}
                compact={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assessments Tab */}
        <TabsContent value="assessments">
          <HealthAssessmentForm
            healthProfile={healthProfile}
            onComplete={(assessment) => {
              // Handle assessment completion
              setShowAssessment(false);
            }}
            onCancel={() => setShowAssessment(false)}
          />
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Health Goals</h3>
              <p className="text-sm text-gray-600">Manage your health objectives and track progress</p>
            </div>
            <Button onClick={() => setShowGoalWizard(true)}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Add New Goal
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {healthProfile.healthGoals.map((goal) => (
              <HealthGoalCard
                key={goal.id}
                goal={goal}
                onUpdate={onGoalUpdate}
                onClick={() => setSelectedGoal(goal)}
              />
            ))}
          </div>

          {healthProfile.healthGoals.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Health Goals Set</h3>
                <p className="text-gray-500 mb-4">Start your health journey by setting your first goal</p>
                <Button onClick={() => setShowGoalWizard(true)}>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Set Your First Goal
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics">
          <Card>
            <CardHeader>
              <CardTitle>Health Metrics Tracker</CardTitle>
              <CardDescription>Record and track your vital signs and measurements</CardDescription>
            </CardHeader>
            <CardContent>
              <HealthMetricsTracker
                healthProfile={healthProfile}
                onUpdate={onProfileUpdate}
                compact={false}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress">
          <Card>
            <CardHeader>
              <CardTitle>Health Progress Tracking</CardTitle>
              <CardDescription>Visualize your health journey and achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <HealthProgressChart
                healthProfile={healthProfile}
                goals={healthProfile.healthGoals}
                timeRange="6months"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations">
          <HealthRecommendation
            healthProfile={healthProfile}
            goals={healthProfile.healthGoals}
            userId={healthProfile.userId}
          />
        </TabsContent>
      </Tabs>

      {/* Goal Setting Wizard Modal */}
      {showGoalWizard && (
        <GoalSettingWizard
          healthProfile={healthProfile}
          onComplete={(goal) => {
            onGoalUpdate(goal);
            setShowGoalWizard(false);
          }}
          onCancel={() => setShowGoalWizard(false)}
        />
      )}
    </div>
  );
}