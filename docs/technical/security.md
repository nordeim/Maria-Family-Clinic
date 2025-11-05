# Security & Compliance Documentation

## Overview

The My Family Clinic platform implements comprehensive security measures and compliance frameworks to protect healthcare data in accordance with Singapore's Personal Data Protection Act (PDPA), Ministry of Health (MOH) guidelines, and international healthcare standards including GDPR and HIPAA.

## Security Architecture

### Security Principles

#### 1. **Defense in Depth**
- Multiple layers of security controls
- No single point of failure
- Comprehensive threat modeling
- Continuous security monitoring

#### 2. **Zero Trust Model**
- Never trust, always verify
- Continuous authentication
- Least privilege access
- Micro-segmentation

#### 3. **Data Protection by Design**
- Encryption at rest and in transit
- Data minimization principles
- Privacy by design methodology
- Secure development lifecycle

#### 4. **Compliance First**
- Regulatory requirement compliance
- Industry standard adherence
- Regular compliance audits
- Continuous improvement

---

## Data Protection Framework

### Privacy Principles Implementation

#### 1. **Consent Management**
```typescript
// Consent tracking interface
interface ConsentRecord {
  userId: string;
  consentType: ConsentType;
  consentGiven: boolean;
  consentDate: Date;
  consentVersion: string;
  withdrawalDate?: Date;
  ipAddress: string;
  userAgent: string;
  purpose: string[];
}

enum ConsentType {
  PDPA_CONSENT = 'pdpa_consent',
  GDPR_CONSENT = 'gdpr_consent',
  MARKETING_CONSENT = 'marketing_consent',
  MEDICAL_CONSENT = 'medical_consent',
  RESEARCH_CONSENT = 'research_consent',
  DATA_PROCESSING_CONSENT = 'data_processing_consent'
}
```

**Implementation Features:**
- Granular consent controls
- Consent withdrawal mechanisms
- Audit trail for consent changes
- Automated consent expiry

#### 2. **Purpose Limitation**
```sql
-- Data purpose tracking
CREATE TABLE data_processing_purposes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    data_type VARCHAR(100) NOT NULL,
    purpose VARCHAR(255) NOT NULL,
    legal_basis VARCHAR(100) NOT NULL,
    consent_required BOOLEAN DEFAULT true,
    retention_period INTEGER, -- Days
    processing_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processing_end_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 3. **Data Minimization**
- Collect only necessary data
- Regular data purging
- Anonymization where possible
- Pseudonymization for analytics

#### 4. **Accuracy & Quality**
```sql
-- Data quality tracking
CREATE TABLE data_quality_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(100) NOT NULL,
    column_name VARCHAR(100) NOT NULL,
    quality_score DECIMAL(5,2) DEFAULT 0,
    missing_values INTEGER DEFAULT 0,
    duplicate_values INTEGER DEFAULT 0,
    invalid_values INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    remediation_actions JSONB DEFAULT '[]'
);
```

---

## Authentication & Authorization

### Multi-Factor Authentication (MFA)

#### Implementation Architecture
```typescript
// MFA configuration
interface MFAConfig {
  enabled: boolean;
  methods: MFAMethod[];
  backupCodes: string[];
  trustedDevices: TrustedDevice[];
  fallbackMethods: MFAMethod[];
}

enum MFAMethod {
  TOTP = 'totp', // Time-based One-Time Password
  SMS = 'sms',
  EMAIL = 'email',
  BIOMETRIC = 'biometric',
  HARDWARE_TOKEN = 'hardware_token'
}

// MFA verification service
class MFAService {
  async generateTOTPSecret(userId: string): Promise<string> {
    // Generate TOTP secret for user
    const secret = speakeasy.generateSecret({
      name: `My Family Clinic (${userId})`,
      issuer: 'My Family Clinic',
    });
    
    await this.storeTOTPSecret(userId, secret.base32);
    return secret.otpauth_url;
  }

  async verifyTOTP(userId: string, token: string): Promise<boolean> {
    const secret = await this.getTOTPSecret(userId);
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2, // Allow 2 time steps variance
    });
  }
}
```

#### Session Management
```typescript
// Secure session handling
interface SessionConfig {
  secure: boolean;
  httpOnly: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  maxAge: number; // Session timeout in seconds
  rolling: boolean; // Extend session on activity
  domain: string;
}

class SessionManager {
  async createSession(userId: string, roles: string[]): Promise<string> {
    const sessionId = uuidv4();
    const sessionData = {
      userId,
      roles,
      createdAt: new Date(),
      lastActivity: new Date(),
      ipAddress: await this.getClientIP(),
      userAgent: await this.getUserAgent(),
    };

    // Store session in Redis with expiration
    await redis.setex(
      `session:${sessionId}`,
      SESSION_TIMEOUT,
      JSON.stringify(sessionData)
    );

    return sessionId;
  }

  async validateSession(sessionId: string): Promise<SessionData | null> {
    const sessionData = await redis.get(`session:${sessionId}`);
    
    if (!sessionData) return null;
    
    const session = JSON.parse(sessionData);
    const now = new Date();
    const lastActivity = new Date(session.lastActivity);
    
    // Check session timeout
    if (now.getTime() - lastActivity.getTime() > SESSION_TIMEOUT * 1000) {
      await this.invalidateSession(sessionId);
      return null;
    }

    // Update last activity
    session.lastActivity = now;
    await redis.setex(
      `session:${sessionId}`,
      SESSION_TIMEOUT,
      JSON.stringify(session)
    );

    return session;
  }
}
```

### Role-Based Access Control (RBAC)

#### Role Hierarchy
```typescript
// Role definitions
enum UserRole {
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
  NURSE = 'NURSE',
  CLINIC_ADMIN = 'CLINIC_ADMIN',
  SYSTEM_ADMIN = 'SYSTEM_ADMIN',
  COMPLIANCE_OFFICER = 'COMPLIANCE_OFFICER',
  SUPPORT_AGENT = 'SUPPORT_AGENT'
}

