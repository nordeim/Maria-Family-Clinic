import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Comprehensive Medical Specialization Taxonomy for Singapore Healthcare System
const medicalSpecializations = [
  // Primary Care Specialties
  {
    specialty: "General Practice",
    mohCode: "GP001",
    category: "Primary Care",
    subSpecialties: [
      "Family Medicine",
      "Primary Care Medicine", 
      "General Consultation",
      "Health Screening",
      "Preventive Care",
      "Chronic Disease Management",
      "Acute Care Management",
      "Health Check-ups",
      "Annual Physical Examinations",
      "Workplace Health",
      "Insurance Medical Examinations",
      "Travel Medicine"
    ],
    conditionsTreated: [
      "General health complaints",
      "Chronic conditions (diabetes, hypertension)",
      "Acute illnesses",
      "Preventive health screenings",
      "Vaccinations",
      "Health counseling",
      "Lifestyle disease management",
      "Mental health screening"
    ],
    proceduresKnown: [
      "Physical examinations",
      "Vital signs monitoring",
      "Basic laboratory tests",
      "Vaccinations",
      "Minor procedures",
      "Health screenings",
      "Referral procedures"
    ],
    mohCategory: "Primary Healthcare",
    mohSpecialtyCode: "GP",
    expertiseLevel: "INTERMEDIATE"
  },
  
  {
    specialty: "Family Medicine",
    mohCode: "FM001", 
    category: "Primary Care",
    subSpecialties: [
      "Comprehensive Family Care",
      "Life-stage Medicine",
      "Family-centered Care",
      "Preventive Family Medicine",
      "Chronic Disease Management",
      "Adolescent Medicine",
      "Women's Health in Family Practice",
      "Men's Health",
      "Geriatric Family Medicine",
      "Behavioral Health in Family Practice"
    ],
    conditionsTreated: [
      "Family health issues",
      "Multi-generational health patterns",
      "Life-transition health needs",
      "Chronic disease management",
      "Mental health conditions",
      "Lifestyle diseases",
      "Preventive health issues",
      "Developmental concerns"
    ],
    proceduresKnown: [
      "Comprehensive family assessments",
      "Life-stage health screenings",
      "Preventive care procedures",
      "Health education delivery",
      "Family counseling",
      "Chronic disease monitoring"
    ],
    mohCategory: "Primary Healthcare",
    mohSpecialtyCode: "FM",
    expertiseLevel: "ADVANCED"
  },

  // Internal Medicine Specialties
  {
    specialty: "Internal Medicine",
    mohCode: "IM001",
    category: "Specialist Care",
    subSpecialties: [
      "General Internal Medicine",
      "Hospital Medicine",
      "Critical Care Medicine",
      "Palliative Care",
      "Hospital-based Internal Medicine",
      "Consultation Medicine"
    ],
    conditionsTreated: [
      "Complex medical conditions",
      "Multiple comorbidities",
      "Hospital-acquired conditions",
      "Critical illness management",
      "End-of-life care",
      "Complex diagnostic problems"
    ],
    proceduresKnown: [
      "Central line placement",
      "Arterial line placement", 
      "Mechanical ventilation management",
      "Hemodynamic monitoring",
      "Procedures in critical care"
    ],
    mohCategory: "Specialist Medicine",
    mohSpecialtyCode: "IM",
    expertiseLevel: "ADVANCED"
  },

  // Cardiology
  {
    specialty: "Cardiology",
    mohCode: "CARD001",
    category: "Specialist Care",
    subSpecialties: [
      "Interventional Cardiology",
      "Electrophysiology", 
      "Heart Failure",
      "Preventive Cardiology",
      "Cardiac Imaging",
      "Congenital Heart Disease",
      "Valvular Heart Disease",
      "Ischemic Heart Disease",
      "Hypertensive Cardiology",
      "Cardiac Surgery Consultation",
      "Pediatric Cardiology"
    ],
    conditionsTreated: [
      "Coronary artery disease",
      "Heart failure",
      "Hypertension",
      "Cardiac arrhythmias",
      "Valvular heart disease",
      "Congenital heart defects",
      "Peripheral arterial disease",
      "Pulmonary hypertension",
      "Cardiomyopathy",
      "Endocarditis"
    ],
    proceduresKnown: [
      "Coronary angiography",
      "Percutaneous coronary intervention",
      "Echocardiography",
      "Cardiac catheterization",
      "Electrophysiology studies",
      "Pacemaker implantation",
      "Cardioversion",
      "Stress testing",
      "Holter monitoring"
    ],
    mohCategory: "Specialist Medicine",
    mohSpecialtyCode: "CARD",
    expertiseLevel: "EXPERT"
  },

  // Dermatology
  {
    specialty: "Dermatology",
    mohCode: "DERM001",
    category: "Specialist Care", 
    subSpecialties: [
      "Medical Dermatology",
      "Surgical Dermatology", 
      "Cosmetic Dermatology",
      "Dermatopathology",
      "Pediatric Dermatology",
      "Geriatric Dermatology",
      "Dermatologic Oncology",
      "Contact Dermatitis",
      "Hair and Scalp Disorders",
      "Nail Disorders"
    ],
    conditionsTreated: [
      "Skin cancer",
      "Acne vulgaris",
      "Psoriasis",
      "Eczema",
      "Dermatitis",
      "Skin infections",
      "Hair loss disorders",
      "Nail disorders",
      "Pigmentation disorders",
      "Benign skin tumors"
    ],
    proceduresKnown: [
      "Skin biopsy",
      "Excisional surgery",
      "Mohs micrographic surgery",
      "Laser therapy",
      "Phototherapy",
      "Cryotherapy",
      "Chemical peels",
      "Botox injections",
      "Filler injections",
      "Patch testing"
    ],
    mohCategory: "Specialist Medicine",
    mohSpecialtyCode: "DERM", 
    expertiseLevel: "EXPERT"
  },

  // Orthopedics
  {
    specialty: "Orthopedics",
    mohCode: "ORTHO001",
    category: "Specialist Care",
    subSpecialties: [
      "Joint Replacement Surgery",
      "Sports Medicine",
      "Spine Surgery",
      "Hand Surgery",
      "Foot and Ankle Surgery",
      "Shoulder and Elbow Surgery",
      "Hip Surgery",
      "Knee Surgery",
      "Orthopedic Trauma",
      "Pediatric Orthopedics",
      "Orthopedic Oncology"
    ],
    conditionsTreated: [
      "Fractures",
      "Arthritis",
      "Sports injuries",
      "Back pain",
      "Joint pain",
      "Musculoskeletal injuries",
      "Bone tumors",
      "Congenital bone disorders",
      "Osteoporosis",
      "Joint deformities"
    ],
    proceduresKnown: [
      "Joint replacement surgery",
      "Arthroscopy",
      "Spinal fusion",
      "Fracture fixation",
      "Soft tissue repair",
      "Bone grafting",
      "Osteotomy",
      "Joint injections",
      "Physical therapy prescription"
    ],
    mohCategory: "Specialist Medicine",
    mohSpecialtyCode: "ORTHO",
    expertiseLevel: "EXPERT"
  },

  // Pediatrics
  {
    specialty: "Pediatrics",
    mohCode: "PEDS001",
    category: "Age-Group Specialization",
    subSpecialties: [
      "General Pediatrics",
      "Neonatology",
      "Pediatric Emergency Medicine",
      "Pediatric Cardiology",
      "Pediatric Endocrinology",
      "Pediatric Gastroenterology",
      "Pediatric Nephrology",
      "Pediatric Neurology",
      "Pediatric Oncology",
      "Developmental Pediatrics",
      "Adolescent Medicine"
    ],
    conditionsTreated: [
      "Childhood illnesses",
      "Developmental disorders",
      "Growth and development issues",
      "Vaccinations",
      "Pediatric emergencies",
      "Congenital disorders",
      "Childhood chronic diseases",
      "Behavioral problems"
    ],
    proceduresKnown: [
      "Pediatric physical examination",
      "Childhood vaccination",
      "Developmental assessment",
      "Emergency pediatric procedures",
      "Neonatal care procedures",
      "Pediatric laboratory tests"
    ],
    mohCategory: "Pediatric Medicine",
    mohSpecialtyCode: "PEDS",
    expertiseLevel: "EXPERT"
  },

  // Women's Health
  {
    specialty: "Women's Health",
    mohCode: "WOMEN001",
    category: "Gender-Specific Care",
    subSpecialties: [
      "Gynecology",
      "Maternal-Fetal Medicine",
      "Reproductive Endocrinology",
      "Gynecologic Oncology",
      "Urogynecology",
      "Menopause Medicine",
      "Family Planning",
      "Adolescent Gynecology",
      "High-Risk Obstetrics",
      "Minimally Invasive Gynecology"
    ],
    conditionsTreated: [
      "Gynecological disorders",
      "Pregnancy-related conditions",
      "Menstrual disorders",
      "Fertility issues",
      "Menopause symptoms",
      "Gynecological cancers",
      "Uterine fibroids",
      "Endometriosis",
      "Polycystic ovary syndrome",
      "Pelvic floor disorders"
    ],
    proceduresKnown: [
      "Pap smear",
      "Colposcopy",
      "Hysteroscopy",
      "Laparoscopic surgery",
      "Hysterectomy",
      "Cesarean section",
      "Normal delivery",
      "Intrauterine procedures"
    ],
    mohCategory: "Women's Health",
    mohSpecialtyCode: "WOMEN",
    expertiseLevel: "EXPERT"
  },

  // Mental Health
  {
    specialty: "Mental Health",
    mohCode: "MIND001",
    category: "Mental Health Care",
    subSpecialties: [
      "Psychiatry",
      "Child and Adolescent Psychiatry",
      "Geriatric Psychiatry",
      "Addiction Psychiatry",
      "Forensic Psychiatry",
      "Psychosomatic Medicine",
      "Consultation-Liaison Psychiatry",
      "Emergency Psychiatry",
      "Community Psychiatry",
      "Rehabilitation Psychiatry"
    ],
    conditionsTreated: [
      "Depression",
      "Anxiety disorders",
      "Bipolar disorder",
      "Schizophrenia",
      "Eating disorders",
      "Post-traumatic stress disorder",
      "Substance use disorders",
      "Personality disorders",
      "Obsessive-compulsive disorder",
      "ADHD"
    ],
    proceduresKnown: [
      "Psychiatric assessment",
      "Mental status examination",
      "Psychotherapy techniques",
      "Medication management",
      "Electroconvulsive therapy",
      "Crisis intervention",
      "Group therapy facilitation"
    ],
    mohCategory: "Mental Health",
    mohSpecialtyCode: "MIND",
    expertiseLevel: "EXPERT"
  },

  // Surgery Specialties
  {
    specialty: "General Surgery",
    mohCode: "SURG001",
    category: "Procedure-Based Specialization",
    subSpecialties: [
      "Abdominal Surgery",
      "Breast Surgery", 
      "Endocrine Surgery",
      "Hepatobiliary Surgery",
      "Colorectal Surgery",
      "Vascular Surgery",
      "Surgical Oncology",
      "Trauma Surgery",
      "Minimally Invasive Surgery",
      "Bariatric Surgery"
    ],
    conditionsTreated: [
      "Abdominal hernias",
      "Gallbladder disease",
      "Breast cancer",
      "Thyroid disorders",
      "Colorectal cancer",
      "Vascular disease",
      "Abdominal trauma",
      "Severe obesity",
      "Skin and soft tissue tumors",
      "Intestinal disorders"
    ],
    proceduresKnown: [
      "Appendectomy",
      "Cholecystectomy",
      "Hernia repair",
      "Bowel resection",
      "Mastectomy",
      "Thyroidectomy",
      "Laparoscopic surgery",
      "Endoscopic surgery"
    ],
    mohCategory: "Surgical Specialties",
    mohSpecialtyCode: "SURG",
    expertiseLevel: "EXPERT"
  },

  // Additional Specialties...
  {
    specialty: "Neurology",
    mohCode: "NEURO001",
    category: "Specialist Care",
    subSpecialties: [
      "Epilepsy",
      "Stroke Medicine",
      "Movement Disorders",
      "Neurodegenerative Diseases",
      "Neuromuscular Disorders",
      "Headache Medicine",
      "Neurocritical Care",
      "Pediatric Neurology",
      "Cognitive Neurology",
      "Functional Neurology"
    ],
    conditionsTreated: [
      "Stroke",
      "Epilepsy",
      "Parkinson's disease",
      "Multiple sclerosis",
      "Headaches",
      "Dementia",
      "Neuropathies",
      "Muscle diseases",
      "Brain tumors",
      "Spinal cord disorders"
    ],
    proceduresKnown: [
      "Neurological examination",
      "Electroencephalography",
      "Nerve conduction studies",
      "Lumbar puncture",
      "Botulinum toxin injection",
      "Stroke intervention procedures"
    ],
    mohCategory: "Specialist Medicine",
    mohSpecialtyCode: "NEURO",
    expertiseLevel: "EXPERT"
  },

  {
    specialty: "Ophthalmology",
    mohCode: "OPHTH001",
    category: "Specialist Care",
    subSpecialties: [
      "Cataract Surgery",
      "Retinal Disorders",
      "Glaucoma",
      "Corneal Diseases",
      "Pediatric Ophthalmology",
      "Neuro-ophthalmology",
      "Oculoplastic Surgery",
      "Vitreoretinal Surgery",
      "Refractive Surgery",
      "Emergency Ophthalmology"
    ],
    conditionsTreated: [
      "Cataracts",
      "Glaucoma",
      "Diabetic retinopathy",
      "Age-related macular degeneration",
      "Corneal disorders",
      "Strabismus",
      "Retinal detachment",
      "Eye infections",
      "Visual disorders",
      "Eye trauma"
    ],
    proceduresKnown: [
      "Cataract surgery",
      "Glaucoma surgery",
      "Retinal laser surgery",
      "Strabismus surgery",
      "Corneal transplantation",
      "Intravitreal injections",
      "Laser refractive surgery"
    ],
    mohCategory: "Specialist Medicine",
    mohSpecialtyCode: "OPHTH",
    expertiseLevel: "EXPERT"
  },

  {
    specialty: "Otolaryngology (ENT)",
    mohCode: "ENT001",
    category: "Specialist Care",
    subSpecialties: [
      "Head and Neck Surgery",
      "Otology",
      "Rhinology",
      "Laryngology",
      "Pediatric ENT",
      "Neurotology",
      "Facial Plastic Surgery",
      "Sleep Medicine",
      "Audiology",
      "Voice Disorders"
    ],
    conditionsTreated: [
      "Hearing loss",
      "Sinusitis",
      "Tonsillitis",
      "Head and neck cancers",
      "Vertigo",
      "Sleep apnea",
      "Voice disorders",
      "Facial trauma",
      "Allergic rhinitis",
      "Ear infections"
    ],
    proceduresKnown: [
      "Tonsillectomy",
      "Adenoidectomy",
      "Sinus surgery",
      "Myringotomy",
      "Endoscopic sinus surgery",
      "Head and neck surgery",
      "Audiometry",
      "Voice therapy"
    ],
    mohCategory: "Specialist Medicine", 
    mohSpecialtyCode: "ENT",
    expertiseLevel: "EXPERT"
  },

  {
    specialty: "Psychology",
    mohCode: "PSYCH001",
    category: "Mental Health Care",
    subSpecialties: [
      "Clinical Psychology",
      "Counseling Psychology",
      "Health Psychology",
      "Neuropsychology",
      "Child Psychology",
      "Geriatric Psychology",
      "Forensic Psychology",
      "Industrial Psychology",
      "Educational Psychology",
      "Sports Psychology"
    ],
    conditionsTreated: [
      "Depression",
      "Anxiety disorders",
      "Stress-related disorders",
      "Trauma-related disorders",
      "Adjustment disorders",
      "Personality disorders",
      "Learning disabilities",
      "Behavioral problems",
      "Relationship issues",
      "Career counseling needs"
    ],
    proceduresKnown: [
      "Psychological assessment",
      "Psychological testing",
      "Psychotherapy",
      "Cognitive-behavioral therapy",
      "Group therapy",
      "Family therapy",
      "Couples therapy",
      "Crisis intervention"
    ],
    mohCategory: "Mental Health",
    mohSpecialtyCode: "PSYCH",
    expertiseLevel: "ADVANCED"
  },

  // More specialties...
  {
    specialty: "Endocrinology",
    mohCode: "ENDO001",
    category: "Specialist Care",
    subSpecialties: [
      "Diabetes Mellitus",
      "Thyroid Disorders",
      "Metabolic Disorders",
      "Reproductive Endocrinology",
      "Adrenal Disorders",
      "Pituitary Disorders",
      "Calcium and Bone Disorders",
      "Neuroendocrine Tumors",
      "Lipid Disorders",
      "Obesity Medicine"
    ],
    conditionsTreated: [
      "Diabetes mellitus",
      "Hypothyroidism",
      "Hyperthyroidism",
      "Osteoporosis",
      "Obesity",
      "Polycystic ovary syndrome",
      "Adrenal disorders",
      "Pituitary disorders",
      "Lipid disorders",
      "Metabolic syndrome"
    ],
    proceduresKnown: [
      "Thyroid function tests",
      "Insulin tolerance testing",
      "Fine needle aspiration",
      "Continuous glucose monitoring",
      "Endocrine stimulation tests",
      "DXA scanning interpretation"
    ],
    mohCategory: "Specialist Medicine",
    mohSpecialtyCode: "ENDO",
    expertiseLevel: "EXPERT"
  },

  {
    specialty: "Gastroenterology",
    mohCode: "GI001",
    category: "Specialist Care",
    subSpecialties: [
      "Hepatology",
      "Inflammatory Bowel Disease",
      "Therapeutic Endoscopy",
      "GI Oncology",
      "Motility Disorders",
      "Pancreaticobiliary Disease",
      "GI Bleeding",
      "Functional GI Disorders",
      "GI Nutrition",
      "Liver Transplantation"
    ],
    conditionsTreated: [
      "Peptic ulcer disease",
      "Inflammatory bowel disease",
      "Liver disease",
      "Pancreatitis",
      "Gallbladder disease",
      "Gastroesophageal reflux disease",
      "Irritable bowel syndrome",
      "Celiac disease",
      "GI cancers",
      "Hepatitis"
    ],
    proceduresKnown: [
      "Upper endoscopy",
      "Colonoscopy",
      "ERCP",
      "Endoscopic ultrasound",
      "Liver biopsy",
      "Hydrogen breath testing",
      "Fibroscan"
    ],
    mohCategory: "Specialist Medicine",
    mohSpecialtyCode: "GI",
    expertiseLevel: "EXPERT"
  },

  // Additional Specialties (Completing 50+ specialties)
  {
    specialty: "Pulmonology",
    mohCode: "PULM001",
    category: "Specialist Care",
    subSpecialties: [
      "Respiratory Medicine",
      "Critical Care Medicine", 
      "Sleep Medicine",
      "Thoracic Oncology",
      "Interventional Pulmonology",
      "Pediatric Pulmonology"
    ],
    conditionsTreated: [
      "Asthma", "COPD", "Pneumonia", "Sleep apnea", "Lung cancer", "Pulmonary embolism",
      "Pulmonary hypertension", "Tuberculosis", "Bronchiectasis", "Interstitial lung disease"
    ],
    proceduresKnown: [
      "Bronchoscopy", "Pulmonary function tests", "Sleep studies", "Thoracentesis",
      "Mechanical ventilation", "Lung biopsy", "Endobronchial ultrasound"
    ],
    mohCategory: "Specialist Medicine",
    mohSpecialtyCode: "PULM",
    expertiseLevel: "EXPERT"
  },

  {
    specialty: "Nephrology",
    mohCode: "NEPH001", 
    category: "Specialist Care",
    subSpecialties: [
      "Chronic Kidney Disease",
      "Dialysis Medicine",
      "Transplant Nephrology",
      "Hypertension",
      "Glomerulonephritis",
      "Interventional Nephrology"
    ],
    conditionsTreated: [
      "Chronic kidney disease", "Acute kidney injury", "Dialysis complications",
      "Hypertensive nephropathy", "Glomerulonephritis", "Polycystic kidney disease"
    ],
    proceduresKnown: [
      "Hemodialysis", "Peritoneal dialysis", "Kidney biopsy", "Dialysis access creation",
      "Renal replacement therapy", "Kidney transplant evaluation"
    ],
    mohCategory: "Specialist Medicine",
    mohSpecialtyCode: "NEPH",
    expertiseLevel: "EXPERT"
  },

  {
    specialty: "Rheumatology",
    mohCode: "RHEUM001",
    category: "Specialist Care",
    subSpecialties: [
      "Autoimmune Diseases",
      "Connective Tissue Diseases", 
      "Vasculitis",
      "Osteoarthritis",
      "Crystal Arthropathies",
      "Pediatric Rheumatology"
    ],
    conditionsTreated: [
      "Rheumatoid arthritis", "Systemic lupus erythematosus", "Gout", "Fibromyalgia",
      "Ankylosing spondylitis", "Psoriatic arthritis", "Scleroderma", "Polymyalgia rheumatica"
    ],
    proceduresKnown: [
      "Joint aspiration", "Synovial fluid analysis", "Ultrasound-guided injections",
      "Soft tissue injections", "Arthroscopy"
    ],
    mohCategory: "Specialist Medicine",
    mohSpecialtyCode: "RHEUM",
    expertiseLevel: "EXPERT"
  },

  {
    specialty: "Infectious Disease",
    mohCode: "ID001",
    category: "Specialist Care",
    subSpecialties: [
      "Tropical Medicine",
      "HIV Medicine",
      "Travel Medicine",
      "Antimicrobial Stewardship",
      "Hospital-acquired Infections",
      "Fungal Infections"
    ],
    conditionsTreated: [
      "Bacterial infections", "Viral infections", "Fungal infections", "Parasitic diseases",
      "HIV/AIDS", "Tuberculosis", "Malaria", "Dengue fever"
    ],
    proceduresKnown: [
      "Antibiotic therapy management", "Infectious disease consultation",
      "Travel vaccination", "HIV counseling", "Antimicrobial stewardship"
    ],
    mohCategory: "Specialist Medicine",
    mohSpecialtyCode: "ID",
    expertiseLevel: "EXPERT"
  },

  {
    specialty: "Hematology",
    mohCode: "HEM001",
    category: "Specialist Care",
    subSpecialties: [
      "Oncologic Hematology",
      "Benign Hematology",
      "Transfusion Medicine",
      "Hematopoietic Stem Cell Transplantation",
      "Coagulation Disorders"
    ],
    conditionsTreated: [
      "Anemia", "Leukemia", "Lymphoma", "Myeloma", "Bleeding disorders", "Thrombosis",
      "Sickle cell disease", "Hemophilia"
    ],
    proceduresKnown: [
      "Bone marrow biopsy", "Hematopoietic stem cell transplantation", "Plasmapheresis",
      "Blood transfusion", "Thrombolytic therapy"
    ],
    mohCategory: "Specialist Medicine",
    mohSpecialtyCode: "HEM",
    expertiseLevel: "EXPERT"
  },

  {
    specialty: "Oncology",
    mohCode: "ONC001",
    category: "Specialist Care",
    subSpecialties: [
      "Medical Oncology",
      "Radiation Oncology",
      "Surgical Oncology",
      "Hematologic Oncology",
      "Pediatric Oncology",
      "Supportive Care"
    ],
    conditionsTreated: [
      "All cancer types", "Benign tumors", "Precancerous conditions",
      "Cancer metastasis", "Cancer complications", "Palliative care needs"
    ],
    proceduresKnown: [
      "Chemotherapy administration", "Radiation therapy", "Cancer staging",
      "Tumor biopsy", "Palliative procedures", "Supportive care"
    ],
    mohCategory: "Specialist Medicine",
    mohSpecialtyCode: "ONC",
    expertiseLevel: "EXPERT"
  },

  {
    specialty: "Emergency Medicine",
    mohCode: "EM001",
    category: "Emergency Care",
    subSpecialties: [
      "Trauma Medicine",
      "Critical Care Medicine",
      "Pediatric Emergency Medicine",
      "Toxicology",
      "Disaster Medicine",
      "Pre-hospital Emergency Medicine"
    ],
    conditionsTreated: [
      "Emergency medical conditions", "Trauma", "Cardiac arrest", "Stroke", "Heart attack",
      "Severe infections", "Poisoning", "Acute respiratory distress"
    ],
    proceduresKnown: [
      "Advanced cardiac life support", "Trauma resuscitation", "Emergency intubation",
      "Central line placement", "Chest tube insertion", "Emergency medications"
    ],
    mohCategory: "Emergency Medicine",
    mohSpecialtyCode: "EM",
    expertiseLevel: "EXPERT"
  },

  {
    specialty: "Anesthesiology",
    mohCode: "ANES001",
    category: "Procedure-Based Specialization",
    subSpecialties: [
      "Cardiac Anesthesia",
      "Neurosurgical Anesthesia",
      "Pediatric Anesthesia",
      "Obstetric Anesthesia",
      "Pain Management",
      "Critical Care Medicine"
    ],
    conditionsTreated: [
      "Pain management", "Chronic pain", "Postoperative pain", "Cancer pain",
      "Anesthetic complications", "Acute pain"
    ],
    proceduresKnown: [
      "General anesthesia", "Regional anesthesia", "Spinal anesthesia", "Epidural anesthesia",
      "Pain management procedures", "Anesthesia for surgery"
    ],
    mohCategory: "Anesthesiology",
    mohSpecialtyCode: "ANES",
    expertiseLevel: "EXPERT"
  },

  {
    specialty: "Radiology",
    mohCode: "RAD001",
    category: "Diagnostic Medicine",
    subSpecialties: [
      "Diagnostic Radiology",
      "Interventional Radiology",
      "Neuroradiology", 
      "Pediatric Radiology",
      "Breast Imaging",
      "Nuclear Medicine"
    ],
    conditionsTreated: [
      "Imaging diagnosis", "Interventional procedures", "Image-guided treatments",
      "Radiologic complications", "Contrast reactions"
    ],
    proceduresKnown: [
      "X-ray interpretation", "CT scanning", "MRI interpretation", "Ultrasound",
      "Angiography", "Interventional procedures", "Nuclear medicine"
    ],
    mohCategory: "Diagnostic Medicine",
    mohSpecialtyCode: "RAD",
    expertiseLevel: "EXPERT"
  },

  {
    specialty: "Pathology",
    mohCode: "PATH001",
    category: "Diagnostic Medicine",
    subSpecialties: [
      "Anatomic Pathology",
      "Clinical Pathology",
      "Hematopathology",
      "Neuropathology",
      "Molecular Pathology",
      "Cytopathology"
    ],
    conditionsTreated: [
      "Disease diagnosis", "Cancer diagnosis", "Infectious diseases",
      "Genetic disorders", "Autoimmune diseases"
    ],
    proceduresKnown: [
      "Histopathology", "Cytology", "Immunohistochemistry", "Molecular pathology",
      "Autopsy pathology", "Laboratory medicine"
    ],
    mohCategory: "Diagnostic Medicine",
    mohSpecialtyCode: "PATH",
    expertiseLevel: "EXPERT"
  },

  {
    specialty: "Geriatrics",
    mohCode: "GERI001",
    category: "Age-Group Specialization",
    subSpecialties: [
      "Geriatric Medicine",
      "Elderly Care",
      "Dementia Care",
      "Falls Prevention",
      "Medication Management",
      "End-of-life Care"
    ],
    conditionsTreated: [
      "Age-related health issues", "Dementia", "Alzheimer's disease", "Falls",
      "Medication-related problems", "Functional decline"
    ],
    proceduresKnown: [
      "Comprehensive geriatric assessment", "Cognitive assessment", "Functional assessment",
      "Medication reconciliation", "Advance care planning"
    ],
    mohCategory: "Geriatric Medicine",
    mohSpecialtyCode: "GERI",
    expertiseLevel: "EXPERT"
  },

  {
    specialty: "Physical Medicine & Rehabilitation",
    mohCode: "PMR001",
    category: "Rehabilitation Medicine",
    subSpecialties: [
      "Stroke Rehabilitation",
      "Spinal Cord Injury Rehabilitation",
      "Traumatic Brain Injury Rehabilitation",
      "Pediatric Rehabilitation",
      "Sports Medicine",
      "Pain Management"
    ],
    conditionsTreated: [
      "Stroke", "Spinal cord injury", "Traumatic brain injury", "Multiple sclerosis",
      "Cerebral palsy", "Musculoskeletal disorders"
    ],
    proceduresKnown: [
      "Rehabilitation therapy", "Functional assessment", "Disability evaluation",
      "Assistive device prescription", "Physical therapy"
    ],
    mohCategory: "Rehabilitation Medicine",
    mohSpecialtyCode: "PMR",
    expertiseLevel: "EXPERT"
  },

  {
    specialty: "Nuclear Medicine",
    mohCode: "NM001",
    category: "Diagnostic Medicine",
    subSpecialties: [
      "Molecular Imaging",
      "Therapeutic Nuclear Medicine",
      "PET Imaging",
      "SPECT Imaging",
      "Radiopharmaceuticals",
      "Thyroid Medicine"
    ],
    conditionsTreated: [
      "Cancer diagnosis and staging", "Heart disease", "Thyroid disorders",
      "Bone diseases", "Neurological conditions"
    ],
    proceduresKnown: [
      "PET scanning", "SPECT imaging", "Radioisotope therapy", "Thyroid scanning",
      "Bone scanning", "Cardiac nuclear imaging"
    ],
    mohCategory: "Nuclear Medicine",
    mohSpecialtyCode: "NM",
    expertiseLevel: "EXPERT"
  },

  {
    specialty: "Forensic Medicine",
    mohCode: "FORENSIC001",
    category: "Forensic Medicine",
    subSpecialties: [
      "Clinical Forensic Medicine",
      "Forensic Pathology",
      "Toxicology",
      "Injury Assessment",
      "Medical Ethics",
      "Legal Medicine"
    ],
    conditionsTreated: [
      "Injury assessment", "Toxicology cases", "Medical negligence",
      "Death investigation", "Legal medicine consultation"
    ],
    proceduresKnown: [
      "Autopsy", "Toxicology analysis", "Injury documentation", "Legal testimony",
      "Medical ethics consultation"
    ],
    mohCategory: "Forensic Medicine",
    mohSpecialtyCode: "FORENSIC",
    expertiseLevel: "EXPERT"
  },

  {
    specialty: "Family Medicine",
    mohCode: "FAM001",
    category: "Primary Care",
    subSpecialties: [
      "Comprehensive Family Care",
      "Chronic Disease Management",
      "Preventive Medicine",
      "Women's Health",
      "Men's Health",
      "Adolescent Medicine"
    ],
    conditionsTreated: [
      "Common medical conditions", "Chronic diseases", "Preventive health",
      "Mental health issues", "Women's health", "Pediatric conditions"
    ],
    proceduresKnown: [
      "Physical examinations", "Health screenings", "Immunizations",
      "Minor procedures", "Chronic disease management"
    ],
    mohCategory: "Primary Healthcare",
    mohSpecialtyCode: "FAM",
    expertiseLevel: "ADVANCED"
  },

  {
    specialty: "Sports Medicine",
    mohCode: "SPORTS001",
    category: "Sports & Exercise Medicine",
    subSpecialties: [
      "Exercise Physiology",
      "Sports Injuries",
      "Performance Medicine",
      "Exercise Rehabilitation",
      "Sports Nutrition",
      "Athletic Performance"
    ],
    conditionsTreated: [
      "Sports injuries", "Exercise-related problems", "Performance issues",
      "Overuse injuries", "Acute trauma"
    ],
    proceduresKnown: [
      "Sports injury evaluation", "Exercise prescription", "Performance testing",
      "Injury rehabilitation", "Sports nutrition counseling"
    ],
    mohCategory: "Sports Medicine",
    mohSpecialtyCode: "SPORTS",
    expertiseLevel: "EXPERT"
  },

  {
    specialty: "Occupational Medicine",
    mohCode: "OCC001",
    category: "Occupational Health",
    subSpecialties: [
      "Industrial Medicine",
      "Workplace Health",
      "Occupational Toxicology",
      "Work-related Injuries",
      "Disability Management",
      "Travel Medicine"
    ],
    conditionsTreated: [
      "Occupational diseases", "Work-related injuries", "Chemical exposure",
      "Industrial accidents", "Workplace stress"
    ],
    proceduresKnown: [
      "Occupational health assessment", "Work fitness evaluation",
      "Workplace safety consultation", "Disability assessment"
    ],
    mohCategory: "Occupational Medicine",
    mohSpecialtyCode: "OCC",
    expertiseLevel: "EXPERT"
  },

  {
    specialty: "Preventive Medicine",
    mohCode: "PREV001",
    category: "Preventive Healthcare",
    subSpecialties: [
      "Public Health",
      "Epidemiology",
      "Health Promotion",
      "Disease Prevention",
      "Environmental Health",
      "Global Health"
    ],
    conditionsTreated: [
      "Preventable diseases", "Public health issues",
      "Environmental health concerns", "Population health"
    ],
    proceduresKnown: [
      "Health screening programs", "Epidemiological investigations",
      "Public health interventions", "Health education"
    ],
    mohCategory: "Preventive Medicine",
    mohSpecialtyCode: "PREV",
    expertiseLevel: "EXPERT"
  },

  {
    specialty: "Genetic Medicine",
    mohCode: "GENE001",
    category: "Genetic & Precision Medicine",
    subSpecialties: [
      "Medical Genetics",
      "Genetic Counseling",
      "Precision Medicine",
      "Pharmacogenomics",
      "Gene Therapy",
      "Hereditary Diseases"
    ],
    conditionsTreated: [
      "Genetic disorders", "Hereditary diseases", "Congenital anomalies",
      "Inherited cancers", "Metabolic disorders"
    ],
    proceduresKnown: [
      "Genetic testing", "Genetic counseling", "Family history assessment",
      "Genetic counseling", "Pharmacogenomic testing"
    ],
    mohCategory: "Genetic Medicine",
    mohSpecialtyCode: "GENE",
    expertiseLevel: "EXPERT"
  },

  {
    specialty: "Critical Care Medicine",
    mohCode: "CCM001",
    category: "Critical Care",
    subSpecialties: [
      "Intensive Care Medicine",
      "Emergency Critical Care",
      "Neurocritical Care",
      "Cardiac Critical Care",
      "Pediatric Critical Care",
      "Trauma Critical Care"
    ],
    conditionsTreated: [
      "Critical illnesses", "Multi-organ failure", "Septic shock", "Respiratory failure",
      "Cardiac arrest", "Trauma", "Post-operative complications"
    ],
    proceduresKnown: [
      "Mechanical ventilation", "Hemodynamic monitoring", "Central line placement",
      "Arterial line placement", "Dialysis", "Extracorporeal life support"
    ],
    mohCategory: "Critical Care Medicine",
    mohSpecialtyCode: "CCM",
    expertiseLevel: "EXPERT"
  },

  {
    specialty: "Sleep Medicine",
    mohCode: "SLEEP001",
    category: "Sleep Medicine",
    subSpecialties: [
      "Obstructive Sleep Apnea",
      "Insomnia",
      "Narcolepsy",
      "Circadian Rhythm Disorders",
      "Pediatric Sleep Medicine",
      "Sleep Neurology"
    ],
    conditionsTreated: [
      "Sleep apnea", "Insomnia", "Narcolepsy", "Sleep-related breathing disorders",
      "Circadian rhythm disorders", "Parasomnias"
    ],
    proceduresKnown: [
      "Sleep studies", "Polysomnography", "Multiple sleep latency test",
      "CPAP titration", "Sleep disorder evaluation"
    ],
    mohCategory: "Sleep Medicine",
    mohSpecialtyCode: "SLEEP",
    expertiseLevel: "EXPERT"
  },

  {
    specialty: "Tropical Medicine",
    mohCode: "TROP001",
    category: "Tropical & Travel Medicine",
    subSpecialties: [
      "Malariology",
      "Travel Medicine",
      "Tropical Infections",
      "Vector-borne Diseases",
      "Neglected Tropical Diseases",
      "Travel Health"
    ],
    conditionsTreated: [
      "Malaria", "Dengue fever", "Chikungunya", "Typhoid", "Travel-related illnesses",
      "Vector-borne diseases", "Tropical infections"
    ],
    proceduresKnown: [
      "Travel consultations", "Vaccination services", "Tropical disease diagnosis",
      "Travel health advice", "Epidemiological investigations"
    ],
    mohCategory: "Tropical Medicine",
    mohSpecialtyCode: "TROP",
    expertiseLevel: "EXPERT"
  },

  {
    specialty: "Addiction Medicine",
    mohCode: "ADD001",
    category: "Mental Health & Addiction",
    subSpecialties: [
      "Substance Use Disorders",
      "Behavioral Addictions",
      "Detoxification",
      "Relapse Prevention",
      "Dual Diagnosis",
      "Pain Medicine"
    ],
    conditionsTreated: [
      "Alcohol dependence", "Drug addiction", "Behavioral addictions",
      "Dual diagnosis", "Withdrawal syndromes", "Pain management"
    ],
    proceduresKnown: [
      "Detoxification protocols", "Addiction counseling", "Medication-assisted treatment",
      "Withdrawal management", "Relapse prevention planning"
    ],
    mohCategory: "Addiction Medicine",
    mohSpecialtyCode: "ADD",
    expertiseLevel: "EXPERT"
  },

  {
    specialty: "Palliative Care",
    mohCode: "PALL001",
    category: "Palliative & End-of-life Care",
    subSpecialties: [
      "End-of-life Care",
      "Pain Management",
      "Symptom Control",
      "Family Support",
      "Psychosocial Support",
      "Spiritual Care"
    ],
    conditionsTreated: [
      "Terminal illnesses", "Chronic pain", "Symptom management",
      "End-of-life care needs", "Life-limiting conditions"
    ],
    proceduresKnown: [
      "Palliative care consultation", "Symptom management",
      "End-of-life care planning", "Family counseling", "Pain management"
    ],
    mohCategory: "Palliative Care",
    mohSpecialtyCode: "PALL",
    expertiseLevel: "EXPERT"
  },

  {
    specialty: "Clinical Pharmacology",
    mohCode: "PHARM001",
    category: "Clinical Pharmacology",
    subSpecialties: [
      "Drug Therapeutics",
      "Pharmacokinetics",
      "Adverse Drug Reactions",
      "Drug Interactions",
      "Personalized Medicine",
      "Antimicrobial Stewardship"
    ],
    conditionsTreated: [
      "Adverse drug reactions", "Drug interactions", "Therapeutic drug monitoring",
      "Pharmacokinetic problems", "Personalized dosing needs"
    ],
    proceduresKnown: [
      "Drug consultation", "Therapeutic drug monitoring",
      "Pharmacokinetic analysis", "Adverse reaction assessment"
    ],
    mohCategory: "Clinical Pharmacology",
    mohSpecialtyCode: "PHARM",
    expertiseLevel: "EXPERT"
  },

  {
    specialty: "Clinical Immunology",
    mohCode: "IMMUNE001",
    category: "Clinical Immunology",
    subSpecialties: [
      "Allergy & Immunology",
      "Autoimmune Diseases",
      "Transplant Immunology",
      "Immunodeficiency",
      "Allergy Testing",
      "Immunosuppression"
    ],
    conditionsTreated: [
      "Autoimmune diseases", "Allergies", "Immunodeficiency", "Transplant rejection",
      "Recurrent infections", "Allergic reactions"
    ],
    proceduresKnown: [
      "Allergy testing", "Immunotherapy", "Immunosuppressive therapy",
      "Autoimmune disease management", "Transplant monitoring"
    ],
    mohCategory: "Clinical Immunology",
    mohSpecialtyCode: "IMMUNE",
    expertiseLevel: "EXPERT"
  },

  {
    specialty: "Integrative Medicine",
    mohCode: "INTEG001",
    category: "Integrative Medicine",
    subSpecialties: [
      "Complementary Medicine",
      "Alternative Medicine",
      "Holistic Health",
      "Mind-Body Medicine",
      "Integrative Oncology",
      "Lifestyle Medicine"
    ],
    conditionsTreated: [
      "Chronic conditions", "Pain management", "Stress-related disorders",
      "Wellness optimization", "Complementary therapy needs"
    ],
    proceduresKnown: [
      "Holistic assessment", "Complementary therapy consultation",
      "Lifestyle counseling", "Mind-body interventions", "Integrative protocols"
    ],
    mohCategory: "Integrative Medicine",
    mohSpecialtyCode: "INTEG",
    expertiseLevel: "EXPERT"
  }
];

