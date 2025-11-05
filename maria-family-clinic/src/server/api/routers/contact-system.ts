import { z } from 'zod'
import { createTRPCRouter, publicProcedure, protectedProcedure, staffProcedure, adminProcedure, calculatePagination } from '../trpc'
import { TRPCError } from '@trpc/server'
import { Prisma } from '@prisma/client'
import { 
  ContactCategoryPriority,
  ContactDepartment,
  ContactStatus,
  ContactPriority,
  ContactChannel,
  EnquiryType,
  EnquiryPriority,
  EnquiryChannel,
  ContactMethod,
  AssignmentStatus,
  FollowUpType,
  FollowUpStatus,
  TemplateType,
  AnalyticsMetricType
} from '../../../lib/types/contact-system'

// ============================================================================
// CONTACT CATEGORY ROUTER
// ============================================================================

export const contactCategoryRouter = createTRPCRouter({
  /**
   * Get all contact categories (public - for form rendering)
   */
  getAll: publicProcedure.query(async ({ ctx }) => {
    try {
      const categories = await ctx.prisma.contactCategory.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: 'asc' },
        select: {
          id: true,
          name: true,
          displayName: true,
          description: true,
          department: true,
          priority: true,
          responseSLAHours: true,
          resolutionSLADays: true,
          requiresAuth: true,
          requiresVerification: true,
          medicalFields: true,
          hipaaCompliant: true,
          formFields: true,
          autoAssignment: true,
          routingRules: true,
          escalationRules: true,
          isActive: true,
        },
      })

      return categories
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch contact categories',
        cause: error,
      })
    }
  }),

  /**
   * Get contact category by ID
   */
  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      try {
        const category = await ctx.prisma.contactCategory.findUnique({
          where: { id: input.id },
          select: {
            id: true,
            name: true,
            displayName: true,
            description: true,
            department: true,
            priority: true,
            responseSLAHours: true,
            resolutionSLADays: true,
            requiresAuth: true,
            requiresVerification: true,
            medicalFields: true,
            hipaaCompliant: true,
            formFields: true,
            autoAssignment: true,
            routingRules: true,
            escalationRules: true,
            isActive: true,
          },
        })

        if (!category) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Contact category not found',
          })
        }

        return category
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch contact category',
          cause: error,
        })
      }
    }),

  /**
   * Create new contact category (admin only)
   */
  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1).max(50),
        displayName: z.string().min(1).max(100),
        description: z.string().min(1).max(500),
        department: z.nativeEnum(ContactDepartment),
        priority: z.nativeEnum(ContactCategoryPriority),
        responseSLAHours: z.number().min(1).max(168), // Max 1 week
        resolutionSLADays: z.number().min(1).max(30), // Max 30 days
        requiresAuth: z.boolean().default(false),
        requiresVerification: z.boolean().default(false),
        medicalFields: z.boolean().default(false),
        hipaaCompliant: z.boolean().default(false),
        formFields: z.array(z.string()).default([]),
        autoAssignment: z.boolean().default(true),
        routingRules: z.array(z.string()).default([]),
        escalationRules: z.array(z.string()).default([]),
        displayOrder: z.number().default(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const category = await ctx.prisma.contactCategory.create({
          data: {
            ...input,
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            displayName: true,
            description: true,
            department: true,
            priority: true,
            responseSLAHours: true,
            resolutionSLADays: true,
            requiresAuth: true,
            requiresVerification: true,
            medicalFields: true,
            hipaaCompliant: true,
            formFields: true,
            autoAssignment: true,
            routingRules: true,
            escalationRules: true,
            isActive: true,
            createdAt: true,
          },
        })

        return category
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'A contact category with this name already exists',
          })
        }
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to create contact category',
          cause: error,
        })
      }
    }),

  /**
   * Update contact category (admin only)
   */
  update: adminProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        displayName: z.string().min(1).max(100).optional(),
        description: z.string().min(1).max(500).optional(),
        department: z.nativeEnum(ContactDepartment).optional(),
        priority: z.nativeEnum(ContactCategoryPriority).optional(),
        responseSLAHours: z.number().min(1).max(168).optional(),
        resolutionSLADays: z.number().min(1).max(30).optional(),
        requiresAuth: z.boolean().optional(),
        requiresVerification: z.boolean().optional(),
        medicalFields: z.boolean().optional(),
        hipaaCompliant: z.boolean().optional(),
        formFields: z.array(z.string()).optional(),
        autoAssignment: z.boolean().optional(),
        routingRules: z.array(z.string()).optional(),
        escalationRules: z.array(z.string()).optional(),
        displayOrder: z.number().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      try {
        const category = await ctx.prisma.contactCategory.update({
          where: { id },
          data: updateData,
          select: {
            id: true,
            name: true,
            displayName: true,
            description: true,
            department: true,
            priority: true,
            responseSLAHours: true,
            resolutionSLADays: true,
            requiresAuth: true,
            requiresVerification: true,
            medicalFields: true,
            hipaaCompliant: true,
            formFields: true,
            autoAssignment: true,
            routingRules: true,
            escalationRules: true,
            isActive: true,
            updatedAt: true,
          },
        })

        return category
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Contact category not found',
          })
        }
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to update contact category',
          cause: error,
        })
      }
    }),
})

