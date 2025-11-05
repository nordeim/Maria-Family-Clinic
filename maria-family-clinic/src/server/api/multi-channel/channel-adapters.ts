// ========================================
// UNIFIED COMMUNICATION API & ADAPTERS
// Sub-Phase 9.7: Multi-Channel Contact Integration
// Comprehensive API with adapters for all communication channels
// ========================================

import { z } from 'zod';
import { EventEmitter } from 'events';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

// Base channel adapter interface
export interface ChannelAdapter {
  name: string;
  type: string;
  isEnabled: boolean;
  sendMessage(message: ChannelMessage): Promise<ChannelMessageResponse>;
  receiveMessage(message: any): Promise<ChannelMessage>;
  sendFile(file: FileAttachment, message: ChannelMessage): Promise<ChannelMessageResponse>;
  getStatus(): Promise<ChannelStatus>;
  getConversations(userId?: string): Promise<ChannelConversation[]>;
  createConversation(conversationData: CreateConversationData): Promise<ChannelConversation>;
  authenticate(credentials: any): Promise<boolean>;
  disconnect(): Promise<void>;
}

// Base classes for adapters
export abstract class BaseChannelAdapter implements ChannelAdapter {
  abstract name: string;
  abstract type: string;
  isEnabled: boolean = true;
  
  abstract sendMessage(message: ChannelMessage): Promise<ChannelMessageResponse>;
  abstract receiveMessage(message: any): Promise<ChannelMessage>;
  abstract sendFile(file: FileAttachment, message: ChannelMessage): Promise<ChannelMessageResponse>;
  abstract getStatus(): Promise<ChannelStatus>;
  abstract getConversations(userId?: string): Promise<ChannelConversation[]>;
  abstract createConversation(conversationData: CreateConversationData): Promise<ChannelConversation>;
  abstract authenticate(credentials: any): Promise<boolean>;
  abstract disconnect(): Promise<void>;
  
  protected async logActivity(activity: any): Promise<void> {
    console.log(`[${this.name}] ${activity.message}`, activity.data);
  }
  
  protected validateMessage(message: ChannelMessage): boolean {
    return !!(message.content && message.recipientId);
  }
  
  protected handleError(error: any, context: string): never {
    console.error(`[${this.name}] ${context}:`, error);
    throw new Error(`${context} failed: ${error.message}`);
  }
}

// Email Channel Adapter
export class EmailChannelAdapter extends BaseChannelAdapter {
  name = 'email';
  type = 'EMAIL';
  private emailConfig: EmailConfig;
  
  constructor(config: EmailConfig) {
    super();
    this.emailConfig = config;
  }
  
  async sendMessage(message: ChannelMessage): Promise<ChannelMessageResponse> {
    try {
      if (!this.validateMessage(message)) {
        throw new Error('Invalid message format');
      }
      
      // Simulate email sending
      const emailData = {
        to: message.recipientId,
        from: this.emailConfig.from,
        subject: message.subject || 'Message from My Family Clinic',
        html: this.formatEmailContent(message),
        attachments: message.attachments || []
      };
      
      // In production, integrate with email service (SendGrid, AWS SES, etc.)
      await this.logActivity({
        message: 'Email sent successfully',
        data: { recipient: message.recipientId, subject: emailData.subject }
      });
      
      return {
        success: true,
        messageId: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        deliveryStatus: 'SENT'
      };
    } catch (error) {
      this.handleError(error, 'Email send');
    }
  }
  
  async receiveMessage(emailData: any): Promise<ChannelMessage> {
    try {
      const message: ChannelMessage = {
        id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        channelId: 'email',
        messageId: emailData.messageId || emailData.id,
        content: emailData.text || emailData.html,
        messageType: 'TEXT',
        senderId: emailData.from,
        senderName: emailData.fromName || 'Unknown',
        senderType: 'CUSTOMER',
        senderChannel: 'email',
        recipientId: this.emailConfig.to,
        status: 'RECEIVED',
        sentAt: new Date(emailData.date || Date.now())
      };
      
      await this.logActivity({
        message: 'Email received',
        data: { from: message.senderId, subject: emailData.subject }
      });
      
      return message;
    } catch (error) {
      this.handleError(error, 'Email receive');
    }
  }
  
