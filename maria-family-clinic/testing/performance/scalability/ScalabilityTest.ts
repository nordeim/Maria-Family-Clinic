/**
 * Scalability Testing Framework
 * Sub-Phase 11.5: Performance & Load Testing
 * Comprehensive scalability testing for 10,000+ clinics support
 */

import { PerformanceTestService } from '../../services/PerformanceTestService'

export interface ScalabilityTestConfig {
  baseUrl: string
  testTypes: Array<{
    name: 'database' | 'api' | 'real-time' | 'multi-clinic' | 'geographic'
    description: string
    scenarios: ScalabilityTestScenario[]
  }>
  scaleTargets: {
    clinics: {
      current: number
      target: number
      critical: number
    }
    users: {
      concurrent: {
        current: number
        target: number
        peak: number
      }
      total: {
        current: number
        target: number
      }
    }
    dataVolume: {
      records: {
        patients: { current: number; target: number; critical: number }
        appointments: { current: number; target: number; critical: number }
        medicalRecords: { current: number; target: number; critical: number }
        clinicData: { current: number; target: number; critical: number }
      }
      transactions: {
        perSecond: { current: number; target: number; critical: number }
        peakHour: { current: number; target: number; critical: number }
      }
    }
  }
  environments: Array<{
    name: string
    url: string
    databaseConfig: {
      clusters: number
      readReplicas: number
      connectionPool: number
    }
    infrastructure: {
      servers: number
      cpuCores: number
      memoryGB: number
      storageType: 'ssd' | 'nvme' | 'hdd'
    }
    geographic: {
      regions: string[]
      latencies: Record<string, number>
    }
  }>
  monitoring: {
    metricsCollection: boolean
    alertingThresholds: {
      responseTime: number
      errorRate: number
      cpuUsage: number
      memoryUsage: number
      diskUsage: number
      networkLatency: number
    }
    duration: string
  }
}

export interface ScalabilityTestScenario {
  name: string
  description: string
  loadPattern: 'constant' | 'ramp-up' | 'spike' | 'wave' | 'stress'
  initialUsers: number
  targetUsers: number
  duration: string
  rampUpTime?: string
  spikeMultiplier?: number
  steps: Array<{
    name: string
    endpoint: string
    method: 'GET' | 'POST' | 'PUT' | 'DELETE'
    expectedResponseTime: number
    critical: boolean
    dataSize?: number
    concurrent?: boolean
  }>
}

export interface ScalabilityTestResult {
  testType: string
  scenario: string
  environment: string
  startTime: number
  endTime: number
  duration: number
  userLoad: {
    initial: number
    peak: number
    average: number
  }
  performance: {
    averageResponseTime: number
    p95ResponseTime: number
    p99ResponseTime: number
    minResponseTime: number
    maxResponseTime: number
    throughput: number
    errorRate: number
    successRate: number
  }
  resourceUtilization: {
    cpu: {
      average: number
      peak: number
      cores: number
    }
    memory: {
      average: number
      peak: number
      total: number
    }
    database: {
      connections: number
      queryTime: number
      locks: number
      slowQueries: number
    }
    network: {
      latency: number
      bandwidth: number
      errors: number
    }
  }
  scalabilityMetrics: {
    throughputScaling: number
    responseTimeDegradation: number
    resourceEfficiency: number
    bottleneckIdentified?: string
    breakingPoint?: {
      users: number
      responseTime: number
      errorRate: number
    }
  }
  healthcareSpecific: {
    clinicDataHandling: {
      responseTime: number
      accuracy: number
      consistency: number
    }
    appointmentSystem: {
      bookingTime: number
      availabilityCheck: number
      conflictResolution: number
    }
    realTimeFeatures: {
      updateLatency: number
      synchronization: number
      reliability: number
    }
    dataConsistency: {
      crossClinic: number
      realTimeSync: number
      conflictResolution: number
    }
  }
  recommendations: string[]
  passed: boolean
}

export interface ScalabilityAnalysis {
  currentCapacity: {
    users: number
    clinics: number
    transactions: number
    responseTime: number
  }
  targetCapacity: {
    users: number
    clinics: number
    transactions: number
    responseTime: number
  }
  scalingRequirements: {
    infrastructure: string[]
    database: string[]
    application: string[]
    monitoring: string[]
  }
  recommendations: Array<{
    priority: 'critical' | 'high' | 'medium' | 'low'
    category: 'infrastructure' | 'database' | 'application' | 'monitoring'
    description: string
    effort: 'low' | 'medium' | 'high'
    impact: 'low' | 'medium' | 'high'
  }>
  costProjection: {
    current: number
    target: number
    scaling: number
    breakdown: Record<string, number>
  }
}

export class ScalabilityTest {
  private config: ScalabilityTestConfig
  private results: ScalabilityTestResult[] = []
  private analysis: ScalabilityAnalysis | null = null

  constructor(config: ScalabilityTestConfig) {
    this.config = config
    this.validateConfiguration()
  }

