"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CalendarDaysIcon,
  ClockIcon,
  SignalIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UserGroupIcon,
  WifiIcon,
  WifiOffIcon,
  RefreshCcwIcon,
  MapPinIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import { useAvailabilityTracker } from '@/hooks/service/use-availability-tracker';
import { useWaitTimeEstimator } from '@/hooks/service/use-wait-time-estimator';
import { TimeSlotBookingModal } from './time-slot-booking-modal';
import { WaitTimeDisplay } from './wait-time-display';
import { AvailabilityCalendar } from './availability-calendar';
import { ConflictResolutionNotification } from './conflict-resolution-notification';

interface RealTimeAvailabilityDisplayProps {
  serviceId: string;
  clinicId?: string;
  doctorId?: string;
  showMap?: boolean;
  showCalendar?: boolean;
  compact?: boolean;
}

export function RealTimeAvailabilityDisplay({
  serviceId,
  clinicId,
  doctorId,
  showMap = false,
  showCalendar = true,
  compact = false,
}: RealTimeAvailabilityDisplayProps) {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  
  const {
    availability,
    isLoading,
    error,
    isConnected,
    getAvailableSlots,
    getNextAvailableSlot,
    isSlotAvailable,
    forceRefresh,
    isBooking,
  } = useAvailabilityTracker({
    serviceId,
    clinicId,
    doctorId,
    enableRealTime: true,
    enableWebSocket: false, // Will use polling for now
  });

  const {
    estimation,
    getWaitTimeRange,
    getCapacityUtilization,
    getPeakTimeInfo,
  } = useWaitTimeEstimator({
    serviceId,
    clinicId,
    doctorId,
    enableRealTimeAdjustments: true,
  });

  // Get availability for selected date
  const selectedDateAvailability = useMemo(() => {
    return availability?.find(avail => avail.date === selectedDate);
  }, [availability, selectedDate]);

  const availableSlots = getAvailableSlots(selectedDate);
  const nextAvailableSlot = getNextAvailableSlot();
  const waitTimeRange = getWaitTimeRange();
  const capacityUtilization = getCapacityUtilization();
  const peakTimeInfo = getPeakTimeInfo();

  const handleSlotSelect = (slotId: string) => {
    setSelectedSlotId(slotId);
    setBookingModalOpen(true);
  };

  const handleRefresh = () => {
    forceRefresh();
  };

  const getAvailabilityStatus = () => {
    if (!selectedDateAvailability) {
      return {
        status: 'unknown',
        label: 'Unknown Availability',
        color: 'bg-gray-100 text-gray-800',
        icon: ExclamationTriangleIcon,
      };
    }

    switch (selectedDateAvailability.realTimeStatus) {
      case 'available':
        return {
          status: 'available',
          label: 'Available',
          color: 'bg-green-100 text-green-800',
          icon: CheckCircleIcon,
        };
      case 'limited':
        return {
          status: 'limited',
          label: 'Limited Availability',
          color: 'bg-yellow-100 text-yellow-800',
          icon: ClockIcon,
        };
      case 'waitlist':
        return {
          status: 'waitlist',
          label: 'Join Waitlist',
          color: 'bg-orange-100 text-orange-800',
          icon: UserGroupIcon,
        };
      case 'unavailable':
        return {
          status: 'unavailable',
          label: 'Unavailable',
          color: 'bg-red-100 text-red-800',
          icon: ExclamationTriangleIcon,
        };
      case 'maintenance':
        return {
          status: 'maintenance',
          label: 'Under Maintenance',
          color: 'bg-blue-100 text-blue-800',
          icon: SignalIcon,
        };
      default:
        return {
          status: 'unknown',
          label: 'Unknown',
          color: 'bg-gray-100 text-gray-800',
          icon: ExclamationTriangleIcon,
        };
    }
  };

  const status = getAvailabilityStatus();
  const StatusIcon = status.icon;

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded" />
            <div className="grid grid-cols-3 gap-2">
              <div className="h-12 bg-gray-200 rounded" />
              <div className="h-12 bg-gray-200 rounded" />
              <div className="h-12 bg-gray-200 rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert>
        <ExclamationTriangleIcon className="h-4 w-4" />
        <AlertDescription>
          Failed to load availability data. Please try again.
          <Button variant="link" onClick={handleRefresh} className="ml-2">
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <Card className="relative">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <CalendarDaysIcon className="h-5 w-5 text-blue-500" />
              <span>Real-Time Availability</span>
              {isConnected ? (
                <WifiIcon className="h-4 w-4 text-green-500" title="Connected" />
              ) : (
                <WifiOffIcon className="h-4 w-4 text-red-500" title="Disconnected" />
              )}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCcwIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Connection Status */}
          {!isConnected && (
            <Alert>
              <WifiOffIcon className="h-4 w-4" />
              <AlertDescription>
                Real-time updates unavailable. Showing cached data.
              </AlertDescription>
            </Alert>
          )}

          {/* Availability Status */}
          <div className="text-center p-6 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className={`p-3 rounded-full ${status.color}`}>
                <StatusIcon className="h-6 w-6" />
              </div>
            </div>
            <Badge variant="outline" className={status.color}>
              {status.label}
            </Badge>
            
            {/* Next Available */}
            {nextAvailableSlot && status.status === 'unavailable' && (
              <div className="mt-4">
                <div className="text-sm text-gray-600">Next Available</div>
                <div className="text-lg font-medium text-gray-900">
                  {new Date(nextAvailableSlot.date + ' ' + nextAvailableSlot.startTime).toLocaleString()}
                </div>
              </div>
            )}

            {/* Wait Time Estimate */}
            {waitTimeRange && (
              <div className="mt-2">
                <div className="text-sm text-gray-600">Estimated Wait</div>
                <div className="text-lg font-medium text-gray-900">
                  {waitTimeRange.min}-{waitTimeRange.max} minutes
                  <span className="text-sm text-gray-500 ml-1">
                    ({waitTimeRange.confidence}% confidence)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Capacity Utilization */}
            {capacityUtilization && (
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <SignalIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {capacityUtilization.percentage}%
                </div>
                <div className="text-sm text-gray-600">
                  {capacityUtilization.level} Capacity
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {capacityUtilization.availableSlots} slots available
                </div>
              </div>
            )}

            {/* Peak Time Status */}
            {peakTimeInfo && (
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <ClockIcon className={`h-8 w-8 mx-auto mb-2 ${
                  peakTimeInfo.isCurrentlyPeak ? 'text-orange-500' : 'text-green-500'
                }`} />
                <div className="text-lg font-bold text-gray-900">
                  {peakTimeInfo.isCurrentlyPeak ? 'Peak Hour' : 'Normal'}
                </div>
                <div className="text-sm text-gray-600">
                  {peakTimeInfo.peakLevel} Level
                </div>
                {peakTimeInfo.nextPeakStart && (
                  <div className="text-xs text-gray-500 mt-1">
                    Next peak: {new Date(peakTimeInfo.nextPeakStart).toLocaleTimeString()}
                  </div>
                )}
              </div>
            )}

            {/* Total Available Slots */}
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <UserGroupIcon className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {availableSlots.length}
              </div>
              <div className="text-sm text-gray-600">Available Slots</div>
              <div className="text-xs text-gray-500 mt-1">
                Today
              </div>
            </div>
          </div>

          {/* Wait Time Display */}
          {estimation && <WaitTimeDisplay estimation={estimation} />}

          {/* Time Slots */}
          {selectedDateAvailability && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">
                Available Times - {new Date(selectedDate).toLocaleDateString()}
              </h4>
              
              {availableSlots.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {availableSlots.map((slot) => (
                    <Button
                      key={slot.id}
                      variant="outline"
                      size="sm"
                      className="text-sm hover:bg-blue-50 hover:border-blue-300"
                      onClick={() => handleSlotSelect(slot.id)}
                    >
                      {slot.startTime.slice(11, 16)} {/* Extract time from ISO string */}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ClockIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No available time slots for this date</p>
                  <Button 
                    variant="link" 
                    onClick={() => setBookingModalOpen(true)}
                    className="mt-2"
                  >
                    Join Waitlist
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Calendar View */}
          {showCalendar && (
            <AvailabilityCalendar
              availability={availability}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              serviceId={serviceId}
              clinicId={clinicId}
            />
          )}

          {/* Emergency Contact */}
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <PhoneIcon className="h-5 w-5 text-red-600" />
              <h4 className="font-medium text-red-900">Emergency Care</h4>
            </div>
            <p className="text-sm text-red-800 mb-2">
              For medical emergencies, please call our 24/7 hotline or visit the nearest A&E.
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Emergency Contact: (65) 6789 1234
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
            <Button 
              className="flex-1"
              onClick={() => setBookingModalOpen(true)}
              disabled={isBooking}
            >
              Book Appointment
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => {/* Open waitlist modal */}}
            >
              Join Waitlist
            </Button>
          </div>
        </CardContent>

        {/* Conflict Resolution Notification */}
        {selectedDateAvailability?.status === 'maintenance' && (
          <ConflictResolutionNotification
            conflict={{
              id: 'maintenance-1',
              type: { category: 'maintenance' as any, requiresManualResolution: false },
              severity: 'medium',
              description: 'Service temporarily unavailable due to maintenance',
              detectedAt: new Date().toISOString(),
              priority: 1,
              conflictingSlots: [],
              originalSlot: {} as any,
              overlappingSlots: [],
              patientIds: [],
              doctorId: doctorId || '',
              clinicId: clinicId || '',
              serviceId,
              impactAnalysis: {} as any,
            }}
            onDismiss={() => {}}
          />
        )}
      </Card>

      {/* Booking Modal */}
      {bookingModalOpen && selectedSlotId && (
        <TimeSlotBookingModal
          isOpen={bookingModalOpen}
          onClose={() => {
            setBookingModalOpen(false);
            setSelectedSlotId(null);
          }}
          slotId={selectedSlotId}
          serviceId={serviceId}
          clinicId={clinicId}
          doctorId={doctorId}
        />
      )}
    </>
  );
}