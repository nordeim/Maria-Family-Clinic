import { z } from 'zod'
import { createTRPCRouter, publicProcedure, protectedProcedure, staffProcedure, calculatePagination } from '../trpc'
import { TRPCError } from '@trpc/server'
import { Prisma } from '@prisma/client'

/**
 * Comprehensive select clauses for doctor-clinic data
 */
const doctorClinicSelect = {
  id: true,
  doctorId: true,
  clinicId: true,
  role: true,
  capacity: true,
  isPrimary: true,
  workingDays: true,
  startTime: true,
  endTime: true,
  clinicSpecializations: true,
  primaryServices: true,
  consultationFee: true,
  consultationDuration: true,
  emergencyConsultationFee: true,
  clinicRating: true,
  clinicReviewCount: true,
  clinicPatientCount: true,
  appointmentTypes: true,
  walkInAllowed: true,
  advanceBookingDays: true,
  acceptedInsurance: true,
  medisaveAccepted: true,
  chasAccepted: true,
  verificationStatus: true,
  verificationDate: true,
  verificationNotes: true,
  startDate: true,
  endDate: true,
  createdAt: true,
  updatedAt: true,
  doctor: {
    select: {
      id: true,
      name: true,
      specialties: true,
      languages: true,
      qualifications: true,
      experienceYears: true,
      rating: true,
      reviewCount: true,
      profileImage: true,
      isActive: true,
      isVerified: true,
    },
  },
  clinic: {
    select: {
      id: true,
      name: true,
      address: true,
      phone: true,
      email: true,
      operatingHours: true,
    },
  },
}

const doctorWithAffiliationsSelect = {
  id: true,
  name: true,
  specialties: true,
  languages: true,
  qualifications: true,
  experienceYears: true,
  rating: true,
  reviewCount: true,
  profileImage: true,
  bio: true,
  isActive: true,
  isVerified: true,
  consultationFee: true,
  currency: true,
  doctorClinicAffiliations: {
    select: doctorClinicSelect,
  },
}

/**
 * Doctor-Clinic Integration Router
 * Handles doctor-clinic relationships, multi-affiliation data, and role tracking
 */
