import { z } from 'zod'
import { createTRPCRouter, publicProcedure, protectedProcedure, staffProcedure, adminProcedure, calculatePagination } from '../trpc'
import { TRPCError } from '@trpc/server'
import { Prisma } from '@prisma/client'
import {
  ContactMethod,
  ContactType,
  ContactHistoryStatus,
  ContactAccessLevel,
  NotificationType,
  NotificationChannel,
  NotificationPriority,
  IntegrationType
} from '../../../lib/types/contact-system'

// ============================================================================
// CONTACT INTEGRATION ROUTER
// ============================================================================

export const contactIntegrationRouter = createTRPCRouter({
  /**
   * Get user's contact integration context and available integration points
   */
  getIntegrationContext: protectedProcedure
    .input(
      z.object({
        clinicId: z.string().uuid().optional(),
        doctorId: z.string().uuid().optional(),
        serviceId: z.string().uuid().optional(),
        appointmentId: z.string().uuid().optional(),
        healthierSgEnrollmentId: z.string().uuid().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId } = ctx.session.user
      const { clinicId, doctorId, serviceId, appointmentId, healthierSgEnrollmentId } = input

      try {
        // Get user contact preferences
        const userPreferences = await ctx.prisma.userContactPreferences.findUnique({
          where: { userId },
        })

        // Get user contact history
        const recentHistory = await ctx.prisma.userContactHistory.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            contactType: true,
            contactCategory: true,
            purpose: true,
            method: true,
            status: true,
            resolved: true,
            createdAt: true,
          },
        })

        // Get integration mappings for context entities
        const integrationMappings = await ctx.prisma.contactIntegrationMapping.findMany({
          where: {
            OR: [
              clinicId ? { clinicId } : undefined,
              doctorId ? { doctorId } : undefined,
              serviceId ? { serviceId } : undefined,
              appointmentId ? { appointmentId } : undefined,
              healthierSgEnrollmentId ? { healthierSgEnrollmentId } : undefined,
            ].filter(Boolean),
          },
          include: {
            contactForm: {
              select: {
                id: true,
                referenceNumber: true,
                status: true,
                submittedAt: true,
              },
            },
            enquiry: {
              select: {
                id: true,
                referenceNumber: true,
                status: true,
                response: true,
                resolvedAt: true,
              },
            },
          },
        })

        // Get available contact points based on context
        const availableContactPoints: Array<{
          type: string
          title: string
          description: string
          priority: 'high' | 'normal' | 'low'
          prefillData?: Record<string, any>
        }> = []

        if (clinicId) {
          // Add clinic-specific contact options
          const clinic = await ctx.prisma.clinic.findUnique({
            where: { id: clinicId },
            select: { name: true },
          })
          
          availableContactPoints.push({
            type: 'clinic_general',
            title: `Contact ${clinic?.name}`,
            description: 'General inquiries about this clinic',
            priority: 'normal',
            prefillData: { clinicId, type: 'general' },
          })
        }

        if (doctorId) {
          // Add doctor-specific contact options
          const doctor = await ctx.prisma.doctor.findUnique({
            where: { id: doctorId },
            select: { 
              firstName: true, 
              lastName: true, 
              specialization: true,
              clinicId: true 
            },
          })

          availableContactPoints.push({
            type: 'doctor_consultation',
            title: `Contact Dr. ${doctor?.firstName} ${doctor?.lastName}`,
            description: `Questions about ${doctor?.specialization} consultation`,
            priority: 'high',
            prefillData: { doctorId, type: 'consultation' },
          })
        }

        if (serviceId) {
          // Add service-specific contact options
          const service = await ctx.prisma.service.findUnique({
            where: { id: serviceId },
            select: { name: true, category: true },
          })

          availableContactPoints.push({
            type: 'service_inquiry',
            title: `Inquire about ${service?.name}`,
            description: 'Questions about this specific service',
            priority: 'normal',
            prefillData: { serviceId, type: 'service_inquiry' },
          })
        }

        if (appointmentId) {
          // Add appointment-specific contact options
          availableContactPoints.push({
            type: 'appointment_support',
            title: 'Appointment Support',
            description: 'Questions about your appointment',
            priority: 'high',
            prefillData: { appointmentId, type: 'appointment_support' },
          })
        }

        if (healthierSgEnrollmentId) {
          // Add Healthier SG specific contact options
          availableContactPoints.push({
            type: 'healthier_sg_support',
            title: 'Healthier SG Program Support',
            description: 'Questions about your Healthier SG enrollment',
            priority: 'high',
            prefillData: { healthierSgEnrollmentId, type: 'healthier_sg_support' },
          })
        }

        return {
          userPreferences,
          recentHistory,
          integrationMappings,
          availableContactPoints,
          isContactAllowed: userPreferences?.doNotDisturb ? false : true,
          preferredContactMethod: userPreferences?.preferredContactMethod || ContactMethod.EMAIL,
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to get integration context',
          cause: error,
        })
      }
    }),

  /**
   * Open contact form with context-aware pre-filling
   */
  openContactForm: protectedProcedure
    .input(
      z.object({
        context: z.object({
          clinicId: z.string().uuid().optional(),
          doctorId: z.string().uuid().optional(),
          serviceId: z.string().uuid().optional(),
          appointmentId: z.string().uuid().optional(),
          healthierSgEnrollmentId: z.string().uuid().optional(),
        }),
        contactType: z.nativeEnum(ContactType),
        category: z.string().optional(),
        subject: z.string().optional(),
        message: z.string().optional(),
        priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.session.user
      const { context, contactType, category, subject, message, priority } = input

      try {
        // Get user preferences and contact information
        const userPreferences = await ctx.prisma.userContactPreferences.findUnique({
          where: { userId },
        })

        const user = await ctx.prisma.user.findUnique({
          where: { id: userId },
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            id: true,
          },
        })

        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          })
        }

        // Build pre-filled form data
        const prefillData: Record<string, any> = {
          userId,
          contactType,
          subject: subject || '',
          message: message || '',
        }

        // Add context-specific data
        Object.entries(context).forEach(([key, value]) => {
          if (value) {
            prefillData[key] = value
          }
        })

        // Determine appropriate contact category
        let selectedCategory = category
        if (!selectedCategory) {
          // Auto-select category based on context and contact type
          if (context.appointmentId) {
            selectedCategory = 'appointment'
          } else if (context.doctorId) {
            selectedCategory = 'consultation'
          } else if (context.serviceId) {
            selectedCategory = 'service_inquiry'
          } else if (context.healthierSgEnrollmentId) {
            selectedCategory = 'healthier_sg'
          } else {
            selectedCategory = 'general'
          }
        }

        // Track the contact form opening event
        const trackingId = await ctx.prisma.contactIntegrationActivity.create({
          data: {
            userId,
            integrationType: IntegrationType.FORM_OPENING,
            context: {
              ...context,
              contactType,
              category: selectedCategory,
            },
            metadata: {
              subject,
              message,
              priority,
              timestamp: new Date().toISOString(),
            },
            timestamp: new Date(),
          },
        })

        return {
          trackingId,
          prefillData,
          selectedCategory,
          userContactInfo: {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            preferredContactMethod: userPreferences?.preferredContactMethod || ContactMethod.EMAIL,
          },
          allowedContactMethods: userPreferences ? [
            userPreferences.preferredContactMethod,
            userPreferences.secondaryContactMethod,
            userPreferences.emergencyContactMethod,
          ].filter(Boolean) : [ContactMethod.EMAIL],
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to open contact form',
          cause: error,
        })
      }
    }),

  /**
   * Track contact activity and user interactions
   */
  trackActivity: protectedProcedure
    .input(
      z.object({
        activityType: z.nativeEnum(IntegrationType),
        context: z.record(z.any()).optional(),
        metadata: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.session.user
      const { activityType, context, metadata } = input

      try {
        const activity = await ctx.prisma.contactIntegrationActivity.create({
          data: {
            userId,
            integrationType: activityType,
            context: context || {},
            metadata: {
              ...metadata,
              timestamp: new Date().toISOString(),
              userAgent: ctx.headers['user-agent'],
              ipAddress: ctx.headers['x-forwarded-for'] || ctx.headers['x-real-ip'],
            },
            timestamp: new Date(),
          },
        })

        return activity
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to track contact activity',
          cause: error,
        })
      }
    }),
})

