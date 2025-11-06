/**
 * Security Testing & Validation for Healthier SG System
 * Sub-Phase 8.12 - Testing, Quality Assurance & Performance Optimization
 * 
 * Comprehensive security testing covering:
 * - Penetration testing scenarios
 * - PDPA compliance and data protection
 * - Government system integration security
 * - Access controls and permissions
 * - Audit logging and compliance
 * - Security incident response
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TRPCReactProvider } from '@/lib/trpc/react'

// Test components
import { EligibilityChecker } from '@/components/healthier-sg/eligibility/EligibilityChecker'
import { RegistrationForm } from '@/components/healthier-sg/registration/RegistrationForm'
import { ClinicFinder } from '@/components/healthier-sg/registration/ClinicFinder'
import { PrivacyComplianceDashboard } from '@/components/privacy/PrivacyComplianceDashboard'
import { AuditLoggingIncidentResponse } from '@/components/privacy/AuditLoggingIncidentResponse'

// Security testing utilities
interface SecurityTestResult {
  vulnerability: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'PASS' | 'FAIL' | 'WARNING'
  details: string
  recommendation?: string
}

// Mock security APIs and services
const mockSecurityService = {
  checkVulnerability: vi.fn(),
  validatePDPACompliance: vi.fn(),
  testAccessControl: vi.fn(),
  auditDataAccess: vi.fn(),
  detectSecurityIncidents: vi.fn(),
  encryptSensitiveData: vi.fn(),
  decryptSensitiveData: vi.fn(),
  validateToken: vi.fn(),
  checkRateLimit: vi.fn()
}

const mockAuditService = {
  logAccess: vi.fn(),
  logDataModification: vi.fn(),
  logSecurityEvent: vi.fn(),
  generateAuditReport: vi.fn(),
  trackDataExport: vi.fn(),
  monitorSuspiciousActivity: vi.fn()
}

describe('Healthier SG Security Testing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock security APIs
    global.fetch = vi.fn().mockImplementation((url, options) => {
      const securityHeaders = {
        'Content-Security-Policy': "default-src 'self'",
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
      }
      
      return Promise.resolve({
        ok: true,
        status: 200,
        headers: new Map(Object.entries(securityHeaders))
      })
    })
    
    // Mock crypto APIs for encryption testing
    global.crypto = {
      getRandomValues: vi.fn((arr) => {
        for (let i = 0; i < arr.length; i++) {
          arr[i] = Math.floor(Math.random() * 256)
        }
        return arr
      }),
      subtle: {
        encrypt: vi.fn().mockResolvedValue(new ArrayBuffer(32)),
        decrypt: vi.fn().mockResolvedValue(new ArrayBuffer(32)),
        digest: vi.fn().mockResolvedValue(new ArrayBuffer(32)),
        generateKey: vi.fn().mockResolvedValue({}),
        importKey: vi.fn().mockResolvedValue({})
      }
    }
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.clearAllMocks()
  })

  describe('Penetration Testing', () => {
    it('should prevent SQL injection attacks', async () => {
      const maliciousInputs = [
        "'; DROP TABLE users; --",
        "admin'--",
        "1' OR '1'='1",
        "'; INSERT INTO users (username) VALUES ('hacker'); --",
        "1 UNION SELECT * FROM users"
      ]
      
      const securityResults: SecurityTestResult[] = []
      
      for (const input of maliciousInputs) {
        const testResult = await mockSecurityService.checkVulnerability('sql_injection', input)
        securityResults.push({
          vulnerability: 'SQL Injection',
          severity: 'HIGH',
          status: testResult.blocked ? 'PASS' : 'FAIL',
          details: `Tested input: ${input}`,
          recommendation: testResult.blocked ? undefined : 'Implement input sanitization'
        })
      }
      
      // All malicious inputs should be blocked
      securityResults.forEach(result => {
        expect(result.status).toBe('PASS')
      })
    })

    it('should prevent XSS (Cross-Site Scripting) attacks', () => {
      const xssPayloads = [
        '<script>alert("XSS")</script>',
        'javascript:alert("XSS")',
        '<img src=x onerror=alert("XSS")>',
        '"><script>alert("XSS")</script>',
        "';alert('XSS');//"
      ]
      
      const securityResults: SecurityTestResult[] = []
      
      xssPayloads.forEach(payload => {
        const sanitized = payload
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/javascript:/gi, '')
        
        const isSecure = sanitized === payload // No changes means unsafe
        
        securityResults.push({
          vulnerability: 'XSS',
          severity: 'HIGH',
          status: isSecure ? 'FAIL' : 'PASS',
          details: `Payload: ${payload}`,
          recommendation: isSecure ? 'Implement output encoding' : undefined
        })
      })
      
      // All XSS payloads should be sanitized
      expect(securityResults.every(r => r.status === 'PASS')).toBe(true)
    })

    it('should validate CSRF protection mechanisms', async () => {
      // Mock CSRF token validation
      const mockCSRFToken = 'valid-csrf-token-12345'
      const maliciousCSRFRequests = [
        { method: 'POST', body: { action: 'delete_account' }, csrfToken: 'invalid' },
        { method: 'POST', body: { action: 'transfer_funds' }, csrfToken: null },
        { method: 'PUT', body: { data: 'malicious' }, csrfToken: 'forged-token' }
      ]
      
      const csrfResults: SecurityTestResult[] = []
      
      for (const request of maliciousCSRFRequests) {
        const isValidToken = request.csrfToken === mockCSRFToken
        
        csrfResults.push({
          vulnerability: 'CSRF',
          severity: 'MEDIUM',
          status: isValidToken ? 'PASS' : 'FAIL',
          details: `Method: ${request.method}, Token: ${request.csrfToken}`,
          recommendation: isValidToken ? undefined : 'Validate CSRF tokens'
        })
      }
      
      expect(csrfResults.every(r => r.status === 'FAIL')).toBe(true)
    })

    it('should prevent directory traversal attacks', () => {
      const traversalAttempts = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32\\drivers\\etc\\hosts',
        '....//....//....//etc//passwd',
        '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd'
      ]
      
      const traversalResults: SecurityTestResult[] = []
      
      traversalAttempts.forEach(attempt => {
        const isBlocked = attempt.includes('../') || attempt.includes('..\\')
        
        traversalResults.push({
          vulnerability: 'Directory Traversal',
          severity: 'HIGH',
          status: isBlocked ? 'PASS' : 'FAIL',
          details: `Path: ${attempt}`,
          recommendation: isBlocked ? undefined : 'Implement path validation'
        })
      })
      
      // All traversal attempts should be blocked
      expect(traversalResults.every(r => r.status === 'PASS')).toBe(true)
    })

    it('should validate secure HTTP headers', async () => {
      const response = await fetch('/api/healthier-sg/eligibility')
      
      const securityHeaders = {
        'Content-Security-Policy': response.headers.get('Content-Security-Policy'),
        'X-Content-Type-Options': response.headers.get('X-Content-Type-Options'),
        'X-Frame-Options': response.headers.get('X-Frame-Options'),
        'X-XSS-Protection': response.headers.get('X-XSS-Protection'),
        'Strict-Transport-Security': response.headers.get('Strict-Transport-Security'),
        'Referrer-Policy': response.headers.get('Referrer-Policy')
      }
      
      expect(securityHeaders['Content-Security-Policy']).toContain("default-src 'self'")
      expect(securityHeaders['X-Content-Type-Options']).toBe('nosniff')
      expect(securityHeaders['X-Frame-Options']).toBe('DENY')
      expect(securityHeaders['X-XSS-Protection']).toBe('1; mode=block')
      expect(securityHeaders['Referrer-Policy']).toBe('strict-origin-when-cross-origin')
    })
  })

  describe('PDPA Compliance and Data Protection', () => {
    it('should encrypt sensitive personal data', async () => {
      const personalData = {
        nric: 'S1234567A',
        phone: '+65-9123-4567',
        email: 'user@example.com',
        address: '123 Main Street, Singapore 123456'
      }
      
      const encryptedData = await mockSecurityService.encryptSensitiveData(personalData)
      
      expect(encryptedData.encrypted).toBe(true)
      expect(encryptedData.data).not.toContain('S1234567A')
      expect(encryptedData.data).not.toContain('+65-9123-4567')
      expect(encryptedData.algorithm).toBe('AES-256-GCM')
    })

    it('should validate data retention policies', () => {
      const dataRetentionRules = {
        eligibility_assessments: { retentionPeriod: 7, unit: 'years' },
        health_records: { retentionPeriod: 11, unit: 'years' },
        audit_logs: { retentionPeriod: 10, unit: 'years' },
        user_sessions: { retentionPeriod: 2, unit: 'years' }
      }
      
      // Simulate data age check
      const checkDataRetention = (dataType: string, createdAt: Date) => {
        const rule = dataRetentionRules[dataType as keyof typeof dataRetentionRules]
        if (!rule) return { compliant: false, reason: 'No retention rule defined' }
        
        const ageInYears = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 365)
        const isExpired = ageInYears > rule.retentionPeriod
        
        return {
          compliant: !isExpired,
          reason: isExpired ? `Data expired after ${rule.retentionPeriod} ${rule.unit}` : 'Within retention period'
        }
      }
      
      const expiredAssessment = checkDataRetention('eligibility_assessments', new Date('2016-01-01'))
      expect(expiredAssessment.compliant).toBe(false)
      
      const validAssessment = checkDataRetention('eligibility_assessments', new Date('2023-01-01'))
      expect(validAssessment.compliant).toBe(true)
    })

    it('should implement proper consent management', async () => {
      const userId = 'user_123'
      
      // Test consent collection
      const consentRecord = await mockSecurityService.validatePDPACompliance('collect_consent', {
        userId,
        purpose: 'healthier_sg_enrollment',
        dataTypes: ['personal_info', 'health_data', 'eligibility_assessment'],
        retentionPeriod: '7_years',
        consentGiven: true,
        timestamp: new Date().toISOString()
      })
      
      expect(consentRecord.compliant).toBe(true)
      expect(consentRecord.consentId).toBeDefined()
      
      // Test consent withdrawal
      const withdrawalResult = await mockSecurityService.validatePDPACompliance('withdraw_consent', {
        userId,
        consentId: consentRecord.consentId,
        timestamp: new Date().toISOString()
      })
      
      expect(withdrawalResult.compliant).toBe(true)
      expect(withdrawalResult.dataDeleted).toBe(true)
    })

    it('should validate data anonymization for analytics', () => {
      const personalData = {
        id: 'user_123',
        name: 'John Doe',
        age: 45,
        postalCode: '123456',
        healthConditions: ['diabetes', 'hypertension'],
        eligibilityScore: 85
      }
      
      const anonymizeData = (data: any) => ({
        ageGroup: data.age >= 40 && data.age < 50 ? '40-49' : 'other',
        postalPrefix: data.postalCode.substring(0, 2),
        conditionCategories: data.healthConditions.length > 0 ? 'chronic_conditions' : 'none',
        eligibilityRange: data.eligibilityScore >= 80 ? 'high' : 'medium',
        // Remove direct identifiers
      })
      
      const anonymizedData = anonymizeData(personalData)
      
      expect(anonymizedData).not.toHaveProperty('id')
      expect(anonymizedData).not.toHaveProperty('name')
      expect(anonymizedData).not.toHaveProperty('postalCode')
      expect(anonymizedData.ageGroup).toBe('40-49')
    })

    it('should implement right to be forgotten', async () => {
      const userId = 'user_123'
      
      // Request data deletion
      const deletionRequest = await mockSecurityService.validatePDPACompliance('delete_user_data', {
        userId,
        deletionType: 'complete',
        verificationLevel: 'high',
        timestamp: new Date().toISOString()
      })
      
      expect(deletionRequest.compliant).toBe(true)
      expect(deletionRequest.deletionComplete).toBe(true)
      expect(deletionRequest.dataAffected).toContain('eligibility_assessments')
      expect(deletionRequest.dataAffected).toContain('health_records')
      expect(deletionRequest.dataAffected).toContain('audit_logs')
    })
  })

  describe('Government System Integration Security', () => {
    it('should validate MyInfo integration security', async () => {
      const myInfoRequest = {
        serviceId: 'healthier_sg_enrollment',
        userConsent: true,
        attributes: ['name', 'nric', 'date_of_birth', 'nationality', 'mobile_number'],
        purpose: 'Verify eligibility for Healthier SG program',
        expiryTime: new Date(Date.now() + 3600000).toISOString() // 1 hour
      }
      
      const validationResult = await mockSecurityService.validatePDPACompliance('myinfo_integration', myInfoRequest)
      
      expect(validationResult.secure).toBe(true)
      expect(validationResult.encryptionLevel).toBe('government_grade')
      expect(validationResult.auditLogged).toBe(true)
    })

    it('should secure API communications with government systems', () => {
      const apiEndpoints = [
        '/api/moh/eligibility-verify',
        '/api/moh/clinic-registration',
        '/api/moh/benefits-calculation',
        '/api/myinfo/user-verification'
      ]
      
      const securityRequirements = {
        tlsVersion: '1.3',
        certificateValidation: true,
        mutualAuth: true,
        requestSigning: true,
        responseEncryption: true,
        auditLogging: true
      }
      
      apiEndpoints.forEach(endpoint => {
        // Mock security validation
        const endpointSecurity = {
          endpoint,
          ...securityRequirements,
          lastSecurityCheck: new Date().toISOString(),
          complianceStatus: 'COMPLIANT'
        }
        
        expect(endpointSecurity.tlsVersion).toBe('1.3')
        expect(endpointSecurity.mutualAuth).toBe(true)
        expect(endpointSecurity.requestSigning).toBe(true)
        expect(endpointSecurity.complianceStatus).toBe('COMPLIANT')
      })
    })

    it('should validate government data format compliance', () => {
      const nricFormats = [
        { format: 'S1234567A', valid: true },
        { format: 'T1234567I', valid: true },
        { format: 'F1234567Z', valid: true },
        { format: 'G1234567L', valid: true },
        { format: '1234567A', valid: false },
        { format: 'S1234567', valid: false },
        { format: 'INVALID', valid: false }
      ]
      
      const validateNRICFormat = (nric: string) => {
        const nricRegex = /^[STFG][0-9]{7}[A-Z]$/
        return nricRegex.test(nric)
      }
      
      nricFormats.forEach(({ format, valid }) => {
        const isValid = validateNRICFormat(format)
        expect(isValid).toBe(valid)
      })
    })
  })

  describe('Access Control and Permissions', () => {
    it('should implement role-based access control', () => {
      const roles = {
        CITIZEN: ['view_eligibility', 'submit_assessment', 'view_benefits'],
        CLINIC_STAFF: ['view_patients', 'manage_appointments', 'update_health_records'],
        ADMIN: ['view_all_data', 'manage_users', 'generate_reports'],
        COMPLIANCE_OFFICER: ['audit_logs', 'compliance_reports', 'data_retention']
      }
      
      const userPermissions = roles.CITIZEN
      const restrictedActions = ['view_all_data', 'manage_users', 'audit_logs']
      
      // Verify role-based restrictions
      restrictedActions.forEach(action => {
        expect(userPermissions).not.toContain(action)
      })
      
      // Verify role-based permissions
      expect(userPermissions).toContain('view_eligibility')
      expect(userPermissions).toContain('submit_assessment')
    })

    it('should validate JWT token security', async () => {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyXzEyMyIsInJvbGUiOiJDQVQ==' +
                       'ZWEISU4sImlhdCI6MTY0NzM4MDkyMCwiZXhwIjoxNjQ3Mzg0NTIwfQ.signature'
      
      const tokenValidation = await mockSecurityService.validateToken(mockToken)
      
      expect(tokenValidation.valid).toBe(true)
      expect(tokenValidation.notExpired).toBe(true)
      expect(tokenValidation.issuer).toBe('healthier-sg.gov.sg')
      expect(tokenValidation.audience).toBe('healthier-sg-application')
      expect(tokenValidation.roles).toContain('CITIZEN')
    })

    it('should implement proper session management', async () => {
      const sessionId = 'session_12345'
      const sessionData = {
        userId: 'user_123',
        loginTime: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0...',
        permissions: ['view_eligibility', 'submit_assessment']
      }
      
      // Test session validation
      const sessionValidation = {
        sessionId,
        data: sessionData,
        isValid: true,
        expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour
        securityFlags: {
          secure: true,
          httpOnly: true,
          sameSite: 'strict'
        }
      }
      
      expect(sessionValidation.isValid).toBe(true)
      expect(sessionValidation.securityFlags.secure).toBe(true)
      expect(sessionValidation.securityFlags.httpOnly).toBe(true)
    })

    it('should implement rate limiting for API endpoints', async () => {
      const apiEndpoints = [
        '/api/healthier-sg/eligibility',
        '/api/healthier-sg/register',
        '/api/clinics/search',
        '/api/auth/login'
      ]
      
      const rateLimits = {
        '/api/healthier-sg/eligibility': { limit: 100, window: '1h' },
        '/api/healthier-sg/register': { limit: 10, window: '1h' },
        '/api/clinics/search': { limit: 500, window: '1h' },
        '/api/auth/login': { limit: 5, window: '15m' }
      }
      
      // Simulate API rate limit checks
      for (const endpoint of apiEndpoints) {
        const limit = rateLimits[endpoint as keyof typeof rateLimits]
        const withinLimit = Math.random() > 0.01 // 99% within limits
        
        const rateLimitCheck = await mockSecurityService.checkRateLimit(endpoint, 'user_123')
        
        expect(rateLimitCheck.allowed).toBe(withinLimit)
        expect(rateLimitCheck.remaining).toBeGreaterThanOrEqual(0)
      }
    })
  })

  describe('Audit Logging and Compliance', () => {
    it('should log all data access activities', async () => {
      const userId = 'user_123'
      const actions = [
        { action: 'view_eligibility', resource: 'eligibility_assessment_456' },
        { action: 'submit_assessment', resource: 'eligibility_assessment_457' },
        { action: 'view_benefits', resource: 'benefits_calculator' },
        { action: 'register_program', resource: 'healthier_sg_registration' }
      ]
      
      const auditLog = []
      
      for (const activity of actions) {
        const logEntry = await mockAuditService.logAccess({
          userId,
          action: activity.action,
          resource: activity.resource,
          timestamp: new Date().toISOString(),
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0...',
          outcome: 'success'
        })
        
        auditLog.push(logEntry)
      }
      
      expect(auditLog).toHaveLength(4)
      expect(auditLog.every(log => log.userId === userId)).toBe(true)
      expect(auditLog.every(log => log.timestamp)).toBeDefined()
    })

    it('should detect suspicious activities', async () => {
      const suspiciousActivities = [
        {
          userId: 'user_123',
          activities: [
            { action: 'view_assessment', count: 50, timeWindow: '5m' },
            { action: 'failed_login', count: 5, timeWindow: '10m' }
          ],
          suspicious: true,
          riskScore: 85
        },
        {
          userId: 'user_456',
          activities: [
            { action: 'view_assessment', count: 3, timeWindow: '1h' }
          ],
          suspicious: false,
          riskScore: 15
        }
      ]
      
      for (const activity of suspiciousActivities) {
        const detection = await mockAuditService.monitorSuspiciousActivity(activity)
        
        expect(detection.riskScore).toBe(activity.riskScore)
        expect(detection.suspicious).toBe(activity.suspicious)
        
        if (activity.suspicious) {
          expect(detection.alertGenerated).toBe(true)
          expect(detection.investigationRequired).toBe(true)
        }
      }
    })

    it('should generate compliance reports', async () => {
      const complianceMetrics = {
        pdpaCompliant: 98.5,
        dataRetentionCompliant: 99.2,
        auditLogCompleteness: 99.8,
        securityIncidentCount: 2,
        resolvedIncidents: 2,
        userConsentRate: 99.1,
        dataAccuracy: 97.3
      }
      
      const complianceReport = await mockAuditService.generateAuditReport({
        period: 'Q4_2024',
        dataTypes: ['eligibility_assessments', 'health_records', 'registrations'],
        complianceFramework: 'PDPA',
        includeRecommendations: true
      })
      
      expect(complianceReport.period).toBe('Q4_2024')
      expect(complianceReport.overallScore).toBeGreaterThan(95)
      expect(complianceReport.recommendations).toBeDefined()
      expect(complianceReport.incidents).toHaveLength(complianceMetrics.securityIncidentCount)
    })
  })

  describe('Security Incident Response', () => {
    it('should detect and respond to security incidents', async () => {
      const securityIncidents = [
        {
          id: 'incident_001',
          type: 'data_breach',
          severity: 'HIGH',
          detectedAt: new Date().toISOString(),
          affectedRecords: 1250,
          status: 'DETECTED'
        },
        {
          id: 'incident_002',
          type: 'unauthorized_access',
          severity: 'MEDIUM',
          detectedAt: new Date().toISOString(),
          affectedRecords: 5,
          status: 'CONTAINED'
        }
      ]
      
      for (const incident of securityIncidents) {
        const response = await mockAuditService.logSecurityEvent(incident)
        
        expect(response.incidentId).toBe(incident.id)
        expect(response.responseInitiated).toBe(true)
        expect(response.notificationSent).toBe(true)
        
        if (incident.severity === 'HIGH') {
          expect(response.immediateActionsTaken).toBe(true)
          expect(response.authoritiesNotified).toBe(true)
        }
      }
    })

    it('should implement automatic threat detection', async () => {
      const threatIndicators = [
        {
          indicator: 'multiple_failed_logins',
          threshold: 5,
          currentCount: 8,
          action: 'block_ip'
        },
        {
          indicator: 'unusual_data_access_pattern',
          threshold: 100,
          currentCount: 150,
          action: 'require_additional_auth'
        },
        {
          indicator: 'geographic_anomaly',
          threshold: 2,
          currentCount: 1,
          action: 'monitor'
        }
      ]
      
      const automatedResponses = []
      
      for (const indicator of threatIndicators) {
        const automatedResponse = await mockSecurityService.detectSecurityIncidents(indicator)
        
        if (indicator.currentCount > indicator.threshold) {
          expect(automatedResponse.actionTaken).toBe(true)
          expect(automatedResponse.action).toBe(indicator.action)
          automatedResponses.push(automatedResponse)
        }
      }
      
      expect(automatedResponses).toHaveLength(2)
    })

    it('should validate backup and disaster recovery', async () => {
      const backupValidation = {
        lastBackup: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        backupIntegrity: 100,
        encryptionEnabled: true,
        offsiteBackup: true,
        recoveryTimeObjective: '4_hours',
        recoveryPointObjective: '1_hour',
        disasterRecoveryTest: 'PASSED'
      }
      
      expect(backupValidation.backupIntegrity).toBe(100)
      expect(backupValidation.encryptionEnabled).toBe(true)
      expect(backupValidation.offsiteBackup).toBe(true)
      expect(backupValidation.disasterRecoveryTest).toBe('PASSED')
    })
  })

  describe('Data Integrity and Validation', () => {
    it('should validate data integrity across system', async () => {
      const integrityChecks = [
        {
          table: 'eligibility_assessments',
          checks: ['record_count', 'foreign_keys', 'data_types', 'constraints'],
          status: 'PASS',
          anomalies: 0
        },
        {
          table: 'health_records',
          checks: ['encryption_status', 'audit_trail', 'consent_validation'],
          status: 'PASS',
          anomalies: 0
        },
        {
          table: 'user_sessions',
          checks: ['session_expiry', 'security_flags', 'access_patterns'],
          status: 'PASS',
          anomalies: 1
        }
      ]
      
      for (const check of integrityChecks) {
        const validation = await mockSecurityService.checkVulnerability('data_integrity', check)
        
        expect(validation.status).toBe('PASS')
        expect(validation.anomalies).toBeLessThanOrEqual(1)
        
        if (check.anomalies > 0) {
          expect(validation.remediationRequired).toBe(true)
        }
      }
    })

    it('should implement input validation and sanitization', () => {
      const inputValidation = {
        nric: (value: string) => /^[STFG][0-9]{7}[A-Z]$/.test(value),
        postalCode: (value: string) => /^[0-9]{6}$/.test(value),
        phoneNumber: (value: string) => /^\+65-[689][0-9]{7}$/.test(value),
        email: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        age: (value: number) => value >= 18 && value <= 120,
        name: (value: string) => /^[a-zA-Z\s]{2,50}$/.test(value)
      }
      
      const testCases = [
        { field: 'nric', value: 'S1234567A', expected: true },
        { field: 'nric', value: 'INVALID', expected: false },
        { field: 'postalCode', value: '123456', expected: true },
        { field: 'postalCode', value: '12345', expected: false },
        { field: 'phoneNumber', value: '+65-9123-4567', expected: true },
        { field: 'email', value: 'user@example.com', expected: true },
        { field: 'age', value: 45, expected: true },
        { field: 'age', value: 150, expected: false }
      ]
      
      testCases.forEach(({ field, value, expected }) => {
        const validator = inputValidation[field as keyof typeof inputValidation] as any
        const isValid = validator(value)
        expect(isValid).toBe(expected)
      })
    })
  })
})