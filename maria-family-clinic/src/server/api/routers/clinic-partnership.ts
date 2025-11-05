import { z } from 'zod'
import { createTRPCRouter, publicProcedure, protectedProcedure, staffProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { Prisma } from '@prisma/client'

/**
 * Input validation schemas
 */
const partnershipSchema = z.object({
  primaryClinicId: z.string().uuid(),
  partnerClinicId: z.string().uuid(),
  partnershipType: z.enum(['REFERRED', 'PREFERRED', 'EXCLUSIVE', 'COLLABORATIVE']).default('REFERRED'),
  specialty: z.string().optional(),
  specialties: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  effectiveFrom: z.date().default(() => new Date()),
  effectiveTo: z.date().optional(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).default('MEDIUM'),
  terms: z.object({
    referralFeePercentage: z.number().min(0).max(100).optional(),
    minimumReferrals: z.number().optional(),
    maximumReferrals: z.number().optional(),
    collaborationRequirements: z.array(z.string()).default([]),
  }).optional(),
  notes: z.string().optional(),
})

const referralNetworkSchema = z.object({
  clinicId: z.string().uuid(),
  specialty: z.string(),
  specializationLevel: z.enum(['BASIC', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).default('INTERMEDIATE'),
  distance: z.number().default(10), // km radius
  preferredLanguages: z.array(z.string()).default([]),
  requiredServices: z.array(z.string()).default([]),
  excludeClinicIds: z.array(z.string().uuid()).default([]),
})

const collaborationSchema = z.object({
  primaryClinicId: z.string().uuid(),
  partnerClinicId: z.string().uuid(),
  collaborationType: z.enum([
    'SHARED_PATIENT_CARE',
    'CROSS_CONSULTATION',
    'EMERGENCY_COVERAGE',
    'SPECIALIZED_SERVICES',
    'RESEARCH',
    'TRAINING',
    'QUALITY_IMPROVEMENT'
  ]).default('SHARED_PATIENT_CARE'),
  sharedServices: z.array(z.string()).default([]),
  patientCareProtocol: z.object({
    dataSharing: z.boolean().default(false),
    consultationRequired: z.boolean().default(true),
    emergencyContacts: z.record(z.string()).default({}),
    preferredCommunication: z.enum(['EMAIL', 'PHONE', 'SYSTEM', 'ALL']).default('ALL'),
  }).default({}),
  qualityMetrics: z.object({
    patientSatisfactionTarget: z.number().min(1).max(5).default(4.0),
    responseTimeTarget: z.number().min(1).max(24).default(2), // hours
    collaborationScoreTarget: z.number().min(0).max(100).default(80),
  }).default({}),
})

/**
 * Clinic Partnership Router
 * Handles partnership management, referral networks, and collaboration tracking
 */
export const clinicPartnershipRouter = createTRPCRouter({
  /**
   * Get partnerships for a clinic
   */
  getClinicPartnerships: publicProcedure
    .input(
      z.object({
        clinicId: z.string().uuid(),
        partnershipType: z.enum(['REFERRED', 'PREFERRED', 'EXCLUSIVE', 'COLLABORATIVE']).optional(),
        specialty: z.string().optional(),
        isActive: z.boolean().default(true),
        includeMetrics: z.boolean().default(true),
      })
    )
    .query(async ({ ctx, input }) => {
      const { clinicId, partnershipType, specialty, isActive, includeMetrics } = input

      try {
        const whereClause: any = {
          OR: [
            { primaryClinicId: clinicId },
            { partnerClinicId: clinicId },
          ],
        }

        if (partnershipType) whereClause.partnershipType = partnershipType
        if (specialty) whereClause.specialties = { has: specialty }
        if (isActive !== undefined) whereClause.isActive = isActive

        const partnerships = await ctx.prisma.clinicPartnership.findMany({
          where: whereClause,
          include: {
            primaryClinic: {
              select: {
                id: true,
                name: true,
                address: true,
                phone: true,
                email: true,
                specialties: true,
              },
            },
            partnerClinic: {
              select: {
                id: true,
                name: true,
                address: true,
                phone: true,
                email: true,
                specialties: true,
              },
            },
            ...(includeMetrics && {
              collaborationMetrics: {
                orderBy: { date: 'desc' },
                take: 12, // Last 12 months
              },
              referralMetrics: {
                orderBy: { date: 'desc' },
                take: 12,
              },
            }),
          },
          orderBy: [
            { priority: 'desc' },
            { createdAt: 'desc' },
          ],
        })

        // Get additional partnership analytics
        const analytics = includeMetrics ? await getPartnershipAnalytics(ctx, clinicId, partnerships) : null

        return {
          partnerships: partnerships.map(partnership => ({
            ...partnership,
            role: partnership.primaryClinicId === clinicId ? 'primary' : 'partner',
            partnerClinic: partnership.primaryClinicId === clinicId ? partnership.partnerClinic : partnership.primaryClinic,
            primaryClinicId: partnership.primaryClinicId,
            partnerClinicId: partnership.partnerClinicId,
          })),
          analytics,
          summary: {
            totalPartnerships: partnerships.length,
            activePartnerships: partnerships.filter(p => p.isActive).length,
            byType: partnerships.reduce((acc, p) => {
              acc[p.partnershipType] = (acc[p.partnershipType] || 0) + 1
              return acc
            }, {}),
          },
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch clinic partnerships',
          cause: error,
        })
      }
    }),

  /**
   * Create a new clinic partnership
   */
  createPartnership: staffProcedure
    .input(partnershipSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if partnership already exists
        const existingPartnership = await ctx.prisma.clinicPartnership.findFirst({
          where: {
            OR: [
              {
                AND: [
                  { primaryClinicId: input.primaryClinicId },
                  { partnerClinicId: input.partnerClinicId },
                ],
              },
              {
                AND: [
                  { primaryClinicId: input.partnerClinicId },
                  { partnerClinicId: input.primaryClinicId },
                ],
              },
            ],
          },
        })

        if (existingPartnership) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Partnership already exists between these clinics',
          })
        }

        // Verify both clinics exist
        const [primaryClinic, partnerClinic] = await Promise.all([
          ctx.prisma.clinic.findUnique({
            where: { id: input.primaryClinicId },
            select: { id: true, name: true },
          }),
          ctx.prisma.clinic.findUnique({
            where: { id: input.partnerClinicId },
            select: { id: true, name: true },
          }),
        ])

        if (!primaryClinic || !partnerClinic) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'One or both clinics not found',
          })
        }

        const partnership = await ctx.prisma.clinicPartnership.create({
          data: input,
          include: {
            primaryClinic: true,
            partnerClinic: true,
          },
        })

        // Initialize partnership metrics
        await ctx.prisma.partnershipMetrics.create({
          data: {
            partnershipId: partnership.id,
            date: new Date(),
            referralCount: 0,
            collaborationScore: 0,
            patientSatisfaction: 0,
            responseTime: 0,
            isActive: true,
          },
        })

        return partnership
      } catch (error) {
        if (error instanceof TRPCError) throw error
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            throw new TRPCError({
              code: 'CONFLICT',
              message: 'Partnership already exists',
            })
          }
        }
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to create partnership',
          cause: error,
        })
      }
    }),

  /**
   * Update partnership details
   */
  updatePartnership: staffProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        partnershipType: z.enum(['REFERRED', 'PREFERRED', 'EXCLUSIVE', 'COLLABORATIVE']).optional(),
        isActive: z.boolean().optional(),
        effectiveTo: z.date().optional(),
        priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
        terms: z.object({
          referralFeePercentage: z.number().min(0).max(100).optional(),
          minimumReferrals: z.number().optional(),
          maximumReferrals: z.number().optional(),
          collaborationRequirements: z.array(z.string()).optional(),
        }).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      try {
        const partnership = await ctx.prisma.clinicPartnership.update({
          where: { id },
          data: updateData,
          include: {
            primaryClinic: true,
            partnerClinic: true,
          },
        })

        return partnership
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Partnership not found',
          })
        }
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to update partnership',
          cause: error,
        })
      }
    }),

  /**
   * Get referral network for a specialty
   */
  getReferralNetwork: publicProcedure
    .input(referralNetworkSchema)
    .query(async ({ ctx, input }) => {
      const { clinicId, specialty, specializationLevel, distance, preferredLanguages, requiredServices, excludeClinicIds } = input

      try {
        // Get the requesting clinic's location
        const requestingClinic = await ctx.prisma.clinic.findUnique({
          where: { id: clinicId },
          select: {
            id: true,
            name: true,
            location: true,
            postalCode: true,
          },
        })

        if (!requestingClinic) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Clinic not found',
          })
        }

        // Find potential referral partners
        const potentialPartners = await ctx.prisma.clinic.findMany({
          where: {
            id: {
              notIn: [clinicId, ...excludeClinicIds],
            },
            specialties: {
              has: specialty,
            },
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            email: true,
            specialties: true,
            location: true,
            postalCode: true,
            _count: {
              select: {
                appointments: {
                  where: {
                    service: {
                      name: {
                        in: requiredServices.length > 0 ? requiredServices : [specialty],
                      },
                    },
                  },
                },
                reviews: {
                  where: {
                    rating: { gte: 4 },
                  },
                },
              },
            },
          },
        })

        // Score and filter potential partners
        const scoredPartners = potentialPartners
          .map(clinic => {
            const score = calculateReferralScore(
              clinic,
              requestingClinic,
              specialty,
              specializationLevel,
              preferredLanguages,
              requiredServices
            )

            const distanceKm = calculateDistance(requestingClinic, clinic)

            return {
              ...clinic,
              referralScore: score,
              distanceKm,
              isWithinDistance: distanceKm <= distance,
              rating: clinic._count.reviews > 0 ? 
                4.2 + (Math.random() * 0.8) : 0, // Mock rating calculation
              serviceCapacity: clinic._count.appointments,
            }
          })
          .filter(partner => 
            partner.isWithinDistance && 
            partner.referralScore >= 30 // Minimum viable score
          )
          .sort((a, b) => b.referralScore - a.referralScore)

        // Get existing partnerships for context
        const existingPartnerships = await ctx.prisma.clinicPartnership.findMany({
          where: {
            OR: [
              { primaryClinicId: clinicId },
              { partnerClinicId: clinicId },
            ],
            isActive: true,
          },
        })

        return {
          referralNetwork: scoredPartners,
          existingPartnerships,
          searchCriteria: {
            specialty,
            specializationLevel,
            distance,
            preferredLanguages,
            requiredServices,
          },
          summary: {
            totalCandidates: potentialPartners.length,
            eligiblePartners: scoredPartners.length,
            averageDistance: scoredPartners.length > 0 ? 
              scoredPartners.reduce((sum, p) => sum + p.distanceKm, 0) / scoredPartners.length : 0,
          },
        }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to get referral network',
          cause: error,
        })
      }
    }),

  /**
   * Create or update collaboration agreement
   */
  upsertCollaboration: staffProcedure
    .input(collaborationSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if collaboration already exists
        const existingCollaboration = await ctx.prisma.clinicCollaboration.findFirst({
          where: {
            primaryClinicId: input.primaryClinicId,
            partnerClinicId: input.partnerClinicId,
            collaborationType: input.collaborationType,
            isActive: true,
          },
        })

        if (existingCollaboration) {
          const collaboration = await ctx.prisma.clinicCollaboration.update({
            where: { id: existingCollaboration.id },
            data: {
              ...input,
              updatedAt: new Date(),
            },
            include: {
              primaryClinic: true,
              partnerClinic: true,
            },
          })

          return collaboration
        } else {
          const collaboration = await ctx.prisma.clinicCollaboration.create({
            data: input,
            include: {
              primaryClinic: true,
              partnerClinic: true,
            },
          })

          return collaboration
        }
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            throw new TRPCError({
              code: 'CONFLICT',
              message: 'Collaboration already exists',
            })
          }
        }
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to upsert collaboration',
          cause: error,
        })
      }
    }),

  /**
   * Get collaboration metrics and performance
   */
  getCollaborationMetrics: protectedProcedure
    .input(
      z.object({
        clinicId: z.string().uuid(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        includeDetails: z.boolean().default(true),
      })
    )
    .query(async ({ ctx, input }) => {
      const { clinicId, startDate, endDate } = input
      const defaultEndDate = endDate || new Date()
      const defaultStartDate = startDate || new Date(defaultEndDate.getTime() - 90 * 24 * 60 * 60 * 1000) // 90 days ago

      try {
        // Get collaborations
        const collaborations = await ctx.prisma.clinicCollaboration.findMany({
          where: {
            OR: [
              { primaryClinicId: clinicId },
              { partnerClinicId: clinicId },
            ],
            isActive: true,
          },
          include: {
            primaryClinic: {
              select: { id: true, name: true },
            },
            partnerClinic: {
              select: { id: true, name: true },
            },
            collaborationMetrics: {
              where: {
                date: {
                  gte: defaultStartDate,
                  lte: defaultEndDate,
                },
              },
              orderBy: { date: 'desc' },
            },
          },
        })

        // Get referrals data
        const referrals = await ctx.prisma.serviceReferral.findMany({
          where: {
            createdAt: {
              gte: defaultStartDate,
              lte: defaultEndDate,
            },
            OR: [
              { referringClinicId: clinicId },
              { referredClinicId: clinicId },
            ],
          },
          include: {
            service: {
              select: { name: true, specialty: true },
            },
            referringClinic: {
              select: { id: true, name: true },
            },
            referredClinic: {
              select: { id: true, name: true },
            },
          },
        })

        // Calculate metrics
        const metrics = collaborations.map(collaboration => {
          const role = collaboration.primaryClinicId === clinicId ? 'primary' : 'partner'
          const partnerClinic = role === 'primary' ? collaboration.partnerClinic : collaboration.primaryClinic

          const collaborationMetrics = collaboration.collaborationMetrics
          const relevantReferrals = referrals.filter(r => 
            (role === 'primary' && r.referringClinicId === collaboration.primaryClinicId && r.referredClinicId === collaboration.partnerClinicId) ||
            (role === 'partner' && r.referringClinicId === collaboration.partnerClinicId && r.referredClinicId === collaboration.primaryClinicId)
          )

          return {
            collaboration,
            partnerClinic,
            role,
            performance: calculateCollaborationPerformance(collaborationMetrics, relevantReferrals),
            referralVolume: relevantReferrals.length,
            patientSatisfaction: calculateAverageSatisfaction(relevantReferrals),
            responseTime: calculateAverageResponseTime(relevantReferrals),
          }
        })

        // Calculate overall metrics
        const overallMetrics = {
          totalCollaborations: collaborations.length,
          activePartnerships: collaborations.filter(c => c.isActive).length,
          totalReferrals: referrals.length,
          averageSatisfaction: referrals.length > 0 ? 
            referrals.reduce((sum, r) => sum + (r.patientSatisfaction || 0), 0) / referrals.length : 0,
          collaborationHealth: calculateCollaborationHealth(metrics),
        }

        return {
          collaborations: metrics,
          overallMetrics,
          period: {
            start: defaultStartDate,
            end: defaultEndDate,
          },
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to get collaboration metrics',
          cause: error,
        })
      }
    }),

  /**
   * Get partnership recommendations
   */
  getPartnershipRecommendations: publicProcedure
    .input(
      z.object({
        clinicId: z.string().uuid(),
        specialty: z.string().optional(),
        maxDistance: z.number().default(15), // km
        maxResults: z.number().min(1).max(20).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const { clinicId, specialty, maxDistance, maxResults } = input

      try {
        // Get clinic details and current partnerships
        const clinic = await ctx.prisma.clinic.findUnique({
          where: { id: clinicId },
          include: {
            doctorClinicAffiliations: {
              include: {
                doctor: {
                  select: { specialties: true },
                },
              },
            },
            specialties: true,
          },
        })

        if (!clinic) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Clinic not found',
          })
        }

        // Get current partnerships to exclude
        const currentPartnerships = await ctx.prisma.clinicPartnership.findMany({
          where: {
            OR: [
              { primaryClinicId: clinicId },
              { partnerClinicId: clinicId },
            ],
            isActive: true,
          },
          select: {
            primaryClinicId: true,
            partnerClinicId: true,
          },
        })

        const excludeIds = new Set(currentPartnerships.flatMap(p => [p.primaryClinicId, p.partnerClinicId]))

        // Get potential partners
        const potentialPartners = await ctx.prisma.clinic.findMany({
          where: {
            id: { notIn: Array.from(excludeIds) },
            isActive: true,
            ...(specialty && {
              specialties: { has: specialty },
            }),
          },
          include: {
            _count: {
              select: {
                doctorClinicAffiliations: true,
                reviews: {
                  where: { rating: { gte: 4 } },
                },
              },
            },
          },
        })

        // Score potential partners
        const recommendations = potentialPartners
          .map(partner => {
            const score = calculatePartnershipPotential(clinic, partner, specialty)

            return {
              ...partner,
              partnershipScore: score,
              recommendationReason: generateRecommendationReason(clinic, partner, specialty),
              mutualSpecialties: clinic.specialties.filter(s => partner.specialties.includes(s)),
              doctorCount: partner._count.doctorClinicAffiliations,
              rating: partner._count.reviews > 0 ? 4.0 + Math.random() : 0,
            }
          })
          .filter(partner => partner.partnershipScore >= 40)
          .sort((a, b) => b.partnershipScore - a.partnershipScore)
          .slice(0, maxResults)

        return {
          recommendations,
          searchCriteria: {
            specialty,
            maxDistance,
            currentPartnershipsCount: currentPartnerships.length,
          },
          summary: {
            totalEvaluated: potentialPartners.length,
            recommended: recommendations.length,
            averageScore: recommendations.length > 0 ? 
              recommendations.reduce((sum, r) => sum + r.partnershipScore, 0) / recommendations.length : 0,
          },
        }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to get partnership recommendations',
          cause: error,
        })
      }
    }),

  /**
   * Record referral activity
   */
  recordReferral: protectedProcedure
    .input(
      z.object({
        referringClinicId: z.string().uuid(),
        referredClinicId: z.string().uuid(),
        serviceId: z.string().uuid(),
        patientId: z.string().uuid().optional(),
        referralReason: z.string(),
        urgency: z.enum(['ROUTINE', 'URGENT', 'EMERGENCY']).default('ROUTINE'),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify partnership exists
        const partnership = await ctx.prisma.clinicPartnership.findFirst({
          where: {
            OR: [
              {
                AND: [
                  { primaryClinicId: input.referringClinicId },
                  { partnerClinicId: input.referredClinicId },
                ],
              },
              {
                AND: [
                  { primaryClinicId: input.referredClinicId },
                  { partnerClinicId: input.referringClinicId },
                ],
              },
            ],
            isActive: true,
          },
        })

        if (!partnership) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'No active partnership exists between these clinics',
          })
        }

        // Create referral record
        const referral = await ctx.prisma.serviceReferral.create({
          data: {
            referringClinicId: input.referringClinicId,
            referredClinicId: input.referredClinicId,
            serviceId: input.serviceId,
            patientId: input.patientId,
            referralReason: input.referralReason,
            urgency: input.urgency,
            notes: input.notes,
            referralDate: new Date(),
            status: 'PENDING',
          },
          include: {
            service: {
              select: { name: true, specialty: true },
            },
            referringClinic: {
              select: { name: true },
            },
            referredClinic: {
              select: { name: true },
            },
          },
        })

        // Update partnership metrics
        await updatePartnershipMetrics(ctx, partnership.id)

        return referral
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to record referral',
          cause: error,
        })
      }
    }),

  /**
   * Get referral history and analytics
   */
  getReferralHistory: protectedProcedure
    .input(
      z.object({
        clinicId: z.string().uuid(),
        partnerClinicId: z.string().uuid().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        serviceId: z.string().uuid().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { clinicId, partnerClinicId, startDate, endDate, serviceId } = input
      const defaultEndDate = endDate || new Date()
      const defaultStartDate = startDate || new Date(defaultEndDate.getTime() - 90 * 24 * 60 * 60 * 1000)

      try {
        const whereClause: any = {
          createdAt: {
            gte: defaultStartDate,
            lte: defaultEndDate,
          },
        }

        if (partnerClinicId) {
          whereClause.OR = [
            {
              AND: [
                { referringClinicId: clinicId },
                { referredClinicId: partnerClinicId },
              ],
            },
            {
              AND: [
                { referringClinicId: partnerClinicId },
                { referredClinicId: clinicId },
              ],
            },
          ]
        } else {
          whereClause.OR = [
            { referringClinicId: clinicId },
            { referredClinicId: clinicId },
          ]
        }

        if (serviceId) {
          whereClause.serviceId = serviceId
        }

        const referrals = await ctx.prisma.serviceReferral.findMany({
          where: whereClause,
          include: {
            service: {
              select: { name: true, specialty: true },
            },
            referringClinic: {
              select: { id: true, name: true },
            },
            referredClinic: {
              select: { id: true, name: true },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        })

        // Calculate analytics
        const analytics = {
          totalReferrals: referrals.length,
          outgoingReferrals: referrals.filter(r => r.referringClinicId === clinicId).length,
          incomingReferrals: referrals.filter(r => r.referredClinicId === clinicId).length,
          byUrgency: referrals.reduce((acc, r) => {
            acc[r.urgency] = (acc[r.urgency] || 0) + 1
            return acc
          }, {}),
          byStatus: referrals.reduce((acc, r) => {
            acc[r.status] = (acc[r.status] || 0) + 1
            return acc
          }, {}),
          byService: referrals.reduce((acc, r) => {
            const serviceName = r.service.name
            acc[serviceName] = (acc[serviceName] || 0) + 1
            return acc
          }, {}),
          averageProcessingTime: calculateAverageProcessingTime(referrals),
          satisfactionScore: referrals.length > 0 ? 
            referrals.reduce((sum, r) => sum + (r.patientSatisfaction || 0), 0) / referrals.length : 0,
        }

        return {
          referrals,
          analytics,
          period: {
            start: defaultStartDate,
            end: defaultEndDate,
          },
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to get referral history',
          cause: error,
        })
      }
    }),
})

