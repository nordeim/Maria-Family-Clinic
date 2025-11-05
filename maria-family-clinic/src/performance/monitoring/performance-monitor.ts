/**
 * Healthcare Performance Monitoring Service
 * Sub-Phase 10.6: Real-Time Performance Monitoring for My Family Clinic
 * Monitors application performance, healthcare workflows, and system capacity
 */

import { 
  PerformanceMetrics, 
  PerformanceMetricType, 
  HealthcareWorkflowMetrics,
  HealthcareWorkflowType,
  WorkflowStatus,
  CapacityMetrics,
  ResourceType,
  HealthcarePeriod,
  MonitoringSeverity,
  MonitoringCategory
} from './types';

// =============================================================================
// PERFORMANCE MONITORING CONFIGURATION
// =============================================================================

const PERFORMANCE_THRESHOLDS = {
  [PerformanceMetricType.PAGE_LOAD_TIME]: { warning: 2000, critical: 5000 }, // ms
  [PerformanceMetricType.API_RESPONSE_TIME]: { warning: 500, critical: 2000 }, // ms
  [PerformanceMetricType.CORE_WEB_VITALS_LCP]: { warning: 2500, critical: 4000 }, // ms
  [PerformanceMetricType.CORE_WEB_VITALS_FID]: { warning: 100, critical: 300 }, // ms
  [PerformanceMetricType.CORE_WEB_VITALS_CLS]: { warning: 0.1, critical: 0.25 }, // score
  [PerformanceMetricType.DATABASE_QUERY_TIME]: { warning: 100, critical: 500 }, // ms
  [PerformanceMetricType.CONCURRENT_USERS]: { warning: 80, critical: 95 }, // percentage of max
  [PerformanceMetricType.MEMORY_USAGE]: { warning: 75, critical: 90 }, // percentage
  [PerformanceMetricType.CPU_USAGE]: { warning: 70, critical: 85 }, // percentage
  [PerformanceMetricType.ERROR_RATE]: { warning: 1, critical: 5 }, // percentage
  [PerformanceMetricType.SUCCESS_RATE]: { warning: 95, critical: 90 } // percentage
};

const HEALTHCARE_WORKFLOW_TARGETS = {
  [HealthcareWorkflowType.CLINIC_SEARCH]: { maxDuration: 3000, minSuccessRate: 95 },
  [HealthcareWorkflowType.DOCTOR_SEARCH]: { maxDuration: 2500, minSuccessRate: 95 },
  [HealthcareWorkflowType.APPOINTMENT_BOOKING]: { maxDuration: 10000, minSuccessRate: 90 },
  [HealthcareWorkflowType.HEALTHIER_SG_ENROLLMENT]: { maxDuration: 300000, minSuccessRate: 85 },
  [HealthcareWorkflowType.CONTACT_ENQUIRY]: { maxDuration: 5000, minSuccessRate: 92 },
  [HealthcareWorkflowType.PATIENT_PROFILE_CREATION]: { maxDuration: 120000, minSuccessRate: 90 },
  [HealthcareWorkflowType.MEDICAL_HISTORY_ENTRY]: { maxDuration: 180000, minSuccessRate: 88 },
  [HealthcareWorkflowType.INSURANCE_VERIFICATION]: { maxDuration: 15000, minSuccessRate: 85 }
};

// =============================================================================
// PERFORMANCE MONITORING CLASS
// =============================================================================

