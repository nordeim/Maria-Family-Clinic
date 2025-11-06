// API Client for Analytics & Performance Optimization
// Sub-Phase 9.8: Comprehensive API client for all analytics functionality

import { trpc } from '@/lib/trpc/client';
import { 
  ContactAnalyticsEvent,
  FormAnalytics,
  CustomerSatisfactionMetrics,
  PerformanceKPI,
  ABTestResult,
  PredictiveAnalytics,
  TimeRangeKey,
  ABTestConfig,
  AutomatedReport
} from '@/types/analytics';

// Base API response interface
interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

class AnalyticsAPIClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  // Analytics Events
  async trackEvent(event: ContactAnalyticsEvent): Promise<ApiResponse<{ eventId: string }>> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to track event:', error);
      return { success: false, error: 'Failed to track event' };
    }
  }

  // Form Analytics
  async getFormAnalytics(params: {
    formId?: string;
    timeRange?: TimeRangeKey;
    filters?: Record<string, any>;
  }): Promise<ApiResponse<FormAnalytics>> {
    try {
      const queryParams = new URLSearchParams();
      if (params.formId) queryParams.append('formId', params.formId);
      if (params.timeRange) queryParams.append('timeRange', params.timeRange);
      if (params.filters) {
        queryParams.append('filters', JSON.stringify(params.filters));
      }

      const response = await fetch(
        `${this.baseUrl}/analytics/forms?${queryParams.toString()}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get form analytics:', error);
      return { success: false, error: 'Failed to get form analytics' };
    }
  }

  // Customer Satisfaction
  async getCustomerSatisfaction(params: {
    clinicId?: string;
    timeRange?: TimeRangeKey;
  }): Promise<ApiResponse<CustomerSatisfactionMetrics>> {
    try {
      const queryParams = new URLSearchParams();
      if (params.clinicId) queryParams.append('clinicId', params.clinicId);
      if (params.timeRange) queryParams.append('timeRange', params.timeRange);

      const response = await fetch(
        `${this.baseUrl}/analytics/satisfaction?${queryParams.toString()}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get customer satisfaction:', error);
      return { success: false, error: 'Failed to get customer satisfaction' };
    }
  }

  // Performance KPIs
  async getPerformanceKPIs(params: {
    clinicId?: string;
    timeRange?: TimeRangeKey;
  }): Promise<ApiResponse<PerformanceKPI[]>> {
    try {
      const queryParams = new URLSearchParams();
      if (params.clinicId) queryParams.append('clinicId', params.clinicId);
      if (params.timeRange) queryParams.append('timeRange', params.timeRange);

      const response = await fetch(
        `${this.baseUrl}/analytics/performance-kpis?${queryParams.toString()}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get performance KPIs:', error);
      return { success: false, error: 'Failed to get performance KPIs' };
    }
  }

  // Predictive Analytics
  async getPredictiveInsights(params: {
    clinicId?: string;
    timeRange?: TimeRangeKey;
  }): Promise<ApiResponse<PredictiveAnalytics>> {
    try {
      const queryParams = new URLSearchParams();
      if (params.clinicId) queryParams.append('clinicId', params.clinicId);
      if (params.timeRange) queryParams.append('timeRange', params.timeRange);

      const response = await fetch(
        `${this.baseUrl}/analytics/predictive?${queryParams.toString()}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get predictive insights:', error);
      return { success: false, error: 'Failed to get predictive insights' };
    }
  }

  // A/B Testing
  async getABTests(): Promise<ApiResponse<ABTestConfig[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/ab-tests`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get A/B tests:', error);
      return { success: false, error: 'Failed to get A/B tests' };
    }
  }

  async createABTest(test: Partial<ABTestConfig>): Promise<ApiResponse<ABTestConfig>> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/ab-tests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(test),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to create A/B test:', error);
      return { success: false, error: 'Failed to create A/B test' };
    }
  }

  async getABTestResults(params: {
    testId: string;
    timeRange?: TimeRangeKey;
  }): Promise<ApiResponse<ABTestResult>> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('testId', params.testId);
      if (params.timeRange) queryParams.append('timeRange', params.timeRange);

      const response = await fetch(
        `${this.baseUrl}/analytics/ab-tests/${params.testId}/results?${queryParams.toString()}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get A/B test results:', error);
      return { success: false, error: 'Failed to get A/B test results' };
    }
  }

  // Dashboard Data
  async getDashboardData(params: {
    dashboardId?: string;
    widgets?: string[];
    timeRange?: TimeRangeKey;
    filters?: Record<string, any>;
  }): Promise<ApiResponse<any>> {
    try {
      const queryParams = new URLSearchParams();
      if (params.dashboardId) queryParams.append('dashboardId', params.dashboardId);
      if (params.timeRange) queryParams.append('timeRange', params.timeRange);
      if (params.widgets) {
        queryParams.append('widgets', params.widgets.join(','));
      }
      if (params.filters) {
        queryParams.append('filters', JSON.stringify(params.filters));
      }

      const response = await fetch(
        `${this.baseUrl}/analytics/dashboard?${queryParams.toString()}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get dashboard data:', error);
      return { success: false, error: 'Failed to get dashboard data' };
    }
  }

  // Optimization Recommendations
  async getOptimizationRecommendations(params: {
    clinicId?: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
    category?: string;
  }): Promise<ApiResponse<any>> {
    try {
      const queryParams = new URLSearchParams();
      if (params.clinicId) queryParams.append('clinicId', params.clinicId);
      if (params.priority) queryParams.append('priority', params.priority);
      if (params.category) queryParams.append('category', params.category);

      const response = await fetch(
        `${this.baseUrl}/analytics/optimization?${queryParams.toString()}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get optimization recommendations:', error);
      return { success: false, error: 'Failed to get optimization recommendations' };
    }
  }

  // Automated Reports
  async getAutomatedReports(): Promise<ApiResponse<AutomatedReport[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/reports`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get automated reports:', error);
      return { success: false, error: 'Failed to get automated reports' };
    }
  }

  async createAutomatedReport(report: Partial<AutomatedReport>): Promise<ApiResponse<AutomatedReport>> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to create automated report:', error);
      return { success: false, error: 'Failed to create automated report' };
    }
  }

  async generateReport(reportId: string): Promise<ApiResponse<{ downloadUrl: string }>> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/reports/${reportId}/generate`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to generate report:', error);
      return { success: false, error: 'Failed to generate report' };
    }
  }

  // Real-time Analytics
  async getRealtimeMetrics(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/realtime`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get realtime metrics:', error);
      return { success: false, error: 'Failed to get realtime metrics' };
    }
  }

  // Export Data
  async exportData(params: {
    type: 'events' | 'reports' | 'dashboard';
    timeRange: TimeRangeKey;
    format: 'csv' | 'json' | 'excel';
    filters?: Record<string, any>;
  }): Promise<ApiResponse<{ downloadUrl: string }>> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('type', params.type);
      queryParams.append('timeRange', params.timeRange);
      queryParams.append('format', params.format);
      if (params.filters) {
        queryParams.append('filters', JSON.stringify(params.filters));
      }

      const response = await fetch(
        `${this.baseUrl}/analytics/export?${queryParams.toString()}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to export data:', error);
      return { success: false, error: 'Failed to export data' };
    }
  }
}

