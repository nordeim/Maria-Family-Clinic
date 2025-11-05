'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { trpc } from '@/lib/trpc/client'
import type { RouterOutputs } from '@/lib/trpc/client'

/**
 * Custom React Query hooks for common patterns
 */

// Clinic hooks
export function useClinicList(
  filters?: {
    page?: number
    limit?: number
    search?: string
    isActive?: boolean
    isHealthierSgPartner?: boolean
    languages?: string[]
    services?: string[]
    location?: {
      latitude: number
      longitude: number
      radiusKm: number
    }
    orderBy?: 'name' | 'distance' | 'rating' | 'createdAt'
    orderDirection?: 'asc' | 'desc'
  }
) {
  return trpc.clinic.getAll.useQuery(filters || {}, {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useClinic(id: string) {
  return trpc.clinic.getById.useQuery({ id }, {
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes for individual clinic
  })
}

export function useNearbyClinics(
  location: {
    latitude: number
    longitude: number
    radiusKm?: number
    limit?: number
    services?: string[]
    isActive?: boolean
  },
  enabled = true
) {
  return trpc.clinic.getNearby.useQuery(location, {
    enabled: enabled && !!location.latitude && !!location.longitude,
    staleTime: 2 * 60 * 1000, // 2 minutes for nearby search
    refetchOnWindowFocus: false,
  })
}

export function useCreateClinic() {
  const queryClient = useQueryClient()
  
  return trpc.clinic.create.useMutation({
    onMutate: async (newClinic) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['clinic.getAll'] })
      
      // Snapshot previous value
      const previousClinics = queryClient.getQueryData(['clinic.getAll'])
      
      // Optimistically update to the new value
      queryClient.setQueryData(['clinic.getAll'], (old: any) => {
        if (!old) return old
        return {
          ...old,
          data: [...old.data, { ...newClinic, id: 'temp-' + Date.now() }],
          pagination: {
            ...old.pagination,
            total: old.pagination.total + 1,
          },
        }
      })
      
      return { previousClinics }
    },
    onError: (err, newClinic, context) => {
      queryClient.setQueryData(['clinic.getAll'], context?.previousClinics)
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['clinic.getAll'] })
    },
  })
}

export function useUpdateClinic() {
  const queryClient = useQueryClient()
  
  return trpc.clinic.update.useMutation({
    onMutate: async (updatedClinic) => {
      await queryClient.cancelQueries({ queryKey: ['clinic.getAll'] })
      await queryClient.cancelQueries({ queryKey: ['clinic.getById', updatedClinic.id] })
      
      const previousClinics = queryClient.getQueryData(['clinic.getAll'])
      const previousClinic = queryClient.getQueryData(['clinic.getById', updatedClinic.id])
      
      // Optimistically update
      queryClient.setQueryData(['clinic.getAll'], (old: any) => {
        if (!old) return old
        return {
          ...old,
          data: old.data.map((clinic: any) =>
            clinic.id === updatedClinic.id ? { ...clinic, ...updatedClinic } : clinic
          ),
        }
      })
      
      queryClient.setQueryData(['clinic.getById', updatedClinic.id], (old: any) => {
        return old ? { ...old, ...updatedClinic } : old
      })
      
      return { previousClinics, previousClinic }
    },
    onError: (err, updatedClinic, context) => {
      queryClient.setQueryData(['clinic.getAll'], context?.previousClinics)
      queryClient.setQueryData(['clinic.getById', updatedClinic.id], context?.previousClinic)
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clinic.getAll'] })
      queryClient.invalidateQueries({ queryKey: ['clinic.getById', variables.id] })
    },
  })
}

// Doctor hooks
export function useDoctorList(
  filters?: {
    page?: number
    limit?: number
    search?: string
    specialties?: string[]
    languages?: string[]
    clinicId?: string
    isActive?: boolean
    isVerified?: boolean
    orderBy?: 'name' | 'specialty' | 'experience' | 'rating' | 'createdAt'
    orderDirection?: 'asc' | 'desc'
  }
) {
  return trpc.doctor.getAll.useQuery(filters || {}, {
    staleTime: 5 * 60 * 1000,
  })
}

export function useDoctor(id: string) {
  return trpc.doctor.getById.useQuery({ id }, {
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  })
}

export function useDoctorAvailability(
  doctorId: string,
  startDate?: Date,
  endDate?: Date,
  serviceId?: string
) {
  return trpc.doctor.getAvailableSlots.useQuery(
    { doctorId, startDate: startDate!, endDate: endDate!, serviceId },
    {
      enabled: !!doctorId,
      staleTime: 2 * 60 * 1000,
    }
  )
}