// Permission system
enum Permission {
  // Patient data permissions
  READ_PATIENT_DATA = 'READ_PATIENT_DATA',
  WRITE_PATIENT_DATA = 'WRITE_PATIENT_DATA',
  DELETE_PATIENT_DATA = 'DELETE_PATIENT_DATA',
  
  // Appointment permissions
  CREATE_APPOINTMENT = 'CREATE_APPOINTMENT',
  READ_APPOINTMENT = 'READ_APPOINTMENT',
  UPDATE_APPOINTMENT = 'UPDATE_APPOINTMENT',
  DELETE_APPOINTMENT = 'DELETE_APPOINTMENT',
  
  // Administrative permissions
  MANAGE_USERS = 'MANAGE_USERS',
  MANAGE_CLINICS = 'MANAGE_CLINICS',
  MANAGE_DOCTORS = 'MANAGE_DOCTORS',
  VIEW_ANALYTICS = 'VIEW_ANALYTICS',
  
  // Compliance permissions
  AUDIT_DATA = 'AUDIT_DATA',
  EXPORT_DATA = 'EXPORT_DATA',
  COMPLIANCE_REPORTING = 'COMPLIANCE_REPORTING'
}

// Role permissions mapping
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.PATIENT]: [
    Permission.READ_PATIENT_DATA,
    Permission.CREATE_APPOINTMENT,
    Permission.READ_APPOINTMENT,
  ],
  [UserRole.DOCTOR]: [
    Permission.READ_PATIENT_DATA,
    Permission.WRITE_PATIENT_DATA,
    Permission.READ_APPOINTMENT,
    Permission.UPDATE_APPOINTMENT,
  ],
  [UserRole.CLINIC_ADMIN]: [
    Permission.READ_PATIENT_DATA,
    Permission.CREATE_APPOINTMENT,
    Permission.READ_APPOINTMENT,
    Permission.UPDATE_APPOINTMENT,
    Permission.MANAGE_USERS,
    Permission.VIEW_ANALYTICS,
  ],
  [UserRole.SYSTEM_ADMIN]: Object.values(Permission),
  [UserRole.COMPLIANCE_OFFICER]: [
    Permission.READ_PATIENT_DATA,
    Permission.AUDIT_DATA,
    Permission.EXPORT_DATA,
    Permission.COMPLIANCE_REPORTING,
  ],
  [UserRole.SUPPORT_AGENT]: [
    Permission.READ_PATIENT_DATA,
  ],
  [UserRole.NURSE]: [
    Permission.READ_PATIENT_DATA,
    Permission.WRITE_PATIENT_DATA,
    Permission.READ_APPOINTMENT,
  ],
};
```

#### Authorization Middleware
```typescript
// Authorization decorator
function RequirePermission(permission: Permission) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const context = this.getContext();
      const user = context.user;
      
      // Check if user has required permission
      const hasPermission = await authorizationService.hasPermission(
        user.id,
        permission
      );
      
      if (!hasPermission) {
        throw new ForbiddenError(`Insufficient permissions for ${permission}`);
      }
      
      // Log access attempt
      await auditService.logAccess({
        userId: user.id,
        resource: propertyName,
        permission,
        action: 'EXECUTE',
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        timestamp: new Date(),
      });
      
      return method.apply(this, args);
    };
  };
}

// Usage example
class AppointmentService {
  @RequirePermission(Permission.CREATE_APPOINTMENT)
  async createAppointment(data: CreateAppointmentData) {
    // Method implementation
  }
}
```

---

## Data Encryption & Protection

### Encryption Strategy

#### Data at Rest Encryption
```typescript
// Encryption service
class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyDerivationRounds = 100000;

  async encrypt(data: string, key: string): Promise<string> {
    const iv = crypto.randomBytes(16);
    const salt = crypto.randomBytes(16);
    
    // Derive key using PBKDF2
    const derivedKey = crypto.pbkdf2Sync(
      key,
      salt,
      this.keyDerivationRounds,
      32,
      'sha512'
    );
    
    const cipher = crypto.createCipher(this.algorithm, derivedKey);
    cipher.setAAD(Buffer.from('healthcare-data'));
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Return combined data
    return Buffer.concat([
      salt,
      iv,
      authTag,
      Buffer.from(encrypted, 'hex')
    ]).toString('base64');
  }

  async decrypt(encryptedData: string, key: string): Promise<string> {
    const buffer = Buffer.from(encryptedData, 'base64');
    
    // Extract components
    const salt = buffer.subarray(0, 16);
    const iv = buffer.subarray(16, 32);
    const authTag = buffer.subarray(32, 48);
    const encrypted = buffer.subarray(48);
    
    // Derive key
    const derivedKey = crypto.pbkdf2Sync(
      key,
      salt,
      this.keyDerivationRounds,
      32,
      'sha512'
    );
    
    const decipher = crypto.createDecipher(this.algorithm, derivedKey);
    decipher.setAAD(Buffer.from('healthcare-data'));
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted.toString('hex'), 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}

// Database encryption middleware
class DatabaseEncryption {
  constructor(
    private encryptionService: EncryptionService,
    private encryptionKey: string
  ) {}

  async encryptField(table: string, field: string, value: any): Promise<any> {
    if (this.isSensitiveField(table, field)) {
      return await this.encryptionService.encrypt(
        JSON.stringify(value),
        this.encryptionKey
      );
    }
    return value;
  }

