# Healthier SG Database Schema Documentation

## Overview

This document provides comprehensive documentation for the Healthier SG database schema integrated with the My Family Clinic platform. The Healthier SG program is Singapore's national health initiative designed to prevent and manage chronic diseases through preventive care, regular health screening, and lifestyle interventions.

## Schema Architecture

The Healthier SG database schema consists of 15 new models with comprehensive relationships to existing My Family Clinic models:

### Core Program Models

#### 1. HealthierSGProgram
**Purpose**: Defines the different Healthier SG programs available
- **Relationships**: One-to-many with enrollments, eligibility rules, benefits, clinic participation, outcomes
- **Integration**: Linked to existing Service model via `mohServiceCodes`

#### 2. ProgramEnrollment  
**Purpose**: Tracks individual patient participation in Healthier SG programs
- **Relationships**: Many-to-one with User, HealthierSGProgram, Clinic, Doctor
- **Integration**: Extends User model for program participation tracking

### Eligibility and Assessment Models

#### 3. ProgramEligibilityRule
**Purpose**: Defines dynamic eligibility criteria for programs
- **Relationships**: Many-to-one with HealthierSGProgram, one-to-many with EligibilityEvaluation
- **Features**: Supports complex rule logic, government compliance, performance metrics

#### 4. EligibilityEvaluation
**Purpose**: Tracks eligibility assessment results
- **Relationships**: Many-to-one with ProgramEnrollment and ProgramEligibilityRule
- **Features**: Automated evaluation, appeal process, audit trail

#### 5. HealthProfile
**Purpose**: Comprehensive patient health information
- **Relationships**: One-to-one with User, one-to-many with assessments, goals, activities
- **Integration**: Extends existing UserProfile with program-specific health data

#### 6. HealthAssessment
**Purpose**: Records health assessments and risk evaluations
- **Relationships**: Many-to-one with HealthProfile
- **Features**: Multiple assessment types, risk stratification, program recommendations

### Benefits and Claims Management

#### 7. ProgramBenefit
**Purpose**: Defines available benefits within programs
- **Relationships**: Many-to-one with HealthierSGProgram, one-to-many with EnrolledBenefit
- **Integration**: Linked to Service model for service coverage

#### 8. EnrolledBenefit
**Purpose**: Tracks individual patient benefit enrollment
- **Relationships**: Many-to-one with ProgramEnrollment and ProgramBenefit
- **Features**: Usage tracking, balance management, notification preferences

#### 9. BenefitClaim
**Purpose**: Manages benefit claim submissions and processing
- **Relationships**: Many-to-one with EnrolledBenefit
- **Features**: Complete claim workflow, payment tracking, compliance monitoring

### Activity and Progress Tracking

#### 10. ProgramActivity
**Purpose**: Records patient activities within programs
- **Relationships**: Many-to-one with ProgramEnrollment
- **Features**: Progress tracking, quality metrics, compliance monitoring

#### 11. ProgramMilestone
**Purpose**: Tracks key achievements and progress milestones
- **Relationships**: Many-to-one with ProgramEnrollment
- **Features**: Achievement verification, benefit unlocking, progress scoring

#### 12. HealthGoal
**Purpose**: Manages patient health goals and targets
- **Relationships**: Many-to-one with HealthProfile
- **Features**: SMART goal framework, progress tracking, sustainability planning

#### 13. HealthActivity
**Purpose**: Records detailed health activities and behaviors
- **Relationships**: Many-to-one with HealthProfile
- **Features**: Activity quantification, motivation tracking, environmental factors

### Clinic Participation and Performance

#### 14. ClinicParticipation
**Purpose**: Tracks clinic participation in Healthier SG programs
- **Relationships**: Many-to-one with Clinic and HealthierSGProgram
- **Integration**: Extends existing Clinic model for program participation

#### 15. ClinicPerformanceMetric
**Purpose**: Records clinic performance metrics for programs
- **Relationships**: Many-to-one with ClinicParticipation
- **Features**: Comprehensive performance tracking, benchmarking, trend analysis

### Compliance and Audit Models

#### 16. HealthierSGAuditLog
**Purpose**: Comprehensive audit trail for compliance and security
- **Relationships**: Many-to-one with HealthierSGProgram and ProgramEnrollment
- **Features**: Complete audit trail, risk assessment, government reporting

