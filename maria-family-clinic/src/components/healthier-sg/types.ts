// Healthier SG Eligibility Checker Types

import { z } from 'zod'

// Basic demographic and identity information
export const MyInfoDataSchema = z.object({
  uinFin: z.string(),
  name: z.string(),
  dateOfBirth: z.string(),
  gender: z.enum(['M', 'F']),
  nationality: z.string(),
  residentialStatus: z.enum(['CITIZEN', 'PR', 'FOREIGNER']),
  address: z.object({
    postalCode: z.string(),
    streetName: z.string(),
    blockHouseNumber: z.string(),
    buildingName: z.string().optional(),
  }),
})

export type MyInfoData = z.infer<typeof MyInfoDataSchema>

// Questionnaire question types
export const QuestionTypeSchema = z.enum([
  'DEMOGRAPHIC',
  'HEALTH_STATUS',
  'LIFESTYLE',
  'MEDICAL_HISTORY',
  'INSURANCE',
  'PREFERENCES',
  'COMMITMENT'
])

export type QuestionType = z.infer<typeof QuestionTypeSchema>

// Single question schema
export const QuestionSchema = z.object({
  id: z.string(),
  type: QuestionTypeSchema,
  text: z.string(),
  description: z.string().optional(),
  required: z.boolean().default(false),
  validation: z.object({
    minAge: z.number().optional(),
    maxAge: z.number().optional(),
  }).optional(),
  options: z.array(z.object({
    value: z.string(),
    label: z.string(),
    eligible: z.boolean().optional(),
    weight: z.number().default(0),
  })).optional(),
  inputType: z.enum(['text', 'number', 'select', 'multiselect', 'boolean', 'date']),
})

export type Question = z.infer<typeof QuestionSchema>

// Questionnaire response
export const QuestionnaireResponseSchema = z.object({
  questionId: z.string(),
  value: z.union([
    z.string(),
    z.number(),
    z.array(z.string()),
    z.boolean(),
    z.date(),
  ]),
  timestamp: z.date(),
})

export type QuestionnaireResponse = z.infer<typeof QuestionnaireResponseSchema>

// Complete questionnaire data
export const EligibilityAssessmentSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  myInfoData: MyInfoDataSchema.optional(),
  responses: z.array(QuestionnaireResponseSchema),
  status: z.enum(['IN_PROGRESS', 'COMPLETED', 'REVIEWED', 'APPROVED', 'REJECTED']),
  eligibilityResult: z.object({
    isEligible: z.boolean(),
    confidence: z.number().min(0).max(1),
    reason: z.string(),
    score: z.number().min(0).max(100),
    criteria: z.array(z.object({
      name: z.string(),
      passed: z.boolean(),
      weight: z.number(),
      description: z.string(),
    })),
  }).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  completedAt: z.date().optional(),
  reviewedAt: z.date().optional(),
  reviewNotes: z.string().optional(),
})

export type EligibilityAssessment = z.infer<typeof EligibilityAssessmentSchema>

// Rule engine types
export const EligibilityRuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.enum(['DEMOGRAPHIC', 'HEALTH', 'LIFESTYLE', 'INSURANCE', 'GEOGRAPHIC']),
  condition: z.object({
    field: z.string(),
    operator: z.enum(['EQUALS', 'NOT_EQUALS', 'GREATER_THAN', 'LESS_THAN', 'IN', 'NOT_IN', 'CONTAINS']),
    value: z.union([z.string(), z.number(), z.array(z.string()), z.array(z.number())]),
  }),
  weight: z.number().default(1),
  isRequired: z.boolean().default(false),
  active: z.boolean().default(true),
  order: z.number(),
})

export type EligibilityRule = z.infer<typeof EligibilityRuleSchema>

export const RuleEvaluationResultSchema = z.object({
  ruleId: z.string(),
  passed: z.boolean(),
  score: z.number(),
  details: z.string(),
  weight: z.number(),
})

export type RuleEvaluationResult = z.infer<typeof RuleEvaluationResultSchema>

// Progressive disclosure criteria
export const ProgressiveDisclosureRuleSchema = z.object({
  triggerQuestionId: z.string(),
  triggerValue: z.union([z.string(), z.boolean(), z.number()]),
  showQuestionIds: z.array(z.string()),
  hideQuestionIds: z.array(z.string()).optional(),
})

export type ProgressiveDisclosureRule = z.infer<typeof ProgressiveDisclosureRuleSchema>

// Appeal process types
export const AppealSchema = z.object({
  id: z.string(),
  assessmentId: z.string(),
  userId: z.string(),
  reason: z.enum([
    'INCORRECT_INFORMATION',
    'MISSING_DOCUMENTATION',
    'EXCEPTIONAL_CIRCUMSTANCES',
    'POLICY_CLARIFICATION',
    'OTHER'
  ]),
  description: z.string(),
  status: z.enum(['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED']),
  submittedAt: z.date(),
  reviewedAt: z.date().optional(),
  reviewNotes: z.string().optional(),
  attachments: z.array(z.string()).optional(),
})

