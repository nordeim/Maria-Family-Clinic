// ========================================
// SOCIAL MEDIA MONITORING & RESPONSE SYSTEM
// Sub-Phase 9.7: Social Platform Integration
// Comprehensive monitoring and response for healthcare enquiries
// ========================================

import { z } from 'zod';
import { EventEmitter } from 'events';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Social media configuration schema
const SocialMediaConfigSchema = z.object({
  accountId: z.string(),
  accountName: z.string(),
  displayName: z.string(),
  platform: z.enum(['FACEBOOK', 'TWITTER', 'INSTAGRAM', 'LINKEDIN', 'YOUTUBE']),
  apiKey: z.string(),
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  webhookUrl: z.string().optional(),
  keywords: z.array(z.string()).default([]),
  hashtags: z.array(z.string()).default([]),
  blacklistTerms: z.array(z.string()).default([]),
  mentions: z.boolean().default(true),
  autoResponse: z.boolean().default(false),
  responseTemplate: z.string().optional(),
  escalationRequired: z.boolean().default(true),
  responseDelay: z.number().optional(), // minutes
  isActive: z.boolean().default(true),
  clinicId: z.string().optional(),
  department: z.string().optional()
});

// Mentions monitoring result
export interface SocialMediaMention {
  id: string;
  postId: string;
  author: string;
  authorId: string;
  content: string;
  postUrl: string;
  platform: SocialPlatform;
  mentionType: MentionType;
  status: MentionStatus;
  isPublic: boolean;
  isUrgent: boolean;
  requiresResponse: boolean;
  clinicId?: string;
  doctorId?: string;
  serviceId?: string;
  medicalKeywords: string[];
  responseSent: boolean;
  responseAt?: Date;
  responseBy?: string;
  escalated: boolean;
  escalationReason?: string;
  sentiment: 'VERY_NEGATIVE' | 'NEGATIVE' | 'NEUTRAL' | 'POSITIVE' | 'VERY_POSITIVE';
  urgencyScore: number; // 0-1
  likes: number;
  shares: number;
  comments: number;
  reach: number;
  createdAt: Date;
  updatedAt: Date;
}

// Response template
export interface ResponseTemplate {
  platform: SocialPlatform;
  content: string;
  tone: 'FORMAL' | 'CASUAL' | 'EMPATHETIC' | 'PROFESSIONAL';
  responseType: ResponseType;
  maxLength: number;
  hashtags?: string[];
  mentions?: string[];
}

// Alert for high-priority mentions
export interface SocialMediaAlert {
  id: string;
  mention: SocialMediaMention;
  alertType: 'URGENT' | 'NEGATIVE' | 'EMERGENCY' | 'COMPLAINT';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  assignedTo?: string;
  message: string;
  actionRequired: boolean;
  createdAt: Date;
}

// Platform types
export type SocialPlatform = 'FACEBOOK' | 'TWITTER' | 'INSTAGRAM' | 'LINKEDIN' | 'YOUTUBE' | 'TIKTOK';

// Mention types
export type MentionType = 'DIRECT_MENTION' | 'HASHTAG' | 'COMMENT' | 'SHARE' | 'DIRECT_MESSAGE' | 'TAG' | 'REFERENCE' | 'BRAND_MENTION' | 'EMERGENCY';

// Mention status
export type MentionStatus = 'NEW' | 'REVIEWED' | 'RESPONDED' | 'ESCALATED' | 'IGNORED' | 'RESOLVED';

// Response types
export type ResponseType = 'GREETING' | 'INFORMATION' | 'ESCALATION' | 'APOLOGY' | 'RESOLUTION' | 'EMERGENCY' | 'FALLBACK';