/**
 * Helper functions for partnership management
 */

/**
 * Get partnership analytics
 */
async function getPartnershipAnalytics(ctx: any, clinicId: string, partnerships: any[]) {
  const analytics = {
    totalReferrals: 0,
    successfulReferrals: 0,
    averageResponseTime: 0,
    collaborationScore: 0,
    patientSatisfaction: 0,
  }

  // This would calculate real analytics from referral and collaboration data
  // For now, return mock data based on partnership count
  analytics.totalReferrals = partnerships.length * 15
  analytics.successfulReferrals = Math.floor(analytics.totalReferrals * 0.85)
  analytics.averageResponseTime = 2.5
  analytics.collaborationScore = partnerships.length > 5 ? 85 : 70
  analytics.patientSatisfaction = 4.2

  return analytics
}

/**
 * Calculate referral score for potential partners
 */
function calculateReferralScore(
  clinic: any,
  requestingClinic: any,
  specialty: string,
  specializationLevel: string,
  preferredLanguages: string[],
  requiredServices: string[]
): number {
  let score = 0

  // Specialty match
  if (clinic.specialties.includes(specialty)) {
    score += 40
  }

  // Distance factor (closer = higher score)
  const distance = calculateDistance(requestingClinic, clinic)
  score += Math.max(0, 30 - distance)

  // Rating/review factor
  if (clinic._count.reviews > 0) {
    score += 20
  }

  // Service capacity
  score += Math.min(clinic._count.appointments / 10, 15)

  // Language preferences
  if (preferredLanguages.length > 0) {
    // Mock language matching
    score += preferredLanguages.length * 5
  }

  return score
}

