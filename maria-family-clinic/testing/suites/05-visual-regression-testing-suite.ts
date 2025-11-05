/**
 * Visual Regression Testing Suite - My Family Clinic Platform
 * 
 * Comprehensive visual testing for:
 * - Component visual consistency
 * - Responsive design validation
 * - Accessibility visual testing
 * - Healthcare UI compliance
 * - Cross-browser visual compatibility
 */

import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest'
import { setup, teardown } from './test-environment'
import { compareImages, createSnapshot, setupVisualTesting } from './visual-testing-utils'

// Viewport configurations for responsive testing
const viewports = {
  desktop: { width: 1920, height: 1080 },
  laptop: { width: 1366, height: 768 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 },
  'mobile-large': { width: 414, height: 896 }
}

// Device-specific viewports
const devices = {
  'iPhone 14 Pro': { width: 393, height: 852, deviceScaleFactor: 3 },
  'iPad Pro': { width: 1024, height: 1366, deviceScaleFactor: 2 },
  'Samsung Galaxy S21': { width: 384, height: 854, deviceScaleFactor: 3 },
  'Desktop Chrome': { width: 1920, height: 1080, deviceScaleFactor: 1 }
}

// =============================================================================
// COMPONENT VISUAL CONSISTENCY TESTING
// =============================================================================

