/**
 * Test Environment Setup and Utilities
 * Comprehensive test environment configuration for My Family Clinic testing suites
 */

import { chromium, Browser, BrowserContext, Page } from 'playwright'
import { setup as setupVitest } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

// =============================================================================
// BROWSER ENVIRONMENT SETUP
// =============================================================================

export interface TestBrowser {
  browser: Browser
  context: BrowserContext
  page: Page
}

export interface ViewportConfig {
  width: number
  height: number
  deviceScaleFactor?: number
  isMobile?: boolean
  hasTouch?: boolean
}

// Viewport configurations
export const VIEWPORTS = {
  desktop: { width: 1920, height: 1080 },
  laptop: { width: 1366, height: 768 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 },
  'mobile-large': { width: 414, height: 896 }
}

// Device configurations
export const DEVICES = {
  'iPhone 14 Pro': {
    viewport: { width: 393, height: 852 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true
  },
  'iPad Pro': {
    viewport: { width: 1024, height: 1366 },
    deviceScaleFactor: 2,
    isMobile: false,
    hasTouch: true
  },
  'Samsung Galaxy S21': {
    viewport: { width: 384, height: 854 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true
  }
}

// =============================================================================
// BROWSER SETUP FUNCTIONS
// =============================================================================

export async function setupBrowser(options: {
  viewport?: ViewportConfig
  device?: keyof typeof DEVICES
  headless?: boolean
  slowMo?: number
} = {}): Promise<Browser> {
  const {
    viewport = VIEWPORTS.desktop,
    device,
    headless = true,
    slowMo = 0
  } = options

  const launchOptions: any = {
    headless,
    slowMo,
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-extensions',
      '--disable-plugins'
    ]
  }

  // Add device emulation if specified
  if (device) {
    const deviceConfig = DEVICES[device]
    launchOptions.deviceScaleFactor = deviceConfig.deviceScaleFactor
    launchOptions.hasTouch = deviceConfig.hasTouch
  }

  const browser = await chromium.launch(launchOptions)
  
  // Set viewport
  if (viewport) {
    browser.defaultContext().setViewportSize(viewport)
  }

  return browser
}

export async function setupMobileBrowser(): Promise<Browser> {
  return setupBrowser({
    device: 'iPhone 14 Pro',
    headless: true
  })
}

export async function setupTabletBrowser(): Promise<Browser> {
  return setupBrowser({
    device: 'iPad Pro',
    headless: true
  })
}

// =============================================================================
// TEST CONTEXT SETUP
// =============================================================================

export interface TestContext {
  browser: Browser
  context: BrowserContext
  page: Page
  userId?: string
  clinicId?: string
  doctorId?: string
  appointmentId?: string
}

export async function createTestContext(options: {
  viewport?: ViewportConfig
  userRole?: 'patient' | 'doctor' | 'admin'
  setupData?: boolean
} = {}): Promise<TestContext> {
  const {
    viewport = VIEWPORTS.desktop,
    userRole = 'patient',
    setupData = true
  } = options

  const browser = await setupBrowser({ viewport })
  const context = await browser.newContext({
    viewport,
    hasTouch: viewport.isMobile || false
  })
  
  const page = await context.newPage()

  // Set up test data if requested
  let userId, clinicId, doctorId, appointmentId
  
  if (setupData) {
    const testData = await setupTestData(userRole)
    userId = testData.userId
    clinicId = testData.clinicId
    doctorId = testData.doctorId
    appointmentId = testData.appointmentId
  }

  // Configure page for testing
  await page.addInitScript(() => {
    // Disable animations for consistent testing
    document.documentElement.style.setProperty('--animation-duration', '0ms')
    
    // Add test attributes for easier selection
    document.documentElement.setAttribute('data-test-env', 'playwright')
    
    // Mock IntersectionObserver for consistent behavior
    window.IntersectionObserver = class IntersectionObserver {
      constructor() {}
      disconnect() {}
      observe() {}
      takeRecords() { return [] }
      unobserve() {}
    }
  })

  return {
    browser,
    context,
    page,
    userId,
    clinicId,
    doctorId,
    appointmentId
  }
}

// =============================================================================
// TEST DATA SETUP
// =============================================================================

export interface TestData {
  userId: string
  clinicId: string
  doctorId: string
  appointmentId: string
  patientId: string
  serviceId: string
  reviewId: string
  contactId: string
}

export async function setupTestData(userRole: 'patient' | 'doctor' | 'admin' = 'patient'): Promise<TestData> {
  const timestamp = Date.now()
  const randomId = Math.random().toString(36).substr(2, 9)
  
  const baseId = `${userRole}-${timestamp}-${randomId}`
  
  return {
    userId: `user-${baseId}`,
    clinicId: `clinic-${baseId}`,
    doctorId: `doctor-${baseId}`,
    appointmentId: `apt-${baseId}`,
    patientId: `patient-${baseId}`,
    serviceId: `service-${baseId}`,
    reviewId: `review-${baseId}`,
    contactId: `contact-${baseId}`
  }
}

// =============================================================================
// HEALTHCARE-SPECIFIC TEST HELPERS
// =============================================================================

export interface HealthcareTestData {
  singaporeIc: string
  mohRegistration: string
  clinicAccreditation: string
  medicalLicense: string
  healthierSgRegistration: string
  medishieldPolicy: string
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }
}

