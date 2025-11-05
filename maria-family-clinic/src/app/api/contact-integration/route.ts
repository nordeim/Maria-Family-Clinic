import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { ContactMethod, ContactType, IntegrationType } from '@/lib/types/contact-system'

// ============================================================================
// CONTACT INTEGRATION API ROUTE
// Fast API endpoints for contact integration with existing features
// ============================================================================

/**
 * GET /api/contact-integration
 * Get contact integration context and available options
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const context = {
      clinicId: searchParams.get('clinicId'),
      doctorId: searchParams.get('doctorId'),
      serviceId: searchParams.get('serviceId'),
      appointmentId: searchParams.get('appointmentId'),
      healthierSgEnrollmentId: searchParams.get('healthierSgEnrollmentId'),
    }

    // Remove undefined values
    Object.keys(context).forEach(key => {
      if (!context[key as keyof typeof context]) {
        delete context[key as keyof typeof context]
      }
    })

    // Get user preferences and context
    const [preferences, recentHistory, availableCategories] = await Promise.all([
      prisma.userContactPreferences.findUnique({
        where: { userId: session.user.id },
      }),
      prisma.userContactHistory.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          contactType: true,
          purpose: true,
          status: true,
          resolved: true,
          createdAt: true,
        },
      }),
      prisma.contactCategory.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: 'asc' },
        select: {
          id: true,
          name: true,
          displayName: true,
          description: true,
          department: true,
          requiresAuth: true,
          medicalFields: true,
          hipaaCompliant: true,
        },
      }),
    ])

    // Build available contact points based on context
    const contactPoints: Array<{
      id: string
      type: string
      title: string
      description: string
      categoryId: string
      priority: 'low' | 'normal' | 'high'
      icon: string
      prefillData?: Record<string, any>
    }> = []

    if (context.clinicId) {
      const clinic = await prisma.clinic.findUnique({
        where: { id: context.clinicId },
        select: { name: true, address: true },
      })

      if (clinic) {
        const generalCategory = availableCategories.find(cat => cat.name === 'general') || availableCategories[0]
        contactPoints.push({
          id: `clinic-${context.clinicId}`,
          type: 'clinic_general',
          title: `Contact ${clinic.name}`,
          description: 'General inquiries and information',
          categoryId: generalCategory?.id || '',
          priority: 'normal',
          icon: 'building',
          prefillData: { clinicId: context.clinicId },
        })
      }
    }

    if (context.doctorId) {
      const doctor = await prisma.doctor.findUnique({
        where: { id: context.doctorId },
        select: { 
          firstName: true, 
          lastName: true, 
          specialization: true,
          clinicId: true,
        },
      })

      if (doctor) {
        const consultationCategory = availableCategories.find(cat => cat.name === 'consultation') || availableCategories[0]
        contactPoints.push({
          id: `doctor-${context.doctorId}`,
          type: 'doctor_consultation',
          title: `Dr. ${doctor.firstName} ${doctor.lastName}`,
          description: `${doctor.specialization} consultation questions`,
          categoryId: consultationCategory?.id || '',
          priority: 'high',
          icon: 'user-md',
          prefillData: { 
            doctorId: context.doctorId,
            clinicId: doctor.clinicId,
          },
        })
      }
    }

    if (context.serviceId) {
      const service = await prisma.service.findUnique({
        where: { id: context.serviceId },
        select: { name: true, category: true, description: true },
      })

      if (service) {
        const serviceCategory = availableCategories.find(cat => cat.name === 'service') || availableCategories[0]
        contactPoints.push({
          id: `service-${context.serviceId}`,
          type: 'service_inquiry',
          title: service.name,
          description: 'Questions about this service',
          categoryId: serviceCategory?.id || '',
          priority: 'normal',
          icon: 'stethoscope',
          prefillData: { serviceId: context.serviceId },
        })
      }
    }

    if (context.appointmentId) {
      const appointmentCategory = availableCategories.find(cat => cat.name === 'appointment') || availableCategories[0]
      contactPoints.push({
        id: `appointment-${context.appointmentId}`,
        type: 'appointment_support',
        title: 'Appointment Support',
        description: 'Questions about your appointment',
        categoryId: appointmentCategory?.id || '',
        priority: 'high',
        icon: 'calendar',
        prefillData: { appointmentId: context.appointmentId },
      })
    }

    if (context.healthierSgEnrollmentId) {
      const healthierSgCategory = availableCategories.find(cat => cat.name === 'healthier_sg') || availableCategories[0]
      contactPoints.push({
        id: `healthier-sg-${context.healthierSgEnrollmentId}`,
        type: 'healthier_sg_support',
        title: 'Healthier SG Program',
          description: 'Questions about your Healthier SG enrollment',
        categoryId: healthierSgCategory?.id || '',
        priority: 'high',
        icon: 'heart',
        prefillData: { healthierSgEnrollmentId: context.healthierSgEnrollmentId },
      })
    }

    // Add general contact option
    const generalCategory = availableCategories.find(cat => cat.name === 'general') || availableCategories[0]
    contactPoints.push({
      id: 'general-inquiry',
      type: 'general_inquiry',
      title: 'General Inquiry',
      description: 'Any other questions or concerns',
      categoryId: generalCategory?.id || '',
      priority: 'normal',
      icon: 'help-circle',
    })

    return NextResponse.json({
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
      },
      preferences: preferences || {
        preferredContactMethod: ContactMethod.EMAIL,
        allowDirectContact: true,
        doNotDisturb: false,
      },
      recentHistory,
      availableCategories,
      contactPoints,
      context,
      isContactAllowed: !preferences?.doNotDisturb,
    })
  } catch (error) {
    console.error('Contact integration API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contact integration context' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/contact-integration
 * Submit contact form with integration context
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    const contactSchema = z.object({
      categoryId: z.string().uuid(),
      contactInfo: z.object({
        firstName: z.string().min(1).max(50),
        lastName: z.string().min(1).max(50),
        email: z.string().email(),
        phone: z.string().optional(),
        preferredContactMethod: z.nativeEnum(ContactMethod).default(ContactMethod.EMAIL),
      }),
      formData: z.record(z.any()),
      context: z.object({
        clinicId: z.string().uuid().optional(),
        doctorId: z.string().uuid().optional(),
        serviceId: z.string().uuid().optional(),
        appointmentId: z.string().uuid().optional(),
        healthierSgEnrollmentId: z.string().uuid().optional(),
      }).optional(),
      consent: z.object({
        dataProcessingConsent: z.boolean(),
        marketingConsent: z.boolean().optional(),
        termsAccepted: z.boolean(),
      }),
    })

    const validatedData = contactSchema.parse(body)
    const { categoryId, contactInfo, formData, context, consent } = validatedData

    // Generate reference number
    const today = new Date()
    const dateString = today.toISOString().slice(0, 10).replace(/-/g, '')
    const count = await prisma.contactForm.count({
      where: {
        referenceNumber: { startsWith: `CF${dateString}` },
      },
    })
    const referenceNumber = `CF${dateString}${String(count + 1).padStart(4, '0')}`

    // Create contact form
    const contactForm = await prisma.contactForm.create({
      data: {
        referenceNumber,
        categoryId,
        contactInfo,
        formData,
        consent,
        userId: session.user.id,
        clinicId: context?.clinicId,
        doctorId: context?.doctorId,
        status: 'SUBMITTED',
        priority: 'NORMAL',
        channel: 'WEB_FORM',
        submittedAt: new Date(),
        isActive: true,
      },
    })

    // Create integration mapping if context is provided
    if (context && Object.keys(context).length > 0) {
      await prisma.contactIntegrationMapping.create({
        data: {
          contactFormId: contactForm.id,
          userId: session.user.id,
          clinicId: context.clinicId,
          doctorId: context.doctorId,
          serviceId: context.serviceId,
          appointmentId: context.appointmentId,
          healthierSgEnrollmentId: context.healthierSgEnrollmentId,
          integrationType: IntegrationType.FORM_SUBMISSION,
          metadata: {
            referenceNumber,
            timestamp: new Date().toISOString(),
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })
    }

    // Track activity
    await prisma.contactIntegrationActivity.create({
      data: {
        userId: session.user.id,
        integrationType: IntegrationType.FORM_SUBMISSION,
        context: context || {},
        metadata: {
          referenceNumber,
          categoryId,
          contactMethod: contactInfo.preferredContactMethod,
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date(),
      },
    })

    // Create user contact history entry
    await prisma.userContactHistory.create({
      data: {
        userId: session.user.id,
        contactFormId: contactForm.id,
        contactType: formData.subject?.includes('appointment') ? ContactType.APPOINTMENT_RELATED : ContactType.GENERAL_INQUIRY,
        contactCategory: formData.category || 'general',
        purpose: formData.subject || 'Contact form submission',
        method: contactInfo.preferredContactMethod,
        subject: formData.subject,
        summary: formData.message?.substring(0, 200),
        status: 'ACTIVE',
        resolved: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      referenceNumber,
      message: 'Your inquiry has been submitted successfully. We will get back to you soon.',
      estimatedResponse: '24 hours', // This could be dynamic based on category
    })
  } catch (error) {
    console.error('Contact integration submission error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to submit contact form' },
      { status: 500 }
    )
  }
}