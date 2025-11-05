/**
 * Synthetic Healthcare Data Generator
 * Generates realistic, anonymized healthcare data for testing My Family Clinic
 */

import { 
  PatientData, 
  DoctorData, 
  AppointmentData, 
  MedicalRecord, 
  ClinicData,
  HealthGoal,
  EmergencyContact,
  Medication,
  PDPAConsent,
  HealthierSGData
} from './HealthcareTestFramework'

export interface SyntheticDataOptions {
  count: number
  anonymize: boolean
  includeSensitiveData: boolean
  dateRange: {
    start: Date
    end: Date
  }
  locales: ('en' | 'zh' | 'ms' | 'ta')[]
}

export class HealthcareDataGenerator {
  private static instance: HealthcareDataGenerator

  public static getInstance(): HealthcareDataGenerator {
    if (!HealthcareDataGenerator.instance) {
      HealthcareDataGenerator.instance = new HealthcareDataGenerator()
    }
    return HealthcareDataGenerator.instance
  }

  // Patient data generation
  public generatePatients(options: Partial<SyntheticDataOptions> = {}): PatientData[] {
    const count = options.count || 10
    const patients: PatientData[] = []

    for (let i = 0; i < count; i++) {
      const patient = this.generateSinglePatient(options)
      patients.push(patient)
    }

    return patients
  }

  private generateSinglePatient(options: Partial<SyntheticDataOptions> = {}): PatientData {
    const gender = this.randomChoice(['male', 'female'])
    const age = this.randomInt(18, 90)
    const dateOfBirth = this.generateRandomBirthDate(age)
    
    // Generate name based on gender and locale
    const locales = options.locales || ['en']
    const locale = this.randomChoice(locales)
    const name = this.generateName(gender, locale)
    
    // Generate contact information
    const phone = this.generateValidSingaporePhone()
    const email = this.generateEmail(name, locale)
    const address = this.generateSingaporeAddress()
    
    // Generate emergency contacts
    const emergencyContacts = this.generateEmergencyContacts(gender, locale)
    
    // Generate medical history based on age
    const medicalHistory = this.generateMedicalHistory(age)
    const allergies = this.generateAllergies(age)
    const medications = this.generateMedications(age)
    
    // Generate PDPA consent
    const pdpaConsent: PDPAConsent = {
      given: true,
      timestamp: this.randomDateWithinLastYear().toISOString(),
      version: '2025.1',
      scope: ['medical_records', 'appointments', 'healthier_sg'],
      withdrawalDate: Math.random() > 0.9 ? this.randomDateWithinLastYear().toISOString() : undefined
    }

    // Generate Healthier SG data based on age (typically for 40+)
    let healthierSG: HealthierSGData | undefined
    if (age >= 40 && Math.random() > 0.3) {
      healthierSG = this.generateHealthierSGData()
    }

    return {
      id: this.generateId('patient'),
      name,
      nric: this.generateValidNRIC(),
      dateOfBirth: dateOfBirth.toISOString().split('T')[0],
      gender,
      phone,
      email,
      address,
      emergencyContacts,
      medicalHistory,
      allergies,
      medications,
      pdpaConsent,
      healthierSG
    }
  }

  // Doctor data generation
  public generateDoctors(count: number = 5): DoctorData[] {
    const doctors: DoctorData[] = []
    const specializations = [
      'General Practice',
      'Family Medicine',
      'Internal Medicine',
      'Cardiology',
      'Dermatology',
      'Endocrinology',
      'Gastroenterology',
      'Neurology',
      'Orthopedics',
      'Pediatrics',
      'Psychiatry',
      'Radiology'
    ]

    for (let i = 0; i < count; i++) {
      const specialization = this.randomChoice(specializations)
      const doctor = this.generateSingleDoctor(specialization)
      doctors.push(doctor)
    }

    return doctors
  }

