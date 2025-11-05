import { PrismaClient, HTPriority, ChasTier, SubsidyType, ServiceComplexity, UrgencyLevel, AlternativeType, PrerequisiteType, ServiceRelationshipType, SynonymType, ChecklistCategory, ChecklistPriority, EquipmentType, OutcomeType, RiskLevel } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Service Taxonomy Data Seeding Script
 * Creates comprehensive Singapore healthcare service taxonomy with 15 main categories,
 * 50+ subcategories, realistic services, and complete relationship mapping.
 */

async function main() {
  console.log('🌱 Starting Service Taxonomy Data Seeding...')

  // Clean existing data (in order to avoid foreign key constraints)
  try {
    await prisma.serviceSearchIndex.deleteMany()
    await prisma.serviceSynonym.deleteMany()
    await prisma.serviceAlternative.deleteMany()
    await prisma.servicePrerequisite.deleteMany()
    await prisma.serviceRelationship.deleteMany()
    await prisma.servicePricingStructure.deleteMany()
    await prisma.serviceMOHMapping.deleteMany()
    await prisma.serviceAvailability.deleteMany()
    await prisma.serviceChecklist.deleteMany()
    await prisma.serviceEquipment.deleteMany()
    await prisma.serviceOutcome.deleteMany()
    await prisma.servicePackageItem.deleteMany()
    await prisma.servicePackage.deleteMany()
    await prisma.service.deleteMany()
    await prisma.categorySynonym.deleteMany()
    await prisma.serviceCategory.deleteMany()
  } catch (error) {
    console.log('Some tables may not exist yet, continuing with creation...')
  }

  // Create main service categories (15 categories)
  const mainCategories = [
    {
      name: 'general_practice',
      displayName: 'General Practice',
      description: 'Primary healthcare services provided by general practitioners and family doctors',
      mohCodePrefix: 'GP',
      mohCategoryName: 'Primary Care - General Practice',
      htCategory: 'Primary Care',
      htPriority: HTPriority.PHASE_1,
      healthierSGCategory: 'Primary Care',
      healthierSGLevel: 'Core',
      isSubsidized: true,
      priorityLevel: 1,
      sortOrder: 1,
      level: 0,
    },
    {
      name: 'specialist_consultations',
      displayName: 'Specialist Consultations',
      description: 'Specialist medical consultations and second opinions',
      mohCodePrefix: 'SC',
      mohCategoryName: 'Specialist Care - Consultations',
      htCategory: 'Specialist Care',
      htPriority: HTPriority.STANDARD,
      healthierSGCategory: 'Specialist Care',
      healthierSGLevel: 'Enhanced',
      isSubsidized: false,
      priorityLevel: 2,
      sortOrder: 2,
      level: 0,
    },
    {
      name: 'diagnostic_services',
      displayName: 'Diagnostic Services',
      description: 'Laboratory tests, imaging, and diagnostic procedures',
      mohCodePrefix: 'DS',
      mohCategoryName: 'Diagnostic Services',
      htCategory: 'Diagnostics',
      htPriority: HTPriority.HIGH,
      healthierSGCategory: 'Preventive Care',
      healthierSGLevel: 'Core',
      isSubsidized: true,
      priorityLevel: 3,
      sortOrder: 3,
      level: 0,
    },
    {
      name: 'preventive_care',
      displayName: 'Preventive Care',
      description: 'Health screenings, vaccinations, and preventive health programs',
      mohCodePrefix: 'PC',
      mohCategoryName: 'Preventive Care',
      htCategory: 'Prevention',
      htPriority: HTPriority.PHASE_1,
      healthierSGCategory: 'Preventive Care',
      healthierSGLevel: 'Core',
      isSubsidized: true,
      priorityLevel: 4,
      sortOrder: 4,
      level: 0,
    },
    {
      name: 'womens_health',
      displayName: 'Women\'s Health',
      description: 'Women-specific health services including reproductive health',
      mohCodePrefix: 'WH',
      mohCategoryName: 'Women\'s Health Services',
      htCategory: 'Women\'s Health',
      htPriority: HTPriority.PHASE_2,
      healthierSGCategory: 'Women\'s Health',
      healthierSGLevel: 'Core',
      isSubsidized: true,
      priorityLevel: 5,
      sortOrder: 5,
      level: 0,
    },
    {
      name: 'pediatrics',
      displayName: 'Pediatrics',
      description: 'Healthcare services for infants, children, and adolescents',
      mohCodePrefix: 'PD',
      mohCategoryName: 'Pediatric Care',
      htCategory: 'Pediatrics',
      htPriority: HTPriority.PHASE_1,
      healthierSGCategory: 'Pediatric Care',
      healthierSGLevel: 'Core',
      isSubsidized: true,
      priorityLevel: 6,
      sortOrder: 6,
      level: 0,
    },
    {
      name: 'mental_health',
      displayName: 'Mental Health',
      description: 'Mental health services including counseling and psychiatric care',
      mohCodePrefix: 'MH',
      mohCategoryName: 'Mental Health Services',
      htCategory: 'Mental Health',
      htPriority: HTPriority.HIGH,
      healthierSGCategory: 'Mental Health',
      healthierSGLevel: 'Enhanced',
      isSubsidized: true,
      priorityLevel: 7,
      sortOrder: 7,
      level: 0,
    },
    {
      name: 'dental_care',
      displayName: 'Dental Care',
      description: 'General and specialized dental services',
      mohCodePrefix: 'DC',
      mohCategoryName: 'Dental Care',
      htCategory: 'Dental Care',
      htPriority: HTPriority.STANDARD,
      healthierSGCategory: 'Dental Care',
      healthierSGLevel: 'Basic',
      isSubsidized: true,
      priorityLevel: 8,
      sortOrder: 8,
      level: 0,
    },
    {
      name: 'eye_care',
      displayName: 'Eye Care',
      description: 'Ophthalmology and optometry services',
      mohCodePrefix: 'EC',
      mohCategoryName: 'Eye Care Services',
      htCategory: 'Eye Care',
      htPriority: HTPriority.STANDARD,
      healthierSGCategory: 'Eye Care',
      healthierSGLevel: 'Basic',
      isSubsidized: true,
      priorityLevel: 9,
      sortOrder: 9,
      level: 0,
    },
    {
      name: 'emergency_services',
      displayName: 'Emergency Services',
      description: '24/7 emergency medical care and urgent care services',
      mohCodePrefix: 'ES',
      mohCategoryName: 'Emergency Medical Services',
      htCategory: 'Emergency Care',
      htPriority: HTPriority.CRITICAL,
      healthierSGCategory: 'Emergency Care',
      healthierSGLevel: 'Essential',
      isSubsidized: true,
      priorityLevel: 10,
      sortOrder: 10,
      level: 0,
    },
    {
      name: 'surgical_procedures',
      displayName: 'Surgical Procedures',
      description: 'Inpatient and outpatient surgical services',
      mohCodePrefix: 'SP',
      mohCategoryName: 'Surgical Services',
      htCategory: 'Surgical Care',
      htPriority: HTPriority.STANDARD,
      healthierSGCategory: 'Surgical Care',
      healthierSGLevel: 'Specialized',
      isSubsidized: true,
      priorityLevel: 11,
      sortOrder: 11,
      level: 0,
    },
    {
      name: 'rehabilitation',
      displayName: 'Rehabilitation Services',
      description: 'Physical therapy, occupational therapy, and rehabilitation programs',
      mohCodePrefix: 'RB',
      mohCategoryName: 'Rehabilitation Services',
      htCategory: 'Rehabilitation',
      htPriority: HTPriority.PHASE_2,
      healthierSGCategory: 'Rehabilitation',
      healthierSGLevel: 'Enhanced',
      isSubsidized: true,
      priorityLevel: 12,
      sortOrder: 12,
      level: 0,
    },
    {
      name: 'home_healthcare',
      displayName: 'Home Healthcare',
      description: 'Medical care provided in the patient\'s home',
      mohCodePrefix: 'HH',
      mohCategoryName: 'Home Healthcare Services',
      htCategory: 'Home Care',
      htPriority: HTPriority.PHASE_2,
      healthierSGCategory: 'Home Healthcare',
      healthierSGLevel: 'Enhanced',
      isSubsidized: true,
      priorityLevel: 13,
      sortOrder: 13,
      level: 0,
    },
    {
      name: 'telemedicine',
      displayName: 'Telemedicine',
      description: 'Remote healthcare consultations and monitoring',
      mohCodePrefix: 'TM',
      mohCategoryName: 'Telemedicine Services',
      htCategory: 'Digital Health',
      htPriority: HTPriority.HIGH,
      healthierSGCategory: 'Telemedicine',
      healthierSGLevel: 'Core',
      isSubsidized: false,
      priorityLevel: 14,
      sortOrder: 14,
      level: 0,
    },
    {
      name: 'chronic_disease_management',
      displayName: 'Chronic Disease Management',
      description: 'Long-term care and management of chronic conditions',
      mohCodePrefix: 'CDM',
      mohCategoryName: 'Chronic Disease Management',
      htCategory: 'Chronic Care',
      htPriority: HTPriority.PHASE_1,
      healthierSGCategory: 'Chronic Disease Management',
      healthierSGLevel: 'Core',
      isSubsidized: true,
      priorityLevel: 15,
      sortOrder: 15,
      level: 0,
    },
  ]

  // Create main categories
  const createdCategories = await Promise.all(
    mainCategories.map(category =>
      prisma.serviceCategory.create({
        data: {
          ...category,
          translations: { en: category.displayName, zh: getChineseName(category.name) },
        },
      })
    )
  )

  console.log(`✅ Created ${createdCategories.length} main service categories`)

  // Create subcategories for each main category (50+ total)
  const subcategories = [
    // General Practice subcategories
    { parentName: 'general_practice', subcategories: ['routine_checkup', 'health_screening', 'chronic_care', 'acute_care', 'health_counseling'] },
    
    // Specialist Consultations subcategories  
    { parentName: 'specialist_consultations', subcategories: ['cardiology', 'dermatology', 'endocrinology', 'gastroenterology', 'neurology', 'orthopedics', 'psychiatry', 'pulmonology', 'rheumatology', 'urology'] },
    
    // Diagnostic Services subcategories
    { parentName: 'diagnostic_services', subcategories: ['laboratory_tests', 'imaging', 'cardiology_diagnostics', 'endoscopy', 'biopsy', 'pathology'] },
    
    // Preventive Care subcategories
    { parentName: 'preventive_care', subcategories: ['health_screenings', 'vaccinations', 'wellness_programs', 'nutritional_counseling', 'fitness_assessment'] },
    
    // Women's Health subcategories
    { parentName: 'womens_health', subcategories: ['gynecology', 'prenatal_care', 'family_planning', 'menopause_management', 'breast_health', 'cervical_screening'] },
    
    // Pediatrics subcategories
    { parentName: 'pediatrics', subcategories: ['newborn_care', 'child_development', 'adolescent_medicine', 'pediatric_vaccinations', 'child_mental_health'] },
    
    // Mental Health subcategories
    { parentName: 'mental_health', subcategories: ['counseling', 'psychotherapy', 'psychiatry', 'substance_abuse', 'crisis_intervention', 'group_therapy'] },
    
    // Dental Care subcategories
    { parentName: 'dental_care', subcategories: ['general_dentistry', 'orthodontics', 'oral_surgery', 'periodontics', 'endodontics', 'pediatric_dentistry', 'cosmetic_dentistry'] },
    
    // Eye Care subcategories
    { parentName: 'eye_care', subcategories: ['optometry', 'ophthalmology', 'vision_screening', 'glaucoma_care', 'retinal_services', 'cornea_services'] },
    
    // Emergency Services subcategories
    { parentName: 'emergency_services', subcategories: ['emergency_medicine', 'trauma_care', 'urgent_care', 'ambulance_services', 'emergency_surgery'] },
    
    // Surgical Procedures subcategories
    { parentName: 'surgical_procedures', subcategories: ['general_surgery', 'minimally_invasive', 'outpatient_surgery', 'emergency_surgery', 'elective_surgery'] },
    
    // Rehabilitation subcategories
    { parentName: 'rehabilitation', subcategories: ['physical_therapy', 'occupational_therapy', 'speech_therapy', 'cardiac_rehabilitation', 'stroke_rehabilitation'] },
    
    // Home Healthcare subcategories
    { parentName: 'home_healthcare', subcategories: ['home_nursing', 'medical_care', 'rehabilitation_home', 'palliative_care', 'elderly_care'] },
    
    // Telemedicine subcategories
    { parentName: 'telemedicine', subcategories: ['video_consultation', 'remote_monitoring', 'digital_prescription', 'telehealth_followup'] },
    
    // Chronic Disease Management subcategories
    { parentName: 'chronic_disease_management', subcategories: ['diabetes_care', 'hypertension', 'heart_disease', 'respiratory_diseases', 'kidney_disease'] },
  ]

  // Create subcategories
  for (const categoryGroup of subcategories) {
    const parentCategory = createdCategories.find(cat => cat.name === categoryGroup.parentName)
    if (!parentCategory) continue

    for (let i = 0; i < categoryGroup.subcategories.length; i++) {
      const subcategoryName = categoryGroup.subcategories[i]
      await prisma.serviceCategory.create({
        data: {
          name: subcategoryName,
          displayName: getDisplayName(subcategoryName),
          description: getSubcategoryDescription(subcategoryName),
          parentId: parentCategory.id,
          level: 1,
          sortOrder: i + 1,
          mohCodePrefix: parentCategory.mohCodePrefix,
          htCategory: parentCategory.htCategory,
          htPriority: parentCategory.htPriority,
          healthierSGCategory: parentCategory.healthierSGCategory,
          healthierSGLevel: parentCategory.healthierSGLevel,
          isSubsidized: parentCategory.isSubsidized,
          translations: { 
            en: getDisplayName(subcategoryName), 
            zh: getChineseSubcategoryName(subcategoryName) 
          },
        },
      })
    }
  }

  console.log(`✅ Created ${subcategories.reduce((acc, cat) => acc + cat.subcategories.length, 0)} subcategories`)

  // Get all categories for service creation
  const allCategories = await prisma.serviceCategory.findMany({
    include: { children: true }
  })

  // Create comprehensive services (50+ services)
  const services = [
    // General Practice Services
    {
      name: 'General Consultation',
      description: 'Primary healthcare consultation with experienced general practitioner',
      categoryName: 'routine_checkup',
      basePrice: 35,
      mohCode: 'GP001',
      typicalDurationMin: 20,
      complexityLevel: ServiceComplexity.BASIC,
      urgencyLevel: UrgencyLevel.ROUTINE,
      synonyms: ['GP visit', 'doctor consultation', 'medical check-up', 'general checkup'],
      searchTerms: ['doctor', 'consultation', 'checkup', 'medical visit'],
      tags: ['primary care', 'routine', 'general'],
    },
    {
      name: 'Health Screening Package',
      description: 'Comprehensive health screening for early detection of health issues',
      categoryName: 'health_screening',
      basePrice: 150,
      mohCode: 'GP002',
      typicalDurationMin: 45,
      complexityLevel: ServiceComplexity.MODERATE,
      urgencyLevel: UrgencyLevel.ROUTINE,
      isHealthierSGCovered: true,
      synonyms: ['full body check', 'health check', 'medical screening', 'annual checkup'],
      searchTerms: ['screening', 'health check', 'medical test', 'prevention'],
      tags: ['screening', 'prevention', 'comprehensive'],
    },
    {
      name: 'Diabetes Management',
      description: 'Specialized care for diabetes patients including monitoring and education',
      categoryName: 'chronic_care',
      basePrice: 50,
      mohCode: 'CDM001',
      typicalDurationMin: 30,
      complexityLevel: ServiceComplexity.SPECIALIZED,
      urgencyLevel: UrgencyLevel.ROUTINE,
      isHealthierSGCovered: true,
      synonyms: ['diabetes care', 'blood sugar management', 'diabetic consultation'],
      searchTerms: ['diabetes', 'blood sugar', 'endocrine', 'chronic disease'],
      tags: ['chronic care', 'diabetes', 'specialized'],
    },

    // Specialist Services
    {
      name: 'Cardiology Consultation',
      description: 'Specialist consultation for heart and cardiovascular conditions',
      categoryName: 'cardiology',
      basePrice: 120,
      mohCode: 'SC001',
      typicalDurationMin: 45,
      complexityLevel: ServiceComplexity.SPECIALIZED,
      urgencyLevel: UrgencyLevel.ROUTINE,
      synonyms: ['heart specialist', 'cardiac consultation', 'heart doctor'],
      searchTerms: ['heart', 'cardiology', 'cardiac', 'cardiovascular'],
      tags: ['specialist', 'cardiology', 'heart'],
    },
    {
      name: 'Dermatology Consultation',
      description: 'Skin health consultation and treatment of skin conditions',
      categoryName: 'dermatology',
      basePrice: 100,
      mohCode: 'SC002',
      typicalDurationMin: 30,
      complexityLevel: ServiceComplexity.MODERATE,
      urgencyLevel: UrgencyLevel.ROUTINE,
      synonyms: ['skin doctor', 'skin specialist', 'dermatologist visit'],
      searchTerms: ['skin', 'dermatology', 'rash', 'acne', 'eczema'],
      tags: ['specialist', 'dermatology', 'skin'],
    },
    {
      name: 'Mental Health Counseling',
      description: 'Professional counseling for mental health and emotional wellbeing',
      categoryName: 'counseling',
      basePrice: 80,
      mohCode: 'MH001',
      typicalDurationMin: 60,
      complexityLevel: ServiceComplexity.SPECIALIZED,
      urgencyLevel: UrgencyLevel.ROUTINE,
      isHealthierSGCovered: true,
      synonyms: ['therapy', 'psychological counseling', 'mental health therapy'],
      searchTerms: ['counseling', 'therapy', 'mental health', 'psychology'],
      tags: ['mental health', 'counseling', 'therapy'],
    },

    // Diagnostic Services
    {
      name: 'Complete Blood Count (CBC)',
      description: 'Basic blood test to evaluate overall health and detect various conditions',
      categoryName: 'laboratory_tests',
      basePrice: 25,
      mohCode: 'DS001',
      typicalDurationMin: 10,
      complexityLevel: ServiceComplexity.BASIC,
      urgencyLevel: UrgencyLevel.ROUTINE,
      isHealthierSGCovered: true,
      synonyms: ['blood test', 'CBC test', 'blood work'],
      searchTerms: ['blood test', 'CBC', 'laboratory', 'blood work'],
      tags: ['diagnostic', 'blood test', 'laboratory'],
    },
    {
      name: 'Chest X-Ray',
      description: 'Radiographic imaging of the chest to examine heart and lungs',
      categoryName: 'imaging',
      basePrice: 45,
      mohCode: 'DS002',
      typicalDurationMin: 15,
      complexityLevel: ServiceComplexity.BASIC,
      urgencyLevel: UrgencyLevel.ROUTINE,
      isHealthierSGCovered: true,
      synonyms: ['chest xray', 'chest radiograph', 'lung x-ray'],
      searchTerms: ['x-ray', 'chest', 'imaging', 'radiology'],
      tags: ['diagnostic', 'imaging', 'x-ray'],
    },
    {
      name: 'ECG (Electrocardiogram)',
      description: 'Heart rhythm and electrical activity assessment',
      categoryName: 'cardiology_diagnostics',
      basePrice: 35,
      mohCode: 'DS003',
      typicalDurationMin: 10,
      complexityLevel: ServiceComplexity.BASIC,
      urgencyLevel: UrgencyLevel.ROUTINE,
      isHealthierSGCovered: true,
      synonyms: ['electrocardiogram', 'heart rhythm test', 'EKG'],
      searchTerms: ['ECG', 'EKG', 'heart rhythm', 'cardiology test'],
      tags: ['diagnostic', 'cardiology', 'heart'],
    },

    // Preventive Care
    {
      name: 'Adult Vaccination',
      description: 'Routine and travel vaccinations for adults',
      categoryName: 'vaccinations',
      basePrice: 30,
      mohCode: 'PC001',
      typicalDurationMin: 15,
      complexityLevel: ServiceComplexity.BASIC,
      urgencyLevel: UrgencyLevel.ROUTINE,
      isHealthierSGCovered: true,
      synonyms: ['immunization', 'vaccine shot', 'injection'],
      searchTerms: ['vaccine', 'immunization', 'shot', 'prevention'],
      tags: ['preventive', 'vaccination', 'immunization'],
    },
    {
      name: 'Cervical Cancer Screening (Pap Smear)',
      description: 'Routine cervical cancer screening for women',
      categoryName: 'cervical_screening',
      basePrice: 60,
      mohCode: 'WH001',
      typicalDurationMin: 20,
      complexityLevel: ServiceComplexity.BASIC,
      urgencyLevel: UrgencyLevel.ROUTINE,
      isHealthierSGCovered: true,
      synonyms: ['Pap smear', 'cervical screening', 'pap test'],
      searchTerms: ['cervical', 'pap smear', 'women health', 'screening'],
      tags: ['preventive', 'womens health', 'screening'],
    },

    // Women's Health
    {
      name: 'Prenatal Care Consultation',
      description: 'Comprehensive prenatal care and monitoring during pregnancy',
      categoryName: 'prenatal_care',
      basePrice: 80,
      mohCode: 'WH002',
      typicalDurationMin: 30,
      complexityLevel: ServiceComplexity.SPECIALIZED,
      urgencyLevel: UrgencyLevel.ROUTINE,
      isHealthierSGCovered: true,
      synonyms: ['pregnancy care', 'maternity consultation', 'antenatal care'],
      searchTerms: ['pregnancy', 'prenatal', 'maternity', 'antenatal'],
      tags: ['womens health', 'pregnancy', 'specialized'],
    },
    {
      name: 'Gynecological Consultation',
      description: 'General gynecological health consultation and examination',
      categoryName: 'gynecology',
      basePrice: 70,
      mohCode: 'WH003',
      typicalDurationMin: 30,
      complexityLevel: ServiceComplexity.MODERATE,
      urgencyLevel: UrgencyLevel.ROUTINE,
      isHealthierSGCovered: true,
      synonyms: ['women health check', 'gynecologist visit', 'womens exam'],
      searchTerms: ['gynecology', 'women health', 'reproductive health'],
      tags: ['womens health', 'gynecology', 'general'],
    },

    // Pediatric Services
    {
      name: 'Child Development Assessment',
      description: 'Comprehensive evaluation of child development milestones',
      categoryName: 'child_development',
      basePrice: 90,
      mohCode: 'PD001',
      typicalDurationMin: 45,
      complexityLevel: ServiceComplexity.MODERATE,
      urgencyLevel: UrgencyLevel.ROUTINE,
      isHealthierSGCovered: true,
      synonyms: ['child development check', 'pediatric assessment', 'milestone check'],
      searchTerms: ['child development', 'pediatrics', 'milestones'],
      tags: ['pediatrics', 'development', 'child'],
    },
    {
      name: 'Pediatric Vaccination',
      description: 'Childhood immunization according to national schedule',
      categoryName: 'pediatric_vaccinations',
      basePrice: 25,
      mohCode: 'PD002',
      typicalDurationMin: 15,
      complexityLevel: ServiceComplexity.BASIC,
      urgencyLevel: UrgencyLevel.ROUTINE,
      isHealthierSGCovered: true,
      synonyms: ['child vaccine', 'pediatric immunization', 'baby shots'],
      searchTerms: ['pediatric vaccine', 'child immunization', 'baby vaccine'],
      tags: ['pediatrics', 'vaccination', 'child'],
    },

    // Dental Care
    {
      name: 'General Dental Check-up',
      description: 'Routine dental examination and cleaning',
      categoryName: 'general_dentistry',
      basePrice: 60,
      mohCode: 'DC001',
      typicalDurationMin: 45,
      complexityLevel: ServiceComplexity.BASIC,
      urgencyLevel: UrgencyLevel.ROUTINE,
      isHealthierSGCovered: true,
      synonyms: ['dental cleaning', 'dental exam', 'oral checkup'],
      searchTerms: ['dental', 'dentist', 'teeth cleaning', 'oral health'],
      tags: ['dental', 'general', 'preventive'],
    },
    {
      name: 'Teeth Whitening',
      description: 'Professional teeth whitening treatment',
      categoryName: 'cosmetic_dentistry',
      basePrice: 200,
      mohCode: 'DC002',
      typicalDurationMin: 90,
      complexityLevel: ServiceComplexity.MODERATE,
      urgencyLevel: UrgencyLevel.ROUTINE,
      synonyms: ['teeth bleaching', 'smile enhancement', 'dental whitening'],
      searchTerms: ['teeth whitening', 'cosmetic dentistry', 'dental bleaching'],
      tags: ['dental', 'cosmetic', 'aesthetic'],
    },

    // Eye Care
    {
      name: 'Eye Examination',
      description: 'Comprehensive eye health and vision assessment',
      categoryName: 'optometry',
      basePrice: 40,
      mohCode: 'EC001',
      typicalDurationMin: 30,
      complexityLevel: ServiceComplexity.BASIC,
      urgencyLevel: UrgencyLevel.ROUTINE,
      isHealthierSGCovered: true,
      synonyms: ['vision test', 'eye check', 'optometry exam'],
      searchTerms: ['eye exam', 'vision test', 'optometry', 'eyesight'],
      tags: ['eye care', 'optometry', 'vision'],
    },
    {
      name: 'Glaucoma Screening',
      description: 'Specialized screening for glaucoma and eye pressure assessment',
      categoryName: 'glaucoma_care',
      basePrice: 70,
      mohCode: 'EC002',
      typicalDurationMin: 30,
      complexityLevel: ServiceComplexity.MODERATE,
      urgencyLevel: UrgencyLevel.ROUTINE,
      isHealthierSGCovered: true,
      synonyms: ['glaucoma test', 'eye pressure test', 'tonometry'],
      searchTerms: ['glaucoma', 'eye pressure', 'ophthalmology'],
      tags: ['eye care', 'glaucoma', 'screening'],
    },

    // Emergency Services
    {
      name: 'Emergency Consultation',
      description: '24/7 emergency medical consultation and urgent care',
      categoryName: 'emergency_medicine',
      basePrice: 150,
      mohCode: 'ES001',
      typicalDurationMin: 30,
      complexityLevel: ServiceComplexity.COMPLEX,
      urgencyLevel: UrgencyLevel.EMERGENCY,
      isHealthierSGCovered: true,
      synonyms: ['emergency care', 'urgent care', 'emergency visit'],
      searchTerms: ['emergency', 'urgent care', 'emergency room'],
      tags: ['emergency', 'urgent care', '24/7'],
    },

    // Rehabilitation
    {
      name: 'Physical Therapy Session',
      description: 'Professional physical therapy for injury recovery and mobility improvement',
      categoryName: 'physical_therapy',
      basePrice: 60,
      mohCode: 'RB001',
      typicalDurationMin: 60,
      complexityLevel: ServiceComplexity.MODERATE,
      urgencyLevel: UrgencyLevel.ROUTINE,
      isHealthierSGCovered: true,
      synonyms: ['physiotherapy', 'rehabilitation therapy', 'movement therapy'],
      searchTerms: ['physical therapy', 'physiotherapy', 'rehabilitation'],
      tags: ['rehabilitation', 'therapy', 'physical'],
    },

    // Home Healthcare
    {
      name: 'Home Nursing Care',
      description: 'Professional nursing care provided in patient\'s home',
      categoryName: 'home_nursing',
      basePrice: 80,
      mohCode: 'HH001',
      typicalDurationMin: 120,
      complexityLevel: ServiceComplexity.MODERATE,
      urgencyLevel: UrgencyLevel.ROUTINE,
      isHealthierSGCovered: true,
      synonyms: ['home care nursing', 'visiting nurse', 'community nursing'],
      searchTerms: ['home care', 'nursing care', 'community health'],
      tags: ['home care', 'nursing', 'community'],
    },

    // Telemedicine
    {
      name: 'Video Consultation',
      description: 'Remote medical consultation via secure video call',
      categoryName: 'video_consultation',
      basePrice: 25,
      mohCode: 'TM001',
      typicalDurationMin: 20,
      complexityLevel: ServiceComplexity.BASIC,
      urgencyLevel: UrgencyLevel.ROUTINE,
      synonyms: ['telehealth', 'online consultation', 'virtual visit'],
      searchTerms: ['telemedicine', 'video consultation', 'online doctor'],
      tags: ['telemedicine', 'virtual', 'remote'],
    },

    // Chronic Disease Management
    {
      name: 'Hypertension Management',
      description: 'Comprehensive care and monitoring for high blood pressure',
      categoryName: 'hypertension',
      basePrice: 45,
      mohCode: 'CDM001',
      typicalDurationMin: 30,
      complexityLevel: ServiceComplexity.SPECIALIZED,
      urgencyLevel: UrgencyLevel.ROUTINE,
      isHealthierSGCovered: true,
      synonyms: ['blood pressure care', 'high blood pressure management'],
      searchTerms: ['hypertension', 'blood pressure', 'cardiovascular'],
      tags: ['chronic care', 'hypertension', 'cardiovascular'],
    },
  ]

  // Create services
  for (const serviceData of services) {
    const category = allCategories.find(cat => 
      cat.name === serviceData.categoryName || cat.children.some(child => child.name === serviceData.categoryName)
    )
    
    if (!category) continue

    // Find the exact subcategory if it exists
    let targetCategory = category
    if (category.name !== serviceData.categoryName) {
      targetCategory = category.children.find(child => child.name === serviceData.categoryName) || category
    }

    const service = await prisma.service.create({
      data: {
        name: serviceData.name,
        description: serviceData.description,
        categoryId: targetCategory.id,
        subcategory: getSubcategoryName(serviceData.categoryName),
        mohCode: serviceData.mohCode,
        typicalDurationMin: serviceData.typicalDurationMin,
        complexityLevel: serviceData.complexityLevel,
        urgencyLevel: serviceData.urgencyLevel,
        basePrice: serviceData.basePrice,
        isHealthierSGCovered: serviceData.isHealthierSGCovered || false,
        medicalDescription: serviceData.description,
        patientFriendlyDesc: serviceData.description,
        synonyms: serviceData.synonyms || [],
        searchTerms: serviceData.searchTerms || [],
        commonSearchPhrases: serviceData.synonyms?.slice(0, 3) || [],
        tags: serviceData.tags || [],
        translations: {
          en: serviceData.name,
          zh: getChineseServiceName(serviceData.name),
        },
        specialtyArea: targetCategory.name,
        currency: 'SGD',
        isSubsidized: serviceData.isHealthierSGCovered || false,
        healthierSGServices: serviceData.isHealthierSGCovered ? ['Healthier SG'] : [],
        medisaveCoverage: serviceData.isHealthierSGCovered ? { covered: true } : {},
        medishieldCoverage: serviceData.isHealthierSGCovered ? { covered: true } : {},
        insuranceCoverage: serviceData.isHealthierSGCovered ? { covered: true } : {},
        processSteps: [],
        preparationSteps: [],
        postCareInstructions: [],
        successRates: {},
        riskFactors: [],
        ageRequirements: {},
        genderRequirements: [],
        terminology: {},
        commonQuestions: [],
        isActive: true,
        sortOrder: 0,
        priorityLevel: 1,
        viewCount: 0,
        bookingCount: 0,
        priceRangeMin: serviceData.basePrice * 0.8,
        priceRangeMax: serviceData.basePrice * 1.2,
      },
    })

    // Create service search index
    await prisma.serviceSearchIndex.create({
      data: {
        serviceId: service.id,
        searchableName: serviceData.name,
        searchableDesc: serviceData.description,
        searchKeywords: serviceData.searchTerms || [],
        medicalTerms: serviceData.searchTerms?.slice(0, 5) || [],
        anatomyTerms: getAnatomyTerms(serviceData.categoryName),
        conditionTerms: getConditionTerms(serviceData.categoryName),
        procedureTerms: serviceData.searchTerms?.slice(5, 10) || [],
        searchPhrases: serviceData.synonyms || [],
        searchTranslations: {
          en: serviceData.name,
          zh: getChineseServiceName(serviceData.name),
        },
        searchBoost: 1.0,
        popularityScore: Math.random() * 100,
      },
    })

    // Create service synonyms
    if (serviceData.synonyms && serviceData.synonyms.length > 0) {
      for (const synonym of serviceData.synonyms) {
        await prisma.serviceSynonym.create({
          data: {
            serviceId: service.id,
            term: synonym,
            termType: SynonymType.ALTERNATE_NAME,
            language: 'en',
            searchBoost: 1.0,
          },
        })
      }
    }

    // Create pricing structure
    await prisma.servicePricingStructure.create({
      data: {
        serviceId: service.id,
        basePrice: serviceData.basePrice,
        currency: 'SGD',
        medisaveCovered: serviceData.isHealthierSGCovered || false,
        medishieldCovered: serviceData.isHealthierSGCovered || false,
        chasCovered: serviceData.isHealthierSGCovered || false,
        subsidyType: serviceData.isHealthierSGCovered ? SubsidyType.HEALTHIER_SG : null,
        subsidyAmount: serviceData.isHealthierSGCovered ? serviceData.basePrice * 0.3 : null,
        subsidyPercentage: serviceData.isHealthierSGCovered ? 30 : null,
        pricingTiers: [],
        effectiveDate: new Date(),
      },
    })

    // Create MOH mapping
    await prisma.serviceMOHMapping.create({
      data: {
        serviceId: service.id,
        mohCategoryCode: serviceData.mohCode,
        mohCategoryName: targetCategory.mohCategoryName || targetCategory.displayName,
        mohSubcategory: targetCategory.name,
        mohCode: serviceData.mohCode,
        htCategory: targetCategory.htCategory,
        htPriority: targetCategory.htPriority,
        healthierSGCategory: targetCategory.healthierSGCategory,
        healthierSGLevel: targetCategory.healthierSGLevel,
        screenForLifeCategory: serviceData.isHealthierSGCovered ? 'Screening' : null,
        chasCategory: serviceData.isHealthierSGCovered ? 'Preventive Care' : null,
        effectiveDate: new Date(),
        isActive: true,
        lastVerified: new Date(),
      },
    })
  }

  console.log(`✅ Created ${services.length} services with complete metadata`)

  // Create service relationships and alternatives
  await createServiceRelationships(prisma, allCategories)

  // Create service checklists for key services
  await createServiceChecklists(prisma)

  // Create service outcomes
  await createServiceOutcomes(prisma)

  console.log('🎉 Service Taxonomy Data Seeding Completed Successfully!')
}

