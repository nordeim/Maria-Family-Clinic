-- Migration: healthcare_sample_data
-- Created at: 1762388296

-- ===== SAMPLE DATA INSERTION =====
-- Execute these SQL commands AFTER creating the schema

-- ===== INSERT CLINICS =====
INSERT INTO clinics (name, address, phone, email, hours, latitude, longitude, services, facilities, rating, is_active) VALUES
('Central Clinic Singapore', '123 Orchard Road, Singapore 238859', '+65 6234 5678', 'central@myfamilyclinic.com', 
 '{"monday": "8:00 AM - 8:00 PM", "tuesday": "8:00 AM - 8:00 PM", "wednesday": "8:00 AM - 8:00 PM", "thursday": "8:00 AM - 8:00 PM", "friday": "8:00 AM - 8:00 PM", "saturday": "9:00 AM - 5:00 PM", "sunday": "9:00 AM - 5:00 PM"}',
 1.3048, 103.8318, 
 ARRAY['General Consultation', 'Cardiology', 'Health Screening', 'Vaccination', 'Minor Surgery'],
 ARRAY['Wheelchair Accessible', 'Parking', 'ATM', 'Pharmacy', 'Emergency Room'], 4.7, true),

('East Medical Centre', '456 Tampines Road, Singapore 529765', '+65 6789 0123', 'east@myfamilyclinic.com',
 '{"monday": "8:00 AM - 8:00 PM", "tuesday": "8:00 AM - 8:00 PM", "wednesday": "8:00 AM - 8:00 PM", "thursday": "8:00 AM - 8:00 PM", "friday": "8:00 AM - 8:00 PM", "saturday": "9:00 AM - 5:00 PM", "sunday": "Closed"}',
 1.3540, 103.9432,
 ARRAY['Pediatrics', 'Orthopedics', 'Dermatology', 'Mental Health', 'Health Screening'],
 ARRAY['Parking', 'Children Play Area', 'Pharmacy', 'Laboratory'], 4.6, true),

('West Health Hub', '789 Jurong West Street, Singapore 640789', '+65 9123 4567', 'west@myfamilyclinic.com',
 '{"monday": "7:00 AM - 9:00 PM", "tuesday": "7:00 AM - 9:00 PM", "wednesday": "7:00 AM - 9:00 PM", "thursday": "7:00 AM - 9:00 PM", "friday": "7:00 AM - 9:00 PM", "saturday": "8:00 AM - 6:00 PM", "sunday": "8:00 AM - 6:00 PM"}',
 1.3414, 103.7089,
 ARRAY['Emergency Care', 'Cardiology', 'Orthopedics', 'General Consultation', 'Telemedicine', 'Minor Surgery'],
 ARRAY['24/7 Emergency', 'Ambulance', 'ICU', 'Operating Theatre', 'Parking', 'Pharmacy', 'ATM'], 4.8, true);

-- ===== INSERT SERVICES =====
INSERT INTO services (name, category, description, price_range, duration_minutes, is_active) VALUES
('Primary Care Consultation', 'General Health', 'Comprehensive health check-up with our experienced family doctors', '$50 - $80', 30, true),
('Cardiology Consultation', 'Specialist Care', 'Heart health assessment and cardiovascular evaluation by our cardiologist', '$120 - $180', 45, true),
('Comprehensive Health Screen', 'Health Screening', 'Full body health screening including blood tests, ECG, and imaging', '$200 - $350', 120, true),
('Pediatric Consultation', 'Child Care', 'Specialized healthcare for children and adolescents', '$60 - $90', 30, true),
('Orthopedic Assessment', 'Specialist Care', 'Evaluation and treatment of musculoskeletal conditions', '$100 - $150', 45, true),
('Dermatology Consultation', 'Specialist Care', 'Skin health assessment and treatment by dermatologist', '$90 - $130', 30, true),
('Vaccination Service', 'Preventive Care', 'Routine and travel vaccinations administered by qualified nurses', '$30 - $100', 15, true),
('Mental Health Consultation', 'Mental Health', 'Psychological counseling and mental health assessment', '$100 - $150', 60, true),
('Eye Examination', 'Eye Care', 'Comprehensive eye health check including vision test and eye pressure measurement', '$40 - $70', 30, true),
('Dental Check-up', 'Dental Care', 'Routine dental examination and oral health assessment', '$60 - $100', 30, true),
('Physiotherapy Session', 'Rehabilitation', 'Professional physiotherapy treatment for injury recovery and mobility improvement', '$80 - $120', 45, true),
('Nutrition Consultation', 'Health & Wellness', 'Personalized nutrition counseling and diet planning', '$70 - $100', 60, true),
('Ultrasound Scan', 'Diagnostic Imaging', 'Ultrasound examination for various medical conditions', '$150 - $250', 30, true),
('X-Ray Imaging', 'Diagnostic Imaging', 'Digital X-ray imaging for bone and internal organ assessment', '$80 - $150', 15, true),
('Blood Test Panel', 'Laboratory', 'Comprehensive blood work including CBC, lipid profile, and diabetes screening', '$100 - $200', 10, true),
('COVID-19 Vaccination', 'Preventive Care', 'COVID-19 vaccination service with consultation', 'Free', 20, true);

-- Get clinic IDs for doctors
DO $$
DECLARE
    central_clinic_id UUID;
    east_clinic_id UUID;
    west_clinic_id UUID;
BEGIN
    SELECT id INTO central_clinic_id FROM clinics WHERE name = 'Central Clinic Singapore';
    SELECT id INTO east_clinic_id FROM clinics WHERE name = 'East Medical Centre';
    SELECT id INTO west_clinic_id FROM clinics WHERE name = 'West Health Hub';

