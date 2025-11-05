# CLAUDE.md - AI Coding Agent Briefing

**Project:** Maria Family Clinic Healthcare Platform  
**Purpose:** Comprehensive technical briefing for AI coding agents  
**Document Type:** AI Onboarding & Reference Guide  
**Generated:** November 5, 2025  

---

## Executive Summary for AI Agents

### Project Mission
Maria Family Clinic is a **production-ready, healthcare-focused platform** that enables Singapore citizens to discover clinics, search doctors, book appointments, and integrate with the national Healthier SG program. This is a **compliance-heavy, high-performance, accessibility-focused application** built with modern web technologies.

### Key Technical Characteristics
- **Framework:** Next.js 15 App Router with React 19 and TypeScript 5
- **API Layer:** tRPC 11 with 29 healthcare-specific routers
- **Database:** PostgreSQL 15.4 + PostGIS 3.4 (geospatial capabilities)
- **Backend:** Supabase (managed database, auth, storage)
- **Deployment:** Vercel (frontend) with CI/CD pipeline
- **Testing:** 26,873 lines of test code across 34 test files
- **Performance:** 94.2% overall score, Core Web Vitals optimized
- **Compliance:** PDPA, MOH, WCAG 2.2 AA, healthcare audit trails

### Critical Success Factors
- **Zero tolerance for PHI exposure** in logs, errors, or public interfaces
- **WCAG 2.2 AA compliance mandatory** for all UI components
- **Healthcare audit trails** required for all data operations
- **Performance targets:** LCP <2.5s, FID <100ms, CLS <0.1
- **Multi-language support:** English (100%), Chinese (95%), Malay (90%), Tamil (85%)

---

## Quick Start Guide for AI Agents

### Essential Environment Setup
```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env.local
# Set DATABASE_URL, SUPABASE_URL, NEXTAUTH_SECRET, etc.

# 3. Initialize database
npm run db:generate    # Generate Prisma client
npm run db:migrate     # Apply migrations
npm run db:seed        # Load seed data

# 4. Start development
npm run dev            # Start Next.js dev server
npm run lint           # Run linting
npm run type-check     # TypeScript validation
```

### Core Development Commands
```bash
# Development workflow
npm run dev                 # Start development server (localhost:3000)
npm run build              # Production build
npm run start              # Start production server
npm run lint               # ESLint validation
npm run lint:fix           # Auto-fix linting issues
npm run type-check         # TypeScript compilation check

# Database operations
npm run db:generate        # Regenerate Prisma client
npm run db:migrate         # Run database migrations
npm run db:push            # Push schema changes (development)
npm run db:studio          # Open Prisma Studio
npm run db:seed            # Load seed data
npm run db:reset           # Reset database (development)

# Testing
npm run test               # Run unit tests
npm run test:watch         # Watch mode for tests
npm run test:coverage      # Generate coverage report
npm run test:e2e           # End-to-end tests (Playwright)
npm run test:accessibility # WCAG compliance tests
npm run test:compliance    # Healthcare compliance tests

# Performance & Quality
npm run lighthouse         # Performance audit
npm run analyze            # Bundle analysis
npm run security:audit     # Security vulnerability scan
```

### Critical File Locations
```
📁 src/
├── 📁 app/                    # Next.js App Router pages
│   ├── page.tsx              # Homepage (clinic discovery)
│   ├── layout.tsx            # Root layout with providers
│   └── (public)/             # Public routes
│       ├── clinics/          # Clinic search pages
│       ├── doctors/          # Doctor directory pages
│       ├── services/         # Service catalog pages
│       └── healthier-sg/     # Healthier SG program pages
├── 📁 components/            # React component library
│   ├── 📁 ui/               # shadcn/ui base components (45)
│   ├── 📁 healthcare/       # Healthcare-specific components (8)
│   ├── 📁 doctor/           # Doctor-related components (25)
│   ├── 📁 clinic/           # Clinic-related components (8)
│   ├── 📁 contact/          # Contact system components (15)
│   └── 📁 accessibility/    # Accessibility components (12)
├── 📁 server/               # Server-side code
│   ├── 📁 api/              # tRPC routers (29 routers)
│   │   ├── root.ts          # Main router aggregation
│   │   └── routers/         # Individual API routers
│   └── 📁 auth.ts           # NextAuth configuration
├── 📁 hooks/                # Custom React hooks (35 hooks)
└── 📁 types/                # TypeScript definitions

📁 prisma/
├── schema.prisma            # Database schema (7440 lines)
├── migrations/              # Database migrations
└── seeds/                   # Seed data

📁 testing/
├── 📁 suites/               # Test suites (5 suites)
├── 📁 compliance/           # Healthcare compliance tests
└── 📁 performance/          # Performance tests
```

---

## Project Architecture & Technology Stack

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Layer     │    │   Data Layer    │
│                 │    │                 │    │                 │
│ Next.js 15      │◄──►│ tRPC 11         │◄──►│ PostgreSQL 15.4 │
│ React 19        │    │ 29 Routers      │    │ + PostGIS 3.4   │
│ TypeScript 5    │    │ NextAuth 5      │    │ Supabase        │
│ Tailwind CSS    │    │ Zod Validation  │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ External APIs   │    │ Infrastructure  │    │ Monitoring &    │
│                 │    │                 │    │ Security        │
│ Google Maps     │    │ Vercel          │    │                 │
│ Healthier SG    │    │ Supabase        │    │ Healthcare      │
│ MOH APIs        │    │ CI/CD Pipeline  │    │ Audit Trails    │
│ Payment Gateway │    │ Rate Limiting   │    │ PDPA Compliance │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack Deep Dive

#### Frontend Technologies
```typescript
// Core Framework Stack
Next.js 15.2.1        // App Router, Server Components, SSR
React 19.2.0          // Latest React with concurrent features
TypeScript 5.6.3      // Strict type checking, full type safety

// UI & Styling
Tailwind CSS 3.x      // Utility-first CSS framework
shadcn/ui             // Component library (45 base components)
Radix UI              // Accessible headless components
class-variance-authority // Component variant management

// State Management & Data Fetching
@tanstack/react-query // Server state management
tRPC client           // Type-safe API calls
Zustand               // Client state management
React Hook Form       // Form handling with Zod validation
```

#### Backend Technologies
```typescript
// API Layer
tRPC 11.0.0          // Type-safe RPC with 29 healthcare routers
NextAuth 5.0          // Authentication and session management
Zod 3.x               // Runtime type validation and parsing

// Database & ORM
Prisma 5.22.0         // Type-safe database client
PostgreSQL 15.4       // Primary database with ACID compliance
PostGIS 3.4           // Geospatial extension for location-based search

// Backend Services
Supabase              // Managed database, auth, storage, real-time
```

#### Infrastructure & Deployment
```yaml
Frontend Hosting: Vercel (automatic deployments, edge network)
Database: Supabase PostgreSQL (managed, with real-time)
Authentication: Supabase Auth (with NextAuth integration)
Storage: Supabase Storage (file uploads, images)
CI/CD: GitHub Actions (automated testing, security scans)
Monitoring: Vercel Analytics, custom healthcare metrics
```

---

## API Architecture & tRPC Routers

### tRPC Router Structure (29 Healthcare Routers)

