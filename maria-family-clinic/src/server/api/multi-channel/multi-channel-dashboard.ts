// ========================================
// MULTI-CHANNEL DASHBOARD SYSTEM
// Sub-Phase 9.7: Unified Communication Management
// Comprehensive dashboard for managing all communication channels
// ========================================

import { z } from 'zod';
import { EventEmitter } from 'events';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Dashboard configuration schema
const DashboardConfigSchema = z.object({
  clinicId: z.string(),
  refreshInterval: z.number().default(5000), // 5 seconds
  maxSessions: z.number().default(100),
  showOffline: z.boolean().default(false),
  autoRefresh: z.boolean().default(true),
  theme: z.enum(['light', 'dark']).default('light'),
  timezone: z.string().default('Asia/Singapore'),
  workingHours: z.object({
    start: z.string().default('08:00'),
    end: z.string().default('20:00'),
    timezone: z.string().default('Asia/Singapore')
  }).default({})
});

// Dashboard data interface
export interface DashboardData {
  overview: DashboardOverview;
  channels: ChannelStatus[];
  conversations: ConversationSummary[];
  agents: AgentSummary[];
  queue: QueueStatus[];
  alerts: AlertSummary[];
  analytics: AnalyticsData;
  systemHealth: SystemHealth;
}

// Dashboard overview
export interface DashboardOverview {
  totalConversations: number;
  activeConversations: number;
  waitingConversations: number;
  resolvedToday: number;
  averageResponseTime: number;
  customerSatisfaction: number;
  escalationRate: number;
  totalMessages: number;
  activeChannels: number;
  systemStatus: 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'MAINTENANCE';
  lastUpdated: Date;
}

// Channel status
export interface ChannelStatus {
  id: string;
  name: string;
  displayName: string;
  type: 'EMAIL' | 'SMS' | 'PHONE' | 'CHAT' | 'WHATSAPP' | 'TELEGRAM' | 'FACEBOOK' | 'TWITTER' | 'INSTAGRAM' | 'VIDEO_CALL' | 'VOICE_MESSAGE';
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR' | 'MAINTENANCE';
  isEnabled: boolean;
  messageCount: number;
  activeConversations: number;
  responseRate: number;
  averageResponseTime: number;
  lastMessage: Date;
  successRate: number;
  queueLength: number;
  capacity: number;
  health: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  issues: string[];
}

// Conversation summary
export interface ConversationSummary {
  id: string;
  sessionId: string;
  channel: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  status: 'ACTIVE' | 'WAITING' | 'ON_HOLD' | 'ESCALATED' | 'COMPLETED' | 'TRANSFERRED';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' | 'CRITICAL' | 'VIP' | 'EMERGENCY';
  assignedAgent?: string;
  assignedAgentName?: string;
  startedAt: Date;
  lastActivity: Date;
  messageCount: number;
  waitTime: number;
  responseTime?: number;
  satisfactionScore?: number;
  tags: string[];
  clinicId?: string;
  doctorId?: string;
  serviceId?: string;
  urgencyLevel: 'LOW' | 'ROUTINE' | 'NORMAL' | 'HIGH' | 'URGENT' | 'CRITICAL' | 'EMERGENCY';
  medicalKeywords: string[];
  isUrgent: boolean;
  requiresFollowUp: boolean;
}

// Agent summary
export interface AgentSummary {
  id: string;
  name: string;
  email: string;
  status: 'AVAILABLE' | 'BUSY' | 'AWAY' | 'OFFLINE';
  currentChats: number;
  maxChats: number;
  specialties: string[];
  languages: string[];
  clinicId?: string;
  averageResponseTime: number;
  satisfactionScore: number;
  resolvedToday: number;
  activeSince: Date;
  lastActivity: Date;
  performance: {
    responseTime: number;
    resolutionRate: number;
    customerSatisfaction: number;
    escalationRate: number;
  };
  skills: string[];
  certifications: string[];
}

// Queue status
export interface QueueStatus {
  id: string;
  channel: string;
  department: string;
  totalWaiting: number;
  averageWaitTime: number;
  oldestWaitTime: number;
  priorityDistribution: {
    LOW: number;
    NORMAL: number;
    HIGH: number;
    URGENT: number;
    CRITICAL: number;
  };
  estimatedWaitTimes: {
    LOW: number;
    NORMAL: number;
    HIGH: number;
    URGENT: number;
    CRITICAL: number;
  };
}

