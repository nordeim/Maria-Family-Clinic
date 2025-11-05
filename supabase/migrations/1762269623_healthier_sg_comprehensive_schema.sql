-- Migration: healthier_sg_comprehensive_schema
-- Created at: 1762269623

-- Create the main schema
-- This contains the comprehensive schema migration

-- Create core tables first
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

-- Add user role enum
CREATE TYPE "UserRole" AS ENUM ('PATIENT', 'DOCTOR', 'CLINIC_ADMIN', 'SYSTEM_ADMIN', 'GOVERNMENT');

-- Create other essential tables
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
    "medicalSchool" TEXT,
    "graduationYear" INTEGER,
    "specializations" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "boardCertifications" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "professionalMemberships" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "achievements" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "awards" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "publications" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "researchInterests" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "careerHighlights" JSONB NOT NULL DEFAULT '[]',
    "previousPositions" JSONB NOT NULL DEFAULT '[]',
    "profileImage" TEXT,
    "consultationFee" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'SGD',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationDate" TIMESTAMP(3),
    "verificationNotes" TEXT,
    "rating" DOUBLE PRECISION,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "patientSatisfaction" DOUBLE PRECISION,
    "appointmentCompletionRate" DOUBLE PRECISION,
    "totalAppointments" INTEGER NOT NULL DEFAULT 0,
    "specializationPopularity" DOUBLE PRECISION,
    "languagePreference" JSONB NOT NULL DEFAULT '{}',
    "privacySettings" JSONB NOT NULL DEFAULT '{"profileVisibility": "public", "contactInfoVisible": "private", "scheduleVisible": "clinic-only"}',
    "gdprConsent" BOOLEAN NOT NULL DEFAULT false,
    "pdpaConsent" BOOLEAN NOT NULL DEFAULT false,
    "lastPrivacyReview" TIMESTAMP(3),
    "confidentialityLevel" "ConfidentialityLevel" NOT NULL DEFAULT 'STANDARD',
    "dataRetentionPeriod" INTEGER,
    "preferredContactMethod" TEXT,
    "communicationPreferences" JSONB NOT NULL DEFAULT '{"emailNotifications": true, "smsReminders": false}',
    "emergencyContact" TEXT,
    "emergencyPhone" TEXT,
    "cmePoints" INTEGER NOT NULL DEFAULT 0,
    "lastCMEUpdate" TIMESTAMP(3),
    "professionalDevelopment" JSONB NOT NULL DEFAULT '[]',
    "emergencyAvailability" BOOLEAN NOT NULL DEFAULT false,
    "onCallSchedule" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "doctors_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "doctors_medicalLicense_key" ON "doctors"("medicalLicense");

-- Create services table
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" TEXT,
    "subcategory" TEXT,
    "specialtyArea" TEXT,
    "mohCode" TEXT,
    "icd10Codes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "cptCodes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "typicalDurationMin" INTEGER,
    "complexityLevel" "ServiceComplexity" NOT NULL DEFAULT 'BASIC',
    "urgencyLevel" "UrgencyLevel" NOT NULL DEFAULT 'ROUTINE',
    "basePrice" DOUBLE PRECISION,
    "priceRangeMin" DOUBLE PRECISION,
    "priceRangeMax" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'SGD',
    "isSubsidized" BOOLEAN NOT NULL DEFAULT false,
    "isHealthierSGCovered" BOOLEAN NOT NULL DEFAULT false,
    "healthierSGServices" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "medisaveCoverage" JSONB NOT NULL DEFAULT '{}',
    "medishieldCoverage" JSONB NOT NULL DEFAULT '{}',
    "insuranceCoverage" JSONB NOT NULL DEFAULT '{}',
    "medicalDescription" TEXT,
    "patientFriendlyDesc" TEXT,
    "processSteps" JSONB NOT NULL DEFAULT '[]',
    "preparationSteps" JSONB NOT NULL DEFAULT '[]',
    "postCareInstructions" JSONB NOT NULL DEFAULT '[]',
    "successRates" JSONB NOT NULL DEFAULT '{}',
    "riskFactors" JSONB NOT NULL DEFAULT '[]',
    "ageRequirements" JSONB NOT NULL DEFAULT '{}',
    "genderRequirements" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "translations" JSONB NOT NULL DEFAULT '{}',
    "synonyms" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "searchTerms" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "commonSearchPhrases" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "terminology" JSONB NOT NULL DEFAULT '{}',
    "commonQuestions" JSONB NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "priorityLevel" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "bookingCount" INTEGER NOT NULL DEFAULT 0,
    "lastBookedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraints
ALTER TABLE "services" ADD CONSTRAINT "services_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "service_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add index for doctors
CREATE INDEX "doctors_medicalLicense_idx" ON "doctors"("medicalLicense");
CREATE INDEX "doctors_isActive_idx" ON "doctors"("isActive");
CREATE INDEX "doctors_specialties_idx" ON "doctors"( "specialties");

-- Add index for clinics
CREATE INDEX "clinics_latitude_longitude_idx" ON "clinics"("latitude", "longitude");
CREATE INDEX "clinics_isActive_idx" ON "clinics"("isActive");

-- Add index for services
CREATE INDEX "services_categoryId_idx" ON "services"("categoryId");
CREATE INDEX "services_isHealthierSGCovered_idx" ON "services"("isHealthierSGCovered");
CREATE INDEX "services_complexityLevel_idx" ON "services"("complexityLevel");

-- Add service categories table
CREATE TABLE "service_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT,
    "description" TEXT,
    "parentId" TEXT,
    "level" INTEGER NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "mohCodePrefix" TEXT,
    "mohCategoryName" TEXT,
    "htCategory" TEXT,
    "htPriority" "HTPriority" NOT NULL DEFAULT 'STANDARD',
    "healthierSGCategory" TEXT,
    "healthierSGLevel" TEXT,
    "translations" JSONB NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSubsidized" BOOLEAN NOT NULL DEFAULT false,
    "priorityLevel" INTEGER NOT NULL DEFAULT 0,
    "serviceCount" INTEGER NOT NULL DEFAULT 0,
    "averagePrice" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "service_categories_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "service_categories_name_key" ON "service_categories"("name");
CREATE INDEX "service_categories_parentId_idx" ON "service_categories"("parentId");

-- Add Healthier SG Program Enrollments table
CREATE TABLE "program_enrollments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "enrollmentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "HealthierSGEnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "enrollmentMethod" "HealthierSGEnrollmentMethod" NOT NULL,
    "enrollmentChannel" TEXT,
    "enrollmentLocation" TEXT,
    "consentGiven" BOOLEAN NOT NULL DEFAULT false,
    "consentDate" TIMESTAMP(3),
    "consentVersion" TEXT,
    "beneficiaryType" TEXT,
    "participationType" TEXT,
    "enrollmentReason" TEXT,
    "healthProfileId" TEXT,
    "eligibilityVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationDate" TIMESTAMP(3),
    "verificationMethod" TEXT,
    "verificationNotes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "suspensionReason" TEXT,
    "suspendedAt" TIMESTAMP(3),
    "suspendedBy" TEXT,
    "completionDate" TIMESTAMP(3),
    "completionReason" TEXT,
    "withdrawalDate" TIMESTAMP(3),
    "withdrawalReason" TEXT,
    "withdrawnBy" TEXT,
    "transferTo" TEXT,
    "transferFrom" TEXT,
    "transferDate" TIMESTAMP(3),
    "lastActivityDate" TIMESTAMP(3),
    "participationScore" DOUBLE PRECISION,
    "engagementLevel" TEXT,
    "satisfactionRating" DOUBLE PRECISION,
    "retentionProbability" DOUBLE PRECISION,
    "recommendationScore" DOUBLE PRECISION,
    "costToProgram" DOUBLE PRECISION,
    "costPerOutcome" DOUBLE PRECISION,
    "roiScore" DOUBLE PRECISION,
    "dataRetentionUntil" TIMESTAMP(3),
    "dataAnonymizationScheduled" TIMESTAMP(3),
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "program_enrollments_pkey" PRIMARY KEY ("id")
);

-- Add the remaining essential enums for the migration to work
CREATE TYPE "ConfidentialityLevel" AS ENUM ('STANDARD', 'HIGH', 'MEDICAL', 'EMERGENCY');
CREATE TYPE "ServiceComplexity" AS ENUM ('BASIC', 'INTERMEDIATE', 'ADVANCED', 'SPECIALIZED');
CREATE TYPE "UrgencyLevel" AS ENUM ('ROUTINE', 'URGENT', 'EMERGENCY');
CREATE TYPE "HTPriority" AS ENUM ('STANDARD', 'HIGH', 'CRITICAL');

-- Add foreign key constraints for program enrollments
ALTER TABLE "program_enrollments" ADD CONSTRAINT "program_enrollments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add index for program enrollments
CREATE INDEX "program_enrollments_userId_idx" ON "program_enrollments"("userId");
CREATE INDEX "program_enrollments_programId_idx" ON "program_enrollments"("programId");
CREATE INDEX "program_enrollments_status_idx" ON "program_enrollments"("status");
CREATE INDEX "program_enrollments_enrollmentDate_idx" ON "program_enrollments"("enrollmentDate");;