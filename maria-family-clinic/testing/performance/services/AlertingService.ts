/**
 * Alerting Service - Manages performance testing alerts and notifications
 * Integrates with monitoring infrastructure for automated alerting during testing
 */

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  condition: AlertCondition;
  severity: 'info' | 'warning' | 'error' | 'critical';
  enabled: boolean;
  channels: AlertChannel[];
  cooldownPeriod: number; // ms between alerts
  lastTriggered?: number;
}

export interface AlertCondition {
  metric: string;
  operator: '>' | '<' | '==' | '>=' | '<=' | '!=';
  threshold: number;
  duration?: number; // How long condition must be met
}

export interface AlertChannel {
  type: 'email' | 'slack' | 'webhook' | 'sms' | 'dashboard';
  config: Record<string, any>;
  enabled: boolean;
}

export interface Alert {
  id: string;
  ruleId: string;
  ruleName: string;
  timestamp: number;
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  metric: string;
  currentValue: number;
  threshold: number;
  data?: any;
  resolved: boolean;
  resolvedAt?: number;
  acknowledged: boolean;
  acknowledgedAt?: number;
  acknowledgedBy?: string;
}

export interface AlertSummary {
  total: number;
  open: number;
  resolved: number;
  acknowledged: number;
  critical: number;
  error: number;
  warning: number;
  info: number;
}

export class AlertingService {
  private rules: Map<string, AlertRule> = new Map();
  private alerts: Map<string, Alert> = new Map();
  private activeConditions: Map<string, { startTime: number; value: number }> = new Map();
  private channelHandlers: Map<string, AlertChannelHandler> = new Map();

  constructor() {
    this.initializeDefaultRules();
    this.initializeChannelHandlers();
  }

  /**
   * Initialize default alert rules for performance testing
   */
  private initializeDefaultRules(): void {
    const defaultRules: AlertRule[] = [
      {
        id: 'high_response_time',
        name: 'High Response Time',
        description: 'Alert when average response time exceeds threshold',
        condition: { metric: 'avg_response_time', operator: '>', threshold: 3000 },
        severity: 'warning',
        enabled: true,
        channels: [
          { type: 'dashboard', config: { display: true }, enabled: true },
          { type: 'email', config: { recipients: ['admin@clinic.com'] }, enabled: true }
        ],
        cooldownPeriod: 300000 // 5 minutes
      },
      {
        id: 'critical_response_time',
        name: 'Critical Response Time',
        description: 'Alert when average response time is critically high',
        condition: { metric: 'avg_response_time', operator: '>', threshold: 5000, duration: 60000 },
        severity: 'critical',
        enabled: true,
        channels: [
          { type: 'dashboard', config: { display: true }, enabled: true },
          { type: 'email', config: { recipients: ['admin@clinic.com', 'devops@clinic.com'] }, enabled: true },
          { type: 'slack', config: { channel: '#alerts', webhook: process.env.SLACK_WEBHOOK_URL }, enabled: true }
        ],
        cooldownPeriod: 120000 // 2 minutes
      },
      {
        id: 'high_error_rate',
        name: 'High Error Rate',
        description: 'Alert when error rate exceeds acceptable threshold',
        condition: { metric: 'error_rate', operator: '>', threshold: 0.05, duration: 30000 },
        severity: 'error',
        enabled: true,
        channels: [
          { type: 'dashboard', config: { display: true }, enabled: true },
          { type: 'email', config: { recipients: ['admin@clinic.com'] }, enabled: true },
          { type: 'slack', config: { channel: '#alerts' }, enabled: true }
        ],
        cooldownPeriod: 180000 // 3 minutes
      },
      {
        id: 'performance_regression',
        name: 'Performance Regression',
        description: 'Alert when performance score drops significantly',
        condition: { metric: 'performance_score', operator: '<', threshold: 0.7, duration: 60000 },
        severity: 'warning',
        enabled: true,
        channels: [
          { type: 'dashboard', config: { display: true }, enabled: true },
          { type: 'email', config: { recipients: ['dev@clinic.com'] }, enabled: true }
        ],
        cooldownPeriod: 600000 // 10 minutes
      },
      {
        id: 'budget_violation',
        name: 'Performance Budget Violation',
        description: 'Alert when performance budgets are exceeded',
        condition: { metric: 'budget_violation_count', operator: '>', threshold: 0, duration: 0 },
        severity: 'error',
        enabled: true,
        channels: [
          { type: 'dashboard', config: { display: true }, enabled: true },
          { type: 'email', config: { recipients: ['admin@clinic.com'] }, enabled: true }
        ],
        cooldownPeriod: 300000 // 5 minutes
      },
      {
        id: 'pdpa_compliance_failure',
        name: 'PDPA Compliance Failure',
        description: 'Alert when PDPA compliance checks fail',
        condition: { metric: 'pdpa_compliant', operator: '==', threshold: 0, duration: 0 },
        severity: 'critical',
        enabled: true,
        channels: [
          { type: 'dashboard', config: { display: true }, enabled: true },
          { type: 'email', config: { recipients: ['privacy@clinic.com', 'admin@clinic.com'] }, enabled: true },
          { type: 'slack', config: { channel: '#privacy-alerts' }, enabled: true },
          { type: 'sms', config: { numbers: ['+6590000000'] }, enabled: true }
        ],
        cooldownPeriod: 60000 // 1 minute
      },
      {
        id: 'cross_browser_inconsistency',
        name: 'Cross-Browser Performance Inconsistency',
        description: 'Alert when performance varies significantly across browsers',
        condition: { metric: 'browser_consistency', operator: '<', threshold: 0.8, duration: 0 },
        severity: 'warning',
        enabled: true,
        channels: [
          { type: 'dashboard', config: { display: true }, enabled: true },
          { type: 'email', config: { recipients: ['qa@clinic.com'] }, enabled: true }
        ],
        cooldownPeriod: 900000 // 15 minutes
      },
      {
        id: 'low_throughput',
        name: 'Low System Throughput',
        description: 'Alert when system throughput drops below acceptable levels',
        condition: { metric: 'throughput_rps', operator: '<', threshold: 10, duration: 60000 },
        severity: 'warning',
        enabled: true,
        channels: [
          { type: 'dashboard', config: { display: true }, enabled: true },
          { type: 'email', config: { recipients: ['admin@clinic.com'] }, enabled: true }
        ],
        cooldownPeriod: 300000 // 5 minutes
      }
    ];

    defaultRules.forEach(rule => {
      this.rules.set(rule.id, rule);
    });
  }

