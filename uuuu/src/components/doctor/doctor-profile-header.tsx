import * as React from "react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Star, 
  MapPin, 
  GraduationCap, 
  Award, 
  Clock,
  Phone,
  Mail,
  Verified,
  Shield
} from "lucide-react"
import { cn } from "@/lib/utils"
import { VerificationStatus } from "@/components/healthcare/trust-indicators"

interface DoctorProfileHeaderProps {
  doctor: {
    id: string
    firstName: string
    lastName: string
    specialties: string[]
    languages: string[]
    experience?: number
    rating?: {
      average: number
      count: number
    }
    profile?: {
      photo?: string
      bio?: string
      description?: string
    }
    medicalLicense: string
    isVerified: boolean
    verificationDate?: Date
    email?: string
    phone?: string
    qualifications?: string[]
  }
  className?: string
}

export function DoctorProfileHeader({ doctor, className }: DoctorProfileHeaderProps) {
  const fullName = `Dr. ${doctor.firstName} ${doctor.lastName}`
  const initials = doctor.firstName.split(' ').map(n => n[0]).join('') + doctor.lastName[0]
  
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Doctor Photo */}
          <div className="flex-shrink-0">
            <Avatar className="h-32 w-32 sm:h-40 sm:w-40 border-4 border-primary/10">
              <AvatarImage 
                src={doctor.profile?.photo} 
                alt={fullName}
                className="object-cover"
              />
              <AvatarFallback className="text-2xl font-semibold bg-primary/10 text-primary">
                {initials.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Doctor Information */}
          <div className="flex-1 min-w-0">
            <div className="space-y-4">
              {/* Name and Verification */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-3xl sm:text-4xl font-bold leading-tight">
                    {fullName}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <VerificationStatus 
                      status={doctor.isVerified ? 'verified' : 'unverified'}
                      verifiedDate={doctor.verificationDate}
                      licenseNumber={doctor.medicalLicense}
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Rating */}
              {doctor.rating && doctor.rating.count > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-5 w-5",
                          i < Math.floor(doctor.rating!.average)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        )}
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-lg">
                    {doctor.rating.average.toFixed(1)}
                  </span>
                  <span className="text-muted-foreground">
                    ({doctor.rating.count} review{doctor.rating.count === 1 ? '' : 's'})
                  </span>
                </div>
              )}

              {/* Specialties */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-muted-foreground flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Specialties
                </h3>
                <div className="flex flex-wrap gap-2">
                  {doctor.specialties.map((specialty, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="text-sm px-3 py-1"
                    >
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Key Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Experience */}
                {doctor.experience && (
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">{doctor.experience}</span> years experience
                    </span>
                  </div>
                )}

                {/* Languages */}
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
                  </svg>
                  <span className="text-sm">
                    <span className="font-medium">{doctor.languages.length}</span> language{doctor.languages.length === 1 ? '' : 's'}
                  </span>
                </div>
              </div>

              {/* Contact Information */}
              {(doctor.email || doctor.phone) && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-muted-foreground">
                    Contact Information
                  </h4>
                  <div className="flex flex-col sm:flex-row gap-3">
                    {doctor.email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <a 
                          href={`mailto:${doctor.email}`}
                          className="hover:text-primary transition-colors"
                        >
                          {doctor.email}
                        </a>
                      </div>
                    )}
                    {doctor.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <a 
                          href={`tel:${doctor.phone}`}
                          className="hover:text-primary transition-colors"
                        >
                          {doctor.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Bio/Description Preview */}
      {(doctor.profile?.bio || doctor.profile?.description) && (
        <CardContent className="pt-0">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">About Dr. {doctor.lastName}</h3>
            <div className="prose prose-sm max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                {doctor.profile?.bio || doctor.profile?.description}
              </p>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}