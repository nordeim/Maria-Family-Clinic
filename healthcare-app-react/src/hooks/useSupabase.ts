import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, Doctor, Clinic, Service } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

// Doctor hooks
export function useDoctors() {
  return useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) {
        throw new Error(`Error fetching doctors: ${error.message}`)
      }

      return data as Doctor[]
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useDoctor(id: string) {
  return useQuery({
    queryKey: ['doctors', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        throw new Error(`Error fetching doctor: ${error.message}`)
      }

      // Fetch clinic separately if clinic_id exists
      if (data && data.clinic_id) {
        const { data: clinicData } = await supabase
          .from('clinics')
          .select('*')
          .eq('id', data.clinic_id)
          .single()
        
        return { ...data, clinic: clinicData }
      }

      return data
    },
    enabled: !!id,
  })
}

export function useDoctorsBySpecialty(specialty: string) {
  return useQuery({
    queryKey: ['doctors', 'specialty', specialty],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('is_active', true)
        .eq('specialty', specialty)
        .order('rating', { ascending: false })

      if (error) {
        throw new Error(`Error fetching doctors by specialty: ${error.message}`)
      }

      return data as Doctor[]
    },
    enabled: !!specialty,
  })
}

// Clinic hooks
export function useClinics() {
  return useQuery({
    queryKey: ['clinics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) {
        throw new Error(`Error fetching clinics: ${error.message}`)
      }

      return data as Clinic[]
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useClinic(id: string) {
  return useQuery({
    queryKey: ['clinics', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        throw new Error(`Error fetching clinic: ${error.message}`)
      }

      // Fetch doctors at this clinic
      if (data) {
        const { data: doctorsData } = await supabase
          .from('doctors')
          .select('*')
          .eq('clinic_id', data.id)
          .eq('is_active', true)
        
        return { ...data, doctors: doctorsData || [] }
      }

      return data
    },
    enabled: !!id,
  })
}

export function useClinicsByLocation(latitude: number, longitude: number, radiusKm: number = 50) {
  return useQuery({
    queryKey: ['clinics', 'location', latitude, longitude, radiusKm],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_clinics_near_location', {
          lat: latitude,
          lng: longitude,
          radius_km: radiusKm
        })

      if (error) {
        throw new Error(`Error fetching nearby clinics: ${error.message}`)
      }

      return data as Clinic[]
    },
    enabled: !!latitude && !!longitude,
  })
}

// Service hooks
export function useServices() {
  return useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })

      if (error) {
        throw new Error(`Error fetching services: ${error.message}`)
      }

      return data as Service[]
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useServicesByCategory(category: string) {
  return useQuery({
    queryKey: ['services', 'category', category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .eq('category', category)
        .order('name')

      if (error) {
        throw new Error(`Error fetching services by category: ${error.message}`)
      }

      return data as Service[]
    },
    enabled: !!category,
  })
}

export function useServiceCategories() {
  return useQuery({
    queryKey: ['service-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('category')
        .eq('is_active', true)

      if (error) {
        throw new Error(`Error fetching service categories: ${error.message}`)
      }

      // Get unique categories
      const categories = [...new Set(data.map(service => service.category))]
      return categories
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
  })
}

// Search hooks
export function useSearchDoctors(query: string, specialty?: string) {
  return useQuery({
    queryKey: ['search', 'doctors', query, specialty],
    queryFn: async () => {
      let supabaseQuery = supabase
        .from('doctors')
        .select('*')
        .eq('is_active', true)

      if (query) {
        supabaseQuery = supabaseQuery.or(
          `name.ilike.%${query}%,bio.ilike.%${query}%,specialty.ilike.%${query}%`
        )
      }

      if (specialty) {
        supabaseQuery = supabaseQuery.eq('specialty', specialty)
      }

      const { data, error } = await supabaseQuery.order('rating', { ascending: false })

      if (error) {
        throw new Error(`Error searching doctors: ${error.message}`)
      }

      return data as Doctor[]
    },
    enabled: query.length > 0 || !!specialty,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useSearchServices(query: string, category?: string) {
  return useQuery({
    queryKey: ['search', 'services', query, category],
    queryFn: async () => {
      let supabaseQuery = supabase
        .from('services')
        .select('*')
        .eq('is_active', true)

      if (query) {
        supabaseQuery = supabaseQuery.or(
          `name.ilike.%${query}%,description.ilike.%${query}%`
        )
      }

      if (category) {
        supabaseQuery = supabaseQuery.eq('category', category)
      }

      const { data, error } = await supabaseQuery.order('name')

      if (error) {
        throw new Error(`Error searching services: ${error.message}`)
      }

      return data as Service[]
    },
    enabled: query.length > 0 || !!category,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}