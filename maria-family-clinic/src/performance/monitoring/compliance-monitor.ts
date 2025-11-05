/**
 * Healthcare Compliance Monitoring Service
 * Sub-Phase 10.6: Healthcare-Specific Monitoring for My Family Clinic
 * Handles PDPA compliance, healthcare data security, and regulatory monitoring
 */

import { 
  ComplianceMetrics,
  ComplianceType,
  ComplianceStatus,
  RegulatoryFramework,
  ComplianceViolation,
  ComplianceAuditEntry,
  MonitoringSeverity,
  MonitoringCategory,
  SecurityEvent,
  SecurityEventType,
  SecurityEventSource
} from './types';

// =============================================================================
// COMPLIANCE MONITORING CONFIGURATION
// =============================================================================

const PDPA_COMPLIANCE_RULES = {
  dataMinimization: {
    check: (data: any) => {
      const unnecessaryFields = ['marketing_preferences', 'social_media_links', 'personal_notes'];
      return !unnecessaryFields.some(field => data[field] !== undefined);
    },
    severity: MonitoringSeverity.HIGH,
    description: 'Collecting unnecessary personal data'
  },
  purposeLimitation: {
    check: (data: any) => {
      return data.purposeDefined && data.purposeDocumentation;
    },
    severity: MonitoringSeverity.HIGH,
    description: 'Data processing purpose not clearly defined'
  },
  consentManagement: {
    check: (data: any) => {
      return data.consents && Object.keys(data.consents).length > 0;
    },
    severity: MonitoringSeverity.CRITICAL,
    description: 'Missing required PDPA consent'
  },
  dataProtection: {
    check: (data: any) => {
      return data.encrypted && data.accessControlled && data.auditLogged;
    },
    severity: MonitoringSeverity.CRITICAL,
    description: 'Inadequate data protection measures'
  },
  retentionCompliance: {
    check: (data: any) => {
      return data.retentionDays <= 2555; // 7 years maximum
    },
    severity: MonitoringSeverity.MEDIUM,
    description: 'Data retention period exceeds PDPA requirements'
  }
};

const HEALTHCARE_DATA_SECURITY_RULES = {
  encryptionAtRest: {
    check: (data: any) => data.encryptedAtRest === true,
    severity: MonitoringSeverity.CRITICAL,
    description: 'Healthcare data not encrypted at rest'
  },
  encryptionInTransit: {
    check: (data: any) => data.encryptedInTransit === true,
    severity: MonitoringSeverity.CRITICAL,
    description: 'Healthcare data not encrypted in transit'
  },
  accessControl: {
    check: (data: any) => data.roleBasedAccess && data.leastPrivilege,
    severity: MonitoringSeverity.HIGH,
    description: 'Inadequate access controls for healthcare data'
  },
  auditLogging: {
    check: (data: any) => data.auditEnabled && data.immutableLogs,
    severity: MonitoringSeverity.HIGH,
    description: 'Healthcare data access not properly audited'
  }
};

const MEDICAL_DATA_HANDLING_RULES = {
  classification: {
    check: (data: any) => data.classification && ['RESTRICTED', 'CONFIDENTIAL', 'MEDICAL_RECORD'].includes(data.classification),
    severity: MonitoringSeverity.CRITICAL,
    description: 'Medical data not properly classified'
  },
  retention: {
    check: (data: any) => data.retentionPeriod <= 2920, // 8 years for medical records
    severity: MonitoringSeverity.MEDIUM,
    description: 'Medical record retention exceeds regulatory limits'
  },
  sharing: {
    check: (data: any) => data.consentForSharing && data.sharedWithAuthorizedPartiesOnly,
    severity: MonitoringSeverity.HIGH,
    description: 'Medical data sharing without proper authorization'
  }
};

// =============================================================================
// HEALTHCARE COMPLIANCE MONITORING CLASS
// =============================================================================

export class HealthcareComplianceMonitor {
  private complianceMetrics: ComplianceMetrics[] = [];
  private violations: ComplianceViolation[] = [];
  private auditEntries: ComplianceAuditEntry[] = [];
  private securityEvents: SecurityEvent[] = [];
  private activeMonitoring: Map<string, NodeJS.Timeout> = new Map();
  private complianceConfigs: Map<ComplianceType, any> = new Map();

