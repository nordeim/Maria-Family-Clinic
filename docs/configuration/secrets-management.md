# Secrets Management Guide

## Overview

This comprehensive guide outlines the secrets management system for My Family Clinic, ensuring secure handling, storage, and rotation of sensitive credentials while maintaining healthcare compliance and regulatory requirements.

## Secret Categories and Classification

### Critical Secrets (Level 1)
- Database credentials
- Encryption keys
- JWT secrets
- API keys for healthcare services
- Patient data access credentials
- MOH API credentials

### Sensitive Secrets (Level 2)
- Third-party service API keys
- Cloud service credentials
- Service account tokens
- Email service credentials
- SMS/WhatsApp service credentials

### Standard Secrets (Level 3)
- Application configuration
- Non-critical service credentials
- Development environment secrets
- Testing credentials

## Secrets Storage Architecture

### Primary Storage: HashiCorp Vault

```yaml
# Vault Configuration
vault:
  address: "${VAULT_ADDR}"
  namespace: "healthier-sg"
  auth:
    method: "kubernetes"
    role: "healthier-sg-prod"
  
  secrets:
    database:
      path: "database/credentials"
      engine: "kv-v2"
      ttl: "24h"
    
    encryption:
      path: "encryption/keys"
      engine: "transit"
      key_type: "aes256-gcm96"
    
    api_keys:
      path: "api/third-party"
      engine: "kv-v2"
      ttl: "720h"  # 30 days for API keys
```

### Backup Storage: AWS Secrets Manager

```yaml
# AWS Secrets Manager Backup
aws_secrets_manager:
  region: "ap-southeast-1"
  secrets:
    database_master:
      name: "healthier-sg/db-master"
      rotation_enabled: true
      rotation_interval: "30d"
    
    application_encryption:
      name: "healthier-sg/app-encryption"
      rotation_enabled: true
      rotation_interval: "90d"
```

### Local Development: Encrypted Files

```bash
# .env.enc - Encrypted environment file
ENCRYPTED_CONTENT=$(gpg --encrypt --recipient dev@healthiersg.com.sg .env)

# Development secret retrieval script
#!/bin/bash
# scripts/get-dev-secrets.sh

echo "🔐 Retrieving development secrets..."

# Decrypt secrets file
gpg --decrypt .env.enc > .env

# Load secrets
set -a
source .env
set +a

echo "✅ Development secrets loaded"
```

## Secret Lifecycle Management

### 1. Secret Creation

```typescript
// services/secrets/create-secret.ts
import { VaultService } from './vault-service';

export class SecretCreationService {
  async createSecret(name: string, secret: any, metadata: SecretMetadata): Promise<string> {
    // Validate secret requirements
    this.validateSecretRequirements(secret);
    
    // Generate encryption keys if needed
    const encryptedSecret = await this.encryptSecret(secret);
    
    // Store in Vault
    const secretId = await this.vaultService.writeSecret(
      `healthier-sg/secrets/${name}`,
      {
        data: encryptedSecret,
        metadata: {
          ...metadata,
          created_at: new Date().toISOString(),
          created_by: this.getCurrentUser(),
          classification: this.getSecretClassification(secret)
        }
      }
    );
    
    // Audit log
    await this.auditLog.createSecret(name, metadata);
    
    // Setup rotation if required
    if (this.needsRotation(metadata)) {
      await this.setupRotationSchedule(secretId, metadata.rotation_interval);
    }
    
    return secretId;
  }
  
  private validateSecretRequirements(secret: any): void {
    if (secret.type === 'api_key') {
      if (!secret.key || secret.key.length < 32) {
        throw new Error('API keys must be at least 32 characters long');
      }
    }
    
    if (secret.type === 'database') {
      if (!secret.password || secret.password.length < 12) {
        throw new Error('Database passwords must be at least 12 characters long');
      }
    }
  }
}
```

### 2. Secret Rotation

