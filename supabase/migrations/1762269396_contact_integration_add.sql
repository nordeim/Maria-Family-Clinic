-- Migration: contact_integration_add
-- Created at: 1762269396

-- ========================================
-- CONTACT SYSTEM INTEGRATION MIGRATION
-- Sub-Phase 9.9: Integration with Existing My Family Clinic Features
-- Adds contact integration tables and indexes
-- ========================================

-- Create UserContactPreferences table
CREATE TABLE "user_contact_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "preferredContactMethod" "ContactMethod" NOT NULL DEFAULT 'EMAIL',
    "secondaryContactMethod" "ContactMethod",
    "emergencyContactMethod" "ContactMethod" NOT NULL DEFAULT 'PHONE',
    "allowDirectContact" BOOLEAN NOT NULL DEFAULT true,
    "allowEmailMarketing" BOOLEAN NOT NULL DEFAULT false,
    "allowSmsUpdates" BOOLEAN NOT NULL DEFAULT true,
    "allowPhoneCalls" BOOLEAN NOT NULL DEFAULT false,
    "allowWhatsAppUpdates" BOOLEAN NOT NULL DEFAULT false,
    "contactAllowedFrom" TEXT,
    "contactAllowedTo" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Singapore',
    "doNotDisturb" BOOLEAN NOT NULL DEFAULT false,
    "medicalUpdatesViaEmail" BOOLEAN NOT NULL DEFAULT true,
    "appointmentReminders" BOOLEAN NOT NULL DEFAULT true,
    "healthGoalReminders" BOOLEAN NOT NULL DEFAULT true,
    "programEnrollmentUpdates" BOOLEAN NOT NULL DEFAULT true,
    "emergencyNotifications" BOOLEAN NOT NULL DEFAULT true,
    "preferredFollowUpTime" INTEGER,
    "contactHistoryAccess" BOOLEAN NOT NULL DEFAULT true,
    "shareContactWithPartners" BOOLEAN NOT NULL DEFAULT false,
    "dataRetentionPeriod" INTEGER NOT NULL DEFAULT 365,
    "contactDataEncrypted" BOOLEAN NOT NULL DEFAULT true,
    "thirdPartySharing" BOOLEAN NOT NULL DEFAULT false,
    "marketingTracking" BOOLEAN NOT NULL DEFAULT false,
    "healthierSgNotifications" BOOLEAN NOT NULL DEFAULT true,
    "healthierSgContactPreferences" JSONB NOT NULL DEFAULT '{}',
    "appointmentRelatedContact" BOOLEAN NOT NULL DEFAULT true,
    "serviceRelatedContact" BOOLEAN NOT NULL DEFAULT true,
    "programEnrollmentContact" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "user_contact_preferences_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraint
ALTER TABLE "user_contact_preferences" ADD CONSTRAINT "user_contact_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create UserContactHistory table
CREATE TABLE "user_contact_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contactFormId" TEXT,
    "enquiryId" TEXT,
    "appointmentId" TEXT,
    "serviceId" TEXT,
    "clinicId" TEXT,
    "doctorId" TEXT,
    "contactType" "ContactType" NOT NULL,
    "contactCategory" TEXT,
    "purpose" TEXT NOT NULL,
    "method" "ContactMethod" NOT NULL,
    "subject" TEXT,
    "summary" TEXT,
    "outcome" TEXT,
    "followUpRequired" BOOLEAN NOT NULL DEFAULT false,
    "followUpDate" TIMESTAMP(3),
    "followUpCompleted" BOOLEAN NOT NULL DEFAULT false,
    "followUpNotes" TEXT,
    "status" "ContactHistoryStatus" NOT NULL DEFAULT 'ACTIVE',
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "satisfaction" INTEGER,
    "notes" TEXT,
    "relatedHealthData" JSONB NOT NULL DEFAULT '{}',
    "medicalRelevance" BOOLEAN NOT NULL DEFAULT false,
    "prescriptionMentioned" BOOLEAN NOT NULL DEFAULT false,
    "encryptedContent" BOOLEAN NOT NULL DEFAULT true,
    "accessLevel" "ContactAccessLevel" NOT NULL DEFAULT 'STANDARD',
    "auditRequired" BOOLEAN NOT NULL DEFAULT true,
    "responseTime" INTEGER,
    "resolutionTime" INTEGER,
    "cost" DOUBLE PRECISION,
    "qualityScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "user_contact_history_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraints
ALTER TABLE "user_contact_history" ADD CONSTRAINT "user_contact_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_contact_history" ADD CONSTRAINT "user_contact_history_contactFormId_fkey" FOREIGN KEY ("contactFormId") REFERENCES "contact_forms"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "user_contact_history" ADD CONSTRAINT "user_contact_history_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "enquiries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create ClinicContactIntegration table
CREATE TABLE "clinic_contact_integration" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "enableContactForm" BOOLEAN NOT NULL DEFAULT true,
    "autoAssignContact" BOOLEAN NOT NULL DEFAULT true,
    "contactFormCategories" JSONB NOT NULL DEFAULT '[]',
    "showPhoneButton" BOOLEAN NOT NULL DEFAULT true,
    "showEmailButton" BOOLEAN NOT NULL DEFAULT true,
    "showWhatsAppButton" BOOLEAN NOT NULL DEFAULT false,
    "showWalkInOption" BOOLEAN NOT NULL DEFAULT true,
    "emergencyContactEnabled" BOOLEAN NOT NULL DEFAULT true,
    "emergencyPhone" TEXT,
    "emergencyHours" JSONB NOT NULL DEFAULT '{}',
    "urgentMessageTemplate" TEXT,
    "appointmentQueriesEnabled" BOOLEAN NOT NULL DEFAULT true,
    "appointmentPhone" TEXT,
    "appointmentEmail" TEXT,
    "appointmentHours" JSONB NOT NULL DEFAULT '{}',
    "serviceContactEnabled" BOOLEAN NOT NULL DEFAULT true,
    "serviceContactMethods" JSONB NOT NULL DEFAULT '[]',
    "specialistDirectContact" BOOLEAN NOT NULL DEFAULT false,
    "healthierSgContactEnabled" BOOLEAN NOT NULL DEFAULT true,
    "healthierSgContactMethods" JSONB NOT NULL DEFAULT '[]',
    "healthierSgHotline" TEXT,
    "healthierSgEmail" TEXT,
    "responseTimeCommitments" JSONB NOT NULL DEFAULT '{}',
    "businessHours" JSONB NOT NULL DEFAULT '{}',
    "languageSupport" TEXT[] NOT NULL DEFAULT ARRAY['en','zh','ms','ta'],
    "customFields" JSONB NOT NULL DEFAULT '[]',
    "mandatoryFields" JSONB NOT NULL DEFAULT '[]',
    "fileUploadEnabled" BOOLEAN NOT NULL DEFAULT true,
    "maxFileSize" INTEGER NOT NULL DEFAULT 5242880,
    "allowedFileTypes" TEXT[] NOT NULL DEFAULT ARRAY['pdf','jpg','png','doc','docx'],
    "contactTrackingEnabled" BOOLEAN NOT NULL DEFAULT true,
    "conversionGoals" JSONB NOT NULL DEFAULT '[]',
    "performanceMetrics" JSONB NOT NULL DEFAULT '{}',
    "crmIntegrationEnabled" BOOLEAN NOT NULL DEFAULT false,
    "crmSystem" TEXT,
    "crmConfig" JSONB NOT NULL DEFAULT '{}',
    "webhookEndpoints" JSONB NOT NULL DEFAULT '[]',
    "primaryContactPerson" TEXT,
    "contactTeam" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "escalationRules" JSONB NOT NULL DEFAULT '[]',
    "autoResponseEnabled" BOOLEAN NOT NULL DEFAULT true,
    "contactDataRetentionDays" INTEGER NOT NULL DEFAULT 730,
    "encryptionRequired" BOOLEAN NOT NULL DEFAULT true,
    "pdpaCompliance" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "clinic_contact_integration_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraint
ALTER TABLE "clinic_contact_integration" ADD CONSTRAINT "clinic_contact_integration_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create DoctorContactIntegration table
CREATE TABLE "doctor_contact_integration" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "allowPatientContact" BOOLEAN NOT NULL DEFAULT true,
    "contactMethodPreferences" JSONB NOT NULL DEFAULT '[]',
    "preferredContactTimes" JSONB NOT NULL DEFAULT '{}',
    "patientEmailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "patientPhoneEnabled" BOOLEAN NOT NULL DEFAULT false,
    "patientWhatsAppEnabled" BOOLEAN NOT NULL DEFAULT false,
    "patientPortalEnabled" BOOLEAN NOT NULL DEFAULT true,
    "emergencyContactEnabled" BOOLEAN NOT NULL DEFAULT true,
    "emergencyPhone" TEXT,
    "emergencyAfterHours" BOOLEAN NOT NULL DEFAULT false,
    "urgentMessageResponse" TEXT,
    "appointmentQueries" BOOLEAN NOT NULL DEFAULT true,
    "serviceInquiries" BOOLEAN NOT NULL DEFAULT true,
    "secondOpinionRequests" BOOLEAN NOT NULL DEFAULT false,
    "medicalRecordsRequests" BOOLEAN NOT NULL DEFAULT true,
    "specialtyContactRules" JSONB NOT NULL DEFAULT '[]',
    "conditionSpecificContact" JSONB NOT NULL DEFAULT '[]',
    "procedureRelatedContact" BOOLEAN NOT NULL DEFAULT true,
    "healthierSgEnrollmentSupport" BOOLEAN NOT NULL DEFAULT true,
    "healthierSgContactEnabled" BOOLEAN NOT NULL DEFAULT false,
    "healthierSgHotline" TEXT,
    "professionalReferrals" BOOLEAN NOT NULL DEFAULT true,
    "colleagueConsultation" BOOLEAN NOT NULL DEFAULT false,
    "medicalEducationRequests" BOOLEAN NOT NULL DEFAULT false,
    "responseTimeCommitments" JSONB NOT NULL DEFAULT '{}',
    "consultationAvailability" JSONB NOT NULL DEFAULT '[]',
    "languageSupport" TEXT[] NOT NULL DEFAULT ARRAY['en','zh','ms','ta'],
    "enableContactForm" BOOLEAN NOT NULL DEFAULT true,
    "autoResponseTemplates" JSONB NOT NULL DEFAULT '[]',
    "contactCategorization" JSONB NOT NULL DEFAULT '[]',
    "patientDataHandling" JSONB NOT NULL DEFAULT '{}',
    "medicalRecordRequests" BOOLEAN NOT NULL DEFAULT true,
    "medicalRecordResponseTime" INTEGER,
    "telemedicineContact" BOOLEAN NOT NULL DEFAULT true,
    "videoConsultationContact" BOOLEAN NOT NULL DEFAULT false,
    "digitalPrescriptionContact" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "doctor_contact_integration_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraint
ALTER TABLE "doctor_contact_integration" ADD CONSTRAINT "doctor_contact_integration_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create ServiceContactIntegration table
CREATE TABLE "service_contact_integration" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "enableServiceContact" BOOLEAN NOT NULL DEFAULT true,
    "contactMethods" JSONB NOT NULL DEFAULT '[]',
    "specialistContact" BOOLEAN NOT NULL DEFAULT false,
    "generalContact" BOOLEAN NOT NULL DEFAULT true,
    "preAppointmentContact" BOOLEAN NOT NULL DEFAULT true,
    "preparationQuestions" BOOLEAN NOT NULL DEFAULT true,
    "requirementsInquiry" BOOLEAN NOT NULL DEFAULT true,
    "pricingQueries" BOOLEAN NOT NULL DEFAULT true,
    "followUpQueries" BOOLEAN NOT NULL DEFAULT true,
    "resultsDiscussion" BOOLEAN NOT NULL DEFAULT true,
    "complicationReporting" BOOLEAN NOT NULL DEFAULT true,
    "satisfactionFeedback" BOOLEAN NOT NULL DEFAULT true,
    "medicalHistoryInquiry" BOOLEAN NOT NULL DEFAULT true,
    "riskAssessmentContact" BOOLEAN NOT NULL DEFAULT false,
    "contraindicationQueries" BOOLEAN NOT NULL DEFAULT true,
    "alternativeOptions" BOOLEAN NOT NULL DEFAULT true,
    "healthierSgCoverageInquiry" BOOLEAN NOT NULL DEFAULT true,
    "healthierSgProcessSupport" BOOLEAN NOT NULL DEFAULT true,
    "subsidyInformation" BOOLEAN NOT NULL DEFAULT true,
    "serviceSpecificFields" JSONB NOT NULL DEFAULT '[]',
    "mandatoryQuestions" JSONB NOT NULL DEFAULT '[]',
    "optionalInformation" JSONB NOT NULL DEFAULT '[]',
    "responseTimeCommitment" TEXT,
    "autoRoutingRules" JSONB NOT NULL DEFAULT '[]',
    "specialistAssignment" BOOLEAN NOT NULL DEFAULT false,
    "documentUploadRequired" BOOLEAN NOT NULL DEFAULT false,
    "medicalReportUpload" BOOLEAN NOT NULL DEFAULT true,
    "labResultUpload" BOOLEAN NOT NULL DEFAULT false,
    "imageUpload" BOOLEAN NOT NULL DEFAULT false,
    "medicalDataProtection" BOOLEAN NOT NULL DEFAULT true,
    "consentRequired" BOOLEAN NOT NULL DEFAULT true,
    "dataRetentionPeriod" INTEGER NOT NULL DEFAULT 365,
    "clinicIntegration" BOOLEAN NOT NULL DEFAULT true,
    "doctorIntegration" BOOLEAN NOT NULL DEFAULT true,
    "appointmentSystemIntegration" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "service_contact_integration_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraint
ALTER TABLE "service_contact_integration" ADD CONSTRAINT "service_contact_integration_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create AppointmentContactIntegration table
CREATE TABLE "appointment_contact_integration" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "lastContactId" TEXT,
    "pendingContactId" TEXT,
    "relatedContactIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "contactTriggeredBooking" BOOLEAN NOT NULL DEFAULT false,
    "contactReference" TEXT,
    "contactCategory" TEXT,
    "preAppointmentContact" BOOLEAN NOT NULL DEFAULT true,
    "preContactMethod" "ContactMethod",
    "preContactScheduled" TIMESTAMP(3),
    "preContactCompleted" BOOLEAN NOT NULL DEFAULT false,
    "confirmationContact" BOOLEAN NOT NULL DEFAULT true,
    "confirmationMethod" "ContactMethod",
    "confirmationSent" BOOLEAN NOT NULL DEFAULT false,
    "confirmationMethodUsed" TEXT,
    "followUpContact" BOOLEAN NOT NULL DEFAULT false,
    "followUpDelay" INTEGER,
    "followUpMethod" "ContactMethod",
    "followUpScheduled" TIMESTAMP(3),
    "followUpCompleted" BOOLEAN NOT NULL DEFAULT false,
    "rescheduleContact" BOOLEAN NOT NULL DEFAULT true,
    "cancellationContact" BOOLEAN NOT NULL DEFAULT true,
    "modificationContact" BOOLEAN NOT NULL DEFAULT true,
    "noShowContact" BOOLEAN NOT NULL DEFAULT false,
    "preOpInstructions" BOOLEAN NOT NULL DEFAULT false,
    "postOpCare" BOOLEAN NOT NULL DEFAULT false,
    "medicationInstructions" BOOLEAN NOT NULL DEFAULT false,
    "resultDiscussion" BOOLEAN NOT NULL DEFAULT false,
    "preferredContactMethod" "ContactMethod",
    "patientContactPreferences" JSONB NOT NULL DEFAULT '{}',
    "specialContactInstructions" TEXT,
    "contactSequence" JSONB NOT NULL DEFAULT '[]',
    "contactCompletedSteps" JSONB NOT NULL DEFAULT '[]',
    "nextContactScheduled" TIMESTAMP(3),
    "contactNotes" TEXT,
    "clinicContactSystem" BOOLEAN NOT NULL DEFAULT true,
    "doctorContactSystem" BOOLEAN NOT NULL DEFAULT true,
    "patientPortalIntegration" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "appointment_contact_integration_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraints
ALTER TABLE "appointment_contact_integration" ADD CONSTRAINT "appointment_contact_integration_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "appointment_contact_integration" ADD CONSTRAINT "appointment_contact_integration_lastContactId_fkey" FOREIGN KEY ("lastContactId") REFERENCES "contact_forms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create HealthierSgContactIntegration table
CREATE TABLE "healthier_sg_contact_integration" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "enrollmentContactId" TEXT,
    "enrollmentMethod" "ContactMethod",
    "enrollmentSupport" TEXT,
    "enrollmentFollowUp" TIMESTAMP(3),
    "enrollmentCompleted" BOOLEAN NOT NULL DEFAULT false,
    "programSupportContact" BOOLEAN NOT NULL DEFAULT true,
    "programQuestions" BOOLEAN NOT NULL DEFAULT true,
    "serviceNavigation" BOOLEAN NOT NULL DEFAULT true,
    "benefitExplanation" BOOLEAN NOT NULL DEFAULT true,
    "goalSettingContact" BOOLEAN NOT NULL DEFAULT true,
    "goalProgressContact" BOOLEAN NOT NULL DEFAULT false,
    "milestoneCelebration" BOOLEAN NOT NULL DEFAULT false,
    "setbackSupport" BOOLEAN NOT NULL DEFAULT true,
    "clinicTransitionSupport" BOOLEAN NOT NULL DEFAULT true,
    "providerSwitchSupport" BOOLEAN NOT NULL DEFAULT false,
    "serviceModification" BOOLEAN NOT NULL DEFAULT true,
    "appointmentAssistance" BOOLEAN NOT NULL DEFAULT true,
    "regularCheckIns" BOOLEAN NOT NULL DEFAULT false,
    "checkInFrequency" INTEGER,
    "healthReviewContact" BOOLEAN NOT NULL DEFAULT false,
    "annualReviewContact" BOOLEAN NOT NULL DEFAULT false,
    "programUpdates" BOOLEAN NOT NULL DEFAULT true,
    "benefitChanges" BOOLEAN NOT NULL DEFAULT true,
    "newServices" BOOLEAN NOT NULL DEFAULT false,
    "policyChanges" BOOLEAN NOT NULL DEFAULT true,
    "preferredContactMethod" "ContactMethod",
    "contactFrequency" TEXT,
    "contactTimePreference" TEXT,
    "linkWithMedicalContact" BOOLEAN NOT NULL DEFAULT false,
    "separateHealthierSgContact" BOOLEAN NOT NULL DEFAULT true,
    "emergencyHealthierSgContact" BOOLEAN NOT NULL DEFAULT false,
    "programMilestones" JSONB NOT NULL DEFAULT '[]',
    "milestoneContact" JSONB NOT NULL DEFAULT '[]',
    "completionContact" BOOLEAN NOT NULL DEFAULT false,
    "graduationContact" BOOLEAN NOT NULL DEFAULT false,
    "contactEffectiveness" JSONB NOT NULL DEFAULT '{}',
    "engagementMetrics" JSONB NOT NULL DEFAULT '{}',
    "successIndicators" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "healthier_sg_contact_integration_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraints
