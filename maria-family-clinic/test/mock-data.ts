/**
 * Mock Data for Healthier SG Eligibility Checker Testing
 * Sub-Phase 8.3 Test Data and Utilities
 */

// Mock Assessment Data
export const mockEligibleAssessment = {
  isEligible: true,
  confidence: 0.85,
  score: 85,
  criteriaResults: [
    {
      name: 'Age Requirement',
      passed: true,
      score: 25,
      description: 'Must be 40 years or older',
      recommendation: 'Meets age requirement'
    },
    {
      name: 'Citizenship Status',
      passed: true,
      score: 30,
      description: 'Must be Singapore Citizen or Permanent Resident',
      recommendation: 'Meets citizenship requirement'
    },
    {
      name: 'Chronic Conditions',
      passed: true,
      score: 20,
      description: 'Having chronic conditions provides priority consideration',
      recommendation: 'Has chronic conditions - eligible for priority'
    },
    {
      name: 'Screening Consent',
      passed: true,
      score: 15,
      description: 'Must consent to health screening and data collection',
      recommendation: 'Consents to screening requirements'
    },
    {
      name: 'Program Commitment',
      passed: true,
      score: 10,
      description: 'Must demonstrate willingness to participate',
      recommendation: 'Shows commitment to program'
    }
  ],
  nextSteps: [
    {
      title: 'Choose a participating clinic',
      description: 'Find a Healthier SG partner clinic near you',
      priority: 'HIGH' as const,
      actionRequired: true
    },
    {
      title: 'Schedule initial consultation',
      description: 'Book your first health screening appointment',
      priority: 'HIGH' as const,
      actionRequired: true
    },
    {
      title: 'Prepare documentation',
      description: 'Gather your IC, medication list, and medical history',
      priority: 'MEDIUM' as const,
      actionRequired: true
    }
  ],
  appealsAvailable: true,
  appealDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
}

export const mockIneligibleAssessment = {
  isEligible: false,
  confidence: 0.65,
  score: 45,
  criteriaResults: [
    {
      name: 'Age Requirement',
      passed: false,
      score: 0,
      description: 'Must be 40 years or older',
      recommendation: 'Must be 40 or older to qualify'
    },
    {
      name: 'Citizenship Status',
      passed: true,
      score: 30,
      description: 'Must be Singapore Citizen or Permanent Resident',
      recommendation: 'Meets citizenship requirement'
    },
    {
      name: 'Chronic Conditions',
      passed: false,
      score: 0,
      description: 'Having chronic conditions provides priority consideration',
      recommendation: 'No chronic conditions reported'
    },
    {
      name: 'Screening Consent',
      passed: true,
      score: 15,
      description: 'Must consent to health screening and data collection',
      recommendation: 'Consents to screening requirements'
    },
    {
      name: 'Program Commitment',
      passed: false,
      score: 0,
      description: 'Must demonstrate willingness to participate',
      recommendation: 'Must be willing to participate actively'
    }
  ],
  nextSteps: [
    {
      title: 'Review eligibility criteria',
      description: 'Understand which requirements are not met',
      priority: 'HIGH' as const,
      actionRequired: false
    },
    {
      title: 'Consider lifestyle changes',
      description: 'Work on meeting criteria you may be able to improve',
      priority: 'MEDIUM' as const,
      actionRequired: false
    },
    {
      title: 'Reassess in the future',
      description: 'Circumstances may change to make you eligible',
      priority: 'LOW' as const,
      actionRequired: false
    }
  ],
  appealsAvailable: true,
  appealDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
}

// Mock Question Data
export const mockQuestion = {
  id: 'age',
  type: 'DEMOGRAPHIC' as const,
  text: 'What is your age?',
  description: 'Age is a key factor in Healthier SG eligibility',
  required: true,
  inputType: 'number' as const,
  validation: {
    minAge: 18,
    maxAge: 120
  },
  options: []
}

export const mockSelectQuestion = {
  id: 'citizenshipStatus',
  type: 'DEMOGRAPHIC' as const,
  text: 'What is your citizenship status?',
  description: 'Healthier SG is available to Singapore Citizens and Permanent Residents',
  required: true,
  inputType: 'select' as const,
  options: [
    { value: 'CITIZEN', label: 'Singapore Citizen', eligible: true },
    { value: 'PR', label: 'Permanent Resident', eligible: true },
    { value: 'FOREIGNER', label: 'Foreigner/Work Pass Holder', eligible: false }
  ]
}

