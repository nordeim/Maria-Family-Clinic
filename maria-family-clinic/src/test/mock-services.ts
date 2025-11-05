/**
 * Mock Services Setup for Doctor System Testing
 * Phase 7.10 - Testing & Quality Assurance
 * 
 * Provides comprehensive mock implementations of external services
 * for isolated and reliable testing
 */

import { vi } from 'vitest'
import { DoctorProfile, MockDoctor, PerformanceMetrics } from './types'

// Mock delays for realistic testing scenarios
const MOCK_DELAYS = {
  API_CALL: 200,
  DATABASE_QUERY: 150,
  SEARCH_OPERATION: 100,
  IMAGE_LOAD: 500,
  BOOKING_OPERATION: 300,
  FILE_UPLOAD: 1000,
  EMAIL_SEND: 250,
  SMS_SEND: 200
}

export interface MockServices {
  // API Services
  searchDoctors: (query: string) => Promise<DoctorProfile[]>
  getDoctorProfile: (id: string) => Promise<DoctorProfile>
  createDoctorProfile: (data: Partial<DoctorProfile>) => Promise<DoctorProfile>
  updateDoctorProfile: (id: string, data: Partial<DoctorProfile>) => Promise<DoctorProfile>
  deleteDoctorProfile: (id: string) => Promise<void>
  
  // Search Services
  fuzzySearch: (query: string, threshold?: number) => Promise<DoctorProfile[]>
  synonymSearch: (query: string, synonyms: string[]) => Promise<DoctorProfile[]>
  advancedSearch: (filters: any) => Promise<DoctorProfile[]>
  
  // Booking Services
  createAppointment: (appointmentData: any) => Promise<any>
  getAvailableSlots: (doctorId: string) => Promise<any[]>
  updateAppointment: (appointmentId: string, updates: any) => Promise<any>
  cancelAppointment: (appointmentId: string) => Promise<any>
  
  // Database Services
  queryDoctors: (filters?: any, pagination?: any) => Promise<any>
  validateDataIntegrity: (operation: string, table: string, data?: any) => Promise<any>
  runHealthChecks: () => Promise<any>
  
  // Compliance Services
  checkSingaporeMedicalRegulations: (doctorId: string) => Promise<any>
  validateMCRFormat: (mcrNumber: string) => boolean
  validateSPCFormat: (spcNumber: string) => boolean
  auditDataAccess: (userId: string, resourceId: string) => Promise<any>
  
  // Utility Services
  delay: (ms: number) => Promise<void>
  simulateSearch: (query: string) => Promise<void>
  simulateProfileRender: () => Promise<void>
  simulateImageLoad: () => Promise<void>
  simulateDatabaseQuery: () => Promise<void>
  simulateLoad: (test: any) => Promise<void>
  
  // Performance Monitoring
  getPerformanceMetrics: () => PerformanceMetrics
  measureExecutionTime: <T>(fn: () => Promise<T>) => Promise<{ result: T; time: number }>
}

// Mock Implementation Class
export class MockServiceImplementation implements MockServices {
  private performanceMetrics: PerformanceMetrics
  private callCount: Map<string, number>

  constructor() {
    this.performanceMetrics = {
      searchResponseTime: 0,
      profileRenderTime: 0,
      imageLoadTime: 0,
      databaseQueryTime: 0,
      memoryUsage: 0,
      cpuUsage: 0
    }
    this.callCount = new Map()
  }

  // API Services
  async searchDoctors(query: string): Promise<DoctorProfile[]> {
    this.incrementCall('searchDoctors')
    await this.delay(MOCK_DELAYS.SEARCH_OPERATION)
    
    // Simulate search results
    return this.generateMockSearchResults(query)
  }

  async getDoctorProfile(id: string): Promise<DoctorProfile> {
    this.incrementCall('getDoctorProfile')
    await this.delay(MOCK_DELAYS.API_CALL)
    
    return this.generateMockDoctor(id)
  }

  async createDoctorProfile(data: Partial<DoctorProfile>): Promise<DoctorProfile> {
    this.incrementCall('createDoctorProfile')
    await this.delay(MOCK_DELAYS.API_CALL)
    
    return this.generateMockDoctor(data.id || 'new_doc_id', data)
  }

  async updateDoctorProfile(id: string, data: Partial<DoctorProfile>): Promise<DoctorProfile> {
    this.incrementCall('updateDoctorProfile')
    await this.delay(MOCK_DELAYS.API_CALL)
    
    return this.generateMockDoctor(id, data)
  }

  async deleteDoctorProfile(id: string): Promise<void> {
    this.incrementCall('deleteDoctorProfile')
    await this.delay(MOCK_DELAYS.API_CALL)
    
    // Simulate successful deletion
  }

