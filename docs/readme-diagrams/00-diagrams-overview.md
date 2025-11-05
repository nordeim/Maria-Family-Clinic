# README Visual Diagrams Blueprint for my-family-clinic

## Purpose, Audience, and Compliance Context

This blueprint defines a documentation artifact set for a healthcare discovery and service platform built with Next.js, TypeScript, PostgreSQL/PostGIS, tRPC, and Supabase. It focuses on a single outcome: equip technical writers, engineers, and compliance reviewers to produce README diagrams that are professional, audit-ready, and privacy-preserving. The blueprint translates regulatory guardrails into practical diagram standards for three outputs: a detailed file hierarchy diagram, user interaction flow diagrams, and an application logic flow diagram. Throughout, we align narrative and visuals to the Health Insurance Portability and Accountability Act (HIPAA) Security Rule and its technical safeguards, emphasizing access control, audit controls, integrity, authentication, and transmission security without exposing protected health information (PHI).[^1][^4]

The healthcare context imposes special responsibilities. Diagrams and narratives should avoid PHI, use role-based labels (e.g., “Patient,” “Provider,” “Admin”), and signal controls rather than disclose sensitive topology or secrets. Editorial principles must include audit-ready traceability, evidence linkage, and a factual tone. Where quantitative thresholds are context-dependent, we provide guidance on setting targets consistent with the platform’s risk profile and intended use.

To anchor terminology and set expectations for visual communication, we introduce a foundational reference image.

![HIPAA Security Rule overview—context for compliance-safe documentation](.pdf_temp/viewrange_chunk_2_6_10_1762307725/images/xmd7qc.jpg)

This image summarizes technical safeguard domains that inform diagram labeling and narrative framing: access control, audit, integrity, authentication, and transmission security. In our diagrams, this translates to labeled trust boundaries, de-identified data categories, and non-specific indicators for encryption and logging—clear enough to reassure reviewers, restrained enough to avoid disclosing operations that could invite risk.[^1][^4]

## Source Materials and Diagram Mapping

The blueprint draws exclusively from the project’s metadata and best-practice guidance for regulated documentation. It consolidates platform scope and stack details, performance targets, and operational constraints into a cohesive set of diagrams that can be included in the README without violating privacy or security principles.

To clarify how each diagram serves the README’s goals and what it must show or avoid, we provide the following mapping.

Table 1: Diagram-to-Requirement Mapping

| Diagram | Purpose | Key Elements | Compliance Notes | Files/Outputs |
|---|---|---|---|---|
| File Hierarchy | Convey codebase organization and key modules | src/app, components, server, prisma, docs, testing, analytics, public; PostGIS presence | No secrets; general directories only; avoid env vars | docs/readme-diagrams/01-file-hierarchy-diagram.md |
| User Interaction Flows | Show core platform journeys and real-time updates | Patient registration, clinic/doctor search, booking, consultation, Healthier.SG; rate-limiting contexts | No PHI; de-identified examples; role-based swimlanes | docs/readme-diagrams/02-user-interaction-flows.md |
| Application Logic Flow | Explain logic/data/API/DB/compliance orchestration | tRPC routers, Prisma, PostGIS, NextAuth, real-time; rate-limiting; audit and consent checkpoints | Label safeguard points; show encryption and audit hooks | docs/readme-diagrams/03-application-logic-flow.md |

Information gaps to acknowledge:
- Detailed runtime topology and explicit trust boundaries are not specified beyond general stack/infrastructure roles.
- Database model specifics (tables/relationships) and exact API router list (beyond counts) are not available; diagrams should refer to categories rather than named endpoints.
- No canonical API base URL or external endpoint taxonomy is defined; diagrams should avoid concrete URLs.
- Precise rate-limiting policies per operation and the real-time subscription model need confirmation for exact thresholds; diagrams should represent limits generically.

## High-Level System Overview and Data Categories

The platform adopts a modern architecture:
- Frontend: Next.js with App Router and React Server Components; client components for interactivity; accessibility and UX frameworks embedded.
- Backend: tRPC as the type-safe API layer across 29 routers; NextAuth for authentication; Prisma for data access; real-time subscriptions for updates.
- Database: PostgreSQL with PostGIS for geospatial queries (clinics, providers, distances).
- Infrastructure: Vercel for deployment, Supabase for managed database and auth.
- Geospatial: PostGIS supports point-based locations, distance calculations, and proximity queries aligned to Singapore use cases.

