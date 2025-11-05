// Healthcare Analytics Types for My Family Clinic
// Sub-Phase 10.1: Advanced Analytics & Tracking System Architecture

export interface HealthcareAnalyticsEvent {
  id: string;
  eventType: HealthcareEventType;
  eventName: string;
  sessionId: string;
  userId?: string;
  pageUrl: string;
  clinicId?: string;
  doctorId?: string;
  serviceId?: string;
  appointmentId?: string;
  enquiryId?: string;
  healthierSgEnrolmentId?: string;
  timestamp: Date;
  metadata: HealthcareEventMetadata;
  performanceMetrics: HealthcarePerformanceMetrics;
  userAgent: string;
  deviceInfo: DeviceInfo;
  location: GeolocationData;
  // PDPA compliance
  anonymized: boolean;
  ipAnonymized: boolean;
}

export interface HealthcareEventMetadata {
  userType: 'patient' | 'doctor' | 'clinic_staff' | 'visitor';
  clinicCategory?: 'general' | 'specialist' | 'healthier_sg';
  serviceCategory?: 'primary_care' | 'health_screening' | 'vaccination' | 'consultation';
  doctorSpecialty?: string;
  appointmentType?: 'walk_in' | 'scheduled' | 'telemedicine';
  enquiryCategory?: string;
  conversionStage?: 'awareness' | 'consideration' | 'decision' | 'booking' | 'completed';
  referrerSource?: 'google' | 'social' | 'direct' | 'referral';
}

export interface HealthcarePerformanceMetrics {
  loadTime: number;
  renderTime: number;
  interactionTime: number;
  searchDuration?: number;
  bookingTime?: number;
  clinicViewDuration?: number;
  doctorProfileViewDuration?: number;
  serviceViewDuration?: number;
  formCompletionTime?: number;
  appointmentBookingTime?: number;
  eligibilityCheckTime?: number;
}

export enum HealthcareEventType {
  // Clinic Discovery & Search
  CLINIC_SEARCH = 'clinic_search',
  CLINIC_FILTER = 'clinic_filter',
  CLINIC_VIEW = 'clinic_view',
  CLINIC_MAP_VIEW = 'clinic_map_view',
  CLINIC_CONTACT_CLICK = 'clinic_contact_click',
  
  // Doctor Discovery
  DOCTOR_SEARCH = 'doctor_search',
  DOCTOR_VIEW = 'doctor_view',
  DOCTOR_PROFILE_VIEW = 'doctor_profile_view',
  DOCTOR_BOOK_APPOINTMENT = 'doctor_book_appointment',
  DOCTOR_CONTACT_CLICK = 'doctor_contact_click',
  DOCTOR_REVIEW_VIEW = 'doctor_review_view',
  
  // Service Exploration
  SERVICE_SEARCH = 'service_search',
  SERVICE_VIEW = 'service_view',
  SERVICE_CLINIC_FINDER = 'service_clinic_finder',
  SERVICE_BOOKING = 'service_booking',
  SERVICE_COMPARE = 'service_compare',
  
  // Healthier SG Integration
  HEALTHIER_SG_ENROLLMENT_START = 'healthier_sg_enrollment_start',
  HEALTHIER_SG_ENROLLMENT_COMPLETE = 'healthier_sg_enrollment_complete',
  HEALTHIER_SG_ELIGIBILITY_CHECK = 'healthier_sg_eligibility_check',
  HEALTHIER_SG_BENEFITS_VIEW = 'healthier_sg_benefits_view',
  HEALTHIER_SG_PROGRAM_INFO_VIEW = 'healthier_sg_program_info_view',
  HEALTHIER_SG_BOOK_APPOINTMENT = 'healthier_sg_book_appointment',
  
  // Appointment Booking
  APPOINTMENT_BOOKING_START = 'appointment_booking_start',
  APPOINTMENT_BOOKING_COMPLETE = 'appointment_booking_complete',
  APPOINTMENT_BOOKING_ABANDON = 'appointment_booking_abandon',
  APPOINTMENT_SLOT_SELECT = 'appointment_slot_select',
  APPOINTMENT_RESCHEDULE = 'appointment_reschedule',
  APPOINTMENT_CANCEL = 'appointment_cancel',
  
  // Contact & Enquiries
  CONTACT_FORM_VIEW = 'contact_form_view',
  CONTACT_FORM_SUBMIT = 'contact_form_submit',
  ENQUIRY_SUBMIT = 'enquiry_submit',
  ENQUIRY_RESPONSE_VIEW = 'enquiry_response_view',
  PHONE_CLICK = 'phone_click',
  EMAIL_CLICK = 'email_click',
  WHATSAPP_CLICK = 'whatsapp_click',
  
