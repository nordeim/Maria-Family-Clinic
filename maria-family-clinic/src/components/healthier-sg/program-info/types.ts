// Program Information & Content Management Types
// Sub-Phase 8.5: Healthier SG Program Information Pages

import { z } from 'zod'

// Content Management System Types
export const ContentVersionSchema = z.object({
  id: z.string(),
  contentId: z.string(),
  version: z.number(),
  title: z.string(),
  content: z.object({
    english: z.string(),
    chinese: z.string().optional(),
    malay: z.string().optional(),
    tamil: z.string().optional(),
  }),
  metadata: z.object({
    author: z.string(),
    reviewer: z.string().optional(),
    approvalStatus: z.enum(['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'PUBLISHED', 'DEPRECATED']),
    governmentCompliance: z.object({
      verified: z.boolean(),
      verifiedBy: z.string().optional(),
      verifiedAt: z.date().optional(),
      mohGuidelines: z.array(z.string()).optional(),
    }),
    lastGovernmentUpdate: z.date().optional(),
    contentCategory: z.enum(['OVERVIEW', 'BENEFITS', 'ENROLLMENT', 'FAQ', 'NEWS', 'RESOURCES', 'GUIDE']),
    tags: z.array(z.string()),
    language: z.array(z.enum(['en', 'zh', 'ms', 'ta'])),
    accessibility: z.object({
      wcagCompliant: z.boolean(),
      altTextAvailable: z.boolean(),
      screenReaderOptimized: z.boolean(),
      highContrastSupported: z.boolean(),
    }),
    seo: z.object({
      metaDescription: z.string().optional(),
      keywords: z.array(z.string()).optional(),
      canonicalUrl: z.string().optional(),
    }),
  }),
  analytics: z.object({
    views: z.number().default(0),
    uniqueViews: z.number().default(0),
    averageEngagementTime: z.number().default(0),
    completionRate: z.number().default(0),
    lastViewed: z.date().optional(),
    bounceRate: z.number().default(0),
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
  publishedAt: z.date().optional(),
  expiresAt: z.date().optional(),
})

export type ContentVersion = z.infer<typeof ContentVersionSchema>

// Program Information Content Types
export const ProgramOverviewContentSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  description: z.string(),
  heroSection: z.object({
    title: z.string(),
    subtitle: z.string(),
    callToAction: z.object({
      text: z.string(),
      href: z.string(),
      primary: z.boolean(),
    }),
    image: z.object({
      src: z.string(),
      alt: z.string(),
      caption: z.string().optional(),
    }),
  }),
  keyFeatures: z.array(z.object({
    title: z.string(),
    description: z.string(),
    icon: z.string(),
    benefits: z.array(z.string()),
  })),
  statistics: z.array(z.object({
    value: z.string(),
    label: z.string(),
    description: z.string(),
    source: z.string().optional(),
  })),
  testimonials: z.array(z.object({
    quote: z.string(),
    author: z.object({
      name: z.string(),
      age: z.number().optional(),
      occupation: z.string().optional(),
      image: z.string().optional(),
    }),
    programOutcome: z.string().optional(),
  })),
  nextSteps: z.array(z.object({
    title: z.string(),
    description: z.string(),
    action: z.object({
      text: z.string(),
      href: z.string(),
    }),
  })),
})

export type ProgramOverviewContent = z.infer<typeof ProgramOverviewContentSchema>

// Benefit Explanation Types
export const BenefitExplanationSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.enum(['FINANCIAL', 'HEALTH', 'PREVENTIVE', 'ACCESS', 'QUALITY', 'CONVENIENCE']),
  description: z.string(),
  visualGuide: z.object({
    type: z.enum(['INFOGRAPHIC', 'VIDEO', 'INTERACTIVE', 'DIAGRAM']),
    url: z.string(),
    altText: z.string(),
    interactiveElements: z.array(z.object({
      id: z.string(),
      type: z.enum(['HIGHLIGHT', 'POPUP', 'ANIMATION', 'LINK']),
      title: z.string(),
      content: z.string(),
      position: z.object({
        x: z.number(),
        y: z.number(),
        width: z.number().optional(),
        height: z.number().optional(),
      }),
    })).optional(),
  }),
  calculationTools: z.array(z.object({
    type: z.enum(['SAVINGS_CALCULATOR', 'BENEFIT_ESTIMATOR', 'ROI_CALCULATOR']),
    title: z.string(),
    description: z.string(),
    inputs: z.array(z.object({
      label: z.string(),
      type: z.enum(['NUMBER', 'SELECT', 'RANGE', 'BOOLEAN']),
      options: z.array(z.object({
        value: z.string(),
        label: z.string(),
      })).optional(),
      defaultValue: z.union([z.string(), z.number(), z.boolean()]).optional(),
      required: z.boolean().default(false),
    })),
    calculationLogic: z.object({
      formula: z.string(),
      variables: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
    }),
  })),
  eligibilityCriteria: z.array(z.object({
    criterion: z.string(),
    description: z.string(),
    required: z.boolean(),
    verificationMethod: z.string().optional(),
  })),
  relatedPrograms: z.array(z.string()),
  frequentlyAsked: z.array(z.object({
    question: z.string(),
    answer: z.string(),
    category: z.string().optional(),
  })),
})

