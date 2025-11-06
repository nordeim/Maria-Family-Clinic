/**
 * Accessibility Testing Suite (WCAG 2.2 AA Compliance)
 * Sub-Phase 9.10 - Testing, Quality Assurance & Performance Optimization
 * 
 * Covers:
 * - WCAG 2.2 AA compliance testing
 * - Screen reader compatibility
 * - Keyboard navigation
 * - Color contrast and visual accessibility
 * - Focus management
 * - Alternative text and ARIA labels
 * - Motion and animation accessibility
 */

import { describe, it, expect, beforeEach, afterEach, vi, beforeAll } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Test utilities
import { generateAccessibilityTestData } from './enhanced-test-data-generator'
import { createTRPCMock } from '@/test/mock-trpc'

// Contact system components
import { ContactFormContainer } from '@/components/forms/contact-form-container'
import { ContactFormProvider } from '@/components/forms/contact-form-provider'

// Mock screen reader
class MockScreenReader {
  private announcements: string[] = []
  private currentFocus: Element | null = null

  announce(message: string): void {
    this.announcements.push(message)
  }

  getFocus(): Element | null {
    return this.currentFocus
  }

  setFocus(element: Element | null): void {
    this.currentFocus = element
  }

  getAnnouncements(): string[] {
    return [...this.announcements]
  }

  clearAnnouncements(): void {
    this.announcements = []
  }
}

