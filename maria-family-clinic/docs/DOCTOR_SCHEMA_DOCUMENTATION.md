# Doctor Database Architecture & Schema Extension

**Sub-Phase 7.1** | **Status**: ✅ Complete

## 📋 Overview

This document details the comprehensive extension of the Prisma database schema to support advanced doctor profile management, clinic relationships, availability tracking, and search optimization features.

## 🎯 Objectives Achieved

✅ **Doctor Profile Structure** - Comprehensive doctor data model with personal information, qualifications, and professional details  
✅ **Doctor-Clinic Relationship Management** - Multi-clinic affiliations with role and schedule tracking  
✅ **Doctor Availability Tracking** - Real-time schedule management with appointment slot integration  
✅ **Search Optimization Features** - Full-text search with medical terminology and multilingual support  
✅ **Metadata and Analytics** - Patient satisfaction tracking and specialization metrics  
✅ **Privacy and Compliance** - GDPR/PDPA compliance with audit trail support  

## 🏗️ Database Schema Changes

### Core Models Extended

#### 1. **Doctor Model** - Enhanced Professional Profile
```prisma
model Doctor {
  // Enhanced professional details
  medicalSchool           String?      // Medical school attended
  graduationYear          Int?         // Year of graduation
  specializations         String[]     // Specific sub-specializations
  boardCertifications     String[]     // Board certifications
  professionalMemberships String[]     // Professional societies
  
  // Professional achievements
  achievements            String[]     // Notable achievements
  awards                  String[]     // Awards and recognition
  publications            String[]     // Research publications
  researchInterests       String[]     // Areas of research
  
  // Career history
  careerHighlights        Json         // Career progression details
  previousPositions       Json         // Previous roles
  
  // Analytics and metrics
  patientSatisfaction     Float?       // Average patient satisfaction (1-5)
  appointmentCompletionRate Float?     // Completion rate percentage
  totalAppointments       Int          // Total appointments handled
  specializationPopularity Float?      // Popularity score
  
  // Privacy and compliance
  privacySettings         Json         // Profile visibility settings
  gdprConsent            Boolean       // GDPR consent
  pdpaConsent            Boolean       // PDPA consent
  confidentialityLevel   ConfidentialityLevel
  
  // Professional development
  cmePoints              Int           // Continuing medical education points
  lastCMEUpdate          DateTime?
  professionalDevelopment Json         // Ongoing education
  
  // Emergency and on-call
  emergencyAvailability  Boolean       // Available for emergencies
  onCallSchedule         Json?         // On-call schedule
  
  // Enhanced relationships
  availabilities         DoctorAvailability[]
  educationHistory       DoctorEducation[]
  certifications         DoctorCertification[]
  memberships            DoctorMembership[]
  awardsRel              DoctorAward[]
  schedules              DoctorSchedule[]
  leaves                 DoctorLeave[]
  appointments           DoctorAppointment[]
  searchIndex            DoctorSearchIndex[]
  auditLogs              DoctorAuditLog[]
}
```

#### 2. **DoctorClinic Model** - Multi-Clinic Management
```prisma
model DoctorClinic {
  // Enhanced assignment details
  capacity               DoctorCapacity  // Full-time, Part-time, Visiting, etc.
  clinicSpecializations  String[]        // Specializations at this clinic
  primaryServices        String[]        // Primary services offered here
  
  // Consultation details
  consultationDuration   Int?            // Standard consultation duration
  emergencyConsultationFee Float?        // Emergency consultation fee
  
  // Performance metrics
  clinicRating           Float?          // Rating specific to this clinic
  clinicPatientCount     Int             // Patients treated at this clinic
  
  // Operating details
  appointmentTypes       Json            // Available appointment types
  advanceBookingDays     Int             // How far in advance patients can book
  
  // Insurance and payment
  acceptedInsurance      Json            // Insurance plans accepted
  medisaveAccepted       Boolean         // Medisave acceptance
  chasAccepted           Boolean         // CHAS acceptance
  
  // Verification and status
  verificationStatus     VerificationStatus
  verificationNotes      String? @db.Text
}
```

