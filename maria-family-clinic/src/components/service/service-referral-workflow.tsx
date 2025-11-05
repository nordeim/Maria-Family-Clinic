import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { 
  ArrowRight, 
  UserCheck, 
  Calendar,
  FileText,
  Mail,
  Phone,
  MessageSquare,
  Clock,
  Shield,
  CheckCircle,
  AlertTriangle,
  Send,
  Download,
  Share
} from 'lucide-react';
import { cn } from '~/lib/utils';

export interface ServiceReferralWorkflowProps {
  serviceId: string;
  selectedClinicId?: string;
  availableSpecialists: Array<{
    id: string;
    name: string;
    specialty: string;
    clinicId: string;
    clinicName: string;
    rating?: number;
    reviewCount?: number;
    nextAvailable?: Date;
    consultationFee?: number;
  }>;
  onReferralComplete?: (referralData: ReferralData) => void;
  className?: string;
}

export interface ReferralData {
  referralType: 'internal' | 'external' | 'specialist' | 'emergency';
  serviceId: string;
  fromClinicId: string;
  toClinicId?: string;
  toDoctorId?: string;
  reason: string;
  urgency: 'routine' | 'urgent' | 'emergency';
  symptoms: string;
  previousTreatments?: string;
  attachments?: File[];
  preferredAppointment?: Date;
  insuranceInfo?: {
    provider: string;
    authorizationRequired: boolean;
  };
  patientConsent: boolean;
  shareMedicalRecords: boolean;
}