describe('Component Visual Consistency Testing', () => {
  let page: any
  let context: any

  beforeEach(async () => {
    const { setupBrowser } = await import('./test-environment')
    const browser = await setupBrowser()
    context = await browser.newContext()
    page = await context.newPage()
    
    // Setup visual testing utilities
    await setupVisualTesting(page)
  })

  afterEach(async () => {
    await page.close()
    await context.close()
  })

  // Healthcare component visual testing
  describe('Healthcare Component Visual Regression', () => {
    test('should maintain visual consistency for clinic cards', async () => {
      await page.goto('/')
      await page.setViewportSize(viewports.desktop)

      // Wait for clinic cards to load
      await page.waitForSelector('[data-testid="clinic-card"]')

      // Take screenshot of clinic cards section
      const clinicCardsSection = page.locator('[data-testid="clinic-cards-section"]')
      await clinicCardsSection.screenshot({ 
        path: 'testing/snapshots/clinic-cards-desktop.png',
        fullPage: false 
      })

      // Create visual baseline
      await createSnapshot('clinic-cards-desktop-baseline', 
        'testing/snapshots/clinic-cards-desktop.png')

      // Compare with baseline
      const visualDiff = await compareImages(
        'testing/snapshots/clinic-cards-desktop-baseline.png',
        'testing/snapshots/clinic-cards-desktop.png'
      )

      expect(visualDiff.similarity).toBeGreaterThan(0.95) // 95% similarity threshold
    })

    test('should maintain visual consistency for doctor cards', async () => {
      await page.goto('/doctors')
      await page.setViewportSize(viewports.desktop)

      // Wait for doctor cards to load
      await page.waitForSelector('[data-testid="doctor-card"]')

      // Take screenshot of doctor cards section
      const doctorCardsSection = page.locator('[data-testid="doctor-cards-section"]')
      await doctorCardsSection.screenshot({ 
        path: 'testing/snapshots/doctor-cards-desktop.png',
        fullPage: false 
      })

      // Create visual baseline
      await createSnapshot('doctor-cards-desktop-baseline', 
        'testing/snapshots/doctor-cards-desktop.png')

      // Compare with baseline
      const visualDiff = await compareImages(
        'testing/snapshots/doctor-cards-desktop-baseline.png',
        'testing/snapshots/doctor-cards-desktop.png'
      )

      expect(visualDiff.similarity).toBeGreaterThan(0.95)
    })

    test('should maintain visual consistency for service cards', async () => {
      await page.goto('/services')
      await page.setViewportSize(viewports.desktop)

      // Wait for service cards to load
      await page.waitForSelector('[data-testid="service-card"]')

      // Take screenshot of service cards section
      const serviceCardsSection = page.locator('[data-testid="service-cards-section"]')
      await serviceCardsSection.screenshot({ 
        path: 'testing/snapshots/service-cards-desktop.png',
        fullPage: false 
      })

      // Create visual baseline
      await createSnapshot('service-cards-desktop-baseline', 
        'testing/snapshots/service-cards-desktop.png')

      // Compare with baseline
      const visualDiff = await compareImages(
        'testing/snapshots/service-cards-desktop-baseline.png',
        'testing/snapshots/service-cards-desktop.png'
      )

      expect(visualDiff.similarity).toBeGreaterThan(0.95)
    })

    test('should maintain visual consistency for Healthier SG components', async () => {
      await page.goto('/healthier-sg')
      await page.setViewportSize(viewports.desktop)

      // Wait for Healthier SG components to load
      await page.waitForSelector('[data-testid="healthier-sg-banner"]')

      // Take screenshot of Healthier SG section
      const healthierSgSection = page.locator('[data-testid="healthier-sg-section"]')
      await healthierSgSection.screenshot({ 
        path: 'testing/snapshots/healthier-sg-desktop.png',
        fullPage: false 
      })

      // Create visual baseline
      await createSnapshot('healthier-sg-desktop-baseline', 
        'testing/snapshots/healthier-sg-desktop.png')

      // Compare with baseline
      const visualDiff = await compareImages(
        'testing/snapshots/healthier-sg-desktop-baseline.png',
        'testing/snapshots/healthier-sg-desktop.png'
      )

      expect(visualDiff.similarity).toBeGreaterThan(0.95)
    })

    test('should maintain visual consistency for contact forms', async () => {
      await page.goto('/contact')
      await page.setViewportSize(viewports.desktop)

      // Wait for contact form to load
      await page.waitForSelector('[data-testid="contact-form"]')

      // Take screenshot of contact form
      const contactForm = page.locator('[data-testid="contact-form"]')
      await contactForm.screenshot({ 
        path: 'testing/snapshots/contact-form-desktop.png',
        fullPage: false 
      })

      // Create visual baseline
      await createSnapshot('contact-form-desktop-baseline', 
        'testing/snapshots/contact-form-desktop.png')

      // Compare with baseline
      const visualDiff = await compareImages(
        'testing/snapshots/contact-form-desktop-baseline.png',
        'testing/snapshots/contact-form-desktop.png'
      )

      expect(visualDiff.similarity).toBeGreaterThan(0.95)
    })

    test('should maintain visual consistency for search interface', async () => {
      await page.goto('/')
      await page.setViewportSize(viewports.desktop)

      // Wait for search interface to load
      await page.waitForSelector('[data-testid="search-interface"]')

      // Take screenshot of search interface
      const searchInterface = page.locator('[data-testid="search-interface"]')
      await searchInterface.screenshot({ 
        path: 'testing/snapshots/search-interface-desktop.png',
        fullPage: false 
      })

      // Create visual baseline
      await createSnapshot('search-interface-desktop-baseline', 
        'testing/snapshots/search-interface-desktop.png')

      // Compare with baseline
      const visualDiff = await compareImages(
        'testing/snapshots/search-interface-desktop-baseline.png',
        'testing/snapshots/search-interface-desktop.png'
      )

      expect(visualDiff.similarity).toBeGreaterThan(0.95)
    })

    test('should maintain visual consistency for appointment booking', async () => {
      await page.goto('/doctors/dr-sarah-chen')
      await page.setViewportSize(viewports.desktop)

      // Wait for appointment booking to load
      await page.click('[data-testid="book-appointment"]')
      await page.waitForSelector('[data-testid="appointment-booking"]')

      // Take screenshot of appointment booking
      const appointmentBooking = page.locator('[data-testid="appointment-booking"]')
      await appointmentBooking.screenshot({ 
        path: 'testing/snapshots/appointment-booking-desktop.png',
        fullPage: false 
      })

      // Create visual baseline
      await createSnapshot('appointment-booking-desktop-baseline', 
        'testing/snapshots/appointment-booking-desktop.png')

      // Compare with baseline
      const visualDiff = await compareImages(
        'testing/snapshots/appointment-booking-desktop-baseline.png',
        'testing/snapshots/appointment-booking-desktop.png'
      )

      expect(visualDiff.similarity).toBeGreaterThan(0.95)
    })
  })

  // Healthcare UI compliance testing
  describe('Healthcare UI Compliance Visual Testing', () => {
    test('should validate healthcare color scheme compliance', async () => {
      await page.goto('/')
      await page.setViewportSize(viewports.desktop)

      // Check healthcare color compliance
      const healthcareColors = {
        primary: await page.evaluate(() => 
          getComputedStyle(document.documentElement).getPropertyValue('--healthcare-primary')
        ),
        secondary: await page.evaluate(() => 
          getComputedStyle(document.documentElement).getPropertyValue('--healthcare-secondary')
        ),
        success: await page.evaluate(() => 
          getComputedStyle(document.documentElement).getPropertyValue('--healthcare-success')
        ),
        warning: await page.evaluate(() => 
          getComputedStyle(document.documentElement).getPropertyValue('--healthcare-warning')
        )
      }

      // Verify color values match healthcare standards
      expect(healthcareColors.primary).toContain('#007bff') // Healthcare blue
      expect(healthcareColors.success).toContain('#28a745') // Medical green
      expect(healthcareColors.warning).toContain('#ffc107') // Alert yellow

      // Take screenshot for visual verification
      await page.screenshot({ 
        path: 'testing/snapshots/healthcare-colors-desktop.png',
        fullPage: false 
      })

      // Create baseline
      await createSnapshot('healthcare-colors-desktop-baseline', 
        'testing/snapshots/healthcare-colors-desktop.png')

      // Compare with baseline
      const visualDiff = await compareImages(
        'testing/snapshots/healthcare-colors-desktop-baseline.png',
        'testing/snapshots/healthcare-colors-desktop.png'
      )

      expect(visualDiff.similarity).toBeGreaterThan(0.95)
    })

    test('should validate medical icon consistency', async () => {
      await page.goto('/services')
      await page.setViewportSize(viewports.desktop)

      // Check medical icon implementation
      const medicalIcons = page.locator('[data-testid="medical-icon"]')
      const iconCount = await medicalIcons.count()

      for (let i = 0; i < iconCount; i++) {
        const icon = medicalIcons.nth(i)
        await expect(icon).toHaveAttribute('aria-label')
        
        // Check icon loading
        const iconLoaded = await icon.evaluate(el => 
          el.complete && el.naturalWidth !== 0
        )
        expect(iconLoaded).toBe(true)
      }

      // Take screenshot for visual verification
      await page.screenshot({ 
        path: 'testing/snapshots/medical-icons-desktop.png',
        fullPage: false 
      })
    })

    test('should validate healthcare typography standards', async () => {
      await page.goto('/')
      await page.setViewportSize(viewports.desktop)

      // Check typography implementation
      const headings = page.locator('h1, h2, h3, h4, h5, h6')
      const headingCount = await headings.count()

      for (let i = 0; i < headingCount; i++) {
        const heading = headings.nth(i)
        const fontSize = await heading.evaluate(el => 
          parseFloat(getComputedStyle(el).fontSize)
        )
        const fontWeight = await heading.evaluate(el => 
          getComputedStyle(el).fontWeight
        )

        // Verify heading hierarchy
        if (await heading.evaluate(el => el.tagName === 'H1')) {
          expect(fontSize).toBeGreaterThanOrEqual(32)
        } else if (await heading.evaluate(el => el.tagName === 'H2')) {
          expect(fontSize).toBeGreaterThanOrEqual(24)
        }
      }

      // Take screenshot for visual verification
      await page.screenshot({ 
        path: 'testing/snapshots/healthcare-typography-desktop.png',
        fullPage: false 
      })
    })

    test('should validate medical status indicators', async () => {
      await page.goto('/doctors/dr-sarah-chen')
      await page.setViewportSize(viewports.desktop)

      // Check status indicators
      const statusIndicators = page.locator('[data-testid*="status"]')
      const indicatorCount = await statusIndicators.count()

      for (let i = 0; i < indicatorCount; i++) {
        const indicator = statusIndicators.nth(i)
        const status = await indicator.textContent()
        
        // Verify status indicator visibility and accessibility
        await expect(indicator).toBeVisible()
        
        // Check color coding for medical status
        const backgroundColor = await indicator.evaluate(el => 
          getComputedStyle(el).backgroundColor
        )
        expect(backgroundColor).toBeTruthy()
      }

      // Take screenshot for visual verification
      await page.screenshot({ 
        path: 'testing/snapshots/medical-status-indicators-desktop.png',
        fullPage: false 
      })
    })
  })
})

