// ========================================
// MULTI-CHANNEL CONTACT SYSTEM TYPES
// Sub-Phase 9.7: TypeScript Type Definitions
// Comprehensive Multi-Channel Communication Platform
// ========================================

// Re-export existing database types
export type { User, Clinic, Doctor, Service, UserProfile, UserPreferences } from './database'

// ========================================
// COMMUNICATION CHANNEL TYPES
// ========================================

// Channel Types
export enum ChannelType {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PHONE = 'PHONE',
  CHAT = 'CHAT',
  WHATSAPP = 'WHATSAPP',
  TELEGRAM = 'TELEGRAM',
  FACEBOOK = 'FACEBOOK',
  TWITTER = 'TWITTER',
  INSTAGRAM = 'INSTAGRAM',
  LINKEDIN = 'LINKEDIN',
  WEB_FORM = 'WEB_FORM',
  VIDEO_CALL = 'VIDEO_CALL',
  VOICE_MESSAGE = 'VOICE_MESSAGE',
  SOCIAL_MEDIA = 'SOCIAL_MEDIA',
  MOBILE_APP = 'MOBILE_APP',
  PORTAL = 'PORTAL',
  API = 'API'
}

// Channel Categories
export enum ChannelCategory {
  SYNCHRONOUS = 'SYNCHRONOUS',    // Real-time communication
  ASYNCHRONOUS = 'ASYNCHRONOUS',   // Non-real-time communication
  SOCIAL = 'SOCIAL',               // Social media platforms
  BUSINESS = 'BUSINESS',           // Business communication tools
  EMERGENCY = 'EMERGENCY',         // Emergency communication channels
  ACCESSIBILITY = 'ACCESSIBILITY'  // Accessibility-focused channels
}

// Integration Types
export enum IntegrationType {
  INBOUND = 'INBOUND',        // Incoming message integration
  OUTBOUND = 'OUTBOUND',      // Outgoing message integration
  BIDIRECTIONAL = 'BIDIRECTIONAL',  // Two-way communication
  WEBHOOK = 'WEBHOOK',        // Webhook-based integration
  API = 'API',                // API-based integration
  SOCIAL = 'SOCIAL',          // Social media integration
  VOICE = 'VOICE',            // Voice services integration
  VIDEO = 'VIDEO'             // Video conferencing integration
}

// Integration Health Status
export enum IntegrationHealth {
  HEALTHY = 'HEALTHY',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
  DOWN = 'DOWN',
  UNKNOWN = 'UNKNOWN',
  MAINTENANCE = 'MAINTENANCE'
}

// ========================================
// CONVERSATION TYPES
// ========================================

// Conversation Status
export enum ConversationStatus {
  ACTIVE = 'ACTIVE',
  WAITING = 'WAITING',
  PENDING = 'PENDING',
  ON_HOLD = 'ON_HOLD',
  ESCALATED = 'ESCALATED',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  ARCHIVED = 'ARCHIVED',
  CANCELLED = 'CANCELLED'
}

// Conversation Priority
export enum ConversationPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
  CRITICAL = 'CRITICAL',
  VIP = 'VIP',
  EMERGENCY = 'EMERGENCY'
}

// ========================================
// MESSAGE TYPES
// ========================================

// Message Types
export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  DOCUMENT = 'DOCUMENT',
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO',
  LOCATION = 'LOCATION',
  CONTACT = 'CONTACT',
  STICKER = 'STICKER',
  TEMPLATE = 'TEMPLATE',
  SYSTEM = 'SYSTEM',
  NOTIFICATION = 'NOTIFICATION',
  CAROUSEL = 'CAROUSEL',
  QUICK_REPLY = 'QUICK_REPLY',
  INTERACTIVE = 'INTERACTIVE',
  FORM = 'FORM'
}

// Media Types
export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  DOCUMENT = 'DOCUMENT',
  APPLICATION = 'APPLICATION',
  OTHER = 'OTHER'
}

// Message Sender Types
export enum MessageSenderType {
  CUSTOMER = 'CUSTOMER',
  AGENT = 'AGENT',
  BOT = 'BOT',
  SYSTEM = 'SYSTEM',
  AUTOMATION = 'AUTOMATION',
  WEBHOOK = 'WEBHOOK',
  API = 'API'
}

