import { WebSocketServer, WebSocket } from 'ws'
import { EventEmitter } from 'events'
import { 
  ChatSessionStatus, 
  ChatPriority, 
  MessageType, 
  MessageSenderType,
  MessageRecipientType
} from '../lib/types/multi-channel-contact'

// WebSocket Manager for Multi-Channel Real-Time Communication
export class WebSocketManager extends EventEmitter {
  private wss: WebSocketServer
  private connections: Map<string, WebSocketConnection> = new Map()
  private chatSessions: Map<string, ChatSession> = new Map()
  private messageQueue: Map<string, MessageQueue[]> = new Map()
  private isShuttingDown: boolean = false

  constructor(port: number = 8080) {
    super()
    this.wss = new WebSocketServer({ port })
    this.setupWebSocketServer()
    console.log(`WebSocket server started on port ${port}`)
  }

  private setupWebSocketServer() {
    this.wss.on('connection', (ws: WebSocket, request) => {
      this.handleConnection(ws, request)
    })

    this.wss.on('error', (error) => {
      console.error('WebSocket server error:', error)
      this.emit('serverError', error)
    })
  }

  private handleConnection(ws: WebSocket, request: any) {
    const connectionId = this.generateConnectionId()
    const connection = new WebSocketConnection(ws, connectionId, request)
    
    this.connections.set(connectionId, connection)
    
    console.log(`New WebSocket connection: ${connectionId}`)
    
    // Setup event listeners
    connection.on('message', (data) => {
      this.handleMessage(connectionId, data)
    })
    
    connection.on('close', () => {
      this.handleDisconnection(connectionId)
    })
    
    connection.on('error', (error) => {
      console.error(`WebSocket connection error ${connectionId}:`, error)
    })

    // Send welcome message
    connection.send({
      type: 'connection_established',
      data: {
        connectionId,
        timestamp: new Date().toISOString(),
        serverTime: new Date().toISOString()
      }
    })
  }

  private handleMessage(connectionId: string, data: any) {
    try {
      const message = JSON.parse(data.toString())
      
      switch (message.type) {
        case 'start_chat':
          this.startChatSession(connectionId, message.data)
          break
          
        case 'join_chat':
          this.joinChatSession(connectionId, message.data)
          break
          
        case 'send_message':
          this.sendMessage(connectionId, message.data)
          break
          
        case 'typing_indicator':
          this.updateTypingStatus(connectionId, message.data)
          break
          
        case 'mark_read':
          this.markMessageAsRead(connectionId, message.data)
          break
          
        case 'end_chat':
          this.endChatSession(connectionId, message.data)
          break
          
        case 'transfer_chat':
          this.transferChatSession(connectionId, message.data)
          break
          
        case 'request_availability':
          this.checkAgentAvailability(connectionId, message.data)
          break
          
        case 'get_session_info':
          this.getSessionInfo(connectionId, message.data)
          break
          
        default:
          console.warn(`Unknown message type: ${message.type}`)
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error)
    }
  }

  private handleDisconnection(connectionId: string) {
    const connection = this.connections.get(connectionId)
    if (connection) {
      // Find and update any active chat sessions
      for (const [sessionId, session] of this.chatSessions) {
        if (session.customerConnectionId === connectionId) {
          // Customer disconnected - mark session as abandoned after timeout
          this.scheduleSessionAbandonment(sessionId)
        } else if (session.agentConnectionId === connectionId) {
          // Agent disconnected - notify customer
          this.notifyCustomerAgentDisconnected(sessionId)
        }
      }
      
      this.connections.delete(connectionId)
      console.log(`WebSocket connection closed: ${connectionId}`)
    }
  }

  // Chat Session Management
  
