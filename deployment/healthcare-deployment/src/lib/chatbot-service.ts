import { 
  MessageIntent, 
  MessageSentiment, 
  ChatbotResponseType, 
  EscalationLevel,
  ChatbotInteraction,
  MedicalSpecialty 
} from '../lib/types/multi-channel-contact'

// NLP and Intent Recognition Service
export class ChatbotService {
  private medicalKnowledge: MedicalKnowledgeBase
  private intents: IntentPatterns
  private entities: EntityExtractor
  
  constructor() {
    this.medicalKnowledge = new MedicalKnowledgeBase()
    this.intents = new IntentPatterns()
    this.entities = new EntityExtractor()
  }
  
  /**
   * Process user message and generate appropriate response
   */
  async processMessage(
    userMessage: string, 
    context: ChatContext,
    options: ProcessingOptions = {}
  ): Promise<ChatbotResponse> {
    const startTime = Date.now()
    
    try {
      // 1. Preprocess the message
      const processedMessage = this.preprocessMessage(userMessage)
      
      // 2. Extract intent
      const intentResult = await this.intents.recognize(processedMessage.text, context.language)
      
      // 3. Extract entities
      const entityResult = this.entities.extract(processedMessage.text, context.clinicId)
      
      // 4. Analyze sentiment
      const sentiment = this.analyzeSentiment(processedMessage.text)
      
      // 5. Check for medical keywords
      const medicalContext = this.medicalKnowledge.analyzeContext(processedMessage.text)
      
      // 6. Determine response strategy
      const responseStrategy = this.determineResponseStrategy(
        intentResult, 
        sentiment, 
        medicalContext, 
        context
      )
      
      // 7. Generate response content
      const response = await this.generateResponse(
        responseStrategy,
        intentResult,
        entityResult,
        medicalContext,
        context
      )
      
      const processingTime = Date.now() - startTime
      
      return {
        ...response,
        metadata: {
          intent: intentResult.intent,
          confidence: intentResult.confidence,
          sentiment,
          entities: entityResult,
          medicalContext,
          processingTime,
          escalationTriggered: response.escalationRequired,
          responseType: response.type
        }
      }
    } catch (error) {
      console.error('Chatbot processing error:', error)
      
      return {
        content: "I apologize, but I'm having trouble processing your message right now. Let me connect you with one of our staff members who can better assist you.",
        type: ChatbotResponseType.FALLBACK,
        confidence: 0.3,
        escalationRequired: true,
        actions: [{ type: 'escalate', reason: 'processing_error' }]
      }
    }
  }
  
  /**
   * Check if message requires escalation
   */
  shouldEscalate(
    message: string, 
    intent: MessageIntent, 
    sentiment: MessageSentiment,
    medicalContext: MedicalContext
  ): { shouldEscalate: boolean; reason: string; level: EscalationLevel } {
    
    // Emergency medical situations
    if (this.containsEmergencyKeywords(message) || intent === MessageIntent.EMERGENCY) {
      return {
        shouldEscalate: true,
        reason: 'emergency_medical_situation',
        level: EscalationLevel.EMERGENCY
      }
    }
    
    // High urgency medical issues
    if (this.containsUrgentKeywords(message) && medicalContext.isMedical) {
      return {
        shouldEscalate: true,
        reason: 'urgent_medical_inquiry',
        level: EscalationLevel.L2_SUPERVISOR
      }
    }
    
    // Very negative sentiment with medical context
    if (sentiment === MessageSentiment.VERY_NEGATIVE && medicalContext.isMedical) {
      return {
        shouldEscalate: true,
        reason: 'negative_sentiment_medical',
        level: EscalationLevel.L1_AGENT
      }
    }
    
    // Complex medical queries
    if (medicalContext.isMedical && medicalContext.complexity > 0.7) {
      return {
        shouldEscalate: true,
        reason: 'complex_medical_query',
        level: EscalationLevel.L3_MANAGER
      }
    }
    
    // Multiple failed attempts or low confidence
    if (context?.failedAttempts && context.failedAttempts >= 2) {
      return {
        shouldEscalate: true,
        reason: 'multiple_failed_attempts',
        level: EscalationLevel.L1_AGENT
      }
    }
    
    return { shouldEscalate: false, reason: '', level: EscalationLevel.L1_AGENT }
  }
  
