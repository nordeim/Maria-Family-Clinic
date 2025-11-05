import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure, staffProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';

/**
 * Service-Clinic Integration Router
 * Handles all service-clinic integration operations including availability, packages, referrals, etc.
 */
export const serviceClinicIntegrationRouter = createTRPCRouter({
  /**
   * Get clinics that offer a specific service with comprehensive filtering
   */
  getServiceClinics: publicProcedure
    .input(
      z.object({
        serviceId: z.string(),
        filters: z.object({
          distance: z.number().min(0).max(100).optional(),
          rating: z.number().min(0).max(5).optional(),
          openNow: z.boolean().optional(),
          emergency: z.boolean().optional(),
          healthierSG: z.boolean().optional(),
          verified: z.boolean().optional(),
          insurance: z.string().optional(),
          language: z.string().optional(),
          specialization: z.string().optional(),
          priceRange: z.object({
            min: z.number().optional(),
            max: z.number().optional(),
          }).optional(),
        }).optional(),
        pagination: z.object({
          page: z.number().min(1).default(1),
          limit: z.number().min(1).max(50).default(10),
        }).default({ page: 1, limit: 10 }),
        sortBy: z.enum(['rating', 'distance', 'price', 'availability', 'expertise']).default('rating'),
        sortDirection: z.enum(['asc', 'desc']).default('desc'),
        userLocation: z.object({
          latitude: z.number(),
          longitude: z.number(),
        }).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { serviceId, filters, pagination, sortBy, sortDirection, userLocation } = input;
      const { page, limit } = pagination;
      const skip = (page - 1) * limit;

      try {
        // Base query to find clinics offering this service
        const baseWhere: Prisma.ClinicWhereInput = {
          isActive: true,
          services: {
            some: {
              serviceId,
              isAvailable: true,
            },
          },
        };

        // Apply additional filters
        if (filters?.verified !== undefined) {
          baseWhere.isVerified = filters.verified;
        }

        if (filters?.emergency) {
          // This would need a custom field in the schema
          // For now, we'll assume clinics with emergency services
        }

        if (filters?.language) {
          baseWhere.languages = {
            some: {
              language: filters.language,
            },
          };
        }

        if (filters?.insurance) {
          // This would need insurance field in schema
        }

        // Get clinics with service availability data
        const clinics = await ctx.prisma.clinic.findMany({
          where: baseWhere,
          select: {
            id: true,
            name: true,
            address: true,
            postalCode: true,
            phone: true,
            email: true,
            latitude: true,
            longitude: true,
            rating: true,
            reviewCount: true,
            isVerified: true,
            isActive: true,
            operatingHours: true,
            facilities: true,
            accreditationStatus: true,
            establishedYear: true,
            // Service-specific availability
            services: {
              where: { serviceId },
              select: {
                isAvailable: true,
                estimatedDuration: true,
                price: true,
                currency: true,
                isHealthierSGCovered: true,
                healthierSGPrice: true,
              },
            },
            // Languages offered
            languages: {
              select: {
                language: true,
              },
            },
            // Doctor count and specializations
            doctors: {
              select: {
                id: true,
                specialties: true,
              },
            },
            // Reviews
            reviews: {
              select: {
                id: true,
                rating: true,
                isVerified: true,
              },
              take: 5,
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
          skip,
          take: limit,
        });

        // Calculate distance if user location provided
        const clinicsWithDistance = userLocation 
          ? clinics.map(clinic => ({
              ...clinic,
              distance: calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                clinic.latitude,
                clinic.longitude
              ),
            }))
          : clinics;

        // Apply distance filter
        let filteredClinics = clinicsWithDistance;
        if (filters?.distance && userLocation) {
          filteredClinics = clinicsWithDistance.filter(
            clinic => clinic.distance && clinic.distance <= filters.distance!
          );
        }

        // Apply rating filter
        if (filters?.rating) {
          filteredClinics = filteredClinics.filter(
            clinic => clinic.rating && clinic.rating >= filters.rating!
          );
        }

        // Apply sorting
        filteredClinics.sort((a, b) => {
          switch (sortBy) {
            case 'distance':
              const aDistance = a.distance || 999;
              const bDistance = b.distance || 999;
              return sortDirection === 'asc' ? aDistance - bDistance : bDistance - aDistance;
            case 'rating':
              const aRating = a.rating || 0;
              const bRating = b.rating || 0;
              return sortDirection === 'asc' ? aRating - bRating : bRating - aRating;
            case 'price':
              const aPrice = a.services[0]?.price || 999999;
              const bPrice = b.services[0]?.price || 999999;
              return sortDirection === 'asc' ? aPrice - bPrice : bPrice - aPrice;
            default:
              return 0;
          }
        });

        // Get total count for pagination
        const total = await ctx.prisma.clinic.count({ where: baseWhere });

        return {
          data: filteredClinics,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch service clinics',
          cause: error,
        });
      }
    }),

  /**
   * Get real-time availability matrix for a service across multiple clinics
   */
  getServiceAvailabilityMatrix: publicProcedure
    .input(
      z.object({
        serviceId: z.string(),
        clinicIds: z.array(z.string()).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        timeframe: z.enum(['today', 'tomorrow', 'week']).default('today'),
      })
    )
    .query(async ({ ctx, input }) => {
      const { serviceId, clinicIds, startDate, endDate, timeframe } = input;

      try {
        // Calculate date range based on timeframe
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        let dateRange: { start: Date; end: Date };
        switch (timeframe) {
          case 'today':
            dateRange = { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
            break;
          case 'tomorrow':
            const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
            dateRange = { start: tomorrow, end: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000) };
            break;
          case 'week':
            const weekEnd = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
            dateRange = { start: today, end: weekEnd };
            break;
        }

        // Get clinic service availability data
        const whereClause: Prisma.ServiceAvailabilityWhereInput = {
          serviceId,
          ...(clinicIds?.length ? { clinicId: { in: clinicIds } } : {}),
        };

        const availabilityData = await ctx.prisma.serviceAvailability.findMany({
          where: whereClause,
          select: {
            clinicId: true,
            isAvailable: true,
            nextAvailableDate: true,
            estimatedWaitTime: true,
            scheduleSlots: true,
            advanceBookingDays: true,
            isUrgentAvailable: true,
            clinic: {
              select: {
                id: true,
                name: true,
                address: true,
                latitude: true,
                longitude: true,
                rating: true,
                reviewCount: true,
                isOpen: true,
                emergencyServices: true,
                phone: true,
                specializationAreas: true,
              },
            },
          },
        });

        // Process and return availability matrix
        const matrix = availabilityData.map(item => ({
          clinicId: item.clinicId,
          clinicName: item.clinic.name,
          address: item.clinic.address,
          rating: item.clinic.rating,
          reviewCount: item.clinic.reviewCount,
          isOpen: item.clinic.isOpen,
          emergencyServices: item.clinic.emergencyServices,
          phone: item.clinic.phone,
          specializationAreas: item.clinic.specializationAreas,
          availability: {
            isAvailable: item.isAvailable,
            nextAvailableDate: item.nextAvailableDate,
            estimatedWaitTime: item.estimatedWaitTime,
            scheduleSlots: item.scheduleSlots as any[],
            advanceBookingDays: item.advanceBookingDays,
            isUrgentAvailable: item.isUrgentAvailable,
          },
          // Calculate urgency and capacity
          urgency: calculateUrgency(item.nextAvailableDate),
          capacity: calculateCapacity(item.scheduleSlots as any[]),
          availabilityScore: calculateAvailabilityScore(item),
        }));

        return {
          timeframe,
          data: matrix,
          lastUpdated: new Date(),
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch availability matrix',
          cause: error,
        });
      }
    }),

  /**
   * Get service packages and bundles for a service
   */
  getServicePackages: publicProcedure
    .input(
      z.object({
        serviceId: z.string(),
        clinicId: z.string().optional(),
        category: z.enum(['individual', 'combo', 'premium', 'family', 'preventive']).optional(),
        includeInactive: z.boolean().default(false),
      })
    )
    .query(async ({ ctx, input }) => {
      const { serviceId, clinicId, category, includeInactive } = input;

      try {
        // This would require a ServicePackage model in the schema
        // For now, return mock data structure
        const packages = [
          {
            id: 'pkg-1',
            name: 'Complete Health Screening',
            description: 'Comprehensive health check-up with blood tests and specialist consultation',
            category: 'combo',
            clinicId: 'clinic-1',
            clinicName: 'Central Family Clinic',
            services: [
              {
                serviceId: 'svc-1',
                serviceName: 'General Consultation',
                originalPrice: 80,
                duration: 30,
              },
              {
                serviceId: 'svc-2',
                serviceName: 'Blood Test Panel',
                originalPrice: 120,
                duration: 15,
              },
            ],
            packagePrice: 200,
            originalPrice: 200,
            savings: 0,
            savingsPercentage: 0,
            validityPeriod: 30,
            maxBookings: 100,
            currentBookings: 47,
            isHealthierSGCovered: true,
            restrictions: ['Valid for ages 18-65'],
            benefits: ['Priority booking', 'Free follow-up', 'Digital report'],
            includesFollowUps: true,
            priorityBooking: true,
            enhancedCare: true,
            isActive: true,
          },
        ];

        return packages.filter(pkg => {
          if (!includeInactive && !pkg.isActive) return false;
          if (category && pkg.category !== category) return false;
          if (clinicId && pkg.clinicId !== clinicId) return false;
          return true;
        });
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch service packages',
          cause: error,
        });
      }
    }),

  /**
   * Create a service referral
   */
  createServiceReferral: protectedProcedure
    .input(
      z.object({
        referralType: z.enum(['internal', 'external', 'specialist', 'emergency']),
        serviceId: z.string(),
        fromClinicId: z.string(),
        toClinicId: z.string().optional(),
        toDoctorId: z.string().optional(),
        reason: z.string().min(1),
        urgency: z.enum(['routine', 'urgent', 'emergency']),
        symptoms: z.string(),
        previousTreatments: z.string().optional(),
        preferredAppointment: z.date().optional(),
        insuranceInfo: z.object({
          provider: z.string().optional(),
          authorizationRequired: z.boolean().optional(),
        }).optional(),
        patientConsent: z.boolean(),
        shareMedicalRecords: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Create referral record
        const referral = await ctx.prisma.serviceReferral.create({
          data: {
            ...input,
            referredBy: ctx.session.user.id,
            status: 'pending',
            createdAt: new Date(),
          },
        });

        // Log the referral activity
        await ctx.prisma.auditLog.create({
          data: {
            userId: ctx.session.user.id,
            action: 'CREATE_REFERRAL',
            resource: 'service_referral',
            resourceId: referral.id,
            details: {
              serviceId: input.serviceId,
              referralType: input.referralType,
              urgency: input.urgency,
            },
          },
        });

        return referral;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to create referral',
          cause: error,
        });
      }
    }),

  /**
   * Get service expertise indicators for clinics
   */
  getServiceExpertiseIndicators: publicProcedure
    .input(
      z.object({
        serviceId: z.string(),
        clinicIds: z.array(z.string()).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { serviceId, clinicIds } = input;

      try {
        // Get clinics with comprehensive expertise data
        const clinics = await ctx.prisma.clinic.findMany({
          where: {
            ...(clinicIds?.length ? { id: { in: clinicIds } } : {}),
            services: {
              some: {
                serviceId,
              },
            },
          },
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            rating: true,
            reviewCount: true,
            isVerified: true,
            accreditationStatus: true,
            specializationAreas: true,
            establishedYear: true,
            facilities: true,
            // Expertise data (would need ServiceExpertise model)
            serviceExpertise: {
              where: { serviceId },
              select: {
                level: true,
                yearsOfExperience: true,
                caseCount: true,
                successRate: true,
                certifications: true,
                equipment: true,
              },
            },
            // Doctor expertise
            doctors: {
              select: {
                id: true,
                name: true,
                specialties: true,
                experienceYears: true,
                qualifications: true,
                rating: true,
              },
            },
            // Reviews and achievements
            reviews: {
              where: { isVerified: true },
              select: {
                id: true,
                rating: true,
                comment: true,
                createdAt: true,
              },
              orderBy: { createdAt: 'desc' },
              take: 10,
            },
          },
        });

        // Calculate expertise scores for each clinic
        const clinicsWithScores = clinics.map(clinic => {
          const expertise = clinic.serviceExpertise[0];
          
          // Calculate expertise scores
          const expertiseScore = calculateExpertiseScore(clinic, expertise);
          
          return {
            ...clinic,
            expertise,
            expertiseScore,
            achievements: {
              awards: [], // Would come from separate achievements table
              accreditations: [],
              publications: [],
              partnerships: [],
            },
          };
        });

        return clinicsWithScores.sort((a, b) => b.expertiseScore.overall - a.expertiseScore.overall);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch expertise indicators',
          cause: error,
        });
      }
    }),

  /**
   * Book an appointment for a service
   */
  bookServiceAppointment: protectedProcedure
    .input(
      z.object({
        serviceId: z.string(),
        clinicId: z.string(),
        appointmentDate: z.date(),
        symptoms: z.string().optional(),
        notes: z.string().optional(),
        isUrgent: z.boolean().default(false),
        packageId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Validate appointment time is in the future
        if (input.appointmentDate <= new Date()) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Appointment date must be in the future',
          });
        }

        // Check for conflicts
        const conflictingAppointments = await ctx.prisma.appointment.findMany({
          where: {
            clinicId: input.clinicId,
            appointmentDate: {
              gte: input.appointmentDate,
              lt: new Date(input.appointmentDate.getTime() + 60 * 60 * 1000), // 1 hour slot
            },
            status: {
              not: 'CANCELLED',
            },
          },
        });

        if (conflictingAppointments.length > 0) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Selected time slot is no longer available',
          });
        }

        // Create appointment
        const appointment = await ctx.prisma.appointment.create({
          data: {
            clinicId: input.clinicId,
            serviceId: input.serviceId,
            patientId: ctx.session.user.id,
            appointmentDate: input.appointmentDate,
            symptoms: input.symptoms,
            notes: input.notes,
            isUrgent: input.isUrgent,
            status: 'PENDING',
            ...(input.packageId ? { packageId: input.packageId } : {}),
          },
          select: {
            id: true,
            appointmentDate: true,
            status: true,
            clinic: {
              select: {
                name: true,
                address: true,
                phone: true,
              },
            },
            service: {
              select: {
                name: true,
              },
            },
          },
        });

        return appointment;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to book appointment',
          cause: error,
        });
      }
    }),
});