  async startChatSession(connectionId: string, data: StartChatData): Promise<string> {
    const sessionId = this.generateSessionId()
    const session: ChatSession = {
      id: sessionId,
      customerConnectionId: connectionId,
      customerInfo: data.customerInfo,
      status: ChatSessionStatus.WAITING,
      priority: data.priority || ChatPriority.NORMAL,
      queuePosition: await this.calculateQueuePosition(data.priority || ChatPriority.NORMAL),
      startedAt: new Date(),
      lastActivity: new Date(),
      medicalKeywords: data.medicalKeywords || [],
      department: data.department,
      clinicId: data.clinicId
    }
    
    this.chatSessions.set(sessionId, session)
    
    // Add to message queue
    this.messageQueue.set(sessionId, [])
    
    // Notify customer
    this.sendToConnection(connectionId, {
      type: 'chat_session_started',
      data: {
        sessionId,
        queuePosition: session.queuePosition,
        estimatedWaitTime: this.calculateEstimatedWaitTime(session.queuePosition)
      }
    })
    
    // Notify agents
    this.notifyAvailableAgents(session)
    
    this.emit('chatSessionStarted', session)
    
    return sessionId
  }

  private async joinChatSession(connectionId: string, data: JoinChatData): Promise<void> {
    const session = this.chatSessions.get(data.sessionId)
    if (!session) {
      this.sendError(connectionId, 'SESSION_NOT_FOUND', 'Chat session not found')
      return
    }
    
    // Check if agent is available
    if (!await this.isAgentAvailable(data.agentId, session.department)) {
      this.sendError(connectionId, 'AGENT_NOT_AVAILABLE', 'Agent is not available')
      return
    }
    
    // Assign agent to session
    session.agentConnectionId = connectionId
    session.agentId = data.agentId
    session.agentName = data.agentName
    session.status = ChatSessionStatus.ACTIVE
    session.agentJoinedAt = new Date()
    session.firstResponseAt = new Date()
    
    // Update queue position for other waiting sessions
    this.updateQueuePositions()
    
    // Notify customer
    this.sendToConnection(session.customerConnectionId, {
      type: 'agent_joined',
      data: {
        sessionId: session.id,
        agentName: session.agentName,
        agentId: session.agentId
      }
    })
    
    // Notify agent
    this.sendToConnection(connectionId, {
      type: 'chat_session_joined',
      data: {
        sessionId: session.id,
        customerInfo: session.customerInfo,
        sessionHistory: this.getSessionHistory(session.id)
      }
    })
    
    this.emit('chatSessionJoined', session)
  }

  private sendMessage(connectionId: string, data: SendMessageData): void {
    const session = this.chatSessions.get(data.sessionId)
    if (!session) {
      this.sendError(connectionId, 'SESSION_NOT_FOUND', 'Chat session not found')
      return
    }
    
    const message: ChatMessage = {
      id: this.generateMessageId(),
      sessionId: data.sessionId,
      content: data.content,
      messageType: data.messageType || MessageType.TEXT,
      senderType: connectionId === session.customerConnectionId ? MessageSenderType.CUSTOMER : MessageSenderType.AGENT,
      senderName: connectionId === session.customerConnectionId ? 
        session.customerInfo.name : 
        session.agentName || 'Agent',
      timestamp: new Date(),
      metadata: data.metadata || {}
    }
    
    // Add to session history
    session.messageHistory.push(message)
    session.lastActivity = new Date()
    session.messageCount = (session.messageCount || 0) + 1
    
    // Determine recipient
    const recipientConnectionId = connectionId === session.customerConnectionId ? 
      session.agentConnectionId : 
      session.customerConnectionId
    
    // Send to recipient if online
    if (recipientConnectionId && this.connections.has(recipientConnectionId)) {
      this.sendToConnection(recipientConnectionId, {
        type: 'new_message',
        data: message
      })
    } else {
      // Store in message queue for when recipient comes back online
      this.queueMessage(data.sessionId, {
        message,
        recipientConnectionId
      })
    }
    
    // Send delivery confirmation to sender
    this.sendToConnection(connectionId, {
      type: 'message_sent',
      data: {
        messageId: message.id,
        timestamp: message.timestamp
      }
    })
    
    this.emit('messageSent', message, session)
  }

