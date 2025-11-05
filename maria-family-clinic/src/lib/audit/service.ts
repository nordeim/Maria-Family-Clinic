'use client'

import { TRPC_ERROR_CODES } from '@/server/api/trpc'
import type { AuditAction } from '@/server/api/trpc'

/**
 * Audit Logging Service - Automatic tracking for all user actions
 */

export interface AuditMetadata {
  component?: string
  action?: string
  userId?: string
  sessionId?: string
  ipAddress?: string
  userAgent?: string
  url?: string
  method?: string
  statusCode?: number
  duration?: number
  errorCode?: string
  additionalInfo?: Record<string, any>
}

/**
 * Types of audit events
 */
export const AUDIT_ACTIONS = {
  // Authentication
  USER_LOGIN: 'USER_LOGIN',
  USER_LOGOUT: 'USER_LOGOUT',
  USER_LOGIN_FAILED: 'USER_LOGIN_FAILED',
  USER_SESSION_EXPIRED: 'USER_SESSION_EXPIRED',
  
  // User Management
  USER_CREATED: 'USER_CREATED',
  USER_UPDATED: 'USER_UPDATED',
  USER_DELETED: 'USER_DELETED',
  PROFILE_UPDATED: 'PROFILE_UPDATED',
  ROLE_CHANGED: 'ROLE_CHANGED',
  
  // Clinic Operations
  CLINIC_CREATED: 'CLINIC_CREATED',
  CLINIC_UPDATED: 'CLINIC_UPDATED',
  CLINIC_DELETED: 'CLINIC_DELETED',
  CLINIC_VIEWED: 'CLINIC_VIEWED',
  CLINIC_SEARCH: 'CLINIC_SEARCH',
  
  // Doctor Operations
  DOCTOR_CREATED: 'DOCTOR_CREATED',
  DOCTOR_UPDATED: 'DOCTOR_UPDATED',
  DOCTOR_DELETED: 'DOCTOR_DELETED',
  DOCTOR_VIEWED: 'DOCTOR_VIEWED',
  DOCTOR_SCHEDULE_VIEWED: 'DOCTOR_SCHEDULE_VIEWED',
  
  // Service Operations
  SERVICE_CREATED: 'SERVICE_CREATED',
  SERVICE_UPDATED: 'SERVICE_UPDATED',
  SERVICE_DELETED: 'SERVICE_DELETED',
  SERVICE_VIEWED: 'SERVICE_VIEWED',
  
  // Appointment Operations
  APPOINTMENT_CREATED: 'APPOINTMENT_CREATED',
  APPOINTMENT_UPDATED: 'APPOINTMENT_UPDATED',
  APPOINTMENT_CANCELLED: 'APPOINTMENT_CANCELLED',
  APPOINTMENT_COMPLETED: 'APPOINTMENT_COMPLETED',
  APPOINTMENT_VIEWED: 'APPOINTMENT_VIEWED',
  APPOINTMENT_NO_SHOW: 'APPOINTMENT_NO_SHOW',
  
  // Enquiry Operations
  ENQUIRY_CREATED: 'ENQUIRY_CREATED',
  ENQUIRY_UPDATED: 'ENQUIRY_UPDATED',
  ENQUIRY_RESOLVED: 'ENQUIRY_RESOLVED',
  ENQUIRY_VIEWED: 'ENQUIRY_VIEWED',
  
  // Healthier SG
  HEALTHIER_SG_ENROLLED: 'HEALTHIER_SG_ENROLLED',
  HEALTHIER_SG_ENROLLMENT_UPDATED: 'HEALTHIER_SG_ENROLLMENT_UPDATED',
  HEALTHIER_SG_STATUS_CHANGED: 'HEALTHIER_SG_STATUS_CHANGED',
  
  // System Events
  DATA_EXPORTED: 'DATA_EXPORTED',
  BULK_OPERATION: 'BULK_OPERATION',
  SYSTEM_BACKUP: 'SYSTEM_BACKUP',
  CONFIGURATION_CHANGED: 'CONFIGURATION_CHANGED',
  
  // Security Events
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  ACCOUNT_UNLOCKED: 'ACCOUNT_UNLOCKED',
} as const

