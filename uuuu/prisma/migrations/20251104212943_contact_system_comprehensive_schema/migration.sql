-- ========================================
-- CONTACT & ENQUIRY MANAGEMENT SYSTEM
-- Sub-Phase 9.1: Comprehensive Database Architecture
-- Healthcare Platform Contact System Design
-- Database Migration: 20251104212943
-- ========================================

-- Create Contact System Enums

-- Contact Categories
CREATE TYPE "ContactCategoryPriority" AS ENUM ('LOW', 'STANDARD', 'HIGH', 'URGENT', 'CRITICAL');

-- Contact Departments
CREATE TYPE "ContactDepartment" AS ENUM ('GENERAL', 'APPOINTMENTS', 'HEALTHIER_SG', 'TECHNICAL_SUPPORT', 'MEDICAL_INQUIRIES', 'BILLING', 'COMPLIANCE', 'QUALITY_ASSURANCE', 'EMERGENCY');

-- Contact Status
CREATE TYPE "ContactStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'PENDING_RESOLUTION', 'RESOLVED', 'CLOSED', 'CANCELLED', 'ESCALATED');

-- Contact Priority
CREATE TYPE "ContactPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT', 'CRITICAL', 'EMERGENCY');

-- Contact Source
CREATE TYPE "ContactSource" AS ENUM ('WEB_FORM', 'EMAIL', 'PHONE', 'CHAT', 'MOBILE_APP', 'SOCIAL_MEDIA', 'WALK_IN', 'REFERRAL', 'API', 'SMS');

-- Contact Method
CREATE TYPE "ContactMethod" AS ENUM ('EMAIL', 'PHONE', 'SMS', 'CHAT', 'MAIL', 'IN_PERSON');

-- Spam Check Result
CREATE TYPE "SpamCheckResult" AS ENUM ('PENDING', 'CLEAN', 'SUSPICIOUS', 'SPAM', 'MALICIOUS');

-- Enquiry Status
CREATE TYPE "EnquiryStatus" AS ENUM ('NEW', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'WAITING_INTERNAL', 'PENDING_RESOLUTION', 'RESOLVED', 'CLOSED', 'CANCELLED', 'ESCALATED');

-- Enquiry Type
CREATE TYPE "EnquiryType" AS ENUM ('INFORMATIONAL', 'COMPLAINT', 'COMPLIMENT', 'SUGGESTION', 'SUPPORT_REQUEST', 'TECHNICAL_ISSUE', 'BILLING_INQUIRY', 'APPOINTMENT_RELATED', 'MEDICAL_INQUIRY', 'COMPLIANCE_ISSUE');

-- Enquiry Priority
CREATE TYPE "EnquiryPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT', 'CRITICAL', 'EMERGENCY');

-- Resolution Status
CREATE TYPE "ResolutionStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'PENDING_CUSTOMER', 'PENDING_INTERNAL', 'RESOLVED', 'CLOSED', 'CANCELLED');

-- Business Impact
CREATE TYPE "BusinessImpact" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'REPUTATIONAL', 'LEGAL', 'FINANCIAL');

-- Contact Team
CREATE TYPE "ContactTeam" AS ENUM ('GENERAL_SUPPORT', 'APPOINTMENT_TEAM', 'HEALTHIER_SG_SPECIALISTS', 'TECHNICAL_SUPPORT', 'MEDICAL_CONSULTANTS', 'BILLING_SUPPORT', 'COMPLIANCE_TEAM', 'ESCALATION_TEAM', 'EMERGENCY_RESPONSE');

-- Appointment Urgency
CREATE TYPE "AppointmentUrgency" AS ENUM ('STANDARD', 'PRIORITY', 'URGENT', 'EMERGENCY', 'WALK_IN', 'SAME_DAY');

-- Assignee Type
CREATE TYPE "AssigneeType" AS ENUM ('AGENT', 'TEAM', 'DEPARTMENT', 'SPECIALIST', 'SUPERVISOR');

-- Assignment Method
CREATE TYPE "AssignmentMethod" AS ENUM ('MANUAL', 'AUTO_ROUND_ROBIN', 'AUTO_SKILL_BASED', 'AUTO_LOAD_BALANCED', 'AUTO_SPECIALIST', 'AUTO_ESCALATION');

-- Assignment Status
CREATE TYPE "AssignmentStatus" AS ENUM ('ACTIVE', 'ACCEPTED', 'DECLINED', 'COMPLETED', 'TRANSFERRED', 'ESCALATED');

-- Contact Action Type
CREATE TYPE "ContactActionType" AS ENUM ('CREATED', 'ASSIGNED', 'STATUS_CHANGED', 'RESPONDED', 'ESCALATED', 'RESOLVED', 'CLOSED', 'REOPENED', 'MERGED', 'SPLIT', 'UPDATED', 'NOTE_ADDED', 'FILE_ATTACHED', 'TEMPLATE_APPLIED', 'AUTOMATION_TRIGGERED');

-- Actor Type
CREATE TYPE "ActorType" AS ENUM ('USER', 'AGENT', 'SUPERVISOR', 'SYSTEM', 'AUTOMATION', 'ADMIN', 'API', 'INTEGRATION');

-- Communication Type
CREATE TYPE "CommunicationType" AS ENUM ('EMAIL', 'PHONE_CALL', 'SMS', 'CHAT_MESSAGE', 'LETTER', 'IN_PERSON', 'SYSTEM_NOTIFICATION', 'AUTOMATED_RESPONSE', 'TICKET_UPDATE', 'STATUS_CHANGE');

-- Message Direction
CREATE TYPE "MessageDirection" AS ENUM ('INBOUND', 'OUTBOUND', 'INTERNAL');

-- Delivery Status
CREATE TYPE "DeliveryStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'BOUNCED', 'REPLIED');

-- Response Type
CREATE TYPE "ResponseType" AS ENUM ('INITIAL_RESPONSE', 'FOLLOW_UP', 'RESOLUTION', 'CLOSURE', 'ESCALATION_NOTE', 'INTERNAL_NOTE', 'CUSTOMER_UPDATE', 'SYSTEM_AUTOMATION', 'TEMPLATE_RESPONSE');

-- Sender Type
CREATE TYPE "SenderType" AS ENUM ('AGENT', 'SUPERVISOR', 'SYSTEM', 'AUTOMATION', 'TEMPLATE', 'SPECIALIST');

-- Recipient Type
CREATE TYPE "RecipientType" AS ENUM ('CUSTOMER', 'AGENT', 'SUPERVISOR', 'DEPARTMENT', 'TEAM', 'SPECIALIST', 'SYSTEM');

-- Communication Channel
CREATE TYPE "CommunicationChannel" AS ENUM ('EMAIL', 'SMS', 'PHONE', 'CHAT', 'TICKET_SYSTEM', 'PORTAL', 'MAIL', 'IN_PERSON', 'SYSTEM', 'API');

