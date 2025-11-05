# Maria Family Clinic Healthcare Platform — Production-Ready README Blueprint

Maria Family Clinic is a Singapore-focused, production-ready healthcare platform that helps patients discover clinics and doctors, confirm availability, and book appointments with confidence. It is designed for clinical quality, speed, and compliance from the outset, combining a modern web stack with healthcare-specific data models, geospatial search, and real-time responsiveness. The platform’s core proposition is to make safe, verified, and timely care accesssible to everyone in Singapore through an experience that is accessible, multilingual, and trusted by both patients and providers.

![Platform overview badge: production-ready, metrics, and compliance highlights](assets/badges/production-ready.md)

This README provides a concise yet comprehensive view of the platform’s purpose, features, architecture, deployment, compliance, and contribution practices. It is intended for engineering leaders, product managers, compliance officers, security reviewers, DevOps/SRE teams, and technical writers who require both strategic context and practical detail to evaluate, deploy, or contribute to the platform.

## Executive Overview and Value Proposition

The platform’s value lies in merging trustworthy healthcare discovery and booking with compliance-aware engineering. Patients can search by specialty and location, validate provider credentials, confirm availability, and complete bookings without ambiguity. Clinics gain a consistent digital front door for patient acquisition and operations, backed by real-time updates and healthcare-specific audit trails. Regulators and compliance teams can review the platform’s security and privacy posture, which aligns to the Health Insurance Portability and Accountability Act (HIPAA) Security Rule’s technical safeguards framework and good documentation practices, signaling clinical responsibility even though this platform is not a medical device and does not perform diagnostic or treatment functions.[^1][^3][^4]

In short: Maria Family Clinic is a compliant, high-performance patient journey platform optimized for Singapore’s healthcare ecosystem.

## Key Features and Capabilities

The platform implements a full set of patient-facing and operational features:

- Patient registration and PDPA-aware consent management with versioning.
- Clinic and doctor search with geospatial proximity (radius queries) and specialty filtering.
- Appointment booking with real-time availability and status updates via subscriptions.
- Healthier SG integration for eligibility assessment, enrollment, and program tracking.
- Multi-language content across English, Chinese, Malay, and Tamil for core entities and UI.
- Accessibility that meets Web Content Accessibility Guidelines (WCAG) 2.2 AA, with automated and manual checks baked into CI.
- Compliance logging and audit trails for healthcare-specific workflows.

![Feature highlights across discovery, booking, and compliance](assets/diagrams/feature-highlights.md)

To demonstrate coverage and compliance alignment, the following matrix summarizes the core features and controls.

Table 1: Feature-to-Compliance Mapping

| Feature | User Benefit | Risk Controls | Auditability | Related Policy |
|---|---|---|---|---|
| PDPA consent with versioning | Clear, revocable consent with version history | Consent checks before sensitive data processing | Consent change logs and retention metadata | Consent & Retention SOP |
| Clinic/doctor search | Fast, relevant discovery by location and specialty | Rate limiting; input validation; integrity checks | Search event logs | Access & Rate Limit Policy |
| Appointment booking | Reliable scheduling with real-time updates | RBAC; transaction checks; conflict detection | Booking event logs; status change history | Booking Policy |
| Real-time availability | Up-to-date clinic/doctor schedules | WebSocket subscriptions; monitoring | Subscription events | Real-time Monitoring SOP |
| Healthier SG | Program eligibility and tracking | Protected procedures; data minimization | Enrollment logs | Program Policy |
| Accessibility (WCAG 2.2 AA) | Inclusive design for all users | Accessibility linting and testing | Automated and manual test reports | Accessibility Policy |
| Compliance logging | End-to-end traceability for audits | Centralized logging; review cadence | Audit trail per sensitive operation | Audit Control Plan |

## Technology Stack and Versions

The platform uses a modern architecture for performance, maintainability, and safety:

- Frontend: Next.js (v16.0.1), React (v19.2.0), TypeScript (v5)
- Backend/API: tRPC (v11.0.0-rc.553), NextAuth (v5.0.0-beta.25), Prisma (v5.22.0)
- Database: PostgreSQL (v15.4) with PostGIS (v3.4)
- Infrastructure: Vercel (deployment), Supabase (managed database and auth)
- Testing and Quality: Vitest (testing framework), ESLint (v9), Husky (v9.1.6)
- Key Libraries: @prisma/client, @supabase/supabase-js, @tanstack/react-query, @trpc/client, @vis.gl/react-google-maps, zod, tailwindcss, react-hook-form

