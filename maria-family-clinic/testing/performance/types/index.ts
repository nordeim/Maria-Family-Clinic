/**
 * Performance Testing & Validation Types
 * Sub-Phase 10.7: Performance Testing & Validation
 * Comprehensive type definitions for healthcare-specific performance testing
 */

// Load Testing Types
export interface LoadTestConfig {
  name: string
  url: string
  virtualUsers: number
  duration: string
  rampUpTime: string
  scenarios: LoadTestScenario[]
  thresholds?: LoadTestThresholds
  environment: 'development' | 'staging' | 'production'
  healthcareWorkflows: HealthcareWorkflowTest[]
}

export interface LoadTestScenario {
  name: string
  weight: number
  executor: 'constant-vus' | 'ramping-vus' | 'per-vu-iterations'
  startTime?: string
  stages?: Array<{
    duration: string
    target: number
  }>
  iterations?: number
  maxIterations?: number
  responseTimeThreshold?: number
  thinkTime?: string
}

export interface LoadTestThresholds {
  http_req_duration: {
    'p(95)': number
    'p(99)': number
  }
  http_req_failed: {
    'rate>': number
  }
  checks: {
    'rate>': number
  }
  vus: {
    max: number
  }
}

export interface LoadTestResult {
  testName: string
  timestamp: number
  duration: number
  virtualUsers: number
  httpRequests: {
    total: number
    successful: number
    failed: number
    rate: number
    avgResponseTime: number
    p95ResponseTime: number
    p99ResponseTime: number
  }
  checks: {
    passed: number
    failed: number
    rate: number
  }
  scenarioMetrics: Map<string, ScenarioMetric>
  errors: LoadTestError[]
  healthcareMetrics: HealthcarePerformanceMetrics
}

export interface ScenarioMetric {
  name: string
  iterations: number
  responseTime: {
    avg: number
    p95: number
    p99: number
    min: number
    max: number
  }
  successRate: number
}

export interface LoadTestError {
  type: string
  count: number
  examples: string[]
}

// Healthcare-Specific Testing Types
export interface HealthcareWorkflowTest {
  id: string
  name: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  workflows: HealthcareWorkflow[]
  expectedDuration: number
  concurrentUsers: number
  successCriteria: HealthcareSuccessCriteria
}

export interface HealthcareWorkflow {
  id: string
  name: string
  steps: WorkflowStep[]
  metadata: {
    userType: 'patient' | 'clinic-admin' | 'doctor' | 'family-member'
    healthcareContext: 'emergency' | 'routine' | 'preventive' | 'specialist'
    language: 'en' | 'zh' | 'ms' | 'ta'
  }
}

export interface WorkflowStep {
  id: string
  action: 'navigate' | 'click' | 'type' | 'upload' | 'search' | 'select'
  selector: string
  value?: string
  delay?: number
  timeout?: number
  expectedResult?: string
  healthcareValidation?: HealthcareValidation
}

export interface HealthcareValidation {
  dataIntegrity: boolean
  complianceCheck: boolean
  performanceThreshold: number
  medicalDataProcessing: boolean
  privacyCompliance: boolean
}

export interface HealthcareSuccessCriteria {
  responseTime: number
  successRate: number
  dataAccuracy: number
  complianceScore: number
  patientSafety: boolean
}

export interface HealthcarePerformanceMetrics {
  appointmentBooking: {
    avgTime: number
    successRate: number
    errorRate: number
  }
  doctorSearch: {
    searchTime: number
    resultsAccuracy: number
    filterPerformance: number
  }
  clinicDiscovery: {
    locationAccuracy: number
    contactIntegration: number
    availabilityCheck: number
  }
  healthcareWorkflow: {
    patientJourney: number
    formSubmission: number
    documentUpload: number
    paymentProcessing: number
  }
}

// Cross-Browser Testing Types
export interface BrowserTestConfig {
  browsers: BrowserConfig[]
  testScenarios: BrowserTestScenario[]
  performanceThresholds: BrowserPerformanceThresholds
  reportFormats: ('json' | 'html' | 'csv')[]
}

export interface BrowserConfig {
  name: string
  version: string
  platform: 'desktop' | 'mobile'
  viewport: {
    width: number
    height: number
  }
  userAgent?: string
  deviceEmulation?: {
    device: string
    orientation: 'portrait' | 'landscape'
  }
}

