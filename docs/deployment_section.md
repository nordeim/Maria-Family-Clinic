# Maria Family Clinic - Comprehensive Deployment Guide

## 🎯 **Deployment Overview**

This comprehensive guide covers all aspects of deploying the Maria Family Clinic healthcare platform, from local development to production-ready deployments with monitoring, security, and backup capabilities.

## 📋 **Prerequisites**

### **System Requirements**

#### **Minimum Requirements**
- **CPU**: 2 cores (4 cores recommended)
- **RAM**: 4GB (8GB+ recommended)
- **Storage**: 20GB SSD (50GB+ recommended)
- **Network**: 100 Mbps (1 Gbps recommended)
- **Operating System**: Ubuntu 20.04+ / CentOS 8+ / Docker Desktop

#### **Software Dependencies**
```bash
# Required software versions
Docker 20.10+
Docker Compose 2.0+
Git 2.20+
Node.js 18+ (for local development)
Python 3.12+ (for local development)
```

### **Installation Commands**

#### **Ubuntu/Debian**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
sudo apt install git -y

# Install Node.js (for development)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### **CentOS/RHEL**
```bash
# Install Docker
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install -y docker-ce docker-ce-cli containerd.io

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
sudo yum install git -y
```

## 🏗️ **Development Environment Setup**

### **Quick Start (5 Minutes)**

#### **1. Clone Repository**
```bash
# Clone the project
git clone https://github.com/nordeim/Maria-Family-Clinic.git
cd Maria-Family-Clinic

# Verify repository structure
ls -la
```

#### **2. Environment Configuration**
```bash
# Copy environment template
cp .env.example .env

# Edit configuration
nano .env
```

#### **3. Environment Variables Configuration**
```env
# === APPLICATION CONFIGURATION ===
APP_NAME=Maria Family Clinic
APP_VERSION=1.0.0
APP_ENV=development
DEBUG=true
SECRET_KEY=your-super-secret-key-change-in-production

# === DATABASE CONFIGURATION ===
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=healthcare_db
POSTGRES_USER=healthcare_user
POSTGRES_PASSWORD=secure_password_here

# === REDIS CONFIGURATION ===
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=redis_password_here

# === CHROMADB CONFIGURATION ===
CHROMA_HOST=chromadb
CHROMA_PORT=8000
CHROMA_PERSIST_DIRECTORY=./data/chromadb

# === SUPABASE CONFIGURATION ===
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# === AI AGENT CONFIGURATION ===
MICROSOFT_AGENT_FRAMEWORK_KEY=your_framework_key
EMBEDDING_MODEL_PATH=./models/embeddinggemma-300m
AI_MODEL_TIMEOUT=30

# === AUTHENTICATION ===
JWT_SECRET_KEY=jwt-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440

# === RATE LIMITING ===
RATE_LIMIT_PER_MINUTE=60
RATE_LIMIT_PER_HOUR=1000

# === MONITORING ===
PROMETHEUS_ENABLED=true
GRAFANA_ADMIN_PASSWORD=admin_password_here
LOG_LEVEL=INFO

# === EMAIL CONFIGURATION ===
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@mariafamilyclinic.com

# === NOTIFICATION ===
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890
```

#### **4. Start Development Environment**
```bash
# Build and start all services
docker-compose up -d --build

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

#### **5. Verify Installation**
```bash
# Health check all services
curl -f http://localhost:8000/health
curl -f http://localhost:3000
curl -f http://localhost:9090

# Check database connection
docker-compose exec postgres psql -U healthcare_user -d healthcare_db -c "SELECT version();"

# Check Redis
docker-compose exec redis redis-cli ping
```

### **Development Services Breakdown**

#### **Frontend Service (React)**
```yaml
# Frontend development server
frontend:
  build:
    context: ./healthcare-app-react
    dockerfile: Dockerfile.dev
  ports:
    - "3000:3000"
  volumes:
    - ./healthcare-app-react:/app
    - /app/node_modules
  environment:
    - REACT_APP_API_URL=http://localhost:8000
    - REACT_APP_WS_URL=ws://localhost:8000
  command: npm start
