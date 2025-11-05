/**
 * Health Data Classification Panel
 * Sub-Phase 9.5: PDPA-Compliant Health Data Protection
 * Automatic and manual data classification for health enquiries
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
  Database,
  Shield,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Info,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Edit,
  Eye,
  Download,
  Upload,
  BarChart3,
  TrendingUp,
  Tag,
  Key,
  FileText,
  Users,
  Settings,
  Brain,
  Zap,
  Database as DatabaseIcon
} from 'lucide-react';

interface HealthDataClassification {
  id: string;
  enquiryId: string;
  enquiryNumber: string;
  dataClassification: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED' | 'PHI' | 'PII';
  classificationMethod: 'AUTOMATIC' | 'MANUAL' | 'RULE_BASED';
  classificationConfidence: number;
  classificationReason: string;
  requiredControls: string[];
  retentionDays: number;
  phiFlag: boolean;
  medicalRecordFlag: boolean;
  sensitiveFields: string[];
  autoClassified: boolean;
  reviewed: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface HealthDataClassificationPanelProps {
  userId?: string;
  userRole?: 'admin' | 'staff' | 'user';
  clinicId?: string;
  enquiryId?: string;
}

export const HealthDataClassificationPanel: React.FC<HealthDataClassificationPanelProps> = ({
  userId,
  userRole = 'user',
  clinicId,
  enquiryId
}) => {
  const [classifications, setClassifications] = useState<HealthDataClassification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClassification, setSelectedClassification] = useState<HealthDataClassification | null>(null);
  const [showManualDialog, setShowManualDialog] = useState(false);
  const [autoClassifyData, setAutoClassifyData] = useState({
    formData: '{}',
    message: '',
    metadata: '{}'
  });
  const [classificationResult, setClassificationResult] = useState<any>(null);
  const [filterClassification, setFilterClassification] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - in real implementation, this would come from API
  useEffect(() => {
    const mockClassifications: HealthDataClassification[] = [
      {
        id: 'CLASS-001',
        enquiryId: 'ENQ-001',
        enquiryNumber: 'CF20241104001',
        dataClassification: 'PHI',
        classificationMethod: 'AUTOMATIC',
        classificationConfidence: 95,
        classificationReason: 'Contains NRIC and medical symptoms',
        requiredControls: ['encryption', 'access_control', 'audit_log', 'retention_limit', 'medical_confidentiality'],
        retentionDays: 2920,
        phiFlag: true,
        medicalRecordFlag: true,
        sensitiveFields: ['nric', 'symptoms', 'medical_history', 'phone', 'email'],
        autoClassified: true,
        reviewed: true,
        reviewedBy: 'Dr. Sarah Lim',
        reviewedAt: '2024-11-04T10:30:00Z',
        createdAt: '2024-11-04T10:00:00Z',
        updatedAt: '2024-11-04T10:30:00Z'
      },
      {
        id: 'CLASS-002',
        enquiryId: 'ENQ-002',
        enquiryNumber: 'CF20241104002',
        dataClassification: 'CONFIDENTIAL',
        classificationMethod: 'RULE_BASED',
        classificationConfidence: 88,
        classificationReason: 'Contains contact information and appointment request',
        requiredControls: ['encryption', 'access_control', 'consent_required'],
        retentionDays: 2555,
        phiFlag: false,
        medicalRecordFlag: false,
        sensitiveFields: ['name', 'email', 'phone', 'preferred_time'],
        autoClassified: true,
        reviewed: false,
        createdAt: '2024-11-04T11:00:00Z',
        updatedAt: '2024-11-04T11:00:00Z'
      }
    ];
    
    setClassifications(mockClassifications);
    setLoading(false);
  }, [enquiryId]);

  const classificationLevels = [
    {
      level: 'PHI',
      name: 'Protected Health Information',
      description: 'Highly sensitive health data requiring maximum protection',
      color: 'bg-red-100 text-red-800 border-red-300',
      icon: Shield,
      retention: '8 years'
    },
    {
      level: 'RESTRICTED',
      name: 'Restricted',
      description: 'Sensitive data with limited access controls',
      color: 'bg-orange-100 text-orange-800 border-orange-300',
      icon: Lock,
      retention: '7 years'
    },
    {
      level: 'CONFIDENTIAL',
      name: 'Confidential',
      description: 'Internal data requiring access controls',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      icon: Eye,
      retention: '7 years'
    },
    {
      level: 'INTERNAL',
      name: 'Internal',
      description: 'General internal data with basic protection',
      color: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: Database,
      retention: '5 years'
    },
    {
      level: 'PUBLIC',
      name: 'Public',
      description: 'Non-sensitive data for public use',
      color: 'bg-green-100 text-green-800 border-green-300',
      icon: Unlock,
      retention: '2 years'
    }
  ];

  const filteredClassifications = classifications.filter(classification => {
    const matchesClassification = filterClassification === 'all' || 
      classification.dataClassification === filterClassification;
    const matchesSearch = searchTerm === '' ||
      classification.enquiryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classification.classificationReason.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesClassification && matchesSearch;
  });

  const getClassificationInfo = (level: string) => {
    return classificationLevels.find(c => c.level === level) || classificationLevels[0];
  };

  const handleAutoClassify = () => {
    try {
      const formData = JSON.parse(autoClassifyData.formData);
      const metadata = JSON.parse(autoClassifyData.metadata);
      
      // Simulate AI-powered classification
      const message = autoClassifyData.message.toLowerCase();
      const combinedData = JSON.stringify(formData) + message;
      
      let classification: any = {
        PHI: { score: 0, reason: '', fields: [] },
        RESTRICTED: { score: 0, reason: '', fields: [] },
        CONFIDENTIAL: { score: 0, reason: '', fields: [] },
        INTERNAL: { score: 0, reason: '', fields: [] },
        PUBLIC: { score: 0, reason: '', fields: [] }
      };
      
      // Health data pattern analysis
      if (/\b(nric|ic|fin|s\d{7}[a-z])\b/i.test(combinedData)) {
        classification.PHI.score += 30;
        classification.PHI.fields.push('nric');
        classification.PHI.reason += 'Contains Singapore NRIC/IC. ';
      }
      
      if (/\b(symptom|diagnosis|treatment|medication|prescription|lab|result|blood|scan|xray|ct|mri)\b/i.test(combinedData)) {
        classification.PHI.score += 40;
        classification.PHI.fields.push('medical_data');
        classification.PHI.reason += 'Contains medical information. ';
      }
      
      if (/\b(allergy|condition|health|medical|fitness|disease)\b/i.test(combinedData)) {
        classification.PHI.score += 25;
        classification.PHI.fields.push('health_data');
        classification.PHI.reason += 'Contains health-related data. ';
      }
      
      if (/\b(name|email|phone|address|contact)\b/i.test(combinedData)) {
        classification.CONFIDENTIAL.score += 20;
        classification.CONFIDENTIAL.fields.push('contact_info');
        classification.CONFIDENTIAL.reason += 'Contains contact information. ';
      }
      
      if (message.includes('appointment') || message.includes('booking')) {
        classification.CONFIDENTIAL.score += 15;
        classification.CONFIDENTIAL.fields.push('appointment');
        classification.CONFIDENTIAL.reason += 'Contains appointment request. ';
      }
      
      // Determine highest scoring classification
      const highestScore = Math.max(...Object.values(classification).map((c: any) => c.score));
      const resultLevel = Object.entries(classification).find(([_, c]: [string, any]) => c.score === highestScore)?.[0] || 'INTERNAL';
      
      const classificationInfo = getClassificationInfo(resultLevel);
      const selectedClass = classification[resultLevel];
      
      setClassificationResult({
        sensitivityLevel: resultLevel,
        confidenceScore: Math.min(highestScore, 100),
        classificationReason: selectedClass.reason || 'Based on content analysis',
        requiredControls: classificationInfo ? ['encryption', 'access_control', 'audit_log'] : ['access_control'],
        retentionDays: resultLevel === 'PHI' ? 2920 : 
                      resultLevel === 'RESTRICTED' ? 2555 :
                      resultLevel === 'CONFIDENTIAL' ? 2555 : 1825,
        phiFlag: resultLevel === 'PHI',
        sensitiveFields: selectedClass.fields,
        recommendedActions: [
          resultLevel === 'PHI' ? 'Apply field-level encryption' : null,
          resultLevel === 'PHI' ? 'Enable medical confidentiality' : null,
          resultLevel === 'PHI' || resultLevel === 'RESTRICTED' ? 'Set retention limit' : null,
          'Apply access controls',
          'Enable audit logging'
        ].filter(Boolean)
      });
    } catch (error) {
      alert('Invalid JSON data. Please check your form data and metadata.');
    }
  };

  const handleApplyClassification = () => {
    if (!classificationResult) return;
    
    // In real implementation, this would call the API
    const newClassification: HealthDataClassification = {
      id: `CLASS-${Date.now()}`,
      enquiryId: `ENQ-${Date.now()}`,
      enquiryNumber: `CF${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(classifications.length + 1).padStart(3, '0')}`,
      dataClassification: classificationResult.sensitivityLevel as any,
      classificationMethod: 'AUTOMATIC',
      classificationConfidence: classificationResult.confidenceScore,
      classificationReason: classificationResult.classificationReason,
      requiredControls: classificationResult.requiredControls,
      retentionDays: classificationResult.retentionDays,
      phiFlag: classificationResult.phiFlag,
      medicalRecordFlag: classificationResult.phiFlag,
      sensitiveFields: classificationResult.sensitiveFields,
      autoClassified: true,
      reviewed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setClassifications([...classifications, newClassification]);
    setClassificationResult(null);
    setShowManualDialog(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            Health Data Classification
          </h2>
          <p className="text-gray-600">
            AI-powered data sensitivity classification for health enquiries
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Dialog open={showManualDialog} onOpenChange={setShowManualDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Auto-Classify Data
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>AI-Powered Data Classification</DialogTitle>
                <DialogDescription>
                  Automatically classify the sensitivity level of health enquiry data
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="formData">Form Data (JSON)</Label>
                  <Textarea
                    id="formData"
                    placeholder='{"name": "John Doe", "email": "john@email.com", "nric": "S1234567A", "symptoms": "headache"}'
                    value={autoClassifyData.formData}
                    onChange={(e) => setAutoClassifyData({...autoClassifyData, formData: e.target.value})}
                    className="font-mono text-sm"
                    rows={6}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Enquiry Message</Label>
                  <Textarea
                    id="message"
                    placeholder="I have been experiencing headaches and would like to schedule an appointment with a neurologist..."
                    value={autoClassifyData.message}
                    onChange={(e) => setAutoClassifyData({...autoClassifyData, message: e.target.value})}
                    rows={4}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="metadata">Additional Metadata (JSON)</Label>
                  <Textarea
                    id="metadata"
                    placeholder='{"enquiry_category": "health", "urgency": "routine"}'
                    value={autoClassifyData.metadata}
                    onChange={(e) => setAutoClassifyData({...autoClassifyData, metadata: e.target.value})}
                    className="font-mono text-sm"
                    rows={3}
                  />
                </div>
                
                <Button onClick={handleAutoClassify} className="w-full">
                  <Brain className="h-4 w-4 mr-2" />
                  Analyze & Classify Data
                </Button>
                
                {/* Classification Results */}
                {classificationResult && (
                  <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
                    <h3 className="font-semibold">Classification Results</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Sensitivity Level</Label>
                        <div className="mt-1">
                          <Badge className={getClassificationInfo(classificationResult.sensitivityLevel).color}>
                            {classificationResult.sensitivityLevel}
                          </Badge>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Confidence Score</Label>
                        <div className="mt-1">
                          <div className="flex items-center gap-2">
                            <Progress value={classificationResult.confidenceScore} className="flex-1" />
                            <span className="text-sm font-medium">{classificationResult.confidenceScore}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Classification Reason</Label>
                      <p className="text-sm text-gray-600 mt-1">{classificationResult.classificationReason}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Sensitive Fields Detected</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {classificationResult.sensitiveFields.map((field: string) => (
                          <Badge key={field} variant="secondary" className="text-xs">
                            {field}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Required Controls</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {classificationResult.requiredControls.map((control: string) => (
                          <Badge key={control} variant="outline" className="text-xs">
                            {control.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Retention Period</Label>
                      <p className="text-sm text-gray-600 mt-1">
                        {Math.round(classificationResult.retentionDays / 365)} years
                      </p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Recommended Actions</Label>
                      <ul className="text-sm text-gray-600 mt-1 space-y-1">
                        {classificationResult.recommendedActions.map((action: string, index: number) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setClassificationResult(null)}>
                        Cancel
                      </Button>
                      <Button onClick={handleApplyClassification}>
                        Apply Classification
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Classification Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {classificationLevels.map((level) => {
          const count = classifications.filter(c => c.dataClassification === level.level).length;
          const Icon = level.icon;
          return (
            <Card key={level.level} className="text-center">
              <CardContent className="p-4">
                <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2 ${level.color.split(' ')[0]}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-sm">{level.name}</h3>
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs text-gray-600">{level.retention}</p>
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
                placeholder="Search classifications by enquiry number or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={filterClassification}
              onChange={(e) => setFilterClassification(e.target.value)}
              className="px-3 py-2 border rounded"
            >
              <option value="all">All Classifications</option>
              {classificationLevels.map(level => (
                <option key={level.level} value={level.level}>{level.name}</option>
              ))}
            </select>
            
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Classifications List */}
      <div className="grid gap-4">
        {loading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Loading classifications...</p>
            </CardContent>
          </Card>
        ) : filteredClassifications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Database className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">No classifications found</p>
            </CardContent>
          </Card>
        ) : (
          filteredClassifications.map((classification) => {
            const classInfo = getClassificationInfo(classification.dataClassification);
            const Icon = classInfo.icon;
            
            return (
              <Card key={classification.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${classInfo.color.split(' ')[0]}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">{classification.enquiryNumber}</h3>
                            <Badge className={classInfo.color}>
                              {classification.dataClassification}
                            </Badge>
                            {classification.phiFlag && (
                              <Badge variant="outline" className="text-red-600 border-red-600">
                                <Shield className="h-3 w-3 mr-1" />
                                PHI
                              </Badge>
                            )}
                            {classification.autoClassified && (
                              <Badge variant="secondary" className="text-xs">
                                <Brain className="h-3 w-3 mr-1" />
                                AI
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                            <span>Method: {classification.classificationMethod}</span>
                            <span>Confidence: {classification.classificationConfidence}%</span>
                            <span>Retention: {Math.round(classification.retentionDays / 365)} years</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-700">Classification Reason:</p>
                        <p className="text-sm text-gray-600">{classification.classificationReason}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">Required Controls:</p>
                        <div className="flex flex-wrap gap-1">
                          {classification.requiredControls.map((control) => (
                            <Badge key={control} variant="outline" className="text-xs">
                              {control.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {classification.sensitiveFields.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700">Sensitive Fields:</p>
                          <div className="flex flex-wrap gap-1">
                            {classification.sensitiveFields.map((field) => (
                              <Badge key={field} variant="secondary" className="text-xs">
                                {field}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <p>Created: {new Date(classification.createdAt).toLocaleDateString()}</p>
                          {classification.reviewed && (
                            <p>Reviewed: {classification.reviewedBy} on {new Date(classification.reviewedAt!).toLocaleDateString()}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p>Status: {classification.reviewed ? 'Reviewed' : 'Pending Review'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedClassification(classification)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        
                        {userRole === 'admin' && !classification.reviewed && (
                          <DropdownMenuItem>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve Classification
                          </DropdownMenuItem>
                        )}
                        
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Re-classify
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Export Report
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