  // Search Services
  async fuzzySearch(query: string, threshold: number = 0.8): Promise<DoctorProfile[]> {
    this.incrementCall('fuzzySearch')
    await this.delay(MOCK_DELAYS.SEARCH_OPERATION + 50) // Slightly longer for fuzzy
    
    return this.generateMockSearchResults(query, 'fuzzy')
  }

  async synonymSearch(query: string, synonyms: string[]): Promise<DoctorProfile[]> {
    this.incrementCall('synonymSearch')
    await this.delay(MOCK_DELAYS.SEARCH_OPERATION + 75)
    
    const allQueries = [query, ...synonyms]
    const results = []
    
    for (const q of allQueries) {
      const searchResults = await this.searchDoctors(q)
      results.push(...searchResults)
    }
    
    // Remove duplicates
    return results.filter((doc, index, arr) => 
      arr.findIndex(d => d.id === doc.id) === index
    )
  }

  async advancedSearch(filters: any): Promise<DoctorProfile[]> {
    this.incrementCall('advancedSearch')
    await this.delay(MOCK_DELAYS.DATABASE_QUERY)
    
    // Simulate filtered results
    return this.generateMockSearchResults('filtered', 'advanced', filters)
  }

  // Booking Services
  async createAppointment(appointmentData: any): Promise<any> {
    this.incrementCall('createAppointment')
    await this.delay(MOCK_DELAYS.BOOKING_OPERATION)
    
    return {
      success: true,
      appointmentId: `apt_${Math.random().toString(36).substr(2, 9)}`,
      confirmationNumber: `CONF-${Date.now()}`,
      ...appointmentData
    }
  }

  async getAvailableSlots(doctorId: string): Promise<any[]> {
    this.incrementCall('getAvailableSlots')
    await this.delay(MOCK_DELAYS.API_CALL)
    
    return this.generateMockAppointmentSlots()
  }

  async updateAppointment(appointmentId: string, updates: any): Promise<any> {
    this.incrementCall('updateAppointment')
    await this.delay(MOCK_DELAYS.BOOKING_OPERATION)
    
    return {
      success: true,
      appointmentId,
      ...updates,
      updatedAt: new Date().toISOString()
    }
  }

  async cancelAppointment(appointmentId: string): Promise<any> {
    this.incrementCall('cancelAppointment')
    await this.delay(MOCK_DELAYS.BOOKING_OPERATION)
    
    return {
      success: true,
      appointmentId,
      status: 'cancelled',
      refundAmount: Math.floor(Math.random() * 200) + 50
    }
  }

  // Database Services
  async queryDoctors(filters?: any, pagination?: any): Promise<any> {
    this.incrementCall('queryDoctors')
    await this.delay(MOCK_DELAYS.DATABASE_QUERY)
    
    const total = 1000 // Mock total count
    const page = pagination?.page || 1
    const limit = pagination?.limit || 50
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    
    const doctors = Array.from({ length: limit }, (_, i) => 
      this.generateMockDoctor(`doc_${startIndex + i}`)
    )
    
    return {
      data: doctors,
      totalCount: total,
      pageCount: Math.ceil(total / limit),
      currentPage: page,
      hasMore: endIndex < total
    }
  }

  async validateDataIntegrity(operation: string, table: string, data?: any): Promise<any> {
    this.incrementCall('validateDataIntegrity')
    await this.delay(300)
    
    return {
      success: true,
      operation,
      table,
      checksPassed: Math.floor(Math.random() * 5) + 8, // 8-12 passed
      totalChecks: 10,
      anomalies: []
    }
  }

  async runHealthChecks(): Promise<any> {
    this.incrementCall('runHealthChecks')
    await this.delay(500)
    
    return {
      success: true,
      doctorCount: 150,
      clinicCount: 25,
      relationshipCount: 175,
      orphanedRecords: 0,
      invalidReferences: 0,
      dataConsistency: 'PASS'
    }
  }

  // Compliance Services
  async checkSingaporeMedicalRegulations(doctorId: string): Promise<any> {
    this.incrementCall('checkSingaporeMedicalRegulations')
    await this.delay(400)
    
    return {
      compliant: Math.random() > 0.1, // 90% compliant
      checks: {
        mcrValid: true,
        licenseActive: true,
        specialtyRegistered: true,
        noDisciplinaryActions: Math.random() > 0.2,
        cmeCompliant: Math.random() > 0.1
      },
      warnings: Math.random() > 0.8 ? ['CME points slightly low'] : [],
      lastChecked: new Date().toISOString()
    }
  }

  validateMCRFormat(mcrNumber: string): boolean {
    const mcrRegex = /^M[0-9]{5}[A-Z]$/
    return mcrRegex.test(mcrNumber)
  }

  validateSPCFormat(spcNumber: string): boolean {
    const spcRegex = /^SPC[0-9]{6,8}$/
    return spcRegex.test(spcNumber)
  }

