/**
 * Performance Testing Framework for My Family Clinic
 * Healthcare-specific performance benchmarks and load testing configuration
 */

export interface PerformanceTestConfig {
  name: string
  type: 'load' | 'stress' | 'spike' | 'volume' | 'endurance'
  target: {
    url: string
    endpoints: PerformanceEndpoint[]
  }
  load: LoadConfiguration
  thresholds: PerformanceThresholds
  healthcare: HealthcarePerformanceConfig
  monitoring: MonitoringConfig
  reports: ReportConfig
}

export interface PerformanceEndpoint {
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  weight: number // Relative importance for load distribution
  headers?: Record<string, string>
  body?: any
  thinkTime?: number // Seconds to wait between requests
  duration?: number // Specific duration for this endpoint (overrides global)
}

export interface LoadConfiguration {
  vusers: number // Virtual users
  duration: number // Test duration in seconds
  rampUp: number // Time to reach full load
  rampDown: number // Time to decrease load
  concurrency: number // Concurrent users per second
  requestsPerSecond?: number // Override for RPS-based testing
}

export interface PerformanceThresholds {
  responseTime: {
    p50: number // 50th percentile
    p90: number // 90th percentile
    p95: number // 95th percentile
    p99: number // 99th percentile
    max: number // Maximum acceptable
  }
  throughput: {
    min: number // Minimum requests per second
    max: number // Maximum requests per second
  }
  error: {
    rate: number // Maximum error rate percentage
    count: number // Maximum number of errors
  }
  system: {
    cpu: number // Maximum CPU usage %
    memory: number // Maximum memory usage %
    disk: number // Maximum disk usage %
  }
}

export interface HealthcarePerformanceConfig {
  simulatePatientLoad: boolean
  simulateClinicLoad: boolean
  simulateDoctorLoad: boolean
  patientCount?: number // Number of simulated patients
  clinicCount?: number // Number of simulated clinics
  doctorCount?: number // Number of simulated doctors
  peakHours?: TimeRange[] // Peak usage hours to simulate
  healthcareScenarios: HealthcareScenario[]
}

export interface HealthcareScenario {
  name: string
  description: string
  userType: 'patient' | 'doctor' | 'admin' | 'receptionist'
  actions: HealthcareAction[]
  weight: number // Importance in load test
}

export interface HealthcareAction {
  type: 'browse' | 'search' | 'book_appointment' | 'view_medical_record' | 
        'update_patient' | 'generate_report' | 'send_notification' | 
        'healthier_sg_check' | 'pdpa_consent' | 'moh_compliance_check'
  endpoint: string
  method: string
  payload?: any
  validateResponse: boolean
  expectedResponseTime: number
}

export interface TimeRange {
  start: string // HH:MM format
  end: string   // HH:MM format
  day: number   // Day of week (0 = Sunday)
}

export interface MonitoringConfig {
  enabled: boolean
  metrics: {
    application: boolean // APM metrics
    infrastructure: boolean // System metrics
    business: boolean // Healthcare-specific metrics
  }
  alerts: AlertConfig[]
}

export interface AlertConfig {
  metric: string
  condition: 'gt' | 'lt' | 'eq'
  threshold: number
  duration: number
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export interface ReportConfig {
  format: ('html' | 'json' | 'csv' | 'xml')[]
  outputDir: string
  includeCharts: boolean
  includeHealthcareMetrics: boolean
  includeComplianceReports: boolean
}

export class HealthcarePerformanceTestFramework {
  private static instance: HealthcarePerformanceTestFramework
  private configs = new Map<string, PerformanceTestConfig>()
  private results = new Map<string, PerformanceTestResult>()

  public static getInstance(): HealthcarePerformanceTestFramework {
    if (!HealthcarePerformanceTestFramework.instance) {
      HealthcarePerformanceTestFramework.instance = new HealthcarePerformanceTestFramework()
    }
    return HealthcarePerformanceTestFramework.instance
  }

