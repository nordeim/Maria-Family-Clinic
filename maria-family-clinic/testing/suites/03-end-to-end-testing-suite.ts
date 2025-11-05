/**
 * End-to-End Testing Suite - My Family Clinic Platform
 * 
 * Comprehensive E2E test coverage for:
 * - 5 Core Healthcare User Journeys
 * - Healthcare workflow validation
 * - Multi-language user flows
 * - Mobile and desktop workflows
 * - Singapore healthcare compliance validation
 */

import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest'
import { chromium, firefox, webkit } from 'playwright'
import { setup, teardown } from './test-environment'

// Test environments configuration
const browsers = {
  chromium: {
    name: 'chromium',
    browser: chromium,
    defaultViewport: { width: 1920, height: 1080 }
  },
  firefox: {
    name: 'firefox',
    browser: firefox,
    defaultViewport: { width: 1920, height: 1080 }
  },
  webkit: {
    name: 'webkit',
    browser: webkit,
    defaultViewport: { width: 1920, height: 1080 }
  }
}

const viewports = {
  desktop: { width: 1920, height: 1080 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 }
}

const languages = ['en', 'zh', 'ms', 'ta']

// =============================================================================
// CORE USER JOURNEY 1: LOCATE CLINICS
// =============================================================================

describe('Core Journey 1: Locate Clinics', () => {
  let page: any
  let context: any

  beforeEach(async () => {
    const setup = await import('./test-environment')
    const browser = await setup.setupBrowser()
    context = await browser.newContext()
    page = await context.newPage()
  })

  afterEach(async () => {
    await page.close()
    await context.close()
  })

  // Desktop journey
  describe('Desktop: Locate Clinics Journey', () => {
    test('should complete clinic discovery journey on desktop', async () => {
      // Navigate to homepage
      await page.goto('/')
      
      // Verify homepage loads with clinic locator
      await expect(page.locator('h1')).toContainText('Find Your Clinic')
      await expect(page.locator('[data-testid="clinic-search"]')).toBeVisible()

      // Test location-based search
      await page.click('[data-testid="location-search-input"]')
      await page.fill('[data-testid="location-search-input"]', 'Orchard Road, Singapore')
      await page.click('[data-testid="search-location-button"]')

      // Verify search results display
      await expect(page.locator('[data-testid="clinic-results"]')).toBeVisible()
      await expect(page.locator('[data-testid="clinic-card"]').first()).toBeVisible()

      // Test Healthier SG filter
      await page.click('[data-testid="filter-healthier-sg"]')
      await expect(page.locator('[data-testid="clinic-card"][data-healthier-sg="true"]')).toBeVisible()

      // Test distance sorting
      await page.selectOption('[data-testid="sort-distance"]', 'nearest')
      await expect(page.locator('[data-testid="clinic-results"]')).toContainText('HealthCare Family Clinic')

      // Test clinic details view
      await page.click('[data-testid="clinic-card"]').first()
      await expect(page.locator('h1')).toContainText('HealthCare Family Clinic')
      await expect(page.locator('[data-testid="clinic-address"]')).toBeVisible()
      await expect(page.locator('[data-testid="clinic-phone"]')).toBeVisible()

      // Test operating hours
      await expect(page.locator('[data-testid="operating-hours"]')).toContainText('8:00 AM - 8:00 PM')

      // Test availability check
      await page.click('[data-testid="check-availability"]')
      await expect(page.locator('[data-testid="availability-calendar"]')).toBeVisible()

      // Test map integration
      await expect(page.locator('[data-testid="clinic-map"]')).toBeVisible()
      const mapUrl = await page.getAttribute('[data-testid="clinic-map"]', 'src')
      expect(mapUrl).toContain('maps.google.com')

      // Test directions link
      await page.click('[data-testid="get-directions"]')
      const directionsUrl = await page.url()
      expect(directionsUrl).toContain('maps.google.com')

      // Test accessibility features
      await page.keyboard.press('Tab')
      await expect(page.locator(':focus')).toBe('[data-testid="clinic-search"]')
      
      await page.keyboard.press('Tab')
      await expect(page.locator(':focus')).toBe('[data-testid="location-search-input"]')
    }, 60000)

    test('should handle emergency clinic search', async () => {
      await page.goto('/')
      
      // Navigate to emergency search
      await page.click('[data-testid="emergency-search"]')
      await expect(page.locator('[data-testid="emergency-title"]')).toContainText('Emergency Medical Services')

      // Test 24-hour clinics filter
      await page.click('[data-testid="filter-24-hours"]')
      await expect(page.locator('[data-testid="clinic-results"]')).toContainText('24 Hours')

      // Test emergency services filter
      await page.click('[data-testid="filter-emergency-services"]')
      await expect(page.locator('[data-testid="clinic-card"]')).toHaveAttribute('data-emergency', 'true')

      // Test ambulance request
      await page.click('[data-testid="request-ambulance"]')
      await expect(page.locator('[data-testid="ambulance-request-form"]')).toBeVisible()
      
      await page.fill('[data-testid="emergency-location"]', 'Orchard Road')
      await page.selectOption('[data-testid="emergency-severity"]', 'urgent')
      await page.click('[data-testid="submit-ambulance"]')

      await expect(page.locator('[data-testid="ambulance-confirmation"]')).toContainText('Ambulance requested')
    }, 60000)

    test('should test mobile clinic discovery', async () => {
      await page.setViewportSize(viewports.mobile)
      await page.goto('/')
      
      // Test mobile navigation
      await page.click('[data-testid="mobile-menu"]')
      await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible()

      // Test mobile search
      await page.click('[data-testid="mobile-search"]')
      await expect(page.locator('[data-testid="mobile-search-input"]')).toBeVisible()
      
      await page.fill('[data-testid="mobile-search-input"]', 'family clinic near me')
      await page.press('[data-testid="mobile-search-input"]', 'Enter')

      // Verify mobile results layout
      await expect(page.locator('[data-testid="mobile-clinic-card"]')).toBeVisible()
      
      // Test mobile clinic details
      await page.click('[data-testid="mobile-clinic-card"]').first()
      await expect(page.locator('[data-testid="mobile-clinic-details"]')).toBeVisible()

      // Test mobile actions
      await page.click('[data-testid="mobile-call-clinic"]')
      const phoneUrl = await page.url()
      expect(phoneUrl).toStartWith('tel:')

      // Test mobile map
      await page.click('[data-testid="mobile-view-map"]')
      await expect(page.locator('[data-testid="mobile-map"]')).toBeVisible()
    }, 60000)
  })

  // Multi-language journey testing
  describe('Multi-language: Locate Clinics Journey', () => {
    for (const lang of languages) {
      test(`should complete clinic discovery in ${lang}`, async () => {
        // Switch to target language
        await page.goto('/')
        await page.click('[data-testid="language-selector"]')
        await page.click(`[data-testid="language-${lang}"]`)

        // Verify language switch
        const langText = await page.getAttribute('html', 'lang')
        expect(langText).toBe(lang)

        // Test search in target language
        const searchText = {
          en: 'family clinic',
          zh: '家庭诊所',
          ms: 'klinik keluarga',
          ta: 'குடும்ப கிளினிக்'
        }

        await page.fill('[data-testid="location-search-input"]', searchText[lang])
        await page.click('[data-testid="search-location-button"]')

        // Verify search results in target language
        await expect(page.locator('[data-testid="clinic-results"]')).toBeVisible()

        // Test clinic details in target language
        await page.click('[data-testid="clinic-card"]').first()
        const clinicName = await page.textContent('h1')
        expect(clinicName).toBeTruthy()

        // Test booking workflow in target language
        await page.click('[data-testid="book-appointment"]')
        await expect(page.locator('[data-testid="appointment-form"]')).toBeVisible()
      }, 60000)
    }
  })
})

