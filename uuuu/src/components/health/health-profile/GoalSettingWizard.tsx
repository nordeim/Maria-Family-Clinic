'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ChevronLeft, 
  ChevronRight, 
  Target, 
  Calendar, 
  TrendingUp, 
  CheckCircle2,
  AlertCircle,
  Award,
  Heart,
  Activity,
  Zap,
  Clock,
  Users,
  BookOpen,
  Lightbulb
} from 'lucide-react';
import { HealthProfile, HealthGoal } from './HealthProfileDashboard';

interface GoalSettingWizardProps {
  healthProfile: HealthProfile;
  onComplete: (goal: HealthGoal) => void;
  onCancel: () => void;
  initialGoal?: HealthGoal;
  className?: string;
}

interface GoalCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  examples: string[];
  targetTypes: string[];
}

const GOAL_CATEGORIES: GoalCategory[] = [
  {
    id: 'weight-management',
    title: 'Weight Management',
    description: 'Achieve and maintain a healthy weight',
    icon: TrendingUp,
    examples: ['Lose 10kg in 6 months', 'Maintain current weight', 'Gain 5kg muscle mass'],
    targetTypes: ['Weight Loss', 'Weight Maintenance', 'Muscle Gain']
  },
  {
    id: 'blood-pressure',
    title: 'Blood Pressure Control',
    description: 'Manage and improve blood pressure levels',
    icon: Heart,
    examples: ['Reduce BP to 120/80', 'Lower systolic pressure by 20mmHg', 'Achieve target BP'],
    targetTypes: ['Systolic Reduction', 'Diastolic Improvement', 'Overall Control']
  },
  {
    id: 'diabetes-management',
    title: 'Diabetes Management',
    description: 'Control blood sugar levels and manage diabetes',
    icon: Activity,
    examples: ['HbA1c below 7%', 'Reduce medication dependency', 'Improve glucose control'],
    targetTypes: ['HbA1c Target', 'Glucose Control', 'Medication Reduction']
  },
  {
    id: 'physical-activity',
    title: 'Physical Activity',
    description: 'Increase exercise and improve fitness levels',
    icon: Zap,
    examples: ['Walk 10,000 steps daily', 'Exercise 150 minutes/week', 'Strength train 3x/week'],
    targetTypes: ['Daily Steps', 'Weekly Exercise', 'Fitness Goals']
  },
  {
    id: 'nutrition-improvement',
    title: 'Nutrition Improvement',
    description: 'Improve dietary habits and nutrition',
    icon: BookOpen,
    examples: ['Eat 5 servings of fruits/vegetables daily', 'Reduce sugar intake by 50%', 'Follow Mediterranean diet'],
    targetTypes: ['Daily Servings', 'Nutrient Intake', 'Diet Quality']
  },
  {
    id: 'smoking-cessation',
    title: 'Smoking Cessation',
    description: 'Quit smoking and reduce tobacco use',
    icon: AlertCircle,
    examples: ['Quit smoking completely', 'Reduce smoking by 50%', 'Stay smoke-free for 1 year'],
    targetTypes: ['Complete Cessation', 'Reduction', 'Maintenance']
  },
  {
    id: 'stress-management',
    title: 'Stress Management',
    description: 'Reduce stress and improve mental wellbeing',
    icon: Heart,
    examples: ['Practice meditation daily', 'Reduce stress score by 50%', 'Improve sleep quality'],
    targetTypes: ['Stress Reduction', 'Meditation Practice', 'Sleep Quality']
  },
  {
    id: 'preventive-screening',
    title: 'Preventive Screenings',
    description: 'Stay up-to-date with recommended health screenings',
    icon: Award,
    examples: ['Complete annual checkup', 'Get recommended screenings', 'Update vaccinations'],
    targetTypes: ['Annual Checkup', 'Specific Screenings', 'Vaccinations']
  }
];

