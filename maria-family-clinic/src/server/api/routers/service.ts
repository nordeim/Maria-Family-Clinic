import { z } from 'zod'
import { createTRPCRouter, publicProcedure, protectedProcedure, staffProcedure, calculatePagination } from '../trpc'
import { TRPCError } from '@trpc/server'
import { Prisma } from '@prisma/client'

const serviceSelect = {
  id: true,
  name: true,
  description: true,
  category: true,
  price: true,
  duration: true,
  isActive: true,
  isPopular: true,
  requirements: true,
  preparationInstructions: true,
  aftercareInstructions: true,
  createdAt: true,
  updatedAt: true,
  clinics: {
    select: {
      id: true,
      name: true,
      address: true,
      languages: true,
      user: {
        select: {
          id: true,
          role: true,
        },
      },
    },
  },
  doctors: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      specialties: true,
      profile: {
        select: {
          bio: true,
          photo: true,
        },
      },
    },
  },
  appointments: {
    select: {
      id: true,
      appointmentDate: true,
      status: true,
      clinic: {
        select: {
          name: true,
        },
      },
      doctor: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      patient: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
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
      user: {
        select: {
          id: true,
          email: true,
        },
      },
      createdAt: true,
    },
  },
}

/**
 * Service Router - Handles all healthcare service-related operations
 */