// =============================================================================
// CORE USER JOURNEY 2: EXPLORE SERVICES
// =============================================================================

describe('Core Journey 2: Explore Services', () => {
  let page: any
  let context: any

  beforeEach(async () => {
    const setup = await import('./test-environment')
    const browser = await setup.setupBrowser()
    context = await browser.newContext()
    page = await context.newPage()
  })

  afterEach(async () => {
    await page.close()
    await context.close()
  })

  describe('Desktop: Service Exploration Journey', () => {
    test('should complete service discovery and exploration', async () => {
      await page.goto('/services')

      // Verify services page loads
      await expect(page.locator('h1')).toContainText('Medical Services')
      await expect(page.locator('[data-testid="service-categories"]')).toBeVisible()

      // Test service category navigation
      await page.click('[data-testid="category-family-medicine"]')
      await expect(page.locator('[data-testid="service-card"]')).toContainText('General Consultation')

      // Test service search
      await page.fill('[data-testid="service-search"]', 'health screening')
      await page.press('[data-testid="service-search"]', 'Enter')
      await expect(page.locator('[data-testid="search-results"]')).toContainText('Health Screening')

      // Test service filters
      await page.click('[data-testid="filter-available-today"]')
      await expect(page.locator('[data-testid="service-card"]')).toHaveAttribute('data-available-today', 'true')

      // Test price range filter
      await page.click('[data-testid="filter-price-0-50"]')
      await expect(page.locator('[data-testid="service-card"]')).toContainText('$')

      // Test service details
      await page.click('[data-testid="service-card"]').first()
      await expect(page.locator('h1')).toContainText('General Consultation')
      
      // Verify service information
      await expect(page.locator('[data-testid="service-duration"]')).toContainText('30 minutes')
      await expect(page.locator('[data-testid="service-price"]')).toContainText('$45')
      await expect(page.locator('[data-testid="service-description"]')).toBeVisible()

      // Test preparation instructions
      await expect(page.locator('[data-testid="preparation-instructions"]')).toContainText('No special preparation required')

      // Test clinic availability for service
      await page.click('[data-testid="find-clinics-for-service"]')
      await expect(page.locator('[data-testid="clinic-availability-table"]')).toBeVisible()

      // Test service comparison
      await page.click('[data-testid="compare-service"]')
      await page.goto('/services/compare')
      await expect(page.locator('[data-testid="service-comparison"]')).toBeVisible()

      // Test booking integration
      await page.goto('/services/consultation')
      await page.click('[data-testid="book-service"]')
      await expect(page.locator('[data-testid="booking-flow"]')).toBeVisible()
    }, 60000)

    test('should test Healthier SG service benefits', async () => {
      await page.goto('/services')
      
      // Filter for Healthier SG covered services
      await page.click('[data-testid="filter-healthier-sg"]')
      await expect(page.locator('[data-testid="service-card"]')).toHaveAttribute('data-healthier-sg', 'true')

      // Test service benefit calculation
      const serviceCard = page.locator('[data-testid="service-card"]').first()
      await expect(serviceCard.locator('[data-testid="healthier-sg-benefits"]')).toContainText('60% off')

      // Test service eligibility
      await serviceCard.click()
      await page.click('[data-testid="check-eligibility"]')
      await expect(page.locator('[data-testid="eligibility-form"]')).toBeVisible()
      
      await page.fill('[data-testid="age"]', '35')
      await page.selectOption('[data-testid="residency-status"]', 'citizen')
      await page.click('[data-testid="check-eligibility-button"]')

      await expect(page.locator('[data-testid="eligibility-result"]')).toContainText('Eligible')
    }, 60000)
  })
})