  private generateSingleDoctor(specialization: string): DoctorData {
    const name = this.generateDoctorName()
    const languages = this.randomChoice([
      ['English'],
      ['English', 'Mandarin'],
      ['English', 'Malay'],
      ['English', 'Tamil'],
      ['English', 'Mandarin', 'Malay'],
      ['English', 'Mandarin', 'Tamil']
    ])

    const qualifications = this.generateQualifications(specialization)

    // Generate availability for next 30 days
    const availability: string[] = []
    const now = new Date()
    for (let i = 1; i <= 30; i++) {
      const date = new Date(now.getTime() + i * 24 * 60 * 60 * 1000)
      const day = date.getDay()
      
      // Monday to Friday, 9 AM to 5 PM
      if (day >= 1 && day <= 5) {
        for (let hour = 9; hour < 17; hour++) {
          if (Math.random() > 0.7) { // 30% chance of availability
            const timeSlot = new Date(date)
            timeSlot.setHours(hour, 0, 0, 0)
            availability.push(timeSlot.toISOString())
          }
        }
      }
    }

    return {
      id: this.generateId('doctor'),
      name,
      specialization,
      registrationNumber: this.generateMCRNumber(),
      phone: this.generateValidSingaporePhone(),
      email: this.generateEmail(name, 'en'),
      availability,
      qualifications,
      languages
    }
  }

  // Appointment data generation
  public generateAppointments(patients: PatientData[], doctors: DoctorData[], count: number = 20): AppointmentData[] {
    const appointments: AppointmentData[] = []
    const appointmentTypes = ['consultation', 'follow-up', 'screening', 'vaccination']
    const statuses = ['scheduled', 'confirmed', 'completed', 'cancelled']

    for (let i = 0; i < count; i++) {
      const patient = this.randomChoice(patients)
      const doctor = this.randomChoice(doctors)
      
      // Pick an available slot from doctor's availability
      const availableSlots = doctor.availability.filter(slot => {
        const slotDate = new Date(slot)
        return slotDate.getTime() > Date.now() && this.randomChoice([true, false, false])
      })
      
      if (availableSlots.length === 0) continue

      const dateTime = this.randomChoice(availableSlots)
      
      const appointment: AppointmentData = {
        id: this.generateId('appointment'),
        patientId: patient.id,
        doctorId: doctor.id,
        dateTime,
        type: this.randomChoice(appointmentTypes) as any,
        status: this.randomChoice(statuses) as any,
        notes: this.generateAppointmentNotes(),
        duration: this.randomInt(15, 60)
      }

      appointments.push(appointment)
    }

    return appointments
  }

  // Medical record generation
  public generateMedicalRecords(patients: PatientData[], doctors: DoctorData[], count: number = 50): MedicalRecord[] {
    const records: MedicalRecord[] = []
    const diagnoses = [
      'Upper Respiratory Tract Infection',
      'Hypertension',
      'Diabetes Mellitus Type 2',
      'Hyperlipidemia',
      'Gastroenteritis',
      'Acute Bronchitis',
      'Allergic Rhinitis',
      'Headache',
      'Back Pain',
      'Anxiety Disorder',
      'Depression',
      'Osteoarthritis',
      'Migraine',
      'Constipation',
      'Insomnia'
    ]

    for (let i = 0; i < count; i++) {
      const patient = this.randomChoice(patients)
      const doctor = this.randomChoice(doctors)
      
      const record: MedicalRecord = {
        id: this.generateId('medical_record'),
        date: this.randomDateWithinLastYear().toISOString(),
        diagnosis: this.randomChoice(diagnoses),
        treatment: this.generateTreatmentPlan(),
        doctorNotes: this.generateDoctorNotes(),
        followUpRequired: Math.random() > 0.7,
        followUpDate: Math.random() > 0.7 ? 
          this.randomDateWithinNextMonth().toISOString() : 
          undefined,
        doctorId: doctor.id
      }

      records.push(record)
    }

    return records
  }

