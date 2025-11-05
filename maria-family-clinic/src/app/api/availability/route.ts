import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { addMinutes, isWithinInterval, startOfDay, endOfDay, addDays, isToday } from 'date-fns';

const prisma = new PrismaClient();

// WebSocket connection management
const connections = new Set<WebSocket>();
const subscribedClients = new Map<WebSocket, {
  serviceId?: string;
  clinicId?: string;
  doctorId?: string;
}>();

// WebSocket message types
interface WebSocketMessage {
  type: 'availability_update' | 'booking_conflict' | 'waitlist_update' | 'capacity_change';
  serviceId?: string;
  clinicId?: string;
  doctorId?: string;
  data: any;
  timestamp: string;
}

// Broadcast to specific subscribers
function broadcastToSubscribers(message: WebSocketMessage, filters: {
  serviceId?: string;
  clinicId?: string;
  doctorId?: string;
}) {
  const subscribers = Array.from(subscribedClients.entries());
  
  subscribers.forEach(([ws, filters]) => {
    try {
      // Check if client is subscribed to relevant data
      const matchesService = !filters.serviceId || filters.serviceId === message.serviceId;
      const matchesClinic = !filters.clinicId || filters.clinicId === message.clinicId;
      const matchesDoctor = !filters.doctorId || filters.doctorId === message.doctorId;
      
      if (matchesService && matchesClinic && matchesDoctor) {
        ws.send(JSON.stringify(message));
      }
    } catch (error) {
      console.error('WebSocket broadcast error:', error);
      connections.delete(ws);
      subscribedClients.delete(ws);
    }
  });
}

// Update capacity and availability for a clinic/service
async function updateCapacityStatus(serviceId: string, clinicId: string, doctorId?: string) {
  try {
    // Get current appointments for the day
    const today = startOfDay(new Date());
    const tomorrow = startOfDay(addDays(new Date(), 1));
    
    const appointments = await prisma.appointment.findMany({
      where: {
        serviceId,
        clinicId,
        ...(doctorId && { doctorId }),
        appointmentDate: {
          gte: today,
          lt: tomorrow,
        },
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
      },
    });

    // Calculate capacity metrics
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { typicalDurationMin: true },
    });

    if (!service) return;

    const dailyCapacity = Math.floor((17 - 9) * 60 / service.typicalDurationMin); // 9 AM to 5 PM
    const currentBookings = appointments.length;
    const utilizationRate = (currentBookings / dailyCapacity) * 100;
    
    const capacityStatus = {
      serviceId,
      clinicId,
      doctorId,
      dailyCapacity,
      currentBookings,
      availableSlots: dailyCapacity - currentBookings,
      utilizationRate: Math.round(utilizationRate * 100) / 100,
      status: utilizationRate > 90 ? 'full' : utilizationRate > 70 ? 'busy' : 'available',
      lastUpdated: new Date().toISOString(),
    };

    // Broadcast capacity update
    broadcastToSubscribers({
      type: 'capacity_change',
      serviceId,
      clinicId,
      doctorId,
      data: capacityStatus,
      timestamp: new Date().toISOString(),
    }, { serviceId, clinicId, doctorId });

    return capacityStatus;
  } catch (error) {
    console.error('Capacity update error:', error);
    return null;
  }
}

// Generate mock time slots with more realistic availability
function generateTimeSlots(
  clinicId: string,
  doctorId: string,
  serviceId: string,
  date: Date,
  capacityStatus?: any
) {
  const slots = [];
  const startHour = 9; // 9 AM
  const endHour = 17; // 5 PM
  const duration = 30; // 30 minutes per slot
  
  // Get service duration from service or use default
  const serviceDuration = capacityStatus?.serviceDuration || 30;
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += serviceDuration) {
      const startTime = new Date(date);
      startTime.setHours(hour, minute, 0, 0);
      
      const endTime = addMinutes(startTime, serviceDuration);
      
      // More realistic availability based on capacity
      const isAvailable = Math.random() > (capacityStatus?.utilizationRate / 100 || 0.3);
      const isBooked = !isAvailable && Math.random() > 0.7;
      const isReserved = !isAvailable && !isBooked && Math.random() > 0.5;
      
      // Past times should not be available
      const now = new Date();
      const timeInPast = startTime < now;
      
      if (timeInPast) {
        continue; // Skip past times
      }
      
      slots.push({
        id: `${clinicId}-${doctorId}-${serviceId}-${startTime.toISOString()}`,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        date: startTime.toISOString().split('T')[0],
        doctorId,
        clinicId,
        serviceId,
        status: timeInPast ? 'unavailable' : isBooked ? 'booked' : isReserved ? 'reserved' : isAvailable ? 'available' : 'blocked',
        isAvailable: isAvailable && !timeInPast,
        isBooked: isBooked,
        isReserved: isReserved,
        duration: serviceDuration,
        estimatedDuration: serviceDuration,
        price: Math.floor(Math.random() * 200) + 100, // Mock pricing
        conflictResolution: isBooked ? {
          type: 'double_booking' as const,
          conflictingSlots: [`slot-${Math.random()}`],
          resolvedBy: 'system' as const,
          resolutionTime: new Date().toISOString(),
        } : undefined,
      });
    }
  }
  
  return slots;
}

