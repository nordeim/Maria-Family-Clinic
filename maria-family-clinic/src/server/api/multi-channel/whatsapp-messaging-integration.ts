// ========================================
// WHATSAPP & MESSAGING PLATFORM INTEGRATION
// Sub-Phase 9.7: WhatsApp Business API Integration
// Comprehensive messaging platform integration with automation
// ========================================

import { z } from 'zod';
import { EventEmitter } from 'events';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// WhatsApp Business configuration schema
const WhatsAppConfigSchema = z.object({
  clinicId: z.string().optional(),
  businessName: z.string(),
  displayName: z.string(),
  phoneNumber: z.string(),
  verifiedName: z.string().optional(),
  accessToken: z.string(),
  webhookVerifyToken: z.string(),
  webhookUrl: z.string().optional(),
  isActive: z.boolean().default(true),
  autoReply: z.boolean().default(false),
  businessHours: z.object({
    start: z.string().default('08:00'),
    end: z.string().default('20:00'),
    timezone: z.string().default('Asia/Singapore')
  }).default({}),
  welcomeMessage: z.string().default('Welcome to My Family Clinic! How can I help you today?'),
  autoReplyMessage: z.string().default('Thank you for your message. We will get back to you soon.'),
  offHoursMessage: z.string().default('We are currently offline. Please leave a message and we will respond during business hours.'),
  hipaaCompliant: z.boolean().default(false),
  consentRequired: z.boolean().default(true),
  dataRetention: z.number().default(90) // days
});

// WhatsApp message
export interface WhatsAppMessage {
  id: string;
  messageId: string;
  from: string; // Phone number
  to: string; // Clinic phone number
  type: 'text' | 'image' | 'document' | 'audio' | 'video' | 'template' | 'interactive';
  content: {
    text?: string;
    caption?: string;
    filename?: string;
    url?: string;
    mediaId?: string;
    interactive?: any;
    template?: any;
  };
  timestamp: number;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  contact?: {
    name?: string;
  };
  context?: {
    from?: string;
    id?: string;
  };
  errors?: Array<{
    code: number;
    title: string;
    message: string;
    errorData?: any;
  }>;
}

// WhatsApp conversation
export interface WhatsAppConversation {
  id: string;
  customerId: string;
  customerPhone: string;
  customerName?: string;
  clinicId?: string;
  doctorId?: string;
  serviceId?: string;
  status: 'ACTIVE' | 'WAITING' | 'CLOSED' | 'ESCALATED';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' | 'EMERGENCY';
  lastMessageAt: Date;
  messageCount: number;
  resolvedAt?: Date;
  escalationCount: number;
  medicalKeywords: string[];
  sessionData: any;
  createdAt: Date;
  updatedAt: Date;
}

// WhatsApp template
export interface WhatsAppTemplate {
  name: string;
  language: string;
  category: 'UTILITY' | 'MARKETING' | 'AUTHENTICATION';
  components: Array<{
    type: 'header' | 'body' | 'footer' | 'buttons' | 'example';
    format?: 'text' | 'image' | 'video' | 'document';
    text?: string;
    image?: {
      link: string;
    };
    video?: {
      link: string;
    };
    document?: {
      link: string;
      filename: string;
    };
    buttons?: Array<{
      type: 'call_to_action' | 'quick_reply' | 'phone_number';
      text?: string;
      phone_number?: string;
      url?: string;
    }>;
    example?: {
      header_text?: string[];
      body_text?: string[][];
    };
  }>;
}

// Message processing result
export interface MessageProcessingResult {
  success: boolean;
  response?: string;
  template?: WhatsAppTemplate;
  escalated: boolean;
  escalationReason?: string;
  action?: 'BOOK_APPOINTMENT' | 'PROVIDE_INFO' | 'ESCALATE' | 'BOOK_VIDEO_CALL' | 'COLLECT_INFO' | 'EMERGENCY';
  metadata?: any;
}

