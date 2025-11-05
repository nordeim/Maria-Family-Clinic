import { z } from 'zod'
import { createTRPCRouter, publicProcedure, protectedProcedure, adminProcedure, calculatePagination } from '../trpc'
import { TRPCError } from '@trpc/server'
import { Prisma } from '@prisma/client'

const userSelect = {
  id: true,
  email: true,
  role: true,
  isActive: true,
  emailVerified: true,
  lastSignInAt: true,
  createdAt: true,
  updatedAt: true,
  profile: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
      dateOfBirth: true,
      gender: true,
      address: true,
      postalCode: true,
      preferredLanguage: true,
      emergencyContact: true,
      medicalHistory: true,
      allergies: true,
      medications: true,
      preferredClinicId: true,
      healthierSgEnrolled: true,
      healthierSgRegistrationDate: true,
    },
  },
}

/**
 * User Router - Handles all user-related operations
 */
export const userRouter = createTRPCRouter({
  /**
   * Get current user profile
   */
  getMe: protectedProcedure.query(async ({ ctx }) => {
    try {
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: userSelect,
      })

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        })
      }

      return user
    } catch (error) {
      if (error instanceof TRPCError) throw error
      throw new TRPCError({
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch user profile',
        cause: error,
      })
    }
  }),

  /**
   * Update current user profile
   */
  updateMe: protectedProcedure
    .input(
      z.object({
        firstName: z.string().min(1).max(100).optional(),
        lastName: z.string().min(1).max(100).optional(),
        phone: z.string().regex(/^(\+65)?[689][0-9]{7}$/).optional(),
        dateOfBirth: z.date().optional(),
        gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
        address: z.string().max(500).optional(),
        postalCode: z.string().regex(/^[0-9]{6}$/).optional(),
        preferredLanguage: z.enum(['en', 'zh', 'ms', 'ta']).optional(),
        emergencyContact: z.object({
          name: z.string().max(100),
          phone: z.string().regex(/^(\+65)?[689][0-9]{7}$/),
          relationship: z.string().max(100),
        }).optional(),
        medicalHistory: z.string().max(2000).optional(),
        allergies: z.string().max(1000).optional(),
        medications: z.string().max(1000).optional(),
        preferredClinicId: z.string().uuid().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { emergencyContact, ...profileData } = input

        const updatedProfile = await ctx.prisma.userProfile.upsert({
          where: { userId: ctx.session.user.id },
          create: {
            userId: ctx.session.user.id,
            ...profileData,
            ...(emergencyContact ? { emergencyContact } : {}),
          },
          update: {
            ...profileData,
            ...(emergencyContact ? { emergencyContact } : {}),
          },
        })

        // Return updated user with profile
        const user = await ctx.prisma.user.findUnique({
          where: { id: ctx.session.user.id },
          select: userSelect,
        })

        return user
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to update user profile',
          cause: error,
        })
      }
    }),

  /**
   * Get all users with pagination (admin only)
   */
  getAll: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        role: z.enum(['ADMIN', 'STAFF', 'USER']).optional(),
        isActive: z.boolean().optional(),
        search: z.string().optional(),
        orderBy: z.enum(['email', 'role', 'createdAt', 'lastSignInAt']).default('createdAt'),
        orderDirection: z.enum(['asc', 'desc']).default('desc'),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, role, isActive, search, orderBy, orderDirection } = input
      const skip = (page - 1) * limit

      // Build where clause
      const where: Prisma.UserWhereInput = {}

      if (role) {
        where.role = role
      }

      if (isActive !== undefined) {
        where.isActive = isActive
      }

      if (search) {
        where.OR = [
          { email: { contains: search, mode: 'insensitive' } },
          { profile: { is: { firstName: { contains: search, mode: 'insensitive' } } } },
          { profile: { is: { lastName: { contains: search, mode: 'insensitive' } } } },
        ]
      }

      // Build orderBy clause
      let orderByClause: Prisma.UserOrderByWithRelationInput = {}
      if (orderBy === 'email' || orderBy === 'role' || orderBy === 'createdAt') {
        orderByClause = { [orderBy]: orderDirection }
      } else if (orderBy === 'lastSignInAt') {
        orderByClause = { lastSignInAt: orderDirection }
      }

      try {
        const [users, total] = await Promise.all([
          ctx.prisma.user.findMany({
            where,
            select: userSelect,
            skip,
            take: limit,
            orderBy: orderByClause,
          }),
          ctx.prisma.user.count({ where }),
        ])

        return {
          data: users,
          pagination: calculatePagination(page, limit, total),
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch users',
          cause: error,
        })
      }
    }),

  /**
   * Get user by ID (admin only)
   */
  getById: adminProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const user = await ctx.prisma.user.findUnique({
          where: { id: input.id },
          select: {
            ...userSelect,
            // Include sensitive data for admin
            lastSignInAt: true,
            // Get user's appointments for admin view
            appointments: {
              select: {
                id: true,
                appointmentDate: true,
                status: true,
                clinic: {
                  select: {
                    name: true,
                  },
                },
                doctor: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
                service: {
                  select: {
                    name: true,
                  },
                },
              },
              orderBy: {
                appointmentDate: 'desc',
              },
              take: 10,
            },
          },
        })

        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          })
        }

        return user
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch user',
          cause: error,
        })
      }
    }),

  /**
   * Update user role and status (admin only)
   */
  updateUser: adminProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        role: z.enum(['ADMIN', 'STAFF', 'USER']).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, role, isActive } = input

      try {
        // Prevent demoting or deactivating the current admin user
        if (id === ctx.session.user.id && (role !== 'ADMIN' || isActive === false)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'You cannot demote or deactivate your own admin account',
          })
        }

        const user = await ctx.prisma.user.update({
          where: { id },
          data: {
            ...(role ? { role } : {}),
            ...(isActive !== undefined ? { isActive } : {}),
          },
          select: userSelect,
        })

        return user
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'User not found',
            })
          }
        }

        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to update user',
          cause: error,
        })
      }
    }),

  /**
   * Delete user (admin only)
   */
  delete: adminProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Prevent deleting the current admin user
        if (input.id === ctx.session.user.id) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'You cannot delete your own admin account',
          })
        }

        // Check if user has future appointments
        const futureAppointments = await ctx.prisma.appointment.count({
          where: {
            patientId: input.id,
            appointmentDate: {
              gte: new Date(),
            },
            status: {
              not: 'CANCELLED',
            },
          },
        })

        if (futureAppointments > 0) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Cannot delete user with future appointments. Please cancel appointments first.',
          })
        }

        await ctx.prisma.user.delete({
          where: { id: input.id },
        })

        return { success: true }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          })
        }

        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete user',
          cause: error,
        })
      }
    }),

  /**
   * Get user statistics (admin only)
   */
  getStats: adminProcedure.query(async ({ ctx }) => {
    try {
      const [total, active, admins, staff, users, newThisMonth, activeThisWeek] = await Promise.all([
        ctx.prisma.user.count(),
        ctx.prisma.user.count({ where: { isActive: true } }),
        ctx.prisma.user.count({ where: { role: 'ADMIN' } }),
        ctx.prisma.user.count({ where: { role: 'STAFF' } }),
        ctx.prisma.user.count({ where: { role: 'USER' } }),
        ctx.prisma.user.count({
          where: {
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        }),
        ctx.prisma.user.count({
          where: {
            lastSignInAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
            },
          },
        }),
      ])

      return {
        total,
        active,
        admins,
        staff,
        users,
        newThisMonth,
        activeThisWeek,
      }
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch user statistics',
        cause: error,
      })
    }
  }),

  /**
   * Get Healthier SG enrollment statistics (admin/staff only)
   */
  getHealthierSgStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      const userRole = ctx.session.user.role

      let clinicFilter = {}
      if (userRole === 'STAFF') {
        const userClinic = await ctx.prisma.clinic.findFirst({
          where: { userId: ctx.session.user.id },
          select: { id: true },
        })

        if (userClinic) {
          clinicFilter = { preferredClinicId: userClinic.id }
        }
      }

      const [totalEnrolled, enrolledThisMonth, byAgeGroup] = await Promise.all([
        ctx.prisma.userProfile.count({
          where: {
            healthierSgEnrolled: true,
            ...clinicFilter,
          },
        }),
        ctx.prisma.userProfile.count({
          where: {
            healthierSgEnrolled: true,
            healthierSgRegistrationDate: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
            ...clinicFilter,
          },
        }),
        // Age group analysis (simplified)
        ctx.prisma.userProfile.groupBy({
          by: ['healthierSgEnrolled'],
          where: {
            ...clinicFilter,
            dateOfBirth: {
              not: null,
            },
          },
          _count: {
            healthierSgEnrolled: true,
          },
        }),
      ])

      return {
        totalEnrolled,
        enrolledThisMonth,
        enrollmentRate: totalEnrolled > 0 ? Math.round((totalEnrolled / ctx.prisma.userProfile.count()) * 100) : 0,
        // Simplified age group breakdown
        ageGroups: byAgeGroup,
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
   * Update Healthier SG enrollment status
   */
  updateHealthierSgEnrollment: protectedProcedure
    .input(
      z.object({
        enrolled: z.boolean(),
        registrationDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const updatedProfile = await ctx.prisma.userProfile.upsert({
          where: { userId: ctx.session.user.id },
          create: {
            userId: ctx.session.user.id,
            healthierSgEnrolled: input.enrolled,
            healthierSgRegistrationDate: input.enrolled ? input.registrationDate || new Date() : null,
          },
          update: {
            healthierSgEnrolled: input.enrolled,
            healthierSgRegistrationDate: input.enrolled ? input.registrationDate || new Date() : null,
          },
        })

        return updatedProfile
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to update Healthier SG enrollment',
          cause: error,
        })
      }
    }),

  /**
   * Get user dashboard data
   */
  getDashboard: protectedProcedure.query(async ({ ctx }) => {
    try {
      const userId = ctx.session.user.id

      const [upcomingAppointments, recentAppointments, preferredClinic, stats] = await Promise.all([
        // Upcoming appointments
        ctx.prisma.appointment.findMany({
          where: {
            patientId: userId,
            appointmentDate: {
              gte: new Date(),
            },
            status: {
              not: 'CANCELLED',
            },
          },
          select: {
            id: true,
            appointmentDate: true,
            status: true,
            clinic: {
              select: {
                name: true,
                address: true,
              },
            },
            doctor: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            service: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            appointmentDate: 'asc',
          },
          take: 3,
        }),

        // Recent appointments
        ctx.prisma.appointment.findMany({
          where: {
            patientId: userId,
            status: 'COMPLETED',
          },
          select: {
            id: true,
            appointmentDate: true,
            clinic: {
              select: {
                name: true,
              },
            },
            doctor: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            service: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            appointmentDate: 'desc',
          },
          take: 3,
        }),

        // Preferred clinic
        ctx.prisma.userProfile.findUnique({
          where: { userId },
          select: {
            preferredClinicId: true,
            healthierSgEnrolled: true,
          },
        }),

        // Basic stats
        ctx.prisma.userProfile.findUnique({
          where: { userId },
          select: {
            healthierSgEnrolled: true,
            healthierSgRegistrationDate: true,
            preferredClinic: {
              select: {
                id: true,
                name: true,
                address: true,
              },
            },
          },
        }),
      ])

      return {
        upcomingAppointments,
        recentAppointments,
        profile: stats,
        stats: {
          totalAppointments: upcomingAppointments.length + recentAppointments.length,
          isHealthierSgEnrolled: stats?.healthierSgEnrolled || false,
          hasPreferredClinic: !!stats?.preferredClinic,
        },
      }
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch dashboard data',
        cause: error,
      })
    }
  }),

  /**
   * Get user Healthier SG program status and preferences
   */
  getHealthierSGStatus: protectedProcedure
    .input(
      z.object({
        includeHistory: z.boolean().default(false),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const userId = ctx.session.user.id

        const [profile, programParticipation, healthGoals, programHistory] = await Promise.all([
          // User profile with program status
          ctx.prisma.userProfile.findUnique({
            where: { userId },
            select: {
              healthierSgEnrolled: true,
              healthierSgRegistrationDate: true,
              programPreferences: true,
              notificationPreferences: true,
              healthGoals: true,
              currentConditions: true,
              medications: true,
              allergies: true,
            }
          }),

          // Program participation status
          ctx.prisma.userProgramParticipation.findMany({
            where: { userId },
            select: {
              id: true,
              programId: true,
              enrollmentDate: true,
              status: true,
              completionDate: true,
              program: {
                select: {
                  id: true,
                  name: true,
                  category: true,
                  description: true,
                  duration: true,
                  requirements: true,
                }
              }
            }
          }),

          // Health goals from user profile
          ctx.prisma.healthGoal.findMany({
            where: { userId },
            select: {
              id: true,
              goal: true,
              targetValue: true,
              currentValue: true,
              targetDate: true,
              status: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
          }),

          // Program history if requested
          ...(input.includeHistory ? [
            ctx.prisma.userProgramParticipation.findMany({
              where: { userId },
              select: {
                id: true,
                programId: true,
                enrollmentDate: true,
                status: true,
                completionDate: true,
                withdrawalDate: true,
                reason: true,
                program: {
                  select: {
                    id: true,
                    name: true,
                    category: true,
                  }
                }
              },
              orderBy: { enrollmentDate: 'desc' },
            })
          ] : [Promise.resolve([])]),
        ])

        // Calculate program statistics
        const programStats = {
          isEnrolled: profile?.healthierSgEnrolled || false,
          enrollmentDate: profile?.healthierSgRegistrationDate,
          activePrograms: programParticipation.filter(p => p.status === 'ACTIVE').length,
          completedPrograms: programParticipation.filter(p => p.status === 'COMPLETED').length,
          totalPrograms: programParticipation.length,
          enrollmentDuration: profile?.healthierSgRegistrationDate ? 
            Math.floor((new Date().getTime() - profile.healthierSgRegistrationDate.getTime()) / (1000 * 60 * 60 * 24)) : 0,
        }

        return {
          status: programStats,
          profile: {
            enrollmentDate: profile?.healthierSgRegistrationDate,
            preferences: profile?.programPreferences,
            notificationSettings: profile?.notificationPreferences,
            healthGoals: profile?.healthGoals || [],
            currentConditions: profile?.currentConditions || [],
            medications: profile?.medications || [],
            allergies: profile?.allergies || [],
          },
          currentPrograms: programParticipation.filter(p => p.status === 'ACTIVE'),
          healthGoals: input.includeHistory ? healthGoals : healthGoals.slice(0, 5),
          programHistory: input.includeHistory ? programHistory[0] : [],
          recommendations: generateProgramRecommendations(programParticipation, profile),
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to get Healthier SG status',
          cause: error,
        })
      }
    }),

  /**
   * Update user Healthier SG preferences and settings
   */
  updateHealthierSGPreferences: protectedProcedure
    .input(
      z.object({
        preferences: z.object({
          preferredPrograms: z.array(z.string()).optional(),
          preferredClinic: z.string().uuid().optional(),
          preferredDoctors: z.array(z.string().uuid()).optional(),
          language: z.string().optional(),
          communicationMethod: z.enum(['email', 'sms', 'phone', 'app']).optional(),
          reminderSettings: z.object({
            appointmentReminders: z.boolean().default(true),
            medicationReminders: z.boolean().default(true),
            goalTrackingReminders: z.boolean().default(true),
            healthTips: z.boolean().default(true),
          }).optional(),
        }).optional(),
        healthProfile: z.object({
          healthGoals: z.array(z.string()).optional(),
          currentConditions: z.array(z.string()).optional(),
          medications: z.array(z.string()).optional(),
          allergies: z.array(z.string()).optional(),
          emergencyContact: z.object({
            name: z.string(),
            relationship: z.string(),
            phone: z.string(),
            email: z.string().optional(),
          }).optional(),
        }).optional(),
        notificationSettings: z.object({
          programUpdates: z.boolean().default(true),
          appointmentReminders: z.boolean().default(true),
          healthTips: z.boolean().default(true),
          goalAchievements: z.boolean().default(true),
          programMilestones: z.boolean().default(true),
          emergencyAlerts: z.boolean().default(true),
        }).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.session.user.id
        const { preferences, healthProfile, notificationSettings } = input

        const updateData: any = {}

        if (preferences) {
          updateData.programPreferences = preferences
        }

        if (healthProfile) {
          updateData.healthGoals = healthProfile.healthGoals
          updateData.currentConditions = healthProfile.currentConditions
          updateData.medications = healthProfile.medications
          updateData.allergies = healthProfile.allergies
          updateData.emergencyContact = healthProfile.emergencyContact
        }

        if (notificationSettings) {
          updateData.notificationPreferences = notificationSettings
        }

        const updatedProfile = await ctx.prisma.userProfile.upsert({
          where: { userId },
          create: {
            userId,
            ...updateData,
          },
          update: updateData,
        })

        return {
          success: true,
          profile: {
            preferences: updatedProfile.programPreferences,
            healthProfile: {
              healthGoals: updatedProfile.healthGoals,
              currentConditions: updatedProfile.currentConditions,
              medications: updatedProfile.medications,
              allergies: updatedProfile.allergies,
              emergencyContact: updatedProfile.emergencyContact,
            },
            notifications: updatedProfile.notificationPreferences,
          }
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to update Healthier SG preferences',
          cause: error,
        })
      }
    }),

  /**
   * Enroll user in Healthier SG program
   */
  enrollInProgram: protectedProcedure
    .input(
      z.object({
        programId: z.string().uuid(),
        enrollmentData: z.object({
          healthGoals: z.array(z.string()).optional(),
          currentConditions: z.array(z.string()).optional(),
          emergencyContact: z.object({
            name: z.string(),
            relationship: z.string(),
            phone: z.string(),
          }).optional(),
          consentToShare: z.boolean().default(false),
          consentToContact: z.boolean().default(true),
        }).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.session.user.id
        const { programId, enrollmentData } = input

        // Check if user is already enrolled
        const existingParticipation = await ctx.prisma.userProgramParticipation.findUnique({
          where: {
            userId_programId: {
              userId,
              programId,
            }
          }
        })

        if (existingParticipation) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'User is already enrolled in this program',
          })
        }

        // Create program participation record
        const participation = await ctx.prisma.userProgramParticipation.create({
          data: {
            userId,
            programId,
            enrollmentDate: new Date(),
            status: 'ACTIVE',
            enrollmentData: enrollmentData || {},
          },
          include: {
            program: {
              select: {
                name: true,
                category: true,
                description: true,
              }
            }
          }
        })

        // Update user profile if this is the first Healthier SG enrollment
        const userProfile = await ctx.prisma.userProfile.findUnique({
          where: { userId },
          select: { healthierSgEnrolled: true }
        })

        if (!userProfile?.healthierSgEnrolled) {
          await ctx.prisma.userProfile.upsert({
            where: { userId },
            create: {
              userId,
              healthierSgEnrolled: true,
              healthierSgRegistrationDate: new Date(),
              healthGoals: enrollmentData?.healthGoals || [],
              currentConditions: enrollmentData?.currentConditions || [],
              emergencyContact: enrollmentData?.emergencyContact,
            },
            update: {
              healthierSgEnrolled: true,
              healthierSgRegistrationDate: new Date(),
              healthGoals: enrollmentData?.healthGoals || [],
              currentConditions: enrollmentData?.currentConditions || [],
              emergencyContact: enrollmentData?.emergencyContact,
            }
          })
        }

        return {
          success: true,
          enrollment: {
            id: participation.id,
            program: participation.program,
            enrollmentDate: participation.enrollmentDate,
            status: participation.status,
          }
        }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to enroll in program',
          cause: error,
        })
      }
    }),

  /**
   * Withdraw from Healthier SG program
   */
  withdrawFromProgram: protectedProcedure
    .input(
      z.object({
        programId: z.string().uuid(),
        reason: z.string().optional(),
        feedback: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.session.user.id
        const { programId, reason, feedback } = input

        const participation = await ctx.prisma.userProgramParticipation.update({
          where: {
            userId_programId: {
              userId,
              programId,
            }
          },
          data: {
            status: 'WITHDRAWN',
            withdrawalDate: new Date(),
            reason: reason,
            feedback: feedback,
          },
          include: {
            program: {
              select: {
                name: true,
                category: true,
              }
            }
          }
        })

        // Check if user has any other active programs
        const activePrograms = await ctx.prisma.userProgramParticipation.count({
          where: {
            userId,
            status: 'ACTIVE',
          }
        })

        // If no active programs, update main enrollment status
        if (activePrograms === 0) {
          await ctx.prisma.userProfile.update({
            where: { userId },
            data: {
              healthierSgEnrolled: false,
            }
          })
        }

        return {
          success: true,
          withdrawal: {
            program: participation.program,
            withdrawalDate: participation.withdrawalDate,
            reason: participation.reason,
          },
          remainingPrograms: activePrograms,
        }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to withdraw from program',
          cause: error,
        })
      }
    }),

  /**
   * Get user program recommendations based on profile
   */
  getProgramRecommendations: protectedProcedure.query(async ({ ctx }) => {
    try {
      const userId = ctx.session.user.id

      // Get user profile and health data
      const userProfile = await ctx.prisma.userProfile.findUnique({
        where: { userId },
        select: {
          healthGoals: true,
          currentConditions: true,
          medications: true,
          allergies: true,
          age: true,
          gender: true,
        }
      })

      if (!userProfile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User profile not found',
        })
      }

      // Get all available programs
      const programs = await ctx.prisma.healthierSGProgram.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          category: true,
          description: true,
          targetConditions: true,
          healthGoals: true,
          requirements: true,
        }
      })

      // Calculate recommendation scores
      const recommendations = programs.map(program => {
        let score = 0
        const matches: string[] = []

        // Health goals match
        if (userProfile.healthGoals && program.healthGoals) {
          const goalMatches = userProfile.healthGoals.filter(goal => 
            program.healthGoals!.includes(goal)
          )
          score += goalMatches.length * 20
          if (goalMatches.length > 0) {
            matches.push(`Matches your health goals: ${goalMatches.join(', ')}`)
          }
        }

        // Current conditions match
        if (userProfile.currentConditions && program.targetConditions) {
          const conditionMatches = userProfile.currentConditions.filter(condition => 
            program.targetConditions!.includes(condition)
          )
          score += conditionMatches.length * 25
          if (conditionMatches.length > 0) {
            matches.push(`Addresses your conditions: ${conditionMatches.join(', ')}`)
          }
        }

        // Age and gender considerations
        if (userProfile.age) {
          if (userProfile.age >= 40 && program.category === 'PREVENTIVE_CARE') {
            score += 15
            matches.push('Recommended for your age group')
          }
          if (userProfile.age >= 65 && program.category === 'ELDERLY_CARE') {
            score += 20
            matches.push('Specialized for seniors')
          }
        }

        // Medication interactions (simplified)
        if (userProfile.medications && userProfile.medications.length > 0) {
          score += 5 // General medication management
          matches.push('Includes medication management')
        }

        return {
          program,
          recommendationScore: Math.min(score, 100),
          matches,
          priority: score >= 60 ? 'high' : score >= 30 ? 'medium' : 'low',
        }
      })

      // Sort by score and get top recommendations
      const sortedRecommendations = recommendations
        .sort((a, b) => b.recommendationScore - a.recommendationScore)
        .slice(0, 10)

      return {
        recommendations: {
          highPriority: sortedRecommendations.filter(r => r.priority === 'high'),
          mediumPriority: sortedRecommendations.filter(r => r.priority === 'medium'),
          lowPriority: sortedRecommendations.filter(r => r.priority === 'low'),
        },
        profileUsed: {
          healthGoals: userProfile.healthGoals,
          conditions: userProfile.currentConditions,
          age: userProfile.age,
          gender: userProfile.gender,
        }
      }
    } catch (error) {
      if (error instanceof TRPCError) throw error
      throw new TRPCError({
        code: 'INTERNAL_ERROR',
        message: 'Failed to get program recommendations',
        cause: error,
      })
    }
  }),

  /**
   * Track user health goal progress
   */
  trackGoalProgress: protectedProcedure
    .input(
      z.object({
        goalId: z.string().uuid(),
        currentValue: z.number(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.session.user.id
        const { goalId, currentValue, notes } = input

        // Verify goal belongs to user
        const goal = await ctx.prisma.healthGoal.findUnique({
          where: { id: goalId },
          select: { userId: true, targetValue: true, targetDate: true }
        })

        if (!goal || goal.userId !== userId) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Health goal not found',
          })
        }

        // Update goal progress
        const isCompleted = currentValue >= goal.targetValue
        const updatedGoal = await ctx.prisma.healthGoal.update({
          where: { id: goalId },
          data: {
            currentValue,
            status: isCompleted ? 'COMPLETED' : 'IN_PROGRESS',
            ...(isCompleted ? { completionDate: new Date() } : {}),
            progressNotes: notes,
          }
        })

        // Log progress activity
        await ctx.prisma.activityLog.create({
          data: {
            userId,
            activityType: 'GOAL_PROGRESS',
            description: `Updated health goal progress: ${updatedGoal.goal} to ${currentValue}`,
            metadata: { goalId, currentValue, targetValue: goal.targetValue },
          }
        })

        return {
          success: true,
          goal: updatedGoal,
          isCompleted,
        }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to track goal progress',
          cause: error,
        })
      }
    }),
})

/**
 * Generate program recommendations based on user data
 */
function generateProgramRecommendations(participations: any[], profile: any): any[] {
  const recommendations = []

  // If not enrolled, recommend enrollment
  if (!profile?.healthierSgEnrolled) {
    recommendations.push({
      type: 'enrollment',
      priority: 'high',
      title: 'Enroll in Healthier SG',
      description: 'Start your journey to better health with comprehensive program coverage',
      action: 'enroll'
    })
  }

  // If enrolled but no active programs, recommend programs
  if (profile?.healthierSgEnrolled && participations.length === 0) {
    recommendations.push({
      type: 'program_selection',
      priority: 'high',
      title: 'Choose Your Programs',
      description: 'Select health programs that match your goals and conditions',
      action: 'browse_programs'
    })
  }

  // If has health goals but no matching programs
  if (profile?.healthGoals && profile.healthGoals.length > 0) {
    recommendations.push({
      type: 'goal_alignment',
      priority: 'medium',
      title: 'Align Programs with Goals',
      description: 'Find programs that specifically target your health goals',
      action: 'find_programs'
    })
  }

  return recommendations
}