// ============================================================================
// CONTACT HISTORY ROUTER
// ============================================================================

export const contactHistoryRouter = createTRPCRouter({
  /**
   * Get user's contact history with filtering and pagination
   */
  getUserHistory: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(10),
        contactType: z.nativeEnum(ContactType).optional(),
        status: z.nativeEnum(ContactHistoryStatus).optional(),
        method: z.nativeEnum(ContactMethod).optional(),
        resolved: z.boolean().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        search: z.string().optional(),
        clinicId: z.string().uuid().optional(),
        doctorId: z.string().uuid().optional(),
        serviceId: z.string().uuid().optional(),
        includeMedicalRelevance: z.boolean().default(false),
        orderBy: z.enum(['createdAt', 'updatedAt', 'satisfaction', 'responseTime']).default('createdAt'),
        orderDirection: z.enum(['asc', 'desc']).default('desc'),
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId } = ctx.session.user
      const { 
        page, 
        limit, 
        contactType, 
        status, 
        method, 
        resolved, 
        startDate, 
        endDate, 
        search,
        clinicId,
        doctorId,
        serviceId,
        includeMedicalRelevance,
        orderBy,
        orderDirection 
      } = input
      
      const skip = (page - 1) * limit

      // Build where clause
      const where: Prisma.UserContactHistoryWhereInput = { userId }

      if (contactType) {
        where.contactType = contactType
      }

      if (status) {
        where.status = status
      }

      if (method) {
        where.method = method
      }

      if (resolved !== undefined) {
        where.resolved = resolved
      }

      if (clinicId || doctorId || serviceId) {
        where.OR = [
          clinicId ? { clinicId } : undefined,
          doctorId ? { doctorId } : undefined,
          serviceId ? { serviceId } : undefined,
        ].filter(Boolean)
      }

      if (startDate || endDate) {
        where.createdAt = {}
        if (startDate) where.createdAt.gte = startDate
        if (endDate) where.createdAt.lte = endDate
      }

      if (search) {
        where.OR = [
          { purpose: { contains: search, mode: 'insensitive' } },
          { subject: { contains: search, mode: 'insensitive' } },
          { summary: { contains: search, mode: 'insensitive' } },
          { contactCategory: { contains: search, mode: 'insensitive' } },
        ]
      }

      // Security: Only include medical relevance if explicitly requested and user has consent
      if (!includeMedicalRelevance) {
        where.medicalRelevance = false
      }

      // Build orderBy clause
      const orderByClause: Prisma.UserContactHistoryOrderByWithRelationInput = { [orderBy]: orderDirection }

      try {
        const [contactHistory, total] = await Promise.all([
          ctx.prisma.userContactHistory.findMany({
            where,
            select: {
              id: true,
              contactType: true,
              contactCategory: true,
              purpose: true,
              method: true,
              subject: true,
              summary: true,
              outcome: true,
              followUpRequired: true,
              followUpDate: true,
              followUpCompleted: true,
              status: true,
              resolved: true,
              satisfaction: true,
              responseTime: true,
              resolutionTime: true,
              cost: true,
              qualityScore: true,
              createdAt: true,
              updatedAt: true,
              // Medical data (only if includeMedicalRelevance is true and user consented)
              ...(includeMedicalRelevance ? {
                relatedHealthData: true,
                medicalRelevance: true,
                prescriptionMentioned: true,
              } : {}),
              // Related entities
              contactForm: {
                select: {
                  id: true,
                  referenceNumber: true,
                  status: true,
                  submittedAt: true,
                },
              },
              enquiry: {
                select: {
                  id: true,
                  referenceNumber: true,
                  status: true,
                  response: true,
                  resolvedAt: true,
                },
              },
            },
            skip,
            take: limit,
            orderBy: orderByClause,
          }),
          ctx.prisma.userContactHistory.count({ where }),
        ])

        return {
          data: contactHistory,
          pagination: calculatePagination(page, limit, total),
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch contact history',
          cause: error,
        })
      }
    }),

  /**
   * Get contact history summary and statistics
   */
  getHistorySummary: protectedProcedure
    .input(
      z.object({
        period: z.enum(['week', 'month', 'quarter', 'year']).default('month'),
        includeResolved: z.boolean().default(true),
        includeMedicalRelevance: z.boolean().default(false),
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId } = ctx.session.user
      const { period, includeResolved, includeMedicalRelevance } = input

      try {
        // Calculate date range
        const now = new Date()
        let startDate: Date

        switch (period) {
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            break
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
            break
          case 'quarter':
            startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
            break
          case 'year':
            startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
            break
        }

        const where: Prisma.UserContactHistoryWhereInput = {
          userId,
          createdAt: { gte: startDate },
        }

        if (!includeResolved) {
          where.resolved = false
        }

        if (!includeMedicalRelevance) {
          where.medicalRelevance = false
        }

        // Get statistics
        const [
          totalContacts,
          resolvedContacts,
          pendingContacts,
          avgSatisfaction,
          avgResponseTime,
          contactTypeBreakdown,
          methodBreakdown,
          recentActivity
        ] = await Promise.all([
          ctx.prisma.userContactHistory.count({ where }),
          ctx.prisma.userContactHistory.count({ where: { ...where, resolved: true } }),
          ctx.prisma.userContactHistory.count({ where: { ...where, resolved: false } }),
          ctx.prisma.userContactHistory.aggregate({
            where: { ...where, satisfaction: { not: null } },
            _avg: { satisfaction: true },
          }),
          ctx.prisma.userContactHistory.aggregate({
            where: { ...where, responseTime: { not: null } },
            _avg: { responseTime: true },
          }),
          ctx.prisma.userContactHistory.groupBy({
            by: ['contactType'],
            where,
            _count: { contactType: true },
          }),
          ctx.prisma.userContactHistory.groupBy({
            by: ['method'],
            where,
            _count: { method: true },
          }),
          ctx.prisma.userContactHistory.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
              id: true,
              contactType: true,
              purpose: true,
              method: true,
              status: true,
              resolved: true,
              createdAt: true,
            },
          }),
        ])

        return {
          period,
          dateRange: { start: startDate, end: now },
          totals: {
            total: totalContacts,
            resolved: resolvedContacts,
            pending: pendingContacts,
            resolutionRate: totalContacts > 0 ? (resolvedContacts / totalContacts) * 100 : 0,
          },
          averages: {
            satisfaction: avgSatisfaction._avg.satisfaction || 0,
            responseTimeMinutes: Math.round(avgResponseTime._avg.responseTime || 0),
          },
          breakdowns: {
            byType: contactTypeBreakdown.map(item => ({
              type: item.contactType,
              count: item._count.contactType,
            })),
            byMethod: methodBreakdown.map(item => ({
              method: item.method,
              count: item._count.method,
            })),
          },
          recentActivity,
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch contact history summary',
          cause: error,
        })
      }
    }),

  /**
   * Update contact history entry
   */
  updateHistoryEntry: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        followUpCompleted: z.boolean().optional(),
        followUpNotes: z.string().optional(),
        satisfaction: z.number().min(1).max(5).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.session.user
      const { id, followUpCompleted, followUpNotes, satisfaction, notes } = input

      try {
        // Verify ownership
        const existingEntry = await ctx.prisma.userContactHistory.findFirst({
          where: { id, userId },
        })

        if (!existingEntry) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Contact history entry not found',
          })
        }

        const updateData: Prisma.UserContactHistoryUpdateInput = {}

        if (followUpCompleted !== undefined) {
          updateData.followUpCompleted = followUpCompleted
          if (followUpCompleted && followUpNotes) {
            updateData.followUpNotes = followUpNotes
          }
        }

        if (satisfaction !== undefined) {
          updateData.satisfaction = satisfaction
        }

        if (notes !== undefined) {
          updateData.notes = notes
        }

        const updatedEntry = await ctx.prisma.userContactHistory.update({
          where: { id },
          data: {
            ...updateData,
            updatedAt: new Date(),
          },
          select: {
            id: true,
            followUpCompleted: true,
            followUpNotes: true,
            satisfaction: true,
            notes: true,
            updatedAt: true,
          },
        })

        return updatedEntry
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to update contact history entry',
          cause: error,
        })
      }
    }),
})

