/**
 * Cross-Browser Performance Testing Types
 * Browser compatibility and performance validation types
 */

export interface CrossBrowserTestConfig {
  name: string
  description: string
  enabled: boolean
  testScenarios: CrossBrowserTestScenario[]
  browserMatrix: BrowserMatrix
  performanceThresholds: CrossBrowserPerformanceThresholds
  comparisonCriteria: CrossBrowserComparisonCriteria
  reporting: CrossBrowserReportingConfig
}

export interface CrossBrowserTestScenario {
  id: string
  name: string
  description: string
  url: string
  category: 'core' | 'healthcare-workflow' | 'appointment' | 'search' | 'contact' | 'compliance' | 'emergency'
  interactions: BrowserInteraction[]
  performanceChecks: BrowserPerformanceCheck[]
  functionalChecks: BrowserFunctionalCheck[]
  visualChecks: BrowserVisualCheck[]
  healthcareValidations: HealthcareBrowserValidation[]
  criticalPaths: string[]
  dependencies: string[]
}

export interface BrowserInteraction {
  type: 'navigate' | 'click' | 'type' | 'scroll' | 'wait' | 'hover' | 'drag-drop' | 'keyboard'
  selector?: string
  value?: string
  delay?: number
  timeout?: number
  options?: InteractionOptions
}

export interface InteractionOptions {
  keyboardEvent?: string
  mouseButton?: number
  viewport?: { x: number; y: number }
  force: boolean
  multiple: boolean
}

export interface BrowserPerformanceCheck {
  metric: 'loadTime' | 'firstContentfulPaint' | 'largestContentfulPaint' | 'cumulativeLayoutShift' | 'firstInputDelay' | 'timeToInteractive' | 'speedIndex' | 'totalBlockingTime'
  threshold: {
    desktop: number
    mobile: number
  }
  operator: 'less-than' | 'equals' | 'greater-than'
  critical: boolean
  healthcareRelevant: boolean
  description: string
  remediation: string
}

export interface BrowserFunctionalCheck {
  type: 'element-exists' | 'text-content' | 'attribute-value' | 'url-change' | 'form-submission' | 'api-call'
  selector?: string
  expectedResult: string
  timeout: number
  critical: boolean
  healthcareRelevant: boolean
  validation: FunctionalValidation
}

export interface FunctionalValidation {
  dataIntegrity: boolean
  medicalDataAccuracy: boolean
  patientPrivacy: boolean
  complianceCheck: boolean
}

export interface BrowserVisualCheck {
  type: 'layout' | 'styling' | 'content' | 'responsive'
  selector?: string
  baselineImage?: string
  threshold: number
  ignoreAreas: Array<{
    x: number
    y: number
    width: number
    height: number
    selector?: string
  }>
  deviceSizes: DeviceSize[]
  critical: boolean
  healthcareRelevant: boolean
}

export interface DeviceSize {
  name: string
  width: number
  height: number
  pixelRatio?: number
  orientation?: 'portrait' | 'landscape'
}

export interface HealthcareBrowserValidation {
  type: 'appointment-booking' | 'doctor-search' | 'clinic-discovery' | 'contact-form' | 'medical-document-upload'
  critical: boolean
  performanceThreshold: number
  functionalValidation: HealthcareFunctionalValidation
  complianceValidation: HealthcareComplianceValidation
  userExperienceValidation: HealthcareUXValidation
}

export interface HealthcareFunctionalValidation {
  workflowCompleteness: boolean
  dataAccuracy: boolean
  errorHandling: boolean
  accessibility: boolean
  multiLanguage: boolean
  mobileCompatibility: boolean
}

export interface HealthcareComplianceValidation {
  pdpaCompliance: boolean
  dataEncryption: boolean
  auditTrail: boolean
  medicalDataProtection: boolean
  accessControl: boolean
  consentManagement: boolean
}

export interface HealthcareUXValidation {
  patientJourneyFlow: boolean
  accessibilityStandards: boolean
  emergencyWorkflows: boolean
  multiDeviceConsistency: boolean
  performanceConsistency: boolean
}

export interface BrowserMatrix {
  desktop: DesktopBrowser[]
  mobile: MobileBrowser[]
  tablet: TabletBrowser[]
  custom: CustomBrowser[]
}

export interface DesktopBrowser {
  name: string
  versions: string[]
  os: ('windows' | 'macos' | 'linux')[]
  engine: string
  features: BrowserFeature[]
  healthcareValidation: boolean
}

