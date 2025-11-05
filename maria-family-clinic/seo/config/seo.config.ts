/**
 * SEO Configuration for My Family Clinic
 * Singapore healthcare platform SEO settings and constants
 */

import { LanguageSEO, SingaporeSEO, LocalBusinessSEO } from '../types/seo.types'

// =============================================================================
// SEO BASE CONFIGURATION
// =============================================================================

export const SEO_CONFIG = {
  baseUrl: 'https://myfamilyclinic.sg',
  defaultLanguage: 'en',
  defaultTitle: 'My Family Clinic - Singapore Primary Care Network',
  defaultDescription: 'Find doctors, book appointments, and manage your healthcare journey in Singapore\'s comprehensive primary care network. Healthier SG enrolled.',
  companyName: 'My Family Clinic',
  companyLogo: '/images/my-family-clinic-logo.png',
  defaultImage: '/images/og-image-default.jpg',
  twitterHandle: '@MyFamilyClinicSG',
  facebookPage: 'https://facebook.com/MyFamilyClinicSG',
  
  // Technical SEO Settings
  robots: {
    userAgent: '*',
    allow: '/',
    disallow: [
      '/api/',
      '/admin/',
      '/dashboard/',
      '/private/',
      '/_next/',
      '/images/private/',
      '/*.json$',
      '/*?*'
    ],
    sitemap: '/sitemap.xml',
    crawlDelay: 1
  },

  // Structured Data Settings
  structuredData: {
    context: 'https://schema.org',
    version: '3.2'
  },

  // Meta Tags Defaults
  defaultMeta: {
    viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
    charset: 'UTF-8',
    robots: 'index, follow',
    author: 'My Family Clinic',
    publisher: 'My Family Clinic',
    themeColor: '#0066CC',
    msapplicationTileColor: '#0066CC'
  }
}

// =============================================================================
// SINGAPORE-SPECIFIC SEO CONFIGURATION
// =============================================================================

export const SINGAPORE_SEO_CONFIG: SingaporeSEO = {
  location: {
    country: 'Singapore',
    region: 'Central Region',
    district: 'Multiple Districts',
    postalCode: '018956',
    landmark: 'Marina Bay',
    mrtStation: 'Raffles Place',
    busStop: 'Marina Bay Financial Centre'
  },
  healthcareContext: {
    mohGuidelines: 'Singapore Ministry of Health Guidelines',
    healthierSGProgram: true,
    subsidyEligibility: 'CHAS',
    waitingTime: 'Same day appointments available',
    appointmentRequired: true
  },
  localKeywords: [
    'clinic near me',
    'GP Singapore',
    'family doctor Singapore',
    'health screening Singapore',
    'CHAS clinic',
    'Healthier SG',
    'MOH clinic',
    'primary care Singapore'
  ],
  culturalKeywords: [
    '看医生新加坡',
    'clinic near me Singapore',
    'GP singapore klinik',
    'doktor keluarga singapore'
  ],
  searchVolume: {
    high: [
      'clinic near me',
      'GP Singapore',
      'family doctor',
      'health screening',
      'doctor appointment',
      'medical check up'
    ],
    medium: [
      'CHAS clinic',
      'primary care Singapore',
      'healthier sg enrollment',
      'medical consultation',
      'preventive care'
    ],
    low: [
      'specialist referral',
      'chronic disease management',
      'health coaching',
      'wellness screening'
    ]
  }
}

// =============================================================================
// MULTI-LANGUAGE SEO CONFIGURATION
// =============================================================================