// ============================================================================
// CONTACT PREFERENCES ROUTER
// ============================================================================

export const contactPreferencesRouter = createTRPCRouter({
  /**
   * Get user contact preferences
   */
  getPreferences: protectedProcedure
    .query(async ({ ctx }) => {
      const { userId } = ctx.session.user

      try {
        const preferences = await ctx.prisma.userContactPreferences.findUnique({
          where: { userId },
        })

        return preferences
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch contact preferences',
          cause: error,
        })
      }
    }),

  /**
   * Create or update user contact preferences
   */
  updatePreferences: protectedProcedure
    .input(
      z.object({
        preferredContactMethod: z.nativeEnum(ContactMethod).optional(),
        secondaryContactMethod: z.nativeEnum(ContactMethod).optional(),
        emergencyContactMethod: z.nativeEnum(ContactMethod).optional(),
        allowDirectContact: z.boolean().optional(),
        allowEmailMarketing: z.boolean().optional(),
        allowSmsUpdates: z.boolean().optional(),
        allowPhoneCalls: z.boolean().optional(),
        allowWhatsAppUpdates: z.boolean().optional(),
        contactAllowedFrom: z.string().regex(/^\d{2}:\d{2}$/).optional(),
        contactAllowedTo: z.string().regex(/^\d{2}:\d{2}$/).optional(),
        timezone: z.string().optional(),
        doNotDisturb: z.boolean().optional(),
        medicalUpdatesViaEmail: z.boolean().optional(),
        appointmentReminders: z.boolean().optional(),
        healthGoalReminders: z.boolean().optional(),
        programEnrollmentUpdates: z.boolean().optional(),
        emergencyNotifications: z.boolean().optional(),
        preferredFollowUpTime: z.number().min(1).max(30).optional(),
        contactHistoryAccess: z.boolean().optional(),
        shareContactWithPartners: z.boolean().optional(),
        dataRetentionPeriod: z.number().min(30).max(1095).optional(),
        contactDataEncrypted: z.boolean().optional(),
        thirdPartySharing: z.boolean().optional(),
        marketingTracking: z.boolean().optional(),
        healthierSgNotifications: z.boolean().optional(),
        healthierSgContactPreferences: z.record(z.any()).optional(),
        appointmentRelatedContact: z.boolean().optional(),
        serviceRelatedContact: z.boolean().optional(),
        programEnrollmentContact: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.session.user

      try {
        const preferences = await ctx.prisma.userContactPreferences.upsert({
          where: { userId },
          update: {
            ...input,
            updatedAt: new Date(),
          },
          create: {
            userId,
            ...input,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        })

        return preferences
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to update contact preferences',
          cause: error,
        })
      }
    }),

  /**
   * Delete user contact preferences
   */
  deletePreferences: protectedProcedure
    .mutation(async ({ ctx }) => {
      const { userId } = ctx.session.user

      try {
        await ctx.prisma.userContactPreferences.delete({
          where: { userId },
        })

        return { success: true }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete contact preferences',
          cause: error,
        })
      }
    }),
})

