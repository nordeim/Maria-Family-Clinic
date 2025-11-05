/**
 * Healthcare-specific Jest configuration for My Family Clinic
 * Testing utilities, helpers, and data processing functions
 */

module.exports = {
  // Test environment
  testEnvironment: 'jsdom',
  
  // Test files pattern
  testMatch: [
    '<rootDir>/testing/utilities/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/testing/utilities/**/*.{test,spec}.{js,jsx,ts,tsx}',
    '<rootDir>/src/utils/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/utils/**/*.{test,spec}.{js,jsx,ts,tsx}',
    '<rootDir>/src/lib/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/lib/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],

  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/testing/infrastructure/frameworks/jest/healthcare-setup.js'
  ],

  // Module name mapping
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@testing/(.*)$': '<rootDir>/testing/$1',
    '^@healthcare/(.*)$': '<rootDir>/src/components/healthcare/$1',
  },

  // Transform configuration
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        '@babel/preset-typescript',
        ['@babel/preset-react', { runtime: 'automatic' }],
      ],
      plugins: [
        ['babel-plugin-styled-components', { displayName: true }],
        'babel-plugin-transform-import-meta',
      ],
    }],
  },

  // Module file extensions
  moduleFileExtensions: [
    'js',
    'jsx',
    'ts',
    'tsx',
    'json',
  ],

  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage/utilities',
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'json',
    'lcov',
    'cobertura',
  ],
  collectCoverageFrom: [
    'src/utils/**/*.{js,jsx,ts,tsx}',
    'src/lib/**/*.{js,jsx,ts,tsx}',
    'src/hooks/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/.next/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    // Higher thresholds for healthcare utilities
    'src/utils/healthcare/**': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
    'src/utils/validation/**': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },

  // Test timeout
  testTimeout: 10000,

  // Healthcare-specific test environment variables
  testEnvironmentOptions: {
    url: 'http://localhost',
    healthcare: {
      mockApi: true,
      testPatientId: 'test-patient-123',
      testDoctorId: 'test-doctor-456',
      testClinicId: 'test-clinic-789',
      pdpaCompliance: true,
      mohStandards: true,
    },
  },

  // Globals
  globals: {
    __DEV__: true,
    __TEST__: true,
  },

  // Module paths
  modulePaths: [
    '<rootDir>',
    '<rootDir>/src',
    '<rootDir>/testing',
  ],

  // Healthcare-specific watch plugins
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],

  // Snapshot configuration
  snapshotSerializers: [
    'enzyme-to-json/serializer',
  ],

  // Reporter configuration
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: 'test-results/jest',
      outputName: 'results.xml',
      suiteName: 'Healthcare Utility Tests',
      addFileAttribute: 'true',
      suiteNameTemplate: '{filepath}',
      classNameTemplate: '{classname}',
      titleTemplate: '{title}',
    }],
  ],
}