import { z } from 'zod'
import { createTRPCRouter, publicProcedure, protectedProcedure, staffProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { Prisma } from '@prisma/client'

/**
 * Input validation schemas
 */
const scheduleConflictSchema = z.object({
  doctorId: z.string().uuid(),
  startDate: z.date(),
  endDate: z.date(),
  includeTravelTime: z.boolean().default(true),
})

const scheduleSlotSchema = z.object({
  doctorId: z.string().uuid(),
  clinicId: z.string().uuid(),
  date: z.date(),
  startTime: z.string(), // "HH:mm" format
  endTime: z.string(),   // "HH:mm" format
  isRecurring: z.boolean().default(false),
  recurringPattern: z.object({
    frequency: z.enum(['WEEKLY', 'MONTHLY']).default('WEEKLY'),
    interval: z.number().default(1), // Every N weeks/months
    daysOfWeek: z.array(z.string()).optional(),
    endDate: z.date().optional(),
  }).optional(),
  appointmentType: z.enum(['CONSULTATION', 'PROCEDURE', 'EMERGENCY', 'ADMIN', 'TRAINING']).default('CONSULTATION'),
  notes: z.string().optional(),
})

const coverageRequestSchema = z.object({
  doctorId: z.string().uuid(),
  clinicId: z.string().uuid(),
  startDate: z.date(),
  endDate: z.date(),
  leaveType: z.enum(['ANNUAL', 'SICK', 'EMERGENCY', 'CONFERENCE', 'MATERNITY', 'PATERNITY']).default('ANNUAL'),
  reason: z.string(),
  requireCoverage: z.boolean().default(true),
  coveragePriority: z.enum(['HIGH', 'MEDIUM', 'LOW']).default('MEDIUM'),
})

const travelTimeSchema = z.object({
  doctorId: z.string().uuid(),
  date: z.date(),
  appointments: z.array(z.object({
    clinicId: z.string().uuid(),
    startTime: z.string(),
    endTime: z.string(),
  })),
})

/**
 * Doctor Schedule Router
 * Handles multi-clinic schedule management, conflict detection, and travel time calculation
 */
export const doctorScheduleRouter = createTRPCRouter({
  /**
   * Get doctor's complete schedule across all clinics
   */
  getDoctorSchedule: publicProcedure
    .input(
      z.object({
        doctorId: z.string().uuid(),
        startDate: z.date(),
        endDate: z.date(),
        clinicId: z.string().uuid().optional(),
        includeAppointments: z.boolean().default(true),
        includeAvailability: z.boolean().default(true),
        includeLeaves: z.boolean().default(true),
      })
    )
    .query(async ({ ctx, input }) => {
      const { doctorId, startDate, endDate, clinicId, includeAppointments, includeAvailability, includeLeaves } = input

      try {
        // Get doctor's clinic affiliations
        const affiliations = await ctx.prisma.doctorClinic.findMany({
          where: {
            doctorId,
            ...(clinicId && { clinicId }),
            verificationStatus: 'VERIFIED',
          },
          select: {
            id: true,
            clinicId: true,
            role: true,
            clinic: {
              select: {
                id: true,
                name: true,
                address: true,
                postalCode: true,
                location: true, // PostGIS point
              },
            },
          },
        })

        if (affiliations.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Doctor has no verified clinic affiliations',
          })
        }

        const affiliationIds = affiliations.map(a => a.id)

        // Get schedules
        const schedules = await ctx.prisma.doctorSchedule.findMany({
          where: {
            doctorId,
            doctorClinicId: { in: affiliationIds },
            OR: [
              {
                specificDate: {
                  gte: startDate,
                  lte: endDate,
                },
              },
              {
                dayOfWeek: {
                  in: getDaysOfWeekInRange(startDate, endDate),
                },
                isRecurring: true,
                isActive: true,
              },
            ],
          },
          include: {
            doctorClinic: {
              include: {
                clinic: true,
              },
            },
          },
          orderBy: [
            { specificDate: 'asc' },
            { dayOfWeek: 'asc' },
          ],
        })

        // Get appointments if requested
        let appointments = []
        if (includeAppointments) {
          appointments = await ctx.prisma.appointment.findMany({
            where: {
              doctorId,
              appointmentDate: {
                gte: startDate,
                lte: endDate,
              },
              status: {
                not: 'CANCELLED',
              },
              ...(clinicId && { clinicId }),
            },
            include: {
              clinic: {
                select: {
                  id: true,
                  name: true,
                  address: true,
                },
              },
              service: {
                select: {
                  id: true,
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
            orderBy: {
              appointmentDate: 'asc',
              startTime: 'asc',
            },
          })
        }

        // Get availability if requested
        let availability = []
        if (includeAvailability) {
          availability = await ctx.prisma.doctorAvailability.findMany({
            where: {
              doctorId,
              date: {
                gte: startDate,
                lte: endDate,
              },
              status: 'ACTIVE',
              ...(clinicId && { clinicId }),
            },
            include: {
              clinic: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
            orderBy: [
              { date: 'asc' },
              { startTime: 'asc' },
            ],
          })
        }

        // Get leaves if requested
        let leaves = []
        if (includeLeaves) {
          leaves = await ctx.prisma.doctorLeave.findMany({
            where: {
              doctorId,
              startDate: {
                lte: endDate,
              },
              endDate: {
                gte: startDate,
              },
              status: 'APPROVED',
              ...(clinicId && { doctorClinicId: { in: affiliationIds } }),
            },
            include: {
              doctorClinic: {
                include: {
                  clinic: true,
                },
              },
            },
            orderBy: {
              startDate: 'asc',
            },
          })
        }

        // Calculate travel times between clinics
        const scheduleWithTravel = await calculateTravelTimes(
          schedules,
          appointments,
          affiliations,
          startDate,
          endDate
        )

        return {
          schedules: scheduleWithTravel,
          appointments,
          availability,
          leaves,
          affiliations,
          summary: {
            totalScheduledHours: calculateTotalScheduledHours(schedules, appointments),
            clinicVisits: calculateClinicVisits(schedules, appointments),
            busyDays: calculateBusyDays(schedules, appointments),
            coverageNeeded: leaves.length > 0,
          },
        }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch doctor schedule',
          cause: error,
        })
      }
    }),

  /**
   * Detect schedule conflicts for a doctor
   */
  detectConflicts: publicProcedure
    .input(scheduleConflictSchema)
    .query(async ({ ctx, input }) => {
      const { doctorId, startDate, endDate, includeTravelTime } = input

      try {
        // Get all schedule items for the date range
        const [schedules, appointments, leaves] = await Promise.all([
          ctx.prisma.doctorSchedule.findMany({
            where: {
              doctorId,
              OR: [
                {
                  specificDate: {
                    gte: startDate,
                    lte: endDate,
                  },
                },
                {
                  dayOfWeek: {
                    in: getDaysOfWeekInRange(startDate, endDate),
                  },
                  isRecurring: true,
                  isActive: true,
                },
              ],
            },
            include: {
              doctorClinic: {
                include: {
                  clinic: true,
                },
              },
            },
          }),
          ctx.prisma.appointment.findMany({
            where: {
              doctorId,
              appointmentDate: {
                gte: startDate,
                lte: endDate,
              },
              status: {
                not: 'CANCELLED',
              },
            },
            include: {
              clinic: true,
            },
            orderBy: {
              appointmentDate: 'asc',
              startTime: 'asc',
            },
          }),
          ctx.prisma.doctorLeave.findMany({
            where: {
              doctorId,
              startDate: {
                lte: endDate,
              },
              endDate: {
                gte: startDate,
              },
              status: 'APPROVED',
            },
          }),
        ])

        const conflicts: Array<{
          type: 'OVERLAP' | 'TRAVEL_TIME' | 'LEAVE_CONFLICT' | 'GAP'
          severity: 'HIGH' | 'MEDIUM' | 'LOW'
          description: string
          date: Date
          items: any[]
          resolution?: string
        }> = []

        // Check for overlapping schedules
        const scheduleConflicts = detectScheduleOverlaps(schedules)
        conflicts.push(...scheduleConflicts)

        // Check for appointment overlaps
        const appointmentConflicts = detectAppointmentOverlaps(appointments)
        conflicts.push(...appointmentConflicts)

        // Check for leave conflicts
        const leaveConflicts = detectLeaveConflicts(schedules, appointments, leaves)
        conflicts.push(...leaveConflicts)

        // Check for travel time issues
        if (includeTravelTime) {
          const travelConflicts = await detectTravelTimeConflicts(ctx.prisma, appointments, startDate, endDate)
          conflicts.push(...travelConflicts)
        }

        // Check for gaps in schedule
        const gapConflicts = detectScheduleGaps(schedules, appointments)
        conflicts.push(...gapConflicts)

        // Calculate conflict severity and resolutions
        const enrichedConflicts = conflicts.map(conflict => ({
          ...conflict,
          priority: calculateConflictPriority(conflict),
          impact: calculateConflictImpact(conflict),
          resolution: generateResolutionSuggestion(conflict),
        }))

        return {
          conflicts: enrichedConflicts,
          summary: {
            totalConflicts: conflicts.length,
            highSeverity: conflicts.filter(c => c.severity === 'HIGH').length,
            mediumSeverity: conflicts.filter(c => c.severity === 'MEDIUM').length,
            lowSeverity: conflicts.filter(c => c.severity === 'LOW').length,
          },
          recommendations: generateScheduleRecommendations(conflicts),
        }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to detect schedule conflicts',
          cause: error,
        })
      }
    }),

  /**
   * Create or update doctor schedule
   */
  upsertSchedule: staffProcedure
    .input(scheduleSlotSchema)
    .mutation(async ({ ctx, input }) => {
      const { doctorId, clinicId, date, startTime, endTime, isRecurring, recurringPattern, appointmentType, notes } = input

      try {
        // Verify doctor affiliation with clinic
        const affiliation = await ctx.prisma.doctorClinic.findFirst({
          where: {
            doctorId,
            clinicId,
            verificationStatus: 'VERIFIED',
          },
        })

        if (!affiliation) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Doctor not properly affiliated with clinic',
          })
        }

        // Check for conflicts
        const conflicts = await checkScheduleConflicts(ctx.prisma, doctorId, clinicId, date, startTime, endTime)
        if (conflicts.hasConflicts) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Schedule conflict detected',
            cause: conflicts,
          })
        }

        // Create or update schedule
        const scheduleData = {
          doctorId,
          doctorClinicId: affiliation.id,
          scheduleType: isRecurring ? 'RECURRING' : 'SPECIFIC',
          startTime,
          endTime,
          isRecurring,
          recurrencePattern: isRecurring ? recurringPattern : null,
          notes,
        }

        let schedule
        if (isRecurring) {
          schedule = await ctx.prisma.doctorSchedule.create({
            data: {
              ...scheduleData,
              dayOfWeek: new Date(date).toLocaleDateString('en-US', { weekday: 'lowercase' }),
              effectiveFrom: date,
              effectiveTo: recurringPattern?.endDate,
            },
          })
        } else {
          schedule = await ctx.prisma.doctorSchedule.create({
            data: {
              ...scheduleData,
              specificDate: date,
            },
          })
        }

        return schedule
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to create/update schedule',
          cause: error,
        })
      }
    }),

  /**
   * Get coverage arrangements for leave
   */
  getCoverageArrangement: publicProcedure
    .input(
      z.object({
        doctorId: z.string().uuid(),
        clinicId: z.string().uuid(),
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { doctorId, clinicId, startDate, endDate } = input

      try {
        // Find substitute doctors
        const substituteDoctors = await ctx.prisma.doctor.findMany({
          where: {
            id: { not: doctorId },
            isActive: true,
            doctorClinicAffiliations: {
              some: {
                clinicId,
                verificationStatus: 'VERIFIED',
              },
            },
          },
          select: {
            id: true,
            name: true,
            specialties: true,
            languages: true,
            experienceYears: true,
            rating: true,
            doctorClinicAffiliations: {
              where: { clinicId },
              select: {
                id: true,
                capacity: true,
                consultationDuration: true,
                clinicRating: true,
              },
            },
          },
        })

        // Get existing leaves for the date range
        const leaves = await ctx.prisma.doctorLeave.findMany({
          where: {
            doctorId,
            startDate: { lte: endDate },
            endDate: { gte: startDate },
            status: 'APPROVED',
          },
        })

        // Get original doctor's schedule for the period
        const originalSchedule = await ctx.prisma.doctorSchedule.findMany({
          where: {
            doctorId,
            doctorClinicId: {
              in: await ctx.prisma.doctorClinic.findMany({
                where: { clinicId },
                select: { id: true },
              }).then(r => r.map(d => d.id)),
            },
            OR: [
              {
                specificDate: {
                  gte: startDate,
                  lte: endDate,
                },
              },
              {
                dayOfWeek: {
                  in: getDaysOfWeekInRange(startDate, endDate),
                },
                isRecurring: true,
                isActive: true,
              },
            ],
          },
        })

        // Calculate coverage recommendations
        const coveragePlan = createCoveragePlan(
          substituteDoctors,
          originalSchedule,
          startDate,
          endDate
        )

        return {
          coveragePlan,
          substituteDoctors,
          originalSchedule,
          leavePeriod: {
            startDate,
            endDate,
            totalDays: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1,
          },
        }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to get coverage arrangement',
          cause: error,
        })
      }
    }),

  /**
   * Get travel time calculations between clinic appointments
   */
  calculateTravelTimes: publicProcedure
    .input(travelTimeSchema)
    .query(async ({ ctx, input }) => {
      const { doctorId, date, appointments } = input

      try {
        if (appointments.length < 2) {
          return {
            travelTimes: [],
            totalTravelTime: 0,
            feasible: true,
          }
        }

        // Get clinic locations
        const clinicIds = [...new Set(appointments.map(a => a.clinicId))]
        const clinics = await ctx.prisma.clinic.findMany({
          where: { id: { in: clinicIds } },
          select: {
            id: true,
            name: true,
            address: true,
            postalCode: true,
            location: true,
          },
        })

        // Sort appointments by time
        const sortedAppointments = appointments
          .map(apt => ({
            ...apt,
            clinic: clinics.find(c => c.id === apt.clinicId),
          }))
          .sort((a, b) => {
            const aTime = timeToMinutes(a.startTime)
            const bTime = timeToMinutes(b.startTime)
            return aTime - bTime
          })

        // Calculate travel times between consecutive appointments
        const travelTimes: Array<{
          fromClinic: string
          toClinic: string
          travelTime: number // minutes
          feasible: boolean
          bufferTime: number // minutes between appointments
        }> = []

        let totalTravelTime = 0

        for (let i = 0; i < sortedAppointments.length - 1; i++) {
          const current = sortedAppointments[i]
          const next = sortedAppointments[i + 1]

          const travelTime = calculateDistanceTravelTime(
            current.clinic,
            next.clinic
          )

          const bufferTime = timeToMinutes(next.startTime) - timeToMinutes(current.endTime)
          const feasible = bufferTime >= travelTime

          travelTimes.push({
            fromClinic: current.clinicId,
            toClinic: next.clinicId,
            travelTime,
            feasible,
            bufferTime,
          })

          totalTravelTime += feasible ? travelTime : 0
        }

        const feasible = travelTimes.every(t => t.feasible)

        return {
          travelTimes,
          totalTravelTime,
          feasible,
          recommendations: generateTravelRecommendations(travelTimes),
        }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to calculate travel times',
          cause: error,
        })
      }
    }),

  /**
   * Create leave with automatic coverage arrangement
   */
  createLeaveWithCoverage: staffProcedure
    .input(coverageRequestSchema)
    .mutation(async ({ ctx, input }) => {
      const { doctorId, clinicId, startDate, endDate, leaveType, reason, requireCoverage } = input

      try {
        // Create the leave
        const leave = await ctx.prisma.doctorLeave.create({
          data: {
            doctorId,
            doctorClinicId: clinicId ? await ctx.prisma.doctorClinic.findFirst({
              where: { doctorId, clinicId },
              select: { id: true },
            }).then(r => r?.id) : null,
            leaveType,
            startDate,
            endDate,
            reason,
            isApproved: true,
            approvedAt: new Date(),
            status: 'APPROVED',
          },
        })

        if (!requireCoverage) {
          return { leave, coverage: null }
        }

        // Get coverage arrangement
        const coverage = await getCoverageArrangement(ctx, doctorId, clinicId, startDate, endDate)

        return { leave, coverage }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to create leave with coverage',
          cause: error,
        })
      }
    }),
})

