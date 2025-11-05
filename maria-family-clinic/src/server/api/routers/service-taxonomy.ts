import { z } from 'zod'
import { createTRPCRouter, publicProcedure, protectedProcedure, staffProcedure, calculatePagination } from '../trpc'
import { TRPCError } from '@trpc/server'
import { Prisma } from '@prisma/client'
import { 
  ServiceComplexity, 
  UrgencyLevel, 
  AlternativeType,
  ServiceRelationshipType,
  PrerequisiteType,
  SynonymType,
  AvailabilityStatus,
  HTPriority,
  ChasTier,
  SubsidyType,
  ChecklistPriority,
  EquipmentType,
  OutcomeType,
  RiskLevel,
  ClinicServiceStatus,
  EnquiryType,
  Priority,
  EnquiryStatus,
  PackageType,
  ReferralType,
  ReferralUrgency,
  ReferralStatus,
  ReferralDocumentType,
  DocumentAccessLevel,
  ExpertiseLevel,
  CertificationType,
  PackageBookingStatus
} from '@prisma/client'

const serviceTaxonomySelect = {
  id: true,
  name: true,
  description: true,
  category: true,
  subcategory: true,
  mohCode: true,
  typicalDurationMin: true,
  complexityLevel: true,
  urgencyLevel: true,
  basePrice: true,
  isHealthierSGCovered: true,
  medicalDescription: true,
  patientFriendlyDesc: true,
  synonyms: true,
  searchTerms: true,
  commonSearchPhrases: true,
  isActive: true,
  sortOrder: true,
  tags: true,
  createdAt: true,
  updatedAt: true,
  // Relationships
  clinics: {
    select: {
      id: true,
      name: true,
      address: true,
      price: true,
      isAvailable: true,
    },
    take: 3, // Limit for overview
  },
  alternatives: {
    select: {
      alternativeService: {
        select: {
          id: true,
          name: true,
          category: true,
          basePrice: true,
        },
      },
      relationshipType: true,
      similarityScore: true,
    },
  },
  prerequisites: {
    select: {
      prerequisiteService: {
        select: {
          id: true,
          name: true,
          typicalDurationMin: true,
        },
      },
      prerequisiteType: true,
      description: true,
      timeFrameMin: true,
    },
  },
  relationships: {
    select: {
      relatedService: {
        select: {
          id: true,
          name: true,
          category: true,
          typicalDurationMin: true,
        },
      },
      relationshipType: true,
      strength: true,
      description: true,
    },
  },
  searchIndex: {
    select: {
      searchKeywords: true,
      searchBoost: true,
      popularityScore: true,
    },
  },
}

/**
 * Service Taxonomy Router - Comprehensive healthcare service management
 * Handles hierarchical taxonomy, relationships, search optimization, and pricing
 */