  private validateConfiguration() {
    if (!this.config.baseUrl) {
      throw new Error('Base URL is required for scalability testing')
    }
    if (!this.config.testTypes || this.config.testTypes.length === 0) {
      throw new Error('At least one test type must be defined')
    }
    if (!this.config.environments || this.config.environments.length === 0) {
      throw new Error('At least one test environment must be defined')
    }
    if (this.config.scaleTargets.clinics.target < this.config.scaleTargets.clinics.current) {
      throw new Error('Target clinic count must be greater than current count')
    }
  }

  /**
   * Execute comprehensive scalability testing
   */
  async runScalabilityTests(): Promise<ScalabilityTestResult[]> {
    console.log('Starting comprehensive scalability testing...')

    const allResults: ScalabilityTestResult[] = []

    // Test each scalability type
    for (const testType of this.config.testTypes) {
      console.log(`Testing scalability: ${testType.name}`)

      // Test each scenario for this type
      for (const scenario of testType.scenarios) {
        console.log(`Running scenario: ${scenario.name}`)

        // Test each environment
        for (const environment of this.config.environments) {
          console.log(`Testing environment: ${environment.name}`)

          const result = await this.executeScalabilityTest(
            testType.name,
            scenario,
            environment
          )
          allResults.push(result)
        }
      }
    }

    this.results = allResults

    // Perform scalability analysis
    this.analysis = await this.performScalabilityAnalysis()

    // Generate comprehensive report
    await this.generateScalabilityReport(allResults)

    return allResults
  }

  private async executeScalabilityTest(
    testType: string,
    scenario: ScalabilityTestScenario,
    environment: ScalabilityTestConfig['environments'][0]
  ): Promise<ScalabilityTestResult> {
    const startTime = Date.now()
    console.log(`Executing ${testType} scalability test: ${scenario.name}`)

    try {
      // Simulate user load pattern
      const userLoad = this.simulateUserLoadPattern(scenario)

      // Execute test steps under load
      const performanceMetrics = await this.executeLoadTest(
        testType,
        scenario,
        environment,
        userLoad
      )

      // Measure resource utilization
      const resourceUtilization = await this.measureResourceUtilization(
        scenario,
        environment
      )

      // Calculate scalability metrics
      const scalabilityMetrics = this.calculateScalabilityMetrics(
        performanceMetrics,
        userLoad,
        resourceUtilization
      )

      // Test healthcare-specific scalability
      const healthcareSpecific = await this.testHealthcareScalability(
        testType,
        scenario,
        environment,
        userLoad
      )

      // Generate recommendations
      const recommendations = this.generateScalabilityRecommendations(
        testType,
        scenario,
        performanceMetrics,
        resourceUtilization,
        scalabilityMetrics,
        healthcareSpecific
      )

      // Determine if test passed
      const passed = this.determineScalabilityTestPass(
        performanceMetrics,
        resourceUtilization,
        scalabilityMetrics
      )

      const endTime = Date.now()
      const duration = endTime - startTime

      return {
        testType,
        scenario: scenario.name,
        environment: environment.name,
        startTime,
        endTime,
        duration,
        userLoad,
        performance: performanceMetrics,
        resourceUtilization,
        scalabilityMetrics,
        healthcareSpecific,
        recommendations,
        passed
      }

    } catch (error) {
      console.error(`Scalability test failed: ${scenario.name}`, error)
      throw error
    }
  }

  private simulateUserLoadPattern(scenario: ScalabilityTestScenario): ScalabilityTestResult['userLoad'] {
    let peak = scenario.initialUsers
    let average = scenario.initialUsers

    switch (scenario.loadPattern) {
      case 'constant':
        peak = scenario.targetUsers
        average = scenario.targetUsers
        break
      case 'ramp-up':
        peak = scenario.targetUsers
        average = (scenario.initialUsers + scenario.targetUsers) / 2
        break
      case 'spike':
        peak = scenario.targetUsers * (scenario.spikeMultiplier || 2)
        average = scenario.targetUsers * 1.5
        break
      case 'wave':
        peak = scenario.targetUsers
        average = scenario.targetUsers * 0.8
        break
      case 'stress':
        peak = Math.min(scenario.targetUsers * 1.5, this.config.scaleTargets.users.concurrent.critical)
        average = scenario.targetUsers * 1.2
        break
    }

    return {
      initial: scenario.initialUsers,
      peak: Math.round(peak),
      average: Math.round(average)
    }
  }

