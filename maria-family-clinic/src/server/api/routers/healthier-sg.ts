import { z } from 'zod'
import { createTRPCRouter, publicProcedure, protectedProcedure, adminProcedure, calculatePagination } from '../trpc'
import { TRPCError } from '@trpc/server'
import { Prisma } from '@prisma/client'

const healthierSgRegistrationSelect = {
  id: true,
  userId: true,
  registrationDate: true,
  status: true,
  eligibilityCriteria: true,
  medicalCheckupRequired: true,
  chronicConditions: true,
  lifestyleFactors: true,
  targetGoals: true,
  progressNotes: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      email: true,
      profile: {
        select: {
          firstName: true,
          lastName: true,
          dateOfBirth: true,
          gender: true,
        },
      },
    },
  },
}

/**
 * Healthier SG Router - Handles Healthier SG program-related operations including
 * benefits and incentives tracking
 */
export const healthierSgRouter = createTRPCRouter({
  /**
   * Get Healthier SG eligibility rules (public)
   */
  getEligibilityRules: publicProcedure.query(async ({ ctx }) => {
    try {
      // Return default Healthier SG eligibility rules
      return {
        rules: [
          {
            id: 'age-40-plus',
            name: 'Age Requirement',
            description: 'Applicant must be 40 years or older',
            category: 'DEMOGRAPHIC',
            weight: 25,
            isRequired: true,
            active: true,
            order: 1,
          },
          {
            id: 'citizenship-status',
            name: 'Citizenship Status',
            description: 'Must be Singapore Citizen or Permanent Resident',
            category: 'DEMOGRAPHIC',
            weight: 30,
            isRequired: true,
            active: true,
            order: 2,
          },
          {
            id: 'chronic-conditions',
            name: 'Chronic Conditions Priority',
            description: 'Having chronic conditions qualifies for priority enrollment',
            category: 'HEALTH',
            weight: 20,
            isRequired: false,
            active: true,
            order: 3,
          },
          {
            id: 'consent-to-screening',
            name: 'Health Screening Consent',
            description: 'Must consent to health screening and data collection',
            category: 'HEALTH',
            weight: 15,
            isRequired: true,
            active: true,
            order: 4,
          },
        ],
        progressiveDisclosure: [
          {
            triggerQuestionId: 'hasChronicConditions',
            triggerValue: true,
            showQuestionIds: ['chronicConditionsList', 'lastMedicalCheckup'],
          },
        ],
        confidenceThreshold: 70,
        totalPossibleScore: 100,
      }
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch eligibility rules',
        cause: error,
      })
    }
  }),

  /**
   * Evaluate eligibility using dynamic rule engine
   */
  evaluateEligibility: protectedProcedure
    .input(
      z.object({
        responses: z.array(z.object({
          questionId: z.string(),
          value: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]),
          timestamp: z.date(),
        })),
        assessmentId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { responses, assessmentId } = input

      try {
        // Evaluate using rule engine logic
        const responseMap = new Map(responses.map(r => [r.questionId, r.value]))
        
        // Basic rule evaluation (can be enhanced with actual rule engine)
        let score = 0
        let isEligible = true
        const criteriaResults = []

        // Age requirement
        const age = responseMap.get('age')
        const agePass = age && Number(age) >= 40
        criteriaResults.push({
          name: 'Age Requirement',
          passed: agePass,
          score: agePass ? 25 : 0,
          description: 'Must be 40 years or older',
          recommendation: agePass ? 'Meets age requirement' : 'Must be 40 or older to qualify',
        })
        score += agePass ? 25 : 0

        // Citizenship status
        const citizenship = responseMap.get('citizenshipStatus')
        const citizenshipPass = ['CITIZEN', 'PR'].includes(citizenship)
        criteriaResults.push({
          name: 'Citizenship Status',
          passed: citizenshipPass,
          score: citizenshipPass ? 30 : 0,
          description: 'Must be Singapore Citizen or Permanent Resident',
          recommendation: citizenshipPass ? 'Meets citizenship requirement' : 'Must be Singapore Citizen or PR',
        })
        score += citizenshipPass ? 30 : 0

        // Chronic conditions (optional bonus)
        const hasChronic = responseMap.get('hasChronicConditions')
        const chronicPass = hasChronic === true
        criteriaResults.push({
          name: 'Chronic Conditions',
          passed: true, // Not required but helpful
          score: hasChronic ? 20 : 0,
          description: 'Having chronic conditions provides priority consideration',
          recommendation: hasChronic ? 'Has chronic conditions - eligible for priority' : 'No chronic conditions reported',
        })
        score += hasChronic ? 20 : 0

        // Consent to screening
        const consent = responseMap.get('consentToScreening')
        const consentPass = consent === true
        criteriaResults.push({
          name: 'Screening Consent',
          passed: consentPass,
          score: consentPass ? 15 : 0,
          description: 'Must consent to health screening and data collection',
          recommendation: consentPass ? 'Consents to screening requirements' : 'Screening consent required',
        })
        score += consentPass ? 15 : 0

        // Program commitment
        const commitment = responseMap.get('commitmentLevel')
        const commitmentPass = ['HIGH', 'MODERATE'].includes(commitment)
        criteriaResults.push({
          name: 'Program Commitment',
          passed: commitmentPass,
          score: commitmentPass ? 10 : 0,
          description: 'Must demonstrate willingness to participate',
          recommendation: commitmentPass ? 'Shows commitment to program' : 'Must be willing to participate actively',
        })
        score += commitmentPass ? 10 : 0

        // Overall eligibility check
        const requiredPassed = agePass && citizenshipPass && consentPass && commitmentPass
        isEligible = requiredPassed && score >= 70

        // Calculate confidence
        const confidence = score / 100

        // Create or update assessment record
        const assessment = await ctx.prisma.eligibilityAssessment.create({
          data: {
            userId: ctx.session.user.id,
            questionnaireResponses: responses,
            evaluationResult: {
              isEligible,
              confidence,
              score,
              criteriaResults,
            },
            eligibilityStatus: isEligible ? 'ELIGIBLE' : 'NOT_ELIGIBLE',
            assessmentDate: new Date(),
          },
        })

        // Build next steps based on eligibility
        const nextSteps = []
        if (isEligible) {
          nextSteps.push(
            {
              title: 'Choose a participating clinic',
              description: 'Find a Healthier SG partner clinic near you',
              priority: 'HIGH' as const,
              actionRequired: true,
            },
            {
              title: 'Schedule initial consultation',
              description: 'Book your first health screening appointment',
              priority: 'HIGH' as const,
              actionRequired: true,
            },
            {
              title: 'Prepare documentation',
              description: 'Gather your IC, medication list, and medical history',
              priority: 'MEDIUM' as const,
              actionRequired: true,
            }
          )
        } else {
          nextSteps.push(
            {
              title: 'Review eligibility criteria',
              description: 'Understand which requirements are not met',
              priority: 'HIGH' as const,
              actionRequired: false,
            },
            {
              title: 'Consider lifestyle changes',
              description: 'Work on meeting criteria you may be able to improve',
              priority: 'MEDIUM' as const,
              actionRequired: false,
            },
            {
              title: 'Reassess in the future',
              description: 'Circumstances may change to make you eligible',
              priority: 'LOW' as const,
              actionRequired: false,
            }
          )
        }

        return {
          success: true,
          data: {
            isEligible,
            confidence,
            score,
            criteriaResults,
            nextSteps,
            appealsAvailable: true,
            appealDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          },
          assessmentId: assessment.id,
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to evaluate eligibility',
          cause: error,
        })
      }
    }),

  /**
   * Get eligibility assessment history for user
   */
  getEligibilityHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, offset } = input

      try {
        const [assessments, total] = await Promise.all([
          ctx.prisma.eligibilityAssessment.findMany({
            where: { userId: ctx.session.user.id },
            select: {
              id: true,
              assessmentDate: true,
              eligibilityStatus: true,
              evaluationResult: true,
              createdAt: true,
              updatedAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
          }),
          ctx.prisma.eligibilityAssessment.count({
            where: { userId: ctx.session.user.id },
          }),
        ])

        // Calculate summary statistics
        const eligibleCount = assessments.filter(a => a.eligibilityStatus === 'ELIGIBLE').length
        const totalAssessments = assessments.length
        const successRate = totalAssessments > 0 ? (eligibleCount / totalAssessments) * 100 : 0

        return {
          assessments,
          pagination: {
            total,
            limit,
            offset,
            hasMore: offset + limit < total,
          },
          summary: {
            totalAssessments,
            eligibleAssessments: eligibleCount,
            successRate,
            lastAssessmentDate: assessments[0]?.assessmentDate,
          },
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch eligibility history',
          cause: error,
        })
      }
    }),

  /**
   * Submit eligibility appeal
   */
  submitAppeal: protectedProcedure
    .input(
      z.object({
        assessmentId: z.string(),
        reason: z.enum([
          'INCORRECT_INFORMATION',
          'MISSING_DOCUMENTATION',
          'EXCEPTIONAL_CIRCUMSTANCES',
          'POLICY_CLARIFICATION',
          'OTHER',
        ]),
        description: z.string(),
        supportingDocuments: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { assessmentId, reason, description, supportingDocuments = [] } = input

      try {
        // Verify assessment exists and belongs to user
        const assessment = await ctx.prisma.eligibilityAssessment.findFirst({
          where: {
            id: assessmentId,
            userId: ctx.session.user.id,
          },
        })

        if (!assessment) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Assessment not found or access denied',
          })
        }

        // Check if appeal deadline has passed (30 days)
        const appealDeadline = new Date(assessment.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000)
        if (new Date() > appealDeadline) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Appeal deadline has passed',
          })
        }

        // Check if appeal already exists for this assessment
        const existingAppeal = await ctx.prisma.eligibilityAppeal.findFirst({
          where: {
            assessmentId,
            userId: ctx.session.user.id,
            status: { in: ['PENDING', 'UNDER_REVIEW'] },
          },
        })

        if (existingAppeal) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'An appeal is already pending for this assessment',
          })
        }

        // Create appeal
        const appeal = await ctx.prisma.eligibilityAppeal.create({
          data: {
            userId: ctx.session.user.id,
            assessmentId,
            appealReason: reason,
            additionalContext: description,
            supportingDocuments: supportingDocuments,
            status: 'SUBMITTED',
            priority: 'NORMAL',
            submittedAt: new Date(),
          },
        })

        return {
          success: true,
          appeal: {
            id: appeal.id,
            status: appeal.status,
            submittedAt: appeal.submittedAt,
            appealDeadline,
          },
          message: 'Appeal submitted successfully. You will receive a response within 5-7 business days.',
        }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to submit appeal',
          cause: error,
        })
      }
    }),

  /**
   * Track eligibility assessment analytics
   */
  trackEligibilityAssessment: protectedProcedure
    .input(
      z.object({
        assessmentId: z.string().optional(),
        action: z.enum(['STARTED', 'PROGRESS', 'COMPLETED', 'ABANDONED']),
        questionId: z.string().optional(),
        timeSpent: z.number().optional(), // in seconds
        deviceType: z.enum(['DESKTOP', 'MOBILE', 'TABLET']).default('DESKTOP'),
        browserInfo: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { assessmentId, action, questionId, timeSpent, deviceType, browserInfo } = input

      try {
        // For now, just log analytics - could be expanded to store in database
        const analyticsData = {
          userId: ctx.session.user.id,
          assessmentId,
          action,
          questionId,
          timeSpent,
          deviceType,
          browserInfo,
          timestamp: new Date(),
          sessionId: ctx.session.id,
        }

        // In production, this would be stored in analytics database
        console.log('Eligibility Assessment Analytics:', analyticsData)

        return {
          success: true,
          message: 'Analytics tracked successfully',
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to track assessment analytics',
          cause: error,
        })
      }
    }),

  /**
   * Get eligibility summary for user
   */
  getEligibilitySummary: protectedProcedure.query(async ({ ctx }) => {
    try {
      const userId = ctx.session.user.id

      // Get latest assessment
      const latestAssessment = await ctx.prisma.eligibilityAssessment.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      })

      // Get user's enrollment status
      const enrollment = await ctx.prisma.healthierSgRegistration.findUnique({
        where: { userId },
        select: {
          id: true,
          status: true,
          registrationDate: true,
          eligibilityCriteria: true,
        },
      })

      // Get recent appeals
      const appeals = await ctx.prisma.eligibilityAppeal.findMany({
        where: { userId },
        orderBy: { submittedAt: 'desc' },
        take: 5,
        select: {
          id: true,
          status: true,
          appealReason: true,
          submittedAt: true,
          reviewedAt: true,
        },
      })

      let currentStatus = 'NOT_ELIGIBLE'
      let isEligible = false
      let eligibilityReason = 'No assessment completed'
      let nextSteps = []

      if (enrollment && enrollment.status === 'ACTIVE') {
        currentStatus = 'ELIGIBLE'
        isEligible = true
        eligibilityReason = 'Successfully enrolled in Healthier SG program'
        nextSteps = [
          {
            title: 'Schedule annual health screening',
            description: 'Book your comprehensive health checkup',
            priority: 'HIGH' as const,
            completed: false,
          },
          {
            title: 'Review personalized care plan',
            description: 'Check your health goals and progress',
            priority: 'MEDIUM' as const,
            completed: false,
          },
        ]
      } else if (latestAssessment) {
        const result = latestAssessment.evaluationResult as any
        isEligible = result?.isEligible || false
        eligibilityReason = result?.reason || 'Assessment completed'

        if (isEligible) {
          currentStatus = 'ELIGIBLE'
          nextSteps = [
            {
              title: 'Choose participating clinic',
              description: 'Find a Healthier SG partner clinic',
              priority: 'HIGH' as const,
              completed: false,
            },
            {
              title: 'Complete enrollment',
              description: 'Finalize your Healthier SG registration',
              priority: 'HIGH' as const,
              completed: false,
            },
          ]
        } else {
          currentStatus = 'NOT_ELIGIBLE'
          nextSteps = [
            {
              title: 'Review assessment results',
              description: 'Understand why you are not currently eligible',
              priority: 'HIGH' as const,
              completed: false,
            },
            {
              title: 'Consider future re-evaluation',
              description: 'Circumstances may change in the future',
              priority: 'LOW' as const,
              completed: false,
            },
          ]
        }
      }

      // Check for pending appeals
      const pendingAppeal = appeals.find(a => ['SUBMITTED', 'UNDER_REVIEW'].includes(a.status))
      if (pendingAppeal) {
        currentStatus = 'APPEAL_SUBMITTED'
        isEligible = false
        eligibilityReason = 'Appeal under review'
      }

      return {
        currentStatus,
        isEligible,
        eligibilityReason,
        lastAssessmentDate: latestAssessment?.assessmentDate,
        enrollmentStatus: enrollment?.status || null,
        nextReviewDate: latestAssessment ? 
          new Date(latestAssessment.createdAt.getTime() + 90 * 24 * 60 * 60 * 1000) : null, // 90 days
        nextSteps,
        contactInfo: {
          supportEmail: 'healthiersg@health.gov.sg',
          supportPhone: '1800-777-9999',
          appealDeadline: latestAssessment ? 
            new Date(latestAssessment.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000) : null,
        },
        recentAppeals: appeals,
      }
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch eligibility summary',
        cause: error,
      })
    }
  }),

  /**
   * Get Healthier SG program information (public)
   */
  getProgramInfo: publicProcedure.query(async ({ ctx }) => {
    try {
      return {
        program: {
          name: 'Healthier SG',
          description: 'A national initiative to help Singapore residents take steps towards better health through primary care.',
          objectives: [
            'Promote preventive care and early intervention',
            'Encourage healthy lifestyle choices',
            'Strengthen primary care in the community',
            'Build healthier communities through screening and support',
          ],
          targetGroups: [
            'Adults aged 40 and above',
            'Individuals with chronic conditions',
            'Those at risk of developing chronic diseases',
            'Healthcare workers',
          ],
          benefits: [
            'Annual comprehensive health screening',
            'Personalised care plans',
            'Nutrition and exercise guidance',
            'Medication management',
            'Regular follow-ups',
          ],
          eligibilityCriteria: {
            age: '40+ years',
            residency: 'Singapore Citizens and Permanent Residents',
            health: 'Must have a participating clinic',
            commitment: 'Willingness to participate in health program',
          },
        },
        participatingClinics: await ctx.prisma.clinic.count({
          where: { isHealthierSgPartner: true, isActive: true },
        }),
        totalEnrolled: await ctx.prisma.userProfile.count({
          where: { healthierSgEnrolled: true },
        }),
      }
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch Healthier SG program information',
        cause: error,
      })
    }
  }),

  /**
   * Get all Healthier SG participating clinics (public)
   */
  getParticipatingClinics: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(20).default(10),
        search: z.string().optional(),
        district: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, search, district } = input
      const skip = (page - 1) * limit

      const where: Prisma.ClinicWhereInput = {
        isHealthierSgPartner: true,
        isActive: true,
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { address: { contains: search, mode: 'insensitive' } },
        ]
      }

      if (district) {
        // You might want to create a district field or use postal codes
        where.address = { contains: district, mode: 'insensitive' }
      }

      try {
        const [clinics, total] = await Promise.all([
          ctx.prisma.clinic.findMany({
            where,
            select: {
              id: true,
              name: true,
              address: true,
              phone: true,
              email: true,
              languages: true,
              facilities: true,
            },
            skip,
            take: limit,
            orderBy: { name: 'asc' },
          }),
          ctx.prisma.clinic.count({ where }),
        ])

        return {
          data: clinics,
          pagination: calculatePagination(page, limit, total),
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch participating clinics',
          cause: error,
        })
      }
    }),

  /**
   * Check eligibility for Healthier SG program
   */
  checkEligibility: protectedProcedure
    .input(
      z.object({
        age: z.number().min(18).max(120),
        hasChronicConditions: z.boolean().optional(),
        interestedInHealthierSg: z.boolean().default(true),
      })
    )
    .query(async ({ ctx, input }) => {
      const { age, hasChronicConditions, interestedInHealthierSg } = input

      try {
        // Basic eligibility check
        const isEligible = age >= 40 || hasChronicConditions === true

        const recommendations = []
        
        if (!isEligible) {
          recommendations.push('Consider enrolling when you turn 40 years old')
          recommendations.push('Maintain healthy lifestyle habits')
          recommendations.push('Regular health check-ups')
        } else {
          recommendations.push('Complete health screening')
          recommendations.push('Schedule initial consultation')
          recommendations.push('Discuss personal health goals')
        }

        if (hasChronicConditions) {
          recommendations.push('Bring current medication list')
          recommendations.push('Schedule follow-up appointments')
        }

        return {
          eligible: isEligible && interestedInHealthierSg,
          recommendations,
          nextSteps: isEligible && interestedInHealthierSg ? [
            'Find a participating clinic near you',
            'Schedule your first appointment',
            'Complete the enrollment form',
          ] : [],
          programDescription: 'Healthier SG helps Singapore residents work towards better health through comprehensive care, screening, and lifestyle support.',
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to check eligibility',
          cause: error,
        })
      }
    }),

  /**
   * Get user's Healthier SG enrollment status
   */
  getMyEnrollment: protectedProcedure.query(async ({ ctx }) => {
    try {
      const enrollment = await ctx.prisma.healthierSgRegistration.findUnique({
        where: { userId: ctx.session.user.id },
        select: healthierSgRegistrationSelect,
      })

      const profile = await ctx.prisma.userProfile.findUnique({
        where: { userId: ctx.session.user.id },
        select: {
          firstName: true,
          lastName: true,
          healthierSgEnrolled: true,
          healthierSgRegistrationDate: true,
        },
      })

      return {
        enrolled: profile?.healthierSgEnrolled || false,
        registrationDate: profile?.healthierSgRegistrationDate,
        enrollment: enrollment || null,
        canEnroll: !profile?.healthierSgEnrolled,
        nextSteps: profile?.healthierSgEnrolled ? [
          'Schedule your annual health screening',
          'Review your personalized care plan',
          'Set up regular follow-up appointments',
        ] : [
          'Find a participating clinic',
          'Schedule initial consultation',
          'Complete enrollment process',
        ],
      }
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch enrollment status',
        cause: error,
      })
    }
  }),

  /**
   * Register for Healthier SG program
   */
  enroll: protectedProcedure
    .input(
      z.object({
        clinicId: z.string().uuid(),
        eligibilityCriteria: z.object({
          age: z.number(),
          hasChronicConditions: z.boolean(),
          lifestyleFactors: z.array(z.string()).optional(),
          medicalHistory: z.string().optional(),
        }),
        targetGoals: z.array(z.string()).optional(),
        consentToParticipation: z.boolean(),
        consentToDataCollection: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { clinicId, eligibilityCriteria, targetGoals, consentToParticipation, consentToDataCollection } = input

      try {
        // Check if user is already enrolled
        const existingEnrollment = await ctx.prisma.healthierSgRegistration.findUnique({
          where: { userId: ctx.session.user.id },
        })

        if (existingEnrollment) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'User is already enrolled in Healthier SG program',
          })
        }

        // Verify clinic is a Healthier SG partner
        const clinic = await ctx.prisma.clinic.findFirst({
          where: { id: clinicId, isHealthierSgPartner: true, isActive: true },
        })

        if (!clinic) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Selected clinic is not a Healthier SG partner',
          })
        }

        // Check consent requirements
        if (!consentToParticipation || !consentToDataCollection) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Participation and data collection consent are required',
          })
        }

        // Create enrollment
        const enrollment = await ctx.prisma.$transaction(async (prisma) => {
          // Create Healthier SG registration record
          const registration = await prisma.healthierSgRegistration.create({
            data: {
              userId: ctx.session.user.id,
              registrationDate: new Date(),
              status: 'ACTIVE',
              eligibilityCriteria,
              medicalCheckupRequired: eligibilityCriteria.age >= 40 || eligibilityCriteria.hasChronicConditions,
              chronicConditions: eligibilityCriteria.hasChronicConditions ? 'To be assessed' : 'None reported',
              lifestyleFactors: eligibilityCriteria.lifestyleFactors || [],
              targetGoals: targetGoals || [],
              progressNotes: `Enrollment date: ${new Date().toISOString()}`,
            },
            select: healthierSgRegistrationSelect,
          })

          // Update user profile
          await prisma.userProfile.upsert({
            where: { userId: ctx.session.user.id },
            create: {
              userId: ctx.session.user.id,
              healthierSgEnrolled: true,
              healthierSgRegistrationDate: new Date(),
              preferredClinicId: clinicId,
            },
            update: {
              healthierSgEnrolled: true,
              healthierSgRegistrationDate: new Date(),
              preferredClinicId: clinicId,
            },
          })

          return registration
        })

        return {
          success: true,
          enrollment,
          message: 'Successfully enrolled in Healthier SG program',
          nextSteps: [
            'You will receive confirmation from your selected clinic within 2-3 business days',
            'Schedule your initial health screening appointment',
            'Prepare your medication list and medical history',
          ],
        }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to enroll in Healthier SG program',
          cause: error,
        })
      }
    }),

  /**
   * Get Healthier SG enrollment statistics (admin only)
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
        const dateFilter = {}
        if (startDate && endDate) {
          dateFilter['registrationDate'] = { gte: startDate, lte: endDate }
        }

        const [totalEnrolled, activeEnrollments, registrationsThisMonth, byAgeGroup, byStatus] = await Promise.all([
          ctx.prisma.healthierSgRegistration.count(),
          ctx.prisma.healthierSgRegistration.count({
            where: { status: 'ACTIVE', ...dateFilter },
          }),
          ctx.prisma.healthierSgRegistration.count({
            where: {
              registrationDate: {
                gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
              },
            },
          }),
          ctx.prisma.healthierSgRegistration.groupBy({
            by: ['status'],
            where: dateFilter,
            _count: { status: true },
          }),
          ctx.prisma.healthierSgRegistration.groupBy({
            by: ['status'],
            where: dateFilter,
            _count: { status: true },
          }),
        ])

        return {
          totalEnrolled,
          activeEnrollments,
          registrationsThisMonth,
          statusDistribution: byStatus.map(status => ({
            status: status.status,
            count: status._count.status,
          })),
          participatingClinics: await ctx.prisma.clinic.count({
            where: { isHealthierSgPartner: true, isActive: true },
          }),
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch Healthier SG statistics',
          cause: error,
        })
      }
    }),

  /**
   * Get Healthier SG participants by clinic (admin/staff only)
   */
  getParticipantsByClinic: protectedProcedure
    .input(
      z.object({
        clinicId: z.string().uuid(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(20),
        status: z.enum(['ACTIVE', 'INACTIVE', 'COMPLETED', 'WITHDRAWN']).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { clinicId, page, limit, status } = input
      const skip = (page - 1) * limit

      try {
        // Check access - staff can only see their clinic
        if (ctx.session.user.role === 'STAFF') {
          const userClinic = await ctx.prisma.clinic.findFirst({
            where: { userId: ctx.session.user.id, id: clinicId },
            select: { id: true },
          })

          if (!userClinic) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'You can only view participants for your clinic',
            })
          }
        }

        // Get participants through user profiles with preferred clinic
        const where: Prisma.UserProfileWhereInput = {
          healthierSgEnrolled: true,
          preferredClinicId: clinicId,
          ...(status ? { /* This would need a join with HealthierSgRegistration */ } : {}),
        }

        const [participants, total] = await Promise.all([
          ctx.prisma.userProfile.findMany({
            where,
            select: {
              userId: true,
              firstName: true,
              lastName: true,
              dateOfBirth: true,
              gender: true,
              phone: true,
              healthierSgRegistrationDate: true,
              user: {
                select: {
                  email: true,
                },
              },
              // This would need a join - simplified for now
            },
            skip,
            take: limit,
            orderBy: { healthierSgRegistrationDate: 'desc' },
          }),
          ctx.prisma.userProfile.count({ where }),
        ])

        return {
          data: participants,
          pagination: calculatePagination(page, limit, total),
        }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch participants by clinic',
          cause: error,
        })
      }
    }),

  /**
   * Update Healthier SG enrollment status (admin/staff only)
   */
  updateEnrollmentStatus: protectedProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        status: z.enum(['ACTIVE', 'INACTIVE', 'COMPLETED', 'WITHDRAWN']),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, status, notes } = input

      try {
        // Check access - staff can only update their clinic's participants
        if (ctx.session.user.role === 'STAFF') {
          const userClinic = await ctx.prisma.clinic.findFirst({
            where: {
              userId: ctx.session.user.id,
              appointments: {
                some: {
                  patientId: userId,
                },
              },
            },
            select: { id: true },
          })

          if (!userClinic) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'You can only update participants for your clinic',
            })
          }
        }

        const updatedEnrollment = await ctx.prisma.healthierSgRegistration.update({
          where: { userId },
          data: {
            status,
            ...(notes ? { progressNotes: notes } : {}),
          },
          select: healthierSgRegistrationSelect,
        })

        return updatedEnrollment
      } catch (error) {
        if (error instanceof TRPCError) throw error
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Healthier SG enrollment not found',
          })
        }

        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to update enrollment status',
          cause: error,
        })
      }
    }),

  /**
   * Get Healthier SG program reports (admin only)
   */
  getProgramReports: adminProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        reportType: z.enum(['enrollment', 'participation', 'outcomes']).default('enrollment'),
      })
    )
    .query(async ({ ctx, input }) => {
      const { startDate, endDate, reportType } = input

      try {
        const dateFilter = {}
        if (startDate && endDate) {
          dateFilter['registrationDate'] = { gte: startDate, lte: endDate }
        }

        switch (reportType) {
          case 'enrollment':
            const enrollmentReport = await ctx.prisma.healthierSgRegistration.groupBy({
              by: ['status'],
              where: dateFilter,
              _count: { status: true },
              _avg: { /* Would need to calculate average progress */ },
            })

            return {
              reportType: 'enrollment',
              data: enrollmentReport.map(item => ({
                status: item.status,
                count: item._count.status,
              })),
            }

          case 'participation':
            // This would require more complex queries to track appointment attendance
            return {
              reportType: 'participation',
              message: 'Participation tracking requires additional implementation',
            }

          case 'outcomes':
            // This would require health outcome tracking
            return {
              reportType: 'outcomes',
              message: 'Health outcomes tracking requires additional implementation',
            }

          default:
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Invalid report type',
            })
        }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to generate program report',
          cause: error,
        })
      }
    }),

  /**
   * Submit complete Healthier SG registration with all 7 steps data
   */
  submitRegistration: protectedProcedure
    .input(
      z.object({
        eligibilityAssessmentId: z.string().uuid(),
        registrationData: z.object({
          personalInfo: z.object({
            firstName: z.string().min(1),
            lastName: z.string().min(1),
            phone: z.string().min(8),
            address: z.object({
              street: z.string().min(1),
              unit: z.string().optional(),
              postalCode: z.string().min(6),
              country: z.string().default('Singapore'),
            }),
            emergencyContact: z.object({
              name: z.string().min(1),
              relationship: z.string().min(1),
              phone: z.string().min(8),
            }),
            preferredLanguage: z.enum(['en', 'zh', 'ms', 'ta']),
            communicationPreferences: z.object({
              email: z.boolean(),
              sms: z.boolean(),
              phone: z.boolean(),
            }),
          }),
          identityVerification: z.object({
            verified: z.boolean(),
            verificationMethod: z.enum(['singpass', 'manual']),
            nric: z.string().min(9).max(9),
            verificationData: z.object({
              name: z.string(),
              dateOfBirth: z.string(),
              address: z.string(),
              nationality: z.string(),
            }).optional(),
          }),
          digitalConsent: z.object({
            consentsSigned: z.boolean(),
            consentVersion: z.string(),
            consentData: z.object({
              programParticipation: z.boolean(),
              dataCollection: z.boolean(),
              healthcareData: z.boolean(),
              researchParticipation: z.boolean().optional(),
              marketingCommunication: z.boolean().optional(),
              thirdPartySharing: z.boolean().optional(),
            }),
            consentMetadata: z.object({
              ipAddress: z.string(),
              userAgent: z.string(),
              timestamp: z.date(),
              digitalSignature: z.string().optional(),
            }),
            ageVerification: z.object({
              isOver18: z.boolean(),
              guardianConsentRequired: z.boolean(),
              guardianDetails: z.object({
                name: z.string(),
                relationship: z.string(),
                nric: z.string(),
                signature: z.string(),
              }).optional(),
            }),
          }),
          documents: z.object({
            uploadedDocuments: z.array(z.object({
              id: z.string(),
              fileName: z.string(),
              fileType: z.string(),
              fileSize: z.number(),
              uploadDate: z.date(),
              verificationStatus: z.enum(['pending', 'approved', 'rejected', 'requires_review']),
              ocrData: z.object({
                extractedText: z.string(),
                confidence: z.number(),
                fields: z.record(z.string()),
              }).optional(),
            })),
          }),
          healthGoals: z.object({
            selectedGoals: z.array(z.object({
              id: z.string(),
              category: z.enum(['weight_management', 'blood_pressure', 'diabetes', 'cholesterol', 'mental_health', 'exercise', 'nutrition', 'smoking', 'sleep']),
              title: z.string(),
              description: z.string(),
              measurable: z.boolean(),
              target: z.string().optional(),
              timeline: z.string().optional(),
            })),
            customGoals: z.array(z.object({
              id: z.string(),
              title: z.string(),
              description: z.string(),
              target: z.string(),
              timeline: z.string(),
              priority: z.enum(['low', 'medium', 'high']),
            })).optional(),
            priorityLevel: z.enum(['low', 'medium', 'high']),
            timeFrame: z.enum(['3months', '6months', '1year', 'longterm']),
            lifestyleFactors: z.array(z.object({
              type: z.enum(['smoking', 'alcohol', 'exercise', 'diet', 'sleep', 'stress']),
              current: z.string(),
              goal: z.string(),
              barriers: z.array(z.string()),
              support: z.array(z.string()),
            })),
          }),
        }),
        clinicId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { eligibilityAssessmentId, registrationData, clinicId } = input

      try {
        // Verify eligibility assessment exists and user is eligible
        const assessment = await ctx.prisma.eligibilityAssessment.findFirst({
          where: {
            id: eligibilityAssessmentId,
            userId: ctx.session.user.id,
          },
        })

        if (!assessment) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Eligibility assessment not found',
          })
        }

        const evaluationResult = assessment.evaluationResult as any
        if (!evaluationResult?.isEligible) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'User is not eligible for Healthier SG program',
          })
        }

        // Check if registration already exists
        const existingRegistration = await ctx.prisma.healthierSgRegistration.findFirst({
          where: { userId: ctx.session.user.id },
        })

        if (existingRegistration) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'User already has a Healthier SG registration',
          })
        }

        // Verify clinic is a Healthier SG partner
        const clinic = await ctx.prisma.clinic.findFirst({
          where: { id: clinicId, isHealthierSgPartner: true, isActive: true },
        })

        if (!clinic) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Selected clinic is not a Healthier SG partner',
          })
        }

        // Validate required consents
        if (!registrationData.digitalConsent.consentData.programParticipation || 
            !registrationData.digitalConsent.consentData.dataCollection) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Required consents must be provided',
          })
        }

        // Validate age requirement
        if (!registrationData.digitalConsent.ageVerification.isOver18) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Must be 18 years or older to register',
          })
        }

        // Create registration record
        const registration = await ctx.prisma.$transaction(async (prisma) => {
          // Create Healthier SG registration
          const newRegistration = await prisma.healthierSgRegistration.create({
            data: {
              userId: ctx.session.user.id,
              registrationDate: new Date(),
              status: 'SUBMITTED',
              eligibilityCriteria: {
                age: evaluationResult.score || 0,
                hasChronicConditions: registrationData.healthGoals.selectedGoals.some(
                  goal => goal.category === 'diabetes' || goal.category === 'blood_pressure' || goal.category === 'cholesterol'
                ),
                assessmentId: eligibilityAssessmentId,
              },
              medicalCheckupRequired: true,
              chronicConditions: registrationData.healthGoals.selectedGoals
                .filter(goal => ['diabetes', 'blood_pressure', 'cholesterol'].includes(goal.category))
                .map(goal => goal.title)
                .join(', ') || 'None reported',
              lifestyleFactors: registrationData.healthGoals.lifestyleFactors.map(factor => factor.type),
              targetGoals: registrationData.healthGoals.selectedGoals.map(goal => goal.title),
              progressNotes: JSON.stringify({
                registrationData,
                submittedAt: new Date(),
                clinicId,
                stepCompletion: {
                  personalInfo: true,
                  identityVerification: registrationData.identityVerification.verified,
                  digitalConsent: registrationData.digitalConsent.consentsSigned,
                  documents: registrationData.documents.uploadedDocuments.length > 0,
                  healthGoals: registrationData.healthGoals.selectedGoals.length > 0,
                },
              }),
            },
            select: healthierSgRegistrationSelect,
          })

          // Update user profile
          await prisma.userProfile.upsert({
            where: { userId: ctx.session.user.id },
            create: {
              userId: ctx.session.user.id,
              firstName: registrationData.personalInfo.firstName,
              lastName: registrationData.personalInfo.lastName,
              phone: registrationData.personalInfo.phone,
              healthierSgEnrolled: false, // Will be true after approval
              healthierSgRegistrationDate: new Date(),
              preferredClinicId: clinicId,
            },
            update: {
              firstName: registrationData.personalInfo.firstName,
              lastName: registrationData.personalInfo.lastName,
              phone: registrationData.personalInfo.phone,
              healthierSgEnrolled: false,
              healthierSgRegistrationDate: new Date(),
              preferredClinicId: clinicId,
            },
          })

          // Create audit log entry (you might want a separate audit table)
          console.log('Registration submitted audit log:', {
            userId: ctx.session.user.id,
            registrationId: newRegistration.id,
            action: 'REGISTRATION_SUBMITTED',
            timestamp: new Date(),
            ipAddress: ctx.headers['x-forwarded-for'] || ctx.headers['x-real-ip'] || 'unknown',
            userAgent: ctx.headers['user-agent'] || 'unknown',
          })

          return newRegistration
        })

        return {
          success: true,
          registration,
          message: 'Registration submitted successfully',
          nextSteps: [
            'Your registration is under review',
            'You will receive confirmation from your clinic within 3-5 business days',
            'Schedule your initial health screening appointment after approval',
          ],
          submissionId: registration.id,
          estimatedProcessingTime: '3-5 business days',
        }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to submit registration',
          cause: error,
        })
      }
    }),

  /**
   * Update registration status with audit logging
   */
  updateRegistrationStatus: protectedProcedure
    .input(
      z.object({
        registrationId: z.string().uuid(),
        status: z.enum(['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'NEEDS_REVISION', 'WITHDRAWN']),
        notes: z.string().optional(),
        revisionRequired: z.array(z.string()).optional(),
        rejectionReason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { registrationId, status, notes, revisionRequired, rejectionReason } = input

      try {
        // Verify registration exists and user has access
        const registration = await ctx.prisma.healthierSgRegistration.findFirst({
          where: {
            id: registrationId,
            userId: ctx.session.user.id,
          },
        })

        if (!registration) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Registration not found or access denied',
          })
        }

        // Validate status transitions
        const validTransitions: Record<string, string[]> = {
          'DRAFT': ['SUBMITTED', 'WITHDRAWN'],
          'SUBMITTED': ['UNDER_REVIEW', 'REJECTED', 'WITHDRAWN'],
          'UNDER_REVIEW': ['APPROVED', 'REJECTED', 'NEEDS_REVISION'],
          'NEEDS_REVISION': ['SUBMITTED', 'WITHDRAWN'],
          'APPROVED': [],
          'REJECTED': [],
          'WITHDRAWN': [],
        }

        if (!validTransitions[registration.status].includes(status)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Invalid status transition from ${registration.status} to ${status}`,
          })
        }

        // Update registration
        const updatedRegistration = await ctx.prisma.healthierSgRegistration.update({
          where: { id: registrationId },
          data: {
            status,
            progressNotes: JSON.stringify({
              previousStatus: registration.status,
              newStatus: status,
              updatedAt: new Date(),
              updatedBy: ctx.session.user.id,
              notes: notes || '',
              revisionRequired: revisionRequired || [],
              rejectionReason: rejectionReason || '',
            }),
            updatedAt: new Date(),
          },
          select: healthierSgRegistrationSelect,
        })

        // If approved, update user profile
        if (status === 'APPROVED') {
          await ctx.prisma.userProfile.update({
            where: { userId: ctx.session.user.id },
            data: {
              healthierSgEnrolled: true,
              healthierSgRegistrationDate: new Date(),
            },
          })
        }

        // Audit logging
        console.log('Registration status update audit log:', {
          registrationId,
          userId: ctx.session.user.id,
          previousStatus: registration.status,
          newStatus: status,
          timestamp: new Date(),
          ipAddress: ctx.headers['x-forwarded-for'] || ctx.headers['x-real-ip'] || 'unknown',
        })

        return {
          success: true,
          registration: updatedRegistration,
          message: `Registration status updated to ${status}`,
          statusChange: {
            from: registration.status,
            to: status,
            timestamp: new Date(),
          },
        }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to update registration status',
          cause: error,
        })
      }
    }),

  /**
   * Get current registration progress for resume functionality
   */
  getRegistrationProgress: protectedProcedure
    .input(
      z.object({
        eligibilityAssessmentId: z.string().uuid().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { eligibilityAssessmentId } = input

      try {
        // Try to find existing registration
        let registration = await ctx.prisma.healthierSgRegistration.findFirst({
          where: { userId: ctx.session.user.id },
          select: {
            ...healthierSgRegistrationSelect,
            progressNotes: true,
          },
        })

        // If no registration exists, check for draft data
        if (!registration && eligibilityAssessmentId) {
          // Check for draft registration data (could be stored in a separate table)
          const draftData = await ctx.prisma.eligibilityAssessment.findFirst({
            where: {
              id: eligibilityAssessmentId,
              userId: ctx.session.user.id,
            },
            select: {
              id: true,
              questionnaireResponses: true,
              evaluationResult: true,
              createdAt: true,
            },
          })

          if (draftData) {
            return {
              hasRegistration: false,
              isDraft: true,
              assessmentId: draftData.id,
              progress: {
                currentStep: 'personal-info',
                completedSteps: [],
                totalSteps: 7,
                completionPercentage: 0,
                timeElapsed: 0,
                estimatedTimeRemaining: 30, // minutes
                lastUpdated: draftData.createdAt,
              },
              draftData: draftData.questionnaireResponses,
              eligibilityResult: draftData.evaluationResult,
            }
          }
        }

        if (registration) {
          // Parse progress notes to extract step completion data
          let stepCompletion = {
            personalInfo: false,
            identityVerification: false,
            digitalConsent: false,
            documents: false,
            healthGoals: false,
            reviewSubmit: false,
          }

          try {
            const notesData = JSON.parse(registration.progressNotes || '{}')
            if (notesData.stepCompletion) {
              stepCompletion = { ...stepCompletion, ...notesData.stepCompletion }
            }
          } catch (e) {
            // Ignore JSON parse errors
          }

          const completedSteps = Object.entries(stepCompletion)
            .filter(([_, completed]) => completed)
            .map(([step, _]) => step)

          const progress = {
            currentStep: completedSteps.length < 7 ? 
              ['personal-info', 'identity-verification', 'digital-consent', 'documents', 'health-goals', 'review-submit'][completedSteps.length] : 'completed',
            completedSteps,
            totalSteps: 7,
            completionPercentage: Math.round((completedSteps.length / 7) * 100),
            timeElapsed: Math.round((new Date().getTime() - registration.registrationDate.getTime()) / (1000 * 60)), // minutes
            estimatedTimeRemaining: Math.max(0, 30 - Math.round((new Date().getTime() - registration.registrationDate.getTime()) / (1000 * 60))),
            lastUpdated: registration.updatedAt,
          }

          return {
            hasRegistration: true,
            isDraft: false,
            registration,
            progress,
            stepCompletion,
            canResume: registration.status === 'DRAFT' || registration.status === 'NEEDS_REVISION',
            nextSteps: getNextStepsBasedOnStatus(registration.status),
          }
        }

        return {
          hasRegistration: false,
          isDraft: false,
          progress: {
            currentStep: 'personal-info',
            completedSteps: [],
            totalSteps: 7,
            completionPercentage: 0,
            timeElapsed: 0,
            estimatedTimeRemaining: 30,
            lastUpdated: new Date(),
          },
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch registration progress',
          cause: error,
        })
      }
    }),

  /**
   * Handle secure document uploads with validation
   */
  submitDocumentUpload: protectedProcedure
    .input(
      z.object({
        registrationId: z.string().uuid().optional(),
        documentType: z.enum(['nric_front', 'nric_back', 'insurance_card', 'medical_records', 'medication_list', 'proof_of_address', 'other']),
        fileName: z.string(),
        fileSize: z.number().max(10 * 1024 * 1024), // 10MB limit
        fileType: z.string(),
        fileData: z.string().base64(), // Base64 encoded file data
        metadata: z.object({
          uploadTimestamp: z.date(),
          deviceInfo: z.string(),
          ipAddress: z.string(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { registrationId, documentType, fileName, fileSize, fileType, fileData, metadata } = input

      try {
        // Validate file type
        const allowedTypes = [
          'application/pdf',
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp',
        ]

        if (!allowedTypes.includes(fileType)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'File type not supported. Please upload PDF, JPEG, or PNG files.',
          })
        }

        // Validate file size
        if (fileSize > 10 * 1024 * 1024) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'File size exceeds 10MB limit',
          })
        }

        // Security validation - check for malicious file signatures
        const fileSignature = fileData.substring(0, 50)
        if (fileSignature.includes('<script>') || fileSignature.includes('javascript:')) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'File contains invalid content',
          })
        }

        // Generate secure file path
        const timestamp = Date.now()
        const secureFileName = `${ctx.session.user.id}_${timestamp}_${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        const filePath = `registrations/${ctx.session.user.id}/documents/${secureFileName}`

        // In a real implementation, you would:
        // 1. Upload to secure cloud storage (S3, etc.)
        // 2. Scan for viruses
        // 3. Extract OCR data if image
        // 4. Generate thumbnail
        // For now, we'll simulate the upload

        // Create document record
        const documentUpload = {
          id: `doc_${timestamp}`,
          fileName,
          fileType,
          fileSize,
          uploadDate: new Date(),
          verificationStatus: 'pending' as const,
          filePath,
          documentType,
          metadata: {
            ...metadata,
            fileHash: `hash_${timestamp}`, // In real implementation, calculate actual hash
            uploadedAt: new Date(),
          },
        }

        // Simulate OCR processing for images
        let ocrData = null
        if (fileType.startsWith('image/')) {
          ocrData = {
            extractedText: '', // Would be populated by OCR service
            confidence: 0.85, // Simulated confidence
            fields: {
              documentType: documentType,
              uploadDate: metadata.uploadTimestamp.toISOString(),
            },
          }
        }

        // Update registration if provided
        if (registrationId) {
          const registration = await ctx.prisma.healthierSgRegistration.findFirst({
            where: {
              id: registrationId,
              userId: ctx.session.user.id,
            },
            select: { id: true, progressNotes: true },
          })

          if (registration) {
            await ctx.prisma.healthierSgRegistration.update({
              where: { id: registrationId },
              data: {
                progressNotes: JSON.stringify({
                  ...JSON.parse(registration.progressNotes || '{}'),
                  documents: [
                    ...(JSON.parse(registration.progressNotes || '{}').documents || []),
                    documentUpload,
                  ],
                  lastDocumentUpload: new Date(),
                }),
                updatedAt: new Date(),
              },
            })
          }
        }

        // Audit logging
        console.log('Document upload audit log:', {
          userId: ctx.session.user.id,
          registrationId,
          documentType,
          fileName,
          fileSize,
          timestamp: new Date(),
          ipAddress: metadata.ipAddress,
          filePath,
        })

        return {
          success: true,
          document: documentUpload,
          ocrData,
          message: 'Document uploaded successfully',
          processingTime: '2-5 minutes',
          nextSteps: [
            'Document verification in progress',
            'You will be notified once verification is complete',
            'Ensure document is clear and all text is readable',
          ],
        }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to upload document',
          cause: error,
        })
      }
    }),

  /**
   * Get registration timeline and status history
   */
  getRegistrationHistory: protectedProcedure
    .input(
      z.object({
        registrationId: z.string().uuid().optional(),
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const { registrationId, limit, offset } = input

      try {
        // If no registrationId provided, get user's latest registration
        let registration = null
        if (registrationId) {
          registration = await ctx.prisma.healthierSgRegistration.findFirst({
            where: {
              id: registrationId,
              userId: ctx.session.user.id,
            },
            select: {
              ...healthierSgRegistrationSelect,
              progressNotes: true,
            },
          })
        } else {
          registration = await ctx.prisma.healthierSgRegistration.findFirst({
            where: { userId: ctx.session.user.id },
            select: {
              ...healthierSgRegistrationSelect,
              progressNotes: true,
            },
            orderBy: { createdAt: 'desc' },
          })
        }

        if (!registration) {
          return {
            hasRegistration: false,
            history: [],
            timeline: [],
          }
        }

        // Parse timeline data from progress notes
        let timeline = []
        try {
          const notesData = JSON.parse(registration.progressNotes || '{}')
          timeline = notesData.timeline || []
        } catch (e) {
          // Create basic timeline from registration data
          timeline = [
            {
              id: 'registration_created',
              title: 'Registration Started',
              description: 'Registration process initiated',
              timestamp: registration.registrationDate,
              status: 'completed',
              step: 'start',
            },
          ]
        }

        // Add status change milestones
        const statusMilestones = []
        if (registration.status !== 'DRAFT') {
          statusMilestones.push({
            id: 'registration_submitted',
            title: 'Registration Submitted',
            description: 'Registration form submitted for review',
            timestamp: registration.createdAt,
            status: 'completed',
            step: 'submission',
          })
        }

        if (['APPROVED', 'REJECTED', 'NEEDS_REVISION'].includes(registration.status)) {
          statusMilestones.push({
            id: 'registration_reviewed',
            title: `Registration ${registration.status}`,
            description: `Registration has been ${registration.status.toLowerCase()}`,
            timestamp: registration.updatedAt,
            status: registration.status === 'APPROVED' ? 'completed' : 'failed',
            step: 'review',
          })
        }

        // Combine and sort timeline
        const fullTimeline = [...timeline, ...statusMilestones]
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

        // Build status history
        const statusHistory = [
          {
            status: registration.status,
            timestamp: registration.updatedAt,
            description: getStatusDescription(registration.status),
          },
        ]

        // Add intermediate status changes if available
        try {
          const notesData = JSON.parse(registration.progressNotes || '{}')
          if (notesData.statusHistory) {
            statusHistory.push(...notesData.statusHistory)
          }
        } catch (e) {
          // Ignore parsing errors
        }

        return {
          hasRegistration: true,
          registration,
          timeline: fullTimeline,
          statusHistory,
          currentStatus: {
            status: registration.status,
            description: getStatusDescription(registration.status),
            lastUpdated: registration.updatedAt,
            canEdit: ['DRAFT', 'NEEDS_REVISION'].includes(registration.status),
          },
          summary: {
            registrationDate: registration.registrationDate,
            lastUpdated: registration.updatedAt,
            totalTimelineEvents: fullTimeline.length,
            daysInProcess: Math.ceil(
              (new Date().getTime() - registration.registrationDate.getTime()) / (1000 * 60 * 60 * 24)
            ),
          },
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch registration history',
          cause: error,
        })
      }
    }),

  /**
   * Auto-save functionality for partial registrations
   */
  saveRegistrationDraft: protectedProcedure
    .input(
      z.object({
        eligibilityAssessmentId: z.string().uuid(),
        stepId: z.string(),
        stepData: z.record(z.any()),
        autoSave: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { eligibilityAssessmentId, stepId, stepData, autoSave } = input

      try {
        // Verify eligibility assessment exists and user has access
        const assessment = await ctx.prisma.eligibilityAssessment.findFirst({
          where: {
            id: eligibilityAssessmentId,
            userId: ctx.session.user.id,
          },
          select: { id: true },
        })

        if (!assessment) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Eligibility assessment not found',
          })
        }

        // Check for existing draft registration
        let draft = await ctx.prisma.healthierSgRegistration.findFirst({
          where: {
            userId: ctx.session.user.id,
            status: 'DRAFT',
          },
          select: { id: true, progressNotes: true },
        })

        // Create new draft if none exists
        if (!draft) {
          draft = await ctx.prisma.healthierSgRegistration.create({
            data: {
              userId: ctx.session.user.id,
              registrationDate: new Date(),
              status: 'DRAFT',
              eligibilityCriteria: { assessmentId: eligibilityAssessmentId },
              progressNotes: JSON.stringify({
                stepData: {},
                stepCompletion: {},
                lastUpdated: new Date(),
                lastStep: stepId,
                autoSaveEnabled: autoSave,
              }),
            },
            select: { id: true, progressNotes: true },
          })
        }

        // Update draft with new step data
        let currentData = {}
        let stepCompletion = {}
        let lastUpdated = new Date()

        try {
          const notesData = JSON.parse(draft.progressNotes || '{}')
          currentData = notesData.stepData || {}
          stepCompletion = notesData.stepCompletion || {}
          lastUpdated = notesData.lastUpdated || new Date()
        } catch (e) {
          // Initialize new data structure
        }

        // Update step data
        currentData[stepId] = stepData
        stepCompletion[stepId] = true

        // Calculate progress
        const totalSteps = 7
        const completedSteps = Object.keys(stepCompletion).length
        const progressPercentage = Math.round((completedSteps / totalSteps) * 100)

        // Update draft
        const updatedDraft = await ctx.prisma.healthierSgRegistration.update({
          where: { id: draft.id },
          data: {
            progressNotes: JSON.stringify({
              stepData: currentData,
              stepCompletion,
              lastUpdated,
              lastStep: stepId,
              autoSaveEnabled: autoSave,
              progressPercentage,
            }),
            updatedAt: new Date(),
          },
          select: { id: true, progressNotes: true },
        })

        // Audit logging for manual saves (not auto-saves)
        if (!autoSave) {
          console.log('Registration draft save audit log:', {
            userId: ctx.session.user.id,
            draftId: draft.id,
            stepId,
            stepDataKeys: Object.keys(stepData),
            timestamp: new Date(),
            ipAddress: ctx.headers['x-forwarded-for'] || ctx.headers['x-real-ip'] || 'unknown',
          })
        }

        return {
          success: true,
          draftId: draft.id,
          progress: {
            currentStep: stepId,
            completedSteps: Object.keys(stepCompletion),
            totalSteps,
            completionPercentage: progressPercentage,
            lastUpdated,
          },
          message: autoSave ? 'Auto-saved' : 'Draft saved successfully',
          canSubmit: progressPercentage >= 80, // Allow submission when 80% complete
        }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to save registration draft',
          cause: error,
        })
      }
    }),

  // ============================================================================
  // BENEFITS & INCENTIVES TRACKING SYSTEM (Sub-Phase 8.8)
  // ============================================================================

  /**
   * Calculate personalized benefits based on user profile and tier
   */
  calculateBenefits: protectedProcedure
    .input(
      z.object({
        userId: z.string().uuid().optional(),
        calculationDate: z.date().optional(),
        includeProjections: z.boolean().default(true),
        healthGoals: z.array(z.string()).optional(),
        medicalConditions: z.array(z.string()).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId, calculationDate, includeProjections, healthGoals = [], medicalConditions = [] } = input
      const targetUserId = userId || ctx.session.user.id

      try {
        // Get user profile and benefits data
        const [userProfile, userBenefits, enrollment] = await Promise.all([
          ctx.prisma.userProfile.findUnique({
            where: { userId: targetUserId },
          }),
          ctx.prisma.userBenefits.findUnique({
            where: { userId: targetUserId },
            include: {
              transactions: {
                where: {
                  createdAt: {
                    gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Current month
                  },
                },
                orderBy: { createdAt: 'desc' },
                take: 10,
              },
            },
          }),
          ctx.prisma.healthierSgRegistration.findUnique({
            where: { userId: targetUserId },
          }),
        ])

        if (!userProfile) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User profile not found',
          })
        }

        // Determine benefits tier based on profile
        const age = userProfile.dateOfBirth ? 
          Math.floor((new Date().getTime() - userProfile.dateOfBirth.getTime()) / (1000 * 60 * 60 * 24 * 365)) : 0
        
        let benefitsTier = 'BASIC' as const
        if (medicalConditions.length > 0 || enrollment?.chronicConditions !== 'None reported') {
          benefitsTier = 'PREMIUM'
        } else if (age >= 65 || healthGoals.length >= 3) {
          benefitsTier = 'ENHANCED'
        }

        // Calculate benefits structure
        const benefitsCalculation = {
          tier: benefitsTier,
          baseMonthlyBenefits: getTierBenefits(benefitsTier).baseBenefits,
          healthScreeningAllocation: getTierBenefits(benefitsTier).healthScreening,
          chronicCareAllocation: getTierBenefits(benefitsTier).chronicCare,
          preventiveCareAllocation: getTierBenefits(benefitsTier).preventiveCare,
          medicationSubsidy: getTierBenefits(benefitsTier).medicationSubsidy,
          monthlyCap: getTierBenefits(benefitsTier).monthlyCap,
          annualCap: getTierBenefits(benefitsTier).annualCap,
        }

        // Calculate current utilization
        const currentMonthTransactions = userBenefits?.transactions || []
        const currentMonthUsed = currentMonthTransactions
          .filter(t => t.amount < 0)
          .reduce((sum, t) => sum + Math.abs(t.amount), 0)

        const currentBalance = userBenefits?.currentBalance || 0
        const monthlyUsagePercent = (currentMonthUsed / benefitsCalculation.monthlyCap) * 100

        // Calculate available benefits
        const availableBenefits = {
          currentBalance,
          monthlyRemaining: Math.max(0, benefitsCalculation.monthlyCap - currentMonthUsed),
          annualRemaining: Math.max(0, benefitsCalculation.annualCap - (userBenefits?.totalUsed || 0)),
          screeningRemaining: benefitsCalculation.healthScreeningAllocation,
          chronicCareRemaining: benefitsCalculation.chronicCareAllocation,
        }

        // Project future benefits if requested
        let projections = null
        if (includeProjections) {
          projections = calculateBenefitProjections(benefitsCalculation, availableBenefits, {
            age,
            medicalConditions,
            healthGoals,
            complianceScore: calculateComplianceScore(userBenefits),
          })
        }

        // Generate personalized recommendations
        const recommendations = generateBenefitRecommendations(
          benefitsTier,
          availableBenefits,
          {
            age,
            medicalConditions,
            healthGoals,
            lastScreening: getLastScreeningDate(userBenefits),
            complianceStatus: userBenefits?.complianceVerified,
          }
        )

        return {
          success: true,
          benefits: {
            calculation: benefitsCalculation,
            utilization: {
              currentMonthUsed,
              monthlyUsagePercent,
              annualUsed: userBenefits?.totalUsed || 0,
              complianceScore: calculateComplianceScore(userBenefits),
            },
            available: availableBenefits,
            projections,
            recommendations,
            eligibility: {
              tier: benefitsTier,
              isHealthierSGMember: enrollment?.status === 'ACTIVE',
              mohVerified: userBenefits?.mohVerified || false,
              lastVerified: userBenefits?.lastVerification,
            },
          },
        }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to calculate benefits',
          cause: error,
        })
      }
    }),

  /**
   * Track incentive earning based on health milestones
   */
  trackIncentiveEarning: protectedProcedure
    .input(
      z.object({
        milestoneType: z.enum([
          'HEALTH_SCREENING_COMPLETED',
          'GOAL_ACHIEVED',
          'MILESTONE_REACHED',
          'PARTICIPATION_STREAK',
          'EDUCATION_COMPLETED',
          'LIFESTYLE_IMPROVEMENT',
          'MEDICATION_ADHERENCE',
          'APPOINTMENT_ATTENDED',
          'COMMUNITY_ENGAGEMENT',
          'WEARABLE_MILESTONE',
        ]),
        milestoneValue: z.any(), // Flexible for different milestone types
        evidence: z.object({
          completedAt: z.date(),
          serviceId: z.string().optional(),
          goalId: z.string().optional(),
          activityId: z.string().optional(),
          verificationData: z.any().optional(),
        }).optional(),
        autoVerify: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { milestoneType, milestoneValue, evidence, autoVerify } = input

      try {
        // Get user's benefits record
        const userBenefits = await ctx.prisma.userBenefits.upsert({
          where: { userId: ctx.session.user.id },
          create: {
            userId: ctx.session.user.id,
            benefitsTier: 'BASIC',
          },
          update: {},
        })

        // Check if milestone already rewarded
        const existingIncentive = await ctx.prisma.incentiveEarned.findFirst({
          where: {
            userBenefitsId: userBenefits.id,
            milestoneType: milestoneType,
            milestoneValue: JSON.stringify(milestoneValue),
            earnedDate: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
        })

        if (existingIncentive) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Milestone already rewarded within the last 30 days',
          })
        }

        // Calculate incentive reward based on milestone type
        const incentiveReward = calculateIncentiveReward(milestoneType, milestoneValue, {
          userTier: userBenefits.benefitsTier,
          complianceScore: calculateComplianceScore(userBenefits),
          streak: await getParticipationStreak(ctx.session.user.id, ctx.prisma),
        })

        // Create incentive record
        const incentive = await ctx.prisma.incentiveEarned.create({
          data: {
            userBenefitsId: userBenefits.id,
            incentiveType: milestoneType as any,
            incentiveName: getIncentiveDisplayName(milestoneType),
            description: getIncentiveDescription(milestoneType, milestoneValue),
            milestoneType: milestoneType,
            milestoneValue: JSON.stringify(milestoneValue),
            criteriaMet: true,
            rewardType: incentiveReward.type,
            rewardValue: incentiveReward.value,
            rewardPoints: incentiveReward.points,
            rewardDescription: incentiveReward.description,
            earnedDate: evidence?.completedAt || new Date(),
            milestoneDate: evidence?.completedAt,
            verificationRequired: !autoVerify,
            verifiedAt: autoVerify ? new Date() : null,
            verifiedBy: autoVerify ? ctx.session.user.id : null,
            addedToBalance: autoVerify,
            balanceAdded: autoVerify ? incentiveReward.value : 0,
            expiresAt: getIncentiveExpiryDate(milestoneType),
            goalId: evidence?.goalId,
            activityId: evidence?.activityId,
          },
        })

        // If auto-verified, update user benefits balance
        let updatedBenefits = null
        if (autoVerify && incentiveReward.value > 0) {
          updatedBenefits = await ctx.prisma.userBenefits.update({
            where: { id: userBenefits.id },
            data: {
              currentBalance: { increment: incentiveReward.value },
              totalEarned: { increment: incentiveReward.value },
              updatedAt: new Date(),
            },
          })

          // Create transaction record
          await ctx.prisma.benefitTransaction.create({
            data: {
              userBenefitsId: userBenefits.id,
              transactionType: 'CREDIT_EARNED',
              amount: incentiveReward.value,
              description: `Incentive: ${getIncentiveDisplayName(milestoneType)}`,
              referenceNumber: `INC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              preTaxAmount: incentiveReward.value,
              subsidyAmount: 0,
              finalAmount: incentiveReward.value,
              status: 'COMPLETED',
              processedAt: new Date(),
              verifiedAt: new Date(),
              mohReportingRequired: true,
              createdBy: ctx.session.user.id,
              approvedBy: ctx.session.user.id,
              approvedAt: new Date(),
            },
          })
        }

        // Trigger notification
        await triggerIncentiveNotification(ctx.session.user.id, milestoneType, incentiveReward.value, ctx.prisma)

        return {
          success: true,
          incentive,
          reward: incentiveReward,
          balanceUpdated: updatedBenefits?.currentBalance || userBenefits.currentBalance,
          message: autoVerify ? 
            `Congratulations! You've earned $${incentiveReward.value} in incentives.` :
            'Milestone verified. Incentive pending approval.',
        }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to track incentive earning',
          cause: error,
        })
      }
    }),

  /**
   * Process health screening payment with insurance integration
   */
  processScreeningPayment: protectedProcedure
    .input(
      z.object({
        screeningType: z.enum([
          'ANNUAL_CHECKUP',
          'DIABETES_SCREENING',
          'CHOLESTEROL_SCREENING',
          'BLOOD_PRESSURE_CHECK',
          'CANCER_SCREENING',
          'HEART_HEALTH',
          'KIDNEY_FUNCTION',
          'LIVER_FUNCTION',
          'THYROID_FUNCTION',
          'EYE_EXAM',
          'DENTAL_CHECKUP',
          'VACCINATION',
          'CHRONIC_DISEASE_MONITORING',
          'LIFESTYLE_ASSESSMENT',
          'NUTRITIONAL_ASSESSMENT',
          'MENTAL_HEALTH_SCREENING',
        ]),
        clinicId: z.string().uuid(),
        scheduledDate: z.date(),
        estimatedCost: z.number().positive(),
        paymentPreferences: z.object({
          useMedisave: z.boolean().default(true),
          useCHAS: z.boolean().default(false),
          useBenefits: z.boolean().default(true),
          additionalCoverage: z.string().optional(),
        }).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { screeningType, clinicId, scheduledDate, estimatedCost, paymentPreferences = {} } = input

      try {
        // Get user benefits and insurance info
        const [userBenefits, userProfile] = await Promise.all([
          ctx.prisma.userBenefits.upsert({
            where: { userId: ctx.session.user.id },
            create: { userId: ctx.session.user.id },
            update: {},
          }),
          ctx.prisma.userProfile.findUnique({
            where: { userId: ctx.session.user.id },
          }),
        ])

        // Verify clinic participates in Healthier SG
        const clinic = await ctx.prisma.clinic.findFirst({
          where: { 
            id: clinicId, 
            isHealthierSgPartner: true,
            isActive: true,
          },
        })

        if (!clinic) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Selected clinic is not a Healthier SG partner',
          })
        }

        // Calculate payment breakdown
        const paymentBreakdown = calculateScreeningPayment(
          screeningType,
          estimatedCost,
          {
            benefitsBalance: userBenefits.currentBalance,
            tier: userBenefits.benefitsTier,
            chasTier: userBenefits.chasTier,
            medisaveBalance: userBenefits.medisaveBalance || 0,
            paymentPreferences,
          }
        )

        // Create screening record
        const screening = await ctx.prisma.healthScreening.create({
          data: {
            userBenefitsId: userBenefits.id,
            screeningType: screeningType as any,
            screeningName: getScreeningDisplayName(screeningType),
            description: getScreeningDescription(screeningType),
            scheduledDate,
            dueDate: new Date(scheduledDate.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days after scheduled
            clinicId,
            totalCost: estimatedCost,
            subsidizedAmount: paymentBreakdown.totalSubsidy,
            patientPays: paymentBreakdown.patientPay,
            benefitsUsed: paymentBreakdown.benefitsUsed,
            medisaveUsed: paymentBreakdown.medisaveUsed || 0,
            chasUsed: paymentBreakdown.chasUsed || 0,
            cashPaid: paymentBreakdown.cashPaid,
            status: 'SCHEDULED',
            eligibleForBenefits: true,
            complianceRequired: true,
          },
        })

        // Create payment transaction
        const transaction = await ctx.prisma.benefitTransaction.create({
          data: {
            userBenefitsId: userBenefits.id,
            healthScreeningId: screening.id,
            transactionType: 'SUBSIDY_APPLIED',
            amount: -paymentBreakdown.benefitsUsed,
            description: `Health screening: ${getScreeningDisplayName(screeningType)}`,
            referenceNumber: `SCR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            serviceId: clinicId,
            preTaxAmount: estimatedCost,
            subsidyAmount: paymentBreakdown.totalSubsidy,
            finalAmount: paymentBreakdown.patientPay,
            medisaveUsed: paymentBreakdown.medisaveUsed || 0,
            chasUsed: paymentBreakdown.chasUsed || 0,
            cashUsed: paymentBreakdown.cashPaid,
            status: 'PENDING',
            mohReportingRequired: true,
            approvalRequired: paymentBreakdown.benefitsUsed > 100, // Require approval for >$100
          },
        })

        // If using benefits, update balance
        if (paymentBreakdown.benefitsUsed > 0) {
          await ctx.prisma.userBenefits.update({
            where: { id: userBenefits.id },
            data: {
              currentBalance: { decrement: paymentBreakdown.benefitsUsed },
              totalUsed: { increment: paymentBreakdown.benefitsUsed },
              updatedAt: new Date(),
            },
          })
        }

        // Send payment confirmation notification
        await triggerPaymentNotification(
          ctx.session.user.id,
          screeningType,
          paymentBreakdown,
          ctx.prisma
        )

        return {
          success: true,
          screening,
          payment: {
            breakdown: paymentBreakdown,
            transactionId: transaction.id,
            referenceNumber: transaction.referenceNumber,
            status: transaction.status,
          },
          nextSteps: [
            'Payment will be processed automatically',
            'You will receive confirmation from the clinic',
            'Bring your IC and CHAS card (if applicable) to the appointment',
          ],
        }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to process screening payment',
          cause: error,
        })
      }
    }),

  /**
   * Get comprehensive benefits summary dashboard
   */
  getBenefitsSummary: protectedProcedure.query(async ({ ctx }) => {
    try {
      const userId = ctx.session.user.id

      // Get user benefits and related data
      const [userBenefits, recentScreenings, recentTransactions, activeIncentives, claims] = await Promise.all([
        ctx.prisma.userBenefits.findUnique({
          where: { userId },
          include: {
            transactions: {
              orderBy: { createdAt: 'desc' },
              take: 10,
            },
          },
        }),
        ctx.prisma.healthScreening.findMany({
          where: { 
            userBenefitsId: { equals: userId },
            status: { in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'] },
          },
          orderBy: { scheduledDate: 'asc' },
          take: 5,
        }),
        ctx.prisma.benefitTransaction.findMany({
          where: { 
            userBenefitsId: { equals: userId },
            createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        }),
        ctx.prisma.incentiveEarned.findMany({
          where: { 
            userBenefitsId: { equals: userId },
            expiresAt: { gt: new Date() },
          },
          orderBy: { earnedDate: 'desc' },
          take: 10,
        }),
        ctx.prisma.benefitClaim.findMany({
          where: { 
            userBenefitsId: { equals: userId },
            status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'PROCESSING'] },
          },
          orderBy: { submittedAt: 'desc' },
          take: 5,
        }),
      ])

      // Get enrollment status for context
      const enrollment = await ctx.prisma.healthierSgRegistration.findUnique({
        where: { userId },
        select: { status: true, registrationDate: true },
      })

      // Calculate summary metrics
      const summary = {
        account: {
          tier: userBenefits?.benefitsTier || 'BASIC',
          balance: userBenefits?.currentBalance || 0,
          totalEarned: userBenefits?.totalEarned || 0,
          totalUsed: userBenefits?.totalUsed || 0,
          mohVerified: userBenefits?.mohVerified || false,
          isHealthierSGMember: enrollment?.status === 'ACTIVE',
        },
        usage: {
          monthlyUsed: recentTransactions
            .filter(t => t.amount < 0)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0),
          monthlyLimit: getTierBenefits(userBenefits?.benefitsTier || 'BASIC').monthlyCap,
          complianceScore: calculateComplianceScore(userBenefits),
          lastActivity: userBenefits?.updatedAt,
        },
        upcoming: {
          screenings: recentScreenings.length,
          nextScreening: recentScreenings[0] || null,
          pendingClaims: claims.length,
          expiringIncentives: activeIncentives.filter(i => 
            i.expiresAt && i.expiresAt.getTime() < Date.now() + 7 * 24 * 60 * 60 * 1000
          ).length,
        },
        activity: {
          recentTransactions: recentTransactions.slice(0, 5),
          recentIncentives: activeIncentives.slice(0, 3),
          pendingClaims: claims,
        },
      }

      // Generate alerts and recommendations
      const alerts = generateBenefitsAlerts(summary)
      const recommendations = generateBenefitsRecommendations(summary)

      return {
        success: true,
        summary,
        alerts,
        recommendations,
        lastUpdated: new Date(),
      }
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch benefits summary',
        cause: error,
      })
    }
  }),

  /**
   * Submit benefit claim with document support
   */
  submitIncentiveClaim: protectedProcedure
    .input(
      z.object({
        claimType: z.enum([
          'SCREENING_COST',
          'TREATMENT_COST',
          'MEDICATION_COST',
          'CONSULTATION_FEE',
          'DIAGNOSTIC_TEST',
          'THERAPY_SESSION',
          'PREVENTIVE_CARE',
          'CHRONIC_CARE_MANAGEMENT',
          'EMERGENCY_CARE',
          'SPECIALIZED_CARE',
          'REHABILITATION',
          'HOME_CARE',
          'EQUIPMENT',
          'TRANSPORT',
          'OTHER',
        ]),
        claimTitle: z.string().min(1),
        description: z.string().optional(),
        claimAmount: z.number().positive(),
        serviceDate: z.date(),
        serviceDetails: z.string().optional(),
        receiptFile: z.object({
          fileName: z.string(),
          fileSize: z.number(),
          fileType: z.string(),
          fileData: z.string(), // base64
        }).optional(),
        additionalDocuments: z.array(z.object({
          fileName: z.string(),
          fileType: z.string(),
          fileData: z.string(),
          description: z.string(),
        })).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { 
        claimType, 
        claimTitle, 
        description, 
        claimAmount, 
        serviceDate, 
        serviceDetails,
        receiptFile,
        additionalDocuments = []
      } = input

      try {
        // Get user benefits
        const userBenefits = await ctx.prisma.userBenefits.findUnique({
          where: { userId: ctx.session.user.id },
        })

        if (!userBenefits) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Benefits account not found',
          })
        }

        // Generate claim reference
        const claimReference = `CLM_${new Date().getFullYear()}_${Date.now()}`

        // Validate claim amount against available balance
        if (claimAmount > userBenefits.currentBalance * 2) { // Allow up to 2x balance for claims
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Claim amount exceeds allowable limit',
          })
        }

        // Upload documents if provided (simplified - would integrate with file storage)
        const uploadedDocs = []
        if (receiptFile) {
          uploadedDocs.push({
            type: 'receipt',
            fileName: receiptFile.fileName,
            fileType: receiptFile.fileType,
            uploadedAt: new Date(),
          })
        }

        additionalDocuments.forEach(doc => {
          uploadedDocs.push({
            type: 'supporting',
            fileName: doc.fileName,
            fileType: doc.fileType,
            description: doc.description,
            uploadedAt: new Date(),
          })
        })

        // Create claim
        const claim = await ctx.prisma.benefitClaim.create({
          data: {
            userBenefitsId: userBenefits.id,
            claimType: claimType as any,
            claimTitle,
            description,
            claimAmount,
            serviceDate,
            serviceDetails,
            claimReference,
            receiptFileName: receiptFile?.fileName,
            additionalDocs: uploadedDocs,
            status: 'SUBMITTED',
            submittedAt: new Date(),
            submittedBy: 'user',
            mohSubmitted: true, // Auto-submit to government
            approvalWorkflow: [
              {
                step: 'submitted',
                status: 'completed',
                timestamp: new Date(),
                notes: 'Claim submitted by user',
              },
              {
                step: 'automated_validation',
                status: 'pending',
                timestamp: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
              },
              {
                step: 'government_review',
                status: 'pending',
                timestamp: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
              },
            ],
          },
        })

        // Create audit log
        console.log('Benefit claim submitted:', {
          claimId: claim.id,
          userId: ctx.session.user.id,
          claimType,
          amount: claimAmount,
          timestamp: new Date(),
        })

        // Send confirmation notification
        await triggerClaimNotification(ctx.session.user.id, claim, ctx.prisma)

        return {
          success: true,
          claim: {
            id: claim.id,
            reference: claim.claimReference,
            status: claim.status,
            submittedAt: claim.submittedAt,
            estimatedProcessingTime: '3-5 business days',
          },
          nextSteps: [
            'Your claim is being validated automatically',
            'You will receive updates via email and SMS',
            'Additional documentation may be requested if needed',
          ],
          estimatedApproval: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
        }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to submit benefit claim',
          cause: error,
        })
      }
    }),

  /**
   * Update benefits status with notifications
   */
  updateBenefitsStatus: protectedProcedure
    .input(
      z.object({
        status: z.enum(['ACTIVE', 'SUSPENDED', 'EXPIRED', 'UNDER_REVIEW', 'PENDING_VERIFICATION']),
        reason: z.string().optional(),
        actionRequired: z.boolean().default(false),
        actionDeadline: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { status, reason, actionRequired, actionDeadline } = input

      try {
        // Get current benefits status
        const userBenefits = await ctx.prisma.userBenefits.findUnique({
          where: { userId: ctx.session.user.id },
        })

        if (!userBenefits) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Benefits account not found',
          })
        }

        // Update benefits status
        const updatedBenefits = await ctx.prisma.userBenefits.update({
          where: { id: userBenefits.id },
          data: {
            eligibilityStatus: status as any,
            eligibilityUpdated: new Date(),
            updatedAt: new Date(),
          },
        })

        // Create compliance record if status changed
        if (userBenefits.eligibilityStatus !== status) {
          await ctx.prisma.benefitComplianceRecord.create({
            data: {
              userBenefitsId: userBenefits.id,
              complianceType: 'ELIGIBILITY_VERIFICATION',
              complianceStatus: status === 'ACTIVE' ? 'COMPLIANT' : 'PENDING_REVIEW',
              criteriaChecked: ['eligibility_status'],
              passedCriteria: status === 'ACTIVE' ? ['eligibility_status'] : [],
              failedCriteria: status !== 'ACTIVE' ? ['eligibility_status'] : [],
              riskLevel: status === 'SUSPENDED' ? 'HIGH' : 'LOW',
              checkDate: new Date(),
              resolutionActions: reason ? [reason] : [],
              checkedBy: 'system',
            },
          })
        }

        // Send notification if action required
        if (actionRequired) {
          await triggerStatusUpdateNotification(
            ctx.session.user.id,
            status,
            reason,
            actionDeadline,
            ctx.prisma
          )
        }

        return {
          success: true,
          status: {
            previous: userBenefits.eligibilityStatus,
            current: status,
            updatedAt: new Date(),
            actionRequired,
            actionDeadline,
          },
          message: `Benefits status updated to ${status}`,
        }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to update benefits status',
          cause: error,
        })
      }
    }),

  /**
   * Get health screening reminders and schedule management
   */
  getScreeningReminders: protectedProcedure
    .input(
      z.object({
        includeUpcoming: z.boolean().default(true),
        includeOverdue: z.boolean().default(true),
        includeRecommendations: z.boolean().default(true),
      })
    )
    .query(async ({ ctx, input }) => {
      const { includeUpcoming, includeOverdue, includeRecommendations } = input

      try {
        const userId = ctx.session.user.id

        // Get user benefits and profile
        const [userBenefits, userProfile, enrollment] = await Promise.all([
          ctx.prisma.userBenefits.findUnique({
            where: { userId },
            include: {
              screenings: {
                orderBy: { scheduledDate: 'asc' },
              },
            },
          }),
          ctx.prisma.userProfile.findUnique({
            where: { userId },
          }),
          ctx.prisma.healthierSgRegistration.findUnique({
            where: { userId },
          }),
        ])

        const age = userProfile?.dateOfBirth ? 
          Math.floor((new Date().getTime() - userProfile.dateOfBirth.getTime()) / (1000 * 60 * 60 * 24 * 365)) : 0

        // Get upcoming screenings
        const upcomingScreenings = includeUpcoming ? 
          (userBenefits?.screenings || []).filter(s => 
            s.status === 'SCHEDULED' && s.scheduledDate > new Date()
          ) : []

        // Get overdue screenings
        const overdueScreenings = includeOverdue ?
          (userBenefits?.screenings || []).filter(s => 
            s.status === 'COMPLETED' && 
            s.resultsAvailable &&
            new Date() > new Date(s.completedDate!.getTime() + getScreeningFrequency(s.screeningType) * 24 * 60 * 60 * 1000)
          ) : []

        // Generate recommendations based on age, conditions, and enrollment
        const recommendations = includeRecommendations ?
          generateScreeningRecommendations(age, enrollment?.chronicConditions, userBenefits?.benefitsTier) : []

        // Calculate next due dates
        const nextDue = recommendations.map(rec => ({
          ...rec,
          nextDueDate: calculateNextScreeningDate(rec.screeningType, age, overdueScreenings),
          urgencyLevel: getScreeningUrgency(rec.screeningType, age, overdueScreenings),
        }))

        return {
          success: true,
          reminders: {
            upcoming: upcomingScreenings.map(s => ({
              id: s.id,
              type: s.screeningType,
              name: getScreeningDisplayName(s.screeningType),
              scheduledDate: s.scheduledDate,
              clinicId: s.clinicId,
              status: s.status,
              daysUntil: Math.ceil((s.scheduledDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
            })),
            overdue: overdueScreenings.map(s => ({
              id: s.id,
              type: s.screeningType,
              name: getScreeningDisplayName(s.screeningType),
              completedDate: s.completedDate,
              daysOverdue: Math.ceil((new Date().getTime() - s.completedDate!.getTime()) / (1000 * 60 * 60 * 24)),
              status: s.status,
            })),
            recommended: nextDue,
          },
          summary: {
            totalUpcoming: upcomingScreenings.length,
            totalOverdue: overdueScreenings.length,
            totalRecommended: recommendations.length,
            nextAction: nextDue.length > 0 ? nextDue[0] : null,
          },
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch screening reminders',
          cause: error,
        })
      }
    }),

  /**
   * Get user notifications for NotificationCenter
   */
  getRegistrationNotifications: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
        unreadOnly: z.boolean().default(false),
        type: z.enum(['step_completed', 'document_approved', 'document_rejected', 'registration_submitted', 'registration_approved', 'registration_rejected', 'reminder', 'system_update']).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, offset, unreadOnly, type } = input

      try {
        // Get user's registration status for contextual notifications
        const registration = await ctx.prisma.healthierSgRegistration.findFirst({
          where: { userId: ctx.session.user.id },
          select: {
            id: true,
            status: true,
            registrationDate: true,
            updatedAt: true,
            progressNotes: true,
          },
        })

        // Build notification list based on registration status
        const notifications = []

        if (registration) {
          // Status-based notifications
          const statusNotifications = getNotificationsByStatus(registration.status, registration)
          notifications.push(...statusNotifications)

          // Progress-based notifications
          try {
            const notesData = JSON.parse(registration.progressNotes || '{}')
            if (notesData.stepCompletion) {
              const stepNotifications = getProgressNotifications(notesData.stepCompletion)
              notifications.push(...stepNotifications)
            }
          } catch (e) {
            // Ignore parsing errors
          }
        } else {
          // New user notifications
          notifications.push({
            id: 'welcome_healthiersg',
            type: 'system_update' as const,
            title: 'Welcome to Healthier SG Registration',
            message: 'Start your health journey by completing our eligibility assessment.',
            severity: 'info' as const,
            timestamp: new Date(),
            read: false,
            actionUrl: '/healthier-sg/eligibility',
            actionLabel: 'Start Assessment',
            metadata: {},
          })
        }

        // Filter by type if specified
        let filteredNotifications = notifications
        if (type) {
          filteredNotifications = notifications.filter(n => n.type === type)
        }

        // Filter by read status if specified
        if (unreadOnly) {
          filteredNotifications = filteredNotifications.filter(n => !n.read)
        }

        // Sort by timestamp (newest first) and apply pagination
        const sortedNotifications = filteredNotifications
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(offset, offset + limit)

        // Calculate unread count
        const unreadCount = notifications.filter(n => !n.read).length

        return {
          notifications: sortedNotifications,
          unreadCount,
          totalCount: filteredNotifications.length,
          pagination: {
            limit,
            offset,
            hasMore: offset + limit < filteredNotifications.length,
          },
          summary: {
            lastNotification: notifications[0]?.timestamp,
            registrationStatus: registration?.status || 'not_started',
            canResumeRegistration: !!registration && ['DRAFT', 'NEEDS_REVISION'].includes(registration.status),
          },
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch registration notifications',
          cause: error,
        })
      }
    }),
})

// ============================================================================
// BENEFITS & INCENTIVES HELPER FUNCTIONS
// ============================================================================

function getTierBenefits(tier: string) {
  const tiers = {
    BASIC: {
      baseBenefits: 100,
      healthScreening: 50,
      chronicCare: 0,
      preventiveCare: 30,
      medicationSubsidy: 20,
      monthlyCap: 200,
      annualCap: 1000,
    },
    ENHANCED: {
      baseBenefits: 200,
      healthScreening: 100,
      chronicCare: 50,
      preventiveCare: 60,
      medicationSubsidy: 40,
      monthlyCap: 350,
      annualCap: 1800,
    },
    PREMIUM: {
      baseBenefits: 400,
      healthScreening: 200,
      chronicCare: 150,
      preventiveCare: 100,
      medicationSubsidy: 80,
      monthlyCap: 500,
      annualCap: 2500,
    },
  }
  return tiers[tier as keyof typeof tiers] || tiers.BASIC
}

function calculateBenefitProjections(calculation: any, available: any, userContext: any) {
  const { age, medicalConditions, healthGoals, complianceScore } = userContext
  
  // Simple projection based on current usage and user context
  const monthlyProjection = available.monthlyRemaining * (complianceScore / 100)
  const annualProjection = available.annualRemaining * (complianceScore / 100)
  
  // Adjust for medical conditions and age
  const healthAdjustment = medicalConditions.length > 0 ? 1.2 : 1.0
  const ageAdjustment = age >= 65 ? 1.1 : 1.0
  
  return {
    conservative: {
      monthly: monthlyProjection * 0.8,
      annual: annualProjection * 0.8,
    },
    realistic: {
      monthly: monthlyProjection * healthAdjustment,
      annual: annualProjection * healthAdjustment,
    },
    optimistic: {
      monthly: monthlyProjection * 1.2 * ageAdjustment,
      annual: annualProjection * 1.2 * ageAdjustment,
    },
    factors: {
      complianceScore,
      healthAdjustment,
      ageAdjustment,
      healthGoals: healthGoals.length,
    },
  }
}

function generateBenefitRecommendations(tier: string, available: any, userContext: any) {
  const recommendations = []
  
  if (available.monthlyRemaining > available.monthlyCap * 0.8) {
    recommendations.push({
      type: 'utilize_benefits',
      title: 'Maximize Your Benefits',
      description: 'You have substantial benefits remaining this month',
      action: 'Schedule preventive care appointments',
      priority: 'MEDIUM',
    })
  }
  
  if (userContext.lastScreening && 
      new Date().getTime() - userContext.lastScreening.getTime() > 365 * 24 * 60 * 60 * 1000) {
    recommendations.push({
      type: 'screening_overdue',
      title: 'Health Screening Due',
      description: 'Your annual health screening is overdue',
      action: 'Schedule screening appointment',
      priority: 'HIGH',
    })
  }
  
  if (!userContext.complianceStatus) {
    recommendations.push({
      type: 'compliance_verification',
      title: 'Verify Compliance Status',
      description: 'Your benefits compliance needs verification',
      action: 'Complete compliance check',
      priority: 'HIGH',
    })
  }
  
  return recommendations
}

function calculateComplianceScore(userBenefits: any): number {
  if (!userBenefits) return 0
  
  let score = 50 // Base score
  
  // Compliance verified
  if (userBenefits.complianceVerified) score += 20
  
  // MOH verified
  if (userBenefits.mohVerified) score += 15
  
  // Active Healthier SG member
  if (userBenefits.isHealthierSGMember) score += 10
  
  // Recent activity
  const daysSinceUpdate = (new Date().getTime() - userBenefits.updatedAt.getTime()) / (1000 * 60 * 60 * 24)
  if (daysSinceUpdate < 30) score += 5
  
  return Math.min(100, score)
}

function getLastScreeningDate(userBenefits: any): Date | null {
  if (!userBenefits?.screenings) return null
  
  const completedScreenings = userBenefits.screenings
    .filter((s: any) => s.status === 'COMPLETED' && s.completedDate)
    .sort((a: any, b: any) => new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime())
  
  return completedScreenings[0]?.completedDate || null
}

function calculateIncentiveReward(milestoneType: string, milestoneValue: any, context: any) {
  const baseRewards = {
    HEALTH_SCREENING_COMPLETED: { value: 25, points: 100, type: 'MONETARY' },
    GOAL_ACHIEVED: { value: 50, points: 200, type: 'MONETARY' },
    MILESTONE_REACHED: { value: 30, points: 150, type: 'MONETARY' },
    PARTICIPATION_STREAK: { value: context.streak * 2, points: context.streak * 10, type: 'MONETARY' },
    EDUCATION_COMPLETED: { value: 20, points: 80, type: 'MONETARY' },
    LIFESTYLE_IMPROVEMENT: { value: 40, points: 160, type: 'MONETARY' },
    MEDICATION_ADHERENCE: { value: 35, points: 140, type: 'MONETARY' },
    APPOINTMENT_ATTENDED: { value: 15, points: 60, type: 'MONETARY' },
    COMMUNITY_ENGAGEMENT: { value: 25, points: 100, type: 'MONETARY' },
    WEARABLE_MILESTONE: { value: 20, points: 80, type: 'MONETARY' },
  }
  
  const base = baseRewards[milestoneType as keyof typeof baseRewards] || { value: 10, points: 50, type: 'MONETARY' }
  
  // Apply tier bonus
  const tierMultiplier = context.userTier === 'PREMIUM' ? 1.5 : context.userTier === 'ENHANCED' ? 1.2 : 1.0
  
  // Apply compliance bonus
  const complianceMultiplier = context.complianceScore / 100
  
  return {
    value: Math.round(base.value * tierMultiplier * complianceMultiplier),
    points: Math.round(base.points * tierMultiplier * complianceMultiplier),
    type: base.type,
    description: `${base.value * tierMultiplier * complianceMultiplier} SGD earned`,
  }
}

function getIncentiveDisplayName(milestoneType: string): string {
  const names = {
    HEALTH_SCREENING_COMPLETED: 'Health Screening Completion',
    GOAL_ACHIEVED: 'Health Goal Achievement',
    MILESTONE_REACHED: 'Program Milestone',
    PARTICIPATION_STREAK: 'Participation Streak',
    EDUCATION_COMPLETED: 'Health Education',
    LIFESTYLE_IMPROVEMENT: 'Lifestyle Improvement',
    MEDICATION_ADHERENCE: 'Medication Adherence',
    APPOINTMENT_ATTENDED: 'Appointment Attendance',
    COMMUNITY_ENGAGEMENT: 'Community Engagement',
    WEARABLE_MILESTONE: 'Activity Milestone',
  }
  return names[milestoneType as keyof typeof names] || 'Health Milestone'
}

function getIncentiveDescription(milestoneType: string, milestoneValue: any): string {
  const descriptions = {
    HEALTH_SCREENING_COMPLETED: 'Completed health screening appointment',
    GOAL_ACHIEVED: `Achieved health goal: ${milestoneValue}`,
    MILESTONE_REACHED: 'Reached program milestone',
    PARTICIPATION_STREAK: 'Maintained program participation',
    EDUCATION_COMPLETED: 'Completed health education module',
    LIFESTYLE_IMPROVEMENT: 'Achieved lifestyle improvement',
    MEDICATION_ADHERENCE: 'Maintained medication adherence',
    APPOINTMENT_ATTENDED: 'Attended scheduled appointment',
    COMMUNITY_ENGAGEMENT: 'Participated in community health activities',
    WEARABLE_MILESTONE: 'Reached activity milestone',
  }
  return descriptions[milestoneType as keyof typeof descriptions] || 'Health milestone achieved'
}

function getIncentiveExpiryDate(milestoneType: string): Date {
  const expiryDays = {
    HEALTH_SCREENING_COMPLETED: 90,
    GOAL_ACHIEVED: 180,
    MILESTONE_REACHED: 120,
    PARTICIPATION_STREAK: 30,
    EDUCATION_COMPLETED: 60,
    LIFESTYLE_IMPROVEMENT: 180,
    MEDICATION_ADHERENCE: 30,
    APPOINTMENT_ATTENDED: 30,
    COMMUNITY_ENGAGEMENT: 90,
    WEARABLE_MILESTONE: 60,
  }
  
  const days = expiryDays[milestoneType as keyof typeof expiryDays] || 90
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000)
}

async function getParticipationStreak(userId: string, prisma: any): Promise<number> {
  // Simple streak calculation - would be more complex in real implementation
  const recentActivities = await prisma.healthActivity.findMany({
    where: {
      healthProfile: { userId },
      activityDate: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    },
    orderBy: { activityDate: 'desc' },
  })
  
  return Math.min(recentActivities.length, 30) // Cap at 30 days
}

async function triggerIncentiveNotification(userId: string, milestoneType: string, value: number, prisma: any) {
  // Would integrate with notification system in real implementation
  console.log('Incentive notification:', { userId, milestoneType, value })
}

function calculateScreeningPayment(screeningType: string, estimatedCost: number, context: any) {
  const subsidyRates = {
    ANNUAL_CHECKUP: 0.8,
    DIABETES_SCREENING: 0.9,
    CHOLESTEROL_SCREENING: 0.9,
    BLOOD_PRESSURE_CHECK: 0.95,
    CANCER_SCREENING: 0.85,
    VACCINATION: 1.0,
  }
  
  const baseSubsidyRate = subsidyRates[screeningType as keyof typeof subsidyRates] || 0.8
  
  // Calculate benefits contribution
  let benefitsUsed = Math.min(
    context.benefitsBalance,
    estimatedCost * baseSubsidyRate
  )
  
  // Calculate CHAS contribution
  let chasUsed = 0
  if (context.paymentPreferences.useCHAS && context.chasTier) {
    const chasRates = {
      CHAS_BLUE: 0.7,
      CHAS_ORANGE: 0.5,
      CHAS_GREEN: 0.3,
    }
    const chasRate = chasRates[context.chasTier] || 0
    chasUsed = Math.min(
      context.benefitsBalance - benefitsUsed,
      estimatedCost * chasRate
    )
  }
  
  // Calculate Medisave contribution
  let medisaveUsed = 0
  if (context.paymentPreferences.useMedisave && context.medisaveBalance > 0) {
    const availableAfterOthers = Math.max(0, context.benefitsBalance - benefitsUsed - chasUsed)
    medisaveUsed = Math.min(
      availableAfterOthers,
      context.medisaveBalance,
      estimatedCost * 0.8 // Max 80% from Medisave
    )
  }
  
  const totalSubsidy = benefitsUsed + chasUsed + medisaveUsed
  const patientPay = Math.max(0, estimatedCost - totalSubsidy)
  
  return {
    benefitsUsed: Math.round(benefitsUsed * 100) / 100,
    chasUsed: Math.round(chasUsed * 100) / 100,
    medisaveUsed: Math.round(medisaveUsed * 100) / 100,
    totalSubsidy: Math.round(totalSubsidy * 100) / 100,
    patientPay: Math.round(patientPay * 100) / 100,
    subsidyBreakdown: {
      benefits: (benefitsUsed / totalSubsidy) * 100,
      chas: (chasUsed / totalSubsidy) * 100,
      medisave: (medisaveUsed / totalSubsidy) * 100,
    },
  }
}

function getScreeningDisplayName(screeningType: string): string {
  const names = {
    ANNUAL_CHECKUP: 'Annual Health Checkup',
    DIABETES_SCREENING: 'Diabetes Screening',
    CHOLESTEROL_SCREENING: 'Cholesterol Screening',
    BLOOD_PRESSURE_CHECK: 'Blood Pressure Check',
    CANCER_SCREENING: 'Cancer Screening',
    HEART_HEALTH: 'Heart Health Assessment',
    KIDNEY_FUNCTION: 'Kidney Function Test',
    LIVER_FUNCTION: 'Liver Function Test',
    THYROID_FUNCTION: 'Thyroid Function Test',
    EYE_EXAM: 'Eye Examination',
    DENTAL_CHECKUP: 'Dental Checkup',
    VACCINATION: 'Vaccination',
    CHRONIC_DISEASE_MONITORING: 'Chronic Disease Monitoring',
    LIFESTYLE_ASSESSMENT: 'Lifestyle Assessment',
    NUTRITIONAL_ASSESSMENT: 'Nutritional Assessment',
    MENTAL_HEALTH_SCREENING: 'Mental Health Screening',
  }
  return names[screeningType as keyof typeof names] || screeningType
}

function getScreeningDescription(screeningType: string): string {
  const descriptions = {
    ANNUAL_CHECKUP: 'Comprehensive annual health examination',
    DIABETES_SCREENING: 'Blood glucose and HbA1c testing for diabetes',
    CHOLESTEROL_SCREENING: 'Lipid profile testing for heart health',
    BLOOD_PRESSURE_CHECK: 'Blood pressure monitoring and assessment',
    CANCER_SCREENING: 'Age-appropriate cancer screening tests',
    HEART_HEALTH: 'Cardiovascular health assessment',
    KIDNEY_FUNCTION: 'Kidney function and renal health test',
    LIVER_FUNCTION: 'Liver enzyme and function testing',
    THYROID_FUNCTION: 'Thyroid hormone level testing',
    EYE_EXAM: 'Vision and eye health examination',
    DENTAL_CHECKUP: 'Oral health and dental examination',
    VACCINATION: 'Recommended vaccination administration',
    CHRONIC_DISEASE_MONITORING: 'Ongoing monitoring for chronic conditions',
    LIFESTYLE_ASSESSMENT: 'Lifestyle factors and health risk assessment',
    NUTRITIONAL_ASSESSMENT: 'Dietary intake and nutritional status evaluation',
    MENTAL_HEALTH_SCREENING: 'Mental health and wellness assessment',
  }
  return descriptions[screeningType as keyof typeof descriptions] || 'Health screening procedure'
}

async function triggerPaymentNotification(userId: string, screeningType: string, payment: any, prisma: any) {
  console.log('Payment notification:', { userId, screeningType, payment })
}

function generateBenefitsAlerts(summary: any): any[] {
  const alerts = []
  
  if (summary.usage.monthlyUsed > summary.usage.monthlyLimit * 0.9) {
    alerts.push({
      type: 'usage_warning',
      severity: 'warning',
      title: 'Monthly Benefits Usage High',
      message: `You have used ${Math.round(summary.usage.monthlyUsagePercent)}% of your monthly benefits`,
      action: 'Review upcoming appointments',
    })
  }
  
  if (summary.upcoming.pendingClaims > 0) {
    alerts.push({
      type: 'pending_claims',
      severity: 'info',
      title: 'Pending Claims',
      message: `You have ${summary.upcoming.pendingClaims} claims awaiting processing`,
      action: 'Check claim status',
    })
  }
  
  if (summary.upcoming.expiringIncentives > 0) {
    alerts.push({
      type: 'expiring_incentives',
      severity: 'warning',
      title: 'Incentives Expiring Soon',
      message: `${summary.upcoming.expiringIncentives} incentives will expire in the next 7 days`,
      action: 'Use incentives before expiration',
    })
  }
  
  return alerts
}

function generateBenefitsRecommendations(summary: any): any[] {
  const recommendations = []
  
  if (summary.account.balance > 100) {
    recommendations.push({
      type: 'utilize_benefits',
      title: 'Use Available Benefits',
      description: 'You have benefits available for healthcare services',
      action: 'Schedule health screening',
      priority: 'MEDIUM',
    })
  }
  
  if (summary.upcoming.screenings === 0) {
    recommendations.push({
      type: 'schedule_screening',
      title: 'Schedule Health Screening',
      description: 'Regular health screenings help maintain your wellness',
      action: 'Find participating clinics',
      priority: 'HIGH',
    })
  }
  
  if (summary.usage.complianceScore < 70) {
    recommendations.push({
      type: 'improve_compliance',
      title: 'Improve Compliance Score',
      description: 'Complete compliance verification for better benefits',
      action: 'Verify eligibility status',
      priority: 'HIGH',
    })
  }
  
  return recommendations
}

function generateScreeningRecommendations(age: number, chronicConditions: string, tier: string): any[] {
  const recommendations = []
  
  // Age-based recommendations
  if (age >= 40) {
    recommendations.push({
      screeningType: 'ANNUAL_CHECKUP',
      name: 'Annual Health Checkup',
      description: 'Comprehensive yearly health examination',
      priority: age >= 65 ? 'HIGH' : 'MEDIUM',
      frequency: 'annual',
    })
  }
  
  if (age >= 50) {
    recommendations.push({
      screeningType: 'CANCER_SCREENING',
      name: 'Cancer Screening',
      description: 'Age-appropriate cancer screening',
      priority: 'HIGH',
      frequency: 'annual',
    })
  }
  
  // Chronic condition recommendations
  if (chronicConditions && chronicConditions !== 'None reported') {
    recommendations.push({
      screeningType: 'CHRONIC_DISEASE_MONITORING',
      name: 'Chronic Disease Monitoring',
      description: 'Regular monitoring for chronic conditions',
      priority: 'HIGH',
      frequency: 'quarterly',
    })
  }
  
  // Tier-based recommendations
  if (tier === 'PREMIUM') {
    recommendations.push({
      screeningType: 'COMPREHENSIVE_ASSESSMENT',
      name: 'Comprehensive Health Assessment',
      description: 'Detailed health assessment for premium members',
      priority: 'MEDIUM',
      frequency: 'annual',
    })
  }
  
  return recommendations
}

function getScreeningFrequency(screeningType: string): number {
  const frequencies = {
    ANNUAL_CHECKUP: 365,
    DIABETES_SCREENING: 365,
    CHOLESTEROL_SCREENING: 365,
    BLOOD_PRESSURE_CHECK: 90,
    CANCER_SCREENING: 365,
    HEART_HEALTH: 365,
    KIDNEY_FUNCTION: 180,
    LIVER_FUNCTION: 180,
    THYROID_FUNCTION: 365,
    EYE_EXAM: 365,
    DENTAL_CHECKUP: 180,
    VACCINATION: 365,
    CHRONIC_DISEASE_MONITORING: 90,
    LIFESTYLE_ASSESSMENT: 180,
    NUTRITIONAL_ASSESSMENT: 180,
    MENTAL_HEALTH_SCREENING: 365,
  }
  return frequencies[screeningType as keyof typeof frequencies] || 365
}

function calculateNextScreeningDate(screeningType: string, age: number, overdueScreenings: any[]): Date {
  const frequency = getScreeningFrequency(screeningType)
  const lastScreening = overdueScreenings.find(s => s.screeningType === screeningType)
  
  if (lastScreening?.completedDate) {
    return new Date(new Date(lastScreening.completedDate).getTime() + frequency * 24 * 60 * 60 * 1000)
  }
  
  // Calculate based on age milestones
  if (screeningType === 'CANCER_SCREENING' && age < 50) {
    return new Date(Date.now() + (50 - age) * 365 * 24 * 60 * 60 * 1000)
  }
  
  return new Date(Date.now() + frequency * 24 * 60 * 60 * 1000)
}

function getScreeningUrgency(screeningType: string, age: number, overdueScreenings: any[]): 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' {
  const isOverdue = overdueScreenings.some(s => s.screeningType === screeningType)
  
  if (isOverdue) return 'URGENT'
  
  // Age-based urgency
  if (screeningType === 'ANNUAL_CHECKUP' && age >= 65) return 'HIGH'
  if (screeningType === 'CANCER_SCREENING' && age >= 60) return 'HIGH'
  if (screeningType === 'CHRONIC_DISEASE_MONITORING') return 'HIGH'
  
  return 'MEDIUM'
}

async function triggerClaimNotification(userId: string, claim: any, prisma: any) {
  console.log('Claim notification:', { userId, claimId: claim.id, status: claim.status })
}

async function triggerStatusUpdateNotification(userId: string, status: string, reason: string, deadline: Date, prisma: any) {
  console.log('Status update notification:', { userId, status, reason, deadline })
}

// Helper functions for registration workflow
function getNextStepsBasedOnStatus(status: string) {
  const steps = {
    DRAFT: [
      {
        title: 'Complete your registration',
        description: 'Fill out all required information',
        priority: 'HIGH' as const,
        actionRequired: true,
      },
    ],
    SUBMITTED: [
      {
        title: 'Wait for clinic review',
        description: 'Your registration is being reviewed by your chosen clinic',
        priority: 'LOW' as const,
        actionRequired: false,
      },
    ],
    UNDER_REVIEW: [
      {
        title: 'Application under review',
        description: 'Clinic staff are reviewing your registration',
        priority: 'LOW' as const,
        actionRequired: false,
      },
    ],
    APPROVED: [
      {
        title: 'Schedule health screening',
        description: 'Book your initial health checkup appointment',
        priority: 'HIGH' as const,
        actionRequired: true,
      },
    ],
    REJECTED: [
      {
        title: 'Review rejection reason',
        description: 'Understand why your registration was rejected',
        priority: 'HIGH' as const,
        actionRequired: true,
      },
    ],
    NEEDS_REVISION: [
      {
        title: 'Update your information',
        description: 'Make the requested changes to your registration',
        priority: 'HIGH' as const,
        actionRequired: true,
      },
    ],
    WITHDRAWN: [
      {
        title: 'Start new registration',
        description: 'Begin the registration process again',
        priority: 'MEDIUM' as const,
        actionRequired: true,
      },
    ],
  }

  return steps[status] || []
}

function getStatusDescription(status: string): string {
  const descriptions = {
    DRAFT: 'Registration in progress',
    SUBMITTED: 'Registration submitted for review',
    UNDER_REVIEW: 'Registration being reviewed by clinic',
    APPROVED: 'Registration approved - welcome to Healthier SG!',
    REJECTED: 'Registration rejected - please contact support',
    NEEDS_REVISION: 'Registration needs updates before approval',
    WITHDRAWN: 'Registration has been withdrawn',
  }

  return descriptions[status] || 'Unknown status'
}

function getNotificationsByStatus(status: string, registration: any) {
  const notifications = []

  switch (status) {
    case 'SUBMITTED':
      notifications.push({
        id: 'registration_submitted',
        type: 'registration_submitted' as const,
        title: 'Registration Submitted',
        message: 'Your Healthier SG registration has been submitted successfully.',
        severity: 'success' as const,
        timestamp: registration.registrationDate,
        read: false,
        metadata: { registrationId: registration.id },
      })
      break

    case 'UNDER_REVIEW':
      notifications.push({
        id: 'registration_under_review',
        type: 'system_update' as const,
        title: 'Registration Under Review',
        message: 'Your clinic is reviewing your registration. You will be notified of the outcome.',
        severity: 'info' as const,
        timestamp: registration.updatedAt,
        read: false,
        metadata: { registrationId: registration.id },
      })
      break

    case 'APPROVED':
      notifications.push({
        id: 'registration_approved',
        type: 'registration_approved' as const,
        title: 'Registration Approved!',
        message: 'Congratulations! Your Healthier SG registration has been approved.',
        severity: 'success' as const,
        timestamp: registration.updatedAt,
        read: false,
        metadata: { registrationId: registration.id },
      })
      break

    case 'REJECTED':
      notifications.push({
        id: 'registration_rejected',
        type: 'registration_rejected' as const,
        title: 'Registration Requires Attention',
        message: 'Your registration could not be approved. Please contact support for assistance.',
        severity: 'error' as const,
        timestamp: registration.updatedAt,
        read: false,
        metadata: { registrationId: registration.id },
      })
      break
  }

  return notifications
}

function getProgressNotifications(stepCompletion: Record<string, boolean>) {
  const notifications = []

  // Check for step completion milestones
  const steps = [
    { id: 'personal-info', name: 'Personal Information' },
    { id: 'identity-verification', name: 'Identity Verification' },
    { id: 'digital-consent', name: 'Digital Consent' },
    { id: 'documents', name: 'Document Upload' },
    { id: 'health-goals', name: 'Health Goals' },
  ]

  steps.forEach(step => {
    if (stepCompletion[step.id]) {
      notifications.push({
        id: `step_completed_${step.id}`,
        type: 'step_completed' as const,
        title: `${step.name} Completed`,
        message: `You have successfully completed the ${step.name.toLowerCase()} step.`,
        severity: 'success' as const,
        timestamp: new Date(), // In real implementation, would track step completion time
        read: false,
        metadata: { stepId: step.id },
      })
    }
  })

  return notifications
}