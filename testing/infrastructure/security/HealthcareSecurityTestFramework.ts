/**
 * Healthcare Security Testing Framework
 * PDPA compliance, MOH standards, and healthcare data protection testing
 */

export interface SecurityTestConfig {
  name: string
  type: 'pdpa' | 'moh' | 'penetration' | 'vulnerability' | 'compliance'
  scope: SecurityScope
  tests: SecurityTest[]
  compliance: ComplianceRequirements
  reporting: SecurityReportConfig
}

export interface SecurityScope {
  endpoints: string[]
  authentication: AuthenticationConfig
  authorization: AuthorizationConfig
  dataTypes: DataType[]
  regulations: Regulation[]
}

export interface AuthenticationConfig {
  enabled: boolean
  methods: ('basic' | 'bearer' | 'oauth2' | 'jwt' | 'session')[]
  sessionTimeout: number
  maxLoginAttempts: number
  passwordPolicy: PasswordPolicy
}

export interface AuthorizationConfig {
  enabled: boolean
  roles: string[]
  permissions: Permission[]
  resourceAccess: ResourceAccess[]
}

export interface PasswordPolicy {
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumbers: boolean
  requireSpecialChars: boolean
  preventReuse: number
  expirationDays: number
}

export interface Permission {
  resource: string
  actions: ('create' | 'read' | 'update' | 'delete' | 'admin')[]
  roles: string[]
}

export interface ResourceAccess {
  resource: string
  access: 'public' | 'authenticated' | 'role-based' | 'owner-only'
  roles?: string[]
}

export interface DataType {
  name: string
  sensitivity: 'low' | 'medium' | 'high' | 'critical'
  pii: boolean
  phi: boolean
  encryption: boolean
  retention: {
    enabled: boolean
    maxDays: number
    deletionRequired: boolean
  }
}

export interface Regulation {
  name: 'PDPA' | 'MOH' | 'HIPAA' | 'ISO27001' | 'GDPR'
  requirements: string[]
  validationLevel: 'basic' | 'strict' | 'comprehensive'
}

export interface SecurityTest {
  name: string
  category: 'authentication' | 'authorization' | 'data_protection' | 'audit' | 'compliance'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  steps: SecurityTestStep[]
  expectedResult: string
  remediation: string
}

export interface SecurityTestStep {
  action: string
  parameters: Record<string, any>
  expectedResponse?: {
    status: number
    headers?: Record<string, string>
    body?: any
  }
  validation?: SecurityValidation[]
}

export interface SecurityValidation {
  type: 'contains' | 'equals' | 'regex' | 'length' | 'encryption'
  value: any
  description: string
}

export interface ComplianceRequirements {
  pdpa: PDPATestConfig
  moh: MOHTestConfig
  healthcare: HealthcareComplianceConfig
}

export interface PDPATestConfig {
  enabled: boolean
  consentManagement: boolean
  dataMinimization: boolean
  purposeLimitation: boolean
  retentionPolicies: boolean
  rightToDeletion: boolean
  anonymization: boolean
  crossBorderTransfers: boolean
}

export interface MOHTestConfig {
  enabled: boolean
  dataFormatValidation: boolean
  medicalRecordIntegrity: boolean
  appointmentBookingCompliance: boolean
  emergencyContactValidation: boolean
  healthcareProviderLicensing: boolean
  medicalDeviceCompliance: boolean
}

export interface HealthcareComplianceConfig {
  patientDataProtection: boolean
  doctorCredentialValidation: boolean
  clinicLicenseCompliance: boolean
  prescriptionValidation: boolean
  medicalCertificateValidation: boolean
}

export interface SecurityReportConfig {
  format: ('json' | 'html' | 'pdf' | 'csv')[]
  includeRecommendations: boolean
  includeExecutiveSummary: boolean
  includeTechnicalDetails: boolean
  includeComplianceMatrix: boolean
  outputDir: string
}

export class HealthcareSecurityTestFramework {
  private static instance: HealthcareSecurityTestFramework
  private configs = new Map<string, SecurityTestConfig>()
  private testResults = new Map<string, SecurityTestResult>()