export type BenefitExplanation = z.infer<typeof BenefitExplanationSchema>

// FAQ System Types
export const FAQCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  color: z.string(),
  order: z.number(),
  questionCount: z.number(),
  isActive: z.boolean(),
})

export type FAQCategory = z.infer<typeof FAQCategorySchema>

export const FAQItemSchema = z.object({
  id: z.string(),
  question: z.string(),
  answer: z.object({
    short: z.string(),
    detailed: z.string(),
    sources: z.array(z.object({
      title: z.string(),
      url: z.string(),
      type: z.enum(['OFFICIAL', 'LEGAL', 'MEDICAL', 'NEWS']),
    })).optional(),
  }),
  category: z.string(),
  tags: z.array(z.string()),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  lastUpdated: z.date(),
  governmentVerified: z.boolean(),
  verifiedBy: z.string().optional(),
  searchKeywords: z.array(z.string()),
  relatedQuestions: z.array(z.string()).optional(),
  viewCount: z.number().default(0),
  helpfulVotes: z.object({
    up: z.number().default(0),
    down: z.number().default(0),
  }),
})

export type FAQItem = z.infer<typeof FAQItemSchema>

export const FAQSearchResultSchema = z.object({
  query: z.string(),
  results: z.array(z.object({
    faq: FAQItemSchema,
    relevanceScore: z.number(),
    matchedTerms: z.array(z.string()),
    highlight: z.object({
      question: z.array(z.object({
        text: z.string(),
        highlighted: z.boolean(),
      })),
      answer: z.array(z.object({
        text: z.string(),
        highlighted: z.boolean(),
      })),
    }),
  })),
  categories: z.array(z.object({
    category: FAQCategorySchema,
    resultCount: z.number(),
  })),
  suggestions: z.array(z.string()),
  totalResults: z.number(),
  searchTime: z.number(), // milliseconds
})

export type FAQSearchResult = z.infer<typeof FAQSearchResultSchema>

// Program Timeline Types
export const MilestoneSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  date: z.date(),
  status: z.enum(['UPCOMING', 'IN_PROGRESS', 'COMPLETED', 'DELAYED']),
  type: z.enum(['ENROLLMENT', 'HEALTH_CHECK', 'MILESTONE', 'DEADLINE', 'REVIEW']),
  progress: z.number().min(0).max(100),
  requirements: z.array(z.object({
    description: z.string(),
    completed: z.boolean(),
    optional: z.boolean().default(false),
  })),
  resources: z.array(z.object({
    title: z.string(),
    type: z.enum(['GUIDE', 'FORM', 'CHECKLIST', 'FAQ', 'LINK']),
    url: z.string(),
    description: z.string().optional(),
  })),
  notifications: z.array(z.object({
    type: z.enum(['REMINDER', 'DEADLINE', 'UPDATE', 'ALERT']),
    message: z.string(),
    sendAt: z.date().optional(),
    conditions: z.object({
      daysBefore: z.number().optional(),
      statusChanged: z.boolean().default(false),
    }).optional(),
  })),
})

