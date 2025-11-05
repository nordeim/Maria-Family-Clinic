/**
 * Regression Testing Types
 * Performance regression testing and baseline comparison types
 */

export interface RegressionTestConfig {
  name: string
  enabled: boolean
  testCases: RegressionTestCase[]
  baselineConfig: BaselineConfig
  comparisonRules: RegressionComparisonRule[]
  alertConfig: RegressionAlertConfig
  automation: RegressionAutomationConfig
}

export interface RegressionTestCase {
  id: string
  name: string
  description: string
  url: string
  category: 'core' | 'healthcare-workflow' | 'appointment' | 'search' | 'contact' | 'compliance'
  priority: 'low' | 'medium' | 'high' | 'critical'
  testType: 'lighthouse' | 'puppeteer' | 'custom' | 'k6'
  configuration: RegressionTestConfiguration
  expectedMetrics: ExpectedRegressionMetrics
  criticalPaths: string[]
  dependencies: string[]
}

export interface RegressionTestConfiguration {
  browserSettings: {
    userAgent?: string
    viewport?: { width: number; height: number }
    deviceEmulation?: string
    networkThrottling?: NetworkThrottling
  }
  testSettings: {
    timeout: number
    retries: number
    waitForNetworkIdle: boolean
    captureScreenshots: boolean
    recordVideo: boolean
  }
  customSetup?: string
  customTeardown?: string
}

export interface NetworkThrottling {
  connectionType: '4g' | '3g' | '2g' | 'slow-2g' | 'wifi' | 'custom'
  customSettings?: {
    downloadThroughput: number
    uploadThroughput: number
    latency: number
  }
}

export interface ExpectedRegressionMetrics {
  performance: PerformanceMetrics
  bundle: BundleMetrics
  memory: MemoryMetrics
  network: NetworkMetrics
  healthcare: HealthcareRegressionMetrics
  accessibility: AccessibilityMetrics
}

export interface PerformanceMetrics {
  loadTime: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  cumulativeLayoutShift: number
  firstInputDelay: number
  timeToInteractive: number
  speedIndex: number
  totalBlockingTime: number
  domContentLoaded: number
}

export interface BundleMetrics {
  totalSize: number
  gzippedSize: number
  chunksCount: number
  modulesCount: number
  duplicateChunks: number
  unusedChunks: number
  largestChunk: number
}

export interface MemoryMetrics {
  heapUsed: number
  heapTotal: number
  heapLimit: number
  external: number
  arrayBuffers: number
  peakHeapUsed: number
}

export interface NetworkMetrics {
  totalRequests: number
  totalSize: number
  mainDocument: number
  stylesheets: number
  scripts: number
  images: number
  fonts: number
  other: number
  cacheHitRate: number
}

export interface HealthcareRegressionMetrics {
  appointmentBooking: {
    loadTime: number
    searchTime: number
    bookingTime: number
    successRate: number
  }
  clinicSearch: {
    searchTime: number
    resultsLoadTime: number
    filterPerformance: number
    accuracy: number
  }
  doctorDiscovery: {
    profileLoadTime: number
    searchTime: number
    availabilityCheck: number
    reviewLoadTime: number
  }
  formSubmission: {
    validationTime: number
    submissionTime: number
    successRate: number
    errorHandling: number
  }
}

export interface AccessibilityMetrics {
  score: number
  issues: AccessibilityIssue[]
  wcagLevel: 'A' | 'AA' | 'AAA'
  automatedChecks: number
  manualChecks: number
}

export interface AccessibilityIssue {
  type: string
  severity: 'minor' | 'moderate' | 'serious' | 'critical'
  description: string
  impact: string
  elements: string[]
  recommendation: string
}

export interface BaselineConfig {
  source: 'previous-run' | 'manual' | 'environment' | 'git-tag'
  autoUpdate: boolean
  retention: number
  environments: string[]
  updateFrequency: 'daily' | 'weekly' | 'monthly' | 'never'
  validation: BaselineValidationConfig
}

export interface BaselineValidationConfig {
  enabled: boolean
  thresholds: BaselineThreshold[]
  approvalRequired: boolean
  autoReject: boolean
}

export interface BaselineThreshold {
  metric: string
  maxChange: number
  criticalChange: number
  warningChange: number
}