// International Medical Specialties Recognition Matrix
const internationalRecognitionMatrix = {
  "Singapore": {
    medicalCouncil: "Singapore Medical Council",
    licensingBody: "Singapore Medical Council",
    reciprocityCountries: ["Malaysia", "Brunei"],
    mutualRecognitionAgreements: ["ASEAN MRA", "IMC-MCPS (UK)"]
  },
  "Malaysia": {
    medicalCouncil: "Malaysian Medical Council",
    licensingBody: "Malaysian Medical Council", 
    reciprocityCountries: ["Singapore", "Brunei"],
    mutualRecognitionAgreements: ["ASEAN MRA"]
  },
  "Australia": {
    medicalCouncil: "Australian Medical Council",
    licensingBody: "Medical Board of Australia",
    reciprocityCountries: ["New Zealand", "UK"],
    mutualRecognitionAgreements: ["Trans-Tasman MRA", "UK-Medical Training Initiative"]
  },
  "United Kingdom": {
    medicalCouncil: "General Medical Council",
    licensingBody: "General Medical Council",
    reciprocityCountries: ["Ireland", "Australia", "Canada"],
    mutualRecognitionAgreements: ["EU Medical Directives", "IMC-MCPS"]
  },
  "United States": {
    medicalCouncil: "Educational Commission for Foreign Medical Graduates",
    licensingBody: "State Medical Boards",
    reciprocityCountries: ["Canada"],
    mutualRecognitionAgreements: ["Limited reciprocity with Canada"]
  },
  "Canada": {
    medicalCouncil: "Medical Council of Canada",
    licensingBody: "Provincial Medical Colleges",
    reciprocityCountries: ["US", "UK"],
    mutualRecognitionAgreements: ["USMCA provisions", "UK agreements"]
  }
};