ALTER TABLE "healthier_sg_contact_integration" ADD CONSTRAINT "healthier_sg_contact_integration_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "healthier_sg_enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "healthier_sg_contact_integration" ADD CONSTRAINT "healthier_sg_contact_integration_enrollmentContactId_fkey" FOREIGN KEY ("enrollmentContactId") REFERENCES "contact_forms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create UserContactDashboard table
CREATE TABLE "user_contact_dashboard" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "showContactNotifications" BOOLEAN NOT NULL DEFAULT true,
    "showEnquiryUpdates" BOOLEAN NOT NULL DEFAULT true,
    "showAppointmentContacts" BOOLEAN NOT NULL DEFAULT true,
    "showProgramContacts" BOOLEAN NOT NULL DEFAULT false,
    "recentContactsWidget" BOOLEAN NOT NULL DEFAULT true,
    "pendingResponsesWidget" BOOLEAN NOT NULL DEFAULT true,
    "followUpTasksWidget" BOOLEAN NOT NULL DEFAULT true,
    "contactStatsWidget" BOOLEAN NOT NULL DEFAULT false,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "smsNotifications" BOOLEAN NOT NULL DEFAULT false,
    "pushNotifications" BOOLEAN NOT NULL DEFAULT true,
    "inAppNotifications" BOOLEAN NOT NULL DEFAULT true,
    "quickContactAccess" BOOLEAN NOT NULL DEFAULT true,
    "contactHistoryAccess" BOOLEAN NOT NULL DEFAULT true,
    "saveContactPreferences" BOOLEAN NOT NULL DEFAULT true,
    "contactAnalyticsAccess" BOOLEAN NOT NULL DEFAULT false,
    "showHealthContacts" BOOLEAN NOT NULL DEFAULT true,
    "showAppointmentContacts" BOOLEAN NOT NULL DEFAULT true,
    "showProgramContacts" BOOLEAN NOT NULL DEFAULT false,
    "showAdministrativeContacts" BOOLEAN NOT NULL DEFAULT false,
    "shareContactHistory" BOOLEAN NOT NULL DEFAULT false,
    "allowContactSuggestions" BOOLEAN NOT NULL DEFAULT true,
    "allowContactRecommendations" BOOLEAN NOT NULL DEFAULT false,
    "showClinicContacts" BOOLEAN NOT NULL DEFAULT true,
    "showDoctorContacts" BOOLEAN NOT NULL DEFAULT true,
    "showServiceContacts" BOOLEAN NOT NULL DEFAULT true,
    "showEmergencyContacts" BOOLEAN NOT NULL DEFAULT true,
    "contactListView" BOOLEAN NOT NULL DEFAULT true,
    "contactCardView" BOOLEAN NOT NULL DEFAULT false,
    "contactTimelineView" BOOLEAN NOT NULL DEFAULT false,
    "contactAnalyticsView" BOOLEAN NOT NULL DEFAULT false,
    "enableQuickReply" BOOLEAN NOT NULL DEFAULT true,
    "enableContactEscalation" BOOLEAN NOT NULL DEFAULT false,
    "enableContactMerging" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "user_contact_dashboard_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraint
ALTER TABLE "user_contact_dashboard" ADD CONSTRAINT "user_contact_dashboard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create ContactActivityLog table
CREATE TABLE "contact_activity_log" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "contactFormId" TEXT,
    "enquiryId" TEXT,
    "appointmentId" TEXT,
    "activityType" "ContactActivityType" NOT NULL,
    "activityDescription" TEXT NOT NULL,
    "activityData" JSONB NOT NULL DEFAULT '{}',
    "contactMethod" "ContactMethod",
    "contactCategory" TEXT,
    "priority" "ContactPriority" NOT NULL DEFAULT 'NORMAL',
    "status" "ContactActivityStatus" NOT NULL DEFAULT 'PENDING',
    "outcome" TEXT,
    "satisfaction" INTEGER,
    "sourceSystem" TEXT NOT NULL,
    "integrationId" TEXT,
    "integrationData" JSONB NOT NULL DEFAULT '{}',
    "notificationSent" BOOLEAN NOT NULL DEFAULT false,
    "notificationData" JSONB NOT NULL DEFAULT '{}',
    "deliveryStatus" TEXT,
    "requiresFollowUp" BOOLEAN NOT NULL DEFAULT false,
    "followUpDate" TIMESTAMP(3),
    "followUpCompleted" BOOLEAN NOT NULL DEFAULT false,
    "followUpMethod" "ContactMethod",
    "responseTime" INTEGER,
    "resolutionTime" INTEGER,
    "userEngagement" DOUBLE PRECISION,
    "sensitiveData" BOOLEAN NOT NULL DEFAULT false,
    "encrypted" BOOLEAN NOT NULL DEFAULT true,
    "auditTrail" BOOLEAN NOT NULL DEFAULT true,
    "accessLogged" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "contact_activity_log_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraints
ALTER TABLE "contact_activity_log" ADD CONSTRAINT "contact_activity_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "contact_activity_log" ADD CONSTRAINT "contact_activity_log_contactFormId_fkey" FOREIGN KEY ("contactFormId") REFERENCES "contact_forms"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "contact_activity_log" ADD CONSTRAINT "contact_activity_log_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "enquiries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create indexes for optimal performance
-- User contact preferences queries
CREATE INDEX "user_contact_preferences_userId_idx" ON "user_contact_preferences"("userId");
CREATE INDEX "user_contact_preferences_userId_preferredContactMethod_idx" ON "user_contact_preferences"("userId", "preferredContactMethod");
CREATE INDEX "user_contact_preferences_userId_emergencyContactMethod_idx" ON "user_contact_preferences"("userId", "emergencyContactMethod");

-- User contact history queries
CREATE INDEX "user_contact_history_userId_idx" ON "user_contact_history"("userId");
CREATE INDEX "user_contact_history_userId_createdAt_idx" ON "user_contact_history"("userId", "createdAt");
CREATE INDEX "user_contact_history_userId_contactType_createdAt_idx" ON "user_contact_history"("userId", "contactType", "createdAt");
CREATE INDEX "user_contact_history_userId_status_createdAt_idx" ON "user_contact_history"("userId", "status", "createdAt");
CREATE INDEX "user_contact_history_contactFormId_idx" ON "user_contact_history"("contactFormId");

-- Clinic contact integration queries
CREATE INDEX "clinic_contact_integration_clinicId_idx" ON "clinic_contact_integration"("clinicId");
CREATE INDEX "clinic_contact_integration_clinicId_enableContactForm_idx" ON "clinic_contact_integration"("clinicId", "enableContactForm");
CREATE INDEX "clinic_contact_integration_clinicId_emergencyContactEnabled_idx" ON "clinic_contact_integration"("clinicId", "emergencyContactEnabled");
CREATE INDEX "clinic_contact_integration_clinicId_appointmentQueriesEnabled_idx" ON "clinic_contact_integration"("clinicId", "appointmentQueriesEnabled");

-- Doctor contact integration queries
CREATE INDEX "doctor_contact_integration_doctorId_idx" ON "doctor_contact_integration"("doctorId");
CREATE INDEX "doctor_contact_integration_doctorId_allowPatientContact_idx" ON "doctor_contact_integration"("doctorId", "allowPatientContact");
CREATE INDEX "doctor_contact_integration_doctorId_emergencyContactEnabled_idx" ON "doctor_contact_integration"("doctorId", "emergencyContactEnabled");
CREATE INDEX "doctor_contact_integration_doctorId_appointmentQueries_idx" ON "doctor_contact_integration"("doctorId", "appointmentQueries");

-- Service contact integration queries
CREATE INDEX "service_contact_integration_serviceId_idx" ON "service_contact_integration"("serviceId");
CREATE INDEX "service_contact_integration_serviceId_enableServiceContact_idx" ON "service_contact_integration"("serviceId", "enableServiceContact");
CREATE INDEX "service_contact_integration_serviceId_preAppointmentContact_idx" ON "service_contact_integration"("serviceId", "preAppointmentContact");
CREATE INDEX "service_contact_integration_serviceId_followUpQueries_idx" ON "service_contact_integration"("serviceId", "followUpQueries");

-- Appointment contact integration queries
CREATE INDEX "appointment_contact_integration_appointmentId_idx" ON "appointment_contact_integration"("appointmentId");
CREATE INDEX "appointment_contact_integration_appointmentId_contactTriggeredBooking_idx" ON "appointment_contact_integration"("appointmentId", "contactTriggeredBooking");
CREATE INDEX "appointment_contact_integration_appointmentId_preAppointmentContact_idx" ON "appointment_contact_integration"("appointmentId", "preAppointmentContact");
CREATE INDEX "appointment_contact_integration_appointmentId_followUpContact_idx" ON "appointment_contact_integration"("appointmentId", "followUpContact");