export type Milestone = z.infer<typeof MilestoneSchema>

// Success Stories Types
export const SuccessStorySchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  story: z.object({
    before: z.object({
      healthConditions: z.array(z.string()),
      challenges: z.array(z.string()),
      goals: z.array(z.string()),
    }),
    journey: z.array(z.object({
      phase: z.string(),
      description: z.string(),
      duration: z.string(),
      outcomes: z.array(z.string()),
    })),
    after: z.object({
      improvements: z.array(z.string()),
      achievements: z.array(z.string()),
      newGoals: z.array(z.string()).optional(),
    }),
  }),
  participant: z.object({
    name: z.string(),
    age: z.number(),
    gender: z.enum(['M', 'F']),
    occupation: z.string().optional(),
    location: z.string().optional(),
    image: z.string().optional(),
    anonymized: z.boolean().default(true),
  }),
  programDetails: z.object({
    enrollmentDate: z.date(),
    clinic: z.string(),
    doctor: z.string(),
    duration: z.string(),
    milestones: z.array(z.object({
      date: z.date(),
      description: z.string(),
      measurableOutcome: z.string().optional(),
    })),
  }),
  metrics: z.array(z.object({
    metric: z.string(),
    before: z.union([z.string(), z.number()]),
    after: z.union([z.string(), z.number()]),
    improvement: z.string(),
    unit: z.string().optional(),
  })),
  media: z.array(z.object({
    type: z.enum(['IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT']),
    url: z.string(),
    caption: z.string(),
    consent: z.boolean(),
  })),
  isPublished: z.boolean(),
  consentDate: z.date().optional(),
  lastUpdated: z.date(),
})

export type SuccessStory = z.infer<typeof SuccessStorySchema>

// Resource Download Types
export const ResourceCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  resourceCount: z.number(),
  isActive: z.boolean(),
  sortOrder: z.number(),
})

export type ResourceCategory = z.infer<typeof ResourceCategorySchema>

export const DownloadableResourceSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  type: z.enum(['PDF', 'VIDEO', 'INTERACTIVE', 'CHECKLIST', 'FORM', 'GUIDE', 'INFOGRAPHIC']),
  format: z.object({
    language: z.array(z.enum(['en', 'zh', 'ms', 'ta'])),
    fileFormats: z.array(z.enum(['PDF', 'DOCX', 'PPTX', 'MP4', 'HTML', 'JSON'])),
    accessibility: z.object({
      screenReader: z.boolean(),
      highContrast: z.boolean(),
      largeText: z.boolean(),
    }),
  }),
  downloadUrl: z.string(),
  fileSize: z.number().optional(),
  lastUpdated: z.date(),
  version: z.string(),
  governmentVerified: z.boolean(),
  verifiedBy: z.string().optional(),
  downloadCount: z.number().default(0),
  rating: z.object({
    average: z.number(),
    count: z.number(),
  }),
  tags: z.array(z.string()),
  relatedTopics: z.array(z.string()),
  requiresRegistration: z.boolean(),
  metadata: z.object({
    author: z.string(),
    reviewDate: z.date().optional(),
    expirationDate: z.date().optional(),
    keywords: z.array(z.string()),
  }),
})

export type DownloadableResource = z.infer<typeof DownloadableResourceSchema>

