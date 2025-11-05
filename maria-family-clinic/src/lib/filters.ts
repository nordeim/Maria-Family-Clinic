import { FilterCategory } from '@/types/search'

export const FILTER_CATEGORIES: FilterCategory[] = [
  {
    id: 'medicalSpecialties',
    title: 'Medical Specialty',
    type: 'checkbox',
    searchable: true,
    icon: 'medical-specialty',
    description: 'Medical specialties and specializations',
    options: [
      { id: 'cardiology', label: 'Cardiology', value: 'cardiology' },
      { id: 'dermatology', label: 'Dermatology', value: 'dermatology' },
      { id: 'endocrinology', label: 'Endocrinology', value: 'endocrinology' },
      { id: 'gastroenterology', label: 'Gastroenterology', value: 'gastroenterology' },
      { id: 'neurology', label: 'Neurology', value: 'neurology' },
      { id: 'oncology', label: 'Oncology', value: 'oncology' },
      { id: 'orthopedics', label: 'Orthopedics', value: 'orthopedics' },
      { id: 'pediatrics', label: 'Pediatrics', value: 'pediatrics' },
      { id: 'psychiatry', label: 'Psychiatry', value: 'psychiatry' },
      { id: 'pulmonology', label: 'Pulmonology', value: 'pulmonology' },
      { id: 'rheumatology', label: 'Rheumatology', value: 'rheumatology' },
      { id: 'urology', label: 'Urology', value: 'urology' },
      { id: 'gynecology', label: 'Gynecology', value: 'gynecology' },
      { id: 'ophthalmology', label: 'Ophthalmology', value: 'ophthalmology' },
      { id: 'otolaryngology', label: 'Otolaryngology (ENT)', value: 'otolaryngology' },
      { id: 'general_surgery', label: 'General Surgery', value: 'general_surgery' },
      { id: 'internal_medicine', label: 'Internal Medicine', value: 'internal_medicine' },
      { id: 'nephrology', label: 'Nephrology', value: 'nephrology' },
      { id: 'hepatology', label: 'Hepatology', value: 'hepatology' },
      { id: 'infectious_diseases', label: 'Infectious Diseases', value: 'infectious_diseases' },
    ]
  },
  {
    id: 'services',
    title: 'Services',
    type: 'checkbox',
    searchable: true,
    icon: 'stethoscope',
    description: 'Medical services offered',
    options: [
      { id: 'general_practice', label: 'General Practice', value: 'general_practice' },
      { id: 'vaccinations', label: 'Vaccinations', value: 'vaccinations' },
      { id: 'chronic_disease_management', label: 'Chronic Disease Management', value: 'chronic_disease_management' },
      { id: 'health_screening', label: 'Health Screening', value: 'health_screening' },
      { id: 'minor_surgery', label: 'Minor Surgery', value: 'minor_surgery' },
      { id: 'physiotherapy', label: 'Physiotherapy', value: 'physiotherapy' },
      { id: 'dental_care', label: 'Dental Care', value: 'dental_care' },
      { id: 'eye_care', label: 'Eye Care', value: 'eye_care' },
      { id: 'occupational_health', label: 'Occupational Health', value: 'occupational_health' },
      { id: 'travel_medicine', label: 'Travel Medicine', value: 'travel_medicine' },
      { id: 'home_care', label: 'Home Care Services', value: 'home_care' },
      { id: 'telemedicine', label: 'Telemedicine', value: 'telemedicine' },
      { id: 'wellness_check', label: 'Health & Wellness Check', value: 'wellness_check' },
      { id: 'executive_health', label: 'Executive Health Screening', value: 'executive_health' },
      { id: 'corporate_health', label: 'Corporate Health Services', value: 'corporate_health' },
      { id: 'mental_health_counseling', label: 'Mental Health Counseling', value: 'mental_health_counseling' },
    ]
  },
  {
    id: 'serviceTypes',
    title: 'Service Type',
    type: 'checkbox',
    searchable: true,
    icon: 'service-type',
    description: 'Type of healthcare service',
    options: [
      { id: 'consultation', label: 'Consultation', value: 'consultation' },
      { id: 'procedure', label: 'Procedure', value: 'procedure' },
      { id: 'screening', label: 'Screening', value: 'screening' },
      { id: 'vaccination', label: 'Vaccination', value: 'vaccination' },
      { id: 'therapy', label: 'Therapy', value: 'therapy' },
      { id: 'diagnostic', label: 'Diagnostic', value: 'diagnostic' },
      { id: 'treatment', label: 'Treatment', value: 'treatment' },
      { id: 'surgery', label: 'Surgery', value: 'surgery' },
      { id: 'follow_up', label: 'Follow-up', value: 'follow_up' },
      { id: 'emergency_care', label: 'Emergency Care', value: 'emergency_care' },
      { id: 'preventive_care', label: 'Preventive Care', value: 'preventive_care' },
      { id: 'routine_check', label: 'Routine Check-up', value: 'routine_check' },
    ]
  },
  {
    id: 'urgency',
    title: 'Urgency',
    type: 'radio',
    searchable: false,
    icon: 'urgency',
    description: 'Required urgency level',
    options: [
      { id: 'emergency', label: 'Emergency (Immediate)', value: 'emergency' },
      { id: 'urgent', label: 'Urgent (Within 24 hours)', value: 'urgent' },
      { id: 'routine', label: 'Routine (Within a week)', value: 'routine' },
      { id: 'preventive', label: 'Preventive Care', value: 'preventive' },
    ]
  },
  {
    id: 'duration',
    title: 'Duration',
    type: 'checkbox',
    searchable: true,
    icon: 'clock',
    description: 'Expected appointment duration',
    options: [
      { id: '15min', label: '15 minutes', value: '15min' },
      { id: '30min', label: '30 minutes', value: '30min' },
      { id: '1hour', label: '1 hour', value: '1hour' },
      { id: 'multi_session', label: 'Multi-session', value: 'multi_session' },
      { id: 'half_day', label: 'Half day', value: 'half_day' },
      { id: 'full_day', label: 'Full day', value: 'full_day' },
    ]
  },
  {
    id: 'complexity',
    title: 'Complexity',
    type: 'radio',
    searchable: false,
    icon: 'complexity',
    description: 'Medical procedure complexity',
    options: [
      { id: 'simple', label: 'Simple', value: 'simple' },
      { id: 'moderate', label: 'Moderate', value: 'moderate' },
      { id: 'complex', label: 'Complex', value: 'complex' },
      { id: 'specialized', label: 'Specialized', value: 'specialized' },
    ]
  },
  {
    id: 'patientTypes',
    title: 'Patient Type',
    type: 'checkbox',
    searchable: true,
    icon: 'patient-type',
    description: 'Specialized patient care',
    options: [
      { id: 'adult', label: 'Adult Care', value: 'adult' },
      { id: 'pediatric', label: 'Pediatric Care', value: 'pediatric' },
      { id: 'geriatric', label: 'Geriatric Care', value: 'geriatric' },
      { id: 'womens_health', label: 'Women\'s Health', value: 'womens_health' },
      { id: 'mental_health', label: 'Mental Health', value: 'mental_health' },
      { id: 'chronic_care', label: 'Chronic Disease Care', value: 'chronic_care' },
      { id: 'elderly_care', label: 'Elderly Care', value: 'elderly_care' },
      { id: 'adolescent', label: 'Adolescent Care', value: 'adolescent' },
    ]
  },
  {
    id: 'languages',
    title: 'Languages Spoken',
    type: 'checkbox',
    searchable: true,
    icon: 'globe',
    description: 'Languages available for consultation',
    options: [
      { id: 'english', label: 'English', value: 'english' },
      { id: 'mandarin', label: 'Mandarin', value: 'mandarin' },
      { id: 'malay', label: 'Malay', value: 'malay' },
      { id: 'tamil', label: 'Tamil', value: 'tamil' },
      { id: 'cantonese', label: 'Cantonese', value: 'cantonese' },
      { id: 'hokkien', label: 'Hokkien', value: 'hokkien' },
      { id: 'teochew', label: 'Teochew', value: 'teochew' },
      { id: 'hainanese', label: 'Hainanese', value: 'hainanese' },
      { id: 'japanese', label: 'Japanese', value: 'japanese' },
      { id: 'korean', label: 'Korean', value: 'korean' },
      { id: 'thai', label: 'Thai', value: 'thai' },
      { id: 'vietnamese', label: 'Vietnamese', value: 'vietnamese' },
      { id: 'tagalog', label: 'Tagalog', value: 'tagalog' },
      { id: 'hindi', label: 'Hindi', value: 'hindi' },
      { id: 'bengali', label: 'Bengali', value: 'bengali' },
      { id: 'punjabi', label: 'Punjabi', value: 'punjabi' },
    ]
  },
  {
    id: 'operatingHours',
    title: 'Operating Hours',
    type: 'checkbox',
    icon: 'clock',
    description: 'Available when you need them',
    options: [
      { id: 'open_now', label: 'Open Now', value: 'open_now' },
      { id: 'weekend', label: 'Open Weekends', value: 'weekend' },
      { id: 'late_night', label: 'Late Night (after 10 PM)', value: 'late_night' },
      { id: '24_hour', label: '24 Hours', value: '24_hour' },
      { id: 'sunday', label: 'Open on Sunday', value: 'sunday' },
      { id: 'holiday', label: 'Open on Public Holidays', value: 'holiday' },
    ]
  },
  {
    id: 'clinicTypes',
    title: 'Clinic Type',
    type: 'radio',
    icon: 'building',
    description: 'Type of healthcare facility',
    options: [
      { id: 'polyclinic', label: 'Polyclinic (MOH)', value: 'polyclinic' },
      { id: 'private', label: 'Private Clinic', value: 'private' },
      { id: 'hospital_linked', label: 'Hospital-Linked', value: 'hospital_linked' },
      { id: 'family_clinic', label: 'Family Clinic', value: 'family_clinic' },
      { id: 'specialist_clinic', label: 'Specialist Clinic', value: 'specialist_clinic' },
    ]
  },
  {
    id: 'accessibility',
    title: 'Accessibility Features',
    type: 'checkbox',
    icon: 'accessibility',
    description: 'Facilities for special needs',
    options: [
      { id: 'wheelchair_accessible', label: 'Wheelchair Access', value: 'wheelchair_accessible' },
      { id: 'hearing_loop', label: 'Hearing Loop System', value: 'hearing_loop' },
      { id: 'parking', label: 'Parking Available', value: 'parking' },
      { id: 'elevator', label: 'Elevator Access', value: 'elevator' },
      { id: 'wide_aisles', label: 'Wide Aisle Access', value: 'wide_aisles' },
    ]
  },
  {
    id: 'rating',
    title: 'Rating',
    type: 'radio',
    icon: 'star',
    description: 'Minimum clinic rating',
    options: [
      { id: 'all_ratings', label: 'All Ratings', value: 'all_ratings' },
      { id: '4_plus', label: '4+ Stars', value: '4_plus' },
      { id: '4_5_plus', label: '4.5+ Stars', value: '4_5_plus' },
      { id: '5_stars', label: '5 Stars Only', value: '5_stars' },
    ]
  },
  {
    id: 'insurance',
    title: 'Insurance Coverage',
    type: 'checkbox',
    icon: 'shield',
    description: 'Accepted payment methods and insurance',
    options: [
      { id: 'medisave', label: 'Medisave', value: 'medisave' },
      { id: 'medishield', label: 'Medishield', value: 'medishield' },
      { id: 'private_insurance', label: 'Private Insurance', value: 'private_insurance' },
      { id: 'cash_only', label: 'Cash Only', value: 'cash_only' },
      { id: 'medisave_private', label: 'Medisave + Private', value: 'medisave_private' },
      { id: 'corporate_insurance', label: 'Corporate Insurance', value: 'corporate_insurance' },
      { id: 'national_insurance', label: 'International Insurance', value: 'national_insurance' },
      { id: 'self_pay', label: 'Self Pay', value: 'self_pay' },
    ]
  },
  {
    id: 'languages',
    title: 'Languages Spoken',
    type: 'checkbox',
    searchable: true,
    icon: 'globe',
    description: 'Languages available for consultation',
    options: [
      { id: 'english', label: 'English', value: 'english' },
      { id: 'mandarin', label: 'Mandarin', value: 'mandarin' },
      { id: 'malay', label: 'Malay', value: 'malay' },
      { id: 'tamil', label: 'Tamil', value: 'tamil' },
      { id: 'cantonese', label: 'Cantonese', value: 'cantonese' },
      { id: 'hokkien', label: 'Hokkien', value: 'hokkien' },
      { id: 'teochew', label: 'Teochew', value: 'teochew' },
      { id: 'hainanese', label: 'Hainanese', value: 'hainanese' },
      { id: 'japanese', label: 'Japanese', value: 'japanese' },
      { id: 'korean', label: 'Korean', value: 'korean' },
      { id: 'thai', label: 'Thai', value: 'thai' },
      { id: 'vietnamese', label: 'Vietnamese', value: 'vietnamese' },
      { id: 'tagalog', label: 'Tagalog/Filipino', value: 'tagalog' },
      { id: 'hindi', label: 'Hindi', value: 'hindi' },
      { id: 'bengali', label: 'Bengali', value: 'bengali' },
      { id: 'punjabi', label: 'Punjabi', value: 'punjabi' },
      { id: 'gujarati', label: 'Gujarati', value: 'gujarati' },
      { id: 'urdu', label: 'Urdu', value: 'urdu' },
      { id: 'french', label: 'French', value: 'french' },
      { id: 'german', label: 'German', value: 'german' },
      { id: 'dutch', label: 'Dutch', value: 'dutch' },
      { id: 'italian', label: 'Italian', value: 'italian' },
      { id: 'spanish', label: 'Spanish', value: 'spanish' },
      { id: 'portuguese', label: 'Portuguese', value: 'portuguese' },
      { id: 'russian', label: 'Russian', value: 'russian' },
      { id: 'arabic', label: 'Arabic', value: 'arabic' },
      { id: 'indonesian', label: 'Indonesian', value: 'indonesian' },
      { id: 'burmese', label: 'Burmese', value: 'burmese' },
      { id: 'khmer', label: 'Khmer', value: 'khmer' },
      { id: 'lao', label: 'Lao', value: 'lao' },
    ]
  },
  {
    id: 'operatingHours',
    title: 'Availability',
    type: 'checkbox',
    icon: 'clock',
    description: 'Clinic availability and hours',
    options: [
      { id: 'open_now', label: 'Open Now', value: 'open_now' },
      { id: 'open_weekends', label: 'Open Weekends', value: 'open_weekends' },
      { id: 'late_night', label: 'Late Night (after 10 PM)', value: 'late_night' },
      { id: '24_hour', label: '24 Hours', value: '24_hour' },
      { id: 'open_sunday', label: 'Open on Sunday', value: 'open_sunday' },
      { id: 'open_holidays', label: 'Open on Public Holidays', value: 'open_holidays' },
      { id: 'early_morning', label: 'Early Morning (before 8 AM)', value: 'early_morning' },
      { id: 'extended_hours', label: 'Extended Hours (after 8 PM)', value: 'extended_hours' },
      { id: 'appointment_only', label: 'Appointment Only', value: 'appointment_only' },
      { id: 'walk_in_welcome', label: 'Walk-ins Welcome', value: 'walk_in_welcome' },
    ]
  }
]