function calculateWaitTime(slots: any[], serviceId: string, capacityStatus?: any): number {
  const availableSlots = slots.filter(slot => slot.isAvailable && !slot.isBooked);
  const now = new Date();
  
  // If capacity is full, suggest longer wait times
  if (capacityStatus?.status === 'full') {
    return Math.floor(Math.random() * 180) + 120; // 2-5 hours
  }
  
  if (availableSlots.length === 0) {
    return Math.floor(Math.random() * 90) + 30; // 30min - 2 hours
  }
  
  // Calculate wait time based on next available slot
  const nextSlot = availableSlots.find(slot => 
    new Date(slot.startTime) > now
  );
  
  if (nextSlot) {
    const waitMinutes = Math.floor(
      (new Date(nextSlot.startTime).getTime() - now.getTime()) / (1000 * 60)
    );
    return Math.max(waitMinutes, 5); // Minimum 5 minutes
  }
  
  // Fallback calculation
  const bookedCount = slots.filter(slot => slot.isBooked).length;
  const totalSlots = slots.length;
  const loadPercentage = bookedCount / totalSlots;
  
  return Math.floor(loadPercentage * 60) + Math.floor(Math.random() * 20);
}

// GET /api/availability - Get service availability
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('serviceId');
    const clinicId = searchParams.get('clinicId');
    const doctorId = searchParams.get('doctorId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const includeCapacity = searchParams.get('includeCapacity') === 'true';

    if (!serviceId) {
      return NextResponse.json(
        { error: 'Service ID is required' },
        { status: 400 }
      );
    }

    // Get service details
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    // Default date range: next 7 days
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : addDays(new Date(), 7);

    // Get clinics that offer this service
    const clinicServices = await prisma.clinicService.findMany({
      where: {
        serviceId,
        ...(clinicId && { clinicId }),
        isAvailable: true,
      },
      include: {
        clinic: {
          select: {
            id: true,
            name: true,
            address: true,
            operatingHours: true,
          },
        },
      },
    });

    const availability = [];
    const currentDate = new Date(start);

    while (currentDate <= end) {
      const dateString = currentDate.toISOString().split('T')[0];

      for (const clinicService of clinicServices) {
        // Get doctors for this clinic
        const doctorClinics = await prisma.doctorClinic.findMany({
          where: { clinicId: clinicService.clinicId },
          include: {
            doctor: {
              select: { id: true, name: true },
            },
          },
        });

        // Calculate capacity for this clinic/service
        let capacityStatus = null;
        if (includeCapacity) {
          capacityStatus = await updateCapacityStatus(serviceId, clinicService.clinicId);
        }

        for (const doctorClinic of doctorClinics) {
          // Check if clinic operates on this day
          const dayOfWeek = currentDate.getDay();
          const operatingHours = clinicService.clinic.operatingHours as any;
          
          // For demonstration, assume clinic operates every day 9-5
          const isOpen = true; // In real implementation, check actual operating hours

          if (isOpen) {
            const slots = generateTimeSlots(
              clinicService.clinicId,
              doctorClinic.doctorId,
              serviceId,
              currentDate,
              capacityStatus
            );

            const estimatedWaitTime = calculateWaitTime(slots, serviceId, capacityStatus);

            // Find next available slot
            const nextAvailableSlot = slots.find(slot => 
              slot.isAvailable && new Date(slot.startTime) > new Date()
            );

            availability.push({
              serviceId,
              clinicId: clinicService.clinicId,
              doctorId: doctorClinic.doctorId,
              date: dateString,
              timeSlots: slots,
              isAvailable: nextAvailableSlot !== undefined,
              estimatedWaitTime,
              nextAvailableSlot,
              lastUpdated: new Date().toISOString(),
              updateSource: 'automated' as const,
              clinic: {
                name: clinicService.clinic.name,
                address: clinicService.clinic.address,
              },
              doctor: {
                name: doctorClinic.doctor.name,
              },
            });
          }
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return NextResponse.json(availability);

  } catch (error) {
    console.error('Availability fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/availability/book - Book an appointment with conflict resolution
export async function POST(request: NextRequest) {
  try {
    const bookingData = await request.json();

    const {
      serviceId,
      clinicId,
      doctorId,
      preferredSlotId,
      patientId,
      appointmentDetails,
      flexibility,
      constraints,
    } = bookingData;

    // Validate required fields
    if (!serviceId || !clinicId || !doctorId || !preferredSlotId || !patientId) {
      return NextResponse.json(
        { error: 'Missing required booking information' },
        { status: 400 }
      );
    }

    // Check if slot is still available
    const slotResponse = await fetch(`${request.url}?serviceId=${serviceId}&clinicId=${clinicId}&doctorId=${doctorId}`);
    const availability = await slotResponse.json();

    const targetSlot = availability
      ?.flatMap((avail: any) => avail.timeSlots)
      .find((slot: any) => slot.id === preferredSlotId);

    if (!targetSlot) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Slot not found',
          alternatives: availability?.flatMap((avail: any) => avail.timeSlots)
            .filter((slot: any) => slot.isAvailable)
            .slice(0, 5) || []
        },
        { status: 404 }
      );
    }

    if (!targetSlot.isAvailable) {
      // Conflict detected - return alternative options
      const alternatives = availability
        ?.flatMap((avail: any) => avail.timeSlots)
        .filter((slot: any) => 
          slot.isAvailable && 
          new Date(slot.startTime) > new Date()
        )
        .sort((a: any, b: any) => 
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        )
        .slice(0, 3);

      // Broadcast conflict notification
      broadcastToSubscribers({
        type: 'booking_conflict',
        serviceId,
        clinicId,
        doctorId,
        data: {
          preferredSlotId,
          conflictType: 'slot_unavailable',
          alternatives,
          severity: 'medium',
        },
        timestamp: new Date().toISOString(),
      }, { serviceId, clinicId, doctorId });

      return NextResponse.json({
        success: false,
        conflictResolution: {
          type: 'double_booking',
          severity: 'medium',
          description: 'Selected time slot is no longer available',
          conflictingSlots: [preferredSlotId],
          alternatives,
          nextBestOption: alternatives?.[0] || null,
        },
        alternatives: alternatives || [],
      });
    }

    // Check for scheduling conflicts in database
    const conflictingAppointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        clinicId,
        appointmentDate: {
          gte: new Date(targetSlot.startTime),
          lt: new Date(targetSlot.endTime),
        },
        status: {
          not: 'CANCELLED',
        },
      },
    });

    if (conflictingAppointments.length > 0) {
      // Conflict found - attempt resolution
      const alternatives = availability
        ?.flatMap((avail: any) => avail.timeSlots)
        .filter((slot: any) => 
          slot.isAvailable && 
          new Date(slot.startTime) > new Date() &&
          new Date(slot.startTime) !== new Date(targetSlot.startTime)
        )
        .slice(0, 3);

      // Broadcast conflict notification
      broadcastToSubscribers({
        type: 'booking_conflict',
        serviceId,
        clinicId,
        doctorId,
        data: {
          preferredSlotId,
          conflictType: 'database_conflict',
          conflictingAppointments,
          alternatives,
          severity: 'high',
        },
        timestamp: new Date().toISOString(),
      }, { serviceId, clinicId, doctorId });

      return NextResponse.json({
        success: false,
        conflictResolution: {
          type: 'double_booking',
          severity: 'high',
          description: 'Scheduling conflict detected - time slot already booked in database',
          conflictingSlots: [preferredSlotId],
          overlappingSlots: conflictingAppointments.map(apt => ({
            id: apt.id,
            patientId: apt.patientId,
            appointmentDate: apt.appointmentDate,
          })),
          alternatives,
        },
        alternatives: alternatives || [],
      });
    }

    // Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        clinicId,
        doctorId,
        serviceId,
        patientId,
        appointmentDate: new Date(targetSlot.startTime),
        symptoms: appointmentDetails.symptoms,
        notes: appointmentDetails.notes,
        isUrgent: appointmentDetails.isUrgent || false,
        status: 'CONFIRMED',
      },
    });

    // Update capacity after successful booking
    const updatedCapacity = await updateCapacityStatus(serviceId, clinicId, doctorId);

    // Get service and clinic details for confirmation
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    const clinic = await prisma.clinic.findUnique({ where: { id: clinicId } });
    const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });

    // Broadcast successful booking
    broadcastToSubscribers({
      type: 'availability_update',
      serviceId,
      clinicId,
      doctorId,
      data: {
        appointmentId: appointment.id,
        slotId: preferredSlotId,
        status: 'booked',
        updatedCapacity,
      },
      timestamp: new Date().toISOString(),
    }, { serviceId, clinicId, doctorId });

    return NextResponse.json({
      success: true,
      bookingId: appointment.id,
      assignedSlotId: preferredSlotId,
      confirmation: {
        appointmentDate: new Date(targetSlot.startTime).toISOString(),
        clinicName: clinic?.name || 'Unknown Clinic',
        doctorName: doctor?.name || 'Unknown Doctor',
        serviceName: service?.name || 'Unknown Service',
        estimatedDuration: targetSlot.estimatedDuration,
      },
      capacityUpdate: updatedCapacity,
      waitlistPosition: null,
      estimatedWaitTime: 0,
    });

  } catch (error) {
    console.error('Booking error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create booking',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// WebSocket upgrade handler for real-time updates
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}

// WebSocket connection upgrade (for real-time features)
export async function websocket(request: Request) {
  const upgradeHeader = request.headers.get('Upgrade') || '';
  
  if (upgradeHeader.toLowerCase() !== 'websocket') {
    return new Response('Expected websocket', { status: 426 });
  }

  // @ts-ignore - WebSocketPair is available in Edge runtime
  const { 0: client, 1: server } = new WebSocketPair();
  
  server.accept();
  
  connections.add(server);
  
  // Handle incoming messages for subscription management
  server.addEventListener('message', async (event) => {
    try {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'subscribe':
          subscribedClients.set(server, {
            serviceId: message.serviceId,
            clinicId: message.clinicId,
            doctorId: message.doctorId,
          });
          
          // Send initial capacity data
          if (message.serviceId && message.clinicId) {
            const capacity = await updateCapacityStatus(
              message.serviceId,
              message.clinicId,
              message.doctorId
            );
            
            if (capacity) {
              server.send(JSON.stringify({
                type: 'capacity_change',
                serviceId: message.serviceId,
                clinicId: message.clinicId,
                data: capacity,
                timestamp: new Date().toISOString(),
              }));
            }
          }
          break;
          
        case 'unsubscribe':
          subscribedClients.delete(server);
          break;
          
        case 'ping':
          server.send(JSON.stringify({
            type: 'pong',
            timestamp: new Date().toISOString(),
          }));
          break;
      }
    } catch (error) {
      console.error('WebSocket message handling error:', error);
    }
  });
  
  // Handle connection close
  server.addEventListener('close', () => {
    connections.delete(server);
    subscribedClients.delete(server);
  });
  
  // Handle errors
  server.addEventListener('error', (error) => {
    console.error('WebSocket error:', error);
    connections.delete(server);
    subscribedClients.delete(server);
  });

  return new Response(null, {
    status: 101,
    // @ts-ignore - WebSocketPair is available in Edge runtime
    webSocket: client,
  });
}

// Cleanup function to be called periodically
async function cleanupConnections() {
  const activeConnections = Array.from(connections);
  
  for (const ws of activeConnections) {
    try {
      // @ts-ignore - Check if connection is still alive
      if (ws.readyState !== ws.OPEN) {
        connections.delete(ws);
        subscribedClients.delete(ws);
      }
    } catch (error) {
      connections.delete(ws);
      subscribedClients.delete(ws);
    }
  }
}

// Set up periodic cleanup
setInterval(cleanupConnections, 60000); // Clean up every minute