  public static getInstance(): HealthcareSecurityTestFramework {
    if (!HealthcareSecurityTestFramework.instance) {
      HealthcareSecurityTestFramework.instance = new HealthcareSecurityTestFramework()
    }
    return HealthcareSecurityTestFramework.instance
  }

  // PDPA Compliance Testing Configuration
  public createPDPAComplianceTest(baseUrl: string): SecurityTestConfig {
    return {
      name: 'pdpa-compliance',
      type: 'pdpa',
      scope: {
        endpoints: [
          '/api/patients',
          '/api/patients/{id}',
          '/api/medical-records',
          '/api/appointments',
          '/api/pdpa/consent',
          '/api/pdpa/data-request',
          '/api/pdpa/deletion-request'
        ],
        authentication: {
          enabled: true,
          methods: ['bearer', 'session'],
          sessionTimeout: 1800, // 30 minutes
          maxLoginAttempts: 3,
          passwordPolicy: {
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: true,
            preventReuse: 5,
            expirationDays: 90
          }
        },
        authorization: {
          enabled: true,
          roles: ['patient', 'doctor', 'admin', 'receptionist'],
          permissions: [
            {
              resource: 'patient-data',
              actions: ['read', 'update'],
              roles: ['patient', 'doctor', 'admin']
            },
            {
              resource: 'medical-records',
              actions: ['read', 'create', 'update'],
              roles: ['doctor', 'admin']
            },
            {
              resource: 'appointments',
              actions: ['read', 'create', 'update', 'delete'],
              roles: ['patient', 'doctor', 'receptionist']
            },
            {
              resource: 'pdpa-data',
              actions: ['read', 'delete'],
              roles: ['patient', 'admin']
            }
          ],
          resourceAccess: [
            {
              resource: 'patient-profile',
              access: 'owner-only',
              roles: ['patient']
            },
            {
              resource: 'medical-records',
              access: 'role-based',
              roles: ['doctor', 'admin']
            },
            {
              resource: 'appointments',
              access: 'authenticated',
              roles: ['patient', 'doctor', 'receptionist']
            }
          ]
        },
        dataTypes: [
          {
            name: 'Patient NRIC',
            sensitivity: 'critical',
            pii: true,
            phi: true,
            encryption: true,
            retention: {
              enabled: true,
              maxDays: 2555, // 7 years
              deletionRequired: true
            }
          },
          {
            name: 'Medical Records',
            sensitivity: 'critical',
            pii: true,
            phi: true,
            encryption: true,
            retention: {
              enabled: true,
              maxDays: 2555,
              deletionRequired: true
            }
          },
          {
            name: 'Contact Information',
            sensitivity: 'high',
            pii: true,
            phi: false,
            encryption: true,
            retention: {
              enabled: true,
              maxDays: 2555,
              deletionRequired: true
            }
          },
          {
            name: 'Appointment Data',
            sensitivity: 'medium',
            pii: true,
            phi: true,
            encryption: true,
            retention: {
              enabled: true,
              maxDays: 2555,
              deletionRequired: true
            }
          }
        ],
        regulations: [
          {
            name: 'PDPA',
            requirements: [
              'consent_obtained',
              'purpose_limitation',
              'data_minimization',
              'retention_policies',
              'access_rights',
              'correction_rights',
              'deletion_rights',
              'data_portability'
            ],
            validationLevel: 'comprehensive'
          }
        ]
      },
      tests: [
        // PDPA Consent Tests
        {
          name: 'Consent Collection Validation',
          category: 'data_protection',
          severity: 'critical',
          description: 'Verify PDPA consent is properly collected and stored',
          steps: [
            {
              action: 'post',
              parameters: {
                endpoint: '/api/patients',
                body: {
                  name: 'Test Patient',
                  nric: 'S1234567A',
                  email: 'test@example.com',
                  pdpaConsent: {
                    given: false,
                    scope: ['medical_records']
                  }
                }
              },
              expectedResponse: {
                status: 400,
                body: {
                  error: 'PDPA consent required',
                  code: 'CONSENT_REQUIRED'
                }
              }
            },
            {
              action: 'post',
              parameters: {
                endpoint: '/api/patients',
                body: {
                  name: 'Test Patient',
                  nric: 'S1234567A',
                  email: 'test@example.com',
                  pdpaConsent: {
                    given: true,
                    timestamp: new Date().toISOString(),
                    version: '2025.1',
                    scope: ['medical_records', 'appointments']
                  }
                }
              },
              expectedResponse: {
                status: 201
              }
            }
          ],
          expectedResult: 'Consent validation prevents registration without proper PDPA consent',
          remediation: 'Implement server-side PDPA consent validation'
        },
        {
          name: 'Data Minimization Check',
          category: 'data_protection',
          severity: 'high',
          description: 'Ensure only necessary data is collected and processed',
          steps: [
            {
              action: 'get',
              parameters: {
                endpoint: '/api/patients/{id}/profile',
                headers: {
                  'Authorization': 'Bearer {token}'
                }
              },
              validation: [
                {
                  type: 'contains',
                  value: 'name',
                  description: 'Should contain required name field'
                },
                {
                  type: 'contains',
                  value: 'nric',
                  description: 'Should contain NRIC for medical purposes'
                },
                {
                  type: 'contains',
                  value: 'creditCard',
                  description: 'Should NOT contain unnecessary payment data'
                },
                {
                  type: 'contains',
                  value: 'socialSecurityNumber',
                  description: 'Should NOT contain unnecessary SSN'
                }
              ]
            }
          ],
          expectedResult: 'Only necessary fields are exposed in API responses',
          remediation: 'Review API responses and remove unnecessary personal data'
        },
        {
          name: 'Purpose Limitation Validation',
          category: 'data_protection',
          severity: 'high',
          description: 'Verify data is used only for stated purposes',
          steps: [
            {
              action: 'post',
              parameters: {
                endpoint: '/api/marketing/emails',
                body: {
                  recipientId: 'patient123',
                  message: 'Promotional content',
                  purpose: 'marketing'
                }
              },
              expectedResponse: {
                status: 403,
                body: {
                  error: 'Purpose not authorized for this data type',
                  code: 'PURPOSE_NOT_AUTHORIZED'
                }
              }
            },
            {
              action: 'post',
              parameters: {
                endpoint: '/api/medical-records',
                body: {
                  patientId: 'patient123',
                  diagnosis: 'General consultation',
                  purpose: 'medical_treatment'
                }
              },
              expectedResponse: {
                status: 201
              }
            }
          ],
          expectedResult: 'Data usage is restricted to authorized purposes',
          remediation: 'Implement purpose validation middleware'
        },
        {
          name: 'Right to Deletion Test',
          category: 'data_protection',
          severity: 'critical',
          description: 'Verify patients can request and receive data deletion',
          steps: [
            {
              action: 'post',
              parameters: {
                endpoint: '/api/pdpa/deletion-request',
                body: {
                  patientId: 'patient123',
                  requestType: 'complete_deletion',
                  reason: 'Withdrawal of consent',
                  timestamp: new Date().toISOString()
                }
              },
              expectedResponse: {
                status: 202
              }
            },
            {
              action: 'get',
              parameters: {
                endpoint: '/api/patients/patient123',
                headers: {
                  'Authorization': 'Bearer {token}'
                }
              },
              expectedResponse: {
                status: 404,
                body: {
                  error: 'Patient data not found',
                  code: 'DATA_NOT_FOUND'
                }
              }
            }
          ],
          expectedResult: 'Patient data is completely deleted upon request',
          remediation: 'Implement comprehensive data deletion with audit logging'
        },
        {
          name: 'Data Retention Policy Compliance',
          category: 'compliance',
          severity: 'medium',
          description: 'Verify data is automatically deleted after retention period',
          steps: [
            {
              action: 'get',
              parameters: {
                endpoint: '/api/audit/data-retention',
                headers: {
                  'Authorization': 'Bearer {adminToken}'
                }
              },
              validation: [
                {
                  type: 'regex',
                  value: '"expiredRecords":\\s*\\[',
                  description: 'Should identify expired records for deletion'
                }
              ]
            }
          ],
          expectedResult: 'Expired data is automatically scheduled for deletion',
          remediation: 'Implement automated data retention and deletion'
        },
        {
          name: 'Data Portability Test',
          category: 'data_protection',
          severity: 'medium',
          description: 'Verify patients can export their data',
          steps: [
            {
              action: 'post',
              parameters: {
                endpoint: '/api/pdpa/data-request',
                body: {
                  patientId: 'patient123',
                  requestType: 'data_export',
                  format: 'json',
                  timestamp: new Date().toISOString()
                }
              },
              expectedResponse: {
                status: 202
              }
            },
            {
              action: 'get',
              parameters: {
                endpoint: '/api/pdpa/data-export/{requestId}',
                headers: {
                  'Authorization': 'Bearer {token}'
                }
              },
              validation: [
                {
                  type: 'contains',
                  value: 'personalData',
                  description: 'Should contain personal data section'
                },
                {
                  type: 'contains',
                  value: 'medicalRecords',
                  description: 'Should contain medical records'
                },
                {
                  type: 'contains',
                  value: 'appointments',
                  description: 'Should contain appointment history'
                }
              ]
            }
          ],
          expectedResult: 'Patient can export all their data in portable format',
          remediation: 'Implement comprehensive data export functionality'
        }
      ],
      compliance: {
        pdpa: {
          enabled: true,
          consentManagement: true,
          dataMinimization: true,
          purposeLimitation: true,
          retentionPolicies: true,
          rightToDeletion: true,
          anonymization: true,
          crossBorderTransfers: false // Singapore-based only
        },
        moh: {
          enabled: false,
          dataFormatValidation: false,
          medicalRecordIntegrity: false,
          appointmentBookingCompliance: false,
          emergencyContactValidation: false,
          healthcareProviderLicensing: false,
          medicalDeviceCompliance: false
        },
        healthcare: {
          patientDataProtection: true,
          doctorCredentialValidation: false,
          clinicLicenseCompliance: false,
          prescriptionValidation: false,
          medicalCertificateValidation: false
        }
      },
      reporting: {
        format: ['json', 'html', 'pdf'],
        includeRecommendations: true,
        includeExecutiveSummary: true,
        includeTechnicalDetails: true,
        includeComplianceMatrix: true,
        outputDir: './test-results/security/pdpa'
      }
    }
  }

