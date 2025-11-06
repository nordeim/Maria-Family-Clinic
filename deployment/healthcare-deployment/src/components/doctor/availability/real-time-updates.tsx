/**
 * Real-Time Updates Component
 * Sub-Phase 7.5: Doctor Availability & Scheduling Integration
 * 
 * Handles real-time WebSocket updates and conflict resolution notifications
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wifi,
  WifiOff,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  RefreshCw,
  Zap,
  MessageSquare,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface RealTimeUpdate {
  id: string;
  type: 'availability_updated' | 'booking_confirmed' | 'slot_released' | 'conflict_detected' | 'waitlist_notified' | 'appointment_cancelled';
  title: string;
  message: string;
  timestamp: Date;
  data?: any;
  requiresAction?: boolean;
}

interface ConflictResolution {
  id: string;
  type: 'double_booking' | 'schedule_overlap' | 'capacity_exceeded';
  description: string;
  severity: 'low' | 'medium' | 'high';
  affectedSlots: string[];
  resolutionStrategy?: 'reschedule' | 'split' | 'cancel' | 'manual';
  automated: boolean;
}

interface RealTimeUpdatesProps {
  isConnected: boolean;
  conflicts: string[];
  onConflictResolved?: (conflictId: string, resolution: string) => void;
  onSlotUpdate?: (slotId: string, updates: any) => void;
  onWaitlistUpdate?: (waitlistId: string, updates: any) => void;
}

export const RealTimeUpdates: React.FC<RealTimeUpdatesProps> = ({
  isConnected,
  conflicts,
  onConflictResolved,
  onSlotUpdate,
  onWaitlistUpdate
}) => {
  const [recentUpdates, setRecentUpdates] = useState<RealTimeUpdate[]>([]);
  const [activeConflicts, setActiveConflicts] = useState<ConflictResolution[]>([]);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor'>('good');
  const [autoResolve, setAutoResolve] = useState(false);
  const [updateCount, setUpdateCount] = useState(0);

  // Mock conflict resolutions for demonstration
  const mockConflicts: ConflictResolution[] = [
    {
      id: 'conflict-1',
      type: 'double_booking',
      description: 'Dr. Smith double-booked at 3:00 PM on Dec 15',
      severity: 'high',
      affectedSlots: ['slot-1', 'slot-2'],
      resolutionStrategy: 'reschedule',
      automated: false
    },
    {
      id: 'conflict-2',
      type: 'schedule_overlap',
      description: 'Schedule overlap detected for morning rounds',
      severity: 'medium',
      affectedSlots: ['slot-3'],
      resolutionStrategy: 'split',
      automated: true
    }
  ];

  // Load conflict data
  useEffect(() => {
    if (conflicts.length > 0) {
      setActiveConflicts(mockConflicts);
    } else {
      setActiveConflicts([]);
    }
  }, [conflicts]);

  // Simulate real-time updates
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      const updateTypes = [
        'availability_updated',
        'booking_confirmed',
        'slot_released',
        'waitlist_notified',
        'appointment_cancelled'
      ] as const;

      const randomType = updateTypes[Math.floor(Math.random() * updateTypes.length)];
      
      const newUpdate: RealTimeUpdate = {
        id: Date.now().toString(),
        type: randomType,
        title: getUpdateTitle(randomType),
        message: getUpdateMessage(randomType),
        timestamp: new Date(),
        data: {
          doctorId: 'doc-123',
          clinicId: 'clinic-456',
          slotId: `slot-${Math.floor(Math.random() * 1000)}`
        }
      };

      setRecentUpdates(prev => [newUpdate, ...prev.slice(0, 9)]); // Keep last 10 updates
      setUpdateCount(prev => prev + 1);
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [isConnected]);

  // Update connection quality based on recent activity
  useEffect(() => {
    if (isConnected && updateCount > 0) {
      setConnectionQuality('excellent');
    } else if (isConnected) {
      setConnectionQuality('good');
    } else {
      setConnectionQuality('poor');
    }
  }, [isConnected, updateCount]);

  // Get update title and message
  const getUpdateTitle = (type: RealTimeUpdate['type']) => {
    const titles = {
      availability_updated: 'Availability Updated',
      booking_confirmed: 'Booking Confirmed',
      slot_released: 'Time Slot Released',
      conflict_detected: 'Conflict Detected',
      waitlist_notified: 'Waitlist Notification',
      appointment_cancelled: 'Appointment Cancelled'
    };
    return titles[type];
  };

  const getUpdateMessage = (type: RealTimeUpdate['type']) => {
    const messages = {
      availability_updated: 'Doctor availability has been updated for tomorrow',
      booking_confirmed: 'Patient confirmed appointment for 2:00 PM',
      slot_released: '10:00 AM slot is now available',
      conflict_detected: 'Scheduling conflict requires attention',
      waitlist_notified: 'Patient moved from waitlist to confirmed',
      appointment_cancelled: 'Morning appointment has been cancelled'
    };
    return messages[type];
  };

  // Handle conflict resolution
  const handleResolveConflict = useCallback(async (conflictId: string, strategy: ConflictResolution['resolutionStrategy']) => {
    try {
      // In a real implementation, this would call an API
      setActiveConflicts(prev => prev.filter(c => c.id !== conflictId));
      onConflictResolved?.(conflictId, strategy || 'manual');

      const resolutionUpdate: RealTimeUpdate = {
        id: Date.now().toString(),
        type: 'availability_updated',
        title: 'Conflict Resolved',
        message: `Scheduling conflict resolved using ${strategy} strategy`,
        timestamp: new Date()
      };

      setRecentUpdates(prev => [resolutionUpdate, ...prev.slice(0, 9)]);
    } catch (error) {
      console.error('Failed to resolve conflict:', error);
    }
  }, [onConflictResolved]);

  // Handle automatic conflict resolution
  const handleAutoResolve = useCallback(async () => {
    const resolveableConflicts = activeConflicts.filter(c => c.automated);
    
    for (const conflict of resolveableConflicts) {
      await handleResolveConflict(conflict.id, conflict.resolutionStrategy);
    }
  }, [activeConflicts, handleResolveConflict]);

  // Get update icon
  const getUpdateIcon = (type: RealTimeUpdate['type']) => {
    const icons = {
      availability_updated: <CheckCircle className="w-4 h-4 text-blue-500" />,
      booking_confirmed: <CheckCircle className="w-4 h-4 text-green-500" />,
      slot_released: <Clock className="w-4 h-4 text-green-500" />,
      conflict_detected: <AlertCircle className="w-4 h-4 text-red-500" />,
      waitlist_notified: <Users className="w-4 h-4 text-blue-500" />,
      appointment_cancelled: <AlertCircle className="w-4 h-4 text-orange-500" />
    };
    
    return icons[type];
  };

  // Get connection quality indicator
  const getConnectionQuality = () => {
    const indicators = {
      excellent: { icon: <Wifi className="w-4 h-4 text-green-500" />, text: 'Excellent', color: 'text-green-600' },
      good: { icon: <Wifi className="w-4 h-4 text-blue-500" />, text: 'Good', color: 'text-blue-600' },
      poor: { icon: <WifiOff className="w-4 h-4 text-red-500" />, text: 'Poor', color: 'text-red-600' }
    };
    
    return indicators[connectionQuality];
  };

  const quality = getConnectionQuality();

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Real-Time Updates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {quality.icon}
              <span className={`font-medium ${quality.color}`}>
                Connection: {quality.text}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant={isConnected ? 'default' : 'destructive'}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
              
              <span className="text-sm text-gray-600">
                {updateCount} updates
              </span>
            </div>
          </div>

          {/* Auto-resolve toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <span className="font-medium">Auto-resolve conflicts</span>
              <p className="text-sm text-gray-600">Automatically resolve minor conflicts</p>
            </div>
            <Button
              size="sm"
              variant={autoResolve ? 'default' : 'outline'}
              onClick={() => setAutoResolve(!autoResolve)}
            >
              {autoResolve ? 'Enabled' : 'Disabled'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Conflicts */}
      {activeConflicts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Active Conflicts ({activeConflicts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeConflicts.map((conflict) => (
              <Alert key={conflict.id} className="p-4">
                <AlertCircle className="h-4 w-4" />
                <div className="flex-1">
                  <AlertDescription className="mb-2">
                    {conflict.description}
                  </AlertDescription>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={conflict.severity === 'high' ? 'destructive' : 'secondary'}>
                        {conflict.severity}
                      </Badge>
                      
                      {conflict.automated && (
                        <Badge variant="outline" className="text-xs">
                          Auto-resolvable
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {conflict.resolutionStrategy && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResolveConflict(conflict.id, conflict.resolutionStrategy)}
                        >
                          {conflict.resolutionStrategy}
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                      >
                        Manual
                      </Button>
                    </div>
                  </div>
                </div>
              </Alert>
            ))}
            
            {autoResolve && (
              <Button
                className="w-full"
                onClick={handleAutoResolve}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Auto-resolve {activeConflicts.filter(c => c.automated).length} conflicts
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Updates Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Recent Updates ({recentUpdates.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 max-h-96 overflow-y-auto">
          {recentUpdates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <RefreshCw className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>No recent updates</p>
              <p className="text-sm">Real-time updates will appear here</p>
            </div>
          ) : (
            recentUpdates.map((update) => (
              <div
                key={update.id}
                className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="mt-0.5">
                  {getUpdateIcon(update.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{update.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {update.type.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-1">{update.message}</p>
                  
                  <span className="text-xs text-gray-500">
                    {update.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Update Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Update Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {recentUpdates.filter(u => u.type === 'availability_updated').length}
              </div>
              <div className="text-xs text-gray-600">Availability Updates</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {recentUpdates.filter(u => u.type === 'booking_confirmed').length}
              </div>
              <div className="text-xs text-gray-600">Bookings Confirmed</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {recentUpdates.filter(u => u.type === 'appointment_cancelled').length}
              </div>
              <div className="text-xs text-gray-600">Cancellations</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {activeConflicts.length}
              </div>
              <div className="text-xs text-gray-600">Active Conflicts</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealTimeUpdates;