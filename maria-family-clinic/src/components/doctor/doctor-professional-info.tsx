import * as React from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  GraduationCap,
  Stethoscope,
  Calendar,
  MapPin,
  Briefcase,
  Heart,
  Brain,
  Users,
  Award,
  BookOpen,
  Star,
  Clock
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Doctor {
  id: string
  firstName: string
  lastName: string
  specialties: string[]
  languages: string[]
  experience?: number
  qualifications?: string[]
  profile?: {
    bio?: string
    description?: string
  }
  medicalLicense: string
  isVerified: boolean
  verificationDate?: Date
  clinics: Array<{
    id: string
    name: string
    address: string
    role?: string
    workingDays?: string[]
    startTime?: string
    endTime?: string
    consultationFee?: number
    currency?: string
  }>
}

interface DoctorProfessionalInfoProps {
  doctor: Doctor
  className?: string
}

export function DoctorProfessionalInfo({ doctor, className }: DoctorProfessionalInfoProps) {
  return (
    <Card className={cn("h-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Professional Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Medical License */}
        <div className="space-y-2">
          <h4 className="font-semibold flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" />
            Medical License
          </h4>
          <p className="text-sm text-muted-foreground font-mono bg-muted/50 px-3 py-2 rounded-md">
            {doctor.medicalLicense}
          </p>
          {doctor.verificationDate && (
            <p className="text-xs text-muted-foreground">
              Verified on {doctor.verificationDate.toLocaleDateString()}
            </p>
          )}
        </div>

        <Separator />

        {/* Qualifications */}
        {doctor.qualifications && doctor.qualifications.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" />
              Qualifications & Certifications
            </h4>
            <div className="space-y-2">
              {doctor.qualifications.map((qualification, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg"
                >
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{qualification}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Specialties Detail */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-primary" />
            Areas of Specialization
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {doctor.specialties.map((specialty, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="justify-start p-3 h-auto whitespace-normal"
              >
                <div className="flex items-center gap-2">
                  <Star className="h-3 w-3 text-primary" />
                  <span className="text-xs font-medium">{specialty}</span>
                </div>
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        {/* Languages with Proficiency */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <svg className="h-4 w-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
            </svg>
            Languages Spoken
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {doctor.languages.map((language, index) => (
              <div 
                key={index}
                className="flex items-center gap-2 p-2 bg-muted/30 rounded-md"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm font-medium">{language}</span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Experience Highlights */}
        {doctor.experience && (
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Professional Experience
            </h4>
            <div className="space-y-4">
              {/* Years of Experience */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">{doctor.experience}</p>
                    <p className="text-sm text-muted-foreground">Years of Practice</p>
                  </div>
                </div>
              </div>

              {/* Career Milestones */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Career Highlights</p>
                <div className="space-y-2">
                  {doctor.experience >= 10 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Award className="h-4 w-4 text-amber-500" />
                      <span>Experienced practitioner (10+ years)</span>
                    </div>
                  )}
                  {doctor.experience >= 15 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Brain className="h-4 w-4 text-purple-500" />
                      <span>Senior medical professional</span>
                    </div>
                  )}
                  {doctor.experience >= 20 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span>Medical expertise and leadership</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* Professional Philosophy */}
        {(doctor.profile?.bio || doctor.profile?.description) && (
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary" />
              Professional Philosophy
            </h4>
            <div className="prose prose-sm max-w-none">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {doctor.profile?.bio || doctor.profile?.description}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}