/**
 * Helper functions for schedule management
 */

/**
 * Get days of week in a date range
 */
function getDaysOfWeekInRange(startDate: Date, endDate: Date): string[] {
  const days = new Set<string>()
  const current = new Date(startDate)
  
  while (current <= endDate) {
    days.add(current.toLocaleDateString('en-US', { weekday: 'lowercase' }))
    current.setDate(current.getDate() + 1)
  }
  
  return Array.from(days)
}

/**
 * Calculate travel times for schedules
 */
async function calculateTravelTimes(
  schedules: any[],
  appointments: any[],
  affiliations: any[],
  startDate: Date,
  endDate: Date
) {
  // This would integrate with Google Maps API or similar for real travel time calculation
  // For now, return schedules with mock travel time estimates
  return schedules.map(schedule => ({
    ...schedule,
    estimatedTravelTime: Math.floor(Math.random() * 60) + 15, // 15-75 minutes
  }))
}

/**
 * Calculate total scheduled hours
 */
function calculateTotalScheduledHours(schedules: any[], appointments: any[]): number {
  let totalHours = 0
  
  // Add schedule hours
  schedules.forEach(schedule => {
    const start = timeToMinutes(schedule.startTime)
    const end = timeToMinutes(schedule.endTime)
    totalHours += (end - start) / 60
  })
  
  // Add appointment hours
  appointments.forEach(appointment => {
    const start = timeToMinutes(appointment.startTime)
    const end = timeToMinutes(appointment.endTime)
    totalHours += (end - start) / 60
  })
  
  return Math.round(totalHours * 10) / 10
}

