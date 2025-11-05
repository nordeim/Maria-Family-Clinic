/**
 * Performance Budget Compliance Types
 * Performance budget enforcement and monitoring types
 */

export interface PerformanceBudgetConfig {
  name: string
  description: string
  enabled: boolean
  budgets: PerformanceBudget[]
  enforcement: BudgetEnforcementConfig
  monitoring: BudgetMonitoringConfig
  reporting: BudgetReportingConfig
  automation: BudgetAutomationConfig
}

export interface PerformanceBudget {
  id: string
  name: string
  category: 'page-load' | 'api-response' | 'healthcare-workflow' | 'cross-browser' | 'mobile' | 'bundle' | 'memory' | 'network'
  metric: BudgetMetric
  environments: BudgetEnvironment[]
  healthcareSpecific: boolean
  complianceRequired: boolean
  priority: 'low' | 'medium' | 'high' | 'critical'
  createdAt: number
  updatedAt: number
  tags: string[]
  dependencies: string[]
}

export interface BudgetMetric {
  type: 'web-vital' | 'response-time' | 'bundle-size' | 'memory-usage' | 'network-request' | 'healthcare-workflow' | 'custom'
  name: string
  unit: string
  direction: 'lower-is-better' | 'higher-is-better' | 'exact-match'
  calculation: string
  source: 'browser' | 'server' | 'synthetic' | 'real-user' | 'external'
  validation: MetricValidation
}

export interface MetricValidation {
  enabled: boolean
  rules: ValidationRule[]
  alerts: ValidationAlert[]
  suppression: ValidationSuppression
}

export interface ValidationRule {
  type: 'range' | 'threshold' | 'pattern' | 'comparison' | 'healthcare-context'
  condition: string
  value: any
  message: string
  critical: boolean
}

export interface ValidationAlert {
  type: 'warning' | 'error' | 'critical'
  condition: string
  threshold: number
  channels: AlertChannel[]
  escalation: AlertEscalation
}

export interface AlertChannel {
  type: 'email' | 'slack' | 'teams' | 'webhook' | 'dashboard' | 'sms'
  config: Record<string, any>
  enabled: boolean
  recipients: string[]
}

export interface AlertEscalation {
  enabled: boolean
  levels: AlertLevel[]
  maxLevel: number
  timeout: number
}

export interface AlertLevel {
  level: number
  delay: number
  channels: AlertChannel[]
  conditions: AlertCondition[]
}

