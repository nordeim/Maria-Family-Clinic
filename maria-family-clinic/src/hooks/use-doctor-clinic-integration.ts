import { useState, useEffect, useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Doctor, DoctorClinic, DoctorSchedule, DoctorAvailability } from "@/types/doctor"

// =============================================================================
// API ENDPOINTS TYPES
// =============================================================================

interface ClinicDoctorManagementAPI {
  getClinicDoctors: (clinicId: string, filters?: DoctorFilters) => Promise<ClinicDoctorData>
  getDoctorPerformance: (doctorId: string, clinicId: string) => Promise<DoctorPerformance>
  updateDoctorClinicRole: (doctorId: string, clinicId: string, role: Partial<DoctorClinic>) => Promise<void>
  getSpecialties: () => Promise<Specialty[]>
}

interface IntelligentAssignmentAPI {
  searchDoctors: (criteria: AssignmentCriteria) => Promise<DoctorAssignment[]>
  calculateMatchScore: (doctor: Doctor, criteria: AssignmentCriteria, clinicId: string) => Promise<MatchScore>
  getLanguagePreferences: () => Promise<LanguagePreference[]>
  trackAssignment: (assignmentId: string, outcome: AssignmentOutcome) => Promise<void>
}

interface ScheduleCoordinationAPI {
  getMultiClinicSchedule: (doctorId: string, dateRange: DateRange) => Promise<MultiClinicSchedule>
  detectScheduleConflicts: (doctorId: string, date: Date) => Promise<ScheduleConflict[]>
  calculateTravelTimes: (clinics: string[]) => Promise<TravelTimeCalculation[]>
  resolveScheduleConflict: (conflictId: string, resolution: ConflictResolution) => Promise<void>
  optimizeSchedule: (doctorId: string, optimizationParams: OptimizationParams) => Promise<ScheduleOptimization>
}

interface PartnershipManagementAPI {
  getPartnerships: (clinicId: string) => Promise<Partnership[]>
  getCrossReferralNetworks: (clinicId: string) => Promise<CrossReferralNetwork[]>
  createPartnership: (partnershipData: CreatePartnershipData) => Promise<Partnership>
  updatePartnership: (partnershipId: string, updates: Partial<Partnership>) => Promise<void>
  getPartnershipAnalytics: (partnershipId: string) => Promise<PartnershipAnalytics>
}

// =============================================================================
// SUPPORTING TYPES
// =============================================================================

interface DoctorFilters {
  specialty?: string
  language?: string
  capacity?: 'FULL_TIME' | 'PART_TIME' | 'VISITING' | 'LOCUM'
  status?: 'active' | 'inactive' | 'available'
  rating?: number
  search?: string
}

interface ClinicDoctorData {
  doctors: Array<{
    doctor: Doctor
    clinicRelation: DoctorClinic
    availability: DoctorAvailability[]
    performance: DoctorPerformance
    partnership?: Partnership
  }>
  totalCount: number
  filters: DoctorFilters
}

interface DoctorPerformance {
  totalAppointments: number
  completionRate: number
  patientSatisfaction: number
  responseTime: number
  ratingTrend: Array<{ month: string; rating: number }>
  monthlyStats: Array<{
    month: string
    appointments: number
    satisfaction: number
  }>
}

interface Specialty {
  id: string
  name: string
  subSpecialties: string[]
  doctorCount: number
  demandLevel: 'low' | 'medium' | 'high' | 'critical'
}

interface AssignmentCriteria {
  specialtyRequired: string[]
  urgencyLevel: 'routine' | 'urgent' | 'emergency' | 'same-day'
  preferredLanguages: string[]
  patientAge?: number
  patientGender?: 'male' | 'female' | 'other'
  medicalComplexity: 'simple' | 'moderate' | 'complex' | 'specialized'
  location?: string
  appointmentType: 'in-person' | 'telehealth' | 'emergency'
  maxDistance?: number
  maxWaitTime?: number
  insuranceRequirements?: string[]
  specialNeeds?: string[]
  patientPreferences?: {
    preferredDoctor?: string
    preferredGender?: 'male' | 'female'
    preferredLanguage?: string
    avoidDoctor?: string[]
  }
}