#### Core Healthcare Routers
```typescript
// src/server/api/routers/
export const appRouter = createTRPCRouter({
  // Patient-facing services
  clinic: clinicRouter,           // 15 procedures - Clinic discovery & management
  doctor: doctorRouter,           // 20 procedures - Doctor search & profiles
  service: serviceRouter,         // 18 procedures - Service catalog & booking
  appointment: appointmentRouter, // 25 procedures - Appointment management
  
  // Healthier SG Program Integration
  healthierSg: healthierSgRouter,        // 25 procedures - Program features
  eligibility: eligibilityRouter,        // 12 procedures - Eligibility assessment
  benefits: benefitsRouter,              // 8 procedures - Benefits tracking
  
  // Contact & Communication
  enquiry: enquiryRouter,                // 22 procedures - Enquiry management
  contactCategory: contactCategoryRouter, // 5 procedures - Contact categorization
  contactForm: contactFormRouter,        // 8 procedures - Form submissions
  contactEnquiry: contactEnquiryRouter,  // 15 procedures - Enquiry processing
  
  // Analytics & Monitoring
  analytics: analyticsRouter,            // 12 procedures - Real-time analytics
  monitoring: monitoringRouter,          // 10 procedures - System monitoring
  audit: auditRouter,                    // 8 procedures - Audit trail
  
  // Privacy & Compliance
  privacyCompliance: privacyComplianceRouter, // 20 procedures - PDPA compliance
});
```

#### API Endpoint Patterns
```typescript
// Public endpoints (no authentication required)
GET  /api/trpc/clinic.getAll?input={"search":"cardiology","location":"singapore"}
GET  /api/trpc/doctor.getById?input={"id":"doctor_123"}
GET  /api/trpc/service.getCategories

// Protected endpoints (authentication required)
POST /api/trpc/appointment.create
GET  /api/trpc/analytics.dashboard
POST /api/trpc/enquiry.submit

// Healthcare-specific validation examples
const createAppointmentSchema = z.object({
  clinicId: z.string().cuid(),
  doctorId: z.string().cuid(),
  serviceId: z.string().cuid(),
  appointmentDate: z.date().min(new Date()),
  patientInfo: z.object({
    name: z.string().min(2).max(100),
    phone: z.string().regex(/^\+65[689]\d{7}$/), // Singapore phone format
    email: z.string().email(),
    nric: z.string().regex(/^[STFG]\d{7}[A-Z]$/), // Singapore NRIC format
  }),
});
```

#### Real-time Subscriptions
```typescript
// WebSocket subscriptions for live updates
appointment.subscribeToUpdates({ clinicId: "clinic_123" })
doctor.subscribeToAvailability({ doctorId: "doctor_456" })
clinic.subscribeToAvailability({ clinicId: "clinic_123" })
enquiry.subscribeToUpdates({ userId: "user_789" })

// Usage in React components
const { data: availability } = trpc.appointment.subscribeToUpdates.useSubscription(
  { clinicId },
  { onData: (update) => setAvailability(update.availableSlots) }
);
```

---

## Database Schema & Data Models

### Core Healthcare Entities

#### User & Patient Management
```prisma
// User authentication and profiles
model User {
  id             String   @id @default(cuid())
  email          String   @unique
  name           String?
  image          String?
  role           UserRole @default(PATIENT)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Healthcare-specific relationships
  profile        UserProfile?
  preferences    UserPreferences?
  appointments   Appointment[]
  enquiries      Enquiry[]
  eligibilityAssessments EligibilityAssessment[]
  auditLogs      AuditLog[]
  
  @@map("users")
}

model UserProfile {
  id                String   @id @default(cuid())
  userId            String   @unique
  nric              String?  // Encrypted Singapore NRIC
  dateOfBirth       DateTime?
  gender            Gender?
  phone             String?
  address           String?
  emergencyContact  String?
  medicalConditions String[] // Encrypted medical data
  allergies         String[] // Encrypted allergy data
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@map("user_profiles")
}
```

#### Healthcare Provider Models
```prisma
// Clinic locations and information
model Clinic {
  id                String   @id @default(cuid())
  name              String
  registrationNo    String   @unique // MOH registration number
  address           String
  postalCode        String
  location          Point?   // PostGIS Point for geospatial search
  phone             String
  email             String
  website           String?
  operatingHours    Json     // Flexible hours structure
  servicesOffered   String[]
  languagesSpoken   String[]
  accreditations    String[]
  isHealthierSG     Boolean  @default(false)
  rating            Float?
  reviewCount       Int      @default(0)
  
  // Relationships
  doctors           DoctorClinic[]
  services          ServiceClinic[]
  appointments      Appointment[]
  reviews           ClinicReview[]
  
  @@map("clinics")
  @@index([location], type: Gin) // PostGIS spatial index
}

// Doctor profiles and specializations
model Doctor {
  id                String   @id @default(cuid())
  name              String
  mcrNumber         String   @unique // Medical Council Registration
  specialties       String[]
  qualifications    String[]
  experience        Int?     // Years of experience
  languagesSpoken   String[]
  biography         String?
  consultationFee   Float?
  rating            Float?
  reviewCount       Int      @default(0)
  isVerified        Boolean  @default(false)
  verificationDate  DateTime?
  
  // Relationships
  clinics           DoctorClinic[]
  reviews           DoctorReview[]
  schedules         DoctorSchedule[]
  
  @@map("doctors")
}
```

#### Service & Appointment Models
```prisma
// Healthcare services catalog
model Service {
  id                String   @id @default(cuid())
  name              String
  description       String
  categoryId        String
  estimatedDuration Int?     // Duration in minutes
  preparationNotes  String?
  postCareNotes     String?
  priceRange        Json?    // Flexible pricing structure
  isHealthierSG     Boolean  @default(false)
  isMedisaveEligible Boolean @default(false)
  
  // Relationships
  category          ServiceCategory @relation(fields: [categoryId])
  clinics           ServiceClinic[]
  appointments      Appointment[]
  
  @@map("services")
}

// Appointment booking system
model Appointment {
  id                String            @id @default(cuid())
  userId            String
  clinicId          String
  doctorId          String
  serviceId         String
  appointmentDate   DateTime
  status            AppointmentStatus @default(PENDING)
  patientInfo       Json              // Encrypted patient details
  notes             String?
  confirmationCode  String            @unique
  
  // Relationships
  user              User              @relation(fields: [userId])
  clinic            Clinic            @relation(fields: [clinicId])
  doctor            Doctor            @relation(fields: [doctorId])
  service           Service           @relation(fields: [serviceId])
  
  @@map("appointments")
  @@index([appointmentDate])
  @@index([status])
}
```

#### Healthier SG Program Models
```prisma
// Government program integration
model HealthierSGProgram {
  id                String   @id @default(cuid())
  name              String
  description       String
  eligibilityCriteria Json   // Complex eligibility rules
  benefitsStructure Json     // Tier-based benefits
  isActive          Boolean  @default(true)
  startDate         DateTime
  endDate           DateTime?
  
  // Relationships
  enrollments       UserEnrollment[]
  benefits          ProgramBenefit[]
  
  @@map("healthier_sg_programs")
}

model UserEnrollment {
  id                String          @id @default(cuid())
  userId            String
  programId         String
  status            EnrollmentStatus @default(PENDING)
  enrolledAt        DateTime        @default(now())
  completedAt       DateTime?
  tier              BenefitTier?
  healthGoals       String[]
  
  // Relationships
  user              User @relation(fields: [userId])
  program           HealthierSGProgram @relation(fields: [programId])
  
  @@unique([userId, programId])
  @@map("user_enrollments")
}
```

