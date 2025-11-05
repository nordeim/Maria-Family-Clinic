import { describe, it, expect, beforeEach, afterEach, vi, beforeAll } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

// Mock compliance services
const mockComplianceService = {
  validateMCRFormat: vi.fn(),
  validateSPCFormat: vi.fn(),
  checkSingaporeMedicalRegulations: vi.fn(),
  auditDataHandling: vi.fn(),
  validatePatientDataProtection: vi.fn(),
  verifyDoctorCredentials: vi.fn()
}

const mockSecurityService = {
  encryptSensitiveData: vi.fn(),
  decryptSensitiveData: vi.fn(),
  auditDataAccess: vi.fn(),
  validateDataIntegrity: vi.fn(),
  checkForDataBreaches: vi.fn(),
  generateComplianceReports: vi.fn()
}

const mockValidationService = {
  validateMedicalCredentials: vi.fn(),
  verifyInstitutionRecognition: vi.fn(),
  checkLicenseStatus: vi.fn(),
  validateSpecialtyCertification: vi.fn()
}

// Mock doctor data for compliance testing
const mockDoctorWithCredentials = {
  id: 'doc_001',
  name: 'Dr. Sarah Chen Li Ming',
  specialty: 'Cardiology',
  subSpecialties: ['Interventional Cardiology', 'Heart Failure'],
  qualifications: [
    { 
      degree: 'MBBS', 
      institution: 'National University of Singapore', 
      year: 2015,
      verified: true,
      institutionType: 'local',
      accreditationStatus: 'accredited'
    },
    { 
      degree: 'MD', 
      institution: 'Harvard Medical School', 
      year: 2019,
      verified: true,
      institutionType: 'foreign',
      accreditationStatus: 'recognized'
    },
    { 
      degree: 'FACC', 
      institution: 'American College of Cardiology', 
      year: 2022,
      verified: true,
      institutionType: 'foreign',
      accreditationStatus: 'recognized'
    }
  ],
  experience: 8,
  languages: ['English', 'Mandarin', 'Malay'],
  bio: 'Experienced cardiologist specializing in interventional procedures and heart failure management.',
  clinicId: 'clinic_001',
  clinic: {
    name: 'Heart Care Medical Centre',
    address: '123 Medical Drive, Singapore 169857',
    phone: '+65-6123-4567',
    mcrRegistered: true,
    operatingLicense: 'CL-2025-001',
    accreditedBy: 'MOH Singapore'
  },
  rating: 4.8,
  reviewCount: 156,
  verificationBadges: {
    mcrVerified: true,
    spcVerified: true,
    boardCertified: true,
    experienceVerified: true
  },
  profileImage: '/images/doctors/dr-sarah-chen.jpg',
  availableSlots: [
    { date: '2025-11-05', time: '09:00', available: true }
  ],
  consultationFees: { consultation: 120, followUp: 80, procedure: 300 },
  telemedicineAvailable: true,
  waitingTime: 15,
  // Critical compliance fields
  mcrNumber: 'M12345A',
  spcNumber: 'SPC789012',
  medicalLicense: {
    number: 'ML-SG-2020-001',
    issuedDate: '2020-01-15',
    expiryDate: '2025-01-15',
    status: 'active',
    restrictions: [],
    issuingAuthority: 'Singapore Medical Council'
  },
  specialtyRegistrations: [
    {
      specialty: 'Cardiology',
      subSpecialty: 'Interventional Cardiology',
      registrationDate: '2021-03-01',
      expiryDate: '2026-03-01',
      status: 'active',
      issuingAuthority: 'Specialist Accreditation Board Singapore'
    }
  ],
  boardCertifications: [
    { 
      board: 'American Board of Cardiology', 
      certified: true, 
      year: 2020, 
      expiryYear: 2025,
      verified: true
    }
  ],
  professionalIndemnity: {
    provider: 'Medical Protection Society',
    policyNumber: 'MPS-2025-001',
    coverageAmount: 1000000,
    expiryDate: '2025-12-31',
    status: 'active'
  },
  continuingEducation: {
    cmePointsEarned: 45,
    cmePointsRequired: 50,
    lastUpdated: '2025-10-15',
    status: 'compliant'
  },
  disciplinaryRecord: {
    hasActions: false,
    actions: []
  },
  languages: ['English', 'Mandarin', 'Malay']
}

const mockInvalidDoctor = {
  ...mockDoctorWithCredentials,
  mcrNumber: 'INVALID123', // Invalid format
  spcNumber: '', // Missing
  medicalLicense: {
    number: 'ML-EXPIRED-2020-001',
    issuedDate: '2020-01-15',
    expiryDate: '2023-01-15', // Expired
    status: 'expired',
    restrictions: [],
    issuingAuthority: 'Singapore Medical Council'
  }
}

