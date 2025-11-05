/**
 * Healthcare-Specific Testing Types
 * Types for healthcare workflow and compliance testing
 */

export interface HealthcareWorkflowTest {
  id: string
  name: string
  description: string
  userType: 'patient' | 'clinic-admin' | 'doctor' | 'family-member'
  priority: 'low' | 'medium' | 'high' | 'critical'
  workflows: HealthcareWorkflow[]
  performanceTargets: HealthcarePerformanceTargets
  complianceRequirements: ComplianceRequirement[]
  dataRequirements: HealthcareDataRequirement[]
}

export interface HealthcareWorkflow {
  id: string
  name: string
  category: 'patient-journey' | 'clinic-management' | 'doctor-scheduling' | 'medical-document' | 'healthier-sg'
  steps: HealthcareWorkflowStep[]
  metadata: {
    medicalContext: 'routine' | 'emergency' | 'preventive' | 'specialist' | 'telemedicine'
    dataSensitivity: 'low' | 'medium' | 'high' | 'critical'
    regulatoryCompliance: ('pdpa' | 'moh' | 'himss' | 'hipaa')[]
  }
}

export interface HealthcareWorkflowStep {
  id: string
  action: 'navigate' | 'click' | 'type' | 'upload' | 'search' | 'select' | 'submit' | 'validate'
  selector?: string
  value?: string
  delay?: number
  timeout?: number
  expectedResult?: string
  healthcareValidation: HealthcareStepValidation
  medicalDataProcessing?: boolean
  complianceCheck?: boolean
}

export interface HealthcareStepValidation {
  dataIntegrity: boolean
  medicalRecordAccuracy: boolean
  patientSafetyCheck: boolean
  privacyCompliance: boolean
  auditTrailRequirement: boolean
  performanceThreshold: number
  errorHandling: ErrorHandlingConfig
}

export interface ErrorHandlingConfig {
  maxRetries: number
  retryDelay: number
  fallbackAction?: string
  criticalErrorHandling: boolean
  medicalErrorNotification: boolean
}

export interface HealthcarePerformanceTargets {
  responseTime: {
    appointmentBooking: number
    doctorSearch: number
    clinicDiscovery: number
    formSubmission: number
    documentUpload: number
    paymentProcessing: number
  }
  throughput: {
    concurrentUsers: number
    peakLoad: number
    sustainedLoad: number
  }
  accuracy: {
    searchResults: number
    appointmentAvailability: number
    medicalDataProcessing: number
  }
  availability: {
    uptime: number
    errorRate: number
    failoverTime: number
  }
}

export interface ComplianceRequirement {
  type: 'pdpa' | 'moh-regulations' | 'medical-records' | 'data-encryption' | 'audit-trail'
  description: string
  validationMethod: string
  threshold: number
  critical: boolean
  automatedCheck: boolean
}

export interface HealthcareDataRequirement {
  type: 'patient-record' | 'appointment-data' | 'medical-document' | 'doctor-profile' | 'clinic-info'
  volume: number
  sensitivity: 'low' | 'medium' | 'high' | 'critical'
  processingRequirement: string
  storageRequirement: string
  retentionRequirement: string
}

export interface HealthcareTestData {
  patients: PatientTestData[]
  doctors: DoctorTestData[]
  clinics: ClinicTestData[]
  appointments: AppointmentTestData[]
  medicalRecords: MedicalRecordTestData[]
}

export interface PatientTestData {
  id: string
  profile: {
    age: number
    gender: 'male' | 'female' | 'other'
    nationality: string
    preferredLanguage: 'en' | 'zh' | 'ms' | 'ta'
    medicalConditions: string[]
    insuranceType: 'medisave' | 'medishield' | 'private' | 'none'
  }
  journeySteps: string[]
  expectedBehavior: string
}

