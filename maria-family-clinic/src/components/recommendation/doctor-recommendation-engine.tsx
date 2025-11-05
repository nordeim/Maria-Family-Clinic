"use client"

import React, { useState, useEffect, useMemo } from "react"
import { 
  Brain, 
  Target, 
  Star, 
  MapPin, 
  Clock, 
  DollarSign, 
  Languages, 
  Award,
  TrendingUp,
  Users,
  Activity,
  Heart,
  Shield,
  ThumbsUp,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Eye,
  Lightbulb
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Doctor, DoctorClinic } from "@/types/doctor"
import { EnhancedDoctorCard } from "@/components/healthcare/enhanced-doctor-card"

// =============================================================================
// RECOMMENDATION TYPES AND INTERFACES
// =============================================================================

interface UserHealthProfile {
  // Demographics
  age?: number
  gender?: "male" | "female" | "other" | "prefer-not-to-say"
  
  // Medical Information
  medicalHistory?: string[]
  currentConditions?: string[]
  medications?: string[]
  allergies?: string[]
  familyHistory?: string[]
  riskFactors?: {
    condition: string
    riskLevel: "low" | "moderate" | "high"
    description?: string
  }[]
  
  // Preferences
  preferences?: {
    doctorGender?: "male" | "female" | "no-preference"
    preferredLanguages?: string[]
    appointmentTypes?: ("in-person" | "telehealth" | "hybrid")[]
    preferredGender?: string
    culturalPreferences?: string[]
    communicationStyle?: "formal" | "casual" | "no-preference"
    preferredProviderType?: "private" | "public" | "polyclinic" | "no-preference"
  }
  
  // Location and Accessibility
  location?: {
    address: string
    coordinates?: { lat: number; lng: number }
    maxTravelDistance?: number // in km
    transportMode?: "walking" | "driving" | "public-transport" | "taxi"
  }
  
  // Insurance and Cost
  insurance?: {
    provider?: string
    plans?: string[]
    maxBudget?: number
    preferredPaymentMethod?: "cash" | "insurance" | "medisave" | "chop"
  }
  
  // Experience History
  experienceHistory?: {
    previousDoctors?: string[]
    satisfactionRatings?: { doctorId: string; rating: number; date: Date }[]
    appointmentTypes?: ("routine" | "urgent" | "emergency")[]
    treatmentOutcomes?: { condition: string; outcome: "excellent" | "good" | "fair" | "poor"; doctorId?: string }[]
  }
  
  // Personalization
  personalContext?: {
    primaryConcern?: string
    urgency?: "routine" | "urgent" | "same-day" | "emergency"
    preferredProviderGender?: string
    accessibilityNeeds?: string[]
    culturalRequirements?: string[]
  }
}

interface DoctorRecommendation {
  doctor: Doctor
  confidenceScore: number // 0-100
  matchingFactors: MatchingFactor[]
  recommendationReason: string
  recommendationType: RecommendationType
  rankingBreakdown: RankingFactor[]
  similarDoctors?: string[] // IDs of similar doctors
  alternativeOptions?: DoctorRecommendation[]
  lastUpdated: Date
}

interface MatchingFactor {
  type: "condition" | "specialty" | "language" | "location" | "insurance" | "experience" | "rating" | "availability" | "cultural" | "personal"
  label: string
  weight: number
  matched: boolean
  score: number
  description?: string
  evidence?: string[]
}

interface RankingFactor {
  name: string
  score: number
  weight: number
  contribution: number
  description: string
}

enum RecommendationType {
  CONDITION_BASED = "condition-based",
  LOCATION_BASED = "location-based", 
  SPECIALTY_BASED = "specialty-based",
  SIMILAR_PATIENTS = "similar-patients",
  TRENDING = "trending",
  PREMIUM = "premium",
  NEW_TO_SINGAPORE = "new-to-singapore",
  EXPERT = "expert"
}

interface RecommendationContext {
  userProfile: UserHealthProfile
  searchQuery?: string
  currentLocation?: { lat: number; lng: number; address: string }
  availableDoctors: Doctor[]
  recentAppointments?: string[]
  seasonalTrends?: string[]
  feedbackHistory?: RecommendationFeedback[]
}

interface RecommendationFeedback {
  doctorId: string
  userId: string
  recommendationId: string
  feedback: "helpful" | "not-helpful" | "booked" | "viewed" | "dismissed"
  rating?: number
  comment?: string
  timestamp: Date
  reason?: string
}

// =============================================================================
// RECOMMENDATION ALGORITHMS
// =============================================================================