  constructor() {
    this.initializeComplianceConfigs();
    this.startContinuousComplianceMonitoring();
  }

  // =============================================================================
  // PDPA COMPLIANCE MONITORING
  // =============================================================================

  /**
   * Monitor PDPA compliance for healthcare data processing
   */
  async monitorPDPACompliance(entityId: string, entityType: 'clinic' | 'doctor' | 'patient' | 'program', data: any): Promise<ComplianceMetrics> {
    const violations: ComplianceViolation[] = [];
    let complianceScore = 100;

    // Check each PDPA rule
    for (const [ruleName, rule] of Object.entries(PDPA_COMPLIANCE_RULES)) {
      const isCompliant = rule.check(data);
      if (!isCompliant) {
        const violation: ComplianceViolation = {
          violationId: `pdpa_${ruleName}_${Date.now()}`,
          type: ComplianceType.PDPA_COMPLIANCE,
          severity: rule.severity,
          description: rule.description,
          detectedAt: new Date(),
          affectedRecords: 1,
          regulatoryImplication: 'Personal Data Protection Act violation',
          correctiveActionRequired: true,
          assignedTo: entityType === 'clinic' ? 'clinic_admin' : 'data_protection_officer'
        };
        violations.push(violation);
        complianceScore -= this.getSeverityPenalty(rule.severity);
      }
    }

    // Create compliance metrics
    const metrics: ComplianceMetrics = {
      timestamp: new Date(),
      complianceType: ComplianceType.PDPA_COMPLIANCE,
      status: complianceScore >= 90 ? ComplianceStatus.COMPLIANT : 
              complianceScore >= 70 ? ComplianceStatus.PARTIAL : ComplianceStatus.NON_COMPLIANT,
      score: Math.max(0, complianceScore),
      violations,
      regulatoryFramework: RegulatoryFramework.PDPA,
      entityId,
      entityType,
      auditTrail: [],
      nextReviewDate: this.calculateNextReviewDate(ComplianceType.PDPA_COMPLIANCE)
    };

    this.complianceMetrics.push(metrics);
    this.violations.push(...violations);

    // Trigger alerts for critical violations
    const criticalViolations = violations.filter(v => v.severity === MonitoringSeverity.CRITICAL);
    if (criticalViolations.length > 0) {
      await this.triggerComplianceAlert(metrics, criticalViolations);
    }

    return metrics;
  }

  /**
   * Monitor healthcare data security compliance
   */
  async monitorHealthcareDataSecurity(entityId: string, entityType: string, securityData: any): Promise<ComplianceMetrics> {
    const violations: ComplianceViolation[] = [];
    let securityScore = 100;

    // Check healthcare data security rules
    for (const [ruleName, rule] of Object.entries(HEALTHCARE_DATA_SECURITY_RULES)) {
      const isCompliant = rule.check(securityData);
      if (!isCompliant) {
        const violation: ComplianceViolation = {
          violationId: `security_${ruleName}_${Date.now()}`,
          type: ComplianceType.HEALTHCARE_DATA_SECURITY,
          severity: rule.severity,
          description: rule.description,
          detectedAt: new Date(),
          affectedRecords: securityData.recordCount || 1,
          regulatoryImplication: 'Healthcare data security regulation violation',
          correctiveActionRequired: true,
          assignedTo: 'security_team'
        };
        violations.push(violation);
        securityScore -= this.getSeverityPenalty(rule.severity);
      }
    }

    const metrics: ComplianceMetrics = {
      timestamp: new Date(),
      complianceType: ComplianceType.HEALTHCARE_DATA_SECURITY,
      status: securityScore >= 90 ? ComplianceStatus.COMPLIANT : 
              securityScore >= 70 ? ComplianceStatus.PARTIAL : ComplianceStatus.NON_COMPLIANT,
      score: Math.max(0, securityScore),
      violations,
      regulatoryFramework: RegulatoryFramework.MOH_GUIDELINES,
      entityId,
      entityType,
      auditTrail: [],
      nextReviewDate: this.calculateNextReviewDate(ComplianceType.HEALTHCARE_DATA_SECURITY)
    };

    this.complianceMetrics.push(metrics);
    this.violations.push(...violations);

    return metrics;
  }

