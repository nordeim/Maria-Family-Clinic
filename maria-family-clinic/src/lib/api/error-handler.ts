'use client'

import { trpc } from '@/lib/trpc/client'
import type { TRPCClientErrorLike } from '@trpc/client'

/**
 * API Error Handler - Centralized error handling for tRPC mutations and queries
 */

export interface ErrorContext {
  component?: string
  action?: string
  userId?: string
  sessionId?: string
  metadata?: Record<string, any>
}

/**
 * Enhanced error handling with automatic audit logging
 */
export class ApiErrorHandler {
  private static instance: ApiErrorHandler
  private auditLog = trpc.audit.create.useMutation()

  private constructor() {}

  static getInstance(): ApiErrorHandler {
    if (!ApiErrorHandler.instance) {
      ApiErrorHandler.instance = new ApiErrorHandler()
    }
    return ApiErrorHandler.instance
  }

  /**
   * Handle tRPC query errors
   */
  handleQueryError(
    error: TRPCClientErrorLike<any>,
    context: ErrorContext = {}
  ) {
    // Log the error for audit purposes
    this.logError(error, context)

    // Handle different error types
    switch (error.data?.code) {
      case 'UNAUTHORIZED':
        return this.handleUnauthorizedError(error, context)
      case 'FORBIDDEN':
        return this.handleForbiddenError(error, context)
      case 'NOT_FOUND':
        return this.handleNotFoundError(error, context)
      case 'CONFLICT':
        return this.handleConflictError(error, context)
      case 'VALIDATION_ERROR':
        return this.handleValidationError(error, context)
      case 'INTERNAL_ERROR':
        return this.handleInternalError(error, context)
      default:
        return this.handleGenericError(error, context)
    }
  }

  /**
   * Handle mutation errors with rollback capabilities
   */
  handleMutationError(
    error: TRPCClientErrorLike<any>,
    context: ErrorContext & {
      rollback?: () => void | Promise<void>
    } = {}
  ) {
    const { rollback } = context

    // Attempt rollback if provided
    if (rollback && typeof rollback === 'function') {
      try {
        rollback()
      } catch (rollbackError) {
        console.error('Rollback failed:', rollbackError)
        if (context.metadata) {
          context.metadata.rollbackError = String(rollbackError)
        }
      }
    }

    // Log the error for audit purposes
    this.logError(error, context)

    // Handle different error types with specific responses
    switch (error.data?.code) {
      case 'VALIDATION_ERROR':
        return this.handleValidationError(error, context)
      case 'CONFLICT':
        return this.handleConflictError(error, context)
      case 'UNAUTHORIZED':
        return this.handleUnauthorizedError(error, context)
      case 'FORBIDDEN':
        return this.handleForbiddenError(error, context)
      default:
        return this.handleGenericError(error, context)
    }
  }

  /**
   * Handle success responses with audit logging
   */
  handleSuccess(
    action: string,
    entity: string,
    entityId: string,
    changes?: Record<string, any>,
    context: ErrorContext = {}
  ) {
    this.logSuccess(action, entity, entityId, changes, context)
  }

  private async logError(
    error: TRPCClientErrorLike<any>,
    context: ErrorContext
  ) {
    try {
      await this.auditLog.mutateAsync({
        action: `ERROR_${context.action || 'UNKNOWN'}`,
        entity: context.component || 'Unknown',
        entityId: 'N/A',
        changes: {
          error: {
            code: error.data?.code,
            message: error.message,
            stack: (error as any).stack,
          },
        },
        metadata: {
          ...context.metadata,
          url: typeof window !== 'undefined' ? window.location.href : 'server',
          userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server',
          timestamp: new Date().toISOString(),
        },
      })
    } catch (auditError) {
      console.error('Failed to log error to audit:', auditError)
    }
  }

  private async logSuccess(
    action: string,
    entity: string,
    entityId: string,
    changes?: Record<string, any>,
    context: ErrorContext = {}
  ) {
    try {
      await this.auditLog.mutateAsync({
        action,
        entity,
        entityId,
        changes,
        metadata: {
          ...context.metadata,
          timestamp: new Date().toISOString(),
        },
      })
    } catch (auditError) {
      console.error('Failed to log success to audit:', auditError)
    }
  }

  private handleUnauthorizedError(
    error: TRPCClientErrorLike<any>,
    context: ErrorContext
  ) {
    if (typeof window !== 'undefined') {
      // Redirect to sign in page
      window.location.href = `/auth/signin?redirect=${encodeURIComponent(window.location.pathname)}`
    }
    return {
      type: 'UNAUTHORIZED',
      message: 'You must be signed in to access this resource.',
      redirect: '/auth/signin',
    }
  }

