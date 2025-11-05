"use client";

import React from 'react';
import { useServiceData } from '@/hooks/use-service-data';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  CheckCircleIcon,
  ClockIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  HeartIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface ServiceDetailHeaderProps {
  category: string;
  serviceSlug: string;
  locale: string;
}

interface ComplexityLevel {
  level: 'BASIC' | 'MODERATE' | 'COMPLEX' | 'SPECIALIZED';
  color: string;
  bgColor: string;
  description: string;
}

const COMPLEXITY_CONFIG: Record<ComplexityLevel['level'], ComplexityLevel> = {
  BASIC: {
    level: 'BASIC',
    color: 'text-green-800',
    bgColor: 'bg-green-100',
    description: 'Simple consultation or minor procedure'
  },
  MODERATE: {
    level: 'MODERATE',
    color: 'text-yellow-800',
    bgColor: 'bg-yellow-100',
    description: 'Standard medical procedure requiring preparation'
  },
  COMPLEX: {
    level: 'COMPLEX',
    color: 'text-orange-800',
    bgColor: 'bg-orange-100',
    description: 'Advanced procedure requiring specialized care'
  },
  SPECIALIZED: {
    level: 'SPECIALIZED',
    color: 'text-red-800',
    bgColor: 'bg-red-100',
    description: 'Highly specialized procedure requiring expert care'
  }
};

export function ServiceDetailHeader({ category, serviceSlug, locale }: ServiceDetailHeaderProps) {
  const { data: service, isLoading, error } = useServiceData(category, serviceSlug, locale);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-20 bg-gray-200 rounded" />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="text-center py-8">
        <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-lg font-medium text-gray-900 mb-2">Service Not Found</h2>
        <p className="text-gray-600">
          The requested service could not be loaded. Please check the URL or try again later.
        </p>
      </div>
    );
  }

  const complexityConfig = COMPLEXITY_CONFIG[service.complexityLevel || 'BASIC'];

  const trustIndicators = [
    {
      icon: ShieldCheckIcon,
      title: 'Medically Verified',
      description: 'Content reviewed by licensed healthcare professionals',
      color: 'text-green-500'
    },
    {
      icon: HeartIcon,
      title: 'Patient-Centered',
      description: 'Focused on patient comfort and understanding',
      color: 'text-pink-500'
    },
    {
      icon: CheckCircleIcon,
      title: 'Quality Assured',
      description: 'Following Singapore healthcare standards',
      color: 'text-blue-500'
    }
  ];

  return (
    <Card className="overflow-hidden shadow-sm">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
            <div className="space-y-3 flex-1">
              {/* Category and Subcategory */}
              <div className="flex items-center space-x-2 flex-wrap">
                <Badge variant="secondary" className="text-xs font-medium">
                  {service.category}
                </Badge>
                {service.subcategory && (
                  <Badge variant="outline" className="text-xs">
                    {service.subcategory}
                  </Badge>
                )}
                {service.isSpecialized && (
                  <Badge variant="default" className="text-xs bg-purple-600">
                    Specialized Care
                  </Badge>
                )}
              </div>

              {/* Service Title */}
              <div className="space-y-2">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                  {service.name}
                </h1>
                
                {/* Patient-friendly description */}
                <p className="text-lg text-gray-600 leading-relaxed max-w-4xl">
                  {service.patientFriendlyDescription || service.description}
                </p>
              </div>

              {/* Key Metrics */}
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                {service.typicalDurationMinutes && (
                  <div className="flex items-center space-x-1">
                    <ClockIcon className="h-4 w-4" />
                    <span className="font-medium">{service.typicalDurationMinutes} minutes</span>
                  </div>
                )}
                
                {service.patientSatisfactionRate && (
                  <div className="flex items-center space-x-1">
                    <StarIcon className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">{service.patientSatisfactionRate}% Satisfaction</span>
                  </div>
                )}

                {service.isHealthierSGCovered && (
                  <Badge variant="default" className="bg-blue-600 text-white">
                    Healthier SG Covered
                  </Badge>
                )}
              </div>
            </div>

            {/* Complexity and Quick Stats */}
            <div className="lg:flex lg:flex-col lg:items-end space-y-4">
              {/* Complexity Level */}
              <div className="text-center lg:text-right">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-sm px-3 py-1 font-medium mb-2",
                    complexityConfig.bgColor,
                    complexityConfig.color
                  )}
                >
                  {complexityConfig.level} Level
                </Badge>
                <p className="text-xs text-gray-500 max-w-32 lg:max-w-40">
                  {complexityConfig.description}
                </p>
              </div>

              {/* Medical Specialty */}
              {service.specialty && (
                <div className="text-center lg:text-right">
                  <div className="text-sm font-medium text-gray-700">Specialty</div>
                  <div className="text-xs text-gray-600">{service.specialty}</div>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          {service.tags && service.tags.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">Related Topics</div>
              <div className="flex flex-wrap gap-2">
                {service.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-gray-50">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            {trustIndicators.map((indicator, index) => {
              const Icon = indicator.icon;
              return (
                <div key={index} className="flex items-start space-x-3">
                  <Icon className={cn("h-5 w-5 mt-0.5", indicator.color)} />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {indicator.title}
                    </div>
                    <div className="text-xs text-gray-600">
                      {indicator.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Medical Disclaimers */}
          {(service.requiresSpecialPreparation || service.hasRiskFactors) && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <div className="flex items-start space-x-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-yellow-800">
                    Important Medical Information
                  </h4>
                  <div className="text-sm text-yellow-700 space-y-1">
                    {service.requiresSpecialPreparation && (
                      <p>• This service requires special preparation. Please review the preparation checklist carefully.</p>
                    )}
                    {service.hasRiskFactors && (
                      <p>• This procedure has specific risk factors. Your doctor will discuss these with you during consultation.</p>
                    )}
                    <p className="text-xs font-medium mt-2">
                      Always consult with your healthcare provider for personalized medical advice.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}