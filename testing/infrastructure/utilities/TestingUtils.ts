/**
 * Healthcare Testing Utilities
 * Common utilities and helpers for My Family Clinic testing infrastructure
 */

import { 
  PatientData, 
  DoctorData, 
  AppointmentData, 
  MedicalRecord 
} from '../healthcare/HealthcareTestFramework'

// Test Data Utilities
export class TestDataUtils {
  // Generate random test patient with valid healthcare data
  public static createTestPatient(): PatientData {
    const id = `patient_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
    return {
      id,
      name: this.generateRandomName(),
      nric: this.generateValidNRIC(),
      dateOfBirth: this.generateRandomBirthDate(),
      gender: this.randomChoice(['male', 'female']),
      phone: this.generateValidSingaporePhone(),
      email: this.generateEmail(),
      address: this.generateSingaporeAddress(),
      emergencyContacts: [
        {
          name: this.generateRandomName(),
          relationship: this.randomChoice(['spouse', 'parent', 'child', 'sibling']),
          phone: this.generateValidSingaporePhone()
        }
      ],
      medicalHistory: [],
      allergies: [],
      medications: [],
      pdpaConsent: {
        given: true,
        timestamp: new Date().toISOString(),
        version: '2025.1',
        scope: ['medical_records', 'appointments', 'healthier_sg']
      }
    }
  }

  // Generate test doctor with valid credentials
  public static createTestDoctor(): DoctorData {
    return {
      id: `doctor_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      name: `Dr. ${this.generateRandomName()}`,
      specialization: this.randomChoice([
        'General Practice', 'Family Medicine', 'Internal Medicine', 
        'Cardiology', 'Dermatology', 'Endocrinology'
      ]),
      registrationNumber: this.generateMCRNumber(),
      phone: this.generateValidSingaporePhone(),
      email: this.generateEmail('dr'),
      availability: [
        new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      ],
      qualifications: ['MBBS', 'FRCGP'],
      languages: this.randomChoice([
        ['English'],
        ['English', 'Mandarin'],
        ['English', 'Malay'],
        ['English', 'Tamil']
      ])
    }
  }

  // Generate test appointment between patient and doctor
  public static createTestAppointment(patientId: string, doctorId: string): AppointmentData {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 7) // 1 week from now
    
    return {
      id: `apt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      patientId,
      doctorId,
      dateTime: futureDate.toISOString(),
      type: this.randomChoice(['consultation', 'follow-up', 'screening']),
      status: 'scheduled',
      notes: '',
      duration: this.randomChoice([15, 30, 45, 60])
    }
  }

  // Generate test medical record
  public static createTestMedicalRecord(patientId: string, doctorId: string): MedicalRecord {
    return {
      id: `mr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      date: new Date().toISOString(),
      diagnosis: this.randomChoice([
        'Upper Respiratory Tract Infection',
        'Hypertension',
        'Diabetes Mellitus Type 2',
        'Hyperlipidemia',
        'Gastroenteritis',
        'Acute Bronchitis',
        'Allergic Rhinitis'
      ]),
      treatment: this.randomChoice([
        'Prescribed medication and rest',
        'Lifestyle modifications',
        'Follow-up appointment scheduled',
        'Referral to specialist',
        'Prescribed therapy sessions'
      ]),
      doctorNotes: this.randomChoice([
        'Patient appears well, vital signs normal',
        'Patient reports improvement in symptoms',
        'Recommend continued medication compliance',
        'Patient educated on condition management',
        'Follow-up required in 4 weeks'
      ]),
      followUpRequired: Math.random() > 0.7,
      followUpDate: Math.random() > 0.7 ? 
        new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      doctorId
    }
  }

  // Helper methods for data generation
  private static generateRandomName(): string {
    const firstNames = [
      'John', 'Mary', 'David', 'Sarah', 'Michael', 'Lisa', 'James', 'Emma',
      'Robert', 'Jennifer', 'William', 'Ashley', 'Richard', 'Jessica',
      'Wei Ming', 'Mei Lin', 'Jun Wei', 'Xin Yi', 'Ahmad', 'Fatimah',
      'Raj', 'Priya', 'Kumar', 'Anita', 'Vikram', 'Deepika'
    ]
    const lastNames = [
      'Lim', 'Tan', 'Ng', 'Lee', 'Chong', 'Wong', 'Goh', 'Teo', 'Ang', 'Yeo',
      'Zhang', 'Wang', 'Li', 'Chen', 'Liu', 'Yang', 'Huang', 'Zhao',
      'Rahman', 'Hussain', 'Ali', 'Khan', 'Abdullah', 'Ismail',
      'Singh', 'Kumar', 'Patel', 'Sharma', 'Gupta', 'Reddy'
    ]

    return `${this.randomChoice(firstNames)} ${this.randomChoice(lastNames)}`
  }

  private static generateValidNRIC(): string {
    const letters = ['S', 'T']
    const letter = this.randomChoice(letters)
    const numbers = this.randomInt(1000000, 9999999).toString()
    const lastLetter = 'ABCDEFGHIZJ'.charAt(this.randomInt(0, 11))
    return letter + numbers + lastLetter
  }

  private static generateValidSingaporePhone(): string {
    const firstDigits = ['8', '9', '6']
    const first = this.randomChoice(firstDigits)
    const rest = this.randomInt(1000000, 9999999).toString()
    return `+65-${first}${rest.substring(0, 4)}-${rest.substring(4)}`
  }

  private static generateEmail(prefix: string = 'user'): string {
    const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com']
    return `${prefix}${this.randomInt(1000, 9999)}@${this.randomChoice(domains)}`
  }

  private static generateSingaporeAddress(): string {
    const streets = [
      'Orchard Road', 'Marina Bay', 'Clarke Quay', 'Sentosa Island',
      'Bugis Street', 'Little India', 'Chinatown', 'Kampong Glam',
      'East Coast Road', 'West Coast Highway', 'Jurong East',
      'Tampines', 'Woodlands', 'Toa Payoh', 'Bishan', 'Ang Mo Kio'
    ]
    const numbers = Array.from({ length: 999 }, (_, i) => i + 1)
    const postalCode = this.randomInt(100000, 999999).toString()
    
    return `${this.randomChoice(numbers)} ${this.randomChoice(streets)}, Singapore ${postalCode}`
  }

  private static generateRandomBirthDate(): string {
    const currentYear = new Date().getFullYear()
    const birthYear = this.randomInt(currentYear - 80, currentYear - 18) // 18-80 years old
    const month = this.randomInt(1, 12)
    const day = this.randomInt(1, 28) // Safe day range
    return `${birthYear}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
  }

  private static generateMCRNumber(): string {
    return `MCR${this.randomInt(10000, 99999)}`
  }

  private static randomChoice<T>(array: T[]): T {
    return array[this.randomInt(0, array.length - 1)]
  }

  private static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }
}

// API Testing Utilities
export class APITestUtils {
  // Mock API responses for healthcare endpoints
  public static createMockPatientResponse(patient: PatientData) {
    return {
      id: patient.id,
      name: patient.name,
      nric: patient.nric,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      phone: patient.phone,
      email: patient.email,
      address: patient.address,
      emergencyContacts: patient.emergencyContacts,
      medicalHistory: patient.medicalHistory,
      allergies: patient.allergies,
      medications: patient.medications,
      pdpaConsent: patient.pdpaConsent,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }

  public static createMockAppointmentResponse(appointment: AppointmentData) {
    return {
      id: appointment.id,
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      dateTime: appointment.dateTime,
      type: appointment.type,
      status: appointment.status,
      notes: appointment.notes,
      duration: appointment.duration,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }

  public static createMockMedicalRecordResponse(record: MedicalRecord) {
    return {
      id: record.id,
      date: record.date,
      diagnosis: record.diagnosis,
      treatment: record.treatment,
      doctorNotes: record.doctorNotes,
      followUpRequired: record.followUpRequired,
      followUpDate: record.followUpDate,
      doctorId: record.doctorId,
      createdAt: new Date().toISOString()
    }
  }

  // Validation utilities for API responses
  public static validatePatientResponse(response: any, expectedPatient: PatientData): boolean {
    return (
      response.id === expectedPatient.id &&
      response.name === expectedPatient.name &&
      response.nric === expectedPatient.nric &&
      response.email === expectedPatient.email &&
      response.pdpaConsent?.given === true
    )
  }

  public static validateAppointmentResponse(response: any, expectedAppointment: AppointmentData): boolean {
    return (
      response.id === expectedAppointment.id &&
      response.patientId === expectedAppointment.patientId &&
      response.doctorId === expectedAppointment.doctorId &&
      response.type === expectedAppointment.type
    )
  }

  // Common API test scenarios
  public static async testUnauthorizedAccess(apiCall: () => Promise<any>) {
    try {
      await apiCall()
      throw new Error('Expected 401 Unauthorized but request succeeded')
    } catch (error: any) {
      if (error.response?.status === 401) {
        return { success: true, message: 'Correctly rejected unauthorized access' }
      }
      throw error
    }
  }

  public static async testForbiddenAccess(apiCall: () => Promise<any>) {
    try {
      await apiCall()
      throw new Error('Expected 403 Forbidden but request succeeded')
    } catch (error: any) {
      if (error.response?.status === 403) {
        return { success: true, message: 'Correctly rejected forbidden access' }
      }
      throw error
    }
  }

  public static async testValidationError(apiCall: () => Promise<any>) {
    try {
      await apiCall()
      throw new Error('Expected 400 validation error but request succeeded')
    } catch (error: any) {
      if (error.response?.status === 400) {
        return { 
          success: true, 
          message: 'Correctly rejected invalid data',
          errors: error.response.data?.errors || []
        }
      }
      throw error
    }
  }
}

// Performance Testing Utilities
export class PerformanceTestUtils {
  // Calculate response time percentiles
  public static calculatePercentile(responseTimes: number[], percentile: number): number {
    const sorted = responseTimes.sort((a, b) => a - b)
    const index = Math.ceil((percentile / 100) * sorted.length) - 1
    return sorted[index]
  }

  public static calculateAverage(responseTimes: number[]): number {
    return responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
  }

  public static calculateMedian(responseTimes: number[]): number {
    return this.calculatePercentile(responseTimes, 50)
  }

  // Performance thresholds for healthcare applications
  public static getPerformanceThresholds() {
    return {
      // Healthcare-specific performance requirements
      appointmentBooking: {
        maxResponseTime: 3000, // 3 seconds for appointment booking
        maxThroughput: 100,    // 100 bookings per second
        errorRate: 1.0         // 1% maximum error rate
      },
      patientData: {
        maxResponseTime: 2000, // 2 seconds for patient data retrieval
        maxThroughput: 200,    // 200 requests per second
        errorRate: 0.5         // 0.5% maximum error rate
      },
      medicalRecords: {
        maxResponseTime: 5000, // 5 seconds for medical records
        maxThroughput: 50,     // 50 requests per second
        errorRate: 0.1         // 0.1% maximum error rate
      },
      general: {
        p50: 500,   // 50% of requests under 500ms
        p90: 1500,  // 90% of requests under 1.5s
        p95: 3000,  // 95% of requests under 3s
        p99: 5000   // 99% of requests under 5s
      }
    }
  }

  // Load test patterns for healthcare scenarios
  public static createHealthcareLoadPattern() {
    return {
      name: 'healthcare-load-pattern',
      phases: [
        {
          name: 'warmup',
          duration: 60, // 1 minute warmup
          users: 10,
          rampUp: 30
        },
        {
          name: 'steady-load',
          duration: 300, // 5 minutes steady load
          users: 50,
          rampUp: 0
        },
        {
          name: 'peak-load',
          duration: 180, // 3 minutes peak load
          users: 100,
          rampUp: 60
        },
        {
          name: 'cool-down',
          duration: 120, // 2 minutes cool down
          users: 10,
          rampDown: 60
        }
      ]
    }
  }

  // Simulate different user types in healthcare
  public static createUserSimulationScripts() {
    return {
      patient: {
        login: () => this.simulatePatientLogin(),
        viewProfile: () => this.simulatePatientProfileView(),
        bookAppointment: () => this.simulateAppointmentBooking(),
        viewMedicalRecords: () => this.simulateMedicalRecordView(),
        manageConsents: () => this.simulateConsentManagement()
      },
      doctor: {
        login: () => this.simulateDoctorLogin(),
        viewDashboard: () => this.simulateDoctorDashboard(),
        viewPatientRecords: () => this.simulatePatientRecordView(),
        createPrescription: () => this.simulatePrescriptionCreation(),
        scheduleAppointments: () => this.simulateAppointmentScheduling()
      }
    }
  }

  private static simulatePatientLogin(): any {
    return {
      endpoint: '/api/auth/login',
      method: 'POST',
      payload: {
        email: 'patient@example.com',
        password: 'password123'
      },
      thinkTime: 2000
    }
  }

  private static simulatePatientProfileView(): any {
    return {
      endpoint: '/api/patients/profile',
      method: 'GET',
      thinkTime: 1000
    }
  }

  private static simulateAppointmentBooking(): any {
    return {
      endpoint: '/api/appointments',
      method: 'POST',
      payload: {
        doctorId: 'doctor_123',
        dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        type: 'consultation'
      },
      thinkTime: 5000
    }
  }

  private static simulateMedicalRecordView(): any {
    return {
      endpoint: '/api/medical-records',
      method: 'GET',
      thinkTime: 3000
    }
  }

  private static simulateConsentManagement(): any {
    return {
      endpoint: '/api/pdpa/consent',
      method: 'PUT',
      payload: {
        given: true,
        scope: ['medical_records', 'appointments']
      },
      thinkTime: 2000
    }
  }

  private static simulateDoctorLogin(): any {
    return {
      endpoint: '/api/auth/doctor-login',
      method: 'POST',
      payload: {
        registrationNumber: 'MCR12345',
        password: 'doctorpassword123'
      },
      thinkTime: 1500
    }
  }

  private static simulateDoctorDashboard(): any {
    return {
      endpoint: '/api/doctor/dashboard',
      method: 'GET',
      thinkTime: 2000
    }
  }

  private static simulatePatientRecordView(): any {
    return {
      endpoint: '/api/patients/{id}/medical-records',
      method: 'GET',
      thinkTime: 2500
    }
  }

  private static simulatePrescriptionCreation(): any {
    return {
      endpoint: '/api/prescriptions',
      method: 'POST',
      payload: {
        patientId: 'patient_123',
        medication: 'Paracetamol',
        dosage: '500mg',
        frequency: 'Twice daily'
      },
      thinkTime: 4000
    }
  }

  private static simulateAppointmentScheduling(): any {
    return {
      endpoint: '/api/appointments/schedule',
      method: 'POST',
      payload: {
        patientId: 'patient_123',
        dateTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        duration: 30
      },
      thinkTime: 3000
    }
  }
}

// Accessibility Testing Utilities
export class AccessibilityTestUtils {
  // Common accessibility selectors and patterns
  public static getAccessibilitySelectors() {
    return {
      // Form accessibility
      formLabels: 'label, [aria-label], [aria-labelledby]',
      requiredFields: '[required], [aria-required="true"]',
      errorMessages: '.error, [aria-invalid="true"], .field-error',
      helpText: '.help-text, [aria-describedby]',
      
      // Navigation accessibility
      skipLinks: 'a[href^="#"], .skip-link',
      headings: 'h1, h2, h3, h4, h5, h6',
      landmarks: 'nav, main, aside, header, footer, [role="banner"], [role="main"]',
      
      // Interactive elements
      buttons: 'button, [role="button"], input[type="button"], input[type="submit"]',
      links: 'a[href]',
      focusable: 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      
      // Media accessibility
      images: 'img, picture, svg',
      videos: 'video, audio, [role="application"]',
      
      // Tables
      tables: 'table',
      tableHeaders: 'th, [role="columnheader"]',
      tableCells: 'td, [role="gridcell"]'
    }
  }

  // WCAG 2.2 AA test checklist
  public static getWCAGChecklist() {
    return {
      perceivable: {
        '1.1.1': 'Non-text content has alternative text',
        '1.2.1': 'Audio and video have captions or transcripts',
        '1.3.1': 'Information has proper structure and meaning',
        '1.4.1': 'Color is not the only means of conveying information',
        '1.4.2': 'Audio control is provided',
        '1.4.3': 'Text has sufficient contrast (4.5:1)',
        '1.4.4': 'Text can be resized up to 200% without loss of functionality',
        '1.4.5': 'Images of text are avoided',
        '1.4.10': 'Content reflows without loss of information',
        '1.4.11': 'Non-text elements have sufficient contrast',
        '1.4.12': 'Text spacing can be adjusted',
        '1.4.13': 'Content on hover is dismissible',
        '1.4.14': 'Images of text are avoided'
      },
      operable: {
        '2.1.1': 'All functionality available via keyboard',
        '2.1.2': 'No keyboard traps',
        '2.1.4': 'Key shortcuts do not conflict with keyboard commands',
        '2.2.1': 'Timing can be adjusted',
        '2.2.2': 'Pauses, stops, or hides moving content',
        '2.3.1': 'No more than 3 flashes in any 1 second period',
        '2.4.1': 'Skip links provided to bypass blocks',
        '2.4.2': 'Pages have descriptive titles',
        '2.4.3': 'Focus order is logical',
        '2.4.4': 'Link purpose is clear',
        '2.4.5': 'Multiple ways to find pages',
        '2.4.6': 'Headings and labels are descriptive',
        '2.4.7': 'Focus is visible',
        '2.4.8': 'Location is clear',
        '2.4.9': 'Link purpose is clear',
        '2.4.10': 'Sections have headings',
        '2.4.11': 'Focus appearance is prominent'
      },
      understandable: {
        '3.1.1': 'Language of page is specified',
        '3.1.2': 'Language of parts is specified',
        '3.2.1': 'Context does not change on focus',
        '3.2.2': 'Context does not change on input',
        '3.3.1': 'Errors are identified',
        '3.3.2': 'Labels or instructions are provided',
        '3.3.3': 'Error suggestions are provided',
        '3.3.4': 'Error prevention for important data',
        '3.3.5': 'Help is available'
      },
      robust: {
        '4.1.1': 'Parsing is valid',
        '4.1.2': 'Name, role, value are properly exposed',
        '4.1.3': 'Status messages are identified'
      }
    }
  }

  // Color contrast utilities
  public static calculateContrastRatio(color1: string, color2: string): number {
    // Mock implementation - would calculate actual contrast ratio
    // WCAG AA requires 4.5:1 for normal text, 3:1 for large text
    const mockRatio = 4.2 + Math.random() * 2 // Mock ratio between 4.2 and 6.2
    return Math.round(mockRatio * 100) / 100
  }

  public static isContrastCompliant(ratio: number, level: 'AA' | 'AAA' = 'AA', size: 'normal' | 'large' = 'normal'): boolean {
    const thresholds = {
      AA: { normal: 4.5, large: 3.0 },
      AAA: { normal: 7.0, large: 4.5 }
    }
    
    return ratio >= thresholds[level][size]
  }

  // Focus management utilities
  public static getFocusableElements(): HTMLElement[] {
    // Mock implementation - would return actual focusable elements
    const mockElements: HTMLElement[] = []
    return mockElements.filter(el => {
      const focusableSelectors = [
        'button:not([disabled])',
        'a[href]',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])'
      ]
      return focusableSelectors.some(selector => el.matches(selector))
    })
  }

  // Screen reader testing utilities
  public static createScreenReaderTest(description: string, element: HTMLElement, expectedAnnouncement: string) {
    return {
      description,
      element: element.tagName.toLowerCase(),
      ariaAttributes: Array.from(element.attributes).map(attr => `${attr.name}="${attr.value}"`),
      expectedAnnouncement,
      actualAnnouncement: null, // Would be populated by screen reader testing
      passed: false // Would be determined by comparison
    }
  }
}

// Security Testing Utilities
export class SecurityTestUtils {
  // Healthcare-specific security test patterns
  public static getSecurityTestPatterns() {
    return {
      injection: {
        sql: [
          "' OR '1'='1",
          "'; DROP TABLE patients; --",
          "' UNION SELECT * FROM medical_records --"
        ],
        xss: [
          '<script>alert("xss")</script>',
          'javascript:alert("xss")',
          '<img src=x onerror=alert("xss")>'
        ],
        command: [
          '; ls -la',
          '&& cat /etc/passwd',
          '| whoami'
        ]
      },
      pathTraversal: [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32\\',
        '....//....//etc//passwd'
      ],
      bruteForce: {
        commonPasswords: [
          'password', 'password123', '123456', 'admin', 'healthcare',
          'patient123', 'doctor123', 'singapore', 'moh2025', 'pdpa123'
        ]
      }
    }
  }

  // Healthcare data validation patterns
  public static getHealthcareValidationPatterns() {
    return {
      singapore: {
        nric: /^[ST]\d{7}[A-Z]$/,
        phone: /^\+65-?[689]\d{7}$/,
        postalCode: /^\d{6}$/
      },
      medical: {
        mcrNumber: /^MCR\d{5}$/,
        appointmentTime: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/,
        dosage: /^\d+(\.\d+)?\s*(mg|g|ml|units)$/i
      }
    }
  }

  // Generate test tokens for authentication
  public static generateTestToken(userType: 'patient' | 'doctor' | 'admin'): string {
    const payload = {
      sub: `${userType}_${Date.now()}`,
      type: userType,
      exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour expiry
      iat: Math.floor(Date.now() / 1000)
    }
    
    // Mock JWT token generation
    return `mock.${btoa(JSON.stringify(payload))}.signature`
  }

  // Check for common security headers
  public static getRequiredSecurityHeaders(): Record<string, string> {
    return {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'",
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
    }
  }
}

// Test Environment Utilities
export class EnvironmentTestUtils {
  // Create isolated test database connection
  public static createTestDatabase() {
    return {
      url: 'postgresql://postgres:postgres@localhost:5432/healthcare_test_' + Date.now(),
      options: {
        ssl: false,
        maxConnections: 5,
        timeout: 5000
      },
      setup: async () => {
        // Mock database setup
        console.log('Setting up isolated test database...')
      },
      teardown: async () => {
        // Mock database teardown
        console.log('Tearing down test database...')
      }
    }
  }

  // Mock external services for testing
  public static createMockServices() {
    return {
      supabase: {
        url: 'http://localhost:54321',
        key: 'test-key',
        client: {
          auth: {
            signIn: () => Promise.resolve({ user: { id: 'test-user' } }),
            signOut: () => Promise.resolve({})
          }
        }
      },
      email: {
        send: () => Promise.resolve({ messageId: 'test-message-id' }),
        validate: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      },
      sms: {
        send: () => Promise.resolve({ messageId: 'test-sms-id' }),
        validate: (phone: string) => /^\+65-?[689]\d{7}$/.test(phone)
      }
    }
  }

  // Generate test configuration
  public static generateTestConfig() {
    return {
      environment: 'test',
      database: {
        url: 'postgresql://postgres:postgres@localhost:5432/healthcare_test',
        poolSize: 5
      },
      api: {
        baseUrl: 'http://localhost:3000/api',
        timeout: 10000,
        retries: 2
      },
      auth: {
        jwtSecret: 'test-jwt-secret',
        sessionTimeout: 3600,
        maxLoginAttempts: 3
      },
      features: {
        pdpaCompliance: true,
        mohStandards: true,
        healthierSGIntegration: true,
        multiLanguageSupport: true
      }
    }
  }
}

// Export all utilities
export {
  TestDataUtils,
  APITestUtils,
  PerformanceTestUtils,
  AccessibilityTestUtils,
  SecurityTestUtils,
  EnvironmentTestUtils
}