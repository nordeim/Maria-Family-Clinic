"use client";

import React from 'react';
import { useService } from '@/hooks/use-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CurrencyDollarIcon, 
  ShieldCheckIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface ServicePricingSectionProps {
  serviceId: string;
}

export function ServicePricingSection({ serviceId }: ServicePricingSectionProps) {
  const { data: service, isLoading } = useService(serviceId);

  if (isLoading || !service) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="h-64 bg-gray-200 rounded" />
      </div>
    );
  }

  // Default pricing if no data from API
  const pricingData = {
    basePrice: service.priceRangeMin || 50,
    maxPrice: service.priceRangeMax || 200,
    currency: service.currency || 'SGD',
    healthierSGCovered: service.isHealthierSGCovered,
    healthierSGPrice: service.healthierSGPrice || null,
    insuranceCoverage: service.insuranceCoverage || {
      'Medisave': { coverage: 'Partial', description: 'Up to $300 from Medisave' },
      'Medishield': { coverage: 'Partial', description: 'Subject to deductibles' },
      'Private Insurance': { coverage: 'Variable', description: 'Check with your provider' },
    },
  };

  const getCoverageColor = (coverage: string) => {
    switch (coverage.toLowerCase()) {
      case 'full':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'none':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: pricingData.currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Pricing Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CurrencyDollarIcon className="h-5 w-5 text-green-500" />
            <span>Pricing Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Pricing</TabsTrigger>
              <TabsTrigger value="insurance">Insurance Coverage</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="text-center space-y-4">
                <div className="p-6 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-gray-900">
                    {pricingData.basePrice === pricingData.maxPrice 
                      ? formatPrice(pricingData.basePrice)
                      : `${formatPrice(pricingData.basePrice)} - ${formatPrice(pricingData.maxPrice)}`
                    }
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Estimated cost for {service.name}
                  </p>
                </div>

                {/* Healthier SG Pricing */}
                {pricingData.healthierSGCovered && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-blue-900">Healthier SG Coverage</h4>
                        <p className="text-sm text-blue-700">
                          Eligible for Healthier SG program benefits
                        </p>
                      </div>
                      <Badge variant="default" className="bg-blue-600">
                        Covered
                      </Badge>
                    </div>
                    {pricingData.healthierSGPrice && (
                      <div className="mt-2 text-blue-800">
                        <span className="text-lg font-medium">
                          {formatPrice(pricingData.healthierSGPrice)}
                        </span>
                        <span className="text-sm ml-1">with Healthier SG</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Additional Information */}
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <InformationCircleIcon className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Important Pricing Notes:</p>
                      <ul className="space-y-1 text-xs">
                        <li>• Final cost may vary based on individual treatment complexity</li>
                        <li>• Additional charges may apply for specialized procedures or complications</li>
                        <li>• Payment plans available for eligible patients</li>
                        <li>• Early bird discounts may apply for advance bookings</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="insurance" className="space-y-4">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Insurance Coverage Options</h4>
                
                {Object.entries(pricingData.insuranceCoverage).map(([provider, coverage]) => (
                  <div key={provider} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900">{provider}</h5>
                      <Badge 
                        variant="outline"
                        className={getCoverageColor(coverage.coverage)}
                      >
                        {coverage.coverage}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{coverage.description}</p>
                  </div>
                ))}

                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium mb-1">Insurance Verification</p>
                      <p>
                        We recommend verifying your coverage with your insurance provider before your appointment. 
                        Our staff can assist with pre-authorization and benefit verification.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
            <Button variant="outline" className="flex-1">
              <ShieldCheckIcon className="h-4 w-4 mr-2" />
              Verify Insurance Coverage
            </Button>
            <Button variant="outline" className="flex-1">
              Request Cost Estimate
            </Button>
            <Button className="flex-1">
              Check Available Dates
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Options */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              'Cash',
              'Credit/Debit Cards',
              'NETS',
              'Medisave',
              'PayNow',
              'Bank Transfer',
            ].map((method) => (
              <div key={method} className="text-center p-3 border border-gray-200 rounded-lg">
                <div className="text-sm font-medium text-gray-900">{method}</div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-xs text-gray-500 text-center">
            Additional payment methods may be available. Contact us for details.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}