# My Family Clinic Database Documentation

## Overview

The My Family Clinic database is a comprehensive healthcare management system designed for Singapore's healthcare ecosystem. It supports patient management, clinic operations, doctor services, Healthier SG program integration, and contact management systems.

## Database Architecture

### Core Design Principles

- **Healthcare Compliance**: Full PDPA and MOH compliance support
- **Scalability**: Designed to support 10,000+ clinics and millions of patients
- **Multi-language Support**: English, Mandarin, Malay, Tamil
- **Real-time Operations**: Support for real-time appointments and availability
- **Data Security**: Medical-grade encryption and audit trails
- **Geographic Support**: PostGIS integration for Singapore locations

### Technology Stack

- **Database**: PostgreSQL 14+ with PostGIS extension
- **Primary Key**: UUID (universally unique identifiers)
- **JSON Support**: JSONB for complex healthcare data
- **Geospatial**: PostGIS geography types for location data
- **Row Level Security**: Enabled for data protection
- **Audit Trails**: Comprehensive logging for healthcare compliance

## Database Schema

### 1. User Management (Authentication)

#### `users`
Core user accounts with role-based access control.

```sql
- id: UUID (Primary Key)
- email: TEXT (Unique)
- name: TEXT
- role: UserRole (PATIENT, DOCTOR, ADMIN, CLINIC_STAFF, SUPPORT_STAFF)
- createdAt: TIMESTAMP(3)
- updatedAt: TIMESTAMP(3)
```

**Relationships:**
- One-to-One: `user_profiles`, `user_preferences`
- One-to-Many: `accounts`, `sessions`, `enquiries`, `reviews`

#### `accounts` (NextAuth.js)
OAuth account management for social logins and authentication providers.

#### `sessions` (NextAuth.js)
User session management for authentication.

#### `verification_tokens` (NextAuth.js)
Email verification token management.

#### `user_profiles`
Detailed user profile information including medical data.

```sql
- id: UUID (Primary Key)
- userId: UUID (Foreign Key → users.id)
- phone: TEXT
- address: TEXT
- postalCode: TEXT
- dateOfBirth: TIMESTAMP(3)
- gender: Gender (MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY)
- nric: TEXT (Singapore NRIC - encrypted)
- preferredLanguage: TEXT (default: 'en')
- emergencyContact: TEXT
- medicalConditions: TEXT[] (Array of medical conditions)
- allergies: TEXT[] (Array of allergies)
```

**Healthcare Compliance:**
- NRIC encryption for PDPA compliance
- Emergency contact support
- Medical conditions tracking
- Multi-language support

#### `user_preferences`
User application preferences and settings.

```sql
- id: UUID (Primary Key)
- userId: UUID (Foreign Key → users.id)
- emailNotifications: BOOLEAN (default: true)
- smsNotifications: BOOLEAN (default: false)
- theme: TEXT (light/dark mode)
- language: TEXT (UI language preference)
- accessibilitySettings: JSONB (WCAG preferences)
- searchHistory: JSONB (Recent searches)
- favorites: TEXT[] (Favorite clinic IDs)
```

### 2. Clinic Management

#### `clinics`
Healthcare clinic information and location data.

```sql
- id: UUID (Primary Key)
- name: TEXT
- description: TEXT
- address: TEXT
- postalCode: TEXT
- phone: TEXT
- email: TEXT
- website: TEXT
- latitude: DOUBLE PRECISION
- longitude: DOUBLE PRECISION
- location: geography(Point, 4326) (PostGIS point)
- operatingHours: JSONB (Operating hours by day)
- facilities: TEXT[] (Available facilities)
- accreditationStatus: TEXT (MOH accreditation)
- emergencyPhone: TEXT
- afterHoursPhone: TEXT
- establishedYear: INTEGER
- licenseNumber: TEXT
- licenseExpiry: TIMESTAMP(3)
- isActive: BOOLEAN
- isVerified: BOOLEAN
- rating: DOUBLE PRECISION
- reviewCount: INTEGER
```

**Geospatial Features:**
- PostGIS geography point for precise location
- Distance calculation functions
- Location-based search optimization

#### `clinic_services`
Services offered by each clinic with pricing and availability.

