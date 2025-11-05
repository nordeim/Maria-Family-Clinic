// ========================================
// INTELLIGENT CHATBOT ENGINE
// Sub-Phase 9.7: AI-Powered Medical Enquiry Routing
// NLP-based chatbot for basic medical enquiry handling
// ========================================

import { z } from 'zod';
import { EventEmitter } from 'events';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Chatbot configuration schema
const ChatbotConfigSchema = z.object({
  name: z.string(),
  displayName: z.string(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  clinicId: z.string().optional(),
  medicalSpecialty: z.string().optional(),
  language: z.string().default('en'),
  canSchedule: z.boolean().default(false),
  canProvideInfo: z.boolean().default(true),
  canEscalate: z.boolean().default(true),
  canHandleEmergencies: z.boolean().default(false),
  maxEscalationLevel: z.string().default('L2_SUPERVISOR'),
  confidenceThreshold: z.number().default(0.7),
  responseTimeout: z.number().default(30),
  operatingHours: z.record(z.any()).default({}),
  businessHoursOnly: z.boolean().default(false),
  timezone: z.string().optional()
});

// Message processing schema
const MessageSchema = z.object({
  content: z.string(),
  senderId: z.string().optional(),
  senderName: z.string(),
  channel: z.string(),
  context: z.record(z.any()).default({}),
  clinicId: z.string().optional(),
  doctorId: z.string().optional(),
  serviceId: z.string().optional(),
  patientId: z.string().optional()
});

// NLP Result interface
export interface NLPResult {
  intent: string;
  confidence: number;
  entities: Entity[];
  sentiment: 'VERY_NEGATIVE' | 'NEGATIVE' | 'NEUTRAL' | 'POSITIVE' | 'VERY_POSITIVE';
  urgency: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' | 'EMERGENCY';
  medicalKeywords: string[];
  requiresHuman: boolean;
  responseType: ResponseType;
}

// Entity extraction result
export interface Entity {
  type: string;
  value: string;
  confidence: number;
  start: number;
  end: number;
}

// Chatbot response
export interface ChatbotResponse {
  success: boolean;
  response: string;
  responseType: ResponseType;
  confidence: number;
  requiresEscalation: boolean;
  escalationReason?: string;
  action?: ChatbotAction;
  followUp?: string;
  metadata?: any;
}

// Chatbot action
export interface ChatbotAction {
  type: 'BOOK_APPOINTMENT' | 'PROVIDE_INFO' | 'ESCALATE' | 'SCHEDULE_CALLBACK' | 'COLLECT_INFO' | 'FAQ' | 'EMERGENCY';
  data: any;
  confidence: number;
}

// Response types
export type ResponseType = 'GREETING' | 'INFORMATION' | 'ESCALATION' | 'BOOKING' | 'FAQ' | 'EMERGENCY' | 'GOODBYE' | 'FALLBACK' | 'CONFIRMATION' | 'REJECTION' | 'CLARIFICATION';

// Medical knowledge base
interface MedicalKnowledge {
  [key: string]: {
    keywords: string[];
    response: string;
    action?: ChatbotAction;
    followUpQuestions?: string[];
    requiresHuman: boolean;
    confidence: number;
  };
}

// Healthcare-specific response templates
const MEDICAL_RESPONSES: MedicalKnowledge = {
  'appointment_booking': {
    keywords: ['appointment', 'book', 'schedule', 'slot', 'time', 'date', 'calendar'],
    response: "I'd be happy to help you book an appointment with My Family Clinic. I can check our available slots and book you with the most suitable doctor. May I know what type of consultation you need?",
    action: { type: 'BOOK_APPOINTMENT', data: {}, confidence: 0.9 },
    followUpQuestions: [
      "What type of consultation do you need? (General checkup, specific symptoms, follow-up, etc.)",
      "Do you have a preferred doctor?",
      "What date and time works best for you?"
    ],
    requiresHuman: false,
    confidence: 0.9
  },
  'clinic_hours': {
    keywords: ['hours', 'open', 'close', 'time', 'when', 'available'],
    response: "My Family Clinic operates Monday to Friday 8:00 AM - 8:00 PM, and Saturday 8:00 AM - 5:00 PM. We're closed on Sundays. For urgent matters, we have 24/7 emergency services. Would you like to know more about specific services?",
    action: { type: 'PROVIDE_INFO', data: { infoType: 'hours' }, confidence: 0.8 },
    followUpQuestions: [
      "Would you like information about specific doctor availability?",
      "Are you looking for same-day appointments?"
    ],
    requiresHuman: false,
    confidence: 0.8
  },
  'emergency': {
    keywords: ['emergency', 'urgent', 'critical', 'pain', 'chest', 'breathing', 'accident', 'injury', 'bleeding'],
    response: "⚠️ This sounds like a medical emergency. Please call our emergency line at +65 9111 0000 immediately or visit the nearest emergency room. For life-threatening situations, always call 995 (Singapore emergency services).",
    action: { type: 'EMERGENCY', data: { emergencyLevel: 'CRITICAL' }, confidence: 0.95 },
    followUpQuestions: [
      "Are you currently in a safe location?",
      "Have you called emergency services?"
    ],
    requiresHuman: true,
    confidence: 0.95
  },
  'symptoms': {
    keywords: ['symptoms', 'pain', 'fever', 'cough', 'headache', 'nausea', 'sick', 'unwell', 'hurt'],
    response: "I understand you're experiencing some symptoms. While I can provide general health information, it's important to have a proper medical evaluation. May I help you book an appointment with one of our doctors?",
    action: { type: 'PROVIDE_INFO', data: { infoType: 'symptoms' }, confidence: 0.7 },
    followUpQuestions: [
      "How long have you been experiencing these symptoms?",
      "Are you currently taking any medications?",
      "Would you like to schedule a consultation?"
    ],
    requiresHuman: true,
    confidence: 0.7
  },
  'healthier_sg': {
    keywords: ['healthier', 'healthier sg', 'government', 'subsidy', 'screening', 'checkup'],
    response: "Great! I can help you with Healthier SG information. Healthier SG is Singapore's national health program that provides subsidized health screening and care. I can explain the benefits and help you get started. What's your age group?",
    action: { type: 'PROVIDE_INFO', data: { infoType: 'healthier_sg' }, confidence: 0.85 },
    followUpQuestions: [
      "Have you enrolled in Healthier SG yet?",
      "Are you interested in health screening?",
      "What specific Healthier SG benefits would you like to know about?"
    ],
    requiresHuman: false,
    confidence: 0.85
  },
  'fees': {
    keywords: ['cost', 'price', 'fee', 'payment', 'subsidy', 'medisave', 'cpf'],
    response: "I can help you understand our fees and payment options. My Family Clinic accepts cash, NETS, major credit cards, and Medisave. Healthier SG provides subsidized rates for enrolled patients. What specific service pricing would you like to know about?",
    action: { type: 'PROVIDE_INFO', data: { infoType: 'fees' }, confidence: 0.8 },
    followUpQuestions: [
      "Are you a Healthier SG enrollee?",
      "Which specific service are you inquiring about?",
      "Would you like information about payment methods?"
    ],
    requiresHuman: false,
    confidence: 0.8
  },
  'doctors': {
    keywords: ['doctor', 'physician', 'specialist', 'consultant', 'who', 'available'],
    response: "We have experienced doctors at My Family Clinic, each with their own specialties. Our doctors include General Practitioners, Family Medicine specialists, and consultants in various areas. What specific medical concern do you have? I can recommend the most suitable doctor.",
    action: { type: 'PROVIDE_INFO', data: { infoType: 'doctors' }, confidence: 0.75 },
    followUpQuestions: [
      "What type of medical issue are you looking for help with?",
      "Do you have a preference for male or female doctor?",
      "Would you like to know about our doctor's specializations?"
    ],
    requiresHuman: false,
    confidence: 0.75
  },
  'location': {
    keywords: ['where', 'location', 'address', 'directions', 'map', 'find'],
    response: "My Family Clinic is conveniently located at 123 Healthcare Drive, Singapore 123456. We are near MRT stations and have ample parking. Would you like detailed directions or information about public transport options?",
    action: { type: 'PROVIDE_INFO', data: { infoType: 'location' }, confidence: 0.9 },
    followUpQuestions: [
      "Do you need directions from a specific location?",
      "Would you like parking information?",
      "Are you interested in public transport options?"
    ],
    requiresHuman: false,
    confidence: 0.9
  }
};

// Fallback responses
const FALLBACK_RESPONSES = [
  "I understand you have a question, and I'm here to help. Could you please provide more details so I can assist you better?",
  "I want to make sure I understand correctly. Can you tell me more about what you're looking for?",
  "That's a good question! Let me help connect you with the right information or a human agent who can assist you.",
  "I may not have all the information you need. Would you like me to connect you with one of our staff members for personalized assistance?",
  "I want to help you get the most accurate information. Could you be more specific about what you need?"
];

// Greeting responses
const GREETING_RESPONSES = [
  "Hello! Welcome to My Family Clinic. I'm here to help you with appointments, general information, and health-related questions. How can I assist you today?",
  "Hi there! I'm your virtual assistant at My Family Clinic. I can help you book appointments, answer questions about our services, or connect you with our staff. What can I do for you?",
  "Greetings! I'm here to help make your healthcare experience easier. Whether you need to book an appointment or have questions about our services, I'm here to help. What would you like to know?",
  "Welcome to My Family Clinic! I can assist you with booking appointments, health information, and general inquiries. How may I help you today?"
];

// Emergency keywords for critical detection
const EMERGENCY_KEYWORDS = [
  'emergency', 'urgent', 'critical', 'chest pain', 'difficulty breathing', 'severe bleeding',
  'unconscious', 'seizure', 'stroke', 'heart attack', 'accident', 'injury', 'broken bone',
  'severe burns', 'poisoning', 'overdose', 'suicide', 'self-harm', 'severe allergic reaction',
  'anaphylaxis', 'severe headache', 'loss of vision', 'loss of hearing', 'severe dizziness'
];

// Main Chatbot Engine
export class IntelligentChatbot {
  private config: z.infer<typeof ChatbotConfigSchema>;
  private knowledgeBase: MedicalKnowledge;
  private eventEmitter: EventEmitter;
  private conversationHistory: Map<string, ChatMessage[]>;
  private userSessions: Map<string, UserSession>;

  constructor(config: z.infer<typeof ChatbotConfigSchema>) {
    this.config = ChatbotConfigSchema.parse(config);
    this.knowledgeBase = MEDICAL_RESPONSES;
    this.eventEmitter = new EventEmitter();
    this.conversationHistory = new Map();
    this.userSessions = new Map();
  }

  // Process incoming message
  async processMessage(message: z.infer<typeof MessageSchema>): Promise<ChatbotResponse> {
    try {
      const startTime = Date.now();
      
      // Log interaction
      await this.logInteraction(message);
      
      // Analyze message with NLP
      const nlpResult = await this.analyzeMessage(message);
      
      // Check for emergency
      if (this.isEmergency(nlpResult)) {
        return this.handleEmergency(message, nlpResult);
      }
      
      // Determine best response
      const response = await this.generateResponse(message, nlpResult);
      
      // Track performance
      const responseTime = Date.now() - startTime;
      await this.updatePerformanceMetrics(responseTime, response.confidence);
      
      // Update conversation history
      this.updateConversationHistory(message.senderId, {
        role: 'user',
        content: message.content,
        timestamp: new Date(),
        nlpResult
      });
      
      this.updateConversationHistory(message.senderId, {
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
        responseType: response.responseType
      });
      
      return response;
      
    } catch (error) {
      console.error('Chatbot processing error:', error);
      return this.generateFallbackResponse(message);
    }
  }

  // NLP Analysis
  private async analyzeMessage(message: z.infer<typeof MessageSchema>): Promise<NLPResult> {
    // Intent detection
    const intent = this.detectIntent(message.content);
    
    // Entity extraction
    const entities = this.extractEntities(message.content);
    
    // Sentiment analysis
    const sentiment = this.analyzeSentiment(message.content);
    
    // Medical keyword extraction
    const medicalKeywords = this.extractMedicalKeywords(message.content);
    
    // Urgency assessment
    const urgency = this.assessUrgency(message.content, medicalKeywords);
    
    // Confidence calculation
    const confidence = this.calculateConfidence(intent, entities, sentiment);
    
    // Human requirement check
    const requiresHuman = this.requiresHuman(intent, confidence, urgency);
    
    // Response type determination
    const responseType = this.determineResponseType(intent, urgency);
    
    return {
      intent,
      confidence,
      entities,
      sentiment,
      urgency,
      medicalKeywords,
      requiresHuman,
      responseType
    };
  }

  // Intent detection
  private detectIntent(content: string): string {
    const lowerContent = content.toLowerCase();
    
    // Check against knowledge base
    for (const [intent, data] of Object.entries(this.knowledgeBase)) {
      const matchCount = data.keywords.filter(keyword => 
        lowerContent.includes(keyword.toLowerCase())
      ).length;
      
      if (matchCount > 0) {
        return intent;
      }
    }
    
    // Additional intent patterns
    if (this.matchesPattern(lowerContent, /^(hi|hello|hey|greetings)/)) {
      return 'greeting';
    }
    
    if (this.matchesPattern(lowerContent, /(thanks|thank you|got it|bye|goodbye)/)) {
      return 'goodbye';
    }
    
    if (this.matchesPattern(lowerContent, /(help|assist|support)/)) {
      return 'help_request';
    }
    
    if (this.matchesPattern(lowerContent, /(what|how|when|where|why|which)/)) {
      return 'question';
    }
    
    return 'unknown';
  }

  // Entity extraction
  private extractEntities(content: string): Entity[] {
    const entities: Entity[] = [];
    
    // NRIC pattern
    const nricPattern = /[STFG]\d{7}[A-Z]/g;
    const nricMatches = content.match(nricPattern);
    if (nricMatches) {
      nricMatches.forEach(match => {
        entities.push({
          type: 'NRIC',
          value: match,
          confidence: 0.9,
          start: content.indexOf(match),
          end: content.indexOf(match) + match.length
        });
      });
    }
    
    // Phone number pattern
    const phonePattern = /(\+65\s?)?[689]\d{7}/g;
    const phoneMatches = content.match(phonePattern);
    if (phoneMatches) {
      phoneMatches.forEach(match => {
        entities.push({
          type: 'PHONE',
          value: match,
          confidence: 0.8,
          start: content.indexOf(match),
          end: content.indexOf(match) + match.length
        });
      });
    }
    
    // Date patterns
    const datePattern = /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g;
    const dateMatches = content.match(datePattern);
    if (dateMatches) {
      dateMatches.forEach(match => {
        entities.push({
          type: 'DATE',
          value: match,
          confidence: 0.7,
          start: content.indexOf(match),
          end: content.indexOf(match) + match.length
        });
      });
    }
    
    return entities;
  }

  // Sentiment analysis (simplified)
  private analyzeSentiment(content: string): NLPResult['sentiment'] {
    const positiveWords = ['good', 'great', 'excellent', 'happy', 'pleased', 'satisfied', 'wonderful'];
    const negativeWords = ['bad', 'terrible', 'awful', 'unhappy', 'dissatisfied', 'horrible', 'emergency', 'urgent', 'critical'];
    
    const lowerContent = content.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerContent.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerContent.includes(word)).length;
    
    if (negativeCount > positiveCount) {
      if (negativeCount >= 2) return 'VERY_NEGATIVE';
      return 'NEGATIVE';
    } else if (positiveCount > negativeCount) {
      if (positiveCount >= 2) return 'VERY_POSITIVE';
      return 'POSITIVE';
    }
    
    return 'NEUTRAL';
  }

  // Medical keyword extraction
  private extractMedicalKeywords(content: string): string[] {
    const medicalTerms = [
      'fever', 'cough', 'headache', 'pain', 'sick', 'nausea', 'vomiting', 'diarrhea',
      'blood pressure', 'diabetes', 'heart', 'lung', 'kidney', 'liver', 'stomach',
      'throat', 'ear', 'eye', 'skin', 'back', 'neck', 'chest', 'arm', 'leg',
      'temperature', 'symptoms', 'medication', 'treatment', 'diagnosis', 'consultation'
    ];
    
    const lowerContent = content.toLowerCase();
    return medicalTerms.filter(term => lowerContent.includes(term));
  }

  // Urgency assessment
  private assessUrgency(content: string, medicalKeywords: string[]): NLPResult['urgency'] {
    const lowerContent = content.toLowerCase();
    
    // Emergency keywords
    for (const keyword of EMERGENCY_KEYWORDS) {
      if (lowerContent.includes(keyword.toLowerCase())) {
        return 'EMERGENCY';
      }
    }
    
    // High urgency patterns
    if (this.matchesPattern(lowerContent, /(very|extremely|severe|severe|intense)/) && medicalKeywords.length > 0) {
      return 'URGENT';
    }
    
    // Medium urgency patterns
    if (medicalKeywords.length > 0 || this.matchesPattern(lowerContent, /(pain|sick|unwell)/)) {
      return 'HIGH';
    }
    
    // Low urgency patterns
    if (this.matchesPattern(lowerContent, /(general|information|hours|location|book)/)) {
      return 'LOW';
    }
    
    return 'NORMAL';
  }

  // Emergency detection
  private isEmergency(nlpResult: NLPResult): boolean {
    return nlpResult.urgency === 'EMERGENCY' || 
           nlpResult.intent === 'emergency' ||
           EMERGENCY_KEYWORDS.some(keyword => 
             nlpResult.medicalKeywords.includes(keyword.toLowerCase())
           );
  }

  // Emergency handling
  private handleEmergency(message: z.infer<typeof MessageSchema>, nlpResult: NLPResult): ChatbotResponse {
    const emergencyKnowledge = this.knowledgeBase['emergency'];
    
    return {
      success: true,
      response: emergencyKnowledge.response,
      responseType: 'EMERGENCY',
      confidence: 0.95,
      requiresEscalation: true,
      escalationReason: 'Medical emergency detected',
      action: emergencyKnowledge.action,
      followUp: "I've flagged this as a medical emergency. A human agent will contact you immediately. If this is life-threatening, please call 995 (Singapore emergency services) or visit the nearest emergency room right away.",
      metadata: {
        urgency: 'EMERGENCY',
        requiresImmediateHuman: true,
        emergencyContacts: ['+65 9111 0000', '995'],
        timestamp: new Date().toISOString()
      }
    };
  }

  // Response generation
  private async generateResponse(message: z.infer<typeof MessageSchema>, nlpResult: NLPResult): Promise<ChatbotResponse> {
    // Handle greeting
    if (nlpResult.intent === 'greeting') {
      return this.handleGreeting(message, nlpResult);
    }
    
    // Handle goodbye
    if (nlpResult.intent === 'goodbye') {
      return this.handleGoodbye(message, nlpResult);
    }
    
    // Check knowledge base
    if (this.knowledgeBase[nlpResult.intent]) {
      const knowledge = this.knowledgeBase[nlpResult.intent];
      return this.generateKnowledgeBasedResponse(message, nlpResult, knowledge);
    }
    
    // Fallback response
    return this.generateFallbackResponse(message, nlpResult);
  }

  // Greeting handler
  private handleGreeting(message: z.infer<typeof MessageSchema>, nlpResult: NLPResult): ChatbotResponse {
    const responses = GREETING_RESPONSES;
    const response = responses[Math.floor(Math.random() * responses.length)];
    
    return {
      success: true,
      response,
      responseType: 'GREETING',
      confidence: 0.9,
      requiresEscalation: false,
      followUp: "I can help you with: booking appointments, health information, clinic hours, fees, doctor information, and emergency assistance. What would you like to know?",
      metadata: { intent: 'greeting', responseType: 'greeting' }
    };
  }

  // Goodbye handler
  private handleGoodbye(message: z.infer<typeof MessageSchema>, nlpResult: NLPResult): ChatbotResponse {
    return {
      success: true,
      response: "Thank you for contacting My Family Clinic. If you have any other questions, feel free to reach out anytime. Take care and stay healthy!",
      responseType: 'GOODBYE',
      confidence: 0.9,
      requiresEscalation: false,
      metadata: { intent: 'goodbye' }
    };
  }

  // Knowledge-based response
  private generateKnowledgeBasedResponse(
    message: z.infer<typeof MessageSchema>,
    nlpResult: NLPResult,
    knowledge: MedicalKnowledge[string]
  ): ChatbotResponse {
    let response = knowledge.response;
    
    // Personalize response if we have context
    if (message.context?.userName) {
      response = response.replace('{name}', message.context.userName);
    }
    
    return {
      success: true,
      response,
      responseType: this.mapIntentToResponseType(nlpResult.intent),
      confidence: knowledge.confidence,
      requiresEscalation: knowledge.requiresHuman || nlpResult.confidence < this.config.confidenceThreshold,
      action: knowledge.action,
      followUp: knowledge.followUpQuestions?.[0] || undefined,
      metadata: {
        intent: nlpResult.intent,
        confidence: nlpResult.confidence,
        knowledgeMatch: true
      }
    };
  }

  // Fallback response
  private generateFallbackResponse(message: z.infer<typeof MessageSchema>, nlpResult?: NLPResult): ChatbotResponse {
    const responses = FALLBACK_RESPONSES;
    const response = responses[Math.floor(Math.random() * responses.length)];
    
    return {
      success: true,
      response,
      responseType: 'FALLBACK',
      confidence: 0.3,
      requiresEscalation: true,
      escalationReason: 'Low confidence response',
      followUp: "To better assist you, I can connect you with one of our staff members. Would you like to speak with someone now?",
      metadata: {
        intent: 'fallback',
        confidence: 0.3,
        requiresHuman: true
      }
    };
  }

  // Confidence calculation
  private calculateConfidence(intent: string, entities: Entity[], sentiment: NLPResult['sentiment']): number {
    let confidence = 0.5; // Base confidence
    
    // Boost confidence for known intents
    if (intent !== 'unknown') {
      confidence += 0.3;
    }
    
    // Boost confidence for entities found
    if (entities.length > 0) {
      confidence += entities.length * 0.1;
    }
    
    // Adjust for sentiment
    if (sentiment === 'NEUTRAL') {
      confidence += 0.1;
    }
    
    return Math.min(confidence, 1.0);
  }

  // Human requirement check
  private requiresHuman(intent: string, confidence: number, urgency: NLPResult['urgency']): boolean {
    return confidence < this.config.confidenceThreshold ||
           urgency === 'EMERGENCY' ||
           intent === 'unknown' ||
           this.knowledgeBase[intent]?.requiresHuman === true;
  }

  // Response type determination
  private determineResponseType(intent: string, urgency: NLPResult['urgency']): ResponseType {
    if (urgency === 'EMERGENCY') return 'EMERGENCY';
    if (intent === 'appointment_booking') return 'BOOKING';
    if (intent === 'goodbye') return 'GOODBYE';
    if (intent === 'greeting') return 'GREETING';
    if (this.knowledgeBase[intent]?.action?.type === 'PROVIDE_INFO') return 'INFORMATION';
    if (this.knowledgeBase[intent]?.requiresHuman) return 'ESCALATION';
    return 'FAQ';
  }

  // Intent to response type mapping
  private mapIntentToResponseType(intent: string): ResponseType {
    const mapping: Record<string, ResponseType> = {
      'appointment_booking': 'BOOKING',
      'clinic_hours': 'INFORMATION',
      'emergency': 'EMERGENCY',
      'symptoms': 'INFORMATION',
      'healthier_sg': 'INFORMATION',
      'fees': 'INFORMATION',
      'doctors': 'INFORMATION',
      'location': 'INFORMATION',
      'greeting': 'GREETING',
      'goodbye': 'GOODBYE'
    };
    
    return mapping[intent] || 'FAQ';
  }

  // Pattern matching helper
  private matchesPattern(content: string, pattern: RegExp): boolean {
    return pattern.test(content);
  }

  // Conversation history management
  private updateConversationHistory(userId: string, message: ChatMessage): void {
    if (!this.conversationHistory.has(userId)) {
      this.conversationHistory.set(userId, []);
    }
    
    const history = this.conversationHistory.get(userId)!;
    history.push(message);
    
    // Keep only last 50 messages
    if (history.length > 50) {
      history.shift();
    }
  }

  // Get conversation history
  getConversationHistory(userId: string): ChatMessage[] {
    return this.conversationHistory.get(userId) || [];
  }

  // Session management
  private updateUserSession(userId: string, sessionData: Partial<UserSession>): void {
    if (!this.userSessions.has(userId)) {
      this.userSessions.set(userId, {
        userId,
        startTime: new Date(),
        lastActivity: new Date(),
        messageCount: 0,
        escalationCount: 0,
        satisfaction: null
      });
    }
    
    const session = this.userSessions.get(userId)!;
    Object.assign(session, sessionData, { lastActivity: new Date() });
  }

  // Logging and analytics
  private async logInteraction(message: z.infer<typeof MessageSchema>): Promise<void> {
    try {
      await prisma.chatbotInteraction.create({
        data: {
          chatbotId: this.config.name,
          customerId: message.senderId || 'anonymous',
          customerName: message.senderName,
          sessionId: `session_${Date.now()}`,
          userMessage: message.content,
          userSentiment: 'NEUTRAL', // Simplified
          botResponse: '', // Will be filled after response generation
          responseType: 'FAQ',
          confidence: 0.0,
          responseTime: 0,
          entities: [],
          context: message.context,
          action: null,
          resolved: false,
          channel: message.channel,
          deviceType: 'UNKNOWN',
          clinicId: message.clinicId,
          doctorId: message.doctorId,
          serviceId: message.serviceId
        }
      });
    } catch (error) {
      console.error('Failed to log interaction:', error);
    }
  }

  private async updatePerformanceMetrics(responseTime: number, confidence: number): Promise<void> {
    // Update chatbot config performance metrics
    try {
      await prisma.chatbotConfig.update({
        where: { name: this.config.name },
        data: {
          totalInteractions: { increment: 1 },
          avgResponseTime: responseTime,
          qualityScore: confidence
        }
      });
    } catch (error) {
      console.error('Failed to update performance metrics:', error);
    }
  }

  // Event handling
  onMessageProcessed(callback: (message: z.infer<typeof MessageSchema>, response: ChatbotResponse) => void): void {
    this.eventEmitter.on('messageProcessed', callback);
  }

  onEscalationRequired(callback: (message: z.infer<typeof MessageSchema>, reason: string) => void): void {
    this.eventEmitter.on('escalationRequired', callback);
  }

  // Configuration update
  updateConfig(newConfig: Partial<z.infer<typeof ChatbotConfigSchema>>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Health check
  async getHealthStatus(): Promise<any> {
    return {
      status: this.config.isActive ? 'healthy' : 'inactive',
      uptime: Date.now() - (this.userSessions.size > 0 ? Date.now() : Date.now()),
      messageCount: this.conversationHistory.size,
      activeSessions: this.userSessions.size,
      averageConfidence: 0.85, // Simplified
      lastResponse: new Date()
    };
  }
}

// Type definitions
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  nlpResult?: NLPResult;
  responseType?: ResponseType;
}

interface UserSession {
  userId: string;
  startTime: Date;
  lastActivity: Date;
  messageCount: number;
  escalationCount: number;
  satisfaction: number | null;
}

// Chatbot Factory
export class ChatbotFactory {
  private static instances: Map<string, IntelligentChatbot> = new Map();

  static createChatbot(config: z.infer<typeof ChatbotConfigSchema>): IntelligentChatbot {
    const chatbot = new IntelligentChatbot(config);
    this.instances.set(config.name, chatbot);
    return chatbot;
  }

  static getChatbot(name: string): IntelligentChatbot | undefined {
    return this.instances.get(name);
  }

  static getAllChatbots(): IntelligentChatbot[] {
    return Array.from(this.instances.values());
  }

  static removeChatbot(name: string): void {
    this.instances.delete(name);
  }
}

// Export default chatbot
export default IntelligentChatbot;