export type Appeal = z.infer<typeof AppealSchema>

// Assessment history and tracking
export const AssessmentHistorySchema = z.object({
  id: z.string(),
  userId: z.string(),
  assessments: z.array(z.string()), // Assessment IDs
  currentAssessmentId: z.string().optional(),
  lastAssessmentAt: z.date().optional(),
  totalAssessments: z.number(),
  eligibleAssessments: z.number(),
  appealsSubmitted: z.number(),
  successfulAppeals: z.number(),
})

export type AssessmentHistory = z.infer<typeof AssessmentHistorySchema>

// Eligibility summary and next steps
export const EligibilitySummarySchema = z.object({
  userId: z.string(),
  currentStatus: z.enum(['NOT_ELIGIBLE', 'ELIGIBLE', 'PENDING_REVIEW', 'APPEAL_SUBMITTED']),
  lastAssessmentDate: z.date(),
  nextReviewDate: z.date().optional(),
  isEligible: z.boolean(),
  eligibilityReason: z.string,
  nextSteps: z.array(z.object({
    title: z.string(),
    description: z.string(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
    deadline: z.date().optional(),
    completed: z.boolean().default(false),
  })),
  contactInfo: z.object({
    supportEmail: z.string(),
    supportPhone: z.string(),
    appealDeadline: z.date().optional(),
  }),
})

export type EligibilitySummary = z.infer<typeof EligibilitySummarySchema>

// Mobile-specific types
export const MobileEligibilityStateSchema = z.object({
  currentStep: z.number(),
  totalSteps: z.number(),
  responses: z.record(z.string, z.any()),
  isValidating: z.boolean(),
  showValidationErrors: z.boolean(),
  hasUnsavedChanges: z.boolean(),
  lastSaved: z.date().optional(),
})

export type MobileEligibilityState = z.infer<typeof MobileEligibilityStateSchema>

// Analytics and tracking
export const EligibilityAnalyticsSchema = z.object({
  userId: z.string(),
  assessmentId: z.string(),
  startTime: z.date(),
  endTime: z.date().optional(),
  totalTimeSpent: z.number().optional(), // in seconds
  questionsAnswered: z.number(),
  questionsSkipped: z.number(),
  validationErrors: z.number(),
  completionRate: z.number(),
  deviceType: z.enum(['DESKTOP', 'MOBILE', 'TABLET']),
  browserInfo: z.string(),
  referrer: z.string().optional(),
})

export type EligibilityAnalytics = z.infer<typeof EligibilityAnalyticsSchema>

// API response types for eligibility checking
export const EligibilityCheckResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    isEligible: z.boolean(),
    confidence: z.number(),
    score: z.number(),
    criteriaResults: z.array(z.object({
      name: z.string(),
      passed: z.boolean(),
      score: z.number(),
      description: z.string(),
      recommendation: z.string().optional(),
    })),
    nextSteps: z.array(z.object({
      title: z.string(),
      description: z.string(),
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
      actionRequired: z.boolean(),
    })),
    appealsAvailable: z.boolean(),
    appealDeadline: z.date().optional(),
  }),
  errors: z.array(z.object({
    field: z.string(),
    message: z.string(),
    code: z.string(),
  })).optional(),
})

export type EligibilityCheckResponse = z.infer<typeof EligibilityCheckResponseSchema>

// Integration with SingPass MyInfo
export const MyInfoAuthConfigSchema = z.object({
  environment: z.enum(['STAGING', 'PRODUCTION']),
  clientId: z.string(),
  redirectUri: z.string(),
  scope: z.array(z.string()),
})

export type MyInfoAuthConfig = z.infer<typeof MyInfoAuthConfigSchema>

export const MyInfoTokenResponseSchema = z.object({
  accessToken: z.string(),
  tokenType: z.string(),
  expiresIn: z.number(),
  scope: z.string(),
})

export type MyInfoTokenResponse = z.infer<typeof MyInfoTokenResponseSchema>

// Real-time evaluation settings
export const EvaluationSettingsSchema = z.object({
  enableRealTimeValidation: z.boolean().default(true),
  enableProgressiveDisclosure: z.boolean().default(true),
  enableAutoSave: z.boolean().default(true),
  autoSaveInterval: z.number().default(30), // seconds
  maxRetries: z.number().default(3),
  timeoutMs: z.number().default(5000),
})

export type EvaluationSettings = z.infer<typeof EvaluationSettingsSchema>