// Healthcare-specific social media templates
const HEALTHCARE_RESPONSE_TEMPLATES: Record<SocialPlatform, ResponseTemplate[]> = {
  FACEBOOK: [
    {
      platform: 'FACEBOOK',
      content: "Thank you for reaching out to My Family Clinic. We'd be happy to help you with your healthcare needs. For immediate assistance, please contact us at +65 9111 0000 or visit our clinic. For medical emergencies, please call 995 immediately.",
      tone: 'PROFESSIONAL',
      responseType: 'INFORMATION',
      maxLength: 280,
      hashtags: ['#MyFamilyClinic', '#Healthcare', '#Singapore']
    },
    {
      platform: 'FACEBOOK',
      content: "We appreciate your feedback and take all concerns seriously. Our team will review your message and get back to you as soon as possible. For urgent matters, please call our clinic directly.",
      tone: 'EMPATHETIC',
      responseType: 'APOLOGY',
      maxLength: 280
    }
  ],
  TWITTER: [
    {
      platform: 'TWITTER',
      content: "Hi! Thanks for reaching out. For healthcare questions, please call +65 9111 0000 or visit our clinic. For emergencies, call 995. We're here to help! 🏥",
      tone: 'CASUAL',
      responseType: 'INFORMATION',
      maxLength: 280,
      hashtags: ['#Healthcare', '#Singapore', '#Clinic']
    }
  ],
  INSTAGRAM: [
    {
      platform: 'INSTAGRAM',
      content: "Thank you for your message! We appreciate you reaching out. For immediate assistance, please contact us directly. Your health is our priority! 💙",
      tone: 'CASUAL',
      responseType: 'GREETING',
      maxLength: 2200,
      hashtags: ['#MyFamilyClinic', '#HealthMatters', '#SingaporeHealthcare']
    }
  ],
  LINKEDIN: [
    {
      platform: 'LINKEDIN',
      content: "Thank you for your inquiry. My Family Clinic provides comprehensive healthcare services. For detailed information about our services and to schedule an appointment, please contact our clinic directly.",
      tone: 'PROFESSIONAL',
      responseType: 'INFORMATION',
      maxLength: 3000,
      hashtags: ['#Healthcare', '#Singapore', '#MedicalServices']
    }
  ],
  YOUTUBE: [
    {
      platform: 'YOUTUBE',
      content: "Thanks for watching! For healthcare questions and appointments, please contact My Family Clinic directly. Don't forget to subscribe for more health tips!",
      tone: 'FRIENDLY',
      responseType: 'INFORMATION',
      maxLength: 5000,
      hashtags: ['#Healthcare', '#HealthTips']
    }
  ]
};

// Emergency keywords for social media monitoring
const EMERGENCY_KEYWORDS = [
  'emergency', 'urgent', 'help', 'can\'t breathe', 'chest pain', 'heart attack',
  'stroke', 'accident', 'injury', 'bleeding', 'unconscious', 'seizure',
  'severe pain', 'can\'t move', 'overdose', 'poisoning', 'suicide', 'self-harm'
];

// Negative sentiment keywords
const NEGATIVE_KEYWORDS = [
  'bad', 'terrible', 'awful', 'horrible', 'disappointed', 'frustrated',
  'angry', 'upset', 'complaint', 'problem', 'issue', 'wrong',
  'poor service', 'rude', 'unprofessional', 'long wait', 'expensive'
};

// Healthcare monitoring keywords
const HEALTHCARE_KEYWORDS = [
  'doctor', 'clinic', 'hospital', 'appointment', 'medical', 'health',
  'symptoms', 'treatment', 'medicine', 'prescription', 'checkup',
  'screening', 'vaccination', 'healthier sg', 'singapore healthcare'
];

// Base social media monitor class
abstract class BaseSocialMediaMonitor {
  protected config: z.infer<typeof SocialMediaConfigSchema>;
  protected eventEmitter: EventEmitter;
  protected isMonitoring: boolean = false;
  protected lastCheck: Date = new Date();
  protected mentionCache: Map<string, SocialMediaMention> = new Map();

  constructor(config: z.infer<typeof SocialMediaConfigSchema>) {
    this.config = SocialMediaConfigSchema.parse(config);
    this.eventEmitter = new EventEmitter();
  }

  abstract startMonitoring(): Promise<void>;
  abstract stopMonitoring(): Promise<void>;
  abstract checkMentions(): Promise<SocialMediaMention[]>;
  abstract sendResponse(mention: SocialMediaMention, response: string): Promise<boolean>;
  abstract getAccountInfo(): Promise<any>;
  abstract validateWebhook(webhookData: any): Promise<boolean>;

