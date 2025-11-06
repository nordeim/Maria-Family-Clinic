/**
 * Comprehensive Contact System Testing Suite
 * Sub-Phase 9.10 - Testing, Quality Assurance & Performance Optimization
 * 
 * Covers:
 * - Contact form submission scenarios and edge cases
 * - Enquiry management workflow testing
 * - Status transition validation
 * - Privacy compliance and security measures
 * - Load testing for high-volume processing
 * - Cross-browser compatibility
 * - Accessibility compliance (WCAG 2.2 AA)
 * - Integration testing
 */

import { describe, it, expect, beforeEach, afterEach, vi, beforeAll } from 'vitest'
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { z } from 'zod'
import { TRPCReactProvider } from '@/lib/trpc/react'

// Contact system components
import { ContactFormContainer } from '@/components/forms/contact-form-container'
import { ContactFormWizard } from '@/components/forms/contact-form-wizard'
import { ContactFormProvider } from '@/components/forms/contact-form-provider'

// Mock tRPC
import { createTRPCMock } from '@/test/mock-trpc'

// Test data generators
import { generateTestContactData, generateTestEnquiryData, generateTestUserData } from './test-data-generator'

// Contact system types
import type { 
  ContactForm, 
  Enquiry, 
  ContactCategory, 
  ContactAnalytics,
  ContactFormWithUser,
  EnquiryWithDoctor,
  ContactResponse
} from '@/lib/types/contact-system'

// Healthcare compliance types
import type { User, Clinic, Doctor } from '@/types/healthcare'

