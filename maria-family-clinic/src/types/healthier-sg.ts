/**
 * TypeScript type definitions for Healthier SG Database Schema
 * Generated from Prisma schema - Sub-Phase 8.2
 */

// Healthier SG Category Types
export enum HealthierSGCategory {
  PREVENTIVE_CARE = 'PREVENTIVE_CARE',
  CHRONIC_DISEASE_MANAGEMENT = 'CHRONIC_DISEASE_MANAGEMENT',
  HEALTH_SCREENING = 'HEALTH_SCREENING',
  LIFESTYLE_INTERVENTION = 'LIFESTYLE_INTERVENTION',
  MENTAL_HEALTH = 'MENTAL_HEALTH',
  MATERNAL_CHILD_HEALTH = 'MATERNAL_CHILD_HEALTH',
  ELDERLY_CARE = 'ELDERLY_CARE',
  REHABILITATION = 'REHABILITATION',
  HEALTH_EDUCATION = 'HEALTH_EDUCATION',
  COMMUNITY_HEALTH = 'COMMUNITY_HEALTH'
}

// Program and Enrollment Types
export interface HealthierSGProgram {
  id: string;
  name: string;
  displayName: string;
  description?: string | null;
  category: HealthierSGCategory;
  eligibilityCriteria: Record<string, any>;
  benefits: any[];
  requirements: Record<string, any>;
  isActive: boolean;
  isMandatory: boolean;
  startDate?: Date | null;
  endDate?: Date | null;
  launchDate?: Date | null;
  programCode: string;
  mohProgramId?: string | null;
  governmentUrl?: string | null;
  legislationReference?: string | null;
  participationTargets: Record<string, any>;
  successMetrics: any[];
  reportingFrequency: HealthierSGReportingFrequency;
  responsibleMinistry?: string | null;
  programManager?: string | null;
  budgetAllocation?: number | null;
  lastUpdated: Date;
  version: string;
  createdAt: Date;
  updatedAt: Date;

  // Relationships
  enrollments?: ProgramEnrollment[];
  eligibilityRules?: ProgramEligibilityRule[];
  benefits?: ProgramBenefit[];
  clinicParticipation?: ClinicParticipation[];
  auditLogs?: HealthierSGAuditLog[];
  outcomes?: ProgramOutcome[];
}

export interface ProgramEnrollment {
  id: string;
  userId: string;
  programId: string;
  clinicId?: string | null;
  doctorId?: string | null;
  enrollmentDate: Date;
  enrollmentMethod: HealthierSGEnrollmentMethod;
  enrollmentSource: string;
  enrollmentChannel: string;
  status: HealthierSGEnrollmentStatus;
  effectiveFrom: Date;
  effectiveTo?: Date | null;
  suspensionReason?: string | null;
  suspensionDate?: Date | null;
  isVerified: boolean;
  verifiedAt?: Date | null;
  verifiedBy?: string | null;
  verificationNotes?: string | null;
  consentGiven: boolean;
  consentDate?: Date | null;
  dataSharingConsent: boolean;
  termsAccepted: boolean;
  nricVerified: boolean;
  addressVerified: boolean;
  contactVerified: boolean;
  identityVerified: boolean;
  enrollmentData: Record<string, any>;
  specialNeeds: Record<string, any>;
  languagePreference: string;
  lastActivityDate?: Date | null;
  completionStatus: Record<string, any>;
  preferredCommunication: string[];
  reminderPreferences: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;

  // Relationships
  user?: User;
  program?: HealthierSGProgram;
  clinic?: Clinic | null;
  doctor?: Doctor | null;
  benefits?: EnrolledBenefit[];
  activities?: ProgramActivity[];
  milestones?: ProgramMilestone[];
  documents?: EnrollmentDocument[];
  auditLogs?: HealthierSGAuditLog[];
}

export interface HealthProfile {
  id: string;
  userId: string;
  height?: number | null;
  weight?: number | null;
  bloodPressureSystolic?: number | null;
  bloodPressureDiastolic?: number | null;
  heartRate?: number | null;
  temperature?: number | null;
  chronicConditions: string[];
  currentMedications: string[];
  allergies: string[];
  familyHistory: string[];
  smokingStatus?: HealthierSGSmokingStatus | null;
  alcoholConsumption?: string | null;
  exerciseFrequency?: HealthierSGExerciseFrequency | null;
  dietType?: string | null;
  mentalHealthConditions: string[];
  stressLevel?: HealthierSGStressLevel | null;
  sleepHours?: number | null;
  cancerScreenings: Record<string, any>;
  diabetesScreening: Record<string, any>;
  cardiovascularScreening: Record<string, any>;
  cardiovascularRisk: Record<string, any>;
  diabetesRisk: Record<string, any>;
  cancerRisk: Record<string, any>;
  programEligibilityScores: Record<string, any>;
  riskFactors: any[];
  protectiveFactors: any[];
  primaryHealthGoal?: string | null;
  healthGoals: any[];
  targetMetrics: Record<string, any>;
  dataCompleteness?: number | null;
  lastUpdated: Date;
  updatedBy?: string | null;
  verificationStatus: string;
  sharingPreferences: Record<string, any>;
  consentForResearch: boolean;
  dataRetentionPeriod?: number | null;
  createdAt: Date;
  updatedAt: Date;

