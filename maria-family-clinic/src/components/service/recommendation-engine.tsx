"use client"

import React, { useState, useEffect } from "react"
import { Target, User, Heart, AlertTriangle, Clock, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ServiceCard } from "@/components/healthcare/service-card"
import { Service } from "@/components/healthcare/service-card"

interface HealthProfile {
  age?: number
  gender?: "male" | "female" | "other"
  height?: number
  weight?: number
  bmi?: number
  medicalHistory?: string[]
  currentConditions?: string[]
  medications?: string[]
  allergies?: string[]
  familyHistory?: string[]
  lifestyle?: {
    smoking?: boolean
    alcohol?: "none" | "light" | "moderate" | "heavy"
    exercise?: "sedentary" | "light" | "moderate" | "active"
    diet?: "poor" | "fair" | "good" | "excellent"
    stressLevel?: "low" | "moderate" | "high"
  }
  preferences?: {
    preferredProviders?: string[]
    appointmentTypes?: ("in-person" | "telehealth" | "both")[]
    insuranceProvider?: string
    language?: string
  }
  lastCheckup?: Date
  screeningHistory?: {
    type: string
    date: Date
    result: "normal" | "abnormal" | "follow-up"
  }[]
  riskFactors?: {
    condition: string
    riskLevel: "low" | "moderate" | "high"
    recommendation: string
  }[]
}

interface RecommendationEngineProps {
  userHealthProfile: HealthProfile
  availableServices: Service[]
  onServiceSelect: (service: Service) => void
  onDismissRecommendation?: (serviceId: string, reason: string) => void
  className?: string
}

interface Recommendation {
  id: string
  service: Service
  reason: string
  priority: "critical" | "high" | "medium" | "low"
  category: "preventive" | "diagnostic" | "treatment" | "maintenance" | "emergency"
  confidence: number
  riskLevel?: "low" | "moderate" | "high"
  timeSensitivity?: "urgent" | "soon" | "routine"
  evidence?: string[]
  alternatives?: Service[]
}

interface DemographicRecommendations {
  ageBased: Service[]
  genderBased: Service[]
  riskBased: Service[]
  preventiveBased: Service[]
}

