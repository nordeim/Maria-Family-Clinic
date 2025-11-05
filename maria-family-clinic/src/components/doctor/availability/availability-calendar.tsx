/**
 * Advanced Availability Calendar Component
 * Sub-Phase 7.5: Doctor Availability & Scheduling Integration
 * 
 * Interactive calendar with multiple view options, time slot visualization, and booking integration
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  List
} from 'lucide-react';
import { DoctorAvailability } from '@/types/doctor';
import { 
  format, 
  addDays, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isToday,
  startOfDay,
  endOfDay,
  differenceInMinutes,
  parseISO
} from 'date-fns';

interface AvailabilityCalendarProps {
  doctorId: string;
  clinicId?: string;
  availabilities: DoctorAvailability[];
  onSlotSelect: (slot: DoctorAvailability) => void;
  onDateChange: (date: Date) => void;
  selectedDate: Date;
  viewMode?: 'month' | 'week' | 'day';
  showPast?: boolean;
  isMobile?: boolean;
}

interface DayAvailability {
  date: Date;
  slots: DoctorAvailability[];
  totalSlots: number;
  availableSlots: number;
  conflicts: number;
  status: 'full' | 'available' | 'partial' | 'unavailable';
}

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  doctorId,
  clinicId,
  availabilities,
  onSlotSelect,
  onDateChange,
  selectedDate,
  viewMode = 'month',
  showPast = false,
  isMobile = false
}) => {
  const [displayMonth, setDisplayMonth] = useState(selectedDate);
  const [calendarView, setCalendarView] = useState(viewMode);
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(true);
  const [urgencyFilter, setUrgencyFilter] = useState<'all' | 'emergency' | 'routine'>('all');

  // Group availability by date
  const getDayAvailability = useCallback((date: Date): DayAvailability => {
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);
    
    const daySlots = availabilities.filter(slot => {
      const slotDate = parseISO(slot.date);
      return slotDate >= dayStart && slotDate <= dayEnd;
    });

    const availableSlots = daySlots.filter(slot => 
      slot.isAvailable && 
      slot.availableSlots > 0 &&
      (urgencyFilter === 'all' || 
       (urgencyFilter === 'emergency' && slot.isEmergency) ||
       (urgencyFilter === 'routine' && !slot.isEmergency))
    );

    const conflicts = daySlots.filter(slot => {
      // This would be populated from conflicts data
      return false; // Placeholder
    }).length;

    let status: DayAvailability['status'] = 'unavailable';
    if (daySlots.length === 0) {
      status = 'unavailable';
    } else if (availableSlots.length === 0) {
      status = 'full';
    } else if (availableSlots.length === daySlots.length) {
      status = 'available';
    } else {
      status = 'partial';
    }

    return {
      date,
      slots: daySlots,
      totalSlots: daySlots.length,
      availableSlots: availableSlots.length,
      conflicts,
      status
    };
  }, [availabilities, urgencyFilter]);

  // Get calendar days to display
  const calendarDays = useMemo(() => {
    const start = startOfWeek(displayMonth, { weekStartsOn: 1 });
    const end = endOfWeek(
      addDays(displayMonth, displayMonth.getMonth() === 11 ? 31 : 
        [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][displayMonth.getMonth()] - 1),
      { weekStartsOn: 1 }
    );

    const days = eachDayOfInterval({ start, end });
    return days.map(date => ({
      date,
      availability: getDayAvailability(date),
      isCurrentMonth: isSameMonth(date, displayMonth),
      isToday: isToday(date),
      isSelected: isSameDay(date, selectedDate)
    }));
  }, [displayMonth, getDayAvailability, selectedDate]);

  // Get time slots for selected day
  const getTimeSlotsForDay = useCallback((date: Date) => {
    return availabilities
      .filter(slot => {
        const slotDate = parseISO(slot.date);
        return isSameDay(slotDate, date) && (showOnlyAvailable ? slot.isAvailable : true);
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [availabilities, showOnlyAvailable]);

  // Handle day click
  const handleDayClick = useCallback((date: Date) => {
    onDateChange(date);
    setDisplayMonth(date);
  }, [onDateChange]);

  // Handle month navigation
  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    setDisplayMonth(prev => {
      const newMonth = direction === 'prev' 
        ? addDays(prev, -30)
        : addDays(prev, 30);
      return newMonth;
    });
  }, []);

  // Render day cell
  const renderDayCell = (day: any) => {
    const { date, availability, isCurrentMonth, isToday, isSelected } = day;
    const { status, availableSlots, totalSlots } = availability;

    let cellClasses = `min-h-[100px] p-2 border cursor-pointer transition-all `;
    let contentClasses = `h-full flex flex-col `;

    // Base styles
    if (!isCurrentMonth) {
      cellClasses += `text-gray-400 bg-gray-50 `;
    } else if (isToday) {
      cellClasses += `bg-blue-50 border-blue-200 `;
    } else if (isSelected) {
      cellClasses += `bg-blue-100 border-blue-300 `;
    } else {
      cellClasses += `bg-white hover:bg-gray-50 `;
    }

    // Status indicators
    if (status === 'full') {
      cellClasses += `opacity-60 `;
    } else if (status === 'unavailable') {
      cellClasses += `opacity-40 `;
    }

    return (
      <div
        key={date.toISOString()}
        className={cellClasses}
        onClick={() => handleDayClick(date)}
      >
        <div className={contentClasses}>
          {/* Date number */}
          <div className="flex items-center justify-between mb-1">
            <span className={`text-sm font-medium ${isToday ? 'text-blue-600' : ''}`}>
              {format(date, 'd')}
            </span>
            {isToday && (
              <Badge variant="outline" className="text-xs px-1 py-0">
                Today
              </Badge>
            )}
          </div>

          {/* Availability indicators */}
          {totalSlots > 0 && (
            <div className="flex-1 space-y-1">
              {/* Status indicator */}
              <div className="flex items-center gap-1">
                {status === 'available' && (
                  <CheckCircle className="w-3 h-3 text-green-500" />
                )}
                {status === 'full' && (
                  <XCircle className="w-3 h-3 text-red-500" />
                )}
                {status === 'partial' && (
                  <AlertCircle className="w-3 h-3 text-orange-500" />
                )}
                <span className="text-xs text-gray-600">
                  {availableSlots}/{totalSlots}
                </span>
              </div>

              {/* Quick slot preview */}
              <div className="space-y-1">
                {availability.slots.slice(0, 2).map((slot, index) => (
                  <div 
                    key={slot.id}
                    className={`text-xs p-1 rounded text-center ${
                      slot.isEmergency ? 'bg-red-100 text-red-700' :
                      slot.isTelehealth ? 'bg-blue-100 text-blue-700' :
                      slot.isWalkIn ? 'bg-purple-100 text-purple-700' :
                      'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {slot.startTime}
                  </div>
                ))}
                {availability.slots.length > 2 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{availability.slots.length - 2} more
                  </div>
                )}
              </div>
            </div>
          )}

          {/* No slots indicator */}
          {totalSlots === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <XCircle className="w-4 h-4 text-gray-400" />
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render time slot list
  const renderTimeSlotList = (date: Date) => {
    const timeSlots = getTimeSlotsForDay(date);

    return (
      <div className="space-y-2">
        {timeSlots.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CalendarIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            No availability for this date
          </div>
        ) : (
          timeSlots.map((slot) => {
            const startTime = parseISO(`2000-01-01T${slot.startTime}`);
            const endTime = parseISO(`2000-01-01T${slot.endTime}`);
            const duration = differenceInMinutes(endTime, startTime);

            return (
              <Card
                key={slot.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedSlots.has(slot.id) ? 'ring-2 ring-blue-500' : ''
                } ${slot.isEmergency ? 'border-red-200 bg-red-50' : ''}`}
                onClick={() => onSlotSelect(slot)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">
                          {slot.startTime} - {slot.endTime}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {duration}min
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{slot.availableSlots} slots available</span>
                        </div>
                        
                        {slot.isEmergency && (
                          <Badge variant="destructive" className="text-xs">Emergency</Badge>
                        )}
                        {slot.isTelehealth && (
                          <Badge variant="secondary" className="text-xs">Telehealth</Badge>
                        )}
                        {slot.isWalkIn && (
                          <Badge variant="outline" className="text-xs">Walk-in</Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {slot.isAvailable && slot.availableSlots > 0 ? (
                        <Button size="sm">
                          Book
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" disabled>
                          Unavailable
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-semibold">
            {format(displayMonth, 'MMMM yyyy')}
          </h2>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={showOnlyAvailable ? 'default' : 'outline'}
            onClick={() => setShowOnlyAvailable(!showOnlyAvailable)}
          >
            <Filter className="w-4 h-4 mr-1" />
            {showOnlyAvailable ? 'Available Only' : 'Show All'}
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => setDisplayMonth(new Date())}
          >
            Today
          </Button>
        </div>
      </div>

      {/* Mobile vs Desktop Layout */}
      {isMobile ? (
        <div className="space-y-4">
          {/* Mobile Date Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDate(addDays(selectedDate, -1))}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            
            <h3 className="font-semibold text-center">
              {format(selectedDate, 'EEEE, MMM d')}
            </h3>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDate(addDays(selectedDate, 1))}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {/* Mobile Calendar */}
          <div className="grid grid-cols-7 gap-1">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
                {day}
              </div>
            ))}
            
            {calendarDays.map((day) => (
              <div
                key={day.date.toISOString()}
                className={`aspect-square p-1 text-center text-sm cursor-pointer rounded ${
                  day.isCurrentMonth ? 'hover:bg-gray-100' : 'text-gray-400'
                } ${day.isToday ? 'bg-blue-100 text-blue-600' : ''} ${
                  day.isSelected ? 'bg-blue-200' : ''
                }`}
                onClick={() => handleDayClick(day.date)}
              >
                {format(day.date, 'd')}
                {day.availability.totalSlots > 0 && (
                  <div className="text-xs">
                    {day.availability.availableSlots > 0 ? '●' : '○'}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile Time Slots */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <List className="w-5 h-5" />
                Available Time Slots
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderTimeSlotList(selectedDate)}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-7 gap-2">
                  {/* Day headers */}
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
                      {day}
                    </div>
                  ))}
                  
                  {/* Day cells */}
                  {calendarDays.map(renderDayCell)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Time Slots Panel */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  {format(selectedDate, 'EEEE, MMM d')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderTimeSlotList(selectedDate)}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium mb-2">Legend</h3>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              <span>Full</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-500" />
              <span>Partial</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
              <span>Emergency</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded"></div>
              <span>Telehealth</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-100 border border-purple-200 rounded"></div>
              <span>Walk-in</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AvailabilityCalendar;