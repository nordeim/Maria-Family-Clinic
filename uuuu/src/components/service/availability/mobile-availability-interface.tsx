"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { 
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  RefreshCcwIcon,
  WifiIcon,
  WifiOffIcon,
  BellIcon,
  BellSlashIcon,
  UserGroupIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { useAvailabilityTracker } from '@/hooks/service/use-availability-tracker';
import { useWaitTimeEstimator } from '@/hooks/service/use-wait-time-estimator';
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';
import { useHapticFeedback } from '@/hooks/use-haptic-feedback';
import { useSwipeGesture } from '@/hooks/use-swipe-gesture';

interface MobileAvailabilityInterfaceProps {
  serviceId: string;
  clinicId?: string;
  doctorId?: string;
  onSlotSelect?: (slotId: string) => void;
  onBookAppointment?: () => void;
}

export function MobileAvailabilityInterface({
  serviceId,
  clinicId,
  doctorId,
  onSlotSelect,
  onBookAppointment,
}: MobileAvailabilityInterfaceProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showTimeSlotsSheet, setShowTimeSlotsSheet] = useState(false);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);
  const [pullToRefreshActive, setPullToRefreshActive] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Custom hooks for mobile interactions
  const { refetch: triggerRefresh, isFetching } = useAvailabilityTracker({
    serviceId,
    clinicId,
    doctorId,
    enableRealTime: true,
    pollInterval: 30000,
  });

  const { estimation } = useWaitTimeEstimator({
    serviceId,
    clinicId,
    doctorId,
    enableRealTimeAdjustments: true,
  });

  // Pull to refresh functionality
  const { isPulling, canPull, pullProgress } = usePullToRefresh({
    onRefresh: () => {
      setPullToRefreshActive(true);
      triggerRefresh();
      setTimeout(() => setPullToRefreshActive(false), 2000);
    },
    threshold: 100,
    containerRef,
  });

  // Haptic feedback for interactions
  const { triggerHaptic } = useHapticFeedback();

  // Swipe gestures for calendar navigation
  const { bind, direction } = useSwipeGesture({
    onSwipeLeft: () => {
      triggerHaptic('light');
      navigateToNextDay();
    },
    onSwipeRight: () => {
      triggerHaptic('light');
      navigateToPreviousDay();
    },
    onSwipeUp: () => {
      triggerHaptic('light');
      setShowTimeSlotsSheet(true);
    },
    onSwipeDown: () => {
      triggerHaptic('light');
      triggerRefresh();
    },
  });

  const navigateToNextDay = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + 1);
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };

  const navigateToPreviousDay = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() - 1);
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };

  const navigateToToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    triggerHaptic('medium');
  };

  const handleSlotSelect = (slotId: string) => {
    triggerHaptic('medium');
    onSlotSelect?.(slotId);
    setShowTimeSlotsSheet(false);
  };

  const handleEnableNotifications = () => {
    setIsNotificationEnabled(true);
    triggerHaptic('success');
    // Here you would implement actual push notification registration
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-SG', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getAvailabilityStatus = () => {
    // Mock availability data - in real implementation, this would come from the tracker
    const mockStatus = {
      isAvailable: true,
      availableSlots: 8,
      nextAvailable: '2:30 PM',
      estimatedWait: 15,
      status: 'available' as const,
    };

    return mockStatus;
  };

  const availabilityStatus = getAvailabilityStatus();

  return (
    <div 
      ref={containerRef}
      className="relative h-full overflow-hidden bg-gray-50"
      {...bind}
    >
      {/* Pull to Refresh Indicator */}
      {isPulling && (
        <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-center pt-4">
          <div className="bg-white rounded-full p-2 shadow-lg">
            <RefreshCcwIcon 
              className={`h-6 w-6 text-blue-500 ${
                pullProgress > 0.5 ? 'animate-spin' : ''
              }`} 
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`transition-transform duration-300 ${
        isPulling ? 'translate-y-16' : 'translate-y-0'
      }`}>
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CalendarDaysIcon className="h-5 w-5 text-blue-500" />
              <h2 className="text-lg font-semibold text-gray-900">Availability</h2>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Connection Status */}
              <div className="flex items-center">
                <WifiIcon className="h-4 w-4 text-green-500" />
              </div>
              
              {/* Notification Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEnableNotifications}
                className={`${isNotificationEnabled ? 'text-blue-600' : 'text-gray-400'}`}
              >
                {isNotificationEnabled ? (
                  <BellIcon className="h-4 w-4" />
                ) : (
                  <BellSlashIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Date Navigation */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={navigateToPreviousDay}
              className="p-2"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </Button>
            
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {formatDate(selectedDate)}
              </div>
              <Button
                variant="link"
                size="sm"
                onClick={navigateToToday}
                className="p-0 text-blue-600"
              >
                Today
              </Button>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={navigateToNextDay}
              className="p-2"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Availability Status Card */}
        <div className="p-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                {/* Status Indicator */}
                <div className="flex items-center justify-center">
                  <div className={`p-4 rounded-full ${
                    availabilityStatus.status === 'available' 
                      ? 'bg-green-100' 
                      : 'bg-yellow-100'
                  }`}>
                    <ClockIcon className={`h-8 w-8 ${
                      availabilityStatus.status === 'available' 
                        ? 'text-green-600' 
                        : 'text-yellow-600'
                    }`} />
                  </div>
                </div>
                
                {/* Status Text */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {availabilityStatus.isAvailable ? 'Available' : 'Limited Availability'}
                  </h3>
                  <p className="text-gray-600">
                    {availabilityStatus.availableSlots} slots available
                  </p>
                </div>

                {/* Wait Time */}
                {estimation && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Estimated Wait</div>
                    <div className="text-xl font-bold text-gray-900">
                      {estimation.estimatedMinutes} minutes
                    </div>
                    <div className="text-sm text-gray-500">
                      {estimation.confidence}% confidence
                    </div>
                  </div>
                )}

                {/* Next Available */}
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">Next Available</div>
                  <div className="text-lg font-medium text-gray-900">
                    {availabilityStatus.nextAvailable}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="px-4 space-y-3">
          <Button
            className="w-full h-12 text-lg font-semibold"
            onClick={() => setShowTimeSlotsSheet(true)}
          >
            <CalendarDaysIcon className="h-5 w-5 mr-2" />
            View Time Slots
          </Button>
          
          <Button
            variant="outline"
            className="w-full h-12"
            onClick={onBookAppointment}
          >
            <PhoneIcon className="h-5 w-5 mr-2" />
            Book by Phone
          </Button>
        </div>

        {/* Clinic Info */}
        <div className="p-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center">
                <MapPinIcon className="h-4 w-4 mr-2 text-gray-500" />
                Clinic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Rating</span>
                  <div className="flex items-center space-x-1">
                    <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="font-medium">4.8</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Distance</span>
                  <span className="font-medium">2.3 km</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Parking</span>
                  <Badge variant="secondary" className="text-xs">
                    Available
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Emergency Contact */}
        <div className="px-4 pb-6">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <PhoneIcon className="h-5 w-5 text-red-600 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium text-red-900">Emergency Care</div>
                  <div className="text-sm text-red-700">
                    For urgent medical needs: (65) 6789 1234
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Time Slots Bottom Sheet */}
      <Sheet open={showTimeSlotsSheet} onOpenChange={setShowTimeSlotsSheet}>
        <SheetContent side="bottom" className="h-[80vh] rounded-t-lg">
          <SheetHeader>
            <SheetTitle className="text-center">
              Available Times - {formatDate(selectedDate)}
            </SheetTitle>
          </SheetHeader>
          
          <div className="mt-6 space-y-4">
            {/* Time Slots Grid */}
            <div className="grid grid-cols-3 gap-3">
              {[
                '09:00 AM', '09:30 AM', '10:00 AM',
                '10:30 AM', '11:00 AM', '11:30 AM',
                '02:00 PM', '02:30 PM', '03:00 PM',
                '03:30 PM', '04:00 PM', '04:30 PM',
              ].map((time, index) => (
                <Button
                  key={time}
                  variant="outline"
                  className="h-12 text-sm font-medium hover:bg-blue-50 hover:border-blue-300"
                  onClick={() => handleSlotSelect(`slot-${index}`)}
                >
                  {time}
                </Button>
              ))}
            </div>

            {/* Waitlist Option */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <UserGroupIcon className="h-5 w-5 text-yellow-600" />
                <span className="font-medium text-yellow-900">Join Waitlist</span>
              </div>
              <p className="text-sm text-yellow-800 mb-3">
                Get notified when earlier appointments become available.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Join Waitlist
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}