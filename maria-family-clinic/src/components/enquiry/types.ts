// Enquiry Management Types
export interface EnquiryData {
  id: string
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  type: EnquiryType
  status: EnquiryStatus
  priority: EnquiryPriority
  preferredLanguage: string
  response?: string
  responseDate?: Date
  resolution?: string
  assignedTo?: string
  repliedAt?: Date
  source: EnquirySource
  tags: string[]
  isPublic: boolean
  clinicId?: string
  userId?: string
  createdAt: Date
  updatedAt: Date
  
  // Relations
  clinic?: {
    id: string
    name: string
    address: string
    phone?: string
  }
  patient?: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone?: string
  }
  assignedStaff?: {
    id: string
    name: string
    email: string
    role: UserRole
  }
  
  // Computed fields
  timeToResponse?: number // in hours
  isOverdue?: boolean
  escalationLevel?: number
  followUpRequired?: boolean
  satisfactionScore?: number
}

export interface EnquiryFilters {
  status?: EnquiryStatus[]
  type?: EnquiryType[]
  priority?: EnquiryPriority[]
  clinicId?: string
  assignedTo?: string
  source?: EnquirySource[]
  tags?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
  searchQuery?: string
  isOverdue?: boolean
  requiresFollowUp?: boolean
  hasLowSatisfaction?: boolean
}

export interface EnquiryStats {
  total: number
  new: number
  inProgress: number
  pending: number
  resolved: number
  closed: number
  overdue: number
  today: number
  thisWeek: number
  thisMonth: number
  
  // By type
  byType: Record<EnquiryType, number>
  
  // By priority
  byPriority: Record<EnquiryPriority, number>
  
  // By source
  bySource: Record<EnquirySource, number>
  
  // Response metrics
  averageResponseTime: number // in hours
  averageResolutionTime: number // in hours
  satisfactionScore: number // 1-5 scale
  
  // Staff performance
  staffWorkload: Array<{
    staffId: string
    staffName: string
    assignedCount: number
    resolvedCount: number
    averageResponseTime: number
  }>
}

export interface EnquiryAssignment {
  enquiryId: string
  assignTo: string
  reason?: string
  priority?: EnquiryPriority
  estimatedResponseTime?: number // in hours
  notes?: string
}

export interface EnquiryEscalation {
  enquiryId: string
  level: number
  reason: string
  escalatedBy: string
  escalatedTo: string
  actionRequired: string
  deadline?: Date
  notes?: string
}

export interface EnquiryWorkflow {
  enquiryId: string
  currentStage: EnquiryStage
  nextActions: EnquiryAction[]
  automationRules: EnquiryAutomationRule[]
  slaTargets: EnquirySLATarget[]
}

export interface EnquiryAction {
  id: string
  type: 'assign' | 'respond' | 'escalate' | 'follow_up' | 'close'
  label: string
  description: string
  required: boolean
  canAutoPerform: boolean
  conditions?: EnquiryCondition[]
}

export interface EnquiryCondition {
  field: keyof EnquiryData
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in'
  value: any
}

export interface EnquiryAutomationRule {
  id: string
  name: string
  description: string
  conditions: EnquiryCondition[]
  actions: EnquiryAction[]
  isActive: boolean
  priority: number
  executionOrder: number
}

export interface EnquirySLATarget {
  id: string
  type: 'response' | 'resolution' | 'escalation'
  priority: EnquiryPriority
  targetTime: number // in hours
  warningThreshold: number // percentage
  criticalThreshold: number // percentage
}

export interface EnquiryFollowUp {
  id: string
  enquiryId: string
  type: 'check_in' | 'satisfaction_survey' | 'resolution_confirmation' | 'additional_support'
  scheduledFor: Date
  completed: boolean
  completedAt?: Date
  notes?: string
  assignedTo?: string
  result?: 'positive' | 'neutral' | 'negative' | 'no_response'
}

export interface EnquirySatisfactionData {
  enquiryId: string
  customerId: string
  overall: number // 1-5
  responseTime: number // 1-5
  communication: number // 1-5
  resolution: number // 1-5
  comment?: string
  wouldRecommend: boolean
  submittedAt: Date
}