// Default questions for Healthier SG assessment
export const DEFAULT_HEALTHIER_SG_QUESTIONS: Question[] = [
  // Demographic Questions
  {
    id: 'age',
    type: 'DEMOGRAPHIC',
    text: 'What is your age?',
    description: 'Age is a key factor in Healthier SG eligibility',
    required: true,
    inputType: 'number',
    validation: { minAge: 18, maxAge: 120 },
    options: [],
  },
  {
    id: 'citizenshipStatus',
    type: 'DEMOGRAPHIC',
    text: 'What is your citizenship status?',
    description: 'Healthier SG is available to Singapore Citizens and Permanent Residents',
    required: true,
    inputType: 'select',
    options: [
      { value: 'CITIZEN', label: 'Singapore Citizen', eligible: true },
      { value: 'PR', label: 'Permanent Resident', eligible: true },
      { value: 'FOREIGNER', label: 'Foreigner/Work Pass Holder', eligible: false },
    ],
  },
  {
    id: 'postalCode',
    type: 'DEMOGRAPHIC',
    text: 'What is your postal code?',
    description: 'This helps us find participating clinics near you',
    required: true,
    inputType: 'text',
  },

  // Health Status Questions
  {
    id: 'hasChronicConditions',
    type: 'HEALTH_STATUS',
    text: 'Do you have any chronic conditions?',
    description: 'Chronic conditions include diabetes, hypertension, heart disease, etc.',
    required: true,
    inputType: 'boolean',
    options: [
      { value: 'true', label: 'Yes', eligible: true },
      { value: 'false', label: 'No', eligible: false },
    ],
  },
  {
    id: 'chronicConditionsList',
    type: 'HEALTH_STATUS',
    text: 'Which chronic conditions do you have?',
    description: 'Select all that apply',
    required: false,
    inputType: 'multiselect',
    options: [
      { value: 'DIABETES', label: 'Diabetes' },
      { value: 'HYPERTENSION', label: 'High Blood Pressure' },
      { value: 'HEART_DISEASE', label: 'Heart Disease' },
      { value: 'ASTHMA', label: 'Asthma' },
      { value: 'KIDNEY_DISEASE', label: 'Kidney Disease' },
      { value: 'CANCER', label: 'Cancer (in remission)' },
      { value: 'MENTAL_HEALTH', label: 'Mental Health Conditions' },
      { value: 'OTHER', label: 'Other' },
    ],
  },
  {
    id: 'lastMedicalCheckup',
    type: 'HEALTH_STATUS',
    text: 'When was your last comprehensive medical checkup?',
    description: 'This helps assess your current health status',
    required: false,
    inputType: 'select',
    options: [
      { value: 'WITHIN_6_MONTHS', label: 'Within the last 6 months' },
      { value: '6_TO_12_MONTHS', label: '6-12 months ago' },
      { value: '1_TO_2_YEARS', label: '1-2 years ago' },
      { value: 'OVER_2_YEARS', label: 'Over 2 years ago' },
      { value: 'NEVER', label: 'Never had a comprehensive checkup' },
    ],
  },

  // Lifestyle Questions
  {
    id: 'smokingStatus',
    type: 'LIFESTYLE',
    text: 'What is your smoking status?',
    description: 'Smoking history affects your health profile',
    required: true,
    inputType: 'select',
    options: [
      { value: 'NEVER', label: 'Never smoked' },
      { value: 'FORMER', label: 'Former smoker' },
      { value: 'CURRENT', label: 'Current smoker' },
    ],
  },
  {
    id: 'exerciseFrequency',
    type: 'LIFESTYLE',
    text: 'How often do you exercise?',
    description: 'Regular physical activity is important for health',
    required: true,
    inputType: 'select',
    options: [
      { value: 'DAILY', label: 'Daily' },
      { value: 'SEVERAL_TIMES_WEEK', label: 'Several times a week' },
      { value: 'ONCE_WEEK', label: 'Once a week' },
      { value: 'MONTHLY', label: 'Monthly' },
      { value: 'RARELY', label: 'Rarely or never' },
    ],
  },

  // Insurance Questions
  {
    id: 'insuranceType',
    type: 'INSURANCE',
    text: 'What type of health insurance do you have?',
    description: 'This helps us understand your healthcare coverage',
    required: true,
    inputType: 'select',
    options: [
      { value: 'MEDISAVE', label: 'Medisave/Medishield' },
      { value: 'PRIVATE', label: 'Private Insurance' },
      { value: 'EMPLOYER', label: 'Employer Health Benefits' },
      { value: 'NONE', label: 'No health insurance' },
    ],
  },

  // Commitment Questions
  {
    id: 'commitmentLevel',
    type: 'COMMITMENT',
    text: 'How committed are you to improving your health?',
    description: 'Healthier SG requires active participation',
    required: true,
    inputType: 'select',
    options: [
      { value: 'HIGH', label: 'Very committed - ready to make changes' },
      { value: 'MODERATE', label: 'Moderately committed - willing to try' },
      { value: 'LOW', label: 'Not very committed' },
    ],
  },
  {
    id: 'consentToScreening',
    type: 'COMMITMENT',
    text: 'Do you consent to health screening and data collection?',
    description: 'Required for participation in Healthier SG',
    required: true,
    inputType: 'boolean',
    options: [
      { value: 'true', label: 'Yes, I consent', eligible: true },
      { value: 'false', label: 'No, I do not consent', eligible: false },
    ],
  },
]