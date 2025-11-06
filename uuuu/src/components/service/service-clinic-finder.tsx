import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Badge } from '~/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { MapPin, Search, Filter, Star, Clock, Shield, Phone, Calendar, AlertCircle, Navigation } from 'lucide-react';
import { ClinicMap } from '~/components/maps/clinic-map';
import { cn } from '~/lib/utils';

interface Service {
  id: string;
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  isHealthierSGCovered: boolean;
  typicalDurationMin?: number;
}

interface Clinic {
  id: string;
  name: string;
  address: string;
  phone?: string;
  rating?: number;
  reviewCount?: number;
  isOpen: boolean;
  distance?: number;
  latitude: number;
  longitude: number;
  specializationAreas: string[];
  insuranceAccepted: string[];
  isVerified: boolean;
  emergencyServices: boolean;
  languages: string[];
  doctorCount: number;
  waitingTime?: number; // estimated wait time in minutes
}

interface ServiceClinicFinderProps {
  services: Service[];
  clinics: Clinic[];
  selectedServiceId?: string;
  userLocation?: { latitude: number; longitude: number };
  onServiceSelect: (serviceId: string) => void;
  onClinicSelect: (clinicId: string) => void;
  onBookAppointment: (serviceId: string, clinicId: string) => void;
  className?: string;
}

