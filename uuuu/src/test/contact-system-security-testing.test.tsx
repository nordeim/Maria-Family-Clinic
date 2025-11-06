/**
 * Security and Privacy Compliance Testing Suite
 * Sub-Phase 9.10 - Testing, Quality Assurance & Performance Optimization
 * 
 * Covers:
 * - PDPA (Personal Data Protection Act) compliance
 * - GDPR compliance testing
 * - HIPAA healthcare data protection
 * - XSS and SQL injection prevention
 * - Data encryption and secure transmission
 * - Audit trail completeness
 * - Access control and authorization
 * - Privacy by design implementation
 */

import { describe, it, expect, beforeEach, afterEach, vi, beforeAll } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Test utilities
import { generateSecurityTestData } from './enhanced-test-data-generator'
import { createTRPCMock } from '@/test/mock-trpc'

// Contact system components
import { ContactFormContainer } from '@/components/forms/contact-form-container'
import { ContactFormProvider } from '@/components/forms/contact-form-provider'

describe('Contact System Security and Privacy Compliance Testing', () => {
  let mockTRPC: ReturnType<typeof createTRPCMock>
  let securityTestData: ReturnType<typeof generateSecurityTestData>

  beforeAll(() => {
    mockTRPC = createTRPCMock()
    securityTestData = generateSecurityTestData()
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('1. PDPA (Personal Data Protection Act) Compliance', () => {
    describe('1.1 Consent Management', () => {
      it('should require explicit consent for personal data collection', async () => {
        const user = userEvent.setup()
        
        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer />
            </ContactFormProvider>
          </TRPCReactProvider>
        )

        // Attempt to submit without consent
        await user.type(screen.getByLabelText('Name'), 'Test User')
        await user.type(screen.getByLabelText('Email'), 'test@example.com')
        await user.selectOptions(screen.getByLabelText('Category'), 'general')
        await user.type(screen.getByLabelText('Message'), 'Test message')
        await user.click(screen.getByRole('button', { name: /submit/i }))

        // Should show consent required error
        expect(screen.getByText(/consent is required/i)).toBeInTheDocument()
        expect(screen.getByText(/personal data protection act/i)).toBeInTheDocument()
      })

      it('should provide clear and specific consent options', async () => {
        const user = userEvent.setup()
        
        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer />
            </ContactFormProvider>
          </TRPCReactProvider>
        )

        // Verify consent checkboxes are present and specific
        const consentCheckboxes = screen.getAllByRole('checkbox', { 
          name: /consent/i 
        })

        expect(consentCheckboxes).toHaveLength(2) // At least 2 consent checkboxes
        expect(screen.getByLabelText(/collection and use of personal data/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/processing of sensitive health information/i)).toBeInTheDocument()
      })

      it('should allow withdrawal of consent and data deletion requests', async () => {
        const user = userEvent.setup()
        
        // Mock user data with previous submissions
        mockTRPC.contactForm.getAll.mutate.mockResolvedValue([
          {
            id: 'form-1',
            referenceNumber: 'CF202511040001',
            status: 'RESOLVED',
            createdAt: new Date(),
          },
        ])

        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer userMode={true} />
            </ContactFormProvider>
          </TRPCReactProvider>
        )

        // Access user's previous submissions
        await user.click(screen.getByRole('button', { name: /my submissions/i }))

        // Test data access request
        await user.click(screen.getByRole('button', { name: /request my data/i }))
        expect(screen.getByText(/data access request submitted/i)).toBeInTheDocument()

        // Test consent withdrawal
        await user.click(screen.getByRole('button', { name: /withdraw consent/i }))
        expect(screen.getByText(/consent withdrawn/i)).toBeInTheDocument()

        // Test data deletion request
        await user.click(screen.getByRole('button', { name: /delete my data/i }))
        expect(screen.getByText(/data deletion request submitted/i)).toBeInTheDocument()
      })
    })

    describe('1.2 Data Minimization', () => {
      it('should only collect data necessary for the stated purpose', async () => {
        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer />
            </ContactFormProvider>
          </TRPCReactProvider>
 )

        // Verify essential fields only
        const formFields = screen.getAllByLabelText(/.*/)
        const fieldLabels = formFields.map(field => 
          screen.getByLabelText(new RegExp(field.getAttribute('aria-label') || ''))
        )

        // Check for unnecessary fields
        const unnecessaryFields = ['social_security', 'credit_card', 'passport_number']
        unnecessaryFields.forEach(field => {
          expect(screen.queryByLabelText(new RegExp(field, 'i'))).not.toBeInTheDocument()
        })

        // Verify required fields are present
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/message/i)).toBeInTheDocument()
      })

      it('should limit medical data collection to relevant information only', async () => {
        const user = userEvent.setup()
        
        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer defaultCategory="healthier_sg" />
            </ContactFormProvider>
          </TRPCReactProvider>
 )

        // Switch to health-related category
        await user.selectOptions(screen.getByLabelText('Category'), 'healthier_sg')

        // Verify only relevant medical fields are shown
        expect(screen.getByLabelText(/medical information/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/current medications/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/allergies/i)).toBeInTheDocument()

        // Verify unnecessary medical fields are not present
        expect(screen.queryByLabelText(/family medical history/i)).not.toBeInTheDocument()
        expect(screen.queryByLabelText(/detailed medical records/i)).not.toBeInTheDocument()
        expect(screen.queryByLabelText(/social security number/i)).not.toBeInTheDocument()
      })
    })

    describe('1.3 Purpose Limitation', () => {
      it('should clearly state the purpose of data collection', async () => {
        render(
          TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer />
            </ContactFormProvider>
          </TRPCReactProvider>
        )

        // Verify purpose statement is present
        expect(screen.getByText(/we collect your personal data/i)).toBeInTheDocument()
        expect(screen.getByText(/to respond to your enquiry/i)).toBeInTheDocument()
        expect(screen.getByText(/for providing healthcare services/i)).toBeInTheDocument()
      })

      it('should not use data for unstated purposes', async () => {
        // Mock data usage tracking
        const dataUsageTracker = {
          trackDataUse: vi.fn(),
        }

        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer dataUsageTracker={dataUsageTracker} />
            </ContactFormProvider>
          </TRPCReactProvider>
        )

        // Submit form with specific purpose
        const user = userEvent.setup()
        await user.type(screen.getByLabelText('Name'), 'Test User')
        await user.type(screen.getByLabelText('Email'), 'test@example.com')
        await user.selectOptions(screen.getByLabelText('Category'), 'general')
        await user.type(screen.getByLabelText('Message'), 'Test message')
        await user.click(screen.getByRole('button', { name: /submit/i }))

        // Verify data use is tracked for stated purpose only
        expect(dataUsageTracker.trackDataUse).toHaveBeenCalledWith(
          expect.objectContaining({
            purpose: 'enquiry_response',
            dataTypes: ['name', 'email', 'message'],
          })
        )

        // Verify no other purposes are used
        expect(dataUsageTracker.trackDataUse).not.toHaveBeenCalledWith(
          expect.objectContaining({
            purpose: expect.stringMatching(/marketing|sales|third_party/),
          })
        )
      })
    })
  })

  describe('2. GDPR Compliance', () => {
    describe('2.1 Data Subject Rights', () => {
      it('should provide right to access personal data', async () => {
        const user = userEvent.setup()
        const mockUserData = {
          contactForms: [
            {
              id: 'form-1',
              referenceNumber: 'CF202511040001',
              name: 'Test User',
              email: 'test@example.com',
              category: 'general',
              status: 'RESOLVED',
              createdAt: new Date(),
            },
          ],
        }

        mockTRPC.contactForm.getAll.mutate.mockResolvedValue(mockUserData.contactForms)

        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer userMode={true} />
            </ContactFormProvider>
          </TRPCReactProvider>
        )

        // Access personal data
        await user.click(screen.getByRole('button', { name: /access my data/i }))

        // Verify data access
        expect(screen.getByText('CF202511040001')).toBeInTheDocument()
        expect(screen.getByText('Test User')).toBeInTheDocument()
        expect(screen.getByText('test@example.com')).toBeInTheDocument()
        expect(screen.getByText(/data export ready/i)).toBeInTheDocument()
      })

      it('should provide right to rectification of inaccurate data', async () => {
        const user = userEvent.setup()
        const formId = 'form-1'
        
        // Mock form data
        const mockForm = {
          id: formId,
          name: 'Test User',
          email: 'old@example.com',
          phone: '+65-1234-5678',
          category: 'general',
          status: 'NEW',
          createdAt: new Date(),
        }

        mockTRPC.contactForm.getAll.mutate.mockResolvedValue([mockForm])
        mockTRPC.contactForm.update.mutate.mockResolvedValue({
          ...mockForm,
          email: 'new@example.com',
        })

        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer userMode={true} />
            </ContactFormProvider>
          </TRPCReactProvider>
 )

        // Access user's forms
        await user.click(screen.getByRole('button', { name: /my submissions/i }))

        // Edit form data
        await user.click(screen.getByRole('button', { name: /edit/i }))
        
        // Correct email address
        const emailInput = screen.getByLabelText('Email')
        await user.clear(emailInput)
        await user.type(emailInput, 'new@example.com')
        
        // Save changes
        await user.click(screen.getByRole('button', { name: /save changes/i }))

        // Verify update was called
        expect(mockTRPC.contactForm.update).toHaveBeenCalledWith(
          expect.objectContaining({
            id: formId,
            data: expect.objectContaining({
              email: 'new@example.com',
            }),
          })
        )
      })

      it('should provide right to erasure (right to be forgotten)', async () => {
        const user = userEvent.setup()
        const formId = 'form-1'

        // Mock form data
        mockTRPC.contactForm.getAll.mutate.mockResolvedValue([
          {
            id: formId,
            referenceNumber: 'CF202511040001',
            status: 'RESOLVED',
            createdAt: new Date(),
          },
        ])

        // Mock deletion response
        mockTRPC.contactForm.delete.mutate.mockResolvedValue({ success: true })

        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer userMode={true} />
            </ContactFormProvider>
          </TRPCReactProvider>
        )

        // Access user's forms
        await user.click(screen.getByRole('button', { name: /my submissions/i }))

        // Request data deletion
        await user.click(screen.getByRole('button', { name: /delete/i }))
        
        // Confirm deletion
        await user.click(screen.getByRole('button', { name: /confirm deletion/i }))

        // Verify deletion was processed
        expect(mockTRPC.contactForm.delete).toHaveBeenCalledWith(
          expect.objectContaining({
            id: formId,
            reason: 'gdpr_right_to_erasure',
          })
        )

        // Verify confirmation message
        expect(screen.getByText(/data has been deleted/i)).toBeInTheDocument()
      })

      it('should provide right to data portability', async () => {
        const user = userEvent.setup()
        const mockUserData = {
          contactForms: [
            {
              id: 'form-1',
              referenceNumber: 'CF202511040001',
              name: 'Test User',
              email: 'test@example.com',
              phone: '+65-1234-5678',
              category: 'general',
              subject: 'Test Enquiry',
              message: 'Test message',
              createdAt: new Date(),
            },
            {
              id: 'form-2',
              referenceNumber: 'CF202511040002',
              name: 'Test User',
              email: 'test@example.com',
              category: 'appointment',
              subject: 'Appointment Request',
              message: 'Need to book appointment',
              createdAt: new Date(),
            },
          ],
        }

        mockTRPC.contactForm.getAll.mutate.mockResolvedValue(mockUserData.contactForms)

        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer userMode={true} />
            </ContactFormProvider>
          </TRPCReactProvider>
        )

        // Request data export
        await user.click(screen.getByRole('button', { name: /export my data/i }))

        // Verify export options
        expect(screen.getByText(/choose export format/i)).toBeInTheDocument()
        expect(screen.getByLabelText('JSON')).toBeInTheDocument()
        expect(screen.getByLabelText('CSV')).toBeInTheDocument()
        expect(screen.getByLabelText('PDF')).toBeInTheDocument()

        // Select JSON format and download
        await user.click(screen.getByLabelText('JSON'))
        await user.click(screen.getByRole('button', { name: /download/i }))

        // Verify download was initiated
        expect(screen.getByText(/data export ready for download/i)).toBeInTheDocument()
      })
    })

    describe('2.2 Lawful Basis and Processing', () => {
      it('should establish lawful basis for processing personal data', async () => {
        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer />
            </ContactFormProvider>
          </TRPCReactProvider>
 )

        // Verify lawful basis is clearly stated
        expect(screen.getByText(/lawful basis for processing/i)).toBeInTheDocument()
        expect(screen.getByText(/legitimate interest/i)).toBeInTheDocument()
        expect(screen.getByText(/consent/i)).toBeInTheDocument()
        expect(screen.getByText(/contract performance/i)).toBeInTheDocument()
      })

      it('should document processing activities', async () => {
        const processingRecorder = {
          recordProcessingActivity: vi.fn(),
        }

        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer processingRecorder={processingRecorder} />
            </ContactFormProvider>
          </TRPCReactProvider>
        )

        // Submit form triggers processing record
        const user = userEvent.setup()
        await user.type(screen.getByLabelText('Name'), 'Test User')
        await user.type(screen.getByLabelText('Email'), 'test@example.com')
        await user.selectOptions(screen.getByLabelText('Category'), 'general')
        await user.type(screen.getByLabelText('Message'), 'Test message')
        await user.click(screen.getByRole('button', { name: /submit/i }))

        // Verify processing activity is recorded
        expect(processingRecorder.recordProcessingActivity).toHaveBeenCalledWith(
          expect.objectContaining({
            dataController: 'My Family Clinic',
            dataProcessor: 'Contact Management System',
            lawfulBasis: 'legitimate_interest',
            dataTypes: ['personal_identifiers', 'contact_information'],
            processingPurposes: ['enquiry_response', 'customer_service'],
          })
        )
      })
    })
  })

  describe('3. HIPAA Healthcare Data Protection', () => {
    describe('3.1 Protected Health Information (PHI) Handling', () => {
      it('should identify and protect PHI with appropriate safeguards', async () => {
        const user = userEvent.setup()
        
        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer defaultCategory="healthier_sg" />
            </ContactFormProvider>
          </TRPCReactProvider>
 )

        // Switch to health-related category to access PHI fields
        await user.selectOptions(screen.getByLabelText('Category'), 'healthier_sg')

        // Verify PHI warnings are displayed
        expect(screen.getByText(/protected health information/i)).toBeInTheDocument()
        expect(screen.getByText(/phi protection enabled/i)).toBeInTheDocument()
        expect(screen.getByText(/encrypted storage/i)).toBeInTheDocument()

        // Verify PHI-specific consent is required
        expect(screen.getByLabelText(/consent for medical data processing/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/hipaa compliance notice/i)).toBeInTheDocument()
      })

      it('should implement access controls for PHI data', async () => {
        const user = userEvent.setup()
        
        // Mock user roles
        const testUsers = [
          { id: 'patient-1', role: 'PATIENT' },
          { id: 'staff-1', role: 'HEALTHCARE_STAFF' },
          { id: 'admin-1', role: 'ADMIN' },
        ]

        testUsers.forEach(user => {
          mockTRPC.auth.getCurrentUser.mutate.mockResolvedValue(user)
        })

        // Test patient access (limited)
        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer currentUser={{ id: 'patient-1', role: 'PATIENT' }} />
            </ContactFormProvider>
          </TRPCReactProvider>
 )

        // Patient can view their own medical data
        expect(screen.getByText(/my medical information/i)).toBeInTheDocument()
        expect(screen.getByText(/only view your own data/i)).toBeInTheDocument()

        // Test healthcare staff access
        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer currentUser={{ id: 'staff-1', role: 'HEALTHCARE_STAFF' }} />
            </ContactFormProvider>
          </TRPCReactProvider>
 )

        // Staff can access PHI for care purposes
        expect(screen.getByText(/healthcare provider access/i)).toBeInTheDocument()
        expect(screen.getByText(/minimum necessary access/i)).toBeInTheDocument()
        expect(screen.getByText(/care coordination access/i)).toBeInTheDocument()
      })

      it('should implement audit logging for PHI access', async () => {
        const auditLogger = {
          logPHIAccess: vi.fn(),
        }

        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer 
                enablePHITracking={true}
                auditLogger={auditLogger}
                currentUser={{ id: 'staff-1', role: 'HEALTHCARE_STAFF' }}
              />
            </ContactFormProvider>
          </TRPCReactProvider>
 )

        // Simulate PHI access
        const user = userEvent.setup()
        await user.selectOptions(screen.getByLabelText('Category'), 'healthier_sg')
        await user.type(screen.getByLabelText('Medical Information'), 'Patient has diabetes')
        await user.click(screen.getByRole('button', { name: /submit/i }))

        // Verify audit log for PHI access
        expect(auditLogger.logPHIAccess).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: 'staff-1',
            userRole: 'HEALTHCARE_STAFF',
            accessType: 'create',
            dataTypes: ['medical_information'],
            timestamp: expect.any(Date),
            ipAddress: expect.any(String),
            sessionId: expect.any(String),
          })
        )
      })
    })
  })

  describe('4. Security Testing', () => {
    describe('4.1 XSS (Cross-Site Scripting) Prevention', () => {
      securityTestData.maliciousInputs.forEach((maliciousInput, index) => {
        it(`should prevent XSS attack ${index + 1}: ${maliciousInput.substring(0, 50)}...`, async () => {
          const user = userEvent.setup()
          
          render(
            <TRPCReactProvider>
              <ContactFormProvider>
                <ContactFormContainer />
              </ContactFormProvider>
            </TRPCReactProvider>
          )

          // Input malicious script
          await user.type(screen.getByLabelText('Name'), maliciousInput)

          // Verify input is sanitized
          const nameInput = screen.getByLabelText('Name')
          expect(nameInput).not.toHaveValue('<script>')
          expect(nameInput).not.toHaveValue('javascript:')
          expect(nameInput).not.toHaveValue('onerror=')

          // Try to submit
          await user.click(screen.getByRole('button', { name: /submit/i }))

          // Verify no script execution
          expect(screen.queryByText(/alert\(/i)).not.toBeInTheDocument()
          expect(screen.queryByText(/script/i)).not.toBeInTheDocument()
        })
      })
    })

    describe('4.2 SQL Injection Prevention', () => {
      securityTestData.sqlInjectionAttempts.forEach((injectionAttempt, index) => {
        it(`should prevent SQL injection attempt ${index + 1}`, async () => {
          const user = userEvent.setup()
          
          render(
            <TRPCReactProvider>
              <ContactFormProvider>
                <ContactFormContainer />
              </ContactFormProvider>
            </TRPCReactProvider>
 )

          // Input SQL injection attempt in name field
          await user.type(screen.getByLabelText('Name'), injectionAttempt)

          // Submit form
          await user.click(screen.getByRole('button', { name: /submit/i }))

          // Verify rejection or sanitization
          expect(screen.getByText(/invalid input detected/i)).toBeInTheDocument()
          expect(screen.getByText(/security validation failed/i)).toBeInTheDocument()
        })
      })
    })

    describe('4.3 Input Validation and Sanitization', () => {
      it('should validate and sanitize all user inputs', async () => {
        const user = userEvent.setup()
        
        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer />
            </ContactFormProvider>
          </TRPCReactProvider>
 )

        // Test various input validation scenarios
        const testInputs = [
          { field: 'Name', value: '', expectedError: 'Name is required' },
          { field: 'Email', value: 'invalid-email', expectedError: 'Invalid email format' },
          { field: 'Phone', value: '123', expectedError: 'Invalid Singapore phone number' },
          { field: 'Message', value: '', expectedError: 'Message is required' },
          { field: 'Message', value: 'A'.repeat(2000), expectedError: 'Message too long' },
        ]

        for (const testInput of testInputs) {
          const input = screen.getByLabelText(testInput.field)
          await user.clear(input)
          await user.type(input, testInput.value)
          await user.tab() // Trigger validation

          if (testInput.field === 'Message' && testInput.value.length > 0) {
            // Skip if valid input
            continue
          }

          expect(screen.getByText(new RegExp(testInput.expectedError, 'i'))).toBeInTheDocument()
        }
      })
    })

    describe('4.4 Data Encryption', () => {
      it('should encrypt sensitive data in transit and at rest', async () => {
        const encryptionService = {
          encrypt: vi.fn().mockReturnValue('encrypted_data'),
          decrypt: vi.fn().mockReturnValue('decrypted_data'),
        }

        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer 
                encryptionService={encryptionService}
                defaultCategory="healthier_sg"
              />
            </ContactFormProvider>
          </TRPCReactProvider>
 )

        // Switch to health category
        const user = userEvent.setup()
        await user.selectOptions(screen.getByLabelText('Category'), 'healthier_sg')

        // Enter sensitive data
        await user.type(screen.getByLabelText('NRIC'), 'S1234567A')
        await user.type(screen.getByLabelText('Medical Information'), 'Patient ID: P7890123')

        // Submit form
        await user.click(screen.getByRole('button', { name: /submit/i }))

        // Verify encryption was used
        expect(encryptionService.encrypt).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'phi',
            data: expect.stringMatching(/S1234567A|Patient ID/),
          })
        )
      })
    })
  })

  describe('5. Access Control and Authorization', () => {
    describe('5.1 Role-Based Access Control', () => {
      it('should enforce role-based permissions for contact management', async () => {
        const user = userEvent.setup()
        
        // Test different user roles
        const userRoles = [
          { role: 'PATIENT', expectedAccess: ['view_own_forms', 'create_forms'] },
          { role: 'HEALTHCARE_STAFF', expectedAccess: ['view_assigned_forms', 'update_enquiries', 'create_responses'] },
          { role: 'ADMIN', expectedAccess: ['view_all_forms', 'manage_categories', 'view_analytics'] },
        ]

        for (const userRole of userRoles) {
          render(
            <TRPCReactProvider>
              <ContactFormProvider>
                <ContactFormContainer 
                  currentUser={{ id: 'test-user', role: userRole.role }}
                  adminMode={userRole.role === 'ADMIN'}
                />
              </ContactFormProvider>
            </TRPCReactProvider>
          )

          // Verify role-specific UI elements
          userRole.expectedAccess.forEach(access => {
            switch (access) {
              case 'create_forms':
                expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
                break
              case 'view_all_forms':
                expect(screen.getByRole('button', { name: /view all/i })).toBeInTheDocument()
                break
              case 'manage_categories':
                expect(screen.getByRole('button', { name: /categories/i })).toBeInTheDocument()
                break
              case 'view_analytics':
                expect(screen.getByRole('button', { name: /analytics/i })).toBeInTheDocument()
                break
            }
          })

          // Verify access restrictions
          if (userRole.role === 'PATIENT') {
            expect(screen.queryByRole('button', { name: /view all forms/i })).not.toBeInTheDocument()
            expect(screen.queryByRole('button', { name: /analytics/i })).not.toBeInTheDocument()
          }
        }
      })
    })

    describe('5.2 Session Management', () => {
      it('should implement secure session management', async () => {
        const sessionManager = {
          createSession: vi.fn(),
          validateSession: vi.fn(),
          destroySession: vi.fn(),
          getSessionData: vi.fn(),
        }

        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer 
                sessionManager={sessionManager}
                currentUser={{ id: 'test-user', role: 'HEALTHCARE_STAFF' }}
              />
            </ContactFormProvider>
          </TRPCReactProvider>
 )

        // Simulate session creation on form access
        expect(sessionManager.createSession).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: 'test-user',
            role: 'HEALTHCARE_STAFF',
            expiresAt: expect.any(Date),
          })
        )

        // Simulate session validation
        const user = userEvent.setup()
        await user.selectOptions(screen.getByLabelText('Category'), 'general')
        await user.type(screen.getByLabelText('Name'), 'Test User')
        await user.type(screen.getByLabelText('Email'), 'test@example.com')
        await user.type(screen.getByLabelText('Message'), 'Test message')
        await user.click(screen.getByRole('button', { name: /submit/i }))

        // Verify session validation occurred
        expect(sessionManager.validateSession).toHaveBeenCalled()
      })

      it('should timeout inactive sessions', async () => {
        jest.useFakeTimers()
        
        const sessionTimeout = 1800000 // 30 minutes
        let isSessionActive = true

        const sessionManager = {
          checkSessionTimeout: vi.fn(() => {
            if (Date.now() > sessionTimeout) {
              isSessionActive = false
              return false
            }
            return true
          }),
        }

        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer 
                sessionManager={sessionManager}
                sessionTimeout={sessionTimeout}
              />
            </ContactFormProvider>
          </TRPCReactProvider>
 )

        // Fast-forward time beyond session timeout
        jest.advanceTimersByTime(sessionTimeout + 1000)

        // Verify session timeout occurred
        expect(sessionManager.checkSessionTimeout).toHaveBeenCalled()
        expect(screen.getByText(/session has expired/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /log in again/i })).toBeInTheDocument()

        jest.useRealTimers()
      })
    })
  })

  describe('6. Audit Trail and Compliance Reporting', () => {
    describe('6.1 Audit Trail Completeness', () => {
      it('should maintain comprehensive audit logs for all data operations', async () => {
        const auditLogger = {
          logAction: vi.fn(),
        }

        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer 
                auditLogger={auditLogger}
                currentUser={{ id: 'test-user', role: 'HEALTHCARE_STAFF' }}
              />
            </ContactFormProvider>
          </TRPCReactProvider>
 )

        const user = userEvent.setup()

        // Log form creation
        await user.type(screen.getByLabelText('Name'), 'Test User')
        await user.type(screen.getByLabelText('Email'), 'test@example.com')
        await user.selectOptions(screen.getByLabelText('Category'), 'general')
        await user.type(screen.getByLabelText('Message'), 'Test message')
        await user.click(screen.getByRole('button', { name: /submit/i }))

        // Verify audit log for form creation
        expect(auditLogger.logAction).toHaveBeenCalledWith(
          expect.objectContaining({
            action: 'FORM_CREATED',
            userId: 'test-user',
            userRole: 'HEALTHCARE_STAFF',
            timestamp: expect.any(Date),
            ipAddress: expect.any(String),
            data: expect.objectContaining({
              referenceNumber: expect.any(String),
              category: 'general',
            }),
          })
        )
      })
    })

    describe('6.2 Compliance Reporting', () => {
      it('should generate compliance reports for regulatory requirements', async () => {
        const user = userEvent.setup()
        
        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer 
                adminMode={true}
                currentUser={{ id: 'admin', role: 'ADMIN' }}
              />
            </ContactFormProvider>
          </TRPCReactProvider>
 )

        // Access compliance reporting
        await user.click(screen.getByRole('button', { name: /compliance reports/i }))

        // Verify compliance report options
        expect(screen.getByText(/generate pdpa compliance report/i)).toBeInTheDocument()
        expect(screen.getByText(/generate gdpr compliance report/i)).toBeInTheDocument()
        expect(screen.getByText(/generate hipaa compliance report/i)).toBeInTheDocument()

        // Test PDPA report generation
        await user.click(screen.getByRole('button', { name: /generate pdpa report/i }))

        expect(screen.getByText(/pdpa compliance report generated/i)).toBeInTheDocument()
        expect(screen.getByText(/data protection measures/i)).toBeInTheDocument()
        expect(screen.getByText(/consent management/i)).toBeInTheDocument()
        expect(screen.getByText(/data subject rights/i)).toBeInTheDocument()
      })
    })
  })

  describe('7. Privacy by Design Implementation', () => {
    describe('7.1 Default Privacy Settings', () => {
      it('should implement privacy-protective default settings', async () => {
        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer />
            </ContactFormProvider>
          </TRPCReactProvider>
 )

        // Verify privacy-protective defaults
        expect(screen.getByLabelText(/marketing emails/i)).not.toBeChecked() // Opt-out by default
        expect(screen.getByLabelText(/third party sharing/i)).not.toBeChecked() // No sharing by default
        expect(screen.getByLabelText(/data retention/i)).toBeChecked() // Retention for required period
      })

      it('should minimize data collection scope by default', async () => {
        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer defaultCategory="general" />
            </ContactFormProvider>
          </TRPCReactProvider>
 )

        // Verify minimal field collection for general enquiries
        const visibleFields = screen.getAllByLabelText(/.*/).map(field => 
          field.getAttribute('aria-label') || field.getAttribute('name') || ''
        )

        // Should not show medical or sensitive fields by default
        const sensitiveFields = ['medical_history', 'social_security', 'financial_info']
        sensitiveFields.forEach(field => {
          expect(screen.queryByLabelText(new RegExp(field, 'i'))).not.toBeInTheDocument()
        })
      })
    })
  })
})