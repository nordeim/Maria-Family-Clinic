# New Team Member Onboarding Guide - My Family Clinic Healthcare Platform

## Welcome to the Team! 🎉

Welcome to the My Family Clinic Healthcare Platform development team. This comprehensive onboarding guide will help you understand the project, get your development environment set up, and start contributing effectively to Singapore's national healthcare platform.

## Project Overview

### What We're Building
My Family Clinic is a comprehensive healthcare platform for Singapore that helps citizens:
- **Find Clinics**: Locate nearby healthcare facilities using geolocation
- **Discover Services**: Browse available healthcare services and their costs
- **Find Doctors**: Search for doctors by specialty, language, and experience
- **Access Healthier SG**: Get information about Singapore's national health program
- **Submit Enquiries**: Contact clinics and get support through multiple channels

### Why This Project Matters
- **National Health Initiative**: Supporting Singapore's Healthier SG program
- **Healthcare Accessibility**: Making healthcare information easily accessible to all citizens
- **Government Integration**: Direct integration with Ministry of Health (MOH) systems
- **Multi-language Support**: Serving Singapore's diverse, multilingual population
- **Privacy & Security**: Maintaining the highest standards for healthcare data protection

## Development Environment Setup

### Prerequisites
Before you start, ensure you have the following installed:

```bash
# Required Software
- Node.js 20+ (we recommend using nvm for version management)
- Git (latest version)
- PostgreSQL (for local development)
- Docker & Docker Compose (for local database)
- VS Code (recommended editor with extensions below)
- Supabase CLI (for database management)

# Version Management
nvm install 20
nvm use 20
```

### Essential VS Code Extensions
Install these extensions for the best development experience:

1. **TypeScript and JavaScript Language Features**
2. **Tailwind CSS IntelliSense**
3. **Prisma** (Database ORM support)
4. **ES7+ React/Redux/React-Native snippets**
5. **Prettier - Code formatter**
6. **ESLint** (already configured in project)
7. **GitLens** (enhanced Git integration)
8. **Thunder Client** (API testing)

### Repository Setup

1. **Clone the Repository**
```bash
git clone <repository-url>
cd my-family-clinic
```

2. **Install Dependencies**
```bash
npm install
```

3. **Environment Configuration**
```bash
# Copy environment template
cp .env.local.example .env.local

# Edit with your actual values
nano .env.local
```

Required environment variables:
```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/myfamilyclinic"
DIRECT_URL="postgresql://user:password@localhost:5432/myfamilyclinic"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="your_supabase_url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"

# Authentication
NEXTAUTH_SECRET="your_generated_secret"
NEXTAUTH_URL="http://localhost:3000"

# External APIs
GOOGLE_MAPS_API_KEY="your_google_maps_key"

# Email Service (optional)
SMTP_HOST="your_smtp_host"
SMTP_PORT="587"
SMTP_USER="your_email"
SMTP_PASS="your_password"
```

4. **Database Setup**
```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database with sample data
npm run db:seed

# Open Prisma Studio (optional, for database inspection)
npm run db:studio
```

5. **Start Development Server**
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application running!

## Project Structure & Architecture

### Directory Structure
```
my-family-clinic/
├── src/
│   ├── app/                    # Next.js 15 App Router pages
│   │   ├── (auth)/            # Authentication pages
│   │   ├── clinics/           # Clinic discovery pages
│   │   ├── doctors/           # Doctor directory pages
│   │   ├── healthier-sg/      # Healthier SG program pages
│   │   └── api/               # API routes
│   ├── components/             # Reusable React components
│   │   ├── ui/               # shadcn/ui base components
│   │   ├── forms/            # Form components
│   │   ├── clinic/           # Clinic-related components
│   │   ├── doctor/           # Doctor-related components
│   │   └── healthier-sg/     # Healthier SG components
│   ├── lib/                   # Utility libraries
│   │   ├── auth.ts           # Authentication configuration
│   │   ├── supabase.ts       # Supabase client
│   │   └── db.ts             # Database connection
│   ├── server/                # Server-side code
│   │   ├── auth.ts           # NextAuth configuration
│   │   └── api/              # tRPC API routers
│   ├── hooks/                 # Custom React hooks
│   ├── types/                 # TypeScript type definitions
│   └── utils/                 # Utility functions
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Database migrations
│   └── seeds/                 # Seed data
├── public/                     # Static assets
└── docs/                      # Documentation
```

