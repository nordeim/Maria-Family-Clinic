'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Star, 
  MapPin, 
  Clock, 
  Activity, 
  Shield, 
  Users, 
  Heart,
  TrendingUp,
  Award,
  CheckCircle,
  Phone,
  Globe,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { 
  ClinicSearchResult, 
  SearchFilters, 
  RankingCriteria, 
  ComplexityLevel, 
  ServiceType,
  UrgencyLevel,
  PatientType
} from '@/types/search'
import { medicalTermRecognizer } from '@/lib/medical-terms'

interface ServiceSearchResultProps {
  result: ClinicSearchResult
  query?: string
  filters?: SearchFilters
  ranking?: SearchResultRanking
  viewMode?: 'grid' | 'list'
  onSelect?: (result: ClinicSearchResult) => void
  className?: string
}

interface SearchResultRanking {
  overallScore: number
  relevanceScore: number
  availabilityScore: number
  proximityScore: number
  ratingScore: number
  priceScore: number
  waitingTimeScore: number
  medicalTermMatch: number
  specialtyMatch: number
  urgencyMatch: number
  patientTypeMatch: number
  rankingReasons: string[]
}

// Enhanced search result with medical intelligence
export function ServiceSearchResult({
  result,
  query = '',
  filters = {},
  ranking,
  viewMode = 'grid',
  onSelect,
  className
}: ServiceSearchResultProps) {
  const [showDetails, setShowDetails] = useState(false)

  // Calculate dynamic ranking based on medical context
  const enhancedRanking: SearchResultRanking = useMemo(() => {
    return calculateMedicalIntelligenceRanking(result, query, filters)
  }, [result, query, filters])

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600'
    if (score >= 0.6) return 'text-blue-600'
    if (score >= 0.4) return 'text-yellow-600'
    return 'text-gray-600'
  }

  const getScoreBackground = (score: number) => {
    if (score >= 0.8) return 'bg-green-100'
    if (score >= 0.6) return 'bg-blue-100'
    if (score >= 0.4) return 'bg-yellow-100'
    return 'bg-gray-100'
  }

  if (viewMode === 'list') {
    return (
      <Card className={cn("hover:shadow-lg transition-all cursor-pointer", className)}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-4">
            {/* Ranking Badge */}
            <div className="flex-shrink-0">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center text-white font-bold",
                enhancedRanking.overallScore >= 0.8 ? "bg-green-600" :
                enhancedRanking.overallScore >= 0.6 ? "bg-blue-600" :
                enhancedRanking.overallScore >= 0.4 ? "bg-yellow-600" : "bg-gray-600"
              )}>
                {Math.round(enhancedRanking.overallScore * 100)}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {result.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">
                    {result.address}
                  </p>
                  
                  {/* Quick Info */}
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    {result.rating && (
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="font-medium">{result.rating}</span>
                        <span>({result.totalReviews})</span>
                      </div>
                    )}
                    
                    {result.distance && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{result.distance.toFixed(1)} km</span>
                      </div>
                    )}
                    
                    {result.isOpen !== undefined && (
                      <div className={cn(
                        "flex items-center space-x-1",
                        result.isOpen ? "text-green-600" : "text-red-600"
                      )}>
                        <Clock className="w-4 h-4" />
                        <span>{result.isOpen ? 'Open' : 'Closed'}</span>
                      </div>
                    )}
                  </div>

                  {/* Medical Intelligence Indicators */}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {enhancedRanking.medicalTermMatch > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        🩺 Medical Match
                      </Badge>
                    )}
                    {enhancedRanking.urgencyMatch > 0 && (
                      <Badge variant="outline" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        Urgent Care
                      </Badge>
                    )}
                    {enhancedRanking.patientTypeMatch > 0 && (
                      <Badge variant="outline" className="text-xs">
                        <Users className="w-3 h-3 mr-1" />
                        {result.patientTypes?.[0] || 'Specialized'}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-2">
                  <Button size="sm" onClick={() => onSelect?.(result)}>
                    View Details
                  </Button>
                  
                  {result.phone && (
                    <Button variant="outline" size="sm">
                      <Phone className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Ranking Details */}
              {showDetails && (
                <div className="mt-4 pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium mb-2">Relevance Scores</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>Overall Match</span>
                          <span className={getScoreColor(enhancedRanking.overallScore)}>
                            {Math.round(enhancedRanking.overallScore * 100)}%
                          </span>
                        </div>
                        <Progress value={enhancedRanking.overallScore * 100} className="h-1" />
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Ranking Factors</h4>
                      <div className="space-y-1 text-xs">
                        {enhancedRanking.rankingReasons.map((reason, index) => (
                          <div key={index} className="flex items-center space-x-1">
                            <CheckCircle className="w-3 h-3 text-green-600" />
                            <span>{reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="mt-2 w-full"
              >
                {showDetails ? 'Hide' : 'Show'} Ranking Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Grid view
  return (
    <Card className={cn("hover:shadow-lg transition-all cursor-pointer", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold text-lg leading-tight">
                {result.name}
              </h3>
              
              {/* Overall Score */}
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold",
                enhancedRanking.overallScore >= 0.8 ? "bg-green-600" :
                enhancedRanking.overallScore >= 0.6 ? "bg-blue-600" :
                enhancedRanking.overallScore >= 0.4 ? "bg-yellow-600" : "bg-gray-600"
              )}>
                {Math.round(enhancedRanking.overallScore * 100)}
              </div>
            </div>
            
            <p className="text-gray-600 text-sm mb-2">
              {result.address}
            </p>
            
            {/* Quick Stats */}
            <div className="flex items-center space-x-3 text-sm">
              {result.rating && (
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="font-medium">{result.rating}</span>
                  <span className="text-gray-500">({result.totalReviews})</span>
                </div>
              )}
              
              {result.distance && (
                <div className="flex items-center space-x-1 text-gray-500">
                  <MapPin className="w-4 h-4" />
                  <span>{result.distance.toFixed(1)}km</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Medical Intelligence Badges */}
        <div className="flex flex-wrap gap-2 mb-3">
          {enhancedRanking.medicalTermMatch > 0 && (
            <Badge variant="secondary" className="text-xs">
              🩺 High Relevance
            </Badge>
          )}
          {enhancedRanking.specialtyMatch > 0 && (
            <Badge variant="outline" className="text-xs">
              <Award className="w-3 h-3 mr-1" />
              Specialty Match
            </Badge>
          )}
          {enhancedRanking.urgencyMatch > 0 && (
            <Badge variant="outline" className="text-xs">
              <Activity className="w-3 h-3 mr-1" />
              Urgent Available
            </Badge>
          )}
          {result.isHealthierSgPartner && (
            <Badge variant="outline" className="text-xs">
              <Shield className="w-3 h-3 mr-1" />
              Healthier SG
            </Badge>
          )}
        </div>

        {/* Services/Specialties */}
        {result.specialties && result.specialties.length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Specialties</h4>
            <div className="flex flex-wrap gap-1">
              {result.specialties.slice(0, 3).map((specialty, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {specialty}
                </Badge>
              ))}
              {result.specialties.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{result.specialties.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Services */}
        {result.services && result.services.length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Services</h4>
            <div className="flex flex-wrap gap-1">
              {result.services.slice(0, 2).map((service, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {service}
                </Badge>
              ))}
              {result.services.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{result.services.length - 2} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Features */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{result.isOpen ? 'Open now' : 'Closed'}</span>
          </div>
          
          {result.waitTime && (
            <div className="flex items-center space-x-1">
              <TrendingUp className="w-4 h-4" />
              <span>Wait: {result.waitTime}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button 
            className="flex-1" 
            size="sm"
            onClick={() => onSelect?.(result)}
          >
            View Details
          </Button>
          
          {result.phone && (
            <Button variant="outline" size="sm">
              <Phone className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Detailed Ranking Info */}
        <div className="mt-3 pt-3 border-t">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Match Score</span>
              <span className={getScoreColor(enhancedRanking.overallScore)}>
                {Math.round(enhancedRanking.overallScore * 100)}%
              </span>
            </div>
            <Progress value={enhancedRanking.overallScore * 100} className="h-1" />
            
            {/* Ranking Reasons */}
            {enhancedRanking.rankingReasons.length > 0 && (
              <div className="mt-2">
                <div className="text-xs text-gray-500 mb-1">Why this result:</div>
                <div className="space-y-1">
                  {enhancedRanking.rankingReasons.slice(0, 2).map((reason, index) => (
                    <div key={index} className="flex items-center space-x-1">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      <span className="text-xs text-gray-600">{reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Calculate medical intelligence ranking
function calculateMedicalIntelligenceRanking(
  result: ClinicSearchResult,
  query: string,
  filters: SearchFilters
): SearchResultRanking {
  let overallScore = 0
  let relevanceScore = 0
  let availabilityScore = 0
  let proximityScore = 0
  let ratingScore = 0
  let priceScore = 0
  let waitingTimeScore = 0
  let medicalTermMatch = 0
  let specialtyMatch = 0
  let urgencyMatch = 0
  let patientTypeMatch = 0
  
  const rankingReasons: string[] = []

  // 1. Medical Term Recognition and Relevance (25%)
  if (query) {
    const medicalRecognition = medicalTermRecognizer.recognizeTerms(query)
    if (medicalRecognition.recognizedTerms.length > 0) {
      medicalTermMatch = medicalRecognition.confidence
      relevanceScore += medicalTermMatch * 0.25
      rankingReasons.push(`Medical term match: ${medicalRecognition.recognizedTerms.join(', ')}`)
    }

    // Check specialty match
    if (result.specialties) {
      const matchedSpecialties = medicalRecognition.specialties.filter(specialty =>
        result.specialties.some(s => s.toLowerCase().includes(specialty.toLowerCase()))
      )
      if (matchedSpecialties.length > 0) {
        specialtyMatch = 1
        relevanceScore += 0.15
        rankingReasons.push(`Specialty match: ${matchedSpecialties.join(', ')}`)
      }
    }
  }

  // 2. Urgency Matching (20%)
  if (filters.urgency && filters.urgency.length > 0) {
    const urgencyLevel = filters.urgency[0] // Assuming single selection
    if (result.isOpen && urgencyLevel === 'emergency') {
      urgencyMatch = 1
      availabilityScore += 0.2
      rankingReasons.push('Emergency availability')
    } else if (result.waitTime && urgencyLevel === 'urgent') {
      urgencyMatch = 0.8
      availabilityScore += 0.15
      rankingReasons.push('Urgent care available')
    }
  }

  // 3. Patient Type Matching (15%)
  if (filters.patientTypes && filters.patientTypes.length > 0) {
    const targetPatientTypes = filters.patientTypes
    if (result.patientTypes) {
      const matches = targetPatientTypes.filter(type =>
        result.patientTypes.some(p => p === type)
      )
      if (matches.length > 0) {
        patientTypeMatch = matches.length / targetPatientTypes.length
        relevanceScore += patientTypeMatch * 0.15
        rankingReasons.push(`Patient type match: ${matches.join(', ')}`)
      }
    }
  }

  // 4. Proximity Scoring (15%)
  if (result.distance !== undefined) {
    if (filters.location) {
      const radius = filters.location.radiusKm
      if (result.distance <= radius * 0.5) {
        proximityScore = 1
        rankingReasons.push('Very close location')
      } else if (result.distance <= radius) {
        proximityScore = 0.8
        rankingReasons.push('Within search radius')
      } else {
        proximityScore = 0.3
      }
    } else {
      proximityScore = 0.5 // Default if no location filter
    }
    proximityScore = proximityScore * 0.15
  }

  // 5. Rating and Reviews (15%)
  if (result.rating && result.totalReviews) {
    ratingScore = (result.rating / 5) * Math.min(result.totalReviews / 50, 1)
    ratingScore = ratingScore * 0.15
    rankingReasons.push(`${result.rating} star rating`)
  }

  // 6. Availability Score (10%)
  if (result.isOpen !== undefined) {
    availabilityScore += result.isOpen ? 0.1 : 0.02
    if (result.isOpen) {
      rankingReasons.push('Currently open')
    }
  }

  // Calculate final scores
  overallScore = relevanceScore + availabilityScore + proximityScore + ratingScore + waitingTimeScore

  // Normalize scores to 0-1 range
  return {
    overallScore: Math.min(overallScore, 1),
    relevanceScore: Math.min(relevanceScore, 1),
    availabilityScore: Math.min(availabilityScore, 1),
    proximityScore: Math.min(proximityScore, 1),
    ratingScore: Math.min(ratingScore, 1),
    priceScore: Math.min(priceScore, 1),
    waitingTimeScore: Math.min(waitingTimeScore, 1),
    medicalTermMatch,
    specialtyMatch,
    urgencyMatch,
    patientTypeMatch,
    rankingReasons: rankingReasons.slice(0, 3) // Limit to top 3 reasons
  }
}

// Search results container with sorting and filtering
interface SearchResultsProps {
  results: ClinicSearchResult[]
  query?: string
  filters?: SearchFilters
  sorting?: {
    criteria: RankingCriteria
    order: 'asc' | 'desc'
  }
  viewMode?: 'grid' | 'list'
  onSelect?: (result: ClinicSearchResult) => void
  className?: string
}

export function SearchResults({
  results,
  query = '',
  filters = {},
  sorting = { criteria: 'relevance', order: 'desc' },
  viewMode = 'grid',
  onSelect,
  className
}: SearchResultsProps) {
  const [selectedSorting, setSelectedSorting] = useState(sorting)

  // Sort results based on criteria
  const sortedResults = useMemo(() => {
    const sorted = [...results].map(result => ({
      result,
      ranking: calculateMedicalIntelligenceRanking(result, query, filters)
    }))

    switch (selectedSorting.criteria) {
      case 'relevance':
        sorted.sort((a, b) => 
          selectedSorting.order === 'desc' 
            ? b.ranking.overallScore - a.ranking.overallScore
            : a.ranking.overallScore - b.ranking.overallScore
        )
        break
      case 'proximity':
        sorted.sort((a, b) => 
          (a.result.distance || 0) - (b.result.distance || 0)
        )
        break
      case 'rating':
        sorted.sort((a, b) => 
          (b.result.rating || 0) - (a.result.rating || 0)
        )
        break
      case 'waiting_time':
        // Sort by waiting time if available
        sorted.sort((a, b) => {
          const waitA = a.result.waitTime || 'Unknown'
          const waitB = b.result.waitTime || 'Unknown'
          return waitA.localeCompare(waitB)
        })
        break
      default:
        break
    }

    return sorted.map(item => item.result)
  }, [results, query, filters, selectedSorting])

  if (results.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Info className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>No search results available</p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Sort Controls */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {results.length} result{results.length !== 1 ? 's' : ''} found
        </p>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <Select
            value={selectedSorting.criteria}
            onValueChange={(value: RankingCriteria) => 
              setSelectedSorting(prev => ({ ...prev, criteria: value }))
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="proximity">Distance</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="waiting_time">Wait Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Grid/List */}
      <div className={cn(
        "grid gap-4",
        viewMode === 'grid' 
          ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" 
          : "grid-cols-1"
      )}>
        {sortedResults.map((result) => (
          <ServiceSearchResult
            key={result.id}
            result={result}
            query={query}
            filters={filters}
            viewMode={viewMode}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  )
}