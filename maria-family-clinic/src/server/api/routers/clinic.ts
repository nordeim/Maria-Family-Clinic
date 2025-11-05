import { z } from 'zod'
import { createTRPCRouter, publicProcedure, protectedProcedure, staffProcedure, calculatePagination, PaginatedResponse } from '../trpc'
import { TRPCError } from '@trpc/server'
import { Prisma } from '@prisma/client'

const clinicSelect = {
  id: true,
  name: true,
  description: true,
  address: true,
  postalCode: true,
  phone: true,
  email: true,
  website: true,
  operatingHours: true,
  facilities: true,
  languages: true,
  latitude: true,
  longitude: true,
  isActive: true,
  isHealthierSgPartner: true,
  createdAt: true,
  updatedAt: true,
  doctors: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      specialties: true,
      languages: true,
      profile: {
        select: {
          bio: true,
          photo: true,
        },
      },
    },
  },
  services: {
    select: {
      id: true,
      name: true,
      description: true,
      category: true,
      price: true,
    },
  },
  user: {
    select: {
      id: true,
      email: true,
      role: true,
    },
  },
}

/**
 * Clinic Router - Handles all clinic-related operations
 */
export const clinicRouter = createTRPCRouter({
  /**
   * Get all clinics with pagination and filtering
   */
  getAll: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
        isActive: z.boolean().optional(),
        isHealthierSgPartner: z.boolean().optional(),
        languages: z.array(z.string()).optional(),
        services: z.array(z.string()).optional(),
        location: z
          .object({
            latitude: z.number(),
            longitude: z.number(),
            radiusKm: z.number().min(0.1).max(50).default(5),
          })
          .optional(),
        orderBy: z.enum(['name', 'distance', 'rating', 'createdAt']).default('name'),
        orderDirection: z.enum(['asc', 'desc']).default('asc'),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, search, isActive, isHealthierSgPartner, languages, services, location, orderBy, orderDirection } = input
      const skip = (page - 1) * limit

      // Build where clause
      const where: Prisma.ClinicWhereInput = {}

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { address: { contains: search, mode: 'insensitive' } },
        ]
      }

      if (isActive !== undefined) {
        where.isActive = isActive
      }

      if (isHealthierSgPartner !== undefined) {
        where.isHealthierSgPartner = isHealthierSgPartner
      }

      if (languages && languages.length > 0) {
        where.languages = {
          hasSome: languages,
        }
      }

      // Handle distance-based queries if location is provided
      if (location) {
        const { latitude, longitude, radiusKm } = location
        where.AND = [
          ...(where.AND || []),
          {
            latitude: {
              gte: latitude - radiusKm / 111, // Approximate conversion for degrees
              lte: latitude + radiusKm / 111,
            },
            longitude: {
              gte: longitude - radiusKm / (111 * Math.cos((latitude * Math.PI) / 180)),
              lte: longitude + radiusKm / (111 * Math.cos((latitude * Math.PI) / 180)),
            },
          },
        ]
      }

      // Build orderBy clause
      let orderByClause: Prisma.ClinicOrderByWithRelationInput = {}
      if (orderBy === 'distance' && location) {
        // For distance ordering, we'll calculate in the application layer
        orderByClause = { name: orderDirection }
      } else {
        orderByClause = { [orderBy]: orderDirection }
      }

      try {
        // Execute query with proper filtering
        const [clinics, total] = await Promise.all([
          ctx.prisma.clinic.findMany({
            where,
            select: clinicSelect,
            skip,
            take: limit,
            orderBy: orderByClause,
          }),
          ctx.prisma.clinic.count({ where }),
        ])

        // Calculate distances if location is provided
        if (location && clinics.length > 0) {
          const clinicsWithDistance = clinics.map(clinic => {
            if (clinic.latitude && clinic.longitude) {
              const distance = calculateDistance(
                location.latitude,
                location.longitude,
                clinic.latitude,
                clinic.longitude
              )
              return { ...clinic, distance }
            }
            return { ...clinic, distance: null }
          })

          // Sort by distance if requested
          let sortedClinics = clinicsWithDistance
          if (orderBy === 'distance') {
            sortedClinics = clinicsWithDistance.sort((a, b) => {
              if (!a.distance) return 1
              if (!b.distance) return -1
              return orderDirection === 'asc' ? a.distance - b.distance : b.distance - a.distance
            })
          }

          return {
            data: sortedClinics,
            pagination: calculatePagination(page, limit, total),
          }
        }

        return {
          data: clinics,
          pagination: calculatePagination(page, limit, total),
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch clinics',
          cause: error,
        })
      }
    }),

  /**
   * Get a single clinic by ID
   */
  getById: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const clinic = await ctx.prisma.clinic.findUnique({
          where: { id: input.id },
          select: {
            ...clinicSelect,
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
          },
        })

        if (!clinic) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Clinic not found',
          })
        }

        return clinic
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch clinic',
          cause: error,
        })
      }
    }),

  /**
   * Get nearby clinics based on current location
   */
  getNearby: publicProcedure
    .input(
      z.object({
        latitude: z.number(),
        longitude: z.number(),
        radiusKm: z.number().min(0.1).max(50).default(5),
        limit: z.number().min(1).max(50).default(10),
        services: z.array(z.string()).optional(),
        isActive: z.boolean().default(true),
      })
    )
    .query(async ({ ctx, input }) => {
      const { latitude, longitude, radiusKm, limit, services, isActive } = input

      try {
        // Get all clinics within the geographic bounds
        const clinics = await ctx.prisma.clinic.findMany({
          where: {
            isActive,
            latitude: {
              gte: latitude - radiusKm / 111,
              lte: latitude + radiusKm / 111,
            },
            longitude: {
              gte: longitude - radiusKm / (111 * Math.cos((latitude * Math.PI) / 180)),
              lte: longitude + radiusKm / (111 * Math.cos((latitude * Math.PI) / 180)),
            },
            ...(services && services.length > 0
              ? {
                  services: {
                    some: {
                      name: { in: services },
                    },
                  },
                }
              : {}),
          },
          select: clinicSelect,
          take: limit,
        })

        // Calculate exact distances and filter by radius
        const clinicsWithDistance = clinics
          .map(clinic => {
            if (clinic.latitude && clinic.longitude) {
              const distance = calculateDistance(
                latitude,
                longitude,
                clinic.latitude,
                clinic.longitude
              )
              return { ...clinic, distance }
            }
            return { ...clinic, distance: null }
          })
          .filter(clinic => clinic.distance === null || clinic.distance <= radiusKm)
          .sort((a, b) => {
            if (!a.distance) return 1
            if (!b.distance) return -1
            return a.distance - b.distance
          })
          .slice(0, limit)

        return clinicsWithDistance
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch nearby clinics',
          cause: error,
        })
      }
    }),

  /**
   * Create a new clinic (staff/admin only)
   */
  create: staffProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        address: z.string().min(1).max(500),
        postalCode: z.string().regex(/^[0-9]{6}$/),
        phone: z.string().regex(/^(\+65)?[689][0-9]{7}$/),
        email: z.string().email(),
        website: z.string().url().optional(),
        operatingHours: z.record(z.string()).optional(),
        facilities: z.array(z.string()).default([]),
        languages: z.array(z.string()).default([]),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        isActive: z.boolean().default(true),
        isHealthierSgPartner: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const clinic = await ctx.prisma.clinic.create({
          data: {
            ...input,
            userId: ctx.session.user.id,
          },
          select: clinicSelect,
        })

        return clinic
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to create clinic',
          cause: error,
        })
      }
    }),

  /**
   * Update a clinic (staff/admin only)
   */
  update: staffProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        address: z.string().min(1).max(500).optional(),
        postalCode: z.string().regex(/^[0-9]{6}$/).optional(),
        phone: z.string().regex(/^(\+65)?[689][0-9]{7}$/).optional(),
        email: z.string().email().optional(),
        website: z.string().url().optional(),
        operatingHours: z.record(z.string()).optional(),
        facilities: z.array(z.string()).optional(),
        languages: z.array(z.string()).optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        isActive: z.boolean().optional(),
        isHealthierSgPartner: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      try {
        const clinic = await ctx.prisma.clinic.update({
          where: { id },
          data: updateData,
          select: clinicSelect,
        })

        return clinic
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            throw new TRPCError({
              code: 'CONFLICT',
              message: 'A clinic with this email already exists',
            })
          }
          if (error.code === 'P2025') {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Clinic not found',
            })
          }
        }

        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to update clinic',
          cause: error,
        })
      }
    }),

  /**
   * Delete a clinic (admin only)
   */
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.clinic.delete({
          where: { id: input.id },
        })

        return { success: true }
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Clinic not found',
          })
        }

        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete clinic',
          cause: error,
        })
      }
    }),

  /**
   * Get clinic statistics (admin/staff only)
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      const [totalClinics, activeClinics, healthierSgPartners] = await Promise.all([
        ctx.prisma.clinic.count(),
        ctx.prisma.clinic.count({ where: { isActive: true } }),
        ctx.prisma.clinic.count({ where: { isHealthierSgPartner: true } }),
      ])

      return {
        totalClinics,
        activeClinics,
        healthierSgPartners,
      }
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch clinic statistics',
        cause: error,
      })
    }
  }),

  /**
   * Advanced search with filtering (supports the new search system)
   */
  search: publicProcedure
    .input(
      z.object({
        query: z.string().optional(),
        filters: z.object({
          services: z.array(z.string()).optional(),
          languages: z.array(z.string()).optional(),
          operatingHours: z.array(z.enum(['open_now', 'weekend', 'late_night', '24_hour', 'sunday', 'holiday'])).optional(),
          clinicTypes: z.array(z.enum(['polyclinic', 'private', 'hospital_linked', 'family_clinic', 'specialist_clinic'])).optional(),
          accessibilityFeatures: z.array(z.enum(['wheelchair_accessible', 'hearing_loop', 'parking', 'elevator', 'wide_aisles'])).optional(),
          rating: z.enum(['4_plus', '4_5_plus', '5_stars']).optional(),
          insurance: z.array(z.enum(['medisave', 'medishield', 'private_insurance', 'cash_only'])).optional(),
          location: z.object({
            latitude: z.number(),
            longitude: z.number(),
            radiusKm: z.number().min(0.1).max(50).default(5),
          }).optional(),
        }).optional(),
        sessionId: z.string().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(20),
        orderBy: z.enum(['relevance', 'distance', 'rating', 'name']).default('relevance'),
        orderDirection: z.enum(['asc', 'desc']).default('desc'),
      })
    )
    .query(async ({ ctx, input }) => {
      const { query, filters = {}, page, limit, orderBy, orderDirection } = input
      const skip = (page - 1) * limit
      const startTime = Date.now()

      // Build comprehensive where clause
      const where: Prisma.ClinicWhereInput = {
        isActive: true,
      }

      // Text search
      if (query && query.trim()) {
        const searchTerm = query.trim()
        where.OR = [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
          { address: { contains: searchTerm, mode: 'insensitive' } },
          { doctors: { some: { name: { contains: searchTerm, mode: 'insensitive' } } } },
          { services: { some: { name: { contains: searchTerm, mode: 'insensitive' } } } },
        ]
      }

      // Service filters
      if (filters.services && filters.services.length > 0) {
        where.services = {
          some: {
            name: { in: filters.services }
          }
        }
      }

      // Language filters
      if (filters.languages && filters.languages.length > 0) {
        where.languages = {
          hasSome: filters.languages
        }
      }

      // Operating hours filters
      if (filters.operatingHours && filters.operatingHours.length > 0) {
        const hourConditions: Prisma.ClinicWhereInput[] = []
        
        filters.operatingHours.forEach(hourFilter => {
          switch (hourFilter) {
            case 'open_now':
              // This would require complex time logic - simplified for now
              hourConditions.push({ isActive: true })
              break
            case '24_hour':
              // This would require checking operating hours JSON
              hourConditions.push({ isActive: true })
              break
            case 'weekend':
              // This would require checking operating hours JSON
              hourConditions.push({ isActive: true })
              break
            default:
              hourConditions.push({ isActive: true })
          }
        })
        
        if (hourConditions.length > 0) {
          where.AND = [...(where.AND || []), ...hourConditions]
        }
      }

      // Accessibility features
      if (filters.accessibilityFeatures && filters.accessibilityFeatures.length > 0) {
        where.facilities = {
          hasSome: filters.accessibilityFeatures
        }
      }

      // Rating filter (would need reviews table - simplified)
      if (filters.rating) {
        // Since rating is not in the current schema, we'll skip this for now
        // In a real implementation, you'd join with reviews table
      }

      // Insurance filters
      if (filters.insurance && filters.insurance.length > 0) {
        // This would require mapping insurance types to actual clinic capabilities
        // For now, we'll assume all clinics accept basic insurance
      }

      // Location-based filtering
      if (filters.location) {
        const { latitude, longitude, radiusKm } = filters.location
        where.AND = [
          ...(where.AND || []),
          {
            latitude: {
              gte: latitude - radiusKm / 111,
              lte: latitude + radiusKm / 111,
            },
            longitude: {
              gte: longitude - radiusKm / (111 * Math.cos((latitude * Math.PI) / 180)),
              lte: longitude + radiusKm / (111 * Math.cos((latitude * Math.PI) / 180)),
            },
          },
        ]
      }

      try {
        // Execute search
        const [clinics, total] = await Promise.all([
          ctx.prisma.clinic.findMany({
            where,
            select: {
              ...clinicSelect,
              reviews: {
                select: {
                  rating: true,
                  comment: true,
                  createdAt: true,
                  user: {
                    select: { id: true, name: true }
                  }
                },
                orderBy: { createdAt: 'desc' },
                take: 10,
              },
            },
            skip,
            take: limit,
            orderBy: getOrderByClause(orderBy, orderDirection, !!filters.location),
          }),
          ctx.prisma.clinic.count({ where }),
        ])

        // Calculate distances and ratings if needed
        let clinicsWithExtras = clinics.map(clinic => {
          let distance: number | null = null
          let averageRating: number | null = null
          let totalReviews = 0

          if (filters.location && clinic.latitude && clinic.longitude) {
            distance = calculateDistance(
              filters.location!.latitude,
              filters.location!.longitude,
              clinic.latitude,
              clinic.longitude
            )
          }

          // Calculate average rating from reviews
          if (clinic.reviews && clinic.reviews.length > 0) {
            totalReviews = clinic.reviews.length
            averageRating = clinic.reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
          }

          return {
            ...clinic,
            distance,
            rating: averageRating,
            totalReviews,
            reviews: undefined, // Remove reviews from main data
          }
        })

        // Sort by distance if requested
        if (orderBy === 'distance' && filters.location) {
          clinicsWithExtras = clinicsWithExtras.sort((a, b) => {
            if (!a.distance) return 1
            if (!b.distance) return -1
            return orderDirection === 'asc' ? a.distance - b.distance : b.distance - a.distance
          })
        } else if (orderBy === 'rating') {
          clinicsWithExtras = clinicsWithExtras.sort((a, b) => {
            const ratingA = a.rating || 0
            const ratingB = b.rating || 0
            return orderDirection === 'asc' ? ratingA - ratingB : ratingB - ratingA
          })
        }

        // Log search analytics
        const responseTime = Date.now() - startTime
        if (input.sessionId) {
          try {
            await ctx.prisma.searchLog.create({
              data: {
                sessionId: input.sessionId,
                searchQuery: query || '',
                searchFilters: input.filters as any,
                resultsCount: total,
                responseTimeMs: responseTime,
              }
            })
          } catch (error) {
            console.warn('Failed to log search analytics:', error)
          }
        }

        return {
          data: clinicsWithExtras,
          pagination: calculatePagination(page, limit, total),
          responseTime,
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to search clinics',
          cause: error,
        })
      }
    }),

  /**
   * Get Healthier SG participating clinics with specialized filtering
   */
  getHealthierSGParticipatingClinics: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
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
        participationTypes: z.array(z.enum([
          'FULL_PARTICIPATION',
          'SELECTED_SERVICES',
          'PILOT_PROGRAM',
          'RESEARCH_PARTICIPANT',
          'TRAINING_CENTER',
          'REFERRAL_PARTNER',
          'COLLABORATIVE_CARE'
        ])).optional(),
        accreditationLevels: z.array(z.enum([
          'BASIC',
          'STANDARD', 
          'ADVANCED',
          'SPECIALIZED',
          'CENTER_OF_EXCELLENCE',
          'RESEARCH_CENTER',
          'TRAINING_CENTER'
        ])).optional(),
        location: z
          .object({
            latitude: z.number(),
            longitude: z.number(),
            radiusKm: z.number().min(0.1).max(50).default(10),
          })
          .optional(),
        services: z.array(z.string()).optional(),
        orderBy: z.enum(['name', 'distance', 'rating', 'capacity', 'accreditation']).default('name'),
        orderDirection: z.enum(['asc', 'desc']).default('asc'),
      })
    )
    .query(async ({ ctx, input }) => {
      const { 
        page, 
        limit, 
        search, 
        programCategories, 
        participationTypes, 
        accreditationLevels,
        location, 
        services, 
        orderBy, 
        orderDirection 
      } = input
      const skip = (page - 1) * limit

      // Build where clause for Healthier SG participating clinics
      const where: Prisma.ClinicWhereInput = {
        isActive: true,
        clinicParticipation: {
          some: {
            status: { in: ['APPROVED', 'ACCREDITED'] },
            ...(programCategories && programCategories.length > 0 ? {
              program: {
                category: { in: programCategories }
              }
            } : {}),
            ...(participationTypes && participationTypes.length > 0 ? {
              participationType: { in: participationTypes }
            } : {}),
            ...(accreditationLevels && accreditationLevels.length > 0 ? {
              accreditationLevel: { in: accreditationLevels }
            } : {}),
          }
        }
      }

      // Add text search
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { address: { contains: search, mode: 'insensitive' } },
        ]
      }

      // Add service filters
      if (services && services.length > 0) {
        where.services = {
          some: {
            name: { in: services },
            isHealthierSGCovered: true
          }
        }
      }

      // Add location filtering
      if (location) {
        const { latitude, longitude, radiusKm } = location
        where.AND = [
          ...(where.AND || []),
          {
            latitude: {
              gte: latitude - radiusKm / 111,
              lte: latitude + radiusKm / 111,
            },
            longitude: {
              gte: longitude - radiusKm / (111 * Math.cos((latitude * Math.PI) / 180)),
              lte: longitude + radiusKm / (111 * Math.cos((latitude * Math.PI) / 180)),
            },
          },
        ]
      }

      try {
        // Execute query with comprehensive Healthier SG data
        const [clinics, total] = await Promise.all([
          ctx.prisma.clinic.findMany({
            where,
            select: {
              ...clinicSelect,
              clinicParticipation: {
                select: {
                  id: true,
                  participationType: true,
                  status: true,
                  accreditationLevel: true,
                  program: {
                    select: {
                      id: true,
                      name: true,
                      category: true,
                      description: true,
                    }
                  },
                  capacityLimit: true,
                  currentEnrollment: true,
                  waitingListCount: true,
                  averageWaitTime: true,
                  lastCapacityUpdate: true,
                },
                where: {
                  status: { in: ['APPROVED', 'ACCREDITED'] }
                }
              },
              services: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  price: true,
                  healthierSGPrice: true,
                  isHealthierSGCovered: true,
                  estimatedDuration: true,
                  capacity: true,
                  currentBookings: true,
                },
                where: {
                  isHealthierSGCovered: true
                }
              },
              reviews: {
                select: {
                  rating: true,
                  comment: true,
                  createdAt: true,
                },
                orderBy: { createdAt: 'desc' },
                take: 5,
              }
            },
            skip,
            take: limit,
            orderBy: getHealthierSGOrderByClause(orderBy, orderDirection),
          }),
          ctx.prisma.clinic.count({ where }),
        ])

        // Calculate enhanced data for each clinic
        const clinicsWithHealthierSGData = clinics.map(clinic => {
          let distance: number | null = null
          let averageRating: number | null = null
          let totalReviews = 0
          let healthProgramInfo: any[] = []
          let serviceCapacityInfo: any[] = []

          // Calculate distance if location provided
          if (location && clinic.latitude && clinic.longitude) {
            distance = calculateDistance(
              location.latitude,
              location.longitude,
              clinic.latitude,
              clinic.longitude
            )
          }

          // Process reviews
          if (clinic.reviews && clinic.reviews.length > 0) {
            totalReviews = clinic.reviews.length
            averageRating = clinic.reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
          }

          // Process Healthier SG participation info
          if (clinic.clinicParticipation && clinic.clinicParticipation.length > 0) {
            healthProgramInfo = clinic.clinicParticipation.map(participation => ({
              programId: participation.program.id,
              programName: participation.program.name,
              programCategory: participation.program.category,
              participationType: participation.participationType,
              accreditationLevel: participation.accreditationLevel,
              status: participation.status,
              capacity: {
                limit: participation.capacityLimit,
                current: participation.currentEnrollment,
                waitingList: participation.waitingListCount,
                available: (participation.capacityLimit || 0) - (participation.currentEnrollment || 0),
                averageWaitTime: participation.averageWaitTime,
                lastUpdated: participation.lastCapacityUpdate,
              }
            }))
          }

          // Process service capacity for Healthier SG services
          if (clinic.services && clinic.services.length > 0) {
            serviceCapacityInfo = clinic.services.map(service => ({
              serviceId: service.id,
              serviceName: service.name,
              price: service.price,
              healthierSGPrice: service.healthierSGPrice,
              duration: service.estimatedDuration,
              capacity: {
                limit: service.capacity,
                current: service.currentBookings,
                available: (service.capacity || 0) - (service.currentBookings || 0)
              }
            }))
          }

          return {
            ...clinic,
            distance,
            rating: averageRating,
            totalReviews,
            reviews: undefined, // Remove from main data
            healthProgramInfo,
            serviceCapacityInfo,
            isHealthierSGParticipating: true,
          }
        })

        // Sort by distance if requested
        if (orderBy === 'distance' && location) {
          clinicsWithHealthierSGData.sort((a, b) => {
            if (!a.distance) return 1
            if (!b.distance) return -1
            return orderDirection === 'asc' ? a.distance - b.distance : b.distance - a.distance
          })
        } else if (orderBy === 'rating') {
          clinicsWithHealthierSGData.sort((a, b) => {
            const ratingA = a.rating || 0
            const ratingB = b.rating || 0
            return orderDirection === 'asc' ? ratingA - ratingB : ratingB - ratingA
          })
        }

        return {
          data: clinicsWithHealthierSGData,
          pagination: calculatePagination(page, limit, total),
          totalParticipatingClinics: total,
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch Healthier SG participating clinics',
          cause: error,
        })
      }
    }),

  /**
   * Verify clinic participation status in Healthier SG program
   */
  verifyClinicParticipation: publicProcedure
    .input(
      z.object({
        clinicId: z.string().uuid(),
        programId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { clinicId, programId } = input

      try {
        const participation = await ctx.prisma.clinicParticipation.findUnique({
          where: {
            clinicId_programId: {
              clinicId,
              programId,
            }
          },
          select: {
            id: true,
            status: true,
            participationType: true,
            accreditationLevel: true,
            capacityLimit: true,
            currentEnrollment: true,
            waitingListCount: true,
            averageWaitTime: true,
            lastCapacityUpdate: true,
            verificationDate: true,
            program: {
              select: {
                id: true,
                name: true,
                category: true,
                description: true,
                isActive: true,
              }
            },
            clinic: {
              select: {
                id: true,
                name: true,
                address: true,
                phone: true,
                isActive: true,
              }
            }
          }
        })

        if (!participation) {
          return {
            isParticipating: false,
            reason: 'NOT_ENROLLED'
          }
        }

        const isActive = participation.status === 'APPROVED' || participation.status === 'ACCREDITED'
        const hasCapacity = participation.capacityLimit === null || 
          (participation.capacityLimit - (participation.currentEnrollment || 0)) > 0

        return {
          isParticipating: isActive,
          status: participation.status,
          participationType: participation.participationType,
          accreditationLevel: participation.accreditationLevel,
          capacity: {
            limit: participation.capacityLimit,
            current: participation.currentEnrollment,
            available: participation.capacityLimit !== null 
              ? participation.capacityLimit - (participation.currentEnrollment || 0)
              : null,
            waitingList: participation.waitingListCount,
            averageWaitTime: participation.averageWaitTime,
            lastUpdated: participation.lastCapacityUpdate,
          },
          program: participation.program,
          clinic: participation.clinic,
          verifiedAt: participation.verificationDate,
          canAcceptNewPatients: isActive && hasCapacity,
          reason: !isActive ? participation.status : (!hasCapacity ? 'AT_CAPACITY' : null)
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to verify clinic participation',
          cause: error,
        })
      }
    }),

  /**
   * Get clinic program capacity and availability
   */
  getClinicProgramCapacity: publicProcedure
    .input(
      z.object({
        clinicId: z.string().uuid(),
        programId: z.string().uuid().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { clinicId, programId } = input

      try {
        const whereClause = programId 
          ? { clinicId_programId: { clinicId, programId } }
          : { clinicId }

        const participations = await ctx.prisma.clinicParticipation.findMany({
          where: whereClause,
          select: {
            id: true,
            programId: true,
            status: true,
            participationType: true,
            capacityLimit: true,
            currentEnrollment: true,
            waitingListCount: true,
            averageWaitTime: true,
            lastCapacityUpdate: true,
            program: {
              select: {
                id: true,
                name: true,
                category: true,
                description: true,
              }
            }
          }
        })

        const capacityInfo = participations.map(participation => ({
          programId: participation.programId,
          programName: participation.program.name,
          programCategory: participation.program.category,
          status: participation.status,
          participationType: participation.participationType,
          capacity: {
            limit: participation.capacityLimit,
            current: participation.currentEnrollment,
            available: participation.capacityLimit !== null 
              ? participation.capacityLimit - (participation.currentEnrollment || 0)
              : null,
            waitingList: participation.waitingListCount,
            averageWaitTime: participation.averageWaitTime,
            lastUpdated: participation.lastCapacityUpdate,
            utilizationRate: participation.capacityLimit !== null && participation.capacityLimit > 0
              ? ((participation.currentEnrollment || 0) / participation.capacityLimit) * 100
              : null,
          },
          isActive: participation.status === 'APPROVED' || participation.status === 'ACCREDITED',
          canAcceptNewPatients: (participation.status === 'APPROVED' || participation.status === 'ACCREDITED') &&
            (participation.capacityLimit === null || 
             (participation.capacityLimit - (participation.currentEnrollment || 0)) > 0)
        }))

        return capacityInfo
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch clinic program capacity',
          cause: error,
        })
      }
    }),

  /**
   * Get clinic Healthier SG services and specializations
   */
  getClinicProgramServices: publicProcedure
    .input(
      z.object({
        clinicId: z.string().uuid(),
        programId: z.string().uuid().optional(),
        includeCapacity: z.boolean().default(true),
      })
    )
    .query(async ({ ctx, input }) => {
      const { clinicId, programId, includeCapacity } = input

      try {
        const whereClause: any = {
          clinicId,
          isHealthierSGCovered: true,
          isAvailable: true
        }

        if (programId) {
          // This would require joining with program services - simplified for now
        }

        const services = await ctx.prisma.clinicService.findMany({
          where: whereClause,
          select: {
            id: true,
            serviceId: true,
            service: {
              select: {
                id: true,
                name: true,
                description: true,
                category: true,
                typicalDurationMin: true,
                basePrice: true,
                healthierSGServices: true,
              }
            },
            price: true,
            healthierSGPrice: true,
            estimatedDuration: true,
            capacity: true,
            currentBookings: true,
            appointmentRequired: true,
            walkInAllowed: true,
            status: true,
            ...(includeCapacity ? {
              availabilities: {
                select: {
                  id: true,
                  date: true,
                  startTime: true,
                  endTime: true,
                  isAvailable: true,
                  maxAppointments: true,
                  bookedAppointments: true,
                  availableSlots: true,
                },
                where: {
                  date: { gte: new Date() },
                  isAvailable: true,
                },
                orderBy: { date: 'asc' },
                take: 30, // Next 30 days
              }
            } : {})
          },
          orderBy: { service: { name: 'asc' } }
        })

        const serviceInfo = services.map(service => ({
          clinicServiceId: service.id,
          serviceId: service.service.id,
          serviceName: service.service.name,
          serviceDescription: service.service.description,
          category: service.service.category,
          typicalDuration: service.service.typicalDurationMin || service.estimatedDuration,
          pricing: {
            basePrice: service.price || service.service.basePrice,
            healthierSGPrice: service.healthierSGPrice,
            savings: service.price && service.healthierSGPrice 
              ? service.price - service.healthierSGPrice 
              : null,
            savingsPercentage: service.price && service.healthierSGPrice 
              ? ((service.price - service.healthierSGPrice) / service.price) * 100 
              : null,
          },
          bookingInfo: {
            appointmentRequired: service.appointmentRequired,
            walkInAllowed: service.walkInAllowed,
            isAvailable: service.status === 'ACTIVE',
          },
          ...(includeCapacity ? {
            capacity: {
              dailyLimit: service.capacity,
              currentBookings: service.currentBookings,
              available: service.capacity !== null 
                ? service.capacity - (service.currentBookings || 0)
                : null,
              utilizationRate: service.capacity && service.capacity > 0 
                ? ((service.currentBookings || 0) / service.capacity) * 100 
                : null,
            },
            upcomingAvailability: service.availabilities.map(availability => ({
              date: availability.date,
              startTime: availability.startTime,
              endTime: availability.endTime,
              totalSlots: availability.maxAppointments || availability.availableSlots || 1,
              bookedSlots: availability.bookedAppointments,
              availableSlots: (availability.maxAppointments || availability.availableSlots || 1) - 
                            (availability.bookedAppointments || 0),
            }))
          } : {})
        }))

        return serviceInfo
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch clinic program services',
          cause: error,
        })
      }
    }),

  /**
   * Track clinic program metrics for analytics
   */
  trackClinicProgramMetrics: publicProcedure
    .input(
      z.object({
        clinicId: z.string().uuid(),
        programId: z.string().uuid(),
        action: z.enum([
          'PROGRAM_VIEW',
          'SERVICE_INQUIRY',
          'APPOINTMENT_BOOKING',
          'CAPACITY_CHECK',
          'PARTICIPATION_VERIFICATION'
        ]),
        metadata: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { clinicId, programId, action, metadata } = input

      try {
        // Log the metric
        await ctx.prisma.clinicMetrics.create({
          data: {
            clinicId,
            programId,
            metricType: action,
            metricValue: 1,
            recordedAt: new Date(),
            metadata: metadata || {},
          }
        })

        return { success: true }
      } catch (error) {
        console.warn('Failed to track clinic program metrics:', error)
        return { success: false, error: 'Failed to log metric' }
      }
    }),

  /**
   * Get search suggestions
   */
  getSuggestions: publicProcedure
    .input(
      z.object({
        query: z.string().min(2),
        limit: z.number().min(1).max(20).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const { query, limit } = input
      const queryLower = query.toLowerCase()

      try {
        const [clinics, services] = await Promise.all([
          // Get clinic suggestions
          ctx.prisma.clinic.findMany({
            where: {
              isActive: true,
              name: {
                contains: query,
                mode: 'insensitive',
              },
            },
            select: { id: true, name: true, address: true },
            take: Math.floor(limit / 2),
          }),
          
          // Get service suggestions
          ctx.prisma.service.findMany({
            where: {
              name: {
                contains: query,
                mode: 'insensitive',
              },
            },
            select: { id: true, name: true, category: true },
            take: Math.floor(limit / 2),
          }),
        ])

        const suggestions = [
          ...clinics.map(clinic => ({
            type: 'clinic' as const,
            value: clinic.name,
            displayValue: clinic.name,
            subtext: clinic.address,
          })),
          ...services.map(service => ({
            type: 'service' as const,
            value: service.name,
            displayValue: service.name,
            subtext: service.category,
          })),
        ]

        return suggestions.slice(0, limit)
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to get suggestions',
          cause: error,
        })
      }
    }),

  /**
   * Get search analytics (admin/staff only)
   */
  getSearchAnalytics: protectedProcedure
    .input(
      z.object({
        dateFrom: z.date().optional(),
        dateTo: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { dateFrom, dateTo } = input

      try {
        const whereClause = {
          searchTimestamp: {
            ...(dateFrom && { gte: dateFrom }),
            ...(dateTo && { lte: dateTo }),
          },
        }

        const [totalSearches, popularFilters, averageResponseTime, popularQueries] = await Promise.all([
          ctx.prisma.searchLog.count({ where: whereClause }),
          
          // Get popular filters (simplified - would need more complex aggregation)
          ctx.prisma.searchLog.groupBy({
            by: ['searchFilters'],
            where: whereClause,
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 10,
          }),
          
          // Get average response time
          ctx.prisma.searchLog.aggregate({
            where: whereClause,
            _avg: { responseTimeMs: true },
          }),
          
          // Get popular queries
          ctx.prisma.searchLog.groupBy({
            by: ['searchQuery'],
            where: whereClause,
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 10,
          }),
        ])

        return {
          totalSearches,
          popularFilters: popularFilters.map(item => ({
            filter: item.searchFilters,
            count: item._count.id,
          })),
          averageResponseTime: averageResponseTime._avg.responseTimeMs || 0,
          popularQueries: popularQueries.map(item => ({
            query: item.searchQuery,
            count: item._count.id,
          })),
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to get search analytics',
          cause: error,
        })
      }
    }),
})

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  return distance
}