class DoctorRecommendationEngine {
  private algorithmWeights = {
    conditionMatch: 0.25,
    specialtyMatch: 0.20,
    location: 0.15,
    language: 0.10,
    availability: 0.08,
    rating: 0.07,
    experience: 0.05,
    insurance: 0.04,
    personal: 0.03,
    trending: 0.03
  }

  // Multi-factor matching algorithm
  generateRecommendations(
    context: RecommendationContext,
    options: {
      limit?: number
      includeExplanations?: boolean
      includeAlternatives?: boolean
      personalized?: boolean
    } = {}
  ): DoctorRecommendation[] {
    const { 
      userProfile, 
      availableDoctors, 
      searchQuery, 
      feedbackHistory = [] 
    } = context

    const recommendations: DoctorRecommendation[] = []

    for (const doctor of availableDoctors) {
      const recommendation = this.generateSingleRecommendation(
        doctor, 
        context, 
        options
      )

      if (recommendation.confidenceScore > 20) { // Filter low-confidence recommendations
        recommendations.push(recommendation)
      }
    }

    // Apply collaborative filtering if user has history
    if (userProfile.experienceHistory?.satisfactionRatings?.length) {
      this.applyCollaborativeFiltering(recommendations, userProfile.experienceHistory)
    }

    // Apply feedback-based learning
    this.applyFeedbackLearning(recommendations, feedbackHistory)

    // Sort by final score and limit results
    return recommendations
      .sort((a, b) => b.confidenceScore - a.confidenceScore)
      .slice(0, options.limit || 10)
  }

  private generateSingleRecommendation(
    doctor: Doctor,
    context: RecommendationContext,
    options: { includeExplanations?: boolean } = {}
  ): DoctorRecommendation {
    const matchingFactors = this.analyzeMatchingFactors(doctor, context)
    const rankingFactors = this.calculateRankingFactors(doctor, matchingFactors, context)
    
    // Calculate confidence score
    const confidenceScore = this.calculateConfidenceScore(matchingFactors, rankingFactors)
    
    // Generate recommendation reason
    const recommendationReason = this.generateRecommendationReason(
      doctor, 
      matchingFactors, 
      rankingFactors
    )

    // Determine recommendation type
    const recommendationType = this.determineRecommendationType(
      doctor, 
      matchingFactors, 
      context
    )

    // Find similar doctors
    const similarDoctors = this.findSimilarDoctors(doctor, context.availableDoctors)

    return {
      doctor,
      confidenceScore,
      matchingFactors,
      recommendationReason,
      recommendationType,
      rankingBreakdown: rankingFactors,
      similarDoctors,
      lastUpdated: new Date()
    }
  }