-- ===== INSERT DOCTORS =====
INSERT INTO doctors (name, specialty, clinic_id, phone, email, bio, rating, experience_years, education, languages, consultation_fee, available_slots, is_active) VALUES
('Dr. Sarah Lim Wei Ming', 'Cardiology', central_clinic_id, '+65 6234 5679', 'sarah.lim@myfamilyclinic.com', 
 'Dr. Sarah Lim is a board-certified cardiologist with over 15 years of experience in cardiovascular medicine. She specializes in preventive cardiology and has published numerous research papers on heart disease prevention.', 
 4.8, 15, 
 ARRAY['MBBS (Singapore)', 'MRCP (UK)', 'FAMS Cardiology', 'Fellowship in Interventional Cardiology (Mayo Clinic)'],
 ARRAY['English', 'Mandarin', 'Malay'], 150.00,
 ARRAY['09:00', '10:30', '14:00', '15:30'], true),

('Dr. James Wong Chen Hao', 'Orthopedics', east_clinic_id, '+65 6789 0124', 'james.wong@myfamilyclinic.com',
 'Dr. James Wong is a leading orthopedic surgeon specializing in sports medicine and joint replacement surgery. He has successfully treated over 1000 patients with various musculoskeletal conditions.',
 4.9, 12,
 ARRAY['MBBS (Singapore)', 'MRCS (Edinburgh)', 'FRCS Orthopaedics (Edinburgh)', 'Fellowship in Sports Medicine (Australia)'],
 ARRAY['English', 'Mandarin'], 120.00,
 ARRAY['09:00', '11:00', '14:00', '16:00'], true),

('Dr. Lisa Chen Li Min', 'Pediatrics', east_clinic_id, '+65 6789 0125', 'lisa.chen@myfamilyclinic.com',
 'Dr. Lisa Chen is a dedicated pediatrician with a passion for child healthcare. She has extensive experience in treating children from infancy through adolescence and is known for her gentle approach.',
 4.7, 10,
 ARRAY['MBBS (Singapore)', 'MRCPCH (UK)', 'Fellow in Pediatric Emergency Medicine'],
 ARRAY['English', 'Mandarin', 'Hokkien'], 80.00,
 ARRAY['09:00', '10:00', '11:00', '15:00', '16:00'], true),

('Dr. Ahmed Rahman bin Hassan', 'General Practice', central_clinic_id, '+65 6234 5680', 'ahmed.rahman@myfamilyclinic.com',
 'Dr. Ahmed Rahman is a family medicine physician with expertise in chronic disease management and preventive care. He believes in holistic healthcare and building long-term relationships with patients.',
 4.6, 8,
 ARRAY['MBBS (Malaysia)', 'Graduate Diploma in Family Medicine (Singapore)', 'MRCGP (UK)'],
 ARRAY['English', 'Malay', 'Arabic'], 60.00,
 ARRAY['08:00', '09:30', '11:00', '14:00', '15:30', '17:00'], true),

('Dr. Priya Sharma Devi', 'Dermatology', west_clinic_id, '+65 9123 4568', 'priya.sharma@myfamilyclinic.com',
 'Dr. Priya Sharma is a dermatologist specializing in cosmetic and medical dermatology. She has advanced training in laser treatments and skin cancer management.',
 4.8, 11,
 ARRAY['MBBS (India)', 'MRCP (UK)', 'Specialist in Dermatology (Singapore)', 'Fellowship in Cosmetic Dermatology (Thailand)'],
 ARRAY['English', 'Hindi', 'Tamil'], 110.00,
 ARRAY['09:00', '10:30', '13:30', '15:00'], true),

('Dr. Michael Tan Kok Soon', 'Emergency Medicine', west_clinic_id, '+65 9123 4569', 'michael.tan@myfamilyclinic.com',
 'Dr. Michael Tan is an emergency medicine physician with extensive experience in trauma care and critical emergencies. He leads our 24/7 emergency department.',
 4.9, 14,
 ARRAY['MBBS (Singapore)', 'MRCP (UK)', 'Fellow in Emergency Medicine (Australia)', 'Advanced Trauma Life Support Certified'],
 ARRAY['English', 'Mandarin'], 200.00,
 ARRAY['00:00', '08:00', '16:00'], true),

('Dr. Jennifer Liu Wei Ping', 'Internal Medicine', central_clinic_id, '+65 6234 5681', 'jennifer.liu@myfamilyclinic.com',
 'Dr. Jennifer Liu specializes in internal medicine with focus on diabetes management and chronic disease care. She is passionate about preventive medicine and patient education.',
 4.7, 9,
 ARRAY['MBBS (Singapore)', 'MRCP (UK)', 'Graduate Diploma in Diabetes Management'],
 ARRAY['English', 'Mandarin'], 90.00,
 ARRAY['09:00', '10:00', '14:00', '15:00', '16:00'], true),

('Dr. Raj Kumar Patel', 'Family Medicine', east_clinic_id, '+65 6789 0126', 'raj.patel@myfamilyclinic.com',
 'Dr. Raj Patel provides comprehensive family medicine services with special interest in geriatric care and women health screening. He is fluent in multiple languages.',
 4.6, 11,
 ARRAY['MBBS (India)', 'MRCGP (UK)', 'Certificate in Geriatric Medicine'],
 ARRAY['English', 'Hindi', 'Punjabi'], 70.00,
 ARRAY['08:30', '10:30', '13:30', '15:30', '17:30'], true);

END $$;;