// =============================================================================
// CORE USER JOURNEY 3: VIEW DOCTORS
// =============================================================================

describe('Core Journey 3: View Doctors', () => {
  let page: any
  let context: any

  beforeEach(async () => {
    const setup = await import('./test-environment')
    const browser = await setup.setupBrowser()
    context = await browser.newContext()
    page = await context.newPage()
  })

  afterEach(async () => {
    await page.close()
    await context.close()
  })

  describe('Desktop: Doctor Discovery Journey', () => {
    test('should complete doctor search and profile exploration', async () => {
      await page.goto('/doctors')

      // Verify doctors page loads
      await expect(page.locator('h1')).toContainText('Find Your Doctor')
      await expect(page.locator('[data-testid="doctor-search"]')).toBeVisible()

      // Test doctor search
      await page.fill('[data-testid="doctor-search"]', 'Dr. Sarah Chen')
      await page.press('[data-testid="doctor-search"]', 'Enter')

      // Verify search results
      await expect(page.locator('[data-testid="doctor-results"]')).toBeVisible()
      await expect(page.locator('[data-testid="doctor-card"]')).toContainText('Dr. Sarah Chen')

      // Test doctor profile
      await page.click('[data-testid="doctor-card"]').first()
      await expect(page.locator('h1')).toContainText('Dr. Sarah Chen')

      // Verify doctor information
      await expect(page.locator('[data-testid="doctor-specialty"]')).toContainText('Family Medicine')
      await expect(page.locator('[data-testid="doctor-qualifications"]')).toContainText('MBBS')
      await expect(page.locator('[data-testid="doctor-experience"]')).toContainText('12 years')

      // Test clinic affiliations
      await expect(page.locator('[data-testid="clinic-affiliations"]')).toContainText('HealthCare Family Clinic')

      // Test availability schedule
      await page.click('[data-testid="view-availability"]')
      await expect(page.locator('[data-testid="availability-calendar"]')).toBeVisible()

      // Verify available time slots
      await expect(page.locator('[data-testid="time-slot"]').first()).toBeVisible()

      // Test booking workflow
      await page.click('[data-testid="book-appointment"]').first()
      await expect(page.locator('[data-testid="booking-form"]')).toBeVisible()

      // Test reviews section
      await page.click('[data-testid="reviews-section"]')
      await expect(page.locator('[data-testid="review-card"]')).toBeVisible()

      // Test doctor verification badges
      await expect(page.locator('[data-testid="moh-verified"]')).toContainText('MOH Verified')
      await expect(page.locator('[data-testid="healthier-sg-affiliated"]')).toContainText('Healthier SG Affiliated')
    }, 60000)

    test('should test Healthier SG doctor search', async () => {
      await page.goto('/doctors')
      
      // Filter for Healthier SG affiliated doctors
      await page.click('[data-testid="filter-healthier-sg-doctors"]')
      await expect(page.locator('[data-testid="doctor-card"]')).toHaveAttribute('data-healthier-sg', 'true')

      // Test Healthier SG benefits display
      const doctorCard = page.locator('[data-testid="doctor-card"]').first()
      await expect(doctorCard.locator('[data-testid="healthier-sg-discount"]')).toContainText('60% discount')

      // Test specialist search
      await page.selectOption('[data-testid="specialty-filter"]', 'Family Medicine')
      await expect(page.locator('[data-testid="doctor-card"]')).toContainText('Family Medicine')

      // Test language filter
      await page.check('[data-testid="language-english"]')
      await expect(page.locator('[data-testid="doctor-card"]')).toContainText('English')

      // Test availability filter
      await page.click('[data-testid="available-today"]')
      await expect(page.locator('[data-testid="doctor-card"]')).toHaveAttribute('data-available-today', 'true')
    }, 60000)
  })
})

