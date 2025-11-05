// ========================================
// REAL-TIME LIVE CHAT SYSTEM
// Sub-Phase 9.7: WebSocket-based Live Chat
// Real-time chat system with queue management and agent assignment
// ========================================

import { z } from 'zod';
import { EventEmitter } from 'events';
import { WebSocketServer, WebSocket } from 'ws';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Live chat configuration schema
const LiveChatConfigSchema = z.object({
  clinicId: z.string().optional(),
  maxConcurrentChats: z.number().default(50),
  maxWaitTime: z.number().default(300), // 5 minutes
  workingHours: z.object({
    start: z.string().default('08:00'),
    end: z.string().default('20:00'),
    timezone: z.string().default('Asia/Singapore')
  }).default({}),
  autoAssignment: z.boolean().default(true),
  queueEnabled: z.boolean().default(true),
  escalationEnabled: z.boolean().default(true),
  greetingMessage: z.string().default('Welcome to My Family Clinic! How can we help you today?'),
  offlineMessage: z.string().default('We are currently offline. Please leave a message and we will get back to you soon.'),
  isActive: z.boolean().default(true)
});

// Chat session interface
export interface ChatSession {
  id: string;
  sessionId: string;
  customerId?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  clinicId?: string;
  doctorId?: string;
  serviceId?: string;
  department?: string;
  assignedAgent?: string;
  assignedAgentName?: string;
  isAgentAssigned: boolean;
  agentJoinedAt?: Date;
  status: ChatSessionStatus;
  priority: ChatPriority;
  queuePosition?: number;
  isTyping: boolean;
  isArchived: boolean;
  isEmergency: boolean;
  requiresCallback: boolean;
  patientType: PatientType;
  urgencyLevel: UrgencyLevel;
  medicalKeywords: string[];
  startedAt: Date;
  firstResponseAt?: Date;
  endedAt?: Date;
  messageCount: number;
  waitTime?: number;
  responseTime?: number;
  resolutionTime?: number;
  connectionId?: string;
  lastActivity: Date;
  escalationTriggered: boolean;
  escalatedAt?: Date;
  integrationData: any;
  createdAt: Date;
  updatedAt: Date;
}

// Chat message interface
export interface ChatMessage {
  id: string;
  sessionId: string;
  messageId: string;
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM' | 'TYPING' | 'JOIN' | 'LEAVE';
  senderId: string;
  senderName: string;
  senderType: 'CUSTOMER' | 'AGENT' | 'SYSTEM';
  senderChannel: 'CHAT';
  status: 'SENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  sentAt: Date;
  deliveredAt?: Date;
  readAt?: Date;
  hasAttachments: boolean;
  attachmentCount: number;
  attachments: ChatAttachment[];
  clinicId?: string;
  doctorId?: string;
  sentiment?: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  confidence?: number;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
}

// Chat attachment
export interface ChatAttachment {
  id: string;
  filename: string;
  url: string;
  type: string;
  size: number;
  mimeType: string;
  thumbnailUrl?: string;
}

// Agent status
export interface AgentStatus {
  agentId: string;
  agentName: string;
  status: 'AVAILABLE' | 'BUSY' | 'AWAY' | 'OFFLINE';
  currentChats: number;
  maxChats: number;
  specialties: string[];
  languages: string[];
  clinicId?: string;
  lastActivity: Date;
  averageResponseTime?: number;
  satisfactionScore?: number;
}

// Queue entry
export interface ChatQueue {
  sessionId: string;
  position: number;
  customerName: string;
  priority: ChatPriority;
  waitTime: number;
  estimatedWait: number;
  clinicId?: string;
  department?: string;
  medicalKeywords: string[];
  joinedAt: Date;
}

// Typing indicator
export interface TypingIndicator {
  sessionId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
  startedAt: Date;
}