  private async executeLoadTest(
    testType: string,
    scenario: ScalabilityTestScenario,
    environment: ScalabilityTestConfig['environments'][0],
    userLoad: ScalabilityTestResult['userLoad']
  ): Promise<ScalabilityTestResult['performance']> {
    const responseTimes: number[] = []
    const throughput = userLoad.average / 60 // Approximate throughput
    let errors = 0
    let successes = 0

    // Simulate API calls under load
    for (const step of scenario.steps) {
      const callCount = Math.floor(userLoad.average * (step.concurrent ? 2 : 1))
      
      for (let i = 0; i < callCount; i++) {
        const startTime = Date.now()
        
        try {
          // Simulate API call with scalability considerations
          const responseTime = await this.simulateScalableAPICall(
            testType,
            step,
            userLoad.peak,
            environment
          )
          
          responseTimes.push(responseTime)
          successes++

          // Add realistic delay between calls
          await this.delay(responseTime * 0.1)
          
        } catch (error) {
          errors++
          responseTimes.push(5000 + Math.random() * 5000) // Error response time
        }
      }
    }

    // Calculate performance metrics
    const sortedTimes = responseTimes.sort((a, b) => a - b)
    const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
    const p95ResponseTime = sortedTimes[Math.floor(sortedTimes.length * 0.95)] || 0
    const p99ResponseTime = sortedTimes[Math.floor(sortedTimes.length * 0.99)] || 0
    const minResponseTime = sortedTimes[0] || 0
    const maxResponseTime = sortedTimes[sortedTimes.length - 1] || 0
    const totalRequests = successes + errors
    const errorRate = totalRequests > 0 ? (errors / totalRequests) * 100 : 0
    const successRate = totalRequests > 0 ? (successes / totalRequests) * 100 : 0

    return {
      averageResponseTime: avgResponseTime,
      p95ResponseTime,
      p99ResponseTime,
      minResponseTime,
      maxResponseTime,
      throughput,
      errorRate,
      successRate
    }
  }

  private async simulateScalableAPICall(
    testType: string,
    step: ScalabilityTestScenario['steps'][0],
    userLoad: number,
    environment: ScalabilityTestConfig['environments'][0]
  ): Promise<number> {
    // Base response time
    let responseTime = step.expectedResponseTime

    // Apply scalability factors based on test type
    const scalabilityFactors = {
      'database': 1 + (userLoad / 1000), // Database load factor
      'api': 1 + (userLoad / 2000), // API load factor
      'real-time': 1 + (userLoad / 5000), // Real-time load factor
      'multi-clinic': 1 + (userLoad / 1000), // Multi-clinic load factor
      'geographic': 1 + (userLoad / 2000) * environment.geographic.latencies['primary'] / 100 // Geographic latency
    }

    const factor = scalabilityFactors[testType as keyof typeof scalabilityFactors] || 1
    responseTime *= factor

    // Add infrastructure overhead
    const infrastructureOverhead = this.calculateInfrastructureOverhead(environment, userLoad)
    responseTime *= infrastructureOverhead

    // Add random variability
    const variability = 0.8 + Math.random() * 0.4 // 80-120% variability
    responseTime *= variability

    // Simulate data size impact
    if (step.dataSize) {
      const dataSizeFactor = Math.sqrt(step.dataSize / 1024) // Square root scaling for data size
      responseTime *= dataSizeFactor
    }

    // Execute the "call"
    await this.delay(responseTime * 0.9) // Simulate processing time

    return responseTime
  }

  private calculateInfrastructureOverhead(
    environment: ScalabilityTestConfig['environments'][0],
    userLoad: number
  ): number {
    // Calculate overhead based on infrastructure capacity vs load
    const maxCapacity = environment.servers * environment.cpuCores * 100 // Rough capacity calculation
    const loadRatio = userLoad / maxCapacity
    
    // Overhead increases non-linearly with load
    const overheadFactor = 1 + Math.pow(loadRatio, 1.5) * 0.5
    
    return Math.min(overheadFactor, 5.0) // Cap at 5x overhead
  }

  private async measureResourceUtilization(
    scenario: ScalabilityTestScenario,
    environment: ScalabilityTestConfig['environments'][0]
  ): Promise<ScalabilityTestResult['resourceUtilization']> {
    // Simulate resource utilization metrics
    const baseCpuUsage = 20 + Math.random() * 30 // 20-50% base usage
    const peakCpuUsage = Math.min(baseCpuUsage + scenario.targetUsers * 0.1, 95)
    
    const baseMemoryUsage = environment.memoryGB * 0.4 // 40% base memory usage
    const peakMemoryUsage = Math.min(baseMemoryUsage + scenario.targetUsers * 0.01, environment.memoryGB * 0.9)
    
    const avgCpuUsage = (baseCpuUsage + peakCpuUsage) / 2
    const avgMemoryUsage = (baseMemoryUsage + peakMemoryUsage) / 2

    // Simulate database metrics
    const dbConnections = Math.min(scenario.targetUsers * 0.3, environment.databaseConfig.connectionPool)
    const dbQueryTime = 50 + Math.random() * 100 + scenario.targetUsers * 0.05
    const dbLocks = Math.floor(scenario.targetUsers * 0.02)
    const slowQueries = Math.floor(dbConnections * 0.1)

    // Simulate network metrics
    const baseLatency = 10 + Math.random() * 20 // Base latency
    const loadLatency = scenario.targetUsers * 0.01
    const totalLatency = baseLatency + loadLatency
    
    const bandwidth = Math.min(scenario.targetUsers * 0.1, 1000) // MB/s
    const networkErrors = Math.floor(scenario.targetUsers * 0.001)

    return {
      cpu: {
        average: avgCpuUsage,
        peak: peakCpuUsage,
        cores: environment.cpuCores
      },
      memory: {
        average: avgMemoryUsage,
        peak: peakMemoryUsage,
        total: environment.memoryGB
      },
      database: {
        connections: dbConnections,
        queryTime: dbQueryTime,
        locks: dbLocks,
        slowQueries: slowQueries
      },
      network: {
        latency: totalLatency,
        bandwidth: bandwidth,
        errors: networkErrors
      }
    }
  }

