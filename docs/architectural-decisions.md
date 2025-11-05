# Architectural Decisions Document: My Family Clinic Website

## Executive Summary
This document outlines the comprehensive system architecture for the My Family Clinic website, detailing key architectural decisions, system design patterns, and integration strategies that ensure scalability, maintainability, and compliance with healthcare data standards.

## System Architecture Overview

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│  Next.js 15 App Router                                         │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐  │
│  │   App Pages     │ │  Server Actions │ │  API Routes     │  │
│  │  (RSC + Client) │ │   (Form Submit) │ │   (tRPC)        │  │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘  │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐  │
│  │  shadcn/ui      │ │  Tailwind CSS   │ │  React Query    │  │
│  │  Components     │ │  Design System  │ │  State Mgmt     │  │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                   │
                          ┌────────▼────────┐
                          │   tRPC Router   │
                          │  Type-Safe API  │
                          └────────┬────────┘
                                   │
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐  │
│  │   NextAuth 5    │ │   Prisma ORM    │ │  Supabase Edge  │  │
│  │  Authentication │ │  Data Access    │ │   Functions     │  │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘  │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐  │
│  │  Audit Logging  │ │   Validation    │ │   File Upload   │  │
│  │   Middleware    │ │   Middleware    │ │   Processing    │  │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                   │
┌─────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│  Supabase PostgreSQL with PostGIS                              │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐  │
│  │   Core Tables   │ │  Junction Tables│ │   Audit Tables  │  │
│  │ Clinic, Service │ │ Service-Clinic  │ │  Activity Logs  │  │
│  │ Doctor, Enquiry │ │ Doctor-Clinic   │ │   Analytics     │  │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘  │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐  │
│  │   GiST Indexes  │ │ Trigram Indexes │ │  RLS Policies   │  │
│  │   (Geospatial)  │ │  (Text Search)  │ │   (Security)    │  │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Key Architectural Decisions

### ADR-001: Frontend Architecture - Next.js 15 App Router
**Decision**: Use Next.js 15 with App Router for the frontend architecture
**Status**: Accepted
**Date**: 2025-11-04

**Context**:
- Need for server-side rendering for SEO and performance
- Requirement for type-safe, scalable React application
- Healthcare application requiring accessibility and performance

**Decision**:
- Implement Next.js 15 App Router architecture
- Use Server Components for static content and initial page loads
- Use Client Components for interactive features (search, forms, maps)
- Implement Server Actions for form submissions and data mutations

**Consequences**:
- ✅ Improved SEO with server-side rendering
- ✅ Better performance with Server Components
- ✅ Simplified data fetching patterns
- ✅ Type-safe development with TypeScript
- ⚠️ Learning curve for App Router patterns
- ⚠️ Careful client/server boundary management required

**Implementation**:
```typescript
// app/layout.tsx - Root layout with metadata and providers
// app/page.tsx - Homepage as Server Component
// app/clinics/page.tsx - Clinic search with Client Components
// app/api/trpc/[trpc]/route.ts - tRPC API endpoint
```

### ADR-002: Data Access Layer - Prisma ORM with PostGIS
**Decision**: Use Prisma ORM with PostgreSQL PostGIS extension
**Status**: Accepted
**Date**: 2025-11-04

**Context**:
- Need for type-safe database operations
- Geospatial requirements for clinic location search
- Complex relationships between clinics, services, and doctors
- Healthcare data compliance requirements

**Decision**:
- Implement Prisma ORM for type-safe database access
- Use PostgreSQL with PostGIS extension for geospatial capabilities
- Implement comprehensive indexing strategy for performance
- Use Prisma migrations for database schema management

**Consequences**:
- ✅ Type-safe database operations
- ✅ Powerful geospatial query capabilities
- ✅ Excellent developer experience with Prisma Studio
- ✅ Automatic migration management
- ⚠️ PostgreSQL-specific lock-in
- ⚠️ PostGIS complexity for geospatial operations

**Implementation**:
```prisma
model Clinic {
  id          String   @id @default(cuid())
  name        String
  location    String   // PostGIS POINT type
  // ... other fields
  
  @@index([location], type: Gist) // Geospatial index
}
```

