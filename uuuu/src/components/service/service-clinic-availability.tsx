"use client";

import React, { useState } from 'react';
import { useService, useClinicsForService } from '@/hooks/use-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  BuildingOfficeIcon, 
  MapPinIcon,
  StarIcon,
  ClockIcon,
  PhoneIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface ServiceClinicAvailabilityProps {
  serviceId: string;
}

interface ClinicAvailability {
  clinicId: string;
  clinicName: string;
  address: string;
  distance: number;
  rating: number;
  reviewCount: number;
  availabilityStatus: 'available' | 'limited' | 'unavailable';
  nextAvailable: Date | null;
  estimatedWaitTime: number;
  price: number;
  healthierSGPrice?: number;
  isHealthierSGCovered: boolean;
  languages: string[];
  facilities: string[];
  phone: string;
  email: string;
  operatingHours: any;
  doctorCount: number;
  isPrimaryClinic: boolean;
}

export function ServiceClinicAvailability({ serviceId }: ServiceClinicAvailabilityProps) {
  const { data: service, isLoading } = useService(serviceId);
  const { data: clinicData, isLoading: clinicLoading } = useClinicsForService(serviceId);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'price' | 'availability'>('distance');
  const [filterBy, setFilterBy] = useState<'all' | 'available' | 'healthierSG' | 'sameDay'>('all');

  if (isLoading || clinicLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="h-96 bg-gray-200 rounded" />
      </div>
    );
  }

  // Default clinic data if no API data
  const defaultClinics: ClinicAvailability[] = [
    {
      clinicId: '1',
      clinicName: 'My Family Clinic @ Jurong',
      address: '123 Jurong East Street 13, Singapore 609601',
      distance: 2.3,
      rating: 4.6,
      reviewCount: 128,
      availabilityStatus: 'available',
      nextAvailable: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      estimatedWaitTime: 15,
      price: 45,
      healthierSGPrice: 25,
      isHealthierSGCovered: true,
      languages: ['English', 'Mandarin', 'Malay'],
      facilities: ['Parking', 'Wheelchair Access', 'Pharmacy'],
      phone: '+65 6567 8901',
      email: 'jurong@myfamilyclinic.sg',
      operatingHours: { /* mock data */ },
      doctorCount: 3,
      isPrimaryClinic: true,
    },
    {
      clinicId: '2',
      clinicName: 'My Family Clinic @ Tampines',
      address: '456 Tampines Street 41, Singapore 529156',
      distance: 8.7,
      rating: 4.8,
      reviewCount: 203,
      availabilityStatus: 'limited',
      nextAvailable: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
      estimatedWaitTime: 25,
      price: 50,
      healthierSGPrice: 30,
      isHealthierSGCovered: true,
      languages: ['English', 'Mandarin', 'Tamil'],
      facilities: ['Parking', 'Lift Access', 'Pharmacy', 'Minor OT'],
      phone: '+65 6789 0123',
      email: 'tampines@myfamilyclinic.sg',
      operatingHours: { /* mock data */ },
      doctorCount: 4,
      isPrimaryClinic: false,
    },
    {
      clinicId: '3',
      clinicName: 'My Family Clinic @ Orchard',
      address: '789 Orchard Road, Singapore 238869',
      distance: 12.1,
      rating: 4.4,
      reviewCount: 89,
      availabilityStatus: 'available',
      nextAvailable: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
      estimatedWaitTime: 20,
      price: 55,
      healthierSGPrice: null,
      isHealthierSGCovered: false,
      languages: ['English', 'Mandarin'],
      facilities: ['Valet Parking', 'Wheelchair Access', 'Pharmacy'],
      phone: '+65 6234 5678',
      email: 'orchard@myfamilyclinic.sg',
      operatingHours: { /* mock data */ },
      doctorCount: 2,
      isPrimaryClinic: false,
    },
  ];

  const clinics = clinicData || defaultClinics;

  const filteredAndSortedClinics = clinics
    .filter(clinic => {
      const matchesSearch = clinic.clinicName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           clinic.address.toLowerCase().includes(searchTerm.toLowerCase());
      
      switch (filterBy) {
        case 'available':
          return matchesSearch && clinic.availabilityStatus === 'available';
        case 'healthierSG':
          return matchesSearch && clinic.isHealthierSGCovered;
        case 'sameDay':
          return matchesSearch && clinic.nextAvailable && 
                 clinic.nextAvailable.getTime() < Date.now() + 24 * 60 * 60 * 1000;
        default:
          return matchesSearch;
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return a.distance - b.distance;
        case 'rating':
          return b.rating - a.rating;
        case 'price':
          return a.price - b.price;
        case 'availability':
          const availabilityOrder = { available: 0, limited: 1, unavailable: 2 };
          return availabilityOrder[a.availabilityStatus] - availabilityOrder[b.availabilityStatus];
        default:
          return 0;
      }
    });

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'limited':
        return 'bg-yellow-100 text-yellow-800';
      case 'unavailable':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Available Today';
      case 'limited':
        return 'Limited Availability';
      case 'unavailable':
        return 'Currently Unavailable';
      default:
        return 'Unknown Status';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-SG', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIconSolid
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BuildingOfficeIcon className="h-5 w-5 text-blue-500" />
          <span>Available Clinics</span>
        </CardTitle>
        
        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search clinics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="distance">Sort by Distance</option>
                <option value="rating">Sort by Rating</option>
                <option value="price">Sort by Price</option>
                <option value="availability">Sort by Availability</option>
              </select>
              
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Clinics</option>
                <option value="available">Available Today</option>
                <option value="healthierSG">Healthier SG Covered</option>
                <option value="sameDay">Same Day Available</option>
              </select>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            Showing {filteredAndSortedClinics.length} of {clinics.length} clinics
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {filteredAndSortedClinics.map((clinic) => (
            <div key={clinic.clinicId} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                {/* Clinic Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {clinic.clinicName}
                        </h3>
                        {clinic.isPrimaryClinic && (
                          <Badge variant="default" className="text-xs">
                            Primary
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center space-x-1">
                          {renderStars(clinic.rating)}
                          <span className="text-sm text-gray-600 ml-1">
                            {clinic.rating} ({clinic.reviewCount} reviews)
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <MapPinIcon className="h-4 w-4" />
                          <span>{clinic.distance}km away</span>
                        </div>
                      </div>
                    </div>
                    
                    <Badge variant="outline" className={getAvailabilityColor(clinic.availabilityStatus)}>
                      {getAvailabilityLabel(clinic.availabilityStatus)}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-600">{clinic.address}</p>

                  <div className="flex flex-wrap gap-2">
                    {clinic.languages.map((language, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {language}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {clinic.facilities.map((facility, index) => (
                      <span key={index} className="text-xs text-gray-500">
                        {facility}
                      </span>
                    ))}
                  </div>

                  {/* Contact Info */}
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <PhoneIcon className="h-4 w-4" />
                      <span>{clinic.phone}</span>
                    </div>
                    <div>Dr. {clinic.doctorCount} available</div>
                    {clinic.nextAvailable && (
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="h-4 w-4" />
                        <span>Next: {formatTime(clinic.nextAvailable)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pricing and Actions */}
                <div className="lg:ml-6 space-y-4 lg:w-64">
                  <div className="text-center lg:text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatPrice(clinic.price)}
                    </div>
                    {clinic.isHealthierSGCovered && clinic.healthierSGPrice && (
                      <div className="text-sm text-blue-600">
                        {formatPrice(clinic.healthierSGPrice)} with Healthier SG
                      </div>
                    )}
                    {clinic.estimatedWaitTime && (
                      <div className="text-sm text-gray-500">
                        Est. wait: {clinic.estimatedWaitTime} min
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Button className="w-full" size="sm">
                      Book Appointment
                    </Button>
                    <Button variant="outline" className="w-full" size="sm">
                      View Details
                    </Button>
                    <Button variant="ghost" className="w-full" size="sm">
                      Call Clinic
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredAndSortedClinics.length === 0 && (
            <div className="text-center py-12">
              <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No clinics found</h3>
              <p className="text-gray-600">
                Try adjusting your search criteria or filters.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}