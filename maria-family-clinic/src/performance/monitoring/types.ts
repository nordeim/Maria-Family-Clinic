/**
 * Healthcare Monitoring & Alerting System Types
 * Sub-Phase 10.6: Comprehensive Monitoring & Alerting Systems for My Family Clinic
 * Supports Singapore healthcare regulations and PDPA compliance
 */

// =============================================================================
// CORE MONITORING TYPES
// =============================================================================

export enum MonitoringSeverity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  INFO = 'INFO'
}

export enum MonitoringCategory {
  PERFORMANCE = 'PERFORMANCE',
  COMPLIANCE = 'COMPLIANCE',
  SECURITY = 'SECURITY',
  AVAILABILITY = 'AVAILABILITY',
  HEALTHCARE_WORKFLOW = 'HEALTHCARE_WORKFLOW',
  BUSINESS_LOGIC = 'BUSINESS_LOGIC',
  INTEGRATION = 'INTEGRATION'
}

export enum AlertStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  RESOLVED = 'RESOLVED',
  SUPPRESSED = 'SUPPRESSED',
  ESCALATED = 'ESCALATED'
}

export enum IncidentPriority {
  P1_CRITICAL = 'P1_CRITICAL',
  P2_HIGH = 'P2_HIGH',
  P3_MEDIUM = 'P3_MEDIUM',
  P4_LOW = 'P4_LOW'
}

// =============================================================================
// PERFORMANCE MONITORING TYPES
// =============================================================================

export interface PerformanceMetrics {
  timestamp: Date;
  metricType: PerformanceMetricType;
  value: number;
  unit: string;
  threshold: {
    warning: number;
    critical: number;
  };
  healthcareWorkflowId?: string;
  pageRoute?: string;
  apiEndpoint?: string;
  userJourney?: string;
  clinicId?: string;
  doctorId?: string;
}

export enum PerformanceMetricType {
  PAGE_LOAD_TIME = 'PAGE_LOAD_TIME',
  API_RESPONSE_TIME = 'API_RESPONSE_TIME',
  CORE_WEB_VITALS_LCP = 'CORE_WEB_VITALS_LCP',
  CORE_WEB_VITALS_FID = 'CORE_WEB_VITALS_FID',
  CORE_WEB_VITALS_CLS = 'CORE_WEB_VITALS_CLS',
  DATABASE_QUERY_TIME = 'DATABASE_QUERY_TIME',
  CONCURRENT_USERS = 'CONCURRENT_USERS',
  MEMORY_USAGE = 'MEMORY_USAGE',
  CPU_USAGE = 'CPU_USAGE',
  THROUGHPUT = 'THROUGHPUT',
  ERROR_RATE = 'ERROR_RATE',
  SUCCESS_RATE = 'SUCCESS_RATE'
}

export interface HealthcareWorkflowMetrics {
  workflowId: string;
  workflowType: HealthcareWorkflowType;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  status: WorkflowStatus;
  steps: WorkflowStep[];
  userId?: string;
  clinicId?: string;
  doctorId?: string;
  appointmentId?: string;
  successRate: number;
  dropOffPoints: string[];
  userExperienceScore: number;
}

export enum HealthcareWorkflowType {
  CLINIC_SEARCH = 'CLINIC_SEARCH',
  DOCTOR_SEARCH = 'DOCTOR_SEARCH',
  APPOINTMENT_BOOKING = 'APPOINTMENT_BOOKING',
  HEALTHIER_SG_ENROLLMENT = 'HEALTHIER_SG_ENROLLMENT',
  CONTACT_ENQUIRY = 'CONTACT_ENQUIRY',
  PATIENT_PROFILE_CREATION = 'PATIENT_PROFILE_CREATION',
  MEDICAL_HISTORY_ENTRY = 'MEDICAL_HISTORY_ENTRY',
  INSURANCE_VERIFICATION = 'INSURANCE_VERIFICATION'
}

export enum WorkflowStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  ABANDONED = 'ABANDONED',
  TIMEOUT = 'TIMEOUT'
}

export interface WorkflowStep {
  stepId: string;
  stepName: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  status: WorkflowStatus;
  errorMessage?: string;
  metrics: Record<string, number>;
}

// =============================================================================
// HEALTHCARE COMPLIANCE MONITORING TYPES
// =============================================================================

