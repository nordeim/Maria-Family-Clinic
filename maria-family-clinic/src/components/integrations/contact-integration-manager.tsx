/**
 * Contact Integration Manager
 * Sub-Phase 9.9: Integration with Existing Features Retry
 * 
 * Unified contact integration across all platform features:
 * - Clinic search and doctor discovery
 * - Appointment booking workflows
 * - Healthier SG program enrollment
 * - User profiles and health records
 * - Service exploration
 */

import React, { useState, useEffect } from 'react';
import { useContactForm } from '@/components/forms/contact-form-provider';
import { ContactForm } from '@/components/forms/contact-form-container';
import { useUser } from '@/lib/hooks/use-user';
import { 
  Phone, 
  MessageCircle, 
  Mail, 
  Calendar,
  User,
  Stethoscope,
  Building,
  Heart,
  HelpCircle,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { ContactType, ContactMethod } from '@/lib/validations/contact-form';

interface ContactIntegrationContext {
  // Context information
  clinicId?: string;
  clinicName?: string;
  doctorId?: string;
  doctorName?: string;
  serviceId?: string;
  serviceName?: string;
  appointmentId?: string;
  userId?: string;
  userType?: 'patient' | 'doctor' | 'staff' | 'admin';
  
  // Contact preferences
  preferredContactMethod?: ContactMethod;
  availableContactMethods?: ContactMethod[];
  contactPreferences?: {
    allowDirectContact: boolean;
    emergencyContactMethod?: ContactMethod;
    businessHours?: {
      start: string;
      end: string;
      timezone: string;
    };
  };
  
  // Integration settings
  integrationType: 'clinic' | 'doctor' | 'service' | 'appointment' | 'healthier_sg' | 'general';
  contextData?: Record<string, any>;
}

interface ContactAction {
  id: string;
  type: 'call' | 'email' | 'whatsapp' | 'form' | 'appointment' | 'emergency';
  label: string;
  description?: string;
  icon: React.ComponentType;
  priority: 'low' | 'normal' | 'high' | 'emergency';
  requiresAuth?: boolean;
  available: boolean;
  action: () => void;
  metadata?: Record<string, any>;
}

interface ContactIntegrationManagerProps {
  context: ContactIntegrationContext;
  onContactAction?: (action: ContactAction) => void;
  showQuickActions?: boolean;
  showDetailedActions?: boolean;
  compact?: boolean;
  className?: string;
}

export function ContactIntegrationManager({
  context,
  onContactAction,
  showQuickActions = true,
  showDetailedActions = false,
  compact = false,
  className
}: ContactIntegrationManagerProps) {
  const { user } = useUser();
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<ContactAction | null>(null);
  const [contactActions, setContactActions] = useState<ContactAction[]>([]);

  // Initialize contact actions based on context
  useEffect(() => {
    const actions = generateContactActions(context);
    setContactActions(actions);
  }, [context]);

  // Handle contact action execution
  const handleContactAction = (action: ContactAction) => {
    if (!action.available) return;

    // Track action for analytics
    trackContactAction(action, context);

    // Execute action
    action.action();
    
    // Notify parent component
    onContactAction?.(action);
  };

  // Generate contact actions based on integration context
  const generateContactActions = (context: ContactIntegrationContext): ContactAction[] => {
    const actions: ContactAction[] = [];

    // Emergency contact (always available for medical contexts)
    if (context.integrationType === 'doctor' || context.integrationType === 'clinic') {
      actions.push({
        id: 'emergency',
        type: 'emergency',
        label: 'Emergency Contact',
        description: 'For urgent medical situations',
        icon: AlertTriangle,
        priority: 'emergency',
        requiresAuth: false,
        available: true,
        action: () => window.open('tel:1777', '_self'),
        metadata: { number: '1777' }
      });
    }

    // Direct phone call
    if (context.clinicId || context.doctorId) {
      actions.push({
        id: 'call',
        type: 'call',
        label: 'Call Direct',
        description: 'Speak with clinic staff',
        icon: Phone,
        priority: 'high',
        available: true,
        action: () => handlePhoneCall(),
        metadata: { type: 'direct_call' }
      });
    }

    // Appointment booking
    if (context.clinicId || context.doctorId) {
      actions.push({
        id: 'appointment',
        type: 'appointment',
        label: 'Book Appointment',
        description: 'Schedule a visit',
        icon: Calendar,
        priority: 'normal',
        available: true,
        action: () => handleAppointmentBooking(),
        metadata: { type: 'appointment_booking' }
      });
    }

    // Contact form (contextual)
    actions.push({
      id: 'contact_form',
      type: 'form',
      label: 'Send Message',
      description: 'Get help via contact form',
      icon: MessageCircle,
      priority: 'normal',
      available: true,
      action: () => setIsContactFormOpen(true),
      metadata: { form_context: context.integrationType }
    });

    // Service-specific contact
    if (context.serviceId) {
      actions.push({
        id: 'service_inquiry',
        type: 'form',
        label: 'Service Inquiry',
        description: `Questions about ${context.serviceName || 'this service'}`,
        icon: Stethoscope,
        priority: 'normal',
        available: true,
        action: () => handleServiceInquiry(),
        metadata: { service_id: context.serviceId }
      });
    }

    // Healthier SG specific contact
    if (context.integrationType === 'healthier_sg') {
      actions.push({
        id: 'healthier_sg_support',
        type: 'form',
        label: 'Healthier SG Support',
        description: 'Get help with Healthier SG program',
        icon: Heart,
        priority: 'normal',
        available: true,
        action: () => handleHealthierSgContact(),
        metadata: { program: 'healthier_sg' }
      });
    }

    // Email contact (for non-urgent matters)
    actions.push({
      id: 'email',
      type: 'email',
      label: 'Email Us',
      description: 'Send detailed inquiry',
      icon: Mail,
      priority: 'low',
      available: true,
      action: () => handleEmailContact(),
      metadata: { type: 'email_contact' }
    });

    return actions.sort((a, b) => {
      // Sort by priority: emergency > high > normal > low
      const priorityOrder = { emergency: 0, high: 1, normal: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  };

  // Action handlers
  const handlePhoneCall = () => {
    if (context.contextData?.phoneNumber) {
      window.open(`tel:${context.contextData.phoneNumber}`, '_self');
    }
  };

  const handleAppointmentBooking = () => {
    // This would integrate with the existing appointment booking system
    if (context.clinicId) {
      // Navigate to appointment booking for clinic
      window.location.href = `/appointment/booking?clinic=${context.clinicId}`;
    } else if (context.doctorId) {
      // Navigate to doctor appointment booking
      window.location.href = `/doctor/${context.doctorId}/book`;
    }
  };

  const handleServiceInquiry = () => {
    setIsContactFormOpen(true);
    // Pre-fill with service context
  };

  const handleHealthierSgContact = () => {
    setIsContactFormOpen(true);
    // Pre-fill with Healthier SG context
  };

  const handleEmailContact = () => {
    const subject = encodeURIComponent(
      `Inquiry about ${context.serviceName || context.doctorName || context.clinicName || 'medical services'}`
    );
    const body = encodeURIComponent(
      `Hello,\n\nI would like to inquire about:\n${context.serviceName || context.doctorName || context.clinicName || ''}\n\nThank you.`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, '_self');
  };

  // Track contact actions for analytics
  const trackContactAction = (action: ContactAction, context: ContactIntegrationContext) => {
    // This would integrate with analytics system
    console.log('Contact action tracked:', {
      action: action.type,
      context: context.integrationType,
      userType: context.userType,
      targetId: context.clinicId || context.doctorId || context.serviceId
    });
  };

  // Get priority color for action badges
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'normal': return 'bg-blue-500';
      case 'low': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Select
          onValueChange={(value) => {
            const action = contactActions.find(a => a.id === value);
            if (action) handleContactAction(action);
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Contact Us" />
          </SelectTrigger>
          <SelectContent>
            {contactActions.map((action) => (
              <SelectItem key={action.id} value={action.id} disabled={!action.available}>
                <div className="flex items-center gap-2">
                  <action.icon className="h-4 w-4" />
                  {action.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Quick Actions */}
      {showQuickActions && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Quick Contact</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {contactActions.map((action) => (
              <Button
                key={action.id}
                variant={action.priority === 'emergency' ? 'destructive' : 'outline'}
                size="sm"
                onClick={() => handleContactAction(action)}
                disabled={!action.available}
                className="justify-start gap-2"
              >
                <action.icon className="h-4 w-4" />
                <span className="truncate">{action.label}</span>
                {action.priority === 'emergency' && (
                  <Badge variant="destructive" className="ml-auto text-xs">
                    !
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Actions */}
      {showDetailedActions && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">All Contact Options</h3>
          <div className="space-y-2">
            {contactActions.map((action) => (
              <Card
                key={action.id}
                className={cn(
                  "cursor-pointer transition-colors",
                  action.available ? "hover:bg-accent" : "opacity-50 cursor-not-allowed"
                )}
                onClick={() => action.available && handleContactAction(action)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg", getPriorityColor(action.priority))}>
                      <action.icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{action.label}</span>
                        <Badge variant="outline" className="text-xs">
                          {action.priority}
                        </Badge>
                      </div>
                      {action.description && (
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                      )}
                    </div>
                    <CheckCircle className={cn(
                      "h-4 w-4",
                      action.available ? "text-green-500" : "text-gray-300"
                    )} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Contact Form Dialog */}
      <Dialog open={isContactFormOpen} onOpenChange={setIsContactFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Contact Us</DialogTitle>
            <DialogDescription>
              {context.serviceName && `Inquiry about ${context.serviceName}`}
              {context.doctorName && `Message for Dr. ${context.doctorName}`}
              {context.clinicName && `Contact ${context.clinicName}`}
              {!context.serviceName && !context.doctorName && !context.clinicName && 
                'Send us a message and we\'ll get back to you soon.'}
            </DialogDescription>
          </DialogHeader>
          <ContactForm
            initialFormType={getContactTypeFromContext(context)}
            contextData={{
              clinicId: context.clinicId,
              doctorId: context.doctorId,
              serviceId: context.serviceId,
              appointmentId: context.appointmentId,
              userId: user?.id,
            }}
            compactMode={false}
            onFormSubmit={async (data) => {
              // Handle form submission with context
              console.log('Form submitted with context:', data, context);
              setIsContactFormOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper function to determine contact type from context
function getContactTypeFromContext(context: ContactIntegrationContext): ContactType {
  switch (context.integrationType) {
    case 'doctor':
      return 'doctor_inquiry';
    case 'service':
      return 'service_inquiry';
    case 'appointment':
      return 'appointment_related';
    case 'healthier_sg':
      return 'healthier_sg_related';
    case 'clinic':
    default:
      return 'general_inquiry';
  }
}

export type { ContactIntegrationContext, ContactAction };
export { ContactIntegrationManager };