  // Geographic Analytics
  LOCATION_SEARCH = 'location_search',
  NEAR_ME_SEARCH = 'near_me_search',
  DISTRICT_FILTER = 'district_filter',
  CLINIC_DISTANCE_CALCULATION = 'clinic_distance_calculation',
  
  // Performance Events
  SLOW_LOAD = 'slow_load',
  SEARCH_TIMEOUT = 'search_timeout',
  BOOKING_ERROR = 'booking_error',
  JS_ERROR = 'js_error',
  NETWORK_ERROR = 'network_error',
  
  // A/B Testing
  AB_TEST_VARIANT_DISPLAY = 'ab_test_variant_display',
  AB_TEST_CONVERSION = 'ab_test_conversion',
}

export interface HealthcareKPI {
  name: string;
  category: 'clinical' | 'operational' | 'user_experience' | 'business';
  currentValue: number;
  targetValue: number;
  unit: string;
  trend: 'improving' | 'declining' | 'stable';
  changePercentage: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  lastUpdated: Date;
  timeRange: TimeRange;
  geographicBreakdown?: GeographicBreakdown[];
  demographicsBreakdown?: DemographicsBreakdown[];
}

export interface GeographicBreakdown {
  region: string;
  district?: string;
  postalCode?: string;
  value: number;
  percentage: number;
}

export interface DemographicsBreakdown {
  ageGroup: string;
  gender?: string;
  value: number;
  percentage: number;
}

export interface UserJourneyAnalytics {
  userId: string;
  sessionId: string;
  journeySteps: JourneyStep[];
  conversionRate: number;
  totalJourneyTime: number;
  abandonmentStep?: string;
  geographicRegion: string;
  deviceType: string;
  referrerSource: string;
}

export interface JourneyStep {
  step: string;
  timestamp: Date;
  duration: number;
  pageUrl: string;
  action: string;
  metadata: Record<string, any>;
  conversionImpact: 'high' | 'medium' | 'low' | 'none';
}

export interface ServicePerformanceMetrics {
  serviceId: string;
  serviceName: string;
  category: string;
  totalViews: number;
  totalClicks: number;
  bookingConversions: number;
  averageViewDuration: number;
  searchRanking: number;
  popularTimeSlots: TimeSlotMetrics[];
  geographicDistribution: GeographicBreakdown[];
  deviceBreakdown: DeviceBreakdown;
  conversionFunnel: FunnelMetrics;
  competitorComparison?: CompetitorComparison;
}

export interface TimeSlotMetrics {
  hour: number;
  dayOfWeek: number;
  views: number;
  conversions: number;
  conversionRate: number;
}

export interface DeviceBreakdown {
  mobile: { views: number; conversionRate: number };
  tablet: { views: number; conversionRate: number };
  desktop: { views: number; conversionRate: number };
}

export interface FunnelMetrics {
  steps: FunnelStep[];
  totalDropOff: number;
  biggestDropOffStep: string;
  overallConversionRate: number;
  optimizationSuggestions: string[];
}

export interface FunnelStep {
  step: string;
  visitors: number;
  conversionRate: number;
  dropoffRate: number;
  averageTimeSpent: number;
  exitPages: string[];
}

export interface CompetitorComparison {
  competitorName: string;
  marketShare: number;
  averageRating: number;
  priceComparison: number;
  serviceComparison: Record<string, number>;
}

export interface DoctorProfileAnalytics {
  doctorId: string;
  doctorName: string;
  specialty: string;
  totalProfileViews: number;
  uniqueVisitors: number;
  contactClicks: number;
  appointmentBookings: number;
  reviewViews: number;
  averageViewDuration: number;
  geographicReach: string[];
  peakViewTimes: TimeSlotMetrics[];
  conversionRate: number;
  retentionRate: number;
  patientSatisfactionScore?: number;
  profileCompletenessScore: number;
}

export interface HealthierSgAnalytics {
  totalEnrollments: number;
  enrollmentRate: number;
  eligibilityCheckUsage: number;
  benefitsViewRate: number;
  appointmentBookingRate: number;
  enrollmentFunnel: FunnelMetrics;
  geographicEnrollmentDistribution: GeographicBreakdown[];
  ageGroupEnrollmentRates: DemographicsBreakdown[];
  programAwarenessMetrics: AwarenessMetrics;
  dropOffAnalysis: DropOffAnalysis;
  retentionMetrics: RetentionMetrics;
}

export interface AwarenessMetrics {
  totalImpressions: number;
  clickThroughRate: number;
  socialMediaEngagement: number;
  websiteTrafficAttribution: Record<string, number>;
  programRecallRate: number;
}

export interface DropOffAnalysis {
  stepName: string;
  dropoffRate: number;
  averageTimeSpent: number;
  exitReasons: string[];
  recoverySuggestions: string[];
}