### ADR-003: API Layer - tRPC for Type-Safe API
**Decision**: Use tRPC 11 for end-to-end type safety
**Status**: Accepted
**Date**: 2025-11-04

**Context**:
- Need for type-safe API communication
- Complex data fetching requirements
- Real-time updates for enquiry status
- Healthcare data validation requirements

**Decision**:
- Implement tRPC 11 for type-safe API layer
- Use Zod for runtime validation and schema definition
- Implement middleware for authentication and audit logging
- Use subscription capabilities for real-time updates

**Consequences**:
- ✅ End-to-end type safety from database to frontend
- ✅ Automatic API documentation generation
- ✅ Excellent developer experience with IntelliSense
- ✅ Runtime validation with Zod schemas
- ⚠️ TypeScript ecosystem lock-in
- ⚠️ Learning curve for tRPC patterns

**Implementation**:
```typescript
// server/api/routers/clinic.ts
export const clinicRouter = createTRPCRouter({
  searchNearby: publicProcedure
    .input(z.object({
      latitude: z.number(),
      longitude: z.number(),
      radius: z.number().default(5000),
    }))
    .query(async ({ input, ctx }) => {
      // PostGIS query for nearby clinics
    }),
});
```

### ADR-004: Authentication - NextAuth 5 with Database Sessions
**Decision**: Use NextAuth 5 with database session storage
**Status**: Accepted
**Date**: 2025-11-04

**Context**:
- Need for secure authentication system
- Healthcare data access controls
- Support for multiple authentication providers
- Session management for compliance

**Decision**:
- Implement NextAuth 5 with database session storage
- Use email/password for primary authentication
- Support OAuth providers (Google) for user convenience
- Implement role-based access control for admin functions

**Consequences**:
- ✅ Industry-standard authentication patterns
- ✅ Secure session management
- ✅ Support for multiple auth providers
- ✅ Built-in CSRF protection
- ⚠️ Database storage overhead for sessions
- ⚠️ Complex configuration for healthcare compliance

**Implementation**:
```typescript
// auth.config.ts
export const authConfig = {
  providers: [
    Credentials({
      // Email/password authentication
    }),
    Google({
      // OAuth provider
    }),
  ],
  session: { strategy: "database" },
  callbacks: {
    // Role-based access control
  },
};
```

### ADR-005: State Management - TanStack React Query
**Decision**: Use TanStack React Query 5 for client-side state management
**Status**: Accepted
**Date**: 2025-11-04

**Context**:
- Complex data fetching requirements
- Need for optimistic updates
- Caching for performance
- Offline support for critical information

**Decision**:
- Implement TanStack React Query 5 for server state management
- Use optimistic updates for form submissions
- Implement intelligent caching strategies
- Use mutation for data updates with rollback capabilities

**Consequences**:
- ✅ Intelligent caching and background updates
- ✅ Optimistic updates for better UX
- ✅ Built-in loading and error states
- ✅ Offline support capabilities
- ⚠️ Additional complexity for simple operations
- ⚠️ Cache invalidation strategy required

**Implementation**:
```typescript
// hooks/use-clinics.ts
export function useClinicsNearby(coordinates: Coordinates) {
  return useQuery({
    queryKey: ['clinics', 'nearby', coordinates],
    queryFn: () => api.clinic.searchNearby.query(coordinates),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
```

### ADR-006: Component Architecture - shadcn/ui with Design System
**Decision**: Use shadcn/ui as the foundation for a custom design system
**Status**: Accepted
**Date**: 2025-11-04

**Context**:
- Need for accessible, high-quality UI components
- Healthcare application accessibility requirements
- Consistent design system across all pages
- Mobile-first responsive design

**Decision**:
- Use shadcn/ui components as the foundation
- Customize components with healthcare-specific design tokens
- Implement comprehensive accessibility features
- Create compound components for common patterns

**Consequences**:
- ✅ Built-in accessibility with Radix UI primitives
- ✅ Customizable design system
- ✅ Consistent component patterns
- ✅ Mobile-first responsive design
- ⚠️ Initial setup and customization effort
- ⚠️ Dependency on Radix UI ecosystem