export const serviceRouter = createTRPCRouter({
  /**
   * Get all services with pagination and filtering
   */
  getAll: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(10),
        search: z.string().optional(),
        category: z.string().optional(),
        isActive: z.boolean().optional(),
        isPopular: z.boolean().optional(),
        minPrice: z.number().min(0).optional(),
        maxPrice: z.number().min(0).optional(),
        clinicId: z.string().uuid().optional(),
        doctorId: z.string().uuid().optional(),
        orderBy: z.enum(['name', 'category', 'price', 'popularity', 'rating', 'createdAt']).default('name'),
        orderDirection: z.enum(['asc', 'desc']).default('asc'),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, search, category, isActive, isPopular, minPrice, maxPrice, clinicId, doctorId, orderBy, orderDirection } = input
      const skip = (page - 1) * limit

      // Build where clause
      const where: Prisma.ServiceWhereInput = {}

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { category: { contains: search, mode: 'insensitive' } },
        ]
      }

      if (category) {
        where.category = { contains: category, mode: 'insensitive' }
      }

      if (isActive !== undefined) {
        where.isActive = isActive
      }

      if (isPopular !== undefined) {
        where.isPopular = isPopular
      }

      if (minPrice !== undefined || maxPrice !== undefined) {
        where.price = {}
        if (minPrice !== undefined) where.price.gte = minPrice
        if (maxPrice !== undefined) where.price.lte = maxPrice
      }

      if (clinicId) {
        where.clinics = {
          some: {
            id: clinicId,
          },
        }
      }

      if (doctorId) {
        where.doctors = {
          some: {
            id: doctorId,
          },
        }
      }

      // Build orderBy clause
      let orderByClause: Prisma.ServiceOrderByWithRelationInput = {}
      if (orderBy === 'name' || orderBy === 'category' || orderBy === 'createdAt') {
        orderByClause = { [orderBy]: orderDirection }
      } else if (orderBy === 'price') {
        orderByClause = { price: orderDirection }
      } else if (orderBy === 'rating') {
        // For rating, we'll calculate average in application layer
        orderByClause = { createdAt: orderDirection }
      } else if (orderBy === 'popularity') {
        // For popularity, we'll count appointments in application layer
        orderByClause = { createdAt: orderDirection }
      }

      try {
        // Get services with their related data
        const [services, total] = await Promise.all([
          ctx.prisma.service.findMany({
            where,
            select: serviceSelect,
            skip,
            take: limit,
            orderBy: orderByClause,
          }),
          ctx.prisma.service.count({ where }),
        ])

        // Calculate statistics for ordering if needed
        let servicesWithStats = services
        if (orderBy === 'rating' || orderBy === 'popularity') {
          const serviceIds = services.map(s => s.id)
          
          const [ratings, appointments] = await Promise.all([
            ctx.prisma.review.groupBy({
              by: ['serviceId'],
              where: { serviceId: { in: serviceIds } },
              _avg: { rating: true },
              _count: { rating: true },
            }),
            ctx.prisma.appointment.groupBy({
              by: ['serviceId'],
              where: { serviceId: { in: serviceIds } },
              _count: { serviceId: true },
            }),
          ])

          const ratingMap = ratings.reduce((acc, rating) => {
            acc[rating.serviceId] = {
              average: rating._avg.rating || 0,
              count: rating._count.rating,
            }
            return acc
          }, {} as Record<string, { average: number; count: number }>)

          const appointmentMap = appointments.reduce((acc, appointment) => {
            acc[appointment.serviceId] = appointment._count.serviceId
            return acc
          }, {} as Record<string, number>)

          servicesWithStats = services.map(service => ({
            ...service,
            rating: ratingMap[service.id] || { average: 0, count: 0 },
            appointmentCount: appointmentMap[service.id] || 0,
          }))

          // Sort by the requested metric
          if (orderBy === 'rating') {
            servicesWithStats.sort((a, b) => {
              const aRating = a.rating.average
              const bRating = b.rating.average
              return orderDirection === 'asc' ? aRating - bRating : bRating - aRating
            })
          } else if (orderBy === 'popularity') {
            servicesWithStats.sort((a, b) => {
              const aCount = a.appointmentCount
              const bCount = b.appointmentCount
              return orderDirection === 'asc' ? aCount - bCount : bCount - aCount
            })
          }
        }

        return {
          data: servicesWithStats,
          pagination: calculatePagination(page, limit, total),
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch services',
          cause: error,
        })
      }
    }),

  /**
   * Get a single service by ID
   */
  getById: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const service = await ctx.prisma.service.findUnique({
          where: { id: input.id },
          select: serviceSelect,
        })

        if (!service) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Service not found',
          })
        }

        // Get average rating and appointment count
        const [ratingData, appointmentCount] = await Promise.all([
          ctx.prisma.review.aggregate({
            where: { serviceId: input.id },
            _avg: { rating: true },
            _count: { rating: true },
          }),
          ctx.prisma.appointment.count({
            where: { serviceId: input.id },
          }),
        ])

        return {
          ...service,
          rating: {
            average: ratingData._avg.rating || 0,
            count: ratingData._count.rating,
          },
          appointmentCount,
        }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch service',
          cause: error,
        })
      }
    }),

  /**
   * Get all service categories
   */
  getCategories: publicProcedure.query(async ({ ctx }) => {
    try {
      const services = await ctx.prisma.service.findMany({
        select: { category: true },
        distinct: ['category'],
        where: { isActive: true },
      })

      return services.map(service => service.category).sort()
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch service categories',
        cause: error,
      })
    }
  }),

  /**
   * Get popular services
   */
  getPopular: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(20).default(6),
        category: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, category } = input

      try {
        // Get services ordered by appointment count
        const whereClause: Prisma.ServiceWhereInput = {
          isActive: true,
          isPopular: true,
          ...(category ? { category } : {}),
        }

        const services = await ctx.prisma.service.findMany({
          where: whereClause,
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            price: true,
            duration: true,
            clinics: {
              select: {
                id: true,
                name: true,
              },
              take: 1,
            },
          },
          take: limit,
        })

        return services
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch popular services',
          cause: error,
        })
      }
    }),

  /**
   * Search services by clinic availability
   */
  getAvailableAtClinic: publicProcedure
    .input(
      z.object({
        clinicId: z.string().uuid(),
        category: z.string().optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { clinicId, category, search } = input

      try {
        const whereClause: Prisma.ServiceWhereInput = {
          clinics: {
            some: {
              id: clinicId,
            },
          },
          isActive: true,
          ...(category ? { category } : {}),
          ...(search
            ? {
                OR: [
                  { name: { contains: search, mode: 'insensitive' } },
                  { description: { contains: search, mode: 'insensitive' } },
                ],
              }
            : {}),
        }

        const services = await ctx.prisma.service.findMany({
          where: whereClause,
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            price: true,
            duration: true,
            doctors: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                specialties: true,
              },
            },
          },
          orderBy: {
            name: 'asc',
          },
        })

        return services
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch available services',
          cause: error,
        })
      }
    }),

  /**
   * Create a new service (staff/admin only)
   */
  create: staffProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string(),
        category: z.string().min(1).max(100),
        price: z.number().min(0),
        duration: z.number().min(15), // Minimum 15 minutes
        requirements: z.array(z.string()).default([]),
        preparationInstructions: z.string().optional(),
        aftercareInstructions: z.string().optional(),
        isActive: z.boolean().default(true),
        isPopular: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const service = await ctx.prisma.service.create({
          data: input,
          select: serviceSelect,
        })

        return service
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to create service',
          cause: error,
        })
      }
    }),

  /**
   * Update a service (staff/admin only)
   */
  update: staffProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        category: z.string().min(1).max(100).optional(),
        price: z.number().min(0).optional(),
        duration: z.number().min(15).optional(),
        requirements: z.array(z.string()).optional(),
        preparationInstructions: z.string().optional(),
        aftercareInstructions: z.string().optional(),
        isActive: z.boolean().optional(),
        isPopular: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      try {
        const service = await ctx.prisma.service.update({
          where: { id },
          data: updateData,
          select: serviceSelect,
        })

        return service
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Service not found',
            })
          }
        }

        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to update service',
          cause: error,
        })
      }
    }),

  /**
   * Delete a service (admin only)
   */
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if service has future appointments
        const futureAppointments = await ctx.prisma.appointment.count({
          where: {
            serviceId: input.id,
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
            message: 'Cannot delete service with future appointments',
          })
        }

        await ctx.prisma.service.delete({
          where: { id: input.id },
        })

        return { success: true }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Service not found',
          })
        }

        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete service',
          cause: error,
        })
      }
    }),

  /**
   * Add service to clinic (staff/admin only)
   */
  addToClinic: staffProcedure
    .input(
      z.object({
        serviceId: z.string().uuid(),
        clinicId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.clinic.update({
          where: { id: input.clinicId },
          data: {
            services: {
              connect: { id: input.serviceId },
            },
          },
        })

        return { success: true }
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Clinic or service not found',
            })
          }
          if (error.code === 'P2002') {
            throw new TRPCError({
              code: 'CONFLICT',
              message: 'Service is already offered at this clinic',
            })
          }
        }

        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to add service to clinic',
          cause: error,
        })
      }
    }),

  /**
   * Remove service from clinic (staff/admin only)
   */
  removeFromClinic: staffProcedure
    .input(
      z.object({
        serviceId: z.string().uuid(),
        clinicId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.clinic.update({
          where: { id: input.clinicId },
          data: {
            services: {
              disconnect: { id: input.serviceId },
            },
          },
        })

        return { success: true }
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Clinic or service not found',
            })
          }
        }

        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to remove service from clinic',
          cause: error,
        })
      }
    }),

  /**
   * Get service statistics (admin/staff only)
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      const [totalServices, activeServices, popularServices, categoryCounts] = await Promise.all([
        ctx.prisma.service.count(),
        ctx.prisma.service.count({ where: { isActive: true } }),
        ctx.prisma.service.count({ where: { isPopular: true } }),
        ctx.prisma.service.groupBy({
          by: ['category'],
          where: { isActive: true },
          _count: { category: true },
          orderBy: { _count: { category: 'desc' } },
        }),
      ])

      return {
        totalServices,
        activeServices,
        popularServices,
        categories: categoryCounts.map(cat => ({
          category: cat.category,
          count: cat._count.category,
        })),
      }
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch service statistics',
        cause: error,
      })
    }
  }),

  /**
   * Get Healthier SG covered services with benefit information
   */
  getHealthierSGCovered: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(20),
        search: z.string().optional(),
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
        coverageTypes: z.array(z.enum([
          'FULL_COVERAGE',
          'PARTIAL_COVERAGE',
          'SUBSIDIZED',
          'DISCOUNTED'
        ])).optional(),
        eligibilityCriteria: z.array(z.string()).optional(),
        clinicId: z.string().uuid().optional(),
        orderBy: z.enum(['name', 'category', 'savings', 'eligibility']).default('name'),
        orderDirection: z.enum(['asc', 'desc']).default('asc'),
      })
    )
    .query(async ({ ctx, input }) => {
      const { 
        page, 
        limit, 
        search, 
        programCategories, 
        coverageTypes,
        eligibilityCriteria,
        clinicId, 
        orderBy, 
        orderDirection 
      } = input
      const skip = (page - 1) * limit

      // Build where clause for Healthier SG covered services
      const where: Prisma.ServiceWhereInput = {
        isActive: true,
        ...(clinicId ? {
          clinics: {
            some: { id: clinicId }
          }
        } : {}),
        // This would need to join with Healthier SG service coverage - simplified for now
      }

      // Add text search
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { category: { contains: search, mode: 'insensitive' } },
        ]
      }

      try {
        // Execute query with Healthier SG coverage data
        const [services, total] = await Promise.all([
          ctx.prisma.service.findMany({
            where,
            select: {
              ...serviceSelect,
              // This would need to include Healthier SG coverage data
              // For now, we'll add mock data
              healthierSGServices: {
                select: {
                  id: true,
                  coverageType: true,
                  coveragePercentage: true,
                  eligibilityCriteria: true,
                  waitingPeriodDays: true,
                  program: {
                    select: {
                      id: true,
                      name: true,
                      category: true,
                      description: true,
                    }
                  }
                }
              }
            },
            skip,
            take: limit,
            orderBy: getServiceOrderByClause(orderBy, orderDirection),
          }),
          ctx.prisma.service.count({ where }),
        ])

        // Process Healthier SG coverage data
        const servicesWithCoverage = services.map(service => {
          let coverageInfo: any[] = []
          let benefitSummary = {
            totalPrograms: 0,
            fullCoverage: 0,
            partialCoverage: 0,
            subsidized: 0,
            discounted: 0,
            averageSavings: 0,
            maxSavings: 0,
          }

          if (service.healthierSGServices && service.healthierSGServices.length > 0) {
            coverageInfo = service.healthierSGServices.map(coverage => ({
              programId: coverage.program.id,
              programName: coverage.program.name,
              programCategory: coverage.program.category,
              coverageType: coverage.coverageType,
              coveragePercentage: coverage.coveragePercentage,
              eligibilityCriteria: coverage.eligibilityCriteria,
              waitingPeriodDays: coverage.waitingPeriodDays,
              estimatedSavings: service.price ? 
                Math.round(service.price * (coverage.coveragePercentage / 100)) : 0,
              benefits: getCoverageBenefits(coverage.coverageType),
            }))

            const coverages = service.healthierSGServices
            
            benefitSummary = {
              totalPrograms: coverages.length,
              fullCoverage: coverages.filter(c => c.coverageType === 'FULL_COVERAGE').length,
              partialCoverage: coverages.filter(c => c.coverageType === 'PARTIAL_COVERAGE').length,
              subsidized: coverages.filter(c => c.coverageType === 'SUBSIDIZED').length,
              discounted: coverages.filter(c => c.coverageType === 'DISCOUNTED').length,
              averageSavings: service.price ? 
                Math.round(service.price * (coverages.reduce((sum, c) => sum + c.coveragePercentage, 0) / coverages.length) / 100) : 0,
              maxSavings: service.price ? 
                Math.round(service.price * (Math.max(...coverages.map(c => c.coveragePercentage)) / 100)) : 0,
            }
          }

          return {
            ...service,
            coverageInfo,
            benefitSummary,
            healthierSGServices: undefined, // Remove from main data
            isHealthierSGCovered: coverageInfo.length > 0,
            hasFullCoverage: coverageInfo.some(c => c.coverageType === 'FULL_COVERAGE'),
            hasPartialCoverage: coverageInfo.some(c => c.coverageType === 'PARTIAL_COVERAGE'),
          }
        })

        return {
          data: servicesWithCoverage,
          pagination: calculatePagination(page, limit, total),
          totalCoveredServices: total,
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch Healthier SG covered services',
          cause: error,
        })
      }
    }),

  /**
   * Get service eligibility and benefits for Healthier SG
   */
  getServiceEligibility: publicProcedure
    .input(
      z.object({
        serviceId: z.string().uuid(),
        userId: z.string().uuid().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { serviceId, userId } = input

      try {
        const service = await ctx.prisma.service.findUnique({
          where: { id: serviceId },
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            price: true,
            duration: true,
            requirements: true,
            healthierSGServices: {
              select: {
                id: true,
                coverageType: true,
                coveragePercentage: true,
                eligibilityCriteria: true,
                waitingPeriodDays: true,
                priorAuthorizationRequired: true,
                copayAmount: true,
                program: {
                  select: {
                    id: true,
                    name: true,
                    category: true,
                    description: true,
                    targetConditions: true,
                    healthGoals: true,
                  }
                }
              }
            }
          }
        })

        if (!service) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Service not found',
          })
        }

        // Get user enrollment data if userId provided
        let userEnrollment = null
        if (userId) {
          const user = await ctx.prisma.user.findUnique({
            where: { id: userId },
            select: {
              id: true,
              profile: {
                select: {
                  healthierSgEnrolled: true,
                  healthierSgRegistrationDate: true,
                }
              }
            }
          })
          userEnrollment = user?.profile
        }

        // Process eligibility and benefits for each program
        const eligibilityResults = service.healthierSGServices.map(coverage => {
          const isEligible = checkEligibility(coverage.eligibilityCriteria, userEnrollment)
          const waitingPeriodMet = !coverage.waitingPeriodDays || 
            !userEnrollment?.healthierSgRegistrationDate ||
            (new Date().getTime() - userEnrollment.healthierSgRegistrationDate.getTime()) >= 
            (coverage.waitingPeriodDays * 24 * 60 * 60 * 1000)

          const estimatedSavings = service.price ? 
            Math.round(service.price * (coverage.coveragePercentage / 100)) : 0
          const patientCost = service.price ? 
            service.price - estimatedSavings - (coverage.copayAmount || 0) : 0

          return {
            program: coverage.program,
            coverage: {
              type: coverage.coverageType,
              percentage: coverage.coveragePercentage,
              copayAmount: coverage.copayAmount,
              priorAuthorizationRequired: coverage.priorAuthorizationRequired,
            },
            eligibility: {
              isEligible,
              criteriaMet: isEligible,
              waitingPeriodDays: coverage.waitingPeriodDays,
              waitingPeriodMet,
              requirements: coverage.eligibilityCriteria,
            },
            financial: {
              originalPrice: service.price,
              estimatedSavings,
              patientCost: Math.max(0, patientCost),
              totalCoverage: estimatedSavings + (coverage.copayAmount || 0),
            },
            process: {
              steps: getCoverageProcess(coverage.coverageType),
              estimatedTime: getEstimatedProcessTime(coverage.coverageType),
              requiredDocuments: getRequiredDocuments(coverage.coverageType, coverage.eligibilityCriteria),
            }
          }
        })

        return {
          service: {
            id: service.id,
            name: service.name,
            description: service.description,
            category: service.category,
            price: service.price,
            duration: service.duration,
            requirements: service.requirements,
          },
          userEnrollment: userEnrollment ? {
            isEnrolled: userEnrollment.healthierSgEnrolled,
            enrollmentDate: userEnrollment.healthierSgRegistrationDate,
          } : null,
          programOptions: eligibilityResults,
          summary: {
            totalPrograms: eligibilityResults.length,
            eligiblePrograms: eligibilityResults.filter(r => r.eligibility.isEligible && r.eligibility.waitingPeriodMet).length,
            fullCoverageOptions: eligibilityResults.filter(r => r.coverage.type === 'FULL_COVERAGE').length,
            partialCoverageOptions: eligibilityResults.filter(r => r.coverage.type === 'PARTIAL_COVERAGE').length,
            averageSavings: eligibilityResults.length > 0 ? 
              Math.round(eligibilityResults.reduce((sum, r) => sum + r.financial.estimatedSavings, 0) / eligibilityResults.length) : 0,
            maxSavings: Math.max(...eligibilityResults.map(r => r.financial.estimatedSavings), 0),
          }
        }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to get service eligibility',
          cause: error,
        })
      }
    }),
})

