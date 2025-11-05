import { z } from 'zod'
import { createTRPCRouter, publicProcedure, protectedProcedure, adminProcedure, calculatePagination } from '../trpc'
import { TRPCError } from '@trpc/server'
import { Prisma } from '@prisma/client'

const eligibilityAssessmentSelect = {
  id: true,
  userId: true,
  myInfoData: true,
  responses: true,
  status: true,
  eligibilityResult: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
  reviewedAt: true,
  reviewNotes: true,
}

/**
 * Eligibility Checker Router - Handles interactive eligibility assessment
 */
export const eligibilityRouter = createTRPCRouter({
  /**
   * Create new eligibility assessment
   */
  createAssessment: protectedProcedure
    .input(
      z.object({
        myInfoData: z.object({
          uinFin: z.string(),
          name: z.string(),
          dateOfBirth: z.string(),
          gender: z.enum(['M', 'F']),
          nationality: z.string(),
          residentialStatus: z.enum(['CITIZEN', 'PR', 'FOREIGNER']),
          address: z.object({
            postalCode: z.string(),
            streetName: z.string(),
            blockHouseNumber: z.string(),
            buildingName: z.string().optional(),
          }),
        }).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Check for existing in-progress assessments
        const existingAssessment = await ctx.prisma.eligibilityAssessment.findFirst({
          where: {
            userId: ctx.session.user.id,
            status: 'IN_PROGRESS',
          },
        })

        if (existingAssessment) {
          // Update existing assessment with MyInfo data
          const updated = await ctx.prisma.eligibilityAssessment.update({
            where: { id: existingAssessment.id },
            data: {
              myInfoData: input.myInfoData,
              updatedAt: new Date(),
            },
            select: eligibilityAssessmentSelect,
          })
          return updated
        }

        // Create new assessment
        const assessment = await ctx.prisma.eligibilityAssessment.create({
          data: {
            userId: ctx.session.user.id,
            myInfoData: input.myInfoData,
            responses: [],
            status: 'IN_PROGRESS',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          select: eligibilityAssessmentSelect,
        })

        return assessment
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to create eligibility assessment',
          cause: error,
        })
      }
    }),

  /**
   * Save assessment response
   */
  saveResponse: protectedProcedure
    .input(
      z.object({
        assessmentId: z.string(),
        questionId: z.string(),
        value: z.union([
          z.string(),
          z.number(),
          z.array(z.string()),
          z.boolean(),
          z.date(),
        ]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify assessment belongs to user
        const assessment = await ctx.prisma.eligibilityAssessment.findFirst({
          where: {
            id: input.assessmentId,
            userId: ctx.session.user.id,
          },
        })

        if (!assessment) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Assessment not found',
          })
        }

        // Update or add response
        const currentResponses = assessment.responses || []
        const updatedResponses = currentResponses.filter(
          (r: any) => r.questionId !== input.questionId
        )
        updatedResponses.push({
          questionId: input.questionId,
          value: input.value,
          timestamp: new Date(),
        })

        const updated = await ctx.prisma.eligibilityAssessment.update({
          where: { id: input.assessmentId },
          data: {
            responses: updatedResponses,
            updatedAt: new Date(),
          },
          select: eligibilityAssessmentSelect,
        })

        return updated
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to save response',
          cause: error,
        })
      }
    }),

  /**
   * Submit assessment for evaluation
   */
  submitAssessment: protectedProcedure
    .input(
      z.object({
        assessmentId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Get assessment
        const assessment = await ctx.prisma.eligibilityAssessment.findFirst({
          where: {
            id: input.assessmentId,
            userId: ctx.session.user.id,
          },
        })

        if (!assessment) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Assessment not found',
          })
        }

        // Perform eligibility evaluation
        const evaluationResult = await evaluateEligibility(assessment.responses || [], assessment.myInfoData)

        // Update assessment with results
        const updated = await ctx.prisma.eligibilityAssessment.update({
          where: { id: input.assessmentId },
          data: {
            status: 'COMPLETED',
            eligibilityResult: evaluationResult,
            completedAt: new Date(),
            updatedAt: new Date(),
          },
          select: eligibilityAssessmentSelect,
        })

        return updated
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to submit assessment',
          cause: error,
        })
      }
    }),

  /**
   * Get assessment by ID
   */
  getAssessment: protectedProcedure
    .input(z.object({ assessmentId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const assessment = await ctx.prisma.eligibilityAssessment.findFirst({
          where: {
            id: input.assessmentId,
            userId: ctx.session.user.id,
          },
          select: eligibilityAssessmentSelect,
        })

        if (!assessment) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Assessment not found',
          })
        }

        return assessment
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch assessment',
          cause: error,
        })
      }
    }),

  /**
   * Get user's assessment history
   */
  getMyAssessments: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(10),
        status: z.enum(['IN_PROGRESS', 'COMPLETED', 'REVIEWED', 'APPROVED', 'REJECTED']).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, status } = input
      const skip = (page - 1) * limit

      const where: Prisma.EligibilityAssessmentWhereInput = {
        userId: ctx.session.user.id,
        ...(status && { status }),
      }

      try {
        const [assessments, total] = await Promise.all([
          ctx.prisma.eligibilityAssessment.findMany({
            where,
            select: eligibilityAssessmentSelect,
            skip,
            take: limit,
            orderBy: { updatedAt: 'desc' },
          }),
          ctx.prisma.eligibilityAssessment.count({ where }),
        ])

        return {
          data: assessments,
          pagination: calculatePagination(page, limit, total),
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch assessments',
          cause: error,
        })
      }
    }),

  /**
   * Get my current eligibility summary
   */
  getMyEligibilitySummary: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Get latest completed assessment
      const latestAssessment = await ctx.prisma.eligibilityAssessment.findFirst({
        where: {
          userId: ctx.session.user.id,
          status: { in: ['COMPLETED', 'REVIEWED', 'APPROVED', 'REJECTED'] },
        },
        select: eligibilityAssessmentSelect,
        orderBy: { updatedAt: 'desc' },
      })

      if (!latestAssessment) {
        return {
          hasAssessment: false,
          currentStatus: 'NO_ASSESSMENT' as const,
          lastAssessmentDate: null,
          isEligible: false,
          eligibilityReason: 'No assessment completed yet',
          nextSteps: [
            'Complete eligibility assessment',
            'Understand Healthier SG program',
            'Find participating clinics near you',
          ],
        }
      }

      const isEligible = latestAssessment.eligibilityResult?.isEligible || false
      const currentStatus = isEligible ? 'ELIGIBLE' : 'NOT_ELIGIBLE'

      return {
        hasAssessment: true,
        currentStatus,
        lastAssessmentDate: latestAssessment.updatedAt,
        isEligible,
        eligibilityReason: latestAssessment.eligibilityResult?.reason || 'Assessment completed',
        nextSteps: isEligible ? [
          'Find a participating clinic near you',
          'Schedule health screening appointment',
          'Complete enrollment process',
        ] : [
          'Review eligibility criteria',
          'Consider lifestyle improvements',
          'Reassess when circumstances change',
        ],
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
          'OTHER'
        ]),
        description: z.string().min(10),
        contactPhone: z.string().optional(),
        contactEmail: z.string().email().optional(),
        urgentReview: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify assessment exists and belongs to user
        const assessment = await ctx.prisma.eligibilityAssessment.findFirst({
          where: {
            id: input.assessmentId,
            userId: ctx.session.user.id,
          },
        })

        if (!assessment) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Assessment not found',
          })
        }

        // Create appeal
        const appeal = await ctx.prisma.eligibilityAppeal.create({
          data: {
            assessmentId: input.assessmentId,
            userId: ctx.session.user.id,
            reason: input.reason,
            description: input.description,
            status: 'PENDING',
            submittedAt: new Date(),
            contactPhone: input.contactPhone,
            contactEmail: input.contactEmail,
          },
        })

        return {
          success: true,
          appealId: appeal.id,
          message: 'Appeal submitted successfully',
          expectedReviewTime: '5-7 business days',
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
   * Get user's appeals
   */
  getMyAppeals: protectedProcedure.query(async ({ ctx }) => {
    try {
      const appeals = await ctx.prisma.eligibilityAppeal.findMany({
        where: { userId: ctx.session.user.id },
        orderBy: { submittedAt: 'desc' },
      })

      return appeals
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch appeals',
        cause: error,
      })
    }
  }),

  /**
   * Export assessment data
   */
  exportAssessment: protectedProcedure
    .input(z.object({ assessmentId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const assessment = await ctx.prisma.eligibilityAssessment.findFirst({
          where: {
            id: input.assessmentId,
            userId: ctx.session.user.id,
          },
          select: {
            ...eligibilityAssessmentSelect,
            user: {
              select: {
                email: true,
                profile: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        })

        if (!assessment) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Assessment not found',
          })
        }

        // Generate export data (in real implementation, this would be a PDF or structured data)
        const exportData = {
          assessment,
          exportedAt: new Date(),
          exportType: 'ELIGIBILITY_ASSESSMENT',
        }

        return exportData
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to export assessment',
          cause: error,
        })
      }
    }),

  /**
   * Get eligibility analytics (admin only)
   */
  getAnalytics: adminProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        includeAppeals: z.boolean().default(true),
      })
    )
    .query(async ({ ctx, input }) => {
      const { startDate, endDate, includeAppeals } = input

      const dateFilter = {}
      if (startDate && endDate) {
        dateFilter['createdAt'] = { gte: startDate, lte: endDate }
      }

      try {
        const [
          totalAssessments,
          completedAssessments,
          eligibleAssessments,
          averageScore,
          appealsData,
          statusDistribution
        ] = await Promise.all([
          ctx.prisma.eligibilityAssessment.count({ where: dateFilter }),
          ctx.prisma.eligibilityAssessment.count({ 
            where: { ...dateFilter, status: 'COMPLETED' } 
          }),
          ctx.prisma.eligibilityAssessment.count({
            where: {
              ...dateFilter,
              status: 'COMPLETED',
              eligibilityResult: { path: '$.isEligible', equals: true },
            },
          }),
          ctx.prisma.eligibilityAssessment.aggregate({
            where: { ...dateFilter, status: 'COMPLETED' },
            _avg: { 
              // This would need to be computed in a real implementation
            },
          }),
          includeAppeals ? ctx.prisma.eligibilityAppeal.count({ 
            where: {
              submittedAt: { gte: startDate, lte: endDate }
            }
          }) : Promise.resolve(0),
          ctx.prisma.eligibilityAssessment.groupBy({
            by: ['status'],
            where: dateFilter,
            _count: { status: true },
          }),
        ])

        const eligibilityRate = completedAssessments > 0 
          ? (eligibleAssessments / completedAssessments) * 100 
          : 0

        return {
          totalAssessments,
          completedAssessments,
          eligibleAssessments,
          eligibilityRate: Math.round(eligibilityRate * 100) / 100,
          averageScore: 0, // Would need proper calculation
          appealsSubmitted: appealsData,
          statusDistribution: statusDistribution.map(item => ({
            status: item.status,
            count: item._count.status,
          })),
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch analytics',
          cause: error,
        })
      }
    }),
})

