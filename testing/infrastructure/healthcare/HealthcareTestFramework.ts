/**
 * Healthcare Testing Framework
 * Core utilities for testing My Family Clinic healthcare platform
 */

export interface PatientData {
  id: string
  name: string
  nric: string
  dateOfBirth: string
  gender: 'male' | 'female' | 'other'
  phone: string
  email: string
  address: string
  emergencyContacts: EmergencyContact[]
  medicalHistory: MedicalRecord[]
  allergies: string[]
  medications: Medication[]
  pdpaConsent: PDPAConsent
  healthierSG?: HealthierSGData
}

export interface EmergencyContact {
  name: string
  relationship: string
  phone: string
}

export interface MedicalRecord {
  id: string
  date: string
  diagnosis: string
  treatment: string
  doctorNotes: string
  followUpRequired: boolean
  followUpDate?: string
  doctorId: string
}

export interface Medication {
  name: string
  dosage: string
  frequency: string
  startDate: string
  endDate?: string
  prescribedBy: string
}

export interface PDPAConsent {
  given: boolean
  timestamp: string
  version: string
  scope: string[]
  withdrawalDate?: string
}

export interface HealthierSGData {
  enrolled: boolean
  enrollmentDate?: string
  healthGoals: HealthGoal[]
  lastScreening?: string
  providerId?: string
}

export interface HealthGoal {
  type: 'weight-management' | 'diabetes-prevention' | 'hypertension-management' | 'cholesterol-control' | 'mental-wellness'
  target: string
  startDate: string
  endDate?: string
  progress: number
}

export interface DoctorData {
  id: string
  name: string
  specialization: string
  registrationNumber: string
  phone: string
  email: string
  availability: string[]
  qualifications: string[]
  languages: string[]
}

export interface AppointmentData {
  id: string
  patientId: string
  doctorId: string
  dateTime: string
  type: 'consultation' | 'follow-up' | 'emergency' | 'screening'
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show'
  notes: string
  duration: number
}

export interface ClinicData {
  id: string
  name: string
  address: string
  phone: string
  email: string
  operatingHours: OperatingHours[]
  services: ClinicService[]
  licenses: License[]
}

export interface OperatingHours {
  dayOfWeek: number // 0 = Sunday, 1 = Monday, etc.
  openTime: string // HH:MM format
  closeTime: string // HH:MM format
  closed: boolean
}

export interface ClinicService {
  id: string
  name: string
  description: string
  duration: number // minutes
  price: number
  category: 'general' | 'specialist' | 'screening' | 'vaccination'
  requiresBooking: boolean
}

export interface License {
  type: 'MOH License' | 'PHMC Certification' | 'ISO Certification'
  number: string
  issuedDate: string
  expiryDate: string
  issuer: string
}

export class HealthcareTestFramework {
  private static instance: HealthcareTestFramework
  private testData: Map<string, any> = new Map()

  public static getInstance(): HealthcareTestFramework {
    if (!HealthcareTestFramework.instance) {
      HealthcareTestFramework.instance = new HealthcareTestFramework()
    }
    return HealthcareTestFramework.instance
  }

