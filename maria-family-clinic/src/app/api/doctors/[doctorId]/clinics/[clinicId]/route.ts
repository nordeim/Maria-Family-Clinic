import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { doctorId: string, clinicId: string } }
) {
  try {
    const { doctorId, clinicId } = params
    const updates = await request.json()

    // Update doctor-clinic relationship
    const updatedDoctorClinic = await prisma.doctorClinic.update({
      where: {
        doctorId_clinicId: {
          doctorId,
          clinicId
        }
      },
      data: {
        // Update allowed fields
        role: updates.role,
        capacity: updates.capacity,
        isPrimary: updates.isPrimary,
        workingDays: updates.workingDays,
        startTime: updates.startTime,
        endTime: updates.endTime,
        clinicSpecializations: updates.clinicSpecializations,
        primaryServices: updates.primaryServices,
        consultationFee: updates.consultationFee,
        consultationDuration: updates.consultationDuration,
        emergencyConsultationFee: updates.emergencyConsultationFee,
        appointmentTypes: updates.appointmentTypes,
        walkInAllowed: updates.walkInAllowed,
        advanceBookingDays: updates.advanceBookingDays,
        acceptedInsurance: updates.acceptedInsurance,
        medisaveAccepted: updates.medisaveAccepted,
        chasAccepted: updates.chasAccepted,
        verificationStatus: updates.verificationStatus,
        verificationNotes: updates.verificationNotes,
        startDate: updates.startDate,
        endDate: updates.endDate,
        updatedAt: new Date()
      },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            specialties: true
          }
        },
        clinic: {
          select: {
            id: true,
            name: true,
            address: true
          }
        }
      }
    })

    // Create audit log entry
    await prisma.doctorAuditLog.create({
      data: {
        doctorId,
        action: 'UPDATE_CLINIC_RELATIONSHIP',
        fieldName: 'relationship_details',
        oldValue: JSON.stringify({
          clinicId,
          timestamp: new Date()
        }),
        newValue: JSON.stringify({
          clinicId,
          updates,
          timestamp: new Date()
        }),
        timestamp: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Doctor-clinic relationship updated successfully',
      doctorClinic: updatedDoctorClinic
    })

  } catch (error) {
    console.error('Doctor clinic update error:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Doctor-clinic relationship not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update doctor-clinic relationship' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { doctorId: string, clinicId: string } }
) {
  try {
    const { doctorId, clinicId } = params

    // Soft delete by setting end date
    await prisma.doctorClinic.update({
      where: {
        doctorId_clinicId: {
          doctorId,
          clinicId
        }
      },
      data: {
        endDate: new Date(),
        verificationStatus: 'EXPIRED',
        updatedAt: new Date()
      }
    })

    // Create audit log entry
    await prisma.doctorAuditLog.create({
      data: {
        doctorId,
        action: 'DELETE_CLINIC_RELATIONSHIP',
        fieldName: 'relationship_status',
        newValue: JSON.stringify({
          clinicId,
          status: 'terminated',
          timestamp: new Date()
        }),
        timestamp: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Doctor-clinic relationship terminated successfully'
    })

  } catch (error) {
    console.error('Doctor clinic deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to terminate doctor-clinic relationship' },
      { status: 500 }
    )
  }
}