```sql
- id: UUID (Primary Key)
- clinicId: UUID (Foreign Key → clinics.id)
- serviceId: UUID (Foreign Key → services.id)
- isAvailable: BOOLEAN
- estimatedDuration: INTEGER (minutes)
- price: DOUBLE PRECISION
- currency: TEXT (default: 'SGD')
- basePrice: DOUBLE PRECISION
- finalPrice: DOUBLE PRECISION
- isHealthierSGCovered: BOOLEAN
- healthierSGPrice: DOUBLE PRECISION
- medisaveCovered: BOOLEAN
- medisaveAmount: DOUBLE PRECISION
- medishieldCovered: BOOLEAN
- medishieldDeductible: DOUBLE PRECISION
- chasCovered: BOOLEAN
- chasTier: ChasTier (BLUE, GREEN, ORANGE, NONE)
- chasSubsidy: DOUBLE PRECISION
- insuranceCovered: BOOLEAN
- discountPercentage: DOUBLE PRECISION
- promotionalPrice: DOUBLE PRECISION
- ageRestrictions: JSONB
- genderRestrictions: TEXT[]
- appointmentRequired: BOOLEAN
- walkInAllowed: BOOLEAN
- serviceDays: JSONB
- serviceHours: JSONB
- qualityRating: DOUBLE PRECISION
- patientCount: INTEGER
- status: ClinicServiceStatus
- notes: TEXT
```

**Healthcare Payment Integration:**
- Medisave coverage
- Medishield integration
- CHAS tier support
- Insurance coverage
- Discount and promotional pricing

#### `clinic_languages`
Languages supported by each clinic.

```sql
- id: UUID (Primary Key)
- clinicId: UUID (Foreign Key → clinics.id)
- language: TEXT
```

#### `operating_hours`
Detailed operating hours for each clinic by day of week.

```sql
- id: UUID (Primary Key)
- clinicId: UUID (Foreign Key → clinics.id)
- dayOfWeek: DayOfWeek (MONDAY-SUNDAY)
- openTime: TEXT (HH:mm format)
- closeTime: TEXT (HH:mm format)
- isOpen: BOOLEAN
- breakStart: TEXT (HH:mm format)
- breakEnd: TEXT (HH:mm format)
- is24Hours: BOOLEAN
```

#### `clinic_reviews`
Patient reviews and ratings for clinics.

```sql
- id: UUID (Primary Key)
- clinicId: UUID (Foreign Key → clinics.id)
- userId: UUID (Foreign Key → users.id)
- rating: INTEGER (1-5 stars)
- comment: TEXT
- isVerified: BOOLEAN (Verified patient review)
```

### 3. Doctor Management

#### `doctors`
Medical professional information and credentials.

```sql
- id: UUID (Primary Key)
- name: TEXT
- email: TEXT (Unique)
- phone: TEXT
- medicalLicense: TEXT (Unique, Singapore MCR number)
- nric: TEXT (Encrypted Singapore NRIC)
- specialties: TEXT[] (Medical specialties)
- languages: TEXT[] (Languages spoken)
- qualifications: TEXT[] (Medical qualifications)
- experienceYears: INTEGER
- bio: TEXT
- medicalSchool: TEXT
- graduationYear: INTEGER
- specializations: TEXT[]
- boardCertifications: TEXT[]
- professionalMemberships: TEXT[]
- achievements: TEXT[]
- awards: TEXT[]
- publications: TEXT[]
- researchInterests: TEXT[]
- careerHighlights: JSONB
- previousPositions: JSONB
- profileImage: TEXT
- consultationFee: DOUBLE PRECISION
- currency: TEXT (default: 'SGD')
- isActive: BOOLEAN
- isVerified: BOOLEAN
- verificationDate: TIMESTAMP(3)
- verificationNotes: TEXT
- rating: DOUBLE PRECISION
- reviewCount: INTEGER
- patientSatisfaction: DOUBLE PRECISION
- appointmentCompletionRate: DOUBLE PRECISION
- totalAppointments: INTEGER
- specializationPopularity: DOUBLE PRECISION
- languagePreference: JSONB
- privacySettings: JSONB
- gdprConsent: BOOLEAN
- pdpaConsent: BOOLEAN
- lastPrivacyReview: TIMESTAMP(3)
- confidentialityLevel: ConfidentialityLevel
- dataRetentionPeriod: INTEGER
- preferredContactMethod: TEXT
- communicationPreferences: JSONB
- emergencyContact: TEXT
- emergencyPhone: TEXT
- cmePoints: INTEGER
- lastCMEUpdate: TIMESTAMP(3)
- professionalDevelopment: JSONB
- emergencyAvailability: BOOLEAN
- onCallSchedule: JSONB
```