export type AuditActionType = typeof AUDIT_ACTIONS[keyof typeof AUDIT_ACTIONS]

/**
 * Risk levels for audit events
 */
export enum AuditRiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

/**
 * Audit logging service
 */
export class AuditService {
  private static instance: AuditService
  private buffer: Array<{
    action: AuditActionType
    entity: string
    entityId: string
    changes?: Record<string, unknown>
    metadata: AuditMetadata
  }> = []
  private readonly BUFFER_SIZE = 10
  private readonly FLUSH_INTERVAL = 5000 // 5 seconds
  private flushTimer: NodeJS.Timeout | null = null
  private isOnline = true

  private constructor() {
    // Monitor online status
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true
        this.flushBuffer()
      })
      
      window.addEventListener('offline', () => {
        this.isOnline = false
      })

      // Start flush timer
      this.startFlushTimer()
    }
  }

  static getInstance(): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService()
    }
    return AuditService.instance
  }

  /**
   * Log an audit event
   */
  async log(
    action: AuditActionType,
    entity: string,
    entityId: string,
    changes?: Record<string, unknown>,
    metadata?: AuditMetadata
  ): Promise<void> {
    const auditEvent = {
      action,
      entity,
      entityId,
      changes: changes || {},
      metadata: {
        ...this.getDefaultMetadata(),
        ...metadata,
        timestamp: new Date().toISOString(),
      },
    }

    // Add to buffer
    this.buffer.push(auditEvent)

    // Flush if buffer is full or in critical situations
    if (this.buffer.length >= this.BUFFER_SIZE || this.isCriticalEvent(action)) {
      await this.flushBuffer()
    }
  }

  /**
   * Flush the buffer to the server
   */
  private async flushBuffer(): Promise<void> {
    if (this.buffer.length === 0) return

    const eventsToSend = [...this.buffer]
    this.buffer = []

    if (!this.isOnline) {
      // Store in local storage for later sync
      this.storeOfflineEvents(eventsToSend)
      return
    }

    try {
      // Send to audit API
      for (const event of eventsToSend) {
        await this.sendAuditEvent(event)
      }
    } catch (error) {
      console.error('Failed to send audit events:', error)
      // Re-add failed events to buffer for retry
      this.buffer.unshift(...eventsToSend)
    }
  }

  /**
   * Send individual audit event
   */
  private async sendAuditEvent(event: any): Promise<void> {
    // This would use the tRPC audit.create mutation
    // For now, we'll use fetch directly to avoid circular dependencies
    try {
      await fetch('/api/trpc/audit.create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: {
            action: event.action,
            entity: event.entity,
            entityId: event.entityId,
            changes: event.changes,
            metadata: event.metadata,
            ipAddress: event.metadata.ipAddress,
            userAgent: event.metadata.userAgent,
            sessionId: event.metadata.sessionId,
          },
        }),
      })
    } catch (error) {
      console.error('Failed to send audit event:', error)
      throw error
    }
  }

  /**
   * Get default metadata
   */
  private getDefaultMetadata(): AuditMetadata {
    if (typeof window === 'undefined') {
      return {
        url: 'server',
        userAgent: 'server',
      }
    }

    return {
      url: window.location.href,
      userAgent: navigator.userAgent,
      ipAddress: 'client', // Would be determined on server side
    }
  }

  /**
   * Check if event is critical
   */
  private isCriticalEvent(action: AuditActionType): boolean {
    const criticalEvents: AuditActionType[] = [
      AUDIT_ACTIONS.USER_LOGIN_FAILED,
      AUDIT_ACTIONS.PERMISSION_DENIED,
      AUDIT_ACTIONS.UNAUTHORIZED_ACCESS,
      AUDIT_ACTIONS.SUSPICIOUS_ACTIVITY,
      AUDIT_ACTIONS.ACCOUNT_LOCKED,
      AUDIT_ACTIONS.USER_DELETED,
      AUDIT_ACTIONS.DATA_EXPORTED,
      AUDIT_ACTIONS.SYSTEM_BACKUP,
    ]

    return criticalEvents.includes(action)
  }

  /**
   * Store offline events
   */
  private storeOfflineEvents(events: any[]): void {
    try {
      const existing = localStorage.getItem('offline-audit-events') || '[]'
      const offlineEvents = JSON.parse(existing)
      offlineEvents.push(...events)
      localStorage.setItem('offline-audit-events', JSON.stringify(offlineEvents))
    } catch (error) {
      console.error('Failed to store offline audit events:', error)
    }
  }

  /**
   * Sync offline events when back online
   */
  async syncOfflineEvents(): Promise<void> {
    try {
      const stored = localStorage.getItem('offline-audit-events')
      if (!stored) return

      const offlineEvents = JSON.parse(stored)
      if (offlineEvents.length === 0) return

      // Send all offline events
      for (const event of offlineEvents) {
        await this.sendAuditEvent(event)
      }

      // Clear offline events
      localStorage.removeItem('offline-audit-events')
    } catch (error) {
      console.error('Failed to sync offline audit events:', error)
    }
  }

  /**
   * Start flush timer
   */
  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
    }

    this.flushTimer = setInterval(() => {
      this.flushBuffer()
    }, this.FLUSH_INTERVAL)
  }

  /**
   * Stop flush timer
   */
  stop(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
      this.flushTimer = null
    }
  }

  /**
   * Manual flush
   */
  async flush(): Promise<void> {
    await this.flushBuffer()
  }

  /**
   * Get buffer size
   */
  getBufferSize(): number {
    return this.buffer.length
  }
}

