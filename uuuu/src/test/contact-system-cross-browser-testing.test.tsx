/**
 * Cross-Browser Compatibility and Mobile Testing Suite
 * Sub-Phase 9.10 - Testing, Quality Assurance & Performance Optimization
 * 
 * Covers:
 * - Cross-browser compatibility testing (Chrome, Firefox, Safari, Edge)
 * - Mobile device testing (iOS, Android)
 * - Responsive design testing
 * - Progressive Web App (PWA) compatibility
 * - Touch interaction testing
 * - Performance on mobile devices
 */

import { describe, it, expect, beforeEach, afterEach, vi, beforeAll } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Test utilities
import { createTRPCMock } from '@/test/mock-trpc'

// Contact system components
import { ContactFormContainer } from '@/components/forms/contact-form-container'
import { ContactFormProvider } from '@/components/forms/contact-form-provider'

// Browser and device simulation
interface BrowserInfo {
  name: string
  version: string
  userAgent: string
  engine: string
  features: string[]
}

interface DeviceInfo {
  name: string
  type: 'mobile' | 'tablet' | 'desktop'
  os: 'iOS' | 'Android' | 'Windows' | 'macOS'
  screenSize: { width: number; height: number }
  pixelRatio: number
  touchSupport: boolean
  features: string[]
}

class BrowserSimulator {
  private browserInfo: BrowserInfo
  private deviceInfo: DeviceInfo

  constructor(browserInfo: BrowserInfo, deviceInfo: DeviceInfo) {
    this.browserInfo = browserInfo
    this.deviceInfo = deviceInfo
  }

  simulate(): void {
    // Set user agent
    Object.defineProperty(navigator, 'userAgent', {
      writable: true,
      value: this.browserInfo.userAgent,
    })

    // Set screen dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: this.deviceInfo.screenSize.width,
    })
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: this.deviceInfo.screenSize.height,
    })

    // Set device pixel ratio
    Object.defineProperty(window, 'devicePixelRatio', {
      writable: true,
      value: this.deviceInfo.pixelRatio,
    })

    // Set touch support
    if (this.deviceInfo.touchSupport) {
      // Add touch event support
      document.addEventListener = vi.fn().mockImplementation((event, handler) => {
        // Simulate touch events for testing
        return originalAddEventListener.call(document, event, handler)
      })
    }

    // Mock browser-specific features
    this.mockBrowserFeatures()
  }

  private mockBrowserFeatures(): void {
    // Mock different browser APIs based on browser type
    switch (this.browserInfo.name) {
      case 'Chrome':
      case 'Edge':
        this.mockBlinkFeatures()
        break
      case 'Firefox':
        this.mockGeckoFeatures()
        break
      case 'Safari':
        this.mockWebKitFeatures()
        break
    }
  }

  private mockBlinkFeatures(): void {
    // Mock Chrome/Edge specific features
    globalThis.navigator = {
      ...globalThis.navigator,
      language: 'en-US',
      languages: ['en-US', 'en'],
    } as Navigator
  }

  private mockGeckoFeatures(): void {
    // Mock Firefox specific features
    globalThis.navigator = {
      ...globalThis.navigator,
      language: 'en-US',
      languages: ['en-US', 'en'],
    } as Navigator
  }

  private mockWebKitFeatures(): void {
    // Mock Safari specific features
    globalThis.navigator = {
      ...globalThis.navigator,
      language: 'en-US',
      languages: ['en-US', 'en'],
      vendor: 'Apple Computer, Inc.',
    } as Navigator
  }

  getBrowserInfo(): BrowserInfo {
    return { ...this.browserInfo }
  }

  getDeviceInfo(): DeviceInfo {
    return { ...this.deviceInfo }
  }
}

