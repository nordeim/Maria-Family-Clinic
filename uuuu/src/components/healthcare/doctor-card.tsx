import * as React from "react"
import {
  GraduationCap,
  MapPin,
  Star,
  Calendar,
  Clock,
  Award,
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

interface Doctor {
  id: string
  name: string
  specialty: string
  qualifications: string
  experience?: string
  rating?: number
  reviewCount?: number
  availableSlots?: string[]
  clinics?: string[]
  image?: string
  languages?: string[]
}

interface DoctorCardProps extends React.HTMLAttributes<HTMLDivElement> {
  doctor: Doctor
  onBookAppointment?: (doctorId: string) => void
  onViewProfile?: (doctorId: string) => void
  compact?: boolean
}

const DoctorCard = React.forwardRef<HTMLDivElement, DoctorCardProps>(
  (
    {
      doctor,
      onBookAppointment,
      onViewProfile,
      compact = false,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <Card
        ref={ref}
        className={cn(
          "group transition-all hover:shadow-md",
          className
        )}
        {...props}
      >
        <CardHeader className={cn(compact && "pb-3")}>
          <div className="flex items-start gap-4">
            <Avatar className={cn("h-16 w-16", compact && "h-12 w-12")}>
              <AvatarImage src={doctor.image} alt={doctor.name} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {doctor.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <CardTitle className={cn("text-xl", compact && "text-lg")}>
                Dr. {doctor.name}
              </CardTitle>
              <CardDescription className="mt-1 flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4 shrink-0" />
                <span className="truncate">{doctor.specialty}</span>
              </CardDescription>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                {doctor.qualifications}
              </p>
            </div>
          </div>
        </CardHeader>

        {!compact && (
          <CardContent className="space-y-4">
            {/* Experience and Rating */}
            <div className="flex flex-wrap items-center gap-3">
              {doctor.experience && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Award className="h-4 w-4" />
                  <span>{doctor.experience} experience</span>
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
            </div>

            {/* Languages */}
            {doctor.languages && doctor.languages.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {doctor.languages.map((language, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {language}
                  </Badge>
                ))}
              </div>
            )}

            {/* Clinics */}
            {doctor.clinics && doctor.clinics.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Available at:
                </p>
                <div className="space-y-1">
                  {doctor.clinics.map((clinic, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1.5 text-sm"
                    >
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="line-clamp-1">{clinic}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Available Slots */}
            {doctor.availableSlots && doctor.availableSlots.length > 0 && (
              <div className="rounded-md bg-muted/50 p-3">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
                  <Clock className="h-3 w-3" />
                  <span>Next available</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {doctor.availableSlots.slice(0, 3).map((slot, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {slot}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                className="flex-1"
                onClick={() => onBookAppointment?.(doctor.id)}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Book Appointment
              </Button>
              {onViewProfile && (
                <Button
                  variant="outline"
                  onClick={() => onViewProfile(doctor.id)}
                >
                  View Profile
                </Button>
              )}
            </div>
          </CardContent>
        )}

        {compact && (
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              {doctor.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                  <span className="text-sm font-medium">{doctor.rating}</span>
                </div>
              )}
              <Button
                size="sm"
                onClick={() => onBookAppointment?.(doctor.id)}
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
export type { Doctor }