export const mockBooleanQuestion = {
  id: 'hasChronicConditions',
  type: 'HEALTH_STATUS' as const,
  text: 'Do you have any chronic conditions?',
  description: 'Chronic conditions include diabetes, hypertension, heart disease, etc.',
  required: true,
  inputType: 'boolean' as const,
  options: [
    { value: 'true', label: 'Yes', eligible: true },
    { value: 'false', label: 'No', eligible: false }
  ]
}

export const mockMultiselectQuestion = {
  id: 'chronicConditionsList',
  type: 'HEALTH_STATUS' as const,
  text: 'Which chronic conditions do you have?',
  description: 'Select all that apply',
  required: false,
  inputType: 'multiselect' as const,
  options: [
    { value: 'DIABETES', label: 'Diabetes' },
    { value: 'HYPERTENSION', label: 'High Blood Pressure' },
    { value: 'HEART_DISEASE', label: 'Heart Disease' },
    { value: 'ASTHMA', label: 'Asthma' },
    { value: 'KIDNEY_DISEASE', label: 'Kidney Disease' },
    { value: 'CANCER', label: 'Cancer (in remission)' },
    { value: 'MENTAL_HEALTH', label: 'Mental Health Conditions' },
    { value: 'OTHER', label: 'Other' }
  ]
}

// Mock Responses Data
export const mockResponses = [
  {
    questionId: 'age',
    value: 45,
    timestamp: new Date('2025-11-04T10:00:00Z')
  },
  {
    questionId: 'citizenshipStatus',
    value: 'CITIZEN',
    timestamp: new Date('2025-11-04T10:01:00Z')
  },
  {
    questionId: 'postalCode',
    value: '123456',
    timestamp: new Date('2025-11-04T10:02:00Z')
  },
  {
    questionId: 'hasChronicConditions',
    value: true,
    timestamp: new Date('2025-11-04T10:03:00Z')
  },
  {
    questionId: 'chronicConditionsList',
    value: ['DIABETES', 'HYPERTENSION'],
    timestamp: new Date('2025-11-04T10:04:00Z')
  },
  {
    questionId: 'smokingStatus',
    value: 'NEVER',
    timestamp: new Date('2025-11-04T10:05:00Z')
  },
  {
    questionId: 'exerciseFrequency',
    value: 'SEVERAL_TIMES_WEEK',
    timestamp: new Date('2025-11-04T10:06:00Z')
  },
  {
    questionId: 'insuranceType',
    value: 'MEDISAVE',
    timestamp: new Date('2025-11-04T10:07:00Z')
  },
  {
    questionId: 'commitmentLevel',
    value: 'HIGH',
    timestamp: new Date('2025-11-04T10:08:00Z')
  },
  {
    questionId: 'consentToScreening',
    value: true,
    timestamp: new Date('2025-11-04T10:09:00Z')
  }
]