// Message Recipient Types
export enum MessageRecipientType {
  CUSTOMER = 'CUSTOMER',
  AGENT = 'AGENT',
  GROUP = 'GROUP',
  BROADCAST = 'BROADCAST',
  SYSTEM = 'SYSTEM',
  API = 'API'
}

// Message Status
export enum MessageStatus {
  PENDING = 'PENDING',
  SENDING = 'SENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED'
}

// Delivery Status
export enum DeliveryStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED',
  BOUNCED = 'BOUNCED',
  REPLIED = 'REPLIED',
  UNSUBSCRIBED = 'UNSUBSCRIBED'
}

// Message Sentiment
export enum MessageSentiment {
  VERY_NEGATIVE = 'VERY_NEGATIVE',
  NEGATIVE = 'NEGATIVE',
  NEUTRAL = 'NEUTRAL',
  POSITIVE = 'POSITIVE',
  VERY_POSITIVE = 'VERY_POSITIVE',
  UNKNOWN = 'UNKNOWN'
}

// Message Intent
export enum MessageIntent {
  GREETING = 'GREETING',
  QUESTION = 'QUESTION',
  COMPLAINT = 'COMPLAINT',
  COMPLIMENT = 'COMPLIMENT',
  REQUEST = 'REQUEST',
  APPOINTMENT = 'APPOINTMENT',
  EMERGENCY = 'EMERGENCY',
  INFORMATION = 'INFORMATION',
  SUPPORT = 'SUPPORT',
  ESCALATION = 'ESCALATION',
  GOODBYE = 'GOODBYE',
  UNKNOWN = 'UNKNOWN'
}

// ========================================
// SOCIAL MEDIA TYPES
// ========================================

// Social Platforms
export enum SocialPlatform {
  FACEBOOK = 'FACEBOOK',
  TWITTER = 'TWITTER',
  INSTAGRAM = 'INSTAGRAM',
  LINKEDIN = 'LINKEDIN',
  YOUTUBE = 'YOUTUBE',
  TIKTOK = 'TIKTOK',
  TUMBLR = 'TUMBLR',
  REDDIT = 'REDDIT',
  PINTEREST = 'PINTEREST',
  SNAPCHAT = 'SNAPCHAT',
  WECHAT = 'WECHAT',
  LINE = 'LINE'
}

// Mention Types
export enum MentionType {
  DIRECT_MENTION = 'DIRECT_MENTION',
  HASHTAG = 'HASHTAG',
  COMMENT = 'COMMENT',
  SHARE = 'SHARE',
  DIRECT_MESSAGE = 'DIRECT_MESSAGE',
  TAG = 'TAG',
  REFERENCE = 'REFERENCE',
  BRAND_MENTION = 'BRAND_MENTION',
  EMERGENCY = 'EMERGENCY'
}

// Mention Status
export enum MentionStatus {
  NEW = 'NEW',
  REVIEWED = 'REVIEWED',
  RESPONDED = 'RESPONDED',
  ESCALATED = 'ESCALATED',
  IGNORED = 'IGNORED',
  RESOLVED = 'RESOLVED'
}

// Connection Status
export enum ConnectionStatus {
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  ERROR = 'ERROR',
  MAINTENANCE = 'MAINTENANCE',
  UNKNOWN = 'UNKNOWN',
  RATE_LIMITED = 'RATE_LIMITED'
}

// ========================================
// VOICE & VIDEO TYPES
// ========================================

// Voice Providers
export enum VoiceProvider {
  GOOGLE = 'GOOGLE',
  AWS_POLLY = 'AWS_POLLY',
  AZURE = 'AZURE',
  OPENAI_WHISPER = 'OPENAI_WHISPER',
  DEEPGRAM = 'DEEPGRAM',
  ASSEMBLYAI = 'ASSEMBLYAI',
  REV = 'REV',
  SPEECHMATICS = 'SPEECHMATICS',
  COQUI = 'COQUI',
  WAVE2VEC = 'WAVE2VEC'
}

// Video Platforms
export enum VideoPlatform {
  ZOOM = 'ZOOM',
  TEAMS = 'TEAMS',
  GOOGLE_MEET = 'GOOGLE_MEET',
  SKYPE = 'SKYPE',
  WHATSAPP_VIDEO = 'WHATSAPP_VIDEO',
  FACETIME = 'FACETIME',
  WEBEX = 'WEBEX',
  GOTOMEETING = 'GOTOMEETING',
  JITSI = 'JITSI',
  DAILY = 'DAILY',
  TWILIO_VIDEO = 'TWILIO_VIDEO',
  AGORA = 'AGORA',
  VONAGE = 'VONAGE',
  OPENVIDU = 'OPENVIDU'
}

