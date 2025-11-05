# Testing Infrastructure Guide

## Overview

This comprehensive testing infrastructure for My Family Clinic healthcare platform provides complete testing coverage for 100+ components across 7 specialized systems with healthcare-specific requirements, PDPA compliance, and MOH standards.

## 🏗️ Architecture Overview

### Testing Framework Stack

The testing infrastructure supports multiple testing frameworks optimized for healthcare workflows:

- **Vitest** - Unit testing for utilities and business logic
- **React Testing Library** - Component testing with healthcare UI patterns
- **Playwright** - End-to-end testing for complete user workflows
- **Cypress** - Integration testing for API and service interactions
- **Jest** - Utility and data processing testing

### Healthcare-Specific Features

- **PDPA Compliance Testing** - Privacy and consent validation
- **MOH Standards Validation** - Healthcare regulation compliance
- **Healthier SG Integration Testing** - Singapore health program workflows
- **Medical Data Validation** - Healthcare data format and integrity testing
- **Multi-language Support** - English, Mandarin, Malay, Tamil testing
- **Cross-browser Healthcare UI** - Chrome, Firefox, Safari, Edge compatibility

## 📁 Directory Structure

```
testing/infrastructure/
├── frameworks/           # Testing framework configurations
│   ├── vitest.config.ts
│   ├── playwright.config.ts
│   ├── cypress.config.ts
│   ├── jest.config.js
│   └── vitest/healthcare-setup.ts
├── healthcare/           # Healthcare-specific testing utilities
│   └── HealthcareTestFramework.ts
├── synthetic-data/      # Healthcare test data generators
│   └── HealthcareDataGenerator.ts
├── ci-cd/               # GitHub Actions and CI/CD pipelines
│   ├── github-actions-testing-pipeline.yml
│   └── pre-commit-hooks.sh
├── environments/        # Isolated test environments
│   └── HealthcareTestEnvironment.ts
├── performance/         # Performance testing configuration
│   └── HealthcarePerformanceTestFramework.ts
├── security/           # Security and PDPA testing
│   └── HealthcareSecurityTestFramework.ts
├── accessibility/      # Accessibility testing tools
│   └── HealthcareAccessibilityTestFramework.ts
├── utilities/          # Testing utility functions
│   └── TestingUtils.ts
└── docs/              # Documentation and guides
    └── this-file.md
```

## 🚀 Quick Start

### Installation

```bash
# Install core testing dependencies
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
npm install --save-dev @playwright/test @axe-core/playwright
npm install --save-dev cypress @cypress/react18 jest @types/jest

# Install healthcare-specific testing tools
npm install --save-dev axe-core @axe-core/react
npm install --save-dev lighthouse lighthouse-ci
npm install --save-dev medical-data-validator

# Install performance testing tools
npm install --save-dev k6 artillery
npm install --save-dev lighthouse performance-observer
```

### Environment Setup

1. **Copy configuration files** from `/testing/infrastructure/frameworks/` to your project root
2. **Install pre-commit hooks**:
   ```bash
   chmod +x testing/infrastructure/ci-cd/pre-commit-hooks.sh
   cp testing/infrastructure/ci-cd/pre-commit-hooks.sh .git/hooks/pre-commit
   ```
3. **Set up test database** with healthcare-specific schemas
4. **Configure environment variables** for testing

### Run Tests

```bash
# Unit tests
npm run test

# Component tests
npm run test:components

# E2E tests
npm run test:e2e

# Integration tests
npm run test:integration

# Performance tests
npm run test:performance

# Accessibility tests
npm run test:a11y

# Security tests
npm run test:security

# Healthcare compliance tests
npm run test:compliance

# All tests with coverage
npm run test:all
```

## 🏥 Healthcare-Specific Testing

### PDPA Compliance Testing

The infrastructure includes comprehensive PDPA compliance testing:

```typescript
import { securityTestFramework } from './testing/infrastructure/security/HealthcareSecurityTestFramework'

// Run PDPA compliance test
const pdpaTest = securityTestFramework.createPDPAComplianceTest('http://localhost:3000')
const result = await securityTestFramework.runSecurityTest(pdpaTest)

console.log(`PDPA Compliance: ${result.overallCompliance ? 'PASS' : 'FAIL'}`)
```