```

#### **Backend Service (FastAPI)**
```yaml
# Backend API server
backend:
  build:
    context: ./customer-support-agent
    dockerfile: Dockerfile
  ports:
    - "8000:8000"
  volumes:
    - ./customer-support-agent:/app
    - ./data:/app/data
  environment:
    - DATABASE_URL=postgresql://healthcare_user:secure_password_here@postgres:5432/healthcare_db
    - REDIS_URL=redis://:redis_password_here@redis:6379
  depends_on:
    - postgres
    - redis
    - chromadb
  command: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### **Database Services**
```yaml
# PostgreSQL database
postgres:
  image: postgres:15
  environment:
    POSTGRES_DB: healthcare_db
    POSTGRES_USER: healthcare_user
    POSTGRES_PASSWORD: secure_password_here
  volumes:
    - postgres_data:/var/lib/postgresql/data
    - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init-db.sql
  ports:
    - "5432:5432"

# Redis cache
redis:
  image: redis:7-alpine
  command: redis-server --requirepass redis_password_here
  volumes:
    - redis_data:/data
  ports:
    - "6379:6379"

# ChromaDB vector database
chromadb:
  image: chromadb/chroma:latest
  ports:
    - "8001:8000"
  volumes:
    - ./data/chromadb:/chroma/chroma
  environment:
    - CHROMA_SERVER_HOST=0.0.0.0
```

#### **Monitoring Services**
```yaml
# Prometheus metrics
prometheus:
  image: prom/prometheus:latest
  ports:
    - "9090:9090"
  volumes:
    - ./monitoring/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
    - ./monitoring/prometheus/rules:/etc/prometheus/rules
  command:
    - '--config.file=/etc/prometheus/prometheus.yml'
    - '--storage.tsdb.path=/prometheus'
    - '--web.console.libraries=/etc/prometheus/console_libraries'
    - '--web.console.templates=/etc/prometheus/consoles'

# Grafana dashboards
grafana:
  image: grafana/grafana:latest
  ports:
    - "3000:3000"
  environment:
    - GF_SECURITY_ADMIN_PASSWORD=admin_password_here
  volumes:
    - grafana_data:/var/lib/grafana
    - ./monitoring/grafana/provisioning:/etc/grafana/provisioning
  depends_on:
    - prometheus
```

## 🚀 **Production Deployment**

### **Production Environment Setup**

#### **1. Production Environment Variables**
```env
# === PRODUCTION CONFIGURATION ===
APP_ENV=production
DEBUG=false
SECRET_KEY=very-secure-production-secret-key-256-bits

# === DATABASE CONFIGURATION ===
POSTGRES_HOST=postgres.internal
POSTGRES_PORT=5432
POSTGRES_DB=healthcare_prod
POSTGRES_USER=healthcare_prod_user
POSTGRES_PASSWORD=very-secure-db-password-256-bits

# === SSL/HTTPS CONFIGURATION ===
SSL_CERT_PATH=/etc/ssl/certs/mariafamilyclinic.crt
SSL_KEY_PATH=/etc/ssl/private/mariafamilyclinic.key
FORCE_HTTPS=true

# === MONITORING ===
PROMETHEUS_ENABLED=true
GRAFANA_ADMIN_PASSWORD=very-secure-grafana-password
LOG_LEVEL=WARNING
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project

# === PRODUCTION OPTIMIZATIONS ===
WORKERS=4
MAX_REQUESTS=1000
MAX_REQUESTS_JITTER=100
KEEP_ALIVE_TIMEOUT=5
```

