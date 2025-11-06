import { MEDICAL_TERMS_DICTIONARY, SYMPTOM_CONDITION_MAP, SPECIALTY_ALIASES } from './filters'
import { MedicalTermDictionary, UrgencyLevel, ServiceType, PatientType } from '@/types/search'

export class MedicalTermRecognizer {
  private medicalTerms: MedicalTermDictionary
  private symptomMap: Record<string, string[]>
  private specialtyAliases: Record<string, string>

  constructor() {
    this.medicalTerms = MEDICAL_TERMS_DICTIONARY
    this.symptomMap = SYMPTOM_CONDITION_MAP
    this.specialtyAliases = SPECIALTY_ALIASES
  }

  /**
   * Recognize medical terms in a search query
   */
  recognizeTerms(query: string): {
    recognizedTerms: string[]
    specialties: string[]
    urgencyLevel?: UrgencyLevel
    confidence: number
  } {
    const normalizedQuery = query.toLowerCase().trim()
    const recognizedTerms: string[] = []
    const specialties: string[] = []
    let urgencyLevel: UrgencyLevel | undefined
    let confidence = 0

    // Check for exact matches first
    for (const [term, data] of Object.entries(this.medicalTerms)) {
      if (normalizedQuery.includes(term.toLowerCase())) {
        recognizedTerms.push(term)
        specialties.push(data.specialty)
        if (!urgencyLevel && data.urgencyLevel) {
          urgencyLevel = data.urgencyLevel
        }
        confidence += 0.8
      }

      // Check synonyms
      for (const synonym of data.synonyms) {
        if (normalizedQuery.includes(synonym.toLowerCase())) {
          recognizedTerms.push(term)
          specialties.push(data.specialty)
          confidence += 0.6
          break
        }
      }
    }

    // Check symptom-condition mapping
    for (const [symptom, conditions] of Object.entries(this.symptomMap)) {
      if (normalizedQuery.includes(symptom.toLowerCase())) {
        recognizedTerms.push(symptom)
        specialties.push(...conditions)
        confidence += 0.7
      }
    }

    // Check specialty aliases
    for (const [alias, specialty] of Object.entries(this.specialtyAliases)) {
      if (normalizedQuery.includes(alias.toLowerCase())) {
        specialties.push(specialty)
        confidence += 0.5
      }
    }

    return {
      recognizedTerms: [...new Set(recognizedTerms)],
      specialties: [...new Set(specialties)],
      urgencyLevel,
      confidence: Math.min(confidence, 1.0)
    }
  }

  /**
   * Get suggested medical terms based on partial input
   */
  getSuggestions(partialTerm: string, limit: number = 5): string[] {
    const normalizedPartial = partialTerm.toLowerCase().trim()
    const suggestions: string[] = []

    // Get terms that start with or contain the partial term
    for (const term of Object.keys(this.medicalTerms)) {
      if (term.toLowerCase().startsWith(normalizedPartial) || 
          term.toLowerCase().includes(normalizedPartial)) {
        suggestions.push(term)
        if (suggestions.length >= limit) break
      }

      // Check synonyms
      for (const [mainTerm, data] of Object.entries(this.medicalTerms)) {
        if (suggestions.includes(mainTerm)) continue
        
        for (const synonym of data.synonyms) {
          if (synonym.toLowerCase().startsWith(normalizedPartial) || 
              synonym.toLowerCase().includes(normalizedPartial)) {
            suggestions.push(term)
            break
          }
        }
        
        if (suggestions.length >= limit) break
      }
      
      if (suggestions.length >= limit) break
    }

    return suggestions.slice(0, limit)
  }

