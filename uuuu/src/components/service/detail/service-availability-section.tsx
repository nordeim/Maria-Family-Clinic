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
  ChevronDownIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  PhoneIcon,
  GlobeAltIcon,
  FilterIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface ServiceAvailabilitySectionProps {
  category: string;
  serviceSlug: string;
  locale: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
  doctorName?: string;
  clinicName?: string;
  waitTime?: number;
}

interface DaySchedule {
  date: string;
  day: string;
  isToday?: boolean;
  slots: TimeSlot[];
  isAvailable: boolean;
  fullyBooked?: boolean;
}

interface ClinicAvailability {
  clinicId: string;
  clinicName: string;
  location: string;
  address: string;
  phone: string;
  languages: string[];
  doctorName: string;
  doctorTitle: string;
  rating: number;
  nextAvailable: string;
  schedule: DaySchedule[];
  requirements?: string[];
  specializations?: string[];
}

export function ServiceAvailabilitySection({ category, serviceSlug, locale }: ServiceAvailabilitySectionProps) {
  const { data: service, isLoading } = useServiceData(category, serviceSlug, locale);
  const [selectedWeek, setSelectedWeek] = useState(0);
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

  // Mock clinic availability data
  const clinicAvailability: ClinicAvailability[] = [
    {
      clinicId: 'clinic-orchard',
      clinicName: 'My Family Clinic - Orchard',
      location: 'Orchard',
      address: '123 Orchard Road, #03-15, Singapore 238858',
      phone: '(65) 6789 1234',
      languages: ['English', 'Chinese', 'Malay'],
      doctorName: 'Dr. Sarah Johnson',
      doctorTitle: 'Senior Family Physician',
      rating: 4.8,
      nextAvailable: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      requirements: ['Valid ID required', 'Insurance card recommended'],
      specializations: ['Family Medicine', 'Preventive Care', 'Chronic Disease Management'],
      schedule: generateMockSchedule()
    },
    {
      clinicId: 'clinic-novena',
      clinicName: 'My Family Clinic - Novena',
      location: 'Novena',
      address: '456 Novena Road, #02-08, Singapore 313843',
      phone: '(65) 6789 5678',
      languages: ['English', 'Chinese', 'Tamil'],
      doctorName: 'Dr. Michael Chen',
      doctorTitle: 'Family Medicine Specialist',
      rating: 4.9,
      nextAvailable: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      requirements: ['Valid ID required', 'Medication list recommended'],
      specializations: ['Family Medicine', 'Sports Medicine', 'Geriatric Care'],
      schedule: generateMockSchedule()
    },
    {
      clinicId: 'clinic-woodlands',
      clinicName: 'My Family Clinic - Woodlands',
      location: 'Woodlands',
      address: '789 Woodlands Drive 50, #B1-12, Singapore 733894',
      phone: '(65) 6789 9876',
      languages: ['English', 'Chinese', 'Malay', 'Tamil'],
      doctorName: 'Dr. Priya Sharma',
      doctorTitle: 'Senior Family Physician',
      rating: 4.7,
      nextAvailable: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      requirements: ['Valid ID required'],
      specializations: ['Family Medicine', 'Women\'s Health', 'Pediatric Care'],
      schedule: generateMockSchedule()
    }
  ];

  const getWaitTimeColor = (waitTime?: number) => {
    if (!waitTime) return 'text-gray-500';
    if (waitTime <= 15) return 'text-green-600';
    if (waitTime <= 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getWaitTimeText = (waitTime?: number) => {
    if (!waitTime) return 'No wait';
    if (waitTime <= 15) return 'Minimal wait';
    if (waitTime <= 30) return 'Short wait';
    return 'Extended wait';
  };

  const toggleClinic = (clinicId: string) => {
    setExpandedClinic(expandedClinic === clinicId ? null : clinicId);
  };

  return (
    <div id="availability" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPinIcon className="h-5 w-5 text-blue-500" />
            <span>Clinic Availability</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Find available appointment times at our convenient locations across Singapore
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="calendar" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="calendar">Calendar View</TabsTrigger>
              <TabsTrigger value="clinics">All Clinics</TabsTrigger>
              <TabsTrigger value="urgent">Urgent Care</TabsTrigger>
            </TabsList>

            {/* Calendar View Tab */}
            <TabsContent value="calendar" className="space-y-4">
              {/* Week Navigation */}
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">Next 2 Weeks</h3>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedWeek(Math.max(0, selectedWeek - 1))}
                    disabled={selectedWeek === 0}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Week {selectedWeek + 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedWeek(Math.min(1, selectedWeek + 1))}
                    disabled={selectedWeek === 1}
                  >
                    Next
                  </Button>
                </div>
              </div>

              {/* Quick Availability Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {clinicAvailability.slice(0, 3).map((clinic) => (
                  <Card key={clinic.clinicId} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{clinic.clinicName}</h4>
                          <p className="text-sm text-gray-600">{clinic.location}</p>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Next available:</span>
                          <span className="font-medium text-green-600">
                            {new Date(clinic.nextAvailable).toLocaleDateString('en-SG', { 
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Doctor:</span>
                          <span className="font-medium">{clinic.doctorName}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Rating:</span>
                          <div className="flex items-center space-x-1">
                            <span className="font-medium">{clinic.rating}</span>
                            <span className="text-yellow-500">★</span>
                          </div>
                        </div>
                        
                        <Button 
                          size="sm" 
                          className="w-full"
                          onClick={() => toggleClinic(clinic.clinicId)}
                        >
                          View Schedule
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* All Clinics Tab */}
            <TabsContent value="clinics" className="space-y-4">
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
                                    <p className="text-sm text-gray-600">{clinic.address}</p>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="text-right space-y-1">
                                <div className="flex items-center space-x-1">
                                  <span className="text-yellow-500">★</span>
                                  <span className="text-sm font-medium">{clinic.rating}</span>
                                </div>
                                <div className="text-xs text-gray-600">
                                  {clinic.doctorName}
                                </div>
                              </div>
                              
                              <ChevronDownIcon 
                                className={cn(
                                  "h-4 w-4 text-gray-400 transition-transform ml-4",
                                  isExpanded ? "rotate-180" : ""
                                )}
                              />
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        
                        <CollapsibleContent>
                          <div className="border-t border-gray-200 p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div className="space-y-2">
                                <h5 className="font-medium text-gray-900">Contact Information</h5>
                                <div className="text-sm text-gray-600 space-y-1">
                                  <div className="flex items-center space-x-2">
                                    <PhoneIcon className="h-3 w-3" />
                                    <span>{clinic.phone}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <GlobeAltIcon className="h-3 w-3" />
                                    <span>Languages: {clinic.languages.join(', ')}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <h5 className="font-medium text-gray-900">Doctor Information</h5>
                                <div className="text-sm text-gray-600 space-y-1">
                                  <div>{clinic.doctorName}</div>
                                  <div className="text-xs">{clinic.doctorTitle}</div>
                                  <div className="flex flex-wrap gap-1">
                                    {clinic.specializations?.map((spec, index) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        {spec}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Weekly Schedule */}
                            <div className="space-y-3">
                              <h5 className="font-medium text-gray-900">Upcoming Availability</h5>
                              <div className="grid grid-cols-7 gap-2 text-xs">
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                                  <div key={day} className="text-center p-2 bg-gray-50 rounded">
                                    <div className="font-medium">{day}</div>
                                    <div className="text-green-600 mt-1">Available</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            {clinic.requirements && clinic.requirements.length > 0 && (
                              <div className="mt-4 p-3 bg-blue-50 rounded">
                                <h5 className="font-medium text-blue-800 mb-1">Requirements</h5>
                                <ul className="text-sm text-blue-700 space-y-1">
                                  {clinic.requirements.map((req, index) => (
                                    <li key={index}>• {req}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            <div className="mt-4 flex space-x-2">
                              <Button size="sm" className="flex-1">
                                Book Appointment
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

            {/* Urgent Care Tab */}
            <TabsContent value="urgent" className="space-y-4">
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <div className="flex items-start space-x-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800 mb-1">
                      For Medical Emergencies
                    </h4>
                    <p className="text-sm text-red-700">
                      If you are experiencing a medical emergency, call 995 immediately or go to the nearest A&E department. 
                      Do not use online booking for urgent medical situations.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Same-Day Appointments</h3>
                
                {clinicAvailability.map((clinic) => (
                  <Card key={clinic.clinicId} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{clinic.clinicName}</h4>
                          <p className="text-sm text-gray-600">{clinic.location}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="text-green-700 mb-1">
                            Same Day Available
                          </Badge>
                          <div className="text-sm text-gray-600">
                            Call: {clinic.phone}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">24/7 Medical Hotline</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Call: 1800-URGENT-1 (1800-874-3681)</div>
                  <div>For medical advice and urgent care guidance</div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Clinic Finder Widget */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FilterIcon className="h-5 w-5 text-green-500" />
            <span>Find the Right Clinic</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Location</label>
              <select className="w-full text-sm border border-gray-300 rounded px-3 py-2">
                <option>All locations</option>
                <option>Central (Orchard, Novena)</option>
                <option>North (Woodlands)</option>
                <option>East (Bedok, Tampines)</option>
                <option>West (Jurong)</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Language</label>
              <select className="w-full text-sm border border-gray-300 rounded px-3 py-2">
                <option>Any language</option>
                <option>English</option>
                <option>Chinese</option>
                <option>Malay</option>
                <option>Tamil</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Availability</label>
              <select className="w-full text-sm border border-gray-300 rounded px-3 py-2">
                <option>Any time</option>
                <option>This week</option>
                <option>Next week</option>
                <option>Same day</option>
              </select>
            </div>
          </div>
          
          <Button variant="outline" className="w-full mt-4">
            Find Matching Clinics
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function to generate mock schedule
function generateMockSchedule(): DaySchedule[] {
  const schedule: DaySchedule[] = [];
  const today = new Date();
  
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    const isToday = i === 0;
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    
    const slots: TimeSlot[] = [];
    
    // Generate time slots (simplified for demo)
    const timeSlots = ['09:00', '10:30', '14:00', '15:30', '17:00'];
    
    timeSlots.forEach(time => {
      slots.push({
        time,
        available: !isWeekend && Math.random() > 0.3, // 70% availability
        doctorName: 'Dr. Available',
        clinicName: 'Available Clinic',
        waitTime: Math.random() > 0.7 ? Math.floor(Math.random() * 45) + 15 : undefined
      });
    });
    
    schedule.push({
      date: date.toISOString().split('T')[0],
      day: date.toLocaleDateString('en-SG', { weekday: 'short' }),
      isToday,
      slots,
      isAvailable: !isWeekend,
      fullyBooked: isWeekend || Math.random() > 0.8
    });
  }
  
  return schedule;
}