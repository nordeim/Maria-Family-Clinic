-- =====================================================
-- MY FAMILY CLINIC - LOCAL DEVELOPMENT INITIALIZATION
-- =====================================================
-- This script creates sample data for local development
-- Run this after complete-schema.sql
-- =====================================================

-- =====================================================
-- SAMPLE DATA FOR LOCAL DEVELOPMENT
-- =====================================================

-- Insert sample user roles enum values (if needed)
-- The enums are already created in the main schema

-- =====================================================
-- SAMPLE USERS
-- =====================================================

-- Sample Admin User
INSERT INTO "users" ("id", "email", "name", "role", "createdAt", "updatedAt") VALUES
('550e8400-e29b-41d4-a716-446655440000', 'admin@myfamilyclinic.sg', 'System Administrator', 'ADMIN', NOW(), NOW());

-- Sample Doctor Users
INSERT INTO "users" ("id", "email", "name", "role", "createdAt", "updatedAt") VALUES
('550e8400-e29b-41d4-a716-446655440001', 'dr.lee@myfamilyclinic.sg', 'Dr. Lee Wei Ming', 'DOCTOR', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'dr.chen@myfamilyclinic.sg', 'Dr. Chen Li Hua', 'DOCTOR', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'dr.raj@myfamilyclinic.sg', 'Dr. Raj Kumar', 'DOCTOR', NOW(), NOW());

-- Sample Patient Users
INSERT INTO "users" ("id", "email", "name", "role", "createdAt", "updatedAt") VALUES
('550e8400-e29b-41d4-a716-446655440004', 'john.smith@email.com', 'John Smith', 'PATIENT', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440005', 'mary.lim@email.com', 'Mary Lim', 'PATIENT', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440006', 'ahmad.rahman@email.com', 'Ahmad Rahman', 'PATIENT', NOW(), NOW());