  /**
   * Get FAQ response
   */
  async getFAQResponse(question: string, language: string = 'en'): Promise<string | null> {
    const faq = this.medicalKnowledge.getFAQ()
    const matches = faq.filter(item => 
      this.calculateSimilarity(question.toLowerCase(), item.question.toLowerCase()) > 0.7
    )
    
    if (matches.length > 0) {
      return matches[0].answer[language] || matches[0].answer['en']
    }
    
    return null
  }
  
  /**
   * Get appointment booking response
   */
  getBookingResponse(
    intent: IntentResult, 
    entity: EntityResult, 
    context: ChatContext
  ): ChatbotResponse {
    const doctorName = entity.doctors[0]?.name
    const serviceName = entity.services[0]?.name
    const preferredDate = entity.dates[0]
    const preferredTime = entity.times[0]
    
    if (doctorName && serviceName) {
      return {
        content: `I can help you book an appointment with Dr. ${doctorName} for ${serviceName}. Our clinic offers convenient scheduling with same-day availability for urgent cases. Would you like me to check available time slots for ${preferredDate || 'today'}?`,
        type: ChatbotResponseType.BOOKING,
        confidence: 0.9,
        escalationRequired: false,
        actions: [
          { 
            type: 'check_availability', 
            data: { doctorName, serviceName, preferredDate, preferredTime } 
          }
        ]
      }
    }
    
    if (serviceName) {
      return {
        content: `I'd be happy to help you book a ${serviceName} appointment. Our clinic has experienced doctors available. What date and time work best for you?`,
        type: ChatbotResponseType.BOOKING,
        confidence: 0.8,
        escalationRequired: false,
        actions: [
          { 
            type: 'show_doctors', 
            data: { serviceName } 
          }
        ]
      }
    }
    
    return {
      content: "I can help you book an appointment at My Family Clinic. We offer same-day appointments and have multiple locations across Singapore. What type of service do you need?",
      type: ChatbotResponseType.BOOKING,
      confidence: 0.7,
      escalationRequired: false,
      actions: [
        { type: 'show_services' }
      ]
    }
  }
  
  /**
   * Get clinic information response
   */
  getClinicInfoResponse(intent: IntentResult, entity: EntityResult, context: ChatContext): ChatbotResponse {
    const locations = this.medicalKnowledge.getLocations()
    const operatingHours = this.medicalKnowledge.getOperatingHours()
    
    return {
      content: `My Family Clinic operates ${operatingHours.hours} on weekdays, ${operatingHours.weekendHours} on weekends, and is closed on public holidays. We have ${locations.length} convenient locations across Singapore. For your nearest clinic, please provide your location or postal code.`,
      type: ChatbotResponseType.INFORMATION,
      confidence: 0.9,
      escalationRequired: false,
      actions: [
        { type: 'show_locations', data: { locations } }
      ]
    }
  }
  
  /**
   * Get pricing information response
   */
  getPricingResponse(intent: IntentResult, entity: EntityResult, context: ChatContext): ChatbotResponse {
    const services = this.medicalKnowledge.getServices()
    const insuranceAccepted = this.medicalKnowledge.getInsuranceInfo()
    
    return {
      content: `Our consultation fees start from $40, and we accept most insurance plans including Medisave, Medishield, and private insurance. For specific pricing, please call our clinic or speak with our staff.`,
      type: ChatbotResponseType.INFORMATION,
      confidence: 0.8,
      escalationRequired: false,
      actions: [
        { type: 'show_detailed_pricing' }
      ]
    }
  }
  
