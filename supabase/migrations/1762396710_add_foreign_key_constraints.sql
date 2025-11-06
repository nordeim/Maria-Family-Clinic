-- Migration: add_foreign_key_constraints
-- Created at: 1762396710


-- Add foreign key constraint from reviews to doctors
ALTER TABLE reviews
ADD CONSTRAINT reviews_doctor_id_fkey 
FOREIGN KEY (doctor_id) 
REFERENCES doctors(id) 
ON DELETE CASCADE;

-- Add foreign key constraint from appointments to doctors
ALTER TABLE appointments
ADD CONSTRAINT appointments_doctor_id_fkey 
FOREIGN KEY (doctor_id) 
REFERENCES doctors(id) 
ON DELETE CASCADE;

-- Add foreign key constraint from appointments to clinics
ALTER TABLE appointments
ADD CONSTRAINT appointments_clinic_id_fkey 
FOREIGN KEY (clinic_id) 
REFERENCES clinics(id) 
ON DELETE CASCADE;
;