-- Response Status
CREATE TYPE "ResponseStatus" AS ENUM ('DRAFT', 'PENDING', 'SENT', 'DELIVERED', 'READ', 'REPLIED', 'FAILED', 'CANCELLED');

-- Device Type
CREATE TYPE "DeviceType" AS ENUM ('DESKTOP', 'MOBILE', 'TABLET', 'UNKNOWN');

-- Sentiment Score
CREATE TYPE "SentimentScore" AS ENUM ('VERY_NEGATIVE', 'NEGATIVE', 'NEUTRAL', 'POSITIVE', 'VERY_POSITIVE', 'MIXED');

-- Routing Target Type
CREATE TYPE "RoutingTargetType" AS ENUM ('AGENT', 'TEAM', 'DEPARTMENT', 'SPECIALIST', 'QUEUE', 'POOL');

-- Routing Method
CREATE TYPE "RoutingMethod" AS ENUM ('DIRECT', 'ROUND_ROBIN', 'SKILL_BASED', 'LOAD_BALANCED', 'PRIORITY_BASED', 'SPECIALIST', 'GEOGRAPHIC', 'LANGUAGE_BASED', 'AVAILABILITY');

-- Escalation Type
CREATE TYPE "EscalationType" AS ENUM ('SLA_BREACH', 'CUSTOMER_REQUEST', 'COMPLEXITY', 'SUPERVISOR_REQUEST', 'SPECIALIST_REQUIRED', 'COMPLIANCE_ISSUE', 'EMERGENCY', 'TECHNICAL', 'COMPLAINT', 'QUALITY_ISSUE');

-- Escalation Level
CREATE TYPE "EscalationLevel" AS ENUM ('L1_AGENT', 'L2_SUPERVISOR', 'L3_SPECIALIST', 'L4_MANAGER', 'L5_DIRECTOR', 'L6_EXECUTIVE', 'EMERGENCY', 'COMPLIANCE', 'TECHNICAL', 'MEDICAL');

-- Escalation Status
CREATE TYPE "EscalationStatus" AS ENUM ('ACTIVE', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED', 'ESCALATED_FURTHER');

-- Contact Template Category
CREATE TYPE "ContactTemplateCategory" AS ENUM ('AUTO_RESPONSE', 'ACKNOWLEDGMENT', 'RESOLUTION', 'ESCALATION', 'CLOSURE', 'FOLLOW_UP', 'ERROR_MESSAGE', 'INFORMATION_REQUEST', 'COMPLAINT_RESPONSE', 'COMPLIMENT_ACKNOWLEDGMENT');

-- Template Usage
CREATE TYPE "TemplateUsage" AS ENUM ('AUTOMATIC', 'MANUAL', 'TRIGGERED', 'SCHEDULED', 'CONDITIONAL', 'ON_DEMAND');

-- Knowledge Base Status
CREATE TYPE "KBStatus" AS ENUM ('DRAFT', 'UNDER_REVIEW', 'ACTIVE', 'ARCHIVED', 'DEPRECATED', 'UNDER_REVISION', 'VERIFIED');

-- ========================================
-- CREATE CONTACT SYSTEM TABLES
-- ========================================

-- Contact Form Categories Table
CREATE TABLE "contact_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "requiresAuth" BOOLEAN NOT NULL DEFAULT false,
    "requiresVerification" BOOLEAN NOT NULL DEFAULT false,
    "priority" "ContactCategoryPriority" NOT NULL DEFAULT 'STANDARD',
    "department" "ContactDepartment" NOT NULL,
    "formFields" JSONB NOT NULL DEFAULT '[]',
    "validationRules" JSONB NOT NULL DEFAULT '{}',
    "autoResponse" BOOLEAN NOT NULL DEFAULT true,
    "responseTemplate" TEXT,
    "defaultAssignee" TEXT,
    "routingRules" JSONB NOT NULL DEFAULT '[]',
    "escalationRules" JSONB NOT NULL DEFAULT '[]',
    "responseSLAHours" INTEGER NOT NULL DEFAULT 24,
    "resolutionSLADays" INTEGER NOT NULL DEFAULT 7,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "icon" TEXT,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_categories_pkey" PRIMARY KEY ("id")
);

-- Create index for contact categories
CREATE UNIQUE INDEX "contact_categories_name_key" ON "contact_categories"("name");
CREATE INDEX "contact_categories_is_active_idx" ON "contact_categories"("isActive");
CREATE INDEX "contact_categories_priority_idx" ON "contact_categories"("priority");

-- Contact Form Templates Table
CREATE TABLE "contact_form_templates" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "formConfig" JSONB NOT NULL DEFAULT '{}',
    "fieldDefinitions" JSONB NOT NULL DEFAULT '[]',
    "conditionalLogic" JSONB NOT NULL DEFAULT '{}',
    "layout" JSONB NOT NULL DEFAULT '{}',
    "medicalFields" BOOLEAN NOT NULL DEFAULT false,
    "requiresNric" BOOLEAN NOT NULL DEFAULT false,
    "requiresConsent" BOOLEAN NOT NULL DEFAULT false,
    "hipaaCompliant" BOOLEAN NOT NULL DEFAULT false,
    "translations" JSONB NOT NULL DEFAULT '{}',
    "supportedLanguages" TEXT[] NOT NULL DEFAULT ARRAY['en'],
    "version" TEXT NOT NULL DEFAULT '1.0',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_form_templates_pkey" PRIMARY KEY ("id")
);

-- Create index for contact form templates
CREATE INDEX "contact_form_templates_category_id_idx" ON "contact_form_templates"("categoryId");
CREATE INDEX "contact_form_templates_is_active_idx" ON "contact_form_templates"("isActive");

-- Main Contact Form Submission Table
CREATE TABLE "contact_forms" (
    "id" TEXT NOT NULL,
    "referenceNumber" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
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
    "urgencyLevel" "UrgencyLevel" NOT NULL DEFAULT 'ROUTINE',
    "appointmentUrgency" "AppointmentUrgency" NOT NULL DEFAULT 'STANDARD',
    "submissionSource" "ContactSource" NOT NULL DEFAULT 'WEB_FORM',
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
    "status" "ContactStatus" NOT NULL DEFAULT 'SUBMITTED',
    "processingNotes" TEXT,
    "autoProcessed" BOOLEAN NOT NULL DEFAULT false,
    "spamCheckResult" "SpamCheckResult" NOT NULL DEFAULT 'PENDING',
    "duplicateCheck" BOOLEAN NOT NULL DEFAULT false,
    "duplicateOfId" TEXT,
    "responseRequired" BOOLEAN NOT NULL DEFAULT true,
    "autoResponseSent" BOOLEAN NOT NULL DEFAULT false,
    "responseDue" TIMESTAMP(3),
    "responseSent" TIMESTAMP(3),
    "firstResponseTime" INTEGER,
    "priority" "ContactPriority" NOT NULL DEFAULT 'NORMAL',
    "assignedAgentId" TEXT,
    "assignedDepartment" "ContactDepartment" NOT NULL DEFAULT 'GENERAL',
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_forms_pkey" PRIMARY KEY ("id")
);

