import { z } from 'zod'
import { createTRPCRouter, publicProcedure, protectedProcedure, staffProcedure, calculatePagination } from '../trpc'
import { TRPCError } from '@trpc/server'
import { Prisma } from '@prisma/client'
import { EnquiryType, EnquiryStatus, EnquiryPriority } from '@prisma/client'

const enquirySelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  subject: true,
  message: true,
  type: true,
  status: true,
  priority: true,
  response: true,
  responseDate: true,
  createdAt: true,
  updatedAt: true,
  clinicId: true,
  patientId: true,
  assignedTo: true,
  escalationLevel: true,
  estimatedResolutionTime: true,
  dueDate: true,
  tags: true,
  clinic: {
    select: {
      id: true,
      name: true,
      address: true,
    },
  },
  patient: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  },
}

/**
 * Enquiry Router - Handles all enquiry/contact form operations
 */
export const enquiryRouter = createTRPCRouter({
  /**
   * Get all enquiries with pagination and filtering (staff/admin only)
   */
  getAll: staffProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(10),
        status: z.enum(['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
        type: z.enum(['GENERAL', 'APPOINTMENT', 'HEALTHIER_SG', 'COMPLAINT', 'FEEDBACK', 'TECHNICAL']).optional(),
        priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
        clinicId: z.string().uuid().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        search: z.string().optional(),
        orderBy: z.enum(['createdAt', 'priority', 'status', 'type']).default('createdAt'),
        orderDirection: z.enum(['asc', 'desc']).default('desc'),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, status, type, priority, clinicId, startDate, endDate, search, orderBy, orderDirection } = input
      const skip = (page - 1) * limit

      // Build where clause
      const where: Prisma.EnquiryWhereInput = {}

      if (status) {
        where.status = status
      }

      if (type) {
        where.type = type
      }

      if (priority) {
        where.priority = priority
      }

      if (clinicId) {
        where.clinicId = clinicId
      }

      if (startDate) {
        where.createdAt = {
          ...where.createdAt,
          gte: startDate,
        }
      }

      if (endDate) {
        where.createdAt = {
          ...where.createdAt,
          lte: endDate,
        }
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { subject: { contains: search, mode: 'insensitive' } },
          { message: { contains: search, mode: 'insensitive' } },
        ]
      }

      // For staff users, only show enquiries related to their clinic
      if (ctx.session.user.role === 'STAFF') {
        const userClinic = await ctx.prisma.clinic.findFirst({
          where: { userId: ctx.session.user.id },
          select: { id: true },
        })

        if (userClinic) {
          where.clinicId = userClinic.id
        }
      }

      // Build orderBy clause
      let orderByClause: Prisma.EnquiryOrderByWithRelationInput = {}
      if (orderBy === 'priority') {
        // Priority order: URGENT > HIGH > MEDIUM > LOW
        orderByClause = [
          {
            priority: orderDirection === 'asc' ? 'desc' : 'asc', // Reverse for correct priority order
          },
          { createdAt: 'desc' },
        ]
      } else {
        orderByClause = { [orderBy]: orderDirection }
      }

      try {
        const [enquiries, total] = await Promise.all([
          ctx.prisma.enquiry.findMany({
            where,
            select: enquirySelect,
            skip,
            take: limit,
            orderBy: orderByClause,
          }),
          ctx.prisma.enquiry.count({ where }),
        ])

        return {
          data: enquiries,
          pagination: calculatePagination(page, limit, total),
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch enquiries',
          cause: error,
        })
      }
    }),

  /**
   * Get a single enquiry by ID (staff/admin only)
   */
  getById: staffProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const enquiry = await ctx.prisma.enquiry.findUnique({
          where: { id: input.id },
          select: enquirySelect,
        })

        if (!enquiry) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Enquiry not found',
          })
        }

        // Check access permissions
        if (ctx.session.user.role === 'STAFF') {
          const userClinic = await ctx.prisma.clinic.findFirst({
            where: { userId: ctx.session.user.id },
            select: { id: true },
          })

          if (!userClinic || enquiry.clinic?.id !== userClinic.id) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'You can only view enquiries for your clinic',
            })
          }
        }

        return enquiry
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch enquiry',
          cause: error,
        })
      }
    }),

  /**
   * Create a new enquiry (public endpoint)
   */
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        email: z.string().email(),
        phone: z.string().regex(/^(\+65)?[689][0-9]{7}$/).optional(),
        subject: z.string().min(1).max(255),
        message: z.string().min(10).max(2000),
        type: z.enum(['GENERAL', 'APPOINTMENT', 'HEALTHIER_SG', 'COMPLAINT', 'FEEDBACK', 'TECHNICAL']),
        clinicId: z.string().uuid().optional(),
        patientId: z.string().uuid().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { name, email, phone, subject, message, type, clinicId, patientId } = input

      try {
        // Auto-assign clinic if patient is authenticated
        let assignedClinicId = clinicId
        if (!assignedClinicId && patientId) {
          const userProfile = await ctx.prisma.userProfile.findUnique({
            where: { userId: patientId },
            select: { preferredClinicId: true },
          })
          if (userProfile?.preferredClinicId) {
            assignedClinicId = userProfile.preferredClinicId
          }
        }

        // Determine priority based on type
        let priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' = 'MEDIUM'
        if (type === 'COMPLAINT' || type === 'TECHNICAL') {
          priority = 'HIGH'
        } else if (type === 'HEALTHIER_SG') {
          priority = 'MEDIUM'
        } else {
          priority = 'LOW'
        }

        const enquiry = await ctx.prisma.enquiry.create({
          data: {
            name,
            email,
            phone,
            subject,
            message,
            type,
            priority,
            status: 'PENDING',
            clinicId: assignedClinicId,
            ...(patientId ? { patientId } : {}),
          },
          select: enquirySelect,
        })

        return enquiry
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to create enquiry',
          cause: error,
        })
      }
    }),

  /**
   * Update enquiry status and add response (staff/admin only)
   */
  updateStatus: staffProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.enum(['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']),
        response: z.string().optional(),
        priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, status, response, priority } = input

      try {
        // Check if enquiry exists and user has access
        const existingEnquiry = await ctx.prisma.enquiry.findUnique({
          where: { id },
          select: {
            id: true,
            clinicId: true,
          },
        })

        if (!existingEnquiry) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Enquiry not found',
          })
        }

        // Check access permissions
        if (ctx.session.user.role === 'STAFF') {
          const userClinic = await ctx.prisma.clinic.findFirst({
            where: { userId: ctx.session.user.id },
            select: { id: true },
          })

          if (!userClinic || existingEnquiry.clinicId !== userClinic.id) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'You can only update enquiries for your clinic',
            })
          }
        }

        // Update enquiry
        const updatedEnquiry = await ctx.prisma.enquiry.update({
          where: { id },
          data: {
            status,
            ...(priority ? { priority } : {}),
            ...(response ? { response, responseDate: new Date() } : {}),
          },
          select: enquirySelect,
        })

        return updatedEnquiry
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to update enquiry status',
          cause: error,
        })
      }
    }),

  /**
   * Delete an enquiry (admin only)
   */
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if enquiry exists
        const enquiry = await ctx.prisma.enquiry.findUnique({
          where: { id: input.id },
          select: {
            id: true,
            clinicId: true,
          },
        })

        if (!enquiry) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Enquiry not found',
          })
        }

        // Check access for staff users
        if (ctx.session.user.role === 'STAFF') {
          const userClinic = await ctx.prisma.clinic.findFirst({
            where: { userId: ctx.session.user.id },
            select: { id: true },
          })

          if (!userClinic || enquiry.clinicId !== userClinic.id) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'You can only delete enquiries for your clinic',
            })
          }
        }

        await ctx.prisma.enquiry.delete({
          where: { id: input.id },
        })

        return { success: true }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Enquiry not found',
          })
        }

        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete enquiry',
          cause: error,
        })
      }
    }),

  /**
   * Get enquiry statistics (staff/admin only)
   */
  getStats: staffProcedure.query(async ({ ctx }) => {
    try {
      const userRole = ctx.session.user.role

      let clinicFilter = {}
      if (userRole === 'STAFF') {
        const userClinic = await ctx.prisma.clinic.findFirst({
          where: { userId: ctx.session.user.id },
          select: { id: true },
        })

        if (userClinic) {
          clinicFilter = { clinicId: userClinic.id }
        }
      }

      const [total, pending, inProgress, resolved, closed, today, thisWeek] = await Promise.all([
        ctx.prisma.enquiry.count({ where: clinicFilter }),
        ctx.prisma.enquiry.count({ where: { ...clinicFilter, status: 'PENDING' } }),
        ctx.prisma.enquiry.count({ where: { ...clinicFilter, status: 'IN_PROGRESS' } }),
        ctx.prisma.enquiry.count({ where: { ...clinicFilter, status: 'RESOLVED' } }),
        ctx.prisma.enquiry.count({ where: { ...clinicFilter, status: 'CLOSED' } }),
        ctx.prisma.enquiry.count({
          where: {
            ...clinicFilter,
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lt: new Date(new Date().setHours(23, 59, 59, 999)),
            },
          },
        }),
        ctx.prisma.enquiry.count({
          where: {
            ...clinicFilter,
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
            },
          },
        }),
      ])

      // Get type distribution
      const typeDistribution = await ctx.prisma.enquiry.groupBy({
        by: ['type'],
        where: clinicFilter,
        _count: { type: true },
        orderBy: { _count: { type: 'desc' } },
      })

      return {
        total,
        pending,
        inProgress,
        resolved,
        closed,
        today,
        thisWeek,
        types: typeDistribution.map(type => ({
          type: type.type,
          count: type._count.type,
        })),
      }
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch enquiry statistics',
        cause: error,
      })
    }
  }),

  /**
   * Get enquiry trends for analytics (admin only)
   */
  getTrends: protectedProcedure
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
        // Only admin can view trends
        if (ctx.session.user.role !== 'ADMIN') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only administrators can view enquiry trends',
          })
        }

        const where: Prisma.EnquiryWhereInput = {}
        if (startDate || endDate) {
          where.createdAt = {}
          if (startDate) where.createdAt.gte = startDate
          if (endDate) where.createdAt.lte = endDate
        }

        // Get raw data for trend analysis
        const enquiries = await ctx.prisma.enquiry.findMany({
          where,
          select: {
            createdAt: true,
            type: true,
            status: true,
            priority: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        })

        // Group data by time period
        const trends = new Map<string, { count: number; byType: Record<string, number>; byStatus: Record<string, number> }>()

        enquiries.forEach(enquiry => {
          const dateKey = formatDateKey(enquiry.createdAt, groupBy)
          
          if (!trends.has(dateKey)) {
            trends.set(dateKey, {
              count: 0,
              byType: {},
              byStatus: {},
            })
          }

          const trend = trends.get(dateKey)!
          trend.count++
          trend.byType[enquiry.type] = (trend.byType[enquiry.type] || 0) + 1
          trend.byStatus[enquiry.status] = (trend.byStatus[enquiry.status] || 0) + 1
        })

        // Convert to array and sort by date
        const trendArray = Array.from(trends.entries())
          .map(([dateKey, data]) => ({
            date: dateKey,
            ...data,
          }))
          .sort((a, b) => a.date.localeCompare(b.date))

        return trendArray
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch enquiry trends',
          cause: error,
        })
      }
    }),

  /**
   * Auto-assign enquiries based on workload and expertise
   */
  autoAssign: staffProcedure
    .input(
      z.object({
        enquiryIds: z.array(z.string().uuid()),
        strategy: z.enum(['workload', 'expertise', 'round_robin']).default('workload'),
        excludeUserId: z.string().uuid().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { enquiryIds, strategy, excludeUserId } = input

      try {
        // Get available staff for assignment
        const availableStaff = await ctx.prisma.user.findMany({
          where: {
            role: 'STAFF',
            ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
            // In a real implementation, you'd check staff availability status
          },
          select: {
            id: true,
            name: true,
            email: true,
            clinic: {
              select: {
                id: true,
              },
            },
          },
        })

        if (availableStaff.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'No available staff for assignment',
          })
        }

        const assignments: Array<{ enquiryId: string; staffId: string; staffName: string }> = []

        // Strategy: workload balancing
        if (strategy === 'workload') {
          // Get current workload for each staff member
          const workloads = await Promise.all(
            availableStaff.map(async (staff) => {
              const assignedCount = await ctx.prisma.enquiry.count({
                where: {
                  assignedTo: staff.id,
                  status: { in: ['PENDING', 'IN_PROGRESS'] },
                },
              })
              return { staff, assignedCount }
            })
          )

          // Sort by workload (ascending)
          workloads.sort((a, b) => a.assignedCount - b.assignedCount)

          // Assign enquiries to staff with lowest workload
          enquiryIds.forEach((enquiryId, index) => {
            const staffIndex = index % workloads.length
            const selectedStaff = workloads[staffIndex].staff
            assignments.push({
              enquiryId,
              staffId: selectedStaff.id,
              staffName: selectedStaff.name,
            })
          })
        } else {
          // Simple round-robin assignment
          enquiryIds.forEach((enquiryId, index) => {
            const staffIndex = index % availableStaff.length
            const selectedStaff = availableStaff[staffIndex]
            assignments.push({
              enquiryId,
              staffId: selectedStaff.id,
              staffName: selectedStaff.name,
            })
          })
        }

        // Update enquiries with assignments
        const updatePromises = assignments.map(({ enquiryId, staffId }) =>
          ctx.prisma.enquiry.update({
            where: { id: enquiryId },
            data: {
              assignedTo: staffId,
              updatedAt: new Date(),
            },
          })
        )

        await Promise.all(updatePromises)

        // Trigger notifications for new assignments
        const notificationPromises = assignments.map(({ enquiryId, staffId, staffName }) =>
          // In a real implementation, you'd send notifications here
          Promise.resolve()
        )

        await Promise.all(notificationPromises)

        return {
          success: true,
          assignedCount: assignments.length,
          assignments: assignments.map(a => ({
            enquiryId: a.enquiryId,
            staffId: a.staffId,
            staffName: a.staffName,
          })),
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to auto-assign enquiries',
          cause: error,
        })
      }
    }),

  /**
   * Manual assignment of enquiry to specific staff
   */
  assign: staffProcedure
    .input(
      z.object({
        enquiryId: z.string().uuid(),
        staffId: z.string().uuid(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { enquiryId, staffId, reason } = input

      try {
        // Verify staff member exists
        const staff = await ctx.prisma.user.findUnique({
          where: { id: staffId, role: 'STAFF' },
          select: { id: true, name: true, email: true },
        })

        if (!staff) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Staff member not found',
          })
        }

        // Update assignment
        const updatedEnquiry = await ctx.prisma.enquiry.update({
          where: { id: enquiryId },
          data: {
            assignedTo: staffId,
            updatedAt: new Date(),
          },
          select: enquirySelect,
        })

        // Log assignment in audit trail
        // In a real implementation, you'd create an audit log entry

        // Send notification to assigned staff
        // In a real implementation, you'd send email/SMS notifications

        return {
          success: true,
          enquiry: updatedEnquiry,
          assignedTo: staff,
        }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to assign enquiry',
          cause: error,
        })
      }
    }),

  /**
   * Escalate enquiry to higher level
   */
  escalate: staffProcedure
    .input(
      z.object({
        enquiryId: z.string().uuid(),
        reason: z.string().min(1),
        newPriority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
        escalateTo: z.string().uuid().optional(), // Manager/Supervisor ID
        autoEscalate: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { enquiryId, reason, newPriority, escalateTo, autoEscalate } = input

      try {
        const enquiry = await ctx.prisma.enquiry.findUnique({
          where: { id: enquiryId },
          select: {
            id: true,
            priority: true,
            escalationLevel: true,
            status: true,
            assignedTo: true,
            createdAt: true,
          },
        })

        if (!enquiry) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Enquiry not found',
          })
        }

        const currentEscalationLevel = enquiry.escalationLevel || 0
        const newEscalationLevel = autoEscalate ? currentEscalationLevel + 1 : Math.max(currentEscalationLevel, 1)

        // Determine escalation trigger
        const ageInHours = (new Date().getTime() - enquiry.createdAt.getTime()) / (1000 * 60 * 60)
        const needsEscalation = autoEscalate && (
          (enquiry.priority === 'URGENT' && ageInHours > 4) ||
          (enquiry.priority === 'HIGH' && ageInHours > 24) ||
          (enquiry.priority === 'MEDIUM' && ageInHours > 72) ||
          (enquiry.priority === 'LOW' && ageInHours > 168) // 1 week
        )

        if (!needsEscalation && autoEscalate) {
          return { success: false, message: 'Enquiry does not meet escalation criteria' }
        }

        // Update enquiry
        const updatedEnquiry = await ctx.prisma.enquiry.update({
          where: { id: enquiryId },
          data: {
            priority: newPriority || enquiry.priority,
            escalationLevel: newEscalationLevel,
            updatedAt: new Date(),
            // Add escalation reason to metadata or notes
            // tags: { push: `ESCALATED_${newEscalationLevel}` },
          },
          select: enquirySelect,
        })

        // Auto-assign to manager/supervisor if specified
        if (escalateTo) {
          await ctx.prisma.enquiry.update({
            where: { id: enquiryId },
            data: { assignedTo: escalateTo },
          })
        }

        // Trigger notifications
        const notificationPromises = [
          // Notify assigned staff of escalation
          // Notify managers/supervisors
          // Send alerts for high-priority escalations
          Promise.resolve()
        ]

        await Promise.all(notificationPromises)

        return {
          success: true,
          enquiry: updatedEnquiry,
          escalationLevel: newEscalationLevel,
          reason,
        }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to escalate enquiry',
          cause: error,
        })
      }
    }),

  /**
   * Trigger automated workflow actions
   */
  triggerWorkflow: staffProcedure
    .input(
      z.object({
        enquiryId: z.string().uuid(),
        action: z.enum(['auto_assign', 'auto_escalate', 'send_reminder', 'auto_close']),
        force: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { enquiryId, action, force } = input

      try {
        const enquiry = await ctx.prisma.enquiry.findUnique({
          where: { id: enquiryId },
          select: {
            id: true,
            status: true,
            priority: true,
            assignedTo: true,
            createdAt: true,
            response: true,
            responseDate: true,
          },
        })

        if (!enquiry) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Enquiry not found',
          })
        }

        const results: any = { success: true, actions: [] as any[] }

        switch (action) {
          case 'auto_assign':
            if (!enquiry.assignedTo) {
              // Get staff with lowest workload
              const staffWorkloads = await ctx.prisma.user.findMany({
                where: { role: 'STAFF' },
                select: {
                  id: true,
                  name: true,
                  _count: {
                    select: {
                      assignedEnquiries: {
                        where: {
                          status: { in: ['PENDING', 'IN_PROGRESS'] },
                        },
                      },
                    },
                  },
                },
              })

              const availableStaff = staffWorkloads
                .sort((a, b) => a._count.assignedEnquiries - b._count.assignedEnquiries)[0]

              if (availableStaff) {
                await ctx.prisma.enquiry.update({
                  where: { id: enquiryId },
                  data: { assignedTo: availableStaff.id },
                })
                results.actions.push({ type: 'assigned', staffId: availableStaff.id })
              }
            }
            break

          case 'auto_escalate':
            const ageInHours = (new Date().getTime() - enquiry.createdAt.getTime()) / (1000 * 60 * 60)
            const shouldEscalate = (
              (enquiry.priority === 'URGENT' && ageInHours > 4) ||
              (enquiry.priority === 'HIGH' && ageInHours > 24) ||
              (enquiry.priority === 'MEDIUM' && ageInHours > 72)
            )

            if (shouldEscalate || force) {
              await ctx.prisma.enquiry.update({
                where: { id: enquiryId },
                data: {
                  escalationLevel: (enquiry as any).escalationLevel + 1 || 1,
                  priority: enquiry.priority === 'LOW' ? 'MEDIUM' : 
                          enquiry.priority === 'MEDIUM' ? 'HIGH' : 'URGENT',
                },
              })
              results.actions.push({ type: 'escalated', level: (enquiry as any).escalationLevel + 1 })
            }
            break

          case 'send_reminder':
            // Send reminder to assigned staff or customer
            if (enquiry.assignedTo) {
              results.actions.push({ type: 'reminder_sent', to: 'staff' })
            }
            break

          case 'auto_close':
            if (enquiry.response && enquiry.status === 'RESOLVED') {
              const daysSinceResolution = (new Date().getTime() - (enquiry.responseDate?.getTime() || 0)) / (1000 * 60 * 60 * 24)
              if (daysSinceResolution > 7 || force) {
                await ctx.prisma.enquiry.update({
                  where: { id: enquiryId },
                  data: { status: 'CLOSED' },
                })
                results.actions.push({ type: 'auto_closed' })
              }
            }
            break
        }

        return results
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to trigger workflow action',
          cause: error,
        })
      }
    }),

  /**
   * Schedule follow-up reminder
   */
  scheduleFollowUp: staffProcedure
    .input(
      z.object({
        enquiryId: z.string().uuid(),
        type: z.enum(['survey', 'resolution_check', 'escalation', 'quality_review']),
        scheduledFor: z.date(),
        message: z.string().min(1),
        priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { enquiryId, type, scheduledFor, message, priority } = input

      try {
        // In a real implementation, you'd create a follow-up reminder record
        // For now, we'll simulate the reminder scheduling

        const reminder = {
          id: `reminder_${Date.now()}`,
          enquiryId,
          type,
          scheduledFor,
          message,
          priority,
          status: 'pending' as const,
          createdAt: new Date(),
        }

        // Schedule the reminder (in a real implementation, you'd use a job queue)
        // await reminderQueue.add('enquiry_followup', reminder, { delay: scheduledFor.getTime() - Date.now() })

        return {
          success: true,
          reminder,
          scheduledFor,
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to schedule follow-up reminder',
          cause: error,
        })
      }
    }),

  /**
   * Send satisfaction survey
   */
  sendSatisfactionSurvey: staffProcedure
    .input(
      z.object({
        enquiryId: z.string().uuid(),
        surveyTemplate: z.string().default('default'),
        customMessage: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { enquiryId, surveyTemplate, customMessage } = input

      try {
        const enquiry = await ctx.prisma.enquiry.findUnique({
          where: { id: enquiryId },
          select: {
            id: true,
            name: true,
            email: true,
            subject: true,
            status: true,
          },
        })

        if (!enquiry) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Enquiry not found',
          })
        }

        if (enquiry.status !== 'RESOLVED' && enquiry.status !== 'CLOSED') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Survey can only be sent for resolved or closed enquiries',
          })
        }

        // Create survey record
        const survey = {
          id: `survey_${Date.now()}`,
          enquiryId,
          enquirySubject: enquiry.subject,
          customerName: enquiry.name,
          customerEmail: enquiry.email,
          status: 'SENT' as const,
          sentAt: new Date(),
          overallRating: 0,
          responseTimeRating: 0,
          problemResolutionRating: 0,
          communicationRating: 0,
          recommendationLikelihood: 0,
          followUpRequired: false,
          problemResolved: false,
          responseQuality: 'fair' as const,
          surveyTemplate,
        }

        // Send survey email (in a real implementation)
        // await emailService.sendSatisfactionSurvey(survey, customMessage)

        return {
          success: true,
          survey,
          sentAt: new Date(),
        }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to send satisfaction survey',
          cause: error,
        })
      }
    }),

  /**
   * Update satisfaction survey response
   */
  updateSurveyResponse: publicProcedure
    .input(
      z.object({
        surveyId: z.string(),
        overallRating: z.number().min(1).max(5),
        responseTimeRating: z.number().min(1).max(5),
        problemResolutionRating: z.number().min(1).max(5),
        communicationRating: z.number().min(1).max(5),
        recommendationLikelihood: z.number().min(0).max(10),
        feedback: z.string().optional(),
        problemResolved: z.boolean(),
        additionalComments: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { 
        surveyId, 
        overallRating, 
        responseTimeRating, 
        problemResolutionRating, 
        communicationRating,
        recommendationLikelihood,
        feedback,
        problemResolved,
        additionalComments
      } = input

      try {
        // In a real implementation, you'd update the survey record
        const updatedSurvey = {
          id: surveyId,
          status: 'RESPONDED' as const,
          respondedAt: new Date(),
          overallRating,
          responseTimeRating,
          problemResolutionRating,
          communicationRating,
          recommendationLikelihood,
          feedback,
          problemResolved,
        }

        // Calculate response quality
        const avgRating = (overallRating + responseTimeRating + problemResolutionRating + communicationRating) / 4
        const responseQuality = avgRating >= 4.5 ? 'excellent' :
                              avgRating >= 3.5 ? 'good' :
                              avgRating >= 2.5 ? 'fair' : 'poor'

        ;(updatedSurvey as any).responseQuality = responseQuality

        // Trigger follow-up if needed
        if (overallRating <= 2 || !problemResolved) {
          // Schedule follow-up with customer service
          // await followUpQueue.add('low_satisfaction', { surveyId, customerEmail: survey.customerEmail })
        }

        return {
          success: true,
          survey: updatedSurvey,
          responseQuality,
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to update survey response',
          cause: error,
        })
      }
    }),

  /**
   * Get satisfaction survey analytics
   */
  getSatisfactionAnalytics: staffProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        clinicId: z.string().uuid().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { startDate, endDate, clinicId } = input

      try {
        const where: Prisma.SatisfactionSurveyWhereInput = {}
        
        if (startDate || endDate) {
          where.respondedAt = {}
          if (startDate) where.respondedAt.gte = startDate
          if (endDate) where.respondedAt.lte = endDate
        }

        // In a real implementation, you'd query actual survey records
        // For now, return mock data
        const analytics = {
          totalSurveys: 150,
          responseRate: 68.5,
          averageRating: 4.2,
          nps: 67,
          responseTime: 2.1,
          satisfactionTrend: 'up' as const,
          breakdown: {
            verySatisfied: 78,
            satisfied: 15,
            neutral: 5,
            dissatisfied: 2,
          },
          qualityScores: {
            responseTime: 4.1,
            problemResolution: 4.5,
            communication: 3.9,
            overallExperience: 4.2,
          },
          trends: [
            { date: '2024-01', rating: 4.0, responses: 25 },
            { date: '2024-02', rating: 4.1, responses: 28 },
            { date: '2024-03', rating: 4.3, responses: 32 },
            { date: '2024-04', rating: 4.2, responses: 30 },
          ],
        }

        return analytics
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch satisfaction analytics',
          cause: error,
        })
      }
    }),

  /**
   * Get staff performance metrics
   */
  getStaffPerformance: staffProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { startDate, endDate } = input

      try {
        // Get all staff with their enquiry assignments
        const staff = await ctx.prisma.user.findMany({
          where: { role: 'STAFF' },
          select: {
            id: true,
            name: true,
            email: true,
            assignedEnquiries: {
              where: {
                ...(startDate || endDate ? {
                  createdAt: {
                    ...(startDate ? { gte: startDate } : {}),
                    ...(endDate ? { lte: endDate } : {}),
                  },
                } : {}),
              },
              select: {
                id: true,
                status: true,
                priority: true,
                createdAt: true,
                responseDate: true,
              },
            },
          },
        })

        const performance = staff.map(member => {
          const enquiries = member.assignedEnquiries
          const totalAssigned = enquiries.length
          const resolved = enquiries.filter(e => e.status === 'RESOLVED' || e.status === 'CLOSED')
          const resolvedCount = resolved.length
          const avgResolutionTime = resolved.length > 0 
            ? resolved
                .filter(e => e.responseDate)
                .map(e => (e.responseDate!.getTime() - e.createdAt.getTime()) / (1000 * 60 * 60))
                .reduce((sum, time) => sum + time, 0) / resolved.filter(e => e.responseDate).length
            : 0

          // Mock satisfaction score (in real implementation, you'd calculate from actual surveys)
          const satisfactionScore = Math.random() * 1.5 + 3.5 // 3.5-5.0 range

          return {
            staffId: member.id,
            staffName: member.name,
            totalAssigned,
            resolved: resolvedCount,
            avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
            satisfactionScore: Math.round(satisfactionScore * 10) / 10,
            resolutionRate: totalAssigned > 0 ? Math.round((resolvedCount / totalAssigned) * 100) : 0,
            workload: Math.min(totalAssigned * 2, 100), // Mock workload calculation
            trend: Math.random() > 0.5 ? 'up' : 'down' as const,
          }
        })

        return performance
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch staff performance metrics',
          cause: error,
        })
      }
    }),

  /**
   * Send notification to customer
   */
  sendCustomerNotification: staffProcedure
    .input(
      z.object({
        enquiryId: z.string().uuid(),
        type: z.enum(['status_update', 'response', 'survey_invitation', 'follow_up']),
        subject: z.string().min(1),
        message: z.string().min(1),
        channel: z.enum(['email', 'sms', 'both']).default('email'),
        scheduledFor: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { enquiryId, type, subject, message, channel, scheduledFor } = input

      try {
        const enquiry = await ctx.prisma.enquiry.findUnique({
          where: { id: enquiryId },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            status: true,
          },
        })

        if (!enquiry) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Enquiry not found',
          })
        }

        const notification = {
          id: `notification_${Date.now()}`,
          enquiryId,
          type,
          subject,
          message,
          channel,
          recipient: {
            name: enquiry.name,
            email: enquiry.email,
            phone: enquiry.phone,
          },
          status: scheduledFor ? 'scheduled' : 'sent',
          createdAt: new Date(),
          scheduledFor: scheduledFor || undefined,
        }

        // Send notification based on channel
        const sendPromises = []
        
        if (channel === 'email' || channel === 'both') {
          // sendPromises.push(emailService.send(notification))
        }
        
        if (channel === 'sms' || channel === 'both') {
          // sendPromises.push(smsService.send(notification))
        }

        await Promise.all(sendPromises)

        return {
          success: true,
          notification,
          sentAt: new Date(),
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to send customer notification',
          cause: error,
        })
      }
    }),

  /**
   * Process automated workflow triggers
   */
  processWorkflowTriggers: staffProcedure
    .input(
      z.object({
        dryRun: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { dryRun } = input

      try {
        const results: {
          autoAssigned: number
          autoEscalated: number
          remindersSent: number
          autoClosed: number
          errors: string[]
        } = {
          autoAssigned: 0,
          autoEscalated: 0,
          remindersSent: 0,
          autoClosed: 0,
          errors: [],
        }

        // Get pending enquiries that need processing
        const pendingEnquiries = await ctx.prisma.enquiry.findMany({
          where: {
            status: { in: ['PENDING', 'IN_PROGRESS'] },
          },
          select: {
            id: true,
            priority: true,
            assignedTo: true,
            createdAt: true,
            status: true,
          },
        })

        for (const enquiry of pendingEnquiries) {
          const ageInHours = (new Date().getTime() - enquiry.createdAt.getTime()) / (1000 * 60 * 60)

          try {
            // Auto-assign unassigned enquiries
            if (!enquiry.assignedTo) {
              if (!dryRun) {
                // Get available staff
                const availableStaff = await ctx.prisma.user.findMany({
                  where: { role: 'STAFF' },
                  select: {
                    id: true,
                    assignedEnquiries: {
                      where: { status: { in: ['PENDING', 'IN_PROGRESS'] } },
                      select: { id: true },
                    },
                  },
                })

                const leastBusy = availableStaff
                  .sort((a, b) => a.assignedEnquiries.length - b.assignedEnquiries.length)[0]

                if (leastBusy) {
                  await ctx.prisma.enquiry.update({
                    where: { id: enquiry.id },
                    data: { assignedTo: leastBusy.id },
                  })
                }
              }
              results.autoAssigned++
            }

            // Auto-escalate overdue enquiries
            const shouldEscalate = (
              (enquiry.priority === 'URGENT' && ageInHours > 4) ||
              (enquiry.priority === 'HIGH' && ageInHours > 24) ||
              (enquiry.priority === 'MEDIUM' && ageInHours > 72) ||
              (enquiry.priority === 'LOW' && ageInHours > 168)
            )

            if (shouldEscalate) {
              if (!dryRun) {
                await ctx.prisma.enquiry.update({
                  where: { id: enquiry.id },
                  data: {
                    priority: enquiry.priority === 'LOW' ? 'MEDIUM' : 
                            enquiry.priority === 'MEDIUM' ? 'HIGH' : 'URGENT',
                    escalationLevel: 1,
                  },
                })
              }
              results.autoEscalated++
            }

            // Send reminders for stale enquiries
            const shouldSendReminder = ageInHours > 24 && enquiry.status === 'IN_PROGRESS'
            if (shouldSendReminder && enquiry.assignedTo) {
              if (!dryRun) {
                // Send reminder notification
                // await notificationService.sendReminder(enquiry.id, 'staff')
              }
              results.remindersSent++
            }

            // Auto-close old resolved enquiries
            if (enquiry.status === 'RESOLVED' && ageInHours > 168) { // 1 week
              if (!dryRun) {
                await ctx.prisma.enquiry.update({
                  where: { id: enquiry.id },
                  data: { status: 'CLOSED' },
                })
              }
              results.autoClosed++
            }
          } catch (error) {
            results.errors.push(`Failed to process enquiry ${enquiry.id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
          }
        }

        return {
          success: true,
          processed: pendingEnquiries.length,
          results,
          timestamp: new Date(),
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to process workflow triggers',
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