/**
 * Calculate clinic visits
 */
function calculateClinicVisits(schedules: any[], appointments: any[]): number {
  const clinicIds = new Set<string>()
  
  schedules.forEach(schedule => {
    clinicIds.add(schedule.doctorClinicId)
  })
  
  appointments.forEach(appointment => {
    clinicIds.add(appointment.clinicId)
  })
  
  return clinicIds.size
}

/**
 * Calculate busy days
 */
function calculateBusyDays(schedules: any[], appointments: any[]): number {
  const dates = new Set<string>()
  
  schedules.forEach(schedule => {
    if (schedule.specificDate) {
      dates.add(schedule.specificDate.toDateString())
    }
  })
  
  appointments.forEach(appointment => {
    dates.add(appointment.appointmentDate.toDateString())
  })
  
  return dates.size
}

/**
 * Detect schedule overlaps
 */
function detectScheduleOverlaps(schedules: any[]) {
  const conflicts: any[] = []
  const sortedSchedules = schedules.sort((a, b) => {
    const aDate = a.specificDate || getNextDateForDay(a.dayOfWeek)
    const bDate = b.specificDate || getNextDateForDay(b.dayOfWeek)
    return aDate.getTime() - bDate.getTime()
  })
  
  for (let i = 0; i < sortedSchedules.length - 1; i++) {
    const current = sortedSchedules[i]
    const next = sortedSchedules[i + 1]
    
    const currentEnd = timeToMinutes(current.endTime)
    const nextStart = timeToMinutes(next.startTime)
    
    if (currentEnd > nextStart) {
      conflicts.push({
        type: 'OVERLAP',
        severity: 'HIGH',
        description: `Schedule overlap between ${current.startTime}-${current.endTime} and ${next.startTime}-${next.endTime}`,
        date: current.specificDate || getNextDateForDay(current.dayOfWeek),
        items: [current, next],
        resolution: 'Adjust one of the schedule times',
      })
    }
  }
  
  return conflicts
}

