// Analytics Types for Contact System Performance Optimization

export interface ContactAnalyticsEvent {
  id: string;
  eventType: ContactEventType;
  eventName: string;
  sessionId: string;
  userId?: string;
  pageUrl: string;
  formId?: string;
  enquiryId?: string;
  clinicId?: string;
  timestamp: Date;
  metadata: Record<string, any>;
  performanceMetrics: PerformanceMetrics;
  userAgent: string;
  deviceInfo: DeviceInfo;
  location: GeolocationData;
}

export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  interactionTime: number;
  formStartTime?: number;
  formCompleteTime?: number;
  fieldInteractionTimes: Record<string, number>;
  totalFormTime?: number;
  abandonTime?: number;
}

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
  country?: string;
  region?: string;
  city?: string;
  coordinates?: { lat: number; lng: number };
  accuracy: number;
}

export enum ContactEventType {
  // Form Events
  FORM_VIEW = 'form_view',
  FORM_START = 'form_start',
  FORM_FIELD_FOCUS = 'form_field_focus',
  FORM_FIELD_BLUR = 'form_field_blur',
  FORM_FIELD_ERROR = 'form_field_error',
  FORM_SUBMIT = 'form_submit',
  FORM_COMPLETE = 'form_complete',
  FORM_ABANDON = 'form_abandon',
  
  // Enquiry Events
  ENQUIRY_VIEW = 'enquiry_view',
  ENQUIRY_RESPONSE_VIEW = 'enquiry_response_view',
  ENQUIRY_RATING = 'enquiry_rating',
  ENQUIRY_FEEDBACK = 'enquiry_feedback',
  
  // Navigation Events
  PAGE_VIEW = 'page_view',
  PAGE_EXIT = 'page_exit',
  SEARCH_PERFORMED = 'search_performed',
  CLINIC_VIEW = 'clinic_view',
  DOCTOR_VIEW = 'doctor_view',
  
  // Performance Events
  SLOW_LOAD = 'slow_load',
  JS_ERROR = 'js_error',
  NETWORK_ERROR = 'network_error',
  PERFORMANCE_ALERT = 'performance_alert',
}

export interface CustomerSatisfactionMetrics {
  overallCSAT: number;
  responseTimeSatisfaction: number;
  resolutionQualitySatisfaction: number;
  communicationSatisfaction: number;
  npsScore: number;
  cesScore: number; // Customer Effort Score
  totalResponses: number;
  period: TimePeriod;
}

export interface FormAnalytics {
  formId: string;
  formName: string;
  totalViews: number;
  totalStarts: number;
  totalCompletions: number;
  totalAbandons: number;
  completionRate: number;
  abandonmentRate: number;
  averageTimeToComplete: number;
  averageTimeToAbandon: number;
  fieldDropOffRates: FieldDropOffRate[];
  deviceBreakdown: DeviceBreakdown;
  timeOfDayBreakdown: TimeOfDayBreakdown;
  errorRates: Record<string, number>;
  conversionFunnel: ConversionFunnelStep[];
}

export interface FieldDropOffRate {
  fieldId: string;
  fieldLabel: string;
  fieldType: string;
  abandonmentRate: number;
  averageTimeSpent: number;
  errorRate: number;
  commonErrors: string[];
}

export interface DeviceBreakdown {
  mobile: { views: number; completionRate: number };
  tablet: { views: number; completionRate: number };
  desktop: { views: number; completionRate: number };
}

export interface TimeOfDayBreakdown {
  morning: { views: number; completionRate: number };
  afternoon: { views: number; completionRate: number };
  evening: { views: number; completionRate: number };
  night: { views: number; completionRate: number };
}

export interface ConversionFunnelStep {
  step: string;
  users: number;
  rate: number;
  dropoffRate: number;
  averageTimeSpent: number;
}

export interface PredictiveAnalytics {
  enquiryVolumeForecast: ForecastData[];
  staffingRecommendations: StaffingRecommendation[];
  seasonalTrends: SeasonalTrend[];
  peakHourAnalysis: PeakHourAnalysis;
  customerSatisfactionPrediction: SatisfactionPrediction;
  formOptimizationOpportunities: OptimizationOpportunity[];
}