// Create singleton instance
const analyticsClient = new AnalyticsAPIClient();

// Main analytics API object
export const analytics = {
  trackEvent: analyticsClient.trackEvent.bind(analyticsClient),
  getFormAnalytics: analyticsClient.getFormAnalytics.bind(analyticsClient),
  getCustomerSatisfaction: analyticsClient.getCustomerSatisfaction.bind(analyticsClient),
  getPerformanceKPIs: analyticsClient.getPerformanceKPIs.bind(analyticsClient),
  getPredictiveInsights: analyticsClient.getPredictiveInsights.bind(analyticsClient),
  getABTests: analyticsClient.getABTests.bind(analyticsClient),
  createABTest: analyticsClient.createABTest.bind(analyticsClient),
  getABTestResults: analyticsClient.getABTestResults.bind(analyticsClient),
  getDashboardData: analyticsClient.getDashboardData.bind(analyticsClient),
  getOptimizationRecommendations: analyticsClient.getOptimizationRecommendations.bind(analyticsClient),
  getAutomatedReports: analyticsClient.getAutomatedReports.bind(analyticsClient),
  createAutomatedReport: analyticsClient.createAutomatedReport.bind(analyticsClient),
  generateReport: analyticsClient.generateReport.bind(analyticsClient),
  getRealtimeMetrics: analyticsClient.getRealtimeMetrics.bind(analyticsClient),
  exportData: analyticsClient.exportData.bind(analyticsClient),
};

// Extend existing API client
export const api = {
  ...api, // This would be the existing API client
  analytics,
};

export default analyticsClient;