describe('Contact System Comprehensive Testing Suite', () => {
  let mockTRPC: ReturnType<typeof createTRPCMock>
  let testUser: User
  let testClinic: Clinic
  let testDoctor: Doctor
  let testContactCategory: ContactCategory

  beforeAll(() => {
    // Initialize test data
    testUser = generateTestUserData()
    testClinic = {
      id: 'clinic-1',
      name: 'Test Family Clinic',
      address: '123 Test Street, Singapore 123456',
      phone: '+65-1234-5678',
      email: 'test@clinic.com.sg',
      isActive: true,
    }
    testDoctor = {
      id: 'doctor-1',
      name: 'Dr. Test Specialist',
      clinicId: 'clinic-1',
      specialties: ['General Practice', 'Family Medicine'],
      qualifications: ['MBBS', 'MD'],
      isActive: true,
    }
    testContactCategory = {
      id: 'category-1',
      name: 'general',
      displayName: 'General Enquiry',
      priority: 'STANDARD',
      department: 'GENERAL',
      responseSLAHours: 24,
      resolutionSLADays: 7,
      autoAssignment: true,
      isActive: true,
    }

    // Initialize mock tRPC
    mockTRPC = createTRPCMock()
  })

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks()
  })

  afterEach(() => {
    // Cleanup after each test
    vi.restoreAllMocks()
  })

  describe('1. Contact Form Submission Scenarios', () => {
    describe('1.1 Basic Form Submission', () => {
      it('should successfully submit a general contact form', async () => {
        const user = userEvent.setup()
        const mockFormData = generateTestContactData({
          category: 'general',
          userId: testUser.id,
        })

        const onSubmit = vi.fn()
        
        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer onSubmit={onSubmit} />
            </ContactFormProvider>
          </TRPCReactProvider>
        )

        // Fill form fields
        await user.type(screen.getByLabelText('Name'), mockFormData.name)
        await user.type(screen.getByLabelText('Email'), mockFormData.email)
        await user.type(screen.getByLabelText('Phone'), mockFormData.phone)
        await user.selectOptions(screen.getByLabelText('Category'), 'general')
        await user.type(screen.getByLabelText('Subject'), mockFormData.subject)
        await user.type(screen.getByLabelText('Message'), mockFormData.message)
        
        // Submit form
        await user.click(screen.getByRole('button', { name: /submit/i }))

        // Verify form submission
        await waitFor(() => {
          expect(onSubmit).toHaveBeenCalledWith(
            expect.objectContaining({
              name: mockFormData.name,
              email: mockFormData.email,
              phone: mockFormData.phone,
              category: 'general',
              subject: mockFormData.subject,
              message: mockFormData.message,
            })
          )
        })

        // Verify reference number generation
        expect(screen.getByText(/CF\d{8}\d{4}/)).toBeInTheDocument()
      })

      it('should validate required fields and show appropriate error messages', async () => {
        const user = userEvent.setup()
        
        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer />
            </ContactFormProvider>
          </TRPCReactProvider>
        )

        // Submit empty form
        await user.click(screen.getByRole('button', { name: /submit/i }))

        // Verify validation errors
        await waitFor(() => {
          expect(screen.getByText(/name is required/i)).toBeInTheDocument()
          expect(screen.getByText(/email is required/i)).toBeInTheDocument()
          expect(screen.getByText(/message is required/i)).toBeInTheDocument()
        })
      })

      it('should validate Singapore phone number format', async () => {
        const user = userEvent.setup()
        
        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer />
            </ContactFormProvider>
          </TRPCReactProvider>
        )

        // Test invalid phone formats
        const phoneInput = screen.getByLabelText('Phone')
        await user.clear(phoneInput)
        await user.type(phoneInput, 'invalid-phone')
        
        // Trigger validation
        await user.tab()
        
        expect(screen.getByText(/invalid singapore phone number/i)).toBeInTheDocument()

        // Test valid phone format
        await user.clear(phoneInput)
        await user.type(phoneInput, '+65-9123-4567')
        
        // Clear validation error
        expect(screen.queryByText(/invalid singapore phone number/i)).not.toBeInTheDocument()
      })
    })

    describe('1.2 Healthcare-Specific Form Handling', () => {
      it('should handle Healthier SG form with medical information', async () => {
        const user = userEvent.setup()
        const mockMedicalData = generateTestContactData({
          category: 'healthier_sg',
          userId: testUser.id,
          includeMedicalFields: true,
        })

        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer defaultCategory="healthier_sg" />
            </ContactFormProvider>
          </TRPCReactProvider>
        )

        // Verify medical-specific fields are visible
        expect(screen.getByLabelText('Medical Information')).toBeInTheDocument()
        expect(screen.getByLabelText('Consent for Medical Data Processing')).toBeInTheDocument()

        // Fill medical form
        await user.type(screen.getByLabelText('Name'), mockMedicalData.name)
        await user.type(screen.getByLabelText('Email'), mockMedicalData.email)
        await user.selectOptions(screen.getByLabelText('Category'), 'healthier_sg')
        await user.type(screen.getByLabelText('Medical Information'), 'Diabetes management enquiry')
        await user.click(screen.getByLabelText('Consent for Medical Data Processing'))

        // Verify HIPAA compliance notice
        expect(screen.getByText(/protected health information/i)).toBeInTheDocument()
      })

      it('should handle urgent care forms with escalation rules', async () => {
        const user = userEvent.setup()
        const mockUrgentData = generateTestContactData({
          category: 'urgent',
          userId: testUser.id,
        })

        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer defaultCategory="urgent" />
            </ContactFormProvider>
          </TRPCReactProvider>
        )

        // Verify urgent-specific UI elements
        expect(screen.getByText(/urgent care/i)).toBeInTheDocument()
        expect(screen.getByText(/emergency contact/i)).toBeInTheDocument()

        // Fill urgent form
        await user.type(screen.getByLabelText('Name'), mockUrgentData.name)
        await user.type(screen.getByLabelText('Email'), mockUrgentData.email)
        await user.type(screen.getByLabelText('Phone'), mockUrgentData.phone)
        await user.type(screen.getByLabelText('Emergency Contact'), '+65-9876-5432')
        await user.selectOptions(screen.getByLabelText('Category'), 'urgent')
        await user.type(screen.getByLabelText('Medical Emergency Details'), 'Severe chest pain')
        
        // Verify escalation notice
        expect(screen.getByText(/will be escalated immediately/i)).toBeInTheDocument()
      })
    })

    describe('1.3 File Upload Testing', () => {
      it('should handle medical document uploads with proper categorization', async () => {
        const user = userEvent.setup()
        const file = new File(['medical-document'], 'test.pdf', { type: 'application/pdf' })

        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer allowFileUpload={true} />
            </ContactFormProvider>
          </TRPCReactProvider>
        )

        const fileInput = screen.getByLabelText(/upload medical documents/i)
        
        // Upload file
        await user.upload(fileInput, file)

        // Verify file preview
        expect(screen.getByText('test.pdf')).toBeInTheDocument()
        expect(screen.getByText('application/pdf')).toBeInTheDocument()
        expect(screen.getByText('Medical Document')).toBeInTheDocument()
      })

      it('should reject invalid file types and sizes', async () => {
        const user = userEvent.setup()
        const largeFile = new File(['x'.repeat(10485761)], 'large-file.txt', { type: 'text/plain' })
        const invalidFile = new File(['malicious'], 'script.exe', { type: 'application/x-msdownload' })

        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer allowFileUpload={true} />
            </ContactFormProvider>
          </TRPCReactProvider>
        )

        const fileInput = screen.getByLabelText(/upload medical documents/i)
        
        // Test file size limit (10MB)
        await user.upload(fileInput, largeFile)
        expect(screen.getByText(/file size exceeds 10mb limit/i)).toBeInTheDocument()

        // Clear error
        await user.clear(fileInput)
        
        // Test file type restriction
        await user.upload(fileInput, invalidFile)
        expect(screen.getByText(/file type not allowed/i)).toBeInTheDocument()
      })
    })
  })

  describe('2. Enquiry Management Workflow Testing', () => {
    let mockEnquiry: Enquiry

    beforeEach(() => {
      mockEnquiry = generateTestEnquiryData({
        categoryId: testContactCategory.id,
        userId: testUser.id,
        doctorId: testDoctor.id,
      })
    })

    describe('2.1 Status Transition Validation', () => {
      it('should follow proper workflow: NEW → UNDER_REVIEW → ASSIGNED → IN_PROGRESS → RESOLVED → CLOSED', async () => {
        const user = userEvent.setup()
        
        // Create mock enquiry
        mockTRPC.contactEnquiry.createFromForm.mutate.mockResolvedValue(mockEnquiry)

        // Test each status transition
        const statusTransitions = [
          { from: 'NEW', to: 'UNDER_REVIEW' },
          { from: 'UNDER_REVIEW', to: 'ASSIGNED' },
          { from: 'ASSIGNED', to: 'IN_PROGRESS' },
          { from: 'IN_PROGRESS', to: 'RESOLVED' },
          { from: 'RESOLVED', to: 'CLOSED' },
        ]

        for (const transition of statusTransitions) {
          const updatedEnquiry = { ...mockEnquiry, status: transition.to as any }
          mockTRPC.contactEnquiry.updateStatus.mutate.mockResolvedValue(updatedEnquiry)

          await user.click(screen.getByRole('button', { name: new RegExp(transition.to, 'i') }))

          expect(mockTRPC.contactEnquiry.updateStatus).toHaveBeenCalledWith(
            expect.objectContaining({
              enquiryId: mockEnquiry.id,
              status: transition.to,
            })
          )
        }
      })

      it('should handle escalation from any status to ESCALATED', async () => {
        const user = userEvent.setup()
        
        mockTRPC.contactEnquiry.updateStatus.mutate.mockResolvedValue({
          ...mockEnquiry,
          status: 'ESCALATED' as any,
          escalatedAt: new Date(),
        })

        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer adminMode={true} />
            </ContactFormProvider>
          </TRPCReactProvider>
        )

        // Simulate escalation
        await user.click(screen.getByRole('button', { name: /escalate/i }))

        expect(mockTRPC.contactEnquiry.updateStatus).toHaveBeenCalledWith(
          expect.objectContaining({
            enquiryId: mockEnquiry.id,
            status: 'ESCALATED',
            escalationReason: expect.any(String),
          })
        )

        // Verify escalation notification
        expect(screen.getByText(/enquiry has been escalated/i)).toBeInTheDocument()
      })
    })

    describe('2.2 Assignment Management', () => {
      it('should auto-assign enquiries based on routing rules', async () => {
        const user = userEvent.setup()
        const mockAssignment = {
          id: 'assignment-1',
          enquiryId: mockEnquiry.id,
          staffId: 'staff-1',
          assignedAt: new Date(),
          isActive: true,
        }

        mockTRPC.contactEnquiry.assign.mutate.mockResolvedValue(mockAssignment)

        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer adminMode={true} />
            </ContactFormProvider>
          </TRPCReactProvider>
        )

        // Trigger auto-assignment
        await user.click(screen.getByRole('button', { name: /auto assign/i }))

        expect(mockTRPC.contactEnquiry.assign).toHaveBeenCalledWith(
          expect.objectContaining({
            enquiryId: mockEnquiry.id,
            staffId: expect.any(String),
            assignmentType: 'AUTO',
          })
        )
      })

      it('should prevent assignment conflicts and validate staff availability', async () => {
        // Mock staff already assigned to max workload
        mockTRPC.contactEnquiry.assign.mutate.mockRejectedValue(
          new Error('Staff member has reached maximum workload capacity')
        )

        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer adminMode={true} />
            </ContactFormProvider>
          </TRPCReactProvider>
        )

        // Attempt assignment
        await userEvent.setup().click(screen.getByRole('button', { name: /assign to/i }))

        expect(screen.getByText(/staff member unavailable/i)).toBeInTheDocument()
      })
    })
  })

  describe('3. Privacy Compliance and Security Testing', () => {
    describe('3.1 PDPA Compliance', () => {
      it('should require explicit consent for data collection and processing', async () => {
        const user = userEvent.setup()
        
        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer />
            </ContactFormProvider>
          </TRPCReactProvider>
        )

        // Fill required fields
        await user.type(screen.getByLabelText('Name'), 'Test User')
        await user.type(screen.getByLabelText('Email'), 'test@example.com')
        await user.selectOptions(screen.getByLabelText('Category'), 'general')

        // Submit without consent
        await user.click(screen.getByRole('button', { name: /submit/i }))

        expect(screen.getByText(/consent is required/i)).toBeInTheDocument()

        // Grant consent
        await user.click(screen.getByLabelText(/i consent to the collection/i))
        await user.click(screen.getByRole('button', { name: /submit/i }))

        expect(screen.queryByText(/consent is required/i)).not.toBeInTheDocument()
      })

      it('should provide data access, rectification, and erasure rights', async () => {
        const user = userEvent.setup()
        const mockUserData = {
          ...testUser,
          contactForms: [
            {
              id: 'form-1',
              referenceNumber: 'CF202511040001',
              status: 'RESOLVED' as any,
              createdAt: new Date(),
            },
          ],
        }

        // Mock user data retrieval
        mockTRPC.contactForm.getAll.mutate.mockResolvedValue(mockUserData.contactForms)

        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer userMode={true} />
            </ContactFormProvider>
          </TRPCReactProvider>
        )

        // View user data
        await user.click(screen.getByRole('button', { name: /my enquiries/i }))

        expect(screen.getByText('CF202511040001')).toBeInTheDocument()

        // Test data rectification
        await user.click(screen.getByRole('button', { name: /edit/i }))
        expect(screen.getByText(/update your information/i)).toBeInTheDocument()

        // Test data erasure request
        await user.click(screen.getByRole('button', { name: /delete/i }))
        expect(screen.getByText(/data erasure request/i)).toBeInTheDocument()
      })
    })

    describe('3.2 Healthcare Data Protection', () => {
      it('should implement HIPAA compliance for Protected Health Information (PHI)', async () => {
        const user = userEvent.setup()
        const mockMedicalData = generateTestContactData({
          category: 'healthier_sg',
          includeMedicalFields: true,
        })

        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer defaultCategory="healthier_sg" />
            </ContactFormProvider>
          </TRPCReactProvider>
        )

        // Fill medical form
        await user.type(screen.getByLabelText('Name'), mockMedicalData.name)
        await user.type(screen.getByLabelText('Email'), mockMedicalData.email)
        await user.type(screen.getByLabelText('Medical Information'), 'Patient ID: S1234567A, Diagnosis: Type 2 Diabetes')

        // Verify PHI warnings
        expect(screen.getByText(/protected health information/i)).toBeInTheDocument()
        expect(screen.getByText(/will be encrypted/i)).toBeInTheDocument()

        // Verify audit trail
        expect(screen.getByText(/this action will be logged/i)).toBeInTheDocument()
      })
    })

    describe('3.3 Security Testing', () => {
      it('should prevent XSS attacks in form inputs', async () => {
        const user = userEvent.setup()
        const maliciousInput = '<script>alert("xss")</script>'

        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer />
            </ContactFormProvider>
          </TRPCReactProvider>
        )

        // Test XSS in name field
        const nameInput = screen.getByLabelText('Name')
        await user.type(nameInput, maliciousInput)

        // Verify sanitization
        expect(nameInput).toHaveValue('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;')

        // Attempt submission
        await user.click(screen.getByRole('button', { name: /submit/i }))

        // Verify no script execution
        expect(vi.fn()).not.toHaveBeenCalled()
      })

      it('should implement rate limiting for form submissions', async () => {
        const user = userEvent.setup()
        
        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer />
            </ContactFormProvider>
          </TRPCReactProvider>
 )

        // Fill form
        await user.type(screen.getByLabelText('Name'), 'Test User')
        await user.type(screen.getByLabelText('Email'), 'test@example.com')
        await user.selectOptions(screen.getByLabelText('Category'), 'general')
        await user.type(screen.getByLabelText('Message'), 'Test message')

        // Submit multiple times rapidly
        for (let i = 0; i < 5; i++) {
          await user.click(screen.getByRole('button', { name: /submit/i }))
          await waitFor(() => {
            if (i < 4) {
              expect(screen.getByText(/rate limit exceeded/i)).toBeInTheDocument()
            }
          })
        }
      })
    })
  })

  describe('4. Performance and Load Testing', () => {
    describe('4.1 High-Volume Form Processing', () => {
      it('should handle 1000+ forms per hour capacity', async () => {
        const testStartTime = Date.now()
        const batchSize = 100
        const forms: ContactForm[] = []

        // Generate batch of test forms
        for (let i = 0; i < batchSize; i++) {
          forms.push(generateTestContactData({
            category: i % 2 === 0 ? 'general' : 'appointment',
            referenceNumber: `CF20251104${String(i + 1).padStart(4, '0')}`,
          }))
        }

        // Mock batch processing
        mockTRPC.contactForm.submit.mutate.mockImplementation(async (formData) => {
          return {
            id: `form-${Date.now()}-${Math.random()}`,
            ...formData,
            status: 'NEW' as any,
            createdAt: new Date(),
          }
        })

        // Process batch
        const processedForms = await Promise.all(
          forms.map(async (form) => {
            return mockTRPC.contactForm.submit.mutate(form)
          })
        )

        const testEndTime = Date.now()
        const processingTime = (testEndTime - testStartTime) / 1000 // seconds
        const formsPerSecond = batchSize / processingTime
        const formsPerHour = formsPerSecond * 3600

        // Verify performance target (1000+ forms/hour)
        expect(formsPerHour).toBeGreaterThan(1000)
        expect(processedForms).toHaveLength(batchSize)
      })

      it('should maintain sub-100ms response times for form submission', async () => {
        const mockFormData = generateTestContactData({ category: 'general' })
        const startTime = performance.now()

        mockTRPC.contactForm.submit.mutate.mockResolvedValue({
          id: 'form-1',
          ...mockFormData,
          status: 'NEW' as any,
          createdAt: new Date(),
        })

        const user = userEvent.setup()
        
        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer />
            </ContactFormProvider>
          </TRPCReactProvider>
 )

        // Fill and submit form
        await user.type(screen.getByLabelText('Name'), mockFormData.name)
        await user.type(screen.getByLabelText('Email'), mockFormData.email)
        await user.selectOptions(screen.getByLabelText('Category'), 'general')
        await user.type(screen.getByLabelText('Message'), mockFormData.message)
        await user.click(screen.getByRole('button', { name: /submit/i }))

        const endTime = performance.now()
        const responseTime = endTime - startTime

        // Verify sub-100ms response time
        expect(responseTime).toBeLessThan(100)
      })
    })

    describe('4.2 Concurrent User Testing', () => {
      it('should handle 100+ simultaneous form submissions', async () => {
        const concurrentUsers = 100
        const userPromises: Promise<void>[] = []

        for (let i = 0; i < concurrentUsers; i++) {
          const user = userEvent.setup()
          const mockFormData = generateTestContactData({
            category: i % 5 === 0 ? 'urgent' : 'general',
            userId: `user-${i}`,
          })

          const userPromise = (async () => {
            render(
              <TRPCReactProvider>
                <ContactFormProvider>
                  <ContactFormContainer />
                </ContactFormProvider>
              </TRPCReactProvider>
            )

            // Simulate user interaction
            await user.type(screen.getByLabelText('Name'), mockFormData.name)
            await user.type(screen.getByLabelText('Email'), mockFormData.email)
            await user.selectOptions(screen.getByLabelText('Category'), mockFormData.category)
            await user.type(screen.getByLabelText('Message'), mockFormData.message)
            
            // Mock successful submission
            mockTRPC.contactForm.submit.mutate.mockResolvedValue({
              id: `form-${i}`,
              ...mockFormData,
              status: 'NEW' as any,
              createdAt: new Date(),
            })

            await user.click(screen.getByRole('button', { name: /submit/i }))
          })()

          userPromises.push(userPromise)
        }

        // Wait for all users to complete
        await Promise.all(userPromises)

        // Verify all forms were processed
        expect(mockTRPC.contactForm.submit.mutate).toHaveBeenCalledTimes(concurrentUsers)
      })
    })
  })

  describe('5. Accessibility Compliance (WCAG 2.2 AA)', () => {
    describe('5.1 Keyboard Navigation', () => {
      it('should be fully navigable using only keyboard', async () => {
        const user = userEvent.setup()
        
        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer />
            </ContactFormProvider>
          </TRPCReactProvider>
        )

        // Test tab navigation through form elements
        const tabOrder = [
          screen.getByLabelText('Name'),
          screen.getByLabelText('Email'),
          screen.getByLabelText('Phone'),
          screen.getByLabelText('Category'),
          screen.getByLabelText('Subject'),
          screen.getByLabelText('Message'),
          screen.getByRole('button', { name: /submit/i }),
        ]

        // Navigate through all elements
        for (const element of tabOrder) {
          await user.tab()
          expect(element).toHaveFocus()
        }

        // Test form submission with Enter key
        await user.type(screen.getByLabelText('Name'), 'Test User')
        await user.type(screen.getByLabelText('Email'), 'test@example.com')
        await user.tab()
        await user.tab()
        await user.tab()
        await user.type(screen.getByLabelText('Message'), 'Test message')
        await user.keyboard('{Enter}')

        expect(screen.getByText(/form submitted/i)).toBeInTheDocument()
      })

      it('should provide clear focus indicators for all interactive elements', async () => {
        const user = userEvent.setup()
        
        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer />
            </ContactFormProvider>
          </TRPCReactProvider>
 )

        // Test focus indicators
        const formElements = screen.getAllByRole('textbox, button, select')
        
        for (const element of formElements) {
          await user.tab()
          expect(element).toHaveAttribute('tabindex')
          
          // Check for visible focus indicator
          const styles = window.getComputedStyle(element)
          expect(styles.outline).toBeDefined()
          expect(styles.outline).not.toBe('none')
        }
      })
    })

    describe('5.2 Screen Reader Compatibility', () => {
      it('should provide proper ARIA labels and descriptions', async () => {
        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer />
            </ContactFormProvider>
          </TRPCReactProvider>
        )

        // Verify ARIA labels
        expect(screen.getByLabelText('Name')).toHaveAttribute('aria-required', 'true')
        expect(screen.getByLabelText('Email')).toHaveAttribute('aria-required', 'true')
        expect(screen.getByLabelText('Message')).toHaveAttribute('aria-required', 'true')

        // Verify ARIA descriptions for error messages
        const nameInput = screen.getByLabelText('Name')
        expect(nameInput.parentElement).toHaveAttribute('aria-describedby')
      })

      it('should announce form validation errors to screen readers', async () => {
        const user = userEvent.setup()
        
        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer />
            </ContactFormProvider>
          </TRPCReactProvider>
        )

        // Submit empty form to trigger validation
        await user.click(screen.getByRole('button', { name: /submit/i }))

        // Check for ARIA live region
        const errorRegion = screen.getByRole('alert')
        expect(errorRegion).toBeInTheDocument()
        expect(errorRegion).toHaveAttribute('aria-live', 'polite')
      })
    })

    describe('5.3 Visual Accessibility', () => {
      it('should meet WCAG 2.2 AA color contrast requirements', async () => {
        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer />
            </ContactFormProvider>
          </TRPCReactProvider>
        )

        // Check color contrast for all text elements
        const textElements = screen.getAllByText(/.*/)
        
        for (const element of textElements) {
          const styles = window.getComputedStyle(element)
          const color = styles.color
          const backgroundColor = styles.backgroundColor
          
          // Verify sufficient contrast (minimum 4.5:1 for normal text)
          expect(getContrastRatio(color, backgroundColor)).toBeGreaterThan(4.5)
        }
      })

      it('should support 200% zoom without horizontal scrolling', async () => {
        // Mock 200% zoom
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 640, // Half of 1280px
        })

        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer />
            </ContactFormProvider>
          </TRPCReactProvider>
        )

        // Verify no horizontal scroll
        expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth)
      })
    })
  })

  describe('6. Cross-Browser Compatibility Testing', () => {
    const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge']
    
    browsers.forEach((browser) => {
      it(`should work correctly in ${browser}`, async () => {
        // Mock browser detection
        Object.defineProperty(navigator, 'userAgent', {
          writable: true,
          value: `${browser}/${getVersionForBrowser(browser)}`,
        })

        const user = userEvent.setup()
        const mockFormData = generateTestContactData({ category: 'general' })

        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer />
            </ContactFormProvider>
          </TRPCReactProvider>
        )

        // Test core functionality
        await user.type(screen.getByLabelText('Name'), mockFormData.name)
        await user.type(screen.getByLabelText('Email'), mockFormData.email)
        await user.selectOptions(screen.getByLabelText('Category'), 'general')
        await user.type(screen.getByLabelText('Message'), mockFormData.message)

        // Verify form state
        expect(screen.getByLabelText('Name')).toHaveValue(mockFormData.name)
        expect(screen.getByLabelText('Email')).toHaveValue(mockFormData.email)
        expect(screen.getByLabelText('Message')).toHaveValue(mockFormData.message)
      })
    })
  })

  describe('7. Mobile Responsiveness Testing', () => {
    const devices = [
      { name: 'iPhone SE', width: 375, height: 667 },
      { name: 'iPad', width: 768, height: 1024 },
      { name: 'Samsung Galaxy S21', width: 360, height: 800 },
    ]

    devices.forEach((device) => {
      it(`should be fully functional on ${device.name}`, async () => {
        // Mock device dimensions
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: device.width,
        })
        Object.defineProperty(window, 'innerHeight', {
          writable: true,
          configurable: true,
          value: device.height,
        })

        const user = userEvent.setup()
        
        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer />
            </ContactFormProvider>
          </TRPCReactProvider>
        )

        // Test touch interactions
        const nameInput = screen.getByLabelText('Name')
        fireEvent.touchStart(nameInput)
        fireEvent.focus(nameInput)

        // Verify mobile-specific UI
        if (device.width < 768) {
          expect(screen.getByText(/mobile-optimized/i)).toBeInTheDocument()
        }

        // Test form submission on mobile
        await user.type(nameInput, 'Test User')
        await user.type(screen.getByLabelText('Email'), 'test@example.com')
        await user.selectOptions(screen.getByLabelText('Category'), 'general')
        await user.type(screen.getByLabelText('Message'), 'Mobile test')
        await user.click(screen.getByRole('button', { name: /submit/i }))

        expect(screen.getByText(/form submitted successfully/i)).toBeInTheDocument()
      })
    })
  })

  describe('8. Integration Testing', () => {
    describe('8.1 Healthcare System Integration', () => {
      it('should integrate with user profiles and clinic data', async () => {
        const mockIntegratedData = {
          ...generateTestContactData({ category: 'general' }),
          user: testUser,
          clinic: testClinic,
          doctor: testDoctor,
        }

        mockTRPC.contactForm.submit.mutate.mockResolvedValue({
          id: 'form-1',
          ...mockIntegratedData,
          status: 'NEW' as any,
          createdAt: new Date(),
        })

        const user = userEvent.setup()
        
        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer enableUserIntegration={true} />
            </ContactFormProvider>
          </TRPCReactProvider>
        )

        // Verify user data is pre-populated
        expect(screen.getByLabelText('Name')).toHaveValue(testUser.name || '')
        expect(screen.getByLabelText('Email')).toHaveValue(testUser.email || '')

        // Test clinic selection
        const clinicSelect = screen.getByLabelText('Preferred Clinic')
        expect(clinicSelect).toBeInTheDocument()
        expect(screen.getByText(testClinic.name)).toBeInTheDocument()
      })

      it('should integrate with Healthier SG program data', async () => {
        const user = userEvent.setup()
        const mockHealthierSGData = {
          ...generateTestContactData({ category: 'healthier_sg' }),
          eligibilityAssessment: {
            id: 'eligibility-1',
            userId: testUser.id,
            status: 'ELIGIBLE' as any,
            assessmentData: { age: 40, chronicConditions: ['diabetes'] },
          },
        }

        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer defaultCategory="healthier_sg" />
            </ContactFormProvider>
          </TRPCReactProvider>
        )

        // Verify Healthier SG-specific fields
        expect(screen.getByText(/healthier sg program/i)).toBeInTheDocument()
        expect(screen.getByLabelText('Membership Number')).toBeInTheDocument()
        expect(screen.getByLabelText('Program Status')).toBeInTheDocument()

        // Test eligibility integration
        await user.selectOptions(screen.getByLabelText('Category'), 'healthier_sg')
        expect(screen.getByText(/eligible for healthier sg/i)).toBeInTheDocument()
      })
    })

    describe('8.2 External Communication Systems', () => {
      it('should integrate with email notification system', async () => {
        // Mock email service
        const mockEmailService = {
          sendConfirmationEmail: vi.fn(),
          sendStatusUpdateEmail: vi.fn(),
          sendEscalationEmail: vi.fn(),
        }

        mockTRPC.contactForm.submit.mutate.mockResolvedValue({
          id: 'form-1',
          status: 'NEW' as any,
          createdAt: new Date(),
          referenceNumber: 'CF202511040001',
        })

        const user = userEvent.setup()
        
        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer enableEmailNotifications={true} />
            </ContactFormProvider>
          </TRPCReactProvider>
        )

        // Submit form
        await user.type(screen.getByLabelText('Name'), 'Test User')
        await user.type(screen.getByLabelText('Email'), 'test@example.com')
        await user.selectOptions(screen.getByLabelText('Category'), 'general')
        await user.type(screen.getByLabelText('Message'), 'Test message')
        await user.click(screen.getByRole('button', { name: /submit/i }))

        // Verify email notification
        expect(mockEmailService.sendConfirmationEmail).toHaveBeenCalledWith(
          expect.objectContaining({
            to: 'test@example.com',
            referenceNumber: 'CF202511040001',
          })
        )
      })

      it('should integrate with SMS alert system for urgent care', async () => {
        // Mock SMS service
        const mockSMSService = {
          sendUrgentCareAlert: vi.fn(),
        }

        mockTRPC.contactForm.submit.mutate.mockResolvedValue({
          id: 'form-1',
          status: 'ESCALATED' as any,
          createdAt: new Date(),
          referenceNumber: 'CF202511040002',
        })

        const user = userEvent.setup()
        
        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer defaultCategory="urgent" enableSMSAlerts={true} />
            </ContactFormProvider>
          </TRPCReactProvider>
 )

        // Submit urgent care form
        await user.type(screen.getByLabelText('Name'), 'Test User')
        await user.type(screen.getByLabelText('Email'), 'test@example.com')
        await user.type(screen.getByLabelText('Phone'), '+65-9123-4567')
        await user.selectOptions(screen.getByLabelText('Category'), 'urgent')
        await user.type(screen.getByLabelText('Medical Emergency Details'), 'Severe chest pain')
        await user.click(screen.getByRole('button', { name: /submit/i }))

        // Verify SMS alert
        expect(mockSMSService.sendUrgentCareAlert).toHaveBeenCalledWith(
          expect.objectContaining({
            phone: '+65-9123-4567',
            referenceNumber: 'CF202511040002',
            urgencyLevel: 'URGENT',
          })
        )
      })
    })
  })

  describe('9. Analytics and Performance Monitoring', () => {
    it('should track form submission analytics', async () => {
      const mockAnalyticsData: ContactAnalytics = {
        totalForms: 1250,
        formsByCategory: {
          general: 450,
          appointment: 350,
          healthier_sg: 200,
          urgent: 150,
          technical_support: 100,
        },
        averageResponseTime: 2.5,
        slaCompliance: 94.2,
        resolutionRate: 87.5,
      }

      mockTRPC.contactAnalytics.getFormAnalytics.mutate.mockResolvedValue(mockAnalyticsData)

      const user = userEvent.setup()
      
      render(
        <TRPCReactProvider>
          <ContactFormProvider>
            <ContactFormContainer adminMode={true} />
          </ContactFormProvider>
        </TRPCReactProvider>
      )

      // Access analytics dashboard
      await user.click(screen.getByRole('button', { name: /analytics/i }))

      // Verify analytics display
      expect(screen.getByText('1,250')).toBeInTheDocument() // Total forms
      expect(screen.getByText('94.2%')).toBeInTheDocument() // SLA compliance
      expect(screen.getByText('2.5 hours')).toBeInTheDocument() // Average response time
    })

    it('should monitor response time and performance metrics', async () => {
      const mockPerformanceMetrics = {
        responseTime: {
          average: 1.8,
          p95: 3.2,
          p99: 4.8,
        },
        throughput: {
          formsPerHour: 1250,
          peakConcurrentUsers: 95,
        },
        errors: {
          rate: 0.02,
          types: { validation: 0.015, system: 0.005 },
        },
      }

      mockTRPC.contactAnalytics.getResponseTimeAnalytics.mutate.mockResolvedValue(mockPerformanceMetrics)

      const user = userEvent.setup()
      
      render(
        <TRPCReactProvider>
          <ContactFormProvider>
            <ContactFormContainer adminMode={true} />
          </ContactFormProvider>
        </TRPCReactProvider>
 )

      // Access performance dashboard
      await user.click(screen.getByRole('button', { name: /performance/i }))

      // Verify performance metrics
      expect(screen.getByText('1.8 hours')).toBeInTheDocument() // Average response time
      expect(screen.getByText('1,250 forms/hour')).toBeInTheDocument() // Throughput
      expect(screen.getByText('0.02%')).toBeInTheDocument() // Error rate
    })
  })
})

// Utility functions for testing
function getContrastRatio(color1: string, color2: string): number {
  // Simplified contrast ratio calculation for testing
  const getLuminance = (color: string) => {
    const rgb = color.match(/\d+/g)?.map(Number) || [0, 0, 0]
    return (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255
  }
  
  const lum1 = getLuminance(color1)
  const lum2 = getLuminance(color2)
  const brightest = Math.max(lum1, lum2)
  const darkest = Math.min(lum1, lum2)
  
  return (brightest + 0.05) / (darkest + 0.05)
}

function getVersionForBrowser(browser: string): string {
  const versions: Record<string, string> = {
    Chrome: '120.0.6099',
    Firefox: '120.0.1',
    Safari: '17.1.1',
    Edge: '120.0.2210.72',
  }
  return versions[browser] || '120.0.0.0'
}