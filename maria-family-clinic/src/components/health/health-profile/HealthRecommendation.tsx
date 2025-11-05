'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Lightbulb, Target, Heart, Activity, Utensils, Brain, Shield, Clock, ChevronRight, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: 'fitness' | 'nutrition' | 'wellness' | 'medical' | 'prevention';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedImpact: 'low' | 'medium' | 'high';
  timeframe: string;
  actionableSteps: string[];
  resources: Array<{
    type: 'article' | 'video' | 'tool' | 'appointment';
    title: string;
    url: string;
    description: string;
  }>;
  healthMetrics?: {
    metric: string;
    current: number;
    target: number;
    unit: string;
    trend: 'up' | 'down' | 'stable';
  }[];
  completed: boolean;
  dateGenerated: string;
  tags: string[];
}

interface HealthRecommendationProps {
  userId: string;
  healthData?: any;
  onRecommendationAction?: (recommendationId: string, action: string) => void;
  className?: string;
}

const mockRecommendations: Recommendation[] = [
  {
    id: '1',
    title: 'Increase Daily Walking to 8,000 Steps',
    description: 'Based on your current activity level of 5,200 steps/day, gradually increase to 8,000 steps to improve cardiovascular health and weight management.',
    category: 'fitness',
    priority: 'high',
    estimatedImpact: 'high',
    timeframe: '2-3 months',
    actionableSteps: [
      'Start with 20-minute walks after meals',
      'Use a step counter to track progress',
      'Gradually increase distance by 500 steps weekly',
      'Find walking partners for motivation'
    ],
    resources: [
      {
        type: 'article',
        title: 'Walking for Health: Complete Guide',
        url: '/resources/walking-guide',
        description: 'Comprehensive guide to safe and effective walking'
      },
      {
        type: 'tool',
        title: 'Step Counter Setup',
        url: '/tools/step-tracker',
        description: 'Configure your activity tracker'
      }
    ],
    healthMetrics: [
      {
        metric: 'Daily Steps',
        current: 5200,
        target: 8000,
        unit: 'steps',
        trend: 'up'
      }
    ],
    completed: false,
    dateGenerated: '2024-01-15',
    tags: ['cardiovascular', 'weight-loss', 'fitness']
  },
  {
    id: '2',
    title: 'Optimize Sleep Schedule for Better Recovery',
    description: 'Your sleep data shows inconsistent patterns affecting recovery and energy levels. Aim for consistent 7-8 hours of sleep.',
    category: 'wellness',
    priority: 'medium',
    estimatedImpact: 'medium',
    timeframe: '1-2 months',
    actionableSteps: [
      'Set consistent bedtime and wake time',
      'Create a relaxing bedtime routine',
      'Limit screen time 1 hour before bed',
      'Keep bedroom cool and dark'
    ],
    resources: [
      {
        type: 'article',
        title: 'Sleep Hygiene Best Practices',
        url: '/resources/sleep-hygiene',
        description: 'Evidence-based sleep improvement strategies'
      }
    ],
    healthMetrics: [
      {
        metric: 'Sleep Duration',
        current: 6.2,
        target: 7.5,
        unit: 'hours',
        trend: 'stable'
      }
    ],
    completed: false,
    dateGenerated: '2024-01-15',
    tags: ['sleep', 'recovery', 'energy']
  },
  {
    id: '3',
    title: 'Schedule Annual Health Screening',
    description: 'Based on your age and risk factors, it\'s time for comprehensive health screening including blood pressure, cholesterol, and diabetes check.',
    category: 'medical',
    priority: 'urgent',
    estimatedImpact: 'high',
    timeframe: 'Next 2 weeks',
    actionableSteps: [
      'Book appointment with your doctor',
      'Prepare list of current medications',
      'Fasting may be required for blood tests',
      'Bring previous health records'
    ],
    resources: [
      {
        type: 'appointment',
        title: 'Book Health Screening',
        url: '/appointments/book?type=health-screening',
        description: 'Schedule comprehensive health check'
      }
    ],
    completed: false,
    dateGenerated: '2024-01-15',
    tags: ['screening', 'prevention', 'checkup']
  },
  {
    id: '4',
    title: 'Reduce Sodium Intake for Blood Pressure',
    description: 'Your recent blood pressure readings are elevated. Reducing sodium intake can help manage blood pressure naturally.',
    category: 'nutrition',
    priority: 'high',
    estimatedImpact: 'high',
    timeframe: '1-2 months',
    actionableSteps: [
      'Read food labels for sodium content',
      'Cook meals at home more often',
      'Use herbs and spices instead of salt',
      'Limit processed and restaurant foods'
    ],
    resources: [
      {
        type: 'article',
        title: 'Low-Sodium Cooking Guide',
        url: '/resources/low-sodium-cooking',
        description: 'Flavorful cooking without excess salt'
      }
    ],
    healthMetrics: [
      {
        metric: 'Systolic BP',
        current: 138,
        target: 130,
        unit: 'mmHg',
        trend: 'up'
      }
    ],
    completed: false,
    dateGenerated: '2024-01-15',
    tags: ['blood-pressure', 'nutrition', 'heart-health']
  }
];

const categoryIcons = {
  fitness: Activity,
  nutrition: Utensils,
  wellness: Heart,
  medical: Shield,
  prevention: Clock
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
};

const impactColors = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-purple-100 text-purple-800',
  high: 'bg-green-100 text-green-800'
};