### Technology Stack Understanding

#### Frontend Technologies
- **Next.js 15**: React framework with App Router for server-side rendering
- **TypeScript**: Type-safe JavaScript for better development experience
- **Tailwind CSS**: Utility-first CSS framework for styling
- **shadcn/ui**: Accessible component library built on Radix UI
- **React Query**: Server state management and caching

#### Backend Technologies
- **Supabase**: Backend-as-a-Service with PostgreSQL and real-time features
- **Prisma**: Type-safe database ORM with migration management
- **tRPC**: End-to-end type-safe API layer
- **NextAuth 5**: Authentication system with multiple providers

#### Database & Storage
- **PostgreSQL**: Primary database with PostGIS extension for geospatial data
- **Supabase Storage**: File storage for images, documents, and other assets
- **Real-time**: Supabase real-time subscriptions for live updates

### Key Architectural Patterns

#### 1. Server Components vs Client Components
- **Server Components**: Used for static content, SEO-critical pages, initial data fetching
- **Client Components**: Used for interactive features, forms, maps, search interfaces

```typescript
// Server Component (app/page.tsx)
export default async function HomePage() {
  // Server-side data fetching
  const featuredClinics = await getFeaturedClinics();
  
  return (
    <div>
      <h1>Find Healthcare Clinics</h1>
      <ClinicGrid clinics={featuredClinics} />
    </div>
  );
}

// Client Component (components/ClinicMap.tsx)
"use client";
import { useState } from "react";

export function ClinicMap() {
  const [location, setLocation] = useState(null);
  
  return (
    <div>
      {/* Interactive map logic */}
    </div>
  );
}
```

#### 2. tRPC for Type-Safe APIs
```typescript
// server/api/routers/clinic.ts
export const clinicRouter = createTRPCRouter({
  searchNearby: publicProcedure
    .input(z.object({
      latitude: z.number(),
      longitude: z.number(),
      radius: z.number().default(5000),
    }))
    .query(async ({ input }) => {
      return await db.clinic.findMany({
        where: {
          // PostGIS geospatial query
        },
      });
    }),
});

// Frontend usage with full type safety
const { data: clinics } = api.clinic.searchNearby.useQuery({
  latitude: userLocation.lat,
  longitude: userLocation.lng,
});
```

#### 3. Database Design Patterns
```prisma
// Many-to-many relationships
model Clinic {
  id        String   @id @default(cuid())
  name      String
  services  ServiceClinic[] // Junction table relationship
  
  @@index([location], type: Gist) // PostGIS geospatial index
}

// Junction table for complex relationships
model ServiceClinic {
  id              String  @id @default(cuid())
  clinicId        String
  serviceId       String
  available       Boolean @default(true)
  waitingTime     Int?    // Optional field
  
  clinic          Clinic  @relation(fields: [clinicId], references: [id])
  service         Service @relation(fields: [serviceId], references: [id])
  
  @@unique([clinicId, serviceId])
  @@index([serviceId, available])
}
```

## Core Features to Understand

### 1. Clinic Discovery System
The clinic discovery system is the heart of our platform:

**Key Components**:
- `ClinicSearch`: Main search interface with filters
- `ClinicMap`: Interactive map showing clinic locations
- `ClinicCard`: Display component for clinic information
- `ClinicFilters`: Advanced filtering sidebar

**Important Files**:
- `src/app/clinics/page.tsx` - Main clinic search page
- `src/components/clinic/ClinicSearch.tsx` - Search interface
- `src/components/clinic/ClinicMap.tsx` - Map component
- `server/api/routers/clinic.ts` - Clinic search API

**Geospatial Queries**:
```typescript
// Using PostGIS for location-based searches
const clinics = await db.$queryRaw`
  SELECT c.*, ST_Distance(c.location, ST_Point(${lat}, ${lng})) as distance
  FROM clinics c
  WHERE ST_DWithin(c.location, ST_Point(${lat}, ${lng}), ${radius})
  AND c.status = 'ACTIVE'
  ORDER BY distance
  LIMIT 20;
`;
```

### 2. Doctor Directory
Doctor search and profile management:

**Key Features**:
- Specialty-based search
- Language filtering
- Experience and qualification display
- Clinic affiliation mapping