Data categories to represent consistently across diagrams:
- Public: non-sensitive content (marketing descriptions, non-identifiable service listings).
- Authenticated user profile data: personal identifiers; must be privacy-protected.
- De-identified analytical data: aggregates or de-identified metrics; appropriate for performance tables.
- Appointment/event data: operational scheduling and availability; avoid PHI in public diagrams.
- Consent/audit metadata: records of consent versioning and audit trails; essential for compliance checkpoints.

These categories allow clear labeling of trust boundaries and encryption indicators without exposing PHI or operational specifics.[^5][^1]

## Diagram 1: Detailed File Hierarchy Diagram (docs/readme-diagrams/01-file-hierarchy-diagram.md)

Objective: present a readable, hierarchical overview of the repository structure and key files, emphasizing components, server-side routing, database tooling, documentation, and testing.

Content scope and constraints:
- Show directories: src/app, src/components, src/server, src/hooks, src/types, src/utils, src/accessibility, src/performance, src/ux, src/content, prisma, docs, testing, analytics, public.
- Key files: root layout, tRPC root router, Prisma schema.
- Avoid environment variables, secrets, or runtime specifics; keep descriptions factual and concise.

Narrative guidance:
- Begin with the purpose of src/app and the component categories; explain that healthcare components are specialized while UI and forms provide reusable foundations.
- Describe server-side routers (tRPC) and how they integrate with authentication (NextAuth) and Prisma for data access.
- Introduce PostGIS as a specialized extension enabling geospatial search and Singapore-specific proximity queries.
- Close with a note on documentation and testing categories, emphasizing coverage (unit, integration, e2e, compliance, performance, security) without enumerating internal test artifacts.

## Diagram 2: User Interaction Flows (Mermaid) (docs/readme-diagrams/02-user-interaction-flows.md)

Objective: show the essential patient and provider journeys with role-based swimlanes, including registration, clinic/doctor search, appointment booking, consultation handoff, and Healthier.SG.

Flows:
- Patient Registration: account creation and consent capture.
- Clinic and Doctor Search: filters and geospatial proximity with PostGIS.
- Appointment Booking: selection, availability checks, confirmation, and real-time updates.
- Consultation Handoff: clinical/admin follow-ups (framed generally to avoid PHI).
- Healthier.SG: program-related workflows and enrollment contexts.

Design guidance:
- Use role-based swimlanes (Patient, Provider, Admin).
- Label API and database interactions at a category level (e.g., “tRPC router,” “Prisma read,” “PostGIS query,” “NextAuth session,” “WebSocket update”) and avoid PHI.
- Indicate rate-limiting and real-time updates generically (e.g., “bounded by per-role quotas; WebSocket used for availability updates”).

To make flow boundaries and safeguards explicit without disclosing PHI, Table 2 summarizes each flow’s interactions and safeguards.

Table 2: Flow Summary

| Flow | Key Interactions | Data Touchpoints | Compliance Notes |
|---|---|---|---|
| Patient Registration | Client → tRPC (registration router) → Prisma write → NextAuth session | Auth profile metadata; consent metadata | Access control and session handling; audit trail on consent versioning |
| Clinic Search | Client → tRPC (search) → PostGIS proximity query → Prisma read | De-identified listings; geospatial indices | Transmission security for results; avoid PHI; real-time not required |
| Doctor Search | Client → tRPC (search) → Prisma read | Provider metadata | Integrity checks on provider records; rate-limited queries |
| Appointment Booking | Client → tRPC (booking) → Prisma write → WebSocket update → NextAuth check | Appointment/event records; availability snapshots | Audit logging for booking events; rate limits on write operations; real-time availability |
| Consultation Handoff | Client → tRPC (admin/clinical routing) → Prisma read/write | Operational status updates | No PHI in diagrams; enforce RBAC; audit hooks for status changes |
| Healthier.SG | Client → tRPC (program router) → Prisma read/write | Enrollment/program metadata | Consent and retention aligned to program policies; integrity checks |

![Technical safeguards context for labeling interaction steps](.pdf_temp/viewrange_chunk_1_1_5_1762307729/images/1unc7w.jpg)