  /**
   * Get related medical terms and conditions
   */
  getRelatedTerms(term: string): {
    synonyms: string[]
    relatedConditions: string[]
    commonSymptoms: string[]
    specialty: string
  } {
    const normalizedTerm = term.toLowerCase()
    
    // Find the main term
    let mainTermData = null
    for (const [key, data] of Object.entries(this.medicalTerms)) {
      if (key.toLowerCase() === normalizedTerm || 
          data.synonyms.some(s => s.toLowerCase() === normalizedTerm)) {
        mainTermData = data
        break
      }
    }

    if (!mainTermData) {
      return {
        synonyms: [],
        relatedConditions: [],
        commonSymptoms: [],
        specialty: 'general'
      }
    }

    return {
      synonyms: mainTermData.synonyms,
      relatedConditions: mainTermData.relatedConditions || [],
      commonSymptoms: mainTermData.commonSymptoms || [],
      specialty: mainTermData.specialty
    }
  }

  /**
   * Suggest filters based on medical term recognition
   */
  suggestFilters(recognizedTerms: string[]): {
    specialties?: string[]
    serviceTypes?: ServiceType[]
    patientTypes?: PatientType[]
    urgency?: UrgencyLevel[]
  } {
    const filters: any = {}
    const specialties: string[] = []
    const patientTypes: PatientType[] = []
    let urgency: UrgencyLevel[] = []

    for (const term of recognizedTerms) {
      const termData = this.medicalTerms[term.toLowerCase()]
      if (termData) {
        specialties.push(termData.specialty)
        
        // Suggest patient types based on specialty
        if (termData.specialty === 'pediatrics') {
          patientTypes.push('pediatric')
        } else if (termData.specialty === 'gynecology') {
          patientTypes.push('womens_health')
        } else if (termData.specialty === 'psychiatry') {
          patientTypes.push('mental_health')
        }
        
        // Suggest urgency level
        if (termData.urgencyLevel) {
          urgency.push(termData.urgencyLevel)
        }
      }
    }

    if (specialties.length > 0) {
      filters.specialties = [...new Set(specialties)]
    }
    if (patientTypes.length > 0) {
      filters.patientTypes = [...new Set(patientTypes)]
    }
    if (urgency.length > 0) {
      filters.urgency = [...new Set(urgency)]
    }

    return filters
  }

  /**
   * Validate and normalize medical terminology
   */
  normalizeTerm(term: string): {
    normalized: string
    isValid: boolean
    suggestions?: string[]
  } {
    const normalized = term.toLowerCase().trim()
    
    // Check if it's a known term
    if (this.medicalTerms[normalized]) {
      return { normalized, isValid: true }
    }

    // Check synonyms
    for (const [mainTerm, data] of Object.entries(this.medicalTerms)) {
      if (data.synonyms.some(s => s.toLowerCase() === normalized)) {
        return { normalized: mainTerm, isValid: true }
      }
    }

    // Check aliases
    if (this.specialtyAliases[normalized]) {
      return { normalized: this.specialtyAliases[normalized], isValid: true }
    }

    // Provide suggestions
    const suggestions = this.getSuggestions(term, 3)
    return {
      normalized,
      isValid: false,
      suggestions
    }
  }

  /**
   * Get medical specialty categories
   */
  getSpecialtyCategories(): Record<string, string[]> {
    const categories: Record<string, string[]> = {
      cardiovascular: ['cardiology', 'cardiac_surgery', 'vascular_surgery'],
      respiratory: ['pulmonology', 'thoracic_surgery'],
      digestive: ['gastroenterology', 'hepatology', 'colorectal_surgery'],
      neurological: ['neurology', 'neurosurgery', 'psychiatry'],
      musculoskeletal: ['orthopedics', 'rheumatology', 'physiotherapy'],
      reproductive: ['gynecology', 'urology', 'andrology'],
      sensory: ['ophthalmology', 'otolaryngology', 'dermatology'],
      pediatric: ['pediatrics', 'pediatric_specialties'],
      internal: ['internal_medicine', 'endocrinology', 'nephrology'],
      surgical: ['general_surgery', 'specialized_surgery'],
      diagnostic: ['radiology', 'pathology', 'laboratory_medicine'],
      mental: ['psychiatry', 'psychology', 'counseling'],
      emergency: ['emergency_medicine', 'trauma_care', 'urgent_care'],
      preventive: ['preventive_medicine', 'occupational_health', 'public_health'],
      alternative: ['traditional_medicine', 'integrative_medicine', 'homeopathy']
    }

    return categories
  }

