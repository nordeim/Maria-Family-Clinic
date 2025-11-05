/**
 * Testing Environment Configuration
 * Isolated environments for My Family Clinic healthcare platform testing
 */

export interface TestEnvironmentConfig {
  name: string
  type: 'unit' | 'integration' | 'e2e' | 'staging' | 'production'
  database: DatabaseConfig
  api: APIConfig
  services: ServiceConfig[]
  features: FeatureFlags
  compliance: ComplianceConfig
  monitoring: MonitoringConfig
}

export interface DatabaseConfig {
  provider: 'postgresql' | 'sqlite' | 'memory'
  host?: string
  port?: number
  name: string
  username?: string
  password?: string
  ssl?: boolean
  poolSize?: number
  migrations: boolean
  seeding: boolean
}

export interface APIConfig {
  baseUrl: string
  timeout: number
  retries: number
  rateLimit?: {
    requests: number
    window: number
  }
  authentication: {
    type: 'none' | 'basic' | 'bearer' | 'oauth2'
    credentials?: {
      username?: string
      password?: string
      token?: string
      clientId?: string
      clientSecret?: string
    }
  }
}

export interface ServiceConfig {
  name: string
  enabled: boolean
  url?: string
  port?: number
  healthCheck: {
    path: string
    timeout: number
    interval: number
  }
  dependencies: string[]
}

export interface FeatureFlags {
  [key: string]: boolean
}

export interface ComplianceConfig {
  pdpa: {
    enabled: boolean
    strict: boolean
    auditLogging: boolean
    dataRetention: {
      enabled: boolean
      maxAgeDays: number
    }
  }
  moh: {
    enabled: boolean
    standards: string[]
    validation: boolean
  }
  healthcare: {
    mockData: boolean
    anonymization: boolean
    encryption: boolean
  }
}

export interface MonitoringConfig {
  enabled: boolean
  level: 'none' | 'basic' | 'detailed' | 'comprehensive'
  metrics: {
    performance: boolean
    errors: boolean
    usage: boolean
    security: boolean
  }
  logging: {
    level: 'error' | 'warn' | 'info' | 'debug'
    format: 'json' | 'text'
    output: 'console' | 'file' | 'remote'
  }
}

export class HealthcareTestEnvironment {
  private static environments = new Map<string, TestEnvironmentConfig>()

  // Unit Testing Environment
  public static createUnitTestEnvironment(): TestEnvironmentConfig {
    return {
      name: 'unit-test',
      type: 'unit',
      database: {
        provider: 'memory',
        name: 'healthcare_unit_test',
        migrations: false,
        seeding: false
      },
      api: {
        baseUrl: 'http://localhost:3000',
        timeout: 5000,
        retries: 1,
        authentication: {
          type: 'none'
        }
      },
      services: [
        {
          name: 'mock-healthcare-api',
          enabled: true,
          port: 3001,
          healthCheck: {
            path: '/health',
            timeout: 1000,
            interval: 5000
          },
          dependencies: []
        },
        {
          name: 'mock-supabase',
          enabled: true,
          port: 54321,
          healthCheck: {
            path: '/rest/v1/',
            timeout: 1000,
            interval: 5000
          },
          dependencies: []
        }
      ],
      features: {
        pdpaMock: true,
        mohMock: true,
        healthcareMock: true,
        analyticsMock: true,
        performanceMock: true
      },
      compliance: {
        pdpa: {
          enabled: true,
          strict: false,
          auditLogging: false,
          dataRetention: {
            enabled: false,
            maxAgeDays: 7
          }
        },
        moh: {
          enabled: false,
          standards: [],
          validation: false
        },
        healthcare: {
          mockData: true,
          anonymization: true,
          encryption: false
        }
      },
      monitoring: {
        enabled: false,
        level: 'none',
        metrics: {
          performance: false,
          errors: true,
          usage: false,
          security: false
        },
        logging: {
          level: 'error',
          format: 'text',
          output: 'console'
        }
      }
    }
  }

