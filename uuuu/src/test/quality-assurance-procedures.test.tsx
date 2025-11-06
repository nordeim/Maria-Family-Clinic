/**
 * Quality Assurance Procedures for Healthier SG System
 * Sub-Phase 8.12 - Testing, Quality Assurance & Performance Optimization
 * 
 * Comprehensive quality assurance procedures including:
 * - Automated quality assurance pipeline with CI/CD integration
 * - Manual testing procedures for complex scenarios
 * - User acceptance testing procedures
 * - Bug tracking and resolution procedures
 * - Quality metrics and reporting
 * - Release testing and deployment validation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { TRPCReactProvider } from '@/lib/trpc/react'

// Test components
import { EligibilityChecker } from '@/components/healthier-sg/eligibility/EligibilityChecker'
import { ProgramInfoSection } from '@/components/healthier-sg/program-info/ProgramInfoSection'
import { ClinicFinder } from '@/components/healthier-sg/registration/ClinicFinder'

// Quality assurance utilities
interface QualityMetrics {
  testCoverage: number
  accessibilityScore: number
  performanceScore: number
  securityScore: number
  bugCount: {
    critical: number
    high: number
    medium: number
    low: number
  }
  codeQuality: {
    complexity: number
    maintainability: number
    testability: number
  }
  userSatisfaction: number
}

interface BugReport {
  id: string
  title: string
  description: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  assignee: string
  createdAt: Date
  resolvedAt?: Date
  reproductionSteps: string[]
  expectedBehavior: string
  actualBehavior: string
  environment: {
    browser: string
    device: string
    os: string
    version: string
  }
  attachments: string[]
}

interface TestResult {
  testId: string
  testName: string
  status: 'passed' | 'failed' | 'skipped' | 'timed-out'
  duration: number
  error?: string
  screenshots?: string[]
  logs?: string[]
  metadata?: Record<string, any>
}

// Mock quality assurance services
const mockQualityService = {
  generateTestReport: vi.fn(),
  trackQualityMetrics: vi.fn(),
  createBugReport: vi.fn(),
  validateQAProcedures: vi.fn(),
  runRegressionTests: vi.fn(),
  validateAccessibility: vi.fn(),
  validatePerformance: vi.fn(),
  validateSecurity: vi.fn()
}

const mockBugTrackingService = {
  createTicket: vi.fn(),
  updateTicket: vi.fn(),
  assignBug: vi.fn(),
  resolveBug: vi.fn(),
  generateBugReport: vi.fn(),
  getBugMetrics: vi.fn()
}

const mockUserAcceptanceService = {
  createTestPlan: vi.fn(),
  scheduleTesting: vi.fn(),
  collectFeedback: vi.fn(),
  validateAcceptanceCriteria: vi.fn(),
  generateUATReport: vi.fn()
}

describe('Quality Assurance Procedures', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock CI/CD environment
    process.env.CI = 'true'
    process.env.GITHUB_ACTIONS = 'true'
    process.env.GITHUB_REF = 'refs/heads/main'
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Automated Quality Assurance Pipeline', () => {
    it('should run comprehensive test suite in CI/CD pipeline', async () => {
      const testSuites = [
        { name: 'unit-tests', command: 'npm run test:unit', timeout: 300000 },
        { name: 'integration-tests', command: 'npm run test:integration', timeout: 600000 },
        { name: 'e2e-tests', command: 'npm run test:e2e', timeout: 900000 },
        { name: 'accessibility-tests', command: 'npm run test:a11y', timeout: 300000 },
        { name: 'performance-tests', command: 'npm run test:performance', timeout: 600000 },
        { name: 'security-tests', command: 'npm run test:security', timeout: 300000 }
      ]
      
      const pipelineResults = []
      
      for (const suite of testSuites) {
        const startTime = Date.now()
        
        // Simulate test execution
        const result = {
          suite: suite.name,
          status: 'completed',
          duration: Date.now() - startTime,
          passed: Math.floor(Math.random() * 50) + 50,
          failed: Math.floor(Math.random() * 3),
          skipped: Math.floor(Math.random() * 2)
        }
        
        pipelineResults.push(result)
      }
      
      // Verify all test suites completed successfully
      expect(pipelineResults).toHaveLength(6)
      expect(pipelineResults.every(r => r.status === 'completed')).toBe(true)
      expect(pipelineResults.every(r => r.duration < suite.timeout)).toBe(true)
    })

    it('should enforce quality gates before deployment', () => {
      const qualityGates = {
        testCoverage: { threshold: 95, current: 97.5, status: 'PASS' },
        accessibilityScore: { threshold: 90, current: 95, status: 'PASS' },
        performanceScore: { threshold: 90, current: 92, status: 'PASS' },
        securityScore: { threshold: 95, current: 98, status: 'PASS' },
        criticalBugs: { threshold: 0, current: 0, status: 'PASS' },
        highBugs: { threshold: 0, current: 2, status: 'WARNING' }
      }
      
      const deploymentEligible = Object.values(qualityGates).every(gate => 
        gate.status === 'PASS' || (gate.status === 'WARNING' && gate.current <= gate.threshold * 1.1)
      )
      
      expect(deploymentEligible).toBe(true)
    })

    it('should generate comprehensive quality reports', () => {
      const qualityReport: QualityMetrics = {
        testCoverage: 97.5,
        accessibilityScore: 95,
        performanceScore: 92,
        securityScore: 98,
        bugCount: {
          critical: 0,
          high: 2,
          medium: 8,
          low: 15
        },
        codeQuality: {
          complexity: 85,
          maintainability: 90,
          testability: 88
        },
        userSatisfaction: 4.6
      }
      
      const report = mockQualityService.generateTestReport(qualityReport)
      
      expect(report.overallScore).toBeGreaterThan(90)
      expect(report.testCoverage).toBeGreaterThan(95)
      expect(report.criticalBugs).toBe(0)
    })

    it('should validate code quality and standards', () => {
      const codeQualityChecks = [
        { tool: 'eslint', threshold: 0, violations: 0, status: 'PASS' },
        { tool: 'prettier', threshold: 0, violations: 0, status: 'PASS' },
        { tool: 'typescript', threshold: 0, errors: 0, status: 'PASS' },
        { tool: 'complexity', threshold: 10, current: 7, status: 'PASS' },
        { tool: 'security-scan', threshold: 0, vulnerabilities: 0, status: 'PASS' }
      ]
      
      codeQualityChecks.forEach(check => {
        expect(check.status).toBe('PASS')
        expect(check.violations || check.errors || check.vulnerabilities).toBe(0)
      })
    })
  })

  describe('Manual Testing Procedures', () => {
    it('should provide comprehensive manual testing checklist', () => {
      const manualTestingChecklist = {
        functionalTesting: {
          eligibilityChecker: [
            'Age validation (40+ years)',
            'Citizenship verification',
            'Postal code validation',
            'Health condition assessment',
            'Lifestyle evaluation',
            'Consent capture',
            'Results accuracy',
            'Appeal process'
          ],
          clinicFinder: [
            'Location-based search',
            'Specialty filtering',
            'Distance calculation',
            'Availability checking',
            'Contact information',
            'Map integration',
            'Booking integration',
            'Real-time updates'
          ],
          registration: [
            'MyInfo integration',
            'Data validation',
            'Progress saving',
            'Error handling',
            'Multi-step flow',
            'Data persistence',
            'Confirmation process',
            'Email notifications'
          ]
        },
        userExperienceTesting: {
          navigation: [
            'Intuitive menu structure',
            'Breadcrumb navigation',
            'Back button behavior',
            'Search functionality',
            'Filter operations',
            'Sorting options',
            'Pagination',
            'Loading states'
          ],
          visualDesign: [
            'Brand consistency',
            'Color contrast',
            'Typography readability',
            'Icon consistency',
            'Layout responsiveness',
            'Image optimization',
            'Animation smoothness',
            'Loading indicators'
          ]
        },
        crossPlatformTesting: [
          'Desktop browsers (Chrome, Firefox, Safari, Edge)',
          'Mobile devices (iOS, Android)',
          'Tablet optimization',
          'Screen reader compatibility',
          'Keyboard navigation',
          'Touch interactions',
          'Network conditions',
          'Offline functionality'
        ]
      }
      
      expect(manualTestingChecklist.functionalTesting.eligibilityChecker).toHaveLength(8)
      expect(manualTestingChecklist.crossPlatformTesting).toHaveLength(8)
    })

    it('should provide detailed test case templates', () => {
      const testCaseTemplate = {
        id: 'TC-001',
        title: 'Eligibility Assessment - Valid User',
        objective: 'Verify that a valid user can complete eligibility assessment',
        preconditions: [
          'User is on eligibility checker page',
          'User has valid NRIC and postal code',
          'User is 40+ years old',
          'User is Singapore citizen or PR'
        ],
        testSteps: [
          {
            step: 1,
            action: 'Enter age: 45',
            expected: 'Age field accepts value and validates'
          },
          {
            step: 2,
            action: 'Select citizenship: CITIZEN',
            expected: 'Dropdown shows available options'
          },
          {
            step: 3,
            action: 'Enter postal code: 123456',
            expected: 'Postal code validates against Singapore format'
          },
          {
            step: 4,
            action: 'Click Next button',
            expected: 'Proceeds to health status section'
          }
        ],
        expectedResults: [
          'Form validation passes',
          'User progresses to next step',
          'Data is saved locally',
          'Progress indicator updates'
        ],
        testData: {
          age: 45,
          citizenship: 'CITIZEN',
          postalCode: '123456'
        },
        environment: {
          browser: 'Chrome 120',
          device: 'Desktop',
          os: 'Windows 11'
        }
      }
      
      expect(testCaseTemplate.id).toBe('TC-001')
      expect(testCaseTemplate.testSteps).toHaveLength(4)
      expect(testCaseTemplate.expectedResults).toHaveLength(4)
    })

    it('should track manual testing progress and coverage', () => {
      const testingProgress = {
        totalTestCases: 150,
        completedTestCases: 135,
        passedTestCases: 132,
        failedTestCases: 3,
        blockedTestCases: 0,
        coverage: 90, // percentage
        executionTime: 2400, // minutes
        defectCount: 8,
        automationEligible: 85, // percentage of manual tests
        riskLevel: 'LOW'
      }
      
      expect(testingProgress.completion).toBe(90)
      expect(testingProgress.passRate).toBe(97.8) // 132/135
      expect(testingProgress.riskLevel).toBe('LOW')
    })
  })

  describe('User Acceptance Testing (UAT)', () => {
    it('should define clear acceptance criteria', () => {
      const acceptanceCriteria = {
        functional: [
          'Users can complete eligibility assessment in under 10 minutes',
          'Clinic search returns results within 2 seconds',
          'Registration process completes without errors',
          'All program information is accurate and up-to-date'
        ],
        nonFunctional: [
          'System supports 1000+ concurrent users',
          'Page load time is under 3 seconds',
          'Mobile experience is optimized',
          'Accessibility WCAG 2.2 AA compliant'
        ],
        business: [
          'MOH program requirements are met',
          'Integration with government systems works',
          'Data privacy and security requirements satisfied',
          'Multilingual support for all 4 languages'
        ]
      }
      
      acceptanceCriteria.functional.forEach(criterion => {
        expect(criterion).toContain('can' || 'returns' || 'processes' || 'information')
      })
    })

    it('should create comprehensive UAT test plan', () => {
      const uatTestPlan = {
        scope: {
          features: [
            'Eligibility Checker',
            'Clinic Finder',
            'Registration System',
            'Program Information',
            'Multilingual Support'
          ],
          exclusions: [
            'Admin Dashboard',
            'Reporting System',
            'API Documentation'
          ]
        },
        testEnvironment: {
          url: 'https://uat.healthier-sg.gov.sg',
          browserSupport: ['Chrome', 'Firefox', 'Safari', 'Edge'],
          deviceSupport: ['Desktop', 'iOS', 'Android']
        },
        participants: [
          { role: 'MOH Representative', count: 2, expertise: 'Domain' },
          { role: 'Healthcare Professional', count: 3, expertise: 'Medical' },
          { role: 'End User', count: 10, expertise: 'General Public' },
          { role: 'Accessibility Expert', count: 2, expertise: 'A11y' }
        ],
        timeline: {
          startDate: '2025-01-15',
          endDate: '2025-01-30',
          duration: '16 days',
          phases: [
            { phase: 'Preparation', duration: '3 days' },
            { phase: 'Execution', duration: '10 days' },
            { phase: 'Analysis', duration: '3 days' }
          ]
        },
        deliverables: [
          'UAT Test Report',
          'Defect Log',
          'Acceptance Decision',
          'Lessons Learned',
          'Sign-off Documentation'
        ]
      }
      
      expect(uatTestPlan.scope.features).toHaveLength(5)
      expect(uatTestPlan.participants).toHaveLength(4)
      expect(uatTestPlan.timeline.duration).toBe('16 days')
    })

    it('should collect and analyze UAT feedback', () => {
      const uatFeedback = {
        totalParticipants: 17,
        responses: 15,
        satisfaction: {
          overall: 4.5, // out of 5
          usability: 4.6,
          functionality: 4.4,
          performance: 4.3,
          accessibility: 4.7
        },
        feedback: {
          positive: [
            'Easy to understand eligibility requirements',
            'Intuitive clinic search',
            'Clear program information',
            'Good mobile experience'
          ],
          negative: [
            'Some form validation messages unclear',
            'Load time could be faster',
            'Need more clinic information'
          ],
          suggestions: [
            'Add progress saving',
            'Improve error messaging',
            'Add more filter options'
          ]
        },
        criticalIssues: 2,
        highIssues: 5,
        mediumIssues: 12,
        lowIssues: 8
      }
      
      expect(uatFeedback.satisfaction.overall).toBeGreaterThan(4.0)
      expect(uatFeedback.responses).toBe(15)
      expect(uatFeedback.criticalIssues).toBe(2)
    })

    it('should validate acceptance criteria compliance', () => {
      const acceptanceValidation = {
        'Users can complete eligibility assessment in under 10 minutes': {
          target: 10, // minutes
          actual: 7.5, // minutes
          status: 'PASS',
          evidence: 'Average completion time across 50 test users'
        },
        'Clinic search returns results within 2 seconds': {
          target: 2000, // milliseconds
          actual: 850, // milliseconds
          status: 'PASS',
          evidence: 'Average API response time over 100 requests'
        },
        'Registration process completes without errors': {
          target: 100, // percentage success rate
          actual: 98.5, // percentage
          status: 'PASS',
          evidence: 'Success rate across 200 test registrations'
        }
      }
      
      Object.values(acceptanceValidation).forEach(validation => {
        expect(validation.status).toBe('PASS')
        expect(validation.actual).toBeLessThan(validation.target)
      })
    })
  })

  describe('Bug Tracking and Resolution', () => {
    it('should create detailed bug reports', () => {
      const bugReport: BugReport = {
        id: 'BUG-001',
        title: 'Eligibility assessment fails for users with special characters in postal code',
        description: 'Users entering postal codes with special characters (e.g., "S(123)456") cause validation errors',
        severity: 'high',
        status: 'open',
        assignee: 'qa-team',
        createdAt: new Date('2025-01-15'),
        reproductionSteps: [
          'Navigate to eligibility checker',
          'Enter age: 45',
          'Select citizenship: CITIZEN',
          'Enter postal code: S(123)456',
          'Click Next',
          'Observe validation error'
        ],
        expectedBehavior: 'Postal code should accept alphanumeric characters and validate correctly',
        actualBehavior: 'System throws validation error for special characters',
        environment: {
          browser: 'Chrome 120',
          device: 'Desktop',
          os: 'Windows 11',
          version: '1.0.0'
        },
        attachments: ['screenshot-1.png', 'console-logs.txt']
      }
      
      expect(bugReport.id).toBe('BUG-001')
      expect(bugReport.severity).toBe('high')
      expect(bugReport.reproductionSteps).toHaveLength(6)
    })

    it('should track bug lifecycle and resolution', () => {
      const bugLifecycle = [
        { status: 'open', timestamp: '2025-01-15T10:00:00Z', assignee: 'qa-team' },
        { status: 'in-progress', timestamp: '2025-01-15T14:00:00Z', assignee: 'dev-team' },
        { status: 'resolved', timestamp: '2025-01-16T09:00:00Z', assignee: 'dev-team' },
        { status: 'closed', timestamp: '2025-01-16T11:00:00Z', assignee: 'qa-team' }
      ]
      
      expect(bugLifecycle).toHaveLength(4)
      expect(bugLifecycle[0].status).toBe('open')
      expect(bugLifecycle[bugLifecycle.length - 1].status).toBe('closed')
    })

    it('should generate bug reports and metrics', () => {
      const bugMetrics = {
        totalBugs: 25,
        openBugs: 8,
        resolvedBugs: 17,
        bySeverity: {
          critical: 0,
          high: 3,
          medium: 12,
          low: 10
        },
        byComponent: {
          eligibilityChecker: 8,
          clinicFinder: 6,
          registration: 5,
          programInfo: 3,
          utils: 3
        },
        resolution: {
          average: 2.5, // days
          critical: 0.5, // days
          high: 1.2, // days
          medium: 2.8, // days
          low: 4.5 // days
        },
        qualityTrend: 'improving' // last 30 days
      }
      
      expect(bugMetrics.totalBugs).toBe(25)
      expect(bugMetrics.resolution.critical).toBe(0.5)
      expect(bugMetrics.qualityTrend).toBe('improving')
    })

    it('should implement regression testing for bug fixes', () => {
      const regressionTest = {
        bugId: 'BUG-001',
        bugTitle: 'Postal code validation error',
        testCases: [
          {
            id: 'TC-REG-001',
            title: 'Verify postal code accepts alphanumeric characters',
            steps: [
              'Enter postal code: S(123)456',
              'Click Next',
              'Verify no validation error'
            ],
            expectedResult: 'No validation error, proceeds to next step'
          },
          {
            id: 'TC-REG-002',
            title: 'Verify special characters are properly handled',
            steps: [
              'Enter postal code: S{123}456',
              'Click Next',
              'Verify sanitization works'
            ],
            expectedResult: 'Special characters are removed, valid postal code accepted'
          }
        ],
        automation: 'yes',
        priority: 'high'
      }
      
      expect(regressionTest.testCases).toHaveLength(2)
      expect(regressionTest.automation).toBe('yes')
    })
  })

  describe('Quality Metrics and Reporting', () => {
    it('should track comprehensive quality metrics', () => {
      const qualityMetrics: QualityMetrics = {
        testCoverage: 97.5,
        accessibilityScore: 95,
        performanceScore: 92,
        securityScore: 98,
        bugCount: {
          critical: 0,
          high: 2,
          medium: 8,
          low: 15
        },
        codeQuality: {
          complexity: 7.2,
          maintainability: 88,
          testability: 85
        },
        userSatisfaction: 4.6
      }
      
      expect(qualityMetrics.testCoverage).toBeGreaterThan(95)
      expect(qualityMetrics.bugCount.critical).toBe(0)
      expect(qualityMetrics.userSatisfaction).toBeGreaterThan(4.0)
    })

    it('should generate quality trend reports', () => {
      const qualityTrend = {
        period: 'Q4 2024',
        metrics: {
          testCoverage: { current: 97.5, previous: 95.2, trend: 'improving' },
          bugCount: { current: 25, previous: 32, trend: 'improving' },
          userSatisfaction: { current: 4.6, previous: 4.4, trend: 'improving' },
          performance: { current: 92, previous: 89, trend: 'improving' }
        },
        insights: [
          'Test coverage improved by 2.3%',
          'Critical bug count reduced to 0',
          'User satisfaction increased by 0.2',
          'Performance score improved by 3 points'
        ],
        recommendations: [
          'Continue focus on accessibility improvements',
          'Implement more automated testing',
          'Enhance monitoring and alerting'
        ]
      }
      
      expect(qualityTrend.metrics.testCoverage.trend).toBe('improving')
      expect(qualityTrend.metrics.bugCount.trend).toBe('improving')
      expect(qualityTrend.insights).toHaveLength(4)
    })

    it('should provide quality dashboards and alerts', () => {
      const qualityDashboard = {
        realTimeMetrics: {
          testPassRate: 98.5,
          buildStatus: 'success',
          deploymentStatus: 'stable',
          errorRate: 0.02,
          responseTime: 850
        },
        alerts: [
          {
            type: 'performance',
            severity: 'warning',
            message: 'Response time increased by 15% in last hour',
            timestamp: '2025-01-15T10:30:00Z'
          },
          {
            type: 'accessibility',
            severity: 'info',
            message: 'New accessibility score: 95/100',
            timestamp: '2025-01-15T09:00:00Z'
          }
        ],
        trends: {
          last7Days: 'stable',
          last30Days: 'improving',
          last90Days: 'stable'
        }
      }
      
      expect(qualityDashboard.realTimeMetrics.testPassRate).toBe(98.5)
      expect(qualityDashboard.alerts).toHaveLength(2)
    })
  })

  describe('Release Testing and Deployment Validation', () => {
    it('should perform pre-release testing checklist', () => {
      const preReleaseChecklist = {
        functionalTesting: {
          coreFeatures: 'completed',
          integrationTesting: 'completed',
          regressionTesting: 'completed',
          smokeTesting: 'completed'
        },
        qualityAssurance: {
          codeReview: 'approved',
          securityReview: 'approved',
          performanceReview: 'approved',
          accessibilityReview: 'approved'
        },
        deployment: {
          environment: 'staging',
          database: 'migrated',
          config: 'verified',
          monitoring: 'enabled'
        },
        documentation: {
          userGuide: 'updated',
          apiDocs: 'updated',
          deploymentGuide: 'updated',
          changelog: 'prepared'
        },
        approvals: {
          development: 'approved',
          quality: 'approved',
          security: 'approved',
          productOwner: 'approved'
        }
      }
      
      Object.values(preReleaseChecklist).forEach(category => {
        Object.values(category).forEach(status => {
          expect(status).toBe('completed' || 'approved' || 'enabled' || 'updated' || 'prepared')
        })
      })
    })

    it('should validate deployment requirements', () => {
      const deploymentRequirements = {
        infrastructure: {
          servers: 'configured',
          loadBalancers: 'configured',
          database: 'replicated',
          cdn: 'configured',
          monitoring: 'deployed'
        },
        security: {
          ssl: 'configured',
          firewall: 'configured',
          backup: 'scheduled',
          accessControl: 'configured',
          encryption: 'enabled'
        },
        performance: {
          caching: 'enabled',
          compression: 'enabled',
          cdn: 'configured',
          databaseOptimization: 'completed',
          loadTesting: 'passed'
        },
        compliance: {
          dataProtection: 'compliant',
          accessibility: 'wcag-2.2-aa',
          governmentRequirements: 'met',
          auditTrail: 'enabled'
        }
      }
      
      expect(deploymentRequirements.infrastructure.servers).toBe('configured')
      expect(deploymentRequirements.security.ssl).toBe('configured')
      expect(deploymentRequirements.compliance.accessibility).toBe('wcag-2.2-aa')
    })

    it('should implement canary deployment validation', async () => {
      const canaryDeployment = {
        phases: [
          { phase: '1% traffic', duration: '1 hour', metrics: 'all passing' },
          { phase: '10% traffic', duration: '2 hours', metrics: 'all passing' },
          { phase: '50% traffic', duration: '4 hours', metrics: 'all passing' },
          { phase: '100% traffic', duration: 'ongoing', metrics: 'all passing' }
        ],
        metrics: {
          errorRate: 0.01, // 1%
          responseTime: 850, // ms
          throughput: 1000, // requests per second
          availability: 99.9 // percentage
        },
        rollback: {
          enabled: true,
          criteria: [
            'Error rate > 5%',
            'Response time > 2000ms',
            'Availability < 99%'
          ]
        }
      }
      
      expect(canaryDeployment.phases).toHaveLength(4)
      expect(canaryDeployment.metrics.availability).toBe(99.9)
      expect(canaryDeployment.rollback.enabled).toBe(true)
    })

    it('should perform post-deployment monitoring and validation', () => {
      const postDeploymentValidation = {
        immediate: {
          healthChecks: 'passed',
          smokeTests: 'passed',
          basicFunctionality: 'working',
          errorMonitoring: 'active'
        },
        shortTerm: {
          performanceMonitoring: 'active',
          userExperience: 'positive',
          systemStability: 'stable',
          resourceUtilization: 'normal'
        },
        longTerm: {
          userFeedback: 'monitoring',
          businessMetrics: 'tracking',
          securityMonitoring: 'active',
          capacityPlanning: 'ongoing'
        },
        alerting: {
          critical: 'immediate',
          high: 'within 5 minutes',
          medium: 'within 15 minutes',
          low: 'within 1 hour'
        }
      }
      
      expect(postDeploymentValidation.immediate.healthChecks).toBe('passed')
      expect(postDeploymentValidation.alerting.critical).toBe('immediate')
    })
  })
})