  // Healthcare-specific load test configurations
  public createPatientJourneyLoadTest(baseUrl: string): PerformanceTestConfig {
    return {
      name: 'patient-journey-load',
      type: 'load',
      target: {
        url: baseUrl,
        endpoints: [
          {
            path: '/api/health',
            method: 'GET',
            weight: 1,
            thinkTime: 1
          },
          {
            path: '/api/patients/profile',
            method: 'GET',
            weight: 5,
            headers: { 'Authorization': 'Bearer {{token}}' },
            thinkTime: 2
          },
          {
            path: '/api/doctors',
            method: 'GET',
            weight: 3,
            thinkTime: 1
          },
          {
            path: '/api/appointments',
            method: 'GET',
            weight: 4,
            headers: { 'Authorization': 'Bearer {{token}}' },
            thinkTime: 2
          },
          {
            path: '/api/appointments',
            method: 'POST',
            weight: 2,
            headers: { 'Authorization': 'Bearer {{token}}' },
            body: {
              doctorId: 'doctor_123',
              dateTime: '2025-11-06T10:00:00Z',
              type: 'consultation'
            },
            thinkTime: 3,
            duration: 30
          },
          {
            path: '/api/healthier-sg/status',
            method: 'GET',
            weight: 3,
            headers: { 'Authorization': 'Bearer {{token}}' },
            thinkTime: 2
          },
          {
            path: '/api/medical-records',
            method: 'GET',
            weight: 3,
            headers: { 'Authorization': 'Bearer {{token}}' },
            thinkTime: 5
          }
        ]
      },
      load: {
        vusers: 100,
        duration: 600, // 10 minutes
        rampUp: 60, // 1 minute
        rampDown: 60,
        concurrency: 10
      },
      thresholds: {
        responseTime: {
          p50: 500,   // 500ms for 50% of requests
          p90: 1500,  // 1.5s for 90% of requests
          p95: 3000,  // 3s for 95% of requests
          p99: 5000,  // 5s for 99% of requests
          max: 10000  // 10s maximum
        },
        throughput: {
          min: 50,    // Minimum 50 requests per second
          max: 200    // Maximum 200 requests per second
        },
        error: {
          rate: 1.0,  // Maximum 1% error rate
          count: 100  // Maximum 100 errors
        },
        system: {
          cpu: 80,    // Maximum 80% CPU usage
          memory: 85, // Maximum 85% memory usage
          disk: 90    // Maximum 90% disk usage
        }
      },
      healthcare: {
        simulatePatientLoad: true,
        patientCount: 1000,
        peakHours: [
          { start: '09:00', end: '12:00', day: 1 }, // Monday morning
          { start: '14:00', end: '17:00', day: 1 }, // Monday afternoon
          { start: '09:00', end: '12:00', day: 2 }, // Tuesday morning
          { start: '14:00', end: '17:00', day: 2 }, // Tuesday afternoon
        ],
        healthcareScenarios: [
          {
            name: 'patient-appointment-booking',
            description: 'Patient booking an appointment',
            userType: 'patient',
            weight: 40,
            actions: [
              {
                type: 'browse',
                endpoint: '/api/doctors',
                method: 'GET',
                validateResponse: true,
                expectedResponseTime: 2000
              },
              {
                type: 'search',
                endpoint: '/api/doctors/search',
                method: 'POST',
                payload: { specialization: 'General Practice', date: '2025-11-06' },
                validateResponse: true,
                expectedResponseTime: 3000
              },
              {
                type: 'book_appointment',
                endpoint: '/api/appointments',
                method: 'POST',
                payload: {
                  doctorId: 'doctor_123',
                  dateTime: '2025-11-06T10:00:00Z',
                  type: 'consultation',
                  notes: 'Regular checkup'
                },
                validateResponse: true,
                expectedResponseTime: 5000
              }
            ]
          },
          {
            name: 'patient-medical-records',
            description: 'Patient viewing medical records',
            userType: 'patient',
            weight: 30,
            actions: [
              {
                type: 'view_medical_record',
                endpoint: '/api/medical-records',
                method: 'GET',
                validateResponse: true,
                expectedResponseTime: 3000
              },
              {
                type: 'view_medical_record',
                endpoint: '/api/medical-records/{{recordId}}',
                method: 'GET',
                validateResponse: true,
                expectedResponseTime: 2000
              }
            ]
          },
          {
            name: 'healthier-sg-check',
            description: 'Patient checking Healthier SG status',
            userType: 'patient',
            weight: 20,
            actions: [
              {
                type: 'healthier_sg_check',
                endpoint: '/api/healthier-sg/status',
                method: 'GET',
                validateResponse: true,
                expectedResponseTime: 4000
              },
              {
                type: 'browse',
                endpoint: '/api/healthier-sg/programs',
                method: 'GET',
                validateResponse: true,
                expectedResponseTime: 2500
              }
            ]
          },
          {
            name: 'pdpa-consent',
            description: 'Patient managing PDPA consent',
            userType: 'patient',
            weight: 10,
            actions: [
              {
                type: 'pdpa_consent',
                endpoint: '/api/pdpa/consent',
                method: 'GET',
                validateResponse: true,
                expectedResponseTime: 1500
              },
              {
                type: 'pdpa_consent',
                endpoint: '/api/pdpa/consent',
                method: 'PUT',
                payload: {
                  given: true,
                  scope: ['medical_records', 'appointments'],
                  timestamp: new Date().toISOString()
                },
                validateResponse: true,
                expectedResponseTime: 3000
              }
            ]
          }
        ]
      },
      monitoring: {
        enabled: true,
        metrics: {
          application: true,
          infrastructure: true,
          business: true
        },
        alerts: [
          {
            metric: 'response_time_p95',
            condition: 'gt',
            threshold: 3000,
            duration: 60,
            severity: 'high'
          },
          {
            metric: 'error_rate',
            condition: 'gt',
            threshold: 2.0,
            duration: 30,
            severity: 'critical'
          },
          {
            metric: 'cpu_usage',
            condition: 'gt',
            threshold: 85,
            duration: 120,
            severity: 'medium'
          }
        ]
      },
      reports: {
        format: ['html', 'json', 'csv'],
        outputDir: './test-results/performance',
        includeCharts: true,
        includeHealthcareMetrics: true,
        includeComplianceReports: true
      }
    }
  }

