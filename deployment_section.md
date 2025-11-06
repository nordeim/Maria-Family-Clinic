# Comprehensive Deployment Guide

## Quick Start

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+
- Git
- 4GB+ RAM available
- 10GB+ disk space

### Development Setup

```bash
# 1. Clone the repository
git clone https://github.com/nordeim/customer-support-agent.git
cd customer-support-agent

# 2. Environment setup
cp .env.example .env
# Edit .env with your configuration

# 3. Start all services
docker-compose up -d

# 4. Initialize database
docker-compose exec backend python scripts/init_db.py

# 5. Populate knowledge base (optional)
docker-compose exec backend python scripts/populate_kb.py --documents-dir ./docs/knowledge-base

# 6. Verify deployment
curl http://localhost:8000/health
```

## Production Deployment

### System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **CPU** | 2 cores | 4+ cores |
| **RAM** | 4GB | 8GB+ |
| **Storage** | 20GB SSD | 50GB+ SSD |
| **Network** | 100 Mbps | 1 Gbps |

### Environment Configuration

#### Production Environment Variables

```bash
# Core Application
VERSION=1.0.0
DEBUG=false
SECRET_KEY=your-production-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here

# Database Configuration
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=customer_support
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-postgres-password

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your-secure-redis-password

# AI Configuration
EMBEDDING_MODEL_PATH=/app/models/embeddinggemma-300m
CHROMA_PERSIST_DIRECTORY=/app/data/chroma

# Monitoring
PROMETHEUS_ENABLED=true
GRAFANA_ADMIN_PASSWORD=your-grafana-password

# External APIs
OPENAI_API_KEY=your-openai-api-key
MICROSOFT_AGENT_FRAMEWORK_KEY=your-agent-framework-key

# SSL Configuration
SSL_CERT_PATH=/etc/ssl/certs/cert.pem
SSL_KEY_PATH=/etc/ssl/private/key.pem

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60
RATE_LIMIT_PER_HOUR=1000
```

### Production Deployment Steps

#### 1. Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create application directory
sudo mkdir -p /opt/customer-support-agent
sudo chown $USER:$USER /opt/customer-support-agent
```

#### 2. Application Deployment

```bash
# Clone repository
git clone https://github.com/nordeim/customer-support-agent.git /opt/customer-support-agent
cd /opt/customer-support-agent

# Create production environment
cp .env.example .env.prod
# Edit .env.prod with production values

# Build production images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Initialize services
docker-compose -f docker-compose.prod.yml exec backend python scripts/init_db.py
docker-compose -f docker-compose.prod.yml exec backend python scripts/populate_kb.py
```

#### 3. SSL/HTTPS Setup

```bash
# Using Let's Encrypt
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com

# Or use custom certificates
sudo cp cert.pem /etc/ssl/certs/
sudo cp key.pem /etc/ssl/private/
```

#### 4. Database Initialization

```bash
# Initialize PostgreSQL
docker-compose exec postgres psql -U postgres -c "CREATE DATABASE customer_support;"
docker-compose exec postgres psql -U postgres -c "CREATE USER customer_user WITH ENCRYPTED PASSWORD 'your_password';"
docker-compose exec postgres psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE customer_support TO customer_user;"

# Run migrations
docker-compose exec backend alembic upgrade head

# Create initial admin user
docker-compose exec backend python scripts/create_admin.py --email admin@yourcompany.com --password SecurePass123!
```

#### 5. Knowledge Base Setup

```bash
# Create knowledge base directory
mkdir -p ./docs/knowledge-base

