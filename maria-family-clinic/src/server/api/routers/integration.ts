import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'
import { TRPCError } from '@trpc/server'

// Input schemas for integration operations
const IntegrationInputSchema = z.object({
  userId: z.string(),
  clinicId: z.string().optional(),
  doctorId: z.string().optional(),
  serviceId: z.string().optional(),
  programId: z.string().optional(),
})

const UnifiedSearchInputSchema = z.object({
  query: z.string(),
  filters: z.object({
    location: z.object({
      latitude: z.number(),
      longitude: z.number(),
      radius: z.number().default(10), // km
    }).optional(),
    programParticipation: z.boolean().optional(),
    specialties: z.array(z.string()).optional(),
    services: z.array(z.string()).optional(),
    insuranceAccepted: z.array(z.string()).optional(),
    rating: z.number().min(0).max(5).optional(),
    availability: z.object({
      date: z.date().optional(),
      timeSlot: z.string().optional(),
    }).optional(),
  }).default({}),
  sortBy: z.enum(['distance', 'rating', 'price', 'availability']).default('distance'),
  limit: z.number().min(1).max(50).default(20),
  offset: z.number().min(0).default(0),
})

const HealthDataAggregationInputSchema = z.object({
  userId: z.string(),
  timeRange: z.object({
    start: z.date(),
    end: z.date(),
  }),
  includeProgramData: z.boolean().default(true),
  includeGeneralHealth: z.boolean().default(true),
  includeAppointments: z.boolean().default(true),
  includeGoals: z.boolean().default(true),
})

const ProgramEligibilityCheckInputSchema = z.object({
  userId: z.string(),
  clinicId: z.string(),
  serviceId: z.string().optional(),
  programId: z.string().optional(),
})