-- Create indexes for contact forms
CREATE UNIQUE INDEX "contact_forms_reference_number_key" ON "contact_forms"("referenceNumber");
CREATE INDEX "contact_forms_category_id_idx" ON "contact_forms"("categoryId");
CREATE INDEX "contact_forms_status_idx" ON "contact_forms"("status");
CREATE INDEX "contact_forms_priority_idx" ON "contact_forms"("priority");
CREATE INDEX "contact_forms_user_id_idx" ON "contact_forms"("userId");
CREATE INDEX "contact_forms_clinic_id_idx" ON "contact_forms"("clinicId");
CREATE INDEX "contact_forms_doctor_id_idx" ON "contact_forms"("doctorId");
CREATE INDEX "contact_forms_service_id_idx" ON "contact_forms"("serviceId");
CREATE INDEX "contact_forms_created_at_idx" ON "contact_forms"("createdAt");
CREATE INDEX "contact_forms_response_due_idx" ON "contact_forms"("responseDue");
CREATE INDEX "contact_forms_contact_email_idx" ON "contact_forms"("contactEmail");
CREATE INDEX "contact_forms_contact_phone_idx" ON "contact_forms"("contactPhone");

-- Detailed Enquiry Management Table
CREATE TABLE "enquiries" (
    "id" TEXT NOT NULL,
    "contactFormId" TEXT,
    "enquiryNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "enquiryType" "EnquiryType" NOT NULL,
    "status" "EnquiryStatus" NOT NULL DEFAULT 'NEW',
    "subStatus" TEXT,
    "resolutionStatus" "ResolutionStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "EnquiryPriority" NOT NULL DEFAULT 'NORMAL',
    "urgencyLevel" "UrgencyLevel" NOT NULL DEFAULT 'ROUTINE',
    "businessImpact" "BusinessImpact" NOT NULL DEFAULT 'LOW',
    "assignedAgentId" TEXT,
    "assignedTeam" "ContactTeam",
    "supervisorId" TEXT,
    "originalAssignee" TEXT,
    "department" "ContactDepartment" NOT NULL DEFAULT 'GENERAL',
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
    "integrationStatus" "IntegrationSyncStatus" NOT NULL DEFAULT 'PENDING',
    "syncData" JSONB NOT NULL DEFAULT '{}',
    "workflowStage" TEXT NOT NULL DEFAULT 'intake',
    "workflowData" JSONB NOT NULL DEFAULT '{}',
    "sourceChannel" "ContactSource" NOT NULL DEFAULT 'WEB_FORM',
    "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "assignedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "enquiries_pkey" PRIMARY KEY ("id")
);

-- Create indexes for enquiries
CREATE UNIQUE INDEX "enquiries_enquiry_number_key" ON "enquiries"("enquiryNumber");
CREATE INDEX "enquiries_category_id_idx" ON "enquiries"("categoryId");
CREATE INDEX "enquiries_status_idx" ON "enquiries"("status");
CREATE INDEX "enquiries_priority_idx" ON "enquiries"("priority");
CREATE INDEX "enquiries_assigned_agent_id_idx" ON "enquiries"("assignedAgentId");
CREATE INDEX "enquiries_assigned_team_idx" ON "enquiries"("assignedTeam");
CREATE INDEX "enquiries_user_id_idx" ON "enquiries"("userId");
CREATE INDEX "enquiries_clinic_id_idx" ON "enquiries"("clinicId");
CREATE INDEX "enquiries_doctor_id_idx" ON "enquiries"("doctorId");
CREATE INDEX "enquiries_service_id_idx" ON "enquiries"("serviceId");
CREATE INDEX "enquiries_created_at_idx" ON "enquiries"("createdAt");
CREATE INDEX "enquiries_resolved_at_idx" ON "enquiries"("resolvedAt");
CREATE INDEX "enquiries_follow_up_date_idx" ON "enquiries"("followUpDate");
CREATE INDEX "enquiries_sla_breached_idx" ON "enquiries"("slaBreached");
CREATE INDEX "enquiries_urgency_level_idx" ON "enquiries"("urgencyLevel");

-- Contact Assignment Management Table
CREATE TABLE "contact_assignments" (
    "id" TEXT NOT NULL,
    "enquiryId" TEXT NOT NULL,
    "contactFormId" TEXT,
    "assigneeType" "AssigneeType" NOT NULL,
    "assigneeId" TEXT,
    "assigneeName" TEXT NOT NULL,
    "assignmentReason" TEXT,
    "assignedBy" TEXT NOT NULL,
    "assignmentMethod" "AssignmentMethod" NOT NULL,
    "skillMatch" JSONB NOT NULL DEFAULT '{}',
    "status" "AssignmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "acceptedAt" TIMESTAMP(3),
    "declinedAt" TIMESTAMP(3),
    "declineReason" TEXT,
    "isReassignment" BOOLEAN NOT NULL DEFAULT false,
    "previousAssignee" TEXT,
    "reassignmentReason" TEXT,
    "currentWorkload" INTEGER NOT NULL DEFAULT 0,
    "workloadLimit" INTEGER,
    "assignmentScore" DOUBLE PRECISION,
    "responseTime" INTEGER,
    "resolutionTime" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_assignments_pkey" PRIMARY KEY ("id")
);

-- Create indexes for contact assignments
CREATE INDEX "contact_assignments_enquiry_id_idx" ON "contact_assignments"("enquiryId");
CREATE INDEX "contact_assignments_contact_form_id_idx" ON "contact_assignments"("contactFormId");
CREATE INDEX "contact_assignments_assignee_type_assignee_id_idx" ON "contact_assignments"("assigneeType", "assigneeId");
CREATE INDEX "contact_assignments_status_idx" ON "contact_assignments"("status");
CREATE INDEX "contact_assignments_assigned_by_idx" ON "contact_assignments"("assignedBy");
CREATE INDEX "contact_assignments_created_at_idx" ON "contact_assignments"("createdAt");

-- Contact History and Communication Trail Table
CREATE TABLE "contact_histories" (
    "id" TEXT NOT NULL,
    "enquiryId" TEXT NOT NULL,
    "contactFormId" TEXT,
    "actionType" "ContactActionType" NOT NULL,
    "actionDescription" TEXT NOT NULL,
    "actorType" "ActorType" NOT NULL,
    "actorId" TEXT,
    "actorName" TEXT NOT NULL,
    "actorEmail" TEXT,
    "fieldChanged" TEXT,
    "oldValue" TEXT,
    "newValue" TEXT,
    "changeReason" TEXT,
    "communicationType" "CommunicationType" NOT NULL,
    "messageContent" TEXT,
    "messageSubject" TEXT,
    "messageDirection" "MessageDirection" NOT NULL DEFAULT 'OUTBOUND',
    "externalSystem" TEXT,
    "externalReference" TEXT,
    "deliveryStatus" "DeliveryStatus",
    "timeSpent" INTEGER,
    "responseTime" INTEGER,
    "medicalRecord" BOOLEAN NOT NULL DEFAULT false,
    "containsPHI" BOOLEAN NOT NULL DEFAULT false,
    "hipaaCompliant" BOOLEAN NOT NULL DEFAULT false,
    "auditTrail" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_histories_pkey" PRIMARY KEY ("id")
);