```typescript
// services/secrets/rotation-service.ts
export class SecretRotationService {
  private rotationSchedule: Map<string, RotationJob> = new Map();
  
  async rotateSecret(secretId: string, forceRotation = false): Promise<void> {
    const secret = await this.vaultService.readSecret(secretId);
    const metadata = secret.metadata;
    
    // Check if rotation is due
    if (!forceRotation && !this.isRotationDue(metadata)) {
      return;
    }
    
    // Create rotation job
    const jobId = await this.createRotationJob(secretId);
    
    try {
      // Execute rotation
      await this.executeRotation(secret, jobId);
      
      // Update rotation metadata
      await this.vaultService.updateSecretMetadata(secretId, {
        last_rotated: new Date().toISOString(),
        rotation_job_id: jobId,
        rotation_status: 'completed'
      });
      
      // Notify stakeholders
      await this.notificationService.sendRotationNotification(
        secret.name,
        'success'
      );
      
    } catch (error) {
      await this.handleRotationFailure(jobId, error);
      throw error;
    }
  }
  
  private async executeRotation(secret: any, jobId: string): Promise<void> {
    switch (secret.type) {
      case 'database':
        await this.rotateDatabaseCredentials(secret, jobId);
        break;
      case 'api_key':
        await this.rotateApiKeys(secret, jobId);
        break;
      case 'encryption_key':
        await this.rotateEncryptionKeys(secret, jobId);
        break;
    }
  }
  
  private async rotateDatabaseCredentials(secret: any, jobId: string): Promise<void> {
    const oldCredentials = await this.getCurrentCredentials(secret);
    
    // Generate new credentials
    const newCredentials = await this.generateDatabaseCredentials();
    
    // Update database
    await this.databaseService.updateUserCredentials(
      secret.username,
      newCredentials.password
    );
    
    // Update application
    await this.updateApplicationSecrets(secret.name, newCredentials);
    
    // Test new credentials
    const isValid = await this.testDatabaseConnection(newCredentials);
    if (!isValid) {
      throw new Error('New database credentials are invalid');
    }
    
    // Backup old credentials temporarily
    await this.backupOldCredentials(oldCredentials, jobId);
  }
}
```

### 3. Secret Access Control

```typescript
// services/secrets/access-control.ts
export class SecretAccessControl {
  private accessMatrix: Map<string, Permission[]> = new Map();
  
  async checkAccess(secretId: string, userId: string, action: AccessAction): Promise<boolean> {
    const secret = await this.vaultService.readSecret(secretId);
    const user = await this.userService.getUser(userId);
    
    // Check user permissions
    const userPermissions = await this.getUserPermissions(userId);
    
    // Check secret permissions
    const secretPermissions = await this.getSecretPermissions(secretId);
    
    // Evaluate access rules
    return this.evaluateAccessRules(
      secret,
      user,
      userPermissions,
      secretPermissions,
      action
    );
  }
  
  async grantAccess(secretId: string, userId: string, permissions: Permission[]): Promise<void> {
    // Validate grant permissions
    if (!await this.checkPermission(userId, 'grant_access')) {
      throw new Error('Insufficient permissions to grant access');
    }
    
    // Store access grant
    await this.vaultService.addACLEntry(secretId, {
      user_id: userId,
      permissions,
      granted_by: this.getCurrentUser(),
      granted_at: new Date().toISOString(),
      expires_at: this.calculateExpirationDate(permissions)
    });
    
    // Audit log
    await this.auditLog.grantAccess(secretId, userId, permissions);
  }
  
  private evaluateAccessRules(
    secret: any,
    user: any,
    userPermissions: Permission[],
    secretPermissions: Permission[],
    action: AccessAction
  ): boolean {
    // Rule 1: Service accounts can access their own secrets
    if (user.type === 'service_account' && secret.owning_service === user.service_name) {
      return true;
    }
    
    // Rule 2: Admins can access critical secrets
    if (userPermissions.includes('admin') && secret.classification === 'critical') {
      return true;
    }
    
    // Rule 3: Healthcare data requires PDPA compliance
    if (secret.contains_healthcare_data) {
      const hasPdpaTraining = user.certifications?.includes('pdpa_compliance');
      if (!hasPdpaTraining) {
        return false;
      }
    }
    
    // Rule 4: Time-based access
    if (secret.time_based_access) {
      const currentHour = new Date().getHours();
      if (currentHour < secret.allowed_start_hour || currentHour > secret.allowed_end_hour) {
        return false;
      }
    }
    
    return false;
  }
}
```

## Environment-Specific Secret Management

### Development Environment

```bash
#!/bin/bash
# scripts/dev-secrets-setup.sh

echo "🔧 Setting up development secrets..."

# Create development secrets directory
mkdir -p .secrets/dev

# Generate development JWT secret
openssl rand -base64 32 > .secrets/dev/jwt_secret

# Generate development session secret
openssl rand -base64 32 > .secrets/dev/session_secret

# Create database credentials
cat > .secrets/dev/database.conf << EOF
host=localhost
port=5432
database=healthier_sg_dev
user=dev_user
password=dev_password_$(openssl rand -hex 8)
EOF

# Encrypt secrets file
gpg --symmetric --cipher-algo AES256 .secrets/dev/secrets.txt

echo "✅ Development secrets created"
```

