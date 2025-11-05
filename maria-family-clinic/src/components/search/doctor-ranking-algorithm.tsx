'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  Clock, 
  Star, 
  MapPin, 
  Award, 
  Users,
  Activity,
  Zap,
  CheckCircle
} from 'lucide-react'

interface SearchRankingFactor {
  name: string
  weight: number
  score: number
  explanation: string
}

interface DoctorRankingScore {
  doctorId: string
  baseScore: number
  relevanceScore: number
  availabilityScore: number
  proximityScore: number
  ratingScore: number
  experienceScore: number
  patientFeedbackScore: number
  specialtyMatchScore: number
  finalScore: number
  rankingFactors: SearchRankingFactor[]
}

interface DoctorRankingAlgorithmProps {
  doctorId: string
  doctorData: {
    specialties: string[]
    rating?: number
    reviewCount?: number
    experienceYears?: number
    clinicAffiliations?: Array<{
      distance?: number
      rating?: number
      nextAvailable?: string
      clinicType?: string
    }>
    availabilityScore?: number
    patientRecommendations?: number
    popularityScore?: number
    mohVerified?: boolean
    telemedicine?: boolean
  }
  searchContext: {
    searchQuery?: string
    userLocation?: { latitude: number; longitude: number }
    preferredSpecialty?: string
    urgencyLevel?: 'routine' | 'urgent' | 'emergency'
    timeConstraints?: {
      preferredDays?: string[]
      timeSlots?: string[]
      earliestDate?: string
    }
    userPreferences?: {
      clinicTypes?: string[]
      insuranceTypes?: string[]
      languagePreferences?: string[]
      doctorGender?: string
    }
  }
  showDetailedBreakdown?: boolean
  className?: string
}