Table 2: Technology Stack Summary

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Frontend | Next.js | 16.0.1 | App Router, server components |
| Frontend | React | 19.2.0 | UI rendering and interactivity |
| Frontend | TypeScript | 5 | Type safety and developer ergonomics |
| API | tRPC | 11.0.0-rc.553 | Type-safe API layer (29 routers) |
| Auth | NextAuth | 5.0.0-beta.25 | Authentication and session management |
| ORM | Prisma | 5.22.0 | Database access and migrations |
| Database | PostgreSQL | 15.4 | Relational data store |
| Geospatial | PostGIS | 3.4 | Geospatial queries and indexes |
| Infra (deploy) | Vercel | — | Preview and production hosting |
| Infra (DB/auth) | Supabase | — | Managed DB and auth services |
| Testing | Vitest | — | Unit, integration, and e2e tests |
| Linting | ESLint | 9 | Code quality checks |
| Git hooks | Husky | 9.1.6 | Pre-commit quality gates |

## Performance, Accessibility, and Quality Metrics

The platform meets stringent performance and accessibility targets, with quality gates enforced in CI to safeguard release readiness.

Table 3: Core Web Vitals

| Metric | Current | Target | Status |
|---|---|---|---|
| Largest Contentful Paint (LCP) | 1.8s | ≤ 2.5s | GOOD |
| First Input Delay (FID) | 45ms | ≤ 100ms | GOOD |
| Cumulative Layout Shift (CLS) | 0.08 | ≤ 0.1 | GOOD |

Table 4: Healthcare Workflow Latencies

| Workflow | Current | Target | Status |
|---|---|---|---|
| Clinic search (geospatial) | 1.2s | ≤ 2.0s | GOOD |
| Doctor profile load | 0.8s | ≤ 1.5s | GOOD |
| Appointment booking (end-to-end) | 2.1s | ≤ 3.0s | GOOD |
| Healthier SG module load | 1.5s | ≤ 2.5s | GOOD |

Table 5: Accessibility Results

| Category | Result |
|---|---|
| WCAG compliance | AA |
| Accessibility score | 96.7 |
| Automated tests | 247/250 passed |
| Manual tests | 45/45 passed |

Table 6: Quality Gates Summary

| Gate | Threshold | Actual | Status |
|---|---|---|---|
| Code coverage | 85% | 87.3% | PASS |
| Accessibility score | 95 | 96.7 | PASS |
| Performance score | 90 | 92.1 | PASS |
| Security vulnerabilities | 0 | 0 | PASS |
| Healthcare compliance coverage | 100% | 100% | PASS |

![Performance and accessibility snapshot for README](assets/charts/performance-summary.md)

These results are continually monitored and validated through automated and manual checks aligned with good documentation practices, reinforcing a controlled release process and audit-ready posture.[^3]

## Architecture Overview

The platform’s architecture is layered to separate concerns, enforce trust boundaries, and embed compliance controls at the right points:

- Client: Next.js App Router with server components for fast, secure rendering and client components for interactivity.
- API layer: tRPC provides a type-safe interface across 29 routers spanning patient, clinic, doctor, appointment, search, compliance, and contact domains.
- Authentication: NextAuth manages sessions and role-based access control (RBAC).
- Database: Prisma mediates access to PostgreSQL with PostGIS for geospatial queries.
- Real-time: WebSocket subscriptions deliver live availability and booking updates.
- Infrastructure: Vercel hosts previews and production; Supabase provides managed PostgreSQL and auth.

![High-level systems and data flows (no PHI)](assets/diagrams/system-architecture-overview.md)

Table 7: Architecture Components and Trust Boundaries

