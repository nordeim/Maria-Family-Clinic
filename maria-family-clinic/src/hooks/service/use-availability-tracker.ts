"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Types for availability tracking
export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  isBooked: boolean;
  isReserved?: boolean;
  patientId?: string;
  appointmentId?: string;
  doctorId: string;
  clinicId: string;
  serviceId: string;
  date: string;
  estimatedDuration: number;
  status: 'available' | 'booked' | 'reserved' | 'blocked' | 'maintenance';
  conflictResolution?: ConflictResolution;
}

export interface ServiceAvailability {
  serviceId: string;
  clinicId: string;
  doctorId: string;
  date: string;
  timeSlots: TimeSlot[];
  isAvailable: boolean;
  estimatedWaitTime: number; // minutes
  nextAvailableSlot?: TimeSlot;
  capacity: {
    dailyCapacity: number;
    bookedCount: number;
    availableCount: number;
    waitlistCount: number;
  };
  realTimeStatus: 'available' | 'limited' | 'waitlist' | 'unavailable' | 'maintenance';
  lastUpdated: string;
  updateSource: 'manual' | 'automated' | 'booking' | 'cancellation';
}

export interface ConflictResolution {
  type: 'time_overlap' | 'double_booking' | 'capacity_exceeded' | 'doctor_unavailable';
  conflictingSlots: string[];
  resolvedBy: 'system' | 'manual';
  resolutionTime: string;
  newSlotId?: string;
  alternativeSlots: string[];
}

export interface WaitTimeEstimate {
  serviceId: string;
  clinicId: string;
  doctorId: string;
  estimatedWaitTime: number; // minutes
  confidence: number; // 0-100
  factors: WaitTimeFactor[];
  lastCalculated: string;
  peakHoursAdjustment: number;
  realTimeFactors: RealTimeFactor[];
}

export interface WaitTimeFactor {
  factor: string;
  impact: number; // positive or negative minutes
  weight: number; // 0-1
  description: string;
}

export interface RealTimeFactor {
  factor: string;
  currentValue: number;
  baseline: number;
  impactMinutes: number;
  isTemporary: boolean;
  expiresAt?: string;
}

export interface BookingRequest {
  serviceId: string;
  clinicId: string;
  doctorId: string;
  preferredSlotId?: string;
  alternativeSlots: string[];
  patientId: string;
  appointmentDetails: {
    symptoms?: string;
    notes?: string;
    isUrgent: boolean;
    preferredLanguage?: string;
  };
  preferences: {
    exactTime: boolean;
    flexibleSchedule: boolean;
    sameDayPreferred: boolean;
    doctorPreference?: string;
  };
}

export interface BookingResponse {
  success: boolean;
  bookingId?: string;
  assignedSlotId?: string;
  confirmation: {
    appointmentDate: string;
    clinicName: string;
    doctorName: string;
    serviceName: string;
    estimatedDuration: number;
  };
  conflictResolution?: ConflictResolution;
  alternatives: TimeSlot[];
  waitlistPosition?: number;
  estimatedWaitTime?: number;
}

interface UseAvailabilityTrackerOptions {
  serviceId: string;
  clinicId?: string;
  doctorId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  enableRealTime?: boolean;
  pollInterval?: number; // milliseconds
  enableWebSocket?: boolean;
}

