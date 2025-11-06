CREATE TABLE clinics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    hours JSONB NOT NULL DEFAULT '{}',
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    services TEXT[],
    facilities TEXT[],
    rating DECIMAL(3,2) DEFAULT 4.5,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);