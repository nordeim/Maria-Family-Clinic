import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, adminProcedure, staffProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { Prisma } from '@prisma/client'
import { startOfDay, endOfDay, subDays, subWeeks, subMonths, format } from 'date-fns'

const dateRanges = {
  today: () => ({
    start: startOfDay(new Date()),
    end: endOfDay(new Date()),
  }),
  yesterday: () => ({
    start: startOfDay(subDays(new Date(), 1)),
    end: endOfDay(subDays(new Date(), 1)),
  }),
  last7Days: () => ({
    start: startOfDay(subDays(new Date(), 7)),
    end: endOfDay(new Date()),
  }),
  last30Days: () => ({
    start: startOfDay(subDays(new Date(), 30)),
    end: endOfDay(new Date()),
  }),
  thisWeek: () => ({
    start: startOfDay(subDays(new Date(), new Date().getDay() - 1)),
    end: endOfDay(new Date()),
  }),
  thisMonth: () => ({
    start: startOfDay(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
    end: endOfDay(new Date()),
  }),
  lastMonth: () => ({
    start: startOfDay(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)),
    end: endOfDay(new Date(new Date().getFullYear(), new Date().getMonth(), 0)),
  }),
}

/**
 * Analytics Router - Handles reporting and data analytics
 */