export function useAvailabilityTracker(options: UseAvailabilityTrackerOptions) {
  const {
    serviceId,
    clinicId,
    doctorId,
    dateRange,
    enableRealTime = true,
    pollInterval = 30000, // 30 seconds
    enableWebSocket = false,
  } = options;

  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch availability data
  const {
    data: availability,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['availability', serviceId, clinicId, doctorId, dateRange],
    queryFn: async (): Promise<ServiceAvailability[]> => {
      const params = new URLSearchParams({
        serviceId,
        ...(clinicId && { clinicId }),
        ...(doctorId && { doctorId }),
        ...(dateRange && {
          startDate: dateRange.start.toISOString(),
          endDate: dateRange.end.toISOString(),
        }),
      });

      const response = await fetch(`/api/availability?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch availability');
      }
      return response.json();
    },
    refetchInterval: enableRealTime && !enableWebSocket ? pollInterval : false,
    staleTime: 10000, // 10 seconds
  });

  // Book appointment with conflict resolution
  const bookAppointmentMutation = useMutation({
    mutationFn: async (request: BookingRequest): Promise<BookingResponse> => {
      const response = await fetch('/api/availability/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to book appointment');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['availability'] });
      toast.success(data.bookingId ? 'Appointment booked successfully!' : 'Added to waitlist');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to book appointment');
    },
  });

  // Reserve slot temporarily
  const reserveSlotMutation = useMutation({
    mutationFn: async (slotId: string): Promise<{ reservationId: string; expiresAt: string }> => {
      const response = await fetch('/api/availability/reserve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slotId }),
      });

      if (!response.ok) {
        throw new Error('Failed to reserve slot');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability'] });
      toast.success('Time slot reserved temporarily');
    },
  });

  // Cancel reservation
  const cancelReservationMutation = useMutation({
    mutationFn: async (reservationId: string): Promise<void> => {
      await fetch(`/api/availability/reserve/${reservationId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability'] });
    },
  });

  // Get wait time estimate
  const getWaitTimeEstimate = useCallback(async (): Promise<WaitTimeEstimate | null> => {
    try {
      const params = new URLSearchParams({
        serviceId,
        ...(clinicId && { clinicId }),
        ...(doctorId && { doctorId }),
      });

      const response = await fetch(`/api/availability/wait-time?${params}`);
      if (!response.ok) return null;

      return response.json();
    } catch (error) {
      console.error('Failed to fetch wait time estimate:', error);
      return null;
    }
  }, [serviceId, clinicId, doctorId]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!enableWebSocket || !enableRealTime) return;

    const connectWebSocket = () => {
      const wsUrl = `ws://localhost:3001/availability?serviceId=${serviceId}&clinicId=${clinicId || ''}&doctorId=${doctorId || ''}`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        setIsConnected(true);
        console.log('Availability WebSocket connected');
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'availability_update') {
            queryClient.setQueryData(['availability', serviceId, clinicId, doctorId, dateRange], data.payload);
          } else if (data.type === 'conflict_resolution') {
            // Handle conflict resolution updates
            toast.info('Appointment slot updated due to scheduling conflict');
            queryClient.invalidateQueries({ queryKey: ['availability'] });
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
        console.log('Availability WebSocket disconnected');
        // Attempt to reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000);
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [enableWebSocket, enableRealTime, serviceId, clinicId, doctorId, dateRange, queryClient]);

  // Handle polling fallback for real-time updates
  useEffect(() => {
    if (enableRealTime && !enableWebSocket && !isLoading) {
      const startPolling = () => {
        pollTimeoutRef.current = setTimeout(() => {
          refetch();
          startPolling();
        }, pollInterval);
      };
      startPolling();

      return () => {
        if (pollTimeoutRef.current) {
          clearTimeout(pollTimeoutRef.current);
        }
      };
    }
  }, [enableRealTime, enableWebSocket, pollInterval, isLoading, refetch]);

  // Get available time slots for a specific date
  const getAvailableSlots = useCallback((date: string): TimeSlot[] => {
    if (!availability || !Array.isArray(availability)) return [];

    return availability
      .filter(avail => avail.date === date)
      .flatMap(avail => avail.timeSlots.filter(slot => slot.isAvailable && slot.status === 'available'));
  }, [availability]);

  // Check if a slot is available
  const isSlotAvailable = useCallback((slotId: string): boolean => {
    if (!availability) return false;

    return availability.some(avail =>
      avail.timeSlots.some(slot => slot.id === slotId && slot.isAvailable)
    );
  }, [availability]);

  // Get next available slot
  const getNextAvailableSlot = useCallback((): TimeSlot | null => {
    if (!availability || !Array.isArray(availability)) return null;

    const allSlots = availability.flatMap(avail => avail.timeSlots);
    const availableSlots = allSlots
      .filter(slot => slot.isAvailable && slot.status === 'available')
      .sort((a, b) => new Date(a.date + ' ' + a.startTime).getTime() - new Date(b.date + ' ' + b.startTime).getTime());

    return availableSlots[0] || null;
  }, [availability]);

  // Force refresh availability data
  const forceRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['availability'] });
    refetch();
  }, [queryClient, refetch]);

  return {
    // Data
    availability: availability || [],
    isLoading,
    error,
    isConnected,

    // Actions
    bookAppointment: bookAppointmentMutation.mutateAsync,
    reserveSlot: reserveSlotMutation.mutateAsync,
    cancelReservation: cancelReservationMutation.mutateAsync,
    getWaitTimeEstimate,
    
    // Utils
    getAvailableSlots,
    isSlotAvailable,
    getNextAvailableSlot,
    forceRefresh,
    
    // State
    isBooking: bookAppointmentMutation.isPending,
    isReserving: reserveSlotMutation.isPending,
  };
}