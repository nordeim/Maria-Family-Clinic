-- Sample Data for Healthcare Database

-- Insert clinics
INSERT INTO clinics (id, name, address, phone, email, hours, latitude, longitude, services, facilities, rating, is_active) VALUES
('11111111-1111-1111-1111-111111111111', 'Central Clinic Singapore', '123 Orchard Road, Singapore 238859', '+65 6234 5678', 'central@myfamilyclinic.com', 
 '{"monday": "8:00 AM - 8:00 PM", "tuesday": "8:00 AM - 8:00 PM", "wednesday": "8:00 AM - 8:00 PM", "thursday": "8:00 AM - 8:00 PM", "friday": "8:00 AM - 8:00 PM", "saturday": "9:00 AM - 5:00 PM", "sunday": "9:00 AM - 5:00 PM"}',
 1.3048, 103.8318, 
 '["General Consultation", "Cardiology", "Health Screening", "Vaccination", "Minor Surgery"]',
 '["Wheelchair Accessible", "Parking", "ATM", "Pharmacy", "Emergency Room"]', 4.7, true),

('22222222-2222-2222-2222-222222222222', 'East Medical Centre', '456 Tampines Road, Singapore 529765', '+65 6789 0123', 'east@myfamilyclinic.com',
 '{"monday": "8:00 AM - 8:00 PM", "tuesday": "8:00 AM - 8:00 PM", "wednesday": "8:00 AM - 8:00 PM", "thursday": "8:00 AM - 8:00 PM", "friday": "8:00 AM - 8:00 PM", "saturday": "9:00 AM - 5:00 PM", "sunday": "Closed"}',
 1.3540, 103.9432,
 '["Pediatrics", "Orthopedics", "Dermatology", "Mental Health", "Health Screening"]',
 '["Parking", "Children Play Area", "Pharmacy", "Laboratory"]', 4.6, true),

('33333333-3333-3333-3333-333333333333', 'West Health Hub', '789 Jurong West Street, Singapore 640789', '+65 9123 4567', 'west@myfamilyclinic.com',
 '{"monday": "7:00 AM - 9:00 PM", "tuesday": "7:00 AM - 9:00 PM", "wednesday": "7:00 AM - 9:00 PM", "thursday": "7:00 AM - 9:00 PM", "friday": "7:00 AM - 9:00 PM", "saturday": "8:00 AM - 6:00 PM", "sunday": "8:00 AM - 6:00 PM"}',
 1.3414, 103.7089,
 '["Emergency Care", "Cardiology", "Orthopedics", "General Consultation", "Telemedicine", "Minor Surgery"]',
 '["24/7 Emergency", "Ambulance", "ICU", "Operating Theatre", "Parking", "Pharmacy", "ATM"]', 4.8, true);