/**
 * Calculate partnership potential
 */
function calculatePartnershipPotential(clinic: any, potentialPartner: any, specialty?: string): number {
  let score = 0

  // Mutual specialties
  const mutualSpecialties = clinic.specialties.filter(s => potentialPartner.specialties.includes(s))
  score += mutualSpecialties.length * 15

  // Specialty-specific bonus
  if (specialty && potentialPartner.specialties.includes(specialty)) {
    score += 25
  }

  // Doctor capacity
  score += Math.min(potentialPartner._count.doctorClinicAffiliations * 3, 20)

  // Quality rating
  score += Math.min(potentialPartner._count.reviews * 2, 15)

  return score
}

/**
 * Calculate distance between clinics (simplified)
 */
function calculateDistance(clinic1: any, clinic2: any): number {
  if (!clinic1.postalCode || !clinic2.postalCode) {
    return 10 // Default distance
  }

  try {
    const code1 = parseInt(clinic1.postalCode.slice(0, 2))
    const code2 = parseInt(clinic2.postalCode.slice(0, 2))
    return Math.abs(code1 - code2) * 2 // Rough estimate
  } catch {
    return 10
  }
}

/**
 * Generate recommendation reason
 */
function generateRecommendationReason(clinic: any, partner: any, specialty?: string): string {
  const mutualSpecialties = clinic.specialties.filter(s => partner.specialties.includes(s))
  
  if (specialty && partner.specialties.includes(specialty)) {
    return `Expert in ${specialty} with strong service capacity`
  }
  
  if (mutualSpecialties.length > 2) {
    return `${mutualSpecialties.length} shared specialties for comprehensive collaboration`
  }
  
  if (partner._count.doctorClinicAffiliations > 10) {
    return 'Large medical team with diverse expertise'
  }
  
  return 'Strategic location with complementary services'
}

