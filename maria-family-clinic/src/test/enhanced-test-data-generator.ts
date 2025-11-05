/**
 * Enhanced Test Data Generator for Contact System
 * Sub-Phase 9.10 - Testing, Quality Assurance & Performance Optimization
 */

import type { 
  ContactForm, 
  Enquiry, 
  ContactCategory, 
  User, 
  Clinic, 
  Doctor, 
  ContactResponse,
  ContactAssignment,
  ContactHistory
} from '@/lib/types/contact-system'

// Singapore-specific test data
const SINGAPORE_PHONE_NUMBERS = [
  '+65-9123-4567', '+65-9876-5432', '+65-8234-5678', '+65-9456-7890',
  '+65-8765-4321', '+65-9234-5678', '+65-8901-2345', '+65-9567-8901',
  '+65-8123-4567', '+65-9345-6789', '+65-8678-9012', '+65-9789-0123',
]

const SINGAPORE_EMAILS = [
  'user1@gmail.com', 'user2@yahoo.com', 'user3@hotmail.com', 'user4@outlook.com',
  'patient1@email.com', 'visitor2@domain.com', 'customer3@service.com', 'client4@business.com',
  'test1@clinic.com.sg', 'demo2@healthcare.sg', 'sample3@medical.sg', 'example4@hospital.sg',
]

const SINGAPORE_ADDRESSES = [
  '1 Orchard Road, Singapore 238859',
  '123 Main Street, Singapore 188734',
  '456 Beach Road, Singapore 199592',
  '789 River Valley Road, Singapore 179024',
  '321 North Bridge Road, Singapore 188744',
  '654 Marina Bay, Singapore 018989',
  '987 Bugis Street, Singapore 188508',
  '147 Jurong East, Singapore 609600',
  '258 Tampines Central, Singapore 529544',
  '369 Woodlands Square, Singapore 737749',
]

const SINGAPORE_NAMES = [
  'Ahmad bin Abdullah', 'Lim Wei Ming', 'Chen Li Hua', 'Raj Kumar',
  'Sarah Tan', 'Mohammad Farid', 'Lin Mei Lin', 'Priya Sharma',
  'David Wong', 'Fatimah Zahra', 'Zhang Wei', 'Suresh Patel',
  'Michelle Lim', 'Hassan Ali', 'Li Na', 'Vikram Singh',
  'Jessica Ng', 'Yusof bin Hassan', 'Wang Xue', 'Arjun Kumar',
]

const CATEGORIES = ['general', 'appointment', 'healthier_sg', 'urgent', 'technical_support'] as const
const STATUSES = ['NEW', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'PENDING_RESOLUTION', 'RESOLVED', 'CLOSED', 'ESCALATED'] as const
const PRIORITIES = ['LOW', 'NORMAL', 'HIGH', 'URGENT', 'STANDARD'] as const

interface ContactFormOptions {
  category?: typeof CATEGORIES[number]
  userId?: string
  clinicId?: string
  doctorId?: string
  includeMedicalFields?: boolean
  includeFileUploads?: boolean
  status?: any
  referenceNumber?: string
  createdAt?: Date
}

interface EnquiryOptions {
  categoryId?: string
  userId?: string
  doctorId?: string
  clinicId?: string
  status?: any
  assignedTo?: string
  priority?: any
  referenceNumber?: string
  createdAt?: Date
}

interface BulkTestDataOptions {
  count: number
  categories?: string[]
  includeMedicalFields?: boolean
  includeFileUploads?: boolean
  userId?: string
  clinicId?: string
  doctorId?: string
  dateRange?: { start: Date; end: Date }
}

