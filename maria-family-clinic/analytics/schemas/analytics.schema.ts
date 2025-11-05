// Healthcare Analytics Schema Extensions
// Sub-Phase 10.1: Advanced Analytics & Tracking System Architecture

import { z } from 'zod';
import { 
  HealthcareEventType, 
  DashboardType, 
  WidgetType,
  ABTestStatus,
  TimeRangeKey 
} from '../types/analytics.types';

// Healthcare Analytics Event Schema
export const healthcareAnalyticsEventSchema = z.object({
  id: z.string(),
  eventType: z.nativeEnum(HealthcareEventType),
  eventName: z.string(),
  sessionId: z.string(),
  userId: z.string().optional(),
  pageUrl: z.string(),
  clinicId: z.string().optional(),
  doctorId: z.string().optional(),
  serviceId: z.string().optional(),
  appointmentId: z.string().optional(),
  enquiryId: z.string().optional(),
  healthierSgEnrolmentId: z.string().optional(),
  timestamp: z.date(),
  metadata: z.object({
    userType: z.enum(['patient', 'doctor', 'clinic_staff', 'visitor']),
    clinicCategory: z.enum(['general', 'specialist', 'healthier_sg']).optional(),
    serviceCategory: z.enum(['primary_care', 'health_screening', 'vaccination', 'consultation']).optional(),
    doctorSpecialty: z.string().optional(),
    appointmentType: z.enum(['walk_in', 'scheduled', 'telemedicine']).optional(),
    enquiryCategory: z.string().optional(),
    conversionStage: z.enum(['awareness', 'consideration', 'decision', 'booking', 'completed']).optional(),
    referrerSource: z.enum(['google', 'social', 'direct', 'referral']).optional(),
  }),
  performanceMetrics: z.object({
    loadTime: z.number(),
    renderTime: z.number(),
    interactionTime: z.number(),
    searchDuration: z.number().optional(),
    bookingTime: z.number().optional(),
    clinicViewDuration: z.number().optional(),
    doctorProfileViewDuration: z.number().optional(),
    serviceViewDuration: z.number().optional(),
    formCompletionTime: z.number().optional(),
    appointmentBookingTime: z.number().optional(),
    eligibilityCheckTime: z.number().optional(),
  }),
  userAgent: z.string(),
  deviceInfo: z.object({
    deviceType: z.enum(['mobile', 'tablet', 'desktop']),
    browser: z.string(),
    browserVersion: z.string(),
    os: z.string(),
    osVersion: z.string(),
    screenResolution: z.string(),
    viewportSize: z.object({
      width: z.number(),
      height: z.number(),
    }),
    connectionType: z.enum(['slow-2g', '2g', '3g', '4g', 'wifi', 'unknown']),
    connectionSpeed: z.number(),
  }),
  location: z.object({
    country: z.string(),
    region: z.string(),
    city: z.string(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number(),
    }).optional(),
    accuracy: z.number(),
    postalCode: z.string().optional(),
    district: z.string().optional(),
  }),
  anonymized: z.boolean(),
  ipAnonymized: z.boolean(),
});

// Healthcare KPI Schema
export const healthcareKPISchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum(['clinical', 'operational', 'user_experience', 'business']),
  currentValue: z.number(),
  targetValue: z.number(),
  unit: z.string(),
  trend: z.enum(['improving', 'declining', 'stable']),
  changePercentage: z.number(),
  status: z.enum(['excellent', 'good', 'warning', 'critical']),
  lastUpdated: z.date(),
  timeRange: z.object({
    start: z.date(),
    end: z.date(),
    granularity: z.enum(['hour', 'day', 'week', 'month', 'quarter', 'year']),
  }),
  geographicBreakdown: z.array(z.object({
    region: z.string(),
    district: z.string().optional(),
    postalCode: z.string().optional(),
    value: z.number(),
    percentage: z.number(),
  })).optional(),
  demographicsBreakdown: z.array(z.object({
    ageGroup: z.string(),
    gender: z.string().optional(),
    value: z.number(),
    percentage: z.number(),
  })).optional(),
});

// User Journey Analytics Schema
export const userJourneySchema = z.object({
  id: z.string(),
  userId: z.string(),
  sessionId: z.string(),
  journeySteps: z.array(z.object({
    step: z.string(),
    timestamp: z.date(),
    duration: z.number(),
    pageUrl: z.string(),
    action: z.string(),
    metadata: z.record(z.any()),
    conversionImpact: z.enum(['high', 'medium', 'low', 'none']),
  })),
  conversionRate: z.number(),
  totalJourneyTime: z.number(),
  abandonmentStep: z.string().optional(),
  geographicRegion: z.string(),
  deviceType: z.string(),
  referrerSource: z.string(),
});

