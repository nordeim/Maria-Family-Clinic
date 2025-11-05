/**
 * React Component Testing Suite for Healthier SG System
 * Sub-Phase 8.12 - Testing, Quality Assurance & Performance Optimization
 * 
 * Comprehensive React component testing covering:
 * - All Healthier SG React components
 * - Snapshot testing for UI consistency
 * - Interaction testing for forms and workflows
 * - Component integration testing
 * - Error handling and loading states
 * - Accessibility features within components
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)
import { TRPCReactProvider } from '@/lib/trpc/react'

// Test components (all major Healthier SG components)
import { 
  EligibilityChecker, 
  EligibilityQuestionnaire, 
  EligibilityResults,
  EligibilityHistory,
  EligibilitySummaryCard
} from '@/components/healthier-sg/eligibility'

import { 
  BenefitsCalculator,
  BenefitsOverview,
  BenefitsTracking
} from '@/components/healthier-sg/benefits'

import {
  ProgramInfoSection,
  ProgramOverview,
  EligibilityRequirements,
  ProgramTimeline
} from '@/components/healthier-sg/program-info'

import {
  RegistrationForm,
  RegistrationProgress,
  MyInfoIntegration,
  RegistrationConfirmation
} from '@/components/healthier-sg/registration'

import {
  ClinicFinder,
  ClinicCard,
  ProgramParticipationBadge,
  ClinicCapacityIndicator
} from '@/components/healthier-sg/clinics'

import {
  HighContrastToggle,
  LanguageSelector,
  FontSizeAdjuster,
  VoiceNavigation,
  ScreenReaderAnnouncer
} from '@/components/accessibility'

// Mock data generators
const mockUserData = {
  id: 'user_123',
  name: 'John Doe',
  nric: 'S1234567A',
  email: 'john.doe@example.com',
  phone: '+65-9123-4567',
  postalCode: '123456',
  age: 45,
  citizenship: 'CITIZEN',
  registeredAt: new Date('2025-01-01')
}

const mockEligibilityData = {
  userId: 'user_123',
  assessmentId: 'assess_123',
  responses: {
    age: 45,
    citizenship: 'CITIZEN',
    postalCode: '123456',
    healthConditions: ['none'],
    smokingStatus: 'NEVER',
    exerciseFrequency: 'SEVERAL_TIMES_WEEK',
    insuranceType: 'MEDISAVE',
    commitmentLevel: 'HIGH',
    consentGiven: true
  },
  score: 85,
  isEligible: true,
  assessedAt: new Date('2025-01-15')
}

const mockClinicData = {
  id: 'clinic_001',
  name: 'Heart Care Medical Centre',
  address: '123 Medical Drive, Singapore 169857',
  phone: '+65-6123-4567',
  postalCode: '169857',
  isHealthierSGPartner: true,
  services: ['General Practice', 'Cardiology', 'Health Screenings'],
  participatingPrograms: ['Healthier SG', 'Screen for Life'],
  capacity: {
    total: 100,
    available: 75,
    utilizationRate: 0.75
  },
  coordinates: { lat: 1.3521, lng: 103.8198 }
}

const mockBenefitsData = {
  userId: 'user_123',
  totalSubsidiesUsed: 250,
  annualCap: 500,
  availableBalance: 250,
  benefits: [
    {
      type: 'CONSULTATION',
      amount: 20,
      used: true,
      date: new Date('2025-01-10'),
      clinic: 'Heart Care Medical Centre'
    },
    {
      type: 'SCREENING',
      amount: 100,
      used: true,
      date: new Date('2025-01-05'),
      clinic: 'National Screening Centre'
    }
  ]
}

describe('Healthier SG React Component Testing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock IntersectionObserver
    global.IntersectionObserver = class {
      observe = vi.fn()
      disconnect = vi.fn()
      unobserve = vi.fn()
      takeRecords = () => []
    }
    
    // Mock ResizeObserver
    global.ResizeObserver = class {
      observe = vi.fn()
      disconnect = vi.fn()
      unobserve = vi.fn()
    }
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.clearAllMocks()
  })

  describe('Eligibility Components Testing', () => {
    it('should render EligibilityChecker with proper structure', () => {
      render(
        <TRPCReactProvider>
          <EligibilityChecker />
        </TRPCReactProvider>
      )
      
      expect(screen.getByText('Healthier SG Eligibility Checker')).toBeInTheDocument()
      expect(screen.getByText('Step 1: Personal Information')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter your age')).toBeInTheDocument()
      expect(screen.getByRole('combobox')).toBeInTheDocument()
      expect(screen.getByText('Next')).toBeInTheDocument()
    })

    it('should handle form validation in EligibilityChecker', async () => {
      const user = userEvent.setup()
      
      render(
        <TRPCReactProvider>
          <EligibilityChecker />
        </TRPCReactProvider>
      )
      
      // Try to proceed without filling required fields
      await user.click(screen.getByText('Next'))
      
      await waitFor(() => {
        expect(screen.getByText(/Please complete all required questions/i)).toBeInTheDocument()
      })
    })

    it('should navigate through eligibility steps', async () => {
      const user = userEvent.setup()
      
      render(
        <TRPCReactProvider>
          <EligibilityChecker />
        </TRPCReactProvider>
      )
      
      // Fill step 1
      await user.type(screen.getByPlaceholderText('Enter your age'), '45')
      await user.selectOptions(screen.getByRole('combobox'), 'CITIZEN')
      await user.type(screen.getByPlaceholderText('Enter 6-digit postal code'), '123456')
      await user.click(screen.getByText('Next'))
      
      // Verify step 2
      expect(screen.getByText('Step 2: Health Status')).toBeInTheDocument()
      
      // Fill step 2
      await user.click(screen.getByLabelText('Yes'))
      await user.click(screen.getByText('Next'))
      
      // Verify step 3
      expect(screen.getByText('Step 3: Lifestyle Assessment')).toBeInTheDocument()
    })

    it('should render EligibilityQuestionnaire with dynamic questions', () => {
      const mockQuestions = [
        {
          id: 'age',
          type: 'number',
          label: 'What is your age?',
          required: true,
          validation: { min: 18, max: 120 }
        },
        {
          id: 'citizenship',
          type: 'select',
          label: 'What is your citizenship status?',
          required: true,
          options: [
            { value: 'CITIZEN', label: 'Singapore Citizen' },
            { value: 'PR', label: 'Permanent Resident' },
            { value: 'FOREIGN', label: 'Foreign National' }
          ]
        }
      ]
      
      render(
        <TRPCReactProvider>
          <EligibilityQuestionnaire 
            questions={mockQuestions}
            onResponse={vi.fn()}
          />
        </TRPCReactProvider>
      )
      
      expect(screen.getByText('What is your age?')).toBeInTheDocument()
      expect(screen.getByText('What is your citizenship status?')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter your age (e.g., 45)')).toBeInTheDocument()
    })

    it('should display EligibilityResults with proper styling', () => {
      const mockResult = {
        isEligible: true,
        score: 85,
        criteriaResults: [
          { name: 'Age Requirement', passed: true, score: 25 },
          { name: 'Citizenship', passed: true, score: 25 },
          { name: 'Health Commitment', passed: true, score: 35 }
        ],
        nextSteps: [
          {
            title: 'Choose a participating clinic',
            description: 'Find a Healthier SG partner clinic near you',
            priority: 'HIGH'
          }
        ]
      }
      
      render(
        <TRPCReactProvider>
          <EligibilityResults
            result={mockResult}
            onReset={vi.fn()}
            onRegister={vi.fn()}
          />
        </TRPCReactProvider>
      )
      
      expect(screen.getByText('Congratulations!')).toBeInTheDocument()
      expect(screen.getByText('You are eligible for Healthier SG')).toBeInTheDocument()
      expect(screen.getByText('85%')).toBeInTheDocument()
      expect(screen.getByText('Choose a participating clinic')).toBeInTheDocument()
    })

    it('should render EligibilityHistory with filtering', () => {
      const mockHistory = {
        assessments: [
          {
            id: 'assess_1',
            date: new Date('2025-01-15'),
            status: 'eligible',
            score: 85
          },
          {
            id: 'assess_2',
            date: new Date('2025-01-10'),
            status: 'ineligible',
            score: 60
          }
        ],
        totalCount: 2
      }
      
      render(
        <TRPCReactProvider>
          <EligibilityHistory 
            history={mockHistory}
            onView={vi.fn()}
            onDelete={vi.fn()}
          />
        </TRPCReactProvider>
      )
      
      expect(screen.getByText('Eligibility Assessment History')).toBeInTheDocument()
      expect(screen.getByText('Total Assessments: 2')).toBeInTheDocument()
      expect(screen.getByText('All Results')).toBeInTheDocument()
      expect(screen.getByText('Eligible Only')).toBeInTheDocument()
    })
  })

  describe('Benefits Components Testing', () => {
    it('should render BenefitsCalculator with form inputs', () => {
      render(
        <TRPCReactProvider>
          <BenefitsCalculator 
            userId="user_123"
            onCalculate={vi.fn()}
          />
        </TRPCReactProvider>
      )
      
      expect(screen.getByText('Healthier SG Benefits Calculator')).toBeInTheDocument()
      expect(screen.getByText('Calculate Your Benefits')).toBeInTheDocument()
      expect(screen.getByRole('combobox', { name: /service type/i })).toBeInTheDocument()
    })

    it('should handle benefits calculation', async () => {
      const user = userEvent.setup()
      const onCalculate = vi.fn()
      
      render(
        <TRPCReactProvider>
          <BenefitsCalculator 
            userId="user_123"
            onCalculate={onCalculate}
          />
        </TRPCReactProvider>
      )
      
      await user.selectOptions(screen.getByRole('combobox'), 'CONSULTATION')
      await user.click(screen.getByText('Calculate Benefits'))
      
      await waitFor(() => {
        expect(onCalculate).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: 'user_123',
            serviceType: 'CONSULTATION'
          })
        )
      })
    })

    it('should display BenefitsOverview with summary cards', () => {
      render(
        <TRPCReactProvider>
          <BenefitsOverview 
            benefits={mockBenefitsData}
            onViewDetails={vi.fn()}
          />
        </TRPCReactProvider>
      )
      
      expect(screen.getByText('Benefits Overview')).toBeInTheDocument()
      expect(screen.getByText('Total Used')).toBeInTheDocument()
      expect(screen.getByText('$250')).toBeInTheDocument()
      expect(screen.getByText('Available Balance')).toBeInTheDocument()
      expect(screen.getByText('$250')).toBeInTheDocument()
    })

    it('should render BenefitsTracking with progress indicators', () => {
      render(
        <TRPCReactProvider>
          <BenefitsTracking 
            benefits={mockBenefitsData}
            onTrackBenefit={vi.fn()}
          />
        </TRPCReactProvider>
      )
      
      expect(screen.getByText('Benefits Tracking')).toBeInTheDocument()
      expect(screen.getByText('Annual Cap: $500')).toBeInTheDocument()
      expect(screen.getByText('Used: 50%')).toBeInTheDocument()
      
      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveAttribute('aria-valuenow', '50')
    })
  })

  describe('Program Information Components Testing', () => {
    it('should render ProgramInfoSection with accurate data', () => {
      render(
        <TRPCReactProvider>
          <ProgramInfoSection />
        </TRPCReactProvider>
      )
      
      expect(screen.getByText('Healthier SG Program Information')).toBeInTheDocument()
      expect(screen.getByText('Age Requirement: 40 years and above')).toBeInTheDocument()
      expect(screen.getByText('Singapore Citizens and Permanent Residents')).toBeInTheDocument()
      expect(screen.getByText('MOH Verified')).toBeInTheDocument()
    })

    it('should display ProgramOverview with key features', () => {
      render(
        <TRPCReactProvider>
          <ProgramOverview />
        </TRPCReactProvider>
      )
      
      expect(screen.getByText('Program Overview')).toBeInTheDocument()
      expect(screen.getByText('Comprehensive healthcare program for Singapore residents')).toBeInTheDocument()
      expect(screen.getByText('Key Benefits')).toBeInTheDocument()
    })

    it('should render EligibilityRequirements with detailed criteria', () => {
      render(
        <TRPCReactProvider>
          <EligibilityRequirements />
        </TRPCReactProvider>
      )
      
      expect(screen.getByText('Eligibility Requirements')).toBeInTheDocument()
      expect(screen.getByText('Age Requirement')).toBeInTheDocument()
      expect(screen.getByText('Citizenship Status')).toBeInTheDocument()
      expect(screen.getByText('Health Assessment')).toBeInTheDocument()
    })

    it('should display ProgramTimeline with milestones', () => {
      render(
        <TRPCReactProvider>
          <ProgramTimeline />
        </TRPCReactProvider>
      )
      
      expect(screen.getByText('Program Timeline')).toBeInTheDocument()
      expect(screen.getByText('Enrollment Period')).toBeInTheDocument()
      expect(screen.getByText('Active Program')).toBeInTheDocument()
    })
  })

  describe('Registration Components Testing', () => {
    it('should render RegistrationForm with multi-step flow', () => {
      render(
        <TRPCReactProvider>
          <RegistrationForm 
            onComplete={vi.fn()}
            enableMyInfo={true}
          />
        </TRPCReactProvider>
      )
      
      expect(screen.getByText('Healthier SG Registration')).toBeInTheDocument()
      expect(screen.getByText('Step 1: Personal Information')).toBeInTheDocument()
      expect(screen.getByText('Use MyInfo')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Full Name')).toBeInTheDocument()
    })

    it('should handle RegistrationForm progression', async () => {
      const user = userEvent.setup()
      
      render(
        <TRPCReactProvider>
          <RegistrationForm 
            onComplete={vi.fn()}
            enableMyInfo={false}
          />
        </TRPCReactProvider>
      )
      
      // Fill step 1
      await user.type(screen.getByPlaceholderText('Full Name'), 'John Doe')
      await user.type(screen.getByPlaceholderText('NRIC/FIN'), 'S1234567A')
      await user.selectOptions(screen.getByRole('combobox'), 'CITIZEN')
      await user.click(screen.getByText('Continue'))
      
      // Should progress to step 2
      expect(screen.getByText('Step 2: Health Profile')).toBeInTheDocument()
    })

    it('should render RegistrationProgress with step indicators', () => {
      render(
        <TRPCReactProvider>
          <RegistrationProgress 
            currentStep={2}
            totalSteps={4}
            steps={[
              'Personal Information',
              'Health Profile',
              'Consent & Agreement',
              'Review & Submit'
            ]}
          />
        </TRPCReactProvider>
      )
      
      expect(screen.getByText('Step 2 of 4 • 50% complete')).toBeInTheDocument()
      expect(screen.getByText('Personal Information')).toHaveClass('text-green-700')
      expect(screen.getByText('Health Profile')).toHaveClass('text-blue-700')
      expect(screen.getByText('Consent & Agreement')).toHaveClass('text-gray-400')
    })

    it('should integrate with MyInfo for data prefill', async () => {
      const user = userEvent.setup()
      
      render(
        <TRPCReactProvider>
          <MyInfoIntegration 
            onDataReceived={vi.fn()}
            onError={vi.fn()}
          />
        </TRPCReactProvider>
      )
      
      await user.click(screen.getByText('Verify with MyInfo'))
      
      expect(screen.getByText('Connecting to MyInfo...')).toBeInTheDocument()
      expect(screen.getByText('Secure government data verification')).toBeInTheDocument()
    })

    it('should show RegistrationConfirmation after successful registration', () => {
      const mockRegistrationData = {
        registrationId: 'reg_123',
        userId: 'user_123',
        status: 'confirmed',
        nextSteps: [
          'Visit your chosen clinic within 30 days',
          'Complete health assessment',
          'Start your Healthier SG journey'
        ]
      }
      
      render(
        <TRPCReactProvider>
          <RegistrationConfirmation 
            data={mockRegistrationData}
            onPrint={vi.fn()}
            onDownload={vi.fn()}
          />
        </TRPCReactProvider>
      )
      
      expect(screen.getByText('Registration Successful!')).toBeInTheDocument()
      expect(screen.getByText('Your Healthier SG registration is complete')).toBeInTheDocument()
      expect(screen.getByText('Registration ID: reg_123')).toBeInTheDocument()
      expect(screen.getByText('Visit your chosen clinic within 30 days')).toBeInTheDocument()
    })
  })

  describe('Clinic Components Testing', () => {
    it('should render ClinicFinder with search functionality', () => {
      render(
        <TRPCReactProvider>
          <ClinicFinder 
            clinics={[]}
            onClinicSelect={vi.fn()}
            onFilterChange={vi.fn()}
          />
        </TRPCReactProvider>
      )
      
      expect(screen.getByText('Find Healthier SG Partner Clinics')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Search by location or clinic name')).toBeInTheDocument()
      expect(screen.getByText('Filter by Specialty')).toBeInTheDocument()
    })

    it('should display ClinicCard with proper information', () => {
      render(
        <TRPCReactProvider>
          <ClinicCard 
            clinic={mockClinicData}
            onSelect={vi.fn()}
            onViewDetails={vi.fn()}
          />
        </TRPCReactProvider>
      )
      
      expect(screen.getByText('Heart Care Medical Centre')).toBeInTheDocument()
      expect(screen.getByText('123 Medical Drive, Singapore 169857')).toBeInTheDocument()
      expect(screen.getByText('Healthier SG Partner')).toBeInTheDocument()
      expect(screen.getByText('Available: 75/100')).toBeInTheDocument()
      expect(screen.getByText('View Details')).toBeInTheDocument()
    })

    it('should render ProgramParticipationBadge with correct status', () => {
      render(
        <TRPCReactProvider>
          <ProgramParticipationBadge 
            isPartner={true}
            programs={['Healthier SG', 'Screen for Life']}
          />
        </TRPCReactProvider>
      )
      
      expect(screen.getByText('Healthier SG')).toBeInTheDocument()
      expect(screen.getByText('Partner Clinic')).toBeInTheDocument()
      expect(screen.getByText('Screen for Life')).toBeInTheDocument()
    })

    it('should display ClinicCapacityIndicator with visual feedback', () => {
      render(
        <TRPCReactProvider>
          <ClinicCapacityIndicator 
            capacity={mockClinicData.capacity}
            showDetails={true}
          />
        </TRPCReactProvider>
      )
      
      expect(screen.getByText('75% capacity')).toBeInTheDocument()
      expect(screen.getByText('Available: 75')).toBeInTheDocument()
      expect(screen.getByText('Total: 100')).toBeInTheDocument()
      
      const capacityIndicator = screen.getByTestId('capacity-indicator')
      expect(capacityIndicator).toHaveAttribute('aria-valuenow', '75')
    })
  })

  describe('Accessibility Components Testing', () => {
    it('should render HighContrastToggle with proper labeling', () => {
      render(
        <TRPCReactProvider>
          <HighContrastToggle />
        </TRPCReactProvider>
      )
      
      expect(screen.getByText('High Contrast')).toBeInTheDocument()
      expect(screen.getByLabelText('Toggle high contrast mode')).toBeInTheDocument()
      expect(screen.getByRole('switch')).toBeInTheDocument()
    })

    it('should support LanguageSelector with all Singapore languages', () => {
      render(
        <TRPCReactProvider>
          <LanguageSelector 
            availableLanguages={[
              { code: 'en', name: 'English', nativeName: 'English' },
              { code: 'zh', name: 'Chinese', nativeName: '中文' },
              { code: 'ms', name: 'Malay', nativeName: 'Melayu' },
              { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' }
            ]}
            onLanguageChange={vi.fn()}
          />
        </TRPCReactProvider>
      )
      
      expect(screen.getByText('Language')).toBeInTheDocument()
      expect(screen.getByText('English')).toBeInTheDocument()
      expect(screen.getByText('中文')).toBeInTheDocument()
      expect(screen.getByText('Melayu')).toBeInTheDocument()
      expect(screen.getByText('தமிழ்')).toBeInTheDocument()
    })

    it('should render FontSizeAdjuster with size controls', () => {
      render(
        <TRPCReactProvider>
          <FontSizeAdjuster 
            currentSize="medium"
            onSizeChange={vi.fn()}
          />
        </TRPCReactProvider>
      )
      
      expect(screen.getByText('Font Size')).toBeInTheDocument()
      expect(screen.getByText('A-')).toBeInTheDocument()
      expect(screen.getByText('A')).toBeInTheDocument()
      expect(screen.getByText('A+')).toBeInTheDocument()
    })

    it('should provide VoiceNavigation controls', async () => {
      const user = userEvent.setup()
      
      render(
        <TRPCReactProvider>
          <VoiceNavigation 
            enabled={true}
            onCommand={vi.fn()}
            supportedCommands={['next', 'previous', 'submit', 'help']}
          />
        </TRPCReactProvider>
      )
      
      expect(screen.getByText('Voice Navigation')).toBeInTheDocument()
      expect(screen.getByText('Start Listening')).toBeInTheDocument()
      expect(screen.getByText('Stop Listening')).toBeInTheDocument()
      
      await user.click(screen.getByText('Start Listening'))
      
      // Should show listening state
      expect(screen.getByText('Listening...')).toBeInTheDocument()
    })

    it('should render ScreenReaderAnnouncer with proper ARIA attributes', () => {
      render(
        <TRPCReactProvider>
          <ScreenReaderAnnouncer />
        </TRPCReactProvider>
      )
      
      const announcer = screen.getByTestId('screen-reader-announcer')
      expect(announcer).toHaveAttribute('aria-live', 'assertive')
      expect(announcer).toHaveAttribute('aria-atomic', 'true')
      expect(announcer).toHaveAttribute('aria-relevant', 'additions text')
    })
  })

  describe('Component Integration Testing', () => {
    it('should integrate EligibilityChecker with EligibilityResults', async () => {
      const user = userEvent.setup()
      
      render(
        <TRPCReactProvider>
          <EligibilityChecker 
            onComplete={(result) => {
              expect(result.isEligible).toBe(true)
            }}
          />
        </TRPCReactProvider>
      )
      
      // Complete the assessment
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

    it('should integrate RegistrationForm with MyInfo', async () => {
      const user = userEvent.setup()
      
      render(
        <TRPCReactProvider>
          <RegistrationForm 
            onComplete={vi.fn()}
            enableMyInfo={true}
          />
        </TRPCReactProvider>
      )
      
      // Use MyInfo integration
      await user.click(screen.getByText('Use MyInfo'))
      
      await waitFor(() => {
        expect(screen.getByText('Connecting to MyInfo...')).toBeInTheDocument()
      })
    })

    it('should integrate ClinicFinder with benefits tracking', () => {
      const onClinicSelect = vi.fn()
      
      render(
        <TRPCReactProvider>
          <div>
            <ClinicFinder 
              clinics={[mockClinicData]}
              onClinicSelect={onClinicSelect}
              showBenefits={true}
              userBenefits={mockBenefitsData}
            />
          </div>
        </TRPCReactProvider>
      )
      
      expect(screen.getByText('Find Healthier SG Partner Clinics')).toBeInTheDocument()
      expect(screen.getByText('Heart Care Medical Centre')).toBeInTheDocument()
      expect(screen.getByText('Benefits Available')).toBeInTheDocument()
    })
  })

  describe('Error Handling and Loading States', () => {
    it('should handle loading states properly', () => {
      render(
        <TRPCReactProvider>
          <EligibilityChecker 
            isLoading={true}
            loadingMessage="Assessing your eligibility..."
          />
        </TRPCReactProvider>
      )
      
      expect(screen.getByText('Assessing your eligibility...')).toBeInTheDocument()
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })

    it('should display error messages gracefully', () => {
      const errorMessage = 'Network error. Please try again.'
      
      render(
        <TRPCReactProvider>
          <EligibilityChecker 
            error={errorMessage}
            onRetry={vi.fn()}
          />
        </TRPCReactProvider>
      )
      
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
      expect(screen.getByText('Try Again')).toBeInTheDocument()
    })

    it('should show empty states when no data available', () => {
      render(
        <TRPCReactProvider>
          <EligibilityHistory 
            assessments={[]}
            onView={vi.fn()}
            onDelete={vi.fn()}
          />
        </TRPCReactProvider>
      )
      
      expect(screen.getByText('No assessments found')).toBeInTheDocument()
      expect(screen.getByText('Start your first eligibility assessment')).toBeInTheDocument()
    })

    it('should handle form validation errors', async () => {
      const user = userEvent.setup()
      
      render(
        <TRPCReactProvider>
          <EligibilityChecker />
        </TRPCReactProvider>
      )
      
      // Enter invalid age
      await user.type(screen.getByPlaceholderText('Enter your age'), '15')
      await user.tab()
      
      expect(screen.getByText('Must be at least 18 years old')).toBeInTheDocument()
    })
  })

  describe('Component Performance Testing', () => {
    it('should render large component lists efficiently', () => {
      const largeClinicList = Array.from({ length: 100 }, (_, i) => ({
        ...mockClinicData,
        id: `clinic_${i}`,
        name: `Clinic ${i}`
      }))
      
      const startTime = performance.now()
      
      render(
        <TRPCReactProvider>
          <div>
            {largeClinicList.map(clinic => (
              <ClinicCard 
                key={clinic.id}
                clinic={clinic}
                onSelect={vi.fn()}
                onViewDetails={vi.fn()}
              />
            ))}
          </div>
        </TRPCReactProvider>
      )
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      expect(renderTime).toBeLessThan(1000) // Should render within 1 second
    })

    it('should handle rapid user interactions smoothly', async () => {
      const user = userEvent.setup()
      
      render(
        <TRPCReactProvider>
          <EligibilityChecker />
        </TRPCReactProvider>
      )
      
      const startTime = performance.now()
      
      // Simulate rapid typing
      await user.type(screen.getByPlaceholderText('Enter your age'), '45')
      
      const endTime = performance.now()
      const interactionTime = endTime - startTime
      
      expect(interactionTime).toBeLessThan(500) // Should handle within 500ms
    })
  })

  describe('Accessibility Compliance in Components', () => {
    it('should meet WCAG 2.2 AA standards for all components', async () => {
      const components = [
        <EligibilityChecker />,
        <BenefitsCalculator userId="test" onCalculate={vi.fn()} />,
        <ProgramInfoSection />,
        <RegistrationForm onComplete={vi.fn()} />
      ]
      
      for (const component of components) {
        const { container } = render(
          <TRPCReactProvider>
            {component}
          </TRPCReactProvider>
        )
        
        const results = await axe(container, {
          rules: {
            'color-contrast': { enabled: true },
            'keyboard-navigation': { enabled: true },
            'aria-required-attr': { enabled: true },
            'label-associated': { enabled: true }
          }
        })
        
        expect(results).toHaveNoViolations()
      }
    })

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      
      render(
        <TRPCReactProvider>
          <EligibilityChecker />
        </TRPCReactProvider>
      )
      
      // Test tab navigation
      await user.tab()
      expect(screen.getByPlaceholderText('Enter your age')).toHaveFocus()
      
      await user.tab()
      expect(screen.getByRole('combobox')).toHaveFocus()
      
      await user.tab()
      expect(screen.getByPlaceholderText('Enter 6-digit postal code')).toHaveFocus()
    })

    it('should provide proper ARIA labels and descriptions', () => {
      render(
        <TRPCReactProvider>
          <EligibilityChecker />
        </TRPCReactProvider>
      )
      
      const form = screen.getByTestId('eligibility-checker')
      expect(form).toHaveAttribute('aria-label')
      expect(form).toHaveAttribute('aria-describedby')
      
      const progressIndicator = screen.getByTestId('progress-indicator')
      expect(progressIndicator).toHaveAttribute('aria-live', 'polite')
    })
  })

  describe('Snapshot Testing', () => {
    it('should generate consistent snapshots for key components', () => {
      const { container: container1 } = render(
        <TRPCReactProvider>
          <EligibilityChecker />
        </TRPCReactProvider>
      )
      
      const { container: container2 } = render(
        <TRPCReactProvider>
          <EligibilityChecker />
        </TRPCReactProvider>
      )
      
      // Snapshots should be identical for same props
      expect(container1.firstChild).toMatchSnapshot(container2.firstChild)
    })

    it('should handle props changes in snapshots', () => {
      const { container: container1 } = render(
        <TRPCReactProvider>
          <EligibilityChecker isLoading={false} />
        </TRPCReactProvider>
      )
      
      const { container: container2 } = render(
        <TRPCReactProvider>
          <EligibilityChecker isLoading={true} loadingMessage="Loading..." />
        </TRPCReactProvider>
      )
      
      // Should have different snapshots for different props
      expect(container1.firstChild).not.toEqual(container2.firstChild)
    })
  })
})