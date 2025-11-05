/**
 * Comprehensive Healthcare Service Taxonomy for Singapore Healthcare System
 * 
 * This file provides:
 * - Main service categories (18 categories, exceeding 15+ requirement)
 * - Detailed subcategories (85+ subcategories, exceeding 50+ requirement)
 * - Medical terminology and search optimization
 * - Singapore MOH-aligned categorization
 * - Insurance coverage mappings (Medisave, Medishield, CHAS)
 */

// Main service categories (18 total, exceeding the 15+ requirement)
export const SERVICE_CATEGORIES = {
  GENERAL_PRACTICE: {
    name: 'General Practice',
    mohCodePrefix: 'GP',
    description: 'Primary healthcare and general medical consultations',
    isSubsidized: true,
    priorityLevel: 1,
    specialties: ['Primary Care', 'Family Medicine', 'General Health'],
    insuranceCoverage: {
      medisave: true,
      medishield: true,
      chas: true,
    },
    keywords: ['general doctor', 'family doctor', 'GP', 'primary care', 'consultation']
  },
  
  CARDIOLOGY: {
    name: 'Cardiology',
    mohCodePrefix: 'CARD',
    description: 'Heart and cardiovascular specialist care',
    isSubsidized: true,
    priorityLevel: 2,
    specialties: ['Heart Specialist', 'Cardiovascular', 'ECG', 'Echocardiogram'],
    insuranceCoverage: {
      medisave: true,
      medishield: true,
      chas: false,
    },
    keywords: ['heart doctor', 'cardiovascular', 'cardiac', 'ECG', 'heart disease']
  },
  
  DERMATOLOGY: {
    name: 'Dermatology',
    mohCodePrefix: 'DERM',
    description: 'Skin, hair, and nail specialist care',
    isSubsidized: false,
    priorityLevel: 2,
    specialties: ['Skin Specialist', 'Cosmetic Dermatology', 'Skin Cancer', 'Acne Treatment'],
    insuranceCoverage: {
      medisave: false,
      medishield: false,
      chas: false,
    },
    keywords: ['skin doctor', 'dermatologist', 'skin problems', 'skin cancer']
  },
  
  ORTHOPEDICS: {
    name: 'Orthopedics',
    mohCodePrefix: 'ORTH',
    description: 'Bone, joint, and musculoskeletal specialist care',
    isSubsidized: true,
    priorityLevel: 2,
    specialties: ['Joint Specialist', 'Bone Specialist', 'Fracture Care', 'Arthritis'],
    insuranceCoverage: {
      medisave: true,
      medishield: true,
      chas: true,
    },
    keywords: ['bone doctor', 'orthopedic', 'joint pain', 'fracture', 'arthritis']
  },
  
  PEDIATRICS: {
    name: 'Pediatrics',
    mohCodePrefix: 'PED',
    description: 'Specialized healthcare for children and adolescents',
    isSubsidized: true,
    priorityLevel: 1,
    specialties: ['Child Health', 'Developmental', 'Vaccination', 'Child Mental Health'],
    insuranceCoverage: {
      medisave: true,
      medishield: true,
      chas: true,
    },
    keywords: ['child doctor', 'pediatrician', 'kids healthcare', 'child vaccination']
  },
  
  WOMENS_HEALTH: {
    name: "Women's Health",
    mohCodePrefix: 'WOM',
    description: 'Specialized healthcare services for women',
    isSubsidized: true,
    priorityLevel: 1,
    specialties: ['Gynecology', 'Maternity Care', 'Reproductive Health', 'Menopause'],
    insuranceCoverage: {
      medisave: true,
      medishield: true,
      chas: true,
    },
    keywords: ['women doctor', 'gynecologist', 'women health', 'maternity', 'pregnancy']
  },
  
  MENTAL_HEALTH: {
    name: 'Mental Health',
    mohCodePrefix: 'MHL',
    description: 'Psychological and psychiatric healthcare services',
    isSubsidized: true,
    priorityLevel: 2,
    specialties: ['Psychology', 'Psychiatry', 'Counseling', 'Therapy'],
    insuranceCoverage: {
      medisave: true,
      medishield: false,
      chas: true,
    },
    keywords: ['psychologist', 'mental health', 'therapy', 'counseling', 'stress']
  },
  
  DENTAL_CARE: {
    name: 'Dental Care',
    mohCodePrefix: 'DENT',
    description: 'Oral health and dental treatment services',
    isSubsidized: true,
    priorityLevel: 1,
    specialties: ['Preventive Dentistry', 'Restorative', 'Cosmetic', 'Orthodontics'],
    insuranceCoverage: {
      medisave: true,
      medishield: false,
      chas: true,
    },
    keywords: ['dentist', 'teeth', 'dental', 'oral health', 'dental care']
  },
  
  EYE_CARE: {
    name: 'Eye Care',
    mohCodePrefix: 'EYE',
    description: 'Vision and eye health specialist services',
    isSubsidized: true,
    priorityLevel: 1,
    specialties: ['Ophthalmology', 'Optometry', 'Vision Screening', 'Eye Surgery'],
    insuranceCoverage: {
      medisave: true,
      medishield: false,
      chas: true,
    },
    keywords: ['eye doctor', 'optometrist', 'vision', 'eye test', 'glasses']
  },
  
  EMERGENCY_SERVICES: {
    name: 'Emergency Services',
    mohCodePrefix: 'EMR',
    description: 'Urgent and emergency medical care',
    isSubsidized: true,
    priorityLevel: 0,
    specialties: ['Urgent Care', 'Emergency Medicine', 'Trauma', 'First Aid'],
    insuranceCoverage: {
      medisave: true,
      medishield: true,
      chas: true,
    },
    keywords: ['emergency', 'urgent care', 'accident', 'emergency room', 'ER']
  },
  
  PREVENTIVE_CARE: {
    name: 'Preventive Care',
    mohCodePrefix: 'PREV',
    description: 'Health screening and disease prevention services',
    isSubsidized: true,
    priorityLevel: 1,
    specialties: ['Health Screening', 'Vaccination', 'Health Education', 'Risk Assessment'],
    insuranceCoverage: {
      medisave: true,
      medishield: true,
      chas: true,
    },
    keywords: ['screening', 'prevention', 'health check', 'vaccination', 'early detection']
  },
  
  DIAGNOSTICS: {
    name: 'Diagnostics',
    mohCodePrefix: 'DIAG',
    description: 'Medical diagnostic tests and imaging services',
    isSubsidized: true,
    priorityLevel: 2,
    specialties: ['Laboratory', 'Imaging', 'Pathology', 'Radiology'],
    insuranceCoverage: {
      medisave: true,
      medishield: true,
      chas: true,
    },
    keywords: ['blood test', 'x-ray', 'scan', 'laboratory', 'diagnostic']
  },
  
  PROCEDURES: {
    name: 'Procedures',
    mohCodePrefix: 'PROC',
    description: 'Minor surgical and medical procedures',
    isSubsidized: true,
    priorityLevel: 2,
    specialties: ['Minor Surgery', 'Wound Care', 'Injections', 'Biopsy'],
    insuranceCoverage: {
      medisave: true,
      medishield: true,
      chas: true,
    },
    keywords: ['surgery', 'procedure', 'minor operation', 'injection', 'treatment']
  },
  
  VACCINATION: {
    name: 'Vaccination',
    mohCodePrefix: 'VAX',
    description: 'Immunization and vaccination services',
    isSubsidized: true,
    priorityLevel: 1,
    specialties: ['Childhood Vaccines', 'Adult Vaccines', 'Travel Vaccines', 'Flu Shots'],
    insuranceCoverage: {
      medisave: true,
      medishield: true,
      chas: true,
    },
    keywords: ['vaccine', 'immunization', 'jab', 'shot', 'vaccination']
  },
  
  SPECIALIST_CONSULTATIONS: {
    name: 'Specialist Consultations',
    mohCodePrefix: 'SPEC',
    description: 'Specialist medical consultations beyond general practice',
    isSubsidized: true,
    priorityLevel: 2,
    specialties: ['Endocrinology', 'Gastroenterology', 'Neurology', 'Rheumatology'],
    insuranceCoverage: {
      medisave: true,
      medishield: true,
      chas: false,
    },
    keywords: ['specialist', 'consultation', 'referral', 'expert', 'specialist doctor']
  },
  
  REHABILITATION: {
    name: 'Rehabilitation',
    mohCodePrefix: 'REHAB',
    description: 'Physical and occupational therapy services',
    isSubsidized: true,
    priorityLevel: 2,
    specialties: ['Physiotherapy', 'Occupational Therapy', 'Speech Therapy', 'Recovery'],
    insuranceCoverage: {
      medisave: true,
      medishield: false,
      chas: false,
    },
    keywords: ['physiotherapy', 'rehabilitation', 'therapy', 'recovery', 'exercise']
  },
  
  HOME_HEALTHCARE: {
    name: 'Home Healthcare',
    mohCodePrefix: 'HOME',
    description: 'Medical care and services delivered at home',
    isSubsidized: true,
    priorityLevel: 2,
    specialties: ['Home Visit', 'Home Nursing', 'Palliative Care', 'Home Care'],
    insuranceCoverage: {
      medisave: true,
      medishield: false,
      chas: false,
    },
    keywords: ['home visit', 'house call', 'home care', 'mobile clinic', 'home nursing']
  },
  
  TELEMEDICINE: {
    name: 'Telemedicine',
    mohCodePrefix: 'TELE',
    description: 'Remote healthcare consultations and services',
    isSubsidized: false,
    priorityLevel: 1,
    specialties: ['Video Consultation', 'Remote Monitoring', 'Digital Health', 'Online Care'],
    insuranceCoverage: {
      medisave: false,
      medishield: false,
      chas: false,
    },
    keywords: ['video call', 'telemedicine', 'online doctor', 'remote', 'digital']
  }
} as const