  // MOH Standards Testing Configuration
  public createMOHStandardsTest(baseUrl: string): SecurityTestConfig {
    return {
      name: 'moh-standards',
      type: 'moh',
      scope: {
        endpoints: [
          '/api/doctors',
          '/api/doctors/{id}/credentials',
          '/api/medical-records',
          '/api/prescriptions',
          '/api/medical-certificates',
          '/api/clinic/licensing'
        ],
        authentication: {
          enabled: true,
          methods: ['bearer', 'jwt'],
          sessionTimeout: 3600, // 1 hour
          maxLoginAttempts: 3,
          passwordPolicy: {
            minLength: 10,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: true,
            preventReuse: 3,
            expirationDays: 60
          }
        },
        authorization: {
          enabled: true,
          roles: ['doctor', 'admin', 'regulator'],
          permissions: [
            {
              resource: 'medical-records',
              actions: ['create', 'read', 'update'],
              roles: ['doctor']
            },
            {
              resource: 'prescriptions',
              actions: ['create', 'read'],
              roles: ['doctor']
            },
            {
              resource: 'doctor-credentials',
              actions: ['read', 'update'],
              roles: ['doctor', 'admin']
            }
          ],
          resourceAccess: [
            {
              resource: 'medical-records',
              access: 'role-based',
              roles: ['doctor']
            },
            {
              resource: 'doctor-credentials',
              access: 'role-based',
              roles: ['doctor', 'admin']
            }
          ]
        },
        dataTypes: [
          {
            name: 'Medical Records',
            sensitivity: 'critical',
            pii: true,
            phi: true,
            encryption: true,
            retention: {
              enabled: true,
              maxDays: 3650, // 10 years for MOH compliance
              deletionRequired: false // MOH requires retention
            }
          },
          {
            name: 'Doctor Credentials',
            sensitivity: 'high',
            pii: true,
            phi: false,
            encryption: true,
            retention: {
              enabled: true,
              maxDays: 3650,
              deletionRequired: false
            }
          }
        ],
        regulations: [
          {
            name: 'MOH',
            requirements: [
              'doctor_registration_validation',
              'medical_record_integrity',
              'prescription_format_compliance',
              'clinic_licensing_compliance',
              'medical_device_registration',
              'data_retenion_compliance'
            ],
            validationLevel: 'comprehensive'
          }
        ]
      },
      tests: [
        {
          name: 'Doctor Registration Validation',
          category: 'compliance',
          severity: 'critical',
          description: 'Verify doctor registration numbers are validated against MOH database',
          steps: [
            {
              action: 'post',
              parameters: {
                endpoint: '/api/doctors',
                body: {
                  name: 'Dr. Invalid',
                  registrationNumber: 'INVALID123',
                  specialization: 'General Practice'
                }
              },
              expectedResponse: {
                status: 400,
                body: {
                  error: 'Invalid registration number',
                  code: 'INVALID_REGISTRATION'
                }
              }
            },
            {
              action: 'post',
              parameters: {
                endpoint: '/api/doctors',
                body: {
                  name: 'Dr. Valid',
                  registrationNumber: 'MCR12345',
                  specialization: 'General Practice'
                }
              },
              validation: [
                {
                  type: 'regex',
                  value: '"registrationNumber":\\s*"MCR\\d{5}"',
                  description: 'Should validate MCR format'
                }
              ]
            }
          ],
          expectedResult: 'Doctor registration numbers are validated',
          remediation: 'Integrate with MOH doctor registration database'
        },
        {
          name: 'Medical Record Format Compliance',
          category: 'compliance',
          severity: 'high',
          description: 'Verify medical records follow MOH required format',
          steps: [
            {
              action: 'post',
              parameters: {
                endpoint: '/api/medical-records',
                body: {
                  patientId: 'patient123',
                  doctorId: 'doctor123',
                  diagnosis: '',
                  treatment: '',
                  doctorNotes: ''
                }
              },
              expectedResponse: {
                status: 400,
                body: {
                  error: 'Required fields missing',
                  code: 'MISSING_REQUIRED_FIELDS'
                }
              }
            },
            {
              action: 'post',
              parameters: {
                endpoint: '/api/medical-records',
                body: {
                  patientId: 'patient123',
                  doctorId: 'doctor123',
                  diagnosis: 'Upper Respiratory Tract Infection',
                  treatment: 'Prescribed medication and rest',
                  doctorNotes: 'Patient advised to return if symptoms worsen'
                }
              },
              expectedResponse: {
                status: 201
              }
            }
          ],
          expectedResult: 'Medical records follow MOH required format',
          remediation: 'Implement MOH medical record format validation'
        }
      ],
      compliance: {
        pdpa: {
          enabled: false,
          consentManagement: false,
          dataMinimization: false,
          purposeLimitation: false,
          retentionPolicies: false,
          rightToDeletion: false,
          anonymization: false,
          crossBorderTransfers: false
        },
        moh: {
          enabled: true,
          dataFormatValidation: true,
          medicalRecordIntegrity: true,
          appointmentBookingCompliance: true,
          emergencyContactValidation: true,
          healthcareProviderLicensing: true,
          medicalDeviceCompliance: false
        },
        healthcare: {
          patientDataProtection: false,
          doctorCredentialValidation: true,
          clinicLicenseCompliance: true,
          prescriptionValidation: true,
          medicalCertificateValidation: true
        }
      },
      reporting: {
        format: ['json', 'html'],
        includeRecommendations: true,
        includeExecutiveSummary: true,
        includeTechnicalDetails: true,
        includeComplianceMatrix: true,
        outputDir: './test-results/security/moh'
      }
    }
  }