export function generateTestContactForm(options: ContactFormOptions = {}): ContactForm {
  const {
    category = 'general',
    userId = `user-${Math.random().toString(36).substr(2, 9)}`,
    clinicId,
    doctorId,
    includeMedicalFields = false,
    includeFileUploads = false,
    status = 'NEW',
    referenceNumber = `CF${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')}`,
    createdAt = new Date(),
  } = options

  const baseForm: ContactForm = {
    id: `form-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    referenceNumber,
    name: SINGAPORE_NAMES[Math.floor(Math.random() * SINGAPORE_NAMES.length)],
    email: SINGAPORE_EMAILS[Math.floor(Math.random() * SINGAPORE_EMAILS.length)],
    phone: SINGAPORE_PHONE_NUMBERS[Math.floor(Math.random() * SINGAPORE_PHONE_NUMBERS.length)],
    category: category as any,
    subject: generateSubjectForCategory(category),
    message: generateMessageForCategory(category),
    address: category === 'appointment' || category === 'urgent' ? SINGAPORE_ADDRESSES[Math.floor(Math.random() * SINGAPORE_ADDRESSES.length)] : undefined,
    preferredLanguage: Math.random() > 0.7 ? 'Chinese' : 'English',
    status: status as any,
    userId,
    clinicId,
    doctorId,
    createdAt,
    updatedAt: createdAt,
  }

  // Add category-specific fields
  if (category === 'healthier_sg' || includeMedicalFields) {
    baseForm.medicalInfo = generateMedicalInfo()
    baseForm.consentForDataProcessing = true
    baseForm.consentForMedicalDataProcessing = true
    baseForm.requiresMedicalVerification = true
  }

  if (category === 'urgent') {
    baseForm.urgencyLevel = 'URGENT' as any
    baseForm.emergencyContact = SINGAPORE_PHONE_NUMBERS[Math.floor(Math.random() * SINGAPORE_PHONE_NUMBERS.length)]
    baseForm.requiresImmediateResponse = true
  }

  if (category === 'appointment') {
    baseForm.preferredDate = new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000) // Next 30 days
    baseForm.preferredTime = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'][Math.floor(Math.random() * 6)]
    baseForm.appointmentType = ['General Consultation', 'Follow-up', 'Health Screening', 'Vaccination'][Math.floor(Math.random() * 4)]
  }

  if (category === 'technical_support') {
    baseForm.issueCategory = ['Website', 'Mobile App', 'Account Access', 'Payment', 'Other'][Math.floor(Math.random() * 5)]
    baseForm.browserType = ['Chrome', 'Firefox', 'Safari', 'Edge'][Math.floor(Math.random() * 4)]
    baseForm.deviceType = ['Desktop', 'Mobile', 'Tablet'][Math.floor(Math.random() * 3)]
    baseForm.stepsToReproduce = '1. Navigate to website 2. Click on form 3. Error occurs'
  }

  // Add file uploads
  if (includeFileUploads) {
    baseForm.uploadedFiles = generateUploadedFiles(category)
  }

  // Add privacy compliance
  baseForm.privacyConsentGiven = true
  baseForm.marketingConsent = Math.random() > 0.5
  baseForm.dataRetentionConsent = true

  return baseForm
}

export function generateTestEnquiry(options: EnquiryOptions = {}): Enquiry {
  const {
    categoryId = 'category-general',
    userId = `user-${Math.random().toString(36).substr(2, 9)}`,
    doctorId,
    clinicId,
    status = 'NEW',
    assignedTo,
    priority = 'NORMAL',
    referenceNumber = `ENQ${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')}`,
    createdAt = new Date(),
  } = options

  return {
    id: `enquiry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    referenceNumber,
    contactFormId: `form-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    categoryId,
    userId,
    doctorId,
    clinicId,
    subject: generateSubjectForCategory('general'),
    description: generateMessageForCategory('general'),
    status: status as any,
    priority: priority as any,
    assignedTo,
    responseTimeHours: status === 'RESOLVED' ? Math.random() * 48 : null,
    resolutionTimeHours: status === 'RESOLVED' ? Math.random() * 120 : null,
    firstResponseAt: status !== 'NEW' ? new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000) : null,
    resolvedAt: status === 'RESOLVED' ? new Date(Date.now() - Math.random() * 48 * 60 * 60 * 1000) : null,
    closedAt: status === 'CLOSED' ? new Date(Date.now() - Math.random() * 72 * 60 * 60 * 1000) : null,
    createdAt,
    updatedAt: createdAt,
  }
}