### Staging Environment

```yaml
# .secrets/staging/secrets.yml
apiVersion: v1
kind: Secret
metadata:
  name: healthier-sg-staging-secrets
  namespace: healthier-sg-staging
type: Opaque
stringData:
  database_url: "postgresql://staging_user:${STAGING_DB_PASSWORD}@staging-db:5432/healthier_sg_staging"
  jwt_secret: "${STAGING_JWT_SECRET}"
  sendgrid_api_key: "${STAGING_SENDGRID_KEY}"
  twilio_sid: "${STAGING_TWILIO_SID}"
  twilio_token: "${STAGING_TWILIO_TOKEN}"
  google_maps_key: "${STAGING_GOOGLE_MAPS_KEY}"
  s3_access_key: "${STAGING_S3_ACCESS_KEY}"
  s3_secret_key: "${STAGING_S3_SECRET_KEY}"
data:
  encryption_key: "${STAGING_ENCRYPTION_KEY_B64}"
```

### Production Environment

```typescript
// services/secrets/production-secrets.ts
export class ProductionSecretService {
  private readonly vaultClient: VaultClient;
  private readonly auditLogger: AuditLogger;
  
  constructor() {
    this.vaultClient = new VaultClient({
      address: process.env.VAULT_ADDR,
      namespace: 'healthier-sg/production',
      auth: {
        method: 'kubernetes',
        role: 'healthier-sg-prod'
      }
    });
    
    this.auditLogger = new AuditLogger({
      endpoint: process.env.AUDIT_LOG_ENDPOINT,
      encryption: true,
      complianceMode: 'healthcare'
    });
  }
  
  async getProductionSecret(secretName: string): Promise<any> {
    const secretId = `healthier-sg/secrets/${secretName}`;
    
    try {
      // Log secret access attempt
      await this.auditLogger.logAccessAttempt(
        secretName,
        this.getCurrentUser(),
        'read'
      );
      
      // Retrieve secret from Vault
      const secret = await this.vaultClient.readSecret(secretId);
      
      // Validate access
      await this.validateAccess(secret, 'read');
      
      // Log successful access
      await this.auditLogger.logSecretAccess(
        secretName,
        this.getCurrentUser(),
        'success'
      );
      
      return secret.data;
      
    } catch (error) {
      await this.auditLogger.logSecretAccess(
        secretName,
        this.getCurrentUser(),
        'failure',
        error.message
      );
      
      throw error;
    }
  }
}
```

## Healthcare-Specific Secret Requirements

### MOH API Credentials

```typescript
// services/moh/moh-credentials.ts
export class MOHCredentialManager {
  async getMOHAPICredentials(): Promise<MOHCredentials> {
    const credentials = await this.secrets.getSecret('moh-api-credentials');
    
    return {
      client_id: credentials.client_id,
      private_key: credentials.private_key_pem,
      certificate: credentials.certificate_pem,
      api_endpoint: credentials.api_endpoint,
      token_endpoint: credentials.token_endpoint,
      scopes: credentials.scopes,
      // Healthcare-specific metadata
      license_verification: credentials.license_verification,
      doctor_registration: credentials.doctor_registration,
      clinic_licensing: credentials.clinic_licensing
    };
  }
  
  async refreshMOHToken(): Promise<void> {
    const credentials = await this.getMOHAPICredentials();
    
    const jwt = await this.signJWT({
      iss: credentials.client_id,
      sub: credentials.client_id,
      aud: credentials.token_endpoint,
      exp: Math.floor(Date.now() / 1000) + 300, // 5 minutes
      scope: credentials.scopes.join(' ')
    }, credentials.private_key);
    
    const response = await fetch(credentials.token_endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
        client_assertion: jwt
      })
    });
    
    const tokenData = await response.json();
    
    // Store new token
    await this.secrets.updateSecret('moh-api-token', {
      access_token: tokenData.access_token,
      expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
    });
  }
}
```

### Patient Data Encryption Keys

