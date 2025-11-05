import * as React from "react"
import {
  MapPin,
  Phone,
  Clock,
  Star,
  Navigation,
  ChevronRight,
  Heart,
  Calendar,
  Users,
  AlertTriangle,
  Info,
  TrendingUp,
  TrendingDown
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

// Import trust indicators and other components
import {
  TrustBadge,
  InsuranceBadge,
  FacilitiesBadges,
  CommunityHealthBadge,
  WaitTimeIndicator,
  VerificationStatus,
  EmergencyIndicator,
  LastUpdated
} from "./trust-indicators"

import {
  StarRating,
  RatingSummary,
  ReviewSummary
} from "./review-system"

import {
  WaitTimeEstimator,
  WaitTimeData
} from "./wait-time-logic"

// Enhanced Clinic Interface
interface EnhancedClinic {
  // Basic Information
  id: string
  name: string
  address: string
  phone: string
  hours: string
  image?: string

  // Rating & Reviews
  rating?: number
  totalReviews?: number
  ratingDistribution?: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
  reviewTrend?: 'improving' | 'declining' | 'stable'
  verifiedReviewPercentage?: number

  // Location & Distance
  distance?: string
  travelTime?: string

  // Operating Status
  isOpen?: boolean
  lastUpdated?: Date

  // Healthcare Services
  specialties?: string[]
  services?: string[]

  // Staff Information
  doctorCount?: number
  established?: number

  // Trust & Verification
  isMOHVerified?: boolean
  accreditationStatus?: 'verified' | 'pending' | 'expired' | 'unverified'
  licenseNumber?: string
  verifiedDate?: Date
  licenseExpiry?: Date

  // Emergency & Urgent Care
  isEmergencyCapable?: boolean
  emergencyTypes?: ('24h' | 'a&e' | 'urgent-care' | 'ambulance')[]
  emergencyPhone?: string

  // Facilities & Accessibility
  hasParking?: boolean
  parkingSpaces?: number
  isWheelchairAccessible?: boolean
  hasPharmacy?: boolean
  hasRadiology?: boolean
  hasLaboratory?: boolean
  hasCafeteria?: boolean
  hasATM?: boolean

  // Insurance & Payment
  acceptsInsurance?: boolean
  insuranceProviders?: string[]
  paymentMethods?: string[]

  // Wait Time Information
  waitTime?: 'short' | 'medium' | 'long' | 'very-long'
  waitTimeEstimate?: number
  isLiveWaitTime?: boolean
  waitTimeFactors?: any[]

  // Community Health Programs
  healthierSG?: boolean
  screenForLife?: boolean
  chas?: boolean
  medisave?: boolean

  // Reviews Data
  reviews?: any[]
  recentReviews?: any[]

  // Selection State
  isSelected?: boolean
}

interface EnhancedClinicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  clinic: EnhancedClinic
  onViewDetails?: (clinicId: string) => void
  onGetDirections?: (clinicId: string) => void
  onBookAppointment?: (clinicId: string) => void
  onToggleFavorite?: (clinicId: string, isFavorite: boolean) => void
  onCall?: (phoneNumber: string) => void
  onToggleCompare?: (clinicId: string) => void
  isFavorite?: boolean
  isComparisonMode?: boolean
  showDistance?: boolean
  showFullDetails?: boolean
  compact?: boolean
  showReviews?: boolean
  showWaitTime?: boolean
}