// Base messaging platform interface
export interface MessagingPlatform {
  sendMessage(phoneNumber: string, message: string | WhatsAppTemplate, options?: any): Promise<boolean>;
  sendMedia(phoneNumber: string, mediaUrl: string, mediaType: string, caption?: string): Promise<boolean>;
  getMessageStatus(messageId: string): Promise<string>;
  handleWebhook(payload: any): Promise<void>;
  validateWebhook(payload: any, signature: string): boolean;
  createTemplate(template: WhatsAppTemplate): Promise<boolean>;
}

// WhatsApp Business API Provider
export class WhatsAppBusinessProvider implements MessagingPlatform {
  private config: z.infer<typeof WhatsAppConfigSchema>;
  private eventEmitter: EventEmitter;
  private conversations: Map<string, WhatsAppConversation> = new Map();
  private isOperatingHours: boolean = true;

  constructor(config: z.infer<typeof WhatsAppConfigSchema>) {
    this.config = WhatsAppConfigSchema.parse(config);
    this.eventEmitter = new EventEmitter();
    this.checkOperatingHours();
  }

  // Send text message
  async sendMessage(phoneNumber: string, message: string | WhatsAppTemplate, options?: any): Promise<boolean> {
    try {
      // In production, make actual API call to WhatsApp Business API
      // const response = await fetch(`${this.config.baseUrl}/messages`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${this.config.accessToken}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     messaging_product: 'whatsapp',
      //     to: phoneNumber,
      //     type: typeof message === 'string' ? 'text' : 'template',
      //     text: typeof message === 'string' ? { preview_url: false, body: message } : undefined,
      //     template: typeof message === 'object' ? message : undefined
      //   })
      // });

      console.log(`WhatsApp message sent to ${phoneNumber}:`, message);

      this.eventEmitter.emit('messageSent', { phoneNumber, message, options });
      return true;
    } catch (error) {
      console.error('Failed to send WhatsApp message:', error);
      return false;
    }
  }

  // Send media message
  async sendMedia(phoneNumber: string, mediaUrl: string, mediaType: string, caption?: string): Promise<boolean> {
    try {
      const mediaTypeMap: Record<string, string> = {
        'image': 'image',
        'video': 'video',
        'document': 'document',
        'audio': 'audio'
      };

      const whatsappType = mediaTypeMap[mediaType] || 'document';

      // In production, upload media first, then send message with media ID
      console.log(`WhatsApp media sent to ${phoneNumber}:`, { mediaUrl, mediaType, caption });

      this.eventEmitter.emit('mediaSent', { phoneNumber, mediaUrl, mediaType, caption });
      return true;
    } catch (error) {
      console.error('Failed to send WhatsApp media:', error);
      return false;
    }
  }

  // Get message status
  async getMessageStatus(messageId: string): Promise<string> {
    try {
      // In production, query WhatsApp API for message status
      // const response = await fetch(`${this.config.baseUrl}/messages/${messageId}`, {
      //   headers: { 'Authorization': `Bearer ${this.config.accessToken}` }
      // });
      
      return 'delivered'; // Mock status
    } catch (error) {
      console.error('Failed to get message status:', error);
      return 'failed';
    }
  }

  // Handle incoming webhook
  async handleWebhook(payload: any): Promise<void> {
    try {
      if (!payload.entry || !payload.entry[0]?.changes) {
        return;
      }

      for (const change of payload.entry[0].changes) {
        if (change.value?.messages) {
          for (const message of change.value.messages) {
            await this.processIncomingMessage(message, change.value);
          }
        }

        if (change.value?.statuses) {
          for (const status of change.value.statuses) {
            await this.processMessageStatus(status);
          }
        }
      }
    } catch (error) {
      console.error('Failed to handle WhatsApp webhook:', error);
    }
  }

