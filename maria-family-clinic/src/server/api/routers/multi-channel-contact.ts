import { z } from 'zod'
import { createTRPCRouter, publicProcedure, protectedProcedure, staffProcedure, adminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { Prisma } from '@prisma/client'
import {
  ChannelType,
  ChannelCategory,
  IntegrationType,
  IntegrationHealth,
  ConversationStatus,
  ConversationPriority,
  MessageType,
  MediaType,
  MessageSenderType,
  MessageRecipientType,
  MessageStatus,
  DeliveryStatus,
  MessageSentiment,
  MessageIntent,
  SocialPlatform,
  MentionType,
  MentionStatus,
  ConnectionStatus,
  VoiceProvider,
  VideoPlatform,
  VideoConsultationStatus,
  VideoQuality,
  PaymentStatus,
  ConsultationPriority,
  ChatSessionStatus,
  ChatPriority,
  ContactInteractionType,
  ContactHistoryStatus,
  ChatbotResponseType,
  LogicOperator,
  RoutingMethod,
  RoutingTargetType,
  EscalationLevel,
  DeviceType,
  PatientType,
  UrgencyLevel
} from '../../../lib/types/multi-channel-contact'

// ============================================================================
// COMMUNICATION CHANNEL ROUTER
// ============================================================================

export const communicationChannelRouter = createTRPCRouter({
  /**
   * Get all active communication channels
   */
  getAll: publicProcedure.query(async ({ ctx }) => {
    try {
      const channels = await ctx.prisma.communicationChannel.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
        include: {
          integrations: {
            where: { isActive: true },
            orderBy: { name: 'asc' }
          }
        }
      })

      return channels
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch communication channels',
        cause: error
      })
    }
  }),

  /**
   * Get channel by ID
   */
  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      try {
        const channel = await ctx.prisma.communicationChannel.findUnique({
          where: { id: input.id },
          include: {
            integrations: true,
            conversations: {
              take: 10,
              orderBy: { lastMessageAt: 'desc' }
            },
            rules: true
          }
        })

        if (!channel) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Communication channel not found'
          })
        }

        return channel
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch communication channel',
          cause: error
        })
      }
    }),

  /**
   * Create new communication channel (Admin only)
   */
  create: adminProcedure
    .input(z.object({
      name: z.string().min(1).max(50),
      displayName: z.string().min(1).max(100),
      type: z.nativeEnum(ChannelType),
      category: z.nativeEnum(ChannelCategory),
      isActive: z.boolean().default(true),
      isEnabled: z.boolean().default(true),
      requiresAuth: z.boolean().default(false),
      supportsRealTime: z.boolean().default(false),
      supportsFiles: z.boolean().default(false),
      maxFileSize: z.number().optional(),
      supportedFileTypes: z.array(z.string()).default([]),
      apiEndpoint: z.string().url().optional(),
      rateLimit: z.number().int().positive().optional(),
      timeout: z.number().int().positive().optional(),
      hipaaCompliant: z.boolean().default(false),
      requiresConsent: z.boolean().default(true),
      dataRetention: z.number().int().positive().optional(),
      encryptionRequired: z.boolean().default(false),
      syncEnabled: z.boolean().default(true),
      autoResponse: z.boolean().default(true),
      intelligentRouting: z.boolean().default(true),
      icon: z.string().optional(),
      color: z.string().optional(),
      description: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const channel = await ctx.prisma.communicationChannel.create({
          data: input
        })

        return channel
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to create communication channel',
          cause: error
        })
      }
    }),

  /**
   * Update communication channel (Admin only)
   */
  update: adminProcedure
    .input(z.object({
      id: z.string().uuid(),
      displayName: z.string().min(1).max(100).optional(),
      isActive: z.boolean().optional(),
      isEnabled: z.boolean().optional(),
      rateLimit: z.number().int().positive().optional(),
      timeout: z.number().int().positive().optional(),
      dataRetention: z.number().int().positive().optional(),
      icon: z.string().optional(),
      color: z.string().optional(),
      description: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...data } = input
        const channel = await ctx.prisma.communicationChannel.update({
          where: { id },
          data
        })

        return channel
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to update communication channel',
          cause: error
        })
      }
    }),

  /**
   * Get channel performance metrics
   */
  getMetrics: publicProcedure
    .input(z.object({
      channelId: z.string().uuid(),
      startDate: z.date().optional(),
      endDate: z.date().optional()
    }))
    .query(async ({ ctx, input }) => {
      try {
        const { channelId, startDate, endDate } = input
        const whereClause: any = { channelId }
        
        if (startDate || endDate) {
          whereClause.sentAt = {}
          if (startDate) whereClause.sentAt.gte = startDate
          if (endDate) whereClause.sentAt.lte = endDate
        }

        const [
          totalMessages,
          sentMessages,
          deliveredMessages,
          readMessages,
          failedMessages,
          avgResponseTime,
          sentimentStats
        ] = await Promise.all([
          ctx.prisma.channelMessage.count({ where: { channelId } }),
          ctx.prisma.channelMessage.count({ where: { channelId, status: 'SENT' } }),
          ctx.prisma.channelMessage.count({ where: { channelId, deliveryStatus: 'DELIVERED' } }),
          ctx.prisma.channelMessage.count({ where: { channelId, readAt: { not: null } } }),
          ctx.prisma.channelMessage.count({ where: { channelId, status: 'FAILED' } }),
          ctx.prisma.channelConversation.aggregate({
            where: { channelId },
            _avg: { responseTime: true }
          }),
          ctx.prisma.channelMessage.groupBy({
            by: ['sentiment'],
            where: { channelId },
            _count: true
          })
        ])

        const deliveryRate = totalMessages > 0 ? (deliveredMessages / totalMessages) * 100 : 0
        const responseRate = totalMessages > 0 ? (readMessages / totalMessages) * 100 : 0

        return {
          totalMessages,
          sentMessages,
          deliveredMessages,
          readMessages,
          failedMessages,
          deliveryRate,
          responseRate,
          avgResponseTime: avgResponseTime._avg.responseTime || 0,
          sentimentStats: sentimentStats.reduce((acc, item) => {
            acc[item.sentiment] = item._count
            return acc
          }, {} as Record<string, number>)
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch channel metrics',
          cause: error
        })
      }
    })
})