// ============================================================================
// CONTACT NOTIFICATIONS ROUTER
// ============================================================================

export const contactNotificationsRouter = createTRPCRouter({
  /**
   * Get user's contact-related notifications
   */
  getNotifications: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(10),
        type: z.nativeEnum(NotificationType).optional(),
        channel: z.nativeEnum(NotificationChannel).optional(),
        priority: z.nativeEnum(NotificationPriority).optional(),
        unreadOnly: z.boolean().default(false),
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId } = ctx.session.user
      const { page, limit, type, channel, priority, unreadOnly } = input

      const skip = (page - 1) * limit

      const where: Prisma.ContactNotificationWhereInput = { userId }

      if (type) {
        where.type = type
      }

      if (channel) {
        where.channel = channel
      }

      if (priority) {
        where.priority = priority
      }

      if (unreadOnly) {
        where.readAt = null
      }

      try {
        const [notifications, total, unreadCount] = await Promise.all([
          ctx.prisma.contactNotification.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
            select: {
              id: true,
              type: true,
              channel: true,
              priority: true,
              title: true,
              message: true,
              actionUrl: true,
              actionText: true,
              readAt: true,
              createdAt: true,
            },
          }),
          ctx.prisma.contactNotification.count({ where }),
          ctx.prisma.contactNotification.count({ 
            where: { ...where, readAt: null } 
          }),
        ])

        return {
          data: notifications,
          pagination: calculatePagination(page, limit, total),
          unreadCount,
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch contact notifications',
          cause: error,
        })
      }
    }),

  /**
   * Mark notification as read
   */
  markAsRead: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.session.user
      const { id } = input

      try {
        const notification = await ctx.prisma.contactNotification.findFirst({
          where: { id, userId },
        })

        if (!notification) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Notification not found',
          })
        }

        if (notification.readAt) {
          return { success: true, message: 'Notification already read' }
        }

        await ctx.prisma.contactNotification.update({
          where: { id },
          data: { readAt: new Date() },
        })

        return { success: true }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to mark notification as read',
          cause: error,
        })
      }
    }),

  /**
   * Mark all notifications as read
   */
  markAllAsRead: protectedProcedure
    .mutation(async ({ ctx }) => {
      const { userId } = ctx.session.user

      try {
        await ctx.prisma.contactNotification.updateMany({
          where: { 
            userId,
            readAt: null,
          },
          data: { readAt: new Date() },
        })

        return { success: true }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to mark all notifications as read',
          cause: error,
        })
      }
    }),

  /**
   * Delete notification
   */
  deleteNotification: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.session.user
      const { id } = input

      try {
        const notification = await ctx.prisma.contactNotification.findFirst({
          where: { id, userId },
        })

        if (!notification) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Notification not found',
          })
        }

        await ctx.prisma.contactNotification.delete({
          where: { id },
        })

        return { success: true }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete notification',
          cause: error,
        })
      }
    }),
})

