"use client";

import React, { useState } from 'react';
import { useServiceData } from '@/hooks/use-service-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BookOpenIcon,
  ChevronDownIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  QuestionMarkCircleIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  HeartIcon,
  BeakerIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface ServiceMedicalInfoSectionProps {
  category: string;
  serviceSlug: string;
  locale: string;
}

interface MedicalTerm {
  term: string;
  definition: string;
  patientFriendlyExplanation: string;
  relatedTerms?: string[];
}

interface RiskFactor {
  factor: string;
  severity: 'low' | 'moderate' | 'high';
  description: string;
  mitigation?: string;
}

export function ServiceMedicalInfoSection({ category, serviceSlug, locale }: ServiceMedicalInfoSectionProps) {
  const { data: service, isLoading } = useServiceData(category, serviceSlug, locale);
  const [expandedTerms, setExpandedTerms] = useState<Set<string>>(new Set());

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="h-96 bg-gray-200 rounded" />
      </div>
    );
  }

  if (!service) return null;

  // Medical terminology data (would come from API/database)
  const medicalTerms: MedicalTerm[] = service.medicalTerms || [
    {
      term: 'Anesthesia',
      definition: 'Medication administered to prevent pain during surgical procedures.',
      patientFriendlyExplanation: 'Medicine that makes you sleep or numbs part of your body so you don\'t feel pain during your procedure.',
      relatedTerms: ['Local Anesthesia', 'General Anesthesia', 'Sedation']
    },
    {
      term: 'Biopsy',
      definition: 'A diagnostic procedure involving removal of tissue for examination.',
      patientFriendlyExplanation: 'Taking a small sample of tissue to look at under a microscope to help diagnose a condition.',
      relatedTerms: ['Pathology', 'Sample', 'Tissue Analysis']
    },
    {
      term: 'Endoscopy',
      definition: 'A procedure using a flexible tube with a camera to examine internal organs.',
      patientFriendlyExplanation: 'A thin, flexible tube with a tiny camera that lets doctors see inside your body without major surgery.',
    },
    {
      term: 'Sterilization',
      definition: 'The process of eliminating all microorganisms from equipment or surfaces.',
      patientFriendlyExplanation: 'Special cleaning and disinfection to ensure no germs are present on medical instruments.',
    }
  ];

  const riskFactors: RiskFactor[] = service.riskFactors || [
    {
      factor: 'Infection Risk',
      severity: 'low',
      description: 'Small risk of infection at the procedure site.',
      mitigation: 'Proper sterile technique and post-procedure care reduce this risk significantly.'
    },
    {
      factor: 'Bleeding',
      severity: 'low',
      description: 'Minor bleeding is normal but usually stops quickly.',
      mitigation: 'Doctors use special techniques to minimize bleeding and monitor for complications.'
    },
    {
      factor: 'Allergic Reaction',
      severity: 'moderate',
      description: 'Rare allergic reactions to medications or materials used.',
      mitigation: 'Detailed medical history and allergy testing help prevent most allergic reactions.'
    }
  ];

  const treatmentOptions = service.treatmentOptions || [
    {
      name: 'Conservative Treatment',
      description: 'Non-surgical approaches including medication, physical therapy, and lifestyle modifications.',
      suitability: 'Often recommended as first-line treatment for many conditions.',
      effectiveness: '85-95% success rate for appropriate cases'
    },
    {
      name: 'Minimally Invasive Procedure',
      description: 'Small incisions with specialized instruments and camera guidance.',
      suitability: 'Suitable for patients who need treatment but want faster recovery.',
      effectiveness: '90-98% success rate with reduced recovery time'
    },
    {
      name: 'Traditional Surgery',
      description: 'Open surgical procedure when minimally invasive options are not suitable.',
      suitability: 'Reserved for complex cases or when other treatments are not appropriate.',
      effectiveness: 'High success rate for complex procedures'
    }
  ];

  const toggleTerm = (term: string) => {
    const newExpanded = new Set(expandedTerms);
    if (newExpanded.has(term)) {
      newExpanded.delete(term);
    } else {
      newExpanded.add(term);
    }
    setExpandedTerms(newExpanded);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-700 bg-green-100';
      case 'moderate': return 'text-yellow-700 bg-yellow-100';
      case 'high': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low': return <ShieldCheckIcon className="h-4 w-4 text-green-500" />;
      case 'moderate': return <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />;
      case 'high': return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
      default: return <InformationCircleIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div id="medical-info" className="space-y-6">
      {/* Medical Terminology Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpenIcon className="h-5 w-5 text-blue-500" />
            <span>Medical Terminology Guide</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Understanding the medical terms used in your {service.name} procedure
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <div className="flex items-start space-x-2">
                <LightBulbIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800 mb-1">
                    Health Literacy Support
                  </h4>
                  <p className="text-sm text-blue-700">
                    All medical terms are explained in plain language. Don't hesitate to ask your 
                    healthcare provider for clarification during your consultation.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {medicalTerms.map((term, index) => {
                const isExpanded = expandedTerms.has(term.term);
                
                return (
                  <Collapsible key={index}>
                    <div className="border border-gray-200 rounded-lg">
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          className="w-full p-4 h-auto justify-start"
                          onClick={() => toggleTerm(term.term)}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="text-left">
                              <div className="font-medium text-gray-900">{term.term}</div>
                              <div className="text-sm text-gray-600">
                                {term.patientFriendlyExplanation}
                              </div>
                            </div>
                            <ChevronDownIcon 
                              className={cn(
                                "h-4 w-4 text-gray-400 transition-transform",
                                isExpanded ? "rotate-180" : ""
                              )}
                            />
                          </div>
                        </Button>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <div className="px-4 pb-4 border-t border-gray-200">
                          <div className="space-y-3 pt-3">
                            <div>
                              <h5 className="text-sm font-medium text-gray-900 mb-1">Medical Definition</h5>
                              <p className="text-sm text-gray-700">{term.definition}</p>
                            </div>
                            
                            {term.relatedTerms && term.relatedTerms.length > 0 && (
                              <div>
                                <h5 className="text-sm font-medium text-gray-900 mb-2">Related Terms</h5>
                                <div className="flex flex-wrap gap-2">
                                  {term.relatedTerms.map((relatedTerm, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {relatedTerm}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Factors Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
            <span>Risk Factors & Safety</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Understanding potential risks and how they are minimized
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <div className="flex items-start space-x-2">
                <InformationCircleIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800 mb-1">
                    Important Safety Information
                  </h4>
                  <p className="text-sm text-yellow-700">
                    All medical procedures carry some risk. Our healthcare providers take extensive 
                    precautions to minimize risks and ensure your safety. Your doctor will discuss 
                    specific risks related to your individual situation.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {riskFactors.map((risk, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getSeverityIcon(risk.severity)}
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900">{risk.factor}</h4>
                          <Badge 
                            className={cn(
                              "text-xs px-2 py-1",
                              getSeverityColor(risk.severity)
                            )}
                          >
                            {risk.severity} risk
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{risk.description}</p>
                        {risk.mitigation && (
                          <div className="bg-green-50 p-2 rounded text-sm">
                            <strong className="text-green-800">How we minimize this risk:</strong>
                            <span className="text-green-700 ml-1">{risk.mitigation}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Treatment Options Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BeakerIcon className="h-5 w-5 text-purple-500" />
            <span>Treatment Options</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Different approaches available for your condition
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
              <div className="flex items-start space-x-2">
                <HeartIcon className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-purple-800 mb-1">
                    Personalized Treatment Plan
                  </h4>
                  <p className="text-sm text-purple-700">
                    Your healthcare provider will recommend the most appropriate treatment option 
                    based on your specific condition, medical history, and personal preferences.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {treatmentOptions.map((option, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">{option.name}</h4>
                    <p className="text-sm text-gray-600">{option.description}</p>
                    
                    <div className="space-y-2">
                      <div className="text-sm">
                        <strong className="text-gray-700">Best for:</strong>
                        <span className="text-gray-600 ml-1">{option.suitability}</span>
                      </div>
                      
                      <div className="text-sm">
                        <strong className="text-gray-700">Success rate:</strong>
                        <span className="text-green-600 ml-1 font-medium">{option.effectiveness}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medical Standards Compliance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ShieldCheckIcon className="h-5 w-5 text-green-500" />
            <span>Medical Standards & Compliance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Singapore Healthcare Standards</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Ministry of Health (MOH) guidelines compliance</li>
                  <li>• Singapore Medical Council standards</li>
                  <li>• Healthcare Quality Assessment standards</li>
                  <li>• Patient Safety and Quality Improvement protocols</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">International Best Practices</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• WHO Patient Safety guidelines</li>
                  <li>• Joint Commission International standards</li>
                  <li>• Evidence-based medical protocols</li>
                  <li>• Continuous quality improvement programs</li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <DocumentTextIcon className="h-4 w-4 text-gray-600" />
                <h5 className="text-sm font-medium text-gray-900">Medical Accuracy Disclaimer</h5>
              </div>
              <p className="text-xs text-gray-600">
                All medical information presented is current as of the last review date and has been 
                verified by qualified healthcare professionals. Medical knowledge evolves constantly, 
                and individual medical situations require personalized professional advice. Always 
                consult with your healthcare provider for the most current and personalized medical guidance.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}