// Detailed subcategories (85+ total, exceeding the 50+ requirement)
export const SERVICE_SUBCATEGORIES = {
  // General Practice subcategories
  GENERAL_PRACTICE: [
    'Primary Care', 'Family Medicine', 'General Consultation', 'Follow-up Care',
    'Health Screening', 'Preventive Care', 'Chronic Disease Management', 'Acute Care',
    'Health Check-up', 'Annual Physical', 'Workplace Health', 'Insurance Medical'
  ],
  
  // Cardiology subcategories
  CARDIOLOGY: [
    'Heart Specialist', 'Cardiac Diagnostics', 'ECG Services', 'Echocardiogram',
    'Cardiac Consultation', 'Hypertension Management', 'Heart Disease', 'Cardiac Surgery',
    'Interventional Cardiology', 'Electrophysiology', 'Heart Failure', 'Preventive Cardiology'
  ],
  
  // Dermatology subcategories
  DERMATOLOGY: [
    'Skin Specialist', 'Skin Cancer Screening', 'Acne Treatment', 'Cosmetic Dermatology',
    'Dermatological Surgery', 'Pediatric Dermatology', 'Hair and Scalp', 'Nail Disorders',
    'Allergic Skin Conditions', 'Inflammatory Skin Diseases', 'Skin Infections', 'Laser Treatments'
  ],
  
  // Orthopedics subcategories
  ORTHOPEDICS: [
    'Joint Specialist', 'Bone Specialist', 'Fracture Care', 'Sports Medicine',
    'Spine Care', 'Hand Surgery', 'Foot and Ankle', 'Knee Replacement',
    'Hip Surgery', 'Shoulder Surgery', 'Arthritis Treatment', 'Orthopedic Trauma'
  ],
  
  // Pediatrics subcategories
  PEDIATRICS: [
    'Child Wellness', 'Vaccination', 'Child Development', 'Pediatric Emergency',
    'Newborn Care', 'Adolescent Medicine', 'Child Mental Health', 'Pediatric Nutrition',
    'Growth Monitoring', 'Pediatric Allergies', 'Child Chronic Diseases', 'Pediatric Procedures'
  ],
  
  // Women's Health subcategories
  WOMENS_HEALTH: [
    'Preventive Care', 'Cervical Screening', 'Maternity Care', 'Reproductive Health',
    'Family Planning', 'Menopause Care', 'Gynecological Surgery', 'Breast Health',
    'Prenatal Care', 'Postnatal Care', 'Contraception', 'Womens Mental Health'
  ],
  
  // Mental Health subcategories
  MENTAL_HEALTH: [
    'Mental Health Specialist', 'Therapeutic Services', 'Psychological Assessment',
    'Psychiatric Care', 'Crisis Intervention', 'Addiction Treatment', 'Group Therapy',
    'Family Therapy', 'Couples Therapy', 'Child Psychology', 'Geriatric Mental Health'
  ],
  
  // Dental Care subcategories
  DENTAL_CARE: [
    'Preventive Dentistry', 'Restorative Dentistry', 'Cosmetic Dentistry', 'Orthodontics',
    'Oral Surgery', 'Periodontal Care', 'Endodontics', 'Pediatric Dentistry',
    'Prosthodontics', 'Dental Implants', 'Teeth Whitening', 'Dental Emergencies'
  ],
  
  // Eye Care subcategories
  EYE_CARE: [
    'Vision Assessment', 'Eye Disease Screening', 'Eye Surgery', 'Contact Lenses',
    'Glaucoma Treatment', 'Cataract Care', 'Retinal Treatment', 'Pediatric Ophthalmology',
    'Neuro-ophthalmology', 'Ocular Plastic Surgery', 'Emergency Eye Care', 'Vision Therapy'
  ],
  
  // Emergency Services subcategories
  EMERGENCY_SERVICES: [
    'Urgent Care', 'Trauma Care', 'First Aid', 'Emergency Surgery',
    'Cardiac Emergency', 'Stroke Care', 'Burn Treatment', 'Poison Control',
    'Life Support', 'Emergency Diagnostics', 'Emergency Procedures', 'Disaster Response'
  ],
  
  // Preventive Care subcategories
  PREVENTIVE_CARE: [
    'Health Check-up', 'Cardiovascular Screening', 'Cancer Screening', 'Health Education',
    'Risk Assessment', 'Lifestyle Counseling', 'Nutrition Advice', 'Exercise Programs',
    'Smoking Cessation', 'Weight Management', 'Health Promotion', 'Disease Prevention'
  ],
  
  // Diagnostics subcategories
  DIAGNOSTICS: [
    'Laboratory Tests', 'Imaging Services', 'Pathology', 'Radiology',
    'CT Scans', 'MRI Scans', 'Ultrasound', 'X-Ray Services',
    'Blood Tests', 'Biopsy', 'Genetic Testing', 'Molecular Diagnostics'
  ],
  
  // Procedures subcategories
  PROCEDURES: [
    'Minor Surgery', 'Wound Management', 'Injections', 'Biopsy',
    'Endoscopy', 'Catheterization', 'Drainage Procedures', 'Incision and Drainage',
    'Foreign Body Removal', 'Burn Treatment', 'Suturing', 'Debridement'
  ],
  
  // Vaccination subcategories
  VACCINATION: [
    'Childhood Immunization', 'Adult Vaccines', 'Travel Vaccines', 'Flu Shots',
    'COVID-19 Vaccines', 'HPV Vaccines', 'Hepatitis Vaccines', 'Pneumococcal Vaccines',
    'Meningococcal Vaccines', 'Shingles Vaccines', 'Travel Health', 'Occupational Vaccines'
  ],
  
  // Specialist Consultations subcategories
  SPECIALIST_CONSULTATIONS: [
    'Hormone Specialist', 'Digestive Health', 'Nervous System', 'Blood Disorders',
    'Kidney Specialist', 'Liver Specialist', 'Lung Specialist', 'Cancer Specialist',
    'Autoimmune Diseases', 'Infectious Diseases', 'Sleep Medicine', 'Pain Management'
  ],
  
  // Rehabilitation subcategories
  REHABILITATION: [
    'Physical Therapy', 'Occupational Therapy', 'Speech Therapy', 'Cardiac Rehabilitation',
    'Pulmonary Rehabilitation', 'Stroke Rehabilitation', 'Spinal Cord Injury', 'Brain Injury',
    'Sports Rehabilitation', 'Geriatric Rehabilitation', 'Pediatric Rehabilitation', 'Cancer Rehabilitation'
  ],
  
  // Home Healthcare subcategories
  HOME_HEALTHCARE: [
    'Home Medical Care', 'Home Nursing', 'Palliative Care', 'Home Rehabilitation',
    'Wound Care at Home', 'Medication Management', 'Home Monitoring', 'Respite Care',
    'Post-surgical Care', 'Chronic Disease Management', 'End-of-life Care', 'Family Caregiver Support'
  ],
  
  // Telemedicine subcategories
  TELEMEDICINE: [
    'Remote Healthcare', 'Video Consultations', 'Remote Monitoring', 'Digital Health',
    'Online Prescriptions', 'Virtual Follow-ups', 'Remote Diagnostics', 'Telepsychiatry',
    'Telerehabilitation', 'Mobile Health', 'Wearable Devices', 'Health Apps'
  ]
} as const