  // Relationships
  user?: User;
  assessments?: HealthAssessment[];
  goals?: HealthGoal[];
  activities?: HealthActivity[];
}

// Benefit and Claims Types
export interface ProgramBenefit {
  id: string;
  programId: string;
  benefitName: string;
  benefitType: HealthierSGBenefitType;
  description?: string | null;
  benefitValue?: number | null;
  benefitUnit?: string | null;
  maxBenefitAmount?: number | null;
  maxBenefitFrequency?: number | null;
  qualificationCriteria: any[];
  waitingPeriod?: number | null;
  isRecurring: boolean;
  isStackable: boolean;
  isTransferable: boolean;
  expirationPeriod?: number | null;
  paymentMechanism: HealthierSGBenefitPaymentMechanism;
  serviceCategories: string[];
  mohServiceCodes: string[];
  isActive: boolean;
  effectiveFrom: Date;
  effectiveTo?: Date | null;
  lastClaimDate?: Date | null;
  governmentFunded: boolean;
  reportingRequired: boolean;
  auditTrail: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Relationships
  program?: HealthierSGProgram;
  enrolledBenefits?: EnrolledBenefit[];
  claims?: BenefitClaim[];
}

export interface EnrolledBenefit {
  id: string;
  enrollmentId: string;
  benefitId: string;
  enrollmentDate: Date;
  activationDate?: Date | null;
  qualificationDate?: Date | null;
  status: HealthierSGBenefitStatus;
  isActive: boolean;
  suspensionReason?: string | null;
  suspensionDate?: Date | null;
  totalClaimsMade: number;
  totalAmountClaimed: number;
  remainingBalance?: number | null;
  nextClaimDate?: Date | null;
  claimFrequency?: string | null;
  customizedTerms: Record<string, any>;
  specialConditions: any[];
  notificationPreferences: Record<string, any>;
  lastNotificationDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;

  // Relationships
  enrollment?: ProgramEnrollment;
  benefit?: ProgramBenefit;
  claims?: BenefitClaim[];
}

export interface BenefitClaim {
  id: string;
  enrolledBenefitId: string;
  claimNumber: string;
  claimDate: Date;
  serviceDate: Date;
  claimAmount: number;
  approvedAmount?: number | null;
  serviceId?: string | null;
  clinicId?: string | null;
  doctorId?: string | null;
  serviceDescription?: string | null;
  claimDocuments: any[];
  supportingFiles: string[];
  status: HealthierSGClaimStatus;
  submissionMethod: HealthierSGClaimSubmissionMethod;
  processingNotes?: string | null;
  submittedBy?: string | null;
  reviewedBy?: string | null;
  approvedBy?: string | null;
  rejectionReason?: string | null;
  reviewDate?: Date | null;
  approvalDate?: Date | null;
  paymentDate?: Date | null;
  paymentReference?: string | null;
  paymentMethod?: string | null;
  auditRequired: boolean;
  auditNotes?: string | null;
  complianceFlags: string[];
  canBeAppealed: boolean;
  appealDeadline?: Date | null;
  appealStatus?: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Relationships
  enrolledBenefit?: EnrolledBenefit;
}

// Activity and Milestone Types
export interface ProgramActivity {
  id: string;
  enrollmentId: string;
  activityType: HealthierSGActivityType;
  activityName: string;
  description?: string | null;
  scheduledDate?: Date | null;
  completedDate?: Date | null;
  activityData: Record<string, any>;
  results: Record<string, any>;
  metrics: Record<string, any>;
  status: HealthierSGActivityStatus;
  progress?: number | null;
  serviceId?: string | null;
  clinicId?: string | null;
  doctorId?: string | null;
  appointmentId?: string | null;
  documents: string[];
  notes?: string | null;
  qualityScore?: number | null;
  outcomeScore?: number | null;
  patientFeedback?: string | null;
  complianceStatus?: string | null;
  complianceNotes?: string | null;
  benefitImpact: Record<string, any>;
  programProgress: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;

  // Relationships
  enrollment?: ProgramEnrollment;
}

export interface ProgramMilestone {
  id: string;
  enrollmentId: string;
  milestoneType: HealthierSGMilestoneType;
  milestoneName: string;
  description?: string | null;
  targetDate?: Date | null;
  achievedDate?: Date | null;
  isAchieved: boolean;
  achievementScore?: number | null;
  completionLevel?: number | null;
  requirements: any[];
  criteria: Record<string, any>;
  unlockBenefits: any[];
  rewardType?: string | null;
  rewardValue?: number | null;
  progressData: Record<string, any>;
  timeSpent?: number | null;
  effortLevel?: string | null;
  verificationRequired: boolean;
  verifiedBy?: string | null;
  verificationDate?: Date | null;
  verificationNotes?: string | null;
  healthImpact: Record<string, any>;
  programImpact: Record<string, any>;
  futureRelevance?: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Relationships
  enrollment?: ProgramEnrollment;
}

