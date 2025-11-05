"use client"

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  MapPin, 
  Phone, 
  Clock, 
  Star, 
  Navigation, 
  Calendar, 
  Heart,
  CheckCircle,
  Users,
  Award,
  Zap,
  Activity,
  Shield,
  TrendingUp,
  Timer,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ProgramParticipationBadge } from './ProgramParticipationBadge'
import { ClinicCapacityIndicator } from './ClinicCapacityIndicator'
import { ClinicProgramInfo } from './ClinicProgramInfo'
import { ProgramAppointmentCard } from './ProgramAppointmentCard'

interface HealthierSGClinic {
  id: string
  name: string
  address: string
  phone: string
  hours: string
  rating?: number
  totalReviews?: number
  distance?: number
  travelTime?: string
  specialties?: string[]
  image?: string
  isOpen?: boolean
  waitTime?: string
  waitTimeEstimate?: number
  doctorCount?: number
  established?: number
  isMOHVerified?: boolean
  hasParking?: boolean
  parkingSpaces?: number
  isWheelchairAccessible?: boolean
  acceptsInsurance?: boolean
  isSelected?: boolean
  
  // Healthier SG specific fields
  isHealthierSGParticipating: boolean
  healthProgramInfo?: Array<{
    programId: string
    programName: string
    programCategory: string
    participationType: string
    accreditationLevel: string
    status: string
    capacity: {
      limit: number | null
      current: number | null
      waitingList: number | null
      available: number | null
      averageWaitTime: number | null
      lastUpdated?: Date
    }
  }>
  serviceCapacityInfo?: Array<{
    serviceId: string
    serviceName: string
    price?: number
    healthierSGPrice?: number
    duration?: number
    capacity: {
      limit: number | null
      current: number | null
      available: number | null
    }
  }>
}

interface HealthierSGClinicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  clinic: HealthierSGClinic
  onViewDetails?: (clinicId: string) => void
  onGetDirections?: (clinicId: string) => void
  onBookAppointment?: (clinicId: string) => void
  onToggleFavorite?: (clinicId: string, isFavorite: boolean) => void
  onCall?: (phoneNumber: string) => void
  isFavorite?: boolean
  showDistance?: boolean
  showProgramDetails?: boolean
  compact?: boolean
}