  /**
   * Initialize channel handlers
   */
  private initializeChannelHandlers(): void {
    this.channelHandlers.set('dashboard', new DashboardAlertChannel());
    this.channelHandlers.set('email', new EmailAlertChannel());
    this.channelHandlers.set('slack', new SlackAlertChannel());
    this.channelHandlers.set('webhook', new WebhookAlertChannel());
    this.channelHandlers.set('sms', new SMSAlertChannel());
  }

  /**
   * Check and send alerts based on current metrics
   */
  async checkAndSendAlerts(metrics: Record<string, number>): Promise<Alert[]> {
    const triggeredAlerts: Alert[] = [];

    for (const [ruleId, rule] of this.rules) {
      if (!rule.enabled) continue;

      const metricValue = metrics[rule.condition.metric];
      if (metricValue === undefined) continue;

      // Check if condition is met
      const conditionMet = this.evaluateCondition(metricValue, rule.condition);

      // Handle duration-based conditions
      const conditionKey = `${ruleId}_${rule.condition.metric}`;
      const activeCondition = this.activeConditions.get(conditionKey);

      if (conditionMet) {
        if (!activeCondition) {
          // Start tracking this condition
          this.activeConditions.set(conditionKey, {
            startTime: Date.now(),
            value: metricValue
          });
        } else {
          // Update the condition
          activeCondition.value = metricValue;
          
          // Check if duration requirement is met
          const duration = rule.condition.duration || 0;
          if (duration === 0 || (Date.now() - activeCondition.startTime) >= duration) {
            // Condition met for required duration, check cooldown
            if (this.canTriggerAlert(rule)) {
              const alert = await this.triggerAlert(rule, metricValue);
              if (alert) {
                triggeredAlerts.push(alert);
              }
            }
          }
        }
      } else {
        // Condition not met, remove from active tracking
        this.activeConditions.delete(conditionKey);
      }
    }

    return triggeredAlerts;
  }