  // Common mention analysis
  protected analyzeMention(content: string, metadata: any): Partial<SocialMediaMention> {
    const lowerContent = content.toLowerCase();
    
    // Detect mention type
    const mentionType = this.detectMentionType(lowerContent, metadata);
    
    // Calculate sentiment
    const sentiment = this.analyzeSentiment(lowerContent);
    
    // Calculate urgency score
    const urgencyScore = this.calculateUrgencyScore(lowerContent, metadata);
    
    // Extract medical keywords
    const medicalKeywords = this.extractMedicalKeywords(lowerContent);
    
    // Determine if urgent
    const isUrgent = urgencyScore > 0.7 || medicalKeywords.some(kw => EMERGENCY_KEYWORDS.includes(kw));
    
    // Determine if requires response
    const requiresResponse = mentionType !== 'BRAND_MENTION' && 
                            (isUrgent || sentiment === 'VERY_NEGATIVE' || 
                             lowerContent.includes('?') || 
                             lowerContent.includes('help') ||
                             this.config.mentions);

    return {
      mentionType,
      sentiment,
      urgencyScore,
      medicalKeywords,
      isUrgent,
      requiresResponse
    };
  }

  // Detect mention type
  private detectMentionType(content: string, metadata: any): MentionType {
    if (metadata.type === 'mention' || content.includes('@')) {
      return 'DIRECT_MENTION';
    }
    if (metadata.type === 'hashtag' || content.includes('#')) {
      return 'HASHTAG';
    }
    if (metadata.type === 'comment') {
      return 'COMMENT';
    }
    if (metadata.type === 'share') {
      return 'SHARE';
    }
    if (content.includes(this.config.accountName.toLowerCase())) {
      return 'BRAND_MENTION';
    }
    return 'REFERENCE';
  }

  // Sentiment analysis
  private analyzeSentiment(content: string): 'VERY_NEGATIVE' | 'NEGATIVE' | 'NEUTRAL' | 'POSITIVE' | 'VERY_POSITIVE' {
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'best', 'helpful', 'professional'];
    const veryPositiveWords = ['outstanding', 'exceptional', 'incredible', 'phenomenal', 'brilliant', 'perfect'];
    const negativeWords = ['bad', 'terrible', 'poor', 'disappointing', 'frustrating'];
    const veryNegativeWords = ['awful', 'horrible', 'disgusting', 'unacceptable', 'nightmare', 'worst'];
    
    let positiveScore = 0;
    let negativeScore = 0;
    
    positiveWords.forEach(word => {
      if (content.includes(word)) positiveScore += 1;
    });
    
    veryPositiveWords.forEach(word => {
      if (content.includes(word)) positiveScore += 2;
    });
    
    negativeWords.forEach(word => {
      if (content.includes(word)) negativeScore += 1;
    });
    
    veryNegativeWords.forEach(word => {
      if (content.includes(word)) negativeScore += 2;
    });
    