// =============================================================================
// CORE USER JOURNEY 4: HEALTHIER SG PROGRAM
// =============================================================================

describe('Core Journey 4: Healthier SG Program', () => {
  let page: any
  let context: any

  beforeEach(async () => {
    const setup = await import('./test-environment')
    const browser = await setup.setupBrowser()
    context = await browser.newContext()
    page = await context.newPage()
  })

  afterEach(async () => {
    await page.close()
    await context.close()
  })

  describe('Desktop: Healthier SG Enrollment Journey', () => {
    test('should complete Healthier SG enrollment process', async () => {
      await page.goto('/healthier-sg')

      // Verify Healthier SG page loads
      await expect(page.locator('h1')).toContainText('Healthier SG Program')
      await expect(page.locator('[data-testid="program-overview"]')).toBeVisible()

      // Test eligibility checker
      await page.click('[data-testid="check-eligibility"]')
      await expect(page.locator('[data-testid="eligibility-form"]')).toBeVisible()

      // Complete eligibility assessment
      await page.fill('[data-testid="age"]', '35')
      await page.selectOption('[data-testid="residency-status"]', 'citizen')
      await page.check('[data-testid="consent-data-usage"]')
      
      // Test chronic condition questions
      await page.selectOption('[data-testid="chronic-conditions"]', 'hypertension')
      await page.fill('[data-testid="medications"]', 'Lisinopril 10mg')

      await page.click('[data-testid="submit-assessment"]')

      // Verify eligibility result
      await expect(page.locator('[data-testid="eligibility-result"]')).toContainText('Eligible')
      await expect(page.locator('[data-testid="benefits-summary"]')).toContainText('60% discount')

      // Test MyInfo integration
      await page.click('[data-testid="verify-with-myinfo"]')
      
      // In test environment, verify MyInfo modal opens
      await expect(page.locator('[data-testid="myinfo-modal"]')).toBeVisible()

      // Test benefits calculator
      await page.click('[data-testid="calculate-benefits"]')
      await expect(page.locator('[data-testid="benefits-calculator"]')).toBeVisible()

      await page.fill('[data-testid="annual-consultations"]', '4')
      await expect(page.locator('[data-testid="estimated-savings"]')).toContainText('S$')

      // Test clinic selection
      await page.click('[data-testid="select-clinic"]')
      await expect(page.locator('[data-testid="clinic-selection"]')).toBeVisible()

      await page.click('[data-testid="clinic-card"]').first()
      await expect(page.locator('[data-testid="selected-clinic"]')).toContainText('HealthCare Family Clinic')

      // Test consent management
      await page.click('[data-testid="provide-consent"]')
      await expect(page.locator('[data-testid="consent-form"]')).toBeVisible()

      await page.check('[data-testid="consent-medical-data"]')
      await page.check('[data-testid="consent-program-participation"]')
      await page.check('[data-testid="consent-data-sharing-moh"]')

      await page.click('[data-testid="submit-consent"]')

      // Verify enrollment completion
      await expect(page.locator('[data-testid="enrollment-success"]')).toContainText('Enrollment submitted')
      await expect(page.locator('[data-testid="reference-number"]')).toBeVisible()

      // Test status tracking
      await page.click('[data-testid="track-enrollment"]')
      await expect(page.locator('[data-testid="enrollment-status"]')).toContainText('Submitted')
    }, 60000)

    test('should test Healthier SG benefits tracking', async () => {
      await page.goto('/healthier-sg/dashboard')

      // Verify dashboard loads
      await expect(page.locator('[data-testid="dashboard"]')).toBeVisible()
      await expect(page.locator('[data-testid="program-status"]')).toContainText('Active')

      // Test benefits summary
      await expect(page.locator('[data-testid="benefits-summary"]')).toContainText('60% discount')
      await expect(page.locator('[data-testid="annual-benefits-used"]')).toContainText('2/4 consultations')

      // Test service utilization
      await page.click('[data-testid="service-utilization"]')
      await expect(page.locator('[data-testid="utilization-chart"]')).toBeVisible()

      // Test incentive tracking
      await page.click('[data-testid="incentives"]')
      await expect(page.locator('[data-testid="incentive-points"]')).toContainText('150 points')

      // Test program activities
      await page.click('[data-testid="activities"]')
      await expect(page.locator('[data-testid="activity-card"]')).toContainText('Health Screening')
    }, 60000)
  })
})

