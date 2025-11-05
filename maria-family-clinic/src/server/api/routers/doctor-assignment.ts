import { z } from 'zod'
import { createTRPCRouter, publicProcedure, protectedProcedure, staffProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { Prisma } from '@prisma/client'

/**
 * Input validation schemas
 */
const specialtyMatchSchema = z.object({
  specialty: z.string(),
  requiredExperience: z.number().optional(),
  complexityLevel: z.enum(['SIMPLE', 'MODERATE', 'COMPLEX', 'HIGHLY_COMPLEX']).optional(),
  preferredExpertiseLevel: z.enum(['BASIC', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).optional(),
})

const languagePreferenceSchema = z.object({
  requiredLanguages: z.array(z.string()).default([]),
  preferredLanguages: z.array(z.string()).default([]),
  isMandatory: z.boolean().default(false),
})

const appointmentRequestSchema = z.object({
  patientId: z.string().uuid().optional(),
  serviceId: z.string().uuid().optional(),
  specialty: z.string().optional(),
  preferredLanguages: z.array(z.string()).default([]),
  urgencyLevel: z.enum(['ROUTINE', 'URGENT', 'EMERGENCY']).default('ROUTINE'),
  appointmentDate: z.date().optional(),
  preferredTimeSlot: z.object({
    start: z.string(), // "HH:mm" format
    end: z.string(),   // "HH:mm" format
  }).optional(),
  clinicPreference: z.string().uuid().optional(),
  doctorPreference: z.string().uuid().optional(),
  complexityScore: z.number().min(1).max(10).default(5),
  specialRequirements: z.array(z.string()).default([]),
})

const assignmentResultSchema = z.object({
  doctorId: z.string().uuid(),
  clinicId: z.string().uuid(),
  affiliationId: z.string().uuid(),
  matchScore: z.number(),
  matchReasons: z.array(z.string()),
  availabilityScore: z.number(),
  recommendationRank: z.number(),
  estimatedWaitTime: z.number(), // in hours
  consultationFee: z.number().optional(),
  nextAvailableSlot: z.object({
    date: z.date(),
    startTime: z.string(),
    endTime: z.string(),
  }).optional(),
})

/**
 * Doctor Assignment Router
 * Implements intelligent assignment logic with specialty matching, language preferences, and availability checks
 */
export const doctorAssignmentRouter = createTRPCRouter({
  /**
   * Find the best doctors for an appointment request
   */
  findBestDoctors: publicProcedure
    .input(
      z.object({
        appointmentRequest: appointmentRequestSchema,
        maxResults: z.number().min(1).max(20).default(10),
        includeUnavailable: z.boolean().default(false),
      })
    )
    .query(async ({ ctx, input }) => {
      const { appointmentRequest, maxResults, includeUnavailable } = input

      try {
        // Get service details if provided
        let serviceDetails = null
        if (appointmentRequest.serviceId) {
          serviceDetails = await ctx.prisma.service.findUnique({
            where: { id: appointmentRequest.serviceId },
            include: {
              clinicServices: {
                select: {
                  clinicId: true,
                  isAvailable: true,
                  price: true,
                },
              },
            },
          })
        }

        // Get all active doctors with their affiliations
        const doctors = await ctx.prisma.doctor.findMany({
          where: {
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            specialties: true,
            languages: true,
            qualifications: true,
            experienceYears: true,
            rating: true,
            reviewCount: true,
            consultationFee: true,
            currency: true,
            doctorClinicAffiliations: {
              where: {
                verificationStatus: 'VERIFIED',
              },
              select: {
                id: true,
                clinicId: true,
                role: true,
                capacity: true,
                isPrimary: true,
                clinicSpecializations: true,
                consultationFee: true,
                consultationDuration: true,
                emergencyConsultationFee: true,
                clinicRating: true,
                clinicReviewCount: true,
                appointmentTypes: true,
                walkInAllowed: true,
                advanceBookingDays: z.number().default(7),
                acceptedInsurance: z.array(z.string()).default([]),
                medisaveAccepted: z.boolean().default(false),
                chasAccepted: z.boolean().default(false),
                clinic: {
                  select: {
                    id: true,
                    name: true,
                    address: true,
                    phone: true,
                    operatingHours: true,
                  },
                },
              },
            },
          },
        })

        // Calculate match scores for each doctor
        const doctorMatches = doctors
          .map(doctor => {
            const matches = doctor.doctorClinicAffiliations
              .map(affiliation => {
                const matchResult = calculateDoctorMatch(
                  doctor,
                  affiliation,
                  appointmentRequest,
                  serviceDetails
                )

                return matchResult
              })
              .filter(match => match !== null)
              .sort((a, b) => b!.matchScore - a!.matchScore)

            return {
              doctor,
              matches,
            }
          })
          .filter(result => result.matches.length > 0)

        // Apply business rules and filters
        let filteredResults = doctorMatches
          .map(result => ({
            doctor: result.doctor,
            bestMatch: result.matches[0],
            allMatches: result.matches,
          }))
          .filter(result => {
            // Filter out low-quality matches
            if (result.bestMatch.matchScore < 30) return false
            
            // If not including unavailable doctors, check availability
            if (!includeUnavailable && !result.bestMatch.isAvailable) return false
            
            return true
          })
          .sort((a, b) => b.bestMatch.matchScore - a.bestMatch.matchScore)

        // Apply maximum results limit
        if (filteredResults.length > maxResults) {
          filteredResults = filteredResults.slice(0, maxResults)
        }

        return filteredResults.map((result, index) => ({
          doctor: result.doctor,
          assignment: {
            ...result.bestMatch,
            recommendationRank: index + 1,
          },
          alternativeOptions: result.allMatches.slice(1, 3), // Show next 2 alternatives
        }))
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to find best doctors',
          cause: error,
        })
      }
    }),

  /**
   * Get emergency doctor assignments
   */
  getEmergencyAssignments: publicProcedure
    .input(
      z.object({
        clinicId: z.string().uuid(),
        specialty: z.string().optional(),
        urgencyLevel: z.enum(['URGENT', 'EMERGENCY']).default('URGENT'),
        maxDistance: z.number().default(10), // km
      })
    )
    .query(async ({ ctx, input }) => {
      const { clinicId, specialty, urgencyLevel, maxDistance } = input

      try {
        // Get clinic location for distance calculation
        const clinic = await ctx.prisma.clinic.findUnique({
          where: { id: clinicId },
          select: {
            id: true,
            name: true,
            address: true,
            postalCode: true,
            location: true, // PostGIS point
          },
        })

        if (!clinic) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Clinic not found',
          })
        }

        // Find available doctors for emergency coverage
        const emergencyDoctors = await ctx.prisma.doctor.findMany({
          where: {
            isActive: true,
            ...(specialty && {
              specialties: {
                has: specialty,
              },
            }),
            doctorClinicAffiliations: {
              some: {
                clinicId,
                verificationStatus: 'VERIFIED',
                isActive: true,
              },
            },
          },
          select: {
            id: true,
            name: true,
            specialties: true,
            languages: true,
            experienceYears: true,
            rating: true,
            doctorClinicAffiliations: {
              where: {
                clinicId,
                verificationStatus: 'VERIFIED',
              },
              select: {
                id: true,
                role: true,
                capacity: true,
                isOnCall: true,
                isEmergency: true,
                consultationDuration: z.number().default(30),
                emergencyConsultationFee: z.number().default(0),
                clinic: {
                  select: {
                    id: true,
                    name: true,
                    location: true,
                  },
                },
              },
            },
          },
        })

        // Filter and score emergency doctors
        const scoredDoctors = emergencyDoctors
          .filter(doctor => doctor.doctorClinicAffiliations.length > 0)
          .map(doctor => {
            const affiliation = doctor.doctorClinicAffiliations[0]
            
            // Calculate emergency readiness score
            let readinessScore = 0
            
            // On-call status
            if (affiliation.isOnCall) readinessScore += 50
            
            // Emergency designation
            if (affiliation.isEmergency) readinessScore += 30
            
            // Experience boost
            if (doctor.experienceYears) {
              readinessScore += Math.min(doctor.experienceYears * 2, 20)
            }
            
            // Rating boost
            if (doctor.rating) {
              readinessScore += doctor.rating * 10
            }

            return {
              doctor,
              affiliation,
              readinessScore,
              estimatedResponseTime: urgencyLevel === 'EMERGENCY' ? 30 : 60, // minutes
            }
          })
          .sort((a, b) => b.readinessScore - a.readinessScore)

        return scoredDoctors
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to get emergency assignments',
          cause: error,
        })
      }
    }),

  /**
   * Check doctor availability for specific time slots
   */
  checkAvailability: publicProcedure
    .input(
      z.object({
        doctorId: z.string().uuid(),
        clinicId: z.string().uuid().optional(),
        date: z.date(),
        startTime: z.string(), // "HH:mm"
        endTime: z.string(),   // "HH:mm"
        serviceDuration: z.number().default(30), // minutes
      })
    )
    .query(async ({ ctx, input }) => {
      const { doctorId, clinicId, date, startTime, endTime, serviceDuration } = input

      try {
        // Check if doctor has affiliation with the clinic
        const affiliation = await ctx.prisma.doctorClinic.findFirst({
          where: {
            doctorId,
            ...(clinicId && { clinicId }),
            verificationStatus: 'VERIFIED',
          },
        })

        if (!affiliation) {
          return {
            available: false,
            reason: 'Doctor not affiliated with specified clinic',
          }
        }

        // Check existing appointments
        const conflictingAppointments = await ctx.prisma.appointment.findMany({
          where: {
            doctorId,
            clinicId: affiliation.clinicId,
            appointmentDate: {
              gte: new Date(date.setHours(0, 0, 0, 0)),
              lt: new Date(date.setHours(23, 59, 59, 999)),
            },
            status: {
              notIn: ['CANCELLED', 'COMPLETED'],
            },
          },
          select: {
            id: true,
            appointmentDate: true,
            startTime: true,
            endTime: true,
            service: {
              select: {
                duration: true,
              },
            },
          },
        })

        // Check doctor availability schedules
        const availabilitySchedule = await ctx.prisma.doctorSchedule.findMany({
          where: {
            doctorId,
            doctorClinicId: affiliation.id,
            OR: [
              {
                specificDate: {
                  gte: new Date(date.setHours(0, 0, 0, 0)),
                  lt: new Date(date.setHours(23, 59, 59, 999)),
                },
              },
              {
                dayOfWeek: getDayOfWeek(new Date(date)),
                isRecurring: true,
                isActive: true,
              },
            ],
          },
        })

        // Check for leave
        const doctorLeave = await ctx.prisma.doctorLeave.findFirst({
          where: {
            doctorId,
            startDate: {
              lte: new Date(date.setHours(23, 59, 59, 999)),
            },
            endDate: {
              gte: new Date(date.setHours(0, 0, 0, 0)),
            },
            status: 'APPROVED',
          },
        })

        if (doctorLeave) {
          return {
            available: false,
            reason: 'Doctor on leave',
            leaveDetails: doctorLeave,
          }
        }

        // Calculate availability
        const availableSlots = calculateAvailableSlots(
          startTime,
          endTime,
          conflictingAppointments,
          availabilitySchedule,
          serviceDuration
        )

        return {
          available: availableSlots.length > 0,
          availableSlots,
          conflictingAppointments,
          scheduleInfo: availabilitySchedule,
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to check availability',
          cause: error,
        })
      }
    }),

  /**
   * Assign doctor to appointment
   */
  assignDoctor: protectedProcedure
    .input(
      z.object({
        doctorId: z.string().uuid(),
        clinicId: z.string().uuid(),
        appointmentId: z.string().uuid().optional(),
        appointmentDate: z.date(),
        startTime: z.string(),
        serviceId: z.string().uuid().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify doctor affiliation
        const affiliation = await ctx.prisma.doctorClinic.findFirst({
          where: {
            doctorId: input.doctorId,
            clinicId: input.clinicId,
            verificationStatus: 'VERIFIED',
          },
        })

        if (!affiliation) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Doctor not properly affiliated with clinic',
          })
        }

        // Check availability
        const availability = await checkDoctorAvailability(
          ctx.prisma,
          input.doctorId,
          input.clinicId,
          input.appointmentDate,
          input.startTime,
          30 // 30 minutes default duration
        )

        if (!availability.available) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: `Doctor not available: ${availability.reason}`,
          })
        }

        // Create or update appointment
        const appointment = input.appointmentId
          ? await ctx.prisma.appointment.update({
              where: { id: input.appointmentId },
              data: {
                doctorId: input.doctorId,
                appointmentDate: input.appointmentDate,
                startTime: input.startTime,
                serviceId: input.serviceId,
                notes: input.notes,
              },
            })
          : await ctx.prisma.appointment.create({
              data: {
                doctorId: input.doctorId,
                clinicId: input.clinicId,
                appointmentDate: input.appointmentDate,
                startTime: input.startTime,
                serviceId: input.serviceId,
                status: 'SCHEDULED',
                notes: input.notes,
              },
            })

        return appointment
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to assign doctor',
          cause: error,
        })
      }
    }),

  /**
   * Get assignment analytics and metrics
   */
  getAssignmentMetrics: protectedProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        clinicId: z.string().uuid().optional(),
        specialty: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { startDate, endDate, clinicId, specialty } = input
      const defaultEndDate = endDate || new Date()
      const defaultStartDate = startDate || new Date(defaultEndDate.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days ago

      try {
        const whereClause: Prisma.AppointmentWhereInput = {
          appointmentDate: {
            gte: defaultStartDate,
            lte: defaultEndDate,
          },
          status: {
            not: 'CANCELLED',
          },
          ...(clinicId && { clinicId }),
        }

        // Add specialty filter if provided
        if (specialty) {
          whereClause.doctor = {
            specialties: {
              has: specialty,
            },
          }
        }

        const [
          totalAssignments,
          specialtyDistribution,
          doctorUtilization,
          averageWaitTimes,
          assignmentSuccess,
        ] = await Promise.all([
          // Total assignments
          ctx.prisma.appointment.count({ where: whereClause }),
          
          // Specialty distribution
          ctx.prisma.appointment.groupBy({
            by: ['doctorId'],
            where: whereClause,
            _count: { doctorId: true },
          }).then(async (results) => {
            const doctorIds = results.map(r => r.doctorId)
            const doctors = await ctx.prisma.doctor.findMany({
              where: { id: { in: doctorIds } },
              select: { id: true, specialties: true },
            })
            
            const specialtyCount: Record<string, number> = {}
            doctors.forEach(doctor => {
              doctor.specialties.forEach(spec => {
                specialtyCount[spec] = (specialtyCount[spec] || 0) + 1
              })
            })
            return specialtyCount
          }),
          
          // Doctor utilization
          ctx.prisma.doctor.findMany({
            where: {
              ...(specialty && {
                specialties: { has: specialty },
              }),
              doctorClinicAffiliations: clinicId ? {
                some: { clinicId },
              } : undefined,
            },
            select: {
              id: true,
              name: true,
              rating: true,
              reviewCount: true,
              _count: {
                select: {
                  appointments: {
                    where: whereClause,
                  },
                },
              },
            },
          }).then(doctors => doctors.map(doctor => ({
            ...doctor,
            utilizationRate: calculateUtilizationRate(doctor._count.appointments),
          }))),
          
          // Average wait times (placeholder - would need booking date tracking)
          Promise.resolve({ average: 2.5, median: 2.0 }),
          
          // Assignment success rate
          ctx.prisma.appointment.findMany({
            where: whereClause,
            select: {
              status: true,
              wasCompleted: true,
            },
          }).then(appointments => {
            const completed = appointments.filter(a => a.status === 'COMPLETED' || a.wasCompleted).length
            return {
              successRate: appointments.length > 0 ? (completed / appointments.length) * 100 : 0,
              totalCompleted: completed,
            }
          }),
        ])

        return {
          totalAssignments,
          specialtyDistribution,
          doctorUtilization,
          averageWaitTimes,
          assignmentSuccess,
          period: {
            start: defaultStartDate,
            end: defaultEndDate,
          },
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to get assignment metrics',
          cause: error,
        })
      }
    }),
})

