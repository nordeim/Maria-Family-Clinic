import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// ============================================================================
// CONTACT INTEGRATION ADMIN API ROUTE
// Management and analytics endpoints for contact integration
// ============================================================================

/**
 * GET /api/contact-integration/admin
 * Get contact integration analytics and management data
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has admin or staff privileges
    if (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined
    const clinicId = searchParams.get('clinicId')

    // Build date filter
    const dateFilter = startDate || endDate ? {
      createdAt: {
        ...(startDate ? { gte: startDate } : {}),
        ...(endDate ? { lte: endDate } : {}),
      }
    } : {}

    // For staff users, only show data for their clinic
    let clinicFilter = {}
    if (session.user.role === 'STAFF') {
      const userClinic = await prisma.clinic.findFirst({
        where: { userId: session.user.id },
        select: { id: true },
      })
      
      if (userClinic) {
        clinicFilter = { clinicId: userClinic.id }
      }
    } else if (clinicId) {
      clinicFilter = { clinicId }
    }

    // Get integration statistics
    const [
      totalContactForms,
      integrationActivities,
      contactHistoryEntries,
      userPreferences,
      crossSystemMappings,
      recentIntegrations
    ] = await Promise.all([
      // Total contact forms with integration context
      prisma.contactForm.count({
        where: {
          ...dateFilter,
          ...clinicFilter,
        },
      }),

      // Contact integration activities
      prisma.contactIntegrationActivity.count({
        where: {
          ...dateFilter,
          ...(session.user.role === 'STAFF' ? {
            OR: [
              { context: { path: ['clinicId'], equals: clinicFilter.clinicId } },
              { userId: session.user.id },
            ]
          } : {}),
        },
      }),

      // User contact history entries
      prisma.userContactHistory.count({
        where: {
          ...dateFilter,
          ...(session.user.role === 'STAFF' ? { userId: session.user.id } : {}),
        },
      }),

      // User contact preferences statistics
      prisma.userContactPreferences.count(),

      // Cross-system integration mappings
      prisma.contactIntegrationMapping.count({
        where: {
          ...dateFilter,
          ...clinicFilter,
        },
      }),

      // Recent integration activities
      prisma.contactIntegrationActivity.findMany({
        where: {
          ...dateFilter,
          ...(session.user.role === 'STAFF' ? {
            OR: [
              { context: { path: ['clinicId'], equals: clinicFilter.clinicId } },
              { userId: session.user.id },
            ]
          } : {}),
        },
        orderBy: { timestamp: 'desc' },
        take: 20,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
    ])

    // Get integration type breakdown
    const integrationTypeBreakdown = await prisma.contactIntegrationActivity.groupBy({
      by: ['integrationType'],
      where: {
        ...dateFilter,
        ...(session.user.role === 'STAFF' ? {
          OR: [
            { context: { path: ['clinicId'], equals: clinicFilter.clinicId } },
            { userId: session.user.id },
          ]
        } : {}),
      },
      _count: { integrationType: true },
    })

    // Get contact method preferences
    const contactMethodBreakdown = await prisma.userContactPreferences.groupBy({
      by: ['preferredContactMethod'],
      _count: { preferredContactMethod: true },
    })

    // Get clinic-wise integration data
    const clinicIntegrationData = await prisma.contactIntegrationMapping.groupBy({
      by: ['clinicId'],
      where: {
        ...dateFilter,
        clinicId: { not: null },
      },
      _count: { clinicId: true },
      orderBy: { _count: { clinicId: 'desc' } },
      take: 10,
    })

    // Get doctor-wise integration data
    const doctorIntegrationData = await prisma.contactIntegrationMapping.groupBy({
      by: ['doctorId'],
      where: {
        ...dateFilter,
        doctorId: { not: null },
      },
      _count: { doctorId: true },
      orderBy: { _count: { doctorId: 'desc' } },
      take: 10,
    })

    return NextResponse.json({
      summary: {
        totalContactForms,
        integrationActivities,
        contactHistoryEntries,
        userPreferences,
        crossSystemMappings,
        integrationRate: totalContactForms > 0 ? (integrationActivities / totalContactForms) * 100 : 0,
      },
      breakdowns: {
        byIntegrationType: integrationTypeBreakdown.map(item => ({
          type: item.integrationType,
          count: item._count.integrationType,
        })),
        byContactMethod: contactMethodBreakdown.map(item => ({
          method: item.preferredContactMethod,
          count: item._count.preferredContactMethod,
        })),
        byClinic: clinicIntegrationData.map(item => ({
          clinicId: item.clinicId,
          count: item._count.clinicId,
        })),
        byDoctor: doctorIntegrationData.map(item => ({
          doctorId: item.doctorId,
          count: item._count.doctorId,
        })),
      },
      recentIntegrations: recentIntegrations.map(activity => ({
        id: activity.id,
        type: activity.integrationType,
        user: activity.user ? {
          name: `${activity.user.firstName} ${activity.user.lastName}`,
          email: activity.user.email,
        } : null,
        timestamp: activity.timestamp,
        context: activity.context,
      })),
    })
  } catch (error) {
    console.error('Contact integration admin API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contact integration analytics' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/contact-integration/admin
 * Bulk operations on contact integration data
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    const operationSchema = z.object({
      operation: z.enum(['create_mapping', 'update_preferences', 'generate_report']),
      data: z.record(z.any()),
    })

    const { operation, data } = operationSchema.parse(body)

    let result

    switch (operation) {
      case 'create_mapping':
        // Create cross-system integration mapping
        const mappingSchema = z.object({
          contactFormId: z.string().uuid(),
          enquiryId: z.string().uuid().optional(),
          clinicId: z.string().uuid().optional(),
          doctorId: z.string().uuid().optional(),
          serviceId: z.string().uuid().optional(),
          appointmentId: z.string().uuid().optional(),
          healthierSgEnrollmentId: z.string().uuid().optional(),
          userId: z.string().uuid(),
          integrationType: z.string(),
          metadata: z.record(z.any()).optional(),
        })

        const mappingData = mappingSchema.parse(data)
        
        result = await prisma.contactIntegrationMapping.create({
          data: {
            ...mappingData,
            metadata: {
              ...mappingData.metadata,
              createdBy: session.user.id,
              createdAt: new Date().toISOString(),
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        })
        break

      case 'update_preferences':
        // Bulk update user contact preferences
        const preferencesSchema = z.object({
          userIds: z.array(z.string().uuid()),
          updates: z.object({
            doNotDisturb: z.boolean().optional(),
            allowDirectContact: z.boolean().optional(),
            preferredContactMethod: z.string().optional(),
          }),
        })

        const { userIds, updates } = preferencesSchema.parse(data)
        
        const updateResults = await Promise.all(
          userIds.map(userId =>
            prisma.userContactPreferences.updateMany({
              where: { userId },
              data: {
                ...updates,
                updatedAt: new Date(),
              },
            })
          )
        )

        result = {
          updated: updateResults.length,
          users: userIds,
        }
        break

      case 'generate_report':
        // Generate contact integration report
        const reportSchema = z.object({
          startDate: z.string(),
          endDate: z.string(),
          includePersonalData: z.boolean().default(false),
          format: z.enum(['json', 'csv']).default('json'),
        })

        const reportData = reportSchema.parse(data)
        const start = new Date(reportData.startDate)
        const end = new Date(reportData.endDate)

        // Get integration data for report
        const reportData_ = await prisma.contactIntegrationActivity.findMany({
          where: {
            timestamp: {
              gte: start,
              lte: end,
            },
          },
          include: {
            user: {
              select: {
                firstName: reportData.includePersonalData,
                lastName: reportData.includePersonalData,
                email: reportData.includePersonalData,
                id: true,
              },
            },
          },
        })

        result = {
          period: { start, end },
          totalActivities: reportData_.length,
          data: reportData_,
        }
        break

      default:
        return NextResponse.json(
          { error: 'Invalid operation' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      operation,
      result,
    })
  } catch (error) {
    console.error('Contact integration admin operation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to perform operation' },
      { status: 500 }
    )
  }
}