export default function HealthRecommendation({
  userId,
  healthData,
  onRecommendationAction,
  className
}: HealthRecommendationProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>(mockRecommendations);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [expandedRecommendation, setExpandedRecommendation] = useState<string | null>(null);

  const handleRecommendationAction = (recommendationId: string, action: string) => {
    setRecommendations(prev => prev.map(rec => 
      rec.id === recommendationId 
        ? { ...rec, completed: action === 'complete' }
        : rec
    ));
    
    onRecommendationAction?.(recommendationId, action);
    toast.success(
      action === 'complete' 
        ? 'Recommendation marked as complete!' 
        : 'Recommendation dismissed'
    );
  };

  const filteredRecommendations = recommendations.filter(rec => {
    const categoryMatch = selectedCategory === 'all' || rec.category === selectedCategory;
    const priorityMatch = selectedPriority === 'all' || rec.priority === selectedPriority;
    return categoryMatch && priorityMatch;
  });

  const categories = ['all', 'fitness', 'nutrition', 'wellness', 'medical', 'prevention'];
  const priorities = ['all', 'urgent', 'high', 'medium', 'low'];

  const getRecommendationScore = () => {
    const total = recommendations.length;
    const completed = recommendations.filter(r => r.completed).length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-yellow-500" />
            Health Recommendations
          </h2>
          <p className="text-gray-600 mt-1">
            AI-powered suggestions based on your health profile
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-gray-600">Completion Score</div>
            <div className="text-2xl font-bold text-green-600">{getRecommendationScore()}%</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Category:</label>
          <div className="flex gap-2">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category === 'all' ? 'All' : category}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Priority:</label>
          <div className="flex gap-2">
            {priorities.map(priority => (
              <Button
                key={priority}
                variant={selectedPriority === priority ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPriority(priority)}
                className="capitalize"
              >
                {priority}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recommendation Progress</CardTitle>
          <CardDescription>
            Track your progress on personalized health recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-gray-600">
                {recommendations.filter(r => r.completed).length} of {recommendations.length} completed
              </span>
            </div>
            <Progress value={getRecommendationScore()} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Recommendations List */}
      <div className="space-y-4">
        {filteredRecommendations.map((recommendation) => {
          const IconComponent = categoryIcons[recommendation.category];
          const isExpanded = expandedRecommendation === recommendation.id;
          
          return (
            <Card key={recommendation.id} className={`transition-all duration-200 ${recommendation.completed ? 'opacity-75' : ''}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-blue-50">
                      <IconComponent className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {recommendation.title}
                        {recommendation.completed && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Completed
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {recommendation.description}
                      </CardDescription>
                    </div>
                  </div>
                </div>
                
                {/* Badges */}
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge className={priorityColors[recommendation.priority]}>
                    {recommendation.priority}
                  </Badge>
                  <Badge className={impactColors[recommendation.estimatedImpact]}>
                    {recommendation.estimatedImpact} impact
                  </Badge>
                  <Badge variant="outline">
                    {recommendation.timeframe}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {recommendation.category}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Health Metrics */}
                {recommendation.healthMetrics && recommendation.healthMetrics.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Related Health Metrics</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {recommendation.healthMetrics.map((metric, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium text-sm">{metric.metric}</div>
                            <div className="text-xs text-gray-600">
                              Current: {metric.current} {metric.unit}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">Target: {metric.target} {metric.unit}</div>
                            <div className={`text-xs ${
                              metric.trend === 'up' ? 'text-red-600' : 
                              metric.trend === 'down' ? 'text-green-600' : 'text-gray-600'
                            }`}>
                              {metric.trend === 'up' ? '↗️' : metric.trend === 'down' ? '↘️' : '➡️'} 
                              {' '}{metric.trend}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Steps Preview */}
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Key Action Steps</h4>
                  <ul className="space-y-1">
                    {recommendation.actionableSteps.slice(0, 3).map((step, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-blue-600 font-medium mt-0.5">{index + 1}.</span>
                        {step}
                      </li>
                    ))}
                    {recommendation.actionableSteps.length > 3 && (
                      <li className="text-sm text-blue-600 cursor-pointer" 
                          onClick={() => setExpandedRecommendation(isExpanded ? null : recommendation.id)}>
                        {isExpanded ? 'Show less' : `+${recommendation.actionableSteps.length - 3} more steps`}
                      </li>
                    )}
                  </ul>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="space-y-4 border-t pt-4">
                    {/* All Action Steps */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">All Action Steps</h4>
                      <ul className="space-y-2">
                        {recommendation.actionableSteps.map((step, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-blue-600 font-medium mt-0.5">{index + 1}.</span>
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Resources */}
                    {recommendation.resources && recommendation.resources.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Helpful Resources</h4>
                        <div className="grid gap-2">
                          {recommendation.resources.map((resource, index) => (
                            <a
                              key={index}
                              href={resource.url}
                              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <div>
                                <div className="font-medium text-sm">{resource.title}</div>
                                <div className="text-xs text-gray-600">{resource.description}</div>
                              </div>
                              <ExternalLink className="h-4 w-4 text-gray-400" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {recommendation.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExpandedRecommendation(isExpanded ? null : recommendation.id)}
                  >
                    {isExpanded ? 'Show Less' : 'View Details'}
                    <ChevronRight className={`h-4 w-4 ml-1 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </Button>
                  
                  <div className="flex gap-2">
                    {!recommendation.completed && (
                      <Button
                        size="sm"
                        onClick={() => handleRecommendationAction(recommendation.id, 'complete')}
                      >
                        Mark Complete
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRecommendationAction(recommendation.id, 'dismiss')}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredRecommendations.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Recommendations Found</h3>
            <p className="text-gray-600">
              No recommendations match your current filters. Try adjusting your category or priority selection.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}