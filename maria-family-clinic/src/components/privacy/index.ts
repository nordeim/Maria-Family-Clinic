/**
 * Privacy & Compliance Component Index
 * Centralized exports for all privacy, compliance, and security components
 */

export { default as PrivacyComplianceDashboard } from './PrivacyComplianceDashboard';
export { default as DoctorConsentManagement } from './DoctorConsentManagement';
export { default as SecurityControlsAccessManagement } from './SecurityControlsAccessManagement';
export { default as AuditLoggingIncidentResponse } from './AuditLoggingIncidentResponse';

// Health Data Privacy Components
export { HealthDataPrivacyDashboard } from './HealthDataPrivacyDashboard';
export { ConsentManagementPanel } from './ConsentManagementPanel';
export { HealthDataClassificationPanel } from './HealthDataClassificationPanel';
export { DataSubjectRightsPanel } from './DataSubjectRightsPanel';
export { SecureMedicalDocumentUpload } from './SecureMedicalDocumentUpload';
export { PrivacyIncidentPanel } from './PrivacyIncidentPanel';
export { ComplianceReportPanel } from './ComplianceReportPanel';
export { AuditLogViewer } from './AuditLogViewer';
export { SecureDocumentPanel } from './SecureDocumentPanel';
export { ComplianceMonitoringPanel } from './ComplianceMonitoringPanel';

/**
 * Privacy Types and Interfaces
 */

export interface ComplianceStatus {
  pdpaCompliance: 'compliant' | 'partial' | 'non-compliant';
  smcCompliance: 'compliant' | 'partial' | 'non-compliant';
  dataEncryption: 'compliant' | 'partial' | 'non-compliant';
  accessControl: 'compliant' | 'partial' | 'non-compliant';
  auditLogging: 'compliant' | 'partial' | 'non-compliant';
}

export interface PrivacyMetrics {
  totalDoctors: number;
  consentGranted: number;
  consentPending: number;
  consentWithdrawn: number;
  profileVisibilityPublic: number;
  profileVisibilityPrivate: number;
  dataRetentionDays: number;
  lastAuditDate: Date;
  upcomingAuditDate: Date;
}

export interface SecurityIncident {
  id: string;
  type: 'access_denied' | 'data_breach' | 'unauthorized_access' | 'consent_issue';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved';
  description: string;
  affectedDoctor: string;
  reportedAt: Date;
  resolvedAt?: Date;
}

export interface ConsentRecord {
  id: string;
  doctorId: string;
  doctorName: string;
  consentType: 'profile_display' | 'contact_info' | 'schedule' | 'reviews' | 'research';
  status: 'granted' | 'pending' | 'withdrawn' | 'expired';
  grantedAt?: Date;
  expiresAt?: Date;
  withdrawnAt?: Date;
  consentVersion: string;
  ipAddress: string;
  userAgent: string;
}

export interface PrivacyPreference {
  category: string;
  description: string;
  enabled: boolean;
  lastUpdated: Date;
}

export interface SecurityUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'clinic_admin' | 'provider' | 'staff' | 'auditor';
  department: string;
  lastLogin: Date;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  permissions: string[];
  twoFactorEnabled: boolean;
  riskScore: number;
}

export interface SecurityEvent {
  id: string;
  type: 'login' | 'logout' | 'data_access' | 'permission_change' | 'failed_login' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId: string;
  userName: string;
  timestamp: Date;
  description: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
  status: 'reviewed' | 'flagged' | 'resolved';
}

export interface AccessPolicy {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  conditions: string[];
  isActive: boolean;
  lastModified: Date;
  modifiedBy: string;
}

export interface DataClassification {
  level: 'public' | 'internal' | 'confidential' | 'restricted';
  description: string;
  examples: string[];
  requiredControls: string[];
  color: string;
}

export interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  userRole: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'login' | 'logout' | 'export' | 'search';
  resource: string;
  resourceId: string;
  fieldChanged?: string;
  oldValue?: string;
  newValue?: string;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  dataSensitivity: 'public' | 'internal' | 'confidential' | 'restricted';
  complianceFlags: ('pdpa' | 'gdpr' | 'smc' | 'hipaa')[];
  status: 'success' | 'failed' | 'blocked';
  reason?: string;
}

export interface ComplianceAlert {
  id: string;
  type: 'consent_expiry' | 'policy_violation' | 'audit_required' | 'regulatory_change';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  affectedCount: number;
  dueDate?: Date;
  status: 'open' | 'acknowledged' | 'resolved';
  createdAt: Date;
}