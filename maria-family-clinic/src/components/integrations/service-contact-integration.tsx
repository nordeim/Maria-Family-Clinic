/**
 * Service Contact Integration Component
 * Sub-Phase 9.9: Integration with Existing Features Retry
 * 
 * Seamless integration of contact system with service pages
 * - Service-specific contact forms
 * - Pre and post-service inquiries
 * - Cost and insurance inquiries
 * - Preparation and follow-up contact
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
  Stethoscope,
  Heart,
  DollarSign,
  Shield,
  Clock,
  FileText,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  Info,
  CreditCard,
  Pill,
  Activity,
  Users,
  Award,
  MapPin,
  Building,
  UserCheck
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ServiceContactIntegrationProps {
  // Service data
  service: {
    id: string
    name: string
    description: string
    category: string
    subcategory?: string
    specialties?: string[]
    mohCode?: string
    basePrice?: number
    priceRangeMin?: number
    priceRangeMax?: number
    currency: string
    isSubsidized: boolean
    isHealthierSGCovered?: boolean
    healthierSGServices?: string[]
    medisaveCoverage?: any
    medishieldCoverage?: any
    insuranceCoverage?: any
    typicalDurationMin?: number
    complexityLevel?: 'basic' | 'intermediate' | 'advanced' | 'complex'
    urgencyLevel?: 'routine' | 'urgent' | 'emergency'
    ageRequirements?: any
    genderRequirements?: string[]
    preparationSteps?: string[]
    postCareInstructions?: string[]
    successRates?: any
    riskFactors?: string[]
    commonQuestions?: Array<{
      question: string
      answer: string
    }>
    availableClinics?: Array<{
      clinicId: string
      clinicName: string
      clinicAddress: string
      price?: number
      availability?: {
        nextAvailable?: string
        waitTime?: string
      }
    }>
  }
  
  // Integration features
  onContactAction?: (action: any, context: any) => void
  showPreServiceContact?: boolean
  showPostServiceContact?: boolean
  showCostInquiry?: boolean
  showPreparationContact?: boolean
  
  // Standard props
  className?: string
}

export function ServiceContactIntegration({
  service,
  onContactAction,
  showPreServiceContact = true,
  showPostServiceContact = true,
  showCostInquiry = true,
  showPreparationContact = true,
  className
}: ServiceContactIntegrationProps) {
  const { user } = useUser();
  const { startContactSession, addContactHistory } = useContactIntegration();
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [selectedContactType, setSelectedContactType] = useState<string>('general');
  const [preparationQuestions, setPreparationQuestions] = useState<string[]>([]);
  const [postCareConcerns, setPostCareConcerns] = useState<string[]>([]);

  // Enhanced contact action handler
  const handleContactAction = (action: any) => {
    // Start contact session
    const sessionId = startContactSession({
      serviceId: service.id,
      serviceName: service.name,
      integrationType: 'service',
      userId: user?.id,
      contextData: {
        serviceCategory: service.category,
        subcategory: service.subcategory,
        specialties: service.specialties,
        mohCode: service.mohCode,
        basePrice: service.basePrice,
        isSubsidized: service.isSubsidized,
        isHealthierSGCovered: service.isHealthierSGCovered,
        typicalDurationMin: service.typicalDurationMin,
        complexityLevel: service.complexityLevel,
        urgencyLevel: service.urgencyLevel,
        preparationQuestions,
        postCareConcerns,
        availableClinics: service.availableClinics,
      }
    });

    // Add to contact history
    addContactHistory({
      type: action.type,
      category: 'service_inquiry',
      subject: `Inquiry about ${service.name}`,
      summary: `User initiated ${action.label} regarding ${service.name}`,
      status: 'pending',
      priority: action.priority || 'normal',
      contextType: 'service',
      contextId: service.id,
      contextName: service.name,
      followUpRequired: false,
      followUpCompleted: false,
    });

    // Notify parent
    onContactAction?.(action, { 
      type: 'service_contact',
      serviceId: service.id,
      serviceName: service.name,
      action: action.id,
      sessionId
    });
  };

  // Pre-service contact handlers
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

  const handleCostInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedContactType('cost');
    setIsContactDialogOpen(true);
    handleContactAction({ 
      id: 'cost_inquiry', 
      type: 'form', 
      label: 'Cost Inquiry', 
      priority: 'normal' 
    });
  };

  const handleInsuranceInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedContactType('insurance');
    setIsContactDialogOpen(true);
    handleContactAction({ 
      id: 'insurance_inquiry', 
      type: 'form', 
      label: 'Insurance Inquiry', 
      priority: 'normal' 
    });
  };

  // Post-service contact handlers
  const handlePostCareQuestions = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedContactType('post_care');
    setIsContactDialogOpen(true);
    handleContactAction({ 
      id: 'post_care_questions', 
      type: 'form', 
      label: 'Post-Care Questions', 
      priority: 'normal' 
    });
  };

  const handleComplicationReporting = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedContactType('complication');
    setIsContactDialogOpen(true);
    handleContactAction({ 
      id: 'complication_reporting', 
      type: 'form', 
      label: 'Complication Report', 
      priority: 'high' 
    });
  };

  const handleResultsDiscussion = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedContactType('results');
    setIsContactDialogOpen(true);
    handleContactAction({ 
      id: 'results_discussion', 
      type: 'form', 
      label: 'Results Discussion', 
      priority: 'normal' 
    });
  };

  // Format price
  const formatPrice = (price?: number) => {
    if (!price) return 'Contact for pricing';
    return `S$${price.toFixed(2)}`;
  };

  // Get complexity color
  const getComplexityColor = (level?: string) => {
    switch (level) {
      case 'basic': return 'text-green-600';
      case 'intermediate': return 'text-yellow-600';
      case 'advanced': return 'text-orange-600';
      case 'complex': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  // Get urgency color
  const getUrgencyColor = (level?: string) => {
    switch (level) {
      case 'routine': return 'text-green-600';
      case 'urgent': return 'text-yellow-600';
      case 'emergency': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Main Service Contact Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Contact Regarding {service.name}
          </CardTitle>
          <CardDescription>
            Get answers to your questions about {service.name} - from preparation to follow-up care.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContactIntegrationManager
            context={{
              serviceId: service.id,
              serviceName: service.name,
              integrationType: 'service',
              userId: user?.id,
              contextData: {
                serviceCategory: service.category,
                subcategory: service.subcategory,
                specialties: service.specialties,
                basePrice: service.basePrice,
                isSubsidized: service.isSubsidized,
                isHealthierSGCovered: service.isHealthierSGCovered,
                typicalDurationMin: service.typicalDurationMin,
                complexityLevel: service.complexityLevel,
                urgencyLevel: service.urgencyLevel,
                availableClinics: service.availableClinics,
              }
            }}
            onContactAction={handleContactAction}
            showQuickActions={true}
            showDetailedActions={true}
          />
        </CardContent>
      </Card>

      {/* Pre-Service Contact Options */}
      {showPreServiceContact && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Before Your {service.name}
            </CardTitle>
            <CardDescription>
              Get help preparing for your {service.name} procedure or consultation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Preparation Questions */}
            {showPreparationContact && (
              <form onSubmit={handlePreparationQuestions} className="space-y-4">
                <h3 className="font-medium">Preparation Questions</h3>
                <div className="space-y-2">
                  <Label>What would you like to know about preparing for this service?</Label>
                  <Textarea
                    placeholder="e.g., What should I bring? How should I prepare? Any restrictions?"
                    value={preparationQuestions.join('\n')}
                    onChange={(e) => setPreparationQuestions(e.target.value.split('\n').filter(q => q.trim()))}
                    className="min-h-[80px]"
                  />
                </div>
                <Button type="submit" className="w-full" variant="outline">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Ask Preparation Questions
                </Button>
              </form>
            )}

            {/* Cost and Insurance Inquiry */}
            {showCostInquiry && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <form onSubmit={handleCostInquiry} className="space-y-2">
                  <h4 className="font-medium">Cost Information</h4>
                  <p className="text-sm text-muted-foreground">
                    Get details about pricing, payment options, and financial assistance.
                  </p>
                  <Button type="submit" variant="outline" className="w-full" size="sm">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Cost Inquiry
                  </Button>
                </form>

                <form onSubmit={handleInsuranceInquiry} className="space-y-2">
                  <h4 className="font-medium">Insurance & Coverage</h4>
                  <p className="text-sm text-muted-foreground">
                    Check if your insurance covers this service or learn about subsidies.
                  </p>
                  <Button type="submit" variant="outline" className="w-full" size="sm">
                    <Shield className="h-4 w-4 mr-2" />
                    Insurance Inquiry
                  </Button>
                </form>
              </div>
            )}

            {/* Healthier SG Coverage */}
            {service.isHealthierSGCovered && (
              <Alert>
                <Heart className="h-4 w-4" />
                <AlertDescription>
                  <strong>Healthier SG Coverage:</strong> This service may be covered under the Healthier SG program. 
                  Contact us to check your eligibility and learn about subsidized rates.
                </AlertDescription>
              </Alert>
            )}

            {/* Service Information */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {service.typicalDurationMin && (
                <div>
                  <div className="text-2xl font-bold">{service.typicalDurationMin}</div>
                  <div className="text-xs text-muted-foreground">Minutes</div>
                </div>
              )}
              {service.complexityLevel && (
                <div>
                  <div className={cn("text-2xl font-bold capitalize", getComplexityColor(service.complexityLevel))}>
                    {service.complexityLevel}
                  </div>
                  <div className="text-xs text-muted-foreground">Complexity</div>
                </div>
              )}
              {service.urgencyLevel && (
                <div>
                  <div className={cn("text-2xl font-bold capitalize", getUrgencyColor(service.urgencyLevel))}>
                    {service.urgencyLevel}
                  </div>
                  <div className="text-xs text-muted-foreground">Urgency</div>
                </div>
              )}
              {service.isSubsidized && (
                <div>
                  <div className="text-2xl font-bold text-green-600">Yes</div>
                  <div className="text-xs text-muted-foreground">Subsidized</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Post-Service Contact Options */}
      {showPostServiceContact && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5" />
              After Your {service.name}
            </CardTitle>
            <CardDescription>
              Get follow-up care and support after your {service.name} procedure.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Post-Care Questions */}
            <form onSubmit={handlePostCareQuestions} className="space-y-4">
              <h3 className="font-medium">Post-Care Questions</h3>
              <div className="space-y-2">
                <Label>Any questions about your recovery or care?</Label>
                <Textarea
                  placeholder="e.g., How long is recovery? What signs to watch for?"
                  value={postCareConcerns.join('\n')}
                  onChange={(e) => setPostCareConcerns(e.target.value.split('\n').filter(q => q.trim()))}
                  className="min-h-[80px]"
                />
              </div>
              <Button type="submit" className="w-full" variant="outline">
                <HelpCircle className="h-4 w-4 mr-2" />
                Ask Post-Care Questions
              </Button>
            </form>

            {/* Follow-up Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="justify-start gap-2"
                onClick={handleResultsDiscussion}
              >
                <FileText className="h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">Results Discussion</div>
                  <div className="text-xs text-muted-foreground">Review your test results</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="justify-start gap-2"
                onClick={handleComplicationReporting}
              >
                <AlertTriangle className="h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">Report Issues</div>
                  <div className="text-xs text-muted-foreground">Report any complications</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="justify-start gap-2"
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedContactType('general');
                  setIsContactDialogOpen(true);
                }}
              >
                <Users className="h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">Satisfaction Feedback</div>
                  <div className="text-xs text-muted-foreground">Share your experience</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact Form Dialog */}
      <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Contact About {service.name}</DialogTitle>
            <DialogDescription>
              {getContactDescription(selectedContactType, service.name)}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={selectedContactType} onValueChange={setSelectedContactType} className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="preparation">Preparation</TabsTrigger>
              <TabsTrigger value="cost">Cost</TabsTrigger>
              <TabsTrigger value="insurance">Insurance</TabsTrigger>
              <TabsTrigger value="post_care">Post-Care</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
            </TabsList>
            
            {['general', 'preparation', 'cost', 'insurance', 'post_care', 'results'].map((tab) => (
              <TabsContent key={tab} value={tab} className="space-y-4">
                <ContactIntegrationManager
                  context={{
                    serviceId: service.id,
                    serviceName: service.name,
                    integrationType: 'service',
                    userId: user?.id,
                    contextData: {
                      contactType: tab,
                      serviceCategory: service.category,
                      basePrice: service.basePrice,
                      isHealthierSGCovered: service.isHealthierSGCovered,
                      preparationQuestions: tab === 'preparation' ? preparationQuestions : undefined,
                      postCareConcerns: tab === 'post_care' ? postCareConcerns : undefined,
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
function getContactDescription(contactType: string, serviceName: string): string {
  switch (contactType) {
    case 'preparation':
      return `Ask questions about preparing for ${serviceName}.`;
    case 'cost':
      return `Get information about pricing and payment options for ${serviceName}.`;
    case 'insurance':
      return `Check insurance coverage and subsidy information for ${serviceName}.`;
    case 'post_care':
      return `Get help with post-procedure care and recovery questions.`;
    case 'results':
      return `Discuss your test results and follow-up care.`;
    case 'complication':
      return `Report any concerns or complications after your ${serviceName}.`;
    default:
      return `Contact us about ${serviceName} - general inquiries, appointments, and more.`;
  }
}

export { ServiceContactIntegration };
export type { ServiceContactIntegrationProps };