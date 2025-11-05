// ========================================
// CLINIC-SPECIFIC CONTACT INTEGRATION API
// Sub-Phase 9.4: Contact System with Clinic Personalization
// Healthcare Platform Contact System Design
// ========================================

import { z } from "zod";
import { 
  createTRPCRouter, 
  protectedProcedure, 
  publicProcedure 
} from "../trpc";
import { 
  ContactMethod, 
  ContactPriority, 
  UrgencyLevel, 
  ContactCategory, 
  ContactTemplateCategory,
  PatientType,
  AssignmentType,
  AssignmentPriority,
  ContactAssignmentStatus,
  EnquiryType,
  CommunicationChannel,
  ResponseType
} from "../../../lib/types/contact-system";

/**
 * Clinic Contact Settings Management
 * Handles clinic-specific contact preferences and configurations
 */
const clinicContactSettingsRouter = createTRPCRouter({
  // Get clinic contact settings
  getSettings: protectedProcedure
    .input(z.object({ clinicId: z.string() }))
    .query(async ({ ctx, input }) => {
      const settings = await ctx.db.clinicContactSettings.findUnique({
        where: { clinicId: input.clinicId },
        include: { clinic: true }
      });
      return settings;
    }),

  // Update clinic contact settings
  updateSettings: protectedProcedure
    .input(z.object({
      clinicId: z.string(),
      enableContactForm: z.boolean().optional(),
      enableLiveChat: z.boolean().optional(),
      enablePhoneSupport: z.boolean().optional(),
      enableEmailSupport: z.boolean().optional(),
      enableWhatsAppSupport: z.boolean().optional(),
      defaultResponseLanguage: z.string().optional(),
      responseTimeTarget: z.number().optional(),
      businessHoursOnly: z.boolean().optional(),
      emergencyResponseTime: z.number().optional(),
      autoResponseEnabled: z.boolean().optional(),
      autoResponseMessage: z.string().optional(),
      afterHoursMessage: z.string().optional(),
      holidayMessage: z.string().optional(),
      preferredContactMethod: z.nativeEnum(ContactMethod).optional(),
      backupContactMethod: z.nativeEnum(ContactMethod).optional(),
      defaultAssignmentMethod: z.string().optional(),
      maxActiveEnquiries: z.number().optional(),
      specialistEscalation: z.boolean().optional(),
      requireSatisfactionSurvey: z.boolean().optional(),
      satisfactionTarget: z.number().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const { clinicId, ...settingsData } = input;
      
      const settings = await ctx.db.clinicContactSettings.upsert({
        where: { clinicId },
        update: settingsData,
        create: {
          clinicId,
          ...settingsData
        }
      });

      return settings;
    }),

  // Get clinic contact availability
  getAvailability: protectedProcedure
    .input(z.object({ clinicId: z.string() }))
    .query(async ({ ctx, input }) => {
      const availability = await ctx.db.clinicContactAvailability.findMany({
        where: { clinicId: input.clinicId, isActive: true },
        orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
      });
      return availability;
    }),

  // Update clinic contact availability
  updateAvailability: protectedProcedure
    .input(z.object({
      clinicId: z.string(),
      availability: z.array(z.object({
        id: z.string().optional(),
        dayOfWeek: z.string(),
        startTime: z.string(),
        endTime: z.string(),
        contactType: z.nativeEnum(ContactMethod),
        isEmergencyAvailable: z.boolean().optional(),
        maxWaitTime: z.number().optional(),
        availableStaff: z.array(z.string()).optional(),
        staffCount: z.number().optional(),
        serviceTypes: z.array(z.string()).optional(),
        languagesAvailable: z.array(z.string()).optional(),
        maxConcurrentContacts: z.number().optional(),
        currentContacts: z.number().optional(),
        waitlistEnabled: z.boolean().optional(),
        requiresAppointment: z.boolean().optional(),
        requiresInsurance: z.boolean().optional(),
        minAgeRequirement: z.number().optional(),
        notes: z.string().optional(),
        isActive: z.boolean().optional()
      }))
    }))
    .mutation(async ({ ctx, input }) => {
      const { clinicId, availability } = input;

      // Delete existing availability
      await ctx.db.clinicContactAvailability.deleteMany({
        where: { clinicId }
      });

      // Create new availability records
      const createdAvailability = await Promise.all(
        availability.map(item => 
          ctx.db.clinicContactAvailability.create({
            data: {
              clinicId,
              ...item
            }
          })
        )
      );

      return createdAvailability;
    })
});

/**
 * Contact Form Personalization
 * Handles clinic-specific form configurations and routing
 */
const clinicContactFormRouter = createTRPCRouter({
  // Get personalized contact form for clinic
  getPersonalizedForm: publicProcedure
    .input(z.object({ 
      clinicId: z.string(),
      categoryId: z.string().optional()
    }))
    .query(async ({ ctx, input }) => {
      const { clinicId, categoryId } = input;

      // Get clinic contact settings
      const settings = await ctx.db.clinicContactSettings.findUnique({
        where: { clinicId }
      });

      // Get clinic-specific form if available
      const clinicForm = await ctx.db.clinicContactForm.findFirst({
        where: { 
          clinicId, 
          isActive: true,
          ...(categoryId && { formCategory: { id: categoryId } })
        },
        orderBy: { sortOrder: 'asc' }
      });

      // Get available staff for assignment
      const staff = await ctx.db.clinicContactStaff.findMany({
        where: { 
          clinicId, 
          isActive: true 
        },
        select: {
          id: true,
          staffName: true,
          role: true,
          department: true,
          maxConcurrentCases: true,
          skills: true,
          serviceExpertise: true
        }
      });

      // Get clinic-specific FAQ for auto-suggestions
      const faqs = await ctx.db.clinicFAQ.findMany({
        where: { 
          clinicId, 
          isActive: true, 
          autoSuggest: true 
        },
        orderBy: { priorityLevel: 'desc' },
        take: 5
      });

      return {
        settings,
        clinicForm,
        availableStaff: staff,
        faqs,
        personalization: {
          greetingMessage: settings?.autoResponseMessage || "Thank you for contacting us. We'll get back to you soon.",
          clinicName: settings?.clinic?.name,
          languages: settings?.defaultResponseLanguage || "en"
        }
      };
    }),

  // Submit personalized contact form
  submitPersonalizedForm: publicProcedure
    .input(z.object({
      // Form data
      subject: z.string(),
      message: z.string(),
      contactName: z.string(),
      contactEmail: z.string(),
      contactPhone: z.string().optional(),
      preferredContactMethod: z.nativeEnum(ContactMethod).optional(),
      
      // Clinic context
      clinicId: z.string(),
      categoryId: z.string().optional(),
      
      // Patient context
      patientType: z.nativeEnum(PatientType).optional(),
      isReturningPatient: z.boolean().optional(),
      preferredLanguage: z.string().optional(),
      
      // Service context
      serviceContext: z.string().optional(),
      appointmentType: z.string().optional(),
      requiresAppointment: z.boolean().optional(),
      followUpRequired: z.boolean().optional(),
      
      // Routing preferences
      preferredStaffId: z.string().optional(),
      urgencyOverride: z.nativeEnum(UrgencyLevel).optional(),
      preferredResponseTime: z.number().optional(),
      avoidCommunication: z.array(z.string()).optional(),
      
      // Medical information
      medicalInformation: z.string().optional(),
      conditionType: z.string().optional(),
      
      // Consent
      privacyConsent: z.boolean(),
      marketingConsent: z.boolean().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const { clinicId, ...formData } = input;

      // Generate reference number
      const referenceNumber = `CF${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

      // Create contact form
      const contactForm = await ctx.db.contactForm.create({
        data: {
          referenceNumber,
          subject: formData.subject,
          message: formData.message,
          contactName: formData.contactName,
          contactEmail: formData.contactEmail,
          contactPhone: formData.contactPhone,
          preferredContactMethod: formData.preferredContactMethod || ContactMethod.EMAIL,
          clinicId,
          categoryId: formData.categoryId || '',
          patientType: formData.patientType || PatientType.NEW,
          medicalInformation: formData.medicalInformation,
          urgencyLevel: formData.urgencyOverride || UrgencyLevel.ROUTINE,
          privacyConsent: formData.privacyConsent,
          marketingConsent: formData.marketingConsent || false
        }
      });

      // Create clinic-specific preferences
      await ctx.db.contactFormClinicPreference.create({
        data: {
          contactFormId: contactForm.id,
          clinicId,
          preferredStaffId: formData.preferredStaffId,
          serviceContext: formData.serviceContext,
          urgencyOverride: formData.urgencyOverride,
          patientType: formData.patientType || PatientType.NEW,
          isReturningPatient: formData.isReturningPatient || false,
          preferredLanguage: formData.preferredLanguage || 'en',
          requiresAppointment: formData.requiresAppointment || false,
          appointmentType: formData.appointmentType,
          followUpRequired: formData.followUpRequired || false,
          preferredResponseTime: formData.preferredResponseTime,
          avoidCommunication: formData.avoidCommunication || []
        }
      });

      // Auto-assign based on clinic routing rules
      await autoAssignToClinic(ctx, contactForm.id, clinicId, formData);

      return {
        referenceNumber,
        formId: contactForm.id,
        status: 'submitted',
        estimatedResponseTime: formData.preferredResponseTime || 24
      };
    }),

  // Get form submission status
  getFormStatus: publicProcedure
    .input(z.object({ referenceNumber: z.string() }))
    .query(async ({ ctx, input }) => {
      const form = await ctx.db.contactForm.findUnique({
        where: { referenceNumber: input.referenceNumber },
        include: {
          clinic: true,
          enquiry: true,
          clinicPreferences: {
            include: {
              clinic: true
            }
          }
        }
      });

      if (!form) {
        throw new Error('Form not found');
      }

      return {
        referenceNumber: form.referenceNumber,
        status: form.status,
        clinicName: form.clinic?.name,
        assignedStaff: form.assignedAgentId,
        responseDue: form.responseDue,
        estimatedResponseTime: form.clinicPreferences?.preferredResponseTime
      };
    })
});

/**
 * Location-based Contact Routing
 * Handles geographic routing and service area matching
 */
const clinicContactRoutingRouter = createTRPCRouter({
  // Get routing rules for clinic
  getRoutingRules: protectedProcedure
    .input(z.object({ clinicId: z.string() }))
    .query(async ({ ctx, input }) => {
      const rules = await ctx.db.clinicContactRouting.findMany({
        where: { clinicId: input.clinicId, isActive: true },
        orderBy: { priority: 'asc' }
      });
      return rules;
    }),

  // Calculate best clinic for contact based on location and service
  findBestClinic: publicProcedure
    .input(z.object({
      postalCode: z.string(),
      serviceType: z.string().optional(),
      conditionType: z.string().optional(),
      urgencyLevel: z.nativeEnum(UrgencyLevel).optional(),
      preferredLanguage: z.string().optional(),
      patientAge: z.number().optional(),
      hasInsurance: z.boolean().optional()
    }))
    .query(async ({ ctx, input }) => {
      const { postalCode, ...criteria } = input;

      // Find clinics in service area
      const serviceAreas = await ctx.db.clinicServiceArea.findMany({
        where: {
          postalCodes: { has: postalCode },
          isActive: true
        },
        include: {
          clinic: {
            include: {
              contactSettings: true,
              contactRouting: {
                where: { isActive: true },
                orderBy: { priority: 'asc' }
              },
              contactAvailability: {
                where: { isActive: true }
              }
            }
          }
        }
      });

      // Score and rank clinics
      const rankedClinics = serviceAreas
        .map(area => {
          const clinic = area.clinic;
          const settings = clinic.contactSettings;
          const routingRules = clinic.contactRouting;
          const availability = clinic.contactAvailability;

          // Calculate compatibility score
          let score = 0;
          let reason = [];

          // Service type matching
          if (criteria.serviceType && area.serviceTypes.includes(criteria.serviceType)) {
            score += 30;
            reason.push(`Specializes in ${criteria.serviceType}`);
          }

          // Urgency level matching
          if (criteria.urgencyLevel && routingRules.some(rule => 
            rule.urgencyLevels.includes(criteria.urgencyLevel!))) {
            score += 25;
            reason.push('Handles urgent cases');
          }

          // Language support
          if (criteria.preferredLanguage && 
              availability.some(avail => 
                avail.languagesAvailable.includes(criteria.preferredLanguage!))) {
            score += 20;
            reason.push(`Supports ${criteria.preferredLanguage}`);
          }

          // Operating hours
          const hasOperatingHours = availability.length > 0;
          if (hasOperatingHours) {
            score += 15;
            reason.push('Has specified operating hours');
          }

          // Contact availability
          if (settings?.enableContactForm) {
            score += 10;
            reason.push('Online contact form available');
          }

          return {
            clinic,
            score,
            reason,
            serviceArea: area
          };
        })
        .filter(result => result.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      return rankedClinics;
    }),

  // Update clinic contact routing rules
  updateRoutingRules: protectedProcedure
    .input(z.object({
      clinicId: z.string(),
      rules: z.array(z.object({
        id: z.string().optional(),
        ruleName: z.string(),
        description: z.string().optional(),
        isActive: z.boolean().optional(),
        priority: z.number().optional(),
        postalCodes: z.array(z.string()).optional(),
        serviceTypes: z.array(z.string()).optional(),
        conditionTypes: z.array(z.string()).optional(),
        urgencyLevels: z.array(z.nativeEnum(UrgencyLevel)).optional(),
        patientAgeGroups: z.array(z.string()).optional(),
        languages: z.array(z.string()).optional(),
        primaryAssigneeType: z.nativeEnum(AssigneeType).optional(),
        enableFallback: z.boolean().optional(),
        fallbackDelay: z.number().optional()
      }))
    }))
    .mutation(async ({ ctx, input }) => {
      const { clinicId, rules } = input;

      // Delete existing rules
      await ctx.db.clinicContactRouting.deleteMany({
        where: { clinicId }
      });

      // Create new rules
      const createdRules = await Promise.all(
        rules.map(rule => 
          ctx.db.clinicContactRouting.create({
            data: {
              clinicId,
              ...rule
            }
          })
        )
      );

      return createdRules;
    })
});

/**
 * Contact Response Templates
 * Manages clinic-specific response templates
 */
const clinicResponseTemplateRouter = createTRPCRouter({
  // Get response templates for clinic
  getTemplates: protectedProcedure
    .input(z.object({ 
      clinicId: z.string(),
      category: z.nativeEnum(ContactTemplateCategory).optional(),
      language: z.string().optional()
    }))
    .query(async ({ ctx, input }) => {
      const templates = await ctx.db.clinicResponseTemplate.findMany({
        where: {
          clinicId: input.clinicId,
          isActive: true,
          ...(input.category && { category: input.category }),
          ...(input.language && { language: input.language })
        },
        orderBy: { sortOrder: 'asc' }
      });
      return templates;
    }),

  // Create response template
  createTemplate: protectedProcedure
    .input(z.object({
      clinicId: z.string(),
      templateName: z.string(),
      displayName: z.string(),
      category: z.nativeEnum(ContactTemplateCategory),
      subject: z.string().optional(),
      content: z.string(),
      signature: z.string().optional(),
      variables: z.array(z.string()).optional(),
      triggerConditions: z.array(z.string()).optional(),
      enquiryTypes: z.array(z.nativeEnum(EnquiryType)).optional(),
      priorityLevels: z.array(z.nativeEnum(ContactPriority)).optional(),
      language: z.string().optional(),
      requiresApproval: z.boolean().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const template = await ctx.db.clinicResponseTemplate.create({
        data: input
      });
      return template;
    }),

  // Apply template to response
  applyTemplate: protectedProcedure
    .input(z.object({
      templateId: z.string(),
      enquiryId: z.string(),
      variables: z.record(z.string()).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const template = await ctx.db.clinicResponseTemplate.findUnique({
        where: { id: input.templateId }
      });

      if (!template) {
        throw new Error('Template not found');
      }

      // Process template variables
      let content = template.content;
      let subject = template.subject;
      
      if (input.variables) {
        Object.entries(input.variables).forEach(([key, value]) => {
          content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
          if (subject) {
            subject = subject.replace(new RegExp(`{{${key}}}`, 'g'), value);
          }
        });
      }

      // Create response
      const response = await ctx.db.contactResponse.create({
        data: {
          enquiryId: input.enquiryId,
          responseType: ResponseType.TEMPLATE_RESPONSE,
          subject,
          content,
          templateUsed: template.templateName,
          autoGenerated: true,
          status: 'DRAFT'
        }
      });

      // Update template usage count
      await ctx.db.clinicResponseTemplate.update({
        where: { id: input.templateId },
        data: { usageCount: { increment: 1 } }
      });

      return response;
    })
});

/**
 * Contact History and Patient Tracking
 * Manages patient communication history and relationship tracking
 */
const clinicContactHistoryRouter = createTRPCRouter({
  // Get contact history for patient
  getContactHistory: protectedProcedure
    .input(z.object({ 
      clinicId: z.string(),
      patientId: z.string().optional(),
      contactFormId: z.string().optional(),
      enquiryId: z.string().optional()
    }))
    .query(async ({ ctx, input }) => {
      const { clinicId, ...filters } = input;
      
      const history = await ctx.db.clinicContactHistory.findMany({
        where: {
          clinicId,
          ...(filters.patientId && { patientId: filters.patientId }),
          ...(filters.contactFormId && { contactFormId: filters.contactFormId }),
          ...(filters.enquiryId && { enquiryId: filters.enquiryId })
        },
        include: {
          clinic: true,
          contactForm: true,
          enquiry: true
        },
        orderBy: { createdAt: 'desc' }
      });

      return history;
    }),

  // Update patient relationship status
  updatePatientRelationship: protectedProcedure
    .input(z.object({
      contactHistoryId: z.string(),
      relationshipStatus: z.string(),
      satisfactionScore: z.number().optional(),
      netPromoterScore: z.number().optional(),
      wouldRecommend: z.boolean().optional(),
      followUpRequired: z.boolean().optional(),
      followUpDate: z.date().optional(),
      followUpType: z.string().optional(),
      followUpNotes: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const { contactHistoryId, ...updateData } = input;
      
      const updated = await ctx.db.clinicContactHistory.update({
        where: { id: contactHistoryId },
        data: updateData
      });

      return updated;
    }),

  // Get patient communication summary
  getPatientCommunicationSummary: protectedProcedure
    .input(z.object({ 
      clinicId: z.string(),
      patientId: z.string() 
    }))
    .query(async ({ ctx, input }) => {
      const history = await ctx.db.clinicContactHistory.findMany({
        where: {
          clinicId: input.clinicId,
          patientId: input.patientId
        },
        orderBy: { createdAt: 'desc' }
      });

      // Calculate summary statistics
      const summary = {
        totalContacts: history.length,
        communicationMethods: [...new Set(history.map(h => h.channel))],
        averageSatisfaction: history
          .filter(h => h.satisfactionScore)
          .reduce((sum, h, _, arr) => sum + (h.satisfactionScore! / arr.length), 0),
        lastContactDate: history[0]?.createdAt,
        preferredChannel: history.reduce((acc, h) => {
          acc[h.channel] = (acc[h.channel] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        relationshipStatus: history[0]?.relationshipStatus,
        followUpsRequired: history.filter(h => h.requiresFollowUp).length
      };

      return summary;
    })
});

/**
 * Contact Performance Metrics
 * Provides clinic contact performance analytics
 */
const clinicContactMetricsRouter = createTRPCRouter({
  // Get clinic contact performance metrics
  getMetrics: protectedProcedure
    .input(z.object({
      clinicId: z.string(),
      period: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']).optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional()
    }))
    .query(async ({ ctx, input }) => {
      const { clinicId, period = 'MONTHLY', startDate, endDate } = input;
      
      const metrics = await ctx.db.clinicContactMetrics.findMany({
        where: {
          clinicId,
          ...(period && { period }),
          ...(startDate && { periodStart: { gte: startDate } }),
          ...(endDate && { periodEnd: { lte: endDate } })
        },
        orderBy: { periodStart: 'desc' }
      });

      return metrics;
    }),

  // Calculate real-time metrics
  getRealTimeMetrics: protectedProcedure
    .input(z.object({ clinicId: z.string() }))
    .query(async ({ ctx, input }) => {
      const clinicId = input.clinicId;
      
      // Get current day metrics
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayEnquiries = await ctx.db.enquiry.count({
        where: {
          clinicId,
          createdAt: { gte: today }
        }
      });

      const todayResponses = await ctx.db.contactResponse.count({
        where: {
          enquiry: { clinicId },
          sentAt: { gte: today }
        }
      });

      const activeAssignments = await ctx.db.clinicContactAssignment.count({
        where: {
          clinicId,
          status: { in: ['ACTIVE', 'IN_PROGRESS'] }
        }
      });

      // Calculate average response time for today
      const todayFormResponses = await ctx.db.contactForm.findMany({
        where: {
          clinicId,
          createdAt: { gte: today },
          firstResponseTime: { not: null }
        }
      });

      const avgResponseTime = todayFormResponses.length > 0
        ? todayFormResponses.reduce((sum, form) => sum + form.firstResponseTime!, 0) / todayFormResponses.length
        : 0;

      return {
        todayEnquiries,
        todayResponses,
        activeAssignments,
        avgResponseTime: Math.round(avgResponseTime),
        responseRate: todayEnquiries > 0 ? (todayResponses / todayEnquiries) * 100 : 0
      };
    }),

  // Get performance dashboard data
  getDashboardData: protectedProcedure
    .input(z.object({ clinicId: z.string() }))
    .query(async ({ ctx, input }) => {
      const clinicId = input.clinicId;
      
      // Get recent metrics
      const recentMetrics = await ctx.db.clinicContactMetrics.findMany({
        where: { clinicId },
        orderBy: { periodStart: 'desc' },
        take: 3
      });

      // Get current staff workload
      const staffWorkload = await ctx.db.clinicContactAssignment.groupBy({
        by: ['staffId'],
        where: {
          clinicId,
          status: { in: ['ACTIVE', 'IN_PROGRESS'] }
        },
        _count: true
      });

      // Get top performing staff
      const topStaff = await ctx.db.clinicContactAssignment.findMany({
        where: { clinicId },
        include: {
          enquiry: true
        },
        orderBy: { qualityScore: 'desc' },
        take: 5
      });

      return {
        recentMetrics,
        staffWorkload,
        topStaff,
        trends: {
          enquiryTrend: recentMetrics[0]?.enquiryTrend,
          satisfactionTrend: recentMetrics[0]?.satisfactionTrend,
          responseTimeTrend: recentMetrics[0]?.responseTimeTrend
        }
      };
    })
});

/**
 * FAQ Integration
 * Handles clinic-specific FAQ and knowledge base
 */
const clinicFAQRouter = createTRPCRouter({
  // Get clinic FAQs
  getFAQs: publicProcedure
    .input(z.object({
      clinicId: z.string(),
      category: z.string().optional(),
      search: z.string().optional(),
      language: z.string().optional()
    }))
    .query(async ({ ctx, input }) => {
      const { clinicId, category, search, language = 'en' } = input;
      
      const faqs = await ctx.db.clinicFAQ.findMany({
        where: {
          clinicId,
          isActive: true,
          ...(category && { category }),
          ...(search && {
            OR: [
              { question: { contains: search, mode: 'insensitive' } },
              { answer: { contains: search, mode: 'insensitive' } },
              { tags: { has: search } }
            ]
          }),
          supportedLanguages: { has: language }
        },
        orderBy: [
          { priorityLevel: 'desc' },
          { displayOrder: 'asc' }
        ]
      });

      return faqs;
    }),

  // Get auto-suggested FAQs based on contact content
  getSuggestedFAQs: publicProcedure
    .input(z.object({
      clinicId: z.string(),
      contactContent: z.string(),
      serviceType: z.string().optional()
    }))
    .query(async ({ ctx, input }) => {
      const { clinicId, contactContent, serviceType } = input;
      
      // Simple keyword matching for demonstration
      // In production, this would use more sophisticated NLP
      const keywords = contactContent.toLowerCase().split(' ').filter(word => word.length > 3);
      
      const faqs = await ctx.db.clinicFAQ.findMany({
        where: {
          clinicId,
          isActive: true,
          autoSuggest: true,
          OR: keywords.map(keyword => ({
            OR: [
              { question: { contains: keyword, mode: 'insensitive' } },
              { answer: { contains: keyword, mode: 'insensitive' } },
              { tags: { has: keyword } }
            ]
          }))
        },
        orderBy: { priorityLevel: 'desc' },
        take: 3
      });

      return faqs;
    }),

  // Record FAQ feedback
  recordFAQLink: publicProcedure
    .input(z.object({
      faqId: z.string(),
      isHelpful: z.boolean(),
      contactFormId: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const { faqId, isHelpful } = input;
      
      await ctx.db.clinicFAQ.update({
        where: { id: faqId },
        data: {
          helpfulCount: { increment: isHelpful ? 1 : 0 },
          notHelpfulCount: { increment: isHelpful ? 0 : 1 },
          viewCount: { increment: 1 }
        }
      });

      return { success: true };
    })
});

/**
 * Helper Functions
 */

// Auto-assign contact form to appropriate clinic staff
async function autoAssignToClinic(
  ctx: any, 
  contactFormId: string, 
  clinicId: string, 
  formData: any
) {
  // Get clinic routing rules
  const routingRules = await ctx.db.clinicContactRouting.findMany({
    where: { clinicId, isActive: true },
    orderBy: { priority: 'asc' }
  });

  // Apply routing logic
  for (const rule of routingRules) {
    if (shouldApplyRule(rule, formData)) {
      // Create assignment
      await ctx.db.clinicContactAssignment.create({
        data: {
          clinicId,
          contactFormId,
          assignmentType: AssignmentType.AUTOMATED,
          priority: formData.urgencyOverride === UrgencyLevel.URGENT ? 
            AssignmentPriority.HIGH : AssignmentPriority.NORMAL,
          assignmentReason: `Matched routing rule: ${rule.ruleName}`,
          skillMatch: getMatchingSkills(rule, formData),
          currentWorkload: 0,
          status: ContactAssignmentStatus.PENDING
        }
      });

      // Create enquiry
      await ctx.db.enquiry.create({
        data: {
          contactFormId,
          enquiryNumber: `EN${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
          title: formData.subject,
          description: formData.message,
          priority: formData.urgencyOverride === UrgencyLevel.URGENT ? 
            'HIGH' : 'NORMAL',
          department: 'GENERAL',
          specializedTeam: rule.primaryAssigneeId || 'general_support'
        }
      });

      break;
    }
  }
}

function shouldApplyRule(rule: any, formData: any): boolean {
  // Simplified rule matching logic
  if (rule.serviceTypes.length > 0 && formData.serviceContext) {
    return rule.serviceTypes.includes(formData.serviceContext);
  }
  
  if (rule.urgencyLevels.length > 0 && formData.urgencyOverride) {
    return rule.urgencyLevels.includes(formData.urgencyOverride);
  }
  
  return true; // Default rule
}

function getMatchingSkills(rule: any, formData: any): string[] {
  const skills = [];
  if (formData.serviceContext) skills.push(formData.serviceContext);
  if (formData.urgencyOverride === 'URGENT') skills.push('urgent_care');
  return skills;
}

/**
 * Main Clinic Contact Integration Router
 */
export const clinicContactIntegrationRouter = createTRPCRouter({
  contactSettings: clinicContactSettingsRouter,
  contactForms: clinicContactFormRouter,
  routing: clinicContactRoutingRouter,
  responseTemplates: clinicResponseTemplateRouter,
  contactHistory: clinicContactHistoryRouter,
  metrics: clinicContactMetricsRouter,
  faq: clinicFAQRouter
});
