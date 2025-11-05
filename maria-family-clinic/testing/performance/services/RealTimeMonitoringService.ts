/**
 * Real-Time Monitoring Service - WebSocket-based real-time monitoring
 * Provides live performance metrics and event tracking during testing
 */

export interface MonitoringEvent {
  type: string;
  timestamp: number;
  data: any;
  severity?: 'info' | 'warning' | 'error' | 'critical';
  source?: string;
}

export interface RealTimeMetrics {
  timestamp: number;
  activeConnections: number;
  requestsPerSecond: number;
  averageResponseTime: number;
  errorRate: number;
  cpuUsage: number;
  memoryUsage: number;
  activeTests: number;
  testProgress: Record<string, number>; // testName -> progress percentage
}

export interface TestProgressEvent extends MonitoringEvent {
  type: 'test_progress';
  data: {
    testName: string;
    progress: number;
    stage: string;
    estimatedCompletion?: number;
  };
}

export interface MetricUpdateEvent extends MonitoringEvent {
  type: 'metric_update';
  data: {
    metricName: string;
    value: number;
    unit: string;
    previousValue?: number;
  };
}

export interface AlertEvent extends MonitoringEvent {
  type: 'alert';
  data: {
    level: 'info' | 'warning' | 'error' | 'critical';
    title: string;
    message: string;
    source?: string;
    actionRequired?: boolean;
  };
}

export type MonitoringEventHandler = (event: MonitoringEvent) => void;

export class RealTimeMonitoringService {
  private ws: WebSocket | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;
  private eventHandlers: Map<string, MonitoringEventHandler[]> = new Map();
  private isConnected: boolean = false;
  private isConnecting: boolean = false;
  private pingInterval: NodeJS.Timeout | null = null;
  private lastPong: number = Date.now();
  private metricsBuffer: RealTimeMetrics[] = [];
  private maxBufferSize: number = 100;
  private connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error' = 'disconnected';

  constructor(private wsUrl: string, private options: {
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
    pingInterval?: number;
    bufferSize?: number;
  } = {}) {
    this.reconnectDelay = options.reconnectInterval || 1000;
    this.maxReconnectAttempts = options.maxReconnectAttempts || 5;
    this.maxBufferSize = options.bufferSize || 100;
  }

  /**
   * Start real-time monitoring connection
   */
  async start(): Promise<void> {
    if (this.isConnected || this.isConnecting) {
      return;
    }

    this.connectionStatus = 'connecting';
    await this.connect();
  }

  /**
   * Stop real-time monitoring
   */
  stop(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.isConnected = false;
    this.connectionStatus = 'disconnected';
    this.reconnectAttempts = 0;
  }

  /**
   * Track a monitoring event
   */
  trackEvent(eventType: string, eventData: any): void {
    const event: MonitoringEvent = {
      type: eventType,
      timestamp: Date.now(),
      data: eventData,
      severity: this.determineSeverity(eventType, eventData),
      source: 'performance_testing'
    };

    // Send to WebSocket if connected
    if (this.isConnected && this.ws) {
      this.ws.send(JSON.stringify({
        type: 'track_event',
        event
      }));
    }

    // Trigger local event handlers
    this.triggerEventHandlers(eventType, event);
  }

  /**
   * Track performance metric
   */
  trackMetric(metricName: string, value: number, unit: string = ''): void {
    const event: MetricUpdateEvent = {
      type: 'metric_update',
      timestamp: Date.now(),
      data: {
        metricName,
        value,
        unit,
        previousValue: this.getLastMetricValue(metricName)
      }
    };

    this.trackEvent('metric_update', event.data);
  }

  /**
   * Track test progress
   */
  trackTestProgress(testName: string, progress: number, stage: string, estimatedCompletion?: number): void {
    const event: TestProgressEvent = {
      type: 'test_progress',
      timestamp: Date.now(),
      data: {
        testName,
        progress,
        stage,
        estimatedCompletion
      }
    };

    this.trackEvent('test_progress', event.data);
  }

  /**
   * Send alert
   */
  sendAlert(level: 'info' | 'warning' | 'error' | 'critical', title: string, message: string, source?: string): void {
    const event: AlertEvent = {
      type: 'alert',
      timestamp: Date.now(),
      data: {
        level,
        title,
        message,
        source: source || 'performance_testing',
        actionRequired: level === 'error' || level === 'critical'
      }
    };

    this.trackEvent('alert', event.data);
  }

  /**
   * Update real-time metrics
   */
  updateMetrics(metrics: Omit<RealTimeMetrics, 'timestamp'>): void {
    const realTimeMetrics: RealTimeMetrics = {
      ...metrics,
      timestamp: Date.now()
    };

    // Add to buffer
    this.metricsBuffer.push(realTimeMetrics);
    if (this.metricsBuffer.length > this.maxBufferSize) {
      this.metricsBuffer.shift();
    }

    // Send to WebSocket
    if (this.isConnected && this.ws) {
      this.ws.send(JSON.stringify({
        type: 'metrics_update',
        metrics: realTimeMetrics
      }));
    }

    this.triggerEventHandlers('metrics_update', realTimeMetrics);
  }