// Helper functions
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function calculateUrgency(nextAvailableDate: Date | null): 'immediate' | 'today' | 'tomorrow' | 'week' | 'later' {
  if (!nextAvailableDate) return 'later';
  
  const now = new Date();
  const timeDiff = nextAvailableDate.getTime() - now.getTime();
  const hoursDiff = timeDiff / (1000 * 60 * 60);
  
  if (hoursDiff <= 2) return 'immediate';
  if (hoursDiff <= 24) return 'today';
  if (hoursDiff <= 48) return 'tomorrow';
  if (hoursDiff <= 168) return 'week';
  return 'later';
}

function calculateCapacity(scheduleSlots: any[]): number {
  if (!scheduleSlots || scheduleSlots.length === 0) return 0;
  
  const availableSlots = scheduleSlots.filter(slot => slot.isAvailable).length;
  return Math.round((availableSlots / scheduleSlots.length) * 100);
}

function calculateAvailabilityScore(availability: any): number {
  let score = 100;
  
  if (!availability.isAvailable) score -= 40;
  if (availability.estimatedWaitTime && availability.estimatedWaitTime > 60) score -= 20;
  if (availability.estimatedWaitTime && availability.estimatedWaitTime > 30) score -= 10;
  
  return Math.max(0, score);
}