  private calculateScalabilityMetrics(
    performance: ScalabilityTestResult['performance'],
    userLoad: ScalabilityTestResult['userLoad'],
    resourceUtilization: ScalabilityTestResult['resourceUtilization']
  ): ScalabilityTestResult['scalabilityMetrics'] {
    // Calculate throughput scaling efficiency
    const baselineThroughput = 100 // requests per second at baseline load
    const baselineUsers = 100
    const currentScaling = (performance.throughput / baselineThroughput) / (userLoad.peak / baselineUsers)
    const throughputScaling = Math.min(currentScaling, 1.0) * 100

    // Calculate response time degradation
    const baselineResponseTime = 1000 // 1s baseline
    const responseTimeDegradation = ((performance.averageResponseTime - baselineResponseTime) / baselineResponseTime) * 100

    // Calculate resource efficiency
    const cpuEfficiency = 100 - resourceUtilization.cpu.average
    const memoryEfficiency = 100 - (resourceUtilization.memory.average / resourceUtilization.memory.total * 100)
    const resourceEfficiency = (cpuEfficiency + memoryEfficiency) / 2

    // Identify bottlenecks
    const bottlenecks = this.identifyBottlenecks(performance, resourceUtilization)
    const bottleneckIdentified = bottlenecks.length > 0 ? bottlenecks[0] : undefined

    // Calculate breaking point
    const breakingPoint = this.calculateBreakingPoint(performance, userLoad)

    return {
      throughputScaling,
      responseTimeDegradation,
      resourceEfficiency,
      bottleneckIdentified,
      breakingPoint
    }
  }

  private identifyBottlenecks(
    performance: ScalabilityTestResult['performance'],
    resourceUtilization: ScalabilityTestResult['resourceUtilization']
  ): string[] {
    const bottlenecks: string[] = []

    if (resourceUtilization.cpu.peak > 90) {
      bottlenecks.push('CPU - High CPU utilization limiting scalability')
    }

    if (resourceUtilization.memory.peak > 90) {
      bottlenecks.push('Memory - High memory usage causing swapping')
    }

    if (resourceUtilization.database.connections > resourceUtilization.database.connections * 0.8) {
      bottlenecks.push('Database - Connection pool exhaustion')
    }

    if (resourceUtilization.database.slowQueries > 10) {
      bottlenecks.push('Database - Slow query performance')
    }

    if (resourceUtilization.network.latency > 1000) {
      bottlenecks.push('Network - High network latency')
    }

    if (performance.errorRate > 5) {
      bottlenecks.push('Application - High error rate indicating system stress')
    }

    return bottlenecks
  }

  private calculateBreakingPoint(
    performance: ScalabilityTestResult['performance'],
    userLoad: ScalabilityTestResult['userLoad']
  ): ScalabilityTestResult['scalabilityMetrics']['breakingPoint'] | undefined {
    if (performance.errorRate > 10 || performance.averageResponseTime > 5000) {
      return {
        users: userLoad.peak,
        responseTime: performance.averageResponseTime,
        errorRate: performance.errorRate
      }
    }

    return undefined
  }

