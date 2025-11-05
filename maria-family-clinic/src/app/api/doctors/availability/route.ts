/**
 * Doctor Availability API Routes
 * Sub-Phase 7.5: Doctor Availability & Scheduling Integration
 * 
 * Comprehensive API endpoints for real-time doctor availability management,
 * appointment booking, conflict resolution, and waitlist functionality.
 */

import { NextRequest, NextResponse } from 'next/server';
import { DoctorAvailability, DoctorAppointmentStatus, AvailabilityType } from '@/types/doctor';

// Mock database - In production, this would be actual database queries
const mockAvailabilities: DoctorAvailability[] = [
  {
    id: 'slot-1',
    doctorId: 'doctor-1',
    clinicId: 'clinic-1',
    date: new Date('2025-12-15'),
    startTime: '09:00',
    endTime: '10:00',
    isAvailable: true,
    availabilityType: 'REGULAR',
    appointmentType: 'consultation',
    maxAppointments: 3,
    bookedAppointments: 1,
    availableSlots: 2,
    slotDuration: 60,
    breakDuration: 15,
    bufferTime: 5,
    isEmergency: false,
    isWalkIn: false,
    isTelehealth: false,
    ageRestrictions: { minAge: 0, maxAge: 100, pediatricOnly: false, adultOnly: false, geriatricSpecialist: false },
    genderRestrictions: [],
    conditionsJson: [],
    status: 'ACTIVE',
    lastUpdated: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'slot-2',
    doctorId: 'doctor-1',
    clinicId: 'clinic-1',
    date: new Date('2025-12-15'),
    startTime: '10:00',
    endTime: '11:00',
    isAvailable: true,
    availabilityType: 'EMERGENCY',
    appointmentType: 'emergency',
    maxAppointments: 1,
    bookedAppointments: 0,
    availableSlots: 1,
    slotDuration: 45,
    breakDuration: 15,
    bufferTime: 10,
    isEmergency: true,
    isWalkIn: false,
    isTelehealth: false,
    ageRestrictions: { minAge: 0, maxAge: 100, pediatricOnly: false, adultOnly: false, geriatricSpecialist: false },
    genderRestrictions: [],
    conditionsJson: [],
    status: 'ACTIVE',
    lastUpdated: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const mockConflicts: Array<{
  id: string;
  availabilityId: string;
  doctorId: string;
  type: string;
  description: string;
  severity: string;
}> = [];

const mockWaitlistPositions: Record<string, number> = {
  'doctor-1': 3,
  'doctor-2': 1,
  'doctor-3': 5
};

const mockAppointments: any[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId');
    const clinicId = searchParams.get('clinicId');
    const date = searchParams.get('date');
    const includeConflicts = searchParams.get('includeConflicts') === 'true';
    const includeWaitlist = searchParams.get('includeWaitlist') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    let filteredAvailabilities = [...mockAvailabilities];

    // Filter by doctor
    if (doctorId) {
      filteredAvailabilities = filteredAvailabilities.filter(a => a.doctorId === doctorId);
    }

    // Filter by clinic
    if (clinicId) {
      filteredAvailabilities = filteredAvailabilities.filter(a => a.clinicId === clinicId);
    }

    // Filter by date
    if (date) {
      const targetDate = new Date(date);
      filteredAvailabilities = filteredAvailabilities.filter(a => {
        const slotDate = new Date(a.date);
        return slotDate.toDateString() === targetDate.toDateString();
      });
    }

    // Sort by date and time
    filteredAvailabilities.sort((a, b) => {
      const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
      if (dateCompare === 0) {
        return a.startTime.localeCompare(b.startTime);
      }
      return dateCompare;
    });

    // Limit results
    if (limit > 0) {
      filteredAvailabilities = filteredAvailabilities.slice(0, limit);
    }

    const response: any = {
      success: true,
      data: filteredAvailabilities,
      count: filteredAvailabilities.length,
      meta: {
        total: filteredAvailabilities.length,
        filters: {
          doctorId,
          clinicId,
          date
        }
      }
    };

    // Include conflicts if requested
    if (includeConflicts && doctorId) {
      response.conflicts = mockConflicts.filter(c => c.doctorId === doctorId);
    }

    // Include waitlist positions if requested
    if (includeWaitlist && doctorId) {
      response.waitlistPositions = mockWaitlistPositions;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching doctor availability:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch availability data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      doctorId,
      clinicId,
      date,
      startTime,
      endTime,
      availabilityType = 'REGULAR',
      appointmentType,
      maxAppointments = 1,
      slotDuration = 30,
      breakDuration = 15,
      bufferTime = 5,
      isEmergency = false,
      isWalkIn = false,
      isTelehealth = false,
      notes,
      createdBy
    } = body;

    // Validation
    if (!doctorId || !clinicId || !date || !startTime || !endTime) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields',
          required: ['doctorId', 'clinicId', 'date', 'startTime', 'endTime']
        },
        { status: 400 }
      );
    }

    // Check for scheduling conflicts
    const slotDate = new Date(date);
    const existingSlot = mockAvailabilities.find(a => 
      a.doctorId === doctorId && 
      a.clinicId === clinicId &&
      new Date(a.date).toDateString() === slotDate.toDateString() &&
      (
        (startTime >= a.startTime && startTime < a.endTime) ||
        (endTime > a.startTime && endTime <= a.endTime) ||
        (startTime <= a.startTime && endTime >= a.endTime)
      )
    );

    if (existingSlot) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Scheduling conflict detected',
          conflict: {
            existingSlotId: existingSlot.id,
            conflictingTime: `${existingSlot.startTime} - ${existingSlot.endTime}`
          }
        },
        { status: 409 }
      );
    }

    // Create new availability slot
    const newSlot: DoctorAvailability = {
      id: `slot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      doctorId,
      clinicId,
      date: slotDate,
      startTime,
      endTime,
      isAvailable: true,
      availabilityType: availabilityType as AvailabilityType,
      appointmentType,
      maxAppointments,
      bookedAppointments: 0,
      availableSlots: maxAppointments,
      slotDuration,
      breakDuration,
      bufferTime,
      isEmergency,
      isWalkIn,
      isTelehealth,
      ageRestrictions: { 
        minAge: 0, 
        maxAge: 100, 
        pediatricOnly: false, 
        adultOnly: false, 
        geriatricSpecialist: false 
      },
      genderRestrictions: [],
      conditionsJson: [],
      status: 'ACTIVE',
      lastUpdated: new Date(),
      updatedBy: createdBy,
      notes,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockAvailabilities.push(newSlot);

    // Broadcast real-time update
    // In production, this would use WebSocket or Server-Sent Events
    console.log('New availability slot created:', newSlot);

    return NextResponse.json({
      success: true,
      data: newSlot,
      message: 'Availability slot created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating availability slot:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create availability slot',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { slotId, updates, updatedBy } = body;

    if (!slotId || !updates) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields',
          required: ['slotId', 'updates']
        },
        { status: 400 }
      );
    }

    const slotIndex = mockAvailabilities.findIndex(a => a.id === slotId);

    if (slotIndex === -1) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Availability slot not found'
        },
        { status: 404 }
      );
    }

    // Check for conflicts if time is being changed
    if (updates.startTime || updates.endTime || updates.date) {
      const slot = mockAvailabilities[slotIndex];
      const newDate = updates.date ? new Date(updates.date) : new Date(slot.date);
      const newStartTime = updates.startTime || slot.startTime;
      const newEndTime = updates.endTime || slot.endTime;

      const conflict = mockAvailabilities.find(a => 
        a.id !== slotId &&
        a.doctorId === slot.doctorId && 
        a.clinicId === slot.clinicId &&
        new Date(a.date).toDateString() === newDate.toDateString() &&
        (
          (newStartTime >= a.startTime && newStartTime < a.endTime) ||
          (newEndTime > a.startTime && newEndTime <= a.endTime) ||
          (newStartTime <= a.startTime && newEndTime >= a.endTime)
        )
      );

      if (conflict) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Scheduling conflict detected',
            conflict: {
              existingSlotId: conflict.id,
              conflictingTime: `${conflict.startTime} - ${conflict.endTime}`
            }
          },
          { status: 409 }
        );
      }
    }

    // Update the slot
    const updatedSlot = {
      ...mockAvailabilities[slotIndex],
      ...updates,
      updatedAt: new Date(),
      updatedBy
    };

    mockAvailabilities[slotIndex] = updatedSlot;

    // Broadcast real-time update
    console.log('Availability slot updated:', updatedSlot);

    return NextResponse.json({
      success: true,
      data: updatedSlot,
      message: 'Availability slot updated successfully'
    });

  } catch (error) {
    console.error('Error updating availability slot:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update availability slot',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slotId = searchParams.get('slotId');
    const reason = searchParams.get('reason');

    if (!slotId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing slotId parameter'
        },
        { status: 400 }
      );
    }

    const slotIndex = mockAvailabilities.findIndex(a => a.id === slotId);

    if (slotIndex === -1) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Availability slot not found'
        },
        { status: 404 }
      );
    }

    const slot = mockAvailabilities[slotIndex];

    // Check if slot has bookings
    if (slot.bookedAppointments > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot delete slot with existing bookings',
          bookedAppointments: slot.bookedAppointments
        },
        { status: 409 }
      );
    }

    // Remove the slot
    mockAvailabilities.splice(slotIndex, 1);

    // Broadcast real-time update
    console.log('Availability slot deleted:', slotId, 'Reason:', reason);

    return NextResponse.json({
      success: true,
      message: 'Availability slot deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting availability slot:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete availability slot',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}