export interface BrowserTestScenario {
  id: string
  name: string
  url: string
  interactions: BrowserInteraction[]
  performanceChecks: BrowserPerformanceCheck[]
  visualChecks?: VisualRegressionCheck[]
}

export interface BrowserInteraction {
  type: 'navigate' | 'click' | 'type' | 'scroll' | 'wait'
  selector?: string
  value?: string
  delay?: number
  timeout?: number
}

export interface BrowserPerformanceCheck {
  metric: 'loadTime' | 'firstContentfulPaint' | 'largestContentfulPaint' | 'cumulativeLayoutShift' | 'firstInputDelay'
  threshold: number
  description: string
  critical: boolean
}

export interface VisualRegressionCheck {
  selector: string
  threshold: number
  ignoreAreas?: Array<{ x: number; y: number; width: number; height: number }>
}

export interface BrowserPerformanceThresholds {
  loadTime: { desktop: number; mobile: number }
  firstContentfulPaint: { desktop: number; mobile: number }
  largestContentfulPaint: { desktop: number; mobile: number }
  cumulativeLayoutShift: { desktop: number; mobile: number }
  firstInputDelay: { desktop: number; mobile: number }
}

export interface BrowserTestResult {
  browser: string
  version: string
  platform: string
  testScenario: string
  timestamp: number
  duration: number
  performanceMetrics: BrowserPerformanceMetrics
  visualDiffs?: VisualDiffResult[]
  passed: boolean
  issues: BrowserIssue[]
}

export interface BrowserPerformanceMetrics {
  loadTime: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  cumulativeLayoutShift: number
  firstInputDelay: number
  timeToInteractive: number
  memoryUsage: number
  networkRequests: number
  bundleSize: number
}

export interface VisualDiffResult {
  selector: string
  similarity: number
  pixelDiff: number
  baselineImage: string
  currentImage: string
  diffImage: string
}

export interface BrowserIssue {
  type: 'performance' | 'compatibility' | 'visual' | 'functional'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  metric?: string
  value?: number
  threshold?: number
  screenshot?: string
}

// Regression Testing Types
export interface RegressionTestSuite {
  id: string
  name: string
  description: string
  testCases: RegressionTestCase[]
  baselineResults: Map<string, BaselineResult>
  comparisonCriteria: RegressionComparisonCriteria
  automatedChecks: AutomatedRegressionCheck[]
}

export interface RegressionTestCase {
  id: string
  name: string
  url: string
  interactions?: BrowserInteraction[]
  performanceChecks: PerformanceCheck[]
  expectedMetrics: ExpectedPerformanceMetrics
  criticalPaths?: string[]
}

export interface PerformanceCheck {
  metric: string
  threshold: number
  operator: 'less-than' | 'greater-than' | 'equals' | 'within-range'
  value: number
  critical: boolean
  healthcareRelevant: boolean
}

export interface ExpectedPerformanceMetrics {
  responseTime: number
  memoryUsage: number
  bundleSize: number
  coreWebVitals: CoreWebVitals
  healthcareWorkflows: HealthcareWorkflowPerformance
}

export interface CoreWebVitals {
  lcp: number
  fid: number
  cls: number
  fcp: number
  ttfb: number
}

export interface HealthcareWorkflowPerformance {
  appointmentBooking: number
  clinicSearch: number
  doctorDiscovery: number
  formSubmission: number
}

export interface BaselineResult {
  timestamp: number
  environment: string
  metrics: ExpectedPerformanceMetrics
  performanceScore: number
  complianceScore: number
  healthChecks: HealthCheck[]
}

export interface HealthCheck {
  name: string
  status: 'pass' | 'fail' | 'warning'
  message: string
  value: number
  threshold: number
}

export interface RegressionComparisonCriteria {
  performanceRegressionThreshold: number
  bundleSizeRegressionThreshold: number
  responseTimeRegressionThreshold: number
  memoryUsageRegressionThreshold: number
  coreWebVitalsRegressionThreshold: number
  healthcareWorkflowRegressionThreshold: number
}

