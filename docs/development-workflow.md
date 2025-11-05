# Development Workflow: My Family Clinic Website

## Overview
This document establishes a comprehensive development workflow that ensures code quality, maintainability, and team collaboration while adhering to healthcare industry standards and accessibility requirements.

## Git Workflow & Branch Strategy

### Branch Naming Convention
```
main                    # Production-ready code
develop                 # Integration branch for features
feature/[ticket-id]     # New features (e.g., feature/MFC-123-clinic-search)
bugfix/[ticket-id]      # Bug fixes (e.g., bugfix/MFC-456-form-validation)
hotfix/[ticket-id]      # Critical production fixes
release/[version]       # Release preparation (e.g., release/v1.0.0)
chore/[description]     # Maintenance tasks (e.g., chore/update-dependencies)
```

### Git Commit Message Convention
```
type(scope): description

[optional body]

[optional footer]

Types:
- feat: A new feature
- fix: A bug fix
- docs: Documentation only changes
- style: Changes that do not affect the meaning of the code
- refactor: A code change that neither fixes a bug nor adds a feature
- perf: A code change that improves performance
- test: Adding missing tests or correcting existing tests
- chore: Changes to the build process or auxiliary tools

Examples:
feat(clinic-search): add geolocation-based clinic filtering
fix(enquiry-form): resolve validation error for phone numbers
docs(api): update tRPC router documentation
style(ui): improve button hover states
refactor(auth): simplify session management logic
perf(database): optimize clinic search query with proper indexing
test(components): add unit tests for ClinicCard component
chore(deps): update Next.js to v15.0.1
```

### Pull Request Workflow
```yaml
# .github/pull_request_template.md
## Description
Brief description of changes made

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## Healthcare Compliance Checklist
- [ ] Patient data handling follows privacy guidelines
- [ ] No sensitive information exposed in logs or errors
- [ ] Accessibility standards maintained (WCAG 2.2 AA)
- [ ] Security best practices followed

## Testing Checklist
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated (if applicable)
- [ ] Manual testing completed
- [ ] Accessibility testing completed
- [ ] Performance testing completed

## Code Quality Checklist
- [ ] ESLint passes with no errors
- [ ] TypeScript compilation successful
- [ ] Code follows established patterns
- [ ] Documentation updated
- [ ] Database migrations included (if applicable)

## Screenshots/Videos (if applicable)
Include screenshots or screen recordings for UI changes

## Related Issues
Closes #[issue-number]
```

## Local Development Setup

### Prerequisites Installation
```bash
# System requirements
Node.js >= 18.17.0
npm >= 9.0.0
Git >= 2.40.0
Docker >= 24.0.0 (for local database)

# Install Node.js dependencies
npm install

# Install global tools
npm install -g @vercel/cli
npm install -g prisma
npm install -g eslint
npm install -g typescript
```

### Environment Configuration
```bash
# .env.local template
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/family_clinic_dev"
DIRECT_URL="postgresql://postgres:password@localhost:5432/family_clinic_dev"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="your_supabase_url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_key"

# NextAuth
NEXTAUTH_SECRET="your_nextauth_secret"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# External APIs
GOOGLE_MAPS_API_KEY="your_google_maps_api_key"
EMAIL_SERVICE_API_KEY="your_email_service_key"

# Monitoring
SENTRY_DSN="your_sentry_dsn"
VERCEL_ANALYTICS_ID="your_vercel_analytics_id"
```

### Development Scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio",
    "db:seed": "tsx prisma/seed.ts",
    "db:reset": "prisma migrate reset",
    
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    
    "accessibility": "pa11y-ci --sitemap http://localhost:3000/sitemap.xml",
    "lighthouse": "lhci autorun",
    "security:audit": "npm audit && npx audit-ci --config .audit-ci.json",
    
    "pre-commit": "lint-staged",
    "prepare": "husky install",
    "clean": "rm -rf .next out dist",
    "analyze": "ANALYZE=true npm run build"
  }
}
```

### Git Hooks Configuration
```bash
# .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run lint-staged

# .husky/commit-msg
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx commitlint --edit $1

# .husky/pre-push
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run type-check
npm run test
npm run build
```

### Lint-Staged Configuration
```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "jest --findRelatedTests --passWithNoTests"
    ],
    "*.{json,md,mdx,css,yaml,yml}": [
      "prettier --write"
    ],
    "*.{ts,tsx}": [
      "bash -c 'npm run type-check'"
    ]
  }
}
```

## Code Quality Standards

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ]
}
```