export const LANGUAGE_CONFIGS: Record<string, LanguageSEO> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    rtl: false,
    default: true,
    supported: true,
    hreflang: 'en-SG',
    domain: 'https://myfamilyclinic.sg',
    contentPath: '',
    metaTags: {
      description: 'Find doctors, book appointments, and manage your healthcare journey in Singapore\'s comprehensive primary care network.',
      keywords: ['Singapore healthcare', 'clinic finder', 'doctor appointments', 'Healthier SG', 'primary care', 'GP Singapore']
    },
    culturalAdaptation: {
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      currency: 'SGD',
      numberFormat: 'en-SG',
      healthcareTerms: {
        'clinic': 'clinic',
        'doctor': 'doctor',
        'appointment': 'appointment',
        'health screening': 'health screening',
        'medical check-up': 'medical check-up'
      }
    }
  },
  zh: {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    rtl: false,
    default: false,
    supported: true,
    hreflang: 'zh-SG',
    domain: 'https://myfamilyclinic.sg/zh',
    contentPath: '/zh',
    metaTags: {
      description: '在新加坡综合初级护理网络中寻找医生、预约和管理您的医疗保健旅程。',
      keywords: ['新加坡医疗保健', '诊所查找', '医生预约', '健康筛查', '家庭医生']
    },
    culturalAdaptation: {
      dateFormat: 'YYYY年MM月DD日',
      timeFormat: '24小时制',
      currency: '新加坡元',
      numberFormat: 'zh-CN',
      healthcareTerms: {
        'clinic': '诊所',
        'doctor': '医生',
        'appointment': '预约',
        'health screening': '健康筛查',
        'medical check-up': '健康检查'
      }
    }
  },
  ms: {
    code: 'ms',
    name: 'Malay',
    nativeName: 'Bahasa Melayu',
    rtl: false,
    default: false,
    supported: true,
    hreflang: 'ms-SG',
    domain: 'https://myfamilyclinic.sg/ms',
    contentPath: '/ms',
    metaTags: {
      description: 'Cari doktor, book janji temu, dan urus perjalanan penjagaan kesihatan anda di rangkaian penjagaan primer komprehensif Singapura.',
      keywords: ['penjagaan kesihatan Singapura', 'pencari klinik', 'janji temu doktor', 'pemeriksaan kesihatan', 'doktor keluarga']
    },
    culturalAdaptation: {
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24 jam',
      currency: 'SGD',
      numberFormat: 'ms-MY',
      healthcareTerms: {
        'clinic': 'klinik',
        'doctor': 'doktor',
        'appointment': 'janji temu',
        'health screening': 'pemeriksaan kesihatan',
        'medical check-up': 'pemeriksaan perubatan'
      }
    }
  },
  ta: {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    rtl: false,
    default: false,
    supported: true,
    hreflang: 'ta-SG',
    domain: 'https://myfamilyclinic.sg/ta',
    contentPath: '/ta',
    metaTags: {
      description: 'சிங்கப்பூரின் விரிவான பிரதம சுகாதார பிணையத்தில் மருத்துவர்களைக் கண்டு, சந்திப்புகளை முன்பதிவு செய்து, உங்கள் சுகாதார பயணத்தை நிர்வகிக்கவும்.',
      keywords: ['சிங்கப்பூர் சுகாதாரம்', 'கிளினிக் கண்டுபிடிப்பான்', 'மருத்துவர் சந்திப்பு', 'ஆரோக்கிய பரிசோதனை', 'குடும்ப மருத்துவர்']
    },
    culturalAdaptation: {
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24 மணி நேரம்',
      currency: 'SGD',
      numberFormat: 'ta-IN',
      healthcareTerms: {
        'clinic': 'கிளினிக்',
        'doctor': 'மருத்துவர்',
        'appointment': 'சந்திப்பு',
        'health screening': 'ஆரோக்கிய பரிசோதனை',
        'medical check-up': 'மருத்துவ பரிசோதனை'
      }
    }
  }
}

// =============================================================================
// HEALTHCARE-SPECIFIC SEO CONSTANTS
// =============================================================================

