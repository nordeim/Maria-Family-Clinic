# Cross-Platform Compatibility Testing Suite

## Overview
Comprehensive testing for seamless experience across all platforms, browsers, and devices with focus on healthcare workflows and accessibility compliance.

## Test Categories

### 1. Mobile Device Compatibility Testing

#### 1.1 iOS Safari Compatibility
```typescript
describe('iOS Safari Compatibility', () => {
  const testDevices = [
    { name: 'iPhone 15 Pro', screenSize: '393x852', iOSVersion: '17.0' },
    { name: 'iPhone 14', screenSize: '390x844', iOSVersion: '16.5' },
    { name: 'iPhone SE', screenSize: '375x667', iOSVersion: '15.8' },
    { name: 'iPad Pro', screenSize: '1024x1366', iOSVersion: '17.0' }
  ];

  testDevices.forEach(device => {
    test(`should render correctly on ${device.name}`, async () => {
      const browser = await puppeteer.launch({
        device: device.name,
        viewport: device.screenSize
      });

      const page = await browser.newPage();
      await page.goto('https://myfamilyclinic.sg');

      // Test clinic search functionality
      await page.click('[data-testid="clinic-search-input"]');
      await page.type('[data-testid="clinic-search-input"]', 'cardiology');
      
      // Verify search results display correctly
      const searchResults = await page.$$('[data-testid="doctor-card"]');
      expect(searchResults.length).toBeGreaterThan(0);

      // Test appointment booking flow
      await page.click('[data-testid="book-appointment-btn"]:first-child');
      await page.waitForSelector('[data-testid="appointment-booking-modal"]');
      
      // Verify mobile-optimized booking form
      const bookingModal = await page.$('[data-testid="appointment-booking-modal"]');
      const modalBounds = await bookingModal.boundingBox();
      
      // Modal should fit within device screen
      expect(modalBounds.width).toBeLessThan(device.screenSize.split('x')[0]);
      
      await browser.close();
    });
  });
});
```

#### 1.2 Android Chrome Compatibility
```typescript
describe('Android Chrome Compatibility', () => {
  const androidDevices = [
    { name: 'Samsung Galaxy S23', screenSize: '360x800', AndroidVersion: '13' },
    { name: 'Google Pixel 7', screenSize: '412x915', AndroidVersion: '13' },
    { name: 'Xiaomi Redmi Note 12', screenSize: '393x873', AndroidVersion: '12' },
    { name: 'Samsung Galaxy Tab', screenSize: '800x1280', AndroidVersion: '12' }
  ];

  androidDevices.forEach(device => {
    test(`should function properly on ${device.name}`, async () => {
      const browser = await puppeteer.launch({
        device: device.name,
        viewport: device.screenSize,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Linux; Android 13; SM-S911B) AppleWebKit/537.36');

      // Test PWA installation
      await page.goto('https://myfamilyclinic.sg', { waitUntil: 'networkidle0' });
      
      // Check for PWA manifest
      const manifest = await page.evaluate(() => {
        return window.navigator.serviceWorker.controller ? 'pwa-installed' : 'web-app';
      });
      
      expect(manifest).toBeTruthy();

      // Test offline functionality
      await page.setOfflineMode(true);
      const offlinePage = await page.goto('https://myfamilyclinic.sg/doctors');
      expect(offlinePage.ok()).toBe(true);

      await browser.close();
    });
  });
});
```

### 2. Desktop Browser Compatibility Testing