// Service Performance Metrics Schema
export const servicePerformanceMetricsSchema = z.object({
  id: z.string(),
  serviceId: z.string(),
  serviceName: z.string(),
  category: z.string(),
  totalViews: z.number(),
  totalClicks: z.number(),
  bookingConversions: z.number(),
  averageViewDuration: z.number(),
  searchRanking: z.number(),
  popularTimeSlots: z.array(z.object({
    hour: z.number(),
    dayOfWeek: z.number(),
    views: z.number(),
    conversions: z.number(),
    conversionRate: z.number(),
  })),
  geographicDistribution: z.array(z.object({
    region: z.string(),
    district: z.string().optional(),
    postalCode: z.string().optional(),
    value: z.number(),
    percentage: z.number(),
  })),
  deviceBreakdown: z.object({
    mobile: z.object({
      views: z.number(),
      conversionRate: z.number(),
    }),
    tablet: z.object({
      views: z.number(),
      conversionRate: z.number(),
    }),
    desktop: z.object({
      views: z.number(),
      conversionRate: z.number(),
    }),
  }),
  conversionFunnel: z.object({
    steps: z.array(z.object({
      step: z.string(),
      visitors: z.number(),
      conversionRate: z.number(),
      dropoffRate: z.number(),
      averageTimeSpent: z.number(),
      exitPages: z.array(z.string()),
    })),
    totalDropOff: z.number(),
    biggestDropOffStep: z.string(),
    overallConversionRate: z.number(),
    optimizationSuggestions: z.array(z.string()),
  }),
  competitorComparison: z.object({
    competitorName: z.string(),
    marketShare: z.number(),
    averageRating: z.number(),
    priceComparison: z.number(),
    serviceComparison: z.record(z.number()),
  }).optional(),
});

// Real-time Dashboard Schema
export const realTimeDashboardSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.nativeEnum(DashboardType),
  widgets: z.array(z.object({
    id: z.string(),
    type: z.nativeEnum(WidgetType),
    title: z.string(),
    position: z.object({
      x: z.number(),
      y: z.number(),
      w: z.number(),
      h: z.number(),
    }),
    dataSource: z.string(),
    visualization: z.object({
      chartType: z.enum(['line', 'bar', 'pie', 'area', 'scatter', 'funnel', 'heatmap', 'gauge', 'treemap']),
      colors: z.array(z.string()),
      showLegend: z.boolean(),
      showTooltip: z.boolean(),
      animation: z.boolean(),
      xAxisLabel: z.string().optional(),
      yAxisLabel: z.string().optional(),
      customOptions: z.record(z.any()).optional(),
    }),
    refreshInterval: z.number().optional(),
    alerts: z.array(z.object({
      metricName: z.string(),
      threshold: z.number(),
      condition: z.enum(['above', 'below', 'equals']),
      severity: z.enum(['info', 'warning', 'critical']),
      message: z.string(),
      recipients: z.array(z.string()),
    })).optional(),
  })),
  refreshInterval: z.number(),
  lastUpdated: z.date(),
  isActive: z.boolean(),
  permissions: z.object({
    canView: z.array(z.string()),
    canEdit: z.array(z.string()),
    canExport: z.array(z.string()),
    canShare: z.boolean(),
  }),
});

// A/B Test Configuration Schema
export const abTestConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  hypothesis: z.string(),
  status: z.nativeEnum(ABTestStatus),
  startDate: z.date(),
  endDate: z.date().optional(),
  targetMetrics: z.array(z.string()),
  minimumSampleSize: z.number(),
  confidenceLevel: z.number(),
  significanceThreshold: z.number(),
  variants: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    trafficSplit: z.number(),
    isControl: z.boolean(),
    configuration: z.record(z.any()),
    metrics: z.object({
      visitors: z.number(),
      conversions: z.number(),
      conversionRate: z.number(),
      averageTimeSpent: z.number(),
      bounceRate: z.number(),
      statisticalSignificance: z.number().optional(),
      confidenceInterval: z.tuple([z.number(), z.number()]),
    }),
  })),
  winner: z.string().optional(),
  statisticalSignificance: z.number(),
  lift: z.number(),
  businessImpact: z.string(),
});

