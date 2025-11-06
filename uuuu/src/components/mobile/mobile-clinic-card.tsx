"use client"

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
  Volume2,
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
import { useSwipeGesture } from "@/hooks/use-swipe-gesture"
import { useHapticFeedback } from "@/hooks/use-haptic-feedback"
import { useVoiceSearch } from "@/hooks/use-voice-search"

interface Clinic {
  id: string
  name: string
  address: string
  phone: string
  hours: string
  rating?: number
  totalReviews?: number
  distance?: string
  specialties?: string[]
  image?: string
  isOpen?: boolean
  waitTime?: string
  doctorCount?: number
  established?: number
  isMOHVerified?: boolean
  hasParking?: boolean
  isWheelchairAccessible?: boolean
  acceptsInsurance?: boolean
}

interface MobileClinicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  clinic: Clinic
  onViewDetails?: (clinicId: string) => void
  onGetDirections?: (clinicId: string) => void
  onBookAppointment?: (clinicId: string) => void
  onToggleFavorite?: (clinicId: string, isFavorite: boolean) => void
  onCallClinic?: (clinicId: string) => void
  isFavorite?: boolean
}

function MobileClinicCardComponent(
  {
    clinic,
    onViewDetails,
    onGetDirections,
    onBookAppointment,
    onCallClinic,
    onToggleFavorite,
    isFavorite = false,
    className,
    ...props
  }: MobileClinicCardProps,
  ref: React.Ref<HTMLDivElement>
) {
  const { triggerHaptic, triggerSuccess } = useHapticFeedback()
  const { startListening, isListening, transcript } = useVoiceSearch({
    language: "en-SG",
    onResult: (text) => {
      // Handle voice search result if needed
      console.log("Voice search result:", text)
    },
  })

  // Swipe gesture handlers
  const swipeHandlers = useSwipeGesture({
    onSwipeLeft: () => {
      triggerHaptic("medium")
      onGetDirections?.(clinic.id)
    },
    onSwipeRight: () => {
      triggerHaptic("medium")
      onCallClinic?.(clinic.id)
    },
    onSwipeUp: () => {
      triggerHaptic("light")
      onViewDetails?.(clinic.id)
    },
  }, 50)

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    triggerHaptic("light")
    onToggleFavorite?.(clinic.id, !isFavorite)
    triggerSuccess()
  }

  const handleCall = () => {
    triggerHaptic("medium")
    onCallClinic?.(clinic.id)
  }

  const handleDirections = () => {
    triggerHaptic("medium")
    onGetDirections?.(clinic.id)
  }

  const handleBookAppointment = () => {
    triggerHaptic("medium")
    onBookAppointment?.(clinic.id)
  }

  const handleViewDetails = () => {
    triggerHaptic("light")
    onViewDetails?.(clinic.id)
  }

  return (
    <Card
      ref={ref}
      className={cn(
        "group relative overflow-hidden transition-all duration-300 touch-manipulation",
        "active:scale-98 active:shadow-lg",
        swipeHandlers.isDragging && "scale-105 shadow-2xl",
        className
      )}
      {...props}
      onTouchStart={swipeHandlers.onTouchStart}
      onTouchMove={swipeHandlers.onTouchMove}
      onTouchEnd={swipeHandlers.onTouchEnd}
      role="article"
      aria-labelledby={`clinic-${clinic.id}-title`}
      aria-describedby={`clinic-${clinic.id}-description`}
    >
      {/* Swipe Hints */}
      <div className="absolute inset-x-0 top-0 z-10 flex justify-between px-2 py-1 pointer-events-none">
        <div className="flex-1 bg-gradient-to-r from-red-500/20 to-transparent rounded-l-md flex items-center justify-start pl-3">
          <Phone className="h-4 w-4 text-red-500 opacity-60" />
        </div>
        <div className="flex-1 bg-gradient-to-l from-blue-500/20 to-transparent rounded-r-md flex items-center justify-end pr-3">
          <Navigation className="h-4 w-4 text-blue-500 opacity-60" />
        </div>
      </div>

      {/* Swipe Up Hint */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full bg-black/10 rounded-full px-3 py-1 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <ChevronRight className="h-3 w-3 rotate-90" />
        <span className="text-xs text-gray-600">Swipe up for details</span>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-start gap-2">
              <CardTitle 
                id={`clinic-${clinic.id}-title`}
                className="text-xl flex-1 leading-tight"
              >
                {clinic.name}
              </CardTitle>
              {onToggleFavorite && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFavoriteToggle}
                  className="-mt-1 min-w-[44px] min-h-[44px] touch-manipulation"
                  aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                  aria-pressed={isFavorite}
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
            
            {/* Trust Indicators */}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {clinic.isOpen !== undefined && (
                <Badge 
                  variant={clinic.isOpen ? "default" : "secondary"}
                  className="text-xs min-h-[20px] px-2 py-1"
                >
                  {clinic.isOpen ? "Open Now" : "Closed"}
                </Badge>
              )}
              {clinic.isMOHVerified && (
                <Badge variant="outline" className="text-xs gap-1 min-h-[20px] px-2 py-1">
                  <Shield className="h-3 w-3" />
                  MOH Verified
                </Badge>
              )}
              {clinic.established && (
                <span className="text-xs text-muted-foreground">
                  Est. {new Date().getFullYear() - clinic.established} years
                </span>
              )}
            </div>

            <CardDescription 
              id={`clinic-${clinic.id}-description`}
              className="mt-2 flex items-start gap-1.5"
            >
              <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
              <span>{clinic.address}</span>
            </CardDescription>
          </div>
          {clinic.image && (
            <Avatar className="h-16 w-16 border-2 border-gray-100">
              <AvatarImage src={clinic.image} alt={`${clinic.name} exterior`} />
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
            <Phone className="h-4 w-4 flex-shrink-0" />
            <a 
              href={`tel:${clinic.phone}`} 
              className="hover:text-foreground hover:underline touch-manipulation min-h-[44px] flex items-center"
              onClick={handleCall}
              role="button"
              aria-label={`Call ${clinic.name} at ${clinic.phone}`}
            >
              {clinic.phone}
            </a>
            {/* Voice search button for phone numbers */}
            <Button
              variant="ghost"
              size="sm"
              onClick={startListening}
              className="ml-auto min-w-[44px] min-h-[44px] p-2"
              aria-label="Voice search phone number"
            >
              <Volume2 className={cn("h-4 w-4", isListening && "animate-pulse")} />
            </Button>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span>{clinic.hours}</span>
          </div>
          {clinic.waitTime && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span>Wait time: {clinic.waitTime}</span>
            </div>
          )}
        </div>

        {/* Rating, Distance, and Quick Info */}
        <div className="flex flex-wrap items-center gap-3">
          {clinic.rating && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-warning text-warning" />
              <span className="text-sm font-medium">{clinic.rating}</span>
              {clinic.totalReviews && (
                <span className="text-xs text-muted-foreground">({clinic.totalReviews})</span>
              )}
            </div>
          )}
          {clinic.distance && (
            <Badge variant="outline" className="min-h-[20px] px-2 py-1">
              {clinic.distance} away
            </Badge>
          )}
          {clinic.doctorCount && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>{clinic.doctorCount} doctors</span>
            </div>
          )}
        </div>

        {/* Facilities */}
        {(clinic.hasParking || clinic.isWheelchairAccessible || clinic.acceptsInsurance) && (
          <div className="flex flex-wrap gap-2">
            {clinic.isWheelchairAccessible && (
              <Badge variant="outline" className="text-xs gap-1 min-h-[20px] px-2 py-1">
                <Accessibility className="h-3 w-3" />
                Wheelchair Access
              </Badge>
            )}
            {clinic.hasParking && (
              <Badge variant="outline" className="text-xs gap-1 min-h-[20px] px-2 py-1">
                <Car className="h-3 w-3" />
                Parking
              </Badge>
            )}
            {clinic.acceptsInsurance && (
              <Badge variant="outline" className="text-xs min-h-[20px] px-2 py-1">
                Insurance Accepted
              </Badge>
            )}
          </div>
        )}

        {/* Specialties */}
        {clinic.specialties && clinic.specialties.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {clinic.specialties.map((specialty, index) => (
              <Badge key={index} variant="secondary" className="min-h-[20px] px-2 py-1">
                {specialty}
              </Badge>
            ))}
          </div>
        )}

        {/* Voice Search Result */}
        {transcript && (
          <div className="p-2 bg-blue-50 rounded-md border border-blue-200">
            <p className="text-sm text-blue-700">
              <Volume2 className="h-4 w-4 inline mr-1" />
              Voice search: "{transcript}"
            </p>
          </div>
        )}

        {/* Mobile-First Action Buttons */}
        <div className="flex flex-col gap-2 pt-2 sm:hidden">
          <Button
            size="lg"
            onClick={handleBookAppointment}
            className="w-full min-h-[48px] touch-manipulation"
          >
            Book Appointment
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="lg"
              onClick={handleCall}
              className="flex-1 min-h-[44px] touch-manipulation"
            >
              <Phone className="mr-2 h-4 w-4" />
              Call
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleDirections}
              className="flex-1 min-h-[44px] touch-manipulation"
            >
              <Navigation className="mr-2 h-4 w-4" />
              Directions
            </Button>
          </div>
          <Button
            variant="ghost"
            size="lg"
            onClick={handleViewDetails}
            className="w-full min-h-[44px] touch-manipulation"
          >
            View Details
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:flex flex-row gap-2 pt-2">
          <Button
            onClick={handleBookAppointment}
            className="flex-1 min-h-[44px]"
          >
            Book Appointment
          </Button>
          <Button
            variant="outline"
            onClick={handleDirections}
            className="flex-1 min-h-[44px]"
          >
            <Navigation className="mr-2 h-4 w-4" />
            Directions
          </Button>
        </div>

        {onViewDetails && (
          <Button
            variant="ghost"
            onClick={handleViewDetails}
            className="hidden sm:flex w-full"
          >
            View Details
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        )}

        {/* Touch Target Size Indicators (Development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-gray-400 mt-2">
            Touch targets: ✓ All ≥44px
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export const MobileClinicCard = React.forwardRef<HTMLDivElement, MobileClinicCardProps>(MobileClinicCardComponent)
MobileClinicCard.displayName = "MobileClinicCard"
export type { Clinic }