// Video Consultation Status
export enum VideoConsultationStatus {
  PENDING = 'PENDING',
  SCHEDULED = 'SCHEDULED',
  WAITING = 'WAITING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
  RESCHEDULED = 'RESCHEDULED',
  TECHNICAL_ISSUE = 'TECHNICAL_ISSUE'
}

// Video Quality
export enum VideoQuality {
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR',
  UNKNOWN = 'UNKNOWN',
  DISCONNECTED = 'DISCONNECTED'
}

// Payment Status
export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED'
}

// Consultation Priority
export enum ConsultationPriority {
  ROUTINE = 'ROUTINE',
  URGENT = 'URGENT',
  EMERGENCY = 'EMERGENCY',
  PRIORITY = 'PRIORITY',
  SAME_DAY = 'SAME_DAY',
  WALK_IN = 'WALK_IN'
}

// ========================================
// LIVE CHAT TYPES
// ========================================

// Chat Session Status
export enum ChatSessionStatus {
  WAITING = 'WAITING',
  ACTIVE = 'ACTIVE',
  TRANSFERRED = 'TRANSFERRED',
  ON_HOLD = 'ON_HOLD',
  ESCALATED = 'ESCALATED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  TIMEOUT = 'TIMEOUT',
  ABANDONED = 'ABANDONED'
}

// Chat Priority
export enum ChatPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
  CRITICAL = 'CRITICAL',
  VIP = 'VIP',
  EMERGENCY = 'EMERGENCY'
}

// ========================================
// CONTACT HISTORY TYPES
// ========================================

// Contact Interaction Types
export enum ContactInteractionType {
  INITIAL_CONTACT = 'INITIAL_CONTACT',
  FOLLOW_UP = 'FOLLOW_UP',
  RESOLUTION = 'RESOLUTION',
  ESCALATION = 'ESCALATION',
  COMPLAINT = 'COMPLAINT',
  COMPLIMENT = 'COMPLIMENT',
  INFORMATION_REQUEST = 'INFORMATION_REQUEST',
  APPOINTMENT_BOOKING = 'APPOINTMENT_BOOKING',
  MEDICAL_CONSULTATION = 'MEDICAL_CONSULTATION',
  TECHNICAL_SUPPORT = 'TECHNICAL_SUPPORT',
  EMERGENCY_CONTACT = 'EMERGENCY_CONTACT'
}

// Contact History Status
export enum ContactHistoryStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  ESCALATED = 'ESCALATED',
  CANCELLED = 'CANCELLED',
  ON_HOLD = 'ON_HOLD',
  TRANSFERRED = 'TRANSFERRED'
}

// ========================================
// CHATBOT TYPES
// ========================================

// Chatbot Response Types
export enum ChatbotResponseType {
  GREETING = 'GREETING',
  INFORMATION = 'INFORMATION',
  ESCALATION = 'ESCALATION',
  BOOKING = 'BOOKING',
  FAQ = 'FAQ',
  EMERGENCY = 'EMERGENCY',
  GOODBYE = 'GOODBYE',
  FALLBACK = 'FALLBACK',
  CONFIRMATION = 'CONFIRMATION',
  REJECTION = 'REJECTION',
  CLARIFICATION = 'CLARIFICATION'
}

// Logic Operators
export enum LogicOperator {
  AND = 'AND',
  OR = 'OR',
  NOT = 'NOT',
  XOR = 'XOR'
}

// ========================================
// ROUTING TYPES
// ========================================

// Routing Method
export enum RoutingMethod {
  DIRECT = 'DIRECT',
  ROUND_ROBIN = 'ROUND_ROBIN',
  LEAST_LOADED = 'LEAST_LOADED',
  SKILL_BASED = 'SKILL_BASED',
  TIME_BASED = 'TIME_BASED',
  PRIORITY_BASED = 'PRIORITY_BASED'
}

// Routing Target Type
export enum RoutingTargetType {
  AGENT = 'AGENT',
  TEAM = 'TEAM',
  DEPARTMENT = 'DEPARTMENT',
  CHATBOT = 'CHATBOT',
  ESCALATION = 'ESCALATION'
}