export interface DoctorTestData {
  id: string
  profile: {
    name: string
    specialization: string[]
    qualifications: string[]
    experience: number
    languages: string[]
    clinicAssociations: string[]
  }
  schedule: {
    availability: ScheduleSlot[]
    peakHours: string[]
    emergencyAvailability: boolean
  }
}

export interface ScheduleSlot {
  day: string
  startTime: string
  endTime: string
  slotDuration: number
  maxAppointments: number
  appointmentTypes: string[]
}

export interface ClinicTestData {
  id: string
  profile: {
    name: string
    type: 'general' | 'specialist' | 'emergency' | 'telemedicine'
    location: {
      address: string
      postalCode: string
      coordinates: { lat: number; lng: number }
    }
    services: string[]
    facilities: string[]
  }
  contact: {
    phone: string
    email: string
    website?: string
    emergencyContact: string
  }
  operations: {
    operatingHours: OperatingHours[]
    peakHours: string[]
    capacity: number
    specialties: string[]
  }
}

export interface OperatingHours {
  day: string
  open: string
  close: string
  emergencyHours?: string
}

export interface AppointmentTestData {
  id: string
  patientId: string
  doctorId: string
  clinicId: string
  type: 'consultation' | 'follow-up' | 'emergency' | 'preventive' | 'vaccination'
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show'
  scheduledTime: string
  duration: number
  notes?: string
}

export interface MedicalRecordTestData {
  id: string
  patientId: string
  doctorId: string
  clinicId: string
  type: 'consultation-note' | 'prescription' | 'lab-result' | 'image-report' | 'referral'
  content: string
  sensitiveData: boolean
  retentionPeriod: string
  accessLevel: string
}

export interface HealthcareTestResult {
  workflowId: string
  testId: string
  timestamp: number
  duration: number
  success: boolean
  metrics: HealthcareTestMetrics
  complianceResults: ComplianceTestResult[]
  patientJourneyResults: PatientJourneyTestResult[]
  errors: HealthcareTestError[]
  recommendations: HealthcareTestRecommendation[]
}

export interface HealthcareTestMetrics {
  workflowPerformance: {
    totalTime: number
    averageStepTime: number
    criticalPathTime: number
    errorRecoveryTime: number
  }
  dataIntegrity: {
    patientDataAccuracy: number
    appointmentDataConsistency: number
    medicalRecordIntegrity: number
    contactInformationAccuracy: number
  }
  userExperience: {
    satisfactionScore: number
    taskCompletionRate: number
    abandonmentRate: number
    errorRate: number
  }
  systemPerformance: {
    responseTime: number
    throughput: number
    errorRate: number
    availability: number
  }
}

export interface ComplianceTestResult {
  requirement: ComplianceRequirement
  passed: boolean
  score: number
  details: string
  violations: string[]
  recommendations: string[]
  evidence: ComplianceEvidence[]
}

export interface ComplianceEvidence {
  type: 'screenshot' | 'log' | 'api-response' | 'database-entry'
  timestamp: number
  description: string
  path: string
}

export interface PatientJourneyTestResult {
  journeyId: string
  stages: PatientJourneyStageResult[]
  completionRate: number
  averageCompletionTime: number
  abandonmentPoints: string[]
  userSatisfaction: number
  conversionRate: number
}

export interface PatientJourneyStageResult {
  stageId: string
  stageName: string
  startTime: number
  endTime: number
  duration: number
  completed: boolean
  errors: string[]
  userFeedback: {
    satisfaction: number
    difficulty: number
    clarity: number
  }
}

export interface HealthcareTestError {
  id: string
  type: 'technical' | 'data-integrity' | 'compliance' | 'user-experience' | 'medical'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  workflow: string
  step: string
  timestamp: number
  impact: string
  resolution: string
}

export interface HealthcareTestRecommendation {
  id: string
  category: 'performance' | 'compliance' | 'user-experience' | 'data-integrity' | 'security'
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  impact: string
  implementation: string
  estimatedEffort: string
  dependencies: string[]
  healthcareRelevance: string
}

export default {}