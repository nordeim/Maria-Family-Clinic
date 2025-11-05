/**
 * Privacy & Compliance Utilities
 * Security functions for data protection, audit logging, and regulatory compliance
 */

// =============================================================================
// PRIVACY & COMPLIANCE CONSTANTS
// =============================================================================

export const COMPLIANCE_LEVELS = {
  PDPA: 'pdpa',
  GDPR: 'gdpr',
  SMC: 'smc',
  HIPAA: 'hipaa'
} as const;

export const DATA_SENSITIVITY_LEVELS = {
  PUBLIC: 'public',
  INTERNAL: 'internal',
  CONFIDENTIAL: 'confidential',
  RESTRICTED: 'restricted'
} as const;

export const CONSENT_TYPES = {
  PROFILE_DISPLAY: 'profile_display',
  CONTACT_INFO: 'contact_info',
  SCHEDULE: 'schedule',
  REVIEWS: 'reviews',
  RESEARCH: 'research',
  MARKETING: 'marketing',
  DATA_PROCESSING: 'data_processing'
} as const;

export const SECURITY_EVENT_TYPES = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  DATA_ACCESS: 'data_access',
  DATA_EXPORT: 'data_export',
  PERMISSION_CHANGE: 'permission_change',
  CONSENT_CHANGE: 'consent_change',
  FAILED_LOGIN: 'failed_login',
  SUSPICIOUS_ACTIVITY: 'suspicious_activity',
  SYSTEM_ACCESS: 'system_access'
} as const;

// =============================================================================
// DATA CLASSIFICATION & ENCRYPTION
// =============================================================================

export interface DataClassificationRule {
  pattern: RegExp;
  sensitivityLevel: typeof DATA_SENSITIVITY_LEVELS[keyof typeof DATA_SENSITIVITY_LEVELS];
  requiredControls: string[];
  retentionDays: number;
}

export const DATA_CLASSIFICATION_RULES: DataClassificationRule[] = [
  {
    pattern: /\b(?:nric|passport)\s*[:\-]?\s*[STFG]\d{7}[A-Z]\b/i,
    sensitivityLevel: DATA_SENSITIVITY_LEVELS.RESTRICTED,
    requiredControls: ['encryption', 'access_control', 'audit_log', 'retention_limit'],
    retentionDays: 2555 // 7 years as per PDPA
  },
  {
    pattern: /\b(?:email|phone|mobile|address)\b/i,
    sensitivityLevel: DATA_SENSITIVITY_LEVELS.CONFIDENTIAL,
    requiredControls: ['encryption', 'access_control', 'consent_required'],
    retentionDays: 2555
  },
  {
    pattern: /\b(?:medical|diagnosis|treatment|health)\b/i,
    sensitivityLevel: DATA_SENSITIVITY_LEVELS.CONFIDENTIAL,
    requiredControls: ['encryption', 'access_control', 'audit_log', 'legal_basis'],
    retentionDays: 2920 // 8 years as per medical record retention
  },
  {
    pattern: /\b(?:name|clinic|hospital)\b/i,
    sensitivityLevel: DATA_SENSITIVITY_LEVELS.INTERNAL,
    requiredControls: ['access_control', 'audit_log'],
    retentionDays: 2555
  }
];

// =============================================================================
// CONSENT MANAGEMENT UTILITIES
// =============================================================================

export interface ConsentConfiguration {
  consentType: typeof CONSENT_TYPES[keyof typeof CONSENT_TYPES];
  isRequired: boolean;
  isRevocable: boolean;
  expiryMonths?: number;
  regulatoryBasis: string[];
  documentationRequired: boolean;
}

export const CONSENT_CONFIGURATIONS: ConsentConfiguration[] = [
  {
    consentType: CONSENT_TYPES.PROFILE_DISPLAY,
    isRequired: false,
    isRevocable: true,
    expiryMonths: 12,
    regulatoryBasis: [COMPLIANCE_LEVELS.PDPA],
    documentationRequired: true
  },
  {
    consentType: CONSENT_TYPES.DATA_PROCESSING,
    isRequired: true,
    isRevocable: true,
    expiryMonths: 12,
    regulatoryBasis: [COMPLIANCE_LEVELS.PDPA, COMPLIANCE_LEVELS.GDPR],
    documentationRequired: true
  },
  {
    consentType: CONSENT_TYPES.RESEARCH,
    isRequired: false,
    isRevocable: true,
    regulatoryBasis: [COMPLIANCE_LEVELS.PDPA],
    documentationRequired: true
  }
];

// =============================================================================
// AUDIT LOGGING UTILITIES
// =============================================================================

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  userRole: string;
  action: keyof typeof SECURITY_EVENT_TYPES;
  resource: string;
  resourceId: string;
  dataSensitivity: keyof typeof DATA_SENSITIVITY_LEVELS;
  complianceFlags: string[];
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  metadata?: Record<string, any>;
}

/**
 * Generate audit log entry for data access
 */