// System status
export type ChatSessionStatus = 'WAITING' | 'ACTIVE' | 'TRANSFERRED' | 'ON_HOLD' | 'ESCALATED' | 'COMPLETED' | 'CANCELLED' | 'TIMEOUT' | 'ABANDONED' | 'TRANSFERRED';
export type ChatPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' | 'CRITICAL' | 'VIP' | 'EMERGENCY';
export type PatientType = 'NEW' | 'EXISTING' | 'RETURNING' | 'REFERRAL' | 'EMERGENCY' | 'WALK_IN' | 'APPOINTMENT' | 'FOLLOW_UP';
export type UrgencyLevel = 'LOW' | 'ROUTINE' | 'NORMAL' | 'HIGH' | 'URGENT' | 'CRITICAL' | 'EMERGENCY';

// Live Chat Server
export class LiveChatServer {
  private wss: WebSocketServer;
  private eventEmitter: EventEmitter;
  private sessions: Map<string, ChatSession> = new Map();
  private agents: Map<string, AgentStatus> = new Map();
  private queue: ChatQueue[] = [];
  private connections: Map<string, WebSocket> = new Map(); // connectionId -> WebSocket
  private typingIndicators: Map<string, TypingIndicator> = new Map();
  private config: z.infer<typeof LiveChatConfigSchema>;
  private isOperatingHours: boolean = true;
  private queueProcessor: NodeJS.Timeout | null = null;
  private heartbeat: NodeJS.Timeout | null = null;

  constructor(config: z.infer<typeof LiveChatConfigSchema>, port: number = 8080) {
    this.config = LiveChatConfigSchema.parse(config);
    this.eventEmitter = new EventEmitter();
    
    // Initialize WebSocket server
    this.wss = new WebSocketServer({ port });
    this.setupWebSocketHandlers();
    
    // Start background processes
    this.startQueueProcessor();
    this.startHeartbeat();
    this.checkOperatingHours();
    
    console.log(`Live Chat Server started on port ${port}`);
  }

  // WebSocket setup
  private setupWebSocketHandlers(): void {
    this.wss.on('connection', (ws: WebSocket, req) => {
      this.handleConnection(ws, req);
    });

    this.wss.on('error', (error) => {
      console.error('WebSocket Server Error:', error);
      this.eventEmitter.emit('serverError', error);
    });
  }