// Escalation Level
export enum EscalationLevel {
  L1_AGENT = 'L1_AGENT',
  L2_SUPERVISOR = 'L2_SUPERVISOR',
  L3_MANAGER = 'L3_MANAGER',
  L4_SPECIALIST = 'L4_SPECIALIST',
  L5_MANAGEMENT = 'L5_MANAGEMENT',
  EMERGENCY = 'EMERGENCY'
}

// ========================================
// DEVICE & USER TYPES
// ========================================

// Device Type
export enum DeviceType {
  DESKTOP = 'DESKTOP',
  MOBILE = 'MOBILE',
  TABLET = 'TABLET',
  SMARTWATCH = 'SMARTWATCH',
  TV = 'TV',
  UNKNOWN = 'UNKNOWN'
}

// Patient Type
export enum PatientType {
  NEW = 'NEW',
  EXISTING = 'EXISTING',
  VIP = 'VIP',
  EMERGENCY = 'EMERGENCY',
  FOLLOW_UP = 'FOLLOW_UP'
}

// Urgency Level
export enum UrgencyLevel {
  ROUTINE = 'ROUTINE',
  URGENT = 'URGENT',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
  EMERGENCY = 'EMERGENCY'
}

// ========================================
// INTERFACE DEFINITIONS
// ========================================

// Communication Channel Interface
export interface CommunicationChannel {
  id: string
  name: string
  displayName: string
  type: ChannelType
  category: ChannelCategory
  isActive: boolean
  isEnabled: boolean
  requiresAuth: boolean
  supportsRealTime: boolean
  supportsFiles: boolean
  maxFileSize?: number
  supportedFileTypes: string[]
  apiEndpoint?: string
  rateLimit?: number
  timeout?: number
  hipaaCompliant: boolean
  requiresConsent: boolean
  dataRetention?: number
  encryptionRequired: boolean
  syncEnabled: boolean
  autoResponse: boolean
  intelligentRouting: boolean
  icon?: string
  color?: string
  description?: string
  messageCount: number
  avgResponseTime?: number
  successRate?: number
  createdAt: Date
  updatedAt: Date
}

// Channel Conversation Interface
export interface ChannelConversation {
  id: string
  channelId: string
  conversationId: string
  subject?: string
  priority: ConversationPriority
  customerId?: string
  customerName: string
  customerEmail?: string
  customerPhone?: string
  agentId?: string
  agentName?: string
  status: ConversationStatus
  subStatus?: string
  isClosed: boolean
  isArchived: boolean
  clinicId?: string
  doctorId?: string
  serviceId?: string
  patientId?: string
  appointmentId?: string
  preferredChannel?: string
  language: string
  timezone?: string
  businessHours: boolean
  slaTarget?: number
  slaBreached: boolean
  firstResponseAt?: Date
  lastResponseAt?: Date
  resolvedAt?: Date
  messageCount: number
  agentResponseCount: number
  customerResponseCount: number
  escalationCount: number
  externalRefs: Record<string, any>
  metadata: Record<string, any>
  createdAt: Date
  updatedAt: Date
  lastMessageAt: Date
  closedAt?: Date
}

