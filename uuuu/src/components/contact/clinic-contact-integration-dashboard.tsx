// ========================================
// CLINIC CONTACT INTEGRATION DASHBOARD
// Sub-Phase 9.4: Main Dashboard for Clinic-Specific Contact Management
// Healthcare Platform Contact System Design
// ========================================

"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  MessageSquare, 
  Users, 
  MapPin, 
  Settings, 
  BarChart3, 
  HelpCircle,
  Route,
  Clock,
  Phone,
  Mail,
  Star,
  TrendingUp,
  Activity,
  CheckCircle,
  AlertCircle,
  Settings2,
  Sparkles,
  Target,
  Zap
} from 'lucide-react';

// Import child components
import { ClinicSpecificContactForm } from './clinic-specific-contact-form';
import { 
  LocationContactRouting, 
  ClinicContactAssignment, 
  ContactRoutingRulesManager 
} from './clinic-contact-routing';
import { ClinicContactMetricsDashboard } from './clinic-contact-metrics';
import { ClinicContactFAQ, ContactFormAutoSuggestions } from './clinic-contact-faq';

interface ClinicContactIntegrationDashboardProps {
  clinicId: string;
  clinicName: string;
  isAdmin?: boolean;
  onClose?: () => void;
}

interface DashboardState {
  activeTab: string;
  realTimeMetrics: any;
  recentEnquiries: any[];
  staffAvailability: any[];
  isLoading: boolean;
}

/**
 * Main Clinic Contact Integration Dashboard
 */