#### **2. Production Docker Compose**
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  # Frontend with Nginx
  frontend:
    build:
      context: ./healthcare-app-react
      dockerfile: Dockerfile.prod
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl

  # Backend API
  backend:
    build:
      context: ./customer-support-agent
      dockerfile: Dockerfile.prod
    restart: unless-stopped
    environment:
      - APP_ENV=production
      - DEBUG=false
      - WORKERS=4
    volumes:
      - ./logs:/app/logs
      - ./data:/app/data
    depends_on:
      - postgres
      - redis
      - chromadb

  # Load Balancer
  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/ssl
    depends_on:
      - frontend
      - backend

  # Production databases
  postgres:
    image: postgres:15
    restart: unless-stopped
    environment:
      POSTGRES_DB: healthcare_prod
      POSTGRES_USER: healthcare_prod_user
      POSTGRES_PASSWORD: very-secure-db-password
    volumes:
      - postgres_prod_data:/var/lib/postgresql/data
      - ./backups/postgres:/backups
    command: |
      postgres 
      -c shared_buffers=256MB
      -c effective_cache_size=1GB
      -c maintenance_work_mem=64MB
      -c checkpoint_completion_target=0.9
      -c wal_buffers=16MB
      -c default_statistics_target=100
      -c random_page_cost=1.1
      -c effective_io_concurrency=200

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    command: redis-server --requirepass redis-password --maxmemory 512mb --maxmemory-policy allkeys-lru
    volumes:
      - redis_prod_data:/data
    ulimits:
      memlock: -1

  chromadb:
    image: chromadb/chroma:latest
    restart: unless-stopped
    environment:
      - CHROMA_SERVER_HOST=0.0.0.0
      - CHROMA_SERVER_HTTP_PORT=8000
    volumes:
      - chromadb_prod_data:/chroma/chroma

  # Monitoring stack
  prometheus:
    image: prom/prometheus:latest
    restart: unless-stopped
    volumes:
      - ./monitoring/prometheus/prometheus.prod.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=90d'
      - '--web.enable-lifecycle'

  grafana:
    image: grafana/grafana:latest
    restart: unless-stopped
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=very-secure-grafana-password
      - GF_USERS_ALLOW_SIGN_UP=false
      - GF_INSTALL_PLUGINS=grafana-piechart-panel
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/provisioning:/etc/grafana/provisioning
    depends_on:
      - prometheus

  # Log aggregation
  loki:
    image: grafana/loki:latest
    restart: unless-stopped
    ports:
      - "3100:3100"
    volumes:
      - loki_data:/loki
      - ./monitoring/loki/loki.yml:/etc/loki/loki.yml

volumes:
  postgres_prod_data:
  redis_prod_data:
  chromadb_prod_data:
  prometheus_data:
  grafana_data:
  loki_data:
