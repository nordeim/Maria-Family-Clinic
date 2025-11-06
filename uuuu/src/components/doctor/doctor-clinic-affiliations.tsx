import * as React from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  MapPin,
  Calendar,
  Clock,
  Phone,
  Mail,
  Building,
  Star,
  Navigation,
  CreditCard,
  Accessibility,
  Car,
  Navigation2,
  Users,
  Award,
  CheckCircle,
  ExternalLink
} from "lucide-react"
import { cn } from "@/lib/utils"
import { TrustBadge, VerificationStatus } from "@/components/healthcare/trust-indicators"

interface Doctor {
  id: string
  firstName: string
  lastName: string
  clinics: Array<{
    id: string
    name: string
    address: string
    user?: {
      id: string
      role: string
    }
    role?: string
    workingDays?: string[]
    startTime?: string
    endTime?: string
    consultationFee?: number
    currency?: string
  }>
}

interface DoctorClinicAffiliationsProps {
  doctor: Doctor
  className?: string
}

export function DoctorClinicAffiliations({ doctor, className }: DoctorClinicAffiliationsProps) {
  if (!doctor.clinics || doctor.clinics.length === 0) {
    return (
      <Card className={cn("h-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Clinic Affiliations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No clinic affiliations listed</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getRoleBadgeVariant = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'attending':
        return 'default'
      case 'consultant':
        return 'secondary'
      case 'specialist':
        return 'outline'
      case 'visiting':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const formatCurrency = (amount: number, currency: string = 'SGD') => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  const getDayName = (day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1).toLowerCase()
  }

  // Mock additional clinic data - in real app this would come from API
  const getClinicDetails = (clinicId: string) => {
    const mockClinics = {
      '1': {
        phone: '+65 6234 5678',
        email: 'info@familymed.sg',
        website: 'https://familymed.sg',
        operatingHours: {
          monday: '09:00-17:00',
          tuesday: '09:00-17:00',
          wednesday: '09:00-17:00',
          thursday: '09:00-17:00',
          friday: '09:00-17:00',
          saturday: '09:00-12:00',
          sunday: 'closed'
        },
        facilities: ['Wheelchair Access', 'Parking Available', 'Pharmacy'],
        rating: 4.8,
        reviewCount: 156,
        specialties: ['Family Medicine', 'General Practice'],
        emergencyCare: false,
        isVerified: true,
        verifiedDate: new Date('2024-01-15')
      },
      '2': {
        phone: '+65 6789 0123',
        email: 'contact@cityhealth.sg',
        website: 'https://cityhealth.sg',
        operatingHours: {
          monday: '08:00-20:00',
          tuesday: '08:00-20:00',
          wednesday: '08:00-20:00',
          thursday: '08:00-20:00',
          friday: '08:00-20:00',
          saturday: '08:00-18:00',
          sunday: '10:00-16:00'
        },
        facilities: ['Wheelchair Access', 'Parking Available', 'Pharmacy', 'Laboratory'],
        rating: 4.6,
        reviewCount: 203,
        specialties: ['Internal Medicine', 'Cardiology'],
        emergencyCare: true,
        isVerified: true,
        verifiedDate: new Date('2024-02-10')
      }
    }
    return mockClinics[clinicId as keyof typeof mockClinics] || mockClinics['1']
  }

  const renderClinicCard = (clinic: any, index: number) => {
    const details = getClinicDetails(clinic.id)
    const isPrimary = clinic.role?.toLowerCase() === 'attending'
    
    return (
      <Card key={clinic.id} className="overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div className="space-y-2">
              <CardTitle className="text-xl leading-tight">
                <div className="flex items-center gap-2">
                  {clinic.name}
                  {isPrimary && (
                    <Badge variant="default" className="text-xs">
                      Primary Clinic
                    </Badge>
                  )}
                </div>
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{clinic.address}</span>
              </div>
            </div>
            
            {/* Rating */}
            {details.rating && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{details.rating}</span>
                <span className="text-xs text-muted-foreground">
                  ({details.reviewCount})
                </span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Role and Schedule */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground">
                Role at Clinic
              </h4>
              <Badge variant={getRoleBadgeVariant(clinic.role)} className="w-fit">
                {clinic.role || 'Attending Physician'}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground">
                Consultation Fee
              </h4>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold">
                  {clinic.consultationFee 
                    ? formatCurrency(clinic.consultationFee, clinic.currency)
                    : 'Contact for pricing'
                  }
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Schedule Information */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Schedule & Availability
            </h4>
            
            {clinic.workingDays && clinic.workingDays.length > 0 ? (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {clinic.workingDays.map((day, dayIndex) => (
                    <Badge key={dayIndex} variant="outline" className="text-xs">
                      {getDayName(day)}
                    </Badge>
                  ))}
                </div>
                
                {clinic.startTime && clinic.endTime && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      {clinic.startTime} - {clinic.endTime}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Schedule information not available
              </p>
            )}
          </div>

          <Separator />

          {/* Contact Information */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" />
              Contact Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {details.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={`tel:${details.phone}`}
                    className="hover:text-primary transition-colors"
                  >
                    {details.phone}
                  </a>
                </div>
              )}
              
              {details.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={`mailto:${details.email}`}
                    className="hover:text-primary transition-colors truncate"
                  >
                    {details.email}
                  </a>
                </div>
              )}
              
              {details.website && (
                <div className="flex items-center gap-2 text-sm sm:col-span-2">
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={details.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors truncate"
                  >
                    {details.website}
                  </a>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Facilities & Services */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Building className="h-4 w-4 text-primary" />
              Clinic Facilities
            </h4>
            <div className="flex flex-wrap gap-2">
              {details.facilities.map((facility, facilityIndex) => {
                const getFacilityIcon = (facility: string) => {
                  if (facility.includes('Wheelchair')) return <Accessibility className="h-3 w-3" />
                  if (facility.includes('Parking')) return <Car className="h-3 w-3" />
                  if (facility.includes('Pharmacy')) return <CheckCircle className="h-3 w-3" />
                  return <Building className="h-3 w-3" />
                }
                
                return (
                  <Badge key={facilityIndex} variant="outline" className="text-xs gap-1">
                    {getFacilityIcon(facility)}
                    {facility}
                  </Badge>
                )
              })}
            </div>
          </div>

          {/* Specialties at Clinic */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              Specialties Available
            </h4>
            <div className="flex flex-wrap gap-2">
              {details.specialties.map((specialty, specialtyIndex) => (
                <Badge key={specialtyIndex} variant="secondary" className="text-xs">
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              Verification Status
            </h4>
            <div className="flex flex-wrap gap-2">
              <TrustBadge 
                type="moh-verified"
                verified={details.isVerified}
                lastUpdated={details.verifiedDate}
                showLabel={true}
              />
              {details.emergencyCare && (
                <TrustBadge 
                  type="ae-available"
                  verified={true}
                  showLabel={true}
                />
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
            <Button className="flex-1" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Book Appointment
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={`/clinics/${clinic.id}`} className="flex items-center gap-2">
                <Navigation2 className="h-4 w-4" />
                View Clinic
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Clinic Affiliations
          <Badge variant="outline" className="ml-auto">
            {doctor.clinics.length} clinic{doctor.clinics.length === 1 ? '' : 's'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {doctor.clinics.map((clinic, index) => renderClinicCard(clinic, index))}
      </CardContent>
    </Card>
  )
}