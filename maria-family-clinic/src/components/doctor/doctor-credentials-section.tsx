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
  Award,
  GraduationCap,
  Shield,
  CheckCircle,
  Clock,
  FileText,
  Calendar,
  Building,
  BookOpen,
  Star,
  Trophy,
  Medal,
  Badge as BadgeIcon
} from "lucide-react"
import { cn } from "@/lib/utils"
import { VerificationStatus } from "@/components/healthcare/trust-indicators"

interface Doctor {
  id: string
  firstName: string
  lastName: string
  medicalLicense: string
  qualifications?: string[]
  specialties: string[]
  isVerified: boolean
  verificationDate?: Date
  experience?: number
  profile?: {
    bio?: string
    description?: string
  }
}

interface DoctorCredentialsSectionProps {
  doctor: Doctor
  className?: string
}

export function DoctorCredentialsSection({ doctor, className }: DoctorCredentialsSectionProps) {
  const fullName = `Dr. ${doctor.firstName} ${doctor.lastName}`

  // Mock certification data - in real app this would come from API
  const certifications = [
    {
      name: "Board Certification in Internal Medicine",
      issuingBody: "Singapore Medical Council",
      year: 2010,
      status: "active",
      credentialId: "SMC-2010-IM-001234",
      expiryDate: "2025-12-31"
    },
    {
      name: "Fellowship in Cardiology",
      issuingBody: "Royal College of Physicians",
      year: 2012,
      status: "active",
      credentialId: "RCP-2012-CARD-005678",
      expiryDate: null
    },
    {
      name: "Advanced Cardiac Life Support (ACLS)",
      issuingBody: "American Heart Association",
      year: 2023,
      status: "active",
      credentialId: "ACLS-2023-001",
      expiryDate: "2025-12-31"
    },
    {
      name: "MOH Verification Certificate",
      issuingBody: "Ministry of Health Singapore",
      year: 2024,
      status: "active",
      credentialId: "MOH-2024-VER-789012",
      expiryDate: "2026-12-31"
    }
  ]

  // Mock continuing education data
  const continuingEducation = [
    {
      title: "Latest Advances in Cardiovascular Medicine",
      provider: "Singapore Medical Association",
      year: 2024,
      credits: 6,
      category: "Cardiology"
    },
    {
      title: "Evidence-Based Medicine in Primary Care",
      provider: "Academy of Medicine Singapore",
      year: 2023,
      credits: 12,
      category: "General Practice"
    },
    {
      title: "Digital Health and Telemedicine",
      provider: "National University of Singapore",
      year: 2023,
      credits: 8,
      category: "Healthcare Technology"
    }
  ]

  const getCertificationIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'expired':
        return <Clock className="h-4 w-4 text-red-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'cardiology':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'general practice':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'healthcare technology':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Credentials & Certifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Medical License Verification */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              Medical License
            </h4>
            <VerificationStatus 
              status={doctor.isVerified ? 'verified' : 'unverified'}
              verifiedDate={doctor.verificationDate}
              licenseNumber={doctor.medicalLicense}
              className="text-xs"
            />
          </div>
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">License Number</span>
                <span className="text-sm font-mono bg-background px-2 py-1 rounded border">
                  {doctor.medicalLicense}
                </span>
              </div>
              {doctor.verificationDate && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Verified Date</span>
                  <span className="text-sm">
                    {doctor.verificationDate.toLocaleDateString()}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant={doctor.isVerified ? "default" : "secondary"} className="text-xs">
                  {doctor.isVerified ? 'Verified' : 'Pending Verification'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Professional Qualifications */}
        {doctor.qualifications && doctor.qualifications.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" />
              Professional Qualifications
            </h4>
            <div className="space-y-3">
              {doctor.qualifications.map((qualification, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-3 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20"
                >
                  <div className="flex-shrink-0 mt-1">
                    {getCertificationIcon('active')}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium leading-tight">
                      {qualification}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Medical Education Institution
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Board Certifications & Licenses */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Medal className="h-4 w-4 text-primary" />
            Board Certifications & Licenses
          </h4>
          <div className="space-y-3">
            {certifications.map((cert, index) => (
              <div 
                key={index}
                className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg border"
              >
                <div className="flex-shrink-0 mt-1">
                  {getCertificationIcon(cert.status)}
                </div>
                <div className="flex-1 space-y-2">
                  <div>
                    <p className="text-sm font-medium leading-tight">
                      {cert.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {cert.issuingBody}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Issued: {cert.year}
                    </span>
                    {cert.credentialId && (
                      <span className="font-mono text-muted-foreground">
                        ID: {cert.credentialId}
                      </span>
                    )}
                  </div>
                  {cert.expiryDate && (
                    <div className="text-xs">
                      <span className="text-muted-foreground">
                        Valid until: {new Date(cert.expiryDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Continuing Medical Education */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            Continuing Medical Education (CME)
          </h4>
          <div className="space-y-3">
            {continuingEducation.map((education, index) => (
              <div 
                key={index}
                className="flex items-start gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100"
              >
                <div className="flex-shrink-0 mt-1">
                  <Trophy className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 space-y-2">
                  <div>
                    <p className="text-sm font-medium leading-tight">
                      {education.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {education.provider}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {education.year}
                      </span>
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs px-2 py-0.5", getCategoryColor(education.category))}
                      >
                        {education.category}
                      </Badge>
                    </div>
                    <span className="text-xs font-medium text-primary">
                      {education.credits} CME Credits
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Professional Memberships */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Building className="h-4 w-4 text-primary" />
            Professional Memberships
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              "Singapore Medical Association",
              "Academy of Medicine Singapore", 
              "Cardiology Society of Singapore",
              "College of Family Physicians Singapore"
            ].map((membership, index) => (
              <div 
                key={index}
                className="flex items-center gap-2 p-2 bg-muted/30 rounded-md"
              >
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">{membership}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CME Credits Summary */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-green-800">
                Annual CME Credits
              </p>
              <p className="text-xs text-green-600">
                Current year professional development
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-800">26</p>
              <p className="text-xs text-green-600">Credits earned</p>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-green-600 mb-1">
              <span>Progress</span>
              <span>26/25 required</span>
            </div>
            <div className="w-full bg-green-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '100%' }} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}