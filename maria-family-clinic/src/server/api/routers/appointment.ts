import { z } from 'zod'
import { createTRPCRouter, publicProcedure, protectedProcedure, staffProcedure, calculatePagination } from '../trpc'
import { TRPCError } from '@trpc/server'
import { Prisma } from '@prisma/client'
import { addMinutes } from 'date-fns'

const appointmentSelect = {
  id: true,
  appointmentDate: true,
  status: true,
  notes: true,
  symptoms: true,
  isUrgent: true,
  createdAt: true,
  updatedAt: true,
  clinic: {
    select: {
      id: true,
      name: true,
      address: true,
      phone: true,
    },
  },
  doctor: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      profile: {
        select: {
          photo: true,
          bio: true,
        },
      },
    },
  },
  service: {
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      duration: true,
    },
  },
  patient: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
      email: true,
    },
  },
}

/**
 * Appointment Router - Handles all appointment-related operations
 */
export const appointmentRouter = createTRPCRouter({
  /**
   * Get all appointments with pagination and filtering
   */
  getAll: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(10),
        status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
        clinicId: z.string().uuid().optional(),
        doctorId: z.string().uuid().optional(),
        patientId: z.string().uuid().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        isUrgent: z.boolean().optional(),
        orderBy: z.enum(['appointmentDate', 'createdAt', 'status']).default('appointmentDate'),
        orderDirection: z.enum(['asc', 'desc']).default('asc'),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, status, clinicId, doctorId, patientId, startDate, endDate, isUrgent, orderBy, orderDirection } = input
      const skip = (page - 1) * limit

      // Build where clause
      const where: Prisma.AppointmentWhereInput = {}

      if (status) {
        where.status = status
      }

      if (clinicId) {
        where.clinicId = clinicId
      }

      if (doctorId) {
        where.doctorId = doctorId
      }

      if (patientId) {
        where.patientId = patientId
      }

      if (startDate) {
        where.appointmentDate = {
          ...where.appointmentDate,
          gte: startDate,
        }
      }

      if (endDate) {
        where.appointmentDate = {
          ...where.appointmentDate,
          lte: endDate,
        }
      }

      if (isUrgent !== undefined) {
        where.isUrgent = isUrgent
      }

      // Build orderBy clause
      let orderByClause: Prisma.AppointmentOrderByWithRelationInput = {}
      if (orderBy === 'appointmentDate') {
        orderByClause = { appointmentDate: orderDirection }
      } else if (orderBy === 'createdAt') {
        orderByClause = { createdAt: orderDirection }
      } else if (orderBy === 'status') {
        orderByClause = { status: orderDirection }
      }

      try {
        // Get appointments with pagination
        const [appointments, total] = await Promise.all([
          ctx.prisma.appointment.findMany({
            where,
            select: appointmentSelect,
            skip,
            take: limit,
            orderBy: orderByClause,
          }),
          ctx.prisma.appointment.count({ where }),
        ])

        return {
          data: appointments,
          pagination: calculatePagination(page, limit, total),
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch appointments',
          cause: error,
        })
      }
    }),

  /**
   * Get a single appointment by ID
   */
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const appointment = await ctx.prisma.appointment.findUnique({
          where: { id: input.id },
          select: appointmentSelect,
        })

        if (!appointment) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Appointment not found',
          })
        }

        // Check if user has permission to view this appointment
        const userRole = ctx.session.user.role
        const isOwner = appointment.patient.id === ctx.session.user.id
        const hasClinicAccess = await ctx.prisma.clinic.findFirst({
          where: {
            id: appointment.clinic.id,
            userId: ctx.session.user.id,
          },
        })

        if (userRole === 'USER' && !isOwner) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You can only view your own appointments',
          })
        }

        if (userRole === 'STAFF' && !hasClinicAccess) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You can only view appointments for your clinic',
          })
        }

        return appointment
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch appointment',
          cause: error,
        })
      }
    }),

  /**
   * Get user's appointments
   */
  getMyAppointments: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(20).default(10),
        status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
        upcomingOnly: z.boolean().default(false),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, status, upcomingOnly } = input
      const skip = (page - 1) * limit

      const where: Prisma.AppointmentWhereInput = {
        patientId: ctx.session.user.id,
        ...(status ? { status } : {}),
        ...(upcomingOnly
          ? {
              appointmentDate: {
                gte: new Date(),
              },
              status: {
                not: 'CANCELLED',
              },
            }
          : {}),
      }

      try {
        const [appointments, total] = await Promise.all([
          ctx.prisma.appointment.findMany({
            where,
            select: appointmentSelect,
            skip,
            take: limit,
            orderBy: {
              appointmentDate: 'asc',
            },
          }),
          ctx.prisma.appointment.count({ where }),
        ])

        return {
          data: appointments,
          pagination: calculatePagination(page, limit, total),
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch your appointments',
          cause: error,
        })
      }
    }),

  /**
   * Create a new appointment
   */
  create: protectedProcedure
    .input(
      z.object({
        clinicId: z.string().uuid(),
        doctorId: z.string().uuid(),
        serviceId: z.string().uuid(),
        appointmentDate: z.date(),
        symptoms: z.string().optional(),
        notes: z.string().optional(),
        isUrgent: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { clinicId, doctorId, serviceId, appointmentDate, symptoms, notes, isUrgent } = input

      try {
        // Validate that the appointment time is not in the past
        if (appointmentDate <= new Date()) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Appointment date must be in the future',
          })
        }

        // Get service details to validate duration
        const service = await ctx.prisma.service.findUnique({
          where: { id: serviceId },
          select: { duration: true, name: true },
        })

        if (!service) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Service not found',
          })
        }

        // Check for appointment conflicts
        const conflictingAppointments = await ctx.prisma.appointment.findMany({
          where: {
            doctorId,
            appointmentDate: {
              gte: appointmentDate,
              lt: addMinutes(appointmentDate, service.duration),
            },
            status: {
              not: 'CANCELLED',
            },
          },
        })

        if (conflictingAppointments.length > 0) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'The selected time slot is already booked',
          })
        }

        // Verify clinic-doctor relationship
        const clinicDoctorRelationship = await ctx.prisma.doctor.findFirst({
          where: {
            id: doctorId,
            clinics: {
              some: {
                id: clinicId,
              },
            },
          },
        })

        if (!clinicDoctorRelationship) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Doctor does not work at the selected clinic',
          })
        }

        // Verify service is offered at clinic
        const clinicService = await ctx.prisma.clinic.findFirst({
          where: {
            id: clinicId,
            services: {
              some: {
                id: serviceId,
              },
            },
          },
        })

        if (!clinicService) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Service is not offered at the selected clinic',
          })
        }

        // Create appointment
        const appointment = await ctx.prisma.appointment.create({
          data: {
            clinicId,
            doctorId,
            serviceId,
            patientId: ctx.session.user.id,
            appointmentDate,
            symptoms,
            notes,
            isUrgent,
            status: 'PENDING',
          },
          select: appointmentSelect,
        })

        return appointment
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to create appointment',
          cause: error,
        })
      }
    }),

  /**
   * Update appointment status
   */
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, status, notes } = input

      try {
        const appointment = await ctx.prisma.appointment.findUnique({
          where: { id },
          select: {
            id: true,
            patientId: true,
            clinic: {
              select: {
                userId: true,
              },
            },
          },
        })

        if (!appointment) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Appointment not found',
          })
        }

        // Check permissions
        const userRole = ctx.session.user.role
        const isOwner = appointment.patientId === ctx.session.user.id
        const hasClinicAccess = appointment.clinic.userId === ctx.session.user.id

        if (userRole === 'USER' && !isOwner) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You can only update your own appointments',
          })
        }

        if (userRole === 'STAFF' && !hasClinicAccess) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You can only update appointments for your clinic',
          })
        }

        // Additional validation for status changes
        const currentAppointment = await ctx.prisma.appointment.findUnique({
          where: { id },
          select: { status: true, appointmentDate: true },
        })

        if (!currentAppointment) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Appointment not found',
          })
        }

        // Prevent changing completed/cancelled appointments
        if (['COMPLETED', 'CANCELLED'].includes(currentAppointment.status)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Cannot update status of completed or cancelled appointments',
          })
        }

        // Update appointment
        const updatedAppointment = await ctx.prisma.appointment.update({
          where: { id },
          data: {
            status,
            ...(notes ? { notes } : {}),
          },
          select: appointmentSelect,
        })

        return updatedAppointment
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to update appointment status',
          cause: error,
        })
      }
    }),

  /**
   * Cancel appointment
   */
  cancel: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, reason } = input

      try {
        const appointment = await ctx.prisma.appointment.findUnique({
          where: { id },
          select: {
            id: true,
            patientId: true,
            appointmentDate: true,
            status: true,
            clinic: {
              select: {
                userId: true,
              },
            },
          },
        })

        if (!appointment) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Appointment not found',
          })
        }

        // Check permissions (similar to updateStatus)
        const userRole = ctx.session.user.role
        const isOwner = appointment.patientId === ctx.session.user.id
        const hasClinicAccess = appointment.clinic.userId === ctx.session.user.id

        if (userRole === 'USER' && !isOwner) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You can only cancel your own appointments',
          })
        }

        // Check if appointment can be cancelled
        if (appointment.status === 'CANCELLED') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Appointment is already cancelled',
          })
        }

        if (appointment.status === 'COMPLETED') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Cannot cancel completed appointments',
          })
        }

        // Prevent cancellation if appointment is within 24 hours (except for urgent cases)
        const hoursUntilAppointment = (appointment.appointmentDate.getTime() - new Date().getTime()) / (1000 * 60 * 60)
        if (hoursUntilAppointment < 24 && userRole === 'USER') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Appointments can only be cancelled at least 24 hours in advance. Please contact the clinic directly.',
          })
        }

        // Cancel appointment
        await ctx.prisma.appointment.update({
          where: { id },
          data: {
            status: 'CANCELLED',
            ...(reason ? { notes: reason } : {}),
          },
        })

        return { success: true }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to cancel appointment',
          cause: error,
        })
      }
    }),

  /**
   * Get appointment statistics (admin/staff only)
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      const userRole = ctx.session.user.role

      let clinicFilter = {}
      if (userRole === 'STAFF') {
        const userClinics = await ctx.prisma.clinic.findMany({
          where: { userId: ctx.session.user.id },
          select: { id: true },
        })
        clinicFilter = { clinicId: { in: userClinics.map(c => c.id) } }
      }

      const [total, pending, confirmed, completed, cancelled, today, upcoming] = await Promise.all([
        ctx.prisma.appointment.count({ where: clinicFilter }),
        ctx.prisma.appointment.count({ where: { ...clinicFilter, status: 'PENDING' } }),
        ctx.prisma.appointment.count({ where: { ...clinicFilter, status: 'CONFIRMED' } }),
        ctx.prisma.appointment.count({ where: { ...clinicFilter, status: 'COMPLETED' } }),
        ctx.prisma.appointment.count({ where: { ...clinicFilter, status: 'CANCELLED' } }),
        ctx.prisma.appointment.count({
          where: {
            ...clinicFilter,
            appointmentDate: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lt: new Date(new Date().setHours(23, 59, 59, 999)),
            },
          },
        }),
        ctx.prisma.appointment.count({
          where: {
            ...clinicFilter,
            appointmentDate: {
              gte: new Date(),
            },
            status: {
              not: 'CANCELLED',
            },
          },
        }),
      ])

      return {
        total,
        pending,
        confirmed,
        completed,
        cancelled,
        today,
        upcoming,
      }
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch appointment statistics',
        cause: error,
      })
    }
  }),

  /**
   * Get daily schedule for a clinic (staff/admin only)
   */
  getDailySchedule: protectedProcedure
    .input(
      z.object({
        clinicId: z.string().uuid(),
        date: z.date(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { clinicId, date } = input

      try {
        // Verify clinic access
        const clinic = await ctx.prisma.clinic.findFirst({
          where: {
            id: clinicId,
            OR: [
              { userId: ctx.session.user.id },
              { /* Admin has access to all clinics */ },
            ],
          },
        })

        if (!clinic) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have access to this clinic',
          })
        }

        // Get appointments for the day
        const startOfDay = new Date(date)
        startOfDay.setHours(0, 0, 0, 0)
        const endOfDay = new Date(date)
        endOfDay.setHours(23, 59, 59, 999)

        const appointments = await ctx.prisma.appointment.findMany({
          where: {
            clinicId,
            appointmentDate: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          select: appointmentSelect,
          orderBy: {
            appointmentDate: 'asc',
          },
        })

        // Group by status for easier consumption
        const schedule = {
          date: date.toISOString().split('T')[0],
          appointments,
          summary: {
            total: appointments.length,
            pending: appointments.filter(a => a.status === 'PENDING').length,
            confirmed: appointments.filter(a => a.status === 'CONFIRMED').length,
            completed: appointments.filter(a => a.status === 'COMPLETED').length,
            cancelled: appointments.filter(a => a.status === 'CANCELLED').length,
          },
        }

        return schedule
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch daily schedule',
          cause: error,
        })
      }
    }),
})