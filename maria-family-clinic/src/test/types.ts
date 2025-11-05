/**
 * Test Types and Interfaces for Doctor System Testing
 * Phase 7.10 - Testing & Quality Assurance
 */

export interface DoctorProfile {
  id: string
  name: string
  specialty: string
  subSpecialties: string[]
  qualifications: Qualification[]
  experience: number
  languages: string[]
  bio: string
  clinicId: string
  clinic: ClinicInfo
  rating: number
  reviewCount: number
  verificationBadges: VerificationBadges
  profileImage: string | null
  availableSlots: AppointmentSlot[]
  consultationFees: ConsultationFees
  telemedicineAvailable: boolean
  waitingTime: number
  mcrNumber?: string
  spcNumber?: string
  medicalLicense?: MedicalLicense
  specialtyRegistrations?: SpecialtyRegistration[]
  boardCertifications?: BoardCertification[]
  professionalIndemnity?: ProfessionalIndemnity
  continuingEducation?: ContinuingEducation
  disciplinaryRecord?: DisciplinaryRecord
}

export interface Qualification {
  degree: string
  institution: string
  year: number
  verified?: boolean
  institutionType?: 'local' | 'foreign'
  accreditationStatus?: 'accredited' | 'recognized' | 'pending'
}

export interface ClinicInfo {
  id?: string
  name: string
  address: string
  phone: string
  email?: string
  operatingHours?: OperatingHours
  services?: string[]
  coordinates?: { lat: number; lng: number }
  mcrRegistered?: boolean
  operatingLicense?: string
  accreditedBy?: string
}

export interface OperatingHours {
  monday: string
  tuesday: string
  wednesday: string
  thursday: string
  friday: string
  saturday: string
  sunday: string
}

export interface VerificationBadges {
  mcrVerified: boolean
  spcVerified: boolean
  boardCertified: boolean
  experienceVerified: boolean
}

export interface AppointmentSlot {
  id?: string
  date: string
  time: string
  available: boolean
  duration?: number
  type?: string
}

export interface ConsultationFees {
  consultation: number
  followUp: number
  procedure: number
  insuranceAccepted?: string[]
}

export interface MedicalLicense {
  number: string
  issuedDate: string
  expiryDate: string
  status: 'active' | 'expired' | 'suspended'
  restrictions: string[]
  issuingAuthority: string
}

export interface SpecialtyRegistration {
  specialty: string
  subSpecialty?: string
  registrationDate: string
  expiryDate: string
  status: 'active' | 'expired' | 'pending'
  issuingAuthority: string
}

export interface BoardCertification {
  board: string
  certified: boolean
  year: number
  expiryYear?: number
  verified?: boolean
}

export interface ProfessionalIndemnity {
  provider: string
  policyNumber: string
  coverageAmount: number
  expiryDate: string
  status: 'active' | 'expired' | 'suspended'
}

export interface ContinuingEducation {
  cmePointsEarned: number
  cmePointsRequired: number
  lastUpdated: string
  status: 'compliant' | 'non-compliant' | 'pending'
}

export interface DisciplinaryRecord {
  hasActions: boolean
  actions: DisciplinaryAction[]
}

export interface DisciplinaryAction {
  type: 'warning' | 'suspension' | 'restriction' | 'revocation'
  date: string
  authority: string
  description: string
  status: 'active' | 'resolved' | 'appealed'
}

// Test Result Interfaces
export interface TestResult {
  suiteName: string
  total: number
  passed: number
  failed: number
  skipped: number
  errors: string[]
  warnings: string[]
  duration: number
  timestamp: string
}

export interface PerformanceMetrics {
  searchResponseTime: number
  profileRenderTime: number
  imageLoadTime: number
  databaseQueryTime: number
  memoryUsage: number
  cpuUsage?: number
}

export interface ComplianceReport {
  category: string
  status: 'compliant' | 'non-compliant' | 'warning'
  checks: number
  passed: number
  failed: number
  details: string
  recommendations?: string[]
}

export interface TestSuite {
  name: string
  description: string
  tests: TestCase[]
  setup?: () => Promise<void>
  teardown?: () => Promise<void>
}

export interface TestCase {
  name: string
  description: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  category: 'unit' | 'integration' | 'e2e' | 'performance' | 'security'
  timeout?: number
  retry?: number
  skip?: boolean
  only?: boolean
}

// Accessibility Testing Interfaces
export interface AccessibilityTestResult {
  component: string
  violations: AccessibilityViolation[]
  passes: number
  incomplete: number
  inapplicable: number
  wcagLevel: 'A' | 'AA' | 'AAA'
}

export interface AccessibilityViolation {
  id: string
  impact: 'minor' | 'moderate' | 'serious' | 'critical'
  tags: string[]
  description: string
  help: string
  helpUrl: string
  nodes: AccessibilityNode[]
}

export interface AccessibilityNode {
  html: string
  target: string[]
  failureSummary?: string
}

// Performance Testing Interfaces
export interface PerformanceTestResult {
  metric: string
  value: number
  unit: string
  threshold: number
  passed: boolean
  timestamp: string
  context?: any
}

export interface LoadTestResult {
  name: string
  concurrentUsers: number
  duration: number
  averageResponseTime: number
  p95ResponseTime: number
  p99ResponseTime: number
  throughput: number
  errorRate: number
  passed: boolean
}

// Integration Testing Interfaces
export interface IntegrationTestResult {
  system: string
  endpoint?: string
  method?: string
  status: 'success' | 'failure' | 'timeout'
  responseTime: number
  dataIntegrity: boolean
  errorMessage?: string
}