export interface RetentionMetrics {
  enrollmentRetentionRate: number;
  activeParticipantRate: number;
  engagementScore: number;
  programCompletionRate: number;
}

export interface ContactEnquiryMetrics {
  totalEnquiries: number;
  enquiryTypes: Record<string, number>;
  averageResponseTime: number;
  resolutionTime: number;
  satisfactionScore: number;
  channelDistribution: Record<string, number>;
  geographicDistribution: GeographicBreakdown[];
  timeToConversion: number;
  enquiryOutcomeRates: Record<string, number>;
}

export interface GeographicAnalytics {
  clinicSearchPatterns: ClinicSearchPattern[];
  popularDistricts: DistrictMetrics[];
  userLocationDistribution: GeographicBreakdown[];
  regionalConversionRates: Record<string, number>;
  trafficSources: Record<string, number>;
  seasonalTrends: SeasonalTrend[];
  peakHours: TimeSlotMetrics[];
}

export interface ClinicSearchPattern {
  searchQuery: string;
  frequency: number;
  resultsFound: number;
  clicksGenerated: number;
  conversionRate: number;
  geographicContext: string;
}

export interface DistrictMetrics {
  district: string;
  clinicCount: number;
  totalViews: number;
  averageRating: number;
  bookingRate: number;
  userSatisfaction: number;
}

export interface SeasonalTrend {
  period: string;
  trend: number;
  impact: 'positive' | 'negative' | 'neutral';
  confidence: number;
  description: string;
}

// Real-time Dashboard Types
export interface RealTimeDashboard {
  id: string;
  name: string;
  type: DashboardType;
  widgets: DashboardWidget[];
  refreshInterval: number;
  lastUpdated: Date;
  isActive: boolean;
  permissions: DashboardPermissions;
}

export enum DashboardType {
  EXECUTIVE = 'executive',
  OPERATIONAL = 'operational',
  HEALTHCARE = 'healthcare',
  MARKETING = 'marketing',
  COMPLIANCE = 'compliance'
}

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  position: { x: number; y: number; w: number; h: number };
  dataSource: string;
  visualization: ChartVisualization;
  refreshInterval?: number;
  alerts?: AlertConfig[];
}

export enum WidgetType {
  KPI_METRIC = 'kpi_metric',
  LINE_CHART = 'line_chart',
  BAR_CHART = 'bar_chart',
  PIE_CHART = 'pie_chart',
  HEATMAP = 'heatmap',
  FUNNEL = 'funnel',
  TABLE = 'table',
  MAP = 'map',
  GAUGE = 'gauge',
  TREEMAP = 'treemap',
  SCATTER_PLOT = 'scatter_plot'
}

export interface ChartVisualization {
  chartType: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'funnel' | 'heatmap' | 'gauge' | 'treemap';
  colors: string[];
  showLegend: boolean;
  showTooltip: boolean;
  animation: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  customOptions?: Record<string, any>;
}

export interface AlertConfig {
  metricName: string;
  threshold: number;
  condition: 'above' | 'below' | 'equals';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  recipients: string[];
}

export interface DashboardPermissions {
  canView: string[];
  canEdit: string[];
  canExport: string[];
  canShare: boolean;
}

// A/B Testing Framework
export interface ABTestConfig {
  id: string;
  name: string;
  description: string;
  hypothesis: string;
  status: ABTestStatus;
  startDate: Date;
  endDate?: Date;
  targetMetrics: string[];
  minimumSampleSize: number;
  confidenceLevel: number;
  significanceThreshold: number;
  variants: ABTestVariant[];
  winner?: string;
  statisticalSignificance: number;
  lift: number;
  businessImpact: string;
}

export enum ABTestStatus {
  DRAFT = 'draft',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  trafficSplit: number;
  isControl: boolean;
  configuration: Record<string, any>;
  metrics: ABTestMetrics;
}

export interface ABTestMetrics {
  visitors: number;
  conversions: number;
  conversionRate: number;
  averageTimeSpent: number;
  bounceRate: number;
  statisticalSignificance?: number;
  confidenceInterval: [number, number];
}

// Predictive Analytics
export interface PredictiveAnalytics {
  demandForecasting: DemandForecast[];
  capacityPlanning: CapacityPlan[];
  patientFlowPrediction: PatientFlowPrediction;
  seasonalAdjustments: SeasonalAdjustment[];
  riskAssessment: RiskAssessment[];
  recommendations: PredictiveRecommendation[];
}

export interface DemandForecast {
  clinicId: string;
  date: Date;
  predictedAppointments: number;
  confidence: number;
  lowerBound: number;
  upperBound: number;
  factors: ForecastFactor[];
}