/**
 * Detect appointment overlaps
 */
function detectAppointmentOverlaps(appointments: any[]) {
  const conflicts: any[] = []
  const sortedAppointments = appointments.sort((a, b) => {
    const aTime = a.appointmentDate.getTime() + timeToMinutes(a.startTime)
    const bTime = b.appointmentDate.getTime() + timeToMinutes(b.startTime)
    return aTime - bTime
  })
  
  for (let i = 0; i < sortedAppointments.length - 1; i++) {
    const current = sortedAppointments[i]
    const next = sortedAppointments[i + 1]
    
    const currentEnd = current.appointmentDate.getTime() + timeToMinutes(current.endTime)
    const nextStart = next.appointmentDate.getTime() + timeToMinutes(next.startTime)
    
    if (currentEnd > nextStart) {
      conflicts.push({
        type: 'OVERLAP',
        severity: 'HIGH',
        description: `Appointment overlap between ${current.startTime}-${current.endTime} and ${next.startTime}-${next.endTime}`,
        date: current.appointmentDate,
        items: [current, next],
        resolution: 'Reschedule one appointment',
      })
    }
  }
  
  return conflicts
}

/**
 * Detect leave conflicts
 */
function detectLeaveConflicts(schedules: any[], appointments: any[], leaves: any[]) {
  const conflicts: any[] = []
  
  leaves.forEach(leave => {
    // Check for schedules during leave
    const scheduleConflicts = schedules.filter(schedule => {
      const scheduleDate = schedule.specificDate || getNextDateForDay(schedule.dayOfWeek)
      return scheduleDate >= leave.startDate && scheduleDate <= leave.endDate
    })
    
    if (scheduleConflicts.length > 0) {
      conflicts.push({
        type: 'LEAVE_CONFLICT',
        severity: 'MEDIUM',
        description: `${scheduleConflicts.length} schedule(s) during leave period`,
        date: leave.startDate,
        items: [leave, ...scheduleConflicts],
        resolution: 'Reschedule or reassign coverage',
      })
    }
    
    // Check for appointments during leave
    const appointmentConflicts = appointments.filter(appointment => {
      return appointment.appointmentDate >= leave.startDate && appointment.appointmentDate <= leave.endDate
    })
    
    if (appointmentConflicts.length > 0) {
      conflicts.push({
        type: 'LEAVE_CONFLICT',
        severity: 'HIGH',
        description: `${appointmentConflicts.length} appointment(s) during leave period`,
        date: leave.startDate,
        items: [leave, ...appointmentConflicts],
        resolution: 'Arrange substitute doctor or reschedule',
      })
    }
  })
  
  return conflicts
}

