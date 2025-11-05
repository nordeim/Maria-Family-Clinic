#!/bin/bash
# scripts/cicd/health-checks.sh

set -e

ENVIRONMENT=${1:-production}
APP_URL=${2:-$PRODUCTION_URL}

echo "🏥 Running health checks for $ENVIRONMENT environment..."

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check application availability
check_application_health() {
    echo -e "${BLUE}🌐 Checking application availability...${NC}"
    
    # Basic health endpoint check
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL/health" || echo "000")
    
    if [ "$HTTP_STATUS" = "200" ]; then
        echo -e "${GREEN}✅ Application is responding${NC}"
    else
        echo -e "${RED}❌ Application health check failed (HTTP: $HTTP_STATUS)${NC}"
        return 1
    fi
    
    # Check response time
    RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" "$APP_URL/health" || echo "999")
    echo -e "${BLUE}⏱️  Response time: ${RESPONSE_TIME}s${NC}"
    
    if (( $(echo "$RESPONSE_TIME > 3.0" | bc -l) )); then
        echo -e "${YELLOW}⚠️  Response time is slow${NC}"
    fi
}

# Check database connectivity
check_database_health() {
    echo -e "${BLUE}🗄️  Checking database connectivity...${NC}"
    
    # Use supabase CLI to check database health
    if command -v supabase &> /dev/null; then
        DB_STATUS=$(supabase db status --project-ref "$SUPABASE_PROJECT_ID" 2>/dev/null || echo "error")
        
        if [ "$DB_STATUS" != "error" ]; then
            echo -e "${GREEN}✅ Database is healthy${NC}"
        else
            echo -e "${RED}❌ Database health check failed${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠️  Supabase CLI not available, skipping database check${NC}"
    fi
}

# Check API endpoints
check_api_health() {
    echo -e "${BLUE}🔌 Checking API endpoints...${NC}"
    
    # Check critical API endpoints
    API_ENDPOINTS=(
        "$APP_URL/api/health"
        "$APP_URL/api/auth/status"
        "$APP_URL/api/patients/status"
    )
    
    for endpoint in "${API_ENDPOINTS[@]}"; do
        HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$endpoint" || echo "000")
        
        if [ "$HTTP_STATUS" = "200" ]; then
            echo -e "${GREEN}✅ API endpoint healthy: $(basename "$endpoint")${NC}"
        else
            echo -e "${RED}❌ API endpoint failed: $(basename "$endpoint") (HTTP: $HTTP_STATUS)${NC}"
        fi
    done
}

# Check authentication system
check_authentication_health() {
    echo -e "${BLUE}🔐 Checking authentication system...${NC}"
    
    # Test authentication endpoints
    AUTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL/api/auth/status" || echo "000")
    
    if [ "$AUTH_STATUS" = "200" ]; then
        echo -e "${GREEN}✅ Authentication system is healthy${NC}"
    else
        echo -e "${RED}❌ Authentication system health check failed${NC}"
        return 1
    fi
}

# Check healthcare-specific services
check_healthcare_services() {
    echo -e "${BLUE}🏥 Checking healthcare services...${NC}"
    
    # Check patient data service
    PATIENT_SERVICE=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL/api/patients/status" || echo "000")
    
    if [ "$PATIENT_SERVICE" = "200" ]; then
        echo -e "${GREEN}✅ Patient data service is healthy${NC}"
    else
        echo -e "${RED}❌ Patient data service health check failed${NC}"
        return 1
    fi
    
    # Check medical records service
    MEDICAL_SERVICE=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL/api/medical-records/status" || echo "000")
    
    if [ "$MEDICAL_SERVICE" = "200" ]; then
        echo -e "${GREEN}✅ Medical records service is healthy${NC}"
    else
        echo -e "${RED}❌ Medical records service health check failed${NC}"
        return 1
    fi
    
    # Check audit service
    AUDIT_SERVICE=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL/api/audit/status" || echo "000")
    
    if [ "$AUDIT_SERVICE" = "200" ]; then
        echo -e "${GREEN}✅ Audit service is healthy${NC}"
    else
        echo -e "${YELLOW}⚠️  Audit service health check failed${NC}"
    fi
}

# Check security endpoints
check_security_endpoints() {
    echo -e "${BLUE}🛡️  Checking security endpoints...${NC}"
    
    # Check security headers
    SECURITY_HEADERS=$(curl -s -I "$APP_URL" | grep -E "(X-Frame-Options|X-Content-Type-Options|X-XSS-Protection|Strict-Transport-Security)" | wc -l)
    
    if [ "$SECURITY_HEADERS" -ge 3 ]; then
        echo -e "${GREEN}✅ Security headers are properly configured${NC}"
    else
        echo -e "${YELLOW}⚠️  Some security headers are missing${NC}"
    fi
    
    # Check HTTPS enforcement
    HTTP_REDIRECT=$(curl -s -I "http://$(echo $APP_URL | sed 's|https://||')" | grep -i "location: https" | wc -l)
    
    if [ "$HTTP_REDIRECT" -gt 0 ]; then
        echo -e "${GREEN}✅ HTTPS enforcement is working${NC}"
    else
        echo -e "${RED}❌ HTTPS enforcement not working${NC}"
        return 1
    fi
}

# Execute all health checks
check_application_health
check_database_health
check_api_health
check_authentication_health
check_healthcare_services
check_security_endpoints

echo -e "${GREEN}🎉 All health checks completed successfully${NC}"

# Store health check results for monitoring
echo "healthy" > /tmp/app-health-status
echo "$(date)" > /tmp/last-health-check