// Program News Types
export const NewsItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  summary: z.string(),
  content: z.object({
    body: z.string(),
    sections: z.array(z.object({
      heading: z.string(),
      content: z.string(),
    })).optional(),
    attachments: z.array(z.object({
      type: z.enum(['DOCUMENT', 'IMAGE', 'VIDEO', 'LINK']),
      url: z.string(),
      title: z.string(),
      description: z.string().optional(),
    })).optional(),
  }),
  metadata: z.object({
    author: z.string(),
    category: z.enum(['POLICY_UPDATE', 'ENROLLMENT', 'HEALTH_TIPS', 'PROGRAM_ANNOUNCEMENT', 'COMPLIANCE', 'TECHNICAL']),
    priority: z.enum(['URGENT', 'HIGH', 'MEDIUM', 'LOW']),
    tags: z.array(z.string()),
    source: z.string().optional(),
    governmentSource: z.boolean().default(false),
  }),
  publication: z.object({
    publishedAt: z.date(),
    effectiveDate: z.date().optional(),
    expiresAt: z.date().optional(),
    status: z.enum(['DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED']),
    version: z.number().default(1),
  }),
  audience: z.object({
    targetGroups: z.array(z.string()),
    affectedPrograms: z.array(z.string()).optional(),
    geographicScope: z.array(z.string()).optional(),
  }),
  impact: z.object({
    affectsEnrollment: z.boolean(),
    affectsBenefits: z.boolean(),
    affectsEligibility: z.boolean(),
    requiresAction: z.boolean(),
    actionDeadline: z.date().optional(),
  }),
  analytics: z.object({
    views: z.number().default(0),
    shares: z.number().default(0),
    engagementScore: z.number().default(0),
    lastViewed: z.date().optional(),
  }),
  notifications: z.array(z.object({
    type: z.enum(['EMAIL', 'SMS', 'IN_APP', 'PUSH']),
    audience: z.array(z.string()),
    sentAt: z.date().optional(),
    status: z.enum(['SCHEDULED', 'SENT', 'FAILED', 'CANCELLED']).optional(),
  })),
})

export type NewsItem = z.infer<typeof NewsItemSchema>

// Program Guide Types
export const GuideStepSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  estimatedTime: z.string(),
  type: z.enum(['INFORMATION', 'ACTION', 'DECISION', 'RESOURCE']),
  content: z.object({
    instructions: z.array(z.string()),
    prerequisites: z.array(z.string()).optional(),
    tips: z.array(z.string()).optional(),
    warnings: z.array(z.string()).optional(),
    resources: z.array(z.object({
      title: z.string(),
      type: z.enum(['LINK', 'DOCUMENT', 'VIDEO', 'CONTACT']),
      url: z.string(),
      description: z.string().optional(),
    })).optional(),
  }),
  interactive: z.object({
    hasForm: z.boolean(),
    hasQuiz: z.boolean(),
    hasCalculators: z.boolean(),
    hasChecklist: z.boolean(),
    formFields: z.array(z.object({
      type: z.enum(['TEXT', 'NUMBER', 'SELECT', 'CHECKBOX', 'DATE']),
      label: z.string(),
      required: z.boolean(),
      options: z.array(z.string()).optional(),
    })).optional(),
  }),
  progress: z.object({
    completed: z.boolean().default(false),
    completedAt: z.date().optional(),
    nextStep: z.string().optional(),
    skipConditions: z.array(z.string()).optional(),
  }),
})

export type GuideStep = z.infer<typeof GuideStepSchema>

export const ProgramGuideSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.enum(['ENROLLMENT', 'HEALTH_MANAGEMENT', 'BENEFITS', 'COMPLIANCE', 'TROUBLESHOOTING']),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  estimatedDuration: z.string(),
  steps: z.array(GuideStepSchema),
  prerequisites: z.array(z.string()).optional(),
  outcomes: z.array(z.object({
    description: z.string(),
    measurable: z.boolean(),
    unit: z.string().optional(),
  })).optional(),
  resources: z.array(z.object({
    title: z.string(),
    type: z.enum(['FAQ', 'DOWNLOAD', 'VIDEO', 'LINK', 'CONTACT']),
    url: z.string().optional(),
    content: z.string().optional(),
  })),
  accessibility: z.object({
    textToSpeech: z.boolean(),
    highContrast: z.boolean(),
    keyboardNavigation: z.boolean(),
    alternativeFormats: z.array(z.string()),
  }),
  analytics: z.object({
    views: z.number().default(0),
    completions: z.number().default(0),
    averageTimeSpent: z.number().default(0),
    completionRate: z.number().default(0),
  }),
})

export type ProgramGuide = z.infer<typeof ProgramGuideSchema>