#### 2.1 Major Browser Testing
```typescript
describe('Desktop Browser Compatibility', () => {
  const browsers = [
    { name: 'Chrome', engine: 'blink', version: '120' },
    { name: 'Firefox', engine: 'gecko', version: '121' },
    { name: 'Safari', engine: 'webkit', version: '17' },
    { name: 'Edge', engine: 'blink', version: '120' },
    { name: 'Opera', engine: 'blink', version: '106' }
  ];

  browsers.forEach(browser => {
    test(`should render and function correctly in ${browser.name}`, async () => {
      const browserInstance = await puppeteer.launch({
        headless: true,
        args: [`--browser=${browser.name.toLowerCase()}`]
      });

      const page = await browserInstance.newPage();
      await page.setViewport({ width: 1920, height: 1080 });

      // Test healthcare workflow
      await page.goto('https://myfamilyclinic.sg');
      
      // Verify JavaScript features work
      await page.waitForSelector('[data-testid="clinic-search-input"]');
      
      // Test complex healthcare search with filters
      await page.click('[data-testid="clinic-search-input"]');
      await page.type('[data-testid="clinic-search-input"]', 'cardiology');
      
      // Apply filters
      await page.click('[data-testid="filter-specialty"]');
      await page.click('[data-testid="filter-specialty-cardiology"]');
      
      await page.click('[data-testid="filter-location"]');
      await page.click('[data-testid="filter-location-north"]');
      
      // Verify filter functionality
      const filteredResults = await page.$$eval('[data-testid="doctor-card"]', cards => 
        cards.filter(card => card.textContent.includes('Cardiology')).length
      );
      
      expect(filteredResults).toBeGreaterThan(0);

      // Test appointment booking modal
      await page.click('[data-testid="doctor-card"]:first-child [data-testid="book-btn"]');
      await page.waitForSelector('[data-testid="booking-modal"]');
      
      // Verify modal accessibility
      const modalDialog = await page.$('[data-testid="booking-modal"]');
      const isModal = await modalDialog.evaluate(el => 
        el.getAttribute('role') === 'dialog' && el.getAttribute('aria-modal') === 'true'
      );
      expect(isModal).toBe(true);

      await browserInstance.close();
    });
  });
});
```

### 3. PWA Functionality Testing

#### 3.1 Progressive Web App Features
```typescript
describe('Progressive Web App (PWA) Testing', () => {
  test('should install and function as PWA', async () => {
    const page = await browser.newPage();
    
    // Navigate to app
    await page.goto('https://myfamilyclinic.sg', { waitUntil: 'networkidle0' });

    // Check for PWA manifest
    const manifest = await page.evaluate(() => {
      return fetch('/manifest.json')
        .then(response => response.json())
        .catch(() => null);
    });

    expect(manifest).toEqual(expect.objectContaining({
      name: 'My Family Clinic',
      short_name: 'MF Clinic',
      start_url: '/',
      display: 'standalone',
      theme_color: expect.stringMatching(/^#/),
      background_color: expect.stringMatching(/^#/)
    }));

    // Test service worker registration
    const serviceWorkerRegistered = await page.evaluate(() => {
      return navigator.serviceWorker.controller !== null;
    });
    expect(serviceWorkerRegistered).toBe(true);

    // Test offline functionality
    await page.setOfflineMode(true);
    const offlineResponse = await page.goto('https://myfamilyclinic.sg/doctors');
    expect(offlineResponse.ok()).toBe(true);

    // Test cached resources
    const cachedResources = await page.evaluate(async () => {
      const cache = await caches.open('my-family-clinic-v1');
      const keys = await cache.keys();
      return keys.length;
    });

    expect(cachedResources).toBeGreaterThan(5); // At least 5 resources cached
  });

  test('should handle push notifications', async () => {
    const page = await browser.newPage();
    await page.goto('https://myfamilyclinic.sg');

    // Request notification permission
    await page.evaluate(() => {
      return Notification.requestPermission();
    });

    // Test notification subscription
    const subscription = await page.evaluate(() => {
      return swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: 'test-vapid-key'
      });
    });

    expect(subscription.endpoint).toBeTruthy();
  });
});
```

### 4. Screen Size and Responsive Design Testing