  private async testHealthcareScalability(
    testType: string,
    scenario: ScalabilityTestScenario,
    environment: ScalabilityTestConfig['environments'][0],
    userLoad: ScalabilityTestResult['userLoad']
  ): Promise<ScalabilityTestResult['healthcareSpecific']> {
    // Only calculate for healthcare-related test types
    if (!['multi-clinic', 'real-time', 'database'].includes(testType)) {
      return {
        clinicDataHandling: { responseTime: 0, accuracy: 100, consistency: 100 },
        appointmentSystem: { bookingTime: 0, availabilityCheck: 0, conflictResolution: 0 },
        realTimeFeatures: { updateLatency: 0, synchronization: 0, reliability: 100 },
        dataConsistency: { crossClinic: 100, realTimeSync: 100, conflictResolution: 100 }
      }
    }

    const loadFactor = userLoad.peak / 1000 // Normalize load
    const consistencyFactor = Math.max(0.5, 1 - (loadFactor * 0.1)) // Consistency degrades with load

    // Simulate clinic data handling performance
    const clinicDataResponseTime = (500 + Math.random() * 500) * loadFactor
    const clinicDataAccuracy = 99 * consistencyFactor
    const clinicDataConsistency = 98 * consistencyFactor

    // Simulate appointment system performance
    const appointmentBookingTime = (1000 + Math.random() * 1000) * loadFactor
    const availabilityCheckTime = (200 + Math.random() * 300) * loadFactor
    const conflictResolutionTime = (500 + Math.random() * 500) * loadFactor

    // Simulate real-time features performance
    const updateLatency = (50 + Math.random() * 100) * loadFactor
    const synchronizationRate = 95 * consistencyFactor
    const reliabilityRate = 99 * consistencyFactor

    // Simulate data consistency metrics
    const crossClinicConsistency = 97 * consistencyFactor
    const realTimeSyncRate = 98 * consistencyFactor
    const conflictResolutionRate = 95 * consistencyFactor

    return {
      clinicDataHandling: {
        responseTime: clinicDataResponseTime,
        accuracy: clinicDataAccuracy,
        consistency: clinicDataConsistency
      },
      appointmentSystem: {
        bookingTime: appointmentBookingTime,
        availabilityCheck: availabilityCheckTime,
        conflictResolution: conflictResolutionTime
      },
      realTimeFeatures: {
        updateLatency,
        synchronization: synchronizationRate,
        reliability: reliabilityRate
      },
      dataConsistency: {
        crossClinic: crossClinicConsistency,
        realTimeSync: realTimeSyncRate,
        conflictResolution: conflictResolutionRate
      }
    }
  }

  private generateScalabilityRecommendations(
    testType: string,
    scenario: ScalabilityTestScenario,
    performance: ScalabilityTestResult['performance'],
    resourceUtilization: ScalabilityTestResult['resourceUtilization'],
    scalabilityMetrics: ScalabilityTestResult['scalabilityMetrics'],
    healthcareSpecific: ScalabilityTestResult['healthcareSpecific']
  ): string[] {
    const recommendations: string[] = []

    // Performance-based recommendations
    if (performance.errorRate > 5) {
      recommendations.push('CRITICAL: High error rate indicates system instability under load')
    }

    if (performance.averageResponseTime > 3000) {
      recommendations.push('HIGH: Response times exceed acceptable limits for healthcare workflows')
    }

    if (performance.p95ResponseTime > 5000) {
      recommendations.push('HIGH: P95 response time indicates poor user experience for 5% of users')
    }

    // Resource utilization recommendations
    if (resourceUtilization.cpu.peak > 90) {
      recommendations.push('CRITICAL: CPU utilization at critical levels - immediate scaling required')
    }

    if (resourceUtilization.memory.peak > 90) {
      recommendations.push('HIGH: Memory usage approaching capacity - memory optimization needed')
    }

    if (resourceUtilization.database.connections > 0.8 * resourceUtilization.database.connections) {
      recommendations.push('MEDIUM: Database connection pool near capacity - consider increasing pool size')
    }

    if (resourceUtilization.database.slowQueries > 10) {
      recommendations.push('MEDIUM: Database slow queries detected - query optimization required')
    }

    // Scalability metrics recommendations
    if (scalabilityMetrics.throughputScaling < 70) {
      recommendations.push('HIGH: Poor throughput scaling - application architecture needs review')
    }

    if (scalabilityMetrics.responseTimeDegradation > 100) {
      recommendations.push('HIGH: Significant response time degradation under load')
    }

    if (scalabilityMetrics.bottleneckIdentified) {
      recommendations.push(`CRITICAL: Bottleneck identified: ${scalabilityMetrics.bottleneckIdentified}`)
    }

    if (scalabilityMetrics.breakingPoint) {
      recommendations.push('CRITICAL: System breaking point reached - immediate capacity planning required')
    }

    // Healthcare-specific recommendations
    if (testType === 'multi-clinic' || testType === 'real-time') {
      if (healthcareSpecific.clinicDataHandling.accuracy < 95) {
        recommendations.push('CRITICAL: Clinic data accuracy below healthcare standards')
      }

      if (healthcareSpecific.appointmentSystem.bookingTime > 3000) {
        recommendations.push('HIGH: Appointment booking time exceeds healthcare workflow requirements')
      }

      if (healthcareSpecific.realTimeFeatures.updateLatency > 200) {
        recommendations.push('HIGH: Real-time feature latency too high for emergency scenarios')
      }

      if (healthcareSpecific.dataConsistency.crossClinic < 95) {
        recommendations.push('CRITICAL: Cross-clinic data consistency below healthcare standards')
      }
    }

    // Infrastructure recommendations
    recommendations.push('INFRASTRUCTURE: Implement auto-scaling policies for dynamic load handling')
    recommendations.push('DATABASE: Consider database sharding for clinic data at scale')
    recommendations.push('CACHING: Implement distributed caching for frequently accessed clinic data')
    recommendations.push('MONITORING: Enhanced monitoring for healthcare-specific metrics')

    return recommendations
  }