-- Sample Support Staff
INSERT INTO "users" ("id", "email", "name", "role", "createdAt", "updatedAt") VALUES
('550e8400-e29b-41d4-a716-446655440007', 'support@myfamilyclinic.sg', 'Customer Support', 'SUPPORT_STAFF', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440008', 'reception@myfamilyclinic.sg', 'Reception Staff', 'CLINIC_STAFF', NOW(), NOW());

-- =====================================================
-- SAMPLE USER PROFILES
-- =====================================================

-- Admin Profile
INSERT INTO "user_profiles" ("id", "userId", "phone", "address", "postalCode", "gender", "preferredLanguage", "createdAt", "updatedAt") VALUES
('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', '+65-9123-4567', '123 Admin Street, Singapore 123456', '123456', 'MALE', 'en', NOW(), NOW());

-- Doctor Profiles
INSERT INTO "user_profiles" ("id", "userId", "phone", "address", "postalCode", "gender", "preferredLanguage", "medicalConditions", "allergies", "createdAt", "updatedAt") VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '+65-9123-4568', '456 Doctor Lane, Singapore 234567', '234567', 'MALE', 'en', '{}', '{}', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '+65-9123-4569', '789 Medical Ave, Singapore 345678', '345678', 'FEMALE', 'en', '{}', '{}', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', '+65-9123-4570', '321 Health Road, Singapore 456789', '456789', 'MALE', 'en', '{}', '{}', NOW(), NOW());

-- Patient Profiles
INSERT INTO "user_profiles" ("id", "userId", "phone", "address", "postalCode", "dateOfBirth", "gender", "preferredLanguage", "emergencyContact", "medicalConditions", "allergies", "createdAt", "updatedAt") VALUES
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', '+65-9123-4571', '111 Patient Place, Singapore 567890', '567890', '1985-03-15', 'MALE', 'en', '+65-9123-4572', '["hypertension"]', '["penicillin"]', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', '+65-9123-4573', '222 Care Street, Singapore 678901', '678901', '1990-07-22', 'FEMALE', 'en', '+65-9123-4574', '["diabetes"]', '[]', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440006', '+65-9123-4575', '333 Wellness Way, Singapore 789012', '789012', '1978-11-08', 'MALE', 'en', '+65-9123-4576', '["asthma", "allergic rhinitis"]', '["shellfish"]', NOW(), NOW());

-- =====================================================
-- SAMPLE USER PREFERENCES
-- =====================================================

INSERT INTO "user_preferences" ("id", "userId", "emailNotifications", "smsNotifications", "theme", "language", "favorites", "createdAt", "updatedAt") VALUES
('770e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', true, true, 'light', 'en', '{}', NOW(), NOW()),
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', true, false, 'light', 'en', '{}', NOW(), NOW()),
('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', true, false, 'light', 'en', '{}', NOW(), NOW()),
('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', true, false, 'light', 'en', '{}', NOW(), NOW()),
('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', true, true, 'light', 'en', '["clinic_001", "clinic_002"]', NOW(), NOW()),
('770e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', true, true, 'light', 'en', '["clinic_003"]', NOW(), NOW()),
('770e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440006', false, false, 'light', 'en', '[]', NOW(), NOW());

-- =====================================================
-- SAMPLE CLINICS
-- =====================================================

INSERT INTO "clinics" ("id", "name", "description", "address", "postalCode", "phone", "email", "website", "latitude", "longitude", "location", "operatingHours", "facilities", "accreditationStatus", "emergencyPhone", "afterHoursPhone", "establishedYear", "licenseNumber", "licenseExpiry", "isActive", "isVerified", "rating", "reviewCount", "createdAt", "updatedAt") VALUES
('clinic_001', 'My Family Clinic - Orchard Road', 'Modern family clinic serving the Orchard Road community with comprehensive healthcare services', '123 Orchard Road, Singapore 238858', '238858', '+65-6238-1234', 'orchard@myfamilyclinic.sg', 'https://orchard.myfamilyclinic.sg', 1.3048, 103.8318, ST_SetSRID(ST_MakePoint(103.8318, 1.3048), 4326)::geography, '{"monday": {"open": "08:00", "close": "22:00"}, "tuesday": {"open": "08:00", "close": "22:00"}, "wednesday": {"open": "08:00", "close": "22:00"}, "thursday": {"open": "08:00", "close": "22:00"}, "friday": {"open": "08:00", "close": "22:00"}, "saturday": {"open": "09:00", "close": "17:00"}, "sunday": {"open": "10:00", "close": "16:00"}}', '{"wheelchair_accessible", "parking", "pharmacy", "x_ray", "laboratory"}', 'verified', '+65-6238-1235', '+65-9123-8000', 2018, 'MOH-CL-2018-001', '2025-12-31', true, true, 4.5, 247, NOW(), NOW()),
('clinic_002', 'My Family Clinic - Tampines', 'Community-focused clinic in Tampines providing primary care and preventive health services', '456 Tampines Central 1, Singapore 529457', '529457', '+65-6789-2345', 'tampines@myfamilyclinic.sg', 'https://tampines.myfamilyclinic.sg', 1.3546, 103.9436, ST_SetSRID(ST_MakePoint(103.9436, 1.3546), 4326)::geography, '{"monday": {"open": "08:00", "close": "21:00"}, "tuesday": {"open": "08:00", "close": "21:00"}, "wednesday": {"open": "08:00", "close": "21:00"}, "thursday": {"open": "08:00", "close": "21:00"}, "friday": {"open": "08:00", "close": "21:00"}, "saturday": {"open": "09:00", "close": "16:00"}, "sunday": {"closed": true}}', '{"wheelchair_accessible", "parking", "child_friendly", "pharmacy", "blood_test"}', 'verified', '+65-6789-2346', '+65-9123-8001', 2019, 'MOH-CL-2019-002', '2026-06-30', true, true, 4.3, 189, NOW(), NOW()),
('clinic_003', 'My Family Clinic - Jurong East', 'Comprehensive healthcare center in Jurong East with specialists and emergency services', '789 Jurong East Street 13, Singapore 609521', '609521', '+65-6567-3456', 'jurong@myfamilyclinic.sg', 'https://jurong.myfamilyclinic.sg', 1.3332, 103.7422, ST_SetSRID(ST_MakePoint(103.7422, 1.3332), 4326)::geography, '{"monday": {"open": "07:00", "close": "23:00"}, "tuesday": {"open": "07:00", "close": "23:00"}, "wednesday": {"open": "07:00", "close": "23:00"}, "thursday": {"open": "07:00", "close": "23:00"}, "friday": {"open": "07:00", "close": "23:00"}, "saturday": {"open": "08:00", "close": "18:00"}, "sunday": {"open": "09:00", "close": "17:00"}}', '{"wheelchair_accessible", "parking", "pharmacy", "x_ray", "ultrasound", "ecg", "emergency"}', 'verified', '+65-6567-3457', '+65-9123-8002', 2020, 'MOH-CL-2020-003', '2027-03-31', true, true, 4.7, 312, NOW(), NOW());

-- =====================================================
-- SAMPLE CLINIC LANGUAGES
-- =====================================================

INSERT INTO "clinic_languages" ("id", "clinicId", "language", "createdAt") VALUES
('lang_001', 'clinic_001', 'English', NOW()),
('lang_002', 'clinic_001', 'Chinese', NOW()),
('lang_003', 'clinic_001', 'Malay', NOW()),
('lang_004', 'clinic_002', 'English', NOW()),
('lang_005', 'clinic_002', 'Chinese', NOW()),
('lang_006', 'clinic_002', 'Tamil', NOW()),
('lang_007', 'clinic_003', 'English', NOW()),
('lang_008', 'clinic_003', 'Chinese', NOW()),
('lang_009', 'clinic_003', 'Malay', NOW()),
('lang_010', 'clinic_003', 'Tamil', NOW());

-- =====================================================
-- SAMPLE OPERATING HOURS
-- =====================================================

INSERT INTO "operating_hours" ("id", "clinicId", "dayOfWeek", "openTime", "closeTime", "isOpen", "is24Hours", "createdAt", "updatedAt") VALUES

-- Orchard Road Clinic Hours
('oh_001', 'clinic_001', 'MONDAY', '08:00', '22:00', true, false, NOW(), NOW()),
('oh_002', 'clinic_001', 'TUESDAY', '08:00', '22:00', true, false, NOW(), NOW()),
('oh_003', 'clinic_001', 'WEDNESDAY', '08:00', '22:00', true, false, NOW(), NOW()),
('oh_004', 'clinic_001', 'THURSDAY', '08:00', '22:00', true, false, NOW(), NOW()),
('oh_005', 'clinic_001', 'FRIDAY', '08:00', '22:00', true, false, NOW(), NOW()),
('oh_006', 'clinic_001', 'SATURDAY', '09:00', '17:00', true, false, NOW(), NOW()),
('oh_007', 'clinic_001', 'SUNDAY', '10:00', '16:00', true, false, NOW(), NOW()),

-- Tampines Clinic Hours
('oh_008', 'clinic_002', 'MONDAY', '08:00', '21:00', true, false, NOW(), NOW()),
('oh_009', 'clinic_002', 'TUESDAY', '08:00', '21:00', true, false, NOW(), NOW()),
('oh_010', 'clinic_002', 'WEDNESDAY', '08:00', '21:00', true, false, NOW(), NOW()),
('oh_011', 'clinic_002', 'THURSDAY', '08:00', '21:00', true, false, NOW(), NOW()),
('oh_012', 'clinic_002', 'FRIDAY', '08:00', '21:00', true, false, NOW(), NOW()),
('oh_013', 'clinic_002', 'SATURDAY', '09:00', '16:00', true, false, NOW(), NOW()),
('oh_014', 'clinic_002', 'SUNDAY', 'closed', 'closed', false, false, NOW(), NOW()),

-- Jurong East Clinic Hours
('oh_015', 'clinic_003', 'MONDAY', '07:00', '23:00', true, false, NOW(), NOW()),
('oh_016', 'clinic_003', 'TUESDAY', '07:00', '23:00', true, false, NOW(), NOW()),
('oh_017', 'clinic_003', 'WEDNESDAY', '07:00', '23:00', true, false, NOW(), NOW()),
('oh_018', 'clinic_003', 'THURSDAY', '07:00', '23:00', true, false, NOW(), NOW()),
('oh_019', 'clinic_003', 'FRIDAY', '07:00', '23:00', true, false, NOW(), NOW()),
('oh_020', 'clinic_003', 'SATURDAY', '08:00', '18:00', true, false, NOW(), NOW()),
('oh_021', 'clinic_003', 'SUNDAY', '09:00', '17:00', true, false, NOW(), NOW());

-- =====================================================
-- SAMPLE DOCTORS
-- =====================================================

INSERT INTO "doctors" ("id", "name", "email", "phone", "medicalLicense", "specialties", "languages", "qualifications", "experienceYears", "bio", "medicalSchool", "graduationYear", "specializations", "boardCertifications", "professionalMemberships", "consultationFee", "currency", "isActive", "isVerified", "verificationDate", "rating", "reviewCount", "patientSatisfaction", "appointmentCompletionRate", "totalAppointments", "confidentialityLevel", "pdpaConsent", "cmePoints", "lastCMEUpdate", "emergencyAvailability", "createdAt", "updatedAt") VALUES
('doctor_001', 'Dr. Lee Wei Ming', 'dr.lee@myfamilyclinic.sg', '+65-9123-4568', 'MCR-12345', '{"general_practice", "family_medicine"}', '{"English", "Chinese", "Malay"}', '{"MBBS Singapore", "MMed Family Medicine"}', 12, 'Dr. Lee is a dedicated family physician with over 12 years of experience in primary care. He specializes in chronic disease management and preventive medicine.', 'National University of Singapore', 2011, '{"chronic_disease_management", "preventive_medicine", "geriatric_care"}', '{"FCFPS (Family Medicine)", "MMed Family Medicine"}', '{"Singapore Medical Association", "College of Family Physicians Singapore"}', 80.00, 'SGD', true, true, '2023-01-15', 4.6, 156, 4.7, 98.5, 1247, 'STANDARD', true, 45, '2024-11-01', false, NOW(), NOW()),
('doctor_002', 'Dr. Chen Li Hua', 'dr.chen@myfamilyclinic.sg', '+65-9123-4569', 'MCR-67890', '{"pediatrics", "adolescent_health"}', '{"English", "Chinese", "Tamil"}', '{"MBBS Singapore", "MRCPCH (UK)", "MMed Pediatrics"}', 8, 'Dr. Chen specializes in pediatric care with a focus on child development and adolescent health. She is passionate about creating a comfortable environment for young patients.', 'National University of Singapore', 2016, '{"child_development", "adolescent_health", "vaccination"}', '{"MRCPCH (UK)", "MMed Pediatrics", "Dip Community Child Health"}', '{"Singapore Paediatric Society", "College of Paediatrics and Child Health Singapore"}', 90.00, 'SGD', true, true, '2023-03-20', 4.8, 203, 4.9, 99.2, 892, 'STANDARD', true, 32, '2024-10-15', false, NOW(), NOW()),
('doctor_003', 'Dr. Raj Kumar', 'dr.raj@myfamilyclinic.sg', '+65-9123-4570', 'MCR-54321', '{"emergency_medicine", "trauma_care"}', '{"English", "Tamil", "Malay"}', '{"MBBS India", "MMed Emergency Medicine Singapore"}', 15, 'Dr. Raj is an emergency medicine specialist with extensive experience in trauma care and acute medical conditions. Available for emergency consultations and critical care situations.', 'All India Institute of Medical Sciences, New Delhi', 2009, '{"trauma_care", "acute_care", "emergency_procedures"}', '{"MMed Emergency Medicine Singapore", "FAMS (Emergency Medicine)"}', '{"Society for Emergency Medicine Singapore", "International Federation for Emergency Medicine"}', 120.00, 'SGD', true, true, '2022-11-10', 4.7, 178, 4.8, 99.8, 2156, 'RESTRICTED', true, 58, '2024-11-03', true, NOW(), NOW());

-- =====================================================
-- SAMPLE DOCTOR-CLINIC RELATIONSHIPS
-- =====================================================

INSERT INTO "doctor_clinics" ("id", "doctorId", "clinicId", "role", "capacity", "isPrimary", "workingDays", "consultationFee", "consultationDuration", "emergencyConsultationFee", "clinicRating", "clinicReviewCount", "acceptedInsurance", "medisaveAccepted", "chasAccepted", "verificationStatus", "verificationDate", "startDate", "createdAt", "updatedAt") VALUES
('dc_001', 'doctor_001', 'clinic_001', 'ATTENDING', 'FULL_TIME', true, '{"monday", "tuesday", "wednesday", "thursday", "friday"}', 80.00, 30, 120.00, 4.6, 156, '["AIA", "Great Eastern", "Prudential", "Medishield"]', true, true, 'VERIFIED', '2023-01-15', '2023-02-01', NOW(), NOW()),
('dc_002', 'doctor_001', 'clinic_002', 'ATTENDING', 'PART_TIME', false, '{"saturday", "sunday"}', 80.00, 30, 120.00, 4.5, 89, '["AIA", "Great Eastern", "Medishield"]', true, true, 'VERIFIED', '2023-02-01', '2023-02-15', NOW(), NOW()),
('dc_003', 'doctor_002', 'clinic_002', 'ATTENDING', 'FULL_TIME', true, '{"monday", "tuesday", "wednesday", "thursday", "friday", "saturday"}', 90.00, 45, 150.00, 4.8, 203, '["AIA", "Great Eastern", "Prudential", "Medishield", "CHAS Blue"]', true, true, 'VERIFIED', '2023-03-20', '2023-04-01', NOW(), NOW()),
('dc_004', 'doctor_003', 'clinic_003', 'CONSULTANT', 'FULL_TIME', true, '{"monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"}', 120.00, 60, 200.00, 4.7, 178, '["AIA", "Great Eastern", "Prudential", "Medishield", "Private Insurance"]', true, false, 'VERIFIED', '2022-11-10', '2023-01-01', NOW(), NOW());

-- =====================================================
-- SAMPLE SERVICE CATEGORIES
-- =====================================================

INSERT INTO "service_categories" ("id", "name", "displayName", "description", "level", "sortOrder", "isActive", "serviceCount", "createdAt", "updatedAt") VALUES
('cat_001', 'general_practice', 'General Practice', 'Primary care and family medicine services', 0, 1, true, 15, NOW(), NOW()),
('cat_002', 'pediatrics', 'Pediatrics', 'Healthcare services for children and adolescents', 0, 2, true, 8, NOW(), NOW()),
('cat_003', 'specialist_consultation', 'Specialist Consultation', 'Consultations with medical specialists', 0, 3, true, 12, NOW(), NOW()),
('cat_004', 'preventive_care', 'Preventive Care', 'Health screening and preventive services', 0, 4, true, 10, NOW(), NOW()),
('cat_005', 'emergency_services', 'Emergency Services', 'Emergency medical care and trauma treatment', 0, 5, true, 6, NOW(), NOW()),

-- Subcategories for General Practice
('cat_006', 'acute_care', 'Acute Care', 'Treatment for acute illnesses and injuries', 1, 1, true, 6, NOW(), NOW()),
('cat_007', 'chronic_disease', 'Chronic Disease Management', 'Long-term management of chronic conditions', 1, 2, true, 5, NOW(), NOW()),
('cat_008', 'health_screening', 'Health Screening', 'Regular health check-ups and screenings', 1, 3, true, 4, NOW(), NOW()),

-- Subcategories for Pediatrics
('cat_009', 'child_development', 'Child Development', 'Monitoring and supporting child development', 1, 1, true, 3, NOW(), NOW()),
('cat_010', 'vaccination', 'Vaccination', 'Childhood and adult immunization services', 1, 2, true, 2, NOW(), NOW()),
('cat_011', 'adolescent_health', 'Adolescent Health', 'Healthcare services for teenagers', 1, 3, true, 3, NOW(), NOW());

-- =====================================================
-- SAMPLE SERVICES
-- =====================================================

INSERT INTO "services" ("id", "name", "description", "categoryId", "typicalDurationMin", "complexityLevel", "urgencyLevel", "basePrice", "currency", "isSubsidized", "isHealthierSGCovered", "patientFriendlyDesc", "isActive", "sortOrder", "tags", "viewCount", "bookingCount", "createdAt", "updatedAt") VALUES

-- General Practice Services
('svc_001', 'General Consultation', 'Standard medical consultation with family doctor', 'cat_006', 30, 'BASIC', 'ROUTINE', 50.00, 'SGD', true, true, 'See your family doctor for general health concerns and check-ups', true, 1, '{"consultation", "primary_care", "general_practice"}', 245, 189, NOW(), NOW()),
('svc_002', 'Follow-up Consultation', 'Follow-up visit for existing patients', 'cat_006', 15, 'BASIC', 'ROUTINE', 30.00, 'SGD', true, true, 'Quick follow-up appointment for ongoing treatment', true, 2, '{"follow_up", "ongoing_treatment"}', 167, 134, NOW(), NOW()),
('svc_003', 'Chronic Disease Review', 'Comprehensive review for chronic conditions', 'cat_007', 45, 'INTERMEDIATE', 'ROUTINE', 80.00, 'SGD', true, true, 'Detailed check-up for diabetes, hypertension, or other chronic conditions', true, 1, '{"chronic_disease", "diabetes", "hypertension"}', 198, 156, NOW(), NOW()),
('svc_004', 'Health Screening Package', 'Comprehensive health screening', 'cat_008', 90, 'ADVANCED', 'ROUTINE', 150.00, 'SGD', true, true, 'Complete health check-up including blood tests and physical examination', true, 1, '{"screening", "health_check", "blood_test"}', 234, 167, NOW(), NOW()),

-- Pediatric Services
('svc_005', 'Child Consultation', 'Medical consultation for children', 'cat_009', 30, 'BASIC', 'ROUTINE', 60.00, 'SGD', true, true, 'Medical check-up and treatment for children', true, 1, '{"pediatrics", "child_health"}', 189, 143, NOW(), NOW()),
('svc_006', 'Vaccination', 'Childhood and adult vaccination', 'cat_010', 15, 'BASIC', 'ROUTINE', 40.00, 'SGD', true, true, 'Protection against diseases through vaccination', true, 1, '{"vaccination", "immunization", "child_health"}', 156, 128, NOW(), NOW()),
('svc_007', 'Adolescent Health Check', 'Health assessment for teenagers', 'cat_011', 45, 'INTERMEDIATE', 'ROUTINE', 70.00, 'SGD', true, true, 'Comprehensive health check for teenagers including growth and development', true, 1, '{"adolescent", "teen_health", "growth"}', 145, 98, NOW(), NOW()),

-- Specialist Services
('svc_008', 'Cardiology Consultation', 'Heart and cardiovascular specialist consultation', 'cat_003', 60, 'ADVANCED', 'ROUTINE', 150.00, 'SGD', false, true, 'Specialist consultation for heart and cardiovascular concerns', true, 1, '{"cardiology", "heart", "cardiovascular"}', 134, 87, NOW(), NOW()),
('svc_009', 'Dermatology Consultation', 'Skin specialist consultation', 'cat_003', 45, 'INTERMEDIATE', 'ROUTINE', 120.00, 'SGD', false, true, 'Skin condition assessment and treatment', true, 2, '{"dermatology", "skin", "cosmetic"}', 167, 112, NOW(), NOW()),

-- Emergency Services
('svc_010', 'Emergency Consultation', 'Urgent medical consultation', 'cat_005', 30, 'BASIC', 'EMERGENCY', 80.00, 'SGD', false, true, 'Immediate medical attention for urgent health issues', true, 1, '{"emergency", "urgent_care", "trauma"}', 312, 245, NOW(), NOW()),
('svc_011', 'Minor Surgical Procedure', 'Minor surgery and wound care', 'cat_005', 60, 'INTERMEDIATE', 'URGENT', 200.00, 'SGD', false, true, 'Minor surgical procedures and wound treatment', true, 2, '{"minor_surgery", "wound_care", "procedures"}', 98, 67, NOW(), NOW());

-- =====================================================
-- SAMPLE CLINIC SERVICES
-- =====================================================

-- Orchard Road Clinic Services
INSERT INTO "clinic_services" ("id", "clinicId", "serviceId", "isAvailable", "estimatedDuration", "price", "basePrice", "finalPrice", "isHealthierSGCovered", "medisaveCovered", "medishieldCovered", "chasCovered", "chasTier", "appointmentRequired", "walkInAllowed", "qualityRating", "patientCount", "status", "createdAt", "updatedAt") VALUES
('cs_001', 'clinic_001', 'svc_001', true, 30, 50.00, 50.00, 45.00, true, true, true, true, 'BLUE', true, true, 4.5, 234, 'ACTIVE', NOW(), NOW()),
('cs_002', 'clinic_001', 'svc_002', true, 15, 30.00, 30.00, 25.00, true, true, true, true, 'BLUE', true, true, 4.6, 156, 'ACTIVE', NOW(), NOW()),
('cs_003', 'clinic_001', 'svc_003', true, 45, 80.00, 80.00, 70.00, true, true, true, true, 'GREEN', true, false, 4.7, 198, 'ACTIVE', NOW(), NOW()),
('cs_004', 'clinic_001', 'svc_004', true, 90, 150.00, 150.00, 120.00, true, true, true, true, 'GREEN', true, false, 4.8, 167, 'ACTIVE', NOW(), NOW()),
('cs_005', 'clinic_001', 'svc_005', true, 30, 60.00, 60.00, 50.00, true, true, true, true, 'BLUE', true, true, 4.7, 189, 'ACTIVE', NOW(), NOW()),
('cs_006', 'clinic_001', 'svc_010', true, 30, 80.00, 80.00, 80.00, true, false, true, false, null, false, true, 4.4, 312, 'ACTIVE', NOW(), NOW()),

-- Tampines Clinic Services
('cs_007', 'clinic_002', 'svc_001', true, 30, 45.00, 45.00, 40.00, true, true, true, true, 'BLUE', true, true, 4.3, 198, 'ACTIVE', NOW(), NOW()),
('cs_008', 'clinic_002', 'svc_002', true, 15, 25.00, 25.00, 20.00, true, true, true, true, 'BLUE', true, true, 4.4, 134, 'ACTIVE', NOW(), NOW()),
('cs_009', 'clinic_002', 'svc_005', true, 30, 55.00, 55.00, 45.00, true, true, true, true, 'BLUE', true, true, 4.6, 143, 'ACTIVE', NOW(), NOW()),
('cs_010', 'clinic_002', 'svc_006', true, 15, 35.00, 35.00, 30.00, true, true, true, true, 'BLUE', true, true, 4.5, 128, 'ACTIVE', NOW(), NOW()),

-- Jurong East Clinic Services
('cs_011', 'clinic_003', 'svc_001', true, 30, 55.00, 55.00, 50.00, true, true, true, true, 'BLUE', true, true, 4.8, 267, 'ACTIVE', NOW(), NOW()),
('cs_012', 'clinic_003', 'svc_003', true, 45, 85.00, 85.00, 75.00, true, true, true, true, 'GREEN', true, false, 4.7, 223, 'ACTIVE', NOW(), NOW()),
('cs_013', 'clinic_003', 'svc_008', true, 60, 150.00, 150.00, 130.00, true, false, true, false, null, true, false, 4.6, 87, 'ACTIVE', NOW(), NOW()),
('cs_014', 'clinic_003', 'svc_010', true, 30, 90.00, 90.00, 90.00, true, false, true, false, null, false, true, 4.5, 245, 'ACTIVE', NOW(), NOW()),
('cs_015', 'clinic_003', 'svc_011', true, 60, 200.00, 200.00, 180.00, true, false, true, false, null, true, false, 4.7, 67, 'ACTIVE', NOW(), NOW());

-- =====================================================
-- SAMPLE HEALTHIER SG PROGRAMS
-- =====================================================

INSERT INTO "healthier_sg_programs" ("id", "name", "description", "category", "targetDemographic", "eligibilityCriteria", "benefits", "coverageDetails", "reportingRequirements", "isActive", "createdAt", "updatedAt") VALUES
('hsgsg_001', 'Diabetes Prevention Program', 'Comprehensive diabetes prevention and management program', 'CHRONIC_DISEASE_MANAGEMENT', 'Adults 40-65 with pre-diabetes risk factors', '{"age_range": "40-65", "risk_factors": ["family_history", "obesity", "sedentary_lifestyle"], "medical_conditions": ["pre_diabetes", "metabolic_syndrome"]}', '{"regular_consultations": 12, "blood_tests": 4, "dietary_counseling": 6, "exercise_programs": 12}', '{"medisave_coverage": true, "medishield_integration": true, "healthier_sg_subsidy": "80%"}', '{"monthly_reports": true, "clinical_outcomes": true, "participant_engagement": true}', true, NOW(), NOW()),
('hsgsg_002', 'Heart Health Initiative', 'Cardiovascular health screening and prevention program', 'PREVENTIVE_CARE', 'Adults 35-60 with cardiovascular risk factors', '{"age_range": "35-60", "risk_factors": ["smoking", "high_bp", "high_cholesterol", "family_history"]}', '{"screening_tests": 3, "consultations": 6, "lifestyle_counseling": 4}', '{"medisave_coverage": true, "healthier_sg_subsidy": "70%"}', '{"quarterly_reports": true, "screening_results": true}', true, NOW(), NOW()),
('hsgsg_003', 'Mental Wellness Program', 'Mental health support and wellness program', 'MENTAL_HEALTH', 'Adults 18-65 experiencing stress or mild mental health concerns', '{"age_range": "18-65", "criteria": ["stress_management", "anxiety_support", "depression_screening"]}', '{"counseling_sessions": 8, "wellness_workshops": 4, "support_groups": 12}', '{"medisave_coverage": true, "healthier_sg_subsidy": "60%"}', '{"monthly_wellness_reports": true}', true, NOW(), NOW());

-- =====================================================
-- SAMPLE PROGRAM ENROLLMENTS
-- =====================================================

INSERT INTO "program_enrollments" ("id", "userId", "programId", "enrollmentMethod", "status", "enrollmentDate", "programData", "createdAt", "updatedAt") VALUES
('pe_001', '550e8400-e29b-41d4-a716-446655440004', 'hsgsg_001', 'ONLINE_SELF_ENROLLMENT', 'ACTIVE', '2024-10-15', '{"risk_score": 7.2, "baseline_hba1c": 5.8, "primary_clinic": "clinic_001", "assigned_doctor": "doctor_001"}', NOW(), NOW()),
('pe_002', '550e8400-e29b-41d4-a716-446655440005', 'hsgsg_002', 'CLINIC_ASSISTED', 'ACTIVE', '2024-11-01', '{"risk_assessment": "moderate", "baseline_cholesterol": 6.2, "smoking_status": "former", "primary_clinic": "clinic_002", "assigned_doctor": "doctor_002"}', NOW(), NOW()),
('pe_003', '550e8400-e29b-41d4-a716-446655440006', 'hsgsg_003', 'REFERRAL', 'ACTIVE', '2024-11-03', '{"stress_level": "high", "sleep_quality": "poor", "primary_clinic": "clinic_003", "assigned_doctor": "doctor_003"}', NOW(), NOW());

-- =====================================================
-- SAMPLE CONTACT CATEGORIES
-- =====================================================

INSERT INTO "contact_categories" ("id", "name", "displayName", "description", "priority", "department", "responseSLAHours", "resolutionSLADays", "isActive", "sortOrder", "createdAt", "updatedAt") VALUES
('cc_001', 'general', 'General Inquiry', 'General questions and information requests', 'STANDARD', 'GENERAL', 24, 7, true, 1, NOW(), NOW()),
('cc_002', 'appointment', 'Appointment Request', 'Scheduling and appointment-related inquiries', 'HIGH', 'APPOINTMENTS', 4, 1, true, 2, NOW(), NOW()),
('cc_003', 'healthier_sg', 'Healthier SG Program', 'Healthier SG program enrollment and support', 'HIGH', 'HEALTHIER_SG', 8, 3, true, 3, NOW(), NOW()),
('cc_004', 'urgent', 'Urgent Medical', 'Urgent medical concerns and emergency inquiries', 'CRITICAL', 'EMERGENCY', 1, 1, true, 4, NOW(), NOW()),
('cc_005', 'technical', 'Technical Support', 'Website and technical issues', 'STANDARD', 'TECHNICAL_SUPPORT', 12, 5, true, 5, NOW(), NOW());

-- =====================================================
-- SAMPLE AUDIT LOGS
-- =====================================================

INSERT INTO "audit_logs" ("id", "userId", "action", "entityType", "entityId", "newValues", "timestamp", "dataSensitivity") VALUES
('audit_001', '550e8400-e29b-41d4-a716-446655440000', 'SCHEMA_INITIALIZED', 'DATABASE', 'complete', '{"message": "Local development database initialized with sample data"}', NOW(), 'INTERNAL'),
('audit_002', '550e8400-e29b-41d4-a716-446655440000', 'SAMPLE_DATA_CREATED', 'DATABASE', 'sample', '{"clinics": 3, "doctors": 3, "services": 11, "users": 8}', NOW(), 'INTERNAL'),
('audit_003', '550e8400-e29b-41d4-a716-446655440000', 'HEALTHIER_SG_SETUP', 'SYSTEM', 'programs', '{"programs_created": 3, "enrollments": 3}', NOW(), 'INTERNAL');

-- =====================================================
-- DEVELOPMENT NOTES
-- =====================================================

-- Sample data summary:
-- - 8 Users (1 Admin, 3 Doctors, 3 Patients, 1 Support Staff)
-- - 3 Clinics with full operating information
-- - 3 Doctors with specializations
-- - 3 Healthier SG Programs
-- - 11 Services across 5 categories
-- - 15 Clinic-Service combinations
-- - Complete address and location data for Singapore
-- - Healthcare compliance setup (PDPA, MOH)

-- To use this data:
-- 1. Run complete-schema.sql first
-- 2. Run this local-dev-init.sql file
-- 3. Update any passwords/credentials as needed
-- 4. Configure environment variables for your setup

-- =====================================================
-- INITIALIZATION COMPLETED
-- =====================================================