export const doctorClinicIntegrationRouter = createTRPCRouter({
  /**
   * Get all doctors with their clinic affiliations
   */
  getDoctorsWithAffiliations: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(10),
        search: z.string().optional(),
        specialties: z.array(z.string()).optional(),
        languages: z.array(z.string()).optional(),
        clinicId: z.string().uuid().optional(),
        role: z.enum(['ATTENDING', 'VISITING', 'LOCUM', 'CONSULTANT']).optional(),
        capacity: z.enum(['FULL_TIME', 'PART_TIME', 'HOURLY', 'ON_CALL']).optional(),
        isActive: z.boolean().optional(),
        isPrimary: z.boolean().optional(),
        orderBy: z.enum(['name', 'specialty', 'experience', 'rating', 'clinicCount']).default('name'),
        orderDirection: z.enum(['asc', 'desc']).default('asc'),
      })
    )
    .query(async ({ ctx, input }) => {
      const { 
        page, 
        limit, 
        search, 
        specialties, 
        languages, 
        clinicId, 
        role, 
        capacity, 
        isActive,
        isPrimary,
        orderBy, 
        orderDirection 
      } = input
      const skip = (page - 1) * limit

      // Build where clause for doctors
      const doctorWhere: Prisma.DoctorWhereInput = {}

      if (search) {
        doctorWhere.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { specialties: { hasSome: [search] } },
          { qualifications: { hasSome: [search] } },
        ]
      }

      if (specialties && specialties.length > 0) {
        doctorWhere.specialties = {
          hasSome: specialties,
        }
      }

      if (languages && languages.length > 0) {
        doctorWhere.languages = {
          hasSome: languages,
        }
      }

      if (isActive !== undefined) {
        doctorWhere.isActive = isActive
      }

      // Build where clause for doctor-clinic relationships
      const doctorClinicWhere: Prisma.DoctorClinicWhereInput = {}

      if (clinicId) {
        doctorClinicWhere.clinicId = clinicId
      }

      if (role) {
        doctorClinicWhere.role = role
      }

      if (capacity) {
        doctorClinicWhere.capacity = capacity
      }

      if (isPrimary !== undefined) {
        doctorClinicWhere.isPrimary = isPrimary
      }

      try {
        // Get doctors with their affiliations
        let orderByClause: any = {}

        if (orderBy === 'name') {
          orderByClause = { name: orderDirection }
        } else if (orderBy === 'specialty') {
          orderByClause = { specialties: { _array: orderDirection } }
        } else if (orderBy === 'experience') {
          orderByClause = { experienceYears: orderDirection }
        } else if (orderBy === 'rating') {
          orderByClause = { rating: orderDirection }
        } else if (orderBy === 'clinicCount') {
          // For clinic count, we'll sort in application layer
          orderByClause = { createdAt: orderDirection }
        }

        const [doctors, total] = await Promise.all([
          ctx.prisma.doctor.findMany({
            where: doctorWhere,
            select: doctorWithAffiliationsSelect,
            skip,
            take: limit,
            orderBy: orderByClause,
          }),
          ctx.prisma.doctor.count({
            where: doctorWhere,
          }),
        ])

        // Filter and enrich with clinic-specific filtering
        let filteredDoctors = doctors

        if (Object.keys(doctorClinicWhere).length > 0) {
          filteredDoctors = doctors.map(doctor => ({
            ...doctor,
            doctorClinicAffiliations: doctor.doctorClinicAffiliations.filter(affiliation => {
              if (doctorClinicWhere.role && affiliation.role !== doctorClinicWhere.role) return false
              if (doctorClinicWhere.capacity && affiliation.capacity !== doctorClinicWhere.capacity) return false
              if (doctorClinicWhere.isPrimary !== undefined && affiliation.isPrimary !== doctorClinicWhere.isPrimary) return false
              return true
            }),
          })).filter(doctor => doctor.doctorClinicAffiliations.length > 0)
        }

        // Sort by clinic count if requested
        if (orderBy === 'clinicCount') {
          filteredDoctors.sort((a, b) => {
            const aCount = a.doctorClinicAffiliations.length
            const bCount = b.doctorClinicAffiliations.length
            return orderDirection === 'asc' ? aCount - bCount : bCount - aCount
          })
        }

        return {
          data: filteredDoctors,
          pagination: calculatePagination(page, limit, total),
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch doctors with affiliations',
          cause: error,
        })
      }
    }),

  /**
   * Get a single doctor with all their clinic affiliations
   */
  getDoctorWithAffiliations: publicProcedure
    .input(
      z.object({
        doctorId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const doctor = await ctx.prisma.doctor.findUnique({
          where: { id: input.doctorId },
          select: doctorWithAffiliationsSelect,
        })

        if (!doctor) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Doctor not found',
          })
        }

        return doctor
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch doctor with affiliations',
          cause: error,
        })
      }
    }),

  /**
   * Get all doctors at a specific clinic
   */
  getClinicDoctors: publicProcedure
    .input(
      z.object({
        clinicId: z.string().uuid(),
        role: z.enum(['ATTENDING', 'VISITING', 'LOCUM', 'CONSULTANT']).optional(),
        capacity: z.enum(['FULL_TIME', 'PART_TIME', 'HOURLY', 'ON_CALL']).optional(),
        isPrimary: z.boolean().optional(),
        specialty: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { clinicId, role, capacity, isPrimary, specialty } = input

      try {
        const whereClause: Prisma.DoctorClinicWhereInput = {
          clinicId,
        }

        if (role) whereClause.role = role
        if (capacity) whereClause.capacity = capacity
        if (isPrimary !== undefined) whereClause.isPrimary = isPrimary

        const clinicDoctors = await ctx.prisma.doctorClinic.findMany({
          where: whereClause,
          select: doctorClinicSelect,
          orderBy: [
            { isPrimary: 'desc' },
            { createdAt: 'asc' },
          ],
        })

        // Filter by specialty if specified
        let filteredDoctors = clinicDoctors
        if (specialty) {
          filteredDoctors = clinicDoctors.filter(affiliation =>
            affiliation.doctor.specialties.includes(specialty)
          )
        }

        return filteredDoctors
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch clinic doctors',
          cause: error,
        })
      }
    }),

  /**
   * Create a new doctor-clinic affiliation
   */
  createAffiliation: staffProcedure
    .input(
      z.object({
        doctorId: z.string().uuid(),
        clinicId: z.string().uuid(),
        role: z.enum(['ATTENDING', 'VISITING', 'LOCUM', 'CONSULTANT']).default('ATTENDING'),
        capacity: z.enum(['FULL_TIME', 'PART_TIME', 'HOURLY', 'ON_CALL']).default('PART_TIME'),
        isPrimary: z.boolean().default(false),
        workingDays: z.array(z.string()).default([]),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
        clinicSpecializations: z.array(z.string()).default([]),
        primaryServices: z.array(z.string()).default([]),
        consultationFee: z.number().optional(),
        consultationDuration: z.number().optional(),
        emergencyConsultationFee: z.number().optional(),
        walkInAllowed: z.boolean().default(false),
        advanceBookingDays: z.number().default(7),
        medisaveAccepted: z.boolean().default(false),
        chasAccepted: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if affiliation already exists
        const existingAffiliation = await ctx.prisma.doctorClinic.findUnique({
          where: {
            doctorId_clinicId: {
              doctorId: input.doctorId,
              clinicId: input.clinicId,
            },
          },
        })

        if (existingAffiliation) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Doctor-clinic affiliation already exists',
          })
        }

        // If this is marked as primary, remove primary status from other affiliations
        if (input.isPrimary) {
          await ctx.prisma.doctorClinic.updateMany({
            where: {
              doctorId: input.doctorId,
              isPrimary: true,
            },
            data: {
              isPrimary: false,
            },
          })
        }

        const affiliation = await ctx.prisma.doctorClinic.create({
          data: input,
          select: doctorClinicSelect,
        })

        return affiliation
      } catch (error) {
        if (error instanceof TRPCError) throw error
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            throw new TRPCError({
              code: 'CONFLICT',
              message: 'Doctor-clinic affiliation already exists',
            })
          }
          if (error.code === 'P2003') {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Doctor or clinic not found',
            })
          }
        }
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to create affiliation',
          cause: error,
        })
      }
    }),

  /**
   * Update a doctor-clinic affiliation
   */
  updateAffiliation: staffProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        role: z.enum(['ATTENDING', 'VISITING', 'LOCUM', 'CONSULTANT']).optional(),
        capacity: z.enum(['FULL_TIME', 'PART_TIME', 'HOURLY', 'ON_CALL']).optional(),
        isPrimary: z.boolean().optional(),
        workingDays: z.array(z.string()).optional(),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
        clinicSpecializations: z.array(z.string()).optional(),
        primaryServices: z.array(z.string()).optional(),
        consultationFee: z.number().optional(),
        consultationDuration: z.number().optional(),
        emergencyConsultationFee: z.number().optional(),
        walkInAllowed: z.boolean().optional(),
        advanceBookingDays: z.number().optional(),
        acceptedInsurance: z.array(z.string()).optional(),
        medisaveAccepted: z.boolean().optional(),
        chasAccepted: z.boolean().optional(),
        endDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      try {
        const existingAffiliation = await ctx.prisma.doctorClinic.findUnique({
          where: { id },
        })

        if (!existingAffiliation) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Affiliation not found',
          })
        }

        // If setting as primary, remove primary status from other affiliations
        if (updateData.isPrimary) {
          await ctx.prisma.doctorClinic.updateMany({
            where: {
              doctorId: existingAffiliation.doctorId,
              isPrimary: true,
              id: { not: id },
            },
            data: {
              isPrimary: false,
            },
          })
        }

        const affiliation = await ctx.prisma.doctorClinic.update({
          where: { id },
          data: updateData,
          select: doctorClinicSelect,
        })

        return affiliation
      } catch (error) {
        if (error instanceof TRPCError) throw error
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Affiliation not found',
          })
        }
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to update affiliation',
          cause: error,
        })
      }
    }),

  /**
   * Delete a doctor-clinic affiliation
   */
  deleteAffiliation: staffProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const affiliation = await ctx.prisma.doctorClinic.findUnique({
          where: { id: input.id },
        })

        if (!affiliation) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Affiliation not found',
          })
        }

        // Check for future appointments at this clinic
        const futureAppointments = await ctx.prisma.appointment.count({
          where: {
            doctorId: affiliation.doctorId,
            clinicId: affiliation.clinicId,
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
            message: 'Cannot delete affiliation with future appointments',
          })
        }

        await ctx.prisma.doctorClinic.delete({
          where: { id: input.id },
        })

        return { success: true }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Affiliation not found',
          })
        }
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete affiliation',
          cause: error,
        })
      }
    }),

  /**
   * Get doctor affiliation statistics
   */
  getAffiliationStats: protectedProcedure
    .input(
      z.object({
        doctorId: z.string().uuid().optional(),
        clinicId: z.string().uuid().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { doctorId, clinicId } = input

      try {
        const whereClause: Prisma.DoctorClinicWhereInput = {}

        if (doctorId) whereClause.doctorId = doctorId
        if (clinicId) whereClause.clinicId = clinicId

        const [
          totalAffiliations,
          roleDistribution,
          capacityDistribution,
          primaryAffiliations,
        ] = await Promise.all([
          ctx.prisma.doctorClinic.count({ where: whereClause }),
          
          ctx.prisma.doctorClinic.groupBy({
            by: ['role'],
            where: whereClause,
            _count: { role: true },
          }),
          
          ctx.prisma.doctorClinic.groupBy({
            by: ['capacity'],
            where: whereClause,
            _count: { capacity: true },
          }),
          
          ctx.prisma.doctorClinic.count({
            where: { ...whereClause, isPrimary: true },
          }),
        ])

        return {
          totalAffiliations,
          primaryAffiliations,
          roleDistribution: roleDistribution.reduce((acc, item) => {
            acc[item.role] = item._count.role
            return acc
          }, {} as Record<string, number>),
          capacityDistribution: capacityDistribution.reduce((acc, item) => {
            acc[item.capacity] = item._count.capacity
            return acc
          }, {} as Record<string, number>),
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch affiliation statistics',
          cause: error,
        })
      }
    }),

  /**
   * Search doctors across multiple clinics
   */
  searchDoctorsAcrossClinics: publicProcedure
    .input(
      z.object({
        query: z.string(),
        clinicIds: z.array(z.string().uuid()).optional(),
        specialties: z.array(z.string()).optional(),
        languages: z.array(z.string()).optional(),
        maxResults: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const { query, clinicIds, specialties, languages, maxResults } = input

      try {
        // Build where clause for doctors
        const doctorWhere: Prisma.DoctorWhereInput = {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { specialties: { hasSome: [query] } },
            { qualifications: { hasSome: [query] } },
            { bio: { contains: query, mode: 'insensitive' } },
          ],
        }

        if (specialties && specialties.length > 0) {
          doctorWhere.specialties = {
            hasSome: specialties,
          }
        }

        if (languages && languages.length > 0) {
          doctorWhere.languages = {
            hasSome: languages,
          }
        }

        // Build where clause for affiliations
        const affiliationWhere: Prisma.DoctorClinicWhereInput = {}
        if (clinicIds && clinicIds.length > 0) {
          affiliationWhere.clinicId = {
            in: clinicIds,
          }
        }

        const doctors = await ctx.prisma.doctor.findMany({
          where: {
            ...doctorWhere,
            doctorClinicAffiliations: {
              some: Object.keys(affiliationWhere).length > 0 ? affiliationWhere : undefined,
            },
          },
          select: {
            ...doctorWithAffiliationsSelect,
            doctorClinicAffiliations: {
              where: Object.keys(affiliationWhere).length > 0 ? affiliationWhere : undefined,
              select: doctorClinicSelect,
            },
          },
          take: maxResults,
          orderBy: [
            { rating: 'desc' },
            { reviewCount: 'desc' },
          ],
        })

        return doctors.map(doctor => ({
          ...doctor,
          clinicCount: doctor.doctorClinicAffiliations.length,
          matchingScore: calculateMatchingScore(doctor, query),
        })).sort((a, b) => b.matchingScore - a.matchingScore)
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to search doctors across clinics',
          cause: error,
        })
      }
    }),
})

/**
 * Calculate matching score for search results
 */
function calculateMatchingScore(doctor: any, query: string): number {
  let score = 0
  const queryLower = query.toLowerCase()

  // Name match (highest score)
  if (doctor.name.toLowerCase().includes(queryLower)) {
    score += 10
  }

  // Specialty match
  doctor.specialties.forEach((specialty: string) => {
    if (specialty.toLowerCase().includes(queryLower)) {
      score += 8
    }
  })

  // Language match
  doctor.languages.forEach((language: string) => {
    if (language.toLowerCase().includes(queryLower)) {
      score += 5
    }
  })

  // Qualification match
  doctor.qualifications.forEach((qual: string) => {
    if (qual.toLowerCase().includes(queryLower)) {
      score += 3
    }
  })

  // Rating boost
  if (doctor.rating) {
    score += doctor.rating
  }

  // Clinic count boost
  score += Math.min(doctor.doctorClinicAffiliations.length * 2, 10)

  return score
}