export const serviceTaxonomyRouter = createTRPCRouter({
  /**
   * Get comprehensive service taxonomy with hierarchical structure
   */
  getServiceCategories: publicProcedure
    .input(
      z.object({
        parentId: z.string().optional(),
        includeInactive: z.boolean().default(false),
        includeStats: z.boolean().default(true),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const where: Prisma.ServiceCategoryWhereInput = {
          ...(input.parentId ? { parentId: input.parentId } : { parentId: null }),
          ...(input.includeInactive ? {} : { isActive: true }),
        }

        // Get categories with hierarchical structure
        const categories = await ctx.prisma.serviceCategory.findMany({
          where,
          select: {
            id: true,
            name: true,
            displayName: true,
            description: true,
            parentId: true,
            level: true,
            sortOrder: true,
            mohCodePrefix: true,
            mohCategoryName: true,
            htCategory: true,
            htPriority: true,
            healthierSGCategory: true,
            healthierSGLevel: true,
            translations: true,
            isActive: true,
            isSubsidized: true,
            priorityLevel: true,
            serviceCount: true,
            averagePrice: true,
            children: {
              select: {
                id: true,
                name: true,
                displayName: true,
                description: true,
                serviceCount: true,
              },
              orderBy: { sortOrder: 'asc' },
            },
          },
          orderBy: [
            { level: 'asc' },
            { sortOrder: 'asc' },
            { displayName: 'asc' },
          ],
        })

        if (input.includeStats) {
          // Update category statistics
          for (const category of categories) {
            const stats = await ctx.prisma.service.aggregate({
              where: {
                categoryId: category.id,
                isActive: true,
              },
              _count: { _all: true },
              _avg: { basePrice: true },
            })

            await ctx.prisma.serviceCategory.update({
              where: { id: category.id },
              data: {
                serviceCount: stats._count._all,
                averagePrice: stats._avg.basePrice,
              },
            })
          }
        }

        return categories
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch service categories',
          cause: error,
        })
      }
    }),

  /**
   * Get services by category with hierarchical support
   */
  getServicesByCategory: publicProcedure
    .input(
      z.object({
        categoryId: z.string(),
        subcategory: z.string().optional(),
        includeInactive: z.boolean().default(false),
        includeRelated: z.boolean().default(false),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        // Verify category exists
        const category = await ctx.prisma.serviceCategory.findUnique({
          where: { id: input.categoryId },
          include: {
            children: {
              select: {
                id: true,
                name: true,
                serviceCount: true,
              },
            },
          },
        })

        if (!category) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Category not found',
          })
        }

        const where: Prisma.ServiceWhereInput = {
          categoryId: input.categoryId,
          ...(input.subcategory && { subcategory: input.subcategory }),
          ...(input.includeInactive ? {} : { isActive: true }),
        }

        const services = await ctx.prisma.service.findMany({
          where,
          select: serviceTaxonomySelect,
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        })

        // Get subcategories with service counts
        const subcategories = await ctx.prisma.service.groupBy({
          by: ['subcategory'],
          where: {
            categoryId: input.categoryId,
            ...(input.includeInactive ? {} : { isActive: true }),
            ...(input.subcategory ? { subcategory: input.subcategory } : {}),
          },
          _count: { subcategory: true },
        })

        return {
          category,
          services,
          subcategories: subcategories.map(sub => ({
            subcategory: sub.subcategory,
            serviceCount: sub._count.subcategory,
          })),
        }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch services by category',
          cause: error,
        })
      }
    }),

  /**
   * Advanced service search with fuzzy matching and taxonomy-aware results
   */
  searchServices: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
        categoryId: z.string().optional(),
        subcategory: z.string().optional(),
        complexityLevel: z.nativeEnum(ServiceComplexity).optional(),
        urgencyLevel: z.nativeEnum(UrgencyLevel).optional(),
        priceRange: z.object({
          min: z.number().min(0).optional(),
          max: z.number().min(0).optional(),
        }).optional(),
        isHealthierSGCovered: z.boolean().optional(),
        limit: z.number().min(1).max(50).default(10),
        offset: z.number().min(0).default(0),
        sortBy: z.enum(['relevance', 'name', 'price', 'duration', 'complexity']).default('relevance'),
      })
    )
    .query(async ({ ctx, input }) => {
      const { query, limit, offset, sortBy } = input

      try {
        // Build search query with multiple fields
        const searchConditions = [
          // Direct name match (highest priority)
          { name: { contains: query, mode: 'insensitive' } },
          // Synonyms and search terms
          { synonyms: { has: query.toLowerCase() } },
          { searchTerms: { has: query.toLowerCase() } },
          { commonSearchPhrases: { has: query.toLowerCase() } },
          // Search index
          { searchIndex: { 
            is: { 
              OR: [
                { searchableName: { contains: query, mode: 'insensitive' } },
                { searchableDesc: { contains: query, mode: 'insensitive' } },
                { searchKeywords: { has: query.toLowerCase() } },
                { searchPhrases: { has: query.toLowerCase() } },
              ]
            }
          }},
          // Description and medical terms
          { description: { contains: query, mode: 'insensitive' } },
          { medicalDescription: { contains: query, mode: 'insensitive' } },
        ]

        // Build where clause
        const where: Prisma.ServiceWhereInput = {
          isActive: true,
          OR: searchConditions,
          ...(input.categoryId && { categoryId: input.categoryId }),
          ...(input.subcategory && { subcategory: input.subcategory }),
          ...(input.complexityLevel && { complexityLevel: input.complexityLevel }),
          ...(input.urgencyLevel && { urgencyLevel: input.urgencyLevel }),
          ...(input.isHealthierSGCovered !== undefined && { isHealthierSGCovered: input.isHealthierSGCovered }),
          ...(input.priceRange && {
            AND: [
              ...(input.priceRange.min !== undefined ? [{ basePrice: { gte: input.priceRange.min } }] : []),
              ...(input.priceRange.max !== undefined ? [{ basePrice: { lte: input.priceRange.max } }] : []),
            ],
          }),
        }

        // Sort order based on relevance or other criteria
        let orderBy: Prisma.ServiceOrderByWithRelationInput = {}
        if (sortBy === 'relevance') {
          // Use search boost and popularity for relevance sorting
          orderBy = [
            { searchIndex: { popularityScore: 'desc' } },
            { searchIndex: { searchBoost: 'desc' } },
            { sortOrder: 'asc' },
            { name: 'asc' },
          ]
        } else if (sortBy === 'price') {
          orderBy = { basePrice: 'asc' }
        } else if (sortBy === 'duration') {
          orderBy = { typicalDurationMin: 'asc' }
        } else if (sortBy === 'complexity') {
          orderBy = { complexityLevel: 'asc' }
        } else {
          orderBy = { name: 'asc' }
        }

        const [services, total] = await Promise.all([
          ctx.prisma.service.findMany({
            where,
            select: {
              ...serviceTaxonomySelect,
              category: {
                select: {
                  id: true,
                  name: true,
                  displayName: true,
                  mohCodePrefix: true,
                },
              },
            },
            skip: offset,
            take: limit,
            orderBy,
          }),
          ctx.prisma.service.count({ where }),
        ])

        // Calculate search scores for better ranking
        const servicesWithScores = services.map(service => {
          let score = 0
          
          // Exact name match bonus
          if (service.name.toLowerCase() === query.toLowerCase()) score += 100
          else if (service.name.toLowerCase().includes(query.toLowerCase())) score += 50
          
          // Synonym match bonus
          const synonymMatch = service.synonyms?.some(syn => 
            syn.toLowerCase().includes(query.toLowerCase())
          )
          if (synonymMatch) score += 30
          
          // Search term match bonus
          const searchTermMatch = service.searchTerms?.some(term => 
            term.toLowerCase().includes(query.toLowerCase())
          )
          if (searchTermMatch) score += 20
          
          // Category-specific boost
          if (service.category?.id === input.categoryId) score += 10
          
          return { ...service, searchScore: score }
        })

        // Re-sort by search score if relevance sorting
        if (sortBy === 'relevance') {
          servicesWithScores.sort((a, b) => b.searchScore - a.searchScore)
        }

        return {
          data: servicesWithScores,
          pagination: calculatePagination(Math.floor(offset / limit) + 1, limit, total),
          query,
          total,
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Service search failed',
          cause: error,
        })
      }
    }),

  /**
   * Get service details with comprehensive information
   */
  getServiceDetails: publicProcedure
    .input(
      z.object({
        id: z.string(),
        includeRelated: z.boolean().default(true),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const service = await ctx.prisma.service.findUnique({
          where: { id: input.id },
          select: {
            ...serviceTaxonomySelect,
            category: {
              select: {
                id: true,
                name: true,
                displayName: true,
                mohCodePrefix: true,
                mohCategoryName: true,
                htCategory: true,
                htPriority: true,
                healthierSGCategory: true,
                healthierSGLevel: true,
              },
            },
            pricingStructure: {
              select: {
                basePrice: true,
                medisaveCovered: true,
                medishieldCovered: true,
                chasCovered: true,
                subsidyAmount: true,
                subsidyPercentage: true,
              },
            },
            mohMapping: {
              select: {
                mohCategoryName: true,
                htCategory: true,
                healthierSGCategory: true,
                chasCategory: true,
              },
            },
          },
        })

        if (!service) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Service not found',
          })
        }

        // Get related services if requested
        let relatedServices = []
        if (input.includeRelated) {
          const [alternatives, prerequisites, relationships] = await Promise.all([
            ctx.prisma.serviceAlternative.findMany({
              where: {
                OR: [
                  { primaryServiceId: input.id },
                  { alternativeServiceId: input.id },
                ],
              },
              select: {
                primaryService: {
                  select: {
                    id: true,
                    name: true,
                    category: true,
                    basePrice: true,
                  },
                },
                alternativeService: {
                  select: {
                    id: true,
                    name: true,
                    category: true,
                    basePrice: true,
                  },
                },
                relationshipType: true,
                similarityScore: true,
              },
            }),
            ctx.prisma.servicePrerequisite.findMany({
              where: { serviceId: input.id },
              select: {
                prerequisiteService: {
                  select: {
                    id: true,
                    name: true,
                    typicalDurationMin: true,
                    basePrice: true,
                  },
                },
                prerequisiteType: true,
                description: true,
              },
            }),
            ctx.prisma.serviceRelationship.findMany({
              where: {
                OR: [
                  { primaryServiceId: input.id },
                  { relatedServiceId: input.id },
                ],
              },
              select: {
                primaryService: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                relatedService: {
                  select: {
                    id: true,
                    name: true,
                    category: true,
                    basePrice: true,
                  },
                },
                relationshipType: true,
                strength: true,
              },
            }),
          ])

          relatedServices = {
            alternatives,
            prerequisites,
            relationships,
          }
        }

        return {
          ...service,
          relatedServices,
        }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch service details',
          cause: error,
        })
      }
    }),

  /**
   * Get service categories with statistics
   */
  getCategories: publicProcedure
    .input(
      z.object({
        includeStats: z.boolean().default(true),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const categories = await ctx.prisma.serviceCategory.findMany({
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            displayName: true,
            description: true,
            parentId: true,
            level: true,
            mohCodePrefix: true,
            mohCategoryName: true,
            htCategory: true,
            htPriority: true,
            healthierSGCategory: true,
            healthierSGLevel: true,
            isSubsidized: true,
            priorityLevel: true,
            serviceCount: true,
            averagePrice: true,
          },
          orderBy: [
            { level: 'asc' },
            { sortOrder: 'asc' },
            { displayName: 'asc' },
          ],
        })

        return categories
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch categories',
          cause: error,
        })
      }
    }),

  /**
   * Get service recommendations based on patient's needs
   */
  getRecommendations: publicProcedure
    .input(
      z.object({
        symptoms: z.array(z.string()).default([]),
        age: z.number().optional(),
        gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
        budget: z.object({
          min: z.number().min(0).optional(),
          max: z.number().min(0).optional(),
        }).optional(),
        urgency: z.nativeEnum(UrgencyLevel).optional(),
        limit: z.number().min(1).max(10).default(5),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        // Build search conditions based on symptoms
        const symptomConditions = input.symptoms.flatMap(symptom => [
          { description: { contains: symptom, mode: 'insensitive' } },
          { medicalDescription: { contains: symptom, mode: 'insensitive' } },
          { searchTerms: { has: symptom.toLowerCase() } },
          { tags: { has: symptom.toLowerCase() } },
        ])

        let where: Prisma.ServiceWhereInput = {
          isActive: true,
          OR: symptomConditions.length > 0 ? symptomConditions : [
            { name: { contains: 'consultation', mode: 'insensitive' } }
          ],
          ...(input.age && {
            AND: [
              // Simplified age filtering - in real implementation would be more sophisticated
              { ageRequirements: { equals: {} } },
            ],
          }),
          ...(input.gender && {
            OR: [
              { genderRequirements: { equals: [] } },
              { genderRequirements: { has: input.gender } },
            ],
          }),
          ...(input.urgency && { urgencyLevel: input.urgency }),
          ...(input.budget && {
            AND: [
              ...(input.budget.min !== undefined ? [{ basePrice: { gte: input.budget.min } }] : []),
              ...(input.budget.max !== undefined ? [{ basePrice: { lte: input.budget.max } }] : []),
            ],
          }),
        }

        const services = await ctx.prisma.service.findMany({
          where,
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            subcategory: true,
            basePrice: true,
            isHealthierSGCovered: true,
            complexityLevel: true,
            urgencyLevel: true,
            typicalDurationMin: true,
            synonyms: true,
            searchTerms: true,
          },
          take: input.limit,
          orderBy: [
            { searchIndex: { popularityScore: 'desc' } },
            { basePrice: 'asc' },
          ],
        })

        return services
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to get service recommendations',
          cause: error,
        })
      }
    }),

  /**
   * Create new service (admin/staff only)
   */
  create: staffProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string(),
        category: z.nativeEnum(ServiceCategory),
        subcategory: z.string().optional(),
        mohCode: z.string().optional(),
        typicalDurationMin: z.number().min(1).optional(),
        complexityLevel: z.nativeEnum(ServiceComplexity),
        urgencyLevel: z.nativeEnum(UrgencyLevel).default(UrgencyLevel.ROUTINE),
        basePrice: z.number().min(0),
        isHealthierSGCovered: z.boolean().default(false),
        medicalDescription: z.string().optional(),
        patientFriendlyDesc: z.string().optional(),
        synonyms: z.array(z.string()).default([]),
        searchTerms: z.array(z.string()).default([]),
        tags: z.array(z.string()).default([]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const service = await ctx.prisma.service.create({
          data: {
            ...input,
            specialtyArea: input.subcategory,
            priceRangeMin: input.basePrice * 0.8,
            priceRangeMax: input.basePrice * 1.2,
            currency: 'SGD',
            isSubsidized: input.isHealthierSGCovered,
            healthierSGServices: [],
            medisaveCoverage: input.isHealthierSGCovered ? { covered: true } : {},
            medishieldCoverage: input.isHealthierSGCovered ? { covered: true } : {},
            insuranceCoverage: input.isHealthierSGCovered ? { covered: true } : {},
            processSteps: [],
            preparationSteps: [],
            postCareInstructions: [],
            successRates: {},
            riskFactors: [],
            prerequisites: [],
            ageRequirements: {},
            genderRequirements: [],
            translations: {},
            terminology: {},
            commonQuestions: [],
            icd10Codes: [],
            cptCodes: [],
            isActive: true,
            sortOrder: 0,
            priorityLevel: 1,
            viewCount: 0,
            bookingCount: 0,
          },
          select: serviceTaxonomySelect,
        })

        // Create search index
        await ctx.prisma.serviceSearchIndex.create({
          data: {
            serviceId: service.id,
            searchableName: service.name,
            searchableDesc: service.description || '',
            searchKeywords: input.searchTerms,
            medicalTerms: input.searchTerms,
            anatomyTerms: [],
            conditionTerms: [],
            procedureTerms: input.searchTerms,
            searchPhrases: input.synonyms,
            searchTranslations: {},
            searchBoost: 1.0,
            popularityScore: 0.0,
          },
        })

        return service
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to create service',
          cause: error,
        })
      }
    }),

  /**
   * Update service (admin/staff only)
   */
  update: staffProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        category: z.nativeEnum(ServiceCategory).optional(),
        subcategory: z.string().optional(),
        mohCode: z.string().optional(),
        typicalDurationMin: z.number().min(1).optional(),
        complexityLevel: z.nativeEnum(ServiceComplexity).optional(),
        urgencyLevel: z.nativeEnum(UrgencyLevel).optional(),
        basePrice: z.number().min(0).optional(),
        isHealthierSGCovered: z.boolean().optional(),
        medicalDescription: z.string().optional(),
        patientFriendlyDesc: z.string().optional(),
        synonyms: z.array(z.string()).optional(),
        searchTerms: z.array(z.string()).optional(),
        tags: z.array(z.string()).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      try {
        const service = await ctx.prisma.service.update({
          where: { id },
          data: {
            ...updateData,
            ...(updateData.basePrice && {
              priceRangeMin: updateData.basePrice * 0.8,
              priceRangeMax: updateData.basePrice * 1.2,
            }),
          },
          select: serviceTaxonomySelect,
        })

        // Update search index if relevant fields changed
        if (updateData.name || updateData.description || updateData.searchTerms) {
          await ctx.prisma.serviceSearchIndex.update({
            where: { serviceId: id },
            data: {
              ...(updateData.name && { searchableName: updateData.name }),
              ...(updateData.description && { searchableDesc: updateData.description }),
              ...(updateData.searchTerms && { searchKeywords: updateData.searchTerms }),
            },
          })
        }

        return service
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Service not found',
            })
          }
        }

        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to update service',
          cause: error,
        })
      }
    }),

  /**
   * Get comprehensive service statistics (admin/staff only)
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      const [totalServices, servicesByCategory, healthierSGStats, complexityStats, availabilityStats, mohMappingStats] = await Promise.all([
        ctx.prisma.service.count({ where: { isActive: true } }),
        ctx.prisma.service.groupBy({
          by: ['categoryId'],
          where: { isActive: true },
          _count: { categoryId: true },
          orderBy: { _count: { categoryId: 'desc' } },
        }),
        ctx.prisma.service.aggregate({
          where: { isActive: true },
          _count: { isHealthierSGCovered: true },
          _avg: { basePrice: true },
        }),
        ctx.prisma.service.groupBy({
          by: ['complexityLevel'],
          where: { isActive: true },
          _count: { complexityLevel: true },
          orderBy: { _count: { complexityLevel: 'desc' } },
        }),
        ctx.prisma.serviceAvailability.groupBy({
          by: ['status'],
          _count: { status: true },
        }),
        ctx.prisma.serviceMOHMapping.groupBy({
          by: ['htPriority'],
          where: { isActive: true },
          _count: { htPriority: true },
        }),
      ])

      const healthierSGCount = await ctx.prisma.service.count({
        where: { isActive: true, isHealthierSGCovered: true },
      })

      // Calculate pricing statistics
      const pricingStats = await ctx.prisma.service.aggregate({
        where: { isActive: true, basePrice: { not: null } },
        _min: { basePrice: true },
        _max: { basePrice: true },
        _avg: { basePrice: true },
      })

      // Get relationship statistics
      const [alternativeCount, prerequisiteCount, relationshipCount] = await Promise.all([
        ctx.prisma.serviceAlternative.count(),
        ctx.prisma.servicePrerequisite.count(),
        ctx.prisma.serviceRelationship.count(),
      ])

      // Get availability statistics
      const availableCount = await ctx.prisma.serviceAvailability.count({
        where: { status: 'AVAILABLE' },
      })

      return {
        totalServices,
        servicesByCategory: servicesByCategory.map(cat => ({
          categoryId: cat.categoryId,
          count: cat._count.categoryId,
          percentage: ((cat._count.categoryId / totalServices) * 100).toFixed(1),
        })),
        healthierSG: {
          coveredServices: healthierSGCount,
          percentageCovered: ((healthierSGCount / totalServices) * 100).toFixed(1),
          averagePrice: (healthierSGStats._avg.basePrice || 0).toFixed(2),
        },
        complexityDistribution: complexityStats.map(level => ({
          level: level.complexityLevel,
          count: level._count.complexityLevel,
          percentage: ((level._count.complexityLevel / totalServices) * 100).toFixed(1),
        })),
        availabilityStats: {
          totalAvailabilities: availabilityStats.reduce((sum, stat) => sum + stat._count.status, 0),
          availableSlots: availableCount,
          byStatus: availabilityStats.map(stat => ({
            status: stat.status,
            count: stat._count.status,
            percentage: ((stat._count.status / availabilityStats.reduce((sum, s) => sum + s._count.status, 0)) * 100).toFixed(1),
          })),
        },
        pricingStats: {
          minPrice: pricingStats._min.basePrice || 0,
          maxPrice: pricingStats._max.basePrice || 0,
          avgPrice: (pricingStats._avg.basePrice || 0).toFixed(2),
        },
        mohMapping: mohMappingStats.map(mapping => ({
          priority: mapping.htPriority,
          count: mapping._count.htPriority,
        })),
        relationshipStats: {
          alternatives: alternativeCount,
          prerequisites: prerequisiteCount,
          relationships: relationshipCount,
          totalRelationships: alternativeCount + prerequisiteCount + relationshipCount,
        },
        taxonomyCoverage: {
          categoriesCovered: servicesByCategory.length,
          categoriesTotal: await ctx.prisma.serviceCategory.count({ where: { isActive: true } }),
          coveragePercentage: ((servicesByCategory.length / await ctx.prisma.serviceCategory.count({ where: { isActive: true } })) * 100).toFixed(1),
        },
      }
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch service statistics',
        cause: error,
      })
    }
  }),

  /**
   * Get service synonyms and search terms for optimization
   */
  getServiceSynonyms: publicProcedure
    .input(
      z.object({
        serviceId: z.string().optional(),
        categoryId: z.string().optional(),
        term: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        let where: Prisma.ServiceSynonymWhereInput = {}

        if (input.serviceId) {
          where.serviceId = input.serviceId
        } else if (input.term) {
          where.term = { contains: input.term, mode: 'insensitive' }
        }

        if (input.categoryId) {
          where.service = { categoryId: input.categoryId }
        }

        const synonyms = await ctx.prisma.serviceSynonym.findMany({
          where,
          select: {
            id: true,
            term: true,
            termType: true,
            language: true,
            searchBoost: true,
            service: {
              select: {
                id: true,
                name: true,
                category: {
                  select: {
                    id: true,
                    name: true,
                    displayName: true,
                  },
                },
                subcategory: true,
              },
            },
          },
          orderBy: [{ searchBoost: 'desc' }, { term: 'asc' }],
          take: 100,
        })

        return synonyms
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch service synonyms',
          cause: error,
        })
      }
    }),

  /**
   * Get related services (complementary/alternative) for a specific service
   */
  getRelatedServices: publicProcedure
    .input(
      z.object({
        serviceId: z.string(),
        includeAlternatives: z.boolean().default(true),
        includePrerequisites: z.boolean().default(true),
        includeComplementary: z.boolean().default(true),
        limit: z.number().min(1).max(20).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const service = await ctx.prisma.service.findUnique({
          where: { id: input.serviceId },
          select: {
            id: true,
            name: true,
            category: {
              select: {
                id: true,
                name: true,
                displayName: true,
              },
            },
            subcategory: true,
          },
        })

        if (!service) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Service not found',
          })
        }

        const relationships: any = { service }

        // Get alternatives
        if (input.includeAlternatives) {
          const alternatives = await ctx.prisma.serviceAlternative.findMany({
            where: {
              OR: [
                { primaryServiceId: input.serviceId },
                { alternativeServiceId: input.serviceId },
              ],
            },
            select: {
              id: true,
              relationshipType: true,
              similarityScore: true,
              comparisonNotes: true,
              primaryService: {
                select: {
                  id: true,
                  name: true,
                  category: {
                    select: {
                      id: true,
                      name: true,
                      displayName: true,
                    },
                  },
                  basePrice: true,
                  typicalDurationMin: true,
                },
              },
              alternativeService: {
                select: {
                  id: true,
                  name: true,
                  category: {
                    select: {
                      id: true,
                      name: true,
                      displayName: true,
                    },
                  },
                  basePrice: true,
                  typicalDurationMin: true,
                },
              },
            },
            take: input.limit,
            orderBy: { similarityScore: 'desc' },
          })
          relationships.alternatives = alternatives
        }

        // Get complementary services
        if (input.includeComplementary) {
          const complementary = await ctx.prisma.serviceRelationship.findMany({
            where: {
              OR: [
                { primaryServiceId: input.serviceId },
                { relatedServiceId: input.serviceId },
              ],
              relationshipType: 'COMPLEMENTARY',
            },
            select: {
              id: true,
              relationshipType: true,
              strength: true,
              description: true,
              primaryService: {
                select: {
                  id: true,
                  name: true,
                  category: {
                    select: {
                      id: true,
                      name: true,
                      displayName: true,
                    },
                  },
                  basePrice: true,
                },
              },
              relatedService: {
                select: {
                  id: true,
                  name: true,
                  category: {
                    select: {
                      id: true,
                      name: true,
                      displayName: true,
                    },
                  },
                  basePrice: true,
                },
              },
            },
            take: input.limit,
            orderBy: { strength: 'desc' },
          })
          relationships.complementary = complementary
        }

        return relationships
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch related services',
          cause: error,
        })
      }
    }),

  /**
   * Get medical term matching and suggestions for enhanced search
   */
  getMedicalTermSuggestions: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
        limit: z.number().min(1).max(20).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        // Search in medical terms, synonyms, and common search phrases
        const services = await ctx.prisma.service.findMany({
          where: {
            OR: [
              { medicalDescription: { contains: input.query, mode: 'insensitive' } },
              { searchTerms: { has: input.query.toLowerCase() } },
              { commonSearchPhrases: { has: input.query.toLowerCase() } },
              { terminology: { path: ['*'], string_contains: input.query } },
            ],
          },
          select: {
            id: true,
            name: true,
            category: {
              select: {
                id: true,
                name: true,
                displayName: true,
              },
            },
            subcategory: true,
            medicalDescription: true,
            patientFriendlyDesc: true,
            synonyms: true,
            searchTerms: true,
            terminology: true,
            commonQuestions: true,
          },
          take: input.limit,
        })

        const suggestions = services.map(service => {
          const matchedTerms: string[] = []
          
          // Find matching terms
          service.searchTerms?.forEach(term => {
            if (term.toLowerCase().includes(input.query.toLowerCase())) {
              matchedTerms.push(term)
            }
          })
          
          service.synonyms?.forEach(synonym => {
            if (synonym.toLowerCase().includes(input.query.toLowerCase())) {
              matchedTerms.push(synonym)
            }
          })

          return {
            ...service,
            matchedTerms,
            matchScore: matchedTerms.length + (service.name.toLowerCase().includes(input.query.toLowerCase()) ? 2 : 0),
          }
        })

        // Sort by match score
        suggestions.sort((a, b) => b.matchScore - a.matchScore)

        return suggestions
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch medical term suggestions',
          cause: error,
        })
      }
    }),

  /**
   * Get medical term matching and suggestions
   */
  getMedicalTermSuggestions: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
        limit: z.number().min(1).max(20).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        // Search in medical terms, synonyms, and common search phrases
        const services = await ctx.prisma.service.findMany({
          where: {
            OR: [
              { medicalDescription: { contains: input.query, mode: 'insensitive' } },
              { searchTerms: { has: input.query.toLowerCase() } },
              { commonSearchPhrases: { has: input.query.toLowerCase() } },
              { terminology: { path: ['*'], string_contains: input.query } },
            ],
          },
          select: {
            id: true,
            name: true,
            category: true,
            subcategory: true,
            medicalDescription: true,
            patientFriendlyDesc: true,
            synonyms: true,
            searchTerms: true,
            terminology: true,
            commonQuestions: true,
          },
          take: input.limit,
        })

        const suggestions = services.map(service => {
          const matchedTerms: string[] = []
          
          // Find matching terms
          service.searchTerms?.forEach(term => {
            if (term.toLowerCase().includes(input.query.toLowerCase())) {
              matchedTerms.push(term)
            }
          })
          
          service.synonyms?.forEach(synonym => {
            if (synonym.toLowerCase().includes(input.query.toLowerCase())) {
              matchedTerms.push(synonym)
            }
          })

          return {
            ...service,
            matchedTerms,
            matchScore: matchedTerms.length + (service.name.toLowerCase().includes(input.query.toLowerCase()) ? 2 : 0),
          }
        })

        // Sort by match score
        suggestions.sort((a, b) => b.matchScore - a.matchScore)

        return suggestions
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch medical term suggestions',
          cause: error,
        })
      }
    }),

  /**
   * Get service availability by clinic and service
   */
  getServiceAvailability: publicProcedure
    .input(
      z.object({
        serviceId: z.string(),
        clinicId: z.string().optional(),
        date: z.string().datetime().optional(), // ISO date string
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        let where: Prisma.ServiceAvailabilityWhereInput = {
          serviceId: input.serviceId,
          isAvailable: true,
        }

        if (input.clinicId) {
          where.clinicId = input.clinicId
        }

        if (input.date) {
          const targetDate = new Date(input.date)
          where.nextAvailableDate = {
            gte: targetDate,
            lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000), // Next day
          }
        }

        const availabilities = await ctx.prisma.serviceAvailability.findMany({
          where,
          select: {
            id: true,
            clinic: {
              select: {
                id: true,
                name: true,
                address: true,
                phone: true,
              },
            },
            isAvailable: true,
            nextAvailableDate: true,
            estimatedWaitTime: true,
            scheduleSlots: true,
            advanceBookingDays: true,
            minimumBookingLead: true,
            isUrgentAvailable: true,
            isEmergencySlot: true,
            isWalkInAvailable: true,
            dailyCapacity: true,
            weeklyCapacity: true,
            currentBookings: true,
            serviceOperatingHours: true,
            status: true,
          },
          orderBy: [{ nextAvailableDate: 'asc' }],
        })

        return availabilities.map(availability => ({
          ...availability,
          remainingSlots: (availability.dailyCapacity || 0) - availability.currentBookings,
          scheduleSlots: typeof availability.scheduleSlots === 'string' 
            ? JSON.parse(availability.scheduleSlots) 
            : availability.scheduleSlots,
          serviceOperatingHours: typeof availability.serviceOperatingHours === 'string'
            ? JSON.parse(availability.serviceOperatingHours)
            : availability.serviceOperatingHours,
        }))
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch service availability',
          cause: error,
        })
      }
    }),
})