/**
 * Performance Testing Utilities
 * Common helper functions and validation utilities for performance testing
 */

import type {
  PerformanceTestConfiguration,
  LoadTestResults,
  RegressionTestResult,
  CrossBrowserTestResult,
  HealthcareWorkflowMetrics,
  PerformanceBudgetCompliance
} from '../types';

export class PerformanceTestValidator {
  /**
   * Validate performance test configuration
   */
  static validateConfig(config: PerformanceTestConfiguration): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate URLs
    if (config.urls && config.urls.length > 0) {
      config.urls.forEach(url => {
        try {
          new URL(url);
        } catch {
          errors.push(`Invalid URL: ${url}`);
        }
      });
    }

    // Validate concurrent users
    if (config.concurrentUsers !== undefined) {
      if (config.concurrentUsers < 1) {
        errors.push('Concurrent users must be at least 1');
      }
      if (config.concurrentUsers > 10000) {
        errors.push('Concurrent users cannot exceed 10,000');
      }
    }

    // Validate duration
    if (config.duration) {
      const durationRegex = /^(\d+)([smh])$/;
      if (!durationRegex.test(config.duration)) {
        errors.push('Duration must be in format: 30s, 5m, 2h');
      }
    }

    // Validate thresholds
    if (config.thresholds) {
      Object.entries(config.thresholds).forEach(([metric, threshold]) => {
        if (typeof threshold !== 'number' || threshold < 0) {
          errors.push(`Invalid threshold for ${metric}: ${threshold}`);
        }
      });
    }

