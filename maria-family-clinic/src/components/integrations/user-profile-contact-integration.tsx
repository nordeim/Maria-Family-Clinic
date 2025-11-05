/**
 * User Profile Contact Integration
 * Sub-Phase 9.9: Integration with Existing Features Retry
 * 
 * Seamless integration of contact system with user profile management
 * - Contact preferences and settings
 * - Contact history and analytics
 * - Communication settings and privacy
 * - Contact notification management
 */

import React, { useState, useEffect } from 'react';
import { useContactIntegration } from '@/lib/hooks/use-contact-integration';
import { useUser } from '@/lib/hooks/use-user';
import { 
  Phone, 
  MessageCircle, 
  Mail, 
  Calendar,
  User,
  Settings,
  Bell,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  Info,
  Heart,
  Star,
  Activity,
  FileText,
  Download,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Globe,
  Smartphone,
  Monitor,
  Tablet
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";

interface UserProfileContactIntegrationProps {
  // User data
  user?: {
    id: string
    name?: string
    email: string
    phone?: string
    profile?: {
      preferredLanguage?: string
      dateOfBirth?: Date
      gender?: string
      address?: string
      emergencyContact?: string
    }
  }
  
  // Integration features
  onContactPreferencesUpdate?: (preferences: any) => void
  onContactAction?: (action: any, context: any) => void
  
  // Show different sections
  showContactPreferences?: boolean
  showContactHistory?: boolean
  showContactAnalytics?: boolean
  showContactSettings?: boolean
  
  // Standard props
  className?: string
}

export function UserProfileContactIntegration({
  user,
  onContactPreferencesUpdate,
  onContactAction,
  showContactPreferences = true,
  showContactHistory = true,
  showContactAnalytics = true,
  showContactSettings = true,
  className
}: UserProfileContactIntegrationProps) {
  const { user: currentUser } = useUser();
  const { 
    contactPreferences, 
    contactHistory, 
    contactSettings, 
    updateContactPreferences, 
    getContactStats,
    isLoading,
    error
  } = useContactIntegration();
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [tempPreferences, setTempPreferences] = useState(contactPreferences);
  const [showContactData, setShowContactData] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');

  // Update temp preferences when contact preferences change
  useEffect(() => {
    if (contactPreferences) {
      setTempPreferences(contactPreferences);
    }
  }, [contactPreferences]);

  // Handle contact preferences save
  const handleSavePreferences = async () => {
    if (!tempPreferences) return;

    try {
      await updateContactPreferences(tempPreferences);
      setIsEditMode(false);
      onContactPreferencesUpdate?.(tempPreferences);
    } catch (error) {
      console.error('Failed to update contact preferences:', error);
    }
  };

  // Handle contact history export
  const handleExportContactHistory = () => {
    const historyData = contactHistory.map(entry => ({
      date: entry.createdAt.toISOString(),
      type: entry.type,
      category: entry.category,
      subject: entry.subject,
      summary: entry.summary,
      status: entry.status,
      priority: entry.priority,
      contextType: entry.contextType,
      contextName: entry.contextName,
      responseTime: entry.responseTime,
      resolutionTime: entry.resolutionTime,
      satisfaction: entry.satisfaction,
    }));

    const dataStr = JSON.stringify(historyData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `contact-history-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Handle contact data deletion
  const handleDeleteContactData = () => {
    // This would trigger a data deletion process
    console.log('Contact data deletion requested');
  };

  // Get contact statistics
  const stats = getContactStats();

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-SG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get time range for history filtering
  const getFilteredHistory = () => {
    const now = new Date();
    const ranges = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    };
    
    const days = ranges[selectedTimeRange as keyof typeof ranges] || 30;
    const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    return contactHistory.filter(entry => entry.createdAt >= cutoffDate);
  };

  const filteredHistory = getFilteredHistory();

  return (
    <div className={cn("space-y-6", className)}>
      {/* Contact Preferences */}
      {showContactPreferences && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Contact Preferences
                </CardTitle>
                <CardDescription>
                  Manage how you prefer to be contacted and your communication settings.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditMode(!isEditMode)}
              >
                <Edit className="h-4 w-4 mr-2" />
                {isEditMode ? 'Cancel' : 'Edit'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Contact Method Preferences */}
            <div className="space-y-4">
              <h3 className="font-medium">Contact Methods</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Primary Contact Method</Label>
                  <Select
                    value={tempPreferences?.preferredContactMethod}
                    onValueChange={(value) => 
                      setTempPreferences(prev => prev ? { ...prev, preferredContactMethod: value as any } : null)
                    }
                    disabled={!isEditMode}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="portal">Patient Portal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Emergency Contact Method</Label>
                  <Select
                    value={tempPreferences?.emergencyContactMethod}
                    onValueChange={(value) => 
                      setTempPreferences(prev => prev ? { ...prev, emergencyContactMethod: value as any } : null)
                    }
                    disabled={!isEditMode}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Communication Preferences */}
            <div className="space-y-4">
              <h3 className="font-medium">Communication Preferences</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="allow-direct-contact">Allow Direct Contact</Label>
                    <Switch
                      id="allow-direct-contact"
                      checked={tempPreferences?.allowDirectContact}
                      onCheckedChange={(checked) =>
                        setTempPreferences(prev => prev ? { ...prev, allowDirectContact: checked } : null)
                      }
                      disabled={!isEditMode}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="medical-updates">Medical Updates via Email</Label>
                    <Switch
                      id="medical-updates"
                      checked={tempPreferences?.medicalUpdatesViaEmail}
                      onCheckedChange={(checked) =>
                        setTempPreferences(prev => prev ? { ...prev, medicalUpdatesViaEmail: checked } : null)
                      }
                      disabled={!isEditMode}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="appointment-reminders">Appointment Reminders</Label>
                    <Switch
                      id="appointment-reminders"
                      checked={tempPreferences?.appointmentReminders}
                      onCheckedChange={(checked) =>
                        setTempPreferences(prev => prev ? { ...prev, appointmentReminders: checked } : null)
                      }
                      disabled={!isEditMode}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="health-goal-reminders">Health Goal Reminders</Label>
                    <Switch
                      id="health-goal-reminders"
                      checked={tempPreferences?.healthGoalReminders}
                      onCheckedChange={(checked) =>
                        setTempPreferences(prev => prev ? { ...prev, healthGoalReminders: checked } : null)
                      }
                      disabled={!isEditMode}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-marketing">Email Marketing</Label>
                    <Switch
                      id="email-marketing"
                      checked={tempPreferences?.allowEmailMarketing}
                      onCheckedChange={(checked) =>
                        setTempPreferences(prev => prev ? { ...prev, allowEmailMarketing: checked } : null)
                      }
                      disabled={!isEditMode}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="sms-updates">SMS Updates</Label>
                    <Switch
                      id="sms-updates"
                      checked={tempPreferences?.allowSmsUpdates}
                      onCheckedChange={(checked) =>
                        setTempPreferences(prev => prev ? { ...prev, allowSmsUpdates: checked } : null)
                      }
                      disabled={!isEditMode}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="phone-calls">Phone Calls</Label>
                    <Switch
                      id="phone-calls"
                      checked={tempPreferences?.allowPhoneCalls}
                      onCheckedChange={(checked) =>
                        setTempPreferences(prev => prev ? { ...prev, allowPhoneCalls: checked } : null)
                      }
                      disabled={!isEditMode}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="whatsapp-updates">WhatsApp Updates</Label>
                    <Switch
                      id="whatsapp-updates"
                      checked={tempPreferences?.allowWhatsAppUpdates}
                      onCheckedChange={(checked) =>
                        setTempPreferences(prev => prev ? { ...prev, allowWhatsAppUpdates: checked } : null)
                      }
                      disabled={!isEditMode}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Timing Preferences */}
            <div className="space-y-4">
              <h3 className="font-medium">Contact Timing</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Contact Allowed From</Label>
                  <Input
                    type="time"
                    value={tempPreferences?.contactAllowedFrom || '09:00'}
                    onChange={(e) =>
                      setTempPreferences(prev => prev ? { ...prev, contactAllowedFrom: e.target.value } : null)
                    }
                    disabled={!isEditMode}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Contact Allowed To</Label>
                  <Input
                    type="time"
                    value={tempPreferences?.contactAllowedTo || '17:00'}
                    onChange={(e) =>
                      setTempPreferences(prev => prev ? { ...prev, contactAllowedTo: e.target.value } : null)
                    }
                    disabled={!isEditMode}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select
                    value={tempPreferences?.timezone}
                    onValueChange={(value) =>
                      setTempPreferences(prev => prev ? { ...prev, timezone: value } : null)
                    }
                    disabled={!isEditMode}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Singapore">Asia/Singapore</SelectItem>
                      <SelectItem value="Asia/Kuala_Lumpur">Asia/Kuala Lumpur</SelectItem>
                      <SelectItem value="Asia/Bangkok">Asia/Bangkok</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="do-not-disturb">Do Not Disturb</Label>
                <Switch
                  id="do-not-disturb"
                  checked={tempPreferences?.doNotDisturb}
                  onCheckedChange={(checked) =>
                    setTempPreferences(prev => prev ? { ...prev, doNotDisturb: checked } : null)
                  }
                  disabled={!isEditMode}
                />
              </div>
            </div>

            {/* Save/Cancel Buttons */}
            {isEditMode && (
              <div className="flex gap-2">
                <Button onClick={handleSavePreferences} disabled={isLoading}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setIsEditMode(false)}>
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Contact Analytics */}
      {showContactAnalytics && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Contact Analytics
            </CardTitle>
            <CardDescription>
              Overview of your contact history and communication patterns.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalContacts}</div>
                <div className="text-xs text-muted-foreground">Total Contacts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.contactsLast30Days}</div>
                <div className="text-xs text-muted-foreground">Last 30 Days</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {Math.round(stats.averageResponseTime)}m
                </div>
                <div className="text-xs text-muted-foreground">Avg Response</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(stats.satisfactionScore * 10) / 10}/5
                </div>
                <div className="text-xs text-muted-foreground">Satisfaction</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Response Time Performance</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(stats.averageResponseTime)} minutes
                </span>
              </div>
              <Progress 
                value={Math.max(0, 100 - (stats.averageResponseTime / 60) * 100)} 
                className="h-2"
              />

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Resolution Time</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(stats.averageResolutionTime / 60)} hours
                </span>
              </div>
              <Progress 
                value={Math.max(0, 100 - (stats.averageResolutionTime / 1440) * 100)} 
                className="h-2"
              />

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Satisfaction Score</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(stats.satisfactionScore * 10) / 10} / 5.0
                </span>
              </div>
              <Progress 
                value={(stats.satisfactionScore / 5) * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact History */}
      {showContactHistory && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Contact History
                </CardTitle>
                <CardDescription>
                  View and manage your communication history with healthcare providers.
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                    <SelectItem value="1y">Last year</SelectItem>
                  </SelectContent>
                </Select>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Actions
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={handleExportContactHistory}>
                      <Download className="h-4 w-4 mr-2" />
                      Export History
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleDeleteContactData} className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Request Data Deletion
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((entry) => (
                  <Card key={entry.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={
                            entry.priority === 'emergency' ? 'destructive' :
                            entry.priority === 'urgent' ? 'default' :
                            entry.priority === 'high' ? 'secondary' : 'outline'
                          }>
                            {entry.priority}
                          </Badge>
                          <Badge variant="outline">{entry.type}</Badge>
                          <Badge variant="outline">{entry.contextType}</Badge>
                        </div>
                        
                        <h4 className="font-medium">{entry.subject || 'No subject'}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {entry.summary}
                        </p>
                        
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{formatDate(entry.createdAt)}</span>
                          {entry.responseTime && (
                            <span>Response: {entry.responseTime}m</span>
                          )}
                          {entry.resolutionTime && (
                            <span>Resolution: {entry.resolutionTime}m</span>
                          )}
                          {entry.satisfaction && (
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span>{entry.satisfaction}/5</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <Badge variant={entry.status === 'resolved' ? 'default' : 'secondary'}>
                          {entry.status}
                        </Badge>
                        {entry.contextName && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {entry.contextName}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No contact history found for the selected time period.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact Settings */}
      {showContactSettings && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Contact Settings & Privacy
            </CardTitle>
            <CardDescription>
              Manage your contact data privacy and system settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Privacy Settings */}
            <div className="space-y-4">
              <h3 className="font-medium">Privacy & Data Protection</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Data Retention Period</Label>
                    <p className="text-xs text-muted-foreground">
                      How long to keep your contact data
                    </p>
                  </div>
                  <Select
                    value={tempPreferences?.dataRetentionPeriod?.toString()}
                    onValueChange={(value) =>
                      setTempPreferences(prev => prev ? { 
                        ...prev, 
                        dataRetentionPeriod: parseInt(value) 
                      } : null)
                    }
                    disabled={!isEditMode}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="180">6 months</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                      <SelectItem value="730">2 years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Contact Data Encryption</Label>
                    <p className="text-xs text-muted-foreground">
                      Encrypt stored contact information
                    </p>
                  </div>
                  <Switch
                    checked={tempPreferences?.contactDataEncrypted}
                    onCheckedChange={(checked) =>
                      setTempPreferences(prev => prev ? { ...prev, contactDataEncrypted: checked } : null)
                    }
                    disabled={!isEditMode}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Third-party Data Sharing</Label>
                    <p className="text-xs text-muted-foreground">
                      Allow sharing contact data with partners
                    </p>
                  </div>
                  <Switch
                    checked={tempPreferences?.thirdPartySharing}
                    onCheckedChange={(checked) =>
                      setTempPreferences(prev => prev ? { ...prev, thirdPartySharing: checked } : null)
                    }
                    disabled={!isEditMode}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Marketing Tracking</Label>
                    <p className="text-xs text-muted-foreground">
                      Allow tracking for marketing purposes
                    </p>
                  </div>
                  <Switch
                    checked={tempPreferences?.marketingTracking}
                    onCheckedChange={(checked) =>
                      setTempPreferences(prev => prev ? { ...prev, marketingTracking: checked } : null)
                    }
                    disabled={!isEditMode}
                  />
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="space-y-4">
              <h3 className="font-medium">Notification Preferences</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Emergency Notifications</Label>
                    <p className="text-xs text-muted-foreground">
                      Receive urgent health notifications
                    </p>
                  </div>
                  <Switch
                    checked={tempPreferences?.emergencyNotifications}
                    onCheckedChange={(checked) =>
                      setTempPreferences(prev => prev ? { ...prev, emergencyNotifications: checked } : null)
                    }
                    disabled={!isEditMode}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Program Enrollment Updates</Label>
                    <p className="text-xs text-muted-foreground">
                      Notifications about Healthier SG enrollment
                    </p>
                  </div>
                  <Switch
                    checked={tempPreferences?.programEnrollmentUpdates}
                    onCheckedChange={(checked) =>
                      setTempPreferences(prev => prev ? { ...prev, programEnrollmentUpdates: checked } : null)
                    }
                    disabled={!isEditMode}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Share Contact History</Label>
                    <p className="text-xs text-muted-foreground">
                      Allow sharing contact history with healthcare providers
                    </p>
                  </div>
                  <Switch
                    checked={tempPreferences?.shareContactWithPartners}
                    onCheckedChange={(checked) =>
                      setTempPreferences(prev => prev ? { ...prev, shareContactWithPartners: checked } : null)
                    }
                    disabled={!isEditMode}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export { UserProfileContactIntegration };
export type { UserProfileContactIntegrationProps };