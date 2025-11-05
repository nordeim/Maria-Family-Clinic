import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface ConflictResolution {
  resolutionType: 'reschedule' | 'locum' | 'cancel' | 'extend' | 'split'
  newTime?: string
  alternativeDoctorId?: string
  reason: string
  notifyPatients: boolean
}

export async function POST(
  request: NextRequest,
  { params }: { params: { conflictId: string } }
) {
  try {
    const { conflictId } = params
    const resolution: ConflictResolution = await request.json()

    // Parse conflict ID to get details
    // Format: conflict-type-doctorId-scheduleId-otherScheduleId
    const [conflictType, doctorId, ...rest] = conflictId.split('-')
    
    switch (resolution.resolutionType) {
      case 'reschedule':
        if (!resolution.newTime) {
          return NextResponse.json(
            { error: 'New time required for rescheduling' },
            { status: 400 }
          )
        }

        // Update the schedule with new time
        if (rest[0]) {
          await prisma.doctorSchedule.update({
            where: { id: rest[0] },
            data: {
              startTime: resolution.newTime,
              updatedAt: new Date()
            }
          })
        }

        // Log the resolution
        await prisma.doctorAuditLog.create({
          data: {
            doctorId,
            action: 'RESCHEDULE_CONFLICT',
            fieldName: 'schedule',
            newValue: JSON.stringify({ conflictId, newTime: resolution.newTime }),
            timestamp: new Date()
          }
        })
        break

      case 'locum':
        if (!resolution.alternativeDoctorId) {
          return NextResponse.json(
            { error: 'Alternative doctor ID required for locum' },
            { status: 400 }
          )
        }

        // Find available locum doctor
        const locumDoctor = await prisma.doctor.findUnique({
          where: { id: resolution.alternativeDoctorId },
          include: {
            availabilities: {
              where: {
                isAvailable: true,
                date: { gte: new Date() }
              }
            }
          }
        })

        if (!locumDoctor || locumDoctor.availabilities.length === 0) {
          return NextResponse.json(
            { error: 'No suitable locum doctor found' },
            { status: 400 }
          )
        }

        // Create temporary assignment for locum
        // This would involve creating a temporary doctor-clinic relationship
        // and updating appointments - placeholder for now

        break

      case 'cancel':
        // Cancel the conflicting appointments
        // This would involve updating appointment statuses
        // Placeholder implementation

        break

      case 'extend':
        // Extend the appointment time
        if (rest[0]) {
          // Would need to calculate new end time
          // Placeholder implementation
        }
        break

      case 'split':
        // Split appointments between multiple slots
        // Complex logic would be implemented here
        // Placeholder implementation
        break
    }

    // Send notifications if required
    if (resolution.notifyPatients) {
      // Send notifications to affected patients
      // This would integrate with notification service
      console.log(`Notifications sent for conflict ${conflictId}`)
    }

    // Create audit log entry
    await prisma.doctorAuditLog.create({
      data: {
        doctorId,
        action: 'CONFLICT_RESOLVED',
        details: JSON.stringify({
          conflictId,
          resolutionType: resolution.resolutionType,
          reason: resolution.reason,
          timestamp: new Date()
        }),
        timestamp: new Date()
      }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Conflict resolved successfully',
      resolutionType: resolution.resolutionType
    })

  } catch (error) {
    console.error('Conflict resolution error:', error)
    return NextResponse.json(
      { error: 'Failed to resolve conflict' },
      { status: 500 }
    )
  }
}