  /**
   * Monitor medical data handling compliance
   */
  async monitorMedicalDataHandling(entityId: string, entityType: string, medicalData: any): Promise<ComplianceMetrics> {
    const violations: ComplianceViolation[] = [];
    let handlingScore = 100;

    // Check medical data handling rules
    for (const [ruleName, rule] of Object.entries(MEDICAL_DATA_HANDLING_RULES)) {
      const isCompliant = rule.check(medicalData);
      if (!isCompliant) {
        const violation: ComplianceViolation = {
          violationId: `medical_${ruleName}_${Date.now()}`,
          type: ComplianceType.MEDICAL_RECORD_HANDLING,
          severity: rule.severity,
          description: rule.description,
          detectedAt: new Date(),
          affectedRecords: medicalData.recordCount || 1,
          regulatoryImplication: 'Medical record handling regulation violation',
          correctiveActionRequired: true,
          assignedTo: 'medical_records_officer'
        };
        violations.push(violation);
        handlingScore -= this.getSeverityPenalty(rule.severity);
      }
    }

    const metrics: ComplianceMetrics = {
      timestamp: new Date(),
      complianceType: ComplianceType.MEDICAL_RECORD_HANDLING,
      status: handlingScore >= 90 ? ComplianceStatus.COMPLIANT : 
              handlingScore >= 70 ? ComplianceStatus.PARTIAL : ComplianceStatus.NON_COMPLIANT,
      score: Math.max(0, handlingScore),
      violations,
      regulatoryFramework: RegulatoryFramework.HEALTHCARE_ACT,
      entityId,
      entityType,
      auditTrail: [],
      nextReviewDate: this.calculateNextReviewDate(ComplianceType.MEDICAL_RECORD_HANDLING)
    };

    this.complianceMetrics.push(metrics);
    this.violations.push(...violations);

    return metrics;
  }

  // =============================================================================
  // GOVERNMENT REGULATION MONITORING
  // =============================================================================

  /**
   * Monitor government healthcare regulation compliance
   */
  async monitorGovernmentRegulationCompliance(regulation: RegulatoryFramework, entityId: string, entityData: any): Promise<ComplianceMetrics> {
    const complianceChecks = this.getRegulationChecks(regulation);
    const violations: ComplianceViolation[] = [];
    let complianceScore = 100;

    for (const check of complianceChecks) {
      const isCompliant = await check.check(entityData);
      if (!isCompliant) {
        const violation: ComplianceViolation = {
          violationId: `gov_${regulation.toLowerCase()}_${check.name}_${Date.now()}`,
          type: ComplianceType.GOVERNMENT_REGULATION,
          severity: check.severity,
          description: check.description,
          detectedAt: new Date(),
          affectedRecords: entityData.recordCount || 1,
          regulatoryImplication: `${regulation} regulation violation`,
          correctiveActionRequired: true,
          assignedTo: check.assignee
        };
        violations.push(violation);
        complianceScore -= this.getSeverityPenalty(check.severity);
      }
    }

    const metrics: ComplianceMetrics = {
      timestamp: new Date(),
      complianceType: ComplianceType.GOVERNMENT_REGULATION,
      status: complianceScore >= 90 ? ComplianceStatus.COMPLIANT : 
              complianceScore >= 70 ? ComplianceStatus.PARTIAL : ComplianceStatus.NON_COMPLIANT,
      score: Math.max(0, complianceScore),
      violations,
      regulatoryFramework: regulation,
      entityId,
      entityType: entityData.type,
      auditTrail: [],
      nextReviewDate: this.calculateNextReviewDate(ComplianceType.GOVERNMENT_REGULATION)
    };

    this.complianceMetrics.push(metrics);
    this.violations.push(...violations);

    // Notify government authorities if required
    if (complianceScore < 70) {
      await this.notifyGovernmentAuthorities(regulation, metrics);
    }

    return metrics;
  }