  /**
   * Get search ranking boost for medical terms
   */
  getSearchBoost(query: string): {
    specialty: string
    boostScore: number
    relevance: number
  } {
    const recognition = this.recognizeTerms(query)
    
    if (recognition.specialties.length === 0) {
      return { specialty: 'general', boostScore: 0, relevance: 0 }
    }

    const primarySpecialty = recognition.specialties[0]
    const boostScore = recognition.confidence * recognition.recognizedTerms.length
    const relevance = recognition.confidence

    return {
      specialty: primarySpecialty,
      boostScore,
      relevance
    }
  }
}

// Singleton instance
export const medicalTermRecognizer = new MedicalTermRecognizer()

// Utility functions for voice search integration
export const VOICE_SEARCH_COMMANDS = {
  // Search commands
  SEARCH_FOR: 'search for',
  FIND: 'find',
  LOCATE: 'locate',
  LOOK_UP: 'look up',
  
  // Filter commands
  BY_SPECIALTY: 'by specialty',
  IN_AREA: 'in area',
  OPEN_NOW: 'open now',
  WITH_RATING: 'with rating',
  EMERGENCY: 'emergency',
  URGENT: 'urgent',
  ROUTINE: 'routine',
  
  // Navigation commands
  NEXT_PAGE: 'next page',
  PREVIOUS_PAGE: 'previous page',
  SHOW_RESULTS: 'show results',
  CLEAR_FILTERS: 'clear filters',
  
  // Medical term commands
  HEART_CONDITION: 'heart condition',
  SKIN_PROBLEM: 'skin problem',
  JOINT_PAIN: 'joint pain',
  FEVER: 'fever',
  HEADACHE: 'headache'
}

// Medical term phonetics mapping for voice recognition
export const MEDICAL_TERMS_PHONETICS = {
  'cardiology': ['card-ee-ol-oh-jee', 'heart doctor', 'heart specialist'],
  'dermatology': ['derm-a-tol-oh-jee', 'skin doctor', 'skin specialist'],
  'orthopedics': ['or-tho-pee-diks', 'bone doctor', 'bone specialist'],
  'pediatrics': ['pee-dee-a-triks', 'children doctor', 'kids doctor'],
  'neurology': ['new-rol-oh-jee', 'brain doctor', 'nerve doctor'],
  'psychiatry': ['sigh-kye-a-tree', 'mental health doctor', 'mind doctor'],
  'gynecology': ['guy-neh-col-oh-jee', 'women doctor', 'women specialist'],
  'ophthalmology': ['off-thal-mol-oh-jee', 'eye doctor', 'eye specialist'],
  'otolaryngology': ['oh-toe-lar-in-gol-oh-jee', 'ear nose throat', 'ent doctor'],
  'gastroenterology': ['gas-tro-en-ter-ol-oh-jee', 'stomach doctor', 'gut doctor'],
  'endocrinology': ['en-do-crin-ol-oh-jee', 'hormone doctor', 'diabetes doctor'],
  'pulmonology': ['pull-moh-nol-oh-jee', 'lung doctor', 'respiratory doctor'],
  'rheumatology': ['roo-ma-tol-oh-jee', 'joint doctor', 'arthritis doctor'],
  'urology': ['you-rol-oh-jee', 'urinary doctor', 'bladder doctor'],
  'oncology': ['on-col-oh-jee', 'cancer doctor', 'tumor doctor'],
  'nephrology': ['neh-frol-oh-jee', 'kidney doctor', 'renal doctor'],
  'hepatology': ['hep-a-tol-oh-jee', 'liver doctor', 'hepatic doctor']
}

// Voice search confidence thresholds
export const VOICE_CONFIDENCE_THRESHOLDS = {
  HIGH_CONFIDENCE: 0.8,
  MEDIUM_CONFIDENCE: 0.6,
  LOW_CONFIDENCE: 0.4,
  MIN_ACCEPTABLE: 0.3
}