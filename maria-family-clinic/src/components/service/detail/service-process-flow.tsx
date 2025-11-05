"use client";

import React, { useState } from 'react';
import { useServiceData } from '@/hooks/use-service-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronDownIcon, 
  ArrowRightIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  UserIcon,
  BeakerIcon,
  HeartIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface ServiceProcessFlowProps {
  category: string;
  serviceSlug: string;
  locale: string;
}

interface ProcessStep {
  id: string;
  title: string;
  description: string;
  duration?: string;
  isRequired?: boolean;
  isOptional?: boolean;
  tips?: string[];
  warnings?: string[];
  prerequisites?: string[];
  whatToExpect?: string;
  preparationNeeded?: string;
  postCareInstructions?: string;
  estimatedCost?: string;
  icon?: React.ComponentType<any>;
}

export function ServiceProcessFlow({ category, serviceSlug, locale }: ServiceProcessFlowProps) {
  const { data: service, isLoading } = useServiceData(category, serviceSlug, locale);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [visitedSteps, setVisitedSteps] = useState<Set<string>>(new Set());

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="h-96 bg-gray-200 rounded" />
      </div>
    );
  }

  if (!service) return null;

  // Default comprehensive process flow for medical procedures
  const processSteps: ProcessStep[] = service.processSteps || [
    {
      id: '1',
      title: 'Pre-Consultation Preparation',
      description: 'Complete online forms and prepare your medical history for the consultation.',
      duration: '10-15 minutes',
      isRequired: true,
      whatToExpect: 'You\'ll fill out health questionnaires, provide medication lists, and upload any relevant medical documents.',
      preparationNeeded: 'Gather current medications, previous medical records, and insurance information.',
      icon: DocumentTextIcon
    },
    {
      id: '2',
      title: 'Initial Consultation',
      description: 'Meet with your healthcare provider to discuss your concerns, symptoms, and medical history.',
      duration: '30-45 minutes',
      isRequired: true,
      whatToExpect: 'Detailed discussion of your health concerns, physical examination, and medical history review.',
      tips: [
        'Bring a list of current medications and dosages',
        'Prepare questions about the procedure',
        'Bring relevant medical records and imaging',
        'Consider bringing a family member for support'
      ],
      warnings: [
        'Be honest about your medical history and current symptoms',
        'Mention all allergies and previous adverse reactions',
        'Discuss any fears or concerns you may have'
      ],
      icon: UserIcon
    },
    {
      id: '3',
      title: 'Diagnostic Assessment',
      description: 'Physical examination and any necessary diagnostic tests to determine the best treatment approach.',
      duration: '20-60 minutes',
      isRequired: true,
      whatToExpect: 'Comprehensive physical examination, review of symptoms, and possibly ordering of additional tests.',
      tips: [
        'Wear comfortable, easily removable clothing',
        'Follow any pre-exam instructions carefully',
        'Ask questions if anything is unclear'
      ],
      icon: BeakerIcon
    },
    {
      id: '4',
      title: 'Treatment Planning Discussion',
      description: 'Comprehensive discussion of treatment options, risks, benefits, and creating a personalized care plan.',
      duration: '20-40 minutes',
      isRequired: true,
      whatToExpect: 'Review of findings, discussion of treatment options, risk-benefit analysis, and Q&A session.',
      tips: [
        'Ask questions about each treatment option',
        'Discuss timeline and expected outcomes',
        'Understand follow-up requirements',
        'Consider second opinion if needed'
      ],
      warnings: [
        'Don\'t rush important decisions',
        'Ensure you understand all risks and benefits',
        'Ask about alternative treatment options'
      ],
      icon: HeartIcon
    },
    {
      id: '5',
      title: 'Consent and Scheduling',
      description: 'Review and sign consent forms, schedule procedure, and receive preparation instructions.',
      duration: '15-30 minutes',
      isRequired: true,
      whatToExpect: 'Review of consent forms, scheduling the procedure, and receiving detailed preparation instructions.',
      prerequisites: ['Complete treatment planning discussion'],
      icon: DocumentTextIcon
    },
    {
      id: '6',
      title: 'Pre-Procedure Preparation',
      description: 'Follow specific preparation instructions to ensure the best outcomes for your procedure.',
      duration: 'Varies (1-7 days)',
      isRequired: true,
      whatToExpect: 'Medication adjustments, dietary restrictions, lifestyle modifications, and final preparation steps.',
      tips: [
        'Follow all medication instructions exactly',
        'Maintain healthy lifestyle during preparation',
        'Contact clinic if you develop any symptoms',
        'Arrange transportation if required'
      ],
      warnings: [
        'Don\'t discontinue medications without doctor approval',
        'Avoid alcohol and smoking as instructed',
        'Follow dietary restrictions precisely'
      ],
      icon: HeartIcon
    },
    {
      id: '7',
      title: 'Day of Procedure',
      description: 'The actual medical procedure or treatment as planned during your consultation.',
      duration: service.typicalDurationMinutes ? `${service.typicalDurationMinutes} minutes` : 'Varies',
      isRequired: true,
      whatToExpect: 'Check-in, pre-procedure preparation, procedure itself, and initial recovery monitoring.',
      tips: [
        'Arrive 15-30 minutes early',
        'Wear comfortable clothing',
        'Remove jewelry and accessories',
        'Bring a support person if allowed'
      ],
      warnings: [
        'Inform staff of any changes in health status',
        'Follow all pre-procedure instructions',
        'Don\'t hesitate to voice concerns'
      ],
      icon: BeakerIcon
    },
    {
      id: '8',
      title: 'Immediate Post-Procedure Care',
      description: 'Monitoring, recovery, and initial post-procedure instructions in the clinical setting.',
      duration: '30 minutes - 2 hours',
      isRequired: true,
      whatToExpect: 'Vital signs monitoring, pain management, initial recovery assessment, and discharge planning.',
      postCareInstructions: 'Detailed written instructions for home care, medication management, and activity restrictions.',
      icon: HeartIcon
    },
    {
      id: '9',
      title: 'Home Recovery & Follow-up',
      description: 'Recovery period at home with scheduled follow-up appointments to monitor progress.',
      duration: 'Ongoing (days to weeks)',
      isRequired: true,
      whatToExpect: 'Recovery monitoring at home with scheduled follow-up calls and appointments.',
      tips: [
        'Follow all post-care instructions meticulously',
        'Monitor symptoms and recovery progress',
        'Keep all follow-up appointments',
        'Contact clinic with any concerns'
      ],
      warnings: [
        'Seek immediate medical attention for serious symptoms',
        'Don\'t ignore warning signs',
        'Contact clinic before taking new medications'
      ],
      icon: HeartIcon
    },
    {
      id: '10',
      title: 'Long-term Follow-up',
      description: 'Ongoing monitoring and care to ensure optimal long-term outcomes and prevent complications.',
      duration: 'Varies',
      isRequired: false,
      whatToExpect: 'Periodic check-ups, imaging studies if needed, and lifestyle guidance for optimal health.',
      tips: [
        'Maintain healthy lifestyle habits',
        'Attend all scheduled follow-ups',
        'Report any new symptoms promptly',
        'Ask questions about long-term care'
      ],
      icon: UserIcon
    }
  ];

  const toggleStep = (stepId: string) => {
    setExpandedStep(expandedStep === stepId ? null : stepId);
    setVisitedSteps(prev => new Set([...prev, stepId]));
  };

  const getStepStatus = (step: ProcessStep) => {
    if (step.isOptional) return 'optional';
    if (step.isRequired) return 'required';
    return 'recommended';
  };

  const getStepIcon = (step: ProcessStep) => {
    const Icon = step.icon || CheckCircleIcon;
    return <Icon className="h-5 w-5 text-blue-500" />;
  };

  const getStepBadge = (status: string) => {
    switch (status) {
      case 'optional':
        return <Badge variant="outline" className="text-xs">Optional</Badge>;
      case 'recommended':
        return <Badge variant="secondary" className="text-xs">Recommended</Badge>;
      default:
        return <Badge variant="default" className="text-xs">Required</Badge>;
    }
  };

  const totalSteps = processSteps.length;
  const completedSteps = visitedSteps.size;
  const completionPercentage = Math.round((completedSteps / totalSteps) * 100);

  const estimateTotalDuration = () => {
    // Simple estimation based on required steps
    const requiredSteps = processSteps.filter(step => step.isRequired !== false);
    return requiredSteps.reduce((total, step) => {
      const duration = step.duration;
      if (!duration) return total;
      
      // Extract minutes from duration strings like "30-45 minutes" or "1-2 hours"
      const minutes = duration.includes('hour') 
        ? parseInt(duration) * 60 
        : parseInt(duration.match(/\d+/)?.[0] || '0');
      
      return total + (isNaN(minutes) ? 30 : minutes);
    }, 0);
  };

  return (
    <div id="process" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ArrowRightIcon className="h-5 w-5 text-blue-500" />
            <span>Step-by-Step Process Guide</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Complete walkthrough of your {service.name} journey from consultation to recovery
          </p>
          
          {/* Progress Indicator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Overall Progress</span>
              <span className="font-medium">{completedSteps} of {totalSteps} steps explored</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Process Overview */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <div className="flex items-start space-x-2">
                <InformationCircleIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800 mb-1">
                    Process Overview
                  </h4>
                  <p className="text-sm text-blue-700 mb-2">
                    Your complete {service.name} journey typically involves {totalSteps} steps over approximately {estimateTotalDuration()} minutes of direct clinical time, plus recovery periods.
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-blue-600">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span>Required steps</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-gray-300 rounded-full" />
                      <span>Optional steps</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Process Steps */}
            <div className="space-y-4">
              {processSteps.map((step, index) => {
                const status = getStepStatus(step);
                const isExpanded = expandedStep === step.id;
                const isVisited = visitedSteps.has(step.id);
                
                return (
                  <div key={step.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="p-4 bg-gray-50">
                      <div className="flex items-start space-x-4">
                        {/* Step Number and Icon */}
                        <div className={cn(
                          "flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full",
                          isVisited ? "bg-green-100" : "bg-blue-100"
                        )}>
                          <span className={cn(
                            "text-sm font-medium",
                            isVisited ? "text-green-600" : "text-blue-600"
                          )}>
                            {index + 1}
                          </span>
                        </div>
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {getStepIcon(step)}
                              <h3 className="font-medium text-gray-900">{step.title}</h3>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getStepBadge(status)}
                              {isVisited && <CheckCircleIcon className="h-4 w-4 text-green-500" />}
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600">{step.description}</p>
                          
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            {step.duration && (
                              <div className="flex items-center space-x-1">
                                <ClockIcon className="h-3 w-3" />
                                <span>{step.duration}</span>
                              </div>
                            )}
                            {step.estimatedCost && (
                              <div className="flex items-center space-x-1">
                                <span className="text-green-600">{step.estimatedCost}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <Collapsible
                          open={isExpanded}
                          onOpenChange={() => toggleStep(step.id)}
                        >
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="p-1">
                              <ChevronDownIcon 
                                className={cn(
                                  "h-4 w-4 transition-transform",
                                  isExpanded ? "rotate-180" : ""
                                )} 
                              />
                            </Button>
                          </CollapsibleTrigger>
                        </Collapsible>
                      </div>
                    </div>

                    <Collapsible
                      open={isExpanded}
                      onOpenChange={() => toggleStep(step.id)}
                    >
                      <CollapsibleContent>
                        <div className="p-4 space-y-4 border-t border-gray-200">
                          {/* What to Expect */}
                          {step.whatToExpect && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-2">What to Expect:</h4>
                              <p className="text-sm text-gray-700">{step.whatToExpect}</p>
                            </div>
                          )}

                          {/* Prerequisites */}
                          {step.prerequisites && step.prerequisites.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-2">Prerequisites:</h4>
                              <ul className="text-sm text-gray-600 space-y-1">
                                {step.prerequisites.map((prereq, idx) => (
                                  <li key={idx} className="flex items-center space-x-2">
                                    <div className="w-1 h-1 bg-gray-400 rounded-full" />
                                    <span>{prereq}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Preparation Needed */}
                          {step.preparationNeeded && (
                            <div className="bg-blue-50 p-3 rounded border border-blue-200">
                              <h4 className="text-sm font-medium text-blue-800 mb-1">Preparation Needed:</h4>
                              <p className="text-sm text-blue-700">{step.preparationNeeded}</p>
                            </div>
                          )}

                          {/* Tips */}
                          {step.tips && step.tips.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-green-700 mb-2">Helpful Tips:</h4>
                              <ul className="text-sm text-green-600 space-y-1">
                                {step.tips.map((tip, idx) => (
                                  <li key={idx} className="flex items-center space-x-2">
                                    <CheckCircleIcon className="h-3 w-3 text-green-500 flex-shrink-0" />
                                    <span>{tip}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Warnings */}
                          {step.warnings && step.warnings.length > 0 && (
                            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                              <h4 className="text-sm font-medium text-yellow-800 mb-2 flex items-center space-x-1">
                                <ExclamationTriangleIcon className="h-4 w-4" />
                                <span>Important Notes:</span>
                              </h4>
                              <ul className="text-sm text-yellow-700 space-y-1">
                                {step.warnings.map((warning, idx) => (
                                  <li key={idx} className="flex items-center space-x-2">
                                    <div className="w-1 h-1 bg-yellow-600 rounded-full" />
                                    <span>{warning}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Post-Care Instructions */}
                          {step.postCareInstructions && (
                            <div className="bg-green-50 p-3 rounded border border-green-200">
                              <h4 className="text-sm font-medium text-green-800 mb-1">Post-Care Instructions:</h4>
                              <p className="text-sm text-green-700">{step.postCareInstructions}</p>
                            </div>
                          )}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                );
              })}
            </div>

            {/* Summary Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Total Time Investment</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>• Direct clinical time: ~{estimateTotalDuration()} minutes</div>
                  <div>• Preparation period: 1-7 days</div>
                  <div>• Recovery time: Varies by procedure</div>
                  <div>• Follow-up: As recommended</div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Need Help?</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>• Call our helpline: (65) 6789 1234</div>
                  <div>• Email: care@myfamilyclinic.com</div>
                  <div>• Emergency: 995</div>
                  <div>• Available: 24/7 support</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}