// Health Assessment and Goals Types
export interface HealthAssessment {
  id: string;
  healthProfileId: string;
  assessmentType: HealthierSGAssessmentType;
  assessmentDate: Date;
  assessmentTool: string;
  score?: number | null;
  result?: string | null;
  responses: Record<string, any>;
  clinicalData: Record<string, any>;
  observations?: string | null;
  riskLevel?: HealthierSGRiskLevel | null;
  riskFactors: any[];
  recommendations: any[];
  followUpRequired: boolean;
  followUpDate?: Date | null;
  followUpNotes?: string | null;
  programRecommendations: any[];
  eligibilityImpact: any[];
  validatedBy?: string | null;
  validationDate?: Date | null;
  qualityScore?: number | null;
  completedBy?: string | null;
  completionMethod?: string | null;
  timeSpentMinutes?: number | null;
  createdAt: Date;
  updatedAt: Date;

  // Relationships
  healthProfile?: HealthProfile;
}

export interface HealthGoal {
  id: string;
  healthProfileId: string;
  goalType: HealthierSGGoalType;
  goalName: string;
  description?: string | null;
  targetValue?: number | null;
  currentValue?: number | null;
  baselineValue?: number | null;
  smartCriteria: Record<string, any>;
  goalCategory?: string | null;
  priority: HealthierSGGoalPriority;
  targetDate: Date;
  createdDate: Date;
  reviewDate?: Date | null;
  completionDate?: Date | null;
  progress?: number | null;
  milestones: any[];
  progressNotes?: string | null;
  strategies: any[];
  supportResources: any[];
  barriers: any[];
  solutions: any[];
  accountability?: string | null;
  trackingFrequency?: string | null;
  lastTrackingDate?: Date | null;
  trackingMethod?: string | null;
  programLinks: any[];
  benefitImpact: Record<string, any>;
  enrollmentEligibility: any[];
  successCriteria: any[];
  successMeasures: any[];
  sustainabilityPlan: Record<string, any>;
  status: HealthierSGGoalStatus;
  statusNotes?: string | null;
  reviewNotes?: string | null;
  nextReviewDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;

  // Relationships
  healthProfile?: HealthProfile;
}

export interface HealthActivity {
  id: string;
  healthProfileId: string;
  activityType: HealthierSGActivityType;
  activityName: string;
  description?: string | null;
  activityDate: Date;
  duration?: number | null;
  activityValue?: number | null;
  activityMetrics: Record<string, any>;
  healthImpact: Record<string, any>;
  goalContribution: Record<string, any>;
  programProgress: Record<string, any>;
  location?: string | null;
  circumstances?: string | null;
  environmentalFactors: Record<string, any>;
  motivationLevel?: HealthierSGMotivationLevel | null;
  difficultyLevel?: HealthierSGDifficultyLevel | null;
  satisfaction?: HealthierSGSatisfactionLevel | null;
  barriers: any[];
  facilitators: any[];
  supportReceived: Record<string, any>;
  carePlanAlignment: any[];
  providerInvolvement?: string | null;
  verifiedBy?: string | null;
  verificationMethod?: string | null;
  dataSource?: string | null;
  followUpRequired: boolean;
  followUpNotes?: string | null;
  nextActivity?: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Relationships
  healthProfile?: HealthProfile;
}

// Clinic Participation Types
export interface ClinicParticipation {
  id: string;
  clinicId: string;
  programId: string;
  participationType: HealthierSGClinicParticipationType;
  participationDate: Date;
  effectiveFrom: Date;
  effectiveTo?: Date | null;
  status: HealthierSGClinicStatus;
  accreditationLevel?: HealthierSGClinicAccreditation | null;
  isVerified: boolean;
  verifiedAt?: Date | null;
  verifiedBy?: string | null;
  verificationNotes?: string | null;
  serviceScope: any[];
  patientCapacity?: number | null;
  geographicCoverage: string[];
  complianceStandards: any[];
  reportingRequirements: any[];
  qualityMetrics: any[];
  staffTrainingRequired: boolean;
  trainingCompletedDate?: Date | null;
  certificationExpiry?: Date | null;
  lastTrainingUpdate?: Date | null;
  performanceScore?: number | null;
  patientSatisfaction?: number | null;
  complianceScore?: number | null;
  reimbursementRate?: number | null;
  additionalFunding?: number | null;
  costSharing: Record<string, any>;
  supportResources: any[];
  technicalSupport: boolean;
  onboardingSupport: boolean;
  reportingFrequency: HealthierSGReportingFrequency;
  lastReportDate?: Date | null;
  nextReportDue?: Date | null;
  createdAt: Date;
  updatedAt: Date;

  // Relationships
  clinic?: Clinic;
  program?: HealthierSGProgram;
  performanceMetrics?: ClinicPerformanceMetric[];
  audits?: ClinicAudit[];
}