**Medical Professional Compliance:**
- Medical license verification
- PDPA consent for sensitive data
- Confidentiality levels
- CME point tracking
- Professional development tracking

#### `doctor_clinics`
Many-to-many relationship between doctors and clinics.

```sql
- id: UUID (Primary Key)
- doctorId: UUID (Foreign Key → doctors.id)
- clinicId: UUID (Foreign Key → clinics.id)
- role: DoctorRole (ATTENDING, CONSULTANT, SPECIALIST, REGISTRAR, HOUSE_OFFICER)
- capacity: DoctorCapacity (FULL_TIME, PART_TIME, VISITING, ON_CALL)
- isPrimary: BOOLEAN (Primary clinic for doctor)
- workingDays: TEXT[]
- startTime: TEXT (HH:mm)
- endTime: TEXT (HH:mm)
- clinicSpecializations: TEXT[]
- primaryServices: TEXT[]
- consultationFee: DOUBLE PRECISION
- consultationDuration: INTEGER
- emergencyConsultationFee: DOUBLE PRECISION
- clinicRating: DOUBLE PRECISION
- clinicReviewCount: INTEGER
- clinicPatientCount: INTEGER
- appointmentTypes: JSONB
- walkInAllowed: BOOLEAN
- advanceBookingDays: INTEGER (default: 7)
- acceptedInsurance: JSONB
- medisaveAccepted: BOOLEAN
- chasAccepted: BOOLEAN
- verificationStatus: VerificationStatus
- verificationDate: TIMESTAMP(3)
- verificationNotes: TEXT
- startDate: TIMESTAMP(3)
- endDate: TIMESTAMP(3)
```

### 4. Service Taxonomy

#### `service_categories`
Hierarchical service categorization aligned with Singapore MOH.

```sql
- id: UUID (Primary Key)
- name: TEXT (Unique)
- displayName: TEXT
- description: TEXT
- parentId: UUID (Self-referencing for hierarchy)
- level: INTEGER (Hierarchy level)
- sortOrder: INTEGER
- mohCodePrefix: TEXT (MOH category code)
- mohCategoryName: TEXT (Official MOH category)
- htCategory: TEXT (Healthcare Transformation category)
- htPriority: HTPriority
- healthierSGCategory: TEXT
- healthierSGLevel: TEXT
- translations: JSONB (Multi-language support)
- isActive: BOOLEAN
- isSubsidized: BOOLEAN
- priorityLevel: INTEGER
- serviceCount: INTEGER (Denormalized count)
- averagePrice: DOUBLE PRECISION
```

**Healthcare Integration:**
- MOH alignment
- Healthier SG categorization
- Hierarchical structure
- Multi-language translations

#### `services`
Individual healthcare services with detailed information.

```sql
- id: UUID (Primary Key)
- name: TEXT (Unique)
- description: TEXT
- categoryId: UUID (Foreign Key → service_categories.id)
- subcategory: TEXT
- specialtyArea: TEXT
- mohCode: TEXT (Singapore MOH service code)
- icd10Codes: TEXT[] (ICD-10 diagnosis codes)
- cptCodes: TEXT[] (CPT procedure codes)
- typicalDurationMin: INTEGER
- complexityLevel: ServiceComplexity
- urgencyLevel: UrgencyLevel
- basePrice: DOUBLE PRECISION
- priceRangeMin: DOUBLE PRECISION
- priceRangeMax: DOUBLE PRECISION
- currency: TEXT (default: 'SGD')
- isSubsidized: BOOLEAN
- isHealthierSGCovered: BOOLEAN
- healthierSGServices: TEXT[]
- medisaveCoverage: JSONB
- medishieldCoverage: JSONB
- insuranceCoverage: JSONB
- medicalDescription: TEXT
- patientFriendlyDesc: TEXT
- processSteps: JSONB
- preparationSteps: JSONB
- postCareInstructions: JSONB
- successRates: JSONB
- riskFactors: JSONB
- ageRequirements: JSONB
- genderRequirements: JSONB
- translations: JSONB
- synonyms: TEXT[]
- searchTerms: TEXT[]
- commonSearchPhrases: TEXT[]
- terminology: JSONB (Medical term explanations)
- commonQuestions: JSONB
- isActive: BOOLEAN
- sortOrder: INTEGER
- tags: TEXT[]
- priorityLevel: INTEGER
- viewCount: INTEGER
- bookingCount: INTEGER
- lastBookedAt: TIMESTAMP(3)
```