/**
 * Calculate doctor match score for appointment request
 */
function calculateDoctorMatch(
  doctor: any,
  affiliation: any,
  request: any,
  serviceDetails: any
): any | null {
  let matchScore = 0
  const matchReasons: string[] = []

  // Specialty matching
  if (request.specialty && doctor.specialties.includes(request.specialty)) {
    matchScore += 40
    matchReasons.push(`Specialist in ${request.specialty}`)
  }

  // If service provided, check clinic service availability
  if (serviceDetails) {
    const clinicService = serviceDetails.clinicServices.find(
      (cs: any) => cs.clinicId === affiliation.clinicId && cs.isAvailable
    )
    if (!clinicService) {
      return null // Service not available at this clinic
    }
  }

  // Language preferences
  if (request.preferredLanguages.length > 0) {
    const languageMatches = request.preferredLanguages.filter((lang: string) =>
      doctor.languages.includes(lang)
    )
    if (languageMatches.length > 0) {
      matchScore += languageMatches.length * 10
      matchReasons.push(`Speaks ${languageMatches.join(', ')}`)
    }
  }

  // Experience and rating
  if (doctor.experienceYears) {
    matchScore += Math.min(doctor.experienceYears * 2, 20)
    matchReasons.push(`${doctor.experienceYears} years experience`)
  }

  if (doctor.rating) {
    matchScore += doctor.rating * 5
    matchReasons.push(`${doctor.rating} star rating`)
  }

  // Clinic-specific factors
  if (affiliation.isPrimary) {
    matchScore += 15
    matchReasons.push('Primary clinic affiliation')
  }

  if (affiliation.role === 'ATTENDING' && affiliation.capacity === 'FULL_TIME') {
    matchScore += 10
    matchReasons.push('Full-time attending physician')
  }

  // Complexity matching
  if (request.complexityScore >= 8 && doctor.experienceYears >= 10) {
    matchScore += 20
    matchReasons.push('Handles complex cases')
  }

  // Urgency handling
  if (request.urgencyLevel === 'EMERGENCY') {
    if (affiliation.isEmergency || affiliation.isOnCall) {
      matchScore += 25
      matchReasons.push('Emergency coverage available')
    }
  }

  // Calculate availability score (placeholder - would integrate with actual availability)
  const availabilityScore = 75 // Mock availability score

  // Calculate estimated wait time (placeholder)
  const estimatedWaitTime = Math.max(1, 24 - matchScore / 10)

  return {
    doctorId: doctor.id,
    clinicId: affiliation.clinicId,
    affiliationId: affiliation.id,
    matchScore,
    matchReasons,
    availabilityScore,
    isAvailable: true,
    estimatedWaitTime,
    consultationFee: affiliation.consultationFee || doctor.consultationFee,
  }
}

