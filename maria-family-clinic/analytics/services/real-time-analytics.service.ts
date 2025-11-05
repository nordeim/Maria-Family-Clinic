// Real-Time Analytics Service with WebSocket Support
// Sub-Phase 10.1: Advanced Analytics & Tracking System Architecture

import { 
  RealTimeMetrics,
  WebSocketMessage,
  Alert,
  DashboardType,
  DashboardWidget,
  HealthcareAnalyticsEvent
} from '../types/analytics.types';
import { realTimeMetricsSchema } from '../schemas/analytics.schema';

export interface RealTimeDashboardState {
  id: string;
  type: DashboardType;
  isActive: boolean;
  widgets: DashboardWidget[];
  lastUpdated: Date;
  subscribers: Set<string>;
  updateInterval: NodeJS.Timeout | null;
}

export interface PerformanceThresholds {
  loadTime: { warning: number; critical: number };
  errorRate: { warning: number; critical: number };
  conversionRate: { warning: number; critical: number };
  activeUsers: { warning: number; critical: number };
  responseTime: { warning: number; critical: number };
}

export class RealTimeAnalyticsService {
  private static instance: RealTimeAnalyticsService;
  private dashboards: Map<string, RealTimeDashboardState> = new Map();
  private activeConnections: Map<string, WebSocket> = new Map();
  private metricsCache: Map<string, RealTimeMetrics> = new Map();
  private alertHistory: Alert[] = [];
  private performanceThresholds: PerformanceThresholds = {
    loadTime: { warning: 2000, critical: 5000 }, // milliseconds
    errorRate: { warning: 0.05, critical: 0.10 }, // 5% and 10%
    conversionRate: { warning: 0.10, critical: 0.05 }, // 10% and 5%
    activeUsers: { warning: 500, critical: 1000 },
    responseTime: { warning: 1000, critical: 3000 }, // milliseconds
  };

  private constructor() {
    this.initializeDashboards();
    this.startMetricsCollection();
  }

  static getInstance(): RealTimeAnalyticsService {
    if (!RealTimeAnalyticsService.instance) {
      RealTimeAnalyticsService.instance = new RealTimeAnalyticsService();
    }
    return RealTimeAnalyticsService.instance;
  }

  // Initialize default dashboards
  private initializeDashboards(): void {
    const defaultDashboards = [
      {
        id: 'executive-dashboard',
        type: DashboardType.EXECUTIVE,
        isActive: true,
        widgets: this.getExecutiveWidgets(),
        updateInterval: null as NodeJS.Timeout | null,
        subscribers: new Set<string>(),
        lastUpdated: new Date(),
      },
      {
        id: 'operational-dashboard',
        type: DashboardType.OPERATIONAL,
        isActive: true,
        widgets: this.getOperationalWidgets(),
        updateInterval: null as NodeJS.Timeout | null,
        subscribers: new Set<string>(),
        lastUpdated: new Date(),
      },
      {
        id: 'healthcare-dashboard',
        type: DashboardType.HEALTHCARE,
        isActive: true,
        widgets: this.getHealthcareWidgets(),
        updateInterval: null as NodeJS.Timeout | null,
        subscribers: new Set<string>(),
        lastUpdated: new Date(),
      },
      {
        id: 'marketing-dashboard',
        type: DashboardType.MARKETING,
        isActive: true,
        widgets: this.getMarketingWidgets(),
        updateInterval: null as NodeJS.Timeout | null,
        subscribers: new Set<string>(),
        lastUpdated: new Date(),
      },
      {
        id: 'compliance-dashboard',
        type: DashboardType.COMPLIANCE,
        isActive: true,
        widgets: this.getComplianceWidgets(),
        updateInterval: null as NodeJS.Timeout | null,
        subscribers: new Set<string>(),
        lastUpdated: new Date(),
      },
    ];

    for (const dashboard of defaultDashboards) {
      this.dashboards.set(dashboard.id, dashboard);
      this.startDashboardUpdates(dashboard.id);
    }
  }