export interface MobileBrowser {
  name: string
  versions: string[]
  deviceTypes: ('smartphone' | 'tablet')[]
  os: ('ios' | 'android')[]
  features: BrowserFeature[]
  healthcareValidation: boolean
  responsiveDesign: boolean
}

export interface TabletBrowser {
  name: string
  versions: string[]
  deviceTypes: ('ipad' | 'android-tablet')[]
  os: ('ios' | 'android')[]
  features: BrowserFeature[]
  healthcareValidation: boolean
  touchOptimization: boolean
}

export interface CustomBrowser {
  name: string
  description: string
  userAgent: string
  viewport: { width: number; height: number }
  features: BrowserFeature[]
  healthcareValidation: boolean
}

export interface BrowserFeature {
  name: string
  support: 'full' | 'partial' | 'none' | 'experimental'
  polyfill?: string
  fallback?: string
  critical: boolean
}

export interface CrossBrowserPerformanceThresholds {
  loadTime: {
    excellent: number
    good: number
    needsImprovement: number
    poor: number
  }
  firstContentfulPaint: {
    excellent: number
    good: number
    needsImprovement: number
    poor: number
  }
  largestContentfulPaint: {
    excellent: number
    good: number
    needsImprovement: number
    poor: number
  }
  cumulativeLayoutShift: {
    excellent: number
    good: number
    needsImprovement: number
    poor: number
  }
  firstInputDelay: {
    excellent: number
    good: number
    needsImprovement: number
    poor: number
  }
  timeToInteractive: {
    excellent: number
    good: number
    needsImprovement: number
    poor: number
  }
  healthcareWorkflows: {
    appointmentBooking: number
    doctorSearch: number
    clinicDiscovery: number
    formSubmission: number
  }
}

export interface CrossBrowserComparisonCriteria {
  performance: {
    maxVariancePercent: number
    acceptableDeviation: number
    criticalThreshold: number
  }
  visual: {
    similarityThreshold: number
    layoutTolerance: number
    contentMismatchTolerance: number
  }
  functional: {
    errorRateTolerance: number
    featureCompleteness: number
    workflowSuccessRate: number
  }
  healthcare: {
    workflowConsistency: number
    complianceParity: number
    userExperienceParity: number
  }
}

export interface CrossBrowserReportingConfig {
  formats: ('json' | 'html' | 'csv' | 'pdf' | 'excel')[]
  visualizations: ReportVisualization[]
  dashboards: BrowserDashboardConfig[]
  notifications: CrossBrowserNotificationConfig
}

export interface ReportVisualization {
  type: 'bar-chart' | 'line-chart' | 'heatmap' | 'scatter-plot' | 'comparison-table' | 'screenshot-comparison'
  data: VisualizationData
  options: Record<string, any>
}

export interface VisualizationData {
  title: string
  data: Array<Record<string, any>>
  xAxis: string
  yAxis: string
  series?: string[]
  filters?: Record<string, any>
}

export interface BrowserDashboardConfig {
  name: string
  type: 'overview' | 'performance' | 'compatibility' | 'healthcare' | 'trends'
  refreshInterval: number
  widgets: DashboardWidget[]
  filters: DashboardFilter[]
}

export interface DashboardWidget {
  type: 'metric-card' | 'chart' | 'table' | 'heatmap' | 'alert-list'
  title: string
  config: WidgetConfig
  position: { x: number; y: number; width: number; height: number }
}

export interface WidgetConfig {
  metric: string
  browser?: string
  timeRange?: string
  comparison?: string
  healthcareWorkflow?: string
  threshold?: number
}

export interface DashboardFilter {
  type: 'date-range' | 'browser' | 'device' | 'scenario' | 'metric' | 'healthcare-workflow'
  options: FilterOption[]
  default?: string | string[]
}

export interface FilterOption {
  value: string
  label: string
  count?: number
  selected: boolean
}

export interface CrossBrowserNotificationConfig {
  enabled: boolean
  channels: CrossBrowserNotificationChannel[]
  conditions: CrossBrowserNotificationCondition[]
  escalation: CrossBrowserEscalationConfig
}

export interface CrossBrowserNotificationChannel {
  type: 'email' | 'slack' | 'teams' | 'webhook' | 'dashboard'
  config: Record<string, any>
  enabled: boolean
  browsers: string[]
  severities: string[]
}