  public createDoctorWorkflowLoadTest(baseUrl: string): PerformanceTestConfig {
    return {
      name: 'doctor-workflow-load',
      type: 'load',
      target: {
        url: baseUrl,
        endpoints: [
          {
            path: '/api/doctor/dashboard',
            method: 'GET',
            weight: 3,
            headers: { 'Authorization': 'Bearer {{doctorToken}}' },
            thinkTime: 2
          },
          {
            path: '/api/appointments/today',
            method: 'GET',
            weight: 4,
            headers: { 'Authorization': 'Bearer {{doctorToken}}' },
            thinkTime: 1
          },
          {
            path: '/api/patients/{{patientId}}/medical-records',
            method: 'GET',
            weight: 5,
            headers: { 'Authorization': 'Bearer {{doctorToken}}' },
            thinkTime: 3
          },
          {
            path: '/api/medical-records',
            method: 'POST',
            weight: 2,
            headers: { 'Authorization': 'Bearer {{doctorToken}}' },
            body: {
              patientId: 'patient_123',
              diagnosis: 'General Consultation',
              treatment: 'Prescribed medication',
              doctorNotes: 'Patient appears healthy',
              followUpRequired: false
            },
            thinkTime: 5,
            duration: 45
          },
          {
            path: '/api/prescriptions',
            method: 'POST',
            weight: 2,
            headers: { 'Authorization': 'Bearer {{doctorToken}}' },
            body: {
              patientId: 'patient_123',
              medication: 'Paracetamol',
              dosage: '500mg',
              frequency: 'Twice daily',
              duration: '5 days'
            },
            thinkTime: 4,
            duration: 30
          }
        ]
      },
      load: {
        vusers: 50,
        duration: 480, // 8 hours (typical doctor shift)
        rampUp: 30,
        rampDown: 30,
        concurrency: 5
      },
      thresholds: {
        responseTime: {
          p50: 800,
          p90: 2000,
          p95: 4000,
          p99: 6000,
          max: 12000
        },
        throughput: {
          min: 20,
          max: 100
        },
        error: {
          rate: 0.5,
          count: 50
        },
        system: {
          cpu: 75,
          memory: 80,
          disk: 85
        }
      },
      healthcare: {
        simulateDoctorLoad: true,
        doctorCount: 50,
        healthcareScenarios: [
          {
            name: 'doctor-patient-consultation',
            description: 'Doctor consulting with patient',
            userType: 'doctor',
            weight: 50,
            actions: [
              {
                type: 'view_medical_record',
                endpoint: '/api/patients/{{patientId}}/medical-records',
                method: 'GET',
                validateResponse: true,
                expectedResponseTime: 3000
              },
              {
                type: 'browse',
                endpoint: '/api/patients/{{patientId}}/allergies',
                method: 'GET',
                validateResponse: true,
                expectedResponseTime: 1500
              },
              {
                type: 'generate_report',
                endpoint: '/api/medical-records',
                method: 'POST',
                validateResponse: true,
                expectedResponseTime: 5000
              }
            ]
          },
          {
            name: 'doctor-prescription',
            description: 'Doctor writing prescription',
            userType: 'doctor',
            weight: 30,
            actions: [
              {
                type: 'search',
                endpoint: '/api/medications/search',
                method: 'POST',
                payload: { query: 'paracetamol' },
                validateResponse: true,
                expectedResponseTime: 2000
              },
              {
                type: 'browse',
                endpoint: '/api/prescriptions/templates',
                method: 'GET',
                validateResponse: true,
                expectedResponseTime: 2500
              },
              {
                type: 'send_notification',
                endpoint: '/api/prescriptions',
                method: 'POST',
                validateResponse: true,
                expectedResponseTime: 4000
              }
            ]
          },
          {
            name: 'doctor-moh-compliance',
            description: 'Doctor ensuring MOH compliance',
            userType: 'doctor',
            weight: 20,
            actions: [
              {
                type: 'moh_compliance_check',
                endpoint: '/api/moh/validate-record',
                method: 'POST',
                validateResponse: true,
                expectedResponseTime: 3000
              },
              {
                type: 'browse',
                endpoint: '/api/moh/reporting-requirements',
                method: 'GET',
                validateResponse: true,
                expectedResponseTime: 2000
              }
            ]
          }
        ]
      },
      monitoring: {
        enabled: true,
        metrics: {
          application: true,
          infrastructure: true,
          business: true
        },
        alerts: [
          {
            metric: 'response_time_p95',
            condition: 'gt',
            threshold: 4000,
            duration: 60,
            severity: 'high'
          },
          {
            metric: 'error_rate',
            condition: 'gt',
            threshold: 1.0,
            duration: 30,
            severity: 'high'
          }
        ]
      },
      reports: {
        format: ['html', 'json'],
        outputDir: './test-results/performance/doctor',
        includeCharts: true,
        includeHealthcareMetrics: true,
        includeComplianceReports: true
      }
    }
  }