  // Validate webhook signature
  validateWebhook(payload: any, signature: string): boolean {
    // In production, verify HMAC signature
    return true; // Simplified for demo
  }

  // Create message template
  async createTemplate(template: WhatsAppTemplate): Promise<boolean> {
    try {
      // In production, create template via WhatsApp API
      console.log('WhatsApp template created:', template);
      return true;
    } catch (error) {
      console.error('Failed to create WhatsApp template:', error);
      return false;
    }
  }

  // Process incoming message
  private async processIncomingMessage(message: any, context: any): Promise<void> {
    try {
      const whatsappMessage: WhatsAppMessage = {
        id: message.id,
        messageId: message.id,
        from: message.from,
        to: message.to,
        type: message.type,
        content: this.extractMessageContent(message),
        timestamp: parseInt(message.timestamp),
        status: 'sent',
        contact: context.contacts?.[0],
        context: message.context
      };

      // Find or create conversation
      const conversation = await this.getOrCreateConversation(whatsappMessage);

      // Process message content
      const processingResult = await this.processMessage(whatsappMessage, conversation);

      // Update conversation
      this.updateConversation(conversation, whatsappMessage);

      // Save to database
      await this.saveMessage(whatsappMessage, conversation);

      // Send response if needed
      if (processingResult.response || processingResult.template) {
        await this.sendResponse(whatsappMessage.from, processingResult);
      }

      this.eventEmitter.emit('messageReceived', whatsappMessage, conversation, processingResult);
      
    } catch (error) {
      console.error('Failed to process incoming WhatsApp message:', error);
    }
  }

  // Extract message content based on type
  private extractMessageContent(message: any): any {
    switch (message.type) {
      case 'text':
        return { text: message.text.body };
      case 'image':
        return { 
          caption: message.image.caption,
          url: message.image.url,
          mediaId: message.image.id
        };
      case 'document':
        return {
          filename: message.document.filename,
          url: message.document.url,
          mediaId: message.document.id
        };
      case 'audio':
        return {
          url: message.audio.url,
          mediaId: message.audio.id
        };
      case 'video':
        return {
          caption: message.video.caption,
          url: message.video.url,
          mediaId: message.video.id
        };
      case 'interactive':
        return { interactive: message.interactive };
      default:
        return { text: 'Unknown message type' };
    }
  }