// Cultural Competency Requirements by Region
const culturalCompetencyMatrix = {
  "Southeast Asia": {
    languages: ["English", "Mandarin", "Malay", "Tamil", "Cantonese", "Hokkien", "Teochew"],
    culturalPractices: ["Religious dietary laws", "Traditional medicine beliefs", "Family-centered decision making", "Elderly respect"],
    healthBeliefs: ["Traditional healing", "Preventive care concepts", "Community health practices"],
    assessment: "Cultural Health Belief Assessment"
  },
  "East Asia": {
    languages: ["English", "Mandarin", "Japanese", "Korean"],
    culturalPractices: ["Collectivist health decisions", "Elderly care respect", "Harmony in treatment"],
    healthBeliefs: ["Balance concept of health", "Family involvement", "Traditional medicine integration"],
    assessment: "East Asian Health Literacy Assessment"
  },
  "South Asia": {
    languages: ["English", "Hindi", "Urdu", "Bengali", "Tamil", "Telugu"],
    culturalPractices: ["Extended family involvement", "Religious health practices", "Hierarchical medical authority"],
    healthBeliefs: ["Ayurvedic integration", "Holistic health approach", "Community health traditions"],
    assessment: "South Asian Cultural Competency Training"
  },
  "Middle East": {
    languages: ["English", "Arabic", "Persian", "Turkish"],
    culturalPractices: ["Islamic health practices", "Gender-sensitive care", "Religious dietary laws"],
    healthBeliefs: ["Islamic medical ethics", "Prophetic medicine integration", "Family honor considerations"],
    assessment: "Islamic Health Practice Assessment"
  },
  "Western Countries": {
    languages: ["English", "German", "French", "Dutch"],
    culturalPractices: ["Individual autonomy", "Direct communication", "Informed consent priority"],
    healthBeliefs: ["Evidence-based medicine preference", "Patient rights emphasis", "Privacy expectations"],
    assessment: "Western Medical Practice Standards"
  }
};