export interface EnquiryNotification {
  id: string
  enquiryId: string
  type: 'assignment' | 'escalation' | 'overdue' | 'sla_warning' | 'follow_up_due' | 'satisfaction_survey'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  title: string
  message: string
  recipient: string
  recipientType: 'staff' | 'customer'
  isRead: boolean
  createdAt: Date
  readAt?: Date
  actionRequired: boolean
  actionUrl?: string
  actionDeadline?: Date
}

export interface EnquiryResponseTemplate {
  id: string
  name: string
  category: EnquiryType
  subject: string
  content: string
  variables: string[] // e.g., ['customerName', 'enquiryId']
  isActive: boolean
  usageCount: number
  lastUsed?: Date
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface EnquiryTrend {
  date: string
  total: number
  byType: Record<EnquiryType, number>
  byStatus: Record<EnquiryStatus, number>
  averageResponseTime: number
  averageResolutionTime: number
  satisfactionScore: number
}

// Enums
export type EnquiryType = 'GENERAL' | 'APPOINTMENT' | 'HEALTHIER_SG' | 'CLINIC_INFORMATION' | 'DOCTOR_INFORMATION' | 'SERVICE_INFORMATION' | 'COMPLAINT' | 'FEEDBACK'

export type EnquiryStatus = 'NEW' | 'IN_PROGRESS' | 'PENDING' | 'RESOLVED' | 'CLOSED'

export type EnquiryPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'

export type EnquirySource = 'website' | 'phone' | 'email' | 'walk_in' | 'referral' | 'social_media' | 'app'

export type EnquiryStage = 'intake' | 'assignment' | 'investigation' | 'response' | 'resolution' | 'follow_up' | 'closed'

export type UserRole = 'PATIENT' | 'STAFF' | 'ADMIN' | 'DOCTOR'

// API Response types
export interface EnquiryListResponse {
  data: EnquiryData[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface EnquiryCreateRequest {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  type: EnquiryType
  clinicId?: string
  userId?: string
  preferredLanguage?: string
  source?: EnquirySource
  tags?: string[]
}

export interface EnquiryUpdateRequest {
  status?: EnquiryStatus
  priority?: EnquiryPriority
  response?: string
  assignedTo?: string
  tags?: string[]
  notes?: string
}

export interface EnquiryAssignmentRequest {
  enquiryId: string
  assignTo: string
  reason?: string
  priority?: EnquiryPriority
  estimatedResponseTime?: number
  notes?: string
}

export interface EnquiryEscalationRequest {
  enquiryId: string
  level: number
  reason: string
  escalatedTo: string
  actionRequired: string
  deadline?: Date
  notes?: string
}

export interface EnquiryFollowUpRequest {
  enquiryId: string
  type: EnquiryFollowUp['type']
  scheduledFor: Date
  notes?: string
  assignedTo?: string
}

export interface EnquirySatisfactionRequest {
  enquiryId: string
  customerId: string
  overall: number
  responseTime: number
  communication: number
  resolution: number
  comment?: string
  wouldRecommend: boolean
}

export interface EnquirySearchRequest {
  filters: EnquiryFilters
  pagination: {
    page: number
    limit: number
  }
  sorting: {
    field: keyof EnquiryData
    direction: 'asc' | 'desc'
  }
}

export interface EnquiryBulkActionRequest {
  enquiryIds: string[]
  action: 'assign' | 'update_status' | 'add_tags' | 'escalate' | 'delete'
  parameters: Record<string, any>
}

// Utility types
export interface EnquiryDashboardConfig {
  defaultView: 'list' | 'grid' | 'kanban'
  autoRefresh: boolean
  refreshInterval: number // seconds
  showNotifications: boolean
  showSLAWarnings: boolean
  showOverdueItems: boolean
  defaultPageSize: number
  enableBulkActions: boolean
  enableAutomation: boolean
  customFields: Array<{
    key: string
    label: string
    type: 'text' | 'number' | 'date' | 'boolean' | 'select'
    options?: string[]
  }>
}

export interface EnquiryPermissions {
  canView: boolean
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
  canAssign: boolean
  canEscalate: boolean
  canClose: boolean
  canAccessAnalytics: boolean
  canManageTemplates: boolean
  canManageAutomation: boolean
}

// Analytics and Satisfaction Tracking Types
export interface EnquiryAnalyticsData {
  totalEnquiries: number
  resolvedEnquiries: number
  avgResolutionTime: number // in hours
  resolutionRate: number // percentage
  customerSatisfaction: number // 1-5 scale
  trendData: Array<{
    date: string
    total: number
    resolved: number
    pending: number
    satisfaction: number
  }>
  typeDistribution: Array<{
    type: EnquiryType
    count: number
    percentage: number
  }>
  staffPerformance: Array<{
    staffId: string
    staffName: string
    totalAssigned: number
    resolved: number
    avgResponseTime: number
    satisfactionScore: number
  }>
  responseTimeMetrics: {
    slaCompliance: number // percentage
    avgResponseTime: number
    fastestResponse: number
    slowestResponse: number
  }
  qualityMetrics: {
    firstContactResolution: number
    escalationRate: number
    reopenRate: number
  }
}

export interface StaffPerformanceData {
  name: string
  totalAssigned: number
  resolved: number
  avgResponseTime: number
  satisfaction: number
  resolutionRate: number
  workload: number // percentage of capacity
  trend: 'up' | 'down' | 'stable'
}

export interface SatisfactionSurvey {
  id: string
  enquiryId: string
  enquirySubject: string
  customerName: string
  customerEmail: string
  status: 'DRAFT' | 'SENT' | 'RESPONDED' | 'EXPIRED'
  sentAt?: Date
  respondedAt?: Date
  overallRating: number // 1-5
  responseTimeRating: number // 1-5
  problemResolutionRating: number // 1-5
  communicationRating: number // 1-5
  recommendationLikelihood: number // 0-10 (NPS scale)
  feedback?: string
  followUpRequired: boolean
  problemResolved: boolean
  responseQuality: 'excellent' | 'good' | 'fair' | 'poor'
  surveyTemplate: string
}

export interface SatisfactionMetrics {
  averageRating: number
  totalSurveys: number
  responseRate: number
  satisfactionTrend: 'up' | 'down' | 'neutral'
  responseTime: number // average days to respond
  nps: number // Net Promoter Score
  breakdown: {
    verySatisfied: number // 5 stars
    satisfied: number // 4 stars
    neutral: number // 3 stars
    dissatisfied: number // 1-2 stars
  }
  qualityScores: {
    responseTime: number
    problemResolution: number
    communication: number
    overallExperience: number
  }
}

export interface SurveyTemplate {
  id: string
  name: string
  subject: string
  message: string
  questions: Array<{
    id: string
    type: 'rating' | 'text' | 'multiple_choice' | 'boolean'
    question: string
    required: boolean
    options?: string[]
    scale?: {
      min: number
      max: number
      labels: string[]
    }
  }>
  createdAt: Date
  updatedAt: Date
  isActive: boolean
  usage: {
    sent: number
    responded: number
    avgRating: number
  }
}

export interface FollowUpReminder {
  id: string
  enquiryId: string
  type: 'survey' | 'resolution_check' | 'escalation' | 'quality_review'
  scheduledFor: Date
  status: 'pending' | 'sent' | 'completed' | 'cancelled'
  message: string
  recipient: string
  priority: EnquiryPriority
  createdAt: Date
  completedAt?: Date
}

export interface NotificationConfig {
  id: string
  type: 'email' | 'sms' | 'push' | 'in_app'
  trigger: 'enquiry_created' | 'enquiry_assigned' | 'enquiry_escalated' | 'enquiry_resolved' | 'survey_sent' | 'survey_responded'
  conditions: {
    priority?: EnquiryPriority[]
    type?: EnquiryType[]
    status?: EnquiryStatus[]
    assignedTo?: string[]
  }
  recipients: string[]
  template: string
  active: boolean
  createdAt: Date
  lastTriggered?: Date
}

// Extended Automation Types for Sub-Phase 9.6
export interface AutomatedWorkflow {
  id: string
  name: string
  description: string
  isActive: boolean
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  triggers: WorkflowTrigger[]
  conditions: WorkflowCondition[]
  actions: WorkflowAction[]
  createdAt: Date
  updatedAt: Date
  executionCount: number
  lastExecuted?: Date
}

export interface WorkflowTrigger {
  id: string
  type: 'enquiry_created' | 'enquiry_assigned' | 'response_submitted' | 'status_changed' | 'sla_breach' | 'time_based' | 'low_rating'
  conditions?: WorkflowCondition[]
  delay?: number // in minutes
}

export interface WorkflowCondition {
  id: string
  type: 'priority' | 'type' | 'status' | 'response_time' | 'customer_rating' | 'assignee_workload' | 'time_of_day' | 'day_of_week'
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in_range'
  value: any
  logicalOperator?: 'AND' | 'OR'
}

export interface WorkflowAction {
  id: string
  type: 'send_email' | 'send_sms' | 'assign_to_staff' | 'update_priority' | 'add_tag' | 'schedule_followup' | 'escalate' | 'send_notification' | 'create_task'
  parameters: Record<string, any>
  delay: number // in minutes
  order: number
}

export interface WorkflowExecution {
  id: string
  ruleId: string
  ruleName: string
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  startedAt: Date
  completedAt?: Date
  trigger: string
  conditionsMatched: boolean
  actionsExecuted: number
  errors: string[]
}

export interface AutomationRule {
  id: string
  name: string
  description: string
  isActive: boolean
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  conditions: WorkflowCondition[]
  actions: WorkflowAction[]
  triggers: string[]
  createdAt: Date
  updatedAt: Date
  executionCount: number
  lastExecuted?: Date
}

export interface EscalationRule {
  id: string
  name: string
  conditions: {
    timeThreshold: number // in hours
    priority: EnquiryPriority[]
    status: EnquiryStatus[]
    noResponse: boolean
  }
  actions: {
    escalateTo: string
    notifyManager: boolean
    increasePriority: boolean
    sendNotification: boolean
  }
  isActive: boolean
}

export interface FollowUpRule {
  id: string
  name: string
  trigger: 'resolution' | 'no_response' | 'low_rating' | 'time_based'
  delay: number // in hours
  conditions: WorkflowCondition[]
  actions: {
    sendSurvey: boolean
    sendReminder: boolean
    assignFollowup: boolean
    updateStatus: boolean
  }
  isActive: boolean
}

export interface SLAThreshold {
  id: string
  type: 'response' | 'resolution' | 'escalation'
  priority: EnquiryPriority
  targetTime: number // in hours
  warningThreshold: number // percentage
  criticalThreshold: number // percentage
}

export interface WorkflowAnalytics {
  totalExecutions: number
  successRate: number
  averageExecutionTime: number
  rulePerformance: Array<{
    ruleId: string
    ruleName: string
    executions: number
    successRate: number
    averageTime: number
  }>
  timeSavings: {
    hours: number
    cost: number
  }
}

// Multi-Channel Notification System Types
export type CommunicationChannel = 'email' | 'sms' | 'push' | 'in_app'
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent'

export interface MultiChannelNotification {
  id: string
  type: CommunicationChannel
  title: string
  message: string
  priority: NotificationPriority
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read'
  recipient: string
  sentAt: Date
  read?: boolean
  trigger: string
}

export interface NotificationTemplate {
  id: string
  name: string
  subject: string
  content: string
  channels: CommunicationChannel[]
  variables: string[]
  isActive: boolean
  successRate: number
  sentCount: number
  lastSent?: Date
  createdAt: Date
  updatedAt: Date
}

export interface NotificationTrigger {
  id: string
  name: string
  type: string
  description: string
  conditions: {
    priority?: EnquiryPriority[]
    type?: EnquiryType[]
    status?: EnquiryStatus[]
  }
  channels: CommunicationChannel[]
  recipients: string[]
  templateId: string
  isActive: boolean
  triggeredCount: number
  lastTriggered?: Date
  createdAt: Date
}

export interface NotificationAnalytics {
  totalSent: number
  deliveryRate: number
  openRate: number
  clickRate: number
  byChannel: Record<CommunicationChannel, {
    sent: number
    delivered: number
    failed: number
  }>
  trends: Array<{
    date: string
    sent: number
    delivered: number
  }>
}

// Response Time Estimation Types
export interface ResponseTimeEstimation {
  hours: number
  businessDays: number
  confidence: number
  factors: string[]
  basedOn: {
    enquiryType: EnquiryType
    priority: EnquiryPriority
    staffAvailability: number
    currentWorkload: number
  }
}

// Acknowledgment System Types
export interface AcknowledgmentSystem {
  id: string
  isEnabled: boolean
  templates: EnquiryResponseTemplate[]
  autoSend: boolean
  customMessage?: string
  sendDelay: number // in minutes
}

export interface TemplateVariable {
  name: string
  description: string
  example: string
  isRequired: boolean
}

// CRM Integration Types
export interface CRMIntegration {
  id: string
  name: string
  type: 'salesforce' | 'hubspot' | 'zoho' | 'internal'
  isActive: boolean
  configuration: {
    apiEndpoint?: string
    apiKey?: string
    webhookUrl?: string
    syncInterval: number // in minutes
  }
  mappings: {
    customerFields: Record<string, string>
    enquiryFields: Record<string, string>
    customFields: Record<string, string>
  }
}

export interface CustomerJourney {
  id: string
  customerId: string
  customerName: string
  customerEmail: string
  interactions: CustomerInteraction[]
  totalEnquiries: number
  resolvedEnquiries: number
  averageResponseTime: number
  satisfactionScore: number
  lastContact: Date
  status: 'active' | 'inactive' | 'churned'
}

export interface CustomerInteraction {
  id: string
  type: 'enquiry' | 'appointment' | 'followup' | 'survey' | 'call'
  timestamp: Date
  channel: CommunicationChannel
  subject: string
  status: EnquiryStatus
  satisfaction?: number
  notes?: string
  staffMember?: string
}

export interface CRMAnalytics {
  totalCustomers: number
  activeCustomers: number
  averageInteractionsPerCustomer: number
  customerLifetimeValue: number
  retentionRate: number
  churnRate: number
  topInteractionTypes: Array<{
    type: string
    count: number
    percentage: number
  }>
  channelUsage: Record<CommunicationChannel, number>
  satisfactionTrend: Array<{
    date: string
    score: number
  }>
}

// Advanced Template Management
export interface ResponseTimeEstimation {
  hours: number
  businessDays: number
  confidence: number
  factors: string[]
}

export interface CustomerJourneyData {
  totalJourneyTime: number
  touchpoints: number
  satisfactionAtEachStage: Record<string, number>
  conversionRate: number
  dropOffPoints: string[]
}

// Analytics Dashboard Types
export interface AutomationPerformanceMetrics {
  automationRate: number
  timeSaved: number
  costReduction: number
  qualityImprovement: number
  customerSatisfactionIncrease: number
  slaCompliance: number
}

export interface SystemHealthMetrics {
  systemUptime: number
  responseTime: number
  errorRate: number
  throughput: number
  resourceUtilization: {
    cpu: number
    memory: number
    storage: number
  }
}

// Additional types for comprehensive CRM system
export interface CustomerSegment {
  id: string
  name: string
  description: string
  criteria: {
    [key: string]: {
      min?: number
      max?: number
      operator: 'greater_than' | 'less_than' | 'equals'
    }
  }
  customerCount: number
  averageValue: number
  color: string
}

export interface CustomerLifetimeValue {
  customerId: string
  totalValue: number
  averageOrderValue: number
  frequency: number
  customerSince: Date
  predictions: {
    nextYear: number
    lifetime: number
  }
}

export interface RetentionMetrics {
  customerId: string
  retentionRate: number
  churnRisk: 'low' | 'medium' | 'high'
  lastInteraction: Date
  nextAction: string
  predictedChurnDate?: Date
}

export interface InteractionHistory {
  customerId: string
  interactions: CustomerInteraction[]
  totalInteractions: number
  averageGap: number // days between interactions
  preferredChannel: CommunicationChannel
  peakActivityTimes: string[]
}

// Enhanced satisfaction survey types
export interface SurveyResponse {
  id: string
  surveyId: string
  customerId: string
  enquiryId?: string
  responses: Record<string, any>
  submittedAt: Date
  completionTime: number // in seconds
  device: 'desktop' | 'mobile' | 'tablet'
  ipAddress?: string
}

export interface FeedbackAnalysis {
  id: string
  customerId: string
  sentiment: 'positive' | 'neutral' | 'negative'
  confidence: number
  keywords: string[]
  themes: Array<{
    theme: string
    sentiment: 'positive' | 'neutral' | 'negative'
    weight: number
  }>
  actionRequired: boolean
  summary: string
}

export interface SurveyAnalytics {
  totalSent: number
  responseRate: number
  averageCompletionTime: number
  dropOffPoints: Array<{
    questionId: string
    questionText: string
    dropOffRate: number
  }>
  satisfactionTrend: Array<{
    date: string
    score: number
  }>
}

export interface QualityMetrics {
  firstContactResolution: number
  escalationRate: number
  reopenRate: number
  customerEffortScore: number
  agentEffectiveness: number
  processEfficiency: number
}

// Workflow automation execution types
export interface WorkflowSchedule {
  id: string
  workflowId: string
  cronExpression: string
  isActive: boolean
  lastRun?: Date
  nextRun: Date
  executions: WorkflowExecution[]
}

export interface WorkflowPerformance {
  workflowId: string
  averageExecutionTime: number
  successRate: number
  totalExecutions: number
  errorRate: number
  impact: {
    timeSaved: number
    costSaved: number
    qualityImproved: number
  }
}

// Enhanced analytics and reporting
export interface AutomationReport {
  id: string
  name: string
  type: 'performance' | 'efficiency' | 'satisfaction' | 'compliance'
  dateRange: {
    start: Date
    end: Date
  }
  metrics: Record<string, any>
  generatedAt: Date
  generatedBy: string
}

export interface SystemHealthStatus {
  overall: 'healthy' | 'warning' | 'critical'
  components: {
    automation: 'operational' | 'degraded' | 'down'
    notifications: 'operational' | 'degraded' | 'down'
    crm: 'operational' | 'degraded' | 'down'
    templates: 'operational' | 'degraded' | 'down'
  }
  lastCheck: Date
  alerts: Array<{
    severity: 'low' | 'medium' | 'high' | 'critical'
    message: string
    component: string
    timestamp: Date
  }>
}

// Configuration and settings types
export interface SystemConfiguration {
  automation: {
    enabledWorkflows: string[]
    maxExecutionTime: number
    retryAttempts: number
    queueSize: number
  }
  notifications: {
    defaultChannels: CommunicationChannel[]
    rateLimits: Record<CommunicationChannel, number>
    batchSize: number
    retryDelay: number
  }
  crm: {
    syncInterval: number
    batchSize: number
    retryAttempts: number
    timeout: number
  }
  templates: {
    autoApproval: boolean
    maxTemplatesPerUser: number
    versionControl: boolean
  }
}

// Missing type definitions for referenced interfaces
export interface WorkflowSchedule {
  id: string
  workflowId: string
  cronExpression: string
  isActive: boolean
  lastRun?: Date
  nextRun: Date
  executions: WorkflowExecution[]
}

export interface WorkflowPerformance {
  workflowId: string
  averageExecutionTime: number
  successRate: number
  totalExecutions: number
  errorRate: number
  impact: {
    timeSaved: number
    costSaved: number
    qualityImproved: number
  }
}

export interface AutomationReport {
  id: string
  name: string
  type: 'performance' | 'efficiency' | 'satisfaction' | 'compliance'
  dateRange: {
    start: Date
    end: Date
  }
  metrics: Record<string, any>
  generatedAt: Date
  generatedBy: string
}

export interface SystemHealthStatus {
  overall: 'healthy' | 'warning' | 'critical'
  components: {
    automation: 'operational' | 'degraded' | 'down'
    notifications: 'operational' | 'degraded' | 'down'
    crm: 'operational' | 'degraded' | 'down'
    templates: 'operational' | 'degraded' | 'down'
  }
  lastCheck: Date
  alerts: Array<{
    severity: 'low' | 'medium' | 'high' | 'critical'
    message: string
    component: string
    timestamp: Date
  }>
}

// Export all new types
export type {
  CommunicationChannel,
  NotificationPriority,
  WorkflowTrigger,
  WorkflowCondition,
  WorkflowAction,
  WorkflowExecution,
  AutomationRule,
  EscalationRule,
  FollowUpRule,
  SLAThreshold,
  WorkflowAnalytics,
  CustomerSegment,
  CustomerLifetimeValue,
  RetentionMetrics,
  InteractionHistory,
  SurveyResponse,
  FeedbackAnalysis,
  SurveyAnalytics,
  QualityMetrics,
  WorkflowSchedule,
  WorkflowPerformance,
  AutomationReport,
  SystemHealthStatus,
  SystemConfiguration
}