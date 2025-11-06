'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { AuditRiskLevel, auditLog } from '@/lib/audit/service'
import { showAuthError, showPermissionError } from '@/lib/notifications/toasts'

/**
 * Enhanced Authentication Hook with Role-Based Access Control
 */

export interface UserSession {
  user: {
    id: string
    email: string
    role: 'ADMIN' | 'STAFF' | 'USER'
    emailVerified?: boolean
    isActive: boolean
    profile?: {
      firstName?: string
      lastName?: string
      preferredLanguage?: string
    }
  }
  expires: string
}

/**
 * Enhanced session hook with role checking
 */
export function useEnhancedSession() {
  const { data: session, status } = useSession()

  const isAuthenticated = status === 'authenticated'
  const isLoading = status === 'loading'
  const isUnauthenticated = status === 'unauthenticated'

  const user = session?.user as UserSession['user'] | undefined

  const hasRole = useCallback((role: string | string[]) => {
    if (!user) return false
    const roles = Array.isArray(role) ? role : [role]
    return roles.includes(user.role)
  }, [user])

  const isAdmin = useCallback(() => hasRole('ADMIN'), [hasRole])
  const isStaff = useCallback(() => hasRole(['ADMIN', 'STAFF']), [hasRole])
  const isUser = useCallback(() => hasRole('USER'), [hasRole])

  const canAccess = useCallback((resource: string, action: 'create' | 'read' | 'update' | 'delete') => {
    if (!user) return false

    // Define role-based permissions
    const permissions = {
      ADMIN: {
        all: ['create', 'read', 'update', 'delete'],
        clinic: ['create', 'read', 'update', 'delete'],
        doctor: ['create', 'read', 'update', 'delete'],
        service: ['create', 'read', 'update', 'delete'],
        appointment: ['create', 'read', 'update', 'delete'],
        enquiry: ['create', 'read', 'update', 'delete'],
        user: ['read', 'update', 'delete'],
        analytics: ['read'],
        audit: ['read'],
      },
      STAFF: {
        clinic: ['read', 'update'],
        doctor: ['create', 'read', 'update'],
        service: ['read'],
        appointment: ['read', 'update'],
        enquiry: ['create', 'read', 'update'],
        user: ['read'],
        analytics: ['read'],
        audit: ['read'],
      },
      USER: {
        clinic: ['read'],
        doctor: ['read'],
        service: ['read'],
        appointment: ['create', 'read'],
        enquiry: ['create', 'read'],
        user: ['read', 'update'],
        analytics: [],
        audit: [],
      },
    }

    const userPermissions = permissions[user.role as keyof typeof permissions]
    if (!userPermissions) return false

    // Check if user has permission for the specific resource
    return (userPermissions as any)[resource]?.includes(action)
  }, [user])

  return {
    session,
    user,
    isAuthenticated,
    isLoading,
    isUnauthenticated,
    hasRole,
    isAdmin,
    isStaff,
    isUser,
    canAccess,
  }
}

/**
 * Hook for checking permissions with automatic error handling
 */
export function usePermission(
  resource: string,
  action: 'create' | 'read' | 'update' | 'delete',
  options: {
    showError?: boolean
    redirectTo?: string
  } = {}
) {
  const { canAccess, user, isAuthenticated } = useEnhancedSession()
  const router = useRouter()

  const hasPermission = canAccess(resource, action)

  const checkPermission = useCallback(() => {
    if (!isAuthenticated) {
      showAuthError()
      if (options.redirectTo) {
        router.push(options.redirectTo as any)
      }
      return false
    }

    if (!hasPermission) {
      if (options.showError !== false) {
        showPermissionError()
      }
      return false
    }

    return true
  }, [isAuthenticated, hasPermission, options.redirectTo, router])

  return {
    hasPermission,
    checkPermission,
    user,
    isAuthenticated,
  }
}

/**
 * Hook for protected routes with automatic redirection
 */
export function useProtectedRoute(
  requiredRole?: string | string[],
  options: {
    redirectTo?: string
    onUnauthorized?: () => void
  } = {}
) {
  const { isAuthenticated, hasRole, user } = useEnhancedSession()
  const router = useRouter()

  const hasAccess = useCallback(() => {
    if (!isAuthenticated) {
      if (options.onUnauthorized) {
        options.onUnauthorized()
      } else {
        router.push(`/auth/signin?redirect=${encodeURIComponent(window.location.pathname)}` as any)
      }
      return false
    }

    if (requiredRole && !hasRole(requiredRole)) {
      showPermissionError()
      if (options.onUnauthorized) {
        options.onUnauthorized()
      } else {
        router.push('/unauthorized' as any)
      }
      return false
    }

    return true
  }, [isAuthenticated, hasRole, requiredRole, options, router])

  return {
    hasAccess,
    user,
    isAuthenticated,
  }
}

