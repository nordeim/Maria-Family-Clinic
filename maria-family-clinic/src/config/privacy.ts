/**
 * Privacy & Compliance Configuration
 * Environment variables and settings for privacy and compliance features
 */

export const PRIVACY_CONFIG = {
  // PDPA Compliance Settings
  PDPA: {
    enabled: true,
    consentExpiryMonths: 12,
    dataRetentionDays: 2555, // 7 years as per PDPA
    breachNotificationHours: 72,
    individualRightsProcessingDays: 30
  },

  // SMC Guidelines Compliance
  SMC: {
    enabled: true,
    verificationRequired: true,
    confidentialityLevel: 'HIGH',
    professionalStandardsEnforcement: true
  },

  // Security Settings
  SECURITY: {
    encryptionAlgorithm: 'AES-256-GCM',
    sessionTimeoutMinutes: 30,
    maxFailedLoginAttempts: 5,
    lockoutDurationMinutes: 15,
    twoFactorRequired: true,
    ipWhitelistEnabled: false,
    auditRetentionDays: 2555
  },

  // Consent Management
  CONSENT: {
    defaultExpiryMonths: 12,
    autoRenewalEnabled: true,
    withdrawalImmediate: true,
    granularConsentEnabled: true,
    consentVersioning: true
  },

  // Audit and Monitoring
  AUDIT: {
    logAllAccess: true,
    realTimeMonitoring: true,
    complianceAlertsEnabled: true,
    incidentResponseAutomation: true
  },

  // Data Classification
  DATA_CLASSIFICATION: {
    autoClassification: true,
    sensitivityLevels: ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED'],
    encryptionRequired: ['CONFIDENTIAL', 'RESTRICTED'],
    accessControlRequired: ['INTERNAL', 'CONFIDENTIAL', 'RESTRICTED']
  }
} as const;

export const COMPLIANCE_THRESHOLDS = {
  COMPLIANT: 80,
  PARTIAL: 60,
  NON_COMPLIANT: 0
} as const;

export const REGULATORY_CONTACTS = {
  PDPA_COMMISSIONER: {
    email: 'info@pdpc.gov.sg',
    phone: '+65 6778 1018',
    address: 'PDPC, 1 Pasir Panjang Road, #08-22, Singapore 117588'
  },
  SINGAPORE_MEDICAL_COUNCIL: {
    email: 'smc@singaporemedicalcouncil.org.sg',
    phone: '+65 6372 6104',
    address: '16 College Road, #01-01, Singapore 169854'
  }
} as const;