-- Create indexes for contact histories
CREATE INDEX "contact_histories_enquiry_id_idx" ON "contact_histories"("enquiryId");
CREATE INDEX "contact_histories_contact_form_id_idx" ON "contact_histories"("contactFormId");
CREATE INDEX "contact_histories_action_type_idx" ON "contact_histories"("actionType");
CREATE INDEX "contact_histories_actor_type_actor_id_idx" ON "contact_histories"("actorType", "actorId");
CREATE INDEX "contact_histories_created_at_idx" ON "contact_histories"("createdAt");
CREATE INDEX "contact_histories_communication_type_idx" ON "contact_histories"("communicationType");

-- Contact Responses and Communication Table
CREATE TABLE "contact_responses" (
    "id" TEXT NOT NULL,
    "enquiryId" TEXT NOT NULL,
    "contactFormId" TEXT,
    "responseType" "ResponseType" NOT NULL,
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "senderType" "SenderType" NOT NULL,
    "senderId" TEXT,
    "senderName" TEXT NOT NULL,
    "senderEmail" TEXT,
    "senderSignature" TEXT,
    "recipientType" "RecipientType" NOT NULL,
    "recipientId" TEXT,
    "recipientName" TEXT NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "channel" "CommunicationChannel" NOT NULL,
    "channelReference" TEXT,
    "status" "ResponseStatus" NOT NULL DEFAULT 'DRAFT',
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "repliedAt" TIMESTAMP(3),
    "satisfactionRating" INTEGER,
    "qualityScore" DOUBLE PRECISION,
    "responseTime" INTEGER,
    "templateUsed" TEXT,
    "autoGenerated" BOOLEAN NOT NULL DEFAULT false,
    "automationRules" JSONB NOT NULL DEFAULT '[]',
    "medicalAdvice" BOOLEAN NOT NULL DEFAULT false,
    "disclaimerRequired" BOOLEAN NOT NULL DEFAULT false,
    "complianceChecked" BOOLEAN NOT NULL DEFAULT false,
    "privacyReviewed" BOOLEAN NOT NULL DEFAULT false,
    "attachments" JSONB NOT NULL DEFAULT '[]',
    "attachmentCount" INTEGER NOT NULL DEFAULT 0,
    "requiresFollowUp" BOOLEAN NOT NULL DEFAULT false,
    "followUpDate" TIMESTAMP(3),
    "followUpNotes" TEXT,
    "followUpCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_responses_pkey" PRIMARY KEY ("id")
);

-- Create indexes for contact responses
CREATE INDEX "contact_responses_enquiry_id_idx" ON "contact_responses"("enquiryId");
CREATE INDEX "contact_responses_contact_form_id_idx" ON "contact_responses"("contactFormId");
CREATE INDEX "contact_responses_response_type_idx" ON "contact_responses"("responseType");
CREATE INDEX "contact_responses_sender_type_sender_id_idx" ON "contact_responses"("senderType", "senderId");
CREATE INDEX "contact_responses_channel_idx" ON "contact_responses"("channel");
CREATE INDEX "contact_responses_status_idx" ON "contact_responses"("status");
CREATE INDEX "contact_responses_sent_at_idx" ON "contact_responses"("sentAt");
CREATE INDEX "contact_responses_recipient_email_idx" ON "contact_responses"("recipientEmail");

-- Contact Routing and Assignment Rules Table
CREATE TABLE "contact_routing" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "categoryId" TEXT,
    "criteria" JSONB NOT NULL DEFAULT '{}',
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "targetType" "RoutingTargetType" NOT NULL,
    "targetId" TEXT,
    "targetName" TEXT NOT NULL,
    "routingMethod" "RoutingMethod" NOT NULL DEFAULT 'DIRECT',
    "roundRobinGroup" TEXT,
    "skillRequirements" JSONB NOT NULL DEFAULT '[]',
    "checkAvailability" BOOLEAN NOT NULL DEFAULT true,
    "maxWorkload" INTEGER,
    "businessHoursOnly" BOOLEAN NOT NULL DEFAULT false,
    "timezone" TEXT,
    "fallbackEnabled" BOOLEAN NOT NULL DEFAULT false,
    "fallbackTarget" TEXT,
    "fallbackDelay" INTEGER,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "successRate" DOUBLE PRECISION,
    "avgResponseTime" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_routing_pkey" PRIMARY KEY ("id")
);

-- Create indexes for contact routing
CREATE UNIQUE INDEX "contact_routing_name_key" ON "contact_routing"("name");
CREATE INDEX "contact_routing_is_active_idx" ON "contact_routing"("isActive");
CREATE INDEX "contact_routing_priority_idx" ON "contact_routing"("priority");
CREATE INDEX "contact_routing_category_id_idx" ON "contact_routing"("categoryId");
CREATE INDEX "contact_routing_target_type_target_id_idx" ON "contact_routing"("targetType", "targetId");

-- Contact Escalation Management Table
CREATE TABLE "contact_escalations" (
    "id" TEXT NOT NULL,
    "enquiryId" TEXT NOT NULL,
    "escalationType" "EscalationType" NOT NULL,
    "escalationReason" TEXT NOT NULL,
    "triggeredBy" TEXT NOT NULL,
    "fromLevel" "EscalationLevel" NOT NULL,
    "toLevel" "EscalationLevel" NOT NULL,
    "levelData" JSONB NOT NULL DEFAULT '{}',
    "triggeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "triggeredByUser" TEXT,
    "escalatedToUser" TEXT,
    "escalatedToTeam" TEXT,
    "status" "EscalationStatus" NOT NULL DEFAULT 'ACTIVE',
    "resolutionNotes" TEXT,
    "customerNotified" BOOLEAN NOT NULL DEFAULT false,
    "slaImpact" JSONB NOT NULL DEFAULT '{}',
    "resolutionTime" INTEGER,
    "autoTriggered" BOOLEAN NOT NULL DEFAULT false,
    "automationRule" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_escalations_pkey" PRIMARY KEY ("id")
);

-- Create indexes for contact escalations
CREATE INDEX "contact_escalations_enquiry_id_idx" ON "contact_escalations"("enquiryId");
CREATE INDEX "contact_escalations_status_idx" ON "contact_escalations"("status");
CREATE INDEX "contact_escalations_triggered_at_idx" ON "contact_escalations"("triggeredAt");
CREATE INDEX "contact_escalations_escalated_to_user_idx" ON "contact_escalations"("escalatedToUser");