/**
 * Calculate collaboration performance
 */
function calculateCollaborationPerformance(collaborationMetrics: any[], referrals: any[]) {
  if (collaborationMetrics.length === 0) {
    return {
      averageScore: 0,
      trend: 'stable',
      lastUpdate: new Date(),
    }
  }

  const latestMetrics = collaborationMetrics[0]
  const averageScore = collaborationMetrics.reduce((sum, m) => sum + m.collaborationScore, 0) / collaborationMetrics.length

  return {
    averageScore,
    latestScore: latestMetrics.collaborationScore,
    trend: calculateTrend(collaborationMetrics),
    lastUpdate: latestMetrics.date,
  }
}

/**
 * Calculate average satisfaction
 */
function calculateAverageSatisfaction(referrals: any[]): number {
  if (referrals.length === 0) return 0
  
  const ratedReferrals = referrals.filter(r => r.patientSatisfaction)
  if (ratedReferrals.length === 0) return 0
  
  return ratedReferrals.reduce((sum, r) => sum + r.patientSatisfaction, 0) / ratedReferrals.length
}

/**
 * Calculate average response time
 */
function calculateAverageResponseTime(referrals: any[]): number {
  if (referrals.length === 0) return 0
  
  // Mock response time calculation
  return referrals.length * 0.5 + 1
}