  /**
   * Get emergency response
   */
  getEmergencyResponse(message: string, context: ChatContext): ChatbotResponse {
    return {
      content: "This appears to be a medical emergency. Please call 995 immediately for emergency services. If this is urgent but not life-threatening, we offer same-day appointments. Is this a medical emergency that requires immediate attention?",
      type: ChatbotResponseType.EMERGENCY,
      confidence: 0.95,
      escalationRequired: true,
      actions: [
        { type: 'escalate', reason: 'emergency' },
        { type: 'provide_emergency_contacts' }
      ]
    }
  }
  
  /**
   * Get greeting response
   */
  getGreetingResponse(context: ChatContext): ChatbotResponse {
    const hour = new Date().getHours()
    let greeting = "Hello"
    
    if (hour < 12) greeting = "Good morning"
    else if (hour < 18) greeting = "Good afternoon"
    else greeting = "Good evening"
    
    return {
      content: `${greeting}! Welcome to My Family Clinic. How can I help you today? You can ask about our services, book an appointment, get clinic information, or speak with one of our staff members.`,
      type: ChatbotResponseType.GREETING,
      confidence: 0.9,
      escalationRequired: false,
      actions: [
        { type: 'show_menu' }
      ]
    }
  }
  
  private preprocessMessage(message: string): ProcessedMessage {
    // Remove extra whitespace and normalize
    const text = message.trim().replace(/\s+/g, ' ')
    
    // Extract language
    const language = this.detectLanguage(text)
    
    // Clean and tokenize
    const tokens = text.toLowerCase().split(/\s+/)
    
    return {
      text,
      tokens,
      language
    }
  }
  
  private detectLanguage(text: string): string {
    // Simple language detection - can be enhanced with more sophisticated methods
    const englishWords = ['hello', 'hi', 'appointment', 'doctor', 'clinic', 'help', 'thank', 'bye']
    const chineseWords = ['你好', '预约', '医生', '诊所', '帮助', '谢谢', '再见']
    const malayWords = ['hello', 'appointment', 'doktor', 'klinik', 'bantuan', 'terima kasih', 'selamat tinggal']
    
    const lowerText = text.toLowerCase()
    
    if (chineseWords.some(word => lowerText.includes(word))) return 'zh'
    if (malayWords.some(word => lowerText.includes(word))) return 'ms'
    
    return 'en'
  }
  
  private analyzeSentiment(text: string): MessageSentiment {
    const positiveWords = ['good', 'great', 'excellent', 'wonderful', 'amazing', 'love', 'perfect', 'thank']
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'hate', 'worst', 'angry', 'frustrated', 'disappointed']
    const urgentWords = ['urgent', 'emergency', 'critical', 'asap', 'immediately', 'pain', 'severe']
    
    const lowerText = text.toLowerCase()
    
    const positiveScore = positiveWords.filter(word => lowerText.includes(word)).length
    const negativeScore = negativeWords.filter(word => lowerText.includes(word)).length
    const urgentScore = urgentWords.filter(word => lowerText.includes(word)).length
    
    if (urgentScore > 0) {
      return MessageSentiment.VERY_NEGATIVE
    } else if (negativeScore > positiveScore + 1) {
      return MessageSentiment.NEGATIVE
    } else if (positiveScore > negativeScore + 1) {
      return MessageSentiment.POSITIVE
    } else if (positiveScore > 0 || negativeScore > 0) {
      return MessageSentiment.NEUTRAL
    }
    