export function generateTestUser(options: Partial<User> = {}): User {
  return {
    id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: SINGAPORE_NAMES[Math.floor(Math.random() * SINGAPORE_NAMES.length)],
    email: SINGAPORE_EMAILS[Math.floor(Math.random() * SINGAPORE_EMAILS.length)],
    phone: SINGAPORE_PHONE_NUMBERS[Math.floor(Math.random() * SINGAPORE_PHONE_NUMBERS.length)],
    nric: generateNRIC(),
    dateOfBirth: new Date(1970 + Math.floor(Math.random() * 50), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
    gender: Math.random() > 0.5 ? 'MALE' : 'FEMALE',
    address: SINGAPORE_ADDRESSES[Math.floor(Math.random() * SINGAPORE_ADDRESSES.length)],
    preferredLanguage: Math.random() > 0.7 ? 'Chinese' : 'English',
    isActive: true,
    emailVerified: Math.random() > 0.2,
    phoneVerified: Math.random() > 0.3,
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000), // Within last year
    updatedAt: new Date(),
    ...options,
  }
}

export function generateTestClinic(options: Partial<Clinic> = {}): Clinic {
  return {
    id: `clinic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: `${['Family', 'Medical', 'Health', 'Care', 'Wellness'][Math.floor(Math.random() * 5)]} Clinic ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
    address: SINGAPORE_ADDRESSES[Math.floor(Math.random() * SINGAPORE_ADDRESSES.length)],
    phone: SINGAPORE_PHONE_NUMBERS[Math.floor(Math.random() * SINGAPORE_PHONE_NUMBERS.length)],
    email: `clinic${Math.floor(Math.random() * 100)}@healthcare.sg`,
    website: `https://clinic${Math.floor(Math.random() * 100)}.com.sg`,
    isActive: true,
    openingHours: {
      monday: { open: '08:00', close: '18:00' },
      tuesday: { open: '08:00', close: '18:00' },
      wednesday: { open: '08:00', close: '18:00' },
      thursday: { open: '08:00', close: '18:00' },
      friday: { open: '08:00', close: '18:00' },
      saturday: { open: '09:00', close: '15:00' },
      sunday: { open: '10:00', close: '14:00' },
    },
    services: generateClinicServices(),
    languages: ['English', 'Chinese', 'Malay', 'Tamil'],
    createdAt: new Date(Date.now() - Math.random() * 2 * 365 * 24 * 60 * 60 * 1000), // Within 2 years
    ...options,
  }
}