// Content Analytics Types
export const ContentAnalyticsSchema = z.object({
  contentId: z.string(),
  date: z.date(),
  metrics: z.object({
    pageViews: z.number(),
    uniqueVisitors: z.number(),
    timeSpent: z.number(),
    bounceRate: z.number(),
    exitRate: z.number(),
    socialShares: z.number(),
    downloads: z.number(),
    formSubmissions: z.number(),
    searchQueries: z.number(),
  }),
  demographics: z.object({
    ageGroups: z.record(z.string(), z.number()),
    languages: z.record(z.string(), z.number()),
    devices: z.record(z.string(), z.number()),
    locations: z.record(z.string(), z.number()),
  }),
  engagement: z.object({
    averageSessionDuration: z.number(),
    pagesPerSession: z.number(),
    returnVisits: z.number(),
    feedbackScore: z.number(),
  }),
})

export type ContentAnalytics = z.infer<typeof ContentAnalyticsSchema>

// Search and Recommendation Types
export const SearchQuerySchema = z.object({
  query: z.string(),
  filters: z.object({
    categories: z.array(z.string()).optional(),
    contentTypes: z.array(z.enum(['OVERVIEW', 'BENEFITS', 'FAQ', 'NEWS', 'RESOURCES', 'GUIDE'])).optional(),
    languages: z.array(z.enum(['en', 'zh', 'ms', 'ta'])).optional(),
    dateRange: z.object({
      from: z.date().optional(),
      to: z.date().optional(),
    }).optional(),
    governmentVerified: z.boolean().optional(),
  }),
  sortBy: z.enum(['RELEVANCE', 'DATE', 'POPULARITY', 'ALPHABETICAL']),
  pagination: z.object({
    page: z.number().default(1),
    pageSize: z.number().default(10),
  }),
})

export type SearchQuery = z.infer<typeof SearchQuerySchema>

export const ContentRecommendationSchema = z.object({
  contentId: z.string(),
  recommendedContent: z.array(z.object({
    contentId: z.string(),
    relevanceScore: z.number(),
    recommendationType: z.enum(['RELATED', 'SIMILAR', 'POPULAR', 'TRENDING', 'PERSIONALIZED']),
    reasoning: z.string(),
  })),
  algorithmVersion: z.string(),
  generatedAt: z.date(),
})

export type ContentRecommendation = z.infer<typeof ContentRecommendationSchema>

// Government Compliance Types
export const ComplianceStatusSchema = z.object({
  contentId: z.string(),
  complianceChecks: z.object({
    mohGuidelines: z.object({
      status: z.enum(['COMPLIANT', 'NON_COMPLIANT', 'NEEDS_REVIEW']),
      issues: z.array(z.string()),
      lastChecked: z.date(),
      checkedBy: z.string(),
    }),
    pdpaCompliance: z.object({
      status: z.enum(['COMPLIANT', 'NON_COMPLIANT', 'NEEDS_REVIEW']),
      issues: z.array(z.string()),
      lastChecked: z.date(),
      checkedBy: z.string(),
    }),
    accessibility: z.object({
      wcagLevel: z.enum(['A', 'AA', 'AAA']),
      score: z.number(),
      issues: z.array(z.string()),
      lastChecked: z.date(),
    }),
    accuracy: z.object({
      verified: z.boolean(),
      sources: z.array(z.string()),
      verificationDate: z.date().optional(),
      verifiedBy: z.string().optional(),
      discrepancies: z.array(z.string()).optional(),
    }),
  }),
  overallStatus: z.enum(['COMPLIANT', 'PARTIALLY_COMPLIANT', 'NON_COMPLIANT', 'UNDER_REVIEW']),
  lastReview: z.date(),
  nextReview: z.date(),
  reviewHistory: z.array(z.object({
    date: z.date(),
    reviewer: z.string(),
    status: z.enum(['COMPLIANT', 'NON_COMPLIANT', 'NEEDS_CHANGES']),
    comments: z.string().optional(),
  })),
})

export type ComplianceStatus = z.infer<typeof ComplianceStatusSchema>