// ============================================================================
// CONTACT FORM ROUTER
// ============================================================================

export const contactFormRouter = createTRPCRouter({
  /**
   * Submit a new contact form (public)
   */
  submit: publicProcedure
    .input(
      z.object({
        categoryId: z.string().uuid(),
        contactInfo: z.object({
          firstName: z.string().min(1).max(50),
          lastName: z.string().min(1).max(50),
          email: z.string().email(),
          phone: z.string().optional(),
          preferredContactMethod: z.nativeEnum(ContactMethod).default('email'),
          preferredLanguage: z.enum(['en', 'zh', 'ms', 'ta']).default('en'),
        }),
        formData: z.record(z.any()),
        attachments: z.array(
          z.object({
            fileName: z.string(),
            fileType: z.string(),
            fileSize: z.number(),
            fileUrl: z.string().url(),
            isMedicalDocument: z.boolean().default(false),
            documentType: z.enum([
              'medical_report',
              'lab_results',
              'x_ray',
              'prescription',
              'insurance_card',
              'identification',
              'other'
            ]).optional(),
            description: z.string().optional(),
          })
        ).max(5),
        consent: z.object({
          dataProcessingConsent: z.boolean(),
          marketingConsent: z.boolean().optional(),
          hipaaConsent: z.boolean().optional(),
          termsAccepted: z.boolean(),
        }),
        metadata: z.object({
          userAgent: z.string().optional(),
          ipAddress: z.string().optional(),
          referrer: z.string().optional(),
          utmSource: z.string().optional(),
          utmMedium: z.string().optional(),
          utmCampaign: z.string().optional(),
        }).optional(),
        clinicId: z.string().uuid().optional(),
        doctorId: z.string().uuid().optional(),
        userId: z.string().uuid().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { categoryId, contactInfo, formData, attachments, consent, metadata, clinicId, doctorId, userId } = input

      try {
        // Generate reference number
        const today = new Date()
        const dateString = today.toISOString().slice(0, 10).replace(/-/g, '')
        const count = await ctx.prisma.contactForm.count({
          where: {
            referenceNumber: { startsWith: `CF${dateString}` },
          },
        })
        const referenceNumber = `CF${dateString}${String(count + 1).padStart(4, '0')}`

        // Create the contact form
        const contactForm = await ctx.prisma.contactForm.create({
          data: {
            referenceNumber,
            categoryId,
            contactInfo,
            formData,
            attachments,
            consent,
            metadata,
            clinicId,
            doctorId,
            userId,
            status: ContactStatus.SUBMITTED,
            priority: ContactPriority.NORMAL,
            channel: ContactChannel.WEB_FORM,
            submittedAt: new Date(),
            isActive: true,
          },
          select: {
            id: true,
            referenceNumber: true,
            status: true,
            priority: true,
            submittedAt: true,
            category: {
              select: {
                displayName: true,
                department: true,
                responseSLAHours: true,
              },
            },
          },
        })

        // Auto-assign if enabled
        const category = await ctx.prisma.contactCategory.findUnique({
          where: { id: categoryId },
          select: { autoAssignment: true, department: true },
        })

        if (category?.autoAssignment) {
          // TODO: Implement assignment logic
          // This would involve finding available staff in the relevant department
        }

        return contactForm
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to submit contact form',
          cause: error,
        })
      }
    }),

  /**
   * Get contact form by reference number (for tracking)
   */
  track: publicProcedure
    .input(
      z.object({
        referenceNumber: z.string().regex(/^CF\d{8}\d{4}$/),
        email: z.string().email().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { referenceNumber, email } = input

      try {
        const contactForm = await ctx.prisma.contactForm.findFirst({
          where: {
            referenceNumber,
            ...(email ? { 'contactInfo.email': email } : {}),
          },
          select: {
            id: true,
            referenceNumber: true,
            status: true,
            priority: true,
            submittedAt: true,
            updatedAt: true,
            category: {
              select: {
                displayName: true,
                department: true,
              },
            },
            enquiry: {
              select: {
                id: true,
                referenceNumber: true,
                status: true,
                assignedTo: {
                  select: {
                    firstName: true,
                    lastName: true,
                    role: true,
                  },
                },
                resolvedAt: true,
              },
            },
          },
        })

        if (!contactForm) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Contact form not found',
          })
        }

        return contactForm
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to track contact form',
          cause: error,
        })
      }
    }),

  /**
   * Get contact forms for staff/admin
   */
  getAll: staffProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(10),
        status: z.nativeEnum(ContactStatus).optional(),
        priority: z.nativeEnum(ContactPriority).optional(),
        categoryId: z.string().uuid().optional(),
        clinicId: z.string().uuid().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        search: z.string().optional(),
        orderBy: z.enum(['submittedAt', 'priority', 'status', 'referenceNumber']).default('submittedAt'),
        orderDirection: z.enum(['asc', 'desc']).default('desc'),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, status, priority, categoryId, clinicId, startDate, endDate, search, orderBy, orderDirection } = input
      const skip = (page - 1) * limit

      // Build where clause
      const where: Prisma.ContactFormWhereInput = {}

      if (status) {
        where.status = status
      }

      if (priority) {
        where.priority = priority
      }

      if (categoryId) {
        where.categoryId = categoryId
      }

      if (clinicId) {
        where.clinicId = clinicId
      }

      if (startDate || endDate) {
        where.submittedAt = {}
        if (startDate) where.submittedAt.gte = startDate
        if (endDate) where.submittedAt.lte = endDate
      }

      if (search) {
        where.OR = [
          { referenceNumber: { contains: search, mode: 'insensitive' } },
          { 'contactInfo.firstName': { contains: search, mode: 'insensitive' } },
          { 'contactInfo.lastName': { contains: search, mode: 'insensitive' } },
          { 'contactInfo.email': { contains: search, mode: 'insensitive' } },
        ]
      }

      // For staff users, only show forms related to their clinic
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
      const orderByClause: Prisma.ContactFormOrderByWithRelationInput = { [orderBy]: orderDirection }

      try {
        const [contactForms, total] = await Promise.all([
          ctx.prisma.contactForm.findMany({
            where,
            select: {
              id: true,
              referenceNumber: true,
              status: true,
              priority: true,
              submittedAt: true,
              updatedAt: true,
              contactInfo: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
                },
              },
              category: {
                select: {
                  displayName: true,
                  department: true,
                },
              },
              clinic: {
                select: {
                  name: true,
                },
              },
              enquiry: {
                select: {
                  id: true,
                  status: true,
                  assignedTo: {
                    select: {
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
            },
            skip,
            take: limit,
            orderBy: orderByClause,
          }),
          ctx.prisma.contactForm.count({ where }),
        ])

        return {
          data: contactForms,
          pagination: calculatePagination(page, limit, total),
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch contact forms',
          cause: error,
        })
      }
    }),
})