-- Contact Form Analytics Table
CREATE TABLE "contact_form_analytics" (
    "id" TEXT NOT NULL,
    "contactFormId" TEXT NOT NULL,
    "submissionTime" INTEGER NOT NULL DEFAULT 0,
    "fieldCompletionTime" JSONB NOT NULL DEFAULT '{}',
    "abandonRate" DOUBLE PRECISION,
    "completionRate" DOUBLE PRECISION,
    "userSatisfaction" DOUBLE PRECISION,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "correctionCount" INTEGER NOT NULL DEFAULT 0,
    "deviceType" "DeviceType",
    "browserType" TEXT,
    "referralSource" TEXT,
    "conversionFunnel" JSONB NOT NULL DEFAULT '{}',
    "messageSentiment" "SentimentScore" NOT NULL DEFAULT 'NEUTRAL',
    "urgencyDetected" BOOLEAN NOT NULL DEFAULT false,
    "spamScore" DOUBLE PRECISION,
    "apiResponseTime" INTEGER,
    "databaseQueryTime" INTEGER,
    "processingTime" INTEGER,
    "testVariant" TEXT,
    "testResults" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_form_analytics_pkey" PRIMARY KEY ("id")
);

-- Create index for contact form analytics
CREATE UNIQUE INDEX "contact_form_analytics_contact_form_id_key" ON "contact_form_analytics"("contactFormId");

-- Contact Enquiry Analytics Table
CREATE TABLE "contact_enquiry_analytics" (
    "id" TEXT NOT NULL,
    "enquiryId" TEXT NOT NULL,
    "totalResolutionTime" INTEGER,
    "firstResponseTime" INTEGER,
    "followUpCount" INTEGER NOT NULL DEFAULT 0,
    "communicationCount" INTEGER NOT NULL DEFAULT 0,
    "customerSatisfaction" DOUBLE PRECISION,
    "agentSatisfaction" DOUBLE PRECISION,
    "qualityScore" DOUBLE PRECISION,
    "resolutionEfficiency" DOUBLE PRECISION,
    "knowledgeBaseUsage" DOUBLE PRECISION,
    "escalationRate" DOUBLE PRECISION,
    "handlingCost" DOUBLE PRECISION,
    "agentTimeCost" DOUBLE PRECISION,
    "systemResourceCost" DOUBLE PRECISION,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "customerRetained" BOOLEAN,
    "repeatContact" BOOLEAN NOT NULL DEFAULT false,
    "lessonsLearned" TEXT,
    "improvementSuggestions" TEXT,
    "processImprovements" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_enquiry_analytics_pkey" PRIMARY KEY ("id")
);

-- Create index for contact enquiry analytics
CREATE UNIQUE INDEX "contact_enquiry_analytics_enquiry_id_key" ON "contact_enquiry_analytics"("enquiryId");

-- Contact Templates Table
CREATE TABLE "contact_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "category" "ContactTemplateCategory" NOT NULL,
    "usage" "TemplateUsage" NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "variables" JSONB NOT NULL DEFAULT '[]',
    "medicalAdvice" BOOLEAN NOT NULL DEFAULT false,
    "disclaimerRequired" BOOLEAN NOT NULL DEFAULT false,
    "complianceNote" TEXT,
    "personalizationEnabled" BOOLEAN NOT NULL DEFAULT true,
    "dynamicContent" BOOLEAN NOT NULL DEFAULT false,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_templates_pkey" PRIMARY KEY ("id")
);

-- Create indexes for contact templates
CREATE UNIQUE INDEX "contact_templates_name_key" ON "contact_templates"("name");
CREATE INDEX "contact_templates_category_idx" ON "contact_templates"("category");
CREATE INDEX "contact_templates_is_active_idx" ON "contact_templates"("isActive");
CREATE INDEX "contact_templates_usage_count_idx" ON "contact_templates"("usageCount");

-- Contact Knowledge Base Table
CREATE TABLE "contact_knowledge_base" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "relatedTopics" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "medicalSpecialty" TEXT,
    "applicableConditions" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "ageGroup" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "unhelpfulCount" INTEGER NOT NULL DEFAULT 0,
    "keywords" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "searchTerms" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "status" "KBStatus" NOT NULL DEFAULT 'ACTIVE',
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_knowledge_base_pkey" PRIMARY KEY ("id")
);

-- Create indexes for contact knowledge base
CREATE INDEX "contact_knowledge_base_category_idx" ON "contact_knowledge_base"("category");
CREATE INDEX "contact_knowledge_base_status_idx" ON "contact_knowledge_base"("status");
CREATE INDEX "contact_knowledge_base_medical_specialty_idx" ON "contact_knowledge_base"("medicalSpecialty");

-- ========================================
-- CREATE FOREIGN KEY RELATIONSHIPS
-- ========================================

-- Add foreign key constraints
ALTER TABLE "contact_form_templates" ADD CONSTRAINT "contact_form_templates_category_id_fkey" FOREIGN KEY ("categoryId") REFERENCES "contact_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "contact_forms" ADD CONSTRAINT "contact_forms_category_id_fkey" FOREIGN KEY ("categoryId") REFERENCES "contact_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "contact_forms" ADD CONSTRAINT "contact_forms_template_id_fkey" FOREIGN KEY ("templateId") REFERENCES "contact_form_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "contact_forms" ADD CONSTRAINT "contact_forms_user_id_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "contact_forms" ADD CONSTRAINT "contact_forms_clinic_id_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "contact_forms" ADD CONSTRAINT "contact_forms_doctor_id_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "contact_forms" ADD CONSTRAINT "contact_forms_service_id_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_contact_form_id_fkey" FOREIGN KEY ("contactFormId") REFERENCES "contact_forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_category_id_fkey" FOREIGN KEY ("categoryId") REFERENCES "contact_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_user_id_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_clinic_id_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_doctor_id_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_service_id_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "contact_assignments" ADD CONSTRAINT "contact_assignments_enquiry_id_fkey" FOREIGN KEY ("enquiryId") REFERENCES "enquiries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "contact_assignments" ADD CONSTRAINT "contact_assignments_contact_form_id_fkey" FOREIGN KEY ("contactFormId") REFERENCES "contact_forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "contact_histories" ADD CONSTRAINT "contact_histories_enquiry_id_fkey" FOREIGN KEY ("enquiryId") REFERENCES "enquiries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "contact_histories" ADD CONSTRAINT "contact_histories_contact_form_id_fkey" FOREIGN KEY ("contactFormId") REFERENCES "contact_forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "contact_responses" ADD CONSTRAINT "contact_responses_enquiry_id_fkey" FOREIGN KEY ("enquiryId") REFERENCES "enquiries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "contact_responses" ADD CONSTRAINT "contact_responses_contact_form_id_fkey" FOREIGN KEY ("contactFormId") REFERENCES "contact_forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "contact_escalations" ADD CONSTRAINT "contact_escalations_enquiry_id_fkey" FOREIGN KEY ("enquiryId") REFERENCES "enquiries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "contact_form_analytics" ADD CONSTRAINT "contact_form_analytics_contact_form_id_fkey" FOREIGN KEY ("contactFormId") REFERENCES "contact_forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "contact_enquiry_analytics" ADD CONSTRAINT "contact_enquiry_analytics_enquiry_id_fkey" FOREIGN KEY ("enquiryId") REFERENCES "enquiries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ========================================
-- CREATE UNIQUE CONSTRAINTS
-- ========================================

