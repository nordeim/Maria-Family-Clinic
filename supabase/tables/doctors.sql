CREATE TABLE doctors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    clinic_id UUID NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    bio TEXT NOT NULL,
    image_url TEXT,
    rating DECIMAL(3,2) DEFAULT 4.5,
    experience_years INTEGER NOT NULL DEFAULT 5,
    education TEXT[] DEFAULT '{}',
    languages TEXT[] DEFAULT '{}',
    consultation_fee DECIMAL(10,2) NOT NULL DEFAULT 100.00,
    available_slots TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);