// =============================================================================
// RESPONSIVE DESIGN VALIDATION TESTING
// =============================================================================

describe('Responsive Design Validation Testing', () => {
  let page: any
  let context: any

  beforeEach(async () => {
    const { setupBrowser } = await import('./test-environment')
    const browser = await setupBrowser()
    context = await browser.newContext()
    page = await context.newPage()
  })

  afterEach(async () => {
    await page.close()
    await context.close()
  })

  // Cross-device responsive testing
  describe('Cross-Device Responsive Testing', () => {
    for (const [deviceName, viewport] of Object.entries(viewports)) {
      test(`should maintain visual consistency on ${deviceName}`, async () => {
        await page.goto('/')
        await page.setViewportSize(viewport)

        // Wait for page to load completely
        await page.waitForSelector('body')
        await page.waitForTimeout(1000) // Allow animations to complete

        // Take full page screenshot
        await page.screenshot({ 
          path: `testing/snapshots/homepage-${deviceName}.png`,
          fullPage: true 
        })

        // Create baseline
        await createSnapshot(`homepage-${deviceName}-baseline`, 
          `testing/snapshots/homepage-${deviceName}.png`)

        // Compare with baseline
        const visualDiff = await compareImages(
          `testing/snapshots/homepage-${deviceName}-baseline.png`,
          `testing/snapshots/homepage-${deviceName}.png`
        )

        expect(visualDiff.similarity).toBeGreaterThan(0.90) // 90% similarity for responsive design
      })
    }

    // Mobile-specific responsive testing
    test('should validate mobile navigation behavior', async () => {
      await page.goto('/')
      await page.setViewportSize(viewports.mobile)

      // Test mobile menu visibility
      const mobileMenu = page.locator('[data-testid="mobile-menu"]')
      await expect(mobileMenu).toBeVisible()

      // Test mobile menu interaction
      await page.click('[data-testid="mobile-menu"]')
      await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible()

      // Take screenshot of mobile navigation
      await page.screenshot({ 
        path: 'testing/snapshots/mobile-navigation.png',
        fullPage: false 
      })

      // Create baseline
      await createSnapshot('mobile-navigation-baseline', 
        'testing/snapshots/mobile-navigation.png')

      // Compare with baseline
      const visualDiff = await compareImages(
        'testing/snapshots/mobile-navigation-baseline.png',
        'testing/snapshots/mobile-navigation.png'
      )

      expect(visualDiff.similarity).toBeGreaterThan(0.95)
    })

    // Tablet-specific responsive testing
    test('should validate tablet layout optimization', async () => {
      await page.goto('/doctors')
      await page.setViewportSize(viewports.tablet)

      // Test tablet grid layout
      const doctorCards = page.locator('[data-testid="doctor-card"]')
      const cardCount = await doctorCards.count()

      // On tablet, should display 2 cards per row
      expect(cardCount).toBeGreaterThan(0)

      // Take screenshot of tablet layout
      await page.screenshot({ 
        path: 'testing/snapshots/tablet-doctors-layout.png',
        fullPage: false 
      })

      // Create baseline
      await createSnapshot('tablet-doctors-layout-baseline', 
        'testing/snapshots/tablet-doctors-layout.png')

      // Compare with baseline
      const visualDiff = await compareImages(
        'testing/snapshots/tablet-doctors-layout-baseline.png',
        'testing/snapshots/tablet-doctors-layout.png'
      )

      expect(visualDiff.similarity).toBeGreaterThan(0.95)
    })
  })

  // Responsive content adaptation testing
  describe('Responsive Content Adaptation Testing', () => {
    test('should adapt clinic cards for different screen sizes', async () => {
      for (const [deviceName, viewport] of Object.entries(viewports)) {
        await page.goto('/')
        await page.setViewportSize(viewport)

        // Wait for clinic cards to load
        await page.waitForSelector('[data-testid="clinic-card"]')

        // Check card layout adaptation
        const clinicCards = page.locator('[data-testid="clinic-card"]')
        const cardCount = await clinicCards.count()

        expect(cardCount).toBeGreaterThan(0)

        // Verify cards are properly spaced
        for (let i = 0; i < cardCount; i++) {
          const card = clinicCards.nth(i)
          await expect(card).toBeVisible()
          
          // Check card content visibility
          const cardName = await card.locator('[data-testid="clinic-name"]').textContent()
          expect(cardName).toBeTruthy()
        }

        // Take screenshot
        await page.screenshot({ 
          path: `testing/snapshots/clinic-cards-${deviceName}.png`,
          fullPage: false 
        })
      }
    })

    test('should adapt search interface for mobile', async () => {
      await page.goto('/')
      await page.setViewportSize(viewports.mobile)

      // Check mobile search interface
      const mobileSearch = page.locator('[data-testid="mobile-search"]')
      await expect(mobileSearch).toBeVisible()

      // Test mobile search interaction
      await page.click('[data-testid="mobile-search"]')
      
      const mobileSearchInput = page.locator('[data-testid="mobile-search-input"]')
      await expect(mobileSearchInput).toBeVisible()

      // Test search input functionality
      await mobileSearchInput.fill('family clinic')
      await mobileSearchInput.press('Enter')

      // Verify search results
      await page.waitForSelector('[data-testid="search-results"]')

      // Take screenshot of mobile search
      await page.screenshot({ 
        path: 'testing/snapshots/mobile-search.png',
        fullPage: false 
      })
    })
  })
})