### Code Organization Standards
```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Route groups
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # Reusable components
│   ├── ui/               # Basic UI components (shadcn/ui)
│   ├── forms/            # Form components
│   ├── layouts/          # Layout components
│   └── features/         # Feature-specific components
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
│   ├── auth.ts           # Authentication utilities
│   ├── db.ts             # Database utilities
│   ├── utils.ts          # General utilities
│   └── validations/      # Zod schemas
├── server/               # Server-side code
│   ├── api/              # tRPC routers
│   ├── auth.ts           # Auth configuration
│   └── db.ts             # Database connection
├── styles/               # Additional styles
├── types/                # TypeScript type definitions
└── utils/                # Client-side utilities

prisma/
├── schema.prisma         # Database schema
├── migrations/           # Database migrations
└── seed.ts              # Database seeding

tests/
├── __mocks__/           # Test mocks
├── components/          # Component tests
├── pages/              # Page tests
├── api/                # API tests
└── e2e/                # End-to-end tests
```

### Component Development Standards
```typescript
// Component template
import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Define component variants using CVA
const componentVariants = cva(
  'base-classes',
  {
    variants: {
      variant: {
        default: 'default-classes',
        secondary: 'secondary-classes',
      },
      size: {
        sm: 'small-classes',
        md: 'medium-classes',
        lg: 'large-classes',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

// Component props interface
interface ComponentProps
  extends React.ComponentPropsWithoutRef<'div'>,
    VariantProps<typeof componentVariants> {
  // Additional props
}

// Component implementation with forwardRef for accessibility
const Component = forwardRef<HTMLDivElement, ComponentProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(componentVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);

Component.displayName = 'Component';

export { Component, componentVariants };
export type { ComponentProps };
```

### API Development Standards
```typescript
// tRPC router template
import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '@/server/api/trpc';
import { TRPCError } from '@trpc/server';

// Input validation schemas
const getByIdSchema = z.object({
  id: z.string().cuid('Invalid ID format'),
});

const createSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email format'),
});

export const exampleRouter = createTRPCRouter({
  // Public procedure
  getById: publicProcedure
    .input(getByIdSchema)
    .query(async ({ input, ctx }) => {
      const { id } = input;
      
      try {
        const result = await ctx.db.example.findUnique({
          where: { id },
        });
        
        if (!result) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Record not found',
          });
        }
        
        return result;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
          cause: error,
        });
      }
    }),
  
  // Protected procedure
  create: protectedProcedure
    .input(createSchema)
    .mutation(async ({ input, ctx }) => {
      const { name, email } = input;
      
      try {
        const result = await ctx.db.example.create({
          data: {
            name,
            email,
            userId: ctx.session.user.id,
          },
        });
        
        // Log successful creation
        console.log(`Created record: ${result.id}`);
        
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create record',
          cause: error,
        });
      }
    }),
});
```

## Testing Strategy

### Unit Testing Standards
```typescript
// Component test template
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { jest } from '@jest/globals';
import { Component } from '@/components/Component';

// Test setup utilities
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders correctly with default props', () => {
    renderWithProviders(<Component />);
    expect(screen.getByRole('component')).toBeInTheDocument();
  });
  
  it('handles user interactions correctly', async () => {
    const handleClick = jest.fn();
    renderWithProviders(<Component onClick={handleClick} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });
  
  it('displays error states appropriately', () => {
    renderWithProviders(<Component error="Test error message" />);
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });
  
  it('meets accessibility requirements', () => {
    renderWithProviders(<Component />);
    const component = screen.getByRole('component');
    expect(component).toBeAccessible();
  });
});
```

### Integration Testing Standards
```typescript
// API integration test template
import { createTRPCMsw } from 'msw-trpc';
import { setupServer } from 'msw/node';
import { appRouter } from '@/server/api/root';
import { db } from '@/server/db';

const trpcMsw = createTRPCMsw(appRouter);

const server = setupServer(
  trpcMsw.clinic.getById.query((req, res, ctx) => {
    return res(ctx.status(200), ctx.data(mockClinicData));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Clinic API Integration', () => {
  it('fetches clinic data correctly', async () => {
    const response = await fetch('/api/trpc/clinic.getById?input={"id":"test-id"}');
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.result.data).toMatchObject(mockClinicData);
  });
  
  it('handles authentication correctly', async () => {
    // Test protected endpoints
  });
  
  it('validates input properly', async () => {
    // Test input validation
  });
});
```

### E2E Testing Standards
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});

// E2E test template
import { test, expect } from '@playwright/test';