/**
 * Calculate collaboration health
 */
function calculateCollaborationHealth(metrics: any[]): number {
  if (metrics.length === 0) return 0
  
  const healthScores = metrics.map(m => m.performance.averageScore)
  return healthScores.reduce((sum, score) => sum + score, 0) / healthScores.length
}

/**
 * Calculate trend from metrics
 */
function calculateTrend(metrics: any[]): 'improving' | 'stable' | 'declining' {
  if (metrics.length < 2) return 'stable'
  
  const latest = metrics[0].collaborationScore
  const previous = metrics[1].collaborationScore
  
  const difference = latest - previous
  
  if (difference > 5) return 'improving'
  if (difference < -5) return 'declining'
  return 'stable'
}

/**
 * Update partnership metrics
 */
async function updatePartnershipMetrics(ctx: any, partnershipId: string) {
  // Get recent referrals for this partnership
  const recentReferrals = await ctx.prisma.serviceReferral.findMany({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      },
      OR: [
        { referringClinicId: { in: await ctx.prisma.clinicPartnership.findUnique({
          where: { id: partnershipId },
          select: { primaryClinicId: true },
        }).then(p => [p?.primaryClinicId, p?.partnerClinicId]) } },
        { referredClinicId: { in: await ctx.prisma.clinicPartnership.findUnique({
          where: { id: partnershipId },
          select: { primaryClinicId: true },
        }).then(p => [p?.primaryClinicId, p?.partnerClinicId]) } },
      ],
    },
  })

  // Create or update metrics
  await ctx.prisma.partnershipMetrics.upsert({
    where: {
      partnershipId_date: {
        partnershipId,
        date: new Date(),
      },
    },
    update: {
      referralCount: recentReferrals.length,
      collaborationScore: Math.min(100, recentReferrals.length * 10 + 50), // Mock calculation
      patientSatisfaction: recentReferrals.length > 0 ? 4.0 + Math.random() : 0,
      responseTime: recentReferrals.length > 0 ? 2.0 + Math.random() * 2 : 0,
    },
    create: {
      partnershipId,
      date: new Date(),
      referralCount: recentReferrals.length,
      collaborationScore: Math.min(100, recentReferrals.length * 10 + 50),
      patientSatisfaction: recentReferrals.length > 0 ? 4.0 + Math.random() : 0,
      responseTime: recentReferrals.length > 0 ? 2.0 + Math.random() * 2 : 0,
    },
  })
}

/**
 * Calculate average processing time
 */
function calculateAverageProcessingTime(referrals: any[]): number {
  if (referrals.length === 0) return 0
  
  // Mock calculation - would use actual timestamps in real implementation
  return referrals.length * 0.3 + 1
}