export interface ClinicPerformanceMetric {
  id: string;
  clinicParticipationId: string;
  metricPeriod: HealthierSGMetricPeriod;
  periodStart: Date;
  periodEnd: Date;
  patientCount: number;
  enrollmentCount: number;
  completionRate?: number | null;
  satisfactionScore?: number | null;
  qualityScore?: number | null;
  safetyIncidents: number;
  complianceScore?: number | null;
  totalClaims: number;
  approvedClaims: number;
  reimbursementAmount?: number | null;
  averageWaitTime?: number | null;
  appointmentUtilization?: number | null;
  staffProductivity?: number | null;
  healthOutcomes: any[];
  costEffectiveness?: number | null;
  preventiveCare: number;
  benchmarkComparison: Record<string, any>;
  peerRanking?: number | null;
  trendDirection?: string | null;
  isReported: boolean;
  reportedAt?: Date | null;
  reportNotes?: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Relationships
  clinicParticipation?: ClinicParticipation;
}

// Audit and Compliance Types
export interface HealthierSGAuditLog {
  id: string;
  programId?: string | null;
  enrollmentId?: string | null;
  action: HealthierSGAuditAction;
  entityType: string;
  entityId?: string | null;
  changes: Record<string, any>;
  performedBy?: string | null;
  performedByRole?: string | null;
  sessionId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  timestamp: Date;
  dataSensitivity: HealthierSGAuditDataSensitivity;
  accessReason?: string | null;
  gdprRelevant: boolean;
  pdpaRelevant: boolean;
  mohCompliance: boolean;
  previousValues: Record<string, any>;
  newValues: Record<string, any>;
  validationStatus?: string | null;
  reportToGovernment: boolean;
  governmentReportId?: string | null;
  reportingDeadline?: Date | null;
  riskLevel: HealthierSGAuditRiskLevel;
  flags: string[];
  alerts: any[];
  resolutionStatus?: string | null;
  resolutionNotes?: string | null;
  resolvedBy?: string | null;
  resolvedAt?: Date | null;
  createdAt: Date;

  // Relationships
  program?: HealthierSGProgram | null;
  enrollment?: ProgramEnrollment | null;
}

export interface ClinicAudit {
  id: string;
  clinicParticipationId: string;
  auditType: HealthierSGAuditType;
  auditPeriod: string;
  auditDate: Date;
  auditorName?: string | null;
  auditorOrganization?: string | null;
  auditScope: any[];
  complianceStandards: any[];
  overallScore?: number | null;
  criticalFindings: number;
  majorFindings: number;
  minorFindings: number;
  detailedFindings: any[];
  recommendations: any[];
  bestPractices: any[];
  patientSafety?: number | null;
  dataQuality?: number | null;
  programCompliance?: number | null;
  actionItems: any[];
  dueDate?: Date | null;
  priority: HealthierSGAuditPriority;
  followUpRequired: boolean;
  followUpDate?: Date | null;
  resolutionStatus?: string | null;
  certificationStatus?: string | null;
  accreditationLevel?: string | null;
  complianceCertificate?: string | null;
  auditReport?: string | null;
  supportingDocuments: string[];
  evidenceFiles: string[];
  reportToGovernment: boolean;
  governmentReference?: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Relationships
  clinicParticipation?: ClinicParticipation;
}

// Document Management Types
export interface EnrollmentDocument {
  id: string;
  enrollmentId: string;
  documentType: HealthierSGDocumentType;
  documentName: string;
  description?: string | null;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileHash?: string | null;
  uploadedAt: Date;
  uploadedBy?: string | null;
  verificationStatus: HealthierSGDocumentVerificationStatus;
  verifiedAt?: Date | null;
  verifiedBy?: string | null;
  expiryDate?: Date | null;
  renewalRequired: boolean;
  lastRenewalDate?: Date | null;
  nextRenewalDate?: Date | null;
  complianceRequired: boolean;
  digitalSignature: boolean;
  digitalSignatureValid?: boolean | null;
  accessLevel: HealthierSGDocumentAccessLevel;
  sharedWith: string[];
  tags: string[];
  classification?: string | null;
  retentionPeriod?: number | null;
  version: number;
  previousVersionId?: string | null;
  isCurrent: boolean;
  auditLog: any[];
  createdAt: Date;
  updatedAt: Date;

  // Relationships
  enrollment?: ProgramEnrollment;
}

// Supporting Types for Enums and Complex Structures
export enum HealthierSGReportingFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  ANNUALLY = 'ANNUALLY',
  AS_NEEDED = 'AS_NEEDED'
}

export enum HealthierSGEnrollmentMethod {
  ONLINE_SELF_ENROLLMENT = 'ONLINE_SELF_ENROLLMENT',
  CLINIC_ASSISTED = 'CLINIC_ASSISTED',
  REFERRAL = 'REFERRAL',
  GOVERNMENT_INITIATED = 'GOVERNMENT_INITIATED',
  MOBILE_APP = 'MOBILE_APP',
  PHONE_CALL = 'PHONE_CALL',
  WALK_IN = 'WALK_IN',
  HOME_VISIT = 'HOME_VISIT'
}

export enum HealthierSGEnrollmentStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  COMPLETED = 'COMPLETED',
  WITHDRAWN = 'WITHDRAWN',
  EXPIRED = 'EXPIRED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  REJECTED = 'REJECTED',
  TRANSFERRED = 'TRANSFERRED'
}

// Additional enums for completeness
export enum HealthierSGEligibilityRuleType {
  AGE_BASED = 'AGE_BASED',
  MEDICAL_CONDITION = 'MEDICAL_CONDITION',
  GEOGRAPHIC = 'GEOGRAPHIC',
  SOCIOECONOMIC = 'SOCIOECONOMIC',
  BEHAVIORAL = 'BEHAVIORAL',
  DEMOGRAPHIC = 'DEMOGRAPHIC',
  LIFESTYLE = 'LIFESTYLE',
  RISK_ASSESSMENT = 'RISK_ASSESSMENT',
  COMBINATION = 'COMBINATION',
  DYNAMIC = 'DYNAMIC'
}

export enum HealthierSGSmokingStatus {
  NEVER_SMOKED = 'NEVER_SMOKED',
  FORMER_SMOKER = 'FORMER_SMOKER',
  CURRENT_SMOKER = 'CURRENT_SMOKER',
  OCCASIONAL_SMOKER = 'OCCASIONAL_SMOKER',
  SECONDHAND_EXPOSURE = 'SECONDHAND_EXPOSURE',
  QUIT_RECENTLY = 'QUIT_RECENTLY',
  QUIT_LONG_TERM = 'QUIT_LONG_TERM'
}

export enum HealthierSGExerciseFrequency {
  NEVER = 'NEVER',
  RARELY = 'RARELY',
  WEEKLY_1_2_TIMES = 'WEEKLY_1_2_TIMES',
  WEEKLY_3_4_TIMES = 'WEEKLY_3_4_TIMES',
  DAILY = 'DAILY',
  MULTIPLE_TIMES_DAILY = 'MULTIPLE_TIMES_DAILY',
  SEDENTARY = 'SEDENTARY',
  MODERATE = 'MODERATE',
  HIGHLY_ACTIVE = 'HIGHLY_ACTIVE'
}

export enum HealthierSGStressLevel {
  VERY_LOW = 'VERY_LOW',
  LOW = 'LOW',
  MODERATE = 'MODERATE',
  HIGH = 'HIGH',
  VERY_HIGH = 'VERY_HIGH',
  EXTREME = 'EXTREME',
  MANAGED = 'MANAGED',
  UNMANAGED = 'UNMANAGED'
}

export enum HealthierSGAssessmentType {
  INITIAL_HEALTH_ASSESSMENT = 'INITIAL_HEALTH_ASSESSMENT',
  PERIODIC_HEALTH_REVIEW = 'PERIODIC_HEALTH_REVIEW',
  RISK_ASSESSMENT = 'RISK_ASSESSMENT',
  BEHAVIORAL_ASSESSMENT = 'BEHAVIORAL_ASSESSMENT',
  NUTRITIONAL_ASSESSMENT = 'NUTRITIONAL_ASSESSMENT',
  MENTAL_HEALTH_ASSESSMENT = 'MENTAL_HEALTH_ASSESSMENT',
  FUNCTIONAL_ASSESSMENT = 'FUNCTIONAL_ASSESSMENT',
  QUALITY_OF_LIFE_ASSESSMENT = 'QUALITY_OF_LIFE_ASSESSMENT',
  PROGRAM_READINESS = 'PROGRAM_READINESS',
  GOAL_SETTING_SESSION = 'GOAL_SETTING_SESSION'
}

export enum HealthierSGRiskLevel {
  VERY_LOW = 'VERY_LOW',
  LOW = 'LOW',
  MODERATE = 'MODERATE',
  HIGH = 'HIGH',
  VERY_HIGH = 'VERY_HIGH',
  CRITICAL = 'CRITICAL',
  EMERGING = 'EMERGING',
  MANAGED = 'MANAGED'
}

export enum HealthierSGActivityType {
  HEALTH_SCREENING = 'HEALTH_SCREENING',
  CONSULTATION = 'CONSULTATION',
  EDUCATIONAL_SESSION = 'EDUCATIONAL_SESSION',
  EXERCISE_CLASS = 'EXERCISE_CLASS',
  NUTRITION_COUNSELING = 'NUTRITION_COUNSELING',
  BEHAVIORAL_COUNSELING = 'BEHAVIORAL_COUNSELING',
  MEDICATION_REVIEW = 'MEDICATION_REVIEW',
  FOLLOW_UP_VISIT = 'FOLLOW_UP_VISIT',
  GROUP_SESSION = 'GROUP_SESSION',
  HOME_BASED_ACTIVITY = 'HOME_BASED_ACTIVITY',
  TELEHEALTH_SESSION = 'TELEHEALTH_SESSION',
  MONITORING_CHECK = 'MONITORING_CHECK'
}

export enum HealthierSGActivityStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  MISSED = 'MISSED',
  CANCELLED = 'CANCELLED',
  RESCHEDULED = 'RESCHEDULED',
  REQUIRES_FOLLOW_UP = 'REQUIRES_FOLLOW_UP',
  PENDING_DOCUMENTATION = 'PENDING_DOCUMENTATION'
}

