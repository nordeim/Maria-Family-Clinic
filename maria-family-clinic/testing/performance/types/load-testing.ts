/**
 * Load Testing Types
 * Healthcare-specific load testing type definitions
 */

export interface LoadTestScenario {
  name: string
  weight: number
  executor: 'constant-vus' | 'ramping-vus' | 'per-vu-iterations' | 'shared-iterations'
  startTime?: string
  stages?: Array<{
    duration: string
    target: number
  }>
  iterations?: number
  maxIterations?: number
  responseTimeThreshold?: string
  thinkTime?: string
  customSetupCode?: string
  customTeardownCode?: string
}

export interface HealthcareLoadTestScenario extends LoadTestScenario {
  healthcareUserType: 'patient' | 'clinic-admin' | 'doctor' | 'family-member'
  healthcareWorkflow: string
  patientJourney: string
  medicalDataVolume?: number
  apiEndpoints: string[]
  expectedSessionDuration: string
}

export interface LoadTestMetrics {
  http: {
    requests: number
    rate: number
    avg_response_time: number
    p95_response_time: number
    p99_response_time: number
    max_response_time: number
    min_response_time: number
    failures: number
  }
  checks: {
    passed: number
    failed: number
    rate: number
  }
 vus: {
    value: number
    min: number
    max: number
    avg: number
  }
  grpc: {
    reqs_sent: number
    reqs_failed: number
    response_time: { avg: number; p90: number; p95: number; p99: number }
  }
  ws: {
    connecting: number
    connected: number
    disconnecting: number
    messages_received: number
    messages_sent: number
  }
}

export interface LoadTestThresholds {
  http_req_duration: Array<{
    'p(95)': string
    'p(99)': string
  }>
  http_req_failed: Array<{
    rate: string
  }>
  checks: Array<{
    'rate': string
  }>
 vus: Array<{
    max: string
  }>
}

export interface LoadTestEnvironment {
  name: string
  url: string
  headers: Record<string, string>
  timeout: number
  healthcareSettings: {
    enableComplianceCheck: boolean
    simulateMedicalData: boolean
    healthcareApiEndpoints: string[]
    privacyMode: boolean
  }
}

export default {}