export const HEALTHCARE_SEO_CONFIG = {
  // Medical Specialties for SEO
  specialties: [
    'General Practice',
    'Family Medicine',
    'Internal Medicine',
    'Pediatrics',
    'Cardiology',
    'Dermatology',
    'Endocrinology',
    'Gastroenterology',
    'Neurology',
    'Oncology',
    'Psychiatry',
    'Pulmonology',
    'Rheumatology',
    'Urology',
    'Orthopedics'
  ],

  // Common Medical Conditions for SEO
  conditions: [
    'Diabetes',
    'Hypertension',
    'Asthma',
    'Heart Disease',
    'Depression',
    'Anxiety',
    'Arthritis',
    'Migraine',
    'Back Pain',
    'Skin Conditions'
  ],

  // Medical Services for SEO
  services: [
    'Health Screening',
    'Vaccination',
    'Chronic Disease Management',
    'Preventive Care',
    'Health Check-up',
    'Medical Consultation',
    'Laboratory Tests',
    'Imaging Services',
    'Emergency Care',
    'Telemedicine'
  ],

  // Medical Keywords by Search Intent
  intentKeywords: {
    informational: [
      'symptoms of',
      'treatment for',
      'causes of',
      'prevention',
      'what is',
      'how to',
      'when to see'
    ],
    navigational: [
      'my family clinic',
      'clinic near me',
      'my doctor',
      'appointments'
    ],
    transactional: [
      'book appointment',
      'schedule consultation',
      'find doctor',
      'make appointment'
    ]
  }
}

// =============================================================================
// LOCAL SEO CONFIGURATION
// =============================================================================

export const SINGAPORE_DISTRICTS = [
  { name: 'Central Region', code: '01', keywords: ['CBD', 'Raffles Place', 'Marina Bay'] },
  { name: 'Riverside', code: '02', keywords: ['Clarke Quay', 'Boat Quay', 'Raffles Place'] },
  { name: 'Marina South', code: '03', keywords: ['Marina Bay', 'Suntec City', 'Esplanade'] },
  { name: 'Museum', code: '04', keywords: ['Bugis', 'Little India', 'Dhoby Ghaut'] },
  { name: 'Rochor', code: '05', keywords: ['Little India', 'Bugis', 'Tekka'] },
  { name: 'Kallang', code: '06', keywords: ['Geylang', 'Kallang Bahru', 'Tanjong Rhu'] },
  { name: 'Marine Parade', code: '07', keywords: ['Kampong Glam', 'Beach Road', 'Arab Street'] },
  { name: 'Queenstown', code: '08', keywords: ['Commonwealth', 'Dawson', 'Alexandra'] },
  { name: 'Bukit Timah', code: '09', keywords: ['Orchard Road', 'Newton', 'Novena'] },
  { name: 'Toa Payoh North', code: '10', keywords: ['Toa Payoh', 'Braddell', 'Bishan'] }
]

// =============================================================================
// ORGANIZATION SCHEMA CONFIGURATION
// =============================================================================

export const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'My Family Clinic',
  description: 'Singapore\'s premier primary care network providing comprehensive healthcare services with Healthier SG enrollment.',
  url: 'https://myfamilyclinic.sg',
  logo: 'https://myfamilyclinic.sg/images/logo.png',
  image: 'https://myfamilyclinic.sg/images/hero-image.jpg',
  sameAs: [
    'https://facebook.com/MyFamilyClinicSG',
    'https://twitter.com/MyFamilyClinicSG',
    'https://instagram.com/MyFamilyClinicSG',
    'https://linkedin.com/company/MyFamilyClinicSG'
  ],
  address: {
    '@type': 'PostalAddress',
    streetAddress: '6 Raffles Boulevard',
    addressLocality: 'Singapore',
    addressRegion: 'Singapore',
    postalCode: '018956',
    addressCountry: 'SG'
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+65-6123-4567',
    contactType: 'customer service',
    availableLanguage: ['English', 'Chinese', 'Malay', 'Tamil']
  },
  hasCredential: [
    'MOH Licensed',
    'CHAS Accredited',
    'Healthier SG Enrolled'
  ],
  medicalSpecialty: HEALTHCARE_SEO_CONFIG.specialties,
  foundingDate: '2020',
  numberOfEmployees: '100-500'
}