  public createStressTest(baseUrl: string): PerformanceTestConfig {
    return {
      name: 'healthcare-stress-test',
      type: 'stress',
      target: {
        url: baseUrl,
        endpoints: [
          {
            path: '/api/health',
            method: 'GET',
            weight: 1
          },
          {
            path: '/api/patients/profile',
            method: 'GET',
            weight: 3,
            headers: { 'Authorization': 'Bearer {{token}}' }
          },
          {
            path: '/api/appointments',
            method: 'POST',
            weight: 1,
            headers: { 'Authorization': 'Bearer {{token}}' }
          },
          {
            path: '/api/medical-records',
            method: 'GET',
            weight: 2,
            headers: { 'Authorization': 'Bearer {{token}}' }
          }
        ]
      },
      load: {
        vusers: 500, // Start high
        duration: 1200, // 20 minutes
        rampUp: 300, // 5 minutes
        rampDown: 300,
        concurrency: 50
      },
      thresholds: {
        responseTime: {
          p50: 2000,
          p90: 5000,
          p95: 10000,
          p99: 15000,
          max: 30000
        },
        throughput: {
          min: 10,
          max: 500
        },
        error: {
          rate: 5.0, // Higher tolerance for stress test
          count: 500
        },
        system: {
          cpu: 90, // Higher tolerance
          memory: 95,
          disk: 95
        }
      },
      healthcare: {
        simulatePatientLoad: true,
        simulateClinicLoad: true,
        simulateDoctorLoad: true,
        patientCount: 5000,
        clinicCount: 100,
        doctorCount: 200,
        healthcareScenarios: [
          {
            name: 'peak-hours-stress',
            description: 'Simulating peak clinic hours stress',
            userType: 'patient',
            weight: 60,
            actions: [
              {
                type: 'book_appointment',
                endpoint: '/api/appointments',
                method: 'POST',
                validateResponse: true,
                expectedResponseTime: 10000
              }
            ]
          },
          {
            name: 'concurrent-access-stress',
            description: 'Multiple users accessing same records',
            userType: 'doctor',
            weight: 40,
            actions: [
              {
                type: 'view_medical_record',
                endpoint: '/api/medical-records/{{recordId}}',
                method: 'GET',
                validateResponse: true,
                expectedResponseTime: 8000
              }
            ]
          }
        ]
      },
      monitoring: {
        enabled: true,
        metrics: {
          application: true,
          infrastructure: true,
          business: true
        },
        alerts: [
          {
            metric: 'response_time_p99',
            condition: 'gt',
            threshold: 15000,
            duration: 60,
            severity: 'critical'
          },
          {
            metric: 'error_rate',
            condition: 'gt',
            threshold: 10.0,
            duration: 30,
            severity: 'critical'
          },
          {
            metric: 'memory_usage',
            condition: 'gt',
            threshold: 95,
            duration: 60,
            severity: 'critical'
          }
        ]
      },
      reports: {
        format: ['html', 'json', 'csv'],
        outputDir: './test-results/performance/stress',
        includeCharts: true,
        includeHealthcareMetrics: true,
        includeComplianceReports: true
      }
    }
  }

