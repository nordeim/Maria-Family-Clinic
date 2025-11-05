# Production Environment Setup

## Overview

This document provides comprehensive instructions for setting up and managing the production environment for the Healthcare Data Analytics Platform, ensuring high availability, security, and compliance with healthcare regulations.

## Production Environment Architecture

### System Architecture
```mermaid
graph TB
    subgraph "Load Balancer & CDN"
        LB[CloudFlare Load Balancer]
        CDN[CloudFlare CDN]
    end
    
    subgraph "Application Tier"
        APP1[Healthcare App Instance 1]
        APP2[Healthcare App Instance 2]
        APP3[Healthcare App Instance 3]
    end
    
    subgraph "Database Tier"
        DB_PRIMARY[(Primary Database)]
        DB_REPLICA1[(Read Replica 1)]
        DB_REPLICA2[(Read Replica 2)]
    end
    
    subgraph "Storage Tier"
        STORAGE[Supabase Storage]
        BACKUP[Backup Storage]
    end
    
    subgraph "Monitoring"
        MONITOR[Prometheus/Grafana]
        ALERTS[Alert Manager]
    end
    
    LB --> CDN
    CDN --> APP1
    CDN --> APP2
    CDN --> APP3
    
    APP1 --> DB_PRIMARY
    APP2 --> DB_REPLICA1
    APP3 --> DB_REPLICA2
    
    APP1 --> STORAGE
    STORAGE --> BACKUP
    
    APP1 --> MONITOR
    APP2 --> MONITOR
    APP3 --> MONITOR
    MONITOR --> ALERTS
```

## Initial Production Setup

### Prerequisites Check
```bash
#!/bin/bash
# scripts/production-prerequisites.sh

echo "🔍 Checking production setup prerequisites..."

# Check required tools
required_tools=("node" "npm" "docker" "kubectl" "supabase")
for tool in "${required_tools[@]}"; do
    if ! command -v $tool &> /dev/null; then
        echo "❌ $tool is not installed"
        exit 1
    else
        echo "✅ $tool is installed"
    fi
done

# Check environment variables
required_vars=(
    "SUPABASE_PROJECT_ID"
    "SUPABASE_ACCESS_TOKEN"
    "JWT_SECRET"
    "DATABASE_URL"
    "REDIS_URL"
)
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Environment variable $var is not set"
        exit 1
    else
        echo "✅ $var is set"
    fi
done

echo "✅ All prerequisites are met"
```

### Production Infrastructure Setup
```bash
#!/bin/bash
# scripts/setup-production-infrastructure.sh

set -e

echo "🏗️ Setting up production infrastructure..."

# 1. Create Supabase project
echo "📊 Creating Supabase project..."
supabase projects create healthcare-platform-prod \
  --organization-id $SUPABASE_ORG_ID \
  --plan business

# 2. Configure database settings
echo "🗄️ Configuring database..."
supabase db config --project-ref $SUPABASE_PROJECT_ID \
  --max-connections 200 \
  --shared-buffers 2GB \
  --effective-cache-size 6GB

# 3. Enable required extensions
echo "🔧 Enabling database extensions..."
supabase db query --project-ref $SUPABASE_PROJECT_ID << EOF
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pgjwt";

-- Configure connection pooling
SELECT set_config('pgrst.db_schemas', 'public,storage', false);
SELECT set_config('pgrst.db_use_legacy_gucs', 'false', false);
EOF

# 4. Set up storage buckets
echo "🗂️ Creating storage buckets..."
supabase storage create medical-records --public false
supabase storage create imaging-data --public false
supabase storage create audit-logs --public false
supabase storage create public-assets --public true

# 5. Configure authentication
echo "🔐 Configuring authentication..."
supabase auth config --project-ref $SUPABASE_PROJECT_ID \
  --disable-signup true \
  --enable-confirmations true \
  --jwt-expiry 3600

echo "✅ Production infrastructure setup completed"
```