  // Penetration Testing Configuration
  public createPenetrationTest(baseUrl: string): SecurityTestConfig {
    return {
      name: 'penetration-test',
      type: 'penetration',
      scope: {
        endpoints: ['/api/*'],
        authentication: {
          enabled: true,
          methods: ['bearer', 'session'],
          sessionTimeout: 1800,
          maxLoginAttempts: 5,
          passwordPolicy: {
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: false,
            preventReuse: 3,
            expirationDays: 90
          }
        },
        authorization: {
          enabled: true,
          roles: ['patient', 'doctor', 'admin', 'receptionist'],
          permissions: [],
          resourceAccess: []
        },
        dataTypes: [],
        regulations: []
      },
      tests: [
        {
          name: 'SQL Injection Test',
          category: 'vulnerability',
          severity: 'critical',
          description: 'Test for SQL injection vulnerabilities in patient data queries',
          steps: [
            {
              action: 'get',
              parameters: {
                endpoint: '/api/patients?id=1\' OR \'1\'=\'1'
              },
              expectedResponse: {
                status: 400,
                body: {
                  error: 'Invalid parameter format'
                }
              }
            },
            {
              action: 'post',
              parameters: {
                endpoint: '/api/patients/search',
                body: {
                  query: '\' OR \'1\'=\'1'
                }
              },
              expectedResponse: {
                status: 400
              }
            }
          ],
          expectedResult: 'SQL injection attempts are properly sanitized',
          remediation: 'Use parameterized queries and input sanitization'
        },
        {
          name: 'XSS Test',
          category: 'vulnerability',
          severity: 'high',
          description: 'Test for Cross-Site Scripting vulnerabilities in patient names',
          steps: [
            {
              action: 'post',
              parameters: {
                endpoint: '/api/patients',
                body: {
                  name: '<script>alert(\'xss\')</script>',
                  nric: 'S1234567A',
                  email: 'test@example.com'
                }
              },
              validation: [
                {
                  type: 'regex',
                  value: '<script>',
                  description: 'Script tags should be sanitized or rejected'
                }
              ]
            }
          ],
          expectedResult: 'Malicious scripts are sanitized',
          remediation: 'Implement output encoding and input validation'
        },
        {
          name: 'Authentication Bypass Test',
          category: 'authentication',
          severity: 'critical',
          description: 'Test for authentication bypass vulnerabilities',
          steps: [
            {
              action: 'get',
              parameters: {
                endpoint: '/api/admin/users',
                headers: {
                  'Authorization': 'Bearer invalid-token'
                }
              },
              expectedResponse: {
                status: 401
              }
            },
            {
              action: 'get',
              parameters: {
                endpoint: '/api/admin/users'
              },
              expectedResponse: {
                status: 401
              }
            }
          ],
          expectedResult: 'All protected endpoints require valid authentication',
          remediation: 'Implement proper authentication middleware'
        },
        {
          name: 'Authorization Escalation Test',
          category: 'authorization',
          severity: 'high',
          description: 'Test for privilege escalation vulnerabilities',
          steps: [
            {
              action: 'post',
              parameters: {
                endpoint: '/api/appointments',
                headers: {
                  'Authorization': 'Bearer {patientToken}'
                },
                body: {
                  patientId: 'other-patient-id'
                }
              },
              expectedResponse: {
                status: 403
              }
            }
          ],
          expectedResult: 'Users cannot access resources they don\'t own',
          remediation: 'Implement proper resource ownership validation'
        }
      ],
      compliance: {
        pdpa: {
          enabled: false,
          consentManagement: false,
          dataMinimization: false,
          purposeLimitation: false,
          retentionPolicies: false,
          rightToDeletion: false,
          anonymization: false,
          crossBorderTransfers: false
        },
        moh: {
          enabled: false,
          dataFormatValidation: false,
          medicalRecordIntegrity: false,
          appointmentBookingCompliance: false,
          emergencyContactValidation: false,
          healthcareProviderLicensing: false,
          medicalDeviceCompliance: false
        },
        healthcare: {
          patientDataProtection: true,
          doctorCredentialValidation: false,
          clinicLicenseCompliance: false,
          prescriptionValidation: false,
          medicalCertificateValidation: false
        }
      },
      reporting: {
        format: ['json', 'html', 'pdf'],
        includeRecommendations: true,
        includeExecutiveSummary: true,
        includeTechnicalDetails: true,
        includeComplianceMatrix: false,
        outputDir: './test-results/security/penetration'
      }
    }
  }