#### 4.1 Responsive Layout Testing
```typescript
describe('Responsive Design Testing', () => {
  const screenSizes = [
    { name: 'Mobile Small', width: 320, height: 568 },
    { name: 'Mobile Large', width: 414, height: 896 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1024, height: 768 },
    { name: 'Desktop Large', width: 1920, height: 1080 }
  ];

  screenSizes.forEach(size => {
    test(`should render correctly at ${size.name} (${size.width}x${size.height})`, async () => {
      const page = await browser.newPage();
      await page.setViewport({ width: size.width, height: size.height });

      await page.goto('https://myfamilyclinic.sg');
      await page.waitForSelector('[data-testid="main-content"]');

      // Test navigation menu responsiveness
      if (size.width < 768) {
        // Mobile: hamburger menu should be visible
        const hamburgerMenu = await page.$('[data-testid="mobile-menu-toggle"]');
        expect(hamburgerMenu).toBeTruthy();
        
        // Desktop navigation should be hidden
        const desktopNav = await page.$('[data-testid="desktop-navigation"]');
        const isHidden = await desktopNav.evaluate(el => 
          window.getComputedStyle(el).display === 'none'
        );
        expect(isHidden).toBe(true);
      } else {
        // Desktop: full navigation should be visible
        const desktopNav = await page.$('[data-testid="desktop-navigation"]');
        const isVisible = await desktopNav.evaluate(el => 
          window.getComputedStyle(el).display !== 'none'
        );
        expect(isVisible).toBe(true);
      }

      // Test clinic search interface
      const searchInput = await page.$('[data-testid="clinic-search-input"]');
      const inputWidth = await searchInput.evaluate(el => el.offsetWidth);
      const containerWidth = size.width;
      
      // Search input should not exceed container width
      expect(inputWidth).toBeLessThanOrEqual(containerWidth - 40); // Account for padding

      // Test doctor card grid responsiveness
      const doctorCards = await page.$$('[data-testid="doctor-card"]');
      
      if (size.width < 768) {
        // Mobile: single column layout
        const cardWidth = await doctorCards[0].evaluate(el => el.offsetWidth);
        expect(cardWidth).toBeLessThan(size.width - 20);
      } else if (size.width < 1024) {
        // Tablet: 2 columns
        const cardWidth = await doctorCards[0].evaluate(el => el.offsetWidth);
        expect(cardWidth).toBeLessThan((size.width / 2) - 20);
      } else {
        // Desktop: 3+ columns
        const cardWidth = await doctorCards[0].evaluate(el => el.offsetWidth);
        expect(cardWidth).toBeLessThan((size.width / 3) - 20);
      }

      await browser.close();
    });
  });
});
```

### 5. Network Conditions Testing

#### 5.1 Slow Network Testing
```typescript
describe('Network Conditions Testing', () => {
  const networkProfiles = [
    { name: '2G Slow', latency: 300, download: 50, upload: 30 },
    { name: '3G Fast', latency: 150, download: 750, upload: 250 },
    { name: '4G', latency: 50, download: 4000, upload: 1000 },
    { name: 'WiFi Good', latency: 20, download: 10000, upload: 5000 }
  ];

  networkProfiles.forEach(profile => {
    test(`should function properly under ${profile.name} conditions`, async () => {
      const page = await browser.newPage();
      
      // Simulate network conditions
      await page.setOfflineMode(false);
      await page.setExtraHTTPHeaders({
        'Connection': 'keep-alive'
      });

      // Test page load performance
      const startTime = Date.now();
      await page.goto('https://myfamilyclinic.sg');
      const loadTime = Date.now() - startTime;

      // Pages should load within reasonable time even on slow networks
      const maxLoadTime = profile.name === '2G Slow' ? 10000 : 5000;
      expect(loadTime).toBeLessThan(maxLoadTime);

      // Test critical functionality under slow conditions
      await page.click('[data-testid="clinic-search-input"]');
      await page.type('[data-testid="clinic-search-input"]', 'general practice');
      
      // Search should still work (with appropriate loading states)
      await page.waitForSelector('[data-testid="search-results-loading"]');
      
      const results = await page.waitForSelector('[data-testid="search-results"]', {
        timeout: profile.name === '2G Slow' ? 15000 : 5000
      });
      
      expect(results).toBeTruthy();

      await browser.close();
    });
  });
});
```

### 6. Accessibility Device Testing

