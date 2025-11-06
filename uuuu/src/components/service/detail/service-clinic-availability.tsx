"use client";

import React, { useState } from 'react';
import { useServiceData } from '@/hooks/use-service-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  ChevronRightIcon,
  PhoneIcon,
  StarIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserGroupIcon,
  GlobeAltIcon,
  FilterIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface ServiceClinicAvailabilityProps {
  category: string;
  serviceSlug: string;
  locale: string;
}

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  doctorName: string;
  doctorTitle: string;
  waitTime?: number;
  price: number;
  isRush?: boolean;
}

interface ClinicAvailability {
  clinicId: string;
  clinicName: string;
  location: string;
  address: string;
  phone: string;
  email: string;
  languages: string[];
  doctorName: string;
  doctorTitle: string;
  doctorRating: number;
  totalRatings: number;
  specializations: string[];
  facilities: string[];
  rating: number;
  totalReviews: number;
  nextAvailable: string;
  earliestTime: string;
  slots: TimeSlot[];
  isAvailableToday: boolean;
  weeklySchedule: WeeklySchedule[];
  requirements?: string[];
  insuranceAccepted: string[];
  accessibilityFeatures: string[];
  parkingAvailable: boolean;
  mrtAccessible: boolean;
}

interface WeeklySchedule {
  day: string;
  open: string;
  close: string;
  isOpen: boolean;
}