  async decryptField(table: string, field: string, value: any): Promise<any> {
    if (this.isSensitiveField(table, field) && value) {
      const decrypted = await this.encryptionService.decrypt(value, this.encryptionKey);
      return JSON.parse(decrypted);
    }
    return value;
  }

  private isSensitiveField(table: string, field: string): boolean {
    const sensitiveFields = [
      'nric', 'phone', 'address', 'emergency_contact',
      'medical_conditions', 'allergies', 'medication',
      'symptoms', 'diagnosis', 'treatment_notes'
    ];
    
    return sensitiveFields.includes(field);
  }
}
```

#### Transport Layer Security
```typescript
// HTTPS configuration
const securityHeaders = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': `
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://www.google-analytics.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: https:;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://api.stripe.com https://api.myinfo.gov.sg;
    frame-src 'self' https://js.stripe.com;
  `.replace(/\s+/g, ' ').trim(),
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
};

// TLS configuration
const tlsConfig = {
  minVersion: 'TLSv1.3',
  ciphers: [
    'TLS_AES_256_GCM_SHA384',
    'TLS_CHACHA20_POLY1305_SHA256',
    'TLS_AES_128_GCM_SHA256',
  ].join(':'),
  honorCipherOrder: true,
  serverPreference: true,
};
```

### Key Management

#### Key Management System
```typescript
// Key management service
class KeyManagementService {
  private keys: Map<string, CryptoKey> = new Map();
  private keyRotationInterval = 24 * 60 * 60 * 1000; // 24 hours

  async initializeKeyRotation(): Promise<void> {
    // Generate initial master key
    await this.generateMasterKey();
    
    // Start periodic key rotation
    setInterval(async () => {
      await this.rotateKeys();
    }, this.keyRotationInterval);
  }

  async generateMasterKey(): Promise<string> {
    const key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
    
    const keyId = `master-${Date.now()}`;
    this.keys.set(keyId, key);
    
    // Store in secure key management system
    await this.storeKeySecurely(keyId, key);
    
    return keyId;
  }

  async rotateKeys(): Promise<void> {
    console.log('Rotating encryption keys...');
    
    const newKeyId = await this.generateMasterKey();
    
    // Re-encrypt data with new key
    await this.reencryptAllData(newKeyId);
    
    // Remove old key
    for (const [keyId] of this.keys) {
      if (keyId !== newKeyId) {
        await this.deleteKey(keyId);
        this.keys.delete(keyId);
      }
    }
  }

  async getKey(keyId: string): Promise<CryptoKey | null> {
    let key = this.keys.get(keyId);
    
    if (!key) {
      // Retrieve from secure storage
      key = await this.retrieveKey(keyId);
      if (key) {
        this.keys.set(keyId, key);
      }
    }
    
    return key || null;
  }
}
```

---

## Access Control & Monitoring

### User Access Control

#### Attribute-Based Access Control (ABAC)
```typescript
// Access control service
class AccessControlService {
  async evaluateAccess(
    userId: string,
    resource: string,
    action: string,
    context: AccessContext
  ): Promise<AccessDecision> {
    const user = await this.getUser(userId);
    const resourceData = await this.getResource(resource, context.resourceId);
    
    // Evaluate attribute-based rules
    const rules = await this.getAccessRules(user.role, resource, action);
    
    for (const rule of rules) {
      const result = await this.evaluateRule(rule, user, resourceData, context);
      
      if (result.decision === 'DENY') {
        return {
          decision: 'DENY',
          reason: result.reason,
          obligations: result.obligations,
        };
      }
      
      if (result.decision === 'PERMIT') {
        return {
          decision: 'PERMIT',
          obligations: result.obligations,
        };
      }
    }
    
    return { decision: 'DENY', reason: 'No matching access rule' };
  }

  private async evaluateRule(
    rule: AccessRule,
    user: User,
    resource: any,
    context: AccessContext
  ): Promise<RuleEvaluationResult> {
    // Time-based access control
    if (rule.timeRestrictions) {
      const now = new Date();
      if (!this.isWithinTimeWindow(now, rule.timeRestrictions)) {
        return {
          decision: 'DENY',
          reason: 'Access outside allowed time window',
        };
      }
    }
    
    // Location-based access control
    if (rule.locationRestrictions) {
      const userLocation = context.ipAddress;
      if (!this.isAllowedLocation(userLocation, rule.locationRestrictions)) {
        return {
          decision: 'DENY',
          reason: 'Access from unauthorized location',
        };
      }
    }
    
    // Data attribute access control
    if (rule.dataAttributes) {
      for (const [attribute, value] of Object.entries(rule.dataAttributes)) {
        if (resource[attribute] !== value) {
          return {
            decision: 'DENY',
            reason: `Resource attribute ${attribute} does not match required value`,
          };
        }
      }
    }
    
    return { decision: 'PERMIT', obligations: rule.obligations || [] };
  }
}
```

#### Session Security
```typescript
// Session monitoring
class SessionSecurity {
  async monitorSession(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    
    // Detect session hijacking
    if (await this.isSessionHijacked(session)) {
      await this.invalidateSession(sessionId);
      await this.alertSecurityTeam('Session hijacking detected', { sessionId });
    }
    
    // Monitor concurrent sessions
    const activeSessions = await this.getUserActiveSessions(session.userId);
    if (activeSessions.length > MAX_CONCURRENT_SESSIONS) {
      await this.invalidateOldestSession(session.userId);
    }
    
    // Monitor session anomalies
    await this.detectAnomalousBehavior(session);
  }

  private async detectAnomalousBehavior(session: SessionData): Promise<void> {
    const anomalies = await Promise.all([
      this.detectUnusualLoginTime(session),
      this.detectUnusualLocation(session),
      this.detectUnusualDevice(session),
      this.detectUnusualActivityPattern(session),
    ]);
    
    const detectedAnomalies = anomalies.filter(Boolean);
    
    if (detectedAnomalies.length > 0) {
      await this.handleSecurityAnomaly(session, detectedAnomalies);
    }
  }
}
```