export enum HealthierSGMilestoneType {
  ENROLLMENT_COMPLETE = 'ENROLLMENT_COMPLETE',
  ASSESSMENT_COMPLETE = 'ASSESSMENT_COMPLETE',
  FIRST_CONSULTATION = 'FIRST_CONSULTATION',
  INTERIM_MILESTONE = 'INTERIM_MILESTONE',
  HEALTH_GOAL_ACHIEVED = 'HEALTH_GOAL_ACHIEVED',
  PROGRAM_COMPLETION = 'PROGRAM_COMPLETION',
  BEHAVIOR_CHANGE = 'BEHAVIOR_CHANGE',
  HEALTH_IMPROVEMENT = 'HEALTH_IMPROVEMENT',
  KNOWLEDGE_ACHIEVEMENT = 'KNOWLEDGE_ACHIEVEMENT',
  PARTICIPATION_TARGET = 'PARTICIPATION_TARGET'
}

export enum HealthierSGOutcomeType {
  HEALTH_IMPROVEMENT = 'HEALTH_IMPROVEMENT',
  BEHAVIOR_CHANGE = 'BEHAVIOR_CHANGE',
  RISK_REDUCTION = 'RISK_REDUCTION',
  QUALITY_OF_LIFE = 'QUALITY_OF_LIFE',
  COST_EFFECTIVENESS = 'COST_EFFECTIVENESS',
  PATIENT_SATISFACTION = 'PATIENT_SATISFACTION',
  ADHERENCE_RATE = 'ADHERENCE_RATE',
  PREVENTION_SUCCESS = 'PREVENTION_SUCCESS',
  EARLY_DETECTION = 'EARLY_DETECTION',
  PROGRAM_ENGAGEMENT = 'PROGRAM_ENGAGEMENT'
}

export enum HealthierSGGoalType {
  WEIGHT_MANAGEMENT = 'WEIGHT_MANAGEMENT',
  BLOOD_PRESSURE_CONTROL = 'BLOOD_PRESSURE_CONTROL',
  DIABETES_MANAGEMENT = 'DIABETES_MANAGEMENT',
  CHOLESTEROL_MANAGEMENT = 'CHOLESTEROL_MANAGEMENT',
  SMOKING_CESSATION = 'SMOKING_CESSATION',
  PHYSICAL_ACTIVITY = 'PHYSICAL_ACTIVITY',
  NUTRITION_IMPROVEMENT = 'NUTRITION_IMPROVEMENT',
  STRESS_MANAGEMENT = 'STRESS_MANAGEMENT',
  MEDICATION_ADHERENCE = 'MEDICATION_ADHERENCE',
  PREVENTIVE_SCREENING = 'PREVENTIVE_SCREENING',
  MENTAL_HEALTH = 'MENTAL_HEALTH',
  FUNCTIONAL_IMPROVEMENT = 'FUNCTIONAL_IMPROVEMENT',
  QUALITY_OF_LIFE = 'QUALITY_OF_LIFE',
  DISEASE_MANAGEMENT = 'DISEASE_MANAGEMENT'
}

export enum HealthierSGGoalPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
  URGENT = 'URGENT',
  OPTIONAL = 'OPTIONAL',
  MANDATORY = 'MANDATORY'
}

export enum HealthierSGGoalStatus {
  ACTIVE = 'ACTIVE',
  ON_TRACK = 'ON_TRACK',
  BEHIND_SCHEDULE = 'BEHIND_SCHEDULE',
  ACHIEVED = 'ACHIEVED',
  MODIFIED = 'MODIFIED',
  CANCELLED = 'CANCELLED',
  ON_HOLD = 'ON_HOLD',
  ARCHIVED = 'ARCHIVED'
}

export enum HealthierSGMotivationLevel {
  VERY_LOW = 'VERY_LOW',
  LOW = 'LOW',
  MODERATE = 'MODERATE',
  HIGH = 'HIGH',
  VERY_HIGH = 'VERY_HIGH',
  EXTREMELY_HIGH = 'EXTREMELY_HIGH',
  FLUCTUATING = 'FLUCTUATING',
  DECLINING = 'DECLINING'
}

export enum HealthierSGDifficultyLevel {
  VERY_EASY = 'VERY_EASY',
  EASY = 'EASY',
  MODERATE = 'MODERATE',
  DIFFICULT = 'DIFFICULT',
  VERY_DIFFICULT = 'VERY_DIFFICULT',
  EXTREMELY_CHALLENGING = 'EXTREMELY_CHALLENGING',
  MANAGEABLE = 'MANAGEABLE'
}

export enum HealthierSGSatisfactionLevel {
  VERY_DISSATISFIED = 'VERY_DISSATISFIED',
  DISSATISFIED = 'DISSATISFIED',
  NEUTRAL = 'NEUTRAL',
  SATISFIED = 'SATISFIED',
  VERY_SATISFIED = 'VERY_SATISFIED',
  EXTREMELY_SATISFIED = 'EXTREMELY_SATISFIED',
  MIXED_FEELINGS = 'MIXED_FEELINGS'
}