export function ClinicContactIntegrationDashboard({ 
  clinicId, 
  clinicName, 
  isAdmin = false,
  onClose 
}: ClinicContactIntegrationDashboardProps) {
  const [dashboardState, setDashboardState] = useState<DashboardState>({
    activeTab: 'overview',
    realTimeMetrics: null,
    recentEnquiries: [],
    staffAvailability: [],
    isLoading: true
  });

  const [contactFormData, setContactFormData] = useState<any>(null);
  const [autoSuggestions, setAutoSuggestions] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
  }, [clinicId]);

  const loadDashboardData = async () => {
    setDashboardState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Load real-time metrics
      const metricsResponse = await fetch(`/api/clinic-contact-integration/metrics/get-real-time-metrics?clinicId=${clinicId}`);
      const metrics = await metricsResponse.json();

      // Load recent enquiries
      const enquiriesResponse = await fetch(`/api/clinic-contact-integration/contact-history/get-recent-enquiries?clinicId=${clinicId}&limit=10`);
      const enquiries = await enquiriesResponse.json();

      // Load staff availability
      const staffResponse = await fetch(`/api/clinic-contact-integration/contact-settings/get-staff-availability?clinicId=${clinicId}`);
      const staff = await staffResponse.json();

      setDashboardState(prev => ({
        ...prev,
        realTimeMetrics: metrics,
        recentEnquiries: enquiries,
        staffAvailability: staff,
        isLoading: false
      }));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setDashboardState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleContactFormSubmit = async (data: any) => {
    try {
      const response = await fetch('/api/clinic-contact-integration/contact-forms/submit-personalized-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      
      // Update dashboard with new submission
      await loadDashboardData();
      
      return result;
    } catch (error) {
      console.error('Failed to submit contact form:', error);
      throw error;
    }
  };

  const handleClinicSelect = (clinic: any) => {
    setSelectedContact(clinic);
    setDashboardState(prev => ({ ...prev, activeTab: 'contact-form' }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'RESOLVED':
        return 'text-green-600';
      case 'IN_PROGRESS':
      case 'ASSIGNED':
        return 'text-blue-600';
      case 'ESCALATED':
      case 'URGENT':
        return 'text-orange-600';
      case 'OVERDUE':
      case 'CRITICAL':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'RESOLVED':
        return <CheckCircle className="h-4 w-4" />;
      case 'IN_PROGRESS':
      case 'ASSIGNED':
        return <Clock className="h-4 w-4" />;
      case 'ESCALATED':
      case 'URGENT':
        return <AlertCircle className="h-4 w-4" />;
      case 'OVERDUE':
      case 'CRITICAL':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-6 w-6" />
                {clinicName} - Contact Integration Dashboard
              </CardTitle>
              <CardDescription>
                Comprehensive contact management with clinic-specific personalization
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                <Activity className="h-3 w-3 mr-1" />
                Live
              </Badge>
              {isAdmin && (
                <Button variant="outline" size="sm">
                  <Settings2 className="h-4 w-4 mr-2" />
                  Configure
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Stats Overview */}
      {dashboardState.realTimeMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Today's Enquiries</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {dashboardState.realTimeMetrics.todayEnquiries}
                  </p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {dashboardState.realTimeMetrics.responseRate.toFixed(1)}% response rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Cases</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {dashboardState.realTimeMetrics.activeAssignments}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-orange-500" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Being processed now
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Response</p>
                  <p className="text-2xl font-bold text-green-600">
                    {dashboardState.realTimeMetrics.avgResponseTime}m
                  </p>
                </div>
                <Clock className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Today average
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Staff Available</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {dashboardState.staffAvailability.filter(s => s.isAvailable).length}
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Ready to assist
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Dashboard Tabs */}
      <Tabs value={dashboardState.activeTab} onValueChange={(value) => 
        setDashboardState(prev => ({ ...prev, activeTab: value }))
      }>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contact-form">Contact Form</TabsTrigger>
          <TabsTrigger value="routing">Routing</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Enquiries */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Recent Enquiries
                </CardTitle>
                <CardDescription>
                  Latest contact form submissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardState.recentEnquiries.slice(0, 5).map((enquiry) => (
                    <div key={enquiry.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <div className={getStatusColor(enquiry.status)}>
                          {getStatusIcon(enquiry.status)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{enquiry.title || 'Contact Form'}</p>
                          <p className="text-xs text-gray-600">
                            {enquiry.contactName} • {new Date(enquiry.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {enquiry.priority || 'Normal'}
                      </Badge>
                    </div>
                  ))}
                  {dashboardState.recentEnquiries.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No recent enquiries</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Staff Availability */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Staff Availability
                </CardTitle>
                <CardDescription>
                  Current staff status and workload
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardState.staffAvailability.slice(0, 5).map((staff) => (
                    <div key={staff.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${staff.isAvailable ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <div>
                          <p className="font-medium text-sm">{staff.staffName}</p>
                          <p className="text-xs text-gray-600">{staff.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {staff.currentWorkload || 0}/{staff.maxWorkload || 20}
                        </p>
                        <p className="text-xs text-gray-600">active cases</p>
                      </div>
                    </div>
                  ))}
                  {dashboardState.staffAvailability.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No staff data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center gap-2"
                  onClick={() => setDashboardState(prev => ({ ...prev, activeTab: 'contact-form' }))}
                >
                  <MessageSquare className="h-6 w-6" />
                  <span className="text-sm">New Contact</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center gap-2"
                  onClick={() => setDashboardState(prev => ({ ...prev, activeTab: 'routing' }))}
                >
                  <MapPin className="h-6 w-6" />
                  <span className="text-sm">Find Clinics</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center gap-2"
                  onClick={() => setDashboardState(prev => ({ ...prev, activeTab: 'metrics' }))}
                >
                  <BarChart3 className="h-6 w-6" />
                  <span className="text-sm">View Metrics</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center gap-2"
                  onClick={() => setDashboardState(prev => ({ ...prev, activeTab: 'faq' }))}
                >
                  <HelpCircle className="h-6 w-6" />
                  <span className="text-sm">Manage FAQ</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Form Tab */}
        <TabsContent value="contact-form" className="space-y-6">
          <ClinicSpecificContactForm
            clinicId={clinicId}
            clinicName={clinicName}
            onSubmit={handleContactFormSubmit}
            onSubmitSuccess={(result) => {
              console.log('Form submitted successfully:', result);
              // Show success notification
            }}
            onSubmitError={(error) => {
              console.error('Form submission error:', error);
              // Show error notification
            }}
          />
        </TabsContent>

        {/* Routing Tab */}
        <TabsContent value="routing" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LocationContactRouting
              onClinicSelect={handleClinicSelect}
            />
            <ContactRoutingRulesManager
              clinicId={clinicId}
            />
          </div>
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="space-y-6">
          <ClinicContactAssignment
            clinicId={clinicId}
          />
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-6">
          <ClinicContactMetricsDashboard
            clinicId={clinicId}
          />
        </TabsContent>

        {/* FAQ Tab */}
        <TabsContent value="faq" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ClinicContactFAQ
              clinicId={clinicId}
              onFAQSelect={(faq) => {
                console.log('FAQ selected:', faq);
              }}
            />
            {isAdmin && (
              <div>
                <h3 className="text-lg font-semibold mb-4">FAQ Management</h3>
                <Alert>
                  <HelpCircle className="h-4 w-4" />
                  <AlertDescription>
                    FAQ management is available in the full admin interface.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Contact Form Auto-suggestions */}
      {contactFormData && (
        <ContactFormAutoSuggestions
          clinicId={clinicId}
          contactContent={contactFormData.message || ''}
          serviceType={contactFormData.serviceContext}
          onSuggestionSelect={(suggestion) => {
            console.log('Auto-suggestion selected:', suggestion);
          }}
        />
      )}
    </div>
  );
}

export default ClinicContactIntegrationDashboard;