**Important Files**:
- `src/app/doctors/page.tsx` - Doctor search page
- `src/components/doctor/DoctorCard.tsx` - Doctor display component
- `server/api/routers/doctor.ts` - Doctor search API

### 3. Healthier SG Program
Singapore's national health program integration:

**Key Features**:
- Program information and eligibility checking
- Benefits tracking and calculation
- Incentive earning and redemption
- Health screening coordination

**Important Files**:
- `src/app/healthier-sg/page.tsx` - Main program page
- `src/components/healthier-sg/` - Program-specific components
- `server/api/routers/healthier-sg.ts` - Program API

### 4. Contact & Enquiry System
Multi-channel contact and support system:

**Key Features**:
- Contact form submission
- Enquiry routing and prioritization
- Multi-language support
- Automated response workflows

**Important Files**:
- `src/app/contact/page.tsx` - Contact page
- `src/components/forms/` - Contact form components
- `server/api/routers/contact.ts` - Contact API

## Development Workflow

### Daily Development Process

1. **Start Your Day**
```bash
# Pull latest changes
git pull origin main

# Check current branch
git branch

# Create feature branch for new work
git checkout -b feature/your-feature-name

# Install any new dependencies
npm install

# Start development server
npm run dev
```

2. **Development Guidelines**
- Follow conventional commit messages
- Write tests for new features
- Update documentation as needed
- Ensure accessibility compliance (WCAG 2.2 AA)
- Run linting and type checking before commits

3. **Code Quality Checks**
```bash
# Run all quality checks
npm run lint
npm run type-check
npm run test
npm run test:a11y
```

4. **Commit Changes**
```bash
git add .
git commit -m "feat(clinic): add distance sorting to search results"

git push origin feature/your-feature-name
# Create pull request for review
```

### Git Workflow

We use a feature branch workflow:

```bash
# Create feature branch
git checkout -b feature/feature-name

# Make changes and commit
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/feature-name

# After review, merge to main
# Delete feature branch
git branch -d feature/feature-name
```

### Commit Message Convention
```
feat: new feature
fix: bug fix
docs: documentation changes
style: formatting changes
refactor: code refactoring
test: adding tests
chore: maintenance tasks
```

Example:
```
feat(clinic): add advanced filtering by amenities
fix(search): resolve geolocation permission handling
docs(api): update clinic search API documentation
```

## Key Development Procedures

### Adding a New Feature

1. **Plan the Feature**
   - Create feature branch
   - Design database schema changes (if needed)
   - Plan component structure
   - Consider accessibility requirements

2. **Database Changes**
```bash
# Create migration for schema changes
npx prisma migrate dev --name descriptive-migration-name

# Update types
npx prisma generate

# Test migration
npm run db:reset && npm run db:migrate && npm run db:seed
```

3. **API Development**
```typescript
// server/api/routers/feature-router.ts
export const featureRouter = createTRPCRouter({
  getData: publicProcedure
    .input(z.object({ /* schema */ }))
    .query(async ({ input }) => {
      // Implementation
    }),
    
  createData: protectedProcedure
    .input(z.object({ /* schema */ }))
    .mutation(async ({ input, ctx }) => {
      // Implementation with auth check
    }),
});
```

4. **Frontend Components**
```typescript
// components/FeatureComponent.tsx
"use client";

import { api } from "@/lib/api";

export function FeatureComponent() {
  const { data, isLoading, error } = api.feature.getData.useQuery();
  
  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;
  
  return <div>{/* Component JSX */}</div>;
}
```

### Database Operations

#### Working with Prisma
```bash
# View database in browser
npm run db:studio

# Reset database (development only)
npm run db:reset

# Create new migration
npx prisma migrate dev --name migration-name

# Deploy migrations to production
npx prisma migrate deploy

# Generate Prisma client after schema changes
npx prisma generate
```

#### Common Database Patterns
```typescript
// Find with relationships
const clinic = await db.clinic.findUnique({
  where: { id: clinicId },
  include: {
    services: {
      include: {
        service: true,
      },
    },
    doctors: {
      include: {
        doctor: true,
      },
    },
  },
});

// Complex query with filters
const clinics = await db.clinic.findMany({
  where: {
    status: "ACTIVE",
    services: {
      some: {
        service: {
          name: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        available: true,
      },
    },
  },
  include: {
    services: {
      include: {
        service: true,
      },
    },
  },
  orderBy: {
    name: "asc",
  },
});
```