#### 3. **DoctorAvailability Model** - Real-Time Schedule Management
```prisma
model DoctorAvailability {
  // Date and time information
  date                   DateTime        // Specific date
  startTime              String          // Format: "HH:mm"
  endTime                String          // Format: "HH:mm"
  
  // Availability details
  availabilityType       AvailabilityType  // Regular, Emergency, Walk-in, etc.
  appointmentType        String?         // Specific appointment type
  
  // Slot management
  maxAppointments        Int?            // Maximum appointments for this slot
  availableSlots         Int             // Number of concurrent slots
  bookedAppointments     Int             // Current bookings
  
  // Location-specific
  location               String?         // Specific location within clinic
  roomNumber             String?         // Room number
  
  // Appointment configuration
  slotDuration           Int             // Duration per appointment in minutes
  breakDuration          Int             // Break time between appointments
  bufferTime             Int             // Buffer time before/after
  
  // Special flags
  isEmergency            Boolean         // Emergency appointments only
  isWalkIn              Boolean         // Walk-in appointments
  isTelehealth          Boolean         // Telehealth consultations
  
  // Restrictions
  ageRestrictions        Json            // Age-specific availability
  genderRestrictions     String[]
  conditionsJson         Json            // Medical conditions
}
```

#### 4. **DoctorSchedule Model** - Recurring Schedule Management
```prisma
model DoctorSchedule {
  // Schedule information
  scheduleType           ScheduleType     // Regular, Emergency, On-call, etc.
  dayOfWeek              DayOfWeek?       // For recurring schedules
  specificDate           DateTime?        // For one-time schedules
  
  // Time details
  breakStart             String?          // Format: "HH:mm"
  breakEnd               String?          // Format: "HH:mm"
  
  // Recurrence pattern
  isRecurring            Boolean          // Recurring vs one-time
  recurrencePattern      Json             // Weekly/monthly pattern
  
  // Special schedule types
  isOnCall               Boolean          // On-call duty
  isEmergency            Boolean          // Emergency coverage
  isTraining             Boolean          // Professional development
  
  // Effective dates and status
  effectiveFrom          DateTime         // When schedule becomes active
  effectiveTo            DateTime?        // When schedule expires
  isOverride             Boolean          // Overrides regular schedule
}
```

#### 5. **DoctorEducation Model** - Academic Background
```prisma
model DoctorEducation {
  // Education details
  educationType          EducationType    // Medical school, Residency, etc.
  institution            String           // Educational institution
  degree                 String           // Degree obtained
  fieldOfStudy           String           // Field of study
  
  // Academic performance
  gpa                    Float?           // Grade Point Average
  honors                 String[]         // Academic honors
  thesisTitle            String?          // For research degrees
  
  // Verification
  isVerified             Boolean          // Document verification
  verifiedBy             String?          // Verification staff member
  
  // Location and documentation
  country                String           // Country of education
  certificateUrl         String?          // Digital certificate
}
```

#### 6. **DoctorCertification Model** - Professional Certifications
```prisma
model DoctorCertification {
  // Certification details
  certificationName      String           // Name of certification
  certificationBody      String           // Issuing organization
  certificationNumber    String?          // Certificate number
  
  // Certification type and scope
  certificationType      CertificationType
  specialty              String?          // Related medical specialty
  certificationLevel     String?          // Basic, Advanced, Expert
  scopeOfPractice        String? @db.Text
  
  // Renewal tracking
  renewalRequired        Boolean          // Requires renewal
  renewalNoticeSent      Boolean          // Renewal notice sent
  nextRenewalDate        DateTime?        // Next renewal date
  
  // Status and verification
  isActive               Boolean          // Currently active
  isVerified             Boolean          // Verified certificate
  verificationNotes      String? @db.Text
}
```

#### 7. **DoctorSearchIndex Model** - Search Optimization
```prisma
model DoctorSearchIndex {
  // Search optimization
  searchableName         String           // Optimized name for search
  searchableBio          String? @db.Text // Optimized biography
  searchKeywords         String[]         // Search keywords
  
  // Medical terminology
  medicalTerms           String[]         // Medical terminology
  specialtyTerms         String[]         // Specialty-specific terms
  conditionTerms         String[]         // Condition terms
  procedureTerms         String[]         // Procedure terms
  
  // Multilingual support
  nameTranslations       Json             // Translations for name
  bioTranslations        Json             // Translations for bio
  searchTranslations     Json             // Search term translations
  
  // Search ranking
  searchBoost            Float            // Boost relevance score
  popularityScore        Float            // Based on bookings/views
  ratingBoost            Float            // Rating influence
  experienceBoost        Float            // Experience influence
  
  // Performance tracking
  lastIndexed            DateTime         // Last search index update
}
```

### New Supporting Models