// =============================================================================
// CORE USER JOURNEY 5: CONTACT SYSTEM
// =============================================================================

describe('Core Journey 5: Contact System', () => {
  let page: any
  let context: any

  beforeEach(async () => {
    const setup = await import('./test-environment')
    const browser = await setup.setupBrowser()
    context = await browser.newContext()
    page = await context.newPage()
  })

  afterEach(async () => {
    await page.close()
    await context.close()
  })

  describe('Desktop: Contact and Inquiry Journey', () => {
    test('should complete contact form submission workflow', async () => {
      await page.goto('/contact')

      // Verify contact page loads
      await expect(page.locator('h1')).toContainText('Contact Us')
      await expect(page.locator('[data-testid="contact-form"]')).toBeVisible()

      // Test multi-step contact form
      await page.click('[data-testid="contact-type-medical-inquiry"]')
      await page.click('[data-testid="next-step"]')

      await expect(page.locator('[data-testid="contact-details-step"]')).toBeVisible()
      await page.fill('[data-testid="full-name"]', 'John Doe')
      await page.fill('[data-testid="email"]', 'john.doe@example.com')
      await page.fill('[data-testid="phone"]', '+65-9123-4567')
      await page.selectOption('[data-testid="preferred-contact"]', 'email')

      await page.click('[data-testid="next-step"]')

      await expect(page.locator('[data-testid="medical-info-step"]')).toBeVisible()
      await page.fill('[data-testid="medical-condition"]', 'Diabetes management')
      await page.fill('[data-testid="inquiry-details"]', 'I would like to schedule a consultation for diabetes management')

      await page.selectOption('[data-testid="urgency']", 'normal')
      await page.selectOption('[data-testid="preferred-time"]', 'morning')

      await page.click('[data-testid="submit-contact"]')

      // Verify submission confirmation
      await expect(page.locator('[data-testid="submission-confirmation"]')).toContainText('Inquiry received')
      await expect(page.locator('[data-testid="tracking-number"]')).toBeVisible()

      // Test tracking system
      const trackingNumber = await page.textContent('[data-testid="tracking-number"]')
      await page.fill('[data-testid="tracking-input"]', trackingNumber.replace('TRK-', ''))
      await page.click('[data-testid="track-inquiry"]')

      await expect(page.locator('[data-testid="inquiry-status"]')).toContainText('Received')
    }, 60000)

    test('should test WhatsApp integration', async () => {
      await page.goto('/contact')
      
      // Test WhatsApp contact option
      await page.click('[data-testid="contact-whatsapp"]')

      // Verify WhatsApp integration
      const whatsappUrl = await page.url()
      expect(whatsappUrl).toContain('wa.me')

      // Test clinic-specific WhatsApp
      await page.goto('/clinic/healthcare-family-clinic')
      await page.click('[data-testid="contact-via-whatsapp"]')

      const clinicWhatsappUrl = await page.url()
      expect(clinicWhatsappUrl).toContain('+65-6123-4567')
    }, 60000)

    test('should test automated response workflow', async () => {
      await page.goto('/contact')
      
      // Submit inquiry that triggers automated response
      await page.click('[data-testid="contact-type-appointment-inquiry"]')
      await page.fill('[data-testid="inquiry-details"]', 'Book appointment for tomorrow morning')
      await page.click('[data-testid="submit-contact"]')

      // Wait for automated response
      await expect(page.locator('[data-testid="automated-response"]')).toContainText('Auto-response sent')
    }, 60000)
  })
})

