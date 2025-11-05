import { z } from 'zod'
import { createTRPCRouter, publicProcedure, protectedProcedure, staffProcedure, calculatePagination } from '../trpc'
import { TRPCError } from '@trpc/server'
import { Prisma } from '@prisma/client'

const doctorSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  specialties: true,
  languages: true,
  qualifications: true,
  experience: true,
  isActive: true,
  isVerified: true,
  createdAt: true,
  updatedAt: true,
  profile: {
    select: {
      bio: true,
      photo: true,
      description: true,
    },
  },
  clinics: {
    select: {
      id: true,
      name: true,
      address: true,
      user: {
        select: {
          id: true,
          role: true,
        },
      },
    },
  },
  appointments: {
    select: {
      id: true,
      appointmentDate: true,
      status: true,
      service: {
        select: {
          name: true,
          duration: true,
        },
      },
      patient: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
        },
      },
    },
    where: {
      appointmentDate: {
        gte: new Date(),
      },
    },
    orderBy: {
      appointmentDate: 'asc',
    },
    take: 5,
  },
  reviews: {
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
    },
  },
}

/**
 * Doctor Router - Handles all doctor-related operations
 */
export const doctorRouter = createTRPCRouter({
  /**
   * Get all doctors with pagination and filtering
   */
  getAll: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(10),
        search: z.string().optional(),
        specialties: z.array(z.string()).optional(),
        languages: z.array(z.string()).optional(),
        clinicId: z.string().uuid().optional(),
        isActive: z.boolean().optional(),
        isVerified: z.boolean().optional(),
        orderBy: z.enum(['name', 'specialty', 'experience', 'rating', 'createdAt']).default('name'),
        orderDirection: z.enum(['asc', 'desc']).default('asc'),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, search, specialties, languages, clinicId, isActive, isVerified, orderBy, orderDirection } = input
      const skip = (page - 1) * limit

      // Build where clause
      const where: Prisma.DoctorWhereInput = {}

      if (search) {
        where.OR = [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { specialties: { hasSome: [search] } },
          { qualifications: { contains: search, mode: 'insensitive' } },
        ]
      }

      if (specialties && specialties.length > 0) {
        where.specialties = {
          hasSome: specialties,
        }
      }

      if (languages && languages.length > 0) {
        where.languages = {
          hasSome: languages,
        }
      }

      if (clinicId) {
        where.clinics = {
          some: {
            id: clinicId,
          },
        }
      }

      if (isActive !== undefined) {
        where.isActive = isActive
      }

      if (isVerified !== undefined) {
        where.isVerified = isVerified
      }

      // Build orderBy clause
      let orderByClause: Prisma.DoctorOrderByWithRelationInput = {}
      if (orderBy === 'name') {
        orderByClause = {
          lastName: orderDirection,
          firstName: orderDirection,
        }
      } else if (orderBy === 'rating') {
        // For rating, we'll calculate average in application layer
        orderByClause = { createdAt: orderDirection }
      } else {
        orderByClause = { [orderBy]: orderDirection }
      }

      try {
        // Get doctors with their related data
        const [doctors, total] = await Promise.all([
          ctx.prisma.doctor.findMany({
            where,
            select: doctorSelect,
            skip,
            take: limit,
            orderBy: orderByClause,
          }),
          ctx.prisma.doctor.count({ where }),
        ])

        // Calculate average ratings if needed
        let doctorsWithRating = doctors
        if (orderBy === 'rating' || !orderBy) {
          const doctorIds = doctors.map(d => d.id)
          const ratings = await ctx.prisma.review.groupBy({
            by: ['doctorId'],
            where: { doctorId: { in: doctorIds } },
            _avg: { rating: true },
            _count: { rating: true },
          })

          const ratingMap = ratings.reduce((acc, rating) => {
            acc[rating.doctorId] = {
              average: rating._avg.rating || 0,
              count: rating._count.rating,
            }
            return acc
          }, {} as Record<string, { average: number; count: number }>)

          doctorsWithRating = doctors.map(doctor => ({
            ...doctor,
            rating: ratingMap[doctor.id] || { average: 0, count: 0 },
          }))

          // Sort by rating if requested
          if (orderBy === 'rating') {
            doctorsWithRating.sort((a, b) => {
              const aRating = a.rating.average
              const bRating = b.rating.average
              return orderDirection === 'asc' ? aRating - bRating : bRating - aRating
            })
          }
        }

        return {
          data: doctorsWithRating,
          pagination: calculatePagination(page, limit, total),
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch doctors',
          cause: error,
        })
      }
    }),

  /**
   * Get a single doctor by ID
   */
  getById: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const doctor = await ctx.prisma.doctor.findUnique({
          where: { id: input.id },
          select: doctorSelect,
        })

        if (!doctor) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Doctor not found',
          })
        }

        // Get average rating
        const ratingData = await ctx.prisma.review.aggregate({
          where: { doctorId: input.id },
          _avg: { rating: true },
          _count: { rating: true },
        })

        return {
          ...doctor,
          rating: {
            average: ratingData._avg.rating || 0,
            count: ratingData._count.rating,
          },
        }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch doctor',
          cause: error,
        })
      }
    }),

  /**
   * Get available appointment slots for a doctor
   */
  getAvailableSlots: publicProcedure
    .input(
      z.object({
        doctorId: z.string().uuid(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        serviceId: z.string().uuid().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { doctorId, startDate, endDate, serviceId } = input
      const now = new Date()
      const searchStartDate = startDate || now
      const searchEndDate = endDate || new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days from now

      try {
        // Get doctor's clinic affiliations
        const doctorClinics = await ctx.prisma.doctor.findUnique({
          where: { id: doctorId },
          select: {
            clinics: {
              select: {
                id: true,
                name: true,
                operatingHours: true,
              },
            },
          },
        })

        if (!doctorClinics) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Doctor not found',
          })
        }

        // Get existing appointments for the doctor
        const existingAppointments = await ctx.prisma.appointment.findMany({
          where: {
            doctorId,
            appointmentDate: {
              gte: searchStartDate,
              lte: searchEndDate,
            },
            status: {
              not: 'CANCELLED',
            },
          },
          select: {
            id: true,
            appointmentDate: true,
            serviceId: true,
            status: true,
          },
        })

        // Generate available slots based on operating hours
        const availableSlots: Array<{
          date: Date
          clinicId: string
          clinicName: string
          timeSlots: Array<{
            time: string
            available: boolean
            appointmentId?: string
          }>
        }> = []

        for (const clinic of doctorClinics.clinics) {
          if (!clinic.operatingHours) continue

          const currentDate = new Date(searchStartDate)
          while (currentDate <= searchEndDate) {
            const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'lowercase' })
            const clinicHours = clinic.operatingHours[dayName]

            if (clinicHours && clinicHours !== 'closed') {
              const slots = generateTimeSlots(clinicHours, existingAppointments, currentDate, clinic.id)
              
              if (slots.length > 0) {
                availableSlots.push({
                  date: new Date(currentDate),
                  clinicId: clinic.id,
                  clinicName: clinic.name,
                  timeSlots: slots,
                })
              }
            }

            currentDate.setDate(currentDate.getDate() + 1)
          }
        }

        return availableSlots
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch available slots',
          cause: error,
        })
      }
    }),

  /**
   * Create a new doctor (staff/admin only)
   */
  create: staffProcedure
    .input(
      z.object({
        firstName: z.string().min(1).max(100),
        lastName: z.string().min(1).max(100),
        email: z.string().email(),
        phone: z.string().regex(/^(\+65)?[689][0-9]{7}$/),
        specialties: z.array(z.string()).default([]),
        languages: z.array(z.string()).default([]),
        qualifications: z.string().optional(),
        experience: z.number().min(0).optional(),
        bio: z.string().optional(),
        description: z.string().optional(),
        isActive: z.boolean().default(true),
        isVerified: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { bio, description, ...doctorData } = input

      try {
        const doctor = await ctx.prisma.doctor.create({
          data: {
            ...doctorData,
            profile: {
              create: {
                bio: bio || '',
                description: description || '',
              },
            },
          },
          select: doctorSelect,
        })

        return doctor
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            throw new TRPCError({
              code: 'CONFLICT',
              message: 'A doctor with this email already exists',
            })
          }
        }

        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to create doctor',
          cause: error,
        })
      }
    }),

  /**
   * Update a doctor (staff/admin only)
   */
  update: staffProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        firstName: z.string().min(1).max(100).optional(),
        lastName: z.string().min(1).max(100).optional(),
        email: z.string().email().optional(),
        phone: z.string().regex(/^(\+65)?[689][0-9]{7}$/).optional(),
        specialties: z.array(z.string()).optional(),
        languages: z.array(z.string()).optional(),
        qualifications: z.string().optional(),
        experience: z.number().min(0).optional(),
        bio: z.string().optional(),
        description: z.string().optional(),
        isActive: z.boolean().optional(),
        isVerified: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, bio, description, ...updateData } = input

      try {
        const doctor = await ctx.prisma.doctor.update({
          where: { id },
          data: {
            ...updateData,
            ...(bio !== undefined || description !== undefined
              ? {
                  profile: {
                    upsert: {
                      create: {
                        bio: bio || '',
                        description: description || '',
                      },
                      update: {
                        ...(bio !== undefined ? { bio } : {}),
                        ...(description !== undefined ? { description } : {}),
                      },
                    },
                  },
                }
              : {}),
          },
          select: doctorSelect,
        })

        return doctor
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            throw new TRPCError({
              code: 'CONFLICT',
              message: 'A doctor with this email already exists',
            })
          }
          if (error.code === 'P2025') {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Doctor not found',
            })
          }
        }

        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to update doctor',
          cause: error,
        })
      }
    }),

  /**
   * Delete a doctor (admin only)
   */
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if doctor has future appointments
        const futureAppointments = await ctx.prisma.appointment.count({
          where: {
            doctorId: input.id,
            appointmentDate: {
              gte: new Date(),
            },
            status: {
              not: 'CANCELLED',
            },
          },
        })

        if (futureAppointments > 0) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Cannot delete doctor with future appointments',
          })
        }

        await ctx.prisma.doctor.delete({
          where: { id: input.id },
        })

        return { success: true }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Doctor not found',
          })
        }

        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete doctor',
          cause: error,
        })
      }
    }),

  /**
   * Get doctor statistics (admin/staff only)
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      const [totalDoctors, activeDoctors, verifiedDoctors, withFutureAppointments] = await Promise.all([
        ctx.prisma.doctor.count(),
        ctx.prisma.doctor.count({ where: { isActive: true } }),
        ctx.prisma.doctor.count({ where: { isVerified: true } }),
        ctx.prisma.doctor.findMany({
          where: {
            appointments: {
              some: {
                appointmentDate: { gte: new Date() },
                status: { not: 'CANCELLED' },
              },
            },
          },
          select: { id: true },
        }).then(doctors => doctors.length),
      ])

      return {
        totalDoctors,
        activeDoctors,
        verifiedDoctors,
        withFutureAppointments,
      }
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch doctor statistics',
        cause: error,
      })
    }
  }),

  /**
   * Get specialty distribution (admin/staff only)
   */
  getSpecialtyDistribution: protectedProcedure.query(async ({ ctx }) => {
    try {
      const doctors = await ctx.prisma.doctor.findMany({
        select: { specialties: true },
      })

      const specialtyCounts: Record<string, number> = {}
      doctors.forEach(doctor => {
        doctor.specialties.forEach(specialty => {
          specialtyCounts[specialty] = (specialtyCounts[specialty] || 0) + 1
        })
      })

      return Object.entries(specialtyCounts)
        .map(([specialty, count]) => ({ specialty, count }))
        .sort((a, b) => b.count - a.count)
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch specialty distribution',
        cause: error,
      })
    }
  }),

  /**
   * Get Healthier SG certified doctors with program badges
   */
  getHealthierSGCertified: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(20),
        search: z.string().optional(),
        specialties: z.array(z.string()).optional(),
        programCategories: z.array(z.enum([
          'PREVENTIVE_CARE',
          'CHRONIC_DISEASE_MANAGEMENT', 
          'HEALTH_SCREENING',
          'LIFESTYLE_INTERVENTION',
          'MENTAL_HEALTH',
          'MATERNAL_CHILD_HEALTH',
          'ELDERLY_CARE',
          'REHABILITATION',
          'HEALTH_EDUCATION',
          'COMMUNITY_HEALTH'
        ])).optional(),
        certificationLevels: z.array(z.enum([
          'CERTIFIED',
          'ADVANCED_CERTIFIED',
          'SPECIALIST_CERTIFIED',
          'CONSULTANT_LEVEL',
          'EXPERT_ADVISOR'
        ])).optional(),
        clinicId: z.string().uuid().optional(),
        orderBy: z.enum(['name', 'certification_level', 'experience', 'rating']).default('name'),
        orderDirection: z.enum(['asc', 'desc']).default('asc'),
      })
    )
    .query(async ({ ctx, input }) => {
      const { 
        page, 
        limit, 
        search, 
        specialties, 
        programCategories, 
        certificationLevels,
        clinicId, 
        orderBy, 
        orderDirection 
      } = input
      const skip = (page - 1) * limit

      // Build where clause for Healthier SG certified doctors
      const where: Prisma.DoctorWhereInput = {
        isActive: true,
        isVerified: true,
        doctorParticipation: {
          some: {
            status: { in: ['APPROVED', 'ACTIVE', 'ACCREDITED'] },
            ...(programCategories && programCategories.length > 0 ? {
              program: {
                category: { in: programCategories }
              }
            } : {}),
            ...(certificationLevels && certificationLevels.length > 0 ? {
              certificationLevel: { in: certificationLevels }
            } : {}),
          }
        },
        ...(clinicId ? {
          clinics: {
            some: { id: clinicId }
          }
        } : {}),
        ...(specialties && specialties.length > 0 ? {
          specialties: {
            hasSome: specialties
          }
        } : {}),
      }

      // Add text search
      if (search) {
        where.OR = [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { specialties: { hasSome: [search] } },
          { profile: { bio: { contains: search, mode: 'insensitive' } } },
        ]
      }

      try {
        // Execute query with comprehensive Healthier SG certification data
        const [doctors, total] = await Promise.all([
          ctx.prisma.doctor.findMany({
            where,
            select: {
              ...doctorSelect,
              doctorParticipation: {
                select: {
                  id: true,
                  certificationLevel: true,
                  status: true,
                  specializations: true,
                  expertiseAreas: true,
                  totalPatients: true,
                  programSatisfaction: true,
                  lastPatientVisit: true,
                  program: {
                    select: {
                      id: true,
                      name: true,
                      category: true,
                      description: true,
                    }
                  },
                },
                where: {
                  status: { in: ['APPROVED', 'ACTIVE', 'ACCREDITED'] }
                }
              },
            },
            skip,
            take: limit,
            orderBy: getDoctorOrderByClause(orderBy, orderDirection),
          }),
          ctx.prisma.doctor.count({ where }),
        ])

        // Process Healthier SG certification data
        const doctorsWithProgramBadges = doctors.map(doctor => {
          let programBadges: any[] = []
          let programExpertise: any[] = []
          let programStats = {
            totalPrograms: 0,
            activePrograms: 0,
            highestCertification: null as string | null,
            totalPatients: 0,
            averageSatisfaction: 0,
          }

          if (doctor.doctorParticipation && doctor.doctorParticipation.length > 0) {
            programBadges = doctor.doctorParticipation.map(participation => {
              const isActive = participation.status === 'APPROVED' || participation.status === 'ACTIVE' || participation.status === 'ACCREDITED'
              return {
                programId: participation.program.id,
                programName: participation.program.name,
                programCategory: participation.program.category,
                certificationLevel: participation.certificationLevel,
                status: participation.status,
                specializations: participation.specializations,
                expertiseAreas: participation.expertiseAreas,
                isActive,
                badge: getCertificationBadge(participation.certificationLevel),
              }
            })

            programExpertise = doctor.doctorParticipation
              .filter(p => p.status === 'APPROVED' || p.status === 'ACTIVE' || p.status === 'ACCREDITED')
              .flatMap(p => p.expertiseAreas || [])

            const activeParticipation = doctor.doctorParticipation.filter(p => 
              p.status === 'APPROVED' || p.status === 'ACTIVE' || p.status === 'ACCREDITED'
            )
            
            const certificationLevels = activeParticipation.map(p => p.certificationLevel)
            const allSatisfactions = doctor.doctorParticipation
              .filter(p => p.programSatisfaction !== null)
              .map(p => p.programSatisfaction!) as number[]

            programStats = {
              totalPrograms: doctor.doctorParticipation.length,
              activePrograms: activeParticipation.length,
              highestCertification: certificationLevels.length > 0 
                ? certificationLevels.sort((a, b) => getCertificationLevel(a) - getCertificationLevel(b)).pop()
                : null,
              totalPatients: doctor.doctorParticipation.reduce((sum, p) => sum + (p.totalPatients || 0), 0),
              averageSatisfaction: allSatisfactions.length > 0 
                ? allSatisfactions.reduce((sum, s) => sum + s, 0) / allSatisfactions.length
                : 0,
            }
          }

          return {
            ...doctor,
            programBadges,
            programExpertise,
            programStats,
            doctorParticipation: undefined, // Remove from main data
          }
        })

        return {
          data: doctorsWithProgramBadges,
          pagination: calculatePagination(page, limit, total),
          totalCertifiedDoctors: total,
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch Healthier SG certified doctors',
          cause: error,
        })
      }
    }),

  /**
   * Get doctor program recommendations based on health goals
   */
  getProgramRecommendations: publicProcedure
    .input(
      z.object({
        doctorId: z.string().uuid(),
        healthGoals: z.array(z.string()).optional(),
        currentConditions: z.array(z.string()).optional(),
        preferences: z.object({
          preferredPrograms: z.array(z.string()).optional(),
          preferredCertifications: z.array(z.string()).optional(),
          preferredLanguages: z.array(z.string()).optional(),
        }).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { doctorId, healthGoals = [], currentConditions = [], preferences = {} } = input

      try {
        const doctor = await ctx.prisma.doctor.findUnique({
          where: { id: doctorId },
          select: {
            id: true,
            specialties: true,
            languages: true,
            doctorParticipation: {
              select: {
                certificationLevel: true,
                specializations: true,
                expertiseAreas: true,
                program: {
                  select: {
                    id: true,
                    name: true,
                    category: true,
                    description: true,
                    healthGoals: true,
                    targetConditions: true,
                  }
                }
              },
              where: {
                status: { in: ['APPROVED', 'ACTIVE', 'ACCREDITED'] }
              }
            }
          }
        })

        if (!doctor) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Doctor not found',
          })
        }

        // Calculate recommendation scores for each program
        const recommendations = doctor.doctorParticipation.map(participation => {
          let score = 0
          const reasons: string[] = []

          // Health goals match
          if (healthGoals.length > 0 && participation.program.healthGoals) {
            const goalMatches = healthGoals.filter(goal => 
              participation.program.healthGoals!.includes(goal)
            )
            score += goalMatches.length * 20
            if (goalMatches.length > 0) {
              reasons.push(`Matches your health goals: ${goalMatches.join(', ')}`)
            }
          }

          // Current conditions match
          if (currentConditions.length > 0 && participation.program.targetConditions) {
            const conditionMatches = currentConditions.filter(condition => 
              participation.program.targetConditions!.includes(condition)
            )
            score += conditionMatches.length * 25
            if (conditionMatches.length > 0) {
              reasons.push(`Specializes in your conditions: ${conditionMatches.join(', ')}`)
            }
          }

          // Expertise areas match
          if (participation.expertiseAreas) {
            const expertiseMatches = [...healthGoals, ...currentConditions].filter(item =>
              participation.expertiseAreas!.includes(item)
            )
            score += expertiseMatches.length * 15
            if (expertiseMatches.length > 0) {
              reasons.push(`Expert in: ${expertiseMatches.join(', ')}`)
            }
          }

          // Specializations match
          if (participation.specializations) {
            const specializationMatches = [...healthGoals, ...currentConditions].filter(item =>
              participation.specializations!.includes(item)
            )
            score += specializationMatches.length * 10
          }

          // Language preference
          if (preferences.preferredLanguages && preferences.preferredLanguages.length > 0) {
            const languageMatches = preferences.preferredLanguages.filter(lang =>
              doctor.languages.includes(lang)
            )
            score += languageMatches.length * 5
            if (languageMatches.length > 0) {
              reasons.push(`Speaks your preferred languages`)
            }
          }

          // Program preference bonus
          if (preferences.preferredPrograms && preferences.preferredPrograms.includes(participation.program.name)) {
            score += 30
            reasons.push('Matches your program preferences')
          }

          // Certification level bonus
          if (preferences.preferredCertifications && preferences.preferredCertifications.includes(participation.certificationLevel)) {
            score += 20
            reasons.push('High certification level')
          }

          return {
            program: participation.program,
            certificationLevel: participation.certificationLevel,
            specializations: participation.specializations,
            expertiseAreas: participation.expertiseAreas,
            recommendationScore: Math.min(score, 100), // Cap at 100
            reasons,
            matchReasons: reasons.length,
          }
        })

        // Sort by recommendation score
        const sortedRecommendations = recommendations
          .sort((a, b) => b.recommendationScore - a.recommendationScore)
          .slice(0, 10) // Top 10 recommendations

        // Categorize recommendations
        const categories = {
          highMatch: sortedRecommendations.filter(r => r.recommendationScore >= 70),
          mediumMatch: sortedRecommendations.filter(r => r.recommendationScore >= 40 && r.recommendationScore < 70),
          lowMatch: sortedRecommendations.filter(r => r.recommendationScore < 40),
        }

        return {
          doctor: {
            id: doctor.id,
            specialties: doctor.specialties,
            languages: doctor.languages,
          },
          recommendations: {
            highMatch: categories.highMatch,
            mediumMatch: categories.mediumMatch,
            lowMatch: categories.lowMatch,
            totalPrograms: sortedRecommendations.length,
            hasRecommendations: sortedRecommendations.length > 0,
          },
          personalizedFor: {
            healthGoals,
            currentConditions,
            preferences,
          }
        }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to get program recommendations',
          cause: error,
        })
      }
    }),
})

