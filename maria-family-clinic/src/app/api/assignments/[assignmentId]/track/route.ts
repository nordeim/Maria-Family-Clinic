import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface AssignmentOutcome {
  appointmentBooked: boolean
  doctorId: string
  clinicId: string
  patientSatisfaction?: number
  waitTime?: number
  resolution: 'success' | 'cancelled' | 'rescheduled' | 'no-show'
  notes?: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  try {
    const { assignmentId } = params
    const outcome: AssignmentOutcome = await request.json()

    // Create assignment tracking record
    // In a real implementation, this would be stored in a dedicated AssignmentTracking table
    // For now, we'll store it in audit logs and create a simple tracking record
    
    const trackingRecord = await prisma.doctorAuditLog.create({
      data: {
        doctorId: outcome.doctorId,
        action: 'ASSIGNMENT_OUTCOME',
        details: JSON.stringify({
          assignmentId,
          outcome,
          timestamp: new Date(),
          resolutionType: outcome.resolution,
          feedback: outcome.notes
        }),
        timestamp: new Date()
      }
    })

    // Update doctor metrics if appointment was successful
    if (outcome.appointmentBooked && outcome.resolution === 'success') {
      // Update doctor's rating based on patient satisfaction
      if (outcome.patientSatisfaction) {
        await prisma.doctor.update({
          where: { id: outcome.doctorId },
          data: {
            rating: {
              // Incrementally update rating (simplified calculation)
              increment: outcome.patientSatisfaction > 4 ? 0.1 : -0.05
            },
            totalAppointments: {
              increment: 1
            },
            updatedAt: new Date()
          }
        })
      }

      // Create or update assignment statistics
      // This would typically be done through triggers or scheduled jobs
      console.log(`Assignment ${assignmentId} completed successfully`)
    }

    // Track performance metrics
    const performanceData = {
      assignmentId,
      doctorId: outcome.doctorId,
      clinicId: outcome.clinicId,
      wasSuccessful: outcome.appointmentBooked,
      resolution: outcome.resolution,
      patientSatisfaction: outcome.patientSatisfaction,
      waitTime: outcome.waitTime,
      timestamp: new Date()
    }

    // In a real implementation, this would be stored in a PerformanceMetrics table
    // For now, we'll log it
    console.log('Assignment performance data:', performanceData)

    // Calculate and update clinic metrics if needed
    if (outcome.appointmentBooked) {
      // This would update clinic's doctor assignment success rate
      // Placeholder implementation
    }

    return NextResponse.json({
      success: true,
      message: 'Assignment outcome tracked successfully',
      trackingId: trackingRecord.id,
      performanceData
    })

  } catch (error) {
    console.error('Assignment tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track assignment outcome' },
      { status: 500 }
    )
  }
}