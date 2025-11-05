# Environment Configuration Guide

## Overview

This guide covers the comprehensive environment configuration setup for the My Family Clinic healthcare platform, ensuring secure, scalable, and compliant configurations across all environments.

## Environment Structure

### Environment Tiers

#### 1. Development Environment
- **Purpose**: Local development and testing
- **Access**: Development team members
- **Data**: Synthetic/test data only
- **Security**: Basic security measures

#### 2. Staging Environment  
- **Purpose**: Pre-production testing and validation
- **Access**: Development, QA, and selected stakeholders
- **Data**: Anonymized production-like data
- **Security**: Production-level security measures

#### 3. Production Environment
- **Purpose**: Live healthcare services
- **Access**: Limited production team
- **Data**: Real patient and healthcare data
- **Security**: Maximum security and compliance

## Configuration Files Structure

### File Organization

```
config/
├── environments/
│   ├── development.env
│   ├── staging.env
│   └── production.env
├── database/
│   ├── development.db.config.json
│   ├── staging.db.config.json
│   └── production.db.config.json
├── services/
│   ├── third-party.config.json
│   └── api-endpoints.config.json
└── features/
    └── feature-flags.config.json
```

### Environment-Specific Configuration Files

#### Development Environment (`development.env`)

```env
# Application Settings
NODE_ENV=development
NEXT_PUBLIC_APP_ENV=development
APP_NAME=My Family Clinic Dev
APP_VERSION=1.0.0-dev
DEBUG_MODE=true

# API Configuration
API_BASE_URL=http://localhost:3000
API_TIMEOUT=30000
API_RATE_LIMIT=1000

# Database Configuration
DATABASE_URL=postgresql://dev_user:dev_password@localhost:5432/healthier_sg_dev
DATABASE_POOL_SIZE=10
DATABASE_SSL=false

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_SESSION_TTL=3600

# Authentication & Security
JWT_SECRET=dev_jwt_secret_key_change_in_production
SESSION_SECRET=dev_session_secret_change_in_production
ENCRYPTION_KEY=dev_encryption_key_for_local_dev_only
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Third-party Services
GOOGLE_MAPS_API_KEY=dev_google_maps_api_key
SENDGRID_API_KEY=dev_sendgrid_api_key
TWILIO_ACCOUNT_SID=dev_twilio_sid

# Healthcare-specific Configuration
MOH_API_BASE_URL=https://dev-api.moh.gov.sg
HEALTHIER_SG_API_URL=https://dev-api.healthiersg.gov.sg
MOH_VERIFICATION_ENABLED=false
PDPA_COMPLIANCE_MODE=development

# Feature Flags
ENABLE_ANALYTICS=true
ENABLE_CHATBOT=true
ENABLE_MOBILE_PUSH=false
ENABLE_TELEMEDICINE=false
ENABLE_DOCTOR_RATINGS=true

# Logging Configuration
LOG_LEVEL=debug
LOG_FORMAT=json
LOG_RETENTION_DAYS=7

# Monitoring
SENTRY_DSN=dev_sentry_dsn
ANALYTICS_ENABLED=false

# Development Tools
HOT_RELOAD=true
SOURCE_MAPS=true
BUNDLE_ANALYZER=false
```

#### Staging Environment (`staging.env`)