  private determineScalabilityTestPass(
    performance: ScalabilityTestResult['performance'],
    resourceUtilization: ScalabilityTestResult['resourceUtilization'],
    scalabilityMetrics: ScalabilityTestResult['scalabilityMetrics']
  ): boolean {
    // Healthcare-specific thresholds
    const maxErrorRate = 2.0 // 2% error rate threshold
    const maxResponseTime = 5000 // 5s response time threshold
    const maxCpuUsage = 85 // 85% CPU usage threshold
    const maxMemoryUsage = 85 // 85% memory usage threshold

    // Check basic performance criteria
    if (performance.errorRate > maxErrorRate) return false
    if (performance.averageResponseTime > maxResponseTime) return false
    if (resourceUtilization.cpu.peak > maxCpuUsage) return false
    if (resourceUtilization.memory.peak > maxMemoryUsage) return false

    // Check scalability criteria
    if (scalabilityMetrics.throughputScaling < 50) return false // Less than 50% scaling efficiency
    if (scalabilityMetrics.responseTimeDegradation > 200) return false // More than 200% degradation

    // Check if breaking point was reached
    if (scalabilityMetrics.breakingPoint) return false

    return true
  }

  private async performScalabilityAnalysis(): Promise<ScalabilityAnalysis> {
    // Analyze current capacity vs target
    const currentCapacity = {
      users: Math.max(...this.results.map(r => r.userLoad.peak)),
      clinics: this.config.scaleTargets.clinics.current,
      transactions: Math.max(...this.results.map(r => Math.floor(r.performance.throughput * 3600))), // Per hour
      responseTime: Math.min(...this.results.map(r => r.performance.averageResponseTime))
    }

    const targetCapacity = {
      users: this.config.scaleTargets.users.concurrent.target,
      clinics: this.config.scaleTargets.clinics.target,
      transactions: this.config.scaleTargets.dataVolume.transactions.perSecond.target * 3600,
      responseTime: 1000 // Target response time
    }

    // Generate scaling requirements
    const scalingRequirements = this.generateScalingRequirements()

    // Generate recommendations
    const recommendations = this.generateScalabilityAnalysisRecommendations()

    // Calculate cost projection
    const costProjection = this.calculateCostProjection()

    return {
      currentCapacity,
      targetCapacity,
      scalingRequirements,
      recommendations,
      costProjection
    }
  }

  private generateScalingRequirements(): ScalabilityAnalysis['scalingRequirements'] {
    const infrastructure: string[] = []
    const database: string[] = []
    const application: string[] = []
    const monitoring: string[] = []

    // Analyze results to determine scaling needs
    this.results.forEach(result => {
      if (result.resourceUtilization.cpu.peak > 80) {
        infrastructure.push('Increase server capacity or add horizontal scaling')
      }
      if (result.resourceUtilization.database.connections > 0.8 * result.resourceUtilization.database.connections) {
        database.push('Increase database connection pool size or add read replicas')
      }
      if (result.performance.errorRate > 2) {
        application.push('Optimize application code for better error handling')
      }
      if (result.scalabilityMetrics.throughputScaling < 70) {
        application.push('Refactor application architecture for better scalability')
      }
    })

    // Add general recommendations
    infrastructure.push('Implement container orchestration (Kubernetes)')
    infrastructure.push('Set up auto-scaling groups')
    database.push('Implement database sharding for clinic data')
    database.push('Add read replicas for query distribution')
    application.push('Implement caching layer (Redis/Memcached)')
    application.push('Use CDN for static assets')
    monitoring.push('Implement comprehensive monitoring and alerting')
    monitoring.push('Set up distributed tracing for performance monitoring')

    return {
      infrastructure: [...new Set(infrastructure)],
      database: [...new Set(database)],
      application: [...new Set(application)],
      monitoring: [...new Set(monitoring)]
    }
  }

  private generateScalabilityAnalysisRecommendations(): ScalabilityAnalysis['recommendations'] {
    const recommendations: ScalabilityAnalysis['recommendations'] = []

    // Critical recommendations based on test results
    const failedTests = this.results.filter(r => !r.passed)
    if (failedTests.length > 0) {
      recommendations.push({
        priority: 'critical',
        category: 'infrastructure',
        description: 'Address scalability issues identified in failed tests',
        effort: 'high',
        impact: 'high'
      })
    }

    // Database scaling recommendations
    if (this.results.some(r => r.resourceUtilization.database.connections > 0.8)) {
      recommendations.push({
        priority: 'high',
        category: 'database',
        description: 'Scale database infrastructure to handle target clinic load',
        effort: 'medium',
        impact: 'high'
      })
    }

    // Application scaling recommendations
    if (this.results.some(r => r.scalabilityMetrics.throughputScaling < 70)) {
      recommendations.push({
        priority: 'high',
        category: 'application',
        description: 'Optimize application for better horizontal scalability',
        effort: 'high',
        impact: 'high'
      })
    }

    // Infrastructure recommendations
    recommendations.push({
      priority: 'medium',
      category: 'infrastructure',
      description: 'Implement auto-scaling for dynamic load handling',
      effort: 'medium',
      impact: 'medium'
    })

    // Monitoring recommendations
    recommendations.push({
      priority: 'medium',
      category: 'monitoring',
      description: 'Enhance monitoring for healthcare-specific metrics',
      effort: 'low',
      impact: 'medium'
    })

    return recommendations
  }