// ============================================================================
// UNIFIED CONVERSATION ROUTER
// ============================================================================

export const conversationRouter = createTRPCRouter({
  /**
   * Get conversations for a customer
   */
  getByCustomer: protectedProcedure
    .input(z.object({
      customerId: z.string().optional(),
      customerEmail: z.string().email().optional(),
      customerPhone: z.string().optional(),
      status: z.nativeEnum(ConversationStatus).optional(),
      limit: z.number().int().positive().max(100).default(20),
      offset: z.number().int().nonnegative().default(0)
    }))
    .query(async ({ ctx, input }) => {
      try {
        const whereClause: any = {}
        
        if (input.customerId) {
          whereClause.customerId = input.customerId
        } else if (input.customerEmail) {
          whereClause.customerEmail = input.customerEmail
        } else if (input.customerPhone) {
          whereClause.customerPhone = input.customerPhone
        }
        
        if (input.status) {
          whereClause.status = input.status
        }

        const [conversations, total] = await Promise.all([
          ctx.prisma.channelConversation.findMany({
            where: whereClause,
            include: {
              channel: true,
              messages: {
                take: 5,
                orderBy: { sentAt: 'desc' }
              }
            },
            orderBy: { lastMessageAt: 'desc' },
            take: input.limit,
            skip: input.offset
          }),
          ctx.prisma.channelConversation.count({ where: whereClause })
        ])

        return {
          conversations,
          total,
          hasMore: total > input.offset + input.limit
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch conversations',
          cause: error
        })
      }
    }),

  /**
   * Get conversation by ID with full message history
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      try {
        const conversation = await ctx.prisma.channelConversation.findUnique({
          where: { id: input.id },
          include: {
            channel: true,
            messages: {
              orderBy: { sentAt: 'asc' },
              include: {
                // Add any needed relations for message details
              }
            }
          }
        })

        if (!conversation) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Conversation not found'
          })
        }

        return conversation
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch conversation',
          cause: error
        })
      }
    }),

  /**
   * Create new conversation
   */
  create: publicProcedure
    .input(z.object({
      channelId: z.string().uuid(),
      conversationId: z.string().min(1),
      subject: z.string().optional(),
      priority: z.nativeEnum(ConversationPriority).default(NORMAL),
      customerName: z.string().min(1),
      customerEmail: z.string().email().optional(),
      customerPhone: z.string().optional(),
      clinicId: z.string().uuid().optional(),
      doctorId: z.string().uuid().optional(),
      serviceId: z.string().uuid().optional(),
      patientId: z.string().uuid().optional(),
      appointmentId: z.string().uuid().optional(),
      preferredChannel: z.string().optional(),
      language: z.string().default('en'),
      timezone: z.string().optional(),
      businessHours: z.boolean().default(false),
      externalRefs: z.record(z.any()).default({}),
      metadata: z.record(z.any()).default({})
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const conversation = await ctx.prisma.channelConversation.create({
          data: {
            ...input,
            status: ConversationStatus.ACTIVE
          }
        })

        return conversation
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to create conversation',
          cause: error
        })
      }
    }),

  /**
   * Update conversation status
   */
  updateStatus: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      status: z.nativeEnum(ConversationStatus),
      subStatus: z.string().optional(),
      isClosed: z.boolean().optional(),
      isArchived: z.boolean().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...data } = input
        const conversation = await ctx.prisma.channelConversation.update({
          where: { id },
          data
        })

        return conversation
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to update conversation status',
          cause: error
        })
      }
    }),

  /**
   * Assign agent to conversation
   */
  assignAgent: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      agentId: z.string().uuid(),
      agentName: z.string().min(1)
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, agentId, agentName } = input
        const conversation = await ctx.prisma.channelConversation.update({
          where: { id },
          data: {
            agentId,
            agentName,
            firstResponseAt: new Date()
          }
        })

        return conversation
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to assign agent',
          cause: error
        })
      }
    })
})