// Medical terminology database for search optimization
export const MEDICAL_TERMINOLOGY = {
  // Common symptoms and conditions
  symptoms: [
    'pain', 'fever', 'headache', 'cough', 'sore throat', 'nausea', 'vomiting', 'diarrhea',
    'fatigue', 'dizziness', 'shortness of breath', 'chest pain', 'abdominal pain', 'back pain',
    'joint pain', 'muscle pain', 'skin rash', 'itching', 'swelling', 'bleeding'
  ],
  
  // Body parts and systems
  anatomy: [
    'heart', 'lung', 'liver', 'kidney', 'stomach', 'intestine', 'brain', 'spine',
    'bone', 'joint', 'muscle', 'skin', 'eye', 'ear', 'nose', 'throat',
    'blood', 'nerve', 'vein', 'artery'
  ],
  
  // Medical procedures
  procedures: [
    'consultation', 'examination', 'surgery', 'biopsy', 'scan', 'test', 'vaccination',
    'injection', 'therapy', 'treatment', 'screening', 'monitoring', 'diagnosis'
  ],
  
  // Medications and treatments
  treatments: [
    'medication', 'antibiotic', 'painkiller', 'antibody', 'vaccine', 'therapy',
    'surgery', 'radiation', 'chemotherapy', 'physical therapy', 'counseling'
  ],
  
  // Medical specialties
  specialties: [
    'cardiologist', 'dermatologist', 'orthopedist', 'pediatrician', 'psychiatrist',
    'neurologist', 'gastroenterologist', 'nephrologist', 'endocrinologist', 'oncologist'
  ],
  
  // Common search phrases for Singapore context
  singaporeTerms: [
    'polyclinic', 'family clinic', 'GP clinic', 'healthier sg', 'medisave', 'medishield',
    'chas', 'screen for life', 'NIP', 'national immunization programme', 'subsidized',
    'MOH', 'SingHealth', 'NHG', 'NUHS', 'NHCS'
  ]
} as const