  private updateTypingStatus(connectionId: string, data: TypingIndicatorData): void {
    const session = this.chatSessions.get(data.sessionId)
    if (!session) return
    
    const recipientConnectionId = connectionId === session.customerConnectionId ? 
      session.agentConnectionId : 
      session.customerConnectionId
    
    if (recipientConnectionId && this.connections.has(recipientConnectionId)) {
      this.sendToConnection(recipientConnectionId, {
        type: 'typing_indicator',
        data: {
          sessionId: data.sessionId,
          isTyping: data.isTyping,
          senderName: session.customerInfo.name
        }
      })
    }
  }

  private endChatSession(connectionId: string, data: EndChatData): void {
    const session = this.chatSessions.get(data.sessionId)
    if (!session) {
      this.sendError(connectionId, 'SESSION_NOT_FOUND', 'Chat session not found')
      return
    }
    
    session.status = ChatSessionStatus.COMPLETED
    session.endedAt = new Date()
    session.endedBy = data.endedBy
    session.satisfactionScore = data.satisfactionScore
    
    // Notify both participants
    this.notifySessionEnd(session)
    
    // Clean up after delay
    setTimeout(() => {
      this.cleanupSession(data.sessionId)
    }, 30000) // Keep session for 30 seconds for history
    
    this.emit('chatSessionEnded', session)
  }

  // Agent Management
  
  private async checkAgentAvailability(connectionId: string, data: AvailabilityCheckData): Promise<void> {
    const availableAgents = await this.getAvailableAgents(data.department)
    
    this.sendToConnection(connectionId, {
      type: 'agent_availability',
      data: {
        available: availableAgents.length > 0,
        agents: availableAgents
      }
    })
  }
  
  private async isAgentAvailable(agentId: string, department?: string): Promise<boolean> {
    // Check if agent is currently assigned to maximum sessions
    const activeSessions = Array.from(this.chatSessions.values())
      .filter(session => 
        session.agentId === agentId && 
        session.status === ChatSessionStatus.ACTIVE
      )
    
    const maxSessions = 3 // Each agent can handle max 3 chats
    return activeSessions.length < maxSessions
  }
  
  private async getAvailableAgents(department?: string): Promise<AgentInfo[]> {
    const agents: AgentInfo[] = []
    
    // This would typically check against a real agent database
    // For now, simulating available agents
    const simulatedAgents = [
      { id: 'agent-1', name: 'Dr. Sarah Lim', department: 'General', status: 'available' },
      { id: 'agent-2', name: 'Nurse Mary Tan', department: 'Pediatrics', status: 'available' },
      { id: 'agent-3', name: 'Dr. James Wong', department: 'General', status: 'available' }
    ]
    
    return simulatedAgents.filter(agent => 
      !department || agent.department === department
    )
  }
  
  private async notifyAvailableAgents(session: ChatSession): Promise<void> {
    const availableAgents = await this.getAvailableAgents(session.department)
    
    for (const agent of availableAgents) {
      // Find agent's WebSocket connection
      const agentConnection = Array.from(this.connections.values())
        .find(conn => conn.getMetadata('agentId') === agent.id)
      
      if (agentConnection) {
        this.sendToConnection(agentConnection.getId(), {
          type: 'new_chat_request',
          data: {
            sessionId: session.id,
            customerInfo: session.customerInfo,
            queuePosition: session.queuePosition,
            priority: session.priority,
            medicalKeywords: session.medicalKeywords
          }
        })
      }
    }
  }

  // Message Queue Management
  
  private queueMessage(sessionId: string, queueItem: MessageQueue): void {
    const queue = this.messageQueue.get(sessionId) || []
    queue.push(queueItem)
    this.messageQueue.set(sessionId, queue)
  }
  
  private processQueuedMessages(sessionId: string): void {
    const queue = this.messageQueue.get(sessionId) || []
    
    for (const item of queue) {
      if (item.recipientConnectionId && this.connections.has(item.recipientConnectionId)) {
        this.sendToConnection(item.recipientConnectionId, {
          type: 'new_message',
          data: item.message
        })
      }
    }
    
    this.messageQueue.delete(sessionId)
  }

  // Utility Methods
  