-- Healthier SG contact integration queries
CREATE INDEX "healthier_sg_contact_integration_enrollmentId_idx" ON "healthier_sg_contact_integration"("enrollmentId");
CREATE INDEX "healthier_sg_contact_integration_enrollmentId_programSupportContact_idx" ON "healthier_sg_contact_integration"("enrollmentId", "programSupportContact");
CREATE INDEX "healthier_sg_contact_integration_enrollmentId_enrollmentContactId_idx" ON "healthier_sg_contact_integration"("enrollmentId", "enrollmentContactId");

-- User dashboard preferences queries
CREATE INDEX "user_contact_dashboard_userId_idx" ON "user_contact_dashboard"("userId");
CREATE INDEX "user_contact_dashboard_userId_showContactNotifications_idx" ON "user_contact_dashboard"("userId", "showContactNotifications");

-- Contact activity log queries
CREATE INDEX "contact_activity_log_userId_idx" ON "contact_activity_log"("userId");
CREATE INDEX "contact_activity_log_userId_activityType_createdAt_idx" ON "contact_activity_log"("userId", "activityType", "createdAt");
CREATE INDEX "contact_activity_log_userId_status_createdAt_idx" ON "contact_activity_log"("userId", "status", "createdAt");
CREATE INDEX "contact_activity_log_contactFormId_idx" ON "contact_activity_log"("contactFormId");
CREATE INDEX "contact_activity_log_sourceSystem_integrationId_idx" ON "contact_activity_log"("sourceSystem", "integrationId");

-- Cross-system integration queries
CREATE INDEX "contact_activity_log_userId_sourceSystem_idx" ON "contact_activity_log"("userId", "sourceSystem");
CREATE INDEX "contact_activity_log_contactFormId_enquiryId_idx" ON "contact_activity_log"("contactFormId", "enquiryId");
CREATE INDEX "contact_activity_log_createdAt_activityType_idx" ON "contact_activity_log"("createdAt", "activityType");

-- Add unique constraints
ALTER TABLE "user_contact_preferences" ADD CONSTRAINT "user_contact_preferences_userId_key" UNIQUE ("userId");
ALTER TABLE "clinic_contact_integration" ADD CONSTRAINT "clinic_contact_integration_clinicId_key" UNIQUE ("clinicId");
ALTER TABLE "doctor_contact_integration" ADD CONSTRAINT "doctor_contact_integration_doctorId_key" UNIQUE ("doctorId");
ALTER TABLE "service_contact_integration" ADD CONSTRAINT "service_contact_integration_serviceId_key" UNIQUE ("serviceId");
ALTER TABLE "appointment_contact_integration" ADD CONSTRAINT "appointment_contact_integration_appointmentId_key" UNIQUE ("appointmentId");
ALTER TABLE "healthier_sg_contact_integration" ADD CONSTRAINT "healthier_sg_contact_integration_enrollmentId_key" UNIQUE ("enrollmentId");
ALTER TABLE "user_contact_dashboard" ADD CONSTRAINT "user_contact_dashboard_userId_key" UNIQUE ("userId");

-- Create trigger function for updatedAt
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedAt = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updatedAt
CREATE TRIGGER update_user_contact_preferences_updated_at BEFORE UPDATE ON "user_contact_preferences" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_contact_history_updated_at BEFORE UPDATE ON "user_contact_history" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clinic_contact_integration_updated_at BEFORE UPDATE ON "clinic_contact_integration" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_doctor_contact_integration_updated_at BEFORE UPDATE ON "doctor_contact_integration" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_contact_integration_updated_at BEFORE UPDATE ON "service_contact_integration" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointment_contact_integration_updated_at BEFORE UPDATE ON "appointment_contact_integration" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_healthier_sg_contact_integration_updated_at BEFORE UPDATE ON "healthier_sg_contact_integration" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_contact_dashboard_updated_at BEFORE UPDATE ON "user_contact_dashboard" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contact_activity_log_updated_at BEFORE UPDATE ON "contact_activity_log" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();;