export interface ForecastData {
  date: Date;
  predictedVolume: number;
  confidence: number;
  lowerBound: number;
  upperBound: number;
  actualVolume?: number;
  accuracy?: number;
}

export interface StaffingRecommendation {
  timeSlot: string;
  recommendedStaff: number;
  expectedEnquiries: number;
  expectedResponseTime: number;
  currentCapacity: number;
  capacityUtilization: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  reasoning: string;
}

export interface SeasonalTrend {
  period: 'day' | 'week' | 'month';
  trend: number; // percentage change
  impact: 'positive' | 'negative' | 'neutral';
  confidence: number;
  description: string;
}

export interface PeakHourAnalysis {
  peakHours: TimeSlot[];
  lowHours: TimeSlot[];
  averageEnquiriesPerHour: number;
  peakToAverageRatio: number;
}

export interface TimeSlot {
  hour: number;
  dayOfWeek: number;
  averageEnquiries: number;
  completionRate: number;
  averageResponseTime: number;
}

export interface SatisfactionPrediction {
  predictedCSAT: number;
  predictedNPS: number;
  factors: PredictionFactor[];
  confidence: number;
  timeHorizon: number; // days
}

export interface PredictionFactor {
  factor: string;
  impact: 'positive' | 'negative';
  magnitude: number;
  description: string;
}

export interface OptimizationOpportunity {
  type: 'form' | 'process' | 'staffing' | 'content';
  title: string;
  description: string;
  potentialImpact: number; // percentage improvement
  effort: 'low' | 'medium' | 'high';
  priority: 'low' | 'medium' | 'high';
  implementationSuggestions: string[];
  expectedROI: number;
}

export interface ABTestResult {
  testId: string;
  testName: string;
  status: 'running' | 'completed' | 'paused';
  startDate: Date;
  endDate?: Date;
  variants: ABTestVariant[];
  winner?: string;
  statisticalSignificance: number;
  confidenceLevel: number;
  lift: number;
  conversionMetrics: ConversionMetrics;
}

export interface ABTestVariant {
  variantId: string;
  variantName: string;
  description: string;
  trafficPercentage: number;
  conversions: number;
  visitors: number;
  conversionRate: number;
  averageTimeSpent: number;
  bounceRate: number;
  statisticalSignificance?: number;
}

export interface ConversionMetrics {
  primary: ConversionMetric;
  secondary: ConversionMetric[];
  funnel: FunnelMetrics;
}

export interface ConversionMetric {
  name: string;
  rate: number;
  change: number;
  confidence: number;
}

export interface FunnelMetrics {
  steps: FunnelStep[];
  totalDropOff: number;
  biggestDropOffStep: string;
  optimizationSuggestions: string[];
}

export interface FunnelStep {
  name: string;
  visitors: number;
  conversionRate: number;
  dropoffRate: number;
}

export interface PerformanceKPI {
  name: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  trend: 'improving' | 'declining' | 'stable';
  changePercentage: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  lastUpdated: Date;
}

export interface AnalyticsDashboard {
  id: string;
  name: string;
  description: string;
  widgets: DashboardWidget[];
  filters: DashboardFilter[];
  refreshInterval: number; // seconds
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  lastModified: Date;
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'map' | 'funnel' | 'heatmap';
  title: string;
  position: { x: number; y: number; w: number; h: number };
  query: AnalyticsQuery;
  visualization: ChartVisualization;
  refreshInterval?: number;
}

export interface AnalyticsQuery {
  dataSource: string;
  metrics: string[];
  dimensions: string[];
  filters: Record<string, any>;
  timeRange: TimeRange;
  groupBy?: string[];
  orderBy?: { field: string; direction: 'asc' | 'desc' }[];
  limit?: number;
}

export interface TimeRange {
  start: Date;
  end: Date;
  granularity: 'hour' | 'day' | 'week' | 'month';
}