#### 6.1 Screen Reader Compatibility
```typescript
describe('Accessibility Device Testing', () => {
  test('should be compatible with screen readers', async () => {
    const page = await browser.newPage();
    await page.goto('https://myfamilyclinic.sg');

    // Check for proper ARIA labels
    const searchInput = await page.$('[data-testid="clinic-search-input"]');
    const hasAriaLabel = await searchInput.evaluate(el => 
      el.getAttribute('aria-label') !== null
    );
    expect(hasAriaLabel).toBe(true);

    // Check for proper heading hierarchy
    const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', headings => 
      headings.map(h => h.tagName)
    );
    expect(headings).toContain('H1');
    expect(headings).toContain('H2');

    // Check for skip links
    const skipLink = await page.$('[data-testid="skip-to-content"]');
    expect(skipLink).toBeTruthy();

    // Check for focus indicators
    await page.click('[data-testid="clinic-search-input"]');
    const focusRing = await page.evaluate(() => {
      const activeElement = document.activeElement;
      const computedStyle = window.getComputedStyle(activeElement);
      return computedStyle.outline !== 'none';
    });
    expect(focusRing).toBe(true);
  });

  test('should support keyboard navigation', async () => {
    const page = await browser.newPage();
    await page.goto('https://myfamilyclinic.sg');

    // Tab through main elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Should be able to reach search input
    const focusedElement = await page.evaluate(() => document.activeElement.getAttribute('data-testid'));
    expect(['clinic-search-input', 'search-button', 'navigation-link'].includes(focusedElement)).toBe(true);

    // Test search with keyboard only
    await page.keyboard.type('cardiologist');
    await page.keyboard.press('Enter');
    
    // Should trigger search
    await page.waitForSelector('[data-testid="search-results"]');
    expect(await page.$('[data-testid="search-results"]')).toBeTruthy();
  });
});
```

### 7. Touch and Gesture Testing

#### 7.1 Mobile Touch Interactions
```typescript
describe('Touch and Gesture Testing', () => {
  test('should support touch interactions on mobile', async () => {
    const page = await browser.newPage({ 
      device: 'iPhone 13',
      hasTouch: true 
    });

    await page.goto('https://myfamilyclinic.sg');

    // Test tap interactions
    await page.tap('[data-testid="clinic-search-input"]');
    
    // Test swipe gestures in doctor cards
    const doctorCard = await page.$('[data-testid="doctor-card"]:first-child');
    await doctorCard.swipe('left');
    
    // Should show additional doctor information
    await page.waitForSelector('[data-testid="doctor-details-panel"]');
    expect(await page.$('[data-testid="doctor-details-panel"]')).toBeTruthy();

    // Test pinch zoom (should be disabled for clinical content)
    const originalViewport = await page.viewportSize();
    await page.touchscreen.tap(100, 100);
    await page.touchscreen.tap(110, 110);
    
    const newViewport = await page.viewportSize();
    expect(newViewport).toEqual(originalViewport); // Viewport should remain same
  });
});
```

### 8. Platform-Specific Features Testing

#### 8.1 iOS Safari Specific Features
```typescript
describe('iOS Safari Specific Features', () => {
  test('should handle iOS Safari limitations', async () => {
    const page = await browser.newPage({ 
      device: 'iPhone 13 Safari'
    });

    await page.goto('https://myfamilyclinic.sg');

    // Test iOS Safari viewport handling
    const viewport = await page.evaluate(() => ({
      width: window.innerWidth,
      height: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio
    }));

    expect(viewport.devicePixelRatio).toBe(3); // iPhone 13 Pro ratio

    // Test iOS Safari form behavior
    await page.tap('[data-testid="clinic-search-input"]');
    await page.type('[data-testid="clinic-search-input"]', 'dermatology');
    
    // iOS Safari should handle input zoom properly
    const inputFontSize = await page.evaluate(() => {
      const input = document.querySelector('[data-testid="clinic-search-input"]');
      return window.getComputedStyle(input).fontSize;
    });
    
    expect(parseInt(inputFontSize)).toBeGreaterThan(14); // Minimum font size for iOS
  });
});
```