### 5. Healthier SG Program Integration

#### `healthier_sg_programs`
Government Healthier SG program definitions.

```sql
- id: UUID (Primary Key)
- name: TEXT
- description: TEXT
- category: HealthierSGCategory
- targetDemographic: TEXT
- eligibilityCriteria: JSONB
- benefits: JSONB
- coverageDetails: JSONB
- reportingRequirements: JSONB
- isActive: BOOLEAN
```

#### `program_enrollments`
User enrollment in Healthier SG programs.

```sql
- id: UUID (Primary Key)
- userId: UUID (Foreign Key → users.id)
- programId: UUID (Foreign Key → healthier_sg_programs.id)
- enrollmentMethod: HealthierSGEnrollmentMethod
- status: HealthierSGEnrollmentStatus
- enrollmentDate: TIMESTAMP(3)
- completionDate: TIMESTAMP(3)
- programData: JSONB
```

### 6. Contact & Enquiry Management

#### `contact_categories`
Contact form categories with routing rules.

```sql
- id: UUID (Primary Key)
- name: TEXT (Unique)
- displayName: TEXT
- description: TEXT
- requiresAuth: BOOLEAN
- requiresVerification: BOOLEAN
- priority: ContactCategoryPriority
- department: ContactDepartment
- formFields: JSONB
- validationRules: JSONB
- autoResponse: BOOLEAN
- responseTemplate: TEXT
- defaultAssignee: TEXT
- routingRules: JSONB
- escalationRules: JSONB
- responseSLAHours: INTEGER (default: 24)
- resolutionSLADays: INTEGER (default: 7)
- isActive: BOOLEAN
- sortOrder: INTEGER
- icon: TEXT
- color: TEXT
```

#### `contact_forms`
Contact form submissions with medical information support.

```sql
- id: UUID (Primary Key)
- referenceNumber: TEXT (Unique)
- categoryId: UUID (Foreign Key → contact_categories.id)
- templateId: UUID (Foreign Key → contact_form_templates.id)
- subject: TEXT
- message: TEXT
- formData: JSONB
- contactName: TEXT
- contactEmail: TEXT
- contactPhone: TEXT
- preferredContactMethod: ContactMethod
- userId: UUID (Foreign Key → users.id)
- patientId: TEXT
- clinicId: UUID (Foreign Key → clinics.id)
- doctorId: UUID (Foreign Key → doctors.id)
- serviceId: UUID (Foreign Key → services.id)
- medicalInformation: TEXT
- urgencyLevel: UrgencyLevel
- appointmentUrgency: AppointmentUrgency
- submissionSource: ContactSource
- userAgent: TEXT
- ipAddress: TEXT
- referrerUrl: TEXT
- sessionId: TEXT
- privacyConsent: BOOLEAN
- marketingConsent: BOOLEAN
- dataRetentionConsent: BOOLEAN
- consentVersion: TEXT
- gdprConsent: BOOLEAN
- pdpaConsent: BOOLEAN
- status: ContactStatus
- processingNotes: TEXT
- autoProcessed: BOOLEAN
- spamCheckResult: SpamCheckResult
- duplicateCheck: BOOLEAN
- duplicateOfId: TEXT
- responseRequired: BOOLEAN
- autoResponseSent: BOOLEAN
- responseDue: TIMESTAMP(3)
- responseSent: TIMESTAMP(3)
- firstResponseTime: INTEGER
- priority: ContactPriority
- assignedAgentId: TEXT
- assignedDepartment: ContactDepartment
- createdBy: TEXT
```

#### `enquiries`
Detailed enquiry management with healthcare routing.

