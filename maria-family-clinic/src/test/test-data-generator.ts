/**
 * Test Data Generator for Doctor System
 * Phase 7.10 - Testing & Quality Assurance
 * 
 * Generates comprehensive mock data for testing all aspects of the doctor system
 */

import { DoctorProfile, MockDoctor, MockClinic, TEST_DATA_SIZES } from './types'

// Singapore-specific medical institutions
const SINGAPORE_INSTITUTIONS = [
  'National University of Singapore',
  'Nanyang Technological University',
  'Duke-NUS Medical School',
  'Lee Kong Chian School of Medicine',
  'Singapore General Hospital',
  'National University Hospital',
  'Tan Tock Seng Hospital',
  'Changi General Hospital',
  'Singapore National Eye Centre',
  'National Heart Centre Singapore'
]

// International medical institutions
const INTERNATIONAL_INSTITUTIONS = [
  'Harvard Medical School',
  'Johns Hopkins School of Medicine',
  'Mayo Clinic School of Medicine',
  'University of Melbourne',
  'Imperial College London',
  'University of Sydney Medical School',
  'McGill University Faculty of Medicine',
  'University of Toronto Faculty of Medicine',
  'Karolinska Institute',
  'University of Edinburgh Medical School'
]

// Medical specialties and subspecialties
const SPECIALTIES = {
  'Cardiology': ['Interventional Cardiology', 'Heart Failure', 'Cardiac Electrophysiology', 'Pediatric Cardiology'],
  'Dermatology': ['Cosmetic Dermatology', 'Pediatric Dermatology', 'Dermatopathology', 'Mohs Surgery'],
  'Internal Medicine': ['Endocrinology', 'Gastroenterology', 'Rheumatology', 'Nephrology'],
  'Pediatrics': ['Pediatric Cardiology', 'Pediatric Neurology', 'Pediatric Gastroenterology', 'Neonatology'],
  'Orthopedics': ['Joint Replacement', 'Sports Medicine', 'Spine Surgery', 'Pediatric Orthopedics'],
  'Neurology': ['Stroke Medicine', 'Epilepsy', 'Movement Disorders', 'Neurocritical Care'],
  'Ophthalmology': ['Retina Surgery', 'Glaucoma', 'Cataract Surgery', 'Pediatric Ophthalmology'],
  'Otolaryngology': ['Head and Neck Surgery', 'Rhinology', 'Laryngology', 'Otology'],
  'Psychiatry': ['Child Psychiatry', 'Geriatric Psychiatry', 'Addiction Psychiatry', 'Forensic Psychiatry'],
  'Anesthesiology': ['Cardiac Anesthesia', 'Pediatric Anesthesia', 'Pain Management', 'Critical Care']
}

// Common names for mock doctors
const FIRST_NAMES = [
  'Sarah', 'Michael', 'Priya', 'James', 'Wei Ming', 'Ling', 'David', 'Emma', 'Raj', 'Fatima',
  'Alexander', 'Grace', 'Hassan', 'Lily', 'Benjamin', 'Chloe', 'Daniel', 'Isabella', 'Ethan', 'Sophia',
  'Aiden', 'Olivia', 'Lucas', 'Emma', 'Mason', 'Ava', 'Logan', 'Charlotte', 'Oliver', 'Amelia'
]

const LAST_NAMES = [
  'Chen', 'Wong', 'Tan', 'Lim', 'Ng', 'Lee', 'Kumar', 'Patel', 'Singh', 'Zhang',
  'Smith', 'Johnson', 'Brown', 'Davis', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson',
  'White', 'Harris', 'Martin', 'Thompson', 'Garcia', 'Martinez', 'Robinson', 'Clark', 'Rodriguez', 'Lewis'
]

// Medical degrees and certifications
const MEDICAL_DEGREES = [
  'MBBS', 'MD', 'M.D.', 'MBChB', 'MCh', 'MSc', 'PhD', 'FRCP', 'FAMS', 'FACC',
  'FACS', 'FRCS', 'FAAP', 'FACP', 'FCCC', 'FCCM', 'FACOG', 'FAAOS', 'FANZCA', 'FCPS'
]