export function generateTestDoctor(options: Partial<Doctor> = {}): Doctor {
  const specialties = [
    'General Practice', 'Family Medicine', 'Internal Medicine', 'Pediatrics',
    'Cardiology', 'Dermatology', 'Orthopedics', 'Neurology', 'Psychiatry',
    'Emergency Medicine', 'Obstetrics & Gynecology', 'Ophthalmology',
  ]

  const qualifications = [
    'MBBS', 'MD', 'MMed', 'FRCS', 'MRCP', 'MRCPsych', 'MRCOG', 'FRCOG',
    'FAMS', 'MRCGP', 'DFM', 'DCH', 'DPM',
  ]

  return {
    id: `doctor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: `Dr. ${SINGAPORE_NAMES[Math.floor(Math.random() * SINGAPORE_NAMES.length)]}`,
    clinicId: options.clinicId || `clinic-${Math.random().toString(36).substr(2, 9)}`,
    specialties: [specialties[Math.floor(Math.random() * specialties.length)]],
    qualifications: qualifications.slice(0, Math.floor(Math.random() * 3) + 1),
    experience: Math.floor(Math.random() * 30) + 1, // 1-30 years
    languages: ['English', Math.random() > 0.5 ? 'Chinese' : 'Malay', Math.random() > 0.7 ? 'Tamil' : undefined].filter(Boolean),
    isActive: true,
    consultationFee: Math.floor(Math.random() * 100) + 50, // $50-150
    availability: generateDoctorAvailability(),
    createdAt: new Date(Date.now() - Math.random() * 5 * 365 * 24 * 60 * 60 * 1000), // Within 5 years
    ...options,
  }
}

export function generateTestContactCategory(options: Partial<ContactCategory> = {}): ContactCategory {
  const categories = [
    {
      name: 'general',
      displayName: 'General Enquiry',
      priority: 'STANDARD',
      department: 'GENERAL',
      responseSLAHours: 24,
      resolutionSLADays: 7,
      autoAssignment: true,
    },
    {
      name: 'appointment',
      displayName: 'Appointment Related',
      priority: 'HIGH',
      department: 'APPOINTMENTS',
      responseSLAHours: 4,
      resolutionSLADays: 2,
      autoAssignment: true,
    },
    {
      name: 'healthier_sg',
      displayName: 'Healthier SG Program',
      priority: 'HIGH',
      department: 'HEALTHIER_SG',
      responseSLAHours: 8,
      resolutionSLADays: 3,
      autoAssignment: true,
      medicalFields: true,
      hipaaCompliant: true,
    },
    {
      name: 'urgent',
      displayName: 'Urgent Care',
      priority: 'URGENT',
      department: 'EMERGENCY',
      responseSLAHours: 1,
      resolutionSLADays: 1,
      autoAssignment: true,
      requiresVerification: true,
    },
    {
      name: 'technical_support',
      displayName: 'Technical Support',
      priority: 'NORMAL',
      department: 'TECHNICAL_SUPPORT',
      responseSLAHours: 8,
      resolutionSLADays: 5,
      autoAssignment: true,
    },
  ]

  const category = categories[Math.floor(Math.random() * categories.length)]

  return {
    id: `category-${category.name}`,
    isActive: true,
    createdAt: new Date(),
    ...category,
    ...options,
  }
}

export function generateBulkTestData(count: number, options: BulkTestDataOptions): ContactForm[] {
  const {
    categories = CATEGORIES as string[],
    includeMedicalFields = false,
    includeFileUploads = false,
    userId,
    clinicId,
    doctorId,
    dateRange,
  } = options

  const forms: ContactForm[] = []

  for (let i = 0; i < count; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)]
    const createdAt = dateRange 
      ? new Date(dateRange.start.getTime() + Math.random() * (dateRange.end.getTime() - dateRange.start.getTime()))
      : new Date()

    const form = generateTestContactForm({
      category: category as any,
      includeMedicalFields,
      includeFileUploads,
      userId: userId || `user-${i}`,
      clinicId,
      doctorId,
      createdAt,
    })

    forms.push(form)
  }

  return forms
}

export function generatePerformanceTestData(): {
  forms: ContactForm[]
  enquiries: Enquiry[]
  users: User[]
  clinics: Clinic[]
  doctors: Doctor[]
  categories: ContactCategory[]
} {
  return {
    forms: generateBulkTestData(1000, {
      count: 1000,
      categories: CATEGORIES as string[],
      includeMedicalFields: true,
      includeFileUploads: true,
      dateRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        end: new Date(),
      },
    }),
    enquiries: Array.from({ length: 500 }, (_, i) => generateTestEnquiry({
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    })),
    users: Array.from({ length: 200 }, () => generateTestUser()),
    clinics: Array.from({ length: 10 }, () => generateTestClinic()),
    doctors: Array.from({ length: 25 }, () => generateTestDoctor()),
    categories: CATEGORIES.map(category => generateTestContactCategory({ name: category })),
  }
}

// Helper functions
function generateSubjectForCategory(category: string): string {
  const subjects = {
    general: [
      'General enquiry about services',
      'Questions about clinic operations',
      'Information about visiting hours',
      'Parking and accessibility information',
    ],
    appointment: [
      'Booking an appointment',
      'Rescheduling appointment',
      'Cancellation of appointment',
      'Questions about appointment process',
    ],
    healthier_sg: [
      'Healthier SG program enrollment',
      'Program eligibility questions',
      'Benefits and coverage information',
      'Program requirements and process',
    ],
    urgent: [
      'Medical emergency',
      'Urgent health concern',
      'Immediate medical attention needed',
      'After-hours urgent care',
    ],
    technical_support: [
      'Website login issues',
      'Mobile app problems',
      'Payment processing errors',
      'Technical difficulties accessing services',
    ],
  }

  const categorySubjects = subjects[category as keyof typeof subjects] || subjects.general
  return categorySubjects[Math.floor(Math.random() * categorySubjects.length)]
}

function generateMessageForCategory(category: string): string {
  const messages = {
    general: [
      'I would like to know more about your services and operating hours.',
      'Can you provide information about your clinic location and parking?',
      'I have questions about your medical services and treatment options.',
      'Please let me know about your doctor availability and consultation fees.',
    ],
    appointment: [
      'I would like to book an appointment for a general consultation.',
      'I need to reschedule my upcoming appointment to a different time.',
      'I need to cancel my appointment due to unexpected circumstances.',
      'What is the process for booking an appointment with a specialist?',
    ],
    healthier_sg: [
      'I am interested in joining the Healthier SG program. Please provide more information.',
      'I want to know if I am eligible for the Healthier SG program.',
      'What are the benefits and coverage provided under Healthier SG?',
      'I need help with the Healthier SG enrollment process.',
    ],
    urgent: [
      'I am experiencing severe chest pain and need immediate medical attention.',
      'I have a medical emergency and require urgent care.',
      'I need to see a doctor urgently for a serious health concern.',
      'This is an urgent medical matter that requires immediate attention.',
    ],
    technical_support: [
      'I am unable to log in to the website. Getting an authentication error.',
      'The mobile app keeps crashing when I try to book an appointment.',
      'I am having trouble processing payment for my appointment.',
      'The website is showing error messages and I cannot access my account.',
    ],
  }

  const categoryMessages = messages[category as keyof typeof messages] || messages.general
  return categoryMessages[Math.floor(Math.random() * categoryMessages.length)]
}

function generateMedicalInfo(): string {
  const conditions = [
    'Type 2 Diabetes',
    'High Blood Pressure',
    'High Cholesterol',
    'Asthma',
    'Arthritis',
    'Migraine',
    'Depression',
    'Anxiety',
    'Allergies to penicillin',
    'Previous surgery: Appendectomy in 2020',
  ]

  const medications = [
    'Metformin 500mg twice daily',
    'Lisinopril 10mg once daily',
    'Atorvastatin 20mg once daily',
    'Salbutamol inhaler as needed',
    'Paracetamol 500mg as needed',
  ]

  const allergies = [
    'Penicillin',
    'Shellfish',
    'Peanuts',
    'Latex',
    'No known drug allergies',
  ]

  return `Conditions: ${conditions.slice(0, Math.floor(Math.random() * 3) + 1).join(', ')}\n` +
         `Current medications: ${medications.slice(0, Math.floor(Math.random() * 2) + 1).join(', ')}\n` +
         `Allergies: ${allergies[Math.floor(Math.random() * allergies.length)]}`
}

function generateUploadedFiles(category: string): any[] {
  const fileTypes = {
    general: ['document', 'image'],
    appointment: ['document', 'image', 'insurance'],
    healthier_sg: ['document', 'medical_record', 'laboratory'],
    urgent: ['medical_record', 'laboratory', 'image'],
    technical_support: ['screenshot', 'document'],
  }

  const fileType = fileTypes[category as keyof typeof fileTypes]?.[Math.floor(Math.random() * fileTypes.general.length)] || 'document'
  const extensions = {
    document: ['.pdf', '.doc', '.docx'],
    image: ['.jpg', '.png', '.jpeg'],
    medical_record: ['.pdf', '.doc'],
    insurance: ['.pdf', '.jpg'],
    laboratory: ['.pdf', '.jpg', '.png'],
    screenshot: ['.png', '.jpg'],
  }

  const ext = extensions[fileType][Math.floor(Math.random() * extensions[fileType].length)]
  const fileName = `test-file${ext}`

  return [{
    id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    fileName,
    originalName: fileName,
    fileType,
    fileSize: Math.floor(Math.random() * 1024 * 1024) + 1024, // 1KB to 1MB
    uploadUrl: `/uploads/${fileName}`,
    uploadedAt: new Date(),
    category: fileType,
  }]
}

function generateNRIC(): string {
  const letters = 'STFG'
  const firstLetter = letters[Math.floor(Math.random() * letters.length)]
  const digits = String(Math.floor(Math.random() * 100000000)).padStart(8, '0')
  const lastChar = String.fromCharCode(65 + Math.floor(Math.random() * 26))
  return `${firstLetter}${digits}${lastChar}`
}

function generateClinicServices(): any[] {
  const services = [
    'General Consultation',
    'Health Screening',
    'Vaccination',
    'Chronic Disease Management',
    'Mental Health Support',
    'Women's Health',
    'Men\'s Health',
    'Pediatric Care',
    'Geriatric Care',
    'Emergency Care',
  ]

  return services.slice(0, Math.floor(Math.random() * 6) + 3).map((name, index) => ({
    id: `service-${index}`,
    name,
    description: `${name} services provided`,
    isAvailable: true,
  }))
}

function generateDoctorAvailability(): any[] {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const availability = []

  for (const day of days) {
    if (Math.random() > 0.3) { // 70% chance doctor is available on this day
      availability.push({
        dayOfWeek: day,
        startTime: '09:00',
        endTime: Math.random() > 0.5 ? '17:00' : '15:00',
        isAvailable: true,
      })
    }
  }

  return availability
}

export function generateSecurityTestData() {
  return {
    maliciousInputs: [
      '<script>alert("xss")</script>',
      '<img src="x" onerror="alert(1)">',
      'javascript:alert(1)',
      '"; DROP TABLE users; --',
      '${7*7}',
      '{{7*7}}',
      '<svg onload="alert(1)">',
    ],
    sqlInjectionAttempts: [
      "' OR '1'='1",
      "'; DROP TABLE contact_forms; --",
      "' UNION SELECT * FROM users --",
      "admin'--",
      "' OR 1=1#",
    ],
    largeInputs: [
      'A'.repeat(10000),
      'A'.repeat(100000),
      'A'.repeat(1000000),
    ],
    specialCharacters: [
      '!@#$%^&*()_+-=[]{}|;:,.<>?',
      '测试中文字符',
      '🚀🌟💯🔥',
      'Привет мир',
      'مرحبا بالعالم',
    ],
  }
}

export function generateAccessibilityTestData() {
  return {
    colorContrastIssues: [
      { background: '#FFFFFF', foreground: '#F0F0F0', ratio: 1.0 }, // Poor contrast
      { background: '#000000', foreground: '#404040', ratio: 2.1 }, // Poor contrast
      { background: '#FFFFFF', foreground: '#000000', ratio: 21.0 }, // Good contrast
      { background: '#000000', foreground: '#FFFFFF', ratio: 21.0 }, // Good contrast
    ],
    screenReaderContent: [
      { element: 'Form', expectedText: 'Contact form with required fields' },
      { element: 'Button', expectedText: 'Submit form button' },
      { element: 'Error', expectedText: 'Error message' },
      { element: 'Success', expectedText: 'Form submitted successfully' },
    ],
    keyboardNavigation: {
      tabOrder: [
        { element: 'Name input', focusable: true, order: 1 },
        { element: 'Email input', focusable: true, order: 2 },
        { element: 'Phone input', focusable: true, order: 3 },
        { element: 'Category select', focusable: true, order: 4 },
        { element: 'Submit button', focusable: true, order: 5 },
      ],
      keyboardShortcuts: [
        { key: 'Tab', description: 'Navigate to next field' },
        { key: 'Shift+Tab', description: 'Navigate to previous field' },
        { key: 'Enter', description: 'Submit form' },
        { key: 'Escape', description: 'Close modal' },
      ],
    },
  }
}