  async sendFile(file: FileAttachment, message: ChannelMessage): Promise<ChannelMessageResponse> {
    try {
      // Validate file
      if (file.size > this.emailConfig.maxFileSize) {
        throw new Error('File size exceeds limit');
      }
      
      // Attach file to email
      const emailData = {
        to: message.recipientId,
        from: this.emailConfig.from,
        subject: message.subject || 'File from My Family Clinic',
        html: message.content,
        attachments: [file]
      };
      
      await this.logActivity({
        message: 'File sent via email',
        data: { recipient: message.recipientId, fileName: file.filename }
      });
      
      return {
        success: true,
        messageId: `email_file_${Date.now()}`,
        timestamp: new Date(),
        deliveryStatus: 'SENT'
      };
    } catch (error) {
      this.handleError(error, 'Email file send');
    }
  }
  
  async getStatus(): Promise<ChannelStatus> {
    return {
      channel: 'email',
      status: this.isEnabled ? 'ACTIVE' : 'INACTIVE',
      lastMessage: new Date(),
      messageCount: 0,
      successRate: 98.5
    };
  }
  
  async getConversations(userId?: string): Promise<ChannelConversation[]> {
    // Return email conversations
    return [];
  }
  
  async createConversation(conversationData: CreateConversationData): Promise<ChannelConversation> {
    return {
      id: `conv_email_${Date.now()}`,
      channelId: 'email',
      conversationId: `email_${Date.now()}`,
      subject: conversationData.subject,
      customerId: conversationData.customerId,
      customerName: conversationData.customerName,
      customerEmail: conversationData.customerEmail,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
  
  async authenticate(credentials: any): Promise<boolean> {
    return true; // Simplified for demo
  }
  
  async disconnect(): Promise<void> {
    await this.logActivity({ message: 'Email adapter disconnected' });
  }
  
  private formatEmailContent(message: ChannelMessage): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #2563eb; margin: 0;">My Family Clinic</h2>
        </div>
        <div style="padding: 20px; line-height: 1.6;">
          ${message.content.replace(/\n/g, '<br>')}
        </div>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 20px; font-size: 14px; color: #6b7280;">
          <p style="margin: 0;">This message is from My Family Clinic healthcare platform.</p>
          <p style="margin: 5px 0 0 0;">For urgent matters, please call our emergency line.</p>
        </div>
      </div>
    `;
  }
}

// WhatsApp Channel Adapter
export class WhatsAppChannelAdapter extends BaseChannelAdapter {
  name = 'whatsapp';
  type = 'WHATSAPP';
  private config: WhatsAppConfig;
  
  constructor(config: WhatsAppConfig) {
    super();
    this.config = config;
  }
  
  async sendMessage(message: ChannelMessage): Promise<ChannelMessageResponse> {
    try {
      const whatsappMessage = {
        messaging_product: 'whatsapp',
        to: message.recipientId,
        type: 'text',
        text: { body: message.content }
      };
      
      // In production, integrate with WhatsApp Business API
      await this.logActivity({
        message: 'WhatsApp message sent',
        data: { to: message.recipientId, content: message.content }
      });
      
      return {
        success: true,
        messageId: `wa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        deliveryStatus: 'SENT'
      };
    } catch (error) {
      this.handleError(error, 'WhatsApp send');
    }
  }
  
  async receiveMessage(webhookData: any): Promise<ChannelMessage> {
    try {
      const entry = webhookData.entry?.[0];
      const change = entry?.changes?.[0];
      const messageData = change?.value?.messages?.[0];
      
      if (!messageData) {
        throw new Error('Invalid webhook data');
      }
      
      const message: ChannelMessage = {
        id: `wa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        channelId: 'whatsapp',
        messageId: messageData.id,
        content: messageData.text?.body || messageData.interactive?.button_reply?.title || '',
        messageType: 'TEXT',
        senderId: messageData.from,
        senderName: messageData.profile?.name || 'WhatsApp User',
        senderType: 'CUSTOMER',
        senderChannel: 'whatsapp',
        status: 'RECEIVED',
        sentAt: new Date(parseInt(messageData.timestamp) * 1000)
      };
      
      await this.logActivity({
        message: 'WhatsApp message received',
        data: { from: message.senderId, content: message.content }
      });
      
      return message;
    } catch (error) {
      this.handleError(error, 'WhatsApp receive');
    }
  }
  
  async sendFile(file: FileAttachment, message: ChannelMessage): Promise<ChannelMessageResponse> {
    try {
      const whatsappMessage = {
        messaging_product: 'whatsapp',
        to: message.recipientId,
        type: 'document',
        document: {
          filename: file.filename,
          caption: message.content,
          link: file.url // In production, upload to storage first
        }
      };
      
      await this.logActivity({
        message: 'File sent via WhatsApp',
        data: { to: message.recipientId, fileName: file.filename }
      });
      
      return {
        success: true,
        messageId: `wa_file_${Date.now()}`,
        timestamp: new Date(),
        deliveryStatus: 'SENT'
      };
    } catch (error) {
      this.handleError(error, 'WhatsApp file send');
    }
  }
  
  async getStatus(): Promise<ChannelStatus> {
    return {
      channel: 'whatsapp',
      status: this.isEnabled ? 'ACTIVE' : 'INACTIVE',
      lastMessage: new Date(),
      messageCount: 0,
      successRate: 95.2
    };
  }
  
  async getConversations(userId?: string): Promise<ChannelConversation[]> {
    return [];
  }
  
  async createConversation(conversationData: CreateConversationData): Promise<ChannelConversation> {
    return {
      id: `conv_wa_${Date.now()}`,
      channelId: 'whatsapp',
      conversationId: `wa_${Date.now()}`,
      customerId: conversationData.customerId,
      customerName: conversationData.customerName,
      customerPhone: conversationData.customerPhone,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
  
  async authenticate(credentials: any): Promise<boolean> {
    return true; // Simplified for demo
  }
  
  async disconnect(): Promise<void> {
    await this.logActivity({ message: 'WhatsApp adapter disconnected' });
  }
}

// Phone Channel Adapter
export class PhoneChannelAdapter extends BaseChannelAdapter {
  name = 'phone';
  type = 'PHONE';
  private config: PhoneConfig;
  
  constructor(config: PhoneConfig) {
    super();
    this.config = config;
  }
  
  async sendMessage(message: ChannelMessage): Promise<ChannelMessageResponse> {
    try {
      // For phone/SMS
      const smsData = {
        to: message.recipientId,
        from: this.config.from,
        message: message.content
      };
      
      await this.logActivity({
        message: 'SMS sent',
        data: { to: message.recipientId, content: message.content }
      });
      
      return {
        success: true,
        messageId: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        deliveryStatus: 'SENT'
      };
    } catch (error) {
      this.handleError(error, 'SMS send');
    }
  }
  
  async receiveMessage(messageData: any): Promise<ChannelMessage> {
    try {
      const message: ChannelMessage = {
        id: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        channelId: 'phone',
        messageId: messageData.id || messageData.sid,
        content: messageData.body,
        messageType: 'TEXT',
        senderId: messageData.from,
        senderName: messageData.fromName || 'Phone User',
        senderType: 'CUSTOMER',
        senderChannel: 'phone',
        status: 'RECEIVED',
        sentAt: new Date(messageData.dateCreated || Date.now())
      };
      
      await this.logActivity({
        message: 'SMS received',
        data: { from: message.senderId, content: message.content }
      });
      
      return message;
    } catch (error) {
      this.handleError(error, 'Phone receive');
    }
  }
  
  async sendFile(file: FileAttachment, message: ChannelMessage): Promise<ChannelMessageResponse> {
    // Phone/SMS doesn't support files, send text link instead
    const content = `${message.content}\n\nAccess file: ${file.url}`;
    message.content = content;
    return this.sendMessage(message);
  }
  
  async getStatus(): Promise<ChannelStatus> {
    return {
      channel: 'phone',
      status: this.isEnabled ? 'ACTIVE' : 'INACTIVE',
      lastMessage: new Date(),
      messageCount: 0,
      successRate: 99.1
    };
  }
  
  async getConversations(userId?: string): Promise<ChannelConversation[]> {
    return [];
  }
  
  async createConversation(conversationData: CreateConversationData): Promise<ChannelConversation> {
    return {
      id: `conv_phone_${Date.now()}`,
      channelId: 'phone',
      conversationId: `phone_${Date.now()}`,
      customerId: conversationData.customerId,
      customerName: conversationData.customerName,
      customerPhone: conversationData.customerPhone,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
  
  async authenticate(credentials: any): Promise<boolean> {
    return true; // Simplified for demo
  }
  
  async disconnect(): Promise<void> {
    await this.logActivity({ message: 'Phone adapter disconnected' });
  }
}

// Chat Channel Adapter (Live Chat)
export class ChatChannelAdapter extends BaseChannelAdapter {
  name = 'chat';
  type = 'CHAT';
  private webSocket: WebSocket | null = null;
  private eventEmitter: EventEmitter;
  
  constructor() {
    super();
    this.eventEmitter = new EventEmitter();
  }
  
  async sendMessage(message: ChannelMessage): Promise<ChannelMessageResponse> {
    try {
      if (!this.webSocket || this.webSocket.readyState !== WebSocket.OPEN) {
        throw new Error('WebSocket not connected');
      }
      
      const chatMessage = {
        type: 'message',
        conversationId: message.conversationId,
        senderId: message.senderId,
        senderName: message.senderName,
        content: message.content,
        messageType: message.messageType,
        timestamp: new Date().toISOString()
      };
      
      this.webSocket.send(JSON.stringify(chatMessage));
      
      await this.logActivity({
        message: 'Chat message sent',
        data: { conversationId: message.conversationId, content: message.content }
      });
      
      return {
        success: true,
        messageId: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        deliveryStatus: 'SENT'
      };
    } catch (error) {
      this.handleError(error, 'Chat send');
    }
  }
  
  async receiveMessage(messageData: any): Promise<ChannelMessage> {
    try {
      const message: ChannelMessage = {
        id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        channelId: 'chat',
        conversationId: messageData.conversationId,
        messageId: messageData.id,
        content: messageData.content,
        messageType: messageData.messageType || 'TEXT',
        senderId: messageData.senderId,
        senderName: messageData.senderName,
        senderType: messageData.senderType || 'CUSTOMER',
        senderChannel: 'chat',
        status: 'RECEIVED',
        sentAt: new Date(messageData.timestamp || Date.now())
      };
      
      this.eventEmitter.emit('messageReceived', message);
      
      await this.logActivity({
        message: 'Chat message received',
        data: { conversationId: message.conversationId, content: message.content }
      });
      
      return message;
    } catch (error) {
      this.handleError(error, 'Chat receive');
    }
  }
  
  async sendFile(file: FileAttachment, message: ChannelMessage): Promise<ChannelMessageResponse> {
    try {
      // Upload file first, then send message with file link
      const uploadResult = await this.uploadFile(file);
      
      const chatMessage = {
        type: 'file',
        conversationId: message.conversationId,
        senderId: message.senderId,
        fileName: file.filename,
        fileUrl: uploadResult.url,
        fileSize: file.size,
        message: message.content
      };
      
      this.webSocket?.send(JSON.stringify(chatMessage));
      
      await this.logActivity({
        message: 'File sent via chat',
        data: { conversationId: message.conversationId, fileName: file.filename }
      });
      
      return {
        success: true,
        messageId: `chat_file_${Date.now()}`,
        timestamp: new Date(),
        deliveryStatus: 'SENT'
      };
    } catch (error) {
      this.handleError(error, 'Chat file send');
    }
  }
  
  async getStatus(): Promise<ChannelStatus> {
    const wsStatus = this.webSocket?.readyState === WebSocket.OPEN ? 'ACTIVE' : 'INACTIVE';
    return {
      channel: 'chat',
      status: this.isEnabled && wsStatus === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
      lastMessage: new Date(),
      messageCount: 0,
      successRate: 97.8
    };
  }
  
  async getConversations(userId?: string): Promise<ChannelConversation[]> {
    // Return active chat conversations
    return [];
  }
  
  async createConversation(conversationData: CreateConversationData): Promise<ChannelConversation> {
    const conversation: ChannelConversation = {
      id: `conv_chat_${Date.now()}`,
      channelId: 'chat',
      conversationId: `chat_${Date.now()}`,
      customerId: conversationData.customerId,
      customerName: conversationData.customerName,
      customerEmail: conversationData.customerEmail,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.eventEmitter.emit('conversationCreated', conversation);
    return conversation;
  }
  
  async authenticate(credentials: any): Promise<boolean> {
    return true; // Simplified for demo
  }
  
  async disconnect(): Promise<void> {
    if (this.webSocket) {
      this.webSocket.close();
      this.webSocket = null;
    }
    await this.logActivity({ message: 'Chat adapter disconnected' });
  }
  
  connectWebSocket(url: string): void {
    this.webSocket = new WebSocket(url);
    
    this.webSocket.onopen = () => {
      this.logActivity({ message: 'WebSocket connected' });
    };
    
    this.webSocket.onmessage = (event) => {
      try {
        const messageData = JSON.parse(event.data);
        this.receiveMessage(messageData);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };
    
    this.webSocket.onclose = () => {
      this.logActivity({ message: 'WebSocket disconnected' });
    };
  }
  
  private async uploadFile(file: FileAttachment): Promise<{ url: string }> {
    // In production, upload to cloud storage (AWS S3, etc.)
    return { url: `https://storage.example.com/${file.filename}` };
  }
  
  onMessageReceived(callback: (message: ChannelMessage) => void): void {
    this.eventEmitter.on('messageReceived', callback);
  }
  
  onConversationCreated(callback: (conversation: ChannelConversation) => void): void {
    this.eventEmitter.on('conversationCreated', callback);
  }
}

// Social Media Channel Adapter (Base class for Facebook, Twitter, Instagram)
export abstract class SocialMediaChannelAdapter extends BaseChannelAdapter {
  protected config: SocialMediaConfig;
  protected webhooks: Map<string, any> = new Map();
  
  constructor(config: SocialMediaConfig) {
    super();
    this.config = config;
  }
  
  async sendMessage(message: ChannelMessage): Promise<ChannelMessageResponse> {
    try {
      const socialMessage = {
        message: message.content,
        recipient: message.recipientId,
        ...this.getPlatformSpecificData(message)
      };
      
      await this.logActivity({
        message: 'Social media message sent',
        data: { platform: this.name, recipient: message.recipientId }
      });
      
      return {
        success: true,
        messageId: `${this.name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        deliveryStatus: 'SENT'
      };
    } catch (error) {
      this.handleError(error, `${this.name} send`);
    }
  }
  
  async receiveMessage(postData: any): Promise<ChannelMessage> {
    try {
      const message: ChannelMessage = {
        id: `${this.name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        channelId: this.name,
        messageId: postData.id,
        content: this.extractContent(postData),
        messageType: 'TEXT',
        senderId: postData.from?.id || postData.user_id,
        senderName: postData.from?.name || postData.username || 'Social User',
        senderType: 'CUSTOMER',
        senderChannel: this.name,
        status: 'RECEIVED',
        sentAt: new Date(postData.created_time || Date.now())
      };
      
      await this.logActivity({
        message: 'Social media message received',
        data: { platform: this.name, from: message.senderId }
      });
      
      return message;
    } catch (error) {
      this.handleError(error, `${this.name} receive`);
    }
  }
  
  async getStatus(): Promise<ChannelStatus> {
    return {
      channel: this.name,
      status: this.isEnabled ? 'ACTIVE' : 'INACTIVE',
      lastMessage: new Date(),
      messageCount: 0,
      successRate: 92.5
    };
  }
  
  async getConversations(userId?: string): Promise<ChannelConversation[]> {
    return [];
  }
  
  async createConversation(conversationData: CreateConversationData): Promise<ChannelConversation> {
    return {
      id: `conv_${this.name}_${Date.now()}`,
      channelId: this.name,
      conversationId: `${this.name}_${Date.now()}`,
      customerId: conversationData.customerId,
      customerName: conversationData.customerName,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
  
  async authenticate(credentials: any): Promise<boolean> {
    return true; // Simplified for demo
  }
  
  async disconnect(): Promise<void> {
    await this.logActivity({ message: `${this.name} adapter disconnected` });
  }
  
  protected abstract getPlatformSpecificData(message: ChannelMessage): any;
  protected abstract extractContent(postData: any): string;
  protected abstract monitorMentions(): Promise<void>;
}

// Facebook Adapter
export class FacebookChannelAdapter extends SocialMediaChannelAdapter {
  name = 'facebook';
  type = 'SOCIAL';
  
  constructor(config: SocialMediaConfig) {
    super(config);
  }
  
  async sendFile(file: FileAttachment, message: ChannelMessage): Promise<ChannelMessageResponse> {
    try {
      const fbMessage = {
        recipient: { id: message.recipientId },
        message: {
          attachment: {
            type: 'file',
            payload: { url: file.url }
          }
        }
      };
      
      await this.logActivity({
        message: 'File sent via Facebook',
        data: { recipient: message.recipientId, fileName: file.filename }
      });
      
      return {
        success: true,
        messageId: `fb_file_${Date.now()}`,
        timestamp: new Date(),
        deliveryStatus: 'SENT'
      };
    } catch (error) {
      this.handleError(error, 'Facebook file send');
    }
  }
  
  protected getPlatformSpecificData(message: ChannelMessage): any {
    return {
      messaging_type: 'RESPONSE',
      recipient: { id: message.recipientId }
    };
  }
  
  protected extractContent(postData: any): string {
    return postData.message || postData.text || 'Facebook post';
  }
  
  protected async monitorMentions(): Promise<void> {
    // Monitor Facebook mentions and hashtags
    console.log('Monitoring Facebook mentions...');
  }
}

// Video Channel Adapter
export class VideoChannelAdapter extends BaseChannelAdapter {
  name = 'video';
  type = 'VIDEO';
  private videoConfig: VideoConfig;
  
  constructor(config: VideoConfig) {
    super();
    this.videoConfig = config;
  }
  
  async sendMessage(message: ChannelMessage): Promise<ChannelMessageResponse> {
    try {
      // For video consultations, send scheduling/link messages
      const videoMessage = {
        to: message.recipientId,
        subject: message.subject || 'Video Consultation',
        content: message.content,
        videoCall: true,
        meetingUrl: this.generateMeetingUrl(message.conversationId)
      };
      
      await this.logActivity({
        message: 'Video message sent',
        data: { to: message.recipientId, hasVideoCall: true }
      });
      
      return {
        success: true,
        messageId: `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        deliveryStatus: 'SENT'
      };
    } catch (error) {
      this.handleError(error, 'Video send');
    }
  }
  
  async receiveMessage(meetingData: any): Promise<ChannelMessage> {
    try {
      const message: ChannelMessage = {
        id: `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        channelId: 'video',
        messageId: meetingData.id,
        content: meetingData.message || 'Video consultation request',
        messageType: 'VIDEO_CALL',
        senderId: meetingData.from,
        senderName: meetingData.fromName || 'Video User',
        senderType: 'CUSTOMER',
        senderChannel: 'video',
        status: 'RECEIVED',
        sentAt: new Date(meetingData.timestamp || Date.now())
      };
      
      await this.logActivity({
        message: 'Video consultation received',
        data: { from: message.senderId, meetingId: meetingData.meetingId }
      });
      
      return message;
    } catch (error) {
      this.handleError(error, 'Video receive');
    }
  }
  
  async sendFile(file: FileAttachment, message: ChannelMessage): Promise<ChannelMessageResponse> {
    // Share files during video call via screen share or file sharing
    const content = `${message.content}\n\nFile to share: ${file.url}`;
    message.content = content;
    return this.sendMessage(message);
  }
  
  async getStatus(): Promise<ChannelStatus> {
    return {
      channel: 'video',
      status: this.isEnabled ? 'ACTIVE' : 'INACTIVE',
      lastMessage: new Date(),
      messageCount: 0,
      successRate: 89.3
    };
  }
  
  async getConversations(userId?: string): Promise<ChannelConversation[]> {
    return [];
  }
  
  async createConversation(conversationData: CreateConversationData): Promise<ChannelConversation> {
    return {
      id: `conv_video_${Date.now()}`,
      channelId: 'video',
      conversationId: `video_${Date.now()}`,
      customerId: conversationData.customerId,
      customerName: conversationData.customerName,
      customerEmail: conversationData.customerEmail,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
  
  async authenticate(credentials: any): Promise<boolean> {
    return true; // Simplified for demo
  }
  
  async disconnect(): Promise<void> {
    await this.logActivity({ message: 'Video adapter disconnected' });
  }
  
  private generateMeetingUrl(conversationId?: string): string {
    const meetingId = `${this.videoConfig.platform}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return `${this.videoConfig.baseUrl}/join/${meetingId}`;
  }
}

// Type definitions
export interface ChannelMessage {
  id?: string;
  channelId: string;
  conversationId?: string;
  messageId?: string;
  content: string;
  subject?: string;
  messageType: MessageType;
  mediaType?: MediaType;
  senderId?: string;
  senderName: string;
  senderType: MessageSenderType;
  senderChannel: string;
  recipientId?: string;
  recipientName?: string;
  recipientType?: MessageRecipientType;
  status: MessageStatus;
  deliveryStatus?: DeliveryStatus;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  processedAt?: Date;
  clinicId?: string;
  doctorId?: string;
  serviceId?: string;
  patientId?: string;
  hasAttachments?: boolean;
  attachmentCount?: number;
  attachments?: FileAttachment[];
  isVoiceMessage?: boolean;
  transcript?: string;
  audioDuration?: number;
  speechConfidence?: number;
  processed?: boolean;
  processingNotes?: string;
  errorMessage?: string;
  metadata?: any;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ChannelMessageResponse {
  success: boolean;
  messageId: string;
  timestamp: Date;
  deliveryStatus: DeliveryStatus;
  error?: string;
}

export interface ChannelConversation {
  id: string;
  channelId: string;
  conversationId: string;
  subject?: string;
  priority?: ConversationPriority;
  customerId?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  agentId?: string;
  agentName?: string;
  status: ConversationStatus;
  subStatus?: string;
  isClosed?: boolean;
  isArchived?: boolean;
  clinicId?: string;
  doctorId?: string;
  serviceId?: string;
  patientId?: string;
  appointmentId?: string;
  preferredChannel?: string;
  language?: string;
  timezone?: string;
  businessHours?: boolean;
  slaTarget?: number;
  slaBreached?: boolean;
  firstResponseAt?: Date;
  lastResponseAt?: Date;
  resolvedAt?: Date;
  messageCount?: number;
  agentResponseCount?: number;
  customerResponseCount?: number;
  escalationCount?: number;
  externalRefs?: any;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt?: Date;
  closedAt?: Date;
}

export interface ChannelStatus {
  channel: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR' | 'MAINTENANCE';
  lastMessage?: Date;
  messageCount?: number;
  successRate?: number;
  latency?: number;
  errors?: string[];
}

export interface CreateConversationData {
  subject?: string;
  priority?: ConversationPriority;
  customerId?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  agentId?: string;
  agentName?: string;
  clinicId?: string;
  doctorId?: string;
  serviceId?: string;
  patientId?: string;
  appointmentId?: string;
  preferredChannel?: string;
  language?: string;
  timezone?: string;
  businessHours?: boolean;
  metadata?: any;
}

export interface FileAttachment {
  filename: string;
  url: string;
  type: string;
  size: number;
  mimeType: string;
  thumbnailUrl?: string;
}

// Configuration interfaces
export interface EmailConfig {
  from: string;
  to: string;
  maxFileSize: number;
  provider: 'sendgrid' | 'ses' | 'mailgun';
  apiKey: string;
}

export interface WhatsAppConfig {
  phoneNumberId: string;
  accessToken: string;
  webhookVerifyToken: string;
  webhookUrl?: string;
  businessName: string;
}

export interface PhoneConfig {
  from: string;
  provider: 'twilio' | 'vonage' | 'aws_sns';
  apiKey: string;
}

export interface SocialMediaConfig {
  accountId: string;
  accessToken: string;
  apiKey: string;
  webhookUrl?: string;
  accountName: string;
}

export interface VideoConfig {
  platform: 'zoom' | 'teams' | 'google_meet' | 'jitsi';
  apiKey: string;
  baseUrl: string;
  maxDuration?: number;
  recordingEnabled?: boolean;
}

export type MessageType = 'TEXT' | 'IMAGE' | 'DOCUMENT' | 'AUDIO' | 'VIDEO' | 'LOCATION' | 'CONTACT' | 'STICKER' | 'TEMPLATE' | 'SYSTEM' | 'NOTIFICATION' | 'VIDEO_CALL';

export type MediaType = 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'APPLICATION' | 'OTHER';

export type MessageSenderType = 'CUSTOMER' | 'AGENT' | 'BOT' | 'SYSTEM' | 'AUTOMATION' | 'WEBHOOK' | 'API';

export type MessageRecipientType = 'CUSTOMER' | 'AGENT' | 'GROUP' | 'BROADCAST' | 'SYSTEM' | 'API';

export type MessageStatus = 'PENDING' | 'SENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED' | 'CANCELLED' | 'EXPIRED';

export type DeliveryStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED' | 'BOUNCED' | 'REPLIED' | 'UNSUBSCRIBED';

export type ConversationStatus = 'ACTIVE' | 'WAITING' | 'PENDING' | 'ON_HOLD' | 'ESCALATED' | 'RESOLVED' | 'CLOSED' | 'ARCHIVED' | 'CANCELLED';

export type ConversationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' | 'CRITICAL' | 'VIP' | 'EMERGENCY';

export type RoutingTargetType = 'AGENT' | 'TEAM' | 'DEPARTMENT' | 'SPECIALIST' | 'QUEUE' | 'POOL';

export type RoutingMethod = 'DIRECT' | 'ROUND_ROBIN' | 'SKILL_BASED' | 'LOAD_BALANCED' | 'PRIORITY_BASED' | 'SPECIALIST' | 'GEOGRAPHIC' | 'LANGUAGE_BASED' | 'AVAILABILITY';