  private analyzeMatchingFactors(doctor: Doctor, context: RecommendationContext): MatchingFactor[] {
    const factors: MatchingFactor[] = []
    const { userProfile } = context

    // 1. Condition-based matching
    if (userProfile.currentConditions?.length) {
      const conditionMatches = this.matchConditions(doctor, userProfile.currentConditions)
      if (conditionMatches.length > 0) {
        factors.push({
          type: "condition",
          label: "Conditions Treated",
          weight: this.algorithmWeights.conditionMatch,
          matched: true,
          score: Math.min(100, (conditionMatches.length / userProfile.currentConditions.length) * 100),
          description: `Treats ${conditionMatches.join(", ")}`,
          evidence: conditionMatches.map(match => `Experience with ${match}`)
        })
      } else {
        factors.push({
          type: "condition",
          label: "Conditions Treated",
          weight: this.algorithmWeights.conditionMatch,
          matched: false,
          score: 0,
          description: "No direct condition experience found"
        })
      }
    }

    // 2. Specialty matching
    if (doctor.specialties.length > 0) {
      const specialtyScore = this.calculateSpecialtyScore(doctor, userProfile)
      factors.push({
        type: "specialty",
        label: "Medical Specialization",
        weight: this.algorithmWeights.specialtyMatch,
        matched: specialtyScore > 50,
        score: specialtyScore,
        description: doctor.specialties.join(", "),
        evidence: doctor.specialties.map(s => `Specialist in ${s}`)
      })
    }

    // 3. Language matching
    if (userProfile.preferences?.preferredLanguages?.length) {
      const languageMatches = doctor.languages.filter(lang => 
        userProfile.preferences?.preferredLanguages?.includes(lang)
      )
      
      factors.push({
        type: "language",
        label: "Language Compatibility",
        weight: this.algorithmWeights.language,
        matched: languageMatches.length > 0,
        score: (languageMatches.length / (userProfile.preferences.preferredLanguages.length || 1)) * 100,
        description: languageMatches.length > 0 ? `Speaks: ${languageMatches.join(", ")}` : "No language match",
        evidence: languageMatches.map(l => `Fluent in ${l}`)
      })
    }

    // 4. Location-based matching
    if (userProfile.location) {
      const locationScore = this.calculateLocationScore(doctor, userProfile.location, context.currentLocation)
      factors.push({
        type: "location",
        label: "Proximity & Accessibility",
        weight: this.algorithmWeights.location,
        matched: locationScore > 30,
        score: locationScore,
        description: this.getLocationDescription(doctor, userProfile.location),
        evidence: [`Distance-based scoring: ${locationScore.toFixed(0)}%`]
      })
    }

    // 5. Availability matching
    const availabilityScore = this.calculateAvailabilityScore(doctor, userProfile.personalContext?.urgency)
    factors.push({
      type: "availability",
      label: "Availability & Wait Times",
      weight: this.algorithmWeights.availability,
      matched: availabilityScore > 20,
      score: availabilityScore,
      description: this.getAvailabilityDescription(doctor),
      evidence: [`Availability score: ${availabilityScore.toFixed(0)}%`]
    })

    // 6. Rating and reviews
    if (doctor.rating) {
      const ratingScore = Math.min(100, (doctor.rating / 5) * 100)
      factors.push({
        type: "rating",
        label: "Patient Satisfaction",
        weight: this.algorithmWeights.rating,
        matched: ratingScore > 60,
        score: ratingScore,
        description: `${doctor.rating}/5 stars (${doctor.reviewCount} reviews)`,
        evidence: [`Average rating: ${doctor.rating}/5`]
      })
    }

    // 7. Experience and credentials
    if (doctor.experienceYears) {
      const experienceScore = Math.min(100, (doctor.experienceYears / 30) * 100) // Cap at 30 years
      factors.push({
        type: "experience",
        label: "Professional Experience",
        weight: this.algorithmWeights.experience,
        matched: experienceScore > 30,
        score: experienceScore,
        description: `${doctor.experienceYears} years experience`,
        evidence: [`${doctor.experienceYears} years in practice`]
      })
    }

    // 8. Insurance compatibility
    if (userProfile.insurance) {
      const insuranceScore = this.calculateInsuranceScore(doctor, userProfile.insurance)
      factors.push({
        type: "insurance",
        label: "Insurance & Payment",
        weight: this.algorithmWeights.insurance,
        matched: insuranceScore > 0,
        score: insuranceScore,
        description: this.getInsuranceDescription(doctor, userProfile.insurance),
        evidence: [`Insurance compatibility: ${insuranceScore}%`]
      })
    }

    // 9. Personal preferences
    if (userProfile.preferences?.doctorGender) {
      const personalScore = this.calculatePersonalScore(doctor, userProfile.preferences)
      factors.push({
        type: "personal",
        label: "Personal Preferences",
        weight: this.algorithmWeights.personal,
        matched: personalScore > 0,
        score: personalScore,
        description: this.getPersonalDescription(doctor, userProfile.preferences),
        evidence: [`Preference matching: ${personalScore}%`]
      })
    }

    // 10. Trending/Popularity
    const trendingScore = this.calculateTrendingScore(doctor, context)
    factors.push({
      type: "trending",
      label: "Popularity & Trends",
      weight: this.algorithmWeights.trending,
      matched: trendingScore > 50,
      score: trendingScore,
      description: this.getTrendingDescription(doctor, trendingScore),
      evidence: [`Popularity score: ${trendingScore}%`]
    })

    return factors
  }

