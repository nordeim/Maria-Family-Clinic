/**
 * Security Controls & Access Management
 * Implements role-based access control, security monitoring, and data protection
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Shield, 
  Lock, 
  Users, 
  Key, 
  AlertTriangle, 
  Eye, 
  Clock,
  CheckCircle,
  XCircle,
  UserCheck,
  Database,
  Activity,
  Settings,
  RefreshCw,
  Download
} from 'lucide-react';

interface SecurityUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'clinic_admin' | 'provider' | 'staff' | 'auditor';
  department: string;
  lastLogin: Date;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  permissions: string[];
  twoFactorEnabled: boolean;
  riskScore: number;
}

interface SecurityEvent {
  id: string;
  type: 'login' | 'logout' | 'data_access' | 'permission_change' | 'failed_login' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId: string;
  userName: string;
  timestamp: Date;
  description: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
  status: 'reviewed' | 'flagged' | 'resolved';
}

interface AccessPolicy {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  conditions: string[];
  isActive: boolean;
  lastModified: Date;
  modifiedBy: string;
}

interface DataClassification {
  level: 'public' | 'internal' | 'confidential' | 'restricted';
  description: string;
  examples: string[];
  requiredControls: string[];
  color: string;
}

export default function SecurityControlsAccessManagement() {
  const [securityUsers, setSecurityUsers] = useState<SecurityUser[]>([
    {
      id: 'user-001',
      name: 'Dr. Lim Wei Ming',
      email: 'lim.weiming@clinic.com',
      role: 'provider',
      department: 'Cardiology',
      lastLogin: new Date('2024-11-04T08:30:00'),
      status: 'active',
      permissions: ['view_doctor_profiles', 'update_availability', 'manage_appointments'],
      twoFactorEnabled: true,
      riskScore: 1
    },
    {
      id: 'user-002',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@clinic.com',
      role: 'clinic_admin',
      department: 'Administration',
      lastLogin: new Date('2024-11-04T09:15:00'),
      status: 'active',
      permissions: ['manage_doctors', 'view_all_data', 'manage_users', 'audit_logs'],
      twoFactorEnabled: true,
      riskScore: 0
    },
    {
      id: 'user-003',
      name: 'Michael Chen',
      email: 'michael.chen@clinic.com',
      role: 'staff',
      department: 'IT Support',
      lastLogin: new Date('2024-11-03T18:45:00'),
      status: 'inactive',
      permissions: ['system_maintenance', 'view_logs'],
      twoFactorEnabled: false,
      riskScore: 3
    }
  ]);

  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([
    {
      id: 'event-001',
      type: 'data_access',
      severity: 'medium',
      userId: 'user-001',
      userName: 'Dr. Lim Wei Ming',
      timestamp: new Date('2024-11-04T10:15:00'),
      description: 'Accessed sensitive doctor profile data',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      location: 'Singapore',
      status: 'reviewed'
    },
    {
      id: 'event-002',
      type: 'failed_login',
      severity: 'high',
      userId: 'unknown',
      userName: 'Unknown',
      timestamp: new Date('2024-11-04T08:45:00'),
      description: 'Multiple failed login attempts detected',
      ipAddress: '203.45.67.89',
      userAgent: 'Unknown',
      location: 'Malaysia',
      status: 'flagged'
    },
    {
      id: 'event-003',
      type: 'permission_change',
      severity: 'high',
      userId: 'user-004',
      userName: 'Admin User',
      timestamp: new Date('2024-11-04T09:00:00'),
      description: 'Modified user permissions for doctor profile access',
      ipAddress: '192.168.1.50',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      status: 'resolved'
    }
  ]);

  const [accessPolicies, setAccessPolicies] = useState<AccessPolicy[]>([
    {
      id: 'pol-001',
      name: 'Doctor Profile Access',
      description: 'Control access to doctor profile information',
      resource: 'doctor_profiles',
      action: 'view',
      conditions: ['user.role == provider', 'user.clinic_id == resource.clinic_id'],
      isActive: true,
      lastModified: new Date('2024-10-15'),
      modifiedBy: 'System Admin'
    },
    {
      id: 'pol-002',
      name: 'Sensitive Data Access',
      description: 'Restrict access to highly sensitive medical information',
      resource: 'sensitive_medical_data',
      action: 'view',
      conditions: ['user.role == admin', 'user.permissions contains audit_access'],
      isActive: true,
      lastModified: new Date('2024-10-20'),
      modifiedBy: 'Security Officer'
    },
    {
      id: 'pol-003',
      name: 'Audit Log Access',
      description: 'Allow audit personnel to view compliance logs',
      resource: 'audit_logs',
      action: 'view',
      conditions: ['user.role == auditor'],
      isActive: true,
      lastModified: new Date('2024-11-01'),
      modifiedBy: 'Compliance Team'
    }
  ]);

  const [dataClassifications] = useState<DataClassification[]>([
    {
      level: 'public',
      description: 'Information that can be freely shared',
      examples: ['Doctor names', 'Clinic locations', 'Public contact information'],
      requiredControls: ['Basic access logging'],
      color: 'bg-green-100 text-green-800'
    },
    {
      level: 'internal',
      description: 'Internal use only, not publicly accessible',
      examples: ['Office procedures', 'Internal communications'],
      requiredControls: ['Access control', 'Audit logging'],
      color: 'bg-blue-100 text-blue-800'
    },
    {
      level: 'confidential',
      description: 'Sensitive information requiring protection',
      examples: ['Patient records', 'Doctor personal details', 'Medical certifications'],
      requiredControls: ['Strong encryption', 'Access control', 'Audit logging', 'Two-factor auth'],
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      level: 'restricted',
      description: 'Highly sensitive information with strict access',
      examples: ['NRIC numbers', 'Financial data', 'Legal documents'],
      requiredControls: ['End-to-end encryption', 'Multi-factor auth', 'Biometric verification', 'Comprehensive audit'],
      color: 'bg-red-100 text-red-800'
    }
  ]);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return <Badge className="bg-red-100 text-red-800">Admin</Badge>;
      case 'clinic_admin': return <Badge className="bg-purple-100 text-purple-800">Clinic Admin</Badge>;
      case 'provider': return <Badge className="bg-blue-100 text-blue-800">Provider</Badge>;
      case 'staff': return <Badge className="bg-gray-100 text-gray-800">Staff</Badge>;
      case 'auditor': return <Badge className="bg-green-100 text-green-800">Auditor</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive': return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
      case 'suspended': return <Badge className="bg-red-100 text-red-800">Suspended</Badge>;
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-blue-500 bg-blue-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'login': return <UserCheck className="h-4 w-4" />;
      case 'logout': return <UserCheck className="h-4 w-4" />;
      case 'data_access': return <Database className="h-4 w-4" />;
      case 'permission_change': return <Key className="h-4 w-4" />;
      case 'failed_login': return <XCircle className="h-4 w-4" />;
      case 'suspicious_activity': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score === 0) return 'text-green-600';
    if (score <= 2) return 'text-yellow-600';
    return 'text-red-600';
  };

  const highRiskUsers = securityUsers.filter(u => u.riskScore >= 3).length;
  const criticalEvents = securityEvents.filter(e => e.severity === 'critical').length;
  const activeUsers = securityUsers.filter(u => u.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Security Controls & Access Management</h2>
          <p className="text-gray-600 mt-1">
            Role-based access control, security monitoring, and data protection management
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Logs
          </Button>
        </div>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold">{activeUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Risk Users</p>
                <p className="text-2xl font-bold text-red-600">{highRiskUsers}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical Events</p>
                <p className="text-2xl font-bold text-orange-600">{criticalEvents}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Access Policies</p>
                <p className="text-2xl font-bold">{accessPolicies.length}</p>
              </div>
              <Shield className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="user-access" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="user-access">User Access</TabsTrigger>
          <TabsTrigger value="security-events">Security Events</TabsTrigger>
          <TabsTrigger value="access-policies">Access Policies</TabsTrigger>
          <TabsTrigger value="data-classification">Data Classification</TabsTrigger>
          <TabsTrigger value="security-settings">Security Settings</TabsTrigger>
        </TabsList>

        {/* User Access Tab */}
        <TabsContent value="user-access">
          <Card>
            <CardHeader>
              <CardTitle>User Access Management</CardTitle>
              <CardDescription>
                Manage user roles, permissions, and access control
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityUsers.map((user) => (
                  <div key={user.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{user.name}</h4>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getRoleBadge(user.role)}
                        {getStatusBadge(user.status)}
                        <div className={`text-sm font-medium ${getRiskScoreColor(user.riskScore)}`}>
                          Risk: {user.riskScore}/5
                        </div>
                        <Button variant="outline" size="sm">
                          Manage
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Department</p>
                        <p className="font-medium">{user.department}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Last Login</p>
                        <p className="font-medium">{user.lastLogin.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">2FA Enabled</p>
                        <div className="flex items-center space-x-1">
                          {user.twoFactorEnabled ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span className="font-medium">
                            {user.twoFactorEnabled ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-600">Permissions</p>
                        <p className="font-medium">{user.permissions.length} granted</p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <p className="text-xs text-gray-600 mb-1">Permissions:</p>
                      <div className="flex flex-wrap gap-1">
                        {user.permissions.slice(0, 3).map((permission) => (
                          <Badge key={permission} variant="outline" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                        {user.permissions.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{user.permissions.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center space-x-3">
                <Button>
                  <Users className="w-4 h-4 mr-2" />
                  Add New User
                </Button>
                <Button variant="outline">
                  <Key className="w-4 h-4 mr-2" />
                  Bulk Permission Update
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Events Tab */}
        <TabsContent value="security-events">
          <Card>
            <CardHeader>
              <CardTitle>Security Events Log</CardTitle>
              <CardDescription>
                Monitor and analyze security events and suspicious activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityEvents.map((event) => (
                  <div key={event.id} className={`p-4 border rounded-lg ${getSeverityColor(event.severity)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getEventTypeIcon(event.type)}
                        <Badge variant={
                          event.severity === 'critical' ? 'destructive' :
                          event.severity === 'high' ? 'default' :
                          event.severity === 'medium' ? 'secondary' : 'outline'
                        }>
                          {event.severity.toUpperCase()}
                        </Badge>
                        <span className="text-sm font-medium">{event.description}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={
                          event.status === 'resolved' ? 'default' :
                          event.status === 'flagged' ? 'destructive' : 'secondary'
                        }>
                          {event.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          Investigate
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">User</p>
                        <p className="font-medium">{event.userName}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Timestamp</p>
                        <p className="font-medium">{event.timestamp.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">IP Address</p>
                        <p className="font-medium">{event.ipAddress}</p>
                      </div>
                      {event.location && (
                        <div>
                          <p className="text-gray-600">Location</p>
                          <p className="font-medium">{event.location}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-gray-600">Event Type</p>
                        <p className="font-medium">{event.type.replace('_', ' ')}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <Button variant="outline" className="w-full">
                  <Eye className="w-4 h-4 mr-2" />
                  View All Events
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Access Policies Tab */}
        <TabsContent value="access-policies">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Access Control Policies</CardTitle>
                <CardDescription>
                  Configure and manage access control policies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {accessPolicies.map((policy) => (
                  <div key={policy.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4" />
                        <h4 className="font-medium">{policy.name}</h4>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          checked={policy.isActive}
                          onCheckedChange={(checked) => {
                            // Handle policy toggle
                            console.log(`Policy ${policy.id} ${checked ? 'activated' : 'deactivated'}`);
                          }}
                        />
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">{policy.description}</p>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Resource</p>
                        <p className="font-medium">{policy.resource}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Action</p>
                        <p className="font-medium">{policy.action}</p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <p className="text-xs text-gray-600 mb-1">Conditions:</p>
                      <div className="text-xs space-y-1">
                        {policy.conditions.map((condition, index) => (
                          <code key={index} className="block bg-gray-100 p-2 rounded">
                            {condition}
                          </code>
                        ))}
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-gray-500">
                      Last modified: {policy.lastModified.toLocaleDateString()} by {policy.modifiedBy}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Create New Policy</CardTitle>
                <CardDescription>
                  Define new access control policies and conditions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="policy-name">Policy Name</Label>
                    <Input id="policy-name" placeholder="Enter policy name" />
                  </div>

                  <div>
                    <Label htmlFor="policy-description">Description</Label>
                    <Textarea 
                      id="policy-description" 
                      placeholder="Describe the purpose of this policy"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="policy-resource">Resource</Label>
                    <Input id="policy-resource" placeholder="e.g., doctor_profiles" />
                  </div>

                  <div>
                    <Label htmlFor="policy-action">Action</Label>
                    <Input id="policy-action" placeholder="e.g., view, edit, delete" />
                  </div>

                  <div>
                    <Label htmlFor="policy-conditions">Conditions (one per line)</Label>
                    <Textarea 
                      id="policy-conditions" 
                      placeholder="user.role == provider"
                      rows={4}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="policy-active" defaultChecked />
                    <Label htmlFor="policy-active">Activate immediately</Label>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button className="flex-1">
                    <Shield className="w-4 h-4 mr-2" />
                    Create Policy
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Save Draft
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Data Classification Tab */}
        <TabsContent value="data-classification">
          <Card>
            <CardHeader>
              <CardTitle>Data Classification Levels</CardTitle>
              <CardDescription>
                Configure data classification and required security controls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dataClassifications.map((classification) => (
                  <div key={classification.level} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Badge className={classification.color}>
                          {classification.level.toUpperCase()}
                        </Badge>
                        <h4 className="font-medium">Data Classification</h4>
                      </div>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4 mr-2" />
                        Configure
                      </Button>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">{classification.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-sm font-medium mb-2">Examples:</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {classification.examples.map((example, index) => (
                            <li key={index} className="flex items-center space-x-2">
                              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                              <span>{example}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h5 className="text-sm font-medium mb-2">Required Controls:</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {classification.requiredControls.map((control, index) => (
                            <li key={index} className="flex items-center space-x-2">
                              <CheckCircle className="w-3 h-3 text-green-600" />
                              <span>{control}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings Tab */}
        <TabsContent value="security-settings">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Authentication Settings</CardTitle>
                <CardDescription>
                  Configure authentication and security policies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-600">Require 2FA for all users</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label>Password Complexity</Label>
                    <p className="text-sm text-gray-600">Enforce strong password requirements</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label>Session Timeout</Label>
                    <p className="text-sm text-gray-600">Auto logout after inactivity</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label>IP Whitelisting</Label>
                    <p className="text-sm text-gray-600">Restrict access to approved IP addresses</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label>Biometric Authentication</Label>
                    <p className="text-sm text-gray-600">Enable biometric login options</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monitoring & Alerting</CardTitle>
                <CardDescription>
                  Configure security monitoring and alert thresholds
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Security monitoring is currently active with real-time threat detection.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label>Failed Login Alerts</Label>
                      <p className="text-sm text-gray-600">Alert after 5 failed attempts</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label>Data Access Monitoring</Label>
                      <p className="text-sm text-gray-600">Log all data access events</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label>Real-time Threat Detection</Label>
                      <p className="text-sm text-gray-600">AI-powered anomaly detection</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label>Compliance Reporting</Label>
                      <p className="text-sm text-gray-600">Automated compliance report generation</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <Button className="w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  Update Security Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}