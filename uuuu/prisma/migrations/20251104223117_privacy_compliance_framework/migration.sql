-- Migration: Privacy Compliance Framework for Health Enquiries
-- Created: 2025-11-04
-- Sub-Phase 9.5: PDPA-Compliant Health Data Protection

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums for privacy compliance
CREATE TYPE "ConsentStatus" AS ENUM (
  'NO_CONSENT', 'PENDING', 'GRANTED', 'WITHDRAWN', 'EXPIRED', 'INVALID', 'UNDER_REVIEW'
);

CREATE TYPE "DataClassification" AS ENUM (
  'PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED', 'TOP_SECRET', 'REGULATED', 'PHI', 'PCI', 'PII'
);

CREATE TYPE "RetentionPeriod" AS ENUM (
  'IMMEDIATE', '7_DAYS', '30_DAYS', '90_DAYS', '1_YEAR', '2_YEARS', '5_YEARS', '7_YEARS', '10_YEARS', 'INDEFINITE'
);

CREATE TYPE "RequestStatus" AS ENUM (
  'PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'CANCELLED'
);

CREATE TYPE "IncidentSeverity" AS ENUM (
  'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
);

CREATE TYPE "EncryptionStatus" AS ENUM (
  'ENCRYPTED', 'DECRYPTED', 'KEY_COMPROMISED', 'PENDING_ENCRYPTION', 'ENCRYPTION_FAILED'
);

