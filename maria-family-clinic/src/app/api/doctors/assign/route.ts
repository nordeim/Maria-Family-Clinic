import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface AssignmentCriteria {
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

interface DoctorAssignment {
  doctor: any
  clinic: any
  doctorClinic: any
  availability: any
  assignmentScore: number
  assignmentReasons: string[]
  estimatedWaitTime: number
  consultationFee: number
  distance: number
  languageMatch: number
  specialtyMatch: number
  complexityMatch: number
  availabilityScore: number
  partnershipBonus: number
  isRecommended: boolean
  alternatives: DoctorAssignment[]
  confidence: number
  riskFactors: string[]
}

export async function POST(request: NextRequest) {
  try {
    const criteria: AssignmentCriteria = await request.json()

    // Get all doctors with their clinic relationships and availability
    const doctors = await prisma.doctor.findMany({
      where: {
        isActive: true,
        isVerified: true
      },
      include: {
        clinics: {
          include: {
            clinic: true
          }
        },
        availabilities: {
          where: {
            isAvailable: true,
            date: {
              gte: new Date()
            }
          },
          include: {
            clinic: true
          }
        },
        specialtiesRel: true
      }
    })

    const assignments: DoctorAssignment[] = []

    for (const doctor of doctors) {
      for (const doctorClinic of doctor.clinics) {
        // Skip if doctor clinic relationship is not active
        if (doctorClinic.verificationStatus !== 'VERIFIED') continue

        const clinic = doctorClinic.clinic
        let assignmentScore = 0
        const assignmentReasons: string[] = []
        const riskFactors: string[] = []
        let confidence = 0

        // Specialty matching
        let specialtyMatch = 0
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
        
        if (matchingSpecialties.length > 0) {
          specialtyMatch = matchingSpecialties.length / criteria.specialtyRequired.length
          assignmentScore += specialtyMatch * 30
          assignmentReasons.push(`Matches specialty: ${matchingSpecialties.join(', ')}`)
          confidence += 0.2
        } else {
          riskFactors.push('No direct specialty match')
        }

        // Language matching
        let languageMatch = 0
        const doctorLanguages = doctor.languages || []
        const matchingLanguages = criteria.preferredLanguages.filter(lang =>
          doctorLanguages.some(docLang => 
            docLang.toLowerCase().includes(lang.toLowerCase())
          )
        )
        
        if (matchingLanguages.length > 0) {
          languageMatch = matchingLanguages.length / criteria.preferredLanguages.length
          assignmentScore += languageMatch * 15
          assignmentReasons.push(`Language match: ${matchingLanguages.join(', ')}`)
          confidence += 0.15
        }

        // Experience and rating boost
        if (doctor.rating) {
          assignmentScore += doctor.rating * 2
          confidence += 0.1
        }

        if (doctor.experienceYears && doctor.experienceYears > 10) {
          assignmentScore += 10
          assignmentReasons.push('Highly experienced')
          confidence += 0.1
        }

        // Availability matching
        const relevantAvailabilities = doctor.availabilities.filter(avail => 
          avail.clinicId === clinic.id && 
          avail.isAvailable &&
          avail.status === 'ACTIVE'
        )

        let availabilityScore = 0
        if (relevantAvailabilities.length > 0) {
          // Check for urgent availability if needed
          if (criteria.urgencyLevel === 'emergency' || criteria.urgencyLevel === 'same-day') {
            const urgentAvailabilities = relevantAvailabilities.filter(avail => 
              avail.isEmergency || avail.availabilityType === 'EMERGENCY'
            )
            if (urgentAvailabilities.length > 0) {
              availabilityScore = 1.0
              assignmentReasons.push('Emergency availability')
              confidence += 0.2
            }
          } else {
            availabilityScore = Math.min(relevantAvailabilities.length / 10, 1.0)
            assignmentScore += availabilityScore * 20
            confidence += 0.15
          }
        } else {
          riskFactors.push('No upcoming availability')
        }

        // Complexity matching
        let complexityMatch = 0
        if (criteria.medicalComplexity === 'simple' && doctor.rating && doctor.rating >= 3) {
          complexityMatch = 0.8
        } else if (criteria.medicalComplexity === 'moderate') {
          complexityMatch = doctor.experienceYears && doctor.experienceYears > 5 ? 0.9 : 0.6
        } else if (criteria.medicalComplexity === 'complex' || criteria.medicalComplexity === 'specialized') {
          complexityMatch = doctor.experienceYears && doctor.experienceYears > 10 ? 1.0 : 0.3
          if (complexityMatch < 0.5) {
            riskFactors.push('Limited experience for complex cases')
          }
        }
        
        assignmentScore += complexityMatch * 15
        confidence += 0.1

        // Partnership bonus
        let partnershipBonus = 0
        // Check for existing partnerships (this would need to be implemented)
        partnershipBonus = Math.random() * 5 // Placeholder
        assignmentScore += partnershipBonus

        // Distance calculation (placeholder)
        let distance = 0
        if (criteria.location) {
          // Calculate actual distance between patient location and clinic
          distance = Math.random() * 50 // Placeholder: 0-50km
          
          if (criteria.maxDistance && distance > criteria.maxDistance) {
            continue // Skip if too far
          }
          
          assignmentScore += Math.max(0, 20 - distance * 0.2)
        }

        // Calculate estimated wait time
        let estimatedWaitTime = 0
        if (relevantAvailabilities.length > 0) {
          const nextAvailable = relevantAvailabilities[0]
          const today = new Date()
          const availabilityDate = new Date(nextAvailable.date)
          const diffTime = availabilityDate.getTime() - today.getTime()
          estimatedWaitTime = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) // Days
        } else {
          estimatedWaitTime = 30 + Math.floor(Math.random() * 30) // 30-60 days
        }

        if (criteria.maxWaitTime && estimatedWaitTime > criteria.maxWaitTime) {
          riskFactors.push('Wait time exceeds preference')
        }

        // Final scoring
        assignmentScore = Math.min(assignmentScore, 100)
        confidence = Math.min(confidence, 1.0)

        const isRecommended = assignmentScore >= 70 && confidence >= 0.6

        if (assignmentScore >= 30) { // Only include reasonable matches
          assignments.push({
            doctor,
            clinic,
            doctorClinic,
            availability: relevantAvailabilities[0] || null,
            assignmentScore,
            assignmentReasons,
            estimatedWaitTime,
            consultationFee: doctorClinic.consultationFee || doctor.consultationFee || 0,
            distance,
            languageMatch,
            specialtyMatch,
            complexityMatch,
            availabilityScore,
            partnershipBonus,
            isRecommended,
            alternatives: [], // To be populated separately
            confidence,
            riskFactors
          })
        }
      }
    }

    // Sort by assignment score and confidence
    assignments.sort((a, b) => {
      if (b.assignmentScore !== a.assignmentScore) {
        return b.assignmentScore - a.assignmentScore
      }
      return b.confidence - a.confidence
    })

    // Take top 20 results
    const topAssignments = assignments.slice(0, 20)

    // Add alternatives for each assignment
    for (const assignment of topAssignments) {
      const alternatives = assignments
        .filter(a => 
          a.doctor.id !== assignment.doctor.id &&
          a.assignmentScore >= assignment.assignmentScore * 0.7 &&
          a.distance <= assignment.distance * 1.5
        )
        .slice(0, 3)
      
      assignment.alternatives = alternatives
    }

    return NextResponse.json(topAssignments)
  } catch (error) {
    console.error('Doctor assignment error:', error)
    return NextResponse.json(
      { error: 'Failed to assign doctors' },
      { status: 500 }
    )
  }
}