### Security Monitoring

#### Real-time Threat Detection
```typescript
// Security monitoring service
class SecurityMonitoringService {
  private threatRules: ThreatRule[] = [
    {
      name: 'Multiple Failed Login Attempts',
      condition: async (event: SecurityEvent) => {
        const failedAttempts = await this.getFailedLoginAttempts(event.userId, 300); // 5 minutes
        return failedAttempts >= 5;
      },
      severity: 'HIGH',
      action: 'BLOCK_IP',
    },
    {
      name: 'Suspicious Data Access Pattern',
      condition: async (event: SecurityEvent) => {
        const accessPattern = await this.analyzeAccessPattern(event.userId);
        return accessPattern.riskScore > 0.8;
      },
      severity: 'MEDIUM',
      action: 'ALERT',
    },
    {
      name: 'Privilege Escalation Attempt',
      condition: async (event: SecurityEvent) => {
        return event.eventType === 'PRIVILEGE_ESCALATION_ATTEMPT';
      },
      severity: 'CRITICAL',
      action: 'IMMEDIATE_BLOCK',
    },
  ];

  async processSecurityEvent(event: SecurityEvent): Promise<void> {
    // Log security event
    await this.logSecurityEvent(event);
    
    // Evaluate against threat rules
    for (const rule of this.threatRules) {
      const isTriggered = await rule.condition(event);
      
      if (isTriggered) {
        await this.handleSecurityThreat(rule, event);
      }
    }
  }

  private async handleSecurityThreat(rule: ThreatRule, event: SecurityEvent): Promise<void> {
    switch (rule.action) {
      case 'BLOCK_IP':
        await this.blockIPAddress(event.ipAddress, 3600); // 1 hour
        break;
        
      case 'IMMEDIATE_BLOCK':
        await this.blockUser(event.userId);
        await this.blockIPAddress(event.ipAddress, 86400); // 24 hours
        break;
        
      case 'ALERT':
        await this.alertSecurityTeam(rule.name, { event, rule });
        break;
    }
    
    // Create incident record
    await this.createSecurityIncident({
      rule: rule.name,
      event,
      severity: rule.severity,
      timestamp: new Date(),
      status: 'OPEN',
    });
  }
}
```

---

## Compliance Framework

### PDPA Compliance

#### Data Protection Principles Implementation
```typescript
// PDPA compliance service
class PDPAService {
  // Principle 1: Consent
  async obtainConsent(
    userId: string,
    purpose: string[],
    consentType: ConsentType
  ): Promise<ConsentRecord> {
    const consent = await this.generateConsentRecord(userId, purpose, consentType);
    
    // Store consent with timestamp
    await this.storeConsent(consent);
    
    // Log consent action
    await this.logConsentAction('CONSENT_OBTAINED', userId, consent);
    
    return consent;
  }

  // Principle 2: Purpose Limitation
  async validatePurpose(
    userId: string,
    dataType: string,
    purpose: string
  ): Promise<boolean> {
    const consents = await this.getUserConsents(userId);
    const dataProcessing = await this.getDataProcessingRecord(userId, dataType);
    
    // Check if purpose is covered by consent
    const hasConsent = consents.some(consent => 
      consent.purpose.includes(purpose) && consent.consentGiven
    );
    
    // Check if purpose matches original collection purpose
    const purposeMatches = dataProcessing?.purpose === purpose;
    
    return hasConsent && purposeMatches;
  }

  // Principle 3: Notification
  async provideNotification(userId: string): Promise<NotificationData> {
    return {
      dataProtectionOfficer: {
        name: 'Data Protection Officer',
        email: 'dpo@myfamilyclinic.sg',
        phone: '+65-6123-4567',
      },
      purposes: await this.getUserPurposes(userId),
      retentionPeriods: await this.getRetentionPeriods(userId),
      rights: await this.getUserRights(userId),
      withdrawalMethod: 'through user dashboard or contact dpo',
      lastUpdated: new Date(),
    };
  }

  // Principle 4: Access and Correction
  async provideAccess(userId: string): Promise<UserDataAccess> {
    const userData = await this.getUserData(userId);
    const processingActivities = await this.getProcessingActivities(userId);
    
    return {
      personalData: userData,
      processingActivities,
      dataSources: await this.getDataSources(userId),
      thirdPartySharing: await this.getThirdPartySharing(userId),
      retentionPeriods: await this.getRetentionPeriods(userId),
    };
  }

  // Principle 5: Accuracy
  async validateDataAccuracy(userId: string): Promise<AccuracyReport> {
    const dataQuality = await this.assessDataQuality(userId);
    const validationErrors = await this.findValidationErrors(userId);
    
    return {
      overallAccuracy: dataQuality.accuracy,
      validationErrors,
      lastUpdated: new Date(),
      requiresCorrection: validationErrors.length > 0,
    };
  }

  // Principle 6: Security Safeguards
  async implementSecuritySafeguards(): Promise<SecurityStatus> {
    return {
      encryptionLevel: 'AES-256-GCM',
      accessControls: 'Multi-factor authentication with RBAC',
      monitoringSystem: 'Real-time threat detection',
      backupSystem: 'Automated daily backups with encryption',
      incidentResponse: '24/7 security monitoring and response',
      lastAuditDate: await this.getLastSecurityAudit(),
    };
  }

  // Principle 7: Transfer Limitation
  async validateCrossBorderTransfer(
    destinationCountry: string,
    userId: string
  ): Promise<TransferValidation> {
    const adequacyStatus = await this.checkAdequacyDecision(destinationCountry);
    const safeguards = await this.getSafeguards(destinationCountry);
    const userConsent = await this.getUserConsentForTransfer(userId);
    
    return {
      adequateProtection: adequacyStatus.adequate,
      safeguardsImplemented: safeguards.length > 0,
      userConsentObtained: userConsent,
      transferAllowed: adequacyStatus.adequate || (safeguards.length > 0 && userConsent),
      safeguards: safeguards,
    };
  }
}
```