function calculateExpertiseScore(clinic: any, expertise: any) {
  if (!expertise) {
    return {
      overall: 50,
      technical: 50,
      experience: 50,
      outcomes: 50,
      patientSatisfaction: 50,
      innovation: 50,
    };
  }

  // Calculate individual scores
  const technical = Math.min(
    (expertise.certifications?.length || 0) * 10 + 
    (expertise.level === 'ADVANCED' ? 20 : 
     expertise.level === 'SPECIALIZED' ? 15 :
     expertise.level === 'EXPERT' ? 10 : 
     expertise.level === 'EXPERIENCED' ? 5 : 0),
    100
  );

  const experience = Math.min(
    Math.min((expertise.yearsOfExperience || 0) / 2, 40) +
    Math.min((expertise.caseCount || 0) / 100, 40) +
    (clinic.doctors?.length > 0 ? 20 : 0),
    100
  );

  const outcomes = Math.min(
    (expertise.successRate || 80) +
    (clinic.reviews?.length || 0) * 2,
    100
  );

  const patientSatisfaction = Math.min(
    (clinic.rating || 0) * 20 +
    Math.log((clinic.reviewCount || 0) + 1) * 2,
    100
  );

  const innovation = Math.min(
    (clinic.facilities?.length || 0) * 5,
    100
  );

  return {
    overall: Math.round((technical + experience + outcomes + patientSatisfaction + innovation) / 5),
    technical: Math.round(technical),
    experience: Math.round(experience),
    outcomes: Math.round(outcomes),
    patientSatisfaction: Math.round(patientSatisfaction),
    innovation: Math.round(innovation),
  };
}