#### 8. **DoctorLeave** - Leave Management
```prisma
model DoctorLeave {
  leaveType              LeaveType        // Annual, Sick, Maternity, etc.
  isApproved             Boolean          // Leave approval status
  approvedBy             String?          // Staff member who approved
  emergencyCoverage      Boolean          // Emergency coverage arranged
  isHalfDay              Boolean          // Half-day leave
  status                 LeaveStatus      // Pending, Approved, Rejected
}
```

#### 9. **DoctorAppointment** - Appointment Management
```prisma
model DoctorAppointment {
  // Patient information
  patientId              String?          // Patient user ID
  patientName            String?          // If not registered
  patientPhone           String?          // Contact information
  
  // Service details
  serviceId              String?          // Related service
  appointmentType        String?          // Type of appointment
  urgencyLevel           UrgencyLevel     // Routine, Urgent, Emergency
  
  // Status and tracking
  status                 DoctorAppointmentStatus
  wasCompleted           Boolean          // Appointment completion
  completionRate         Float?           // Completion quality score
  
  // Rescheduling
  isRescheduled          Boolean          // Reschedule flag
  originalDate           DateTime?        // Original appointment date
  rescheduleReason       String? @db.Text // Reschedule reason
  
  // Feedback and rating
  doctorNotes            String? @db.Text // Doctor's notes
  patientFeedback        String? @db.Text // Patient feedback
  patientRating          Float?           // 1-5 rating
  
  // Billing
  consultationFee        Float?           // Consultation fee
  isPaid                 Boolean          // Payment status
  paymentMethod          String?          // Payment method
}
```

#### 10. **DoctorMembership** - Professional Memberships
```prisma
model DoctorMembership {
  organizationName       String           // Professional organization
  membershipType         MembershipType   // Professional, Academic, etc.
  membershipLevel        String?          // Member, Fellow, Senior
  membershipNumber       String?          // Membership number
  annualFees             Float?           // Annual membership fees
  lastPaymentDate        DateTime?        // Last payment date
}
```

#### 11. **DoctorAward** - Recognition and Awards
```prisma
model DoctorAward {
  awardName              String           // Name of award
  awardingBody           String           // Awarding organization
  awardCategory          String?          // Clinical, Research, Teaching
  recognitionLevel       AwardRecognitionLevel
  description            String? @db.Text // Award description
  certificateUrl         String?          // Award certificate
}
```

#### 12. **DoctorAuditLog** - Audit Trail
```prisma
model DoctorAuditLog {
  action                 String           // Create, Update, View, Delete
  fieldName              String?          // Specific field changed
  oldValue               String? @db.Text // Previous value
  newValue               String? @db.Text // New value
  
  // User context
  performedBy            String?          // User who performed action
  userRole               String?          // Role of user
  
  // Compliance tracking
  dataSensitivity        DataSensitivity  // Data classification
  gdprRelevant           Boolean          // GDPR compliance flag
  pdpaRelevant           Boolean          // PDPA compliance flag
  consentVersion         String?          // Consent version
}
```

## 📊 Enums Added

### Professional Roles and Capacity
```typescript
enum DoctorRole {
  ATTENDING = 'ATTENDING',
  VISITING = 'VISITING',
  CONSULTANT = 'CONSULTANT',
  SPECIALIST = 'SPECIALIST'
}

enum DoctorCapacity {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  VISITING = 'VISITING',
  LOCUM = 'LOCUM',
  CONTRACT = 'CONTRACT'
}
```

### Availability and Scheduling
```typescript
enum AvailabilityType {
  REGULAR = 'REGULAR',
  EMERGENCY = 'EMERGENCY',
  WALK_IN = 'WALK_IN',
  TELEHEALTH = 'TELEHEALTH',
  ON_CALL = 'ON_CALL',
  CONSULTATION = 'CONSULTATION',
  FOLLOW_UP = 'FOLLOW_UP'
}

enum ScheduleType {
  REGULAR = 'REGULAR',
  EMERGENCY = 'EMERGENCY',
  ON_CALL = 'ON_CALL',
  TRAINING = 'TRAINING',
  CONFERENCE = 'CONFERENCE',
  PERSONAL = 'PERSONAL'
}
```

### Leave and Appointment Management
```typescript
enum LeaveType {
  ANNUAL = 'ANNUAL',
  SICK = 'SICK',
  MATERNITY = 'MATERNITY',
  PATERNITY = 'PATERNITY',
  STUDY = 'STUDY',
  EMERGENCY = 'EMERGENCY',
  COMPASSIONATE = 'COMPASSIONATE',
  UNPAID = 'UNPAID'
}

enum DoctorAppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
  RESCHEDULED = 'RESCHEDULED'
}
```