  /**
   * Monitor medical credential verification and accreditation
   */
  async monitorMedicalCredentials(doctorId: string, credentials: any): Promise<ComplianceMetrics> {
    const violations: ComplianceViolation[] = [];
    let credentialScore = 100;

    // Check medical license validity
    if (!credentials.licenseValid || credentials.licenseExpiry < new Date()) {
      violations.push({
        violationId: `credential_license_${Date.now()}`,
        type: ComplianceType.MEDICAL_CREDENTIAL_VERIFICATION,
        severity: MonitoringSeverity.CRITICAL,
        description: 'Invalid or expired medical license',
        detectedAt: new Date(),
        affectedRecords: 1,
        regulatoryImplication: 'Medical Practice Act violation',
        correctiveActionRequired: true,
        assignedTo: 'medical_board'
      });
      credentialScore -= 40;
    }

    // Check accreditation status
    if (!credentials.accredited || credentials.accreditationExpiry < new Date()) {
      violations.push({
        violationId: `credential_accreditation_${Date.now()}`,
        type: ComplianceType.MEDICAL_CREDENTIAL_VERIFICATION,
        severity: MonitoringSeverity.HIGH,
        description: 'Invalid or expired medical accreditation',
        detectedAt: new Date(),
        affectedRecords: 1,
        regulatoryImplication: 'Healthcare accreditation violation',
        correctiveActionRequired: true,
        assignedTo: 'accreditation_board'
      });
      credentialScore -= 25;
    }

    // Check continuing education compliance
    if (!credentials.continuingEducation || credentials.continuingEducation < 20) {
      violations.push({
        violationId: `credential_education_${Date.now()}`,
        type: ComplianceType.MEDICAL_CREDENTIAL_VERIFICATION,
        severity: MonitoringSeverity.MEDIUM,
        description: 'Insufficient continuing education credits',
        detectedAt: new Date(),
        affectedRecords: 1,
        regulatoryImplication: 'Medical education requirement violation',
        correctiveActionRequired: false,
        assignedTo: 'doctor'
      });
      credentialScore -= 15;
    }

    const metrics: ComplianceMetrics = {
      timestamp: new Date(),
      complianceType: ComplianceType.MEDICAL_CREDENTIAL_VERIFICATION,
      status: credentialScore >= 90 ? ComplianceStatus.COMPLIANT : 
              credentialScore >= 70 ? ComplianceStatus.PARTIAL : ComplianceStatus.NON_COMPLIANT,
      score: Math.max(0, credentialScore),
      violations,
      regulatoryFramework: RegulatoryFramework.SMC,
      entityId: doctorId,
      entityType: 'doctor',
      auditTrail: [],
      nextReviewDate: this.calculateNextReviewDate(ComplianceType.MEDICAL_CREDENTIAL_VERIFICATION)
    };

    this.complianceMetrics.push(metrics);
    this.violations.push(...violations);

    return metrics;
  }

  // =============================================================================
  // PATIENT PRIVACY MONITORING
  // =============================================================================