// ============================================================================
// CHANNEL MESSAGE ROUTER
// ============================================================================

export const messageRouter = createTRPCRouter({
  /**
   * Get messages for a conversation
   */
  getByConversation: protectedProcedure
    .input(z.object({
      conversationId: z.string().uuid(),
      limit: z.number().int().positive().max(100).default(50),
      offset: z.number().int().nonnegative().default(0)
    }))
    .query(async ({ ctx, input }) => {
      try {
        const [messages, total] = await Promise.all([
          ctx.prisma.channelMessage.findMany({
            where: { conversationId: input.conversationId },
            orderBy: { sentAt: 'desc' },
            take: input.limit,
            skip: input.offset
          }),
          ctx.prisma.channelMessage.count({
            where: { conversationId: input.conversationId }
          })
        ])

        return {
          messages: messages.reverse(), // Return in chronological order
          total,
          hasMore: total > input.offset + input.limit
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch messages',
          cause: error
        })
      }
    }),

  /**
   * Send message through channel
   */
  send: publicProcedure
    .input(z.object({
      channelId: z.string().uuid(),
      conversationId: z.string().uuid().optional(),
      messageId: z.string().min(1),
      threadId: z.string().optional(),
      content: z.string().min(1),
      messageType: z.nativeEnum(MessageType).default(MessageType.TEXT),
      mediaType: z.nativeEnum(MediaType).optional(),
      senderId: z.string().optional(),
      senderName: z.string().min(1),
      senderType: z.nativeEnum(MessageSenderType),
      senderChannel: z.string().min(1),
      recipientId: z.string().optional(),
      recipientName: z.string().optional(),
      recipientType: z.nativeEnum(MessageRecipientType).optional(),
      clinicId: z.string().uuid().optional(),
      doctorId: z.string().uuid().optional(),
      serviceId: z.string().uuid().optional(),
      patientId: z.string().uuid().optional(),
      hasAttachments: z.boolean().default(false),
      attachmentCount: z.number().int().nonnegative().default(0),
      attachments: z.array(z.any()).default([]),
      isVoiceMessage: z.boolean().default(false),
      transcript: z.string().optional(),
      audioDuration: z.number().int().positive().optional(),
      speechConfidence: z.number().min(0).max(1).optional(),
      metadata: z.record(z.any()).default({}),
      tags: z.array(z.string()).default([])
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const message = await ctx.prisma.channelMessage.create({
          data: {
            ...input,
            status: MessageStatus.SENT,
            deliveryStatus: DeliveryStatus.SENT
          }
        })

        // Update conversation's last message time
        if (input.conversationId) {
          await ctx.prisma.channelConversation.update({
            where: { id: input.conversationId },
            data: {
              lastMessageAt: new Date(),
              messageCount: { increment: 1 }
            }
          })
        }

        return message
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to send message',
          cause: error
        })
      }
    }),

  /**
   * Update message status
   */
  updateStatus: publicProcedure
    .input(z.object({
      id: z.string().uuid(),
      status: z.nativeEnum(MessageStatus).optional(),
      deliveryStatus: z.nativeEnum(DeliveryStatus).optional(),
      deliveredAt: z.date().optional(),
      readAt: z.date().optional(),
      processedAt: z.date().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...data } = input
        const message = await ctx.prisma.channelMessage.update({
          where: { id },
          data
        })

        return message
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to update message status',
          cause: error
        })
      }
    }),

  /**
   * Add message sentiment and intent analysis
   */
  analyzeMessage: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      sentiment: z.nativeEnum(MessageSentiment),
      intent: z.nativeEnum(MessageIntent).optional(),
      confidence: z.number().min(0).max(1).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...data } = input
        const message = await ctx.prisma.channelMessage.update({
          where: { id },
          data
        })

        return message
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to analyze message',
          cause: error
        })
      }
    })
})