export interface AutomatedRegressionCheck {
  type: 'lighthouse' | 'bundle-analyzer' | 'web-vitals' | 'memory-profiler' | 'network-analyzer'
  schedule: 'on-commit' | 'daily' | 'weekly' | 'on-demand'
  thresholds: AutomatedCheckThresholds
  alerts: RegressionAlertConfig
}

export interface AutomatedCheckThresholds {
  performanceScore: number
  accessibilityScore: number
  bestPracticesScore: number
  seoScore: number
  pwaScore: number
}

export interface RegressionAlertConfig {
  email: boolean
  slack: boolean
  dashboard: boolean
  criticalEscalation: boolean
}

export interface RegressionTestResult {
  testSuiteId: string
  testCaseId: string
  timestamp: number
  duration: number
  passed: boolean
  currentMetrics: ExpectedPerformanceMetrics
  baselineMetrics: ExpectedPerformanceMetrics
  comparison: PerformanceComparison
  regressions: PerformanceRegression[]
  recommendations: RegressionRecommendation[]
}

export interface PerformanceComparison {
  improved: boolean
  degraded: boolean
  unchanged: boolean
  changes: Array<{
    metric: string
    previous: number
    current: number
    change: number
    changePercent: number
    impact: 'positive' | 'negative' | 'neutral'
    critical: boolean
  }>
  healthcareImpact: HealthcareImpact
}

export interface HealthcareImpact {
  patientJourney: 'improved' | 'degraded' | 'unchanged'
  appointmentBooking: 'improved' | 'degraded' | 'unchanged'
  clinicSearch: 'improved' | 'degraded' | 'unchanged'
  complianceImpact: 'improved' | 'degraded' | 'unchanged'
}

export interface PerformanceRegression {
  metric: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  previousValue: number
  currentValue: number
  threshold: number
  healthcareWorkflow: string
  recommendation: string
}

export interface RegressionRecommendation {
  type: 'optimization' | 'fix' | 'investigation' | 'configuration'
  priority: 'low' | 'medium' | 'high' | 'critical'
  description: string
  action: string
  estimatedImpact: string
  implementation: string
}

// Performance Budget Types
export interface PerformanceBudget {
  id: string
  name: string
  category: 'page-load' | 'api-response' | 'healthcare-workflow' | 'cross-browser' | 'mobile'
  metric: PerformanceMetricType
  thresholds: PerformanceThreshold[]
  enforcement: BudgetEnforcement
  healthcareSpecific: boolean
  complianceRequired: boolean
}

export interface PerformanceMetricType {
  type: 'web-vital' | 'response-time' | 'bundle-size' | 'memory-usage' | 'healthcare-workflow'
  name: string
  unit: string
  direction: 'lower-is-better' | 'higher-is-better'
}

export interface PerformanceThreshold {
  environment: 'development' | 'staging' | 'production'
  warning: number
  error: number
  critical?: number
  unit: string
}

export interface BudgetEnforcement {
  buildFailure: boolean
  alerts: boolean
  ciIntegration: boolean
  dashboard: boolean
  reportGeneration: boolean
}

export interface PerformanceBudgetViolation {
  budgetId: string
  violationType: 'warning' | 'error' | 'critical'
  metric: string
  actualValue: number
  threshold: number
  timestamp: number
  environment: string
  buildId?: string
  commitHash?: string
  impact: string
  recommendations: string[]
}

// Real User Monitoring Types
export interface RUMConfig {
  enabled: boolean
  sampleRate: number
  endpoint: string
  healthcareUserTracking: boolean
  privacyCompliant: boolean
  realTimeAlerts: boolean
}

export interface RUMMetrics {
  timestamp: number
  userId?: string
  sessionId: string
  pageUrl: string
  userAgent: string
  networkInfo: NetworkInfo
  deviceInfo: DeviceInfo
  performance: RUMPerformanceMetrics
  healthcare: HealthcareUserMetrics
}

export interface RUMPerformanceMetrics {
  loadTime: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  cumulativeLayoutShift: number
  firstInputDelay: number
  timeToInteractive: number
  connectionType?: string
  effectiveConnectionType?: string
  downlink?: number
  rtt?: number
}