#### 17. ClinicAudit
**Purpose**: Tracks clinic compliance audits
- **Relationships**: Many-to-one with ClinicParticipation
- **Features**: Structured audit findings, action tracking, certification management

#### 18. EnrollmentDocument
**Purpose**: Manages enrollment and program documents
- **Relationships**: Many-to-one with ProgramEnrollment
- **Features**: Document lifecycle, verification, access control

### Program Outcomes

#### 19. ProgramOutcome
**Purpose**: Tracks program effectiveness and outcomes
- **Relationships**: Many-to-one with HealthierSGProgram
- **Features**: Outcome measurement, statistical analysis, cost-effectiveness

## Integration with Existing My Family Clinic Models

### User Model Integration
- **ProgramEnrollment** extends User for program participation
- **HealthProfile** extends User for health data management
- Existing User roles (PATIENT, ADMIN, PROVIDER, CLINIC_ADMIN) support program operations

### Clinic Model Integration
- **ClinicParticipation** extends Clinic for program participation
- **ClinicPerformanceMetric** tracks program-specific performance
- Existing Clinic services can be linked to Healthier SG programs via `mohServiceCodes`

### Doctor Model Integration
- **ProgramEnrollment** links patients to participating doctors
- **ProgramActivity** tracks doctor-led activities
- Existing Doctor specialties align with program requirements

### Service Model Integration
- **HealthierSGProgram** links to services via `mohServiceCodes`
- **ProgramBenefit** defines which services are covered
- **BenefitClaim** processes claims for covered services

## Key Design Patterns

### 1. Comprehensive Audit Trail
All sensitive operations are tracked in `HealthierSGAuditLog` for:
- Government compliance reporting
- Security monitoring
- Data integrity verification
- GDPR/PDPA compliance

### 2. Dynamic Eligibility Evaluation
`ProgramEligibilityRule` supports:
- Complex rule logic with JSON-based conditions
- Real-time recalculation
- Performance monitoring
- Appeal processes

### 3. Progressive Milestone Tracking
`ProgramMilestone` enables:
- Step-by-step progress tracking
- Benefit unlocking mechanisms
- Achievement verification
- Outcome correlation

### 4. Multi-layered Benefits Management
`ProgramBenefit` → `EnrolledBenefit` → `BenefitClaim` hierarchy supports:
- Program-wide benefit definitions
- Personal benefit activation
- Individual claim processing

### 5. Comprehensive Health Profiling
`HealthProfile` integrates:
- Traditional medical data (vitals, conditions)
- Lifestyle factors (smoking, exercise, diet)
- Risk assessments and screening status
- Program eligibility scoring

## Data Relationships Summary

```
User (1) ←→ (1) HealthProfile
HealthProfile (1) ←→ (*) HealthAssessment
HealthProfile (1) ←→ (*) HealthGoal  
HealthProfile (1) ←→ (*) HealthActivity

User (1) ←→ (*) ProgramEnrollment
ProgramEnrollment (1) ←→ (*) ProgramActivity
ProgramEnrollment (1) ←→ (*) ProgramMilestone
ProgramEnrollment (1) ←→ (*) EnrolledBenefit
ProgramEnrollment (1) ←→ (*) EnrollmentDocument
ProgramEnrollment (1) ←→ (*) HealthierSGAuditLog

HealthierSGProgram (1) ←→ (*) ProgramEnrollment
HealthierSGProgram (1) ←→ (*) ProgramBenefit
HealthierSGProgram (1) ←→ (*) ProgramEligibilityRule
HealthierSGProgram (1) ←→ (*) ClinicParticipation
HealthierSGProgram (1) ←→ (*) ProgramOutcome
HealthierSGProgram (1) ←→ (*) HealthierSGAuditLog

Clinic (1) ←→ (*) ClinicParticipation
ClinicParticipation (1) ←→ (*) ClinicPerformanceMetric
ClinicParticipation (1) ←→ (*) ClinicAudit

Doctor (1) ←→ (*) ProgramEnrollment (as assigned doctor)
Doctor (1) ←→ (*) ProgramActivity (as activity conductor)
```

