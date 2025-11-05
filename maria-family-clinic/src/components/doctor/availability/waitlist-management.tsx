/**
 * Waitlist Management Component
 * Sub-Phase 7.5: Doctor Availability & Scheduling Integration
 * 
 * Comprehensive waitlist management with real-time notifications and position tracking
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Clock, 
  Users, 
  Bell,
  User,
  Phone,
  Mail,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  XCircle,
  Timer,
  Calendar,
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import { UrgencyLevel } from '@/types/doctor';
import { format } from 'date-fns';

interface WaitlistEntry {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  appointmentType: string;
  urgencyLevel: UrgencyLevel;
  joinedAt: Date;
  estimatedWaitTime?: string;
  preferredSlots: Array<{
    date: string;
    startTime: string;
    endTime: string;
  }>;
  status: 'WAITING' | 'NOTIFIED' | 'CONFIRMED' | 'EXPIRED' | 'CANCELLED';
  position?: number;
  notificationSent?: boolean;
  lastNotified?: Date;
  notes?: string;
}

interface WaitlistManagementProps {
  isOpen: boolean;
  onClose: () => void;
  doctorId: string;
  clinicId?: string;
}

interface WaitlistStats {
  totalWaiting: number;
  averageWaitTime: number;
  oldestEntry: Date;
  notificationsSent: number;
  autoPromotionRate: number;
}

export const WaitlistManagement: React.FC<WaitlistManagementProps> = ({
  isOpen,
  onClose,
  doctorId,
  clinicId
}) => {
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<WaitlistEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'WAITING' | 'NOTIFIED' | 'CONFIRMED'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [stats, setStats] = useState<WaitlistStats | null>(null);

  // New waitlist entry form state
  const [newEntry, setNewEntry] = useState({
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    appointmentType: 'consultation',
    urgencyLevel: 'ROUTINE' as UrgencyLevel,
    preferredDate: '',
    preferredTime: '',
    notes: ''
  });

  // Load waitlist entries
  const loadWaitlistEntries = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/waitlist/${doctorId}`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setWaitlistEntries(data.entries || []);
        setStats(data.stats || null);
      }
    } catch (error) {
      console.error('Failed to load waitlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load on mount and when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadWaitlistEntries();
      
      // Auto-refresh every 30 seconds
      const interval = setInterval(loadWaitlistEntries, 30000);
      setRefreshInterval(interval);
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [isOpen]);

  // Filter waitlist entries
  const filteredEntries = waitlistEntries.filter(entry => {
    const matchesStatus = filterStatus === 'all' || entry.status === filterStatus;
    const matchesSearch = searchQuery === '' || 
      entry.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.patientPhone.includes(searchQuery) ||
      entry.appointmentType.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  // Get status badge
  const getStatusBadge = (status: WaitlistEntry['status']) => {
    const badges = {
      WAITING: <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
        <Clock className="w-3 h-3 mr-1" />
        Waiting
      </Badge>,
      NOTIFIED: <Badge variant="outline" className="bg-orange-50 border-orange-200 text-orange-700">
        <Bell className="w-3 h-3 mr-1" />
        Notified
      </Badge>,
      CONFIRMED: <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
        <CheckCircle className="w-3 h-3 mr-1" />
        Confirmed
      </Badge>,
      EXPIRED: <Badge variant="destructive">
        <XCircle className="w-3 h-3 mr-1" />
        Expired
      </Badge>,
      CANCELLED: <Badge variant="secondary">
        <XCircle className="w-3 h-3 mr-1" />
        Cancelled
      </Badge>
    };
    
    return badges[status];
  };

  // Get urgency badge
  const getUrgencyBadge = (urgency: UrgencyLevel) => {
    const badges = {
      EMERGENCY: <Badge variant="destructive" className="text-xs">Emergency</Badge>,
      URGENT: <Badge variant="outline" className="bg-orange-50 text-orange-700 text-xs">Urgent</Badge>,
      SAME_DAY: <Badge variant="outline" className="bg-yellow-50 text-yellow-700 text-xs">Same Day</Badge>,
      ROUTINE: <Badge variant="secondary" className="text-xs">Routine</Badge>
    };
    
    return badges[urgency];
  };

  // Handle notify patient
  const handleNotifyPatient = async (entry: WaitlistEntry) => {
    try {
      const response = await fetch(`/api/waitlist/${entry.id}/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: 'sms' })
      });

      if (response.ok) {
        // Update local state
        setWaitlistEntries(prev => 
          prev.map(e => e.id === entry.id ? { ...e, status: 'NOTIFIED', lastNotified: new Date() } : e)
        );
      }
    } catch (error) {
      console.error('Failed to notify patient:', error);
    }
  };

  // Handle promote from waitlist
  const handlePromotePatient = async (entry: WaitlistEntry) => {
    try {
      const response = await fetch(`/api/waitlist/${entry.id}/promote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        setWaitlistEntries(prev => 
          prev.map(e => e.id === entry.id ? { ...e, status: 'CONFIRMED' } : e)
        );
      }
    } catch (error) {
      console.error('Failed to promote patient:', error);
    }
  };

  // Handle remove from waitlist
  const handleRemoveFromWaitlist = async (entry: WaitlistEntry) => {
    try {
      const response = await fetch(`/api/waitlist/${entry.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        setWaitlistEntries(prev => prev.filter(e => e.id !== entry.id));
        if (selectedEntry?.id === entry.id) {
          setSelectedEntry(null);
        }
      }
    } catch (error) {
      console.error('Failed to remove from waitlist:', error);
    }
  };

  // Handle add new waitlist entry
  const handleAddToWaitlist = async () => {
    try {
      const response = await fetch(`/api/waitlist/${doctorId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: newEntry.patientName,
          patientPhone: newEntry.patientPhone,
          patientEmail: newEntry.patientEmail,
          appointmentType: newEntry.appointmentType,
          urgencyLevel: newEntry.urgencyLevel,
          preferredSlot: {
            date: newEntry.preferredDate,
            startTime: newEntry.preferredTime,
            endTime: newEntry.preferredTime // This would be calculated
          },
          notes: newEntry.notes
        })
      });

      if (response.ok) {
        loadWaitlistEntries();
        setNewEntry({
          patientName: '',
          patientPhone: '',
          patientEmail: '',
          appointmentType: 'consultation',
          urgencyLevel: 'ROUTINE',
          preferredDate: '',
          preferredTime: '',
          notes: ''
        });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Failed to add to waitlist:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Waitlist Management
          </DialogTitle>
          <DialogDescription>
            Manage patient waitlist with real-time notifications and position tracking
          </DialogDescription>
        </DialogHeader>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="text-2xl font-bold">{stats.totalWaiting}</div>
                    <div className="text-xs text-gray-600">Total Waiting</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Timer className="w-5 h-5 text-orange-500" />
                  <div>
                    <div className="text-2xl font-bold">{stats.averageWaitTime}</div>
                    <div className="text-xs text-gray-600">Avg Wait (days)</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-500" />
                  <div>
                    <div className="text-lg font-bold">
                      {format(stats.oldestEntry, 'MMM d')}
                    </div>
                    <div className="text-xs text-gray-600">Oldest Entry</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-green-500" />
                  <div>
                    <div className="text-2xl font-bold">{stats.notificationsSent}</div>
                    <div className="text-xs text-gray-600">Notifications</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-500" />
                  <div>
                    <div className="text-2xl font-bold">{stats.autoPromotionRate}%</div>
                    <div className="text-xs text-gray-600">Auto-Promotion</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search patients, phone numbers, or appointment types..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          
          <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="WAITING">Waiting</SelectItem>
              <SelectItem value="NOTIFIED">Notified</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={() => setShowAddForm(true)}>
            <User className="w-4 h-4 mr-2" />
            Add to Waitlist
          </Button>
          
          <Button variant="outline" onClick={loadWaitlistEntries} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Waitlist Entries */}
        <div className="space-y-3">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No waitlist entries found</p>
            </div>
          ) : (
            filteredEntries.map((entry) => (
              <Card 
                key={entry.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedEntry?.id === entry.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedEntry(entry)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="font-medium">{entry.patientName}</div>
                        {getStatusBadge(entry.status)}
                        {getUrgencyBadge(entry.urgencyLevel)}
                        {entry.position && (
                          <Badge variant="outline" className="text-xs">
                            #{entry.position}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {entry.patientPhone}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {entry.appointmentType}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Joined {format(entry.joinedAt, 'MMM d, h:mm a')}
                        </div>
                      </div>

                      {entry.estimatedWaitTime && (
                        <div className="mt-2 text-sm text-orange-600">
                          <Timer className="w-4 h-4 inline mr-1" />
                          Estimated wait: {entry.estimatedWaitTime}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      {entry.status === 'WAITING' && (
                        <>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNotifyPatient(entry);
                            }}
                          >
                            <Bell className="w-4 h-4 mr-1" />
                            Notify
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePromotePatient(entry);
                            }}
                          >
                            Promote
                          </Button>
                        </>
                      )}
                      
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFromWaitlist(entry);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Entry Details Modal */}
        {selectedEntry && (
          <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Waitlist Entry Details
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Patient Name</Label>
                    <div className="font-medium">{selectedEntry.patientName}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Phone</Label>
                    <div className="font-medium">{selectedEntry.patientPhone}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Email</Label>
                    <div className="font-medium">{selectedEntry.patientEmail || 'Not provided'}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Appointment Type</Label>
                    <div className="font-medium">{selectedEntry.appointmentType}</div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600">Preferred Slots</Label>
                  <div className="space-y-1">
                    {selectedEntry.preferredSlots.map((slot, index) => (
                      <div key={index} className="text-sm">
                        {format(new Date(slot.date), 'MMM d, yyyy')} - {slot.startTime}
                      </div>
                    ))}
                  </div>
                </div>

                {selectedEntry.notes && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Notes</Label>
                    <div className="text-sm bg-gray-50 p-3 rounded">
                      {selectedEntry.notes}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Status</Label>
                    <div>{getStatusBadge(selectedEntry.status)}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Joined</Label>
                    <div className="text-sm">
                      {format(selectedEntry.joinedAt, 'MMM d, yyyy h:mm a')}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedEntry(null)}>
                  Close
                </Button>
                
                {selectedEntry.status === 'WAITING' && (
                  <>
                    <Button onClick={() => handleNotifyPatient(selectedEntry)}>
                      <Bell className="w-4 h-4 mr-1" />
                      Send Notification
                    </Button>
                    
                    <Button variant="outline" onClick={() => handlePromotePatient(selectedEntry)}>
                      Promote to Appointment
                    </Button>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Add to Waitlist Form */}
        {showAddForm && (
          <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Add to Waitlist
                </DialogTitle>
                <DialogDescription>
                  Add a new patient to the waitlist
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPatientName">Patient Name *</Label>
                    <Input
                      id="newPatientName"
                      value={newEntry.patientName}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, patientName: e.target.value }))}
                      placeholder="Enter full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPatientPhone">Phone Number *</Label>
                    <Input
                      id="newPatientPhone"
                      value={newEntry.patientPhone}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, patientPhone: e.target.value }))}
                      placeholder="+65 XXXX XXXX"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPatientEmail">Email</Label>
                    <Input
                      id="newPatientEmail"
                      type="email"
                      value={newEntry.patientEmail}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, patientEmail: e.target.value }))}
                      placeholder="patient@email.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newAppointmentType">Appointment Type</Label>
                    <Select 
                      value={newEntry.appointmentType}
                      onValueChange={(value) => setNewEntry(prev => ({ ...prev, appointmentType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="consultation">General Consultation</SelectItem>
                        <SelectItem value="followup">Follow-up</SelectItem>
                        <SelectItem value="checkup">Health Check-up</SelectItem>
                        <SelectItem value="procedure">Procedure</SelectItem>
                        <SelectItem value="vaccination">Vaccination</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newUrgency">Urgency Level</Label>
                  <Select 
                    value={newEntry.urgencyLevel}
                    onValueChange={(value) => setNewEntry(prev => ({ ...prev, urgencyLevel: value as UrgencyLevel }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ROUTINE">Routine</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                      <SelectItem value="SAME_DAY">Same Day</SelectItem>
                      <SelectItem value="EMERGENCY">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newNotes">Notes</Label>
                  <Textarea
                    id="newNotes"
                    value={newEntry.notes}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any special requirements or notes..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddToWaitlist}>
                  Add to Waitlist
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WaitlistManagement;