// ============================================================================
// CROSS-SYSTEM INTEGRATION ROUTER
// ============================================================================

export const crossSystemIntegrationRouter = createTRPCRouter({
  /**
   * Get contact forms and enquiries linked to specific entities
   */
  getLinkedContacts: protectedProcedure
    .input(
      z.object({
        clinicId: z.string().uuid().optional(),
        doctorId: z.string().uuid().optional(),
        serviceId: z.string().uuid().optional(),
        appointmentId: z.string().uuid().optional(),
        healthierSgEnrollmentId: z.string().uuid().optional(),
        userId: z.string().uuid().optional(),
        includeResolved: z.boolean().default(false),
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const { clinicId, doctorId, serviceId, appointmentId, healthierSgEnrollmentId, userId, includeResolved, limit } = input

      try {
        const where: Prisma.ContactIntegrationMappingWhereInput = {}

        if (clinicId) where.clinicId = clinicId
        if (doctorId) where.doctorId = doctorId
        if (serviceId) where.serviceId = serviceId
        if (appointmentId) where.appointmentId = appointmentId
        if (healthierSgEnrollmentId) where.healthierSgEnrollmentId = healthierSgEnrollmentId
        if (userId) where.userId = userId

        if (!includeResolved) {
          where.OR = [
            {
              contactForm: {
                status: { not: 'CLOSED' }
              }
            },
            {
              enquiry: {
                status: { not: 'RESOLVED' }
              }
            }
          ]
        }

        const linkedContacts = await ctx.prisma.contactIntegrationMapping.findMany({
          where,
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            integrationType: true,
            contactForm: {
              select: {
                id: true,
                referenceNumber: true,
                status: true,
                submittedAt: true,
                contactInfo: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
            enquiry: {
              select: {
                id: true,
                referenceNumber: true,
                status: true,
                subject: true,
                response: true,
                createdAt: true,
                resolvedAt: true,
                contactInfo: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        })

        return linkedContacts
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to get linked contacts',
          cause: error,
        })
      }
    }),

  /**
   * Get integration analytics across different system components
   */
  getIntegrationAnalytics: protectedProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        clinicId: z.string().uuid().optional(),
        doctorId: z.string().uuid().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { startDate, endDate, clinicId, doctorId } = input

      try {
        const dateFilter = startDate || endDate ? {
          createdAt: {
            ...(startDate ? { gte: startDate } : {}),
            ...(endDate ? { lte: endDate } : {}),
          }
        } : {}

        // Get contact form analytics
        const contactFormWhere = {
          ...dateFilter,
          ...(clinicId ? { clinicId } : {}),
          ...(doctorId ? { doctorId } : {}),
        }

        const [
          totalContactForms,
          contactFormStatusBreakdown,
          integrationTypeBreakdown,
          recentIntegrations
        ] = await Promise.all([
          ctx.prisma.contactForm.count({ where: contactFormWhere }),
          ctx.prisma.contactForm.groupBy({
            by: ['status'],
            where: contactFormWhere,
            _count: { status: true },
          }),
          ctx.prisma.contactIntegrationActivity.groupBy({
            by: ['integrationType'],
            where: {
              ...dateFilter,
              ...(clinicId ? { context: { path: ['clinicId'], equals: clinicId } } : {}),
              ...(doctorId ? { context: { path: ['doctorId'], equals: doctorId } } : {}),
            },
            _count: { integrationType: true },
          }),
          ctx.prisma.contactIntegrationActivity.findMany({
            where: {
              ...dateFilter,
              ...(clinicId ? { context: { path: ['clinicId'], equals: clinicId } } : {}),
              ...(doctorId ? { context: { path: ['doctorId'], equals: doctorId } } : {}),
            },
            orderBy: { timestamp: 'desc' },
            take: 10,
            select: {
              id: true,
              integrationType: true,
              context: true,
              timestamp: true,
            },
          }),
        ])

        return {
          totalContactForms,
          contactFormStatusBreakdown: contactFormStatusBreakdown.map(item => ({
            status: item.status,
            count: item._count.status,
          })),
          integrationTypeBreakdown: integrationTypeBreakdown.map(item => ({
            type: item.integrationType,
            count: item._count.integrationType,
          })),
          recentIntegrations,
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to get integration analytics',
          cause: error,
        })
      }
    }),

  /**
   * Create integration mapping between contact and other system entities
   */
  createIntegrationMapping: protectedProcedure
    .input(
      z.object({
        contactFormId: z.string().uuid().optional(),
        enquiryId: z.string().uuid().optional(),
        clinicId: z.string().uuid().optional(),
        doctorId: z.string().uuid().optional(),
        serviceId: z.string().uuid().optional(),
        appointmentId: z.string().uuid().optional(),
        healthierSgEnrollmentId: z.string().uuid().optional(),
        userId: z.string().uuid().optional(),
        integrationType: z.nativeEnum(IntegrationType),
        metadata: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { contactFormId, enquiryId, integrationType, metadata } = input

      // Verify that either contactFormId or enquiryId is provided
      if (!contactFormId && !enquiryId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Either contactFormId or enquiryId must be provided',
        })
      }

      try {
        const integrationMapping = await ctx.prisma.contactIntegrationMapping.create({
          data: {
            ...input,
            metadata: {
              ...metadata,
              createdBy: ctx.session.user.id,
              createdAt: new Date().toISOString(),
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        })

        return integrationMapping
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Integration mapping already exists',
          })
        }
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to create integration mapping',
          cause: error,
        })
      }
    }),
})