## Government Compliance Features

### MOH Integration
- Program codes align with MOH system identifiers
- Service codes map to official MOH service categories
- Reporting frequency configurable per government requirements

### Audit and Reporting
- Comprehensive audit trails for all program activities
- Automated government reporting based on `reportingFrequency`
- Compliance monitoring with risk level assessment
- Document verification and lifecycle management

### Data Protection
- PDPA compliance through audit logging
- Granular access control for sensitive data
- Data retention periods configurable
- Consent management for data sharing and research

## Performance Considerations

### Indexing Strategy
- Composite indexes on frequently queried combinations (e.g., `userId, programId`)
- Status-based indexes for filtering active records
- Date-based indexes for temporal queries and reporting

### JSON Field Usage
- Flexible schema for complex eligibility rules
- Extensible benefit definitions
- Configurable assessment responses
- Adaptive goal tracking

### Scalability Design
- Hierarchical data structure for efficient querying
- Separation of concerns between enrollment, benefits, and activities
- Modular design for adding new program types
- Caching-friendly relationship structure

## Usage Examples

### Creating a Program Enrollment
```typescript
const enrollment = await prisma.programEnrollment.create({
  data: {
    userId: "user-123",
    programId: "program-456",
    clinicId: "clinic-789",
    enrollmentMethod: HealthierSGEnrollmentMethod.CLINIC_ASSISTED,
    enrollmentSource: "website",
    enrollmentChannel: "mobile_app",
    consentGiven: true,
    dataSharingConsent: true,
    termsAccepted: true,
    enrollmentData: {
      referredBy: "Dr. Smith",
      preferredLanguage: "en"
    }
  },
  include: {
    user: true,
    program: true,
    clinic: true
  }
});
```

### Processing a Benefit Claim
```typescript
const claim = await prisma.benefitClaim.create({
  data: {
    enrolledBenefitId: "benefit-123",
    claimNumber: "CLM-2024-001",
    serviceDate: new Date(),
    claimAmount: 50.00,
    submissionMethod: HealthierSGClaimSubmissionMethod.ONLINE_PORTAL,
    supportingFiles: ["receipt.pdf", "invoice.pdf"]
  }
});

// Update claim status
await prisma.benefitClaim.update({
  where: { id: claim.id },
  data: {
    status: HealthierSGClaimStatus.APPROVED,
    approvedAmount: 45.00,
    approvedBy: "admin-123",
    approvalDate: new Date()
  }
});
```

### Tracking Health Goals
```typescript
const goal = await prisma.healthGoal.create({
  data: {
    healthProfileId: "profile-123",
    goalType: HealthierSGGoalType.WEIGHT_MANAGEMENT,
    goalName: "Lose 10kg in 6 months",
    targetValue: 70,
    currentValue: 85,
    baselineValue: 85,
    targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
    smartCriteria: {
      specific: "Lose 10kg",
      measurable: "Weight measurements",
      achievable: "Through diet and exercise",
      relevant: "Reduce diabetes risk",
      timeBound: "6 months"
    },
    priority: HealthierSGGoalPriority.HIGH,
    strategies: [
      "Calorie deficit diet",
      "Regular exercise 5x/week",
      "Weekly weight tracking"
    ]
  }
});
```

## Migration and Deployment

The comprehensive schema migration is located at:
```
/workspace/my-family-clinic/prisma/migrations/20241104182629_healthier_sg_comprehensive_schema/migration.sql
```

### Pre-deployment Checklist
1. ✅ All Healthier SG models defined in Prisma schema
2. ✅ Comprehensive enums for all status types
3. ✅ Database migration created with proper indexes
4. ✅ Foreign key relationships established
5. ✅ TypeScript type definitions generated
6. ✅ Documentation completed

### Post-deployment Tasks
1. Generate Prisma client: `npx prisma generate`
2. Run database migration: `npx prisma db push`
3. Validate schema relationships
4. Test API endpoints with new models
5. Set up monitoring for audit logs
6. Configure government reporting schedules

This comprehensive schema provides the foundation for full Healthier SG program integration with the My Family Clinic platform, enabling complete program participation tracking, benefits management, compliance reporting, and patient health outcome monitoring.
