// Healthcare Dashboard Component
// Sub-Phase 10.1: Advanced Analytics & Tracking System Architecture

'use client';

import React, { useMemo } from 'react';
import { RealTimeMetrics, TimeRangeKey, DashboardWidget } from '../../types/analytics.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Calendar, 
  Clock, 
  Stethoscope, 
  Award, 
  TrendingUp,
  Heart,
  Activity,
  UserCheck,
  MapPin,
  Phone,
  Star,
  Target,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
} from 'recharts';

interface HealthcareDashboardProps {
  clinicId?: string;
  metrics: RealTimeMetrics | null;
  timeRange: TimeRangeKey;
  isRealTimeActive: boolean;
  customWidgets?: DashboardWidget[];
}

// Mock healthcare-specific data
const healthcareMetrics = {
  appointmentMetrics: {
    totalAppointments: 485,
    completedAppointments: 428,
    cancelledAppointments: 35,
    noShows: 22,
    completionRate: 88.2,
    cancellationRate: 7.2,
    noShowRate: 4.5,
  },
  doctorUtilization: [
    { doctorId: 'doc_001', name: 'Dr. Sarah Lim', specialty: 'General Practice', utilization: 92.5, patients: 45, rating: 4.8 },
    { doctorId: 'doc_002', name: 'Dr. Michael Tan', specialty: 'Cardiology', utilization: 78.3, patients: 32, rating: 4.7 },
    { doctorId: 'doc_003', name: 'Dr. Priya Sharma', specialty: 'Pediatrics', utilization: 85.7, patients: 38, rating: 4.9 },
    { doctorId: 'doc_004', name: 'Dr. James Wong', specialty: 'Orthopedics', utilization: 73.2, patients: 28, rating: 4.6 },
  ],
  servicePopularity: [
    { service: 'General Consultation', appointments: 185, percentage: 38.1 },
    { service: 'Health Screening', appointments: 98, percentage: 20.2 },
    { service: 'Vaccination', appointments: 76, percentage: 15.7 },
    { service: 'Follow-up', appointments: 68, percentage: 14.0 },
    { service: 'Specialist Consultation', appointments: 58, percentage: 12.0 },
  ],
  patientSatisfaction: {
    overall: 4.6,
    byService: [
      { service: 'General Consultation', rating: 4.7, responses: 145 },
      { service: 'Health Screening', rating: 4.5, responses: 87 },
      { service: 'Vaccination', rating: 4.8, responses: 65 },
      { service: 'Follow-up', rating: 4.4, responses: 52 },
      { service: 'Specialist Consultation', rating: 4.6, responses: 43 },
    ],
    byDoctor: [
      { doctor: 'Dr. Priya Sharma', rating: 4.9, responses: 35 },
      { doctor: 'Dr. Sarah Lim', rating: 4.8, responses: 42 },
      { doctor: 'Dr. Michael Tan', rating: 4.7, responses: 28 },
      { doctor: 'Dr. James Wong', rating: 4.6, responses: 24 },
    ],
  },
  geographicDistribution: [
    { district: 'Central', patients: 195, percentage: 40.2, clinics: 8 },
    { district: 'East', patients: 148, percentage: 30.5, clinics: 6 },
    { district: 'North', patients: 87, percentage: 17.9, clinics: 4 },
    { district: 'West', patients: 55, percentage: 11.3, clinics: 3 },
  ],
  waitTimeAnalysis: {
    average: 12,
    median: 10,
    percentile90: 18,
    byTimeSlot: [
      { time: '09:00', waitTime: 8, queueLength: 3 },
      { time: '10:00', waitTime: 12, queueLength: 5 },
      { time: '11:00', waitTime: 15, queueLength: 7 },
      { time: '12:00', waitTime: 18, queueLength: 8 },
      { time: '14:00', waitTime: 10, queueLength: 4 },
      { time: '15:00', waitTime: 14, queueLength: 6 },
      { time: '16:00', waitTime: 11, queueLength: 4 },
    ],
  },
  healthPrograms: {
    healthierSg: {
      enrolled: 234,
      eligible: 450,
      enrollmentRate: 52.0,
      activeParticipants: 198,
      completionRate: 84.6,
    },
    chronicCare: {
      enrolled: 87,
      active: 78,
      adherence: 89.7,
      outcomes: 'improving',
    },
    screening: {
      scheduled: 156,
      completed: 142,
      completionRate: 91.0,
      referrals: 23,
    },
  },
  qualityMetrics: {
    patientSafetyIncidents: 2,
    medicationErrors: 0,
    adverseEvents: 1,
    qualityScore: 94.8,
    accreditationStatus: 'excellent',
  },
};