/**
 * Generate time slots for a given day and operating hours
 */
function generateTimeSlots(
  operatingHours: string,
  existingAppointments: Array<{ appointmentDate: Date; serviceId: string | null }>,
  date: Date,
  clinicId: string
): Array<{ time: string; available: boolean; appointmentId?: string }> {
  const slots: Array<{ time: string; available: boolean; appointmentId?: string }> = []
  
  // Parse operating hours (e.g., "09:00-12:00,13:00-17:00")
  const timeRanges = operatingHours.split(',').map(range => {
    const [start, end] = range.trim().split('-')
    return { start: start.trim(), end: end.trim() }
  })

  for (const timeRange of timeRanges) {
    const startTime = new Date(date)
    const [startHour, startMinute] = timeRange.start.split(':').map(Number)
    startTime.setHours(startHour, startMinute, 0, 0)

    const endTime = new Date(date)
    const [endHour, endMinute] = timeRange.end.split(':').map(Number)
    endTime.setHours(endHour, endMinute, 0, 0)

    // Generate 30-minute slots
    const currentTime = new Date(startTime)
    while (currentTime < endTime) {
      const timeString = currentTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })

      // Check if this time slot is already booked
      const isBooked = existingAppointments.some(appointment => {
        const appointmentTime = new Date(appointment.appointmentDate)
        return (
          appointmentTime.getHours() === currentTime.getHours() &&
          appointmentTime.getMinutes() === currentTime.getMinutes()
        )
      })

      slots.push({
        time: timeString,
        available: !isBooked,
      })

      currentTime.setMinutes(currentTime.getMinutes() + 30)
    }
  }

  return slots
}

