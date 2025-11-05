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
  Heart,
  MessageCircle,
  UserCheck,
  Users,
  Brain,
  Stethoscope,
  Lightbulb,
  ThumbsUp,
  Clock,
  Star,
  CheckCircle
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Doctor {
  id: string
  firstName: string
  lastName: string
  specialties: string[]
  profile?: {
    bio?: string
    description?: string
  }
  experience?: number
}

interface DoctorPatientInfoProps {
  doctor: Doctor
  className?: string
}

export function DoctorPatientInfo({ doctor, className }: DoctorPatientInfoProps) {
  // Mock patient care philosophy data - in real app this would come from API
  const treatmentApproach = [
    {
      title: "Patient-Centered Care",
      description: "Every decision is made with the patient's best interest at heart",
      icon: Heart,
      color: "text-red-500"
    },
    {
      title: "Evidence-Based Medicine",
      description: "Treatment plans based on latest medical research and guidelines",
      icon: CheckCircle,
      color: "text-green-500"
    },
    {
      title: "Preventive Care Focus",
      description: "Emphasizing prevention and early intervention for better health outcomes",
      icon: Lightbulb,
      color: "text-yellow-500"
    },
    {
      title: "Holistic Approach",
      description: "Considering physical, mental, and social aspects of health",
      icon: Users,
      color: "text-blue-500"
    }
  ]

  const communicationStyle = [
    {
      style: "Clear and Simple Explanations",
      description: "Medical terms explained in easy-to-understand language",
      rating: 5
    },
    {
      style: "Active Listening",
      description: "Takes time to understand patient concerns and symptoms",
      rating: 5
    },
    {
      style: "Empathetic Communication",
      description: "Shows genuine care and understanding for patient feelings",
      rating: 5
    },
    {
      style: "Collaborative Decision Making",
      description: "Involves patients in treatment planning and decisions",
      rating: 4
    }
  ]

  const specialInterestAreas = [
    "Chronic Disease Management",
    "Preventive Healthcare",
    "Health Screening Programs",
    "Patient Education",
    "Community Health",
    "Mental Health Support",
    "Lifestyle Medicine",
    "Health Technology Integration"
  ]

  const patientSatisfactionMetrics = {
    communicationScore: 4.9,
    empathyScore: 4.8,
    waitTimeScore: 4.2,
    overallSatisfaction: 4.7,
    totalReviews: 156,
    responseRate: "98%",
    averageWaitTime: "15 minutes"
  }

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "h-4 w-4",
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        )}
      />
    ))
  }

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          Patient Care Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Treatment Philosophy */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Heart className="h-4 w-4 text-primary" />
            Treatment Philosophy
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {treatmentApproach.map((approach, index) => {
              const Icon = approach.icon
              return (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg"
                >
                  <Icon className={cn("h-5 w-5 mt-0.5", approach.color)} />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{approach.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {approach.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <Separator />

        {/* Patient Care Approach */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-primary" />
            Patient Care Approach
          </h4>
          <div className="prose prose-sm max-w-none">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {doctor.profile?.description || 
               `Dr. ${doctor.lastName} believes in providing comprehensive, patient-centered care that addresses not just the immediate health concerns but also focuses on long-term wellness and disease prevention. With ${doctor.experience || 'several'} years of experience, Dr. ${doctor.lastName} has developed a holistic approach to healthcare that combines evidence-based medicine with personalized attention to each patient's unique needs.`}
            </p>
          </div>
        </div>

        <Separator />

        {/* Communication Style */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-primary" />
            Communication Style
          </h4>
          <div className="space-y-3">
            {communicationStyle.map((style, index) => (
              <div 
                key={index}
                className="flex items-start gap-3 p-3 bg-blue-50/30 rounded-lg border border-blue-100"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium">{style.style}</p>
                    <div className="flex items-center gap-1">
                      {getRatingStars(style.rating)}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {style.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Special Interest Areas */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            Areas of Special Interest
          </h4>
          <div className="flex flex-wrap gap-2">
            {specialInterestAreas.map((area, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="text-xs py-1 px-2 hover:bg-primary/5 transition-colors"
              >
                <ThumbsUp className="h-3 w-3 mr-1" />
                {area}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        {/* Patient Satisfaction Metrics */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <ThumbsUp className="h-4 w-4 text-primary" />
            Patient Satisfaction
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-2xl font-bold text-green-700">
                {patientSatisfactionMetrics.communicationScore}
              </p>
              <p className="text-xs text-green-600">Communication</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-2xl font-bold text-blue-700">
                {patientSatisfactionMetrics.empathyScore}
              </p>
              <p className="text-xs text-blue-600">Empathy</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-2xl font-bold text-purple-700">
                {patientSatisfactionMetrics.waitTimeScore}
              </p>
              <p className="text-xs text-purple-600">Timeliness</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-2xl font-bold text-orange-700">
                {patientSatisfactionMetrics.overallSatisfaction}
              </p>
              <p className="text-xs text-orange-600">Overall</p>
            </div>
          </div>
          
          {/* Additional Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
              <span className="text-sm text-muted-foreground">Total Reviews</span>
              <span className="text-sm font-semibold">{patientSatisfactionMetrics.totalReviews}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
              <span className="text-sm text-muted-foreground">Response Rate</span>
              <span className="text-sm font-semibold">{patientSatisfactionMetrics.responseRate}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
              <span className="text-sm text-muted-foreground">Avg Wait Time</span>
              <span className="text-sm font-semibold">{patientSatisfactionMetrics.averageWaitTime}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Patient Education Focus */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            Patient Education Approach
          </h4>
          <div className="space-y-3">
            <div className="p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg border border-amber-200">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-amber-600 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-amber-800">
                    Empowering Patients Through Knowledge
                  </p>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Dr. {doctor.lastName} believes that informed patients make better health decisions. 
                    Every consultation includes time for questions and thorough explanations of diagnoses, 
                    treatment options, and preventive measures.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Clear treatment explanations</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Written care instructions</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Preventive health advice</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Lifestyle recommendations</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}