  // Integration Testing Environment
  public static createIntegrationTestEnvironment(): TestEnvironmentConfig {
    return {
      name: 'integration-test',
      type: 'integration',
      database: {
        provider: 'postgresql',
        host: 'localhost',
        port: 5432,
        name: 'healthcare_integration_test',
        username: 'postgres',
        password: 'postgres',
        ssl: false,
        poolSize: 10,
        migrations: true,
        seeding: true
      },
      api: {
        baseUrl: 'http://localhost:3000',
        timeout: 10000,
        retries: 2,
        authentication: {
          type: 'bearer',
          credentials: {
            token: 'test-integration-token'
          }
        }
      },
      services: [
        {
          name: 'healthcare-api',
          enabled: true,
          port: 3000,
          healthCheck: {
            path: '/api/health',
            timeout: 5000,
            interval: 10000
          },
          dependencies: ['postgresql', 'supabase']
        },
        {
          name: 'supabase',
          enabled: true,
          port: 54321,
          healthCheck: {
            path: '/rest/v1/',
            timeout: 5000,
            interval: 10000
          },
          dependencies: ['postgresql']
        },
        {
          name: 'redis',
          enabled: true,
          port: 6379,
          healthCheck: {
            path: '/ping',
            timeout: 1000,
            interval: 5000
          },
          dependencies: []
        }
      ],
      features: {
        pdpaMock: true,
        mohMock: false,
        healthcareReal: true,
        analyticsMock: true,
        performanceMock: true,
        encryptionEnabled: true
      },
      compliance: {
        pdpa: {
          enabled: true,
          strict: true,
          auditLogging: true,
          dataRetention: {
            enabled: true,
            maxAgeDays: 2555 // 7 years
          }
        },
        moh: {
          enabled: true,
          standards: ['MOH-LIC-2025', 'PHMC-CERT-2025'],
          validation: true
        },
        healthcare: {
          mockData: true,
          anonymization: true,
          encryption: true
        }
      },
      monitoring: {
        enabled: true,
        level: 'detailed',
        metrics: {
          performance: true,
          errors: true,
          usage: true,
          security: true
        },
        logging: {
          level: 'info',
          format: 'json',
          output: 'file'
        }
      }
    }
  }

  // E2E Testing Environment
  public static createE2ETestEnvironment(): TestEnvironmentConfig {
    return {
      name: 'e2e-test',
      type: 'e2e',
      database: {
        provider: 'postgresql',
        host: 'localhost',
        port: 5432,
        name: 'healthcare_e2e_test',
        username: 'postgres',
        password: 'postgres',
        ssl: false,
        poolSize: 5,
        migrations: true,
        seeding: true
      },
      api: {
        baseUrl: 'http://localhost:3000',
        timeout: 30000,
        retries: 3,
        rateLimit: {
          requests: 100,
          window: 60000
        },
        authentication: {
          type: 'bearer',
          credentials: {
            token: 'test-e2e-token'
          }
        }
      },
      services: [
        {
          name: 'nextjs-app',
          enabled: true,
          port: 3000,
          healthCheck: {
            path: '/api/health',
            timeout: 10000,
            interval: 15000
          },
          dependencies: ['postgresql', 'supabase', 'redis']
        },
        {
          name: 'supabase',
          enabled: true,
          port: 54321,
          healthCheck: {
            path: '/rest/v1/',
            timeout: 10000,
            interval: 15000
          },
          dependencies: ['postgresql']
        },
        {
          name: 'redis',
          enabled: true,
          port: 6379,
          healthCheck: {
            path: '/ping',
            timeout: 2000,
            interval: 10000
          },
          dependencies: []
        }
      ],
      features: {
        pdpaMock: false,
        mohMock: false,
        healthcareReal: true,
        analyticsReal: true,
        performanceReal: true,
        encryptionEnabled: true,
        realPaymentProcessing: false // Disabled for testing
      },
      compliance: {
        pdpa: {
          enabled: true,
          strict: true,
          auditLogging: true,
          dataRetention: {
            enabled: true,
            maxAgeDays: 2555
          }
        },
        moh: {
          enabled: true,
          standards: ['MOH-LIC-2025', 'PHMC-CERT-2025', 'ISO-27001'],
          validation: true
        },
        healthcare: {
          mockData: false,
          anonymization: true,
          encryption: true
        }
      },
      monitoring: {
        enabled: true,
        level: 'comprehensive',
        metrics: {
          performance: true,
          errors: true,
          usage: true,
          security: true
        },
        logging: {
          level: 'debug',
          format: 'json',
          output: 'remote'
        }
      }
    }
  }