  // WebSocket Connection Management
  handleConnection(websocket: WebSocket, clientId: string, dashboardId?: string): void {
    this.activeConnections.set(clientId, websocket);
    
    if (dashboardId && this.dashboards.has(dashboardId)) {
      const dashboard = this.dashboards.get(dashboardId)!;
      dashboard.subscribers.add(clientId);
      
      // Send current dashboard state
      this.sendToClient(clientId, {
        type: 'dashboard_refresh',
        payload: {
          dashboardId,
          widgets: dashboard.widgets,
          lastUpdated: dashboard.lastUpdated,
        },
        timestamp: new Date(),
        sessionId: clientId,
      });
    }

    // Set up message handling
    websocket.onmessage = (event) => {
      this.handleClientMessage(clientId, event.data);
    };

    // Handle connection close
    websocket.onclose = () => {
      this.handleDisconnection(clientId);
    };

    // Send initial metrics
    this.sendCurrentMetrics(clientId);
  }

  private handleClientMessage(clientId: string, message: string): void {
    try {
      const parsedMessage: WebSocketMessage = JSON.parse(message);
      
      switch (parsedMessage.type) {
        case 'subscribe_dashboard':
          this.subscribeToDashboard(clientId, parsedMessage.payload.dashboardId);
          break;
        case 'unsubscribe_dashboard':
          this.unsubscribeFromDashboard(clientId, parsedMessage.payload.dashboardId);
          break;
        case 'acknowledge_alert':
          this.acknowledgeAlert(clientId, parsedMessage.payload.alertId);
          break;
        case 'request_metrics':
          this.sendCurrentMetrics(clientId);
          break;
        default:
          console.warn('Unknown message type:', parsedMessage.type);
      }
    } catch (error) {
      console.error('Error handling client message:', error);
    }
  }

  private handleDisconnection(clientId: string): void {
    this.activeConnections.delete(clientId);
    
    // Remove from all dashboard subscriptions
    for (const dashboard of this.dashboards.values()) {
      dashboard.subscribers.delete(clientId);
    }
  }

  private subscribeToDashboard(clientId: string, dashboardId: string): void {
    const dashboard = this.dashboards.get(dashboardId);
    if (dashboard) {
      dashboard.subscribers.add(clientId);
      
      this.sendToClient(clientId, {
        type: 'dashboard_refresh',
        payload: {
          dashboardId,
          widgets: dashboard.widgets,
          lastUpdated: dashboard.lastUpdated,
        },
        timestamp: new Date(),
        sessionId: clientId,
      });
    }
  }

  private unsubscribeFromDashboard(clientId: string, dashboardId: string): void {
    const dashboard = this.dashboards.get(dashboardId);
    if (dashboard) {
      dashboard.subscribers.delete(clientId);
    }
  }

