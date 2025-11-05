import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface MatchScoreRequest {
  doctorId: string
  criteria: {
    specialtyRequired: string[]
    urgencyLevel: 'routine' | 'urgent' | 'emergency' | 'same-day'
    preferredLanguages: string[]
    patientAge?: number
    patientGender?: 'male' | 'female' | 'other'
    medicalComplexity: 'simple' | 'moderate' | 'complex' | 'specialized'
    location?: string
    appointmentType: 'in-person' | 'telehealth' | 'emergency'
    maxDistance?: number
    maxWaitTime?: number
    insuranceRequirements?: string[]
    specialNeeds?: string[]
    patientPreferences?: {
      preferredDoctor?: string
      preferredGender?: 'male' | 'female'
      preferredLanguage?: string
      avoidDoctor?: string[]
    }
  }
  clinicId: string
}

interface MatchScore {
  overall: number
  specialty: number
  language: number
  location: number
  availability: number
  complexity: number
  rating: number
  experience: number
  partnership: number
}

export async function POST(request: NextRequest) {
  try {
    const { doctorId, criteria, clinicId }: MatchScoreRequest = await request.json()

    // Get doctor with all relationships
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: {
        clinics: {
          where: { clinicId },
          include: { clinic: true }
        },
        availabilities: {
          where: {
            clinicId: clinicId,
            isAvailable: true,
            date: { gte: new Date() }
          },
          orderBy: { date: 'asc' },
          take: 10
        },
        specialtiesRel: true
      }
    })

    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      )
    }

    const doctorClinic = doctor.clinics[0]
    if (!doctorClinic) {
      return NextResponse.json(
        { error: 'Doctor-clinic relationship not found' },
        { status: 404 }
      )
    }

    // Calculate individual match scores
    let specialtyScore = 0
    let languageScore = 0
    let locationScore = 0
    let availabilityScore = 0
    let complexityScore = 0
    let ratingScore = 0
    let experienceScore = 0
    let partnershipScore = 0

    // Specialty matching (30% weight)
    const doctorSpecialties = [
      ...doctor.specialties,
      ...doctor.specializations,
      ...doctorClinic.clinicSpecializations
    ]
    
    const matchingSpecialties = criteria.specialtyRequired.filter(specialty =>
      doctorSpecialties.some(docSpec => 
        docSpec.toLowerCase().includes(specialty.toLowerCase())
      )
    )
    
    specialtyScore = criteria.specialtyRequired.length > 0
      ? (matchingSpecialties.length / criteria.specialtyRequired.length) * 100
      : 100

    // Language matching (15% weight)
    const doctorLanguages = doctor.languages || []
    const matchingLanguages = criteria.preferredLanguages.filter(lang =>
      doctorLanguages.some(docLang => 
        docLang.toLowerCase().includes(lang.toLowerCase())
      )
    )
    
    languageScore = criteria.preferredLanguages.length > 0
      ? (matchingLanguages.length / criteria.preferredLanguages.length) * 100
      : 100

    // Location scoring (10% weight) - based on clinic location
    if (criteria.location && criteria.maxDistance) {
      // In a real implementation, this would calculate actual distance
      // For now, we'll assume location is good
      locationScore = 80
    } else {
      locationScore = 100
    }

    // Availability scoring (20% weight)
    const relevantAvailabilities = doctor.availabilities.filter(avail => 
      avail.clinicId === clinicId && avail.isAvailable
    )

    if (relevantAvailabilities.length > 0) {
      // Check for urgent availability if needed
      if (criteria.urgencyLevel === 'emergency' || criteria.urgencyLevel === 'same-day') {
        const urgentAvailabilities = relevantAvailabilities.filter(avail => 
          avail.isEmergency || avail.availabilityType === 'EMERGENCY'
        )
        availabilityScore = urgentAvailabilities.length > 0 ? 100 : 30
      } else {
        availabilityScore = Math.min((relevantAvailabilities.length / 10) * 100, 100)
      }
    } else {
      availabilityScore = 0
    }

    // Complexity matching (10% weight)
    if (criteria.medicalComplexity === 'simple') {
      complexityScore = doctor.rating && doctor.rating >= 3 ? 90 : 60
    } else if (criteria.medicalComplexity === 'moderate') {
      complexityScore = (doctor.experienceYears && doctor.experienceYears > 5) ? 90 : 60
    } else if (criteria.medicalComplexity === 'complex') {
      complexityScore = (doctor.experienceYears && doctor.experienceYears > 10) ? 95 : 40
    } else if (criteria.medicalComplexity === 'specialized') {
      complexityScore = (doctor.experienceYears && doctor.experienceYears > 15) ? 100 : 30
    }

    // Rating score (5% weight)
    ratingScore = doctor.rating ? (doctor.rating / 5) * 100 : 50

    // Experience score (5% weight)
    if (doctor.experienceYears) {
      if (doctor.experienceYears < 2) experienceScore = 30
      else if (doctor.experienceYears < 5) experienceScore = 60
      else if (doctor.experienceYears < 10) experienceScore = 80
      else if (doctor.experienceYears < 20) experienceScore = 95
      else experienceScore = 100
    } else {
      experienceScore = 50
    }

    // Partnership score (5% weight)
    // This would check for existing partnerships - placeholder for now
    partnershipScore = 70

    // Calculate overall score (weighted average)
    const overall = (
      specialtyScore * 0.30 +
      languageScore * 0.15 +
      locationScore * 0.10 +
      availabilityScore * 0.20 +
      complexityScore * 0.10 +
      ratingScore * 0.05 +
      experienceScore * 0.05 +
      partnershipScore * 0.05
    )

    const matchScore: MatchScore = {
      overall: Math.round(overall * 100) / 100,
      specialty: Math.round(specialtyScore * 100) / 100,
      language: Math.round(languageScore * 100) / 100,
      location: Math.round(locationScore * 100) / 100,
      availability: Math.round(availabilityScore * 100) / 100,
      complexity: Math.round(complexityScore * 100) / 100,
      rating: Math.round(ratingScore * 100) / 100,
      experience: Math.round(experienceScore * 100) / 100,
      partnership: Math.round(partnershipScore * 100) / 100
    }

    return NextResponse.json(matchScore)
  } catch (error) {
    console.error('Match score calculation error:', error)
    return NextResponse.json(
      { error: 'Failed to calculate match score' },
      { status: 500 }
    )
  }
}