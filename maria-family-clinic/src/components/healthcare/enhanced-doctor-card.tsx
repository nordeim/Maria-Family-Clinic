'use client'

import * as React from "react"
import {
  GraduationCap,
  MapPin,
  Star,
  Calendar,
  Clock,
  Award,
  Users,
  Phone,
  Heart,
  Shield,
  CheckCircle,
  Languages,
  Activity,
  Zap,
  ExternalLink,
  Bookmark,
  BookmarkPlus,
  MessageCircle,
  Video,
  Navigation,
  Building,
  DollarSign,
  Globe,
  UserCheck,
  AlertCircle
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
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"

interface EnhancedDoctorCardProps extends React.HTMLAttributes<HTMLDivElement> {
  doctor: {
    id: string
    name: string
    specialties: string[]
    qualifications: string[]
    experience?: string
    rating?: number
    reviewCount?: number
    availableSlots?: string[]
    clinics?: string[]
    image?: string
    languages?: string[]
    
    // Additional search result fields
    experienceYears?: number
    certifications?: string[]
    conditionsTreated?: string[]
    services?: string[]
    acceptsInsurance?: boolean
    insuranceTypes?: string[]
    clinicAffiliations?: Array<{
      id: string
      name: string
      address: string
      rating?: number
      distance?: number
      nextAvailable?: string
      clinicType?: string
      isPrimary?: boolean
    }>
    isMOHVerified?: boolean
    gender?: 'MALE' | 'FEMALE'
    yearsOfPractice?: number
    bio?: string
    consultationFee?: number
    currency?: string
    nextAvailableDate?: string
    waitTimeEstimate?: string
    responseTime?: string
    availabilityScore?: number
    experienceLevel?: 'JUNIOR' | 'SENIOR' | 'EXPERT' | 'CONSULTANT'
    location?: {
      address: string
      postalCode: string
      distance?: number
    }
    specialties?: string[]
    languages?: string[]
    clinicTypes?: string[]
    accessibilityFeatures?: string[]
    ratings?: {
      overall: number
      bedsideManner: number
      waitTime: number
      facility: number
    }
    badges?: string[]
    isAvailable?: boolean
    popularServices?: string[]
    patientRecommendations?: number
    hasVideoConsultation?: boolean
    hasTelemedicine?: boolean
    acceptsWalkIns?: boolean
  }
  onBookAppointment?: (doctorId: string, clinicId?: string) => void
  onViewProfile?: (doctorId: string) => void
  onCallDoctor?: (doctorId: string) => void
  onGetDirections?: (doctorId: string, clinicId?: string) => void
  onSendMessage?: (doctorId: string) => void
  onVideoConsultation?: (doctorId: string) => void
  onToggleFavorite?: (doctorId: string, isFavorite: boolean) => void
  isFavorite?: boolean
  variant?: 'grid' | 'list' | 'compact' | 'featured'
  showFullDetails?: boolean
  showClinicDetails?: boolean
  compact?: boolean
  className?: string
  ...props
}

const DoctorCard = React.forwardRef<HTMLDivElement, EnhancedDoctorCardProps>(
  (
    {
      doctor,
      onBookAppointment,
      onViewProfile,
      onCallDoctor,
      onGetDirections,
      onSendMessage,
      onVideoConsultation,
      onToggleFavorite,
      isFavorite = false,
      variant = 'grid',
      showFullDetails = true,
      showClinicDetails = true,
      compact = false,
      className,
      ...props
    },
    ref
  ) => {
    const isCompact = variant === 'compact' || compact
    const isListView = variant === 'list'
    const isFeatured = variant === 'featured'

    const getExperienceLevelColor = (level?: string) => {
      switch (level) {
        case 'EXPERT':
          return 'text-purple-600 bg-purple-50 border-purple-200'
        case 'CONSULTANT':
          return 'text-blue-600 bg-blue-50 border-blue-200'
        case 'SENIOR':
          return 'text-green-600 bg-green-50 border-green-200'
        default:
          return 'text-gray-600 bg-gray-50 border-gray-200'
      }
    }

    const formatCurrency = (amount?: number, currency = 'SGD') => {
      if (!amount) return null
      return new Intl.NumberFormat('en-SG', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0
      }).format(amount)
    }

    const getAvailabilityStatus = () => {
      if (doctor.isAvailable === false) {
        return { label: 'Unavailable', color: 'text-red-600 bg-red-50' }
      }
      
      if (doctor.nextAvailableDate) {
        const nextDate = new Date(doctor.nextAvailableDate)
        const now = new Date()
        const diffHours = Math.floor((nextDate.getTime() - now.getTime()) / (1000 * 60 * 60))
        
        if (diffHours <= 24) {
          return { label: `Today ${nextDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`, color: 'text-green-600 bg-green-50' }
        } else if (diffHours <= 168) { // 1 week
          return { label: nextDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }), color: 'text-blue-600 bg-blue-50' }
        } else {
          return { label: nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), color: 'text-gray-600 bg-gray-50' }
        }
      }
      
      return { label: 'Available', color: 'text-green-600 bg-green-50' }
    }

    const availabilityStatus = getAvailabilityStatus()
    const primaryClinic = doctor.clinicAffiliations?.find(c => c.isPrimary) || doctor.clinicAffiliations?.[0]
    const experienceLevel = doctor.experienceLevel || (doctor.experienceYears && doctor.experienceYears >= 15 ? 'EXPERT' : doctor.experienceYears && doctor.experienceYears >= 8 ? 'SENIOR' : 'JUNIOR')

    return (
      <Card
        ref={ref}
        className={cn(
          "group transition-all duration-200 hover:shadow-lg",
          isFeatured && "ring-2 ring-primary/20 border-primary/20",
          isCompact && "p-4",
          className
        )}
        {...props}
      >
        <CardHeader className={cn(isCompact && "pb-3")}>
          {/* Header with Avatar and Basic Info */}
          <div className="flex items-start gap-4">
            {/* Doctor Avatar */}
            <div className="relative">
              <Avatar className={cn("h-16 w-16", isCompact && "h-12 w-12")}>
                <AvatarImage src={doctor.image} alt={doctor.name} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {doctor.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              {/* Verification Badge */}
              {doctor.isMOHVerified && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <CheckCircle className="absolute -bottom-1 -right-1 h-5 w-5 text-green-600 bg-white rounded-full" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>MOH Verified</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              {/* Experience Level Badge */}
              <Badge 
                className={cn(
                  "absolute -top-1 -left-1 text-xs px-1.5 py-0.5 border",
                  getExperienceLevelColor(experienceLevel)
                )}
              >
                {experienceLevel}
              </Badge>
            </div>

            {/* Doctor Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className={cn("text-xl", isCompact && "text-lg")}>
                    Dr. {doctor.name}
                  </CardTitle>
                  <CardDescription className="mt-1 flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 shrink-0" />
                    <span className="truncate">{doctor.specialties.join(', ')}</span>
                  </CardDescription>
                  
                  {/* Qualifications */}
                  {showFullDetails && doctor.qualifications.length > 0 && (
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                      {doctor.qualifications.join(', ')}
                    </p>
                  )}
                  
                  {/* Experience & Rating */}
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    {doctor.experience && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Award className="h-4 w-4" />
                        <span>{doctor.experience}</span>
                      </div>
                    )}
                    
                    {doctor.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-warning text-warning" />
                        <span className="text-sm font-medium">{doctor.rating}</span>
                        {doctor.reviewCount && (
                          <span className="text-sm text-muted-foreground">
                            ({doctor.reviewCount})
                          </span>
                        )}
                      </div>
                    )}
                    
                    {doctor.patientRecommendations && (
                      <div className="flex items-center gap-1 text-sm text-green-600">
                        <UserCheck className="h-4 w-4" />
                        <span>{doctor.patientRecommendations}% recommend</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  {/* Favorite Button */}
                  {onToggleFavorite && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleFavorite(doctor.id, !isFavorite)}
                      className={cn(
                        "p-2",
                        isFavorite && "text-red-500 hover:text-red-600"
                      )}
                    >
                      {isFavorite ? (
                        <Bookmark className="h-4 w-4" />
                      ) : (
                        <BookmarkPlus className="h-4 w-4" />
                      )}
                    </Button>
                  )}

                  {/* Action Menu for Mobile */}
                  <div className="flex gap-1 sm:hidden">
                    {onCallDoctor && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onCallDoctor(doctor.id)}
                        className="p-2"
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        {/* Content */}
        {(showFullDetails || isListView) && (
          <CardContent className="space-y-4">
            {/* Availability Status */}
            {doctor.nextAvailableDate && (
              <div className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium",
                availabilityStatus.color
              )}>
                <Clock className="h-3 w-3" />
                <span>{availabilityStatus.label}</span>
              </div>
            )}

            {/* Languages */}
            {doctor.languages && doctor.languages.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Languages className="h-3 w-3" />
                  <span>Languages</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {doctor.languages.map((language, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {language}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Clinic Information */}
            {showClinicDetails && doctor.clinicAffiliations && doctor.clinicAffiliations.length > 0 && (
              <div className="space-y-3">
                {doctor.clinicAffiliations.slice(0, isListView ? 2 : 1).map((clinic, index) => (
                  <div key={clinic.id} className={cn(
                    "p-3 rounded-lg border",
                    clinic.isPrimary && "bg-primary/5 border-primary/20"
                  )}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground shrink-0" />
                          <h4 className="font-medium text-sm truncate">{clinic.name}</h4>
                          {clinic.isPrimary && (
                            <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                              Primary
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{clinic.address}</span>
                        </p>
                        
                        <div className="flex items-center gap-3 mt-2">
                          {clinic.distance && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Navigation className="h-3 w-3" />
                              {clinic.distance}km
                            </span>
                          )}
                          
                          {clinic.rating && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              {clinic.rating}
                            </span>
                          )}
                          
                          {clinic.clinicType && (
                            <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                              {clinic.clinicType}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        {clinic.nextAvailable && (
                          <Badge variant="outline" className="text-xs">
                            {clinic.nextAvailable}
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onGetDirections?.(doctor.id, clinic.id)}
                          className="text-xs px-2 py-1"
                        >
                          <Navigation className="h-3 w-3 mr-1" />
                          Directions
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Consultation Fee */}
            {doctor.consultationFee && (
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="font-medium">{formatCurrency(doctor.consultationFee, doctor.currency)}</span>
                <span className="text-xs text-muted-foreground">consultation fee</span>
              </div>
            )}

            {/* Services & Conditions */}
            {(doctor.services || doctor.conditionsTreated) && (
              <div className="space-y-3">
                {doctor.services && doctor.services.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      Specializes in:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {doctor.services.slice(0, 4).map((service, index) => (
                        <Badge key={index} variant="outline" className="text-xs px-2 py-0.5">
                          {service}
                        </Badge>
                      ))}
                      {doctor.services.length > 4 && (
                        <Badge variant="outline" className="text-xs px-2 py-0.5">
                          +{doctor.services.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                
                {doctor.conditionsTreated && doctor.conditionsTreated.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      Treats:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {doctor.conditionsTreated.slice(0, 3).map((condition, index) => (
                        <Badge key={index} variant="outline" className="text-xs px-2 py-0.5">
                          {condition}
                        </Badge>
                      ))}
                      {doctor.conditionsTreated.length > 3 && (
                        <Badge variant="outline" className="text-xs px-2 py-0.5">
                          +{doctor.conditionsTreated.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Insurance & Payment */}
            {doctor.acceptsInsurance && (
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-blue-600" />
                <span className="text-muted-foreground">Accepts Insurance</span>
                {doctor.insuranceTypes && doctor.insuranceTypes.length > 0 && (
                  <div className="flex gap-1">
                    {doctor.insuranceTypes.slice(0, 2).map((type, index) => (
                      <Badge key={index} variant="outline" className="text-xs px-1.5 py-0.5">
                        {type}
                      </Badge>
                    ))}
                    {doctor.insuranceTypes.length > 2 && (
                      <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                        +{doctor.insuranceTypes.length - 2}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Availability Score */}
            {doctor.availabilityScore !== undefined && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Availability Score</span>
                  <span className="font-medium">{doctor.availabilityScore}%</span>
                </div>
                <Progress value={doctor.availabilityScore} className="h-2" />
              </div>
            )}

            {/* Special Features */}
            {(doctor.hasVideoConsultation || doctor.hasTelemedicine || doctor.acceptsWalkIns) && (
              <div className="flex flex-wrap gap-2">
                {doctor.hasVideoConsultation && (
                  <Badge variant="outline" className="text-xs px-2 py-0.5 text-blue-600">
                    <Video className="h-3 w-3 mr-1" />
                    Video Call
                  </Badge>
                )}
                {doctor.hasTelemedicine && (
                  <Badge variant="outline" className="text-xs px-2 py-0.5 text-green-600">
                    <Globe className="h-3 w-3 mr-1" />
                    Telemedicine
                  </Badge>
                )}
                {doctor.acceptsWalkIns && (
                  <Badge variant="outline" className="text-xs px-2 py-0.5 text-orange-600">
                    Walk-ins Welcome
                  </Badge>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button
                className="w-full"
                onClick={() => onBookAppointment?.(doctor.id, primaryClinic?.id)}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Book Appointment
              </Button>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewProfile?.(doctor.id)}
                  className="flex-1"
                >
                  <ExternalLink className="mr-1 h-3 w-3" />
                  Profile
                </Button>
                
                {onSendMessage && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSendMessage(doctor.id)}
                    className="flex-1"
                  >
                    <MessageCircle className="mr-1 h-3 w-3" />
                    Message
                  </Button>
                )}
              </div>
            </div>

            {/* Hidden Desktop Actions */}
            <div className="hidden sm:flex gap-2 pt-2 border-t">
              {onCallDoctor && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCallDoctor(doctor.id)}
                  className="flex-1"
                >
                  <Phone className="mr-2 h-4 w-4" />
                  Call
                </Button>
              )}
              
              {onGetDirections && primaryClinic && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onGetDirections(doctor.id, primaryClinic.id)}
                  className="flex-1"
                >
                  <Navigation className="mr-2 h-4 w-4" />
                  Directions
                </Button>
              )}
              
              {onVideoConsultation && doctor.hasVideoConsultation && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onVideoConsultation(doctor.id)}
                  className="flex-1"
                >
                  <Video className="mr-2 h-4 w-4" />
                  Video Call
                </Button>
              )}
            </div>
          </CardContent>
        )}

        {/* Compact View Actions */}
        {isCompact && (
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {doctor.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                    <span className="text-sm font-medium">{doctor.rating}</span>
                  </div>
                )}
                {doctor.languages && doctor.languages.length > 0 && (
                  <div className="flex gap-1">
                    <Languages className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {doctor.languages[0]}
                      {doctor.languages.length > 1 && `+${doctor.languages.length - 1}`}
                    </span>
                  </div>
                )}
              </div>
              <Button
                size="sm"
                onClick={() => onBookAppointment?.(doctor.id, primaryClinic?.id)}
              >
                Book Now
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    )
  }
)
DoctorCard.displayName = "DoctorCard"

export { DoctorCard }
export type { EnhancedDoctorCardProps }