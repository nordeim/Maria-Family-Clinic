/**
 * Privacy Incident Management Panel
 * Sub-Phase 9.5: PDPA-Compliant Health Data Protection
 * Comprehensive incident tracking and response management
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertTriangle,
  Shield,
  Clock,
  User,
  FileText,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Plus,
  Filter,
  Search,
  Calendar,
  TrendingUp,
  BarChart3,
  Zap,
  Target
} from 'lucide-react';
import { usePrivacyCompliance } from '@/hooks/use-privacy-compliance';

interface PrivacyIncident {
  id: string;
  type: 'DATA_BREACH' | 'UNAUTHORIZED_ACCESS' | 'CONSENT_VIOLATION' | 'RETENTION_VIOLATION' | 'ENCRYPTION_FAILURE' | 'AUDIT_TAMPERING';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  affectedRecords: number;
  affectedUsers: number;
  discoveryDate: Date;
  status: 'OPEN' | 'INVESTIGATING' | 'CONTAINED' | 'RESOLVED' | 'CLOSED';
  assignedTo?: string;
  regulatoryDeadline?: Date;
  notificationRequired: boolean;
  notificationsSent: number;
  investigationFindings?: string;
  correctiveActions?: string[];
  lessonsLearned?: string;
  closedAt?: Date;
  createdAt: Date;
}

interface PrivacyIncidentPanelProps {
  showCreateForm?: boolean;
  showAnalytics?: boolean;
  userId?: string;
  onIncidentCreate?: (incident: PrivacyIncident) => void;
  onIncidentUpdate?: (incident: PrivacyIncident) => void;
}

export const PrivacyIncidentPanel: React.FC<PrivacyIncidentPanelProps> = ({
  showCreateForm = false,
  showAnalytics = true,
  userId,
  onIncidentCreate,
  onIncidentUpdate
}) => {
  const [incidents, setIncidents] = useState<PrivacyIncident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<PrivacyIncident | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { incidents: apiIncidents, refreshData } = usePrivacyCompliance();

  // Mock incident data
  useEffect(() => {
    const mockIncidents: PrivacyIncident[] = [
      {
        id: 'incident-1',
        type: 'UNAUTHORIZED_ACCESS',
        severity: 'HIGH',
        title: 'Unauthorized access to patient records',
        description: 'Suspicious login activity detected from unknown IP address attempting to access patient health records.',
        affectedRecords: 25,
        affectedUsers: 12,
        discoveryDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: 'INVESTIGATING',
        assignedTo: 'Security Team',
        regulatoryDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        notificationRequired: true,
        notificationsSent: 0,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'incident-2',
        type: 'CONSENT_VIOLATION',
        severity: 'MEDIUM',
        title: 'Data processed without valid consent',
        description: 'Patient data was processed for medical consultation without proper consent documentation.',
        affectedRecords: 8,
        affectedUsers: 1,
        discoveryDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        status: 'RESOLVED',
        assignedTo: 'Privacy Officer',
        notificationsSent: 1,
        investigationFindings: 'Consent form was signed but not properly recorded in system.',
        correctiveActions: [
          'Updated consent recording process',
          'Retrained staff on consent procedures',
          'Implemented consent verification system'
        ],
        lessonsLearned: 'Need better integration between physical consent forms and digital records.',
        closedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'incident-3',
        type: 'ENCRYPTION_FAILURE',
        severity: 'CRITICAL',
        title: 'Encryption failure for sensitive health data',
        description: 'System failed to encrypt PHI fields in recent medical enquiries due to key server downtime.',
        affectedRecords: 45,
        affectedUsers: 30,
        discoveryDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        status: 'CONTAINED',
        assignedTo: 'IT Security',
        regulatoryDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        notificationRequired: true,
        notificationsSent: 1,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ];

    setIncidents(mockIncidents);
    setIsLoading(false);
  }, []);

  // Filter incidents
  const filteredIncidents = incidents.filter(incident => {
    const matchesSeverity = filterSeverity === 'all' || incident.severity === filterSeverity;
    const matchesStatus = filterStatus === 'all' || incident.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSeverity && matchesStatus && matchesSearch;
  });

  // Get severity color
  const getSeverityColor = (severity: PrivacyIncident['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get status color
  const getStatusColor = (status: PrivacyIncident['status']) => {
    switch (status) {
      case 'OPEN':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'INVESTIGATING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CONTAINED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get incident type icon
  const getIncidentTypeIcon = (type: PrivacyIncident['type']) => {
    switch (type) {
      case 'DATA_BREACH':
        return Shield;
      case 'UNAUTHORIZED_ACCESS':
        return User;
      case 'CONSENT_VIOLATION':
        return FileText;
      case 'RETENTION_VIOLATION':
        return Clock;
      case 'ENCRYPTION_FAILURE':
        return AlertTriangle;
      case 'AUDIT_TAMPERING':
        return Edit;
      default:
        return AlertTriangle;
    }
  };

  // Calculate statistics
  const stats = {
    total: incidents.length,
    open: incidents.filter(i => i.status === 'OPEN').length,
    critical: incidents.filter(i => i.severity === 'CRITICAL').length,
    resolved: incidents.filter(i => i.status === 'RESOLVED' || i.status === 'CLOSED').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span>Privacy Incident Management</span>
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Track, investigate, and resolve privacy and security incidents
          </p>
        </div>
        {showCreateForm && (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Report Incident
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              All time incidents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Cases</CardTitle>
            <Clock className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.open}</div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <Zap className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
            <p className="text-xs text-muted-foreground">
              High priority incidents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
            <p className="text-xs text-muted-foreground">
              Successfully resolved
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search incidents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="all">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="all">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="INVESTIGATING">Investigating</option>
              <option value="CONTAINED">Contained</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incidents List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Incidents ({filteredIncidents.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredIncidents.map((incident) => {
                  const TypeIcon = getIncidentTypeIcon(incident.type);
                  const isOverdue = incident.regulatoryDeadline && 
                    incident.regulatoryDeadline < new Date() && 
                    incident.status !== 'RESOLVED' && 
                    incident.status !== 'CLOSED';

                  return (
                    <div
                      key={incident.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                        selectedIncident?.id === incident.id ? 'ring-2 ring-blue-500' : ''
                      } ${isOverdue ? 'border-red-300 bg-red-50' : ''}`}
                      onClick={() => setSelectedIncident(incident)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <TypeIcon className="h-5 w-5 text-gray-600 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {incident.title}
                            </h4>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {incident.description}
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge
                                variant="outline"
                                className={getSeverityColor(incident.severity)}
                              >
                                {incident.severity}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={getStatusColor(incident.status)}
                              >
                                {incident.status}
                              </Badge>
                              {isOverdue && (
                                <Badge variant="destructive" className="text-xs">
                                  OVERDUE
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span>{incident.affectedRecords} records</span>
                              <span>{incident.affectedUsers} users</span>
                              <span>{incident.discoveryDate.toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Incident Details */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Incident Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedIncident ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{selectedIncident.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{selectedIncident.description}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Type:</span>
                      <span className="text-sm font-medium">{selectedIncident.type.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Severity:</span>
                      <Badge variant="outline" className={getSeverityColor(selectedIncident.severity)}>
                        {selectedIncident.severity}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <Badge variant="outline" className={getStatusColor(selectedIncident.status)}>
                        {selectedIncident.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Affected Records:</span>
                      <span className="text-sm font-medium">{selectedIncident.affectedRecords}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Affected Users:</span>
                      <span className="text-sm font-medium">{selectedIncident.affectedUsers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Discovery Date:</span>
                      <span className="text-sm font-medium">{selectedIncident.discoveryDate.toLocaleDateString()}</span>
                    </div>
                    {selectedIncident.assignedTo && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Assigned To:</span>
                        <span className="text-sm font-medium">{selectedIncident.assignedTo}</span>
                      </div>
                    )}
                    {selectedIncident.regulatoryDeadline && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Deadline:</span>
                        <span className={`text-sm font-medium ${isOverdue(selectedIncident) ? 'text-red-600 font-bold' : ''}`}>
                          {selectedIncident.regulatoryDeadline.toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {selectedIncident.correctiveActions && selectedIncident.correctiveActions.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Corrective Actions</h5>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {selectedIncident.correctiveActions.map((action, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedIncident.lessonsLearned && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Lessons Learned</h5>
                      <p className="text-xs text-gray-600">{selectedIncident.lessonsLearned}</p>
                    </div>
                  )}

                  <div className="flex space-x-2 pt-2">
                    <Button size="sm" className="flex-1">
                      <Edit className="h-3 w-3 mr-1" />
                      Update
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileText className="h-3 w-3 mr-1" />
                      Report
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600">
                    Select an incident to view details
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Analytics Section */}
      {showAnalytics && (
        <Card>
          <CardHeader>
            <CardTitle>Incident Analytics</CardTitle>
            <CardDescription>
              Trend analysis and incident patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="trends" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="trends">Trends</TabsTrigger>
                <TabsTrigger value="types">Types</TabsTrigger>
                <TabsTrigger value="resolution">Resolution</TabsTrigger>
              </TabsList>

              <TabsContent value="trends" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">-12%</div>
                    <p className="text-sm text-gray-600">Incident Rate (30 days)</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">2.3 days</div>
                    <p className="text-sm text-gray-600">Avg Resolution Time</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-600">94%</div>
                    <p className="text-sm text-gray-600">Resolution Rate</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="types" className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-red-600" />
                      <span className="text-sm font-medium">Unauthorized Access</span>
                    </div>
                    <Badge variant="outline">35%</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-yellow-600" />
                      <span className="text-sm font-medium">Consent Violations</span>
                    </div>
                    <Badge variant="outline">25%</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium">Retention Violations</span>
                    </div>
                    <Badge variant="outline">20%</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                      <span className="text-sm font-medium">Encryption Failures</span>
                    </div>
                    <Badge variant="outline">20%</Badge>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="resolution" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-3">Resolution Status</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Resolved</span>
                        <span className="text-sm font-medium text-green-600">65%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">In Progress</span>
                        <span className="text-sm font-medium text-yellow-600">25%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Pending</span>
                        <span className="text-sm font-medium text-red-600">10%</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-3">Time to Resolution</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">&lt; 1 day</span>
                        <span className="text-sm font-medium">40%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">1-7 days</span>
                        <span className="text-sm font-medium">45%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">&gt; 7 days</span>
                        <span className="text-sm font-medium">15%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

function isOverdue(incident: PrivacyIncident): boolean {
  return incident.regulatoryDeadline ? 
    incident.regulatoryDeadline < new Date() && 
    incident.status !== 'RESOLVED' && 
    incident.status !== 'CLOSED' : false;
}

export default PrivacyIncidentPanel;