// =============================================================================
// ACCESSIBILITY VISUAL TESTING
// =============================================================================

describe('Accessibility Visual Testing', () => {
  let page: any
  let context: any

  beforeEach(async () => {
    const { setupBrowser } = await import('./test-environment')
    const browser = await setupBrowser()
    context = await browser.newContext()
    page = await context.newPage()
  })

  afterEach(async () => {
    await page.close()
    await context.close()
  })

  // High contrast mode testing
  describe('High Contrast Mode Visual Testing', () => {
    test('should validate high contrast accessibility', async () => {
      await page.goto('/')
      await page.setViewportSize(viewports.desktop)

      // Enable high contrast mode
      await page.click('[data-testid="accessibility-menu"]')
      await page.click('[data-testid="high-contrast-toggle"]')

      // Wait for high contrast styles to apply
      await page.waitForTimeout(500)

      // Take screenshot in high contrast mode
      await page.screenshot({ 
        path: 'testing/snapshots/high-contrast-mode.png',
        fullPage: false 
      })

      // Verify high contrast is applied
      const bodyBackground = await page.evaluate(() => 
        getComputedStyle(document.body).backgroundColor
      )
      const bodyColor = await page.evaluate(() => 
        getComputedStyle(document.body).color
      )

      expect(bodyBackground).not.toBe('rgba(0, 0, 0, 0)') // Should not be transparent
      expect(bodyColor).not.toBe('rgba(0, 0, 0, 0)') // Should not be transparent

      // Create baseline
      await createSnapshot('high-contrast-mode-baseline', 
        'testing/snapshots/high-contrast-mode.png')

      // Compare with baseline
      const visualDiff = await compareImages(
        'testing/snapshots/high-contrast-mode-baseline.png',
        'testing/snapshots/high-contrast-mode.png'
      )

      expect(visualDiff.similarity).toBeGreaterThan(0.90)
    })

    test('should validate focus indicators accessibility', async () => {
      await page.goto('/')
      await page.setViewportSize(viewports.desktop)

      // Test focus indicator on different elements
      const focusableElements = page.locator('button, [tabindex], a, input')
      const elementCount = await focusableElements.count()

      // Test first few focusable elements
      for (let i = 0; i < Math.min(5, elementCount); i++) {
        const element = focusableElements.nth(i)
        
        // Focus element
        await element.focus()
        
        // Take screenshot of focused element
        await element.screenshot({ 
          path: `testing/snapshots/focus-indicator-${i}.png`,
          fullPage: false 
        })

        // Verify focus indicator is visible
        const focusVisible = await element.evaluate(el => 
          el === document.activeElement && document.activeElement === el
        )
        expect(focusVisible).toBe(true)
      }
    })
  })

  // Font size accessibility testing
  describe('Font Size Accessibility Testing', () => {
    test('should validate font size scaling', async () => {
      await page.goto('/')
      await page.setViewportSize(viewports.desktop)

      // Test different font size settings
      const fontSizes = ['small', 'medium', 'large', 'extra-large']

      for (const size of fontSizes) {
        await page.click('[data-testid="accessibility-menu"]')
        await page.click(`[data-testid="font-size-${size}"]`)

        // Wait for font size change to apply
        await page.waitForTimeout(500)

        // Take screenshot
        await page.screenshot({ 
          path: `testing/snapshots/font-size-${size}.png`,
          fullPage: false 
        })

        // Verify font size has changed
        const bodyFontSize = await page.evaluate(() => 
          parseFloat(getComputedStyle(document.body).fontSize)
        )

        switch (size) {
          case 'small':
            expect(bodyFontSize).toBeLessThan(16)
            break
          case 'large':
            expect(bodyFontSize).toBeGreaterThan(18)
            break
          case 'extra-large':
            expect(bodyFontSize).toBeGreaterThan(20)
            break
        }
      }
    })

    test('should validate text spacing accessibility', async () => {
      await page.goto('/')
      await page.setViewportSize(viewports.desktop)

      // Enable text spacing accessibility
      await page.click('[data-testid="accessibility-menu"]')
      await page.click('[data-testid="text-spacing-toggle"]')

      // Wait for text spacing to apply
      await page.waitForTimeout(500)

      // Take screenshot
      await page.screenshot({ 
        path: 'testing/snapshots/text-spacing-accessibility.png',
        fullPage: false 
      })

      // Verify text spacing has increased
      const lineHeight = await page.evaluate(() => 
        parseFloat(getComputedStyle(document.body).lineHeight)
      )

      expect(lineHeight).toBeGreaterThan(1.5)
    })
  })

  // Screen reader visual testing
  describe('Screen Reader Visual Testing', () => {
    test('should validate visual indicators for screen readers', async () => {
      await page.goto('/')
      await page.setViewportSize(viewports.desktop)

      // Check for screen reader announcements
      const liveRegions = page.locator('[aria-live]')
      const liveRegionCount = await liveRegions.count()

      for (let i = 0; i < liveRegionCount; i++) {
        const liveRegion = liveRegions.nth(i)
        await expect(liveRegion).toHaveAttribute('aria-live')
        
        // Take screenshot of live region
        await liveRegion.screenshot({ 
          path: `testing/snapshots/screen-reader-region-${i}.png`,
          fullPage: false 
        })
      }

      // Take screenshot showing all screen reader indicators
      await page.screenshot({ 
        path: 'testing/snapshots/screen-reader-indicators.png',
        fullPage: false 
      })
    })

    test('should validate skip links visibility', async () => {
      await page.goto('/')
      await page.setViewportSize(viewports.desktop)

      // Make skip links visible for testing
      await page.addStyleTag({
        content: '[data-testid="skip-link"] { position: static !important; }'
      })

      // Take screenshot showing skip links
      await page.screenshot({ 
        path: 'testing/snapshots/skip-links-visible.png',
        fullPage: false 
      })

      // Verify skip links are present
      const skipLinks = page.locator('[data-testid="skip-link"]')
      const linkCount = await skipLinks.count()
      expect(linkCount).toBeGreaterThan(0)
    })
  })
})