export interface ChartVisualization {
  chartType: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'funnel' | 'heatmap';
  colors: string[];
  showLegend: boolean;
  showTooltip: boolean;
  animation: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  customOptions?: Record<string, any>;
}

export interface DashboardFilter {
  id: string;
  name: string;
  type: 'date' | 'select' | 'multiselect' | 'range' | 'text';
  options?: string[];
  defaultValue?: any;
  appliedValue?: any;
}

export interface GoogleAnalyticsConfig {
  trackingId: string;
  measurementId: string;
  apiSecret: string;
  enhancedEcommerce: boolean;
  crossDomainTracking: boolean;
  customDimensions: GoogleAnalyticsCustomDimension[];
  customMetrics: GoogleAnalyticsCustomMetric[];
  events: GoogleAnalyticsEvent[];
}

export interface GoogleAnalyticsCustomDimension {
  index: number;
  name: string;
  scope: 'hit' | 'session' | 'user';
}

export interface GoogleAnalyticsCustomMetric {
  index: number;
  name: string;
  type: 'integer' | 'float' | 'currency' | 'time';
}

export interface GoogleAnalyticsEvent {
  eventName: string;
  eventCategory: string;
  eventAction: string;
  eventLabel?: string;
  customParameters?: Record<string, string>;
  conditions: EventCondition[];
}

export interface EventCondition {
  trigger: string;
  eventType: ContactEventType;
  value?: any;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'regex';
}

export interface AutomatedReport {
  id: string;
  name: string;
  description: string;
  type: 'scheduled' | 'on-demand' | 'triggered';
  schedule?: ReportSchedule;
  recipients: ReportRecipient[];
  template: ReportTemplate;
  filters: ReportFilter[];
  format: 'pdf' | 'excel' | 'csv' | 'html';
  lastGenerated?: Date;
  nextScheduled?: Date;
  isActive: boolean;
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  time: string; // HH:MM format
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  timezone: string;
}

export interface ReportRecipient {
  email: string;
  name: string;
  role: 'manager' | 'staff' | 'executive' | 'analyst';
  permissions: 'read' | 'readwrite' | 'admin';
}

export interface ReportTemplate {
  header: ReportHeader;
  sections: ReportSection[];
  footer: ReportFooter;
  branding: ReportBranding;
}

export interface ReportHeader {
  title: string;
  subtitle?: string;
  logo?: string;
  generatedBy: string;
  generatedAt: Date;
}

export interface ReportSection {
  id: string;
  title: string;
  type: 'summary' | 'metrics' | 'charts' | 'tables' | 'insights';
  content: ReportContent;
  position: number;
}

export interface ReportContent {
  kpis: PerformanceKPI[];
  charts: ChartData[];
  tables: TableData[];
  insights: Insight[];
  recommendations: Recommendation[];
}

export interface ChartData {
  title: string;
  data: any[];
  type: string;
  configuration: any;
}

export interface TableData {
  title: string;
  headers: string[];
  rows: any[][];
  summary?: any;
}

export interface Insight {
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  category: 'performance' | 'user_experience' | 'business' | 'technical';
  actionable: boolean;
  actions?: string[];
}

export interface Recommendation {
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  implementation: ImplementationPlan;
  expectedBenefit: string;
  timeline: string;
  cost?: string;
}

export interface ImplementationPlan {
  steps: string[];
  resources: string[];
  dependencies: string[];
  risks: string[];
}

export interface ReportFooter {
  disclaimer?: string;
  contactInfo?: string;
  links: string[];
}

export interface ReportBranding {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  logo?: string;
}

export interface ReportFilter {
  field: string;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'between' | 'in';
  value: any;
}

export interface TimePeriod {
  startDate: Date;
  endDate: Date;
  label: string;
}

// Utility types
export type TimeRangeKey = '1h' | '24h' | '7d' | '30d' | '90d' | '1y';

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
};

export interface AnalyticsError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  requestId?: string;
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
  };
}