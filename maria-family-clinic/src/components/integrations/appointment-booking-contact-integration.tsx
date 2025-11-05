/**
 * Appointment Booking Contact Integration
 * Sub-Phase 9.9: Integration with Existing Features Retry
 * 
 * Seamless integration of contact system with appointment booking workflows
 * - Pre-booking contact and inquiries
 * - Appointment confirmation and rescheduling
 * - Post-appointment follow-up and contact
 * - Contact history integration with appointment data
 */

import React, { useState } from 'react';
import { ContactIntegrationManager } from '@/components/integrations/contact-integration-manager';
import { useContactIntegration } from '@/lib/hooks/use-contact-integration';
import { useUser } from '@/lib/hooks/use-user';
import { 
  Phone, 
  MessageCircle, 
  Mail, 
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  Info,
  User,
  Building,
  Stethoscope,
  MapPin,
  CreditCard,
  FileText,
  Bell,
  Edit,
  XCircle,
  Users,
  Timer,
  Star,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

interface AppointmentBookingContactIntegrationProps {
  // Appointment data
  appointmentData?: {
    appointmentId?: string
    patientId?: string
    patientName?: string
    patientEmail?: string
    patientPhone?: string
    doctorId?: string
    doctorName?: string
    clinicId?: string
    clinicName?: string
    clinicAddress?: string
    serviceId?: string
    serviceName?: string
    appointmentDate?: Date
    startTime?: string
    endTime?: string
    duration?: number
    appointmentType?: string
    urgencyLevel?: 'routine' | 'urgent' | 'emergency'
    status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled'
    consultationFee?: number
    paymentStatus?: 'pending' | 'paid' | 'refunded'
    insuranceCoverage?: {
      provider?: string
      coveragePercentage?: number
      copay?: number
    }
    preparationInstructions?: string[]
    postCareInstructions?: string[]
    confirmationSent?: boolean
    reminderSent?: boolean
    lastContactId?: string
  }
  
  // Integration features
  onContactAction?: (action: any, context: any) => void
  onAppointmentAction?: (action: any, appointmentId: string) => void
  
  // Context type
  contextType?: 'pre_booking' | 'confirmation' | 'rescheduling' | 'follow_up' | 'general'
  
  // Standard props
  className?: string
}

export function AppointmentBookingContactIntegration({
  appointmentData,
  onContactAction,
  onAppointmentAction,
  contextType = 'general',
  className
}: AppointmentBookingContactIntegrationProps) {
  const { user } = useUser();
  const { startContactSession, addContactHistory } = useContactIntegration();
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [selectedContactType, setSelectedContactType] = useState<string>('general');
  const [appointmentQuestions, setAppointmentQuestions] = useState<string>('');
  const [rescheduleReason, setRescheduleReason] = useState<string>('');
  const [cancellationReason, setCancellationReason] = useState<string>('');
  const [followUpQuestions, setFollowUpQuestions] = useState<string>('');

  // Enhanced contact action handler
  const handleContactAction = (action: any) => {
    // Start contact session
    const sessionId = startContactSession({
      appointmentId: appointmentData?.appointmentId,
      doctorId: appointmentData?.doctorId,
      doctorName: appointmentData?.doctorName,
      clinicId: appointmentData?.clinicId,
      clinicName: appointmentData?.clinicName,
      serviceId: appointmentData?.serviceId,
      serviceName: appointmentData?.serviceName,
      integrationType: 'appointment',
      userId: user?.id,
      contextData: {
        appointmentDate: appointmentData?.appointmentDate,
        startTime: appointmentData?.startTime,
        appointmentType: appointmentData?.appointmentType,
        urgencyLevel: appointmentData?.urgencyLevel,
        status: appointmentData?.status,
        consultationFee: appointmentData?.consultationFee,
        patientId: appointmentData?.patientId,
        patientName: appointmentData?.patientName,
        contextType,
        appointmentQuestions,
        rescheduleReason,
        cancellationReason,
        followUpQuestions,
      }
    });

    // Add to contact history
    addContactHistory({
      type: action.type,
      category: 'appointment_related',
      subject: `Appointment ${action.label}`,
      summary: `User initiated ${action.label} for appointment`,
      status: 'pending',
      priority: action.priority || 'normal',
      contextType: 'appointment',
      contextId: appointmentData?.appointmentId,
      contextName: `${appointmentData?.serviceName || 'Appointment'} with ${appointmentData?.doctorName || ''}`,
      followUpRequired: false,
      followUpCompleted: false,
    });

    // Notify parent
    onContactAction?.(action, { 
      type: 'appointment_contact',
      appointmentId: appointmentData?.appointmentId,
      action: action.id,
      sessionId
    });
  };

  // Appointment action handlers
  const handleRescheduleRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedContactType('reschedule');
    setIsContactDialogOpen(true);
    handleContactAction({ 
      id: 'reschedule_request', 
      type: 'form', 
      label: 'Reschedule Request', 
      priority: 'normal' 
    });
  };

  const handleCancellationRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedContactType('cancellation');
    setIsContactDialogOpen(true);
    handleContactAction({ 
      id: 'cancellation_request', 
      type: 'form', 
      label: 'Cancellation Request', 
      priority: 'normal' 
    });
  };

  const handleConfirmationRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedContactType('confirmation');
    setIsContactDialogOpen(true);
    handleContactAction({ 
      id: 'confirmation_request', 
      type: 'form', 
      label: 'Confirmation Request', 
      priority: 'normal' 
    });
  };

  const handlePreparationQuestions = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedContactType('preparation');
    setIsContactDialogOpen(true);
    handleContactAction({ 
      id: 'preparation_questions', 
      type: 'form', 
      label: 'Preparation Questions', 
      priority: 'normal' 
    });
  };

  const handleBillingInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedContactType('billing');
    setIsContactDialogOpen(true);
    handleContactAction({ 
      id: 'billing_inquiry', 
      type: 'form', 
      label: 'Billing Inquiry', 
      priority: 'normal' 
    });
  };

  const handleFollowUpRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedContactType('follow_up');
    setIsContactDialogOpen(true);
    handleContactAction({ 
      id: 'follow_up_request', 
      type: 'form', 
      label: 'Follow-up Request', 
      priority: 'normal' 
    });
  };

  const handleUrgentContact = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (appointmentData?.clinicId) {
      // Contact clinic directly
      window.open('tel:1777', '_self');
    }
    handleContactAction({ id: 'urgent', type: 'emergency', label: 'Urgent Contact', priority: 'urgent' });
  };

  // Format appointment details
  const formatAppointmentDate = (date?: Date) => {
    if (!date) return 'TBD';
    return date.toLocaleDateString('en-SG', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatAppointmentTime = (time?: string) => {
    if (!time) return 'TBD';
    return time;
  };

  // Get status color
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'scheduled': return 'text-blue-600';
      case 'confirmed': return 'text-green-600';
      case 'completed': return 'text-gray-600';
      case 'cancelled': return 'text-red-600';
      case 'no_show': return 'text-orange-600';
      case 'rescheduled': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const isUpcomingAppointment = appointmentData?.status === 'scheduled' || appointmentData?.status === 'confirmed';
  const isPastAppointment = appointmentData?.status === 'completed';

  return (
    <div className={cn("space-y-6", className)}>
      {/* Main Appointment Contact Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Appointment Contact Support
          </CardTitle>
          <CardDescription>
            {appointmentData ? 
              `Contact support for your ${appointmentData.serviceName || 'appointment'} with ${appointmentData.doctorName || ''}` :
              'Get help with appointment booking, scheduling, and support.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContactIntegrationManager
            context={{
              appointmentId: appointmentData?.appointmentId,
              doctorId: appointmentData?.doctorId,
              doctorName: appointmentData?.doctorName,
              clinicId: appointmentData?.clinicId,
              clinicName: appointmentData?.clinicName,
              serviceId: appointmentData?.serviceId,
              serviceName: appointmentData?.serviceName,
              integrationType: 'appointment',
              userId: user?.id,
              contextData: {
                appointmentDate: appointmentData?.appointmentDate,
                startTime: appointmentData?.startTime,
                appointmentType: appointmentData?.appointmentType,
                urgencyLevel: appointmentData?.urgencyLevel,
                status: appointmentData?.status,
                consultationFee: appointmentData?.consultationFee,
                patientId: appointmentData?.patientId,
                patientName: appointmentData?.patientName,
                contextType,
              }
            }}
            onContactAction={handleContactAction}
            showQuickActions={true}
            showDetailedActions={true}
          />
        </CardContent>
      </Card>

      {/* Appointment Details (if available) */}
      {appointmentData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Appointment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status and Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className={getStatusColor(appointmentData.status)}>
                    {appointmentData.status?.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </div>
              
              {appointmentData.appointmentDate && (
                <div>
                  <Label className="text-sm font-medium">Date & Time</Label>
                  <div className="mt-1 text-sm">
                    <div>{formatAppointmentDate(appointmentData.appointmentDate)}</div>
                    <div className="text-muted-foreground">
                      {formatAppointmentTime(appointmentData.startTime)}
                      {appointmentData.duration && ` (${appointmentData.duration} min)`}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Service and Provider */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appointmentData.serviceName && (
                <div>
                  <Label className="text-sm font-medium">Service</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Stethoscope className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{appointmentData.serviceName}</span>
                  </div>
                </div>
              )}
              
              {appointmentData.doctorName && (
                <div>
                  <Label className="text-sm font-medium">Doctor</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Dr. {appointmentData.doctorName}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Clinic */}
            {appointmentData.clinicName && (
              <div>
                <Label className="text-sm font-medium">Clinic</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{appointmentData.clinicName}</span>
                </div>
                {appointmentData.clinicAddress && (
                  <div className="text-xs text-muted-foreground ml-6">
                    {appointmentData.clinicAddress}
                  </div>
                )}
              </div>
            )}

            {/* Financial Information */}
            {appointmentData.consultationFee && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Consultation Fee</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">S${appointmentData.consultationFee.toFixed(2)}</span>
                  </div>
                </div>
                
                {appointmentData.paymentStatus && (
                  <div>
                    <Label className="text-sm font-medium">Payment Status</Label>
                    <Badge 
                      variant={appointmentData.paymentStatus === 'paid' ? 'default' : 'secondary'}
                      className="mt-1"
                    >
                      {appointmentData.paymentStatus.toUpperCase()}
                    </Badge>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upcoming Appointment Actions */}
      {isUpcomingAppointment && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Appointment Actions
            </CardTitle>
            <CardDescription>
              Manage your upcoming appointment with contact support.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Reschedule */}
              <form onSubmit={handleRescheduleRequest} className="space-y-2">
                <h4 className="font-medium">Reschedule Appointment</h4>
                <div className="space-y-2">
                  <Label className="text-sm">Reason for rescheduling (optional)</Label>
                  <Textarea
                    placeholder="e.g., Scheduling conflict, emergency, etc."
                    value={rescheduleReason}
                    onChange={(e) => setRescheduleReason(e.target.value)}
                    className="min-h-[60px]"
                  />
                </div>
                <Button type="submit" variant="outline" className="w-full" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Request Reschedule
                </Button>
              </form>

              {/* Cancellation */}
              <form onSubmit={handleCancellationRequest} className="space-y-2">
                <h4 className="font-medium">Cancel Appointment</h4>
                <div className="space-y-2">
                  <Label className="text-sm">Reason for cancellation (optional)</Label>
                  <Textarea
                    placeholder="e.g., No longer needed, found alternative, etc."
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    className="min-h-[60px]"
                  />
                </div>
                <Button type="submit" variant="outline" className="w-full" size="sm">
                  <XCircle className="h-4 w-4 mr-2" />
                  Request Cancellation
                </Button>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Confirmation */}
              <Button
                variant="outline"
                className="justify-start gap-2 h-auto p-4"
                onClick={handleConfirmationRequest}
              >
                <CheckCircle className="h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">Confirm Appointment</div>
                  <div className="text-xs text-muted-foreground">
                    Confirm or verify appointment details
                  </div>
                </div>
              </Button>

              {/* Preparation Questions */}
              <Button
                variant="outline"
                className="justify-start gap-2 h-auto p-4"
                onClick={handlePreparationQuestions}
              >
                <FileText className="h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">Preparation Questions</div>
                  <div className="text-xs text-muted-foreground">
                    Ask about pre-appointment preparation
                  </div>
                </div>
              </Button>

              {/* Urgent Contact */}
              <Button
                variant="outline"
                className="justify-start gap-2 h-auto p-4 text-red-600 border-red-200"
                onClick={handleUrgentContact}
              >
                <AlertTriangle className="h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">Urgent Contact</div>
                  <div className="text-xs text-muted-foreground">
                    For urgent appointment matters
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Past Appointment Follow-up */}
      {isPastAppointment && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Post-Appointment Support
            </CardTitle>
            <CardDescription>
              Get follow-up support and address any post-appointment questions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleFollowUpRequest} className="space-y-4">
              <h3 className="font-medium">Follow-up Questions</h3>
              <div className="space-y-2">
                <Label>Any questions about your appointment or results?</Label>
                <Textarea
                  placeholder="e.g., Questions about results, next steps, recovery, etc."
                  value={followUpQuestions}
                  onChange={(e) => setFollowUpQuestions(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              <Button type="submit" className="w-full">
                <MessageCircle className="h-4 w-4 mr-2" />
                Request Follow-up
              </Button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="justify-start gap-2 h-auto p-4"
                onClick={() => handleContactAction({ 
                  id: 'feedback', 
                  type: 'form', 
                  label: 'Feedback', 
                  priority: 'low' 
                })}
              >
                <Star className="h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">Provide Feedback</div>
                  <div className="text-xs text-muted-foreground">
                    Share your appointment experience
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="justify-start gap-2 h-auto p-4"
                onClick={handleBillingInquiry}
              >
                <CreditCard className="h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">Billing Questions</div>
                  <div className="text-xs text-muted-foreground">
                    Questions about charges or insurance
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Emergency Contact */}
      <Card className="border-red-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <h4 className="font-medium text-red-800">Medical Emergency</h4>
                <p className="text-sm text-red-700">
                  For medical emergencies, call 1777 immediately
                </p>
              </div>
            </div>
            <Button
              variant="destructive"
              onClick={handleUrgentContact}
              className="gap-2"
            >
              <Phone className="h-4 w-4" />
              Call 1777
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contact Form Dialog */}
      <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Appointment Contact Support</DialogTitle>
            <DialogDescription>
              {getContactDescription(selectedContactType)}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={selectedContactType} onValueChange={setSelectedContactType} className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="reschedule">Reschedule</TabsTrigger>
              <TabsTrigger value="cancellation">Cancel</TabsTrigger>
              <TabsTrigger value="preparation">Preparation</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
              <TabsTrigger value="follow_up">Follow-up</TabsTrigger>
            </TabsList>
            
            {['general', 'reschedule', 'cancellation', 'preparation', 'billing', 'follow_up'].map((tab) => (
              <TabsContent key={tab} value={tab} className="space-y-4">
                <ContactIntegrationManager
                  context={{
                    appointmentId: appointmentData?.appointmentId,
                    doctorId: appointmentData?.doctorId,
                    doctorName: appointmentData?.doctorName,
                    clinicId: appointmentData?.clinicId,
                    clinicName: appointmentData?.clinicName,
                    serviceId: appointmentData?.serviceId,
                    serviceName: appointmentData?.serviceName,
                    integrationType: 'appointment',
                    userId: user?.id,
                    contextData: {
                      contactType: tab,
                      appointmentDate: appointmentData?.appointmentDate,
                      startTime: appointmentData?.startTime,
                      status: appointmentData?.status,
                      contextType,
                    }
                  }}
                  onContactAction={handleContactAction}
                  showQuickActions={true}
                  showDetailedActions={true}
                />
              </TabsContent>
            ))}
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper function to get contact description
function getContactDescription(contactType: string): string {
  switch (contactType) {
    case 'reschedule':
      return 'Request to reschedule your appointment.';
    case 'cancellation':
      return 'Request to cancel your appointment.';
    case 'preparation':
      return 'Ask questions about preparing for your appointment.';
    case 'billing':
      return 'Questions about appointment charges and insurance.';
    case 'follow_up':
      return 'Post-appointment follow-up and support.';
    case 'confirmation':
      return 'Confirm or verify your appointment details.';
    default:
      return 'General appointment support and inquiries.';
  }
}

export { AppointmentBookingContactIntegration };
export type { AppointmentBookingContactIntegrationProps };