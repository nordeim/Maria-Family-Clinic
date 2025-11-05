"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  CheckCircleIcon,
  ClockIcon,
  CalendarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  PlayIcon,
  PauseIcon,
  ChevronRightIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface PreparationStep {
  id: string;
  title: string;
  description: string;
  category: 'timing' | 'diet' | 'medication' | 'lifestyle' | 'documents' | 'logistics';
  priority: 'critical' | 'important' | 'recommended';
  estimatedTime: number; // in hours before procedure
  duration: number; // time needed to complete this step
  completed: boolean;
  required: boolean;
  documentation?: {
    type: 'form' | 'instruction' | 'checklist';
    content: string;
    downloadable?: boolean;
  };
  dependencies?: string[]; // step IDs that must be completed first
  warnings?: string[];
  tips?: string[];
  reminderDays?: number[]; // Days before procedure to send reminder
}

interface InteractivePreparationGuideProps {
  serviceId: string;
  procedureDate: Date;
  locale: string;
  onStepComplete?: (stepId: string, completed: boolean) => void;
  onProgressUpdate?: (progress: PreparationProgress) => void;
}

interface PreparationProgress {
  totalSteps: number;
  completedSteps: number;
  criticalCompleted: number;
  totalCritical: number;
  currentPhase: string;
  timeToProcedure: number; // hours
  overallProgress: number;
  completedStepsList: string[];
  upcomingDeadlines: PreparationStep[];
}