-- Add unique constraints
ALTER TABLE "contact_form_templates" ADD CONSTRAINT "contact_form_templates_category_id_name_key" UNIQUE ("categoryId", "name");
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_contact_form_id_key" UNIQUE ("contactFormId");

-- ========================================
-- CREATE PERFORMANCE INDEXES
-- ========================================

-- Performance optimization indexes for contact system
-- These optimize the most frequent contact and enquiry operations

-- Contact form submission optimization
-- Optimizes: Find recent contact forms by status and priority
-- Usage: Contact dashboard, form queue management
CREATE INDEX "contact_forms_status_priority_created_idx" ON "contact_forms"("status", "priority", "createdAt");
CREATE INDEX "contact_forms_category_status_created_idx" ON "contact_forms"("categoryId", "status", "createdAt");

-- Enquiry resolution optimization
-- Optimizes: Find enquiries by status and resolution time
-- Usage: Enquiry queue, SLA monitoring
CREATE INDEX "enquiries_status_assigned_agent_resolved_idx" ON "enquiries"("status", "assignedAgentId", "resolvedAt");
CREATE INDEX "enquiries_category_priority_created_idx" ON "enquiries"("categoryId", "priority", "createdAt");

-- Healthcare-specific optimization
-- Optimizes: Find enquiries related to specific healthcare entities
-- Usage: Clinic-specific support, doctor feedback, service issues
CREATE INDEX "enquiries_clinic_doctor_service_created_idx" ON "enquiries"("clinicId", "doctorId", "serviceId", "createdAt");
CREATE INDEX "contact_forms_clinic_doctor_service_status_idx" ON "contact_forms"("clinicId", "doctorId", "serviceId", "status");

-- Assignment optimization
-- Optimizes: Find current assignments by assignee
-- Usage: Agent workload management, assignment tracking
CREATE INDEX "contact_assignments_assignee_status_created_idx" ON "contact_assignments"("assigneeType", "assigneeId", "status", "createdAt");
CREATE INDEX "contact_assignments_enquiry_status_assigned_idx" ON "contact_assignments"("enquiryId", "status", "assignedBy");

-- Response tracking optimization
-- Optimizes: Find responses by channel and status
-- Usage: Communication monitoring, response quality tracking
CREATE INDEX "contact_responses_channel_status_sent_idx" ON "contact_responses"("channel", "status", "sentAt");
CREATE INDEX "contact_responses_enquiry_status_created_idx" ON "contact_responses"("enquiryId", "status", "createdAt");

-- Escalation optimization
-- Optimizes: Find active escalations and their resolution
-- Usage: Escalation management, SLA breach handling
CREATE INDEX "contact_escalations_enquiry_status_triggered_idx" ON "contact_escalations"("enquiryId", "status", "triggeredAt");
CREATE INDEX "contact_escalations_to_level_status_resolved_idx" ON "contact_escalations"("toLevel", "status", "resolvedAt");

-- Analytics optimization
-- Optimizes: Contact form and enquiry analytics queries
-- Usage: Performance monitoring, quality assessment
CREATE INDEX "contact_form_analytics_submission_time_user_satisfaction_idx" ON "contact_form_analytics"("submissionTime", "userSatisfaction");
CREATE INDEX "contact_enquiry_analytics_resolution_time_satisfaction_idx" ON "contact_enquiry_analytics"("totalResolutionTime", "customerSatisfaction");

-- Follow-up optimization
-- Optimizes: Find enquiries requiring follow-up
-- Usage: Follow-up scheduling, customer retention
CREATE INDEX "enquiries_follow_up_required_date_status_idx" ON "enquiries"("followUpRequired", "followUpDate", "status");
CREATE INDEX "enquiries_requires_follow_up_completed_idx" ON "enquiries"("requiresFollowUp", "followUpCompleted");

-- Healthcare compliance optimization
-- Optimizes: Find healthcare-related enquiries for compliance review
-- Usage: Medical review queue, compliance monitoring
CREATE INDEX "enquiries_medical_review_compliance_review_status_idx" ON "enquiries"("medicalReview", "complianceReview", "status");
CREATE INDEX "contact_forms_medical_information_priority_status_idx" ON "contact_forms"("medicalInformation", "priority", "status");

-- SLA monitoring optimization
-- Optimizes: Monitor SLA compliance and breaches
-- Usage: SLA reporting, performance monitoring
CREATE INDEX "enquiries_sla_breached_created_priority_idx" ON "enquiries"("slaBreached", "createdAt", "priority");
CREATE INDEX "contact_forms_response_due_priority_status_idx" ON "contact_forms"("responseDue", "priority", "status");

-- Search and filtering optimization
-- Optimizes: Contact and enquiry search with multiple filters
-- Usage: Advanced search, filtering in admin interfaces
CREATE INDEX "contact_forms_contact_email_contact_phone_created_idx" ON "contact_forms"("contactEmail", "contactPhone", "createdAt");
CREATE INDEX "enquiries_user_assigned_team_created_idx" ON "enquiries"("userId", "assignedTeam", "createdAt");

-- Time-based optimization
-- Optimizes: Recent activity and trend analysis
-- Usage: Dashboard metrics, trend reporting
CREATE INDEX "contact_histories_created_action_type_actor_idx" ON "contact_histories"("createdAt", "actionType", "actorType");
CREATE INDEX "contact_responses_sent_recipient_satisfaction_idx" ON "contact_responses"("sentAt", "recipientEmail", "satisfactionRating");

-- Integration optimization
-- Optimizes: External system integration queries
-- Usage: Integration monitoring, sync status tracking
CREATE INDEX "enquiries_external_reference_integration_status_created_idx" ON "enquiries"("externalReference", "integrationStatus", "createdAt");

-- ========================================
-- INSERT INITIAL DATA
-- ========================================

-- Insert default contact categories
INSERT INTO "contact_categories" ("id", "name", "displayName", "description", "requiresAuth", "requiresVerification", "priority", "department", "responseSLAHours", "resolutionSLADays", "isActive", "sortOrder") VALUES
  ('gen-cat-001', 'general', 'General Enquiries', 'General questions about services, clinic information, and basic healthcare inquiries', false, false, 'STANDARD', 'GENERAL', 24, 7, true, 1),
  ('app-cat-001', 'appointment', 'Appointment Related', 'Questions and issues related to appointment booking, rescheduling, and management', false, false, 'HIGH', 'APPOINTMENTS', 4, 2, true, 2),
  ('hs-cat-001', 'healthier_sg', 'Healthier SG Program', 'Healthier SG enrollment, benefits, and program-related enquiries', true, true, 'HIGH', 'HEALTHIER_SG', 8, 3, true, 3),
  ('urg-cat-001', 'urgent', 'Urgent Care', 'Urgent healthcare issues and emergency-related enquiries', false, true, 'URGENT', 'EMERGENCY', 1, 1, true, 4),
  ('tech-cat-001', 'technical_support', 'Technical Support', 'Technical issues with the platform, login problems, and system-related issues', false, false, 'NORMAL', 'TECHNICAL_SUPPORT', 8, 5, true, 5);

