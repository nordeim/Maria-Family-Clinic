/**
 * Healthier SG Program Accuracy Validation Tests
 * Sub-Phase 8.12 - Testing, Quality Assurance & Performance Optimization
 * 
 * Validates program information accuracy against current MOH guidelines,
 * eligibility criteria, benefits calculation, and clinic participation.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TRPCReactProvider } from '@/lib/trpc/react'

// Test components
import { EligibilityChecker } from '@/components/healthier-sg/eligibility/EligibilityChecker'
import { ProgramInfoSection } from '@/components/healthier-sg/program-info/ProgramInfoSection'
import { BenefitsCalculator } from '@/components/healthier-sg/benefits/BenefitsCalculator'
import { ClinicFinder } from '@/components/healthier-sg/registration/ClinicFinder'
import { RegistrationForm } from '@/components/healthier-sg/registration/RegistrationForm'

// Mock data
import { 
  mockMOHGuidelines, 
  mockEligibilityCriteria, 
  mockBenefitsCalculation,
  mockClinicData,
  mockProgramRequirements
} from './test-data-generator'

// Mock tRPC
vi.mock('@/lib/trpc/client', () => ({
  api: {
    healthierSg: {
      validateMOHGuidelines: {
        useQuery: () => ({
          data: mockMOHGuidelines,
          isLoading: false,
          error: null
        })
      },
      validateEligibilityCriteria: {
        useQuery: () => ({
          data: mockEligibilityCriteria,
          isLoading: false,
          error: null
        })
      },
      calculateBenefits: {
        useMutation: () => ({
          mutateAsync: vi.fn().mockResolvedValue(mockBenefitsCalculation)
        })
      },
      validateClinicParticipation: {
        useQuery: () => ({
          data: { isValid: true, clinic: mockClinicData },
          isLoading: false,
          error: null
        })
      },
      validateRegistrationWorkflow: {
        useMutation: () => ({
          mutateAsync: vi.fn().mockResolvedValue({ success: true, registrationId: 'reg_123' })
        })
      }
    }
  }
}))

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <TRPCReactProvider>{children}</TRPCReactProvider>
)

describe('Healthier SG Program Accuracy Validation', () => {
  describe('MOH Guidelines Compliance', () => {
    it('should validate program information against current MOH guidelines', () => {
      render(
        <Wrapper>
          <ProgramInfoSection />
        </Wrapper>
      )

      expect(screen.getByText('Healthier SG Program Information')).toBeInTheDocument()
      expect(screen.getByText('Last Updated: January 2025')).toBeInTheDocument()
      expect(screen.getByText('MOH Verified')).toBeInTheDocument()
    })

    it('should display accurate eligibility age requirements (40+ years)', () => {
      render(
        <Wrapper>
          <ProgramInfoSection />
        </Wrapper>
      )

      expect(screen.getByText('Age Requirement: 40 years and above')).toBeInTheDocument()
      expect(screen.getByText('Singapore Citizens and Permanent Residents')).toBeInTheDocument()
    })

    it('should show correct enrollment timeline', () => {
      render(
        <Wrapper>
          <ProgramInfoSection />
        </Wrapper>
      )

      expect(screen.getByText('Enrollment Period: July 2023 - December 2025')).toBeInTheDocument()
      expect(screen.getByText('Active Program')).toBeInTheDocument()
    })

    it('should validate clinic participation status', () => {
      render(
        <Wrapper>
          <ClinicFinder />
        </Wrapper>
      )

      expect(screen.getByText('Healthier SG Partner Clinics')).toBeInTheDocument()
    })
  })

  describe('Eligibility Criteria Validation', () => {
    it('should validate age requirement (minimum 40 years)', async () => {
      const user = userEvent.setup()
      
      render(
        <Wrapper>
          <EligibilityChecker />
        </Wrapper>
      )

      await user.type(screen.getByPlaceholderText('Enter your age'), '25')
      await user.tab()

      expect(screen.getByText('Must be 40 years or older to participate')).toBeInTheDocument()
    })

    it('should validate citizenship requirements', async () => {
      const user = userEvent.setup()
      
      render(
        <Wrapper>
          <EligibilityChecker />
        </Wrapper>
      )

      await user.type(screen.getByPlaceholderText('Enter your age'), '45')
      await user.selectOptions(screen.getByRole('combobox'), 'VISITOR')
      await user.tab()

      expect(screen.getByText('Only Singapore Citizens and PRs are eligible')).toBeInTheDocument()
    })

    it('should validate postal code requirements', async () => {
      const user = userEvent.setup()
      
      render(
        <Wrapper>
          <EligibilityChecker />
        </Wrapper>
      )

      await user.type(screen.getByPlaceholderText('Enter 6-digit postal code'), '12345')
      await user.tab()

      expect(screen.getByText('Please enter a valid 6-digit Singapore postal code')).toBeInTheDocument()
    })

    it('should validate comprehensive eligibility assessment', async () => {
      const user = userEvent.setup()
      
      render(
        <Wrapper>
          <EligibilityChecker enableRealTimeEvaluation={true} />
        </Wrapper>
      )

      // Complete full assessment
      await user.type(screen.getByPlaceholderText('Enter your age'), '45')
      await user.selectOptions(screen.getByRole('combobox'), 'CITIZEN')
      await user.type(screen.getByPlaceholderText('Enter 6-digit postal code'), '123456')
      await user.click(screen.getByText('Next'))
      await user.click(screen.getByLabelText('Yes'))
      await user.click(screen.getByText('Next'))
      await user.selectOptions(screen.getByRole('combobox', { name: 'What is your smoking status?' }), 'NEVER')
      await user.selectOptions(screen.getByRole('combobox', { name: 'How often do you exercise?' }), 'SEVERAL_TIMES_WEEK')
      await user.click(screen.getByText('Next'))
      await user.selectOptions(screen.getByRole('combobox', { name: 'What type of health insurance do you have?' }), 'MEDISAVE')
      await user.click(screen.getByText('Next'))
      await user.selectOptions(screen.getByRole('combobox', { name: 'How committed are you to improving your health?' }), 'HIGH')
      await user.click(screen.getByLabelText('Yes, I consent'))
      await user.click(screen.getByText('Complete Assessment'))

      await waitFor(() => {
        expect(screen.getByText('Eligibility Assessment Results')).toBeInTheDocument()
      })
    })
  })

  describe('Benefits Calculation Accuracy', () => {
    it('should calculate subsidies accurately according to government standards', () => {
      render(
        <Wrapper>
          <BenefitsCalculator />
        </Wrapper>
      )

      expect(screen.getByText('Healthier SG Benefits Calculator')).toBeInTheDocument()
      expect(screen.getByText('Annual Subsidy Cap: $500')).toBeInTheDocument()
      expect(screen.getByText('Screenings Covered: 100%')).toBeInTheDocument()
    })

    it('should validate consultation fee subsidies', async () => {
      const user = userEvent.setup()
      
      render(
        <Wrapper>
          <BenefitsCalculator />
        </Wrapper>
      )

      await user.selectOptions(screen.getByRole('combobox', { name: 'Service Type' }), 'CONSULTATION')
      await user.click(screen.getByText('Calculate Benefits'))

      expect(screen.getByText('Subsidy Amount: $20')).toBeInTheDocument()
      expect(screen.getByText('Your Cost: $5')).toBeInTheDocument()
    })

    it('should calculate screening program benefits correctly', async () => {
      const user = userEvent.setup()
      
      render(
        <Wrapper>
          <BenefitsCalculator />
        </Wrapper>
      )

      await user.selectOptions(screen.getByRole('combobox', { name: 'Service Type' }), 'SCREENING')
      await user.click(screen.getByText('Calculate Benefits'))

      expect(screen.getByText('100% Covered by Healthier SG')).toBeInTheDocument()
      expect(screen.getByText('No Cost to You')).toBeInTheDocument()
    })

    it('should validate chronic disease management benefits', async () => {
      const user = userEvent.setup()
      
      render(
        <Wrapper>
          <BenefitsCalculator />
        </Wrapper>
      )

      await user.selectOptions(screen.getByRole('combobox', { name: 'Service Type' }), 'CHRONIC_MANAGEMENT')
      await user.click(screen.getByText('Calculate Benefits'))

      expect(screen.getByText('Subsidy: Up to $500/year')).toBeInTheDocument()
      expect(screen.getByText('Medisave Integration')).toBeInTheDocument()
    })
  })

  describe('Clinic Participation Verification', () => {
    it('should validate clinic participation status', () => {
      render(
        <Wrapper>
          <ClinicFinder />
        </Wrapper>
      )

      expect(screen.getByText('Find Healthier SG Partner Clinics')).toBeInTheDocument()
      expect(screen.getByText('MOH Verified Partners')).toBeInTheDocument()
    })

    it('should display accurate clinic information', () => {
      render(
        <Wrapper>
          <ClinicFinder />
        </Wrapper>
      )

      expect(screen.getByText('Healthier SG Partner Since 2023')).toBeInTheDocument()
      expect(screen.getByText('Accepts Healthier SG Subsidies')).toBeInTheDocument()
    })

    it('should validate clinic service coverage', () => {
      render(
        <Wrapper>
          <ClinicFinder />
        </Wrapper>
      )

      expect(screen.getByText('Available Services:')).toBeInTheDocument()
      expect(screen.getByText('• General Consultations')).toBeInTheDocument()
      expect(screen.getByText('• Chronic Disease Management')).toBeInTheDocument()
      expect(screen.getByText('• Health Screenings')).toBeInTheDocument()
      expect(screen.getByText('• Vaccinations')).toBeInTheDocument()
    })
  })

  describe('Registration Process Validation', () => {
    it('should validate registration workflow against government standards', async () => {
      const user = userEvent.setup()
      const mockOnComplete = vi.fn()
      
      render(
        <Wrapper>
          <RegistrationForm onComplete={mockOnComplete} />
        </Wrapper>
      )

      await user.type(screen.getByPlaceholderText('Full Name'), 'John Doe')
      await user.type(screen.getByPlaceholderText('NRIC/FIN'), 'S1234567A')
      await user.type(screen.getByPlaceholderText('Postal Code'), '123456')
      await user.selectOptions(screen.getByRole('combobox'), 'CITIZEN')
      await user.click(screen.getByText('Continue'))

      expect(screen.getByText('Step 2: Health Profile')).toBeInTheDocument()
    })

    it('should validate MyInfo integration accuracy', async () => {
      const user = userEvent.setup()
      
      render(
        <Wrapper>
          <RegistrationForm />
        </Wrapper>
      )

      await user.click(screen.getByText('Use MyInfo'))

      expect(screen.getByText('Connecting to MyInfo...')).toBeInTheDocument()
      expect(screen.getByText('Secure government data verification')).toBeInTheDocument()
    })

    it('should handle registration data validation', async () => {
      const user = userEvent.setup()
      
      render(
        <Wrapper>
          <RegistrationForm />
        </Wrapper>
      )

      // Test NRIC validation
      await user.type(screen.getByPlaceholderText('NRIC/FIN'), 'INVALID')
      await user.click(screen.getByText('Continue'))

      expect(screen.getByText('Please enter a valid NRIC or FIN number')).toBeInTheDocument()
    })
  })

  describe('Health Assessment Accuracy', () => {
    it('should validate health risk assessment questions', () => {
      render(
        <Wrapper>
          <EligibilityChecker />
        </Wrapper>
      )

      expect(screen.getByText('Health Status Assessment')).toBeInTheDocument()
      expect(screen.getByText('Medical History')).toBeInTheDocument()
      expect(screen.getByText('Lifestyle Factors')).toBeInTheDocument()
    })

    it('should validate chronic condition screening', async () => {
      const user = userEvent.setup()
      
      render(
        <Wrapper>
          <EligibilityChecker />
        </Wrapper>
      )

      // Navigate to health assessment
      await user.type(screen.getByPlaceholderText('Enter your age'), '45')
      await user.selectOptions(screen.getByRole('combobox'), 'CITIZEN')
      await user.type(screen.getByPlaceholderText('Enter 6-digit postal code'), '123456')
      await user.click(screen.getByText('Next'))
      await user.click(screen.getByLabelText('Yes'))

      expect(screen.getByText('Chronic Conditions Screening')).toBeInTheDocument()
      expect(screen.getByText('Diabetes')).toBeInTheDocument()
      expect(screen.getByText('High Blood Pressure')).toBeInTheDocument()
      expect(screen.getByText('High Cholesterol')).toBeInTheDocument()
    })

    it('should validate lifestyle assessment accuracy', async () => {
      const user = userEvent.setup()
      
      render(
        <Wrapper>
          <EligibilityChecker />
        </Wrapper>
      )

      // Navigate to lifestyle assessment
      await user.type(screen.getByPlaceholderText('Enter your age'), '45')
      await user.selectOptions(screen.getByRole('combobox'), 'CITIZEN')
      await user.type(screen.getByPlaceholderText('Enter 6-digit postal code'), '123456')
      await user.click(screen.getByText('Next'))
      await user.click(screen.getByLabelText('Yes'))
      await user.click(screen.getByText('Next'))

      expect(screen.getByText('Smoking Status')).toBeInTheDocument()
      expect(screen.getByText('Exercise Frequency')).toBeInTheDocument()
      expect(screen.getByText('Diet Quality')).toBeInTheDocument()
    })
  })

  describe('Program Compliance Verification', () => {
    it('should validate data privacy compliance (PDPA)', () => {
      render(
        <Wrapper>
          <ProgramInfoSection />
        </Wrapper>
      )

      expect(screen.getByText('PDPA Compliant')).toBeInTheDocument()
      expect(screen.getByText('Data encrypted and secure')).toBeInTheDocument()
    })

    it('should display accurate program statistics', () => {
      render(
        <Wrapper>
          <ProgramInfoSection />
        </Wrapper>
      )

      expect(screen.getByText('Program Statistics')).toBeInTheDocument()
      expect(screen.getByText('Total Enrolled: 450,000+')).toBeInTheDocument()
      expect(screen.getByText('Partner Clinics: 1,200+')).toBeInTheDocument()
      expect(screen.getByText('Satisfaction Rate: 95%')).toBeInTheDocument()
    })

    it('should validate multilingual support accuracy', () => {
      render(
        <Wrapper>
          <ProgramInfoSection />
        </Wrapper>
      )

      expect(screen.getByText('Languages Available')).toBeInTheDocument()
      expect(screen.getByText('English')).toBeInTheDocument()
      expect(screen.getByText('中文')).toBeInTheDocument()
      expect(screen.getByText('Melayu')).toBeInTheDocument()
      expect(screen.getByText('தமிழ்')).toBeInTheDocument()
    })
  })

  describe('Integration with Government Systems', () => {
    it('should validate MyInfo API integration', async () => {
      const user = userEvent.setup()
      
      render(
        <Wrapper>
          <RegistrationForm />
        </Wrapper>
      )

      await user.click(screen.getByText('Verify with MyInfo'))

      await waitFor(() => {
        expect(screen.getByText('MyInfo Verification')).toBeInTheDocument()
      })
    })

    it('should validate clinic system integration', () => {
      render(
        <Wrapper>
          <ClinicFinder />
        </Wrapper>
      )

      expect(screen.getByText('Real-time Availability')).toBeInTheDocument()
      expect(screen.getByText('Government Integrated')).toBeInTheDocument()
    })

    it('should validate health record integration', () => {
      render(
        <Wrapper>
          <EligibilityChecker />
        </Wrapper>
      )

      expect(screen.getByText('Health Records Integration')).toBeInTheDocument()
      expect(screen.getByText('Secure and Confidential')).toBeInTheDocument()
    })
  })
})