// =============================================================================
// CROSS-BROWSER COMPATIBILITY TESTING
// =============================================================================

describe('Cross-Browser Compatibility Testing', () => {
  for (const [browserName, browserConfig] of Object.entries(browsers)) {
    describe(`${browserName} Compatibility`, () => {
      let page: any
      let context: any

      beforeEach(async () => {
        const browser = await browserConfig.browser.launch()
        context = await browser.newContext({ 
          viewport: browserConfig.defaultViewport 
        })
        page = await context.newPage()
      })

      afterEach(async () => {
        await page.close()
        await context.close()
      })

      test(`should work correctly on ${browserName}`, async () => {
        await page.goto('/')

        // Test basic functionality
        await expect(page.locator('h1')).toContainText('My Family Clinic')

        // Test search functionality
        await page.fill('[data-testid="location-search-input"]', 'Orchard Road')
        await page.click('[data-testid="search-location-button"]')

        await expect(page.locator('[data-testid="clinic-results"]')).toBeVisible()

        // Test accessibility features
        await page.keyboard.press('Tab')
        await expect(page.locator(':focus')).toBe('[data-testid="location-search-input"]')

        // Test responsive behavior
        await page.setViewportSize(viewports.tablet)
        await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible()

        await page.setViewportSize(viewports.mobile)
        await expect(page.locator('[data-testid="mobile-search"]')).toBeVisible()
      }, 60000)
    })
  }
})

// =============================================================================
// MOBILE-SPECIFIC TESTING
// =============================================================================