// Service hooks
export function useServiceList(
  filters?: {
    page?: number
    limit?: number
    search?: string
    category?: string
    isActive?: boolean
    isPopular?: boolean
    minPrice?: number
    maxPrice?: number
    clinicId?: string
    doctorId?: string
    orderBy?: 'name' | 'category' | 'price' | 'popularity' | 'rating' | 'createdAt'
    orderDirection?: 'asc' | 'desc'
  }
) {
  return trpc.service.getAll.useQuery(filters || {}, {
    staleTime: 5 * 60 * 1000,
  })
}

export function useService(id: string) {
  return trpc.service.getById.useQuery({ id }, {
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  })
}

export function useServiceCategories() {
  return trpc.service.getCategories.useQuery(undefined, {
    staleTime: 30 * 60 * 1000, // 30 minutes - categories don't change often
  })
}

export function usePopularServices(limit = 6, category?: string) {
  return trpc.service.getPopular.useQuery({ limit, category }, {
    staleTime: 10 * 60 * 1000,
  })
}

// Appointment hooks
export function useMyAppointments(
  filters?: {
    page?: number
    limit?: number
    status?: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
    upcomingOnly?: boolean
  }
) {
  return trpc.appointment.getMyAppointments.useQuery(filters || {}, {
    staleTime: 1 * 60 * 1000, // 1 minute for appointments
  })
}

export function useAppointment(id: string) {
  return trpc.appointment.getById.useQuery({ id }, {
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  })
}

export function useCreateAppointment() {
  const queryClient = useQueryClient()
  
  return trpc.appointment.create.useMutation({
    onMutate: async (newAppointment) => {
      await queryClient.cancelQueries({ queryKey: ['appointment.getMyAppointments'] })
      
      const previousAppointments = queryClient.getQueryData(['appointment.getMyAppointments'])
      
      queryClient.setQueryData(['appointment.getMyAppointments'], (old: any) => {
        if (!old) return old
        return {
          ...old,
          data: [...old.data, { ...newAppointment, id: 'temp-' + Date.now(), status: 'PENDING' }],
        }
      })
      
      return { previousAppointments }
    },
    onError: (err, newAppointment, context) => {
      queryClient.setQueryData(['appointment.getMyAppointments'], context?.previousAppointments)
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['appointment.getMyAppointments'] })
    },
  })
}

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient()
  
  return trpc.appointment.updateStatus.useMutation({
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['appointment.getMyAppointments'] })
      await queryClient.cancelQueries({ queryKey: ['appointment.getById', id] })
      
      const previousAppointments = queryClient.getQueryData(['appointment.getMyAppointments'])
      const previousAppointment = queryClient.getQueryData(['appointment.getById', id])
      
      queryClient.setQueryData(['appointment.getMyAppointments'], (old: any) => {
        if (!old) return old
        return {
          ...old,
          data: old.data.map((appointment: any) =>
            appointment.id === id ? { ...appointment, status } : appointment
          ),
        }
      })
      
      queryClient.setQueryData(['appointment.getById', id], (old: any) => {
        return old ? { ...old, status } : old
      })
      
      return { previousAppointments, previousAppointment }
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['appointment.getMyAppointments'], context?.previousAppointments)
      queryClient.setQueryData(['appointment.getById', variables.id], context?.previousAppointment)
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointment.getMyAppointments'] })
      queryClient.invalidateQueries({ queryKey: ['appointment.getById', variables.id] })
    },
  })
}

// User hooks
export function useMyProfile() {
  return trpc.user.getMe.useQuery(undefined, {
    staleTime: 10 * 60 * 1000, // 10 minutes for profile data
  })
}

export function useUpdateMyProfile() {
  const queryClient = useQueryClient()
  
  return trpc.user.updateMe.useMutation({
    onMutate: async (updatedProfile) => {
      await queryClient.cancelQueries({ queryKey: ['user.getMe'] })
      
      const previousProfile = queryClient.getQueryData(['user.getMe'])
      
      queryClient.setQueryData(['user.getMe'], (old: any) => {
        return old ? { ...old, profile: { ...old.profile, ...updatedProfile } } : old
      })
      
      return { previousProfile }
    },
    onError: (err, updatedProfile, context) => {
      queryClient.setQueryData(['user.getMe'], context?.previousProfile)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user.getMe'] })
    },
  })
}

export function useMyDashboard() {
  return trpc.user.getDashboard.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5 minutes for dashboard data
    refetchOnWindowFocus: false,
  })
}

// Enquiry hooks
export function useCreateEnquiry() {
  const queryClient = useQueryClient()
  
  return trpc.enquiry.create.useMutation({
    onSuccess: () => {
      // Invalidate any enquiry lists that might exist
      queryClient.invalidateQueries({ queryKey: ['enquiry.getAll'] })
    },
  })
}

// Healthier SG hooks
export function useHealthierSgProgramInfo() {
  return trpc.healthierSg.getProgramInfo.useQuery(undefined, {
    staleTime: 30 * 60 * 1000, // 30 minutes - program info rarely changes
  })
}