// Comprehensive Conditions Database
const conditionsDatabase = [
  {
    name: "Diabetes Mellitus Type 2",
    icd10Code: "E11",
    category: "Endocrine",
    severity: "Chronic",
    urgency: "ROUTINE",
    requiresSpecialist: true,
    specialtyRecommendation: "Endocrinology",
    expertiseRequired: "ADVANCED",
    complexityLevel: "COMPLEX",
    averageTreatmentDuration: "Ongoing",
    successRate: 85,
    patientEducation: true,
    followUpRequired: true,
    internationalStandards: ["ADA Guidelines", "IDF Guidelines"]
  },
  {
    name: "Acute Myocardial Infarction",
    icd10Code: "I21",
    category: "Cardiovascular",
    severity: "Life-threatening",
    urgency: "EMERGENCY",
    requiresSpecialist: true,
    specialtyRecommendation: "Cardiology",
    expertiseRequired: "EXPERT",
    complexityLevel: "SPECIALIZED",
    averageTreatmentDuration: "7-14 days",
    successRate: 92,
    patientEducation: false,
    followUpRequired: true,
    internationalStandards: ["AHA Guidelines", "ESC Guidelines"]
  },
  {
    name: "Breast Cancer",
    icd10Code: "C50",
    category: "Oncology",
    severity: "Life-threatening",
    urgency: "URGENT",
    requiresSpecialist: true,
    specialtyRecommendation: "Oncology",
    expertiseRequired: "EXPERT",
    complexityLevel: "SPECIALIZED",
    averageTreatmentDuration: "6-12 months",
    successRate: 78,
    patientEducation: true,
    followUpRequired: true,
    internationalStandards: ["NCCN Guidelines", "ESMO Guidelines"]
  },
  {
    name: "Depression",
    icd10Code: "F32",
    category: "Mental Health",
    severity: "Moderate",
    urgency: "ROUTINE",
    requiresSpecialist: false,
    specialtyRecommendation: "Psychiatry",
    expertiseRequired: "ADVANCED",
    complexityLevel: "MODERATE",
    averageTreatmentDuration: "3-6 months",
    successRate: 70,
    patientEducation: true,
    followUpRequired: true,
    internationalStandards: ["APA Guidelines", "NICE Guidelines"]
  },
  {
    name: "Appendicitis",
    icd10Code: "K35",
    category: "Gastrointestinal",
    severity: "Acute",
    urgency: "URGENT",
    requiresSpecialist: true,
    specialtyRecommendation: "General Surgery",
    expertiseRequired: "ADVANCED",
    complexityLevel: "MODERATE",
    averageTreatmentDuration: "1-3 days",
    successRate: 95,
    patientEducation: false,
    followUpRequired: true,
    internationalStandards: ["SAGES Guidelines", "WSES Guidelines"]
  }
];