// Helper functions
function getChineseName(categoryName: string): string {
  const translations: Record<string, string> = {
    general_practice: '全科医疗',
    specialist_consultations: '专科咨询',
    diagnostic_services: '诊断服务',
    preventive_care: '预防保健',
    womens_health: '妇女健康',
    pediatrics: '儿科',
    mental_health: '精神健康',
    dental_care: '牙科护理',
    eye_care: '眼科护理',
    emergency_services: '急诊服务',
    surgical_procedures: '外科手术',
    rehabilitation: '康复服务',
    home_healthcare: '家庭医疗',
    telemedicine: '远程医疗',
    chronic_disease_management: '慢性病管理',
  }
  return translations[categoryName] || categoryName
}

function getDisplayName(subcategoryName: string): string {
  return subcategoryName.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

function getSubcategoryDescription(subcategoryName: string): string {
  const descriptions: Record<string, string> = {
    routine_checkup: 'Regular health check-ups and consultations',
    health_screening: 'Comprehensive health screening programs',
    chronic_care: 'Long-term management of chronic conditions',
    acute_care: 'Treatment for acute medical conditions',
    health_counseling: 'Health education and lifestyle counseling',
    cardiology: 'Heart and cardiovascular specialized care',
    dermatology: 'Skin, hair, and nail health services',
    laboratory_tests: 'Blood and urine analysis services',
    imaging: 'X-rays, CT scans, and other imaging services',
    vaccinations: 'Immunization services for adults and children',
  }
  return descriptions[subcategoryName] || `Professional ${subcategoryName.replace('_', ' ')} services`
}

function getChineseSubcategoryName(subcategoryName: string): string {
  const translations: Record<string, string> = {
    routine_checkup: '常规检查',
    health_screening: '健康筛查',
    chronic_care: '慢性病护理',
    cardiology: '心脏病科',
    dermatology: '皮肤科',
    laboratory_tests: '实验室检查',
    imaging: '影像检查',
    vaccinations: '疫苗接种',
    prenatal_care: '产前护理',
    gynecology: '妇科',
    child_development: '儿童发育',
    general_dentistry: '普通牙科',
    optometry: '验光学',
    physical_therapy: '物理治疗',
    home_nursing: '家庭护理',
    hypertension: '高血压管理',
  }
  return translations[subcategoryName] || subcategoryName
}

function getSubcategoryName(categoryName: string): string {
  return getDisplayName(categoryName)
}

function getChineseServiceName(serviceName: string): string {
  const translations: Record<string, string> = {
    'General Consultation': '普通咨询',
    'Health Screening Package': '健康筛查套餐',
    'Cardiology Consultation': '心脏病科咨询',
    'Dermatology Consultation': '皮肤科咨询',
    'Complete Blood Count (CBC)': '血常规检查',
    'Chest X-Ray': '胸部X光检查',
    'Adult Vaccination': '成人疫苗接种',
    'Cervical Cancer Screening (Pap Smear)': '宫颈癌筛查',
    'Child Development Assessment': '儿童发育评估',
    'General Dental Check-up': '一般牙科检查',
    'Eye Examination': '眼科检查',
    'Emergency Consultation': '急诊咨询',
    'Physical Therapy Session': '物理治疗',
    'Home Nursing Care': '家庭护理',
    'Video Consultation': '视频咨询',
    'Hypertension Management': '高血压管理',
  }
  return translations[serviceName] || serviceName
}

function getAnatomyTerms(categoryName: string): string[] {
  const anatomyMap: Record<string, string[]> = {
    cardiology: ['heart', 'cardiovascular', 'circulation', 'blood vessels'],
    dermatology: ['skin', 'epidermis', 'dermis', 'subcutaneous'],
    ophthalmology: ['eye', 'retina', 'cornea', 'lens', 'optic nerve'],
    gynecology: ['uterus', 'ovaries', 'cervix', 'vagina'],
    orthopedics: ['bones', 'joints', 'muscles', 'tendons', 'ligaments'],
  }
  
  for (const [key, terms] of Object.entries(anatomyMap)) {
    if (categoryName.includes(key)) {
      return terms
    }
  }
  return []
}

function getConditionTerms(categoryName: string): string[] {
  const conditionMap: Record<string, string[]> = {
    cardiology: ['hypertension', 'heart disease', 'arrhythmia', 'heart failure'],
    diabetes: ['diabetes', 'blood sugar', 'insulin resistance', 'glycemic control'],
    mental_health: ['depression', 'anxiety', 'stress', 'mood disorders'],
    respiratory: ['asthma', 'COPD', 'pneumonia', 'respiratory infection'],
  }
  
  for (const [key, terms] of Object.entries(conditionMap)) {
    if (categoryName.includes(key)) {
      return terms
    }
  }
  return []
}

async function createServiceRelationships(prisma: PrismaClient, categories: any[]) {
  console.log('🔗 Creating service relationships...')
  
  // Get all services for relationship creation
  const services = await prisma.service.findMany()
  
  // Create alternative relationships
  const alternatives = [
    { primary: 'General Consultation', alternative: 'Telemedicine Consultation', type: AlternativeType.ALTERNATIVE },
    { primary: 'General Dental Check-up', alternative: 'Dental Cleaning', type: AlternativeType.COMBINATION },
    { primary: 'Physical Therapy Session', alternative: 'Home Exercise Program', type: AlternativeType.PREPARATION },
  ]
  
  for (const alt of alternatives) {
    const primaryService = services.find(s => s.name === alt.primary)
    const alternativeService = services.find(s => s.name === alt.alternative)
    
    if (primaryService && alternativeService) {
      await prisma.serviceAlternative.create({
        data: {
          primaryServiceId: primaryService.id,
          alternativeServiceId: alternativeService.id,
          relationshipType: alt.type,
          similarityScore: 0.8,
        },
      })
    }
  }
  
  // Create prerequisite relationships
  const prerequisites = [
    { service: 'Chest X-Ray', prerequisite: 'Doctor Consultation', type: PrerequisiteType.REQUIRED },
    { service: 'Surgery Procedure', prerequisite: 'Pre-operative Assessment', type: PrerequisiteType.REQUIRED },
    { service: 'Physical Therapy', prerequisite: 'Doctor Referral', type: PrerequisiteType.RECOMMENDED },
  ]
  
  for (const prereq of prerequisites) {
    const service = services.find(s => s.name === prereq.service)
    const prerequisiteService = services.find(s => s.name === prereq.prerequisite)
    
    if (service && prerequisiteService) {
      await prisma.servicePrerequisite.create({
        data: {
          serviceId: service.id,
          prerequisiteServiceId: prerequisiteService.id,
          prerequisiteType: prereq.type,
          description: `${prereq.type} for ${prereq.service}`,
        },
      })
    }
  }
  
  console.log('✅ Created service relationships')
}

async function createServiceChecklists(prisma: PrismaClient) {
  console.log('📋 Creating service checklists...')
  
  const services = await prisma.service.findMany({
    take: 10 // Create checklists for first 10 services
  })
  
  const checklists = [
    {
      service: 'General Consultation',
      items: [
        { category: ChecklistCategory.DOCUMENTS, item: 'NRIC or identification', description: 'Valid identification document' },
        { category: ChecklistCategory.MEDICATIONS, item: 'Current medications list', description: 'List of all current medications' },
        { category: ChecklistCategory.PREPARATION, item: 'Fasting if required', description: 'Some tests may require fasting' },
      ]
    },
    {
      service: 'Health Screening Package',
      items: [
        { category: ChecklistCategory.PREPARATION, item: '8-12 hours fasting', description: 'Fasting required for blood tests' },
        { category: ChecklistCategory.DOCUMENTS, item: 'Insurance card', description: 'Insurance coverage verification' },
        { category: ChecklistCategory.LIFESTYLE, item: 'Avoid alcohol', description: 'No alcohol 24 hours before screening' },
      ]
    },
    {
      service: 'Cervical Cancer Screening',
      items: [
        { category: ChecklistCategory.SCHEDULING, item: 'Schedule between periods', description: 'Avoid during menstruation' },
        { category: ChecklistCategory.PREPARATION, item: 'No douching 48 hours prior', description: 'Avoid vaginal douching' },
        { category: ChecklistCategory.PREPARATION, item: 'No sexual intercourse 48 hours prior', description: 'Abstain from intercourse' },
      ]
    }
  ]
  
  for (const checklist of checklists) {
    const service = services.find(s => s.name === checklist.service)
    if (!service) continue
    
    for (let i = 0; i < checklist.items.length; i++) {
      const item = checklist.items[i]
      await prisma.serviceChecklist.create({
        data: {
          serviceId: service.id,
          category: item.category,
          item: item.item,
          description: item.description,
          isRequired: i < 2, // First 2 items required
          orderIndex: i,
          priority: i === 0 ? ChecklistPriority.HIGH : ChecklistPriority.MEDIUM,
        },
      })
    }
  }
  
  console.log('✅ Created service checklists')
}

async function createServiceOutcomes(prisma: PrismaClient) {
  console.log('📊 Creating service outcomes...')
  
  const services = await prisma.service.findMany({
    take: 5 // Create outcomes for first 5 services
  })
  
  const outcomes = [
    {
      service: 'General Consultation',
      outcome: {
        type: OutcomeType.DIAGNOSTIC,
        description: 'Initial diagnosis and treatment plan establishment',
        successRate: 95,
        patientSatisfaction: 4.5,
        followUpRequired: true,
      }
    },
    {
      service: 'Health Screening Package',
      outcome: {
        type: OutcomeType.PREVENTIVE,
        description: 'Early detection of health issues and risk assessment',
        successRate: 90,
        patientSatisfaction: 4.7,
        followUpRequired: false,
      }
    },
    {
      service: 'Physical Therapy Session',
      outcome: {
        type: OutcomeType.REHABILITATIVE,
        description: 'Improved mobility and pain reduction',
        successRate: 85,
        patientSatisfaction: 4.6,
        followUpRequired: true,
      }
    }
  ]
  
  for (const outcomeData of outcomes) {
    const service = services.find(s => s.name === outcomeData.service)
    if (!service) continue
    
    const outcome = outcomeData.outcome
    await prisma.serviceOutcome.create({
      data: {
        serviceId: service.id,
        outcomeType: outcome.type,
        description: outcome.description,
        successRate: outcome.successRate,
        patientSatisfaction: outcome.patientSatisfaction,
        followUpRequired: outcome.followUpRequired,
        riskLevel: RiskLevel.LOW,
        complications: [],
      },
    })
  }
  
  console.log('✅ Created service outcomes')
}

main()
  .then(async () => {
    await prisma.$disconnect()
    console.log('Database seeding completed!')
  })
  .catch(async (e) => {
    console.error('Error during seeding:', e)
    await prisma.$disconnect()
    process.exit(1)
  })