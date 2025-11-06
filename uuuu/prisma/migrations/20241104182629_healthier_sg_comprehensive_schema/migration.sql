-- CreateEnum
CREATE TYPE "HealthierSGCategory" AS ENUM ('PREVENTIVE_CARE', 'CHRONIC_DISEASE_MANAGEMENT', 'HEALTH_SCREENING', 'LIFESTYLE_INTERVENTION', 'MENTAL_HEALTH', 'MATERNAL_CHILD_HEALTH', 'ELDERLY_CARE', 'REHABILITATION', 'HEALTH_EDUCATION', 'COMMUNITY_HEALTH');

-- CreateEnum
CREATE TYPE "HealthierSGReportingFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY', 'AS_NEEDED');

-- CreateEnum
CREATE TYPE "HealthierSGEnrollmentMethod" AS ENUM ('ONLINE_SELF_ENROLLMENT', 'CLINIC_ASSISTED', 'REFERRAL', 'GOVERNMENT_INITIATED', 'MOBILE_APP', 'PHONE_CALL', 'WALK_IN', 'HOME_VISIT');

-- CreateEnum
CREATE TYPE "HealthierSGEnrollmentStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'COMPLETED', 'WITHDRAWN', 'EXPIRED', 'PENDING_VERIFICATION', 'REJECTED', 'TRANSFERRED');

-- CreateEnum
CREATE TYPE "HealthierSGEligibilityRuleType" AS ENUM ('AGE_BASED', 'MEDICAL_CONDITION', 'GEOGRAPHIC', 'SOCIOECONOMIC', 'BEHAVIORAL', 'DEMOGRAPHIC', 'LIFESTYLE', 'RISK_ASSESSMENT', 'COMBINATION', 'DYNAMIC');