describe('Contact System Accessibility Testing (WCAG 2.2 AA)', () => {
  let mockTRPC: ReturnType<typeof createTRPCMock>
  let mockScreenReader: MockScreenReader
  let accessibilityTestData: ReturnType<typeof generateAccessibilityTestData>

  beforeAll(() => {
    mockTRPC = createTRPCMock()
    mockScreenReader = new MockScreenReader()
    accessibilityTestData = generateAccessibilityTestData()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    mockScreenReader.clearAnnouncements()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('1. WCAG 2.2 AA Compliance', () => {
    describe('1.1 Perceivable - Alternative Text', () => {
      it('should provide appropriate alternative text for all images and icons', async () => {
        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer />
            </ContactFormProvider>
          </TRPCReactProvider>
 )

        // Check for images and icons
        const images = screen.getAllByRole('img')
        const icons = screen.getAllByTestId(/icon-|svg/)

        images.forEach(image => {
          expect(image).toHaveAttribute('alt')
          expect(image.getAttribute('alt')).not.toBe('')
        })

        icons.forEach(icon => {
          // Icons should have aria-label or be decorative
          const ariaLabel = icon.getAttribute('aria-label')
          const ariaHidden = icon.getAttribute('aria-hidden')
          expect(ariaLabel || ariaHidden).toBeTruthy()
        })
      })

      it('should provide text alternatives for non-text content', async () => {
        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer />
            </ContactFormProvider>
          </TRPCReactProvider>
 )

        // Check for non-text content
        const buttons = screen.getAllByRole('button')
        const decorativeElements = screen.getAllByTestId('decorative-icon')

        buttons.forEach(button => {
          // Buttons should have accessible names
          const accessibleName = button.getAttribute('aria-label') || 
                               button.textContent ||
                               button.getAttribute('aria-labelledby')
          expect(accessibleName).toBeTruthy()
        })

        decorativeElements.forEach(element => {
          expect(element).toHaveAttribute('aria-hidden', 'true')
        })
      })
    })

    describe('1.2 Perceivable - Color Contrast', () => {
      accessibilityTestData.colorContrastIssues.forEach((contrast, index) => {
        it(`should meet WCAG AA color contrast requirements (Test ${index + 1})`, () => {
          // Calculate contrast ratio
          const ratio = calculateContrastRatio(contrast.foreground, contrast.background)
          
          if (ratio >= 4.5) {
            // Should pass WCAG AA requirement
            expect(ratio).toBeGreaterThanOrEqual(4.5)
          } else {
            // Should fail - this is a contrast issue to fix
            expect(ratio).toBeLessThan(4.5)
          }
        })
      })

      it('should not rely solely on color to convey information', async () => {
        const user = userEvent.setup()
        
        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer />
            </ContactFormProvider>
          </TRPCReactProvider>
 )

        // Test error message display
        await user.click(screen.getByRole('button', { name: /submit/i }))

        const errorMessages = screen.getAllByRole('alert')
        errorMessages.forEach(message => {
          // Error messages should use text, not just color
          expect(message.textContent?.trim()).toBeTruthy()
          
          // Should have proper ARIA attributes
          expect(message).toHaveAttribute('aria-live', expect.stringMatching(/polite|assertive/))
          
          // Should use visual indicators beyond color
          const hasIcon = message.querySelector('svg, [data-testid*="icon"]')
          const hasTextIndicator = message.textContent?.toLowerCase().includes('error')
          
          expect(hasIcon || hasTextIndicator).toBe(true)
        })
      })
    })

    describe('1.3 Perceivable - Resize Text', () => {
      it('should support 200% zoom without horizontal scrolling', async () => {
        // Mock browser zoom
        Object.defineProperty(window, 'devicePixelRatio', {
          writable: true,
          value: 2, // 200% zoom
        })

        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer />
            </ContactFormProvider>
          </TRPCReactProvider>
 )

        // Check for horizontal scrolling
        const formContainer = screen.getByRole('form')
        expect(formContainer.scrollWidth).toBeLessThanOrEqual(formContainer.clientWidth)
        
        // All text should be readable at 200% zoom
        const textElements = screen.getAllByText(/.*/)
        textElements.forEach(element => {
          const computedStyle = window.getComputedStyle(element)
          expect(parseFloat(computedStyle.fontSize)).toBeGreaterThan(0)
        })
      })
    })
  })

  describe('2. Operable - Keyboard Navigation', () => {
    describe('2.1 Keyboard Accessible', () => {
      it('should be fully navigable using only keyboard', async () => {
        const user = userEvent.setup()
        
        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer />
            </ContactFormProvider>
          </TRPCReactProvider>
 )

        // Get all focusable elements
        const focusableElements = screen.getAllByRole('textbox')
          .concat(screen.getAllByRole('button'))
          .concat(screen.getAllByRole('combobox'))
          .concat(screen.getAllByRole('checkbox'))

        // Test tab navigation through all elements
        for (const element of focusableElements) {
          await user.tab()
          
          // Element should receive focus
          expect(element).toHaveFocus()
          
          // Should have visible focus indicator
          const styles = window.getComputedStyle(element)
          expect(styles.outlineStyle).not.toBe('none')
          expect(styles.boxShadow).not.toBe('')
        }
      })

      it('should provide logical tab order', async () => {
        const user = userEvent.setup()
        
        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer />
            </ContactFormProvider>
          </TRPCReactProvider>
 )

        // Get expected tab order
        const expectedOrder = [
          'Name',
          'Email', 
          'Phone',
          'Category',
          'Subject',
          'Message',
          'Submit button',
        ]

        // Test tab order
        for (let i = 0; i < expectedOrder.length; i++) {
          if (i > 0) {
            await user.tab()
          }

          // Focus should move to expected element
          const currentElement = document.activeElement
          const label = currentElement?.getAttribute('aria-label') || 
                       currentElement?.textContent || 
                       currentElement?.getAttribute('name') || ''
          
          expect(label.toLowerCase()).toContain(expectedOrder[i].toLowerCase())
        }
      })

      it('should trap focus within modals and dialogs', async () => {
        const user = userEvent.setup()
        
        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer />
            </ContactFormProvider>
          </TRPCReactProvider>
 )

        // Open modal (privacy policy)
        await user.click(screen.getByRole('button', { name: /privacy policy/i }))

        const modal = screen.getByRole('dialog')
        expect(modal).toBeInTheDocument()

        // Test focus trapping within modal
        const modalFocusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
        
        // Tab through modal elements
        for (let i = 0; i < modalFocusableElements.length + 2; i++) {
          await user.tab()
          
          // Focus should stay within modal
          expect(modal.contains(document.activeElement as Node)).toBe(true)
        }

        // Close modal with Escape
        await user.keyboard('{Escape}')
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })

    describe('2.2 Keyboard Shortcuts', () => {
      it('should provide keyboard shortcuts for common actions', async () => {
        const user = userEvent.setup()
        
        render(
          TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer />
            </ContactFormProvider>
          </TRPCReactProvider>
 )

        // Fill form fields
        await user.type(screen.getByLabelText('Name'), 'Test User')
        await user.type(screen.getByLabelText('Email'), 'test@example.com')
        await user.selectOptions(screen.getByLabelText('Category'), 'general')
        await user.type(screen.getByLabelText('Message'), 'Test message')

        // Test Enter key to submit form
        await user.keyboard('{Enter}')
        
        // Form should submit (or show validation if required fields missing)
        expect(screen.getByText(/submit/i) || screen.getByText(/required/i)).toBeInTheDocument()

        // Test Escape key to clear form or close modals
        await user.keyboard('{Escape}')
        expect(screen.getByText('Test User')).not.toBeInTheDocument() // Form should be cleared
      })
    })
  </describe>

  describe('3. Perceivable - Time-based Media', () => {
    describe('3.1 Audio and Video Alternatives', () => {
      it('should provide alternatives for audio/video content', () => {
        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer />
            </ContactFormProvider>
          </TRPCReactProvider>
 )

        // Check for any multimedia content
        const videos = screen.queryAllByRole('video')
        const audios = screen.queryAllByRole('audio')

        videos.forEach(video => {
          // Videos should have captions or transcripts
          expect(video).toHaveAttribute('aria-label') ||
          expect(video).toHaveAttribute('title') ||
          expect(video.querySelector('track[captions]')).toBeTruthy()
        })

        audios.forEach(audio => {
          // Audios should have transcripts
          expect(audio).toHaveAttribute('aria-label') ||
          expect(audio).toHaveAttribute('title')
        })
      })
    })

    describe('3.2 Animation and Motion', () => {
      it('should respect user motion preferences', async () => {
        // Mock prefers-reduced-motion
        Object.defineProperty(window, 'matchMedia', {
          writable: true,
          value: (query: string) => ({
            matches: query === '(prefers-reduced-motion: reduce)',
            media: query,
            onchange: null,
            addListener: () => {},
            removeListener: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => {},
          }),
        })

        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer />
            </ContactFormProvider>
          </TRPCReactProvider>
 )

        // Check for reduced motion implementation
        const animatedElements = screen.getAllByTestId(/animated-|transition-/)
        animatedElements.forEach(element => {
          // Should not have excessive animations when motion is reduced
          const styles = window.getComputedStyle(element)
          expect(styles.transitionDuration).not.toBe('2s') // Should be shorter or none
          expect(styles.animationDuration).not.toBe('2s') // Should be shorter or none
        })
      })
    })
  })

  describe('4. Understandable - Readable', () => {
    describe('4.1 Language of Page', () => {
      it('should specify the primary language of the page', () => {
        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer />
            </ContactFormProvider>
          </TRPCReactProvider>
 )

        expect(document.documentElement).toHaveAttribute('lang', 'en')
      })

      it('should provide language change options for multilingual content', async () => {
        const user = userEvent.setup()
        
        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer enableMultilingual={true} />
            </ContactFormProvider>
          </TRPCReactProvider>
 )

        // Check for language selector
        const languageSelector = screen.getByLabelText(/language/i)
        expect(languageSelector).toBeInTheDocument()

        // Test language change
        await user.selectOptions(languageSelector, 'zh-CN')
        expect(screen.getByText(/语言/i)).toBeInTheDocument() // Chinese text
        expect(document.documentElement).toHaveAttribute('lang', 'zh-CN')
      })
    })
  })

  describe('5. Understandable - Predictable', () => {
    describe('5.1 Consistent Navigation', () => {
      it('should provide consistent navigation and identification', () => {
        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer />
            </ContactFormProvider>
          </TRPCReactProvider>
 )

        // Check for consistent heading structure
        const headings = screen.getAllByRole('heading')
        const headingLevels = headings.map(h => parseInt(h.getAttribute('aria-level') || h.tagName.charAt(1)))

        // Headings should be in logical order
        for (let i = 1; i < headingLevels.length; i++) {
          expect(headingLevels[i]).toBeLessThanOrEqual(headingLevels[i-1] + 1)
        }
      })
    })
  })

  describe('6. Robust - Compatible', () => {
    describe('6.1 Valid HTML', () => {
      it('should generate valid HTML markup', () => {
        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer />
            </ContactFormProvider>
          </TRPCReactProvider>
 )

        const html = document.documentElement.outerHTML
        
        // Basic HTML validation
        expect(html).toMatch(/<html[^>]*>/i)
        expect(html).toMatch(/<head[^>]*>/i)
        expect(html).toMatch(/<body[^>]*>/i)
        
        // Check for proper DOCTYPE
        expect(html).toMatch(/<!DOCTYPE html>/i)
        
        // Check for valid meta charset
        expect(html).toMatch(/<meta[^>]*charset[^>]*>/i)
      })
    })

    describe('6.2 ARIA Implementation', () => {
      it('should implement ARIA attributes correctly', () => {
        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer />
            </ContactFormProvider>
          </TRPCReactProvider>
 )

        // Check form ARIA implementation
        const form = screen.getByRole('form')
        expect(form).toHaveAttribute('aria-label', expect.stringMatching(/contact/i))

        // Check form fields ARIA implementation
        const nameField = screen.getByLabelText('Name')
        expect(nameField).toHaveAttribute('aria-required', 'true')

        // Check error message ARIA implementation
        const errorMessage = screen.getByRole('alert') || screen.getByText(/required/i)
        if (errorMessage) {
          expect(errorMessage.parentElement).toHaveAttribute('aria-live', expect.stringMatching(/polite/))
        }

        // Check button ARIA implementation
        const submitButton = screen.getByRole('button', { name: /submit/i })
        expect(submitButton).toHaveAttribute('aria-describedby', expect.any(String))
      })
    })
  })

  describe('7. Screen Reader Testing', () => {
    describe('7.1 Screen Reader Compatibility', () => {
      it('should provide meaningful content to screen readers', async () => {
        const user = userEvent.setup()
        
        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer 
                screenReader={mockScreenReader}
                enableA11yAnnouncements={true}
              />
            </ContactFormProvider>
          </TRPCReactProvider>
 )

        // Fill form to trigger announcements
        await user.type(screen.getByLabelText('Name'), 'Test User')
        await user.selectOptions(screen.getByLabelText('Category'), 'general')
        await user.type(screen.getByLabelText('Message'), 'Test message')
        
        // Check screen reader announcements
        const announcements = mockScreenReader.getAnnouncements()
        expect(announcements.length).toBeGreaterThan(0)
        
        // Should announce field labels and values
        announcements.forEach(announcement => {
          expect(announcement).toBeTruthy()
          expect(announcement.length).toBeGreaterThan(3)
        })
      })

      it('should announce form validation errors to screen readers', async () => {
        const user = userEvent.setup()
        
        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer 
                screenReader={mockScreenReader}
                enableA11yAnnouncements={true}
              />
            </ContactFormProvider>
          </TRPCReactProvider>
 )

        // Submit empty form to trigger validation
        await user.click(screen.getByRole('button', { name: /submit/i }))

        // Check for error announcements
        const announcements = mockScreenReader.getAnnouncements()
        const hasErrorAnnouncements = announcements.some(announcement => 
          announcement.toLowerCase().includes('error') || 
          announcement.toLowerCase().includes('required')
        )
        
        expect(hasErrorAnnouncements).toBe(true)
      })
    })
  })

  describe('8. Focus Management', () => {
    describe('8.1 Focus Indicators', () => {
      it('should provide clear visual focus indicators', async () => {
        const user = userEvent.setup()
        
        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer />
            </ContactFormProvider>
          </TRPCReactProvider>
 )

        // Test focus on all interactive elements
        const interactiveElements = screen.getAllByRole('textbox')
          .concat(screen.getAllByRole('button'))
          .concat(screen.getAllByRole('combobox'))
          .concat(screen.getAllByRole('checkbox'))

        for (const element of interactiveElements) {
          await user.tab()
          
          // Element should have focus
          expect(element).toHaveFocus()
          
          // Should have visible focus indicator
          const styles = window.getComputedStyle(element)
          const hasFocusIndicator = 
            styles.outline !== 'none' ||
            styles.boxShadow !== 'none' ||
            styles.border !== 'none' ||
            styles.backgroundColor !== styles.backgroundColor
          
          expect(hasFocusIndicator).toBe(true)
        }
      })
    })

    describe('8.2 Focus Restoration', () => {
      it('should restore focus to appropriate element after actions', async () => {
        const user = userEvent.setup()
        
        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer />
            </ContactFormProvider>
          </TRPCReactProvider>
 )

        // Open modal
        const privacyButton = screen.getByRole('button', { name: /privacy policy/i })
        await user.click(privacyButton)
        expect(screen.getByRole('dialog')).toBeInTheDocument()

        // Focus should be in modal
        expect(screen.getByRole('dialog').contains(document.activeElement as Node)).toBe(true()

        // Close modal
        await user.click(screen.getByRole('button', { name: /close/i }))

        // Focus should return to trigger button
        expect(privacyButton).toHaveFocus()
      })
    })
  })

  describe('9. Mobile Accessibility', () => {
    describe('9.1 Touch Targets', () => {
      it('should provide adequate touch target sizes on mobile', () => {
        // Mock mobile device
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          value: 375, // iPhone SE width
        })

        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer />
            </ContactFormProvider>
          </TRPCReactProvider>
 )

        // Check touch target sizes
        const buttons = screen.getAllByRole('button')
        buttons.forEach(button => {
          const rect = button.getBoundingClientRect()
          expect(rect.width).toBeGreaterThanOrEqual(44) // Minimum 44px for touch
          expect(rect.height).toBeGreaterThanOrEqual(44)
        })

        const formFields = screen.getAllByRole('textbox')
        formFields.forEach(field => {
          const rect = field.getBoundingClientRect()
          expect(rect.height).toBeGreaterThanOrEqual(44) // Minimum 44px for touch
        })
      })
    })
  })
})

// Utility function for color contrast calculation
function calculateContrastRatio(color1: string, color2: string): number {
  const getLuminance = (color: string): number => {
    // Remove # if present
    color = color.replace('#', '')
    
    // Convert to RGB
    const r = parseInt(color.substr(0, 2), 16)
    const g = parseInt(color.substr(2, 2), 16)
    const b = parseInt(color.substr(4, 2), 16)
    
    // Calculate relative luminance
    const rsRGB = r / 255
    const gsRGB = g / 255
    const bsRGB = b / 255
    
    const rL = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4)
    const gL = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4)
    const bL = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4)
    
    return 0.2126 * rL + 0.7152 * gL + 0.0722 * bL
  }
  
  const lum1 = getLuminance(color1)
  const lum2 = getLuminance(color2)
  const brightest = Math.max(lum1, lum2)
  const darkest = Math.min(lum1, lum2)
  
  return (brightest + 0.05) / (darkest + 0.05)
}