  private calculateRankingFactors(
    doctor: Doctor, 
    matchingFactors: MatchingFactor[], 
    context: RecommendationContext
  ): RankingFactor[] {
    const factors: RankingFactor[] = []

    // Overall match score
    const matchScore = matchingFactors.reduce((sum, factor) => 
      sum + (factor.score * factor.weight), 0
    )
    factors.push({
      name: "Overall Match",
      score: matchScore,
      weight: 0.3,
      contribution: matchScore * 0.3,
      description: "Weighted combination of all matching factors"
    })

    // Patient satisfaction
    if (doctor.rating) {
      const satisfaction = (doctor.rating / 5) * 100
      factors.push({
        name: "Patient Satisfaction",
        score: satisfaction,
        weight: 0.2,
        contribution: satisfaction * 0.2,
        description: "Based on patient reviews and ratings"
      })
    }

    // Experience and expertise
    const expertiseScore = doctor.experienceYears ? 
      Math.min(100, (doctor.experienceYears / 25) * 100) : 0
    factors.push({
      name: "Experience",
      score: expertiseScore,
      weight: 0.15,
      contribution: expertiseScore * 0.15,
      description: "Years of experience and expertise level"
    })

    // Availability
    const availability = this.calculateAvailabilityScore(doctor, context.userProfile.personalContext?.urgency)
    factors.push({
      name: "Availability",
      score: availability,
      weight: 0.15,
      contribution: availability * 0.15,
      description: "Current availability and wait times"
    })

    // Proximity
    if (context.userProfile.location) {
      const proximity = this.calculateLocationScore(doctor, context.userProfile.location, context.currentLocation)
      factors.push({
        name: "Location",
        score: proximity,
        weight: 0.1,
        contribution: proximity * 0.1,
        description: "Distance and accessibility"
      })
    }

    // Specialization relevance
    const specialization = this.calculateSpecialtyScore(doctor, context.userProfile)
    factors.push({
      name: "Specialization",
      score: specialization,
      weight: 0.1,
      contribution: specialization * 0.1,
      description: "Relevance of medical specializations"
    })

    return factors
  }

  // Condition matching algorithm
  private matchConditions(doctor: Doctor, conditions: string[]): string[] {
    const matched: string[] = []
    
    // Check doctor's specialties and conditions treated
    const doctorKeywords = [
      ...doctor.specialties,
      ...(doctor.specializations || []),
      doctor.bio?.toLowerCase() || ""
    ]

    for (const condition of conditions) {
      const conditionLower = condition.toLowerCase()
      const isMatch = doctorKeywords.some(keyword => 
        keyword.toLowerCase().includes(conditionLower) ||
        conditionLower.includes(keyword.toLowerCase()) ||
        this.isConditionRelated(conditionLower, keyword.toLowerCase())
      )
      
      if (isMatch) {
        matched.push(condition)
      }
    }

    return matched
  }

  // Helper method to determine if conditions are related
  private isConditionRelated(condition: string, keyword: string): boolean {
    const conditionMappings: Record<string, string[]> = {
      "diabetes": ["endocrine", "diabetology", "metabolic"],
      "hypertension": ["cardiology", "cardiovascular", "blood pressure"],
      "depression": ["psychiatry", "psychology", "mental health"],
      "anxiety": ["psychiatry", "psychology", "mental health"],
      "heart disease": ["cardiology", "cardiovascular"],
      "cancer": ["oncology", "cancer treatment"],
      "arthritis": ["rheumatology", "orthopedics"],
      "back pain": ["orthopedics", "spine", "physiotherapy"],
      "skin conditions": ["dermatology", "skin"],
      "eye problems": ["ophthalmology", "eye"],
      "respiratory": ["pulmonology", "respiratory"],
      "gastrointestinal": ["gastroenterology", "digestive"]
    }

    const relatedTerms = conditionMappings[condition] || []
    return relatedTerms.some(term => keyword.includes(term))
  }

  // Calculate specialty score
  private calculateSpecialtyScore(doctor: Doctor, userProfile: UserHealthProfile): number {
    if (!userProfile.currentConditions?.length) {
      return doctor.specialties.length > 0 ? 80 : 50 // Base score for having specialties
    }

    const conditionMatches = this.matchConditions(doctor, userProfile.currentConditions)
    return (conditionMatches.length / userProfile.currentConditions.length) * 100
  }

  // Calculate location score
  private calculateLocationScore(
    doctor: Doctor, 
    userLocation: NonNullable<UserHealthProfile["location"]>, 
    currentLocation?: { lat: number; lng: number; address: string }
  ): number {
    // This would integrate with actual distance calculation
    // For now, returning a simulated score based on clinic locations
    if (!doctor.clinics?.length) return 0

    // Simulate distance-based scoring (0-100)
    const avgDistance = 5 // km - this would be calculated from actual coordinates
    const maxDistance = userLocation.maxTravelDistance || 10 // km
    const distanceScore = Math.max(0, 100 - (avgDistance / maxDistance) * 100)

    return Math.min(100, distanceScore)
  }