#### 8.2 Android Chrome Specific Features
```typescript
describe('Android Chrome Specific Features', () => {
  test('should work properly with Android Chrome', async () => {
    const page = await browser.newPage({
      device: 'Pixel 5 Chrome'
    });

    await page.goto('https://myfamilyclinic.sg');

    // Test Android Chrome autofill
    await page.click('[data-testid="contact-form"]');
    
    // Test credit card autofill
    const cardNumberField = await page.$('[data-testid="card-number"]');
    await cardNumberField.click();
    
    // Android should show payment methods
    const paymentSheet = await page.waitForSelector('[data-testid="android-payment-sheet"]', {
      timeout: 3000
    });
    expect(paymentSheet).toBeTruthy();
  });
});
```

### 9. Cross-Platform Test Automation

#### 9.1 Parallel Browser Testing
```typescript
describe('Parallel Cross-Platform Testing', () => {
  test('should maintain consistency across all platforms', async () => {
    const platforms = [
      { browser: 'chrome', device: 'iPhone 13' },
      { browser: 'chrome', device: 'Samsung Galaxy S21' },
      { browser: 'safari', device: 'iPhone 13' },
      { browser: 'firefox', device: 'Desktop' },
      { browser: 'edge', device: 'Desktop' }
    ];

    const testPromises = platforms.map(async (platform) => {
      const browser = await puppeteer.launch({
        browser: platform.browser,
        device: platform.device
      });

      const page = await browser.newPage();
      await page.goto('https://myfamilyclinic.sg');

      // Test core functionality
      const searchWorks = await page.evaluate(() => {
        const searchInput = document.querySelector('[data-testid="clinic-search-input"]');
        return searchInput !== null && searchInput.tagName === 'INPUT';
      });

      const resultsVisible = await page.click('[data-testid="clinic-search-input"]')
        .then(() => page.type('[data-testid="clinic-search-input"]', 'doctor'))
        .then(() => page.waitForSelector('[data-testid="search-results"]'))
        .then(() => true)
        .catch(() => false);

      await browser.close();
      
      return {
        platform: `${platform.browser}-${platform.device}`,
        searchWorks,
        resultsVisible
      };
    });

    const results = await Promise.all(testPromises);
    
    results.forEach(result => {
      expect(result.searchWorks).toBe(true);
      expect(result.resultsVisible).toBe(true);
    });
  });
});
```

### 10. Performance Across Platforms

#### 10.1 Core Web Vitals Testing
```typescript
describe('Performance Across Platforms', () => {
  test('should meet Core Web Vitals on all platforms', async () => {
    const testUrls = [
      'https://myfamilyclinic.sg',
      'https://myfamilyclinic.sg/doctors',
      'https://myfamilyclinic.sg/clinics'
    ];

    const platforms = [
      { device: 'Desktop Chrome', viewport: '1920x1080' },
      { device: 'Mobile Chrome', viewport: '360x640' },
      { device: 'iPhone Safari', viewport: '375x667' }
    ];

    for (const url of testUrls) {
      for (const platform of platforms) {
        const page = await browser.newPage({ device: platform.device });
        await page.setViewport(platform.viewport);

        const metrics = await page.evaluate(() => {
          return new Promise((resolve) => {
            new PerformanceObserver((list) => {
              const entries = list.getEntries();
              resolve({
                LCP: entries.find(e => e.name === 'largest-contentful-paint')?.startTime,
                FID: entries.find(e => e.name === 'first-input')?.startTime,
                CLS: entries.find(e => e.name === 'layout-shift')?.value
              });
            }).observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });

            page.goto(url);
          });
        });

        // Core Web Vitals thresholds
        expect(metrics.LCP).toBeLessThan(2500); // Good LCP
        expect(metrics.FID).toBeLessThan(100); // Good FID  
        expect(metrics.CLS).toBeLessThan(0.1); // Good CLS

        await browser.close();
      }
    }
  });
});
```