export function createAuditLogEntry(
  userId: string,
  userName: string,
  userRole: string,
  action: keyof typeof SECURITY_EVENT_TYPES,
  resource: string,
  resourceId: string,
  dataSensitivity: keyof typeof DATA_SENSITIVITY_LEVELS,
  complianceFlags: string[],
  ipAddress: string,
  userAgent: string,
  sessionId: string,
  metadata?: Record<string, any>
): AuditLogEntry {
  return {
    id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    userId,
    userName,
    userRole,
    action,
    resource,
    resourceId,
    dataSensitivity,
    complianceFlags,
    ipAddress,
    userAgent,
    sessionId,
    metadata
  };
}

/**
 * Classify data sensitivity based on content
 */
export function classifyDataSensitivity(data: string): keyof typeof DATA_SENSITIVITY_LEVELS {
  for (const rule of DATA_CLASSIFICATION_RULES) {
    if (rule.pattern.test(data)) {
      return rule.sensitivityLevel;
    }
  }
  return DATA_SENSITIVITY_LEVELS.PUBLIC;
}

/**
 * Validate consent requirements
 */
export function validateConsentRequirement(
  consentType: typeof CONSENT_TYPES[keyof typeof CONSENT_TYPES],
  doctorProfile: any
): { isValid: boolean; missingConsents: string[]; errors: string[] } {
  const config = CONSENT_CONFIGURATIONS.find(c => c.consentType === consentType);
  if (!config) {
    return { isValid: false, missingConsents: [consentType], errors: ['Unknown consent type'] };
  }

  const errors: string[] = [];
  const missingConsents: string[] = [];

  // Check required consents
  if (config.isRequired) {
    const hasConsent = doctorProfile?.consents?.[consentType] === 'granted';
    if (!hasConsent) {
      missingConsents.push(consentType);
      errors.push(`${consentType} consent is required but not granted`);
    }
  }

  // Check consent expiry
  if (config.expiryMonths && doctorProfile?.consents?.[consentType]) {
    const consentDate = new Date(doctorProfile.consents[consentType].grantedAt);
    const expiryDate = new Date(consentDate);
    expiryDate.setMonth(expiryDate.getMonth() + config.expiryMonths);

    if (new Date() > expiryDate) {
      errors.push(`${consentType} consent has expired`);
    }
  }

  return {
    isValid: errors.length === 0,
    missingConsents,
    errors
  };
}

// =============================================================================
// SECURITY VALIDATION UTILITIES
// =============================================================================

export interface SecurityValidationResult {
  isSecure: boolean;
  riskScore: number;
  vulnerabilities: string[];
  recommendations: string[];
}

/**
 * Validate doctor profile security
 */
export function validateDoctorProfileSecurity(doctorProfile: any): SecurityValidationResult {
  const vulnerabilities: string[] = [];
  const recommendations: string[] = [];
  let riskScore = 0;

  // Check for sensitive data exposure
  if (doctorProfile?.nric && !doctorProfile.nricEncrypted) {
    vulnerabilities.push('NRIC is not encrypted');
    riskScore += 30;
    recommendations.push('Encrypt NRIC data at rest');
  }

  // Check consent status
  const consentValidation = validateConsentRequirement(CONSENT_TYPES.DATA_PROCESSING, doctorProfile);
  if (!consentValidation.isValid) {
    vulnerabilities.push('Missing required consents');
    riskScore += 20;
    recommendations.push('Obtain required PDPA consent from doctor');
  }

  // Check access controls
  if (!doctorProfile?.privacySettings?.accessControl) {
    vulnerabilities.push('No access control settings defined');
    riskScore += 15;
    recommendations.push('Implement role-based access controls');
  }

  // Check audit logging
  if (!doctorProfile?.auditEnabled) {
    vulnerabilities.push('Audit logging not enabled');
    riskScore += 10;
    recommendations.push('Enable comprehensive audit logging');
  }

  // Check data retention
  if (doctorProfile?.dataRetentionDays > 2555) {
    vulnerabilities.push('Data retention exceeds regulatory limits');
    riskScore += 25;
    recommendations.push('Implement data retention policies');
  }

  const isSecure = riskScore < 50;

  return {
    isSecure,
    riskScore,
    vulnerabilities,
    recommendations
  };
}

/**
 * Validate PDPA compliance
 */
export function validatePDPACompliance(doctorProfile: any): {
  isCompliant: boolean;
  complianceScore: number;
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let complianceScore = 100;

  // Data minimization
  if (doctorProfile?.unnecessaryFields?.length > 0) {
    issues.push('Collecting unnecessary personal data');
    complianceScore -= 15;
    recommendations.push('Remove unnecessary data collection fields');
  }

  // Purpose limitation
  if (!doctorProfile?.purposeDefined) {
    issues.push('Data processing purpose not clearly defined');
    complianceScore -= 20;
    recommendations.push('Define clear purposes for data collection and processing');
  }

  // Consent management
  const consentValidation = validateConsentRequirement(CONSENT_TYPES.DATA_PROCESSING, doctorProfile);
  if (!consentValidation.isValid) {
    issues.push('Consent management not compliant');
    complianceScore -= 25;
    recommendations.push('Implement proper consent management system');
  }

  // Data protection
  if (!doctorProfile?.dataProtection) {
    issues.push('Inadequate data protection measures');
    complianceScore -= 20;
    recommendations.push('Implement encryption and access controls');
  }

  // Data retention
  if (doctorProfile?.dataRetentionDays > 2555) {
    issues.push('Data retention period exceeds PDPA requirements');
    complianceScore -= 15;
    recommendations.push('Implement data retention policies within PDPA limits');
  }

  const isCompliant = complianceScore >= 80;

  return {
    isCompliant,
    complianceScore,
    issues,
    recommendations
  };
}