-- Insert default contact templates
INSERT INTO "contact_templates" ("id", "name", "displayName", "description", "category", "usage", "language", "subject", "content", "isActive") VALUES
  ('tmpl-ack-001', 'general_acknowledgment', 'General Acknowledgment', 'Auto-response for general enquiries', 'ACKNOWLEDGMENT', 'AUTOMATIC', 'en', 'We received your enquiry', 'Thank you for contacting us. We have received your enquiry and will respond within 24 hours.', true),
  ('tmpl-ack-002', 'appointment_acknowledgment', 'Appointment Acknowledgment', 'Auto-response for appointment-related enquiries', 'ACKNOWLEDGMENT', 'AUTOMATIC', 'en', 'Appointment Enquiry Received', 'Thank you for your appointment enquiry. Our appointment team will respond within 4 hours.', true),
  ('tmpl-ack-003', 'healthier_sg_acknowledgment', 'Healthier SG Acknowledgment', 'Auto-response for Healthier SG enquiries', 'ACKNOWLEDGMENT', 'AUTOMATIC', 'en', 'Healthier SG Enquiry Received', 'Thank you for your Healthier SG enquiry. Our specialist team will respond within 8 hours.', true),
  ('tmpl-res-001', 'general_resolution', 'General Resolution', 'Template for resolving general enquiries', 'RESOLUTION', 'MANUAL', 'en', 'Your enquiry has been resolved', 'We have addressed your enquiry. Please let us know if you need any further assistance.', true),
  ('tmpl-esc-001', 'escalation_notification', 'Escalation Notification', 'Template for escalation notifications', 'ESCALATION', 'TRIGGERED', 'en', 'Enquiry Escalated', 'Your enquiry has been escalated to a specialist for further assistance.', true);

-- Insert default knowledge base articles
INSERT INTO "contact_knowledge_base" ("id", "title", "content", "category", "tags", "medicalSpecialty", "applicableConditions", "keywords", "status") VALUES
  ('kb-001', 'How to Book an Appointment', 'Learn how to book appointments through our platform. You can book online, call, or walk in.', 'APPOINTMENTS', ARRAY['booking', 'appointment', 'schedule'], 'GENERAL', ARRAY['all'], ARRAY['appointment', 'booking', 'schedule'], 'ACTIVE'),
  ('kb-002', 'Healthier SG Program Benefits', 'Information about Healthier SG program benefits and eligibility criteria.', 'HEALTHIER_SG', ARRAY['healthier_sg', 'benefits', 'eligibility'], 'PREVENTIVE_CARE', ARRAY['chronic_diseases', 'lifestyle'], ARRAY['healthier_sg', 'benefits', 'eligibility'], 'ACTIVE'),
  ('kb-003', 'Emergency Contact Information', 'Emergency contact numbers and procedures for urgent healthcare needs.', 'EMERGENCY', ARRAY['emergency', 'urgent', 'contact'], 'EMERGENCY_MEDICINE', ARRAY['emergency'], ARRAY['emergency', 'urgent', 'contact'], 'ACTIVE'),
  ('kb-004', 'Technical Support Guide', 'Common technical issues and their solutions for platform users.', 'TECHNICAL', ARRAY['technical', 'support', 'troubleshooting'], 'GENERAL', ARRAY['all'], ARRAY['technical', 'support', 'troubleshooting'], 'ACTIVE'),
  ('kb-005', 'Medical Information Privacy', 'Information about how we protect your medical information and comply with privacy regulations.', 'PRIVACY', ARRAY['privacy', 'medical', 'data'], 'GENERAL', ARRAY['all'], ARRAY['privacy', 'medical', 'data'], 'ACTIVE');

-- ========================================
-- CREATE VIEWS FOR REPORTING
-- ========================================

-- Create a view for contact form statistics
CREATE VIEW "contact_form_stats" AS
SELECT 
  cc.name as category_name,
  cc.display_name as category_display_name,
  COUNT(cf.id) as total_forms,
  COUNT(CASE WHEN cf.status = 'SUBMITTED' THEN 1 END) as submitted_count,
  COUNT(CASE WHEN cf.status = 'RESOLVED' THEN 1 END) as resolved_count,
  COUNT(CASE WHEN cf.status = 'ESCALATED' THEN 1 END) as escalated_count,
  AVG(cfa.submission_time) as avg_submission_time,
  AVG(cfa.user_satisfaction) as avg_user_satisfaction
FROM "contact_categories" cc
LEFT JOIN "contact_forms" cf ON cc.id = cf."categoryId"
LEFT JOIN "contact_form_analytics" cfa ON cf.id = cfa."contactFormId"
WHERE cc.is_active = true
GROUP BY cc.id, cc.name, cc.display_name, cc.sort_order
ORDER BY cc.sort_order;

-- Create a view for enquiry resolution metrics
CREATE VIEW "enquiry_resolution_metrics" AS
SELECT 
  cc.name as category_name,
  COUNT(e.id) as total_enquiries,
  COUNT(CASE WHEN e.status = 'NEW' THEN 1 END) as new_enquiries,
  COUNT(CASE WHEN e.status = 'RESOLVED' THEN 1 END) as resolved_enquiries,
  COUNT(CASE WHEN e.status = 'ESCALATED' THEN 1 END) as escalated_enquiries,
  COUNT(CASE WHEN e.sla_breached = true THEN 1 END) as sla_breaches,
  AVG(cea.total_resolution_time) as avg_resolution_time,
  AVG(cea.customer_satisfaction) as avg_customer_satisfaction,
  AVG(cea.follow_up_count) as avg_follow_up_count
FROM "contact_categories" cc
LEFT JOIN "enquiries" e ON cc.id = e."categoryId"
LEFT JOIN "contact_enquiry_analytics" cea ON e.id = cea."enquiryId"
WHERE cc.is_active = true
GROUP BY cc.id, cc.name, cc.sort_order
ORDER BY cc.sort_order;

-- ========================================
-- CREATE FUNCTIONS FOR CONTACT SYSTEM
-- ========================================

-- Function to generate contact form reference number
CREATE OR REPLACE FUNCTION generate_contact_form_reference()
RETURNS TEXT AS $$
DECLARE
    ref_number TEXT;
    counter INTEGER;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(reference_number, 10) AS INTEGER)), 0) + 1
    INTO counter
    FROM "contact_forms"
    WHERE reference_number LIKE 'CF' || TO_CHAR(NOW(), 'YYYYMMDD') || '%';
    
    ref_number := 'CF' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(counter::TEXT, 4, '0');
    
    RETURN ref_number;
END;
$$ LANGUAGE plpgsql;