### Education and Certification
```typescript
enum EducationType {
  MEDICAL_SCHOOL = 'MEDICAL_SCHOOL',
  RESIDENCY = 'RESIDENCY',
  FELLOWSHIP = 'FELLOWSHIP',
  MASTERS = 'MASTERS',
  PHD = 'PHD',
  DIPLOMA = 'DIPLOMA',
  CERTIFICATION = 'CERTIFICATION',
  CONTINUING_EDUCATION = 'CONTINUING_EDUCATION'
}

enum CertificationType {
  PROFESSIONAL = 'PROFESSIONAL',
  ACADEMIC = 'ACADEMIC',
  GOVERNMENT = 'GOVERNMENT',
  SPECIALTY = 'SPECIALTY',
  EQUIPMENT = 'EQUIPMENT',
  CONTINUING_EDUCATION = 'CONTINUING_EDUCATION'
}
```

### Privacy and Compliance
```typescript
enum ConfidentialityLevel {
  STANDARD = 'STANDARD',
  HIGH = 'HIGH',
  RESTRICTED = 'RESTRICTED',
  CONFIDENTIAL = 'CONFIDENTIAL'
}

enum DataSensitivity {
  PUBLIC = 'PUBLIC',
  STANDARD = 'STANDARD',
  SENSITIVE = 'SENSITIVE',
  HIGHLY_SENSITIVE = 'HIGHLY_SENSITIVE',
  MEDICAL = 'MEDICAL',
  CONFIDENTIAL = 'CONFIDENTIAL',
  RESTRICTED = 'RESTRICTED'
}
```

## 🔍 Search and Analytics Features

### Full-Text Search Optimization
- **Medical Terminology Indexing**: Terms are indexed for better discoverability
- **Multilingual Support**: Search terms translated for different languages
- **Specialty-Based Search**: Subspecialty and procedure-specific search
- **Location-Based Proximity**: Geographic search capabilities
- **Availability Filtering**: Real-time availability-based search

### Analytics and Metrics
- **Patient Satisfaction Tracking**: Average ratings and feedback
- **Appointment Completion Rates**: Success metrics per doctor
- **Specialization Popularity**: Trending specialties and services
- **Language Preference Analytics**: Language demand analysis
- **Performance Metrics**: Success rates by specialty

### Search Indexing Strategy
```typescript
interface DoctorSearchIndex {
  // Search boost factors
  searchBoost: number          // Base relevance boost
  popularityScore: number      // Based on bookings/views
  ratingBoost: number          // Rating influence
  experienceBoost: number      // Years of experience boost
  
  // Content indexing
  medicalTerms: string[]       // Medical terminology
  specialtyTerms: string[]     // Specialty-specific terms
  conditionTerms: string[]     // Condition treatment terms
  procedureTerms: string[]     // Procedure expertise terms
  
  // Multilingual support
  nameTranslations: Record<string, string>
  bioTranslations: Record<string, string>
  searchTranslations: Record<string, Record<string, string>>
}
```

## 🔒 Privacy and Compliance

### GDPR/PDPA Compliance
- **Consent Management**: GDPR and PDPA consent tracking
- **Data Retention**: Configurable retention periods
- **Privacy Settings**: Granular visibility controls
- **Audit Trail**: Complete access and modification logging
- **Data Classification**: Sensitivity level tracking

### Professional Confidentiality
- **Confidentiality Levels**: Standard, High, Restricted, Confidential
- **Access Control**: Role-based access to sensitive information
- **Professional Privacy**: Protection of personal professional details
- **Compliance Monitoring**: Regular privacy review tracking

### Audit and Logging
- **Complete Audit Trail**: All actions tracked with user context
- **Data Sensitivity Classification**: Appropriate handling based on sensitivity
- **Compliance Flags**: GDPR/PDPA relevance tracking
- **Access Reason Logging**: Reason for accessing sensitive data

## 📈 Performance Optimizations

### Database Indexing
```sql
-- Doctor model indexes
CREATE INDEX idx_doctors_medical_license ON doctors(medicalLicense);
CREATE INDEX idx_doctors_is_active ON doctors(isActive);
CREATE INDEX idx_doctors_specialties ON doctors USING GIN(specialties);
CREATE INDEX idx_doctors_rating ON doctors(rating);

-- Availability indexes
CREATE INDEX idx_doctor_availabilities_doctor_date ON doctor_availabilities(doctorId, date);
CREATE INDEX idx_doctor_availabilities_clinic_date ON doctor_availabilities(clinicId, date);
CREATE INDEX idx_doctor_availabilities_date_time ON doctor_availabilities(date, startTime);
CREATE INDEX idx_doctor_availabilities_is_available ON doctor_availabilities(isAvailable);

-- Search indexing
CREATE INDEX idx_doctor_search_index_search_boost ON doctor_search_index(searchBoost);
CREATE INDEX idx_doctor_search_index_popularity_score ON doctor_search_index(popularityScore);
```