const SMART_CRITERIA = [
  {
    id: 'specific',
    title: 'Specific',
    description: 'Clearly define what you want to accomplish',
    question: 'What exactly do you want to achieve?'
  },
  {
    id: 'measurable',
    title: 'Measurable',
    description: 'Set clear, quantifiable criteria for success',
    question: 'How will you measure your progress and success?'
  },
  {
    id: 'achievable',
    title: 'Achievable',
    description: 'Ensure the goal is realistic and attainable',
    question: 'Is this goal realistic given your current situation?'
  },
  {
    id: 'relevant',
    title: 'Relevant',
    description: 'Align with your overall health priorities',
    question: 'Why is this goal important to your health?'
  },
  {
    id: 'time-bound',
    title: 'Time-bound',
    description: 'Set a specific timeframe for completion',
    question: 'When do you want to achieve this goal?'
  }
];

export function GoalSettingWizard({
  healthProfile,
  onComplete,
  onCancel,
  initialGoal,
  className = ''
}: GoalSettingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [goalData, setGoalData] = useState({
    title: '',
    description: '',
    category: '',
    targetType: '',
    targetValue: '',
    targetDate: '',
    currentValue: '',
    milestones: [] as { title: string; targetDate: string; completed: boolean }[],
    strategies: [] as string[],
    supportResources: [] as string[]
  });
  const [milestones, setMilestones] = useState<{ title: string; targetDate: string }[]>([]);
  const [strategies, setStrategies] = useState<string[]>([]);
  const [supportResources, setSupportResources] = useState<string[]>([]);

  const steps = [
    'Select Goal Category',
    'Define Your Goal',
    'Set SMART Criteria',
    'Plan Milestones',
    'Identify Strategies',
    'Review & Confirm'
  ];

  const selectedCategoryData = GOAL_CATEGORIES.find(cat => cat.id === selectedCategory);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    const goal: HealthGoal = {
      id: initialGoal?.id || `goal-${Date.now()}`,
      profileId: healthProfile.id,
      goalType: selectedCategory as any,
      title: goalData.title,
      description: goalData.description,
      targetValue: goalData.targetValue ? parseFloat(goalData.targetValue) : undefined,
      currentValue: goalData.currentValue ? parseFloat(goalData.currentValue) : undefined,
      targetDate: new Date(goalData.targetDate),
      status: 'ACTIVE',
      progress: 0,
      milestones: milestones.map((milestone, index) => ({
        id: `milestone-${index}`,
        title: milestone.title,
        targetDate: new Date(milestone.targetDate),
        completed: false
      })),
      strategies,
      supportResources,
      createdAt: initialGoal?.createdAt || new Date(),
      updatedAt: new Date()
    };

    onComplete(goal);
  };

  const addMilestone = () => {
    setMilestones([...milestones, { title: '', targetDate: '' }]);
  };

  const updateMilestone = (index: number, field: 'title' | 'targetDate', value: string) => {
    const updated = [...milestones];
    updated[index][field] = value;
    setMilestones(updated);
  };

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const addStrategy = () => {
    setStrategies([...strategies, '']);
  };

  const updateStrategy = (index: number, value: string) => {
    const updated = [...strategies];
    updated[index] = value;
    setStrategies(updated);
  };

  const removeStrategy = (index: number) => {
    setStrategies(strategies.filter((_, i) => i !== index));
  };

  const addSupportResource = () => {
    setSupportResources([...supportResources, '']);
  };

  const updateSupportResource = (index: number, value: string) => {
    const updated = [...supportResources];
    updated[index] = value;
    setSupportResources(updated);
  };

  const removeSupportResource = (index: number) => {
    setSupportResources(supportResources.filter((_, i) => i !== index));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Select Goal Category</h2>
              <p className="text-gray-600">Choose the area of health you want to focus on</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {GOAL_CATEGORIES.map((category) => (
                <Card
                  key={category.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedCategory === category.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <category.icon className="w-5 h-5 mr-3" />
                      {category.title}
                    </CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700">Examples:</div>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {category.examples.slice(0, 2).map((example, index) => (
                          <li key={index} className="flex items-center">
                            <div className="w-2 h-2 bg-gray-400 rounded-full mr-2" />
                            {example}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Define Your Goal</h2>
              <p className="text-gray-600">Describe your health goal in detail</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="goal-title">Goal Title *</Label>
                <Input
                  id="goal-title"
                  value={goalData.title}
                  onChange={(e) => setGoalData({ ...goalData, title: e.target.value })}
                  placeholder="e.g., Lose 10kg in 6 months"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="goal-description">Description *</Label>
                <Textarea
                  id="goal-description"
                  value={goalData.description}
                  onChange={(e) => setGoalData({ ...goalData, description: e.target.value })}
                  placeholder="Describe your goal in detail and why it's important to you"
                  rows={4}
                  className="mt-1"
                />
              </div>

              {selectedCategoryData && (
                <div>
                  <Label htmlFor="target-type">Target Type *</Label>
                  <Select value={goalData.targetType} onValueChange={(value) => setGoalData({ ...goalData, targetType: value })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select target type" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedCategoryData.targetTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="target-value">Target Value</Label>
                  <Input
                    id="target-value"
                    value={goalData.targetValue}
                    onChange={(e) => setGoalData({ ...goalData, targetValue: e.target.value })}
                    placeholder="e.g., 10"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="current-value">Current Value</Label>
                  <Input
                    id="current-value"
                    value={goalData.currentValue}
                    onChange={(e) => setGoalData({ ...goalData, currentValue: e.target.value })}
                    placeholder="e.g., 80"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="target-date">Target Date *</Label>
                <Input
                  id="target-date"
                  type="date"
                  value={goalData.targetDate}
                  onChange={(e) => setGoalData({ ...goalData, targetDate: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Set SMART Criteria</h2>
              <p className="text-gray-600">Make your goal SMART - Specific, Measurable, Achievable, Relevant, and Time-bound</p>
            </div>
            
            <div className="space-y-6">
              {SMART_CRITERIA.map((criterion, index) => (
                <Card key={criterion.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                        {index + 1}
                      </span>
                      {criterion.title}
                    </CardTitle>
                    <CardDescription>{criterion.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">{criterion.question}</p>
                    <Textarea
                      placeholder="Describe how this applies to your goal..."
                      rows={3}
                      className="w-full"
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Plan Milestones</h2>
              <p className="text-gray-600">Break your goal into smaller, achievable milestones</p>
            </div>
            
            <div className="space-y-4">
              <Button onClick={addMilestone} variant="outline" className="w-full">
                <Target className="w-4 h-4 mr-2" />
                Add Milestone
              </Button>
              
              {milestones.map((milestone, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium">Milestone {index + 1}</h4>
                      <Button
                        onClick={() => removeMilestone(index)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                      >
                        Remove
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Milestone Title</Label>
                        <Input
                          value={milestone.title}
                          onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                          placeholder="e.g., Lose first 2kg"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Target Date</Label>
                        <Input
                          type="date"
                          value={milestone.targetDate}
                          onChange={(e) => updateMilestone(index, 'targetDate', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {milestones.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No milestones added yet</p>
                  <p className="text-sm">Click "Add Milestone" to get started</p>
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Strategies & Resources</h2>
              <p className="text-gray-600">Plan how you'll achieve your goal and what support you need</p>
            </div>
            
            <div className="space-y-8">
              {/* Strategies Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Lightbulb className="w-5 h-5 mr-2" />
                  Strategies
                </h3>
                <p className="text-sm text-gray-600 mb-4">How will you achieve this goal?</p>
                
                <Button onClick={addStrategy} variant="outline" className="w-full mb-4">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Strategy
                </Button>
                
                {strategies.map((strategy, index) => (
                  <Card key={index} className="mb-3">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium">Strategy {index + 1}</h4>
                        <Button
                          onClick={() => removeStrategy(index)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                        >
                          Remove
                        </Button>
                      </div>
                      <Textarea
                        value={strategy}
                        onChange={(e) => updateStrategy(index, e.target.value)}
                        placeholder="Describe your strategy..."
                        rows={3}
                      />
                    </CardContent>
                  </Card>
                ))}
                
                {strategies.length === 0 && (
                  <div className="text-center py-6 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                    <Lightbulb className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p>No strategies planned yet</p>
                  </div>
                )}
              </div>

              {/* Support Resources Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Support Resources
                </h3>
                <p className="text-sm text-gray-600 mb-4">What support do you need to succeed?</p>
                
                <Button onClick={addSupportResource} variant="outline" className="w-full mb-4">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Support Resource
                </Button>
                
                {supportResources.map((resource, index) => (
                  <Card key={index} className="mb-3">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium">Resource {index + 1}</h4>
                        <Button
                          onClick={() => removeSupportResource(index)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                        >
                          Remove
                        </Button>
                      </div>
                      <Textarea
                        value={resource}
                        onChange={(e) => updateSupportResource(index, e.target.value)}
                        placeholder="Describe the support resource..."
                        rows={3}
                      />
                    </CardContent>
                  </Card>
                ))}
                
                {supportResources.length === 0 && (
                  <div className="text-center py-6 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                    <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p>No support resources identified yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Review Your Goal</h2>
              <p className="text-gray-600">Review all details before confirming your health goal</p>
            </div>
            
            <div className="space-y-6">
              {/* Goal Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    Goal Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="font-medium">Category</Label>
                    <p className="text-gray-600">{selectedCategoryData?.title}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Title</Label>
                    <p className="text-gray-600">{goalData.title}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Description</Label>
                    <p className="text-gray-600">{goalData.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-medium">Target</Label>
                      <p className="text-gray-600">{goalData.targetValue} {goalData.targetType}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Target Date</Label>
                      <p className="text-gray-600">{goalData.targetDate}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Milestones */}
              {milestones.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Award className="w-5 h-5 mr-2" />
                      Milestones ({milestones.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {milestones.map((milestone, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm">{milestone.title}</span>
                          <span className="text-xs text-gray-500">{milestone.targetDate}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Progress Tracking */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Progress Tracking
                  </CardTitle>
                  <CardDescription>How will you track your progress?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-gray-600">
                    <p>• You can update your progress anytime in your health dashboard</p>
                    <p>• Milestones will be marked as completed when achieved</p>
                    <p>• You'll receive reminders and motivation throughout your journey</p>
                  </div>
                </CardContent>
              </Card>

              {/* Support & Resources */}
              {supportResources.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      Support System
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {supportResources.map((resource, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          • {resource}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return selectedCategory !== '';
      case 1:
        return goalData.title && goalData.description && goalData.targetDate;
      default:
        return true;
    }
  };

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Set Your Health Goal</h1>
            <p className="text-green-100">Create a personalized health objective</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-green-100">Step</div>
            <div className="text-2xl font-bold">{currentStep + 1} of {steps.length}</div>
          </div>
        </div>
        <div className="mt-4">
          <Progress value={((currentStep + 1) / steps.length) * 100} className="h-2" />
        </div>
      </div>

      {/* Step Navigation */}
      <div className="flex items-center space-x-4 mb-8 overflow-x-auto">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
              index === currentStep
                ? 'bg-blue-100 text-blue-700'
                : index < currentStep
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {index < currentStep ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <div className="w-4 h-4 rounded-full bg-current flex items-center justify-center">
                <span className="text-xs font-medium">{index + 1}</span>
              </div>
            )}
            <span className="text-sm font-medium">{step}</span>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="min-h-96">
        {renderStepContent()}
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        
        <div className="flex space-x-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          
          {currentStep < steps.length - 1 ? (
            <Button onClick={handleNext} disabled={!canProceed()}>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleComplete} disabled={!canProceed()} className="bg-green-600 hover:bg-green-700">
              <Target className="w-4 h-4 mr-2" />
              Set Goal
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}