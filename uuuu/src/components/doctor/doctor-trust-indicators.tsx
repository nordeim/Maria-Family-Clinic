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
  Shield,
  ShieldCheck,
  Award,
  Star,
  CheckCircle,
  Clock,
  Calendar,
  Phone,
  AlertTriangle,
  FileText,
  Users,
  TrendingUp,
  Heart
} from "lucide-react"
import { cn } from "@/lib/utils"
import { 
  TrustBadge, 
  VerificationStatus, 
  WaitTimeIndicator 
} from "@/components/healthcare/trust-indicators"

interface Doctor {
  id: string
  firstName: string
  lastName: string
  medicalLicense: string
  isVerified: boolean
  verificationDate?: Date
  experience?: number
  rating?: {
    average: number
    count: number
  }
  specialties: string[]
  clinics: Array<{
    id: string
    name: string
    address: string
    role?: string
  }>
}

interface DoctorTrustIndicatorsProps {
  doctor: Doctor
  className?: string
}

export function DoctorTrustIndicators({ doctor, className }: DoctorTrustIndicatorsProps) {
  const fullName = `Dr. ${doctor.firstName} ${doctor.lastName}`

  // Mock professional credentials data
  const professionalCredentials = [
    {
      type: "Medical License Verification",
      status: "verified",
      verifiedDate: doctor.verificationDate || new Date(),
      authority: "Singapore Medical Council",
      id: doctor.medicalLicense
    },
    {
      type: "Board Certification",
      status: "verified", 
      verifiedDate: new Date("2020-05-15"),
      authority: "Academy of Medicine Singapore",
      id: "AMS-2020-IM-567890"
    },
    {
      type: "Professional Indemnity Insurance",
      status: "verified",
      verifiedDate: new Date("2024-01-01"),
      authority: "Singapore Medical Association",
      id: "SMA-2024-INS-123456"
    }
  ]

  // Mock quality metrics
  const qualityMetrics = {
    patientSatisfaction: 4.8,
    safetyScore: 4.9,
    responseTime: "< 2 hours",
    followUpRate: "95%",
    complicationRate: "< 1%",
    patientRetention: "92%",
    peerRecommendation: "97%"
  }

  // Mock achievements and awards
  const achievements = [
    {
      title: "Excellence in Patient Care Award",
      organization: "Singapore Medical Association",
      year: 2023,
      category: "Patient Care"
    },
    {
      title: "Top Doctor Recognition",
      organization: "HealthHub Singapore", 
      year: 2022,
      category: "Public Recognition"
    },
    {
      title: "Continuing Medical Education Excellence",
      organization: "Academy of Medicine Singapore",
      year: 2022,
      category: "Professional Development"
    }
  ]

  // Mock compliance and safety records
  const complianceRecords = [
    {
      type: "MOH Compliance",
      status: "compliant",
      lastAudit: "2024-03-15",
      score: "100%"
    },
    {
      type: "Patient Safety Protocol",
      status: "compliant", 
      lastAudit: "2024-02-28",
      score: "98%"
    },
    {
      type: "Data Protection",
      status: "compliant",
      lastAudit: "2024-01-20", 
      score: "100%"
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
      case 'compliant':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'expired':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const getAchievementIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'patient care':
        return <Heart className="h-4 w-4 text-red-500" />
      case 'public recognition':
        return <Award className="h-4 w-4 text-yellow-500" />
      case 'professional development':
        return <TrendingUp className="h-4 w-4 text-blue-500" />
      default:
        return <Star className="h-4 w-4 text-purple-500" />
    }
  }

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Professional Credibility Indicators
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* MOH Verification Status */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            MOH Verification & Licensing
          </h4>
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-green-800">
                  MOH Verified Professional
                </p>
                <p className="text-xs text-green-600">
                  License: {doctor.medicalLicense}
                </p>
              </div>
              <TrustBadge 
                type="moh-verified"
                verified={doctor.isVerified}
                lastUpdated={doctor.verificationDate}
                showLabel={false}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Professional Credentials */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" />
            Professional Credentials
          </h4>
          <div className="space-y-3">
            {professionalCredentials.map((credential, index) => (
              <div 
                key={index}
                className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg"
              >
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(credential.status)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{credential.type}</p>
                    <Badge variant="outline" className="text-xs">
                      {credential.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {credential.authority}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      ID: {credential.id}
                    </span>
                    <span className="text-muted-foreground">
                      {credential.verifiedDate.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Quality Metrics */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Quality Performance Metrics
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-lg font-bold text-green-700">
                {qualityMetrics.patientSatisfaction}
              </p>
              <p className="text-xs text-green-600">Patient Satisfaction</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-lg font-bold text-blue-700">
                {qualityMetrics.safetyScore}
              </p>
              <p className="text-xs text-blue-600">Safety Score</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-lg font-bold text-purple-700">
                {qualityMetrics.followUpRate}
              </p>
              <p className="text-xs text-purple-600">Follow-up Rate</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-lg font-bold text-orange-700">
                {qualityMetrics.complicationRate}
              </p>
              <p className="text-xs text-orange-600">Complication Rate</p>
            </div>
            <div className="text-center p-3 bg-teal-50 rounded-lg border border-teal-200">
              <p className="text-lg font-bold text-teal-700">
                {qualityMetrics.patientRetention}
              </p>
              <p className="text-xs text-teal-600">Patient Retention</p>
            </div>
            <div className="text-center p-3 bg-indigo-50 rounded-lg border border-indigo-200">
              <p className="text-lg font-bold text-indigo-700">
                {qualityMetrics.peerRecommendation}
              </p>
              <p className="text-xs text-indigo-600">Peer Recommendation</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Professional Achievements */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Star className="h-4 w-4 text-primary" />
            Professional Achievements & Awards
          </h4>
          <div className="space-y-3">
            {achievements.map((achievement, index) => (
              <div 
                key={index}
                className="flex items-start gap-3 p-3 bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg border border-amber-200"
              >
                <div className="flex-shrink-0 mt-1">
                  {getAchievementIcon(achievement.category)}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-amber-800">
                    {achievement.title}
                  </p>
                  <p className="text-xs text-amber-600">
                    {achievement.organization} • {achievement.year}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {achievement.category}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Compliance & Safety Records */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-primary" />
            Compliance & Safety Records
          </h4>
          <div className="space-y-2">
            {complianceRecords.map((record, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(record.status)}
                  <div>
                    <p className="text-sm font-medium">{record.type}</p>
                    <p className="text-xs text-muted-foreground">
                      Last audit: {new Date(record.lastAudit).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-600">{record.score}</p>
                  <Badge variant="outline" className="text-xs">
                    {record.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Contact Information */}
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-red-800">
                Emergency Contact Protocol
              </h4>
              <p className="text-xs text-red-700 leading-relaxed">
                For medical emergencies, please contact your nearest emergency services or go directly to the nearest hospital emergency department. 
                This doctor profile is not intended for emergency medical situations.
              </p>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">Emergency: 995</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}