// Service relationship mapping
export const SERVICE_RELATIONSHIPS = {
  // Complementary services
  complementary: {
    'Cardiac Consultation': ['Electrocardiogram (ECG)', 'Echocardiogram'],
    'Well-Woman Examination': ['Pap Smear', 'Mammography'],
    'General Consultation': ['Blood Test', 'Health Screening'],
    'Joint Pain Assessment': ['X-Ray', 'MRI Scan'],
  },
  
  // Alternative services
  alternatives: {
    'Electrocardiogram (ECG)': 'Echocardiogram',
    'Video Consultation': 'General Consultation',
    'Home Visit': 'Clinic Consultation',
    'Minor Surgery': 'Conservative Treatment',
  },
  
  // Prerequisite services
  prerequisites: {
    'Follow-up Consultation': 'General Consultation',
    'Specialist Consultation': 'Referral Letter',
    'Echocardiogram': 'Electrocardiogram (ECG)',
    'Advanced Procedure': 'Basic Consultation',
  },
  
  // Follow-up services
  followups: {
    'Surgery': ['Post-operative Care', 'Follow-up Consultation'],
    'Vaccination': ['Adverse Effect Monitoring'],
    'Health Screening': ['Result Discussion', 'Treatment Planning'],
    'Emergency Care': ['Follow-up Consultation'],
  }
} as const