### Testing Procedures

#### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test clinic-search.test.tsx

# Run accessibility tests
npm run test:a11y

# Run performance tests
npm run test:lighthouse
```

#### Writing Tests
```typescript
// __tests__/components/ClinicCard.test.tsx
import { render, screen } from "@testing-library/react";
import { ClinicCard } from "@/components/clinic/ClinicCard";

describe("ClinicCard", () => {
  const mockClinic = {
    id: "1",
    name: "Test Clinic",
    address: "123 Test Street",
    phone: "+65 1234 5678",
  };

  it("renders clinic name correctly", () => {
    render(<ClinicCard clinic={mockClinic} />);
    expect(screen.getByText("Test Clinic")).toBeInTheDocument();
  });

  it("displays contact information", () => {
    render(<ClinicCard clinic={mockClinic} />);
    expect(screen.getByText("123 Test Street")).toBeInTheDocument();
    expect(screen.getByText("+65 1234 5678")).toBeInTheDocument();
  });
});
```

### Accessibility Guidelines

Our platform must meet WCAG 2.2 AA standards:

#### Semantic HTML
```typescript
// Good: Use semantic HTML
<main role="main" aria-label="Clinic search results">
  <section aria-labelledby="search-heading">
    <h1 id="search-heading">Find Healthcare Clinics</h1>
    <form role="search" aria-label="Clinic search form">
      <label htmlFor="search-input">Search for clinics</label>
      <input id="search-input" type="search" />
    </form>
  </section>
</main>

// Bad: Generic divs without semantic meaning
<div>
  <div>Find Healthcare Clinics</div>
  <div>
    <input type="search" />
  </div>
</div>
```

#### ARIA Labels and Roles
```typescript
// Interactive elements need proper ARIA labels
<button
  aria-label="View clinic details for {{clinicName}}"
  aria-describedby="clinic-description-{{clinicId}}"
>
  View Details
</button>

// Live regions for dynamic content updates
<div aria-live="polite" aria-atomic="true">
  {searchResultsCount} clinics found
</div>
```

#### Keyboard Navigation
```typescript
// Ensure all interactive elements are keyboard accessible
<button
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  }}
>
  Submit Enquiry
