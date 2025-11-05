import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/trpc";
import { TRPCError } from "@trpc/server";

// Input schemas
const DoctorSpecialtyInput = z.object({
  doctorId: z.string(),
  specialty: z.string(),
  subSpecialties: z.array(z.string()).default([]),
  expertiseLevel: z.enum(["BASIC", "INTERMEDIATE", "ADVANCED", "EXPERT", "PIONEER"]).default("BASIC"),
  certificationBody: z.string().optional(),
  mohSpecialtyCode: z.string().optional(),
  mohCategory: z.string().optional(),
});

const ConditionExpertiseInput = z.object({
  doctorSpecialtyId: z.string(),
  conditionName: z.string(),
  conditionCode: z.string().optional(),
  icd10Code: z.string().optional(),
  expertiseLevel: z.enum(["BASIC", "INTERMEDIATE", "ADVANCED", "EXPERT", "PIONEER"]).default("BASIC"),
  confidenceLevel: z.number().min(1).max(5).optional(),
  treatmentApproaches: z.array(z.string()).default([]),
  isRareCondition: z.boolean().default(false),
});

const ProcedureExpertiseInput = z.object({
  doctorSpecialtyId: z.string(),
  procedureName: z.string(),
  procedureCode: z.string().optional(),
  cptCode: z.string().optional(),
  category: z.string(),
  complexityLevel: z.enum(["BASIC", "MODERATE", "COMPLEX", "SPECIALIZED"]).default("BASIC"),
  proficiencyLevel: z.enum(["BASIC", "INTERMEDIATE", "ADVANCED", "EXPERT", "PIONEER"]).default("BASIC"),
  techniquesUsed: z.array(z.string()).default([]),
  equipmentUsed: z.array(z.string()).default([]),
  minimallyInvasive: z.boolean().default(false),
});

const TreatmentPathwayInput = z.object({
  doctorSpecialtyId: z.string(),
  pathwayName: z.string(),
  pathwayType: z.string(),
  conditionGroup: z.string(),
  steps: z.array(z.any()).default([]),
  successRate: z.number().min(0).max(100).optional(),
  complexityScore: z.number().min(1).max(10).default(1),
  requiresMultidisciplinary: z.boolean().default(false),
  evidenceLevel: z.string().optional(),
});

const DoctorExpertiseProfileInput = z.object({
  doctorId: z.string(),
  expertiseSummary: z.string().optional(),
  primaryExpertiseAreas: z.array(z.string()).default([]),
  secondaryExpertiseAreas: z.array(z.string()).default([]),
  handlesComplexCases: z.boolean().default(false),
  handlesRareDiseases: z.boolean().default(false),
  internationalExperience: z.boolean().default(false),
  culturalCompetency: z.boolean().default(false),
  medicalLanguages: z.array(z.string()).default([]),
});

const MedicalTourismProfileInput = z.object({
  doctorId: z.string(),
  internationalQualifications: z.array(z.any()).default([]),
  recognizedByCountries: z.array(z.string()).default([]),
  culturalCompetencyTraining: z.boolean().default(false),
  medicalLanguages: z.array(z.string()).default([]),
  acceptsInternationalInsurance: z.boolean().default(false),
  medicalTourismServices: z.array(z.string()).default([]),
  internationalPatientsServed: z.number().default(0),
});

const SpecialtyMatcherInput = z.object({
  conditionName: z.string(),
  conditionCode: z.string().optional(),
  symptoms: z.array(z.string()).default([]),
  primarySpecialty: z.string(),
  secondarySpecialties: z.array(z.string()).default([]),
  expertiseRequired: z.enum(["BASIC", "INTERMEDIATE", "ADVANCED", "EXPERT", "PIONEER"]).default("INTERMEDIATE"),
  urgencyLevel: z.enum(["ROUTINE", "URGENT", "EMERGENCY", "SAME_DAY"]).default("ROUTINE"),
});

