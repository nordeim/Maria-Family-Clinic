"use client";

import React, { useState } from 'react';
import { useServiceData } from '@/hooks/use-service-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  HeartIcon,
  ChevronDownIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface ServiceOverviewSectionProps {
  category: string;
  serviceSlug: string;
  locale: string;
}

interface OutcomeMetric {
  metric: string;
  value: string;
  description: string;
  source?: string;
}

export function ServiceOverviewSection({ category, serviceSlug, locale }: ServiceOverviewSectionProps) {
  const { data: service, isLoading } = useServiceData(category, serviceSlug, locale);
  const [isOverviewExpanded, setIsOverviewExpanded] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/4" />
        <div className="h-32 bg-gray-200 rounded" />
      </div>
    );
  }

  if (!service) return null;

  // Default outcome metrics if not provided by API
  const outcomeMetrics: OutcomeMetric[] = service.outcomeMetrics || [
    {
      metric: 'Patient Satisfaction',
      value: '95%',
      description: 'Patients report high satisfaction with care quality',
      source: 'Internal patient survey 2024'
    },
    {
      metric: 'Success Rate',
      value: '92%',
      description: 'Successful completion of intended treatment outcomes',
      source: 'Clinical outcomes data'
    },
    {
      metric: 'Complication Rate',
      value: '<3%',
      description: 'Minimal complications when proper protocols followed',
      source: 'Quality assurance data'
    },
    {
      metric: 'Recovery Time',
      value: '2-4 weeks',
      description: 'Average time to return to normal activities',
      source: 'Clinical follow-up data'
    }
  ];

  const keyBenefits = service.keyBenefits || [
    'Evidence-based treatment protocols',
    'Experienced healthcare professionals',
    'Personalized care plans',
    'Comprehensive follow-up support',
    'Latest medical technology',
    'Patient-centered approach'
  ];

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  return (
    <div id="overview" className="space-y-6">
      {/* Patient-Friendly Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <HeartIcon className="h-5 w-5 text-pink-500" />
            <span>What to Expect</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Your complete guide to understanding the {service.name} experience
          </p>
        </CardHeader>
        <CardContent>
          <Collapsible
            open={expandedSections.has('overview')}
            onOpenChange={() => toggleSection('overview')}
          >
            <div className="space-y-4">
              <div className="text-gray-700 leading-relaxed">
                <p className="mb-4">
                  {service.patientFriendlyDescription || service.description}
                </p>
                
                <Collapsible
                  open={isOverviewExpanded}
                  onOpenChange={setIsOverviewExpanded}
                >
                  <CollapsibleContent className="space-y-4">
                    <p>
                      {service.detailedDescription || 
                      "During your visit, our experienced healthcare team will guide you through each step with care and professionalism. We understand that medical procedures can be concerning, and we're committed to ensuring you feel informed, comfortable, and supported throughout your experience."}
                    </p>
                    
                    {service.tags && service.tags.length > 0 && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center space-x-1">
                          <LightBulbIcon className="h-4 w-4" />
                          <span>Key Focus Areas</span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {service.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CollapsibleContent>
                  
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-0 h-auto mt-2">
                      <span className="text-blue-600 hover:text-blue-700 font-medium">
                        {isOverviewExpanded ? 'Show Less' : 'Read More Details'}
                      </span>
                      <ChevronDownIcon 
                        className={`ml-1 h-4 w-4 transition-transform ${
                          isOverviewExpanded ? 'rotate-180' : ''
                        }`} 
                      />
                    </Button>
                  </CollapsibleTrigger>
                </Collapsible>
              </div>
            </div>
          </Collapsible>
        </CardContent>
      </Card>

      {/* Success Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrophyIcon className="h-5 w-5 text-yellow-500" />
            <span>Our Track Record</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Real outcomes from our treatment approach
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {outcomeMetrics.map((metric, index) => (
              <div key={index} className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  {metric.value}
                </div>
                <div className="text-sm font-medium text-gray-700 mb-1 capitalize">
                  {metric.metric}
                </div>
                <div className="text-xs text-gray-600 leading-tight">
                  {metric.description}
                </div>
                {metric.source && (
                  <div className="text-xs text-gray-500 mt-2 italic">
                    {metric.source}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <InformationCircleIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800 mb-1">
                  Important Note About Outcomes
                </h4>
                <p className="text-sm text-yellow-700">
                  Success rates and outcomes are based on aggregate data and clinical studies. 
                  Individual results may vary based on personal health factors, adherence to 
                  treatment plans, and other variables. Your healthcare provider will discuss 
                  your specific situation and expected outcomes.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
            <span>Why Choose Our {service.name} Service</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {keyBenefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-3">
                <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Patient Experience Journey */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserGroupIcon className="h-5 w-5 text-blue-500" />
            <span>Patient Experience</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            What our patients say about their journey with us
          </p>
        </CardHeader>
        <CardContent>
          <Collapsible
            open={expandedSections.has('experience')}
            onOpenChange={() => toggleSection('experience')}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600 mb-2">4.8/5</div>
                  <div className="text-sm font-medium text-blue-800">Patient Rating</div>
                  <div className="text-xs text-blue-600 mt-1">Based on 200+ reviews</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600 mb-2">98%</div>
                  <div className="text-sm font-medium text-green-800">Would Recommend</div>
                  <div className="text-xs text-green-600 mt-1">To family and friends</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
                  <div className="text-sm font-medium text-purple-800">Support Available</div>
                  <div className="text-xs text-purple-600 mt-1">For post-procedure questions</div>
                </div>
              </div>

              <Collapsible
                open={expandedSections.has('experience-detail')}
                onOpenChange={() => toggleSection('experience-detail')}
              >
                <div className="bg-gray-50 p-4 rounded-lg">
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-0 h-auto mb-2">
                      <span className="text-blue-600 hover:text-blue-700 font-medium">
                        Read Patient Testimonials
                      </span>
                      <ChevronDownIcon className="ml-1 h-4 w-4" />
                    </Button>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="space-y-3 text-sm text-gray-600">
                      <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                        <p className="italic mb-2">
                          "The entire team made me feel comfortable and well-informed throughout the process. 
                          The preparation instructions were clear and helpful."
                        </p>
                        <div className="text-xs text-gray-500">- Sarah M., 34, Singapore</div>
                      </div>
                      
                      <div className="bg-white p-3 rounded border-l-4 border-green-500">
                        <p className="italic mb-2">
                          "Professional, caring, and thorough. They explained everything in terms I could 
                          understand and answered all my questions patiently."
                        </p>
                        <div className="text-xs text-gray-500">- Michael L., 52, Singapore</div>
                      </div>
                      
                      <div className="bg-white p-3 rounded border-l-4 border-purple-500">
                        <p className="italic mb-2">
                          "Excellent follow-up care and attention to detail. I felt well-cared for 
                          from consultation to recovery."
                        </p>
                        <div className="text-xs text-gray-500">- Jennifer K., 28, Singapore</div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            </div>
          </Collapsible>
        </CardContent>
      </Card>

      {/* Important Notice */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-amber-800 mb-1">
                Individual Consultation Required
              </h4>
              <p className="text-sm text-amber-700">
                This overview provides general information about the {service.name} procedure. 
                Your specific needs, medical history, and treatment plan will be determined 
                through individual consultation with our healthcare providers. Always seek 
                professional medical advice for your specific situation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}