export function ServiceReferralWorkflow({
  serviceId,
  selectedClinicId,
  availableSpecialists = [],
  onReferralComplete,
  className
}: ServiceReferralWorkflowProps) {
  const [currentStep, setCurrentStep] = useState<'type' | 'specialist' | 'details' | 'confirmation'>('type');
  const [referralData, setReferralData] = useState<Partial<ReferralData>>({
    referralType: 'specialist',
    urgency: 'routine',
    patientConsent: false,
    shareMedicalRecords: false
  });
  const [selectedSpecialist, setSelectedSpecialist] = useState<string>('');

  const referralTypes = [
    {
      id: 'internal',
      name: 'Internal Referral',
      description: 'Refer to another doctor within the same clinic',
      icon: <UserCheck className="h-5 w-5" />,
      color: 'bg-blue-100 text-blue-800',
      estimatedTime: 'Same day',
      requirements: []
    },
    {
      id: 'external',
      name: 'External Referral',
      description: 'Refer to a different clinic or healthcare provider',
      icon: <ArrowRight className="h-5 w-5" />,
      color: 'bg-green-100 text-green-800',
      estimatedTime: '1-2 days',
      requirements: ['Patient consent required']
    },
    {
      id: 'specialist',
      name: 'Specialist Referral',
      description: 'Refer to a medical specialist for advanced care',
      icon: <Shield className="h-5 w-5" />,
      color: 'bg-purple-100 text-purple-800',
      estimatedTime: '2-5 days',
      requirements: ['Detailed medical history', 'Insurance authorization']
    },
    {
      id: 'emergency',
      name: 'Emergency Referral',
      description: 'Immediate referral for urgent care',
      icon: <AlertTriangle className="h-5 w-5" />,
      color: 'bg-red-100 text-red-800',
      estimatedTime: 'Immediate',
      requirements: ['Emergency contact information']
    }
  ];

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Not available';
    return date.toLocaleDateString('en-SG', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'Price on request';
    return `S$${price.toFixed(2)}`;
  };

  const handleReferralSubmit = () => {
    const completeData: ReferralData = {
      referralType: referralData.referralType!,
      serviceId,
      fromClinicId: selectedClinicId!,
      toClinicId: referralData.toClinicId,
      toDoctorId: referralData.toDoctorId,
      reason: referralData.reason || '',
      urgency: referralData.urgency!,
      symptoms: referralData.symptoms || '',
      previousTreatments: referralData.previousTreatments,
      preferredAppointment: referralData.preferredAppointment,
      insuranceInfo: referralData.insuranceInfo,
      patientConsent: referralData.patientConsent!,
      shareMedicalRecords: referralData.shareMedicalRecords!
    };

    onReferralComplete?.(completeData);
  };

  const renderTypeSelection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Select Referral Type</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {referralTypes.map((type) => (
          <Card 
            key={type.id}
            className={cn(
              "cursor-pointer transition-all",
              referralData.referralType === type.id 
                ? "border-blue-500 bg-blue-50" 
                : "hover:border-gray-300"
            )}
            onClick={() => setReferralData(prev => ({ ...prev, referralType: type.id as any }))}
          >
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <div className={cn("p-2 rounded-lg", type.color)}>
                  {type.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{type.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{type.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {type.estimatedTime}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderSpecialistSelection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Choose Specialist</h3>
      
      {availableSpecialists.length === 0 ? (
        <Alert>
          <UserCheck className="h-4 w-4" />
          <AlertDescription>
            No specialists are currently available for this service. You can proceed with an external referral.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-3">
          {availableSpecialists.map((specialist) => (
            <Card 
              key={specialist.id}
              className={cn(
                "cursor-pointer transition-all",
                selectedSpecialist === specialist.id 
                  ? "border-blue-500 bg-blue-50" 
                  : "hover:border-gray-300"
              )}
              onClick={() => {
                setSelectedSpecialist(specialist.id);
                setReferralData(prev => ({ 
                  ...prev, 
                  toClinicId: specialist.clinicId,
                  toDoctorId: specialist.id 
                }));
              }}
            >
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">Dr. {specialist.name}</h4>
                      <Badge variant="outline">{specialist.specialty}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{specialist.clinicName}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {specialist.rating && (
                        <div>★ {specialist.rating.toFixed(1)} ({specialist.reviewCount} reviews)</div>
                      )}
                      <div>Next: {formatDate(specialist.nextAvailable)}</div>
                      <div>{formatPrice(specialist.consultationFee)}</div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Select
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderDetailsForm = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Referral Details</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="urgency">Urgency Level *</Label>
          <Select 
            value={referralData.urgency} 
            onValueChange={(value: any) => setReferralData(prev => ({ ...prev, urgency: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="routine">Routine (1-2 weeks)</SelectItem>
              <SelectItem value="urgent">Urgent (1-3 days)</SelectItem>
              <SelectItem value="emergency">Emergency (Immediate)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="preferred-date">Preferred Appointment Date</Label>
          <Input
            id="preferred-date"
            type="datetime-local"
            value={referralData.preferredAppointment?.toISOString().slice(0, 16) || ''}
            onChange={(e) => setReferralData(prev => ({ 
              ...prev, 
              preferredAppointment: e.target.value ? new Date(e.target.value) : undefined 
            }))}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="reason">Reason for Referral *</Label>
        <Textarea
          id="reason"
          placeholder="Please describe the reason for this referral..."
          value={referralData.reason}
          onChange={(e) => setReferralData(prev => ({ ...prev, reason: e.target.value }))}
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="symptoms">Current Symptoms</Label>
        <Textarea
          id="symptoms"
          placeholder="Describe current symptoms and medical concerns..."
          value={referralData.symptoms}
          onChange={(e) => setReferralData(prev => ({ ...prev, symptoms: e.target.value }))}
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="treatments">Previous Treatments (Optional)</Label>
        <Textarea
          id="treatments"
          placeholder="Previous treatments, medications, or interventions..."
          value={referralData.previousTreatments}
          onChange={(e) => setReferralData(prev => ({ ...prev, previousTreatments: e.target.value }))}
          rows={2}
        />
      </div>

      {/* Insurance Information */}
      <div className="border-t pt-4">
        <h4 className="font-medium mb-3">Insurance Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="insurance-provider">Insurance Provider</Label>
            <Input
              id="insurance-provider"
              placeholder="e.g., AIA, NTUC, Great Eastern"
              value={referralData.insuranceInfo?.provider || ''}
              onChange={(e) => setReferralData(prev => ({
                ...prev,
                insuranceInfo: { ...prev.insuranceInfo, provider: e.target.value }
              }))}
            />
          </div>
          <div className="flex items-center">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={referralData.insuranceInfo?.authorizationRequired || false}
                onChange={(e) => setReferralData(prev => ({
                  ...prev,
                  insuranceInfo: { 
                    ...prev.insuranceInfo, 
                    authorizationRequired: e.target.checked 
                  }
                }))}
              />
              <span className="text-sm">Authorization required</span>
            </label>
          </div>
        </div>
      </div>

      {/* Consent */}
      <div className="space-y-3">
        <h4 className="font-medium">Patient Consent</h4>
        <div className="space-y-2">
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={referralData.patientConsent}
              onChange={(e) => setReferralData(prev => ({ ...prev, patientConsent: e.target.checked }))}
              className="mt-1"
            />
            <span className="text-sm">
              I consent to this referral and understand that my medical information will be shared 
              with the receiving healthcare provider for continuity of care.
            </span>
          </label>
          
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={referralData.shareMedicalRecords}
              onChange={(e) => setReferralData(prev => ({ ...prev, shareMedicalRecords: e.target.checked }))}
              className="mt-1"
            />
            <span className="text-sm">
              I authorize the sharing of my complete medical records including test results, 
              imaging, and treatment history.
            </span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderConfirmation = () => {
    const selectedType = referralTypes.find(t => t.id === referralData.referralType);
    const selectedDoctor = availableSpecialists.find(s => s.id === selectedSpecialist);

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Confirm Referral</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Referral Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Type:</span>
                <span className="text-sm font-medium">{selectedType?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Urgency:</span>
                <Badge variant="outline">{referralData.urgency}</Badge>
              </div>
              {selectedDoctor && (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Refer to:</span>
                    <span className="text-sm font-medium">Dr. {selectedDoctor.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Clinic:</span>
                    <span className="text-sm font-medium">{selectedDoctor.clinicName}</span>
                  </div>
                </>
              )}
              {referralData.preferredAppointment && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Preferred:</span>
                  <span className="text-sm font-medium">
                    {referralData.preferredAppointment.toLocaleDateString()}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Generate Referral Letter
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Mail className="h-4 w-4 mr-2" />
                Send via Email
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Phone className="h-4 w-4 mr-2" />
                Call Specialist Office
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Share className="h-4 w-4 mr-2" />
                Share with Patient
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'type':
        return referralData.referralType;
      case 'specialist':
        return referralData.referralType === 'internal' || selectedSpecialist || referralData.toClinicId;
      case 'details':
        return referralData.reason && referralData.symptoms && referralData.patientConsent;
      default:
        return true;
    }
  };

  return (
    <div className={cn("max-w-4xl mx-auto space-y-6", className)}>
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        {['type', 'specialist', 'details', 'confirmation'].map((step, index) => {
          const isActive = currentStep === step;
          const isCompleted = ['type', 'specialist', 'details'].indexOf(currentStep) > 
                             ['type', 'specialist', 'details'].indexOf(step);
          
          return (
            <div key={step} className="flex items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                isActive ? "bg-blue-600 text-white" :
                isCompleted ? "bg-green-600 text-white" : "bg-gray-300 text-gray-600"
              )}>
                {index + 1}
              </div>
              {index < 3 && (
                <div className={cn(
                  "w-16 h-1 mx-2",
                  isCompleted ? "bg-green-600" : "bg-gray-300"
                )} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="pt-6">
          {currentStep === 'type' && renderTypeSelection()}
          {currentStep === 'specialist' && renderSpecialistSelection()}
          {currentStep === 'details' && renderDetailsForm()}
          {currentStep === 'confirmation' && renderConfirmation()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => {
            if (currentStep === 'specialist') setCurrentStep('type');
            else if (currentStep === 'details') setCurrentStep('specialist');
            else if (currentStep === 'confirmation') setCurrentStep('details');
          }}
          disabled={currentStep === 'type'}
        >
          Back
        </Button>
        
        <div className="flex gap-2">
          {currentStep !== 'confirmation' ? (
            <Button 
              onClick={() => {
                if (currentStep === 'type') setCurrentStep('specialist');
                else if (currentStep === 'specialist') setCurrentStep('details');
                else if (currentStep === 'details') setCurrentStep('confirmation');
              }}
              disabled={!canProceed()}
            >
              Next
            </Button>
          ) : (
            <Button onClick={handleReferralSubmit} className="bg-green-600 hover:bg-green-700">
              <Send className="h-4 w-4 mr-2" />
              Send Referral
            </Button>
          )}
        </div>
      </div>

      {/* Quick Tips */}
      <Alert>
        <MessageSquare className="h-4 w-4" />
        <AlertDescription>
          <strong>Referral Tips:</strong> Include detailed medical history and previous test results. 
          For urgent referrals, contact the receiving clinic directly to ensure timely scheduling.
        </AlertDescription>
      </Alert>
    </div>
  );
}