test.describe('Clinic Search Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });
  
  test('user can search for nearby clinics', async ({ page }) => {
    // Allow location access
    await page.context().grantPermissions(['geolocation']);
    
    // Navigate to clinic search
    await page.click('[data-testid="find-clinics-button"]');
    
    // Wait for geolocation to load
    await page.waitForSelector('[data-testid="clinic-list"]');
    
    // Verify clinic results are displayed
    const clinicCards = page.locator('[data-testid="clinic-card"]');
    await expect(clinicCards).toHaveCountGreaterThan(0);
    
    // Test clinic card interaction
    await clinicCards.first().click();
    await expect(page).toHaveURL(/\/clinics\/.*$/);
  });
  
  test('user can filter clinic results', async ({ page }) => {
    await page.goto('/clinics');
    
    // Apply service filter
    await page.selectOption('[data-testid="service-filter"]', 'GENERAL_MEDICINE');
    await page.waitForLoadState('networkidle');
    
    // Verify filtered results
    const results = page.locator('[data-testid="clinic-card"]');
    await expect(results).toHaveCountGreaterThan(0);
    
    // Verify all results show the selected service
    const serviceLabels = page.locator('[data-testid="clinic-services"]');
    for (let i = 0; i < await serviceLabels.count(); i++) {
      await expect(serviceLabels.nth(i)).toContainText('General Medicine');
    }
  });
});
```

## Performance Optimization

### Bundle Analysis Workflow
```json
{
  "scripts": {
    "analyze": "cross-env ANALYZE=true next build",
    "bundle:analyze": "npx @next/bundle-analyzer"
  }
}
```

### Performance Monitoring
```typescript
// lib/performance.ts
export class PerformanceMonitor {
  static measurePageLoad() {
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        const metrics = {
          dns: navigation.domainLookupEnd - navigation.domainLookupStart,
          tcp: navigation.connectEnd - navigation.connectStart,
          ttfb: navigation.responseStart - navigation.requestStart,
          download: navigation.responseEnd - navigation.responseStart,
          domProcessing: navigation.domContentLoadedEventEnd - navigation.responseEnd,
          total: navigation.loadEventEnd - navigation.navigationStart,
        };
        
        // Send to analytics
        this.sendMetrics('page_load', metrics);
      });
    }
  }
  
  static measureWebVitals() {
    if (typeof window !== 'undefined') {
      import('web-vitals').then(({ getLCP, getFID, getCLS, getFCP, getTTFB }) => {
        getLCP((metric) => this.sendMetrics('lcp', metric));
        getFID((metric) => this.sendMetrics('fid', metric));
        getCLS((metric) => this.sendMetrics('cls', metric));
        getFCP((metric) => this.sendMetrics('fcp', metric));
        getTTFB((metric) => this.sendMetrics('ttfb', metric));
      });
    }
  }
  
  private static sendMetrics(name: string, metric: any) {
    // Send to monitoring service
    console.log(`Performance metric: ${name}`, metric);
  }
}
```

## Deployment Workflow

### CI/CD Pipeline
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run type checking
        run: npm run type-check
      
      - name: Run linting
        run: npm run lint
      
      - name: Run unit tests
        run: npm run test:coverage
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Run accessibility tests
        run: npm run accessibility
      
      - name: Run security audit
        run: npm run security:audit
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
  
  build:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
      
      - name: Run Lighthouse CI
        run: npm run lighthouse
  
  deploy:
    if: github.ref == 'refs/heads/main'
    needs: [test, build]
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Deployment Checklist
```markdown
## Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing (unit, integration, E2E)
- [ ] Code coverage above 80%
- [ ] No ESLint errors or warnings
- [ ] TypeScript compilation successful
- [ ] Accessibility tests passing (WCAG 2.2 AA)
- [ ] Performance benchmarks met (Lighthouse scores >90)

### Security
- [ ] Security audit passed (npm audit)
- [ ] No sensitive data in environment variables
- [ ] Authentication flows tested
- [ ] Authorization checks in place
- [ ] Input validation implemented
- [ ] SQL injection protection verified

### Healthcare Compliance
- [ ] Patient data handling reviewed
- [ ] Privacy policies updated
- [ ] Audit logging functional
- [ ] Data retention policies implemented
- [ ] GDPR compliance verified

### Infrastructure
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] Third-party integrations tested
- [ ] Monitoring and alerting configured
- [ ] Backup procedures verified

### User Experience
- [ ] Mobile responsiveness tested
- [ ] Cross-browser compatibility verified
- [ ] Error handling implemented
- [ ] Loading states functional
- [ ] User feedback mechanisms working
```

This comprehensive development workflow ensures consistent code quality, thorough testing, and smooth deployment processes while maintaining healthcare industry standards and accessibility requirements.