  // Handle new connection
  private handleConnection(ws: WebSocket, req: any): void {
    const connectionId = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.connections.set(connectionId, ws);
    
    console.log(`New WebSocket connection: ${connectionId}`);

    // Send welcome message
    this.sendMessage(ws, {
      type: 'CONNECTION_ESTABLISHED',
      data: {
        connectionId,
        greetingMessage: this.config.greetingMessage,
        isOperatingHours: this.isOperatingHours,
        serverTime: new Date()
      }
    });

    // Handle messages
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        this.handleMessage(ws, connectionId, message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
        this.sendError(ws, 'INVALID_MESSAGE_FORMAT', 'Invalid message format');
      }
    });

    // Handle disconnection
    ws.on('close', () => {
      this.handleDisconnection(connectionId);
    });

    // Handle errors
    ws.on('error', (error) => {
      console.error(`WebSocket error for ${connectionId}:`, error);
    });

    this.eventEmitter.emit('connectionEstablished', connectionId);
  }

  // Handle WebSocket messages
  private handleMessage(ws: WebSocket, connectionId: string, message: any): void {
    try {
      switch (message.type) {
        case 'START_CHAT':
          this.startChatSession(ws, connectionId, message.data);
          break;
        case 'SEND_MESSAGE':
          this.handleChatMessage(ws, connectionId, message.data);
          break;
        case 'JOIN_AS_AGENT':
          this.joinAsAgent(ws, connectionId, message.data);
          break;
        case 'AGENT_ASSIGNMENT':
          this.assignAgentToSession(ws, connectionId, message.data);
          break;
        case 'TYPING_INDICATOR':
          this.handleTypingIndicator(ws, connectionId, message.data);
          break;
        case 'END_CHAT':
          this.endChatSession(ws, connectionId, message.data);
          break;
        case 'TRANSFER_SESSION':
          this.transferSession(ws, connectionId, message.data);
          break;
        case 'REQUEST_HISTORY':
          this.sendChatHistory(ws, message.data);
          break;
        case 'PING':
          this.sendMessage(ws, { type: 'PONG', data: { timestamp: new Date() } });
          break;
        default:
          this.sendError(ws, 'UNKNOWN_MESSAGE_TYPE', `Unknown message type: ${message.type}`);
      }
    } catch (error) {
      console.error('Message handling error:', error);
      this.sendError(ws, 'MESSAGE_PROCESSING_ERROR', 'Failed to process message');
    }
  }

  // Start new chat session
  private startChatSession(ws: WebSocket, connectionId: string, data: any): void {
    try {
      const sessionId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create session
      const session: ChatSession = {
        id: `session_${sessionId}`,
        sessionId,
        customerName: data.customerName || 'Guest User',
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        clinicId: data.clinicId,
        doctorId: data.doctorId,
        serviceId: data.serviceId,
        department: data.department,
        assignedAgent: undefined,
        assignedAgentName: undefined,
        isAgentAssigned: false,
        status: this.isOperatingHours ? 'WAITING' : 'WAITING',
        priority: this.determinePriority(data),
        isTyping: false,
        isArchived: false,
        isEmergency: this.isEmergency(data),
        requiresCallback: data.requiresCallback || false,
        patientType: data.patientType || 'NEW',
        urgencyLevel: data.urgencyLevel || 'NORMAL',
        medicalKeywords: this.extractMedicalKeywords(data.message || ''),
        startedAt: new Date(),
        firstResponseAt: undefined,
        endedAt: undefined,
        messageCount: 0,
        connectionId,
        lastActivity: new Date(),
        escalationTriggered: false,
        integrationData: data.integrationData || {},
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Store session
      this.sessions.set(sessionId, session);

      // Handle queue or auto-assign
      if (this.isOperatingHours && this.config.queueEnabled) {
        if (this.config.autoAssignment) {
          this.attemptAutoAssignment(session);
        } else {
          this.addToQueue(session);
        }
      }

      // Confirm session start
      this.sendMessage(ws, {
        type: 'CHAT_STARTED',
        data: {
          sessionId,
          status: session.status,
          priority: session.priority,
          queuePosition: session.queuePosition,
          estimatedWait: this.estimateWaitTime(session)
        }
      });

      // Save to database
      this.saveChatSession(session);

      this.eventEmitter.emit('chatStarted', session);
      
    } catch (error) {
      console.error('Failed to start chat session:', error);
      this.sendError(ws, 'SESSION_START_ERROR', 'Failed to start chat session');
    }
  }

  // Handle chat messages
  private handleChatMessage(ws: WebSocket, connectionId: string, data: any): void {
    try {
      const session = this.sessions.get(data.sessionId);
      if (!session) {
        this.sendError(ws, 'SESSION_NOT_FOUND', 'Chat session not found');
        return;
      }

      // Create message
      const message: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sessionId: data.sessionId,
        messageId: `msg_${Date.now()}`,
        content: data.content,
        messageType: data.messageType || 'TEXT',
        senderId: data.senderId || session.customerId || 'customer',
        senderName: data.senderName || session.customerName,
        senderType: data.senderType || 'CUSTOMER',
        senderChannel: 'CHAT',
        status: 'SENT',
        sentAt: new Date(),
        hasAttachments: data.attachments?.length > 0 || false,
        attachmentCount: data.attachments?.length || 0,
        attachments: data.attachments || [],
        clinicId: session.clinicId,
        doctorId: session.doctorId,
        sentiment: this.analyzeSentiment(data.content),
        confidence: this.calculateConfidence(data.content),
        metadata: data.metadata || {},
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Update session
      session.messageCount++;
      session.lastActivity = new Date();
      if (!session.firstResponseAt && data.senderType === 'AGENT') {
        session.firstResponseAt = new Date();
      }

      // Save message
      this.saveChatMessage(message);
      this.sessions.set(session.sessionId, session);

      // Broadcast message to all participants
      this.broadcastMessage(session.sessionId, {
        type: 'NEW_MESSAGE',
        data: message
      });

      // Check for escalation triggers
      this.checkEscalationTriggers(session, message);

      this.eventEmitter.emit('messageReceived', session, message);
      
    } catch (error) {
      console.error('Failed to handle chat message:', error);
      this.sendError(ws, 'MESSAGE_ERROR', 'Failed to process message');
    }
  }

  // Join as agent
  private joinAsAgent(ws: WebSocket, connectionId: string, data: any): void {
    try {
      const agent: AgentStatus = {
        agentId: data.agentId,
        agentName: data.agentName,
        status: 'AVAILABLE',
        currentChats: 0,
        maxChats: data.maxChats || 10,
        specialties: data.specialties || [],
        languages: data.languages || ['en'],
        clinicId: data.clinicId,
        lastActivity: new Date()
      };

      this.agents.set(agent.agentId, agent);

      this.sendMessage(ws, {
        type: 'AGENT_JOINED',
        data: {
          agentId: agent.agentId,
          status: agent.status,
          availableSessions: this.getAvailableSessionsForAgent(agent)
        }
      });

      this.eventEmitter.emit('agentJoined', agent);
      
    } catch (error) {
      console.error('Failed to join as agent:', error);
      this.sendError(ws, 'AGENT_JOIN_ERROR', 'Failed to join as agent');
    }
  }

  // Assign agent to session
  private assignAgentToSession(ws: WebSocket, connectionId: string, data: any): void {
    try {
      const session = this.sessions.get(data.sessionId);
      const agent = this.agents.get(data.agentId);
      
      if (!session || !agent) {
        this.sendError(ws, 'ASSIGNMENT_ERROR', 'Session or agent not found');
        return;
      }

      if (agent.currentChats >= agent.maxChats) {
        this.sendError(ws, 'AGENT_UNAVAILABLE', 'Agent has reached maximum chat capacity');
        return;
      }

      // Update session
      session.assignedAgent = agent.agentId;
      session.assignedAgentName = agent.agentName;
      session.isAgentAssigned = true;
      session.agentJoinedAt = new Date();
      session.status = 'ACTIVE';
      session.updatedAt = new Date();

      // Update agent
      agent.currentChats++;
      agent.status = 'BUSY';
      agent.lastActivity = new Date();

      // Remove from queue if present
      this.removeFromQueue(session.sessionId);

      // Notify both parties
      this.broadcastMessage(session.sessionId, {
        type: 'AGENT_ASSIGNED',
        data: {
          sessionId: session.sessionId,
          agentId: agent.agentId,
          agentName: agent.agentName,
          joinedAt: session.agentJoinedAt
        }
      });

      this.sessions.set(session.sessionId, session);
      this.agents.set(agent.agentId, agent);

      // Update database
      this.updateChatSession(session);

      this.eventEmitter.emit('agentAssigned', session, agent);
      
    } catch (error) {
      console.error('Failed to assign agent:', error);
      this.sendError(ws, 'ASSIGNMENT_ERROR', 'Failed to assign agent');
    }
  }

  // Handle typing indicator
  private handleTypingIndicator(ws: WebSocket, connectionId: string, data: any): void {
    const indicator: TypingIndicator = {
      sessionId: data.sessionId,
      userId: data.userId,
      userName: data.userName,
      isTyping: data.isTyping,
      startedAt: new Date()
    };

    this.typingIndicators.set(`${data.sessionId}_${data.userId}`, indicator);

    // Broadcast typing indicator
    this.broadcastMessage(data.sessionId, {
      type: 'TYPING_INDICATOR',
      data: indicator
    }, [data.userId]); // Don't send back to sender

    // Clear typing indicator after 3 seconds
    setTimeout(() => {
      this.typingIndicators.delete(`${data.sessionId}_${data.userId}`);
    }, 3000);
  }

  // End chat session
  private endChatSession(ws: WebSocket, connectionId: string, data: any): void {
    try {
      const session = this.sessions.get(data.sessionId);
      if (!session) {
        this.sendError(ws, 'SESSION_NOT_FOUND', 'Chat session not found');
        return;
      }

      // Update session
      session.status = 'COMPLETED';
      session.endedAt = new Date();
      session.updatedAt = new Date();
      
      // Update agent if assigned
      if (session.assignedAgent) {
        const agent = this.agents.get(session.assignedAgent);
        if (agent) {
          agent.currentChats = Math.max(0, agent.currentChats - 1);
          if (agent.currentChats === 0) {
            agent.status = 'AVAILABLE';
          }
          agent.lastActivity = new Date();
          this.agents.set(agent.agentId, agent);
        }
      }

      // Remove from queue
      this.removeFromQueue(session.sessionId);

      // Notify participants
      this.broadcastMessage(session.sessionId, {
        type: 'CHAT_ENDED',
        data: {
          sessionId: session.sessionId,
          endedAt: session.endedAt,
          messageCount: session.messageCount,
          duration: session.endedAt.getTime() - session.startedAt.getTime()
        }
      });

      this.sessions.set(session.sessionId, session);
      this.updateChatSession(session);

      this.eventEmitter.emit('chatEnded', session);
      
    } catch (error) {
      console.error('Failed to end chat session:', error);
      this.sendError(ws, 'SESSION_END_ERROR', 'Failed to end chat session');
    }
  }

  // Transfer session
  private transferSession(ws: WebSocket, connectionId: string, data: any): void {
    // Implementation for session transfer
    // This would involve reassigning to a different agent or department
  }

  // Send chat history
  private sendChatHistory(ws: WebSocket, data: any): void {
    // Implementation for sending chat history
    // Query database for previous messages in the session
  }

  // Handle disconnection
  private handleDisconnection(connectionId: string): void {
    console.log(`WebSocket disconnected: ${connectionId}`);
    this.connections.delete(connectionId);
    
    // Find and update session if customer disconnected
    for (const [sessionId, session] of this.sessions) {
      if (session.connectionId === connectionId) {
        // Session still active, may need timeout handling
        this.eventEmitter.emit('customerDisconnected', session);
      }
    }
    
    this.eventEmitter.emit('connectionDisconnected', connectionId);
  }

  // Queue management
  private addToQueue(session: ChatSession): void {
    const queueEntry: ChatQueue = {
      sessionId: session.sessionId,
      position: this.queue.length + 1,
      customerName: session.customerName,
      priority: session.priority,
      waitTime: 0,
      estimatedWait: this.estimateWaitTime(session),
      clinicId: session.clinicId,
      department: session.department,
      medicalKeywords: session.medicalKeywords,
      joinedAt: new Date()
    };

    this.queue.push(queueEntry);
    session.queuePosition = queueEntry.position;
    
    this.eventEmitter.emit('queued', session, queueEntry);
  }

  private removeFromQueue(sessionId: string): void {
    const index = this.queue.findIndex(entry => entry.sessionId === sessionId);
    if (index >= 0) {
      this.queue.splice(index, 1);
      // Update positions
      this.queue.forEach((entry, i) => {
        entry.position = i + 1;
      });
    }
  }

  private attemptAutoAssignment(session: ChatSession): void {
    const availableAgents = Array.from(this.agents.values())
      .filter(agent => 
        agent.status === 'AVAILABLE' && 
        agent.currentChats < agent.maxChats &&
        (!agent.clinicId || agent.clinicId === session.clinicId)
      )
      .sort((a, b) => {
        // Prioritize by current load and experience
        const loadA = a.currentChats / a.maxChats;
        const loadB = b.currentChats / b.maxChats;
        if (loadA !== loadB) return loadA - loadB;
        return (a.averageResponseTime || 0) - (b.averageResponseTime || 0);
      });

    if (availableAgents.length > 0) {
      const bestAgent = availableAgents[0];
      this.assignAgentToSession(
        this.connections.get(session.connectionId!)!,
        session.connectionId!,
        { sessionId: session.sessionId, agentId: bestAgent.agentId }
      );
    } else {
      this.addToQueue(session);
    }
  }

  // Utility methods
  private determinePriority(data: any): ChatPriority {
    if (data.isEmergency) return 'EMERGENCY';
    if (data.priority) return data.priority;
    if (data.urgencyLevel === 'CRITICAL' || data.urgencyLevel === 'EMERGENCY') return 'CRITICAL';
    if (data.urgencyLevel === 'URGENT') return 'URGENT';
    if (data.urgencyLevel === 'HIGH') return 'HIGH';
    return 'NORMAL';
  }

  private isEmergency(data: any): boolean {
    return data.urgencyLevel === 'EMERGENCY' || 
           data.isEmergency || 
           this.hasEmergencyKeywords(data.message || '');
  }

  private hasEmergencyKeywords(message: string): boolean {
    const emergencyKeywords = [
      'emergency', 'urgent', 'help', 'can\'t breathe', 'chest pain',
      'heart attack', 'stroke', 'accident', 'injury', 'bleeding',
      'unconscious', 'severe pain', 'can\'t move'
    ];
    const lowerMessage = message.toLowerCase();
    return emergencyKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  private extractMedicalKeywords(message: string): string[] {
    const medicalTerms = [
      'doctor', 'appointment', 'symptoms', 'pain', 'fever', 'cough',
      'headache', 'medication', 'treatment', 'checkup', 'consultation'
    ];
    const lowerMessage = message.toLowerCase();
    return medicalTerms.filter(term => lowerMessage.includes(term));
  }

  private analyzeSentiment(content: string): 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' {
    // Simplified sentiment analysis
    const positiveWords = ['good', 'great', 'excellent', 'thank', 'helpful'];
    const negativeWords = ['bad', 'terrible', 'awful', 'frustrated', 'angry'];
    
    const lowerContent = content.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerContent.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerContent.includes(word)).length;
    
    if (negativeCount > positiveCount) return 'NEGATIVE';
    if (positiveCount > negativeCount) return 'POSITIVE';
    return 'NEUTRAL';
  }

  private calculateConfidence(content: string): number {
    // Simplified confidence calculation
    return Math.min(0.9, 0.5 + (content.length / 1000));
  }

  private estimateWaitTime(session: ChatSession): number {
    const position = session.queuePosition || this.queue.length + 1;
    const avgHandleTime = 300; // 5 minutes average
    return position * avgHandleTime;
  }

  private getAvailableSessionsForAgent(agent: AgentStatus): ChatSession[] {
    return Array.from(this.sessions.values())
      .filter(session => 
        session.status === 'WAITING' && 
        (!agent.clinicId || agent.clinicId === session.clinicId) &&
        (session.department === undefined || agent.specialties.includes(session.department))
      )
      .sort((a, b) => {
        // Sort by priority, then by wait time
        const priorityOrder = { CRITICAL: 4, URGENT: 3, HIGH: 2, NORMAL: 1, LOW: 0 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return a.startedAt.getTime() - b.startedAt.getTime();
      });
  }

  private checkEscalationTriggers(session: ChatSession, message: ChatMessage): void {
    if (session.escalationTriggered) return;

    // Check for escalation conditions
    const shouldEscalate = 
      message.sentiment === 'NEGATIVE' && message.confidence! > 0.7 ||
      this.hasEmergencyKeywords(message.content) ||
      session.messageCount > 10 && !session.isAgentAssigned ||
      session.waitTime && session.waitTime > this.config.maxWaitTime;

    if (shouldEscalate) {
      session.escalationTriggered = true;
      session.escalatedAt = new Date();
      session.status = 'ESCALATED';
      
      this.broadcastMessage(session.sessionId, {
        type: 'SESSION_ESCALATED',
        data: {
          sessionId: session.sessionId,
          reason: 'Escalation triggered automatically',
          escalatedAt: session.escalatedAt
        }
      });

      this.eventEmitter.emit('sessionEscalated', session);
    }
  }

  // Database operations
  private async saveChatSession(session: ChatSession): Promise<void> {
    try {
      await prisma.liveChatSession.create({
        data: {
          sessionId: session.sessionId,
          customerName: session.customerName,
          customerEmail: session.customerEmail,
          customerPhone: session.customerPhone,
          clinicId: session.clinicId,
          doctorId: session.doctorId,
          serviceId: session.serviceId,
          department: session.department,
          assignedAgent: session.assignedAgent,
          assignedAgentName: session.assignedAgentName,
          isAgentAssigned: session.isAgentAssigned,
          agentJoinedAt: session.agentJoinedAt,
          status: session.status,
          priority: session.priority,
          queuePosition: session.queuePosition,
          isTyping: session.isTyping,
          isArchived: session.isArchived,
          isEmergency: session.isEmergency,
          requiresCallback: session.requiresCallback,
          patientType: session.patientType,
          urgencyLevel: session.urgencyLevel,
          medicalKeywords: session.medicalKeywords,
          startedAt: session.startedAt,
          firstResponseAt: session.firstResponseAt,
          endedAt: session.endedAt,
          messageCount: session.messageCount,
          waitTime: session.waitTime,
          responseTime: session.responseTime,
          resolutionTime: session.resolutionTime,
          connectionId: session.connectionId,
          lastActivity: session.lastActivity,
          escalationTriggered: session.escalationTriggered,
          escalatedAt: session.escalatedAt,
          integrationData: session.integrationData
        }
      });
    } catch (error) {
      console.error('Failed to save chat session:', error);
    }
  }

  private async saveChatMessage(message: ChatMessage): Promise<void> {
    try {
      await prisma.channelMessage.create({
        data: {
          channelId: 'chat',
          conversationId: message.sessionId,
          messageId: message.messageId,
          content: message.content,
          messageType: message.messageType,
          senderId: message.senderId,
          senderName: message.senderName,
          senderType: message.senderType,
          senderChannel: 'CHAT',
          status: message.status,
          sentAt: message.sentAt,
          deliveredAt: message.deliveredAt,
          readAt: message.readAt,
          hasAttachments: message.hasAttachments,
          attachmentCount: message.attachmentCount,
          attachments: message.attachments,
          clinicId: message.clinicId,
          doctorId: message.doctorId,
          sentiment: message.sentiment,
          metadata: message.metadata
        }
      });
    } catch (error) {
      console.error('Failed to save chat message:', error);
    }
  }

  private async updateChatSession(session: ChatSession): Promise<void> {
    try {
      await prisma.liveChatSession.update({
        where: { sessionId: session.sessionId },
        data: {
          assignedAgent: session.assignedAgent,
          assignedAgentName: session.assignedAgentName,
          isAgentAssigned: session.isAgentAssigned,
          agentJoinedAt: session.agentJoinedAt,
          status: session.status,
          queuePosition: session.queuePosition,
          isTyping: session.isTyping,
          isArchived: session.isArchived,
          escalationTriggered: session.escalationTriggered,
          escalatedAt: session.escalatedAt,
          updatedAt: session.updatedAt,
          lastActivity: session.lastActivity,
          messageCount: session.messageCount,
          firstResponseAt: session.firstResponseAt,
          endedAt: session.endedAt
        }
      });
    } catch (error) {
      console.error('Failed to update chat session:', error);
    }
  }

  // Background processes
  private startQueueProcessor(): void {
    this.queueProcessor = setInterval(() => {
      this.processQueue();
    }, 10000); // Process queue every 10 seconds
  }

  private processQueue(): void {
    if (!this.config.autoAssignment || !this.isOperatingHours) return;

    for (let i = 0; i < this.queue.length; i++) {
      const queueEntry = this.queue[i];
      const session = this.sessions.get(queueEntry.sessionId);
      
      if (!session) {
        this.queue.splice(i, 1);
        continue;
      }

      // Update wait time
      queueEntry.waitTime = Date.now() - queueEntry.joinedAt.getTime();
      queueEntry.estimatedWait = this.estimateWaitTime(session);

      // Check if session should be escalated due to wait time
      if (queueEntry.waitTime > this.config.maxWaitTime * 1000) {
        this.escalateWaitTimeSession(session);
      }

      // Try to assign agent
      this.attemptAutoAssignment(session);
    }
  }

  private escalateWaitTimeSession(session: ChatSession): void {
    session.status = 'ESCALATED';
    session.escalationTriggered = true;
    session.escalatedAt = new Date();
    
    this.broadcastMessage(session.sessionId, {
      type: 'WAIT_TIME_ESCALATION',
      data: {
        sessionId: session.sessionId,
        waitTime: session.waitTime,
        escalatedAt: session.escalatedAt
      }
    });

    this.eventEmitter.emit('waitTimeEscalation', session);
  }

  private startHeartbeat(): void {
    this.heartbeat = setInterval(() => {
      this.broadcastMessage('*', {
        type: 'HEARTBEAT',
        data: { timestamp: new Date() }
      });
    }, 30000); // Send heartbeat every 30 seconds
  }

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
      const [startHour, startMinute] = this.config.workingHours.start.split(':').map(Number);
      const [endHour, endMinute] = this.config.workingHours.end.split(':').map(Number);
      const startTime = startHour * 60 + startMinute;
      const endTime = endHour * 60 + endMinute;
      
      const wasOperating = this.isOperatingHours;
      this.isOperatingHours = currentTime >= startTime && currentTime <= endTime;
      
      if (wasOperating !== this.isOperatingHours) {
        this.broadcastMessage('*', {
          type: 'OPERATING_STATUS_CHANGED',
          data: {
            isOperatingHours: this.isOperatingHours,
            workingHours: this.config.workingHours
          }
        });
        
        this.eventEmitter.emit('operatingStatusChanged', this.isOperatingHours);
      }
    };

    // Check immediately and then every minute
    updateOperatingStatus();
    setInterval(updateOperatingStatus, 60000);
  }

  // Message broadcasting
  private sendMessage(ws: WebSocket, message: any): void {
    try {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }

  private sendError(ws: WebSocket, code: string, message: string): void {
    this.sendMessage(ws, {
      type: 'ERROR',
      data: { code, message }
    });
  }

  private broadcastMessage(sessionId: string, message: any, excludeUserIds: string[] = []): void {
    for (const [connectionId, ws] of this.connections) {
      const session = Array.from(this.sessions.values()).find(s => s.connectionId === connectionId);
      
      if (session && (sessionId === '*' || session.sessionId === sessionId)) {
        this.sendMessage(ws, message);
      }
    }
  }

  // Public methods for external control
  public getServerStatus(): any {
    return {
      isOperatingHours: this.isOperatingHours,
      activeSessions: Array.from(this.sessions.values()).filter(s => s.status === 'ACTIVE').length,
      waitingSessions: Array.from(this.sessions.values()).filter(s => s.status === 'WAITING').length,
      queueLength: this.queue.length,
      availableAgents: Array.from(this.agents.values()).filter(a => a.status === 'AVAILABLE').length,
      totalConnections: this.connections.size,
      maxConcurrentChats: this.config.maxConcurrentChats,
      workingHours: this.config.workingHours
    };
  }

  public getSessions(): ChatSession[] {
    return Array.from(this.sessions.values());
  }

  public getAgents(): AgentStatus[] {
    return Array.from(this.agents.values());
  }

  public getQueue(): ChatQueue[] {
    return [...this.queue];
  }

  public updateConfig(newConfig: Partial<z.infer<typeof LiveChatConfigSchema>>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public shutdown(): void {
    if (this.queueProcessor) {
      clearInterval(this.queueProcessor);
    }
    if (this.heartbeat) {
      clearInterval(this.heartbeat);
    }
    this.wss.close();
    console.log('Live Chat Server shut down');
  }

  // Event listeners
  onChatStarted(callback: (session: ChatSession) => void): void {
    this.eventEmitter.on('chatStarted', callback);
  }

  onMessageReceived(callback: (session: ChatSession, message: ChatMessage) => void): void {
    this.eventEmitter.on('messageReceived', callback);
  }

  onAgentAssigned(callback: (session: ChatSession, agent: AgentStatus) => void): void {
    this.eventEmitter.on('agentAssigned', callback);
  }

  onChatEnded(callback: (session: ChatSession) => void): void {
    this.eventEmitter.on('chatEnded', callback);
  }

  onSessionEscalated(callback: (session: ChatSession) => void): void {
    this.eventEmitter.on('sessionEscalated', callback);
  }

  onOperatingStatusChanged(callback: (isOperatingHours: boolean) => void): void {
    this.eventEmitter.on('operatingStatusChanged', callback);
  }
}

// Export singleton instance
export const liveChatServer = new LiveChatServer(
  LiveChatConfigSchema.parse({
    clinicId: 'default',
    maxConcurrentChats: 50,
    workingHours: { start: '08:00', end: '20:00', timezone: 'Asia/Singapore' },
    autoAssignment: true,
    queueEnabled: true,
    escalationEnabled: true,
    isActive: true
  }),
  8080
);

export default LiveChatServer;