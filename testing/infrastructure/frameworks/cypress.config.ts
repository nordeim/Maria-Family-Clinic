import { defineConfig } from 'cypress'

/**
 * Healthcare-specific Cypress configuration for My Family Clinic
 * Integration testing for API workflows and healthcare interactions
 */

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'testing/infrastructure/frameworks/cypress/support/e2e.ts',
    specPattern: 'testing/integration/**/*.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    
    // Healthcare-specific timeout settings
    defaultCommandTimeout: 10000,
    requestTimeout: 15000,
    responseTimeout: 15000,
    pageLoadTimeout: 30000,
    
    // Video and screenshot configuration for CI
    video: true,
    screenshotOnRunFailure: true,
    screenshotsFolder: 'test-results/cypress/screenshots',
    videosFolder: 'test-results/cypress/videos',
    videoCompression: 32,
    
    setupNodeEvents(on, config) {
      // Healthcare-specific task definitions
      on('task', {
        /**
         * Seed healthcare test database
         */
        seedHealthcareDatabase() {
          // Mock implementation - would connect to test database
          console.log('Seeding healthcare test database...')
          return { success: true, message: 'Healthcare database seeded' }
        },

        /**
         * Clear healthcare test data
         */
        clearHealthcareData() {
          // Mock implementation - would clear test data
          console.log('Clearing healthcare test data...')
          return { success: true, message: 'Healthcare data cleared' }
        },

        /**
         * Mock healthcare API responses
         */
        mockHealthcareApi(endpoint, response) {
          // Mock implementation for healthcare API
          console.log(`Mocking ${endpoint} with response:`, response)
          return { success: true, endpoint, response }
        },

        /**
         * Validate PDPA compliance
         */
        validatePDPACompliance(elementSelector) {
          // Mock implementation for PDPA validation
          console.log(`Validating PDPA compliance for ${elementSelector}`)
          return { compliant: true, details: 'PDPA validation passed' }
        },

        /**
         * Check MOH standards compliance
         */
        checkMOHStandards(elementSelector) {
          // Mock implementation for MOH validation
          console.log(`Checking MOH standards for ${elementSelector}`)
          return { compliant: true, standards: 'MOH validation passed' }
        }
      })

      // Healthcare-specific plugin configuration
      on('before:browser:launch', (browser = {}, launchOptions) => {
        if (browser.family === 'chromium') {
          launchOptions.args.push('--disable-dev-shm-usage')
          launchOptions.args.push('--no-sandbox')
          // Enable healthcare-specific features
          launchOptions.args.push('--enable-features=MedicalDataAPI')
        }
        return launchOptions
      })

      return config
    },
  },

  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
    specPattern: 'testing/components/**/*.{js,jsx,ts,tsx}',
    supportFile: 'testing/infrastructure/frameworks/cypress/support/component.ts',
    indexHtmlFile: 'testing/infrastructure/frameworks/cypress/support/component-index.html',
  },

  // Environment configuration
  env: {
    healthcare: {
      apiUrl: 'http://localhost:3000/api',
      testPatientId: 'test-patient-123',
      testDoctorId: 'test-doctor-456',
      testClinicId: 'test-clinic-789',
    },
    pdpa: {
      consentRequired: true,
      dataRetentionDays: 2555, // 7 years for medical records in Singapore
    },
    moh: {
      validateStandards: true,
      checkMedicalFormats: true,
      validateAppointmentRules: true,
    },
    // Accessibility testing configuration
    accessibility: {
      enabled: true,
      threshold: 'serious',
    },
    // Performance testing configuration
    performance: {
      enabled: true,
      budget: {
        firstContentfulPaint: 1500,
        largestContentfulPaint: 2500,
        firstInputDelay: 100,
        cumulativeLayoutShift: 0.1,
      },
    },
  },

  // Healthcare-specific configuration
  retries: {
    runMode: 2,
    openMode: 0,
  },

  // Test settings for healthcare workflows
  testFiles: [
    'healthcare/**/*.cy.{js,jsx,ts,tsx}',
    'integration/**/*.cy.{js,jsx,ts,tsx}',
    'api/**/*.cy.{js,jsx,ts,tsx}',
    'pdpa/**/*.cy.{js,jsx,ts,tsx}',
    'moh/**/*.cy.{js,jsx,ts,tsx}',
  ],

  // Exclusion patterns
  excludeSpecPattern: [
    '**/__tests__/**',
    '**/node_modules/**',
    '**/dist/**',
    '**/.next/**',
  ],
})