**PDPA Test Coverage:**
- ✅ Consent Collection Validation
- ✅ Data Minimization Check
- ✅ Purpose Limitation Validation
- ✅ Right to Deletion Test
- ✅ Data Retention Policy Compliance
- ✅ Data Portability Test

### MOH Standards Validation

Healthcare compliance testing for Singapore MOH standards:

```typescript
const mohTest = securityTestFramework.createMOHStandardsTest('http://localhost:3000')
const result = await securityTestFramework.runSecurityTest(mohTest)
```

**MOH Test Coverage:**
- ✅ Doctor Registration Validation
- ✅ Medical Record Format Compliance
- ✅ Prescription Validation
- ✅ Clinic Licensing Compliance

### Healthier SG Integration Testing

Testing for Singapore's Healthier SG health program:

```typescript
import { healthcareTestFramework } from './testing/infrastructure/healthcare/HealthcareTestFramework'

// Create Healthier SG test scenario
const healthierSGScenario = healthcareTestFramework.createHealthierSGScenario()
const appointment = healthcareTestFramework.generateAppointmentData(patientId, doctorId, {
  type: 'health-screening'
})
```

## 🧪 Test Data Generation

### Synthetic Healthcare Data

Generate realistic, anonymized healthcare test data:

```typescript
import { healthcareDataGenerator } from './testing/infrastructure/synthetic-data/HealthcareDataGenerator'

// Generate test patients
const patients = healthcareDataGenerator.generatePatients({
  count: 100,
  anonymize: true,
  locales: ['en', 'zh', 'ms', 'ta']
})

// Generate complete healthcare dataset
const dataset = healthcareDataGenerator.generateCompleteDataset({
  count: 50,
  anonymize: true,
  includeSensitiveData: false,
  dateRange: {
    start: new Date('2020-01-01'),
    end: new Date('2025-12-31')
  }
})
```

### Test Data Features

- **Realistic Singapore Data** - Valid NRIC, phone numbers, addresses
- **Healthcare-Specific** - Medical records, prescriptions, appointments
- **Multi-language Support** - English, Mandarin, Malay, Tamil names
- **Anonymization** - PDPA-compliant test data generation
- **Relationship Modeling** - Patient-doctor-appointment relationships

## ⚡ Performance Testing

### Healthcare Load Testing

Configure performance tests for healthcare workflows:

```typescript
import { performanceTestFramework } from './testing/infrastructure/performance/HealthcarePerformanceTestFramework'

// Create patient journey load test
const patientLoadTest = performanceTestFramework.createPatientJourneyLoadTest('http://localhost:3000')
const result = await performanceTestFramework.runPerformanceTest(patientLoadTest)

console.log(`Response Time P95: ${result.results?.endpoints['/api/patients'].p95}ms`)
```

**Performance Test Types:**
- **Patient Journey Load Test** - 100 virtual users simulating patient workflows
- **Doctor Workflow Load Test** - 50 doctors with consultation workflows
- **Stress Test** - Up to 500 users for system limits
- **Spike Test** - Sudden load increases
- **Endurance Test** - Long-running stability tests

### Performance Thresholds

| Component | P95 Response Time | Throughput | Error Rate |
|-----------|------------------|------------|------------|
| Appointment Booking | 3s | 100 req/s | 1% |
| Patient Data | 2s | 200 req/s | 0.5% |
| Medical Records | 5s | 50 req/s | 0.1% |

## ♿ Accessibility Testing

### WCAG 2.2 AA Compliance

Comprehensive accessibility testing for healthcare interfaces:

```typescript
import { accessibilityTestFramework } from './testing/infrastructure/accessibility/HealthcareAccessibilityTestFramework'

// Run WCAG 2.2 AA test
const a11yTest = accessibilityTestFramework.createWCAG22AAComprehensiveTest()
const result = await accessibilityTestFramework.runAccessibilityTest(a11yTest)

console.log(`WCAG Compliance: ${result.summary.wcagCompliance}%`)
```

**Accessibility Test Coverage:**
- ✅ **Perceivable** - Text alternatives, captions, contrast
- ✅ **Operable** - Keyboard accessibility, focus management
- ✅ **Understandable** - Clear language, error identification
- ✅ **Robust** - Compatible with assistive technologies

### Multi-language Accessibility