### SSL/TLS Configuration
```bash
#!/bin/bash
# scripts/setup-ssl.sh

DOMAIN=$1
EMAIL=$2

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
    echo "Usage: $0 <domain> <email>"
    exit 1
fi

echo "🔒 Setting up SSL certificate for $DOMAIN..."

# Install certbot
apt update && apt install -y certbot

# Obtain SSL certificate
certbot certonly \
  --standalone \
  --agree-tos \
  --email $EMAIL \
  -d $DOMAIN \
  -d www.$DOMAIN

# Setup auto-renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -

# Configure nginx with SSL
cat > /etc/nginx/sites-available/healthcare-app << EOF
server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    
    # Healthcare compliance headers
    add_header X-Permitted-Cross-Domain-Policies none always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    return 301 https://\$server_name\$request_uri;
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/healthcare-app /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

echo "✅ SSL certificate setup completed"
```

## Production Deployment

### Application Deployment
```bash
#!/bin/bash
# scripts/deploy-production.sh

set -e

IMAGE_TAG=${1:-latest}
ENVIRONMENT=production

echo "🚀 Starting production deployment..."

# Pre-deployment validation
echo "🔍 Pre-deployment validation..."
./scripts/pre-deployment-validate.sh production

# Create database backup
echo "💾 Creating database backup..."
./scripts/backup-database.sh production

# Enable maintenance mode
echo "🚧 Enabling maintenance mode..."
kubectl patch configmap healthcare-config \
  -n production \
  -p '{"data":{"maintenance_mode":"true"}}'

# Wait for active connections to close
sleep 30

# Deploy new version
echo "📦 Deploying new version..."
kubectl set image deployment/healthcare-app \
  healthcare-app=ghcr.io/org/healthcare-app:$IMAGE_TAG \
  --namespace=production

# Wait for rollout
echo "⏳ Waiting for deployment to complete..."
kubectl rollout status deployment/healthcare-app \
  --namespace=production \
  --timeout=600s

# Run database migrations
echo "🗄️ Running database migrations..."
kubectl exec -n production deployment/healthcare-app -- \
  npm run migrate:production

# Disable maintenance mode
echo "✅ Disabling maintenance mode..."
kubectl patch configmap healthcare-config \
  -n production \
  -p '{"data":{"maintenance_mode":"false"}}'

# Post-deployment validation
echo "🔍 Post-deployment validation..."
./scripts/post-deployment-validate.sh production

echo "🎉 Production deployment completed successfully!"
```

### Database Migration
```sql
-- migrations/20251105000000_production_setup.sql

-- Enable Row Level Security on all healthcare tables
ALTER TABLE patient_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE encounters ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX CONCURRENTLY idx_patient_records_date_desc 
  ON patient_records(created_at DESC);

CREATE INDEX CONCURRENTLY idx_encounters_patient_date 
  ON encounters(patient_id, encounter_date DESC);

CREATE INDEX CONCURRENTLY idx_medical_images_study_date 
  ON medical_images((metadata->>'study_date'));

-- Create audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (
        user_id,
        action,
        table_name,
        record_id,
        old_data,
        new_data,
        created_at
    ) VALUES (
        COALESCE(current_setting('app.current_user_id', true)::uuid, '00000000-0000-0000-0000-000000000000'::uuid),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
        NOW()
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create audit triggers
CREATE TRIGGER audit_patient_records
    AFTER INSERT OR UPDATE OR DELETE ON patient_records
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_encounters
    AFTER INSERT OR UPDATE OR DELETE ON encounters
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Create performance monitoring views
CREATE VIEW v_database_performance AS
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_live_tup as live_tuples,
    n_dead_tup as dead_tuples,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;

-- Create healthcare compliance view
CREATE VIEW v_compliance_summary AS
SELECT 
    DATE_TRUNC('month', created_at) as month,
    COUNT(*) as total_audits,
    COUNT(DISTINCT user_id) as active_users,
    COUNT(CASE WHEN action = 'INSERT' THEN 1 END) as inserts,
    COUNT(CASE WHEN action = 'UPDATE' THEN 1 END) as updates,
    COUNT(CASE WHEN action = 'DELETE' THEN 1 END) as deletes
FROM audit_logs
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- Set optimal configuration for production
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '2GB';
ALTER SYSTEM SET effective_cache_size = '6GB';
ALTER SYSTEM SET maintenance_work_mem = '512MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '64MB';
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;
ALTER SYSTEM SET work_mem = '16MB';
ALTER SYSTEM SET min_wal_size = '1GB';
ALTER SYSTEM SET max_wal_size = '4GB';

SELECT pg_reload_conf();
```

## Environment Configuration