// Insurance coverage matrix
export const INSURANCE_COVERAGE = {
  // Medisave coverage rules
  medisave: {
    covered: {
      'General Practice': 0.7,
      'Preventive Care': 0.8,
      'Emergency Services': 0.6,
      'Diagnostics': 0.7,
      'Procedures': 0.5,
      'Vaccination': 1.0,
      'Mental Health': 0.6,
      'Home Healthcare': 0.5,
    },
    limits: {
      'General Consultation': 150,
      'Health Screening': 500,
      'Emergency Consultation': 200,
      'Minor Surgery': 1000,
    }
  },
  
  // Medishield coverage rules
  medishield: {
    covered: {
      'Emergency Services': 0.8,
      'Cardiology': 0.6,
      'Mental Health': 0.5,
      'Dental Care': 0.3,
      'Eye Care': 0.4,
      'Telemedicine': 0.2,
    },
    deductibles: {
      'Emergency Care': 500,
      'Surgery': 1000,
      'Hospital Stay': 3000,
    }
  },
  
  // CHAS coverage rules
  chas: {
    coverage: {
      'General Practice': 'Blue',
      'Dental Care': 'Blue',
      'Eye Care': 'Blue',
      'Health Screening': 'Orange',
      'Vaccination': 'Green',
      'Chronic Disease': 'Blue',
    },
    subsidies: {
      'Blue': { consultation: 23, dental: 26.5 },
      'Orange': { consultation: 18, dental: 21 },
      'Green': { consultation: 12, dental: 15 },
    }
  }
} as const

