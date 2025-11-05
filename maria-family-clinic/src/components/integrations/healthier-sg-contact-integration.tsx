/**
 * Healthier SG Contact Integration Component
 * Sub-Phase 9.9: Integration with Existing Features Retry
 * 
 * Seamless integration of contact system with Healthier SG program
 * - Program enrollment contact
 * - Eligibility and application support
 * - Health goal tracking contact
 * - Program participant support
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
  Heart,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  Info,
  Users,
  Award,
  TrendingUp,
  Target,
  Activity,
  Pill,
  Stethoscope,
  Building,
  FileText,
  UserCheck,
  Brain,
  Zap,
  MapPin
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
import { Progress } from "@/components/ui/progress";

interface HealthierSgContactIntegrationProps {
  // Healthier SG program data
  programData?: {
    enrollmentStatus: 'not_enrolled' | 'pending' | 'enrolled' | 'completed' | 'suspended'
    enrollmentDate?: Date
    programStartDate?: Date
    programEndDate?: Date
    primaryCareProvider?: {
      clinicId: string
      clinicName: string
      clinicAddress: string
      doctorName: string
    }
    healthGoals?: Array<{
      goalId: string
      goalType: 'weight' | 'blood_pressure' | 'blood_sugar' | 'cholesterol' | 'activity' | 'diet'
      targetValue: number
      currentValue?: number
      targetDate: Date
      status: 'active' | 'achieved' | 'paused' | 'cancelled'
    }>
    healthConditions?: string[]
    currentHealthMetrics?: {
      weight?: number
      height?: number
      bmi?: number
      bloodPressure?: {
        systolic: number
        diastolic: number
      }
      bloodSugar?: number
      cholesterol?: {
        total: number
        ldl: number
        hdl: number
      }
    }
    eligibleServices?: string[]
    completedServices?: string[]
    programMilestones?: Array<{
      milestoneId: string
      title: string
      description: string
      targetDate: Date
      completedDate?: Date
      status: 'pending' | 'completed' | 'overdue'
    }>
  }
  
  // Integration features
  onContactAction?: (action: any, context: any) => void
  showEnrollmentContact?: boolean
  showSupportContact?: boolean
  showProgressContact?: boolean
  
  // Standard props
  className?: string
}

export function HealthierSgContactIntegration({
  programData,
  onContactAction,
  showEnrollmentContact = true,
  showSupportContact = true,
  showProgressContact = true,
  className
}: HealthierSgContactIntegrationProps) {
  const { user } = useUser();
  const { startContactSession, addContactHistory } = useContactIntegration();
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [selectedContactType, setSelectedContactType] = useState<string>('general');
  const [enrollmentQuestions, setEnrollmentQuestions] = useState<string>('');
  const [supportQuestions, setSupportQuestions] = useState<string>('');
  const [progressConcerns, setProgressConcerns] = useState<string>('');

  // Enhanced contact action handler
  const handleContactAction = (action: any) => {
    // Start contact session
    const sessionId = startContactSession({
      integrationType: 'healthier_sg',
      userId: user?.id,
      contextData: {
        enrollmentStatus: programData?.enrollmentStatus,
        enrollmentDate: programData?.enrollmentDate,
        healthGoals: programData?.healthGoals,
        healthConditions: programData?.healthConditions,
        currentHealthMetrics: programData?.currentHealthMetrics,
        primaryCareProvider: programData?.primaryCareProvider,
        eligibleServices: programData?.eligibleServices,
        completedServices: programData?.completedServices,
        contactType: selectedContactType,
        enrollmentQuestions,
        supportQuestions,
        progressConcerns,
      }
    });

    // Add to contact history
    addContactHistory({
      type: action.type,
      category: 'healthier_sg_related',
      subject: `Healthier SG ${action.label}`,
      summary: `User initiated ${action.label} for Healthier SG program`,
      status: 'pending',
      priority: action.priority || 'normal',
      contextType: 'healthier_sg',
      followUpRequired: false,
      followUpCompleted: false,
    });

    // Notify parent
    onContactAction?.(action, { 
      type: 'healthier_sg_contact',
      enrollmentStatus: programData?.enrollmentStatus,
      action: action.id,
      sessionId
    });
  };

  // Contact handlers
  const handleEnrollmentContact = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedContactType('enrollment');
    setIsContactDialogOpen(true);
    handleContactAction({ 
      id: 'enrollment_support', 
      type: 'form', 
      label: 'Enrollment Support', 
      priority: 'normal' 
    });
  };

  const handleEligibilityInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedContactType('eligibility');
    setIsContactDialogOpen(true);
    handleContactAction({ 
      id: 'eligibility_inquiry', 
      type: 'form', 
      label: 'Eligibility Inquiry', 
      priority: 'normal' 
    });
  };

  const handleGeneralSupport = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedContactType('general');
    setIsContactDialogOpen(true);
    handleContactAction({ 
      id: 'general_support', 
      type: 'form', 
      label: 'General Support', 
      priority: 'normal' 
    });
  };

  const handleGoalSupport = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedContactType('goals');
    setIsContactDialogOpen(true);
    handleContactAction({ 
      id: 'goal_support', 
      type: 'form', 
      label: 'Goal Support', 
      priority: 'normal' 
    });
  };

  const handleProviderSwitch = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedContactType('provider_switch');
    setIsContactDialogOpen(true);
    handleContactAction({ 
      id: 'provider_switch', 
      type: 'form', 
      label: 'Provider Switch', 
      priority: 'normal' 
    });
  };

  const handleMilestoneSupport = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedContactType('milestones');
    setIsContactDialogOpen(true);
    handleContactAction({ 
      id: 'milestone_support', 
      type: 'form', 
      label: 'Milestone Support', 
      priority: 'normal' 
    });
  };

  const handleEmergencyContact = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open('tel:1777', '_self');
    handleContactAction({ id: 'emergency', type: 'emergency', label: 'Emergency', priority: 'emergency' });
  };

  // Get enrollment status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enrolled': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'completed': return 'text-blue-600';
      case 'suspended': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  // Get goal progress percentage
  const getGoalProgress = (goal: any) => {
    if (!goal.currentValue || !goal.targetValue) return 0;
    return Math.min((goal.currentValue / goal.targetValue) * 100, 100);
  };

  const isProgramActive = programData?.enrollmentStatus === 'enrolled';

  return (
    <div className={cn("space-y-6", className)}>
      {/* Main Healthier SG Contact Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Healthier SG Program Support
          </CardTitle>
          <CardDescription>
            Get help with Healthier SG program enrollment, health goals, and ongoing support.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContactIntegrationManager
            context={{
              integrationType: 'healthier_sg',
              userId: user?.id,
              contextData: {
                enrollmentStatus: programData?.enrollmentStatus,
                enrollmentDate: programData?.enrollmentDate,
                healthGoals: programData?.healthGoals,
                healthConditions: programData?.healthConditions,
                primaryCareProvider: programData?.primaryCareProvider,
                isProgramActive,
              }
            }}
            onContactAction={handleContactAction}
            showQuickActions={true}
            showDetailedActions={true}
          />
        </CardContent>
      </Card>

      {/* Enrollment Support */}
      {showEnrollmentContact && programData?.enrollmentStatus === 'not_enrolled' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Join Healthier SG
            </CardTitle>
            <CardDescription>
              Get help with Healthier SG program enrollment and eligibility.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <form onSubmit={handleEnrollmentContact} className="space-y-2">
                <h4 className="font-medium">Enrollment Support</h4>
                <p className="text-sm text-muted-foreground">
                  Get help with the enrollment process and requirements.
                </p>
                <div className="space-y-2">
                  <Label>Any specific questions about enrollment?</Label>
                  <Textarea
                    placeholder="e.g., What documents do I need? How long does it take?"
                    value={enrollmentQuestions}
                    onChange={(e) => setEnrollmentQuestions(e.target.value)}
                    className="min-h-[60px]"
                  />
                </div>
                <Button type="submit" variant="outline" className="w-full" size="sm">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Enrollment Support
                </Button>
              </form>

              <form onSubmit={handleEligibilityInquiry} className="space-y-2">
                <h4 className="font-medium">Eligibility Check</h4>
                <p className="text-sm text-muted-foreground">
                  Confirm your eligibility for the Healthier SG program.
                </p>
                <Button type="submit" variant="outline" className="w-full" size="sm">
                  <Shield className="h-4 w-4 mr-2" />
                  Check Eligibility
                </Button>
              </form>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Healthier SG</strong> is a national program that helps Singaporeans 
                manage chronic conditions like diabetes and high blood pressure. 
                Contact us to learn more about how we can help you achieve your health goals.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Program Participant Support */}
      {isProgramActive && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Program Participant Support
            </CardTitle>
            <CardDescription>
              Get support with your Healthier SG program journey and health goals.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Health Goals Progress */}
            {showProgressContact && programData?.healthGoals && programData.healthGoals.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Health Goals Progress
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {programData.healthGoals.map((goal, index) => (
                    <Card key={goal.goalId} className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium capitalize">{goal.goalType.replace('_', ' ')}</span>
                        <Badge variant={goal.status === 'achieved' ? 'default' : 'secondary'}>
                          {goal.status}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Current: {goal.currentValue || 'N/A'}</span>
                          <span>Target: {goal.targetValue}</span>
                        </div>
                        <Progress value={getGoalProgress(goal)} className="h-2" />
                      </div>
                    </Card>
                  ))}
                </div>
                <form onSubmit={handleGoalSupport}>
                  <Label>Questions about your health goals?</Label>
                  <Textarea
                    placeholder="e.g., How can I achieve my target? Need help with meal planning?"
                    value={supportQuestions}
                    onChange={(e) => setSupportQuestions(e.target.value)}
                    className="min-h-[60px] mt-2"
                  />
                  <Button type="submit" className="w-full mt-2" size="sm">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Get Goal Support
                  </Button>
                </form>
              </div>
            )}

            {/* Program Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="justify-start gap-2 h-auto p-4"
                onClick={handleProviderSwitch}
              >
                <Building className="h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">Switch Care Provider</div>
                  <div className="text-xs text-muted-foreground">
                    Change your primary care provider
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="justify-start gap-2 h-auto p-4"
                onClick={handleMilestoneSupport}
              >
                <Award className="h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">Milestone Support</div>
                  <div className="text-xs text-muted-foreground">
                    Get help achieving program milestones
                  </div>
                </div>
              </Button>
            </div>

            {/* Primary Care Provider Info */}
            {programData?.primaryCareProvider && (
              <Card className="bg-green-50">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    Your Care Provider
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>Clinic:</strong> {programData.primaryCareProvider.clinicName}</div>
                    <div><strong>Address:</strong> {programData.primaryCareProvider.clinicAddress}</div>
                    <div><strong>Doctor:</strong> {programData.primaryCareProvider.doctorName}</div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedContactType('clinic_contact');
                        setIsContactDialogOpen(true);
                      }}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Contact Clinic
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      )}

      {/* Emergency and Urgent Contact */}
      <Card className="border-red-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <h4 className="font-medium text-red-800">Health Emergency</h4>
                <p className="text-sm text-red-700">
                  For medical emergencies, call 1777 immediately
                </p>
              </div>
            </div>
            <Button
              variant="destructive"
              onClick={handleEmergencyContact}
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
            <DialogTitle>Healthier SG Program Support</DialogTitle>
            <DialogDescription>
              {getContactDescription(selectedContactType)}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={selectedContactType} onValueChange={setSelectedContactType} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
              <TabsTrigger value="eligibility">Eligibility</TabsTrigger>
              <TabsTrigger value="goals">Goals</TabsTrigger>
              <TabsTrigger value="provider_switch">Provider</TabsTrigger>
            </TabsList>
            
            {['general', 'enrollment', 'eligibility', 'goals', 'provider_switch'].map((tab) => (
              <TabsContent key={tab} value={tab} className="space-y-4">
                <ContactIntegrationManager
                  context={{
                    integrationType: 'healthier_sg',
                    userId: user?.id,
                    contextData: {
                      contactType: tab,
                      enrollmentStatus: programData?.enrollmentStatus,
                      healthGoals: programData?.healthGoals,
                      primaryCareProvider: programData?.primaryCareProvider,
                      isProgramActive,
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
    case 'enrollment':
      return 'Get help with Healthier SG program enrollment process.';
    case 'eligibility':
      return 'Check your eligibility for the Healthier SG program.';
    case 'goals':
      return 'Get support with your health goals and progress tracking.';
    case 'provider_switch':
      return 'Request to switch your primary care provider.';
    case 'milestones':
      return 'Get help achieving program milestones and targets.';
    case 'clinic_contact':
      return 'Contact your assigned clinic for program-related support.';
    default:
      return 'General support for the Healthier SG program.';
  }
}

export { HealthierSgContactIntegration };
export type { HealthierSgContactIntegrationProps };