/**
 * Helper function to evaluate eligibility based on responses
 */
async function evaluateEligibility(responses: any[], myInfoData?: any) {
  // Convert responses to map for easy lookup
  const responseMap = new Map(responses.map(r => [r.questionId, r.value]))

  // Get age from MyInfo if available
  let age: number | undefined
  if (myInfoData?.dateOfBirth) {
    const birthDate = new Date(myInfoData.dateOfBirth)
    const today = new Date()
    age = Math.floor((today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
  } else {
    age = responseMap.get('age')
  }

  // Basic eligibility criteria evaluation
  const criteria = []

  // Age requirement (40+ or have chronic conditions)
  const hasChronicConditions = responseMap.get('hasChronicConditions') || false
  const meetsAgeRequirement = age >= 40 || hasChronicConditions
  criteria.push({
    name: 'Age or Health Condition Requirement',
    passed: meetsAgeRequirement,
    weight: 25,
    description: 'Must be 40+ years old or have chronic conditions',
  })

  // Citizenship status
  const citizenshipStatus = myInfoData?.residentialStatus || responseMap.get('citizenshipStatus')
  const isValidResident = citizenshipStatus === 'CITIZEN' || citizenshipStatus === 'PR'
  criteria.push({
    name: 'Residency Status',
    passed: isValidResident,
    weight: 30,
    description: 'Must be Singapore Citizen or Permanent Resident',
  })

  // Health screening consent
  const consentToScreening = responseMap.get('consentToScreening') || false
  criteria.push({
    name: 'Health Screening Consent',
    passed: consentToScreening,
    weight: 15,
    description: 'Must consent to health screening and data collection',
  })

  // Program commitment
  const commitmentLevel = responseMap.get('commitmentLevel')
  const hasCommitment = commitmentLevel === 'HIGH' || commitmentLevel === 'MODERATE'
  criteria.push({
    name: 'Program Commitment',
    passed: hasCommitment,
    weight: 10,
    description: 'Must show willingness to participate in program',
  })

  // Clinic accessibility
  const selectedClinicId = responseMap.get('selectedClinicId')
  criteria.push({
    name: 'Clinic Accessibility',
    passed: !!selectedClinicId,
    weight: 10,
    description: 'Must have access to participating clinic',
  })

  // Calculate overall score
  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0)
  const passedWeight = criteria
    .filter(c => c.passed)
    .reduce((sum, c) => sum + c.weight, 0)
  const score = (passedWeight / totalWeight) * 100

  // Check if all required criteria are passed
  const requiredCriteria = criteria.filter(c => c.weight >= 15) // Criteria with significant weight
  const allRequiredPassed = requiredCriteria.every(c => c.passed)

  const isEligible = allRequiredPassed && score >= 70
  const confidence = score / 100

  return {
    isEligible,
    confidence,
    reason: isEligible 
      ? 'Meets all eligibility criteria for Healthier SG program'
      : 'Does not meet required eligibility criteria',
    score,
    criteria,
  }
}