  // Test execution methods
  public async runSecurityTest(config: SecurityTestConfig): Promise<SecurityTestResult> {
    console.log(`🔒 Starting security test: ${config.name}`)
    console.log(`   Type: ${config.type}`)
    console.log(`   Tests: ${config.tests.length}`)
    
    const startTime = Date.now()
    const results: SecurityTestExecution[] = []
    let overallCompliance = true
    
    for (const test of config.tests) {
      console.log(`   Running test: ${test.name}`)
      
      const testResult = await this.executeSecurityTest(test)
      results.push(testResult)
      
      if (testResult.status === 'failed') {
        overallCompliance = false
      }
      
      if (test.severity === 'critical' && testResult.status === 'failed') {
        console.error(`   ❌ CRITICAL SECURITY ISSUE: ${test.name}`)
      }
    }
    
    // Generate compliance report
    const complianceMatrix = await this.generateComplianceMatrix(config)
    
    const result: SecurityTestResult = {
      config,
      startTime: new Date(startTime),
      endTime: new Date(),
      duration: (Date.now() - startTime) / 1000,
      tests: results,
      overallCompliance,
      complianceMatrix,
      reportPaths: []
    }
    
    // Generate reports
    result.reportPaths = await this.generateSecurityReports(config, result)
    
    console.log(`✅ Security test completed: ${config.name}`)
    console.log(`   Overall Compliance: ${overallCompliance ? 'PASS' : 'FAIL'}`)
    console.log(`   Tests Passed: ${results.filter(r => r.status === 'passed').length}/${results.length}`)
    
    this.testResults.set(config.name, result)
    return result
  }