interface DoctorAssignment {
  doctor: Doctor
  clinic: Clinic
  doctorClinic: DoctorClinic
  availability: DoctorAvailability
  assignmentScore: number
  assignmentReasons: string[]
  estimatedWaitTime: number
  consultationFee: number
  distance: number
  languageMatch: number
  specialtyMatch: number
  complexityMatch: number
  availabilityScore: number
  partnershipBonus: number
  isRecommended: boolean
  alternatives: DoctorAssignment[]
  confidence: number
  riskFactors: string[]
}

interface MatchScore {
  overall: number
  specialty: number
  language: number
  location: number
  availability: number
  complexity: number
  rating: number
  experience: number
  partnership: number
}

interface LanguagePreference {
  language: string
  speakers: number
  demand: 'low' | 'medium' | 'high'
  availability: number
}

interface AssignmentOutcome {
  appointmentBooked: boolean
  doctorId: string
  clinicId: string
  patientSatisfaction?: number
  waitTime?: number
  resolution: 'success' | 'cancelled' | 'rescheduled' | 'no-show'
  notes?: string
}

interface DateRange {
  start: Date
  end: Date
}

interface MultiClinicSchedule {
  doctor: Doctor
  schedules: Array<{
    clinicId: string
    clinicName: string
    schedules: DoctorSchedule[]
    availabilities: DoctorAvailability[]
    conflicts: ScheduleConflict[]
    totalAppointments: number
    utilizationRate: number
    efficiency: number
  }>
  overallUtilization: number
  conflictCount: number
  travelTimeToday: number
  efficiency: number
}

interface ScheduleConflict {
  id: string
  conflictType: 'time-overlap' | 'travel-impossible' | 'double-booking' | 'capacity-exceeded'
  severity: 'low' | 'medium' | 'high' | 'critical'
  doctorId: string
  clinicId: string
  scheduleId?: string
  conflictingScheduleId?: string
  startTime: string
  endTime: string
  date: Date
  description: string
  resolution?: string
  suggestedResolution?: string
  affectedAppointments: number
  distance?: number
  travelTime?: number
  impact: 'minimal' | 'moderate' | 'significant' | 'critical'
  autoResolvable: boolean
}

interface ConflictResolution {
  resolutionType: 'reschedule' | 'locum' | 'cancel' | 'extend' | 'split'
  newTime?: string
  alternativeDoctorId?: string
  reason: string
  notifyPatients: boolean
}

interface TravelTimeCalculation {
  fromClinicId: string
  toClinicId: string
  fromClinicName: string
  toClinicName: string
  distance: number
  travelTime: number
  isFeasible: boolean
  conflicts: string[]
  alternativeRoutes?: Array<{
    route: string
    time: number
    traffic: 'light' | 'moderate' | 'heavy'
  }>
}

interface OptimizationParams {
  priority: 'efficiency' | 'patient-satisfaction' | 'utilization' | 'distance'
  constraints: {
    maxTravelTime?: number
    minBreakTime?: number
    preferredClinics?: string[]
    avoidClinics?: string[]
  }
  objectives: Array<{
    metric: string
    weight: number
    target?: number
  }>
}

interface ScheduleOptimization {
  optimizationScore: number
  improvements: Array<{
    metric: string
    current: number
    optimized: number
    impact: string
  }>
  recommendations: Array<{
    type: 'schedule' | 'route' | 'coverage' | 'partnership'
    priority: 'low' | 'medium' | 'high'
    description: string
    implementation: string
    expectedBenefit: string
  }>
  implementationPlan: {
    phase: number
    changes: Array<{
      doctorId: string
      clinicId: string
      action: string
      timeline: string
    }>
  }
}