### PostGIS Geospatial Queries
```sql
-- Find clinics within 5km of user location
SELECT c.*, 
       ST_Distance(c.location, ST_MakePoint($1, $2)) as distance
FROM clinics c
WHERE c.location IS NOT NULL
  AND ST_DWithin(c.location, ST_MakePoint($1, $2), 5000)
ORDER BY distance
LIMIT 20;

-- Find Healthier SG doctors by specialty near location
SELECT DISTINCT d.*, 
       c.name as clinicName,
       ST_Distance(c.location, ST_MakePoint($1, $2)) as distance
FROM doctors d
JOIN doctor_clinics dc ON d.id = dc.doctorId
JOIN clinics c ON dc.clinicId = c.id
WHERE d.specialties && ARRAY[$3]
  AND c.isHealthierSG = true
  AND ST_DWithin(c.location, ST_MakePoint($1, $2), 10000)
ORDER BY distance;
```

---

## Development Workflow & Commands

### Git Workflow & Branching Strategy
```bash
# Branch naming conventions
main                    # Production-ready code
develop                 # Integration branch
feature/MFC-123-feature-name     # New features
bugfix/MFC-456-bug-description   # Bug fixes
hotfix/critical-fix               # Emergency fixes
release/v1.2.0                   # Release preparation

# Development workflow
git checkout -b feature/MFC-123-clinic-search
# Make changes, commit frequently
git add .
git commit -m "feat(clinic-search): add geolocation-based filtering"
git push origin feature/MFC-123-clinic-search
# Create Pull Request with detailed description

# Commit message format
type(scope): description

Types:
- feat: New feature
- fix: Bug fix  
- docs: Documentation only
- style: Code style changes
- refactor: Code refactoring
- perf: Performance improvements
- test: Adding tests
- chore: Maintenance tasks

Examples:
feat(clinic-search): add geolocation-based clinic filtering
fix(enquiry-form): resolve validation error for phone numbers
docs(api): update tRPC router documentation
perf(database): optimize clinic search query with proper indexing
```

### Pre-commit Quality Gates
```bash
# Husky pre-commit hooks (automatically run before commit)
npm run lint-staged        # ESLint + Prettier + TypeScript check
npm run type-check         # TypeScript compilation
npm run test              # Unit tests
npm run accessibility     # WCAG compliance checks

# Manual quality checks
npm run lint              # Manual linting
npm run type-check        # Manual type checking
npm run test:coverage     # Check test coverage (should be >85%)
npm run lighthouse        # Performance audit (should be >90)
npm run security:audit    # Security vulnerability scan
```