// Alert summary
export interface AlertSummary {
  id: string;
  type: 'URGENT' | 'NEGATIVE' | 'EMERGENCY' | 'COMPLAINT' | 'TECHNICAL' | 'SYSTEM' | 'PERFORMANCE';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  source: 'CHAT' | 'EMAIL' | 'WHATSAPP' | 'SOCIAL_MEDIA' | 'VOICE' | 'SYSTEM';
  assignedTo?: string;
  status: 'NEW' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'RESOLVED' | 'DISMISSED';
  createdAt: Date;
  updatedAt: Date;
  relatedConversation?: string;
  actions: AlertAction[];
  escalationLevel: number;
  impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

// Alert action
export interface AlertAction {
  id: string;
  type: 'NOTIFY' | 'ESCALATE' | 'ASSIGN' | 'CLOSE' | 'COMMENT';
  description: string;
  takenBy?: string;
  takenAt?: Date;
  result?: string;
}

// Analytics data
export interface AnalyticsData {
  overview: {
    totalMessages: number;
    totalConversations: number;
    averageResponseTime: number;
    resolutionRate: number;
    customerSatisfaction: number;
    channelDistribution: Record<string, number>;
  };
  performance: {
    responseTimeTrend: TimeSeriesData[];
    resolutionRateTrend: TimeSeriesData[];
    satisfactionTrend: TimeSeriesData[];
    channelPerformance: ChannelPerformance[];
    agentPerformance: AgentPerformance[];
  };
  volume: {
    dailyVolume: TimeSeriesData[];
    hourlyPattern: TimeSeriesData[];
    channelVolume: Record<string, number>;
    departmentVolume: Record<string, number>;
  };
  quality: {
    sentimentAnalysis: SentimentData;
    commonTopics: TopicData[];
    resolutionEfficiency: Record<string, number>;
    errorRates: Record<string, number>;
  };
}

// Time series data
export interface TimeSeriesData {
  timestamp: Date;
  value: number;
  category?: string;
}

// Channel performance
export interface ChannelPerformance {
  channel: string;
  messageCount: number;
  averageResponseTime: number;
  resolutionRate: number;
  customerSatisfaction: number;
  errorRate: number;
  uptime: number;
}

// Agent performance
export interface AgentPerformance {
  agentId: string;
  agentName: string;
  messagesHandled: number;
  averageResponseTime: number;
  resolutionRate: number;
  customerSatisfaction: number;
  activeTime: number;
}

// Sentiment data
export interface SentimentData {
  veryPositive: number;
  positive: number;
  neutral: number;
  negative: number;
  veryNegative: number;
  trend: 'IMPROVING' | 'DECLINING' | 'STABLE';
}

// Topic data
export interface TopicData {
  topic: string;
  mentionCount: number;
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  urgency: 'LOW' | 'NORMAL' | 'HIGH';
  category: string;
}

// System health
export interface SystemHealth {
  overall: 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'MAINTENANCE';
  components: {
    [component: string]: {
      status: 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'UNKNOWN';
      uptime: number;
      lastCheck: Date;
      responseTime: number;
      errorRate: number;
      issues: string[];
    };
  };
  resources: {
    cpu: number;
    memory: number;
    storage: number;
    network: number;
  };
  integrations: {
    [integration: string]: {
      status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR' | 'MAINTENANCE';
      latency: number;
      errorCount: number;
      lastSuccessfulCall: Date;
    };
  };
}

// Filter and search options
export interface DashboardFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  channels?: string[];
  status?: string[];
  priority?: string[];
  agentId?: string;
  clinicId?: string;
  searchQuery?: string;
  tags?: string[];
}

// Real-time update interface
export interface RealTimeUpdate {
  type: 'CONVERSATION_UPDATE' | 'CHANNEL_STATUS' | 'AGENT_STATUS' | 'ALERT' | 'QUEUE_UPDATE' | 'SYSTEM_ALERT';
  data: any;
  timestamp: Date;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
}

// Multi-Channel Dashboard
export class MultiChannelDashboard {
  private config: z.infer<typeof DashboardConfigSchema>;
  private eventEmitter: EventEmitter;
  private activeConnections: Map<string, any> = new Map(); // WebSocket connections
  private cache: Map<string, any> = new Map();
  private lastRefresh: Date = new Date();
  private refreshInterval: NodeJS.Timeout | null = null;

  constructor(config: z.infer<typeof DashboardConfigSchema>) {
    this.config = DashboardConfigSchema.parse(config);
    this.eventEmitter = new EventEmitter();
    this.initializeDataCache();
    this.startAutoRefresh();
  }