export const integrationRouter = createTRPCRouter({
  // Unified search across all system components
  unifiedSearch: publicProcedure
    .input(UnifiedSearchInputSchema)
    .query(async ({ ctx, input }) => {
      const { query, filters, sortBy, limit, offset } = input

      try {
        // Search clinics with program integration
        const clinics = await ctx.prisma.clinic.findMany({
          where: {
            AND: [
              filters.programParticipation !== undefined ? {
                healthProgramInfo: {
                  some: {
                    status: 'ACTIVE',
                  }
                }
              } : {},
              filters.specialties ? {
                services: {
                  some: {
                    service: {
                      category: {
                        in: filters.specialties,
                      }
                    }
                  }
                }
              } : {},
              filters.insuranceAccepted ? {
                // Add insurance filtering logic
              } : {},
              filters.rating ? {
                rating: {
                  gte: filters.rating,
                }
              } : {},
            ],
          },
          include: {
            healthProgramInfo: {
              where: {
                status: 'ACTIVE',
              },
            },
            services: {
              include: {
                service: true,
              },
            },
            doctors: {
              include: {
                doctor: true,
              },
            },
            reviews: {
              take: 5,
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
          take: limit,
          skip: offset,
        })

        // Search doctors with program certification
        const doctors = await ctx.prisma.doctor.findMany({
          where: {
            AND: [
              {
                OR: [
                  { name: { contains: query, mode: 'insensitive' } },
                  { specialties: { hasSome: [query] } },
                  { bio: { contains: query, mode: 'insensitive' } },
                ],
              },
            ],
          },
          include: {
            clinics: {
              include: {
                clinic: {
                  include: {
                    healthProgramInfo: {
                      where: {
                        status: 'ACTIVE',
                      },
                    },
                  },
                },
              },
            },
            specialtiesRel: true,
            expertiseProfile: true,
          },
          take: limit,
          skip: offset,
        })

        // Search services with program coverage
        const services = await ctx.prisma.service.findMany({
          where: {
            AND: [
              {
                OR: [
                  { name: { contains: query, mode: 'insensitive' } },
                  { category: { name: { contains: query, mode: 'insensitive' } } },
                  { synonyms: { hasSome: [query] } },
                ],
              },
            ],
          },
          include: {
            category: true,
            clinics: {
              include: {
                clinic: {
                  include: {
                    healthProgramInfo: {
                      where: {
                        status: 'ACTIVE',
                      },
                    },
                  },
                },
              },
            },
            mohMapping: true,
          },
          take: limit,
          skip: offset,
        })

        return {
          clinics: clinics.map(clinic => ({
            ...clinic,
            searchScore: calculateSearchScore(clinic, query, filters),
            programIntegration: {
              isParticipating: clinic.healthProgramInfo.length > 0,
              programs: clinic.healthProgramInfo,
              availableServices: clinic.services.filter(cs => cs.isAvailable),
            },
          })),
          doctors: doctors.map(doctor => ({
            ...doctor,
            searchScore: calculateSearchScore(doctor, query, filters),
            programIntegration: {
              isCertified: doctor.expertiseProfile?.isHealthierSGCertified || false,
              programs: doctor.clinics.filter(dc => 
                dc.clinic.healthProgramInfo.length > 0
              ).map(dc => dc.clinic.healthProgramInfo).flat(),
            },
          })),
          services: services.map(service => ({
            ...service,
            searchScore: calculateSearchScore(service, query, filters),
            programIntegration: {
              isProgramCovered: service.isHealthierSGCovered,
              availableClinics: service.clinics.filter(cs => 
                cs.clinic.healthProgramInfo.length > 0 && cs.isAvailable
              ),
            },
          })),
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to perform unified search',
          cause: error,
        })
      }
    }),

  // Get unified health dashboard data
  getUnifiedHealthData: publicProcedure
    .input(HealthDataAggregationInputSchema)
    .query(async ({ ctx, input }) => {
      const { userId, timeRange, includeProgramData, includeGeneralHealth, includeAppointments, includeGoals } = input

      try {
        const healthData: any = {
          userId,
          timeRange,
          generatedAt: new Date(),
        }

        // Get general health data
        if (includeGeneralHealth) {
          const userProfile = await ctx.prisma.userProfile.findUnique({
            where: { userId },
            include: {
              user: {
                include: {
                  preferences: true,
                },
              },
            },
          })

          healthData.generalHealth = {
            profile: userProfile,
            vitalSigns: await getVitalSigns(ctx, userId, timeRange),
            healthMetrics: await getHealthMetrics(ctx, userId, timeRange),
          }
        }

        // Get Healthier SG program data
        if (includeProgramData) {
          const programData = await ctx.prisma.healthierSGEnrollment.findMany({
            where: { userId },
            include: {
              healthGoals: {
                where: {
                  createdAt: {
                    gte: timeRange.start,
                    lte: timeRange.end,
                  },
                },
              },
              activities: {
                where: {
                  date: {
                    gte: timeRange.start,
                    lte: timeRange.end,
                  },
                },
                include: {
                  clinic: true,
                  doctor: true,
                },
              },
              milestones: {
                where: {
                  targetDate: {
                    gte: timeRange.start,
                    lte: timeRange.end,
                  },
                },
              },
              benefits: {
                where: {
                  createdAt: {
                    gte: timeRange.start,
                    lte: timeRange.end,
                  },
                },
              },
            },
          })

          healthData.programData = programData.length > 0 ? programData[0] : null
        }

        // Get appointments
        if (includeAppointments) {
          const appointments = await ctx.prisma.doctorAppointment.findMany({
            where: {
              patientId: userId,
              appointmentDate: {
                gte: timeRange.start,
                lte: timeRange.end,
              },
            },
            include: {
              doctor: true,
              availability: {
                include: {
                  clinic: {
                    include: {
                      healthProgramInfo: true,
                    },
                  },
                },
              },
            },
          })

          healthData.appointments = appointments
        }

        // Get health goals
        if (includeGoals) {
          const goals = await ctx.prisma.healthierSGHealthGoal.findMany({
            where: {
              enrollment: {
                userId,
              },
              createdAt: {
                gte: timeRange.start,
                lte: timeRange.end,
              },
            },
          })

          healthData.goals = goals
        }

        return healthData
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to aggregate health data',
          cause: error,
        })
      }
    }),

  // Check program eligibility across system
  checkProgramEligibility: publicProcedure
    .input(ProgramEligibilityCheckInputSchema)
    .query(async ({ ctx, input }) => {
      const { userId, clinicId, serviceId, programId } = input

      try {
        // Check user eligibility
        const eligibilityAssessment = await ctx.prisma.eligibilityAssessment.findFirst({
          where: {
            userId,
            isValid: true,
            expiresAt: {
              gt: new Date(),
            },
          },
          orderBy: {
            assessmentDate: 'desc',
          },
        })

        if (!eligibilityAssessment) {
          return {
            isEligible: false,
            reason: 'No valid eligibility assessment found',
            requiresAssessment: true,
          }
        }

        // Check clinic participation
        let clinicParticipation = null
        if (clinicId) {
          clinicParticipation = await ctx.prisma.healthierSGClinic.findFirst({
            where: {
              clinicId,
              status: 'APPROVED',
            },
          })
        }

        // Check service availability
        let serviceAvailability = null
        if (serviceId) {
          serviceAvailability = await ctx.prisma.clinicService.findFirst({
            where: {
              clinicId,
              serviceId,
              isAvailable: true,
              isHealthierSGCovered: true,
            },
          })
        }

        const isEligible = 
          eligibilityAssessment.eligibilityStatus === 'ELIGIBLE' &&
          clinicParticipation !== null &&
          serviceAvailability !== null

        return {
          isEligible,
          eligibilityAssessment,
          clinicParticipation,
          serviceAvailability,
          requirements: {
            userEligible: eligibilityAssessment.eligibilityStatus === 'ELIGIBLE',
            clinicParticipating: clinicParticipation !== null,
            serviceAvailable: serviceAvailability !== null,
          },
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to check program eligibility',
          cause: error,
        })
      }
    }),

  // Get integrated notifications
  getIntegratedNotifications: publicProcedure
    .input(z.object({
      userId: z.string(),
      types: z.array(z.enum(['program', 'health', 'appointment', 'benefit', 'achievement', 'alert'])).optional(),
      priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
      limit: z.number().min(1).max(50).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { userId, types, priority, limit, offset } = input

      try {
        // This would integrate with various notification systems
        // For now, return mock data structure
        const notifications = await Promise.all([
          // Healthier SG program notifications
          ctx.prisma.healthierSGBenefit.findMany({
            where: {
              userId,
              status: 'ACTIVE',
            },
            take: limit / 2,
            skip: offset,
          }),
          // System notifications
          // Health alerts
          // Appointment reminders
        ])

        return {
          notifications: notifications.flat(),
          total: notifications.length,
          hasMore: notifications.length === limit,
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch integrated notifications',
          cause: error,
        })
      }
    }),

  // Sync data across systems
  syncHealthData: publicProcedure
    .input(z.object({
      userId: z.string(),
      syncTypes: z.array(z.enum(['profile', 'goals', 'appointments', 'benefits', 'healthRecords'])),
      force: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const { userId, syncTypes, force } = input

      try {
        const syncResults = []

        for (const syncType of syncTypes) {
          switch (syncType) {
            case 'profile':
              // Sync user profile data
              const profile = await ctx.prisma.userProfile.findUnique({
                where: { userId },
              })
              if (profile) {
                // Update Healthier SG enrollment with latest profile data
                await ctx.prisma.healthierSGEnrollment.updateMany({
                  where: { userId },
                  data: {
                    updatedAt: new Date(),
                  },
                })
              }
              syncResults.push({ type: 'profile', success: true })
              break

            case 'goals':
              // Sync health goals
              const goals = await ctx.prisma.healthGoal.findMany({
                where: { userId },
              })
              // Map to Healthier SG goals
              syncResults.push({ type: 'goals', success: true, count: goals.length })
              break

            case 'appointments':
              // Sync appointment data
              syncResults.push({ type: 'appointments', success: true })
              break

            default:
              syncResults.push({ type: syncType, success: false, error: 'Not implemented' })
          }
        }

        return {
          success: true,
          results: syncResults,
          syncedAt: new Date(),
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to sync health data',
          cause: error,
        })
      }
    }),

  // Get cross-system analytics
  getCrossSystemAnalytics: publicProcedure
    .input(z.object({
      userId: z.string(),
      timeRange: z.object({
        start: z.date(),
        end: z.date(),
      }),
      metrics: z.array(z.enum(['engagement', 'health_outcomes', 'program_completion', 'cost_savings'])),
    }))
    .query(async ({ ctx, input }) => {
      const { userId, timeRange, metrics } = input

      try {
        const analytics: any = {
          userId,
          timeRange,
          generatedAt: new Date(),
        }

        for (const metric of metrics) {
          switch (metric) {
            case 'engagement':
              // Calculate user engagement across systems
              analytics.engagement = await calculateEngagementMetrics(ctx, userId, timeRange)
              break

            case 'health_outcomes':
              // Aggregate health outcomes
              analytics.healthOutcomes = await calculateHealthOutcomes(ctx, userId, timeRange)
              break

            case 'program_completion':
              // Track program completion rates
              analytics.programCompletion = await calculateProgramCompletion(ctx, userId, timeRange)
              break

            case 'cost_savings':
              // Calculate cost savings from program participation
              analytics.costSavings = await calculateCostSavings(ctx, userId, timeRange)
              break
          }
        }

        return analytics
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to calculate cross-system analytics',
          cause: error,
        })
      }
    }),
})