### Development Scripts Reference
```json
{
  "scripts": {
    // Core development
    "dev": "next dev",
    "build": "next build", 
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    
    // Database operations
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:migrate:deploy": "prisma migrate deploy",
    "db:studio": "prisma studio",
    "db:seed": "tsx prisma/seed.ts",
    "db:reset": "prisma migrate reset",
    
    // Testing
    "test": "jest",
    "test:watch": "jest --watch", 
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:accessibility": "pa11y-ci --sitemap http://localhost:3000/sitemap.xml",
    "test:compliance": "npm run test:compliance:pdpa && npm run test:compliance:moh",
    
    // Healthcare compliance testing
    "test:compliance:pdpa": "jest --testPathPattern=compliance/pdpa",
    "test:compliance:moh": "jest --testPathPattern=compliance/moh",
    "test:compliance:security": "jest --testPathPattern=compliance/security",
    
    // Performance & Quality
    "lighthouse": "lhci autorun",
    "analyze": "ANALYZE=true npm run build",
    "security:audit": "npm audit && npx audit-ci --config .audit-ci.json",
    
    // Utilities
    "clean": "rm -rf .next out dist",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

### Component Development Patterns
```typescript
// Healthcare component template with accessibility
import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const healthcareComponentVariants = cva(
  'base-classes-with-healthcare-considerations',
  {
    variants: {
      variant: {
        default: 'default-healthcare-classes',
        urgent: 'urgent-medical-classes', 
        success: 'success-treatment-classes',
      },
      size: {
        sm: 'compact-for-mobile',
        md: 'standard-healthcare',
        lg: 'accessibility-large',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

interface HealthcareComponentProps
  extends React.ComponentPropsWithoutRef<'div'>,
    VariantProps<typeof healthcareComponentVariants> {
  // Healthcare-specific props
  'aria-label': string; // Required for accessibility
  'data-testid'?: string; // For testing
}

const HealthcareComponent = forwardRef<HTMLDivElement, HealthcareComponentProps>(
  ({ className, variant, size, 'aria-label': ariaLabel, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(healthcareComponentVariants({ variant, size }), className)}
        aria-label={ariaLabel} // Critical for screen readers
        role="region" // Proper ARIA role
        {...props}
      />
    );
  }
);

HealthcareComponent.displayName = 'HealthcareComponent';
```

### API Router Development Template
```typescript
import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '@/server/api/trpc';
import { TRPCError } from '@trpc/server';

// Healthcare-specific validation schemas
const createClinicSchema = z.object({
  name: z.string().min(2).max(100),
  registrationNo: z.string().regex(/^[A-Z]{2}\d{6}$/), // MOH format
  address: z.string().min(5).max(200),
  postalCode: z.string().regex(/^\d{6}$/), // Singapore postal code
  phone: z.string().regex(/^\+65[689]\d{7}$/), // Singapore phone
  email: z.string().email(),
  servicesOffered: z.array(z.string()),
  isHealthierSG: z.boolean().default(false),
});

export const clinicRouter = createTRPCRouter({
  // Public procedures (no authentication)
  getAll: publicProcedure
    .input(z.object({
      search: z.string().optional(),
      location: z.string().optional(),
      radius: z.number().min(1).max(50).default(5), // km
      specialty: z.string().optional(),
      isHealthierSG: z.boolean().optional(),
      limit: z.number().min(1).max(50).default(20),
    }))
    .query(async ({ input, ctx }) => {
      // Implement geospatial search with PostGIS
      const clinics = await ctx.db.clinic.findMany({
        where: {
          AND: [
            input.search ? {
              OR: [
                { name: { contains: input.search, mode: 'insensitive' } },
                { servicesOffered: { hasSome: [input.search] } },
              ],
            } : {},
            input.isHealthierSG ? { isHealthierSG: true } : {},
          ],
        },
        include: {
          doctors: {
            include: {
              doctor: {
                select: {
                  name: true,
                  specialties: true,
                  rating: true,
                },
              },
            },
          },
          services: {
            include: {
              service: {
                select: {
                  name: true,
                  category: true,
                },
              },
            },
          },
        },
        take: input.limit,
      });

      // Apply geospatial filtering if location provided
      if (input.location) {
        // Use PostGIS ST_DWithin for radius search
        // This would be implemented with raw SQL for performance
      }

      return clinics;
    }),

  // Protected procedures (authentication required)
  create: protectedProcedure
    .input(createClinicSchema)
    .mutation(async ({ input, ctx }) => {
      // Verify user has permission to create clinics
      if (ctx.session.user.role !== 'ADMIN' && ctx.session.user.role !== 'CLINIC_ADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Insufficient permissions to create clinic',
        });
      }

      // Create audit log
      await ctx.db.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: 'CREATE_CLINIC',
          resourceType: 'Clinic',
          newValues: input,
          ipAddress: ctx.ip,
          userAgent: ctx.userAgent,
        },
      });

      // Create clinic with healthcare validation
      const clinic = await ctx.db.clinic.create({
        data: {
          ...input,
          // Add default values for healthcare context
          operatingHours: input.operatingHours || {
            monday: { open: '09:00', close: '17:00' },
            tuesday: { open: '09:00', close: '17:00' },
            wednesday: { open: '09:00', close: '17:00' },
            thursday: { open: '09:00', close: '17:00' },
            friday: { open: '09:00', close: '17:00' },
            saturday: { open: '09:00', close: '13:00' },
            sunday: { closed: true },
          },
        },
      });

      return clinic;
    }),

  // Real-time subscription example
  subscribeToAvailability: publicProcedure
    .input(z.object({
      clinicId: z.string(),
    }))
    .subscription(({ input }) => {
      return observable<ClinicAvailability>((emit) => {
        const channel = ctx.supabase
          .channel(`clinic-availability:${input.clinicId}`)
          .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'clinic_availability',
            filter: `clinicId=eq.${input.clinicId}`,
          }, (payload) => {
            emit.next({
              type: 'availability_update',
              data: payload.new as ClinicAvailability,
            });
          })
          .subscribe();

        return () => {
          ctx.supabase.removeChannel(channel);
        };
      });
    }),
});
```

---

## Testing Framework & Quality Gates

### Comprehensive Testing Strategy (26,873 lines of test code)

#### Test Suite Organization
```typescript
// testing/structure/
testing/
├── suites/                     # 5 main test suites
│   ├── unit/                   # Component and utility tests
│   ├── integration/            # API and database integration
│   ├── e2e/                    # Complete user workflows
│   ├── healthcare/             # Healthcare-specific workflows
│   └── compliance/             # PDPA, MOH, security tests
├── compliance/                 # Healthcare compliance tests
│   ├── pdpa/                   # Personal Data Protection Act
│   ├── moh/                    # Ministry of Health requirements
│   ├── security/               # Security and privacy tests
│   └── accessibility/          # WCAG 2.2 AA compliance
├── performance/                # Performance and load testing
│   ├── core-web-vitals/        # LCP, FID, CLS tests
│   ├── load-testing/           # Concurrent user simulation
│   └── healthcare-workflows/   # Healthcare-specific performance
└── infrastructure/             # Testing infrastructure setup
```

#### Healthcare-Specific Testing Patterns
```typescript
// testing/compliance/pdpa/data-subject-rights.test.ts
describe('PDPA Data Subject Rights', () => {
  describe('Right to Access', () => {
    it('should provide complete user data export within 30 days', async () => {
      const user = await createTestUser();
      const request = await requestDataAccess(user.id);
      
      expect(request.status).toBe('PROCESSING');
      
      // Simulate 30-day processing time
      await advanceTime(30 * 24 * 60 * 60 * 1000);
      
      const exportData = await getUserDataExport(user.id);
      
      expect(exportData).toContain('user_profile');
      expect(exportData).toContain('appointments');
      expect(exportData).toContain('enquiries');
      expect(exportData).not.toContain('sensitive_medical_data_without_consent');
    });
    
    it('should not expose data without proper verification', async () => {
      const user = await createTestUser();
      const unauthorizedRequest = await requestDataAccess('fake_user_id');
      
      expect(unauthorizedRequest.status).toBe('DENIED');
      expect(unauthorizedRequest.error).toContain('verification_failed');
    });
  });
  
  describe('Right to Erasure', () => {
    it('should completely remove user data within SLA timeframe', async () => {
      const user = await createTestUser();
      const appointments = await createTestAppointments(user.id, 5);
      const enquiries = await createTestEnquiries(user.id, 3);
      
      await requestDataErasure(user.id);
      
      // Verify all user data is removed
      const remainingData = await getAllUserData(user.id);
      expect(remainingData).toHaveLength(0);
      
      // Verify anonymized audit trails remain
      const auditTrail = await getAuditLog(user.id);
      expect(auditTrail).toHaveLength(expect.any(Number)); // Should have audit entries
      auditTrail.forEach(entry => {
        expect(entry.userId).toBeNull(); // User ID should be anonymized
        expect(entry.action).toBeDefined(); // But action should remain
      });
    });
  });
});

// testing/accessibility/wcag-2-2-aa.test.ts
describe('WCAG 2.2 AA Compliance', () => {
  describe('Perceivable - Text Alternatives', () => {
    it('should provide alt text for all healthcare images', async () => {
      const page = await browser.newPage();
      await page.goto('/clinics');
      
      const images = await page.$$eval('img', imgs => 
        imgs.map(img => ({
          src: img.src,
          alt: img.alt,
          role: img.getAttribute('role')
        }))
      );
      
      images.forEach(image => {
        expect(image.alt).toBeTruthy();
        expect(image.alt).toHaveLength.greaterThan(0);
        expect(image.alt).not.toMatch(/^(image|picture|photo)$/i);
      });
    });
  });
  
  describe('Operable - Keyboard Navigation', () => {
    it('should support full keyboard navigation in appointment booking', async () => {
      const page = await browser.newPage();
      await page.goto('/appointments/book');
      
      // Test tab navigation through booking form
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="clinic-search"]')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="doctor-select"]')).toBeFocused();
      
      // Test Enter key activation
      await page.keyboard.press('Enter');
      await expect(page.locator('[data-testid="date-picker"]')).toBeVisible();
      
      // Test Escape key to close modals
      await page.keyboard.press('Escape');
      await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    });
  });
});

