import { initTRPC, TRPCError } from '@trpc/server'
import { ZodError } from 'zod'
import superjson from 'superjson'

import { getServerAuthSession } from '../auth'
import { prisma } from '@/lib/db'
import type { User } from '@prisma/client'

/**
 * Context for tRPC requests
 */
export interface CreateTRPCContextOptions {
  req?: Request
}

export const createTRPCContext = async (opts?: CreateTRPCContextOptions) => {
  const session = await getServerAuthSession()
  
  return {
    session,
    prisma,
  }
}

/**
 * tRPC Context
 */
export type Context = Awaited<ReturnType<typeof createTRPCContext>>

/**
 * tRPC initialization
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

/**
 * Reusable middleware that enforces users are logged in before accessing procedures
 */
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user?.id) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource.',
    })
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.session.user,
    },
  })
})

/**
 * Middleware that enforces users have a specific role
 */
const enforceUserHasRole = (allowedRoles: string[]) =>
  t.middleware(({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You must be logged in to access this resource.',
      })
    }

    const userRole = ctx.session.user.role as string
    if (!allowedRoles.includes(userRole)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have permission to access this resource.',
      })
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.session.user,
      },
    })
  })

/**
 * Middleware for admin-only operations
 */
const enforceUserIsAdmin = enforceUserHasRole(['ADMIN'])

/**
 * Middleware for staff or admin operations
 */
const enforceUserIsStaffOrAdmin = enforceUserHasRole(['ADMIN', 'STAFF'])

/**
 * Public procedures (accessible to everyone)
 */
export const createTRPCRouter = t.router

/**
 * Protected procedures (require authentication)
 */
export const protectedProcedure = t.procedure.use(enforceUserIsAuthed)

/**
 * Admin-only procedures
 */
export const adminProcedure = t.procedure.use(enforceUserIsAdmin)

/**
 * Staff or Admin procedures
 */
export const staffProcedure = t.procedure.use(enforceUserIsStaffOrAdmin)

/**
 * Public procedures (no authentication required)
 */
export const publicProcedure = t.procedure

/**
 * Types for common responses
 */
export interface PaginationInput {
  page?: number
  limit?: number
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  pagination?: PaginationInfo
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationInfo
}

/**
 * Utility function for pagination calculations
 */
export const calculatePagination = (page: number, limit: number, total: number): PaginationInfo => {
  const totalPages = Math.ceil(total / limit)
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  }
}

/**
 * Types for audit logging
 */
export interface AuditAction {
  action: string
  entity: string
  entityId: string
  changes?: Record<string, unknown>
  metadata?: Record<string, unknown>
}

/**
 * Error codes for consistent error handling
 */
export const TRPC_ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  CONFLICT: 'CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const

export type TRPCErrorCode = typeof TRPC_ERROR_CODES[keyof typeof TRPC_ERROR_CODES]