    return MessageSentiment.NEUTRAL
  }
  
  private containsEmergencyKeywords(message: string): boolean {
    const emergencyKeywords = [
      'chest pain', 'difficulty breathing', 'unconscious', 'severe bleeding',
      'stroke', 'heart attack', 'seizure', 'broken bone', 'head injury',
      'severe allergic reaction', 'overdose', 'suicide', '911', 'emergency'
    ]
    
    const lowerMessage = message.toLowerCase()
    return emergencyKeywords.some(keyword => lowerMessage.includes(keyword))
  }
  
  private containsUrgentKeywords(message: string): boolean {
    const urgentKeywords = [
      'urgent', 'asap', 'soon', 'today', 'pain', 'fever', 'sick',
      'not feeling well', 'medical issue', 'health problem'
    ]
    
    const lowerMessage = message.toLowerCase()
    return urgentKeywords.some(keyword => lowerMessage.includes(keyword))
  }
  
  private calculateSimilarity(str1: string, str2: string): number {
    // Simple Jaccard similarity - can be enhanced with more sophisticated algorithms
    const set1 = new Set(str1.split(' '))
    const set2 = new Set(str2.split(' '))
    const intersection = new Set([...set1].filter(x => set2.has(x)))
    const union = new Set([...set1, ...set2])
    
    return intersection.size / union.size
  }
  
  private determineResponseStrategy(
    intent: IntentResult,
    sentiment: MessageSentiment,
    medicalContext: MedicalContext,
    context: ChatContext
  ): ResponseStrategy {
    
    // Emergency situations
    if (intent.intent === MessageIntent.EMERGENCY) {
      return { type: 'emergency', priority: 'critical' }
    }
    
    // Appointment booking
    if (intent.intent === MessageIntent.APPOINTMENT) {
      return { type: 'booking', priority: 'high' }
    }
    
    // Information requests
    if (intent.intent === MessageIntent.INFORMATION) {
      return { type: 'information', priority: 'normal' }
    }
    
    // Complaints
    if (intent.intent === MessageIntent.COMPLAINT) {
      return { type: 'complaint', priority: 'high' }
    }
    
    // Greetings
    if (intent.intent === MessageIntent.GREETING) {
      return { type: 'greeting', priority: 'low' }
    }
    
    // Default
    return { type: 'general', priority: 'normal' }
  }
  
  private async generateResponse(
    strategy: ResponseStrategy,
    intent: IntentResult,
    entities: EntityResult,
    medicalContext: MedicalContext,
    context: ChatContext
  ): Promise<ChatbotResponse> {
    
    switch (strategy.type) {
      case 'emergency':
        return this.getEmergencyResponse(intent.originalText, context)
      
      case 'booking':
        return this.getBookingResponse(intent, entities, context)
      
      case 'information':
        if (entities.locations.length > 0) {
          return this.getClinicInfoResponse(intent, entities, context)
        } else {
          return this.getPricingResponse(intent, entities, context)
        }
      
      case 'complaint':
        return {
          content: "I understand your concern and I apologize for any inconvenience. Let me connect you with our customer service team who can address your issue promptly.",
          type: ChatbotResponseType.ESCALATION,
          confidence: 0.8,
          escalationRequired: true,
          actions: [
            { type: 'escalate', reason: 'complaint' }
          ]
        }
      
      case 'greeting':
        return this.getGreetingResponse(context)
      
      default:
        return {
          content: "I'm here to help you with any questions about My Family Clinic. You can ask about our services, book an appointment, get clinic information, or request to speak with a staff member.",
          type: ChatbotResponseType.FALLBACK,
          confidence: 0.6,
          escalationRequired: false,
          actions: [
            { type: 'show_options' }
          ]
        }
    }
  }
}

// Supporting classes and interfaces

interface ProcessedMessage {
  text: string
  tokens: string[]
  language: string
}

interface IntentResult {
  intent: MessageIntent
  confidence: number
  originalText: string
}

interface EntityResult {
  doctors: Array<{ name: string; specialty?: string }>
  services: Array<{ name: string; category?: string }>
  dates: string[]
  times: string[]
  locations: string[]
  symptoms: string[]
  medications: string[]
}

