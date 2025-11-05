// Enquiry Management Components
export { default as EnquiryDashboard } from './enquiry-dashboard'
export { default as EnquiryList } from './enquiry-list'
export { default as EnquiryDetail } from './enquiry-detail'
export { default as EnquiryFilters } from './enquiry-filters'
export { default as EnquiryStats } from './enquiry-stats'
export { default as EnquiryAssignment } from './enquiry-assignment'
export { default as EnquiryEscalation } from './enquiry-escalation'
export { default as EnquiryWorkflow } from './enquiry-workflow'
export { default as EnquiryNotificationCenter } from './enquiry-notification-center'
export { default as EnquiryAnalyticsDashboard } from './enquiry-analytics-dashboard'
export { default as EnquirySatisfactionTracker } from './enquiry-satisfaction-tracker'

// Automated Response & Confirmation Workflow Components
export { AutomatedResponseSystem } from './automated-response-system'
export { MultiChannelNotificationSystem } from './multi-channel-notification-system'
export { SurveyManagementSystem, SurveyBuilder, SatisfactionAnalyticsDashboard, NPSScoreCard } from './satisfaction-survey-system'
export { WorkflowAutomationEngine } from './workflow-automation-engine'
export { CRMIntegrationSystem } from './crm-integration-system'
export { AutomatedResponseConfirmationWorkflows } from './automated-response-confirmation-workflows'

// Types
export type {
  EnquiryData,
  EnquiryWithDetails,
  EnquiryFilters as EnquiryFilterOptions,
  EnquiryStats as EnquiryStatsData,
  EnquiryAssignment as EnquiryAssignmentData,
  EnquiryEscalation as EnquiryEscalationData,
  EnquiryWorkflow as EnquiryWorkflowData,
  EnquiryAnalyticsData,
  StaffPerformanceData,
  SatisfactionSurvey,
  SatisfactionMetrics,
  SurveyTemplate,
  FollowUpReminder,
  NotificationConfig,
  // Extended automation types
  AutomatedWorkflow,
  WorkflowTrigger,
  WorkflowCondition,
  WorkflowAction,
  WorkflowExecution,
  AutomationRule,
  EscalationRule,
  FollowUpRule,
  SLAThreshold,
  WorkflowAnalytics,
  MultiChannelNotification,
  NotificationTemplate,
  NotificationTrigger,
  NotificationAnalytics,
  ResponseTimeEstimation,
  AcknowledgmentSystem,
  TemplateVariable,
  CRMIntegration,
  CustomerJourney,
  CustomerInteraction,
  CRMAnalytics,
  CustomerSegment,
  CustomerLifetimeValue,
  RetentionMetrics,
  InteractionHistory,
  SurveyResponse,
  FeedbackAnalysis,
  SurveyAnalytics,
  QualityMetrics,
  AutomationReport,
  SystemHealthStatus,
  SystemConfiguration,
  AutomationPerformanceMetrics,
  SystemHealthMetrics,
} from './types'