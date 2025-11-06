import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Share2,
  Printer,
  Calendar,
  Heart,
  MessageSquare,
  Phone,
  MapPin,
  Star,
  ChevronUp,
  ChevronDown,
  Clock,
  Award,
  Shield
} from "lucide-react"
import { cn } from "@/lib/utils"
import { 
  DoctorProfileHeader,
  DoctorProfessionalInfo,
  DoctorCredentialsSection,
  DoctorClinicAffiliations,
  DoctorPatientInfo,
  DoctorTrustIndicators,
  DoctorInteractiveActions,
  DoctorReviewsSection
} from "@/components/doctor"
import { VerificationStatus } from "@/components/healthcare/trust-indicators"

interface Doctor {
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

interface DoctorMobileLayoutProps {
  doctor: Doctor
  className?: string
}

export function DoctorMobileLayout({ doctor, className }: DoctorMobileLayoutProps) {
  const [activeTab, setActiveTab] = React.useState("overview")
  const [showFullBio, setShowFullBio] = React.useState(false)

  const fullName = `Dr. ${doctor.firstName} ${doctor.lastName}`

  // Mock additional data
  const quickStats = [
    { label: "Years Experience", value: doctor.experience || "N/A", icon: Award },
    { label: "Patient Reviews", value: doctor.rating?.count || 0, icon: Star },
    { label: "Languages", value: doctor.languages.length, icon: MessageSquare },
    { label: "Clinic Locations", value: doctor.clinics.length, icon: MapPin }
  ]

  // Handle quick actions
  const handleCall = () => {
    if (doctor.phone) {
      window.location.href = `tel:${doctor.phone}`
    }
  }

  const handleEmail = () => {
    if (doctor.email) {
      window.location.href = `mailto:${doctor.email}`
    }
  }

  const handleShare = async () => {
    const shareUrl = window.location.href
    const shareTitle = `${fullName} - ${doctor.specialties.join(', ')}`
    const shareText = `Book an appointment with ${fullName}, ${doctor.specialties.join(', ')} specialist.`

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        })
      } catch (error) {
        console.log("Share cancelled")
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl)
        console.log("Link copied to clipboard")
      } catch (error) {
        console.error("Failed to copy link")
      }
    }
  }

  const handleSave = () => {
    console.log("Saving doctor to favorites:", doctor.id)
    // In real app, this would call API
  }

  const handleBookAppointment = () => {
    console.log("Booking appointment with doctor:", doctor.id)
    // window.location.href = `/appointments/book?doctor=${doctor.id}`
  }

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold truncate">{fullName}</h1>
              <p className="text-sm text-muted-foreground truncate">
                {doctor.specialties.join(', ')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSave}>
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 space-y-6">
        {/* Quick Stats Bar */}
        <div className="grid grid-cols-4 gap-2">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="text-center p-2 bg-muted/30 rounded-lg">
                <Icon className="h-4 w-4 mx-auto mb-1 text-primary" />
                <p className="text-xs font-semibold">{stat.value}</p>
                <p className="text-xs text-muted-foreground leading-tight">
                  {stat.label}
                </p>
              </div>
            )
          })}
        </div>

        {/* Primary Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={handleBookAppointment} className="h-12">
            <Calendar className="h-4 w-4 mr-2" />
            Book Appointment
          </Button>
          <div className="grid grid-cols-2 gap-2">
            {doctor.phone && (
              <Button variant="outline" size="sm" onClick={handleCall}>
                <Phone className="h-4 w-4" />
              </Button>
            )}
            {doctor.email && (
              <Button variant="outline" size="sm" onClick={handleEmail}>
                <MessageSquare className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Verification Badge */}
        <div className="flex justify-center">
          <VerificationStatus 
            status={doctor.isVerified ? 'verified' : 'unverified'}
            verifiedDate={doctor.verificationDate}
            licenseNumber={doctor.medicalLicense}
            className="text-sm"
          />
        </div>

        {/* Rating Summary */}
        {doctor.rating && doctor.rating.count > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-4 w-4",
                          i < Math.floor(doctor.rating!.average)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        )}
                      />
                    ))}
                  </div>
                  <span className="font-semibold">
                    {doctor.rating.average.toFixed(1)}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {doctor.rating.count} reviews
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bio Preview */}
        {(doctor.profile?.bio || doctor.profile?.description) && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">About Dr. {doctor.lastName}</h3>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {showFullBio 
                    ? (doctor.profile?.bio || doctor.profile?.description)
                    : (doctor.profile?.bio || doctor.profile?.description)?.substring(0, 150) + '...'
                  }
                </p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowFullBio(!showFullBio)}
                  className="h-6 px-2 text-xs"
                >
                  {showFullBio ? (
                    <>
                      <ChevronUp className="h-3 w-3 mr-1" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3 mr-1" />
                      Read More
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Clinic Locations Summary */}
        {doctor.clinics && doctor.clinics.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Clinic Locations</h3>
              <div className="space-y-3">
                {doctor.clinics.map((clinic, index) => (
                  <div key={clinic.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{clinic.name}</h4>
                      {clinic.role && (
                        <Badge variant="outline" className="text-xs">
                          {clinic.role}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span className="text-xs">{clinic.address}</span>
                    </div>
                    {clinic.consultationFee && (
                      <div className="flex items-center gap-1 text-sm">
                        <span className="font-medium">Consultation:</span>
                        <span className="text-primary font-semibold">
                          ${clinic.consultationFee.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabbed Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="credentials" className="text-xs">Credentials</TabsTrigger>
            <TabsTrigger value="reviews" className="text-xs">Reviews</TabsTrigger>
            <TabsTrigger value="schedule" className="text-xs">Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <DoctorPatientInfo doctor={doctor} />
            <DoctorTrustIndicators doctor={doctor} />
          </TabsContent>

          <TabsContent value="credentials" className="space-y-4 mt-4">
            <DoctorCredentialsSection doctor={doctor} />
            <DoctorProfessionalInfo doctor={doctor} />
          </TabsContent>

          <TabsContent value="reviews" className="mt-4">
            <DoctorReviewsSection doctor={doctor} />
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4 mt-4">
            <DoctorClinicAffiliations doctor={doctor} />
          </TabsContent>
        </Tabs>

        {/* Floating Action Button for Booking */}
        <div className="fixed bottom-6 right-6 z-40">
          <Button 
            onClick={handleBookAppointment}
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg"
          >
            <Calendar className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  )
}