interface MedicalContext {
  isMedical: boolean
  specialty?: string
  urgency: 'low' | 'medium' | 'high' | 'critical'
  complexity: number
  keywords: string[]
}

interface ResponseStrategy {
  type: 'emergency' | 'booking' | 'information' | 'complaint' | 'greeting' | 'general'
  priority: 'low' | 'normal' | 'high' | 'critical'
}

export interface ChatContext {
  clinicId?: string
  doctorId?: string
  serviceId?: string
  language: string
  conversationHistory?: string[]
  failedAttempts?: number
  customerId?: string
}

export interface ProcessingOptions {
  maxResponseTime?: number
  enableEscalation?: boolean
  language?: string
  customIntents?: string[]
}

export interface ChatbotResponse {
  content: string
  type: ChatbotResponseType
  confidence: number
  escalationRequired: boolean
  actions: Array<{
    type: string
    data?: any
  }>
  metadata?: Record<string, any>
}

// Intent Recognition
class IntentPatterns {
  private patterns: Map<MessageIntent, RegExp[]> = new Map()
  
  constructor() {
    this.initializePatterns()
  }
  
  private initializePatterns() {
    this.patterns.set(MessageIntent.GREETING, [
      /^(hi|hello|hey|good morning|good afternoon|good evening|greetings)/i,
      /^(hi there|hello there|hey there)/i
    ])
    
    this.patterns.set(MessageIntent.APPOINTMENT, [
      /(book|schedule|make|arrange).*(appointment|consultation)/i,
      /appointment|consultation|check up|medical check/i,
      /(available|free).*(time|slot|schedule)/i,
      /(when|what time|which time).*(available|open)/i
    ])
    
    this.patterns.set(MessageIntent.EMERGENCY, [
      /(emergency|urgent|immediately|critical|severe)/i,
      /(chest pain|difficulty breathing|unconscious|severe bleeding)/i,
      /(stroke|heart attack|seizure|broken bone)/i,
      /call 911|call emergency|help me/i
    ])
    
    this.patterns.set(MessageIntent.INFORMATION, [
      /(clinic|location|address|where).*(located|situated)/i,
      /(hours|open|close|when).*(clinic|open)/i,
      /(price|cost|fee|insurance).*(how much|what)/i,
      /(service|what do you|what can you).*(offer|do|help)/i
    ])
    
    this.patterns.set(MessageIntent.COMPLAINT, [
      /(not satisfied|disappointed|unhappy|problem|issue)/i,
      /(complain|complaint|feedback)/i,
      /(terrible|bad|awful|horrible|worst)/i
    ])
  }
  
  async recognize(text: string, language: string = 'en'): Promise(IntentResult> {
    const lowerText = text.toLowerCase()
    
    // Check each intent pattern
    for (const [intent, patterns] of this.patterns) {
      for (const pattern of patterns) {
        if (pattern.test(lowerText)) {
          return {
            intent,
            confidence: this.calculateConfidence(pattern, lowerText),
            originalText: text
          }
        }
      }
    }
    
    // Default intent with low confidence
    return {
      intent: MessageIntent.UNKNOWN,
      confidence: 0.3,
      originalText: text
    }
  }
  
  private calculateConfidence(pattern: RegExp, text: string): number {
    const match = pattern.exec(text)
    if (!match) return 0.1
    
    // Confidence based on match position and length
    const matchStart = match.index
    const matchLength = match[0].length
    const textLength = text.length
    
    let confidence = 0.7
    
    // Boost confidence for early matches (user intent clear from start)
    if (matchStart < textLength * 0.2) confidence += 0.2
    
    // Boost confidence for complete matches
    if (matchLength === textLength) confidence += 0.1
    
    return Math.min(confidence, 1.0)
  }
}

// Entity Extraction
class EntityExtractor {
  private patterns: Map<string, RegExp[]> = new Map()
  
  constructor() {
    this.initializePatterns()
  }
  