export const medicalExpertiseRouter = createTRPCRouter({
  // Doctor Specialties Management
  createDoctorSpecialty: protectedProcedure
    .input(DoctorSpecialtyInput)
    .mutation(async ({ ctx, input }) => {
      const specialty = await ctx.prisma.doctorSpecialty.create({
        data: {
          doctorId: input.doctorId,
          specialty: input.specialty,
          subSpecialties: input.subSpecialties,
          expertiseLevel: input.expertiseLevel,
          certificationBody: input.certificationBody,
          mohSpecialtyCode: input.mohSpecialtyCode,
          mohCategory: input.mohCategory,
        },
      });
      return specialty;
    }),

  getDoctorSpecialties: publicProcedure
    .input(z.object({ doctorId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.doctorSpecialty.findMany({
        where: { doctorId: input.doctorId, isActive: true },
        include: {
          conditionExpertise: true,
          procedureExpertise: true,
          treatmentPathwaysRel: true,
        },
      });
    }),

  updateDoctorSpecialty: protectedProcedure
    .input(z.object({
      id: z.string(),
      data: z.object({
        subSpecialties: z.array(z.string()).optional(),
        expertiseLevel: z.enum(["BASIC", "INTERMEDIATE", "ADVANCED", "EXPERT", "PIONEER"]).optional(),
        yearsPracticing: z.number().optional(),
        proceduresKnown: z.array(z.string()).optional(),
        conditionsTreated: z.array(z.string()).optional(),
        successRate: z.number().min(0).max(100).optional(),
        patientCount: z.number().optional(),
        complicationRate: z.number().min(0).max(100).optional(),
        patientSatisfaction: z.number().min(1).max(5).optional(),
        teachingRating: z.number().min(1).max(5).optional(),
        researchOutput: z.number().optional(),
        internationalRecognition: z.boolean().optional(),
        latestTrainingDate: z.date().optional(),
        culturalCompetencyTraining: z.boolean().optional(),
        internationalQualifications: z.array(z.string()).optional(),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.doctorSpecialty.update({
        where: { id: input.id },
        data: input.data,
      });
    }),

  // Condition Expertise Management
  createConditionExpertise: protectedProcedure
    .input(ConditionExpertiseInput)
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.conditionExpertise.create({
        data: input,
      });
    }),

  getDoctorConditionExpertise: publicProcedure
    .input(z.object({ doctorId: z.string() }))
    .query(async ({ ctx, input }) => {
      const specialties = await ctx.prisma.doctorSpecialty.findMany({
        where: { doctorId: input.doctorId, isActive: true },
        include: {
          conditionExpertise: {
            include: { doctorSpecialty: true },
          },
        },
      });

      return specialties.flatMap(s => s.conditionExpertise);
    }),

  // Procedure Expertise Management
  createProcedureExpertise: protectedProcedure
    .input(ProcedureExpertiseInput)
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.procedureExpertise.create({
        data: input,
      });
    }),

  getDoctorProcedureExpertise: publicProcedure
    .input(z.object({ doctorId: z.string() }))
    .query(async ({ ctx, input }) => {
      const specialties = await ctx.prisma.doctorSpecialty.findMany({
        where: { doctorId: input.doctorId, isActive: true },
        include: {
          procedureExpertise: {
            include: { doctorSpecialty: true },
          },
        },
      });

      return specialties.flatMap(s => s.procedureExpertise);
    }),

  // Treatment Pathways Management
  createTreatmentPathway: protectedProcedure
    .input(TreatmentPathwayInput)
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.treatmentPathway.create({
        data: input,
      });
    }),

  getDoctorTreatmentPathways: publicProcedure
    .input(z.object({ doctorId: z.string() }))
    .query(async ({ ctx, input }) => {
      const specialties = await ctx.prisma.doctorSpecialty.findMany({
        where: { doctorId: input.doctorId, isActive: true },
        include: {
          treatmentPathwaysRel: true,
        },
      });

      return specialties.flatMap(s => s.treatmentPathwaysRel);
    }),

  // Doctor Expertise Profile Management
  upsertDoctorExpertiseProfile: protectedProcedure
    .input(DoctorExpertiseProfileInput)
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.doctorExpertiseProfile.upsert({
        where: { doctorId: input.doctorId },
        create: input,
        update: input,
      });
    }),

  getDoctorExpertiseProfile: publicProcedure
    .input(z.object({ doctorId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.doctorExpertiseProfile.findUnique({
        where: { doctorId: input.doctorId },
      });
    }),

  // Medical Tourism Profile Management
  upsertMedicalTourismProfile: protectedProcedure
    .input(MedicalTourismProfileInput)
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.medicalTourismProfile.upsert({
        where: { doctorId: input.doctorId },
        create: input,
        update: input,
      });
    }),

  getMedicalTourismProfile: publicProcedure
    .input(z.object({ doctorId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.medicalTourismProfile.findUnique({
        where: { doctorId: input.doctorId },
      });
    }),

  // Specialty Matching System
  createSpecialtyMatcher: protectedProcedure
    .input(SpecialtyMatcherInput)
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.specialtyMatcher.create({
        data: input,
      });
    }),

  findSpecialtyMatches: publicProcedure
    .input(z.object({
      conditionName: z.string(),
      symptoms: z.array(z.string()).default([]),
      urgencyLevel: z.enum(["ROUTINE", "URGENT", "EMERGENCY", "SAME_DAY"]).default("ROUTINE"),
      location: z.string().optional(),
      insuranceCoverage: z.array(z.string()).default([]),
    }))
    .query(async ({ ctx, input }) => {
      // Find matching specialty matchers
      const matchers = await ctx.prisma.specialtyMatcher.findMany({
        where: {
          OR: [
            { conditionName: { contains: input.conditionName, mode: 'insensitive' } },
            { conditionCode: { contains: input.conditionName, mode: 'insensitive' } },
          ],
          urgencyLevel: { lte: input.urgencyLevel }, // Less than or equal to required urgency
        },
        orderBy: { confidenceScore: 'desc' },
      });

      // Find doctors with matching expertise
      const doctorMatches = await Promise.all(
        matchers.map(async (matcher) => {
          const doctors = await ctx.prisma.doctorSpecialty.findMany({
            where: {
              specialty: matcher.primarySpecialty,
              isActive: true,
              isVerified: true,
            },
            include: {
              doctor: {
                include: {
                  clinics: {
                    include: { clinic: true },
                  },
                  expertiseProfile: true,
                  medicalTourismProfile: true,
                },
              },
              conditionExpertise: {
                where: {
                  conditionName: { contains: matcher.conditionName, mode: 'insensitive' },
                },
              },
              procedureExpertise: true,
            },
          });

          return doctors.map(doctor => ({
            matcher,
            doctor,
            matchScore: calculateMatchScore(doctor, matcher, input),
          }));
        })
      );

      // Flatten and sort by match score
      const sortedMatches = doctorMatches
        .flat()
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 10); // Top 10 matches

      return sortedMatches;
    }),

  // Intelligent Doctor Matching
  findBestDoctorsForCondition: publicProcedure
    .input(z.object({
      conditionName: z.string(),
      location: z.string().optional(),
      insuranceType: z.string().optional(),
      language: z.string().optional(),
      urgency: z.enum(["ROUTINE", "URGENT", "EMERGENCY", "SAME_DAY"]).default("ROUTINE"),
      maxResults: z.number().default(10),
    }))
    .query(async ({ ctx, input }) => {
      // Get condition expertise
      const conditionExpertise = await ctx.prisma.conditionExpertise.findMany({
        where: {
          OR: [
            { conditionName: { contains: input.conditionName, mode: 'insensitive' } },
            { conditionCode: { contains: input.conditionName, mode: 'insensitive' } },
            { icd10Code: { contains: input.conditionName, mode: 'insensitive' } },
          ],
          expertiseLevel: { in: ["ADVANCED", "EXPERT", "PIONEER"] },
        },
        include: {
          doctorSpecialty: {
            include: {
              doctor: {
                include: {
                  clinics: {
                    include: { clinic: true },
                  },
                  expertiseProfile: true,
                },
              },
            },
          },
        },
      });

      // Calculate doctor scores
      const doctorScores = await Promise.all(
        conditionExpertise.map(async (expertise) => {
          const doctor = expertise.doctorSpecialty.doctor;
          const score = await calculateDoctorScore(doctor, expertise, input);

          return {
            doctor,
            conditionExpertise: expertise,
            score,
            matchDetails: {
              expertiseLevel: expertise.expertiseLevel,
              successRate: expertise.treatmentSuccessRate,
              patientCount: expertise.patientCount,
              confidenceLevel: expertise.confidenceLevel,
              yearsExperience: expertise.yearsExperience,
            },
          };
        })
      );

      return doctorScores
        .sort((a, b) => b.score - a.score)
        .slice(0, input.maxResults);
    }),

  // Advanced Search and Filtering
  searchDoctorsByExpertise: publicProcedure
    .input(z.object({
      specialties: z.array(z.string()).optional(),
      conditions: z.array(z.string()).optional(),
      procedures: z.array(z.string()).optional(),
      expertiseLevel: z.enum(["BASIC", "INTERMEDIATE", "ADVANCED", "EXPERT", "PIONEER"]).optional(),
      location: z.string().optional(),
      language: z.string().optional(),
      insuranceAccepted: z.array(z.string()).optional(),
      internationalExperience: z.boolean().optional(),
      culturalCompetency: z.boolean().optional(),
      limit: z.number().default(20),
      offset: z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      const where: any = {
        doctor: {
          isActive: true,
          isVerified: true,
        },
      };

      if (input.specialties && input.specialties.length > 0) {
        where.specialty = { in: input.specialties };
      }

      if (input.expertiseLevel) {
        where.expertiseLevel = { gte: input.expertiseLevel };
      }

      const specialties = await ctx.prisma.doctorSpecialty.findMany({
        where,
        include: {
          doctor: {
            include: {
              clinics: {
                include: { clinic: true },
              },
              expertiseProfile: true,
              medicalTourismProfile: true,
            },
          },
          conditionExpertise: input.conditions ? {
            where: {
              conditionName: { in: input.conditions },
            },
          } : true,
          procedureExpertise: input.procedures ? {
            where: {
              procedureName: { in: input.procedures },
            },
          } : true,
        },
        take: input.limit,
        skip: input.offset,
        orderBy: { successRate: 'desc' },
      });

      return specialties;
    }),

  // Verification and Compliance
  verifyDoctorSpecialty: protectedProcedure
    .input(z.object({
      specialtyId: z.string(),
      verificationNotes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.doctorSpecialty.update({
        where: { id: input.specialtyId },
        data: {
          isVerified: true,
          verificationDate: new Date(),
          verificationNotes: input.verificationNotes,
        },
      });
    }),

  getVerificationDashboard: protectedProcedure
    .input(z.object({
      status: z.enum(["PENDING", "VERIFIED", "REJECTED"]).optional(),
    }))
    .query(async ({ ctx, input }) => {
      const where = input.status ? { verificationStatus: input.status } : {};
      
      const pendingVerifications = await ctx.prisma.doctorClinic.findMany({
        where,
        include: {
          doctor: {
            include: {
              specialtiesRel: true,
              certifications: true,
              memberships: true,
            },
          },
          clinic: true,
        },
        orderBy: { verificationDate: 'desc' },
      });

      const specialtyVerifications = await ctx.prisma.doctorSpecialty.findMany({
        where: { isVerified: false },
        include: { doctor: true },
        orderBy: { createdAt: 'desc' },
      });

      return {
        clinicVerifications: pendingVerifications,
        specialtyVerifications,
        totalPending: pendingVerifications.length + specialtyVerifications.length,
      };
    }),

  // Analytics and Reporting
  getExpertiseAnalytics: publicProcedure
    .input(z.object({
      specialty: z.string().optional(),
      timeRange: z.enum(["30d", "90d", "1y"]).default("90d"),
    }))
    .query(async ({ ctx, input }) => {
      const dateFilter = getDateFilter(input.timeRange);
      
      const specialtyStats = await ctx.prisma.doctorSpecialty.groupBy({
        by: ['specialty'],
        where: {
          createdAt: { gte: dateFilter },
        },
        _count: { id: true },
        _avg: {
          successRate: true,
          patientCount: true,
          yearsPracticing: true,
        },
      });

      return {
        specialtyDistribution: specialtyStats,
        totalSpecialties: specialtyStats.length,
        averageSuccessRate: specialtyStats.reduce((sum, s) => sum + (s._avg.successRate || 0), 0) / specialtyStats.length,
        totalDoctors: specialtyStats.reduce((sum, s) => sum + s._count.id, 0),
      };
    }),

  // Bulk Operations
  bulkUpdateSpecialtyMetrics: protectedProcedure
    .input(z.object({
      doctorId: z.string(),
      updates: z.array(z.object({
        specialtyId: z.string(),
        patientCount: z.number().optional(),
        successRate: z.number().min(0).max(100).optional(),
        complicationRate: z.number().min(0).max(100).optional(),
        patientSatisfaction: z.number().min(1).max(5).optional(),
        yearsPracticing: z.number().optional(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      const updates = await Promise.all(
        input.updates.map(update =>
          ctx.prisma.doctorSpecialty.update({
            where: { id: update.specialtyId },
            data: {
              patientCount: update.patientCount,
              successRate: update.successRate,
              complicationRate: update.complicationRate,
              patientSatisfaction: update.patientSatisfaction,
              yearsPracticing: update.yearsPracticing,
              updatedAt: new Date(),
            },
          })
        )
      );

      return { updated: updates.length };
    }),
});

// Helper functions
function calculateMatchScore(doctor: any, matcher: any, input: any): number {
  let score = 0;
  
  // Base score from matcher's confidence
  score += (matcher.confidenceScore || 0) * 10;
  
  // Expertise level bonus
  const expertiseLevels = { BASIC: 1, INTERMEDIATE: 2, ADVANCED: 3, EXPERT: 4, PIONEER: 5 };
  const doctorExpertise = doctor.specialtiesRel?.find((s: any) => s.specialty === matcher.primarySpecialty);
  if (doctorExpertise) {
    score += expertiseLevels[doctorExpertise.expertiseLevel] * 5;
  }
  
  // Success rate bonus
  if (doctorExpertise?.successRate) {
    score += doctorExpertise.successRate * 0.2;
  }
  
  // Experience bonus
  if (doctorExpertise?.yearsPracticing) {
    score += Math.min(doctorExpertise.yearsPracticing * 0.5, 20);
  }
  
  // Patient satisfaction bonus
  if (doctorExpertise?.patientSatisfaction) {
    score += doctorExpertise.patientSatisfaction * 3;
  }
  
  // International experience bonus
  if (input.international && doctor.medicalTourismProfile?.internationalExperience) {
    score += 15;
  }
  
  // Cultural competency bonus
  if (input.culturalCompetency && doctor.medicalTourismProfile?.culturalCompetency) {
    score += 10;
  }
  
  return Math.round(score);
}

async function calculateDoctorScore(doctor: any, expertise: any, input: any): Promise<number> {
  let score = 0;
  
  // Base score from expertise
  score += expertise.confidenceLevel || 0;
  
  // Success rate
  if (expertise.treatmentSuccessRate) {
    score += expertise.treatmentSuccessRate * 0.1;
  }
  
  // Patient count (experience indicator)
  if (expertise.patientCount) {
    score += Math.log(expertise.patientCount + 1) * 2;
  }
  
  // Years of experience
  if (expertise.yearsExperience) {
    score += expertise.yearsExperience * 0.5;
  }
  
  // International experience
  if (input.internationalExperience && doctor.medicalTourismProfile?.internationalExperience) {
    score += 20;
  }
  
  // Cultural competency
  if (input.culturalCompetency && doctor.medicalTourismProfile?.culturalCompetency) {
    score += 15;
  }
  
  // Language match
  if (input.language && doctor.languages?.includes(input.language)) {
    score += 10;
  }
  
  return Math.round(score);
}

function getDateFilter(timeRange: string): Date {
  const now = new Date();
  switch (timeRange) {
    case "30d":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "90d":
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case "1y":
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  }
}