```env
# Application Settings
NODE_ENV=staging
NEXT_PUBLIC_APP_ENV=staging
APP_NAME=My Family Clinic Staging
APP_VERSION=1.0.0-staging
DEBUG_MODE=false

# API Configuration
API_BASE_URL=https://staging-api.healthiersg.com.sg
API_TIMEOUT=30000
API_RATE_LIMIT=500
API_COMPRESSION=true

# Database Configuration
DATABASE_URL=${STAGING_DATABASE_URL}
DATABASE_POOL_SIZE=20
DATABASE_SSL=true
DATABASE_BACKUP_ENABLED=true

# Redis Configuration
REDIS_URL=${STAGING_REDIS_URL}
REDIS_SESSION_TTL=3600
REDIS_PERSISTENCE=appendonly

# Authentication & Security
JWT_SECRET=${STAGING_JWT_SECRET}
SESSION_SECRET=${STAGING_SESSION_SECRET}
ENCRYPTION_KEY=${STAGING_ENCRYPTION_KEY}
CORS_ORIGINS=https://staging.healthiersg.com.sg
RATE_LIMIT_ENABLED=true

# Third-party Services
GOOGLE_MAPS_API_KEY=${STAGING_GOOGLE_MAPS_API_KEY}
SENDGRID_API_KEY=${STAGING_SENDGRID_API_KEY}
TWILIO_ACCOUNT_SID=${STAGING_TWILIO_SID}
S3_BUCKET=staging-healthiersg-files

# Healthcare-specific Configuration
MOH_API_BASE_URL=https://staging-api.moh.gov.sg
HEALTHIER_SG_API_URL=https://staging-api.healthiersg.gov.sg
MOH_VERIFICATION_ENABLED=true
PDPA_COMPLIANCE_MODE=staging
HEALTHCARE_DATA_ENCRYPTION=true

# Feature Flags (staging can test most features)
ENABLE_ANALYTICS=true
ENABLE_CHATBOT=true
ENABLE_MOBILE_PUSH=true
ENABLE_TELEMEDICINE=true
ENABLE_DOCTOR_RATINGS=true
ENABLE_ADVANCED_SEARCH=true
ENABLE_MULTILANGUAGE=true

# Logging Configuration
LOG_LEVEL=info
LOG_FORMAT=json
LOG_RETENTION_DAYS=30
LOG_SANITIZATION=true

# Monitoring
SENTRY_DSN=${STAGING_SENTRY_DSN}
ANALYTICS_ENABLED=true
PERFORMANCE_MONITORING=true
ERROR_TRACKING_ENABLED=true

# Security
SSL_TLS_VERSION=1.3
HSTS_ENABLED=true
SECURITY_HEADERS_ENABLED=true
```

#### Production Environment (`production.env`)