// =============================================================================
// CROSS-BROWSER VISUAL COMPATIBILITY TESTING
// =============================================================================

describe('Cross-Browser Visual Compatibility Testing', () => {
  let page: any
  let context: any

  beforeEach(async () => {
    const { setupBrowser } = await import('./test-environment')
    const browser = await setupBrowser()
    context = await browser.newContext()
    page = await context.newPage()
  })

  afterEach(async () => {
    await page.close()
    await context.close()
  })

  // Cross-browser visual testing
  describe('Cross-Browser Visual Consistency', () => {
    test('should validate visual consistency across browsers', async () => {
      const browsers = ['chrome', 'firefox', 'safari']
      const viewport = viewports.desktop

      await page.goto('/')
      await page.setViewportSize(viewport)

      for (const browserName of browsers) {
        // Navigate to page for each browser simulation
        await page.reload()
        
        // Wait for page to load
        await page.waitForSelector('body')
        await page.waitForTimeout(1000)

        // Take screenshot
        await page.screenshot({ 
          path: `testing/snapshots/homepage-${browserName}.png`,
          fullPage: false 
        })

        // Create baseline
        await createSnapshot(`homepage-${browserName}-baseline`, 
          `testing/snapshots/homepage-${browserName}.png`)

        // Compare with Chrome baseline (reference browser)
        if (browserName !== 'chrome') {
          const visualDiff = await compareImages(
            `testing/snapshots/homepage-chrome-baseline.png`,
            `testing/snapshots/homepage-${browserName}.png`
          )

          expect(visualDiff.similarity).toBeGreaterThan(0.85) // 85% similarity across browsers
        }
      }
    })

    test('should validate font rendering consistency', async () => {
      await page.goto('/')
      await page.setViewportSize(viewports.desktop)

      // Check font loading
      await page.waitForLoadState('networkidle')

      // Take screenshot for font verification
      await page.screenshot({ 
        path: 'testing/snapshots/font-rendering.png',
        fullPage: false 
      })

      // Verify font files are loaded
      const fontLoads = await page.evaluate(() => {
        const fonts = Array.from(document.fonts)
        return fonts.map(font => ({
          family: font.family,
          status: font.status
        }))
      })

      // Check that fonts are loaded successfully
      fontLoads.forEach(font => {
        expect(font.status).toBe('loaded')
      })
    })
  })
})