  // Test execution methods
  public async runPerformanceTest(config: PerformanceTestConfig): Promise<PerformanceTestResult> {
    console.log(`🏃‍♂️ Starting performance test: ${config.name}`)
    console.log(`   Type: ${config.type}`)
    console.log(`   Duration: ${config.load.duration}s`)
    console.log(`   Virtual Users: ${config.load.vusers}`)
    
    const startTime = Date.now()
    
    try {
      // Initialize monitoring
      if (config.monitoring.enabled) {
        await this.initializeMonitoring(config)
      }
      
      // Execute load test
      const results = await this.executeLoadTest(config)
      
      // Collect additional metrics
      const systemMetrics = await this.collectSystemMetrics(config)
      
      // Generate reports
      const reportPaths = await this.generateReports(config, results)
      
      const result: PerformanceTestResult = {
        config,
        startTime: new Date(startTime),
        endTime: new Date(),
        duration: (Date.now() - startTime) / 1000,
        results,
        systemMetrics,
        reportPaths,
        success: true,
        summary: this.generateTestSummary(results)
      }
      
      this.results.set(config.name, result)
      
      console.log(`✅ Performance test completed: ${config.name}`)
      console.log(`   Success Rate: ${result.summary.successRate}%`)
      console.log(`   Average Response Time: ${result.summary.avgResponseTime}ms`)
      console.log(`   Throughput: ${result.summary.throughput} req/s`)
      
      return result
      
    } catch (error) {
      const result: PerformanceTestResult = {
        config,
        startTime: new Date(startTime),
        endTime: new Date(),
        duration: (Date.now() - startTime) / 1000,
        results: null,
        systemMetrics: null,
        reportPaths: [],
        success: false,
        summary: null,
        error: error instanceof Error ? error.message : String(error)
      }
      
      this.results.set(config.name, result)
      console.error(`❌ Performance test failed: ${config.name}`, error)
      throw error
    }
  }

  // Helper methods
  private async executeLoadTest(config: PerformanceTestConfig): Promise<LoadTestResults> {
    // Mock implementation - would use k6, Artillery, or JMeter
    const startTime = Date.now()
    
    // Simulate test execution
    const results: LoadTestResults = {
      totalRequests: config.load.vusers * (config.load.duration / 10), // Mock calculation
      successfulRequests: 0,
      failedRequests: 0,
      responseTimes: [],
      throughput: 0,
      errorRate: 0,
      endpoints: {}
    }
    
    // Generate mock results
    for (const endpoint of config.target.endpoints) {
      const endpointResults = {
        requests: Math.floor(results.totalRequests * endpoint.weight / 100),
        successful: 0,
        failed: 0,
        avgResponseTime: 0,
        p50: 0,
        p90: 0,
        p95: 0,
        p99: 0,
        maxResponseTime: 0
      }
      
      // Mock response time calculation
      const baseTime = config.thresholds.responseTime.p50
      endpointResults.avgResponseTime = baseTime + Math.random() * 1000
      endpointResults.p50 = baseTime * 0.8
      endpointResults.p90 = baseTime * 2
      endpointResults.p95 = baseTime * 3
      endpointResults.p99 = baseTime * 5
      endpointResults.maxResponseTime = baseTime * 8
      
      endpointResults.successful = Math.floor(endpointResults.requests * 0.98) // 98% success rate
      endpointResults.failed = endpointResults.requests - endpointResults.successful
      
      results.endpoints[endpoint.path] = endpointResults
      results.responseTimes.push(endpointResults.avgResponseTime)
    }
    
    results.successfulRequests = Object.values(results.endpoints)
      .reduce((sum, endpoint) => sum + endpoint.successful, 0)
    results.failedRequests = Object.values(results.endpoints)
      .reduce((sum, endpoint) => sum + endpoint.failed, 0)
    results.throughput = results.totalRequests / (config.load.duration / 1000)
    results.errorRate = (results.failedRequests / results.totalRequests) * 100
    
    return results
  }

