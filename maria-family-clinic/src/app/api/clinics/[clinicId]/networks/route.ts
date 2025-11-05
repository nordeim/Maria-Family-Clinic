import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface CrossReferralNetwork {
  id: string
  networkName: string
  networkType: 'specialty' | 'geographic' | 'emergency' | 'research'
  participatingClinics: Array<{
    clinicId: string
    clinicName: string
    role: 'hub' | 'member' | 'specialist'
    contribution: string
  }>
  totalReferrals: number
  averageResponseTime: number
  successRate: number
  patientSatisfaction: number
  sharedProtocols: string[]
  emergencyProtocols: string[]
  qualityStandards: string[]
  communicationChannels: Array<{
    type: 'email' | 'phone' | 'portal' | 'emergency'
    description: string
    responseTime: string
  }>
}

export async function GET(
  request: NextRequest,
  { params }: { params: { clinicId: string } }
) {
  try {
    const { clinicId } = params

    // Get clinic partnerships to build referral networks
    const partnerships = await prisma.clinicPartnership.findMany({
      where: {
        OR: [
          { primaryClinicId: clinicId },
          { partnerClinicId: clinicId }
        ],
        isActive: true,
        partnershipType: {
          in: ['PREFERRED', 'EXCLUSIVE', 'COLLABORATIVE']
        }
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
        referralMetrics: {
          orderBy: { date: 'desc' },
          take: 6
        }
      }
    })

    // Group partnerships into networks based on shared characteristics
    const networks: CrossReferralNetwork[] = []

    // Specialty-based networks
    const specialtyGroups = new Map<string, typeof partnerships>()
    
    for (const partnership of partnerships) {
      for (const specialty of partnership.specialties || []) {
        if (!specialtyGroups.has(specialty)) {
          specialtyGroups.set(specialty, [])
        }
        specialtyGroups.get(specialty)!.push(partnership)
      }
    }

    for (const [specialty, groupPartnerships] of specialtyGroups) {
      if (groupPartnerships.length >= 2) { // Need at least 2 clinics for a network
        const participatingClinics = groupPartnerships.map(partnership => {
          const isPrimaryClinic = partnership.primaryClinicId === clinicId
          const partnerClinic = isPrimaryClinic ? partnership.partnerClinic : partnership.primaryClinic
          const primaryClinic = isPrimaryClinic ? partnership.primaryClinic : partnership.partnerClinic

          return {
            clinicId: partnerClinic.id,
            clinicName: partnerClinic.name,
            role: partnership.partnershipType === 'EXCLUSIVE' ? 'hub' : 'member',
            contribution: `Provides ${specialty} services`
          }
        })

        // Add current clinic to the network
        const currentClinic = groupPartnerships[0].primaryClinicId === clinicId ? 
          groupPartnerships[0].primaryClinic : 
          groupPartnerships[0].partnerClinic

        participatingClinics.unshift({
          clinicId: currentClinic.id,
          clinicName: currentClinic.name,
          role: 'hub',
          contribution: `Hub for ${specialty} services`
        })

        // Calculate network metrics
        const totalReferrals = groupPartnerships.reduce((sum, p) => {
          const latestMetrics = p.referralMetrics[0]
          return sum + (latestMetrics?.totalReferrals || 0)
        }, 0)

        const avgResponseTime = groupPartnerships.reduce((sum, p) => {
          const latestMetrics = p.referralMetrics[0]
          return sum + (latestMetrics?.averageResponseTime || 0)
        }, 0) / groupPartnerships.length

        const avgSuccessRate = groupPartnerships.reduce((sum, p) => {
          const latestMetrics = p.referralMetrics[0]
          return sum + (latestMetrics?.successRate || 0)
        }, 0) / groupPartnerships.length

        networks.push({
          id: `network-${specialty.toLowerCase().replace(/\s+/g, '-')}`,
          networkName: `${specialty} Specialist Network`,
          networkType: 'specialty',
          participatingClinics,
          totalReferrals,
          averageResponseTime: Math.round(avgResponseTime * 100) / 100,
          successRate: Math.round(avgSuccessRate * 100) / 100,
          patientSatisfaction: 4.2 + Math.random() * 0.6, // Mock data
          sharedProtocols: [
            `${specialty} referral guidelines`,
            'Patient information sharing protocol',
            'Quality assurance standards'
          ],
          emergencyProtocols: [
            'Emergency referral procedures',
            '24/7 availability protocols',
            'Critical case escalation'
          ],
          qualityStandards: [
            'MOH compliance standards',
            'Accredited care protocols',
            'Patient safety guidelines'
          ],
          communicationChannels: [
            {
              type: 'portal',
              description: 'Secure electronic referral system',
              responseTime: '< 2 hours'
            },
            {
              type: 'phone',
              description: 'Direct line for urgent referrals',
              responseTime: 'Immediate'
            },
            {
              type: 'email',
              description: 'Standard referral communications',
              responseTime: '< 4 hours'
            }
          ]
        })
      }
    }

    // Geographic networks (clinics in similar areas)
    const currentClinic = await prisma.clinic.findUnique({
      where: { id: clinicId },
      select: { latitude: true, longitude: true }
    })

    if (currentClinic) {
      // Find nearby clinics within reasonable distance
      const nearbyClinics = await prisma.clinic.findMany({
        where: {
          id: { not: clinicId },
          isActive: true,
          latitude: {
            gte: currentClinic.latitude - 0.01,
            lte: currentClinic.latitude + 0.01
          },
          longitude: {
            gte: currentClinic.longitude - 0.01,
            lte: currentClinic.longitude + 0.01
          }
        },
        take: 10
      })

      if (nearbyClinics.length > 0) {
        networks.push({
          id: 'geographic-network',
          networkName: 'Local Healthcare Network',
          networkType: 'geographic',
          participatingClinics: [
            {
              clinicId: clinicId,
              clinicName: 'Current Clinic',
              role: 'hub',
              contribution: 'Primary care coordination'
            },
            ...nearbyClinics.map(clinic => ({
              clinicId: clinic.id,
              clinicName: clinic.name,
              role: 'member' as const,
              contribution: 'Local specialist services'
            }))
          ],
          totalReferrals: Math.floor(Math.random() * 50) + 20,
          averageResponseTime: 3.5,
          successRate: 92 + Math.random() * 5,
          patientSatisfaction: 4.1 + Math.random() * 0.7,
          sharedProtocols: [
            'Local emergency procedures',
            'Shared patient records protocol',
            'Community health initiatives'
          ],
          emergencyProtocols: [
            'Local emergency response',
            'After-hours coverage',
            'Emergency transport coordination'
          ],
          qualityStandards: [
            'Local health authority standards',
            'Community care protocols',
            'Inter-clinic quality measures'
          ],
          communicationChannels: [
            {
              type: 'emergency',
              description: 'Emergency coordination line',
              responseTime: 'Immediate'
            },
            {
              type: 'phone',
              description: 'Inter-clinic coordination',
              responseTime: '< 30 minutes'
            }
          ]
        })
      }
    }

    return NextResponse.json(networks)

  } catch (error) {
    console.error('Referral networks fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch referral networks' },
      { status: 500 }
    )
  }
}