</button>
```

### Performance Optimization

#### Code Splitting
```typescript
// Dynamic imports for large components
const ClinicMap = dynamic(() => import("../ClinicMap"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

// Lazy loading for images
import Image from "next/image";

<Image
  src={clinic.imageUrl}
  alt={clinic.name}
  width={300}
  height={200}
  loading="lazy"
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

#### Database Optimization
```typescript
// Use specific field selection
const clinics = await db.clinic.findMany({
  select: {
    id: true,
    name: true,
    address: true,
    location: true,
    // Only select needed fields
  },
  where: { status: "ACTIVE" },
});

// Use indexes for query optimization
// Check query performance with EXPLAIN
const result = await db.$queryRaw`
  EXPLAIN ANALYZE
  SELECT * FROM clinics 
  WHERE status = 'ACTIVE' 
  AND ST_DWithin(location, ST_Point(${lat}, ${lng}), 5000);
`;
```

## Debugging & Troubleshooting

### Common Development Issues

#### Environment Variables Not Loading
```bash
# Check if .env.local exists and has correct values
cat .env.local

# Restart development server after changing env vars
npm run dev
```

#### Database Connection Issues
```bash
# Check if local database is running
pg_isready -h localhost -p 5432

# Check Prisma connection
npx prisma db push --preview-feature

# View Prisma Studio to inspect database
npm run db:studio
```

#### TypeScript Errors
```bash
# Regenerate Prisma types
npx prisma generate

# Clear TypeScript cache
rm -rf node_modules/.cache
rm -rf .next

# Restart development server
npm run dev
```

#### Build Errors
```bash
# Clear Next.js build cache
rm -rf .next

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Run type check
npm run type-check
```

### Debugging Tools

#### Browser Developer Tools
- **React DevTools**: Component inspection and state debugging
- **Network Tab**: API request debugging
- **Console**: JavaScript error logging
- **Performance Tab**: Performance profiling

#### Database Debugging
```typescript
// Enable query logging
// In development environment
const db = new PrismaClient({
  log: ["query", "error", "warn"],
});

// Log slow queries
const db = new PrismaClient({
  log: [
    { emit: "event", level: "query" },
    { emit: "stdout", level: "error" },
    { emit: "stdout", level: "warn" },
  ],
});

db.$on("query", (e) => {
  if (e.duration > 100) {
    console.log("Slow query detected:", e.query, e.duration);
  }
});
```

#### API Debugging
```typescript
// tRPC client-side debugging
import { httpBatchLink, loggerLink } from "@trpc/client";

const api = createTRPCReact<AppRouter>();

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  return (
    <api.Provider
      client={createTRPCClient({
        links: [
          loggerLink({
            enabled: (opts) =>
              process.env.NODE_ENV === "development" ||
              (opts.direction === "down" && opts.result instanceof Error),
          }),
          httpBatchLink({
            url: "/api/trpc",
          }),
        ],
      })}
      queryClient={queryClient}
    >
      {children}
    </api.Provider>
  );
}
```

## Communication & Support

### Team Communication
- **Daily Standups**: 15-minute daily sync at 9:30 AM SGT
- **Sprint Planning**: Bi-weekly planning sessions
- **Code Reviews**: All code must be reviewed before merging
- **Documentation Updates**: Keep documentation current with code changes

### Getting Help
1. **Check Documentation**: Start with README files and docs folder
2. **Search Previous Issues**: Look for similar problems in team notes
3. **Ask in Team Chat**: Don't hesitate to ask questions
4. **Pair Programming**: Schedule pair sessions for complex features
5. **Code Review Feedback**: Use PR reviews to discuss approaches

### Important Contacts
- **Project Lead**: [Name] - [Email] - Overall project coordination
- **Frontend Lead**: [Name] - [Email] - UI/UX and frontend architecture
- **Backend Lead**: [Name] - [Email] - API and database architecture
- **DevOps Lead**: [Name] - [Email] - Infrastructure and deployment

### Resources & Documentation
- **Project README**: `/my-family-clinic/README.md`
- **Architecture Decisions**: `/docs/architectural-decisions.md`
- **Database Schema**: `/prisma/schema.prisma`
- **API Documentation**: `/docs/api-documentation.md`
- **Component Library**: `/docs/component-library.md`

## Your First Week Goals

### Day 1-2: Environment Setup
- [ ] Complete development environment setup
- [ ] Successfully run the application locally
- [ ] Explore the codebase structure
- [ ] Review this onboarding guide completely
- [ ] Join team communication channels

### Day 3-4: Codebase Familiarization
- [ ] Read through key architectural documents
- [ ] Explore major components and pages
- [ ] Understand the database schema
- [ ] Review existing tests
- [ ] Attend team standup and introduce yourself

### Day 5: First Contribution
- [ ] Choose a small, well-defined task
- [ ] Create your first feature branch
- [ ] Make a small improvement or bug fix
- [ ] Submit your first pull request
- [ ] Participate in code review

### Week 1 Success Criteria
- [ ] Development environment fully functional
- [ ] Basic understanding of project architecture
- [ ] Successfully contributed one small change
- [ ] Comfortable with team communication
- [ ] Ready to take on larger features in week 2

## Next Steps After Onboarding

### Week 2-4: Building Confidence
- Take ownership of a small feature area
- Contribute to database schema discussions
- Participate in architecture decisions
- Start mentoring newer team members
- Begin planning for advanced features

### Month 2-3: Deep Expertise
- Become the go-to expert for your area
- Lead feature development from design to deployment
- Contribute to architectural improvements
- Mentor new team members
- Present technical decisions to stakeholders

### Long-term Growth
- Technical leadership in specific domains
- Cross-functional collaboration skills
- Healthcare domain expertise
- Open source contributions
- Speaking at conferences or meetups

---

## Welcome to the Team! 🚀

You're now part of an exciting project that's making a real difference in Singapore's healthcare ecosystem. Don't hesitate to ask questions, share ideas, and contribute your unique perspective. We're here to support your growth and success.

**Key Reminders**:
- Ask questions early and often
- Focus on accessibility and user experience
- Follow established patterns and conventions
- Write tests for your code
- Keep documentation updated
- Celebrate small wins and learn from challenges

**Ready to get started?** Open your terminal, clone the repo, and let's build something amazing together! 🏥✨

---

**Document Version**: 1.0  
**Last Updated**: 2025-11-05  
**Review Cycle**: Monthly  
**Document Owner**: Development Team Lead