/**
 * Waitlist Management API Endpoint
 * Sub-Phase 7.5: Doctor Availability & Scheduling Integration
 * 
 * Handles patient waitlist management with real-time notifications and position tracking
 */

import { NextRequest, NextResponse } from 'next/server';

// Mock waitlist data
const mockWaitlist: Array<{
  id: string;
  doctorId: string;
  patientId?: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  appointmentType: string;
  urgencyLevel: string;
  joinedAt: Date;
  estimatedWaitTime?: string;
  preferredSlots: Array<{
    date: string;
    startTime: string;
    endTime: string;
  }>;
  status: 'WAITING' | 'NOTIFIED' | 'CONFIRMED' | 'EXPIRED' | 'CANCELLED';
  position?: number;
  notificationSent?: boolean;
  lastNotified?: Date;
  notes?: string;
}> = [];

const mockStats = {
  totalWaiting: 0,
  averageWaitTime: 7,
  oldestEntry: new Date(Date.now() - 24 * 60 * 60 * 1000),
  notificationsSent: 0,
  autoPromotionRate: 85
};

// Join waitlist
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      doctorId,
      patientId,
      patientName,
      patientPhone,
      patientEmail,
      appointmentType,
      urgencyLevel = 'ROUTINE',
      notes,
      preferredSlot,
      preferredSlots
    } = body;

    // Validation
    if (!doctorId || !patientName || !patientPhone) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields',
          required: ['doctorId', 'patientName', 'patientPhone']
        },
        { status: 400 }
      );
    }

    // Check if already on waitlist
    const existingEntry = mockWaitlist.find(w => 
      w.doctorId === doctorId && 
      w.patientPhone === patientPhone && 
      w.status === 'WAITING'
    );

    if (existingEntry) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Already on waitlist for this doctor',
          existingEntry: {
            id: existingEntry.id,
            position: existingEntry.position,
            joinedAt: existingEntry.joinedAt
          }
        },
        { status: 409 }
      );
    }

    // Calculate waitlist position
    const currentPosition = mockWaitlist
      .filter(w => w.doctorId === doctorId && w.status === 'WAITING')
      .length + 1;

    // Estimate wait time
    const estimatedWaitDays = Math.ceil(currentPosition / 3); // Assuming 3 appointments per day
    const estimatedWaitTime = `${estimatedWaitDays} day${estimatedWaitDays > 1 ? 's' : ''}`;

    // Create waitlist entry
    const waitlistEntry = {
      id: `wait-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      doctorId,
      patientId,
      patientName,
      patientPhone,
      patientEmail,
      appointmentType,
      urgencyLevel,
      joinedAt: new Date(),
      estimatedWaitTime,
      preferredSlots: preferredSlots || (preferredSlot ? [preferredSlot] : []),
      status: 'WAITING' as const,
      position: currentPosition,
      notificationSent: false,
      lastNotified: undefined,
      notes
    };

    mockWaitlist.push(waitlistEntry);
    mockStats.totalWaiting = mockWaitlist.filter(w => w.status === 'WAITING').length;

    // Generate waitlist notification
    const notification = {
      id: `notif-${Date.now()}`,
      type: 'waitlist_joined',
      title: 'Added to Waitlist',
      message: `${patientName} added to waitlist for Dr. (Position: #${currentPosition})`,
      timestamp: new Date(),
      channels: ['in_app', 'sms'],
      data: { 
        waitlistId: waitlistEntry.id,
        position: currentPosition,
        estimatedWaitTime
      }
    };

    console.log('Patient added to waitlist:', {
      waitlistId: waitlistEntry.id,
      doctorId,
      position: currentPosition
    });

    return NextResponse.json({
      success: true,
      data: {
        waitlistId: waitlistEntry.id,
        position: currentPosition,
        estimatedWaitTime,
        waitlistEntry
      },
      message: 'Successfully added to waitlist'
    }, { status: 201 });

  } catch (error) {
    console.error('Error joining waitlist:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to join waitlist',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Get waitlist for a doctor
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId');
    const status = searchParams.get('status') || 'WAITING';
    const limit = parseInt(searchParams.get('limit') || '50');

    let filteredWaitlist = [...mockWaitlist];

    // Filter by doctor
    if (doctorId) {
      filteredWaitlist = filteredWaitlist.filter(w => w.doctorId === doctorId);
    }

    // Filter by status
    if (status) {
      filteredWaitlist = filteredWaitlist.filter(w => w.status === status);
    }

    // Sort by joined date and position
    filteredWaitlist.sort((a, b) => {
      if (a.position !== b.position) {
        return (a.position || 0) - (b.position || 0);
      }
      return a.joinedAt.getTime() - b.joinedAt.getTime();
    });

    // Limit results
    if (limit > 0) {
      filteredWaitlist = filteredWaitlist.slice(0, limit);
    }

    // Update stats
    mockStats.totalWaiting = mockWaitlist.filter(w => w.status === 'WAITING').length;
    mockStats.notificationsSent = mockWaitlist.filter(w => w.notificationSent).length;

    return NextResponse.json({
      success: true,
      data: {
        entries: filteredWaitlist,
        stats: mockStats
      },
      count: filteredWaitlist.length,
      meta: {
        total: filteredWaitlist.length,
        filters: { doctorId, status }
      }
    });

  } catch (error) {
    console.error('Error fetching waitlist:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch waitlist',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Update waitlist entry
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { waitlistId, updates, action } = body;

    if (!waitlistId || !action) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields',
          required: ['waitlistId', 'action']
        },
        { status: 400 }
      );
    }

    const waitlistIndex = mockWaitlist.findIndex(w => w.id === waitlistId);

    if (waitlistIndex === -1) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Waitlist entry not found'
        },
        { status: 404 }
      );
    }

    const entry = mockWaitlist[waitlistIndex];

    switch (action) {
      case 'notify':
        // Send notification to patient
        entry.status = 'NOTIFIED';
        entry.notificationSent = true;
        entry.lastNotified = new Date();
        
        console.log('Waitlist notification sent:', {
          waitlistId,
          patientPhone: entry.patientPhone
        });
        
        break;

      case 'promote':
        // Promote to confirmed appointment
        entry.status = 'CONFIRMED';
        
        // In a real implementation, this would create an appointment
        console.log('Waitlist entry promoted to confirmed:', {
          waitlistId,
          patientName: entry.patientName
        });
        
        break;

      case 'cancel':
        // Cancel waitlist entry
        entry.status = 'CANCELLED';
        
        console.log('Waitlist entry cancelled:', {
          waitlistId,
          reason: updates?.reason
        });
        
        break;

      case 'expire':
        // Mark as expired
        entry.status = 'EXPIRED';
        
        console.log('Waitlist entry expired:', {
          waitlistId
        });
        
        break;

      default:
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid action',
            validActions: ['notify', 'promote', 'cancel', 'expire']
          },
          { status: 400 }
        );
    }

    // Apply updates
    if (updates) {
      Object.assign(entry, updates);
    }

    entry.joinedAt = entry.joinedAt; // Keep original join date

    // Re-calculate positions for remaining entries
    if (action === 'cancel' || action === 'expire' || action === 'promote') {
      const remainingEntries = mockWaitlist
        .filter(w => w.doctorId === entry.doctorId && w.status === 'WAITING' && w.id !== waitlistId)
        .sort((a, b) => a.joinedAt.getTime() - b.joinedAt.getTime());

      remainingEntries.forEach((entry, index) => {
        entry.position = index + 1;
        // Update estimated wait time
        const estimatedWaitDays = Math.ceil((index + 1) / 3);
        entry.estimatedWaitTime = `${estimatedWaitDays} day${estimatedWaitDays > 1 ? 's' : ''}`;
      });
    }

    return NextResponse.json({
      success: true,
      data: entry,
      message: `Waitlist entry ${action}d successfully`
    });

  } catch (error) {
    console.error('Error updating waitlist entry:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update waitlist entry',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Remove from waitlist
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const waitlistId = searchParams.get('waitlistId');
    const reason = searchParams.get('reason');

    if (!waitlistId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing waitlistId parameter'
        },
        { status: 400 }
      );
    }

    const waitlistIndex = mockWaitlist.findIndex(w => w.id === waitlistId);

    if (waitlistIndex === -1) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Waitlist entry not found'
        },
        { status: 404 }
      );
    }

    const entry = mockWaitlist[waitlistIndex];

    // Update to cancelled status instead of removing
    entry.status = 'CANCELLED';
    entry.notes = entry.notes ? `${entry.notes}\nCancelled: ${reason}` : `Cancelled: ${reason}`;

    // Re-calculate positions for remaining entries
    const remainingEntries = mockWaitlist
      .filter(w => w.doctorId === entry.doctorId && w.status === 'WAITING' && w.id !== waitlistId)
      .sort((a, b) => a.joinedAt.getTime() - b.joinedAt.getTime());

    remainingEntries.forEach((entry, index) => {
      entry.position = index + 1;
      const estimatedWaitDays = Math.ceil((index + 1) / 3);
      entry.estimatedWaitTime = `${estimatedWaitDays} day${estimatedWaitDays > 1 ? 's' : ''}`;
    });

    console.log('Waitlist entry removed:', {
      waitlistId,
      doctorId: entry.doctorId,
      reason
    });

    return NextResponse.json({
      success: true,
      message: 'Removed from waitlist successfully'
    });

  } catch (error) {
    console.error('Error removing from waitlist:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to remove from waitlist',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}