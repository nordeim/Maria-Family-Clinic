import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Progress } from '~/components/ui/progress';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { 
  Clock, 
  Calendar, 
  MapPin, 
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Users,
  Phone,
  Filter
} from 'lucide-react';
import { cn } from '~/lib/utils';

export interface ServiceAvailabilityMatrixProps {
  serviceId: string;
  clinics: Array<{
    id: string;
    name: string;
    address: string;
    rating?: number;
    reviewCount?: number;
    isOpen: boolean;
    distance?: number;
    latitude: number;
    longitude: number;
    waitingTime?: number;
    emergencyServices: boolean;
    availability: {
      isAvailable: boolean;
      nextAvailableDate?: Date;
      estimatedWaitTime?: number;
      scheduleSlots?: Array<{
        time: string;
        isAvailable: boolean;
        doctorId?: string;
        doctorName?: string;
      }>;
      advanceBookingDays: number;
      isUrgentAvailable: boolean;
    };
    doctorCount: number;
    specializationAreas: string[];
  }>;
  userLocation?: { latitude: number; longitude: number };
}

interface AvailabilityMatrix {
  clinicId: string;
  clinicName: string;
  nextAvailable: Date | null;
  waitTime: number | null;
  urgency: 'immediate' | 'today' | 'tomorrow' | 'week' | 'later';
  capacity: number; // 0-100%
  schedule: Array<{
    date: string;
    slots: Array<{
      time: string;
      available: boolean;
      doctorName?: string;
    }>;
  }>;
  availabilityScore: number; // 0-100
  realTimeStatus: 'available' | 'busy' | 'limited' | 'unavailable';
}