### Production Environment Variables
```bash
#!/bin/bash
# scripts/setup-production-env.sh

echo "🔧 Setting up production environment variables..."

# Create .env.production file
cat > .env.production << EOF
# Application Configuration
NODE_ENV=production
PORT=3000
LOG_LEVEL=warn

# Database Configuration
DATABASE_URL=postgresql://postgres:[password]@db.supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[password]@db.supabase.co:5432/postgres

# Authentication
JWT_SECRET=$(openssl rand -base64 64)
JWT_EXPIRY=3600
REFRESH_TOKEN_SECRET=$(openssl rand -base64 64)

# Security
CORS_ORIGIN=https://healthcare-app.com
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Supabase Configuration
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]

# Redis Configuration
REDIS_URL=redis://:[password]@redis.supabase.co:6379

# Email Configuration
SMTP_HOST=smtp.healthcare-app.com
SMTP_PORT=587
SMTP_USER=noreply@healthcare-app.com
SMTP_PASS=[smtp-password]

# File Storage
MAX_FILE_SIZE=52428800
ALLOWED_FILE_TYPES=pdf,jpg,jpeg,png,dcm,dicom

# Monitoring
SENTRY_DSN=[sentry-dsn]
NEW_RELIC_LICENSE_KEY=[new-relic-key]

# Healthcare Compliance
AUDIT_LOG_RETENTION_DAYS=2555
DATA_ENCRYPTION_KEY=[encryption-key]
BACKUP_ENCRYPTION_KEY=[backup-key]
EOF

echo "✅ Production environment variables created"
```

### Kubernetes Configuration
```yaml
# k8s/production/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: healthcare-app
  namespace: production
  labels:
    app: healthcare-app
    version: v1.0.0
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 1
  selector:
    matchLabels:
      app: healthcare-app
  template:
    metadata:
      labels:
        app: healthcare-app
        version: v1.0.0
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        fsGroup: 1001
      containers:
      - name: healthcare-app
        image: ghcr.io/org/healthcare-app:latest
        ports:
        - containerPort: 3000
          name: http
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: healthcare-secrets
              key: database-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: healthcare-secrets
              key: jwt-secret
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: http
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health/ready
            port: http
          initialDelaySeconds: 5
          periodSeconds: 5
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          capabilities:
            drop:
            - ALL
      volumes:
      - name: tmp
        emptyDir: {}
      - name: cache
        emptyDir: {}

---
apiVersion: v1
kind: Service
metadata:
  name: healthcare-app-service
  namespace: production
  labels:
    app: healthcare-app
spec:
  selector:
    app: healthcare-app
  ports:
  - port: 80
    targetPort: http
  type: ClusterIP

---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: healthcare-app-ingress
  namespace: production
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/rate-limit-window: "1m"
spec:
  tls:
  - hosts:
    - healthcare-app.com
    secretName: healthcare-app-tls
  rules:
  - host: healthcare-app.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: healthcare-app-service
            port:
              number: 80
```

## Performance Optimization

### Database Performance Tuning
```sql
-- production-performance-tuning.sql

-- Configure PostgreSQL for production workload
ALTER SYSTEM SET shared_buffers = '4GB';                    -- 25-40% of RAM
ALTER SYSTEM SET effective_cache_size = '12GB';             -- 75% of total RAM
ALTER SYSTEM SET work_mem = '64MB';                         -- Per operation
ALTER SYSTEM SET maintenance_work_mem = '1GB';              -- For maintenance
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '64MB';
ALTER SYSTEM SET default_statistics_target = 200;
ALTER SYSTEM SET random_page_cost = 1.1;                    -- For SSD/NVMe
ALTER SYSTEM SET effective_io_concurrency = 200;
ALTER SYSTEM SET max_worker_processes = 8;
ALTER SYSTEM SET max_parallel_workers_per_gather = 4;
ALTER SYSTEM SET max_parallel_workers = 8;
ALTER SYSTEM SET max_parallel_maintenance_workers = 4;

-- Query optimization
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET pg_stat_statements.track = all;

-- Autovacuum optimization for healthcare data
ALTER SYSTEM SET autovacuum_max_workers = 6;
ALTER SYSTEM SET autovacuum_naptime = '30s';
ALTER SYSTEM SET autovacuum_vacuum_threshold = 50;
ALTER SYSTEM SET autovacuum_analyze_threshold = 50;
ALTER SYSTEM SET autovacuum_vacuum_scale_factor = 0.1;
ALTER SYSTEM SET autovacuum_analyze_scale_factor = 0.05;

SELECT pg_reload_conf();

-- Create performance monitoring function
CREATE OR REPLACE FUNCTION get_slow_queries()
RETURNS TABLE (
    query text,
    calls bigint,
    total_time numeric,
    mean_time numeric,
    min_time numeric,
    max_time numeric
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pg_stat_statements.query,
        pg_stat_statements.calls,
        pg_stat_statements.total_time,
        pg_stat_statements.mean_time,
        pg_stat_statements.min_time,
        pg_stat_statements.max_time
    FROM pg_stat_statements
    WHERE calls > 100
    ORDER BY mean_time DESC
    LIMIT 20;
END;
$$ LANGUAGE plpgsql;
```

