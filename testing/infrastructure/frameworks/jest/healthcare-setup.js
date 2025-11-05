/**
 * Healthcare-specific Jest setup
 * Global test configuration for My Family Clinic utility testing
 */

const { TextEncoder, TextDecoder } = require('util')

// Polyfill for Node.js environment
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock healthcare-specific APIs
global.fetch = jest.fn()

// Mock healthcare database operations
global.healthcareDb = {
  patients: new Map(),
  doctors: new Map(),
  appointments: new Map(),
  medicalRecords: new Map(),
  
  // Patient operations
  createPatient: jest.fn((patient) => {
    const id = 'patient_' + Math.random().toString(36).substr(2, 9)
    const newPatient = { ...patient, id, createdAt: new Date().toISOString() }
    global.healthcareDb.patients.set(id, newPatient)
    return newPatient
  }),
  
  getPatient: jest.fn((id) => global.healthcareDb.patients.get(id)),
  
  updatePatient: jest.fn((id, updates) => {
    const patient = global.healthcareDb.patients.get(id)
    if (patient) {
      const updated = { ...patient, ...updates, updatedAt: new Date().toISOString() }
      global.healthcareDb.patients.set(id, updated)
      return updated
    }
    return null
  }),
  
  // Doctor operations
  createDoctor: jest.fn((doctor) => {
    const id = 'doctor_' + Math.random().toString(36).substr(2, 9)
    const newDoctor = { ...doctor, id, createdAt: new Date().toISOString() }
    global.healthcareDb.doctors.set(id, newDoctor)
    return newDoctor
  }),
  
  getDoctor: jest.fn((id) => global.healthcareDb.doctors.get(id)),
  
  // Appointment operations
  createAppointment: jest.fn((appointment) => {
    const id = 'apt_' + Math.random().toString(36).substr(2, 9)
    const newAppointment = { 
      ...appointment, 
      id, 
      createdAt: new Date().toISOString(),
      status: 'scheduled'
    }
    global.healthcareDb.appointments.set(id, newAppointment)
    return newAppointment
  }),
  
  getAppointment: jest.fn((id) => global.healthcareDb.appointments.get(id)),
  
  // Medical record operations
  createMedicalRecord: jest.fn((record) => {
    const id = 'mr_' + Math.random().toString(36).substr(2, 9)
    const newRecord = { ...record, id, createdAt: new Date().toISOString() }
    global.healthcareDb.medicalRecords.set(id, newRecord)
    return newRecord
  }),
}

// Mock PDPA compliance functions
global.pdpaUtils = {
  validateConsent: jest.fn((consent) => {
    return consent && 
           consent.given === true && 
           consent.version && 
           consent.timestamp
  }),
  
  anonymizeData: jest.fn((data) => {
    // Simple anonymization for testing
    return {
      ...data,
      name: 'Anonymous Patient',
      nric: 'S' + 'X'.repeat(7) + 'A',
      phone: '+65-****-****',
      email: 'anonymous@example.com',
    }
  }),
  
  checkDataRetention: jest.fn((record) => {
    const retentionPeriod = 7 * 365 * 24 * 60 * 60 * 1000 // 7 years in milliseconds
    const now = new Date().getTime()
    const recordDate = new Date(record.createdAt).getTime()
    return (now - recordDate) < retentionPeriod
  }),
}

// Mock MOH validation functions
global.mohUtils = {
  validateNRIC: jest.fn((nric) => {
    return /^[ST]\d{7}[A-Z]$/.test(nric.toUpperCase())
  }),
  
  validatePhone: jest.fn((phone) => {
    return /^\+65-?[689]\d{7}$/.test(phone)
  }),
  
  validatePostalCode: jest.fn((postalCode) => {
    return /^\d{6}$/.test(postalCode)
  }),
  
  validateAppointmentSlot: jest.fn((slot) => {
    // Business hours: 9 AM to 6 PM, Monday to Friday
    const date = new Date(slot)
    const day = date.getDay() // 0 = Sunday, 1 = Monday, etc.
    const hour = date.getHours()
    
    return day >= 1 && day <= 5 && hour >= 9 && hour < 18
  }),
}

// Mock Healthier SG integration
global.healthierSGUtils = {
  checkEligibility: jest.fn((patient) => {
    // Mock eligibility check based on age and residency
    const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()
    return age >= 18 && patient.residencyStatus === 'citizen'
  }),
  
  validateHealthGoal: jest.fn((goal) => {
    const validGoals = [
      'weight-management',
      'diabetes-prevention',
      'hypertension-management',
      'cholesterol-control',
      'mental-wellness',
    ]
    return validGoals.includes(goal.type)
  }),
}

// Healthcare test data generators
global.healthcareTestData = {
  generatePatient: () => ({
    id: 'patient_' + Math.random().toString(36).substr(2, 9),
    name: 'John Doe',
    nric: 'S' + Math.floor(Math.random() * 9000000 + 1000000) + 'A',
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
  
  generateDoctor: () => ({
    id: 'doctor_' + Math.random().toString(36).substr(2, 9),
    name: 'Dr. Sarah Lim',
    specialization: 'General Practice',
    registrationNumber: 'MCR' + Math.floor(Math.random() * 90000 + 10000),
    phone: '+65-6234-5678',
    email: 'dr.lim@clinic.com',
    availability: [
      new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Day after
    ],
  }),
  
  generateAppointment: (patientId, doctorId) => ({
    id: 'apt_' + Math.random().toString(36).substr(2, 9),
    patientId,
    doctorId,
    dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    type: 'consultation',
    status: 'scheduled',
    notes: '',
  }),
  
  generateMedicalRecord: (patientId) => ({
    id: 'mr_' + Math.random().toString(36).substr(2, 9),
    patientId,
    date: new Date().toISOString(),
    diagnosis: 'General Consultation',
    treatment: 'Prescribed medication',
    doctorNotes: 'Patient appears healthy',
    followUpRequired: false,
    followUpDate: null,
  }),
}

// Singapore healthcare-specific constants
global.healthcareConstants = {
  SINGAPORE: {
    COUNTRIES: ['Singapore', 'SG'],
    CURRENCIES: ['SGD'],
    LANGUAGES: ['English', 'Mandarin', 'Malay', 'Tamil'],
    TIMEZONE: 'Asia/Singapore',
  },
  
  PDPA: {
    CONSENT_VERSION: '2025.1',
    DATA_RETENTION_YEARS: 7,
    MINIMUM_AGE: 18,
  },
  
  MOH: {
    BUSINESS_HOURS: {
      START: 9, // 9 AM
      END: 18,  // 6 PM
    },
    WORKING_DAYS: [1, 2, 3, 4, 5], // Monday to Friday
  },
  
  HEALTHIER_SG: {
    MINIMUM_AGE: 40,
    ENROLLMENT_PERIOD_MONTHS: 12,
  },
}

// Mock console methods to reduce test noise
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}

// Suppress warnings during tests unless debugging
if (process.env.DEBUG_TESTS !== 'true') {
  global.console.warn = jest.fn()
  global.console.error = jest.fn()
}

// Set default test timeout
jest.setTimeout(10000)