export function ServiceAvailabilityMatrix({
  serviceId,
  clinics,
  userLocation
}: ServiceAvailabilityMatrixProps) {
  const [matrixData, setMatrixData] = useState<AvailabilityMatrix[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'today' | 'tomorrow' | 'week'>('today');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    // Simulate real-time data fetching
    const fetchAvailabilityData = async () => {
      setIsLoading(true);
      
      // In real app, this would call tRPC to get real-time availability
      const availabilityMatrix: AvailabilityMatrix[] = clinics.map(clinic => {
        // Generate mock availability data
        const now = new Date();
        const nextAvailable = clinic.availability.nextAvailableDate || 
          new Date(now.getTime() + (Math.random() * 24 * 60 * 60 * 1000));
        
        const waitTime = clinic.availability.estimatedWaitTime || 
          Math.floor(Math.random() * 60) + 15;

        // Determine urgency level
        const timeDiff = nextAvailable.getTime() - now.getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        let urgency: 'immediate' | 'today' | 'tomorrow' | 'week' | 'later';
        
        if (hoursDiff <= 2) urgency = 'immediate';
        else if (hoursDiff <= 24) urgency = 'today';
        else if (hoursDiff <= 48) urgency = 'tomorrow';
        else if (hoursDiff <= 168) urgency = 'week';
        else urgency = 'later';

        // Calculate availability score
        let availabilityScore = 100;
        if (!clinic.availability.isAvailable) availabilityScore -= 40;
        if (waitTime > 60) availabilityScore -= 20;
        if (waitTime > 30) availabilityScore -= 10;
        if (!clinic.isOpen) availabilityScore -= 30;

        // Generate real-time status
        let realTimeStatus: 'available' | 'busy' | 'limited' | 'unavailable';
        const random = Math.random();
        if (availabilityScore >= 80) realTimeStatus = 'available';
        else if (availabilityScore >= 60) realTimeStatus = 'limited';
        else if (availabilityScore >= 30) realTimeStatus = 'busy';
        else realTimeStatus = 'unavailable';

        // Generate schedule slots for next 7 days
        const schedule = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() + i);
          const slots = Array.from({ length: 8 }, (_, j) => {
            const hour = 9 + j; // 9 AM to 5 PM
            return {
              time: `${hour}:00`,
              available: Math.random() > 0.3, // 70% chance available
              doctorName: `Dr. ${String.fromCharCode(65 + j)}`
            };
          });
          return {
            date: date.toISOString().split('T')[0],
            slots
          };
        });

        return {
          clinicId: clinic.id,
          clinicName: clinic.name,
          nextAvailable,
          waitTime,
          urgency,
          capacity: Math.floor(Math.random() * 40) + 60, // 60-100%
          schedule,
          availabilityScore,
          realTimeStatus
        };
      });

      setMatrixData(availabilityMatrix);
      setIsLoading(false);
      setLastUpdated(new Date());
    };

    fetchAvailabilityData();

    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchAvailabilityData, 30000);
    return () => clearInterval(interval);
  }, [clinics, serviceId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'limited':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'busy':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'unavailable':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'limited':
        return 'bg-yellow-100 text-yellow-800';
      case 'busy':
        return 'bg-orange-100 text-orange-800';
      case 'unavailable':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    const styles = {
      immediate: 'bg-red-100 text-red-800',
      today: 'bg-orange-100 text-orange-800',
      tomorrow: 'bg-yellow-100 text-yellow-800',
      week: 'bg-blue-100 text-blue-800',
      later: 'bg-gray-100 text-gray-800'
    };

    const labels = {
      immediate: 'Immediate',
      today: 'Today',
      tomorrow: 'Tomorrow',
      week: 'This Week',
      later: 'Later'
    };

    return (
      <Badge className={styles[urgency as keyof typeof styles]}>
        {labels[urgency as keyof typeof labels]}
      </Badge>
    );
  };

  const formatNextAvailable = (date: Date | null) => {
    if (!date) return 'Not available';
    
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Available now';
    if (hours < 24) return `In ${hours}h`;
    
    const days = Math.floor(hours / 24);
    return `In ${days}d`;
  };

  const sortedMatrix = matrixData.sort((a, b) => b.availabilityScore - a.availabilityScore);

  return (
    <div className="space-y-6">
      {/* Header with Real-time Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Real-time Availability Matrix
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
              <Badge variant="outline" className="text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                Live
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Timeframe Selector */}
          <div className="flex gap-2 mb-6">
            {(['today', 'tomorrow', 'week'] as const).map(timeframe => (
              <Button
                key={timeframe}
                variant={selectedTimeframe === timeframe ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTimeframe(timeframe)}
              >
                {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
              </Button>
            ))}
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-800">Available Now</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {matrixData.filter(item => item.realTimeStatus === 'available').length}
              </div>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <span className="font-semibold text-yellow-800">Limited Slots</span>
              </div>
              <div className="text-2xl font-bold text-yellow-600">
                {matrixData.filter(item => item.realTimeStatus === 'limited').length}
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-800">Avg Wait Time</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(matrixData.reduce((sum, item) => sum + (item.waitTime || 0), 0) / matrixData.length) || 0}m
              </div>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-purple-600" />
                <span className="font-semibold text-purple-800">Total Capacity</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(matrixData.reduce((sum, item) => sum + item.capacity, 0) / matrixData.length) || 0}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Updates Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Availability information updates every 30 seconds. Click on any clinic below for detailed scheduling information.
        </AlertDescription>
      </Alert>

      {/* Availability Matrix */}
      {isLoading ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Loading availability data...</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedMatrix.map(item => {
            const clinic = clinics.find(c => c.id === item.clinicId);
            if (!clinic) return null;

            return (
              <Card key={item.clinicId} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Clinic Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="font-semibold text-lg">{item.clinicName}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span>{clinic.address}</span>
                            {item.urgency !== 'later' && (
                              <Badge variant="outline" className="ml-2">
                                {clinic.distance?.toFixed(1)}km away
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {getStatusIcon(item.realTimeStatus)}
                        <Badge className={getStatusColor(item.realTimeStatus)}>
                          {item.realTimeStatus.charAt(0).toUpperCase() + item.realTimeStatus.slice(1)}
                        </Badge>
                        {getUrgencyBadge(item.urgency)}
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-semibold">{formatNextAvailable(item.nextAvailable)}</div>
                        <div className="text-xs text-gray-600">Next Available</div>
                      </div>
                      
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-semibold">{item.waitTime || 0}min</div>
                        <div className="text-xs text-gray-600">Est. Wait Time</div>
                      </div>
                      
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-semibold">{item.capacity}%</div>
                        <div className="text-xs text-gray-600">Capacity</div>
                        <Progress value={item.capacity} className="mt-1 h-1" />
                      </div>
                      
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-semibold">{item.availabilityScore}/100</div>
                        <div className="text-xs text-gray-600">Availability Score</div>
                        <Progress value={item.availabilityScore} className="mt-1 h-1" />
                      </div>
                    </div>

                    {/* Schedule Preview for Selected Timeframe */}
                    <div>
                      <h4 className="font-medium mb-3">
                        {selectedTimeframe.charAt(0).toUpperCase() + selectedTimeframe.slice(1)} Schedule
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {item.schedule.slice(0, selectedTimeframe === 'today' ? 1 : selectedTimeframe === 'tomorrow' ? 2 : 7).map((daySchedule, index) => (
                          <div key={daySchedule.date} className="border rounded-lg p-3">
                            <div className="font-medium text-sm mb-2">
                              {new Date(daySchedule.date).toLocaleDateString('en-US', { 
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                            
                            <div className="space-y-1">
                              {daySchedule.slots.slice(0, 4).map(slot => (
                                <div key={slot.time} className="flex items-center justify-between text-xs">
                                  <span>{slot.time}</span>
                                  <div className="flex items-center gap-1">
                                    {slot.available ? (
                                      <CheckCircle className="h-3 w-3 text-green-500" />
                                    ) : (
                                      <XCircle className="h-3 w-3 text-red-500" />
                                    )}
                                    <span className={slot.available ? 'text-green-600' : 'text-red-600'}>
                                      {slot.available ? 'Available' : 'Booked'}
                                    </span>
                                  </div>
                                </div>
                              ))}
                              {daySchedule.slots.length > 4 && (
                                <div className="text-xs text-gray-500 text-center pt-1">
                                  +{daySchedule.slots.length - 4} more slots
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2 border-t">
                      <Button size="sm" className="flex-1">
                        <Calendar className="h-4 w-4 mr-2" />
                        Book Appointment
                      </Button>
                      
                      {clinic.phone && (
                        <Button variant="outline" size="sm">
                          <Phone className="h-4 w-4 mr-2" />
                          Call
                        </Button>
                      )}
                      
                      <Button variant="outline" size="sm">
                        <MapPin className="h-4 w-4 mr-2" />
                        Directions
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* No Data State */}
      {!isLoading && matrixData.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Availability Data</h3>
              <p className="text-gray-600">
                We couldn't retrieve availability information for this service. Please try again later.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}