// Content Management System Configuration
export const ContentManagementConfigSchema = z.object({
  versioning: z.object({
    enabled: z.boolean(),
    maxVersions: z.number(),
    autoPublish: z.boolean(),
    approvalWorkflow: z.enum(['SINGLE_APPROVAL', 'DUAL_APPROVAL', 'MULTI_LEVEL']),
  }),
  analytics: z.object({
    enabled: z.boolean(),
    trackingInterval: z.number(),
    privacyCompliant: z.boolean(),
  }),
  search: z.object({
    enableRealTime: z.boolean(),
    maxResultsPerQuery: z.number(),
    enableSpellCorrection: z.boolean(),
    enableFacetedSearch: z.boolean(),
  }),
  recommendations: z.object({
    enabled: z.boolean(),
    algorithm: z.enum(['COLLABORATIVE', 'CONTENT_BASED', 'HYBRID']),
    refreshInterval: z.number(),
  }),
  government: z.object({
    autoVerification: z.boolean(),
    requireApproval: z.boolean(),
    complianceChecks: z.array(z.string()),
    updateNotification: z.boolean(),
  }),
})

export type ContentManagementConfig = z.infer<typeof ContentManagementConfigSchema>

// Component Props Types
export interface ProgramInfoComponentProps {
  className?: string
  language?: 'en' | 'zh' | 'ms' | 'ta'
  userType?: 'citizen' | 'resident' | 'healthcare_provider' | 'government'
  isMobile?: boolean
  showGovernmentDisclaimer?: boolean
  enableAnalytics?: boolean
  contentId?: string
}

// Search and Filter Types
export interface ContentFilters {
  categories?: string[]
  contentTypes?: string[]
  languages?: string[]
  dateRange?: {
    from?: Date
    to?: Date
  }
  governmentVerified?: boolean
  accessibility?: boolean
  searchQuery?: string
}

// Export utility types

// Eligibility Checker Integration Types
export interface EligibilityResult {
  isEligible: boolean;
  eligibilityLevel: 'full' | 'partial' | 'pending_verification';
  recommendedBenefits: string[];
  nextSteps: string[];
  estimatedSavings: number;
  enrollmentDeadline?: Date;
  specialConsiderations?: string[];
  eligibilityReason?: string;
}

export interface EligibilityCheckRequest {
  userId?: string;
  nric?: string;
  age?: number;
  residencyStatus: 'citizen' | 'permanent_resident' | 'long_term_pass';
  incomeLevel?: 'low' | 'middle' | 'high';
  chronicConditions?: string[];
  familySize?: number;
  currentHealthCoverage?: string;
}

export interface EligibilityCheckerProps {
  onEligibilityCheck: (request: EligibilityCheckRequest) => Promise<EligibilityResult>;
  onStartEnrollment?: () => void;
  showDetailedResults?: boolean;
  compact?: boolean;
}

// Custom Hook for Eligibility Checker
export const useEligibilityChecker = () => {
  return {
    checkEligibility: (request: EligibilityCheckRequest): Promise<EligibilityResult> => {
      // Mock implementation - replace with actual API call
      return Promise.resolve({
        isEligible: true,
        eligibilityLevel: 'full',
        recommendedBenefits: ['Complete Healthier SG coverage', 'Health screenings', 'Chronic disease management'],
        nextSteps: ['Select family clinic', 'Complete enrollment', 'Schedule health assessment'],
        estimatedSavings: 2400,
        eligibilityReason: 'Eligible as Singapore citizen'
      });
    },
    isLoading: false,
    error: null
  };
};
export const CONTENT_CATEGORIES = {
  OVERVIEW: 'Program Overview',
  BENEFITS: 'Benefits & Subsidies', 
  ENROLLMENT: 'Enrollment Process',
  FAQ: 'Frequently Asked Questions',
  NEWS: 'Program News',
  RESOURCES: 'Resources & Downloads',
  GUIDE: 'Step-by-Step Guides',
} as const

export const CONTENT_TYPES = {
  OVERVIEW: 'overview',
  BENEFITS: 'benefits',
  ENROLLMENT: 'enrollment', 
  FAQ: 'faq',
  NEWS: 'news',
  RESOURCES: 'resources',
  GUIDE: 'guide',
} as const

export const LANGUAGES = {
  ENGLISH: 'en',
  CHINESE: 'zh',
  MALAY: 'ms', 
  TAMIL: 'ta',
} as const