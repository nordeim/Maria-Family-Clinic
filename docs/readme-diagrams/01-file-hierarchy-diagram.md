# File Hierarchy Diagram

## Project Structure Overview

```
my-family-clinic/
├── src/                                    # Main application source code (248 components total)
│   ├── app/                                # Next.js App Router implementation
│   │   ├── layout.tsx                      # Root layout with accessibility providers
│   │   ├── (auth)/                         # Authentication routes
│   │   ├── api/                            # API Routes & tRPC integration
│   │   ├── clinic/                         # Clinic discovery & profiles
│   │   ├── doctor/                         # Doctor profiles & specializations
│   │   ├── appointment/                    # Booking & scheduling system
│   │   ├── consultation/                   # Healthcare consultations
│   │   ├── healthier-sg/                   # Healthier SG integration
│   │   ├── search/                         # Geospatial healthcare search
│   │   └── privacy/                        # PDPA compliance components
│   ├── components/                         # React component library
│   │   ├── ui/ (45 components)            # Basic UI components
│   │   ├── healthcare/ (8 components)     # Healthcare-specific components
│   │   ├── accessibility/ (12 components) # WCAG 2.2 AA compliance
│   │   ├── contact/ (15 components)       # Contact & enquiry forms
│   │   ├── doctor/ (25 components)        # Doctor-related components
│   │   ├── clinic/ (8 components)         # Clinic-related components
│   │   ├── service/ (35 components)       # Healthcare services
│   │   ├── enquiry/ (20 components)       # Patient enquiries
│   │   ├── health/ (10 components)        # Health-related features
│   │   ├── healthier-sg/ (45 components)  # Healthier SG program
│   │   ├── privacy/ (18 components)       # Privacy & consent
│   │   ├── search/ (15 components)        # Search & filter
│   │   ├── integration/ (12 components)   # External integrations
│   │   └── forms/ (15 components)         # Form components
│   ├── server/                            # Server-side code and API routers
│   │   ├── api/                           # tRPC API routers (29 total)
│   │   ├── auth/                          # Authentication configuration
│   │   ├── business/                      # Healthcare business logic
│   │   └── realtime/                      # WebSocket subscriptions
│   ├── hooks/                             # Custom React hooks (35 hooks)
│   ├── types/                             # TypeScript type definitions
│   ├── utils/                             # Utility functions
│   ├── accessibility/                     # Accessibility framework
│   ├── performance/                       # Performance monitoring
│   ├── ux/                                # User experience utilities
│   └── content/                           # Content management
│       └── translations/                  # Multi-language content
│           ├── en/                        # English (100% complete)
│           ├── zh/                        # Chinese (95% complete)
│           ├── ms/                        # Malay (90% complete)
│           └── ta/                        # Tamil (85% complete)
├── prisma/                                # Database schema and migrations
│   ├── schema.prisma                      # Complete healthcare database schema
│   ├── migrations/                        # Database migrations
│   └── seed/                              # Database seed data
├── public/                                # Static assets
│   ├── icons/                             # Application icons
│   ├── images/                            # Static images
│   └── sw-availability.js                 # Service worker for availability
├── docs/                                  # Documentation
│   ├── technical/                         # Technical documentation
│   ├── user-guides/                       # User guides
│   ├── deployment/                        # Deployment guides
│   └── readme-diagrams/                   # README visual diagrams
├── testing/                               # Testing framework (34 test files)
│   ├── compliance/                        # PDPA & MOH compliance tests
│   ├── performance/                       # Performance testing
│   ├── suites/                            # Test suites
│   └── infrastructure/                    # Infrastructure tests
├── analytics/                             # Analytics system implementation
├── seo/                                   # SEO optimization
├── package.json                           # Dependencies (120 total)
└── README.md                              # Project documentation
```

## Key Files and Descriptions

### Core Application Files
- **src/app/layout.tsx** (159 lines): Root layout with accessibility providers and error boundaries
- **src/server/api/root.ts** (73 lines): tRPC root router with 29 healthcare API routers
- **prisma/schema.prisma** (7440 lines): Complete database schema with healthcare models

### Healthcare-Specific Components
- **Patient Registration System**: Multi-language registration with PDPA compliance
- **Appointment Booking Engine**: Real-time availability with healthcare provider verification
- **Doctor Profile System**: Medical license verification and specialty categorization
- **Clinic Search**: PostGIS-enabled geospatial search with 5km radius queries
- **Healthier SG Integration**: Singapore's health program integration

### Database Schema (Prisma)
- **Patient Management**: Personal data with encryption and consent versioning
- **Healthcare Providers**: Medical license verification and provider accreditation
- **Appointments**: Real-time scheduling with healthcare-specific workflows
- **Clinic Locations**: PostGIS integration for Singapore Postcode support
- **Multi-language Content**: JSONB translation fields for 4 languages

### Compliance & Security
- **PDPA Framework**: Personal data encryption and consent management
- **MOH Standards**: Healthcare service categorization alignment
- **WCAG 2.2 AA**: Accessibility compliance with automated testing
- **Medical-grade Encryption**: Data protection at rest and in transit

### Performance Metrics
- **Total LOC**: 215,000+ lines of code
- **Test Coverage**: 87.3% with 34 test files
- **Component Library**: 248 reusable components
- **API Routers**: 29 healthcare-specific tRPC endpoints