export function ServiceClinicAvailability({ category, serviceSlug, locale }: ServiceClinicAvailabilityProps) {
  const { data: service, isLoading } = useServiceData(category, serviceSlug, locale);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedClinic, setSelectedClinic] = useState<string>('');
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [expandedClinic, setExpandedClinic] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="h-96 bg-gray-200 rounded" />
      </div>
    );
  }

  if (!service) return null;

  // Mock comprehensive clinic availability data
  const clinicAvailability: ClinicAvailability[] = [
    {
      clinicId: 'orchard-1',
      clinicName: 'My Family Clinic - Orchard Medical Centre',
      location: 'Orchard Road',
      address: '123 Orchard Road, #03-15 Medical Centre, Singapore 238858',
      phone: '(65) 6789 1234',
      email: 'orchard@myfamilyclinic.com',
      languages: ['English', 'Chinese', 'Malay'],
      doctorName: 'Dr. Sarah Johnson',
      doctorTitle: 'Senior Family Physician',
      doctorRating: 4.8,
      totalRatings: 156,
      specializations: ['Family Medicine', 'Preventive Care', 'Chronic Disease Management', 'Health Screening'],
      facilities: ['Digital X-Ray', 'Ultrasound', 'ECG', 'Laboratory', 'Pharmacy'],
      rating: 4.7,
      totalReviews: 234,
      nextAvailable: '2024-11-06T09:00:00',
      earliestTime: '08:30',
      isAvailableToday: true,
      requirements: ['Valid ID required', 'Insurance card recommended', 'Medication list helpful'],
      insuranceAccepted: ['Medisave', 'Medishield', 'Private Insurance', 'Corporate Plans'],
      accessibilityFeatures: ['Wheelchair accessible', 'Hearing loop', 'Large print materials'],
      parkingAvailable: true,
      mrtAccessible: true,
      slots: generateMockSlots(),
      weeklySchedule: [
        { day: 'Monday', open: '08:30', close: '20:00', isOpen: true },
        { day: 'Tuesday', open: '08:30', close: '20:00', isOpen: true },
        { day: 'Wednesday', open: '08:30', close: '20:00', isOpen: true },
        { day: 'Thursday', open: '08:30', close: '20:00', isOpen: true },
        { day: 'Friday', open: '08:30', close: '20:00', isOpen: true },
        { day: 'Saturday', open: '09:00', close: '17:00', isOpen: true },
        { day: 'Sunday', open: '10:00', close: '16:00', isOpen: true },
      ]
    },
    {
      clinicId: 'novena-1',
      clinicName: 'My Family Clinic - Novena Specialist Centre',
      location: 'Novena',
      address: '456 Novena Road, #02-08 Specialist Centre, Singapore 313843',
      phone: '(65) 6789 5678',
      email: 'novena@myfamilyclinic.com',
      languages: ['English', 'Chinese', 'Tamil'],
      doctorName: 'Dr. Michael Chen',
      doctorTitle: 'Family Medicine Specialist',
      doctorRating: 4.9,
      totalRatings: 203,
      specializations: ['Family Medicine', 'Sports Medicine', 'Geriatric Care', 'Travel Medicine'],
      facilities: ['Digital X-Ray', 'Ultrasound', 'ECG', 'Spirometry', 'Vaccination Centre'],
      rating: 4.8,
      totalReviews: 189,
      nextAvailable: '2024-11-05T14:30:00',
      earliestTime: '09:00',
      isAvailableToday: false,
      requirements: ['Valid ID required', 'Health screening forms'],
      insuranceAccepted: ['Medisave', 'Private Insurance', 'Corporate Plans'],
      accessibilityFeatures: ['Wheelchair accessible', 'Elevator access'],
      parkingAvailable: false,
      mrtAccessible: true,
      slots: generateMockSlots(),
      weeklySchedule: [
        { day: 'Monday', open: '09:00', close: '19:00', isOpen: true },
        { day: 'Tuesday', open: '09:00', close: '19:00', isOpen: true },
        { day: 'Wednesday', open: '09:00', close: '19:00', isOpen: true },
        { day: 'Thursday', open: '09:00', close: '19:00', isOpen: true },
        { day: 'Friday', open: '09:00', close: '18:00', isOpen: true },
        { day: 'Saturday', open: '09:00', close: '15:00', isOpen: true },
        { day: 'Sunday', open: '10:00', close: '14:00', isOpen: true },
      ]
    },
    {
      clinicId: 'woodlands-1',
      clinicName: 'My Family Clinic - Woodlands Regional',
      location: 'Woodlands',
      address: '789 Woodlands Drive 50, #B1-12 Regional Centre, Singapore 733894',
      phone: '(65) 6789 9876',
      email: 'woodlands@myfamilyclinic.com',
      languages: ['English', 'Chinese', 'Malay', 'Tamil'],
      doctorName: 'Dr. Priya Sharma',
      doctorTitle: 'Senior Family Physician',
      doctorRating: 4.6,
      totalRatings: 142,
      specializations: ['Family Medicine', 'Women\'s Health', 'Pediatric Care', 'Mental Health'],
      facilities: ['Digital X-Ray', 'Ultrasound', 'ECG', 'Pediatric Corner', 'Women\'s Health Suite'],
      rating: 4.5,
      totalReviews: 167,
      nextAvailable: '2024-11-07T10:00:00',
      earliestTime: '08:00',
      isAvailableToday: true,
      requirements: ['Valid ID required'],
      insuranceAccepted: ['Medisave', 'Medishield', 'Corporate Plans'],
      accessibilityFeatures: ['Wheelchair accessible', 'Children\'s play area'],
      parkingAvailable: true,
      mrtAccessible: false,
      slots: generateMockSlots(),
      weeklySchedule: [
        { day: 'Monday', open: '08:00', close: '20:00', isOpen: true },
        { day: 'Tuesday', open: '08:00', close: '20:00', isOpen: true },
        { day: 'Wednesday', open: '08:00', close: '20:00', isOpen: true },
        { day: 'Thursday', open: '08:00', close: '20:00', isOpen: true },
        { day: 'Friday', open: '08:00', close: '19:00', isOpen: true },
        { day: 'Saturday', open: '08:30', close: '16:30', isOpen: true },
        { day: 'Sunday', open: '09:00', close: '15:00', isOpen: true },
      ]
    }
  ];

  const formatTime = (time: string) => {
    return new Date(`2024-01-01T${time}:00`).toLocaleTimeString('en-SG', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-SG', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getWaitTimeColor = (waitTime?: number) => {
    if (!waitTime) return 'text-gray-500';
    if (waitTime <= 15) return 'text-green-600';
    if (waitTime <= 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getWaitTimeText = (waitTime?: number) => {
    if (!waitTime) return 'No wait';
    if (waitTime <= 15) return `${waitTime} min`;
    if (waitTime <= 30) return `${waitTime} min`;
    return `${waitTime} min`;
  };

  const toggleClinic = (clinicId: string) => {
    setExpandedClinic(expandedClinic === clinicId ? null : clinicId);
  };

  return (
    <div id="clinic-availability" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPinIcon className="h-5 w-5 text-green-500" />
            <span>Real-Time Clinic Availability</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Book appointments at our conveniently located clinics across Singapore
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="calendar" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="calendar">Calendar View</TabsTrigger>
              <TabsTrigger value="list">Clinic List</TabsTrigger>
              <TabsTrigger value="map">Map View</TabsTrigger>
            </TabsList>

            {/* Calendar View Tab */}
            <TabsContent value="calendar" className="space-y-4">
              {/* Date Selection */}
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">Select Appointment Date</h3>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">Today</Button>
                  <Button variant="outline" size="sm">Tomorrow</Button>
                  <Button variant="outline" size="sm">This Week</Button>
                </div>
              </div>

              {/* Next 7 Days Calendar */}
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 7 }, (_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() + i);
                  const isToday = i === 0;
                  
                  return (
                    <Button
                      key={i}
                      variant="outline"
                      className={cn(
                        "h-20 flex flex-col p-2",
                        isToday && "border-blue-500 bg-blue-50"
                      )}
                    >
                      <div className="text-xs text-gray-600">
                        {date.toLocaleDateString('en-SG', { weekday: 'short' })}
                      </div>
                      <div className="text-sm font-medium">
                        {date.getDate()}
                      </div>
                      <div className="text-xs text-green-600">
                        Available
                      </div>
                    </Button>
                  );
                })}
              </div>

              {/* Clinic Availability for Selected Date */}
              <div className="space-y-4">
                {clinicAvailability.map((clinic) => (
                  <Card key={clinic.clinicId} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        {/* Clinic Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium text-gray-900">{clinic.clinicName}</h4>
                              {clinic.isAvailableToday && (
                                <Badge variant="default" className="bg-green-600 text-white">
                                  Available Today
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{clinic.address}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                              <div className="flex items-center space-x-1">
                                <StarIcon className="h-3 w-3 text-yellow-500" />
                                <span>{clinic.rating} ({clinic.totalReviews} reviews)</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <UserGroupIcon className="h-3 w-3" />
                                <span>{clinic.doctorName}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600">Next available</div>
                            <div className="text-sm font-medium text-green-600">
                              {formatDate(clinic.nextAvailable)} {formatTime(clinic.earliestTime)}
                            </div>
                          </div>
                        </div>

                        {/* Time Slots */}
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium text-gray-700">Available Times</h5>
                          <div className="flex flex-wrap gap-2">
                            {clinic.slots.slice(0, 8).map((slot) => (
                              <Button
                                key={slot.id}
                                variant={slot.available ? "outline" : "ghost"}
                                size="sm"
                                disabled={!slot.available}
                                className={cn(
                                  "h-8",
                                  !slot.available && "opacity-50 cursor-not-allowed"
                                )}
                              >
                                <div className="flex flex-col items-center">
                                  <span className="text-xs">{slot.time}</span>
                                  {slot.available && (
                                    <span className={cn("text-xs", getWaitTimeColor(slot.waitTime))}>
                                      {getWaitTimeText(slot.waitTime)}
                                    </span>
                                  )}
                                </div>
                              </Button>
                            ))}
                            {clinic.slots.length > 8 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleClinic(clinic.clinicId)}
                                className="h-8"
                              >
                                +{clinic.slots.length - 8} more
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-2">
                          <Button size="sm" className="flex-1">
                            Book Now
                          </Button>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                          <Button variant="outline" size="sm">
                            <PhoneIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Clinic List Tab */}
            <TabsContent value="list" className="space-y-4">
              <div className="space-y-4">
                {clinicAvailability.map((clinic) => {
                  const isExpanded = expandedClinic === clinic.clinicId;
                  
                  return (
                    <Card key={clinic.clinicId} className="border border-gray-200">
                      <Collapsible open={isExpanded} onOpenChange={() => toggleClinic(clinic.clinicId)}>
                        <CollapsibleTrigger asChild>
                          <div className="p-4 cursor-pointer hover:bg-gray-50">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3">
                                  <MapPinIcon className="h-5 w-5 text-gray-400" />
                                  <div>
                                    <h4 className="font-medium text-gray-900">{clinic.clinicName}</h4>
                                    <p className="text-sm text-gray-600">{clinic.location}</p>
                                    <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                                      <div className="flex items-center space-x-1">
                                        <StarIcon className="h-3 w-3 text-yellow-500" />
                                        <span>{clinic.rating}</span>
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <UserGroupIcon className="h-3 w-3" />
                                        <span>{clinic.doctorName}</span>
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <GlobeAltIcon className="h-3 w-3" />
                                        <span>{clinic.languages.join(', ')}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="text-right space-y-1">
                                <div className="text-sm font-medium text-green-600">
                                  Next: {formatTime(clinic.earliestTime)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {clinic.isAvailableToday ? 'Available today' : 'Tomorrow'}
                                </div>
                              </div>
                              
                              <ChevronRightIcon className="h-4 w-4 text-gray-400 ml-4" />
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        
                        <CollapsibleContent>
                          <div className="border-t border-gray-200 p-4 space-y-4">
                            {/* Contact Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <h5 className="font-medium text-gray-900">Contact Information</h5>
                                <div className="text-sm text-gray-600 space-y-1">
                                  <div className="flex items-center space-x-2">
                                    <PhoneIcon className="h-3 w-3" />
                                    <span>{clinic.phone}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span>📧</span>
                                    <span>{clinic.email}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <MapPinIcon className="h-3 w-3" />
                                    <span>{clinic.address}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <h5 className="font-medium text-gray-900">Facilities & Access</h5>
                                <div className="text-sm text-gray-600 space-y-1">
                                  <div>Parking: {clinic.parkingAvailable ? 'Available' : 'Not available'}</div>
                                  <div>MRT: {clinic.mrtAccessible ? 'Accessible' : 'Not accessible'}</div>
                                  <div>Languages: {clinic.languages.join(', ')}</div>
                                </div>
                              </div>
                            </div>

                            {/* Weekly Schedule */}
                            <div>
                              <h5 className="font-medium text-gray-900 mb-2">Weekly Hours</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                {clinic.weeklySchedule.map((schedule) => (
                                  <div key={schedule.day} className="flex justify-between">
                                    <span className="text-gray-600">{schedule.day}</span>
                                    <span className={schedule.isOpen ? "text-green-600" : "text-red-600"}>
                                      {schedule.isOpen ? `${formatTime(schedule.open)} - ${formatTime(schedule.close)}` : 'Closed'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Insurance */}
                            <div>
                              <h5 className="font-medium text-gray-900 mb-2">Insurance Accepted</h5>
                              <div className="flex flex-wrap gap-1">
                                {clinic.insuranceAccepted.map((insurance, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {insurance}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-2">
                              <Button size="sm" className="flex-1">
                                Book Appointment
                              </Button>
                              <Button variant="outline" size="sm">
                                Get Directions
                              </Button>
                              <Button variant="outline" size="sm">
                                Call Clinic
                              </Button>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Map View Tab */}
            <TabsContent value="map" className="space-y-4">
              <div className="bg-gray-100 rounded-lg p-8 text-center">
                <MapPinIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Interactive Map View</h3>
                <p className="text-gray-600 mb-4">
                  Interactive map showing clinic locations, distances, and directions.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                  {clinicAvailability.map((clinic) => (
                    <Card key={clinic.clinicId} className="p-4">
                      <h4 className="font-medium text-gray-900">{clinic.clinicName}</h4>
                      <p className="text-sm text-gray-600 mb-2">{clinic.location}</p>
                      <div className="text-sm text-gray-500">
                        Next available: {formatDate(clinic.nextAvailable)} {formatTime(clinic.earliestTime)}
                      </div>
                      <Button size="sm" className="w-full mt-2">
                        View on Map
                      </Button>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Booking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5 text-blue-500" />
            <span>Quick Booking Options</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">Same-Day Appointments</h4>
              <p className="text-sm text-blue-600 mb-3">
                Need to see a doctor today? Call our quick booking line for urgent appointments.
              </p>
              <Button className="w-full" size="sm">
                <PhoneIcon className="h-4 w-4 mr-2" />
                Call (65) 6789 1234
              </Button>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-800 mb-2">Online Booking</h4>
              <p className="text-sm text-green-600 mb-3">
                Book your appointment online and choose your preferred time and location.
              </p>
              <Button variant="outline" className="w-full" size="sm">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Book Online
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function to generate mock time slots
function generateMockSlots(): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const times = ['08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'];
  
  times.forEach((time, index) => {
    slots.push({
      id: `slot-${index}`,
      time,
      available: Math.random() > 0.3, // 70% availability
      doctorName: 'Dr. Available',
      doctorTitle: 'Family Physician',
      waitTime: Math.random() > 0.5 ? Math.floor(Math.random() * 45) + 15 : undefined,
      price: 120 + (Math.random() * 60),
      isRush: time >= '17:00'
    });
  });
  
  return slots;
}