/**
 * Data Subject Rights Panel
 * Sub-Phase 9.5: PDPA-Compliant Health Data Protection
 * Comprehensive management of data subject access requests (DSAR)
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Users,
  FileText,
  Download,
  Edit,
  Trash2,
  Eye,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Settings,
  Calendar,
  User,
  Mail,
  Phone,
  Shield,
  Lock,
  Key,
  Database,
  FileCheck,
  FileX,
  HelpCircle,
  ExternalLink,
  Copy,
  Share,
  MoreVertical
} from 'lucide-react';
import { format } from 'date-fns';

interface DataSubjectRequest {
  id: string;
  requestId: string;
  requestType: 'ACCESS' | 'RECTIFICATION' | 'ERASURE' | 'PORTABILITY' | 'RESTRICTION' | 'OBJECTION' | 'COMPLAINT' | 'AUTOMATED_DECISION_MAKING';
  dataSubjectId: string;
  dataSubjectName: string;
  dataSubjectEmail: string;
  dataSubjectPhone?: string;
  requestDescription: string;
  dataCategories: string[];
  specificRecords: string[];
  dateRangeStart?: string;
  dateRangeEnd?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED' | 'ON_HOLD' | 'APPEALED' | 'CLOSED';
  assignedTo?: string;
  estimatedCompletion?: string;
  actualCompletion?: string;
  recordsIdentified: number;
  recordsProvided: number;
  recordsModified: number;
  recordsDeleted: number;
  responseMethod?: string;
  responseFormat?: string;
  regulatoryDeadline: string;
  extensionRequired: boolean;
  extensionReason?: string;
  medicalDataInvolved: boolean;
  professionalConsultation: boolean;
  clinicalReview: boolean;
  qualityScore?: number;
  satisfactionRating?: number;
  createdAt: string;
  updatedAt: string;
}

interface DataSubjectRightsPanelProps {
  userId?: string;
  userRole?: 'admin' | 'staff' | 'user';
  dataSubjectId?: string;
}

export const DataSubjectRightsPanel: React.FC<DataSubjectRightsPanelProps> = ({
  userId,
  userRole = 'user',
  dataSubjectId
}) => {
  const [requests, setRequests] = useState<DataSubjectRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<DataSubjectRequest | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newRequest, setNewRequest] = useState({
    requestType: 'ACCESS' as const,
    dataSubjectEmail: '',
    dataCategories: [] as string[],
    specificRecords: [] as string[],
    requestDescription: '',
    medicalDataInvolved: false
  });
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - in real implementation, this would come from API
  useEffect(() => {
    const mockRequests: DataSubjectRequest[] = [
      {
        id: 'REQ-001',
        requestId: 'DSAR-2024-001',
        requestType: 'ACCESS',
        dataSubjectId: 'patient-001',
        dataSubjectName: 'John Doe',
        dataSubjectEmail: 'john.doe@email.com',
        dataSubjectPhone: '+65-9123-4567',
        requestDescription: 'Request for copy of all my health records and medical history',
        dataCategories: ['medical_history', 'consultation_notes', 'test_results', 'prescriptions'],
        specificRecords: [],
        dateRangeStart: '2020-01-01T00:00:00Z',
        dateRangeEnd: '2024-11-04T23:59:59Z',
        status: 'IN_PROGRESS',
        assignedTo: 'Dr. Sarah Lim',
        estimatedCompletion: '2024-12-04T17:00:00Z',
        recordsIdentified: 45,
        recordsProvided: 0,
        recordsModified: 0,
        recordsDeleted: 0,
        responseMethod: 'SECURE_DOWNLOAD',
        responseFormat: 'DIGITAL_COPY',
        regulatoryDeadline: '2024-12-04T17:00:00Z',
        extensionRequired: false,
        medicalDataInvolved: true,
        professionalConsultation: true,
        clinicalReview: true,
        createdAt: '2024-11-04T09:00:00Z',
        updatedAt: '2024-11-04T10:30:00Z'
      },
      {
        id: 'REQ-002',
        requestId: 'DSAR-2024-002',
        requestType: 'RECTIFICATION',
        dataSubjectId: 'patient-002',
        dataSubjectName: 'Jane Smith',
        dataSubjectEmail: 'jane.smith@email.com',
        requestDescription: 'Request to correct date of birth and contact information',
        dataCategories: ['personal_details', 'contact_information'],
        specificRecords: ['REC-001', 'REC-002'],
        status: 'PENDING',
        recordsIdentified: 0,
        recordsProvided: 0,
        recordsModified: 0,
        recordsDeleted: 0,
        regulatoryDeadline: '2024-12-04T17:00:00Z',
        extensionRequired: false,
        medicalDataInvolved: false,
        professionalConsultation: false,
        clinicalReview: false,
        createdAt: '2024-11-04T14:00:00Z',
        updatedAt: '2024-11-04T14:00:00Z'
      },
      {
        id: 'REQ-003',
        requestId: 'DSAR-2024-003',
        requestType: 'ERASURE',
        dataSubjectId: 'patient-003',
        dataSubjectName: 'Ahmed Rahman',
        dataSubjectEmail: 'ahmed.rahman@email.com',
        requestDescription: 'Request for deletion of all personal data under right to be forgotten',
        dataCategories: ['personal_data', 'medical_records', 'consultation_history'],
        specificRecords: [],
        status: 'REJECTED',
        recordsIdentified: 0,
        recordsProvided: 0,
        recordsModified: 0,
        recordsDeleted: 0,
        regulatoryDeadline: '2024-12-04T17:00:00Z',
        extensionRequired: false,
        medicalDataInvolved: true,
        professionalConsultation: true,
        clinicalReview: true,
        createdAt: '2024-11-01T11:00:00Z',
        updatedAt: '2024-11-03T16:00:00Z'
      }
    ];
    
    setRequests(mockRequests);
    setLoading(false);
  }, [dataSubjectId]);

  const requestTypes = [
    {
      type: 'ACCESS',
      name: 'Right of Access',
      description: 'Request for copy of personal data',
      icon: FileText,
      responseTime: '30 days',
      required: true
    },
    {
      type: 'RECTIFICATION',
      name: 'Rectification',
      description: 'Request to correct inaccurate personal data',
      icon: Edit,
      responseTime: '30 days',
      required: true
    },
    {
      type: 'ERASURE',
      name: 'Erasure',
      description: 'Right to be forgotten - request for data deletion',
      icon: Trash2,
      responseTime: '30 days',
      required: true
    },
    {
      type: 'PORTABILITY',
      name: 'Data Portability',
      description: 'Request to transfer data to another service',
      icon: Download,
      responseTime: '30 days',
      required: false
    },
    {
      type: 'RESTRICTION',
      name: 'Restriction of Processing',
      description: 'Request to limit how data is processed',
      icon: Lock,
      responseTime: '30 days',
      required: false
    },
    {
      type: 'OBJECTION',
      name: 'Right to Object',
      description: 'Object to processing based on legitimate interests',
      icon: XCircle,
      responseTime: '30 days',
      required: false
    }
  ];

  const filteredRequests = requests.filter(request => {
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesType = filterType === 'all' || request.requestType === filterType;
    const matchesSearch = searchTerm === '' ||
      request.dataSubjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.dataSubjectEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requestDescription.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      PENDING: 'secondary',
      IN_PROGRESS: 'default',
      COMPLETED: 'default',
      REJECTED: 'destructive',
      ON_HOLD: 'outline',
      APPEALED: 'destructive',
      CLOSED: 'outline'
    };
    
    const icons: Record<string, any> = {
      PENDING: Clock,
      IN_PROGRESS: Settings,
      COMPLETED: CheckCircle,
      REJECTED: XCircle,
      ON_HOLD: AlertTriangle,
      APPEALED: AlertTriangle,
      CLOSED: CheckCircle
    };
    
    const Icon = icons[status] || Clock;
    
    return (
      <Badge variant={variants[status] || 'outline'} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.replace(/_/g, ' ')}
      </Badge>
    );
  };

  const getRequestTypeInfo = (type: string) => {
    return requestTypes.find(t => t.type === type) || requestTypes[0];
  };

  const isOverdue = (deadline: string, status: string) => {
    return new Date(deadline) < new Date() && !['COMPLETED', 'REJECTED', 'CLOSED'].includes(status);
  };

  const getDaysRemaining = (deadline: string) => {
    const now = new Date();
    const due = new Date(deadline);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleSubmitRequest = () => {
    // Validate form
    if (!newRequest.dataSubjectEmail || !newRequest.requestDescription) {
      alert('Please fill in all required fields');
      return;
    }

    // Create new request
    const regulatoryDeadline = new Date();
    const extension = newRequest.medicalDataInvolved ? 45 : 30; // Extended deadline for health data
    regulatoryDeadline.setDate(regulatoryDeadline.getDate() + extension);

    const request: DataSubjectRequest = {
      id: `REQ-${Date.now()}`,
      requestId: `DSAR-2024-${String(requests.length + 1).padStart(3, '0')}`,
      requestType: newRequest.requestType,
      dataSubjectId: `patient-${Date.now()}`,
      dataSubjectName: newRequest.dataSubjectEmail.split('@')[0],
      dataSubjectEmail: newRequest.dataSubjectEmail,
      requestDescription: newRequest.requestDescription,
      dataCategories: newRequest.dataCategories,
      specificRecords: newRequest.specificRecords,
      status: 'PENDING',
      recordsIdentified: 0,
      recordsProvided: 0,
      recordsModified: 0,
      recordsDeleted: 0,
      regulatoryDeadline: regulatoryDeadline.toISOString(),
      extensionRequired: newRequest.medicalDataInvolved,
      medicalDataInvolved: newRequest.medicalDataInvolved,
      professionalConsultation: newRequest.medicalDataInvolved,
      clinicalReview: newRequest.medicalDataInvolved,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setRequests([request, ...requests]);
    setNewRequest({
      requestType: 'ACCESS',
      dataSubjectEmail: '',
      dataCategories: [],
      specificRecords: [],
      requestDescription: '',
      medicalDataInvolved: false
    });
    setShowCreateDialog(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            Data Subject Rights
          </h2>
          <p className="text-gray-600">
            Manage PDPA data subject access requests (DSAR) and rights compliance
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <HelpCircle className="h-4 w-4 mr-2" />
            Rights Guide
          </Button>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Submit Data Subject Access Request</DialogTitle>
                <DialogDescription>
                  Exercise your rights under the Personal Data Protection Act (PDPA)
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dataSubjectEmail">Your Email Address *</Label>
                  <Input
                    id="dataSubjectEmail"
                    type="email"
                    placeholder="your.email@domain.com"
                    value={newRequest.dataSubjectEmail}
                    onChange={(e) => setNewRequest({...newRequest, dataSubjectEmail: e.target.value})}
                  />
                  <p className="text-xs text-gray-600">
                    We will use this to verify your identity and send updates
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="requestType">Request Type *</Label>
                  <select 
                    id="requestType"
                    className="w-full p-2 border rounded"
                    value={newRequest.requestType}
                    onChange={(e) => setNewRequest({...newRequest, requestType: e.target.value as any})}
                  >
                    {requestTypes.map(type => (
                      <option key={type.type} value={type.type}>
                        {type.name} {type.required ? '(Required)' : '(Optional)'}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-600">
                    {getRequestTypeInfo(newRequest.requestType).description}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="requestDescription">Description *</Label>
                  <Textarea
                    id="requestDescription"
                    placeholder="Please describe your request in detail..."
                    value={newRequest.requestDescription}
                    onChange={(e) => setNewRequest({...newRequest, requestDescription: e.target.value})}
                    rows={4}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Data Categories of Interest</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['personal_details', 'contact_information', 'medical_history', 'consultation_notes', 'test_results', 'prescriptions', 'billing_info', 'appointment_history'].map(category => (
                      <div key={category} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={category}
                          checked={newRequest.dataCategories.includes(category)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewRequest({
                                ...newRequest,
                                dataCategories: [...newRequest.dataCategories, category]
                              });
                            } else {
                              setNewRequest({
                                ...newRequest,
                                dataCategories: newRequest.dataCategories.filter(c => c !== category)
                              });
                            }
                          }}
                        />
                        <Label htmlFor={category} className="text-sm">
                          {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="medicalData"
                    checked={newRequest.medicalDataInvolved}
                    onChange={(e) => setNewRequest({...newRequest, medicalDataInvolved: e.target.checked})}
                  />
                  <Label htmlFor="medicalData" className="text-sm">
                    This request involves medical data (extended processing time may apply)
                  </Label>
                </div>
                
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    We will respond to your request within {newRequest.medicalDataInvolved ? '45' : '30'} days. 
                    For medical data requests, a healthcare professional may need to review the information before disclosure.
                  </AlertDescription>
                </Alert>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmitRequest}>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Request
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Rights Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        {requestTypes.map((type) => {
          const count = requests.filter(r => r.requestType === type.type).length;
          const Icon = type.icon;
          return (
            <Card key={type.type} className="text-center">
              <CardContent className="p-4">
                <Icon className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <h3 className="font-semibold text-sm">{type.name}</h3>
                <p className="text-xl font-bold">{count}</p>
                <p className="text-xs text-gray-600">{type.responseTime}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search requests by name, email, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border rounded"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="REJECTED">Rejected</option>
            </select>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border rounded"
            >
              <option value="all">All Types</option>
              {requestTypes.map(type => (
                <option key={type.type} value={type.type}>{type.name}</option>
              ))}
            </select>
            
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <div className="grid gap-4">
        {loading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Loading requests...</p>
            </CardContent>
          </Card>
        ) : filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">No data subject requests found</p>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => {
            const typeInfo = getRequestTypeInfo(request.requestType);
            const TypeIcon = typeInfo.icon;
            const daysRemaining = getDaysRemaining(request.regulatoryDeadline);
            const overdue = isOverdue(request.regulatoryDeadline, request.status);
            const urgent = daysRemaining <= 7 && !overdue;
            
            return (
              <Card key={request.id} className={overdue ? 'border-red-300' : urgent ? 'border-yellow-300' : ''}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <TypeIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">{request.requestId}</h3>
                            {getStatusBadge(request.status)}
                            {request.medicalDataInvolved && (
                              <Badge variant="outline" className="text-red-600 border-red-600">
                                <Shield className="h-3 w-3 mr-1" />
                                Medical
                              </Badge>
                            )}
                            {overdue && (
                              <Badge variant="destructive" className="flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                Overdue
                              </Badge>
                            )}
                            {urgent && (
                              <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                                <Clock className="h-3 w-3 mr-1" />
                                {daysRemaining}d left
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                            <span>Request: {typeInfo.name}</span>
                            <span>Type: {request.requestType}</span>
                            {request.assignedTo && <span>Assigned: {request.assignedTo}</span>}
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-700">Requester:</p>
                        <p className="text-sm text-gray-600">
                          {request.dataSubjectName} ({request.dataSubjectEmail})
                          {request.dataSubjectPhone && ` - ${request.dataSubjectPhone}`}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-700">Description:</p>
                        <p className="text-sm text-gray-600">{request.requestDescription}</p>
                      </div>
                      
                      {request.dataCategories.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-700">Data Categories:</p>
                          <div className="flex flex-wrap gap-1">
                            {request.dataCategories.map((category) => (
                              <Badge key={category} variant="secondary" className="text-xs">
                                {category.replace(/_/g, ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Records Identified:</p>
                          <p className="font-medium">{request.recordsIdentified}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Records Provided:</p>
                          <p className="font-medium">{request.recordsProvided}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Records Modified:</p>
                          <p className="font-medium">{request.recordsModified}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Records Deleted:</p>
                          <p className="font-medium">{request.recordsDeleted}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <p>Submitted: {format(new Date(request.createdAt), 'PPp')}</p>
                          {request.actualCompletion && (
                            <p>Completed: {format(new Date(request.actualCompletion), 'PPp')}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p>Deadline: {format(new Date(request.regulatoryDeadline), 'PPp')}</p>
                          <p className={overdue ? 'text-red-600 font-medium' : urgent ? 'text-yellow-600' : ''}>
                            {overdue ? `${Math.abs(daysRemaining)} days overdue` : 
                             urgent ? `${daysRemaining} days remaining` : 'On track'}
                          </p>
                        </div>
                      </div>
                      
                      {request.qualityScore && (
                        <div className="text-sm">
                          <p className="text-gray-600">Quality Score:</p>
                          <div className="flex items-center gap-2">
                            <Progress value={request.qualityScore} className="flex-1" />
                            <span className="font-medium">{request.qualityScore}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedRequest(request)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        
                        {userRole === 'admin' && request.status === 'PENDING' && (
                          <>
                            <DropdownMenuItem>
                              <Settings className="h-4 w-4 mr-2" />
                              Start Processing
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve Request
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject Request
                            </DropdownMenuItem>
                          </>
                        )}
                        
                        {userRole === 'admin' && request.status === 'IN_PROGRESS' && (
                          <>
                            <DropdownMenuItem>
                              <FileCheck className="h-4 w-4 mr-2" />
                              Complete Request
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Calendar className="h-4 w-4 mr-2" />
                              Request Extension
                            </DropdownMenuItem>
                          </>
                        )}
                        
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Export Request
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Legal Basis
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};