    if (negativeScore >= 3) return 'VERY_NEGATIVE';
    if (negativeScore >= 1) return 'NEGATIVE';
    if (positiveScore >= 3) return 'VERY_POSITIVE';
    if (positiveScore >= 1) return 'POSITIVE';
    return 'NEUTRAL';
  }

  // Calculate urgency score
  private calculateUrgencyScore(content: string, metadata: any): number {
    let score = 0;
    
    // Emergency keywords
    EMERGENCY_KEYWORDS.forEach(keyword => {
      if (content.includes(keyword)) {
        score += 0.3;
      }
    });
    
    // High engagement (more urgent)
    if (metadata.likes > 100) score += 0.2;
    if (metadata.shares > 50) score += 0.2;
    if (metadata.comments > 20) score += 0.1;
    
    // Negative sentiment increases urgency
    if (this.analyzeSentiment(content) === 'NEGATIVE') score += 0.2;
    if (this.analyzeSentiment(content) === 'VERY_NEGATIVE') score += 0.3;
    
    // Question marks suggest need for response
    if (content.includes('?')) score += 0.1;
    
    // Time sensitivity words
    const timeWords = ['urgent', 'asap', 'quickly', 'immediately', 'now', 'emergency'];
    timeWords.forEach(word => {
      if (content.includes(word)) score += 0.2;
    });
    
    return Math.min(score, 1.0);
  }

  // Extract medical keywords
  private extractMedicalKeywords(content: string): string[] {
    const keywords: string[] = [];
    
    HEALTHCARE_KEYWORDS.forEach(keyword => {
      if (content.includes(keyword)) {
        keywords.push(keyword);
      }
    });
    
    return keywords;
  }

  // Generate appropriate response
  protected generateResponse(mention: SocialMediaMention): string | null {
    // Don't respond to brand mentions only
    if (mention.mentionType === 'BRAND_MENTION' && !mention.requiresResponse) {
      return null;
    }

    // Emergency response
    if (mention.isUrgent) {
      return "⚠️ This appears to be a medical emergency. Please call 995 (Singapore emergency services) immediately or visit the nearest emergency room. For immediate clinic assistance, call +65 9111 0000.";
    }

    // Negative sentiment - acknowledge and escalate
    if (mention.sentiment === 'NEGATIVE' || mention.sentiment === 'VERY_NEGATIVE') {
      return "We appreciate you reaching out and take your concerns seriously. Our team will review your message and contact you directly. For immediate assistance, please call +65 9111 0000.";
    }

    // Information request
    if (mention.content.toLowerCase().includes('?') || mention.requiresResponse) {
      return "Thank you for your question! For healthcare information and appointments, please contact My Family Clinic at +65 9111 0000 or visit our clinic. We're here to help with your health needs.";
    }

    // General engagement
    const templates = HEALTHCARE_RESPONSE_TEMPLATES[this.config.platform] || [];
    if (templates.length > 0) {
      return templates[0].content;
    }

    return null;
  }

  // Validate if response is needed
  protected shouldRespond(mention: SocialMediaMention): boolean {
    // Don't respond if already responded
    if (mention.responseSent) return false;
    
    // Don't respond to blacklisted terms
    const content = mention.content.toLowerCase();
    if (this.config.blacklistTerms.some(term => content.includes(term.toLowerCase()))) {
      return false;
    }
    
    // Respond to urgent, negative, or direct mentions
    return mention.requiresResponse || mention.mentionType === 'DIRECT_MENTION';
  }

  // Common logging
  protected logActivity(activity: any): void {
    console.log(`[${this.config.platform} Monitor] ${activity.message}`, activity.data);
  }

  // Health check
  async getHealthStatus(): Promise<any> {
    return {
      platform: this.config.platform,
      accountId: this.config.accountId,
      isMonitoring: this.isMonitoring,
      lastCheck: this.lastCheck,
      mentionsCached: this.mentionCache.size,
      status: this.isMonitoring ? 'active' : 'inactive'
    };
  }
}

// Facebook Monitor
export class FacebookMonitor extends BaseSocialMediaMonitor {
  async startMonitoring(): Promise<void> {
    try {
      this.isMonitoring = true;
      this.logActivity({ message: 'Started Facebook monitoring' });
      
      // In production, set up Facebook webhook
      if (this.config.webhookUrl) {
        this.logActivity({ message: 'Facebook webhook configured', data: { url: this.config.webhookUrl } });
      }
    } catch (error) {
      console.error('Failed to start Facebook monitoring:', error);
      throw error;
    }
  }

  async stopMonitoring(): Promise<void> {
    this.isMonitoring = false;
    this.logActivity({ message: 'Stopped Facebook monitoring' });
  }