```env
# Application Settings
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production
APP_NAME=My Family Clinic
APP_VERSION=1.0.0
DEBUG_MODE=false

# API Configuration
API_BASE_URL=https://api.healthiersg.com.sg
API_TIMEOUT=30000
API_RATE_LIMIT=200
API_COMPRESSION=true
API_CACHING_ENABLED=true

# Database Configuration
DATABASE_URL=${PRODUCTION_DATABASE_URL}
DATABASE_POOL_SIZE=50
DATABASE_SSL=true
DATABASE_ENCRYPTION_AT_REST=true
DATABASE_BACKUP_ENABLED=true
DATABASE_DISASTER_RECOVERY=true

# Redis Configuration
REDIS_URL=${PRODUCTION_REDIS_URL}
REDIS_SESSION_TTL=1800
REDIS_PERSISTENCE=appendonly
REDIS_ENCRYPTION=true

# Authentication & Security
JWT_SECRET=${PRODUCTION_JWT_SECRET}
SESSION_SECRET=${PRODUCTION_SESSION_SECRET}
ENCRYPTION_KEY=${PRODUCTION_ENCRYPTION_KEY}
CORS_ORIGINS=https://healthiersg.com.sg,https://www.healthiersg.com.sg
RATE_LIMIT_ENABLED=true
IP_WHITELIST_ENABLED=true

# Third-party Services
GOOGLE_MAPS_API_KEY=${PRODUCTION_GOOGLE_MAPS_API_KEY}
SENDGRID_API_KEY=${PRODUCTION_SENDGRID_API_KEY}
TWILIO_ACCOUNT_SID=${PRODUCTION_TWILIO_SID}
S3_BUCKET=production-healthiersg-files
CLOUDFLARE_R2_BUCKET=healthiersg-backups

# Healthcare-specific Configuration
MOH_API_BASE_URL=https://api.moh.gov.sg
HEALTHIER_SG_API_URL=https://api.healthiersg.gov.sg
MOH_VERIFICATION_ENABLED=true
PDPA_COMPLIANCE_MODE=production
HEALTHCARE_DATA_ENCRYPTION=true
DATA_RETENTION_POLICY=7years
AUDIT_LOGGING_ENABLED=true

# Feature Flags (controlled rollout)
ENABLE_ANALYTICS=true
ENABLE_CHATBOT=true
ENABLE_MOBILE_PUSH=true
ENABLE_TELEMEDICINE=true
ENABLE_DOCTOR_RATINGS=true
ENABLE_ADVANCED_SEARCH=true
ENABLE_MULTILANGUAGE=true
ENABLE_AI_FEATURES=false
ENABLE_BLOCKCHAIN_VERIFICATION=false

# Logging Configuration
LOG_LEVEL=warn
LOG_FORMAT=json
LOG_RETENTION_DAYS=2555  # 7 years for healthcare compliance
LOG_ENCRYPTION=true
LOG_AUDIT_TRAIL=true

# Monitoring & Observability
SENTRY_DSN=${PRODUCTION_SENTRY_DSN}
ANALYTICS_ENABLED=true
PERFORMANCE_MONITORING=true
ERROR_TRACKING_ENABLED=true
REAL_USER_MONITORING=true
SYNTHETIC_MONITORING=true

# Security Hardening
SSL_TLS_VERSION=1.3
HSTS_ENABLED=true
SECURITY_HEADERS_ENABLED=true
CONTENT_SECURITY_POLICY=enabled
SUBRESOURCE_INTEGRITY=enabled

# Compliance
MOH_COMPLIANCE=true
PDPA_COMPLIANCE=true
HIPAA_COMPATIBILITY=true
ISO27001_COMPATIBILITY=true
```

## Database Configuration

### Development Database Config

```json
{
  "development": {
    "url": "postgresql://dev_user:dev_password@localhost:5432/healthier_sg_dev",
    "options": {
      "ssl": false,
      "poolSize": 10,
      "idleTimeout": 30000,
      "connectionTimeout": 60000,
      "logging": true,
      "loggingOptions": {
        "logger": "dev-logger",
        "logQuery": true,
        "logQueryParameters": true
      },
      "migrations": {
        "directory": "./prisma/migrations",
        "autoRun": true
      },
      "seeds": {
        "directory": "./prisma/seeds",
        "enabled": true,
        "transactional": false
      }
    },
    "healthCheck": {
      "enabled": true,
      "interval": 30000,
      "timeout": 5000
    },
    "backup": {
      "enabled": false,
      "frequency": "none"
    }
  }
}
```

### Production Database Config

```json
{
  "production": {
    "url": "${DATABASE_URL}",
    "options": {
      "ssl": true,
      "poolSize": 50,
      "idleTimeout": 30000,
      "connectionTimeout": 10000,
      "logging": false,
      "loggingOptions": {
        "logger": "production-logger",
        "logQuery": false,
        "logQueryParameters": false,
        "logPerformanceMetrics": true
      },
      "connectionEncryption": true,
      "databaseEncryption": true,
      "backupEncryption": true,
      "migrations": {
        "directory": "./prisma/migrations",
        "autoRun": false,
        "requireManualApproval": true
      },
      "seeds": {
        "directory": "./prisma/seeds",
        "enabled": false,
        "transactional": true
      }
    },
    "healthCheck": {
      "enabled": true,
      "interval": 10000,
      "timeout": 3000
    },
    "backup": {
      "enabled": true,
      "frequency": "every-6-hours",
      "retention": "7-years",
      "encryption": "AES-256",
      "complianceMode": "healthcare"
    },
    "disasterRecovery": {
      "enabled": true,
      "replication": "active-passive",
      "failoverTimeout": 60,
      "dataLossWindow": 300,
      "complianceBackup": true
    }
  }
}
```