export interface ForecastFactor {
  factor: string;
  impact: number;
  description: string;
}

export interface CapacityPlan {
  clinicId: string;
  date: Date;
  recommendedStaff: number;
  recommendedCapacity: number;
  utilizationRate: number;
  efficiencyScore: number;
}

export interface PatientFlowPrediction {
  clinicId: string;
  hour: number;
  predictedWaitTime: number;
  predictedQueueLength: number;
  predictedUtilizationRate: number;
}

export interface SeasonalAdjustment {
  period: string;
  adjustmentFactor: number;
  confidence: number;
  description: string;
}

export interface RiskAssessment {
  riskType: string;
  clinicId?: string;
  probability: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  mitigationStrategies: string[];
  monitoringMetrics: string[];
}

export interface PredictiveRecommendation {
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  title: string;
  description: string;
  expectedBenefit: string;
  implementationEffort: 'low' | 'medium' | 'high';
  timeline: string;
}

// Privacy Compliance (PDPA)
export interface PrivacyCompliantAnalytics {
  anonymizationLevel: 'none' | 'ip_only' | 'full' | 'differential_privacy';
  retentionPeriod: number; // days
  consentManagement: ConsentRecord[];
  dataSubjectRights: DataSubjectRightsLog[];
  auditTrail: AuditLogEntry[];
}

export interface ConsentRecord {
  userId: string;
  consentType: string;
  granted: boolean;
  timestamp: Date;
  ipAddress: string; // Will be anonymized
  userAgent: string;
  evidence: string; // JSON string of consent mechanism
}

export interface DataSubjectRightsLog {
  requestId: string;
  userId: string;
  requestType: 'access' | 'rectification' | 'erasure' | 'portability';
  status: 'pending' | 'fulfilled' | 'rejected';
  requestedAt: Date;
  fulfilledAt?: Date;
  details: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  action: string;
  resource: string;
  ipAddress: string; // Anonymized
  userAgent: string;
  success: boolean;
  details: Record<string, any>;
}

// Real-time WebSocket Types
export interface WebSocketMessage {
  type: 'analytics_update' | 'alert' | 'dashboard_refresh' | 'performance_metric';
  payload: any;
  timestamp: Date;
  sessionId: string;
}

export interface RealTimeMetrics {
  activeUsers: number;
  concurrentAppointments: number;
  currentLoadTime: number;
  errorRate: number;
  conversionRate: number;
  alerts: Alert[];
  lastUpdated: Date;
}

export interface Alert {
  id: string;
  type: 'performance' | 'conversion' | 'error' | 'security';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  resolvedAt?: Date;
}

// Utility Types
export interface TimeRange {
  start: Date;
  end: Date;
  granularity: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
}

export type TimeRangeKey = '1h' | '24h' | '7d' | '30d' | '90d' | '1y' | 'custom';

export interface TimeRangeConfig {
  key: TimeRangeKey;
  label: string;
  milliseconds: number;
  default: boolean;
}

export const TIME_RANGES: Record<TimeRangeKey, TimeRangeConfig> = {
  '1h': { key: '1h', label: 'Last Hour', milliseconds: 60 * 60 * 1000, default: false },
  '24h': { key: '24h', label: 'Last 24 Hours', milliseconds: 24 * 60 * 60 * 1000, default: true },
  '7d': { key: '7d', label: 'Last 7 Days', milliseconds: 7 * 24 * 60 * 60 * 1000, default: false },
  '30d': { key: '30d', label: 'Last 30 Days', milliseconds: 30 * 24 * 60 * 60 * 1000, default: false },
  '90d': { key: '90d', label: 'Last 90 Days', milliseconds: 90 * 24 * 60 * 60 * 1000, default: false },
  '1y': { key: '1y', label: 'Last Year', milliseconds: 365 * 24 * 60 * 60 * 1000, default: false },
  'custom': { key: 'custom', label: 'Custom Range', milliseconds: 0, default: false },
};

export interface DeviceInfo {
  deviceType: 'mobile' | 'tablet' | 'desktop';
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  screenResolution: string;
  viewportSize: { width: number; height: number };
  connectionType: 'slow-2g' | '2g' | '3g' | '4g' | 'wifi' | 'unknown';
  connectionSpeed: number;
}

export interface GeolocationData {
  country: string;
  region: string;
  city: string;
  coordinates?: { lat: number; lng: number };
  accuracy: number;
  postalCode?: string;
  district?: string; // Singapore specific
}

export interface AnalyticsError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  requestId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface AnalyticsApiResponse<T> {
  success: boolean;
  data?: T;
  error?: AnalyticsError;
  meta?: {
    requestId: string;
    timestamp: Date;
    executionTime: number;
    recordCount: number;
    cacheHit: boolean;
  };
}