-- Insert services
INSERT INTO services (id, name, category, description, price_range, duration_minutes, is_active) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Primary Care Consultation', 'General Health', 'Comprehensive health check-up with our experienced family doctors', '$50 - $80', 30, true),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Cardiology Consultation', 'Specialist Care', 'Heart health assessment and cardiovascular evaluation by our cardiologist', '$120 - $180', 45, true),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Comprehensive Health Screen', 'Health Screening', 'Full body health screening including blood tests, ECG, and imaging', '$200 - $350', 120, true),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Pediatric Consultation', 'Child Care', 'Specialized healthcare for children and adolescents', '$60 - $90', 30, true),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Orthopedic Assessment', 'Specialist Care', 'Evaluation and treatment of musculoskeletal conditions', '$100 - $150', 45, true),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Dermatology Consultation', 'Specialist Care', 'Skin health assessment and treatment by dermatologist', '$90 - $130', 30, true),
('gggggggg-gggg-gggg-gggg-gggggggggggg', 'Vaccination Service', 'Preventive Care', 'Routine and travel vaccinations administered by qualified nurses', '$30 - $100', 15, true),
('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'Mental Health Consultation', 'Mental Health', 'Psychological counseling and mental health assessment', '$100 - $150', 60, true);

-- Insert doctors
INSERT INTO doctors (id, name, specialty, clinic_id, phone, email, bio, rating, experience_years, education, languages, consultation_fee, available_slots, is_active) VALUES
('doctoraaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Dr. Sarah Lim Wei Ming', 'Cardiology', '11111111-1111-1111-1111-111111111111', '+65 6234 5679', 'sarah.lim@myfamilyclinic.com', 
 'Dr. Sarah Lim is a board-certified cardiologist with over 15 years of experience in cardiovascular medicine. She specializes in preventive cardiology and has published numerous research papers on heart disease prevention.', 
 4.8, 15, 
 '["MBBS (Singapore)", "MRCP (UK)", "FAMS Cardiology", "Fellowship in Interventional Cardiology (Mayo Clinic)"]',
 '["English", "Mandarin", "Malay"]', 150.00,
 '["09:00", "10:30", "14:00", "15:30"]', true),

('doctorbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Dr. James Wong Chen Hao', 'Orthopedics', '22222222-2222-2222-2222-222222222222', '+65 6789 0124', 'james.wong@myfamilyclinic.com',
 'Dr. James Wong is a leading orthopedic surgeon specializing in sports medicine and joint replacement surgery. He has successfully treated over 1000 patients with various musculoskeletal conditions.',
 4.9, 12,
 '["MBBS (Singapore)", "MRCS (Edinburgh)", "FRCS Orthopaedics (Edinburgh)", "Fellowship in Sports Medicine (Australia)"]',
 '["English", "Mandarin"]', 120.00,
 '["09:00", "11:00", "14:00", "16:00"]', true),

('doctorcccc-cccc-cccc-cccc-cccccccccccc', 'Dr. Lisa Chen Li Min', 'Pediatrics', '22222222-2222-2222-2222-222222222222', '+65 6789 0125', 'lisa.chen@myfamilyclinic.com',
 'Dr. Lisa Chen is a dedicated pediatrician with a passion for child healthcare. She has extensive experience in treating children from infancy through adolescence and is known for her gentle approach.',
 4.7, 10,
 '["MBBS (Singapore)", "MRCPCH (UK)", "Fellow in Pediatric Emergency Medicine"]',
 '["English", "Mandarin", "Hokkien"]', 80.00,
 '["09:00", "10:00", "11:00", "15:00", "16:00"]', true),

('doctordddd-dddd-dddd-dddd-dddddddddddd', 'Dr. Ahmed Rahman bin Hassan', 'General Practice', '11111111-1111-1111-1111-111111111111', '+65 6234 5680', 'ahmed.rahman@myfamilyclinic.com',
 'Dr. Ahmed Rahman is a family medicine physician with expertise in chronic disease management and preventive care. He believes in holistic healthcare and building long-term relationships with patients.',
 4.6, 8,
 '["MBBS (Malaysia)", "Graduate Diploma in Family Medicine (Singapore)", "MRCGP (UK)"]',
 '["English", "Malay", "Arabic"]', 60.00,
 '["08:00", "09:30", "11:00", "14:00", "15:30", "17:00"]', true),

('doctoreeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Dr. Priya Sharma Devi', 'Dermatology', '33333333-3333-3333-3333-333333333333', '+65 9123 4568', 'priya.sharma@myfamilyclinic.com',
 'Dr. Priya Sharma is a dermatologist specializing in cosmetic and medical dermatology. She has advanced training in laser treatments and skin cancer management.',
 4.8, 11,
 '["MBBS (India)", "MRCP (UK)", "Specialist in Dermatology (Singapore)", "Fellowship in Cosmetic Dermatology (Thailand)"]',
 '["English", "Hindi", "Tamil"]', 110.00,
 '["09:00", "10:30", "13:30", "15:00"]', true),

('doctorffff-ffff-ffff-ffff-ffffffffffff', 'Dr. Michael Tan Kok Soon', 'Emergency Medicine', '33333333-3333-3333-3333-333333333333', '+65 9123 4569', 'michael.tan@myfamilyclinic.com',
 'Dr. Michael Tan is an emergency medicine physician with extensive experience in trauma care and critical emergencies. He leads our 24/7 emergency department.',
 4.9, 14,
 '["MBBS (Singapore)", "MRCP (UK)", "Fellow in Emergency Medicine (Australia)", "Advanced Trauma Life Support Certified"]',
 '["English", "Mandarin"]', 200.00,
 '["00:00", "08:00", "16:00"]', true);

-- Insert more services for better coverage
INSERT INTO services (name, category, description, price_range, duration_minutes, is_active) VALUES
('Eye Examination', 'Eye Care', 'Comprehensive eye health check including vision test and eye pressure measurement', '$40 - $70', 30, true),
('Dental Check-up', 'Dental Care', 'Routine dental examination and oral health assessment', '$60 - $100', 30, true),
('Physiotherapy Session', 'Rehabilitation', 'Professional physiotherapy treatment for injury recovery and mobility improvement', '$80 - $120', 45, true),
('Nutrition Consultation', 'Health & Wellness', 'Personalized nutrition counseling and diet planning', '$70 - $100', 60, true),
('Ultrasound Scan', 'Diagnostic Imaging', 'Ultrasound examination for various medical conditions', '$150 - $250', 30, true),
('X-Ray Imaging', 'Diagnostic Imaging', 'Digital X-ray imaging for bone and internal organ assessment', '$80 - $150', 15, true),
('Blood Test Panel', 'Laboratory', 'Comprehensive blood work including CBC, lipid profile, and diabetes screening', '$100 - $200', 10, true),
('COVID-19 Vaccination', 'Preventive Care', 'COVID-19 vaccination service with consultation', 'Free', 20, true);