// =============================================================================
// ENCRYPTION & DECRYPTION UTILITIES
// =============================================================================

/**
 * Encrypt sensitive doctor data
 */
export function encryptSensitiveData(data: string, key: string): string {
  // This is a placeholder - implement actual encryption using a proper library
  // In production, use libraries like crypto-js or node:crypto
  const encrypted = Buffer.from(data).toString('base64');
  return `encrypted:${encrypted}`;
}

/**
 * Decrypt sensitive doctor data
 */
export function decryptSensitiveData(encryptedData: string, key: string): string {
  // This is a placeholder - implement actual decryption
  if (!encryptedData.startsWith('encrypted:')) {
    throw new Error('Invalid encrypted data format');
  }
  const encrypted = encryptedData.replace('encrypted:', '');
  return Buffer.from(encrypted, 'base64').toString('utf-8');
}

/**
 * Hash sensitive identifiers for lookup while maintaining privacy
 */
export function hashIdentifier(identifier: string): string {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(identifier).digest('hex');
}

// =============================================================================
// COMPLIANCE REPORTING UTILITIES
// =============================================================================

export interface ComplianceReport {
  reportId: string;
  generatedAt: Date;
  reportType: 'pdpa' | 'smc' | 'security_audit' | 'privacy_assessment';
  scope: string[];
  complianceScore: number;
  findings: {
    compliant: string[];
    partial: string[];
    nonCompliant: string[];
  };
  recommendations: string[];
  nextReviewDate: Date;
}

/**
 * Generate PDPA compliance report
 */
export function generatePDPAComplianceReport(doctorProfiles: any[]): ComplianceReport {
  const compliant: string[] = [];
  const partial: string[] = [];
  const nonCompliant: string[] = [];

  doctorProfiles.forEach(profile => {
    const validation = validatePDPACompliance(profile);
    if (validation.isCompliant) {
      compliant.push(profile.name);
    } else if (validation.complianceScore >= 60) {
      partial.push(profile.name);
    } else {
      nonCompliant.push(profile.name);
    }
  });

  const totalProfiles = doctorProfiles.length;
  const compliantCount = compliant.length;
  const complianceScore = (compliantCount / totalProfiles) * 100;

  return {
    reportId: `pdpa_report_${Date.now()}`,
    generatedAt: new Date(),
    reportType: 'pdpa',
    scope: ['Personal Data Protection Act', 'Healthcare Data Processing'],
    complianceScore,
    findings: {
      compliant,
      partial,
      nonCompliant
    },
    recommendations: [
      'Review and update consent management procedures',
      'Implement additional data protection measures',
      'Conduct regular privacy impact assessments',
      'Update staff training on PDPA requirements'
    ],
    nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
  };
}

/**
 * Generate security audit report
 */
export function generateSecurityAuditReport(securityEvents: any[]): ComplianceReport {
  const criticalEvents = securityEvents.filter(e => e.severity === 'critical').length;
  const highEvents = securityEvents.filter(e => e.severity === 'high').length;
  const securityScore = Math.max(0, 100 - (criticalEvents * 10) - (highEvents * 5));

  return {
    reportId: `security_audit_${Date.now()}`,
    generatedAt: new Date(),
    reportType: 'security_audit',
    scope: ['Access Controls', 'Data Protection', 'Incident Response', 'Audit Logging'],
    complianceScore: securityScore,
    findings: {
      compliant: ['Access control implementation', 'Data encryption'],
      partial: ['Incident response procedures'],
      nonCompliant: criticalEvents > 0 ? ['Critical security incidents detected'] : []
    },
    recommendations: [
      'Strengthen incident response procedures',
      'Enhance monitoring and alerting',
      'Regular security awareness training',
      'Implement additional access controls'
    ],
    nextReviewDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000) // 180 days
  };
}

// =============================================================================
// EXPORT TYPES
// =============================================================================

export type ComplianceLevel = typeof COMPLIANCE_LEVELS[keyof typeof COMPLIANCE_LEVELS];
export type DataSensitivityLevel = typeof DATA_SENSITIVITY_LEVELS[keyof typeof DATA_SENSITIVITY_LEVELS];
export type ConsentType = typeof CONSENT_TYPES[keyof typeof CONSENT_TYPES];
export type SecurityEventType = typeof SECURITY_EVENT_TYPES[keyof typeof SECURITY_EVENT_TYPES];