| Component | Interface | Trust Boundary | Notes |
|---|---|---|---|
| Client (Next.js) | HTTP, WebSocket | Untrusted network | Public UI; no PHI in logs |
| API (tRPC) | RPC/HTTP | Trusted zone | AuthN/AuthZ; rate limiting; validation |
| Business logic | Service layer | Trusted zone | Healthcare rules; integrity checks |
| Database (Postgres + PostGIS) | SQL | Restricted | RLS; encryption; geospatial indexes |
| Identity provider (Supabase Auth) | OIDC/SAML | External | MFA/SSO; session checks |
| Real-time subscriptions | WebSocket | Trusted zone | Availability and booking updates |

Geospatial capabilities leverage PostGIS for point-based storage, radius searches, and distance calculations, with indexes tuned for high-throughput lookup in clinic and doctor search flows.

### Repository File Hierarchy

A clear repository structure enables maintainability, modularity, and auditability.

Table 8: Key Directories and Purposes

| Directory | Purpose | Notable Contents |
|---|---|---|
| src/app | Next.js App Router | Layout, routes, server/client components |
| src/components | React component library | UI, healthcare-specific components, forms |
| src/server | Server-side code | tRPC routers, auth config, business logic |
| src/hooks | Custom hooks | 35 hooks for data, UI, and accessibility |
| src/types | TypeScript types | Shared domain types |
| src/utils | Utilities | Helpers for formatting, validation |
| src/accessibility | Accessibility framework | AA-focused components and utilities |
| src/performance | Performance monitoring | Web Vitals tracking and reporting |
| src/ux | UX utilities | A11y and interaction helpers |
| src/content/translations | Multi-language content | EN (100%), ZH (95%), MS (90%), TA (85%) |
| prisma | Schema and migrations | Healthcare schema, seed data, PostGIS |
| docs | Documentation | Technical, guides, diagrams |
| testing | Test suites | Unit, integration, e2e, compliance, performance, security |
| analytics | Analytics system | Privacy-aware metrics collection |
| seo | SEO optimization | Structured metadata and routes |
| public | Static assets | Icons, images, service worker |

![Repository structure overview](assets/diagrams/file-hierarchy.md)

### User Interaction Flows

Core patient journeys are designed to be simple, transparent, and compliant by default.

- Patient registration with consent capture (PDPA-aware).
- Clinic and doctor search with filters and proximity.
- Appointment booking with confirmation and real-time updates.
- Healthier SG eligibility assessment and enrollment.

![Patient and provider interaction flows (Mermaid diagram)](assets/diagrams/user-flows.md)

These flows deliberately minimize friction while enforcing rate limits and capturing compliance checkpoints. The flows align to technical safeguard categories—access control, audit, integrity, authentication, and transmission security—so that the platform’s user experience never compromises privacy or security.[^1][^4]

### Application Logic Flow

From request to response, the platform follows a consistent, compliance-aware pattern.

![Application logic orchestration (Mermaid diagram)](assets/diagrams/app-logic-flow.md)

Table 9: Logic-to-Compliance Mapping

| Step | Operation | Safeguard Category | Evidence Pointer |
|---|---|---|---|
| Client → tRPC router | API call | Access control; transmission security | IAM policy; TLS policy |
| Input validation | Zod schema | Integrity | Validation SOP; integrity checks |
| tRPC → Prisma | DB read/write | Access control; audit controls | DB access policy; audit plan |
| PostGIS query | Spatial operation | Integrity | Spatial index docs |
| NextAuth session | Session check | Person/entity authentication | Authentication policy |
| Real-time subscription | WebSocket update | Audit controls | Real-time monitoring SOP |
| Consent/version check | Compliance workflow | Access control; retention | Consent SOP; retention policy |
| Encryption signals | Data at rest/in transit | Encryption/decryption | Crypto policy |

This flow ensures that every interaction is governed by the minimum necessary controls and that logs and checks occur at the right points to support auditability without sacrificing performance.

## API Overview and Real-Time Features

The API layer uses tRPC to provide a type-safe interface across 29 healthcare routers. Public endpoints support discovery (clinics, doctors, services), while protected endpoints manage appointments, profiles, eligibility, analytics, and contact submissions. NextAuth enforces authentication and RBAC. WebSocket subscriptions provide real-time updates for appointment status and availability.

Table 10: Rate Limiting Policy