```

#### **3. Nginx Configuration**
```nginx
# nginx/nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:8000;
    }

    upstream frontend {
        server frontend:3000;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;

    # Frontend
    server {
        listen 80;
        server_name mariafamilyclinic.com www.mariafamilyclinic.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name mariafamilyclinic.com www.mariafamilyclinic.com;

        ssl_certificate /etc/ssl/mariafamilyclinic.crt;
        ssl_certificate_key /etc/ssl/mariafamilyclinic.key;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

        # Frontend static files
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Backend API
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # WebSocket support
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }

        # Authentication endpoints with strict rate limiting
        location /api/auth/ {
            limit_req zone=login burst=5 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

### **Database Initialization**

#### **1. Production Database Setup**
```bash
# Create database initialization script
cat > scripts/init-production-db.sql << 'EOF'
-- Create production database and user
CREATE DATABASE healthcare_prod;
CREATE USER healthcare_prod_user WITH PASSWORD 'very-secure-db-password';
GRANT ALL PRIVILEGES ON DATABASE healthcare_prod TO healthcare_prod_user;

-- Connect to healthcare_prod database
\c healthcare_prod;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create schema
CREATE SCHEMA healthcare;
GRANT ALL ON SCHEMA healthcare TO healthcare_prod_user;

-- Create tables
CREATE TABLE healthcare.patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    phone VARCHAR(20),
    address TEXT,
    emergency_contact VARCHAR(200),
    medical_history TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE healthcare.providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    specialty VARCHAR(200),
    license_number VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE healthcare.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES healthcare.patients(id),
    provider_id UUID REFERENCES healthcare.providers(id),
    appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    status VARCHAR(20) DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_appointments_patient ON healthcare.appointments(patient_id);
CREATE INDEX idx_appointments_provider ON healthcare.appointments(provider_id);
CREATE INDEX idx_appointments_date ON healthcare.appointments(appointment_date);

-- Enable RLS
ALTER TABLE healthcare.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE healthcare.appointments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY patient_access ON healthcare.patients
    FOR ALL TO healthcare_prod_user
    USING (auth.uid()::text = id::text);

CREATE POLICY appointment_access ON healthcare.appointments
    FOR ALL TO healthcare_prod_user
    USING (
        patient_id IN (
            SELECT id FROM healthcare.patients WHERE auth.uid()::text = id::text
        )
    );
EOF

# Execute initialization
docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres -f /docker-entrypoint-initdb.d/init-production-db.sql
```

#### **2. Knowledge Base Population**
```bash
# Create knowledge base population script
cat > scripts/populate-knowledge-base.py << 'EOF'
import asyncio
import json
from pathlib import Path
from chromadb_client import ChromaDBClient
from embeddings import EmbeddingGenerator

async def populate_healthcare_knowledge():
    """Populate ChromaDB with healthcare knowledge base."""
    
    # Initialize ChromaDB client
    chroma_client = ChromaDBClient()
    embedding_gen = EmbeddingGenerator()
    
    # Load healthcare documents
    docs_dir = Path("data/knowledge_base")
    documents = []
    
    for file_path in docs_dir.glob("*.md"):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            documents.append({
                'content': content,
                'metadata': {
                    'type': 'healthcare_info',
                    'source': file_path.name,
                    'category': extract_category(file_path.name)
                }
            })
    
    # Generate embeddings
    print(f"Generating embeddings for {len(documents)} documents...")
    embeddings = await embedding_gen.encode_batch([doc['content'] for doc in documents])
    
    # Store in ChromaDB
    await chroma_client.add_documents(
        documents=[doc['content'] for doc in documents],
        embeddings=embeddings,
        metadatas=[doc['metadata'] for doc in documents]
    )
    
    print("Healthcare knowledge base populated successfully!")

def extract_category(filename):
    """Extract category from filename."""
    if 'procedure' in filename:
        return 'procedures'
    elif 'medication' in filename:
        return 'medications'
    elif 'symptom' in filename:
        return 'symptoms'
    elif 'faq' in filename:
        return 'faq'
    return 'general'

if __name__ == "__main__":
    asyncio.run(populate_healthcare_knowledge())
EOF

# Run knowledge base population
docker-compose -f docker-compose.prod.yml exec backend python scripts/populate-knowledge-base.py
```

### **SSL Certificate Setup**

#### **Let's Encrypt (Recommended)**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d mariafamilyclinic.com -d www.mariafamilyclinic.com

# Auto-renewal setup
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### **Custom SSL Certificate**
```bash
# Generate private key
openssl genrsa -out mariafamilyclinic.key 4096

# Generate certificate signing request
openssl req -new -key mariafamilyclinic.key -out mariafamilyclinic.csr

# Generate self-signed certificate (for testing)
openssl x509 -req -days 365 -in mariafamilyclinic.csr -signkey mariafamilyclinic.key -out mariafamilyclinic.crt

# Copy certificates to nginx directory
sudo cp mariafamilyclinic.crt /etc/ssl/certs/
sudo cp mariafamilyclinic.key /etc/ssl/private/
sudo chmod 600 /etc/ssl/private/mariafamilyclinic.key
```

## 📊 **Monitoring Setup**

### **Prometheus Configuration**

#### **Production Prometheus Config**
```yaml
# monitoring/prometheus/prometheus.prod.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "rules/*.yml"

scrape_configs:
  - job_name: 'maria-clinic-backend'
    static_configs:
      - targets: ['backend:8000']
    metrics_path: '/metrics'
    scrape_interval: 5s
    
  - job_name: 'postgres-exporter'
    static_configs:
      - targets: ['postgres-exporter:9187']
      
  - job_name: 'redis-exporter'
    static_configs:
      - targets: ['redis-exporter:9121']
      
  - job_name: 'nginx-exporter'
    static_configs:
      - targets: ['nginx-exporter:9113']

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093
```

#### **Alerting Rules**
```yaml
# monitoring/prometheus/rules/healthcare_alerts.yml
groups:
  - name: healthcare-system
    rules:
      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "High API response time detected"
          
      - alert: DatabaseConnectionHigh
        expr: pg_stat_activity_count > 80
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "High database connection count"
          
      - alert: LowDiskSpace
        expr: (node_filesystem_avail_bytes / node_filesystem_size_bytes) * 100 < 10
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Low disk space detected"
          
      - alert: HighMemoryUsage
        expr: (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage detected"
```

### **Grafana Dashboard Setup**

#### **Production Grafana Configuration**
```yaml
# monitoring/grafana/provisioning/datasources/prometheus.yml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true

  - name: Loki
    type: loki
    access: proxy
    url: http://loki:3100
    editable: true
```

#### **Healthcare Dashboard Definition**
```json
{
  "dashboard": {
    "title": "Maria Family Clinic - System Overview",
    "panels": [
      {
        "title": "API Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Active Appointments",
        "type": "stat",
        "targets": [
          {
            "expr": "increase(appointments_total[1h])",
            "legendFormat": "Appointments/hour"
          }
        ]
      },
      {
        "title": "AI Agent Performance",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(ai_responses_total[5m])",
            "legendFormat": "Responses/min"
          }
        ]
      }
    ]
  }
}
```

## 💾 **Backup and Recovery**

### **Automated Backup Strategy**

#### **Daily Backup Script**
```bash
#!/bin/bash
# scripts/daily-backup.sh

set -e

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups/daily/$DATE"
mkdir -p "$BACKUP_DIR"

echo "Starting daily backup at $(date)"

# PostgreSQL backup
echo "Backing up PostgreSQL..."
docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U healthcare_prod_user healthcare_prod | gzip > "$BACKUP_DIR/postgres_backup.sql.gz"

# Redis backup
echo "Backing up Redis..."
docker-compose -f docker-compose.prod.yml exec -T redis redis-cli --rdb - > "$BACKUP_DIR/redis_backup.rdb"

# ChromaDB backup
echo "Backing up ChromaDB..."
docker run --rm -v mariafamilyclinic_chromadb_prod_data:/data -v "$(pwd)/$BACKUP_DIR":/backup alpine tar czf /backup/chromadb_backup.tar.gz -C /data .

# Application data backup
echo "Backing up application data..."
tar czf "$BACKUP_DIR/app_data_backup.tar.gz" ./data ./logs ./uploads

# Upload to cloud storage (AWS S3 example)
echo "Uploading to S3..."
aws s3 sync "$BACKUP_DIR" s3://maria-family-clinic-backups/daily/$DATE/

# Clean up old local backups (keep 7 days)
find ./backups/daily -type d -mtime +7 -exec rm -rf {} +

echo "Backup completed successfully at $(date)"
```

#### **Weekly Full Backup Script**
```bash
#!/bin/bash
# scripts/weekly-backup.sh

set -e

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups/weekly/$DATE"
mkdir -p "$BACKUP_DIR"

echo "Starting weekly full backup at $(date)"

# Full system backup including containers
docker-compose -f docker-compose.prod.yml config > "$BACKUP_DIR/docker-compose.yml"
cp -r .env "$BACKUP_DIR/"

# All database backups
for db in postgres redis chromadb; do
  echo "Creating $db backup..."
  docker run --rm -v "mariafamilyclinic_${db}_prod_data":/data \
    -v "$(pwd)/$BACKUP_DIR":/backup \
    alpine tar czf "/backup/${db}_full_backup.tar.gz" -C /data .
done

# Upload to cloud storage
aws s3 sync "$BACKUP_DIR" s3://maria-family-clinic-backups/weekly/$DATE/

echo "Weekly backup completed successfully"
```

#### **Recovery Procedures**

**PostgreSQL Recovery:**
```bash
# Stop PostgreSQL service
docker-compose -f docker-compose.prod.yml stop postgres

# Restore from backup
gunzip -c backups/daily/20241206_120000/postgres_backup.sql.gz | \
  docker-compose -f docker-compose.prod.yml exec -T postgres psql -U postgres

# Start PostgreSQL
docker-compose -f docker-compose.prod.yml start postgres
```

**ChromaDB Recovery:**
```bash
# Stop ChromaDB
docker-compose -f docker-compose.prod.yml stop chromadb

# Restore vector database
tar xzf backups/daily/20241206_120000/chromadb_backup.tar.gz -C /tmp/chromadb-restore
docker run --rm -v mariafamilyclinic_chromadb_prod_data:/data \
  -v /tmp/chromadb-restore:/backup \
  alpine cp -r /backup/* /data/

# Start ChromaDB
docker-compose -f docker-compose.prod.yml start chromadb
```

### **Database Migration Procedures**

#### **Migration Script Template**
```bash
#!/bin/bash
# scripts/migrate-db.sh

MIGRATION_FILE="$1"

if [ -z "$MIGRATION_FILE" ]; then
    echo "Usage: $0 <migration_file.sql>"
    exit 1
fi

echo "Running database migration: $MIGRATION_FILE"

# Create backup before migration
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backups/migration_$BACKUP_DATE.sql.gz"
docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U healthcare_prod_user healthcare_prod | gzip > "$BACKUP_FILE"

echo "Backup created: $BACKUP_FILE"

# Run migration
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U healthcare_prod_user -d healthcare_prod -f "/docker-entrypoint-initdb.d/migrations/$MIGRATION_FILE"

echo "Migration completed successfully"
echo "If issues occur, restore with:"
echo "gunzip -c $BACKUP_FILE | docker-compose -f docker-compose.prod.yml exec -T postgres psql -U postgres"
```

## 🔧 **Performance Optimization**

### **Database Optimization**

#### **PostgreSQL Configuration**
```ini
# postgresql.conf optimizations
# Memory settings
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
work_mem = 4MB

# Checkpoint settings
checkpoint_completion_target = 0.9
wal_buffers = 16MB
checkpoint_timeout = 10min
max_wal_size = 1GB

# Query planner
random_page_cost = 1.1
effective_io_concurrency = 200

# Logging
log_statement = 'ddl'
log_min_duration_statement = 1000
```

#### **Redis Configuration**
```ini
# redis.conf optimizations
maxmemory 512mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes
```

### **Application Performance**

#### **FastAPI Optimization**
```python
# main.py production optimizations
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

app = FastAPI(
    title="Maria Family Clinic API",
    docs_url="/docs" if DEBUG else None,
    redoc_url="/redoc" if DEBUG else None
)

# Add performance middlewares
app.add_middleware(GZipMiddleware, minimum_size=1000)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "version": APP_VERSION
    }
```

## 🚨 **Troubleshooting Guide**

### **Common Issues and Solutions**

#### **Database Connection Issues**
```bash
# Check database connectivity
docker-compose exec postgres psql -U healthcare_prod_user -d healthcare_prod -c "SELECT version();"

# Check connection pool
docker-compose exec postgres psql -U postgres -c "SELECT * FROM pg_stat_activity;"

# Reset database connections
docker-compose exec postgres psql -U postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle';"
```

#### **Memory Issues**
```bash
# Check memory usage
docker stats --no-stream

# Check system resources
free -h
df -h
docker system df

# Clean up Docker resources
docker system prune -f
docker volume prune -f
```

#### **AI Agent Issues**
```bash
# Check AI agent logs
docker-compose logs backend | grep -i "ai\|agent"

# Restart AI service
docker-compose restart backend

# Check model loading
docker-compose exec backend python -c "
from ai_agent import AIAgent
agent = AIAgent()
print('AI Agent Status:', agent.health_check())
"
```

#### **Performance Issues**
```bash
# Check API response times
curl -w "@curl-format.txt" -o /dev/null -s "http://localhost:8000/health"

# Monitor database performance
docker-compose exec postgres psql -U postgres -c "
SELECT query, calls, total_time, mean_time 
FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;
"

# Check Redis performance
docker-compose exec redis redis-cli --latency-history
```

### **Emergency Procedures**

#### **Complete System Recovery**
```bash
#!/bin/bash
# emergency-recovery.sh

echo "Starting emergency system recovery..."

# Stop all services
docker-compose -f docker-compose.prod.yml down

# Restore latest backup
LATEST_BACKUP=$(ls -t backups/weekly | head -1)
LATEST_BACKUP_DIR="backups/weekly/$LATEST_BACKUP"

# Restore databases
tar xzf "$LATEST_BACKUP_DIR/postgres_backup.tar.gz" -C /tmp/postgres-restore
docker run --rm -v mariafamilyclinic_postgres_prod_data:/data \
  -v /tmp/postgres-restore:/backup \
  alpine cp -r /backup/* /data/

# Restore application data
tar xzf "$LATEST_BACKUP_DIR/app_data_backup.tar.gz" -C /

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Verify recovery
sleep 30
curl -f http://localhost/health || echo "Recovery verification failed"
echo "Emergency recovery completed"
```

## 📞 **Support and Maintenance**

### **Health Check Scripts**
```bash
#!/bin/bash
# scripts/health-check.sh

echo "=== Maria Family Clinic Health Check ==="
echo "Timestamp: $(date)"
echo ""

# Database connectivity
echo "Database connectivity:"
docker-compose exec -T postgres pg_isready -U healthcare_prod_user && echo "✓ PostgreSQL: OK" || echo "✗ PostgreSQL: FAILED"

# Redis connectivity
echo "Redis connectivity:"
docker-compose exec -T redis redis-cli ping > /dev/null 2>&1 && echo "✓ Redis: OK" || echo "✗ Redis: FAILED"

# API health
echo "API health:"
curl -f -s http://localhost:8000/health > /dev/null && echo "✓ API: OK" || echo "✗ API: FAILED"

# Frontend availability
echo "Frontend availability:"
curl -f -s http://localhost:3000 > /dev/null && echo "✓ Frontend: OK" || echo "✗ Frontend: FAILED"

# Disk space
echo "Disk space:"
df -h / | tail -1 | awk '{print "  Usage: " $5 " (" $4 " available)"}'

# Memory usage
echo "Memory usage:"
free -h | grep Mem | awk '{print "  Usage: " $3 "/" $2}'

echo ""
echo "=== Health check completed ==="
```

### **Maintenance Schedule**

#### **Daily Tasks**
- Run health check script
- Monitor system logs
- Verify backup completion
- Check security alerts

#### **Weekly Tasks**
- Run full system backup
- Review performance metrics
- Update security patches
- Clean up old logs

#### **Monthly Tasks**
- Review and optimize database performance
- Update dependency packages
- Security audit and penetration testing
- Disaster recovery drill

This comprehensive deployment guide provides everything needed to successfully deploy, monitor, and maintain the Maria Family Clinic healthcare platform in both development and production environments, ensuring high availability, security, and performance.