  // Get comprehensive dashboard data
  async getDashboardData(filters?: DashboardFilters): Promise<DashboardData> {
    try {
      const [overview, channels, conversations, agents, queue, alerts, analytics, systemHealth] = await Promise.all([
        this.getOverview(filters),
        this.getChannelStatus(),
        this.getConversations(filters),
        this.getAgentSummary(),
        this.getQueueStatus(),
        this.getAlerts(filters),
        this.getAnalytics(filters),
        this.getSystemHealth()
      ]);

      return {
        overview,
        channels,
        conversations,
        agents,
        queue,
        alerts,
        analytics,
        systemHealth
      };
    } catch (error) {
      console.error('Failed to get dashboard data:', error);
      throw new Error(`Dashboard data retrieval failed: ${error.message}`);
    }
  }

  // Get overview statistics
  private async getOverview(filters?: DashboardFilters): Promise<DashboardOverview> {
    try {
      // Get conversation counts
      const [totalConversations, activeConversations, waitingConversations, resolvedToday] = await Promise.all([
        this.getTotalConversations(filters),
        this.getActiveConversations(filters),
        this.getWaitingConversations(filters),
        this.getResolvedToday(filters)
      ]);

      // Get performance metrics
      const [averageResponseTime, customerSatisfaction, escalationRate, totalMessages, activeChannels] = await Promise.all([
        this.getAverageResponseTime(filters),
        this.getCustomerSatisfaction(filters),
        this.getEscalationRate(filters),
        this.getTotalMessages(filters),
        this.getActiveChannels()
      ]);

      return {
        totalConversations,
        activeConversations,
        waitingConversations,
        resolvedToday,
        averageResponseTime,
        customerSatisfaction,
        escalationRate,
        totalMessages,
        activeChannels,
        systemStatus: this.calculateSystemStatus(),
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Failed to get overview:', error);
      throw error;
    }
  }

  // Get channel status
  private async getChannelStatus(): Promise<ChannelStatus[]> {
    try {
      // In production, this would query each channel's status
      const channels = [
        {
          id: 'email',
          name: 'email',
          displayName: 'Email',
          type: 'EMAIL',
          status: 'ACTIVE' as const,
          isEnabled: true,
          messageCount: 145,
          activeConversations: 12,
          responseRate: 94.5,
          averageResponseTime: 45, // minutes
          lastMessage: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
          successRate: 98.5,
          queueLength: 0,
          capacity: 1000,
          health: 'EXCELLENT' as const,
          issues: []
        },
        {
          id: 'whatsapp',
          name: 'whatsapp',
          displayName: 'WhatsApp',
          type: 'WHATSAPP' as const,
          status: 'ACTIVE' as const,
          isEnabled: true,
          messageCount: 89,
          activeConversations: 8,
          responseRate: 97.2,
          averageResponseTime: 25, // minutes
          lastMessage: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
          successRate: 99.1,
          queueLength: 2,
          capacity: 500,
          health: 'EXCELLENT' as const,
          issues: []
        },
        {
          id: 'chat',
          name: 'chat',
          displayName: 'Live Chat',
          type: 'CHAT' as const,
          status: 'ACTIVE' as const,
          isEnabled: true,
          messageCount: 234,
          activeConversations: 15,
          responseRate: 92.8,
          averageResponseTime: 30, // minutes
          lastMessage: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
          successRate: 97.8,
          queueLength: 3,
          capacity: 50,
          health: 'GOOD' as const,
          issues: []
        },
        {
          id: 'phone',
          name: 'phone',
          displayName: 'Phone/SMS',
          type: 'PHONE' as const,
          status: 'ACTIVE' as const,
          isEnabled: true,
          messageCount: 67,
          activeConversations: 5,
          responseRate: 99.5,
          averageResponseTime: 15, // minutes
          lastMessage: new Date(Date.now() - 8 * 60 * 1000), // 8 minutes ago
          successRate: 99.8,
          queueLength: 0,
          capacity: 200,
          health: 'EXCELLENT' as const,
          issues: []
        },
        {
          id: 'social',
          name: 'social',
          displayName: 'Social Media',
          type: 'FACEBOOK' as const,
          status: 'ACTIVE' as const,
          isEnabled: true,
          messageCount: 23,
          activeConversations: 2,
          responseRate: 85.5,
          averageResponseTime: 120, // minutes
          lastMessage: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
          successRate: 92.3,
          queueLength: 1,
          capacity: 100,
          health: 'FAIR' as const,
          issues: ['Response time higher than target']
        },
        {
          id: 'video',
          name: 'video',
          displayName: 'Video Calls',
          type: 'VIDEO_CALL' as const,
          status: 'ACTIVE' as const,
          isEnabled: true,
          messageCount: 12,
          activeConversations: 3,
          responseRate: 88.9,
          averageResponseTime: 60, // minutes
          lastMessage: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          successRate: 89.3,
          queueLength: 0,
          capacity: 20,
          health: 'GOOD' as const,
          issues: []
        }
      ];

      return channels;
    } catch (error) {
      console.error('Failed to get channel status:', error);
      return [];
    }
  }

  // Get conversations
  private async getConversations(filters?: DashboardFilters): Promise<ConversationSummary[]> {
    try {
      // Mock conversations for demo
      const conversations: ConversationSummary[] = [
        {
          id: 'conv_1',
          sessionId: 'chat_123',
          channel: 'chat',
          customerId: 'user_123',
          customerName: 'John Doe',
          customerPhone: '+6598765432',
          customerEmail: 'john.doe@example.com',
          status: 'ACTIVE',
          priority: 'NORMAL',
          assignedAgent: 'agent_1',
          assignedAgentName: 'Dr. Sarah Lim',
          startedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          lastActivity: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
          messageCount: 12,
          waitTime: 2, // minutes
          responseTime: 3, // minutes
          satisfactionScore: 4.2,
          tags: ['appointment', 'follow-up'],
          clinicId: 'clinic_1',
          serviceId: 'service_1',
          urgencyLevel: 'NORMAL',
          medicalKeywords: ['follow-up', 'medication'],
          isUrgent: false,
          requiresFollowUp: true
        },
        {
          id: 'conv_2',
          sessionId: 'wa_456',
          channel: 'whatsapp',
          customerId: 'user_456',
          customerName: 'Jane Smith',
          customerPhone: '+6598765433',
          status: 'WAITING',
          priority: 'HIGH',
          startedAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
          lastActivity: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
          messageCount: 3,
          waitTime: 15, // minutes
          tags: ['urgent', 'symptoms'],
          clinicId: 'clinic_1',
          urgencyLevel: 'HIGH',
          medicalKeywords: ['pain', 'symptoms'],
          isUrgent: true,
          requiresFollowUp: false
        },
        {
          id: 'conv_3',
          sessionId: 'email_789',
          channel: 'email',
          customerId: 'user_789',
          customerName: 'Mike Johnson',
          customerEmail: 'mike.johnson@example.com',
          status: 'ON_HOLD',
          priority: 'URGENT',
          assignedAgent: 'agent_2',
          assignedAgentName: 'Nurse Emily Wong',
          startedAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
          lastActivity: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
          messageCount: 8,
          waitTime: 0, // assigned
          responseTime: 35, // minutes
          satisfactionScore: 3.8,
          tags: ['emergency', 'blood pressure'],
          clinicId: 'clinic_1',
          urgencyLevel: 'URGENT',
          medicalKeywords: ['blood pressure', 'dizziness'],
          isUrgent: true,
          requiresFollowUp: true
        }
      ];

      // Apply filters
      let filteredConversations = conversations;
      
      if (filters) {
        if (filters.channels && filters.channels.length > 0) {
          filteredConversations = filteredConversations.filter(c => filters.channels!.includes(c.channel));
        }
        
        if (filters.status && filters.status.length > 0) {
          filteredConversations = filteredConversations.filter(c => filters.status!.includes(c.status));
        }
        
        if (filters.priority && filters.priority.length > 0) {
          filteredConversations = filteredConversations.filter(c => filters.priority!.includes(c.priority));
        }
        
        if (filters.searchQuery) {
          const query = filters.searchQuery.toLowerCase();
          filteredConversations = filteredConversations.filter(c => 
            c.customerName.toLowerCase().includes(query) ||
            c.customerEmail?.toLowerCase().includes(query) ||
            c.customerPhone?.toLowerCase().includes(query)
          );
        }
      }

      return filteredConversations;
    } catch (error) {
      console.error('Failed to get conversations:', error);
      return [];
    }
  }

  // Get agent summary
  private async getAgentSummary(): Promise<AgentSummary[]> {
    try {
      const agents: AgentSummary[] = [
        {
          id: 'agent_1',
          name: 'Dr. Sarah Lim',
          email: 'sarah.lim@clinic.com',
          status: 'BUSY',
          currentChats: 3,
          maxChats: 5,
          specialties: ['General Practice', 'Healthier SG'],
          languages: ['English', 'Mandarin'],
          clinicId: 'clinic_1',
          averageResponseTime: 25,
          satisfactionScore: 4.5,
          resolvedToday: 12,
          activeSince: new Date('2024-01-01'),
          lastActivity: new Date(),
          performance: {
            responseTime: 25,
            resolutionRate: 92.5,
            customerSatisfaction: 4.5,
            escalationRate: 5.2
          },
          skills: ['Patient Communication', 'Medical History', 'Healthier SG'],
          certifications: ['Family Medicine', 'Healthier SG Certified']
        },
        {
          id: 'agent_2',
          name: 'Nurse Emily Wong',
          email: 'emily.wong@clinic.com',
          status: 'AVAILABLE',
          currentChats: 0,
          maxChats: 8,
          specialties: ['Triage', 'Patient Care'],
          languages: ['English', 'Mandarin', 'Malay'],
          clinicId: 'clinic_1',
          averageResponseTime: 15,
          satisfactionScore: 4.7,
          resolvedToday: 18,
          activeSince: new Date('2024-01-01'),
          lastActivity: new Date(),
          performance: {
            responseTime: 15,
            resolutionRate: 95.8,
            customerSatisfaction: 4.7,
            escalationRate: 2.1
          },
          skills: ['Triage', 'Vital Signs', 'Patient Education'],
          certifications: ['Registered Nurse', 'Triage Certification']
        },
        {
          id: 'agent_3',
          name: 'Dr. Michael Tan',
          email: 'michael.tan@clinic.com',
          status: 'AWAY',
          currentChats: 1,
          maxChats: 4,
          specialties: ['Internal Medicine', 'Chronic Disease'],
          languages: ['English', 'Mandarin'],
          clinicId: 'clinic_1',
          averageResponseTime: 35,
          satisfactionScore: 4.3,
          resolvedToday: 8,
          activeSince: new Date('2024-01-01'),
          lastActivity: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          performance: {
            responseTime: 35,
            resolutionRate: 88.9,
            customerSatisfaction: 4.3,
            escalationRate: 8.5
          },
          skills: ['Internal Medicine', 'Diabetes Management', 'Hypertension'],
          certifications: ['Internal Medicine', 'Endocrinology']
        }
      ];

      return agents;
    } catch (error) {
      console.error('Failed to get agent summary:', error);
      return [];
    }
  }

  // Get queue status
  private async getQueueStatus(): Promise<QueueStatus[]> {
    try {
      const queueStatus: QueueStatus[] = [
        {
          id: 'queue_chat',
          channel: 'chat',
          department: 'General Support',
          totalWaiting: 3,
          averageWaitTime: 12, // minutes
          oldestWaitTime: 25, // minutes
          priorityDistribution: {
            LOW: 0,
            NORMAL: 2,
            HIGH: 1,
            URGENT: 0,
            CRITICAL: 0
          },
          estimatedWaitTimes: {
            LOW: 8,
            NORMAL: 12,
            HIGH: 5,
            URGENT: 2,
            CRITICAL: 0
          }
        },
        {
          id: 'queue_whatsapp',
          channel: 'whatsapp',
          department: 'General Support',
          totalWaiting: 2,
          averageWaitTime: 8, // minutes
          oldestWaitTime: 15, // minutes
          priorityDistribution: {
            LOW: 0,
            NORMAL: 1,
            HIGH: 1,
            URGENT: 0,
            CRITICAL: 0
          },
          estimatedWaitTimes: {
            LOW: 6,
            NORMAL: 8,
            HIGH: 3,
            URGENT: 1,
            CRITICAL: 0
          }
        },
        {
          id: 'queue_social',
          channel: 'social',
          department: 'Social Media',
          totalWaiting: 1,
          averageWaitTime: 45, // minutes
          oldestWaitTime: 45, // minutes
          priorityDistribution: {
            LOW: 0,
            NORMAL: 1,
            HIGH: 0,
            URGENT: 0,
            CRITICAL: 0
          },
          estimatedWaitTimes: {
            LOW: 30,
            NORMAL: 45,
            HIGH: 20,
            URGENT: 10,
            CRITICAL: 5
          }
        }
      ];

      return queueStatus;
    } catch (error) {
      console.error('Failed to get queue status:', error);
      return [];
    }
  }

  // Get alerts
  private async getAlerts(filters?: DashboardFilters): Promise<AlertSummary[]> {
    try {
      const alerts: AlertSummary[] = [
        {
          id: 'alert_1',
          type: 'URGENT',
          priority: 'HIGH',
          title: 'High-priority conversation waiting too long',
          description: 'Conversation with Jane Smith has been waiting for 15 minutes',
          source: 'WHATSAPP',
          assignedTo: 'agent_1',
          status: 'IN_PROGRESS',
          createdAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
          updatedAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
          relatedConversation: 'conv_2',
          actions: [
            {
              id: 'action_1',
              type: 'ASSIGN',
              description: 'Assigned to Dr. Sarah Lim',
              takenBy: 'supervisor_1',
              takenAt: new Date(Date.now() - 5 * 60 * 1000),
              result: 'Successfully assigned'
            }
          ],
          escalationLevel: 2,
          impact: 'MEDIUM'
        },
        {
          id: 'alert_2',
          type: 'SYSTEM',
          priority: 'NORMAL',
          title: 'Social media response time degraded',
          description: 'Average response time for social media is above target threshold',
          source: 'SYSTEM',
          status: 'ACKNOWLEDGED',
          createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
          updatedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          actions: [
            {
              id: 'action_2',
              type: 'NOTIFY',
              description: 'Notified operations team',
              takenBy: 'system',
              takenAt: new Date(Date.now() - 30 * 60 * 1000),
              result: 'Alert acknowledged'
            }
          ],
          escalationLevel: 1,
          impact: 'LOW'
        }
      ];

      return alerts;
    } catch (error) {
      console.error('Failed to get alerts:', error);
      return [];
    }
  }

  // Get analytics data
  private async getAnalytics(filters?: DashboardFilters): Promise<AnalyticsData> {
    try {
      // Generate time series data for trends
      const now = new Date();
      const responseTimeTrend: TimeSeriesData[] = [];
      const resolutionRateTrend: TimeSeriesData[] = [];
      const satisfactionTrend: TimeSeriesData[] = [];

      for (let i = 23; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000); // Hourly data
        responseTimeTrend.push({
          timestamp,
          value: 30 + Math.random() * 20 - 10 // 20-40 range
        });
        resolutionRateTrend.push({
          timestamp,
          value: 85 + Math.random() * 10 // 85-95 range
        });
        satisfactionTrend.push({
          timestamp,
          value: 4.0 + Math.random() * 1.0 // 4.0-5.0 range
        });
      }

      return {
        overview: {
          totalMessages: 570,
          totalConversations: 145,
          averageResponseTime: 35,
          resolutionRate: 92.3,
          customerSatisfaction: 4.4,
          channelDistribution: {
            chat: 234,
            email: 145,
            whatsapp: 89,
            phone: 67,
            social: 23,
            video: 12
          }
        },
        performance: {
          responseTimeTrend,
          resolutionRateTrend,
          satisfactionTrend,
          channelPerformance: [
            {
              channel: 'chat',
              messageCount: 234,
              averageResponseTime: 30,
              resolutionRate: 92.8,
              customerSatisfaction: 4.3,
              errorRate: 2.1,
              uptime: 99.8
            },
            {
              channel: 'whatsapp',
              messageCount: 89,
              averageResponseTime: 25,
              resolutionRate: 97.2,
              customerSatisfaction: 4.6,
              errorRate: 0.9,
              uptime: 99.9
            }
          ],
          agentPerformance: [
            {
              agentId: 'agent_1',
              agentName: 'Dr. Sarah Lim',
              messagesHandled: 85,
              averageResponseTime: 25,
              resolutionRate: 92.5,
              customerSatisfaction: 4.5,
              activeTime: 480
            }
          ]
        },
        volume: {
          dailyVolume: [
            { timestamp: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000), value: 120 },
            { timestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), value: 145 },
            { timestamp: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000), value: 132 },
            { timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), value: 167 },
            { timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), value: 189 },
            { timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), value: 156 },
            { timestamp: now, value: 145 }
          ],
          hourlyPattern: Array.from({ length: 24 }, (_, i) => ({
            timestamp: new Date(now.getFullYear(), now.getMonth(), now.getDate(), i),
            value: Math.floor(Math.random() * 50) + 10
          })),
          channelVolume: {
            chat: 234,
            email: 145,
            whatsapp: 89,
            phone: 67,
            social: 23,
            video: 12
          },
          departmentVolume: {
            'General Support': 380,
            'Appointment Team': 95,
            'Healthier SG': 60,
            'Technical Support': 35
          }
        },
        quality: {
          sentimentAnalysis: {
            veryPositive: 15,
            positive: 45,
            neutral: 25,
            negative: 12,
            veryNegative: 3,
            trend: 'STABLE'
          },
          commonTopics: [
            { topic: 'Appointment Booking', mentionCount: 45, sentiment: 'NEUTRAL', urgency: 'NORMAL', category: 'Administrative' },
            { topic: 'Clinic Hours', mentionCount: 32, sentiment: 'NEUTRAL', urgency: 'LOW', category: 'Information' },
            { topic: 'Medical Symptoms', mentionCount: 28, sentiment: 'NEGATIVE', urgency: 'HIGH', category: 'Medical' },
            { topic: 'Healthier SG', mentionCount: 23, sentiment: 'POSITIVE', urgency: 'NORMAL', category: 'Program' }
          ],
          resolutionEfficiency: {
            chat: 92.8,
            whatsapp: 97.2,
            email: 94.5,
            phone: 99.5,
            social: 85.5,
            video: 88.9
          },
          errorRates: {
            chat: 2.1,
            whatsapp: 0.9,
            email: 1.5,
            phone: 0.2,
            social: 7.7,
            video: 10.7
          }
        }
      };
    } catch (error) {
      console.error('Failed to get analytics:', error);
      throw error;
    }
  }

  // Get system health
  private async getSystemHealth(): Promise<SystemHealth> {
    try {
      return {
        overall: 'HEALTHY',
        components: {
          'WebSocket Server': {
            status: 'HEALTHY',
            uptime: 99.8,
            lastCheck: new Date(),
            responseTime: 5,
            errorRate: 0.1,
            issues: []
          },
          'Database': {
            status: 'HEALTHY',
            uptime: 99.9,
            lastCheck: new Date(),
            responseTime: 12,
            errorRate: 0.0,
            issues: []
          },
          'Email Service': {
            status: 'HEALTHY',
            uptime: 99.5,
            lastCheck: new Date(),
            responseTime: 25,
            errorRate: 0.2,
            issues: []
          },
          'WhatsApp API': {
            status: 'HEALTHY',
            uptime: 99.9,
            lastCheck: new Date(),
            responseTime: 35,
            errorRate: 0.1,
            issues: []
          },
          'Video Platform': {
            status: 'WARNING',
            uptime: 95.2,
            lastCheck: new Date(),
            responseTime: 85,
            errorRate: 2.3,
            issues: ['Higher than normal response times']
          }
        },
        resources: {
          cpu: 35.2,
          memory: 62.8,
          storage: 45.6,
          network: 78.3
        },
        integrations: {
          'WhatsApp Business API': {
            status: 'CONNECTED',
            latency: 35,
            errorCount: 0,
            lastSuccessfulCall: new Date()
          },
          'SendGrid Email': {
            status: 'CONNECTED',
            latency: 25,
            errorCount: 1,
            lastSuccessfulCall: new Date()
          },
          'Twilio SMS': {
            status: 'CONNECTED',
            latency: 15,
            errorCount: 0,
            lastSuccessfulCall: new Date()
          },
          'Zoom Video': {
            status: 'DISCONNECTED',
            latency: 0,
            errorCount: 5,
            lastSuccessfulCall: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
          }
        }
      };
    } catch (error) {
      console.error('Failed to get system health:', error);
      throw error;
    }
  }

  // Data collection methods
  private async getTotalConversations(filters?: DashboardFilters): Promise<number> {
    // Mock implementation
    return 145;
  }

  private async getActiveConversations(filters?: DashboardFilters): Promise<number> {
    // Mock implementation
    return 25;
  }

  private async getWaitingConversations(filters?: DashboardFilters): Promise<number> {
    // Mock implementation
    return 6;
  }

  private async getResolvedToday(filters?: DashboardFilters): Promise<number> {
    // Mock implementation
    return 67;
  }

  private async getAverageResponseTime(filters?: DashboardFilters): Promise<number> {
    // Mock implementation
    return 35; // minutes
  }

  private async getCustomerSatisfaction(filters?: DashboardFilters): Promise<number> {
    // Mock implementation
    return 4.4; // out of 5
  }

  private async getEscalationRate(filters?: DashboardFilters): Promise<number> {
    // Mock implementation
    return 5.2; // percentage
  }

  private async getTotalMessages(filters?: DashboardFilters): Promise<number> {
    // Mock implementation
    return 570;
  }

  private async getActiveChannels(): Promise<number> {
    // Mock implementation
    return 6;
  }

  private calculateSystemStatus(): 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'MAINTENANCE' {
    // Simple status calculation
    return 'HEALTHY';
  }

  // Initialize data cache
  private initializeDataCache(): void {
    // Initialize cache with default data
    this.cache.set('overview', {});
    this.cache.set('channels', []);
    this.cache.set('conversations', []);
  }

  // Start auto-refresh
  private startAutoRefresh(): void {
    if (!this.config.autoRefresh) return;

    this.refreshInterval = setInterval(async () => {
      try {
        await this.refreshCache();
        this.broadcastRealTimeUpdate({
          type: 'CACHE_REFRESH',
          data: { timestamp: new Date() },
          timestamp: new Date(),
          priority: 'LOW'
        });
      } catch (error) {
        console.error('Auto-refresh failed:', error);
      }
    }, this.config.refreshInterval);
  }

  // Refresh cache
  private async refreshCache(): Promise<void> {
    try {
      const dashboardData = await this.getDashboardData();
      
      // Update cache
      this.cache.set('overview', dashboardData.overview);
      this.cache.set('channels', dashboardData.channels);
      this.cache.set('conversations', dashboardData.conversations);
      this.cache.set('agents', dashboardData.agents);
      this.cache.set('queue', dashboardData.queue);
      this.cache.set('alerts', dashboardData.alerts);
      this.cache.set('analytics', dashboardData.analytics);
      this.cache.set('systemHealth', dashboardData.systemHealth);
      
      this.lastRefresh = new Date();
    } catch (error) {
      console.error('Cache refresh failed:', error);
    }
  }

  // Broadcast real-time update
  private broadcastRealTimeUpdate(update: RealTimeUpdate): void {
    for (const [connectionId, connection] of this.activeConnections) {
      try {
        if (connection.ready) {
          connection.send(JSON.stringify(update));
        }
      } catch (error) {
        console.error(`Failed to send update to ${connectionId}:`, error);
        this.activeConnections.delete(connectionId);
      }
    }
  }

  // WebSocket connection management
  public addConnection(connectionId: string, connection: any): void {
    this.activeConnections.set(connectionId, connection);
  }

  public removeConnection(connectionId: string): void {
    this.activeConnections.delete(connectionId);
  }

  // Real-time data streaming
  public subscribeToUpdates(connectionId: string): void {
    const connection = this.activeConnections.get(connectionId);
    if (connection) {
      // Send initial data
      const initData = {
        type: 'INITIAL_DATA',
        data: {
          overview: this.cache.get('overview'),
          channels: this.cache.get('channels'),
          agents: this.cache.get('agents'),
          systemHealth: this.cache.get('systemHealth')
        },
        timestamp: new Date()
      };
      connection.send(JSON.stringify(initData));
    }
  }

  // Configuration updates
  public updateConfig(newConfig: Partial<z.infer<typeof DashboardConfigSchema>>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    this.startAutoRefresh();
  }

  // Manual refresh
  public async manualRefresh(): Promise<void> {
    await this.refreshCache();
  }

  // Health check
  public async getHealthStatus(): Promise<any> {
    return {
      status: 'healthy',
      lastRefresh: this.lastRefresh,
      activeConnections: this.activeConnections.size,
      cacheSize: this.cache.size,
      config: this.config
    };
  }

  // Event emitters
  onDataUpdate(callback: (data: DashboardData) => void): void {
    this.eventEmitter.on('dataUpdate', callback);
  }

  onAlert(callback: (alert: AlertSummary) => void): void {
    this.eventEmitter.on('alert', callback);
  }

  onSystemAlert(callback: (alert: any) => void): void {
    this.eventEmitter.on('systemAlert', callback);
  }

  // Cleanup
  public shutdown(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    
    // Close all connections
    for (const [connectionId, connection] of this.activeConnections) {
      if (connection.close) {
        connection.close();
      }
    }
    this.activeConnections.clear();
  }
}

// Export singleton instance
export const multiChannelDashboard = new MultiChannelDashboard(
  DashboardConfigSchema.parse({
    clinicId: 'default',
    refreshInterval: 5000,
    maxSessions: 100,
    showOffline: false,
    autoRefresh: true,
    theme: 'light',
    timezone: 'Asia/Singapore',
    workingHours: { start: '08:00', end: '20:00', timezone: 'Asia/Singapore' }
  })
);

export default MultiChannelDashboard;