import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog';
import { Clock, MapPin, Users, Star, Shield, Phone, Calendar, AlertCircle } from 'lucide-react';
import { cn } from '~/lib/utils';

interface Service {
  id: string;
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  specialtyArea?: string;
  typicalDurationMin?: number;
  priceRangeMin?: number;
  priceRangeMax?: number;
  isHealthierSGCovered: boolean;
  rating?: number;
  reviewCount?: number;
}

interface ClinicService {
  id: string;
  clinic: {
    id: string;
    name: string;
    address: string;
    phone?: string;
    rating?: number;
    reviewCount?: number;
    isOpen?: boolean;
    distance?: number;
  };
  estimatedDuration?: number;
  price?: number;
  isHealthierSGCovered: boolean;
  healthierSGPrice?: number;
}

interface ServiceCardProps {
  service: Service;
  clinicServices: ClinicService[];
  userLocation?: { latitude: number; longitude: number };
  onBooking?: (serviceId: string, clinicId: string) => void;
  onViewClinics?: (serviceId: string) => void;
  className?: string;
}

export function ServiceCard({
  service,
  clinicServices,
  userLocation,
  onBooking,
  onViewClinics,
  className
}: ServiceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const avgRating = clinicServices.length > 0
    ? clinicServices.reduce((sum, cs) => sum + (cs.clinic.rating || 0), 0) / clinicServices.length
    : service.rating || 0;

  const totalReviews = clinicServices.length > 0
    ? clinicServices.reduce((sum, cs) => sum + (cs.clinic.reviewCount || 0), 0)
    : service.reviewCount || 0;

  const openClinics = clinicServices.filter(cs => cs.clinic.isOpen);
  const healthierSGClinics = clinicServices.filter(cs => cs.isHealthierSGCovered);

  const formatPrice = (price: number) => {
    return `S$${price.toFixed(2)}`;
  };

  const getPriceDisplay = () => {
    if (service.priceRangeMin && service.priceRangeMax) {
      return `${formatPrice(service.priceRangeMin)} - ${formatPrice(service.priceRangeMax)}`;
    }
    return 'Price on request';
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return null;
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <Card className={cn("transition-all duration-200 hover:shadow-md", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold leading-tight">
              {service.name}
            </CardTitle>
            {service.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {service.description}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1 ml-4">
            {service.isHealthierSGCovered && (
              <Badge variant="outline" className="text-green-700 border-green-200">
                <Shield className="h-3 w-3 mr-1" />
                Healthier SG
              </Badge>
            )}
            {avgRating > 0 && (
              <div className="flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{avgRating.toFixed(1)}</span>
                <span className="text-gray-500">({totalReviews})</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Service Meta Information */}
        <div className="flex flex-wrap gap-2">
          {service.subcategory && (
            <Badge variant="secondary">{service.subcategory}</Badge>
          )}
          {service.specialtyArea && (
            <Badge variant="outline">{service.specialtyArea}</Badge>
          )}
          {service.typicalDurationMin && (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              {formatDuration(service.typicalDurationMin)}
            </div>
          )}
        </div>

        {/* Price Information */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-gray-600">Price Range:</span>
            <span className="ml-2 font-medium">{getPriceDisplay()}</span>
          </div>
          {service.isHealthierSGCovered && healthierSGClinics.length > 0 && (
            <div className="text-sm text-green-600 font-medium">
              Available with Healthier SG
            </div>
          )}
        </div>

        {/* Availability Summary */}
        <div className="grid grid-cols-2 gap-4 pt-3 border-t">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">Clinics:</span>
            <span className="font-medium">{clinicServices.length}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">Open:</span>
            <span className="font-medium">{openClinics.length}</span>
          </div>
        </div>

        {/* Emergency/24/7 Indicator */}
        {clinicServices.some(cs => {
          // Check if clinic has 24/7 operating hours
          return false; // Would need to check operating hours data
        }) && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span>24/7 Emergency Services Available</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewClinics?.(service.id)}
            className="flex-1"
          >
            <MapPin className="h-4 w-4 mr-2" />
            Find Clinics
          </Button>
          
          {openClinics.length > 0 && (
            <Button
              size="sm"
              onClick={() => {
                const openClinic = openClinics[0];
                onBooking?.(service.id, openClinic.clinic.id);
              }}
              className="flex-1"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Book Now
            </Button>
          )}

          {/* More Details Dialog */}
          <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{service.name}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {service.description && (
                  <div>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-gray-600">{service.description}</p>
                  </div>
                )}

                {/* Available Clinics */}
                <div>
                  <h4 className="font-semibold mb-3">
                    Available Clinics ({clinicServices.length})
                  </h4>
                  <div className="space-y-3">
                    {clinicServices.slice(0, 5).map((clinicService) => (
                      <div
                        key={clinicService.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <h5 className="font-medium">{clinicService.clinic.name}</h5>
                          <p className="text-sm text-gray-600">{clinicService.clinic.address}</p>
                          <div className="flex items-center gap-3 mt-1">
                            {clinicService.clinic.rating && (
                              <div className="flex items-center gap-1 text-sm">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span>{clinicService.clinic.rating.toFixed(1)}</span>
                              </div>
                            )}
                            {clinicService.clinic.phone && (
                              <a
                                href={`tel:${clinicService.clinic.phone}`}
                                className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                              >
                                <Phone className="h-3 w-3" />
                                Call
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          {clinicService.price && (
                            <p className="font-medium">{formatPrice(clinicService.price)}</p>
                          )}
                          {clinicService.estimatedDuration && (
                            <p className="text-sm text-gray-500">
                              {formatDuration(clinicService.estimatedDuration)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}