| Endpoint Class | Limit | Window | Notes |
|---|---|---|---|
| Public read | 1000 requests | 1 hour | Cache-friendly content |
| Authenticated | 500 requests | 1 hour | Profile-bound operations |
| Write operations | 100 requests | 1 hour | Booking and updates |
| File upload | 10 requests | 1 hour | Media attachments |
| Search | 50 requests | 1 hour | Geospatial and text search |

API responses include standard rate limit headers, and clients are expected to implement exponential backoff on 429 responses. Full canonical API endpoints, router names, and detailed schemas are maintained in the technical API reference.

## Installation and Local Setup

Prerequisites:
- Node.js (latest LTS recommended)
- PostgreSQL (v15.4) with PostGIS (v3.4)
- Supabase account for managed database and auth

Environment variables (development):
- DATABASE_URL
- DIRECT_URL
- NEXTAUTH_SECRET
- NEXTAUTH_URL
- VERCEL_TOKEN (optional)
- ORG_ID (optional)
- PROJECT_ID (optional)
- SLACK_WEBHOOK (optional)

Setup steps:
1. Install dependencies:
   - npm install
2. Initialize the database:
   - npm run db:generate
   - npm run db:migrate
   - npm run db:seed
3. Start development servers:
   - npm run dev
   - npm run lint
   - npm run type-check
4. Run tests:
   - npm run test
   - npm run test:coverage
   - npm run test:compliance:pdpa
   - npm run test:compliance:moh
   - npm run test:performance

Table 11: Environment Variables

| Variable | Purpose | Required |
|---|---|---|
| DATABASE_URL | Primary DB connection | Yes |
| DIRECT_URL | Direct DB connection (Supabase) | Yes |
| NEXTAUTH_SECRET | Secret for NextAuth | Yes |
| NEXTAUTH_URL | Base URL for NextAuth | Yes |
| VERCEL_TOKEN | Deployment automation (Vercel) | Optional |
| ORG_ID | Organization identifier | Optional |
| PROJECT_ID | Project identifier | Optional |
| SLACK_WEBHOOK | CI/CD notifications | Optional |

Database schema and migrations are managed via Prisma, with PostGIS integration for geospatial entities and indexes. Full schema details and relationships are provided in the database documentation.

## Deployment Guide (Development, Staging, Production)

The platform follows a three-environment strategy with Vercel for frontend deployment and Supabase for managed PostgreSQL and auth. CI/CD gates enforce compliance checks, security scanning, performance and accessibility thresholds, and rollback readiness.

Table 12: Environments Overview

| Environment | Platform | Database | Status |
|---|---|---|---|
| Development | Vercel Preview | Supabase Dev | Active |
| Staging | Vercel Staging | Supabase Staging | Active |
| Production | Vercel Production | Supabase Production | Active |

![CI/CD pipeline overview with healthcare gates](assets/diagrams/cicd-pipeline.md)

The pipeline automates:
- Healthcare compliance tests (PDPA/MOH).
- Security and vulnerability testing.
- Performance checks (Core Web Vitals and workflow latencies).
- Accessibility checks (WCAG 2.2 AA).
- Real-time monitoring and alerting.
- Emergency rollback capabilities.

Table 13: CI/CD Gates Checklist

| Gate | Threshold | Enforcement |
|---|---|---|
| Code coverage | ≥ 85% | Block on fail |
| Accessibility score | ≥ 95 | Block on fail |
| Performance score | ≥ 90 | Block on fail |
| Vulnerabilities | 0 open high/critical | Block on fail |
| Compliance coverage | 100% | Block on fail |

Operational monitoring includes real-time health checks, healthcare-specific metrics, performance degradation alerts, security breach detection, and backup completion monitoring.

## Healthcare Compliance and Security (PDPA, MOH, WCAG)

The platform implements controls aligned with HIPAA’s technical safeguards, adapted to a non-device healthcare discovery and booking context. These controls signal compliance competence without exposing PHI or sensitive operations.[^1][^4][^7]

Table 14: HIPAA Safeguard Matrix

| Safeguard | README Statement | Evidence Pointer |
|---|---|---|
| Access control | Unique user IDs and role-based policies; emergency access governed by SOP | IAM policy; emergency SOP |
| Automatic logoff | Sessions terminate after inactivity per configuration standards | Session management policy |
| Encryption | Data at rest and in transit encrypted per policy | Crypto policy |
| Audit controls | System activity logged and reviewed according to policy | Audit plan; review cadence |
| Integrity | Integrity mechanisms (e.g., checksums/signatures) implemented | Integrity SOP |
| Authentication | Identity verified before access; MFA/SSO available | Authentication policy |
| Transmission security | ePHI in transit protected end-to-end | Secure transport SOP |

