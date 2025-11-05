"use client";

import React from 'react';
import { InformationCircleIcon, HeartIcon } from '@heroicons/react/24/outline';
import { useService } from '@/hooks/use-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface ServiceOverviewSectionProps {
  serviceId: string;
}

export function ServiceOverviewSection({ serviceId }: ServiceOverviewSectionProps) {
  const { data: service, isLoading } = useService(serviceId);
  const [isOverviewExpanded, setIsOverviewExpanded] = React.useState(false);
  const [isMedicalInfoExpanded, setIsMedicalInfoExpanded] = React.useState(false);

  if (isLoading || !service) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/4" />
        <div className="h-32 bg-gray-200 rounded" />
      </div>
    );
  }

  const getSuccessRateInfo = () => {
    if (!service.successRates) return null;
    
    return Object.entries(service.successRates).map(([metric, value]) => ({
      metric,
      value: typeof value === 'string' ? value : `${value}%`,
    }));
  };

  const successRates = getSuccessRateInfo();

  return (
    <div className="space-y-6">
      {/* Patient-Friendly Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <HeartIcon className="h-5 w-5 text-pink-500" />
            <span>What to Expect</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Collapsible
            open={isOverviewExpanded}
            onOpenChange={setIsOverviewExpanded}
          >
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                {service.patientFriendlyDesc || service.description}
              </p>
              
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="p-0 h-auto">
                  <span className="text-blue-600 hover:text-blue-700 font-medium">
                    {isOverviewExpanded ? 'Show Less' : 'Read More'}
                  </span>
                  <ChevronDownIcon 
                    className={`ml-1 h-4 w-4 transition-transform ${
                      isOverviewExpanded ? 'rotate-180' : ''
                    }`} 
                  />
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="space-y-4">
                {service.patientFriendlyDesc && (
                  <p className="text-gray-700 leading-relaxed">
                    {service.description}
                  </p>
                )}
                
                {service.tags && service.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {service.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CollapsibleContent>
            </div>
          </Collapsible>
        </CardContent>
      </Card>

      {/* Success Rates and Outcomes */}
      {successRates && successRates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <InformationCircleIcon className="h-5 w-5 text-blue-500" />
              <span>Success Rates & Outcomes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {successRates.map((rate, index) => (
                <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {rate.value}
                  </div>
                  <div className="text-sm text-gray-600 capitalize">
                    {rate.metric.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                </div>
              ))}
            </div>
            
            <p className="text-xs text-gray-500 mt-4">
              * Success rates are based on clinical studies and may vary based on individual patient factors.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Key Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Key Benefits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'Evidence-based treatment',
              'Qualified healthcare professionals',
              'Personalized care plans',
              'Comprehensive follow-up support',
            ].map((benefit, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}