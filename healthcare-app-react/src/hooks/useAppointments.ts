import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, Appointment } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

// Get user's appointments
export function useUserAppointments() {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['appointments', user?.id],
    queryFn: async () => {
      if (!user) return []
      
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user.id)
        .order('appointment_date', { ascending: true })

      if (error) {
        throw new Error(`Error fetching appointments: ${error.message}`)
      }

      return data as Appointment[]
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Get appointments by doctor
export function useDoctorAppointments(doctorId: string, date?: string) {
  return useQuery({
    queryKey: ['appointments', 'doctor', doctorId, date],
    queryFn: async () => {
      let query = supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', doctorId)

      if (date) {
        // Query for appointments on the specific date
        const startOfDay = `${date}T00:00:00`
        const endOfDay = `${date}T23:59:59`
        query = query
          .gte('appointment_date', startOfDay)
          .lte('appointment_date', endOfDay)
      }

      const { data, error } = await query.order('appointment_date')

      if (error) {
        throw new Error(`Error fetching doctor appointments: ${error.message}`)
      }

      return data as Appointment[]
    },
    enabled: !!doctorId,
  })
}

// Create appointment
export function useCreateAppointment() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (appointmentData: Omit<Appointment, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User must be logged in to book appointments')

      const { data, error } = await supabase
        .from('appointments')
        .insert({
          ...appointmentData,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Error creating appointment: ${error.message}`)
      }

      return data as Appointment
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    },
  })
}

// Update appointment
export function useUpdateAppointment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Appointment> & { id: string }) => {
      const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw new Error(`Error updating appointment: ${error.message}`)
      }

      return data as Appointment
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    },
  })
}

// Cancel appointment
export function useCancelAppointment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (appointmentId: string) => {
      const { data, error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId)
        .select()
        .single()

      if (error) {
        throw new Error(`Error cancelling appointment: ${error.message}`)
      }

      return data as Appointment
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    },
  })
}
