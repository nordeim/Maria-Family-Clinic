import { supabase } from './src/lib/supabase'

// Execute schema creation
async function createDatabaseSchema() {
  try {
    console.log('Creating database schema...')
    
    // Read and execute schema SQL
    const schemaSql = `
      -- Healthcare Database Schema
      -- Drop existing tables if they exist
      DROP TABLE IF EXISTS doctors CASCADE;
      DROP TABLE IF EXISTS clinics CASCADE;
      DROP TABLE IF EXISTS services CASCADE;
      DROP TABLE IF EXISTS user_profiles CASCADE;
      DROP TABLE IF EXISTS appointments CASCADE;
      DROP TABLE IF EXISTS reviews CASCADE;

      -- Create clinics table
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

      -- Create services table
      CREATE TABLE services (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name TEXT NOT NULL,
          category TEXT NOT NULL,
          description TEXT NOT NULL,
          price_range TEXT NOT NULL,
          duration_minutes INTEGER NOT NULL DEFAULT 30,
          image_url TEXT,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create doctors table
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

      -- Create user_profiles table
      CREATE TABLE user_profiles (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          full_name TEXT NOT NULL,
          phone TEXT,
          date_of_birth DATE,
          gender TEXT,
          emergency_contact TEXT,
          medical_history TEXT,
          allergies TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id)
      );

      -- Create appointments table
      CREATE TABLE appointments (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          doctor_id UUID NOT NULL,
          clinic_id UUID NOT NULL,
          service_id UUID NOT NULL,
          appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
          duration_minutes INTEGER NOT NULL DEFAULT 30,
          status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled')),
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create reviews table
      CREATE TABLE reviews (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          doctor_id UUID NOT NULL,
          rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
          comment TEXT,
          is_approved BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
    
    // Execute schema creation using RPC (since direct SQL execution requires admin access)
    const { error: schemaError } = await supabase.rpc('execute_sql', { sql: schemaSql })
    
    if (schemaError) {
      console.error('Schema creation error:', schemaError)
      // Continue anyway as tables might already exist
    } else {
      console.log('✅ Database schema created successfully')
    }
    
  } catch (error) {
    console.error('Error creating schema:', error)
  }
}

// Insert sample data
async function insertSampleData() {
  try {
    console.log('Inserting sample data...')
    
    // Insert clinics
    const { data: clinics, error: clinicsError } = await supabase
      .from('clinics')
      .insert([
        {
          id: '11111111-1111-1111-1111-111111111111',
          name: 'Central Clinic Singapore',
          address: '123 Orchard Road, Singapore 238859',
          phone: '+65 6234 5678',
          email: 'central@myfamilyclinic.com',
          hours: {
            monday: "8:00 AM - 8:00 PM",
            tuesday: "8:00 AM - 8:00 PM",
            wednesday: "8:00 AM - 8:00 PM",
            thursday: "8:00 AM - 8:00 PM",
            friday: "8:00 AM - 8:00 PM",
            saturday: "9:00 AM - 5:00 PM",
            sunday: "9:00 AM - 5:00 PM"
          },
          latitude: 1.3048,
          longitude: 103.8318,
          services: ["General Consultation", "Cardiology", "Health Screening", "Vaccination", "Minor Surgery"],
          facilities: ["Wheelchair Accessible", "Parking", "ATM", "Pharmacy", "Emergency Room"],
          rating: 4.7,
          is_active: true
        },
        {
          id: '22222222-2222-2222-2222-222222222222',
          name: 'East Medical Centre',
          address: '456 Tampines Road, Singapore 529765',
          phone: '+65 6789 0123',
          email: 'east@myfamilyclinic.com',
          hours: {
            monday: "8:00 AM - 8:00 PM",
            tuesday: "8:00 AM - 8:00 PM",
            wednesday: "8:00 AM - 8:00 PM",
            thursday: "8:00 AM - 8:00 PM",
            friday: "8:00 AM - 8:00 PM",
            saturday: "9:00 AM - 5:00 PM",
            sunday: "Closed"
          },
          latitude: 1.3540,
          longitude: 103.9432,
          services: ["Pediatrics", "Orthopedics", "Dermatology", "Mental Health", "Health Screening"],
          facilities: ["Parking", "Children Play Area", "Pharmacy", "Laboratory"],
          rating: 4.6,
          is_active: true
        },
        {
          id: '33333333-3333-3333-3333-333333333333',
          name: 'West Health Hub',
          address: '789 Jurong West Street, Singapore 640789',
          phone: '+65 9123 4567',
          email: 'west@myfamilyclinic.com',
          hours: {
            monday: "7:00 AM - 9:00 PM",
            tuesday: "7:00 AM - 9:00 PM",
            wednesday: "7:00 AM - 9:00 PM",
            thursday: "7:00 AM - 9:00 PM",
            friday: "7:00 AM - 9:00 PM",
            saturday: "8:00 AM - 6:00 PM",
            sunday: "8:00 AM - 6:00 PM"
          },
          latitude: 1.3414,
          longitude: 103.7089,
          services: ["Emergency Care", "Cardiology", "Orthopedics", "General Consultation", "Telemedicine", "Minor Surgery"],
          facilities: ["24/7 Emergency", "Ambulance", "ICU", "Operating Theatre", "Parking", "Pharmacy", "ATM"],
          rating: 4.8,
          is_active: true
        }
      ])
    
    if (clinicsError) {
      console.error('Clinics insertion error:', clinicsError)
    } else {
      console.log('✅ Clinics data inserted')
    }

    // Insert services
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .insert([
        {
          name: 'Primary Care Consultation',
          category: 'General Health',
          description: 'Comprehensive health check-up with our experienced family doctors',
          price_range: '$50 - $80',
          duration_minutes: 30,
          is_active: true
        },
        {
          name: 'Cardiology Consultation',
          category: 'Specialist Care',
          description: 'Heart health assessment and cardiovascular evaluation by our cardiologist',
          price_range: '$120 - $180',
          duration_minutes: 45,
          is_active: true
        },
        {
          name: 'Comprehensive Health Screen',
          category: 'Health Screening',
          description: 'Full body health screening including blood tests, ECG, and imaging',
          price_range: '$200 - $350',
          duration_minutes: 120,
          is_active: true
        },
        {
          name: 'Pediatric Consultation',
          category: 'Child Care',
          description: 'Specialized healthcare for children and adolescents',
          price_range: '$60 - $90',
          duration_minutes: 30,
          is_active: true
        },
        {
          name: 'Orthopedic Assessment',
          category: 'Specialist Care',
          description: 'Evaluation and treatment of musculoskeletal conditions',
          price_range: '$100 - $150',
          duration_minutes: 45,
          is_active: true
        },
        {
          name: 'Dermatology Consultation',
          category: 'Specialist Care',
          description: 'Skin health assessment and treatment by dermatologist',
          price_range: '$90 - $130',
          duration_minutes: 30,
          is_active: true
        },
        {
          name: 'Vaccination Service',
          category: 'Preventive Care',
          description: 'Routine and travel vaccinations administered by qualified nurses',
          price_range: '$30 - $100',
          duration_minutes: 15,
          is_active: true
        },
        {
          name: 'Mental Health Consultation',
          category: 'Mental Health',
          description: 'Psychological counseling and mental health assessment',
          price_range: '$100 - $150',
          duration_minutes: 60,
          is_active: true
        },
        {
          name: 'Eye Examination',
          category: 'Eye Care',
          description: 'Comprehensive eye health check including vision test and eye pressure measurement',
          price_range: '$40 - $70',
          duration_minutes: 30,
          is_active: true
        },
        {
          name: 'Dental Check-up',
          category: 'Dental Care',
          description: 'Routine dental examination and oral health assessment',
          price_range: '$60 - $100',
          duration_minutes: 30,
          is_active: true
        }
      ])

    if (servicesError) {
      console.error('Services insertion error:', servicesError)
    } else {
      console.log('✅ Services data inserted')
    }

    // Get clinic IDs for doctors
    const { data: clinicsData, error: clinicsFetchError } = await supabase
      .from('clinics')
      .select('id, name')

    if (clinicsFetchError) {
      console.error('Error fetching clinics:', clinicsFetchError)
      return
    }

    const centralClinic = clinicsData?.find(c => c.name === 'Central Clinic Singapore')
    const eastClinic = clinicsData?.find(c => c.name === 'East Medical Centre')
    const westClinic = clinicsData?.find(c => c.name === 'West Health Hub')

    // Insert doctors
    const { data: doctors, error: doctorsError } = await supabase
      .from('doctors')
      .insert([
        {
          name: 'Dr. Sarah Lim Wei Ming',
          specialty: 'Cardiology',
          clinic_id: centralClinic?.id,
          phone: '+65 6234 5679',
          email: 'sarah.lim@myfamilyclinic.com',
          bio: 'Dr. Sarah Lim is a board-certified cardiologist with over 15 years of experience in cardiovascular medicine. She specializes in preventive cardiology and has published numerous research papers on heart disease prevention.',
          rating: 4.8,
          experience_years: 15,
          education: ['MBBS (Singapore)', 'MRCP (UK)', 'FAMS Cardiology', 'Fellowship in Interventional Cardiology (Mayo Clinic)'],
          languages: ['English', 'Mandarin', 'Malay'],
          consultation_fee: 150.00,
          available_slots: ['09:00', '10:30', '14:00', '15:30'],
          is_active: true
        },
        {
          name: 'Dr. James Wong Chen Hao',
          specialty: 'Orthopedics',
          clinic_id: eastClinic?.id,
          phone: '+65 6789 0124',
          email: 'james.wong@myfamilyclinic.com',
          bio: 'Dr. James Wong is a leading orthopedic surgeon specializing in sports medicine and joint replacement surgery. He has successfully treated over 1000 patients with various musculoskeletal conditions.',
          rating: 4.9,
          experience_years: 12,
          education: ['MBBS (Singapore)', 'MRCS (Edinburgh)', 'FRCS Orthopaedics (Edinburgh)', 'Fellowship in Sports Medicine (Australia)'],
          languages: ['English', 'Mandarin'],
          consultation_fee: 120.00,
          available_slots: ['09:00', '11:00', '14:00', '16:00'],
          is_active: true
        },
        {
          name: 'Dr. Lisa Chen Li Min',
          specialty: 'Pediatrics',
          clinic_id: eastClinic?.id,
          phone: '+65 6789 0125',
          email: 'lisa.chen@myfamilyclinic.com',
          bio: 'Dr. Lisa Chen is a dedicated pediatrician with a passion for child healthcare. She has extensive experience in treating children from infancy through adolescence and is known for her gentle approach.',
          rating: 4.7,
          experience_years: 10,
          education: ['MBBS (Singapore)', 'MRCPCH (UK)', 'Fellow in Pediatric Emergency Medicine'],
          languages: ['English', 'Mandarin', 'Hokkien'],
          consultation_fee: 80.00,
          available_slots: ['09:00', '10:00', '11:00', '15:00', '16:00'],
          is_active: true
        },
        {
          name: 'Dr. Ahmed Rahman bin Hassan',
          specialty: 'General Practice',
          clinic_id: centralClinic?.id,
          phone: '+65 6234 5680',
          email: 'ahmed.rahman@myfamilyclinic.com',
          bio: 'Dr. Ahmed Rahman is a family medicine physician with expertise in chronic disease management and preventive care. He believes in holistic healthcare and building long-term relationships with patients.',
          rating: 4.6,
          experience_years: 8,
          education: ['MBBS (Malaysia)', 'Graduate Diploma in Family Medicine (Singapore)', 'MRCGP (UK)'],
          languages: ['English', 'Malay', 'Arabic'],
          consultation_fee: 60.00,
          available_slots: ['08:00', '09:30', '11:00', '14:00', '15:30', '17:00'],
          is_active: true
        },
        {
          name: 'Dr. Priya Sharma Devi',
          specialty: 'Dermatology',
          clinic_id: westClinic?.id,
          phone: '+65 9123 4568',
          email: 'priya.sharma@myfamilyclinic.com',
          bio: 'Dr. Priya Sharma is a dermatologist specializing in cosmetic and medical dermatology. She has advanced training in laser treatments and skin cancer management.',
          rating: 4.8,
          experience_years: 11,
          education: ['MBBS (India)', 'MRCP (UK)', 'Specialist in Dermatology (Singapore)', 'Fellowship in Cosmetic Dermatology (Thailand)'],
          languages: ['English', 'Hindi', 'Tamil'],
          consultation_fee: 110.00,
          available_slots: ['09:00', '10:30', '13:30', '15:00'],
          is_active: true
        },
        {
          name: 'Dr. Michael Tan Kok Soon',
          specialty: 'Emergency Medicine',
          clinic_id: westClinic?.id,
          phone: '+65 9123 4569',
          email: 'michael.tan@myfamilyclinic.com',
          bio: 'Dr. Michael Tan is an emergency medicine physician with extensive experience in trauma care and critical emergencies. He leads our 24/7 emergency department.',
          rating: 4.9,
          experience_years: 14,
          education: ['MBBS (Singapore)', 'MRCP (UK)', 'Fellow in Emergency Medicine (Australia)', 'Advanced Trauma Life Support Certified'],
          languages: ['English', 'Mandarin'],
          consultation_fee: 200.00,
          available_slots: ['00:00', '08:00', '16:00'],
          is_active: true
        }
      ])

    if (doctorsError) {
      console.error('Doctors insertion error:', doctorsError)
    } else {
      console.log('✅ Doctors data inserted')
    }

    console.log('✅ Sample data insertion completed successfully!')
    
  } catch (error) {
    console.error('Error inserting sample data:', error)
  }
}

// Main execution
async function main() {
  try {
    console.log('🚀 Setting up healthcare database...')
    
    // Create schema
    await createDatabaseSchema()
    
    // Wait a moment for schema to be ready
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Insert sample data
    await insertSampleData()
    
    console.log('🎉 Database setup completed!')
    
    // Verify data
    console.log('\n📊 Verifying data...')
    
    const [doctorsCount, clinicsCount, servicesCount] = await Promise.all([
      supabase.from('doctors').select('id', { count: 'exact', head: true }),
      supabase.from('clinics').select('id', { count: 'exact', head: true }),
      supabase.from('services').select('id', { count: 'exact', head: true })
    ])
    
    console.log(`✅ Total Doctors: ${doctorsCount.count || 0}`)
    console.log(`✅ Total Clinics: ${clinicsCount.count || 0}`)
    console.log(`✅ Total Services: ${servicesCount.count || 0}`)
    
  } catch (error) {
    console.error('❌ Database setup failed:', error)
  }
}

// Export for use in build script
export { createDatabaseSchema, insertSampleData }

if (require.main === module) {
  main()
}