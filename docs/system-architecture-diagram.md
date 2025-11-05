# System Architecture Diagram: My Family Clinic Website

## Architecture Overview Diagram

```mermaid
graph TB
    subgraph "User Layer"
        U1[Mobile Users]
        U2[Desktop Users]
        U3[Admin Users]
    end

    subgraph "CDN & Edge Layer"
        CDN[Vercel Edge Network]
        EDGE[Edge Functions]
    end

    subgraph "Frontend Application Layer"
        subgraph "Next.js 15 App Router"
            APP[App Directory]
            SC[Server Components]
            CC[Client Components]
            SA[Server Actions]
            MW[Middleware]
        end
        
        subgraph "UI Components"
            SHAD[shadcn/ui Components]
            TAIL[Tailwind CSS]
            ICONS[Lucide Icons]
        end
        
        subgraph "State Management"
            RQ[React Query]
            ZUSTAND[Zustand Store]
            FORM[React Hook Form]
        end
    end

    subgraph "API Layer"
        subgraph "tRPC Router"
            TRPC[tRPC Server]
            ROUTER[API Routers]
            MW_API[API Middleware]
        end
        
        subgraph "Authentication"
            AUTH[NextAuth 5]
            JWT[JWT Tokens]
            SESSION[Session Management]
        end
    end

    subgraph "Business Logic Layer"
        subgraph "Services"
            CLINIC_SVC[Clinic Service]
            DOCTOR_SVC[Doctor Service]
            SERVICE_SVC[Service Management]
            ENQUIRY_SVC[Enquiry Service]
            ANALYTICS_SVC[Analytics Service]
        end
        
        subgraph "Validation"
            ZOD[Zod Schemas]
            VALID[Input Validation]
        end
    end

    subgraph "Data Access Layer"
        subgraph "Prisma ORM"
            PRISMA[Prisma Client]
            SCHEMA[Database Schema]
            MIGRATE[Migrations]
        end
        
        subgraph "Database Operations"
            CRUD[CRUD Operations]
            GEO[Geospatial Queries]
            SEARCH[Full-Text Search]
        end
    end

    subgraph "Database Layer"
        subgraph "Supabase PostgreSQL"
            DB[(PostgreSQL + PostGIS)]
            RLS[Row Level Security]
            BACKUP[Automated Backups]
        end
        
        subgraph "Storage"
            STORAGE[(Supabase Storage)]
            FILES[File Management]
        end
    end

    subgraph "External Services"
        MAPS[Google Maps API]
        EMAIL[Email Service]
        SMS[SMS Service]
        ANALYTICS[Google Analytics]
    end

    subgraph "Monitoring & Logging"
        MONITOR[Performance Monitoring]
        LOGS[Application Logs]
        ERRORS[Error Tracking]
        AUDIT[Audit Logs]
    end

    %% User connections
    U1 --> CDN
    U2 --> CDN
    U3 --> CDN

    %% CDN connections
    CDN --> APP
    EDGE --> APP

    %% Frontend connections
    APP --> SC
    APP --> CC
    APP --> SA
    MW --> AUTH

    %% UI connections
    SC --> SHAD
    CC --> SHAD
    SHAD --> TAIL

    %% State management
    CC --> RQ
    CC --> ZUSTAND
    CC --> FORM

    %% API connections
    RQ --> TRPC
    SA --> TRPC
    TRPC --> ROUTER
    MW_API --> AUTH

    %% Business logic
    ROUTER --> CLINIC_SVC
    ROUTER --> DOCTOR_SVC
    ROUTER --> SERVICE_SVC
    ROUTER --> ENQUIRY_SVC
    ROUTER --> ANALYTICS_SVC

    %% Validation
    ROUTER --> ZOD
    ZOD --> VALID

    %% Data access
    CLINIC_SVC --> PRISMA
    DOCTOR_SVC --> PRISMA
    SERVICE_SVC --> PRISMA
    ENQUIRY_SVC --> PRISMA
    ANALYTICS_SVC --> PRISMA

    %% Database operations
    PRISMA --> CRUD
    PRISMA --> GEO
    PRISMA --> SEARCH

    %% Database connections
    CRUD --> DB
    GEO --> DB
    SEARCH --> DB
    PRISMA --> STORAGE

    %% External service connections
    CLINIC_SVC --> MAPS
    ENQUIRY_SVC --> EMAIL
    ENQUIRY_SVC --> SMS
    APP --> ANALYTICS

    %% Monitoring connections
    APP --> MONITOR
    TRPC --> LOGS
    APP --> ERRORS
    ENQUIRY_SVC --> AUDIT

    %% Styling
    classDef userLayer fill:#e1f5fe
    classDef frontendLayer fill:#f3e5f5
    classDef apiLayer fill:#e8f5e8
    classDef businessLayer fill:#fff3e0
    classDef dataLayer fill:#fce4ec
    classDef externalLayer fill:#f1f8e9
    classDef monitoringLayer fill:#fff8e1

    class U1,U2,U3 userLayer
    class APP,SC,CC,SA,MW,SHAD,TAIL,ICONS,RQ,ZUSTAND,FORM frontendLayer
    class TRPC,ROUTER,MW_API,AUTH,JWT,SESSION apiLayer
    class CLINIC_SVC,DOCTOR_SVC,SERVICE_SVC,ENQUIRY_SVC,ANALYTICS_SVC,ZOD,VALID businessLayer
    class PRISMA,SCHEMA,MIGRATE,CRUD,GEO,SEARCH,DB,RLS,BACKUP,STORAGE,FILES dataLayer
    class MAPS,EMAIL,SMS,ANALYTICS externalLayer
    class MONITOR,LOGS,ERRORS,AUDIT monitoringLayer
```