Test accessibility across Singapore's official languages:

```typescript
const multilingualConfig = {
  languages: ['en', 'zh', 'ms', 'ta'],
  defaultLanguage: 'en',
  fontSupport: {
    'en': 'system-ui, -apple-system, sans-serif',
    'zh': 'system-ui, -apple-system, sans-serif',
    'ms': 'system-ui, -apple-system, sans-serif',
    'ta': 'Noto Sans Tamil, system-ui, sans-serif'
  }
}
```

## 🔒 Security Testing

### Healthcare Security Framework

Comprehensive security testing for healthcare applications:

```typescript
// Run penetration testing
const penTest = securityTestFramework.createPenetrationTest('http://localhost:3000')
const result = await securityTestFramework.runSecurityTest(penTest)

// Security test coverage
const securityTests = [
  'SQL Injection Test',
  'XSS Test', 
  'Authentication Bypass Test',
  'Authorization Escalation Test',
  'CSRF Protection Test',
  'Session Management Test'
]
```

### Security Test Categories

- **Vulnerability Assessment** - OWASP Top 10 checks
- **Authentication Testing** - Login security, session management
- **Authorization Testing** - Role-based access control
- **Data Protection** - Encryption, data handling
- **Audit Testing** - Compliance logging and monitoring

## 🌐 Cross-Browser Testing

### Healthcare UI Compatibility

Test healthcare interfaces across browsers:

```typescript
// Playwright configuration supports
const browsers = [
  'chromium',    // Chrome, Edge
  'firefox',     // Firefox
  'webkit',      // Safari
  'Mobile Chrome',
  'Mobile Safari'
]

// Healthcare-specific test scenarios
const testScenarios = [
  'Patient registration and login',
  'Appointment booking flow',
  'Medical record viewing',
  'Prescription management',
  'PDPA consent management',
  'Healthier SG integration'
]
```

### Browser Coverage

| Browser | Version | Screen Readers | Keyboard Only |
|---------|---------|----------------|---------------|
| Chrome | Latest | NVDA, JAWS | ✅ |
| Firefox | Latest | NVDA, VoiceOver | ✅ |
| Safari | Latest | VoiceOver | ✅ |
| Edge | Latest | NVDA, JAWS | ✅ |

## 🔧 Environment Configuration

### Test Environment Isolation

Create isolated testing environments:

```typescript
import { HealthcareTestEnvironment } from './testing/infrastructure/environments/HealthcareTestEnvironment'

// Create unit test environment
const unitEnv = HealthcareTestEnvironment.createUnitTestEnvironment()
await HealthcareTestEnvironment.startEnvironment(unitEnv)

// Create integration test environment  
const integrationEnv = HealthcareTestEnvironment.createIntegrationTestEnvironment()
await HealthcareTestEnvironment.startEnvironment(integrationEnv)

// Create E2E test environment
const e2eEnv = HealthcareTestEnvironment.createE2ETestEnvironment()
await HealthcareTestEnvironment.startEnvironment(e2eEnv)
```

### Environment Types

| Environment | Purpose | Database | Isolation | Use Case |
|-------------|---------|----------|-----------|----------|
| Unit Test | Component isolation | Memory | Complete | Component testing |
| Integration Test | API integration | PostgreSQL | Shared | Service testing |
| E2E Test | Full workflow | PostgreSQL | Complete | User journey testing |
| Staging | Pre-production | PostgreSQL | Shared | Full validation |

## 📊 Test Coverage Goals

### Coverage Thresholds

| Test Type | Coverage Goal | Healthcare Components |
|-----------|---------------|----------------------|
| Unit Tests | 95% | Business logic, utilities |
| Component Tests | 100% | UI components |
| Integration Tests | 90% | API interactions |
| E2E Tests | 100% | Critical user journeys |
| Accessibility Tests | WCAG 2.2 AA | All pages |

### Quality Gates

The testing infrastructure implements quality gates:

```yaml
# GitHub Actions quality gates
quality_gates:
  unit_tests:
    coverage_threshold: 95%
    healthcare_coverage: 98%
  
  integration_tests:
    success_rate: 95%
    performance_regression: <5%
  
  security_tests:
    critical_vulnerabilities: 0
    high_vulnerabilities: 0
  
  accessibility_tests:
    wcag_compliance: AA level
    critical_issues: 0
```