  // Patient Data Generation
  public generatePatientData(overrides: Partial<PatientData> = {}): PatientData {
    const basePatient: PatientData = {
      id: this.generateId('patient'),
      name: 'John Doe',
      nric: this.generateValidNRIC(),
      dateOfBirth: '1990-01-01',
      gender: 'male',
      phone: this.generateValidSingaporePhone(),
      email: 'john.doe@example.com',
      address: '123 Singapore Street, Singapore 123456',
      emergencyContacts: [
        {
          name: 'Jane Doe',
          relationship: 'spouse',
          phone: '+65-9876-5432'
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

    return { ...basePatient, ...overrides }
  }

  // Doctor Data Generation
  public generateDoctorData(overrides: Partial<DoctorData> = {}): DoctorData {
    const baseDoctor: DoctorData = {
      id: this.generateId('doctor'),
      name: 'Dr. Sarah Lim',
      specialization: 'General Practice',
      registrationNumber: this.generateMCRNumber(),
      phone: '+65-6234-5678',
      email: 'dr.lim@clinic.com',
      availability: [
        new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      ],
      qualifications: ['MBBS', 'FRCGP'],
      languages: ['English', 'Mandarin']
    }

    return { ...baseDoctor, ...overrides }
  }

  // Appointment Data Generation
  public generateAppointmentData(patientId: string, doctorId: string, overrides: Partial<AppointmentData> = {}): AppointmentData {
    const baseAppointment: AppointmentData = {
      id: this.generateId('appointment'),
      patientId,
      doctorId,
      dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      type: 'consultation',
      status: 'scheduled',
      notes: '',
      duration: 30
    }

    return { ...baseAppointment, ...overrides }
  }

  // Medical Record Generation
  public generateMedicalRecord(patientId: string, doctorId: string, overrides: Partial<MedicalRecord> = {}): MedicalRecord {
    const baseRecord: MedicalRecord = {
      id: this.generateId('medical_record'),
      date: new Date().toISOString(),
      diagnosis: 'General Consultation',
      treatment: 'Prescribed medication',
      doctorNotes: 'Patient appears healthy',
      followUpRequired: false,
      followUpDate: undefined,
      doctorId
    }

    return { ...baseRecord, ...overrides }
  }

  // Singapore-specific validation functions
  public validateSingaporeNRIC(nric: string): boolean {
    return /^[ST]\d{7}[A-Z]$/.test(nric.toUpperCase())
  }

  public validateSingaporePhone(phone: string): boolean {
    return /^\+65-?[689]\d{7}$/.test(phone)
  }

  public validateSingaporePostalCode(postalCode: string): boolean {
    return /^\d{6}$/.test(postalCode)
  }

  public validateMOHBusinessHours(dateTime: string): boolean {
    const date = new Date(dateTime)
    const day = date.getDay() // 0 = Sunday, 1 = Monday, etc.
    const hour = date.getHours()
    
    // Monday to Friday, 9 AM to 6 PM
    return day >= 1 && day <= 5 && hour >= 9 && hour < 18
  }

  // PDPA compliance validation
  public validatePDPAConsent(consent: PDPAConsent): boolean {
    return (
      consent &&
      consent.given === true &&
      consent.version &&
      consent.timestamp &&
      consent.scope &&
      consent.scope.length > 0
    )
  }

  public validateDataRetention(createdAt: string, retentionYears: number = 7): boolean {
    const created = new Date(createdAt).getTime()
    const now = new Date().getTime()
    const retentionPeriod = retentionYears * 365 * 24 * 60 * 60 * 1000
    return (now - created) < retentionPeriod
  }

  // Healthier SG validation
  public validateHealthierSGEnrollment(patient: PatientData): boolean {
    const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()
    return age >= 18 && patient.healthierSG?.enrolled === true
  }

  public validateHealthGoal(goal: HealthGoal): boolean {
    const validGoals = [
      'weight-management',
      'diabetes-prevention', 
      'hypertension-management',
      'cholesterol-control',
      'mental-wellness'
    ]
    return validGoals.includes(goal.type)
  }

  // Test data management
  public storeTestData(key: string, data: any): void {
    this.testData.set(key, data)
  }

  public getTestData(key: string): any {
    return this.testData.get(key)
  }

  public clearTestData(): void {
    this.testData.clear()
  }

  // Private helper methods
  private generateId(prefix: string): string {
    return `${prefix}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateValidNRIC(): string {
    const letters = ['S', 'T']
    const letter = letters[Math.floor(Math.random() * letters.length)]
    const numbers = Math.floor(Math.random() * 9000000 + 1000000).toString()
    const lastLetter = 'ABCDEFGHIZJ'.charAt(Math.floor(Math.random() * 12))
    return letter + numbers + lastLetter
  }

  private generateValidSingaporePhone(): string {
    const digits = Math.floor(Math.random() * 80000000 + 10000000).toString()
    return `+65-${digits.slice(0, 4)}-${digits.slice(4)}`
  }

  private generateMCRNumber(): string {
    return `MCR${Math.floor(Math.random() * 90000 + 10000)}`
  }

  // Healthcare workflow helpers
  public createCompleteHealthcareScenario() {
    const patient = this.generatePatientData()
    const doctor = this.generateDoctorData()
    const appointment = this.generateAppointmentData(patient.id, doctor.id)
    const medicalRecord = this.generateMedicalRecord(patient.id, doctor.id)

    // Store complete scenario
    const scenario = {
      patient,
      doctor,
      appointment,
      medicalRecord,
      timestamp: new Date().toISOString()
    }

    this.storeTestData('complete_scenario', scenario)
    return scenario
  }

  public createPDPACompliantScenario() {
    const patient = this.generatePatientData({
      pdpaConsent: {
        given: true,
        timestamp: new Date().toISOString(),
        version: '2025.1',
        scope: ['medical_records', 'appointments', 'healthier_sg']
      }
    })

    this.storeTestData('pdpa_compliant_scenario', patient)
    return patient
  }

  public createHealthierSGScenario() {
    const patient = this.generatePatientData({
      healthierSG: {
        enrolled: true,
        enrollmentDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        healthGoals: [
          {
            type: 'weight-management',
            target: 'Lose 5kg in 6 months',
            startDate: new Date().toISOString(),
            progress: 0
          }
        ],
        lastScreening: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
      }
    })

    this.storeTestData('healthier_sg_scenario', patient)
    return patient
  }
}

// Export singleton instance
export const healthcareTestFramework = HealthcareTestFramework.getInstance()

// Export utility functions for direct use
export const {
  generatePatientData,
  generateDoctorData,
  generateAppointmentData,
  generateMedicalRecord,
  validateSingaporeNRIC,
  validateSingaporePhone,
  validateMOHBusinessHours,
  validatePDPAConsent,
  validateHealthierSGEnrollment
} = healthcareTestFramework