// Channel Message Interface
export interface ChannelMessage {
  id: string
  channelId: string
  conversationId?: string
  messageId: string
  threadId?: string
  content: string
  messageType: MessageType
  mediaType?: MediaType
  senderId?: string
  senderName: string
  senderType: MessageSenderType
  senderChannel: string
  recipientId?: string
  recipientName?: string
  recipientType?: MessageRecipientType
  status: MessageStatus
  deliveryStatus: DeliveryStatus
  sentAt: Date
  deliveredAt?: Date
  readAt?: Date
  processedAt?: Date
  clinicId?: string
  doctorId?: string
  serviceId?: string
  patientId?: string
  hasAttachments: boolean
  attachmentCount: number
  attachments: any[]
  sentiment: MessageSentiment
  intent?: MessageIntent
  confidence?: number
  requiresResponse: boolean
  autoResponseSent: boolean
  isVoiceMessage: boolean
  transcript?: string
  audioDuration?: number
  speechConfidence?: number
  processed: boolean
  processingNotes?: string
  errorMessage?: string
  metadata: Record<string, any>
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

// Chatbot Interaction Interface
export interface ChatbotInteraction {
  id: string
  chatbotId: string
  conversationId?: string
  messageId?: string
  customerId?: string
  customerName: string
  sessionId: string
  userMessage: string
  userIntent?: string
  userSentiment: MessageSentiment
  botResponse: string
  responseType: ChatbotResponseType
  confidence?: number
  responseTime?: number
  entities: any[]
  context: Record<string, any>
  intentConfidence?: number
  action?: string
  actionData: Record<string, any>
  escalationTriggered: boolean
  resolved: boolean
  customerSatisfaction?: number
  feedback?: string
  clinicId?: string
  doctorId?: string
  serviceId?: string
  medicalKeywords: string[]
  channel: string
  deviceType?: DeviceType
  browserType?: string
  createdAt: Date
}

// Live Chat Session Interface
export interface LiveChatSession {
  id: string
  sessionId: string
  customerId?: string
  customerName: string
  customerEmail?: string
  customerPhone?: string
  clinicId?: string
  doctorId?: string
  serviceId?: string
  department?: string
  assignedAgent?: string
  assignedAgentName?: string
  isAgentAssigned: boolean
  agentJoinedAt?: Date
  status: ChatSessionStatus
  priority: ChatPriority
  queuePosition?: number
  isTyping: boolean
  isArchived: boolean
  isEmergency: boolean
  requiresCallback: boolean
  patientType: PatientType
  urgencyLevel: UrgencyLevel
  medicalKeywords: string[]
  startedAt: Date
  firstResponseAt?: Date
  endedAt?: Date
  messageCount: number
  waitTime?: number
  responseTime?: number
  resolutionTime?: number
  connectionId?: string
  lastActivity: Date
  escalationTriggered: boolean
  escalatedAt?: Date
  integrationData: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

// Unified Contact History Interface
export interface UnifiedContactHistory {
  id: string
  customerId: string
  contactId?: string
  conversationId?: string
  interactionType: ContactInteractionType
  channel: string
  subject?: string
  summary?: string
  primaryContact: string
  agentName?: string
  teamName?: string
  clinicId?: string
  doctorId?: string
  serviceId?: string
  patientId?: string
  appointmentId?: string
  status: ContactHistoryStatus
  outcome?: string
  satisfaction?: number
  startedAt: Date
  endedAt?: Date
  responseTime?: number
  resolutionTime?: number
  messageCount: number
  escalationCount: number
  followUpRequired: boolean
  nextAction?: string
  cost?: number
  efficiency?: number
  qualityScore?: number
  createdAt: Date
}

// Social Media Mention Interface
export interface SocialMediaMention {
  id: string
  socialAccountId: string
  postId: string
  author: string
  authorId?: string
  content: string
  postUrl?: string
  platform: SocialPlatform
  mentionType: MentionType
  status: MentionStatus
  isPublic: boolean
  isUrgent: boolean
  requiresResponse: boolean
  clinicId?: string
  doctorId?: string
  serviceId?: string
  medicalKeywords: string[]
  responseSent: boolean
  responseAt?: Date
  responseBy?: string
  escalated: boolean
  escalationReason?: string
  sentiment: MessageSentiment
  urgencyScore?: number
  likes: number
  shares: number
  comments: number
  reach?: number
  createdAt: Date
  updatedAt: Date
}

// Video Consultation Interface
export interface VideoConsultation {
  id: string
  patientId?: string
  doctorId?: string
  clinicId?: string
  consultationId: string
  appointmentId?: string
  subject?: string
  priority: ConsultationPriority
  status: VideoConsultationStatus
  scheduledAt?: Date
  startedAt?: Date
  endedAt?: Date
  duration?: number
  platform: VideoPlatform
  meetingUrl?: string
  meetingId?: string
  accessCode?: string
  patientName: string
  patientEmail?: string
  patientPhone?: string
  patientDevice?: string
  doctorName?: string
  doctorEmail?: string
  serviceType?: string
  consultationType?: string
  medicalNotes?: string
  prescriptions: any[]
  connectionQuality: VideoQuality
  technicalIssues?: string
  recordingEnabled: boolean
  recordingUrl?: string
  calendarEventId?: string
  paymentStatus: PaymentStatus
  connectionAttempts: number
  dropoutCount: number
  satisfactionScore?: number
  createdAt: Date
  updatedAt: Date
}

// WhatsApp Business Interface
export interface WhatsAppBusiness {
  id: string
  clinicId?: string
  businessName: string
  displayName: string
  phoneNumber: string
  verifiedName?: string
  accessToken?: string
  webhookVerifyToken?: string
  webhookUrl?: string
  isActive: boolean
  autoReply: boolean
  businessHours: Record<string, any>
  welcomeMessage?: string
  autoReplyMessage?: string
  offHoursMessage?: string
  hipaaCompliant: boolean
  consentRequired: boolean
  dataRetention?: number
  messageCount: number
  responseRate?: number
  avgResponseTime?: number
  createdAt: Date
  updatedAt: Date
}

// Voice Configuration Interface
export interface VoiceConfig {
  id: string
  name: string
  provider: VoiceProvider
  isActive: boolean
  apiEndpoint?: string
  model?: string
  supportedLanguages: string[]
  defaultLanguage: string
  medicalVocabulary: string[]
  customTerms: Record<string, any>
  confidenceThreshold: number
  maxDuration?: number
  sampleRate?: number
  encoding?: string
  enablePunctuation: boolean
  enableSpeakerId: boolean
  enableSentiment: boolean
  avgProcessingTime?: number
  successRate?: number
  createdAt: Date
  updatedAt: Date
}

// ========================================
// ROUTING AND CONFIGURATION TYPES
// ========================================

// Routing Rule Interface
export interface RoutingRule {
  id: string
  name: string
  description?: string
  isActive: boolean
  priority: number
  channelId?: string
  conditions: any[]
  logicOperator: LogicOperator
  targetType: RoutingTargetType
  targetId?: string
  targetName: string
  action?: string
  method: RoutingMethod
  roundRobinGroup?: string
  maxWorkload?: number
  availabilityCheck: boolean
  businessHoursOnly: boolean
  effectiveHours: Record<string, any>
  timezone?: string
  fallbackEnabled: boolean
  fallbackRuleId?: string
  usageCount: number
  successRate?: number
  avgResponseTime?: number
  createdAt: Date
  updatedAt: Date
}

// Channel Integration Interface
export interface ChannelIntegration {
  id: string
  channelId: string
  name: string
  type: IntegrationType
  provider: string
  providerConfig: Record<string, any>
  credentials: Record<string, any>
  isActive: boolean
  autoStart: boolean
  webhooksEnabled: boolean
  lastHealthCheck?: Date
  healthStatus: IntegrationHealth
  errorCount: number
  uptimePercentage?: number
  messagesProcessed: number
  lastMessageAt?: Date
  createdAt: Date
  updatedAt: Date
}

// ========================================
// API RESPONSE TYPES
// ========================================

// API Response for Multi-Channel Operations
export interface MultiChannelResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  meta?: {
    total?: number
    hasMore?: boolean
    page?: number
    limit?: number
  }
}

// Batch Operation Response
export interface BatchOperationResponse {
  success: boolean
  results: Array<{
    id: string
    success: boolean
    error?: string
    data?: any
  }>
  summary: {
    total: number
    successful: number
    failed: number
  }
}

// Channel Performance Metrics
export interface ChannelMetrics {
  totalMessages: number
  sentMessages: number
  deliveredMessages: number
  readMessages: number
  failedMessages: number
  deliveryRate: number
  responseRate: number
  avgResponseTime: number
  sentimentStats: Record<string, number>
}

// Contact History Summary
export interface ContactHistorySummary {
  totalInteractions: number
  byChannel: Record<string, number>
  byType: Record<ContactInteractionType, number>
  avgResponseTime: number
  satisfactionScore?: number
  escalationRate: number
}

// ========================================
// VALIDATION SCHEMAS
// ========================================

// This would typically be in the validation files, but keeping for reference
export interface CreateMessageSchema {
  channelId: string
  conversationId?: string
  messageId: string
  content: string
  messageType: MessageType
  senderName: string
  senderType: MessageSenderType
  senderChannel: string
}

export interface CreateConversationSchema {
  channelId: string
  conversationId: string
  subject?: string
  priority: ConversationPriority
  customerName: string
  customerEmail?: string
  customerPhone?: string
}

export interface CreateChatSessionSchema {
  sessionId: string
  customerName: string
  customerEmail?: string
  customerPhone?: string
  priority: ChatPriority
  medicalKeywords?: string[]
}

export interface CreateContactHistorySchema {
  customerId: string
  interactionType: ContactInteractionType
  channel: string
  subject?: string
  summary?: string
  primaryContact: string
  startedAt: Date
}