export enum HealthierSGBenefitType {
  MONETARY = 'MONETARY',
  SERVICE_DISCOUNT = 'SERVICE_DISCOUNT',
  SUBSIDY = 'SUBSIDY',
  REIMBURSEMENT = 'REIMBURSEMENT',
  PREVENTIVE_SCREENING = 'PREVENTIVE_SCREENING',
  HEALTHCARE_SERVICE = 'HEALTHCARE_SERVICE',
  MEDICATION = 'MEDICATION',
  EQUIPMENT = 'EQUIPMENT',
  EDUCATION = 'EDUCATION',
  SUPPORT_SERVICE = 'SUPPORT_SERVICE'
}

export enum HealthierSGBenefitStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  EXPIRED = 'EXPIRED',
  EXHAUSTED = 'EXHAUSTED',
  PENDING_ACTIVATION = 'PENDING_ACTIVATION',
  UNDER_REVIEW = 'UNDER_REVIEW',
  DISPUTED = 'DISPUTED'
}

export enum HealthierSGBenefitPaymentMechanism {
  DIRECT_PAYMENT = 'DIRECT_PAYMENT',
  REIMBURSEMENT = 'REIMBURSEMENT',
  CLAIM_SUBMISSION = 'CLAIM_SUBMISSION',
  AUTOMATIC_CREDIT = 'AUTOMATIC_CREDIT',
  VOUCHER_SYSTEM = 'VOUCHER_SYSTEM',
  INSURANCE_CLAIM = 'INSURANCE_CLAIM'
}

export enum HealthierSGClaimStatus {
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PARTIALLY_APPROVED = 'PARTIALLY_APPROVED',
  PAID = 'PAID',
  DISPUTED = 'DISPUTED',
  APPEALED = 'APPEALED'
}

export enum HealthierSGClaimSubmissionMethod {
  ONLINE_PORTAL = 'ONLINE_PORTAL',
  MOBILE_APP = 'MOBILE_APP',
  EMAIL = 'EMAIL',
  MAIL = 'MAIL',
  IN_PERSON = 'IN_PERSON',
  PHONE = 'PHONE',
  API_INTEGRATION = 'API_INTEGRATION',
  BATCH_SUBMISSION = 'BATCH_SUBMISSION'
}

export enum HealthierSGClinicParticipationType {
  FULL_PARTICIPATION = 'FULL_PARTICIPATION',
  SELECTED_SERVICES = 'SELECTED_SERVICES',
  PILOT_PROGRAM = 'PILOT_PROGRAM',
  RESEARCH_PARTICIPANT = 'RESEARCH_PARTICIPANT',
  TRAINING_CENTER = 'TRAINING_CENTER',
  REFERRAL_PARTNER = 'REFERRAL_PARTNER',
  COLLABORATIVE_CARE = 'COLLABORATIVE_CARE'
}

export enum HealthierSGClinicStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  ACCREDITED = 'ACCREDITED',
  SUSPENDED = 'SUSPENDED',
  REVOKED = 'REVOKED',
  EXPIRED = 'EXPIRED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  CONDITIONAL_APPROVAL = 'CONDITIONAL_APPROVAL'
}

export enum HealthierSGClinicAccreditation {
  BASIC = 'BASIC',
  STANDARD = 'STANDARD',
  ADVANCED = 'ADVANCED',
  SPECIALIZED = 'SPECIALIZED',
  CENTER_OF_EXCELLENCE = 'CENTER_OF_EXCELLENCE',
  RESEARCH_CENTER = 'RESEARCH_CENTER',
  TRAINING_CENTER = 'TRAINING_CENTER'
}

export enum HealthierSGMetricPeriod {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  ANNUALLY = 'ANNUALLY',
  CAMPAIGN_PERIOD = 'CAMPAIGN_PERIOD',
  PROGRAM_PHASE = 'PROGRAM_PHASE'
}

export enum HealthierSGAuditAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  ACCESS_DENIED = 'ACCESS_DENIED',
  DATA_EXPORT = 'DATA_EXPORT',
  DATA_IMPORT = 'DATA_IMPORT',
  SYSTEM_ACCESS = 'SYSTEM_ACCESS',
  CONFIGURATION_CHANGE = 'CONFIGURATION_CHANGE',
  BACKUP = 'BACKUP',
  RESTORE = 'RESTORE'
}

export enum HealthierSGAuditDataSensitivity {
  PUBLIC = 'PUBLIC',
  INTERNAL = 'INTERNAL',
  SENSITIVE = 'SENSITIVE',
  HIGHLY_SENSITIVE = 'HIGHLY_SENSITIVE',
  CONFIDENTIAL = 'CONFIDENTIAL',
  RESTRICTED = 'RESTRICTED',
  MEDICAL = 'MEDICAL',
  PERSONAL_IDENTIFIABLE = 'PERSONAL_IDENTIFIABLE'
}

