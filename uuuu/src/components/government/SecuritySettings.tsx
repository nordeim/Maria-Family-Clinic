/**
 * Security Settings Component
 * Sub-Phase 8.11: Government Compliance & Security Framework
 * Comprehensive security controls and user access management
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Shield, 
  Lock, 
  Key, 
  Eye, 
  EyeOff,
  Smartphone,
  Mail,
  Monitor,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Settings,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  Copy,
  UserCheck
} from 'lucide-react';

interface SecuritySettings {
  // Authentication settings
  requireMFA: boolean;
  mfaMethod: 'totp' | 'sms' | 'email' | 'push';
  sessionTimeout: number; // minutes
  allowRememberDevice: boolean;
  maxRememberDays: number;
  
  // Password policies
  minPasswordLength: number;
  requireSpecialChars: boolean;
  requireNumbers: boolean;
  requireUppercase: boolean;
  passwordExpiryDays: number;
  preventPasswordReuse: number;
  
  // Access control
  ipWhitelistEnabled: boolean;
  allowedIPRanges: string[];
  blockedIPRanges: string[];
  requireGovernmentAuth: boolean;
  allowSSO: boolean;
  ssoProviders: string[];
  
  // Privacy controls
  dataEncryptionEnabled: boolean;
  auditLoggingEnabled: boolean;
  privacyMode: 'standard' | 'enhanced' | 'maximum';
  dataRetentionPeriod: number; // days
  automaticDataDeletion: boolean;
  
  // Government integration
  singpassRequired: boolean;
  governmentIDVerification: boolean;
  consentTrackingEnabled: boolean;
  complianceReporting: boolean;
}

interface SecurityEvent {
  id: string;
  type: 'login' | 'logout' | 'password_change' | 'mfa_setup' | 'suspicious_activity' | 'data_access';
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  location?: string;
  success: boolean;
  details: Record<string, any>;
}

interface AccessLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  timestamp: Date;
  ipAddress: string;
  outcome: 'SUCCESS' | 'FAILURE' | 'BLOCKED';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export default function SecuritySettings() {
  const [settings, setSettings] = useState<SecuritySettings>({
    requireMFA: true,
    mfaMethod: 'totp',
    sessionTimeout: 30,
    allowRememberDevice: true,
    maxRememberDays: 30,
    minPasswordLength: 12,
    requireSpecialChars: true,
    requireNumbers: true,
    requireUppercase: true,
    passwordExpiryDays: 90,
    preventPasswordReuse: 5,
    ipWhitelistEnabled: false,
    allowedIPRanges: [],
    blockedIPRanges: [],
    requireGovernmentAuth: true,
    allowSSO: true,
    ssoProviders: ['singpass', 'myinfo', 'corppass'],
    dataEncryptionEnabled: true,
    auditLoggingEnabled: true,
    privacyMode: 'enhanced',
    dataRetentionPeriod: 2555,
    automaticDataDeletion: true,
    singpassRequired: true,
    governmentIDVerification: true,
    consentTrackingEnabled: true,
    complianceReporting: true
  });

  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Generate sample security events
    const sampleEvents: SecurityEvent[] = [
      {
        id: 'SEC-001',
        type: 'login',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        location: 'Singapore, SG',
        success: true,
        details: { method: 'singpass', device: 'desktop' }
      },
      {
        id: 'SEC-002',
        type: 'mfa_setup',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        success: true,
        details: { method: 'totp', app: 'Google Authenticator' }
      },
      {
        id: 'SEC-003',
        type: 'suspicious_activity',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        ipAddress: '203.45.67.89',
        userAgent: 'curl/7.68.0',
        location: 'Unknown',
        success: false,
        details: { reason: 'multiple_failed_attempts', attempts: 5 }
      },
      {
        id: 'SEC-004',
        type: 'password_change',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        success: true,
        details: { reason: 'scheduled_rotation', previous_password_age: 89 }
      }
    ];

    const sampleAccessLogs: AccessLog[] = [
      {
        id: 'ACC-001',
        userId: 'user-123',
        userName: 'Dr. Sarah Lim',
        action: 'VIEW_PATIENT_RECORD',
        resource: 'patient_data',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        ipAddress: '10.0.1.25',
        outcome: 'SUCCESS',
        riskLevel: 'LOW'
      },
      {
        id: 'ACC-002',
        userId: 'admin-456',
        userName: 'System Administrator',
        action: 'EXPORT_USER_DATA',
        resource: 'user_profiles',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        ipAddress: '10.0.0.50',
        outcome: 'SUCCESS',
        riskLevel: 'MEDIUM'
      },
      {
        id: 'ACC-003',
        userId: 'user-789',
        userName: 'Nurse Wong',
        action: 'FAILED_LOGIN',
        resource: 'authentication',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        ipAddress: '192.168.10.45',
        outcome: 'FAILURE',
        riskLevel: 'HIGH'
      }
    ];

    setSecurityEvents(sampleEvents);
    setAccessLogs(sampleAccessLogs);
  }, []);

  const updateSetting = <K extends keyof SecuritySettings>(
    key: K, 
    value: SecuritySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    setLoading(true);
    // Simulate save operation
    setTimeout(() => {
      setLoading(false);
      // Show success message
      alert('Security settings saved successfully');
    }, 2000);
  };

  const generateBackupCodes = () => {
    const codes = Array.from({ length: 10 }, () => 
      Math.random().toString(36).substr(2, 6).toUpperCase()
    );
    return codes;
  };

  const [backupCodes] = useState(() => generateBackupCodes());

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'HIGH': return 'text-red-600 bg-red-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'LOW': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login': return <UserCheck className="h-4 w-4 text-green-600" />;
      case 'logout': return <User className="h-4 w-4 text-blue-600" />;
      case 'password_change': return <Key className="h-4 w-4 text-orange-600" />;
      case 'mfa_setup': return <Smartphone className="h-4 w-4 text-purple-600" />;
      case 'suspicious_activity': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'data_access': return <Eye className="h-4 w-4 text-indigo-600" />;
      default: return <Shield className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Security Settings</h1>
              <p className="text-gray-600 mt-2">
                Configure security controls and access management policies
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={saveSettings} disabled={loading}>
                <Settings className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="authentication" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="authentication">Authentication</TabsTrigger>
            <TabsTrigger value="access">Access Control</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="events">Security Events</TabsTrigger>
            <TabsTrigger value="audit">Access Logs</TabsTrigger>
          </TabsList>

          {/* Authentication Tab */}
          <TabsContent value="authentication">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* MFA Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Multi-Factor Authentication</CardTitle>
                  <CardDescription>
                    Configure MFA requirements and methods
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Require MFA</Label>
                      <p className="text-sm text-gray-600">
                        Mandate MFA for all user accounts
                      </p>
                    </div>
                    <Switch 
                      checked={settings.requireMFA}
                      onCheckedChange={(checked) => updateSetting('requireMFA', checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>MFA Method</Label>
                    <Select 
                      value={settings.mfaMethod} 
                      onValueChange={(value: any) => updateSetting('mfaMethod', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="totp">Authenticator App (TOTP)</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="push">Push Notification</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Session Timeout (minutes)</Label>
                    <Input 
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
                      min="5"
                      max="480"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Remember Device</Label>
                      <p className="text-sm text-gray-600">
                        Allow trusted devices for {settings.maxRememberDays} days
                      </p>
                    </div>
                    <Switch 
                      checked={settings.allowRememberDevice}
                      onCheckedChange={(checked) => updateSetting('allowRememberDevice', checked)}
                    />
                  </div>

                  {settings.allowRememberDevice && (
                    <div className="space-y-2">
                      <Label>Max Remember Days</Label>
                      <Input 
                        type="number"
                        value={settings.maxRememberDays}
                        onChange={(e) => updateSetting('maxRememberDays', parseInt(e.target.value))}
                        min="1"
                        max="90"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Password Policy */}
              <Card>
                <CardHeader>
                  <CardTitle>Password Policy</CardTitle>
                  <CardDescription>
                    Configure password requirements and policies
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Minimum Password Length</Label>
                    <Input 
                      type="number"
                      value={settings.minPasswordLength}
                      onChange={(e) => updateSetting('minPasswordLength', parseInt(e.target.value))}
                      min="8"
                      max="50"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Require Special Characters</Label>
                      <p className="text-sm text-gray-600">@#$%^&*()_+</p>
                    </div>
                    <Switch 
                      checked={settings.requireSpecialChars}
                      onCheckedChange={(checked) => updateSetting('requireSpecialChars', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Require Numbers</Label>
                    </div>
                    <Switch 
                      checked={settings.requireNumbers}
                      onCheckedChange={(checked) => updateSetting('requireNumbers', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Require Uppercase</Label>
                    </div>
                    <Switch 
                      checked={settings.requireUppercase}
                      onCheckedChange={(checked) => updateSetting('requireUppercase', checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Password Expiry (days)</Label>
                    <Input 
                      type="number"
                      value={settings.passwordExpiryDays}
                      onChange={(e) => updateSetting('passwordExpiryDays', parseInt(e.target.value))}
                      min="30"
                      max="365"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Prevent Password Reuse</Label>
                    <Input 
                      type="number"
                      value={settings.preventPasswordReuse}
                      onChange={(e) => updateSetting('preventPasswordReuse', parseInt(e.target.value))}
                      min="1"
                      max="20"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Government Authentication */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Government Authentication</CardTitle>
                <CardDescription>
                  Configure Singapore government authentication requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Require SingPass</Label>
                        <p className="text-sm text-gray-600">
                          Mandate SingPass authentication for sensitive operations
                        </p>
                      </div>
                      <Switch 
                        checked={settings.singpassRequired}
                        onCheckedChange={(checked) => updateSetting('singpassRequired', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Government ID Verification</Label>
                        <p className="text-sm text-gray-600">
                          Verify identity through government systems
                        </p>
                      </div>
                      <Switch 
                        checked={settings.governmentIDVerification}
                        onCheckedChange={(checked) => updateSetting('governmentIDVerification', checked)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Allow SSO</Label>
                        <p className="text-sm text-gray-600">
                          Enable single sign-on integration
                        </p>
                      </div>
                      <Switch 
                        checked={settings.allowSSO}
                        onCheckedChange={(checked) => updateSetting('allowSSO', checked)}
                      />
                    </div>

                    {settings.allowSSO && (
                      <div className="space-y-2">
                        <Label>SSO Providers</Label>
                        <div className="space-y-2">
                          {settings.ssoProviders.map((provider) => (
                            <div key={provider} className="flex items-center justify-between">
                              <span className="text-sm capitalize">{provider}</span>
                              <Badge variant="outline">Active</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Backup Codes */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Backup Codes</CardTitle>
                <CardDescription>
                  Generate backup codes for account recovery
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Backup Codes Generated</Label>
                      <p className="text-sm text-gray-600">
                        Use these codes when MFA is unavailable
                      </p>
                    </div>
                    <Button variant="outline" onClick={() => setShowBackupCodes(!showBackupCodes)}>
                      {showBackupCodes ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                      {showBackupCodes ? 'Hide' : 'Show'} Codes
                    </Button>
                  </div>

                  {showBackupCodes && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 p-4 bg-gray-50 rounded-lg">
                      {backupCodes.map((code, index) => (
                        <div key={index} className="text-center">
                          <code className="text-sm font-mono">{code}</code>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Access Control Tab */}
          <TabsContent value="access">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* IP Restrictions */}
              <Card>
                <CardHeader>
                  <CardTitle>IP Access Control</CardTitle>
                  <CardDescription>
                    Configure IP-based access restrictions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable IP Whitelist</Label>
                      <p className="text-sm text-gray-600">
                        Restrict access to allowed IP ranges only
                      </p>
                    </div>
                    <Switch 
                      checked={settings.ipWhitelistEnabled}
                      onCheckedChange={(checked) => updateSetting('ipWhitelistEnabled', checked)}
                    />
                  </div>

                  {settings.ipWhitelistEnabled && (
                    <div className="space-y-2">
                      <Label>Allowed IP Ranges</Label>
                      <div className="space-y-2">
                        {settings.allowedIPRanges.map((range, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <code className="text-sm">{range}</code>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button variant="outline" className="w-full">
                          <Plus className="w-4 h-4 mr-2" />
                          Add IP Range
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Compliance Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Settings</CardTitle>
                  <CardDescription>
                    Government compliance and reporting settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Consent Tracking</Label>
                      <p className="text-sm text-gray-600">
                        Track user consent for data processing
                      </p>
                    </div>
                    <Switch 
                      checked={settings.consentTrackingEnabled}
                      onCheckedChange={(checked) => updateSetting('consentTrackingEnabled', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Compliance Reporting</Label>
                      <p className="text-sm text-gray-600">
                        Enable automated compliance reports
                      </p>
                    </div>
                    <Switch 
                      checked={settings.complianceReporting}
                      onCheckedChange={(checked) => updateSetting('complianceReporting', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Data Protection */}
              <Card>
                <CardHeader>
                  <CardTitle>Data Protection</CardTitle>
                  <CardDescription>
                    Configure data protection and encryption settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Data Encryption</Label>
                      <p className="text-sm text-gray-600">
                        Encrypt sensitive data at rest and in transit
                      </p>
                    </div>
                    <Switch 
                      checked={settings.dataEncryptionEnabled}
                      onCheckedChange={(checked) => updateSetting('dataEncryptionEnabled', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Audit Logging</Label>
                      <p className="text-sm text-gray-600">
                        Log all data access and modifications
                      </p>
                    </div>
                    <Switch 
                      checked={settings.auditLoggingEnabled}
                      onCheckedChange={(checked) => updateSetting('auditLoggingEnabled', checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Privacy Mode</Label>
                    <Select 
                      value={settings.privacyMode} 
                      onValueChange={(value: any) => updateSetting('privacyMode', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="enhanced">Enhanced</SelectItem>
                        <SelectItem value="maximum">Maximum</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Data Retention */}
              <Card>
                <CardHeader>
                  <CardTitle>Data Retention</CardTitle>
                  <CardDescription>
                    Configure data retention and deletion policies
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Data Retention Period (days)</Label>
                    <Input 
                      type="number"
                      value={settings.dataRetentionPeriod}
                      onChange={(e) => updateSetting('dataRetentionPeriod', parseInt(e.target.value))}
                      min="30"
                      max="3650"
                    />
                    <p className="text-sm text-gray-600">
                      Current: {(settings.dataRetentionPeriod / 365).toFixed(1)} years
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Automatic Data Deletion</Label>
                      <p className="text-sm text-gray-600">
                        Delete expired data automatically
                      </p>
                    </div>
                    <Switch 
                      checked={settings.automaticDataDeletion}
                      onCheckedChange={(checked) => updateSetting('automaticDataDeletion', checked)}
                    />
                  </div>

                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      Next scheduled data cleanup: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Events Tab */}
          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle>Security Events</CardTitle>
                <CardDescription>
                  Recent security events and activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {securityEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getEventIcon(event.type)}
                        <div>
                          <p className="font-medium capitalize">
                            {event.type.replace('_', ' ')}
                          </p>
                          <p className="text-sm text-gray-600">
                            {event.timestamp.toLocaleString()} • {event.ipAddress}
                          </p>
                          {event.location && (
                            <p className="text-xs text-gray-500">{event.location}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {event.success ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                        )}
                        <Badge variant={event.success ? 'default' : 'destructive'}>
                          {event.success ? 'SUCCESS' : 'FAILED'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Access Logs Tab */}
          <TabsContent value="audit">
            <Card>
              <CardHeader>
                <CardTitle>Access Logs</CardTitle>
                <CardDescription>
                  Detailed access logs and user activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {accessLogs.map((log) => (
                    <div key={log.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{log.userName}</span>
                          <Badge className={getRiskColor(log.riskLevel)}>
                            {log.riskLevel} RISK
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={
                            log.outcome === 'SUCCESS' ? 'default' :
                            log.outcome === 'FAILURE' ? 'destructive' : 'secondary'
                          }>
                            {log.outcome}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {log.timestamp.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-700">Action</p>
                          <p>{log.action.replace('_', ' ')}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Resource</p>
                          <p>{log.resource}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">IP Address</p>
                          <p>{log.ipAddress}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}