  private initializePatterns() {
    // Doctor names (simplified - in reality would use a comprehensive database)
    this.patterns.set('doctors', [
      /dr\.?\s*([a-z]+)/i,
      /doctor\s*([a-z]+)/i,
      /(lim|ng|tan|lee|wong|koh|chia)/i
    ])
    
    // Medical services
    this.patterns.set('services', [
      /(consultation|check.?up|check up|screening|vaccination|vaccine)/i,
      /(blood test|x.?ray|ultrasound|ct|mri)/i,
      /(dermatology|cardiology|orthopedics|pediatrics)/i,
      /(general practice|gp|family doctor)/i
    ])
    
    // Dates and times
    this.patterns.set('dates', [
      /(today|tomorrow|yesterday)/i,
      /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
      /(january|february|march|april|may|june|july|august|september|october|november|december)/i,
      /(\d{1,2}\/\d{1,2}\/\d{4})/i,
      /(\d{1,2}-\d{1,2}-\d{4})/i
    ])
    
    this.patterns.set('times', [
      /(morning|afternoon|evening|night)/i,
      /(\d{1,2}:\d{2}\s*(am|pm)?)/i,
      /(9am|10am|11am|12pm|1pm|2pm|3pm|4pm|5pm|6pm|7pm|8pm)/i,
      /(early|late|asap|anytime)/i
    ])
    
    // Symptoms
    this.patterns.set('symptoms', [
      /(fever|cough|pain|headache|stomach ache)/i,
      /(sore throat|runny nose|cold|flu)/i,
      /(nausea|vomiting|diarrhea|constipation)/i,
      /(fatigue|tired|weak|dizzy)/i
    ])
  }
  
  extract(text: string, clinicId?: string): EntityResult {
    const entities: EntityResult = {
      doctors: [],
      services: [],
      dates: [],
      times: [],
      locations: [],
      symptoms: [],
      medications: []
    }
    
    // Extract entities using patterns
    for (const [type, patterns] of this.patterns) {
      for (const pattern of patterns) {
        const matches = text.match(pattern)
        if (matches) {
          const extracted = matches.slice(1).filter(Boolean)
          
          switch (type) {
            case 'doctors':
              entities.doctors = extracted.map(name => ({ name: name.trim() }))
              break
            case 'services':
              entities.services = extracted.map(service => ({ name: service.trim() }))
              break
            case 'dates':
              entities.dates.push(...extracted)
              break
            case 'times':
              entities.times.push(...extracted)
              break
            case 'symptoms':
              entities.symptoms.push(...extracted)
              break
          }
        }
      }
    }
    
    return entities
  }
}

// Medical Knowledge Base
class MedicalKnowledgeBase {
  private faq: FAQItem[] = []
  private services: ServiceInfo[] = []
  private locations: LocationInfo[] = []
  private medicalTerms: Map<string, MedicalTerm> = new Map()
  
  constructor() {
    this.initializeData()
  }
  
