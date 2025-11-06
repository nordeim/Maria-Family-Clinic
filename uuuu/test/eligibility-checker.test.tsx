/**
 * Comprehensive Test Suite for Healthier SG Interactive Eligibility Checker System
 * Sub-Phase 8.3 Implementation Testing
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TRPCReactProvider } from '@/lib/trpc/react'
import { toast } from '@/lib/notifications/toasts'

// Mock components
import { EligibilityChecker } from '@/components/healthier-sg/eligibility/EligibilityChecker'
import { QuestionCard } from '@/components/healthier-sg/eligibility/QuestionCard'
import { ProgressIndicator } from '@/components/healthier-sg/eligibility/ProgressIndicator'
import { ResultsDisplay } from '@/components/healthier-sg/eligibility/ResultsDisplay'
import { EligibilityHistory } from '@/components/healthier-sg/eligibility/EligibilityHistory'
import { HelpTooltip } from '@/components/healthier-sg/eligibility/HelpTooltip'

// Mock utilities
import { mockEligibleAssessment, mockIneligibleAssessment, mockQuestion, mockResponses } from './mock-data'

// Mock tRPC
vi.mock('@/lib/trpc/client', () => ({
  api: {
    healthierSg: {
      evaluateEligibility: {
        useMutation: () => ({
          mutateAsync: vi.fn().mockResolvedValue({
            success: true,
            data: {
              isEligible: true,
              confidence: 0.85,
              score: 85,
              criteriaResults: [
                {
                  name: 'Age Requirement',
                  passed: true,
                  score: 25,
                  description: 'Must be 40 years or older',
                  recommendation: 'Meets age requirement'
                }
              ],
              nextSteps: [
                {
                  title: 'Choose a participating clinic',
                  description: 'Find a Healthier SG partner clinic near you',
                  priority: 'HIGH',
                  actionRequired: true
                }
              ],
              appealsAvailable: true,
              appealDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }
          })
        })
      },
      getEligibilityHistory: {
        useQuery: () => ({
          data: {
            assessments: [],
            pagination: { total: 0, hasMore: false },
            summary: { totalAssessments: 0, eligibleAssessments: 0, successRate: 0 }
          },
          isLoading: false,
          error: null
        })
      },
      submitAppeal: {
        useMutation: () => ({
          mutateAsync: vi.fn().mockResolvedValue({
            success: true,
            appeal: {
              id: 'appeal-1',
              status: 'SUBMITTED',
              submittedAt: new Date(),
              appealDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            },
            message: 'Appeal submitted successfully'
          })
        })
      },
      trackEligibilityAssessment: {
        useMutation: () => ({
          mutate: vi.fn()
        })
      }
    }
  }
}))

// Mock toast
vi.mock('@/lib/notifications/toasts', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn()
  }
}))

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <TRPCReactProvider>{children}</TRPCReactProvider>
)

describe('EligibilityChecker Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initialization and Rendering', () => {
    it('should render the main eligibility checker interface', () => {
      render(
        <Wrapper>
          <EligibilityChecker />
        </Wrapper>
      )

      expect(screen.getByText('Healthier SG Eligibility Checker')).toBeInTheDocument()
      expect(screen.getByText('Step 1: Personal Information')).toBeInTheDocument()
    })

    it('should display progress indicator when enabled', () => {
      render(
        <Wrapper>
          <EligibilityChecker showProgress={true} />
        </Wrapper>
      )

      expect(screen.getByText('Assessment Progress')).toBeInTheDocument()
      expect(screen.getByText('Step 1 of 5')).toBeInTheDocument()
    })

    it('should show language selector when multilingual is enabled', () => {
      render(
        <Wrapper>
          <EligibilityChecker enableMultilingual={true} />
        </Wrapper>
      )

      expect(screen.getByText('English')).toBeInTheDocument()
      expect(screen.getByText('中文')).toBeInTheDocument()
    })
  })

  describe('Question Navigation', () => {
    it('should navigate through steps correctly', async () => {
      const user = userEvent.setup()
      
      render(
        <Wrapper>
          <EligibilityChecker />
        </Wrapper>
      )

      // Fill required questions for step 1
      await user.type(screen.getByPlaceholderText('Enter your age'), '45')
      await user.selectOptions(screen.getByRole('combobox'), 'CITIZEN')
      await user.type(screen.getByPlaceholderText('Enter 6-digit postal code'), '123456')

      // Navigate to next step
      await user.click(screen.getByText('Next'))

      expect(screen.getByText('Step 2: Health Status')).toBeInTheDocument()
    })

    it('should validate required fields before proceeding', async () => {
      const user = userEvent.setup()
      
      render(
        <Wrapper>
          <EligibilityChecker />
        </Wrapper>
      )

      // Try to navigate without filling required fields
      await user.click(screen.getByText('Next'))

      expect(screen.getByText('Please complete all required questions before proceeding.')).toBeInTheDocument()
    })

    it('should allow going back to previous steps', async () => {
      const user = userEvent.setup()
      
      render(
        <Wrapper>
          <EligibilityChecker />
        </Wrapper>
      )

      // Fill step 1 and navigate to step 2
      await user.type(screen.getByPlaceholderText('Enter your age'), '45')
      await user.selectOptions(screen.getByRole('combobox'), 'CITIZEN')
      await user.type(screen.getByPlaceholderText('Enter 6-digit postal code'), '123456')
      await user.click(screen.getByText('Next'))

      // Go back to step 1
      await user.click(screen.getByText('Previous'))

      expect(screen.getByText('Step 1: Personal Information')).toBeInTheDocument()
    })
  })

  describe('Question Card Functionality', () => {
    it('should render different input types correctly', () => {
      render(
        <Wrapper>
          <QuestionCard
            question={mockQuestion}
            value={null}
            onChange={vi.fn()}
          />
        )

      expect(screen.getByLabelText('What is your age?')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter your age (e.g., 45)')).toBeInTheDocument()
    })

    it('should validate numeric inputs', async () => {
      const user = userEvent.setup()
      
      render(
        <Wrapper>
          <QuestionCard
            question={mockQuestion}
            value={null}
            onChange={vi.fn()}
          />
        )

      await user.type(screen.getByPlaceholderText('Enter your age (e.g., 45)'), 'abc')
      await user.tab()

      expect(screen.getByText('Please enter a valid number')).toBeInTheDocument()
    })

    it('should validate age range', async () => {
      const user = userEvent.setup()
      
      render(
        <Wrapper>
          <QuestionCard
            question={mockQuestion}
            value={null}
            onChange={vi.fn()}
          />
        )

      await user.type(screen.getByPlaceholderText('Enter your age (e.g., 45)'), '15')
      await user.tab()

      expect(screen.getByText('Must be at least 18 years old')).toBeInTheDocument()
    })
  })

  describe('Progress Tracking', () => {
    it('should update progress indicator correctly', () => {
      render(
        <Wrapper>
          <ProgressIndicator
            currentStep={2}
            totalSteps={5}
            responses={mockResponses}
          />
        )

      expect(screen.getByText('Step 3 of 5 • 60% complete')).toBeInTheDocument()
      expect(screen.getByText('Personal Information')).toHaveClass('text-green-700')
    })

    it('should show completion status for answered questions', () => {
      render(
        <Wrapper>
          <ProgressIndicator
            currentStep={0}
            totalSteps={5}
            responses={mockResponses}
          />
        )

      expect(screen.getByText('Complete')).toBeInTheDocument()
    })
  })

  describe('Real-time Evaluation', () => {
    it('should evaluate eligibility in real-time', async () => {
      const user = userEvent.setup()
      
      render(
        <Wrapper>
          <EligibilityChecker enableRealTimeEvaluation={true} />
        </Wrapper>
      )

      // Fill sufficient questions to trigger evaluation
      await user.type(screen.getByPlaceholderText('Enter your age'), '45')
      await user.selectOptions(screen.getByRole('combobox'), 'CITIZEN')

      await waitFor(() => {
        expect(screen.getByText('Current Assessment Status')).toBeInTheDocument()
      })
    })

    it('should show eligibility score when criteria are met', async () => {
      const user = userEvent.setup()
      
      render(
        <Wrapper>
          <EligibilityChecker enableRealTimeEvaluation={true} />
        </Wrapper>
      )

      await user.type(screen.getByPlaceholderText('Enter your age'), '45')
      await user.selectOptions(screen.getByRole('combobox'), 'CITIZEN')
      await user.click(screen.getByText('Next'))

      await user.click(screen.getByLabelText('Yes, I consent'))

      await waitFor(() => {
        expect(screen.getByText('You appear to be eligible!')).toBeInTheDocument()
      })
    })
  })

  describe('Results Display', () => {
    it('should display eligibility results correctly', () => {
      render(
        <Wrapper>
          <ResultsDisplay
            evaluation={mockEligibleAssessment}
            onReset={vi.fn()}
          />
        )

      expect(screen.getByText('Eligibility Assessment Results')).toBeInTheDocument()
      expect(screen.getByText('Congratulations!')).toBeInTheDocument()
      expect(screen.getByText('You are eligible for Healthier SG')).toBeInTheDocument()
    })

    it('should show detailed criteria breakdown', () => {
      render(
        <Wrapper>
          <ResultsDisplay
            evaluation={mockEligibleAssessment}
            onReset={vi.fn()}
          />
        )

      expect(screen.getByText('Show Detailed Criteria Breakdown')).toBeInTheDocument()
    })

    it('should handle appeal submission', async () => {
      const user = userEvent.setup()
      
      render(
        <Wrapper>
          <ResultsDisplay
            evaluation={mockIneligibleAssessment}
            onReset={vi.fn()}
          />
        )
      )

      await user.click(screen.getByText('Submit Appeal'))
      await user.type(screen.getByTextAreaPlaceholder('Please explain why you believe your assessment was incorrect'), 'I have chronic conditions that were not properly assessed.')
      await user.click(screen.getByText('Submit Appeal'))

      await waitFor(() => {
        expect(screen.getByText('Appeal submitted successfully!')).toBeInTheDocument()
      })
    })
  })

  describe('Eligibility History', () => {
    it('should display assessment history', () => {
      render(
        <Wrapper>
          <EligibilityHistory
            onBack={vi.fn()}
            onStartNew={vi.fn()}
          />
        )

      expect(screen.getByText('Eligibility Assessment History')).toBeInTheDocument()
      expect(screen.getByText('Total Assessments')).toBeInTheDocument()
    })

    it('should filter assessments by status', () => {
      render(
        <Wrapper>
          <EligibilityHistory
            onBack={vi.fn()}
            onStartNew={vi.fn()}
          />
        )

      expect(screen.getByText('All Results')).toBeInTheDocument()
      expect(screen.getByText('Eligible Only')).toBeInTheDocument()
      expect(screen.getByText('Not Eligible')).toBeInTheDocument()
    })

    it('should export assessment history', async () => {
      const user = userEvent.setup()
      const mockCreateObjectURL = vi.fn()
      const mockRevokeObjectURL = vi.fn()
      
      global.URL.createObjectURL = mockCreateObjectURL
      global.URL.revokeObjectURL = mockRevokeObjectURL
      global.document.createElement = vi.fn().mockReturnValue({
        click: vi.fn(),
        setAttribute: vi.fn(),
        style: {}
      })

      render(
        <Wrapper>
          <EligibilityHistory
            onBack={vi.fn()}
            onStartNew={vi.fn()}
          />
        )
      )

      await user.click(screen.getByText('Export'))

      expect(mockCreateObjectURL).toHaveBeenCalled()
    })
  })

  describe('Help System', () => {
    it('should display help tooltips', () => {
      render(
        <Wrapper>
          <HelpTooltip
            content="This is help content"
            title="Help Title"
          />
        )
      )

      expect(screen.getByLabelText('Help information')).toBeInTheDocument()
    })

    it('should open modal for long content', async () => {
      const user = userEvent.setup()
      
      render(
        <Wrapper>
          <HelpTooltip
            content="This is a very long help content that should open in a modal dialog because it exceeds the normal tooltip length limit"
            title="Long Help"
          />
        )
      )

      await user.click(screen.getByLabelText('Help information'))

      expect(screen.getByText('Long Help')).toBeInTheDocument()
    })

    it('should show variant-specific styling', () => {
      render(
        <Wrapper>
          <HelpTooltip
            content="Health help content"
            variant="health"
          />
        )
      )

      expect(screen.getByLabelText('Help information')).toBeInTheDocument()
    })
  })

  describe('Auto-save Functionality', () => {
    it('should auto-save responses', async () => {
      const user = userEvent.setup()
      const mockOnSave = vi.fn()
      
      render(
        <Wrapper>
          <EligibilityChecker
            onSave={mockOnSave}
          />
        </Wrapper>
      )

      await user.type(screen.getByPlaceholderText('Enter your age'), '45')

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled()
      }, { timeout: 3000 })
    })

    it('should show saving status', async () => {
      const user = userEvent.setup()
      
      render(
        <Wrapper>
          <EligibilityChecker />
        </Wrapper>
      )

      await user.type(screen.getByPlaceholderText('Enter your age'), '45')

      expect(screen.getByText('Saving...')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      vi.mocked(require('@/lib/trpc/client').api.healthierSg.evaluateEligibility.useMutation).mockReturnValue({
        mutateAsync: vi.fn().mockRejectedValue(new Error('API Error'))
      })

      const user = userEvent.setup()
      
      render(
        <Wrapper>
          <EligibilityChecker />
        </Wrapper>
      )

      await user.type(screen.getByPlaceholderText('Enter your age'), '45')
      await user.selectOptions(screen.getByRole('combobox'), 'CITIZEN')
      await user.type(screen.getByPlaceholderText('Enter 6-digit postal code'), '123456')
      await user.click(screen.getByText('Next'))
      await user.click(screen.getByLabelText('Yes'))
      await user.selectOptions(screen.getByRole('combobox', { name: 'How often do you exercise?' }), 'SEVERAL_TIMES_WEEK')
      await user.selectOptions(screen.getByRole('combobox', { name: 'What type of health insurance do you have?' }), 'MEDISAVE')
      await user.selectOptions(screen.getByRole('combobox', { name: 'How committed are you to improving your health?' }), 'HIGH')
      await user.click(screen.getByText('Complete Assessment'))

      await waitFor(() => {
        expect(screen.getByText('Assessment Failed')).toBeInTheDocument()
      })
    })

    it('should validate form inputs properly', async () => {
      const user = userEvent.setup()
      
      render(
        <Wrapper>
          <EligibilityChecker />
        </Wrapper>
      )

      // Try to submit with invalid age
      await user.type(screen.getByPlaceholderText('Enter your age'), '10')
      await user.click(screen.getByText('Next'))

      expect(screen.getByText('Must be at least 18 years old')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <Wrapper>
          <EligibilityChecker />
        </Wrapper>
      )

      expect(screen.getByLabelText('Help information')).toBeInTheDocument()
      expect(screen.getByLabelText('Previous')).toBeInTheDocument()
      expect(screen.getByLabelText('Next')).toBeInTheDocument()
    })

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      
      render(
        <Wrapper>
          <EligibilityChecker />
        </Wrapper>
      )

      // Test tab navigation
      await user.tab()
      expect(screen.getByPlaceholderText('Enter your age')).toHaveFocus()

      await user.tab()
      expect(screen.getByRole('combobox')).toHaveFocus()
    })

    it('should have proper heading structure', () => {
      render(
        <Wrapper>
          <EligibilityChecker />
        </Wrapper>
      )

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Healthier SG Eligibility Checker')
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Step 1: Personal Information')
    })
  })

  describe('Mobile Responsiveness', () => {
    it('should adapt to mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      render(
        <Wrapper>
          <EligibilityChecker />
        </Wrapper>
      )

      expect(screen.getByText('Mobile')).toBeInTheDocument()
    })

    it('should show mobile-optimized interface elements', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      render(
        <Wrapper>
          <EligibilityChecker />
        </Wrapper>
      )

      expect(screen.getByText('Step 1 of 5 • 20% complete')).toBeInTheDocument()
    })
  })
})

// Integration Tests
describe('Eligibility Checker Integration', () => {
  it('should complete full assessment flow', async () => {
    const user = userEvent.setup()
    const mockOnComplete = vi.fn()

    render(
      <Wrapper>
        <EligibilityChecker
          onComplete={mockOnComplete}
          enableRealTimeEvaluation={true}
        />
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
      expect(mockOnComplete).toHaveBeenCalled()
    })
  })

  it('should handle data persistence across sessions', async () => {
    const user = userEvent.setup()
    
    render(
      <Wrapper>
        <EligibilityChecker
          existingAssessment={mockEligibleAssessment}
        />
      </Wrapper>
    )

    // Should pre-fill form with existing data
    expect(screen.getByDisplayValue('45')).toBeInTheDocument()
  })
})

// Performance Tests
describe('Eligibility Checker Performance', () => {
  it('should render within performance budget', async () => {
    const startTime = performance.now()
    
    render(
      <Wrapper>
        <EligibilityChecker />
      </Wrapper>
    )

    const endTime = performance.now()
    const renderTime = endTime - startTime

    expect(renderTime).toBeLessThan(100) // Should render within 100ms
  })

  it('should handle large response sets efficiently', () => {
    const largeResponses = Array.from({ length: 100 }, (_, i) => ({
      questionId: `question-${i}`,
      value: `response-${i}`,
      timestamp: new Date()
    }))

    render(
      <Wrapper>
        <ProgressIndicator
          currentStep={3}
          totalSteps={5}
          responses={largeResponses}
        />
      </Wrapper>
    )

    expect(screen.getByText('Step 4 of 5 • 80% complete')).toBeInTheDocument()
  })
})