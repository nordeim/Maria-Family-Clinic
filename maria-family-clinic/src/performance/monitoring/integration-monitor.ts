/**
 * Healthcare Integration Health Monitoring Service
 * Sub-Phase 10.6: Integration Health Monitoring for My Family Clinic
 * Monitors third-party healthcare service integrations and API health
 */

import { 
  IntegrationHealth,
  IntegrationServiceType,
  IntegrationStatus,
  HealthcareImpactLevel,
  MonitoringSeverity,
  MonitoringCategory
} from './types';

// =============================================================================
// INTEGRATION MONITORING CONFIGURATION
// =============================================================================

const INTEGRATION_CONFIGURATIONS = {
  [IntegrationServiceType.GOOGLE_MAPS]: {
    healthCheckEndpoint: 'https://maps.googleapis.com/maps/api/js',
    timeout: 5000,
    retryAttempts: 3,
    criticalEndpoints: ['geocoding', 'places', 'directions'],
    healthcareImpact: HealthcareImpactLevel.HIGH,
    expectedResponseTime: 1000,
    errorThreshold: 0.05 // 5% error rate
  },
  [IntegrationServiceType.HEALTHIER_SG_API]: {
    healthCheckEndpoint: 'https://api.healthiersg.gov.sg/health',
    timeout: 10000,
    retryAttempts: 5,
    criticalEndpoints: ['enrollment', 'verification', 'benefits'],
    healthcareImpact: HealthcareImpactLevel.CRITICAL,
    expectedResponseTime: 2000,
    errorThreshold: 0.02 // 2% error rate
  },
  [IntegrationServiceType.PAYMENT_GATEWAY]: {
    healthCheckEndpoint: 'https://api.stripe.com/v1',
    timeout: 8000,
    retryAttempts: 3,
    criticalEndpoints: ['payments', 'subscriptions', 'invoices'],
    healthcareImpact: HealthcareImpactLevel.MEDIUM,
    expectedResponseTime: 1500,
    errorThreshold: 0.03 // 3% error rate
  },
  [IntegrationServiceType.MEDICAL_INSURANCE_API]: {
    healthCheckEndpoint: 'https://api.medisave.gov.sg',
    timeout: 12000,
    retryAttempts: 5,
    criticalEndpoints: ['verification', 'claims', 'coverage'],
    healthcareImpact: HealthcareImpactLevel.CRITICAL,
    expectedResponseTime: 3000,
    errorThreshold: 0.01 // 1% error rate
  },
  [IntegrationServiceType.GOVERNMENT_VERIFICATION]: {
    healthCheckEndpoint: 'https://api.gov.sg/verify',
    timeout: 10000,
    retryAttempts: 3,
    criticalEndpoints: ['nric_verification', 'address_verification'],
    healthcareImpact: HealthcareImpactLevel.HIGH,
    expectedResponseTime: 2500,
    errorThreshold: 0.02 // 2% error rate
  },
  [IntegrationServiceType.NOTIFICATION_SERVICE]: {
    healthCheckEndpoint: 'https://api.sendgrid.com/v3',
    timeout: 5000,
    retryAttempts: 3,
    criticalEndpoints: ['email', 'sms', 'push'],
    healthcareImpact: HealthcareImpactLevel.MEDIUM,
    expectedResponseTime: 2000,
    errorThreshold: 0.05 // 5% error rate
  },
  [IntegrationServiceType.EMAIL_SERVICE]: {
    healthCheckEndpoint: 'https://api.resend.com/emails',
    timeout: 8000,
    retryAttempts: 3,
    criticalEndpoints: ['transactional', 'marketing', 'system'],
    healthcareImpact: HealthcareImpactLevel.LOW,
    expectedResponseTime: 1500,
    errorThreshold: 0.05 // 5% error rate
  },
  [IntegrationServiceType.SMS_SERVICE]: {
    healthCheckEndpoint: 'https://api.twilio.com/2010-04-01',
    timeout: 8000,
    retryAttempts: 3,
    criticalEndpoints: ['otp', 'notifications', 'alerts'],
    healthcareImpact: HealthcareImpactLevel.MEDIUM,
    expectedResponseTime: 2000,
    errorThreshold: 0.03 // 3% error rate
  }
};

// =============================================================================
// HEALTHCARE INTEGRATION MONITORING CLASS
// =============================================================================