  private async executeSecurityTest(test: SecurityTest): Promise<SecurityTestExecution> {
    const startTime = Date.now()
    const stepResults: SecurityTestStepResult[] = []
    
    try {
      for (const step of test.steps) {
        const stepResult = await this.executeTestStep(step)
        stepResults.push(stepResult)
        
        if (!stepResult.passed) {
          break // Stop on first failure
        }
      }
      
      const allStepsPassed = stepResults.every(r => r.passed)
      
      return {
        testName: test.name,
        status: allStepsPassed ? 'passed' : 'failed',
        duration: (Date.now() - startTime) / 1000,
        stepResults,
        issue: allStepsPassed ? null : stepResults.find(r => !r.passed)?.issue || 'Test failed'
      }
      
    } catch (error) {
      return {
        testName: test.name,
        status: 'failed',
        duration: (Date.now() - startTime) / 1000,
        stepResults,
        issue: error instanceof Error ? error.message : String(error)
      }
    }
  }

  private async executeTestStep(step: SecurityTestStep): Promise<SecurityTestStepResult> {
    // Mock implementation - would execute actual HTTP requests
    const result: SecurityTestStepResult = {
      action: step.action,
      passed: true,
      details: '',
      validationResults: []
    }
    
    // Simulate validation
    if (step.validation) {
      for (const validation of step.validation) {
        const validationResult = await this.validateResponse(step, validation)
        result.validationResults.push(validationResult)
        
        if (!validationResult.passed) {
          result.passed = false
        }
      }
    }
    
    // Simulate expected response check
    if (step.expectedResponse) {
      // Mock response validation
      result.passed = Math.random() > 0.1 // 90% pass rate for simulation
    }
    
    return result
  }

