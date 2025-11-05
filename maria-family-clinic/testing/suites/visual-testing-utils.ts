/**
 * Visual Testing Utilities
 * Comprehensive visual testing utilities for My Family Clinic platform
 */

import { Page, ElementHandle, Locator } from 'playwright'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'

// =============================================================================
// VISUAL TESTING CONFIGURATION
// =============================================================================

export interface VisualTestConfig {
  threshold: number
  outputDir: string
  baselineDir: string
  diffDir: string
  enableAutoBaseline: boolean
  screenshotType: 'png' | 'jpeg'
  fullPage: boolean
  animations: 'disabled' | 'enabled'
}

export const DEFAULT_VISUAL_CONFIG: VisualTestConfig = {
  threshold: 0.95, // 95% similarity threshold
  outputDir: 'testing/snapshots/output',
  baselineDir: 'testing/snapshots/baselines',
  diffDir: 'testing/snapshots/diffs',
  enableAutoBaseline: false,
  screenshotType: 'png',
  fullPage: false,
  animations: 'disabled'
}

// =============================================================================
// DIRECTORY MANAGEMENT
// =============================================================================

export function setupVisualDirectories(config: VisualTestConfig = DEFAULT_VISUAL_CONFIG): void {
  const directories = [
    config.outputDir,
    config.baselineDir,
    config.diffDir
  ]

  directories.forEach(dir => {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
  })
}

// =============================================================================
// SCREENSHOT UTILITIES
// =============================================================================

export interface ScreenshotOptions {
  fullPage?: boolean
  clip?: {
    x: number
    y: number
    width: number
    height: number
  }
  animations?: 'disabled' | 'enabled'
  quality?: number
  type?: 'png' | 'jpeg'
}

export async function takeScreenshot(
  page: Page,
  name: string,
  options: ScreenshotOptions = {},
  config: VisualTestConfig = DEFAULT_VISUAL_CONFIG
): Promise<string> {
  setupVisualDirectories(config)

  const fileName = `${name}.${config.screenshotType}`
  const filePath = join(config.outputDir, fileName)

  const screenshotOptions: any = {
    fullPage: options.fullPage ?? config.fullPage,
    animations: options.animations ?? config.animations,
    type: options.type ?? config.screenshotType
  }

  if (options.clip) {
    screenshotOptions.clip = options.clip
  }

  if (screenshotOptions.type === 'jpeg' && options.quality) {
    screenshotOptions.quality = options.quality
  }

  await page.screenshot({ 
    path: filePath,
    ...screenshotOptions
  })

  return filePath
}

export async function takeElementScreenshot(
  element: ElementHandle | Locator,
  name: string,
  options: ScreenshotOptions = {},
  config: VisualTestConfig = DEFAULT_VISUAL_CONFIG
): Promise<string> {
  setupVisualDirectories(config)

  const fileName = `${name}.${config.screenshotType}`
  const filePath = join(config.outputDir, fileName)

  await element.screenshot({ 
    path: filePath,
    animations: options.animations ?? config.animations,
    type: options.type ?? config.screenshotType
  })

  return filePath
}

// =============================================================================
// BASELINE MANAGEMENT
// =============================================================================

export async function createBaseline(
  currentPath: string,
  name: string,
  config: VisualTestConfig = DEFAULT_VISUAL_CONFIG
): Promise<string> {
  setupVisualDirectories(config)

  const baselineName = `${name}-baseline.${config.screenshotType}`
  const baselinePath = join(config.baselineDir, baselineName)

  // Copy current screenshot to baseline directory
  const currentImage = readFileSync(currentPath)
  writeFileSync(baselinePath, currentImage)

  return baselinePath
}

export async function compareWithBaseline(
  currentPath: string,
  name: string,
  config: VisualTestConfig = DEFAULT_VISUAL_CONFIG
): Promise<{
  baselineExists: boolean
  similarity: number
  diffPath?: string
}> {
  setupVisualDirectories(config)

  const baselineName = `${name}-baseline.${config.screenshotType}`
  const baselinePath = join(config.baselineDir, baselineName)

  if (!existsSync(baselinePath)) {
    return {
      baselineExists: false,
      similarity: 0
    }
  }

  const currentImage = readFileSync(currentPath)
  const baselineImage = readFileSync(baselinePath)

  // Simple pixel-by-pixel comparison (in a real implementation, 
  // you would use a proper image comparison library like pixelmatch)
  const similarity = calculateImageSimilarity(currentImage, baselineImage)

  // Create diff image if similarity is below threshold
  let diffPath: string | undefined
  if (similarity < config.threshold) {
    diffPath = await createDiffImage(
      currentPath,
      baselinePath,
      name,
      config
    )
  }

  return {
    baselineExists: true,
    similarity,
    diffPath
  }
}