```typescript
// services/encryption/patient-data-keys.ts
export class PatientDataEncryptionService {
  private readonly encryptionKeyVault: string = 'healthier-sg/encryption/patient-data';
  private readonly keyRotationInterval: number = 90; // days
  
  async generatePatientDataKey(): Promise<string> {
    // Generate encryption key for patient data
    const key = crypto.randomBytes(32);
    
    // Store in hardware security module (HSM)
    const storedKey = await this.hsmStore.storeKey({
      key: key.toString('base64'),
      algorithm: 'AES-256-GCM',
      purpose: 'patient_data_encryption',
      compliance_level: 'healthcare',
      backup_required: true,
      rotation_required: true
    });
    
    return storedKey.key_id;
  }
  
  async rotatePatientDataKeys(): Promise<RotationResult> {
    const currentKeys = await this.getActiveEncryptionKeys('patient_data');
    const newKey = await this.generatePatientDataKey();
    
    // Re-encrypt data with new key
    await this.reencryptPatientData(currentKeys, newKey);
    
    // Mark old keys for deactivation
    for (const key of currentKeys) {
      await this.scheduleKeyDeactivation(key.id, 30); // 30 days
    }
    
    return {
      new_key_id: newKey,
      old_keys_deactivated: currentKeys.length,
      rotation_completed_at: new Date().toISOString()
    };
  }
}
```

## Secret Monitoring and Audit

### Audit Logging

```typescript
// services/audit/secret-audit.ts
export class SecretAuditService {
  async logSecretOperation(operation: SecretOperation): Promise<void> {
    const auditRecord: AuditRecord = {
      timestamp: new Date().toISOString(),
      operation: operation.type,
      secret_name: operation.secretName,
      user_id: operation.userId,
      user_role: operation.userRole,
      ip_address: operation.ipAddress,
      user_agent: operation.userAgent,
      environment: operation.environment,
      success: operation.success,
      failure_reason: operation.failureReason,
      metadata: {
        secret_classification: operation.classification,
        contains_healthcare_data: operation.containsHealthcareData,
        compliance_mode: operation.complianceMode,
        pdpa_relevant: operation.pdpaRelevant,
        moh_relevant: operation.mohRelevant
      }
    };
    
    // Store in tamper-evident log
    await this.storeAuditRecord(auditRecord);
    
    // Alert on suspicious activities
    await this.checkForSuspiciousActivity(auditRecord);
  }
  
  async generateComplianceReport(period: DateRange): Promise<ComplianceReport> {
    const auditRecords = await this.getAuditRecords(period);
    
    return {
      period: period,
      total_access_attempts: auditRecords.length,
      successful_access: auditRecords.filter(r => r.success).length,
      failed_access: auditRecords.filter(r => !r.success).length,
      healthcare_data_access: auditRecords.filter(r => r.metadata.contains_healthcare_data).length,
      pdpa_compliant_access: await this.checkPdpaCompliance(auditRecords),
      moh_compliant_access: await this.checkMohCompliance(auditRecords),
      suspicious_activities: await this.identifySuspiciousActivities(auditRecords),
      recommendations: await this.generateRecommendations(auditRecords)
    };
  }
}
```

### Real-time Monitoring

```typescript
// services/monitoring/secret-monitoring.ts
export class SecretMonitoringService {
  private readonly alertingRules: AlertingRule[] = [
    {
      name: 'multiple_failed_access',
      condition: (record) => record.failure_count > 5,
      severity: 'warning',
      action: 'alert_security_team'
    },
    {
      name: 'unusual_access_pattern',
      condition: (record) => this.isUnusualAccessPattern(record),
      severity: 'critical',
      action: 'immediate_alert'
    },
    {
      name: 'healthcare_data_access_outside_hours',
      condition: (record) => this.isOutsideBusinessHours(record) && record.containsHealthcareData,
      severity: 'high',
      action: 'alert_compliance_officer'
    }
  ];
  
  async monitorSecretAccess(accessRecord: AccessRecord): Promise<void> {
    // Check against alerting rules
    for (const rule of this.alertingRules) {
      if (rule.condition(accessRecord)) {
        await this.triggerAlert(rule, accessRecord);
      }
    }
    
    // Update metrics
    await this.updateMetrics(accessRecord);
    
    // Check for compliance violations
    await this.checkCompliance(accessRecord);
  }
}
```

## Disaster Recovery for Secrets

### Secret Backup Strategy

```yaml
# disaster-recovery/secrets-backup.yml
backup_strategy:
  schedule: "0 2 * * *" # Daily at 2 AM
  retention: "7-years" # Healthcare compliance requirement
  
  storage_layers:
    primary:
      type: "hashicorp_vault"
      location: "primary-vault.singapore"
      encryption: "AES-256-GCM"
      replication: "geographic"
    
    secondary:
      type: "aws_secrets_manager"
      location: "ap-southeast-1"
      encryption: "aws_kms"
      cross_region_replication: true
    
    tertiary:
      type: "hsm_backup"
      location: "secure_offsite"
      encryption: "fips_140_2_level_4"
      physical_security: "grade_a"
```