# Add your documents (PDF, TXT, MD files)
cp your-documents/* ./docs/knowledge-base/

# Populate knowledge base
docker-compose exec backend python scripts/populate_kb.py --documents-dir ./docs/knowledge-base --chunk-size 1000 --overlap 200

# Verify knowledge base
docker-compose exec backend python scripts/verify_kb.py
```

## Monitoring Setup

### Prometheus Configuration

```bash
# Access Prometheus
open http://localhost:9090

# Verify metrics collection
curl http://localhost:9090/api/v1/targets

# Check key metrics
curl 'http://localhost:9090/api/v1/query?query=rate(http_requests_total[5m])'
```

### Grafana Dashboards

```bash
# Access Grafana
open http://localhost:3000
# Default: admin / admin (change on first login)

# Import pre-configured dashboard
curl -X POST http://admin:admin@localhost:3000/api/dashboards/db \
  -H "Content-Type: application/json" \
  -d @grafana_dashboard.json
```

### Key Monitoring Metrics

```yaml
# Application Metrics
- response_time_seconds
- http_requests_total
- active_sessions
- conversation_count
- escalation_rate

# System Metrics
- cpu_usage_percent
- memory_usage_percent
- disk_usage_percent
- network_io_bytes

# AI/ML Metrics
- embedding_generation_time
- vector_search_latency
- agent_framework_latency
- knowledge_base_hits
```

## Backup and Recovery

### Database Backup

```bash
# PostgreSQL backup
docker-compose exec postgres pg_dump -U postgres customer_support > backup_$(date +%Y%m%d_%H%M%S).sql

# Automated backup script
#!/bin/bash
BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec postgres pg_dump -U postgres customer_support | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Keep only last 30 backups
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
```

### Knowledge Base Backup

```bash
# ChromaDB backup
docker run --rm -v customer-support-agent_chroma_data:/data -v $(pwd):/backup alpine tar czf /backup/chroma-backup-$(date +%Y%m%d_%H%M%S).tar.gz -C /data .

# Restore ChromaDB
docker run --rm -v customer-support-agent_chroma_data:/data -v $(pwd):/backup alpine tar xzf /backup/chroma-backup-YYYYMMDD_HHMMSS.tar.gz -C /data
```

### Full System Backup

```bash
# Complete backup script
#!/bin/bash
BACKUP_DIR="/backups/full-system"
DATE=$(date +%Y%m%d_%H%M%S)

# Database backup
docker-compose exec postgres pg_dump -U postgres customer_support | gzip > $BACKUP_DIR/postgres_$DATE.sql.gz

# Knowledge base backup
docker run --rm -v customer-support-agent_chroma_data:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/chroma_$DATE.tar.gz -C /data .

# Configuration backup
tar czf $BACKUP_DIR/config_$DATE.tar.gz .env* docker-compose*.yml

echo "Backup completed: $BACKUP_DIR"
```

## Scaling and Performance

### Horizontal Scaling

```yaml
# docker-compose.scale.yml
version: '3.8'
services:
  backend:
    deploy:
      replicas: 3
    ports:
      - "8001-8003:8000"
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - backend
```

### Performance Tuning

```bash
# PostgreSQL optimization
# Edit: docker-compose.prod.yml
postgres:
  environment:
    POSTGRES_SHARED_PRELOAD_LIBRARIES: 'pg_stat_statements'
    PG_MAX_CONNECTIONS: 200
    PG_SHARED_BUFFERS: 256MB
    PG_EFFECTIVE_CACHE_SIZE: 1GB

# Redis optimization
redis:
  command: redis-server --maxmemory 512mb --maxmemory-policy allkeys-lru
```

### Load Testing

```bash
# Install Artillery for load testing
npm install -g artillery

# Create load test configuration
cat > load-test.yml << 'EOF'
config:
  target: 'http://localhost:8000'
  phases:
    - duration: 60
      arrivalRate: 10
  payload:
    path: "test-conversations.csv"
    fields:
      - "userId"
      - "message"
    order: "random"

scenarios:
  - name: "Chat conversations"
    weight: 100
    flow:
      - post:
          url: "/chat/sessions"
          json:
            userId: "{{ userId }}"
      - post:
          url: "/chat/sessions/{{ sessionId }}/messages"
          json:
            message: "{{ message }}"
      - think: 2
EOF

# Run load test
artillery run load-test.yml
```

## Troubleshooting

### Common Issues

#### Backend Won't Start

```bash
# Check logs
docker-compose logs backend

# Common issues and solutions
# 1. Database connection
docker-compose exec backend python -c "from app.db.database import engine; print('DB Connection OK')"

# 2. Redis connection
docker-compose exec redis redis-cli ping

# 3. Environment variables
docker-compose exec backend env | grep DATABASE_URL
```

#### Database Connection Errors

```bash
# Check PostgreSQL status
docker-compose exec postgres pg_isready

# Reset database
docker-compose down
docker volume rm customer-support-agent_postgres_data
docker-compose up -d
```

#### High Memory Usage

```bash
# Monitor container usage
docker stats

# Clear ChromaDB cache
docker-compose exec backend python -c "from app.vector_store.chroma_client import clear_cache; clear_cache()"

# Restart services
docker-compose restart backend
```

#### Knowledge Base Issues

```bash
# Verify ChromaDB setup
docker-compose exec backend python -c "
from app.vector_store.chroma_client import chroma_client
collections = chroma_client.list_collections()
print(f'Collections: {collections}')
"

# Re-index documents
docker-compose exec backend python scripts/populate_kb.py --force-reindex
```

### Log Analysis

```bash
# Backend logs
docker-compose logs -f backend --tail=100

# Application logs with grep
docker-compose exec backend tail -f /var/log/app.log | grep ERROR

# Database logs
docker-compose logs postgres --tail=50

# Prometheus metrics
curl http://localhost:9090/api/v1/query?query=container_memory_usage_bytes
```

### Health Checks

```bash
# Application health
curl -f http://localhost:8000/health || echo "Backend unhealthy"

# Database health
docker-compose exec postgres pg_isready || echo "Database unhealthy"

# Redis health
docker-compose exec redis redis-cli ping || echo "Redis unhealthy"

# Overall system
./scripts/health-check.sh
```

## Security Considerations

### Production Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secrets
- [ ] Enable SSL/TLS
- [ ] Configure firewall rules
- [ ] Enable rate limiting
- [ ] Set up monitoring alerts
- [ ] Regular security updates
- [ ] Backup encryption
- [ ] Access logging
- [ ] Vulnerability scanning

### SSL Certificate Management

```bash
# Auto-renewal with Let's Encrypt
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Network Security

```bash
# Firewall configuration
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

This comprehensive deployment guide ensures reliable, secure, and scalable production deployment of the Customer Support AI Agent system.