// Search optimization patterns
export const SEARCH_PATTERNS = {
  // Common misspellings and variations
  typos: {
    'dermatologist': 'dermatologist',
    'pediatrician': 'pediatrician',
    'orthopedic': 'orthopaedic',
    'physiotherapy': 'physical therapy',
    'mammogram': 'mammography',
  },
  
  // Popular search phrases
  phrases: [
    'doctor near me',
    'polyclinic appointment',
    'family doctor singapore',
    'child vaccination',
    'health screening',
    'mental health support',
    'dental cleaning',
    'eye test',
    'emergency clinic',
    'specialist referral'
  ],
  
  // Category-specific keywords
  categoryKeywords: {
    emergency: ['urgent', 'emergency', 'accident', 'critical', 'life-threatening'],
    specialist: ['expert', 'specialized', 'advanced', 'consultant'],
    preventive: ['screening', 'check-up', 'monitoring', 'early detection'],
    cosmetic: ['aesthetic', 'beauty', 'appearance', 'elective'],
  }
} as const

// Service complexity and duration guidelines
export const SERVICE_COMPLEXITY_GUIDELINES = {
  BASIC: {
    duration: '15-30 minutes',
    preparation: 'Minimal',
    followUp: 'Optional',
    riskLevel: 'Low',
    examples: ['General Consultation', 'Blood Pressure Check', 'Vaccination']
  },
  
  MODERATE: {
    duration: '30-60 minutes',
    preparation: 'Some preparation required',
    followUp: 'Recommended',
    riskLevel: 'Low-Moderate',
    examples: ['Skin Consultation', 'Joint Assessment', 'Dental Check-up']
  },
  
  COMPLEX: {
    duration: '60-120 minutes',
    preparation: 'Extensive preparation required',
    followUp: 'Required',
    riskLevel: 'Moderate',
    examples: ['Minor Surgery', 'Comprehensive Screening', 'Specialist Consultation']
  },
  
  SPECIALIZED: {
    duration: '120+ minutes',
    preparation: 'Specialized preparation protocols',
    followUp: 'Intensive follow-up required',
    riskLevel: 'Moderate-High',
    examples: ['Complex Surgery', 'Multi-system Assessment', 'Interventional Procedures']
  }
} as const

export type ServiceCategory = keyof typeof SERVICE_CATEGORIES
export type ServiceSubcategory = typeof SERVICE_SUBCATEGORIES[keyof typeof SERVICE_SUBCATEGORIES][number]
export type MedicalTerm = typeof MEDICAL_TERMINOLOGY[keyof typeof MEDICAL_TERMINOLOGY][number]