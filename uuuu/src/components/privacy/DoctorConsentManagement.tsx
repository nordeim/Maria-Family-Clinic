/**
 * Doctor Consent Management Component
 * Handles consent forms, privacy settings, and data protection preferences
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  UserCheck, 
  Shield, 
  Eye, 
  Lock, 
  FileText, 
  Clock,
  AlertTriangle,
  CheckCircle,
  Download,
  Send,
  RefreshCw
} from 'lucide-react';

interface ConsentRecord {
  id: string;
  doctorId: string;
  doctorName: string;
  consentType: 'profile_display' | 'contact_info' | 'schedule' | 'reviews' | 'research';
  status: 'granted' | 'pending' | 'withdrawn' | 'expired';
  grantedAt?: Date;
  expiresAt?: Date;
  withdrawnAt?: Date;
  consentVersion: string;
  ipAddress: string;
  userAgent: string;
}

interface PrivacyPreference {
  category: string;
  description: string;
  enabled: boolean;
  lastUpdated: Date;
}

export default function DoctorConsentManagement() {
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [consentRecords, setConsentRecords] = useState<ConsentRecord[]>([
    {
      id: 'CONS-2024-001',
      doctorId: 'doc-001',
      doctorName: 'Dr. Lim Wei Ming',
      consentType: 'profile_display',
      status: 'granted',
      grantedAt: new Date('2024-10-15'),
      expiresAt: new Date('2025-10-15'),
      consentVersion: '2.1',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0...'
    },
    {
      id: 'CONS-2024-002',
      doctorId: 'doc-002',
      doctorName: 'Dr. Sarah Chen',
      consentType: 'contact_info',
      status: 'pending',
      consentVersion: '2.1',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0...'
    },
    {
      id: 'CONS-2024-003',
      doctorId: 'doc-003',
      doctorName: 'Dr. Ahmad Rahman',
      consentType: 'reviews',
      status: 'withdrawn',
      grantedAt: new Date('2024-09-01'),
      withdrawnAt: new Date('2024-11-01'),
      consentVersion: '2.0',
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0...'
    }
  ]);

  const [privacyPreferences, setPrivacyPreferences] = useState<PrivacyPreference[]>([
    {
      category: 'Profile Visibility',
      description: 'Show doctor profile publicly on platform',
      enabled: true,
      lastUpdated: new Date('2024-10-15')
    },
    {
      category: 'Contact Information',
      description: 'Display clinic contact details',
      enabled: true,
      lastUpdated: new Date('2024-10-15')
    },
    {
      category: 'Schedule Display',
      description: 'Show availability to patients',
      enabled: true,
      lastUpdated: new Date('2024-10-15')
    },
    {
      category: 'Patient Reviews',
      description: 'Display patient reviews and ratings',
      enabled: false,
      lastUpdated: new Date('2024-11-01')
    },
    {
      category: 'Research Participation',
      description: 'Allow data use for medical research',
      enabled: false,
      lastUpdated: new Date('2024-10-15')
    },
    {
      category: 'Professional Achievements',
      description: 'Display awards and certifications',
      enabled: true,
      lastUpdated: new Date('2024-10-15')
    }
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'granted': return <Badge className="bg-green-100 text-green-800">Granted</Badge>;
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'withdrawn': return <Badge className="bg-red-100 text-red-800">Withdrawn</Badge>;
      case 'expired': return <Badge className="bg-gray-100 text-gray-800">Expired</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const getConsentTypeIcon = (type: string) => {
    switch (type) {
      case 'profile_display': return <Eye className="h-4 w-4" />;
      case 'contact_info': return <FileText className="h-4 w-4" />;
      case 'schedule': return <Clock className="h-4 w-4" />;
      case 'reviews': return <UserCheck className="h-4 w-4" />;
      case 'research': return <Shield className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getConsentTypeName = (type: string) => {
    switch (type) {
      case 'profile_display': return 'Profile Display';
      case 'contact_info': return 'Contact Information';
      case 'schedule': return 'Schedule Visibility';
      case 'reviews': return 'Patient Reviews';
      case 'research': return 'Research Participation';
      default: return 'Unknown';
    }
  };

  const updatePrivacyPreference = (index: number, enabled: boolean) => {
    const updated = [...privacyPreferences];
    updated[index].enabled = enabled;
    updated[index].lastUpdated = new Date();
    setPrivacyPreferences(updated);
  };

  const consentStats = {
    total: consentRecords.length,
    granted: consentRecords.filter(r => r.status === 'granted').length,
    pending: consentRecords.filter(r => r.status === 'pending').length,
    withdrawn: consentRecords.filter(r => r.status === 'withdrawn').length,
    expired: consentRecords.filter(r => r.status === 'expired').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Doctor Consent Management</h2>
          <p className="text-gray-600 mt-1">
            Manage consent forms, privacy preferences, and data protection settings
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Records
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Consents</p>
                <p className="text-2xl font-bold">{consentStats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Granted</p>
                <p className="text-2xl font-bold text-green-600">{consentStats.granted}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{consentStats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Withdrawn</p>
                <p className="text-2xl font-bold text-red-600">{consentStats.withdrawn}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Expired</p>
                <p className="text-2xl font-bold text-gray-600">{consentStats.expired}</p>
              </div>
              <Clock className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="consent-records" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="consent-records">Consent Records</TabsTrigger>
          <TabsTrigger value="privacy-settings">Privacy Settings</TabsTrigger>
          <TabsTrigger value="consent-forms">Consent Forms</TabsTrigger>
        </TabsList>

        {/* Consent Records Tab */}
        <TabsContent value="consent-records">
          <Card>
            <CardHeader>
              <CardTitle>Consent Records</CardTitle>
              <CardDescription>
                View and manage doctor consent records and statuses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {consentRecords.map((record) => (
                  <div key={record.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getConsentTypeIcon(record.consentType)}
                        <div>
                          <h4 className="font-medium">{record.doctorName}</h4>
                          <p className="text-sm text-gray-600">
                            {getConsentTypeName(record.consentType)} - {record.id}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(record.status)}
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Consent Version</p>
                        <p className="font-medium">{record.consentVersion}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Granted At</p>
                        <p className="font-medium">
                          {record.grantedAt ? record.grantedAt.toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Expires At</p>
                        <p className="font-medium">
                          {record.expiresAt ? record.expiresAt.toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">IP Address</p>
                        <p className="font-medium">{record.ipAddress}</p>
                      </div>
                    </div>

                    {record.status === 'pending' && (
                      <div className="mt-3 flex items-center space-x-2">
                        <Button size="sm">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve Consent
                        </Button>
                        <Button variant="outline" size="sm">
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Request Clarification
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Settings Tab */}
        <TabsContent value="privacy-settings">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Preferences</CardTitle>
                <CardDescription>
                  Configure privacy settings for doctor information display
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {privacyPreferences.map((preference, index) => (
                  <div key={preference.category} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <Label className="font-medium">{preference.category}</Label>
                      <p className="text-sm text-gray-600">{preference.description}</p>
                      <p className="text-xs text-gray-500">
                        Last updated: {preference.lastUpdated.toLocaleDateString()}
                      </p>
                    </div>
                    <Switch
                      checked={preference.enabled}
                      onCheckedChange={(enabled) => updatePrivacyPreference(index, enabled)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Protection Settings</CardTitle>
                <CardDescription>
                  Configure data retention and protection policies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label>Data Encryption</Label>
                      <p className="text-sm text-gray-600">Encrypt sensitive doctor data at rest</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label>Access Logging</Label>
                      <p className="text-sm text-gray-600">Log all data access for audit trail</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-gray-600">Require 2FA for sensitive data access</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label>Auto Logout</Label>
                      <p className="text-sm text-gray-600">Automatically logout after inactivity</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Changes to privacy settings will affect all doctors and require consent updates.
                  </AlertDescription>
                </Alert>

                <Button className="w-full">
                  <Lock className="w-4 h-4 mr-2" />
                  Update Security Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Consent Forms Tab */}
        <TabsContent value="consent-forms">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Consent Forms</CardTitle>
                <CardDescription>
                  Manage and distribute consent forms to doctors
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">PDPA Consent Form v2.1</h4>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Personal Data Protection Act consent for Singapore healthcare data
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button size="sm">
                      <Send className="w-4 h-4 mr-2" />
                      Send to Pending
                    </Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">SMC Guidelines Acknowledgment v1.0</h4>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Singapore Medical Council professional guidelines acknowledgment
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button size="sm">
                      <Send className="w-4 h-4 mr-2" />
                      Send to Pending
                    </Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Research Participation Consent v1.0</h4>
                    <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Optional consent for participating in medical research studies
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileText className="w-4 h-4 mr-2" />
                      Activate
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Create New Consent Form</CardTitle>
                <CardDescription>
                  Create and customize consent forms for new purposes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="form-title">Form Title</Label>
                    <Input id="form-title" placeholder="Enter consent form title" />
                  </div>

                  <div>
                    <Label htmlFor="form-description">Description</Label>
                    <Textarea 
                      id="form-description" 
                      placeholder="Describe the purpose and scope of this consent"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="form-content">Form Content</Label>
                    <Textarea 
                      id="form-content" 
                      placeholder="Enter the full consent form content"
                      rows={8}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="requires-signature" />
                    <Label htmlFor="requires-signature">Requires digital signature</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="auto-expire" defaultChecked />
                    <Label htmlFor="auto-expire">Auto-expire after 12 months</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="gdpr-relevant" defaultChecked />
                    <Label htmlFor="gdpr-relevant">GDPR/PDPA relevant</Label>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button className="flex-1">
                    <FileText className="w-4 h-4 mr-2" />
                    Create Form
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Save Draft
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}