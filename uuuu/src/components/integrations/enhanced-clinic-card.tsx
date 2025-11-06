/**
 * Enhanced Clinic Card with Contact Integration
 * Sub-Phase 9.9: Integration with Existing Features Retry
 * 
 * Seamless integration of contact system with clinic search and discovery
 * - Context-aware contact options
 * - Service-specific contact forms
 * - Healthier SG integration
 * - Appointment booking contact workflows
 */

import React, { useState } from 'react';
import { ClinicCard } from '@/components/healthcare/clinic-card';
import { ContactIntegrationManager } from '@/components/integrations/contact-integration-manager';
import { useContactIntegration } from '@/lib/hooks/use-contact-integration';
import { useUser } from '@/lib/hooks/use-user';
import { 
  Phone, 
  MessageCircle, 
  Mail, 
  Calendar,
  Star,
  Navigation,
  ChevronRight,
  Heart,
  Shield,
  CheckCircle,
  Users,
  Building,
  Clock,
  MapPin,
  Accessibility,
  Car,
  Award,
  CheckSquare,
  Zap,
  AlertTriangle,
  HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EnhancedClinicCardProps {
  // Base clinic data (same as ClinicCard)
  clinic: {
    id: string
    name: string
    address: string
    phone: string
    email?: string
    website?: string
    hours: string
    rating?: number
    totalReviews?: number
    distance?: string
    travelTime?: string
    specialties?: string[]
    services?: string[]
    image?: string
    isOpen?: boolean
    waitTime?: string
    waitTimeEstimate?: number
    doctorCount?: number
    established?: number
    isMOHVerified?: boolean
    hasParking?: boolean
    parkingSpaces?: number
    isWheelchairAccessible?: boolean
    acceptsInsurance?: boolean
    acceptsMedisave?: boolean
    isSelected?: boolean
    healthierSgParticipating?: boolean
    emergencyPhone?: string
  }
  
  // Integration features
  onViewDetails?: (clinicId: string) => void
  onGetDirections?: (clinicId: string) => void
  onBookAppointment?: (clinicId: string) => void
  onToggleFavorite?: (clinicId: string, isFavorite: boolean) => void
  onToggleCompare?: (clinicId: string) => void
  onCall?: (phoneNumber: string) => void
  
  // Contact integration features
  showContactOptions?: boolean
  contactOptionsCompact?: boolean
  onContactAction?: (action: any, context: any) => void
  
  // Standard props
  isFavorite?: boolean
  isComparisonMode?: boolean
  showDistance?: boolean
  className?: string
}

interface QuickContactState {
  isOpen: boolean
  selectedMethod?: 'phone' | 'email' | 'form' | 'whatsapp'
}

export function EnhancedClinicCard({
  clinic,
  onViewDetails,
  onGetDirections,
  onBookAppointment,
  onToggleFavorite,
  onToggleCompare,
  onCall,
  showContactOptions = true,
  contactOptionsCompact = false,
  onContactAction,
  isFavorite = false,
  isComparisonMode = false,
  showDistance = true,
  className
}: EnhancedClinicCardProps) {
  const { user } = useUser();
  const { startContactSession, addContactHistory } = useContactIntegration();
  const [quickContact, setQuickContact] = useState<QuickContactState>({ isOpen: false });
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);

  // Enhanced contact action handler
  const handleContactAction = (action: any) => {
    // Start contact session
    const sessionId = startContactSession({
      clinicId: clinic.id,
      clinicName: clinic.name,
      integrationType: 'clinic',
      userId: user?.id,
      contextData: {
        phoneNumber: clinic.phone,
        email: clinic.email,
        emergencyPhone: clinic.emergencyPhone,
        location: clinic.address,
        specialties: clinic.specialties,
        services: clinic.services,
        isOpen: clinic.isOpen,
        healthierSgParticipating: clinic.healthierSgParticipating,
      }
    });

    // Add to contact history
    addContactHistory({
      type: action.type,
      category: 'clinic_inquiry',
      subject: `Contact with ${clinic.name}`,
      summary: `User initiated ${action.label} with ${clinic.name}`,
      status: 'pending',
      priority: action.priority || 'normal',
      contextType: 'clinic',
      contextId: clinic.id,
      contextName: clinic.name,
      followUpRequired: false,
      followUpCompleted: false,
    });

    // Notify parent
    onContactAction?.(action, { 
      type: 'clinic_contact',
      clinicId: clinic.id,
      clinicName: clinic.name,
      action: action.id,
      sessionId
    });
  };

  // Quick contact actions
  const handleQuickCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleContactAction({ id: 'quick_call', type: 'phone', label: 'Quick Call', priority: 'normal' });
    onCall?.(clinic.phone);
  };

  const handleContactForm = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsContactDialogOpen(true);
  };

  const handleWhatsAppContact = (e: React.MouseEvent) => {
    e.stopPropagation();
    const message = encodeURIComponent(`Hello! I'm interested in learning more about ${clinic.name}.`);
    window.open(`https://wa.me/${clinic.phone.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
    handleContactAction({ id: 'whatsapp', type: 'whatsapp', label: 'WhatsApp', priority: 'normal' });
  };

  const handleEmergencyContact = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (clinic.emergencyPhone) {
      window.open(`tel:${clinic.emergencyPhone}`, '_self');
    } else {
      // Redirect to emergency services
      window.open('tel:1777', '_self');
    }
    handleContactAction({ id: 'emergency', type: 'emergency', label: 'Emergency', priority: 'emergency' });
  };

  return (
    <Card
      className={cn(
        "group transition-all hover:shadow-lg border-2 overflow-hidden",
        clinic.isSelected && "border-primary",
        isComparisonMode && "border-dashed",
        className
      )}
    >
      {/* Main Clinic Card Content */}
      <div className="relative">
        <ClinicCard
          clinic={clinic}
          onViewDetails={onViewDetails}
          onGetDirections={onGetDirections}
          onBookAppointment={onBookAppointment}
          onToggleFavorite={onToggleFavorite}
          onToggleCompare={onToggleCompare}
          onCall={onCall}
          isFavorite={isFavorite}
          isComparisonMode={isComparisonMode}
          showDistance={showDistance}
          className="border-none shadow-none"
        />

        {/* Contact Integration Overlay */}
        {showContactOptions && (
          <div className="absolute top-4 right-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="secondary" 
                  size="sm"
                  className="bg-white/90 backdrop-blur-sm shadow-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Contact
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Contact Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* Quick Actions */}
                <DropdownMenuItem onClick={handleQuickCall} className="gap-2">
                  <Phone className="h-4 w-4" />
                  Call Clinic
                </DropdownMenuItem>
                
                {clinic.email && (
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    window.open(`mailto:${clinic.email}?subject=Inquiry about ${clinic.name}`, '_self');
                    handleContactAction({ id: 'email', type: 'email', label: 'Email', priority: 'low' });
                  }} className="gap-2">
                    <Mail className="h-4 w-4" />
                    Send Email
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuItem onClick={handleContactForm} className="gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Contact Form
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={handleWhatsAppContact} className="gap-2">
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                {/* Urgent Actions */}
                <DropdownMenuItem 
                  onClick={handleEmergencyContact}
                  className="gap-2 text-red-600"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Emergency Contact
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Healthier SG Badge */}
        {clinic.healthierSgParticipating && (
          <div className="absolute bottom-4 left-4">
            <Badge 
              variant="default" 
              className="bg-green-600 text-white gap-1"
            >
              <Heart className="h-3 w-3" />
              Healthier SG
            </Badge>
          </div>
        )}
      </div>

      {/* Contact Integration Details */}
      <div className="px-6 pb-4">
        <Collapsible 
          open={quickContact.isOpen} 
          onOpenChange={(open) => setQuickContact(prev => ({ ...prev, isOpen: open }))}
        >
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full mt-2 text-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              {quickContact.isOpen ? 'Hide' : 'Show'} Contact & Service Details
              <ChevronRight className={cn(
                "h-4 w-4 ml-auto transition-transform",
                quickContact.isOpen && "rotate-90"
              )} />
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-4 space-y-4">
            {/* Contact Integration Manager */}
            <ContactIntegrationManager
              context={{
                clinicId: clinic.id,
                clinicName: clinic.name,
                integrationType: 'clinic',
                userId: user?.id,
                contextData: {
                  phoneNumber: clinic.phone,
                  email: clinic.email,
                  website: clinic.website,
                  emergencyPhone: clinic.emergencyPhone,
                  address: clinic.address,
                  specialties: clinic.specialties,
                  services: clinic.services,
                  isOpen: clinic.isOpen,
                  rating: clinic.rating,
                  totalReviews: clinic.totalReviews,
                  healthierSgParticipating: clinic.healthierSgParticipating,
                  acceptsMedisave: clinic.acceptsMedisave,
                  acceptsInsurance: clinic.acceptsInsurance,
                  isWheelchairAccessible: clinic.isWheelchairAccessible,
                  hasParking: clinic.hasParking,
                }
              }}
              onContactAction={handleContactAction}
              compact={contactOptionsCompact}
              showQuickActions={true}
              showDetailedActions={false}
            />
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Contact Form Dialog */}
      <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Contact {clinic.name}</DialogTitle>
            <DialogDescription>
              Get in touch with {clinic.name} for any questions or to schedule an appointment.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="appointment">Appointment</TabsTrigger>
              <TabsTrigger value="service">Service</TabsTrigger>
              <TabsTrigger value="healthier_sg">Healthier SG</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-4">
              <ContactIntegrationManager
                context={{
                  clinicId: clinic.id,
                  clinicName: clinic.name,
                  integrationType: 'clinic',
                  userId: user?.id,
                  contextData: { inquiryType: 'general' }
                }}
                onContactAction={handleContactAction}
                showQuickActions={true}
                showDetailedActions={true}
              />
            </TabsContent>
            
            <TabsContent value="appointment" className="space-y-4">
              <ContactIntegrationManager
                context={{
                  clinicId: clinic.id,
                  clinicName: clinic.name,
                  integrationType: 'appointment',
                  userId: user?.id,
                  contextData: { inquiryType: 'appointment' }
                }}
                onContactAction={handleContactAction}
                showQuickActions={true}
                showDetailedActions={true}
              />
            </TabsContent>
            
            <TabsContent value="service" className="space-y-4">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Select a service to inquire about:
                </p>
                {clinic.services?.slice(0, 5).map((service, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full justify-between"
                    onClick={() => handleContactAction({ 
                      id: `service_${service}`, 
                      type: 'form', 
                      label: `Ask about ${service}`, 
                      priority: 'normal' 
                    })}
                  >
                    <span>{service}</span>
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="healthier_sg" className="space-y-4">
              {clinic.healthierSgParticipating ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Get help with Healthier SG enrollment and services:
                  </p>
                  <ContactIntegrationManager
                    context={{
                      clinicId: clinic.id,
                      clinicName: clinic.name,
                      integrationType: 'healthier_sg',
                      userId: user?.id,
                      contextData: { 
                        programEnrollment: true,
                        servicesEligible: clinic.services?.filter(s => 
                          ['chronic', 'diabetes', 'hypertension', 'heart'].some(keyword => 
                            s.toLowerCase().includes(keyword)
                          )
                        ) || []
                      }
                    }}
                    onContactAction={handleContactAction}
                    showQuickActions={true}
                    showDetailedActions={true}
                  />
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground mb-4">
                    {clinic.name} is not currently participating in Healthier SG program.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => handleContactAction({ 
                      id: 'healthier_sg_inquiry', 
                      type: 'form', 
                      label: 'Ask about Healthier SG', 
                      priority: 'low' 
                    })}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Ask about Program
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export { EnhancedClinicCard };
export type { EnhancedClinicCardProps };