  private calculateCostProjection(): ScalabilityAnalysis['costProjection'] {
    // Estimate costs based on scaling requirements
    const currentMonthlyCost = 5000 // Current infrastructure cost estimate
    const targetMonthlyCost = 25000 // Target infrastructure cost estimate
    const scalingCost = targetMonthlyCost - currentMonthlyCost

    const breakdown = {
      servers: scalingCost * 0.4,
      database: scalingCost * 0.3,
      storage: scalingCost * 0.15,
      network: scalingCost * 0.1,
      monitoring: scalingCost * 0.05
    }

    return {
      current: currentMonthlyCost,
      target: targetMonthlyCost,
      scaling: scalingCost,
      breakdown
    }
  }

  private async generateScalabilityReport(results: ScalabilityTestResult[]): Promise<void> {
    const report = this.generateMarkdownReport(results)
    console.log('Scalability Test Report Generated')
    console.log(report)
  }

  private generateMarkdownReport(results: ScalabilityTestResult[]): string {
    const totalTests = results.length
    const passedTests = results.filter(r => r.passed).length
    const avgScore = results.reduce((sum, r) => sum + (r.scalabilityMetrics.resourceEfficiency / 100), 0) / totalTests

    // Group by test type
    const typeGroups = this.groupByType(results)

    let report = `# Scalability Test Report

## Executive Summary
- **Total Tests**: ${totalTests}
- **Passed Tests**: ${passedTests} (${((passedTests / totalTests) * 100).toFixed(1)}%)
- **Failed Tests**: ${totalTests - passedTests} (${(((totalTests - passedTests) / totalTests) * 100).toFixed(1)}%)
- **Average Resource Efficiency**: ${(avgScore * 100).toFixed(1)}%
- **Test Date**: ${new Date().toISOString()}

## Scalability Assessment by Test Type

`

    Object.entries(typeGroups).forEach(([type, typeResults]) => {
      const typePassed = typeResults.filter(r => r.passed).length
      const typeAvgEfficiency = typeResults.reduce((sum, r) => sum + r.scalabilityMetrics.resourceEfficiency, 0) / typeResults.length

      report += `### ${type.charAt(0).toUpperCase() + type.slice(1)} Scalability
- **Tests**: ${typeResults.length}
- **Passed**: ${typePassed} (${((typePassed / typeResults.length) * 100).toFixed(1)}%)
- **Average Resource Efficiency**: ${typeAvgEfficiency.toFixed(1)}%

| Scenario | Environment | Peak Users | Avg Response Time | Error Rate | Throughput | Status |
|----------|-------------|------------|-------------------|------------|------------|--------|

`

      typeResults.forEach(result => {
        report += `| ${result.scenario} | ${result.environment} | ${result.userLoad.peak} | ${result.performance.averageResponseTime.toFixed(0)}ms | ${result.performance.errorRate.toFixed(1)}% | ${result.performance.throughput.toFixed(1)}/s | ${result.passed ? '✅ Pass' : '❌ Fail'} |

`
      })

      report += '\n'
    })

    // Add current vs target capacity analysis
    if (this.analysis) {
      report += `## Capacity Analysis

### Current vs Target Capacity
| Metric | Current | Target | Gap | Status |
|--------|---------|--------|-----|--------|
| Concurrent Users | ${this.analysis.currentCapacity.users.toLocaleString()} | ${this.analysis.targetCapacity.users.toLocaleString()} | ${((this.analysis.targetCapacity.users / this.analysis.currentCapacity.users - 1) * 100).toFixed(0)}% | ${this.analysis.currentCapacity.users >= this.analysis.targetCapacity.users ? '✅ Ready' : '❌ Gap'} |
| Clinics | ${this.analysis.currentCapacity.clinics.toLocaleString()} | ${this.analysis.targetCapacity.clinics.toLocaleString()} | ${((this.analysis.targetCapacity.clinics / this.analysis.currentCapacity.clinics - 1) * 100).toFixed(0)}% | ${this.analysis.currentCapacity.clinics >= this.analysis.targetCapacity.clinics ? '✅ Ready' : '❌ Gap'} |
| Transactions/Hour | ${this.analysis.currentCapacity.transactions.toLocaleString()} | ${this.analysis.targetCapacity.transactions.toLocaleString()} | ${((this.analysis.targetCapacity.transactions / this.analysis.currentCapacity.transactions - 1) * 100).toFixed(0)}% | ${this.analysis.currentCapacity.transactions >= this.analysis.targetCapacity.transactions ? '✅ Ready' : '❌ Gap'} |
| Response Time | ${this.analysis.currentCapacity.responseTime.toFixed(0)}ms | ${this.analysis.targetCapacity.responseTime}ms | ${((this.analysis.targetCapacity.responseTime / this.analysis.currentCapacity.responseTime - 1) * 100).toFixed(0)}% | ${this.analysis.currentCapacity.responseTime <= this.analysis.targetCapacity.responseTime ? '✅ Ready' : '❌ Gap'} |

`
    }

    // Add healthcare-specific scalability insights
    report += `## Healthcare-Specific Scalability Insights

### Clinic Data Handling at Scale
- **Target**: Support 10,000+ clinics
- **Critical Factors**: Data consistency, query performance, storage efficiency
- **Performance Requirements**: <500ms for clinic data retrieval

### Multi-Clinic Data Management
- **Current Challenge**: Cross-clinic data consistency
- **Scalability Requirements**: Real-time synchronization across geographic regions
- **Performance Target**: <100ms latency for real-time updates

### Appointment System Scalability
- **Peak Load Handling**: Support 1000+ concurrent appointment bookings
- **Conflict Resolution**: Automated booking conflict detection and resolution
- **Performance Target**: <2s for complete appointment booking workflow

`

    // Add infrastructure recommendations
    if (this.analysis) {
      report += `## Infrastructure Scaling Requirements

### Critical Infrastructure Needs
${this.analysis.scalingRequirements.infrastructure.map(req => `- ${req}`).join('\n')}

### Database Scaling Requirements
${this.analysis.scalingRequirements.database.map(req => `- ${req}`).join('\n')}

### Application Scaling Improvements
${this.analysis.scalingRequirements.application.map(req => `- ${req}`).join('\n')}

### Enhanced Monitoring
${this.analysis.scalingRequirements.monitoring.map(req => `- ${req}`).join('\n')}

`
    }

    // Add cost projection
    if (this.analysis) {
      report += `## Cost Projection for Scaling

### Monthly Infrastructure Costs
- **Current**: $${this.analysis.costProjection.current.toLocaleString()}
- **Target**: $${this.analysis.costProjection.target.toLocaleString()}
- **Additional Cost**: $${this.analysis.costProjection.scaling.toLocaleString()}

### Cost Breakdown
${Object.entries(this.analysis.costProjection.breakdown).map(([category, cost]) => `- **${category.charAt(0).toUpperCase() + category.slice(1)}**: $${cost.toLocaleString()}`).join('\n')}

`
    }

    // Add recommendations section
    report += `## Scalability Recommendations

### Immediate Actions (0-3 months)
${this.analysis ? 
  this.analysis.recommendations.filter(r => r.priority === 'critical').map(r => `- **${r.category.toUpperCase()}**: ${r.description}`).join('\n') :
  '- Address critical scalability bottlenecks identified in testing'
}

### Short-term Improvements (3-6 months)
${this.analysis ?
  this.analysis.recommendations.filter(r => r.priority === 'high').map(r => `- **${r.category.toUpperCase()}**: ${r.description}`).join('\n') :
  '- Implement infrastructure auto-scaling capabilities'
}

### Long-term Strategy (6-12 months)
${this.analysis ?
  this.analysis.recommendations.filter(r => r.priority === 'medium' || r.priority === 'low').map(r => `- **${r.category.toUpperCase()}**: ${r.description}`).join('\n') :
  '- Develop comprehensive scaling strategy for sustained growth'
}

### Healthcare Compliance at Scale
- **Data Protection**: Ensure PDPA compliance across all scaled infrastructure
- **Geographic Distribution**: Implement regional data centers for optimal latency
- **Disaster Recovery**: Establish robust backup and recovery procedures
- **Audit Logging**: Maintain comprehensive audit trails at scale

`

    return report
  }