export interface EndToEndTestResult {
  workflow: string
  steps: WorkflowStep[]
  totalDuration: number
  passed: boolean
  failedSteps: string[]
}

export interface WorkflowStep {
  name: string
  status: 'pending' | 'running' | 'success' | 'failure'
  duration: number
  error?: string
}

// Cross-Platform Testing Interfaces
export interface CrossPlatformTestResult {
  platform: string
  browser?: string
  device?: string
  viewport: { width: number; height: number }
  features: PlatformFeatureTest[]
  passed: boolean
}

export interface PlatformFeatureTest {
  feature: string
  supported: boolean
  performance: 'excellent' | 'good' | 'acceptable' | 'poor'
  issues?: string[]
}

// Security Testing Interfaces
export interface SecurityTestResult {
  category: 'authentication' | 'authorization' | 'data-protection' | 'input-validation' | 'encryption'
  severity: 'low' | 'medium' | 'high' | 'critical'
  vulnerability?: string
  status: 'secure' | 'vulnerable' | 'unknown'
  remediation?: string
}

// Healthcare Compliance Interfaces
export interface HealthcareComplianceResult {
  regulation: string
  jurisdiction: 'singapore' | 'international'
  status: 'compliant' | 'non-compliant' | 'partial'
  evidence: ComplianceEvidence[]
  recommendations: string[]
}

export interface ComplianceEvidence {
  requirement: string
  satisfied: boolean
  proof: string
  dateValidated: string
}

// Test Configuration Interfaces
export interface TestConfiguration {
  environment: 'development' | 'staging' | 'production'
  databaseUrl: string
  apiUrl: string
  timeout: number
  retryAttempts: number
  parallel: boolean
  coverage: {
    enabled: boolean
    threshold: number
    exclude: string[]
  }
  reporting: {
    format: 'json' | 'html' | 'junit' | 'all'
    output: string
    includeScreenshots: boolean
  }
}

// Mock Data Interfaces
export interface MockDoctor extends DoctorProfile {
  mockId: string
  generatedAt: string
  validUntil: string
}

export interface MockClinic extends ClinicInfo {
  mockId: string
  generatedAt: string
  validUntil: string
}

// Search Testing Interfaces
export interface SearchTestQuery {
  query: string
  expectedResults: number
  category: 'name' | 'specialty' | 'location' | 'condition' | 'general'
  fuzzyMatch?: boolean
  synonyms?: string[]
}

export interface SearchResult {
  doctorId: string
  relevanceScore: number
  matchedFields: string[]
  position: number
}

// API Testing Interfaces
export interface APITestRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  endpoint: string
  headers?: Record<string, string>
  body?: any
  expectedStatus: number
  expectedSchema?: any
}

export interface APITestResponse {
  status: number
  headers: Record<string, string>
  body: any
  responseTime: number
  size: number
}

// Database Testing Interfaces
export interface DatabaseTestResult {
  operation: 'select' | 'insert' | 'update' | 'delete'
  table: string
  rowsAffected: number
  duration: number
  integrityChecks: IntegrityCheck[]
}

export interface IntegrityCheck {
  type: 'foreign_key' | 'unique_constraint' | 'check_constraint' | 'not_null'
  passed: boolean
  details: string
}

// Report Generation Interfaces
export interface TestReport {
  title: string
  summary: ReportSummary
  results: TestResult[]
  performance: PerformanceTestResult[]
  compliance: HealthcareComplianceResult[]
  recommendations: string[]
  generatedAt: string
}

export interface ReportSummary {
  totalTests: number
  passedTests: number
  failedTests: number
  skippedTests: number
  successRate: number
  totalDuration: number
  criticalIssues: number
}

// Constants for testing thresholds and limits
export const TEST_THRESHOLDS = {
  PERFORMANCE: {
    SEARCH_RESPONSE_TIME: 100, // ms
    PROFILE_RENDER_TIME: 50, // ms
    IMAGE_LOAD_TIME: 1000, // ms
    DATABASE_QUERY_TIME: 200, // ms
    MEMORY_USAGE: 100, // MB
    CPU_USAGE: 80 // percentage
  },
  LOAD: {
    CONCURRENT_USERS: 100,
    DATASET_SIZE: 1000,
    DURATION: 60000 // ms
  },
  ACCESSIBILITY: {
    WCAG_LEVEL: 'AA',
    MIN_COLOR_CONTRAST: 4.5,
    MIN_TOUCH_TARGET: 44 // px
  },
  COMPLIANCE: {
    MIN_SCORE: 95, // percentage
    MANDATORY_CHECKS: [
      'mcr_validation',
      'spc_validation',
      'medical_license',
      'data_protection',
      'professional_indemnity'
    ]
  }
} as const

// Test data size constants
export const TEST_DATA_SIZES = {
  SMALL: 50,
  MEDIUM: 200,
  LARGE: 1000,
  EXTRA_LARGE: 5000
} as const

// Browser and platform constants
export const SUPPORTED_BROWSERS = [
  'chrome',
  'firefox',
  'safari',
  'edge'
] as const

export const SUPPORTED_DEVICES = [
  'mobile',
  'tablet',
  'desktop'
] as const

export const VIEWPORT_SIZES = {
  MOBILE: { width: 375, height: 667 },
  TABLET: { width: 768, height: 1024 },
  DESKTOP: { width: 1920, height: 1080 }
} as const

// Accessibility test selectors
export const ACCESSIBILITY_SELECTORS = {
  HEADINGS: 'h1, h2, h3, h4, h5, h6',
  LANDMARKS: '[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"]',
  FORMS: 'form, input, select, textarea, button',
  IMAGES: 'img, svg, canvas',
  LINKS: 'a, button',
  TABLES: 'table, th, td'
} as const