export interface RegressionComparisonRule {
  metric: string
  comparisonType: 'absolute' | 'percentage' | 'ratio'
  operator: 'greater-than' | 'less-than' | 'equals' | 'within-range'
  threshold: number
  severity: 'info' | 'warning' | 'error' | 'critical'
  action: 'allow' | 'block' | 'warn' | 'notify'
  healthcareRelevance: boolean
}

export interface RegressionAlertConfig {
  enabled: boolean
  channels: AlertChannel[]
  conditions: AlertCondition[]
  escalation: EscalationConfig
  suppression: AlertSuppressionConfig
}

export interface AlertChannel {
  type: 'email' | 'slack' | 'teams' | 'webhook' | 'dashboard'
  config: Record<string, any>
  enabled: boolean
}

export interface AlertCondition {
  type: 'threshold-exceeded' | 'regression-detected' | 'failure-rate' | 'healthcare-workflow-impact'
  metric: string
  threshold: number
  timeframe: number
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export interface EscalationConfig {
  enabled: boolean
  levels: EscalationLevel[]
  maxLevel: number
  timeout: number
}

export interface EscalationLevel {
  level: number
  delay: number
  channels: AlertChannel[]
  conditions: AlertCondition[]
}

export interface AlertSuppressionConfig {
  enabled: boolean
  duration: number
  conditions: AlertSuppressionCondition[]
  maxSuppressions: number
}

export interface AlertSuppressionCondition {
  type: 'maintenance-window' | 'known-issue' | 'planned-change'
  pattern: string
  description: string
  startTime: number
  endTime: number
}

export interface RegressionAutomationConfig {
  enabled: boolean
  triggers: AutomationTrigger[]
  schedules: AutomationSchedule[]
  approvals: AutomationApproval[]
  reporting: AutomationReporting
}

export interface AutomationTrigger {
  type: 'on-commit' | 'on-merge' | 'on-deployment' | 'scheduled' | 'manual'
  conditions: TriggerCondition[]
  priority: 'low' | 'medium' | 'high' | 'critical'
}

export interface TriggerCondition {
  type: 'branch' | 'file-pattern' | 'commit-message' | 'deployment-type'
  pattern: string
  value: string
}

export interface AutomationSchedule {
  name: string
  cronExpression: string
  enabled: boolean
  testSuites: string[]
  environments: string[]
}

export interface AutomationApproval {
  required: boolean
  approvers: string[]
  timeout: number
  conditions: ApprovalCondition[]
}

export interface ApprovalCondition {
  type: 'regression-severity' | 'healthcare-impact' | 'compliance-violation' | 'performance-degradation'
  threshold: string
  value: any
}

export interface AutomationReporting {
  formats: ('json' | 'html' | 'pdf' | 'csv')[]
  destinations: ReportDestination[]
  scheduling: ReportScheduling
  customization: ReportCustomization
}

export interface ReportDestination {
  type: 'filesystem' | 's3' | 'email' | 'slack' | 'teams' | 'webhook'
  config: Record<string, any>
  enabled: boolean
}

export interface ReportScheduling {
  automatic: boolean
  frequency: 'after-test' | 'daily' | 'weekly' | 'monthly'
  recipients: string[]
}

export interface ReportCustomization {
  includeScreenshots: boolean
  includeVideos: boolean
  includeLogs: boolean
  includeHealthcareMetrics: boolean
  includeComplianceResults: boolean
  branding: ReportBranding
}

export interface ReportBranding {
  logo?: string
  colors: string[]
  companyName: string
  reportTitle: string
}

export interface RegressionTestResult {
  testCaseId: string
  testName: string
  timestamp: number
  duration: number
  status: 'passed' | 'failed' | 'error' | 'timeout'
  environment: string
  currentMetrics: ExpectedRegressionMetrics
  baselineMetrics: ExpectedRegressionMetrics
  comparison: RegressionComparison
  issues: RegressionIssue[]
  recommendations: RegressionRecommendation[]
  artifacts: RegressionArtifact[]
  metadata: RegressionTestMetadata
}

export interface RegressionComparison {
  overall: {
    improved: boolean
    degraded: boolean
    changed: number
    criticalChanges: number
  }
  metrics: MetricComparison[]
  healthcare: HealthcareComparison
  compliance: ComplianceComparison
  visual: VisualComparison
}

export interface MetricComparison {
  metric: string
  category: string
  current: number
  baseline: number
  change: number
  changePercent: number
  severity: 'improvement' | 'acceptable' | 'warning' | 'regression' | 'critical'
  threshold: number
  operator: string
  healthcareImpact: string
}

export interface HealthcareComparison {
  workflowComparisons: Map<string, WorkflowComparison>
  overallScore: {
    current: number
    baseline: number
    change: number
  }
  patientJourneyImpact: PatientJourneyImpact[]
  complianceImpact: ComplianceImpact[]
}

export interface WorkflowComparison {
  workflowId: string
  workflowName: string
  current: number
  baseline: number
  change: number
  changePercent: number
  impact: 'positive' | 'negative' | 'neutral'
  severity: 'improvement' | 'acceptable' | 'degradation' | 'critical'
}

export interface PatientJourneyImpact {
  journeyId: string
  stageId: string
  impact: 'positive' | 'negative' | 'neutral'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  affectedUsers: number
}

export interface ComplianceImpact {
  requirement: string
  impact: 'positive' | 'negative' | 'neutral'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  regulatoryRelevance: string
}

export interface ComplianceComparison {
  overall: {
    current: number
    baseline: number
    change: number
  }
  requirements: Map<string, RequirementComparison>
  violations: ComplianceViolation[]
}

export interface RequirementComparison {
  requirementId: string
  requirementName: string
  current: number
  baseline: number
  change: number
  status: 'improved' | 'maintained' | 'degraded' | 'violation'
  critical: boolean
}

export interface ComplianceViolation {
  requirement: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  impact: string
  remediation: string
  deadline?: number
}

export interface VisualComparison {
  screenshots: VisualScreenshot[]
  differences: VisualDifference[]
  score: {
    current: number
    baseline: number
    change: number
  }
}

export interface VisualScreenshot {
  name: string
  timestamp: number
  path: string
  size: number
  dimensions: { width: number; height: number }
}

export interface VisualDifference {
  selector: string
  type: 'layout' | 'content' | 'styling' | 'behavior'
  description: string
  severity: 'minor' | 'moderate' | 'major' | 'critical'
  similarity: number
  threshold: number
}

export interface RegressionIssue {
  id: string
  type: 'performance' | 'bundle' | 'memory' | 'network' | 'healthcare' | 'accessibility' | 'compliance'
  severity: 'info' | 'warning' | 'error' | 'critical'
  title: string
  description: string
  metric: string
  currentValue: number
  baselineValue: number
  threshold: number
  impact: string
  recommendation: string
  estimatedFixTime: string
  affectedUsers: number
  healthcareRelevance: string
}

export interface RegressionRecommendation {
  id: string
  category: 'optimization' | 'fix' | 'investigation' | 'configuration' | 'compliance'
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  impact: string
  implementation: string
  estimatedEffort: string
  dependencies: string[]
  healthcareRelevance: string
  automation: RecommendationAutomation
}

export interface RecommendationAutomation {
  canAutomate: boolean
  automationLevel: 'partial' | 'full' | 'none'
  scriptAvailable: boolean
  configuration: AutomationConfiguration[]
}

export interface AutomationConfiguration {
  type: 'performance-optimization' | 'bundle-splitting' | 'caching' | 'compression' | 'compliance-check'
  description: string
  parameters: Record<string, any>
  validation: ValidationRule[]
}

export interface ValidationRule {
  type: 'metric' | 'healthcare-workflow' | 'compliance' | 'user-experience'
  metric: string
  operator: string
  value: any
  message: string
}

export interface RegressionArtifact {
  name: string
  type: 'screenshot' | 'video' | 'profile' | 'log' | 'network-trace' | 'lighthouse-report' | 'bundle-report'
  path: string
  size: number
  contentType: string
  timestamp: number
  metadata: Record<string, any>
}

export interface RegressionTestMetadata {
  commitHash: string
  branch: string
  author: string
  message: string
  buildNumber: string
  environment: string
  runnerId: string
  custom: Record<string, any>
}

export default {}