export interface ComplianceMetrics {
  timestamp: Date;
  complianceType: ComplianceType;
  status: ComplianceStatus;
  score: number;
  violations: ComplianceViolation[];
  regulatoryFramework: RegulatoryFramework;
  entityId?: string; // clinic, doctor, program ID
  entityType?: string;
  auditTrail: ComplianceAuditEntry[];
  nextReviewDate?: Date;
}

export enum ComplianceType {
  PDPA_COMPLIANCE = 'PDPA_COMPLIANCE',
  HEALTHCARE_DATA_SECURITY = 'HEALTHCARE_DATA_SECURITY',
  MEDICAL_RECORD_HANDLING = 'MEDICAL_RECORD_HANDLING',
  GOVERNMENT_REGULATION = 'GOVERNMENT_REGULATION',
  MEDICAL_CREDENTIAL_VERIFICATION = 'MEDICAL_CREDENTIAL_VERIFICATION',
  PATIENT_PRIVACY = 'PATIENT_PRIVACY',
  AUDIT_TRAIL_INTEGRITY = 'AUDIT_TRAIL_INTEGRITY'
}

export enum ComplianceStatus {
  COMPLIANT = 'COMPLIANT',
  PARTIAL = 'PARTIAL',
  NON_COMPLIANT = 'NON_COMPLIANT',
  UNDER_REVIEW = 'UNDER_REVIEW',
  REQUIRES_ACTION = 'REQUIRES_ACTION'
}

export enum RegulatoryFramework {
  PDPA = 'PDPA',
  SMC = 'SMC',
  MOH_GUIDELINES = 'MOH_GUIDELINES',
  HEALTHCARE_ACT = 'HEALTHCARE_ACT',
  GDPR = 'GDPR'
}

export interface ComplianceViolation {
  violationId: string;
  type: ComplianceType;
  severity: MonitoringSeverity;
  description: string;
  detectedAt: Date;
  resolvedAt?: Date;
  affectedRecords: number;
  regulatoryImplication: string;
  correctiveActionRequired: boolean;
  assignedTo?: string;
  resolutionNotes?: string;
}

export interface ComplianceAuditEntry {
  auditId: string;
  timestamp: Date;
  action: string;
  performedBy: string;
  resource: string;
  resourceId: string;
  changes: Record<string, any>;
  complianceFlags: string[];
  riskLevel: MonitoringSeverity;
  pdpaRelevant: boolean;
  mohCompliance: boolean;
}

// =============================================================================
// SECURITY MONITORING TYPES
// =============================================================================

export interface SecurityEvent {
  eventId: string;
  timestamp: Date;
  eventType: SecurityEventType;
  severity: MonitoringSeverity;
  source: SecurityEventSource;
  target: string;
  description: string;
  ipAddress: string;
  userAgent: string;
  userId?: string;
  sessionId?: string;
  affectedDataTypes: string[];
  potentialDataBreach: boolean;
  regulatoryNotificationRequired: boolean;
  automatedResponse: boolean;
  investigationRequired: boolean;
  status: AlertStatus;
  resolutionNotes?: string;
}

export enum SecurityEventType {
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  DATA_ACCESS_ANOMALY = 'DATA_ACCESS_ANOMALY',
  ENCRYPTION_FAILURE = 'ENCRYPTION_FAILURE',
  SUSPICIOUS_LOGIN = 'SUSPICIOUS_LOGIN',
  DATA_EXPORT_DETECTED = 'DATA_EXPORT_DETECTED',
  PRIVILEGE_ESCALATION = 'PRIVILEGE_ESCALATION',
  SYSTEM_INTRUSION = 'SYSTEM_INTRUSION',
  MALWARE_DETECTION = 'MALWARE_DETECTION',
  DATA_LEAK = 'DATA_LEAK',
  API_ABUSE = 'API_ABUSE'
}

export enum SecurityEventSource {
  WEB_APPLICATION = 'WEB_APPLICATION',
  MOBILE_APP = 'MOBILE_APP',
  API_ENDPOINT = 'API_ENDPOINT',
  DATABASE = 'DATABASE',
  ADMIN_PANEL = 'ADMIN_PANEL',
  THIRD_PARTY_INTEGRATION = 'THIRD_PARTY_INTEGRATION',
  INTERNAL_NETWORK = 'INTERNAL_NETWORK'
}

// =============================================================================
// INTEGRATION MONITORING TYPES
// =============================================================================