### Application Performance Optimization
```javascript
// performance-config.js
module.exports = {
  // Database connection pooling
  database: {
    max: 20,              // Maximum pool size
    min: 5,               // Minimum pool size
    acquireTimeoutMillis: 60000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 100
  },

  // Redis caching configuration
  cache: {
    keyPrefix: 'healthcare:',
    defaultTTL: 3600,     // 1 hour
    patientDataTTL: 1800, // 30 minutes for patient data
    sessionTTL: 7200      // 2 hours for sessions
  },

  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 100,                  // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP'
  },

  // File upload optimization
  fileUpload: {
    maxFileSize: 50 * 1024 * 1024,  // 50MB
    allowedTypes: [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/dicom'
    ],
    compressImages: true,
    imageQuality: 85
  },

  // Monitoring thresholds
  monitoring: {
    responseTimeThreshold: 2000,  // 2 seconds
    errorRateThreshold: 0.01,     // 1%
    cpuThreshold: 80,             // 80%
    memoryThreshold: 85,          // 85%
    diskThreshold: 90             // 90%
  }
};
```

## Security Hardening

### Application Security
```javascript
// security-config.js
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

module.exports = {
  // Security headers
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "wss:", "https://"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
      }
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    noSniff: true,
    xssFilter: true,
    frameguard: { action: 'deny' }
  },

  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 100,                  // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP',
    standardHeaders: true,
    legacyHeaders: false
  },

  // Slow down requests
  speedLimit: {
    windowMs: 15 * 60 * 1000,  // 15 minutes
    delayAfter: 50,            // allow 50 requests per windowMs without delay
    delayMs: 500               // add 500ms delay per request after delayAfter
  },

  // Input validation
  validation: {
    patientDataSchema: {
      name: { type: 'string', maxLength: 100 },
      dateOfBirth: { type: 'string', pattern: /^\d{4}-\d{2}-\d{2}$/ },
      medicalRecordNumber: { type: 'string', maxLength: 50 }
    }
  },

  // Encryption settings
  encryption: {
    algorithm: 'aes-256-gcm',
    keyLength: 32,
    ivLength: 16,
    tagLength: 16
  }
};
```

### Network Security
```bash
#!/bin/bash
# scripts/network-security.sh

echo "🔒 Configuring network security..."

# Configure firewall
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# Disable unnecessary services
systemctl disable telnet
systemctl disable ftp
systemctl disable rsh

# Configure SSH
sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/#PubkeyAuthentication yes/PubkeyAuthentication yes/' /etc/ssh/sshd_config
systemctl reload ssh

# Setup fail2ban
apt install -y fail2ban
systemctl enable fail2ban

# Configure fail2ban for SSH
cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3
ignoreip = 127.0.0.1/8 ::1

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
EOF

systemctl restart fail2ban

echo "✅ Network security configuration completed"
```

## Monitoring Setup

### Application Monitoring
```yaml
# monitoring/prometheus-config.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "healthcare_alerts.yml"

scrape_configs:
  - job_name: 'healthcare-app'
    static_configs:
      - targets: ['healthcare-app:3000']
    metrics_path: '/api/metrics'
    scrape_interval: 30s
    scrape_timeout: 10s

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'postgres-exporter'
    static_configs:
      - targets: ['postgres-exporter:9187']

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager:9093']
```