export interface HealthcareUserMetrics {
  appointmentBookingAttempts: number
  successfulBookings: number
  clinicSearches: number
  doctorProfileViews: number
  formSubmissions: number
  workflowCompletion: WorkflowCompletionMetrics
  patientJourneyStages: PatientJourneyStage[]
  errorIncidents: HealthcareErrorIncident[]
}

export interface WorkflowCompletionMetrics {
  clinicSearch: { completed: number; abandoned: number; avgTime: number }
  doctorDiscovery: { completed: number; abandoned: number; avgTime: number }
  appointmentBooking: { completed: number; abandoned: number; avgTime: number }
  contactForm: { completed: number; abandoned: number; avgTime: number }
  serviceExploration: { completed: number; abandoned: number; avgTime: number }
}

export interface PatientJourneyStage {
  stage: string
  startTime: number
  endTime?: number
  duration?: number
  completed: boolean
  errors?: string[]
}

export interface HealthcareErrorIncident {
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: number
  pageUrl: string
  userAgent: string
  details: Record<string, any>
  resolved: boolean
}

// Test Orchestration Types
export interface TestOrchestrator {
  id: string
  name: string
  description: string
  testSuites: TestSuite[]
  schedule: TestSchedule
  environments: TestEnvironment[]
  dependencies: TestDependency[]
  reporting: TestReporting
}

export interface TestSuite {
  id: string
  name: string
  type: 'load' | 'regression' | 'cross-browser' | 'healthcare-specific' | 'budget'
  enabled: boolean
  tests: string[]
  priority: 'low' | 'medium' | 'high' | 'critical'
  timeout: number
  retryPolicy: RetryPolicy
}

export interface RetryPolicy {
  maxRetries: number
  retryDelay: number
  backoffMultiplier: number
  exponential: boolean
}

export interface TestSchedule {
  trigger: 'manual' | 'scheduled' | 'webhook' | 'ci-cd'
  cronExpression?: string
  dependencies: string[]
  conditions?: TestCondition[]
}

export interface TestCondition {
  type: 'file-changed' | 'deployment' | 'time-based' | 'custom'
  value: string
  operator: 'equals' | 'contains' | 'matches' | 'greater-than'
}

export interface TestEnvironment {
  name: string
  type: 'development' | 'staging' | 'production'
  url: string
  variables: Record<string, string>
  dependencies: string[]
  healthcareSettings: HealthcareEnvironmentSettings
}

export interface HealthcareEnvironmentSettings {
  pdpaCompliant: boolean
  medicalDataEncryption: boolean
  healthcareWorkflows: string[]
  complianceLevel: 'basic' | 'enhanced' | 'strict'
}

export interface TestDependency {
  name: string
  type: 'service' | 'database' | 'api' | 'external-system'
  required: boolean
  healthCheck: HealthCheckConfig
}

export interface HealthCheckConfig {
  endpoint: string
  timeout: number
  retries: number
  expectedStatus: number
  responseValidation?: Record<string, any>
}

export interface TestReporting {
  formats: ('json' | 'html' | 'csv' | 'pdf')[]
  destinations: ReportDestination[]
  dashboards: DashboardConfig[]
  alerts: ReportAlert[]
}

export interface ReportDestination {
  type: 'filesystem' | 's3' | 'email' | 'slack' | 'webhook'
  config: Record<string, any>
}

export interface DashboardConfig {
  name: string
  type: 'performance' | 'healthcare' | 'compliance' | 'summary'
  refreshInterval: number
  autoRefresh: boolean
}

export interface ReportAlert {
  condition: AlertCondition
  recipients: string[]
  channels: ('email' | 'slack' | 'teams')[]
  severity: 'info' | 'warning' | 'error' | 'critical'
}

export interface AlertCondition {
  type: 'threshold' | 'regression' | 'failure-rate' | 'duration'
  metric: string
  operator: 'greater-than' | 'less-than' | 'equals'
  value: number
  timeframe: string
}

// Test Execution Results
export interface TestExecution {
  id: string
  orchestratorId: string
  suiteId: string
  testId: string
  startTime: number
  endTime?: number
  duration?: number
  status: 'pending' | 'running' | 'passed' | 'failed' | 'error' | 'timeout'
  environment: string
  results: TestResults
  artifacts: TestArtifact[]
  metadata: TestMetadata
}