  // Get or create conversation
  private async getOrCreateConversation(message: WhatsAppMessage): Promise<WhatsAppConversation> {
    const conversationId = message.from;
    
    if (this.conversations.has(conversationId)) {
      return this.conversations.get(conversationId)!;
    }

    // Create new conversation
    const conversation: WhatsAppConversation = {
      id: `wa_conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      customerId: message.from,
      customerPhone: message.from,
      customerName: message.contact?.name || 'WhatsApp User',
      status: 'ACTIVE',
      priority: 'NORMAL',
      lastMessageAt: new Date(message.timestamp * 1000),
      messageCount: 1,
      escalationCount: 0,
      medicalKeywords: this.extractMedicalKeywords(message.content.text || ''),
      sessionData: {},
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.conversations.set(conversationId, conversation);
    
    // Save to database
    try {
      await prisma.channelConversation.create({
        data: {
          id: conversation.id,
          channelId: 'whatsapp',
          conversationId: conversation.customerId,
          customerId: conversation.customerId,
          customerName: conversation.customerName,
          customerPhone: conversation.customerPhone,
          status: 'ACTIVE',
          priority: conversation.priority,
          lastMessageAt: conversation.lastMessageAt,
          messageCount: conversation.messageCount,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt
        }
      });
    } catch (error) {
      console.error('Failed to save conversation:', error);
    }

    return conversation;
  }

  // Process message content
  private async processMessage(message: WhatsAppMessage, conversation: WhatsAppConversation): Promise<MessageProcessingResult> {
    const content = message.content.text || '';
    const lowerContent = content.toLowerCase();

    // Check for emergency keywords
    if (this.isEmergency(lowerContent)) {
      return {
        success: true,
        response: "⚠️ This appears to be a medical emergency. Please call 995 (Singapore emergency services) immediately or visit the nearest emergency room. For immediate clinic assistance, call +65 9111 0000.",
        escalated: true,
        escalationReason: 'Emergency detected',
        action: 'EMERGENCY',
        metadata: { urgency: 'EMERGENCY' }
      };
    }

    // Check for appointment booking requests
    if (this.isAppointmentRequest(lowerContent)) {
      return {
        success: true,
        response: "I'd be happy to help you book an appointment! Please let me know:\n1. What type of consultation you need\n2. Your preferred date and time\n3. Any specific symptoms or concerns\n\nYou can also call +65 9111 0000 to book directly.",
        action: 'BOOK_APPOINTMENT',
        metadata: { intent: 'appointment_booking' }
      };
    }

    // Check for clinic hours inquiries
    if (this.isClinicHoursInquiry(lowerContent)) {
      return {
        success: true,
        response: "My Family Clinic hours:\n📅 Mon-Fri: 8:00 AM - 8:00 PM\n📅 Saturday: 8:00 AM - 5:00 PM\n📅 Sunday: Closed\n\nFor emergencies, we have 24/7 services. Call +65 9111 0000 for urgent matters.",
        action: 'PROVIDE_INFO',
        metadata: { infoType: 'clinic_hours' }
      };
    }

    // Check for medical questions
    if (this.isMedicalQuestion(lowerContent)) {
      return {
        success: true,
        response: "I understand you have a health concern. While I can provide general information, it's important to have a proper medical evaluation. Would you like to:\n1. Book an appointment with our doctors\n2. Get information about our services\n3. Speak with a nurse\n\nFor urgent medical issues, please call +65 9111 0000.",
        escalated: true,
        escalationReason: 'Medical question requires professional assessment',
        action: 'PROVIDE_INFO',
        metadata: { medicalKeywords: conversation.medicalKeywords }
      };
    }

    // Check for video consultation requests
    if (this.isVideoConsultationRequest(lowerContent)) {
      return {
        success: true,
        response: "Great! We offer video consultations for your convenience. Video consultations are perfect for follow-ups, medication reviews, and non-emergency consultations.\n\nWould you like me to help you book a video consultation? Please call +65 9111 0000 for scheduling.",
        action: 'BOOK_VIDEO_CALL',
        metadata: { intent: 'video_consultation' }
      };
    }

    // Check for Healthier SG inquiries
    if (this.isHealthierSGInquiry(lowerContent)) {
      return {
        success: true,
        response: "Healthier SG is Singapore's national health program offering subsidized healthcare! 🏥\n\nBenefits include:\n• Health screenings\n• Chronic disease management\n• Specialist referrals\n• Lower healthcare costs\n\nAre you enrolled? I can help explain the enrollment process or book your health screening.",
        action: 'PROVIDE_INFO',
        metadata: { infoType: 'healthier_sg' }
      };
    }

    // Default response
    return {
      success: true,
      response: "Thank you for your message! I can help you with:\n🏥 Appointment booking\n⏰ Clinic hours & location\n💊 Health information\n📱 Video consultations\n🏥 Healthier SG enrollment\n\nFor immediate assistance, call +65 9111 0000. How can I help you today?",
      action: 'PROVIDE_INFO',
      metadata: { defaultResponse: true }
    };
  }

  // Send response message
  private async sendResponse(phoneNumber: string, result: MessageProcessingResult): Promise<void> {
    try {
      if (result.response) {
        await this.sendMessage(phoneNumber, result.response);
      }
    } catch (error) {
      console.error('Failed to send response:', error);
    }
  }

  // Update conversation
  private updateConversation(conversation: WhatsAppConversation, message: WhatsAppMessage): void {
    conversation.lastMessageAt = new Date(message.timestamp * 1000);
    conversation.messageCount++;
    conversation.updatedAt = new Date();

    // Update medical keywords
    const newKeywords = this.extractMedicalKeywords(message.content.text || '');
    conversation.medicalKeywords = [...new Set([...conversation.medicalKeywords, ...newKeywords])];
  }

  // Process message status updates
  private async processMessageStatus(status: any): Promise<void> {
    try {
      console.log('WhatsApp message status update:', status);
      this.eventEmitter.emit('messageStatusUpdated', status);
    } catch (error) {
      console.error('Failed to process message status:', error);
    }
  }

  // Utility methods
  private isEmergency(content: string): boolean {
    const emergencyKeywords = [
      'emergency', 'urgent', 'help', 'can\'t breathe', 'chest pain',
      'heart attack', 'stroke', 'accident', 'injury', 'bleeding',
      'unconscious', 'severe pain', 'can\'t move', 'overdose'
    ];
    return emergencyKeywords.some(keyword => content.includes(keyword));
  }

  private isAppointmentRequest(content: string): boolean {
    const appointmentKeywords = [
      'appointment', 'book', 'schedule', 'slot', 'time', 'date',
      'see doctor', 'consultation', 'visit', 'clinic'
    ];
    return appointmentKeywords.some(keyword => content.includes(keyword));
  }

  private isClinicHoursInquiry(content: string): boolean {
    const hoursKeywords = [
      'hours', 'open', 'close', 'when', 'time', 'available',
      'operating hours', 'clinic hours'
    ];
    return hoursKeywords.some(keyword => content.includes(keyword));
  }

  private isMedicalQuestion(content: string): boolean {
    const medicalKeywords = [
      'symptoms', 'pain', 'fever', 'cough', 'headache', 'sick',
      'unwell', 'hurt', 'medication', 'treatment', 'diagnosis'
    ];
    return medicalKeywords.some(keyword => content.includes(keyword));
  }

  private isVideoConsultationRequest(content: string): boolean {
    const videoKeywords = [
      'video', 'call', 'online', 'virtual', 'telehealth', 'remote',
      'consultation', 'zoom', 'skype', 'facetime'
    ];
    return videoKeywords.some(keyword => content.includes(keyword));
  }

  private isHealthierSGInquiry(content: string): boolean {
    const healthierSGKeywords = [
      'healthier', 'healthier sg', 'government', 'subsidy', 'screening',
      'checkup', 'national', 'singapore health'
    ];
    return healthierSGKeywords.some(keyword => content.includes(keyword));
  }

  private extractMedicalKeywords(content: string): string[] {
    const medicalTerms = [
      'doctor', 'appointment', 'symptoms', 'pain', 'fever', 'cough',
      'headache', 'medication', 'treatment', 'checkup', 'consultation',
      'clinic', 'hospital', 'emergency', 'health', 'medical'
    ];
    const lowerContent = content.toLowerCase();
    return medicalTerms.filter(term => lowerContent.includes(term));
  }

  // Check operating hours
  private checkOperatingHours(): void {
    const updateOperatingStatus = () => {
      const now = new Date();
      const singaporeTime = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Singapore',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(now);
      
      const [currentHour, currentMinute] = singaporeTime.split(':').map(Number);
      const currentTime = currentHour * 60 + currentMinute;
      const [startHour, startMinute] = this.config.businessHours.start.split(':').map(Number);
      const [endHour, endMinute] = this.config.businessHours.end.split(':').map(Number);
      const startTime = startHour * 60 + startMinute;
      const endTime = endHour * 60 + endMinute;
      
      const wasOperating = this.isOperatingHours;
      this.isOperatingHours = currentTime >= startTime && currentTime <= endTime;
      
      if (wasOperating !== this.isOperatingHours) {
        this.eventEmitter.emit('operatingStatusChanged', this.isOperatingHours);
      }
    };

    updateOperatingStatus();
    setInterval(updateOperatingStatus, 60000);
  }

  // Database operations
  private async saveMessage(message: WhatsAppMessage, conversation: WhatsAppConversation): Promise<void> {
    try {
      await prisma.channelMessage.create({
        data: {
          channelId: 'whatsapp',
          conversationId: conversation.customerId,
          messageId: message.id,
          content: message.content.text || JSON.stringify(message.content),
          messageType: this.mapWhatsAppTypeToMessageType(message.type),
          senderId: message.from,
          senderName: message.contact?.name || 'WhatsApp User',
          senderType: 'CUSTOMER',
          senderChannel: 'whatsapp',
          status: 'RECEIVED',
          sentAt: new Date(message.timestamp * 1000),
          clinicId: conversation.clinicId,
          patientId: conversation.customerId,
          conversationId: conversation.id
        }
      });
    } catch (error) {
      console.error('Failed to save WhatsApp message:', error);
    }
  }

  private mapWhatsAppTypeToMessageType(whatsAppType: string): string {
    const typeMap: Record<string, string> = {
      'text': 'TEXT',
      'image': 'IMAGE',
      'document': 'DOCUMENT',
      'audio': 'AUDIO',
      'video': 'VIDEO',
      'interactive': 'INTERACTIVE'
    };
    return typeMap[whatsAppType] || 'TEXT';
  }

  // Public methods
  public getConversations(): WhatsAppConversation[] {
    return Array.from(this.conversations.values());
  }

  public getConversation(customerId: string): WhatsAppConversation | undefined {
    return this.conversations.get(customerId);
  }

  public getOperatingStatus(): boolean {
    return this.isOperatingHours;
  }

  public async getHealthStatus(): Promise<any> {
    return {
      status: 'healthy',
      isOperatingHours: this.isOperatingHours,
      businessHours: this.config.businessHours,
      activeConversations: this.conversations.size,
      webhookConfigured: !!this.config.webhookUrl
    };
  }

  // Event listeners
  onMessageReceived(callback: (message: WhatsAppMessage, conversation: WhatsAppConversation, result: MessageProcessingResult) => void): void {
    this.eventEmitter.on('messageReceived', callback);
  }

  onMessageSent(callback: (data: any) => void): void {
    this.eventEmitter.on('messageSent', callback);
  }

  onMessageStatusUpdated(callback: (status: any) => void): void {
    this.eventEmitter.on('messageStatusUpdated', callback);
  }

  onOperatingStatusChanged(callback: (isOperatingHours: boolean) => void): void {
    this.eventEmitter.on('operatingStatusChanged', callback);
  }
}

// Telegram Provider (additional messaging platform)
export class TelegramProvider implements MessagingPlatform {
  private config: {
    botToken: string;
    chatId: string;
    isActive: boolean;
  };
  private eventEmitter: EventEmitter;

  constructor(config: { botToken: string; chatId: string; isActive: boolean }) {
    this.config = config;
    this.eventEmitter = new EventEmitter();
  }

  async sendMessage(phoneNumber: string, message: string | WhatsAppTemplate, options?: any): Promise<boolean> {
    try {
      // In production, use Telegram Bot API
      console.log(`Telegram message sent to ${phoneNumber}:`, message);
      return true;
    } catch (error) {
      console.error('Failed to send Telegram message:', error);
      return false;
    }
  }

  async sendMedia(phoneNumber: string, mediaUrl: string, mediaType: string, caption?: string): Promise<boolean> {
    return true;
  }

  async getMessageStatus(messageId: string): Promise<string> {
    return 'delivered';
  }

  async handleWebhook(payload: any): Promise<void> {
    console.log('Telegram webhook received:', payload);
  }

  validateWebhook(payload: any, signature: string): boolean {
    return true;
  }

  async createTemplate(template: WhatsAppTemplate): Promise<boolean> {
    return true;
  }
}

// Messaging Integration Service
export class MessagingIntegrationService {
  private providers: Map<string, MessagingPlatform> = new Map();
  private eventEmitter: EventEmitter;

  constructor() {
    this.eventEmitter = new EventEmitter();
    this.initializeProviders();
  }

  // Initialize providers
  private initializeProviders(): void {
    // WhatsApp Business provider
    const whatsappConfig = WhatsAppConfigSchema.parse({
      clinicId: 'default',
      businessName: 'My Family Clinic',
      displayName: 'My Family Clinic',
      phoneNumber: '+6512345678',
      accessToken: 'demo_access_token',
      webhookVerifyToken: 'demo_verify_token',
      isActive: true,
      autoReply: true,
      businessHours: { start: '08:00', end: '20:00', timezone: 'Asia/Singapore' }
    });
    
    this.providers.set('whatsapp', new WhatsAppBusinessProvider(whatsappConfig));

    // Telegram provider
    this.providers.set('telegram', new TelegramProvider({
      botToken: 'demo_bot_token',
      chatId: 'demo_chat_id',
      isActive: true
    }));
  }

  // Send message via specified platform
  async sendMessage(platform: string, phoneNumber: string, message: string | WhatsAppTemplate, options?: any): Promise<boolean> {
    const provider = this.providers.get(platform);
    if (!provider) {
      throw new Error(`Provider not found: ${platform}`);
    }

    return await provider.sendMessage(phoneNumber, message, options);
  }

  // Send media message
  async sendMedia(platform: string, phoneNumber: string, mediaUrl: string, mediaType: string, caption?: string): Promise<boolean> {
    const provider = this.providers.get(platform);
    if (!provider) {
      throw new Error(`Provider not found: ${platform}`);
    }

    return await provider.sendMedia(phoneNumber, mediaUrl, mediaType, caption);
  }

  // Handle webhook
  async handleWebhook(platform: string, payload: any, signature?: string): Promise<void> {
    const provider = this.providers.get(platform);
    if (!provider) {
      throw new Error(`Provider not found: ${platform}`);
    }

    if (signature && !provider.validateWebhook(payload, signature)) {
      throw new Error(`Invalid webhook signature for ${platform}`);
    }

    await provider.handleWebhook(payload);
  }

  // Get available providers
  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  // Get health status
  async getHealthStatus(): Promise<any> {
    const providerStatus: any = {};
    
    for (const [name, provider] of this.providers) {
      try {
        providerStatus[name] = {
          status: 'active',
          available: true
        };
      } catch (error) {
        providerStatus[name] = {
          status: 'error',
          available: false,
          error: error.message
        };
      }
    }

    return {
      status: 'healthy',
      providers: providerStatus,
      totalProviders: this.providers.size
    };
  }

  // Event forwarding
  onMessageReceived(callback: (platform: string, message: any, conversation: any, result: any) => void): void {
    // Forward events from all providers
    for (const [platform, provider] of this.providers) {
      if ('onMessageReceived' in provider) {
        (provider as any).onMessageReceived((message: any, conversation: any, result: any) => {
          callback(platform, message, conversation, result);
        });
      }
    }
  }
}

// Export singleton instances
export const whatsappBusinessProvider = new WhatsAppBusinessProvider(
  WhatsAppConfigSchema.parse({
    clinicId: 'default',
    businessName: 'My Family Clinic',
    displayName: 'My Family Clinic',
    phoneNumber: '+6512345678',
    accessToken: 'demo_access_token',
    webhookVerifyToken: 'demo_verify_token',
    isActive: true,
    autoReply: true,
    businessHours: { start: '08:00', end: '20:00', timezone: 'Asia/Singapore' }
  })
);

export const messagingIntegrationService = new MessagingIntegrationService();

export default WhatsAppBusinessProvider;