export interface IntegrationHealth {
  integrationId: string;
  serviceName: string;
  serviceType: IntegrationServiceType;
  status: IntegrationStatus;
  lastCheck: Date;
  responseTime: number;
  successRate: number;
  errorCount: number;
  uptime: number;
  lastError?: string;
  nextRetry?: Date;
  healthcareImpact: HealthcareImpactLevel;
  dependencies: string[];
  maintenanceScheduled?: Date;
}

export enum IntegrationServiceType {
  GOOGLE_MAPS = 'GOOGLE_MAPS',
  HEALTHIER_SG_API = 'HEALTHIER_SG_API',
  PAYMENT_GATEWAY = 'PAYMENT_GATEWAY',
  MEDICAL_INSURANCE_API = 'MEDICAL_INSURANCE_API',
  GOVERNMENT_VERIFICATION = 'GOVERNMENT_VERIFICATION',
  NOTIFICATION_SERVICE = 'NOTIFICATION_SERVICE',
  EMAIL_SERVICE = 'EMAIL_SERVICE',
  SMS_SERVICE = 'SMS_SERVICE'
}

export enum IntegrationStatus {
  HEALTHY = 'HEALTHY',
  DEGRADED = 'DEGRADED',
  DOWN = 'DOWN',
  MAINTENANCE = 'MAINTENANCE',
  UNKNOWN = 'UNKNOWN'
}

export enum HealthcareImpactLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
  EMERGENCY = 'EMERGENCY'
}

// =============================================================================
// ALERT & INCIDENT MANAGEMENT TYPES
// =============================================================================