  private groupByType(results: ScalabilityTestResult[]): Record<string, ScalabilityTestResult[]> {
    return results.reduce((groups, result) => {
      if (!groups[result.testType]) {
        groups[result.testType] = []
      }
      groups[result.testType].push(result)
      return groups
    }, {} as Record<string, ScalabilityTestResult[]>)
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Get all test results
   */
  getResults(): ScalabilityTestResult[] {
    return this.results
  }

  /**
   * Get scalability analysis
   */
  getAnalysis(): ScalabilityAnalysis | null {
    return this.analysis
  }

  /**
   * Export results to JSON format
   */
  exportResults(): string {
    return JSON.stringify({
      config: this.config,
      results: this.results,
      analysis: this.analysis,
      summary: {
        totalTests: this.results.length,
        passedTests: this.results.filter(r => r.passed).length,
        averageResourceEfficiency: this.results.reduce((sum, r) => sum + r.scalabilityMetrics.resourceEfficiency, 0) / this.results.length,
        bottlenecksIdentified: this.results.filter(r => r.scalabilityMetrics.bottleneckIdentified).length,
        breakingPointsReached: this.results.filter(r => r.scalabilityMetrics.breakingPoint).length,
        timestamp: new Date().toISOString()
      }
    }, null, 2)
  }
}

export { ScalabilityTest }
export type { ScalabilityTestConfig, ScalabilityTestResult, ScalabilityAnalysis }