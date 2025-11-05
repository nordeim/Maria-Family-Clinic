import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { 
  Package, 
  Calendar, 
  Clock, 
  Star,
  CheckCircle,
  AlertCircle,
  TrendingDown,
  Gift,
  Shield,
  Users,
  ArrowRight,
  Zap,
  Award,
  Heart
} from 'lucide-react';
import { cn } from '~/lib/utils';

export interface ServicePackagesBundleProps {
  serviceId: string;
  availableClinics: Array<{
    id: string;
    name: string;
    address: string;
    rating?: number;
    reviewCount?: number;
    packageDiscounts?: number;
  }>;
}

export interface ServicePackage {
  id: string;
  name: string;
  description: string;
  category: 'individual' | 'combo' | 'premium' | 'family' | 'preventive';
  services: Array<{
    id: string;
    name: string;
    description: string;
    originalPrice: number;
    duration: number;
  }>;
  clinicId: string;
  clinicName: string;
  packagePrice: number;
  originalPrice: number;
  savings: number;
  savingsPercentage: number;
  validityPeriod: number; // days
  maxBookings: number;
  currentBookings: number;
  isHealthierSGCovered: boolean;
  restrictions: string[];
  benefits: string[];
  includesFollowUps: boolean;
  priorityBooking: boolean;
  enhancedCare: boolean;
  startDate?: Date;
  endDate?: Date;
  popular: boolean;
  tags: string[];
}