// Board certifications
const BOARD_CERTIFICATIONS = [
  'American Board of Cardiology',
  'American Board of Dermatology',
  'American Board of Internal Medicine',
  'American Board of Pediatrics',
  'American Board of Orthopaedic Surgery',
  'American Board of Neurology',
  'American Board of Ophthalmology',
  'American Board of Otolaryngology',
  'American Board of Psychiatry',
  'American Board of Anesthesiology',
  'Specialist Accreditation Board Singapore',
  'Royal College of Physicians',
  'Royal College of Surgeons',
  'Royal Australian and New Zealand College of Psychiatrists'
]

// Clinic names
const CLINIC_NAMES = [
  'Heart Care Medical Centre', 'Skin Health Clinic', 'General Medical Practice',
  'Children Hospital Medical Centre', 'Ortho Specialists', 'Neuro Care Centre',
  'Eye Care Institute', 'ENT Specialist Centre', 'Mental Wellness Clinic',
  'Anesthesia Services', 'Wellness Medical Centre', 'Family Health Clinic',
  'Specialist Medical Group', 'Advanced Care Centre', 'Integrated Health Services'
]

// Clinic addresses in Singapore
const CLINIC_ADDRESSES = [
  '123 Medical Drive, Singapore 169857',
  '456 Healthcare Avenue, Singapore 188098',
  '789 Wellness Street, Singapore 238859',
  '321 Clinic Road, Singapore 149345',
  '654 Health Lane, Singapore 188888',
  '987 Medicine Boulevard, Singapore 238859',
  '147 Surgery Street, Singapore 148728',
  '258 Hospital Way, Singapore 169571',
  '369 Healthcare Plaza, Singapore 188839',
  '741 Medical Mall, Singapore 238573'
]

// Languages spoken in Singapore
const LANGUAGES = [
  'English', 'Mandarin', 'Malay', 'Tamil', 'Cantonese', 'Hindi', 'Japanese', 'Korean', 'French', 'German'
]

// MCR number generator (Singapore format: M + 5 digits + letter)
const generateMCRNumber = (): string => {
  const digits = Math.floor(Math.random() * 100000).toString().padStart(5, '0')
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const letter = letters[Math.floor(Math.random() * letters.length)]
  return `M${digits}${letter}`
}

// SPC number generator (Singapore format: SPC + 6-8 digits)
const generateSPCNumber = (): string => {
  const digits = Math.floor(Math.random() * 10000000).toString()
  return `SPC${digits}`
}