// ============================================================================
// CHATBOT ROUTER
// ============================================================================

export const chatbotRouter = createTRPCRouter({
  /**
   * Get available chatbot configurations
   */
  getConfigs: publicProcedure.query(async ({ ctx }) => {
    try {
      const chatbots = await ctx.prisma.chatbotConfig.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' }
      })

      return chatbots
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch chatbot configurations',
        cause: error
      })
    }
  }),

  /**
   * Create chatbot interaction
   */
  interact: publicProcedure
    .input(z.object({
      chatbotId: z.string().uuid(),
      conversationId: z.string().uuid().optional(),
      messageId: z.string().uuid().optional(),
      customerId: z.string().uuid().optional(),
      customerName: z.string().min(1),
      sessionId: z.string().min(1),
      userMessage: z.string().min(1),
      userIntent: z.string().optional(),
      userSentiment: z.nativeEnum(MessageSentiment).default(MessageSentiment.NEUTRAL),
      confidence: z.number().min(0).max(1).optional(),
      responseTime: z.number().int().positive().optional(),
      entities: z.array(z.any()).default([]),
      context: z.record(z.any()).default({}),
      action: z.string().optional(),
      actionData: z.record(z.any()).default({}),
      escalationTriggered: z.boolean().default(false),
      resolved: z.boolean().default(false),
      customerSatisfaction: z.number().min(1).max(5).optional(),
      feedback: z.string().optional(),
      clinicId: z.string().uuid().optional(),
      doctorId: z.string().uuid().optional(),
      serviceId: z.string().uuid().optional(),
      medicalKeywords: z.array(z.string()).default([]),
      channel: z.string().min(1),
      deviceType: z.nativeEnum(DeviceType).optional(),
      browserType: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Generate bot response based on user input
        const botResponse = await generateBotResponse(input.userMessage, input.context)
        
        const interaction = await ctx.prisma.chatbotInteraction.create({
          data: {
            ...input,
            botResponse: botResponse.content,
            responseType: botResponse.type,
            confidence: botResponse.confidence
          }
        })

        return interaction
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to create chatbot interaction',
          cause: error
        })
      }
    }),

  /**
   * Get chatbot interaction history
   */
  getHistory: protectedProcedure
    .input(z.object({
      sessionId: z.string().optional(),
      customerId: z.string().uuid().optional(),
      chatbotId: z.string().uuid().optional(),
      limit: z.number().int().positive().max(100).default(20),
      offset: z.number().int().nonnegative().default(0)
    }))
    .query(async ({ ctx, input }) => {
      try {
        const whereClause: any = {}
        
        if (input.sessionId) whereClause.sessionId = input.sessionId
        if (input.customerId) whereClause.customerId = input.customerId
        if (input.chatbotId) whereClause.chatbotId = input.chatbotId

        const [interactions, total] = await Promise.all([
          ctx.prisma.chatbotInteraction.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            take: input.limit,
            skip: input.offset
          }),
          ctx.prisma.chatbotInteraction.count({ where: whereClause })
        ])

        return {
          interactions,
          total,
          hasMore: total > input.offset + input.limit
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch chatbot history',
          cause: error
        })
      }
    })
})

// ============================================================================
// LIVE CHAT ROUTER
// ============================================================================