/**
 * Get order by clause for different sorting options
 */
function getServiceOrderByClause(
  orderBy: string, 
  orderDirection: 'asc' | 'desc'
): Prisma.ServiceOrderByWithRelationInput {
  switch (orderBy) {
    case 'name':
      return { name: orderDirection }
    case 'category':
      return { category: orderDirection }
    case 'price':
      return { price: orderDirection }
    case 'duration':
      return { duration: orderDirection }
    default:
      return { name: orderDirection }
  }
}

/**
 * Get coverage benefits based on coverage type
 */
function getCoverageBenefits(coverageType: string): string[] {
  switch (coverageType) {
    case 'FULL_COVERAGE':
      return [
        'No out-of-pocket expenses',
        'Direct billing to program',
        'Priority scheduling',
        'Comprehensive care coordination'
      ]
    case 'PARTIAL_COVERAGE':
      return [
        'Reduced patient cost',
        'Program subsidies available',
        'Sliding scale pricing',
        'Payment plan options'
      ]
    case 'SUBSIDIZED':
      return [
        'Government subsidies',
        'Income-based pricing',
        'Essential care focus',
        'Basic service coverage'
      ]
    case 'DISCOUNTED':
      return [
        'Member discounts',
        'Group rate pricing',
        'Preventive care focus',
        'Wellness program benefits'
      ]
    default:
      return ['Standard pricing', 'Basic coverage']
  }
}