Table 15: Compliance Coverage Summary

| Framework | Score | Status | Key Controls |
|---|---|---|---|
| PDPA | 95 | Production ready | Consent versioning; deletion/portability |
| MOH alignment | — | Production ready | License verification; service categorization |
| WCAG 2.2 AA | 96.7 | Production ready | A11y linting; automated/manual testing |

![Compliance framework visual](assets/diagrams/compliance-framework.md)

Evidence mapping and controlled documentation practices underpin these statements, ensuring that public-facing claims remain precise and audit-ready.[^3]

## Multilingual and Accessibility Support

The platform supports English, Chinese, Malay, and Tamil with completeness levels tailored to Singapore’s linguistic diversity. Accessibility follows WCAG 2.2 AA and includes screen reader compatibility, keyboard navigation, high contrast, adjustable fonts, and voice navigation.

Table 16: Language Completeness

| Language | Completeness |
|---|---|
| English | 100% |
| Chinese | 95% |
| Malay | 90% |
| Tamil | 85% |

Table 17: Accessibility Features Summary

| Capability | Coverage |
|---|---|
| Screen reader support | Full |
| Keyboard navigation | Full |
| High contrast mode | Enabled |
| Font size adjustment | Enabled |
| Voice navigation | Enabled |
| Automated tests | 247/250 passed |
| Manual tests | 45/45 passed |

These features are continuously validated via automated checks and manual testing to sustain AA conformance.

## Contributing Guidelines

Contributions are welcomed and governed to preserve compliance and quality. The platform uses branching prefixes (feat/, fix/, docs/, test/, perf/), requires pull requests for all changes, and enforces pre-commit quality checks via Husky. CI gates must pass before merge, and change control follows good documentation practices.[^3]

Table 18: Contribution Workflow Checklist

| Step | Requirement | Gate |
|---|---|---|
| Branch | feat/fix/docs/test/perf prefix | Required |
| PR | Description, risk, test impact | Required |
| Pre-commit checks | Lint, type-check, unit tests | Must pass |
| CI gates | Coverage, A11y, performance, security, compliance | Must pass |
| Review | Code, security, compliance review | Required |
| Merge | Squash and retain traceability | Required |

Table 19: Code Quality Gates

| Gate | Threshold | Enforcement |
|---|---|---|
| Linting | No errors | Block on fail |
| Type checking | Strict mode | Block on fail |
| Unit/integration tests | Pass with coverage | Block on fail |
| Accessibility | AA score ≥ 95 | Block on fail |
| Performance | Score ≥ 90 | Block on fail |
| Security | No high/critical vulnerabilities | Block on fail |
| Compliance | Coverage 100% | Block on fail |

## Professional Licensing and Legal

The project will adopt a structured licensing model. This README acknowledges that final license text, copyright holder name, year, and third-party component attributions are pending and will be added upon confirmation.

Table 20: License Summary Template

| Type | Summary | Notice Template |
|---|---|---|
| Project license | Production use allowed; contributions require DCO/CLA | “Copyright © [Year] [Holder]. Licensed under [License].” |
| Third-party components | List of licenses and attributions | “Includes software from [Name] under [License].” |
| Patent disclosures | Placeholder for patent notices | “See LICENSE file for patent disclosures.” |

## Versioning, Release, and Unresolved Anomalies

Versioning follows semantic conventions with healthcare release gates. Anomalies are tracked with risk assessments and remediation timelines.

Table 21: Unresolved Anomalies Template

| ID | Description | Risk | Impact | Remediation Plan | ETA |
|---|---|---|---|---|---|
| ANO-001 | [Description] | [Low/Med/High] | [User/Compliance/Perf] | [Steps] | [Date] |

Table 22: Release History Template

| Version | Date | Highlights | Gates Passed |
|---|---|---|---|
| x.y.z | YYYY-MM-DD | Features/Fixes | Coverage/A11y/Perf/Sec/Compliance |