  async checkMentions(): Promise<SocialMediaMention[]> {
    try {
      this.lastCheck = new Date();
      
      // In production, call Facebook Graph API
      // const response = await fetch(`https://graph.facebook.com/v18.0/${this.config.accountId}/mentions`, {
      //   headers: { 'Authorization': `Bearer ${this.config.accessToken}` }
      // });
      
      // Mock mentions for demo
      const mockMentions: SocialMediaMention[] = [
        {
          id: `fb_${Date.now()}_1`,
          postId: 'fb_post_123',
          author: 'John Doe',
          authorId: 'user_123',
          content: 'Great experience at My Family Clinic! Dr. Smith was very professional. #MyFamilyClinic',
          postUrl: 'https://facebook.com/posts/123',
          platform: 'FACEBOOK',
          mentionType: 'HASHTAG',
          status: 'NEW',
          isPublic: true,
          isUrgent: false,
          requiresResponse: false,
          medicalKeywords: ['clinic', 'doctor'],
          responseSent: false,
          escalated: false,
          sentiment: 'POSITIVE',
          urgencyScore: 0.2,
          likes: 15,
          shares: 3,
          comments: 5,
          reach: 150,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: `fb_${Date.now()}_2`,
          postId: 'fb_post_124',
          author: 'Jane Smith',
          authorId: 'user_124',
          content: 'I need help with my appointment booking. Who can I contact? @MyFamilyClinic',
          postUrl: 'https://facebook.com/posts/124',
          platform: 'FACEBOOK',
          mentionType: 'DIRECT_MENTION',
          status: 'NEW',
          isPublic: true,
          isUrgent: false,
          requiresResponse: true,
          medicalKeywords: ['appointment'],
          responseSent: false,
          escalated: false,
          sentiment: 'NEUTRAL',
          urgencyScore: 0.4,
          likes: 2,
          shares: 0,
          comments: 1,
          reach: 45,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      return mockMentions;
    } catch (error) {
      console.error('Facebook mentions check failed:', error);
      return [];
    }
  }

  async sendResponse(mention: SocialMediaMention, response: string): Promise<boolean> {
    try {
      // In production, post comment or reply to mention
      this.logActivity({
        message: 'Facebook response sent',
        data: { mentionId: mention.postId, response: response.substring(0, 50) + '...' }
      });
      
      return true;
    } catch (error) {
      console.error('Facebook response failed:', error);
      return false;
    }
  }

  async getAccountInfo(): Promise<any> {
    return {
      platform: 'FACEBOOK',
      accountId: this.config.accountId,
      accountName: this.config.accountName,
      displayName: this.config.displayName,
      followers: 1250,
      posts: 89
    };
  }

  async validateWebhook(webhookData: any): Promise<boolean> {
    return webhookData.object === 'page' && webhookData.entry?.length > 0;
  }
}

// Twitter Monitor
export class TwitterMonitor extends BaseSocialMediaMonitor {
  async startMonitoring(): Promise<void> {
    this.isMonitoring = true;
    this.logActivity({ message: 'Started Twitter monitoring' });
  }

  async stopMonitoring(): Promise<void> {
    this.isMonitoring = false;
    this.logActivity({ message: 'Stopped Twitter monitoring' });
  }

  async checkMentions(): Promise<SocialMediaMention[]> {
    this.lastCheck = new Date();
    
    // Mock Twitter mentions
    const mockMentions: SocialMediaMention[] = [
      {
        id: `tw_${Date.now()}_1`,
        postId: 'tw_tweet_123',
        author: 'HealthSeeker',
        authorId: 'healthseeker123',
        content: 'What are your clinic hours? @MyFamilyClinic',
        postUrl: 'https://twitter.com/healthseeker123/status/123',
        platform: 'TWITTER',
        mentionType: 'DIRECT_MENTION',
        status: 'NEW',
        isPublic: true,
        isUrgent: false,
        requiresResponse: true,
        medicalKeywords: [],
        responseSent: false,
        escalated: false,
        sentiment: 'NEUTRAL',
        urgencyScore: 0.3,
        likes: 0,
        shares: 0,
        comments: 0,
        reach: 10,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    return mockMentions;
  }

  async sendResponse(mention: SocialMediaMention, response: string): Promise<boolean> {
    this.logActivity({
      message: 'Twitter response sent',
      data: { mentionId: mention.postId, response: response.substring(0, 50) + '...' }
    });
    return true;
  }

  async getAccountInfo(): Promise<any> {
    return {
      platform: 'TWITTER',
      accountId: this.config.accountId,
      accountName: this.config.accountName,
      followers: 890,
      tweets: 156
    };
  }

  async validateWebhook(webhookData: any): Promise<boolean> {
    return webhooksData.title === 'Tweet mention' || webhooksData.title === 'Follow';
  }
}

// Instagram Monitor
export class InstagramMonitor extends BaseSocialMediaMonitor {
  async startMonitoring(): Promise<void> {
    this.isMonitoring = true;
    this.logActivity({ message: 'Started Instagram monitoring' });
  }

  async stopMonitoring(): Promise<void> {
    this.isMonitoring = false;
    this.logActivity({ message: 'Stopped Instagram monitoring' });
  }

  async checkMentions(): Promise<SocialMediaMention[]> {
    this.lastCheck = new Date();
    
    return [];
  }

  async sendResponse(mention: SocialMediaMention, response: string): Promise<boolean> {
    return true;
  }

  async getAccountInfo(): Promise<any> {
    return {
      platform: 'INSTAGRAM',
      accountId: this.config.accountId,
      accountName: this.config.accountName,
      followers: 2100,
      posts: 78
    };
  }

  async validateWebhook(webhookData: any): Promise<boolean> {
    return webhookData.object === 'instagram' && webhookData.entry?.length > 0;
  }
}

// Social Media Monitoring Service Manager
export class SocialMediaMonitoringService {
  private monitors: Map<string, BaseSocialMediaMonitor> = new Map();
  private eventEmitter: EventEmitter;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private alertQueue: SocialMediaAlert[] = [];

  constructor() {
    this.eventEmitter = new EventEmitter();
  }

  // Register social media account
  async registerAccount(config: z.infer<typeof SocialMediaConfigSchema>): Promise<string> {
    const validatedConfig = SocialMediaConfigSchema.parse(config);
    let monitor: BaseSocialMediaMonitor;

    switch (validatedConfig.platform) {
      case 'FACEBOOK':
        monitor = new FacebookMonitor(validatedConfig);
        break;
      case 'TWITTER':
        monitor = new TwitterMonitor(validatedConfig);
        break;
      case 'INSTAGRAM':
        monitor = new InstagramMonitor(validatedConfig);
        break;
      default:
        throw new Error(`Unsupported platform: ${validatedConfig.platform}`);
    }

    this.monitors.set(validatedConfig.accountId, monitor);
    
    // Log to database
    try {
      await prisma.socialMediaAccount.create({
        data: {
          platform: validatedConfig.platform,
          accountName: validatedConfig.accountName,
          displayName: validatedConfig.displayName,
          accountUrl: `https://${validatedConfig.platform.toLowerCase()}.com/${validatedConfig.accountName}`,
          isActive: validatedConfig.isActive,
          isMonitored: true,
          autoResponse: validatedConfig.autoResponse,
          clinicId: validatedConfig.clinicId,
          department: validatedConfig.department,
          keywords: validatedConfig.keywords,
          mentions: validatedConfig.mentions,
          hashtags: validatedConfig.hashtags,
          blacklistTerms: validatedConfig.blacklistTerms,
          responseTemplate: validatedConfig.responseTemplate,
          escalationRequired: validatedConfig.escalationRequired,
          responseDelay: validatedConfig.responseDelay
        }
      });
    } catch (error) {
      console.error('Failed to log social media account:', error);
    }

    this.eventEmitter.emit('accountRegistered', validatedConfig);
    return validatedConfig.accountId;
  }

  // Start monitoring all accounts
  async startMonitoring(): Promise<void> {
    const startPromises = Array.from(this.monitors.values()).map(monitor => 
      monitor.startMonitoring()
    );
    
    await Promise.all(startPromises);
    
    // Set up periodic monitoring
    this.monitoringInterval = setInterval(() => {
      this.performMonitoringCycle();
    }, 30000); // Check every 30 seconds
    
    this.eventEmitter.emit('monitoringStarted', Array.from(this.monitors.keys()));
  }

  // Stop monitoring
  async stopMonitoring(): Promise<void> {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    const stopPromises = Array.from(this.monitors.values()).map(monitor => 
      monitor.stopMonitoring()
    );
    
    await Promise.all(stopPromises);
    this.eventEmitter.emit('monitoringStopped');
  }

  // Perform monitoring cycle
  private async performMonitoringCycle(): Promise<void> {
    for (const [accountId, monitor] of this.monitors) {
      try {
        const mentions = await monitor.checkMentions();
        
        for (const mention of mentions) {
          await this.processMention(mention, monitor);
        }
      } catch (error) {
        console.error(`Monitoring error for ${accountId}:`, error);
      }
    }
  }

  // Process mention
  private async processMention(mention: SocialMediaMention, monitor: BaseSocialMediaMonitor): Promise<void> {
    try {
      // Save mention to database
      const savedMention = await prisma.socialMediaMention.create({
        data: {
          socialAccountId: (await this.getAccountId(mention.platform, mention.author)) || '',
          postId: mention.postId,
          author: mention.author,
          authorId: mention.authorId,
          content: mention.content,
          postUrl: mention.postUrl,
          platform: mention.platform,
          mentionType: mention.mentionType,
          status: mention.status,
          isPublic: mention.isPublic,
          isUrgent: mention.isUrgent,
          requiresResponse: mention.requiresResponse,
          clinicId: mention.clinicId,
          doctorId: mention.doctorId,
          serviceId: mention.serviceId,
          medicalKeywords: mention.medicalKeywords,
          sentiment: mention.sentiment,
          urgencyScore: mention.urgencyScore,
          likes: mention.likes,
          shares: mention.shares,
          comments: mention.comments,
          reach: mention.reach
        }
      });

      mention.id = savedMention.id;

      // Check if response is needed
      if (monitor.shouldRespond && monitor.shouldRespond(mention)) {
        const response = monitor.generateResponse(mention);
        
        if (response) {
          // Auto-respond if enabled
          const socialAccount = await prisma.socialMediaAccount.findFirst({
            where: { platform: mention.platform, isActive: true }
          });
          
          if (socialAccount?.autoResponse) {
            const success = await monitor.sendResponse(mention, response);
            
            if (success) {
              await prisma.socialMediaMention.update({
                where: { id: savedMention.id },
                data: {
                  responseSent: true,
                  responseAt: new Date(),
                  status: 'RESPONDED'
                }
              });
            }
          } else {
            // Queue for manual response
            this.alertQueue.push({
              id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              mention,
              alertType: this.determineAlertType(mention),
              priority: this.determinePriority(mention),
              message: this.generateAlertMessage(mention),
              actionRequired: true,
              createdAt: new Date()
            });
          }
        }
      }

      // Emit event
      this.eventEmitter.emit('mentionProcessed', mention);
      
    } catch (error) {
      console.error('Failed to process mention:', error);
    }
  }

  // Helper methods
  private determineAlertType(mention: SocialMediaMention): 'URGENT' | 'NEGATIVE' | 'EMERGENCY' | 'COMPLAINT' {
    if (mention.isUrgent) return 'EMERGENCY';
    if (mention.sentiment === 'VERY_NEGATIVE' || mention.sentiment === 'NEGATIVE') return 'NEGATIVE';
    if (mention.content.toLowerCase().includes('complaint')) return 'COMPLAINT';
    return 'URGENT';
  }

  private determinePriority(mention: SocialMediaMention): 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL' {
    if (mention.urgencyScore > 0.8) return 'CRITICAL';
    if (mention.urgencyScore > 0.6) return 'HIGH';
    if (mention.urgencyScore > 0.3) return 'NORMAL';
    return 'LOW';
  }

  private generateAlertMessage(mention: SocialMediaMention): string {
    return `New ${mention.platform} ${mention.mentionType.toLowerCase()} from ${mention.author} (${mention.sentiment.toLowerCase()}, urgency: ${mention.urgencyScore.toFixed(2)})`;
  }

  private async getAccountId(platform: SocialPlatform, author: string): Promise<string | null> {
    const account = await prisma.socialMediaAccount.findFirst({
      where: { platform, accountName: { contains: author } }
    });
    return account?.id || null;
  }

  // Get monitoring status
  async getMonitoringStatus(): Promise<any> {
    const monitorStatus: any = {};
    
    for (const [accountId, monitor] of this.monitors) {
      monitorStatus[accountId] = await monitor.getHealthStatus();
    }
    
    return {
      totalAccounts: this.monitors.size,
      activeMonitors: Array.from(this.monitors.values()).filter(m => m.isMonitoring).length,
      monitors: monitorStatus,
      alertQueue: this.alertQueue.length,
      lastCheck: new Date()
    };
  }

  // Event listeners
  onMentionProcessed(callback: (mention: SocialMediaMention) => void): void {
    this.eventEmitter.on('mentionProcessed', callback);
  }

  onAccountRegistered(callback: (config: z.infer<typeof SocialMediaConfigSchema>) => void): void {
    this.eventEmitter.on('accountRegistered', callback);
  }

  onAlertCreated(callback: (alert: SocialMediaAlert) => void): void {
    this.eventEmitter.on('alertCreated', callback);
  }

  // Get alerts
  getAlerts(limit: number = 10): SocialMediaAlert[] {
    return this.alertQueue.slice(0, limit);
  }

  // Dismiss alert
  dismissAlert(alertId: string): boolean {
    const index = this.alertQueue.findIndex(alert => alert.id === alertId);
    if (index >= 0) {
      this.alertQueue.splice(index, 1);
      return true;
    }
    return false;
  }
}

// Export singleton instance
export const socialMediaMonitoringService = new SocialMediaMonitoringService();

export default SocialMediaMonitoringService;