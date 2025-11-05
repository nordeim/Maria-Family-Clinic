"use client";

import React from 'react';
import { ClockIcon, TagIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useService } from '@/hooks/use-service';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ServiceDetailHeaderProps {
  serviceId: string;
}

export function ServiceDetailHeader({ serviceId }: ServiceDetailHeaderProps) {
  const { data: service, isLoading } = useService(serviceId);

  if (isLoading || !service) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-20 bg-gray-200 rounded" />
      </div>
    );
  }

  const complexityColors = {
    BASIC: 'bg-green-100 text-green-800',
    MODERATE: 'bg-yellow-100 text-yellow-800',
    COMPLEX: 'bg-orange-100 text-orange-800',
    SPECIALIZED: 'bg-red-100 text-red-800',
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Service Title and Category */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-xs">
                  {service.category}
                </Badge>
                {service.subcategory && (
                  <Badge variant="outline" className="text-xs">
                    {service.subcategory}
                  </Badge>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900">
                {service.name}
              </h1>
              
              <p className="text-lg text-gray-600 max-w-3xl">
                {service.patientFriendlyDesc || service.description}
              </p>
            </div>

            {/* Complexity and Quick Stats */}
            <div className="flex flex-col space-y-2 mt-4 lg:mt-0">
              <Badge
                variant="outline"
                className={cn(
                  "w-fit",
                  complexityColors[service.complexityLevel]
                )}
              >
                {service.complexityLevel} Level
              </Badge>
              
              {service.typicalDurationMin && (
                <div className="flex items-center text-sm text-gray-600">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  <span>{service.typicalDurationMin} minutes</span>
                </div>
              )}
              
              {service.isHealthierSGCovered && (
                <Badge variant="default" className="w-fit bg-blue-600">
                  Healthier SG Covered
                </Badge>
              )}
            </div>
          </div>

          {/* Tags */}
          {service.tags && service.tags.length > 0 && (
            <div className="flex items-center space-x-2">
              <TagIcon className="h-4 w-4 text-gray-400" />
              <div className="flex flex-wrap gap-2">
                {service.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Trust Indicators */}
          <div className="flex items-center space-x-6 pt-4 border-t border-gray-200">
            <div className="flex items-center text-sm text-gray-600">
              <CheckCircleIcon className="h-4 w-4 mr-1 text-green-500" />
              <span>Medically Verified</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <CheckCircleIcon className="h-4 w-4 mr-1 text-green-500" />
              <span>Accredited Providers</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <CheckCircleIcon className="h-4 w-4 mr-1 text-green-500" />
              <span>Quality Assured</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}