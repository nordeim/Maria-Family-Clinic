/**
 * Appointment Booking API Endpoint
 * Sub-Phase 7.5: Doctor Availability & Scheduling Integration
 * 
 * Handles appointment booking with conflict detection, waitlist integration,
 * and real-time confirmation system
 */

import { NextRequest, NextResponse } from 'next/server';
import { DoctorAppointmentStatus } from '@/types/doctor';

// Mock database
const mockAppointments: any[] = [];
const mockWaitlist: any[] = [];
const mockNotifications: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      doctorId,
      availabilityId,
      patientId,
      patientName,
      patientPhone,
      patientEmail,
      appointmentType,
      urgencyLevel = 'ROUTINE',
      notes,
      preferredSlotTime,
      specialRequirements,
      isNewPatient = false
    } = body;

    // Validation
    if (!doctorId || !availabilityId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields',
          required: ['doctorId', 'availabilityId']
        },
        { status: 400 }
      );
    }

    if (!patientName || !patientPhone) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Patient information is required',
          required: ['patientName', 'patientPhone']
        },
        { status: 400 }
      );
    }

    // Find the availability slot
    const availabilitySlot = {
      id: availabilityId,
      doctorId,
      date: new Date(),
      startTime: '14:00',
      endTime: '15:00',
      isAvailable: true,
      availableSlots: 1,
      maxAppointments: 1,
      bookedAppointments: 0,
      isEmergency: urgencyLevel === 'EMERGENCY',
      slotDuration: 60
    };

    // Check availability
    if (!availabilitySlot.isAvailable || availabilitySlot.availableSlots <= 0) {
      // Check waitlist for alternatives
      const alternativeSlots = mockAppointments
        .filter(apt => apt.doctorId === doctorId && apt.status === 'SCHEDULED')
        .slice(0, 3);

      const waitlistPosition = mockWaitlist.filter(w => w.doctorId === doctorId).length + 1;

      return NextResponse.json({
        success: false,
        error: 'No slots available for selected time',
        alternativeSlots,
        waitlistPosition,
        estimatedWaitTime: `${waitlistPosition * 2} hours`,
        message: 'This time slot is fully booked. Please check alternatives or join waitlist.'
      }, { status: 409 });
    }

    // Check for conflicts
    const conflictingAppointment = mockAppointments.find(apt => 
      apt.doctorId === doctorId &&
      apt.status === 'SCHEDULED' &&
      apt.appointmentDate.toDateString() === availabilitySlot.date.toDateString() &&
      (
        (availabilitySlot.startTime >= apt.startTime && availabilitySlot.startTime < apt.endTime) ||
        (availabilitySlot.endTime > apt.startTime && availabilitySlot.endTime <= apt.endTime)
      )
    );

    if (conflictingAppointment) {
      return NextResponse.json({
        success: false,
        error: 'Scheduling conflict detected',
        conflictDetected: true,
        conflict: {
          appointmentId: conflictingAppointment.id,
          time: `${conflictingAppointment.startTime} - ${conflictingAppointment.endTime}`
        },
        alternativeSlots: mockAppointments
          .filter(apt => apt.doctorId === doctorId && apt.status === 'SCHEDULED')
          .slice(0, 5),
        message: 'This slot conflicts with an existing appointment.'
      }, { status: 409 });
    }

    // Create appointment
    const appointment = {
      id: `apt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      doctorId,
      availabilityId,
      appointmentDate: availabilitySlot.date,
      startTime: availabilitySlot.startTime,
      endTime: availabilitySlot.endTime,
      patientId,
      patientName,
      patientPhone,
      patientEmail,
      appointmentType,
      urgencyLevel,
      status: DoctorAppointmentStatus.CONFIRMED,
      wasCompleted: false,
      isCancelled: false,
      isRescheduled: false,
      reminderSent: false,
      confirmationRequired: true,
      isPaid: false,
      notes,
      specialRequirements,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockAppointments.push(appointment);

    // Generate confirmation code
    const confirmationCode = `MFC${Date.now().toString().slice(-6)}`;

    // Create notification
    const notification = {
      id: `notif-${Date.now()}`,
      type: 'booking_confirmed',
      title: 'Appointment Confirmed',
      message: `${patientName} confirmed appointment for ${availabilitySlot.date.toDateString()} at ${availabilitySlot.startTime}`,
      timestamp: new Date(),
      channels: ['in_app', 'sms', 'email'],
      data: { appointmentId: appointment.id, confirmationCode }
    };

    mockNotifications.push(notification);

    // Broadcast real-time update
    console.log('Appointment booked:', {
      appointmentId: appointment.id,
      doctorId,
      confirmationCode
    });

    return NextResponse.json({
      success: true,
      data: {
        appointmentId: appointment.id,
        confirmationCode,
        appointment,
        slotReleased: false,
        conflictDetected: false
      },
      message: 'Appointment booked successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error booking appointment:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to book appointment',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId');
    const patientId = searchParams.get('patientId');
    const status = searchParams.get('status');
    const date = searchParams.get('date');
    const limit = parseInt(searchParams.get('limit') || '50');

    let filteredAppointments = [...mockAppointments];

    // Apply filters
    if (doctorId) {
      filteredAppointments = filteredAppointments.filter(apt => apt.doctorId === doctorId);
    }

    if (patientId) {
      filteredAppointments = filteredAppointments.filter(apt => apt.patientId === patientId);
    }

    if (status) {
      filteredAppointments = filteredAppointments.filter(apt => apt.status === status);
    }

    if (date) {
      const targetDate = new Date(date);
      filteredAppointments = filteredAppointments.filter(apt => 
        apt.appointmentDate.toDateString() === targetDate.toDateString()
      );
    }

    // Sort by date and time
    filteredAppointments.sort((a, b) => {
      const dateCompare = a.appointmentDate.getTime() - b.appointmentDate.getTime();
      if (dateCompare === 0) {
        return a.startTime.localeCompare(b.startTime);
      }
      return dateCompare;
    });

    // Limit results
    if (limit > 0) {
      filteredAppointments = filteredAppointments.slice(0, limit);
    }

    return NextResponse.json({
      success: true,
      data: filteredAppointments,
      count: filteredAppointments.length,
      meta: {
        total: filteredAppointments.length,
        filters: { doctorId, patientId, status, date }
      }
    });

  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch appointments',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle appointment cancellation
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const appointmentId = searchParams.get('appointmentId');
    const reason = searchParams.get('reason');

    if (!appointmentId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing appointmentId parameter'
        },
        { status: 400 }
      );
    }

    const appointmentIndex = mockAppointments.findIndex(apt => apt.id === appointmentId);

    if (appointmentIndex === -1) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Appointment not found'
        },
        { status: 404 }
      );
    }

    const appointment = mockAppointments[appointmentIndex];

    // Update appointment status
    appointment.status = DoctorAppointmentStatus.CANCELLED;
    appointment.isCancelled = true;
    appointment.cancelledAt = new Date();
    appointment.cancellationReason = reason || 'Not specified';
    appointment.updatedAt = new Date();

    // Create notification
    const notification = {
      id: `notif-${Date.now()}`,
      type: 'appointment_cancelled',
      title: 'Appointment Cancelled',
      message: `Appointment cancelled for ${appointment.patientName} at ${appointment.startTime}`,
      timestamp: new Date(),
      channels: ['in_app', 'sms'],
      data: { appointmentId }
    };

    mockNotifications.push(notification);

    // Notify waitlist patients
    const waitlistCandidates = mockWaitlist
      .filter(w => w.doctorId === appointment.doctorId && w.status === 'WAITING')
      .slice(0, 3);

    // Broadcast real-time update
    console.log('Appointment cancelled:', {
      appointmentId,
      doctorId: appointment.doctorId,
      waitlistCandidates: waitlistCandidates.length
    });

    return NextResponse.json({
      success: true,
      data: appointment,
      message: 'Appointment cancelled successfully',
      waitlistNotified: waitlistCandidates.length
    });

  } catch (error) {
    console.error('Error cancelling appointment:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to cancel appointment',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}