// Export singleton instance
export const auditService = AuditService.getInstance()

/**
 * Audit middleware for automatic logging
 */
export class AuditMiddleware {
  private auditService = auditService

  /**
   * Log API requests automatically
   */
  async logApiRequest(
    endpoint: string,
    method: string,
    statusCode: number,
    duration: number,
    userId?: string,
    entity?: string,
    entityId?: string
  ): Promise<void> {
    const action = this.getApiActionFromEndpoint(endpoint, method, statusCode)
    const entityName = entity || this.extractEntityFromEndpoint(endpoint)

    await this.auditService.log(
      action,
      entityName,
      entityId || 'N/A',
      {
        endpoint,
        method,
        statusCode,
        duration,
      },
      {
        action: `${method}_${endpoint}`,
        ipAddress: 'client', // Would be server-side
        userId,
      }
    )
  }

  /**
   * Log database operations
   */
  async logDatabaseOperation(
    operation: 'CREATE' | 'UPDATE' | 'DELETE' | 'READ',
    entity: string,
    entityId: string,
    changes?: Record<string, unknown>,
    userId?: string
  ): Promise<void> {
    const action = this.getDatabaseAction(operation, entity)
    
    await this.auditService.log(
      action,
      entity,
      entityId,
      changes,
      {
        userId,
        action: `${operation}_${entity}`,
      }
    )
  }

  /**
   * Log user authentication events
   */
  async logAuthEvent(
    event: 'LOGIN' | 'LOGIN_FAILED' | 'LOGOUT' | 'SESSION_EXPIRED',
    userId?: string,
    details?: Record<string, unknown>
  ): Promise<void> {
    const action = AUDIT_ACTIONS[`USER_${event}` as keyof typeof AUDIT_ACTIONS]
    
    await this.auditService.log(
      action,
      'User',
      userId || 'anonymous',
      details,
      {
        userId: userId || 'anonymous',
        action: `AUTH_${event}`,
      }
    )
  }

  /**
   * Log permission-related events
   */
  async logPermissionEvent(
    event: 'ACCESS_DENIED' | 'UNAUTHORIZED' | 'SUSPICIOUS_ACTIVITY',
    resource: string,
    userId?: string,
    details?: Record<string, unknown>
  ): Promise<void> {
    const action = this.getPermissionAction(event)
    
    await this.auditService.log(
      action,
      resource,
      'N/A',
      details,
      {
        userId,
        action: `PERMISSION_${event}`,
      }
    )
  }