// =============================================================================
// PERFORMANCE TARGETS
// =============================================================================

export const SEO_PERFORMANCE_TARGETS = {
  coreWebVitals: {
    LCP: 2.5, // Largest Contentful Paint (seconds)
    FID: 100, // First Input Delay (milliseconds)
    CLS: 0.1  // Cumulative Layout Shift
  },
  pageSpeed: {
    mobile: 85, // PageSpeed Score
    desktop: 90 // PageSpeed Score
  },
  seo: {
    organicTrafficIncrease: 30, // percentage
    keywordRankings: {
      top3: 25, // target number of keywords in top 3 positions
      top10: 100, // target number of keywords in top 10 positions
      top50: 500 // target number of keywords in top 50 positions
    },
    localSEO: {
      localPackAppearances: 50,
      averageLocalRank: 3.5
    }
  }
}

// =============================================================================
// URL STRUCTURE CONFIGURATION
// =============================================================================

export const URL_STRUCTURE = {
  clinic: {
    pattern: '/clinics/[slug]',
    examples: [
      '/clinics/marina-bay-clinic',
      '/clinics/orchard-health-centre',
      '/clinics/clemenceau-medical'
    ]
  },
  doctor: {
    pattern: '/doctors/[slug]',
    examples: [
      '/doctors/dr-sarah-lim',
      '/doctors/dr-chen-wei-ming',
      '/doctors/dr-amira-hassan'
    ]
  },
  service: {
    pattern: '/services/[category]/[service]',
    examples: [
      '/services/general-practice/health-screening',
      '/services/specialist-care/cardiology-consultation',
      '/services/emergency-care/urgent-treatment'
    ]
  },
  location: {
    pattern: '/clinics/[location]',
    examples: [
      '/clinics/central-singapore',
      '/clinics/marina-bay',
      '/clinics/tiong-bahru'
    ]
  },
  language: {
    pattern: '/[lang]/[path]',
    examples: [
      '/zh/clinics/marina-bay-clinic',
      '/ms/doctors/dr-sarah-lim',
      '/ta/services/general-practice/health-screening'
    ]
  }
}

// =============================================================================
// SITEMAP CONFIGURATION
// =============================================================================

export const SITEMAP_CONFIG = {
  entryPriority: {
    homepage: 1.0,
    clinicPages: 0.8,
    doctorPages: 0.8,
    servicePages: 0.7,
    blogPages: 0.6,
    contactPages: 0.5,
    privacyPages: 0.3
  },
  changefreq: {
    homepage: 'daily',
    clinicPages: 'weekly',
    doctorPages: 'weekly',
    servicePages: 'monthly',
    blogPages: 'daily',
    contactPages: 'monthly',
    privacyPages: 'yearly'
  },
  maxEntries: 50000,
  languages: ['en', 'zh', 'ms', 'ta']
}

// =============================================================================
// HEALTHCARE COMPLIANCE CONFIGURATION
// =============================================================================

export const HEALTHCARE_COMPLIANCE = {
  mohGuidelines: {
    advertisementPolicy: true,
    professionalConduct: true,
    patientPrivacy: true,
    medicalRecordKeeping: true
  },
  sgHealthcareTerms: {
    healthierSG: 'Healthier SG is a national health programme...',
    CHAS: 'Community Health Assist Scheme provides subsidised care...',
    Medisave: 'Medisave is a national savings scheme for healthcare...',
    Medishield: 'Medishield Life provides universal basic health insurance...',
    elderShield: 'ElderShield provides severe disability insurance...'
  },
  medicalDisclaimers: {
    general: 'This information is for educational purposes only and should not replace professional medical advice.',
    emergency: 'In case of medical emergency, call 995 immediately.',
    appointment: 'Please consult your healthcare provider for medical advice and treatment.'
  }
}