export class HealthcareIntegrationMonitor {
  private integrationHealth: Map<IntegrationServiceType, IntegrationHealth> = new Map();
  private monitoringIntervals: Map<IntegrationServiceType, NodeJS.Timeout> = new Map();
  private healthCheckHistory: Map<IntegrationServiceType, HealthCheckRecord[]> = new Map();
  private serviceDependencies: Map<string, string[]> = new Map();
  private circuitBreakerState: Map<IntegrationServiceType, CircuitBreakerState> = new Map();
  private responseTimeHistory: Map<IntegrationServiceType, number[]> = new Map();

  constructor() {
    this.initializeIntegrations();
    this.startContinuousHealthMonitoring();
    this.setupServiceDependencies();
  }

  // =============================================================================
  // GOOGLE MAPS API MONITORING
  // =============================================================================

  /**
   * Monitor Google Maps API performance for clinic location services
   */
  async monitorGoogleMapsHealth(): Promise<IntegrationHealth> {
    const config = INTEGRATION_CONFIGURATIONS[IntegrationServiceType.GOOGLE_MAPS];
    const health: IntegrationHealth = {
      integrationId: 'google_maps_health',
      serviceName: 'Google Maps API',
      serviceType: IntegrationServiceType.GOOGLE_MAPS,
      status: IntegrationStatus.UNKNOWN,
      lastCheck: new Date(),
      responseTime: 0,
      successRate: 0,
      errorCount: 0,
      uptime: 0,
      healthcareImpact: HealthcareImpactLevel.HIGH,
      dependencies: ['internet_connectivity', 'google_cloud_services']
    };

    try {
      // Check overall API health
      const startTime = Date.now();
      const healthCheck = await this.performHealthCheck(config.healthCheckEndpoint, config.timeout);
      const responseTime = Date.now() - startTime;

      health.responseTime = responseTime;
      health.lastCheck = new Date();

      // Check specific critical endpoints
      const endpointResults = await Promise.allSettled(
        config.criticalEndpoints.map(endpoint => 
          this.checkGoogleMapsEndpoint(endpoint, config.timeout)
        )
      );

      const successfulChecks = endpointResults.filter(result => result.status === 'fulfilled').length;
      const totalChecks = endpointResults.length;
      health.successRate = (successfulChecks / totalChecks) * 100;

      // Determine overall status
      if (responseTime <= config.expectedResponseTime && health.successRate >= 95) {
        health.status = IntegrationStatus.HEALTHY;
      } else if (responseTime <= config.expectedResponseTime * 2 || health.successRate >= 90) {
        health.status = IntegrationStatus.DEGRADED;
      } else {
        health.status = IntegrationStatus.DOWN;
      }

      // Track error count
      health.errorCount = totalChecks - successfulChecks;

      // Update uptime calculation
      health.uptime = await this.calculateUptime(IntegrationServiceType.GOOGLE_MAPS);

      // Check for healthcare workflow impact
      await this.assessHealthcareWorkflowImpact(health, 'clinic_search');

    } catch (error) {
      health.status = IntegrationStatus.DOWN;
      health.lastError = error instanceof Error ? error.message : 'Unknown error';
      health.errorCount = (health.errorCount || 0) + 1;
    }

    this.integrationHealth.set(IntegrationServiceType.GOOGLE_MAPS, health);
    await this.recordHealthCheck(IntegrationServiceType.GOOGLE_MAPS, health);

    return health;
  }