/**
 * Get order by clause for different sorting options
 */
function getDoctorOrderByClause(
  orderBy: string, 
  orderDirection: 'asc' | 'desc'
): Prisma.DoctorOrderByWithRelationInput {
  switch (orderBy) {
    case 'name':
      return { 
        lastName: orderDirection,
        firstName: orderDirection 
      }
    case 'experience':
      return { experience: orderDirection }
    case 'rating':
      // This would require joining with reviews table
      return { 
        lastName: orderDirection,
        firstName: orderDirection 
      }
    case 'certification_level':
      // This would require joining with doctor participation
      return { 
        lastName: orderDirection,
        firstName: orderDirection 
      }
    default:
      return { 
        lastName: orderDirection,
        firstName: orderDirection 
      }
  }
}

/**
 * Get certification badge for doctor
 */
function getCertificationBadge(certificationLevel: string): string {
  switch (certificationLevel) {
    case 'EXPERT_ADVISOR':
      return '🏆' // Gold medal
    case 'CONSULTANT_LEVEL':
      return '🥇' // Gold award
    case 'SPECIALIST_CERTIFIED':
      return '🥈' // Silver award
    case 'ADVANCED_CERTIFIED':
      return '🥉' // Bronze award
    case 'CERTIFIED':
      return '✅' // Checkmark
    default:
      return '📜' // Certificate
  }
}

/**
 * Get certification level numeric value for sorting
 */
function getCertificationLevel(certification: string): number {
  switch (certification) {
    case 'EXPERT_ADVISOR':
      return 5
    case 'CONSULTANT_LEVEL':
      return 4
    case 'SPECIALIST_CERTIFIED':
      return 3
    case 'ADVANCED_CERTIFIED':
      return 2
    case 'CERTIFIED':
      return 1
    default:
      return 0
  }
}

/**
 * Get highest certification level from list
 */
function getHighestCertificationLevel(certifications: string[]): string | null {
  if (certifications.length === 0) return null
  
  const levels = certifications
    .map(cert => ({ cert, level: getCertificationLevel(cert) }))
    .sort((a, b) => b.level - a.level)
  
  return levels[0]?.cert || null
}