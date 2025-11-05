"use client"

import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  AlertCircle,
  ShieldCheck,
  Target,
  DollarSign,
  FileText,
  Video,
  UserCheck,
  Stethoscope
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProgramClinicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  // Core clinic data
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
  isFavorite?: boolean

  // Healthier SG Program Integration
  isHealthierSGParticipating: boolean
  programParticipations?: Array<{
    programId: string
    programName: string
    programCategory: string
    participationType: string
    accreditationLevel: string
    status: string
    enrollmentCapacity?: {
      limit: number | null
      current: number | null
      waitingList: number | null
      available: number | null
      averageWaitTime: number | null
      lastUpdated?: Date
    }
    benefits?: Array<{
      type: string
      description: string
      amount?: number
      coveragePercentage?: number
    }>
    specializations?: string[]
    successMetrics?: {
      patientSatisfaction: number
      completionRate: number
      averageWaitTime: number
      responseTime: number
    }
  }>

  // Service Integration
  availableServices?: Array<{
    id: string
    name: string
    category: string
    basePrice?: number
    programPrice?: number
    isProgramCovered: boolean
    duration?: number
    availability: {
      nextAvailable: Date
      waitTime: number
      isAvailable: boolean
    }
    doctor?: {
      id: string
      name: string
      specialization: string
      rating: number
    }
  }>

  // Doctor Integration  
  availableDoctors?: Array<{
    id: string
    name: string
    specialization: string
    rating: number
    isHealthierSGCertified: boolean
    programExperience: number // years
    patientCount: number
    nextAvailable: Date
    consultationFee?: number
    programFee?: number
  }>

  // Actions
  onViewDetails?: (clinicId: string) => void
  onGetDirections?: (clinicId: string) => void
  onBookAppointment?: (clinicId: string, serviceId?: string) => void
  onToggleFavorite?: (clinicId: string, isFavorite: boolean) => void
  onCall?: (phoneNumber: string) => void
  onViewProgramInfo?: (clinicId: string) => void
  onBookProgramService?: (clinicId: string, serviceId: string) => void

  // Display Options
  showDistance?: boolean
  showProgramDetails?: boolean
  showServices?: boolean
  showDoctors?: boolean
  compact?: boolean
  variant?: 'default' | 'program-focused' | 'service-focused'
}