/**
 * Detect travel time conflicts
 */
async function detectTravelTimeConflicts(prisma: any, appointments: any[], startDate: Date, endDate: Date) {
  const conflicts: any[] = []
  
  // Group appointments by date
  const appointmentsByDate = appointments.reduce((acc, appointment) => {
    const dateKey = appointment.appointmentDate.toDateString()
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(appointment)
    return acc
  }, {})
  
  for (const [dateKey, dayAppointments] of Object.entries(appointmentsByDate)) {
    if (dayAppointments.length < 2) continue
    
    const sortedAppointments = (dayAppointments as any[]).sort((a, b) => {
      return timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
    })
    
    for (let i = 0; i < sortedAppointments.length - 1; i++) {
      const current = sortedAppointments[i]
      const next = sortedAppointments[i + 1]
      
      if (current.clinicId !== next.clinicId) {
        const travelTime = 45 // Mock travel time
        const bufferTime = timeToMinutes(next.startTime) - timeToMinutes(current.endTime)
        
        if (bufferTime < travelTime) {
          conflicts.push({
            type: 'TRAVEL_TIME',
            severity: bufferTime < travelTime * 0.5 ? 'HIGH' : 'MEDIUM',
            description: `Insufficient travel time between ${current.clinic.name} and ${next.clinic.name}`,
            date: current.appointmentDate,
            items: [current, next],
            resolution: 'Adjust appointment times or reduce travel',
          })
        }
      }
    }
  }
  
  return conflicts
}