```sql
- id: UUID (Primary Key)
- contactFormId: UUID (Foreign Key → contact_forms.id)
- enquiryNumber: TEXT (Unique)
- title: TEXT
- categoryId: UUID (Foreign Key → contact_categories.id)
- enquiryType: EnquiryType
- status: EnquiryStatus
- subStatus: TEXT
- resolutionStatus: ResolutionStatus
- priority: EnquiryPriority
- urgencyLevel: UrgencyLevel
- businessImpact: BusinessImpact
- assignedAgentId: TEXT
- assignedTeam: ContactTeam
- supervisorId: TEXT
- originalAssignee: TEXT
- department: ContactDepartment
- specializedTeam: TEXT
- medicalReview: BOOLEAN
- complianceReview: BOOLEAN
- userId: UUID (Foreign Key → users.id)
- patientId: TEXT
- clinicId: UUID (Foreign Key → clinics.id)
- doctorId: UUID (Foreign Key → doctors.id)
- serviceId: UUID (Foreign Key → services.id)
- appointmentId: TEXT
- description: TEXT
- initialInquiry: TEXT
- customerExpectations: TEXT
- requiredAction: TEXT
- resolutionSummary: TEXT
- resolutionNotes: TEXT
- closureReason: TEXT
- customerSatisfaction: INTEGER
- slaBreached: BOOLEAN
- slaBreachReason: TEXT
- escalationCount: INTEGER
- lastEscalationAt: TIMESTAMP(3)
- requiresFollowUp: BOOLEAN
- followUpRequired: BOOLEAN
- followUpDate: TIMESTAMP(3)
- followUpNotes: TEXT
- followUpCompleted: BOOLEAN
- externalReference: TEXT
- integrationStatus: IntegrationSyncStatus
- syncData: JSONB
- workflowStage: TEXT
- workflowData: JSONB
- sourceChannel: ContactSource
- tags: TEXT[]
- customFields: JSONB
- assignedAt: TIMESTAMP(3)
- resolvedAt: TIMESTAMP(3)
- closedAt: TIMESTAMP(3)
```

### 7. Audit & Logging

#### `audit_logs`
Comprehensive audit trail for healthcare compliance.

```sql
- id: UUID (Primary Key)
- userId: UUID (Foreign Key → users.id)
- action: TEXT
- entityType: TEXT
- entityId: TEXT
- oldValues: JSONB
- newValues: JSONB
- timestamp: TIMESTAMP(3)
- ipAddress: TEXT
- userAgent: TEXT
- dataSensitivity: DataSensitivity
```

## Key Features

### 1. Healthcare Compliance

#### PDPA Compliance
- Personal data encryption
- Consent management
- Data retention policies
- Right to deletion
- Data portability

#### MOH Compliance
- Healthcare provider verification
- Medical license validation
- Service categorization alignment
- Reporting requirements support

### 2. Geospatial Features

#### PostGIS Integration
- Point-based location storage
- Distance calculations
- Location-based searches
- Proximity queries

#### Distance Calculation Function
```sql
CREATE OR REPLACE FUNCTION calculate_distance(
    lat1 double precision, 
    lon1 double precision, 
    lat2 double precision, 
    lon2 double precision
)
RETURNS double precision AS $$
BEGIN
    RETURN ST_Distance(
        ST_GeogFromText('POINT(' || lon1 || ' ' || lat1 || ')'),
        ST_GeogFromText('POINT(' || lon2 || ' ' || lat2 || ')')
    );
END;
$$ LANGUAGE plpgsql;
```

### 3. Multi-Language Support

All major entities support JSONB translation fields:
- Service categories
- Services
- Doctor information
- Clinic information
- User interface preferences

### 4. Healthcare Payment Integration

#### Medisave Integration
- Coverage amounts
- Eligibility checking
- Real-time verification

#### Medishield Integration
- Deductible management
- Coverage limits
- Claim processing

#### CHAS Support
- Tier-based subsidies
- Blue, Green, Orange tiers
- Automatic subsidy calculation

### 5. Healthier SG Program Support

- Program enrollment tracking
- Eligibility assessment
- Benefit management
- Government reporting
- Integration with MyInfo/SingPass

## Database Relationships

### Primary Relationships

```
users (1) → (1) user_profiles
users (1) → (1) user_preferences
users (1) → (*) accounts
users (1) → (*) sessions
users (1) → (*) enquiries
users (1) → (*) program_enrollments

clinics (1) → (*) clinic_services
clinics (1) → (*) clinic_languages
clinics (1) → (*) operating_hours
clinics (1) → (*) clinic_reviews
clinics (1) → (*) doctor_clinics

doctors (1) → (*) doctor_clinics

service_categories (1) → (*) services
service_categories (1) → (*) service_categories (self-reference for hierarchy)

services (1) → (*) clinic_services

healthier_sg_programs (1) → (*) program_enrollments

contact_categories (1) → (*) contact_forms
contact_categories (1) → (*) enquiries

contact_forms (1) → (*) enquiries
```