-- Function to generate enquiry number
CREATE OR REPLACE FUNCTION generate_enquiry_number()
RETURNS TEXT AS $$
DECLARE
    ref_number TEXT;
    counter INTEGER;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(enquiry_number, 9) AS INTEGER)), 0) + 1
    INTO counter
    FROM "enquiries"
    WHERE enquiry_number LIKE 'ENQ' || TO_CHAR(NOW(), 'YYYYMMDD') || '%';
    
    ref_number := 'ENQ' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(counter::TEXT, 4, '0');
    
    RETURN ref_number;
END;
$$ LANGUAGE plpgsql;

-- Function to update contact form analytics
CREATE OR REPLACE FUNCTION update_contact_form_analytics(
    p_contact_form_id TEXT,
    p_submission_time INTEGER DEFAULT 0,
    p_user_satisfaction FLOAT DEFAULT NULL,
    p_error_count INTEGER DEFAULT 0,
    p_device_type "DeviceType" DEFAULT NULL,
    p_browser_type TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO "contact_form_analytics" (
        "contactFormId",
        "submissionTime",
        "userSatisfaction",
        "errorCount",
        "deviceType",
        "browserType"
    ) VALUES (
        p_contact_form_id,
        p_submission_time,
        p_user_satisfaction,
        p_error_count,
        p_device_type,
        p_browser_type
    )
    ON CONFLICT ("contactFormId") 
    DO UPDATE SET
        "submissionTime" = p_submission_time,
        "userSatisfaction" = COALESCE(p_user_satisfaction, contact_form_analytics."userSatisfaction"),
        "errorCount" = p_error_count,
        "deviceType" = COALESCE(p_device_type, contact_form_analytics."deviceType"),
        "browserType" = COALESCE(p_browser_type, contact_form_analytics."browserType"),
        "updatedAt" = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Function to create enquiry from contact form
CREATE OR REPLACE FUNCTION create_enquiry_from_contact_form(p_contact_form_id TEXT)
RETURNS TEXT AS $$
DECLARE
    v_enquiry_id TEXT;
    v_enquiry_number TEXT;
    v_category_id TEXT;
    v_title TEXT;
    v_description TEXT;
    v_enquiry_type "EnquiryType";
BEGIN
    -- Get contact form details
    SELECT 
        cf."categoryId",
        cf.subject,
        cf.message,
        CASE 
            WHEN cc.name = 'appointment' THEN 'APPOINTMENT_RELATED'::"EnquiryType"
            WHEN cc.name = 'healthier_sg' THEN 'INFORMATIONAL'::"EnquiryType"
            WHEN cc.name = 'urgent' THEN 'SUPPORT_REQUEST'::"EnquiryType"
            WHEN cc.name = 'technical_support' THEN 'TECHNICAL_ISSUE'::"EnquiryType"
            ELSE 'INFORMATIONAL'::"EnquiryType"
        END
    INTO v_category_id, v_title, v_description, v_enquiry_type
    FROM "contact_forms" cf
    JOIN "contact_categories" cc ON cf."categoryId" = cc.id
    WHERE cf.id = p_contact_form_id;
    
    -- Generate enquiry number
    v_enquiry_number := generate_enquiry_number();
    
    -- Create enquiry
    INSERT INTO "enquiries" (
        "contactFormId",
        "enquiryNumber",
        "title",
        "categoryId",
        "enquiryType",
        "description",
        "initialInquiry"
    ) VALUES (
        p_contact_form_id,
        v_enquiry_number,
        v_title,
        v_category_id,
        v_enquiry_type,
        v_description,
        v_description
    ) RETURNING id INTO v_enquiry_id;
    
    -- Update contact form status
    UPDATE "contact_forms" 
    SET status = 'UNDER_REVIEW'
    WHERE id = p_contact_form_id;
    
    RETURN v_enquiry_id;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- CREATE TRIGGERS FOR CONTACT SYSTEM
-- ========================================

-- Trigger to auto-generate reference number for contact forms
CREATE OR REPLACE FUNCTION auto_generate_contact_form_reference()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW."referenceNumber" IS NULL OR NEW."referenceNumber" = '' THEN
        NEW."referenceNumber" := generate_contact_form_reference();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "contact_form_reference_trigger"
    BEFORE INSERT ON "contact_forms"
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_contact_form_reference();

-- Trigger to auto-create enquiry from contact form
CREATE OR REPLACE FUNCTION auto_create_enquiry_from_contact_form()
RETURNS TRIGGER AS $$
DECLARE
    v_enquiry_id TEXT;
BEGIN
    -- Only create enquiry if one doesn't exist and form is submitted
    IF NEW."enquiryId" IS NULL AND NEW.status = 'SUBMITTED' THEN
        v_enquiry_id := create_enquiry_from_contact_form(NEW.id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "auto_enquiry_creation_trigger"
    AFTER UPDATE ON "contact_forms"
    FOR EACH ROW
    EXECUTE FUNCTION auto_create_enquiry_from_contact_form();

-- Trigger to update contact form analytics on form completion
CREATE OR REPLACE FUNCTION update_form_analytics_on_completion()
RETURNS TRIGGER AS $$
BEGIN
    -- Update analytics when form is marked as resolved
    IF NEW.status = 'RESOLVED' AND OLD.status != 'RESOLVED' THEN
        -- This would typically be called from the application layer
        -- with actual form completion metrics
        NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to log status changes
CREATE OR REPLACE FUNCTION log_contact_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Log status changes to contact history
    IF OLD.status != NEW.status THEN
        INSERT INTO "contact_histories" (
            "enquiryId",
            "actionType",
            "actionDescription",
            "actorType",
            "actorName",
            "fieldChanged",
            "oldValue",
            "newValue"
        ) VALUES (
            NEW.id,
            'STATUS_CHANGED'::"ContactActionType",
            'Status changed from ' || OLD.status || ' to ' || NEW.status,
            'SYSTEM'::"ActorType",
            'System',
            'status',
            OLD.status::TEXT,
            NEW.status::TEXT
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "contact_status_logging_trigger"
    AFTER UPDATE ON "enquiries"
    FOR EACH ROW
    EXECUTE FUNCTION log_contact_status_change();

-- ========================================
-- GRANT PERMISSIONS AND SECURITY
-- ========================================

-- Note: In production, specific role-based permissions should be implemented
-- This is a basic structure for the contact system migration

-- Create indexes for RLS (Row Level Security) if implemented
-- These would be used in production for secure multi-tenant access

-- ========================================
-- MIGRATION COMPLETION
-- ========================================

-- Update the schema version
INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs) 
VALUES (
    '20251104212943',
    'contact_system_comprehensive_schema',
    CURRENT_TIMESTAMP,
    '20251104212943_contact_system_comprehensive_schema',
    'Contact & Enquiry Management System migration completed successfully'
);

-- Comment to indicate successful migration
COMMENT ON SCHEMA public IS 'Contact & Enquiry Management System - Sub-Phase 9.1 - Migration completed on 2025-11-04 21:29:43';
