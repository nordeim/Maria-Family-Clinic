import * as React from "react"
import {
  MapPin,
  Phone,
  Clock,
  Star,
  Navigation,
  ChevronRight,
  Heart,
  Shield,
  Calendar,
  Users,
  Accessibility,
  Car,
  CheckCircle,
  Check,
  Zap,
  Award,
  CheckSquare,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Clinic {
  id: string
  name: string
  address: string
  phone: string
  hours: string
  rating?: number
  totalReviews?: number
  distance?: string
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
}

interface ClinicComparisonProps {
  isComparisonMode?: boolean
  onToggleCompare?: (clinicId: string) => void
}

interface WaitTimeData {
  estimate: string
  status: 'low' | 'moderate' | 'high'
  color: string
}

interface ClinicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  clinic: Clinic
  onViewDetails?: (clinicId: string) => void
  onGetDirections?: (clinicId: string) => void
  onBookAppointment?: (clinicId: string) => void
  onToggleFavorite?: (clinicId: string, isFavorite: boolean) => void
  onToggleCompare?: (clinicId: string) => void
  onCall?: (phoneNumber: string) => void
  isFavorite?: boolean
  isComparisonMode?: boolean
  showDistance?: boolean
}

const ClinicCard = React.forwardRef<HTMLDivElement, ClinicCardProps>(
  (
    {
      clinic,
      onViewDetails,
      onGetDirections,
      onBookAppointment,
      onToggleFavorite,
      onToggleCompare,
      onCall,
      isFavorite = false,
      isComparisonMode = false,
      showDistance = true,
      className,
      ...props
    },
    ref
  ) => {
    // Calculate wait time estimate based on current time and clinic data
    const getWaitTimeEstimate = React.useMemo((): WaitTimeData => {
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
      
      // Fallback to string waitTime with logic
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
    }, [clinic.waitTimeEstimate, clinic.waitTime])

    const handleFavoriteToggle = (e: React.MouseEvent) => {
      e.stopPropagation()
      onToggleFavorite?.(clinic.id, !isFavorite)
    }

    const handleCompareToggle = (e: React.MouseEvent) => {
      e.stopPropagation()
      onToggleCompare?.(clinic.id)
    }

    const handleCall = (e: React.MouseEvent) => {
      e.stopPropagation()
      onCall?.(clinic.phone)
    }
    return (
      <Card
        ref={ref}
        className={cn(
          "group transition-all hover:shadow-md border-2",
          clinic.isSelected && "border-primary",
          isComparisonMode && "border-dashed",
          className
        )}
        {...props}
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-start gap-2">
                <CardTitle className="text-xl flex-1">{clinic.name}</CardTitle>
                <div className="flex items-center gap-1">
                  {isComparisonMode && onToggleCompare && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCompareToggle}
                      className="-mt-1"
                      aria-label={clinic.isSelected ? "Remove from comparison" : "Add to comparison"}
                    >
                      <CheckSquare
                        className={cn(
                          "h-5 w-5",
                          clinic.isSelected 
                            ? "fill-primary text-primary" 
                            : "text-muted-foreground"
                        )}
                      />
                    </Button>
                  )}
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

              <CardDescription className="mt-2 flex items-start gap-1.5">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
                <span>{clinic.address}</span>
              </CardDescription>
            </div>
            {clinic.image && (
              <Avatar className="h-16 w-16">
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

        <CardContent className="space-y-4">
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
                Wait time: <span className={cn("font-medium", getWaitTimeEstimate.color)}>
                  {getWaitTimeEstimate.estimate}
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
              <div className="flex items-center gap-1 text-xs text-muted-foreground" aria-label={`${clinic.distance || ''} ${clinic.travelTime || 'away'}`}>
                <Navigation className="h-3 w-3" aria-hidden="true" />
                <span>
                  {clinic.distance && `${clinic.distance}`}
                  {clinic.distance && clinic.travelTime && ' • '}
                  {clinic.travelTime}
                </span>
              </div>
            )}
          </div>

          {/* Facilities and Accessibility */}
          <div className="flex flex-wrap gap-2">
            {clinic.isWheelchairAccessible && (
              <Badge 
                variant="outline" 
                className="text-xs gap-1"
                aria-label="Wheelchair accessible facility"
              >
                <Accessibility className="h-3 w-3" aria-hidden="true" />
                Wheelchair Access
              </Badge>
            )}
            {clinic.hasParking && (
              <Badge 
                variant="outline" 
                className="text-xs gap-1"
                aria-label={`Parking available${clinic.parkingSpaces ? ` - ${clinic.parkingSpaces} spaces` : ''}`}
              >
                <Car className="h-3 w-3" aria-hidden="true" />
                Parking{clinic.parkingSpaces && ` (${clinic.parkingSpaces})`}
              </Badge>
            )}
            {clinic.acceptsInsurance && (
              <Badge 
                variant="outline" 
                className="text-xs gap-1"
                aria-label="Insurance plans accepted"
              >
                <CheckCircle className="h-3 w-3" aria-hidden="true" />
                Insurance
              </Badge>
            )}
          </div>

          {/* Specialties */}
          {clinic.specialties && clinic.specialties.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {clinic.specialties.map((specialty, index) => (
                <Badge key={index} variant="secondary">
                  {specialty}
                </Badge>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onBookAppointment?.(clinic.id)
              }}
              aria-label={`Book appointment at ${clinic.name}`}
            >
              <Calendar className="mr-1 h-4 w-4" aria-hidden="true" />
              Book
            </Button>
            <Button
              variant="outline"
              size="sm"
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
              className="w-full"
              onClick={() => onViewDetails(clinic.id)}
              aria-label={`View details for ${clinic.name}`}
            >
              View Details
              <ChevronRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }
)
ClinicCard.displayName = "ClinicCard"

export { ClinicCard }
export type { Clinic, ClinicCardProps, ClinicComparisonProps, WaitTimeData }