export function useMyHealthierSgEnrollment() {
  return trpc.healthierSg.getMyEnrollment.useQuery(undefined, {
    staleTime: 10 * 60 * 1000,
  })
}

export function useHealthierSgEligibility(age: number, hasChronicConditions?: boolean) {
  return trpc.healthierSg.checkEligibility.useQuery(
    { age, hasChronicConditions },
    {
      staleTime: 10 * 60 * 1000, // 10 minutes for eligibility check
    }
  )
}

export function useEnrollHealthierSg() {
  const queryClient = useQueryClient()
  
  return trpc.healthierSg.enroll.useMutation({
    onSuccess: () => {
      // Invalidate user's enrollment status
      queryClient.invalidateQueries({ queryKey: ['healthierSg.getMyEnrollment'] })
      queryClient.invalidateQueries({ queryKey: ['user.getMe'] })
      queryClient.invalidateQueries({ queryKey: ['user.getDashboard'] })
    },
  })
}

// Healthier SG Clinic Finder hooks (Sub-Phase 8.4)
export function useHealthierSgParticipatingClinics(
  filters?: {
    page?: number
    limit?: number
    search?: string
    location?: {
      latitude: number
      longitude: number
      radiusKm: number
    }
    healthierSGProgramCategories?: string[]
    healthierSGServiceCategories?: string[]
    healthierSGParticipationType?: string[]
    healthierSGClinicStatus?: string[]
    healthierSGCapacityLevel?: 'any' | 'high' | 'medium' | 'low'
    healthierSGWaitTime?: 'any' | '<30min' | '30-60min' | '>1hr'
    healthierSGHasVaccination?: boolean
    healthierSGHasHealthScreening?: boolean
    healthierSGHasChronicCare?: boolean
    orderBy?: 'name' | 'distance' | 'rating' | 'createdAt'
    orderDirection?: 'asc' | 'desc'
  }
) {
  return trpc.clinic.getHealthierSGParticipatingClinics.useQuery(filters || {}, {
    staleTime: 5 * 60 * 1000, // 5 minutes for clinic data
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useVerifyClinicParticipation(clinicId: string) {
  return trpc.clinic.verifyClinicParticipation.useQuery(
    { clinicId },
    {
      enabled: !!clinicId,
      staleTime: 2 * 60 * 1000, // 2 minutes for verification status
      refetchOnWindowFocus: false,
    }
  )
}

export function useClinicProgramCapacity(clinicId: string) {
  return trpc.clinic.getClinicProgramCapacity.useQuery(
    { clinicId },
    {
      enabled: !!clinicId,
      staleTime: 1 * 60 * 1000, // 1 minute for capacity data (changes frequently)
      refetchInterval: 30000, // Refetch every 30 seconds
      refetchOnWindowFocus: true,
    }
  )
}

export function useClinicProgramServices(clinicId: string) {
  return trpc.clinic.getClinicProgramServices.useQuery(
    { clinicId },
    {
      enabled: !!clinicId,
      staleTime: 10 * 60 * 1000, // 10 minutes for service listings
    }
  )
}

export function useTrackClinicProgramMetrics() {
  const queryClient = useQueryClient()
  
  return trpc.clinic.trackClinicProgramMetrics.useMutation({
    onSuccess: () => {
      // Invalidate related queries if needed
      queryClient.invalidateQueries({ queryKey: ['clinic.getHealthierSGParticipatingClinics'] })
    },
  })
}

// Analytics hooks (for admin/staff)
export function useDashboardOverview(
  clinicId?: string,
  dateRange: 'today' | 'yesterday' | 'last7Days' | 'last30Days' | 'thisWeek' | 'thisMonth' | 'lastMonth' = 'last30Days'
) {
  return trpc.analytics.getDashboardOverview.useQuery(
    { clinicId, dateRange },
    {
      staleTime: 2 * 60 * 1000, // 2 minutes for analytics
      refetchOnWindowFocus: false,
    }
  )
}

export function useAppointmentTrends(
  clinicId?: string,
  startDate?: Date,
  endDate?: Date,
  groupBy: 'day' | 'week' | 'month' = 'day'
) {
  return trpc.analytics.getAppointmentTrends.useQuery(
    { clinicId, startDate: startDate!, endDate: endDate!, groupBy },
    {
      enabled: !!(startDate && endDate),
      staleTime: 5 * 60 * 1000,
    }
  )
}

export function usePopularServicesAnalysis(
  clinicId?: string,
  startDate?: Date,
  endDate?: Date,
  limit = 10
) {
  return trpc.analytics.getPopularServices.useQuery(
    { clinicId, startDate: startDate!, endDate: endDate!, limit },
    {
      enabled: !!startDate && !!endDate,
      staleTime: 10 * 60 * 1000,
    }
  )
}