export interface CrossBrowserNotificationCondition {
  type: 'performance-degradation' | 'compatibility-issue' | 'workflow-failure' | 'healthcare-impact' | 'compliance-violation'
  threshold: number
  browsers: string[]
  severity: 'low' | 'medium' | 'high' | 'critical'
  suppression: NotificationSuppression
}

export interface NotificationSuppression {
  enabled: boolean
  duration: number
  conditions: SuppressionCondition[]
}

export interface SuppressionCondition {
  type: 'maintenance' | 'known-issue' | 'planned-change'
  pattern: string
  description: string
  startTime: number
  endTime: number
}

export interface CrossBrowserEscalationConfig {
  enabled: boolean
  levels: CrossBrowserEscalationLevel[]
  maxLevel: number
  timeout: number
}

export interface CrossBrowserEscalationLevel {
  level: number
  delay: number
  channels: CrossBrowserNotificationChannel[]
  conditions: CrossBrowserNotificationCondition[]
}

export interface CrossBrowserTestResult {
  testScenarioId: string
  testScenarioName: string
  timestamp: number
  duration: number
  status: 'passed' | 'failed' | 'error' | 'timeout'
  browserResults: Map<string, BrowserTestResult>
  comparison: CrossBrowserComparison
  issues: CrossBrowserIssue[]
  recommendations: CrossBrowserRecommendation[]
  artifacts: CrossBrowserArtifact[]
}

export interface BrowserTestResult {
  browser: string
  version: string
  platform: string
  deviceType: 'desktop' | 'mobile' | 'tablet'
  viewport: { width: number; height: number }
  timestamp: number
  duration: number
  status: 'passed' | 'failed' | 'error' | 'timeout'
  performanceMetrics: BrowserPerformanceMetrics
  functionalResults: BrowserFunctionalResult[]
  visualResults: BrowserVisualResult[]
  healthcareResults: BrowserHealthcareResult[]
  issues: BrowserIssue[]
  artifacts: BrowserArtifact[]
}

export interface BrowserPerformanceMetrics {
  loadTime: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  cumulativeLayoutShift: number
  firstInputDelay: number
  timeToInteractive: number
  speedIndex: number
  totalBlockingTime: number
  domContentLoaded: number
  resourceTimings: ResourceTiming[]
  memoryUsage: number
  networkRequests: number
  cacheHitRate: number
}

export interface ResourceTiming {
  name: string
  initiatorType: string
  duration: number
  transferSize: number
  encodedBodySize: number
  decodedBodySize: number
}

export interface BrowserFunctionalResult {
  checkType: string
  selector?: string
  expectedResult: string
  actualResult: string
  passed: boolean
  duration: number
  error?: string
  healthcareValidation: HealthcareFunctionalValidation
}

export interface BrowserVisualResult {
  checkType: string
  selector?: string
  baselineImage?: string
  currentImage: string
  diffImage?: string
  similarity: number
  threshold: number
  passed: boolean
  differences: VisualDifference[]
  issues: VisualIssue[]
}

export interface VisualDifference {
  type: 'layout' | 'content' | 'styling' | 'behavior'
  description: string
  severity: 'minor' | 'moderate' | 'major' | 'critical'
  similarity: number
  threshold: number
  affectedElements: string[]
}

export interface VisualIssue {
  type: 'layout-shift' | 'missing-element' | 'styling-error' | 'responsive-break' | 'accessibility-violation'
  description: string
  severity: 'minor' | 'moderate' | 'major' | 'critical'
  element: string
  location: { x: number; y: number }
  screenshot: string
}

export interface BrowserHealthcareResult {
  validationType: string
  workflowId: string
  passed: boolean
  score: number
  performance: HealthcareWorkflowPerformance
  functional: HealthcareFunctionalValidation
  compliance: HealthcareComplianceValidation
  userExperience: HealthcareUXValidation
  issues: HealthcareBrowserIssue[]
}

export interface HealthcareWorkflowPerformance {
  responseTime: number
  throughput: number
  successRate: number
  errorRate: number
  userSatisfaction: number
}

export interface HealthcareBrowserIssue {
  type: 'performance' | 'compatibility' | 'healthcare-workflow' | 'compliance' | 'accessibility'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  workflow: string
  browser: string
  impact: string
  recommendation: string
  remediation: string
  estimatedEffort: string
}

export interface BrowserIssue {
  id: string
  type: 'performance' | 'compatibility' | 'functional' | 'visual' | 'accessibility'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  metric?: string
  value?: number
  threshold?: number
  browser: string
  affectedUsers: number
  impact: string
  recommendation: string
  estimatedFixTime: string
  healthcareRelevance: string
}