export interface AlertCondition {
  type: 'threshold-exceeded' | 'healthcare-workflow-impact' | 'compliance-violation' | 'user-impact'
  metric: string
  threshold: number
  timeframe: number
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export interface ValidationSuppression {
  enabled: boolean
  duration: number
  conditions: SuppressionCondition[]
  maxSuppressations: number
}

export interface SuppressionCondition {
  type: 'maintenance-window' | 'known-issue' | 'planned-change' | 'emergency-healthcare'
  pattern: string
  description: string
  startTime: number
  endTime: number
  approvedBy?: string
}

export interface BudgetEnvironment {
  name: 'development' | 'staging' | 'production' | 'healthcare-staging' | 'emergency'
  thresholds: EnvironmentThreshold[]
  conditions: EnvironmentCondition[]
  dependencies: string[]
  healthcareSettings: HealthcareEnvironmentSettings
}

export interface EnvironmentThreshold {
  level: 'info' | 'warning' | 'error' | 'critical'
  value: number
  unit: string
  action: 'monitor' | 'alert' | 'block' | 'fail-build'
  healthcareOverride: boolean
}

export interface EnvironmentCondition {
  type: 'time-based' | 'user-load' | 'healthcare-scenario' | 'deployment-type'
  condition: string
  value: any
  impact: string
}

export interface HealthcareEnvironmentSettings {
  emergencyMode: boolean
  criticalWorkflowOverride: boolean
  pdpaComplianceMode: boolean
  medicalDataProtection: boolean
  healthcareApiPrioritization: boolean
}

export interface BudgetEnforcementConfig {
  buildFailure: {
    enabled: boolean
    thresholds: BuildFailureThreshold[]
    environments: string[]
    healthcareOverrides: boolean
  }
  deploymentBlocking: {
    enabled: boolean
    conditions: DeploymentBlockCondition[]
    emergencyOverride: boolean
    approvalWorkflow: ApprovalWorkflow
  }
  realTimeAlerts: {
    enabled: boolean
    channels: AlertChannel[]
    severity: 'info' | 'warning' | 'error' | 'critical'
    rateLimits: AlertRateLimit[]
  }
}

export interface BuildFailureThreshold {
  metric: string
  environment: string
  threshold: number
  severity: 'warning' | 'error' | 'critical'
  blockDeployment: boolean
  healthcareWorkflow: string
}

export interface DeploymentBlockCondition {
  type: 'performance-budget-violation' | 'healthcare-workflow-impact' | 'compliance-violation'
  metric: string
  threshold: number
  duration: number
  environments: string[]
  emergencyApproval: boolean
}

export interface ApprovalWorkflow {
  required: boolean
  approvers: string[]
  timeout: number
  conditions: ApprovalCondition[]
  emergencyOverride: boolean
}

export interface ApprovalCondition {
  type: 'critical-performance-issue' | 'healthcare-workflow-failure' | 'compliance-violation' | 'emergency-deployment'
  metric: string
  threshold: string
  value: any
  justification: string
}

export interface AlertRateLimit {
  channel: string
  limit: number
  window: number
  burst: number
  healthcareWorkflow: string
}

export interface BudgetMonitoringConfig {
  realTimeMonitoring: {
    enabled: boolean
    intervals: MonitoringInterval[]
    endpoints: string[]
    dataRetention: number
  }
  scheduledChecks: {
    enabled: boolean
    schedules: ScheduledCheck[]
    environments: string[]
    healthcareWorkflows: string[]
  }
  trendAnalysis: {
    enabled: boolean
    window: number
    granularity: 'hourly' | 'daily' | 'weekly' | 'monthly'
    comparison: TrendComparison
  }
}

export interface MonitoringInterval {
  metric: string
  interval: number
  priority: 'low' | 'medium' | 'high' | 'critical'
  healthcareWorkflow: string
}

export interface ScheduledCheck {
  name: string
  cronExpression: string
  budgets: string[]
  environments: string[]
  actions: CheckAction[]
  healthcareWorkflow: string
}

export interface CheckAction {
  type: 'validate' | 'alert' | 'report' | 'remediate'
  config: Record<string, any>
  enabled: boolean
}

export interface TrendAnalysis {
  enabled: boolean
  window: number
  granularity: 'hourly' | 'daily' | 'weekly' | 'monthly'
  comparison: TrendComparison
  predictions: TrendPrediction
}

export interface TrendComparison {
  type: 'previous-period' | 'baseline' | 'target' | 'industry-benchmark'
  baseline: string
  window: number
  healthcareWorkflow: string
}

export interface TrendPrediction {
  enabled: boolean
  algorithm: 'linear' | 'exponential' | 'seasonal' | 'machine-learning'
  confidence: number
  horizon: number
  healthcareRelevance: boolean
}

export interface BudgetReportingConfig {
  formats: ('json' | 'html' | 'csv' | 'pdf' | 'excel' | 'dashboard')[]
  schedules: ReportSchedule[]
  dashboards: BudgetDashboardConfig[]
  notifications: BudgetNotificationConfig
  automation: ReportAutomation
}

export interface ReportSchedule {
  name: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  budgets: string[]
  environments: string[]
  recipients: string[]
  format: string
  healthcareWorkflows: string[]
}

export interface BudgetDashboardConfig {
  name: string
  type: 'overview' | 'performance' | 'healthcare' | 'compliance' | 'trends' | 'violations'
  refreshInterval: number
  widgets: BudgetWidget[]
  filters: BudgetFilter[]
  healthcareSettings: BudgetDashboardHealthcareSettings
}

export interface BudgetWidget {
  type: 'budget-status' | 'violation-chart' | 'trend-analysis' | 'healthcare-metrics' | 'compliance-score' | 'alert-list'
  title: string
  config: WidgetConfig
  position: { x: number; y: number; width: number; height: number }
  budgetIds: string[]
  healthcareWorkflow: string
}

export interface WidgetConfig {
  metric: string
  timeRange: string
  environment: string
  comparison: string
  threshold: number
  severity: 'info' | 'warning' | 'error' | 'critical'
  aggregation: 'sum' | 'avg' | 'max' | 'min' | 'count'
}

export interface BudgetFilter {
  type: 'budget-category' | 'environment' | 'severity' | 'healthcare-workflow' | 'compliance-status'
  options: BudgetFilterOption[]
  default: string | string[]
  multiSelect: boolean
}

export interface BudgetFilterOption {
  value: string
  label: string
  count: number
  selected: boolean
  healthcareWorkflow: string
}

export interface BudgetDashboardHealthcareSettings {
  emergencyMode: boolean
  healthcareKpi: boolean
  patientSafetyMetrics: boolean
  complianceIntegration: boolean
  multiLanguageSupport: boolean
}

export interface BudgetNotificationConfig {
  enabled: boolean
  channels: BudgetNotificationChannel[]
  conditions: BudgetNotificationCondition[]
  escalation: BudgetEscalationConfig
  healthcareOverride: boolean
}

export interface BudgetNotificationChannel {
  type: 'email' | 'slack' | 'teams' | 'webhook' | 'dashboard' | 'sms' | 'push-notification'
  config: Record<string, any>
  enabled: boolean
  budgetIds: string[]
  severities: string[]
  healthcareWorkflows: string[]
}

export interface BudgetNotificationCondition {
  type: 'budget-violation' | 'threshold-exceeded' | 'healthcare-workflow-impact' | 'compliance-breach'
  budgetId: string
  metric: string
  severity: 'info' | 'warning' | 'error' | 'critical'
  timeframe: number
  suppression: NotificationSuppression
}

export interface NotificationSuppression {
  enabled: boolean
  duration: number
  conditions: NotificationSuppressionCondition[]
}

export interface NotificationSuppressionCondition {
  type: 'maintenance' | 'emergency-healthcare' | 'known-issue' | 'planned-change'
  pattern: string
  description: string
  startTime: number
  endTime: number
  approvedBy: string
}

export interface BudgetEscalationConfig {
  enabled: boolean
  levels: BudgetEscalationLevel[]
  maxLevel: number
  timeout: number
  healthcareEscalation: HealthcareEscalationLevel[]
}

export interface BudgetEscalationLevel {
  level: number
  delay: number
  channels: BudgetNotificationChannel[]
  conditions: BudgetNotificationCondition[]
  approvalRequired: boolean
  approvers: string[]
}

export interface HealthcareEscalationLevel {
  level: number
  delay: number
  roles: string[]
  emergencyContact: string[]
  notificationMethods: ('email' | 'sms' | 'phone' | 'push')[]
  healthcareWorkflows: string[]
}

export interface ReportAutomation {
  enabled: boolean
  triggers: ReportTrigger[]
  templates: ReportTemplate[]
  distribution: ReportDistribution
  customization: ReportCustomization
}

export interface ReportTrigger {
  type: 'budget-violation' | 'threshold-exceeded' | 'scheduled' | 'manual' | 'deployment' | 'healthcare-event'
  condition: string
  budgets: string[]
  format: string
  recipients: string[]
  healthcareWorkflow: string
}

export interface ReportTemplate {
  name: string
  type: 'executive' | 'technical' | 'healthcare' | 'compliance'
  template: string
  sections: ReportSection[]
  healthcareIntegration: boolean
  complianceMapping: ComplianceMapping
}

export interface ReportSection {
  name: string
  type: 'summary' | 'metrics' | 'violations' | 'trends' | 'recommendations' | 'healthcare-impact'
  config: Record<string, any>
  required: boolean
}

export interface ComplianceMapping {
  pdpa: boolean
  moh: boolean
  medicalRecords: boolean
  dataEncryption: boolean
  auditTrail: boolean
}

export interface ReportDistribution {
  destinations: ReportDestination[]
  scheduling: ReportScheduling
  authentication: ReportAuthentication
}

export interface ReportDestination {
  type: 'email' | 's3' | 'sharepoint' | 'dashboard' | 'api'
  config: Record<string, any>
  enabled: boolean
  healthcareCompliance: boolean
}

export interface ReportScheduling {
  automatic: boolean
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly' | 'monthly'
  timezone: string
  delay: number
  healthcareOverride: boolean
}

export interface ReportAuthentication {
  required: boolean
  methods: ('basic' | 'oauth' | 'api-key' | 'certificate')[]
  roles: string[]
  healthcareAccess: string[]
}

export interface ReportCustomization {
  branding: ReportBranding
  sections: CustomReportSection[]
  filters: CustomReportFilter[]
  healthcareIntegration: HealthcareReportIntegration
}

export interface ReportBranding {
  logo: string
  colors: string[]
  companyName: string
  reportTitle: string
  healthcareBranding: boolean
}

export interface CustomReportSection {
  name: string
  content: string
  data: Record<string, any>
  enabled: boolean
  healthcareRelevance: string
}

export interface CustomReportFilter {
  field: string
  operator: string
  value: any
  healthcareWorkflow: string
}

export interface HealthcareReportIntegration {
  patientImpact: boolean
  clinicalWorkflow: boolean
  regulatoryCompliance: boolean
  safetyMetrics: boolean
  emergencyProtocols: boolean
}

export interface BudgetAutomationConfig {
  remediation: {
    enabled: boolean
    rules: RemediationRule[]
    approvals: RemediationApproval
    rollback: RemediationRollback
  }
  optimization: {
    enabled: boolean
    strategies: OptimizationStrategy[]
    validation: OptimizationValidation
  }
  compliance: {
    enabled: boolean
    checks: ComplianceCheck[]
    automation: ComplianceAutomation
  }
}

export interface RemediationRule {
  id: string
  condition: string
  action: string
  parameters: Record<string, any>
  priority: 'low' | 'medium' | 'high' | 'critical'
  healthcareWorkflow: string
  approvalRequired: boolean
}

export interface RemediationApproval {
  required: boolean
  approvers: string[]
  timeout: number
  conditions: RemediationApprovalCondition[]
  healthcareOverride: boolean
}

export interface RemediationApprovalCondition {
  type: 'critical-remediation' | 'healthcare-workflow-impact' | 'compliance-risk'
  threshold: string
  value: any
  justification: string
}

export interface RemediationRollback {
  enabled: boolean
  triggers: RollbackTrigger[]
  conditions: RollbackCondition[]
  healthcareProtection: boolean
}

export interface RollbackTrigger {
  type: 'remediation-failure' | 'performance-degradation' | 'healthcare-workflow-impact' | 'compliance-violation'
  threshold: number
  duration: number
  healthcareWorkflow: string
}

export interface RollbackCondition {
  type: 'success-metric' | 'user-satisfaction' | 'healthcare-outcome' | 'compliance-score'
  metric: string
  threshold: number
  window: number
}

export interface OptimizationStrategy {
  type: 'performance' | 'bundle' | 'caching' | 'compression' | 'healthcare-workflow'
  name: string
  parameters: Record<string, any>
  validation: OptimizationValidation
  healthcareRelevance: string
}

export interface OptimizationValidation {
  enabled: boolean
  tests: OptimizationTest[]
  metrics: string[]
  timeframe: number
  healthcareWorkflow: string
}

export interface OptimizationTest {
  name: string
  type: 'ab-test' | 'a-b-test' | 'feature-flag' | 'gradual-rollout'
  parameters: Record<string, any>
  successCriteria: string
  rollback: RollbackConfig
}

export interface RollbackConfig {
  enabled: boolean
  triggers: RollbackTrigger[]
  conditions: RollbackCondition[]
  timeframe: number
}

export interface ComplianceCheck {
  type: 'pdpa' | 'moh-regulations' | 'medical-records' | 'data-encryption' | 'audit-trail'
  enabled: boolean
  frequency: number
  thresholds: ComplianceThreshold[]
  automation: ComplianceAutomation
}

export interface ComplianceThreshold {
  requirement: string
  threshold: number
  unit: string
  critical: boolean
  healthcareWorkflow: string
}

export interface ComplianceAutomation {
  enabled: boolean
  actions: ComplianceAction[]
  reporting: ComplianceReporting
  healthcareOverride: boolean
}

export interface ComplianceAction {
  type: 'alert' | 'block' | 'report' | 'remediate'
  condition: string
  parameters: Record<string, any>
  approvalRequired: boolean
}

export interface ComplianceReporting {
  enabled: boolean
  format: string
  recipients: string[]
  frequency: string
  healthcareIntegration: boolean
}

export interface BudgetViolation {
  id: string
  budgetId: string
  violationType: 'threshold-exceeded' | 'healthcare-workflow-impact' | 'compliance-breach' | 'real-time-violation'
  metric: string
  actualValue: number
  thresholdValue: number
  severity: 'info' | 'warning' | 'error' | 'critical'
  timestamp: number
  environment: string
  buildId?: string
  commitHash?: string
  userId?: string
  sessionId?: string
  healthcareWorkflow: string
  impact: string
  recommendations: string[]
  status: 'open' | 'acknowledged' | 'resolved' | 'suppressed'
  resolvedAt?: number
  resolvedBy?: string
  suppression?: BudgetSuppression
}

export interface BudgetSuppression {
  id: string
  reason: string
  startTime: number
  endTime: number
  approvedBy: string
  conditions: SuppressionCondition[]
  healthcareOverride: boolean
}

export interface BudgetComplianceResult {
  budgetId: string
  timestamp: number
  environment: string
  status: 'compliant' | 'warning' | 'violation' | 'critical'
  score: number
  violations: BudgetViolation[]
  trends: BudgetTrend[]
  recommendations: BudgetRecommendation[]
  healthcareImpact: HealthcareBudgetImpact
}

export interface BudgetTrend {
  period: string
  value: number
  change: number
  changePercent: number
  trend: 'improving' | 'stable' | 'degrading'
  healthcareRelevance: string
}

export interface BudgetRecommendation {
  id: string
  category: 'optimization' | 'fix' | 'investigation' | 'configuration' | 'healthcare-workflow'
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  impact: string
  implementation: string
  estimatedEffort: string
  dependencies: string[]
  healthcareRelevance: string
  automation: BudgetRecommendationAutomation
}

export interface BudgetRecommendationAutomation {
  canAutomate: boolean
  automationLevel: 'partial' | 'full' | 'none'
  scripts: RecommendationScript[]
  configuration: Record<string, any>
  validation: RecommendationValidation[]
}

export interface RecommendationScript {
  name: string
  language: string
  purpose: string
  parameters: Record<string, any>
  output: string
  healthcareContext: string
}

export interface RecommendationValidation {
  type: 'performance' | 'healthcare-workflow' | 'compliance' | 'user-experience'
  metric: string
  operator: string
  value: any
  message: string
  healthcareWorkflow: string
}

export interface HealthcareBudgetImpact {
  patientJourney: {
    impact: 'positive' | 'negative' | 'neutral'
    affectedUsers: number
    severity: 'low' | 'medium' | 'high' | 'critical'
    description: string
  }
  appointmentBooking: {
    performanceImpact: number
    successRateImpact: number
    userExperienceImpact: number
  }
  doctorSearch: {
    searchTimeImpact: number
    resultsQualityImpact: number
    filterPerformanceImpact: number
  }
  clinicDiscovery: {
    locationAccuracyImpact: number
    contactIntegrationImpact: number
    availabilityCheckImpact: number
  }
  complianceImpact: {
    pdpaCompliance: number
    medicalDataProtection: number
    auditTrailIntegrity: number
  }
}

export default {}