interface Partnership {
  id: string
  clinicId: string
  partnerClinicId: string
  clinicName: string
  partnerClinicName: string
  partnershipType: 'preferred' | 'exclusive' | 'cross-referral' | 'collaborative'
  partnershipLevel: 'bronze' | 'silver' | 'gold' | 'platinum'
  status: 'active' | 'pending' | 'suspended' | 'terminated'
  establishedDate: Date
  lastInteraction: Date
  renewalDate?: Date
  referralCount: number
  referralSuccessRate: number
  patientSatisfaction: number
  collaborationScore: number
  sharedSpecialties: string[]
  collaborativeServices: string[]
  referralNetworkSize: number
  primaryContact?: {
    name: string
    email: string
    phone: string
    role: string
  }
  priorityBooking: boolean
  preferredRates: boolean
  sharedResources: boolean
  jointPrograms: boolean
  monthlyReferrals: Array<{
    month: string
    referrals: number
    successful: number
  }>
}

interface CrossReferralNetwork {
  id: string
  networkName: string
  networkType: 'specialty' | 'geographic' | 'emergency' | 'research'
  participatingClinics: Array<{
    clinicId: string
    clinicName: string
    role: 'hub' | 'member' | 'specialist'
    contribution: string
  }>
  totalReferrals: number
  averageResponseTime: number
  successRate: number
  patientSatisfaction: number
  sharedProtocols: string[]
  emergencyProtocols: string[]
  qualityStandards: string[]
  communicationChannels: Array<{
    type: 'email' | 'phone' | 'portal' | 'emergency'
    description: string
    responseTime: string
  }>
}

interface CreatePartnershipData {
  partnerClinicId: string
  partnershipType: Partnership['partnershipType']
  partnershipLevel: Partnership['partnershipLevel']
  sharedSpecialties: string[]
  collaborativeServices: string[]
  contactDetails: Partnership['primaryContact']
  benefits: {
    priorityBooking: boolean
    preferredRates: boolean
    sharedResources: boolean
    jointPrograms: boolean
  }
}

interface PartnershipAnalytics {
  performance: {
    totalReferrals: number
    successRate: number
    responseTime: number
    patientSatisfaction: number
    costSavings: number
  }
  trends: Array<{
    month: string
    referrals: number
    successRate: number
    satisfaction: number
  }>
  comparativeMetrics: {
    vsNetworkAverage: number
    vsLastPeriod: number
    topServices: Array<{ service: string; referrals: number }>
    topSpecialties: Array<{ specialty: string; referrals: number }>
  }
}

// =============================================================================
// HOOK IMPLEMENTATIONS
// =============================================================================

