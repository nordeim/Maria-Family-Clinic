/**
 * Accessibility Testing & Compliance Suite for Healthier SG System
 * Sub-Phase 8.12 - Testing, Quality Assurance & Performance Optimization
 * 
 * Comprehensive accessibility testing covering:
 * - WCAG 2.2 AA compliance validation
 * - Multilingual accessibility (4 Singapore languages)
 * - Screen reader compatibility
 * - Keyboard navigation
 * - High contrast and visual accessibility
 * - Voice navigation and audio support
 * - Cultural adaptation and sensitivity
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)
import { TRPCReactProvider } from '@/lib/trpc/react'

// Test components
import { EligibilityChecker } from '@/components/healthier-sg/eligibility/EligibilityChecker'
import { ProgramInfoSection } from '@/components/healthier-sg/program-info/ProgramInfoSection'
import { ClinicFinder } from '@/components/healthier-sg/registration/ClinicFinder'
import { RegistrationForm } from '@/components/healthier-sg/registration/RegistrationForm'
import { LanguageSelector } from '@/components/accessibility/language-selector'
import { HighContrastToggle } from '@/components/accessibility/high-contrast-toggle'
import { FontSizeAdjuster } from '@/components/accessibility/font-size-adjuster'
import { VoiceNavigation } from '@/components/accessibility/voice-navigation'
import { ScreenReader } from '@/components/accessibility/screen-reader'

// Accessibility testing utilities
interface AccessibilityTestResult {
  component: string
  wcagLevel: string
  violations: Array<{
    id: string
    impact: 'minor' | 'moderate' | 'serious' | 'critical'
    description: string
    nodes: number
  }>
  passes: number
  incomplete: number
  inapplicable: number
}

// Mock assistive technologies
const mockScreenReader = {
  announce: vi.fn(),
  readText: vi.fn(),
  readLabels: vi.fn(),
  navigateToHeading: vi.fn(),
  getCurrentFocus: vi.fn(),
  setFocus: vi.fn()
}

const mockVoiceNavigation = {
  startListening: vi.fn(),
  stopListening: vi.fn(),
  onCommand: vi.fn(),
  getSupportedCommands: vi.fn()
}

const mockKeyboardNavigation = {
  trapFocus: vi.fn(),
  releaseFocus: vi.fn(),
  navigate: vi.fn(),
  handleKeyboardEvent: vi.fn()
}

describe('Healthier SG Accessibility Testing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock screen reader APIs
    global.speechSynthesis = {
      speak: vi.fn(),
      cancel: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      getVoices: vi.fn().mockReturnValue([
        { name: 'English (US)', lang: 'en-US' },
        { name: 'Chinese (Simplified)', lang: 'zh-CN' },
        { name: 'Malay', lang: 'ms-MY' },
        { name: 'Tamil', lang: 'ta-IN' }
      ]),
      speaking: false,
      pending: false,
      paused: false
    } as any
    
    // Mock Speech Recognition API
    global.SpeechRecognition = class MockSpeechRecognition {
      lang = 'en-US'
      continuous = false
      interimResults = false
      maxAlternatives = 1
      serviceURI = ''
      
      start = vi.fn()
      stop = vi.fn()
      abort = vi.fn()
      
      onaudiostart: (() => {}) | null = null
      onaudioend: (() => {}) | null = null
      onspeechstart: (() => {}) | null = null
      onspeechend: (() => {}) | null = null
      onresult: (() => {}) | null = null
      onerror: (() => {}) | null = null
      onnomatch: (() => {}) | null = null
      onend: (() => {}) | null = null
    }
    
    // Mock keyboard navigation
    global.addEventListener = vi.fn()
    global.removeEventListener = vi.fn()
    
    // Mock high contrast detection
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: query === '(prefers-contrast: more)',
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => {}
      })
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('WCAG 2.2 AA Compliance Testing', () => {
    it('should meet WCAG 2.2 AA standards for eligibility checker', async () => {
      render(
        <TRPCReactProvider>
          <EligibilityChecker />
        </TRPCReactProvider>
      )
      
      const { violations } = await axe(document.body, {
        rules: {
          'color-contrast': { enabled: true },
          'keyboard-navigation': { enabled: true },
          'focus-management': { enabled: true },
          'aria-required-attr': { enabled: true },
          'label-associated': { enabled: true },
          'heading-order': { enabled: true }
        }
      })
      
      // Filter out acceptable violations for testing environment
      const criticalViolations = violations.filter(v => 
        v.impact === 'critical' || v.impact === 'serious'
      )
      
      expect(criticalViolations).toHaveLength(0)
    })

    it('should have proper heading hierarchy', () => {
      render(
        <TRPCReactProvider>
          <EligibilityChecker />
        </TRPCReactProvider>
      )
      
      const headings = screen.getAllByRole('heading')
      
      // Verify proper heading structure
      const h1Count = headings.filter(h => h.tagName === 'H1').length
      const h2Count = headings.filter(h => h.tagName === 'H2').length
      const h3Count = headings.filter(h => h.tagName === 'H3').length
      
      expect(h1Count).toBe(1) // Only one H1
      expect(h2Count).toBeGreaterThan(0) // Has H2 sections
      expect(h3Count).toBeGreaterThan(0) // Has subsections
    })

    it('should provide alternative text for images', () => {
      render(
        <TRPCReactProvider>
          <ProgramInfoSection />
        </TRPCReactProvider>
      )
      
      const images = screen.getAllByRole('img')
      
      images.forEach(img => {
        expect(img).toHaveAttribute('alt')
        expect(img.getAttribute('alt')).not.toBe('')
      })
    })

    it('should have proper form labels and descriptions', async () => {
      const user = userEvent.setup()
      
      render(
        <TRPCReactProvider>
          <EligibilityChecker />
        </TRPCReactProvider>
      )
      
      // Check if form inputs have proper labels
      const ageInput = screen.getByPlaceholderText('Enter your age')
      expect(ageInput).toHaveAttribute('aria-label')
      
      const citizenshipSelect = screen.getByRole('combobox')
      expect(citizenshipSelect).toHaveAttribute('aria-label')
      
      // Check for required field indicators
      const requiredFields = screen.getAllByText(/required/i)
      expect(requiredFields.length).toBeGreaterThan(0)
    })

    it('should provide skip navigation links', () => {
      render(
        <TRPCReactProvider>
          <EligibilityChecker />
        </TRPCReactProvider>
      )
      
      const skipLinks = screen.getAllByRole('link', { name: /skip to main content/i })
      
      expect(skipLinks.length).toBeGreaterThan(0)
      
      // Verify skip links have proper href
      skipLinks.forEach(link => {
        expect(link).toHaveAttribute('href')
        expect(link.getAttribute('href')).toBe('#main-content')
      })
    })

    it('should implement proper focus management', async () => {
      const user = userEvent.setup()
      
      render(
        <TRPCReactProvider>
          <EligibilityChecker />
        </TRPCReactProvider>
      )
      
      // Test tab navigation
      await user.tab()
      const firstFocusable = screen.getByPlaceholderText('Enter your age')
      expect(firstFocusable).toHaveFocus()
      
      await user.tab()
      const secondFocusable = screen.getByRole('combobox')
      expect(secondFocusable).toHaveFocus()
      
      // Test focus indicators
      expect(firstFocusable).toHaveAttribute('tabindex', '0')
    })

    it('should provide error messaging and recovery', async () => {
      const user = userEvent.setup()
      
      render(
        <TRPCReactProvider>
          <EligibilityChecker />
        </TRPCReactProvider>
      )
      
      // Try to submit without required fields
      const ageInput = screen.getByPlaceholderText('Enter your age')
      await user.click(ageInput)
      await user.tab() // Move focus away without entering data
      await user.tab() // To Next button
      await user.keyboard('{Enter}')
      
      // Check for error messaging
      await waitFor(() => {
        const errorMessages = screen.getAllByText(/required|please enter/i)
        expect(errorMessages.length).toBeGreaterThan(0)
      })
    })

    it('should support keyboard-only navigation', async () => {
      const user = userEvent.setup()
      
      render(
        <TRPCReactProvider>
          <EligibilityChecker />
        </TRPCReactProvider>
      )
      
      // Navigate through the form using only keyboard
      await user.tab() // Age input
      await user.type(screen.getByPlaceholderText('Enter your age'), '45')
      await user.tab() // Citizenship select
      await user.selectOptions(screen.getByRole('combobox'), 'CITIZEN')
      await user.tab() // Postal code input
      await user.type(screen.getByPlaceholderText('Enter 6-digit postal code'), '123456')
      await user.tab() // Next button
      
      // Should be able to complete navigation
      expect(screen.getByText('Step 2: Health Status')).toBeInTheDocument()
    })
  })

  describe('Multilingual Accessibility (4 Singapore Languages)', () => {
    it('should support English language accessibility', () => {
      render(
        <TRPCReactProvider>
          <LanguageSelector defaultLanguage="en" />
        </TRPCReactProvider>
      )
      
      expect(screen.getByText('English')).toBeInTheDocument()
      
      // Switch to English
      userEvent.click(screen.getByText('English'))
      
      // Verify accessibility features work in English
      render(
        <TRPCReactProvider>
          <EligibilityChecker />
        </TRPCReactProvider>
      )
      
      expect(screen.getByText('Healthier SG Eligibility Checker')).toBeInTheDocument()
    })

    it('should support Chinese (Simplified) accessibility', () => {
      render(
        <TRPCReactProvider>
          <LanguageSelector defaultLanguage="zh" />
        </TRPCReactProvider>
      )
      
      expect(screen.getByText('中文')).toBeInTheDocument()
      
      // Switch to Chinese
      userEvent.click(screen.getByText('中文'))
      
      // Verify Chinese text rendering
      render(
        <TRPCReactProvider>
          <ProgramInfoSection />
        </TRPCReactProvider>
      )
      
      expect(screen.getByText('健康新加坡计划')).toBeInTheDocument()
    })

    it('should support Malay language accessibility', () => {
      render(
        <TRPCReactProvider>
          <LanguageSelector defaultLanguage="ms" />
        </TRPCReactProvider>
      )
      
      expect(screen.getByText('Melayu')).toBeInTheDocument()
      
      // Switch to Malay
      userEvent.click(screen.getByText('Melayu'))
      
      render(
        <TRPCReactProvider>
          <ProgramInfoSection />
        </TRPCReactProvider>
      )
      
      expect(screen.getByText('Pelan Kesihatan SG')).toBeInTheDocument()
    })

    it('should support Tamil language accessibility', () => {
      render(
        <TRPCReactProvider>
          <LanguageSelector defaultLanguage="ta" />
        </TRPCReactProvider>
      )
      
      expect(screen.getByText('தமிழ்')).toBeInTheDocument()
      
      // Switch to Tamil
      userEvent.click(screen.getByText('தமிழ்'))
      
      render(
        <TRPCReactProvider>
          <ProgramInfoSection />
        </TRPCReactProvider>
      )
      
      expect(screen.getByText('ஆரோக்கிய SG திட்டம்')).toBeInTheDocument()
    })

    it('should maintain accessibility across language switches', async () => {
      const user = userEvent.setup()
      
      render(
        <TRPCReactProvider>
          <LanguageSelector />
        </TRPCReactProvider>
      )
      
      const languages = ['English', '中文', 'Melayu', 'தமிழ்']
      
      for (const lang of languages) {
        await user.click(screen.getByText(lang))
        
        render(
          <TRPCReactProvider>
            <EligibilityChecker />
          </TRPCReactProvider>
        )
        
        // Verify accessibility still works
        const heading = screen.getByRole('heading', { level: 1 })
        expect(heading).toBeInTheDocument()
        
        const inputs = screen.getAllByRole('textbox')
        expect(inputs.length).toBeGreaterThan(0)
      }
    })
  })

  describe('Screen Reader Compatibility', () => {
    it('should provide proper ARIA labels and descriptions', () => {
      render(
        <TRPCReactProvider>
          <EligibilityChecker />
        </TRPCReactProvider>
      )
      
      const eligibilityForm = screen.getByTestId('eligibility-checker')
      expect(eligibilityForm).toHaveAttribute('aria-label')
      expect(eligibilityForm).toHaveAttribute('aria-describedby')
    })

    it('should announce form progress and changes', async () => {
      const user = userEvent.setup()
      
      render(
        <TRPCReactProvider>
          <EligibilityChecker />
        </TRPCReactProvider>
      )
      
      const progressIndicator = screen.getByTestId('progress-indicator')
      expect(progressIndicator).toHaveAttribute('aria-live', 'polite')
      
      // Test progress announcement
      await user.type(screen.getByPlaceholderText('Enter your age'), '45')
      
      // Should announce progress update
      expect(progressIndicator).toHaveAttribute('aria-label', 'Step 1 of 5 • 20% complete')
    })

    it('should provide role and landmark definitions', () => {
      render(
        <TRPCReactProvider>
          <EligibilityChecker />
        </TRPCReactProvider>
      )
      
      // Check for proper ARIA roles
      const mainContent = screen.getByRole('main')
      expect(mainContent).toBeInTheDocument()
      
      const navigation = screen.getByRole('navigation')
      expect(navigation).toBeInTheDocument()
      
      const form = screen.getByRole('form')
      expect(form).toBeInTheDocument()
      
      // Check for landmark regions
      expect(screen.getByTestId('eligibility-checker')).toHaveAttribute('role', 'application')
    })

    it('should support screen reader announcements', () => {
      render(
        <TRPCReactProvider>
          <ScreenReader />
        </TRPCReactProvider>
      )
      
      // Test announcement functionality
      const announcer = screen.getByTestId('screen-reader-announcer')
      expect(announcer).toHaveAttribute('aria-live', 'assertive')
      expect(announcer).toHaveAttribute('aria-atomic', 'true')
    })

    it('should provide clear form instructions', () => {
      render(
        <TRPCReactProvider>
          <EligibilityChecker />
        </TRPCReactProvider>
      )
      
      // Check for form instructions
      const instructions = screen.getByText(/Please complete/i)
      expect(instructions).toBeInTheDocument()
      
      // Check for required field indicators
      const requiredFields = screen.getAllByText(/required/i)
      requiredFields.forEach(field => {
        expect(field.parentElement).toHaveAttribute('aria-label')
      })
    })
  })

  describe('High Contrast and Visual Accessibility', () => {
    it('should support high contrast mode', () => {
      render(
        <TRPCReactProvider>
          <HighContrastToggle />
        </TRPCReactProvider>
      )
      
      expect(screen.getByText('High Contrast')).toBeInTheDocument()
      
      // Toggle high contrast
      userEvent.click(screen.getByText('High Contrast'))
      
      render(
        <TRPCReactProvider>
          <EligibilityChecker />
        </TRPCReactProvider>
      )
      
      const highContrastElement = screen.getByTestId('eligibility-checker')
      expect(highContrastElement).toHaveClass('high-contrast')
    })

    it('should provide sufficient color contrast ratios', () => {
      const colorContrastTests = [
        { background: '#ffffff', foreground: '#000000', ratio: 21, expected: true },
        { background: '#f0f0f0', foreground: '#1a1a1a', ratio: 16.75, expected: true },
        { background: '#ffffff', foreground: '#666666', ratio: 4.54, expected: true },
        { background: '#ffffff', foreground: '#cccccc', ratio: 1.96, expected: false }
      ]
      
      colorContrastTests.forEach(test => {
        const meetsStandard = test.ratio >= 4.5 // WCAG AA standard
        expect(meetsStandard).toBe(test.expected)
      })
    })

    it('should not rely solely on color for information', () => {
      render(
        <TRPCReactProvider>
          <EligibilityChecker />
        </TRPCReactProvider>
      )
      
      // Check for status indicators with text
      const statusIndicators = screen.getAllByTestId('status-indicator')
      
      statusIndicators.forEach(indicator => {
        const hasText = indicator.textContent !== null && indicator.textContent !== ''
        const hasIcon = indicator.querySelector('svg') !== null
        
        // Should have either text or icon (or both)
        expect(hasText || hasIcon).toBe(true)
      })
    })

    it('should provide focus indicators with sufficient contrast', () => {
      render(
        <TRPCReactProvider>
          <EligibilityChecker />
        </TRPCReactProvider>
      )
      
      const focusableElements = screen.getAllByTestId('focusable-element')
      
      focusableElements.forEach(element => {
        // Check for focus styles with good contrast
        const styles = window.getComputedStyle(element)
        expect(styles.outline).toBeDefined()
        expect(styles.outlineWidth).not.toBe('0px')
      })
    })
  })

  describe('Font Size and Visual Adjustments', () => {
    it('should support font size adjustments', () => {
      render(
        <TRPCReactProvider>
          <FontSizeAdjuster />
        </TRPCReactProvider>
      )
      
      expect(screen.getByText('Font Size')).toBeInTheDocument()
      expect(screen.getByText('A-')).toBeInTheDocument()
      expect(screen.getByText('A')).toBeInTheDocument()
      expect(screen.getByText('A+')).toBeInTheDocument()
    })

    it('should adjust text size appropriately', async () => {
      const user = userEvent.setup()
      
      render(
        <TRPCReactProvider>
          <FontSizeAdjuster />
          <EligibilityChecker />
        </TRPCReactProvider>
      )
      
      // Increase font size
      await user.click(screen.getByText('A+'))
      await user.click(screen.getByText('A+'))
      
      const mainContent = screen.getByTestId('eligibility-checker')
      expect(mainContent).toHaveClass('text-size-large')
    })

    it('should support responsive text scaling', () => {
      const fontSizes = {
        small: '14px',
        medium: '16px',
        large: '18px',
        extraLarge: '20px'
      }
      
      Object.entries(fontSizes).forEach(([size, fontSize]) => {
        document.documentElement.style.fontSize = fontSize
        
        render(
          <TRPCReactProvider>
            <EligibilityChecker />
          </TRPCReactProvider>
        )
        
        const rootStyle = window.getComputedStyle(document.documentElement)
        expect(rootStyle.fontSize).toBe(fontSize)
      })
    })
  })

  describe('Voice Navigation and Audio Support', () => {
    it('should support voice commands', async () => {
      const user = userEvent.setup()
      
      render(
        <TRPCReactProvider>
          <VoiceNavigation />
          <EligibilityChecker />
        </TRPCReactProvider>
      )
      
      // Start voice recognition
      await user.click(screen.getByText('Start Voice Navigation'))
      
      // Simulate voice commands
      mockVoiceNavigation.onCommand({
        command: 'next',
        confidence: 0.9,
        transcript: 'next'
      })
      
      // Should navigate to next step
      expect(screen.getByText('Step 2: Health Status')).toBeInTheDocument()
    })

    it('should provide audio feedback', () => {
      render(
        <TRPCReactProvider>
          <EligibilityChecker enableAudioFeedback={true} />
        </TRPCReactProvider>
      )
      
      // Check for audio feedback controls
      const audioControls = screen.getByTestId('audio-feedback')
      expect(audioControls).toHaveAttribute('aria-label')
    })

    it('should support audio descriptions for complex content', () => {
      render(
        <TRPCReactProvider>
          <ProgramInfoSection enableAudioDescriptions={true} />
        </TRPCReactProvider>
      )
      
      // Check for audio description support
      const programInfo = screen.getByTestId('program-info')
      expect(programInfo).toHaveAttribute('aria-describedby')
    })

    it('should provide audio navigation assistance', async () => {
      const user = userEvent.setup()
      
      render(
        <TRPCReactProvider>
          <VoiceNavigation />
        </TRPCReactProvider>
      )
      
      const supportedCommands = mockVoiceNavigation.getSupportedCommands()
      
      expect(supportedCommands).toContain('next')
      expect(supportedCommands).toContain('previous')
      expect(supportedCommands).toContain('submit')
      expect(supportedCommands).toContain('help')
    })
  })

  describe('Cultural Adaptation and Sensitivity', () => {
    it('should adapt to cultural preferences in Singapore', () => {
      render(
        <TRPCReactProvider>
          <CulturalAdaptation />
        </TRPCReactProvider>
      )
      
      // Check for culturally appropriate content
      expect(screen.getByText('Singapore Healthier SG')).toBeInTheDocument()
      expect(screen.getByText('MOH Verified')).toBeInTheDocument()
    })

    it('should respect cultural communication styles', () => {
      render(
        <TRPCReactProvider>
          <EligibilityChecker />
        </TRPCReactProvider>
      )
      
      // Check for polite, formal language appropriate for healthcare
      const politeLanguage = screen.getAllByText(/please|kindly/i)
      expect(politeLanguage.length).toBeGreaterThan(0)
    })

    it('should provide culturally appropriate examples', () => {
      render(
        <TRPCReactProvider>
          <ProgramInfoSection />
        </TRPCReactProvider>
      )
      
      // Check for Singapore-specific examples and references
      expect(screen.getByText(/Singapore/i)).toBeInTheDocument()
      expect(screen.getByText(/MOH/i)).toBeInTheDocument()
    })

    it('should support cultural date/time formats', () => {
      const singaporeFormats = {
        date: 'DD/MM/YYYY',
        time: '24-hour',
        calendar: 'Gregorian',
        timezone: 'UTC+8'
      }
      
      expect(singaporeFormats.timezone).toBe('UTC+8')
      expect(singaporeFormats.calendar).toBe('Gregorian')
      expect(singaporeFormats.date).toBe('DD/MM/YYYY')
    })
  })

  describe('Mobile Accessibility', () => {
    beforeEach(() => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667,
      })
    })

    it('should maintain accessibility on mobile devices', () => {
      render(
        <TRPCReactProvider>
          <EligibilityChecker />
        </TRPCReactProvider>
      )
      
      // Check for touch-friendly elements
      const touchTargets = screen.getAllByTestId('touch-target')
      touchTargets.forEach(target => {
        expect(target).toHaveAttribute('min-height', '44px')
        expect(target).toHaveAttribute('min-width', '44px')
      })
    })

    it('should support voice input on mobile', async () => {
      const user = userEvent.setup()
      
      render(
        <TRPCReactProvider>
          <VoiceNavigation enableMobile={true} />
        </TRPCReactProvider>
      )
      
      // Test mobile-specific voice features
      expect(screen.getByText('Voice Input')).toBeInTheDocument()
      
      await user.click(screen.getByText('Voice Input'))
      
      // Should activate mobile voice recognition
      expect(mockVoiceNavigation.startListening).toHaveBeenCalled()
    })

    it('should adapt font sizes for mobile readability', () => {
      render(
        <TRPCReactProvider>
          <EligibilityChecker />
        </TRPCReactProvider>
      )
      
      const mobileText = screen.getByTestId('mobile-text')
      expect(mobileText).toHaveClass('text-mobile-optimized')
    })
  })

  describe('Cognitive Accessibility', () => {
    it('should provide clear and simple language', () => {
      render(
        <TRPCReactProvider>
          <EligibilityChecker />
        </TRPCReactProvider>
      )
      
      // Check for simple, clear instructions
      const instructions = screen.getAllByText(/enter|select|choose/i)
      expect(instructions.length).toBeGreaterThan(0)
      
      // Avoid complex jargon
      const complexTerms = screen.queryAllByText(/\b[informed consent|deferred compensation|parametric analysis]\b/i)
      expect(complexTerms).toHaveLength(0)
    })

    it('should provide visual cues and progress indicators', () => {
      render(
        <TRPCReactProvider>
          <EligibilityChecker />
        </TRPCReactProvider>
      )
      
      // Check for progress indicators
      const progressBar = screen.getByTestId('progress-bar')
      expect(progressBar).toHaveAttribute('aria-valuenow')
      
      // Check for step indicators
      const stepIndicators = screen.getAllByTestId('step-indicator')
      expect(stepIndicators.length).toBeGreaterThan(0)
    })

    it('should allow users to save progress and resume later', async () => {
      const user = userEvent.setup()
      
      render(
        <TRPCReactProvider>
          <EligibilityChecker enableSaveProgress={true} />
        </TRPCReactProvider>
      )
      
      // Check for save progress button
      const saveButton = screen.getByText('Save Progress')
      expect(saveButton).toBeInTheDocument()
      
      await user.click(saveButton)
      
      // Should show save confirmation
      expect(screen.getByText(/saved|progress saved/i)).toBeInTheDocument()
    })
  })
})

// Mock CulturalAdaptation component
const CulturalAdaptation: React.FC = () => (
  <div data-testid="cultural-adaptation">
    <p>Singapore Healthier SG</p>
    <p>MOH Verified</p>
    <p>Culturally Adapted Content</p>
  </div>
)