import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Doctor {
  id: string
  name: string
  specialty: string
  clinic_id: string
  phone: string
  email: string
  bio: string
  image_url?: string
  rating: number
  experience_years: number
  education: string[]
  languages: string[]
  consultation_fee: number
  available_slots: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Clinic {
  id: string
  name: string
  address: string
  phone: string
  email: string
  hours: Record<string, string>
  latitude: number
  longitude: number
  services: string[]
  facilities: string[]
  rating: number
  image_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  name: string
  category: string
  description: string
  price_range: string
  duration_minutes: number
  image_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  user_id: string
  full_name: string
  phone: string
  date_of_birth?: string
  gender?: string
  emergency_contact?: string
  medical_history?: string
  allergies?: string
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  user_id: string
  doctor_id: string
  clinic_id: string
  service_id?: string
  appointment_date: string
  duration_minutes: number
  status: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Review {
  id: string
  user_id: string
  doctor_id: string
  rating: number
  comment: string
  is_approved: boolean
  created_at: string
}