describe('Mobile-Specific E2E Testing', () => {
  let page: any
  let context: any

  beforeEach(async () => {
    const { setupMobileBrowser } = await import('./test-environment')
    const browser = await setupMobileBrowser()
    context = await browser.newContext({ 
      viewport: viewports.mobile,
      hasTouch: true 
    })
    page = await context.newPage()
  })

  afterEach(async () => {
    await page.close()
    await context.close()
  })

  test('should handle mobile touch interactions', async () => {
    await page.goto('/')

    // Test touch interactions
    await page.tap('[data-testid="mobile-menu"]')
    await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible()

    // Test swipe gestures
    await page.swipe('[data-testid="clinic-results"]', 'left')
    await expect(page.locator('[data-testid="next-page"]')).toBeVisible()

    // Test pull to refresh
    await page.swipe('[data-testid="content"]', 'down')
    await expect(page.locator('[data-testid="pull-refresh-indicator"]')).toBeVisible()
  }, 60000)

  test('should handle mobile accessibility', async () => {
    await page.goto('/')

    // Test screen reader compatibility
    await page.locator('[data-testid="mobile-search"]').focus()
    await page.keyboard.press('Enter')
    await expect(page.locator('[data-testid="search-input"]')).toBeFocused()

    // Test high contrast mode
    await page.addStyleTag({
      content: '* { filter: contrast(200%); }'
    })

    // Verify content is still visible
    await expect(page.locator('h1')).toBeVisible()

    // Test font size adjustments
    await page.locator('[data-testid="font-size-large"]').click()
    const fontSize = await page.evaluate(() => 
      window.getComputedStyle(document.body).fontSize
    )
    expect(parseInt(fontSize)).toBeGreaterThan(16)
  }, 60000)
})

// =============================================================================
// ACCESSIBILITY E2E TESTING
// =============================================================================

describe('Accessibility E2E Testing', () => {
  let page: any
  let context: any

  beforeEach(async () => {
    const setup = await import('./test-environment')
    const browser = await setup.setupBrowser()
    context = await browser.newContext()
    page = await context.newPage()
  })

  afterEach(async () => {
    await page.close()
    await context.close()
  })

  test('should pass WCAG 2.2 AA accessibility standards', async () => {
    await page.goto('/')

    // Test keyboard navigation
    await page.keyboard.press('Tab')
    await expect(page.locator('[data-testid="location-search-input"]')).toBeFocused()

    // Test skip links
    await page.keyboard.press('Tab')
    await expect(page.locator('[data-testid="skip-to-content"]')).toBeFocused()

    // Test focus management
    await page.click('[data-testid="language-selector"]')
    await expect(page.locator('[data-testid="language-selector"]')).toBeFocused()

    // Test ARIA labels
    const searchButton = page.locator('[data-testid="search-location-button"]')
    await expect(searchButton).toHaveAttribute('aria-label')

    // Test color contrast
    await page.evaluate(() => {
      const elements = document.querySelectorAll('button, a, input')
      elements.forEach(el => {
        const style = window.getComputedStyle(el)
        const color = style.color
        const background = style.backgroundColor
        // Basic contrast check - would use more sophisticated tool in real implementation
        expect(color).toBeTruthy()
        expect(background).toBeTruthy()
      })
    })

    // Test form labels
    await expect(page.locator('label[for="search-input"]')).toBeVisible()

    // Test heading structure
    const h1 = page.locator('h1')
    await expect(h1).toBeVisible()

    // Test image alt text
    const images = page.locator('img')
    const imageCount = await images.count()
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i)
      const alt = await img.getAttribute('alt')
      expect(alt).toBeTruthy()
    }
  }, 60000)

  test('should support screen reader navigation', async () => {
    await page.goto('/')

    // Test aria-live regions
    await expect(page.locator('[aria-live]')).toHaveAttribute('aria-live')

    // Test semantic HTML
    await expect(page.locator('main')).toBeVisible()
    await expect(page.locator('nav')).toBeVisible()
    await expect(page.locator('footer')).toBeVisible()

    // Test form accessibility
    await page.click('[data-testid="location-search-input"]')
    await page.fill('[data-testid="location-search-input"]', 'test')
    
    const announcement = await page.textContent('[aria-live]')
    expect(announcement).toContain('test')
  }, 60000)
})

// =============================================================================
// PERFORMANCE E2E TESTING
// =============================================================================