describe('Contact System Cross-Browser Compatibility & Mobile Testing', () => {
  let mockTRPC: ReturnType<typeof createTRPCMock>
  let browserSimulator: BrowserSimulator

  const browsers: BrowserInfo[] = [
    {
      name: 'Chrome',
      version: '120.0.6099',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      engine: 'Blink',
      features: ['WebGL', 'WebRTC', 'Service Workers', 'CSS Grid', 'Flexbox'],
    },
    {
      name: 'Firefox',
      version: '120.0.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
      engine: 'Gecko',
      features: ['WebGL', 'WebRTC', 'Service Workers', 'CSS Grid', 'Flexbox'],
    },
    {
      name: 'Safari',
      version: '17.1.1',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1.1 Safari/605.1.15',
      engine: 'WebKit',
      features: ['WebGL', 'CSS Grid', 'Flexbox'],
    },
    {
      name: 'Edge',
      version: '120.0.2210.72',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
      engine: 'Blink',
      features: ['WebGL', 'WebRTC', 'Service Workers', 'CSS Grid', 'Flexbox'],
    },
  ]

  const devices: DeviceInfo[] = [
    // Mobile devices
    {
      name: 'iPhone SE',
      type: 'mobile',
      os: 'iOS',
      screenSize: { width: 375, height: 667 },
      pixelRatio: 2,
      touchSupport: true,
      features: ['Touch', 'Mobile Safari'],
    },
    {
      name: 'Samsung Galaxy S21',
      type: 'mobile',
      os: 'Android',
      screenSize: { width: 360, height: 800 },
      pixelRatio: 3,
      touchSupport: true,
      features: ['Touch', 'Chrome Mobile'],
    },
    {
      name: 'Google Pixel 7',
      type: 'mobile',
      os: 'Android',
      screenSize: { width: 412, height: 915 },
      pixelRatio: 2.625,
      touchSupport: true,
      features: ['Touch', 'Chrome Mobile'],
    },
    // Tablet devices
    {
      name: 'iPad',
      type: 'tablet',
      os: 'iOS',
      screenSize: { width: 768, height: 1024 },
      pixelRatio: 2,
      touchSupport: true,
      features: ['Touch', 'iPad Safari'],
    },
    {
      name: 'Samsung Galaxy Tab',
      type: 'tablet',
      os: 'Android',
      screenSize: { width: 800, height: 1280 },
      pixelRatio: 2,
      touchSupport: true,
      features: ['Touch', 'Chrome Mobile'],
    },
    // Desktop
    {
      name: 'Windows Desktop',
      type: 'desktop',
      os: 'Windows',
      screenSize: { width: 1920, height: 1080 },
      pixelRatio: 1,
      touchSupport: false,
      features: ['Mouse', 'Keyboard'],
    },
    {
      name: 'macOS Desktop',
      type: 'desktop',
      os: 'macOS',
      screenSize: { width: 2560, height: 1440 },
      pixelRatio: 2,
      touchSupport: false,
      features: ['Mouse', 'Keyboard'],
    },
  ]

  beforeAll(() => {
    mockTRPC = createTRPCMock()
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    // Reset window properties
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: window.innerWidth,
    })
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      value: window.innerHeight,
    })
  })

  describe('1. Cross-Browser Compatibility', () => {
    describe('1.1 Modern Browser Support', () => {
      browsers.forEach((browser) => {
        describe(`Testing on ${browser.name} ${browser.version}`, () => {
          beforeEach(() => {
            browserSimulator = new BrowserSimulator(browser, devices[5]) // Windows Desktop
            browserSimulator.simulate()
          })

          it(`should render correctly in ${browser.name}`, async () => {
            const user = userEvent.setup()
            
            render(
              <TRPCReactProvider>
                <ContactFormProvider>
                  <ContactFormContainer />
                </ContactFormProvider>
              </TRPCReactProvider>
            )

            // Basic form should render
            expect(screen.getByLabelText('Name')).toBeInTheDocument()
            expect(screen.getByLabelText('Email')).toBeInTheDocument()
            expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()

            // Form functionality should work
            await user.type(screen.getByLabelText('Name'), 'Test User')
            await user.type(screen.getByLabelText('Email'), 'test@example.com')
            await user.selectOptions(screen.getByLabelText('Category'), 'general')
            await user.type(screen.getByLabelText('Message'), 'Test message')

            expect(screen.getByLabelText('Name')).toHaveValue('Test User')
            expect(screen.getByLabelText('Email')).toHaveValue('test@example.com')

            // Form submission should work
            await user.click(screen.getByRole('button', { name: /submit/i }))

            // Should either submit or show validation errors
            expect(
              screen.getByText(/form submitted/i) || 
              screen.getByText(/consent is required/i) ||
              screen.getByText(/required/i)
            ).toBeInTheDocument()
          })

          it(`should support CSS Grid and Flexbox in ${browser.name}`, () => {
            // Check if browser supports modern CSS features
            const supportsGrid = browser.features.includes('CSS Grid')
            const supportsFlexbox = browser.features.includes('Flexbox')

            if (supportsGrid) {
              // Grid layout should work
              const form = screen.getByRole('form')
              const styles = window.getComputedStyle(form)
              expect(
                styles.display === 'grid' ||
                form.querySelector('[style*="display: grid"]') ||
                form.querySelector('[class*="grid"]')
              ).toBe(true)
            }

            if (supportsFlexbox) {
              // Flexbox layout should work
              const form = screen.getByRole('form')
              const styles = window.getComputedStyle(form)
              expect(
                styles.display === 'flex' ||
                form.querySelector('[style*="display: flex"]') ||
                form.querySelector('[class*="flex"]')
              ).toBe(true)
            }
          })

          it(`should handle JavaScript features in ${browser.name}`, async () => {
            // Test ES6+ features
            const user = userEvent.setup()
            
            render(
              <TRPCReactProvider>
                <ContactFormProvider>
                  <ContactFormContainer />
                </ContactFormProvider>
              </TRPCReactProvider>
            )

            // Test async/await support
            await user.selectOptions(screen.getByLabelText('Category'), 'general')
            expect(screen.getByLabelText('Category')).toHaveValue('general')

            // Test arrow functions and modern JS features should work
            // (This is implicit in the component rendering and user interactions)
            expect(screen.getByLabelText('Name')).toBeInTheDocument()
          })
        })
      })
    })

    describe('1.2 CSS Compatibility', () => {
      browsers.forEach((browser) => {
        it(`should handle CSS features correctly in ${browser.name}`, () => {
          browserSimulator = new BrowserSimulator(browser, devices[5]) // Windows Desktop
          browserSimulator.simulate()

          render(
            <TRPCReactProvider>
              <ContactFormProvider>
                <ContactFormContainer />
              </ContactFormProvider>
            </TRPCReactProvider>
 )

          // Test CSS custom properties (CSS variables)
          const root = document.documentElement
          const computedStyles = window.getComputedStyle(root)
          expect(computedStyles).toBeDefined()

          // Test modern CSS features
          const form = screen.getByRole('form')
          const formStyles = window.getComputedStyle(form)
          expect(formStyles).toBeDefined()
          
          // Should not have layout issues
          expect(form.offsetWidth).toBeGreaterThan(0)
          expect(form.offsetHeight).toBeGreaterThan(0)
        })
      })
    })

    describe('1.3 API Compatibility', () => {
      browsers.forEach((browser) => {
        it(`should work with browser APIs in ${browser.name}`, () => {
          browserSimulator = new BrowserSimulator(browser, devices[5])
          browserSimulator.simulate()

          render(
            <TRPCReactProvider>
              <ContactFormProvider>
                <ContactFormContainer />
              </ContactFormProvider>
            </TRPCReactProvider>
 )

          // Test localStorage availability
          expect(typeof localStorage).toBe('object')
          expect(typeof sessionStorage).toBe('object')

          // Test fetch API
          expect(typeof fetch).toBe('function')

          // Test modern JavaScript APIs
          if (browser.features.includes('Service Workers')) {
            expect(typeof navigator.serviceWorker).toBe('object')
          }

          // Test Geolocation API (if available)
          if (navigator.geolocation) {
            expect(typeof navigator.geolocation.getCurrentPosition).toBe('function')
          }
        })
      })
    })
  })

  describe('2. Mobile Device Testing', () => {
    describe('2.1 iOS Devices', () => {
      devices.filter(d => d.os === 'iOS').forEach((device) => {
        describe(`Testing on ${device.name}`, () => {
          beforeEach(() => {
            browserSimulator = new BrowserSimulator(browsers[2], device) // Safari on iOS
            browserSimulator.simulate()
          })

          it(`should work correctly on ${device.name}`, async () => {
            const user = userEvent.setup()
            
            render(
              <TRPCReactProvider>
                <ContactFormProvider>
                  <ContactFormContainer />
                </ContactFormProvider>
              </TRPCReactProvider>
            )

            // Mobile-specific features should be enabled
            expect(screen.getByText(/mobile optimized/i) || screen.getByLabelText('Name')).toBeInTheDocument()

            // Touch interactions should work
            const nameInput = screen.getByLabelText('Name')
            fireEvent.touchStart(nameInput)
            fireEvent.focus(nameInput)

            // Form filling should work
            await user.type(nameInput, 'Test User')
            expect(nameInput).toHaveValue('Test User')

            // Mobile keyboard should appear (simulated)
            const emailInput = screen.getByLabelText('Email')
            fireEvent.touchStart(emailInput)
            expect(emailInput).toHaveFocus()
          })

          it(`should handle touch gestures on ${device.name}`, async () => {
            render(
              <TRPCReactProvider>
                <ContactFormProvider>
                  <ContactFormContainer />
                </ContactFormProvider>
              </TRPCReactProvider>
 )

            // Test touch events on form elements
            const formFields = screen.getAllByRole('textbox')
            
            formFields.forEach(field => {
              // Touch start should focus field
              fireEvent.touchStart(field)
              expect(field).toHaveAttribute('tabindex', '0')
            })

            // Test scroll behavior
            const form = screen.getByRole('form')
            fireEvent.touchStart(form, { touches: [{ clientX: 0, clientY: 100 }] })
            fireEvent.touchMove(form, { touches: [{ clientX: 0, clientY: 150 }] })
            fireEvent.touchEnd(form)

            // Form should remain functional
            expect(screen.getByLabelText('Name')).toBeInTheDocument()
          })
        })
      })
    })

    describe('2.2 Android Devices', () => {
      devices.filter(d => d.os === 'Android').forEach((device) => {
        describe(`Testing on ${device.name}`, () => {
          beforeEach(() => {
            browserSimulator = new BrowserSimulator(browsers[0], device) // Chrome on Android
            browserSimulator.simulate()
          })

          it(`should work correctly on ${device.name}`, async () => {
            const user = userEvent.setup()
            
            render(
              <TRPCReactProvider>
                <ContactFormProvider>
                  <ContactFormContainer />
                </ContactFormProvider>
              </TRPCReactProvider>
 )

            // Android-specific optimizations
            expect(screen.getByText(/android optimized/i) || screen.getByLabelText('Name')).toBeInTheDocument()

            // Form functionality
            await user.type(screen.getByLabelText('Name'), 'Test User')
            await user.type(screen.getByLabelText('Email'), 'test@example.com')
            await user.selectOptions(screen.getByLabelText('Category'), 'general')
            await user.type(screen.getByLabelText('Message'), 'Android test')

            // Verify form state
            expect(screen.getByLabelText('Name')).toHaveValue('Test User')
            expect(screen.getByLabelText('Email')).toHaveValue('test@example.com')
          })

          it(`should handle Android browser quirks on ${device.name}`, () => {
            render(
              <TRPCReactProvider>
                <ContactFormProvider>
                  <ContactFormContainer />
                </ContactFormProvider>
              </TRPCReactProvider>
 )

            // Check viewport meta tag
            const viewportMeta = document.querySelector('meta[name="viewport"]')
            expect(viewportMeta).toBeInTheDocument()
            expect(viewportMeta?.getAttribute('content')).toMatch(/width=device-width/)

            // Check for proper mobile styling
            const form = screen.getByRole('form')
            const styles = window.getComputedStyle(form)
            expect(styles.overflow).not.toBe('hidden')
          })
        })
      })
    })
  })

  describe('3. Responsive Design Testing', () => {
    describe('3.1 Breakpoint Testing', () => {
      const breakpoints = [
        { name: 'Mobile', width: 320, height: 568 },
        { name: 'Tablet', width: 768, height: 1024 },
        { name: 'Desktop', width: 1920, height: 1080 },
      ]

      breakpoints.forEach((breakpoint) => {
        it(`should be responsive at ${breakpoint.name} breakpoint (${breakpoint.width}x${breakpoint.height})`, () => {
          // Set screen size
          Object.defineProperty(window, 'innerWidth', {
            writable: true,
            value: breakpoint.width,
          })
          Object.defineProperty(window, 'innerHeight', {
            writable: true,
            value: breakpoint.height,
          })

          render(
            <TRPCReactProvider>
              <ContactFormProvider>
                <ContactFormContainer />
              </ContactFormProvider>
            </TRPCReactProvider>
          )

          const form = screen.getByRole('form')
          const formContainer = form.parentElement

          // Check that form is visible and not overflowing
          expect(form.offsetWidth).toBeLessThanOrEqual(breakpoint.width)
          expect(formContainer?.scrollWidth).toBeLessThanOrEqual(breakpoint.width)

          // Check for proper responsive behavior
          if (breakpoint.width < 768) {
            // Mobile: form should be stacked
            const formFields = screen.getAllByRole('textbox')
            formFields.forEach(field => {
              const styles = window.getComputedStyle(field)
              expect(styles.width).toBe(`${breakpoint.width}px` || styles.width)
            })
          } else {
            // Desktop: form can be multi-column
            expect(screen.getByRole('form')).toBeInTheDocument()
          }
        })
      })
    })

    describe('3.2 Orientation Testing', () => {
      const orientations = [
        { name: 'Portrait', width: 375, height: 812 },
        { name: 'Landscape', width: 812, height: 375 },
      ]

      orientations.forEach((orientation) => {
        it(`should work in ${orientation.name} orientation`, async () => {
          const user = userEvent.setup()
          
          // Set screen size for orientation
          Object.defineProperty(window, 'innerWidth', {
            writable: true,
            value: orientation.width,
          })
          Object.defineProperty(window, 'innerHeight', {
            writable: true,
            value: orientation.height,
          })

          render(
            <TRPCReactProvider>
              <ContactFormProvider>
                <ContactFormContainer />
              </ContactFormProvider>
            </TRPCReactProvider>
          )

          // Form should be usable in both orientations
          const nameInput = screen.getByLabelText('Name')
          await user.type(nameInput, 'Test User')
          expect(nameInput).toHaveValue('Test User')

          const form = screen.getByRole('form')
          expect(form.offsetWidth).toBeLessThanOrEqual(orientation.width)
          expect(form.offsetHeight).toBeLessThanOrEqual(orientation.height)
        })
      })
    })
  })

  describe('4. Touch Interaction Testing', () => {
    devices.filter(d => d.touchSupport).forEach((device) => {
      it(`should support touch interactions on ${device.name}`, async () => {
        browserSimulator = new BrowserSimulator(browsers[0], device) // Chrome on mobile
        browserSimulator.simulate()

        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer />
            </ContactFormProvider>
          </TRPCReactProvider>
 )

        // Test touch interactions
        const nameInput = screen.getByLabelText('Name')
        
        // Touch to focus
        fireEvent.touchStart(nameInput, {
          touches: [{ clientX: 0, clientY: 0 }],
        })
        expect(nameInput).toHaveFocus()

        // Simulate typing via touch (mobile keyboards)
        fireEvent.keyDown(nameInput, { key: 'T', code: 'KeyT' })
        fireEvent.keyDown(nameInput, { key: 'e', code: 'KeyE' })
        fireEvent.keyDown(nameInput, { key: 's', code: 'KeyS' })
        fireEvent.keyDown(nameInput, { key: 't', code: 'KeyT' })

        // Verify input received touch input
        expect(nameInput).toHaveValue('Test')
      })

      it(`should handle multi-touch gestures on ${device.name}`, () => {
        browserSimulator = new BrowserSimulator(browsers[0], device)
        browserSimulator.simulate()

        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer />
            </ContactFormProvider>
          </TRPCReactProvider>
 )

        const form = screen.getByRole('form')

        // Simulate pinch gesture for zoom
        fireEvent.touchStart(form, {
          touches: [
            { clientX: 100, clientY: 100 },
            { clientX: 200, clientY: 200 },
          ],
        })

        fireEvent.touchMove(form, {
          touches: [
            { clientX: 110, clientY: 110 },
            { clientX: 190, clientY: 190 },
          ],
        })

        // Form should remain functional
        expect(screen.getByLabelText('Name')).toBeInTheDocument()
      })
    })
  })

  describe('5. Performance Testing on Mobile', () => {
    devices.filter(d => d.type === 'mobile').forEach((device) => {
      it(`should perform well on ${device.name}`, async () => {
        const startTime = performance.now()
        
        browserSimulator = new BrowserSimulator(browsers[0], device)
        browserSimulator.simulate()

        render(
          <TRPCReactProvider>
            <ContactFormProvider>
              <ContactFormContainer />
            </ContactFormProvider>
          </TRPCReactProvider>
 )

        const renderTime = performance.now() - startTime

        // Should render within reasonable time on mobile
        expect(renderTime).toBeLessThan(1000) // 1 second max
      })
    })
  })

  describe('6. Progressive Web App (PWA) Compatibility', () => {
    it('should support PWA features across browsers', () => {
      // Test service worker registration
      if ('serviceWorker' in navigator) {
        expect(typeof navigator.serviceWorker.register).toBe('function')
      }

      // Test manifest file
      const manifest = document.querySelector('link[rel="manifest"]')
      expect(manifest).toBeInTheDocument()

      // Test viewport meta tag for PWA
      const viewport = document.querySelector('meta[name="viewport"]')
      expect(viewport).toBeInTheDocument()
      expect(viewport?.getAttribute('content')).toContain('user-scalable=no')
    })

    it('should work offline if service worker is implemented', () => {
      // Mock offline scenario
      const originalFetch = globalThis.fetch
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network Error'))

      render(
        <TRPCReactProvider>
          <ContactFormProvider>
            <ContactFormContainer />
          </ContactFormProvider>
        </TRPCReactProvider>
 )

      // Should handle offline gracefully
      const form = screen.getByRole('form')
      expect(form).toBeInTheDocument()

      // Restore fetch
      globalThis.fetch = originalFetch
    })
  })
})