This image provides a context for labeling safeguards in user flows. For example, registration and booking steps should explicitly reference access control, audit logging, and transmission security in narrative captions without exposing authentication mechanisms or logs.[^1][^4]

## Diagram 3: Application Logic Flow (Mermaid) (docs/readme-diagrams/03-application-logic-flow.md)

Objective: explain the end-to-end orchestration from client action through API logic, data operations, and compliance workflows.

Flow:
1. Client action initiates an API call to a tRPC router.
2. The router applies input validation and passes to service logic.
3. Data access occurs via Prisma, with PostGIS used for geospatial operations.
4. Authentication and session checks use NextAuth where applicable.
5. Real-time updates are emitted via WebSocket subscriptions.
6. Compliance hooks include consent checks, audit logging, encryption, and retention.

Safeguard checkpoints:
- Access control enforcement and session checks.
- Audit logging at meaningful events (booking creation, consent updates).
- Encryption signals at rest and in transit.
- Consent/version checks and retention policy references.

Rate-limiting and real-time indicators:
- Represent per-role rate-limiting generically (public read vs authenticated write limits; search-specific bounds).
- Indicate WebSocket subscriptions for availability and status updates.

To anchor compliance-aware labeling, we map logic steps to safeguard categories without disclosing PHI.

Table 3: Logic-to-Compliance Mapping

| Step | Operation Type | Safeguard Category | Evidence Pointer |
|---|---|---|---|
| Client → tRPC router | API call | Access control; transmission security | IAM policy; TLS policy |
| Input validation | Data handling | Integrity | Validation SOP; integrity checks |
| tRPC → Prisma | Database read/write | Access control; audit controls | DB access policy; audit plan |
| PostGIS query | Geospatial operation | Integrity | Spatial index documentation |
| NextAuth session | Authentication | Person/entity authentication | Authentication policy |
| Real-time subscription | WebSocket update | Audit controls | Real-time monitoring SOP |
| Consent/version check | Compliance workflow | Access control; retention | Consent management SOP; retention policy |
| Encryption signals | Data at rest/in transit | Encryption/decryption | Crypto policy |

![Technical safeguards reference for labeling logic flow checkpoints](.pdf_temp/viewrange_chunk_2_6_10_1762307726/images/sj8bfi.jpg)

Use this reference to label checkpoints in the logic diagram: show that data at rest and in transit are protected, audit logs are captured and reviewed, and access is enforced through role-based controls.[^1][^4]

## Performance and Accessibility Metrics to Include in the README

The README should present a concise metrics snapshot to reassure readers that responsiveness and accessibility meet clinical and operational needs. We recommend a simple table for Core Web Vitals and healthcare workflow latencies. These values are exemplary and should be confirmed against project telemetry.

Table 4: Core Web Vitals

| Metric | Current | Target | Status |
|---|---|---|---|
| LCP (Largest Contentful Paint) | 1.8 s | ≤ 2.5 s | Good |
| FID (First Input Delay) | 45 ms | ≤ 100 ms | Good |
| CLS (Cumulative Layout Shift) | 0.08 | ≤ 0.1 | Good |

Table 5: Healthcare Workflow Latencies

| Workflow | Current | Target | Status |
|---|---|---|---|
| Clinic Search | 1.2 s | ≤ 2.0 s | Good |
| Doctor Profile Load | 0.8 s | ≤ 1.5 s | Good |
| Appointment Booking | 2.1 s | ≤ 3.0 s | Good |
| Healthier.SG Load | 1.5 s | ≤ 2.5 s | Good |

Table 6: Accessibility Summary

| Category | Score/Result |
|---|---|
| WCAG Compliance | AA |
| Accessibility Score | 96.7 |
| Automated Tests | 247/250 passed |
| Manual Tests | 45/45 passed |

An explicit note should clarify that targets are contextual and aligned to platform workflows and risk management; where the README cannot detail the underlying evidence, it should reference internal validation artifacts.

## Security, Privacy, and Compliance Presentation

Regulated audiences expect precise, non-promotional language linked to internal evidence. The README must affirm safeguards and compliance posture without disclosing PHI, secrets, or specific configurations.