// =============================================================================
// IMAGE COMPARISON UTILITIES
// =============================================================================

function calculateImageSimilarity(image1: Buffer, image2: Buffer): number {
  // This is a simplified image comparison
  // In a real implementation, you would use a proper image comparison library
  if (image1.length !== image2.length) {
    return 0
  }

  let matchingPixels = 0
  const totalPixels = image1.length

  for (let i = 0; i < totalPixels; i++) {
    if (image1[i] === image2[i]) {
      matchingPixels++
    }
  }

  return matchingPixels / totalPixels
}

async function createDiffImage(
  currentPath: string,
  baselinePath: string,
  name: string,
  config: VisualTestConfig
): Promise<string> {
  const diffName = `${name}-diff.${config.screenshotType}`
  const diffPath = join(config.diffDir, diffName)

  // In a real implementation, you would use pixelmatch or similar
  // For now, we'll just copy the current image as the "diff"
  const currentImage = readFileSync(currentPath)
  writeFileSync(diffPath, currentImage)

  return diffPath
}

// =============================================================================
// HEALTHCARE-SPECIFIC VISUAL TESTING
// =============================================================================

export interface HealthcareVisualElements {
  clinicCards: Locator
  doctorCards: Locator
  serviceCards: Locator
  appointmentBooking: Locator
  contactForms: Locator
  searchInterface: Locator
  healthierSgComponents: Locator
  medicalIcons: Locator
  statusIndicators: Locator
  accessibilityFeatures: Locator
}

export async function setupHealthcareVisualTesting(
  page: Page,
  config: VisualTestConfig = DEFAULT_VISUAL_CONFIG
): Promise<HealthcareVisualElements> {
  // Wait for page to load
  await page.waitForLoadState('networkidle')

  // Disable animations for consistent testing
  await page.addStyleTag({
    content: `
      *,
      *::before,
      *::after {
        animation-duration: 0ms !important;
        animation-delay: 0ms !important;
        transition-duration: 0ms !important;
        transition-delay: 0ms !important;
      }
    `
  })

  // Add healthcare-specific test attributes
  await page.addInitScript(() => {
    document.documentElement.setAttribute('data-visual-test', 'true')
    document.documentElement.setAttribute('data-healthcare-app', 'true')
  })

  return {
    clinicCards: page.locator('[data-testid="clinic-card"]'),
    doctorCards: page.locator('[data-testid="doctor-card"]'),
    serviceCards: page.locator('[data-testid="service-card"]'),
    appointmentBooking: page.locator('[data-testid="appointment-booking"]'),
    contactForms: page.locator('[data-testid="contact-form"]'),
    searchInterface: page.locator('[data-testid="search-interface"]'),
    healthierSgComponents: page.locator('[data-testid="healthier-sg"], [class*="healthier-sg"]'),
    medicalIcons: page.locator('[data-testid*="icon"], [class*="medical-icon"], [class*="health-icon"]'),
    statusIndicators: page.locator('[data-testid*="status"], [class*="status"], [class*="badge"]'),
    accessibilityFeatures: page.locator('[data-testid*="accessibility"], [class*="accessibility"]')
  }
}

// =============================================================================
// RESPONSIVE VISUAL TESTING
// =============================================================================

export interface ResponsiveVisualTest {
  name: string
  viewport: { width: number; height: number }
  deviceScaleFactor?: number
  isMobile?: boolean
}

export const RESPONSIVE_VIEWPORTS: ResponsiveVisualTest[] = [
  { name: 'desktop', viewport: { width: 1920, height: 1080 } },
  { name: 'laptop', viewport: { width: 1366, height: 768 } },
  { name: 'tablet', viewport: { width: 768, height: 1024 } },
  { name: 'mobile', viewport: { width: 375, height: 667 }, isMobile: true },
  { name: 'mobile-large', viewport: { width: 414, height: 896 }, isMobile: true }
]

