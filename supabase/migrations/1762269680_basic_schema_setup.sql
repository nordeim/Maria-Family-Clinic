-- Migration: basic_schema_setup
-- Created at: 1762269680

-- Create basic enum types first
CREATE TYPE "UserRole" AS ENUM ('PATIENT', 'DOCTOR', 'CLINIC_ADMIN', 'SYSTEM_ADMIN', 'GOVERNMENT');
CREATE TYPE "ContactMethod" AS ENUM ('EMAIL', 'PHONE', 'SMS', 'CHAT', 'MAIL', 'IN_PERSON');
CREATE TYPE "ContactType" AS ENUM ('GENERAL_INQUIRY', 'APPOINTMENT_BOOKING', 'APPOINTMENT_INQUIRY', 'SERVICE_INFORMATION', 'HEALTH_CONCERN', 'HEALTHIER_SG_RELATED', 'MEDICAL_RECORD_REQUEST', 'COMPLAINT', 'COMPLIMENT', 'EMERGENCY', 'FOLLOW_UP', 'URGENT_CARE', 'PRESCRIPTION_INQUIRY', 'BILLING_INQUIRY', 'TECHNICAL_SUPPORT', 'PROGRAM_ENROLLMENT', 'PROGRAM_SUPPORT', 'PROGRAM_COMPLETION');
CREATE TYPE "ContactHistoryStatus" AS ENUM ('ACTIVE', 'PENDING_RESPONSE', 'RESOLVED', 'CLOSED', 'ARCHIVED', 'DELETED', 'ESCALATED');
CREATE TYPE "ContactAccessLevel" AS ENUM ('PUBLIC', 'STANDARD', 'RESTRICTED', 'CONFIDENTIAL', 'MEDICAL', 'EMERGENCY_ONLY');
CREATE TYPE "ContactActivityType" AS ENUM ('FORM_SUBMITTED', 'RESPONSE_SENT', 'STATUS_UPDATED', 'ASSIGNED', 'ESCALATED', 'RESOLVED', 'CLOSED', 'FOLLOW_UP_SCHEDULED', 'FOLLOW_UP_COMPLETED', 'APPOINTMENT_BOOKED', 'APPOINTMENT_CONFIRMED', 'APPOINTMENT_CANCELLED', 'ENQUIRY_CREATED', 'DOCUMENT_UPLOADED', 'RESPONSE_RECEIVED', 'SATISFACTION_RATED', 'CONTACT_PREFERENCES_UPDATED', 'DASHBOARD_UPDATED', 'NOTIFICATION_SENT', 'INTEGRATION_SYNC');
CREATE TYPE "ContactActivityStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED', 'DEFERRED', 'ON_HOLD');
CREATE TYPE "ContactPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT', 'CRITICAL', 'EMERGENCY');

-- Create basic tables
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "emailVerified" TIMESTAMP(3),
    "role" "UserRole" NOT NULL DEFAULT 'PATIENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- Create contact forms table
CREATE TABLE "contact_forms" (
    "id" TEXT NOT NULL,
    "referenceNumber" TEXT NOT NULL,
    "categoryId" TEXT,
    "templateId" TEXT,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "formData" JSONB NOT NULL DEFAULT '{}',
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT,
    "preferredContactMethod" "ContactMethod" NOT NULL DEFAULT 'EMAIL',
    "userId" TEXT,
    "patientId" TEXT,
    "clinicId" TEXT,
    "doctorId" TEXT,
    "serviceId" TEXT,
    "medicalInformation" TEXT,
    "urgencyLevel" TEXT NOT NULL DEFAULT 'ROUTINE',
    "appointmentUrgency" TEXT NOT NULL DEFAULT 'STANDARD',
    "submissionSource" TEXT NOT NULL DEFAULT 'WEB_FORM',
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "referrerUrl" TEXT,
    "sessionId" TEXT,
    "privacyConsent" BOOLEAN NOT NULL DEFAULT false,
    "marketingConsent" BOOLEAN NOT NULL DEFAULT false,
    "dataRetentionConsent" BOOLEAN NOT NULL DEFAULT false,
    "consentVersion" TEXT,
    "gdprConsent" BOOLEAN NOT NULL DEFAULT false,
    "pdpaConsent" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "processingNotes" TEXT,
    "autoProcessed" BOOLEAN NOT NULL DEFAULT false,
    "spamCheckResult" TEXT NOT NULL DEFAULT 'PENDING',
    "duplicateCheck" BOOLEAN NOT NULL DEFAULT false,
    "duplicateOfId" TEXT,
    "responseRequired" BOOLEAN NOT NULL DEFAULT true,
    "autoResponseSent" BOOLEAN NOT NULL DEFAULT false,
    "responseDue" TIMESTAMP(3),
    "responseSent" TIMESTAMP(3),
    "firstResponseTime" INTEGER,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "assignedAgentId" TEXT,
    "assignedDepartment" TEXT NOT NULL DEFAULT 'GENERAL',
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "contact_forms_pkey" PRIMARY KEY ("id")
);