export const liveChatRouter = createTRPCRouter({
  /**
   * Start live chat session
   */
  startSession: publicProcedure
    .input(z.object({
      sessionId: z.string().min(1),
      customerId: z.string().uuid().optional(),
      customerName: z.string().min(1),
      customerEmail: z.string().email().optional(),
      customerPhone: z.string().optional(),
      clinicId: z.string().uuid().optional(),
      doctorId: z.string().uuid().optional(),
      serviceId: z.string().uuid().optional(),
      department: z.string().optional(),
      priority: z.nativeEnum(ChatPriority).default(ChatPriority.NORMAL),
      patientType: z.nativeEnum(PatientType).default(PatientType.NEW),
      urgencyLevel: z.nativeEnum(UrgencyLevel).default(UrgencyLevel.ROUTINE),
      medicalKeywords: z.array(z.string()).default([]),
      connectionId: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const session = await ctx.prisma.liveChatSession.create({
          data: {
            ...input,
            status: ChatSessionStatus.WAITING
          }
        })

        return session
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to start live chat session',
          cause: error
        })
      }
    }),

  /**
   * Get active chat sessions for agent
   */
  getAgentSessions: protectedProcedure
    .input(z.object({
      agentId: z.string().uuid(),
      status: z.nativeEnum(ChatSessionStatus).optional(),
      limit: z.number().int().positive().max(50).default(20)
    }))
    .query(async ({ ctx, input }) => {
      try {
        const whereClause: any = {
          assignedAgent: input.agentId
        }
        
        if (input.status) {
          whereClause.status = input.status
        }

        const sessions = await ctx.prisma.liveChatSession.findMany({
          where: whereClause,
          orderBy: { startedAt: 'desc' },
          take: input.limit
        })

        return sessions
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch agent sessions',
          cause: error
        })
      }
    }),

  /**
   * Join chat session as agent
   */
  joinSession: protectedProcedure
    .input(z.object({
      sessionId: z.string().uuid(),
      agentId: z.string().uuid(),
      agentName: z.string().min(1)
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { sessionId, agentId, agentName } = input
        const session = await ctx.prisma.liveChatSession.update({
          where: { id: sessionId },
          data: {
            assignedAgent: agentId,
            assignedAgentName: agentName,
            isAgentAssigned: true,
            agentJoinedAt: new Date(),
            status: ChatSessionStatus.ACTIVE,
            firstResponseAt: new Date()
          }
        })

        return session
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to join chat session',
          cause: error
        })
      }
    }),

  /**
   * End chat session
   */
  endSession: protectedProcedure
    .input(z.object({
      sessionId: z.string().uuid(),
      satisfactionScore: z.number().min(1).max(5).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { sessionId, satisfactionScore } = input
        const session = await ctx.prisma.liveChatSession.update({
          where: { id: sessionId },
          data: {
            status: ChatSessionStatus.COMPLETED,
            endedAt: new Date(),
            satisfactionScore
          }
        })

        return session
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to end chat session',
          cause: error
        })
      }
    }),

  /**
   * Update typing indicator
   */
  updateTyping: publicProcedure
    .input(z.object({
      sessionId: z.string().uuid(),
      isTyping: z.boolean(),
      lastActivity: z.date().default(() => new Date())
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { sessionId, isTyping, lastActivity } = input
        const session = await ctx.prisma.liveChatSession.update({
          where: { id: sessionId },
          data: {
            isTyping,
            lastActivity
          }
        })

        return session
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to update typing status',
          cause: error
        })
      }
    })
})

// ============================================================================
// UNIFIED CONTACT HISTORY ROUTER
// ============================================================================

export const contactHistoryRouter = createTRPCRouter({
  /**
   * Get unified contact history for customer
   */
  getByCustomer: protectedProcedure
    .input(z.object({
      customerId: z.string().uuid(),
      limit: z.number().int().positive().max(100).default(50),
      offset: z.number().int().nonnegative().default(0)
    }))
    .query(async ({ ctx, input }) => {
      try {
        const [history, total] = await Promise.all([
          ctx.prisma.unifiedContactHistory.findMany({
            where: { customerId: input.customerId },
            orderBy: { startedAt: 'desc' },
            take: input.limit,
            skip: input.offset
          }),
          ctx.prisma.unifiedContactHistory.count({
            where: { customerId: input.customerId }
          })
        ])

        return {
          history,
          total,
          hasMore: total > input.offset + input.limit
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch contact history',
          cause: error
        })
      }
    }),

  /**
   * Create contact history entry
   */
  create: protectedProcedure
    .input(z.object({
      customerId: z.string().uuid(),
      contactId: z.string().uuid().optional(),
      conversationId: z.string().uuid().optional(),
      interactionType: z.nativeEnum(ContactInteractionType),
      channel: z.string().min(1),
      subject: z.string().optional(),
      summary: z.string().optional(),
      primaryContact: z.string().min(1),
      agentName: z.string().optional(),
      teamName: z.string().optional(),
      clinicId: z.string().uuid().optional(),
      doctorId: z.string().uuid().optional(),
      serviceId: z.string().uuid().optional(),
      patientId: z.string().uuid().optional(),
      appointmentId: z.string().uuid().optional(),
      status: z.nativeEnum(ContactHistoryStatus).default(ContactHistoryStatus.COMPLETED),
      outcome: z.string().optional(),
      satisfaction: z.number().min(1).max(5).optional(),
      startedAt: z.date(),
      endedAt: z.date().optional(),
      responseTime: z.number().int().positive().optional(),
      resolutionTime: z.number().int().positive().optional(),
      messageCount: z.number().int().nonnegative().default(0),
      escalationCount: z.number().int().nonnegative().default(0),
      followUpRequired: z.boolean().default(false),
      nextAction: z.string().optional(),
      cost: z.number().min(0).optional(),
      efficiency: z.number().min(0).max(1).optional(),
      qualityScore: z.number().min(0).max(1).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const history = await ctx.prisma.unifiedContactHistory.create({
          data: input
        })

        return history
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to create contact history',
          cause: error
        })
      }
    })
})

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate chatbot response based on user input
 */