// ============================================================================
// ENQUIRY ROUTER (Enhanced from existing)
// ============================================================================

export const contactEnquiryRouter = createTRPCRouter({
  /**
   * Create enquiry from contact form
   */
  createFromForm: staffProcedure
    .input(
      z.object({
        contactFormId: z.string().uuid(),
        initialMessage: z.string().min(1).max(2000),
        estimatedResolution: z.date().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { contactFormId, initialMessage, estimatedResolution, notes } = input

      try {
        const contactForm = await ctx.prisma.contactForm.findUnique({
          where: { id: contactFormId },
          include: { category: true },
        })

        if (!contactForm) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Contact form not found',
          })
        }

        // Generate enquiry reference number
        const today = new Date()
        const dateString = today.toISOString().slice(0, 10).replace(/-/g, '')
        const count = await ctx.prisma.enquiry.count({
          where: {
            referenceNumber: { startsWith: `ENQ${dateString}` },
          },
        })
        const referenceNumber = `ENQ${dateString}${String(count + 1).padStart(4, '0')}`

        // Determine priority based on category
        let priority: EnquiryPriority = EnquiryPriority.NORMAL
        switch (contactForm.category.priority) {
          case ContactCategoryPriority.URGENT:
            priority = EnquiryPriority.URGENT
            break
          case ContactCategoryPriority.HIGH:
            priority = EnquiryPriority.HIGH
            break
          case ContactCategoryPriority.LOW:
            priority = EnquiryPriority.LOW
            break
          default:
            priority = EnquiryPriority.NORMAL
        }

        // Create enquiry
        const enquiry = await ctx.prisma.enquiry.create({
          data: {
            referenceNumber,
            contactFormId,
            type: contactForm.category.name.toUpperCase() as EnquiryType,
            categoryId: contactForm.categoryId,
            contactInfo: contactForm.contactInfo,
            subject: contactForm.formData.subject || `${contactForm.category.displayName} Enquiry`,
            message: initialMessage,
            priority,
            status: ContactStatus.UNDER_REVIEW,
            channel: ContactChannel.WEB_FORM,
            clinicId: contactForm.clinicId,
            doctorId: contactForm.doctorId,
            userId: contactForm.userId,
            estimatedResolution,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          select: {
            id: true,
            referenceNumber: true,
            status: true,
            priority: true,
            subject: true,
            createdAt: true,
            category: {
              select: {
                displayName: true,
                department: true,
                responseSLAHours: true,
              },
            },
            assignedTo: {
              select: {
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
        })

        // Update contact form status
        await ctx.prisma.contactForm.update({
          where: { id: contactFormId },
          data: { status: ContactStatus.UNDER_REVIEW },
        })

        // Add initial history entry
        await ctx.prisma.contactHistory.create({
          data: {
            enquiryId: enquiry.id,
            action: 'CREATED',
            description: 'Enquiry created from contact form',
            performedBy: ctx.session.user.id,
            performedByRole: ctx.session.user.role,
            metadata: { contactFormId, notes },
          },
        })

        return enquiry
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to create enquiry from form',
          cause: error,
        })
      }
    }),

  /**
   * Update enquiry status
   */
  updateStatus: staffProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.nativeEnum(ContactStatus),
        response: z.string().optional(),
        responseMethod: z.nativeEnum(ContactMethod).optional(),
        resolutionNotes: z.string().optional(),
        estimatedResolution: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, status, response, responseMethod, resolutionNotes, estimatedResolution } = input

      try {
        const existingEnquiry = await ctx.prisma.enquiry.findUnique({
          where: { id },
          include: { category: true },
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

        // Build update data
        const updateData: Prisma.EnquiryUpdateInput = {
          status,
          updatedAt: new Date(),
        }

        if (response) {
          updateData.response = response
          updateData.responseMethod = responseMethod
          updateData.responseDate = new Date()
        }

        if (estimatedResolution) {
          updateData.estimatedResolution = estimatedResolution
        }

        if (status === ContactStatus.RESOLVED) {
          updateData.resolvedAt = new Date()
          if (resolutionNotes) {
            updateData.resolutionNotes = resolutionNotes
          }
        }

        const updatedEnquiry = await ctx.prisma.enquiry.update({
          where: { id },
          data: updateData,
          select: {
            id: true,
            referenceNumber: true,
            status: true,
            priority: true,
            response: true,
            responseDate: true,
            resolvedAt: true,
            updatedAt: true,
          },
        })

        // Add history entry
        await ctx.prisma.contactHistory.create({
          data: {
            enquiryId: id,
            action: 'STATUS_UPDATED',
            description: `Status changed to ${status}`,
            performedBy: ctx.session.user.id,
            performedByRole: ctx.session.user.role,
            metadata: { newStatus: status, response, responseMethod },
          },
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
   * Assign enquiry to staff member
   */
  assign: staffProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        assignedToId: z.string().uuid(),
        assignmentNotes: z.string().optional(),
        priority: z.nativeEnum(EnquiryPriority).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, assignedToId, assignmentNotes, priority } = input

      try {
        const existingEnquiry = await ctx.prisma.enquiry.findUnique({
          where: { id },
          select: {
            id: true,
            clinicId: true,
            assignedToId: true,
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
              message: 'You can only assign enquiries for your clinic',
            })
          }
        }

        // Update enquiry
        const updateData: Prisma.EnquiryUpdateInput = {
          assignedToId,
          status: ContactStatus.ASSIGNED,
          updatedAt: new Date(),
        }

        if (priority) {
          updateData.priority = priority
        }

        const updatedEnquiry = await ctx.prisma.enquiry.update({
          where: { id },
          data: updateData,
          select: {
            id: true,
            referenceNumber: true,
            status: true,
            priority: true,
            assignedTo: {
              select: {
                firstName: true,
                lastName: true,
                role: true,
                email: true,
              },
            },
            updatedAt: true,
          },
        })

        // Create assignment record
        await ctx.prisma.contactAssignment.create({
          data: {
            enquiryId: id,
            assignedToId,
            assignedById: ctx.session.user.id,
            assignmentType: 'DIRECT',
            status: AssignmentStatus.ACTIVE,
            notes: assignmentNotes,
            assignedAt: new Date(),
          },
        })

        // Add history entry
        await ctx.prisma.contactHistory.create({
          data: {
            enquiryId: id,
            action: 'ASSIGNED',
            description: `Assigned to staff member`,
            performedBy: ctx.session.user.id,
            performedByRole: ctx.session.user.role,
            metadata: { assignedToId, assignmentNotes },
          },
        })

        return updatedEnquiry
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to assign enquiry',
          cause: error,
        })
      }
    }),
})