// Mock Assessment History Data
export const mockAssessmentHistory = {
  assessments: [
    {
      id: 'assessment-1',
      assessmentDate: new Date('2025-11-04T10:30:00Z'),
      eligibilityStatus: 'ELIGIBLE',
      evaluationResult: {
        isEligible: true,
        confidence: 0.85,
        score: 85,
        criteriaResults: [
          {
            name: 'Age Requirement',
            passed: true,
            score: 25,
            description: 'Must be 40 years or older'
          },
          {
            name: 'Citizenship Status',
            passed: true,
            score: 30,
            description: 'Must be Singapore Citizen or Permanent Resident'
          },
          {
            name: 'Chronic Conditions',
            passed: true,
            score: 20,
            description: 'Having chronic conditions provides priority consideration'
          },
          {
            name: 'Screening Consent',
            passed: true,
            score: 15,
            description: 'Must consent to health screening and data collection'
          },
          {
            name: 'Program Commitment',
            passed: true,
            score: 10,
            description: 'Must demonstrate willingness to participate'
          }
        ]
      },
      createdAt: new Date('2025-11-04T10:30:00Z'),
      updatedAt: new Date('2025-11-04T10:30:00Z')
    },
    {
      id: 'assessment-2',
      assessmentDate: new Date('2025-10-28T14:15:00Z'),
      eligibilityStatus: 'NOT_ELIGIBLE',
      evaluationResult: {
        isEligible: false,
        confidence: 0.65,
        score: 45,
        criteriaResults: [
          {
            name: 'Age Requirement',
            passed: false,
            score: 0,
            description: 'Must be 40 years or older'
          },
          {
            name: 'Citizenship Status',
            passed: true,
            score: 30,
            description: 'Must be Singapore Citizen or Permanent Resident'
          },
          {
            name: 'Chronic Conditions',
            passed: false,
            score: 0,
            description: 'Having chronic conditions provides priority consideration'
          },
          {
            name: 'Screening Consent',
            passed: true,
            score: 15,
            description: 'Must consent to health screening and data collection'
          },
          {
            name: 'Program Commitment',
            passed: false,
            score: 0,
            description: 'Must demonstrate willingness to participate'
          }
        ]
      },
      createdAt: new Date('2025-10-28T14:15:00Z'),
      updatedAt: new Date('2025-10-28T14:15:00Z')
    },
    {
      id: 'assessment-3',
      assessmentDate: new Date('2025-10-15T09:45:00Z'),
      eligibilityStatus: 'ELIGIBLE',
      evaluationResult: {
        isEligible: true,
        confidence: 0.78,
        score: 78,
        criteriaResults: [
          {
            name: 'Age Requirement',
            passed: true,
            score: 25,
            description: 'Must be 40 years or older'
          },
          {
            name: 'Citizenship Status',
            passed: true,
            score: 30,
            description: 'Must be Singapore Citizen or Permanent Resident'
          },
          {
            name: 'Chronic Conditions',
            passed: false,
            score: 0,
            description: 'Having chronic conditions provides priority consideration'
          },
          {
            name: 'Screening Consent',
            passed: true,
            score: 15,
            description: 'Must consent to health screening and data collection'
          },
          {
            name: 'Program Commitment',
            passed: true,
            score: 10,
            description: 'Must demonstrate willingness to participate'
          }
        ]
      },
      createdAt: new Date('2025-10-15T09:45:00Z'),
      updatedAt: new Date('2025-10-15T09:45:00Z')
    }
  ],
  pagination: {
    total: 3,
    limit: 20,
    offset: 0,
    hasMore: false
  },
  summary: {
    totalAssessments: 3,
    eligibleAssessments: 2,
    successRate: 66.67,
    lastAssessmentDate: new Date('2025-11-04T10:30:00Z')
  }
}

// Mock MyInfo Data
export const mockMyInfoData = {
  uinFin: 'S1234567A',
  name: 'John Doe',
  dateOfBirth: '1980-05-15',
  gender: 'M' as const,
  nationality: 'Singaporean',
  residentialStatus: 'CITIZEN' as const,
  address: {
    postalCode: '123456',
    streetName: 'Main Street',
    blockHouseNumber: '123',
    buildingName: 'Block A'
  }
}

// Mock Eligibility Assessment
export const mockEligibilityAssessment = {
  id: 'assessment-current',
  userId: 'user-123',
  myInfoData: mockMyInfoData,
  responses: mockResponses,
  status: 'COMPLETED' as const,
  eligibilityResult: {
    isEligible: true,
    confidence: 0.85,
    reason: 'Meets all eligibility criteria for Healthier SG',
    score: 85,
    criteria: [
      {
        name: 'Age Requirement',
        passed: true,
        weight: 25,
        description: 'Must be 40 years or older'
      },
      {
        name: 'Citizenship Status',
        passed: true,
        weight: 30,
        description: 'Must be Singapore Citizen or Permanent Resident'
      },
      {
        name: 'Chronic Conditions',
        passed: true,
        weight: 20,
        description: 'Having chronic conditions provides priority consideration'
      },
      {
        name: 'Screening Consent',
        passed: true,
        weight: 15,
        description: 'Must consent to health screening and data collection'
      },
      {
        name: 'Program Commitment',
        passed: true,
        weight: 10,
        description: 'Must demonstrate willingness to participate'
      }
    ]
  },
  createdAt: new Date('2025-11-04T10:30:00Z'),
  updatedAt: new Date('2025-11-04T10:30:00Z'),
  completedAt: new Date('2025-11-04T10:45:00Z')
}