  /**
   * Monitor patient privacy compliance with data access logging
   */
  async monitorPatientPrivacy(userId: string, accessEvent: {
    dataType: string;
    accessReason: string;
    authorizedPersonnel: string;
    consentStatus: boolean;
  }): Promise<SecurityEvent | null> {
    const violations: string[] = [];

    // Check consent status
    if (!accessEvent.consentStatus) {
      violations.push('Patient consent not found or invalid');
    }

    // Check authorization
    if (!accessEvent.authorizedPersonnel) {
      violations.push('No authorized personnel for data access');
    }

    // Check access reason
    if (!accessEvent.accessReason || accessEvent.accessReason === 'unauthorized') {
      violations.push('No valid reason for patient data access');
    }

    // Create audit log entry
    const auditEntry: ComplianceAuditEntry = {
      auditId: `privacy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      action: 'PATIENT_DATA_ACCESS',
      performedBy: accessEvent.authorizedPersonnel,
      resource: 'patient_records',
      resourceId: userId,
      changes: { accessReason: accessEvent.accessReason },
      complianceFlags: violations,
      riskLevel: violations.length > 0 ? MonitoringSeverity.HIGH : MonitoringSeverity.LOW,
      pdpaRelevant: true,
      mohCompliance: true
    };

    this.auditEntries.push(auditEntry);

    // Create security event if violations found
    if (violations.length > 0) {
      const securityEvent: SecurityEvent = {
        eventId: `privacy_${Date.now()}`,
        timestamp: new Date(),
        eventType: SecurityEventType.UNAUTHORIZED_ACCESS,
        severity: MonitoringSeverity.HIGH,
        source: SecurityEventSource.WEB_APPLICATION,
        target: userId,
        description: `Unauthorized patient data access attempt: ${violations.join(', ')}`,
        ipAddress: 'unknown', // Would be extracted from request
        userAgent: 'unknown', // Would be extracted from request
        userId: accessEvent.authorizedPersonnel,
        affectedDataTypes: [accessEvent.dataType],
        potentialDataBreach: true,
        regulatoryNotificationRequired: true,
        automatedResponse: false,
        investigationRequired: true,
        status: 'ACTIVE'
      };

      this.securityEvents.push(securityEvent);
      await this.triggerPrivacyViolationAlert(securityEvent);
      
      return securityEvent;
    }

    return null;
  }

  // =============================================================================
  // CONTINUOUS MONITORING
  // =============================================================================

  /**
   * Start continuous compliance monitoring
   */
  private startContinuousComplianceMonitoring(): void {
    // PDPA compliance monitoring - every 6 hours
    const pdpaInterval = setInterval(() => {
      this.performContinuousPDPACheck();
    }, 6 * 60 * 60 * 1000);
    this.activeMonitoring.set('pdpa', pdpaInterval);

    // Healthcare data security monitoring - every 2 hours
    const securityInterval = setInterval(() => {
      this.performContinuousSecurityCheck();
    }, 2 * 60 * 60 * 1000);
    this.activeMonitoring.set('security', securityInterval);

    // Medical credential verification - daily
    const credentialInterval = setInterval(() => {
      this.performContinuousCredentialCheck();
    }, 24 * 60 * 60 * 1000);
    this.activeMonitoring.set('credentials', credentialInterval);

    // Audit trail integrity check - every 4 hours
    const auditInterval = setInterval(() => {
      this.performAuditTrailIntegrityCheck();
    }, 4 * 60 * 60 * 1000);
    this.activeMonitoring.set('audit', auditInterval);
  }

  private async performContinuousPDPACheck(): Promise<void> {
    // Check recent data processing activities for PDPA compliance
    console.log('Performing continuous PDPA compliance check...');
    // Implementation would check recent database operations, API calls, etc.
  }

  private async performContinuousSecurityCheck(): Promise<void> {
    // Check healthcare data security status
    console.log('Performing continuous healthcare data security check...');
    // Implementation would check encryption status, access controls, etc.
  }

  private async performContinuousCredentialCheck(): Promise<void> {
    // Check medical credentials and accreditation status
    console.log('Performing continuous medical credential verification...');
    // Implementation would check license validity, accreditation status, etc.
  }

  private async performAuditTrailIntegrityCheck(): Promise<void> {
    // Verify audit trail integrity and completeness
    console.log('Performing audit trail integrity check...');
    // Implementation would verify audit log completeness, immutability, etc.
  }

  // =============================================================================
  // PRIVATE HELPER METHODS
  // =============================================================================

  private getSeverityPenalty(severity: MonitoringSeverity): number {
    const penalties: Record<MonitoringSeverity, number> = {
      [MonitoringSeverity.CRITICAL]: 25,
      [MonitoringSeverity.HIGH]: 15,
      [MonitoringSeverity.MEDIUM]: 10,
      [MonitoringSeverity.LOW]: 5,
      [MonitoringSeverity.INFO]: 0
    };
    return penalties[severity];
  }

  private calculateNextReviewDate(complianceType: ComplianceType): Date {
    const reviewIntervals: Record<ComplianceType, number> = {
      [ComplianceType.PDPA_COMPLIANCE]: 90, // 90 days
      [ComplianceType.HEALTHCARE_DATA_SECURITY]: 30, // 30 days
      [ComplianceType.MEDICAL_RECORD_HANDLING]: 60, // 60 days
      [ComplianceType.GOVERNMENT_REGULATION]: 180, // 6 months
      [ComplianceType.MEDICAL_CREDENTIAL_VERIFICATION]: 365, // 1 year
      [ComplianceType.PATIENT_PRIVACY]: 30, // 30 days
      [ComplianceType.AUDIT_TRAIL_INTEGRITY]: 7 // 7 days
    };

    const days = reviewIntervals[complianceType] || 90;
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + days);
    return nextReview;
  }

  private getRegulationChecks(regulation: RegulatoryFramework): Array<{
    name: string;
    check: (data: any) => boolean;
    severity: MonitoringSeverity;
    description: string;
    assignee: string;
  }> {
    const checks: Record<RegulatoryFramework, any> = {
      [RegulatoryFramework.PDPA]: [
        {
          name: 'consent_management',
          check: (data: any) => data.consentObtained && data.consentValid,
          severity: MonitoringSeverity.CRITICAL,
          description: 'Valid patient consent not obtained',
          assignee: 'privacy_officer'
        },
        {
          name: 'data_minimization',
          check: (data: any) => data.dataMinimizationPractices,
          severity: MonitoringSeverity.HIGH,
          description: 'Data minimization practices not implemented',
          assignee: 'data_protection_officer'
        }
      ],
      [RegulatoryFramework.SMC]: [
        {
          name: 'medical_license',
          check: (data: any) => data.licenseValid && !data.licenseExpired,
          severity: MonitoringSeverity.CRITICAL,
          description: 'Invalid medical license',
          assignee: 'medical_board'
        },
        {
          name: 'professional_standards',
          check: (data: any) => data.professionalStandardsCompliant,
          severity: MonitoringSeverity.HIGH,
          description: 'Medical professional standards not met',
          assignee: 'professional_standards_board'
        }
      ],
      [RegulatoryFramework.MOH_GUIDELINES]: [
        {
          name: 'healthcare_standards',
          check: (data: any) => data.healthcareStandardsCompliant,
          severity: MonitoringSeverity.HIGH,
          description: 'MOH healthcare standards not met',
          assignee: 'moh_compliance_team'
        }
      ],
      [RegulatoryFramework.HEALTHCARE_ACT]: [
        {
          name: 'healthcare_facility_standards',
          check: (data: any) => data.facilityStandardsMet,
          severity: MonitoringSeverity.HIGH,
          description: 'Healthcare facility standards not met',
          assignee: 'facility_compliance_team'
        }
      ],
      [RegulatoryFramework.GDPR]: [
        {
          name: 'data_rights',
          check: (data: any) => data.dataSubjectRightsImplemented,
          severity: MonitoringSeverity.HIGH,
          description: 'GDPR data subject rights not implemented',
          assignee: 'privacy_officer'
        }
      ]
    };

    return checks[regulation] || [];
  }

  private async triggerComplianceAlert(metrics: ComplianceMetrics, violations: ComplianceViolation[]): Promise<void> {
    console.error(`[COMPLIANCE ALERT] ${metrics.complianceType} violations detected:`, {
      entityId: metrics.entityId,
      complianceScore: metrics.score,
      violations: violations.map(v => v.description)
    });
    
    // In a real implementation, this would trigger actual alerts
  }

  private async notifyGovernmentAuthorities(regulation: RegulatoryFramework, metrics: ComplianceMetrics): Promise<void> {
    console.warn(`[GOVERNMENT NOTIFICATION] ${regulation} compliance violation reported:`, {
      entityId: metrics.entityId,
      complianceScore: metrics.score,
      regulatoryImplications: metrics.violations.map(v => v.regulatoryImplication)
    });
    
    // In a real implementation, this would send notifications to relevant authorities
  }

  private async triggerPrivacyViolationAlert(securityEvent: SecurityEvent): Promise<void> {
    console.error(`[PRIVACY VIOLATION ALERT] Patient privacy violation detected:`, {
      eventId: securityEvent.eventId,
      target: securityEvent.target,
      description: securityEvent.description,
      potentialBreach: securityEvent.potentialDataBreach
    });
  }

  private initializeComplianceConfigs(): void {
    this.complianceConfigs.set(ComplianceType.PDPA_COMPLIANCE, {
      auditFrequency: 'continuous',
      retentionPeriod: 2555, // 7 years
      notificationRequired: true
    });

    this.complianceConfigs.set(ComplianceType.HEALTHCARE_DATA_SECURITY, {
      encryptionRequired: true,
      accessLoggingRequired: true,
      penetrationTestingFrequency: 90 // days
    });

    this.complianceConfigs.set(ComplianceType.MEDICAL_RECORD_HANDLING, {
      retentionPeriod: 2920, // 8 years
      classificationRequired: true,
      sharingConsentRequired: true
    });
  }

  // =============================================================================
  // PUBLIC GETTER METHODS
  // =============================================================================

  /**
   * Get compliance metrics for a specific entity
   */
  getComplianceMetrics(entityId?: string, timeRange?: { start: Date; end: Date }): ComplianceMetrics[] {
    let metrics = this.complianceMetrics;
    
    if (entityId) {
      metrics = metrics.filter(m => m.entityId === entityId);
    }
    
    if (timeRange) {
      metrics = metrics.filter(m => m.timestamp >= timeRange.start && m.timestamp <= timeRange.end);
    }
    
    return metrics;
  }

  /**
   * Get compliance violations
   */
  getViolations(entityId?: string, severity?: MonitoringSeverity): ComplianceViolation[] {
    let violations = this.violations;
    
    if (entityId) {
      violations = violations.filter(v => v.affectedRecords > 0); // Simplified filter
    }
    
    if (severity) {
      violations = violations.filter(v => v.severity === severity);
    }
    
    return violations;
  }

  /**
   * Get audit trail entries
   */
  getAuditTrail(entityId?: string, timeRange?: { start: Date; end: Date }): ComplianceAuditEntry[] {
    let auditEntries = this.auditEntries;
    
    if (entityId) {
      auditEntries = auditEntries.filter(a => a.resourceId === entityId);
    }
    
    if (timeRange) {
      auditEntries = auditEntries.filter(a => a.timestamp >= timeRange.start && a.timestamp <= timeRange.end);
    }
    
    return auditEntries;
  }

  /**
   * Get security events
   */
  getSecurityEvents(timeRange?: { start: Date; end: Date }): SecurityEvent[] {
    let events = this.securityEvents;
    
    if (timeRange) {
      events = events.filter(e => e.timestamp >= timeRange.start && e.timestamp <= timeRange.end);
    }
    
    return events;
  }

  /**
   * Get compliance dashboard summary
   */
  getComplianceDashboard(): {
    overallComplianceScore: number;
    complianceByType: Record<ComplianceType, { score: number; status: ComplianceStatus; violations: number }>;
    criticalViolations: ComplianceViolation[];
    upcomingReviews: ComplianceMetrics[];
    regulatoryNotifications: Array<{ regulation: RegulatoryFramework; action: string; dueDate: Date }>;
  } {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Calculate overall compliance score
    const recentMetrics = this.complianceMetrics.filter(m => 
      m.timestamp > new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    );
    
    const overallScore = recentMetrics.length > 0 
      ? recentMetrics.reduce((sum, m) => sum + m.score, 0) / recentMetrics.length 
      : 100;

    // Compliance by type
    const complianceByType = Object.values(ComplianceType).reduce((acc, type) => {
      const typeMetrics = recentMetrics.filter(m => m.complianceType === type);
      if (typeMetrics.length > 0) {
        const avgScore = typeMetrics.reduce((sum, m) => sum + m.score, 0) / typeMetrics.length;
        const totalViolations = typeMetrics.reduce((sum, m) => sum + m.violations.length, 0);
        acc[type] = {
          score: avgScore,
          status: avgScore >= 90 ? ComplianceStatus.COMPLIANT : 
                  avgScore >= 70 ? ComplianceStatus.PARTIAL : ComplianceStatus.NON_COMPLIANT,
          violations: totalViolations
        };
      }
      return acc;
    }, {} as Record<ComplianceType, { score: number; status: ComplianceStatus; violations: number }>);

    // Critical violations
    const criticalViolations = this.violations.filter(v => 
      v.severity === MonitoringSeverity.CRITICAL && 
      (!v.resolvedAt || v.resolvedAt > now)
    );

    // Upcoming reviews
    const upcomingReviews = this.complianceMetrics.filter(m => 
      m.nextReviewDate && m.nextReviewDate <= thirtyDaysFromNow
    );

    // Regulatory notifications
    const regulatoryNotifications = [
      {
        regulation: RegulatoryFramework.PDPA,
        action: 'Quarterly compliance report due',
        dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      },
      {
        regulation: RegulatoryFramework.SMC,
        action: 'Annual medical license renewal',
        dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      }
    ];

    return {
      overallComplianceScore: overallScore,
      complianceByType,
      criticalViolations,
      upcomingReviews,
      regulatoryNotifications
    };
  }
}

// =============================================================================
// EXPORT SINGLETON INSTANCE
// =============================================================================

export const healthcareComplianceMonitor = new HealthcareComplianceMonitor();