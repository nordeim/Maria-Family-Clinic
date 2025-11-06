// Database types for Supabase
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          image: string | null
          email_verified: string | null
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          image?: string | null
          email_verified?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          image?: string | null
          email_verified?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      clinics: {
        Row: {
          id: string
          name: string
          address: string
          postal_code: string
          phone: string | null
          email: string | null
          website: string | null
          latitude: number
          longitude: number
          location: any // PostGIS point
          operating_hours: any // JSON
          facilities: string[] // Array of strings
          accreditation_status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address: string
          postal_code: string
          phone?: string | null
          email?: string | null
          website?: string | null
          latitude: number
          longitude: number
          location?: any
          operating_hours?: any
          facilities?: string[]
          accreditation_status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          postal_code?: string
          phone?: string | null
          email?: string | null
          website?: string | null
          latitude?: number
          longitude?: number
          location?: any
          operating_hours?: any
          facilities?: string[]
          accreditation_status?: string
          created_at?: string
          updated_at?: string
        }
      }
      doctors: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          medical_license: string
          specialties: string[]
          languages: string[]
          experience_years: number | null
          qualifications: string[]
          profile_image: string | null
          bio: string | null
          consultation_fee: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          medical_license: string
          specialties: string[]
          languages: string[]
          experience_years?: number | null
          qualifications: string[]
          profile_image?: string | null
          bio?: string | null
          consultation_fee?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          medical_license?: string
          specialties?: string[]
          languages?: string[]
          experience_years?: number | null
          qualifications?: string[]
          profile_image?: string | null
          bio?: string | null
          consultation_fee?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      services: {
        Row: {
          id: string
          name: string
          description: string | null
          category: string
          subcategory: string | null
          typical_duration_minutes: number | null
          price_range_min: number | null
          price_range_max: number | null
          is_healthier_sg_covered: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category: string
          subcategory?: string | null
          typical_duration_minutes?: number | null
          price_range_min?: number | null
          price_range_max?: number | null
          is_healthier_sg_covered?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: string
          subcategory?: string | null
          typical_duration_minutes?: number | null
          price_range_min?: number | null
          price_range_max?: number | null
          is_healthier_sg_covered?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      contact_forms: {
        Row: {
          id: string
          user_id: string | null
          clinic_id: string | null
          name: string
          email: string
          phone: string | null
          subject: string
          message: string
          enquiry_type: string
          preferred_language: string
          status: string
          priority: string
          created_at: string
          updated_at: string
          replied_at: string | null
          assigned_to: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          clinic_id?: string | null
          name: string
          email: string
          phone?: string | null
          subject: string
          message: string
          enquiry_type: string
          preferred_language?: string
          status?: string
          priority?: string
          created_at?: string
          updated_at?: string
          replied_at?: string | null
          assigned_to?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          clinic_id?: string | null
          name?: string
          email?: string
          phone?: string | null
          subject?: string
          message?: string
          enquiry_type?: string
          preferred_language?: string
          status?: string
          priority?: string
          created_at?: string
          updated_at?: string
          replied_at?: string | null
          assigned_to?: string | null
        }
      }
      search_logs: {
        Row: {
          id: string
          user_id: string | null
          session_id: string
          search_query: string
          search_filters: any
          results_count: number
          clicked_results: string[]
          search_timestamp: string
          response_time_ms: number
        }
        Insert: {
          id?: string
          user_id?: string | null
          session_id: string
          search_query: string
          search_filters?: any
          results_count?: number
          clicked_results?: string[]
          search_timestamp?: string
          response_time_ms?: number
        }
        Update: {
          id?: string
          user_id?: string | null
          session_id?: string
          search_query?: string
          search_filters?: any
          results_count?: number
          clicked_results?: string[]
          search_timestamp?: string
          response_time_ms?: number
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}