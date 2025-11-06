import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { 
  Search, 
  MapPin, 
  Clock, 
  Star, 
  Calendar,
  Shield,
  Phone,
  Navigation,
  CheckCircle,
  AlertTriangle,
  Users,
  Award,
  Building,
  Stethoscope,
  Package,
  ArrowRight
} from 'lucide-react';
import { ServiceClinicFinder } from './service-clinic-finder';
import { ServiceAvailabilityMatrix } from './service-availability-matrix';
import { ServiceBookingWorkflow } from './service-booking-workflow';
import { ServiceReviewSystem } from './service-review-system';
import { ServicePackagesBundle } from './service-packages-bundle';
import { ServiceReferralWorkflow } from './service-referral-workflow';
import { ServiceExpertiseIndicators } from './service-expertise-indicators';
import { cn } from '~/lib/utils';

export interface ServiceClinicIntegrationProps {
  selectedServiceId?: string;
  userLocation?: { latitude: number; longitude: number };
  onServiceSelect: (serviceId: string) => void;
  onClinicSelect: (clinicId: string) => void;
  onBookAppointment: (serviceId: string, clinicId: string, appointmentData?: any) => void;
  className?: string;
}

export interface ServiceClinicData {
  service: {
    id: string;
    name: string;
    description?: string;
    category: string;
    subcategory?: string;
    typicalDurationMin?: number;
    priceRangeMin?: number;
    priceRangeMax?: number;
    complexityLevel: string;
    isHealthierSGCovered: boolean;
    medicalDescription?: string;
    patientFriendlyDesc?: string;
    processSteps?: any[];
    preparationSteps?: any[];
    postCareInstructions?: any[];
  };
  clinics: Array<{
    id: string;
    name: string;
    address: string;
    phone?: string;
    email?: string;
    rating?: number;
    reviewCount?: number;
    isVerified: boolean;
    isOpen: boolean;
    distance?: number;
    latitude: number;
    longitude: number;
    specializationAreas: string[];
    insuranceAccepted: string[];
    languages: string[];
    doctorCount: number;
    facilities: string[];
    accreditationStatus: string;
    waitingTime?: number;
    emergencyServices: boolean;
    healthierSGPrice?: number;
    availability: {
      isAvailable: boolean;
      nextAvailableDate?: Date;
      estimatedWaitTime?: number;
      scheduleSlots?: any[];
      advanceBookingDays: number;
      isUrgentAvailable: boolean;
    };
    expertise: {
      level: 'EXPERIENCED' | 'EXPERT' | 'SPECIALIZED' | 'ADVANCED';
      certifications: string[];
      caseCount: number;
      successRate?: number;
      peerRecognition: string[];
    };
    reviews: Array<{
      id: string;
      rating: number;
      comment?: string;
      isVerified: boolean;
      createdAt: Date;
      user?: {
        name?: string;
        initials?: string;
      };
    }>;
  }>;
}