// Appointment Metrics Component
function AppointmentMetricsCard() {
  const { totalAppointments, completionRate, cancellationRate, noShowRate } = healthcareMetrics.appointmentMetrics;
  
  const getCompletionStatus = () => {
    if (completionRate >= 90) return { color: 'text-green-600', status: 'Excellent' };
    if (completionRate >= 80) return { color: 'text-blue-600', status: 'Good' };
    if (completionRate >= 70) return { color: 'text-yellow-600', status: 'Fair' };
    return { color: 'text-red-600', status: 'Poor' };
  };

  const status = getCompletionStatus();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>Appointment Metrics</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <div className={`text-3xl font-bold ${status.color}`}>
              {completionRate}%
            </div>
            <div className="text-sm text-muted-foreground">Completion Rate</div>
            <Badge variant={completionRate >= 80 ? "default" : "destructive"}>
              {status.status}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Total Appointments</span>
              <span className="font-medium">{totalAppointments}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Cancellation Rate</span>
              <span className="font-medium">{cancellationRate}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>No-Show Rate</span>
              <span className="font-medium">{noShowRate}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Doctor Utilization Component
function DoctorUtilizationCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Stethoscope className="h-5 w-5" />
          <span>Doctor Utilization</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {healthcareMetrics.doctorUtilization.map((doctor) => (
            <div key={doctor.doctorId} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{doctor.name}</div>
                  <div className="text-xs text-muted-foreground">{doctor.specialty}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{doctor.patients} patients</div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span className="text-xs">{doctor.rating}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Utilization</span>
                  <span>{doctor.utilization}%</span>
                </div>
                <Progress 
                  value={doctor.utilization} 
                  className="h-2"
                  style={{
                    background: doctor.utilization >= 80 ? '#10B98120' : 
                               doctor.utilization >= 60 ? '#F59E0B20' : '#EF444420',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Patient Satisfaction Component
function PatientSatisfactionCard() {
  const { overall } = healthcareMetrics.patientSatisfaction;

  const getSatisfactionLevel = () => {
    if (overall >= 4.5) return { color: 'text-green-600', level: 'Excellent', emoji: '🌟' };
    if (overall >= 4.0) return { color: 'text-blue-600', level: 'Good', emoji: '👍' };
    if (overall >= 3.5) return { color: 'text-yellow-600', level: 'Fair', emoji: '😐' };
    return { color: 'text-red-600', level: 'Poor', emoji: '👎' };
  };

  const satisfaction = getSatisfactionLevel();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Heart className="h-5 w-5" />
          <span>Patient Satisfaction</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <div className={`text-3xl font-bold ${satisfaction.color}`}>
              {overall.toFixed(1)}/5.0
            </div>
            <div className="text-lg">{satisfaction.emoji}</div>
            <Badge variant="default">
              {satisfaction.level}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">By Service Type:</h4>
            {healthcareMetrics.patientSatisfaction.byService.slice(0, 3).map((item) => (
              <div key={item.service} className="flex justify-between text-sm">
                <span className="truncate">{item.service}</span>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{item.rating}</span>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-3 w-3 ${
                          i < Math.floor(item.rating) ? 'text-yellow-500 fill-current' : 'text-gray-300'
                        }`} 
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Service Popularity Chart Component
function ServicePopularityChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Popularity</CardTitle>
        <CardDescription>
          Appointment distribution by service type
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={healthcareMetrics.servicePopularity}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="service" 
              angle={-45}
              textAnchor="end"
              height={80}
              fontSize={12}
            />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [
                `${value} appointments (${healthcareMetrics.servicePopularity.find(s => s.appointments === value)?.percentage}%)`,
                'Appointments'
              ]}
            />
            <Bar dataKey="appointments" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Wait Time Analysis Component
function WaitTimeAnalysisChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Wait Time Analysis</CardTitle>
        <CardDescription>
          Average wait times by time slot
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-3 gap-4 text-center">
          <div className="p-2 border rounded">
            <div className="text-lg font-bold text-blue-600">{healthcareMetrics.waitTimeAnalysis.average}min</div>
            <div className="text-xs text-muted-foreground">Average</div>
          </div>
          <div className="p-2 border rounded">
            <div className="text-lg font-bold text-green-600">{healthcareMetrics.waitTimeAnalysis.median}min</div>
            <div className="text-xs text-muted-foreground">Median</div>
          </div>
          <div className="p-2 border rounded">
            <div className="text-lg font-bold text-orange-600">{healthcareMetrics.waitTimeAnalysis.percentile90}min</div>
            <div className="text-xs text-muted-foreground">90th Percentile</div>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={healthcareMetrics.waitTimeAnalysis.byTimeSlot}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="waitTime" 
              stroke="#EF4444" 
              strokeWidth={2}
              name="Wait Time (min)"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Health Programs Component
function HealthProgramsCard() {
  const { healthierSg, chronicCare, screening } = healthcareMetrics.healthPrograms;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <span>Health Programs</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-3 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Healthier SG</h4>
              <Badge variant="default">{healthierSg.enrollmentRate}% Enrolled</Badge>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Enrolled:</span>
                <span>{healthierSg.enrolled}/{healthierSg.eligible}</span>
              </div>
              <div className="flex justify-between">
                <span>Active Participants:</span>
                <span>{healthierSg.activeParticipants}</span>
              </div>
              <div className="flex justify-between">
                <span>Completion Rate:</span>
                <span>{healthierSg.completionRate}%</span>
              </div>
            </div>
          </div>

          <div className="p-3 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Chronic Care Management</h4>
              <Badge variant="outline">{chronicCare.adherence}% Adherence</Badge>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Enrolled:</span>
                <span>{chronicCare.enrolled}</span>
              </div>
              <div className="flex justify-between">
                <span>Active:</span>
                <span>{chronicCare.active}</span>
              </div>
              <div className="flex justify-between">
                <span>Outcomes:</span>
                <span className="capitalize">{chronicCare.outcomes}</span>
              </div>
            </div>
          </div>

          <div className="p-3 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Health Screening</h4>
              <Badge variant="secondary">{screening.completionRate}% Complete</Badge>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Scheduled:</span>
                <span>{screening.scheduled}</span>
              </div>
              <div className="flex justify-between">
                <span>Completed:</span>
                <span>{screening.completed}</span>
              </div>
              <div className="flex justify-between">
                <span>Referrals:</span>
                <span>{screening.referrals}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Geographic Distribution Component
function GeographicDistributionCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="h-5 w-5" />
          <span>Patient Distribution</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {healthcareMetrics.geographicDistribution.map((region) => (
            <div key={region.district} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">{region.district}</span>
                  <div className="text-xs text-muted-foreground">
                    {region.clinics} clinic{region.clinics !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{region.patients} patients</div>
                  <div className="text-xs text-muted-foreground">{region.percentage}%</div>
                </div>
              </div>
              <Progress value={region.percentage} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Quality Metrics Component
function QualityMetricsCard() {
  const { qualityScore, accreditationStatus } = healthcareMetrics.qualityMetrics;
  const getQualityLevel = () => {
    if (qualityScore >= 95) return { color: 'text-green-600', level: 'Excellent' };
    if (qualityScore >= 90) return { color: 'text-blue-600', level: 'Good' };
    if (qualityScore >= 85) return { color: 'text-yellow-600', level: 'Fair' };
    return { color: 'text-red-600', level: 'Poor' };
  };

  const quality = getQualityLevel();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Award className="h-5 w-5" />
          <span>Quality Metrics</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <div className={`text-3xl font-bold ${quality.color}`}>
              {qualityScore}%
            </div>
            <div className="text-sm text-muted-foreground">Quality Score</div>
            <Badge variant="default">
              {quality.level}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Patient Safety Incidents</span>
              <span className="font-medium">{healthcareMetrics.qualityMetrics.patientSafetyIncidents}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Medication Errors</span>
              <span className="font-medium text-green-600">
                {healthcareMetrics.qualityMetrics.medicationErrors}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Adverse Events</span>
              <span className="font-medium">{healthcareMetrics.qualityMetrics.adverseEvents}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Accreditation Status</span>
              <Badge variant="outline">{accreditationStatus}</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Main Healthcare Dashboard Component
export function HealthcareDashboard({
  clinicId,
  metrics,
  timeRange,
  isRealTimeActive,
  customWidgets,
}: HealthcareDashboardProps) {
  // Calculate real-time healthcare status
  const healthcareStatus = useMemo(() => {
    if (!metrics) return null;

    return {
      capacity: metrics.concurrentAppointments > 100 ? 'high' : 'normal',
      demand: metrics.activeUsers > 500 ? 'high' : 'moderate',
      efficiency: metrics.currentLoadTime < 2000 ? 'optimal' : 'degraded',
    };
  }, [metrics]);

  if (customWidgets && customWidgets.length > 0) {
    return (
      <div className="space-y-6">
        {customWidgets.map((widget) => (
          <Card key={widget.id}>
            <CardHeader>
              <CardTitle>{widget.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div dangerouslySetInnerHTML={{ __html: widget.dataSource }} />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Real-time Healthcare Status */}
      {metrics && healthcareStatus && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`flex items-center space-x-2 p-3 border rounded-lg ${
            healthcareStatus.capacity === 'normal' ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
          }`}>
            <Users className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">
              Current Appointments: {metrics.concurrentAppointments}
            </span>
          </div>
          <div className={`flex items-center space-x-2 p-3 border rounded-lg ${
            healthcareStatus.demand === 'moderate' ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'
          }`}>
            <Activity className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium">
              Patient Demand: {healthcareStatus.demand}
            </span>
          </div>
          <div className={`flex items-center space-x-2 p-3 border rounded-lg ${
            healthcareStatus.efficiency === 'optimal' ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
          }`}>
            <Clock className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">
              Operational Efficiency: {healthcareStatus.efficiency}
            </span>
          </div>
        </div>
      )}

      {/* Key Healthcare Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <AppointmentMetricsCard />
        <DoctorUtilizationCard />
        <PatientSatisfactionCard />
        <QualityMetricsCard />
      </div>

      {/* Charts and Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ServicePopularityChart />
        <WaitTimeAnalysisChart />
      </div>

      {/* Additional Healthcare Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HealthProgramsCard />
        <GeographicDistributionCard />
      </div>

      {/* Healthcare Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Healthcare Operations Summary</CardTitle>
          <CardDescription>
            Key metrics and insights for healthcare management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-3 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                Performance Highlights
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center justify-between">
                  <span>Appointment Completion Rate</span>
                  <Badge variant="default">88.2%</Badge>
                </li>
                <li className="flex items-center justify-between">
                  <span>Patient Satisfaction</span>
                  <Badge variant="default">4.6/5.0</Badge>
                </li>
                <li className="flex items-center justify-between">
                  <span>Quality Score</span>
                  <Badge variant="default">94.8%</Badge>
                </li>
                <li className="flex items-center justify-between">
                  <span>Healthier SG Enrollment</span>
                  <Badge variant="secondary">52.0%</Badge>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 flex items-center">
                <Target className="h-4 w-4 mr-2 text-blue-600" />
                Key Performance Indicators
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center justify-between">
                  <span>Average Wait Time</span>
                  <span className="font-medium">12 minutes</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Doctor Utilization</span>
                  <span className="font-medium">82.4%</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>No-Show Rate</span>
                  <span className="font-medium">4.5%</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Active Health Programs</span>
                  <span className="font-medium">3 Programs</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 flex items-center">
                <Star className="h-4 w-4 mr-2 text-yellow-600" />
                Quality & Safety
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center justify-between">
                  <span>Patient Safety Incidents</span>
                  <Badge variant="outline">2 (Low)</Badge>
                </li>
                <li className="flex items-center justify-between">
                  <span>Medication Errors</span>
                  <Badge variant="outline">0 (Zero)</Badge>
                </li>
                <li className="flex items-center justify-between">
                  <span>Accreditation Status</span>
                  <Badge variant="default">Excellent</Badge>
                </li>
                <li className="flex items-center justify-between">
                  <span>Patient Safety Score</span>
                  <Badge variant="secondary">98.5%</Badge>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}