### Healthcare-Specific Relationships

```
users ↔ clinics (through program enrollments)
doctors ↔ clinics (through doctor_clinics)
services ↔ clinics (through clinic_services)
programs ↔ clinics (through participating clinics)
doctors ↔ services (through service offerings)
```

## Performance Optimization

### Indexes

#### Geographic Indexes
```sql
-- Clinic location search
CREATE INDEX clinics_location_idx ON clinics USING GIST (location);

-- Distance-based queries
CREATE INDEX clinics_latitude_longitude_idx ON clinics (latitude, longitude);
```

#### Healthcare-Specific Indexes
```sql
-- Healthier SG filtering
CREATE INDEX clinic_services_healthier_sg_idx ON clinic_services (isHealthierSGCovered);
CREATE INDEX services_healthier_sg_idx ON services (isHealthierSGCovered);

-- Medical license verification
CREATE INDEX doctors_medical_license_idx ON doctors (medicalLicense);

-- Real-time availability
CREATE INDEX doctor_availabilities_date_idx ON doctor_availabilities (date, isAvailable);
```

#### Search Optimization
```sql
-- Full-text search for services
CREATE INDEX services_search_idx ON services USING GIN (
    to_tsvector('english', name || ' ' || COALESCE(description, ''))
);

-- Multi-language search
CREATE INDEX services_translations_idx ON services USING GIN (translations);
```

### Query Optimization

#### Geospatial Queries
```sql
-- Find nearby clinics
SELECT c.*, 
       calculate_distance(1.3048, 103.8318, c.latitude, c.longitude) as distance
FROM clinics c
WHERE c.isActive = true
  AND calculate_distance(1.3048, 103.8318, c.latitude, c.longitude) < 5000
ORDER BY distance
LIMIT 10;
```

#### Healthcare Filtering
```sql
-- Find Healthier SG clinics with specific services
SELECT DISTINCT c.*, cs.price, cs.isHealthierSGCovered
FROM clinics c
JOIN clinic_services cs ON c.id = cs.clinicId
JOIN services s ON cs.serviceId = s.id
WHERE c.isActive = true
  AND cs.isAvailable = true
  AND s.isHealthierSGCovered = true
  AND s.categoryId = 'general_practice';
```

## Security & Data Protection

### Row Level Security (RLS)

All tables have RLS enabled with policies for:

#### User Data Access
```sql
-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);
```

#### Healthcare Data Access
```sql
-- Doctors can view their own profiles and assigned patients
CREATE POLICY "Doctors can view own data" ON doctors
    FOR SELECT USING (auth.uid() = id OR auth.role() = 'admin');
```

#### Public Read Access
```sql
-- Public read access for active clinics, doctors, and services
CREATE POLICY "Anyone can view active clinics" ON clinics
    FOR SELECT USING (isActive = true);
```

### Data Encryption

#### Sensitive Data Handling
- NRIC numbers encrypted at rest
- Medical information protected
- PDPA-compliant data handling
- Audit trail for all access

#### Encryption Functions
```sql
-- PDPA compliance check
CREATE OR REPLACE FUNCTION check_pdpa_compliance()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.nric IS NOT NULL AND OLD.pdpaConsent IS DISTINCT FROM NEW.pdpaConsent THEN
        IF NEW.pdpaConsent = false THEN
            RAISE EXCEPTION 'PDPA consent is required for NRIC data';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## Backup & Recovery

### Backup Strategy

1. **Automated Daily Backups**
   - Full database dumps
   - Point-in-time recovery
   - Encrypted backups

2. **Schema-Only Backups**
   - Before deployments
   - Version control integration
   - Migration tracking

3. **Data Export Scripts**
   - GDPR data portability
   - Healthcare data migration
   - Analytics data extraction

### Recovery Procedures

#### Point-in-Time Recovery
```bash
# Restore to specific timestamp
pg_restore --clean --if-exists \
           --verbose \
           --host=localhost \
           --port=5432 \
           --username=postgres \
           --dbname=myfamilyclinic \
           --target-time="2024-01-15 14:30:00" \
           backup_file.dump
