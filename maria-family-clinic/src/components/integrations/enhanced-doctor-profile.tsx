/**
 * Enhanced Doctor Profile with Contact Integration
 * Sub-Phase 9.9: Integration with Existing Features Retry
 * 
 * Seamless integration of contact system with doctor profiles
 * - Doctor-specific contact options
 * - Service and specialty contact
 * - Appointment booking integration
 * - Medical inquiry contact workflows
 */

import React, { useState } from 'react';
import { DoctorProfileHeader } from '@/components/doctor/doctor-profile-header';
import { ContactIntegrationManager } from '@/components/integrations/contact-integration-manager';
import { useContactIntegration } from '@/lib/hooks/use-contact-integration';
import { useUser } from '@/lib/hooks/use-user';
import { 
  Phone, 
  MessageCircle, 
  Mail, 
  Calendar,
  Star,
  MapPin,
  GraduationCap, 
  Award, 
  Clock,
  User,
  Stethoscope,
  Heart,
  AlertTriangle,
  HelpCircle,
  ChevronRight,
  CheckCircle,
  Users,
  FileText,
  Video,
  Shield
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

interface EnhancedDoctorProfileProps {
  // Base doctor data
  doctor: {
    id: string
    firstName: string
    lastName: string
    specialties: string[]
    languages: string[]
    experience?: number
    rating?: {
      average: number
      count: number
    }
    profile?: {
      photo?: string
      bio?: string
      description?: string
    }
    medicalLicense: string
    isVerified: boolean
    verificationDate?: Date
    email?: string
    phone?: string
    qualifications?: string[]
    
    // Extended data
    specializations?: string[]
    boardCertifications?: string[]
    achievements?: string[]
    publications?: string[]
    researchInterests?: string[]
    professionalMemberships?: string[]
    clinicAffiliations?: Array<{
      clinicId: string
      clinicName: string
      clinicAddress: string
      role: string
      workingDays?: string[]
    }>
    consultationFee?: number
    isAvailable?: boolean
    nextAvailableDate?: Date
    telemedicineAvailable?: boolean
    languagesSpoken?: string[]
    culturalCompetence?: string[]
  }
  
  // Integration features
  onViewDetails?: (doctorId: string) => void
  onBookAppointment?: (doctorId: string) => void
  onCall?: (phoneNumber: string) => void
  onEmail?: (email: string) => void
  
  // Contact integration features
  showContactOptions?: boolean
  contactOptionsCompact?: boolean
  onContactAction?: (action: any, context: any) => void
  
  // Standard props
  className?: string
}

export function EnhancedDoctorProfile({
  doctor,
  onViewDetails,
  onBookAppointment,
  onCall,
  onEmail,
  showContactOptions = true,
  contactOptionsCompact = false,
  onContactAction,
  className
}: EnhancedDoctorProfileProps) {
  const { user } = useUser();
  const { startContactSession, addContactHistory } = useContactIntegration();
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);

  // Enhanced contact action handler
  const handleContactAction = (action: any) => {
    const fullName = `Dr. ${doctor.firstName} ${doctor.lastName}`;
    
    // Start contact session
    const sessionId = startContactSession({
      doctorId: doctor.id,
      doctorName: fullName,
      integrationType: 'doctor',
      userId: user?.id,
      contextData: {
        phoneNumber: doctor.phone,
        email: doctor.email,
        specialties: doctor.specialties,
        specializations: doctor.specializations,
        clinicAffiliations: doctor.clinicAffiliations,
        consultationFee: doctor.consultationFee,
        isAvailable: doctor.isAvailable,
        telemedicineAvailable: doctor.telemedicineAvailable,
        languages: doctor.languages || doctor.languagesSpoken,
        nextAvailableDate: doctor.nextAvailableDate,
      }
    });

    // Add to contact history
    addContactHistory({
      type: action.type,
      category: 'doctor_inquiry',
      subject: `Contact with ${fullName}`,
      summary: `User initiated ${action.label} with ${fullName}`,
      status: 'pending',
      priority: action.priority || 'normal',
      contextType: 'doctor',
      contextId: doctor.id,
      contextName: fullName,
      followUpRequired: false,
      followUpCompleted: false,
    });

    // Notify parent
    onContactAction?.(action, { 
      type: 'doctor_contact',
      doctorId: doctor.id,
      doctorName: fullName,
      action: action.id,
      sessionId
    });
  };

  // Contact action handlers
  const handleQuickCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (doctor.phone) {
      onCall?.(doctor.phone);
      handleContactAction({ id: 'quick_call', type: 'phone', label: 'Quick Call', priority: 'normal' });
    }
  };

  const handleEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (doctor.email) {
      onEmail?.(doctor.email);
      handleContactAction({ id: 'email', type: 'email', label: 'Email', priority: 'low' });
    }
  };

  const handleContactForm = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsContactDialogOpen(true);
  };

  const handleEmergencyContact = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Redirect to emergency services or doctor's emergency line
    window.open('tel:1777', '_self');
    handleContactAction({ id: 'emergency', type: 'emergency', label: 'Emergency', priority: 'emergency' });
  };

  const handleSpecialtyContact = (specialty: string) => {
    setSelectedSpecialty(specialty);
    setIsContactDialogOpen(true);
    handleContactAction({ 
      id: 'specialty_contact', 
      type: 'form', 
      label: `${specialty} Inquiry`, 
      priority: 'normal' 
    });
  };

  const handleTelemedicine = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (doctor.telemedicineAvailable) {
      // Handle telemedicine booking
      console.log('Telemedicine booking for', doctor.id);
    }
    handleContactAction({ id: 'telemedicine', type: 'form', label: 'Telemedicine', priority: 'normal' });
  };

  const handleSecondOpinion = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleContactAction({ id: 'second_opinion', type: 'form', label: 'Second Opinion', priority: 'normal' });
  };

  const handleMedicalRecord = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleContactAction({ id: 'medical_record', type: 'form', label: 'Medical Records', priority: 'normal' });
  };

  // Format consultation fee
  const formatConsultationFee = (fee?: number) => {
    if (!fee) return null;
    return `S$${fee.toFixed(2)}`;
  };

  // Get specialty-related services
  const getSpecialtyServices = (specialty: string) => {
    const serviceMap: Record<string, string[]> = {
      'Cardiology': ['ECG', 'Echocardiogram', 'Stress Test', 'Heart Surgery'],
      'Dermatology': ['Skin Check', 'Mole Removal', 'Acne Treatment', 'Botox'],
      'Orthopedics': ['X-Ray', 'MRI', 'Joint Injection', 'Arthroscopy'],
      'Pediatrics': ['Vaccination', 'Growth Check', 'Development Assessment', 'Child Care'],
      'General Practice': ['Health Check', 'Vaccination', 'Blood Test', 'General Consultation']
    };
    return serviceMap[specialty] || ['Consultation', 'Follow-up', 'Second Opinion'];
  };

  const fullName = `Dr. ${doctor.firstName} ${doctor.lastName}`;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Main Doctor Profile */}
      <Card className="overflow-hidden">
        <div className="relative">
          <DoctorProfileHeader doctor={doctor} className="border-none shadow-none" />
          
          {/* Contact Integration Controls */}
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
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Contact {fullName}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {/* Quick Actions */}
                  {doctor.phone && (
                    <DropdownMenuItem onClick={handleQuickCall} className="gap-2">
                      <Phone className="h-4 w-4" />
                      Call Direct
                    </DropdownMenuItem>
                  )}
                  
                  {doctor.email && (
                    <DropdownMenuItem onClick={handleEmail} className="gap-2">
                      <Mail className="h-4 w-4" />
                      Send Email
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuItem onClick={handleContactForm} className="gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Contact Form
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  {/* Medical Actions */}
                  <DropdownMenuItem onClick={() => onBookAppointment?.(doctor.id)} className="gap-2">
                    <Calendar className="h-4 w-4" />
                    Book Appointment
                  </DropdownMenuItem>
                  
                  {doctor.telemedicineAvailable && (
                    <DropdownMenuItem onClick={handleTelemedicine} className="gap-2">
                      <Video className="h-4 w-4" />
                      Telemedicine
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuItem onClick={handleSecondOpinion} className="gap-2">
                    <Users className="h-4 w-4" />
                    Second Opinion
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={handleMedicalRecord} className="gap-2">
                    <FileText className="h-4 w-4" />
                    Medical Records
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
          {doctor.specialties?.some(s => ['general practice', 'cardiology', 'diabetes', 'hypertension'].includes(s.toLowerCase())) && (
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
      </Card>

      {/* Contact Integration Manager */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Contact & Communication
          </CardTitle>
          <CardDescription>
            Get in touch with {fullName} for appointments, medical inquiries, or consultations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContactIntegrationManager
            context={{
              doctorId: doctor.id,
              doctorName: fullName,
              integrationType: 'doctor',
              userId: user?.id,
              contextData: {
                phoneNumber: doctor.phone,
                email: doctor.email,
                specialties: doctor.specialties,
                specializations: doctor.specializations,
                clinicAffiliations: doctor.clinicAffiliations,
                consultationFee: doctor.consultationFee,
                isAvailable: doctor.isAvailable,
                nextAvailableDate: doctor.nextAvailableDate,
                telemedicineAvailable: doctor.telemedicineAvailable,
                languages: doctor.languages || doctor.languagesSpoken,
                boardCertifications: doctor.boardCertifications,
                achievements: doctor.achievements,
              }
            }}
            onContactAction={handleContactAction}
            compact={contactOptionsCompact}
            showQuickActions={true}
            showDetailedActions={true}
          />
        </CardContent>
      </Card>

      {/* Specialty-Specific Contact */}
      {doctor.specialties && doctor.specialties.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Specialty Contact
            </CardTitle>
            <CardDescription>
              Contact {fullName} for specific medical concerns and procedures.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {doctor.specialties.map((specialty, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="justify-between h-auto p-4"
                  onClick={() => handleSpecialtyContact(specialty)}
                >
                  <div className="text-left">
                    <div className="font-medium">{specialty}</div>
                    <div className="text-xs text-muted-foreground">
                      {getSpecialtyServices(specialty).slice(0, 2).join(', ')}
                    </div>
                  </div>
                  <MessageCircle className="h-4 w-4" />
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact Form Dialog */}
      <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Contact {fullName}</DialogTitle>
            <DialogDescription>
              {selectedSpecialty 
                ? `Contact ${fullName} regarding ${selectedSpecialty}`
                : `Get in touch with ${fullName} for appointments or medical inquiries.`
              }
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="appointment">Appointment</TabsTrigger>
              <TabsTrigger value="medical">Medical</TabsTrigger>
              <TabsTrigger value="specialty">Specialty</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-4">
              <ContactIntegrationManager
                context={{
                  doctorId: doctor.id,
                  doctorName: fullName,
                  integrationType: 'doctor',
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
                  doctorId: doctor.id,
                  doctorName: fullName,
                  integrationType: 'appointment',
                  userId: user?.id,
                  contextData: { 
                    inquiryType: 'appointment',
                    consultationFee: doctor.consultationFee,
                    isAvailable: doctor.isAvailable,
                    nextAvailableDate: doctor.nextAvailableDate,
                    telemedicineAvailable: doctor.telemedicineAvailable,
                  }
                }}
                onContactAction={handleContactAction}
                showQuickActions={true}
                showDetailedActions={true}
              />
            </TabsContent>
            
            <TabsContent value="medical" className="space-y-4">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Select a type of medical inquiry:
                </p>
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    variant="outline"
                    className="justify-between"
                    onClick={handleSecondOpinion}
                  >
                    <span>Request Second Opinion</span>
                    <Users className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-between"
                    onClick={handleMedicalRecord}
                  >
                    <span>Medical Records Request</span>
                    <FileText className="h-4 w-4" />
                  </Button>
                  {doctor.telemedicineAvailable && (
                    <Button
                      variant="outline"
                      className="justify-between"
                      onClick={handleTelemedicine}
                    >
                      <span>Telemedicine Inquiry</span>
                      <Video className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="specialty" className="space-y-4">
              {selectedSpecialty ? (
                <div className="space-y-4">
                  <h3 className="font-medium">{selectedSpecialty} Contact</h3>
                  <div className="space-y-2">
                    {getSpecialtyServices(selectedSpecialty).map((service, index) => (
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
                </div>
              ) : (
                <div className="space-y-2">
                  {doctor.specialties?.map((specialty, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="w-full justify-between"
                      onClick={() => handleSpecialtyContact(specialty)}
                    >
                      <span>{specialty}</span>
                      <Stethoscope className="h-4 w-4" />
                    </Button>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export { EnhancedDoctorProfile };
export type { EnhancedDoctorProfileProps };