  // Calculate availability score
  private calculateAvailabilityScore(doctor: Doctor, urgency?: string): number {
    // This would integrate with actual availability data
    // For now, simulating availability based on doctor properties
    
    let baseScore = 70 // Base availability score
    
    // Adjust based on doctor workload indicators
    if (doctor.totalAppointments > 1000) baseScore -= 20 // High workload
    if (doctor.totalAppointments < 100) baseScore += 10 // Lower workload
    
    // Adjust based on urgency
    if (urgency === "emergency") baseScore = Math.max(baseScore - 30, 0) // Emergency doctors might be less available
    if (urgency === "same-day") baseScore = Math.min(baseScore + 15, 100)

    return Math.max(0, Math.min(100, baseScore))
  }

  // Calculate insurance score
  private calculateInsuranceScore(doctor: Doctor, insurance: NonNullable<UserHealthProfile["insurance"]>): number {
    // This would check actual doctor clinic affiliations for insurance acceptance
    let score = 0
    
    if (insurance.provider) {
      // Simulate insurance compatibility checking
      score += 50 // Base score for having insurance
    }
    
    if (insurance.maxBudget && doctor.consultationFee) {
      if (doctor.consultationFee <= insurance.maxBudget) {
        score += 50
      }
    }

    return Math.min(100, score)
  }

  // Calculate personal preference score
  private calculatePersonalScore(doctor: Doctor, preferences: NonNullable<UserHealthProfile["preferences"]>): number {
    let score = 0

    if (preferences.doctorGender && preferences.doctorGender !== "no-preference") {
      // This would require gender data on doctor
      score += 50
    }

    return Math.min(100, score)
  }

  // Calculate trending score
  private calculateTrendingScore(doctor: Doctor, context: RecommendationContext): number {
    let score = 50 // Base trending score

    // Simulate trending based on various factors
    if (doctor.reviewCount > 100) score += 20
    if (doctor.rating && doctor.rating > 4.5) score += 15
    if (doctor.specializationPopularity && doctor.specializationPopularity > 0.8) score += 15

    return Math.min(100, score)
  }

  // Helper methods for descriptions
  private getLocationDescription(doctor: Doctor, userLocation: NonNullable<UserHealthProfile["location"]>): string {
    // This would provide actual location-based description
    return "Within your preferred travel distance"
  }

  private getAvailabilityDescription(doctor: Doctor): string {
    if (doctor.appointmentCompletionRate && doctor.appointmentCompletionRate > 0.9) {
      return "High availability, good completion rate"
    }
    return "Moderate availability"
  }

  private getInsuranceDescription(doctor: Doctor, insurance: NonNullable<UserHealthProfile["insurance"]>): string {
    if (insurance.provider) {
      return "Insurance accepted"
    }
    return "Payment options available"
  }

  private getPersonalDescription(doctor: Doctor, preferences: NonNullable<UserHealthProfile["preferences"]>): string {
    return "Matches your personal preferences"
  }

  private getTrendingDescription(doctor: Doctor, score: number): string {
    if (score > 80) return "Highly popular and trending"
    if (score > 60) return "Popular choice among patients"
    return "Well-regarded by patients"
  }

  // Calculate final confidence score
  private calculateConfidenceScore(matchingFactors: MatchingFactor[], rankingFactors: RankingFactor[]): number {
    // Weighted combination of all factors
    const matchScore = matchingFactors.reduce((sum, factor) => 
      sum + (factor.score * factor.weight), 0
    )
    
    const rankingScore = rankingFactors.reduce((sum, factor) => 
      sum + factor.contribution, 0
    )

    return Math.min(100, (matchScore + rankingScore) / 2)
  }

  // Generate recommendation reason
  private generateRecommendationReason(
    doctor: Doctor,
    matchingFactors: MatchingFactor[],
    rankingFactors: RankingFactor[]
  ): string {
    const topFactors = matchingFactors
      .filter(f => f.matched && f.score > 60)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)

    if (topFactors.length > 0) {
      const reason = topFactors.map(f => f.label).join(", ")
      return `Recommended based on ${reason.toLowerCase()}`
    }