  private handleForbiddenError(
    error: TRPCClientErrorLike<any>,
    context: ErrorContext
  ) {
    return {
      type: 'FORBIDDEN',
      message: 'You don\'t have permission to access this resource.',
      requiredPermission: context.metadata?.requiredPermission,
    }
  }

  private handleNotFoundError(
    error: TRPCClientErrorLike<any>,
    context: ErrorContext
  ) {
    return {
      type: 'NOT_FOUND',
      message: 'The requested resource was not found.',
      entity: context.metadata?.entity,
    }
  }

  private handleConflictError(
    error: TRPCClientErrorLike<any>,
    context: ErrorContext
  ) {
    return {
      type: 'CONFLICT',
      message: error.data?.message || 'A conflict occurred with the current state.',
      entity: context.metadata?.entity,
    }
  }

  private handleValidationError(
    error: TRPCClientErrorLike<any>,
    context: ErrorContext
  ) {
    const issues = error.data?.zodError?.issues || []
    const fieldErrors: Record<string, string[]> = {}

    issues.forEach((issue: any) => {
      const path = issue.path.join('.')
      if (!fieldErrors[path]) {
        fieldErrors[path] = []
      }
      fieldErrors[path].push(issue.message)
    })

    return {
      type: 'VALIDATION_ERROR',
      message: 'Please check your input and try again.',
      fieldErrors,
    }
  }

  private handleInternalError(
    error: TRPCClientErrorLike<any>,
    context: ErrorContext
  ) {
    // Only show detailed error in development
    const message = process.env.NODE_ENV === 'development' 
      ? error.data?.message || error.message 
      : 'An unexpected error occurred. Please try again.'

    return {
      type: 'INTERNAL_ERROR',
      message,
      errorId: context.metadata?.errorId,
    }
  }

  private handleGenericError(
    error: TRPCClientErrorLike<any>,
    context: ErrorContext
  ) {
    return {
      type: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred. Please try again.',
      originalError: error,
    }
  }
}

// Export singleton instance
export const apiErrorHandler = ApiErrorHandler.getInstance()

/**
 * React Query error handling utilities
 */
export function createQueryErrorHandler(component: string) {
  return {
    onError: (error: any, variables: any, context: any) => {
      apiErrorHandler.handleQueryError(error, {
        component,
        action: 'READ',
        metadata: { variables, context },
      })
    },
  }
}

export function createMutationErrorHandler(
  component: string,
  action: string,
  options: {
    onRollback?: () => void | Promise<void>
    successCallback?: () => void
  } = {}
) {
  return {
    onError: (error: any, variables: any, context: any) => {
      const errorContext: any = {
        component,
        action,
        metadata: { variables, context },
      }
      if (options.onRollback) {
        errorContext.rollback = options.onRollback
      }
      apiErrorHandler.handleMutationError(error, errorContext)
    },
    onSuccess: (data: any, variables: any, context: any) => {
      if (options.successCallback) {
        options.successCallback()
      }
      
      // Log successful operations
      if (data?.id) {
        apiErrorHandler.handleSuccess(
          action,
          component,
          data.id,
          { result: data },
          { metadata: { variables, context } }
        )
      }
    },
  }
}

/**
 * Form error handling utilities
 */
export function handleFormErrors(error: any) {
  if (error?.type === 'VALIDATION_ERROR') {
    return error.fieldErrors || {}
  }
  return {}
}

/**
 * Network error detection
 */
export function isNetworkError(error: any): boolean {
  return (
    error?.name === 'NetworkError' ||
    error?.message?.includes('fetch') ||
    error?.code === 'NETWORK_ERROR' ||
    !error?.response
  )
}

/**
 * Retry logic for transient errors
 */
export function shouldRetry(error: any, attempt: number): boolean {
  // Don't retry on client errors (4xx)
  if (error?.data?.httpStatus >= 400 && error?.data?.httpStatus < 500) {
    return false
  }

  // Don't retry after 3 attempts
  if (attempt >= 3) {
    return false
  }

  // Retry on network errors and server errors (5xx)
  return isNetworkError(error) || error?.data?.httpStatus >= 500
}

/**
 * Exponential backoff for retries
 */
export function getRetryDelay(attempt: number): number {
  return Math.min(1000 * Math.pow(2, attempt), 30000) // Max 30 seconds
}

/**
 * Enhanced error logging with context
 */
export function logErrorWithContext(
  error: Error,
  context: {
    component: string
    action: string
    userId?: string
    additionalInfo?: Record<string, any>
  }
) {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    component: context.component,
    action: context.action,
    userId: context.userId,
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server',
    url: typeof window !== 'undefined' ? window.location.href : 'server',
    ...context.additionalInfo,
  }

  console.error('Enhanced Error Log:', errorInfo)
  
  // Send to error tracking service in production
  if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
    // You can integrate with services like Sentry, LogRocket, etc.
    // Example: Sentry.captureException(error, { extra: errorInfo })
  }
}