**Implementation**:
```typescript
// components/ui/clinic-card.tsx
export function ClinicCard({ clinic }: ClinicCardProps) {
  return (
    <Card className="clinic-card">
      <CardHeader>
        <CardTitle>{clinic.name}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Clinic information */}
      </CardContent>
    </Card>
  );
}
```

## Data Architecture

### Database Schema Design
```sql
-- Core entity tables
CREATE TABLE clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  location GEOGRAPHY(POINT, 4326), -- PostGIS point
  address TEXT NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  operating_hours JSONB,
  amenities TEXT[],
  status clinic_status DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- GiST index for geospatial queries
CREATE INDEX idx_clinics_location_gist ON clinics USING GIST (location);

-- Trigram index for fuzzy text search
CREATE INDEX idx_clinics_name_trgm ON clinics USING GIN (name gin_trgm_ops);
```

### Relationship Management
```sql
-- Many-to-many: Services available at clinics
CREATE TABLE service_clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  available BOOLEAN DEFAULT true,
  waiting_time_minutes INTEGER,
  additional_info TEXT,
  
  UNIQUE(service_id, clinic_id)
);

-- Many-to-many: Doctors working at clinics
CREATE TABLE doctor_clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  is_primary_clinic BOOLEAN DEFAULT false,
  schedule JSONB, -- Weekly schedule
  
  UNIQUE(doctor_id, clinic_id)
);
```

### Performance Optimization Strategy
```sql
-- Composite indexes for common query patterns
CREATE INDEX idx_clinics_status_location ON clinics (status, location) 
  WHERE status = 'ACTIVE';

CREATE INDEX idx_service_clinics_lookup ON service_clinics (service_id, clinic_id, available)
  WHERE available = true;

CREATE INDEX idx_doctors_specialty_language ON doctors (specialty, languages)
  WHERE status = 'ACTIVE';

-- Partial indexes for performance
CREATE INDEX idx_enquiries_pending ON enquiries (created_at)
  WHERE status = 'PENDING';
```

## Security Architecture

### Authentication Flow
```
User Request → NextAuth Middleware → Session Validation → Route Protection
     ↓                    ↓                    ↓               ↓
  Public Route      Protected Route      Admin Route    API Route
     ↓                    ↓                    ↓               ↓
  Allow Access     Check Session       Check Role      JWT Validation
```

### Data Protection Strategy
```typescript
// Row-Level Security (RLS) Policies
-- Users can only see their own enquiries
CREATE POLICY "Users can view own enquiries" ON enquiries
  FOR SELECT USING (user_id = auth.uid());

-- Admins can see all enquiries
CREATE POLICY "Admins can view all enquiries" ON enquiries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'ADMIN'
    )
  );
```

### Audit Logging Architecture
```typescript
// Audit middleware for tRPC
const auditMiddleware = t.middleware(async ({ ctx, next, path, type, input }) => {
  const start = Date.now();
  const result = await next();
  const duration = Date.now() - start;

  // Log audit trail
  await ctx.db.auditLog.create({
    data: {
      action: `${type}:${path}`,
      userId: ctx.session?.user?.id,
      metadata: { input, duration },
      ipAddress: ctx.req.ip,
      userAgent: ctx.req.headers['user-agent'],
    },
  });

  return result;
});
```

## Integration Architecture

### External Service Integration
```typescript
// Google Maps API integration
interface MapsService {
  geocode(address: string): Promise<Coordinates>;
  reverseGeocode(coordinates: Coordinates): Promise<Address>;
  calculateDistance(from: Coordinates, to: Coordinates): Promise<number>;
}

// Email service integration
interface EmailService {
  sendEnquiryConfirmation(enquiry: Enquiry): Promise<void>;
  sendNotificationToClinic(enquiry: Enquiry): Promise<void>;
  sendStatusUpdate(enquiry: Enquiry): Promise<void>;
}
```

### File Upload Architecture
```typescript
// Supabase Storage integration
const uploadFile = async (file: File, bucket: string): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${bucket}/${fileName}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (error) throw error;
  return filePath;
};
```

## Performance Architecture

### Caching Strategy
```typescript
// Multi-layer caching approach
1. Browser Cache (Static Assets) - 1 year
2. CDN Cache (Images, CSS, JS) - 30 days
3. API Cache (tRPC queries) - 5 minutes
4. Database Query Cache (Prisma) - 1 minute
5. Application Cache (React Query) - Configurable per query
```