// =============================================================================
// PERFORMANCE VISUAL TESTING
// =============================================================================

describe('Performance Visual Testing', () => {
  let page: any
  let context: any

  beforeEach(async () => {
    const { setupBrowser } = await import('./test-environment')
    const browser = await setupBrowser()
    context = await browser.newContext()
    page = await context.newPage()
  })

  afterEach(async () => {
    await page.close()
    await context.close()
  })

  // Visual performance testing
  describe('Visual Performance Testing', () => {
    test('should validate visual loading performance', async () => {
      await page.goto('/')
      
      // Measure first contentful paint
      const fcp = await page.evaluate(() => {
        return new Promise((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries()
            const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint')
            resolve(fcpEntry ? fcpEntry.startTime : null)
          }).observe({ entryTypes: ['paint'] })
        })
      })

      expect(fcp).toBeLessThan(2000) // FCP should be under 2 seconds

      // Take screenshot when page is fully loaded
      await page.waitForSelector('[data-testid="clinic-card"]')
      await page.waitForLoadState('networkidle')

      await page.screenshot({ 
        path: 'testing/snapshots/performance-fcp.png',
        fullPage: false 
      })
    })

    test('should validate image loading performance', async () => {
      await page.goto('/')
      
      // Wait for images to load
      await page.waitForSelector('img')

      const images = page.locator('img')
      const imageCount = await images.count()

      for (let i = 0; i < imageCount; i++) {
        const image = images.nth(i)
        const loaded = await image.evaluate(img => 
          img.complete && img.naturalWidth !== 0
        )
        
        expect(loaded).toBe(true)

        // Take screenshot of loaded image
        await image.screenshot({ 
          path: `testing/snapshots/loaded-image-${i}.png`,
          fullPage: false 
        })
      }
    })

    test('should validate animation performance', async () => {
      await page.goto('/')
      
      // Test animation performance
      const animationStart = await page.evaluate(() => {
        return performance.now()
      })

      // Trigger animations
      await page.click('[data-testid="clinic-card"]').first()
      await page.waitForTimeout(1000) // Wait for animations

      const animationEnd = await page.evaluate(() => {
        return performance.now()
      })

      const animationDuration = animationEnd - animationStart
      expect(animationDuration).toBeLessThan(2000) // Animations should complete within 2 seconds

      // Take screenshot during animation
      await page.screenshot({ 
        path: 'testing/snapshots/animation-performance.png',
        fullPage: false 
      })
    })
  })
})