### Recovery Procedures

```typescript
// services/disaster-recovery/secret-recovery.ts
export class SecretRecoveryService {
  async recoverFromDisaster(): Promise<RecoveryStatus> {
    try {
      // Step 1: Verify backup integrity
      await this.verifyBackupIntegrity();
      
      // Step 2: Restore secrets from backup
      const restoredSecrets = await this.restoreSecretsFromBackup();
      
      // Step 3: Validate restored secrets
      await this.validateRestoredSecrets(restoredSecrets);
      
      // Step 4: Update application configuration
      await this.updateApplicationConfiguration(restoredSecrets);
      
      // Step 5: Test secret functionality
      await this.testSecretFunctionality(restoredSecrets);
      
      return {
        status: 'completed',
        recovered_secrets: restoredSecrets.length,
        recovery_time: new Date(),
        validation_passed: true
      };
      
    } catch (error) {
      return {
        status: 'failed',
        error: error.message,
        recovery_time: new Date()
      };
    }
  }
  
  private async restoreSecretsFromBackup(): Promise<RestoredSecret[]> {
    const backupSources = [
      this.vaultBackup,
      this.awsSecretsBackup,
      this.hsmBackup
    ];
    
    const restoredSecrets = [];
    
    for (const backup of backupSources) {
      try {
        const secrets = await backup.restore();
        restoredSecrets.push(...secrets);
      } catch (error) {
        console.warn(`Backup restoration failed for ${backup.type}:`, error);
      }
    }
    
    return this.deduplicateSecrets(restoredSecrets);
  }
}
```

## Security Compliance and Validation

### PDPA Compliance

```typescript
// services/compliance/pdpa-secret-compliance.ts
export class PDPASecretCompliance {
  async validateSecretHandling(): Promise<ValidationResult> {
    const issues = [];
    
    // Check data minimization
    const secrets = await this.getAllSecrets();
    for (const secret of secrets) {
      if (secret.contains_personal_data && secret.data_retention_period > 2555) { // 7 years
        issues.push({
          type: 'data_retention_exceeded',
          secret: secret.name,
          issue: 'Personal data retention exceeds PDPA requirements'
        });
      }
    }
    
    // Check consent tracking
    const consentRecords = await this.getConsentRecords();
    for (const record of consentRecords) {
      if (record.used_for_secret_access && !record.appropriate_consent) {
        issues.push({
          type: 'consent_missing',
          user: record.user_id,
          issue: 'No appropriate consent for secret access'
        });
      }
    }
    
    return {
      compliant: issues.length === 0,
      issues: issues,
      recommendations: this.generateRecommendations(issues)
    };
  }
}
```

### MOH Compliance

```typescript
// services/compliance/moh-secret-compliance.ts
export class MOHSecretCompliance {
  async validateHealthcareDataHandling(): Promise<MOHComplianceReport> {
    const healthcareSecrets = await this.getHealthcareSecrets();
    const auditTrail = await this.getAuditTrail();
    
    return {
      compliance_status: await this.assessCompliance(healthcareSecrets, auditTrail),
      healthcare_data_encrypted: await this.verifyEncryption(healthcareSecrets),
      access_controls_implemented: await this.verifyAccessControls(healthcareSecrets),
      audit_trail_complete: await this.verifyAuditTrail(auditTrail),
      data_lineage_tracked: await this.verifyDataLineage(healthcareSecrets),
      recommendations: await this.generateMohRecommendations()
    };
  }
}
```

## Implementation Checklist

### Development Phase
- [ ] Implement secret creation service
- [ ] Setup Vault development instance
- [ ] Create development secret templates
- [ ] Implement basic rotation logic
- [ ] Setup audit logging
- [ ] Create development tools

### Staging Phase
- [ ] Deploy production Vault to staging
- [ ] Implement full rotation service
- [ ] Setup monitoring and alerting
- [ ] Create backup procedures
- [ ] Implement compliance checks
- [ ] Test disaster recovery

### Production Phase
- [ ] Deploy to production Vault
- [ ] Migrate all secrets
- [ ] Enable production monitoring
- [ ] Setup compliance reporting
- [ ] Implement real-time alerting
- [ ] Execute disaster recovery testing

### Compliance Phase
- [ ] PDPA audit completion
- [ ] MOH compliance validation
- [ ] Security penetration testing
- [ ] Healthcare data protection review
- [ ] Access control audit
- [ ] Documentation completion

---

*This document is part of the My Family Clinic secrets management system and must be reviewed quarterly for compliance with healthcare regulations.*