export interface BrowserArtifact {
  name: string
  type: 'screenshot' | 'video' | 'network-trace' | 'console-log' | 'performance-profile' | 'accessibility-report'
  path: string
  size: number
  contentType: string
  timestamp: number
  metadata: Record<string, any>
}

export interface CrossBrowserComparison {
  overall: {
    consistent: boolean
    performanceVariance: number
    visualVariance: number
    functionalVariance: number
    healthcareVariance: number
  }
  metrics: BrowserMetricComparison[]
  visual: VisualBrowserComparison
  functional: FunctionalBrowserComparison
  healthcare: HealthcareBrowserComparison
  recommendations: CrossBrowserOptimizationRecommendation[]
}

export interface BrowserMetricComparison {
  metric: string
  browserComparisons: Map<string, MetricComparison>
  variance: {
    min: number
    max: number
    average: number
    standardDeviation: number
  }
  critical: boolean
  healthcareRelevant: boolean
}

export interface MetricComparison {
  browser: string
  value: number
  percentile: number
  score: 'excellent' | 'good' | 'needs-improvement' | 'poor'
  status: 'pass' | 'fail' | 'warning'
  target: number
  deviation: number
}

export interface VisualBrowserComparison {
  similarityScores: Map<string, number>
  layoutStability: BrowserLayoutStability
  responsiveBehavior: ResponsiveBrowserBehavior
  issues: VisualBrowserIssue[]
}

export interface BrowserLayoutStability {
  layoutShiftScore: number
  elementMovement: BrowserElementMovement[]
  reflowCount: number
  criticalElements: BrowserCriticalElement[]
}

export interface BrowserElementMovement {
  element: string
  movement: { x: number; y: number }
  severity: 'minimal' | 'moderate' | 'significant'
  cause: string
}

export interface BrowserCriticalElement {
  selector: string
  importance: 'high' | 'medium' | 'low'
  stability: 'stable' | 'unstable'
  movementRisk: string
}

export interface ResponsiveBrowserBehavior {
  breakpointHandling: BrowserBreakpointHandling[]
  scalingBehavior: BrowserScalingBehavior
  orientationHandling: BrowserOrientationHandling
  touchInteraction: BrowserTouchInteraction
}

export interface BrowserBreakpointHandling {
  breakpoint: number
  behavior: 'correct' | 'incorrect' | 'partial'
  issues: string[]
}

export interface BrowserScalingBehavior {
  scale: number
  accuracy: 'perfect' | 'good' | 'poor'
  issues: string[]
}

export interface BrowserOrientationHandling {
  portraitHandling: OrientationHandling
  landscapeHandling: OrientationHandling
  transition: TransitionHandling
}

export interface OrientationHandling {
  performance: number
  usability: 'excellent' | 'good' | 'poor'
  issues: string[]
}

export interface TransitionHandling {
  duration: number
  smoothness: 'smooth' | 'jarring' | 'broken'
  issues: string[]
}

export interface BrowserTouchInteraction {
  tapAccuracy: number
  swipeSensitivity: number
  pinchZoom: TouchZoomHandling
  scrolling: TouchScrollingHandling
}

export interface TouchZoomHandling {
  supported: boolean
  performance: number
  usability: 'excellent' | 'good' | 'poor'
  issues: string[]
}

export interface TouchScrollingHandling {
  smoothness: number
  bounceEffect: boolean
  momentumScrolling: boolean
  issues: string[]
}

export interface VisualBrowserIssue {
  browser: string
  issue: string
  severity: 'minor' | 'moderate' | 'major' | 'critical'
  description: string
  impact: string
  screenshot: string
}

export interface FunctionalBrowserComparison {
  compatibilityScores: Map<string, number>
  featureSupport: BrowserFeatureSupport[]
  workflowSuccessRates: BrowserWorkflowSuccess[]
  errorPatterns: BrowserErrorPattern[]
}

export interface BrowserFeatureSupport {
  feature: string
  support: 'full' | 'partial' | 'none' | 'experimental'
  implementations: Map<string, ImplementationInfo>
  fallback: string
  polyfill: string
  critical: boolean
}

export interface ImplementationInfo {
  browser: string
  version: string
  support: 'full' | 'partial' | 'none'
  issues: string[]
  workarounds: string[]
}

export interface BrowserWorkflowSuccess {
  workflow: string
  successRates: Map<string, number>
  failurePatterns: BrowserFailurePattern[]
  performance: BrowserWorkflowPerformance
}