  private sendToConnection(connectionId: string, message: any): void {
    const connection = this.connections.get(connectionId)
    if (connection) {
      connection.send(message)
    }
  }
  
  private sendError(connectionId: string, code: string, message: string): void {
    this.sendToConnection(connectionId, {
      type: 'error',
      data: {
        code,
        message,
        timestamp: new Date().toISOString()
      }
    })
  }
  
  private generateConnectionId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  private generateSessionId(): string {
    return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  private async calculateQueuePosition(priority: ChatPriority): Promise<number> {
    const waitingSessions = Array.from(this.chatSessions.values())
      .filter(session => 
        session.status === ChatSessionStatus.WAITING && 
        session.priority === priority
      )
    
    return waitingSessions.length + 1
  }
  
  private calculateEstimatedWaitTime(queuePosition: number): number {
    // Simple estimation: 3 minutes per queue position
    return queuePosition * 3 * 60 * 1000 // milliseconds
  }
  
  private updateQueuePositions(): void {
    const waitingSessions = Array.from(this.chatSessions.values())
      .filter(session => session.status === ChatSessionStatus.WAITING)
      .sort((a, b) => {
        // Sort by priority first, then by start time
        const priorityOrder = { 
          [ChatPriority.LOW]: 1, 
          [ChatPriority.NORMAL]: 2, 
          [ChatPriority.HIGH]: 3, 
          [ChatPriority.URGENT]: 4, 
          [ChatPriority.CRITICAL]: 5,
          [ChatPriority.VIP]: 6,
          [ChatPriority.EMERGENCY]: 7
        }
        
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
        if (priorityDiff !== 0) return priorityDiff
        
        return a.startedAt.getTime() - b.startedAt.getTime()
      })
    
    waitingSessions.forEach((session, index) => {
      session.queuePosition = index + 1
    })
  }
  
  private getSessionHistory(sessionId: string): ChatMessage[] {
    const session = this.chatSessions.get(sessionId)
    return session?.messageHistory || []
  }
  
  private scheduleSessionAbandonment(sessionId: string): void {
    setTimeout(() => {
      const session = this.chatSessions.get(sessionId)
      if (session && session.status === ChatSessionStatus.WAITING) {
        session.status = ChatSessionStatus.ABANDONED
        this.sendToConnection(session.customerConnectionId, {
          type: 'session_abandoned',
          data: { sessionId }
        })
      }
    }, 60000) // 1 minute timeout
  }
  
  private notifyCustomerAgentDisconnected(sessionId: string): void {
    const session = this.chatSessions.get(sessionId)
    if (session) {
      this.sendToConnection(session.customerConnectionId, {
        type: 'agent_disconnected',
        data: { sessionId }
      })
    }
  }
  
  private notifySessionEnd(session: ChatSession): void {
    // Notify customer
    if (session.customerConnectionId && this.connections.has(session.customerConnectionId)) {
      this.sendToConnection(session.customerConnectionId, {
        type: 'chat_session_ended',
        data: {
          sessionId: session.id,
          endedBy: session.endedBy,
          satisfactionScore: session.satisfactionScore
        }
      })
    }
    
    // Notify agent
    if (session.agentConnectionId && this.connections.has(session.agentConnectionId)) {
      this.sendToConnection(session.agentConnectionId, {
        type: 'chat_session_ended',
        data: {
          sessionId: session.id,
          endedBy: session.endedBy,
          satisfactionScore: session.satisfactionScore
        }
      })
    }
  }
  
  private cleanupSession(sessionId: string): void {
    this.chatSessions.delete(sessionId)
    this.messageQueue.delete(sessionId)
  }
  
  // Public Methods
  
  public getConnectionStats(): ConnectionStats {
    return {
      totalConnections: this.connections.size,
      activeChatSessions: Array.from(this.chatSessions.values())
        .filter(s => s.status === ChatSessionStatus.ACTIVE).length,
      waitingChatSessions: Array.from(this.chatSessions.values())
        .filter(s => s.status === ChatSessionStatus.WAITING).length,
      totalMessagesQueued: Array.from(this.messageQueue.values())
        .reduce((total, queue) => total + queue.length, 0)
    }
  }
  
  public async shutdown(): Promise<void> {
    if (this.isShuttingDown) return
    
    this.isShuttingDown = true
    console.log('Shutting down WebSocket server...')
    
    // Notify all connections
    for (const [connectionId, connection] of this.connections) {
      connection.send({
        type: 'server_shutdown',
        data: { message: 'Server is shutting down' }
      })
      connection.close()
    }
    
    // Clean up
    this.connections.clear()
    this.chatSessions.clear()
    this.messageQueue.clear()
    
    // Close WebSocket server
    this.wss.close()
    
    console.log('WebSocket server shutdown complete')
  }
}

// Supporting Classes and Interfaces

class WebSocketConnection {
  private ws: WebSocket
  private id: string
  private request: any
  private metadata: Map<string, any> = new Map()
  private eventEmitter: EventEmitter