-- Create enquiries table
CREATE TABLE "enquiries" (
    "id" TEXT NOT NULL,
    "contactFormId" TEXT,
    "enquiryNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "categoryId" TEXT,
    "enquiryType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "subStatus" TEXT,
    "resolutionStatus" TEXT NOT NULL DEFAULT 'OPEN',
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "urgencyLevel" TEXT NOT NULL DEFAULT 'ROUTINE',
    "businessImpact" TEXT NOT NULL DEFAULT 'LOW',
    "assignedAgentId" TEXT,
    "assignedTeam" TEXT,
    "supervisorId" TEXT,
    "originalAssignee" TEXT,
    "department" TEXT NOT NULL DEFAULT 'GENERAL',
    "specializedTeam" TEXT,
    "medicalReview" BOOLEAN NOT NULL DEFAULT false,
    "complianceReview" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT,
    "patientId" TEXT,
    "clinicId" TEXT,
    "doctorId" TEXT,
    "serviceId" TEXT,
    "appointmentId" TEXT,
    "description" TEXT NOT NULL,
    "initialInquiry" TEXT NOT NULL,
    "customerExpectations" TEXT,
    "requiredAction" TEXT,
    "resolutionSummary" TEXT,
    "resolutionNotes" TEXT,
    "closureReason" TEXT,
    "customerSatisfaction" INTEGER,
    "slaBreached" BOOLEAN NOT NULL DEFAULT false,
    "slaBreachReason" TEXT,
    "escalationCount" INTEGER NOT NULL DEFAULT 0,
    "lastEscalationAt" TIMESTAMP(3),
    "requiresFollowUp" BOOLEAN NOT NULL DEFAULT false,
    "followUpRequired" BOOLEAN NOT NULL DEFAULT false,
    "followUpDate" TIMESTAMP(3),
    "followUpNotes" TEXT,
    "followUpCompleted" BOOLEAN NOT NULL DEFAULT false,
    "externalReference" TEXT,
    "integrationStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "syncData" JSONB NOT NULL DEFAULT '{}',
    "workflowStage" TEXT NOT NULL DEFAULT 'intake',
    "workflowData" JSONB NOT NULL DEFAULT '{}',
    "sourceChannel" TEXT NOT NULL DEFAULT 'WEB_FORM',
    "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "assignedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    
    CONSTRAINT "enquiries_pkey" PRIMARY KEY ("id")
);

-- Create basic healthcare tables
CREATE TABLE "clinics" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "location" Unsupported("geography(Point, 4326)"),
    "operatingHours" JSONB NOT NULL DEFAULT '{}',
    "facilities" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "accreditationStatus" TEXT NOT NULL DEFAULT 'pending',
    "emergencyPhone" TEXT,
    "afterHoursPhone" TEXT,
    "establishedYear" INTEGER,
    "licenseNumber" TEXT,
    "licenseExpiry" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "rating" DOUBLE PRECISION,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "clinics_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "doctors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "medicalLicense" TEXT NOT NULL,
    "nric" TEXT,
    "specialties" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "languages" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "qualifications" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "experienceYears" INTEGER,
    "bio" TEXT,
    "profileImage" TEXT,
    "consultationFee" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'SGD',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "rating" DOUBLE PRECISION,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "doctors_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "doctors_medicalLicense_key" ON "doctors"("medicalLicense");

CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "services_name_key" ON "services"("name");

-- Create appointment table
CREATE TABLE "doctor_appointments" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "doctorAvailabilityId" TEXT,
    "appointmentDate" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "patientId" TEXT,
    "patientName" TEXT,
    "patientPhone" TEXT,
    "patientEmail" TEXT,
    "serviceId" TEXT,
    "appointmentType" TEXT,
    "urgencyLevel" TEXT NOT NULL DEFAULT 'ROUTINE',
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "wasCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completionRate" DOUBLE PRECISION,
    "isCancelled" BOOLEAN NOT NULL DEFAULT false,
    "cancelledAt" TIMESTAMP(3),
    "cancellationReason" TEXT,
    "cancelledBy" TEXT,
    "isRescheduled" BOOLEAN NOT NULL DEFAULT false,
    "originalDate" TIMESTAMP(3),
    "originalTime" TEXT,
    "rescheduleReason" TEXT,
    "doctorNotes" TEXT,
    "patientFeedback" TEXT,
    "patientRating" DOUBLE PRECISION,
    "reminderSent" BOOLEAN NOT NULL DEFAULT false,
    "reminderSentAt" TIMESTAMP(3),
    "confirmationRequired" BOOLEAN NOT NULL DEFAULT true,
    "consultationFee" DOUBLE PRECISION,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "paymentMethod" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "doctor_appointments_pkey" PRIMARY KEY ("id")
);