/**
 * Get order by clause for Healthier SG clinic search
 */
function getHealthierSGOrderByClause(
  orderBy: string, 
  orderDirection: 'asc' | 'desc'
): Prisma.ClinicOrderByWithRelationInput {
  switch (orderBy) {
    case 'distance':
      // For distance ordering, we'll calculate in the application layer
      return { name: orderDirection }
    case 'rating':
      // This would require joining with reviews table
      return { name: orderDirection }
    case 'capacity':
      // Order by capacity utilization (simplified)
      return { name: orderDirection }
    case 'accreditation':
      // Order by accreditation level (simplified)
      return { name: orderDirection }
    case 'name':
    default:
      return { name: orderDirection }
  }
}

/**
 * Get order by clause for different sorting options
 */
function getOrderByClause(
  orderBy: string, 
  orderDirection: 'asc' | 'desc', 
  hasLocation: boolean
): Prisma.ClinicOrderByWithRelationInput {
  switch (orderBy) {
    case 'distance':
      // For distance ordering, we'll calculate in the application layer
      return hasLocation ? { name: orderDirection } : { name: orderDirection }
    case 'rating':
      // This would require joining with reviews table
      return { name: orderDirection }
    case 'name':
      return { name: orderDirection }
    case 'relevance':
    default:
      return { name: orderDirection }
  }
}