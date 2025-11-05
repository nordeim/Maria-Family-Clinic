// WebSocket Server for Real-time Analytics
// Sub-Phase 10.1: Advanced Analytics & Tracking System Architecture

import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';

interface AnalyticsWebSocketMessage {
  type: 'subscribe' | 'unsubscribe' | 'data_update' | 'alert' | 'ping';
  payload: {
    clinicId?: string;
    metrics?: string[];
    data?: any;
    alertId?: string;
    severity?: 'critical' | 'high' | 'medium' | 'low';
  };
}

interface ClientSubscription {
  client: WebSocket;
  clinicId?: string;
  metrics: Set<string>;
  subscribedAt: Date;
}

class AnalyticsWebSocketServer {
  private wss: WebSocketServer;
  private clients: Map<string, ClientSubscription> = new Map();
  private subscriptions: Map<string, Set<string>> = new Map(); // clinicId -> metrics
  private alertCallbacks: Map<string, () => void> = new Map();

  constructor(server: any) {
    this.wss = new WebSocketServer({ server });
    this.setupWebSocketHandlers();
    this.startPeriodicUpdates();
  }

  private setupWebSocketHandlers() {
    this.wss.on('connection', (ws: WebSocket, request: IncomingMessage) => {
      const clientId = this.generateClientId();
      console.log(`Client connected: ${clientId}`);

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connected',
        payload: { clientId, timestamp: new Date() }
      }));

      ws.on('message', (data: Buffer) => {
        try {
          const message: AnalyticsWebSocketMessage = JSON.parse(data.toString());
          this.handleClientMessage(clientId, ws, message);
        } catch (error) {
          console.error('Invalid WebSocket message:', error);
          ws.send(JSON.stringify({
            type: 'error',
            payload: { message: 'Invalid message format' }
          }));
        }
      });

      ws.on('close', () => {
        console.log(`Client disconnected: ${clientId}`);
        this.removeClient(clientId);
      });

      ws.on('error', (error) => {
        console.error(`WebSocket error for client ${clientId}:`, error);
        this.removeClient(clientId);
      });