export function InteractivePreparationGuide({
  serviceId,
  procedureDate,
  locale = 'en',
  onStepComplete,
  onProgressUpdate
}: InteractivePreparationGuideProps) {
  const [steps, setSteps] = useState<PreparationStep[]>([]);
  const [progress, setProgress] = useState<PreparationProgress>({
    totalSteps: 0,
    completedSteps: 0,
    criticalCompleted: 0,
    totalCritical: 0,
    currentPhase: '',
    timeToProcedure: 0,
    overallProgress: 0,
    completedStepsList: [],
    upcomingDeadlines: []
  });
  const [activePhase, setActivePhase] = useState<string>('immediate');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Time until procedure
  const timeToProcedure = Math.max(0, Math.floor((procedureDate.getTime() - new Date().getTime()) / (1000 * 60 * 60)));

  // Comprehensive preparation steps for medical procedures
  const allPreparationSteps: PreparationStep[] = [
    // Immediate Actions (24-48 hours before)
    {
      id: 'confirm-appointment',
      title: 'Confirm Your Appointment',
      description: 'Call to confirm your appointment time and any last-minute instructions.',
      category: 'timing',
      priority: 'critical',
      estimatedTime: 48,
      duration: 0.5,
      completed: false,
      required: true,
      dependencies: [],
      warnings: ['Missing your appointment may result in cancellation fees'],
      tips: ['Confirm 24-48 hours before procedure'],
      reminderDays: [2, 1]
    },
    {
      id: 'review-instructions',
      title: 'Review All Instructions',
      description: 'Carefully read all pre-procedure instructions provided by your healthcare team.',
      category: 'documents',
      priority: 'critical',
      estimatedTime: 24,
      duration: 1,
      completed: false,
      required: true,
      documentation: {
        type: 'instruction',
        content: 'Review all medical instructions and procedure details',
        downloadable: true
      },
      tips: ['Take notes of any questions to ask your doctor'],
      reminderDays: [2]
    },
    {
      id: 'arrange-transport',
      title: 'Arrange Transportation',
      description: 'Coordinate reliable transportation to and from the facility.',
      category: 'logistics',
      priority: 'critical',
      estimatedTime: 24,
      duration: 0.5,
      completed: false,
      required: true,
      warnings: ['You cannot drive yourself after certain procedures'],
      tips: ['Plan for 2-3 hours total travel time including waiting']
    },

    // Dietary Restrictions (24-72 hours before)
    {
      id: 'dietary-restrictions',
      title: 'Follow Dietary Restrictions',
      description: 'Adhere to specific dietary guidelines as instructed by your healthcare provider.',
      category: 'diet',
      priority: 'critical',
      estimatedTime: 24,
      duration: 0,
      completed: false,
      required: true,
      warnings: ['Not following dietary restrictions may result in procedure cancellation'],
      tips: ['Clear liquids typically allowed until 2 hours before'],
      reminderDays: [3, 2, 1]
    },
    {
      id: 'medication-review',
      title: 'Medication Review',
      description: 'Review all current medications with your healthcare team.',
      category: 'medication',
      priority: 'critical',
      estimatedTime: 24,
      duration: 1,
      completed: false,
      required: true,
      documentation: {
        type: 'form',
        content: 'Complete medication disclosure form',
        downloadable: true
      },
      warnings: ['Some medications must be stopped before procedure'],
      tips: ['Bring all medication bottles to appointment']
    },

    // 1 Week Before
    {
      id: 'pre-operative-testing',
      title: 'Complete Pre-operative Testing',
      description: 'Finish any required blood work, imaging, or other diagnostic tests.',
      category: 'documents',
      priority: 'important',
      estimatedTime: 168, // 1 week in hours
      duration: 2,
      completed: false,
      required: true,
      warnings: ['Test results must be available before procedure'],
      tips: ['Schedule testing at least 5 days before procedure']
    },
    {
      id: 'insurance-authorization',
      title: 'Verify Insurance Coverage',
      description: 'Confirm your insurance coverage and obtain any required authorizations.',
      category: 'documents',
      priority: 'important',
      estimatedTime: 168,
      duration: 1,
      completed: false,
      required: true,
      tips: ['Contact insurance 1 week in advance to avoid delays']
    },

    // 2 Weeks Before
    {
      id: 'lifestyle-modifications',
      title: 'Implement Lifestyle Modifications',
      description: 'Begin any recommended lifestyle changes as advised by your healthcare team.',
      category: 'lifestyle',
      priority: 'recommended',
      estimatedTime: 336, // 2 weeks in hours
      duration: 0,
      completed: false,
      required: false,
      tips: ['Quit smoking at least 2 weeks before for better outcomes'],
      reminderDays: [14, 7]
    },
    {
      id: 'home-preparation',
      title: 'Prepare Your Home',
      description: 'Set up your recovery space and prepare necessary supplies.',
      category: 'lifestyle',
      priority: 'recommended',
      estimatedTime: 336,
      duration: 2,
      completed: false,
      required: false,
      tips: ['Stock up on easy-to-prepare foods and essentials']
    },

    // Day of Procedure
    {
      id: 'fasting-compliance',
      title: 'Complete Fasting Requirements',
      description: 'Ensure you have followed all fasting instructions as directed.',
      category: 'diet',
      priority: 'critical',
      estimatedTime: 2,
      duration: 0,
      completed: false,
      required: true,
      warnings: ['Eating or drinking after the specified time may cancel your procedure'],
      reminderDays: [1]
    },
    {
      id: 'bring-documents',
      title: 'Bring Required Documents',
      description: 'Collect all necessary identification and medical documents.',
      category: 'documents',
      priority: 'critical',
      estimatedTime: 1,
      duration: 0,
      completed: false,
      required: true,
      documentation: {
        type: 'checklist',
        content: 'ID, insurance card, medication list, signed consent forms',
        downloadable: true
      },
      checklist: ['Photo ID', 'Insurance card', 'Medication list', 'Signed consent forms']
    },
    {
      id: 'comfortable-clothing',
      title: 'Wear Comfortable Clothing',
      description: 'Choose loose, comfortable clothing for your procedure day.',
      category: 'lifestyle',
      priority: 'recommended',
      estimatedTime: 1,
      duration: 0,
      completed: false,
      required: false,
      tips: ['Avoid jewelry, makeup, and contact lenses']
    }
  ];

  useEffect(() => {
    // Filter steps based on time to procedure
    const applicableSteps = allPreparationSteps.filter(step => 
      timeToProcedure <= step.estimatedTime
    );

    setSteps(applicableSteps);

    // Calculate progress
    const totalSteps = applicableSteps.length;
    const completedSteps = applicableSteps.filter(step => step.completed).length;
    const criticalSteps = applicableSteps.filter(step => step.priority === 'critical');
    const criticalCompleted = criticalSteps.filter(step => step.completed).length;

    // Determine current phase
    let currentPhase = 'distant';
    if (timeToProcedure <= 24) currentPhase = 'immediate';
    else if (timeToProcedure <= 72) currentPhase = 'short-term';
    else if (timeToProcedure <= 168) currentPhase = 'week';
    else if (timeToProcedure <= 336) currentPhase = 'weeks';

    // Find upcoming deadlines
    const upcomingDeadlines = applicableSteps
      .filter(step => !step.completed)
      .sort((a, b) => a.estimatedTime - b.estimatedTime)
      .slice(0, 3);

    const newProgress: PreparationProgress = {
      totalSteps,
      completedSteps,
      criticalCompleted,
      totalCritical: criticalSteps.length,
      currentPhase,
      timeToProcedure,
      overallProgress: totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0,
      completedStepsList: applicableSteps.filter(step => step.completed).map(step => step.id),
      upcomingDeadlines
    };

    setProgress(newProgress);
    onProgressUpdate?.(newProgress);
  }, [timeToProcedure, onProgressUpdate]);

  const toggleStepComplete = (stepId: string) => {
    setSteps(prevSteps => {
      const updatedSteps = prevSteps.map(step => 
        step.id === stepId ? { ...step, completed: !step.completed } : step
      );
      
      // Update progress
      const newProgress = {
        ...progress,
        completedSteps: updatedSteps.filter(s => s.completed).length,
        completedStepsList: updatedSteps.filter(s => s.completed).map(s => s.id)
      };
      newProgress.overallProgress = newProgress.totalSteps > 0 ? 
        (newProgress.completedSteps / newProgress.totalSteps) * 100 : 0;

      setProgress(newProgress);
      onStepComplete?.(stepId, !steps.find(s => s.id === stepId)?.completed);
      
      return updatedSteps;
    });
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'immediate': return 'text-red-600 bg-red-100';
      case 'short-term': return 'text-orange-600 bg-orange-100';
      case 'week': return 'text-yellow-600 bg-yellow-100';
      case 'weeks': return 'text-green-600 bg-green-100';
      case 'distant': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return ExclamationTriangleIcon;
      case 'important': return InformationCircleIcon;
      case 'recommended': return CheckCircleIcon;
      default: return InformationCircleIcon;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'important': return 'text-orange-600 bg-orange-100';
      case 'recommended': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const groupStepsByCategory = () => {
    const grouped: { [key: string]: PreparationStep[] } = {};
    steps.forEach(step => {
      if (!grouped[step.category]) grouped[step.category] = [];
      grouped[step.category].push(step);
    });
    return grouped;
  };

  const canCompleteStep = (step: PreparationStep): boolean => {
    if (!step.dependencies) return true;
    return step.dependencies.every(depId => 
      steps.find(s => s.id === depId)?.completed
    );
  };

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5 text-blue-500" />
              <span>Preparation Progress</span>
            </div>
            <Badge className={getPhaseColor(progress.currentPhase)}>
              {progress.timeToProcedure > 24 ? 
                `${Math.floor(progress.timeToProcedure / 24)} days remaining` :
                `${progress.timeToProcedure} hours remaining`
              }
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>Overall Progress</span>
              <span>{Math.round(progress.overallProgress)}% Complete</span>
            </div>
            <Progress value={progress.overallProgress} className="w-full" />
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-green-600">
                  {progress.completedSteps}/{progress.totalSteps}
                </div>
                <div className="text-xs text-gray-500">Steps Completed</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-red-600">
                  {progress.criticalCompleted}/{progress.totalCritical}
                </div>
                <div className="text-xs text-gray-500">Critical Tasks</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-blue-600">
                  {progress.upcomingDeadlines.length}
                </div>
                <div className="text-xs text-gray-500">Upcoming Deadlines</div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={notificationsEnabled ? "bg-green-50 border-green-200" : ""}
              >
                <BellIcon className="h-4 w-4 mr-2" />
                {notificationsEnabled ? 'Notifications On' : 'Enable Reminders'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Deadlines */}
      {progress.upcomingDeadlines.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ClockIcon className="h-5 w-5 text-orange-500" />
              <span>Upcoming Deadlines</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {progress.upcomingDeadlines.map((step) => {
                const PriorityIcon = getPriorityIcon(step.priority);
                return (
                  <div key={step.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <PriorityIcon className={cn("h-4 w-4", getPriorityColor(step.priority).split(' ')[0])} />
                      <div>
                        <div className="font-medium text-sm">{step.title}</div>
                        <div className="text-xs text-gray-500">
                          Due in {step.estimatedTime} hours
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className={getPriorityColor(step.priority)}>
                      {step.priority}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preparation Steps by Category */}
      <div className="space-y-4">
        {Object.entries(groupStepsByCategory()).map(([category, categorySteps]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="capitalize">{category.replace('-', ' ')}</span>
                <Badge variant="outline">
                  {categorySteps.filter(s => s.completed).length}/{categorySteps.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categorySteps
                  .sort((a, b) => {
                    // Sort by priority first, then by estimated time
                    const priorityOrder = { critical: 0, important: 1, recommended: 2 };
                    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
                    if (priorityDiff !== 0) return priorityDiff;
                    return a.estimatedTime - b.estimatedTime;
                  })
                  .map((step) => {
                    const PriorityIcon = getPriorityIcon(step.priority);
                    const canComplete = canCompleteStep(step);
                    
                    return (
                      <div key={step.id} className={cn(
                        "border rounded-lg p-4 transition-all",
                        step.completed ? "bg-green-50 border-green-200" : "bg-white",
                        !canComplete && "opacity-50",
                        step.priority === 'critical' && !step.completed && "border-red-200 bg-red-50/30"
                      )}>
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            checked={step.completed}
                            onCheckedChange={() => canComplete && toggleStepComplete(step.id)}
                            disabled={!canComplete}
                            className="mt-1"
                          />
                          
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center space-x-2">
                              <PriorityIcon className={cn("h-4 w-4", getPriorityColor(step.priority).split(' ')[0])} />
                              <h4 className={cn(
                                "font-medium",
                                step.completed && "text-green-800 line-through"
                              )}>
                                {step.title}
                              </h4>
                              <Badge variant="outline" className={cn(
                                "text-xs",
                                getPriorityColor(step.priority)
                              )}>
                                {step.priority}
                              </Badge>
                              {step.required && (
                                <Badge variant="outline" className="text-xs">
                                  Required
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-sm text-gray-600">{step.description}</p>
                            
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>Due: {step.estimatedTime}h before</span>
                              <span>Duration: {step.duration}h</span>
                            </div>

                            {step.warnings && step.warnings.length > 0 && (
                              <div className="p-2 bg-red-50 border border-red-200 rounded">
                                <div className="flex items-start space-x-2">
                                  <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mt-0.5" />
                                  <div className="text-sm text-red-700">
                                    <div className="font-medium">Important Warning:</div>
                                    <ul className="list-disc list-inside space-y-1">
                                      {step.warnings.map((warning, index) => (
                                        <li key={index}>{warning}</li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            )}

                            {step.tips && step.tips.length > 0 && (
                              <div className="p-2 bg-blue-50 border border-blue-200 rounded">
                                <div className="flex items-start space-x-2">
                                  <InformationCircleIcon className="h-4 w-4 text-blue-500 mt-0.5" />
                                  <div className="text-sm text-blue-700">
                                    <div className="font-medium">Tips:</div>
                                    <ul className="list-disc list-inside space-y-1">
                                      {step.tips.map((tip, index) => (
                                        <li key={index}>{tip}</li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            )}

                            {step.documentation && (
                              <div className="flex items-center space-x-2">
                                <DocumentTextIcon className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-600">
                                  {step.documentation.content}
                                </span>
                                {step.documentation.downloadable && (
                                  <Button variant="ghost" size="sm">
                                    Download
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Emergency Contact */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center space-x-4">
            <div className="text-center">
              <div className="font-medium">Questions about preparation?</div>
              <div className="text-sm text-gray-500">Contact our patient support team</div>
            </div>
            <Button>
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}