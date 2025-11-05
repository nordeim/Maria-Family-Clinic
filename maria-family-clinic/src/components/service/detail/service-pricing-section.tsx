"use client";

import React, { useState } from 'react';
import { useServiceData } from '@/hooks/use-service-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  CurrencyDollarIcon,
  ChevronDownIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ClockIcon,
  PhoneIcon,
  CalculatorIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface ServicePricingSectionProps {
  category: string;
  serviceSlug: string;
  locale: string;
}

interface PricingOption {
  id: string;
  name: string;
  price: number;
  currency: string;
  originalPrice?: number;
  discount?: number;
  includes: string[];
  duration?: string;
  guarantee?: string;
  popular?: boolean;
  requirements?: string[];
}

interface InsuranceCoverage {
  provider: string;
  coverageType: 'full' | 'partial' | 'none';
  copay?: number;
  deductible?: number;
  coveragePercentage?: number;
  priorAuthRequired?: boolean;
  notes?: string;
  maxAnnualBenefit?: number;
}

export function ServicePricingSection({ category, serviceSlug, locale }: ServicePricingSectionProps) {
  const { data: service, isLoading } = useServiceData(category, serviceSlug, locale);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showPaymentPlans, setShowPaymentPlans] = useState(false);
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="h-64 bg-gray-200 rounded" />
      </div>
    );
  }

  if (!service) return null;

  // Mock pricing options (would come from service data)
  const pricingOptions: PricingOption[] = [
    {
      id: 'standard',
      name: 'Standard Care',
      price: 120,
      currency: 'SGD',
      includes: [
        'Initial consultation',
        'Diagnostic assessment',
        'Treatment planning',
        'Follow-up call within 48 hours',
        'Basic post-care instructions'
      ],
      duration: '60 minutes',
      guarantee: 'Satisfaction guarantee with re-consultation if needed'
    },
    {
      id: 'comprehensive',
      name: 'Comprehensive Care',
      price: 180,
      currency: 'SGD',
      includes: [
        'All standard care features',
        'Detailed medical report',
        'Extended consultation time',
        '2-week follow-up care',
        '24/7 nurse hotline access',
        'Digital health records access'
      ],
      duration: '90 minutes',
      guarantee: 'Comprehensive care with unlimited follow-up for 2 weeks',
      popular: true
    },
    {
      id: 'premium',
      name: 'Premium Care',
      price: 280,
      currency: 'SGD',
      includes: [
        'All comprehensive care features',
        'Specialist consultation included',
        'Priority scheduling',
        '1-month follow-up care',
        'Personalized care coordinator',
        'Home visit option within 24 hours',
        'Lifestyle and wellness coaching'
      ],
      duration: '120 minutes',
      guarantee: 'Premium experience with dedicated care team'
    }
  ];

  // Mock insurance coverage data
  const insuranceCoverage: InsuranceCoverage[] = [
    {
      provider: 'Medisave',
      coverageType: 'partial',
      coveragePercentage: 80,
      copay: 20,
      deductible: 0,
      maxAnnualBenefit: 1200,
      notes: 'Subject to annual withdrawal limits. Some procedures may require pre-authorization.'
    },
    {
      provider: 'Medishield',
      coverageType: 'partial',
      coveragePercentage: 70,
      copay: 30,
      deductible: 1500,
      maxAnnualBenefit: 5000,
      priorAuthRequired: true,
      notes: 'Coverage depends on procedure classification and individual policy limits.'
    },
    {
      provider: 'Private Insurance',
      coverageType: 'full',
      copay: 0,
      deductible: 0,
      priorAuthRequired: false,
      notes: 'Many private insurance plans provide full coverage. Contact your provider for specific terms.'
    },
    {
      provider: 'Corporate Insurance',
      coverageType: 'partial',
      coveragePercentage: 90,
      copay: 10,
      notes: 'Coverage varies by employer plan. Check with your HR department for specific benefits.'
    },
    {
      provider: 'Self-Pay',
      coverageType: 'none',
      notes: 'Payment plans and discounts available for self-paying patients. Contact us for details.'
    }
  ];

  const paymentPlans = [
    {
      name: 'Pay Per Visit',
      description: 'Pay in full at the time of service',
      discount: '0%',
      interestRate: '0%'
    },
    {
      name: '3-Month Plan',
      description: 'Spread cost over 3 months',
      discount: '5%',
      interestRate: '0%'
    },
    {
      name: '6-Month Plan',
      description: 'Spread cost over 6 months',
      discount: '8%',
      interestRate: '0%'
    },
    {
      name: '12-Month Plan',
      description: 'Spread cost over 12 months',
      discount: '12%',
      interestRate: '0%'
    }
  ];

  const calculateOutOfPocket = (option: PricingOption, coverage: InsuranceCoverage) => {
    if (coverage.coverageType === 'none') return option.price;
    if (coverage.coverageType === 'full') return coverage.copay || 0;
    
    const coverageAmount = option.price * (coverage.coveragePercentage || 0) / 100;
    return option.price - coverageAmount + (coverage.copay || 0);
  };

  const getCoverageColor = (type: string) => {
    switch (type) {
      case 'full': return 'text-green-700 bg-green-100';
      case 'partial': return 'text-yellow-700 bg-yellow-100';
      case 'none': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getCoverageIcon = (type: string) => {
    switch (type) {
      case 'full': return <CheckCircleIcon className="h-4 w-4" />;
      case 'partial': return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'none': return <InformationCircleIcon className="h-4 w-4" />;
      default: return <InformationCircleIcon className="h-4 w-4" />;
    }
  };

  return (
    <div id="pricing" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CurrencyDollarIcon className="h-5 w-5 text-green-500" />
            <span>Pricing & Insurance Coverage</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Transparent pricing options and insurance coverage information
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="options" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="options">Service Options</TabsTrigger>
              <TabsTrigger value="insurance">Insurance Coverage</TabsTrigger>
              <TabsTrigger value="payment">Payment Plans</TabsTrigger>
            </TabsList>

            {/* Service Options Tab */}
            <TabsContent value="options" className="space-y-4">
              <div className="grid gap-4">
                {pricingOptions.map((option) => (
                  <Card 
                    key={option.id} 
                    className={cn(
                      "cursor-pointer transition-all duration-200",
                      option.popular ? "border-blue-500 shadow-md" : "border-gray-200 hover:border-gray-300",
                      selectedOption === option.id ? "ring-2 ring-blue-500" : ""
                    )}
                    onClick={() => setSelectedOption(selectedOption === option.id ? null : option.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium text-gray-900">{option.name}</h4>
                            {option.popular && (
                              <Badge variant="default" className="bg-blue-600">Most Popular</Badge>
                            )}
                            {option.originalPrice && (
                              <Badge variant="outline" className="text-green-700">
                                Save {option.discount}%
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-baseline space-x-2 mb-3">
                            <span className="text-2xl font-bold text-gray-900">
                              {option.currency} {option.price}
                            </span>
                            {option.originalPrice && (
                              <span className="text-lg text-gray-500 line-through">
                                {option.currency} {option.originalPrice}
                              </span>
                            )}
                            {option.duration && (
                              <span className="text-sm text-gray-600">({option.duration})</span>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <h5 className="text-sm font-medium text-gray-700">Includes:</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {option.includes.map((item, index) => (
                                <li key={index} className="flex items-center space-x-2">
                                  <CheckCircleIcon className="h-3 w-3 text-green-500 flex-shrink-0" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          {option.guarantee && (
                            <div className="mt-3 p-2 bg-blue-50 rounded text-sm text-blue-700">
                              <strong>Guarantee:</strong> {option.guarantee}
                            </div>
                          )}
                        </div>
                        
                        <ChevronDownIcon 
                          className={cn(
                            "h-4 w-4 text-gray-400 transition-transform",
                            selectedOption === option.id ? "rotate-180" : ""
                          )}
                        />
                      </div>
                      
                      {selectedOption === option.id && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h5 className="text-sm font-medium text-gray-700 mb-2">Requirements</h5>
                              {option.requirements ? (
                                <ul className="text-sm text-gray-600 space-y-1">
                                  {option.requirements.map((req, index) => (
                                    <li key={index}>• {req}</li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-sm text-gray-600">No special requirements</p>
                              )}
                            </div>
                            <div>
                              <h5 className="text-sm font-medium text-gray-700 mb-2">Next Steps</h5>
                              <div className="space-y-2">
                                <Button size="sm" className="w-full">
                                  Book This Package
                                </Button>
                                <Button variant="outline" size="sm" className="w-full">
                                  Learn More
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Insurance Coverage Tab */}
            <TabsContent value="insurance" className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <div className="flex items-start space-x-2">
                  <ShieldCheckIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-800 mb-1">
                      Insurance Information
                    </h4>
                    <p className="text-sm text-blue-700">
                      Coverage varies by insurance provider and plan. Contact your insurance company 
                      to verify specific benefits and coverage limits for this procedure.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {insuranceCoverage.map((coverage, index) => (
                  <Card key={index} className="border border-gray-200">
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <div className="p-4 cursor-pointer hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {getCoverageIcon(coverage.coverageType)}
                              <div>
                                <h4 className="font-medium text-gray-900">{coverage.provider}</h4>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge 
                                    variant="outline" 
                                    className={cn("text-xs", getCoverageColor(coverage.coverageType))}
                                  >
                                    {coverage.coverageType} coverage
                                  </Badge>
                                  {coverage.coveragePercentage && (
                                    <span className="text-xs text-gray-600">
                                      {coverage.coveragePercentage}% coverage
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              {selectedOption && (
                                <div className="text-sm font-medium text-gray-900">
                                  Est. Cost: SGD {calculateOutOfPocket(
                                    pricingOptions.find(p => p.id === selectedOption) || pricingOptions[0], 
                                    coverage
                                  )}
                                </div>
                              )}
                              <ChevronDownIcon className="h-4 w-4 text-gray-400 ml-auto mt-1" />
                            </div>
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent>
                        <div className="px-4 pb-4 border-t border-gray-200">
                          <div className="pt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-2">
                              {coverage.copay !== undefined && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Copay:</span>
                                  <span className="font-medium">SGD {coverage.copay}</span>
                                </div>
                              )}
                              {coverage.deductible !== undefined && coverage.deductible > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Deductible:</span>
                                  <span className="font-medium">SGD {coverage.deductible}</span>
                                </div>
                              )}
                              {coverage.maxAnnualBenefit && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Annual Benefit:</span>
                                  <span className="font-medium">SGD {coverage.maxAnnualBenefit}</span>
                                </div>
                              )}
                              {coverage.priorAuthRequired && (
                                <div className="flex items-center space-x-2 text-amber-600">
                                  <ExclamationTriangleIcon className="h-4 w-4" />
                                  <span>Prior authorization required</span>
                                </div>
                              )}
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-700 mb-1">Notes</h5>
                              <p className="text-sm text-gray-600">{coverage.notes}</p>
                            </div>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                ))}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Insurance Assistance</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Our team can help you understand your insurance benefits and assist with pre-authorization.
                </p>
                <div className="flex items-center space-x-4 text-sm">
                  <Button variant="outline" size="sm">
                    <PhoneIcon className="h-4 w-4 mr-2" />
                    Call Insurance Help
                  </Button>
                  <Button variant="outline" size="sm">
                    Verify Coverage Online
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Payment Plans Tab */}
            <TabsContent value="payment" className="space-y-4">
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <div className="flex items-start space-x-2">
                  <CreditCardIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-green-800 mb-1">
                      Flexible Payment Options
                    </h4>
                    <p className="text-sm text-green-700">
                      Choose a payment plan that works with your budget. No interest charges apply to any plan.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3">
                {paymentPlans.map((plan, index) => (
                  <Card key={index} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{plan.name}</h4>
                          <p className="text-sm text-gray-600">{plan.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-green-600">{plan.discount} Discount</div>
                          <div className="text-xs text-gray-500">{plan.interestRate} Interest</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                  <CalculatorIcon className="h-4 w-4" />
                  <span>Payment Calculator</span>
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">Select Plan:</span>
                    <select className="text-sm border border-gray-300 rounded px-2 py-1">
                      <option>3-Month Plan (5% discount)</option>
                      <option>6-Month Plan (8% discount)</option>
                      <option>12-Month Plan (12% discount)</option>
                    </select>
                  </div>
                  <div className="text-sm text-gray-600">
                    Monthly Payment: <span className="font-medium">SGD 56</span>
                  </div>
                  <Button variant="outline" size="sm">
                    Calculate My Payments
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Important Pricing Notes */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-amber-800 mb-1">
                Important Pricing Information
              </h4>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• Prices are subject to change. Final costs will be confirmed during consultation.</li>
                <li>• Additional tests or procedures may incur extra charges.</li>
                <li>• Insurance coverage is estimated. Actual benefits depend on your specific plan.</li>
                <li>• Payment plans are subject to credit approval.</li>
                <li>• Emergency procedures may have different pricing structures.</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}