export async function testResponsiveVisualConsistency(
  page: Page,
  url: string,
  elementSelector: string,
  config: VisualTestConfig = DEFAULT_VISUAL_CONFIG
): Promise<{ [key: string]: string }> {
  const results: { [key: string]: string } = {}

  for (const viewport of RESPONSIVE_VIEWPORTS) {
    await page.setViewportSize(viewport.viewport)
    await page.goto(url)
    await page.waitForLoadState('networkidle')

    const screenshotPath = await takeScreenshot(
      page,
      `${elementSelector.replace(/[^a-zA-Z0-9]/g, '_')}-${viewport.name}`,
      { fullPage: config.fullPage },
      config
    )

    const comparison = await compareWithBaseline(
      screenshotPath,
      `${elementSelector.replace(/[^a-zA-Z0-9]/g, '_')}-${viewport.name}`,
      config
    )

    results[viewport.name] = `${comparison.similarity * 100}%`

    if (!comparison.baselineExists && config.enableAutoBaseline) {
      await createBaseline(screenshotPath, `${elementSelector.replace(/[^a-zA-Z0-9]/g, '_')}-${viewport.name}`, config)
    }
  }

  return results
}

// =============================================================================
// ACCESSIBILITY VISUAL TESTING
// =============================================================================

export interface AccessibilityVisualTest {
  feature: string
  selector: string
  description: string
}

export const ACCESSIBILITY_VISUAL_TESTS: AccessibilityVisualTest[] = [
  { feature: 'high_contrast', selector: '[data-testid="high-contrast-toggle"]', description: 'High contrast mode toggle' },
  { feature: 'font_size', selector: '[data-testid="font-size-controls"]', description: 'Font size adjustment controls' },
  { feature: 'screen_reader', selector: '[aria-live]', description: 'Screen reader live regions' },
  { feature: 'skip_links', selector: '[data-testid="skip-link"]', description: 'Skip navigation links' },
  { feature: 'focus_indicators', selector: ':focus', description: 'Focus indicators' },
  { feature: 'aria_labels', selector: '[aria-label]', description: 'ARIA labels for accessibility' }
]

export async function testAccessibilityVisualFeatures(
  page: Page,
  config: VisualTestConfig = DEFAULT_VISUAL_CONFIG
): Promise<{ [key: string]: string }> {
  const results: { [key: string]: string } = {}

  for (const test of ACCESSIBILITY_VISUAL_TESTS) {
    try {
      const element = page.locator(test.selector)
      
      if (await element.count() > 0) {
        const screenshotPath = await takeElementScreenshot(
          element.first(),
          `accessibility-${test.feature}`,
          { animations: 'disabled' },
          config
        )

        const comparison = await compareWithBaseline(
          screenshotPath,
          `accessibility-${test.feature}`,
          config
        )

        results[test.feature] = `${comparison.similarity * 100}%`
      } else {
        results[test.feature] = 'Element not found'
      }
    } catch (error) {
      results[test.feature] = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }

  return results
}

// =============================================================================
// ANIMATION TESTING
// =============================================================================

export async function disableAnimations(page: Page): Promise<void> {
  await page.addStyleTag({
    content: `
      *,
      *::before,
      *::after {
        animation-duration: 0ms !important;
        animation-delay: 0ms !important;
        transition-duration: 0ms !important;
        transition-delay: 0ms !important;
      }
    `
  })
}

export async function enableAnimations(page: Page): Promise<void> {
  await page.addStyleTag({
    content: `
      *,
      *::before,
      *::after {
        animation-duration: inherit !important;
        animation-delay: inherit !important;
        transition-duration: inherit !important;
        transition-delay: inherit !important;
      }
    `
  })
}

export async function testAnimationPerformance(
  page: Page,
  animationSelector: string,
  config: VisualTestConfig = DEFAULT_VISUAL_CONFIG
): Promise<{
  animationDuration: number
  frameCount: number
  fps: number
}> {
  await page.goto(page.url())
  await page.waitForLoadState('networkidle')

  const startTime = Date.now()
  let frameCount = 0

  // Monitor animation frames
  await page.evaluate((selector) => {
    return new Promise((resolve) => {
      const element = document.querySelector(selector)
      if (!element) {
        resolve({ frameCount: 0, endTime: Date.now() })
        return
      }

      let lastTime = performance.now()
      const observer = new MutationObserver(() => {
        frameCount++
        lastTime = performance.now()
      })

      observer.observe(element, { attributes: true, childList: true, subtree: true })

      setTimeout(() => {
        observer.disconnect()
        resolve({ frameCount, endTime: Date.now() })
      }, 2000)
    })
  }, animationSelector)

  const endTime = Date.now()
  const duration = endTime - startTime

  return {
    animationDuration: duration,
    frameCount,
    fps: frameCount / (duration / 1000)
  }
}

// =============================================================================
// PERFORMANCE VISUAL TESTING
// =============================================================================

export async function testVisualLoadingPerformance(
  page: Page,
  url: string,
  config: VisualTestConfig = DEFAULT_VISUAL_CONFIG
): Promise<{
  firstContentfulPaint: number
  largestContentfulPaint: number
  loadComplete: number
  screenshotPath: string
}> {
  await page.goto(url)
  
  // Measure performance metrics
  const metrics = await page.evaluate(() => {
    return new Promise((resolve) => {
      const results: any = {}
      
      // First Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint')
        if (fcpEntry) {
          results.firstContentfulPaint = fcpEntry.startTime
        }
      }).observe({ entryTypes: ['paint'] })

      // Largest Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        results.largestContentfulPaint = lastEntry.startTime
        
        // Load complete measurement
        results.loadComplete = performance.now()
        
        resolve(results)
      }).observe({ entryTypes: ['largest-contentful-paint'] })
    })
  })

  // Take screenshot when page is visually complete
  await page.waitForSelector('body')
  await page.waitForLoadState('networkidle')

  const screenshotPath = await takeScreenshot(
    page,
    `performance-${Date.now()}`,
    { fullPage: true },
    config
  )

  return {
    ...metrics,
    screenshotPath
  }
}