## Service Configuration

### Third-party Services Config

```json
{
  "services": {
    "googleMaps": {
      "development": {
        "apiKey": "${GOOGLE_MAPS_API_KEY}",
        "quota": 1000,
        "rateLimit": 100,
        "timeout": 5000,
        "retryAttempts": 3
      },
      "production": {
        "apiKey": "${GOOGLE_MAPS_API_KEY}",
        "quota": 10000,
        "rateLimit": 500,
        "timeout": 5000,
        "retryAttempts": 3,
        "loadBalancing": true,
        "fallbackService": "openstreetmap"
      }
    },
    "sendgrid": {
      "development": {
        "apiKey": "${SENDGRID_API_KEY}",
        "fromEmail": "dev@healthiersg.com.sg",
        "templates": {
          "contactConfirmation": "d-development-template-id",
          "appointmentReminder": "d-development-template-id"
        }
      },
      "production": {
        "apiKey": "${SENDGRID_API_KEY}",
        "fromEmail": "noreply@healthiersg.com.sg",
        "templates": {
          "contactConfirmation": "d-production-template-id",
          "appointmentReminder": "d-production-template-id",
          "pdpaConsent": "d-pdpa-template-id"
        },
        "tracking": {
          "enabled": true,
          "events": ["delivered", "open", "click", "bounce"]
        }
      }
    },
    "twilio": {
      "development": {
        "accountSid": "${TWILIO_ACCOUNT_SID}",
        "authToken": "${TWILIO_AUTH_TOKEN}",
        "fromNumber": "+1234567890",
        "smsEnabled": false,
        "whatsappEnabled": false
      },
      "production": {
        "accountSid": "${TWILIO_ACCOUNT_SID}",
        "authToken": "${TWILIO_AUTH_TOKEN}",
        "fromNumber": "+6598765432",
        "smsEnabled": true,
        "whatsappEnabled": true,
        "verificationService": "service-production-id"
      }
    }
  }
}
```

## Environment Validation

### Configuration Validation Script

```typescript
// scripts/validate-config.ts
import { z } from 'zod';

// Define environment validation schema
const EnvironmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  ENCRYPTION_KEY: z.string().min(32),
  API_BASE_URL: z.string().url(),
  MOH_API_BASE_URL: z.string().url(),
  // Add other required environment variables
});

export function validateEnvironment() {
  try {
    const envVars = EnvironmentSchema.parse(process.env);
    
    // Environment-specific validations
    if (process.env.NODE_ENV === 'production') {
      validateProductionConfig(envVars);
    }
    
    console.log('✅ Environment configuration is valid');
    return true;
  } catch (error) {
    console.error('❌ Environment configuration validation failed:', error);
    process.exit(1);
  }
}

function validateProductionConfig(config: any) {
  const requiredProductionVars = [
    'PRODUCTION_DATABASE_URL',
    'PRODUCTION_JWT_SECRET',
    'PRODUCTION_ENCRYPTION_KEY'
  ];
  
  const missingVars = requiredProductionVars.filter(
    varName => !process.env[varName]
  );
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required production environment variables: ${missingVars.join(', ')}`);
  }
}

// Run validation
validateEnvironment();
```

## Security Configuration

### Security Headers Configuration

```typescript
// config/security.ts
export const securityHeaders = {
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-eval'", "https://www.googletagmanager.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.moh.gov.sg", "https://api.healthiersg.gov.sg"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      workerSrc: ["'self'"],
    },
  },
  
  // HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  
  // Additional Security Headers
  referrerPolicy: 'strict-origin-when-cross-origin',
  xFrameOptions: 'DENY',
  xContentTypeOptions: 'nosniff',
  xXSSProtection: '1; mode=block',
  permissionsPolicy: {
    geolocation: 'none',
    microphone: 'none',
    camera: 'none',
  }
};
```

## Environment Setup Procedures

### Development Environment Setup

1. **Clone Repository**
   ```bash
   git clone https://github.com/your-org/healthier-sg.git
   cd healthier-sg
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Setup Environment**
   ```bash
   cp config/environments/development.env.example .env.local
   # Edit .env.local with your local configuration
   ```