/**
 * Get day of week from date
 */
function getDayOfWeek(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'lowercase' })
}

/**
 * Calculate available time slots
 */
function calculateAvailableSlots(
  startTime: string,
  endTime: string,
  appointments: any[],
  schedules: any[],
  duration: number
): string[] {
  // This is a simplified version - in reality would need more complex logic
  const slots: string[] = []
  const startMinutes = timeToMinutes(startTime)
  const endMinutes = timeToMinutes(endTime)

  for (let time = startMinutes; time <= endMinutes - duration; time += 15) {
    const timeSlot = minutesToTime(time)
    const isAvailable = !appointments.some(apt => {
      const aptStart = timeToMinutes(apt.startTime)
      const aptEnd = timeToMinutes(apt.endTime)
      return time < aptEnd && time + duration > aptStart
    })

    if (isAvailable) {
      slots.push(timeSlot)
    }
  }

  return slots
}

/**
 * Convert time string to minutes
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * Convert minutes to time string
 */
function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

/**
 * Check if doctor is available at specific time
 */
async function checkDoctorAvailability(
  prisma: any,
  doctorId: string,
  clinicId: string,
  date: Date,
  startTime: string,
  duration: number
) {
  // Simplified availability check
  const conflicts = await prisma.appointment.count({
    where: {
      doctorId,
      clinicId,
      appointmentDate: {
        gte: new Date(date.setHours(0, 0, 0, 0)),
        lt: new Date(date.setHours(23, 59, 59, 999)),
      },
      status: {
        notIn: ['CANCELLED', 'COMPLETED'],
      },
    },
  })

  return {
    available: conflicts === 0,
    reason: conflicts > 0 ? 'Time slot conflicts with existing appointments' : undefined,
  }
}

/**
 * Calculate doctor utilization rate
 */
function calculateUtilizationRate(appointmentsCount: number): number {
  // This would be calculated based on available slots vs booked slots
  // Placeholder implementation
  return Math.min((appointmentsCount / 100) * 100, 100)
}