// Medical Terms Dictionary for intelligent search
export const MEDICAL_TERMS_DICTIONARY = {
  // Cardiology terms
  'heart disease': {
    synonyms: ['cardiac disease', 'cardiovascular disease', 'heart condition', 'cardiac condition'],
    category: 'cardiology',
    specialty: 'cardiology',
    commonSymptoms: ['chest pain', 'shortness of breath', 'palpitations', 'fatigue'],
    relatedConditions: ['hypertension', 'arrhythmia', 'heart failure', 'coronary artery disease'],
    urgencyLevel: 'routine'
  },
  'high blood pressure': {
    synonyms: ['hypertension', 'elevated blood pressure', 'high bp'],
    category: 'cardiology',
    specialty: 'cardiology',
    commonSymptoms: ['headaches', 'dizziness', 'blurred vision'],
    relatedConditions: ['heart disease', 'stroke', 'kidney disease'],
    urgencyLevel: 'routine'
  },
  'chest pain': {
    synonyms: ['chest discomfort', 'thoracic pain', 'chest pressure', 'cardiac pain'],
    category: 'cardiology',
    specialty: 'cardiology',
    commonSymptoms: ['shortness of breath', 'sweating', 'nausea'],
    relatedConditions: ['heart attack', 'angina', 'muscle strain'],
    urgencyLevel: 'emergency'
  },
  
  // Dermatology terms
  'skin rash': {
    synonyms: ['skin eruption', 'dermatitis', 'skin inflammation', 'rash'],
    category: 'dermatology',
    specialty: 'dermatology',
    commonSymptoms: ['itching', 'redness', 'swelling', 'pain'],
    relatedConditions: ['eczema', 'allergies', 'infection'],
    urgencyLevel: 'routine'
  },
  'acne': {
    synonyms: ['pimples', 'breakouts', 'blemishes', 'pustules'],
    category: 'dermatology',
    specialty: 'dermatology',
    commonSymptoms: ['pimples', 'blackheads', 'whiteheads'],
    relatedConditions: ['oily skin', 'hormonal changes'],
    urgencyLevel: 'routine'
  },
  
  // Orthopedics terms
  'back pain': {
    synonyms: ['lower back pain', 'spinal pain', 'lumbar pain', 'sciatica'],
    category: 'orthopedics',
    specialty: 'orthopedics',
    commonSymptoms: ['stiffness', 'muscle spasms', 'limited mobility'],
    relatedConditions: ['herniated disc', 'muscle strain', 'arthritis'],
    urgencyLevel: 'routine'
  },
  'joint pain': {
    synonyms: ['arthralgia', 'joint ache', 'joint discomfort'],
    category: 'orthopedics',
    specialty: 'orthopedics',
    commonSymptoms: ['stiffness', 'swelling', 'limited range of motion'],
    relatedConditions: ['arthritis', 'tendinitis', 'bursitis'],
    urgencyLevel: 'routine'
  },
  
  // Pediatrics terms
  'fever': {
    synonyms: ['high temperature', 'pyrexia', 'elevated temperature'],
    category: 'pediatrics',
    specialty: 'pediatrics',
    commonSymptoms: ['chills', 'sweating', 'dehydration'],
    relatedConditions: ['infection', 'viral illness', 'bacterial infection'],
    urgencyLevel: 'urgent'
  },
  'cough': {
    synonyms: ['tussis', 'persistent cough', 'bronchial irritation'],
    category: 'pediatrics',
    specialty: 'pediatrics',
    commonSymptoms: ['throat irritation', 'phlegm', 'breathlessness'],
    relatedConditions: ['cold', 'bronchitis', 'pneumonia', 'asthma'],
    urgencyLevel: 'routine'
  },
  
  // Mental Health terms
  'depression': {
    synonyms: ['major depressive disorder', 'clinical depression', 'mood disorder'],
    category: 'mental_health',
    specialty: 'psychiatry',
    commonSymptoms: ['sadness', 'fatigue', 'sleep changes', 'appetite changes'],
    relatedConditions: ['anxiety', 'bipolar disorder'],
    urgencyLevel: 'routine'
  },
  'anxiety': {
    synonyms: ['anxiety disorder', 'nervousness', 'worry', 'panic'],
    category: 'mental_health',
    specialty: 'psychiatry',
    commonSymptoms: ['racing thoughts', 'restlessness', 'rapid heartbeat'],
    relatedConditions: ['depression', 'panic disorder', 'phobias'],
    urgencyLevel: 'routine'
  },
  
  // Women's Health terms
  'menstrual problems': {
    synonyms: ['irregular periods', 'menstrual disorders', 'period problems'],
    category: 'womens_health',
    specialty: 'gynecology',
    commonSymptoms: ['heavy bleeding', 'cramping', 'irregular cycles'],
    relatedConditions: ['PCOS', 'endometriosis', 'hormonal imbalances'],
    urgencyLevel: 'routine'
  },
  'pregnancy care': {
    synonyms: ['prenatal care', 'maternity care', 'antenatal care'],
    category: 'womens_health',
    specialty: 'gynecology',
    commonSymptoms: ['pregnancy symptoms', 'prenatal monitoring'],
    relatedConditions: ['high-risk pregnancy', 'gestational diabetes'],
    urgencyLevel: 'routine'
  },
  
  // General/Common terms
  'headache': {
    synonyms: ['migraine', 'tension headache', 'cephalalgia', 'head pain'],
    category: 'general',
    specialty: 'internal_medicine',
    commonSymptoms: ['throbbing pain', 'nausea', 'light sensitivity'],
    relatedConditions: ['migraine', 'tension headache', 'cluster headache'],
    urgencyLevel: 'routine'
  },
  'stomach pain': {
    synonyms: ['abdominal pain', 'belly pain', 'gastric pain', 'stomach ache'],
    category: 'gastroenterology',
    specialty: 'gastroenterology',
    commonSymptoms: ['nausea', 'vomiting', 'bloating', 'diarrhea'],
    relatedConditions: ['gastritis', 'ulcers', 'indigestion', 'appendicitis'],
    urgencyLevel: 'routine'
  },
  'sore throat': {
    synonyms: ['throat pain', 'pharyngitis', 'tonsillitis', 'throat infection'],
    category: 'general',
    specialty: 'otolaryngology',
    commonSymptoms: ['painful swallowing', 'scratchy throat', 'swollen glands'],
    relatedConditions: ['strep throat', 'cold', 'flu'],
    urgencyLevel: 'routine'
  },
  'eye problems': {
    synonyms: ['vision problems', 'eye strain', 'ocular issues', 'visual disturbances'],
    category: 'ophthalmology',
    specialty: 'ophthalmology',
    commonSymptoms: ['blurred vision', 'eye pain', 'redness', 'tearing'],
    relatedConditions: ['nearsightedness', 'farsightedness', 'cataracts', 'glaucoma'],
    urgencyLevel: 'routine'
  },
  'dental problems': {
    synonyms: ['toothache', 'dental pain', 'oral health issues', 'tooth pain'],
    category: 'dental',
    specialty: 'dental_care',
    commonSymptoms: ['tooth pain', 'sensitivity', 'swelling', 'bleeding gums'],
    relatedConditions: ['cavities', 'gum disease', 'dental abscess'],
    urgencyLevel: 'routine'
  }
}

