"use client";

import React, { useState } from 'react';
import { useService, useServiceAvailability } from '@/hooks/use-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CalendarDaysIcon, 
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SignalIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

interface ServiceAvailabilitySectionProps {
  serviceId: string;
}

export function ServiceAvailabilitySection({ serviceId }: ServiceAvailabilitySectionProps) {
  const { data: service, isLoading } = useService(serviceId);
  const { data: availability, isLoading: availabilityLoading } = useServiceAvailability(serviceId);
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');

  if (isLoading || availabilityLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="h-64 bg-gray-200 rounded" />
      </div>
    );
  }

  // Default availability data
  const availabilityData = availability || {
    isAvailable: true,
    nextAvailableDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    estimatedWaitTime: 15, // minutes
    scheduleSlots: [
      { time: '09:00', available: true },
      { time: '09:30', available: false },
      { time: '10:00', available: true },
      { time: '10:30', available: true },
      { time: '11:00', available: false },
      { time: '11:30', available: true },
      { time: '14:00', available: true },
      { time: '14:30', available: true },
      { time: '15:00', available: false },
      { time: '15:30', available: true },
      { time: '16:00', available: true },
    ],
    advanceBookingDays: 0,
    isUrgentAvailable: true,
    isEmergencySlot: false,
  };

  const getAvailabilityStatus = () => {
    if (!availabilityData.isAvailable) {
      return {
        status: 'unavailable',
        label: 'Currently Unavailable',
        color: 'bg-red-100 text-red-800',
        icon: ExclamationTriangleIcon,
      };
    }
    
    if (availabilityData.estimatedWaitTime && availabilityData.estimatedWaitTime > 30) {
      return {
        status: 'long-wait',
        label: 'Long Wait Time',
        color: 'bg-yellow-100 text-yellow-800',
        icon: ClockIcon,
      };
    }
    
    return {
      status: 'available',
      label: 'Available Today',
      color: 'bg-green-100 text-green-800',
      icon: CheckCircleIcon,
    };
  };

  const availabilityStatus = getAvailabilityStatus();
  const StatusIcon = availabilityStatus.icon;

  const timeframes = [
    { key: 'today', label: 'Today', days: 1 },
    { key: 'week', label: 'This Week', days: 7 },
    { key: 'month', label: 'This Month', days: 30 },
  ];

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-SG', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CalendarDaysIcon className="h-5 w-5 text-blue-500" />
          <span>Service Availability</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="urgent">Urgent Care</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Current Availability Status */}
            <div className="text-center p-6 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className={`p-3 rounded-full ${availabilityStatus.color}`}>
                  <StatusIcon className="h-6 w-6" />
                </div>
              </div>
              <Badge variant="outline" className={availabilityStatus.color}>
                {availabilityStatus.label}
              </Badge>
              
              {availabilityData.nextAvailableDate && (
                <div className="mt-4">
                  <div className="text-sm text-gray-600">Next Available</div>
                  <div className="text-lg font-medium text-gray-900">
                    {formatDate(availabilityData.nextAvailableDate)}
                  </div>
                </div>
              )}
              
              {availabilityData.estimatedWaitTime && (
                <div className="mt-2">
                  <div className="text-sm text-gray-600">Estimated Wait</div>
                  <div className="text-lg font-medium text-gray-900">
                    {availabilityData.estimatedWaitTime} minutes
                  </div>
                </div>
              )}
            </div>

            {/* Service Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <SignalIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">95%</div>
                <div className="text-sm text-gray-600">On-time Rate</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <UserGroupIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {service?.typicalDurationMin || 30}
                </div>
                <div className="text-sm text-gray-600">Avg Duration (min)</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <CheckCircleIcon className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">4.8</div>
                <div className="text-sm text-gray-600">Patient Rating</div>
              </div>
            </div>

            {/* Booking Information */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">How to Book</h4>
              <div className="space-y-2 text-sm text-blue-800">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                  <span>Select your preferred date and time</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                  <span>Provide your contact and insurance information</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                  <span>Confirm your appointment via SMS or email</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            {/* Timeframe Selection */}
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Schedule View</h4>
              <div className="flex space-x-2">
                {timeframes.map((timeframe) => (
                  <Button
                    key={timeframe.key}
                    variant={selectedTimeframe === timeframe.key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTimeframe(timeframe.key)}
                  >
                    {timeframe.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Today's Schedule */}
            <div className="space-y-3">
              <h5 className="font-medium text-gray-900">Available Times Today</h5>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {availabilityData.scheduleSlots.map((slot, index) => (
                  <Button
                    key={index}
                    variant={slot.available ? "outline" : "secondary"}
                    size="sm"
                    disabled={!slot.available}
                    className={`text-sm ${
                      slot.available 
                        ? 'hover:bg-blue-50 hover:border-blue-300' 
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    {slot.time}
                    {!slot.available && (
                      <span className="ml-1 text-xs">×</span>
                    )}
                  </Button>
                ))}
              </div>
            </div>

            {/* Weekly Overview */}
            <div className="space-y-3">
              <h5 className="font-medium text-gray-900">This Week Overview</h5>
              <div className="grid grid-cols-1 sm:grid-cols-7 gap-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                  const hasSlots = index < 5; // Weekdays have slots
                  return (
                    <div key={day} className="text-center">
                      <div className="text-sm font-medium text-gray-600 mb-2">{day}</div>
                      <div className={`p-3 rounded-lg border ${
                        hasSlots ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                      }`}>
                        {hasSlots ? (
                          <div className="space-y-1">
                            <div className="text-xs text-green-600">Available</div>
                            <div className="text-xs text-gray-500">{Math.floor(Math.random() * 6) + 4} slots</div>
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400">Closed</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="urgent" className="space-y-4">
            {/* Urgent Care Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-orange-600" />
                  <h4 className="font-medium text-orange-900">Same-Day Appointments</h4>
                </div>
                <p className="text-sm text-orange-800 mb-3">
                  Limited same-day appointments available for urgent medical needs.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Check Same-Day Availability
                </Button>
              </div>

              <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <SignalIcon className="h-5 w-5 text-red-600" />
                  <h4 className="font-medium text-red-900">Emergency Care</h4>
                </div>
                <p className="text-sm text-red-800 mb-3">
                  For medical emergencies, please call our emergency hotline or visit the nearest A&E.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Emergency Contact
                </Button>
              </div>
            </div>

            {/* Advance Booking Notice */}
            {availabilityData.advanceBookingDays && availabilityData.advanceBookingDays > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <div className="flex items-start space-x-2">
                  <InformationCircleIcon className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Advance Booking Notice</p>
                    <p>
                      This service requires booking at least {availabilityData.advanceBookingDays} day(s) in advance. 
                      Early booking is recommended to secure your preferred time slot.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
          <Button className="flex-1">
            Book Appointment Now
          </Button>
          <Button variant="outline" className="flex-1">
            Join Wait List
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}