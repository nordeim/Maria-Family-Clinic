// Registration Wizard Types

import type { z } from 'zod'

// Base registration step interface
export interface RegistrationStep {
  id: string
  title: string
  description: string
  required: boolean
  stepNumber: number
  estimatedMinutes: number
}

// Personal Information Step
export interface PersonalInfoStep {
  firstName: string
  lastName: string
  phone: string
  address: {
    street: string
    unit: string
    postalCode: string
    country: string
  }
  emergencyContact: {
    name: string
    relationship: string
    phone: string
  }
  preferredLanguage: 'en' | 'zh' | 'ms' | 'ta'
  communicationPreferences: {
    email: boolean
    sms: boolean
    phone: boolean
  }
}

// Identity Verification Step
export interface IdentityVerificationStep {
  verified: boolean
  verificationMethod: 'singpass' | 'manual'
  nric: string
  verificationData?: {
    name: string
    dateOfBirth: string
    address: string
    nationality: string
  }
  verifiedAt?: Date
  verificationId?: string
}

// Digital Consent Step
export interface DigitalConsentStep {
  consentsSigned: boolean
  consentVersion: string
  consentData: {
    programParticipation: boolean
    dataCollection: boolean
    healthcareData: boolean
    researchParticipation: boolean
    marketingCommunication: boolean
    thirdPartySharing: boolean
  }
  consentMetadata: {
    ipAddress: string
    userAgent: string
    timestamp: Date
    digitalSignature?: string
    witnessName?: string
  }
  ageVerification: {
    isOver18: boolean
    guardianConsentRequired: boolean
    guardianDetails?: {
      name: string
      relationship: string
      nric: string
      signature: string
    }
  }
}

// Document Upload Step
export interface DocumentUploadStep {
  uploadedDocuments: UploadedDocument[]
  documentMetadata: DocumentMetadata[]
}

export interface UploadedDocument {
  id: string
  fileName: string
  fileType: string
  fileSize: number
  uploadDate: Date
  verificationStatus: 'pending' | 'approved' | 'rejected' | 'requires_review'
  ocrData?: {
    extractedText: string
    confidence: number
    fields: Record<string, string>
  }
  reviewNotes?: string
  expiryDate?: Date
}

export interface DocumentMetadata {
  documentType: 'nric_front' | 'nric_back' | 'insurance_card' | 'medical_records' | 'medication_list' | 'proof_of_address' | 'other'
  required: boolean
  description: string
  maxFileSize: number
  acceptedFormats: string[]
  validationRules: string[]
}

// Health Goals Step
export interface HealthGoalsStep {
  selectedGoals: HealthGoal[]
  customGoals: CustomGoal[]
  priorityLevel: 'low' | 'medium' | 'high'
  timeFrame: '3months' | '6months' | '1year' | 'longterm'
  lifestyleFactors: LifestyleFactor[]
  riskFactors: RiskFactor[]
}

export interface HealthGoal {
  id: string
  category: 'weight_management' | 'blood_pressure' | 'diabetes' | 'cholesterol' | 'mental_health' | 'exercise' | 'nutrition' | 'smoking' | 'sleep'
  title: string
  description: string
  measurable: boolean
  target?: string
  timeline?: string
}

export interface CustomGoal {
  id: string
  title: string
  description: string
  target: string
  timeline: string
  priority: 'low' | 'medium' | 'high'
}

export interface LifestyleFactor {
  type: 'smoking' | 'alcohol' | 'exercise' | 'diet' | 'sleep' | 'stress'
  current: string
  goal: string
  barriers: string[]
  support: string[]
}

export interface RiskFactor {
  factor: string
  currentStatus: 'low' | 'medium' | 'high' | 'unknown'
  riskLevel: 'low' | 'medium' | 'high'
  mitigation: string
}

// Review & Submit Step
export interface ReviewSubmitStep {
  reviewCompleted: boolean
  dataValidation: DataValidation
  registrationId?: string
  submissionData: SubmissionData
}

export interface DataValidation {
  personalInfo: boolean
  identityVerification: boolean
  digitalConsent: boolean
  documents: boolean
  healthGoals: boolean
  overall: boolean
  validationErrors: ValidationError[]
}

export interface ValidationError {
  step: string
  field: string
  message: string
  severity: 'error' | 'warning'
}

export interface SubmissionData {
  finalData: Record<string, any>
  submissionTimestamp: Date
  estimatedProcessingTime: string
  nextSteps: NextStep[]
}