export class HealthcarePerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private workflows: Map<string, HealthcareWorkflowMetrics> = new Map();
  private capacityMetrics: CapacityMetrics[] = [];
  private activePageLoads: Map<string, number> = new Map();
  private userJourneyMetrics: Map<string, { startTime: number; steps: string[] }> = new Map();
  private databasePerformance: { queries: Array<{ startTime: number; endTime: number; query: string }> } = { queries: [] };

  constructor() {
    this.initializeCoreWebVitals();
    this.startPeriodicMonitoring();
  }

  // =============================================================================
  // CORE WEB VITALS MONITORING
  // =============================================================================

  private initializeCoreWebVitals(): void {
    if (typeof window !== 'undefined') {
      // Monitor Largest Contentful Paint (LCP)
      this.observeWebVital('largest-contentful-paint', (entries) => {
        const lastEntry = entries[entries.length - 1];
        const lcp = lastEntry.startTime;
        
        this.recordPerformanceMetric({
          timestamp: new Date(),
          metricType: PerformanceMetricType.CORE_WEB_VITALS_LCP,
          value: lcp,
          unit: 'ms',
          threshold: PERFORMANCE_THRESHOLDS[PerformanceMetricType.CORE_WEB_VITALS_LCP]
        });
      });

      // Monitor First Input Delay (FID)
      this.observeWebVital('first-input', (entries) => {
        const firstEntry = entries[0];
        const fid = firstEntry.processingStart - firstEntry.startTime;
        
        this.recordPerformanceMetric({
          timestamp: new Date(),
          metricType: PerformanceMetricType.CORE_WEB_VITALS_FID,
          value: fid,
          unit: 'ms',
          threshold: PERFORMANCE_THRESHOLDS[PerformanceMetricType.CORE_WEB_VITALS_FID]
        });
      });

      // Monitor Cumulative Layout Shift (CLS)
      this.observeWebVital('layout-shift', (entries) => {
        let clsValue = 0;
        for (const entry of entries) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        
        this.recordPerformanceMetric({
          timestamp: new Date(),
          metricType: PerformanceMetricType.CORE_WEB_VITALS_CLS,
          value: clsValue,
          unit: 'score',
          threshold: PERFORMANCE_THRESHOLDS[PerformanceMetricType.CORE_WEB_VITALS_CLS]
        });
      });
    }
  }

  private observeWebVital(metricName: string, callback: (entries: any[]) => void): void {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          callback(list.getEntries());
        });
        observer.observe({ entryTypes: [metricName] });
      } catch (error) {
        console.warn(`Failed to observe ${metricName}:`, error);
      }
    }
  }

  // =============================================================================
  // PERFORMANCE METRICS RECORDING
  // =============================================================================

  /**
   * Record page load performance
   */
  recordPageLoad(pageRoute: string, loadTime: number, additionalMetrics?: Record<string, number>): void {
    this.recordPerformanceMetric({
      timestamp: new Date(),
      metricType: PerformanceMetricType.PAGE_LOAD_TIME,
      value: loadTime,
      unit: 'ms',
      threshold: PERFORMANCE_THRESHOLDS[PerformanceMetricType.PAGE_LOAD_TIME],
      pageRoute
    });

    // Record additional page-specific metrics
    if (additionalMetrics) {
      Object.entries(additionalMetrics).forEach(([key, value]) => {
        const metricType = this.getMetricTypeFromString(key);
        if (metricType) {
          this.recordPerformanceMetric({
            timestamp: new Date(),
            metricType,
            value,
            unit: this.getUnitFromMetricType(metricType),
            threshold: PERFORMANCE_THRESHOLDS[metricType],
            pageRoute
          });
        }
      });
    }

    this.checkPerformanceThreshold(PerformanceMetricType.PAGE_LOAD_TIME, loadTime, { pageRoute });
  }

  /**
   * Record API response time
   */
  recordApiResponse(apiEndpoint: string, responseTime: number, statusCode: number = 200, userJourney?: string): void {
    this.recordPerformanceMetric({
      timestamp: new Date(),
      metricType: PerformanceMetricType.API_RESPONSE_TIME,
      value: responseTime,
      unit: 'ms',
      threshold: PERFORMANCE_THRESHOLDS[PerformanceMetricType.API_RESPONSE_TIME],
      apiEndpoint,
      userJourney
    });

    // Record error rate if status code indicates error
    if (statusCode >= 400) {
      this.recordErrorRate(1);
    } else {
      this.recordSuccessRate(1);
    }

    this.checkPerformanceThreshold(PerformanceMetricType.API_RESPONSE_TIME, responseTime, { apiEndpoint });
  }

  /**
   * Record database query performance
   */
  recordDatabaseQuery(query: string, executionTime: number, queryType: string = 'SELECT'): void {
    this.databasePerformance.queries.push({
      startTime: Date.now() - executionTime,
      endTime: Date.now(),
      query
    });

    this.recordPerformanceMetric({
      timestamp: new Date(),
      metricType: PerformanceMetricType.DATABASE_QUERY_TIME,
      value: executionTime,
      unit: 'ms',
      threshold: PERFORMANCE_THRESHOLDS[PerformanceMetricType.DATABASE_QUERY_TIME]
    });

    this.checkPerformanceThreshold(PerformanceMetricType.DATABASE_QUERY_TIME, executionTime, { queryType });
  }

  /**
   * Record user journey performance
   */
  recordUserJourney(journeyId: string, steps: string[], startTime: number, endTime?: number): void {
    const duration = endTime ? endTime - startTime : Date.now() - startTime;
    const successRate = endTime ? 100 : 0;
    
    // Determine workflow type based on steps
    const workflowType = this.inferWorkflowType(steps);
    const target = HEALTHCARE_WORKFLOW_TARGETS[workflowType];

    if (target) {
      const workflowMetrics: HealthcareWorkflowMetrics = {
        workflowId: journeyId,
        workflowType,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : undefined,
        duration,
        status: endTime ? WorkflowStatus.COMPLETED : WorkflowStatus.IN_PROGRESS,
        steps: steps.map((step, index) => ({
          stepId: `${journeyId}_step_${index}`,
          stepName: step,
          startTime: new Date(startTime + (index * 1000)), // Simplified timing
          endTime: new Date(startTime + ((index + 1) * 1000)),
          duration: 1000,
          status: WorkflowStatus.COMPLETED,
          metrics: {}
        })),
        successRate,
        dropOffPoints: endTime ? [] : [steps[steps.length - 1]],
        userExperienceScore: Math.max(0, 100 - (duration / target.maxDuration * 100))
      };

      this.workflows.set(journeyId, workflowMetrics);
      this.checkWorkflowPerformance(workflowMetrics);
    }
  }

  /**
   * Record system capacity metrics
   */
  recordCapacityMetrics(resourceType: ResourceType, currentUsage: number, maximumCapacity: number, healthcarePeriod: HealthcarePeriod = HealthcarePeriod.REGULAR_HOURS): void {
    const utilizationPercentage = (currentUsage / maximumCapacity) * 100;
    const trendDirection = this.calculateTrendDirection(resourceType, utilizationPercentage);

    const capacityMetric: CapacityMetrics = {
      timestamp: new Date(),
      resourceType,
      currentUsage,
      maximumCapacity,
      utilizationPercentage,
      trendDirection,
      projectedCapacityAtPeak: this.projectPeakCapacity(resourceType, utilizationPercentage),
      healthcarePeriod,
      recommendations: this.generateCapacityRecommendations(resourceType, utilizationPercentage)
    };

    this.capacityMetrics.push(capacityMetric);
    this.checkCapacityThreshold(resourceType, utilizationPercentage);

    // Clean up old metrics (keep last 1000 entries)
    if (this.capacityMetrics.length > 1000) {
      this.capacityMetrics = this.capacityMetrics.slice(-1000);
    }
  }

  // =============================================================================
  // HEALTHCARE WORKFLOW MONITORING
  // =============================================================================

  /**
   * Start monitoring a healthcare workflow
   */
  startHealthcareWorkflow(
    workflowType: HealthcareWorkflowType, 
    userId?: string, 
    clinicId?: string, 
    doctorId?: string
  ): string {
    const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const workflowMetrics: HealthcareWorkflowMetrics = {
      workflowId,
      workflowType,
      startTime: new Date(),
      status: WorkflowStatus.IN_PROGRESS,
      steps: [],
      successRate: 0,
      dropOffPoints: [],
      userExperienceScore: 100,
      userId,
      clinicId,
      doctorId
    };

    this.workflows.set(workflowId, workflowMetrics);
    return workflowId;
  }

  /**
   * Complete a healthcare workflow step
   */
  completeWorkflowStep(workflowId: string, stepName: string, stepDuration: number = 0, status: WorkflowStatus = WorkflowStatus.COMPLETED): void {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return;

    const stepId = `step_${workflow.steps.length + 1}`;
    const stepStartTime = new Date(workflow.startTime.getTime() + (workflow.steps.length * 1000));

    const step = {
      stepId,
      stepName,
      startTime: stepStartTime,
      endTime: new Date(stepStartTime.getTime() + stepDuration),
      duration: stepDuration,
      status,
      metrics: {}
    };

    workflow.steps.push(step);

    // Update workflow metrics
    if (status === WorkflowStatus.FAILED) {
      workflow.status = WorkflowStatus.FAILED;
      workflow.dropOffPoints.push(stepName);
    } else if (workflow.steps.length > 0 && workflow.steps.every(s => s.status === WorkflowStatus.COMPLETED)) {
      const totalDuration = Date.now() - workflow.startTime.getTime();
      const target = HEALTHCARE_WORKFLOW_TARGETS[workflow.workflowType];
      
      workflow.duration = totalDuration;
      workflow.status = WorkflowStatus.COMPLETED;
      workflow.successRate = 100;
      workflow.userExperienceScore = Math.max(0, 100 - (totalDuration / (target?.maxDuration || 60000) * 100));
    }

    this.checkWorkflowPerformance(workflow);
  }

  /**
   * Complete a healthcare workflow
   */
  completeHealthcareWorkflow(workflowId: string, success: boolean = true, finalMetrics?: Record<string, any>): void {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return;

    workflow.endTime = new Date();
    workflow.duration = workflow.endTime.getTime() - workflow.startTime.getTime();
    workflow.status = success ? WorkflowStatus.COMPLETED : WorkflowStatus.FAILED;
    workflow.successRate = success ? 100 : 0;

    if (finalMetrics) {
      workflow.steps.forEach(step => {
        step.metrics = { ...step.metrics, ...finalMetrics };
      });
    }

    // Store workflow data for analytics
    this.storeWorkflowAnalytics(workflow);
  }

  // =============================================================================
  // SYSTEM CAPACITY MONITORING
  // =============================================================================

  /**
   * Monitor concurrent users for healthcare peak periods
   */
  startConcurrentUserMonitoring(): void {
    setInterval(() => {
      if (typeof window !== 'undefined') {
        const currentUsers = this.getCurrentConcurrentUsers();
        const maxUsers = this.getMaxConcurrentUsers();
        const healthcarePeriod = this.determineHealthcarePeriod();
        
        this.recordCapacityMetrics(
          ResourceType.CONCURRENT_USERS,
          currentUsers,
          maxUsers,
          healthcarePeriod
        );
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Monitor database performance under healthcare consultation loads
   */
  startDatabasePerformanceMonitoring(): void {
    setInterval(() => {
      const dbMetrics = this.getDatabaseMetrics();
      this.recordCapacityMetrics(
        ResourceType.DATABASE_CONNECTIONS,
        dbMetrics.activeConnections,
        dbMetrics.maxConnections,
        this.determineHealthcarePeriod()
      );
    }, 60000); // Check every minute
  }

  /**
   * Monitor API response times during high-traffic healthcare periods
   */
  startApiPerformanceMonitoring(): void {
    setInterval(() => {
      const apiMetrics = this.getApiMetrics();
      this.recordCapacityMetrics(
        ResourceType.API_REQUESTS_PER_SECOND,
        apiMetrics.requestsPerSecond,
        apiMetrics.maxRequestsPerSecond,
        this.determineHealthcarePeriod()
      );
    }, 30000); // Check every 30 seconds
  }

  // =============================================================================
  // PRIVATE HELPER METHODS
  // =============================================================================

  private recordPerformanceMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);
    
    // Clean up old metrics (keep last 5000 entries)
    if (this.metrics.length > 5000) {
      this.metrics = this.metrics.slice(-5000);
    }
  }

  private recordErrorRate(errorCount: number): void {
    // Calculate error rate based on recent requests
    const recentRequests = this.metrics.filter(m => 
      m.metricType === PerformanceMetricType.API_RESPONSE_TIME && 
      m.timestamp > new Date(Date.now() - 60000) // Last minute
    ).length;
    
    const errorRate = recentRequests > 0 ? (errorCount / recentRequests) * 100 : 0;
    
    this.recordPerformanceMetric({
      timestamp: new Date(),
      metricType: PerformanceMetricType.ERROR_RATE,
      value: errorRate,
      unit: '%',
      threshold: PERFORMANCE_THRESHOLDS[PerformanceMetricType.ERROR_RATE]
    });
  }

  private recordSuccessRate(successCount: number): void {
    // Similar to error rate but for successful requests
    const recentRequests = this.metrics.filter(m => 
      m.metricType === PerformanceMetricType.API_RESPONSE_TIME && 
      m.timestamp > new Date(Date.now() - 60000)
    ).length;
    
    const successRate = recentRequests > 0 ? (successCount / recentRequests) * 100 : 100;
    
    this.recordPerformanceMetric({
      timestamp: new Date(),
      metricType: PerformanceMetricType.SUCCESS_RATE,
      value: successRate,
      unit: '%',
      threshold: PERFORMANCE_THRESHOLDS[PerformanceMetricType.SUCCESS_RATE]
    });
  }

  private checkPerformanceThreshold(metricType: PerformanceMetricType, value: number, context?: Record<string, any>): void {
    const threshold = PERFORMANCE_THRESHOLDS[metricType];
    if (!threshold) return;

    if (value >= threshold.critical) {
      this.triggerCriticalAlert(metricType, value, threshold.critical, context);
    } else if (value >= threshold.warning) {
      this.triggerWarningAlert(metricType, value, threshold.warning, context);
    }
  }

  private checkWorkflowPerformance(workflow: HealthcareWorkflowMetrics): void {
    const target = HEALTHCARE_WORKFLOW_TARGETS[workflow.workflowType];
    if (!target) return;

    if (workflow.duration && workflow.duration > target.maxDuration) {
      this.triggerWorkflowPerformanceAlert(workflow, 'duration', workflow.duration, target.maxDuration);
    }

    if (workflow.successRate < target.minSuccessRate) {
      this.triggerWorkflowPerformanceAlert(workflow, 'successRate', workflow.successRate, target.minSuccessRate);
    }
  }

  private checkCapacityThreshold(resourceType: ResourceType, utilizationPercentage: number): void {
    const threshold = PERFORMANCE_THRESHOLDS[PerformanceMetricType.CONCURRENT_USERS];
    if (!threshold) return;

    if (utilizationPercentage >= threshold.critical) {
      this.triggerCapacityAlert(resourceType, utilizationPercentage, threshold.critical, 'critical');
    } else if (utilizationPercentage >= threshold.warning) {
      this.triggerCapacityAlert(resourceType, utilizationPercentage, threshold.warning, 'warning');
    }
  }

  private triggerCriticalAlert(metricType: PerformanceMetricType, value: number, threshold: number, context?: Record<string, any>): void {
    console.error(`[CRITICAL] ${metricType}: ${value} (threshold: ${threshold})`, context);
    // In a real implementation, this would trigger alerts via the alerting system
  }

  private triggerWarningAlert(metricType: PerformanceMetricType, value: number, threshold: number, context?: Record<string, any>): void {
    console.warn(`[WARNING] ${metricType}: ${value} (threshold: ${threshold})`, context);
  }

  private triggerWorkflowPerformanceAlert(
    workflow: HealthcareWorkflowMetrics, 
    metric: string, 
    value: number, 
    threshold: number
  ): void {
    console.warn(`[WORKFLOW ALERT] ${workflow.workflowType} ${metric}: ${value} (threshold: ${threshold})`, {
      workflowId: workflow.workflowId,
      userJourney: workflow.userId
    });
  }

  private triggerCapacityAlert(resourceType: ResourceType, utilization: number, threshold: number, severity: 'warning' | 'critical'): void {
    console[severity === 'critical' ? 'error' : 'warn'](
      `[CAPACITY ${severity.toUpperCase()}] ${resourceType}: ${utilization.toFixed(1)}% (threshold: ${threshold}%)`
    );
  }

  private inferWorkflowType(steps: string[]): HealthcareWorkflowType {
    const stepString = steps.join(' ').toLowerCase();
    
    if (stepString.includes('clinic') || stepString.includes('search')) {
      return HealthcareWorkflowType.CLINIC_SEARCH;
    }
    if (stepString.includes('doctor') || stepString.includes('appointment')) {
      return HealthcareWorkflowType.APPOINTMENT_BOOKING;
    }
    if (stepString.includes('healthier') || stepString.includes('enrollment')) {
      return HealthcareWorkflowType.HEALTHIER_SG_ENROLLMENT;
    }
    if (stepString.includes('contact') || stepString.includes('enquiry')) {
      return HealthcareWorkflowType.CONTACT_ENQUIRY;
    }
    
    return HealthcareWorkflowType.CLINIC_SEARCH; // Default
  }

  private calculateTrendDirection(resourceType: ResourceType, currentUtilization: number): 'increasing' | 'decreasing' | 'stable' {
    const recentMetrics = this.capacityMetrics
      .filter(m => m.resourceType === resourceType)
      .slice(-5); // Last 5 measurements

    if (recentMetrics.length < 2) return 'stable';

    const trend = recentMetrics[recentMetrics.length - 1].utilizationPercentage - recentMetrics[0].utilizationPercentage;
    
    if (trend > 5) return 'increasing';
    if (trend < -5) return 'decreasing';
    return 'stable';
  }

  private projectPeakCapacity(resourceType: ResourceType, currentUtilization: number): number | undefined {
    if (currentUtilization < 50) return undefined; // No projection needed for low utilization
    
    const trend = this.calculateTrendDirection(resourceType, currentUtilization);
    if (trend === 'stable') return currentUtilization;
    
    // Simple projection based on trend
    const projection = trend === 'increasing' ? currentUtilization * 1.2 : currentUtilization * 0.8;
    return Math.min(100, Math.max(0, projection));
  }

  private generateCapacityRecommendations(resourceType: ResourceType, utilization: number): string[] {
    const recommendations: string[] = [];
    
    if (utilization > 90) {
      recommendations.push('Immediate capacity expansion required');
      recommendations.push('Consider implementing load balancing');
    } else if (utilization > 75) {
      recommendations.push('Monitor closely for capacity planning');
      recommendations.push('Consider scaling resources');
    }
    
    if (resourceType === ResourceType.CONCURRENT_USERS) {
      recommendations.push('Implement user session management');
      recommendations.push('Consider CDN for static assets');
    }
    
    return recommendations;
  }

  private determineHealthcarePeriod(): HealthcarePeriod {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    
    // Weekend
    if (day === 0 || day === 6) return HealthcarePeriod.WEEKEND;
    
    // Regular hours: 8 AM - 6 PM on weekdays
    if (hour >= 8 && hour <= 18) return HealthcarePeriod.REGULAR_HOURS;
    
    // Peak hours: 7-9 AM and 5-7 PM on weekdays
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) return HealthcarePeriod.PEAK_HOURS;
    
    // Emergency hours: other times
    return HealthcarePeriod.EMERGENCY;
  }

  private getCurrentConcurrentUsers(): number {
    // In a real implementation, this would get actual concurrent user count
    // For now, return a mock value based on time of day
    const hour = new Date().getHours();
    return Math.floor(Math.random() * 500) + (hour >= 8 && hour <= 18 ? 200 : 50);
  }

  private getMaxConcurrentUsers(): number {
    // Maximum expected concurrent users for the platform
    return 1000;
  }

  private getDatabaseMetrics(): { activeConnections: number; maxConnections: number } {
    // Mock database metrics - in real implementation, query actual database
    return {
      activeConnections: Math.floor(Math.random() * 50) + 10,
      maxConnections: 100
    };
  }

  private getApiMetrics(): { requestsPerSecond: number; maxRequestsPerSecond: number } {
    // Mock API metrics - in real implementation, get from monitoring service
    return {
      requestsPerSecond: Math.floor(Math.random() * 100) + 20,
      maxRequestsPerSecond: 500
    };
  }

  private getMetricTypeFromString(key: string): PerformanceMetricType | null {
    const mapping: Record<string, PerformanceMetricType> = {
      'loadTime': PerformanceMetricType.PAGE_LOAD_TIME,
      'responseTime': PerformanceMetricType.API_RESPONSE_TIME,
      'lcp': PerformanceMetricType.CORE_WEB_VITALS_LCP,
      'fid': PerformanceMetricType.CORE_WEB_VITALS_FID,
      'cls': PerformanceMetricType.CORE_WEB_VITALS_CLS,
      'queryTime': PerformanceMetricType.DATABASE_QUERY_TIME
    };
    
    return mapping[key] || null;
  }

  private getUnitFromMetricType(metricType: PerformanceMetricType): string {
    const units: Record<PerformanceMetricType, string> = {
      [PerformanceMetricType.PAGE_LOAD_TIME]: 'ms',
      [PerformanceMetricType.API_RESPONSE_TIME]: 'ms',
      [PerformanceMetricType.CORE_WEB_VITALS_LCP]: 'ms',
      [PerformanceMetricType.CORE_WEB_VITALS_FID]: 'ms',
      [PerformanceMetricType.CORE_WEB_VITALS_CLS]: 'score',
      [PerformanceMetricType.DATABASE_QUERY_TIME]: 'ms',
      [PerformanceMetricType.CONCURRENT_USERS]: 'count',
      [PerformanceMetricType.MEMORY_USAGE]: '%',
      [PerformanceMetricType.CPU_USAGE]: '%',
      [PerformanceMetricType.THROUGHPUT]: 'req/s',
      [PerformanceMetricType.ERROR_RATE]: '%',
      [PerformanceMetricType.SUCCESS_RATE]: '%'
    };
    
    return units[metricType] || 'count';
  }

  private storeWorkflowAnalytics(workflow: HealthcareWorkflowMetrics): void {
    // Store workflow analytics for reporting and optimization
    // In a real implementation, this would store to analytics database
    console.log('Workflow Analytics:', {
      workflowType: workflow.workflowType,
      duration: workflow.duration,
      successRate: workflow.successRate,
      userExperienceScore: workflow.userExperienceScore,
      clinicId: workflow.clinicId,
      doctorId: workflow.doctorId
    });
  }

  private startPeriodicMonitoring(): void {
    // Start periodic capacity monitoring
    this.startConcurrentUserMonitoring();
    this.startDatabasePerformanceMonitoring();
    this.startApiPerformanceMonitoring();
  }

  // =============================================================================
  // PUBLIC GETTER METHODS
  // =============================================================================

  /**
   * Get current performance metrics
   */
  getPerformanceMetrics(timeRange?: { start: Date; end: Date }): PerformanceMetrics[] {
    if (!timeRange) return this.metrics;
    
    return this.metrics.filter(m => 
      m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
    );
  }

  /**
   * Get healthcare workflow metrics
   */
  getWorkflowMetrics(workflowId?: string): HealthcareWorkflowMetrics | HealthcareWorkflowMetrics[] {
    if (workflowId) return this.workflows.get(workflowId) || [];
    return Array.from(this.workflows.values());
  }

  /**
   * Get capacity metrics
   */
  getCapacityMetrics(timeRange?: { start: Date; end: Date }): CapacityMetrics[] {
    if (!timeRange) return this.capacityMetrics;
    
    return this.capacityMetrics.filter(m => 
      m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
    );
  }

  /**
   * Get real-time dashboard data
   */
  getRealTimeDashboard(): {
    performanceMetrics: PerformanceMetrics[];
    activeWorkflows: HealthcareWorkflowMetrics[];
    capacityMetrics: CapacityMetrics[];
    alerts: Array<{ type: string; severity: string; message: string; timestamp: Date }>;
  } {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    return {
      performanceMetrics: this.getPerformanceMetrics({ start: fiveMinutesAgo, end: now }),
      activeWorkflows: Array.from(this.workflows.values()).filter(w => w.status === WorkflowStatus.IN_PROGRESS),
      capacityMetrics: this.getCapacityMetrics({ start: fiveMinutesAgo, end: now }),
      alerts: this.generateRealTimeAlerts()
    };
  }

  private generateRealTimeAlerts(): Array<{ type: string; severity: string; message: string; timestamp: Date }> {
    const alerts: Array<{ type: string; severity: string; message: string; timestamp: Date }> = [];
    const now = new Date();
    
    // Check for critical performance metrics
    const criticalMetrics = this.metrics.filter(m => 
      m.timestamp > new Date(now.getTime() - 60000) && // Last minute
      m.value >= m.threshold.critical
    );
    
    criticalMetrics.forEach(metric => {
      alerts.push({
        type: 'PERFORMANCE',
        severity: MonitoringSeverity.CRITICAL,
        message: `${metric.metricType} exceeded critical threshold: ${metric.value}`,
        timestamp: metric.timestamp
      });
    });
    
    return alerts;
  }
}

// =============================================================================
// EXPORT SINGLETON INSTANCE
// =============================================================================

export const healthcarePerformanceMonitor = new HealthcarePerformanceMonitor();