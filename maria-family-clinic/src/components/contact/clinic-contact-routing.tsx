// ========================================
// CLINIC CONTACT ROUTING & ASSIGNMENT SYSTEM
// Sub-Phase 9.4: Location-based Routing and Intelligent Assignment
// Healthcare Platform Contact System Design
// ========================================

"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  MapPin, 
  Navigation, 
  Users, 
  Clock, 
  Target, 
  Route,
  Star,
  Phone,
  Mail,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface ClinicContactRoutingProps {
  onRouteCalculated?: (routing: ContactRoutingResult) => void;
  onClinicSelected?: (clinic: any) => void;
}

interface ContactRoutingResult {
  rankedClinics: Array<{
    clinic: any;
    score: number;
    reason: string[];
    serviceArea: any;
    distance: number;
    estimatedTravelTime: number;
  }>;
  recommendedClinic: any;
  alternativeOptions: any[];
}

interface LocationRoutingProps {
  userLocation?: {
    postalCode: string;
    latitude: number;
    longitude: number;
  };
  serviceType?: string;
  conditionType?: string;
  urgencyLevel?: string;
  patientAge?: number;
  hasInsurance?: boolean;
  preferredLanguage?: string;
  onClinicSelect?: (clinic: any) => void;
}

/**
 * Location-based Contact Routing Component
 * Finds the best clinic based on geographic location and service requirements
 */