// testing/e2e/healthcare-workflows.test.ts
describe('Healthcare Workflow E2E Tests', () => {
  test('complete patient journey: search → book → confirm', async () => {
    const page = await browser.newPage();
    
    // 1. Landing and search
    await page.goto('/');
    await page.click('[data-testid="find-clinics-button"]');
    await page.waitForSelector('[data-testid="clinic-search-form"]');
    
    // 2. Location-based clinic search
    await page.click('[data-testid="use-current-location"]');
    await page.waitForSelector('[data-testid="clinic-results"]');
    
    // 3. Filter by specialty
    await page.selectOption('[data-testid="specialty-filter"]', 'cardiology');
    await page.waitForLoadState('networkidle');
    
    // 4. Select clinic and doctor
    await page.click('[data-testid="clinic-card"]:first-child');
    await page.waitForSelector('[data-testid="doctor-list"]');
    await page.click('[data-testid="doctor-card"]:first-child');
    
    // 5. Book appointment
    await page.click('[data-testid="book-appointment-button"]');
    await page.waitForSelector('[data-testid="appointment-form"]');
    
    // 6. Fill patient information (with PDPA consent)
    await page.fill('[data-testid="patient-name"]', 'John Doe');
    await page.fill('[data-testid="patient-phone"]', '+6598765432');
    await page.fill('[data-testid="patient-email"]', 'john@example.com');
    
    // 7. Consent to data processing
    await page.check('[data-testid="pdpa-consent-checkbox"]');
    
    // 8. Submit booking
    await page.click('[data-testid="submit-booking"]');
    await page.waitForSelector('[data-testid="booking-confirmation"]');
    
    // 9. Verify confirmation
    const confirmationCode = await page.textContent('[data-testid="confirmation-code"]');
    expect(confirmationCode).toMatch(/^[A-Z0-9]{8}$/);
    
    // 10. Verify email confirmation would be sent
    const emailQueue = await getEmailQueue();
    expect(emailQueue).toContainEqual(
      expect.objectContaining({
        recipient: 'john@example.com',
        template: 'appointment-confirmation'
      })
    );
  });
});
```

#### Performance Testing Framework
```typescript
// testing/performance/core-web-vitals.test.ts
describe('Core Web Vitals Performance', () => {
  test('should meet performance targets for healthcare workflows', async () => {
    const page = await browser.newPage();
    
    // Measure clinic search performance
    await page.goto('/clinics');
    const searchMetrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lcp = entries.find(entry => entry.entryType === 'largest-contentful-paint');
          const fid = entries.find(entry => entry.entryType === 'first-input');
          const cls = entries.find(entry => entry.entryType === 'layout-shift');
          
          resolve({
            LCP: lcp?.startTime || 0,
            FID: fid?.processingStart - fid?.startTime || 0,
            CLS: cls?.value || 0,
          });
        }).observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
      });
    });
    
    // Healthcare-specific performance requirements
    expect(searchMetrics.LCP).toBeLessThan(2500); // LCP < 2.5s
    expect(searchMetrics.FID).toBeLessThan(100);  // FID < 100ms
    expect(searchMetrics.CLS).toBeLessThan(0.1);  // CLS < 0.1
  });
});

// testing/performance/load-testing.test.ts
describe('Healthcare Load Testing', () => {
  test('should handle 1000 concurrent clinic searches', async () => {
    const concurrentUsers = 1000;
    const testDuration = '10m';
    
    const results = await Promise.all(
      Array.from({ length: concurrentUsers }, async (_, i) => {
        const page = await browser.newPage();
        
        const startTime = Date.now();
        try {
          await page.goto('/clinics');
          await page.fill('[data-testid="search-input"]', 'cardiology');
          await page.click('[data-testid="search-button"]');
          await page.waitForSelector('[data-testid="clinic-results"]', { timeout: 5000 });
          
          const endTime = Date.now();
          return {
            userId: i,
            success: true,
            duration: endTime - startTime,
          };
        } catch (error) {
          return {
            userId: i,
            success: false,
            error: error.message,
            duration: Date.now() - startTime,
          };
        } finally {
          await page.close();
        }
      })
    );
    
    const successfulSearches = results.filter(r => r.success);
    const averageDuration = successfulSearches.reduce((sum, r) => sum + r.duration, 0) / successfulSearches.length;
    
    // Performance requirements
    expect(successfulSearches.length / concurrentUsers).toBeGreaterThan(0.95); // >95% success rate
    expect(averageDuration).toBeLessThan(2000); // Average < 2s response time
  });
});
```

---

## Healthcare Compliance Requirements

### Critical Compliance Considerations

#### PDPA (Personal Data Protection Act) Requirements
```typescript
// Healthcare data handling must follow PDPA guidelines
interface PDPACompliance {
  dataMinimization: {
    collect: 'Only necessary data for healthcare service';
    purpose: 'Clearly defined and communicated';
    retention: 'Maximum 6 years for medical records';
  };
  
  consentManagement: {
    explicit: 'Clear, specific consent for medical data';
    withdrawable: 'Easy consent withdrawal mechanism';
    documented: 'Full consent history maintained';
  };
  
  dataSubjectRights: {
    access: 'Provide copy of personal data within 30 days';
    rectification: 'Correct inaccurate personal data';
    erasure: 'Delete personal data when no longer needed';
    portability: 'Transfer data in machine-readable format';
  };
  
  securityMeasures: {
    encryption: 'AES-256 for data at rest, TLS 1.3 for transit';
    access: 'Role-based access control with audit logs';
    monitoring: '24/7 security monitoring and alerts';
    breach: 'Incident response within 72 hours';
  };
}

// Implementation examples
export class PDPAComplianceService {
  async processDataSubjectRequest(
    userId: string,
    requestType: 'access' | 'rectification' | 'erasure' | 'portability'
  ): Promise<DataSubjectResponse> {
    // Log all data subject requests for audit
    await this.logDataSubjectRequest(userId, requestType);
    
    switch (requestType) {
      case 'access':
        return this.processAccessRequest(userId);
      case 'erasure':
        return this.processErasureRequest(userId);
      case 'rectification':
        return this.processRectificationRequest(userId);
      case 'portability':
        return this.processPortabilityRequest(userId);
      default:
        throw new Error('Invalid data subject request type');
    }
  }
  
  async recordConsent(userId: string, consent: ConsentDetails): Promise<void> {
    // Record consent with full context for audit
    await prisma.consentRecord.create({
      data: {
        userId,
        consentType: consent.type,
        consentGiven: consent.given,
        consentText: consent.fullText,
        ipAddress: consent.ipAddress,
        userAgent: consent.userAgent,
        timestamp: new Date(),
        expiryDate: consent.expiryDate,
      },
    });
    
    // Log consent activity for compliance audit
    await this.logConsentActivity(userId, consent);
  }
}
```

#### MOH (Ministry of Health) Compliance
```typescript
// MOH requirements for healthcare platforms
interface MOHCompliance {
  providerVerification: {
    license: 'All doctors must have valid MCR numbers';
    accreditation: 'Clinics must have valid MOH accreditation';
    monitoring: 'Regular license status verification';
  };
  
  serviceStandards: {
    availability: 'Clinic hours must be accurately displayed';
    pricing: 'Transparent pricing for all services';
    quality: 'Minimum quality standards for all providers';
  };
  
  dataIntegrity: {
    audit: 'All medical data access must be logged';
    backup: 'Daily encrypted backups with 7-year retention';
    recovery: 'Disaster recovery procedures documented';
  };
}

// Doctor verification implementation
export class MOHComplianceService {
  async verifyDoctorLicense(mcrNumber: string): Promise<DoctorVerification> {
    // Query MOH doctor registry (simulated)
    const mohRecord = await this.queryMOHRegistry(mcrNumber);
    
    if (!mohRecord || !mohRecord.isActive) {
      throw new Error('Invalid or inactive medical license');
    }
    
    // Log verification for audit trail
    await this.logLicenseVerification(mcrNumber, mohRecord);
    
    return {
      isVerified: true,
      licenseStatus: mohRecord.status,
      expiryDate: mohRecord.expiryDate,
      specializations: mohRecord.specializations,
    };
  }
  
  async validateClinicAccreditation(registrationNo: string): Promise<boolean> {
    // Validate clinic registration with MOH
    const accreditation = await this.queryMOHClinicRegistry(registrationNo);
    
    return accreditation?.isAccredited && accreditation?.expiryDate > new Date();
  }
}
```

#### WCAG 2.2 AA Accessibility Requirements
```typescript
// Accessibility compliance for healthcare applications
interface AccessibilityCompliance {
  perceivable: {
    textAlternatives: 'All images must have descriptive alt text';
    colorContrast: 'Minimum 4.5:1 contrast ratio';
    textResize: 'Text must be resizable up to 200%';
    imagesOfText: 'Avoid images of text where possible';
  };
  