```

## Deployment Scripts

### Database Deployment

#### Schema Deployment
```bash
# Deploy schema to environment
./database/deploy.sh dev      # Development
./database/deploy.sh staging  # Staging
DATABASE_URL="postgresql://..." ./database/deploy.sh prod  # Production
```

#### Migration Management
```sql
-- Create migration
CREATE TABLE migrations (
    id SERIAL PRIMARY KEY,
    version VARCHAR(255) NOT NULL UNIQUE,
    applied_at TIMESTAMP DEFAULT NOW(),
    description TEXT
);

-- Apply migration
INSERT INTO migrations (version, description) 
VALUES ('001_add_new_table', 'Description of changes');
```

## Monitoring & Maintenance

### Performance Monitoring

#### Key Metrics
- Query performance
- Index usage
- Connection pools
- Storage usage
- Backup completion

#### Healthcare-Specific Monitoring
- Patient data access patterns
- Emergency response times
- Healthcare compliance metrics
- Government reporting timeliness

### Regular Maintenance

#### Daily Tasks
- Backup verification
- Performance monitoring
- Security log review
- Error log analysis

#### Weekly Tasks
- Index optimization
- Statistics updates
- Capacity planning
- Compliance audit

#### Monthly Tasks
- Full backup testing
- Security assessment
- Performance optimization
- Documentation updates

## Troubleshooting

### Common Issues

#### Connection Problems
```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Kill long-running queries
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE state = 'active' 
AND query_start < now() - interval '10 minutes';
```

#### Performance Issues
```sql
-- Check slow queries
SELECT query, mean_time, calls
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

#### Geospatial Issues
```sql
-- Check PostGIS installation
SELECT PostGIS_Version();

-- Verify geometry data
SELECT ST_IsValid(location), ST_IsValidReason(location)
FROM clinics
WHERE location IS NOT NULL;
```

## Development Guidelines

### Code Standards

#### Naming Conventions
- Tables: lowercase with underscores (`user_profiles`)
- Columns: lowercase with underscores (`created_at`)
- Enums: uppercase (`UserRole`)
- Indexes: descriptive names (`idx_users_email`)

#### Data Types
- Primary Keys: UUID
- Timestamps: TIMESTAMP(3) with timezone
- Monetary: DOUBLE PRECISION with currency field
- Text: TEXT for unlimited length
- JSON: JSONB for complex data

#### Healthcare Compliance
- Always implement PDPA consent checks
- Encrypt sensitive medical data
- Maintain comprehensive audit trails
- Support data deletion requests

### Testing

#### Database Testing
```sql
-- Test PDPA compliance
SELECT check_pdpa_compliance();

-- Test geospatial functions
SELECT calculate_distance(1.3048, 103.8318, 1.3546, 103.9436);

-- Test healthcare permissions
SET ROLE 'patient';
SELECT * FROM clinics WHERE isActive = true;
```

## API Integration

### Database Access Patterns

#### Read Operations
```sql
-- Efficient clinic search with filtering
SELECT c.*, cs.price, s.name as service_name
FROM clinics c
JOIN clinic_services cs ON c.id = cs.clinicId
JOIN services s ON cs.serviceId = s.id
WHERE c.isActive = true
  AND cs.isAvailable = true
  AND s.isHealthierSGCovered = true
ORDER BY c.rating DESC, cs.price ASC
LIMIT 20;
```

#### Write Operations
```sql
-- Insert new clinic with transaction
BEGIN;
INSERT INTO clinics (...) VALUES (...);
INSERT INTO clinic_services (...) VALUES (...);
INSERT INTO operating_hours (...) VALUES (...);
COMMIT;
```

### Real-Time Features

#### Subscription Patterns
```sql
-- Real-time availability updates
CREATE OR REPLACE FUNCTION notify_availability_change()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify('availability_updated', NEW.clinicId::text);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER availability_trigger
    AFTER UPDATE ON clinic_services
    FOR EACH ROW
    EXECUTE FUNCTION notify_availability_change();
```

## Conclusion

The My Family Clinic database is designed to handle the complex requirements of Singapore's healthcare ecosystem while maintaining the highest standards of security, compliance, and performance. The schema supports multi-language healthcare services, government program integration, and real-time operations while ensuring patient privacy and data protection.

For technical support or questions about the database schema, please refer to the deployment documentation or contact the development team.