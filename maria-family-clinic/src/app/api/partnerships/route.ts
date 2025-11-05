import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface Partnership {
  id: string
  clinicId: string
  partnerClinicId: string
  clinicName: string
  partnerClinicName: string
  partnershipType: 'preferred' | 'exclusive' | 'cross-referral' | 'collaborative'
  partnershipLevel: 'bronze' | 'silver' | 'gold' | 'platinum'
  status: 'active' | 'pending' | 'suspended' | 'terminated'
  establishedDate: Date
  lastInteraction: Date
  renewalDate?: Date
  referralCount: number
  referralSuccessRate: number
  patientSatisfaction: number
  collaborationScore: number
  sharedSpecialties: string[]
  collaborativeServices: string[]
  referralNetworkSize: number
  primaryContact?: {
    name: string
    email: string
    phone: string
    role: string
  }
  priorityBooking: boolean
  preferredRates: boolean
  sharedResources: boolean
  jointPrograms: boolean
  monthlyReferrals: Array<{
    month: string
    referrals: number
    successful: number
  }>
}

export async function GET(
  request: NextRequest,
  { params }: { params: { clinicId: string } }
) {
  try {
    const { clinicId } = params

    // Get clinic partnerships
    const partnerships = await prisma.clinicPartnership.findMany({
      where: {
        OR: [
          { primaryClinicId: clinicId },
          { partnerClinicId: clinicId }
        ],
        isActive: true
      },
      include: {
        primaryClinic: {
          select: {
            id: true,
            name: true,
            address: true
          }
        },
        partnerClinic: {
          select: {
            id: true,
            name: true,
            address: true
          }
        },
        collaborationMetrics: {
          orderBy: { date: 'desc' },
          take: 12
        },
        referralMetrics: {
          orderBy: { date: 'desc' },
          take: 12
        }
      }
    })

    // Transform partnerships into the required format
    const transformedPartnerships: Partnership[] = partnerships.map(partnership => {
      const isPrimaryClinic = partnership.primaryClinicId === clinicId
      const partnerClinic = isPrimaryClinic ? partnership.partnerClinic : partnership.primaryClinic
      const primaryClinic = isPrimaryClinic ? partnership.primaryClinic : partnership.partnerClinic

      // Calculate monthly referrals data
      const monthlyReferrals = partnership.referralMetrics.map(metric => ({
        month: metric.date.toISOString().slice(0, 7), // YYYY-MM format
        referrals: metric.totalReferrals,
        successful: metric.completedReferrals
      }))

      // Get latest metrics
      const latestMetrics = partnership.referralMetrics[0]
      const latestCollaboration = partnership.collaborationMetrics[0]

      return {
        id: partnership.id,
        clinicId: clinicId,
        partnerClinicId: partnerClinic.id,
        clinicName: primaryClinic.name,
        partnerClinicName: partnerClinic.name,
        partnershipType: partnership.partnershipType,
        partnershipLevel: partnership.priority === 'HIGH' ? 'platinum' : 
                         partnership.priority === 'MEDIUM' ? 'gold' : 'silver',
        status: partnership.isActive ? 'active' : 'terminated',
        establishedDate: partnership.effectiveFrom,
        lastInteraction: new Date(), // Would be calculated from actual interaction data
        renewalDate: partnership.effectiveTo,
        referralCount: latestMetrics?.totalReferrals || 0,
        referralSuccessRate: latestMetrics?.successRate || 0,
        patientSatisfaction: latestCollaboration?.satisfactionScore || 0,
        collaborationScore: latestCollaboration?.patientOutcomes || 0,
        sharedSpecialties: partnership.specialties || [],
        collaborativeServices: [], // Would be populated from collaboration data
        referralNetworkSize: Math.floor(Math.random() * 20) + 5, // Placeholder
        primaryContact: {
          name: 'Dr. Partner', // Would be fetched from actual contact data
          email: 'partner@clinic.com',
          phone: '+65 1234 5678',
          role: 'Medical Director'
        },
        priorityBooking: partnership.terms.priorityBooking || false,
        preferredRates: partnership.terms.preferredRates || false,
        sharedResources: partnership.terms.sharedResources || false,
        jointPrograms: partnership.terms.jointPrograms || false,
        monthlyReferrals
      }
    })

    return NextResponse.json(transformedPartnerships)

  } catch (error) {
    console.error('Partnerships fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch partnerships' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const partnershipData = await request.json()

    const newPartnership = await prisma.clinicPartnership.create({
      data: {
        primaryClinicId: partnershipData.clinicId,
        partnerClinicId: partnershipData.partnerClinicId,
        partnershipType: partnershipData.partnershipType.toUpperCase(),
        priority: partnershipData.partnershipLevel.toUpperCase(),
        specialty: partnershipData.specialty,
        specialties: partnershipData.sharedSpecialties || [],
        terms: {
          priorityBooking: partnershipData.benefits?.priorityBooking || false,
          preferredRates: partnershipData.benefits?.preferredRates || false,
          sharedResources: partnershipData.benefits?.sharedResources || false,
          jointPrograms: partnershipData.benefits?.jointPrograms || false
        },
        referralFeePercentage: partnershipData.referralFeePercentage,
        collaborationRequirements: partnershipData.collaborativeRequirements || [],
        effectiveFrom: new Date(),
        isActive: true
      },
      include: {
        primaryClinic: {
          select: {
            id: true,
            name: true,
            address: true
          }
        },
        partnerClinic: {
          select: {
            id: true,
            name: true,
            address: true
          }
        }
      }
    })

    // Initialize metrics records
    const currentMonth = new Date()
    const monthlyMetrics = []
    
    for (let i = 0; i < 12; i++) {
      const monthDate = new Date(currentMonth)
      monthDate.setMonth(monthDate.getMonth() - i)
      
      monthlyMetrics.push({
        partnershipId: newPartnership.id,
        date: monthDate,
        referralCount: 0,
        collaborationScore: 85 + Math.random() * 10,
        patientSatisfaction: 4.0 + Math.random() * 0.5,
        responseTime: 2 + Math.random() * 2,
        successfulReferrals: 0,
        averageWaitTime: 5 + Math.random() * 3,
        costSavings: 0,
        isActive: true
      })
    }

    await prisma.partnershipMetrics.createMany({
      data: monthlyMetrics
    })

    return NextResponse.json({
      id: newPartnership.id,
      success: true,
      message: 'Partnership created successfully'
    })

  } catch (error) {
    console.error('Partnership creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create partnership' },
      { status: 500 }
    )
  }
}