export interface AlertRule {
  ruleId: string;
  name: string;
  description: string;
  category: MonitoringCategory;
  severity: MonitoringSeverity;
  conditions: AlertCondition[];
  actions: AlertAction[];
  isActive: boolean;
  healthcareWorkflowId?: string;
  complianceType?: ComplianceType;
  escalationPolicy: EscalationPolicy;
  suppressionRules: SuppressionRule[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AlertCondition {
  metricType: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  threshold: number;
  duration?: number; // in seconds
  healthcareSpecific?: boolean;
  workflowContext?: string;
}

export interface AlertAction {
  actionType: AlertActionType;
  configuration: Record<string, any>;
  priority: number;
}

export enum AlertActionType {
  SEND_EMAIL = 'SEND_EMAIL',
  SEND_SMS = 'SEND_SMS',
  CREATE_INCIDENT = 'CREATE_INCIDENT',
  AUTO_RESOLVE = 'AUTO_RESOLVE',
  ESCALATE = 'ESCALATE',
  RUN_PLAYBOOK = 'RUN_PLAYBOOK',
  NOTIFY_STAKEHOLDERS = 'NOTIFY_STAKEHOLDERS',
  TRIGGER_WEBHOOK = 'TRIGGER_WEBHOOK'
}

export interface Incident {
  incidentId: string;
  title: string;
  description: string;
  category: MonitoringCategory;
  severity: MonitoringSeverity;
  priority: IncidentPriority;
  status: IncidentStatus;
  assignedTo?: string;
  reportedAt: Date;
  resolvedAt?: Date;
  timeline: IncidentTimelineEntry[];
  relatedAlerts: string[];
  healthcareWorkflowImpact: string[];
  complianceImpact: ComplianceImpact[];
  estimatedResolutionTime?: number;
  actualResolutionTime?: number;
  rootCause?: string;
  preventionMeasures: string[];
}

export enum IncidentStatus {
  OPEN = 'OPEN',
  INVESTIGATING = 'INVESTIGATING',
  IDENTIFIED = 'IDENTIFIED',
  MONITORING = 'MONITORING',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED'
}

export interface IncidentTimelineEntry {
  timestamp: Date;
  action: string;
  performedBy: string;
  description: string;
  status?: IncidentStatus;
}

export interface ComplianceImpact {
  complianceType: ComplianceType;
  impactLevel: MonitoringSeverity;
  affectedEntities: string[];
  regulatoryImplications: string[];
  notificationRequired: boolean;
}

// =============================================================================
// DASHBOARD & REPORTING TYPES
// =============================================================================

export interface DashboardConfiguration {
  dashboardId: string;
  name: string;
  type: DashboardType;
  layout: DashboardLayout;
  widgets: DashboardWidget[];
  refreshInterval: number;
  accessLevel: string[];
  healthcareContext?: HealthcareContext;
  complianceFramework: RegulatoryFramework[];
}

export enum DashboardType {
  EXECUTIVE_HEALTHCARE = 'EXECUTIVE_HEALTHCARE',
  OPERATIONS_HEALTHCARE = 'OPERATIONS_HEALTHCARE',
  HEALTHCARE_COMPLIANCE = 'HEALTHCARE_COMPLIANCE',
  TECHNICAL_PERFORMANCE = 'TECHNICAL_PERFORMANCE'
}

export interface DashboardLayout {
  columns: number;
  rows: number;
  gridTemplate: string;
  responsiveBreakpoints: Record<string, string>;
}

export interface DashboardWidget {
  widgetId: string;
  type: WidgetType;
  title: string;
  position: WidgetPosition;
  size: WidgetSize;
  dataSource: WidgetDataSource;
  configuration: Record<string, any>;
  refreshInterval: number;
  healthcareSpecific: boolean;
  complianceRelevant: boolean;
}

export enum WidgetType {
  METRIC_CARD = 'METRIC_CARD',
  TIME_SERIES_CHART = 'TIME_SERIES_CHART',
  BAR_CHART = 'BAR_CHART',
  PIE_CHART = 'PIE_CHART',
  HEALTH_STATUS = 'HEALTH_STATUS',
  COMPLIANCE_SCORE = 'COMPLIANCE_SCORE',
  ALERT_LIST = 'ALERT_LIST',
  INCIDENT_LIST = 'INCIDENT_LIST',
  TABLE = 'TABLE',
  GAUGE = 'GAUGE',
  HEATMAP = 'HEATMAP'
}

export interface WidgetPosition {
  x: number;
  y: number;
  column: number;
  row: number;
}

export interface WidgetSize {
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
}

export interface WidgetDataSource {
  type: 'api' | 'database' | 'metrics' | 'alerts' | 'incidents';
  endpoint?: string;
  query?: string;
  filters?: Record<string, any>;
  aggregation?: string;
  timeRange?: {
    start: Date;
    end: Date;
  };
}

// =============================================================================
// HEALTHCARE CONTEXT TYPES
// =============================================================================

export interface HealthcareContext {
  patientJourney: string;
  clinicalWorkflow: string;
  regulatoryEnvironment: RegulatoryFramework[];
  dataClassification: DataClassificationLevel[];
  complianceRequirements: ComplianceRequirement[];
  privacyControls: PrivacyControl[];
}

export enum DataClassificationLevel {
  PUBLIC = 'PUBLIC',
  INTERNAL = 'INTERNAL',
  CONFIDENTIAL = 'CONFIDENTIAL',
  RESTRICTED = 'RESTRICTED',
  MEDICAL_RECORD = 'MEDICAL_RECORD'
}

export interface ComplianceRequirement {
  framework: RegulatoryFramework;
  requirements: string[];
  auditFrequency: string;
  reportingObligations: string[];
}

export interface PrivacyControl {
  controlType: string;
  implementation: string;
  effectiveness: number;
  lastValidation: Date;
}

// =============================================================================
// BUSINESS LOGIC MONITORING TYPES
// =============================================================================

export interface BusinessRuleMonitoring {
  ruleId: string;
  ruleName: string;
  ruleType: BusinessRuleType;
  entityType: string;
  entityId: string;
  evaluationTime: Date;
  result: BusinessRuleResult;
  violations: BusinessRuleViolation[];
  autoCorrection: boolean;
  complianceImplications: string[];
}

export enum BusinessRuleType {
  APPOINTMENT_BOOKING = 'APPOINTMENT_BOOKING',
  DOCTOR_AVAILABILITY = 'DOCTOR_AVAILABILITY',
  MEDICAL_SERVICE_PRICING = 'MEDICAL_SERVICE_PRICING',
  INSURANCE_VERIFICATION = 'INSURANCE_VERIFICATION',
  HEALTHIER_SG_ENROLLMENT = 'HEALTHIER_SG_ENROLLMENT',
  PATIENT_DATA_PROCESSING = 'PATIENT_DATA_PROCESSING'
}

export interface BusinessRuleResult {
  isValid: boolean;
  score: number;
  confidence: number;
  appliedCorrections: string[];
  pendingActions: string[];
}

export interface BusinessRuleViolation {
  violationId: string;
  ruleType: BusinessRuleType;
  severity: MonitoringSeverity;
  description: string;
  affectedRecords: number;
  financialImpact?: number;
  complianceImpact: string[];
  correctiveAction: string;
}

// =============================================================================
// CAPACITY MONITORING TYPES
// =============================================================================

export interface CapacityMetrics {
  timestamp: Date;
  resourceType: ResourceType;
  currentUsage: number;
  maximumCapacity: number;
  utilizationPercentage: number;
  trendDirection: 'increasing' | 'decreasing' | 'stable';
  projectedCapacityAtPeak?: number;
  healthcarePeriod: HealthcarePeriod;
  recommendations: string[];
}

export enum ResourceType {
  CONCURRENT_USERS = 'CONCURRENT_USERS',
  DATABASE_CONNECTIONS = 'DATABASE_CONNECTIONS',
  API_REQUESTS_PER_SECOND = 'API_REQUESTS_PER_SECOND',
  MEMORY_USAGE = 'MEMORY_USAGE',
  STORAGE_USAGE = 'STORAGE_USAGE',
  NETWORK_BANDWIDTH = 'NETWORK_BANDWIDTH'
}

export enum HealthcarePeriod {
  REGULAR_HOURS = 'REGULAR_HOURS',
  PEAK_HOURS = 'PEAK_HOURS',
  WEEKEND = 'WEEKEND',
  HOLIDAY = 'HOLIDAY',
  EMERGENCY = 'EMERGENCY'
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface MonitoringApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
  executionTime: number;
  metadata?: {
    totalRecords?: number;
    filteredRecords?: number;
    aggregationLevel?: string;
  };
}

export interface PaginatedMonitoringResponse<T> extends MonitoringApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// =============================================================================
// CONFIGURATION TYPES
// =============================================================================

export interface MonitoringConfiguration {
  enabledFeatures: MonitoringFeature[];
  alertRules: AlertRule[];
  dashboardConfigurations: DashboardConfiguration[];
  escalationPolicies: EscalationPolicy[];
  integrationSettings: IntegrationSettings;
  complianceSettings: ComplianceSettings;
  retentionPolicies: RetentionPolicy[];
}

export enum MonitoringFeature {
  REAL_TIME_MONITORING = 'REAL_TIME_MONITORING',
  PERFORMANCE_TRACKING = 'PERFORMANCE_TRACKING',
  COMPLIANCE_MONITORING = 'COMPLIANCE_MONITORING',
  SECURITY_MONITORING = 'SECURITY_MONITORING',
  HEALTHCARE_WORKFLOW_MONITORING = 'HEALTHCARE_WORKFLOW_MONITORING',
  INCIDENT_MANAGEMENT = 'INCIDENT_MANAGEMENT',
  DASHBOARD_REPORTING = 'DASHBOARD_REPORTING',
  BUSINESS_LOGIC_MONITORING = 'BUSINESS_LOGIC_MONITORING'
}

export interface EscalationPolicy {
  policyId: string;
  name: string;
  levels: EscalationLevel[];
  timeTriggers: number[];
  notificationChannels: string[];
  healthcareSpecific: boolean;
}

export interface EscalationLevel {
  level: number;
  roles: string[];
  timeInLevel: number;
  actions: string[];
}

export interface IntegrationSettings {
  healthCheckInterval: number;
  retryAttempts: number;
  timeout: number;
  circuitBreakerThreshold: number;
  healthcareServicePriority: string[];
}

export interface ComplianceSettings {
  pdpaMonitoringEnabled: boolean;
  auditLogRetention: number;
  automatedComplianceChecks: boolean;
  regulatoryReportingEnabled: boolean;
  notificationThresholds: Record<string, number>;
}

export interface RetentionPolicy {
  dataType: string;
  retentionPeriod: number;
  archiveAfter: number;
  purgeAfter: number;
  complianceRequirement: string;
}

export interface SuppressionRule {
  ruleId: string;
  name: string;
  conditions: Record<string, any>;
  duration: number;
  reason: string;
  createdBy: string;
}

// =============================================================================
// EXPORT ALL TYPES
// =============================================================================

export type {
  // Core types
  PerformanceMetrics,
  HealthcareWorkflowMetrics,
  ComplianceMetrics,
  SecurityEvent,
  IntegrationHealth,
  AlertRule,
  Incident,
  DashboardConfiguration,
  BusinessRuleMonitoring,
  CapacityMetrics,
  MonitoringConfiguration
};