async function generateBotResponse(
  userMessage: string, 
  context: Record<string, any>
): Promise<{ content: string; type: ChatbotResponseType; confidence: number }> {
  const message = userMessage.toLowerCase()
  
  // Simple intent recognition
  if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
    return {
      content: "Hello! Welcome to My Family Clinic. How can I help you today? You can ask about our services, book an appointment, or get general health information.",
      type: ChatbotResponseType.GREETING,
      confidence: 0.9
    }
  }
  
  if (message.includes('appointment') || message.includes('book') || message.includes('schedule')) {
    return {
      content: "I'd be happy to help you book an appointment! Our clinic offers same-day appointments for urgent cases. You can also book through our online portal or call us directly. Would you like me to transfer you to our booking team?",
      type: ChatbotResponseType.BOOKING,
      confidence: 0.8
    }
  }
  
  if (message.includes('emergency') || message.includes('urgent') || message.includes('pain') || message.includes('severe')) {
    return {
      content: "For medical emergencies, please call 995 immediately. For urgent but non-emergency matters, we offer same-day appointments. Is this a medical emergency that requires immediate attention?",
      type: ChatbotResponseType.EMERGENCY,
      confidence: 0.85
    }
  }
  
  if (message.includes('hours') || message.includes('open') || message.includes('time')) {
    return {
      content: "My Family Clinic is open Monday to Friday 8am-8pm, Saturday 9am-5pm, and Sunday 10am-4pm. We're closed on public holidays. Would you like to book an appointment for a specific time?",
      type: ChatbotResponseType.INFORMATION,
      confidence: 0.85
    }
  }
  
  if (message.includes('location') || message.includes('address') || message.includes('where')) {
    return {
      content: "We're conveniently located at multiple locations across Singapore. You can find the nearest clinic to you by using our clinic finder tool on our website or calling our main line.",
      type: ChatbotResponseType.INFORMATION,
      confidence: 0.8
    }
  }
  
  if (message.includes('pricing') || message.includes('cost') || message.includes('fee') || message.includes('insurance')) {
    return {
      content: "Our consultation fees start from $40, and we accept most insurance plans including Medisave, Medishield, and private insurance. For specific pricing, please call our clinic or speak with our staff.",
      type: ChatbotResponseType.INFORMATION,
      confidence: 0.75
    }
  }
  
  if (message.includes('thank') || message.includes('goodbye') || message.includes('bye')) {
    return {
      content: "Thank you for contacting My Family Clinic! If you need anything else, feel free to reach out. Have a great day!",
      type: ChatbotResponseType.GOODBYE,
      confidence: 0.9
    }
  }
  
  // Default fallback
  return {
    content: "I understand you're looking for assistance. Let me connect you with one of our staff members who can better help you with your specific needs. Please hold on.",
    type: ChatbotResponseType.FALLBACK,
    confidence: 0.6
  }
}

// ============================================================================
// ROUTER EXPORT
// ============================================================================

export const multiChannelContactRouter = createTRPCRouter({
  communicationChannel: communicationChannelRouter,
  conversation: conversationRouter,
  message: messageRouter,
  chatbot: chatbotRouter,
  liveChat: liveChatRouter,
  contactHistory: contactHistoryRouter
})