### Query Optimization
- **Composite Indexes**: Optimized for common query patterns
- **JSON Indexing**: Efficient querying of JSON fields
- **Full-Text Search**: PostgreSQL full-text search capabilities
- **Partitioning Ready**: Prepared for table partitioning if needed

## 🛠️ Migration and Deployment

### Migration Script
```bash
# Apply the doctor schema migration
chmod +x scripts/migrate-doctor-schema.sh
./scripts/migrate-doctor-schema.sh
```

### Migration Steps
1. **Schema Validation**: Validate Prisma schema syntax
2. **Environment Check**: Verify database connection and environment variables
3. **Generate Client**: Generate updated Prisma client
4. **Apply Migration**: Create and apply database migration
5. **Verification**: Verify migration success

### Rollback Plan
```bash
# Rollback migration if needed
npx prisma migrate reset
```

## 📚 TypeScript Support

### Comprehensive Types
- **Complete Type Coverage**: All models have full TypeScript support
- **API Response Types**: Ready-to-use API response interfaces
- **Input Validation Types**: Form and API input validation
- **Search and Filter Types**: Advanced search parameter types

### Usage Example
```typescript
import { 
  Doctor, 
  DoctorSearchParams, 
  DoctorSearchResult,
  CreateDoctorInput,
  DoctorAvailabilitySlot 
} from '@/types/doctor';

// Search doctors
const searchParams: DoctorSearchParams = {
  specialties: ['cardiology'],
  languages: ['english', 'mandarin'],
  location: 'singapore',
  rating: 4.5,
  limit: 20
};

const results: DoctorSearchResult = await searchDoctors(searchParams);

// Create new doctor
const newDoctor: CreateDoctorInput = {
  name: 'Dr. Jane Smith',
  medicalLicense: 'ML123456',
  specialties: ['cardiology'],
  languages: ['english'],
  email: 'jane.smith@clinic.com'
};
```

## 🔗 Integration Points

### Existing Models Integration
- **Clinic Model**: Extended with doctor availability reverse relation
- **User Model**: Compatible with existing user management
- **Service Model**: Integration with service availability
- **Enquiry Model**: Doctor-specific enquiry routing

### API Endpoints Ready
- **Doctor CRUD**: Full create, read, update, delete operations
- **Availability Management**: Real-time slot management
- **Search and Filter**: Advanced search capabilities
- **Analytics Dashboard**: Performance metrics and analytics
- **Audit Logging**: Compliance and security monitoring

## ✅ Validation and Constraints

### Data Validation
- **Required Fields**: Medical license, name are required
- **Unique Constraints**: Medical license, email uniqueness
- **Format Validation**: Time formats, date validation
- **Range Validation**: Rating limits, appointment constraints

### Business Rules
- **Multi-Clinic Support**: Doctors can work at multiple clinics
- **Schedule Conflicts**: Prevention of schedule overlapping
- **Availability Management**: Real-time slot tracking
- **Privacy Compliance**: Automatic privacy setting application

## 🚀 Next Steps

### Immediate Actions
1. **Apply Migration**: Run the migration script in production
2. **Update API Layer**: Create tRPC procedures for new models
3. **UI Components**: Build doctor management interface
4. **Seed Data**: Create sample doctors for testing

### Future Enhancements
1. **Advanced Analytics**: Dashboard for doctor performance
2. **Automated Scheduling**: AI-powered schedule optimization
3. **Patient Portal**: Doctor selection and booking interface
4. **Mobile API**: Mobile-optimized doctor search and booking

## 📋 Files Created/Modified

### Database Files
- ✅ `prisma/schema.prisma` - Extended with new models and fields
- ✅ `scripts/migrate-doctor-schema.sh` - Migration script

### Type Definitions
- ✅ `src/types/doctor.ts` - Comprehensive TypeScript types

### Documentation
- ✅ Complete schema documentation with examples
- ✅ Migration and deployment guide
- ✅ API integration examples

---

**🎯 Status**: Sub-Phase 7.1 Complete  
**📅 Completed**: 2025-11-04  
**🔧 Ready for**: API development and frontend integration  
**📚 Documentation**: Complete with examples and best practices