### MOH Compliance

#### Healthcare Data Standards
```typescript
// MOH compliance service
class MOHComplianceService {
  async validateMOHRequirements(dataType: string): Promise<ComplianceStatus> {
    const requirements = await this.getMOHRequirements(dataType);
    
    return {
      dataType,
      requirements: requirements.map(req => ({
        requirement: req.description,
        status: this.evaluateRequirement(req, dataType),
        evidence: this.getEvidence(req, dataType),
      })),
      overallCompliance: await this.calculateOverallCompliance(dataType),
      lastAssessment: new Date(),
    };
  }

  async generateMOHReport(reportType: MOHReportType): Promise<MOHReport> {
    switch (reportType) {
      case MOHReportType.PATIENT_SAFETY:
        return this.generatePatientSafetyReport();
        
      case MOHReportType.DATA_SECURITY:
        return this.generateDataSecurityReport();
        
      case MOHReportType.SERVICE_QUALITY:
        return this.generateServiceQualityReport();
        
      case MOHReportType.COMPLIANCE_SUMMARY:
        return this.generateComplianceSummaryReport();
    }
  }

  async validateHealthierSGCompliance(): Promise<HealthierSGCompliance> {
    const enrollmentData = await this.getHealthierSGEnrollments();
    const eligibilityAssessments = await this.getEligibilityAssessments();
    const programOutcomes = await this.getProgramOutcomes();
    
    return {
      enrollmentCompliance: this.validateEnrollmentCompliance(enrollmentData),
      eligibilityCompliance: this.validateEligibilityCompliance(eligibilityAssessments),
      outcomeReporting: this.validateOutcomeReporting(programOutcomes),
      dataProtection: await this.validateHealthierSGDataProtection(),
      transparencyRequirements: await this.validateTransparencyRequirements(),
    };
  }
}
```

### GDPR Compliance (for International Users)

#### Data Subject Rights Implementation
```typescript
// GDPR rights service
class GDPRService {
  // Right to Information (Article 13 & 14)
  async provideInformation(userId: string): Promise<PrivacyNotice> {
    return {
      controller: {
        name: 'My Family Clinic Pte Ltd',
        address: '1 Healthcare Drive, Singapore 138547',
        contact: 'privacy@myfamilyclinic.sg',
        dpo: 'Data Protection Officer',
      },
      purposes: await this.getProcessingPurposes(userId),
      legalBasis: await this.getLegalBasis(userId),
      recipients: await this.getDataRecipients(userId),
      retentionPeriods: await this.getRetentionPeriods(userId),
      rights: this.getUserRights(),
      transfers: await this.getInternationalTransfers(userId),
    };
  }

  // Right of Access (Article 15)
  async respondToAccessRequest(userId: string): Promise<AccessRequestResponse> {
    const personalData = await this.getPersonalData(userId);
    const processingActivities = await this.getProcessingActivities(userId);
    const recipients = await this.getDataRecipients(userId);
    const transfers = await this.getInternationalTransfers(userId);
    
    return {
      personalData,
      processingActivities,
      recipients,
      transfers,
      rightsExercised: [],
      responseDate: new Date(),
      nextSteps: 'Review provided data and respond within 30 days if necessary',
    };
  }

  // Right to Rectification (Article 16)
  async processRectificationRequest(
    userId: string,
    corrections: DataCorrection[]
  ): Promise<RectificationResult> {
    const results = [];
    
    for (const correction of corrections) {
      try {
        // Validate correction request
        await this.validateCorrectionRequest(userId, correction);
        
        // Apply correction
        await this.applyCorrection(userId, correction);
        
        // Notify recipients
        await this.notifyDataRecipients(userId, correction);
        
        results.push({
          field: correction.field,
          status: 'SUCCESS',
          oldValue: correction.oldValue,
          newValue: correction.newValue,
        });
      } catch (error) {
        results.push({
          field: correction.field,
          status: 'FAILED',
          error: error.message,
        });
      }
    }
    
    return {
      userId,
      results,
      completionDate: new Date(),
      nextSteps: 'Corrections applied and recipients notified',
    };
  }

  // Right to Erasure (Article 17)
  async processErasureRequest(userId: string, reason: ErasureReason): Promise<ErasureResult> {
    const legalBasis = await this.getLegalBasis(userId);
    
    // Check if erasure is legally permissible
    if (!this.isErasurePermitted(legalBasis, reason)) {
      throw new Error('Erasure request not permitted under applicable law');
    }
    
    // Perform erasure
    const erasureResults = await this.performDataErasure(userId, reason);
    
    // Notify recipients
    await this.notifyRecipientsOfErasure(userId);
    
    // Update records
    await this.updateErasureRecords(userId, erasureResults);
    
    return {
      userId,
      erasureResults,
      erasureDate: new Date(),
      confirmationSent: true,
    };
  }

  // Right to Data Portability (Article 20)
  async processPortabilityRequest(userId: string): Promise<DataPortabilityResponse> {
    const portableData = await this.getPortableData(userId);
    
    return {
      userId,
      data: portableData,
      format: 'JSON',
      transmissionMethod: 'SECURE_DOWNLOAD',
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      downloadUrl: await this.generateSecureDownloadUrl(userId),
    };
  }

  // Right to Object (Article 21)
  async processObjection(userId: string, objection: DataObjection): Promise<ObjectionResult> {
    const processingBasis = await this.getProcessingBasis(userId, objection.dataType);
    
    // Stop processing if objection is valid
    if (objection.legalBasis === 'legitimate_interests' && objection.grounds === 'particular_situation') {
      await this.stopProcessing(userId, objection.dataType);
      
      return {
        userId,
        objectionAccepted: true,
        processingStopped: true,
        stopDate: new Date(),
      };
    }
    
    return {
      userId,
      objectionAccepted: false,
      reasons: ['Processing necessary for legal obligation'],
    };
  }
}
```

