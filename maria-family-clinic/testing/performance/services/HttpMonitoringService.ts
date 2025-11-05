/**
 * HTTP Monitoring Service - Integrates with Sub-Phase 10.6 monitoring infrastructure
 * Provides HTTP-based monitoring and metrics collection for performance testing
 */

export interface MonitoringMetrics {
  timestamp: number;
  responseTime: number;
  statusCode: number;
  requestSize: number;
  responseSize: number;
  userAgent?: string;
  endpoint: string;
  method: string;
}

export interface SystemMetrics {
  timestamp: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkIO: {
    bytesIn: number;
    bytesOut: number;
  };
  activeConnections: number;
  requestsPerSecond: number;
  errorRate: number;
}

export interface PerformanceMetrics {
  timestamp: number;
  lighthouseScores: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
  coreWebVitals: {
    lcp: number; // Largest Contentful Paint
    fid: number; // First Input Delay  
    cls: number; // Cumulative Layout Shift
  };
  bundleAnalysis: {
    totalSize: number;
    gzippedSize: number;
    jsSize: number;
    cssSize: number;
    imageSize: number;
    chunkCount: number;
  };
}

export class HttpMonitoringService {
  private baseUrl: string;
  private apiKey: string;
  private monitoringEnabled: boolean = true;
  private metricsBuffer: (MonitoringMetrics | SystemMetrics | PerformanceMetrics)[] = [];
  private bufferSize: number = 1000;
  private flushInterval: number = 30000; // 30 seconds

  constructor(baseUrl: string = 'http://localhost:3000/monitoring', apiKey: string = '') {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.initializeMonitoring();
  }