export function RecommendationEngine({
  userHealthProfile,
  availableServices,
  onServiceSelect,
  onDismissRecommendation,
  className
}: RecommendationEngineProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [demographicData, setDemographicData] = useState<DemographicRecommendations>({
    ageBased: [],
    genderBased: [],
    riskBased: [],
    preventiveBased: []
  })
  const [activeTab, setActiveTab] = useState<"personalized" | "demographics" | "trending">("personalized")

  useEffect(() => {
    generateRecommendations()
  }, [userHealthProfile, availableServices])

  const generateRecommendations = () => {
    const recs: Recommendation[] = []

    // Age-based recommendations
    const ageRecs = generateAgeBasedRecommendations(userHealthProfile, availableServices)
    recs.push(...ageRecs)

    // Gender-based recommendations
    const genderRecs = generateGenderBasedRecommendations(userHealthProfile, availableServices)
    recs.push(...genderRecs)

    // Risk-based recommendations
    const riskRecs = generateRiskBasedRecommendations(userHealthProfile, availableServices)
    recs.push(...riskRecs)

    // Condition-based recommendations
    const conditionRecs = generateConditionBasedRecommendations(userHealthProfile, availableServices)
    recs.push(...conditionRecs)

    // Preventive care recommendations
    const preventiveRecs = generatePreventiveRecommendations(userHealthProfile, availableServices)
    recs.push(...preventiveRecs)

    // Lifestyle-based recommendations
    const lifestyleRecs = generateLifestyleRecommendations(userHealthProfile, availableServices)
    recs.push(...lifestyleRecs)

    // Sort by priority and confidence
    const sortedRecs = recs.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      }
      return b.confidence - a.confidence
    })

    setRecommendations(sortedRecs)
  }

  const generateAgeBasedRecommendations = (
    profile: HealthProfile, 
    services: Service[]
  ): Recommendation[] => {
    const recs: Recommendation[] = []
    
    if (!profile.age) return recs

    // Pediatric recommendations
    if (profile.age < 18) {
      const pediatricServices = services.filter(s => 
        s.category.toLowerCase().includes("pediatric") ||
        s.name.toLowerCase().includes("child") ||
        s.name.toLowerCase().includes("vaccination")
      )
      
      pediatricServices.forEach(service => {
        recs.push({
          id: `age-${service.id}`,
          service,
          reason: "Age-appropriate pediatric care",
          priority: "high",
          category: "preventive",
          confidence: 85,
          evidence: ["Age under 18", "Pediatric specialty service"]
        })
      })
    }

    // Adult recommendations (18-65)
    if (profile.age >= 18 && profile.age < 65) {
      const adultServices = services.filter(s => 
        s.name.toLowerCase().includes("annual checkup") ||
        s.name.toLowerCase().includes("physical") ||
        s.category.toLowerCase().includes("general")
      )
      
      adultServices.forEach(service => {
        recs.push({
          id: `adult-${service.id}`,
          service,
          reason: "Regular adult health maintenance",
          priority: "medium",
          category: "preventive",
          confidence: 75,
          evidence: ["Adult age group (18-65)", "Annual checkup recommended"]
        })
      })
    }

    // Senior recommendations (65+)
    if (profile.age >= 65) {
      const seniorServices = services.filter(s => 
        s.name.toLowerCase().includes("geriatric") ||
        s.name.toLowerCase().includes("senior") ||
        s.name.toLowerCase().includes("bone density") ||
        s.name.toLowerCase().includes("vision") ||
        s.name.toLowerCase().includes("hearing")
      )
      
      seniorServices.forEach(service => {
        recs.push({
          id: `senior-${service.id}`,
          service,
          reason: "Age-related health screening for seniors",
          priority: "high",
          category: "preventive",
          confidence: 90,
          evidence: ["Age 65+", "Senior health screening"]
        })
      })
    }

    return recs
  }

  const generateGenderBasedRecommendations = (
    profile: HealthProfile,
    services: Service[]
  ): Recommendation[] => {
    const recs: Recommendation[] = []

    if (!profile.gender) return recs

    if (profile.gender === "female") {
      const femaleServices = services.filter(s =>
        s.name.toLowerCase().includes("mammogram") ||
        s.name.toLowerCase().includes("pap smear") ||
        s.name.toLowerCase().includes("gynecolog") ||
        s.name.toLowerCase().includes("prenatal")
      )
      
      femaleServices.forEach(service => {
        recs.push({
          id: `gender-f-${service.id}`,
          service,
          reason: "Gender-specific health screening for females",
          priority: "high",
          category: "preventive",
          confidence: 88,
          evidence: ["Female gender", "Gender-specific screening"]
        })
      })
    }

    if (profile.gender === "male") {
      const maleServices = services.filter(s =>
        s.name.toLowerCase().includes("prostate") ||
        s.name.toLowerCase().includes("colonoscopy")
      )
      
      maleServices.forEach(service => {
        recs.push({
          id: `gender-m-${service.id}`,
          service,
          reason: "Gender-specific health screening for males",
          priority: "medium",
          category: "preventive",
          confidence: 80,
          evidence: ["Male gender", "Male-specific screening"]
        })
      })
    }

    return recs
  }

  const generateRiskBasedRecommendations = (
    profile: HealthProfile,
    services: Service[]
  ): Recommendation[] => {
    const recs: Recommendation[] = []

    // BMI-based recommendations
    if (profile.bmi) {
      if (profile.bmi >= 25) {
        const nutritionServices = services.filter(s =>
          s.name.toLowerCase().includes("nutrition") ||
          s.name.toLowerCase().includes("weight") ||
          s.category.toLowerCase().includes("nutrition")
        )
        
        nutritionServices.forEach(service => {
          recs.push({
            id: `bmi-${service.id}`,
            service,
            reason: "Weight management based on BMI",
            priority: "medium",
            category: "maintenance",
            confidence: 82,
            riskLevel: "moderate",
            evidence: [`BMI: ${profile.bmi}`, "Weight management recommended"]
          })
        })
      }

      if (profile.bmi >= 30) {
        const cardiologyServices = services.filter(s =>
          s.category.toLowerCase().includes("cardiology") ||
          s.name.toLowerCase().includes("heart")
        )
        
        cardiologyServices.forEach(service => {
          recs.push({
            id: `bmi-cardio-${service.id}`,
            service,
            reason: "Cardiovascular screening due to obesity risk",
            priority: "high",
            category: "diagnostic",
            confidence: 75,
            riskLevel: "high",
            evidence: [`BMI: ${profile.bmi}`, "Obesity-related cardiovascular risk"]
          })
        })
      }
    }

    // Family history recommendations
    if (profile.familyHistory) {
      const familyConditions = profile.familyHistory.join(" ").toLowerCase()
      
      if (familyConditions.includes("diabetes")) {
        const diabetesServices = services.filter(s =>
          s.name.toLowerCase().includes("diabetes") ||
          s.name.toLowerCase().includes("glucose") ||
          s.category.toLowerCase().includes("endocrinology")
        )
        
        diabetesServices.forEach(service => {
          recs.push({
            id: `family-diabetes-${service.id}`,
            service,
            reason: "Family history of diabetes",
            priority: "high",
            category: "diagnostic",
            confidence: 85,
            riskLevel: "moderate",
            evidence: ["Family history of diabetes", "Increased diabetes risk"]
          })
        })
      }

      if (familyConditions.includes("cancer")) {
        const cancerServices = services.filter(s =>
          s.name.toLowerCase().includes("screening") ||
          s.category.toLowerCase().includes("oncology")
        )
        
        cancerServices.forEach(service => {
          recs.push({
            id: `family-cancer-${service.id}`,
            service,
            reason: "Family history of cancer",
            priority: "high",
            category: "preventive",
            confidence: 78,
            riskLevel: "moderate",
            evidence: ["Family history of cancer", "Increased cancer screening recommended"]
          })
        })
      }
    }

    return recs
  }

  const generateConditionBasedRecommendations = (
    profile: HealthProfile,
    services: Service[]
  ): Recommendation[] => {
    const recs: Recommendation[] = []

    if (!profile.currentConditions) return recs

    profile.currentConditions.forEach(condition => {
      const conditionLower = condition.toLowerCase()
      
      if (conditionLower.includes("diabetes")) {
        const diabetesServices = services.filter(s =>
          s.name.toLowerCase().includes("diabetes") ||
          s.name.toLowerCase().includes("endocrin") ||
          s.name.toLowerCase().includes("blood sugar")
        )
        
        diabetesServices.forEach(service => {
          recs.push({
            id: `condition-diabetes-${service.id}`,
            service,
            reason: `Management of diabetes condition`,
            priority: "high",
            category: "treatment",
            confidence: 95,
            riskLevel: "high",
            timeSensitivity: "routine",
            evidence: ["Current diabetes condition", "Ongoing management needed"]
          })
        })
      }

      if (conditionLower.includes("hypertension") || conditionLower.includes("high blood pressure")) {
        const cardioServices = services.filter(s =>
          s.category.toLowerCase().includes("cardiology") ||
          s.name.toLowerCase().includes("blood pressure")
        )
        
        cardioServices.forEach(service => {
          recs.push({
            id: `condition-hypertension-${service.id}`,
            service,
            reason: "Management of hypertension",
            priority: "high",
            category: "treatment",
            confidence: 92,
            riskLevel: "high",
            timeSensitivity: "routine",
            evidence: ["Current hypertension condition", "Regular monitoring required"]
          })
        })
      }

      if (conditionLower.includes("asthma")) {
        const respiratoryServices = services.filter(s =>
          s.category.toLowerCase().includes("pulmonology") ||
          s.name.toLowerCase().includes("respiratory")
        )
        
        respiratoryServices.forEach(service => {
          recs.push({
            id: `condition-asthma-${service.id}`,
            service,
            reason: "Management of asthma",
            priority: "high",
            category: "treatment",
            confidence: 88,
            riskLevel: "moderate",
            timeSensitivity: "routine",
            evidence: ["Current asthma condition", "Regular pulmonary care needed"]
          })
        })
      }
    })

    return recs
  }

  const generatePreventiveRecommendations = (
    profile: HealthProfile,
    services: Service[]
  ): Recommendation[] => {
    const recs: Recommendation[] = []

    const currentYear = new Date().getFullYear()
    
    // Annual checkup recommendation
    if (!profile.lastCheckup || profile.lastCheckup.getFullYear() < currentYear) {
      const checkupServices = services.filter(s =>
        s.name.toLowerCase().includes("annual") ||
        s.name.toLowerCase().includes("checkup") ||
        s.name.toLowerCase().includes("physical")
      )
      
      checkupServices.forEach(service => {
        recs.push({
          id: `preventive-checkup-${service.id}`,
          service,
          reason: "Annual health checkup due",
          priority: "medium",
          category: "preventive",
          confidence: 80,
          timeSensitivity: "soon",
          evidence: ["No recent annual checkup", "Preventive care recommended annually"]
        })
      })
    }

    // Cancer screening recommendations
    if (profile.age && profile.age >= 50) {
      const screeningServices = services.filter(s =>
        s.name.toLowerCase().includes("colonoscopy") ||
        s.name.toLowerCase().includes("mammogram") ||
        s.name.toLowerCase().includes("pap smear")
      )
      
      screeningServices.forEach(service => {
        recs.push({
          id: `preventive-screening-${service.id}`,
          service,
          reason: "Age-appropriate cancer screening",
          priority: "high",
          category: "preventive",
          confidence: 85,
          timeSensitivity: "routine",
          evidence: ["Age 50+", "Recommended cancer screening age"]
        })
      })
    }

    return recs
  }

  const generateLifestyleRecommendations = (
    profile: HealthProfile,
    services: Service[]
  ): Recommendation[] => {
    const recs: Recommendation[] = []

    if (!profile.lifestyle) return recs

    // Smoking-related recommendations
    if (profile.lifestyle.smoking) {
      const smokingServices = services.filter(s =>
        s.name.toLowerCase().includes("smoking") ||
        s.category.toLowerCase().includes("pulmonology") ||
        s.name.toLowerCase().includes("cessation")
      )
      
      smokingServices.forEach(service => {
        recs.push({
          id: `lifestyle-smoking-${service.id}`,
          service,
          reason: "Smoking cessation support",
          priority: "critical",
          category: "treatment",
          confidence: 90,
          riskLevel: "high",
          timeSensitivity: "urgent",
          evidence: ["Current smoking habit", "Smoking cessation improves health outcomes"]
        })
      })
    }

    // Low exercise recommendations
    if (profile.lifestyle.exercise === "sedentary") {
      const fitnessServices = services.filter(s =>
        s.name.toLowerCase().includes("fitness") ||
        s.name.toLowerCase().includes("physical therapy") ||
        s.category.toLowerCase().includes("rehabilitation")
      )
      
      fitnessServices.forEach(service => {
        recs.push({
          id: `lifestyle-exercise-${service.id}`,
          service,
          reason: "Increase physical activity for health",
          priority: "medium",
          category: "maintenance",
          confidence: 75,
          evidence: ["Sedentary lifestyle", "Exercise beneficial for health"]
        })
      })
    }

    // High stress recommendations
    if (profile.lifestyle.stressLevel === "high") {
      const mentalHealthServices = services.filter(s =>
        s.category.toLowerCase().includes("mental health") ||
        s.name.toLowerCase().includes("stress") ||
        s.name.toLowerCase().includes("counsel")
      )
      
      mentalHealthServices.forEach(service => {
        recs.push({
          id: `lifestyle-stress-${service.id}`,
          service,
          reason: "Stress management support",
          priority: "high",
          category: "treatment",
          confidence: 80,
          evidence: ["High stress level", "Mental health support recommended"]
        })
      })
    }

    return recs
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-100 text-red-800 border-red-200"
      case "high": return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low": return "bg-green-100 text-green-800 border-green-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "preventive": return "🛡️"
      case "diagnostic": return "🔬"
      case "treatment": return "💊"
      case "maintenance": return "🔧"
      case "emergency": return "🚨"
      default: return "🏥"
    }
  }

  const personalizedRecommendations = recommendations.slice(0, 8)

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Personalized Health Recommendations
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            AI-powered recommendations based on your health profile
          </p>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted rounded-lg p-1">
        {[
          { id: "personalized", label: "For You", icon: <User className="h-4 w-4" /> },
          { id: "demographics", label: "By Demographics", icon: <TrendingUp className="h-4 w-4" /> },
          { id: "trending", label: "Popular", icon: <Heart className="h-4 w-4" /> }
        ].map(tab => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            size="sm"
            className="flex-1"
            onClick={() => setActiveTab(tab.id as any)}
          >
            {tab.icon}
            <span className="ml-2">{tab.label}</span>
          </Button>
        ))}
      </div>

      {/* Personalized Recommendations */}
      {activeTab === "personalized" && (
        <div className="space-y-6">
          {/* Critical Recommendations Alert */}
          {recommendations.some(r => r.priority === "critical") && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription>
                <strong>Important:</strong> You have critical health recommendations that require attention.
              </AlertDescription>
            </Alert>
          )}

          {/* Recommendations List */}
          <div className="space-y-4">
            {personalizedRecommendations.length > 0 ? (
              personalizedRecommendations.map((rec, index) => (
                <Card key={rec.id} className="relative">
                  {index === 0 && (
                    <div className="absolute -top-2 -right-2 z-10">
                      <Badge className="bg-primary text-primary-foreground">
                        Top Pick
                      </Badge>
                    </div>
                  )}
                  
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{getCategoryIcon(rec.category)}</span>
                            <h3 className="font-semibold">{rec.service.name}</h3>
                            <Badge className={getPriorityColor(rec.priority)}>
                              {rec.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{rec.reason}</p>
                        </div>
                      </div>

                      {/* Confidence & Risk */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium">Match Confidence</span>
                            <span className="text-xs text-muted-foreground">{rec.confidence}%</span>
                          </div>
                          <Progress value={rec.confidence} className="h-2" />
                        </div>
                        {rec.riskLevel && (
                          <div>
                            <span className="text-xs font-medium">Risk Level: </span>
                            <Badge variant="outline" className="text-xs ml-1">
                              {rec.riskLevel}
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* Evidence */}
                      {rec.evidence && rec.evidence.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Why this is recommended:</h4>
                          <ul className="space-y-1">
                            {rec.evidence.map((evidence, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <span className="h-1 w-1 rounded-full bg-muted-foreground mt-2 shrink-0" />
                                {evidence}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Time Sensitivity */}
                      {rec.timeSensitivity && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            <strong>Timing:</strong> {rec.timeSensitivity}
                          </span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() => onServiceSelect(rec.service)}
                          className="flex-1"
                        >
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => onDismissRecommendation?.(rec.service.id, "not-relevant")}
                        >
                          Not Relevant
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No Recommendations Yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Complete your health profile to receive personalized recommendations.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Demographic Recommendations */}
      {activeTab === "demographics" && (
        <Card>
          <CardHeader>
            <CardTitle>Demographic-Based Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Demographic recommendations based on age, gender, and risk factors.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trending Recommendations */}
      {activeTab === "trending" && (
        <Card>
          <CardHeader>
            <CardTitle>Popular Health Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableServices
                .filter(s => s.popular)
                .slice(0, 6)
                .map(service => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onBookService={() => onServiceSelect(service)}
                    onLearnMore={() => onServiceSelect(service)}
                  />
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export type { HealthProfile, Recommendation }