// ============================================================================
// CONTACT ANALYTICS ROUTER
// ============================================================================

export const contactAnalyticsRouter = createTRPCRouter({
  /**
   * Get contact form analytics
   */
  getFormAnalytics: staffProcedure
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
        let where: Prisma.ContactFormWhereInput = {}
        if (startDate || endDate) {
          where.submittedAt = {}
          if (startDate) where.submittedAt.gte = startDate
          if (endDate) where.submittedAt.lte = endDate
        }
        if (clinicId) where.clinicId = clinicId

        // For staff users, only show analytics for their clinic
        if (ctx.session.user.role === 'STAFF') {
          const userClinic = await ctx.prisma.clinic.findFirst({
            where: { userId: ctx.session.user.id },
            select: { id: true },
          })

          if (userClinic) {
            where.clinicId = userClinic.id
          }
        }

        // Get form submission statistics
        const [totalForms, submittedForms, underReviewForms, resolvedForms] = await Promise.all([
          ctx.prisma.contactForm.count({ where }),
          ctx.prisma.contactForm.count({ where: { ...where, status: ContactStatus.SUBMITTED } }),
          ctx.prisma.contactForm.count({ where: { ...where, status: ContactStatus.UNDER_REVIEW } }),
          ctx.prisma.contactForm.count({ where: { ...where, status: ContactStatus.CLOSED } }),
        ])

        // Get category distribution
        const categoryDistribution = await ctx.prisma.contactForm.groupBy({
          by: ['categoryId'],
          where,
          _count: { categoryId: true },
          orderBy: { _count: { categoryId: 'desc' } },
        })

        // Get priority distribution
        const priorityDistribution = await ctx.prisma.contactForm.groupBy({
          by: ['priority'],
          where,
          _count: { priority: true },
        })

        return {
          totals: {
            total: totalForms,
            submitted: submittedForms,
            underReview: underReviewForms,
            resolved: resolvedForms,
          },
          categoryDistribution: categoryDistribution.map(item => ({
            categoryId: item.categoryId,
            count: item._count.categoryId,
          })),
          priorityDistribution: priorityDistribution.map(item => ({
            priority: item.priority,
            count: item._count.priority,
          })),
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch contact analytics',
          cause: error,
        })
      }
    }),

  /**
   * Get response time analytics
   */
  getResponseTimeAnalytics: staffProcedure
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
        let where: Prisma.EnquiryWhereInput = {}
        if (startDate || endDate) {
          where.createdAt = {}
          if (startDate) where.createdAt.gte = startDate
          if (endDate) where.createdAt.lte = endDate
        }
        if (clinicId) where.clinicId = clinicId

        // For staff users, only show analytics for their clinic
        if (ctx.session.user.role === 'STAFF') {
          const userClinic = await ctx.prisma.clinic.findFirst({
            where: { userId: ctx.session.user.id },
            select: { id: true },
          })

          if (userClinic) {
            where.clinicId = userClinic.id
          }
        }

        // Get enquiries with response times
        const enquiries = await ctx.prisma.enquiry.findMany({
          where,
          select: {
            id: true,
            createdAt: true,
            responseDate: true,
            resolvedAt: true,
            status: true,
            category: {
              select: {
                responseSLAHours: true,
                resolutionSLADays: true,
              },
            },
          },
        })

        // Calculate response times
        const responseTimes = enquiries
          .filter(e => e.responseDate)
          .map(e => ({
            enquiryId: e.id,
            responseTimeHours: (e.responseDate!.getTime() - e.createdAt.getTime()) / (1000 * 60 * 60),
            withinSLA: e.responseDate && e.category.responseSLAHours 
              ? ((e.responseDate.getTime() - e.createdAt.getTime()) / (1000 * 60 * 60)) <= e.category.responseSLAHours
              : null,
          }))

        const avgResponseTime = responseTimes.length > 0
          ? responseTimes.reduce((sum, rt) => sum + rt.responseTimeHours, 0) / responseTimes.length
          : 0

        const withinSLA = responseTimes.filter(rt => rt.withinSLA).length
        const slaCompliance = responseTimes.length > 0 ? (withinSLA / responseTimes.length) * 100 : 0

        return {
          averageResponseTimeHours: Math.round(avgResponseTime * 100) / 100,
          slaCompliancePercentage: Math.round(slaCompliance * 100) / 100,
          totalResponses: responseTimes.length,
          withinSLA: withinSLA,
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch response time analytics',
          cause: error,
        })
      }
    }),
})