// Privacy Compliance Schema
export const privacyCompliantAnalyticsSchema = z.object({
  id: z.string(),
  anonymizationLevel: z.enum(['none', 'ip_only', 'full', 'differential_privacy']),
  retentionPeriod: z.number(),
  consentManagement: z.array(z.object({
    userId: z.string(),
    consentType: z.string(),
    granted: z.boolean(),
    timestamp: z.date(),
    ipAddress: z.string(),
    userAgent: z.string(),
    evidence: z.string(),
  })),
  dataSubjectRights: z.array(z.object({
    requestId: z.string(),
    userId: z.string(),
    requestType: z.enum(['access', 'rectification', 'erasure', 'portability']),
    status: z.enum(['pending', 'fulfilled', 'rejected']),
    requestedAt: z.date(),
    fulfilledAt: z.date().optional(),
    details: z.string(),
  })),
  auditTrail: z.array(z.object({
    id: z.string(),
    timestamp: z.date(),
    userId: z.string(),
    action: z.string(),
    resource: z.string(),
    ipAddress: z.string(),
    userAgent: z.string(),
    success: z.boolean(),
    details: z.record(z.any()),
  })),
});

// Predictive Analytics Schema
export const predictiveAnalyticsSchema = z.object({
  id: z.string(),
  clinicId: z.string(),
  forecastDate: z.date(),
  predictedAppointments: z.number(),
  confidence: z.number(),
  lowerBound: z.number(),
  upperBound: z.number(),
  factors: z.array(z.object({
    factor: z.string(),
    impact: z.number(),
    description: z.string(),
  })),
  modelVersion: z.string(),
  generatedAt: z.date(),
});

// Real-time Metrics Schema
export const realTimeMetricsSchema = z.object({
  id: z.string(),
  timestamp: z.date(),
  activeUsers: z.number(),
  concurrentAppointments: z.number(),
  currentLoadTime: z.number(),
  errorRate: z.number(),
  conversionRate: z.number(),
  alerts: z.array(z.object({
    id: z.string(),
    type: z.enum(['performance', 'conversion', 'error', 'security']),
    severity: z.enum(['info', 'warning', 'critical']),
    title: z.string(),
    message: z.string(),
    timestamp: z.date(),
    acknowledged: z.boolean(),
    resolvedAt: z.date().optional(),
  })),
  lastUpdated: z.date(),
});

// Export validation schemas
export const analyticsValidationSchemas = {
  healthcareAnalyticsEvent: healthcareAnalyticsEventSchema,
  healthcareKPI: healthcareKPISchema,
  userJourney: userJourneySchema,
  servicePerformanceMetrics: servicePerformanceMetricsSchema,
  realTimeDashboard: realTimeDashboardSchema,
  abTestConfig: abTestConfigSchema,
  privacyCompliantAnalytics: privacyCompliantAnalyticsSchema,
  predictiveAnalytics: predictiveAnalyticsSchema,
  realTimeMetrics: realTimeMetricsSchema,
};

// Common query parameter schemas
export const analyticsQuerySchema = z.object({
  clinicId: z.string().optional(),
  doctorId: z.string().optional(),
  serviceId: z.string().optional(),
  timeRange: z.nativeEnum(TimeRangeKey).optional(),
  customStartDate: z.date().optional(),
  customEndDate: z.date().optional(),
  filters: z.record(z.any()).optional(),
  page: z.number().default(1),
  limit: z.number().default(50),
});

export const dashboardQuerySchema = z.object({
  dashboardType: z.nativeEnum(DashboardType).optional(),
  widgets: z.array(z.string()).optional(),
  timeRange: z.nativeEnum(TimeRangeKey).default('24h'),
  refreshInterval: z.number().optional(),
  filters: z.record(z.any()).optional(),
});

export const abTestQuerySchema = z.object({
  status: z.nativeEnum(ABTestStatus).optional(),
  targetMetric: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().default(1),
  limit: z.number().default(20),
});

// API Response schemas
export const analyticsApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional(),
    timestamp: z.date(),
    requestId: z.string().optional(),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
  }).optional(),
  meta: z.object({
    requestId: z.string(),
    timestamp: z.date(),
    executionTime: z.number(),
    recordCount: z.number(),
    cacheHit: z.boolean(),
  }).optional(),
});

export type HealthcareAnalyticsEvent = z.infer<typeof healthcareAnalyticsEventSchema>;
export type HealthcareKPI = z.infer<typeof healthcareKPISchema>;
export type UserJourney = z.infer<typeof userJourneySchema>;
export type ServicePerformanceMetrics = z.infer<typeof servicePerformanceMetricsSchema>;
export type RealTimeDashboard = z.infer<typeof realTimeDashboardSchema>;
export type ABTestConfig = z.infer<typeof abTestConfigSchema>;
export type PrivacyCompliantAnalytics = z.infer<typeof privacyCompliantAnalyticsSchema>;
export type PredictiveAnalytics = z.infer<typeof predictiveAnalyticsSchema>;
export type RealTimeMetrics = z.infer<typeof realTimeMetricsSchema>;
export type AnalyticsApiResponse = z.infer<typeof analyticsApiResponseSchema>;