4. **Database Setup**
   ```bash
   npm run db:setup
   npm run db:migrate
   npm run db:seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

### Staging Environment Deployment

1. **Environment Preparation**
   ```bash
   # Deploy infrastructure
   terraform plan -var-file="environments/staging.tfvars"
   terraform apply -var-file="environments/staging.tfvars"
   ```

2. **Configuration Deployment**
   ```bash
   # Deploy secrets and configuration
   kubectl create secret generic healthier-sg-config \
     --from-env-file=config/environments/staging.env \
     --namespace=healthier-sg-staging
   ```

3. **Application Deployment**
   ```bash
   # Deploy application
   kubectl apply -f k8s/staging/
   ```

### Production Environment Deployment

1. **Pre-deployment Checklist**
   - [ ] All tests passing
   - [ ] Security audit completed
   - [ ] Compliance validation passed
   - [ ] Backup verification completed
   - [ ] Rollback plan prepared

2. **Deployment Process**
   ```bash
   # Run automated deployment
   ./scripts/deploy-production.sh
   ```

3. **Post-deployment Validation**
   ```bash
   # Verify deployment
   ./scripts/health-check.sh production
   ```

## Troubleshooting

### Common Issues

#### Environment Variable Not Loading
```bash
# Check environment file exists and is readable
ls -la .env*
cat .env.local | grep VARIABLE_NAME

# Verify Node.js environment
node -e "console.log(process.env.VARIABLE_NAME)"
```

#### Database Connection Issues
```bash
# Test database connectivity
pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER

# Check connection pool
npm run db:pool-status
```

#### Security Configuration Issues
```bash
# Validate SSL/TLS configuration
openssl s_client -connect your-domain.com:443 -servername your-domain.com

# Check security headers
curl -I https://your-domain.com
```

### Environment Debug Mode

For debugging environment issues, enable debug mode:

```bash
# Development
DEBUG=healthier-sg:config npm run dev

# Staging/Production
LOG_LEVEL=debug
DEBUG_MODE=true
```

## Best Practices

### Configuration Management
1. **Never commit secrets to version control**
2. **Use environment-specific configuration files**
3. **Implement configuration validation**
4. **Maintain audit logs for configuration changes**
5. **Use configuration templates for consistency**

### Security Practices
1. **Use strong encryption for sensitive data**
2. **Implement proper access controls**
3. **Regular security audits of configurations**
4. **Keep dependencies updated**
5. **Monitor for configuration drift**

### Healthcare Compliance
1. **Follow MOH guidelines for healthcare applications**
2. **Implement PDPA-compliant data handling**
3. **Maintain detailed audit logs**
4. **Ensure data retention policies are enforced**
5. **Regular compliance reviews**

## Maintenance and Updates

### Regular Maintenance Tasks

1. **Weekly**
   - Review security logs
   - Check configuration drift
   - Validate backup integrity

2. **Monthly**
   - Update dependencies
   - Review and rotate secrets
   - Compliance audit
   - Performance analysis

3. **Quarterly**
   - Security penetration testing
   - Disaster recovery testing
   - Configuration optimization
   - Compliance review

### Configuration Updates

1. **Development Updates**
   - Direct commits to configuration files
   - Automatic validation on commit
   - Fast deployment cycle

2. **Staging Updates**
   - Pull request process
   - Manual approval required
   - Integration testing

3. **Production Updates**
   - Change management process
   - Multiple approvals required
   - Planned deployment window
   - Rollback plan mandatory

---

*This document is part of the My Family Clinic technical documentation and should be kept up to date with any configuration changes.*