export function ServicePackagesBundle({
  serviceId,
  availableClinics
}: ServicePackagesBundleProps) {
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<'all' | ServicePackage['category']>('all');

  // Mock data for packages - in real app this would come from tRPC
  const packages: ServicePackage[] = [
    {
      id: 'pkg-1',
      name: 'Complete Health Screening',
      description: 'Comprehensive health check-up with blood tests and specialist consultation',
      category: 'combo',
      services: [
        {
          id: 'svc-1',
          name: 'General Consultation',
          description: 'Comprehensive medical examination',
          originalPrice: 80,
          duration: 30
        },
        {
          id: 'svc-2',
          name: 'Blood Test Panel',
          description: 'Complete blood count and chemistry',
          originalPrice: 120,
          duration: 15
        },
        {
          id: 'svc-3',
          name: 'ECG',
          description: 'Electrocardiogram screening',
          originalPrice: 60,
          duration: 20
        }
      ],
      clinicId: 'clinic-1',
      clinicName: 'Central Family Clinic',
      packagePrice: 200,
      originalPrice: 260,
      savings: 60,
      savingsPercentage: 23,
      validityPeriod: 30,
      maxBookings: 100,
      currentBookings: 47,
      isHealthierSGCovered: true,
      restrictions: ['Valid for ages 18-65', 'Fasting required for blood tests'],
      benefits: [
        'Priority booking slots',
        'Free follow-up consultation',
        'Digital health report',
        'Nutrition consultation included'
      ],
      includesFollowUps: true,
      priorityBooking: true,
      enhancedCare: true,
      popular: true,
      tags: ['popular', 'comprehensive', 'healthier-sg']
    },
    {
      id: 'pkg-2',
      name: 'Cardiac Health Package',
      description: 'Specialized heart health assessment with cardiology consultation',
      category: 'premium',
      services: [
        {
          id: 'svc-4',
          name: 'Cardiology Consultation',
          description: 'Specialist heart examination',
          originalPrice: 150,
          duration: 45
        },
        {
          id: 'svc-5',
          name: 'Cardiac Stress Test',
          description: 'Exercise stress test',
          originalPrice: 200,
          duration: 60
        },
        {
          id: 'svc-6',
          name: 'Echocardiogram',
          description: 'Heart ultrasound imaging',
          originalPrice: 180,
          duration: 30
        }
      ],
      clinicId: 'clinic-2',
      clinicName: 'Advanced Heart Center',
      packagePrice: 400,
      originalPrice: 530,
      savings: 130,
      savingsPercentage: 25,
      validityPeriod: 60,
      maxBookings: 50,
      currentBookings: 23,
      isHealthierSGCovered: true,
      restrictions: ['Requires cardiologist approval', 'Not suitable for severe conditions'],
      benefits: [
        'Board-certified cardiologist',
        'Advanced cardiac imaging',
        'Comprehensive report',
        'Lifestyle recommendations'
      ],
      includesFollowUps: true,
      priorityBooking: true,
      enhancedCare: true,
      tags: ['specialized', 'cardiology', 'advanced']
    },
    {
      id: 'pkg-3',
      name: 'Family Wellness Bundle',
      description: 'Complete healthcare solution for families of 4',
      category: 'family',
      services: [
        {
          id: 'svc-7',
          name: 'Pediatric Consultation',
          description: 'Child health examination',
          originalPrice: 70,
          duration: 30
        },
        {
          id: 'svc-8',
          name: 'Adult General Check-up',
          description: 'Comprehensive adult health screening',
          originalPrice: 80,
          duration: 30
        },
        {
          id: 'svc-9',
          name: 'Family Health Education',
          description: 'Health education session',
          originalPrice: 50,
          duration: 45
        }
      ],
      clinicId: 'clinic-1',
      clinicName: 'Central Family Clinic',
      packagePrice: 150,
      originalPrice: 200,
      savings: 50,
      savingsPercentage: 25,
      validityPeriod: 45,
      maxBookings: 30,
      currentBookings: 12,
      isHealthierSGCovered: true,
      restrictions: ['Family of 4 maximum', 'All members must be present'],
      benefits: [
        'Family-friendly scheduling',
        'Child-safe environment',
        'Educational materials',
        'Vaccination consultation'
      ],
      includesFollowUps: false,
      priorityBooking: false,
      enhancedCare: false,
      tags: ['family', 'kids', 'value']
    },
    {
      id: 'pkg-4',
      name: 'Preventive Care Essentials',
      description: 'Essential preventive health measures and screening',
      category: 'preventive',
      services: [
        {
          id: 'svc-10',
          name: 'Annual Health Check',
          description: 'Comprehensive annual examination',
          originalPrice: 90,
          duration: 40
        },
        {
          id: 'svc-11',
          name: 'Vaccination Review',
          description: 'Adult vaccination assessment',
          originalPrice: 40,
          duration: 15
        },
        {
          id: 'svc-12',
          name: 'Health Screening Tests',
          description: 'Essential lab tests',
          originalPrice: 100,
          duration: 15
        }
      ],
      clinicId: 'clinic-1',
      clinicName: 'Central Family Clinic',
      packagePrice: 180,
      originalPrice: 230,
      savings: 50,
      savingsPercentage: 22,
      validityPeriod: 365,
      maxBookings: 200,
      currentBookings: 89,
      isHealthierSGCovered: true,
      restrictions: ['Once per year', 'Valid for adults 18+'],
      benefits: [
        'Annual subscription',
        'Priority scheduling',
        'Health reminders',
        'Digital health records'
      ],
      includesFollowUps: true,
      priorityBooking: true,
      enhancedCare: false,
      tags: ['annual', 'preventive', 'subscription']
    }
  ];

  const filteredPackages = packages.filter(pkg => 
    filterCategory === 'all' || pkg.category === filterCategory
  );

  const formatPrice = (price: number) => `S$${price.toFixed(2)}`;

  const getCategoryIcon = (category: ServicePackage['category']) => {
    switch (category) {
      case 'combo':
        return <Package className="h-5 w-5" />;
      case 'premium':
        return <Award className="h-5 w-5" />;
      case 'family':
        return <Users className="h-5 w-5" />;
      case 'preventive':
        return <Shield className="h-5 w-5" />;
      default:
        return <Heart className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: ServicePackage['category']) => {
    switch (category) {
      case 'combo':
        return 'bg-blue-100 text-blue-800';
      case 'premium':
        return 'bg-purple-100 text-purple-800';
      case 'family':
        return 'bg-green-100 text-green-800';
      case 'preventive':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isPopular = (pkg: ServicePackage) => {
    return pkg.popular || pkg.currentBookings > pkg.maxBookings * 0.7;
  };

  const getUrgencyLabel = (pkg: ServicePackage) => {
    const remaining = pkg.maxBookings - pkg.currentBookings;
    const percentage = (remaining / pkg.maxBookings) * 100;
    
    if (percentage <= 10) return { label: 'Almost Full', color: 'bg-red-100 text-red-800' };
    if (percentage <= 25) return { label: 'Limited Slots', color: 'bg-orange-100 text-orange-800' };
    return { label: 'Available', color: 'bg-green-100 text-green-800' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-6 w-6" />
              Service Packages & Bundles
            </CardTitle>
            <Badge variant="outline" className="text-green-600">
              <TrendingDown className="h-4 w-4 mr-1" />
              Save up to 25%
            </Badge>
          </div>
          <p className="text-gray-600">
            Comprehensive healthcare packages combining multiple services for better value and convenience.
          </p>
        </CardHeader>
      </Card>

      {/* Category Filter */}
      <Tabs value={filterCategory} onValueChange={(value: any) => setFilterCategory(value)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Packages</TabsTrigger>
          <TabsTrigger value="combo">Combos</TabsTrigger>
          <TabsTrigger value="premium">Premium</TabsTrigger>
          <TabsTrigger value="family">Family</TabsTrigger>
          <TabsTrigger value="preventive">Preventive</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPackages.map((pkg) => {
              const urgency = getUrgencyLabel(pkg);
              const popular = isPopular(pkg);

              return (
                <Card 
                  key={pkg.id} 
                  className={cn(
                    "relative overflow-hidden transition-all duration-200 hover:shadow-lg",
                    popular && "border-blue-500 shadow-md",
                    selectedPackageId === pkg.id && "ring-2 ring-blue-500"
                  )}
                >
                  {/* Popular Badge */}
                  {popular && (
                    <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-sm font-medium">
                      <Star className="h-3 w-3 inline mr-1" />
                      Popular
                    </div>
                  )}

                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">{pkg.name}</CardTitle>
                        <p className="text-sm text-gray-600 mb-2">{pkg.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={getCategoryColor(pkg.category)}>
                        {getCategoryIcon(pkg.category)}
                        <span className="ml-1 capitalize">{pkg.category}</span>
                      </Badge>
                      
                      {pkg.isHealthierSGCovered && (
                        <Badge className="bg-green-100 text-green-800">
                          <Shield className="h-3 w-3 mr-1" />
                          Healthier SG
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Price Section */}
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(pkg.originalPrice)}
                        </span>
                        <span className="text-3xl font-bold text-green-600">
                          {formatPrice(pkg.packagePrice)}
                        </span>
                      </div>
                      <div className="text-sm text-green-700 font-medium">
                        Save {formatPrice(pkg.savings)} ({pkg.savingsPercentage}% off)
                      </div>
                    </div>

                    {/* Services Included */}
                    <div>
                      <h4 className="font-medium mb-2">Package Includes:</h4>
                      <div className="space-y-2">
                        {pkg.services.map((service, index) => (
                          <div key={service.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>{service.name}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-gray-500 line-through text-xs">
                                {formatPrice(service.originalPrice)}
                              </div>
                              <div className="text-gray-700">
                                {Math.floor(service.duration / 60)}h {service.duration % 60}m
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap gap-1">
                      {pkg.includesFollowUps && (
                        <Badge variant="outline" className="text-xs">
                          <Calendar className="h-3 w-3 mr-1" />
                          Follow-ups
                        </Badge>
                      )}
                      {pkg.priorityBooking && (
                        <Badge variant="outline" className="text-xs">
                          <Zap className="h-3 w-3 mr-1" />
                          Priority
                        </Badge>
                      )}
                      {pkg.enhancedCare && (
                        <Badge variant="outline" className="text-xs">
                          <Award className="h-3 w-3 mr-1" />
                          Enhanced Care
                        </Badge>
                      )}
                    </div>

                    {/* Availability */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {pkg.currentBookings}/{pkg.maxBookings} booked
                      </span>
                      <Badge className={urgency.color} variant="outline">
                        {urgency.label}
                      </Badge>
                    </div>

                    {/* Validity */}
                    <div className="text-sm text-gray-600">
                      Valid for {pkg.validityPeriod} days
                    </div>

                    {/* Benefits */}
                    {pkg.benefits.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium mb-1">Benefits:</h5>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {pkg.benefits.slice(0, 3).map((benefit, index) => (
                            <li key={index} className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2 border-t">
                      <Button 
                        className="flex-1"
                        onClick={() => setSelectedPackageId(pkg.id)}
                      >
                        <Gift className="h-4 w-4 mr-2" />
                        Select Package
                      </Button>
                      
                      <Button variant="outline" size="sm">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </Tabs>

      {/* Selected Package Summary */}
      {selectedPackageId && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Package selected! Proceed to booking to complete your appointment.
          </AlertDescription>
        </Alert>
      )}

      {/* No Packages State */}
      {filteredPackages.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Packages Available</h3>
              <p className="text-gray-600">
                No service packages are currently available for this category.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Information Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Package Benefits:</strong> All packages include priority scheduling, digital receipts, 
          and access to our patient portal. Healthier SG packages offer additional government subsidies.
        </AlertDescription>
      </Alert>
    </div>
  );
}