  /**
   * Send budget violation alert
   */
  async sendBudgetViolationAlert(violations: any[]): Promise<void> {
    const violationCount = violations.length;
    
    const budgetMetrics: Record<string, number> = {
      'budget_violation_count': violationCount,
      'total_budget_excess': violations.reduce((sum, v) => sum + (v.excess || 0), 0)
    };

    await this.checkAndSendAlerts(budgetMetrics);
  }

  /**
   * Create custom alert rule
   */
  createAlertRule(rule: Omit<AlertRule, 'id'>): string {
    const id = `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newRule: AlertRule = {
      ...rule,
      id
    };

    this.rules.set(id, newRule);
    return id;
  }

  /**
   * Update alert rule
   */
  updateAlertRule(id: string, updates: Partial<AlertRule>): boolean {
    const rule = this.rules.get(id);
    if (!rule) return false;

    const updatedRule = { ...rule, ...updates };
    this.rules.set(id, updatedRule);
    return true;
  }

  /**
   * Delete alert rule
   */
  deleteAlertRule(id: string): boolean {
    return this.rules.delete(id);
  }

  /**
   * Get all alert rules
   */
  getAlertRules(): AlertRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): Alert[] {
    return Array.from(this.alerts.values()).filter(alert => !alert.resolved);
  }

  /**
   * Get all alerts
   */
  getAllAlerts(): Alert[] {
    return Array.from(this.alerts.values());
  }

  /**
   * Get alert summary
   */
  getAlertSummary(): AlertSummary {
    const allAlerts = this.getAllAlerts();
    
    return {
      total: allAlerts.length,
      open: allAlerts.filter(a => !a.resolved).length,
      resolved: allAlerts.filter(a => a.resolved).length,
      acknowledged: allAlerts.filter(a => a.acknowledged).length,
      critical: allAlerts.filter(a => a.severity === 'critical' && !a.resolved).length,
      error: allAlerts.filter(a => a.severity === 'error' && !a.resolved).length,
      warning: allAlerts.filter(a => a.severity === 'warning' && !a.resolved).length,
      info: allAlerts.filter(a => a.severity === 'info' && !a.resolved).length
    };
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert || alert.acknowledged) return false;

    alert.acknowledged = true;
    alert.acknowledgedAt = Date.now();
    alert.acknowledgedBy = acknowledgedBy;

    return true;
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert || alert.resolved) return false;

    alert.resolved = true;
    alert.resolvedAt = Date.now();

    return true;
  }

  /**
   * Test alert channel
   */
  async testAlertChannel(channel: AlertChannel, testMessage: string = 'Test alert message'): Promise<boolean> {
    const handler = this.channelHandlers.get(channel.type);
    if (!handler) {
      throw new Error(`Unknown alert channel type: ${channel.type}`);
    }

    try {
      await handler.send({
        id: `test_${Date.now()}`,
        ruleId: 'test',
        ruleName: 'Test Rule',
        timestamp: Date.now(),
        severity: 'info',
        title: 'Test Alert',
        message: testMessage,
        metric: 'test',
        currentValue: 0,
        threshold: 0,
        resolved: false,
        acknowledged: false
      }, channel.config);

      return true;
    } catch (error) {
      console.error('Alert channel test failed:', error);
      return false;
    }
  }

  // Private methods

  private evaluateCondition(value: number, condition: AlertCondition): boolean {
    switch (condition.operator) {
      case '>': return value > condition.threshold;
      case '<': return value < condition.threshold;
      case '==': return value == condition.threshold;
      case '>=': return value >= condition.threshold;
      case '<=': return value <= condition.threshold;
      case '!=': return value != condition.threshold;
      default: return false;
    }
  }

  private canTriggerAlert(rule: AlertRule): boolean {
    const now = Date.now();
    const cooldownPeriod = rule.cooldownPeriod || 300000; // 5 minutes default

    // Check cooldown period
    if (rule.lastTriggered && (now - rule.lastTriggered) < cooldownPeriod) {
      return false;
    }

    // Check if there's already an active alert for this rule
    const hasActiveAlert = Array.from(this.alerts.values()).some(
      alert => alert.ruleId === rule.id && !alert.resolved
    );

    return !hasActiveAlert;
  }

  private async triggerAlert(rule: AlertRule, currentValue: number): Promise<Alert | null> {
    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ruleId: rule.id,
      ruleName: rule.name,
      timestamp: Date.now(),
      severity: rule.severity,
      title: `${rule.name}`,
      message: `${rule.description}. Current value: ${currentValue}, Threshold: ${rule.condition.threshold}`,
      metric: rule.condition.metric,
      currentValue,
      threshold: rule.condition.threshold,
      resolved: false,
      acknowledged: false
    };

    // Store alert
    this.alerts.set(alert.id, alert);
    rule.lastTriggered = Date.now();

    // Send to all enabled channels
    for (const channel of rule.channels) {
      if (!channel.enabled) continue;

      const handler = this.channelHandlers.get(channel.type);
      if (handler) {
        try {
          await handler.send(alert, channel.config);
        } catch (error) {
          console.error(`Failed to send alert via ${channel.type}:`, error);
        }
      }
    }

    return alert;
  }
}

// Alert Channel Handler Interface
interface AlertChannelHandler {
  send(alert: Alert, config: Record<string, any>): Promise<void>;
}

// Dashboard Alert Channel
class DashboardAlertChannel implements AlertChannelHandler {
  async send(alert: Alert, config: Record<string, any>): Promise<void> {
    // In a real implementation, this would update a dashboard
    console.log(`[DASHBOARD ALERT] ${alert.severity.toUpperCase()}: ${alert.title} - ${alert.message}`);
    
    // Store in local storage or send to dashboard API
    if (typeof window !== 'undefined') {
      const alerts = JSON.parse(localStorage.getItem('performance_alerts') || '[]');
      alerts.push(alert);
      localStorage.setItem('performance_alerts', JSON.stringify(alerts.slice(-50))); // Keep last 50
    }
  }
}

// Email Alert Channel
class EmailAlertChannel implements AlertChannelHandler {
  async send(alert: Alert, config: Record<string, any>): Promise<void> {
    const recipients = config.recipients || [];
    console.log(`[EMAIL ALERT] Sending to ${recipients.join(', ')}: ${alert.title}`);
    
    // In a real implementation, this would integrate with an email service
    // Example: SendGrid, AWS SES, etc.
  }
}

// Slack Alert Channel
class SlackAlertChannel implements AlertChannelHandler {
  async send(alert: Alert, config: Record<string, any>): Promise<void> {
    const webhookUrl = config.webhook;
    const channel = config.channel || '#alerts';
    
    if (!webhookUrl) {
      console.warn('Slack webhook URL not configured');
      return;
    }

    const color = this.getSlackColor(alert.severity);
    const message = {
      channel,
      username: 'Performance Monitoring Bot',
      attachments: [
        {
          color,
          title: alert.title,
          text: alert.message,
          fields: [
            {
              title: 'Severity',
              value: alert.severity.toUpperCase(),
              short: true
            },
            {
              title: 'Metric',
              value: alert.metric,
              short: true
            },
            {
              title: 'Current Value',
              value: alert.currentValue.toString(),
              short: true
            },
            {
              title: 'Threshold',
              value: alert.threshold.toString(),
              short: true
            }
          ],
          footer: 'Performance Testing Alert',
          ts: Math.floor(alert.timestamp / 1000)
        }
      ]
    };

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      });
    } catch (error) {
      console.error('Failed to send Slack alert:', error);
    }
  }

  private getSlackColor(severity: string): string {
    switch (severity) {
      case 'critical': return 'danger';
      case 'error': return 'danger';
      case 'warning': return 'warning';
      case 'info': return 'good';
      default: return '#439FE0';
    }
  }
}

// Webhook Alert Channel
class WebhookAlertChannel implements AlertChannelHandler {
  async send(alert: Alert, config: Record<string, any>): Promise<void> {
    const url = config.url;
    const headers = config.headers || { 'Content-Type': 'application/json' };
    
    if (!url) {
      console.warn('Webhook URL not configured');
      return;
    }

    try {
      await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(alert)
      });
    } catch (error) {
      console.error('Failed to send webhook alert:', error);
    }
  }
}

// SMS Alert Channel
class SMSAlertChannel implements AlertChannelHandler {
  async send(alert: Alert, config: Record<string, any>): Promise<void> {
    const numbers = config.numbers || [];
    const message = `[${alert.severity.toUpperCase()}] ${alert.title}: ${alert.message}`;
    
    console.log(`[SMS ALERT] Sending to ${numbers.join(', ')}: ${message}`);
    
    // In a real implementation, this would integrate with an SMS service
    // Example: Twilio, AWS SNS, etc.
  }
}