// =============================================================================
// MULTI-BROWSER VISUAL TESTING
// =============================================================================

export interface BrowserVisualTest {
  browser: string
  userAgent: string
  viewport: { width: number; height: number }
}

export const BROWSER_CONFIGS: BrowserVisualTest[] = [
  { browser: 'Chrome', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', viewport: { width: 1920, height: 1080 } },
  { browser: 'Firefox', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0', viewport: { width: 1920, height: 1080 } },
  { browser: 'Safari', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15', viewport: { width: 1920, height: 1080 } }
]

export async function testCrossBrowserVisualConsistency(
  page: Page,
  url: string,
  config: VisualTestConfig = DEFAULT_VISUAL_CONFIG
): Promise<{ [key: string]: string }> {
  const results: { [key: string]: string } = {}

  for (const browserConfig of BROWSER_CONFIGS) {
    await page.setExtraHTTPHeaders({
      'User-Agent': browserConfig.userAgent
    })
    
    await page.setViewportSize(browserConfig.viewport)
    await page.goto(url)
    await page.waitForLoadState('networkidle')

    const screenshotPath = await takeScreenshot(
      page,
      `cross-browser-${browserConfig.browser.toLowerCase()}`,
      { fullPage: config.fullPage },
      config
    )

    const comparison = await compareWithBaseline(
      screenshotPath,
      `cross-browser-${browserConfig.browser.toLowerCase()}`,
      config
    )

    results[browserConfig.browser] = `${comparison.similarity * 100}%`
  }

  return results
}

// =============================================================================
// MAIN VISUAL TESTING SETUP FUNCTION
// =============================================================================

export async function setupVisualTesting(
  page: Page,
  config: VisualTestConfig = DEFAULT_VISUAL_CONFIG
): Promise<void> {
  setupVisualDirectories(config)
  await disableAnimations(page)
  
  // Set up healthcare-specific visual testing
  await setupHealthcareVisualTesting(page, config)
  
  // Add visual test identification
  await page.addInitScript(() => {
    document.documentElement.setAttribute('data-visual-testing', 'true')
    document.documentElement.classList.add('visual-testing-mode')
  })
}

// =============================================================================
// EXPORT DEFAULT CONFIGURATION
// =============================================================================

export {
  DEFAULT_VISUAL_CONFIG,
  setupVisualDirectories,
  takeScreenshot,
  takeElementScreenshot,
  createBaseline,
  compareWithBaseline,
  setupHealthcareVisualTesting,
  testResponsiveVisualConsistency,
  testAccessibilityVisualFeatures,
  testAnimationPerformance,
  testVisualLoadingPerformance,
  testCrossBrowserVisualConsistency,
  setupVisualTesting
}