export function HealthierSGClinicCard({
  clinic,
  onViewDetails,
  onGetDirections,
  onBookAppointment,
  onToggleFavorite,
  onCall,
  isFavorite = false,
  showDistance = true,
  showProgramDetails = true,
  compact = false,
  className,
  ...props
}: HealthierSGClinicCardProps) {
  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleFavorite?.(clinic.id, !isFavorite)
  }

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation()
    onCall?.(clinic.phone)
  }

  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`
    }
    return `${distance.toFixed(1)}km`
  }

  const getWaitTimeEstimate = (clinic: HealthierSGClinic) => {
    if (clinic.waitTimeEstimate) {
      const estimate = clinic.waitTimeEstimate
      if (estimate <= 15) {
        return { estimate: '15 mins or less', status: 'low', color: 'text-green-600' }
      } else if (estimate <= 30) {
        return { estimate: '15-30 mins', status: 'moderate', color: 'text-yellow-600' }
      } else {
        return { estimate: '30+ mins', status: 'high', color: 'text-red-600' }
      }
    }
    
    if (clinic.waitTime) {
      const wait = clinic.waitTime.toLowerCase()
      if (wait.includes('short') || wait.includes('15')) {
        return { estimate: clinic.waitTime, status: 'low', color: 'text-green-600' }
      } else if (wait.includes('moderate') || wait.includes('30')) {
        return { estimate: clinic.waitTime, status: 'moderate', color: 'text-yellow-600' }
      } else {
        return { estimate: clinic.waitTime, status: 'high', color: 'text-red-600' }
      }
    }
    
    return { estimate: 'Call to confirm', status: 'moderate', color: 'text-gray-600' }
  }

  const waitTimeData = getWaitTimeEstimate(clinic)

  return (
    <Card
      className={cn(
        "group transition-all hover:shadow-md border-2",
        clinic.isSelected && "border-primary",
        clinic.isHealthierSGParticipating && "border-green-200 bg-green-50/30",
        compact && "p-4",
        className
      )}
      {...props}
    >
      <CardHeader className={cn(compact && "pb-2")}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className={cn("font-semibold", compact ? "text-lg" : "text-xl")}>
                    {clinic.name}
                  </h3>
                  {clinic.isHealthierSGParticipating && (
                    <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                      <Shield className="h-3 w-3 mr-1" />
                      Healthier SG
                    </Badge>
                  )}
                </div>
                
                {/* Healthier SG Participation Badge */}
                {clinic.isHealthierSGParticipating && clinic.healthProgramInfo && (
                  <div className="mt-2">
                    <ProgramParticipationBadge 
                      participations={clinic.healthProgramInfo}
                      compact={compact}
                    />
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                {onToggleFavorite && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleFavoriteToggle}
                    className="-mt-1"
                    aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Heart
                      className={cn(
                        "h-5 w-5",
                        isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"
                      )}
                    />
                  </Button>
                )}
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {clinic.isOpen !== undefined && (
                <Badge 
                  variant={clinic.isOpen ? "default" : "secondary"} 
                  className="text-xs"
                  aria-label={clinic.isOpen ? "Currently open" : "Currently closed"}
                >
                  {clinic.isOpen ? "Open Now" : "Closed"}
                </Badge>
              )}
              {clinic.isMOHVerified && (
                <Badge 
                  variant="outline" 
                  className="text-xs gap-1"
                  aria-label="Ministry of Health verified clinic"
                >
                  <CheckCircle className="h-3 w-3" aria-hidden="true" />
                  MOH Verified
                </Badge>
              )}
              {clinic.established && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground" aria-label={`Established ${new Date().getFullYear() - clinic.established} years ago`}>
                  <Award className="h-3 w-3" aria-hidden="true" />
                  <span>Est. {new Date().getFullYear() - clinic.established} years</span>
                </div>
              )}
              {clinic.doctorCount && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground" aria-label={`${clinic.doctorCount} doctors available`}>
                  <Users className="h-3 w-3" aria-hidden="true" />
                  <span>{clinic.doctorCount} doctors</span>
                </div>
              )}
            </div>

            <CardContent className={cn("flex items-start gap-1.5 mt-2 p-0", compact && "text-sm")}>
              <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
              <span className="text-muted-foreground">{clinic.address}</span>
            </CardContent>
          </div>
          
          {clinic.image && (
            <Avatar className={cn("h-16 w-16", compact && "h-12 w-12")}>
              <AvatarImage src={clinic.image} alt={clinic.name} />
              <AvatarFallback>
                {clinic.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </CardHeader>

      <CardContent className={cn("space-y-4", compact && "space-y-2")}>
        {/* Contact and Hours */}
        <div className="grid gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4" aria-hidden="true" />
            <button
              onClick={handleCall}
              className="hover:text-foreground hover:underline text-left flex-1"
              aria-label={`Call ${clinic.name} at ${clinic.phone}`}
            >
              {clinic.phone}
            </button>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" aria-hidden="true" />
            <span>{clinic.hours}</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <span className="text-sm">
              Wait time: <span className={cn("font-medium", waitTimeData.color)}>
                {waitTimeData.estimate}
              </span>
            </span>
          </div>
        </div>

        {/* Rating, Distance, and Quick Info */}
        <div className="flex flex-wrap items-center gap-3">
          {clinic.rating && (
            <div className="flex items-center gap-1" aria-label={`Rating: ${clinic.rating} out of 5 stars`}>
              <Star className="h-4 w-4 fill-warning text-warning" aria-hidden="true" />
              <span className="text-sm font-medium">{clinic.rating}</span>
              {clinic.totalReviews && (
                <span className="text-xs text-muted-foreground" aria-label={`${clinic.totalReviews} reviews`}>
                  ({clinic.totalReviews})
                </span>
              )}
            </div>
          )}
          {showDistance && (clinic.distance || clinic.travelTime) && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground" aria-label={`${clinic.distance ? formatDistance(clinic.distance) : ''} ${clinic.travelTime || 'away'}`}>
              <Navigation className="h-3 w-3" aria-hidden="true" />
              <span>
                {clinic.distance && formatDistance(clinic.distance)}
                {clinic.distance && clinic.travelTime && ' • '}
                {clinic.travelTime}
              </span>
            </div>
          )}
        </div>

        {/* Healthier SG Capacity Information */}
        {clinic.isHealthierSGParticipating && clinic.healthProgramInfo && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-green-700">
              <Activity className="h-4 w-4" />
              Program Capacity
            </div>
            <ClinicCapacityIndicator 
              participations={clinic.healthProgramInfo}
              compact={compact}
            />
          </div>
        )}

        {/* Healthier SG Services */}
        {clinic.isHealthierSGParticipating && clinic.serviceCapacityInfo && clinic.serviceCapacityInfo.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-green-700">
              <TrendingUp className="h-4 w-4" />
              Healthier SG Services
            </div>
            <div className="grid gap-2">
              {clinic.serviceCapacityInfo.slice(0, compact ? 2 : 3).map((service, index) => (
                <div key={index} className="flex items-center justify-between text-sm p-2 bg-green-50 rounded-lg">
                  <div>
                    <span className="font-medium">{service.serviceName}</span>
                    {service.duration && (
                      <span className="text-xs text-muted-foreground ml-2">
                        {service.duration}min
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {service.healthierSGPrice && (
                      <span className="text-green-600 font-medium">
                        ${service.healthierSGPrice}
                      </span>
                    )}
                    {service.capacity.available !== null && (
                      <Badge 
                        variant={service.capacity.available > 0 ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {service.capacity.available > 0 ? 'Available' : 'Full'}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Facilities and Accessibility */}
        <div className="flex flex-wrap gap-2">
          {clinic.isWheelchairAccessible && (
            <Badge variant="outline" className="text-xs gap-1">
              ♿ Wheelchair Access
            </Badge>
          )}
          {clinic.hasParking && (
            <Badge variant="outline" className="text-xs gap-1">
              🅿️ Parking{clinic.parkingSpaces && ` (${clinic.parkingSpaces})`}
            </Badge>
          )}
          {clinic.acceptsInsurance && (
            <Badge variant="outline" className="text-xs gap-1">
              <CheckCircle className="h-3 w-3" />
              Insurance
            </Badge>
          )}
        </div>

        {/* Specialties */}
        {clinic.specialties && clinic.specialties.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {clinic.specialties.slice(0, compact ? 3 : 5).map((specialty, index) => (
              <Badge key={index} variant="secondary">
                {specialty}
              </Badge>
            ))}
          </div>
        )}

        {/* Healthier SG Program Information */}
        {clinic.isHealthierSGParticipating && showProgramDetails && clinic.healthProgramInfo && (
          <ClinicProgramInfo 
            participations={clinic.healthProgramInfo}
            compact={compact}
          />
        )}

        {/* Quick Actions */}
        <div className={cn("grid gap-2 pt-2", compact ? "grid-cols-1" : "grid-cols-2")}>
          <Button
            size={compact ? "sm" : "default"}
            onClick={(e) => {
              e.stopPropagation()
              onBookAppointment?.(clinic.id)
            }}
            className={clinic.isHealthierSGParticipating ? "bg-green-600 hover:bg-green-700" : ""}
            aria-label={`Book appointment at ${clinic.name}`}
          >
            <Calendar className="mr-1 h-4 w-4" aria-hidden="true" />
            Book
          </Button>
          <Button
            variant="outline"
            size={compact ? "sm" : "default"}
            onClick={(e) => {
              e.stopPropagation()
              onGetDirections?.(clinic.id)
            }}
            aria-label={`Get directions to ${clinic.name}`}
          >
            <Navigation className="mr-1 h-4 w-4" aria-hidden="true" />
            Directions
          </Button>
        </div>

        {/* Call Button */}
        <Button
          variant="secondary"
          size={compact ? "sm" : "default"}
          className="w-full"
          onClick={handleCall}
          aria-label={`Call ${clinic.name} now`}
        >
          <Phone className="mr-2 h-4 w-4" aria-hidden="true" />
          Call Now
        </Button>

        {onViewDetails && (
          <Button
            variant="ghost"
            size={compact ? "sm" : "default"}
            className="w-full"
            onClick={() => onViewDetails(clinic.id)}
            aria-label={`View details for ${clinic.name}`}
          >
            View Details →
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export type { HealthierSGClinic, HealthierSGClinicCardProps }