// Common symptoms and conditions mapping
export const SYMPTOM_CONDITION_MAP = {
  'chest pain': ['cardiology', 'emergency'],
  'shortness of breath': ['pulmonology', 'cardiology'],
  'fever': ['pediatrics', 'general'],
  'cough': ['pulmonology', 'pediatrics'],
  'headache': ['neurology', 'general'],
  'stomach pain': ['gastroenterology', 'general'],
  'back pain': ['orthopedics', 'general'],
  'joint pain': ['orthopedics', 'rheumatology'],
  'skin rash': ['dermatology', 'allergy'],
  'eye problems': ['ophthalmology', 'general'],
  'depression': ['psychiatry', 'mental_health'],
  'anxiety': ['psychiatry', 'mental_health'],
  'fatigue': ['internal_medicine', 'general'],
  'weight loss': ['endocrinology', 'general'],
  'dizziness': ['neurology', 'cardiology']
}

// Medical specialty aliases
export const SPECIALTY_ALIASES = {
  'cardio': 'cardiology',
  'heart': 'cardiology',
  'cardiac': 'cardiology',
  'skin': 'dermatology',
  'derm': 'dermatology',
  'bones': 'orthopedics',
  'ortho': 'orthopedics',
  'kids': 'pediatrics',
  'children': 'pediatrics',
  'brain': 'neurology',
  'nerve': 'neurology',
  'mental': 'psychiatry',
  'psych': 'psychiatry',
  'women': 'gynecology',
  'gyn': 'gynecology',
  'eyes': 'ophthalmology',
  'eye': 'ophthalmology',
  'ent': 'otolaryngology',
  'ears': 'otolaryngology',
  'nose': 'otolaryngology',
  'throat': 'otolaryngology',
  'teeth': 'dental_care',
  'dental': 'dental_care',
  'stomach': 'gastroenterology',
  'gut': 'gastroenterology',
  'digestive': 'gastroenterology',
  'hormones': 'endocrinology',
  'endocrine': 'endocrinology',
  'diabetes': 'endocrinology',
  'lungs': 'pulmonology',
  'respiratory': 'pulmonology',
  'breathing': 'pulmonology',
  'kidneys': 'nephrology',
  'renal': 'nephrology',
  'liver': 'hepatology',
  'hepatic': 'hepatology',
  'infections': 'infectious_diseases',
  'cancer': 'oncology',
  'tumor': 'oncology',
  'joints': 'rheumatology',
  'arthritis': 'rheumatology',
  'urinary': 'urology',
  'bladder': 'urology',
  'surgery': 'general_surgery',
  'operate': 'general_surgery'
}