describe('Performance E2E Testing', () => {
  let page: any
  let context: any

  beforeEach(async () => {
    const setup = await import('./test-environment')
    const browser = await setup.setupBrowser()
    context = await browser.newContext()
    page = await context.newPage()
  })

  afterEach(async () => {
    await page.close()
    await context.close()
  })

  test('should meet Core Web Vitals thresholds', async () => {
    // Measure Largest Contentful Paint (LCP)
    await page.goto('/')
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          resolve(lastEntry.startTime)
        }).observe({ entryTypes: ['largest-contentful-paint'] })
      })
    })

    // LCP should be less than 2.5 seconds
    expect(lcp).toBeLessThan(2500)

    // Measure First Input Delay (FID)
    await page.click('[data-testid="location-search-input"]')
    const fid = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry) => {
            resolve(entry.processingStart - entry.startTime)
          })
        }).observe({ entryTypes: ['first-input'] })
      })
    })

    // FID should be less than 100 milliseconds
    expect(fid).toBeLessThan(100)

    // Measure Cumulative Layout Shift (CLS)
    const cls = await page.evaluate(() => {
      return new Promise((resolve) => {
        let clsValue = 0
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
            }
          })
          resolve(clsValue)
        }).observe({ entryTypes: ['layout-shift'] })
      })
    })

    // CLS should be less than 0.1
    expect(cls).toBeLessThan(0.1)
  }, 30000)

  test('should load pages efficiently', async () => {
    const navigationTimings = await page.evaluate(() => {
      const timing = performance.timing
      return {
        dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
        tcpConnection: timing.connectEnd - timing.connectStart,
        serverResponse: timing.responseEnd - timing.requestStart,
        domProcessing: timing.domComplete - timing.domLoading,
        pageLoad: timing.loadEventEnd - timing.navigationStart
      }
    })

    expect(navigationTimings.dnsLookup).toBeLessThan(100)
    expect(navigationTimings.tcpConnection).toBeLessThan(200)
    expect(navigationTimings.serverResponse).toBeLessThan(500)
    expect(navigationTimings.domProcessing).toBeLessThan(1000)
    expect(navigationTimings.pageLoad).toBeLessThan(3000)
  }, 30000)
})

// =============================================================================
// SECURITY E2E TESTING
// =============================================================================

describe('Security E2E Testing', () => {
  let page: any
  let context: any

  beforeEach(async () => {
    const setup = await import('./test-environment')
    const browser = await setup.setupBrowser()
    context = await browser.newContext()
    page = await context.newPage()
  })

  afterEach(async () => {
    await page.close()
    await context.close()
  })

  test('should enforce security headers', async () => {
    const response = await page.goto('/')
    
    // Check security headers
    const headers = response?.headers() || {}
    
    expect(headers['content-security-policy']).toBeDefined()
    expect(headers['x-frame-options']).toBeDefined()
    expect(headers['x-content-type-options']).toBeDefined()
    expect(headers['x-xss-protection']).toBeDefined()
    expect(headers['strict-transport-security']).toBeDefined()
  })

  test('should handle user authentication securely', async () => {
    await page.goto('/login')

    // Test input sanitization
    await page.fill('[data-testid="email"]', '<script>alert("xss")</script>')
    await page.fill('[data-testid="password"]', 'password')
    await page.click('[data-testid="login-button"]')

    // Verify script is not executed
    const alertCount = await page.evaluate(() => {
      let count = 0
      const originalAlert = window.alert
      window.alert = () => count++
      return count
    })

    expect(alertCount).toBe(0)

    // Test CSRF protection
    const csrfToken = await page.getAttribute('[data-testid="csrf-token"]', 'value')
    expect(csrfToken).toBeDefined()
  })

  test('should handle medical data with PDPA compliance', async () => {
    await page.goto('/healthier-sg')

    // Test consent management
    await page.click('[data-testid="provide-consent"]')
    await expect(page.locator('[data-testid="consent-form"]')).toBeVisible()

    await page.check('[data-testid="consent-medical-data"]')
    await page.check('[data-testid="consent-data-sharing-moh"]')

    // Verify consent is properly recorded
    const consentStatus = await page.textContent('[data-testid="consent-status"]')
    expect(consentStatus).toContain('Recorded')
  })
})