## Data Flow Architecture

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant tRPC
    participant Auth
    participant Service
    participant Prisma
    participant Database
    participant External

    User->>Frontend: Search for nearby clinics
    Frontend->>Auth: Validate session (optional)
    Auth-->>Frontend: Session status
    
    Frontend->>tRPC: searchNearby({ lat, lng, radius })
    tRPC->>Service: ClinicService.searchNearby()
    
    Service->>Prisma: findMany with PostGIS query
    Prisma->>Database: ST_DWithin geospatial query
    Database-->>Prisma: Matching clinics
    Prisma-->>Service: Typed clinic data
    
    Service->>External: Enhance with map data
    External-->>Service: Additional location info
    
    Service-->>tRPC: Enriched clinic list
    tRPC-->>Frontend: Type-safe response
    Frontend-->>User: Rendered clinic cards
    
    Note over Database: Audit log created
    Note over Frontend: Analytics event tracked
```

## Component Architecture

```mermaid
graph TD
    subgraph "Page Level"
        HP[HomePage]
        CP[ClinicsPage]
        SP[ServicesPage]
        DP[DoctorsPage]
        EP[EnquiryPage]
    end

    subgraph "Layout Components"
        RL[RootLayout]
        NAV[Navigation]
        FOOTER[Footer]
        SIDEBAR[Sidebar]
    end

    subgraph "Feature Components"
        CS[ClinicSearch]
        CM[ClinicMap]
        CF[ClinicFilter]
        CC[ClinicCard]
        
        SS[ServiceSearch]
        SC[ServiceCard]
        SD[ServiceDetail]
        
        DS[DoctorSearch]
        DC[DoctorCard]
        DD[DoctorDetail]
        
        EF[EnquiryForm]
        ES[EnquiryStatus]
    end

    subgraph "UI Primitives"
        BUTTON[Button]
        INPUT[Input]
        SELECT[Select]
        MODAL[Modal]
        CARD[Card]
        FORM[Form]
        TABLE[Table]
    end

    subgraph "Hooks & Utils"
        API[API Hooks]
        FORM_HOOK[Form Hooks]
        MAP_HOOK[Map Hooks]
        GEO[Geolocation Utils]
        VALID_UTIL[Validation Utils]
    end

    %% Page connections
    HP --> RL
    CP --> RL
    SP --> RL
    DP --> RL
    EP --> RL

    %% Layout connections
    RL --> NAV
    RL --> FOOTER
    CP --> SIDEBAR

    %% Feature connections
    CP --> CS
    CP --> CM
    CP --> CF
    CP --> CC

    SP --> SS
    SP --> SC
    SP --> SD

    DP --> DS
    DP --> DC
    DP --> DD

    EP --> EF
    EP --> ES

    %% UI primitive connections
    CS --> INPUT
    CS --> BUTTON
    CS --> SELECT

    CF --> SELECT
    CF --> BUTTON

    CC --> CARD
    CC --> BUTTON

    EF --> FORM
    EF --> INPUT
    EF --> BUTTON
    EF --> MODAL

    %% Hook connections
    CS --> API
    CS --> GEO
    
    CM --> MAP_HOOK
    CM --> API

    EF --> FORM_HOOK
    EF --> VALID_UTIL

    SS --> API
    DS --> API

    %% Styling
    classDef pageLevel fill:#e3f2fd
    classDef layoutLevel fill:#f1f8e9
    classDef featureLevel fill:#fff3e0
    classDef primitiveLevel fill:#fce4ec
    classDef hookLevel fill:#f3e5f5

    class HP,CP,SP,DP,EP pageLevel
    class RL,NAV,FOOTER,SIDEBAR layoutLevel
    class CS,CM,CF,CC,SS,SC,SD,DS,DC,DD,EF,ES featureLevel
    class BUTTON,INPUT,SELECT,MODAL,CARD,FORM,TABLE primitiveLevel
    class API,FORM_HOOK,MAP_HOOK,GEO,VALID_UTIL hookLevel