    return "Good match for your healthcare needs"
  }

  // Determine recommendation type
  private determineRecommendationType(
    doctor: Doctor,
    matchingFactors: MatchingFactor[],
    context: RecommendationContext
  ): RecommendationType {
    // Condition-based
    const hasConditionMatch = matchingFactors.some(f => f.type === "condition" && f.matched)
    if (hasConditionMatch) return RecommendationType.CONDITION_BASED

    // Location-based
    const locationFactor = matchingFactors.find(f => f.type === "location")
    if (locationFactor && locationFactor.score > 80) return RecommendationType.LOCATION_BASED

    // Expert level
    if (doctor.experienceYears && doctor.experienceYears > 20) return RecommendationType.EXPERT

    // Trending
    const trendingFactor = matchingFactors.find(f => f.type === "trending")
    if (trendingFactor && trendingFactor.score > 75) return RecommendationType.TRENDING

    // Default to specialty-based
    return RecommendationType.SPECIALTY_BASED
  }

  // Find similar doctors
  private findSimilarDoctors(doctor: Doctor, allDoctors: Doctor[]): string[] {
    const similar: { id: string; score: number }[] = []

    for (const otherDoctor of allDoctors) {
      if (otherDoctor.id === doctor.id) continue

      let similarityScore = 0

      // Specialty similarity
      const specialtyOverlap = doctor.specialties.filter(s => 
        otherDoctor.specialties.includes(s)
      ).length
      similarityScore += specialtyOverlap * 30

      // Language similarity
      const languageOverlap = doctor.languages.filter(l => 
        otherDoctor.languages.includes(l)
      ).length
      similarityScore += languageOverlap * 20

      // Experience similarity
      if (doctor.experienceYears && otherDoctor.experienceYears) {
        const experienceDiff = Math.abs(doctor.experienceYears - otherDoctor.experienceYears)
        if (experienceDiff <= 5) similarityScore += 25
      }

      // Rating similarity
      if (doctor.rating && otherDoctor.rating) {
        const ratingDiff = Math.abs(doctor.rating - otherDoctor.rating)
        if (ratingDiff <= 0.5) similarityScore += 25
      }

      if (similarityScore > 50) {
        similar.push({ id: otherDoctor.id, score: similarityScore })
      }
    }

    return similar
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(s => s.id)
  }

  // Collaborative filtering
  private applyCollaborativeFiltering(
    recommendations: DoctorRecommendation[], 
    experienceHistory: NonNullable<UserHealthProfile["experienceHistory"]>
  ): void {
    // Boost recommendations for doctors similar to previously satisfied doctors
    const satisfiedDoctorIds = experienceHistory.satisfactionRatings
      ?.filter(r => r.rating >= 4)
      .map(r => r.doctorId) || []

    recommendations.forEach(rec => {
      // Find similar doctors to previously satisfied ones
      const similarityBoost = rec.similarDoctors?.some(id => 
        satisfiedDoctorIds.includes(id)
      ) ? 10 : 0

      if (similarityBoost > 0) {
        rec.confidenceScore = Math.min(100, rec.confidenceScore + similarityBoost)
        rec.recommendationReason += " (Similar to doctors you've rated highly)"
      }
    })
  }

  // Apply feedback learning
  private applyFeedbackLearning(
    recommendations: DoctorRecommendation[], 
    feedbackHistory: RecommendationFeedback[]
  ): void {
    // Adjust future recommendations based on feedback
    feedbackHistory.forEach(feedback => {
      const recommendation = recommendations.find(r => r.doctor.id === feedback.doctorId)
      if (!recommendation) return

      switch (feedback.feedback) {
        case "helpful":
          recommendation.confidenceScore = Math.min(100, recommendation.confidenceScore + 5)
          break
        case "not-helpful":
          recommendation.confidenceScore = Math.max(0, recommendation.confidenceScore - 10)
          break
        case "booked":
          recommendation.confidenceScore = Math.min(100, recommendation.confidenceScore + 15)
          break
        case "dismissed":
          recommendation.confidenceScore = Math.max(0, recommendation.confidenceScore - 15)
          break
      }
    })
  }
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface DoctorRecommendationEngineProps {
  userProfile?: UserHealthProfile
  availableDoctors: Doctor[]
  onDoctorSelect?: (doctor: Doctor, recommendation: DoctorRecommendation) => void
  onDismissRecommendation?: (doctorId: string, reason: string) => void
  onProvideFeedback?: (doctorId: string, feedback: "helpful" | "not-helpful", comment?: string) => void
  showExplanation?: boolean
  personalized?: boolean
  limit?: number
}