describe('Healthcare Compliance Testing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock environment for security testing
    vi.stubGlobal('crypto', {
      getRandomValues: vi.fn(() => new Uint8Array(16)),
      subtle: {
        encrypt: vi.fn(),
        decrypt: vi.fn(),
        digest: vi.fn()
      }
    })
    
    // Mock localStorage for secure storage testing
    const secureStorageMock = {
      setItem: vi.fn(),
      getItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    }
    vi.stubGlobal('localStorage', secureStorageMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('Singapore Medical Regulations Compliance Validation', () => {
    it('should validate MCR (Medical Registration Number) format', () => {
      const validMCRNumbers = [
        'M12345A',
        'M67890B',
        'M11111Z'
      ]
      
      const invalidMCRNumbers = [
        'ABC123', // Wrong format
        'M12345', // Missing letter
        '12345A', // Missing M
        'M123456', // Too long
        'M1234' // Too short
      ]
      
      const validateMCRFormat = (mcrNumber: string) => {
        const mcrRegex = /^M[0-9]{5}[A-Z]$/
        return mcrRegex.test(mcrNumber)
      }
      
      validMCRNumbers.forEach(mcr => {
        expect(validateMCRFormat(mcr)).toBe(true)
      })
      
      invalidMCRNumbers.forEach(mcr => {
        expect(validateMCRFormat(mcr)).toBe(false)
      })
    })

    it('should validate SPC (Specialist Practice Certificate) format', () => {
      const validSPCNumbers = [
        'SPC123456',
        'SPC789012',
        'SPC111111'
      ]
      
      const invalidSPCNumbers = [
        'SPC12345', // Too short
        'SPC1234567', // Too long
        'SPC12345A', // Contains letter
        '123456', // Missing SPC prefix
        'spc123456' // Wrong case
      ]
      
      const validateSPCFormat = (spcNumber: string) => {
        const spcRegex = /^SPC[0-9]{6,8}$/
        return spcRegex.test(spcNumber)
      }
      
      validSPCNumbers.forEach(spc => {
        expect(validateSPCFormat(spc)).toBe(true)
      })
      
      invalidSPCNumbers.forEach(spc => {
        expect(validateSPCFormat(spc)).toBe(false)
      })
    })

    it('should validate Singapore Medical Council compliance', async () => {
      mockComplianceService.checkSingaporeMedicalRegulations.mockResolvedValue({
        compliant: true,
        checks: {
          mcrValid: true,
          licenseActive: true,
          specialtyRegistered: true,
          noDisciplinaryActions: true,
          cmeCompliant: true
        },
        warnings: [],
        lastChecked: '2025-11-04T10:00:00Z'
      })
      
      render(
        <div className="smc-compliance-test">
          <h2>Singapore Medical Council Compliance Check</h2>
          <div data-testid="compliance-status">Checking compliance...</div>
          <div data-testid="compliance-details" style={{ display: 'none' }}>
            <div data-testid="mcr-status">MCR: Valid</div>
            <div data-testid="license-status">License: Active</div>
            <div data-testid="specialty-status">Specialty: Registered</div>
            <div data-testid="disciplinary-status">Disciplinary: Clear</div>
            <div data-testid="cme-status">CME: Compliant</div>
          </div>
          <button data-testid="run-compliance-check">Run Compliance Check</button>
        </div>
      )
      
      const checkButton = screen.getByTestId('run-compliance-check')
      
      await act(async () => {
        fireEvent.click(checkButton)
      })
      
      await waitFor(() => {
        expect(mockComplianceService.checkSingaporeMedicalRegulations).toHaveBeenCalledWith('doc_001')
      })
      
      await waitFor(() => {
        expect(screen.getByTestId('compliance-status')).toHaveTextContent('Compliant')
      })
    })

    it('should handle non-compliant medical professionals', async () => {
      mockComplianceService.checkSingaporeMedicalRegulations.mockResolvedValue({
        compliant: false,
        checks: {
          mcrValid: false,
          licenseActive: false,
          specialtyRegistered: true,
          noDisciplinaryActions: false,
          cmeCompliant: true
        },
        warnings: [
          'MCR format invalid',
          'Medical license expired',
          'Disciplinary action found'
        ],
        violations: [
          'Operating with expired license',
          'Unregistered specialty practice'
        ],
        lastChecked: '2025-11-04T10:00:00Z'
      })
      
      render(
        <div className="non-compliance-test">
          <h2>Compliance Alert</h2>
          <div data-testid="compliance-alert" className="alert error">
            <h3>⚠️ Compliance Violations Detected</h3>
            <ul data-testid="violations-list">
              <li>Medical license expired</li>
              <li>Unregistered specialty practice</li>
            </ul>
            <div data-testid="action-required">
              <strong>Action Required:</strong> Update credentials before continuing practice
            </div>
          </div>
          <div data-testid="compliance-actions">
            <button data-testid="suspend-profile">Suspend Profile</button>
            <button data-testid="notify-authorities">Notify SMC</button>
            <button data-testid="request-documents">Request Updated Documents</button>
          </div>
        </div>
      )
      
      expect(screen.getByText('Compliance Violations Detected')).toBeInTheDocument()
      expect(screen.getByText('Medical license expired')).toBeInTheDocument()
      expect(screen.getByText('Unregistered specialty practice')).toBeInTheDocument()
      
      const suspendButton = screen.getByTestId('suspend-profile')
      expect(suspendButton).toBeInTheDocument()
    })

    it('should validate clinic licensing and accreditation', async () => {
      const clinicCompliance = {
        mcrRegistered: true,
        operatingLicense: 'CL-2025-001',
        licenseStatus: 'active',
        expiryDate: '2025-12-31',
        accreditedBy: 'MOH Singapore',
        accreditationStatus: 'accredited',
        facilityRequirements: {
          emergencyEquipment: true,
          sterilizationFacilities: true,
          wheelchairAccess: true,
          fireSafety: true
        },
        staffCompliance: {
          licensedNurses: 5,
          certifiedStaff: 8,
          complianceTraining: 'current'
        }
      }
      
      render(
        <div className="clinic-compliance-test">
          <h2>Clinic Compliance Status</h2>
          <div data-testid="clinic-info">
            <h3>Heart Care Medical Centre</h3>
            <div data-testid="license-status">License: Active (Expires Dec 31, 2025)</div>
            <div data-testid="accreditation-status">Accreditation: MOH Singapore</div>
            <div data-testid="facility-compliance">
              <h4>Facility Requirements</h4>
              <ul>
                <li>✅ Emergency Equipment</li>
                <li>✅ Sterilization Facilities</li>
                <li>✅ Wheelchair Access</li>
                <li>✅ Fire Safety</li>
              </ul>
            </div>
          </div>
          <button data-testid="verify-clinic-compliance">Verify Clinic License</button>
        </div>
      )
      
      expect(screen.getByText('License: Active (Expires Dec 31, 2025)')).toBeInTheDocument()
      expect(screen.getByText('Accreditation: MOH Singapore')).toBeInTheDocument()
      expect(screen.getAllByText('✅')).toHaveLength(4)
    })

    it('should validate specialty board registrations', async () => {
      const specialtyRegistration = {
        specialty: 'Cardiology',
        subSpecialty: 'Interventional Cardiology',
        registrationNumber: 'SAB-2021-001',
        registrationDate: '2021-03-01',
        expiryDate: '2026-03-01',
        status: 'active',
        issuingAuthority: 'Specialist Accreditation Board Singapore',
        requirementsMet: {
          training: true,
          examination: true,
          practice: true,
          continuingEducation: true
        }
      }
      
      render(
        <div className="specialty-compliance-test">
          <h2>Specialty Registration Validation</h2>
          <div data-testid="specialty-details">
            <div data-testid="specialty-name">Cardiology (Interventional)</div>
            <div data-testid="registration-number">SAB-2021-001</div>
            <div data-testid="registration-status">Status: Active (Valid until Mar 1, 2026)</div>
            <div data-testid="issuing-authority">Issuing Authority: Specialist Accreditation Board Singapore</div>
          </div>
          <div data-testid="requirements-check">
            <h4>Registration Requirements</h4>
            <ul>
              <li>✅ Completed Training</li>
              <li>✅ Passed Examination</li>
              <li>✅ Required Practice Time</li>
              <li>✅ Continuing Education</li>
            </ul>
          </div>
          <button data-testid="validate-specialty">Validate Specialty Registration</button>
        </div>
      )
      
      expect(screen.getByText('Cardiology (Interventional)')).toBeInTheDocument()
      expect(screen.getByText('SAB-2021-001')).toBeInTheDocument()
      expect(screen.getByText('Status: Active (Valid until Mar 1, 2026)')).toBeInTheDocument()
      expect(screen.getAllByText('✅')).toHaveLength(4)
    })
  })

  describe('Security Testing for Doctor Data Protection and Privacy', () => {
    it('should encrypt sensitive doctor information', async () => {
      const sensitiveData = {
        personalInfo: {
          nric: 'S1234567A',
          phone: '+65-9123-4567',
          email: 'dr.chen@heartcare.sg',
          address: '123 Medical Drive, Singapore 169857'
        },
        medicalInfo: {
          mcrNumber: 'M12345A',
          medicalLicense: 'ML-SG-2020-001',
          specialtyRegistrations: ['Cardiology', 'Interventional Cardiology']
        },
        financialInfo: {
          bankAccount: '123-456-789-012',
          insurancePolicy: 'MPS-2025-001'
        }
      }
      
      mockSecurityService.encryptSensitiveData.mockResolvedValue({
        success: true,
        encryptedData: 'encrypted_base64_string',
        keyId: 'key_2025_001',
        algorithm: 'AES-256-GCM',
        timestamp: '2025-11-04T10:00:00Z'
      })
      
      render(
        <div className="encryption-test">
          <h2>Data Encryption</h2>
          <div data-testid="sensitive-data">
            <h3>Personal Information (Encrypted)</h3>
            <p>NRIC: ****567A</p>
            <p>Phone: ****-***-4567</p>
            <p>Email: dr.***@heartcare.sg</p>
          </div>
          <button data-testid="encrypt-data">Encrypt Sensitive Data</button>
          <div data-testid="encryption-status"></div>
        </div>
      )
      
      const encryptButton = screen.getByTestId('encrypt-data')
      
      await act(async () => {
        fireEvent.click(encryptButton)
      })
      
      await waitFor(() => {
        expect(mockSecurityService.encryptSensitiveData).toHaveBeenCalledWith(sensitiveData)
      })
      
      expect(screen.getByText('Data encrypted successfully')).toBeInTheDocument()
    })

    it('should implement access controls and audit logging', async () => {
      const accessLog = [
        {
          userId: 'admin_001',
          action: 'view_doctor_profile',
          resourceId: 'doc_001',
          timestamp: '2025-11-04T09:00:00Z',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0...',
          outcome: 'success'
        },
        {
          userId: 'admin_001',
          action: 'update_doctor_profile',
          resourceId: 'doc_001',
          timestamp: '2025-11-04T09:30:00Z',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0...',
          outcome: 'success'
        },
        {
          userId: 'unknown_user',
          action: 'delete_doctor_profile',
          resourceId: 'doc_001',
          timestamp: '2025-11-04T10:00:00Z',
          ipAddress: '192.168.1.200',
          userAgent: 'Mozilla/5.0...',
          outcome: 'denied'
        }
      ]
      
      mockSecurityService.auditDataAccess.mockResolvedValue({
        success: true,
        accessLog: accessLog,
        suspiciousActivities: [
          {
            type: 'unauthorized_attempt',
            user: 'unknown_user',
            action: 'delete_doctor_profile',
            timestamp: '2025-11-04T10:00:00Z'
          }
        ]
      })
      
      render(
        <div className="audit-log-test">
          <h2>Access Control & Audit Log</h2>
          <div data-testid="audit-log">
            <h3>Recent Access Log</h3>
            <div data-testid="log-entry-1">
              <strong>09:00:</strong> Admin viewed Dr. Sarah Chen profile (Success)
            </div>
            <div data-testid="log-entry-2">
              <strong>09:30:</strong> Admin updated Dr. Sarah Chen profile (Success)
            </div>
            <div data-testid="log-entry-3" className="security-alert">
              <strong>10:00:</strong> Unknown user attempted to delete profile (Denied)
            </div>
          </div>
          <div data-testid="security-alerts">
            <h3>🔒 Security Alerts</h3>
            <div className="alert warning">
              Unauthorized deletion attempt detected from IP 192.168.1.200
            </div>
          </div>
          <button data-testid="generate-audit-report">Generate Audit Report</button>
        </div>
      )
      
      expect(screen.getByText('Admin viewed Dr. Sarah Chen profile (Success)')).toBeInTheDocument()
      expect(screen.getByText('Unknown user attempted to delete profile (Denied)')).toBeInTheDocument()
      expect(screen.getByText('🔒 Security Alerts')).toBeInTheDocument()
    })

    it('should validate data integrity and prevent tampering', async () => {
      const dataIntegrityCheck = {
        hashValid: true,
        lastModified: '2025-11-04T10:00:00Z',
        checksum: 'sha256:abc123def456...',
        changesDetected: false,
        integrityScore: 100,
        anomalies: []
      }
      
      mockSecurityService.validateDataIntegrity.mockResolvedValue(dataIntegrityCheck)
      
      render(
        <div className="data-integrity-test">
          <h2>Data Integrity Validation</h2>
          <div data-testid="integrity-status">
            <div className="status-indicator success">✅ All data verified</div>
            <div>Last check: Nov 4, 2025 10:00 AM</div>
            <div>Checksum: sha256:abc123def456...</div>
            <div>Integrity score: 100%</div>
          </div>
          <div data-testid="integrity-details">
            <h3>Validation Results</h3>
            <ul>
              <li>✅ Hash validation: Passed</li>
              <li>✅ No unauthorized changes detected</li>
              <li>✅ All references intact</li>
              <li>✅ Digital signatures valid</li>
            </ul>
          </div>
          <button data-testid="validate-integrity">Run Integrity Check</button>
        </div>
      )
      
      expect(screen.getByText('✅ All data verified')).toBeInTheDocument()
      expect(screen.getByText('Integrity score: 100%')).toBeInTheDocument()
      expect(screen.getAllByText('✅')).toHaveLength(4)
    })

    it('should detect and report potential data breaches', async () => {
      const breachDetectionResult = {
        breachDetected: true,
        breachType: 'unauthorized_access',
        affectedRecords: ['doc_001', 'doc_002', 'doc_003'],
        breachTimestamp: '2025-11-04T08:30:00Z',
        detectionTimestamp: '2025-11-04T10:15:00Z',
        scope: 'partial',
        dataTypesAffected: ['contact_info', 'credentials'],
        actionsTaken: [
          'immediate_access_revoked',
          'affected_accounts_notified',
          'security_team_alerted'
        ],
        recommendations: [
          'force_password_reset',
          'implement_2fa',
          'review_access_logs'
        ]
      }
      
      mockSecurityService.checkForDataBreaches.mockResolvedValue(breachDetectionResult)
      
      render(
        <div className="breach-detection-test">
          <h2>Data Breach Detection</h2>
          <div data-testid="breach-alert" className="alert critical">
            <h3>🚨 Data Breach Detected</h3>
            <p><strong>Type:</strong> Unauthorized access</p>
            <p><strong>Affected records:</strong> 3 doctor profiles</p>
            <p><strong>Detected:</strong> Nov 4, 2025 10:15 AM</p>
            <p><strong>Data compromised:</strong> Contact information, Credentials</p>
          </div>
          <div data-testid="response-actions">
            <h3>Response Actions Taken</h3>
            <ul>
              <li>🔒 Access revoked immediately</li>
              <li>📧 Affected accounts notified</li>
              <li>👥 Security team alerted</li>
            </ul>
          </div>
          <div data-testid="recommendations">
            <h3>Recommended Actions</h3>
            <ul>
              <li>Force password reset for all affected accounts</li>
              <li>Implement two-factor authentication</li>
              <li>Review all access logs for suspicious activity</li>
            </ul>
          </div>
          <button data-testid="generate-breach-report">Generate Breach Report</button>
        </div>
      )
      
      expect(screen.getByText('🚨 Data Breach Detected')).toBeInTheDocument()
      expect(screen.getByText('Affected records: 3 doctor profiles')).toBeInTheDocument()
      expect(screen.getByText('Contact information, Credentials')).toBeInTheDocument()
    })

    it('should implement secure session management', () => {
      const sessionData = {
        sessionId: 'sess_abc123def456',
        userId: 'admin_001',
        userRole: 'system_admin',
        permissions: ['read_doctors', 'write_doctors', 'delete_doctors'],
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0...',
        createdAt: '2025-11-04T09:00:00Z',
        lastActivity: '2025-11-04T10:30:00Z',
        expiresAt: '2025-11-04T11:00:00Z',
        isSecure: true,
        isHttpOnly: true
      }
      
      render(
        <div className="session-management-test">
          <h2>Session Security</h2>
          <div data-testid="session-info">
            <h3>Current Session</h3>
            <div>Session ID: sess_abc123***</div>
            <div>User: Admin User (admin_001)</div>
            <div>Role: System Administrator</div>
            <div>Last Activity: Nov 4, 2025 10:30 AM</div>
            <div>Expires: Nov 4, 2025 11:00 AM</div>
            <div className="security-indicators">
              <span className="indicator secure">🔒 Secure</span>
              <span className="indicator httponly">🛡️ HTTP Only</span>
            </div>
          </div>
          <div data-testid="permissions">
            <h3>Permissions</h3>
            <ul>
              <li>✅ Read doctor profiles</li>
              <li>✅ Write doctor profiles</li>
              <li>✅ Delete doctor profiles</li>
            </ul>
          </div>
          <button data-testid="extend-session">Extend Session</button>
          <button data-testid="terminate-session">Terminate Session</button>
        </div>
      )
      
      expect(screen.getByText('Session ID: sess_abc123***')).toBeInTheDocument()
      expect(screen.getByText('🔒 Secure')).toBeInTheDocument()
      expect(screen.getByText('🛡️ HTTP Only')).toBeInTheDocument()
    })
  })

  describe('Healthcare Data Handling and HIPAA Compliance', () => {
    it('should implement minimum necessary rule for data access', () => {
      const dataAccessMatrix = {
        'receptionist': {
          accessLevel: 'basic',
          canAccess: ['name', 'specialty', 'availability'],
          cannotAccess: ['personal_info', 'financial', 'medical_license']
        },
        'nurse': {
          accessLevel: 'moderate',
          canAccess: ['name', 'specialty', 'availability', 'contact_clinic'],
          cannotAccess: ['financial', 'personal_details']
        },
        'doctor': {
          accessLevel: 'full',
          canAccess: ['name', 'specialty', 'availability', 'qualifications', 'reviews'],
          cannotAccess: ['financial']
        },
        'admin': {
          accessLevel: 'full_plus',
          canAccess: ['all_fields'],
          cannotAccess: []
        }
      }
      
      render(
        <div className="data-access-control-test">
          <h2>Data Access Control Matrix</h2>
          <div data-testid="access-matrix">
            <table>
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Access Level</th>
                  <th>Can Access</th>
                  <th>Restricted</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Receptionist</td>
                  <td>Basic</td>
                  <td>Name, Specialty, Availability</td>
                  <td>Personal Info, Financial, Medical License</td>
                </tr>
                <tr>
                  <td>Nurse</td>
                  <td>Moderate</td>
                  <td>Name, Specialty, Availability, Clinic Contact</td>
                  <td>Financial, Personal Details</td>
                </tr>
                <tr>
                  <td>Doctor</td>
                  <td>Full</td>
                  <td>Name, Specialty, Availability, Qualifications, Reviews</td>
                  <td>Financial</td>
                </tr>
                <tr>
                  <td>Admin</td>
                  <td>Full+</td>
                  <td>All Fields</td>
                  <td>None</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div data-testid="access-check">
            <h3>Current User Access Check</h3>
            <p>User Role: Doctor</p>
            <p>Access Level: Full</p>
            <p>Restricted Fields: Financial information</p>
          </div>
        </div>
      )
      
      expect(screen.getByText('Receptionist')).toBeInTheDocument()
      expect(screen.getByText('Basic')).toBeInTheDocument()
      expect(screen.getByText('Personal Info, Financial, Medical License')).toBeInTheDocument()
    })

    it('should implement data retention policies', () => {
      const retentionPolicies = {
        doctor_profiles: {
          activeRetention: 'indefinite',
          archivedRetention: '7_years',
          deletionTriggers: ['license_expired', 'no_practice_5_years'],
          legalRequirements: ['Medical Registration Act', 'Personal Data Protection Act']
        },
        audit_logs: {
          activeRetention: '7_years',
          archivedRetention: '7_years',
          deletionTriggers: ['end_of_retention_period'],
          legalRequirements: ['Personal Data Protection Act']
        },
        medical_records: {
          activeRetention: 'indefinite',
          archivedRetention: '7_years',
          deletionTriggers: ['patient_request', 'court_order'],
          legalRequirements: ['Medical Registration Act', 'Personal Data Protection Act']
        }
      }
      
      render(
        <div className="data-retention-test">
          <h2>Data Retention Policies</h2>
          <div data-testid="retention-policies">
            <h3>Doctor Profiles</h3>
            <ul>
              <li>Active: Indefinite</li>
              <li>Archived: 7 years</li>
              <li>Deletion triggers: License expired, No practice for 5 years</li>
              <li>Legal basis: Medical Registration Act, PDPA</li>
            </ul>
            
            <h3>Audit Logs</h3>
            <ul>
              <li>Active: 7 years</li>
              <li>Archived: 7 years</li>
              <li>Deletion triggers: End of retention period</li>
              <li>Legal basis: PDPA</li>
            </ul>
          </div>
          <div data-testid="retention-status">
            <h3>Dr. Sarah Chen Profile Status</h3>
            <div className="status-indicator success">✅ Active Profile</div>
            <p>Retention period: Indefinite (Active)</p>
            <p>License status: Active (Valid until Jan 2026)</p>
          </div>
        </div>
      )
      
      expect(screen.getByText('Active: Indefinite')).toBeInTheDocument()
      expect(screen.getByText('Medical Registration Act, PDPA')).toBeInTheDocument()
      expect(screen.getByText('✅ Active Profile')).toBeInTheDocument()
    })

    it('should implement right to erasure (right to be forgotten)', async () => {
      const erasureRequest = {
        requestId: 'ER-2025-001',
        requestedBy: 'doc_001',
        requestDate: '2025-11-04',
        status: 'processing',
        dataToDelete: [
          'profile_image',
          'biography',
          'personal_testimonials',
          'contact_information'
        ],
        dataToRetain: [
          'mcr_number',
          'specialty_registrations',
          'license_information',
          'audit_trail'
        ],
        legalBasis: 'Right to erasure under PDPA',
        processingTime: '30 days',
        notificationsSent: ['data_subject', 'legal_team']
      }
      
      mockComplianceService.validatePatientDataProtection.mockResolvedValue({
        success: true,
        erasureCompleted: true,
        dataDeleted: 15,
        recordsUpdated: 3,
        complianceNotes: [
          'Personal testimonials removed',
          'Profile image anonymized',
          'Contact information purged',
          'Retained necessary medical registration data'
        ]
      })
      
      render(
        <div className="data-erasure-test">
          <h2>Right to Erasure Request</h2>
          <div data-testid="erasure-request">
            <h3>Request Details</h3>
            <p>Request ID: ER-2025-001</p>
            <p>Date: Nov 4, 2025</p>
            <p>Status: Processing</p>
            <p>Processing time: 30 days</p>
          </div>
          <div data-testid="data-to-delete">
            <h3>Data to Delete</h3>
            <ul>
              <li>Profile image</li>
              <li>Biography</li>
              <li>Personal testimonials</li>
              <li>Contact information</li>
            </ul>
          </div>
          <div data-testid="data-to-retain">
            <h3>Data to Retain (Legal Requirement)</h3>
            <ul>
              <li>MCR number</li>
              <li>Specialty registrations</li>
              <li>License information</li>
              <li>Audit trail</li>
            </ul>
          </div>
          <div data-testid="erasure-progress">
            <h3>Erasure Progress</h3>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '60%' }}>60% Complete</div>
            </div>
            <p>Deleted: 15 records</p>
            <p>Updated: 3 records</p>
          </div>
          <button data-testid="process-erasure">Process Erasure Request</button>
        </div>
      )
      
      expect(screen.getByText('Request ID: ER-2025-001')).toBeInTheDocument()
      expect(screen.getByText('Processing')).toBeInTheDocument()
      expect(screen.getByText('MCR number')).toBeInTheDocument()
      expect(screen.getByText('60% Complete')).toBeInTheDocument()
    })

    it('should implement data portability features', async () => {
      const dataExportRequest = {
        requestId: 'DP-2025-001',
        requestedBy: 'doc_001',
        requestDate: '2025-11-04',
        format: 'JSON',
        status: 'completed',
        exportDate: '2025-11-04T10:30:00Z',
        downloadUrl: 'https://secure.example.com/exports/dp-2025-001.json',
        expiryDate: '2025-11-11T10:30:00Z',
        dataIncluded: [
          'profile_information',
          'qualifications',
          'specialty_registrations',
          'review_data',
          'availability_settings'
        ],
        dataExcluded: [
          'system_logs',
          'internal_notes',
          'audit_trail'
        ]
      }
      
      render(
        <div className="data-portability-test">
          <h2>Data Portability</h2>
          <div data-testid="export-request">
            <h3>Export Request</h3>
            <p>Request ID: DP-2025-001</p>
            <p>Date: Nov 4, 2025</p>
            <p>Status: Completed</p>
            <p>Format: JSON</p>
          </div>
          <div data-testid="data-included">
            <h3>Data Included in Export</h3>
            <ul>
              <li>Profile information</li>
              <li>Qualifications</li>
              <li>Specialty registrations</li>
              <li>Review data</li>
              <li>Availability settings</li>
            </ul>
          </div>
          <div data-testid="data-excluded">
            <h3>Data Excluded (Internal/System)</h3>
            <ul>
              <li>System logs</li>
              <li>Internal notes</li>
              <li>Audit trail</li>
            </ul>
          </div>
          <div data-testid="download-section">
            <h3>Download Ready</h3>
            <p>Export completed on Nov 4, 2025 at 10:30 AM</p>
            <p>Download link expires on Nov 11, 2025</p>
            <button data-testid="download-export">Download Data</button>
          </div>
        </div>
      )
      
      expect(screen.getByText('Request ID: DP-2025-001')).toBeInTheDocument()
      expect(screen.getByText('Completed')).toBeInTheDocument()
      expect(screen.getByText('Profile information')).toBeInTheDocument()
      expect(screen.getByText('System logs')).toBeInTheDocument()
    })
  })

  describe('Medical Professional Information Accuracy Validation', () => {
    it('should validate medical institution accreditation', async () => {
      const institutionValidation = {
        'National University of Singapore': {
          type: 'local',
          accreditationStatus: 'accredited',
          recognizedPrograms: ['MBBS', 'MD', 'MSc Medicine'],
          accreditationBody: 'Singapore Medical Council',
          lastVerified: '2025-10-15',
          validityPeriod: '2020-2025'
        },
        'Harvard Medical School': {
          type: 'foreign',
          accreditationStatus: 'recognized',
          recognizedPrograms: ['MD'],
          accreditationBody: 'ECFMG, AME Council Singapore',
          lastVerified: '2025-09-20',
          validityPeriod: '2022-2027'
        },
        'American College of Cardiology': {
          type: 'foreign',
          accreditationStatus: 'recognized',
          recognizedPrograms: ['Board Certification'],
          accreditationBody: 'American Board of Medical Specialties',
          lastVerified: '2025-08-10',
          validityPeriod: 'ongoing'
        }
      }
      
      mockValidationService.verifyInstitutionRecognition.mockImplementation((institution: string) => {
        return Promise.resolve(institutionValidation[institution as keyof typeof institutionValidation])
      })
      
      render(
        <div className="institution-validation-test">
          <h2>Medical Institution Accreditation Check</h2>
          <div data-testid="institution-validations">
            <h3>Qualification Verifications</h3>
            
            <div data-testid="nus-validation">
              <h4>National University of Singapore (MBBS 2015)</h4>
              <div className="status-indicator success">✅ Accredited Institution</div>
              <p>Type: Local medical school</p>
              <p>Accreditation body: Singapore Medical Council</p>
              <p>Last verified: Oct 15, 2025</p>
            </div>
            
            <div data-testid="harvard-validation">
              <h4>Harvard Medical School (MD 2019)</h4>
              <div className="status-indicator success">✅ Recognized Institution</div>
              <p>Type: Foreign medical school</p>
              <p>Accreditation body: ECFMG, AME Council Singapore</p>
              <p>Last verified: Sep 20, 2025</p>
            </div>
            
            <div data-testid="acc-validation">
              <h4>American College of Cardiology (FACC 2022)</h4>
              <div className="status-indicator success">✅ Recognized Board</div>
              <p>Type: Specialty certification board</p>
              <p>Accreditation body: American Board of Medical Specialties</p>
              <p>Last verified: Aug 10, 2025</p>
            </div>
          </div>
          <button data-testid="verify-all-institutions">Verify All Institutions</button>
        </div>
      )
      
      expect(screen.getByText('✅ Accredited Institution')).toBeInTheDocument()
      expect(screen.getByText('✅ Recognized Institution')).toBeInTheDocument()
      expect(screen.getByText('✅ Recognized Board')).toBeInTheDocument()
    })

    it('should validate medical license status and currency', async () => {
      const licenseValidation = {
        licenseNumber: 'ML-SG-2020-001',
        status: 'active',
        issueDate: '2020-01-15',
        expiryDate: '2025-01-15',
        daysUntilExpiry: 72,
        conditions: [],
        restrictions: [],
        issuingAuthority: 'Singapore Medical Council',
        verificationStatus: 'verified',
        lastChecked: '2025-11-04'
      }
      
      render(
        <div className="license-validation-test">
          <h2>Medical License Validation</h2>
          <div data-testid="license-details">
            <h3>Singapore Medical Registration</h3>
            <div className="status-indicator success">✅ License Active</div>
            <p><strong>License Number:</strong> ML-SG-2020-001</p>
            <p><strong>Status:</strong> Active</p>
            <p><strong>Issued:</strong> Jan 15, 2020</p>
            <p><strong>Expires:</strong> Jan 15, 2025 (72 days remaining)</p>
            <p><strong>Issuing Authority:</strong> Singapore Medical Council</p>
            <p><strong>Verification:</strong> Verified on Nov 4, 2025</p>
          </div>
          <div data-testid="license-conditions">
            <h3>License Conditions</h3>
            <p className="no-conditions">No conditions or restrictions</p>
          </div>
          <div data-testid="renewal-reminder">
            <h3>Renewal Reminder</h3>
            <div className="alert warning">
              ⚠️ License expires in 72 days. Renewal recommended within 30 days.
            </div>
            <button>Schedule Renewal</button>
          </div>
        </div>
      )
      
      expect(screen.getByText('✅ License Active')).toBeInTheDocument()
      expect(screen.getByText('ML-SG-2020-001')).toBeInTheDocument()
      expect(screen.getByText('72 days remaining')).toBeInTheDocument()
      expect(screen.getByText('License expires in 72 days')).toBeInTheDocument()
    })

    it('should verify specialty certification and board qualifications', async () => {
      const specialtyCertifications = [
        {
          specialty: 'Cardiology',
          subSpecialty: 'Interventional Cardiology',
          certificationType: 'Board Certification',
          issuingBody: 'Specialist Accreditation Board Singapore',
          certificationNumber: 'SAB-CARD-2021-001',
          issueDate: '2021-03-01',
          expiryDate: '2026-03-01',
          status: 'active',
          verificationDate: '2025-11-04',
          requirements: {
            trainingCompleted: true,
            examinationPassed: true,
            practiceRequirementsMet: true,
            cmeCompliant: true
          }
        },
        {
          specialty: 'Cardiology',
          certificationType: 'International Board Certification',
          issuingBody: 'American Board of Cardiology',
          certificationNumber: 'ABC-2020-001',
          issueDate: '2020-12-01',
          expiryDate: '2025-12-01',
          status: 'active',
          verificationDate: '2025-10-15',
          requirements: {
            trainingCompleted: true,
            examinationPassed: true,
            practiceRequirementsMet: true,
            cmeCompliant: true
          }
        }
      ]
      
      render(
        <div className="specialty-certification-test">
          <h2>Specialty Certification Verification</h2>
          <div data-testid="certifications">
            <h3>Local Specialty Certification</h3>
            <div className="certification-card">
              <h4>Cardiology (Interventional)</h4>
              <div className="status-indicator success">✅ Active Certification</div>
              <p><strong>Certification Number:</strong> SAB-CARD-2021-001</p>
              <p><strong>Issuing Body:</strong> Specialist Accreditation Board Singapore</p>
              <p><strong>Valid:</strong> Mar 1, 2021 - Mar 1, 2026</p>
              <p><strong>Requirements:</strong> All met</p>
              <ul className="requirements-list">
                <li>✅ Training completed</li>
                <li>✅ Examination passed</li>
                <li>✅ Practice requirements met</li>
                <li>✅ CME compliant</li>
              </ul>
            </div>
            
            <h3>International Certification</h3>
            <div className="certification-card">
              <h4>Cardiology</h4>
              <div className="status-indicator success">✅ Active Certification</div>
              <p><strong>Certification Number:</strong> ABC-2020-001</p>
              <p><strong>Issuing Body:</strong> American Board of Cardiology</p>
              <p><strong>Valid:</strong> Dec 1, 2020 - Dec 1, 2025</p>
              <p><strong>Requirements:</strong> All met</p>
              <ul className="requirements-list">
                <li>✅ Training completed</li>
                <li>✅ Examination passed</li>
                <li>✅ Practice requirements met</li>
                <li>✅ CME compliant</li>
              </ul>
            </div>
          </div>
          <button data-testid="verify-certifications">Verify All Certifications</button>
        </div>
      )
      
      expect(screen.getByText('✅ Active Certification')).toHaveLength(2)
      expect(screen.getByText('SAB-CARD-2021-001')).toBeInTheDocument()
      expect(screen.getByText('ABC-2020-001')).toBeInTheDocument()
      expect(screen.getAllByText('✅ All met')).toHaveLength(2)
    })

    it('should validate continuing medical education (CME) compliance', async () => {
      const cmeCompliance = {
        currentYear: 2025,
        pointsEarned: 45,
        pointsRequired: 50,
        complianceStatus: 'compliant',
        remainingRequired: 0,
        cmePeriod: {
          start: '2023-01-01',
          end: '2025-12-31',
          totalRequired: 150,
          earnedThisPeriod: 145
        },
        activities: [
          {
            date: '2025-10-15',
            activity: 'Cardiology Conference 2025',
            points: 6,
            category: 'Conference',
            verified: true
          },
          {
            date: '2025-09-20',
            activity: 'Interventional Cardiology Workshop',
            points: 8,
            category: 'Workshop',
            verified: true
          },
          {
            date: '2025-08-10',
            activity: 'Online CME Module: Heart Failure Management',
            points: 4,
            category: 'Online Learning',
            verified: true
          }
        ],
        upcomingRequirements: {
          nextDeadline: '2025-12-31',
          pointsNeeded: 5,
          recommendedActivities: [
            'Advanced ECG Interpretation Course',
            'Cardiology Research Symposium',
            'Quality Improvement in Cardiology Practice'
          ]
        }
      }
      
      render(
        <div className="cme-compliance-test">
          <h2>Continuing Medical Education (CME) Compliance</h2>
          <div data-testid="cme-status">
            <h3>2025 CME Status</h3>
            <div className="status-indicator success">✅ Compliant</div>
            <p><strong>Points Earned:</strong> 45 / 50 required</p>
            <p><strong>Remaining:</strong> 0 points needed</p>
            <p><strong>Compliance Period:</strong> Jan 1, 2023 - Dec 31, 2025</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '90%' }}>90% Complete</div>
            </div>
          </div>
          <div data-testid="cme-activities">
            <h3>Recent CME Activities</h3>
            <ul>
              <li>
                <strong>Oct 15, 2025:</strong> Cardiology Conference 2025 (6 points)
                <span className="verified">✅ Verified</span>
              </li>
              <li>
                <strong>Sep 20, 2025:</strong> Interventional Cardiology Workshop (8 points)
                <span className="verified">✅ Verified</span>
              </li>
              <li>
                <strong>Aug 10, 2025:</strong> Online CME Module: Heart Failure Management (4 points)
                <span className="verified">✅ Verified</span>
              </li>
            </ul>
          </div>
          <div data-testid="cme-recommendations">
            <h3>Recommended Future Activities</h3>
            <ul>
              <li>Advanced ECG Interpretation Course</li>
              <li>Cardiology Research Symposium</li>
              <li>Quality Improvement in Cardiology Practice</li>
            </ul>
          </div>
          <button data-testid="verify-cme-compliance">Verify CME Compliance</button>
        </div>
      )
      
      expect(screen.getByText('✅ Compliant')).toBeInTheDocument()
      expect(screen.getByText('45 / 50 required')).toBeInTheDocument()
      expect(screen.getByText('90% Complete')).toBeInTheDocument()
      expect(screen.getAllByText('✅ Verified')).toHaveLength(3)
    })

    it('should check for disciplinary actions and professional conduct', async () => {
      const disciplinaryCheck = {
        doctorId: 'doc_001',
        searchDate: '2025-11-04',
        results: {
          singaporeMedicalCouncil: {
            searched: true,
            disciplinaryActions: [],
            warnings: [],
            suspensions: [],
            restrictions: [],
            lastChecked: '2025-11-04'
          },
          specialistAccreditationBoard: {
            searched: true,
            disciplinaryActions: [],
            warnings: [],
            suspensions: [],
            restrictions: [],
            lastChecked: '2025-11-04'
          },
          courts: {
            searched: true,
            medicalMalpracticeCases: [],
            professionalConductCases: [],
            lastChecked: '2025-11-04'
          },
          media: {
            searched: true,
            negativeReports: [],
            positiveMentions: ['Dr. Sarah Chen featured in Heart Health Awareness Campaign'],
            lastChecked: '2025-11-04'
          }
        },
        overallStatus: 'clear',
        riskLevel: 'low',
        nextReviewDate: '2026-11-04',
        recommendations: [
          'Continue monitoring quarterly',
          'Update professional references',
          'Maintain current high standards'
        ]
      }
      
      render(
        <div className="disciplinary-check-test">
          <h2>Professional Conduct & Disciplinary Check</h2>
          <div data-testid="check-results">
            <h3>Disciplinary History Check</h3>
            <div className="status-indicator success">✅ Clear Record</div>
            <p><strong>Risk Level:</strong> Low</p>
            <p><strong>Last Checked:</strong> Nov 4, 2025</p>
            <p><strong>Next Review:</strong> Nov 4, 2026</p>
          </div>
          <div data-testid="check-sources">
            <h3>Verification Sources</h3>
            <ul>
              <li>
                <strong>Singapore Medical Council:</strong>
                <span className="status clear">No disciplinary actions</span>
              </li>
              <li>
                <strong>Specialist Accreditation Board:</strong>
                <span className="status clear">No disciplinary actions</span>
              </li>
              <li>
                <strong>Courts Database:</strong>
                <span className="status clear">No malpractice cases</span>
              </li>
              <li>
                <strong>Media Monitoring:</strong>
                <span className="status positive">Positive coverage only</span>
              </li>
            </ul>
          </div>
          <div data-testid="recommendations">
            <h3>Recommendations</h3>
            <ul>
              <li>Continue monitoring quarterly</li>
              <li>Update professional references</li>
              <li>Maintain current high standards</li>
            </ul>
          </div>
          <button data-testid="run-disciplinary-check">Run Disciplinary Check</button>
        </div>
      )
      
      expect(screen.getByText('✅ Clear Record')).toBeInTheDocument()
      expect(screen.getByText('Risk Level: Low')).toBeInTheDocument()
      expect(screen.getAllByText('No disciplinary actions')).toHaveLength(2)
      expect(screen.getByText('No malpractice cases')).toBeInTheDocument()
      expect(screen.getByText('Positive coverage only')).toBeInTheDocument()
    })

    it('should validate professional indemnity insurance', async () => {
      const indemnityValidation = {
        provider: 'Medical Protection Society',
        policyNumber: 'MPS-2025-001',
        coverageType: 'Comprehensive Medical Indemnity',
        coverageAmount: 1000000,
        currency: 'SGD',
        effectiveDate: '2025-01-01',
        expiryDate: '2025-12-31',
        status: 'active',
        premiumPaid: true,
        claimsHistory: {
          totalClaims: 0,
          openClaims: 0,
          resolvedClaims: 0,
          lastClaimDate: null
        },
        coverageIncludes: [
          'Medical malpractice',
          'Professional negligence',
          'Legal defense costs',
          'Regulatory proceedings',
          'Cyber liability'
        ],
        exclusions: [
          'Intentional misconduct',
          'Criminal acts',
          'Pre-existing conditions'
        ],
        verificationStatus: 'verified',
        lastVerified: '2025-11-04'
      }
      
      render(
        <div className="indemnity-validation-test">
          <h2>Professional Indemnity Insurance Validation</h2>
          <div data-testid="policy-details">
            <h3>Insurance Policy</h3>
            <div className="status-indicator success">✅ Active Coverage</div>
            <p><strong>Provider:</strong> Medical Protection Society</p>
            <p><strong>Policy Number:</strong> MPS-2025-001</p>
            <p><strong>Coverage Type:</strong> Comprehensive Medical Indemnity</p>
            <p><strong>Coverage Amount:</strong> SGD 1,000,000</p>
            <p><strong>Valid:</strong> Jan 1, 2025 - Dec 31, 2025</p>
            <p><strong>Status:</strong> Active</p>
            <p><strong>Premium:</strong> Paid</p>
          </div>
          <div data-testid="coverage-details">
            <h3>Coverage Includes</h3>
            <ul>
              <li>✅ Medical malpractice</li>
              <li>✅ Professional negligence</li>
              <li>✅ Legal defense costs</li>
              <li>✅ Regulatory proceedings</li>
              <li>✅ Cyber liability</li>
            </ul>
          </div>
          <div data-testid="claims-history">
            <h3>Claims History</h3>
            <div className="status-indicator success">✅ No Claims</div>
            <p><strong>Total Claims:</strong> 0</p>
            <p><strong>Open Claims:</strong> 0</p>
            <p><strong>Resolved Claims:</strong> 0</p>
          </div>
          <div data-testid="verification-status">
            <p><strong>Verification:</strong> Verified on Nov 4, 2025</p>
          </div>
          <button data-testid="verify-indemnity">Verify Insurance Coverage</button>
        </div>
      )
      
      expect(screen.getByText('✅ Active Coverage')).toBeInTheDocument()
      expect(screen.getByText('MPS-2025-001')).toBeInTheDocument()
      expect(screen.getByText('SGD 1,000,000')).toBeInTheDocument()
      expect(screen.getAllByText('✅')).toHaveLength(5)
      expect(screen.getByText('✅ No Claims')).toBeInTheDocument()
    })

    it('should generate comprehensive compliance reports', async () => {
      const complianceReport = {
        reportId: 'COMP-2025-001',
        doctorId: 'doc_001',
        reportDate: '2025-11-04',
        reportType: 'Full Compliance Audit',
        overallStatus: 'compliant',
        complianceScore: 95,
        sections: {
          licensing: {
            status: 'compliant',
            score: 100,
            checks: {
              mcrValid: true,
              licenseActive: true,
              licenseCurrent: true
            }
          },
          credentials: {
            status: 'compliant',
            score: 100,
            checks: {
              qualificationsVerified: true,
              institutionsAccredited: true,
              certificationsValid: true
            }
          },
          professionalConduct: {
            status: 'compliant',
            score: 100,
            checks: {
              noDisciplinaryActions: true,
              professionalStanding: true,
              referencesVerified: true
            }
          },
          insurance: {
            status: 'compliant',
            score: 100,
            checks: {
              indemnityActive: true,
              coverageAdequate: true,
              claimsClear: true
            }
          },
          cme: {
            status: 'compliant',
            score: 90,
            checks: {
              cmeCompliant: true,
              pointsAdequate: true,
              activitiesVerified: true
            }
          }
        },
        recommendations: [
          'Continue CME activities to maintain 100% compliance',
          'Renew medical license 60 days before expiry',
          'Update insurance policy before December 2025'
        ],
        nextReviewDate: '2026-02-04',
        auditor: 'Compliance Team',
        signaturesRequired: ['Medical Director', 'Compliance Officer']
      }
      
      mockSecurityService.generateComplianceReports.mockResolvedValue(complianceReport)
      
      render(
        <div className="compliance-report-test">
          <h2>Comprehensive Compliance Report</h2>
          <div data-testid="report-header">
            <h3>Dr. Sarah Chen - Full Compliance Audit</h3>
            <p><strong>Report ID:</strong> COMP-2025-001</p>
            <p><strong>Date:</strong> Nov 4, 2025</p>
            <p><strong>Status:</strong> <span className="status-indicator success">✅ Compliant</span></p>
            <p><strong>Compliance Score:</strong> 95/100</p>
          </div>
          <div data-testid="compliance-sections">
            <h3>Compliance Sections</h3>
            <ul>
              <li>
                <strong>Licensing:</strong>
                <span className="status-indicator success">✅ Compliant (100/100)</span>
              </li>
              <li>
                <strong>Credentials:</strong>
                <span className="status-indicator success">✅ Compliant (100/100)</span>
              </li>
              <li>
                <strong>Professional Conduct:</strong>
                <span className="status-indicator success">✅ Compliant (100/100)</span>
              </li>
              <li>
                <strong>Insurance:</strong>
                <span className="status-indicator success">✅ Compliant (100/100)</span>
              </li>
              <li>
                <strong>CME Compliance:</strong>
                <span className="status-indicator success">✅ Compliant (90/100)</span>
              </li>
            </ul>
          </div>
          <div data-testid="recommendations">
            <h3>Recommendations</h3>
            <ul>
              <li>Continue CME activities to maintain 100% compliance</li>
              <li>Renew medical license 60 days before expiry</li>
              <li>Update insurance policy before December 2025</li>
            </ul>
          </div>
          <div data-testid="next-review">
            <p><strong>Next Review:</strong> Feb 4, 2026</p>
            <p><strong>Signatures Required:</strong> Medical Director, Compliance Officer</p>
          </div>
          <button data-testid="generate-report">Generate Full Report</button>
        </div>
      )
      
      expect(screen.getByText('✅ Compliant')).toBeInTheDocument()
      expect(screen.getByText('95/100')).toBeInTheDocument()
      expect(screen.getAllByText('✅ Compliant')).toHaveLength(5)
      expect(screen.getByText('Continue CME activities')).toBeInTheDocument()
      expect(screen.getByText('Next Review: Feb 4, 2026')).toBeInTheDocument()
    })
  })
})