// Mock API Responses
export const mockEvaluateEligibilityResponse = {
  success: true,
  data: {
    isEligible: true,
    confidence: 0.85,
    score: 85,
    criteriaResults: mockEligibleAssessment.criteriaResults,
    nextSteps: mockEligibleAssessment.nextSteps,
    appealsAvailable: true,
    appealDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  },
  assessmentId: 'assessment-123'
}

export const mockGetEligibilityHistoryResponse = {
  assessments: mockAssessmentHistory.assessments,
  pagination: mockAssessmentHistory.pagination,
  summary: mockAssessmentHistory.summary
}

export const mockSubmitAppealResponse = {
  success: true,
  appeal: {
    id: 'appeal-123',
    status: 'SUBMITTED',
    submittedAt: new Date(),
    appealDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  },
  message: 'Appeal submitted successfully. You will receive a response within 5-7 business days.'
}

export const mockTrackAssessmentResponse = {
  success: true,
  message: 'Analytics tracked successfully'
}

// Test Utilities
export const createMockQuestion = (overrides: Partial<typeof mockQuestion> = {}) => ({
  ...mockQuestion,
  ...overrides
})

export const createMockResponse = (overrides: Partial<{
  questionId: string
  value: any
  timestamp: Date
}> = {}) => ({
  questionId: 'test-question',
  value: 'test-value',
  timestamp: new Date(),
  ...overrides
})

export const createMockAssessment = (overrides: Partial<typeof mockEligibilityAssessment> = {}) => ({
  ...mockEligibilityAssessment,
  ...overrides
})

// Mock User Agent Strings for Device Testing
export const mockUserAgents = {
  mobile: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
  tablet: 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
  desktop: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  chrome: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  safari: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15',
  firefox: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0'
}

// Error Scenarios for Testing
export const mockErrorScenarios = {
  networkError: new Error('Network error occurred'),
  validationError: new Error('Validation failed: Invalid age provided'),
  unauthorizedError: new Error('Unauthorized: User not authenticated'),
  serverError: new Error('Internal server error'),
  timeoutError: new Error('Request timeout')
}

// Performance Test Data
export const mockLargeDataset = {
  responses: Array.from({ length: 1000 }, (_, i) => ({
    questionId: `question-${i}`,
    value: i % 2 === 0 ? 'response-a' : 'response-b',
    timestamp: new Date(Date.now() - i * 1000)
  })),
  criteriaResults: Array.from({ length: 100 }, (_, i) => ({
    name: `Criteria ${i}`,
    passed: Math.random() > 0.5,
    score: Math.floor(Math.random() * 25) + 5,
    description: `Description for criteria ${i}`
  }))
}

// Accessibility Testing Data
export const mockAccessibilityData = {
  ariaLabels: {
    helpButton: 'Help information',
    previousButton: 'Previous step',
    nextButton: 'Next step',
    submitButton: 'Complete assessment'
  },
  headingStructure: {
    h1: 'Healthier SG Eligibility Checker',
    h2: 'Step 1: Personal Information',
    h3: 'What is your age?'
  },
  keyboardShortcuts: {
    next: ['Tab', 'Enter'],
    previous: ['Shift', 'Tab'],
    submit: ['Enter']
  }
}

// Multi-language Test Data
export const mockLanguageData = {
  en: {
    title: 'Healthier SG Eligibility Checker',
    step1: 'Step 1: Personal Information',
    ageLabel: 'What is your age?',
    citizenshipLabel: 'What is your citizenship status?'
  },
  zh: {
    title: '健康SG资格检查器',
    step1: '步骤1：个人信息',
    ageLabel: '您的年龄是多少？',
    citizenshipLabel: '您的公民身份是什么？'
  },
  ms: {
    title: 'Pemeriksa Kelayakan Healthier SG',
    step1: 'Langkah 1: Maklumat Peribadi',
    ageLabel: 'Berapakah umur anda?',
    citizenshipLabel: 'Apakah status kewarganegaraan anda?'
  },
  ta: {
    title: 'Healthier SG தகுதி சரிபார்ப்பான்',
    step1: 'படி 1: தனிப்பட்ட தகவல்',
    ageLabel: 'உங்கள் வயது என்ன?',
    citizenshipLabel: 'உங்கள் குடியுரிமை நிலை என்ன?'
  }
}