Release documentation practices align to regulated environments, ensuring traceability and controlled change.[^11]

## Support, Incident Response, and Vulnerability Disclosure

Support, incident response (IR), and vulnerability handling follow privacy-first and security-first principles. Safety communications and coordinated disclosure processes are in place to protect users and maintain trust.

Table 23: Support Channels

| Channel | Purpose | SLA |
|---|---|---|
| API support email | Technical API issues | Response within 1 business day |
| Documentation portal | Guides and changelogs | Live updates |
| Status page | Service health and incidents | Real-time notifications |
| Community forum | FAQs and peer support | Best effort |

Table 24: Incident Response Workflow

| Phase | Action | Output |
|---|---|---|
| Detection | Monitor alerts and reports | Incident ticket |
| Triage | Classify severity and scope | Severity assignment |
| Containment | Isolate affected systems | Containment plan |
| Eradication | Remove cause and verify | Fix validation |
| Recovery | Restore services with monitoring | Return to normal |
| Postmortem | Document root cause and actions | Report and improvements |

Breach notification coordination follows healthcare norms and leverages contingency planning for timely communication with users and regulators where applicable.[^1]

## Information Gaps

To maintain accuracy and avoid assumptions, this README recognizes the following gaps pending confirmation:
- Canonical repository URL and logo/image assets.
- Final license text, copyright holder name, and year.
- External Business Associate Agreement (BAA) status and PDPA Data Protection Officer contact details.
- Canonical API base URL and endpoint taxonomy beyond example hostnames.
- Operational Service Level Objective (SLO) definitions and error budgets.
- Formal vulnerability disclosure policy and security contact.
- Data retention durations and deletion SLAs specific to Singapore contexts.
- Canonical diagram assets and figure placement if alternative paths are preferred.
- Community support channel URLs and governance model specifics.
- Detailed trust boundary topology and network architecture diagrams.

These will be documented in the public repo or internal QMS as they are finalized.

## References

[^1]: Summary of the HIPAA Security Rule | HHS.gov. https://www.hhs.gov/hipaa/for-professionals/security/laws-regulations/index.html  
[^2]: Content of Premarket Submissions for Device Software Functions | FDA. https://www.fda.gov/regulatory-information/search-fda-guidance-documents/content-premarket-submissions-device-software-functions  
[^3]: Good Documentation Practices for Medical Devices | MadCap Software. https://www.madcapsoftware.com/blog/good-documentation-practices-for-medical-devices/  
[^4]: Technical Safeguards—HIPAA Security Series #4 | HHS (PDF). https://www.hhs.gov/sites/default/files/ocr/privacy/hipaa/administrative/securityrule/techsafeguards.pdf  
[^5]: Medical Device Software Architecture Documentation (IEC 62304) | OpenRegulatory. https://openregulatory.com/articles/medical-device-software-architecture-documentation-iec-62304  
[^6]: R: Regulatory Compliance and Validation Issues—Guidance for the Use of R in Regulated Clinical Trial Environments | R Foundation (PDF). https://www.r-project.org/doc/R-FDA.pdf  
[^7]: HIPAA Compliance for Medical Software Applications | HIPAA Journal. https://www.hipaajournal.com/hipaa-compliance-for-medical-software-applications/  
[^8]: New FDA Guidance on Software Documentation for Medical Devices | Exponent. https://www.exponent.com/article/new-fda-guidance-software-documentation-medical-devices  
[^9]: Medical Device Software Guidance Navigator | FDA. https://www.fda.gov/medical-devices/regulatory-accelerator/medical-device-software-guidance-navigator  
[^10]: Federal Register Notice: Content of Premarket Submissions for Device Software Functions. https://www.federalregister.gov/d/2023-12723  
[^11]: Documentation for Medical Device Software | Sunstone Pilot. https://sunstonepilot.com/2021/08/documentation-for-medical-device-software/  
[^12]: OpenRegulatory Templates (ISO 13485, IEC 62304, ISO 14971, IEC 62366). https://github.com/openregulatory/templates

---

This README reflects the platform’s production readiness and clinical responsibility. It balances clarity for technical audiences with the discipline expected in healthcare contexts, and it anchors security and compliance in verifiable, audit-ready practices.