```

## Database Schema Architecture

```mermaid
erDiagram
    CLINIC {
        uuid id PK
        string name
        geography location
        text address
        string phone
        string email
        string website
        jsonb operating_hours
        text[] amenities
        enum status
        timestamptz created_at
        timestamptz updated_at
    }

    SERVICE {
        uuid id PK
        string name
        text description
        enum category
        text prerequisites
        integer duration_minutes
        decimal base_price
        boolean requires_appointment
        enum status
        timestamptz created_at
        timestamptz updated_at
    }

    DOCTOR {
        uuid id PK
        string first_name
        string last_name
        string title
        enum[] specialties
        string[] languages
        text qualifications
        integer years_experience
        text bio
        string profile_image_url
        enum status
        timestamptz created_at
        timestamptz updated_at
    }

    SERVICE_CLINIC {
        uuid id PK
        uuid service_id FK
        uuid clinic_id FK
        boolean available
        integer waiting_time_minutes
        text additional_info
        decimal price_override
        timestamptz created_at
        timestamptz updated_at
    }

    DOCTOR_CLINIC {
        uuid id PK
        uuid doctor_id FK
        uuid clinic_id FK
        boolean is_primary_clinic
        jsonb schedule
        timestamptz created_at
        timestamptz updated_at
    }

    ENQUIRY {
        uuid id PK
        string name
        string email
        string phone
        enum topic
        text message
        uuid clinic_id FK
        uuid service_id FK
        uuid doctor_id FK
        enum status
        text internal_notes
        timestamptz responded_at
        timestamptz created_at
        timestamptz updated_at
    }

    ANALYTICS {
        uuid id PK
        enum event_type
        string page_path
        string user_agent
        string ip_address
        uuid user_id FK
        jsonb event_data
        timestamptz created_at
    }

    AUDIT_LOG {
        uuid id PK
        enum action
        string table_name
        uuid record_id
        jsonb old_values
        jsonb new_values
        uuid user_id FK
        string ip_address
        timestamptz created_at
    }

    %% Relationships
    CLINIC ||--o{ SERVICE_CLINIC : "offers"
    SERVICE ||--o{ SERVICE_CLINIC : "available_at"
    CLINIC ||--o{ DOCTOR_CLINIC : "employs"
    DOCTOR ||--o{ DOCTOR_CLINIC : "works_at"
    CLINIC ||--o{ ENQUIRY : "receives"
    SERVICE ||--o{ ENQUIRY : "about"
    DOCTOR ||--o{ ENQUIRY : "regarding"
```

## Security Architecture

```mermaid
graph TB
    subgraph "Security Layers"
        subgraph "Network Security"
            HTTPS[HTTPS/TLS 1.3]
            WAF[Web Application Firewall]
            RATE[Rate Limiting]
            DDOS[DDoS Protection]
        end

        subgraph "Authentication & Authorization"
            AUTH[NextAuth 5]
            JWT_TOKEN[JWT Tokens]
            SESSION[Session Management]
            RBAC[Role-Based Access]
            MFA[Multi-Factor Auth]
        end

        subgraph "Data Protection"
            ENCRYPT[Encryption at Rest]
            TRANSIT[Encryption in Transit]
            RLS[Row Level Security]
            AUDIT[Audit Logging]
            BACKUP[Encrypted Backups]
        end

        subgraph "Input Validation"
            ZOD_VALID[Zod Validation]
            SANITIZE[Input Sanitization]
            CSRF[CSRF Protection]
            XSS[XSS Prevention]
            SQL_INJ[SQL Injection Prevention]
        end

        subgraph "Privacy & Compliance"
            GDPR[GDPR Compliance]
            PDPA[PDPA Compliance]
            CONSENT[Consent Management]
            DATA_MIN[Data Minimization]
            RETENTION[Data Retention]
        end
    end

    subgraph "Monitoring & Response"
        THREAT[Threat Detection]
        ALERT[Security Alerts]
        INCIDENT[Incident Response]
        FORENSIC[Digital Forensics]
    end

    %% Security flow
    HTTPS --> AUTH
    AUTH --> RLS
    ZOD_VALID --> ENCRYPT
    AUDIT --> THREAT
    THREAT --> ALERT
    ALERT --> INCIDENT

    %% Styling
    classDef networkSec fill:#ffebee
    classDef authSec fill:#e8f5e8
    classDef dataSec fill:#e3f2fd
    classDef inputSec fill:#fff3e0
    classDef privacySec fill:#f3e5f5
    classDef monitorSec fill:#fff8e1

    class HTTPS,WAF,RATE,DDOS networkSec
    class AUTH,JWT_TOKEN,SESSION,RBAC,MFA authSec
    class ENCRYPT,TRANSIT,RLS,AUDIT,BACKUP dataSec
    class ZOD_VALID,SANITIZE,CSRF,XSS,SQL_INJ inputSec
    class GDPR,PDPA,CONSENT,DATA_MIN,RETENTION privacySec
    class THREAT,ALERT,INCIDENT,FORENSIC monitorSec
```

## Performance Architecture

```mermaid
graph LR
    subgraph "Frontend Performance"
        subgraph "Loading Optimization"
            SSR[Server-Side Rendering]
            SSG[Static Site Generation]
            ISR[Incremental Static Regeneration]
            LAZY[Lazy Loading]
            PREFETCH[Prefetching]
        end

        subgraph "Bundle Optimization"
            SPLIT[Code Splitting]
            TREE[Tree Shaking]
            MINIFY[Minification]
            COMPRESS[Compression]
            CACHE[Browser Caching]
        end

        subgraph "Runtime Performance"
            MEMO[React.memo]
            CALLBACK[useCallback]
            EFFECT[useEffect Optimization]
            VIRTUAL[Virtual Scrolling]
            DEBOUNCE[Debounced Search]
        end
    end

    subgraph "Backend Performance"
        subgraph "Database Optimization"
            INDEX[Optimized Indexes]
            QUERY[Query Optimization]
            POOL[Connection Pooling]
            REPLICA[Read Replicas]
            PARTITION[Table Partitioning]
        end

        subgraph "API Performance"
            CACHE_API[API Response Caching]
            BATCH[Request Batching]
            PAGINATE[Pagination]
            COMPRESS_API[Response Compression]
            CDN[CDN Caching]
        end

        subgraph "Resource Management"
            MEMORY[Memory Management]
            CPU[CPU Optimization]
            SCALE[Auto Scaling]
            MONITOR[Performance Monitoring]
            ALERT_PERF[Performance Alerts]
        end
    end

    %% Performance flow
    SSR --> SPLIT
    LAZY --> MEMO
    INDEX --> CACHE_API
    MONITOR --> ALERT_PERF

    %% Styling
    classDef frontendPerf fill:#e8f5e8
    classDef backendPerf fill:#e3f2fd
    classDef optimization fill:#fff3e0

    class SSR,SSG,ISR,LAZY,PREFETCH,SPLIT,TREE,MINIFY,COMPRESS,CACHE frontendPerf
    class INDEX,QUERY,POOL,REPLICA,PARTITION,CACHE_API,BATCH,PAGINATE,COMPRESS_API,CDN backendPerf
    class MEMO,CALLBACK,EFFECT,VIRTUAL,DEBOUNCE,MEMORY,CPU,SCALE,MONITOR,ALERT_PERF optimization
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Development Environment"
        DEV_CODE[Local Development]
        DEV_DB[Local Database]
        DEV_STORAGE[Local Storage]
    end

    subgraph "CI/CD Pipeline"
        GITHUB[GitHub Repository]
        ACTIONS[GitHub Actions]
        TEST[Automated Testing]
        BUILD[Build Process]
        DEPLOY[Deployment]
    end

    subgraph "Staging Environment"
        STAGE_APP[Staging App]
        STAGE_DB[Staging Database]
        STAGE_STORAGE[Staging Storage]
        STAGE_TEST[Integration Testing]
    end

    subgraph "Production Environment"
        subgraph "Vercel Platform"
            PROD_APP[Production App]
            EDGE_FUNC[Edge Functions]
            ANALYTICS_PROD[Vercel Analytics]
        end

        subgraph "Supabase Platform"
            PROD_DB[Production Database]
            PROD_STORAGE[Production Storage]
            PROD_AUTH[Production Auth]
            REALTIME[Realtime Subscriptions]
        end

        subgraph "Monitoring Stack"
            SENTRY[Error Monitoring]
            UPTIME[Uptime Monitoring]
            PERF_MON[Performance Monitoring]
            LOGS_PROD[Log Management]
        end
    end

    %% Development flow
    DEV_CODE --> GITHUB
    GITHUB --> ACTIONS
    ACTIONS --> TEST
    TEST --> BUILD
    BUILD --> DEPLOY

    %% Staging flow
    DEPLOY --> STAGE_APP
    STAGE_APP --> STAGE_TEST
    STAGE_TEST --> PROD_APP

    %% Production connections
    PROD_APP --> PROD_DB
    PROD_APP --> PROD_STORAGE
    PROD_APP --> PROD_AUTH
    PROD_APP --> SENTRY
    PROD_APP --> UPTIME

    %% Styling
    classDef development fill:#e8f5e8
    classDef cicd fill:#fff3e0
    classDef staging fill:#f3e5f5
    classDef production fill:#e3f2fd
    classDef monitoring fill:#fff8e1

    class DEV_CODE,DEV_DB,DEV_STORAGE development
    class GITHUB,ACTIONS,TEST,BUILD,DEPLOY cicd
    class STAGE_APP,STAGE_DB,STAGE_STORAGE,STAGE_TEST staging
    class PROD_APP,EDGE_FUNC,ANALYTICS_PROD,PROD_DB,PROD_STORAGE,PROD_AUTH,REALTIME production
    class SENTRY,UPTIME,PERF_MON,LOGS_PROD monitoring
```

## Integration Points

```mermaid
graph TD
    subgraph "Internal Systems"
        FRONTEND[Frontend App]
        API[tRPC API]
        DB[Database]
        AUTH_SYS[Auth System]
        STORAGE_SYS[Storage System]
    end

    subgraph "External Integrations"
        MAPS_API[Google Maps API]
        EMAIL_SVC[Email Service]
        SMS_SVC[SMS Service]
        ANALYTICS_EXT[Google Analytics]
        MONITORING_EXT[External Monitoring]
    end

    subgraph "Third-Party Services"
        PAYMENT[Payment Gateway]
        CALENDAR[Calendar Integration]
        TELEHEALTH[Telehealth Platform]
        CRM[CRM System]
    end

    %% Internal connections
    FRONTEND <--> API
    API <--> DB
    API <--> AUTH_SYS
    API <--> STORAGE_SYS

    %% External connections
    FRONTEND --> MAPS_API
    API --> EMAIL_SVC
    API --> SMS_SVC
    FRONTEND --> ANALYTICS_EXT
    FRONTEND --> MONITORING_EXT

    %% Future integrations
    API -.-> PAYMENT
    API -.-> CALENDAR
    API -.-> TELEHEALTH
    API -.-> CRM

    %% Styling
    classDef internal fill:#e8f5e8
    classDef external fill:#e3f2fd
    classDef future fill:#f3e5f5

    class FRONTEND,API,DB,AUTH_SYS,STORAGE_SYS internal
    class MAPS_API,EMAIL_SVC,SMS_SVC,ANALYTICS_EXT,MONITORING_EXT external
    class PAYMENT,CALENDAR,TELEHEALTH,CRM future
```

This comprehensive system architecture diagram provides a visual representation of all major components, their relationships, and data flows within the My Family Clinic website system. It serves as a reference for development teams and stakeholders to understand the overall system design and integration points.