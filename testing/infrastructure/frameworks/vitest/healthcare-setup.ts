/**
 * Healthcare-specific Vitest setup
 * Configures testing environment for My Family Clinic healthcare platform
 */

import '@testing-library/jest-dom'
import { expect, afterEach, beforeAll, afterAll, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Extend Vitest expect with testing-library matchers
expect.extend(matchers)

// Mock IntersectionObserver for healthcare UI components
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock ResizeObserver for responsive healthcare layouts
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock window.matchMedia for responsive design testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Healthcare-specific global mocks
global.navigator = {
  ...global.navigator,
  clipboard: {
    writeText: vi.fn(),
  },
}

// Mock localStorage for healthcare data persistence testing
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock sessionStorage for user session testing
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
}
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
})

// Healthcare-specific test utilities
global.testUtils = {
  // Simulate patient data for testing
  mockPatientData: () => ({
    id: 'patient_' + Math.random().toString(36).substr(2, 9),
    name: 'John Doe',
    nric: 'S1234567A',
    dateOfBirth: '1990-01-01',
    gender: 'male',
    phone: '+65-9123-4567',
    email: 'john.doe@example.com',
    address: '123 Singapore Street, Singapore 123456',
    emergencyContacts: [
      {
        name: 'Jane Doe',
        relationship: 'spouse',
        phone: '+65-9876-5432',
      }
    ],
    medicalHistory: [],
    allergies: [],
    medications: [],
    pdpaConsent: {
      given: true,
      timestamp: new Date().toISOString(),
      version: '2025.1',
    },
  }),

  // Mock healthcare API responses
  mockHealthcareApi: () => ({
    appointments: [
      {
        id: 'apt_' + Math.random().toString(36).substr(2, 9),
        patientId: 'patient_123',
        doctorId: 'doctor_456',
        dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        type: 'consultation',
        status: 'scheduled',
      }
    ],
    doctors: [
      {
        id: 'doctor_456',
        name: 'Dr. Sarah Lim',
        specialization: 'General Practice',
        availability: [
          '2025-11-06T09:00:00Z',
          '2025-11-06T10:00:00Z',
          '2025-11-06T11:00:00Z',
        ],
      }
    ],
    services: [
      {
        id: 'svc_001',
        name: 'General Consultation',
        duration: 30,
        price: 50.00,
        category: 'general',
      }
    ],
  }),

  // Validate Singapore phone number format
  isValidSingaporePhone: (phone: string) => {
    return /^\+65-?[689]\d{7}$/.test(phone)
  },

  // Validate Singapore NRIC format
  isValidSingaporeNRIC: (nric: string) => {
    return /^[ST]\d{7}[A-Z]$/.test(nric.toUpperCase())
  },

  // Generate anonymous patient ID for testing
  generateAnonymousPatientId: () => {
    return 'anon_' + Math.random().toString(36).substr(2, 16)
  },
}

// Clean up after each test case
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

// Suppress console warnings during tests unless debugging
if (process.env.DEBUG_TESTS !== 'true') {
  global.console = {
    ...console,
    warn: vi.fn(),
    error: vi.fn(),
  }
}

// Extend timeout for healthcare data processing tests
process.env.VITEST_TIMEOUT = '60000'