Recommended language patterns:
- HIPAA applicability: “This software handles electronic PHI where applicable; safeguards are implemented per HIPAA Security Rule technical, administrative, and physical safeguards.”[^1][^4]
- Access control: “Access is restricted to authorized users via unique identifiers and role-based policies; emergency access procedures are governed by SOPs.”
- Audit controls: “System activity is logged and reviewed according to policy; audit trails are retained per regulatory requirements.”[^7]
- Transmission security: “ePHI in transit is protected using standard secure transport controls.”

A concise safeguard matrix helps reviewers scan the posture efficiently.

Table 7: HIPAA Safeguard Matrix

| Safeguard | README Statement | Evidence Pointer |
|---|---|---|
| Access Control | Role-based access with unique user IDs; emergency access governed | IAM policy; emergency SOP |
| Automatic Logoff | Sessions terminate after inactivity per configuration standards | Session management policy |
| Encryption | Data at rest and in transit encrypted per policy | Crypto policy |
| Audit Controls | Logs record and examine system activity | Audit plan; review cadence |
| Integrity | Data integrity mechanisms (e.g., checksums/signatures) implemented | Integrity SOP |
| Authentication | Identity verified prior to access; MFA/SSO may be required | Authentication policy |
| Transmission Security | End-to-end protections guard ePHI during transmission | Secure transport SOP |

![HIPAA technical safeguards—visual anchor for security narratives](.pdf_temp/viewrange_chunk_2_6_10_1762307726/images/0ehlit.jpg)

This image reinforces the five technical safeguard standards and supports the README’s restrained but clear security narrative.[^1][^7]

## Implementation and Maintenance: Diagram Delivery Plan

- Output files:
  - docs/readme-diagrams/01-file-hierarchy-diagram.md
  - docs/readme-diagrams/02-user-interaction-flows.md
  - docs/readme-diagrams/03-application-logic-flow.md
- Source of truth: metadata and best-practice guidance.
- Update cadence: align with releases affecting structure, user flows, or compliance posture; version control and approvals per GDocPs.[^3]
- Review workflow: technical writer and engineering lead create and validate diagrams; compliance officer reviews privacy and security framing; no PHI or secrets included.
- Traceability: link diagrams to internal QMS evidence pointers as appropriate; maintain change logs for diagram revisions.

## Risks, Assumptions, and Open Questions

- Risk: Over-sharing PHI or sensitive network details in diagrams.
- Mitigation: Use role-based labels, de-identified examples, and generic compliance annotations; avoid concrete URLs, secrets, and operational specifics.
- Assumptions: The platform uses Next.js App Router, tRPC with 29 routers, Prisma for data access, PostgreSQL with PostGIS, Supabase for DB/auth, and Vercel for deployment.
- Open questions:
  - Confirm real-time subscription architecture (WebSocket provider, channels, and events).
  - Confirm geospatial data model specifics (entity names, PostGIS geometries) for accurate labeling.
  - Validate exact rate-limiting policies per operation category.
  - Finalize FIGMA/Mermaid assets and canonical paths if alternative visuals are preferred.

## References

[^1]: Summary of the HIPAA Security Rule | HHS.gov. https://www.hhs.gov/hipaa/for-professionals/security/laws-regulations/index.html  
[^2]: Content of Premarket Submissions for Device Software Functions | FDA. https://www.fda.gov/regulatory-information/search-fda-guidance-documents/content-premarket-submissions-device-software-functions  
[^3]: Good Documentation Practices for Medical Devices | MadCap Software. https://www.madcapsoftware.com/blog/good-documentation-practices-for-medical-devices/  
[^4]: Technical Safeguards—HIPAA Security Series #4 | HHS (PDF). https://www.hhs.gov/sites/default/files/ocr/privacy/hipaa/administrative/securityrule/techsafeguards.pdf  
[^5]: Medical Device Software Architecture Documentation (IEC 62304) | OpenRegulatory. https://openregulatory.com/articles/medical-device-software-architecture-documentation-iec-62304  
[^6]: R: Regulatory Compliance and Validation Issues—Guidance for the Use of R in Regulated Clinical Trial Environments | R Foundation (PDF). https://www.r-project.org/doc/R-FDA.pdf  
[^7]: HIPAA Compliance for Medical Software Applications | HIPAA Journal. https://www.hipaajournal.com/hipaa-compliance-for-medical-software-applications/