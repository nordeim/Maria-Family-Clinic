# File Hierarchy Diagram

```mermaid
graph TB
    subgraph "Maria Family Clinic Healthcare Platform"
        A[📁 src/] --> B[📁 app/]
        A --> C[📁 components/]
        A --> D[📁 server/]
        A --> E[📁 hooks/]
        A --> F[📁 types/]
        A --> G[📁 utils/]
        A --> H[📁 accessibility/]
        A --> I[📁 performance/]
        A --> J[📁 ux/]
        A --> K[📁 content/]
        
        B --> B1[layout.tsx]
        B --> B2[page.tsx]
        B --> B3[providers.tsx]
        B --> B4[(auth)/]
        B --> B5[api/]
        
        C --> C1[🩺 healthcare/]
        C --> C2[♿ accessibility/]
        C --> C3[🎨 ui/]
        C --> C4[👤 forms/]
        C --> C5[🏢 clinic/]
        C --> C6[👨‍⚕️ doctor/]
        C --> C7[📅 appointment/]
        
        D --> D1[🔌 tRPC API/]
        D --> D2[🔐 auth/]
        D --> D3[🏥 business logic/]
        D --> D4[📡 realtime/]
        
        K --> K1[🌐 translations/]
        K1 --> K2[EN: 100%]
        K1 --> K3[ZH: 95%]
        K1 --> K4[MS: 90%]
        K1 --> K5[TA: 85%]
        
        L[📁 prisma/]
        L --> L1[schema.prisma]
        L --> L2[migrations/]
        L --> L3[seed/]
        
        M[📁 testing/]
        M --> M1[🏥 compliance/]
        M --> M2[⚡ performance/]
        M --> M3[♿ accessibility/]
        M --> M4[🔧 suites/]
        
        N[📁 docs/]
        N --> N1[technical/]
        N --> N2[user-guides/]
        N --> N3[deployment/]
        
        O[📁 database/]
        O --> O1[complete-schema.sql]
        O --> O2[local-dev-init.sql]
        O --> O3[deploy.sh]
        
        P[🔧 Configuration]
        P --> P1[package.json]
        P --> P2[next.config.ts]
        P --> P3[tsconfig.json]
        P --> P4[eslint.config.js]
    end
    
    subgraph "Key Statistics"
        Q[248 Components]
        R[29 API Routers]
        S[35 Custom Hooks]
        T[87.3% Test Coverage]
        U[215K+ Lines of Code]
    end
```

## Component Categories
- **Healthcare**: Patient management, appointments, clinic search
- **Accessibility**: WCAG 2.2 AA compliance components
- **Forms**: Medical forms, consent management, enquiries
- **UI**: Base component library with shadcn/ui
- **API**: 29 healthcare-specific tRPC routers
- **Content**: Multi-language support for Singapore's diverse population

## Database Structure
- **Prisma Schema**: 7,440 lines with 100+ healthcare models
- **PostGIS Integration**: Geospatial queries for clinic locations
- **Multi-language**: JSONB translation fields
- **Compliance**: PDPA consent versioning, audit trails

This hierarchy demonstrates the production-ready architecture of Singapore's most comprehensive healthcare platform.
