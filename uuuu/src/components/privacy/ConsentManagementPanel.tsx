/**
 * Consent Management Panel
 * Sub-Phase 9.5: PDPA-Compliant Health Data Protection
 * Comprehensive consent management for health-related data
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
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  FileCheck,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  Calendar,
  User,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Settings,
  Key,
  Lock,
  FileText,
  Copy,
  Share,
  RefreshCw,
  Search,
  Filter,
  MoreVertical,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';

interface ConsentRecord {
  id: string;
  consentType: string;
  dataSubjectId: string;
  dataSubjectName: string;
  dataSubjectEmail: string;
  consentStatus: 'GRANTED' | 'WITHDRAWN' | 'PENDING' | 'EXPIRED' | 'INVALID';
  consentVersion: string;
  legalBasis: string;
  dataCategories: string[];
  processingActivities: string[];
  consentDate: string;
  consentExpiry?: string;
  withdrawalDate?: string;
  medicalConsent?: boolean;
  professionalConsultation?: boolean;
  ipAddress?: string;
  userAgent?: string;
  auditTrail: any[];
}

interface ConsentManagementPanelProps {
  userId?: string;
  userRole?: 'admin' | 'staff' | 'user';
  dataSubjectId?: string;
}

export const ConsentManagementPanel: React.FC<ConsentManagementPanelProps> = ({
  userId,
  userRole = 'user',
  dataSubjectId
}) => {
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConsent, setSelectedConsent] = useState<ConsentRecord | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock consent types for health data
  const healthConsentTypes = [
    {
      type: 'MEDICAL_CONSULTATION',
      name: 'Medical Consultation',
      description: 'Consent for medical consultation and health data processing',
      required: true,
      legalBasis: 'MEDICAL_TREATMENT'
    },
    {
      type: 'CLINICAL_RESEARCH',
      name: 'Clinical Research',
      description: 'Consent for use of health data in clinical research',
      required: false,
      legalBasis: 'CONSENT'
    },
    {
      type: 'DATA_PROCESSING',
      name: 'Data Processing',
      description: 'General consent for health data processing under PDPA',
      required: true,
      legalBasis: 'CONSENT'
    },
    {
      type: 'THIRD_PARTY_SHARING',
      name: 'Third Party Sharing',
      description: 'Consent for sharing health data with third parties',
      required: false,
      legalBasis: 'CONSENT'
    },
    {
      type: 'DATA_RETENTION',
      name: 'Data Retention',
      description: 'Consent for extended retention of health records',
      required: false,
      legalBasis: 'LEGAL_OBLIGATION'
    },
    {
      type: 'EMERGENCY_TREATMENT',
      name: 'Emergency Treatment',
      description: 'Consent for emergency medical treatment',
      required: false,
      legalBasis: 'EMERGENCY_CARE'
    }
  ];

  // Mock data - in real implementation, this would come from API
  useEffect(() => {
    const mockConsents: ConsentRecord[] = [
      {
        id: 'CONS-001',
        consentType: 'MEDICAL_CONSULTATION',
        dataSubjectId: 'patient-001',
        dataSubjectName: 'John Doe',
        dataSubjectEmail: 'john.doe@email.com',
        consentStatus: 'GRANTED',
        consentVersion: '2.1',
        legalBasis: 'MEDICAL_TREATMENT',
        dataCategories: ['medical_history', 'current_symptoms', 'test_results'],
        processingActivities: ['consultation', 'diagnosis', 'treatment_planning'],
        consentDate: '2024-11-01T10:00:00Z',
        consentExpiry: '2025-11-01T10:00:00Z',
        medicalConsent: true,
        professionalConsultation: true,
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0...',
        auditTrail: [
          { action: 'GRANTED', timestamp: '2024-11-01T10:00:00Z', userId: 'patient-001' },
          { action: 'VERIFIED', timestamp: '2024-11-01T10:05:00Z', userId: 'system' }
        ]
      },
      {
        id: 'CONS-002',
        consentType: 'CLINICAL_RESEARCH',
        dataSubjectId: 'patient-001',
        dataSubjectName: 'John Doe',
        dataSubjectEmail: 'john.doe@email.com',
        consentStatus: 'PENDING',
        consentVersion: '2.1',
        legalBasis: 'CONSENT',
        dataCategories: ['anonymized_health_data'],
        processingActivities: ['research_analysis'],
        consentDate: '2024-11-04T14:30:00Z',
        medicalConsent: true,
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0...',
        auditTrail: [
          { action: 'REQUESTED', timestamp: '2024-11-04T14:30:00Z', userId: 'patient-001' }
        ]
      }
    ];
    
    setConsents(mockConsents);
    setLoading(false);
  }, [dataSubjectId]);

  const filteredConsents = consents.filter(consent => {
    const matchesStatus = filterStatus === 'all' || consent.consentStatus === filterStatus;
    const matchesSearch = searchTerm === '' || 
      consent.dataSubjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consent.consentType.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      GRANTED: 'default',
      PENDING: 'secondary',
      WITHDRAWN: 'destructive',
      EXPIRED: 'outline',
      INVALID: 'destructive'
    };
    
    const icons: Record<string, any> = {
      GRANTED: CheckCircle,
      PENDING: Clock,
      WITHDRAWN: XCircle,
      EXPIRED: AlertCircle,
      INVALID: XCircle
    };
    
    const Icon = icons[status] || AlertCircle;
    
    return (
      <Badge variant={variants[status] || 'outline'} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const getConsentTypeInfo = (type: string) => {
    return healthConsentTypes.find(t => t.type === type) || {
      name: type,
      description: 'Unknown consent type',
      required: false,
      legalBasis: 'UNKNOWN'
    };
  };

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileCheck className="h-6 w-6 text-blue-600" />
            Consent Management
          </h2>
          <p className="text-gray-600">
            Manage PDPA-compliant consents for health data processing
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {userRole === 'admin' && (
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  New Consent
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Health Data Consent</DialogTitle>
                  <DialogDescription>
                    Set up a new consent record for health data processing
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dataSubjectName">Data Subject Name</Label>
                      <Input id="dataSubjectName" placeholder="Enter full name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dataSubjectEmail">Email</Label>
                      <Input id="dataSubjectEmail" type="email" placeholder="email@domain.com" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="consentType">Consent Type</Label>
                    <select id="consentType" className="w-full p-2 border rounded">
                      {healthConsentTypes.map(type => (
                        <option key={type.type} value={type.type}>
                          {type.name} {type.required ? '(Required)' : '(Optional)'}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Data Categories</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {['medical_history', 'current_symptoms', 'test_results', 'treatment_notes', 'medications', 'allergies'].map(category => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox id={category} />
                          <Label htmlFor={category} className="text-sm">
                            {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="legalBasis">Legal Basis</Label>
                    <select id="legalBasis" className="w-full p-2 border rounded">
                      <option value="CONSENT">Consent</option>
                      <option value="MEDICAL_TREATMENT">Medical Treatment</option>
                      <option value="LEGAL_OBLIGATION">Legal Obligation</option>
                      <option value="EMERGENCY_CARE">Emergency Care</option>
                      <option value="PUBLIC_HEALTH">Public Health</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox id="medicalConsent" />
                    <Label htmlFor="medicalConsent" className="text-sm">
                      Medical consent (requires professional consultation)
                    </Label>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                    <Input id="expiryDate" type="date" />
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setShowCreateDialog(false)}>
                      Create Consent
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search consents by name or type..."
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
              <option value="GRANTED">Granted</option>
              <option value="PENDING">Pending</option>
              <option value="WITHDRAWN">Withdrawn</option>
              <option value="EXPIRED">Expired</option>
            </select>
            
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Consent Alerts */}
      {consents.some(c => c.consentStatus === 'EXPIRED' || (c.consentExpiry && isExpiringSoon(c.consentExpiry))) && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Some consents are expired or expiring soon. Review and renew them to maintain compliance.
          </AlertDescription>
        </Alert>
      )}

      {/* Consents List */}
      <div className="grid gap-4">
        {loading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Loading consent records...</p>
            </CardContent>
          </Card>
        ) : filteredConsents.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileCheck className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">No consent records found</p>
            </CardContent>
          </Card>
        ) : (
          filteredConsents.map((consent) => {
            const consentType = getConsentTypeInfo(consent.consentType);
            const expiringSoon = consent.consentExpiry && isExpiringSoon(consent.consentExpiry);
            
            return (
              <Card key={consent.id} className={expiringSoon ? 'border-yellow-300' : ''}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{consent.dataSubjectName}</h3>
                        {getStatusBadge(consent.consentStatus)}
                        {expiringSoon && (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                            <Clock className="h-3 w-3 mr-1" />
                            Expiring Soon
                          </Badge>
                        )}
                        {consent.medicalConsent && (
                          <Badge variant="outline" className="text-blue-600 border-blue-600">
                            <Shield className="h-3 w-3 mr-1" />
                            Medical
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Email: {consent.dataSubjectEmail}</p>
                          <p className="text-gray-600">Type: {consentType.name}</p>
                          <p className="text-gray-600">Version: {consent.consentVersion}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">
                            Legal Basis: {consent.legalBasis.replace(/_/g, ' ')}
                          </p>
                          <p className="text-gray-600">
                            Granted: {format(new Date(consent.consentDate), 'PPP')}
                          </p>
                          {consent.consentExpiry && (
                            <p className="text-gray-600">
                              Expires: {format(new Date(consent.consentExpiry), 'PPP')}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-700">Data Categories:</p>
                        <div className="flex flex-wrap gap-1">
                          {consent.dataCategories.map((category) => (
                            <Badge key={category} variant="secondary" className="text-xs">
                              {category.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {consent.auditTrail.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-700">Audit Trail:</p>
                          <div className="text-xs text-gray-600 space-y-1">
                            {consent.auditTrail.map((entry, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <span className="w-16 font-medium">{entry.action}:</span>
                                <span>{format(new Date(entry.timestamp), 'PPp')}</span>
                              </div>
                            ))}
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
                        <DropdownMenuItem onClick={() => setSelectedConsent(consent)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        
                        {userRole === 'admin' && consent.consentStatus === 'PENDING' && (
                          <DropdownMenuItem>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Grant Consent
                          </DropdownMenuItem>
                        )}
                        
                        {userRole === 'admin' && consent.consentStatus === 'GRANTED' && (
                          <DropdownMenuItem>
                            <XCircle className="h-4 w-4 mr-2" />
                            Withdraw Consent
                          </DropdownMenuItem>
                        )}
                        
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Export Record
                        </DropdownMenuItem>
                        
                        {userRole === 'admin' && (
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Record
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Consent Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {consents.filter(c => c.consentStatus === 'GRANTED').length}
            </div>
            <p className="text-sm text-gray-600">Granted</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {consents.filter(c => c.consentStatus === 'PENDING').length}
            </div>
            <p className="text-sm text-gray-600">Pending</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {consents.filter(c => c.consentStatus === 'EXPIRED').length}
            </div>
            <p className="text-sm text-gray-600">Expired</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {consents.filter(c => c.medicalConsent).length}
            </div>
            <p className="text-sm text-gray-600">Medical Consents</p>
          </CardContent>
        </Card>
      </div>

      {/* Consent Details Dialog */}
      {selectedConsent && (
        <Dialog open={!!selectedConsent} onOpenChange={() => setSelectedConsent(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Consent Details</DialogTitle>
              <DialogDescription>
                Complete consent information and audit trail
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Data Subject</Label>
                  <p className="text-sm">{selectedConsent.dataSubjectName}</p>
                  <p className="text-sm text-gray-600">{selectedConsent.dataSubjectEmail}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedConsent.consentStatus)}</div>
                </div>
              </div>
              
              {/* Consent Type Information */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Consent Type</Label>
                <p className="text-sm font-semibold">{getConsentTypeInfo(selectedConsent.consentType).name}</p>
                <p className="text-sm text-gray-600">{getConsentTypeInfo(selectedConsent.consentType).description}</p>
              </div>
              
              {/* Data Categories */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Data Categories</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedConsent.dataCategories.map((category) => (
                    <Badge key={category} variant="secondary">
                      {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Processing Activities */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Processing Activities</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedConsent.processingActivities.map((activity) => (
                    <Badge key={activity} variant="outline">
                      {activity.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Legal and Technical Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Legal Basis</Label>
                  <p className="text-sm">{selectedConsent.legalBasis.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Version</Label>
                  <p className="text-sm">{selectedConsent.consentVersion}</p>
                </div>
              </div>
              
              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Consent Date</Label>
                  <p className="text-sm">{format(new Date(selectedConsent.consentDate), 'PPPp')}</p>
                </div>
                {selectedConsent.consentExpiry && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Expiry Date</Label>
                    <p className="text-sm">{format(new Date(selectedConsent.consentExpiry), 'PPPp')}</p>
                  </div>
                )}
              </div>
              
              {/* Technical Information */}
              {(selectedConsent.ipAddress || selectedConsent.userAgent) && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Technical Information</Label>
                  <div className="text-sm text-gray-600 space-y-1">
                    {selectedConsent.ipAddress && <p>IP Address: {selectedConsent.ipAddress}</p>}
                    {selectedConsent.userAgent && <p>User Agent: {selectedConsent.userAgent}</p>}
                  </div>
                </div>
              )}
              
              {/* Audit Trail */}
              {selectedConsent.auditTrail.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Audit Trail</Label>
                  <div className="mt-2 space-y-2">
                    {selectedConsent.auditTrail.map((entry, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{entry.action}</Badge>
                          <span className="text-sm">{format(new Date(entry.timestamp), 'PPp')}</span>
                        </div>
                        <span className="text-sm text-gray-600">User: {entry.userId}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};