  async auditDataAccess(userId: string, resourceId: string): Promise<any> {
    this.incrementCall('auditDataAccess')
    await this.delay(200)
    
    return {
      success: true,
      accessLog: [
        {
          userId,
          action: 'view_doctor_profile',
          resourceId,
          timestamp: new Date().toISOString(),
          ipAddress: '192.168.1.100',
          outcome: 'success'
        }
      ],
      suspiciousActivities: []
    }
  }

  // Utility Services
  async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async simulateSearch(query: string): Promise<void> {
    await this.delay(MOCK_DELAYS.SEARCH_OPERATION)
    this.performanceMetrics.searchResponseTime = MOCK_DELAYS.SEARCH_OPERATION
  }

  async simulateProfileRender(): Promise<void> {
    await this.delay(MOCK_DELAYS.API_CALL)
    this.performanceMetrics.profileRenderTime = MOCK_DELAYS.API_CALL
  }

  async simulateImageLoad(): Promise<void> {
    await this.delay(MOCK_DELAYS.IMAGE_LOAD)
    this.performanceMetrics.imageLoadTime = MOCK_DELAYS.IMAGE_LOAD
  }

  async simulateDatabaseQuery(): Promise<void> {
    await this.delay(MOCK_DELAYS.DATABASE_QUERY)
    this.performanceMetrics.databaseQueryTime = MOCK_DELAYS.DATABASE_QUERY
  }

  async simulateLoad(test: any): Promise<void> {
    const duration = test.duration || 1000
    await this.delay(duration)
  }

  // Performance Monitoring
  getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics }
  }

  async measureExecutionTime<T>(fn: () => Promise<T>): Promise<{ result: T; time: number }> {
    const start = Date.now()
    const result = await fn()
    const time = Date.now() - start
    
    return { result, time }
  }

  // Helper Methods
  private generateMockSearchResults(query: string, searchType: string = 'standard', filters?: any): DoctorProfile[] {
    const results = []
    const resultCount = Math.floor(Math.random() * 10) + 5 // 5-15 results
    
    for (let i = 0; i < resultCount; i++) {
      const doctor = this.generateMockDoctor(`search_result_${i}`)
      
      // Add relevance score for ranking
      const relevanceScore = 0.5 + Math.random() * 0.5
      results.push({
        ...doctor,
        relevanceScore,
        matchedFields: ['name', 'specialty'].slice(0, Math.floor(Math.random() * 2) + 1)
      })
    }
    
    return results
  }

  private generateMockDoctor(id: string, overrides: Partial<DoctorProfile> = {}): DoctorProfile {
    const specialties = ['Cardiology', 'Dermatology', 'Internal Medicine', 'Pediatrics', 'Orthopedics']
    const names = [
      'Dr. Sarah Chen', 'Dr. Michael Wong', 'Dr. Priya Sharma', 'Dr. James Lee',
      'Dr. Wei Ming Tan', 'Dr. Emma Lim', 'Dr. David Kumar', 'Dr. Grace Tan'
    ]
    
    return {
      id,
      name: overrides.name || names[Math.floor(Math.random() * names.length)],
      specialty: overrides.specialty || specialties[Math.floor(Math.random() * specialties.length)],
      subSpecialties: ['Specialty 1', 'Specialty 2'],
      qualifications: [
        { degree: 'MBBS', institution: 'NUS', year: 2015, verified: true, institutionType: 'local', accreditationStatus: 'accredited' }
      ],
      experience: Math.floor(Math.random() * 25) + 5,
      languages: ['English', 'Mandarin'],
      bio: 'Experienced doctor with years of practice.',
      clinicId: 'clinic_001',
      clinic: {
        name: 'Heart Care Medical Centre',
        address: '123 Medical Drive, Singapore 169857',
        phone: '+65-6123-4567'
      },
      rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
      reviewCount: Math.floor(Math.random() * 500) + 50,
      verificationBadges: {
        mcrVerified: true,
        spcVerified: true,
        boardCertified: true,
        experienceVerified: true
      },
      profileImage: `/images/doctors/${id}.jpg`,
      availableSlots: this.generateMockAppointmentSlots(),
      consultationFees: {
        consultation: Math.floor(Math.random() * 150) + 50,
        followUp: Math.floor(Math.random() * 100) + 30,
        procedure: Math.floor(Math.random() * 300) + 150,
        insuranceAccepted: ['Medisave', 'Medishield', 'Private Insurance']
      },
      telemedicineAvailable: Math.random() > 0.3,
      waitingTime: Math.floor(Math.random() * 30) + 5,
      mcrNumber: 'M12345A',
      spcNumber: 'SPC789012',
      ...overrides
    }
  }

  private generateMockAppointmentSlots(): any[] {
    const slots = []
    const today = new Date()
    
    for (let i = 0; i < 5; i++) {
      const date = new Date(today.getTime() + (i * 24 * 60 * 60 * 1000))
      const hour = 9 + Math.floor(Math.random() * 8)
      
      slots.push({
        id: `slot_${i}`,
        date: date.toISOString().split('T')[0],
        time: `${hour.toString().padStart(2, '0')}:00`,
        available: Math.random() > 0.2,
        duration: 30
      })
    }
    
    return slots
  }

  private incrementCall(method: string): void {
    const current = this.callCount.get(method) || 0
    this.callCount.set(method, current + 1)
  }

  getCallCount(method: string): number {
    return this.callCount.get(method) || 0
  }

  resetCallCounts(): void {
    this.callCount.clear()
  }
}

