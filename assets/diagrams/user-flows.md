# User Interaction Flows

## Patient Journey Flow

```mermaid
flowchart TD
    START([🏥 Patient Visits Platform]) --> REGISTER[📝 Patient Registration<br/>PDPA Consent with Versioning]
    
    REGISTER --> SEARCH{🔍 Search for Healthcare}
    SEARCH --> GEO[📍 Geospatial Search<br/>5km Radius with PostGIS]
    SEARCH --> SPECIALTY[🩺 Specialty Filter<br/>Based on Medical Needs]
    
    GEO --> CLINIC_LIST[📋 Clinic List<br/>Distance & Rating]
    SPECIALTY --> DOCTOR_LIST[👨‍⚕️ Doctor Profiles<br/>License Verification]
    
    CLINIC_LIST --> BOOKING{📅 Book Appointment}
    DOCTOR_LIST --> BOOKING
    
    BOOKING --> AVAILABILITY[⏰ Real-time Availability<br/>WebSocket Updates]
    AVAILABILITY --> CONFIRM[✅ Appointment Confirmation<br/>SMS/Email Notifications]
    
    CONFIRM --> CONSUL[👨‍⚕️ Healthcare Consultation]
    CONSUL --> FOLLOWUP[📞 Follow-up Care<br/>Healthier SG Integration]
    
    FOLLOWUP --> END([🏠 Patient Journey Complete])
    
    style START fill:#e1f5fe
    style END fill:#c8e6c9
    style REGISTER fill:#fff3e0
    style CONFIRM fill:#e8f5e8
```

## Healthcare Provider Dashboard Flow

```mermaid
flowchart TD
    PROVIDER([👨‍⚕️ Healthcare Provider Login]) --> DASHBOARD[🏥 Provider Dashboard<br/>NextAuth + RBAC]
    
    DASHBOARD --> PATIENT_MGT[👥 Patient Management]
    DASHBOARD --> SCHEDULE[📅 Schedule Management]
    DASHBOARD --> COMPLIANCE[🔒 Healthcare Compliance]
    
    PATIENT_MGT --> PROFILE[👤 Patient Profiles<br/>Medical History]
    PATIENT_MGT --> CONSENT[📋 Consent Management<br/>PDPA Compliance]
    
    SCHEDULE --> SLOTS[🕐 Time Slot Management]
    SCHEDULE --> BOOKINGS[📅 Appointment Bookings]
    BOOKINGS --> NOTIFICATIONS[📱 Real-time Notifications]
    
    COMPLIANCE --> AUDIT[📊 Audit Trail Logging]
    COMPLIANCE --> REPORTS[📈 Compliance Reports]
    COMPLIANCE --> VALIDATION[✅ License Validation<br/>MOH Standards]
    
    style PROVIDER fill:#f3e5f5
    style DASHBOARD fill:#e3f2fd
    style COMPLIANCE fill:#fff8e1
```

## System Architecture Interaction

```mermaid
flowchart LR
    subgraph "Frontend Layer"
        USER[👤 User Interface<br/>Next.js 15 + React 19]
        FORM[📝 Healthcare Forms<br/>React Hook Form]
        SEARCH[🔍 Search Interface<br/>Geospatial UI]
    end
    
    subgraph "API Layer"
        TRPC[🔌 tRPC 11<br/>Type-Safe APIs]
        AUTH[🔐 NextAuth 5<br/>Session Management]
        REAL[📡 WebSocket<br/>Real-time Updates]
    end
    
    subgraph "Business Logic"
        HEALTHCARE[🏥 Healthcare Logic<br/>Compliance Rules]
        VALIDATION[✅ Input Validation<br/>Zod Schemas]
        GEO[📍 Geospatial Logic<br/>PostGIS Queries]
    end
    
    subgraph "Data Layer"
        POSTGRES[(PostgreSQL 15.4<br/>Healthcare Data)]
        POSTGIS[(PostGIS 3.4<br/>Geospatial)]
        SUPABASE[(Supabase<br/>Auth & Storage)]
    end
    
    USER --> TRPC
    FORM --> TRPC
    SEARCH --> TRPC
    
    TRPC --> AUTH
    TRPC --> HEALTHCARE
    TRPC --> VALIDATION
    TRPC --> GEO
    TRPC --> REAL
    
    HEALTHCARE --> POSTGRES
    VALIDATION --> POSTGRES
    GEO --> POSTGIS
    REAL --> SUPABASE
    
    style USER fill:#e8f5e8
    style TRPC fill:#fff3e0
    style HEALTHCARE fill:#fce4ec
    style POSTGRES fill:#e1f5fe
```

## Healthcare Compliance Flow

```mermaid
flowchart TD
    ACTION[🔄 User Action] --> VALIDATE{✅ Validate Action}
    
    VALIDATE -->|Valid| PDPA[🛡️ PDPA Check<br/>Consent & Data Rights]
    VALIDATE -->|Invalid| REJECT[❌ Reject Action<br/>Error Feedback]
    
    PDPA --> MOH[📋 MOH Standards<br/>Healthcare Regulations]
    MOH --> AUDIT[📊 Audit Logging<br/>Compliance Trail]
    
    AUDIT --> ENCRYPT[🔐 Encrypt Data<br/>Medical-grade Security]
    ENCRYPT --> STORE[💾 Store Data<br/>PostgreSQL + PostGIS]
    
    STORE --> NOTIFY[📱 Real-time Updates<br/>WebSocket Subscriptions]
    NOTIFY --> COMPLETE[✅ Action Complete]
    
    REJECT --> COMPLETE
    
    style PDPA fill:#fff8e1
    style MOH fill:#fce4ec
    style AUDIT fill:#e8f5e8
    style ENCRYPT fill:#f3e5f5
```

## Multi-language Support Flow

```mermaid
flowchart TD
    REQUEST[🌐 User Request] --> DETECT[🔍 Language Detection<br/>Browser + User Preference]
    
    DETECT --> LANG{Language Selection}
    
    LANG -->|English| EN[🇺🇸 English (100%)]
    LANG -->|Chinese| ZH[🇨🇳 Chinese (95%)]
    LANG -->|Malay| MS[🇲🇾 Malay (90%)]
    LANG -->|Tamil| TA[🇮🇳 Tamil (85%)]
    
    EN --> CONTENT[📄 Load Content<br/>Healthcare-specific]
    ZH --> CONTENT
    MS --> CONTENT
    TA --> CONTENT
    
    CONTENT --> DISPLAY[🖥️ Display Interface<br/>WCAG 2.2 AA Compliant]
    
    DISPLAY --> ACCESS[♿ Accessibility<br/>Screen Reader Support]
    ACCESS --> FEEDBACK[📱 User Feedback<br/>Multi-channel]
    
    style EN fill:#ffeb3b
    style ZH fill:#f44336
    style MS fill:#4caf50
    style TA fill:#ff9800
```

These flows demonstrate the comprehensive, compliant, and user-friendly nature of the Maria Family Clinic healthcare platform, designed specifically for Singapore's diverse healthcare ecosystem.
