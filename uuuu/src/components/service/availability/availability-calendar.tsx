"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { ServiceAvailability } from '@/hooks/service/use-availability-tracker';

interface AvailabilityCalendarProps {
  availability: ServiceAvailability[];
  selectedDate: string;
  onDateSelect: (date: string) => void;
  serviceId: string;
  clinicId?: string;
  doctorId?: string;
  compact?: boolean;
}

export function AvailabilityCalendar({
  availability,
  selectedDate,
  onDateSelect,
  serviceId,
  clinicId,
  doctorId,
  compact = false,
}: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDate = new Date(startDate);
    
    // Generate 6 weeks (42 days) to ensure we have a full calendar grid
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  }, [currentMonth]);

  // Get availability for a specific date
  const getDateAvailability = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return availability?.find(avail => avail.date === dateString);
  };

  // Check if a date has availability
  const hasAvailability = (date: Date) => {
    const availability = getDateAvailability(date);
    return availability && availability.realTimeStatus !== 'unavailable' && availability.capacity.availableCount > 0;
  };

  // Get availability level for a date
  const getAvailabilityLevel = (date: Date) => {
    const dateAvailability = getDateAvailability(date);
    if (!dateAvailability) return 'none';
    
    switch (dateAvailability.realTimeStatus) {
      case 'available':
        return dateAvailability.capacity.availableCount > 5 ? 'high' : 'low';
      case 'limited':
        return 'limited';
      case 'waitlist':
        return 'waitlist';
      case 'maintenance':
        return 'maintenance';
      default:
        return 'none';
    }
  };

  // Get number of available slots for a date
  const getAvailableSlotCount = (date: Date) => {
    const dateAvailability = getDateAvailability(date);
    return dateAvailability?.capacity.availableCount || 0;
  };

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
    onDateSelect(new Date().toISOString().split('T')[0]);
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return dateString === selectedDate;
  };

  // Get availability status color and icon
  const getStatusDisplay = (date: Date) => {
    const level = getAvailabilityLevel(date);
    const slotCount = getAvailableSlotCount(date);
    
    switch (level) {
      case 'high':
        return {
          color: 'bg-green-500 text-white',
          icon: CheckCircleIcon,
          label: `${slotCount} slots available`,
        };
      case 'low':
        return {
          color: 'bg-yellow-500 text-white',
          icon: ClockIcon,
          label: `${slotCount} slots left`,
        };
      case 'limited':
        return {
          color: 'bg-orange-500 text-white',
          icon: ExclamationTriangleIcon,
          label: 'Limited availability',
        };
      case 'waitlist':
        return {
          color: 'bg-purple-500 text-white',
          icon: UserGroupIcon,
          label: 'Waitlist only',
        };
      case 'maintenance':
        return {
          color: 'bg-blue-500 text-white',
          icon: ExclamationTriangleIcon,
          label: 'Maintenance',
        };
      default:
        return {
          color: 'bg-gray-300 text-gray-600',
          icon: XCircleIcon,
          label: 'No availability',
        };
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <CalendarDaysIcon className="h-5 w-5 text-blue-500" />
            <span>Availability Calendar</span>
          </CardTitle>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          
          <h3 className="text-lg font-semibold">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          
          <Button variant="outline" size="sm" onClick={goToNextMonth}>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1">
          {dayNames.map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date, index) => {
            const status = getStatusDisplay(date);
            const StatusIcon = status.icon;
            const isCurrentMonthDay = isCurrentMonth(date);
            const isTodayDay = isToday(date);
            const isSelectedDay = isSelected(date);
            
            return (
              <button
                key={index}
                onClick={() => onDateSelect(date.toISOString().split('T')[0])}
                disabled={!isCurrentMonthDay}
                className={`
                  relative aspect-square p-1 text-sm rounded-lg transition-all
                  ${!isCurrentMonthDay ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-100 cursor-pointer'}
                  ${isSelectedDay ? 'ring-2 ring-blue-500' : ''}
                `}
              >
                <div className={`
                  flex flex-col items-center justify-center h-full rounded
                  ${isTodayDay ? 'ring-2 ring-blue-300' : ''}
                  ${isSelectedDay && isCurrentMonthDay ? 'bg-blue-50' : ''}
                `}>
                  <span className={`
                    ${!isCurrentMonthDay ? 'text-gray-400' : 'text-gray-900'}
                    ${isTodayDay ? 'font-bold text-blue-600' : ''}
                  `}>
                    {date.getDate()}
                  </span>
                  
                  {isCurrentMonthDay && (
                    <div className="mt-1">
                      <StatusIcon className={`h-3 w-3 ${status.color}`} />
                    </div>
                  )}
                </div>

                {/* Tooltip */}
                {isCurrentMonthDay && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    {status.label}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-4 border-t">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-600">Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-xs text-gray-600">Limited</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-xs text-gray-600">Waitlist</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-xs text-gray-600">Maintenance</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
            <span className="text-xs text-gray-600">No Slots</span>
          </div>
        </div>

        {/* Selected Date Details */}
        {selectedDate && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">
              {formatDate(new Date(selectedDate))}
            </h4>
            {(() => {
              const selectedDateAvailability = getDateAvailability(new Date(selectedDate));
              if (!selectedDateAvailability) {
                return (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <XCircleIcon className="h-4 w-4" />
                    <span>No availability</span>
                  </div>
                );
              }

              const status = getStatusDisplay(new Date(selectedDate));
              const StatusIcon = status.icon;

              return (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <StatusIcon className={`h-4 w-4 ${status.color}`} />
                    <span className="text-sm text-gray-700">{status.label}</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Available Slots</div>
                      <div className="font-medium">
                        {selectedDateAvailability.capacity.availableCount}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">Booked</div>
                      <div className="font-medium">
                        {selectedDateAvailability.capacity.bookedCount}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">Waitlist</div>
                      <div className="font-medium">
                        {selectedDateAvailability.capacity.waitlistCount}
                      </div>
                    </div>
                  </div>
                  
                  {selectedDateAvailability.estimatedWaitTime && (
                    <div className="text-sm text-gray-600">
                      Estimated wait time: {selectedDateAvailability.estimatedWaitTime} minutes
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}