  /**
   * Get current metrics
   */
  getCurrentMetrics(): RealTimeMetrics | null {
    return this.metricsBuffer.length > 0 ? this.metricsBuffer[this.metricsBuffer.length - 1] : null;
  }

  /**
   * Get metrics history
   */
  getMetricsHistory(count: number = 50): RealTimeMetrics[] {
    return this.metricsBuffer.slice(-count);
  }

  /**
   * Subscribe to event type
   */
  subscribe(eventType: string, handler: MonitoringEventHandler): () => void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }

    this.eventHandlers.get(eventType)!.push(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.eventHandlers.get(eventType);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): {
    connected: boolean;
    connecting: boolean;
    status: string;
    reconnectAttempts: number;
  } {
    return {
      connected: this.isConnected,
      connecting: this.isConnecting,
      status: this.connectionStatus,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  /**
   * Enable/disable automatic reconnection
   */
  setAutoReconnect(enabled: boolean): void {
    if (!enabled) {
      this.maxReconnectAttempts = 0;
    } else {
      this.maxReconnectAttempts = 5;
    }
  }

  // Private methods

  private async connect(): Promise<void> {
    if (this.isConnecting) return;

    this.isConnecting = true;

    try {
      this.ws = new WebSocket(this.wsUrl);

      this.ws.onopen = () => {
        console.log('Real-time monitoring connected');
        this.isConnected = true;
        this.isConnecting = false;
        this.connectionStatus = 'connected';
        this.reconnectAttempts = 0;

        // Start ping interval
        this.startPingInterval();

        // Send initial status
        this.trackEvent('connection_established', {
          timestamp: Date.now(),
          url: this.wsUrl
        });
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      this.ws.onclose = (event) => {
        console.log('Real-time monitoring disconnected:', event.code, event.reason);
        this.isConnected = false;
        this.isConnecting = false;
        this.connectionStatus = 'disconnected';

        if (this.pingInterval) {
          clearInterval(this.pingInterval);
          this.pingInterval = null;
        }

        // Attempt reconnection
        this.attemptReconnection();
      };

      this.ws.onerror = (error) => {
        console.error('Real-time monitoring error:', error);
        this.connectionStatus = 'error';
        this.trackEvent('connection_error', { error: error.toString() });
      };

    } catch (error) {
      console.error('Failed to connect to real-time monitoring:', error);
      this.isConnecting = false;
      this.connectionStatus = 'error';
      this.attemptReconnection();
    }
  }

  private handleMessage(data: string): void {
    try {
      const message = JSON.parse(data);

      switch (message.type) {
        case 'pong':
          this.lastPong = Date.now();
          break;

        case 'metrics_update':
          this.triggerEventHandlers('metrics_update', message.data);
          break;

        case 'alert':
          this.triggerEventHandlers('alert', message.data);
          break;

        case 'test_progress':
          this.triggerEventHandlers('test_progress', message.data);
          break;

        case 'ping':
          if (this.ws && this.isConnected) {
            this.ws.send(JSON.stringify({ type: 'pong' }));
          }
          break;

        default:
          this.triggerEventHandlers(message.type, message.data);
      }

    } catch (error) {
      console.error('Failed to parse monitoring message:', error);
    }
  }

  private attemptReconnection(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached for real-time monitoring');
      this.trackEvent('connection_failed', {
        attempts: this.reconnectAttempts,
        maxAttempts: this.maxReconnectAttempts
      });
      return;
    }

    this.reconnectAttempts++;
    
    console.log(`Attempting to reconnect to real-time monitoring (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      this.connect();
    }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)); // Exponential backoff
  }

  private startPingInterval(): void {
    this.lastPong = Date.now();
    
    this.pingInterval = setInterval(() => {
      if (this.ws && this.isConnected) {
        // Check if we haven't received a pong recently
        if (Date.now() - this.lastPong > 30000) { // 30 seconds
          console.warn('No pong received from monitoring server, closing connection');
          this.ws.close();
          return;
        }

        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 10000); // Ping every 10 seconds
  }

  private triggerEventHandlers(eventType: string, event: any): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error(`Error in event handler for ${eventType}:`, error);
        }
      });
    }

    // Also trigger general event handler
    const generalHandlers = this.eventHandlers.get('*');
    if (generalHandlers) {
      generalHandlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error('Error in general event handler:', error);
        }
      });
    }
  }

  private determineSeverity(eventType: string, eventData: any): 'info' | 'warning' | 'error' | 'critical' {
    // Determine severity based on event type and data
    if (eventType.includes('error') || eventType.includes('failed')) {
      return 'error';
    }
    
    if (eventType.includes('alert') || eventType.includes('warning')) {
      return 'warning';
    }
    
    if (eventType.includes('critical') || eventType.includes('emergency')) {
      return 'critical';
    }
    
    return 'info';
  }

  private getLastMetricValue(metricName: string): number | undefined {
    for (let i = this.metricsBuffer.length - 1; i >= 0; i--) {
      // This is simplified - in a real implementation, we'd store individual metric history
      // For now, we just return undefined
      return undefined;
    }
    return undefined;
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    this.stop();
    this.eventHandlers.clear();
    this.metricsBuffer = [];
  }
}