### Custom Metrics
```javascript
// monitoring/metrics.js
const promClient = require('prom-client');

// Create metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const patientDataAccess = new promClient.Counter({
  name: 'patient_data_access_total',
  help: 'Total number of patient data accesses',
  labelNames: ['user_type', 'access_type']
});

const databaseConnections = new promClient.Gauge({
  name: 'database_connections_active',
  help: 'Number of active database connections'
});

// Healthcare-specific metrics
const auditLogEntries = new promClient.Counter({
  name: 'audit_log_entries_total',
  help: 'Total number of audit log entries',
  labelNames: ['action', 'table_name', 'user_role']
});

const securityEvents = new promClient.Counter({
  name: 'security_events_total',
  help: 'Total number of security events',
  labelNames: ['event_type', 'severity', 'source_ip']
});

// Register default metrics
promClient.collectDefaultMetrics();

// Middleware for HTTP metrics
function metricsMiddleware(req, res, next) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    
    httpRequestDuration
      .labels(req.method, route, res.statusCode)
      .observe(duration);
    
    httpRequestsTotal
      .labels(req.method, route, res.statusCode)
      .inc();
  });
  
  next();
}

module.exports = {
  httpRequestDuration,
  httpRequestsTotal,
  patientDataAccess,
  databaseConnections,
  auditLogEntries,
  securityEvents,
  metricsMiddleware,
  register: promClient.register
};
```

## Health Checks

### Application Health Check
```javascript
// health/health-check.js
const { Pool } = require('pg');
const redis = require('redis');

class HealthChecker {
  constructor() {
    this.pool = new Pool({ connectionString: process.env.DATABASE_URL });
    this.redisClient = redis.createClient({ url: process.env.REDIS_URL });
  }

  async checkDatabase() {
    try {
      const client = await this.pool.connect();
      await client.query('SELECT 1');
      client.release();
      return { status: 'healthy', message: 'Database connection successful' };
    } catch (error) {
      return { status: 'unhealthy', message: `Database error: ${error.message}` };
    }
  }

  async checkRedis() {
    try {
      await this.redisClient.ping();
      return { status: 'healthy', message: 'Redis connection successful' };
    } catch (error) {
      return { status: 'unhealthy', message: `Redis error: ${error.message}` };
    }
  }

  async checkExternalServices() {
    const checks = [];
    
    // Check Supabase
    try {
      const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/`, {
        headers: {
          'apikey': process.env.SUPABASE_ANON_KEY
        }
      });
      checks.push({
        service: 'Supabase',
        status: response.ok ? 'healthy' : 'unhealthy',
        message: response.ok ? 'Supabase accessible' : 'Supabase unreachable'
      });
    } catch (error) {
      checks.push({
        service: 'Supabase',
        status: 'unhealthy',
        message: `Supabase error: ${error.message}`
      });
    }

    return checks;
  }

  async getHealthStatus() {
    const [database, redis, external] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkExternalServices()
    ]);

    const overallStatus = 
      database.status === 'healthy' && 
      redis.status === 'healthy' && 
      external.every(check => check.status === 'healthy')
        ? 'healthy' : 'unhealthy';

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks: {
        database,
        redis,
        external_services: external
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0'
    };
  }
}

module.exports = HealthChecker;
```

---

## Production Checklist

### Pre-Deployment Checklist
- [ ] All environment variables configured
- [ ] SSL certificates installed and valid
- [ ] Database backups created
- [ ] Security scan completed
- [ ] Performance testing completed
- [ ] Monitoring configured
- [ ] Alert thresholds set
- [ ] Runbook procedures validated

### Post-Deployment Checklist
- [ ] Health checks passing
- [ ] Application accessible
- [ ] Database migrations successful
- [ ] Monitoring alerts configured
- [ ] Performance metrics baseline established
- [ ] Security headers validated
- [ ] Audit logging functional
- [ ] Compliance checks passed

### Daily Operations Checklist
- [ ] Check system health dashboard
- [ ] Review error logs
- [ ] Monitor performance metrics
- [ ] Verify backup completion
- [ ] Check security alerts
- [ ] Review audit logs
- [ ] Validate compliance reports

---

## Next Steps
1. Execute production infrastructure setup
2. Configure monitoring and alerting
3. Implement security hardening
4. Conduct performance testing
5. Establish operational procedures
6. Complete disaster recovery testing
7. Validate healthcare compliance