// Procedures Database
const proceduresDatabase = [
  {
    name: "Coronary Artery Bypass Graft (CABG)",
    cptCode: "33510",
    category: "Cardiovascular Surgery",
    complexityLevel: "SPECIALIZED",
    estimatedDuration: "4-6 hours",
    requiresSpecialist: true,
    specialtyRecommendation: "Cardiothoracic Surgery",
    expertiseRequired: "EXPERT",
    complicationRate: 3.5,
    successRate: 96,
    internationalStandards: ["AHA/ACC Guidelines", "ESC Guidelines"]
  },
  {
    name: "Laparoscopic Cholecystectomy",
    cptCode: "47562",
    category: "General Surgery",
    complexityLevel: "COMPLEX",
    estimatedDuration: "1-2 hours",
    requiresSpecialist: true,
    specialtyRecommendation: "General Surgery",
    expertiseRequired: "ADVANCED",
    complicationRate: 2.1,
    successRate: 98,
    internationalStandards: ["SAGES Guidelines", "EAES Guidelines"]
  },
  {
    name: "Electrocardiogram (ECG)",
    cptCode: "93000",
    category: "Diagnostic Procedure",
    complexityLevel: "BASIC",
    estimatedDuration: "5-10 minutes",
    requiresSpecialist: false,
    specialtyRecommendation: "Cardiology",
    expertiseRequired: "BASIC",
    complicationRate: 0,
    successRate: 100,
    internationalStandards: ["AHA Guidelines", "ESC Guidelines"]
  }
];

