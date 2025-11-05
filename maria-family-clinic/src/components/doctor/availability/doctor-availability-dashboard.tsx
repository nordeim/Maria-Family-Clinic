/**
 * Real-Time Doctor Availability Dashboard
 * Sub-Phase 7.5: Doctor Availability & Scheduling Integration
 * 
 * Comprehensive dashboard for real-time doctor availability management
 * with multiple view options, booking interface, and analytics
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { 
  Clock, 
  Calendar as CalendarIcon, 
  Users, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Filter,
  RefreshCw,
  Bell,
  UserCheck,
  Smartphone,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useDoctorScheduling } from '@/hooks/doctor/use-doctor-scheduling';
import { DoctorAvailability, DoctorAppointmentStatus } from '@/types/doctor';
import { 
  format, 
  addDays, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval,
  isSameDay,
  parseISO,
  differenceInMinutes
} from 'date-fns';

import { TimeSlotBookingModal } from './time-slot-booking-modal';
import { AvailabilityCalendar } from './availability-calendar';
import { WaitlistManagement } from './waitlist-management';
import { SchedulingAnalytics } from './scheduling-analytics';
import { RealTimeUpdates } from './real-time-updates';
import { NotificationSystem } from './notification-system';

interface DoctorAvailabilityDashboardProps {
  doctorId: string;
  clinicId?: string;
  viewMode?: 'dashboard' | 'calendar' | 'analytics';
  isMobile?: boolean;
}

export const DoctorAvailabilityDashboard: React.FC<DoctorAvailabilityDashboardProps> = ({
  doctorId,
  clinicId,
  viewMode = 'dashboard',
  isMobile = false
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewType, setViewType] = useState<'day' | 'week' | 'month'>('week');
  const [selectedSlot, setSelectedSlot] = useState<DoctorAvailability | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(true);
  const [filterUrgency, setFilterUrgency] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const {
    availabilities,
    conflicts,
    waitlistPositions,
    isConnected,
    getAvailableSlots,
    checkConflicts,
    getWaitlistPosition,
    selectSlots,
    bookAppointment,
    cancelAppointment,
    rescheduleAppointment,
    joinWaitlist,
    isLoading,
    error
  } = useDoctorScheduling(doctorId, clinicId);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Trigger refetch
      window.dispatchEvent(new CustomEvent('availability-refresh'));
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Get availability for selected date
  const getAvailabilityForDate = useCallback((date: Date) => {
    return availabilities.filter(availability => {
      const availabilityDate = new Date(availability.date);
      return isSameDay(availabilityDate, date);
    });
  }, [availabilities]);

  // Get availability for week
  const getWeekAvailability = useCallback((date: Date) => {
    const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
    
    return eachDayOfInterval({ start: weekStart, end: weekEnd }).map(day => ({
      date: day,
      availabilities: getAvailabilityForDate(day),
      totalSlots: availabilities.filter(availability => {
        const availabilityDate = new Date(availability.date);
        return isSameDay(availabilityDate, day);
      }).length,
      availableSlots: availabilities.filter(availability => {
        const availabilityDate = new Date(availability.date);
        return isSameDay(availabilityDate, day) && availability.isAvailable && availability.availableSlots > 0;
      }).length
    }));
  }, [availabilities, getAvailabilityForDate]);

  // Get overall statistics
  const getStats = useCallback(() => {
    const totalSlots = availabilities.length;
    const availableSlots = availabilities.filter(a => a.isAvailable && a.availableSlots > 0).length;
    const totalConflicts = conflicts.length;
    const waitlistTotal = Object.values(waitlistPositions).reduce((sum, pos) => sum + pos, 0);

    return {
      totalSlots,
      availableSlots,
      utilizationRate: totalSlots > 0 ? ((totalSlots - availableSlots) / totalSlots) * 100 : 0,
      conflicts: totalConflicts,
      waitlistTotal,
      isConnected
    };
  }, [availabilities, conflicts, waitlistPositions, isConnected]);

  const stats = getStats();

  // Handle slot selection for booking
  const handleSlotSelect = (slot: DoctorAvailability) => {
    setSelectedSlot(slot);
    setIsBookingModalOpen(true);
  };

  // Handle quick book for available slot
  const handleQuickBook = async (slot: DoctorAvailability) => {
    try {
      const result = await bookAppointment({
        doctorId,
        availabilityId: slot.id,
        appointmentType: 'regular',
        urgencyLevel: 'ROUTINE'
      });

      if (result.success) {
        // Show success notification
        console.log('Booking successful:', result);
      } else {
        // Handle booking failure
        console.error('Booking failed:', result.message);
      }
    } catch (error) {
      console.error('Booking error:', error);
    }
  };

  // Get status badge component
  const getStatusBadge = (availability: DoctorAvailability) => {
    const conflicts = checkConflicts(availability.id);
    
    if (!availability.isAvailable) {
      return <Badge variant="secondary">Unavailable</Badge>;
    }
    
    if (availability.availableSlots === 0) {
      return <Badge variant="destructive">Full</Badge>;
    }
    
    if (conflicts.length > 0) {
      return <Badge variant="outline" className="bg-orange-50 border-orange-200 text-orange-700">
        <AlertCircle className="w-3 h-3 mr-1" />
        Conflict
      </Badge>;
    }

    if (availability.availableSlots <= 2) {
      return <Badge variant="outline" className="bg-yellow-50 border-yellow-200 text-yellow-700">
        Limited
      </Badge>;
    }

    return <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
      <CheckCircle className="w-3 h-3 mr-1" />
      Available
    </Badge>;
  };

  // Get time slot component
  const renderTimeSlot = (availability: DoctorAvailability, index: number) => {
    const startTime = parseISO(`2000-01-01T${availability.startTime}`);
    const endTime = parseISO(`2000-01-01T${availability.endTime}`);
    const duration = differenceInMinutes(endTime, startTime);
    
    const isEmergency = availability.isEmergency;
    const isTelehealth = availability.isTelehealth;
    const isWalkIn = availability.isWalkIn;

    return (
      <Card 
        key={availability.id}
        className={`cursor-pointer transition-all hover:shadow-md ${
          isEmergency ? 'border-red-200 bg-red-50' : 
          isTelehealth ? 'border-blue-200 bg-blue-50' :
          isWalkIn ? 'border-purple-200 bg-purple-50' :
          'hover:bg-gray-50'
        }`}
        onClick={() => handleSlotSelect(availability)}
      >
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4" />
                <span className="font-medium">
                  {availability.startTime} - {availability.endTime}
                </span>
                {isEmergency && <Badge variant="destructive" className="text-xs">Emergency</Badge>}
                {isTelehealth && <Badge variant="secondary" className="text-xs">Telehealth</Badge>}
                {isWalkIn && <Badge variant="outline" className="text-xs">Walk-in</Badge>}
              </div>
              
              <div className="text-sm text-gray-600 mb-2">
                Duration: {duration} minutes
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  {availability.availableSlots} / {availability.maxAppointments || availability.availableSlots} slots
                </span>
                {getStatusBadge(availability)}
              </div>
            </div>
            
            <div className="flex flex-col gap-1">
              {availability.isAvailable && availability.availableSlots > 0 && (
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuickBook(availability);
                  }}
                  disabled={!availability.isAvailable}
                >
                  Book
                </Button>
              )}
              
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  joinWaitlist({
                    doctorId,
                    appointmentType: 'regular',
                    urgencyLevel: 'ROUTINE',
                    patientInfo: {
                      name: 'Patient', // This would come from user context
                      phone: '+65XXXXXXX'
                    }
                  });
                }}
              >
                Join Waitlist
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading && !availabilities.length) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            <span>Loading availability...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          {isConnected ? (
            <Wifi className="w-5 h-5 text-green-500" />
          ) : (
            <WifiOff className="w-5 h-5 text-red-500" />
          )}
          <span className={`font-medium ${isConnected ? 'text-green-700' : 'text-red-700'}`}>
            {isConnected ? 'Real-time updates active' : 'Connection lost - retrying...'}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-green-50 text-green-700' : ''}
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto-refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-5'}`}>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{stats.totalSlots}</div>
                <div className="text-xs text-gray-600">Total Slots</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{stats.availableSlots}</div>
                <div className="text-xs text-gray-600">Available</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">{stats.utilizationRate.toFixed(1)}%</div>
                <div className="text-xs text-gray-600">Utilization</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <div>
                <div className="text-2xl font-bold">{stats.conflicts}</div>
                <div className="text-xs text-gray-600">Conflicts</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{stats.waitlistTotal}</div>
                <div className="text-xs text-gray-600">Waitlist</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={viewMode} onValueChange={(value) => {/* Handle view change */}}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="notifications">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          {/* View Type Selector */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={viewType === 'day' ? 'default' : 'outline'}
                onClick={() => setViewType('day')}
              >
                Day
              </Button>
              <Button
                size="sm"
                variant={viewType === 'week' ? 'default' : 'outline'}
                onClick={() => setViewType('week')}
              >
                Week
              </Button>
              <Button
                size="sm"
                variant={viewType === 'month' ? 'default' : 'outline'}
                onClick={() => setViewType('month')}
              >
                Month
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowOnlyAvailable(!showOnlyAvailable)}
              >
                <Filter className="w-4 h-4 mr-1" />
                {showOnlyAvailable ? 'Show All' : 'Available Only'}
              </Button>
            </div>
          </div>

          {/* Availability Display */}
          <div className="space-y-4">
            {viewType === 'day' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5" />
                    {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {getAvailabilityForDate(selectedDate).map((availability, index) => 
                    renderTimeSlot(availability, index)
                  )}
                  {getAvailabilityForDate(selectedDate).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No availability for this date
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {viewType === 'week' && (
              <div className="grid gap-4">
                {getWeekAvailability(selectedDate).map(({ date, availabilities, availableSlots }) => (
                  <Card key={date.toISOString()}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{format(date, 'EEEE, MMM d')}</span>
                        <Badge variant={availableSlots > 0 ? 'outline' : 'secondary'}>
                          {availableSlots} available
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {availabilities.map((availability) => renderTimeSlot(availability, 0))}
                        {availabilities.length === 0 && (
                          <div className="text-center py-4 text-gray-500">
                            No availability
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="calendar">
          <AvailabilityCalendar
            doctorId={doctorId}
            clinicId={clinicId}
            availabilities={availabilities}
            onSlotSelect={handleSlotSelect}
            onDateChange={setSelectedDate}
            selectedDate={selectedDate}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <SchedulingAnalytics
            doctorId={doctorId}
            availabilities={availabilities}
            conflicts={conflicts}
            waitlistPositions={waitlistPositions}
          />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationSystem
            doctorId={doctorId}
            isConnected={isConnected}
            conflicts={conflicts}
            waitlistPositions={waitlistPositions}
          />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {selectedSlot && (
        <TimeSlotBookingModal
          isOpen={isBookingModalOpen}
          onClose={() => {
            setIsBookingModalOpen(false);
            setSelectedSlot(null);
          }}
          slot={selectedSlot}
          doctorId={doctorId}
          onBook={bookAppointment}
          onJoinWaitlist={joinWaitlist}
        />
      )}

      <WaitlistManagement
        isOpen={isWaitlistModalOpen}
        onClose={() => setIsWaitlistModalOpen(false)}
        doctorId={doctorId}
      />

      <RealTimeUpdates
        isConnected={isConnected}
        conflicts={conflicts}
        onConflictResolved={() => {/* Handle conflict resolution */}}
      />
    </div>
  );
};

export default DoctorAvailabilityDashboard;