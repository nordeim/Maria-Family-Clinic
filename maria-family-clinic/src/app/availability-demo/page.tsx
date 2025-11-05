'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, Users, MapPin, Wifi, WifiOff, Bell, CheckCircle, AlertCircle } from 'lucide-react';

// Import all availability components
import RealTimeAvailabilityDisplay from '@/components/service/availability/real-time-availability-display';
import WaitTimeDisplay from '@/components/service/availability/wait-time-display';
import TimeSlotBookingModal from '@/components/service/availability/time-slot-booking-modal';
import AvailabilityCalendar from '@/components/service/availability/availability-calendar';
import ConflictResolutionNotification from '@/components/service/availability/conflict-resolution-notification';
import MobileAvailabilityInterface from '@/components/service/availability/mobile-availability-interface';
import NotificationSystem from '@/components/service/availability/notification-system';
import CapacityManagementDashboard from '@/components/service/availability/capacity-management-dashboard';

// Import hooks
import { useAvailabilityTracker } from '@/hooks/service/use-availability-tracker';
import { useWaitTimeEstimator } from '@/hooks/service/use-wait-time-estimator';
import { useOfflineAvailabilityCache } from '@/hooks/service/use-offline-availability-cache';

export default function AvailabilityDemoPage() {
  const [selectedService, setSelectedService] = useState('service-1');
  const [selectedClinic, setSelectedClinic] = useState('clinic-1');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline'>('online');
  const [activeTab, setActiveTab] = useState('overview');

  // Demo data
  const mockServiceData = {
    id: 'service-1',
    name: 'General Consultation',
    typicalDurationMin: 30,
    category: 'Primary Care'
  };

  const mockClinics = [
    { id: 'clinic-1', name: 'Downtown Medical Center', address: '123 Main St, Downtown' },
    { id: 'clinic-2', name: 'Riverside Clinic', address: '456 River Rd, Riverside' },
    { id: 'clinic-3', name: 'Hilltop Health', address: '789 Hill St, Hilltop' }
  ];

  const mockDoctors = [
    { id: 'doc-1', name: 'Dr. Sarah Johnson', specialty: 'Family Medicine' },
    { id: 'doc-2', name: 'Dr. Michael Chen', specialty: 'Internal Medicine' },
    { id: 'doc-3', name: 'Dr. Emily Davis', specialty: 'General Practice' }
  ];

  // Hooks
  const { 
    availability, 
    isLoading, 
    error, 
    lastUpdated, 
    subscribeToUpdates,
    updateFrequency 
  } = useAvailabilityTracker({
    serviceId: selectedService,
    clinicId: selectedClinic,
    autoRefresh: true,
    refreshInterval: 30000
  });

  const { 
    estimatedWaitTime, 
    waitTimeLevel, 
    queuePosition,
    getWaitTimeRecommendation 
  } = useWaitTimeEstimator({
    serviceId: selectedService,
    clinicId: selectedClinic,
    historicalData: true
  });

  const {
    cachedData,
    cacheStatus,
    clearCache,
    syncWithServer,
    isCacheStale
  } = useOfflineAvailabilityCache();

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => {
      setNetworkStatus('online');
      setIsOffline(false);
      syncWithServer();
    };
    
    const handleOffline = () => {
      setNetworkStatus('offline');
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncWithServer]);

  const handleBooking = (slotId: string, bookingDetails: any) => {
    console.log('Booking slot:', slotId, bookingDetails);
    // In real app, this would call the booking API
    setShowBookingModal(false);
  };

  const simulateNetworkInterruption = () => {
    setIsOffline(!isOffline);
    setNetworkStatus(isOffline ? 'online' : 'offline');
  };

  const simulateAvailabilityChange = () => {
    // Trigger a manual update for demo purposes
    subscribeToUpdates();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Service Availability Demo</h1>
              <p className="text-gray-600 mt-1">
                Real-time availability tracking and booking system demonstration
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Network Status Indicator */}
              <div className="flex items-center space-x-2">
                {networkStatus === 'online' ? (
                  <Wifi className="h-5 w-5 text-green-500" />
                ) : (
                  <WifiOff className="h-5 w-5 text-red-500" />
                )}
                <Badge variant={networkStatus === 'online' ? 'default' : 'destructive'}>
                  {networkStatus}
                </Badge>
              </div>
              
              {/* Last Updated */}
              {lastUpdated && (
                <div className="text-sm text-gray-500">
                  Last updated: {new Date(lastUpdated).toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>

          {/* Demo Controls */}
          <div className="mt-6 flex flex-wrap gap-4">
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="service-1">General Consultation</option>
              <option value="service-2">Specialist Consultation</option>
              <option value="service-3">Health Checkup</option>
            </select>

            <select
              value={selectedClinic}
              onChange={(e) => setSelectedClinic(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              {mockClinics.map(clinic => (
                <option key={clinic.id} value={clinic.id}>{clinic.name}</option>
              ))}
            </select>

            <Button onClick={() => setShowBookingModal(true)}>
              Book Appointment
            </Button>

            <Button variant="outline" onClick={simulateNetworkInterruption}>
              {isOffline ? 'Go Online' : 'Simulate Offline'}
            </Button>

            <Button variant="outline" onClick={simulateAvailabilityChange}>
              Trigger Update
            </Button>

            <Button variant="outline" onClick={() => window.location.reload()}>
              Refresh Demo
            </Button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Estimated Wait Time</p>
                  <p className="text-2xl font-bold text-gray-900">{estimatedWaitTime} min</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Queue Position</p>
                  <p className="text-2xl font-bold text-gray-900">#{queuePosition || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600">Available Slots</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {availability?.reduce((acc, curr) => 
                      acc + curr.timeSlots?.filter(slot => slot.isAvailable).length || 0, 0
                    ) || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600">Update Frequency</p>
                  <p className="text-2xl font-bold text-gray-900">{updateFrequency}ms</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Demo Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="mobile">Mobile View</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="capacity">Capacity</TabsTrigger>
            <TabsTrigger value="offline">Offline Mode</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Real-time Availability Display */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5" />
                    <span>Real-time Availability</span>
                  </CardTitle>
                  <CardDescription>
                    Live updates of service availability across clinics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RealTimeAvailabilityDisplay
                    serviceId={selectedService}
                    clinicId={selectedClinic}
                    showCapacity={true}
                    showWaitTime={true}
                    autoRefresh={true}
                  />
                </CardContent>
              </Card>

              {/* Wait Time Display */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Wait Time Estimator</span>
                  </CardTitle>
                  <CardDescription>
                    Real-time wait time calculations and predictions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <WaitTimeDisplay
                    serviceId={selectedService}
                    clinicId={selectedClinic}
                    showQueuePosition={true}
                    showRecommendations={true}
                    historicalData={true}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Conflict Resolution Demo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5" />
                  <span>Conflict Resolution System</span>
                </CardTitle>
                <CardDescription>
                  Automatic conflict detection and resolution demonstration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ConflictResolutionNotification
                  conflictType="double_booking"
                  severity="medium"
                  showResolution={true}
                  autoResolve={false}
                  onResolve={(resolution) => console.log('Conflict resolved:', resolution)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Availability Calendar</CardTitle>
                <CardDescription>
                  Interactive calendar view of service availability
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AvailabilityCalendar
                  serviceId={selectedService}
                  clinicId={selectedClinic}
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                  onSlotSelect={(slotId, slotData) => {
                    console.log('Selected slot:', slotId, slotData);
                    setShowBookingModal(true);
                  }}
                  showMultipleMonths={true}
                  enableDragSelection={true}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mobile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mobile-Optimized Interface</CardTitle>
                <CardDescription>
                  Touch-friendly interface with swipe gestures and offline support
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MobileAvailabilityInterface
                  serviceId={selectedService}
                  clinicId={selectedClinic}
                  enableSwipeGestures={true}
                  showOfflineIndicator={true}
                  enablePullToRefresh={true}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification System</CardTitle>
                <CardDescription>
                  Push notifications for availability changes and updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NotificationSystem
                  serviceId={selectedService}
                  clinicId={selectedClinic}
                  enablePushNotifications={true}
                  showInAppNotifications={true}
                  notificationTypes={['availability_changes', 'waitlist_updates', 'appointment_reminders']}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="capacity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Capacity Management Dashboard</CardTitle>
                <CardDescription>
                  Real-time capacity planning and crowd management analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CapacityManagementDashboard
                  clinicId={selectedClinic}
                  serviceId={selectedService}
                  showForecasting={true}
                  showPeakAnalysis={true}
                  showRecommendations={true}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="offline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Offline Caching System</CardTitle>
                <CardDescription>
                  Demonstration of offline availability caching and sync
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cache Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Cache Status</p>
                    <Badge variant={cacheStatus === 'fresh' ? 'default' : 'secondary'}>
                      {cacheStatus}
                    </Badge>
                    {isCacheStale && (
                      <p className="text-xs text-orange-600 mt-1">Cache is stale - sync recommended</p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Cached Items</p>
                    <p className="text-lg font-semibold">{cachedData?.length || 0}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Network Status</p>
                    <div className="flex items-center space-x-2">
                      {networkStatus === 'online' ? (
                        <Wifi className="h-4 w-4 text-green-500" />
                      ) : (
                        <WifiOff className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm">{networkStatus}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Cache Actions */}
                <div className="flex space-x-4">
                  <Button variant="outline" onClick={syncWithServer}>
                    Sync with Server
                  </Button>
                  <Button variant="outline" onClick={clearCache}>
                    Clear Cache
                  </Button>
                </div>

                {/* Cache Data Display */}
                {cachedData && cachedData.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Cached Data (Sample)</h4>
                    <div className="bg-gray-50 p-4 rounded-md max-h-40 overflow-y-auto">
                      <pre className="text-xs">
                        {JSON.stringify(cachedData.slice(0, 2), null, 2)}
                        {cachedData.length > 2 && '\n...'}
                      </pre>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Booking Modal */}
        {showBookingModal && (
          <TimeSlotBookingModal
            isOpen={showBookingModal}
            onClose={() => setShowBookingModal(false)}
            serviceId={selectedService}
            clinicId={selectedClinic}
            selectedDate={selectedDate}
            onBooking={handleBooking}
            enableConflictResolution={true}
            showWaitTimeEstimate={true}
            allowFlexibleBooking={true}
          />
        )}
      </div>
    </div>
  );
}