export interface BrowserFailurePattern {
  pattern: string
  browsers: string[]
  frequency: number
  cause: string
  workaround: string
}

export interface BrowserWorkflowPerformance {
  loadTime: Map<string, number>
  interactionTime: Map<string, number>
  successRate: Map<string, number>
}

export interface BrowserErrorPattern {
  pattern: string
  browsers: string[]
  frequency: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  cause: string
  solution: string
}

export interface HealthcareBrowserComparison {
  workflowParity: BrowserWorkflowParity[]
  complianceConsistency: BrowserComplianceConsistency[]
  userExperienceParity: BrowserUserExperienceParity[]
  healthcarePerformance: BrowserHealthcarePerformance
}

export interface BrowserWorkflowParity {
  workflow: string
  parityScores: Map<string, number>
  variance: number
  critical: boolean
  healthcareRelevance: string
  recommendation: string
}

export interface BrowserComplianceConsistency {
  requirement: string
  consistencyScores: Map<string, number>
  variance: number
  critical: boolean
  regulatoryRelevance: string
  recommendation: string
}

export interface BrowserUserExperienceParity {
  aspect: string
  parityScores: Map<string, number>
  variance: number
  critical: boolean
  patientImpact: string
  recommendation: string
}

export interface BrowserHealthcarePerformance {
  appointmentBooking: BrowserWorkflowMetrics
  doctorSearch: BrowserWorkflowMetrics
  clinicDiscovery: BrowserWorkflowMetrics
  formSubmission: BrowserWorkflowMetrics
  medicalDocumentUpload: BrowserWorkflowMetrics
}

export interface BrowserWorkflowMetrics {
  averageTime: Map<string, number>
  successRate: Map<string, number>
  errorRate: Map<string, number>
  userSatisfaction: Map<string, number>
}

export interface CrossBrowserOptimizationRecommendation {
  category: 'performance' | 'compatibility' | 'functionality' | 'accessibility' | 'healthcare'
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  impactedBrowsers: string[]
  implementation: string
  estimatedImpact: string
  effort: string
  dependencies: string[]
  healthcareRelevance: string
  automation: OptimizationAutomation
}

export interface OptimizationAutomation {
  canAutomate: boolean
  automationLevel: 'partial' | 'full' | 'none'
  tooling: string[]
  configuration: AutomationConfiguration[]
  validation: AutomationValidation[]
}

export interface AutomationConfiguration {
  tool: string
  parameters: Record<string, any>
  setup: string
  validation: ValidationRule[]
}

export interface ValidationRule {
  type: 'performance' | 'healthcare-workflow' | 'compliance' | 'accessibility'
  metric: string
  operator: string
  value: any
  message: string
}

export interface CrossBrowserIssue {
  id: string
  type: 'performance' | 'compatibility' | 'functionality' | 'accessibility' | 'healthcare' | 'visual'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  impactedBrowsers: string[]
  affectedUsers: number
  healthcareImpact: string
  businessImpact: string
  recommendation: string
  estimatedFixTime: string
  dependencies: string[]
}

export interface CrossBrowserRecommendation {
  id: string
  category: 'optimization' | 'fix' | 'investigation' | 'configuration' | 'compliance'
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  impactedWorkflows: string[]
  browsers: string[]
  implementation: string
  estimatedImpact: string
  effort: string
  dependencies: string[]
  healthcareRelevance: string
  automation: CrossBrowserRecommendationAutomation
}

export interface CrossBrowserRecommendationAutomation {
  canAutomate: boolean
  automationLevel: 'partial' | 'full' | 'none'
  scripts: AutomationScript[]
  configuration: Record<string, any>
  validation: CrossBrowserValidationRule[]
}

export interface AutomationScript {
  name: string
  language: string
  purpose: string
  parameters: Record<string, any>
  output: string
}

export interface CrossBrowserValidationRule {
  type: 'performance' | 'healthcare-workflow' | 'compliance' | 'accessibility'
  metric: string
  operator: string
  value: any
  message: string
  browsers: string[]
}

export interface CrossBrowserArtifact {
  name: string
  type: 'screenshot' | 'video' | 'network-trace' | 'performance-profile' | 'lighthouse-report' | 'accessibility-report' | 'healthcare-workflow-report'
  path: string
  size: number
  contentType: string
  timestamp: number
  browsers: string[]
  metadata: Record<string, any>
}

export default {}