// Generate random medical license
const generateMedicalLicense = () => {
  const issueDate = new Date(2020 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
  const expiryDate = new Date(issueDate.getTime() + (5 * 365 * 24 * 60 * 60 * 1000)) // 5 years later
  
  return {
    number: `ML-SG-${2020 + Math.floor(Math.random() * 3)}-${Math.floor(Math.random() * 1000)}`,
    issuedDate: issueDate.toISOString().split('T')[0],
    expiryDate: expiryDate.toISOString().split('T')[0],
    status: 'active' as const,
    restrictions: [],
    issuingAuthority: 'Singapore Medical Council'
  }
}

// Generate random appointment slots
const generateAppointmentSlots = (count: number = 5) => {
  const slots = []
  const today = new Date()
  
  for (let i = 0; i < count; i++) {
    const date = new Date(today.getTime() + (i * 24 * 60 * 60 * 1000))
    const hour = 9 + Math.floor(Math.random() * 8) // 9 AM to 5 PM
    const minute = Math.random() > 0.5 ? 30 : 0
    
    slots.push({
      id: `slot_${i}`,
      date: date.toISOString().split('T')[0],
      time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      available: Math.random() > 0.2, // 80% availability
      duration: 30 + Math.floor(Math.random() * 60), // 30-90 minutes
      type: ['consultation', 'follow-up', 'procedure'][Math.floor(Math.random() * 3)]
    })
  }
  
  return slots
}

// Generate consultation fees
const generateConsultationFees = () => {
  const baseFee = 50 + Math.floor(Math.random() * 150) // $50-$200
  return {
    consultation: baseFee,
    followUp: Math.floor(baseFee * 0.7),
    procedure: baseFee + Math.floor(Math.random() * 200),
    insuranceAccepted: ['Medisave', 'Medishield', 'Private Insurance']
  }
}

// Generate random qualification
const generateQualification = (index: number) => {
  const degree = MEDICAL_DEGREES[Math.floor(Math.random() * MEDICAL_DEGREES.length)]
  const isLocal = Math.random() > 0.3 // 70% local institutions
  const institution = isLocal 
    ? SINGAPORE_INSTITUTIONS[Math.floor(Math.random() * SINGAPORE_INSTITUTIONS.length)]
    : INTERNATIONAL_INSTITUTIONS[Math.floor(Math.random() * INTERNATIONAL_INSTITUTIONS.length)]
  
  return {
    degree,
    institution,
    year: 2015 + Math.floor(Math.random() * 8), // 2015-2022
    verified: true,
    institutionType: isLocal ? 'local' as const : 'foreign' as const,
    accreditationStatus: 'recognized' as const
  }
}

// Generate board certifications
const generateBoardCertifications = () => {
  const certifications = []
  const numCerts = Math.floor(Math.random() * 3) + 1 // 1-3 certifications
  
  for (let i = 0; i < numCerts; i++) {
    const board = BOARD_CERTIFICATIONS[Math.floor(Math.random() * BOARD_CERTIFICATIONS.length)]
    const year = 2018 + Math.floor(Math.random() * 5) // 2018-2022
    const expiryYear = year + 5 // 5-year certification
    
    certifications.push({
      board,
      certified: true,
      year,
      expiryYear,
      verified: true
    })
  }
  
  return certifications
}

// Generate professional indemnity
const generateProfessionalIndemnity = () => {
  const providers = [
    'Medical Protection Society',
    'Medical Defense Union',
    'The Medical Malpractice Alliance',
    'Singapore Medical Association',
    'Medical Practitioners Association Singapore'
  ]
  
  const expiryDate = new Date()
  expiryDate.setFullYear(expiryDate.getFullYear() + 1)
  
  return {
    provider: providers[Math.floor(Math.random() * providers.length)],
    policyNumber: `MPS-${2025}-${Math.floor(Math.random() * 1000)}`,
    coverageAmount: 1000000 + Math.floor(Math.random() * 1000000), // $1M-$2M
    expiryDate: expiryDate.toISOString().split('T')[0],
    status: 'active' as const
  }
}

// Generate continuing education data
const generateContinuingEducation = () => {
  const pointsEarned = Math.floor(Math.random() * 50) + 20 // 20-70 points
  const pointsRequired = 50
  const status = pointsEarned >= pointsRequired ? 'compliant' : 'non-compliant'
  
  return {
    cmePointsEarned: pointsEarned,
    cmePointsRequired: pointsRequired,
    lastUpdated: new Date().toISOString().split('T')[0],
    status: status as 'compliant' | 'non-compliant' | 'pending'
  }
}

// Generate disciplinary record
const generateDisciplinaryRecord = () => {
  const hasActions = Math.random() > 0.9 // 10% chance of disciplinary actions
  const actions = []
  
  if (hasActions) {
    const actionTypes = ['warning', 'suspension', 'restriction']
    const authorities = ['Singapore Medical Council', 'Specialist Accreditation Board', 'Medical Board']
    
    for (let i = 0; i < Math.floor(Math.random() * 2) + 1; i++) {
      actions.push({
        type: actionTypes[Math.floor(Math.random() * actionTypes.length)] as 'warning' | 'suspension' | 'restriction' | 'revocation',
        date: new Date(2020 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
        authority: authorities[Math.floor(Math.random() * authorities.length)],
        description: 'Minor procedural violation resolved',
        status: 'resolved' as 'active' | 'resolved' | 'appealed'
      })
    }
  }
  
  return {
    hasActions,
    actions
  }
}

// Main function to generate a single doctor profile
export function generateDoctorProfile(overrides: Partial<DoctorProfile> = {}): DoctorProfile {
  const id = overrides.id || `doc_${Math.random().toString(36).substr(2, 9)}`
  const specialty = overrides.specialty || Object.keys(SPECIALTIES)[Math.floor(Math.random() * Object.keys(SPECIALTIES).length)]
  const subSpecialties = overrides.subSpecialties || SPECIALTIES[specialty as keyof typeof SPECIALTIES]
    .slice(0, Math.floor(Math.random() * 3) + 1)
  
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]
  const name = overrides.name || `Dr. ${firstName} ${lastName}`
  
  const qualifications = Array.from({ length: Math.floor(Math.random() * 4) + 2 }, (_, i) => 
    generateQualification(i)
  )
  
  const experience = Math.floor(Math.random() * 30) + 1 // 1-30 years
  const languages = Array.from({ length: Math.floor(Math.random() * 4) + 1 }, () => 
    LANGUAGES[Math.floor(Math.random() * LANGUAGES.length)]
  ).filter((lang, index, arr) => arr.indexOf(lang) === index) // Remove duplicates
  
  const rating = Math.round((3.5 + Math.random() * 1.5) * 10) / 10 // 3.5-5.0
  const reviewCount = Math.floor(Math.random() * 500) + 10
  
  return {
    id,
    name,
    specialty,
    subSpecialties,
    qualifications,
    experience,
    languages,
    bio: `${name} is an experienced ${specialty.toLowerCase()} specialist with over ${experience} years of practice. Specializing in ${subSpecialties.join(', ').toLowerCase()}.`,
    clinicId: overrides.clinicId || `clinic_${Math.random().toString(36).substr(2, 9)}`,
    clinic: {
      name: overrides.clinic?.name || CLINIC_NAMES[Math.floor(Math.random() * CLINIC_NAMES.length)],
      address: overrides.clinic?.address || CLINIC_ADDRESSES[Math.floor(Math.random() * CLINIC_ADDRESSES.length)],
      phone: overrides.clinic?.phone || `+65-6${Math.floor(Math.random() * 9000000 + 1000000)}`,
      ...overrides.clinic
    },
    rating,
    reviewCount,
    verificationBadges: {
      mcrVerified: Math.random() > 0.1, // 90% verified
      spcVerified: Math.random() > 0.2, // 80% verified
      boardCertified: Math.random() > 0.15, // 85% certified
      experienceVerified: Math.random() > 0.05 // 95% verified
    },
    profileImage: overrides.profileImage || `/images/doctors/${id}.jpg`,
    availableSlots: generateAppointmentSlots(),
    consultationFees: generateConsultationFees(),
    telemedicineAvailable: Math.random() > 0.3, // 70% offer telemedicine
    waitingTime: Math.floor(Math.random() * 30) + 5, // 5-35 minutes
    mcrNumber: overrides.mcrNumber || generateMCRNumber(),
    spcNumber: overrides.spcNumber || (Math.random() > 0.5 ? generateSPCNumber() : undefined),
    medicalLicense: generateMedicalLicense(),
    specialtyRegistrations: Array.from({ length: Math.floor(Math.random() * 2) + 1 }, () => ({
      specialty,
      subSpecialty: subSpecialties[0],
      registrationDate: '2020-01-01',
      expiryDate: '2025-01-01',
      status: 'active' as const,
      issuingAuthority: 'Specialist Accreditation Board Singapore'
    })),
    boardCertifications: generateBoardCertifications(),
    professionalIndemnity: generateProfessionalIndemnity(),
    continuingEducation: generateContinuingEducation(),
    disciplinaryRecord: generateDisciplinaryRecord(),
    ...overrides
  }
}

// Generate a clinic profile
export function generateClinicProfile(overrides: Partial<MockClinic> = {}): MockClinic {
  const id = overrides.id || `clinic_${Math.random().toString(36).substr(2, 9)}`
  const name = overrides.name || CLINIC_NAMES[Math.floor(Math.random() * CLINIC_NAMES.length)]
  
  return {
    id,
    name,
    address: overrides.address || CLINIC_ADDRESSES[Math.floor(Math.random() * CLINIC_ADDRESSES.length)],
    phone: overrides.phone || `+65-6${Math.floor(Math.random() * 9000000 + 1000000)}`,
    email: overrides.email || `${name.toLowerCase().replace(/\s+/g, '.')}@clinic.sg`,
    operatingHours: {
      monday: '09:00-17:00',
      tuesday: '09:00-17:00',
      wednesday: '09:00-17:00',
      thursday: '09:00-17:00',
      friday: '09:00-17:00',
      saturday: '09:00-13:00',
      sunday: 'Closed'
    },
    services: [
      'General Consultation', 'Specialist Consultation', 'Health Screening',
      'Vaccination', 'Minor Surgery', 'Diagnostic Tests'
    ],
    coordinates: {
      lat: 1.3521 + (Math.random() - 0.5) * 0.2, // Around Singapore
      lng: 103.8198 + (Math.random() - 0.5) * 0.2
    },
    mcrRegistered: true,
    operatingLicense: `CL-2025-${Math.floor(Math.random() * 1000)}`,
    accreditedBy: 'MOH Singapore',
    mockId: id,
    generatedAt: new Date().toISOString(),
    validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    ...overrides
  }
}

// Generate batch of doctor profiles
export function generateDoctorBatch(size: keyof typeof TEST_DATA_SIZES = 'MEDIUM', options: {
  specialties?: string[]
  experienceRange?: [number, number]
  ratingRange?: [number, number]
  verifiedOnly?: boolean
} = {}): DoctorProfile[] {
  const count = TEST_DATA_SIZES[size]
  const doctors: DoctorProfile[] = []
  
  const specialties = options.specialties || Object.keys(SPECIALTIES)
  const [minExp, maxExp] = options.experienceRange || [1, 30]
  const [minRating, maxRating] = options.ratingRange || [3.0, 5.0]
  
  for (let i = 0; i < count; i++) {
    const doctor = generateDoctorProfile({
      specialty: specialties[i % specialties.length],
      experience: Math.floor(Math.random() * (maxExp - minExp + 1)) + minExp,
      rating: Math.round((Math.random() * (maxRating - minRating) + minRating) * 10) / 10
    })
    
    // Filter for verified only if specified
    if (options.verifiedOnly) {
      const badges = doctor.verificationBadges
      if (!badges.mcrVerified || !badges.spcVerified) {
        continue
      }
    }
    
    doctors.push(doctor)
  }
  
  return doctors
}

// Generate invalid/corrupted data for negative testing
export function generateInvalidDoctorData() {
  const invalidDoctors = [
    generateDoctorProfile({
      mcrNumber: 'INVALID_FORMAT',
      spcNumber: ''
    }),
    generateDoctorProfile({
      medicalLicense: {
        ...generateMedicalLicense(),
        status: 'expired'
      }
    }),
    generateDoctorProfile({
      profileImage: null,
      qualifications: []
    }),
    generateDoctorProfile({
      disciplinaryRecord: {
        hasActions: true,
        actions: [{
          type: 'suspension',
          date: '2023-01-01',
          authority: 'Singapore Medical Council',
          description: 'Suspension for professional misconduct',
          status: 'active'
        }]
      }
    })
  ]
  
  return invalidDoctors
}

// Generate search test queries
export function generateSearchTestQueries() {
  return [
    { query: 'cardiologist', expectedResults: 20, category: 'specialty' as const },
    { query: 'Dr. Sarah', expectedResults: 5, category: 'name' as const },
    { query: 'heart failure', expectedResults: 15, category: 'condition' as const },
    { query: 'Central Singapore', expectedResults: 30, category: 'location' as const },
    { query: 'MBBS NUS', expectedResults: 10, category: 'qualification' as const },
    { query: 'skin doctor', expectedResults: 12, category: 'general' as const },
    { query: 'cadiologist', expectedResults: 20, category: 'fuzzy' as const, fuzzyMatch: true },
    { query: 'pediatric heart', expectedResults: 8, category: 'general' as const }
  ]
}

// Generate performance test scenarios
export function generatePerformanceScenarios() {
  return {
    small: {
      doctorCount: TEST_DATA_SIZES.SMALL,
      concurrentUsers: 10,
      duration: 30000
    },
    medium: {
      doctorCount: TEST_DATA_SIZES.MEDIUM,
      concurrentUsers: 50,
      duration: 60000
    },
    large: {
      doctorCount: TEST_DATA_SIZES.LARGE,
      concurrentUsers: 100,
      duration: 120000
    },
    extraLarge: {
      doctorCount: TEST_DATA_SIZES.EXTRA_LARGE,
      concurrentUsers: 200,
      duration: 300000
    }
  }
}

// Generate accessibility test scenarios
export function generateAccessibilityScenarios() {
  return [
    {
      component: 'DoctorSearch',
      viewport: { width: 1920, height: 1080 },
      description: 'Desktop search interface'
    },
    {
      component: 'DoctorSearch',
      viewport: { width: 768, height: 1024 },
      description: 'Tablet search interface'
    },
    {
      component: 'DoctorSearch',
      viewport: { width: 375, height: 667 },
      description: 'Mobile search interface'
    },
    {
      component: 'DoctorProfile',
      viewport: { width: 1920, height: 1080 },
      description: 'Desktop profile view'
    },
    {
      component: 'DoctorProfile',
      viewport: { width: 375, height: 667 },
      description: 'Mobile profile view'
    }
  ]
}

// Main export function
export function generateTestData() {
  console.log('🔄 Generating comprehensive test data...')
  
  const data = {
    // Doctor profiles
    doctors: {
      small: generateDoctorBatch('SMALL'),
      medium: generateDoctorBatch('MEDIUM'),
      large: generateDoctorBatch('LARGE'),
      extraLarge: generateDoctorBatch('EXTRA_LARGE'),
      invalid: generateInvalidDoctorData(),
      cardiology: generateDoctorBatch('MEDIUM', { specialties: ['Cardiology'] }),
      dermatology: generateDoctorBatch('MEDIUM', { specialties: ['Dermatology'] }),
      pediatrics: generateDoctorBatch('MEDIUM', { specialties: ['Pediatrics'] }),
      verified: generateDoctorBatch('LARGE', { verifiedOnly: true })
    },
    
    // Clinic profiles
    clinics: Array.from({ length: TEST_DATA_SIZES.LARGE }, () => generateClinicProfile()),
    
    // Test queries
    searchQueries: generateSearchTestQueries(),
    
    // Performance scenarios
    performanceScenarios: generatePerformanceScenarios(),
    
    // Accessibility scenarios
    accessibilityScenarios: generateAccessibilityScenarios(),
    
    // Metadata
    generatedAt: new Date().toISOString(),
    version: '1.0.0',
    totalRecords: {
      doctors: Object.values(data?.doctors || {}).reduce((sum, doctors) => sum + doctors.length, 0),
      clinics: TEST_DATA_SIZES.LARGE
    }
  }
  
  console.log(`✅ Test data generated successfully`)
  console.log(`   Doctors: ${data.totalRecords.doctors}`)
  console.log(`   Clinics: ${data.totalRecords.clinics}`)
  console.log(`   Search Queries: ${data.searchQueries.length}`)
  console.log(`   Performance Scenarios: ${Object.keys(data.performanceScenarios).length}`)
  
  return data
}

// Export for use in other files
export default {
  generateDoctorProfile,
  generateClinicProfile,
  generateDoctorBatch,
  generateInvalidDoctorData,
  generateSearchTestQueries,
  generatePerformanceScenarios,
  generateAccessibilityScenarios,
  generateTestData
}