export function generateSingaporeTestData(): HealthcareTestData {
  return {
    singaporeIc: 'S1234567A',
    mohRegistration: 'MH123456',
    clinicAccreditation: 'AC001234',
    medicalLicense: 'ML789012',
    healthierSgRegistration: 'HSG001234',
    medishieldPolicy: 'MS12345678',
    emergencyContact: {
      name: 'Jane Doe',
      phone: '+65-9123-4567',
      relationship: 'Spouse'
    }
  }
}

export async function setupHealthcareTestContext(userRole: 'patient' | 'doctor' | 'admin' = 'patient'): Promise<TestContext> {
  const context = await createTestContext({
    userRole,
    setupData: true
  })

  // Add healthcare-specific data
  const healthcareData = generateSingaporeTestData()
  await context.page.addInitScript((data) => {
    window.testHealthcareData = data
  }, healthcareData)

  return context
}

// =============================================================================
// ACCESSIBILITY TEST HELPERS
// =============================================================================

export async function enableAccessibilityFeatures(page: Page): Promise<void> {
  await page.addInitScript(() => {
    // Enable high contrast
    document.documentElement.classList.add('high-contrast')
    
    // Set large font size
    document.documentElement.style.fontSize = '18px'
    
    // Enable reduced motion
    document.documentElement.classList.add('reduce-motion')
    
    // Add accessibility attributes
    const interactiveElements = document.querySelectorAll('button, a, input, select, textarea')
    interactiveElements.forEach((el) => {
      if (!el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby')) {
        const text = el.textContent?.trim()
        if (text) {
          el.setAttribute('aria-label', text)
        }
      }
    })
  })
}

export async function setupScreenReaderSimulation(page: Page): Promise<void> {
  await page.addInitScript(() => {
    // Mock screen reader announcements
    const announceElement = document.createElement('div')
    announceElement.setAttribute('aria-live', 'assertive')
    announceElement.setAttribute('aria-atomic', 'true')
    announceElement.style.position = 'absolute'
    announceElement.style.left = '-10000px'
    announceElement.style.width = '1px'
    announceElement.style.height = '1px'
    announceElement.style.overflow = 'hidden'
    announceElement.id = 'screen-reader-announcements'
    document.body.appendChild(announceElement)

    // Override console.log to announce to screen readers
    const originalLog = console.log
    console.log = function(...args) {
      originalLog.apply(console, args)
      announceElement.textContent = args.join(' ')
    }
  })
}

// =============================================================================
// PERFORMANCE TEST HELPERS
// =============================================================================

export interface PerformanceMetrics {
  loadTime: number
  domContentLoaded: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  cumulativeLayoutShift: number
  firstInputDelay: number
}

export async function measurePagePerformance(page: Page): Promise<PerformanceMetrics> {
  return await page.evaluate(() => {
    return new Promise((resolve) => {
      const metrics: Partial<PerformanceMetrics> = {}
      
      // Navigation timing
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigation) {
        metrics.loadTime = navigation.loadEventEnd - navigation.navigationStart
        metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.navigationStart
      }
      
      // Paint timing
      const paintEntries = performance.getEntriesByType('paint')
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint')
      if (fcpEntry) {
        metrics.firstContentfulPaint = fcpEntry.startTime
      }
      
      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        metrics.largestContentfulPaint = lastEntry.startTime
        lcpObserver.disconnect()
        
        // Layout shift
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0
          const clsEntries = list.getEntries()
          clsEntries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
            }
          })
          metrics.cumulativeLayoutShift = clsValue
          
          // First Input Delay
          const fidObserver = new PerformanceObserver((list) => {
            const fidEntries = list.getEntries()
            if (fidEntries.length > 0) {
              const fidEntry = fidEntries[0] as any
              metrics.firstInputDelay = fidEntry.processingStart - fidEntry.startTime
            }
            
            resolve(metrics as PerformanceMetrics)
          })
          
          fidObserver.observe({ entryTypes: ['first-input'] })
        })
        
        clsObserver.observe({ entryTypes: ['layout-shift'] })
      })
      
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
    })
  })
}