export function LocationContactRouting({ 
  userLocation, 
  serviceType, 
  conditionType, 
  urgencyLevel,
  patientAge,
  hasInsurance,
  preferredLanguage = 'en',
  onClinicSelect 
}: LocationRoutingProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [routingResults, setRoutingResults] = useState<ContactRoutingResult | null>(null);
  const [selectedPostalCode, setSelectedPostalCode] = useState(userLocation?.postalCode || '');
  const [searchRadius, setSearchRadius] = useState(10); // km

  const handleLocationRouting = async () => {
    if (!selectedPostalCode) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/clinic-contact-integration/routing/find-best-clinic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postalCode: selectedPostalCode,
          serviceType,
          conditionType,
          urgencyLevel,
          patientAge,
          hasInsurance,
          preferredLanguage
        })
      });

      const results = await response.json();
      setRoutingResults(results);
      
      if (results.recommendedClinic && onClinicSelect) {
        onClinicSelect(results.recommendedClinic);
      }
    } catch (error) {
      console.error('Routing calculation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Navigation className="h-5 w-5" />
          Find Best Clinic for Contact
        </CardTitle>
        <CardDescription>
          Get personalized clinic recommendations based on your location and needs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Location Input */}
        <div>
          <Label htmlFor="postalCode">Your Postal Code</Label>
          <div className="flex gap-2">
            <Input
              id="postalCode"
              value={selectedPostalCode}
              onChange={(e) => setSelectedPostalCode(e.target.value)}
              placeholder="e.g., 123456"
              className="flex-1"
            />
            <Button 
              onClick={handleLocationRouting}
              disabled={isLoading || !selectedPostalCode}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <MapPin className="h-4 w-4 mr-2" />
                  Find Clinics
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Search Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Service Type</Label>
            <Select value={serviceType || ''} onValueChange={() => {}}>
              <SelectTrigger>
                <SelectValue placeholder="Any service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any service</SelectItem>
                <SelectItem value="general_consultation">General Consultation</SelectItem>
                <SelectItem value="healthier_sg">Healthier SG Program</SelectItem>
                <SelectItem value="vaccination">Vaccination</SelectItem>
                <SelectItem value="health_screening">Health Screening</SelectItem>
                <SelectItem value="specialist">Specialist Care</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Urgency Level</Label>
            <Select value={urgencyLevel || ''} onValueChange={() => {}}>
              <SelectTrigger>
                <SelectValue placeholder="Normal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Normal</SelectItem>
                <SelectItem value="HIGH">High Priority</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
                <SelectItem value="EMERGENCY">Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Routing Results */}
        {routingResults && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <h3 className="font-semibold">Recommended Clinics</h3>
            </div>

            {/* Recommended Clinic */}
            {routingResults.recommendedClinic && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-green-900">
                      ⭐ Recommended: {routingResults.recommendedClinic.clinic.name}
                    </h4>
                    <p className="text-sm text-green-700">
                      {routingResults.recommendedClinic.reason.join(' • ')}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-green-600">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {routingResults.recommendedClinic.distance.toFixed(1)}km away
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {routingResults.recommendedClinic.estimatedTravelTime} min travel
                      </span>
                    </div>
                  </div>
                  <Button 
                    size="sm"
                    onClick={() => onClinicSelect?.(routingResults.recommendedClinic.clinic)}
                  >
                    Contact Clinic
                  </Button>
                </div>
              </div>
            )}

            {/* Alternative Options */}
            <div className="space-y-2">
              {routingResults.alternativeOptions.map((option, index) => (
                <div 
                  key={index} 
                  className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                  onClick={() => onClinicSelect?.(option.clinic)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium">{option.clinic.name}</h5>
                      <p className="text-sm text-gray-600">{option.reason.join(' • ')}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                        <span>{option.distance.toFixed(1)}km</span>
                        <span>{option.estimatedTravelTime} min travel</span>
                        <Badge variant="outline">
                          Score: {option.score}
                        </Badge>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Contact
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Clinic Contact Assignment Dashboard
 * Manages staff assignments and workload distribution
 */
export function ClinicContactAssignment({ 
  clinicId,
  onAssignmentUpdate 
}: { 
  clinicId: string;
  onAssignmentUpdate?: (assignment: any) => void;
}) {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadAssignments();
    loadStaff();
  }, [clinicId]);

  const loadAssignments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/clinic-contact-integration/contact-settings/get-assignments?clinicId=${clinicId}`);
      const data = await response.json();
      setAssignments(data);
    } catch (error) {
      console.error('Failed to load assignments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStaff = async () => {
    try {
      const response = await fetch(`/api/clinic-contact-integration/contact-settings/get-staff?clinicId=${clinicId}`);
      const data = await response.json();
      setStaff(data);
    } catch (error) {
      console.error('Failed to load staff:', error);
    }
  };

  const getWorkloadColor = (percentage: number) => {
    if (percentage < 50) return 'text-green-600';
    if (percentage < 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getWorkloadBadge = (percentage: number) => {
    if (percentage < 50) return 'default';
    if (percentage < 80) return 'secondary';
    return 'destructive';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading assignments...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Contact Assignment Dashboard
        </CardTitle>
        <CardDescription>
          Monitor staff workload and manage contact assignments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Assignment Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              <h4 className="font-semibold text-blue-900">Active Assignments</h4>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {assignments.filter(a => a.status === 'ACTIVE').length}
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h4 className="font-semibold text-green-900">Completed Today</h4>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {assignments.filter(a => a.status === 'COMPLETED').length}
            </p>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <h4 className="font-semibold text-yellow-900">Avg Response Time</h4>
            </div>
            <p className="text-2xl font-bold text-yellow-600">
              {Math.round(assignments.reduce((sum, a) => sum + (a.avgResponseTime || 0), 0) / assignments.length || 0)}m
            </p>
          </div>
        </div>

        {/* Staff Workload */}
        <div className="space-y-3">
          <h4 className="font-semibold">Staff Workload</h4>
          {staff.map((member) => {
            const memberAssignments = assignments.filter(a => a.staffId === member.id);
            const workloadPercentage = (memberAssignments.length / member.maxWorkload) * 100;
            
            return (
              <div key={member.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium">{member.staffName}</h5>
                    <p className="text-sm text-gray-600">{member.role} • {member.department}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={getWorkloadBadge(workloadPercentage)}>
                      {memberAssignments.length}/{member.maxWorkload}
                    </Badge>
                    <p className={`text-sm mt-1 ${getWorkloadColor(workloadPercentage)}`}>
                      {workloadPercentage.toFixed(0)}% capacity
                    </p>
                  </div>
                </div>
                
                {/* Workload Bar */}
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        workloadPercentage < 50 ? 'bg-green-500' : 
                        workloadPercentage < 80 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(workloadPercentage, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Recent Assignments */}
                <div className="mt-3">
                  <p className="text-sm font-medium mb-2">Recent Assignments:</p>
                  <div className="space-y-1">
                    {memberAssignments.slice(0, 3).map((assignment) => (
                      <div key={assignment.id} className="flex items-center justify-between text-sm">
                        <span className="truncate">{assignment.enquiry?.title || 'Contact Form'}</span>
                        <Badge 
                          variant={assignment.status === 'COMPLETED' ? 'default' : 'secondary'}
                          className="ml-2"
                        >
                          {assignment.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="border-t pt-4">
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              <Route className="h-4 w-4 mr-2" />
              Rebalance Workload
            </Button>
            <Button size="sm" variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Manage Staff
            </Button>
            <Button size="sm" variant="outline">
              <Clock className="h-4 w-4 mr-2" />
              Update Hours
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Contact Routing Rules Manager
 * Configure automatic routing rules for the clinic
 */
export function ContactRoutingRulesManager({ 
  clinicId,
  onRulesUpdate 
}: { 
  clinicId: string;
  onRulesUpdate?: (rules: any[]) => void;
}) {
  const [rules, setRules] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newRule, setNewRule] = useState({
    ruleName: '',
    description: '',
    serviceTypes: [] as string[],
    urgencyLevels: [] as string[],
    languages: [] as string[],
    priority: 0,
    isActive: true
  });

  useEffect(() => {
    loadRules();
  }, [clinicId]);

  const loadRules = async () => {
    try {
      const response = await fetch(`/api/clinic-contact-integration/routing/get-routing-rules?clinicId=${clinicId}`);
      const data = await response.json();
      setRules(data);
    } catch (error) {
      console.error('Failed to load routing rules:', error);
    }
  };

  const addRule = async () => {
    try {
      const response = await fetch(`/api/clinic-contact-integration/routing/update-routing-rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicId,
          rules: [...rules, { ...newRule, id: `temp-${Date.now()}` }]
        })
      });

      if (response.ok) {
        await loadRules();
        setNewRule({
          ruleName: '',
          description: '',
          serviceTypes: [],
          urgencyLevels: [],
          languages: [],
          priority: 0,
          isActive: true
        });
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to add rule:', error);
    }
  };

  const toggleRule = async (ruleId: string, isActive: boolean) => {
    try {
      const updatedRules = rules.map(rule => 
        rule.id === ruleId ? { ...rule, isActive } : rule
      );

      const response = await fetch(`/api/clinic-contact-integration/routing/update-routing-rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clinicId, rules: updatedRules })
      });

      if (response.ok) {
        await loadRules();
      }
    } catch (error) {
      console.error('Failed to update rule:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Route className="h-5 w-5" />
            Contact Routing Rules
          </span>
          <Button 
            size="sm" 
            onClick={() => setIsEditing(!isEditing)}
            variant={isEditing ? "secondary" : "default"}
          >
            {isEditing ? 'Cancel' : 'Add Rule'}
          </Button>
        </CardTitle>
        <CardDescription>
          Configure automatic routing rules for incoming contact forms
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Rule Form */}
        {isEditing && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <h4 className="font-semibold">Add New Routing Rule</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Rule Name</Label>
                <Input
                  value={newRule.ruleName}
                  onChange={(e) => setNewRule({ ...newRule, ruleName: e.target.value })}
                  placeholder="e.g., Healthier SG Priority"
                />
              </div>

              <div>
                <Label>Priority (lower = higher priority)</Label>
                <Input
                  type="number"
                  value={newRule.priority}
                  onChange={(e) => setNewRule({ ...newRule, priority: parseInt(e.target.value) })}
                  min="0"
                />
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Input
                value={newRule.description}
                onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                placeholder="Describe when this rule applies"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={addRule} size="sm">
                Save Rule
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Existing Rules */}
        <div className="space-y-3">
          {rules.map((rule) => (
            <div key={rule.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h5 className="font-medium">{rule.ruleName}</h5>
                    <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                      Priority {rule.priority}
                    </Badge>
                    {rule.isActive ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                  
                  {rule.serviceTypes.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      <span className="text-xs text-gray-500">Services:</span>
                      {rule.serviceTypes.map((service, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                
                <Button
                  size="sm"
                  variant={rule.isActive ? "secondary" : "default"}
                  onClick={() => toggleRule(rule.id, !rule.isActive)}
                >
                  {rule.isActive ? 'Disable' : 'Enable'}
                </Button>
              </div>

              {/* Performance Metrics */}
              <div className="flex items-center gap-4 mt-3 pt-3 border-t text-sm text-gray-600">
                <span>Used {rule.usageCount || 0} times</span>
                <span>Success: {rule.successRate || 0}%</span>
                <span>Avg Response: {rule.avgResponseTime || 0}m</span>
                {rule.successRate > 80 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : rule.successRate < 60 ? (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                ) : (
                  <Minus className="h-4 w-4 text-yellow-500" />
                )}
              </div>
            </div>
          ))}
        </div>

        {rules.length === 0 && !isEditing && (
          <div className="text-center py-8 text-gray-500">
            <Route className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No routing rules configured</p>
            <p className="text-sm">Add your first rule to start automatic contact routing</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default {
  LocationContactRouting,
  ClinicContactAssignment,
  ContactRoutingRulesManager
};