## 🚀 CI/CD Integration

### GitHub Actions Pipeline

The testing infrastructure includes a comprehensive GitHub Actions pipeline:

```yaml
# testing/infrastructure/ci-cd/github-actions-testing-pipeline.yml

jobs:
  - lint-and-quality
  - unit-tests
  - component-tests  
  - integration-tests
  - e2e-tests
  - cypress-tests
  - security-tests
  - accessibility-tests
  - performance-tests
  - cross-browser-tests
  - internationalization-tests
  - compliance-validation
```

### Pre-commit Hooks

Healthcare-specific pre-commit hooks ensure code quality:

```bash
#!/bin/bash
# healthcare pre-commit hook

# Run healthcare-specific checks
- PDPA compliance scanning
- MOH standards validation
- Security pattern detection
- Healthcare data exposure checks
- Code quality validation
- Test execution
```

## 📋 Best Practices

### Healthcare Testing Guidelines

1. **Data Privacy First**
   - Always use synthetic/test data
   - Anonymize sensitive information
   - Validate PDPA compliance

2. **Regulatory Compliance**
   - Test MOH standards compliance
   - Validate healthcare data formats
   - Ensure audit trail completeness

3. **Multi-language Testing**
   - Test all official Singapore languages
   - Validate font rendering and readability
   - Check cultural accessibility

4. **Accessibility Standards**
   - Test with screen readers
   - Keyboard-only navigation
   - High contrast mode
   - WCAG 2.2 AA compliance

5. **Performance Requirements**
   - Healthcare-specific response times
   - Peak load simulation
   - Mobile performance optimization
   - Network condition testing

### Test Organization

```
src/
├── components/
│   └── healthcare/
│       ├── __tests__/           # Component tests
│       ├── PatientForm.tsx      # Component with test
│       └── AppointmentBooking.tsx
├── utils/
│   ├── __tests__/               # Utility tests  
│   ├── healthcareValidation.ts  # Utility with test
│   └── pdpaUtils.ts
└── api/
    ├── __tests__/               # API tests
    ├── patients.ts              # API with tests
    └── appointments.ts

testing/
├── e2e/                         # E2E tests
├── integration/                 # Integration tests
├── performance/                 # Performance tests
├── security/                    # Security tests
├── accessibility/               # Accessibility tests
└── utilities/                   # Test utilities
```

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   ```bash
   # Check test database is running
   pg_isready -h localhost -p 5432
   
   # Reset test database
   npm run db:reset -- --force-reset
   ```

2. **Playwright Browser Issues**
   ```bash
   # Install browsers
   npx playwright install
   
   # Debug browser issues
   npx playwright test --debug
   ```

3. **Cypress Issues**
   ```bash
   # Clear Cypress cache
   npx cypress cache clear
   
   # Run in headed mode for debugging
   npx cypress run --headed
   ```

### Debugging Commands

```bash
# Run specific test file
npm test -- MyComponent.test.tsx

# Run with coverage
npm run test:coverage

# Debug Playwright tests
npx playwright test --debug

# Check accessibility manually
npm run test:a11y -- --manual

# Run security tests with verbose output
npm run test:security -- --verbose

# Performance test with profiling
npm run test:performance -- --profile
```

## 📚 Additional Resources

- [Testing Framework Guide](./testing-frameworks.md)
- [Healthcare Testing Patterns](./healthcare-testing.md)
- [CI/CD Pipeline Configuration](./cicd-pipeline.md)
- [Performance Testing Guide](./performance-testing.md)
- [Security Testing Guidelines](./security-testing.md)
- [Accessibility Testing Standards](./accessibility-testing.md)

## 🤝 Support

For questions or issues with the testing infrastructure:

1. Check the documentation in the `/docs` directory
2. Review healthcare-specific testing patterns
3. Contact the QA team for healthcare compliance questions
4. Reference Singapore MOH guidelines for healthcare testing
5. Use the pre-commit hooks for immediate feedback

## 📋 Compliance References

- **PDPA**: Personal Data Protection Act compliance testing
- **MOH**: Ministry of Health standards validation
- **WCAG 2.2**: Web Content Accessibility Guidelines
- **ISO 27001**: Information security management
- **HIPAA**: Healthcare data protection standards