---

## Audit & Compliance Monitoring

### Comprehensive Audit Trail

#### Audit Logging System
```typescript
// Audit service
class AuditService {
  async logAccess(params: AuditParams): Promise<void> {
    const auditRecord = {
      id: uuidv4(),
      timestamp: new Date(),
      eventType: params.eventType,
      userId: params.userId,
      userRole: params.userRole,
      resource: params.resource,
      action: params.action,
      outcome: params.outcome,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      sessionId: params.sessionId,
      riskScore: await this.calculateRiskScore(params),
      complianceFlags: this.determineComplianceFlags(params),
    };
    
    await this.storeAuditRecord(auditRecord);
    
    // Real-time monitoring for high-risk events
    if (auditRecord.riskScore > 0.7) {
      await this.triggerHighRiskAlert(auditRecord);
    }
  }

  async generateComplianceReport(
    startDate: Date,
    endDate: Date,
    frameworks: ComplianceFramework[]
  ): Promise<ComplianceReport> {
    const auditData = await this.getAuditData(startDate, endDate);
    
    const report = {
      reportingPeriod: { startDate, endDate },
      frameworks: {},
      executiveSummary: await this.generateExecutiveSummary(auditData),
      detailedFindings: await this.generateDetailedFindings(auditData),
      recommendations: await this.generateRecommendations(auditData),
      nextReviewDate: new Date(endDate.getTime() + 90 * 24 * 60 * 60 * 1000), // 90 days
    };
    
    for (const framework of frameworks) {
      report.frameworks[framework] = await this.evaluateFrameworkCompliance(
        framework,
        auditData
      );
    }
    
    return report;
  }
}

// Audit event types
enum AuditEventType {
  // Authentication events
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  LOGOUT = 'LOGOUT',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  MFA_SETUP = 'MFA_SETUP',
  
  // Data access events
  DATA_READ = 'DATA_READ',
  DATA_WRITE = 'DATA_WRITE',
  DATA_DELETE = 'DATA_DELETE',
  DATA_EXPORT = 'DATA_EXPORT',
  
  // System events
  SYSTEM_ACCESS = 'SYSTEM_ACCESS',
  CONFIGURATION_CHANGE = 'CONFIGURATION_CHANGE',
  BACKUP_OPERATION = 'BACKUP_OPERATION',
  
  // Compliance events
  CONSENT_GIVEN = 'CONSENT_GIVEN',
  CONSENT_WITHDRAWN = 'CONSENT_WITHDRAWN',
  DATA_PROCESSING = 'DATA_PROCESSING',
  CROSS_BORDER_TRANSFER = 'CROSS_BORDER_TRANSFER',
}
```

### Continuous Compliance Monitoring

#### Compliance Monitoring Dashboard
```typescript
// Compliance monitoring service
class ComplianceMonitoringService {
  async monitorCompliance(): Promise<ComplianceStatus> {
    const checks = await Promise.all([
      this.checkPDPACompliance(),
      this.checkMOHCompliance(),
      this.checkGDPRCompliance(),
      this.checkSecurityControls(),
      this.checkDataQuality(),
    ]);
    
    return {
      overallScore: this.calculateOverallScore(checks),
      pdpa: checks[0],
      moh: checks[1],
      gdpr: checks[2],
      security: checks[3],
      dataQuality: checks[4],
      lastCheck: new Date(),
      recommendations: await this.generateRecommendations(checks),
    };
  }

  async checkPDPACompliance(): Promise<PDPAComplianceStatus> {
    return {
      consentManagement: await this.assessConsentManagement(),
      dataAccuracy: await this.assessDataAccuracy(),
      dataSecurity: await this.assessDataSecurity(),
      notificationCompliance: await this.assessNotificationCompliance(),
      crossBorderTransfers: await this.assessCrossBorderTransfers(),
      individualRights: await this.assessIndividualRights(),
    };
  }

  async checkSecurityControls(): Promise<SecurityComplianceStatus> {
    const controls = [
      await this.checkEncryptionControls(),
      await this.checkAccessControls(),
      await this.checkAuthenticationControls(),
      await this.checkMonitoringControls(),
      await this.checkIncidentResponse(),
    ];
    
    return {
      encryption: controls[0],
      accessControl: controls[1],
      authentication: controls[2],
      monitoring: controls[3],
      incidentResponse: controls[4],
      overallScore: controls.reduce((sum, control) => sum + control.score, 0) / controls.length,
    };
  }
}
```

---

## Incident Response

### Security Incident Response Plan