/**
 * Detect schedule gaps
 */
function detectScheduleGaps(schedules: any[], appointments: any[]) {
  const conflicts: any[] = []
  
  // Check for long gaps in daily schedule
  const schedulesByDate = schedules.reduce((acc, schedule) => {
    const dateKey = schedule.specificDate?.toDateString() || schedule.dayOfWeek
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(schedule)
    return acc
  }, {})
  
  for (const [date, dateSchedules] of Object.entries(schedulesByDate)) {
    const sorted = (dateSchedules as any[]).sort((a, b) => 
      timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
    )
    
    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i]
      const next = sorted[i + 1]
      
      const gap = timeToMinutes(next.startTime) - timeToMinutes(current.endTime)
      
      if (gap > 120) { // More than 2 hours gap
        conflicts.push({
          type: 'GAP',
          severity: gap > 240 ? 'LOW' : 'LOW',
          description: `Long gap between ${current.endTime} and ${next.startTime}`,
          date: current.specificDate || new Date(date),
          items: [current, next],
          resolution: 'Consider scheduling additional appointments',
        })
      }
    }
  }
  
  return conflicts
}

/**
 * Calculate conflict priority
 */
function calculateConflictPriority(conflict: any): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (conflict.severity === 'HIGH') return 'HIGH'
  if (conflict.type === 'TRAVEL_TIME') return 'MEDIUM'
  if (conflict.type === 'GAP') return 'LOW'
  return 'MEDIUM'
}