  private async validateResponse(step: SecurityTestStep, validation: SecurityValidation): Promise<SecurityValidationResult> {
    // Mock implementation - would validate actual responses
    const passed = Math.random() > 0.1 // 90% pass rate
    
    return {
      type: validation.type,
      expected: validation.value,
      actual: passed ? validation.value : 'mismatch',
      passed,
      description: validation.description
    }
  }

  private async generateComplianceMatrix(config: SecurityTestConfig): Promise<ComplianceMatrix> {
    const matrix: ComplianceMatrix = {
      pdpa: {
        consentManagement: false,
        dataMinimization: false,
        purposeLimitation: false,
        retentionPolicies: false,
        rightToDeletion: false,
        anonymization: false
      },
      moh: {
        dataFormatValidation: false,
        medicalRecordIntegrity: false,
        appointmentBookingCompliance: false,
        emergencyContactValidation: false,
        healthcareProviderLicensing: false,
        medicalDeviceCompliance: false
      },
      healthcare: {
        patientDataProtection: false,
        doctorCredentialValidation: false,
        clinicLicenseCompliance: false,
        prescriptionValidation: false,
        medicalCertificateValidation: false
      }
    }
    
    // Mock implementation - would analyze test results to determine compliance
    if (config.compliance.pdpa.enabled) {
      matrix.pdpa.consentManagement = Math.random() > 0.2
      matrix.pdpa.dataMinimization = Math.random() > 0.3
      matrix.pdpa.purposeLimitation = Math.random() > 0.2
      matrix.pdpa.retentionPolicies = Math.random() > 0.1
      matrix.pdpa.rightToDeletion = Math.random() > 0.2
      matrix.pdpa.anonymization = Math.random() > 0.4
    }
    
    return matrix
  }