-- Create program enrollments table
CREATE TABLE "program_enrollments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "enrollmentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "enrollmentMethod" TEXT NOT NULL,
    "consentGiven" BOOLEAN NOT NULL DEFAULT false,
    "consentDate" TIMESTAMP(3),
    "eligibilityVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "program_enrollments_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraints
ALTER TABLE "contact_forms" ADD CONSTRAINT "contact_forms_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "contact_forms" ADD CONSTRAINT "contact_forms_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "contact_forms" ADD CONSTRAINT "contact_forms_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "contact_forms" ADD CONSTRAINT "contact_forms_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_contactFormId_fkey" FOREIGN KEY ("contactFormId") REFERENCES "contact_forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "doctor_appointments" ADD CONSTRAINT "doctor_appointments_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "doctor_appointments" ADD CONSTRAINT "doctor_appointments_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "program_enrollments" ADD CONSTRAINT "program_enrollments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add indexes
CREATE INDEX "contact_forms_referenceNumber_idx" ON "contact_forms"("referenceNumber");
CREATE INDEX "contact_forms_categoryId_idx" ON "contact_forms"("categoryId");
CREATE INDEX "contact_forms_status_idx" ON "contact_forms"("status");
CREATE INDEX "contact_forms_userId_idx" ON "contact_forms"("userId");
CREATE INDEX "contact_forms_clinicId_idx" ON "contact_forms"("clinicId");
CREATE INDEX "contact_forms_doctorId_idx" ON "contact_forms"("doctorId");
CREATE INDEX "contact_forms_serviceId_idx" ON "contact_forms"("serviceId");
CREATE INDEX "contact_forms_createdAt_idx" ON "contact_forms"("createdAt");

CREATE INDEX "enquiries_enquiryNumber_idx" ON "enquiries"("enquiryNumber");
CREATE INDEX "enquiries_categoryId_idx" ON "enquiries"("categoryId");
CREATE INDEX "enquiries_status_idx" ON "enquiries"("status");
CREATE INDEX "enquiries_priority_idx" ON "enquiries"("priority");
CREATE INDEX "enquiries_userId_idx" ON "enquiries"("userId");
CREATE INDEX "enquiries_clinicId_idx" ON "enquiries"("clinicId");
CREATE INDEX "enquiries_doctorId_idx" ON "enquiries"("doctorId");
CREATE INDEX "enquiries_serviceId_idx" ON "enquiries"("serviceId");
CREATE INDEX "enquiries_createdAt_idx" ON "enquiries"("createdAt");

CREATE INDEX "doctor_appointments_doctorId_appointmentDate_idx" ON "doctor_appointments"("doctorId", "appointmentDate");
CREATE INDEX "doctor_appointments_status_idx" ON "doctor_appointments"("status");
CREATE INDEX "doctor_appointments_appointmentDate_startTime_idx" ON "doctor_appointments"("appointmentDate", "startTime");

CREATE INDEX "program_enrollments_userId_idx" ON "program_enrollments"("userId");
CREATE INDEX "program_enrollments_programId_status_idx" ON "program_enrollments"("programId", "status");
CREATE INDEX "program_enrollments_enrollmentDate_status_idx" ON "program_enrollments"("enrollmentDate", "status");

-- Add unique constraints
ALTER TABLE "contact_forms" ADD CONSTRAINT "contact_forms_referenceNumber_key" UNIQUE ("referenceNumber");
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_enquiryNumber_key" UNIQUE ("enquiryNumber");
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_medicalLicense_key" UNIQUE ("medicalLicense");
ALTER TABLE "services" ADD CONSTRAINT "services_name_key" UNIQUE ("name");

-- Create trigger function for updatedAt
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedAt = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updatedAt
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "users" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contact_forms_updated_at BEFORE UPDATE ON "contact_forms" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_enquiries_updated_at BEFORE UPDATE ON "enquiries" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clinics_updated_at BEFORE UPDATE ON "clinics" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON "doctors" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON "services" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_doctor_appointments_updated_at BEFORE UPDATE ON "doctor_appointments" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_program_enrollments_updated_at BEFORE UPDATE ON "program_enrollments" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();;