-- Health Data Consent Management
CREATE TABLE "HealthDataConsent" (
  "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "enquiryId" UUID REFERENCES "Enquiry"("id") ON DELETE CASCADE,
  "contactFormId" UUID REFERENCES "ContactForm"("id") ON DELETE CASCADE,
  "consentType" TEXT NOT NULL,
  "dataCategories" TEXT[] NOT NULL,
  "processingPurposes" TEXT[] NOT NULL,
  "consentStatus" "ConsentStatus" NOT NULL DEFAULT 'PENDING',
  "legalBasis" TEXT NOT NULL,
  "consentVersion" TEXT NOT NULL,
  "ipAddress" INET,
  "userAgent" TEXT,
  "geolocation" JSONB,
  "medicalConsentDetails" JSONB,
  "emergencyContact" JSONB,
  "thirdPartySharing" BOOLEAN DEFAULT FALSE,
  "dataRetentionPeriod" "RetentionPeriod" DEFAULT '7_YEARS',
  "consentMetadata" JSONB,
  "expiresAt" TIMESTAMP(3) WITH TIME ZONE,
  "withdrawnAt" TIMESTAMP(3) WITH TIME ZONE,
  "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Health Data Audit Log with tamper-proof records
CREATE TABLE "HealthDataAuditLog" (
  "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "userId" UUID REFERENCES "User"("id") ON DELETE SET NULL,
  "enquiryId" UUID REFERENCES "Enquiry"("id") ON DELETE CASCADE,
  "contactFormId" UUID REFERENCES "ContactForm"("id") ON DELETE CASCADE,
  "action" TEXT NOT NULL,
  "resourceType" TEXT NOT NULL,
  "resourceId" TEXT,
  "fieldName" TEXT,
  "oldValue" TEXT,
  "newValue" TEXT,
  "dataClassification" "DataClassification" NOT NULL,
  "legalBasis" TEXT,
  "processingPurpose" TEXT,
  "consentStatus" "ConsentStatus",
  "ipAddress" INET,
  "userAgent" TEXT,
  "sessionId" TEXT,
  "location" JSONB,
  "timestamp" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "metadata" JSONB,
  "hash" TEXT NOT NULL, -- For tamper-proof audit trails
  "previousHash" TEXT, -- Chain of custody
  "verified" BOOLEAN DEFAULT FALSE
);

-- Health Data Retention Management
CREATE TABLE "HealthDataRetention" (
  "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "dataType" TEXT NOT NULL,
  "classification" "DataClassification" NOT NULL,
  "retentionPeriod" "RetentionPeriod" NOT NULL,
  "legalBasis" TEXT,
  "purpose" TEXT,
  "retentionStartDate" TIMESTAMP(3) WITH TIME ZONE NOT NULL,
  "deletionDate" TIMESTAMP(3) WITH TIME ZONE,
  "enforced" BOOLEAN DEFAULT FALSE,
  "enforcedAt" TIMESTAMP(3) WITH TIME ZONE,
  "deletionMethod" TEXT,
  "deletionCertificate" JSONB,
  "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Health Data Encryption Tracking
CREATE TABLE "HealthDataEncryption" (
  "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "userId" UUID REFERENCES "User"("id") ON DELETE CASCADE,
  "enquiryId" UUID REFERENCES "Enquiry"("id") ON DELETE CASCADE,
  "contactFormId" UUID REFERENCES "ContactForm"("id") ON DELETE CASCADE,
  "fieldName" TEXT NOT NULL,
  "originalValue" TEXT, -- Will be encrypted
  "encryptedValue" TEXT NOT NULL,
  "encryptionKeyId" TEXT NOT NULL,
  "encryptionMethod" TEXT NOT NULL DEFAULT 'AES-256-GCM',
  "iv" TEXT NOT NULL,
  "tag" TEXT NOT NULL,
  "classification" "DataClassification" NOT NULL,
  "encryptionStatus" "EncryptionStatus" DEFAULT 'ENCRYPTED',
  "keyVersion" TEXT NOT NULL,
  "encryptedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastAccessed" TIMESTAMP(3) WITH TIME ZONE,
  "accessCount" INTEGER DEFAULT 0,
  "metadata" JSONB
);

-- Data Subject Rights Requests (PDPA Compliance)
CREATE TABLE "DataSubjectRequest" (
  "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "userId" UUID REFERENCES "User"("id") ON DELETE CASCADE,
  "requestType" TEXT NOT NULL, -- ACCESS, CORRECTION, DELETION, PORTABILITY, OBJECTION, RESTRICTION
  "requestStatus" "RequestStatus" NOT NULL DEFAULT 'PENDING',
  "legalBasis" TEXT NOT NULL,
  "dataCategories" TEXT[] NOT NULL,
  "processingActivities" TEXT[] NOT NULL,
  "requestDetails" JSONB NOT NULL,
  "verificationStatus" TEXT DEFAULT 'PENDING',
  "verificationDocuments" JSONB,
  "responseDeadline" TIMESTAMP(3) WITH TIME ZONE NOT NULL,
  "responseProvided" TIMESTAMP(3) WITH TIME ZONE,
  "responseData" JSONB,
  "rejectionReason" TEXT,
  "feesApplicable" DECIMAL(10,2) DEFAULT 0,
  "feesPaid" BOOLEAN DEFAULT FALSE,
  "escalated" BOOLEAN DEFAULT FALSE,
  "escalationReason" TEXT,
  "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Compliance Reports
CREATE TABLE "ComplianceReport" (
  "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "reportType" TEXT NOT NULL, -- PDPA, SMC, HIPAA, SECURITY_AUDIT, PRIVACY_IMPACT
  "reportPeriod" JSONB NOT NULL,
  "complianceStatus" TEXT NOT NULL,
  "totalRecords" INTEGER DEFAULT 0,
  "compliantRecords" INTEGER DEFAULT 0,
  "nonCompliantRecords" INTEGER DEFAULT 0,
  "riskScore" DECIMAL(5,2),
  "findings" JSONB,
  "recommendations" JSONB,
  "generatedBy" UUID REFERENCES "User"("id") ON DELETE SET NULL,
  "generatedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reportData" JSONB NOT NULL,
  "exportedAt" TIMESTAMP(3) WITH TIME ZONE,
  "exportFormat" TEXT
);

-- Privacy Incidents
CREATE TABLE "PrivacyIncident" (
  "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "incidentType" TEXT NOT NULL, -- DATA_BREACH, UNAUTHORIZED_ACCESS, CONSENT_VIOLATION, RETENTION_VIOLATION
  "severity" "IncidentSeverity" NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "affectedRecords" INTEGER DEFAULT 0,
  "affectedUsers" INTEGER DEFAULT 0,
  "dataClassification" "DataClassification" NOT NULL,
  "discoveryMethod" TEXT,
  "discoveryDate" TIMESTAMP(3) WITH TIME ZONE NOT NULL,
  "notificationRequired" BOOLEAN DEFAULT FALSE,
  "regulatoryDeadline" TIMESTAMP(3) WITH TIME ZONE,
  "status" TEXT DEFAULT 'OPEN',
  "assignedTo" UUID REFERENCES "User"("id") ON DELETE SET NULL,
  "investigationFindings" JSONB,
  "correctiveActions" JSONB,
  "lessonsLearned" TEXT,
  "closedAt" TIMESTAMP(3) WITH TIME ZONE,
  "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Data Classification Rules
CREATE TABLE "DataClassification" (
  "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "ruleName" TEXT NOT NULL,
  "classification" "DataClassification" NOT NULL,
  "pattern" TEXT NOT NULL, -- Regex pattern for classification
  "fieldName" TEXT,
  "dataType" TEXT,
  "minConfidence" DECIMAL(3,2) DEFAULT 0.8,
  "autoClassify" BOOLEAN DEFAULT TRUE,
  "manualReview" BOOLEAN DEFAULT FALSE,
  "tags" TEXT[],
  "createdBy" UUID REFERENCES "User"("id") ON DELETE SET NULL,
  "isActive" BOOLEAN DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX "HealthDataConsent_userId_idx" ON "HealthDataConsent"("userId");
CREATE INDEX "HealthDataConsent_enquiryId_idx" ON "HealthDataConsent"("enquiryId");
CREATE INDEX "HealthDataConsent_contactFormId_idx" ON "HealthDataConsent"("contactFormId");
CREATE INDEX "HealthDataConsent_status_idx" ON "HealthDataConsent"("consentStatus");

CREATE INDEX "HealthDataAuditLog_userId_idx" ON "HealthDataAuditLog"("userId");
CREATE INDEX "HealthDataAuditLog_enquiryId_idx" ON "HealthDataAuditLog"("enquiryId");
CREATE INDEX "HealthDataAuditLog_timestamp_idx" ON "HealthDataAuditLog"("timestamp");
CREATE INDEX "HealthDataAuditLog_action_idx" ON "HealthDataAuditLog"("action");
CREATE INDEX "HealthDataAuditLog_classification_idx" ON "HealthDataAuditLog"("dataClassification");

CREATE INDEX "HealthDataRetention_dataType_idx" ON "HealthDataRetention"("dataType");
CREATE INDEX "HealthDataRetention_deletionDate_idx" ON "HealthDataRetention"("deletionDate");
CREATE INDEX "HealthDataRetention_enforced_idx" ON "HealthDataRetention"("enforced");

CREATE INDEX "HealthDataEncryption_userId_idx" ON "HealthDataEncryption"("userId");
CREATE INDEX "HealthDataEncryption_enquiryId_idx" ON "HealthDataEncryption"("enquiryId");
CREATE INDEX "HealthDataEncryption_fieldName_idx" ON "HealthDataEncryption"("fieldName");
CREATE INDEX "HealthDataEncryption_classification_idx" ON "HealthDataEncryption"("classification");

CREATE INDEX "DataSubjectRequest_userId_idx" ON "DataSubjectRequest"("userId");
CREATE INDEX "DataSubjectRequest_status_idx" ON "DataSubjectRequest"("requestStatus");
CREATE INDEX "DataSubjectRequest_deadline_idx" ON "DataSubjectRequest"("responseDeadline");

CREATE INDEX "ComplianceReport_type_idx" ON "ComplianceReport"("reportType");
CREATE INDEX "ComplianceReport_generatedAt_idx" ON "ComplianceReport"("generatedAt");

CREATE INDEX "PrivacyIncident_severity_idx" ON "PrivacyIncident"("severity");
CREATE INDEX "PrivacyIncident_status_idx" ON "PrivacyIncident"("status");
CREATE INDEX "PrivacyIncident_discoveryDate_idx" ON "PrivacyIncident"("discoveryDate");

CREATE INDEX "DataClassification_classification_idx" ON "DataClassification"("classification");
CREATE INDEX "DataClassification_active_idx" ON "DataClassification"("isActive");

-- Add constraints for data integrity
ALTER TABLE "HealthDataConsent" ADD CONSTRAINT "consent_expiry_check" 
  CHECK ("expiresAt" IS NULL OR "expiresAt" > "createdAt");

ALTER TABLE "DataSubjectRequest" ADD CONSTRAINT "deadline_check" 
  CHECK ("responseDeadline" > "createdAt");

ALTER TABLE "HealthDataRetention" ADD CONSTRAINT "deletion_after_start" 
  CHECK ("deletionDate" IS NULL OR "deletionDate" > "retentionStartDate");

ALTER TABLE "PrivacyIncident" ADD CONSTRAINT "discovery_in_past" 
  CHECK ("discoveryDate" <= CURRENT_TIMESTAMP);

-- Create functions for audit trail integrity
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedAt = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_healthdataconsent_updated_at 
  BEFORE UPDATE ON "HealthDataConsent" 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_healthdataretention_updated_at 
  BEFORE UPDATE ON "HealthDataRetention" 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_datasubjectrequest_updated_at 
  BEFORE UPDATE ON "DataSubjectRequest" 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_privacyincident_updated_at 
  BEFORE UPDATE ON "PrivacyIncident" 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dataclassification_updated_at 
  BEFORE UPDATE ON "DataClassification" 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to calculate audit log hash for tamper-proofing
CREATE OR REPLACE FUNCTION calculate_audit_hash(
  user_id UUID,
  action_text TEXT,
  resource_type TEXT,
  resource_id TEXT,
  field_name TEXT,
  timestamp_value TIMESTAMP(3) WITH TIME ZONE
) RETURNS TEXT AS $$
BEGIN
  -- Simple hash calculation (in production, use cryptographically secure hashing)
  RETURN encode(digest(
    COALESCE(user_id::text, '') || '|' ||
    action_text || '|' ||
    resource_type || '|' ||
    COALESCE(resource_id, '') || '|' ||
    COALESCE(field_name, '') || '|' ||
    timestamp_value::text,
    'sha256'
  ), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically calculate audit log hash
CREATE OR REPLACE FUNCTION set_audit_hash()
RETURNS TRIGGER AS $$
BEGIN
  NEW.hash = calculate_audit_hash(
    NEW."userId",
    NEW.action,
    NEW.resourceType,
    NEW.resourceId,
    NEW.fieldName,
    NEW.timestamp
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_auditlog_hash_trigger
  BEFORE INSERT ON "HealthDataAuditLog"
  FOR EACH ROW EXECUTE FUNCTION set_audit_hash();

-- Create view for compliance dashboard
CREATE OR REPLACE VIEW compliance_overview AS
SELECT
  'consents' as metric_type,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE "consentStatus" = 'GRANTED') as compliant_count,
  COUNT(*) FILTER (WHERE "consentStatus" IN ('PENDING', 'INVALID')) as non_compliant_count
FROM "HealthDataConsent"
UNION ALL
SELECT
  'audit_logs' as metric_type,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE verified = true) as compliant_count,
  COUNT(*) FILTER (WHERE verified = false) as non_compliant_count
FROM "HealthDataAuditLog"
UNION ALL
SELECT
  'encryption' as metric_type,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE "encryptionStatus" = 'ENCRYPTED') as compliant_count,
  COUNT(*) FILTER (WHERE "encryptionStatus" IN ('ENCRYPTION_FAILED', 'KEY_COMPROMISED')) as non_compliant_count
FROM "HealthDataEncryption"
UNION ALL
SELECT
  'retention' as metric_type,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE enforced = true) as compliant_count,
  COUNT(*) FILTER (WHERE enforced = false) as non_compliant_count
FROM "HealthDataRetention";

-- Create function to clean up expired data (for scheduled jobs)
CREATE OR REPLACE FUNCTION cleanup_expired_data()
RETURNS void AS $$
BEGIN
  -- Mark expired consents
  UPDATE "HealthDataConsent" 
  SET "consentStatus" = 'EXPIRED'
  WHERE "expiresAt" < CURRENT_TIMESTAMP 
  AND "consentStatus" = 'GRANTED';

  -- Clean up audit logs older than 7 years
  DELETE FROM "HealthDataAuditLog"
  WHERE "timestamp" < (CURRENT_TIMESTAMP - INTERVAL '7 years');

  -- Mark overdue data subject requests
  UPDATE "DataSubjectRequest"
  SET "requestStatus" = 'OVERDUE'
  WHERE "responseDeadline" < CURRENT_TIMESTAMP
  AND "requestStatus" = 'PENDING';
END;
$$ LANGUAGE plpgsql;