  operable: {
    keyboardAccessible: 'All functionality via keyboard';
    noSeizures: 'No content flashes more than 3 times per second';
    navigable: 'Clear navigation and page structure';
    pageTitled: 'All pages have descriptive titles';
  };
  
  understandable: {
    readable: 'Text content is readable and understandable';
    predictable: 'Web pages appear and operate predictably';
    inputAssistance: 'Help users avoid and correct mistakes';
  };
  
  robust: {
    compatible: 'Content compatible with assistive technologies';
    parsing: 'Valid HTML with proper markup';
  };
}

// Accessibility implementation
export class AccessibilityService {
  async validateComponentAccessibility(
    component: React.Component
  ): Promise<AccessibilityValidation> {
    const issues: AccessibilityIssue[] = [];
    
    // Check for required ARIA attributes
    if (!component.props['aria-label'] && !component.props['aria-labelledby']) {
      issues.push({
        type: 'missing_label',
        severity: 'high',
        message: 'Interactive element must have accessible label',
      });
    }
    
    // Check for keyboard navigation support
    if (component.props.onClick && !component.props.onKeyDown) {
      issues.push({
        type: 'keyboard_support',
        severity: 'medium',
        message: 'Click handler should have keyboard equivalent',
      });
    }
    
    // Check color contrast (would need actual color values)
    const colorContrast = this.calculateColorContrast(
      component.props.color,
      component.props.backgroundColor
    );
    
    if (colorContrast < 4.5) {
      issues.push({
        type: 'color_contrast',
        severity: 'high',
        message: `Color contrast ${colorContrast.toFixed(2)}:1 is below 4.5:1 minimum`,
      });
    }
    
    return {
      isCompliant: issues.length === 0,
      issues,
      score: Math.max(0, 100 - (issues.length * 20)),
    };
  }
  
  announcePageChange(message: string): void {
    const announcer = document.getElementById('page-announcer');
    if (announcer) {
      announcer.textContent = message;
      // Clear after announcement for screen readers
      setTimeout(() => {
        announcer.textContent = '';
      }, 1000);
    }
  }
}
```

### Audit Trail Requirements
```typescript
// Comprehensive audit logging for healthcare compliance
interface HealthcareAuditLog {
  id: string;
  userId?: string; // Null for anonymous access
  action: string; // CRUD operation type
  resourceType: string; // Table or resource name
  resourceId?: string; // Specific resource identifier
  oldValues?: Record<string, any>; // Previous state
  newValues?: Record<string, any>; // New state
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  sessionId?: string;
  complianceFlags: string[]; // PDPA, MOH, WCAG flags
}

// Audit logging service
export class HealthcareAuditService {
  async logDataAccess(
    userId: string,
    resourceType: string,
    resourceId: string,
    accessType: 'read' | 'export'
  ): Promise<void> {
    await prisma.auditLog.create({
      data: {
        userId,
        action: `${accessType.toUpperCase()}_${resourceType.toUpperCase()}`,
        resourceType,
        resourceId,
        ipAddress: this.getCurrentIP(),
        userAgent: this.getCurrentUserAgent(),
        timestamp: new Date(),
        complianceFlags: ['PDPA', 'MOH_AUDIT_REQUIRED'],
      },
    });
  }
  
  async logConsentActivity(
    userId: string,
    consent: ConsentDetails
  ): Promise<void> {
    await prisma.auditLog.create({
      data: {
        userId,
        action: consent.given ? 'CONSENT_GIVEN' : 'CONSENT_WITHDRAWN',
        resourceType: 'CONSENT_RECORD',
        newValues: {
          consentType: consent.type,
          consentText: consent.fullText,
          timestamp: consent.timestamp,
        },
        ipAddress: consent.ipAddress,
        userAgent: consent.userAgent,
        timestamp: new Date(),
        complianceFlags: ['PDPA_CONSENT_TRACKING'],
      },
    });
  }
  
  async generateComplianceReport(
    startDate: Date,
    endDate: Date
  ): Promise<ComplianceReport> {
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
        complianceFlags: {
          hasSome: ['PDPA', 'MOH', 'WCAG'],
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });
    
    return {
      period: { startDate, endDate },
      totalActivities: auditLogs.length,
      pdpaActivities: auditLogs.filter(log => log.complianceFlags.includes('PDPA')).length,
      mohActivities: auditLogs.filter(log => log.complianceFlags.includes('MOH')).length,
      dataSubjectRequests: auditLogs.filter(log => 
        log.action.includes('DATA_SUBJECT_REQUEST')
      ).length,
      consentChanges: auditLogs.filter(log => 
        log.action.includes('CONSENT')
      ).length,
      suspiciousActivities: await this.identifySuspiciousActivities(auditLogs),
      recommendations: this.generateRecommendations(auditLogs),
    };
  }
}
```

---

## Deployment & Infrastructure

### Environment Configuration

#### Development Environment
```bash
# .env.local (development)
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/maria_family_clinic_dev"
DIRECT_URL="postgresql://postgres:password@localhost:5432/maria_family_clinic_dev"

# Supabase (development)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Authentication
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# External APIs
GOOGLE_MAPS_API_KEY="your-google-maps-key"
MOH_API_KEY="your-moh-api-key"
HEALTHIER_SG_API_KEY="your-healthier-sg-api-key"

# Monitoring
SENTRY_DSN="your-sentry-dsn"
VERCEL_ANALYTICS_ID="your-vercel-analytics"
```

#### Production Environment
```bash
# .env.production
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://mariafamilyclinic.com

# Database (Supabase production)
DATABASE_URL="postgresql://postgres:password@prod.supabase.co:5432/maria_family_clinic_prod"
DIRECT_URL="postgresql://postgres:password@prod.supabase.co:5432/maria_family_clinic_prod"

# Supabase (production)
NEXT_PUBLIC_SUPABASE_URL="https://prod-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="prod-anon-key"
SUPABASE_SERVICE_ROLE_KEY="prod-service-role-key"

# Security
NEXTAUTH_SECRET="production-nextauth-secret"
NEXTAUTH_URL="https://mariafamilyclinic.com"

# Production API keys
GOOGLE_MAPS_API_KEY="production-google-maps-key"
MOH_API_KEY="production-moh-key"
HEALTHIER_SG_API_KEY="production-healthier-sg-key"

# Production monitoring
SENTRY_DSN="production-sentry-dsn"
VERCEL_ANALYTICS_ID="production-analytics"
SLACK_WEBHOOK="production-slack-webhook"
```

### Deployment Scripts & CI/CD

#### Vercel Deployment Configuration
```json
{
  "version": 2,
  "name": "maria-family-clinic",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "regions": ["sin1"], // Singapore region for low latency
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        }
      ]
    }
  ]
}
```

#### GitHub Actions CI/CD Pipeline
```yaml
# .github/workflows/ci-cd.yml
name: Healthcare Platform CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'
  DATABASE_URL: ${{ secrets.DATABASE_URL }}