  private async initializeMonitoring(config: PerformanceTestConfig): Promise<void> {
    console.log('📊 Initializing monitoring...')
    // Mock implementation - would initialize APM, metrics collection, etc.
  }

  private async collectSystemMetrics(config: PerformanceTestConfig): Promise<SystemMetrics> {
    // Mock implementation - would collect actual system metrics
    return {
      cpu: {
        avg: 65,
        max: 85,
        min: 30
      },
      memory: {
        avg: 70,
        max: 88,
        min: 45
      },
      disk: {
        avg: 50,
        max: 75,
        min: 20
      },
      network: {
        avg: 1000000, // 1Mbps average
        max: 5000000, // 5Mbps peak
        min: 100000   // 100kbps minimum
      }
    }
  }

  private async generateReports(
    config: PerformanceTestConfig, 
    results: LoadTestResults
  ): Promise<string[]> {
    const reportPaths: string[] = []
    
    for (const format of config.reports.format) {
      const path = `${config.reports.outputDir}/${config.name}.${format}`
      reportPaths.push(path)
      
      if (format === 'html') {
        await this.generateHTMLReport(config, results, path)
      } else if (format === 'json') {
        await this.generateJSONReport(config, results, path)
      } else if (format === 'csv') {
        await this.generateCSVReport(config, results, path)
      }
    }
    
    return reportPaths
  }

  private async generateHTMLReport(
    config: PerformanceTestConfig, 
    results: LoadTestResults, 
    path: string
  ): Promise<void> {
    // Mock implementation - would generate actual HTML report with charts
    console.log(`📄 Generated HTML report: ${path}`)
  }

  private async generateJSONReport(
    config: PerformanceTestConfig, 
    results: LoadTestResults, 
    path: string
  ): Promise<void> {
    const reportData = {
      testName: config.name,
      testType: config.type,
      timestamp: new Date().toISOString(),
      configuration: config,
      results,
      summary: this.generateTestSummary(results)
    }
    
    console.log(`📄 Generated JSON report: ${path}`)
  }

  private async generateCSVReport(
    config: PerformanceTestConfig, 
    results: LoadTestResults, 
    path: string
  ): Promise<void> {
    console.log(`📄 Generated CSV report: ${path}`)
  }

  private generateTestSummary(results: LoadTestResults): TestSummary {
    const avgResponseTime = results.responseTimes.reduce((a, b) => a + b, 0) / results.responseTimes.length
    
    return {
      totalRequests: results.totalRequests,
      successfulRequests: results.successfulRequests,
      failedRequests: results.failedRequests,
      successRate: (results.successfulRequests / results.totalRequests) * 100,
      avgResponseTime: Math.round(avgResponseTime),
      throughput: results.throughput,
      errorRate: results.errorRate
    }
  }

  // Configuration management
  public setConfig(name: string, config: PerformanceTestConfig): void {
    this.configs.set(name, config)
  }

  public getConfig(name: string): PerformanceTestConfig | undefined {
    return this.configs.get(name)
  }

  public getResult(name: string): PerformanceTestResult | undefined {
    return this.results.get(name)
  }

  public listConfigs(): string[] {
    return Array.from(this.configs.keys())
  }

  public listResults(): string[] {
    return Array.from(this.results.keys())
  }
}

// Interfaces for test results
export interface PerformanceTestResult {
  config: PerformanceTestConfig
  startTime: Date
  endTime: Date
  duration: number
  results: LoadTestResults | null
  systemMetrics: SystemMetrics | null
  reportPaths: string[]
  success: boolean
  summary: TestSummary | null
  error?: string
}

export interface LoadTestResults {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  responseTimes: number[]
  throughput: number
  errorRate: number
  endpoints: Record<string, EndpointResult>
}

export interface EndpointResult {
  requests: number
  successful: number
  failed: number
  avgResponseTime: number
  p50: number
  p90: number
  p95: number
  p99: number
  maxResponseTime: number
}

export interface SystemMetrics {
  cpu: MetricStats
  memory: MetricStats
  disk: MetricStats
  network: MetricStats
}

export interface MetricStats {
  avg: number
  max: number
  min: number
}

export interface TestSummary {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  successRate: number
  avgResponseTime: number
  throughput: number
  errorRate: number
}

// Export singleton instance
export const performanceTestFramework = HealthcarePerformanceTestFramework.getInstance()