/**
 * Role-based component wrapper
 */
export function RoleBasedComponent({
  role,
  children,
  fallback = null,
  showError = false,
}: {
  role: string | string[]
  children: React.ReactNode
  fallback?: React.ReactNode
  showError?: boolean
}) {
  const { hasRole } = useEnhancedSession()

  if (!hasRole(role)) {
    if (showError) {
      showPermissionError()
    }
    return <>{fallback}</>
  }

  return <>{children}</>
}

/**
 * Permission-based component wrapper
 */
export function PermissionBasedComponent({
  resource,
  action,
  children,
  fallback = null,
  showError = false,
}: {
  resource: string
  action: 'create' | 'read' | 'update' | 'delete'
  children: React.ReactNode
  fallback?: React.ReactNode
  showError?: boolean
}) {
  const { canAccess } = useEnhancedSession()

  if (!canAccess(resource, action)) {
    if (showError) {
      showPermissionError()
    }
    return <>{fallback}</>
  }

  return <>{children}</>
}

/**
 * Session timeout handler
 */
export function useSessionTimeout(
  timeoutMinutes = 30,
  warningMinutes = 5,
  onTimeout?: () => void
) {
  const { data: session } = useSession()

  const handleTimeout = useCallback(() => {
    if (onTimeout) {
      onTimeout()
    } else {
      // Default timeout behavior
      auditLog.unauthorized('session_timeout', session?.user?.id)
      window.location.href = '/auth/signin?reason=timeout'
    }
  }, [onTimeout, session?.user?.id])

  const resetTimeout = useCallback(() => {
    // This would integrate with session management
    // Implementation depends on specific session handling strategy
  }, [])

  return {
    handleTimeout,
    resetTimeout,
    isAuthenticated: !!session,
  }
}

/**
 * Multi-factor authentication check
 */
export function useMFACheck() {
  const { user } = useEnhancedSession()

  const requiresMFA = useCallback(() => {
    // For sensitive operations, require additional verification
    // This could be based on user role, action type, or risk level
    return user?.role === 'ADMIN' || user?.role === 'STAFF'
  }, [user])

  const hasMFAEnabled = useCallback(() => {
    // Check if user has MFA enabled
    // This would come from user profile or authentication settings
    return user?.role !== 'USER' // Simplified for demo
  }, [user])

  return {
    requiresMFA: requiresMFA(),
    hasMFAEnabled: hasMFAEnabled(),
    shouldRequestMFA: requiresMFA() && !hasMFAEnabled(),
  }
}

/**
 * Audit logging for authentication events
 */
export function useAuditAuth() {
  const { user } = useEnhancedSession()

  const logAuthEvent = useCallback((
    event: 'LOGIN' | 'LOGOUT' | 'LOGIN_FAILED' | 'SESSION_EXPIRED',
    details?: Record<string, unknown>
  ) => {
    if (event === 'LOGIN' || event === 'LOGOUT') {
      if (user?.id) {
        auditLog.userLogin(user.id)
      }
    } else if (event === 'LOGIN_FAILED') {
      auditLog.userLoginFailed(user?.id, details)
    }
  }, [user?.id])

  const logSecurityEvent = useCallback((
    event: 'PERMISSION_DENIED' | 'UNAUTHORIZED' | 'SUSPICIOUS_ACTIVITY',
    resource: string,
    details?: Record<string, unknown>
  ) => {
    auditLog.suspiciousActivity(resource, user?.id, {
      ...details,
      riskLevel: AuditRiskLevel.HIGH,
      userRole: user?.role,
    })
  }, [user?.id, user?.role])

  return {
    logAuthEvent,
    logSecurityEvent,
  }
}

/**
 * Session context provider for advanced session management
 */
export function useSessionContext() {
  const { data: session } = useSession()
  const { logAuthEvent } = useAuditAuth()

  const extendSession = useCallback(async () => {
    // This would call an API to extend the session
    try {
      const response = await fetch('/api/auth/extend-session', {
        method: 'POST',
      })

      if (response.ok) {
        logAuthEvent('LOGIN') // Log session extension
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to extend session:', error)
      return false
    }
  }, [logAuthEvent])

  const endSession = useCallback(async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' })
      logAuthEvent('LOGOUT')
      window.location.href = '/auth/signin'
    } catch (error) {
      console.error('Failed to end session:', error)
    }
  }, [logAuthEvent])

  const refreshSession = useCallback(async () => {
    // This would refresh the session data
    // Implementation depends on NextAuth configuration
    window.location.reload()
  }, [])

  return {
    session,
    extendSession,
    endSession,
    refreshSession,
  }
}