const EnhancedClinicCard = React.forwardRef<HTMLDivElement, EnhancedClinicCardProps>(
  (
    {
      clinic,
      onViewDetails,
      onGetDirections,
      onBookAppointment,
      onToggleFavorite,
      onCall,
      onToggleCompare,
      isFavorite = false,
      isComparisonMode = false,
      showDistance = true,
      showFullDetails = false,
      compact = false,
      showReviews = false,
      showWaitTime = true,
      className,
      ...props
    },
    ref
  ) => {
    // Mock wait time data for demonstration
    const waitTimeData: WaitTimeData = {
      clinicId: clinic.id,
      currentWaitTime: clinic.waitTimeEstimate || 25,
      historicalAverage: 22,
      peakHours: ['9:00 AM', '1:00 PM', '5:00 PM'],
      trend: 'stable',
      confidence: 'high',
      lastUpdated: new Date(),
      factors: [
        {
          type: 'time',
          impact: 'neutral',
          value: '2:00 PM',
          description: 'Afternoon peak hours',
          severity: 'medium'
        },
        {
          type: 'capacity',
          impact: 'increase',
          value: '3 doctors',
          description: 'All doctors currently in consultation',
          severity: 'high'
        }
      ],
      queuePosition: 5,
      estimatedServiceTime: 20
    }

    const mockRatingDistribution = clinic.ratingDistribution || {
      5: 45,
      4: 28,
      3: 15,
      2: 8,
      1: 4
    }

    const mockReviewSummary = {
      totalReviews: clinic.totalReviews || 0,
      overallRating: clinic.rating || 0,
      ratingDistribution: mockRatingDistribution,
      recentTrend: clinic.reviewTrend || 'stable',
      verifiedPercentage: clinic.verifiedReviewPercentage || 85
    }

    return (
      <Card
        ref={ref}
        className={cn(
          "group transition-all hover:shadow-lg border-2",
          clinic.isSelected && "border-primary",
          isComparisonMode && "border-dashed",
          compact && "p-4",
          className
        )}
        {...props}
      >
        <CardHeader className={cn(compact ? "pb-3" : "pb-4")}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2">
                <CardTitle className={cn(
                  "flex-1 leading-tight",
                  compact ? "text-lg" : "text-xl"
                )}>
                  {clinic.name}
                </CardTitle>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {onToggleCompare && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggleCompare(clinic.id)
                      }}
                      className="p-1 h-8 w-8"
                      aria-label={clinic.isSelected ? "Remove from comparison" : "Add to comparison"}
                    >
                      <div className={cn(
                        "w-3 h-3 rounded-sm border-2",
                        clinic.isSelected 
                          ? "bg-primary border-primary" 
                          : "border-gray-300"
                      )} />
                    </Button>
                  )}
                  {onToggleFavorite && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggleFavorite(clinic.id, !isFavorite)
                      }}
                      className="p-1 h-8 w-8"
                      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                    >
                      <Heart
                        className={cn(
                          "h-4 w-4",
                          isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"
                        )}
                      />
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Trust Indicators Row */}
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {/* Operating Status */}
                {clinic.isOpen !== undefined && (
                  <Badge 
                    variant={clinic.isOpen ? "success" : "secondary"} 
                    className="text-xs"
                  >
                    {clinic.isOpen ? "Open Now" : "Closed"}
                  </Badge>
                )}

                {/* Emergency Indicators */}
                {clinic.isEmergencyCapable && (
                  <EmergencyIndicator
                    isEmergencyCapable={clinic.isEmergencyCapable}
                    emergencyTypes={clinic.emergencyTypes}
                    phoneNumber={clinic.emergencyPhone}
                  />
                )}

                {/* Trust Badges */}
                {clinic.isMOHVerified && (
                  <TrustBadge type="moh-verified" verified={true} />
                )}
                
                <TrustBadge type="covid-safe" verified={true} />

                {/* Accreditation */}
                {clinic.accreditationStatus && (
                  <VerificationStatus
                    status={clinic.accreditationStatus}
                    verifiedDate={clinic.verifiedDate}
                    expiryDate={clinic.licenseExpiry}
                    licenseNumber={clinic.licenseNumber}
                  />
                )}

                {/* Last Updated */}
                {clinic.lastUpdated && (
                  <LastUpdated timestamp={clinic.lastUpdated} showRelative={true} />
                )}
              </div>

              {/* Address */}
              <CardDescription className="mt-2 flex items-start gap-1.5 text-sm">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground flex-shrink-0" />
                <span className="line-clamp-2">{clinic.address}</span>
              </CardDescription>
            </div>

            {/* Clinic Image */}
            {clinic.image && !compact && (
              <Avatar className="h-16 w-16 flex-shrink-0">
                <AvatarImage src={clinic.image} alt={clinic.name} />
                <AvatarFallback className="text-sm font-medium">
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

        <CardContent className={cn(compact ? "pt-0" : "pt-0")}>
          {/* Rating & Reviews Section */}
          {clinic.rating && (
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <StarRating rating={clinic.rating} size="sm" />
                <span className="text-sm font-semibold">{clinic.rating.toFixed(1)}</span>
                {clinic.totalReviews && (
                  <span className="text-xs text-gray-500">
                    ({clinic.totalReviews} reviews)
                  </span>
                )}
                {clinic.reviewTrend && (
                  <div className="flex items-center gap-1">
                    {clinic.reviewTrend === 'improving' ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : clinic.reviewTrend === 'declining' ? (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    ) : null}
                  </div>
                )}
              </div>
              
              {showDistance && clinic.distance && (
                <Badge variant="outline" className="text-xs">
                  {clinic.distance} away
                  {clinic.travelTime && ` • ${clinic.travelTime}`}
                </Badge>
              )}
            </div>
          )}

          {/* Wait Time Information */}
          {showWaitTime && (clinic.waitTime || clinic.waitTimeEstimate) && (
            <div className="mb-3">
              {clinic.waitTime ? (
                <WaitTimeIndicator
                  waitTime={clinic.waitTime}
                  estimatedMinutes={clinic.waitTimeEstimate}
                  isLive={clinic.isLiveWaitTime}
                />
              ) : clinic.waitTimeEstimate ? (
                <WaitTimeEstimator data={waitTimeData} showFactors={false} showTrend={false} />
              ) : null}
            </div>
          )}

          {/* Contact Information */}
          <div className={cn(
            "grid gap-2 text-sm mb-3",
            compact ? "grid-cols-1" : "grid-cols-2"
          )}>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4 flex-shrink-0" />
              <a 
                href={`tel:${clinic.phone}`} 
                className="hover:text-foreground hover:underline text-ellipsis overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {clinic.phone}
              </a>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span className="text-ellipsis overflow-hidden">{clinic.hours}</span>
            </div>
          </div>

          {/* Quick Info Row */}
          <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
            {clinic.established && (
              <div className="flex items-center gap-1">
                <span>Est. {new Date().getFullYear() - clinic.established} years</span>
              </div>
            )}
            {clinic.doctorCount && (
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{clinic.doctorCount} doctors</span>
              </div>
            )}
          </div>

          {/* Insurance & Community Health Programs */}
          <div className="space-y-2 mb-3">
            {/* Insurance */}
            <InsuranceBadge
              accepted={clinic.acceptsInsurance || false}
              providers={clinic.insuranceProviders || []}
            />

            {/* Community Health Programs */}
            <div className="flex flex-wrap gap-1.5">
              {clinic.healthierSG && (
                <CommunityHealthBadge program="healthier-sg" enrolled={true} />
              )}
              {clinic.screenForLife && (
                <CommunityHealthBadge program="screen-for-life" enrolled={true} />
              )}
              {clinic.chas && (
                <CommunityHealthBadge program="chas" enrolled={true} />
              )}
              {clinic.medisave && (
                <CommunityHealthBadge program="medisave" enrolled={true} />
              )}
            </div>
          </div>

          {/* Facilities */}
          <FacilitiesBadges
            hasParking={clinic.hasParking}
            isWheelchairAccessible={clinic.isWheelchairAccessible}
            hasPharmacy={clinic.hasPharmacy}
            hasRadiology={clinic.hasRadiology}
            hasLaboratory={clinic.hasLaboratory}
            hasCafeteria={clinic.hasCafeteria}
            hasATM={clinic.hasATM}
          />

          {/* Specialties */}
          {clinic.specialties && clinic.specialties.length > 0 && (
            <div className="mt-3">
              <div className="flex flex-wrap gap-1">
                {clinic.specialties.slice(0, compact ? 2 : 4).map((specialty, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {specialty}
                  </Badge>
                ))}
                {clinic.specialties.length > (compact ? 2 : 4) && (
                  <Badge variant="outline" className="text-xs">
                    +{clinic.specialties.length - (compact ? 2 : 4)} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Reviews Summary (when enabled) */}
          {showReviews && clinic.totalReviews && clinic.totalReviews > 0 && (
            <div className="mt-3 pt-3 border-t">
              <ReviewSummary summary={mockReviewSummary} />
            </div>
          )}

          {/* Action Buttons */}
          <div className={cn(
            "flex gap-2 mt-4",
            compact ? "flex-col" : "flex-row"
          )}>
            <Button
              className={cn(compact ? "w-full text-sm" : "flex-1")}
              size={compact ? "sm" : "default"}
              onClick={(e) => {
                e.stopPropagation()
                onBookAppointment?.(clinic.id)
              }}
            >
              Book Appointment
            </Button>
            <Button
              variant="outline"
              className={cn(compact ? "w-full text-sm" : "flex-1")}
              size={compact ? "sm" : "default"}
              onClick={(e) => {
                e.stopPropagation()
                onGetDirections?.(clinic.id)
              }}
            >
              <Navigation className="mr-2 h-4 w-4" />
              Directions
            </Button>
            {onCall && (
              <Button
                variant="outline"
                size={compact ? "sm" : "default"}
                onClick={(e) => {
                  e.stopPropagation()
                  onCall(clinic.phone)
                }}
                className={cn(compact ? "w-full" : "")}
              >
                <Phone className="mr-2 h-4 w-4" />
                Call
              </Button>
            )}
          </div>

          {/* View Details Link */}
          {onViewDetails && (
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "w-full mt-2 text-xs",
                compact ? "hidden" : "block"
              )}
              onClick={(e) => {
                e.stopPropagation()
                onViewDetails(clinic.id)
              }}
            >
              View Full Details
              <ChevronRight className="ml-2 h-3 w-3" />
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }
)
EnhancedClinicCard.displayName = "EnhancedClinicCard"

export { EnhancedClinicCard }
export type { EnhancedClinic, EnhancedClinicCardProps }