export function DoctorRankingAlgorithm({
  doctorId,
  doctorData,
  searchContext,
  showDetailedBreakdown = false,
  className
}: DoctorRankingAlgorithmProps) {
  // Calculate individual component scores
  const calculateRelevanceScore = (): number => {
    if (!searchContext.searchQuery) return 0.5

    const query = searchContext.searchQuery.toLowerCase()
    const doctorText = [
      ...doctorData.specialties,
      doctorData.specialties.join(' ').toLowerCase()
    ].join(' ')

    // Simple text matching - can be enhanced with more sophisticated NLP
    let score = 0
    if (doctorText.includes(query)) {
      score = 1.0
    } else {
      // Fuzzy matching for partial matches
      const queryWords = query.split(' ')
      const matchedWords = queryWords.filter(word => doctorText.includes(word))
      score = matchedWords.length / queryWords.length
    }

    return score
  }

  const calculateAvailabilityScore = (): number => {
    let score = 0.5 // Base score for availability

    // Boost for next available appointment
    const now = new Date()
    const earliestAcceptable = searchContext.timeConstraints?.earliestDate 
      ? new Date(searchContext.timeConstraints.earliestDate)
      : new Date()

    // Check clinic availabilities
    doctorData.clinicAffiliations?.forEach(clinic => {
      if (clinic.nextAvailable) {
        const availableDate = new Date(clinic.nextAvailable)
        const daysDiff = (availableDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        
        if (daysDiff <= 1) score += 0.3 // Available today/tomorrow
        else if (daysDiff <= 3) score += 0.2 // Available within 3 days
        else if (daysDiff <= 7) score += 0.1 // Available within a week
      }
    })

    // Use provided availability score if available
    if (doctorData.availabilityScore !== undefined) {
      score = doctorData.availabilityScore / 100
    }

    return Math.min(score, 1.0)
  }

  const calculateProximityScore = (): number => {
    if (!searchContext.userLocation || !doctorData.clinicAffiliations?.length) {
      return 0.5
    }

    // Find closest clinic
    const distances = doctorData.clinicAffiliations
      .map(clinic => clinic.distance || 0)
      .filter(d => d > 0)

    if (distances.length === 0) return 0.5

    const closestDistance = Math.min(...distances)
    
    // Convert distance to score (closer = higher score)
    // Using exponential decay for realistic scoring
    const maxDistance = 20 // km
    const score = Math.exp(-closestDistance / maxDistance)
    
    return Math.min(score, 1.0)
  }

  const calculateRatingScore = (): number => {
    if (!doctorData.rating) return 0.5
    
    // Normalize rating to 0-1 scale (assuming 1-5 rating system)
    const normalizedRating = (doctorData.rating - 1) / 4
    let score = normalizedRating

    // Boost for verified reviews (if review count is high)
    if (doctorData.reviewCount && doctorData.reviewCount > 10) {
      score += 0.1
    }

    // Boost for patient recommendations
    if (doctorData.patientRecommendations) {
      score += (doctorData.patientRecommendations / 100) * 0.2
    }

    return Math.min(score, 1.0)
  }

  const calculateExperienceScore = (): number => {
    if (!doctorData.experienceYears) return 0.5

    // Experience curve - more experience generally better but with diminishing returns
    const experience = doctorData.experienceYears
    let score: number

    if (experience >= 20) score = 1.0 // Veteran doctors
    else if (experience >= 15) score = 0.9 // Senior doctors
    else if (experience >= 10) score = 0.8 // Experienced doctors
    else if (experience >= 5) score = 0.6 // Competent doctors
    else score = 0.4 // New doctors

    return score
  }

  const calculateSpecialtyMatchScore = (): number => {
    if (!searchContext.preferredSpecialty) return 0.5

    const preferred = searchContext.preferredSpecialty.toLowerCase()
    const matches = doctorData.specialties.filter(specialty => 
      specialty.toLowerCase().includes(preferred)
    )

    return matches.length > 0 ? 1.0 : 0.0
  }

  const calculatePatientFeedbackScore = (): number => {
    let score = 0.5

    // Use patient recommendations if available
    if (doctorData.patientRecommendations) {
      score = doctorData.patientRecommendations / 100
    }

    // Boost for MOH verification
    if (doctorData.mohVerified) {
      score += 0.1
    }

    return Math.min(score, 1.0)
  }

  // Calculate all component scores
  const relevanceScore = calculateRelevanceScore()
  const availabilityScore = calculateAvailabilityScore()
  const proximityScore = calculateProximityScore()
  const ratingScore = calculateRatingScore()
  const experienceScore = calculateExperienceScore()
  const specialtyMatchScore = calculateSpecialtyMatchScore()
  const patientFeedbackScore = calculatePatientFeedbackScore()

  // Define weights based on search context
  const getWeights = () => {
    const baseWeights = {
      relevance: 0.25,
      availability: 0.20,
      proximity: 0.15,
      rating: 0.15,
      experience: 0.10,
      specialty: 0.10,
      feedback: 0.05
    }

    // Adjust weights based on urgency
    if (searchContext.urgencyLevel === 'urgent') {
      baseWeights.availability = 0.35
      baseWeights.proximity = 0.20
      baseWeights.relevance = 0.15
    } else if (searchContext.urgencyLevel === 'emergency') {
      baseWeights.availability = 0.40
      baseWeights.proximity = 0.25
      baseWeights.relevance = 0.10
    }

    return baseWeights
  }

  const weights = getWeights()

  // Calculate final score
  const finalScore = 
    relevanceScore * weights.relevance +
    availabilityScore * weights.availability +
    proximityScore * weights.proximity +
    ratingScore * weights.rating +
    experienceScore * weights.experience +
    specialtyMatchScore * weights.specialty +
    patientFeedbackScore * weights.feedback

  // Create detailed breakdown
  const rankingFactors: SearchRankingFactor[] = [
    {
      name: 'Relevance',
      weight: weights.relevance,
      score: relevanceScore,
      explanation: `Text match and semantic relevance to "${searchContext.searchQuery}"`
    },
    {
      name: 'Availability',
      weight: weights.availability,
      score: availabilityScore,
      explanation: 'Appointment availability and timing'
    },
    {
      name: 'Proximity',
      weight: weights.proximity,
      score: proximityScore,
      explanation: 'Distance from your location'
    },
    {
      name: 'Rating',
      weight: weights.rating,
      score: ratingScore,
      explanation: 'Patient ratings and reviews'
    },
    {
      name: 'Experience',
      weight: weights.experience,
      score: experienceScore,
      explanation: `${doctorData.experienceYears} years of practice`
    },
    {
      name: 'Specialty Match',
      weight: weights.specialty,
      score: specialtyMatchScore,
      explanation: `Matches preferred specialty: ${searchContext.preferredSpecialty}`
    },
    {
      name: 'Patient Feedback',
      weight: weights.feedback,
      score: patientFeedbackScore,
      explanation: 'Patient recommendations and verification'
    }
  ]

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600'
    if (score >= 0.6) return 'text-yellow-600'
    if (score >= 0.4) return 'text-orange-600'
    return 'text-red-600'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 0.9) return 'Excellent'
    if (score >= 0.7) return 'Very Good'
    if (score >= 0.5) return 'Good'
    if (score >= 0.3) return 'Fair'
    return 'Poor'
  }

  if (showDetailedBreakdown) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Relevance Ranking</h4>
            <Badge variant={finalScore >= 0.7 ? "default" : "secondary"}>
              {Math.round(finalScore * 100)}% Match
            </Badge>
          </div>
          
          <div className="space-y-3">
            {rankingFactors.map((factor) => (
              <div key={factor.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    {factor.name === 'Relevance' && <TrendingUp className="h-3 w-3" />}
                    {factor.name === 'Availability' && <Clock className="h-3 w-3" />}
                    {factor.name === 'Proximity' && <MapPin className="h-3 w-3" />}
                    {factor.name === 'Rating' && <Star className="h-3 w-3" />}
                    {factor.name === 'Experience' && <Award className="h-3 w-3" />}
                    {factor.name === 'Specialty Match' && <CheckCircle className="h-3 w-3" />}
                    {factor.name === 'Patient Feedback' && <Users className="h-3 w-3" />}
                    {factor.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={cn("font-medium", getScoreColor(factor.score))}>
                      {Math.round(factor.score * 100)}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({Math.round(factor.weight * 100)}% weight)
                    </span>
                  </div>
                </div>
                <Progress value={factor.score * 100} className="h-2" />
                <p className="text-xs text-muted-foreground">{factor.explanation}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Overall Match</span>
            <div className="flex items-center gap-2">
              <span className={cn("font-bold", getScoreColor(finalScore))}>
                {Math.round(finalScore * 100)}%
              </span>
              <Badge variant="outline">
                {getScoreLabel(finalScore)}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Compact view
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex items-center gap-1">
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">
          {Math.round(finalScore * 100)}% match
        </span>
      </div>
      
      <div className="flex gap-1">
        <div className="w-16 bg-gray-200 rounded-full h-2">
          <div 
            className={cn(
              "h-2 rounded-full",
              finalScore >= 0.7 ? "bg-green-500" : 
              finalScore >= 0.5 ? "bg-yellow-500" : "bg-red-500"
            )}
            style={{ width: `${finalScore * 100}%` }}
          />
        </div>
        
        <Badge variant="outline" className="text-xs">
          {getScoreLabel(finalScore)}
        </Badge>
      </div>
    </div>
  )
}

// Search result optimization hook
export function useSearchResultOptimization() {
  const optimizeSearchResults = React.useCallback((
    doctors: any[],
    searchContext: any
  ) => {
    return doctors
      .map(doctor => ({
        ...doctor,
        rankingScore: calculateDoctorRanking(doctor, searchContext)
      }))
      .sort((a, b) => b.rankingScore - a.rankingScore)
  }, [])

  const calculateDoctorRanking = React.useCallback((
    doctor: any,
    searchContext: any
  ): number => {
    // This is a simplified version of the ranking algorithm
    // In practice, you'd want to use the same logic as above
    
    let score = 0
    let totalWeight = 0

    // Relevance score
    if (searchContext.searchQuery) {
      const query = searchContext.searchQuery.toLowerCase()
      const doctorText = [
        ...(doctor.specialties || []),
        doctor.name || '',
        ...(doctor.conditionsTreated || []),
        ...(doctor.services || [])
      ].join(' ').toLowerCase()
      
      if (doctorText.includes(query)) {
        score += 0.25
        totalWeight += 0.25
      }
    }

    // Availability score
    if (doctor.nextAvailableDate) {
      score += 0.20
      totalWeight += 0.20
    }

    // Rating score
    if (doctor.rating) {
      const normalizedRating = (doctor.rating - 1) / 4
      score += normalizedRating * 0.15
      totalWeight += 0.15
    }

    // Experience score
    if (doctor.experienceYears) {
      const expScore = Math.min(doctor.experienceYears / 20, 1) * 0.10
      score += expScore
      totalWeight += 0.10
    }

    // Proximity score
    if (doctor.clinicAffiliations?.length > 0) {
      const distances = doctor.clinicAffiliations
        .map((clinic: any) => clinic.distance || 0)
        .filter((d: number) => d > 0)
      
      if (distances.length > 0) {
        const closest = Math.min(...distances)
        const proximityScore = Math.exp(-closest / 20) * 0.15
        score += proximityScore
        totalWeight += 0.15
      }
    }

    return totalWeight > 0 ? score / totalWeight : 0.5
  }, [])

  return {
    optimizeSearchResults,
    calculateDoctorRanking
  }
}