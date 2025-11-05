import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, adminProcedure, calculatePagination } from '../trpc'
import { TRPCError } from '@trpc/server'
import { Prisma } from '@prisma/client'

const auditLogSelect = {
  id: true,
  action: true,
  entity: true,
  entityId: true,
  changes: true,
  metadata: true,
  ipAddress: true,
  userAgent: true,
  sessionId: true,
  createdAt: true,
  user: {
    select: {
      id: true,
      email: true,
      role: true,
      profile: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  },
}

/**
 * Audit Log Router - Handles all audit logging operations
 */
export const auditRouter = createTRPCRouter({
  /**
   * Get audit logs with pagination and filtering (admin only)
   */
  getAll: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        userId: z.string().uuid().optional(),
        action: z.string().optional(),
        entity: z.string().optional(),
        entityId: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        search: z.string().optional(),
        orderBy: z.enum(['createdAt', 'action', 'entity']).default('createdAt'),
        orderDirection: z.enum(['asc', 'desc']).default('desc'),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, userId, action, entity, entityId, startDate, endDate, search, orderBy, orderDirection } = input
      const skip = (page - 1) * limit

      // Build where clause
      const where: Prisma.AuditLogWhereInput = {}

      if (userId) {
        where.userId = userId
      }

      if (action) {
        where.action = { contains: action, mode: 'insensitive' }
      }

      if (entity) {
        where.entity = { contains: entity, mode: 'insensitive' }
      }

      if (entityId) {
        where.entityId = entityId
      }

      if (startDate || endDate) {
        where.createdAt = {}
        if (startDate) where.createdAt.gte = startDate
        if (endDate) where.createdAt.lte = endDate
      }

      if (search) {
        where.OR = [
          { action: { contains: search, mode: 'insensitive' } },
          { entity: { contains: search, mode: 'insensitive' } },
          { user: { is: { email: { contains: search, mode: 'insensitive' } } } },
        ]
      }

      // Build orderBy clause
      let orderByClause: Prisma.AuditLogOrderByWithRelationInput = {}
      if (orderBy === 'createdAt') {
        orderByClause = { createdAt: orderDirection }
      } else if (orderBy === 'action') {
        orderByClause = { action: orderDirection }
      } else if (orderBy === 'entity') {
        orderByClause = { entity: orderDirection }
      }

      try {
        const [auditLogs, total] = await Promise.all([
          ctx.prisma.auditLog.findMany({
            where,
            select: auditLogSelect,
            skip,
            take: limit,
            orderBy: orderByClause,
          }),
          ctx.prisma.auditLog.count({ where }),
        ])

        return {
          data: auditLogs,
          pagination: calculatePagination(page, limit, total),
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch audit logs',
          cause: error,
        })
      }
    }),

  /**
   * Get audit logs for a specific entity (admin only)
   */
  getByEntity: adminProcedure
    .input(
      z.object({
        entity: z.string(),
        entityId: z.string(),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const { entity, entityId, limit } = input

      try {
        const auditLogs = await ctx.prisma.auditLog.findMany({
          where: {
            entity,
            entityId,
          },
          select: auditLogSelect,
          orderBy: {
            createdAt: 'desc',
          },
          take: limit,
        })

        return auditLogs
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch audit logs for entity',
          cause: error,
        })
      }
    }),

  /**
   * Get audit logs for current user (admin only)
   */
  getMyLogs: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(20),
        action: z.string().optional(),
        entity: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, action, entity } = input
      const skip = (page - 1) * limit

      const where: Prisma.AuditLogWhereInput = {
        userId: ctx.session.user.id,
      }

      if (action) {
        where.action = { contains: action, mode: 'insensitive' }
      }

      if (entity) {
        where.entity = { contains: entity, mode: 'insensitive' }
      }

      try {
        const [auditLogs, total] = await Promise.all([
          ctx.prisma.auditLog.findMany({
            where,
            select: auditLogSelect,
            skip,
            take: limit,
            orderBy: {
              createdAt: 'desc',
            },
          }),
          ctx.prisma.auditLog.count({ where }),
        ])

        return {
          data: auditLogs,
          pagination: calculatePagination(page, limit, total),
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch your audit logs',
          cause: error,
        })
      }
    }),

  /**
   * Create audit log entry (admin only - typically used by system)
   */
  create: adminProcedure
    .input(
      z.object({
        action: z.string(),
        entity: z.string(),
        entityId: z.string(),
        changes: z.record(z.unknown()).optional(),
        metadata: z.record(z.unknown()).optional(),
        ipAddress: z.string().optional(),
        userAgent: z.string().optional(),
        sessionId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { action, entity, entityId, changes, metadata, ipAddress, userAgent, sessionId } = input

      try {
        const auditLog = await ctx.prisma.auditLog.create({
          data: {
            action,
            entity,
            entityId,
            changes: changes || {},
            metadata: metadata || {},
            userId: ctx.session.user.id,
            ipAddress,
            userAgent,
            sessionId,
          },
          select: auditLogSelect,
        })

        return auditLog
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to create audit log',
          cause: error,
        })
      }
    }),

  /**
   * Get audit log statistics (admin only)
   */
  getStats: adminProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { startDate, endDate } = input

      try {
        const where: Prisma.AuditLogWhereInput = {}
        if (startDate || endDate) {
          where.createdAt = {}
          if (startDate) where.createdAt.gte = startDate
          if (endDate) where.createdAt.lte = endDate
        }

        const [totalLogs, todayLogs, thisWeekLogs, actionCounts, entityCounts, userActivity] = await Promise.all([
          ctx.prisma.auditLog.count({ where }),
          ctx.prisma.auditLog.count({
            where: {
              ...where,
              createdAt: {
                gte: new Date(new Date().setHours(0, 0, 0, 0)),
                lt: new Date(new Date().setHours(23, 59, 59, 999)),
              },
            },
          }),
          ctx.prisma.auditLog.count({
            where: {
              ...where,
              createdAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
              },
            },
          }),
          ctx.prisma.auditLog.groupBy({
            by: ['action'],
            where,
            _count: { action: true },
            orderBy: { _count: { action: 'desc' } },
            take: 10,
          }),
          ctx.prisma.auditLog.groupBy({
            by: ['entity'],
            where,
            _count: { entity: true },
            orderBy: { _count: { entity: 'desc' } },
            take: 10,
          }),
          ctx.prisma.auditLog.groupBy({
            by: ['userId'],
            where: {
              ...where,
              createdAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
              },
            },
            _count: { userId: true },
            orderBy: { _count: { userId: 'desc' } },
            take: 10,
          }),
        ])

        // Get user details for top active users
        const topActiveUserIds = userActivity.map(ua => ua.userId)
        const topActiveUsers = await ctx.prisma.user.findMany({
          where: { id: { in: topActiveUserIds } },
          select: {
            id: true,
            email: true,
            role: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        })

        return {
          totalLogs,
          todayLogs,
          thisWeekLogs,
          actionDistribution: actionCounts.map(action => ({
            action: action.action,
            count: action._count.action,
          })),
          entityDistribution: entityCounts.map(entity => ({
            entity: entity.entity,
            count: entity._count.entity,
          })),
          topActiveUsers: userActivity.map(ua => {
            const user = topActiveUsers.find(u => u.id === ua.userId)
            return {
              userId: ua.userId,
              email: user?.email || 'Unknown',
              name: user?.profile ? `${user.profile.firstName} ${user.profile.lastName}` : 'Unknown',
              role: user?.role || 'Unknown',
              activityCount: ua._count.userId,
            }
          }),
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch audit statistics',
          cause: error,
        })
      }
    }),

  /**
   * Export audit logs (admin only)
   */
  export: adminProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
        format: z.enum(['json', 'csv']).default('json'),
        filters: z.object({
          userId: z.string().uuid().optional(),
          action: z.string().optional(),
          entity: z.string().optional(),
        }).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { startDate, endDate, format, filters } = input

      try {
        const where: Prisma.AuditLogWhereInput = {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        }

        if (filters?.userId) where.userId = filters.userId
        if (filters?.action) where.action = { contains: filters.action, mode: 'insensitive' }
        if (filters?.entity) where.entity = { contains: filters.entity, mode: 'insensitive' }

        const auditLogs = await ctx.prisma.auditLog.findMany({
          where,
          select: auditLogSelect,
          orderBy: {
            createdAt: 'desc',
          },
        })

        if (format === 'csv') {
          // Convert to CSV format
          const headers = ['Timestamp', 'User', 'Action', 'Entity', 'Entity ID', 'IP Address']
          const csvData = auditLogs.map(log => [
            log.createdAt.toISOString(),
            log.user?.email || 'System',
            log.action,
            log.entity,
            log.entityId,
            log.ipAddress || 'N/A',
          ])

          return {
            format: 'csv',
            data: {
              headers,
              rows: csvData,
            },
          }
        }

        return {
          format: 'json',
          data: auditLogs,
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to export audit logs',
          cause: error,
        })
      }
    }),

  /**
   * Clean up old audit logs (admin only)
   */
  cleanup: adminProcedure
    .input(
      z.object({
        olderThanDays: z.number().min(30).max(365),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { olderThanDays } = input

      try {
        const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000)

        // Count logs to be deleted
        const logsToDelete = await ctx.prisma.auditLog.count({
          where: {
            createdAt: {
              lt: cutoffDate,
            },
          },
        })

        // Delete old logs
        await ctx.prisma.auditLog.deleteMany({
          where: {
            createdAt: {
              lt: cutoffDate,
            },
          },
        })

        return {
          success: true,
          deletedLogs: logsToDelete,
          cutoffDate: cutoffDate.toISOString(),
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to cleanup audit logs',
          cause: error,
        })
      }
    }),

  /**
   * Get security-related audit events (admin only)
   */
  getSecurityEvents: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(20),
        severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, severity } = input
      const skip = (page - 1) * limit

      // Define security-related actions
      const securityActions = [
        'USER_LOGIN',
        'USER_LOGOUT',
        'USER_LOGIN_FAILED',
        'PASSWORD_CHANGE',
        'ACCOUNT_LOCKED',
        'ACCOUNT_UNLOCKED',
        'USER_CREATED',
        'USER_DELETED',
        'ROLE_CHANGED',
        'PERMISSION_DENIED',
        'UNAUTHORIZED_ACCESS',
        'SUSPICIOUS_ACTIVITY',
      ]

      const where: Prisma.AuditLogWhereInput = {
        action: {
          in: securityActions,
        },
      }

      if (severity) {
        // Add severity filtering if metadata contains it
        where.metadata = {
          path: ['severity'],
          equals: severity,
        }
      }

      try {
        const [auditLogs, total] = await Promise.all([
          ctx.prisma.auditLog.findMany({
            where,
            select: auditLogSelect,
            skip,
            take: limit,
            orderBy: {
              createdAt: 'desc',
            },
          }),
          ctx.prisma.auditLog.count({ where }),
        ])

        return {
          data: auditLogs,
          pagination: calculatePagination(page, limit, total),
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch security events',
          cause: error,
        })
      }
    }),
})