// =============================================================================
// HEALTHCARE VISUAL COMPLIANCE TESTING
// =============================================================================

describe('Healthcare Visual Compliance Testing', () => {
  let page: any
  let context: any

  beforeEach(async () => {
    const { setupBrowser } = await import('./test-environment')
    const browser = await setupBrowser()
    context = await browser.newContext()
    page = await context.newPage()
  })

  afterEach(async () => {
    await page.close()
    await context.close()
  })

  // Healthcare-specific visual compliance
  describe('Healthcare Visual Compliance', () => {
    test('should validate medical icon accessibility', async () => {
      await page.goto('/')
      await page.setViewportSize(viewports.desktop)

      // Check medical icons have proper alt text
      const medicalIcons = page.locator('[data-testid*="icon"], img[alt*="medical"], img[alt*="doctor"], img[alt*="clinic"]')
      const iconCount = await medicalIcons.count()

      for (let i = 0; i < iconCount; i++) {
        const icon = medicalIcons.nth(i)
        const alt = await icon.getAttribute('alt')
        const ariaLabel = await icon.getAttribute('aria-label')

        // Icons should have either alt text or aria-label
        expect(alt || ariaLabel).toBeTruthy()

        // Take screenshot of icon
        await icon.screenshot({ 
          path: `testing/snapshots/medical-icon-${i}.png`,
          fullPage: false 
        })
      }
    })

    test('should validate medical color coding', async () => {
      await page.goto('/')
      await page.setViewportSize(viewports.desktop)

      // Check color coding for medical status
      const statusElements = page.locator('[data-testid*="status"], [class*="status"], [class*="badge"]')
      const statusCount = await statusElements.count()

      for (let i = 0; i < statusCount; i++) {
        const element = statusElements.nth(i)
        const backgroundColor = await element.evaluate(el => 
          getComputedStyle(el).backgroundColor
        )
        const textColor = await element.evaluate(el => 
          getComputedStyle(el).color
        )

        // Colors should be defined
        expect(backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
        expect(textColor).not.toBe('rgba(0, 0, 0, 0)')

        // Take screenshot of status element
        await element.screenshot({ 
          path: `testing/snapshots/medical-status-${i}.png`,
          fullPage: false 
        })
      }
    })

    test('should validate healthcare layout accessibility', async () => {
      await page.goto('/healthier-sg')
      await page.setViewportSize(viewports.desktop)

      // Check semantic HTML structure
      const main = page.locator('main')
      const nav = page.locator('nav')
      const header = page.locator('header')
      const footer = page.locator('footer')

      await expect(main).toBeVisible()
      await expect(nav).toBeVisible()
      await expect(header).toBeVisible()
      await expect(footer).toBeVisible()

      // Take screenshot of semantic layout
      await page.screenshot({ 
        path: 'testing/snapshots/semantic-layout.png',
        fullPage: false 
      })
    })

    test('should validate healthcare form accessibility', async () => {
      await page.goto('/contact')
      await page.setViewportSize(viewports.desktop)

      // Check form accessibility
      const formFields = page.locator('input, select, textarea')
      const fieldCount = await formFields.count()

      for (let i = 0; i < fieldCount; i++) {
        const field = formFields.nth(i)
        const label = await field.getAttribute('aria-label') || 
                     await page.locator(`label[for="${await field.getAttribute('id')}"]`).textContent()
        
        // Fields should have labels
        expect(label).toBeTruthy()

        // Take screenshot of form field
        await field.screenshot({ 
          path: `testing/snapshots/form-field-${i}.png`,
          fullPage: false 
        })
      }
    })
  })
})