  /**
   * Initialize monitoring connection and start periodic flush
   */
  private async initializeMonitoring(): Promise<void> {
    try {
      // Test connection to monitoring infrastructure
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.apiKey ? `Bearer ${this.apiKey}` : ''
        }
      });

      if (response.ok) {
        console.log('Monitoring infrastructure connected successfully');
        this.startPeriodicFlush();
      } else {
        console.warn('Monitoring infrastructure connection failed, running in offline mode');
        this.monitoringEnabled = false;
      }
    } catch (error) {
      console.warn('Failed to connect to monitoring infrastructure:', error);
      this.monitoringEnabled = false;
    }
  }

  /**
   * Record HTTP request metrics
   */
  async recordRequestMetrics(metrics: MonitoringMetrics): Promise<void> {
    if (!this.monitoringEnabled) return;

    this.metricsBuffer.push(metrics);
    
    // Immediate flush for critical metrics
    if (metrics.statusCode >= 500 || metrics.responseTime > 5000) {
      await this.flushMetrics();
    }
  }

  /**
   * Record system performance metrics
   */
  async recordSystemMetrics(metrics: SystemMetrics): Promise<void> {
    if (!this.monitoringEnabled) return;

    this.metricsBuffer.push(metrics);
  }

  /**
   * Record Lighthouse performance metrics
   */
  async recordPerformanceMetrics(metrics: PerformanceMetrics): Promise<void> {
    if (!this.monitoringEnabled) return;

    this.metricsBuffer.push(metrics);
  }

  /**
   * Start monitoring a specific endpoint
   */
  async startEndpointMonitoring(endpoint: string, interval: number = 60000): Promise<() => void> {
    const monitor = async () => {
      const startTime = Date.now();
      
      try {
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'User-Agent': 'PerformanceTestingBot/1.0'
          }
        });

        const responseTime = Date.now() - startTime;
        
        await this.recordRequestMetrics({
          timestamp: Date.now(),
          responseTime,
          statusCode: response.status,
          requestSize: 0, // Would need to calculate from request
          responseSize: parseInt(response.headers.get('content-length') || '0'),
          endpoint,
          method: 'GET'
        });

      } catch (error) {
        await this.recordRequestMetrics({
          timestamp: Date.now(),
          responseTime: Date.now() - startTime,
          statusCode: 0,
          requestSize: 0,
          responseSize: 0,
          endpoint,
          method: 'GET'
        });
      }
    };

    // Start monitoring
    const intervalId = setInterval(monitor, interval);
    
    // Run initial check
    monitor();

    // Return cleanup function
    return () => {
      clearInterval(intervalId);
    };
  }

  /**
   * Monitor application health
   */
  async checkApplicationHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    responseTime: number;
    statusCode: number;
    errors: string[];
  }> {
    const startTime = Date.now();
    const errors: string[] = [];
    let maxResponseTime = 0;

    try {
      // Check multiple health endpoints
      const healthChecks = [
        { name: 'Main App', url: `${this.baseUrl}/../health` },
        { name: 'Database', url: `${this.baseUrl}/../health/db` },
        { name: 'Cache', url: `${this.baseUrl}/../health/cache` }
      ];

      for (const check of healthChecks) {
        try {
          const response = await fetch(check.url, {
            method: 'GET',
            headers: {
              'Authorization': this.apiKey ? `Bearer ${this.apiKey}` : ''
            }
          });

          const responseTime = Date.now() - startTime;
          maxResponseTime = Math.max(maxResponseTime, responseTime);

          if (!response.ok) {
            errors.push(`${check.name}: HTTP ${response.status}`);
          }
        } catch (error) {
          errors.push(`${check.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      const overallStatus = errors.length === 0 ? 'healthy' : 
                           errors.length <= 2 ? 'degraded' : 'unhealthy';

      return {
        status: overallStatus,
        responseTime: maxResponseTime,
        statusCode: errors.length === 0 ? 200 : 503,
        errors
      };

    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        statusCode: 503,
        errors: [error instanceof Error ? error.message : 'Health check failed']
      };
    }
  }

  /**
   * Get real-time metrics
   */
  async getRealTimeMetrics(timeRange: { start: number; end: number }): Promise<{
    requests: MonitoringMetrics[];
    system: SystemMetrics[];
    performance: PerformanceMetrics[];
  }> {
    if (!this.monitoringEnabled) {
      return { requests: [], system: [], performance: [] };
    }

    try {
      const response = await fetch(`${this.baseUrl}/metrics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.apiKey ? `Bearer ${this.apiKey}` : ''
        },
        body: JSON.stringify({
          start: timeRange.start,
          end: timeRange.end
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to get metrics: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        requests: data.requests || [],
        system: data.system || [],
        performance: data.performance || []
      };

    } catch (error) {
      console.error('Failed to get real-time metrics:', error);
      return { requests: [], system: [], performance: [] };
    }
  }

  /**
   * Create custom monitoring dashboard
   */
  async createDashboard(name: string, config: {
    widgets: Array<{
      type: 'chart' | 'metric' | 'table';
      title: string;
      query: string;
      refreshInterval: number;
    }>;
    filters: Record<string, any>;
  }): Promise<string> {
    if (!this.monitoringEnabled) {
      throw new Error('Monitoring infrastructure not available');
    }

    try {
      const response = await fetch(`${this.baseUrl}/dashboards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.apiKey ? `Bearer ${this.apiKey}` : ''
        },
        body: JSON.stringify({
          name,
          config,
          createdAt: Date.now()
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create dashboard: ${response.statusText}`);
      }

      const dashboard = await response.json();
      return dashboard.id;

    } catch (error) {
      console.error('Failed to create dashboard:', error);
      throw error;
    }
  }

  /**
   * Export metrics for analysis
   */
  async exportMetrics(format: 'json' | 'csv' | 'prometheus', timeRange: {
    start: number;
    end: number;
  }): Promise<string> {
    if (!this.monitoringEnabled) {
      throw new Error('Monitoring infrastructure not available');
    }

    try {
      const response = await fetch(`${this.baseUrl}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.apiKey ? `Bearer ${this.apiKey}` : ''
        },
        body: JSON.stringify({
          format,
          start: timeRange.start,
          end: timeRange.end,
          includeSystemMetrics: true,
          includePerformanceMetrics: true
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to export metrics: ${response.statusText}`);
      }

      return await response.text();

    } catch (error) {
      console.error('Failed to export metrics:', error);
      throw error;
    }
  }

  /**
   * Set up alerting rules
   */
  async setupAlerting(rules: Array<{
    name: string;
    condition: string;
    threshold: number;
    duration: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    channels: string[];
  }>): Promise<void> {
    if (!this.monitoringEnabled) {
      throw new Error('Monitoring infrastructure not available');
    }

    try {
      const response = await fetch(`${this.baseUrl}/alerts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.apiKey ? `Bearer ${this.apiKey}` : ''
        },
        body: JSON.stringify({
          rules,
          createdAt: Date.now()
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to setup alerting: ${response.statusText}`);
      }

    } catch (error) {
      console.error('Failed to setup alerting:', error);
      throw error;
    }
  }

  /**
   * Get monitoring status
   */
  getMonitoringStatus(): {
    enabled: boolean;
    connected: boolean;
    bufferedMetrics: number;
    lastFlush: number;
  } {
    return {
      enabled: this.monitoringEnabled,
      connected: this.monitoringEnabled, // Simplified - would check actual connection
      bufferedMetrics: this.metricsBuffer.length,
      lastFlush: Date.now() // Would track actual last flush time
    };
  }

  /**
   * Enable/disable monitoring
   */
  setMonitoringEnabled(enabled: boolean): void {
    this.monitoringEnabled = enabled;
    if (enabled && this.metricsBuffer.length > 0) {
      this.flushMetrics();
    }
  }

  /**
   * Start periodic metric flushing
   */
  private startPeriodicFlush(): void {
    setInterval(() => {
      if (this.metricsBuffer.length > 0) {
        this.flushMetrics();
      }
    }, this.flushInterval);
  }

  /**
   * Flush metrics to monitoring infrastructure
   */
  private async flushMetrics(): Promise<void> {
    if (!this.monitoringEnabled || this.metricsBuffer.length === 0) {
      return;
    }

    try {
      const metrics = [...this.metricsBuffer];
      this.metricsBuffer = [];

      const response = await fetch(`${this.baseUrl}/metrics/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.apiKey ? `Bearer ${this.apiKey}` : ''
        },
        body: JSON.stringify({
          metrics,
          timestamp: Date.now()
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to flush metrics: ${response.statusText}`);
      }

    } catch (error) {
      console.error('Failed to flush metrics:', error);
      // Re-add metrics to buffer for retry
      this.metricsBuffer.unshift(...this.metricsBuffer);
    }
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    this.flushMetrics();
  }
}