-- CreateEnum
CREATE TYPE "HealthierSGRecalculationFrequency" AS ENUM ('REAL_TIME', 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY', 'EVENT_TRIGGERED');

-- CreateEnum
CREATE TYPE "HealthierSGEvaluationType" AS ENUM ('INITIAL', 'PERIODIC', 'TRIGGERED', 'RE_EVALUATION', 'APPEAL', 'COMPLIANCE', 'QUALITY_ASSURANCE');

-- CreateEnum
CREATE TYPE "HealthierSGEvaluationResult" AS ENUM ('ELIGIBLE', 'NOT_ELIGIBLE', 'CONDITIONAL', 'PENDING_DOCUMENTATION', 'REQUIRES_REVIEW', 'APPEAL_REQUIRED');

-- CreateEnum
CREATE TYPE "HealthierSGBenefitType" AS ENUM ('MONETARY', 'SERVICE_DISCOUNT', 'SUBSIDY', 'REIMBURSEMENT', 'PREVENTIVE_SCREENING', 'HEALTHCARE_SERVICE', 'MEDICATION', 'EQUIPMENT', 'EDUCATION', 'SUPPORT_SERVICE');

-- CreateEnum
CREATE TYPE "HealthierSGBenefitStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'EXPIRED', 'EXHAUSTED', 'PENDING_ACTIVATION', 'UNDER_REVIEW', 'DISPUTED');

-- CreateEnum
CREATE TYPE "HealthierSGBenefitPaymentMechanism" AS ENUM ('DIRECT_PAYMENT', 'REIMBURSEMENT', 'CLAIM_SUBMISSION', 'AUTOMATIC_CREDIT', 'VOUCHER_SYSTEM', 'INSURANCE_CLAIM');

-- CreateEnum
CREATE TYPE "HealthierSGClaimStatus" AS ENUM ('PENDING', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'PARTIALLY_APPROVED', 'PAID', 'DISPUTED', 'APPEALED');

-- CreateEnum
CREATE TYPE "HealthierSGClaimSubmissionMethod" AS ENUM ('ONLINE_PORTAL', 'MOBILE_APP', 'EMAIL', 'MAIL', 'IN_PERSON', 'PHONE', 'API_INTEGRATION', 'BATCH_SUBMISSION');

-- CreateEnum
CREATE TYPE "HealthierSGClinicParticipationType" AS ENUM ('FULL_PARTICIPATION', 'SELECTED_SERVICES', 'PILOT_PROGRAM', 'RESEARCH_PARTICIPANT', 'TRAINING_CENTER', 'REFERRAL_PARTNER', 'COLLABORATIVE_CARE');

-- CreateEnum
CREATE TYPE "HealthierSGClinicStatus" AS ENUM ('PENDING', 'APPROVED', 'ACCREDITED', 'SUSPENDED', 'REVOKED', 'EXPIRED', 'UNDER_REVIEW', 'CONDITIONAL_APPROVAL');

-- CreateEnum
CREATE TYPE "HealthierSGClinicAccreditation" AS ENUM ('BASIC', 'STANDARD', 'ADVANCED', 'SPECIALIZED', 'CENTER_OF_EXCELLENCE', 'RESEARCH_CENTER', 'TRAINING_CENTER');

-- CreateEnum
CREATE TYPE "HealthierSGMetricPeriod" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY', 'CAMPAIGN_PERIOD', 'PROGRAM_PHASE');

-- CreateEnum
CREATE TYPE "HealthierSGSmokingStatus" AS ENUM ('NEVER_SMOKED', 'FORMER_SMOKER', 'CURRENT_SMOKER', 'OCCASIONAL_SMOKER', 'SECONDHAND_EXPOSURE', 'QUIT_RECENTLY', 'QUIT_LONG_TERM');

-- CreateEnum
CREATE TYPE "HealthierSGExerciseFrequency" AS ENUM ('NEVER', 'RARELY', 'WEEKLY_1_2_TIMES', 'WEEKLY_3_4_TIMES', 'DAILY', 'MULTIPLE_TIMES_DAILY', 'SEDENTARY', 'MODERATE', 'HIGHLY_ACTIVE');

-- CreateEnum
CREATE TYPE "HealthierSGStressLevel" AS ENUM ('VERY_LOW', 'LOW', 'MODERATE', 'HIGH', 'VERY_HIGH', 'EXTREME', 'MANAGED', 'UNMANAGED');

-- CreateEnum
CREATE TYPE "HealthierSGAssessmentType" AS ENUM ('INITIAL_HEALTH_ASSESSMENT', 'PERIODIC_HEALTH_REVIEW', 'RISK_ASSESSMENT', 'BEHAVIORAL_ASSESSMENT', 'NUTRITIONAL_ASSESSMENT', 'MENTAL_HEALTH_ASSESSMENT', 'FUNCTIONAL_ASSESSMENT', 'QUALITY_OF_LIFE_ASSESSMENT', 'PROGRAM_READINESS', 'GOAL_SETTING_SESSION');

-- CreateEnum
CREATE TYPE "HealthierSGRiskLevel" AS ENUM ('VERY_LOW', 'LOW', 'MODERATE', 'HIGH', 'VERY_HIGH', 'CRITICAL', 'EMERGING', 'MANAGED');

-- CreateEnum
CREATE TYPE "HealthierSGActivityType" AS ENUM ('HEALTH_SCREENING', 'CONSULTATION', 'EDUCATIONAL_SESSION', 'EXERCISE_CLASS', 'NUTRITION_COUNSELING', 'BEHAVIORAL_COUNSELING', 'MEDICATION_REVIEW', 'FOLLOW_UP_VISIT', 'GROUP_SESSION', 'HOME_BASED_ACTIVITY', 'TELEHEALTH_SESSION', 'MONITORING_CHECK');

-- CreateEnum
CREATE TYPE "HealthierSGActivityStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'MISSED', 'CANCELLED', 'RESCHEDULED', 'REQUIRES_FOLLOW_UP', 'PENDING_DOCUMENTATION');

-- CreateEnum
CREATE TYPE "HealthierSGMilestoneType" AS ENUM ('ENROLLMENT_COMPLETE', 'ASSESSMENT_COMPLETE', 'FIRST_CONSULTATION', 'INTERIM_MILESTONE', 'HEALTH_GOAL_ACHIEVED', 'PROGRAM_COMPLETION', 'BEHAVIOR_CHANGE', 'HEALTH_IMPROVEMENT', 'KNOWLEDGE_ACHIEVEMENT', 'PARTICIPATION_TARGET');

-- CreateEnum
CREATE TYPE "HealthierSGOutcomeType" AS ENUM ('HEALTH_IMPROVEMENT', 'BEHAVIOR_CHANGE', 'RISK_REDUCTION', 'QUALITY_OF_LIFE', 'COST_EFFECTIVENESS', 'PATIENT_SATISFACTION', 'ADHERENCE_RATE', 'PREVENTION_SUCCESS', 'EARLY_DETECTION', 'PROGRAM_ENGAGEMENT');

-- CreateEnum
CREATE TYPE "HealthierSGGoalType" AS ENUM ('WEIGHT_MANAGEMENT', 'BLOOD_PRESSURE_CONTROL', 'DIABETES_MANAGEMENT', 'CHOLESTEROL_MANAGEMENT', 'SMOKING_CESSATION', 'PHYSICAL_ACTIVITY', 'NUTRITION_IMPROVEMENT', 'STRESS_MANAGEMENT', 'MEDICATION_ADHERENCE', 'PREVENTIVE_SCREENING', 'MENTAL_HEALTH', 'FUNCTIONAL_IMPROVEMENT', 'QUALITY_OF_LIFE', 'DISEASE_MANAGEMENT');

-- CreateEnum
CREATE TYPE "HealthierSGGoalPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'URGENT', 'OPTIONAL', 'MANDATORY');

-- CreateEnum
CREATE TYPE "HealthierSGGoalStatus" AS ENUM ('ACTIVE', 'ON_TRACK', 'BEHIND_SCHEDULE', 'ACHIEVED', 'MODIFIED', 'CANCELLED', 'ON_HOLD', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "HealthierSGMotivationLevel" AS ENUM ('VERY_LOW', 'LOW', 'MODERATE', 'HIGH', 'VERY_HIGH', 'EXTREMELY_HIGH', 'FLUCTUATING', 'DECLINING');

-- CreateEnum
CREATE TYPE "HealthierSGDifficultyLevel" AS ENUM ('VERY_EASY', 'EASY', 'MODERATE', 'DIFFICULT', 'VERY_DIFFICULT', 'EXTREMELY_CHALLENGING', 'MANAGEABLE');

-- CreateEnum
CREATE TYPE "HealthierSGSatisfactionLevel" AS ENUM ('VERY_DISSATISFIED', 'DISSATISFIED', 'NEUTRAL', 'SATISFIED', 'VERY_SATISFIED', 'EXTREMELY_SATISFIED', 'MIXED_FEELINGS');

-- CreateEnum
CREATE TYPE "HealthierSGAuditAction" AS ENUM ('CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'ACCESS_DENIED', 'DATA_EXPORT', 'DATA_IMPORT', 'SYSTEM_ACCESS', 'CONFIGURATION_CHANGE', 'BACKUP', 'RESTORE');

-- CreateEnum
CREATE TYPE "HealthierSGAuditDataSensitivity" AS ENUM ('PUBLIC', 'INTERNAL', 'SENSITIVE', 'HIGHLY_SENSITIVE', 'CONFIDENTIAL', 'RESTRICTED', 'MEDICAL', 'PERSONAL_IDENTIFIABLE');

-- CreateEnum
CREATE TYPE "HealthierSGAuditRiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'EMERGENCY', 'MONITORING');

-- CreateEnum
CREATE TYPE "HealthierSGAuditType" AS ENUM ('REGULAR_SCHEDULED', 'COMPLIANCE_AUDIT', 'DATA_QUALITY_AUDIT', 'SECURITY_AUDIT', 'PERFORMANCE_AUDIT', 'FINANCIAL_AUDIT', 'PROGRAM_EFFECTIVENESS', 'INCIDENT_RESPONSE', 'SPOT_CHECK', 'EXTERNAL_AUDIT');

-- CreateEnum
CREATE TYPE "HealthierSGAuditPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'URGENT', 'ROUTINE');

-- CreateEnum
CREATE TYPE "HealthierSGDocumentType" AS ENUM ('IDENTITY_VERIFICATION', 'MEDICAL_RECORDS', 'CONSENT_FORMS', 'ELIGIBILITY_DOCUMENTS', 'BENEFIT_CLAIMS', 'INVOICES_RECEIPTS', 'INSURANCE_DOCUMENTS', 'REFERRAL_LETTERS', 'DISCHARGE_SUMMARIES', 'LAB_RESULTS', 'IMAGING_REPORTS', 'PRESCRIPTION_RECORDS', 'PROGRAM_CERTIFICATES', 'AUDIT_REPORTS', 'COMPLIANCE_DOCUMENTS');

-- CreateEnum
CREATE TYPE "HealthierSGDocumentVerificationStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'EXPIRED', 'REQUIRES_RENEWAL', 'CONDITIONALLY_APPROVED');

-- CreateEnum
CREATE TYPE "HealthierSGDocumentAccessLevel" AS ENUM ('PUBLIC', 'RESTRICTED', 'CONFIDENTIAL', 'HIGHLY_CONFIDENTIAL', 'MEDICAL_RECORD', 'AUDIT_ONLY', 'GOVERNMENT_ONLY', 'TIME_LIMITED');

-- CreateTable
CREATE TABLE "healthier_sg_programs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "category" "HealthierSGCategory" NOT NULL,
    "eligibilityCriteria" JSONB NOT NULL DEFAULT '{}',
    "benefits" JSONB NOT NULL DEFAULT '[]',
    "requirements" JSONB NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isMandatory" BOOLEAN NOT NULL DEFAULT false,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "launchDate" TIMESTAMP(3),
    "programCode" TEXT NOT NULL,
    "mohProgramId" TEXT,
    "governmentUrl" TEXT,
    "legislationReference" TEXT,
    "participationTargets" JSONB NOT NULL DEFAULT '{}',
    "successMetrics" JSONB NOT NULL DEFAULT '[]',
    "reportingFrequency" "HealthierSGReportingFrequency" NOT NULL DEFAULT 'MONTHLY',
    "responsibleMinistry" TEXT,
    "programManager" TEXT,
    "budgetAllocation" DOUBLE PRECISION,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "healthier_sg_programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_enrollments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "clinicId" TEXT,
    "doctorId" TEXT,
    "enrollmentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "enrollmentMethod" "HealthierSGEnrollmentMethod" NOT NULL,
    "enrollmentSource" TEXT NOT NULL,
    "enrollmentChannel" TEXT NOT NULL,
    "status" "HealthierSGEnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveTo" TIMESTAMP(3),
    "suspensionReason" TEXT,
    "suspensionDate" TIMESTAMP(3),
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "verificationNotes" TEXT,
    "consentGiven" BOOLEAN NOT NULL DEFAULT false,
    "consentDate" TIMESTAMP(3),
    "dataSharingConsent" BOOLEAN NOT NULL DEFAULT false,
    "termsAccepted" BOOLEAN NOT NULL DEFAULT false,
    "nricVerified" BOOLEAN NOT NULL DEFAULT false,
    "addressVerified" BOOLEAN NOT NULL DEFAULT false,
    "contactVerified" BOOLEAN NOT NULL DEFAULT false,
    "identityVerified" BOOLEAN NOT NULL DEFAULT false,
    "enrollmentData" JSONB NOT NULL DEFAULT '{}',
    "specialNeeds" JSONB NOT NULL DEFAULT '{}',
    "languagePreference" TEXT NOT NULL DEFAULT 'en',
    "lastActivityDate" TIMESTAMP(3),
    "completionStatus" JSONB NOT NULL DEFAULT '{}',
    "preferredCommunication" TEXT[] NOT NULL,
    "reminderPreferences" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "program_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_eligibility_rules" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "ruleName" TEXT NOT NULL,
    "ruleType" "HealthierSGEligibilityRuleType" NOT NULL,
    "ruleLogic" JSONB NOT NULL DEFAULT '{}',
    "conditions" JSONB NOT NULL DEFAULT '[]',
    "evaluationOrder" INTEGER NOT NULL DEFAULT 1,
    "demographicRules" JSONB NOT NULL DEFAULT '[]',
    "medicalRules" JSONB NOT NULL DEFAULT '[]',
    "geographicRules" JSONB NOT NULL DEFAULT '[]',
    "socioeconomicRules" JSONB NOT NULL DEFAULT '[]',
    "behavioralRules" JSONB NOT NULL DEFAULT '[]',
    "isDynamic" BOOLEAN NOT NULL DEFAULT false,
    "recalculationFrequency" "HealthierSGRecalculationFrequency" NOT NULL DEFAULT 'MONTHLY',
    "lastEvaluated" TIMESTAMP(3),
    "nextEvaluation" TIMESTAMP(3),
    "ruleDescription" TEXT,
    "examples" JSONB NOT NULL DEFAULT '[]',
    "exceptions" JSONB NOT NULL DEFAULT '[]',
    "mohRequired" BOOLEAN NOT NULL DEFAULT false,
    "legislativeBasis" TEXT,
    "reviewDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "successRate" DOUBLE PRECISION,
    "falsePositiveRate" DOUBLE PRECISION,
    "falseNegativeRate" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "program_eligibility_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eligibility_evaluations" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "evaluationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "evaluationType" "HealthierSGEvaluationType" NOT NULL DEFAULT 'INITIAL',
    "result" "HealthierSGEvaluationResult" NOT NULL,
    "score" DOUBLE PRECISION,
    "reason" TEXT,
    "evaluatedData" JSONB NOT NULL DEFAULT '{}',
    "sourceSystems" TEXT[] NOT NULL,
    "validationRequired" BOOLEAN NOT NULL DEFAULT false,
    "validatedBy" TEXT,
    "validationDate" TIMESTAMP(3),
    "validationNotes" TEXT,
    "canBeAppealed" BOOLEAN NOT NULL DEFAULT true,
    "appealDeadline" TIMESTAMP(3),
    "appealStatus" TEXT,
    "isAutomated" BOOLEAN NOT NULL DEFAULT true,
    "automationConfidence" DOUBLE PRECISION,
    "requiresReview" BOOLEAN NOT NULL DEFAULT false,
    "decisionFactors" JSONB NOT NULL DEFAULT '[]',
    "alternativeOutcomes" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eligibility_evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_benefits" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "benefitName" TEXT NOT NULL,
    "benefitType" "HealthierSGBenefitType" NOT NULL,
    "description" TEXT,
    "benefitValue" DOUBLE PRECISION,
    "benefitUnit" TEXT,
    "maxBenefitAmount" DOUBLE PRECISION,
    "maxBenefitFrequency" INTEGER,
    "qualificationCriteria" JSONB NOT NULL DEFAULT '[]',
    "waitingPeriod" INTEGER,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "isStackable" BOOLEAN NOT NULL DEFAULT false,
    "isTransferable" BOOLEAN NOT NULL DEFAULT false,
    "expirationPeriod" INTEGER,
    "paymentMechanism" "HealthierSGBenefitPaymentMechanism" NOT NULL,
    "serviceCategories" TEXT[] NOT NULL,
    "mohServiceCodes" TEXT[] NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveTo" TIMESTAMP(3),
    "lastClaimDate" TIMESTAMP(3),
    "governmentFunded" BOOLEAN NOT NULL DEFAULT true,
    "reportingRequired" BOOLEAN NOT NULL DEFAULT true,
    "auditTrail" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "program_benefits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrolled_benefits" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "benefitId" TEXT NOT NULL,
    "enrollmentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activationDate" TIMESTAMP(3),
    "qualificationDate" TIMESTAMP(3),
    "status" "HealthierSGBenefitStatus" NOT NULL DEFAULT 'ACTIVE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "suspensionReason" TEXT,
    "suspensionDate" TIMESTAMP(3),
    "totalClaimsMade" INTEGER NOT NULL DEFAULT 0,
    "totalAmountClaimed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "remainingBalance" DOUBLE PRECISION,
    "nextClaimDate" TIMESTAMP(3),
    "claimFrequency" TEXT,
    "customizedTerms" JSONB NOT NULL DEFAULT '{}',
    "specialConditions" JSONB NOT NULL DEFAULT '[]',
    "notificationPreferences" JSONB NOT NULL DEFAULT '{}',
    "lastNotificationDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enrolled_benefits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "benefit_claims" (
    "id" TEXT NOT NULL,
    "enrolledBenefitId" TEXT NOT NULL,
    "claimNumber" TEXT NOT NULL,
    "claimDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "serviceDate" TIMESTAMP(3) NOT NULL,
    "claimAmount" DOUBLE PRECISION NOT NULL,
    "approvedAmount" DOUBLE PRECISION,
    "serviceId" TEXT,
    "clinicId" TEXT,
    "doctorId" TEXT,
    "serviceDescription" TEXT,
    "claimDocuments" JSONB NOT NULL DEFAULT '[]',
    "supportingFiles" TEXT[] NOT NULL,
    "status" "HealthierSGClaimStatus" NOT NULL DEFAULT 'PENDING',
    "submissionMethod" "HealthierSGClaimSubmissionMethod" NOT NULL,
    "processingNotes" TEXT,
    "submittedBy" TEXT,
    "reviewedBy" TEXT,
    "approvedBy" TEXT,
    "rejectionReason" TEXT,
    "reviewDate" TIMESTAMP(3),
    "approvalDate" TIMESTAMP(3),
    "paymentDate" TIMESTAMP(3),
    "paymentReference" TEXT,
    "paymentMethod" TEXT,
    "auditRequired" BOOLEAN NOT NULL DEFAULT false,
    "auditNotes" TEXT,
    "complianceFlags" TEXT[] NOT NULL,
    "canBeAppealed" BOOLEAN NOT NULL DEFAULT true,
    "appealDeadline" TIMESTAMP(3),
    "appealStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "benefit_claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinic_participation" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "participationType" "HealthierSGClinicParticipationType" NOT NULL,
    "participationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveTo" TIMESTAMP(3),
    "status" "HealthierSGClinicStatus" NOT NULL DEFAULT 'PENDING',
    "accreditationLevel" "HealthierSGClinicAccreditation",
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "verificationNotes" TEXT,
    "serviceScope" JSONB NOT NULL DEFAULT '[]',
    "patientCapacity" INTEGER,
    "geographicCoverage" TEXT[] NOT NULL,
    "complianceStandards" JSONB NOT NULL DEFAULT '[]',
    "reportingRequirements" JSONB NOT NULL DEFAULT '[]',
    "qualityMetrics" JSONB NOT NULL DEFAULT '[]',
    "staffTrainingRequired" BOOLEAN NOT NULL DEFAULT true,
    "trainingCompletedDate" TIMESTAMP(3),
    "certificationExpiry" TIMESTAMP(3),
    "lastTrainingUpdate" TIMESTAMP(3),
    "performanceScore" DOUBLE PRECISION,
    "patientSatisfaction" DOUBLE PRECISION,
    "complianceScore" DOUBLE PRECISION,
    "reimbursementRate" DOUBLE PRECISION,
    "additionalFunding" DOUBLE PRECISION,
    "costSharing" JSONB NOT NULL DEFAULT '{}',
    "supportResources" JSONB NOT NULL DEFAULT '[]',
    "technicalSupport" BOOLEAN NOT NULL DEFAULT false,
    "onboardingSupport" BOOLEAN NOT NULL DEFAULT false,
    "reportingFrequency" "HealthierSGReportingFrequency" NOT NULL DEFAULT 'MONTHLY',
    "lastReportDate" TIMESTAMP(3),
    "nextReportDue" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinic_participation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinic_performance_metrics" (
    "id" TEXT NOT NULL,
    "clinicParticipationId" TEXT NOT NULL,
    "metricPeriod" "HealthierSGMetricPeriod" NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "patientCount" INTEGER NOT NULL DEFAULT 0,
    "enrollmentCount" INTEGER NOT NULL DEFAULT 0,
    "completionRate" DOUBLE PRECISION,
    "satisfactionScore" DOUBLE PRECISION,
    "qualityScore" DOUBLE PRECISION,
    "safetyIncidents" INTEGER NOT NULL DEFAULT 0,
    "complianceScore" DOUBLE PRECISION,
    "totalClaims" INTEGER NOT NULL DEFAULT 0,
    "approvedClaims" INTEGER NOT NULL DEFAULT 0,
    "reimbursementAmount" DOUBLE PRECISION,
    "averageWaitTime" DOUBLE PRECISION,
    "appointmentUtilization" DOUBLE PRECISION,
    "staffProductivity" DOUBLE PRECISION,
    "healthOutcomes" JSONB NOT NULL DEFAULT '[]',
    "costEffectiveness" DOUBLE PRECISION,
    "preventiveCare" INTEGER NOT NULL DEFAULT 0,
    "benchmarkComparison" JSONB NOT NULL DEFAULT '{}',
    "peerRanking" INTEGER,
    "trendDirection" TEXT,
    "isReported" BOOLEAN NOT NULL DEFAULT false,
    "reportedAt" TIMESTAMP(3),
    "reportNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinic_performance_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "height" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "bloodPressureSystolic" INTEGER,
    "bloodPressureDiastolic" INTEGER,
    "heartRate" INTEGER,
    "temperature" DOUBLE PRECISION,
    "chronicConditions" TEXT[] NOT NULL,
    "currentMedications" TEXT[] NOT NULL,
    "allergies" TEXT[] NOT NULL,
    "familyHistory" TEXT[] NOT NULL,
    "smokingStatus" "HealthierSGSmokingStatus",
    "alcoholConsumption" TEXT,
    "exerciseFrequency" "HealthierSGExerciseFrequency",
    "dietType" TEXT,
    "mentalHealthConditions" TEXT[] NOT NULL,
    "stressLevel" "HealthierSGStressLevel",
    "sleepHours" DOUBLE PRECISION,
    "cancerScreenings" JSONB NOT NULL DEFAULT '{}',
    "diabetesScreening" JSONB NOT NULL DEFAULT '{}',
    "cardiovascularScreening" JSONB NOT NULL DEFAULT '{}',
    "cardiovascularRisk" JSONB NOT NULL DEFAULT '{}',
    "diabetesRisk" JSONB NOT NULL DEFAULT '{}',
    "cancerRisk" JSONB NOT NULL DEFAULT '{}',
    "programEligibilityScores" JSONB NOT NULL DEFAULT '{}',
    "riskFactors" JSONB NOT NULL DEFAULT '[]',
    "protectiveFactors" JSONB NOT NULL DEFAULT '[]',
    "primaryHealthGoal" TEXT,
    "healthGoals" JSONB NOT NULL DEFAULT '[]',
    "targetMetrics" JSONB NOT NULL DEFAULT '{}',
    "dataCompleteness" DOUBLE PRECISION,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "sharingPreferences" JSONB NOT NULL DEFAULT '{}',
    "consentForResearch" BOOLEAN NOT NULL DEFAULT false,
    "dataRetentionPeriod" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "health_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_assessments" (
    "id" TEXT NOT NULL,
    "healthProfileId" TEXT NOT NULL,
    "assessmentType" "HealthierSGAssessmentType" NOT NULL,
    "assessmentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assessmentTool" TEXT NOT NULL,
    "score" DOUBLE PRECISION,
    "result" TEXT,
    "responses" JSONB NOT NULL DEFAULT '{}',
    "clinicalData" JSONB NOT NULL DEFAULT '{}',
    "observations" TEXT,
    "riskLevel" "HealthierSGRiskLevel",
    "riskFactors" JSONB NOT NULL DEFAULT '[]',
    "recommendations" JSONB NOT NULL DEFAULT '[]',
    "followUpRequired" BOOLEAN NOT NULL DEFAULT false,
    "followUpDate" TIMESTAMP(3),
    "followUpNotes" TEXT,
    "programRecommendations" JSONB NOT NULL DEFAULT '[]',
    "eligibilityImpact" JSONB NOT NULL DEFAULT '[]',
    "validatedBy" TEXT,
    "validationDate" TIMESTAMP(3),
    "qualityScore" DOUBLE PRECISION,
    "completedBy" TEXT,
    "completionMethod" TEXT,
    "timeSpentMinutes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "health_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_activities" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "activityType" "HealthierSGActivityType" NOT NULL,
    "activityName" TEXT NOT NULL,
    "description" TEXT,
    "scheduledDate" TIMESTAMP(3),
    "completedDate" TIMESTAMP(3),
    "activityData" JSONB NOT NULL DEFAULT '{}',
    "results" JSONB NOT NULL DEFAULT '{}',
    "metrics" JSONB NOT NULL DEFAULT '{}',
    "status" "HealthierSGActivityStatus" NOT NULL DEFAULT 'PENDING',
    "progress" DOUBLE PRECISION,
    "serviceId" TEXT,
    "clinicId" TEXT,
    "doctorId" TEXT,
    "appointmentId" TEXT,
    "documents" TEXT[] NOT NULL,
    "notes" TEXT,
    "qualityScore" DOUBLE PRECISION,
    "outcomeScore" DOUBLE PRECISION,
    "patientFeedback" TEXT,
    "complianceStatus" TEXT,
    "complianceNotes" TEXT,
    "benefitImpact" JSONB NOT NULL DEFAULT '{}',
    "programProgress" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "program_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_milestones" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "milestoneType" "HealthierSGMilestoneType" NOT NULL,
    "milestoneName" TEXT NOT NULL,
    "description" TEXT,
    "targetDate" TIMESTAMP(3),
    "achievedDate" TIMESTAMP(3),
    "isAchieved" BOOLEAN NOT NULL DEFAULT false,
    "achievementScore" DOUBLE PRECISION,
    "completionLevel" DOUBLE PRECISION,
    "requirements" JSONB NOT NULL DEFAULT '[]',
    "criteria" JSONB NOT NULL DEFAULT '{}',
    "unlockBenefits" JSONB NOT NULL DEFAULT '[]',
    "rewardType" TEXT,
    "rewardValue" DOUBLE PRECISION,
    "progressData" JSONB NOT NULL DEFAULT '{}',
    "timeSpent" INTEGER,
    "effortLevel" TEXT,
    "verificationRequired" BOOLEAN NOT NULL DEFAULT true,
    "verifiedBy" TEXT,
    "verificationDate" TIMESTAMP(3),
    "verificationNotes" TEXT,
    "healthImpact" JSONB NOT NULL DEFAULT '{}',
    "programImpact" JSONB NOT NULL DEFAULT '{}',
    "futureRelevance" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "program_milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_outcomes" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "outcomeType" "HealthierSGOutcomeType" NOT NULL,
    "outcomeName" TEXT NOT NULL,
    "description" TEXT,
    "measurementMethod" TEXT,
    "targetValue" DOUBLE PRECISION,
    "achievedValue" DOUBLE PRECISION,
    "improvement" DOUBLE PRECISION,
    "baselineDate" TIMESTAMP(3),
    "measurementDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "followUpDate" TIMESTAMP(3),
    "isIndividual" BOOLEAN NOT NULL DEFAULT true,
    "populationSegment" TEXT,
    "sampleSize" INTEGER,
    "reliabilityScore" DOUBLE PRECISION,
    "dataQuality" DOUBLE PRECISION,
    "confidenceInterval" JSONB NOT NULL DEFAULT '{}',
    "statisticalSignificance" DOUBLE PRECISION,
    "effectSize" DOUBLE PRECISION,
    "confidenceLevel" DOUBLE PRECISION,
    "costPerOutcome" DOUBLE PRECISION,
    "costEffectivenessRatio" DOUBLE PRECISION,
    "roi" DOUBLE PRECISION,
    "qualitativeData" JSONB NOT NULL DEFAULT '{}',
    "patientExperience" JSONB NOT NULL DEFAULT '{}',
    "stakeholderFeedback" JSONB NOT NULL DEFAULT '[]',
    "keyLearnings" JSONB NOT NULL DEFAULT '[]',
    "improvementSuggestions" JSONB NOT NULL DEFAULT '[]',
    "scalabilityAssessment" JSONB NOT NULL DEFAULT '{}',
    "reportToGovernment" BOOLEAN NOT NULL DEFAULT true,
    "reportData" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "program_outcomes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_goals" (
    "id" TEXT NOT NULL,
    "healthProfileId" TEXT NOT NULL,
    "goalType" "HealthierSGGoalType" NOT NULL,
    "goalName" TEXT NOT NULL,
    "description" TEXT,
    "targetValue" DOUBLE PRECISION,
    "currentValue" DOUBLE PRECISION,
    "baselineValue" DOUBLE PRECISION,
    "smartCriteria" JSONB NOT NULL DEFAULT '{}',
    "goalCategory" TEXT,
    "priority" "HealthierSGGoalPriority" NOT NULL DEFAULT 'MEDIUM',
    "targetDate" TIMESTAMP(3) NOT NULL,
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewDate" TIMESTAMP(3),
    "completionDate" TIMESTAMP(3),
    "progress" DOUBLE PRECISION,
    "milestones" JSONB NOT NULL DEFAULT '[]',
    "progressNotes" TEXT,
    "strategies" JSONB NOT NULL DEFAULT '[]',
    "supportResources" JSONB NOT NULL DEFAULT '[]',
    "barriers" JSONB NOT NULL DEFAULT '[]',
    "solutions" JSONB NOT NULL DEFAULT '[]',
    "accountability" TEXT,
    "trackingFrequency" TEXT,
    "lastTrackingDate" TIMESTAMP(3),
    "trackingMethod" TEXT,
    "programLinks" JSONB NOT NULL DEFAULT '[]',
    "benefitImpact" JSONB NOT NULL DEFAULT '{}',
    "enrollmentEligibility" JSONB NOT NULL DEFAULT '[]',
    "successCriteria" JSONB NOT NULL DEFAULT '[]',
    "successMeasures" JSONB NOT NULL DEFAULT '[]',
    "sustainabilityPlan" JSONB NOT NULL DEFAULT '{}',
    "status" "HealthierSGGoalStatus" NOT NULL DEFAULT 'ACTIVE',
    "statusNotes" TEXT,
    "reviewNotes" TEXT,
    "nextReviewDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "health_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_activities" (
    "id" TEXT NOT NULL,
    "healthProfileId" TEXT NOT NULL,
    "activityType" "HealthierSGActivityType" NOT NULL,
    "activityName" TEXT NOT NULL,
    "description" TEXT,
    "activityDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" INTEGER,
    "activityValue" DOUBLE PRECISION,
    "activityMetrics" JSONB NOT NULL DEFAULT '{}',
    "healthImpact" JSONB NOT NULL DEFAULT '{}',
    "goalContribution" JSONB NOT NULL DEFAULT '{}',
    "programProgress" JSONB NOT NULL DEFAULT '{}',
    "location" TEXT,
    "circumstances" TEXT,
    "environmentalFactors" JSONB NOT NULL DEFAULT '{}',
    "motivationLevel" "HealthierSGMotivationLevel",
    "difficultyLevel" "HealthierSGDifficultyLevel",
    "satisfaction" "HealthierSGSatisfactionLevel",
    "barriers" JSONB NOT NULL DEFAULT '[]',
    "facilitators" JSONB NOT NULL DEFAULT '[]',
    "supportReceived" JSONB NOT NULL DEFAULT '{}',
    "carePlanAlignment" JSONB NOT NULL DEFAULT '[]',
    "providerInvolvement" TEXT,
    "verifiedBy" TEXT,
    "verificationMethod" TEXT,
    "dataSource" TEXT,
    "followUpRequired" BOOLEAN NOT NULL DEFAULT false,
    "followUpNotes" TEXT,
    "nextActivity" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "health_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "healthier_sg_audit_logs" (
    "id" TEXT NOT NULL,
    "programId" TEXT,
    "enrollmentId" TEXT,
    "action" "HealthierSGAuditAction" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "changes" JSONB NOT NULL DEFAULT '{}',
    "performedBy" TEXT,
    "performedByRole" TEXT,
    "sessionId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataSensitivity" "HealthierSGAuditDataSensitivity" NOT NULL DEFAULT 'STANDARD',
    "accessReason" TEXT,
    "gdprRelevant" BOOLEAN NOT NULL DEFAULT false,
    "pdpaRelevant" BOOLEAN NOT NULL DEFAULT false,
    "mohCompliance" BOOLEAN NOT NULL DEFAULT false,
    "previousValues" JSONB NOT NULL DEFAULT '{}',
    "newValues" JSONB NOT NULL DEFAULT '{}',
    "validationStatus" TEXT,
    "reportToGovernment" BOOLEAN NOT NULL DEFAULT false,
    "governmentReportId" TEXT,
    "reportingDeadline" TIMESTAMP(3),
    "riskLevel" "HealthierSGAuditRiskLevel" NOT NULL DEFAULT 'LOW',
    "flags" TEXT[] NOT NULL,
    "alerts" JSONB NOT NULL DEFAULT '[]',
    "resolutionStatus" TEXT,
    "resolutionNotes" TEXT,
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "healthier_sg_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinic_audits" (
    "id" TEXT NOT NULL,
    "clinicParticipationId" TEXT NOT NULL,
    "auditType" "HealthierSGAuditType" NOT NULL,
    "auditPeriod" TEXT NOT NULL,
    "auditDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "auditorName" TEXT,
    "auditorOrganization" TEXT,
    "auditScope" JSONB NOT NULL DEFAULT '[]',
    "complianceStandards" JSONB NOT NULL DEFAULT '[]',
    "overallScore" DOUBLE PRECISION,
    "criticalFindings" INTEGER NOT NULL DEFAULT 0,
    "majorFindings" INTEGER NOT NULL DEFAULT 0,
    "minorFindings" INTEGER NOT NULL DEFAULT 0,
    "detailedFindings" JSONB NOT NULL DEFAULT '[]',
    "recommendations" JSONB NOT NULL DEFAULT '[]',
    "bestPractices" JSONB NOT NULL DEFAULT '[]',
    "patientSafety" DOUBLE PRECISION,
    "dataQuality" DOUBLE PRECISION,
    "programCompliance" DOUBLE PRECISION,
    "actionItems" JSONB NOT NULL DEFAULT '[]',
    "dueDate" TIMESTAMP(3),
    "priority" "HealthierSGAuditPriority" NOT NULL DEFAULT 'MEDIUM',
    "followUpRequired" BOOLEAN NOT NULL DEFAULT false,
    "followUpDate" TIMESTAMP(3),
    "resolutionStatus" TEXT,
    "certificationStatus" TEXT,
    "accreditationLevel" TEXT,
    "complianceCertificate" TEXT,
    "auditReport" TEXT,
    "supportingDocuments" TEXT[] NOT NULL,
    "evidenceFiles" TEXT[] NOT NULL,
    "reportToGovernment" BOOLEAN NOT NULL DEFAULT true,
    "governmentReference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinic_audits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrollment_documents" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "documentType" "HealthierSGDocumentType" NOT NULL,
    "documentName" TEXT NOT NULL,
    "description" TEXT,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileHash" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedBy" TEXT,
    "verificationStatus" "HealthierSGDocumentVerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "expiryDate" TIMESTAMP(3),
    "renewalRequired" BOOLEAN NOT NULL DEFAULT false,
    "lastRenewalDate" TIMESTAMP(3),
    "nextRenewalDate" TIMESTAMP(3),
    "complianceRequired" BOOLEAN NOT NULL DEFAULT true,
    "digitalSignature" BOOLEAN NOT NULL DEFAULT false,
    "digitalSignatureValid" BOOLEAN,
    "accessLevel" "HealthierSGDocumentAccessLevel" NOT NULL DEFAULT 'RESTRICTED',
    "sharedWith" TEXT[] NOT NULL,
    "tags" TEXT[] NOT NULL,
    "classification" TEXT,
    "retentionPeriod" INTEGER,
    "version" INTEGER NOT NULL DEFAULT 1,
    "previousVersionId" TEXT,
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,
    "auditLog" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enrollment_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "healthier_sg_programs_program_code_key" ON "healthier_sg_programs"("programCode");

-- CreateIndex
CREATE INDEX "healthier_sg_programs_category_idx" ON "healthier_sg_programs"("category");

-- CreateIndex
CREATE INDEX "healthier_sg_programs_is_active_idx" ON "healthier_sg_programs"("isActive");

-- CreateIndex
CREATE INDEX "program_enrollments_user_id_program_id_idx" ON "program_enrollments"("userId", "programId");

-- CreateIndex
CREATE INDEX "program_enrollments_status_idx" ON "program_enrollments"("status");

-- CreateIndex
CREATE INDEX "program_enrollments_enrollment_date_idx" ON "program_enrollments"("enrollmentDate");

-- CreateIndex
CREATE INDEX "program_enrollments_clinic_id_idx" ON "program_enrollments"("clinicId");

-- CreateIndex
CREATE INDEX "program_enrollments_doctor_id_idx" ON "program_enrollments"("doctorId");

-- CreateIndex
CREATE UNIQUE INDEX "program_enrollments_user_id_program_id_key" ON "program_enrollments"("userId", "programId");

-- CreateIndex
CREATE INDEX "program_eligibility_rules_program_id_idx" ON "program_eligibility_rules"("programId");

-- CreateIndex
CREATE INDEX "program_eligibility_rules_rule_type_idx" ON "program_eligibility_rules"("ruleType");

-- CreateIndex
CREATE INDEX "program_eligibility_rules_is_active_idx" ON "program_eligibility_rules"("isActive");

-- CreateIndex
CREATE INDEX "eligibility_evaluations_enrollment_id_idx" ON "eligibility_evaluations"("enrollmentId");

-- CreateIndex
CREATE INDEX "eligibility_evaluations_rule_id_idx" ON "eligibility_evaluations"("ruleId");

-- CreateIndex
CREATE INDEX "eligibility_evaluations_evaluation_date_idx" ON "eligibility_evaluations"("evaluationDate");

-- CreateIndex
CREATE INDEX "program_benefits_program_id_idx" ON "program_benefits"("programId");

-- CreateIndex
CREATE INDEX "program_benefits_benefit_type_idx" ON "program_benefits"("benefitType");

-- CreateIndex
CREATE INDEX "program_benefits_is_active_idx" ON "program_benefits"("isActive");

-- CreateIndex
CREATE INDEX "enrolled_benefits_enrollment_id_benefit_id_idx" ON "enrolled_benefits"("enrollmentId", "benefitId");

-- CreateIndex
CREATE INDEX "enrolled_benefits_status_idx" ON "enrolled_benefits"("status");

-- CreateIndex
CREATE UNIQUE INDEX "enrolled_benefits_enrollment_id_benefit_id_key" ON "enrolled_benefits"("enrollmentId", "benefitId");

-- CreateIndex
CREATE INDEX "benefit_claims_enrolled_benefit_id_idx" ON "benefit_claims"("enrolledBenefitId");

-- CreateIndex
CREATE INDEX "benefit_claims_claim_date_idx" ON "benefit_claims"("claimDate");

-- CreateIndex
CREATE INDEX "benefit_claims_status_idx" ON "benefit_claims"("status");

-- CreateIndex
CREATE UNIQUE INDEX "benefit_claims_claim_number_key" ON "benefit_claims"("claimNumber");

-- CreateIndex
CREATE INDEX "clinic_participation_clinic_id_program_id_idx" ON "clinic_participation"("clinicId", "programId");

-- CreateIndex
CREATE INDEX "clinic_participation_status_idx" ON "clinic_participation"("status");

-- CreateIndex
CREATE INDEX "clinic_participation_participation_date_idx" ON "clinic_participation"("participationDate");

-- CreateIndex
CREATE UNIQUE INDEX "clinic_participation_clinic_id_program_id_key" ON "clinic_participation"("clinicId", "programId");

-- CreateIndex
CREATE INDEX "clinic_performance_metrics_clinic_participation_id_idx" ON "clinic_performance_metrics"("clinicParticipationId");

-- CreateIndex
CREATE INDEX "clinic_performance_metrics_period_start_period_end_idx" ON "clinic_performance_metrics"("periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "health_profiles_user_id_idx" ON "health_profiles"("userId");

-- CreateIndex
CREATE INDEX "health_assessments_health_profile_id_idx" ON "health_assessments"("healthProfileId");

-- CreateIndex
CREATE INDEX "health_assessments_assessment_type_idx" ON "health_assessments"("assessmentType");

-- CreateIndex
CREATE INDEX "health_assessments_assessment_date_idx" ON "health_assessments"("assessmentDate");

-- CreateIndex
CREATE INDEX "program_activities_enrollment_id_idx" ON "program_activities"("enrollmentId");

-- CreateIndex
CREATE INDEX "program_activities_activity_type_idx" ON "program_activities"("activityType");

-- CreateIndex
CREATE INDEX "program_activities_status_idx" ON "program_activities"("status");

-- CreateIndex
CREATE INDEX "program_milestones_enrollment_id_idx" ON "program_milestones"("enrollmentId");

-- CreateIndex
CREATE INDEX "program_milestones_milestone_type_idx" ON "program_milestones"("milestoneType");

-- CreateIndex
CREATE INDEX "program_milestones_is_achieved_idx" ON "program_milestones"("isAchieved");

-- CreateIndex
CREATE INDEX "program_outcomes_program_id_idx" ON "program_outcomes"("programId");

-- CreateIndex
CREATE INDEX "program_outcomes_outcome_type_idx" ON "program_outcomes"("outcomeType");

-- CreateIndex
CREATE INDEX "program_outcomes_measurement_date_idx" ON "program_outcomes"("measurementDate");

-- CreateIndex
CREATE INDEX "health_goals_health_profile_id_idx" ON "health_goals"("healthProfileId");

-- CreateIndex
CREATE INDEX "health_goals_goal_type_idx" ON "health_goals"("goalType");

-- CreateIndex
CREATE INDEX "health_goals_status_idx" ON "health_goals"("status");

-- CreateIndex
CREATE INDEX "health_activities_health_profile_id_idx" ON "health_activities"("healthProfileId");

-- CreateIndex
CREATE INDEX "health_activities_activity_type_idx" ON "health_activities"("activityType");

-- CreateIndex
CREATE INDEX "health_activities_activity_date_idx" ON "health_activities"("activityDate");

-- CreateIndex
CREATE INDEX "healthier_sg_audit_logs_program_id_idx" ON "healthier_sg_audit_logs"("programId");

-- CreateIndex
CREATE INDEX "healthier_sg_audit_logs_enrollment_id_idx" ON "healthier_sg_audit_logs"("enrollmentId");

-- CreateIndex
CREATE INDEX "healthier_sg_audit_logs_action_idx" ON "healthier_sg_audit_logs"("action");

-- CreateIndex
CREATE INDEX "healthier_sg_audit_logs_timestamp_idx" ON "healthier_sg_audit_logs"("timestamp");

-- CreateIndex
CREATE INDEX "clinic_audits_clinic_participation_id_idx" ON "clinic_audits"("clinicParticipationId");

-- CreateIndex
CREATE INDEX "clinic_audits_audit_type_idx" ON "clinic_audits"("auditType");

-- CreateIndex
CREATE INDEX "clinic_audits_audit_date_idx" ON "clinic_audits"("auditDate");

-- CreateIndex
CREATE INDEX "enrollment_documents_enrollment_id_idx" ON "enrollment_documents"("enrollmentId");

-- CreateIndex
CREATE INDEX "enrollment_documents_document_type_idx" ON "enrollment_documents"("documentType");

-- CreateIndex
CREATE INDEX "enrollment_documents_verification_status_idx" ON "enrollment_documents"("verificationStatus");

-- CreateIndex
CREATE UNIQUE INDEX "enrollment_documents_enrollment_id_document_type_key" ON "enrollment_documents"("enrollmentId", "documentType");

-- AddForeignKey
ALTER TABLE "program_enrollments" ADD CONSTRAINT "program_enrollments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_enrollments" ADD CONSTRAINT "program_enrollments_programId_fkey" FOREIGN KEY ("programId") REFERENCES "healthier_sg_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_enrollments" ADD CONSTRAINT "program_enrollments_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_enrollments" ADD CONSTRAINT "program_enrollments_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_eligibility_rules" ADD CONSTRAINT "program_eligibility_rules_programId_fkey" FOREIGN KEY ("programId") REFERENCES "healthier_sg_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eligibility_evaluations" ADD CONSTRAINT "eligibility_evaluations_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "program_enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eligibility_evaluations" ADD CONSTRAINT "eligibility_evaluations_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "program_eligibility_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_benefits" ADD CONSTRAINT "program_benefits_programId_fkey" FOREIGN KEY ("programId") REFERENCES "healthier_sg_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrolled_benefits" ADD CONSTRAINT "enrolled_benefits_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "program_enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrolled_benefits" ADD CONSTRAINT "enrolled_benefits_benefitId_fkey" FOREIGN KEY ("benefitId") REFERENCES "program_benefits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "benefit_claims" ADD CONSTRAINT "benefit_claims_enrolledBenefitId_fkey" FOREIGN KEY ("enrolledBenefitId") REFERENCES "enrolled_benefits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinic_participation" ADD CONSTRAINT "clinic_participation_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinic_participation" ADD CONSTRAINT "clinic_participation_programId_fkey" FOREIGN KEY ("programId") REFERENCES "healthier_sg_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinic_performance_metrics" ADD CONSTRAINT "clinic_performance_metrics_clinicParticipationId_fkey" FOREIGN KEY ("clinicParticipationId") REFERENCES "clinic_participation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_profiles" ADD CONSTRAINT "health_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_assessments" ADD CONSTRAINT "health_assessments_healthProfileId_fkey" FOREIGN KEY ("healthProfileId") REFERENCES "health_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_activities" ADD CONSTRAINT "program_activities_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "program_enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_milestones" ADD CONSTRAINT "program_milestones_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "program_enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_outcomes" ADD CONSTRAINT "program_outcomes_programId_fkey" FOREIGN KEY ("programId") REFERENCES "healthier_sg_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_goals" ADD CONSTRAINT "health_goals_healthProfileId_fkey" FOREIGN KEY ("healthProfileId") REFERENCES "health_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_activities" ADD CONSTRAINT "health_activities_healthProfileId_fkey" FOREIGN KEY ("healthProfileId") REFERENCES "health_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "healthier_sg_audit_logs" ADD CONSTRAINT "healthier_sg_audit_logs_programId_fkey" FOREIGN KEY ("programId") REFERENCES "healthier_sg_programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "healthier_sg_audit_logs" ADD CONSTRAINT "healthier_sg_audit_logs_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "program_enrollments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinic_audits" ADD CONSTRAINT "clinic_audits_clinicParticipationId_fkey" FOREIGN KEY ("clinicParticipationId") REFERENCES "clinic_participation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollment_documents" ADD CONSTRAINT "enrollment_documents_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "program_enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