  private getApiActionFromEndpoint(
    endpoint: string,
    method: string,
    statusCode: number
  ): AuditActionType {
    if (statusCode >= 400) {
      return AUDIT_ACTIONS.PERMISSION_DENIED
    }

    if (endpoint.includes('/clinic')) {
      return method === 'GET' ? AUDIT_ACTIONS.CLINIC_VIEWED : AUDIT_ACTIONS.CLINIC_UPDATED
    } else if (endpoint.includes('/doctor')) {
      return method === 'GET' ? AUDIT_ACTIONS.DOCTOR_VIEWED : AUDIT_ACTIONS.DOCTOR_UPDATED
    } else if (endpoint.includes('/appointment')) {
      return method === 'GET' ? AUDIT_ACTIONS.APPOINTMENT_VIEWED : AUDIT_ACTIONS.APPOINTMENT_UPDATED
    } else if (endpoint.includes('/enquiry')) {
      return method === 'GET' ? AUDIT_ACTIONS.ENQUIRY_VIEWED : AUDIT_ACTIONS.ENQUIRY_UPDATED
    }

    return AUDIT_ACTIONS.CLINIC_VIEWED // Default
  }

  private getDatabaseAction(operation: string, entity: string): AuditActionType {
    switch (operation) {
      case 'CREATE':
        return `CREATE_${entity.toUpperCase()}` as AuditActionType
      case 'UPDATE':
        return `UPDATE_${entity.toUpperCase()}` as AuditActionType
      case 'DELETE':
        return `DELETE_${entity.toUpperCase()}` as AuditActionType
      case 'READ':
        return `${entity.toUpperCase()}_VIEWED` as AuditActionType
      default:
        return `UNKNOWN_${entity.toUpperCase()}` as AuditActionType
    }
  }

  private getPermissionAction(event: string): AuditActionType {
    switch (event) {
      case 'ACCESS_DENIED':
        return AUDIT_ACTIONS.PERMISSION_DENIED
      case 'UNAUTHORIZED':
        return AUDIT_ACTIONS.UNAUTHORIZED_ACCESS
      case 'SUSPICIOUS_ACTIVITY':
        return AUDIT_ACTIONS.SUSPICIOUS_ACTIVITY
      default:
        return AUDIT_ACTIONS.PERMISSION_DENIED
    }
  }

  private extractEntityFromEndpoint(endpoint: string): string {
    const parts = endpoint.split('/')
    return parts[1] || 'Unknown'
  }
}

// Export middleware instance
export const auditMiddleware = new AuditMiddleware()

/**
 * Convenience functions for common audit patterns
 */
export const auditLog = {
  // User actions
  userLogin: (userId: string) => auditMiddleware.logAuthEvent('LOGIN', userId),
  userLoginFailed: (userId?: string, details?: any) => auditMiddleware.logAuthEvent('LOGIN_FAILED', userId, details),
  userLogout: (userId?: string) => auditMiddleware.logAuthEvent('LOGOUT', userId),

  // CRUD operations
  create: (entity: string, entityId: string, data: any, userId?: string) =>
    auditMiddleware.logDatabaseOperation('CREATE', entity, entityId, data, userId),
  
  update: (entity: string, entityId: string, changes: any, userId?: string) =>
    auditMiddleware.logDatabaseOperation('UPDATE', entity, entityId, changes, userId),
  
  delete: (entity: string, entityId: string, userId?: string) =>
    auditMiddleware.logDatabaseOperation('DELETE', entity, entityId, {}, userId),
  
  read: (entity: string, entityId: string, userId?: string) =>
    auditMiddleware.logDatabaseOperation('READ', entity, entityId, {}, userId),

  // Permission events
  accessDenied: (resource: string, userId?: string, details?: any) =>
    auditMiddleware.logPermissionEvent('ACCESS_DENIED', resource, userId, details),
  
  unauthorized: (resource: string, userId?: string, details?: any) =>
    auditMiddleware.logPermissionEvent('UNAUTHORIZED', resource, userId, details),
  
  suspiciousActivity: (resource: string, userId?: string, details?: any) =>
    auditMiddleware.logPermissionEvent('SUSPICIOUS_ACTIVITY', resource, userId, details),
}