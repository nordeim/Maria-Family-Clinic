/**
 * Doctor Scheduling Real-time Management Hook
 * Sub-Phase 7.5: Doctor Availability & Scheduling Integration
 * 
 * Provides comprehensive real-time doctor availability management with:
 * - Real-time slot updates with conflict resolution
 * - Appointment booking with instant confirmation
 * - Waitlist management with automatic notifications
 * - Last-minute cancellation handling
 * - Multi-channel notification system
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DoctorAvailability, DoctorAppointmentStatus, AvailabilityType } from '@/types/doctor';
import { apiClient } from '@/lib/api/client';
import { useWebSocket } from './use-web-socket';

interface SchedulingState {
  availabilities: DoctorAvailability[];
  selectedSlots: string[];
  conflicts: string[];
  waitlistPositions: Record<string, number>;
  isLoading: boolean;
  error: string | null;
}

interface BookingRequest {
  doctorId: string;
  availabilityId: string;
  patientId?: string;
  patientInfo?: {
    name: string;
    phone: string;
    email?: string;
  };
  appointmentType: string;
  urgencyLevel: 'ROUTINE' | 'URGENT' | 'EMERGENCY' | 'SAME_DAY';
  notes?: string;
  preferredSlotTime?: string;
}

interface BookingResult {
  success: boolean;
  appointmentId?: string;
  confirmationCode?: string;
  slotReleased?: boolean;
  conflictDetected?: boolean;
  alternativeSlots?: DoctorAvailability[];
  waitlistPosition?: number;
  estimatedWaitTime?: number;
  message?: string;
}

interface WaitlistEntry {
  id: string;
  doctorId: string;
  patientId: string;
  preferredSlot: Date;
  appointmentType: string;
  urgencyLevel: string;
  joinedAt: Date;
  status: 'WAITING' | 'NOTIFIED' | 'CONFIRMED' | 'EXPIRED';
}

interface SchedulingAnalytics {
  peakHours: Array<{ hour: number; utilization: number }>;
  peakDays: Array<{ day: string; utilization: number }>;
  noShowRate: number;
  averageWaitTime: number;
  utilizationRate: number;
  cancellationRate: number;
}

export const useDoctorScheduling = (doctorId?: string, clinicId?: string) => {
  const queryClient = useQueryClient();
  const [schedulingState, setSchedulingState] = useState<SchedulingState>({
    availabilities: [],
    selectedSlots: [],
    conflicts: [],
    waitlistPositions: {},
    isLoading: false,
    error: null,
  });

  const wsRef = useRef<WebSocket | null>(null);

  // WebSocket for real-time updates
  const { isConnected, sendMessage, reconnect } = useWebSocket(
    `/ws/scheduling${doctorId ? `?doctorId=${doctorId}` : ''}${clinicId ? `&clinicId=${clinicId}` : ''}`
  );

  // Fetch doctor availability
  const { data: availabilities, isLoading: availabilityLoading } = useQuery({
    queryKey: ['doctor-availability', doctorId, clinicId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (doctorId) params.append('doctorId', doctorId);
      if (clinicId) params.append('clinicId', clinicId);
      params.append('includeConflicts', 'true');
      params.append('includeWaitlist', 'true');

      const response = await apiClient.get(`/api/doctors/availability?${params}`);
      return response.data;
    },
    enabled: !!doctorId || !!clinicId,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });

  // Get scheduling conflicts
  const { data: conflicts = [] } = useQuery({
    queryKey: ['scheduling-conflicts', doctorId],
    queryFn: async () => {
      const response = await apiClient.get(`/api/scheduling/conflicts`, {
        params: { doctorId }
      });
      return response.data;
    },
    enabled: !!doctorId,
    refetchInterval: 15000, // More frequent for conflicts
  });

  // Get waitlist status
  const { data: waitlistPositions = {} } = useQuery({
    queryKey: ['waitlist-positions', doctorId],
    queryFn: async () => {
      const response = await apiClient.get(`/api/waitlist/status`, {
        params: { doctorId }
      });
      return response.data;
    },
    enabled: !!doctorId,
  });

  // Booking mutation
  const bookingMutation = useMutation({
    mutationFn: async (request: BookingRequest): Promise<BookingResult> => {
      const response = await apiClient.post('/api/appointments/book', request);
      return response.data;
    },
    onSuccess: (result) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ['doctor-availability'] });
      queryClient.invalidateQueries({ queryKey: ['scheduling-conflicts'] });
      queryClient.invalidateQueries({ queryKey: ['waitlist-positions'] });

      // Send real-time update if connected
      if (isConnected) {
        sendMessage({
          type: 'BOOKING_CONFIRMED',
          payload: result,
        });
      }
    },
  });

  // Cancellation mutation
  const cancellationMutation = useMutation({
    mutationFn: async ({ appointmentId, reason }: { appointmentId: string; reason?: string }) => {
      const response = await apiClient.post(`/api/appointments/${appointmentId}/cancel`, {
        reason,
        releaseSlot: true,
        notifyWaitlist: true,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-availability'] });
      queryClient.invalidateQueries({ queryKey: ['waitlist-positions'] });
    },
  });

  // Rescheduling mutation
  const rescheduleMutation = useMutation({
    mutationFn: async ({
      appointmentId,
      newAvailabilityId,
      reason
    }: {
      appointmentId: string;
      newAvailabilityId: string;
      reason?: string;
    }) => {
      const response = await apiClient.post(`/api/appointments/${appointmentId}/reschedule`, {
        newAvailabilityId,
        reason,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-availability'] });
    },
  });

  // Join waitlist mutation
  const joinWaitlistMutation = useMutation({
    mutationFn: async (request: Omit<BookingRequest, 'availabilityId'>) => {
      const response = await apiClient.post('/api/waitlist/join', request);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waitlist-positions'] });
    },
  });

  // Update scheduling state
  useEffect(() => {
    if (availabilities) {
      setSchedulingState(prev => ({
        ...prev,
        availabilities,
        isLoading: availabilityLoading,
      }));
    }
  }, [availabilities, availabilityLoading]);

  useEffect(() => {
    setSchedulingState(prev => ({
      ...prev,
      conflicts,
      waitlistPositions,
    }));
  }, [conflicts, waitlistPositions]);

  // WebSocket message handler
  useEffect(() => {
    if (!isConnected) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'AVAILABILITY_UPDATED':
            // Update availability in real-time
            queryClient.setQueryData(['doctor-availability'], (old: DoctorAvailability[] = []) => {
              return old.map(availability => 
                availability.id === data.payload.id ? data.payload : availability
              );
            });
            break;

          case 'SLOT_RELEASED':
            // Handle last-minute cancellation slot release
            queryClient.invalidateQueries({ queryKey: ['doctor-availability'] });
            break;

          case 'WAITLIST_NOTIFICATION':
            // Handle waitlist notifications
            if (data.payload.patientId) {
              // Show notification to patient
              queryClient.invalidateQueries({ queryKey: ['waitlist-positions'] });
            }
            break;

          case 'CONFLICT_DETECTED':
            // Handle booking conflicts
            queryClient.invalidateQueries({ queryKey: ['scheduling-conflicts'] });
            break;

          case 'APPOINTMENT_CANCELLED':
            // Handle appointment cancellations
            queryClient.invalidateQueries({ queryKey: ['doctor-availability'] });
            break;
        }
      } catch (error) {
        console.error('WebSocket message parse error:', error);
      }
    };

    wsRef.current = new WebSocket(`${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws/scheduling`);
    wsRef.current.addEventListener('message', handleMessage);

    return () => {
      if (wsRef.current) {
        wsRef.current.removeEventListener('message', handleMessage);
        wsRef.current.close();
      }
    };
  }, [isConnected, queryClient]);

  // Get available time slots for a date range
  const getAvailableSlots = useCallback((startDate: Date, endDate: Date) => {
    return availabilities?.filter(availability => {
      const availabilityDate = new Date(availability.date);
      return availabilityDate >= startDate && 
             availabilityDate <= endDate && 
             availability.isAvailable &&
             availability.availableSlots > 0;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) || [];
  }, [availabilities]);

  // Check for booking conflicts
  const checkConflicts = useCallback((availabilityId: string) => {
    const conflicts = schedulingState.conflicts.filter(conflict => 
      conflict.availabilityId === availabilityId
    );
    return conflicts;
  }, [schedulingState.conflicts]);

  // Get waitlist position for a doctor
  const getWaitlistPosition = useCallback((doctorId: string) => {
    return schedulingState.waitlistPositions[doctorId] || null;
  }, [schedulingState.waitlistPositions]);

  // Select time slots for booking
  const selectSlots = useCallback((slotIds: string[]) => {
    setSchedulingState(prev => ({
      ...prev,
      selectedSlots: slotIds,
    }));
  }, []);

  // Clear selected slots
  const clearSelection = useCallback(() => {
    setSchedulingState(prev => ({
      ...prev,
      selectedSlots: [],
    }));
  }, []);

  // Book appointment
  const bookAppointment = useCallback(async (request: BookingRequest) => {
    setSchedulingState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await bookingMutation.mutateAsync(request);
      
      setSchedulingState(prev => ({
        ...prev,
        isLoading: false,
        selectedSlots: [],
      }));

      return result;
    } catch (error: any) {
      setSchedulingState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Booking failed',
      }));
      throw error;
    }
  }, [bookingMutation]);

  // Cancel appointment
  const cancelAppointment = useCallback(async (appointmentId: string, reason?: string) => {
    return await cancellationMutation.mutateAsync({ appointmentId, reason });
  }, [cancellationMutation]);

  // Reschedule appointment
  const rescheduleAppointment = useCallback(async (
    appointmentId: string, 
    newAvailabilityId: string, 
    reason?: string
  ) => {
    return await rescheduleMutation.mutateAsync({ appointmentId, newAvailabilityId, reason });
  }, [rescheduleMutation]);

  // Join waitlist
  const joinWaitlist = useCallback(async (request: Omit<BookingRequest, 'availabilityId'>) => {
    return await joinWaitlistMutation.mutateAsync(request);
  }, [joinWaitlistMutation]);

  // Get scheduling analytics
  const getSchedulingAnalytics = useCallback(async (doctorId: string, dateRange: { from: Date; to: Date }) => {
    const response = await apiClient.get('/api/scheduling/analytics', {
      params: {
        doctorId,
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString(),
      }
    });
    return response.data as SchedulingAnalytics;
  }, []);

  // Get peak availability times
  const getPeakTimes = useCallback(async () => {
    const response = await apiClient.get('/api/scheduling/peak-times', {
      params: { doctorId }
    });
    return response.data;
  }, [doctorId]);

  return {
    // State
    ...schedulingState,
    availabilities: availabilities || [],
    conflicts,
    waitlistPositions,
    isConnected,

    // Actions
    getAvailableSlots,
    checkConflicts,
    getWaitlistPosition,
    selectSlots,
    clearSelection,
    bookAppointment,
    cancelAppointment,
    rescheduleAppointment,
    joinWaitlist,

    // Analytics
    getSchedulingAnalytics,
    getPeakTimes,

    // Loading states
    isBooking: bookingMutation.isPending,
    isCancelling: cancellationMutation.isPending,
    isRescheduling: rescheduleMutation.isPending,
    isJoiningWaitlist: joinWaitlistMutation.isPending,
  };
};

export default useDoctorScheduling;