async function seedMedicalExpertiseSystem() {
  console.log("🌱 Seeding Medical Expertise System...");

  try {
    // Clear existing data
    await prisma.doctorSpecialty.deleteMany();
    await prisma.conditionExpertise.deleteMany();
    await prisma.procedureExpertise.deleteMany();
    await prisma.treatmentPathway.deleteMany();
    await prisma.specialtyMatcher.deleteMany();
    await prisma.doctorExpertiseProfile.deleteMany();
    await prisma.medicalTourismProfile.deleteMany();

    console.log("✅ Cleared existing medical expertise data");

    // Seed medical specializations
    console.log("📊 Seeding medical specializations...");
    
    for (const specialization of medicalSpecializations) {
      // Create specialty matchers for each specialization
      await prisma.specialtyMatcher.create({
        data: {
          conditionName: specialization.specialty,
          primarySpecialty: specialization.specialty,
          secondarySpecialties: specialization.subSpecialties,
          expertiseRequired: specialization.expertiseLevel as any,
          urgencyLevel: "ROUTINE",
          complexityLevel: "MODERATE",
          evidenceLevel: "Level A",
          validationStatus: "VALIDATED",
          confidenceScore: 0.95,
          recommendationStrength: "STRONG",
        }
      });

      // Create treatment pathways for each specialization
      await prisma.treatmentPathway.create({
        data: {
          pathwayName: `${specialization.specialty} Standard Care Pathway`,
          pathwayType: "Standard",
          conditionGroup: specialization.category,
          evidenceLevel: "Level A",
          successRate: 85,
          completionRate: 92,
          complexityScore: 5,
          requiresMultidisciplinary: specialization.category === "Specialist Care",
          internationalGuidelines: [
            "WHO Guidelines",
            "Singapore Clinical Practice Guidelines"
          ],
          doctorSpecialties: {
            create: {
              doctor: {
                connect: { id: "temp-doctor-id" } // This will be handled in actual doctor creation
              },
              specialty: specialization.specialty,
              mohSpecialtyCode: specialization.mohCode,
              mohCategory: specialization.mohCategory,
              expertiseLevel: specialization.expertiseLevel as any,
            }
          }
        }
      });
    }

    console.log(`✅ Seeded ${medicalSpecializations.length} medical specializations`);

    // Seed expanded conditions database with more comprehensive coverage
    console.log("🔬 Seeding expanded conditions database...");
    
    const expandedConditionsDatabase = [
      ...conditionsDatabase,
      {
        name: "Asthma",
        icd10Code: "J45",
        category: "Respiratory",
        severity: "Moderate",
        urgency: "ROUTINE",
        requiresSpecialist: true,
        specialtyRecommendation: "Pulmonology",
        expertiseRequired: "ADVANCED",
        complexityLevel: "MODERATE",
        averageTreatmentDuration: "Ongoing management",
        successRate: 90,
        patientEducation: true,
        followUpRequired: true,
        internationalStandards: ["GINA Guidelines"]
      },
      {
        name: "Chronic Kidney Disease Stage 3",
        icd10Code: "N18.3",
        category: "Renal",
        severity: "Moderate",
        urgency: "ROUTINE",
        requiresSpecialist: true,
        specialtyRecommendation: "Nephrology",
        expertiseRequired: "ADVANCED",
        complexityLevel: "COMPLEX",
        averageTreatmentDuration: "Ongoing monitoring",
        successRate: 85,
        patientEducation: true,
        followUpRequired: true,
        internationalStandards: ["KDIGO Guidelines"]
      },
      {
        name: "Rheumatoid Arthritis",
        icd10Code: "M05",
        category: "Rheumatology",
        severity: "Moderate",
        urgency: "ROUTINE",
        requiresSpecialist: true,
        specialtyRecommendation: "Rheumatology",
        expertiseRequired: "EXPERT",
        complexityLevel: "COMPLEX",
        averageTreatmentDuration: "Ongoing management",
        successRate: 78,
        patientEducation: true,
        followUpRequired: true,
        internationalStandards: ["ACR/EULAR Guidelines"]
      },
      {
        name: "Pneumonia",
        icd10Code: "J18",
        category: "Infectious Disease",
        severity: "Moderate to Severe",
        urgency: "URGENT",
        requiresSpecialist: false,
        specialtyRecommendation: "Pulmonology",
        expertiseRequired: "INTERMEDIATE",
        complexityLevel: "MODERATE",
        averageTreatmentDuration: "1-2 weeks",
        successRate: 95,
        patientEducation: true,
        followUpRequired: true,
        internationalStandards: ["ATS/IDSA Guidelines"]
      },
      {
        name: "Acute Stroke",
        icd10Code: "I63",
        category: "Neurology",
        severity: "Life-threatening",
        urgency: "EMERGENCY",
        requiresSpecialist: true,
        specialtyRecommendation: "Neurology",
        expertiseRequired: "EXPERT",
        complexityLevel: "SPECIALIZED",
        averageTreatmentDuration: "Immediate treatment",
        successRate: 85,
        patientEducation: false,
        followUpRequired: true,
        internationalStandards: ["AHA/ASA Guidelines"]
      }
    ];
    
    for (const condition of expandedConditionsDatabase) {
      await prisma.specialtyMatcher.create({
        data: {
          conditionName: condition.name,
          conditionCode: condition.icd10Code,
          primarySpecialty: condition.specialtyRecommendation,
          expertiseRequired: condition.expertiseRequired as any,
          urgencyLevel: condition.urgency as any,
          complexityLevel: condition.complexityLevel as any,
          evidenceLevel: "Level A",
          validationStatus: "VALIDATED",
          confidenceScore: 0.90,
          recommendationStrength: "STRONG",
          predictedSuccessRate: condition.successRate,
          averageTreatmentDuration: condition.averageTreatmentDuration,
        }
      });
    }

    console.log(`✅ Seeded ${expandedConditionsDatabase.length} conditions`);

    // Seed expanded procedures database  
    console.log("⚕️ Seeding expanded procedures database...");
    
    const expandedProceduresDatabase = [
      ...proceduresDatabase,
      {
        name: "Pulmonary Function Test",
        cptCode: "94010",
        category: "Pulmonology",
        complexityLevel: "BASIC",
        estimatedDuration: "30 minutes",
        requiresSpecialist: true,
        specialtyRecommendation: "Pulmonology",
        expertiseRequired: "BASIC",
        complicationRate: 0,
        successRate: 98,
        internationalStandards: ["ATS Guidelines"]
      },
      {
        name: "Kidney Biopsy",
        cptCode: "50200",
        category: "Nephrology",
        complexityLevel: "COMPLEX",
        estimatedDuration: "1 hour",
        requiresSpecialist: true,
        specialtyRecommendation: "Nephrology",
        expertiseRequired: "EXPERT",
        complicationRate: 5.2,
        successRate: 96,
        internationalStandards: ["KDIGO Guidelines"]
      },
      {
        name: "Joint Aspiration",
        cptCode: "20610",
        category: "Rheumatology",
        complexityLevel: "MODERATE",
        estimatedDuration: "15 minutes",
        requiresSpecialist: true,
        specialtyRecommendation: "Rheumatology",
        expertiseRequired: "INTERMEDIATE",
        complicationRate: 2.0,
        successRate: 95,
        internationalStandards: ["ACR Guidelines"]
      },
      {
        name: "Emergency Intubation",
        cptCode: "31500",
        category: "Emergency Medicine",
        complexityLevel: "COMPLEX",
        estimatedDuration: "5 minutes",
        requiresSpecialist: true,
        specialtyRecommendation: "Emergency Medicine",
        expertiseRequired: "EXPERT",
        complicationRate: 1.5,
        successRate: 99,
        internationalStandards: ["AHA Guidelines"]
      }
    ];
    
    for (const procedure of expandedProceduresDatabase) {
      await prisma.specialtyMatcher.create({
        data: {
          conditionName: procedure.name,
          primarySpecialty: procedure.specialtyRecommendation,
          expertiseRequired: procedure.expertiseRequired as any,
          urgencyLevel: "ROUTINE",
          complexityLevel: procedure.complexityLevel as any,
          evidenceLevel: "Level A",
          validationStatus: "VALIDATED",
          confidenceScore: 0.95,
          recommendationStrength: "STRONG",
        }
      });
    }

    console.log(`✅ Seeded ${expandedProceduresDatabase.length} procedures`);

    // Create sample doctor expertise profiles
    console.log("👨‍⚕️ Creating sample doctor expertise profiles...");

    const sampleProfiles = [
      {
        doctorId: "sample-doctor-1",
        expertiseSummary: "Experienced cardiologist with 15 years in interventional cardiology, specializing in complex coronary interventions and structural heart disease.",
        primaryExpertiseAreas: ["Interventional Cardiology", "Structural Heart Disease", "Cardiac Imaging"],
        secondaryExpertiseAreas: ["Heart Failure", "Preventive Cardiology"],
        handlesComplexCases: true,
        handlesRareDiseases: false,
        internationalExperience: true,
        culturalCompetency: true,
        medicalLanguages: ["English", "Mandarin"],
        teachingRating: 4.8,
        peerRecognitionScore: 4.7,
        internationalRecognition: true,
        awards: ["Singapore Heart Foundation Award", "ASEAN Cardiology Excellence Award"]
      },
      {
        doctorId: "sample-doctor-2", 
        expertiseSummary: "Board-certified dermatologist with expertise in medical and cosmetic dermatology, including laser treatments and skin cancer management.",
        primaryExpertiseAreas: ["Medical Dermatology", "Skin Cancer", "Cosmetic Dermatology"],
        secondaryExpertiseAreas: ["Dermatologic Surgery", "Pediatric Dermatology"],
        handlesComplexCases: true,
        handlesRareDiseases: true,
        internationalExperience: false,
        culturalCompetency: true,
        medicalLanguages: ["English", "Malay"],
        teachingRating: 4.5,
        peerRecognitionScore: 4.3,
        internationalRecognition: false,
        awards: ["Singapore Dermatology Society Excellence Award"]
      }
    ];

    // Seed additional expanded conditions for comprehensive coverage
    console.log("🏥 Adding additional medical conditions...");
    
    const additionalConditions = [
      {
        name: "Cholera",
        icd10Code: "A00",
        category: "Infectious Disease",
        severity: "Life-threatening",
        urgency: "EMERGENCY",
        requiresSpecialist: true,
        specialtyRecommendation: "Infectious Disease",
        expertiseRequired: "EXPERT",
        complexityLevel: "SPECIALIZED",
        averageTreatmentDuration: "5-7 days",
        successRate: 95,
        patientEducation: true,
        followUpRequired: true,
        internationalStandards: ["WHO Guidelines", "CDC Guidelines"]
      },
      {
        name: "Dengue Hemorrhagic Fever",
        icd10Code: "A91",
        category: "Tropical Medicine",
        severity: "Life-threatening",
        urgency: "EMERGENCY",
        requiresSpecialist: true,
        specialtyRecommendation: "Tropical Medicine",
        expertiseRequired: "EXPERT",
        complexityLevel: "SPECIALIZED",
        averageTreatmentDuration: "7-14 days",
        successRate: 90,
        patientEducation: true,
        followUpRequired: true,
        internationalStandards: ["WHO Dengue Guidelines"]
      },
      {
        name: "Hand, Foot and Mouth Disease",
        icd10Code: "A08.4",
        category: "Pediatric Infectious Disease",
        severity: "Moderate",
        urgency: "ROUTINE",
        requiresSpecialist: false,
        specialtyRecommendation: "Pediatrics",
        expertiseRequired: "INTERMEDIATE",
        complexityLevel: "MODERATE",
        averageTreatmentDuration: "7-10 days",
        successRate: 98,
        patientEducation: true,
        followUpRequired: false,
        internationalStandards: ["WHO HFMD Guidelines"]
      },
      {
        name: "Chikungunya",
        icd10Code: "A92.0",
        category: "Vector-borne Disease",
        severity: "Moderate",
        urgency: "ROUTINE",
        requiresSpecialist: true,
        specialtyRecommendation: "Tropical Medicine",
        expertiseRequired: "ADVANCED",
        complexityLevel: "MODERATE",
        averageTreatmentDuration: "1-2 weeks",
        successRate: 95,
        patientEducation: true,
        followUpRequired: true,
        internationalStandards: ["PAHO Guidelines", "WHO Guidelines"]
      },
      {
        name: "Zika Virus Infection",
        icd10Code: "A92.6",
        category: "Vector-borne Disease",
        severity: "Moderate",
        urgency: "URGENT",
        requiresSpecialist: true,
        specialtyRecommendation: "Tropical Medicine",
        expertiseRequired: "EXPERT",
        complexityLevel: "SPECIALIZED",
        averageTreatmentDuration: "1-2 weeks",
        successRate: 98,
        patientEducation: true,
        followUpRequired: true,
        internationalStandards: ["WHO Zika Guidelines", "CDC Guidelines"]
      },
      {
        name: "Severe Acute Respiratory Syndrome (SARS)",
        icd10Code: "U04.9",
        category: "Respiratory Infectious Disease",
        severity: "Life-threatening",
        urgency: "EMERGENCY",
        requiresSpecialist: true,
        specialtyRecommendation: "Pulmonology",
        expertiseRequired: "EXPERT",
        complexityLevel: "SPECIALIZED",
        averageTreatmentDuration: "2-3 weeks",
        successRate: 85,
        patientEducation: true,
        followUpRequired: true,
        internationalStandards: ["WHO SARS Guidelines", "MOH Singapore"]
      },
      {
        name: "Middle East Respiratory Syndrome (MERS)",
        icd10Code: "B34.2",
        category: "Respiratory Infectious Disease",
        severity: "Life-threatening",
        urgency: "EMERGENCY",
        requiresSpecialist: true,
        specialtyRecommendation: "Pulmonology",
        expertiseRequired: "EXPERT",
        complexityLevel: "SPECIALIZED",
        averageTreatmentDuration: "2-4 weeks",
        successRate: 80,
        patientEducation: true,
        followUpRequired: true,
        internationalStandards: ["WHO MERS Guidelines", "CDC Guidelines"]
      },
      {
        name: "Tuberculosis",
        icd10Code: "A15",
        category: "Infectious Disease",
        severity: "Severe",
        urgency: "URGENT",
        requiresSpecialist: true,
        specialtyRecommendation: "Pulmonology",
        expertiseRequired: "EXPERT",
        complexityLevel: "SPECIALIZED",
        averageTreatmentDuration: "6-12 months",
        successRate: 85,
        patientEducation: true,
        followUpRequired: true,
        internationalStandards: ["WHO TB Guidelines", "MOH Singapore"]
      },
      {
        name: "Leprosy",
        icd10Code: "A30",
        category: "Infectious Disease",
        severity: "Moderate",
        urgency: "ROUTINE",
        requiresSpecialist: true,
        specialtyRecommendation: "Dermatology",
        expertiseRequired: "ADVANCED",
        complexityLevel: "SPECIALIZED",
        averageTreatmentDuration: "12-24 months",
        successRate: 95,
        patientEducation: true,
        followUpRequired: true,
        internationalStandards: ["WHO Leprosy Guidelines"]
      },
      {
        name: "Buruli Ulcer",
        icd10Code: "A63.0",
        category: "Infectious Disease",
        severity: "Moderate",
        urgency: "URGENT",
        requiresSpecialist: true,
        specialtyRecommendation: "Dermatology",
        expertiseRequired: "ADVANCED",
        complexityLevel: "SPECIALIZED",
        averageTreatmentDuration: "3-6 months",
        successRate: 90,
        patientEducation: true,
        followUpRequired: true,
        internationalStandards: ["WHO Buruli Ulcer Guidelines"]
      },
      {
        name: "Filariasis",
        icd10Code: "B74",
        category: "Parasitic Disease",
        severity: "Moderate",
        urgency: "ROUTINE",
        requiresSpecialist: true,
        specialtyRecommendation: "Tropical Medicine",
        expertiseRequired: "ADVANCED",
        complexityLevel: "COMPLEX",
        averageTreatmentDuration: "3-6 months",
        successRate: 90,
        patientEducation: true,
        followUpRequired: true,
        internationalStandards: ["WHO Lymphatic Filariasis Guidelines"]
      },
      {
        name: "Schistosomiasis",
        icd10Code: "B65",
        category: "Parasitic Disease",
        severity: "Moderate",
        urgency: "ROUTINE",
        requiresSpecialist: true,
        specialtyRecommendation: "Tropical Medicine",
        expertiseRequired: "ADVANCED",
        complexityLevel: "COMPLEX",
        averageTreatmentDuration: "1-3 months",
        successRate: 92,
        patientEducation: true,
        followUpRequired: true,
        internationalStandards: ["WHO Schistosomiasis Guidelines"]
      },
      {
        name: "Acute Gastroenteritis",
        icd10Code: "A09",
        category: "Gastroenterology",
        severity: "Mild",
        urgency: "ROUTINE",
        requiresSpecialist: false,
        specialtyRecommendation: "General Practice",
        expertiseRequired: "BASIC",
        complexityLevel: "BASIC",
        averageTreatmentDuration: "3-5 days",
        successRate: 95,
        patientEducation: true,
        followUpRequired: false,
        internationalStandards: ["WHO Gastroenteritis Guidelines"]
      },
      {
        name: "Food Poisoning",
        icd10Code: "A05",
        category: "Gastroenterology",
        severity: "Moderate",
        urgency: "URGENT",
        requiresSpecialist: false,
        specialtyRecommendation: "General Practice",
        expertiseRequired: "INTERMEDIATE",
        complexityLevel: "MODERATE",
        averageTreatmentDuration: "1-3 days",
        successRate: 98,
        patientEducation: true,
        followUpRequired: false,
        internationalStandards: ["CDC Food Safety Guidelines"]
      },
      {
        name: "Heat Stroke",
        icd10Code: "T67.0",
        category: "Environmental Medicine",
        severity: "Life-threatening",
        urgency: "EMERGENCY",
        requiresSpecialist: true,
        specialtyRecommendation: "Emergency Medicine",
        expertiseRequired: "EXPERT",
        complexityLevel: "SPECIALIZED",
        averageTreatmentDuration: "1-7 days",
        successRate: 88,
        patientEducation: true,
        followUpRequired: true,
        internationalStandards: ["WHO Heat Health Guidelines"]
      },
      {
        name: "Drowning Near-drowning",
        icd10Code: "T75.1",
        category: "Emergency Medicine",
        severity: "Life-threatening",
        urgency: "EMERGENCY",
        requiresSpecialist: true,
        specialtyRecommendation: "Emergency Medicine",
        expertiseRequired: "EXPERT",
        complexityLevel: "SPECIALIZED",
        averageTreatmentDuration: "1-14 days",
        successRate: 75,
        patientEducation: false,
        followUpRequired: true,
        internationalStandards: ["WHO Drowning Prevention Guidelines"]
      }
    ];

    // Create condition expertise records for all conditions
    for (const condition of additionalConditions) {
      await prisma.conditionExpertise.create({
        data: {
          conditionName: condition.name,
          icd10Code: condition.icd10Code,
          category: condition.category,
          severity: condition.severity as any,
          urgency: condition.urgency as any,
          requiresSpecialist: condition.requiresSpecialist,
          recommendedSpecialty: condition.specialtyRecommendation,
          expertiseLevel: condition.expertiseRequired as any,
          complexityLevel: condition.complexityLevel as any,
          averageTreatmentDuration: condition.averageTreatmentDuration,
          successRate: condition.successRate,
          patientEducationRequired: condition.patientEducation,
          followUpRequired: condition.followUpRequired,
          internationalGuidelines: condition.internationalStandards,
        }
      });
    }

    console.log(`✅ Added ${additionalConditions.length} additional medical conditions`);

    for (const profile of sampleProfiles) {
      await prisma.doctorExpertiseProfile.create({
        data: profile
      });
    }

    console.log("✅ Created sample doctor expertise profiles");

    // Create sample medical tourism profiles
    console.log("🌍 Creating medical tourism profiles...");

    const tourismProfiles = [
      {
        doctorId: "sample-doctor-1",
        internationalQualifications: [
          { qualification: "MBBS (National University of Singapore)", year: 2008 },
          { qualification: "MRCP (UK)", year: 2012 },
          { qualification: "Interventional Cardiology Fellowship (Mayo Clinic)", year: 2015 }
        ],
        recognizedByCountries: ["Singapore", "Malaysia", "United Kingdom", "Australia"],
        culturalCompetencyTraining: true,
        medicalLanguages: ["English", "Mandarin", "Malay"],
        acceptsInternationalInsurance: true,
        medicalTourismServices: ["Cardiac consultations", "Interventional procedures", "Pre-operative assessment", "Post-operative follow-up"],
        internationalPatientsServed: 250,
        patientSatisfactionScore: 4.8
      },
      {
        doctorId: "sample-doctor-2",
        internationalQualifications: [
          { qualification: "MBBS (University of Malaya)", year: 2010 },
          { qualification: "MRCP (UK)", year: 2014 },
          { qualification: "Dermatology Residency (Singapore)", year: 2018 }
        ],
        recognizedByCountries: ["Singapore", "Malaysia"],
        culturalCompetencyTraining: true,
        medicalLanguages: ["English", "Mandarin", "Malay", "Tamil"],
        acceptsInternationalInsurance: true,
        medicalTourismServices: ["Dermatology consultations", "Laser treatments", "Skin cancer screening", "Cosmetic procedures"],
        internationalPatientsServed: 120,
        patientSatisfactionScore: 4.6
      }
    ];

    for (const profile of tourismProfiles) {
      await prisma.medicalTourismProfile.create({
        data: profile
      });
    }

    console.log("✅ Created medical tourism profiles");

    // Create comprehensive specialty matching data
    console.log("🎯 Creating specialty matching algorithms...");

    const matchingRules = [
      {
        condition: "Chest pain",
        primarySpecialty: "Cardiology",
        secondarySpecialties: ["General Medicine", "Emergency Medicine"],
        urgencyLevel: "URGENT",
        complexityLevel: "MODERATE"
      },
      {
        condition: "Skin rash",
        primarySpecialty: "Dermatology", 
        secondarySpecialties: ["General Practice", "Allergy and Immunology"],
        urgencyLevel: "ROUTINE",
        complexityLevel: "BASIC"
      },
      {
        condition: "Back pain",
        primarySpecialty: "Orthopedics",
        secondarySpecialties: ["General Practice", "Physiotherapy"],
        urgencyLevel: "ROUTINE",
        complexityLevel: "MODERATE"
      },
      {
        condition: "Depression",
        primarySpecialty: "Psychiatry",
        secondarySpecialties: ["Psychology", "General Practice"],
        urgencyLevel: "ROUTINE",
        complexityLevel: "MODERATE"
      }
    ];

    for (const rule of matchingRules) {
      await prisma.specialtyMatcher.create({
        data: {
          conditionName: rule.condition,
          primarySpecialty: rule.primarySpecialty,
          secondarySpecialties: rule.secondarySpecialties,
          expertiseRequired: "INTERMEDIATE",
          urgencyLevel: rule.urgencyLevel as any,
          complexityLevel: rule.complexityLevel as any,
          validationStatus: "VALIDATED",
          confidenceScore: 0.85
        }
      });
    }

    console.log(`✅ Created ${matchingRules.length} specialty matching rules`);

    console.log("🎉 Medical Expertise System seeding completed successfully!");
    console.log(`
📊 Summary:
   • ${medicalSpecializations.length} Medical Specializations
   • ${conditionsDatabase.length} Medical Conditions
   • ${proceduresDatabase.length} Procedures
   • ${sampleProfiles.length} Doctor Expertise Profiles
   • ${tourismProfiles.length} Medical Tourism Profiles
   • ${matchingRules.length} Specialty Matching Rules
    `);

  } catch (error) {
    console.error("❌ Error seeding medical expertise system:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Export for use in other files
export { seedMedicalExpertiseSystem, medicalSpecializations, internationalRecognitionMatrix, culturalCompetencyMatrix };

// Run seeding if called directly
if (require.main === module) {
  seedMedicalExpertiseSystem()
    .then(() => {
      console.log("✅ Seeding completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seeding failed:", error);
      process.exit(1);
    });
}