export interface NextStep {
  title: string
  description: string
  actionRequired: boolean
  timeline?: string
  contactInfo?: {
    department: string
    phone: string
    email: string
  }
}

// Confirmation Step
export interface ConfirmationStep {
  registrationId: string
  status: 'submitted' | 'processing' | 'approved' | 'rejected'
  submissionDate: Date
  estimatedCompletion: Date
  confirmationNumber: string
  nextActions: NextStep[]
}

// Main wizard data structure
export interface RegistrationWizardData {
  personalInfo: PersonalInfoStep | null
  identityVerification: IdentityVerificationStep | null
  digitalConsent: DigitalConsentStep | null
  documents: DocumentUploadStep | null
  healthGoals: HealthGoalsStep | null
  reviewSubmit: ReviewSubmitStep | null
}

// Registration Progress
export interface RegistrationProgress {
  currentStep: string
  completedSteps: string[]
  totalSteps: number
  completionPercentage: number
  timeElapsed: number
  estimatedTimeRemaining: number
  lastUpdated: Date
}

// Save Draft Payload
export interface SaveDraftPayload {
  eligibilityAssessmentId: string
  data: RegistrationWizardData
  stepId: string
  autoSave?: boolean
}

// Registration Status
export interface RegistrationStatus {
  id: string
  userId: string
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'needs_revision' | 'withdrawn'
  eligibilityAssessmentId: string
  currentStep: string
  progress: RegistrationProgress
  submissionDate?: Date
  reviewDate?: Date
  approvalDate?: Date
  rejectionReason?: string
  revisionRequired?: string[]
  auditLog: RegistrationAuditEntry[]
  metadata: {
    ipAddress: string
    userAgent: string
    sessionId: string
    deviceType: 'desktop' | 'mobile' | 'tablet'
    browserInfo: string
  }
}

export interface RegistrationAuditEntry {
  id: string
  timestamp: Date
  action: string
  stepId?: string
  data: Record<string, any>
  userId: string
  ipAddress: string
  userAgent: string
}

// Notification Types
export interface RegistrationNotification {
  id: string
  type: 'step_completed' | 'document_approved' | 'document_rejected' | 'registration_submitted' | 'registration_approved' | 'registration_rejected' | 'reminder' | 'system_update'
  title: string
  message: string
  severity: 'info' | 'success' | 'warning' | 'error'
  timestamp: Date
  read: boolean
  actionUrl?: string
  actionLabel?: string
  metadata: Record<string, any>
}

// API Response Types
export interface RegistrationAPIResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: Record<string, any>
  }
  metadata?: {
    timestamp: Date
    requestId: string
    processingTime: number
  }
}

// Document Verification Types
export interface DocumentVerification {
  documentId: string
  verificationStatus: 'pending' | 'processing' | 'approved' | 'rejected' | 'requires_manual_review'
  verificationMethod: 'automatic' | 'manual' | 'ocr' | 'ai_assisted'
  verifiedFields: Record<string, any>
  confidence: number
  verificationNotes: string
  reviewerId?: string
  verificationDate?: Date
  expiryDate?: Date
}

// SingPass Integration Types
export interface SingPassIntegration {
  authenticationUrl: string
  clientId: string
  redirectUri: string
  scope: string[]
  state: string
  nonce: string
  codeChallenge: string
  codeChallengeMethod: 'S256'
}

export interface SingPassUserInfo {
  sub: string
  name: string
  given_name: string
  family_name: string
  uinFin: string
  mobileno: string
  last_LOGIN_Timestamp: string
  last_LOGIN_IP: string
  last_LOGIN_USERAGENT: string
  consent: string
  id_type: string
  alias_id: string
}

// Error Types
export interface RegistrationError {
  code: string
  message: string
  field?: string
  step?: string
  timestamp: Date
  recoverable: boolean
  suggestion?: string
}

// Validation Schemas (Zod)
export interface ValidationSchema {
  personalInfo: z.ZodSchema<PersonalInfoStep>
  identityVerification: z.ZodSchema<IdentityVerificationStep>
  digitalConsent: z.ZodSchema<DigitalConsentStep>
  documentUpload: z.ZodSchema<DocumentUploadStep>
  healthGoals: z.ZodSchema<HealthGoalsStep>
  reviewSubmit: z.ZodSchema<ReviewSubmitStep>
}