export function ProgramClinicCard({
  id,
  name,
  address,
  phone,
  hours,
  rating,
  totalReviews,
  distance,
  travelTime,
  specialties,
  image,
  isOpen,
  waitTime,
  waitTimeEstimate,
  doctorCount,
  established,
  isMOHVerified,
  hasParking,
  parkingSpaces,
  isWheelchairAccessible,
  acceptsInsurance,
  isSelected,
  isFavorite,
  
  // Program integration
  isHealthierSGParticipating,
  programParticipations = [],
  
  // Service integration
  availableServices = [],
  
  // Doctor integration
  availableDoctors = [],
  
  // Actions
  onViewDetails,
  onGetDirections,
  onBookAppointment,
  onToggleFavorite,
  onCall,
  onViewProgramInfo,
  onBookProgramService,
  
  // Display options
  showDistance = true,
  showProgramDetails = true,
  showServices = true,
  showDoctors = true,
  compact = false,
  variant = 'default',
  
  className,
  ...props
}: ProgramClinicCardProps) {
  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleFavorite?.(id, !isFavorite)
  }

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation()
    onCall?.(phone)
  }

  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`
    }
    return `${distance.toFixed(1)}km`
  }

  const getWaitTimeEstimate = () => {
    if (waitTimeEstimate) {
      const estimate = waitTimeEstimate
      if (estimate <= 15) {
        return { estimate: '15 mins or less', status: 'low', color: 'text-green-600' }
      } else if (estimate <= 30) {
        return { estimate: '15-30 mins', status: 'moderate', color: 'text-yellow-600' }
      } else {
        return { estimate: '30+ mins', status: 'high', color: 'text-red-600' }
      }
    }
    
    if (waitTime) {
      const wait = waitTime.toLowerCase()
      if (wait.includes('short') || wait.includes('15')) {
        return { estimate: waitTime, status: 'low', color: 'text-green-600' }
      } else if (wait.includes('moderate') || wait.includes('30')) {
        return { estimate: waitTime, status: 'moderate', color: 'text-yellow-600' }
      } else {
        return { estimate: waitTime, status: 'high', color: 'text-red-600' }
      }
    }
    
    return { estimate: 'Call to confirm', status: 'moderate', color: 'text-gray-600' }
  }

  const waitTimeData = getWaitTimeEstimate()

  // Get primary program info
  const primaryProgram = programParticipations?.[0]
  const hasAvailableSlots = programParticipations?.some(p => 
    p.enrollmentCapacity?.available && p.enrollmentCapacity.available > 0
  )

  return (
    <Card
      className={cn(
        "group transition-all hover:shadow-md border-2",
        isSelected && "border-primary",
        isHealthierSGParticipating && "border-green-200 bg-green-50/30",
        variant === 'program-focused' && "ring-2 ring-green-200",
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
                    {name}
                  </h3>
                  {isHealthierSGParticipating && (
                    <Badge 
                      variant="default" 
                      className={cn(
                        "hover:bg-green-700",
                        variant === 'program-focused' ? "bg-green-600" : "bg-green-600"
                      )}
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      Healthier SG
                    </Badge>
                  )}
                  {hasAvailableSlots && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      <Timer className="h-3 w-3 mr-1" />
                      Slots Available
                    </Badge>
                  )}
                </div>
                
                {/* Program Participation Info */}
                {isHealthierSGParticipating && showProgramDetails && programParticipations.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {programParticipations.map((program, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="font-medium">{program.programName}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {program.accreditationLevel}
                        </Badge>
                        {program.enrollmentCapacity?.available !== null && (
                          <span className="text-xs text-gray-500">
                            {program.enrollmentCapacity.available} slots
                          </span>
                        )}
                      </div>
                    ))}
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
              {isOpen !== undefined && (
                <Badge 
                  variant={isOpen ? "default" : "secondary"} 
                  className="text-xs"
                  aria-label={isOpen ? "Currently open" : "Currently closed"}
                >
                  {isOpen ? "Open Now" : "Closed"}
                </Badge>
              )}
              {isMOHVerified && (
                <Badge 
                  variant="outline" 
                  className="text-xs gap-1"
                  aria-label="Ministry of Health verified clinic"
                >
                  <CheckCircle className="h-3 w-3" aria-hidden="true" />
                  MOH Verified
                </Badge>
              )}
              {established && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground" aria-label={`Established ${new Date().getFullYear() - established} years ago`}>
                  <Award className="h-3 w-3" aria-hidden="true" />
                  <span>Est. {new Date().getFullYear() - established} years</span>
                </div>
              )}
              {doctorCount && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground" aria-label={`${doctorCount} doctors available`}>
                  <Users className="h-3 w-3" aria-hidden="true" />
                  <span>{doctorCount} doctors</span>
                </div>
              )}
            </div>

            <CardContent className={cn("flex items-start gap-1.5 mt-2 p-0", compact && "text-sm")}>
              <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
              <span className="text-muted-foreground">{address}</span>
            </CardContent>
          </div>
          
          {image && (
            <Avatar className={cn("h-16 w-16", compact && "h-12 w-12")}>
              <AvatarImage src={image} alt={name} />
              <AvatarFallback>
                {name
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
              aria-label={`Call ${name} at ${phone}`}
            >
              {phone}
            </button>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" aria-hidden="true" />
            <span>{hours}</span>
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
          {rating && (
            <div className="flex items-center gap-1" aria-label={`Rating: ${rating} out of 5 stars`}>
              <Star className="h-4 w-4 fill-warning text-warning" aria-hidden="true" />
              <span className="text-sm font-medium">{rating}</span>
              {totalReviews && (
                <span className="text-xs text-muted-foreground" aria-label={`${totalReviews} reviews`}>
                  ({totalReviews})
                </span>
              )}
            </div>
          )}
          {showDistance && (distance || travelTime) && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground" aria-label={`${distance ? formatDistance(distance) : ''} ${travelTime || 'away'}`}>
              <Navigation className="h-3 w-3" aria-hidden="true" />
              <span>
                {distance && formatDistance(distance)}
                {distance && travelTime && ' • '}
                {travelTime}
              </span>
            </div>
          )}
        </div>

        {/* Healthier SG Program Information */}
        {isHealthierSGParticipating && showProgramDetails && primaryProgram && (
          <div className="bg-green-50 p-3 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-green-800">
              <ShieldCheck className="h-4 w-4" />
              Program Information
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Category:</span>
                <span className="font-medium">{primaryProgram.programCategory}</span>
              </div>
              {primaryProgram.enrollmentCapacity && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Availability:</span>
                  <span className="font-medium">
                    {primaryProgram.enrollmentCapacity.available || 0} slots available
                  </span>
                </div>
              )}
              {primaryProgram.successMetrics && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Patient Satisfaction:</span>
                  <span className="font-medium text-green-700">
                    {primaryProgram.successMetrics.patientSatisfaction}%
                  </span>
                </div>
              )}
            </div>
            {primaryProgram.benefits && primaryProgram.benefits.length > 0 && (
              <div className="pt-2 border-t border-green-200">
                <div className="text-xs font-medium text-green-800 mb-1">Program Benefits:</div>
                <div className="space-y-1">
                  {primaryProgram.benefits.slice(0, 2).map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      <DollarSign className="h-3 w-3 text-green-600" />
                      <span>{benefit.description}</span>
                      {benefit.amount && (
                        <span className="font-medium text-green-700">${benefit.amount}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Available Program Services */}
        {isHealthierSGParticipating && showServices && availableServices.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Stethoscope className="h-4 w-4 text-blue-600" />
              Available Services
            </div>
            <div className="space-y-2">
              {availableServices.slice(0, compact ? 2 : 3).map((service) => (
                <div key={service.id} className="p-2 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{service.name}</div>
                      <div className="text-xs text-gray-600">{service.category}</div>
                      {service.doctor && (
                        <div className="text-xs text-gray-500">
                          Dr. {service.doctor.name} • {service.doctor.specialization}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {service.programPrice && (
                        <div className="text-right">
                          <div className="text-sm font-medium text-green-600">
                            ${service.programPrice}
                          </div>
                          {service.basePrice && service.basePrice !== service.programPrice && (
                            <div className="text-xs text-gray-500 line-through">
                              ${service.basePrice}
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex flex-col gap-1">
                        {service.availability.isAvailable ? (
                          <Badge variant="default" className="text-xs">
                            Available
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            Wait {service.availability.waitTime}d
                          </Badge>
                        )}
                        {onBookProgramService && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-6"
                            onClick={(e) => {
                              e.stopPropagation()
                              onBookProgramService(id, service.id)
                            }}
                          >
                            Book
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Program Doctors */}
        {isHealthierSGParticipating && showDoctors && availableDoctors.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <UserCheck className="h-4 w-4 text-purple-600" />
              Program Doctors
            </div>
            <div className="space-y-2">
              {availableDoctors.slice(0, compact ? 1 : 2).map((doctor) => (
                <div key={doctor.id} className="p-2 bg-purple-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{doctor.name}</span>
                        {doctor.isHealthierSGCertified && (
                          <Badge variant="secondary" className="text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            Certified
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-600">{doctor.specialization}</div>
                      <div className="text-xs text-gray-500">
                        {doctor.programExperience} years program experience
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-3 w-3 fill-warning text-warning" />
                        <span>{doctor.rating}</span>
                      </div>
                      {doctor.programFee && (
                        <div className="text-xs text-green-600 font-medium">
                          ${doctor.programFee}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Facilities and Accessibility */}
        <div className="flex flex-wrap gap-2">
          {isWheelchairAccessible && (
            <Badge variant="outline" className="text-xs gap-1">
              ♿ Wheelchair Access
            </Badge>
          )}
          {hasParking && (
            <Badge variant="outline" className="text-xs gap-1">
              🅿️ Parking{parkingSpaces && ` (${parkingSpaces})`}
            </Badge>
          )}
          {acceptsInsurance && (
            <Badge variant="outline" className="text-xs gap-1">
              <CheckCircle className="h-3 w-3" />
              Insurance
            </Badge>
          )}
        </div>

        {/* Specialties */}
        {specialties && specialties.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {specialties.slice(0, compact ? 3 : 5).map((specialty, index) => (
              <Badge key={index} variant="secondary">
                {specialty}
              </Badge>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className={cn("grid gap-2 pt-2", compact ? "grid-cols-1" : "grid-cols-2")}>
          <Button
            size={compact ? "sm" : "default"}
            onClick={(e) => {
              e.stopPropagation()
              onBookAppointment?.(id)
            }}
            className={isHealthierSGParticipating ? "bg-green-600 hover:bg-green-700" : ""}
            aria-label={`Book appointment at ${name}`}
          >
            <Calendar className="mr-1 h-4 w-4" aria-hidden="true" />
            Book
          </Button>
          <Button
            variant="outline"
            size={compact ? "sm" : "default"}
            onClick={(e) => {
              e.stopPropagation()
              onGetDirections?.(id)
            }}
            aria-label={`Get directions to ${name}`}
          >
            <Navigation className="mr-1 h-4 w-4" aria-hidden="true" />
            Directions
          </Button>
        </div>

        {/* Program-specific Actions */}
        {isHealthierSGParticipating && (
          <div className="grid gap-2">
            {onViewProgramInfo && (
              <Button
                variant="outline"
                size={compact ? "sm" : "default"}
                onClick={(e) => {
                  e.stopPropagation()
                  onViewProgramInfo?.(id)
                }}
                className="w-full"
              >
                <FileText className="mr-2 h-4 w-4" />
                View Program Details
              </Button>
            )}
          </div>
        )}

        {/* Call Button */}
        <Button
          variant="secondary"
          size={compact ? "sm" : "default"}
          className="w-full"
          onClick={handleCall}
          aria-label={`Call ${name} now`}
        >
          <Phone className="mr-2 h-4 w-4" aria-hidden="true" />
          Call Now
        </Button>

        {onViewDetails && (
          <Button
            variant="ghost"
            size={compact ? "sm" : "default"}
            className="w-full"
            onClick={() => onViewDetails(id)}
            aria-label={`View details for ${name}`}
          >
            View Details →
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export type { ProgramClinicCardProps }