      // Store client subscription
      this.clients.set(clientId, {
        client: ws,
        metrics: new Set(),
        subscribedAt: new Date(),
      });
    });
  }

  private handleClientMessage(clientId: string, ws: WebSocket, message: AnalyticsWebSocketMessage) {
    const subscription = this.clients.get(clientId);
    if (!subscription) return;

    switch (message.type) {
      case 'subscribe':
        this.subscribeClient(clientId, message.payload);
        break;
      case 'unsubscribe':
        this.unsubscribeClient(clientId, message.payload);
        break;
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong', payload: { timestamp: new Date() } }));
        break;
      default:
        ws.send(JSON.stringify({
          type: 'error',
          payload: { message: 'Unknown message type' }
        }));
    }
  }

  private subscribeClient(clientId: string, payload: AnalyticsWebSocketMessage['payload']) {
    const subscription = this.clients.get(clientId);
    if (!subscription) return;

    const { clinicId, metrics } = payload;
    
    if (clinicId) {
      subscription.clinicId = clinicId;
      
      if (!this.subscriptions.has(clinicId)) {
        this.subscriptions.set(clinicId, new Set());
      }
    }

    if (metrics) {
      metrics.forEach(metric => subscription.metrics.add(metric));
      
      if (subscription.clinicId) {
        const clinicSubs = this.subscriptions.get(subscription.clinicId);
        metrics.forEach(metric => clinicSubs?.add(metric));
      }
    }

    // Send initial data
    this.sendCurrentMetrics(clientId);
    
    console.log(`Client ${clientId} subscribed to metrics:`, Array.from(subscription.metrics));
  }

  private unsubscribeClient(clientId: string, payload: AnalyticsWebSocketMessage['payload']) {
    const subscription = this.clients.get(clientId);
    if (!subscription) return;

    const { metrics } = payload;
    
    if (metrics) {
      metrics.forEach(metric => subscription.metrics.delete(metric));
      
      if (subscription.clinicId) {
        const clinicSubs = this.subscriptions.get(subscription.clinicId);
        metrics.forEach(metric => clinicSubs?.delete(metric));
      }
    }

    console.log(`Client ${clientId} unsubscribed from metrics:`, metrics);
  }

  private removeClient(clientId: string) {
    const subscription = this.clients.get(clientId);
    if (subscription && subscription.clinicId) {
      const clinicSubs = this.subscriptions.get(subscription.clinicId);
      subscription.metrics.forEach(metric => clinicSubs?.delete(metric));
      
      if (clinicSubs && clinicSubs.size === 0) {
        this.subscriptions.delete(subscription.clinicId);
      }
    }
    
    this.clients.delete(clientId);
  }

  private sendCurrentMetrics(clientId: string) {
    const subscription = this.clients.get(clientId);
    if (!subscription || !subscription.clinicId) return;

    // Simulate real-time metrics (in production, this would fetch from analytics service)
    const mockMetrics = {
      activeUsers: Math.floor(Math.random() * 100) + 50,
      currentLoadTime: Math.floor(Math.random() * 500) + 200,
      conversionRate: Math.random() * 0.05 + 0.1,
      errorRate: Math.random() * 0.02,
      timestamp: new Date(),
    };

    subscription.client.send(JSON.stringify({
      type: 'data_update',
      payload: {
        clinicId: subscription.clinicId,
        metrics: Array.from(subscription.metrics),
        data: mockMetrics,
      }
    }));
  }

  // Broadcast updates to all subscribed clients
  public broadcastUpdate(clinicId: string, metricType: string, data: any) {
    const clinicSubs = this.subscriptions.get(clinicId);
    if (!clinicSubs || !clinicSubs.has(metricType)) return;

    const message = JSON.stringify({
      type: 'data_update',
      payload: {
        clinicId,
        metrics: [metricType],
        data,
        timestamp: new Date(),
      }
    });

    this.clients.forEach((subscription, clientId) => {
      if (subscription.clinicId === clinicId && subscription.metrics.has(metricType)) {
        try {
          subscription.client.send(message);
        } catch (error) {
          console.error(`Failed to send update to client ${clientId}:`, error);
          this.removeClient(clientId);
        }
      }
    });
  }

  // Send alerts to relevant clients
  public sendAlert(clinicId: string | undefined, alert: {
    id: string;
    type: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    message: string;
    timestamp: Date;
  }) {
    const message = JSON.stringify({
      type: 'alert',
      payload: {
        ...alert,
        clinicId,
      }
    });

    this.clients.forEach((subscription, clientId) => {
      if (!clinicId || subscription.clinicId === clinicId) {
        try {
          subscription.client.send(message);
        } catch (error) {
          console.error(`Failed to send alert to client ${clientId}:`, error);
          this.removeClient(clientId);
        }
      }
    });
  }

  private startPeriodicUpdates() {
    // Send periodic updates every 30 seconds
    setInterval(() => {
      this.subscriptions.forEach((metrics, clinicId) => {
        // Simulate metrics update
        const updateData = {
          timestamp: new Date(),
          activeUsers: Math.floor(Math.random() * 50) + 25,
          pageViews: Math.floor(Math.random() * 1000) + 500,
          conversions: Math.floor(Math.random() * 50) + 10,
        };

        metrics.forEach(metric => {
          this.broadcastUpdate(clinicId, metric, {
            metricType: metric,
            ...updateData,
          });
        });
      });
    }, 30000);
  }

  // Health check for clients
  public healthCheck() {
    const now = Date.now();
    const timeout = 60000; // 60 seconds

    this.clients.forEach((subscription, clientId) => {
      const timeSinceConnect = now - subscription.subscribedAt.getTime();
      if (timeSinceConnect > timeout * 2) {
        console.log(`Removing stale client: ${clientId}`);
        this.removeClient(clientId);
      }
    });
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get server statistics
  public getStats() {
    const clientStats = {
      totalClients: this.clients.size,
      subscriptionsByClinic: Object.fromEntries(
        Array.from(this.subscriptions.entries()).map(([clinicId, metrics]) => [
          clinicId, 
          { metrics: Array.from(metrics), clientCount: Array.from(this.clients.values()).filter(s => s.clinicId === clinicId).length }
        ])
      ),
    };

    return clientStats;
  }
}

export default AnalyticsWebSocketServer;

// Singleton instance
let analyticsWebSocketServer: AnalyticsWebSocketServer | null = null;

export function initializeAnalyticsWebSocketServer(server: any): AnalyticsWebSocketServer {
  if (!analyticsWebSocketServer) {
    analyticsWebSocketServer = new AnalyticsWebSocketServer(server);
    
    // Start health check interval
    setInterval(() => {
      analyticsWebSocketServer?.healthCheck();
    }, 30000);
  }
  
  return analyticsWebSocketServer;
}

export function getAnalyticsWebSocketServer(): AnalyticsWebSocketServer | null {
  return analyticsWebSocketServer;
}