  // Helper methods for data generation
  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
  }

  private generateName(gender: 'male' | 'female', locale: string): string {
    const names = {
      en: {
        male: ['John', 'Michael', 'David', 'James', 'Robert', 'William', 'Richard'],
        female: ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan']
      },
      zh: {
        male: ['伟强', '志明', '家辉', '文博', '志华', '志强', '明辉'],
        female: ['美丽', '雅芳', '淑华', '秀英', '雅丽', '美玲', '淑珍']
      },
      ms: {
        male: ['Ahmad', 'Raj', 'Muhammad', 'Kumar', 'Ismail', 'Hassan', 'Ali'],
        female: ['Siti', 'Fatimah', 'Aisha', 'Nur', 'Zainab', 'Khadijah', 'Maryam']
      },
      ta: {
        male: ['Kumar', 'Vikram', 'Rajesh', 'Suresh', 'Mohan', 'Arun', 'Ganesh'],
        female: ['Priya', 'Anita', 'Sunita', 'Deepika', 'Neha', 'Kavya', 'Lakshmi']
      }
    }

    const givenNames = names[locale as keyof typeof names]?.[gender] || names.en[gender]
    const surnames = {
      en: ['Lim', 'Tan', 'Ng', 'Lee', 'Chong', 'Wong', 'Goh', 'Teo', 'Ang', 'Yeo'],
      zh: ['李', '王', '张', '刘', '陈', '杨', '黄', '赵', '吴', '周'],
      ms: ['Rahman', 'Hussain', 'Ali', 'Khan', 'Abdullah', 'Ismail', 'Hassan'],
      ta: ['Vijay', 'Kumar', 'Reddy', 'Singh', 'Patel', 'Sharma', 'Gupta']
    }

    const givenName = this.randomChoice(givenNames)
    const surname = this.randomChoice(surnames[locale as keyof typeof surnames] || surnames.en)

    return `${givenName} ${surname}`
  }

  private generateDoctorName(): string {
    const firstNames = [
      'Dr. Sarah', 'Dr. Michael', 'Dr. Lisa', 'Dr. David', 'Dr. Jennifer',
      'Dr. Robert', 'Dr. Maria', 'Dr. James', 'Dr. Emily', 'Dr. Christopher',
      'Dr. Wong', 'Dr. Lim', 'Dr. Tan', 'Dr. Chen', 'Dr. Ng',
      'Dr. Ahmad', 'Dr. Fatimah', 'Dr. Kumar', 'Dr. Priya', 'Dr. Singh'
    ]
    return this.randomChoice(firstNames)
  }

  private generateValidNRIC(): string {
    const letters = ['S', 'T']
    const letter = this.randomChoice(letters)
    const numbers = this.randomInt(1000000, 9999999).toString()
    const lastLetter = 'ABCDEFGHIZJ'.charAt(this.randomInt(0, 11))
    return letter + numbers + lastLetter
  }

  private generateValidSingaporePhone(): string {
    const firstDigits = ['8', '9', '6']
    const first = this.randomChoice(firstDigits)
    const rest = this.randomInt(1000000, 9999999).toString()
    return `+65-${first}${rest.substring(0, 4)}-${rest.substring(4)}`
  }

  private generateEmail(name: string, locale: string): string {
    const cleanName = name.toLowerCase()
      .replace(/[^a-z]/g, '.')
      .replace(/\.+/g, '.')
      .replace(/^\./, '')
      .replace(/\.$/, '')
    
    const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com']
    const domain = this.randomChoice(domains)
    
    return `${cleanName}@${domain}`
  }

  private generateSingaporeAddress(): string {
    const streetNumbers = Array.from({length: 999}, (_, i) => i + 1)
    const streetNames = [
      'Orchard Road', 'Marina Bay', 'Clarke Quay', 'Sentosa Island',
      'Bugis Street', 'Little India', 'Chinatown', 'Kampong Glam',
      'East Coast', 'West Coast', 'Jurong East', 'Tampines',
      'Woodlands', 'Toa Payoh', 'Bishan', 'Ang Mo Kio'
    ]
    
    const buildingTypes = ['Block', 'Unit', 'Building']
    const buildingType = this.randomChoice(buildingTypes)
    
    const streetNumber = this.randomChoice(streetNumbers)
    const streetName = this.randomChoice(streetNames)
    const postalCode = this.randomInt(100000, 999999).toString()
    
    return `${buildingType} ${streetNumber}, ${streetName}, Singapore ${postalCode}`
  }

  private generateEmergencyContacts(gender: 'male' | 'female', locale: string): EmergencyContact[] {
    const relationships = ['spouse', 'parent', 'child', 'sibling', 'friend', 'guardian']
    const relationship = this.randomChoice(relationships)
    
    const contact: EmergencyContact = {
      name: this.generateName(relationship === 'parent' ? (gender === 'male' ? 'female' : 'male') : gender, locale),
      relationship,
      phone: this.generateValidSingaporePhone()
    }

    return [contact]
  }

  private generateMedicalHistory(age: number): MedicalRecord[] {
    const commonConditions = ['Hypertension', 'Diabetes', 'High Cholesterol', 'Asthma']
    const history: MedicalRecord[] = []
    
    if (age > 40 && Math.random() > 0.5) {
      history.push({
        id: this.generateId('history'),
        date: this.randomDateWithinLastYear().toISOString(),
        diagnosis: this.randomChoice(commonConditions),
        treatment: 'Ongoing management',
        doctorNotes: 'Patient under regular follow-up',
        followUpRequired: true,
        followUpDate: this.randomDateWithinNextMonth().toISOString(),
        doctorId: this.generateId('doctor')
      })
    }
    
    return history
  }

  private generateAllergies(age: number): string[] {
    const commonAllergies = [
      'Penicillin', 'Shellfish', 'Peanuts', 'Dust Mites', 'Pollen',
      'Latex', 'Eggs', 'Milk', 'Soy', 'Fish'
    ]
    
    const allergies: string[] = []
    if (Math.random() > 0.7) {
      const numAllergies = this.randomInt(1, 3)
      for (let i = 0; i < numAllergies; i++) {
        const allergen = this.randomChoice(commonAllergies)
        if (!allergies.includes(allergen)) {
          allergies.push(allergen)
        }
      }
    }
    
    return allergies
  }

  private generateMedications(age: number): Medication[] {
    const commonMedications = [
      { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily' },
      { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' },
      { name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily' },
      { name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily' },
      { name: 'Aspirin', dosage: '81mg', frequency: 'Once daily' }
    ]
    
    const medications: Medication[] = []
    if (age > 40 && Math.random() > 0.6) {
      const numMeds = this.randomInt(1, 3)
      for (let i = 0; i < numMeds; i++) {
        const med = this.randomChoice(commonMedications)
        medications.push({
          ...med,
          startDate: this.randomDateWithinLastYear().toISOString().split('T')[0],
          prescribedBy: this.generateId('doctor')
        })
      }
    }
    
    return medications
  }

  private generateHealthierSGData(): HealthierSGData {
    const healthGoals: HealthGoal[] = []
    const goalTypes = [
      'weight-management',
      'diabetes-prevention',
      'hypertension-management',
      'cholesterol-control',
      'mental-wellness'
    ]
    
    const numGoals = this.randomInt(1, 3)
    for (let i = 0; i < numGoals; i++) {
      const goalType = this.randomChoice(goalTypes)
      healthGoals.push({
        type: goalType as any,
        target: this.generateGoalTarget(goalType),
        startDate: this.randomDateWithinLastYear().toISOString(),
        progress: this.randomInt(0, 100)
      })
    }

    return {
      enrolled: true,
      enrollmentDate: this.randomDateWithinLastYear().toISOString(),
      healthGoals,
      lastScreening: this.randomDateWithinLastYear().toISOString(),
      providerId: this.generateId('provider')
    }
  }

  private generateGoalTarget(goalType: string): string {
    const targets: { [key: string]: string[] } = {
      'weight-management': [
        'Lose 5kg in 6 months',
        'Reduce BMI to 22',
        'Lose 10kg in 1 year'
      ],
      'diabetes-prehibition': [
        'Maintain HbA1c < 7%',
        'Reduce fasting glucose to < 100mg/dL',
        'Prevent diabetes onset'
      ],
      'hypertension-management': [
        'Maintain BP < 140/90 mmHg',
        'Reduce systolic BP by 10mmHg',
        'Achieve target BP of 130/80 mmHg'
      ],
      'cholesterol-control': [
        'Reduce LDL to < 100mg/dL',
        'Maintain total cholesterol < 200mg/dL',
        'Increase HDL to > 40mg/dL'
      ],
      'mental-wellness': [
        'Practice meditation daily',
        'Improve sleep quality',
        'Reduce stress levels'
      ]
    }

    return this.randomChoice(targets[goalType] || ['General health improvement'])
  }

  private generateQualifications(specialization: string): string[] {
    const baseQualifications = ['MBBS', 'MD']
    const specialistQualifications: { [key: string]: string[] } = {
      'General Practice': ['FRCGP', 'GDFM'],
      'Family Medicine': ['FRCGP', 'MMed FM'],
      'Cardiology': ['MRCP', 'MCardiology'],
      'Dermatology': ['MRCP', 'Mdermatology'],
      'Endocrinology': ['MRCP', 'MEndo'],
      'Gastroenterology': ['MRCP', 'MGastro'],
      'Neurology': ['MRCP', 'MNeuro'],
      'Orthopedics': ['MRCS', 'MOrth'],
      'Pediatrics': ['MRCPCH', 'MPediatrics'],
      'Psychiatry': ['MRCPsych', 'MPsychiatry'],
      'Radiology': ['FRCR', 'MRadiology']
    }

    const qualifications = [...baseQualifications]
    const specialistQuals = specialistQualifications[specialization]
    if (specialistQuals && Math.random() > 0.3) {
      qualifications.push(this.randomChoice(specialistQuals))
    }

    return qualifications
  }

  private generateAppointmentNotes(): string {
    const notes = [
      'Patient reported mild symptoms',
      'Routine check-up appointment',
      'Follow-up consultation',
      'Health screening appointment',
      'Vaccination appointment',
      'Patient has concerns about symptoms',
      'Emergency consultation',
      'Annual physical examination'
    ]
    return this.randomChoice(notes)
  }

  private generateTreatmentPlan(): string {
    const treatments = [
      'Prescribed medication and lifestyle changes',
      'Recommended dietary modifications',
      'Exercise regimen prescribed',
      'Referral to specialist',
      'Follow-up in 2 weeks',
      'Conservative treatment approach',
      'Prescribed therapy sessions',
      'Lifestyle counseling provided'
    ]
    return this.randomChoice(treatments)
  }

  private generateDoctorNotes(): string {
    const notes = [
      'Patient appears well, vital signs normal',
      'Patient reports improvement in symptoms',
      'Recommend continued medication compliance',
      'Patient educated on condition management',
      'Follow-up required in 4 weeks',
      'Monitor blood pressure readings',
      'Patient advised on dietary restrictions',
      'Lifestyle modifications discussed'
    ]
    return this.randomChoice(notes)
  }

  // Date generation helpers
  private generateRandomBirthDate(age: number): Date {
    const currentYear = new Date().getFullYear()
    const birthYear = currentYear - age
    const birthDate = new Date(birthYear, this.randomInt(0, 11), this.randomInt(1, 28))
    return birthDate
  }

  private randomDateWithinLastYear(): Date {
    const now = new Date()
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
    return new Date(this.randomInt(oneYearAgo.getTime(), now.getTime()))
  }

  private randomDateWithinNextMonth(): Date {
    const now = new Date()
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())
    return new Date(this.randomInt(now.getTime(), nextMonth.getTime()))
  }

  private generateMCRNumber(): string {
    return `MCR${this.randomInt(10000, 99999)}`
  }

  // Utility methods
  private randomChoice<T>(array: T[]): T {
    return array[this.randomInt(0, array.length - 1)]
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  // Bulk data generation methods
  public generateCompleteDataset(options: Partial<SyntheticDataOptions> = {}): {
    patients: PatientData[]
    doctors: DoctorData[]
    appointments: AppointmentData[]
    medicalRecords: MedicalRecord[]
  } {
    const patientCount = options.count || 50
    const doctorCount = Math.max(3, Math.floor(patientCount / 10))
    const appointmentCount = patientCount * 2
    const medicalRecordCount = patientCount * 3

    const patients = this.generatePatients({ ...options, count: patientCount })
    const doctors = this.generateDoctors(doctorCount)
    const appointments = this.generateAppointments(patients, doctors, appointmentCount)
    const medicalRecords = this.generateMedicalRecords(patients, doctors, medicalRecordCount)

    return {
      patients,
      doctors,
      appointments,
      medicalRecords
    }
  }

  public exportToJSON(data: any, filename: string): void {
    const jsonData = JSON.stringify(data, null, 2)
    // In a real implementation, this would write to a file
    console.log(`Exported ${filename}.json with ${Array.isArray(data) ? data.length : Object.keys(data).length} records`)
  }
}

// Export singleton instance
export const healthcareDataGenerator = HealthcareDataGenerator.getInstance()