  // Staging Environment
  public static createStagingEnvironment(): TestEnvironmentConfig {
    return {
      name: 'staging',
      type: 'staging',
      database: {
        provider: 'postgresql',
        host: process.env.STAGING_DB_HOST || 'staging-db.internal',
        port: 5432,
        name: 'healthcare_staging',
        username: process.env.STAGING_DB_USER || 'staging_user',
        password: process.env.STAGING_DB_PASSWORD || 'staging_password',
        ssl: true,
        poolSize: 20,
        migrations: true,
        seeding: true
      },
      api: {
        baseUrl: process.env.STAGING_API_URL || 'https://staging-api.myfamilyclinic.com',
        timeout: 15000,
        retries: 3,
        rateLimit: {
          requests: 1000,
          window: 60000
        },
        authentication: {
          type: 'oauth2',
          credentials: {
            clientId: process.env.STAGING_CLIENT_ID,
            clientSecret: process.env.STAGING_CLIENT_SECRET
          }
        }
      },
      services: [
        {
          name: 'healthcare-api',
          enabled: true,
          url: process.env.STAGING_API_URL,
          healthCheck: {
            path: '/health',
            timeout: 5000,
            interval: 30000
          },
          dependencies: ['postgresql', 'supabase', 'redis', 'elasticsearch']
        },
        {
          name: 'supabase',
          enabled: true,
          url: process.env.STAGING_SUPABASE_URL,
          healthCheck: {
            path: '/rest/v1/',
            timeout: 5000,
            interval: 30000
          },
          dependencies: ['postgresql']
        },
        {
          name: 'redis',
          enabled: true,
          url: process.env.STAGING_REDIS_URL,
          healthCheck: {
            path: '/ping',
            timeout: 2000,
            interval: 10000
          },
          dependencies: []
        },
        {
          name: 'elasticsearch',
          enabled: true,
          url: process.env.STAGING_ES_URL,
          healthCheck: {
            path: '/_cluster/health',
            timeout: 5000,
            interval: 30000
          },
          dependencies: []
        }
      ],
      features: {
        pdpaReal: true,
        mohReal: true,
        healthcareReal: true,
        analyticsReal: true,
        performanceReal: true,
        encryptionEnabled: true,
        realPaymentProcessing: true,
        emailReal: true,
        smsReal: true
      },
      compliance: {
        pdpa: {
          enabled: true,
          strict: true,
          auditLogging: true,
          dataRetention: {
            enabled: true,
            maxAgeDays: 2555
          }
        },
        moh: {
          enabled: true,
          standards: ['MOH-LIC-2025', 'PHMC-CERT-2025', 'ISO-27001', 'HIPAA'],
          validation: true
        },
        healthcare: {
          mockData: false,
          anonymization: true,
          encryption: true
        }
      },
      monitoring: {
        enabled: true,
        level: 'comprehensive',
        metrics: {
          performance: true,
          errors: true,
          usage: true,
          security: true
        },
        logging: {
          level: 'info',
          format: 'json',
          output: 'remote'
        }
      }
    }
  }

  // Environment Management
  public static getEnvironment(name: string): TestEnvironmentConfig | undefined {
    return this.environments.get(name)
  }

  public static setEnvironment(name: string, config: TestEnvironmentConfig): void {
    this.environments.set(name, config)
  }

  public static listEnvironments(): string[] {
    return Array.from(this.environments.keys())
  }

  public static validateEnvironment(config: TestEnvironmentConfig): boolean {
    // Validate required fields
    if (!config.name || !config.type) {
      return false
    }

    // Validate database configuration
    if (!config.database.name || !config.database.provider) {
      return false
    }

    // Validate API configuration
    if (!config.api.baseUrl) {
      return false
    }

    // Validate compliance settings
    if (!config.compliance.pdpa.enabled !== undefined) {
      return false
    }

    return true
  }

  public static createEnvironmentFromTemplate(
    template: Partial<TestEnvironmentConfig>,
    overrides: Partial<TestEnvironmentConfig> = {}
  ): TestEnvironmentConfig {
    const defaultEnv = this.createUnitTestEnvironment()
    const merged = {
      ...defaultEnv,
      ...template,
      ...overrides,
      database: { ...defaultEnv.database, ...template.database, ...overrides.database },
      api: { ...defaultEnv.api, ...template.api, ...overrides.api },
      services: [
        ...(template.services || []),
        ...(overrides.services || [])
      ].filter((service, index, self) => 
        index === self.findIndex(s => s.name === service.name)
      ),
      features: { ...defaultEnv.features, ...template.features, ...overrides.features },
      compliance: {
        pdpa: { ...defaultEnv.compliance.pdpa, ...template.compliance?.pdpa, ...overrides.compliance?.pdpa },
        moh: { ...defaultEnv.compliance.moh, ...template.compliance?.moh, ...overrides.compliance?.moh },
        healthcare: { ...defaultEnv.compliance.healthcare, ...template.compliance?.healthcare, ...overrides.compliance?.healthcare }
      },
      monitoring: {
        ...defaultEnv.monitoring,
        ...template.monitoring,
        ...overrides.monitoring,
        metrics: { ...defaultEnv.monitoring.metrics, ...template.monitoring?.metrics, ...overrides.monitoring?.metrics },
        logging: { ...defaultEnv.monitoring.logging, ...template.monitoring?.logging, ...overrides.monitoring?.logging }
      }
    }

    if (!this.validateEnvironment(merged)) {
      throw new Error('Invalid environment configuration')
    }

    return merged
  }