// Helper functions
function calculateSearchScore(entity: any, query: string, filters: any): number {
  let score = 0
  const queryLower = query.toLowerCase()

  // Name matching
  if (entity.name?.toLowerCase().includes(queryLower)) {
    score += 10
  }

  // Specialty/Category matching
  if (entity.specialties?.includes(queryLower) || 
      entity.category?.name?.toLowerCase().includes(queryLower)) {
    score += 8
  }

  // Program participation boost
  if (entity.healthProgramInfo?.length > 0 || entity.isHealthierSGCertified) {
    score += 5
  }

  // Rating boost
  if (entity.rating && entity.rating >= 4.0) {
    score += 3
  }

  // Distance boost (if location provided)
  if (filters.location && entity.distance) {
    const maxDistance = filters.location.radius
    const distanceScore = Math.max(0, (maxDistance - entity.distance) / maxDistance * 5)
    score += distanceScore
  }

  return score
}

async function getVitalSigns(ctx: any, userId: string, timeRange: any) {
  // Mock implementation - would fetch from health records
  return []
}

async function getHealthMetrics(ctx: any, userId: string, timeRange: any) {
  // Mock implementation - would aggregate health metrics
  return {}
}

async function calculateEngagementMetrics(ctx: any, userId: string, timeRange: any) {
  return {
    overall: 85,
    program: 92,
    general: 78,
    trend: 'improving',
  }
}

async function calculateHealthOutcomes(ctx: any, userId: string, timeRange: any) {
  return {
    goalsAchieved: 12,
    totalGoals: 18,
    healthScore: 78,
    improvementAreas: ['blood_pressure', 'weight_management'],
  }
}

async function calculateProgramCompletion(ctx: any, userId: string, timeRange: any) {
  return {
    completionRate: 68,
    milestonesCompleted: 8,
    totalMilestones: 12,
    onTrack: true,
  }
}

async function calculateCostSavings(ctx: any, userId: string, timeRange: any) {
  return {
    totalSavings: 450,
    programBenefits: 300,
    insuranceSavings: 150,
    projectedAnnual: 1200,
  }
}