/**
 * Calculate conflict impact
 */
function calculateConflictImpact(conflict: any): string {
  switch (conflict.type) {
    case 'OVERLAP':
      return 'Cannot fulfill all scheduled commitments'
    case 'TRAVEL_TIME':
      return 'Risk of late arrivals or missed appointments'
    case 'LEAVE_CONFLICT':
      return 'Scheduled work during planned absence'
    case 'GAP':
      return 'Unutilized time slots'
    default:
      return 'Schedule optimization opportunity'
  }
}

/**
 * Generate resolution suggestion
 */
function generateResolutionSuggestion(conflict: any): string {
  switch (conflict.type) {
    case 'OVERLAP':
      return 'Reschedule one of the conflicting items or arrange coverage'
    case 'TRAVEL_TIME':
      return 'Adjust appointment times or arrange alternative transportation'
    case 'LEAVE_CONFLICT':
      return 'Assign substitute doctor or reschedule affected appointments'
    case 'GAP':
      return 'Consider booking additional appointments or adjusting hours'
    default:
      return 'Review and adjust schedule accordingly'
  }
}

/**
 * Generate schedule recommendations
 */
function generateScheduleRecommendations(conflicts: any[]): string[] {
  const recommendations: string[] = []
  
  const highConflicts = conflicts.filter(c => c.severity === 'HIGH')
  if (highConflicts.length > 0) {
    recommendations.push('Address high-severity conflicts immediately')
  }
  
  const travelConflicts = conflicts.filter(c => c.type === 'TRAVEL_TIME')
  if (travelConflicts.length > 3) {
    recommendations.push('Consider consolidating appointments at fewer clinics')
  }
  
  const overlapConflicts = conflicts.filter(c => c.type === 'OVERLAP')
  if (overlapConflicts.length > 0) {
    recommendations.push('Review and optimize daily schedule patterns')
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Schedule appears well-optimized')
  }
  
  return recommendations
}

