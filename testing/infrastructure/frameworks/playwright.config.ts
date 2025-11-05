import { defineConfig, devices } from '@playwright/test'

/**
 * Healthcare-specific Playwright configuration for My Family Clinic
 * Supports cross-browser testing for healthcare workflows
 */

export default defineConfig({
  testDir: './testing/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'test-results/e2e-results', open: 'never' }],
    ['json', { outputFile: 'test-results/e2e-results/results.json' }],
    ['junit', { outputFile: 'test-results/e2e-results/results.xml' }],
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 30000, // Extended timeout for healthcare data processing
    navigationTimeout: 30000,
  },

  projects: [
    // Desktop browsers for comprehensive testing
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /chromium.*/,
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testMatch: /firefox.*/,
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testMatch: /webkit.*/,
    },
    {
      name: 'edge',
      use: { ...devices['Desktop Edge'] },
      testMatch: /edge.*/,
    },

    // Mobile browsers for responsive healthcare UI
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
      testMatch: /mobile.*/,
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
      testMatch: /mobile.*/,
    },

    // Accessibility testing
    {
      name: 'chromium-a11y',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /a11y.*/,
      dependencies: ['@axe-core/playwright'],
    },

    // Healthcare-specific test groups
    {
      name: 'chromium-healthcare',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /healthcare.*/,
      expectTimeout: 10000,
    },

    // API testing
    {
      name: 'chromium-api',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /api.*/,
    },

    // Performance testing
    {
      name: 'chromium-performance',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /performance.*/,
      dependencies: ['lighthouse'],
    },
  ],

  // Healthcare-specific test configuration
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.02, // 2% pixel difference threshold
      animations: 'disabled', // Disable animations for consistent screenshots
    },
    toContainText: {
      timeout: 10000,
    },
    toHaveValue: {
      timeout: 5000,
    },
  },

  // Timeouts for healthcare workflows
  timeout: 60000, // 1 minute for complete healthcare workflows
  globalTimeout: 1800000, // 30 minutes for full test suite

  // Network configuration for API testing
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
})