export enum HealthierSGAuditRiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
  EMERGENCY = 'EMERGENCY',
  MONITORING = 'MONITORING'
}

export enum HealthierSGAuditType {
  REGULAR_SCHEDULED = 'REGULAR_SCHEDULED',
  COMPLIANCE_AUDIT = 'COMPLIANCE_AUDIT',
  DATA_QUALITY_AUDIT = 'DATA_QUALITY_AUDIT',
  SECURITY_AUDIT = 'SECURITY_AUDIT',
  PERFORMANCE_AUDIT = 'PERFORMANCE_AUDIT',
  FINANCIAL_AUDIT = 'FINANCIAL_AUDIT',
  PROGRAM_EFFECTIVENESS = 'PROGRAM_EFFECTIVENESS',
  INCIDENT_RESPONSE = 'INCIDENT_RESPONSE',
  SPOT_CHECK = 'SPOT_CHECK',
  EXTERNAL_AUDIT = 'EXTERNAL_AUDIT'
}

export enum HealthierSGAuditPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
  URGENT = 'URGENT',
  ROUTINE = 'ROUTINE'
}

export enum HealthierSGDocumentType {
  IDENTITY_VERIFICATION = 'IDENTITY_VERIFICATION',
  MEDICAL_RECORDS = 'MEDICAL_RECORDS',
  CONSENT_FORMS = 'CONSENT_FORMS',
  ELIGIBILITY_DOCUMENTS = 'ELIGIBILITY_DOCUMENTS',
  BENEFIT_CLAIMS = 'BENEFIT_CLAIMS',
  INVOICES_RECEIPTS = 'INVOICES_RECEIPTS',
  INSURANCE_DOCUMENTS = 'INSURANCE_DOCUMENTS',
  REFERRAL_LETTERS = 'REFERRAL_LETTERS',
  DISCHARGE_SUMMARIES = 'DISCHARGE_SUMMARIES',
  LAB_RESULTS = 'LAB_RESULTS',
  IMAGING_REPORTS = 'IMAGING_REPORTS',
  PRESCRIPTION_RECORDS = 'PRESCRIPTION_RECORDS',
  PROGRAM_CERTIFICATES = 'PROGRAM_CERTIFICATES',
  AUDIT_REPORTS = 'AUDIT_REPORTS',
  COMPLIANCE_DOCUMENTS = 'COMPLIANCE_DOCUMENTS'
}

export enum HealthierSGDocumentVerificationStatus {
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
  REQUIRES_RENEWAL = 'REQUIRES_RENEWAL',
  CONDITIONALLY_APPROVED = 'CONDITIONALLY_APPROVED'
}

export enum HealthierSGDocumentAccessLevel {
  PUBLIC = 'PUBLIC',
  RESTRICTED = 'RESTRICTED',
  CONFIDENTIAL = 'CONFIDENTIAL',
  HIGHLY_CONFIDENTIAL = 'HIGHLY_CONFIDENTIAL',
  MEDICAL_RECORD = 'MEDICAL_RECORD',
  AUDIT_ONLY = 'AUDIT_ONLY',
  GOVERNMENT_ONLY = 'GOVERNMENT_ONLY',
  TIME_LIMITED = 'TIME_LIMITED'
}

// Utility Types for API Responses
export interface HealthierSGApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface HealthierSGEnrollmentStats {
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  suspendedEnrollments: number;
  averageCompletionTime: number;
  enrollmentByProgram: Record<string, number>;
  enrollmentByClinic: Record<string, number>;
  enrollmentTrend: Array<{
    date: string;
    count: number;
  }>;
}

export interface HealthierSGBenefitsStats {
  totalBenefits: number;
  activeBenefits: number;
  totalClaims: number;
  approvedClaims: number;
  rejectedClaims: number;
  totalAmountClaimed: number;
  totalAmountApproved: number;
  benefitsByType: Record<HealthierSGBenefitType, number>;
  claimsByStatus: Record<HealthierSGClaimStatus, number>;
  topBenefitingClinics: Array<{
    clinicId: string;
    clinicName: string;
    claimCount: number;
    totalAmount: number;
  }>;
}

export interface HealthierSGPerformanceMetrics {
  programParticipationRate: number;
  averageGoalAchievement: number;
  patientSatisfactionScore: number;
  costEffectivenessRatio: number;
  healthImprovementRate: number;
  programCompletionRate: number;
  clinicPerformanceScores: Array<{
    clinicId: string;
    clinicName: string;
    performanceScore: number;
    patientCount: number;
    satisfactionScore: number;
  }>;
}

// Integration with existing User, Clinic, Doctor types from main schema
// These would typically be imported from the main schema types
export interface User {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role: 'PATIENT' | 'ADMIN' | 'PROVIDER' | 'CLINIC_ADMIN';
  createdAt: Date;
  updatedAt: Date;
}

export interface Clinic {
  id: string;
  name: string;
  description?: string | null;
  address: string;
  postalCode: string;
  phone?: string | null;
  email?: string | null;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Doctor {
  id: string;
  name: string;
  email?: string | null;
  medicalLicense: string;
  specialties: string[];
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
