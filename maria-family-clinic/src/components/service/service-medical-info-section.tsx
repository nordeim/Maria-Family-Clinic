"use client";

import React, { useState } from 'react';
import { useService } from '@/hooks/use-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ChevronDownIcon, 
  InformationCircleIcon, 
  BookOpenIcon,
  HeartIcon,
  StethoscopeIcon
} from '@heroicons/react/24/outline';

interface ServiceMedicalInfoSectionProps {
  serviceId: string;
}

export function ServiceMedicalInfoSection({ serviceId }: ServiceMedicalInfoSectionProps) {
  const { data: service, isLoading } = useService(serviceId);
  const [expandedTerms, setExpandedTerms] = useState<Set<string>>(new Set());

  if (isLoading || !service) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="h-48 bg-gray-200 rounded" />
      </div>
    );
  }

  const toggleTerm = (term: string) => {
    const newExpanded = new Set(expandedTerms);
    if (newExpanded.has(term)) {
      newExpanded.delete(term);
    } else {
      newExpanded.add(term);
    }
    setExpandedTerms(newExpanded);
  };

  const renderMedicalTerm = (term: string, explanation: string, index: number) => {
    const isExpanded = expandedTerms.has(term);
    
    return (
      <div key={index} className="border border-gray-200 rounded-lg p-4">
        <Collapsible
          open={isExpanded}
          onOpenChange={() => toggleTerm(term)}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between p-0 h-auto text-left"
            >
              <div className="flex items-center space-x-2">
                <BookOpenIcon className="h-4 w-4 text-blue-500" />
                <span className="font-medium text-blue-600">{term}</span>
              </div>
              <ChevronDownIcon 
                className={`h-4 w-4 transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`} 
              />
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-2">
            <p className="text-sm text-gray-700 leading-relaxed pl-6">
              {explanation}
            </p>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  };

  const terminology = service.terminology || {};

  return (
    <div className="space-y-6">
      {/* Medical Description */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <StethoscopeIcon className="h-5 w-5 text-blue-500" />
            <span>Medical Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {service.medicalDescription || 
               "Detailed medical information about this service will be provided by your healthcare provider during consultation."}
            </p>
          </div>
          
          {service.specialtyArea && (
            <div className="mt-4">
              <Badge variant="outline" className="mr-2">
                Specialty: {service.specialtyArea}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Medical Terminology Explanations */}
      {Object.keys(terminology).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <InformationCircleIcon className="h-5 w-5 text-green-500" />
              <span>Medical Terminology Guide</span>
            </CardTitle>
            <p className="text-sm text-gray-600">
              Click on any medical term below to learn more about it in simple language.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(terminology).map(([term, explanation], index) =>
                renderMedicalTerm(term, explanation as string, index)
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Health Literacy Support */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-900">
            <HeartIcon className="h-5 w-5 text-blue-600" />
            <span>Understanding Your Care</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-blue-800">
            <p className="text-sm leading-relaxed">
              <strong>Important:</strong> This information is for educational purposes only and should not replace professional medical advice. 
              Always consult with your healthcare provider about your specific condition and treatment options.
            </p>
            
            <div className="bg-blue-100 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Questions to Ask Your Doctor:</h4>
              <ul className="text-sm space-y-1 text-blue-800">
                <li>• What are the benefits and risks of this treatment?</li>
                <li>• Are there any alternative treatment options?</li>
                <li>• What should I expect during the recovery process?</li>
                <li>• When should I follow up after treatment?</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Multilingual Support */}
      <Card>
        <CardHeader>
          <CardTitle>Language Support</CardTitle>
          <p className="text-sm text-gray-600">
            Information available in multiple languages for better understanding.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { code: 'en', name: 'English', available: true },
              { code: 'zh', name: '中文 (Mandarin)', available: true },
              { code: 'ms', name: 'Bahasa Melayu', available: true },
              { code: 'ta', name: 'தமிழ் (Tamil)', available: true },
            ].map((language) => (
              <div 
                key={language.code} 
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <span className="text-sm font-medium">{language.name}</span>
                <Badge variant={language.available ? "default" : "secondary"}>
                  {language.available ? "Available" : "Coming Soon"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}