// =============================================================================
// MOCK SERVICES AND API HELPERS
// =============================================================================

export interface MockServiceConfig {
  delay?: number
  errorRate?: number
  responseData?: any
}

export function setupMockAPI(page: Page): void {
  page.addInitScript(() => {
    // Mock fetch for testing
    const originalFetch = window.fetch
    
    window.fetch = async function(url: string, options?: any) {
      // Add artificial delay for testing
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Mock responses for different endpoints
      const mockResponses: { [key: string]: any } = {
        '/api/clinics': {
          success: true,
          data: [
            {
              id: 'clinic-1',
              name: 'HealthCare Family Clinic',
              address: '123 Medical Center, Singapore',
              phone: '+65-6123-4567',
              rating: 4.5,
              healthierSGEnrolled: true
            }
          ]
        },
        '/api/doctors': {
          success: true,
          data: [
            {
              id: 'doctor-1',
              name: 'Dr. Sarah Chen',
              specialty: 'Family Medicine',
              rating: 4.8,
              healthierSGAffiliated: true
            }
          ]
        },
        '/api/services': {
          success: true,
          data: [
            {
              id: 'service-1',
              name: 'General Consultation',
              category: 'Primary Care',
              price: 45,
              duration: 30
            }
          ]
        }
      }
      
      // Return mock response or original fetch
      const mockResponse = mockResponses[url]
      if (mockResponse) {
        return new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      }
      
      return originalFetch.apply(this, arguments as any)
    }
  })
}

// =============================================================================
// CLEANUP AND TEARDOWN HELPERS
// =============================================================================

export async function cleanupTestContext(context: TestContext): Promise<void> {
  if (context.page) {
    await context.page.close()
  }
  if (context.context) {
    await context.context.close()
  }
  if (context.browser) {
    await context.browser.close()
  }
}

export async function cleanupAllContexts(contexts: TestContext[]): Promise<void> {
  await Promise.all(contexts.map(cleanupTestContext))
}

// =============================================================================
// TEST CONFIGURATION HELPERS
// =============================================================================

export function getTestConfig(): {
  baseUrl: string
  timeout: number
  retries: number
  parallel: boolean
} {
  return {
    baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000',
    timeout: parseInt(process.env.TEST_TIMEOUT || '30000'),
    retries: parseInt(process.env.TEST_RETRIES || '2'),
    parallel: process.env.TEST_PARALLEL === 'true'
  }
}

export function setupTestEnvironment(): void {
  // Set up global test configuration
  global.testConfig = getTestConfig()
  
  // Set up error handling
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  })
  
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error)
  })
}

// =============================================================================
// ASSERTION HELPERS
// =============================================================================

export async function waitForElementVisible(page: Page, selector: string, timeout = 5000): Promise<void> {
  await page.waitForSelector(selector, { state: 'visible', timeout })
}

export async function waitForElementHidden(page: Page, selector: string, timeout = 5000): Promise<void> {
  await page.waitForSelector(selector, { state: 'hidden', timeout })
}

export async function fillAndVerify(page: Page, selector: string, value: string): Promise<void> {
  await page.fill(selector, value)
  const actualValue = await page.inputValue(selector)
  expect(actualValue).toBe(value)
}

export async function clickAndVerify(page: Page, selector: string): Promise<void> {
  await page.click(selector)
  // Verify the click was successful
  await page.waitForTimeout(100)
}

// =============================================================================
// EXPORT DEFAULT SETUP
// =============================================================================

export default {
  setupBrowser,
  setupMobileBrowser,
  setupTabletBrowser,
  createTestContext,
  setupHealthcareTestContext,
  enableAccessibilityFeatures,
  setupScreenReaderSimulation,
  measurePagePerformance,
  setupMockAPI,
  cleanupTestContext,
  cleanupAllContexts,
  setupTestEnvironment,
  getTestConfig
}