#### Incident Classification
```typescript
// Incident response service
class IncidentResponseService {
  private incidentSeverityMatrix = {
    // Critical: Immediate response required
    CRITICAL: {
      examples: [
        'Data breach with patient records exposed',
        'System compromise with unauthorized access',
        'Ransomware attack on healthcare systems',
        'Loss of critical medical data',
      ],
      responseTime: '15 minutes',
      escalationLevel: 'Executive Team',
      notificationRequired: ['CEO', 'CTO', 'CISO', 'Legal', 'Compliance'],
    },
    
    // High: Response within 1 hour
    HIGH: {
      examples: [
        'Failed authentication attempts exceeding threshold',
        'Suspicious data access patterns',
        'System availability issues',
        'Compliance violation detected',
      ],
      responseTime: '1 hour',
      escalationLevel: 'Management Team',
      notificationRequired: ['CTO', 'CISO', 'Compliance'],
    },
    
    // Medium: Response within 4 hours
    MEDIUM: {
      examples: [
        'Policy violations',
        'Performance degradation',
        'Non-critical system errors',
        'Minor security events',
      ],
      responseTime: '4 hours',
      escalationLevel: 'Team Lead',
      notificationRequired: ['Team Lead', 'Security Team'],
    },
    
    // Low: Response within 24 hours
    LOW: {
      examples: [
        'Routine security alerts',
        'System maintenance events',
        'Policy questions',
        'Training requests',
      ],
      responseTime: '24 hours',
      escalationLevel: 'Security Team',
      notificationRequired: ['Security Team'],
    },
  };

  async respondToIncident(incident: SecurityIncident): Promise<IncidentResponse> {
    // Classify incident
    const classification = await this.classifyIncident(incident);
    
    // Activate response team
    const responseTeam = await this.activateResponseTeam(classification.severity);
    
    // Contain the incident
    const containmentActions = await this.containIncident(incident);
    
    // Investigate the incident
    const investigation = await this.investigateIncident(incident);
    
    // Document the response
    const documentation = await this.documentIncident(incident, investigation);
    
    // Notify stakeholders
    await this.notifyStakeholders(incident, classification);
    
    // Post-incident review
    await this.schedulePostIncidentReview(incident);
    
    return {
      incidentId: incident.id,
      classification,
      responseTeam,
      containmentActions,
      investigation,
      documentation,
      completedAt: new Date(),
    };
  }

  private async containIncident(incident: SecurityIncident): Promise<ContainmentAction[]> {
    const actions: ContainmentAction[] = [];
    
    switch (incident.type) {
      case 'DATA_BREACH':
        // Isolate affected systems
        actions.push({
          action: 'ISOLATE_AFFECTED_SYSTEMS',
          timestamp: new Date(),
          performedBy: 'Automated System',
          status: 'COMPLETED',
        });
        
        // Revoke compromised credentials
        actions.push({
          action: 'REVOKE_COMPROMISED_CREDENTIALS',
          timestamp: new Date(),
          performedBy: 'Security Team',
          status: 'IN_PROGRESS',
        });
        break;
        
      case 'UNAUTHORIZED_ACCESS':
        // Block suspicious IP addresses
        actions.push({
          action: 'BLOCK_SUSPICIOUS_IPS',
          timestamp: new Date(),
          performedBy: 'Automated System',
          status: 'COMPLETED',
        });
        
        // Force password resets
        actions.push({
          action: 'FORCE_PASSWORD_RESETS',
          timestamp: new Date(),
          performedBy: 'Security Team',
          status: 'SCHEDULED',
        });
        break;
    }
    
    return actions;
  }
}
```

### Data Breach Response

#### Breach Notification Process
```typescript
// Data breach response
class DataBreachResponseService {
  async handleDataBreach(breach: DataBreach): Promise<BreachResponse> {
    // Immediate response (within 1 hour)
    await this.initiateImmediateResponse(breach);
    
    // Assessment and containment (within 24 hours)
    const assessment = await this.assessBreach(breach);
    
    // Notification to authorities (within 72 hours for PDPA)
    await this.notifyAuthorities(breach, assessment);
    
    // Individual notification (without undue delay)
    await this.notifyAffectedIndividuals(breach, assessment);
    
    // Remediation and recovery
    await this.implementRemediation(breach, assessment);
    
    return {
      breachId: breach.id,
      assessment,
      notifications: {
        authorities: await this.getAuthorityNotifications(breach),
        individuals: await this.getIndividualNotifications(breach),
      },
      remediation: await this.getRemediationActions(breach),
    };
  }

  private async notifyAuthorities(breach: DataBreach, assessment: BreachAssessment): Promise<AuthorityNotification[]> {
    const notifications = [];
    
    // PDPC (Personal Data Protection Commission) notification
    if (assessment.affectedRecords > 0) {
      notifications.push({
        authority: 'PDPC',
        notificationDate: new Date(),
        notificationMethod: 'Online Portal',
        referenceNumber: await this.generateReferenceNumber(),
        status: 'SENT',
      });
    }
    
    // MOH notification for healthcare data
    if (assessment.containsHealthData) {
      notifications.push({
        authority: 'MOH',
        notificationDate: new Date(),
        notificationMethod: 'Secure Email',
        referenceNumber: await this.generateMOHReferenceNumber(),
        status: 'SENT',
      });
    }
    
    // ICO notification for EU residents
    if (assessment.affectsEUResidents) {
      notifications.push({
        authority: 'ICO',
        notificationDate: new Date(),
        notificationMethod: 'Online Form',
        referenceNumber: await this.generateICOReferenceNumber(),
        status: 'SENT',
      });
    }
    
    return notifications;
  }
}
```

---

## Training & Awareness

### Security Training Program

