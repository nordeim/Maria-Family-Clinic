-- Migration: add_doctors_clinic_fkey
-- Created at: 1762397528


-- Add foreign key constraint from doctors to clinics
ALTER TABLE doctors
ADD CONSTRAINT doctors_clinic_id_fkey 
FOREIGN KEY (clinic_id) 
REFERENCES clinics(id) 
ON DELETE SET NULL;
;