  // Environment-specific utilities
  public static async startEnvironment(config: TestEnvironmentConfig): Promise<void> {
    console.log(`🚀 Starting healthcare test environment: ${config.name}`)

    // Start required services
    for (const service of config.services) {
      if (service.enabled) {
        console.log(`  - Starting service: ${service.name}`)
        // In a real implementation, this would start Docker containers or service processes
        await this.startService(service)
      }
    }

    // Wait for services to be healthy
    for (const service of config.services) {
      if (service.enabled) {
        await this.waitForServiceHealth(service)
      }
    }

    // Run database migrations if required
    if (config.database.migrations) {
      console.log('  - Running database migrations')
      await this.runMigrations(config.database)
    }

    // Seed database if required
    if (config.database.seeding) {
      console.log('  - Seeding test data')
      await this.seedDatabase(config.database)
    }

    console.log(`✅ Healthcare test environment ready: ${config.name}`)
  }

  public static async stopEnvironment(config: TestEnvironmentConfig): Promise<void> {
    console.log(`🛑 Stopping healthcare test environment: ${config.name}`)

    // Stop services in reverse order
    for (const service of config.services.slice().reverse()) {
      if (service.enabled) {
        console.log(`  - Stopping service: ${service.name}`)
        await this.stopService(service)
      }
    }

    console.log(`✅ Healthcare test environment stopped: ${config.name}`)
  }

  // Private helper methods
  private static async startService(service: ServiceConfig): Promise<void> {
    // Mock implementation - would start actual services
    console.log(`Starting ${service.name} on port ${service.port}`)
    // In reality: docker-compose up, systemd service, or process manager
  }

  private static async stopService(service: ServiceConfig): Promise<void> {
    // Mock implementation - would stop actual services
    console.log(`Stopping ${service.name}`)
  }

  private static async waitForServiceHealth(service: ServiceConfig): Promise<void> {
    const maxAttempts = 10
    const attemptDelay = 2000

    for (let i = 0; i < maxAttempts; i++) {
      try {
        // Mock health check - would make actual HTTP request
        console.log(`Health check for ${service.name} (attempt ${i + 1}/${maxAttempts})`)
        // In reality: fetch(`${service.url}:${service.port}${service.healthCheck.path}`)
        await new Promise(resolve => setTimeout(resolve, attemptDelay))
        console.log(`✅ ${service.name} is healthy`)
        return
      } catch (error) {
        if (i === maxAttempts - 1) {
          throw new Error(`Service ${service.name} failed health check after ${maxAttempts} attempts`)
        }
        await new Promise(resolve => setTimeout(resolve, attemptDelay))
      }
    }
  }

  private static async runMigrations(database: DatabaseConfig): Promise<void> {
    console.log(`Running migrations for ${database.name}`)
    // In reality: run prisma migrate or similar migration tool
  }

  private static async seedDatabase(database: DatabaseConfig): Promise<void> {
    console.log(`Seeding database ${database.name} with healthcare test data`)
    // In reality: run healthcare test data seeding scripts
  }
}

// Initialize default environments
HealthcareTestEnvironment.setEnvironment('unit', HealthcareTestEnvironment.createUnitTestEnvironment())
HealthcareTestEnvironment.setEnvironment('integration', HealthcareTestEnvironment.createIntegrationTestEnvironment())
HealthcareTestEnvironment.setEnvironment('e2e', HealthcareTestEnvironment.createE2ETestEnvironment())
HealthcareTestEnvironment.setEnvironment('staging', HealthcareTestEnvironment.createStagingEnvironment())

export { HealthcareTestEnvironment }