export function useClinicDoctorManagement(clinicId?: string) {
  const queryClient = useQueryClient()

  const {
    data: clinicDoctors,
    isLoading: loading,
    error: error,
    refetch: refetch
  } = useQuery({
    queryKey: ['clinic-doctors', clinicId],
    queryFn: async (): Promise<ClinicDoctorData> => {
      if (!clinicId) throw new Error('Clinic ID is required')
      
      // Mock API call - replace with actual endpoint
      const response = await fetch(`/api/clinics/${clinicId}/doctors`)
      if (!response.ok) throw new Error('Failed to fetch clinic doctors')
      return response.json()
    },
    enabled: !!clinicId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const {
    data: specialties,
    isLoading: specialtiesLoading
  } = useQuery({
    queryKey: ['specialties'],
    queryFn: async (): Promise<Specialty[]> => {
      // Mock API call
      const response = await fetch('/api/specialties')
      if (!response.ok) throw new Error('Failed to fetch specialties')
      return response.json()
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  })

  const updateDoctorRoleMutation = useMutation({
    mutationFn: async ({ doctorId, clinicId, updates }: {
      doctorId: string
      clinicId: string
      updates: Partial<DoctorClinic>
    }) => {
      const response = await fetch(`/api/doctors/${doctorId}/clinics/${clinicId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      if (!response.ok) throw new Error('Failed to update doctor role')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinic-doctors'] })
    }
  })

  return {
    clinicDoctors,
    specialties,
    loading,
    error,
    refetch,
    specialtiesLoading,
    updateDoctorRole: updateDoctorRoleMutation.mutate,
    isUpdatingRole: updateDoctorRoleMutation.isPending
  }
}

export function useIntelligentDoctorAssignment() {
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<DoctorAssignment[]>([])

  const searchDoctorsMutation = useMutation({
    mutationFn: async (criteria: AssignmentCriteria): Promise<DoctorAssignment[]> => {
      setIsSearching(true)
      try {
        const response = await fetch('/api/doctors/assign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(criteria)
        })
        if (!response.ok) throw new Error('Failed to search doctors')
        return response.json()
      } finally {
        setIsSearching(false)
      }
    },
    onSuccess: (data) => {
      setSearchResults(data)
    }
  })

  const calculateMatchScore = useCallback(async (
    doctor: Doctor, 
    criteria: AssignmentCriteria, 
    clinicId: string
  ): Promise<MatchScore> => {
    const response = await fetch('/api/doctors/calculate-match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doctorId: doctor.id, criteria, clinicId })
    })
    if (!response.ok) throw new Error('Failed to calculate match score')
    return response.json()
  }, [])

  const trackAssignment = useMutation({
    mutationFn: async ({ assignmentId, outcome }: {
      assignmentId: string
      outcome: AssignmentOutcome
    }) => {
      const response = await fetch(`/api/assignments/${assignmentId}/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(outcome)
      })
      if (!response.ok) throw new Error('Failed to track assignment')
    }
  })

  return {
    searchDoctors: searchDoctorsMutation.mutate,
    searchResults,
    isSearching,
    calculateMatchScore,
    trackAssignment: trackAssignment.mutate
  }
}

export function useScheduleCoordination(doctorId?: string, clinicId?: string) {
  const queryClient = useQueryClient()

  const {
    data: scheduleData,
    isLoading: loading,
    error: error
  } = useQuery({
    queryKey: ['multi-clinic-schedule', doctorId],
    queryFn: async (): Promise<MultiClinicSchedule> => {
      if (!doctorId) throw new Error('Doctor ID is required')
      
      const response = await fetch(`/api/doctors/${doctorId}/multi-clinic-schedule`)
      if (!response.ok) throw new Error('Failed to fetch schedule data')
      return response.json()
    },
    enabled: !!doctorId,
    refetchInterval: 30 * 1000, // 30 seconds
  })

  const {
    data: conflicts,
    isLoading: conflictsLoading
  } = useQuery({
    queryKey: ['schedule-conflicts', doctorId],
    queryFn: async (): Promise<ScheduleConflict[]> => {
      if (!doctorId) throw new Error('Doctor ID is required')
      
      const response = await fetch(`/api/doctors/${doctorId}/conflicts`)
      if (!response.ok) throw new Error('Failed to fetch conflicts')
      return response.json()
    },
    enabled: !!doctorId,
    refetchInterval: 60 * 1000, // 1 minute
  })

  const resolveConflictMutation = useMutation({
    mutationFn: async ({ conflictId, resolution }: {
      conflictId: string
      resolution: ConflictResolution
    }) => {
      const response = await fetch(`/api/conflicts/${conflictId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resolution)
      })
      if (!response.ok) throw new Error('Failed to resolve conflict')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-conflicts'] })
      queryClient.invalidateQueries({ queryKey: ['multi-clinic-schedule'] })
    }
  })

  const optimizeScheduleMutation = useMutation({
    mutationFn: async (params: OptimizationParams): Promise<ScheduleOptimization> => {
      const response = await fetch('/api/schedule/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      })
      if (!response.ok) throw new Error('Failed to optimize schedule')
      return response.json()
    }
  })

  return {
    scheduleData,
    conflicts,
    loading,
    conflictsLoading,
    error,
    resolveConflict: resolveConflictMutation.mutate,
    optimizeSchedule: optimizeScheduleMutation.mutate,
    isResolving: resolveConflictMutation.isPending,
    isOptimizing: optimizeScheduleMutation.isPending
  }
}

export function usePartnershipManagement(clinicId?: string) {
  const queryClient = useQueryClient()

  const {
    data: partnerships,
    isLoading: loading,
    error: error
  } = useQuery({
    queryKey: ['partnerships', clinicId],
    queryFn: async (): Promise<Partnership[]> => {
      if (!clinicId) throw new Error('Clinic ID is required')
      
      const response = await fetch(`/api/clinics/${clinicId}/partnerships`)
      if (!response.ok) throw new Error('Failed to fetch partnerships')
      return response.json()
    },
    enabled: !!clinicId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })

  const {
    data: networks,
    isLoading: networksLoading
  } = useQuery({
    queryKey: ['referral-networks', clinicId],
    queryFn: async (): Promise<CrossReferralNetwork[]> => {
      if (!clinicId) throw new Error('Clinic ID is required')
      
      const response = await fetch(`/api/clinics/${clinicId}/networks`)
      if (!response.ok) throw new Error('Failed to fetch networks')
      return response.json()
    },
    enabled: !!clinicId,
    staleTime: 15 * 60 * 1000, // 15 minutes
  })

  const createPartnershipMutation = useMutation({
    mutationFn: async (partnershipData: CreatePartnershipData): Promise<Partnership> => {
      const response = await fetch('/api/partnerships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partnershipData)
      })
      if (!response.ok) throw new Error('Failed to create partnership')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partnerships'] })
    }
  })

  const updatePartnershipMutation = useMutation({
    mutationFn: async ({ partnershipId, updates }: {
      partnershipId: string
      updates: Partial<Partnership>
    }) => {
      const response = await fetch(`/api/partnerships/${partnershipId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      if (!response.ok) throw new Error('Failed to update partnership')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partnerships'] })
    }
  })

  return {
    partnerships,
    networks,
    loading,
    error,
    networksLoading,
    createPartnership: createPartnershipMutation.mutate,
    updatePartnership: updatePartnershipMutation.mutate,
    isCreating: createPartnershipMutation.isPending,
    isUpdating: updatePartnershipMutation.isPending
  }
}

// =============================================================================
// UTILITY HOOKS
// =============================================================================

export function useDoctorClinicIntegration(clinicId?: string, doctorId?: string) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const clinicDoctorMgmt = useClinicDoctorManagement(clinicId)
  const intelligentAssignment = useIntelligentDoctorAssignment()
  const scheduleCoordination = useScheduleCoordination(doctorId, clinicId)
  const partnershipMgmt = usePartnershipManagement(clinicId)

  const initialize = useCallback(async () => {
    try {
      setError(null)
      // Pre-load critical data
      await Promise.allSettled([
        clinicDoctorMgmt.refetch(),
        partnershipMgmt.refetch()
      ])
      setIsInitialized(true)
    } catch (err) {
      setError(err as Error)
    }
  }, [clinicDoctorMgmt, partnershipMgmt])

  useEffect(() => {
    if (clinicId || doctorId) {
      initialize()
    }
  }, [clinicId, doctorId, initialize])

  const refreshAll = useCallback(async () => {
    await Promise.allSettled([
      clinicDoctorMgmt.refetch(),
      scheduleCoordination.refetch(),
      partnershipMgmt.refetch()
    ])
  }, [clinicDoctorMgmt, scheduleCoordination, partnershipMgmt])

  return {
    // Data
    ...clinicDoctorMgmt,
    ...intelligentAssignment,
    ...scheduleCoordination,
    ...partnershipMgmt,
    
    // State
    isInitialized,
    error,
    
    // Actions
    initialize,
    refreshAll
  }
}

// =============================================================================
// PERFORMANCE MONITORING
// =============================================================================

export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = useState({
    searchResponseTime: 0,
    assignmentAccuracy: 0,
    conflictResolutionTime: 0,
    partnershipEfficiency: 0,
    systemHealth: 0
  })

  const trackSearchPerformance = useCallback((duration: number) => {
    setMetrics(prev => ({
      ...prev,
      searchResponseTime: duration
    }))
  }, [])

  const trackAssignmentAccuracy = useCallback((accuracy: number) => {
    setMetrics(prev => ({
      ...prev,
      assignmentAccuracy: accuracy
    }))
  }, [])

  const trackConflictResolution = useCallback((duration: number) => {
    setMetrics(prev => ({
      ...prev,
      conflictResolutionTime: duration
    }))
  }, [])

  const updateSystemHealth = useCallback((health: number) => {
    setMetrics(prev => ({
      ...prev,
      systemHealth: health
    }))
  }, [])

  return {
    metrics,
    trackSearchPerformance,
    trackAssignmentAccuracy,
    trackConflictResolution,
    updateSystemHealth
  }
}