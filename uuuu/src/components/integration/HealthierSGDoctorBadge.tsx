"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { 
  Shield, 
  Award, 
  Clock, 
  Users, 
  TrendingUp, 
  Heart,
  CheckCircle,
  Star,
  MapPin,
  Phone,
  Calendar,
  Activity,
  Target,
  Zap,
  Stethoscope,
  GraduationCap,
  BookOpen,
  Briefcase,
  MessageSquare,
  FileText
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface HealthierSGDoctorBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  // Basic doctor information
  id: string
  name: string
  email?: string
  phone?: string
  medicalLicense: string
  profileImage?: string
  specialties: string[]
  qualifications: string[]
  experienceYears?: number
  bio?: string
  rating?: number
  reviewCount?: number
  isActive?: boolean
  isVerified?: boolean

  // Healthier SG Program Integration
  isHealthierSGCertified?: boolean
  certificationDate?: Date
  certificationBody?: string
  programSpecializations?: string[]
  programExperience?: {
    totalYears: number
    programCategories: string[]
    certificationLevel: string
  }
  programMetrics?: {
    programPatients: number
    programSuccessRate: number
    averageProgramRating: number
    programMilestones: number
    continuingEducation: number
  }
  programServices?: Array<{
    id: string
    name: string
    category: string
    isProgramCovered: boolean
    price?: number
    programPrice?: number
    duration?: number
  }>
  programAchievements?: Array<{
    type: string
    title: string
    date: Date
    description?: string
  }>
  programReviews?: Array<{
    id: string
    patientName: string
    rating: number
    comment: string
    programService: string
    date: Date
  }>

  // Integration with clinic and availability
  availableClinics?: Array<{
    id: string
    name: string
    address: string
    isHealthierSGParticipating: boolean
    distance?: number
    nextAvailable?: Date
  }>

  // Actions
  onViewProfile?: (doctorId: string) => void
  onBookAppointment?: (doctorId: string, clinicId?: string) => void
  onViewProgramInfo?: (doctorId: string) => void
  onContact?: (doctorId: string, method: 'phone' | 'email' | 'message') => void

  // Display options
  showProgramDetails?: boolean
  showMetrics?: boolean
  showReviews?: boolean
  showAvailability?: boolean
  compact?: boolean
  variant?: 'default' | 'program-focused' | 'achievement-focused'
}