### Database Optimization
```sql
-- Connection pooling configuration
database_url = "postgresql://user:pass@host:5432/db?pgbouncer=true&connection_limit=20"

-- Query optimization
EXPLAIN ANALYZE SELECT c.*, ST_Distance(c.location, ST_Point($1, $2)) as distance
FROM clinics c
WHERE ST_DWithin(c.location, ST_Point($1, $2), $3)
  AND c.status = 'ACTIVE'
ORDER BY distance
LIMIT 20;
```

### Frontend Performance
```typescript
// Code splitting strategy
const ClinicMap = dynamic(() => import('../components/ClinicMap'), {
  ssr: false, // Map component only on client
  loading: () => <MapSkeleton />,
});

// Image optimization
import Image from 'next/image';
<Image
  src={clinic.imageUrl}
  alt={clinic.name}
  width={300}
  height={200}
  priority={index < 3} // Prioritize first 3 images
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRg..."
/>
```

## Accessibility Architecture

### WCAG 2.2 AA Implementation
```typescript
// Semantic HTML structure
<main role="main" aria-label="Clinic search results">
  <section aria-labelledby="search-heading">
    <h1 id="search-heading">Find Healthcare Clinics</h1>
    <div role="search" aria-label="Clinic search form">
      {/* Search form */}
    </div>
  </section>
  
  <section aria-labelledby="results-heading" aria-live="polite">
    <h2 id="results-heading">Search Results</h2>
    <ul role="list">
      {clinics.map(clinic => (
        <li key={clinic.id} role="listitem">
          <ClinicCard clinic={clinic} />
        </li>
      ))}
    </ul>
  </section>
</main>
```

### Screen Reader Optimization
```typescript
// Dynamic announcements for screen readers
const announceToScreenReader = (message: string) => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'assertive');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.textContent = message;
  announcement.style.position = 'absolute';
  announcement.style.left = '-10000px';
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};
```

## Monitoring Architecture

### Performance Monitoring
```typescript
// Real User Monitoring (RUM) setup
const performanceObserver = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    // Send to analytics
    analytics.track('performance_metric', {
      name: entry.name,
      value: entry.value,
      page: window.location.pathname,
    });
  }
});

performanceObserver.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] });
```

### Error Monitoring
```typescript
// Global error boundary
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to monitoring service
    logger.error('React Error Boundary', { error, errorInfo, userId: session?.user?.id });
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback onRetry={this.handleRetry} />;
    }
    return this.props.children;
  }
}
```

## Deployment Architecture

### Infrastructure Overview
```yaml
# Deployment configuration
production:
  frontend: Vercel (Next.js deployment)
  database: Supabase PostgreSQL with PostGIS
  storage: Supabase Storage
  auth: NextAuth with Supabase adapter
  monitoring: Vercel Analytics + Sentry
  cdn: Vercel Edge Network

staging:
  frontend: Vercel Preview
  database: Supabase Staging Project
  storage: Supabase Staging Storage
  auth: NextAuth with test configuration
```

### CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Run tests
        run: npm run test:ci
      - name: Run accessibility tests
        run: npm run test:a11y
      - name: Run performance tests
        run: npm run test:lighthouse

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Vercel
        run: vercel --prod
```

## Risk Mitigation Architecture

### Data Backup Strategy
```sql
-- Automated daily backups
SELECT cron.schedule('backup-database', '0 2 * * *', 'pg_dump mydatabase');

-- Point-in-time recovery capability
-- Supabase provides automated backups with point-in-time recovery
```

### Disaster Recovery Plan
```typescript
// Health check endpoints
app.get('/health', (req, res) => {
  const checks = {
    database: await checkDatabaseConnection(),
    auth: await checkAuthService(),
    storage: await checkStorageService(),
  };
  
  const isHealthy = Object.values(checks).every(check => check.status === 'ok');
  res.status(isHealthy ? 200 : 503).json(checks);
});
```

This architectural decisions document provides a comprehensive foundation for building a scalable, secure, and maintainable healthcare website that meets all technical requirements while ensuring excellent user experience and regulatory compliance.