export function ServiceClinicIntegrationSystem({
  selectedServiceId,
  userLocation,
  onServiceSelect,
  onClinicSelect,
  onBookAppointment,
  className
}: ServiceClinicIntegrationProps) {
  const [activeTab, setActiveTab] = useState<'finder' | 'availability' | 'booking' | 'reviews' | 'packages' | 'referral'>('finder');
  const [selectedClinicId, setSelectedClinicId] = useState<string>('');
  const [integrationData, setIntegrationData] = useState<ServiceClinicData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data for development - in real app this would come from tRPC queries
  const mockServices = [
    {
      id: '1',
      name: 'General Consultation',
      description: 'Comprehensive health check-up with qualified physicians',
      category: 'Primary Care',
      subcategory: 'General Health',
      typicalDurationMin: 30,
      priceRangeMin: 50,
      priceRangeMax: 150,
      complexityLevel: 'BASIC',
      isHealthierSGCovered: true,
      medicalDescription: 'Standard medical consultation for general health assessment',
      patientFriendlyDesc: 'A comprehensive health check to assess your overall wellbeing',
    },
    {
      id: '2',
      name: 'Cardiology Consultation',
      description: 'Specialized heart and cardiovascular health assessment',
      category: 'Cardiology',
      subcategory: 'Heart Health',
      typicalDurationMin: 45,
      priceRangeMin: 150,
      priceRangeMax: 400,
      complexityLevel: 'SPECIALIZED',
      isHealthierSGCovered: true,
    },
    {
      id: '3',
      name: 'Blood Test Panel',
      description: 'Comprehensive laboratory testing for health screening',
      category: 'Laboratory',
      subcategory: 'Diagnostics',
      typicalDurationMin: 15,
      priceRangeMin: 80,
      priceRangeMax: 200,
      complexityLevel: 'MODERATE',
      isHealthierSGCovered: true,
    }
  ];

  const mockClinics = [
    {
      id: 'clinic-1',
      name: 'Central Family Clinic',
      address: '123 Orchard Road, Singapore 238859',
      phone: '+65 6234 5678',
      email: 'contact@centralfamily.sg',
      rating: 4.5,
      reviewCount: 156,
      isVerified: true,
      isOpen: true,
      distance: 0.8,
      latitude: 1.3048,
      longitude: 103.8318,
      specializationAreas: ['Family Medicine', 'Preventive Care', 'Chronic Disease Management'],
      insuranceAccepted: ['Medisave', 'Medishield', 'Private Insurance'],
      languages: ['English', 'Mandarin', 'Malay'],
      doctorCount: 5,
      facilities: ['Pharmacy', 'Laboratory', 'Parking'],
      accreditationStatus: 'accredited',
      waitingTime: 25,
      emergencyServices: false,
      healthierSGPrice: 30,
      availability: {
        isAvailable: true,
        nextAvailableDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        estimatedWaitTime: 25,
        advanceBookingDays: 7,
        isUrgentAvailable: false,
      },
      expertise: {
        level: 'EXPERIENCED' as const,
        certifications: ['MOH Accredited', 'Family Medicine Board Certified'],
        caseCount: 1250,
        successRate: 96.5,
        peerRecognition: ['Excellent Patient Satisfaction Awards 2023']
      },
      reviews: [
        {
          id: 'review-1',
          rating: 5,
          comment: 'Excellent service and very thorough examination',
          isVerified: true,
          createdAt: new Date('2024-10-15'),
          user: { name: 'Sarah L.', initials: 'SL' }
        },
        {
          id: 'review-2',
          rating: 4,
          comment: 'Professional doctors and clean facilities',
          isVerified: true,
          createdAt: new Date('2024-10-10'),
          user: { name: 'Michael T.', initials: 'MT' }
        }
      ]
    },
    {
      id: 'clinic-2',
      name: 'Advanced Heart Center',
      address: '456 Mount Elizabeth, Singapore 228510',
      phone: '+65 6789 0123',
      email: 'info@heartcenter.sg',
      rating: 4.8,
      reviewCount: 89,
      isVerified: true,
      isOpen: true,
      distance: 2.1,
      latitude: 1.3050,
      longitude: 103.8350,
      specializationAreas: ['Cardiology', 'Interventional Cardiology', 'Heart Surgery'],
      insuranceAccepted: ['Medisave', 'Private Insurance', 'Company Insurance'],
      languages: ['English', 'Mandarin'],
      doctorCount: 12,
      facilities: ['Advanced Lab', 'Cardiac Catheter Lab', 'ICU', 'Pharmacy'],
      accreditationStatus: 'accredited',
      waitingTime: 15,
      emergencyServices: true,
      healthierSGPrice: 100,
      availability: {
        isAvailable: true,
        nextAvailableDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        estimatedWaitTime: 15,
        advanceBookingDays: 14,
        isUrgentAvailable: true,
      },
      expertise: {
        level: 'SPECIALIZED' as const,
        certifications: ['Cardiology Board Certified', 'Interventional Cardiology Fellowship'],
        caseCount: 3500,
        successRate: 98.2,
        peerRecognition: ['Top Cardiology Excellence Award 2024', 'Patient Safety Recognition']
      },
      reviews: [
        {
          id: 'review-3',
          rating: 5,
          comment: 'World-class cardiology care, highly recommend',
          isVerified: true,
          createdAt: new Date('2024-10-20'),
          user: { name: 'Dr. James W.', initials: 'JW' }
        }
      ]
    }
  ];

  useEffect(() => {
    if (selectedServiceId) {
      // In real app, this would make tRPC calls to fetch integration data
      const service = mockServices.find(s => s.id === selectedServiceId);
      if (service) {
        setIntegrationData({
          service,
          clinics: mockClinics
        });
      }
    }
  }, [selectedServiceId]);

  const handleClinicSelect = (clinicId: string) => {
    setSelectedClinicId(clinicId);
    onClinicSelect(clinicId);
  };

  const handleBookAppointment = (serviceId: string, clinicId: string, appointmentData?: any) => {
    onBookAppointment(serviceId, clinicId, appointmentData);
    setActiveTab('booking');
  };

  const getServiceIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'cardiology':
        return <Stethoscope className="h-5 w-5" />;
      case 'laboratory':
        return <Package className="h-5 w-5" />;
      default:
        return <Building className="h-5 w-5" />;
    }
  };

  const getExpertiseColor = (level: string) => {
    switch (level) {
      case 'SPECIALIZED':
        return 'bg-purple-100 text-purple-800';
      case 'EXPERT':
        return 'bg-blue-100 text-blue-800';
      case 'ADVANCED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with Quick Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-6 w-6" />
                Service-Clinic Integration System
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Comprehensive healthcare service and clinic integration
              </p>
            </div>
            {integrationData && (
              <div className="flex items-center gap-2">
                {getServiceIcon(integrationData.service.category)}
                <Badge variant="outline">
                  {integrationData.service.category}
                </Badge>
                {integrationData.service.isHealthierSGCovered && (
                  <Badge className="bg-green-100 text-green-800">
                    Healthier SG
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        
        {integrationData && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {integrationData.clinics.length}
                </div>
                <div className="text-sm text-blue-800">Available Clinics</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {integrationData.clinics.filter(c => c.availability.isAvailable).length}
                </div>
                <div className="text-sm text-green-800">Ready for Booking</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {integrationData.service.priceRangeMin ? `$${integrationData.service.priceRangeMin}` : 'N/A'}
                </div>
                <div className="text-sm text-purple-800">Starting Price</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={activeTab === 'finder' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('finder')}
              >
                <Search className="h-4 w-4 mr-2" />
                Find Clinics
              </Button>
              <Button
                variant={activeTab === 'availability' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('availability')}
              >
                <Clock className="h-4 w-4 mr-2" />
                Availability
              </Button>
              <Button
                variant={activeTab === 'booking' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('booking')}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Book Now
              </Button>
              <Button
                variant={activeTab === 'reviews' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('reviews')}
              >
                <Star className="h-4 w-4 mr-2" />
                Reviews
              </Button>
              <Button
                variant={activeTab === 'packages' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('packages')}
              >
                <Package className="h-4 w-4 mr-2" />
                Packages
              </Button>
              <Button
                variant={activeTab === 'referral' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('referral')}
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Referrals
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      {integrationData && (
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
            <TabsContent value="finder" className="mt-0">
              <ServiceClinicFinder
                services={mockServices}
                clinics={mockClinics as any}
                selectedServiceId={selectedServiceId}
                userLocation={userLocation}
                onServiceSelect={onServiceSelect}
                onClinicSelect={handleClinicSelect}
                onBookAppointment={handleBookAppointment}
              />
            </TabsContent>

            <TabsContent value="availability" className="mt-0">
              <ServiceAvailabilityMatrix
                serviceId={selectedServiceId!}
                clinics={integrationData.clinics}
                userLocation={userLocation}
              />
            </TabsContent>

            <TabsContent value="booking" className="mt-0">
              <ServiceBookingWorkflow
                serviceId={selectedServiceId!}
                selectedClinicId={selectedClinicId}
                clinicData={integrationData.clinics.find(c => c.id === selectedClinicId)}
                onBookingComplete={(bookingData) => {
                  console.log('Booking completed:', bookingData);
                  // Handle booking completion
                }}
              />
            </TabsContent>

            <TabsContent value="reviews" className="mt-0">
              <ServiceReviewSystem
                serviceId={selectedServiceId!}
                clinics={integrationData.clinics}
                userLocation={userLocation}
              />
            </TabsContent>

            <TabsContent value="packages" className="mt-0">
              <ServicePackagesBundle
                serviceId={selectedServiceId!}
                availableClinics={integrationData.clinics}
              />
            </TabsContent>

            <TabsContent value="referral" className="mt-0">
              <ServiceReferralWorkflow
                serviceId={selectedServiceId!}
                selectedClinicId={selectedClinicId}
                availableSpecialists={[]}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* No Service Selected State */}
      {!integrationData && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Service-Clinic Integration</h3>
              <p className="text-gray-600 mb-6">
                Select a medical service to access comprehensive clinic integration features including availability tracking, booking workflows, reviews, and specialized care options.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                <Card className="p-4">
                  <div className="text-center">
                    <MapPin className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <h4 className="font-semibold">Find Clinics</h4>
                    <p className="text-sm text-gray-600">Locate the best clinics for your needs</p>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="text-center">
                    <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <h4 className="font-semibold">Real-time Availability</h4>
                    <p className="text-sm text-gray-600">Check availability across multiple clinics</p>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="text-center">
                    <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <h4 className="font-semibold">Integrated Booking</h4>
                    <p className="text-sm text-gray-600">Seamless appointment scheduling</p>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="text-center">
                    <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                    <h4 className="font-semibold">Verified Reviews</h4>
                    <p className="text-sm text-gray-600">Read authentic patient experiences</p>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="text-center">
                    <Package className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <h4 className="font-semibold">Service Packages</h4>
                    <p className="text-sm text-gray-600">Bundled healthcare offerings</p>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="text-center">
                    <ArrowRight className="h-8 w-8 text-red-600 mx-auto mb-2" />
                    <h4 className="font-semibold">Specialized Referrals</h4>
                    <p className="text-sm text-gray-600">Connect with specialist care</p>
                  </div>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}