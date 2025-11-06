"use client";

import React, { useState } from 'react';
import { useService } from '@/hooks/use-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { 
  ChevronDownIcon, 
  ArrowRightIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface ServiceProcessFlowProps {
  serviceId: string;
}

interface ProcessStep {
  id: string;
  title: string;
  description: string;
  duration?: string;
  isRequired?: boolean;
  tips?: string[];
  warnings?: string[];
  prerequisites?: string[];
}

export function ServiceProcessFlow({ serviceId }: ServiceProcessFlowProps) {
  const { data: service, isLoading } = useService(serviceId);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  if (isLoading || !service) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="h-96 bg-gray-200 rounded" />
      </div>
    );
  }

  // Default process flow if no custom steps provided
  const processSteps: ProcessStep[] = service.processSteps || [
    {
      id: '1',
      title: 'Initial Consultation',
      description: 'Meet with your healthcare provider to discuss your concerns and medical history.',
      duration: '15-30 minutes',
      isRequired: true,
      tips: [
        'Bring a list of current medications',
        'Prepare questions about the procedure',
        'Bring relevant medical records'
      ],
      warnings: [
        'Disclose all allergies and medical conditions'
      ]
    },
    {
      id: '2',
      title: 'Examination & Assessment',
      description: 'Physical examination and any necessary diagnostic tests to determine the best treatment approach.',
      duration: '20-45 minutes',
      isRequired: true,
      tips: [
        'Wear comfortable clothing',
        'Follow any pre-exam instructions'
      ]
    },
    {
      id: '3',
      title: 'Treatment Planning',
      description: 'Discussion of treatment options, risks, benefits, and creating a personalized care plan.',
      duration: '15-30 minutes',
      isRequired: true,
      tips: [
        'Ask questions about the treatment plan',
        'Discuss timeline and expectations',
        'Understand follow-up requirements'
      ]
    },
    {
      id: '4',
      title: 'Treatment Procedure',
      description: 'The actual medical procedure or treatment as planned during your consultation.',
      duration: service.typicalDurationMin ? `${service.typicalDurationMin} minutes` : 'Varies',
      isRequired: true,
      tips: [
        'Follow pre-procedure instructions',
        'Arrange for post-procedure transportation if needed'
      ]
    },
    {
      id: '5',
      title: 'Recovery & Follow-up',
      description: 'Post-treatment care instructions and scheduled follow-up appointments.',
      duration: 'Ongoing',
      isRequired: true,
      prerequisites: ['Complete treatment procedure'],
      tips: [
        'Follow all post-care instructions',
        'Schedule follow-up appointments',
        'Monitor your recovery progress'
      ]
    }
  ];

  const toggleStep = (stepId: string) => {
    setExpandedStep(expandedStep === stepId ? null : stepId);
  };

  const getStepStatus = (step: ProcessStep) => {
    if (step.isRequired === false) return 'optional';
    return 'required';
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'required':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'optional':
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <CheckCircleIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStepBadge = (status: string) => {
    if (status === 'optional') {
      return <Badge variant="outline" className="text-xs">Optional</Badge>;
    }
    return <Badge variant="default" className="text-xs">Required</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ArrowRightIcon className="h-5 w-5 text-blue-500" />
          <span>Process Flow</span>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Step-by-step guide to your {service.name} experience
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {processSteps.map((step, index) => {
            const status = getStepStatus(step);
            const isExpanded = expandedStep === step.id;
            
            return (
              <div key={step.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-4 bg-gray-50">
                  <div className="flex items-start space-x-4">
                    {/* Step Number and Icon */}
                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                      <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900">{step.title}</h3>
                          {getStepIcon(status)}
                        </div>
                        {getStepBadge(status)}
                      </div>
                      
                      <p className="text-sm text-gray-600">{step.description}</p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        {step.duration && (
                          <div className="flex items-center space-x-1">
                            <ClockIcon className="h-3 w-3" />
                            <span>{step.duration}</span>
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
                            className={`h-4 w-4 transition-transform ${
                              isExpanded ? 'rotate-180' : ''
                            }`} 
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

                      {/* Tips */}
                      {step.tips && step.tips.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-green-700 mb-2">Helpful Tips:</h4>
                          <ul className="text-sm text-green-600 space-y-1">
                            {step.tips.map((tip, idx) => (
                              <li key={idx} className="flex items-center space-x-2">
                                <CheckCircleIcon className="h-3 w-3 text-green-500" />
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
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            );
          })}
        </div>

        {/* Total Duration Estimate */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Total Duration</h4>
          <p className="text-sm text-blue-800">
            The complete process typically takes{' '}
            <strong>{service.typicalDurationMin || 'varies depending on individual needs'} minutes</strong>.
            Please plan for additional time for check-in and check-out processes.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}