  /**
   * Check specific Google Maps endpoint
   */
  private async checkGoogleMapsEndpoint(endpoint: string, timeout: number): Promise<boolean> {
    const endpoints = {
      'geocoding': 'https://maps.googleapis.com/maps/api/geocode/json',
      'places': 'https://maps.googleapis.com/maps/api/place/search/json',
      'directions': 'https://maps.googleapis.com/maps/api/directions/json'
    };

    const endpointUrl = endpoints[endpoint as keyof typeof endpoints];
    if (!endpointUrl) return false;

    try {
      const response = await fetch(endpointUrl + '?address=Singapore&key=demo_key', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      return response.status < 400;
    } catch {
      return false;
    }
  }

  // =============================================================================
  // HEALTHIER SG API MONITORING
  // =============================================================================

  /**
   * Monitor Healthier SG API integration health
   */
  async monitorHealthierSGHealth(): Promise<IntegrationHealth> {
    const config = INTEGRATION_CONFIGURATIONS[IntegrationServiceType.HEALTHIER_SG_API];
    const health: IntegrationHealth = {
      integrationId: 'healthier_sg_health',
      serviceName: 'Healthier SG Government API',
      serviceType: IntegrationServiceType.HEALTHIER_SG_API,
      status: IntegrationStatus.UNKNOWN,
      lastCheck: new Date(),
      responseTime: 0,
      successRate: 0,
      errorCount: 0,
      uptime: 0,
      healthcareImpact: HealthcareImpactLevel.CRITICAL,
      dependencies: ['government_network', 'singpass_integration'],
      lastError: undefined
    };

    try {
      const startTime = Date.now();
      
      // Check API authentication and basic connectivity
      const authCheck = await this.checkHealthierSGAuthentication(timeout);
      
      // Check critical healthcare workflows
      const workflowResults = await Promise.allSettled(
        config.criticalEndpoints.map(endpoint => 
          this.checkHealthierSGWorkflow(endpoint, timeout)
        )
      );

      const successfulWorkflows = workflowResults.filter(result => 
        result.status === 'fulfilled' && result.value === true
      ).length;

      const responseTime = Date.now() - startTime;
      health.responseTime = responseTime;
      health.successRate = (successfulWorkflows / config.criticalEndpoints.length) * 100;

      // Determine status based on healthcare criticality
      if (health.successRate >= 98 && responseTime <= config.expectedResponseTime) {
        health.status = IntegrationStatus.HEALTHY;
      } else if (health.successRate >= 95 || responseTime <= config.expectedResponseTime * 1.5) {
        health.status = IntegrationStatus.DEGRADED;
      } else {
        health.status = IntegrationStatus.DOWN;
      }

      health.uptime = await this.calculateUptime(IntegrationServiceType.HEALTHIER_SG_API);

      // Critical healthcare impact assessment
      await this.assessHealthcareWorkflowImpact(health, 'healthier_sg_enrollment');

      // Check for scheduled maintenance
      await this.checkScheduledMaintenance(IntegrationServiceType.HEALTHIER_SG_API);

    } catch (error) {
      health.status = IntegrationStatus.DOWN;
      health.lastError = error instanceof Error ? error.message : 'API connection failed';
      health.errorCount = (health.errorCount || 0) + 1;
    }

    this.integrationHealth.set(IntegrationServiceType.HEALTHIER_SG_API, health);
    await this.recordHealthCheck(IntegrationServiceType.HEALTHIER_SG_API, health);

    return health;
  }

  /**
   * Check Healthier SG API authentication
   */
  private async checkHealthierSGAuthentication(timeout: number): Promise<boolean> {
    try {
      // In real implementation, this would check actual API authentication
      const response = await fetch('https://api.healthiersg.gov.sg/auth/health', {
        method: 'GET',
        timeout,
        headers: {
          'Authorization': 'Bearer demo_token',
          'Accept': 'application/json'
        }
      });

      return response.status === 200;
    } catch {
      return false;
    }
  }

  /**
   * Check Healthier SG workflow endpoints
   */
  private async checkHealthierSGWorkflow(endpoint: string, timeout: number): Promise<boolean> {
    const workflows = {
      'enrollment': '/programs/enrollment/status',
      'verification': '/citizens/verification/status',
      'benefits': '/benefits/calculation/status'
    };

    const workflowUrl = workflows[endpoint as keyof typeof workflows];
    if (!workflowUrl) return false;

    try {
      const response = await fetch(`https://api.healthiersg.gov.sg${workflowUrl}`, {
        method: 'GET',
        timeout,
        headers: {
          'Authorization': 'Bearer demo_token',
          'Accept': 'application/json'
        }
      });

      return response.status < 400;
    } catch {
      return false;
    }
  }

  // =============================================================================
  // PAYMENT GATEWAY MONITORING
  // =============================================================================

  /**
   * Monitor payment gateway performance for healthcare transactions
   */
  async monitorPaymentGatewayHealth(): Promise<IntegrationHealth> {
    const config = INTEGRATION_CONFIGURATIONS[IntegrationServiceType.PAYMENT_GATEWAY];
    const health: IntegrationHealth = {
      integrationId: 'payment_gateway_health',
      serviceName: 'Healthcare Payment Gateway',
      serviceType: IntegrationServiceType.PAYMENT_GATEWAY,
      status: IntegrationStatus.UNKNOWN,
      lastCheck: new Date(),
      responseTime: 0,
      successRate: 0,
      errorCount: 0,
      uptime: 0,
      healthcareImpact: HealthcareImpactLevel.MEDIUM,
      dependencies: ['banking_network', 'payment_processors'],
      lastError: undefined
    };

    try {
      const startTime = Date.now();

      // Test payment processing endpoints
      const paymentTests = await Promise.allSettled(
        config.criticalEndpoints.map(endpoint => 
          this.testPaymentEndpoint(endpoint, timeout)
        )
      );

      const successfulTests = paymentTests.filter(result => 
        result.status === 'fulfilled' && result.value === true
      ).length;

      const responseTime = Date.now() - startTime;
      health.responseTime = responseTime;
      health.successRate = (successfulTests / config.criticalEndpoints.length) * 100;

      // Healthcare transaction specific checks
      const healthcareTransactionCheck = await this.checkHealthcareTransactions(timeout);
      if (!healthcareTransactionCheck) {
        health.successRate *= 0.8; // Reduce score for healthcare transaction issues
      }

      // Determine status
      if (health.successRate >= 95 && responseTime <= config.expectedResponseTime) {
        health.status = IntegrationStatus.HEALTHY;
      } else if (health.successRate >= 90 || responseTime <= config.expectedResponseTime * 1.5) {
        health.status = IntegrationStatus.DEGRADED;
      } else {
        health.status = IntegrationStatus.DOWN;
      }

      health.uptime = await this.calculateUptime(IntegrationServiceType.PAYMENT_GATEWAY);

    } catch (error) {
      health.status = IntegrationStatus.DOWN;
      health.lastError = error instanceof Error ? error.message : 'Payment gateway error';
      health.errorCount = (health.errorCount || 0) + 1;
    }

    this.integrationHealth.set(IntegrationServiceType.PAYMENT_GATEWAY, health);
    await this.recordHealthCheck(IntegrationServiceType.PAYMENT_GATEWAY, health);

    return health;
  }

  /**
   * Test payment endpoint
   */
  private async testPaymentEndpoint(endpoint: string, timeout: number): Promise<boolean> {
    const endpoints = {
      'payments': '/v1/payments/health',
      'subscriptions': '/v1/subscriptions/health',
      'invoices': '/v1/invoices/health'
    };

    const endpointUrl = endpoints[endpoint as keyof typeof endpoints];
    if (!endpointUrl) return false;

    try {
      const response = await fetch(`https://api.stripe.com${endpointUrl}`, {
        method: 'GET',
        timeout,
        headers: {
          'Authorization': 'Bearer demo_key',
          'Accept': 'application/json'
        }
      });

      return response.status < 400;
    } catch {
      return false;
    }
  }

  /**
   * Check healthcare-specific transaction handling
   */
  private async checkHealthcareTransactions(timeout: number): Promise<boolean> {
    try {
      // Test healthcare-specific payment scenarios
      const healthcarePaymentTest = {
        consultation_fee: true,
        medication_payment: true,
        insurance_claim: true,
        subsidy_application: true
      };

      // In real implementation, would test actual healthcare payment flows
      return Object.values(healthcarePaymentTest).every(test => test);
    } catch {
      return false;
    }
  }

  // =============================================================================
  // MEDICAL INSURANCE API MONITORING
  // =============================================================================

  /**
   * Monitor medical insurance verification API
   */
  async monitorMedicalInsuranceHealth(): Promise<IntegrationHealth> {
    const config = INTEGRATION_CONFIGURATIONS[IntegrationServiceType.MEDICAL_INSURANCE_API];
    const health: IntegrationHealth = {
      integrationId: 'medical_insurance_health',
      serviceName: 'Medical Insurance Verification API',
      serviceType: IntegrationServiceType.MEDICAL_INSURANCE_API,
      status: IntegrationStatus.UNKNOWN,
      lastCheck: new Date(),
      responseTime: 0,
      successRate: 0,
      errorCount: 0,
      uptime: 0,
      healthcareImpact: HealthcareImpactLevel.CRITICAL,
      dependencies: ['insurance_networks', 'government_databases'],
      lastError: undefined
    };

    try {
      const startTime = Date.now();

      // Test insurance verification endpoints
      const verificationTests = await Promise.allSettled(
        config.criticalEndpoints.map(endpoint => 
          this.testInsuranceEndpoint(endpoint, timeout)
        )
      );

      const successfulTests = verificationTests.filter(result => 
        result.status === 'fulfilled' && result.value === true
      ).length;

      const responseTime = Date.now() - startTime;
      health.responseTime = responseTime;
      health.successRate = (successfulTests / config.criticalEndpoints.length) * 100;

      // Critical for healthcare operations
      if (health.successRate >= 99 && responseTime <= config.expectedResponseTime) {
        health.status = IntegrationStatus.HEALTHY;
      } else if (health.successRate >= 97 || responseTime <= config.expectedResponseTime * 1.3) {
        health.status = IntegrationStatus.DEGRADED;
      } else {
        health.status = IntegrationStatus.DOWN;
      }

      health.uptime = await this.calculateUptime(IntegrationServiceType.MEDICAL_INSURANCE_API);

      // Critical healthcare impact assessment
      await this.assessHealthcareWorkflowImpact(health, 'insurance_verification');

    } catch (error) {
      health.status = IntegrationStatus.DOWN;
      health.lastError = error instanceof Error ? error.message : 'Insurance API error';
      health.errorCount = (health.errorCount || 0) + 1;
    }

    this.integrationHealth.set(IntegrationServiceType.MEDICAL_INSURANCE_API, health);
    await this.recordHealthCheck(IntegrationServiceType.MEDICAL_INSURANCE_API, health);

    return health;
  }

  /**
   * Test insurance endpoint
   */
  private async testInsuranceEndpoint(endpoint: string, timeout: number): Promise<boolean> {
    const endpoints = {
      'verification': '/v1/insurance/verify/health',
      'claims': '/v1/claims/status/health',
      'coverage': '/v1/coverage/check/health'
    };

    const endpointUrl = endpoints[endpoint as keyof typeof endpoints];
    if (!endpointUrl) return false;

    try {
      const response = await fetch(`https://api.medisave.gov.sg${endpointUrl}`, {
        method: 'GET',
        timeout,
        headers: {
          'Authorization': 'Bearer demo_token',
          'Accept': 'application/json'
        }
      });

      return response.status < 400;
    } catch {
      return false;
    }
  }

  // =============================================================================
  // CONTINUOUS HEALTH MONITORING
  // =============================================================================

  /**
   * Start continuous health monitoring for all integrations
   */
  private startContinuousHealthMonitoring(): void {
    // Monitor critical healthcare integrations more frequently
    const criticalServices = [
      IntegrationServiceType.HEALTHIER_SG_API,
      IntegrationServiceType.MEDICAL_INSURANCE_API,
      IntegrationServiceType.GOVERNMENT_VERIFICATION
    ];

    // High-frequency monitoring for critical services (every 30 seconds)
    criticalServices.forEach(serviceType => {
      const interval = setInterval(async () => {
        await this.performHealthCheck(serviceType);
      }, 30000);
      this.monitoringIntervals.set(serviceType, interval);
    });

    // Standard monitoring for other services (every 2 minutes)
    Object.values(IntegrationServiceType)
      .filter(serviceType => !criticalServices.includes(serviceType))
      .forEach(serviceType => {
        const interval = setInterval(async () => {
          await this.performHealthCheck(serviceType);
        }, 120000);
        this.monitoringIntervals.set(serviceType, interval);
      });

    // Circuit breaker monitoring (every 10 seconds)
    const circuitBreakerInterval = setInterval(() => {
      this.monitorCircuitBreakers();
    }, 10000);
    this.monitoringIntervals.set('circuit_breaker', circuitBreakerInterval);

    // Dependency health monitoring (every minute)
    const dependencyInterval = setInterval(() => {
      this.monitorServiceDependencies();
    }, 60000);
    this.monitoringIntervals.set('dependencies', dependencyInterval);
  }

  /**
   * Perform health check for a specific service
   */
  private async performHealthCheck(serviceType: IntegrationServiceType): Promise<IntegrationHealth | null> {
    try {
      switch (serviceType) {
        case IntegrationServiceType.GOOGLE_MAPS:
          return await this.monitorGoogleMapsHealth();
        case IntegrationServiceType.HEALTHIER_SG_API:
          return await this.monitorHealthierSGHealth();
        case IntegrationServiceType.PAYMENT_GATEWAY:
          return await this.monitorPaymentGatewayHealth();
        case IntegrationServiceType.MEDICAL_INSURANCE_API:
          return await this.monitorMedicalInsuranceHealth();
        default:
          console.warn(`Health check not implemented for ${serviceType}`);
          return null;
      }
    } catch (error) {
      console.error(`Health check failed for ${serviceType}:`, error);
      return null;
    }
  }

  /**
   * Monitor circuit breaker states
   */
  private async monitorCircuitBreakers(): Promise<void> {
    for (const [serviceType, health] of this.integrationHealth.entries()) {
      const breaker = this.circuitBreakerState.get(serviceType);
      if (!breaker) continue;

      // Check if service has recovered
      if (health.status === IntegrationStatus.HEALTHY && breaker.state === 'OPEN') {
        // Try to close circuit breaker after cooldown period
        if (Date.now() - breaker.lastFailure > breaker.cooldownPeriod) {
          breaker.state = 'HALF_OPEN';
          this.circuitBreakerState.set(serviceType, breaker);
        }
      }

      // Handle failures
      if (health.status === IntegrationStatus.DOWN) {
        breaker.failureCount++;
        breaker.lastFailure = Date.now();

        if (breaker.failureCount >= breaker.failureThreshold) {
          breaker.state = 'OPEN';
        }

        this.circuitBreakerState.set(serviceType, breaker);
      }
    }
  }

  // =============================================================================
  // SERVICE DEPENDENCIES
  // =============================================================================

  /**
   * Setup service dependencies for impact analysis
   */
  private setupServiceDependencies(): void {
    this.serviceDependencies.set('clinic_search', [
      IntegrationServiceType.GOOGLE_MAPS.toString(),
      IntegrationServiceType.NOTIFICATION_SERVICE.toString()
    ]);

    this.serviceDependencies.set('appointment_booking', [
      IntegrationServiceType.PAYMENT_GATEWAY.toString(),
      IntegrationServiceType.NOTIFICATION_SERVICE.toString(),
      IntegrationServiceType.EMAIL_SERVICE.toString(),
      IntegrationServiceType.SMS_SERVICE.toString()
    ]);

    this.serviceDependencies.set('healthier_sg_enrollment', [
      IntegrationServiceType.HEALTHIER_SG_API.toString(),
      IntegrationServiceType.GOVERNMENT_VERIFICATION.toString(),
      IntegrationServiceType.MEDICAL_INSURANCE_API.toString()
    ]);

    this.serviceDependencies.set('insurance_verification', [
      IntegrationServiceType.MEDICAL_INSURANCE_API.toString(),
      IntegrationServiceType.GOVERNMENT_VERIFICATION.toString()
    ]);
  }

  /**
   * Monitor service dependencies
   */
  private async monitorServiceDependencies(): Promise<void> {
    const failedDependencies: string[] = [];

    for (const [service, dependencies] of this.serviceDependencies.entries()) {
      for (const dependency of dependencies) {
        const health = this.integrationHealth.get(dependency as IntegrationServiceType);
        if (health && (health.status === IntegrationStatus.DOWN || health.status === IntegrationStatus.DEGRADED)) {
          failedDependencies.push(`${service} depends on ${dependency}`);
        }
      }
    }

    if (failedDependencies.length > 0) {
      console.warn('[INTEGRATION DEPENDENCIES] Failed dependencies detected:', failedDependencies);
    }
  }

  // =============================================================================
  // HEALTHCARE IMPACT ASSESSMENT
  // =============================================================================

  /**
   * Assess healthcare workflow impact of integration issues
   */
  private async assessHealthcareWorkflowImpact(health: IntegrationHealth, workflowId: string): Promise<void> {
    const dependencies = this.serviceDependencies.get(workflowId) || [];
    const dependencyHealth = dependencies.map(dep => 
      this.integrationHealth.get(dep as IntegrationServiceType)
    ).filter(h => h !== undefined) as IntegrationHealth[];

    // Calculate overall workflow health
    const healthyDependencies = dependencyHealth.filter(h => h.status === IntegrationStatus.HEALTHY).length;
    const totalDependencies = dependencyHealth.length;
    const workflowHealthScore = totalDependencies > 0 ? (healthyDependencies / totalDependencies) * 100 : 100;

    // Update healthcare impact based on workflow health
    if (workflowHealthScore < 70) {
      health.healthcareImpact = HealthcareImpactLevel.CRITICAL;
    } else if (workflowHealthScore < 85) {
      health.healthcareImpact = HealthcareImpactLevel.HIGH;
    } else if (workflowHealthScore < 95) {
      health.healthcareImpact = HealthcareImpactLevel.MEDIUM;
    } else {
      health.healthcareImpact = HealthcareImpactLevel.LOW;
    }
  }

  // =============================================================================
  // PRIVATE HELPER METHODS
  // =============================================================================

  private async performHealthCheck(endpoint: string, timeout: number): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(endpoint, {
        method: 'GET',
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });

      clearTimeout(timeoutId);
      return response.status < 400;
    } catch {
      return false;
    }
  }

  private async calculateUptime(serviceType: IntegrationServiceType): Promise<number> {
    const history = this.healthCheckHistory.get(serviceType) || [];
    const recentChecks = history.filter(check => 
      check.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
    );

    if (recentChecks.length === 0) return 100;

    const healthyChecks = recentChecks.filter(check => check.healthy).length;
    return (healthyChecks / recentChecks.length) * 100;
  }

  private async recordHealthCheck(serviceType: IntegrationServiceType, health: IntegrationHealth): Promise<void> {
    if (!this.healthCheckHistory.has(serviceType)) {
      this.healthCheckHistory.set(serviceType, []);
    }

    const history = this.healthCheckHistory.get(serviceType)!;
    history.push({
      timestamp: new Date(),
      healthy: health.status === IntegrationStatus.HEALTHY,
      responseTime: health.responseTime,
      errorCount: health.errorCount
    });

    // Keep only last 1000 records
    if (history.length > 1000) {
      this.healthCheckHistory.set(serviceType, history.slice(-1000));
    }

    // Track response times for trend analysis
    if (!this.responseTimeHistory.has(serviceType)) {
      this.responseTimeHistory.set(serviceType, []);
    }

    const responseTimes = this.responseTimeHistory.get(serviceType)!;
    responseTimes.push(health.responseTime);
    if (responseTimes.length > 100) {
      this.responseTimeHistory.set(serviceType, responseTimes.slice(-100));
    }
  }

  private async checkScheduledMaintenance(serviceType: IntegrationServiceType): Promise<void> {
    // Check for scheduled maintenance windows
    const maintenanceSchedule = {
      [IntegrationServiceType.GOOGLE_MAPS]: [
        { start: '2024-12-01T02:00:00Z', end: '2024-12-01T04:00:00Z' }
      ],
      [IntegrationServiceType.HEALTHIER_SG_API]: [
        { start: '2024-12-15T01:00:00Z', end: '2024-12-15T03:00:00Z' }
      ]
    };

    const schedule = maintenanceSchedule[serviceType];
    if (schedule) {
      const now = new Date();
      const isMaintenanceTime = schedule.some(maintenance => {
        const start = new Date(maintenance.start);
        const end = new Date(maintenance.end);
        return now >= start && now <= end;
      });

      if (isMaintenanceTime) {
        const health = this.integrationHealth.get(serviceType);
        if (health) {
          health.status = IntegrationStatus.MAINTENANCE;
          health.maintenanceScheduled = new Date();
        }
      }
    }
  }

  private initializeIntegrations(): void {
    // Initialize all integration health records
    Object.values(IntegrationServiceType).forEach(serviceType => {
      this.integrationHealth.set(serviceType, {
        integrationId: `${serviceType}_initial`,
        serviceName: this.getServiceDisplayName(serviceType),
        serviceType,
        status: IntegrationStatus.UNKNOWN,
        lastCheck: new Date(),
        responseTime: 0,
        successRate: 100,
        errorCount: 0,
        uptime: 100,
        healthcareImpact: INTEGRATION_CONFIGURATIONS[serviceType].healthcareImpact,
        dependencies: []
      });
    });

    // Initialize circuit breaker states
    Object.values(IntegrationServiceType).forEach(serviceType => {
      this.circuitBreakerState.set(serviceType, {
        state: 'CLOSED',
        failureCount: 0,
        lastFailure: 0,
        failureThreshold: 5,
        cooldownPeriod: 60000 // 1 minute
      });
    });
  }

  private getServiceDisplayName(serviceType: IntegrationServiceType): string {
    const displayNames = {
      [IntegrationServiceType.GOOGLE_MAPS]: 'Google Maps API',
      [IntegrationServiceType.HEALTHIER_SG_API]: 'Healthier SG Government API',
      [IntegrationServiceType.PAYMENT_GATEWAY]: 'Healthcare Payment Gateway',
      [IntegrationServiceType.MEDICAL_INSURANCE_API]: 'Medical Insurance Verification API',
      [IntegrationServiceType.GOVERNMENT_VERIFICATION]: 'Government Verification Service',
      [IntegrationServiceType.NOTIFICATION_SERVICE]: 'Healthcare Notification Service',
      [IntegrationServiceType.EMAIL_SERVICE]: 'Healthcare Email Service',
      [IntegrationServiceType.SMS_SERVICE]: 'Healthcare SMS Service'
    };
    return displayNames[serviceType] || serviceType;
  }

  // =============================================================================
  // PUBLIC GETTER METHODS
  // =============================================================================

  /**
   * Get integration health status
   */
  getIntegrationHealth(serviceType?: IntegrationServiceType): IntegrationHealth | Map<IntegrationServiceType, IntegrationHealth> {
    if (serviceType) {
      return this.integrationHealth.get(serviceType) || {
        integrationId: 'not_found',
        serviceName: this.getServiceDisplayName(serviceType),
        serviceType,
        status: IntegrationStatus.UNKNOWN,
        lastCheck: new Date(),
        responseTime: 0,
        successRate: 0,
        errorCount: 0,
        uptime: 0,
        healthcareImpact: HealthcareImpactLevel.LOW,
        dependencies: []
      };
    }
    return new Map(this.integrationHealth);
  }

  /**
   * Get integration health dashboard
   */
  getIntegrationDashboard(): {
    overallHealth: number;
    criticalIssues: number;
    serviceStatus: Record<IntegrationServiceType, { status: IntegrationStatus; healthcareImpact: HealthcareImpactLevel; uptime: number }>;
    degradedServices: IntegrationServiceType[];
    dependenciesAtRisk: string[];
    responseTimeTrends: Record<IntegrationServiceType, { avg: number; trend: 'improving' | 'degrading' | 'stable' }>;
  } {
    const services = this.integrationHealth;
    const healthyServices = Array.from(services.values()).filter(h => h.status === IntegrationStatus.HEALTHY).length;
    const totalServices = services.size;
    const overallHealth = totalServices > 0 ? (healthyServices / totalServices) * 100 : 100;

    const criticalIssues = Array.from(services.values())
      .filter(h => h.healthcareImpact === HealthcareImpactLevel.CRITICAL && h.status !== IntegrationStatus.HEALTHY)
      .length;

    const degradedServices = Array.from(services.entries())
      .filter(([, health]) => health.status === IntegrationServiceType.DEGRADED)
      .map(([serviceType]) => serviceType);

    // Calculate response time trends
    const responseTimeTrends: Record<string, any> = {};
    for (const [serviceType, responseTimes] of this.responseTimeHistory.entries()) {
      if (responseTimes.length < 2) continue;

      const recent = responseTimes.slice(-10);
      const earlier = responseTimes.slice(-20, -10);
      
      const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
      const earlierAvg = earlier.length > 0 ? earlier.reduce((a, b) => a + b, 0) / earlier.length : recentAvg;
      
      let trend: 'improving' | 'degrading' | 'stable' = 'stable';
      const change = ((recentAvg - earlierAvg) / earlierAvg) * 100;
      
      if (change > 10) trend = 'degrading';
      else if (change < -10) trend = 'improving';

      responseTimeTrends[serviceType] = {
        avg: recentAvg,
        trend
      };
    }

    return {
      overallHealth,
      criticalIssues,
      serviceStatus: Object.fromEntries(
        Array.from(services.entries()).map(([serviceType, health]) => [
          serviceType,
          {
            status: health.status,
            healthcareImpact: health.healthcareImpact,
            uptime: health.uptime
          }
        ])
      ),
      degradedServices,
      dependenciesAtRisk: this.calculateDependenciesAtRisk(),
      responseTimeTrends: responseTimeTrends as any
    };
  }

  private calculateDependenciesAtRisk(): string[] {
    const atRisk: string[] = [];
    
    for (const [workflow, dependencies] of this.serviceDependencies.entries()) {
      const criticalDependencyFailures = dependencies.filter(dep => {
        const health = this.integrationHealth.get(dep as IntegrationServiceType);
        return health && health.status === IntegrationStatus.DOWN && health.healthcareImpact === HealthcareImpactLevel.CRITICAL;
      });

      if (criticalDependencyFailures.length > 0) {
        atRisk.push(`${workflow}: ${criticalDependencyFailures.join(', ')}`);
      }
    }

    return atRisk;
  }
}

// =============================================================================
// SUPPORTING INTERFACES
// =============================================================================

interface HealthCheckRecord {
  timestamp: Date;
  healthy: boolean;
  responseTime: number;
  errorCount: number;
}

interface CircuitBreakerState {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failureCount: number;
  lastFailure: number;
  failureThreshold: number;
  cooldownPeriod: number;
}

// =============================================================================
// EXPORT SINGLETON INSTANCE
// =============================================================================

export const healthcareIntegrationMonitor = new HealthcareIntegrationMonitor();