export const SPECIALIZATION_OPTIONS = [
  'General Practice',
  'Cardiology',
  'Dermatology',
  'Endocrinology',
  'Gastroenterology',
  'Neurology',
  'Oncology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'Pulmonology',
  'Rheumatology',
  'Urology',
  'Gynecology',
  'Ophthalmology',
  'Otolaryngology',
]

export const LOCATION_SUGGESTIONS = [
  'Singapore Central',
  'Orchard Road',
  'Marina Bay',
  'Raffles Place',
  'Clarke Quay',
  'Little India',
  'Chinatown',
  'Tiong Bahru',
  'Holland Village',
  'Serangoon',
  'Tampines',
  'Jurong',
  'Woodlands',
  'Bedok',
  'Clementi',
  'Bukit Timah',
  'Newton',
  'Novena',
  'Toa Payoh',
  'Bishan',
]

// Location-based medical services
export const LOCATION_BASED_SERVICES = [
  { area: 'orchard_road', medical_services: ['cardiology', 'dermatology', 'cosmetic_surgery'] },
  { area: 'marina_bay', medical_services: ['emergency_care', 'cardiology', 'neurology'] },
  { area: 'little_india', medical_services: ['general_practice', 'ayurveda', 'traditional_medicine'] },
  { area: 'chinatown', medical_services: ['traditional_chinese_medicine', 'acupuncture'] },
  { area: 'holland_village', medical_services: ['mental_health', 'counseling', 'therapy'] },
  { area: 'serangoon', medical_services: ['pediatrics', 'family_medicine'] },
  { area: 'tampines', medical_services: ['general_practice', 'dental_care', 'eye_care'] },
  { area: 'jurong', medical_services: ['occupational_health', 'industrial_medicine'] },
  { area: 'woodlands', medical_services: ['general_practice', 'physiotherapy'] },
  { area: 'bedok', medical_services: ['elderly_care', 'geriatric_medicine'] }
]

// Ranking criteria weights
export const RANKING_WEIGHTS = {
  relevance: 0.4,
  availability: 0.2,
  proximity: 0.15,
  rating: 0.15,
  price: 0.1
}

// Search analytics tracking events
export const SEARCH_EVENTS = {
  SEARCH_INITIATED: 'search_initiated',
  FILTER_APPLIED: 'filter_applied',
  SUGGESTION_SELECTED: 'suggestion_selected',
  RESULT_CLICKED: 'result_clicked',
  BOOKING_MADE: 'booking_made',
  SEARCH_ABANDONED: 'search_abandoned',
  VOICE_SEARCH_USED: 'voice_search_used',
  MEDICAL_TERM_RECOGNIZED: 'medical_term_recognized'
}