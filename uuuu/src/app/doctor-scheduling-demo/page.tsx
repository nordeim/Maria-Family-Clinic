/**
 * Doctor Availability & Scheduling Integration Demo Page
 * Sub-Phase 7.5: Doctor Availability & Scheduling Integration
 * 
 * Comprehensive demonstration of real-time doctor availability management,
 * scheduling system, booking flow, and analytics dashboard
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar,
  Clock,
  Users,
  TrendingUp,
  Bell,
  Settings,
  Monitor,
  Smartphone,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Zap,
  BarChart3
} from 'lucide-react';

import { DoctorAvailabilityDashboard } from '@/components/doctor/availability/doctor-availability-dashboard';
import { TimeSlotBookingModal } from '@/components/doctor/availability/time-slot-booking-modal';
import { AvailabilityCalendar } from '@/components/doctor/availability/availability-calendar';
import { WaitlistManagement } from '@/components/doctor/availability/waitlist-management';
import { SchedulingAnalytics } from '@/components/doctor/availability/scheduling-analytics';
import { NotificationSystem } from '@/components/doctor/availability/notification-system';
import { RealTimeUpdates } from '@/components/doctor/availability/real-time-updates';

export default function DoctorSchedulingDemoPage() {
  const [activeDemo, setActiveDemo] = useState('dashboard');
  const [selectedDoctor, setSelectedDoctor] = useState('doctor-1');
  const [selectedClinic, setSelectedClinic] = useState('clinic-1');
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [demoData, setDemoData] = useState({
    availabilities: [],
    conflicts: [],
    waitlistPositions: {},
    isConnected: true
  });

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    if (!demoData.isConnected) return;

    const interval = setInterval(() => {
      // Simulate availability updates
      setDemoData(prev => ({
        ...prev,
        conflicts: Math.random() > 0.8 ? ['conflict-1', 'conflict-2'] : [],
        waitlistPositions: {
          'doctor-1': Math.floor(Math.random() * 5) + 1,
          'doctor-2': Math.floor(Math.random() * 3) + 1,
          'doctor-3': Math.floor(Math.random() * 7) + 1
        }
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, [demoData.isConnected]);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Simulate data refresh
      setDemoData(prev => ({
        ...prev,
        availabilities: generateMockAvailabilities()
      }));
    }, 2000);
  };

  const generateMockAvailabilities = () => {
    const slots = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Generate slots for each day
      const times = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
      times.forEach(time => {
        slots.push({
          id: `slot-${i}-${time.replace(':', '')}`,
          doctorId: selectedDoctor,
          clinicId: selectedClinic,
          date: date.toISOString(),
          startTime: time,
          endTime: `${String(parseInt(time.split(':')[0]) + 1).padStart(2, '0')}:${time.split(':')[1]}`,
          isAvailable: Math.random() > 0.3,
          availabilityType: 'REGULAR' as any,
          appointmentType: 'consultation',
          maxAppointments: Math.floor(Math.random() * 3) + 1,
          bookedAppointments: Math.floor(Math.random() * 2),
          availableSlots: Math.floor(Math.random() * 3) + 1,
          slotDuration: 60,
          breakDuration: 15,
          bufferTime: 5,
          isEmergency: time === '09:00',
          isWalkIn: false,
          isTelehealth: Math.random() > 0.7,
          ageRestrictions: { 
            minAge: 0, 
            maxAge: 100, 
            pediatricOnly: false, 
            adultOnly: false, 
            geriatricSpecialist: false 
          },
          genderRestrictions: [],
          conditionsJson: [],
          status: 'ACTIVE' as any,
          lastUpdated: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        });
      });
    }
    
    return slots;
  };

  // Demo statistics
  const demoStats = {
    totalDoctors: 15,
    activeAppointments: 47,
    availableSlots: 23,
    waitlistPatients: 8,
    utilizationRate: 78.5,
    conflictsResolved: 3,
    notificationsSent: 156
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Calendar className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              Doctor Availability & Scheduling Integration
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Comprehensive real-time doctor availability management with instant booking, 
            conflict resolution, waitlist automation, and intelligent analytics
          </p>
          
          {/* Demo Controls */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
            <div className="flex items-center gap-2">
              <Button
                variant={isMobile ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIsMobile(!isMobile)}
              >
                {isMobile ? <Monitor className="w-4 h-4 mr-2" /> : <Smartphone className="w-4 h-4 mr-2" />}
                {isMobile ? 'Desktop View' : 'Mobile View'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDemoData(prev => ({ ...prev, isConnected: !prev.isConnected }))}
                className={demoData.isConnected ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}
              >
                <Zap className={`w-4 h-4 mr-2 ${demoData.isConnected ? 'animate-pulse' : ''}`} />
                {demoData.isConnected ? 'Connected' : 'Disconnected'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh Data
              </Button>
            </div>
          </div>
        </div>

        {/* Demo Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{demoStats.totalDoctors}</div>
              <div className="text-xs text-gray-600">Active Doctors</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{demoStats.activeAppointments}</div>
              <div className="text-xs text-gray-600">Appointments</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{demoStats.availableSlots}</div>
              <div className="text-xs text-gray-600">Available Slots</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{demoStats.waitlistPatients}</div>
              <div className="text-xs text-gray-600">Waitlist</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{demoStats.utilizationRate}%</div>
              <div className="text-xs text-gray-600">Utilization</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{demoStats.conflictsResolved}</div>
              <div className="text-xs text-gray-600">Conflicts Resolved</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Bell className="w-6 h-6 text-red-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{demoStats.notificationsSent}</div>
              <div className="text-xs text-gray-600">Notifications</div>
            </CardContent>
          </Card>
        </div>

        {/* Demo Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Demo Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Doctor</label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                >
                  <option value="doctor-1">Dr. Sarah Johnson - Cardiology</option>
                  <option value="doctor-2">Dr. Michael Chen - General Practice</option>
                  <option value="doctor-3">Dr. Emily Rodriguez - Pediatrics</option>
                  <option value="doctor-4">Dr. David Kim - Orthopedics</option>
                  <option value="doctor-5">Dr. Lisa Wong - Dermatology</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Clinic</label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={selectedClinic}
                  onChange={(e) => setSelectedClinic(e.target.value)}
                >
                  <option value="clinic-1">My Family Clinic - Central</option>
                  <option value="clinic-2">My Family Clinic - North</option>
                  <option value="clinic-3">My Family Clinic - East</option>
                  <option value="clinic-4">My Family Clinic - West</option>
                  <option value="clinic-5">My Family Clinic - South</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Demo Mode</label>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={activeDemo === 'full' ? 'default' : 'outline'}
                    onClick={() => setActiveDemo('full')}
                  >
                    Full Demo
                  </Button>
                  <Button
                    size="sm"
                    variant={activeDemo === 'quick' ? 'default' : 'outline'}
                    onClick={() => setActiveDemo('quick')}
                  >
                    Quick View
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Demo Interface */}
        <Tabs value={activeDemo} onValueChange={setActiveDemo} className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="waitlist" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Waitlist
            </TabsTrigger>
            <TabsTrigger value="realtime" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Live
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Real-Time Dashboard:</strong> Interactive view of doctor availability, 
                booking status, and scheduling conflicts with instant updates.
              </AlertDescription>
            </Alert>
            
            <DoctorAvailabilityDashboard
              doctorId={selectedDoctor}
              clinicId={selectedClinic}
              viewMode="dashboard"
              isMobile={isMobile}
            />
          </TabsContent>

          <TabsContent value="calendar">
            <Alert className="mb-4">
              <Calendar className="h-4 w-4" />
              <AlertDescription>
                <strong>Advanced Calendar:</strong> Multiple view modes (day/week/month) with 
                time slot visualization and booking integration.
              </AlertDescription>
            </Alert>
            
            <AvailabilityCalendar
              doctorId={selectedDoctor}
              clinicId={selectedClinic}
              availabilities={demoData.availabilities.length > 0 ? demoData.availabilities : generateMockAvailabilities()}
              onSlotSelect={(slot) => console.log('Slot selected:', slot)}
              onDateChange={(date) => console.log('Date changed:', date)}
              selectedDate={new Date()}
              isMobile={isMobile}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <Alert className="mb-4">
              <TrendingUp className="h-4 w-4" />
              <AlertDescription>
                <strong>Scheduling Analytics:</strong> Comprehensive insights including utilization 
                metrics, peak times, no-show analysis, and demand forecasting.
              </AlertDescription>
            </Alert>
            
            <SchedulingAnalytics
              doctorId={selectedDoctor}
              availabilities={generateMockAvailabilities()}
              conflicts={['conflict-1', 'conflict-2']}
              waitlistPositions={{
                'doctor-1': 3,
                'doctor-2': 1,
                'doctor-3': 5
              }}
            />
          </TabsContent>

          <TabsContent value="notifications">
            <Alert className="mb-4">
              <Bell className="h-4 w-4" />
              <AlertDescription>
                <strong>Notification System:</strong> Real-time alerts for bookings, conflicts, 
                waitlist updates, and scheduling changes with multi-channel delivery.
              </AlertDescription>
            </Alert>
            
            <NotificationSystem
              doctorId={selectedDoctor}
              isConnected={demoData.isConnected}
              conflicts={demoData.conflicts}
              waitlistPositions={demoData.waitlistPositions}
            />
          </TabsContent>

          <TabsContent value="waitlist">
            <Alert className="mb-4">
              <Users className="h-4 w-4" />
              <AlertDescription>
                <strong>Waitlist Management:</strong> Automated waitlist handling with position 
                tracking, notification system, and intelligent promotion algorithms.
              </AlertDescription>
            </Alert>
            
            <WaitlistManagement
              isOpen={true}
              onClose={() => {}}
              doctorId={selectedDoctor}
              clinicId={selectedClinic}
            />
          </TabsContent>

          <TabsContent value="realtime">
            <Alert className="mb-4">
              <Zap className="h-4 w-4" />
              <AlertDescription>
                <strong>Real-Time Updates:</strong> Live WebSocket connection for instant 
                availability updates, conflict detection, and automated resolution.
              </AlertDescription>
            </Alert>
            
            <RealTimeUpdates
              isConnected={demoData.isConnected}
              conflicts={demoData.conflicts}
              onConflictResolved={(conflictId, resolution) => 
                console.log('Conflict resolved:', conflictId, resolution)
              }
            />
          </TabsContent>
        </Tabs>

        {/* Feature Highlights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Key Features Demonstrated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-green-700">✅ Real-Time Availability</h4>
                <p className="text-sm text-gray-600">
                  Instant slot updates with WebSocket connections and conflict detection
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-green-700">✅ Intelligent Booking</h4>
                <p className="text-sm text-gray-600">
                  Automated booking flow with alternative suggestions and waitlist integration
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-green-700">✅ Conflict Resolution</h4>
                <p className="text-sm text-gray-600">
                  Automated detection and resolution of scheduling conflicts
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-green-700">✅ Waitlist Management</h4>
                <p className="text-sm text-gray-600">
                  Smart waitlist with position tracking and automated notifications
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-green-700">✅ Analytics Dashboard</h4>
                <p className="text-sm text-gray-600">
                  Comprehensive insights with utilization metrics and demand forecasting
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-green-700">✅ Mobile Optimized</h4>
                <p className="text-sm text-gray-600">
                  Touch-friendly interface with responsive design for all devices
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Implementation */}
        <Card>
          <CardHeader>
            <CardTitle>Technical Implementation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Frontend Components</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• DoctorAvailabilityDashboard - Main scheduling interface</li>
                  <li>• AvailabilityCalendar - Interactive calendar views</li>
                  <li>• TimeSlotBookingModal - Booking flow with conflict detection</li>
                  <li>• WaitlistManagement - Automated waitlist handling</li>
                  <li>• SchedulingAnalytics - Comprehensive metrics and insights</li>
                  <li>• NotificationSystem - Multi-channel alert delivery</li>
                  <li>• RealTimeUpdates - WebSocket-based live updates</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Backend APIs</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• /api/doctors/availability - Slot management</li>
                  <li>• /api/appointments/book - Booking with conflict resolution</li>
                  <li>• /api/waitlist - Waitlist management</li>
                  <li>• /api/analytics/scheduling - Performance metrics</li>
                  <li>• WebSocket connections for real-time updates</li>
                  <li>• Automated conflict detection algorithms</li>
                  <li>• Multi-channel notification delivery</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}