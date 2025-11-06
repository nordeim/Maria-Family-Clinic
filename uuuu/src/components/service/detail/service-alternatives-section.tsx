"use client";

import React, { useState } from 'react';
import { useServiceData } from '@/hooks/use-service-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ChevronDownIcon, 
  ArrowPathIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  StarIcon,
  UserGroupIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface ServiceAlternativesSectionProps {
  category: string;
  serviceSlug: string;
  locale: string;
}

interface AlternativeService {
  id: string;
  name: string;
  category: string;
  description: string;
  patientFriendlyDescription: string;
  differences: string[];
  benefits: string[];
  considerations: string[];
  effectiveness: string;
  typicalDuration: string;
  costRange: string;
  complexity: 'lower' | 'similar' | 'higher';
  suitableFor: string[];
  contraindications?: string[];
  recommendedWhen?: string[];
  notRecommendedWhen?: string[];
  icon?: React.ComponentType<any>;
}

export function ServiceAlternativesSection({ category, serviceSlug, locale }: ServiceAlternativesSectionProps) {
  const { data: service, isLoading } = useServiceData(category, serviceSlug, locale);
  const [selectedAlternative, setSelectedAlternative] = useState<string | null>(null);
  const [expandedService, setExpandedService] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="h-96 bg-gray-200 rounded" />
      </div>
    );
  }

  if (!service) return null;

  // Mock alternative services data
  const alternativeServices: AlternativeService[] = [
    {
      id: 'conservative-care',
      name: 'Conservative/Non-Surgical Treatment',
      category: 'Non-Invasive',
      description: 'Conservative treatment approaches including medications, physical therapy, and lifestyle modifications.',
      patientFriendlyDescription: 'Non-surgical treatment options that may be tried before considering more invasive procedures.',
      differences: [
        'No surgical intervention required',
        'Gradual improvement over time',
        'Lower initial cost',
        'No recovery downtime',
        'May require long-term management'
      ],
      benefits: [
        'Avoids surgical risks',
        'Can be modified or adjusted',
        'Less expensive upfront',
        'No anesthesia required',
        'Preserves anatomy'
      ],
      considerations: [
        'May not be as effective for severe conditions',
        'Requires patient compliance',
        'Results may take longer to achieve',
        'May need ongoing treatment'
      ],
      effectiveness: '70-85% success rate for appropriate cases',
      typicalDuration: '4-12 weeks',
      costRange: 'SGD 80-300',
      complexity: 'lower',
      suitableFor: [
        'Early-stage conditions',
        'Patients preferring non-invasive options',
        'Those with surgical contraindications',
        'Cost-conscious patients'
      ],
      recommendedWhen: [
        'Symptoms are mild to moderate',
        'Patient prefers conservative approach',
        'No urgent intervention needed',
        'Good response to initial treatment'
      ],
      notRecommendedWhen: [
        'Severe symptoms affecting quality of life',
        'Condition worsening despite treatment',
        'Emergency intervention needed',
        'Structural abnormalities requiring correction'
      ]
    },
    {
      id: 'minimally-invasive',
      name: 'Minimally Invasive Procedure',
      category: 'Minimally Invasive',
      description: 'Advanced techniques using small incisions and specialized instruments to achieve treatment goals.',
      patientFriendlyDescription: 'Modern procedures using small cuts and tiny cameras to treat conditions with minimal disruption.',
      differences: [
        'Small incisions (0.5-1.5cm)',
        'Camera-guided precision',
        'Faster recovery than traditional surgery',
        'Reduced scarring',
        'Outpatient procedure often possible'
      ],
      benefits: [
        'Faster recovery (1-2 weeks vs 4-6 weeks)',
        'Minimal scarring',
        'Reduced pain and discomfort',
        'Lower infection risk',
        'Return to normal activities sooner'
      ],
      considerations: [
        'May not be suitable for all conditions',
        'Equipment and expertise required',
        'Higher cost than conservative treatment',
        'Still carries surgical risks'
      ],
      effectiveness: '90-95% success rate',
      typicalDuration: '30-90 minutes',
      costRange: 'SGD 800-2500',
      complexity: 'similar',
      suitableFor: [
        'Patients seeking faster recovery',
        'Those wanting minimal scarring',
        'Moderate to severe conditions',
        'Active individuals'
      ],
      recommendedWhen: [
        'Condition suitable for minimally invasive approach',
        'Patient values faster recovery',
        'Good candidate for procedure',
        'Cost-benefit ratio is favorable'
      ],
      notRecommendedWhen: [
        'Complex anatomy or severe disease',
        'Previous surgeries in same area',
        'Bleeding disorders',
        'Poor general health'
      ]
    },
    {
      id: 'traditional-surgery',
      name: 'Traditional Open Surgery',
      category: 'Surgical',
      description: 'Conventional surgical approach using larger incisions when minimally invasive techniques are not suitable.',
      patientFriendlyDescription: 'Traditional surgical method using larger incisions when needed for complex conditions.',
      differences: [
        'Larger incision for better access',
        'Direct visualization',
        'May require hospitalization',
        'Longer recovery period',
        'More comprehensive treatment'
      ],
      benefits: [
        'Direct access to treatment area',
        'Suitable for complex cases',
        'Comprehensive treatment possible',
        'Established surgical technique',
        'Often covered by insurance'
      ],
      considerations: [
        'Longer recovery (4-6 weeks)',
        'Larger scars',
        'Higher initial cost',
        'More post-operative pain',
        'Hospital stay may be required'
      ],
      effectiveness: '95-98% success rate',
      typicalDuration: '1-3 hours',
      costRange: 'SGD 3000-8000',
      complexity: 'higher',
      suitableFor: [
        'Complex surgical cases',
        'When other methods not suitable',
        'Multiple procedures needed',
        'Revision surgeries'
      ],
      recommendedWhen: [
        'Condition too complex for minimally invasive',
        'Multiple issues to address',
        'Previous failed procedures',
        'Excellent candidate for surgery'
      ],
      notRecommendedWhen: [
        'High surgical risk patient',
        'Condition manageable with other methods',
        'Patient prefers conservative approach',
        'Limited life expectancy'
      ]
    },
    {
      id: 'watchful-waiting',
      name: 'Active Monitoring/Watchful Waiting',
      category: 'Conservative',
      description: 'Regular monitoring and observation without immediate intervention unless symptoms worsen.',
      patientFriendlyDescription: 'Careful watching and monitoring of the condition with regular check-ups instead of immediate treatment.',
      differences: [
        'No immediate treatment',
        'Regular monitoring schedule',
        'Early intervention if needed',
        'Patient education and support',
        'Lifestyle guidance'
      ],
      benefits: [
        'Avoids unnecessary treatment',
        'Cost-effective approach',
        'Maintains quality of life',
        'Allows natural healing',
        'Reduces treatment-related risks'
      ],
      considerations: [
        'Requires patient compliance',
        'May miss optimal treatment timing',
        'Potential for condition to worsen',
        'Requires regular follow-up'
      ],
      effectiveness: 'Variable - depends on condition',
      typicalDuration: 'Ongoing monitoring',
      costRange: 'SGD 50-150 per visit',
      complexity: 'lower',
      suitableFor: [
        'Mild symptoms',
        'Stable conditions',
        'Elderly or frail patients',
        'Patients preferring minimal intervention'
      ],
      recommendedWhen: [
        'Symptoms are stable or improving',
        'Risk of treatment exceeds benefits',
        'Patient preferences favor monitoring',
        'Good natural history expected'
      ],
      notRecommendedWhen: [
        'Progressive symptoms',
        'Risk of complications',
        'Quality of life significantly affected',
        'Patient anxiety about not treating'
      ]
    }
  ];

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'lower': return 'text-green-700 bg-green-100';
      case 'similar': return 'text-blue-700 bg-blue-100';
      case 'higher': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getComplexityIcon = (complexity: string) => {
    switch (complexity) {
      case 'lower': return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'similar': return <ArrowPathIcon className="h-4 w-4 text-blue-500" />;
      case 'higher': return <InformationCircleIcon className="h-4 w-4 text-red-500" />;
      default: return <InformationCircleIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const toggleService = (serviceId: string) => {
    setExpandedService(expandedService === serviceId ? null : serviceId);
  };

  return (
    <div id="alternatives" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ArrowPathIcon className="h-5 w-5 text-purple-500" />
            <span>Treatment Alternatives</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Explore different treatment options and approaches for your condition
          </p>
        </CardHeader>
        <CardContent>
          <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg mb-6">
            <div className="flex items-start space-x-2">
              <LightBulbIcon className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-purple-800 mb-1">
                  Choosing the Right Treatment
                </h4>
                <p className="text-sm text-purple-700">
                  Every patient's situation is unique. Your healthcare provider will help you choose 
                  the most appropriate treatment based on your specific condition, preferences, and goals. 
                  This overview helps you understand your options.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {alternativeServices.map((alternative) => {
              const isExpanded = expandedService === alternative.id;
              const isSelected = selectedAlternative === alternative.id;
              
              return (
                <Card 
                  key={alternative.id} 
                  className={cn(
                    "border-2 cursor-pointer transition-all duration-200",
                    isSelected ? "border-blue-500 shadow-md" : "border-gray-200 hover:border-gray-300",
                    isExpanded ? "shadow-lg" : ""
                  )}
                  onClick={() => setSelectedAlternative(isSelected ? null : alternative.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900">{alternative.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {alternative.category}
                          </Badge>
                          <div className="flex items-center space-x-1">
                            {getComplexityIcon(alternative.complexity)}
                            <Badge 
                              variant="outline" 
                              className={cn("text-xs", getComplexityColor(alternative.complexity))}
                            >
                              {alternative.complexity} complexity
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600">
                          {alternative.patientFriendlyDescription}
                        </p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                          <div>
                            <span className="text-gray-500">Effectiveness:</span>
                            <div className="font-medium text-green-600">{alternative.effectiveness}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Duration:</span>
                            <div className="font-medium">{alternative.typicalDuration}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Cost Range:</span>
                            <div className="font-medium">{alternative.costRange}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Best For:</span>
                            <div className="font-medium">Multiple conditions</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleService(alternative.id);
                          }}
                        >
                          <ChevronDownIcon 
                            className={cn(
                              "h-4 w-4 transition-transform",
                              isExpanded ? "rotate-180" : ""
                            )}
                          />
                        </Button>
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                        {/* Key Differences */}
                        <div>
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Key Differences</h5>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {alternative.differences.map((diff, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                                <span>{diff}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        {/* Benefits vs Considerations */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <h5 className="text-sm font-medium text-green-700">Benefits</h5>
                            <ul className="text-sm text-green-600 space-y-1">
                              {alternative.benefits.map((benefit, index) => (
                                <li key={index} className="flex items-start space-x-2">
                                  <CheckCircleIcon className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span>{benefit}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="space-y-2">
                            <h5 className="text-sm font-medium text-orange-700">Considerations</h5>
                            <ul className="text-sm text-orange-600 space-y-1">
                              {alternative.considerations.map((consideration, index) => (
                                <li key={index} className="flex items-start space-x-2">
                                  <InformationCircleIcon className="h-3 w-3 text-orange-500 mt-0.5 flex-shrink-0" />
                                  <span>{consideration}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        {/* Suitable For */}
                        <div>
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Most Suitable For</h5>
                          <div className="flex flex-wrap gap-2">
                            {alternative.suitableFor.map((criteria, index) => (
                              <Badge key={index} variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                {criteria}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        {/* When Recommended */}
                        {alternative.recommendedWhen && alternative.recommendedWhen.length > 0 && (
                          <div className="bg-green-50 p-3 rounded border border-green-200">
                            <h5 className="text-sm font-medium text-green-800 mb-1">Recommended When</h5>
                            <ul className="text-sm text-green-700 space-y-1">
                              {alternative.recommendedWhen.map((reason, index) => (
                                <li key={index}>• {reason}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* When Not Recommended */}
                        {alternative.notRecommendedWhen && alternative.notRecommendedWhen.length > 0 && (
                          <div className="bg-red-50 p-3 rounded border border-red-200">
                            <h5 className="text-sm font-medium text-red-800 mb-1">Not Recommended When</h5>
                            <ul className="text-sm text-red-700 space-y-1">
                              {alternative.notRecommendedWhen.map((reason, index) => (
                                <li key={index}>• {reason}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* Action Buttons */}
                        <div className="flex space-x-2 pt-2">
                          <Button size="sm" className="flex-1">
                            Learn More
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            Discuss with Doctor
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Decision Support */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
              <UserGroupIcon className="h-4 w-4" />
              <span>Need Help Choosing?</span>
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              Our healthcare providers can help you understand these options and recommend the best approach for your specific situation.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" size="sm">
                Schedule Consultation
              </Button>
              <Button variant="outline" size="sm">
                Call for Advice
              </Button>
              <Button variant="outline" size="sm">
                Download Comparison Guide
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}