#### Training Curriculum
```typescript
// Security training service
class SecurityTrainingService {
  async deliverTraining(userRole: UserRole): Promise<TrainingPlan> {
    const trainingModules = await this.getTrainingModules(userRole);
    
    return {
      userRole,
      modules: trainingModules.map(module => ({
        ...module,
        completionRequired: module.mandatory,
        deadline: this.calculateDeadline(userRole, module.priority),
        certification: module.certificationRequired,
      })),
      complianceTracking: await this.setupComplianceTracking(userRole),
      refresherSchedule: await this.calculateRefresherSchedule(userRole),
    };
  }

  async trackTrainingCompliance(): Promise<ComplianceReport> {
    const trainingRecords = await this.getTrainingRecords();
    
    return {
      overallCompliance: this.calculateOverallCompliance(trainingRecords),
      roleBasedCompliance: await this.calculateRoleBasedCompliance(trainingRecords),
      overdueTraining: await this.identifyOverdueTraining(trainingRecords),
      upcomingExpirations: await this.identifyUpcomingExpirations(trainingRecords),
      recommendations: await this.generateTrainingRecommendations(trainingRecords),
    };
  }
}

// Training modules by role
const TRAINING_MODULES: Record<UserRole, TrainingModule[]> = {
  [UserRole.PATIENT]: [
    {
      id: 'privacy-basics',
      title: 'Privacy and Data Protection Basics',
      duration: 30,
      mandatory: true,
      priority: 'HIGH',
      certificationRequired: false,
    },
    {
      id: 'account-security',
      title: 'Account Security Best Practices',
      duration: 45,
      mandatory: true,
      priority: 'HIGH',
      certificationRequired: false,
    },
  ],
  
  [UserRole.DOCTOR]: [
    {
      id: 'healthcare-privacy',
      title: 'Healthcare Data Privacy and Security',
      duration: 120,
      mandatory: true,
      priority: 'HIGH',
      certificationRequired: true,
    },
    {
      id: 'moh-compliance',
      title: 'MOH Compliance Requirements',
      duration: 90,
      mandatory: true,
      priority: 'HIGH',
      certificationRequired: true,
    },
    {
      id: 'incident-response',
      title: 'Security Incident Response',
      duration: 60,
      mandatory: true,
      priority: 'MEDIUM',
      certificationRequired: false,
    },
  ],
  
  [UserRole.CLINIC_ADMIN]: [
    {
      id: 'data-protection-officer',
      title: 'Data Protection Officer Responsibilities',
      duration: 180,
      mandatory: true,
      priority: 'HIGH',
      certificationRequired: true,
    },
    {
      id: 'risk-management',
      title: 'Healthcare Risk Management',
      duration: 150,
      mandatory: true,
      priority: 'HIGH',
      certificationRequired: true,
    },
  ],
  
  [UserRole.SYSTEM_ADMIN]: [
    {
      id: 'infrastructure-security',
      title: 'Healthcare Infrastructure Security',
      duration: 240,
      mandatory: true,
      priority: 'HIGH',
      certificationRequired: true,
    },
    {
      id: 'incident-response-technical',
      title: 'Technical Incident Response',
      duration: 180,
      mandatory: true,
      priority: 'HIGH',
      certificationRequired: true,
    },
  ],
};
```

---

## Regular Security Assessments

### Penetration Testing

#### Security Assessment Schedule
```typescript
// Security assessment service
class SecurityAssessmentService {
  async scheduleAssessments(): Promise<AssessmentPlan> {
    return {
      automatedScans: {
        frequency: 'DAILY',
        scope: ['Infrastructure', 'Web Applications', 'Databases'],
        tools: ['OWASP ZAP', 'Nessus', 'Burp Suite'],
      },
      penetrationTesting: {
        frequency: 'QUARTERLY',
        scope: ['External Infrastructure', 'Web Applications', 'Internal Network'],
        methodology: 'OWASP Testing Guide',
        provider: 'Certified Security Testing Provider',
      },
      complianceAudits: {
        frequency: 'ANNUALLY',
        frameworks: ['PDPA', 'MOH Guidelines', 'ISO 27001'],
        provider: 'Certified Compliance Auditor',
      },
      redTeamExercises: {
        frequency: 'SEMI-ANNUALLY',
        scope: ['Social Engineering', 'Physical Security', 'Advanced Threats'],
      },
    };
  }

  async conductVulnerabilityAssessment(): Promise<VulnerabilityAssessment> {
    const scanResults = await this.runAutomatedScans();
    const manualTesting = await this.conductManualTesting();
    const dependencyScanning = await this.scanDependencies();
    
    return {
      scanDate: new Date(),
      automatedFindings: scanResults,
      manualFindings: manualTesting,
      dependencyFindings: dependencyScanning,
      riskRating: this.calculateOverallRisk(scanResults, manualTesting),
      remediation: await this.generateRemediationPlan(scanResults, manualTesting),
    };
  }
}
```

---

## Conclusion

The My Family Clinic security and compliance framework provides:

1. **Comprehensive Protection**: Multi-layered security controls protecting healthcare data
2. **Regulatory Compliance**: Full compliance with PDPA, MOH guidelines, and GDPR
3. **Proactive Monitoring**: Real-time threat detection and continuous compliance monitoring
4. **Incident Preparedness**: Robust incident response procedures with defined escalation paths
5. **Training & Awareness**: Comprehensive security training program for all users
6. **Continuous Improvement**: Regular security assessments and compliance audits

This framework ensures that patient data is protected to the highest standards while maintaining compliance with all applicable regulations and enabling secure, trusted healthcare services for Singapore's healthcare ecosystem.