export interface TestResults {
  summary: TestResultsSummary
  metrics: TestMetrics
  comparisons: PerformanceComparison[]
  healthcareResults: HealthcareTestResults
  issues: TestIssue[]
  recommendations: TestRecommendation[]
}

export interface TestResultsSummary {
  totalTests: number
  passed: number
  failed: number
  errors: number
  skipped: number
  successRate: number
  averageDuration: number
  performanceScore: number
  healthcareComplianceScore: number
}

export interface TestMetrics {
  loadTesting?: LoadTestResult
  regressionTesting?: RegressionTestResult[]
  crossBrowserTesting?: BrowserTestResult[]
  healthcareTesting?: HealthcarePerformanceTestResult[]
  budgetCompliance?: PerformanceBudgetCompliance[]
}

export interface TestMetrics { continued
  loadTesting?: LoadTestResult
  regressionTesting?: RegressionTestResult[]
  crossBrowserTesting?: BrowserTestResult[]
  healthcareTesting?: HealthcarePerformanceTestResult[]
  budgetCompliance?: PerformanceBudgetCompliance[]
}

export interface HealthcarePerformanceTestResult {
  workflowTests: Map<string, HealthcareWorkflowTestResult>
  aggregateMetrics: HealthcarePerformanceMetrics
  complianceScore: number
  patientJourneyScore: number
  recommendations: string[]
}

export interface HealthcareWorkflowTestResult {
  workflowId: string
  workflowName: string
  startTime: number
  endTime: number
  duration: number
  steps: WorkflowStepResult[]
  success: boolean
  errors: HealthcareError[]
  performanceMetrics: HealthcareStepMetrics
  complianceValidations: ComplianceValidation[]
}

export interface WorkflowStepResult {
  stepId: string
  stepName: string
  startTime: number
  endTime: number
  duration: number
  success: boolean
  errors: string[]
  performance: {
    responseTime: number
    resourceUsage: number
  }
}

export interface HealthcareError {
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  timestamp: number
  workflow: string
  step: string
  data?: Record<string, any>
}

export interface HealthcareStepMetrics {
  responseTime: number
  dataIntegrityScore: number
  complianceScore: number
  performanceScore: number
  userExperienceScore: number
}

export interface ComplianceValidation {
  type: 'pdpa' | 'medical-data' | 'audit-trail' | 'access-control'
  passed: boolean
  score: number
  details: string
  recommendations: string[]
}

export interface PerformanceBudgetCompliance {
  budgetId: string
  budgetName: string
  violations: PerformanceBudgetViolation[]
  complianceScore: number
  status: 'compliant' | 'warning' | 'violation' | 'critical'
  lastCheck: number
}

export interface TestIssue {
  id: string
  type: 'performance' | 'compatibility' | 'compliance' | 'security' | 'functional'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  metric?: string
  currentValue?: number
  threshold?: number
  impact: string
  recommendation: string
  estimatedEffort: 'low' | 'medium' | 'high'
  affectedWorkflows: string[]
}

export interface TestRecommendation {
  id: string
  type: 'optimization' | 'fix' | 'investigation' | 'configuration' | 'compliance'
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  impact: string
  implementation: string
  estimatedTime: string
  dependencies: string[]
  healthcareRelevance: string
}

export interface TestArtifact {
  name: string
  type: 'screenshot' | 'video' | 'log' | 'report' | 'metric' | 'profile'
  path: string
  size: number
  contentType: string
  timestamp: number
  metadata?: Record<string, any>
}

export interface TestMetadata {
  environment: string
  version: string
  commitHash: string
  branch: string
  buildId: string
  triggeredBy: string
  tags: string[]
  custom: Record<string, any>
}

// Network Information Types
export interface NetworkInfo {
  effectiveType: '4g' | '3g' | '2g' | 'slow-2g'
  downlink: number
  rtt: number
  saveData: boolean
}

export interface DeviceInfo {
  type: 'mobile' | 'desktop' | 'tablet'
  os: string
  browser: string
  version: string
  viewport: {
    width: number
    height: number
  }
  pixelRatio: number
}

// Export all types
export * from './load-testing'
export * from './healthcare-specific'
export * from './regression-testing'
export * from './cross-browser'
export * from './budget-compliance'

export default {}