export function ServiceClinicFinder({
  services,
  clinics,
  selectedServiceId,
  userLocation,
  onServiceSelect,
  onClinicSelect,
  onBookAppointment,
  className
}: ServiceClinicFinderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClinicId, setSelectedClinicId] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [filters, setFilters] = useState({
    distance: 10, // km
    rating: 0,
    openNow: false,
    emergency: false,
    healthierSG: false,
    verified: false,
    insurance: '',
    language: '',
    specialization: ''
  });

  const selectedService = services.find(s => s.id === selectedServiceId);
  
  // Filter clinics based on selected service and filters
  const filteredClinics = clinics
    .filter(clinic => {
      // Service availability filter (in real app, would check service availability)
      const serviceAvailable = true; // This would check actual service availability
      
      if (!serviceAvailable) return false;
      
      // Distance filter
      if (filters.distance > 0 && clinic.distance && clinic.distance > filters.distance) {
        return false;
      }
      
      // Rating filter
      if (filters.rating > 0 && (clinic.rating || 0) < filters.rating) {
        return false;
      }
      
      // Open now filter
      if (filters.openNow && !clinic.isOpen) {
        return false;
      }
      
      // Emergency services filter
      if (filters.emergency && !clinic.emergencyServices) {
        return false;
      }
      
      // Healthier SG filter
      if (filters.healthierSG) {
        // In real app, would check if clinic offers Healthier SG for this service
        return true; // Simplified for demo
      }
      
      // Verified filter
      if (filters.verified && !clinic.isVerified) {
        return false;
      }
      
      // Insurance filter
      if (filters.insurance && !clinic.insuranceAccepted.includes(filters.insurance)) {
        return false;
      }
      
      // Language filter
      if (filters.language && !clinic.languages.includes(filters.language)) {
        return false;
      }
      
      // Specialization filter
      if (filters.specialization && !clinic.specializationAreas.includes(filters.specialization)) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort by relevance, distance, and rating
      if (a.distance !== undefined && b.distance !== undefined) {
        return a.distance - b.distance;
      }
      return (b.rating || 0) - (a.rating || 0);
    });

  // Get unique values for filter dropdowns
  const allInsuranceProviders = Array.from(new Set(clinics.flatMap(c => c.insuranceAccepted)));
  const allLanguages = Array.from(new Set(clinics.flatMap(c => c.languages)));
  const allSpecializations = Array.from(new Set(clinics.flatMap(c => c.specializationAreas)));

  const formatPrice = (clinic: Clinic) => {
    // In real app, would get actual price for selected service
    return "Price on request";
  };

  const formatDistance = (distance?: number) => {
    if (!distance) return '';
    return `${distance.toFixed(1)} km away`;
  };

  const formatWaitTime = (waitTime?: number) => {
    if (!waitTime) return '';
    if (waitTime < 60) return `${waitTime} min wait`;
    const hours = Math.floor(waitTime / 60);
    const mins = waitTime % 60;
    return `${hours}h ${mins}m wait`;
  };

  const clinicsForMap = filteredClinics.map(clinic => ({
    id: clinic.id,
    name: clinic.name,
    latitude: clinic.latitude,
    longitude: clinic.longitude,
    type: 'PRIVATE' as const, // Would determine from clinic data
    rating: clinic.rating || 0,
    totalReviews: clinic.reviewCount || 0,
    phoneNumber: clinic.phone,
    services: clinic.specializationAreas.slice(0, 3),
    address: clinic.address,
    isOpen: clinic.isOpen,
    distance: clinic.distance
  }));

  return (
    <div className={cn("space-y-6", className)}>
      {/* Service Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Find Clinics for Your Service
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Service Search/Selection */}
          <div className="flex gap-4">
            <Input
              placeholder="Search for a medical service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Service Categories */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {services.slice(0, 8).map(service => (
              <Button
                key={service.id}
                variant={selectedServiceId === service.id ? "default" : "outline"}
                size="sm"
                onClick={() => onServiceSelect(service.id)}
                className="justify-start text-left h-auto p-3"
              >
                <div>
                  <div className="font-medium text-sm">{service.name}</div>
                  {service.subcategory && (
                    <div className="text-xs text-gray-500">{service.subcategory}</div>
                  )}
                </div>
              </Button>
            ))}
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="border-t pt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Distance</label>
                  <Select value={filters.distance.toString()} onValueChange={(value) => setFilters(prev => ({ ...prev, distance: parseInt(value) }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Any distance</SelectItem>
                      <SelectItem value="5">Within 5 km</SelectItem>
                      <SelectItem value="10">Within 10 km</SelectItem>
                      <SelectItem value="20">Within 20 km</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Minimum Rating</label>
                  <Select value={filters.rating.toString()} onValueChange={(value) => setFilters(prev => ({ ...prev, rating: parseInt(value) }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Any rating</SelectItem>
                      <SelectItem value="3">3+ stars</SelectItem>
                      <SelectItem value="4">4+ stars</SelectItem>
                      <SelectItem value="5">5 stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Insurance</label>
                  <Select value={filters.insurance} onValueChange={(value) => setFilters(prev => ({ ...prev, insurance: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any insurance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any insurance</SelectItem>
                      {allInsuranceProviders.map(insurance => (
                        <SelectItem key={insurance} value={insurance}>{insurance}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Language</label>
                  <Select value={filters.language} onValueChange={(value) => setFilters(prev => ({ ...prev, language: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any language</SelectItem>
                      {allLanguages.map(language => (
                        <SelectItem key={language} value={language}>{language}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.openNow}
                    onChange={(e) => setFilters(prev => ({ ...prev, openNow: e.target.checked }))}
                  />
                  <span className="text-sm">Open now</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.emergency}
                    onChange={(e) => setFilters(prev => ({ ...prev, emergency: e.target.checked }))}
                  />
                  <span className="text-sm">24/7 Emergency</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.healthierSG}
                    onChange={(e) => setFilters(prev => ({ ...prev, healthierSG: e.target.checked }))}
                  />
                  <span className="text-sm">Healthier SG</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.verified}
                    onChange={(e) => setFilters(prev => ({ ...prev, verified: e.target.checked }))}
                  />
                  <span className="text-sm">Verified clinics</span>
                </label>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {selectedService && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Clinics offering {selectedService.name}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {filteredClinics.length} clinics found
                  {filters.distance > 0 && ` within ${filters.distance}km`}
                </p>
              </div>
              
              <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                <TabsList>
                  <TabsTrigger value="list">List View</TabsTrigger>
                  <TabsTrigger value="map">Map View</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>

          <CardContent>
            <TabsContent value="list" className="mt-0">
              <div className="space-y-4">
                {filteredClinics.map(clinic => (
                  <div
                    key={clinic.id}
                    className={cn(
                      "p-4 border rounded-lg transition-all cursor-pointer hover:shadow-sm",
                      selectedClinicId === clinic.id ? "border-blue-500 bg-blue-50" : "border-gray-200"
                    )}
                    onClick={() => {
                      setSelectedClinicId(clinic.id);
                      onClinicSelect(clinic.id);
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{clinic.name}</h3>
                          {clinic.isVerified && (
                            <Badge variant="outline" className="text-green-700">
                              ✓ Verified
                            </Badge>
                          )}
                          {clinic.emergencyServices && (
                            <Badge variant="destructive" className="text-xs">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              24/7
                            </Badge>
                          )}
                          {!clinic.isOpen && (
                            <Badge variant="outline">Closed</Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">{clinic.address}</p>
                        
                        <div className="flex items-center gap-4 text-sm">
                          {clinic.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span>{clinic.rating.toFixed(1)}</span>
                              <span className="text-gray-500">({clinic.reviewCount})</span>
                            </div>
                          )}
                          
                          {clinic.distance && (
                            <div className="flex items-center gap-1">
                              <Navigation className="h-4 w-4 text-gray-500" />
                              <span>{formatDistance(clinic.distance)}</span>
                            </div>
                          )}
                          
                          {clinic.waitingTime && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <span>{formatWaitTime(clinic.waitingTime)}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1 mt-2">
                          {clinic.specializationAreas.slice(0, 3).map(area => (
                            <Badge key={area} variant="secondary" className="text-xs">
                              {area}
                            </Badge>
                          ))}
                          {clinic.doctorCount > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {clinic.doctorCount} doctors
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="text-right space-y-2">
                        <div className="font-medium">
                          {formatPrice(clinic)}
                        </div>
                        
                        <div className="space-y-2">
                          {clinic.phone && (
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                            >
                              <a href={`tel:${clinic.phone}`}>
                                <Phone className="h-4 w-4 mr-2" />
                                Call
                              </a>
                            </Button>
                          )}
                          
                          <Button
                            size="sm"
                            onClick={() => onBookAppointment(selectedService.id, clinic.id)}
                            disabled={!clinic.isOpen && !clinic.emergencyServices}
                            className="w-full"
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            Book Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="map" className="mt-0">
              <div className="h-[600px] rounded-lg overflow-hidden">
                <ClinicMap
                  clinics={clinicsForMap}
                  userLocation={userLocation}
                  onClinicSelect={onClinicSelect}
                  height="100%"
                />
              </div>
            </TabsContent>
          </CardContent>
        </Card>
      )}

      {/* No Service Selected State */}
      {!selectedService && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select a Service</h3>
              <p className="text-gray-600">
                Choose a medical service from above to find available clinics in your area.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}