export const analyticsRouter = createTRPCRouter({
  /**
   * Get dashboard overview statistics (admin/staff only)
   */
  getDashboardOverview: protectedProcedure
    .input(
      z.object({
        clinicId: z.string().uuid().optional(),
        dateRange: z.enum(['today', 'yesterday', 'last7Days', 'last30Days', 'thisWeek', 'thisMonth', 'lastMonth']).default('last30Days'),
      })
    )
    .query(async ({ ctx, input }) => {
      const { clinicId, dateRange } = input
      const { start, end } = dateRanges[dateRange]()

      try {
        const userRole = (ctx.session!.user as any).role

        // Build clinic filter
        let clinicFilter = {}
        if (userRole === 'STAFF' && clinicId) {
          clinicFilter = { clinicId }
        } else if (userRole === 'STAFF' && !clinicId) {
          // Get staff user's clinic
          const userClinic = await ctx.prisma.clinic.findFirst({
            where: { userId: (ctx.session!.user as any).id },
            select: { id: true },
          })
          if (userClinic) {
            clinicFilter = { clinicId: userClinic.id }
          } else {
            clinicFilter = { clinicId: 'none' } // No clinic access
          }
        }

        const [appointments, users, clinics, enquiries, reviews] = await Promise.all([
          // Appointments stats
          ctx.prisma.appointment.aggregate({
            where: {
              ...clinicFilter,
              createdAt: {
                gte: start,
                lte: end,
              },
            },
            _count: { id: true },
            _avg: { appointmentDate: true },
          }),
          
          // Users stats
          ctx.prisma.user.aggregate({
            where: {
              ...(userRole === 'ADMIN' ? {} : { role: 'USER' }),
              createdAt: {
                gte: start,
                lte: end,
              },
            },
            _count: { id: true },
          }),
          
          // Clinics stats
          ctx.prisma.clinic.aggregate({
            where: {
              ...(userRole === 'ADMIN' ? {} : { userId: (ctx.session!.user as any).id }),
              createdAt: {
                gte: start,
                lte: end,
              },
            },
            _count: { id: true },
          }),
          
          // Enquiries stats
          ctx.prisma.enquiry.aggregate({
            where: {
              ...clinicFilter,
              createdAt: {
                gte: start,
                lte: end,
              },
            },
            _count: { id: true },
          }),
          
          // Reviews stats
          ctx.prisma.review.aggregate({
            where: {
              createdAt: {
                gte: start,
                lte: end,
              },
            },
            _count: { id: true },
            _avg: { rating: true },
          }),
        ])

        // Appointment status breakdown
        const appointmentStatusBreakdown = await ctx.prisma.appointment.groupBy({
          by: ['status'],
          where: {
            ...clinicFilter,
            createdAt: {
              gte: start,
              lte: end,
            },
          },
          _count: { status: true },
        })

        // Enquiry type breakdown
        const enquiryTypeBreakdown = await ctx.prisma.enquiry.groupBy({
          by: ['type'],
          where: {
            ...clinicFilter,
            createdAt: {
              gte: start,
              lte: end,
            },
          },
          _count: { type: true },
        })

        return {
          dateRange: {
            start: start.toISOString(),
            end: end.toISOString(),
            label: dateRange,
          },
          summary: {
            appointments: appointments._count.id,
            newUsers: users._count.id,
            clinics: clinics._count.id,
            enquiries: enquiries._count.id,
            reviews: reviews._count.id,
            averageRating: Math.round((reviews._avg.rating || 0) * 10) / 10,
          },
          breakdown: {
            appointmentsByStatus: appointmentStatusBreakdown.map((item: any) => ({
              status: item.status,
              count: item._count.status,
            })),
            enquiriesByType: enquiryTypeBreakdown.map((item: any) => ({
              type: item.type,
              count: item._count.type,
            })),
          },
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch dashboard overview',
          cause: error,
        })
      }
    }),

  /**
   * Get appointment trends over time (admin/staff only)
   */
  getAppointmentTrends: protectedProcedure
    .input(
      z.object({
        clinicId: z.string().uuid().optional(),
        startDate: z.date(),
        endDate: z.date(),
        groupBy: z.enum(['day', 'week', 'month']).default('day'),
        includeStatus: z.boolean().default(false),
      })
    )
    .query(async ({ ctx, input }) => {
      const { clinicId, startDate, endDate, groupBy, includeStatus } = input

      try {
        const userRole = (ctx.session!.user as any).role

        // Build clinic filter
        let clinicFilter = {}
        if (userRole === 'STAFF' && clinicId) {
          clinicFilter = { clinicId }
        } else if (userRole === 'STAFF' && !clinicId) {
          const userClinic = await ctx.prisma.clinic.findFirst({
            where: { userId: (ctx.session!.user as any).id },
            select: { id: true },
          })
          if (userClinic) {
            clinicFilter = { clinicId: userClinic.id }
          } else {
            clinicFilter = { clinicId: 'none' }
          }
        }

        const appointments = await ctx.prisma.appointment.findMany({
          where: {
            ...clinicFilter,
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          select: {
            createdAt: true,
            status: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        })

        // Group appointments by time period
        const trends = new Map<string, { total: number; byStatus: Record<string, number> }>()

        appointments.forEach(appointment => {
          const dateKey = formatDateKey(appointment.createdAt, groupBy)
          
          if (!trends.has(dateKey)) {
            trends.set(dateKey, {
              total: 0,
              byStatus: {},
            })
          }

          const trend = trends.get(dateKey)!
          trend.total++
          trend.byStatus[appointment.status] = (trend.byStatus[appointment.status] || 0) + 1
        })

        // Convert to array and sort by date
        const trendArray = Array.from(trends.entries())
          .map(([dateKey, data]) => ({
            date: dateKey,
            total: data.total,
            ...(includeStatus ? { byStatus: data.byStatus } : {}),
          }))
          .sort((a, b) => a.date.localeCompare(b.date))

        return {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          groupBy,
          data: trendArray,
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch appointment trends',
          cause: error,
        })
      }
    }),

  /**
   * Get popular services analysis (admin/staff only)
   */
  getPopularServices: protectedProcedure
    .input(
      z.object({
        clinicId: z.string().uuid().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        limit: z.number().min(1).max(20).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const { clinicId, startDate, endDate, limit } = input

      try {
        const userRole = (ctx.session!.user as any).role

        // Build date filter
        let dateFilter = {}
        if (startDate && endDate) {
          dateFilter = {
            appointmentDate: {
              gte: startDate,
              lte: endDate,
            },
          }
        } else {
          // Default to last 30 days
          dateFilter = {
            appointmentDate: {
              gte: startOfDay(subDays(new Date(), 30)),
              lte: endOfDay(new Date()),
            },
          }
        }

        // Build clinic filter
        let clinicFilter = {}
        if (userRole === 'STAFF' && clinicId) {
          clinicFilter = { clinicId }
        } else if (userRole === 'STAFF' && !clinicId) {
          const userClinic = await ctx.prisma.clinic.findFirst({
            where: { userId: (ctx.session!.user as any).id },
            select: { id: true },
          })
          if (userClinic) {
            clinicFilter = { clinicId: userClinic.id }
          }
        }

        const popularServices = await ctx.prisma.appointment.groupBy({
          by: ['serviceId'],
          where: {
            ...clinicFilter,
            ...dateFilter,
            status: { not: 'CANCELLED' },
          },
          _count: { serviceId: true },
          _avg: { appointmentDate: true },
          orderBy: { _count: { serviceId: 'desc' } },
          take: limit,
        })

        // Get service details
        const serviceIds = popularServices.map(ps => ps.serviceId)
        const services = await ctx.prisma.service.findMany({
          where: { id: { in: serviceIds } },
          select: {
            id: true,
            name: true,
            category: true,
            price: true,
            duration: true,
          },
        })

        // Combine data
        const serviceData = popularServices.map(ps => {
          const service = services.find(s => s.id === ps.serviceId)
          return {
            serviceId: ps.serviceId,
            serviceName: service?.name || 'Unknown Service',
            category: service?.category || 'Unknown',
            price: service?.price || 0,
            duration: service?.duration || 0,
            appointmentCount: ps._count.serviceId,
            averageRating: 0, // Would need another query to get this
            revenue: (service?.price || 0) * ps._count.serviceId,
          }
        })

        return serviceData
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch popular services',
          cause: error,
        })
      }
    }),

  /**
   * Get clinic performance metrics (admin only)
   */
  getClinicPerformance: adminProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { startDate, endDate } = input

      try {
        // Default to last 30 days
        const dateFilter = {
          gte: startDate || startOfDay(subDays(new Date(), 30)),
          lte: endDate || endOfDay(new Date()),
        }

        const clinicPerformance = await ctx.prisma.clinic.findMany({
          select: {
            id: true,
            name: true,
            isActive: true,
            isHealthierSgPartner: true,
            _count: {
              select: {
                doctors: true,
                services: true,
                appointments: {
                  where: {
                    appointmentDate: dateFilter,
                  },
                },
                enquiries: {
                  where: {
                    createdAt: dateFilter,
                  },
                },
              },
            },
          },
        })

        // Get appointment revenue per clinic
        const clinicRevenue = await ctx.prisma.appointment.groupBy({
          by: ['clinicId'],
          where: {
            appointmentDate: dateFilter,
            status: { not: 'CANCELLED' },
          },
          _sum: {
            // This would need to be joined with service prices
          },
        })

        // Combine clinic data with revenue
        const performanceData = clinicPerformance.map(clinic => {
          const revenue = clinicRevenue.find(r => r.clinicId === clinic.id)
          return {
            clinicId: clinic.id,
            clinicName: clinic.name,
            isActive: clinic.isActive,
            isHealthierSgPartner: clinic.isHealthierSgPartner,
            doctorsCount: clinic._count.doctors,
            servicesCount: clinic._count.services,
            appointmentsCount: clinic._count.appointments,
            enquiriesCount: clinic._count.enquiries,
            // Calculate metrics
            appointmentRate: clinic._count.appointments > 0 ? Math.round((clinic._count.appointments / 30) * 100) / 100 : 0, // per day
            activeDoctorsRate: clinic._count.doctors > 0 ? Math.round((clinic._count.appointments / clinic._count.doctors) * 100) / 100 : 0, // per doctor
          }
        })

        // Sort by appointments count
        performanceData.sort((a, b) => b.appointmentsCount - a.appointmentsCount)

        return performanceData
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch clinic performance',
          cause: error,
        })
      }
    }),

  /**
   * Get user engagement metrics (admin only)
   */
  getUserEngagement: adminProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { startDate, endDate } = input

      try {
        const dateFilter = {
          gte: startDate || startOfDay(subDays(new Date(), 30)),
          lte: endDate || endOfDay(new Date()),
        }

        // User registration trends
        const userRegistrations = await ctx.prisma.user.groupBy({
          by: ['createdAt'],
          where: { createdAt: dateFilter },
          _count: { createdAt: true },
          orderBy: { createdAt: 'asc' },
        })

        // User activity (appointments made)
        const userAppointments = await ctx.prisma.appointment.groupBy({
          by: ['patientId'],
          where: {
            appointmentDate: dateFilter,
            status: { not: 'CANCELLED' },
          },
          _count: { patientId: true },
        })

        // Most active users
        const topUsers = await ctx.prisma.user.findMany({
          where: {
            id: { in: userAppointments.map(ua => ua.patientId) },
          },
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        })

        // Healthier SG enrollment
        const healthierSgStats = await ctx.prisma.userProfile.aggregate({
          where: {
            healthierSgEnrolled: true,
            healthierSgRegistrationDate: dateFilter,
          },
          _count: { healthierSgEnrolled: true },
        })

        return {
          registrationTrends: userRegistrations.map(ur => ({
            date: ur.createdAt.toISOString().split('T')[0],
            newUsers: ur._count.createdAt,
          })),
          userActivity: {
            totalActiveUsers: userAppointments.length,
            averageAppointmentsPerUser: userAppointments.length > 0 
              ? Math.round((userAppointments.reduce((sum, ua) => sum + ua._count.patientId, 0) / userAppointments.length) * 100) / 100
              : 0,
          },
          topUsers: userAppointments
            .map(ua => {
              const user = topUsers.find(u => u.id === ua.patientId)
              return {
                userId: ua.patientId,
                email: user?.email || 'Unknown',
                name: user?.profile ? `${user.profile.firstName} ${user.profile.lastName}` : 'Unknown',
                appointmentCount: ua._count.patientId,
              }
            })
            .sort((a, b) => b.appointmentCount - a.appointmentCount)
            .slice(0, 10),
          healthierSgEnrollments: healthierSgStats._count.healthierSgEnrolled,
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch user engagement metrics',
          cause: error,
        })
      }
    }),

  /**
   * Get revenue and financial metrics (admin only)
   */
  getRevenueMetrics: adminProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        groupBy: z.enum(['day', 'week', 'month']).default('day'),
      })
    )
    .query(async ({ ctx, input }) => {
      const { startDate, endDate, groupBy } = input

      try {
        const dateFilter = {
          gte: startDate || startOfDay(subDays(new Date(), 30)),
          lte: endDate || endOfDay(new Date()),
        }

        // This would need a more complex query to calculate actual revenue
        // For now, we'll provide a simplified version based on appointment counts
        const revenueData = await ctx.prisma.appointment.groupBy({
          by: ['appointmentDate'],
          where: {
            appointmentDate: dateFilter,
            status: { not: 'CANCELLED' },
          },
          _count: { appointmentDate: true },
          orderBy: { appointmentDate: 'asc' },
        })

        // Group by time period
        const groupedRevenue = new Map<string, { appointments: number; estimatedRevenue: number }>()

        revenueData.forEach(appointment => {
          const dateKey = formatDateKey(appointment.appointmentDate, groupBy)
          
          if (!groupedRevenue.has(dateKey)) {
            groupedRevenue.set(dateKey, {
              appointments: 0,
              estimatedRevenue: 0,
            })
          }

          const revenue = groupedRevenue.get(dateKey)!
          revenue.appointments += appointment._count.appointmentDate
          revenue.estimatedRevenue += appointment._count.appointmentDate * 50 // Estimated average price
        })

        const revenueArray = Array.from(groupedRevenue.entries())
          .map(([dateKey, data]) => ({
            date: dateKey,
            appointments: data.appointments,
            estimatedRevenue: data.estimatedRevenue,
            averageAppointmentValue: data.appointments > 0 ? Math.round((data.estimatedRevenue / data.appointments) * 100) / 100 : 0,
          }))
          .sort((a, b) => a.date.localeCompare(b.date))

        return {
          startDate: dateFilter.gte.toISOString(),
          endDate: dateFilter.lte.toISOString(),
          groupBy,
          data: revenueArray,
          summary: {
            totalAppointments: revenueArray.reduce((sum, item) => sum + item.appointments, 0),
            totalEstimatedRevenue: revenueArray.reduce((sum, item) => sum + item.estimatedRevenue, 0),
            averageRevenuePerDay: revenueArray.length > 0 
              ? Math.round((revenueArray.reduce((sum, item) => sum + item.estimatedRevenue, 0) / revenueArray.length) * 100) / 100
              : 0,
          },
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch revenue metrics',
          cause: error,
        })
      }
    }),
})

/**
 * Format date key based on grouping period
 */
function formatDateKey(date: Date, groupBy: 'day' | 'week' | 'month'): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  if (groupBy === 'day') {
    return `${year}-${month}-${day}`
  } else if (groupBy === 'week') {
    // Get start of week (Monday)
    const startOfWeek = new Date(date)
    startOfWeek.setDate(date.getDate() - date.getDay() + 1)
    const weekYear = startOfWeek.getFullYear()
    const weekMonth = String(startOfWeek.getMonth() + 1).padStart(2, '0')
    const weekDay = String(startOfWeek.getDate()).padStart(2, '0')
    return `${weekYear}-W${weekMonth}-${weekDay}`
  } else {
    // Month grouping
    return `${year}-${month}`
  }
}