jobs:
  # Healthcare Compliance Tests
  compliance-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run PDPA Compliance Tests
        run: npm run test:compliance:pdpa
      
      - name: Run MOH Compliance Tests
        run: npm run test:compliance:moh
      
      - name: Run Security Tests
        run: npm run test:compliance:security
      
      - name: Generate Compliance Report
        run: npm run test:compliance:report
        continue-on-error: true
      
      - name: Upload Compliance Artifacts
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: compliance-reports
          path: |
            compliance-report.html
            security-scan-results.json

  # Quality Gates
  quality-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run TypeScript Check
        run: npm run type-check
      
      - name: Run Linting
        run: npm run lint
      
      - name: Run Accessibility Tests
        run: npm run test:accessibility
      
      - name: Run Performance Tests
        run: npm run lighthouse
      
      - name: Run Unit Tests
        run: npm run test:coverage
      
      - name: Upload Coverage Reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella

  # Build and Deploy
  build-and-deploy:
    needs: [compliance-tests, quality-tests]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
          NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
      
      - name: Run E2E Tests
        run: npm run test:e2e
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
      
      - name: Run Post-deployment Tests
        run: npm run test:e2e:production
        env:
          NEXT_PUBLIC_APP_URL: ${{ steps.deploy.outputs.preview-url }}
      
      - name: Notify Deployment Success
        if: success()
        run: |
          curl -X POST "${{ secrets.SLACK_WEBHOOK }}" \
            -H 'Content-Type: application/json' \
            -d '{
              "text": "✅ Healthcare platform deployed successfully!",
              "attachments": [{
                "color": "good",
                "fields": [{
                  "title": "Environment",
                  "value": "Production",
                  "short": true
                }, {
                  "title": "URL",
                  "value": "'${{ steps.deploy.outputs.preview-url }}'",
                  "short": true
                }, {
                  "title": "Commit",
                  "value": "'${{ github.sha }}'",
                  "short": true
                }]
              }]
            }'
        
      - name: Notify Deployment Failure
        if: failure()
        run: |
          curl -X POST "${{ secrets.SLACK_WEBHOOK }}" \
            -H 'Content-Type: application/json' \
            -d '{
              "text": "❌ Healthcare platform deployment failed!",
              "attachments": [{
                "color": "danger",
                "fields": [{
                  "title": "Environment",
                  "value": "Production",
                  "short": true
                }, {
                  "title": "Error",
                  "value": "'${{ steps.deploy.outputs.stderr }}'",
                  "short": false
                }]
              }]
            }'
```

### Health Checks & Monitoring
```typescript
// Health check endpoints for monitoring
export async function GET() {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version,
    environment: process.env.NODE_ENV,
    services: {
      database: await checkDatabaseHealth(),
      supabase: await checkSupabaseHealth(),
      external_apis: await checkExternalAPIs(),
    },
    metrics: {
      memory_usage: process.memoryUsage(),
      cpu_usage: process.cpuUsage(),
    },
  };
  
  const isHealthy = Object.values(healthCheck.services).every(service => service === 'healthy');
  
  return Response.json(healthCheck, {
    status: isHealthy ? 200 : 503,
    headers: {
      'Cache-Control': 'no-cache',
    },
  });
}

async function checkDatabaseHealth(): Promise<string> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return 'healthy';
  } catch (error) {
    console.error('Database health check failed:', error);
    return 'unhealthy';
  }
}

async function checkSupabaseHealth(): Promise<string> {
  try {
    const { data, error } = await supabase.from('clinics').select('id').limit(1);
    if (error) throw error;
    return 'healthy';
  } catch (error) {
    console.error('Supabase health check failed:', error);
    return 'unhealthy';
  }
}

// Healthcare-specific monitoring
export class HealthcareMonitoringService {
  async collectHealthcareMetrics(): Promise<HealthcareMetrics> {
    return {
      appointmentBookingRate: await this.getAppointmentBookingRate(),
      clinicSearchLatency: await this.getClinicSearchLatency(),
      doctorProfileLoadTime: await this.getDoctorProfileLoadTime(),
      healthierSGEnrollmentRate: await this.getHealthierSGEnrollmentRate(),
      pdpaComplianceScore: await this.getPDPAComplianceScore(),
      accessibilityScore: await this.getAccessibilityScore(),
      coreWebVitals: await this.getCoreWebVitals(),
    };
  }
  
  async alertOnComplianceViolation(violation: ComplianceViolation): Promise<void> {
    const alert = {
      severity: violation.severity,
      type: 'HEALTHCARE_COMPLIANCE_VIOLATION',
      message: violation.message,
      resource: violation.resource,
      timestamp: new Date().toISOString(),
      action_required: true,
    };
    
    // Send immediate alerts for critical violations
    if (violation.severity === 'critical') {
      await this.sendSlackAlert(alert);
      await this.sendEmailAlert(alert);
      await this.createIncidentTicket(alert);
    }
  }
}
```

---

## Performance & Optimization Guidelines

### Core Web Vitals Optimization

#### Performance Targets
```typescript
interface PerformanceTargets {
  coreWebVitals: {
    LCP: '< 2.5 seconds'; // Largest Contentful Paint
    FID: '< 100 milliseconds'; // First Input Delay  
    CLS: '< 0.1'; // Cumulative Layout Shift
  };
  
  healthcareWorkflows: {
    clinicSearch: '< 2.0 seconds';
    doctorProfileLoad: '< 1.5 seconds';
    appointmentBooking: '< 3.0 seconds';
    healthierSGLoad: '< 2.5 seconds';
  };
  
  technical: {
    timeToFirstByte: '< 600 milliseconds';
    firstContentfulPaint: '< 1.8 seconds';
    interactive: '< 3.8 seconds';
  };
}

// Performance monitoring implementation
export class PerformanceMonitor {
  private webVitals: Map<string, number> = new Map();
  
  async initializePerformanceTracking(): Promise<void> {
    // Core Web Vitals tracking
    this.trackLCP();
    this.trackFID();
    this.trackCLS();
    
    // Healthcare-specific metrics
    this.trackClinicSearchPerformance();
    this.trackAppointmentBookingPerformance();
    
    // Real-time reporting
    setInterval(() => {
      this.reportMetrics();
    }, 30000); // Every 30 seconds
  }
  