  constructor(ws: WebSocket, id: string, request: any) {
    this.ws = ws
    this.id = id
    this.request = request
    this.eventEmitter = new EventEmitter()
    
    this.setupEventHandlers()
  }
  
  private setupEventHandlers() {
    this.ws.on('message', (data: Buffer) => {
      this.eventEmitter.emit('message', data)
    })
    
    this.ws.on('close', () => {
      this.eventEmitter.emit('close')
    })
    
    this.ws.on('error', (error: Error) => {
      this.eventEmitter.emit('error', error)
    })
  }
  
  send(message: any): void {
    try {
      this.ws.send(JSON.stringify(message))
    } catch (error) {
      console.error(`Error sending message to connection ${this.id}:`, error)
    }
  }
  
  close(): void {
    this.ws.close()
  }
  
  on(event: string, callback: Function): void {
    this.eventEmitter.on(event, callback)
  }
  
  getId(): string {
    return this.id
  }
  
  getMetadata(key: string): any {
    return this.metadata.get(key)
  }
  
  setMetadata(key: string, value: any): void {
    this.metadata.set(key, value)
  }
}

interface ChatSession {
  id: string
  customerConnectionId: string
  customerInfo: CustomerInfo
  agentConnectionId?: string
  agentId?: string
  agentName?: string
  status: ChatSessionStatus
  priority: ChatPriority
  queuePosition?: number
  startedAt: Date
  firstResponseAt?: Date
  agentJoinedAt?: Date
  lastActivity: Date
  endedAt?: Date
  endedBy?: string
  satisfactionScore?: number
  messageCount?: number
  messageHistory: ChatMessage[]
  medicalKeywords: string[]
  department?: string
  clinicId?: string
}

interface ChatMessage {
  id: string
  sessionId: string
  content: string
  messageType: MessageType
  senderType: MessageSenderType
  senderName: string
  timestamp: Date
  metadata?: Record<string, any>
}

interface MessageQueue {
  message: ChatMessage
  recipientConnectionId?: string
}

interface StartChatData {
  customerInfo: CustomerInfo
  priority?: ChatPriority
  medicalKeywords?: string[]
  department?: string
  clinicId?: string
}

interface JoinChatData {
  sessionId: string
  agentId: string
  agentName: string
}

interface SendMessageData {
  sessionId: string
  content: string
  messageType?: MessageType
  metadata?: Record<string, any>
}

interface TypingIndicatorData {
  sessionId: string
  isTyping: boolean
}

interface EndChatData {
  sessionId: string
  endedBy: 'customer' | 'agent' | 'system'
  satisfactionScore?: number
}

interface AvailabilityCheckData {
  department?: string
  agentId?: string
}

interface CustomerInfo {
  name: string
  email?: string
  phone?: string
  deviceType?: string
  browserType?: string
  location?: string
}

interface AgentInfo {
  id: string
  name: string
  department: string
  status: 'available' | 'busy' | 'away' | 'offline'
  currentSessions?: number
}

interface ConnectionStats {
  totalConnections: number
  activeChatSessions: number
  waitingChatSessions: number
  totalMessagesQueued: number
}

// Export singleton instance
export const webSocketManager = new WebSocketManager()