// Global mock services instance
let mockServicesInstance: MockServiceImplementation | null = null

// Setup function for test environment
export async function setupMockServices(): Promise<MockServiceImplementation> {
  if (!mockServicesInstance) {
    mockServicesInstance = new MockServiceImplementation()
    
    // Setup global mocks for fetch, localStorage, etc.
    setupGlobalMocks()
  }
  
  return mockServicesInstance
}

// Setup global mocks for browser APIs
function setupGlobalMocks() {
  // Mock fetch API
  if (typeof global.fetch === 'undefined') {
    global.fetch = vi.fn().mockImplementation((url) => {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true }),
        text: () => Promise.resolve('OK')
      })
    })
  }

  // Mock localStorage
  if (typeof global.localStorage === 'undefined') {
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn()
    }
    vi.stubGlobal('localStorage', localStorageMock)
  }

  // Mock sessionStorage
  if (typeof global.sessionStorage === 'undefined') {
    const sessionStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn()
    }
    vi.stubGlobal('sessionStorage', sessionStorageMock)
  }

  // Mock Image constructor for image loading tests
  if (typeof global.Image === 'undefined') {
    global.Image = class MockImage {
      onload: (() => {}) as any
      onerror: (() => {}) as any
      src: string = ''
      
      constructor() {
        setTimeout(() => {
          if (this.onload) {
            this.onload(new Event('load'))
          }
        }, 10)
      }
    }
  }

  // Mock IntersectionObserver for lazy loading tests
  if (typeof global.IntersectionObserver === 'undefined') {
    global.IntersectionObserver = class MockIntersectionObserver {
      observe = vi.fn()
      unobserve = vi.fn()
      disconnect = vi.fn()
    }
  }

  // Mock ResizeObserver for responsive tests
  if (typeof global.ResizeObserver === 'undefined') {
    global.ResizeObserver = class MockResizeObserver {
      observe = vi.fn()
      unobserve = vi.fn()
      disconnect = vi.fn()
    }
  }

  // Mock crypto for security testing
  if (typeof global.crypto === 'undefined') {
    global.crypto = {
      getRandomValues: vi.fn((arr) => {
        for (let i = 0; i < arr.length; i++) {
          arr[i] = Math.floor(Math.random() * 256)
        }
        return arr
      }),
      subtle: {
        digest: vi.fn(() => Promise.resolve(new ArrayBuffer(32))),
        encrypt: vi.fn(() => Promise.resolve(new ArrayBuffer(32))),
        decrypt: vi.fn(() => Promise.resolve(new ArrayBuffer(32)))
      }
    }
  }

  // Mock WebSocket for real-time tests
  if (typeof global.WebSocket === 'undefined') {
    global.WebSocket = class MockWebSocket {
      static CONNECTING = 0
      static OPEN = 1
      static CLOSING = 2
      static CLOSED = 3
      
      readyState = 1 // OPEN
      onopen: (() => {}) | null = null
      onmessage: (() => {}) | null = null
      onclose: (() => {}) | null = null
      onerror: (() => {}) | null = null
      
      constructor(url: string) {
        setTimeout(() => {
          if (this.onopen) this.onopen(new Event('open'))
        }, 10)
      }
      
      send = vi.fn()
      close = vi.fn()
      addEventListener = vi.fn()
      removeEventListener = vi.fn()
    }
  }
}

// Cleanup function
export function cleanupMockServices(): void {
  if (mockServicesInstance) {
    mockServicesInstance.resetCallCounts()
  }
}

// Export utility functions
export const createMockApiResponse = <T>(data: T, delay: number = 100) => {
  return {
    ok: true,
    status: 200,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data))
  }
}

export const createMockApiError = (message: string, status: number = 500) => {
  return {
    ok: false,
    status,
    json: () => Promise.resolve({ error: message }),
    text: () => Promise.resolve(JSON.stringify({ error: message }))
  }
}

// Export for easy importing in tests
export default {
  setupMockServices,
  cleanupMockServices,
  MockServiceImplementation,
  MOCK_DELAYS,
  createMockApiResponse,
  createMockApiError
}