export function HealthierSGDoctorBadge({
  id,
  name,
  email,
  phone,
  medicalLicense,
  profileImage,
  specialties = [],
  qualifications = [],
  experienceYears,
  bio,
  rating,
  reviewCount,
  isActive = true,
  isVerified = false,

  // Program integration
  isHealthierSGCertified = false,
  certificationDate,
  certificationBody,
  programSpecializations = [],
  programExperience,
  programMetrics,
  programServices = [],
  programAchievements = [],
  programReviews = [],

  // Clinic integration
  availableClinics = [],

  // Actions
  onViewProfile,
  onBookAppointment,
  onViewProgramInfo,
  onContact,

  // Display options
  showProgramDetails = true,
  showMetrics = true,
  showReviews = false,
  showAvailability = true,
  compact = false,
  variant = 'default',

  className,
  ...props
}: HealthierSGDoctorBadgeProps) {
  const handleContact = (method: 'phone' | 'email' | 'message') => {
    onContact?.(id, method)
  }

  const handleBookAppointment = (clinicId?: string) => {
    onBookAppointment?.(id, clinicId)
  }

  const getCertificationLevel = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'expert': return { level: 'Expert', color: 'bg-purple-100 text-purple-800' }
      case 'advanced': return { level: 'Advanced', color: 'bg-blue-100 text-blue-800' }
      case 'intermediate': return { level: 'Intermediate', color: 'bg-green-100 text-green-800' }
      case 'basic': return { level: 'Basic', color: 'bg-gray-100 text-gray-800' }
      default: return { level: level || 'Certified', color: 'bg-gray-100 text-gray-800' }
    }
  }

  const primaryClinic = availableClinics.find(c => c.isHealthierSGParticipating) || availableClinics[0]

  const certInfo = programExperience ? getCertificationLevel(programExperience.certificationLevel) : null

  return (
    <Card
      className={cn(
        "group transition-all hover:shadow-md border-2",
        isHealthierSGCertified && "border-green-200 bg-green-50/30",
        variant === 'program-focused' && "ring-2 ring-green-200",
        variant === 'achievement-focused' && "ring-2 ring-purple-200",
        compact && "p-4",
        className
      )}
      {...props}
    >
      <CardHeader className={cn(compact && "pb-2")}>
        <div className="flex items-start gap-4">
          {profileImage && (
            <Avatar className={cn("h-16 w-16", compact && "h-12 w-12")}>
              <AvatarImage src={profileImage} alt={name} />
              <AvatarFallback>
                {name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
          
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className={cn("font-semibold", compact ? "text-lg" : "text-xl")}>
                    Dr. {name}
                  </h3>
                  
                  {isHealthierSGCertified && (
                    <Badge 
                      variant="default" 
                      className={cn(
                        "hover:bg-green-700",
                        variant === 'program-focused' ? "bg-green-600" : "bg-green-600"
                      )}
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      Healthier SG Certified
                    </Badge>
                  )}
                  
                  {isVerified && (
                    <Badge variant="outline" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                  
                  {certInfo && (
                    <Badge className={certInfo.color}>
                      <Award className="h-3 w-3 mr-1" />
                      {certInfo.level}
                    </Badge>
                  )}
                </div>

                {/* Specialties */}
                <div className="mt-1 flex flex-wrap gap-1">
                  {specialties.slice(0, compact ? 2 : 3).map((specialty, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                  {specialties.length > (compact ? 2 : 3) && (
                    <Badge variant="secondary" className="text-xs">
                      +{specialties.length - (compact ? 2 : 3)} more
                    </Badge>
                  )}
                </div>

                {/* Program Specializations */}
                {isHealthierSGCertified && programSpecializations.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {programSpecializations.slice(0, compact ? 1 : 2).map((spec, index) => (
                      <Badge key={index} variant="outline" className="text-xs border-green-300 text-green-700">
                        <Target className="h-3 w-3 mr-1" />
                        {spec}
                      </Badge>
                    ))}
                    {programSpecializations.length > (compact ? 1 : 2) && (
                      <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                        +{programSpecializations.length - (compact ? 1 : 2)} more
                      </Badge>
                    )}
                  </div>
                )}

                {/* Experience and Rating */}
                <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                  {experienceYears && (
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      <span>{experienceYears} years exp.</span>
                    </div>
                  )}
                  
                  {programExperience && (
                    <div className="flex items-center gap-1">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span>{programExperience.totalYears}yr program</span>
                    </div>
                  )}
                  
                  {rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                      <span>{rating}</span>
                      {reviewCount && <span>({reviewCount})</span>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className={cn("space-y-4", compact && "space-y-2")}>
        {/* Program Metrics */}
        {isHealthierSGCertified && showMetrics && programMetrics && (
          <div className="bg-green-50 p-3 rounded-lg space-y-3">
            <h4 className="font-medium text-green-800 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Program Performance
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs text-gray-600">Program Patients</div>
                <div className="font-semibold text-green-800">
                  {programMetrics.programPatients.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600">Success Rate</div>
                <div className="font-semibold text-green-800">
                  {programMetrics.programSuccessRate}%
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600">Avg. Rating</div>
                <div className="font-semibold text-green-800">
                  {programMetrics.averageProgramRating}/5.0
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600">CME Points</div>
                <div className="font-semibold text-green-800">
                  {programMetrics.continuingEducation}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Program Services */}
        {isHealthierSGCertified && showProgramDetails && programServices.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-blue-600" />
              Program Services
            </h4>
            <div className="space-y-2">
              {programServices.slice(0, compact ? 2 : 3).map((service) => (
                <div key={service.id} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{service.name}</div>
                    <div className="text-xs text-gray-600">{service.category}</div>
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
                    <Badge variant={service.isProgramCovered ? "default" : "secondary"} className="text-xs">
                      {service.isProgramCovered ? "Covered" : "Private"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Program Achievements */}
        {isHealthierSGCertified && showProgramDetails && programAchievements.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <Award className="h-4 w-4 text-purple-600" />
              Recent Achievements
            </h4>
            <div className="space-y-2">
              {programAchievements.slice(0, compact ? 1 : 2).map((achievement, index) => (
                <div key={index} className="flex items-center gap-3 p-2 bg-purple-50 rounded-lg">
                  <Award className="h-4 w-4 text-purple-600 shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{achievement.title}</div>
                    <div className="text-xs text-gray-600">
                      {achievement.date.toLocaleDateString()}
                    </div>
                    {achievement.description && (
                      <div className="text-xs text-gray-500">{achievement.description}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Clinic Availability */}
        {showAvailability && availableClinics.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-600" />
              Available Clinics
            </h4>
            <div className="space-y-2">
              {availableClinics.slice(0, compact ? 1 : 2).map((clinic) => (
                <div key={clinic.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm flex items-center gap-2">
                      {clinic.name}
                      {clinic.isHealthierSGParticipating && (
                        <Badge variant="secondary" className="text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          Healthier SG
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-gray-600">{clinic.address}</div>
                    {clinic.distance && (
                      <div className="text-xs text-gray-500">
                        {clinic.distance < 1 ? `${Math.round(clinic.distance * 1000)}m` : `${clinic.distance.toFixed(1)}km`} away
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    {clinic.nextAvailable && (
                      <div className="text-xs text-gray-600">
                        Next: {clinic.nextAvailable.toLocaleDateString()}
                      </div>
                    )}
                    {onBookAppointment && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-6 mt-1"
                        onClick={() => handleBookAppointment(clinic.id)}
                      >
                        Book
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2">
          {onViewProfile && (
            <Button
              variant="outline"
              size={compact ? "sm" : "default"}
              onClick={() => onViewProfile?.(id)}
              className="flex-1"
            >
              <FileText className="mr-1 h-4 w-4" />
              View Profile
            </Button>
          )}
          
          {onBookAppointment && (
            <Button
              size={compact ? "sm" : "default"}
              onClick={() => handleBookAppointment()}
              className={cn(
                "flex-1",
                isHealthierSGCertified && "bg-green-600 hover:bg-green-700"
              )}
            >
              <Calendar className="mr-1 h-4 w-4" />
              Book
            </Button>
          )}
        </div>

        {/* Contact Actions */}
        {(phone || email) && (
          <div className="flex gap-2">
            {phone && (
              <Button
                variant="secondary"
                size={compact ? "sm" : "default"}
                onClick={() => handleContact('phone')}
                className="flex-1"
              >
                <Phone className="mr-1 h-4 w-4" />
                Call
              </Button>
            )}
            {email && (
              <Button
                variant="secondary"
                size={compact ? "sm" : "default"}
                onClick={() => handleContact('email')}
                className="flex-1"
              >
                <MessageSquare className="mr-1 h-4 w-4" />
                Email
              </Button>
            )}
          </div>
        )}

        {/* Program-specific Actions */}
        {isHealthierSGCertified && onViewProgramInfo && (
          <Button
            variant="outline"
            size={compact ? "sm" : "default"}
            onClick={() => onViewProgramInfo?.(id)}
            className="w-full"
          >
            <BookOpen className="mr-2 h-4 w-4" />
            View Program Info
          </Button>
        )}

        {/* Bio */}
        {bio && compact && (
          <p className="text-sm text-gray-600 line-clamp-2">{bio}</p>
        )}
        {bio && !compact && (
          <p className="text-sm text-gray-600">{bio}</p>
        )}
      </CardContent>
    </Card>
  )
}

export type { HealthierSGDoctorBadgeProps }