    // Validate browser list
    if (config.browsers) {
      const validBrowsers = ['chrome', 'firefox', 'safari', 'edge', 'opera'];
      config.browsers.forEach(browser => {
        if (!validBrowsers.includes(browser.toLowerCase())) {
          errors.push(`Invalid browser: ${browser}. Must be one of: ${validBrowsers.join(', ')}`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate load test results
   */
  static validateLoadTestResults(results: LoadTestResults): { valid: boolean; warnings: string[] } {
    const warnings: string[] = [];

    // Check success rate
    if (results.successRate < 0.95) {
      warnings.push(`Low success rate: ${(results.successRate * 100).toFixed(1)}%`);
    }

    // Check response times
    if (results.responseTimeMetrics.avgResponseTime > 2000) {
      warnings.push('Average response time exceeds 2 seconds');
    }

    if (results.responseTimeMetrics.p95ResponseTime > 3000) {
      warnings.push('P95 response time exceeds 3 seconds');
    }

    if (results.responseTimeMetrics.p99ResponseTime > 5000) {
      warnings.push('P99 response time exceeds 5 seconds');
    }

    // Check error rate
    if (results.errorAnalysis.errorRate > 0.01) {
      warnings.push(`High error rate: ${(results.errorAnalysis.errorRate * 100).toFixed(2)}%`);
    }

    // Check resource utilization
    results.resourceUtilization.forEach(resource => {
      if (resource.cpuUtilization > 80) {
        warnings.push(`High CPU utilization on ${resource.resourceName}: ${resource.cpuUtilization}%`);
      }
      if (resource.memoryUtilization > 80) {
        warnings.push(`High memory utilization on ${resource.resourceName}: ${resource.memoryUtilization}%`);
      }
    });

    return {
      valid: warnings.length === 0,
      warnings
    };
  }

  /**
   * Validate regression test results
   */
  static validateRegressionTestResults(results: RegressionTestResult[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    results.forEach(result => {
      // Check Lighthouse scores
      if (result.lighthouseMetrics.performanceScore < 0.7) {
        errors.push(`${result.url}: Performance score too low (${result.lighthouseMetrics.performanceScore})`);
      }

      if (result.lighthouseMetrics.firstContentfulPaint > 3000) {
        errors.push(`${result.url}: First Contentful Paint too slow (${result.lighthouseMetrics.firstContentfulPaint}ms)`);
      }

      if (result.lighthouseMetrics.largestContentfulPaint > 4000) {
        errors.push(`${result.url}: Largest Contentful Paint too slow (${result.lighthouseMetrics.largestContentfulPaint}ms)`);
      }

      if (result.lighthouseMetrics.firstInputDelay > 200) {
        errors.push(`${result.url}: First Input Delay too high (${result.lighthouseMetrics.firstInputDelay}ms)`);
      }

      if (result.lighthouseMetrics.cumulativeLayoutShift > 0.2) {
        errors.push(`${result.url}: Cumulative Layout Shift too high (${result.lighthouseMetrics.cumulativeLayoutShift})`);
      }

      // Check bundle size
      if (result.bundleSize > 1024 * 1024 * 2) { // 2MB
        errors.push(`${result.url}: Bundle size too large (${result.bundleSize} bytes)`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate cross-browser test results
   */
  static validateCrossBrowserResults(results: CrossBrowserTestResult): { valid: boolean; warnings: string[] } {
    const warnings: string[] = [];

    const browserResults = results.browserResults;
    const browsers = Object.keys(browserResults);

    // Check consistency
    if (browsers.length < 2) {
      warnings.push('Only one browser tested - cannot assess cross-browser consistency');
    }

    // Check performance variance between browsers
    const scores = browsers.map(browser => browserResults[browser].lighthouseMetrics.performanceScore);
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);

    if (maxScore - minScore > 0.2) {
      warnings.push(`Significant performance variance between browsers: ${(maxScore - minScore).toFixed(2)}`);
    }

    // Check individual browser performance
    browsers.forEach(browser => {
      const browserResult = browserResults[browser];
      if (browserResult.lighthouseMetrics.performanceScore < 0.6) {
        warnings.push(`${browser}: Performance score too low (${browserResult.lighthouseMetrics.performanceScore})`);
      }
    });

    return {
      valid: warnings.length === 0,
      warnings
    };
  }

  /**
   * Validate healthcare workflow metrics
   */
  static validateHealthcareMetrics(metrics: HealthcareWorkflowMetrics): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check PDPA compliance
    if (metrics.pdpaCompliance?.status !== 'compliant') {
      errors.push(`PDPA compliance issue: ${metrics.pdpaCompliance?.status}`);
    }

    // Check workflow completion times
    Object.entries(metrics.workflowPerformance || {}).forEach(([workflow, perf]) => {
      if (perf.avgCompletionTime > 30000) { // 30 seconds
        errors.push(`${workflow}: Average completion time too high (${perf.avgCompletionTime}ms)`);
      }

      if (perf.successRate < 0.95) {
        errors.push(`${workflow}: Success rate too low (${(perf.successRate * 100).toFixed(1)}%)`);
      }

      if (perf.errorRate > 0.05) {
        errors.push(`${workflow}: Error rate too high (${(perf.errorRate * 100).toFixed(2)}%)`);
      }
    });

    // Check security metrics
    if (metrics.securityMetrics) {
      if (metrics.securityMetrics.authenticationLatency > 2000) {
        errors.push(`Authentication latency too high: ${metrics.securityMetrics.authenticationLatency}ms`);
      }

      if (metrics.securityMetrics.authorizationLatency > 1500) {
        errors.push(`Authorization latency too high: ${metrics.securityMetrics.authorizationLatency}ms`);
      }

      if (metrics.securityMetrics.encryptionLatency > 1000) {
        errors.push(`Encryption latency too high: ${metrics.securityMetrics.encryptionLatency}ms`);
      }
    }

    // Check emergency response
    if (metrics.emergencyResponse) {
      if (metrics.emergencyResponse.averageResponseTime > 500) {
        errors.push(`Emergency response time too high: ${metrics.emergencyResponse.averageResponseTime}ms`);
      }

      if (metrics.emergencyResponse.successRate < 0.99) {
        errors.push(`Emergency response success rate too low: ${metrics.emergencyResponse.successRate}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate performance budget compliance
   */
  static validateBudgetCompliance(compliance: PerformanceBudgetCompliance): { valid: boolean; violations: string[] } {
    const violations: string[] = [];

    Object.entries(compliance.budgetCompliance || {}).forEach(([budgetName, budgetCompliance]) => {
      if (budgetCompliance.status === 'failing') {
        violations.push(`${budgetName}: Budget violation - ${budgetCompliance.current} > ${budgetCompliance.limit}`);
      } else if (budgetCompliance.status === 'warning') {
        violations.push(`${budgetName}: Budget warning - approaching limit (${budgetCompliance.current}/${budgetCompliance.limit})`);
      }
    });

    return {
      valid: violations.length === 0,
      violations
    };
  }
}

export class PerformanceTestFormatter {
  /**
   * Format bytes to human readable format
   */
  static formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  /**
   * Format duration in milliseconds to human readable format
   */
  static formatDuration(ms: number): string {
    if (ms < 1000) {
      return `${ms}ms`;
    } else if (ms < 60000) {
      return `${(ms / 1000).toFixed(1)}s`;
    } else if (ms < 3600000) {
      return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
    } else {
      return `${Math.floor(ms / 3600000)}h ${Math.floor((ms % 3600000) / 60000)}m`;
    }
  }

  /**
   * Format percentage
   */
  static formatPercentage(value: number, decimals: number = 1): string {
    return `${(value * 100).toFixed(decimals)}%`;
  }

  /**
   * Format score (0-100)
   */
  static formatScore(score: number, decimals: number = 1): string {
    return `${(score * 100).toFixed(decimals)}`;
  }
}

export class PerformanceTestCalculator {
  /**
   * Calculate percentage change between two values
   */
  static calculatePercentageChange(oldValue: number, newValue: number): number {
    if (oldValue === 0) return newValue > 0 ? 100 : 0;
    return ((newValue - oldValue) / oldValue) * 100;
  }

  /**
   * Calculate 95th percentile from array of values
   */
  static calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index];
  }

  /**
   * Calculate average response time from time series data
   */
  static calculateAverageResponseTime(timeSeries: Array<{ responseTime: number; count: number }>): number {
    if (timeSeries.length === 0) return 0;

    let totalResponseTime = 0;
    let totalRequests = 0;

    timeSeries.forEach(point => {
      totalResponseTime += point.responseTime * point.count;
      totalRequests += point.count;
    });

    return totalRequests > 0 ? totalResponseTime / totalRequests : 0;
  }

  /**
   * Calculate throughput (requests per second)
   */
  static calculateThroughput(totalRequests: number, durationMs: number): number {
    return (totalRequests / durationMs) * 1000;
  }

  /**
   * Calculate error rate
   */
  static calculateErrorRate(failedRequests: number, totalRequests: number): number {
    return totalRequests > 0 ? failedRequests / totalRequests : 0;
  }

  /**
   * Calculate performance score from multiple metrics
   */
  static calculatePerformanceScore(metrics: {
    responseTime: number;
    throughput: number;
    errorRate: number;
    resourceUtilization: number;
  }): number {
    // Normalize metrics to 0-1 scale
    const responseTimeScore = Math.max(0, 1 - (metrics.responseTime / 3000)); // 3s baseline
    const throughputScore = Math.min(1, metrics.throughput / 50); // 50 RPS baseline
    const errorScore = Math.max(0, 1 - (metrics.errorRate * 10)); // 10% error baseline
    const resourceScore = Math.max(0, 1 - (metrics.resourceUtilization / 80)); // 80% utilization baseline

    // Weighted average
    return (responseTimeScore * 0.3 + throughputScore * 0.2 + errorScore * 0.3 + resourceScore * 0.2);
  }

  /**
   * Calculate cross-browser consistency score
   */
  static calculateCrossBrowserConsistency(browserResults: Record<string, any>): number {
    const browsers = Object.keys(browserResults);
    if (browsers.length < 2) return 1;

    const scores = browsers.map(browser => browserResults[browser].lighthouseMetrics.performanceScore);
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) / scores.length;

    // Convert variance to consistency score (lower variance = higher consistency)
    return Math.max(0, 1 - (variance / 0.1)); // Normalize variance
  }
}

export class PerformanceTestConstants {
  // Core Web Vitals thresholds
  static readonly CORE_WEB_VITALS = {
    LCP_GOOD: 2500, // milliseconds
    LCP_POOR: 4000,
    FID_GOOD: 100, // milliseconds
    FID_POOR: 300,
    CLS_GOOD: 0.1,
    CLS_POOR: 0.25
  };

  // Performance budget limits
  static readonly PERFORMANCE_BUDGETS = {
    BUNDLE_SIZE: 1024 * 1024 * 2, // 2MB
    PAGE_LOAD_TIME: 3000, // 3 seconds
    FIRST_CONTENTFUL_PAINT: 2000, // 2 seconds
    LARGEST_CONTENTFUL_PAINT: 4000, // 4 seconds
    FIRST_INPUT_DELAY: 200, // 200ms
    CUMULATIVE_LAYOUT_SHIFT: 0.2,
    TIME_TO_INTERACTIVE: 5000, // 5 seconds
    TOTAL_BLOCKING_TIME: 300 // 300ms
  };

  // Load test configurations
  static readonly LOAD_TEST_CONFIGS = {
    LIGHT: { users: 50, duration: '5m' },
    MODERATE: { users: 200, duration: '10m' },
    HEAVY: { users: 500, duration: '30m' },
    STRESS: { users: 1000, duration: '60m' }
  };

  // Healthcare workflow completion targets
  static readonly HEALTHCARE_TARGETS = {
    PATIENT_JOURNEY: 15000, // 15 seconds
    APPOINTMENT_BOOKING: 8000, // 8 seconds
    MEDICAL_RECORDS: 5000, // 5 seconds
    EMERGENCY_ACCESS: 300, // 300ms
    TELEHEALTH: 10000 // 10 seconds
  };

  // Alert thresholds
  static readonly ALERT_THRESHOLDS = {
    HIGH_RESPONSE_TIME: 3000, // 3 seconds
    CRITICAL_RESPONSE_TIME: 5000, // 5 seconds
    HIGH_ERROR_RATE: 0.05, // 5%
    LOW_THROUGHPUT: 10, // 10 RPS
    BUDGET_VIOLATION: 0,
    PDPA_COMPLIANCE_FAILURE: 0
  };
}