/**
 * Healthcare Alerting & Incident Management System
 * Sub-Phase 10.6: Alerting & Incident Response for My Family Clinic
 * Handles performance alerts, critical errors, compliance violations, and automated response
 */

import { 
  AlertRule,
  AlertCondition,
  AlertAction,
  AlertActionType,
  Incident,
  IncidentPriority,
  IncidentStatus,
  IncidentTimelineEntry,
  MonitoringSeverity,
  MonitoringCategory,
  ComplianceImpact,
  HealthcareImpactLevel,
  EscalationPolicy,
  SuppressionRule
} from './types';

// =============================================================================
// ALERTING SYSTEM CONFIGURATION
// =============================================================================

const ALERT_RULES_CONFIGURATION: AlertRule[] = [
  {
    ruleId: 'performance_degradation',
    name: 'Performance Degradation Alert',
    description: 'Triggered when system performance falls below acceptable thresholds',
    category: MonitoringCategory.PERFORMANCE,
    severity: MonitoringSeverity.HIGH,
    conditions: [
      {
        metricType: 'PAGE_LOAD_TIME',
        operator: 'gt',
        threshold: 5000,
        duration: 300,
        healthcareSpecific: true,
        workflowContext: 'clinic_search'
      },
      {
        metricType: 'API_RESPONSE_TIME',
        operator: 'gt',
        threshold: 2000,
        duration: 120,
        healthcareSpecific: true,
        workflowContext: 'appointment_booking'
      }
    ],
    actions: [
      {
        actionType: AlertActionType.CREATE_INCIDENT,
        configuration: { priority: IncidentPriority.P2_HIGH },
        priority: 1
      },
      {
        actionType: AlertActionType.SEND_EMAIL,
        configuration: { recipients: ['ops-team@clinic.com'], subject: 'Performance Alert' },
        priority: 2
      },
      {
        actionType: AlertActionType.ESCALATE,
        configuration: { escalationLevel: 1, delayMinutes: 15 },
        priority: 3
      }
    ],
    isActive: true,
    escalationPolicy: {
      policyId: 'performance_escalation',
      name: 'Performance Issue Escalation',
      levels: [
        { level: 1, roles: ['system_admin'], timeInLevel: 15, actions: ['notify_team'] },
        { level: 2, roles: ['tech_lead'], timeInLevel: 30, actions: ['create_incident'] },
        { level: 3, roles: ['engineering_manager'], timeInLevel: 60, actions: ['executive_notification'] }
      ],
      timeTriggers: [15, 30, 60],
      notificationChannels: ['email', 'slack'],
      healthcareSpecific: true
    },
    suppressionRules: [
      {
        ruleId: 'maintenance_suppression',
        name: 'Scheduled Maintenance Suppression',
        conditions: { maintenance_mode: true },
        duration: 3600,
        reason: 'Scheduled system maintenance',
        createdBy: 'system_admin'
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    ruleId: 'healthcare_workflow_failure',
    name: 'Healthcare Workflow Failure Alert',
    description: 'Critical alerts for healthcare workflow failures',
    category: MonitoringCategory.HEALTHCARE_WORKFLOW,
    severity: MonitoringSeverity.CRITICAL,
    conditions: [
      {
        metricType: 'WORKFLOW_SUCCESS_RATE',
        operator: 'lt',
        threshold: 85,
        duration: 60,
        healthcareSpecific: true,
        workflowContext: 'appointment_booking'
      },
      {
        metricType: 'WORKFLOW_DURATION',
        operator: 'gt',
        threshold: 300000, // 5 minutes
        duration: 30,
        healthcareSpecific: true,
        workflowContext: 'healthier_sg_enrollment'
      }
    ],
    actions: [
      {
        actionType: AlertActionType.CREATE_INCIDENT,
        configuration: { priority: IncidentPriority.P1_CRITICAL },
        priority: 1
      },
      {
        actionType: AlertActionType.SEND_EMAIL,
        configuration: { 
          recipients: ['healthcare-ops@clinic.com', 'medical-director@clinic.com'],
          subject: 'CRITICAL: Healthcare Workflow Failure' 
        },
        priority: 1
      },
      {
        actionType: AlertActionType.SEND_SMS,
        configuration: { 
          recipients: ['+65-9XXX-XXXX'], // Medical director
          message: 'CRITICAL: Healthcare workflow failure detected' 
        },
        priority: 1
      },
      {
        actionType: AlertActionType.RUN_PLAYBOOK,
        configuration: { playbookId: 'healthcare_workflow_recovery' },
        priority: 2
      }
    ],
    isActive: true,
    escalationPolicy: {
      policyId: 'healthcare_escalation',
      name: 'Healthcare Critical Issue Escalation',
      levels: [
        { level: 1, roles: ['healthcare_ops_manager'], timeInLevel: 5, actions: ['immediate_response'] },
        { level: 2, roles: ['medical_director', 'cto'], timeInLevel: 15, actions: ['emergency_response'] },
        { level: 3, roles: ['ceo', 'regulatory_affairs'], timeInLevel: 30, actions: ['regulatory_notification'] }
      ],
      timeTriggers: [5, 15, 30],
      notificationChannels: ['email', 'sms', 'phone'],
      healthcareSpecific: true
    },
    suppressionRules: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    ruleId: 'pdpa_violation',
    name: 'PDPA Compliance Violation Alert',
    description: 'Immediate alerts for PDPA compliance violations',
    category: MonitoringCategory.COMPLIANCE,
    severity: MonitoringSeverity.CRITICAL,
    conditions: [
      {
        metricType: 'PDPA_COMPLIANCE_SCORE',
        operator: 'lt',
        threshold: 80,
        duration: 0, // Immediate
        healthcareSpecific: true,
        workflowContext: 'patient_data_processing'
      },
      {
        metricType: 'CONSENT_VIOLATION',
        operator: 'eq',
        threshold: 1,
        duration: 0, // Immediate
        healthcareSpecific: true,
        workflowContext: 'patient_data_access'
      }
    ],
    actions: [
      {
        actionType: AlertActionType.CREATE_INCIDENT,
        configuration: { priority: IncidentPriority.P1_CRITICAL },
        priority: 1
      },
      {
        actionType: AlertActionType.SEND_EMAIL,
        configuration: { 
          recipients: ['privacy-officer@clinic.com', 'legal@clinic.com', 'compliance@clinic.com'],
          subject: 'CRITICAL: PDPA Violation Detected' 
        },
        priority: 1
      },
      {
        actionType: AlertActionType.RUN_PLAYBOOK,
        configuration: { playbookId: 'pdpa_violation_response' },
        priority: 1
      },
      {
        actionType: AlertActionType.ESCALATE,
        configuration: { escalationLevel: 1, delayMinutes: 10 },
        priority: 2
      }
    ],
    isActive: true,
    complianceType: 'PDPA_COMPLIANCE',
    escalationPolicy: {
      policyId: 'compliance_escalation',
      name: 'Compliance Violation Escalation',
      levels: [
        { level: 1, roles: ['privacy_officer', 'legal_counsel'], timeInLevel: 10, actions: ['immediate_investigation'] },
        { level: 2, roles: ['compliance_director', 'dpo'], timeInLevel: 30, actions: ['regulatory_notification'] },
        { level: 3, roles: ['ceo', 'board'], timeInLevel: 60, actions: ['external_notification'] }
      ],
      timeTriggers: [10, 30, 60],
      notificationChannels: ['email', 'sms', 'legal_system'],
      healthcareSpecific: true
    },
    suppressionRules: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    ruleId: 'security_incident',
    name: 'Security Incident Alert',
    description: 'Alerts for healthcare data security incidents',
    category: MonitoringCategory.SECURITY,
    severity: MonitoringSeverity.CRITICAL,
    conditions: [
      {
        metricType: 'UNAUTHORIZED_ACCESS',
        operator: 'eq',
        threshold: 1,
        duration: 0,
        healthcareSpecific: true,
        workflowContext: 'patient_records'
      },
      {
        metricType: 'DATA_BREACH_INDICATOR',
        operator: 'eq',
        threshold: 1,
        duration: 0,
        healthcareSpecific: true,
        workflowContext: 'medical_data'
      }
    ],
    actions: [
      {
        actionType: AlertActionType.CREATE_INCIDENT,
        configuration: { priority: IncidentPriority.P1_CRITICAL },
        priority: 1
      },
      {
        actionType: AlertActionType.SEND_EMAIL,
        configuration: { 
          recipients: ['security-team@clinic.com', 'cto@clinic.com', 'legal@clinic.com'],
          subject: 'CRITICAL: Security Incident Detected' 
        },
        priority: 1
      },
      {
        actionType: AlertActionType.SEND_SMS,
        configuration: { 
          recipients: ['+65-9XXX-XXXX', '+65-9XXX-YYYY'], // Security lead, CTO
          message: 'CRITICAL: Healthcare security incident detected' 
        },
        priority: 1
      },
      {
        actionType: AlertActionType.RUN_PLAYBOOK,
        configuration: { playbookId: 'security_incident_response' },
        priority: 1
      }
    ],
    isActive: true,
    escalationPolicy: {
      policyId: 'security_escalation',
      name: 'Security Incident Escalation',
      levels: [
        { level: 1, roles: ['security_lead', 'cto'], timeInMinute: 5, actions: ['immediate_response'] },
        { level: 2, roles: ['legal', 'compliance'], timeInMinute: 15, actions: ['legal_assessment'] },
        { level: 3, roles: ['ceo', 'board', 'authorities'], timeInMinute: 30, actions: ['external_notification'] }
      ],
      timeTriggers: [5, 15, 30],
      notificationChannels: ['email', 'sms', 'phone', 'security_system'],
      healthcareSpecific: true
    },
    suppressionRules: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    ruleId: 'integration_failure',
    name: 'Third-party Integration Failure Alert',
    description: 'Alerts for critical healthcare integration failures',
    category: MonitoringCategory.INTEGRATION,
    severity: MonitoringSeverity.HIGH,
    conditions: [
      {
        metricType: 'INTEGRATION_STATUS',
        operator: 'eq',
        threshold: 0, // DOWN status
        duration: 60,
        healthcareSpecific: true,
        workflowContext: 'healthier_sg_api'
      },
      {
        metricType: 'INTEGRATION_RESPONSE_TIME',
        operator: 'gt',
        threshold: 10000, // 10 seconds
        duration: 120,
        healthcareSpecific: true,
        workflowContext: 'payment_gateway'
      }
    ],
    actions: [
      {
        actionType: AlertActionType.CREATE_INCIDENT,
        configuration: { priority: IncidentPriority.P2_HIGH },
        priority: 1
      },
      {
        actionType: AlertActionType.SEND_EMAIL,
        configuration: { 
          recipients: ['integration-team@clinic.com', 'healthcare-ops@clinic.com'],
          subject: 'Integration Failure: Healthcare Service Unavailable' 
        },
        priority: 2
      },
      {
        actionType: AlertActionType.RUN_PLAYBOOK,
        configuration: { playbookId: 'integration_failover' },
        priority: 3
      }
    ],
    isActive: true,
    escalationPolicy: {
      policyId: 'integration_escalation',
      name: 'Integration Failure Escalation',
      levels: [
        { level: 1, roles: ['integration_engineer'], timeInLevel: 20, actions: ['investigate_vendor'] },
        { level: 2, roles: ['technical_architect'], timeInLevel: 45, actions: ['implement_fallback'] },
        { level: 3, roles: ['product_manager'], timeInLevel: 90, actions: ['vendor_escalation'] }
      ],
      timeTriggers: [20, 45, 90],
      notificationChannels: ['email', 'integration_platform'],
      healthcareSpecific: true
    },
    suppressionRules: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// =============================================================================
// HEALTHCARE ALERTING SYSTEM CLASS
// =============================================================================

export class HealthcareAlertingSystem {
  private alertRules: Map<string, AlertRule> = new Map();
  private activeAlerts: Map<string, ActiveAlert> = new Map();
  private incidents: Map<string, Incident> = new Map();
  private alertHistory: AlertRecord[] = [];
  private suppressionRules: Map<string, SuppressionRule> = new Map();
  private escalationPolicies: Map<string, EscalationPolicy> = new Map();
  private notificationQueue: NotificationItem[] = [];
  private automationPlaybooks: Map<string, AutomationPlaybook> = new Map();

  constructor() {
    this.initializeAlertRules();
    this.initializeSuppressionRules();
    this.initializeEscalationPolicies();
    this.initializePlaybooks();
    this.startAlertProcessing();
  }

  // =============================================================================
  // ALERT RULE MANAGEMENT
  // =============================================================================

  /**
   * Process performance alerts with healthcare workflow impact assessment
   */
  async processPerformanceAlert(metricData: {
    metricType: string;
    value: number;
    threshold: number;
    healthcareWorkflowId?: string;
    pageRoute?: string;
    clinicId?: string;
    doctorId?: string;
  }): Promise<string | null> {
    const applicableRules = this.getApplicableRules(MonitoringCategory.PERFORMANCE, metricData);
    
    for (const rule of applicableRules) {
      if (await this.evaluateAlertCondition(rule, metricData)) {
        const alertId = await this.triggerAlert(rule, metricData);
        
        // Execute alert actions
        await this.executeAlertActions(rule, alertId, metricData);
        
        return alertId;
      }
    }
    
    return null;
  }

  /**
   * Process healthcare workflow failure alerts
   */
  async processWorkflowFailureAlert(workflowData: {
    workflowType: string;
    successRate: number;
    duration: number;
    failureCount: number;
    affectedPatients?: number;
    clinicId?: string;
    doctorId?: string;
  }): Promise<string | null> {
    const applicableRules = this.getApplicableRules(MonitoringCategory.HEALTHCARE_WORKFLOW, workflowData);
    
    for (const rule of applicableRules) {
      if (await this.evaluateAlertCondition(rule, workflowData)) {
        const alertId = await this.triggerAlert(rule, workflowData);
        
        // Execute healthcare-specific actions
        await this.executeHealthcareWorkflowActions(rule, alertId, workflowData);
        
        return alertId;
      }
    }
    
    return null;
  }

  /**
   * Process PDPA compliance violation alerts
   */
  async processComplianceAlert(complianceData: {
    complianceType: string;
    complianceScore: number;
    violations: Array<{
      type: string;
      severity: MonitoringSeverity;
      description: string;
      affectedRecords: number;
    }>;
    entityId: string;
    entityType: string;
  }): Promise<string | null> {
    const applicableRules = this.getApplicableRules(MonitoringCategory.COMPLIANCE, complianceData);
    
    for (const rule of applicableRules) {
      if (await this.evaluateAlertCondition(rule, complianceData)) {
        const alertId = await this.triggerAlert(rule, complianceData);
        
        // Execute compliance-specific actions
        await this.executeComplianceActions(rule, alertId, complianceData);
        
        return alertId;
      }
    }
    
    return null;
  }

  /**
   * Process security incident alerts
   */
  async processSecurityAlert(securityData: {
    eventType: string;
    severity: MonitoringSeverity;
    target: string;
    affectedDataTypes: string[];
    potentialDataBreach: boolean;
    userId?: string;
    ipAddress: string;
  }): Promise<string | null> {
    const applicableRules = this.getApplicableRules(MonitoringCategory.SECURITY, securityData);
    
    for (const rule of applicableRules) {
      if (await this.evaluateAlertCondition(rule, securityData)) {
        const alertId = await this.triggerAlert(rule, securityData);
        
        // Execute security-specific actions
        await this.executeSecurityActions(rule, alertId, securityData);
        
        return alertId;
      }
    }
    
    return null;
  }

  // =============================================================================
  // INCIDENT MANAGEMENT
  // =============================================================================

  /**
   * Create incident from alert
   */
  async createIncidentFromAlert(alertRule: AlertRule, alertData: any, alertId: string): Promise<string> {
    const incidentId = `incident_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Determine incident priority based on healthcare impact
    const priority = this.determineIncidentPriority(alertRule, alertData);
    
    // Determine incident severity
    const severity = this.determineIncidentSeverity(alertRule, alertData);
    
    // Assess healthcare workflow impact
    const healthcareImpact = this.assessHealthcareWorkflowImpact(alertData);
    
    // Assess compliance impact
    const complianceImpact = this.assessComplianceImpact(alertData);
    
    const incident: Incident = {
      incidentId,
      title: this.generateIncidentTitle(alertRule, alertData),
      description: this.generateIncidentDescription(alertRule, alertData),
      category: alertRule.category,
      severity,
      priority,
      status: IncidentStatus.OPEN,
      reportedAt: new Date(),
      timeline: [
        {
          timestamp: new Date(),
          action: 'Incident Created',
          performedBy: 'system',
          description: `Incident created from alert: ${alertRule.name}`,
          status: IncidentStatus.OPEN
        }
      ],
      relatedAlerts: [alertId],
      healthcareWorkflowImpact: healthcareImpact,
      complianceImpact,
      estimatedResolutionTime: this.estimateResolutionTime(alertRule, alertData),
      rootCause: undefined,
      preventionMeasures: []
    };

    this.incidents.set(incidentId, incident);
    
    // Start incident response automation
    await this.initiateIncidentResponse(incident);
    
    return incidentId;
  }

  /**
   * Update incident status and timeline
   */
  async updateIncident(incidentId: string, updates: {
    status?: IncidentStatus;
    assignedTo?: string;
    notes?: string;
    resolutionTime?: number;
    rootCause?: string;
    preventionMeasures?: string[];
  }): Promise<void> {
    const incident = this.incidents.get(incidentId);
    if (!incident) return;

    // Update incident
    if (updates.status) incident.status = updates.status;
    if (updates.assignedTo) incident.assignedTo = updates.assignedTo;
    if (updates.resolutionTime) incident.actualResolutionTime = updates.resolutionTime;
    if (updates.rootCause) incident.rootCause = updates.rootCause;
    if (updates.preventionMeasures) incident.preventionMeasures = updates.preventionMeasures;

    // Add timeline entry
    const timelineEntry: IncidentTimelineEntry = {
      timestamp: new Date(),
      action: updates.status ? `Status changed to ${updates.status}` : 'Incident Updated',
      performedBy: 'system',
      description: updates.notes || 'Incident updated',
      status: updates.status
    };
    
    incident.timeline.push(timelineEntry);

    // If resolved, calculate actual resolution time
    if (updates.status === IncidentStatus.RESOLVED && !incident.actualResolutionTime) {
      incident.actualResolutionTime = Date.now() - incident.reportedAt.getTime();
    }

    this.incidents.set(incidentId, incident);
    
    // Trigger post-resolution actions
    if (updates.status === IncidentStatus.RESOLVED) {
      await this.triggerPostResolutionActions(incident);
    }
  }

  /**
   * Resolve incident with root cause analysis
   */
  async resolveIncident(incidentId: string, resolution: {
    rootCause: string;
    preventionMeasures: string[];
    lessonsLearned?: string;
    systemImprovements?: string[];
  }): Promise<void> {
    await this.updateIncident(incidentId, {
      status: IncidentStatus.RESOLVED,
      rootCause: resolution.rootCause,
      preventionMeasures: resolution.preventionMeasures
    });

    // Log resolution for continuous improvement
    console.log('[INCIDENT RESOLUTION] Incident resolved:', {
      incidentId,
      rootCause: resolution.rootCause,
      preventionMeasures: resolution.preventionMeasures
    });

    // Trigger incident post-mortem if critical
    const incident = this.incidents.get(incidentId);
    if (incident && incident.priority === IncidentPriority.P1_CRITICAL) {
      await this.scheduleIncidentPostMortem(incident);
    }
  }

  // =============================================================================
  // AUTOMATED INCIDENT RESPONSE
  // =============================================================================

  /**
   * Automated healthcare workflow failure recovery procedures
   */
  async executeWorkflowRecoveryProcedure(incident: Incident): Promise<void> {
    const playbook = this.automationPlaybooks.get('healthcare_workflow_recovery');
    if (!playbook) return;

    console.log('[WORKFLOW RECOVERY] Executing automated recovery procedure:', {
      incidentId: incident.incidentId,
      workflowImpact: incident.healthcareWorkflowImpact
    });

    // Step 1: Isolate affected workflow
    await this.isolateAffectedWorkflow(incident);
    
    // Step 2: Activate fallback systems
    await this.activateFallbackSystems(incident);
    
    // Step 3: Notify healthcare staff
    await this.notifyHealthcareStaff(incident);
    
    // Step 4: Monitor recovery progress
    await this.monitorWorkflowRecovery(incident);
  }

  /**
   * Patient booking system error resolution with priority handling
   */
  async executeBookingSystemRecovery(incident: Incident): Promise<void> {
    console.log('[BOOKING RECOVERY] Handling patient booking system failure:', {
      incidentId: incident.incidentId,
      priority: incident.priority
    });

    // Immediate actions for critical priority
    if (incident.priority === IncidentPriority.P1_CRITICAL) {
      // Activate manual booking backup
      await this.activateManualBookingBackup();
      
      // Notify clinic staff immediately
      await this.notifyClinicStaffOfBookingIssue(incident);
      
      // Set up alternative booking channels
      await this.setupAlternativeBookingChannels();
    }

    // Monitor booking system recovery
    await this.monitorBookingSystemRecovery(incident);
  }

  /**
   * Emergency system failover procedures
   */
  async executeEmergencyFailover(incident: Incident): Promise<void> {
    console.log('[EMERGENCY FAILOVER] Initiating emergency failover procedures:', {
      incidentId: incident.incidentId,
      severity: incident.severity
    });

    // Healthcare-specific failover procedures
    if (incident.healthcareWorkflowImpact.length > 0) {
      // Activate emergency protocols
      await this.activateEmergencyHealthcareProtocols(incident);
      
      // Ensure patient safety systems remain operational
      await this.ensurePatientSafetySystemsActive();
      
      // Set up emergency communication channels
      await this.setupEmergencyCommunicationChannels();
    }
  }

  // =============================================================================
  // NOTIFICATION SYSTEM
  // =============================================================================

  /**
   * Send healthcare-specific notifications
   */
  async sendHealthcareNotification(notification: {
    type: 'critical_alert' | 'workflow_failure' | 'compliance_violation' | 'security_incident';
    recipients: Array<{
      type: 'email' | 'sms' | 'phone';
      address: string;
      priority: 'low' | 'medium' | 'high' | 'critical';
    }>;
    subject: string;
    message: string;
    healthcareContext: {
      patientImpact?: number;
      clinicalWorkflowAffected?: string;
      regulatoryImplications?: string[];
    };
    attachments?: Array<{
      type: 'report' | 'log' | 'screenshot';
      content: string;
      name: string;
    }>;
  }): Promise<void> {
    const notificationId = `notify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Queue notification for processing
    this.notificationQueue.push({
      notificationId,
      timestamp: new Date(),
      priority: this.mapPriority(notification.recipients),
      recipients: notification.recipients,
      content: {
        subject: notification.subject,
        message: notification.message,
        healthcareContext: notification.healthcareContext
      },
      status: 'PENDING'
    });

    console.log('[HEALTHCARE NOTIFICATION] Notification queued:', {
      notificationId,
      type: notification.type,
      recipients: notification.recipients.length,
      healthcareContext: notification.healthcareContext
    });
  }

  /**
   * Notify healthcare stakeholders based on incident type
   */
  async notifyHealthcareStakeholders(incident: Incident): Promise<void> {
    const stakeholderNotifications = this.getStakeholderNotifications(incident);
    
    for (const notification of stakeholderNotifications) {
      await this.sendHealthcareNotification(notification);
    }
  }

  // =============================================================================
  // PRIVATE HELPER METHODS
  // =============================================================================

  private async evaluateAlertCondition(rule: AlertRule, data: any): Promise<boolean> {
    // Check if alert is suppressed
    if (await this.isAlertSuppressed(rule, data)) {
      return false;
    }

    // Evaluate each condition
    for (const condition of rule.conditions) {
      const value = this.extractValueFromData(data, condition.metricType);
      if (value === undefined) continue;

      const thresholdMet = this.evaluateCondition(value, condition.operator, condition.threshold);
      const durationMet = await this.checkDuration(condition.duration || 0, condition.metricType, value);

      if (!thresholdMet || !durationMet) {
        return false;
      }
    }

    return true;
  }

  private async triggerAlert(rule: AlertRule, data: any): Promise<string> {
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const activeAlert: ActiveAlert = {
      alertId,
      ruleId: rule.ruleId,
      triggeredAt: new Date(),
      data,
      status: 'ACTIVE',
      acknowledged: false,
      acknowledgedBy: undefined,
      acknowledgedAt: undefined,
      resolved: false,
      resolvedAt: undefined
    };

    this.activeAlerts.set(alertId, activeAlert);
    this.alertHistory.push({
      alertId,
      ruleId: rule.ruleId,
      timestamp: new Date(),
      severity: rule.severity,
      category: rule.category,
      data,
      status: 'ACTIVE'
    });

    console.log('[ALERT TRIGGERED] Alert fired:', {
      alertId,
      ruleName: rule.name,
      severity: rule.severity,
      category: rule.category
    });

    return alertId;
  }

  private async executeAlertActions(rule: AlertRule, alertId: string, data: any): Promise<void> {
    // Sort actions by priority
    const sortedActions = rule.actions.sort((a, b) => a.priority - b.priority);

    for (const action of sortedActions) {
      try {
        await this.executeAlertAction(action, rule, alertId, data);
      } catch (error) {
        console.error(`[ALERT ACTION FAILED] Action ${action.actionType} failed:`, error);
      }
    }
  }

  private async executeAlertAction(
    action: AlertAction, 
    rule: AlertRule, 
    alertId: string, 
    data: any
  ): Promise<void> {
    switch (action.actionType) {
      case AlertActionType.CREATE_INCIDENT:
        const incidentId = await this.createIncidentFromAlert(rule, data, alertId);
        console.log(`[ALERT ACTION] Incident created: ${incidentId}`);
        break;

      case AlertActionType.SEND_EMAIL:
        await this.sendEmailNotification(action.configuration, data);
        break;

      case AlertActionType.SEND_SMS:
        await this.sendSMSNotification(action.configuration, data);
        break;

      case AlertActionType.ESCALATE:
        await this.escalateAlert(rule, alertId, action.configuration);
        break;

      case AlertActionType.RUN_PLAYBOOK:
        await this.runAutomationPlaybook(action.configuration, rule, data);
        break;

      default:
        console.warn(`[ALERT ACTION] Unknown action type: ${action.actionType}`);
    }
  }

  private async createIncidentFromAlert(rule: AlertRule, data: any, alertId: string): Promise<string> {
    const incidentId = await this.createIncidentFromAlert(rule, data, alertId);
    
    // Additional incident creation logic would go here
    return incidentId;
  }

  private async runAutomationPlaybook(
    config: any, 
    rule: AlertRule, 
    data: any
  ): Promise<void> {
    const playbookId = config.playbookId;
    const playbook = this.automationPlaybooks.get(playbookId);
    
    if (!playbook) {
      console.warn(`[PLAYBOOK] Playbook not found: ${playbookId}`);
      return;
    }

    console.log(`[PLAYBOOK] Executing playbook: ${playbookId}`);
    
    // Execute playbook steps
    for (const step of playbook.steps) {
      try {
        await this.executePlaybookStep(step, data);
      } catch (error) {
        console.error(`[PLAYBOOK STEP FAILED] Step ${step.name} failed:`, error);
        if (step.critical) {
          throw error; // Stop execution if critical step fails
        }
      }
    }
  }

  private getApplicableRules(category: MonitoringCategory, data: any): AlertRule[] {
    return Array.from(this.alertRules.values()).filter(rule => 
      rule.isActive && 
      rule.category === category &&
      this.isRuleApplicable(rule, data)
    );
  }

  private isRuleApplicable(rule: AlertRule, data: any): boolean {
    // Check healthcare workflow context
    if (rule.conditions.some(c => c.healthcareSpecific)) {
      return this.hasHealthcareContext(data);
    }
    return true;
  }

  private hasHealthcareContext(data: any): boolean {
    return !!(data.clinicId || data.doctorId || data.healthcareWorkflowId || data.patientId);
  }

  private extractValueFromData(data: any, metricType: string): number | undefined {
    // Simplified value extraction - would be more complex in real implementation
    const valueMap: Record<string, string> = {
      'PAGE_LOAD_TIME': 'pageLoadTime',
      'API_RESPONSE_TIME': 'responseTime',
      'WORKFLOW_SUCCESS_RATE': 'successRate',
      'PDPA_COMPLIANCE_SCORE': 'complianceScore',
      'CONSENT_VIOLATION': 'consentViolation',
      'INTEGRATION_STATUS': 'integrationStatus'
    };

    const key = valueMap[metricType];
    return key ? data[key] : undefined;
  }

  private evaluateCondition(value: number, operator: string, threshold: number): boolean {
    switch (operator) {
      case 'gt': return value > threshold;
      case 'gte': return value >= threshold;
      case 'lt': return value < threshold;
      case 'lte': return value <= threshold;
      case 'eq': return value === threshold;
      default: return false;
    }
  }

  private async checkDuration(duration: number, metricType: string, value: number): Promise<boolean> {
    if (duration === 0) return true; // Immediate trigger
    
    // In real implementation, would check historical data for duration
    return true; // Simplified for demo
  }

  private async isAlertSuppressed(rule: AlertRule, data: any): Promise<boolean> {
    for (const suppressionRule of rule.suppressionRules) {
      if (this.evaluateSuppressionRule(suppressionRule, data)) {
        return true;
      }
    }
    return false;
  }

  private evaluateSuppressionRule(rule: SuppressionRule, data: any): boolean {
    // Simplified suppression rule evaluation
    for (const [key, expectedValue] of Object.entries(rule.conditions)) {
      if (data[key] !== expectedValue) {
        return false;
      }
    }
    return true;
  }

  private determineIncidentPriority(rule: AlertRule, data: any): IncidentPriority {
    if (rule.severity === MonitoringSeverity.CRITICAL) {
      if (data.potentialDataBreach || data.affectedPatients > 100) {
        return IncidentPriority.P1_CRITICAL;
      }
      return IncidentPriority.P1_CRITICAL;
    }
    
    if (rule.severity === MonitoringSeverity.HIGH) {
      return IncidentPriority.P2_HIGH;
    }
    
    if (rule.severity === MonitoringSeverity.MEDIUM) {
      return IncidentPriority.P3_MEDIUM;
    }
    
    return IncidentPriority.P4_LOW;
  }

  private determineIncidentSeverity(rule: AlertRule, data: any): MonitoringSeverity {
    return rule.severity;
  }

  private assessHealthcareWorkflowImpact(data: any): string[] {
    const impacts: string[] = [];
    
    if (data.workflowType) impacts.push(data.workflowType);
    if (data.clinicId) impacts.push(`clinic_${data.clinicId}`);
    if (data.doctorId) impacts.push(`doctor_${data.doctorId}`);
    
    return impacts;
  }

  private assessComplianceImpact(data: any): ComplianceImpact[] {
    const impacts: ComplianceImpact[] = [];
    
    if (data.complianceType) {
      impacts.push({
        complianceType: data.complianceType,
        impactLevel: data.complianceScore < 70 ? MonitoringSeverity.CRITICAL : MonitoringSeverity.HIGH,
        affectedEntities: [data.entityId],
        regulatoryImplications: ['Potential regulatory violation'],
        notificationRequired: data.complianceScore < 70
      });
    }
    
    return impacts;
  }

  private generateIncidentTitle(rule: AlertRule, data: any): string {
    const baseTitle = rule.name.replace(' Alert', '');
    
    if (data.healthcareWorkflowId) {
      return `${baseTitle} - Healthcare Workflow Impact`;
    }
    
    if (data.clinicId) {
      return `${baseTitle} - Clinic ${data.clinicId}`;
    }
    
    return baseTitle;
  }

  private generateIncidentDescription(rule: AlertRule, data: any): string {
    let description = rule.description;
    
    if (data.affectedPatients) {
      description += ` - Affected Patients: ${data.affectedPatients}`;
    }
    
    if (data.complianceScore) {
      description += ` - Compliance Score: ${data.complianceScore}`;
    }
    
    if (data.potentialDataBreach) {
      description += ' - Potential Data Breach';
    }
    
    return description;
  }

  private estimateResolutionTime(rule: AlertRule, data: any): number {
    // Estimate based on rule category and severity
    const baseTimes: Record<MonitoringCategory, number> = {
      [MonitoringCategory.SECURITY]: 3600, // 1 hour
      [MonitoringCategory.COMPLIANCE]: 1800, // 30 minutes
      [MonitoringCategory.HEALTHCARE_WORKFLOW]: 900, // 15 minutes
      [MonitoringCategory.PERFORMANCE]: 600, // 10 minutes
      [MonitoringCategory.AVAILABILITY]: 1200, // 20 minutes
      [MonitoringCategory.BUSINESS_LOGIC]: 1800, // 30 minutes
      [MonitoringCategory.INTEGRATION]: 2400 // 40 minutes
    };

    let estimatedTime = baseTimes[rule.category] || 1800; // Default 30 minutes

    // Adjust based on severity
    if (rule.severity === MonitoringSeverity.CRITICAL) {
      estimatedTime *= 0.5; // Half the time for critical
    } else if (rule.severity === MonitoringSeverity.LOW) {
      estimatedTime *= 1.5; // 1.5x for low severity
    }

    return Math.floor(estimatedTime);
  }

  // Additional helper methods would be implemented here:
  // - initializeAlertRules()
  // - initializeSuppressionRules()
  // - initializeEscalationPolicies()
  // - initializePlaybooks()
  // - startAlertProcessing()
  // - sendEmailNotification()
  // - sendSMSNotification()
  // - escalateAlert()
  // - mapPriority()
  // - getStakeholderNotifications()
  // - initiateIncidentResponse()
  // - triggerPostResolutionActions()
  // - scheduleIncidentPostMortem()
  // - isolateAffectedWorkflow()
  // - activateFallbackSystems()
  // - notifyHealthcareStaff()
  // - monitorWorkflowRecovery()
  // - activateManualBookingBackup()
  // - notifyClinicStaffOfBookingIssue()
  // - setupAlternativeBookingChannels()
  // - monitorBookingSystemRecovery()
  // - activateEmergencyHealthcareProtocols()
  // - ensurePatientSafetySystemsActive()
  // - setupEmergencyCommunicationChannels()
  // - executePlaybookStep()
  // - and other utility methods...

  private initializeAlertRules(): void {
    ALERT_RULES_CONFIGURATION.forEach(rule => {
      this.alertRules.set(rule.ruleId, rule);
    });
  }

  private initializeSuppressionRules(): void {
    // Initialize suppression rules
    console.log('[ALERTING] Suppression rules initialized');
  }

  private initializeEscalationPolicies(): void {
    // Initialize escalation policies
    console.log('[ALERTING] Escalation policies initialized');
  }

  private initializePlaybooks(): void {
    // Initialize automation playbooks
    this.automationPlaybooks.set('healthcare_workflow_recovery', {
      playbookId: 'healthcare_workflow_recovery',
      name: 'Healthcare Workflow Recovery',
      description: 'Automated recovery procedures for healthcare workflow failures',
      steps: [
        {
          name: 'isolate_affected_workflow',
          description: 'Isolate the affected healthcare workflow',
          automated: true,
          critical: true,
          estimatedDuration: 300
        },
        {
          name: 'activate_fallback',
          description: 'Activate fallback systems',
          automated: true,
          critical: true,
          estimatedDuration: 600
        },
        {
          name: 'notify_staff',
          description: 'Notify healthcare staff',
          automated: true,
          critical: false,
          estimatedDuration: 60
        }
      ],
      triggers: ['workflow_failure', 'system_degradation'],
      rollbackPlan: 'Restore original workflow state'
    });
  }

  private startAlertProcessing(): void {
    // Start processing notification queue
    setInterval(() => {
      this.processNotificationQueue();
    }, 5000);
  }

  private async processNotificationQueue(): Promise<void> {
    const pendingNotifications = this.notificationQueue.filter(n => n.status === 'PENDING');
    
    for (const notification of pendingNotifications) {
      try {
        // Process notification based on type
        await this.processNotification(notification);
        notification.status = 'SENT';
        notification.sentAt = new Date();
      } catch (error) {
        notification.status = 'FAILED';
        notification.error = error instanceof Error ? error.message : 'Unknown error';
        console.error('[NOTIFICATION FAILED] Notification failed:', error);
      }
    }

    // Clean up old notifications
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    this.notificationQueue = this.notificationQueue.filter(n => 
      n.timestamp > cutoffTime && n.status !== 'SENT'
    );
  }

  private async processNotification(notification: NotificationItem): Promise<void> {
    // Simulate notification processing
    console.log('[NOTIFICATION] Processing notification:', {
      notificationId: notification.notificationId,
      recipients: notification.recipients.length,
      priority: notification.priority
    });

    // In real implementation, would send actual notifications
  }

  private mapPriority(recipients: Array<{ priority: string }>): 'low' | 'medium' | 'high' | 'critical' {
    const highestPriority = recipients.reduce((highest, recipient) => {
      const priorities = { low: 1, medium: 2, high: 3, critical: 4 };
      return priorities[recipient.priority as keyof typeof priorities] > 
             priorities[highest as keyof typeof priorities] ? 
             recipient.priority : highest;
    }, 'low');

    return highestPriority as 'low' | 'medium' | 'high' | 'critical';
  }

  private async executeHealthcareWorkflowActions(rule: AlertRule, alertId: string, workflowData: any): Promise<void> {
    // Healthcare-specific workflow action logic
    console.log('[HEALTHCARE ACTIONS] Executing healthcare workflow actions:', workflowData);
  }

  private async executeComplianceActions(rule: AlertRule, alertId: string, complianceData: any): Promise<void> {
    // Compliance-specific action logic
    console.log('[COMPLIANCE ACTIONS] Executing compliance actions:', complianceData);
  }

  private async executeSecurityActions(rule: AlertRule, alertId: string, securityData: any): Promise<void> {
    // Security-specific action logic
    console.log('[SECURITY ACTIONS] Executing security actions:', securityData);
  }

  // =============================================================================
  // PUBLIC GETTER METHODS
  // =============================================================================

  /**
   * Get active alerts
   */
  getActiveAlerts(): ActiveAlert[] {
    return Array.from(this.activeAlerts.values()).filter(alert => !alert.resolved);
  }

  /**
   * Get incidents
   */
  getIncidents(status?: IncidentStatus): Incident[] {
    const incidents = Array.from(this.incidents.values());
    return status ? incidents.filter(incident => incident.status === status) : incidents;
  }

  /**
   * Get alert dashboard
   */
  getAlertDashboard(): {
    activeAlerts: number;
    criticalAlerts: number;
    openIncidents: number;
    resolvedIncidents24h: number;
    escalationAlerts: number;
    alertTrends: Array<{ timestamp: Date; count: number; severity: MonitoringSeverity }>;
  } {
    const activeAlerts = this.getActiveAlerts();
    const criticalAlerts = activeAlerts.filter(alert => {
      const rule = this.alertRules.get(alert.ruleId);
      return rule?.severity === MonitoringSeverity.CRITICAL;
    }).length;

    const openIncidents = this.getIncidents(IncidentStatus.OPEN).length;
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const resolvedIncidents24h = Array.from(this.incidents.values())
      .filter(incident => 
        incident.status === IncidentStatus.RESOLVED && 
        incident.resolvedAt && 
        incident.resolvedAt > last24h
      ).length;

    // Calculate alert trends (simplified)
    const alertTrends = this.calculateAlertTrends();

    return {
      activeAlerts: activeAlerts.length,
      criticalAlerts,
      openIncidents,
      resolvedIncidents24h,
      escalationAlerts: 0, // Would be calculated based on escalation data
      alertTrends
    };
  }

  private calculateAlertTrends(): Array<{ timestamp: Date; count: number; severity: MonitoringSeverity }> {
    // Simplified trend calculation - would analyze actual alert history
    return [
      { timestamp: new Date(Date.now() - 3600000), count: 2, severity: MonitoringSeverity.HIGH },
      { timestamp: new Date(Date.now() - 7200000), count: 1, severity: MonitoringSeverity.MEDIUM },
      { timestamp: new Date(Date.now() - 10800000), count: 3, severity: MonitoringSeverity.LOW }
    ];
  }
}

// =============================================================================
// SUPPORTING INTERFACES
// =============================================================================

interface ActiveAlert {
  alertId: string;
  ruleId: string;
  triggeredAt: Date;
  data: any;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'SUPPRESSED';
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

interface AlertRecord {
  alertId: string;
  ruleId: string;
  timestamp: Date;
  severity: MonitoringSeverity;
  category: MonitoringCategory;
  data: any;
  status: string;
}

interface NotificationItem {
  notificationId: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  recipients: Array<{
    type: 'email' | 'sms' | 'phone';
    address: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
  }>;
  content: {
    subject: string;
    message: string;
    healthcareContext: any;
  };
  status: 'PENDING' | 'SENT' | 'FAILED';
  sentAt?: Date;
  error?: string;
}

interface AutomationPlaybook {
  playbookId: string;
  name: string;
  description: string;
  steps: PlaybookStep[];
  triggers: string[];
  rollbackPlan: string;
}

interface PlaybookStep {
  name: string;
  description: string;
  automated: boolean;
  critical: boolean;
  estimatedDuration: number;
}

// =============================================================================
// EXPORT SINGLETON INSTANCE
// =============================================================================

export const healthcareAlertingSystem = new HealthcareAlertingSystem();