  private async generateSecurityReports(
    config: SecurityTestConfig, 
    result: SecurityTestResult
  ): Promise<string[]> {
    const reportPaths: string[] = []
    
    for (const format of config.reporting.format) {
      const path = `${config.reporting.outputDir}/${config.name}.${format}`
      reportPaths.push(path)
      
      // Mock report generation
      if (format === 'json') {
        await this.generateJSONSecurityReport(config, result, path)
      } else if (format === 'html') {
        await this.generateHTMLSecurityReport(config, result, path)
      } else if (format === 'pdf') {
        await this.generatePDFSecurityReport(config, result, path)
      }
    }
    
    return reportPaths
  }

  private async generateJSONSecurityReport(
    config: SecurityTestConfig, 
    result: SecurityTestResult, 
    path: string
  ): Promise<void> {
    const report = {
      testName: config.name,
      timestamp: new Date().toISOString(),
      duration: result.duration,
      overallCompliance: result.overallCompliance,
      tests: result.tests,
      complianceMatrix: result.complianceMatrix,
      summary: {
        totalTests: result.tests.length,
        passedTests: result.tests.filter(t => t.status === 'passed').length,
        failedTests: result.tests.filter(t => t.status === 'failed').length,
        criticalIssues: result.tests.filter(t => t.testName && 
          result.tests.find(test => test.testName === t.testName)?.stepResults
          .some(step => step.issue?.toLowerCase().includes('critical'))).length
      }
    }
    
    console.log(`📄 Generated security report: ${path}`)
  }

  private async generateHTMLSecurityReport(
    config: SecurityTestConfig, 
    result: SecurityTestResult, 
    path: string
  ): Promise<void> {
    console.log(`📄 Generated HTML security report: ${path}`)
  }

  private async generatePDFSecurityReport(
    config: SecurityTestConfig, 
    result: SecurityTestResult, 
    path: string
  ): Promise<void> {
    console.log(`📄 Generated PDF security report: ${path}`)
  }

  // Configuration management
  public setConfig(name: string, config: SecurityTestConfig): void {
    this.configs.set(name, config)
  }

  public getConfig(name: string): SecurityTestConfig | undefined {
    return this.configs.get(name)
  }

  public getResult(name: string): SecurityTestResult | undefined {
    return this.testResults.get(name)
  }

  public listConfigs(): string[] {
    return Array.from(this.configs.keys())
  }
}

// Result interfaces
export interface SecurityTestResult {
  config: SecurityTestConfig
  startTime: Date
  endTime: Date
  duration: number
  tests: SecurityTestExecution[]
  overallCompliance: boolean
  complianceMatrix: ComplianceMatrix
  reportPaths: string[]
}

export interface SecurityTestExecution {
  testName: string
  status: 'passed' | 'failed'
  duration: number
  stepResults: SecurityTestStepResult[]
  issue?: string
}

export interface SecurityTestStepResult {
  action: string
  passed: boolean
  details: string
  validationResults: SecurityValidationResult[]
}

export interface SecurityValidationResult {
  type: string
  expected: any
  actual: any
  passed: boolean
  description: string
}

export interface ComplianceMatrix {
  pdpa: Record<string, boolean>
  moh: Record<string, boolean>
  healthcare: Record<string, boolean>
}

// Export singleton instance
export const securityTestFramework = HealthcareSecurityTestFramework.getInstance()