export function DoctorRecommendationEngine({
  userProfile,
  availableDoctors,
  onDoctorSelect,
  onDismissRecommendation,
  onProvideFeedback,
  showExplanation = true,
  personalized = true,
  limit = 10
}: DoctorRecommendationEngineProps) {
  const [recommendations, setRecommendations] = useState<DoctorRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"personalized" | "all" | "trending" | "experts">("personalized")
  const [explanationMode, setExplanationMode] = useState(false)
  const [selectedRecommendation, setSelectedRecommendation] = useState<DoctorRecommendation | null>(null)

  const engine = useMemo(() => new DoctorRecommendationEngine(), [])
  
  // Generate recommendations when dependencies change
  useEffect(() => {
    if (!availableDoctors.length) return

    setLoading(true)

    try {
      // Simulate API call delay for realistic UX
      setTimeout(() => {
        const context: RecommendationContext = {
          userProfile: userProfile || {},
          availableDoctors,
          currentLocation: userProfile?.location?.coordinates ? {
            lat: userProfile.location.coordinates.lat,
            lng: userProfile.location.coordinates.lng,
            address: userProfile.location.address
          } : undefined
        }

        const generatedRecommendations = engine.generateRecommendations(context, {
          limit,
          includeExplanations: showExplanation,
          personalized
        })

        setRecommendations(generatedRecommendations)
        setLoading(false)
      }, 500)
    } catch (error) {
      console.error("Error generating recommendations:", error)
      setLoading(false)
    }
  }, [userProfile, availableDoctors, engine, limit, showExplanation, personalized])

  // Filter recommendations based on active tab
  const filteredRecommendations = recommendations.filter(rec => {
    switch (activeTab) {
      case "experts":
        return rec.doctor.experienceYears && rec.doctor.experienceYears > 20
      case "trending":
        return rec.recommendationType === RecommendationType.TRENDING
      default:
        return true
    }
  })

  const handleDoctorSelect = (doctor: Doctor, recommendation: DoctorRecommendation) => {
    onDoctorSelect?.(doctor, recommendation)
  }

  const handleProvideFeedback = (doctorId: string, feedback: "helpful" | "not-helpful", comment?: string) => {
    onProvideFeedback?.(doctorId, feedback, comment)
    
    // Update local state
    setRecommendations(prev => prev.map(rec => {
      if (rec.doctor.id === doctorId) {
        return {
          ...rec,
          confidenceScore: feedback === "helpful" ? 
            Math.min(100, rec.confidenceScore + 5) : 
            Math.max(0, rec.confidenceScore - 10)
        }
      }
      return rec
    }))
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center space-x-3">
            <Brain className="h-6 w-6 animate-spin text-primary" />
            <span className="text-lg font-medium">Generating personalized recommendations...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">AI-Powered Doctor Recommendations</h2>
            <p className="text-muted-foreground">
              {personalized && userProfile ? 
                "Personalized recommendations based on your health profile" : 
                "Top-rated and highly recommended doctors"
              }
            </p>
          </div>
        </div>
        
        {showExplanation && (
          <Button
            variant={explanationMode ? "default" : "outline"}
            size="sm"
            onClick={() => setExplanationMode(!explanationMode)}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            {explanationMode ? "Hide" : "Show"} Explanations
          </Button>
        )}
      </div>

      {/* Recommendation Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personalized" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            {personalized ? "For You" : "Recommended"}
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            All Doctors
          </TabsTrigger>
          <TabsTrigger value="experts" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Top Experts
          </TabsTrigger>
          <TabsTrigger value="trending" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trending
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          {filteredRecommendations.length > 0 ? (
            <div className="space-y-4">
              {filteredRecommendations.map((recommendation, index) => (
                <RecommendationCard
                  key={recommendation.doctor.id}
                  recommendation={recommendation}
                  rank={index + 1}
                  explanationMode={explanationMode}
                  onSelect={() => handleDoctorSelect(recommendation.doctor, recommendation)}
                  onDismiss={(reason) => onDismissRecommendation?.(recommendation.doctor.id, reason)}
                  onProvideFeedback={handleProvideFeedback}
                  showExplanation={showExplanation}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No Recommendations Found</h3>
                <p className="text-sm text-muted-foreground">
                  We couldn't find suitable doctors matching your criteria. Try adjusting your preferences.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </Tabs>
    </div>
  )
}

// =============================================================================
// RECOMMENDATION CARD COMPONENT
// =============================================================================

interface RecommendationCardProps {
  recommendation: DoctorRecommendation
  rank: number
  explanationMode: boolean
  onSelect: () => void
  onDismiss: (reason: string) => void
  onProvideFeedback: (doctorId: string, feedback: "helpful" | "not-helpful", comment?: string) => void
  showExplanation: boolean
}

function RecommendationCard({
  recommendation,
  rank,
  explanationMode,
  onSelect,
  onDismiss,
  onProvideFeedback,
  showExplanation
}: RecommendationCardProps) {
  const [showFullExplanation, setShowFullExplanation] = useState(false)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)

  const handleFeedback = (feedback: "helpful" | "not-helpful") => {
    onProvideFeedback(recommendation.doctor.id, feedback)
    setFeedbackSubmitted(true)
  }

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-orange-600"
  }

  const getConfidenceLabel = (score: number) => {
    if (score >= 80) return "Excellent Match"
    if (score >= 60) return "Good Match"
    if (score >= 40) return "Fair Match"
    return "Possible Match"
  }

  const getRecommendationIcon = (type: RecommendationType) => {
    switch (type) {
      case RecommendationType.CONDITION_BASED:
        return <Heart className="h-4 w-4" />
      case RecommendationType.LOCATION_BASED:
        return <MapPin className="h-4 w-4" />
      case RecommendationType.EXPERT:
        return <Award className="h-4 w-4" />
      case RecommendationType.TRENDING:
        return <TrendingUp className="h-4 w-4" />
      default:
        return <Target className="h-4 w-4" />
    }
  }

  return (
    <Card className="relative overflow-hidden">
      {/* Confidence Badge */}
      <div className="absolute top-4 right-4 z-10">
        <Badge variant="secondary" className={cn("font-medium", getConfidenceColor(recommendation.confidenceScore))}>
          <div className="flex items-center gap-1">
            {getRecommendationIcon(recommendation.recommendationType)}
            #{rank}
          </div>
        </Badge>
      </div>

      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                {getRecommendationIcon(recommendation.recommendationType)}
              </div>
              <div>
                <h3 className="text-lg font-semibold">{recommendation.doctor.name}</h3>
                <p className="text-sm text-muted-foreground">{recommendation.doctor.specialties.join(", ")}</p>
              </div>
            </CardTitle>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {recommendation.doctor.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{recommendation.doctor.rating}</span>
                  <span>({recommendation.doctor.reviewCount})</span>
                </div>
              )}
              {recommendation.doctor.experienceYears && (
                <div className="flex items-center gap-1">
                  <Activity className="h-4 w-4" />
                  <span>{recommendation.doctor.experienceYears} years exp.</span>
                </div>
              )}
              {recommendation.doctor.consultationFee && (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  <span>${recommendation.doctor.consultationFee}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <div className={cn("text-2xl font-bold", getConfidenceColor(recommendation.confidenceScore))}>
              {recommendation.confidenceScore}%
            </div>
            <div className="text-sm text-muted-foreground">
              {getConfidenceLabel(recommendation.confidenceScore)}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Recommendation Reason */}
        <Alert className="mb-4">
          <Sparkles className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{recommendation.recommendationReason}</span>
            {showExplanation && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFullExplanation(!showFullExplanation)}
                className="ml-2"
              >
                <Lightbulb className="h-4 w-4 mr-1" />
                Why?
              </Button>
            )}
          </AlertDescription>
        </Alert>

        {/* Matching Factors (if explanation mode is on) */}
        {explanationMode && showFullExplanation && (
          <div className="space-y-3 mb-4">
            <h4 className="font-semibold text-sm">Why this doctor was recommended:</h4>
            <div className="space-y-2">
              {recommendation.matchingFactors
                .filter(factor => factor.matched)
                .sort((a, b) => b.score - a.score)
                .slice(0, 5)
                .map((factor, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div className="flex items-center gap-2">
                      {factor.matched ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-gray-400" />
                      )}
                      <span className="text-sm font-medium">{factor.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={factor.score} className="w-16 h-2" />
                      <span className="text-sm text-muted-foreground">{factor.score.toFixed(0)}%</span>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <Button onClick={onSelect} className="flex-1">
            View Profile & Book
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          
          {!feedbackSubmitted ? (
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFeedback("helpful")}
                className="text-green-600 hover:text-green-700"
              >
                <ThumbsUp className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFeedback("not-helpful")}
                className="text-red-600 hover:text-red-700"
              >
                <ThumbsUp className="h-4 w-4 rotate-180" />
              </Button>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 inline mr-1" />
              Feedback recorded
            </div>
          )}
        </div>

        {/* Similar Doctors */}
        {recommendation.similarDoctors && recommendation.similarDoctors.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h5 className="text-sm font-medium mb-2">Similar doctors you might like:</h5>
            <div className="flex gap-2 flex-wrap">
              {recommendation.similarDoctors.slice(0, 3).map(doctorId => (
                <Badge key={doctorId} variant="outline" className="text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  Similar Profile
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export type { 
  UserHealthProfile, 
  DoctorRecommendation, 
  MatchingFactor, 
  RecommendationType,
  RecommendationContext,
  RecommendationFeedback 
}