/**
 * Convert time string to minutes
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * Get next date for a day of week
 */
function getNextDateForDay(dayOfWeek: string): Date {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const targetDay = days.indexOf(dayOfWeek)
  const today = new Date()
  const currentDay = today.getDay()
  const daysUntilTarget = (targetDay - currentDay + 7) % 7
  
  const result = new Date(today)
  result.setDate(today.getDate() + daysUntilTarget)
  return result
}

/**
 * Calculate distance-based travel time
 */
function calculateDistanceTravelTime(fromClinic: any, toClinic: any): number {
  // This would use actual distance calculation (Google Maps API, etc.)
  // For now, return a mock travel time based on postcode difference
  if (!fromClinic?.postalCode || !toClinic?.postalCode) {
    return 30 // Default 30 minutes
  }
  
  const fromCode = parseInt(fromClinic.postalCode.slice(0, 2))
  const toCode = parseInt(toClinic.postalCode.slice(0, 2))
  const distance = Math.abs(fromCode - toCode)
  
  // Rough estimate: 5 minutes per postal code difference
  return Math.max(15, distance * 5)
}

/**
 * Create coverage plan
 */
function createCoveragePlan(
  substituteDoctors: any[],
  originalSchedule: any[],
  startDate: Date,
  endDate: Date
) {
  const coverageDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
  
  return substituteDoctors.map(doctor => ({
    doctor,
    coverageDays: Math.min(coverageDays, 5), // Max 5 days per substitute
    priority: doctor.rating > 4 ? 'HIGH' : 'MEDIUM',
  })).sort((a, b) => b.doctor.rating - a.doctor.rating)
}

/**
 * Generate travel recommendations
 */
function generateTravelRecommendations(travelTimes: any[]): string[] {
  const recommendations: string[] = []
  
  const infeasibleTrips = travelTimes.filter(t => !t.feasible)
  if (infeasibleTrips.length > 0) {
    recommendations.push('Some clinic transfers have insufficient travel time')
    recommendations.push('Consider rescheduling appointments or arranging transportation')
  }
  
  if (travelTimes.length > 3) {
    recommendations.push('Multiple clinic visits scheduled - consider efficiency optimization')
  }
  
  return recommendations
}

/**
 * Check schedule conflicts
 */
async function checkScheduleConflicts(
  prisma: any,
  doctorId: string,
  clinicId: string,
  date: Date,
  startTime: string,
  endTime: string
) {
  const conflicts = await prisma.doctorSchedule.findMany({
    where: {
      doctorId,
      OR: [
        {
          specificDate: {
            gte: new Date(date.setHours(0, 0, 0, 0)),
            lte: new Date(date.setHours(23, 59, 59, 999)),
          },
        },
        {
          dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'lowercase' }),
          isRecurring: true,
          isActive: true,
        },
      ],
    },
  })
  
  const hasConflicts = conflicts.some(schedule => {
    const scheduleStart = timeToMinutes(schedule.startTime)
    const scheduleEnd = timeToMinutes(schedule.endTime)
    const newStart = timeToMinutes(startTime)
    const newEnd = timeToMinutes(endTime)
    
    return (newStart < scheduleEnd && newEnd > scheduleStart)
  })
  
  return { hasConflicts }
}

/**
 * Get coverage arrangement helper
 */
async function getCoverageArrangement(
  ctx: any,
  doctorId: string,
  clinicId: string,
  startDate: Date,
  endDate: Date
) {
  // This would implement the coverage arrangement logic
  return { substitutes: [], recommendations: [] }
}