  private initializeData() {
    // FAQ data
    this.faq = [
      {
        question: "What are your clinic hours?",
        answer: {
          en: "We're open Monday to Friday 8am-8pm, Saturday 9am-5pm, and Sunday 10am-4pm. We're closed on public holidays.",
          zh: "我们周一至周五上午8点至晚上8点，周六上午9点至下午5点，周日上午10点至下午4点。公共假期关闭。",
          ms: "Kami buka Isnin hingga Jumaat 8 pagi-8 petang, Sabtu 9 pagi-5 petang, dan Ahad 10 pagi-4 petang. Kami tutup pada cuti umum."
        }
      },
      {
        question: "Do you accept insurance?",
        answer: {
          en: "Yes, we accept most insurance plans including Medisave, Medishield, and private insurance.",
          zh: "是的，我们接受大多数保险计划，包括医疗储蓄、医疗保险和私人保险。",
          ms: "Ya, kami menerima kebanyakan pelan insurans termasuk Medisave, Medishield, dan insurans persendirian."
        }
      },
      {
        question: "How much does a consultation cost?",
        answer: {
          en: "Our consultation fees start from $40. Please call for specific pricing as it varies by service.",
          zh: "我们的咨询费用从40新元起。请致电咨询具体价格，因为不同服务价格不同。",
          ms: "Yuran konsultasi kami bermula dari $40. Sila hubungi untuk harga khusus kerana ia berbeza mengikut perkhidmatan."
        }
      }
    ]
    
    // Services
    this.services = [
      { name: "General Consultation", category: "General Practice", price: 40, duration: 30 },
      { name: "Health Screening", category: "Preventive Care", price: 150, duration: 60 },
      { name: "Vaccination", category: "Preventive Care", price: 60, duration: 15 },
      { name: "Blood Test", category: "Laboratory", price: 80, duration: 20 },
      { name: "X-Ray", category: "Imaging", price: 120, duration: 30 }
    ]
    
    // Locations
    this.locations = [
      { name: "Orchard Clinic", address: "123 Orchard Road, Singapore 238823", postalCode: "238823" },
      { name: "Tampines Clinic", address: "456 Tampines Central, Singapore 529456", postalCode: "529456" },
      { name: "Jurong Clinic", address: "789 Jurong West, Singapore 628789", postalCode: "628789" }
    ]
  }
  
  analyzeContext(text: string): MedicalContext {
    const medicalKeywords = [
      'fever', 'cough', 'pain', 'headache', 'stomach ache', 'sore throat',
      'diabetes', 'hypertension', 'heart', 'lung', 'liver', 'kidney',
      'medication', 'prescription', 'treatment', 'diagnosis', 'symptom'
    ]
    
    const lowerText = text.toLowerCase()
    const foundKeywords = medicalKeywords.filter(keyword => lowerText.includes(keyword))
    
    const isMedical = foundKeywords.length > 0
    const complexity = foundKeywords.length / medicalKeywords.length
    
    let urgency: 'low' | 'medium' | 'high' | 'critical' = 'low'
    let specialty: string | undefined
    
    if (lowerText.includes('emergency') || lowerText.includes('urgent')) {
      urgency = 'critical'
    } else if (lowerText.includes('pain') || lowerText.includes('fever')) {
      urgency = 'high'
    } else if (lowerText.includes('check up') || lowerText.includes('screening')) {
      urgency = 'low'
    }
    
    if (lowerText.includes('heart') || lowerText.includes('chest')) {
      specialty = 'cardiology'
    } else if (lowerText.includes('skin') || lowerText.includes('dermatology')) {
      specialty = 'dermatology'
    }
    
    return {
      isMedical,
      specialty,
      urgency,
      complexity,
      keywords: foundKeywords
    }
  }
  
  getFAQ(): FAQItem[] {
    return this.faq
  }
  
  getServices(): ServiceInfo[] {
    return this.services
  }
  
  getLocations(): LocationInfo[] {
    return this.locations
  }
  
  getOperatingHours() {
    return {
      hours: "8am to 8pm",
      weekendHours: "9am to 5pm on Saturday, 10am to 4pm on Sunday"
    }
  }
  
  getInsuranceInfo() {
    return {
      accepted: ["Medisave", "Medishield", "Private Insurance", "Company Insurance"],
      notAccepted: ["Cash only patients welcome"]
    }
  }
}

interface FAQItem {
  question: string
  answer: Record<string, string> // language -> answer
}

interface ServiceInfo {
  name: string
  category: string
  price: number
  duration: number // minutes
}

interface LocationInfo {
  name: string
  address: string
  postalCode: string
}

interface MedicalTerm {
  term: string
  definition: string
  specialty: string
  relatedSymptoms: string[]
}

// Export singleton instance
export const chatbotService = new ChatbotService()