  private acknowledgeAlert(clientId: string, alertId: string): void {
    const alert = this.alertHistory.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.resolvedAt = new Date();
      
      // Broadcast alert resolution
      this.broadcastToAll({
        type: 'alert',
        payload: {
          alertId,
          status: 'resolved',
          resolvedAt: alert.resolvedAt,
        },
        timestamp: new Date(),
        sessionId: clientId,
      });
    }
  }

  // Metrics Collection and Processing
  async updateMetrics(metrics: RealTimeMetrics): Promise<void> {
    const validatedMetrics = realTimeMetricsSchema.parse(metrics);
    
    // Cache metrics
    this.metricsCache.set('current', validatedMetrics);
    
    // Check for threshold breaches
    const alerts = this.checkThresholds(validatedMetrics);
    
    // Update dashboard widgets
    this.updateDashboardWidgets(validatedMetrics);
    
    // Broadcast updates to subscribed clients
    if (alerts.length > 0) {
      for (const alert of alerts) {
        this.alertHistory.push(alert);
        this.broadcastToAll({
          type: 'alert',
          payload: alert,
          timestamp: new Date(),
          sessionId: 'system',
        });
      }
    }

    // Broadcast regular metrics update
    this.broadcastToAll({
      type: 'analytics_update',
      payload: validatedMetrics,
      timestamp: new Date(),
      sessionId: 'system',
    });
  }

  private checkThresholds(metrics: RealTimeMetrics): Alert[] {
    const alerts: Alert[] = [];
    const now = new Date();

    // Check load time
    if (metrics.currentLoadTime > this.performanceThresholds.loadTime.critical) {
      alerts.push({
        id: `alert_loadtime_${Date.now()}`,
        type: 'performance',
        severity: 'critical',
        title: 'Critical Load Time',
        message: `Page load time (${metrics.currentLoadTime}ms) exceeds critical threshold (${this.performanceThresholds.loadTime.critical}ms)`,
        timestamp: now,
        acknowledged: false,
      });
    } else if (metrics.currentLoadTime > this.performanceThresholds.loadTime.warning) {
      alerts.push({
        id: `alert_loadtime_${Date.now()}`,
        type: 'performance',
        severity: 'warning',
        title: 'High Load Time',
        message: `Page load time (${metrics.currentLoadTime}ms) exceeds warning threshold (${this.performanceThresholds.loadTime.warning}ms)`,
        timestamp: now,
        acknowledged: false,
      });
    }

    // Check error rate
    if (metrics.errorRate > this.performanceThresholds.errorRate.critical) {
      alerts.push({
        id: `alert_error_${Date.now()}`,
        type: 'error',
        severity: 'critical',
        title: 'High Error Rate',
        message: `Error rate (${(metrics.errorRate * 100).toFixed(2)}%) exceeds critical threshold`,
        timestamp: now,
        acknowledged: false,
      });
    }

    // Check active users
    if (metrics.activeUsers > this.performanceThresholds.activeUsers.critical) {
      alerts.push({
        id: `alert_users_${Date.now()}`,
        type: 'performance',
        severity: 'warning',
        title: 'High User Load',
        message: `Active users (${metrics.activeUsers}) exceed capacity threshold`,
        timestamp: now,
        acknowledged: false,
      });
    }

    // Check conversion rate
    if (metrics.conversionRate < this.performanceThresholds.conversionRate.critical) {
      alerts.push({
        id: `alert_conversion_${Date.now()}`,
        type: 'conversion',
        severity: 'warning',
        title: 'Low Conversion Rate',
        message: `Conversion rate (${(metrics.conversionRate * 100).toFixed(2)}%) below critical threshold`,
        timestamp: now,
        acknowledged: false,
      });
    }

    return alerts;
  }

  private updateDashboardWidgets(metrics: RealTimeMetrics): void {
    for (const dashboard of this.dashboards.values()) {
      dashboard.lastUpdated = new Date();
      
      // Update specific widget data based on dashboard type
      switch (dashboard.type) {
        case DashboardType.EXECUTIVE:
          this.updateExecutiveWidgets(dashboard, metrics);
          break;
        case DashboardType.OPERATIONAL:
          this.updateOperationalWidgets(dashboard, metrics);
          break;
        case DashboardType.HEALTHCARE:
          this.updateHealthcareWidgets(dashboard, metrics);
          break;
        case DashboardType.MARKETING:
          this.updateMarketingWidgets(dashboard, metrics);
          break;
        case DashboardType.COMPLIANCE:
          this.updateComplianceWidgets(dashboard, metrics);
          break;
      }
    }
  }

  // Dashboard-specific widget updates
  private updateExecutiveWidgets(dashboard: RealTimeDashboardState, metrics: RealTimeMetrics): void {
    // Update KPI widgets for executive dashboard
    for (const widget of dashboard.widgets) {
      switch (widget.id) {
        case 'executive_conversion_rate':
          widget.dataSource = JSON.stringify({
            value: (metrics.conversionRate * 100).toFixed(1),
            trend: '+2.3%',
            status: metrics.conversionRate > 0.15 ? 'good' : 'warning',
          });
          break;
        case 'executive_active_users':
          widget.dataSource = JSON.stringify({
            value: metrics.activeUsers,
            trend: '+5.2%',
            status: metrics.activeUsers < 1000 ? 'good' : 'warning',
          });
          break;
        case 'executive_revenue_impact':
          widget.dataSource = JSON.stringify({
            value: '$45,230',
            trend: '+12.1%',
            status: 'good',
          });
          break;
      }
    }
  }

  private updateOperationalWidgets(dashboard: RealTimeDashboardState, metrics: RealTimeMetrics): void {
    // Update operational widgets
    for (const widget of dashboard.widgets) {
      switch (widget.id) {
        case 'operational_load_time':
          widget.dataSource = JSON.stringify({
            value: `${metrics.currentLoadTime}ms`,
            trend: metrics.currentLoadTime < 2000 ? 'improving' : 'degrading',
            status: this.getLoadTimeStatus(metrics.currentLoadTime),
          });
          break;
        case 'operational_error_rate':
          widget.dataSource = JSON.stringify({
            value: `${(metrics.errorRate * 100).toFixed(2)}%`,
            trend: metrics.errorRate < 0.05 ? 'stable' : 'increasing',
            status: this.getErrorRateStatus(metrics.errorRate),
          });
          break;
        case 'operational_appointments':
          widget.dataSource = JSON.stringify({
            value: metrics.concurrentAppointments,
            trend: '+8.5%',
            status: 'good',
          });
          break;
      }
    }
  }

  private updateHealthcareWidgets(dashboard: RealTimeDashboardState, metrics: RealTimeMetrics): void {
    // Update healthcare-specific widgets
    for (const widget of dashboard.widgets) {
      switch (widget.id) {
        case 'healthcare_appointment_volume':
          widget.dataSource = JSON.stringify({
            value: metrics.concurrentAppointments,
            target: 150,
            progress: (metrics.concurrentAppointments / 150) * 100,
            status: 'good',
          });
          break;
        case 'healthcare_doctor_utilization':
          widget.dataSource = JSON.stringify({
            value: '78.5%',
            target: '80%',
            progress: 78.5,
            status: 'good',
          });
          break;
        case 'healthcare_patient_satisfaction':
          widget.dataSource = JSON.stringify({
            value: 4.6,
            target: 4.5,
            progress: 92,
            status: 'excellent',
          });
          break;
      }
    }
  }

  private updateMarketingWidgets(dashboard: RealTimeDashboardState, metrics: RealTimeMetrics): void {
    // Update marketing widgets
    for (const widget of dashboard.widgets) {
      switch (widget.id) {
        case 'marketing_conversion_funnel':
          widget.dataSource = JSON.stringify({
            stages: [
              { name: 'Awareness', value: 12500, conversion: 100 },
              { name: 'Consideration', value: 3200, conversion: 25.6 },
              { name: 'Decision', value: 850, conversion: 6.8 },
              { name: 'Booking', value: 245, conversion: 1.96 },
            ],
          });
          break;
        case 'marketing_traffic_sources':
          widget.dataSource = JSON.stringify({
            sources: [
              { name: 'Google', value: 4800, percentage: 40 },
              { name: 'Direct', value: 2400, percentage: 20 },
              { name: 'Social', value: 1800, percentage: 15 },
              { name: 'Referral', value: 1200, percentage: 10 },
            ],
          });
          break;
        case 'marketing_campaign_performance':
          widget.dataSource = JSON.stringify({
            campaigns: [
              { name: 'Healthier SG', clicks: 1200, conversions: 89, ctr: 7.4 },
              { name: 'General Clinic', clicks: 850, conversions: 45, ctr: 5.3 },
              { name: 'Specialist', clicks: 620, conversions: 28, ctr: 4.5 },
            ],
          });
          break;
      }
    }
  }

  private updateComplianceWidgets(dashboard: RealTimeDashboardState, metrics: RealTimeMetrics): void {
    // Update compliance widgets
    for (const widget of dashboard.widgets) {
      switch (widget.id) {
        case 'compliance_data_privacy':
          widget.dataSource = JSON.stringify({
            consentRate: 98.5,
            dataRetention: '100% Compliant',
            anonymizationLevel: 'Full',
            lastAudit: '2025-01-15',
          });
          break;
        case 'compliance_security':
          widget.dataSource = JSON.stringify({
            threatsBlocked: 15,
            auditTrailEvents: 2847,
            dataBreaches: 0,
            complianceScore: 99.2,
          });
          break;
        case 'compliance_pdpa':
          widget.dataSource = JSON.stringify({
            consentRequests: 1250,
            dataSubjectRequests: 23,
            averageResponseTime: '2.1 hours',
            fulfillmentRate: 100,
          });
          break;
      }
    }
  }

  // Utility methods
  private getLoadTimeStatus(loadTime: number): 'good' | 'warning' | 'critical' {
    if (loadTime <= this.performanceThresholds.loadTime.warning) return 'good';
    if (loadTime <= this.performanceThresholds.loadTime.critical) return 'warning';
    return 'critical';
  }

  private getErrorRateStatus(errorRate: number): 'good' | 'warning' | 'critical' {
    if (errorRate <= this.performanceThresholds.errorRate.warning) return 'good';
    if (errorRate <= this.performanceThresholds.errorRate.critical) return 'warning';
    return 'critical';
  }

  // Dashboard widget configurations
  private getExecutiveWidgets(): DashboardWidget[] {
    return [
      {
        id: 'executive_conversion_rate',
        type: 'kpi_metric',
        title: 'Conversion Rate',
        position: { x: 0, y: 0, w: 3, h: 2 },
        dataSource: 'conversion_rate',
        visualization: {
          chartType: 'gauge',
          colors: ['#10B981', '#F59E0B', '#EF4444'],
          showLegend: false,
          showTooltip: true,
          animation: true,
          customOptions: { min: 0, max: 20 },
        },
      },
      {
        id: 'executive_active_users',
        type: 'kpi_metric',
        title: 'Active Users',
        position: { x: 3, y: 0, w: 3, h: 2 },
        dataSource: 'active_users',
        visualization: {
          chartType: 'gauge',
          colors: ['#10B981', '#F59E0B', '#EF4444'],
          showLegend: false,
          showTooltip: true,
          animation: true,
          customOptions: { min: 0, max: 2000 },
        },
      },
      {
        id: 'executive_revenue_impact',
        type: 'kpi_metric',
        title: 'Revenue Impact',
        position: { x: 6, y: 0, w: 3, h: 2 },
        dataSource: 'revenue',
        visualization: {
          chartType: 'gauge',
          colors: ['#10B981', '#F59E0B', '#EF4444'],
          showLegend: false,
          showTooltip: true,
          animation: true,
          customOptions: { min: 0, max: 100000 },
        },
      },
    ];
  }

  private getOperationalWidgets(): DashboardWidget[] {
    return [
      {
        id: 'operational_load_time',
        type: 'kpi_metric',
        title: 'Average Load Time',
        position: { x: 0, y: 0, w: 4, h: 2 },
        dataSource: 'load_time',
        visualization: {
          chartType: 'gauge',
          colors: ['#10B981', '#F59E0B', '#EF4444'],
          showLegend: false,
          showTooltip: true,
          animation: true,
          customOptions: { min: 0, max: 5000 },
        },
      },
      {
        id: 'operational_error_rate',
        type: 'kpi_metric',
        title: 'Error Rate',
        position: { x: 4, y: 0, w: 4, h: 2 },
        dataSource: 'error_rate',
        visualization: {
          chartType: 'gauge',
          colors: ['#10B981', '#F59E0B', '#EF4444'],
          showLegend: false,
          showTooltip: true,
          animation: true,
          customOptions: { min: 0, max: 10 },
        },
      },
      {
        id: 'operational_appointments',
        type: 'kpi_metric',
        title: 'Current Appointments',
        position: { x: 8, y: 0, w: 4, h: 2 },
        dataSource: 'appointments',
        visualization: {
          chartType: 'gauge',
          colors: ['#10B981', '#F59E0B', '#EF4444'],
          showLegend: false,
          showTooltip: true,
          animation: true,
          customOptions: { min: 0, max: 300 },
        },
      },
    ];
  }

  private getHealthcareWidgets(): DashboardWidget[] {
    return [
      {
        id: 'healthcare_appointment_volume',
        type: 'kpi_metric',
        title: 'Daily Appointments',
        position: { x: 0, y: 0, w: 4, h: 2 },
        dataSource: 'appointment_volume',
        visualization: {
          chartType: 'gauge',
          colors: ['#10B981', '#F59E0B', '#EF4444'],
          showLegend: false,
          showTooltip: true,
          animation: true,
          customOptions: { min: 0, max: 200 },
        },
      },
      {
        id: 'healthcare_doctor_utilization',
        type: 'kpi_metric',
        title: 'Doctor Utilization',
        position: { x: 4, y: 0, w: 4, h: 2 },
        dataSource: 'doctor_utilization',
        visualization: {
          chartType: 'gauge',
          colors: ['#10B981', '#F59E0B', '#EF4444'],
          showLegend: false,
          showTooltip: true,
          animation: true,
          customOptions: { min: 0, max: 100 },
        },
      },
      {
        id: 'healthcare_patient_satisfaction',
        type: 'kpi_metric',
        title: 'Patient Satisfaction',
        position: { x: 8, y: 0, w: 4, h: 2 },
        dataSource: 'patient_satisfaction',
        visualization: {
          chartType: 'gauge',
          colors: ['#10B981', '#F59E0B', '#EF4444'],
          showLegend: false,
          showTooltip: true,
          animation: true,
          customOptions: { min: 0, max: 5 },
        },
      },
    ];
  }

  private getMarketingWidgets(): DashboardWidget[] {
    return [
      {
        id: 'marketing_conversion_funnel',
        type: 'funnel',
        title: 'Conversion Funnel',
        position: { x: 0, y: 0, w: 6, h: 4 },
        dataSource: 'conversion_funnel',
        visualization: {
          chartType: 'funnel',
          colors: ['#8B5CF6', '#A855F7', '#C084FC', '#DDD6FE'],
          showLegend: true,
          showTooltip: true,
          animation: true,
        },
      },
      {
        id: 'marketing_traffic_sources',
        type: 'pie_chart',
        title: 'Traffic Sources',
        position: { x: 6, y: 0, w: 6, h: 4 },
        dataSource: 'traffic_sources',
        visualization: {
          chartType: 'pie',
          colors: ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'],
          showLegend: true,
          showTooltip: true,
          animation: true,
        },
      },
      {
        id: 'marketing_campaign_performance',
        type: 'bar_chart',
        title: 'Campaign Performance',
        position: { x: 0, y: 4, w: 12, h: 4 },
        dataSource: 'campaign_performance',
        visualization: {
          chartType: 'bar',
          colors: ['#3B82F6', '#10B981', '#F59E0B'],
          showLegend: true,
          showTooltip: true,
          animation: true,
        },
      },
    ];
  }

  private getComplianceWidgets(): DashboardWidget[] {
    return [
      {
        id: 'compliance_data_privacy',
        type: 'kpi_metric',
        title: 'Data Privacy Compliance',
        position: { x: 0, y: 0, w: 4, h: 2 },
        dataSource: 'data_privacy',
        visualization: {
          chartType: 'gauge',
          colors: ['#10B981', '#F59E0B', '#EF4444'],
          showLegend: false,
          showTooltip: true,
          animation: true,
          customOptions: { min: 0, max: 100 },
        },
      },
      {
        id: 'compliance_security',
        type: 'kpi_metric',
        title: 'Security Status',
        position: { x: 4, y: 0, w: 4, h: 2 },
        dataSource: 'security',
        visualization: {
          chartType: 'gauge',
          colors: ['#10B981', '#F59E0B', '#EF4444'],
          showLegend: false,
          showTooltip: true,
          animation: true,
          customOptions: { min: 0, max: 100 },
        },
      },
      {
        id: 'compliance_pdpa',
        type: 'kpi_metric',
        title: 'PDPA Compliance',
        position: { x: 8, y: 0, w: 4, h: 2 },
        dataSource: 'pdpa',
        visualization: {
          chartType: 'gauge',
          colors: ['#10B981', '#F59E0B', '#EF4444'],
          showLegend: false,
          showTooltip: true,
          animation: true,
          customOptions: { min: 0, max: 100 },
        },
      },
    ];
  }

  // Message Broadcasting
  private sendToClient(clientId: string, message: WebSocketMessage): void {
    const websocket = this.activeConnections.get(clientId);
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      websocket.send(JSON.stringify(message));
    }
  }

  private broadcastToAll(message: WebSocketMessage): void {
    for (const clientId of this.activeConnections.keys()) {
      this.sendToClient(clientId, message);
    }
  }

  private sendCurrentMetrics(clientId: string): void {
    const currentMetrics = this.metricsCache.get('current');
    if (currentMetrics) {
      this.sendToClient(clientId, {
        type: 'analytics_update',
        payload: currentMetrics,
        timestamp: new Date(),
        sessionId: clientId,
      });
    }
  }

  // Background tasks
  private startMetricsCollection(): void {
    // Simulate metrics collection every 5 seconds
    setInterval(() => {
      this.generateMockMetrics();
    }, 5000);
  }

  private startDashboardUpdates(dashboardId: string): void {
    const dashboard = this.dashboards.get(dashboardId);
    if (dashboard) {
      dashboard.updateInterval = setInterval(() => {
        // Trigger periodic updates for this dashboard
        this.broadcastToSubscribers(dashboardId, {
          type: 'dashboard_refresh',
          payload: {
            dashboardId,
            widgets: dashboard.widgets,
            lastUpdated: dashboard.lastUpdated,
          },
          timestamp: new Date(),
          sessionId: 'system',
        });
      }, 30000); // Update every 30 seconds
    }
  }

  private broadcastToSubscribers(dashboardId: string, message: WebSocketMessage): void {
    const dashboard = this.dashboards.get(dashboardId);
    if (dashboard) {
      for (const clientId of dashboard.subscribers) {
        this.sendToClient(clientId, message);
      }
    }
  }

  private generateMockMetrics(): void {
    const mockMetrics: RealTimeMetrics = {
      id: `metrics_${Date.now()}`,
      timestamp: new Date(),
      activeUsers: Math.floor(Math.random() * 800) + 200,
      concurrentAppointments: Math.floor(Math.random() * 50) + 20,
      currentLoadTime: Math.floor(Math.random() * 3000) + 1000,
      errorRate: Math.random() * 0.1,
      conversionRate: Math.random() * 0.2 + 0.05,
      alerts: [],
      lastUpdated: new Date(),
    };

    this.updateMetrics(mockMetrics);
  }

  // Public methods for dashboard management
  getDashboardState(dashboardId: string): RealTimeDashboardState | null {
    return this.dashboards.get(dashboardId) || null;
  }

  getAllDashboards(): RealTimeDashboardState[] {
    return Array.from(this.dashboards.values());
  }

  updateDashboardConfiguration(dashboardId: string, config: Partial<RealTimeDashboardState>): boolean {
    const dashboard = this.dashboards.get(dashboardId);
    if (dashboard) {
      Object.assign(dashboard, config);
      return true;
    }
    return false;
  }

  // Cleanup
  shutdown(): void {
    // Clear all intervals
    for (const dashboard of this.dashboards.values()) {
      if (dashboard.updateInterval) {
        clearInterval(dashboard.updateInterval);
      }
    }

    // Close all connections
    for (const websocket of this.activeConnections.values()) {
      websocket.close();
    }

    this.dashboards.clear();
    this.activeConnections.clear();
    this.metricsCache.clear();
  }
}

// Export singleton instance
export const realTimeAnalyticsService = RealTimeAnalyticsService.getInstance();