  private trackClinicSearchPerformance(): void {
    // Monitor clinic search initiation
    document.addEventListener('clinic-search-start', () => {
      performance.mark('clinic-search-start');
    });
    
    // Monitor search completion
    document.addEventListener('clinic-search-complete', () => {
      performance.mark('clinic-search-end');
      performance.measure('clinic-search-duration', 'clinic-search-start', 'clinic-search-end');
      
      const measure = performance.getEntriesByName('clinic-search-duration')[0];
      this.webVitals.set('clinicSearchTime', measure.duration);
      
      // Alert if search takes too long
      if (measure.duration > 2000) {
        this.alertPerformanceIssue('SEARCH_LATENCY', measure.duration);
      }
    });
  }
}
```

#### Bundle Optimization Strategy
```typescript
// next.config.ts - Optimized for healthcare platform
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Experimental features for better performance
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
    optimizeCss: true,
    optimizePackageImports: [
      '@radix-ui/react-accordion',
      '@radix-ui/react-dialog', 
      '@radix-ui/react-select',
      '@radix-ui/react-toast',
    ],
  },
  
  // Image optimization for healthcare content
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Webpack optimization for healthcare features
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Optimize bundle splitting for healthcare features
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          // Vendor chunks for external libraries
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          
          // Healthcare UI components
          healthcare: {
            test: /[\\/]src[\\/]components[\\/]healthcare[\\/]/,
            name: 'healthcare-ui',
            chunks: 'all',
            priority: 20,
          },
          
          // Doctor and clinic components  
          providers: {
            test: /[\\/]src[\\/]components[\\/](doctor|clinic)[\\/]/,
            name: 'provider-ui',
            chunks: 'all',
            priority: 20,
          },
          
          // Common utilities
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
            priority: 5,
          },
        },
      };
      
      // Bundle analyzer for optimization insights
      if (process.env.ANALYZE === 'true') {
        const { BundleAnalyzerPlugin } = require('webpack');
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
            reportFilename: 'bundle-analysis.html',
          })
        );
      }
    }
    
    return config;
  },
  
  // Compression and optimization
  compress: true,
  poweredByHeader: false,
  
  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // Redirects for SEO and user experience
  async redirects() {
    return [
      {
        source: '/clinics',
        destination: '/clinics/search',
        permanent: false,
      },
      {
        source: '/doctors',
        destination: '/doctors/search', 
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
```

#### Database Optimization
```typescript
// Database query optimization for healthcare data
export class HealthcareDatabaseOptimizer {
  
  // Optimize clinic search with geospatial queries
  async searchClinicsOptimized(params: {
    location?: { lat: number; lng: number };
    radius?: number; // km
    specialty?: string;
    isHealthierSG?: boolean;
    limit?: number;
  }): Promise<Clinic[]> {
    const { location, radius = 5, specialty, isHealthierSG, limit = 20 } = params;
    
    let query = prisma.clinic.findMany({
      where: {
        AND: [
          specialty ? {
            servicesOffered: {
              hasSome: [specialty],
            },
          } : {},
          isHealthierSG !== undefined ? {
            isHealthierSG,
          } : {},
        ],
      },
      include: {
        doctors: {
          include: {
            doctor: {
              select: {
                id: true,
                name: true,
                specialties: true,
                rating: true,
                reviewCount: true,
              },
            },
          },
        },
        services: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                category: true,
              },
            },
          },
        },
        _count: {
          select: {
            appointments: {
              where: {
                appointmentDate: {
                  gte: new Date(),
                },
              },
            },
          },
        },
      },
      take: limit,
    });
    
    // Apply PostGIS geospatial filtering if location provided
    if (location) {
      // Use raw SQL for better performance with PostGIS
      const rawQuery = `
        SELECT 
          c.*,
          ST_Distance(c.location, ST_MakePoint($1, $2)) as distance,
          COUNT(DISTINCT a.id) as available_appointments
        FROM clinics c
        LEFT JOIN appointments a ON c.id = a."clinicId" 
          AND a."appointmentDate" >= NOW()
        WHERE c.location IS NOT NULL
          AND ST_DWithin(c.location, ST_MakePoint($1, $2), $3)
          ${specialty ? `AND c."servicesOffered" && ARRAY[$4]` : ''}
          ${isHealthierSG !== undefined ? `AND c."isHealthierSG" = $5` : ''}
        GROUP BY c.id, c.location
        ORDER BY distance
        LIMIT $6
      `;
      
      const parameters = [
        location.lng,
        location.lat, 
        radius * 1000, // Convert km to meters
        specialty ? [specialty] : null,
        isHealthierSG,
        limit,
      ].filter(p => p !== null);
      
      const clinics = await prisma.$queryRaw(rawQuery, ...parameters);
      return clinics;
    }
    
    return query;
  }
  
  // Optimize appointment queries
  async getAvailableAppointmentSlots(clinicId: string, doctorId?: string): Promise<AppointmentSlot[]> {
    // Use indexes on appointmentDate and status for fast lookups
    const slots = await prisma.appointment.findMany({
      where: {
        clinicId,
        doctorId: doctorId || undefined,
        status: {
          in: ['AVAILABLE', 'PENDING'],
        },
        appointmentDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Next 30 days
        },
      },
      select: {
        id: true,
        appointmentDate: true,
        status: true,
        doctor: {
          select: {
            name: true,
          },
        },
        service: {
          select: {
            name: true,
            estimatedDuration: true,
          },
        },
      },
      orderBy: {
        appointmentDate: 'asc',
      },
    });
    
    return slots;
  }
  
  // Index optimization recommendations
  async getIndexRecommendations(): Promise<IndexRecommendation[]> {
    const slowQueries = await prisma.$queryRaw`
      SELECT 
        query,
        mean_exec_time,
        calls,
        total_exec_time
      FROM pg_stat_statements 
      WHERE mean_exec_time > 100
      ORDER BY mean_exec_time DESC
      LIMIT 10;
    `;
    
    // Analyze slow queries and recommend indexes
    return slowQueries.map((query: any) => ({
      query: query.query,
      averageExecutionTime: query.mean_exec_time,
      callCount: query.calls,
      recommendation: this.generateIndexRecommendation(query.query),
    }));
  }
}
```

---

## Integration Points & External APIs

### Government API Integrations

#### MyInfo SingPass Integration
```typescript
// MyInfo integration for Singapore identity verification
export class MyInfoIntegration {
  private readonly baseUrl = 'https://api.myinfo.gov.sg';
  private readonly clientId: string;
  private readonly clientSecret: string;
  
  constructor() {
    this.clientId = process.env.MYINFO_CLIENT_ID!;
    this.clientSecret = process.env.MYINFO_CLIENT_SECRET!;
  }
  
  // Initiate MyInfo login flow
  initiateLogin(state: string): string {
    const authUrl = new URL(`${this.baseUrl}/oauth2/authorize`);
    authUrl.searchParams.set('client_id', this.clientId);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'name uinfin mobile no');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('redirect_uri', `${process.env.NEXT_PUBLIC_APP_URL}/auth/myinfo/callback`);
    
    return authUrl.toString();
  }
  
  // Exchange authorization code for access token
  async exchangeCodeForToken(code: string): Promise<MyInfoTokenResponse> {
    const response = await fetch(`${this.baseUrl}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/auth/myinfo/callback`,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`MyInfo token exchange failed: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  // Retrieve user data using access token
  async getUserData(accessToken: string): Promise<MyInfoUserData> {
    const response = await fetch(`${this.baseUrl}/v3/person-basic`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`MyInfo data retrieval failed: ${response.statusText}`);
    }
    
    const userData = await response.json();
    
    // Log data access for PDPA compliance
    await this.logDataAccess('MyInfo', 'PERSON_BASIC', userData.uinfin);
    
    return {
      uinfin: userData.uinfin, // NRIC/FIN
      name: userData.name,
      mobileno: userData.mobileno,
      regadd: userData.regadd,
      // Add other MyInfo fields as needed
    };
  }
}
```

#### Ministry of Health (MOH) APIs
```typescript
// MOH integration for healthcare provider verification
export class MOHIntegration {
  private readonly baseUrl = 'https://service.moh.gov.sg';
  private readonly apiKey: string;
  
  constructor() {
    this.apiKey = process.env.MOH_API_KEY!;
  }
  
  // Verify doctor registration with Medical Council
  async verifyDoctorLicense(mcrNumber: string): Promise<DoctorVerification> {
    const response = await fetch(`${this.baseUrl}/api/doctor/verify/${mcrNumber}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      if (response