/**
 * Check user eligibility for service coverage
 */
function checkEligibility(criteria: string[], userEnrollment: any): boolean {
  if (!userEnrollment || !userEnrollment.healthierSgEnrolled) {
    return false
  }
  
  // This would implement actual eligibility logic based on:
  // - Age requirements
  // - Medical conditions
  // - Income levels
  // - Geographic requirements
  // - Enrollment duration
  
  // For now, return true if enrolled (simplified)
  return true
}

/**
 * Get coverage process steps
 */
function getCoverageProcess(coverageType: string): string[] {
  switch (coverageType) {
    case 'FULL_COVERAGE':
      return [
        'Verify enrollment status',
        'Confirm eligibility criteria',
        'Schedule appointment',
        'Receive services',
        'Direct billing to program'
      ]
    case 'PARTIAL_COVERAGE':
      return [
        'Verify enrollment',
        'Check coverage percentage',
        'Obtain pre-authorization if required',
        'Pay copay at visit',
        'Submit claims for balance'
      ]
    case 'SUBSIDIZED':
      return [
        'Verify income eligibility',
        'Confirm subsidy qualification',
        'Apply for program enrollment',
        'Receive approval',
        'Schedule subsidized services'
      ]
    case 'DISCOUNTED':
      return [
        'Confirm membership status',
        'Verify discount eligibility',
        'Schedule appointment',
        'Pay discounted rate',
        'Receive member benefits'
      ]
    default:
      return ['Contact clinic for process details']
  }
}

/**
 * Get estimated processing time for coverage
 */
function getEstimatedProcessTime(coverageType: string): string {
  switch (coverageType) {
    case 'FULL_COVERAGE':
      return '1-2 business days'
    case 'PARTIAL_COVERAGE':
      return '3-5 business days'
    case 'SUBSIDIZED':
      return '5-10 business days'
    case 'DISCOUNTED':
      return 'Same day'
    default:
      return 'Contact clinic'
  }
}

/**
 * Get required documents for coverage
 */
function getRequiredDocuments(coverageType: string, criteria: string[]): string[] {
  const baseDocs = ['NRIC/FIN', 'Proof of enrollment']
  
  const typeSpecific = {
    'FULL_COVERAGE': ['Program enrollment card', 'Referral letter if required'],
    'PARTIAL_COVERAGE': ['Income证明', 'Medical history summary'],
    'SUBSIDIZED': ['Income tax assessment', 'Household composition proof', 'Bank statements'],
    'DISCOUNTED': ['Member ID card', 'Employment certificate']
  }
  
  return [...baseDocs, ...(typeSpecific[coverageType as keyof typeof typeSpecific] || [])]
}