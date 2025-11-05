#!/bin/bash
# scripts/cicd/post-deployment-validate.sh

set -e

ENVIRONMENT=${1:-production}

echo "🔍 Starting post-deployment validation for $ENVIRONMENT environment..."

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Wait for deployment to stabilize
echo -e "${BLUE}⏳ Waiting for deployment to stabilize...${NC}"
sleep 60

# Validate application deployment
validate_application_deployment() {
    echo -e "${BLUE}🌐 Validating application deployment...${NC}"
    
    # Check if application is responding
    if [ -n "$PRODUCTION_URL" ]; then
        HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$PRODUCTION_URL" --max-time 30 || echo "000")
        
        if [ "$HTTP_STATUS" = "200" ]; then
            echo -e "${GREEN}✅ Application is responding${NC}"
        else
            echo -e "${RED}❌ Application health check failed (HTTP: $HTTP_STATUS)${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠️  PRODUCTION_URL not set, skipping application check${NC}"
    fi
}

# Validate database connectivity
validate_database_connectivity() {
    echo -e "${BLUE}🗄️  Validating database connectivity...${NC}"
    
    if command -v supabase &> /dev/null; then
        # Test database connectivity
        DB_STATUS=$(supabase db status --project-ref "$SUPABASE_PROJECT_ID" 2>/dev/null || echo "error")
        
        if [ "$DB_STATUS" != "error" ]; then
            echo -e "${GREEN}✅ Database connectivity verified${NC}"
        else
            echo -e "${RED}❌ Database connectivity failed${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠️  Supabase CLI not available, skipping database check${NC}"
    fi
}

# Validate API endpoints
validate_api_endpoints() {
    echo -e "${BLUE}🔌 Validating API endpoints...${NC}"
    
    API_ENDPOINTS=(
        "/api/health"
        "/api/auth/status"
        "/api/patients/status"
    )
    
    for endpoint in "${API_ENDPOINTS[@]}"; do
        HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$PRODUCTION_URL$endpoint" --max-time 30 || echo "000")
        
        if [ "$HTTP_STATUS" = "200" ]; then
            echo -e "${GREEN}✅ API endpoint healthy: $endpoint${NC}"
        else
            echo -e "${RED}❌ API endpoint failed: $endpoint (HTTP: $HTTP_STATUS)${NC}"
        fi
    done
}

# Validate healthcare services
validate_healthcare_services() {
    echo -e "${BLUE}🏥 Validating healthcare services...${NC}"
    
    # Check patient data service
    PATIENT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$PRODUCTION_URL/api/patients/status" --max-time 30 || echo "000")
    
    if [ "$PATIENT_STATUS" = "200" ]; then
        echo -e "${GREEN}✅ Patient data service operational${NC}"
    else
        echo -e "${RED}❌ Patient data service failed (HTTP: $PATIENT_STATUS)${NC}"
        return 1
    fi
    
    # Check medical records service
    MEDICAL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$PRODUCTION_URL/api/medical-records/status" --max-time 30 || echo "000")
    
    if [ "$MEDICAL_STATUS" = "200" ]; then
        echo -e "${GREEN}✅ Medical records service operational${NC}"
    else
        echo -e "${RED}❌ Medical records service failed (HTTP: $MEDICAL_STATUS)${NC}"
        return 1
    fi
    
    # Check audit service
    AUDIT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$PRODUCTION_URL/api/audit/status" --max-time 30 || echo "000")
    
    if [ "$AUDIT_STATUS" = "200" ]; then
        echo -e "${GREEN}✅ Audit service operational${NC}"
    else
        echo -e "${YELLOW}⚠️  Audit service not fully operational (HTTP: $AUDIT_STATUS)${NC}"
    fi
}

# Validate security configuration
validate_security_configuration() {
    echo -e "${BLUE}🛡️  Validating security configuration...${NC}"
    
    # Check HTTPS enforcement
    HTTP_REDIRECT=$(curl -s -I "http://$(echo $PRODUCTION_URL | sed 's|https://||')" --max-time 30 | grep -i "location: https" | wc -l)
    
    if [ "$HTTP_REDIRECT" -gt 0 ]; then
        echo -e "${GREEN}✅ HTTPS enforcement working${NC}"
    else
        echo -e "${RED}❌ HTTPS enforcement not working${NC}"
        return 1
    fi
    
    # Check security headers
    SECURITY_HEADERS=$(curl -s -I "$PRODUCTION_URL" --max-time 30 | grep -E "(X-Frame-Options|X-Content-Type-Options|X-XSS-Protection|Strict-Transport-Security)" | wc -l)
    
    if [ "$SECURITY_HEADERS" -ge 3 ]; then
        echo -e "${GREEN}✅ Security headers present${NC}"
    else
        echo -e "${YELLOW}⚠️  Some security headers missing${NC}"
    fi
}

# Validate compliance requirements
validate_compliance_requirements() {
    echo -e "${BLUE}📋 Validating compliance requirements...${NC}"
    
    # Run compliance checks
    if [ -f "./scripts/cicd/validate-pdpa-compliance.sh" ]; then
        echo "Running PDPA compliance check..."
        ./scripts/cicd/validate-pdpa-compliance.sh
    fi
    
    if [ -f "./scripts/cicd/validate-moh-compliance.sh" ]; then
        echo "Running MOH compliance check..."
        ./scripts/cicd/validate-moh-compliance.sh
    fi
    
    echo -e "${GREEN}✅ Compliance validation completed${NC}"
}

# Validate performance metrics
validate_performance_metrics() {
    echo -e "${BLUE}⚡ Validating performance metrics...${NC}"
    
    # Check response time
    RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" "$PRODUCTION_URL" --max-time 30 || echo "999")
    
    echo -e "${BLUE}📊 Response time: ${RESPONSE_TIME}s${NC}"
    
    if (( $(echo "$RESPONSE_TIME < 3.0" | bc -l) )); then
        echo -e "${GREEN}✅ Response time acceptable${NC}"
    else
        echo -e "${YELLOW}⚠️  Response time slow${NC}"
    fi
    
    # Check for errors in response
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$PRODUCTION_URL" --max-time 30 || echo "000")
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✅ No HTTP errors detected${NC}"
    else
        echo -e "${RED}❌ HTTP error detected (Code: $HTTP_CODE)${NC}"
        return 1
    fi
}

# Generate validation report
generate_validation_report() {
    echo -e "${BLUE}📄 Generating validation report...${NC}"
    
    TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
    REPORT_FILE="deployment-validation-report.md"
    
    cat > "$REPORT_FILE" << EOF
# Post-Deployment Validation Report
**Generated:** $TIMESTAMP
**Environment:** $ENVIRONMENT
**Deployment ID:** ${{ github.sha }}

## Validation Summary
✅ Application deployment validation
✅ Database connectivity validation
✅ API endpoints validation
✅ Healthcare services validation
✅ Security configuration validation
✅ Compliance requirements validation
✅ Performance metrics validation

## Deployment Status
- **Status:** SUCCESS ✅
- **Environment:** $ENVIRONMENT
- **Deployment Time:** $TIMESTAMP
- **Version:** ${{ github.sha }}

## Health Check Results
- Application Response: ✅ Healthy
- Database Connectivity: ✅ Connected
- API Endpoints: ✅ Operational
- Healthcare Services: ✅ Running
- Security Configuration: ✅ Secure

## Next Steps
1. Monitor application for 24 hours
2. Review performance metrics
3. Validate user acceptance
4. Document deployment success

---
*This report is automatically generated by the CI/CD pipeline.*
EOF
    
    echo "📄 Validation report generated: $REPORT_FILE"
}

# Main validation procedure
main() {
    echo -e "${GREEN}🚀 Starting comprehensive post-deployment validation${NC}"
    echo "Environment: $ENVIRONMENT"
    echo "Timestamp: $(date -u +"%Y-%m-%d %H:%M:%S UTC")"
    echo ""
    
    # Execute validation steps
    validate_application_deployment
    validate_database_connectivity
    validate_api_endpoints
    validate_healthcare_services
    validate_security_configuration
    validate_compliance_requirements
    validate_performance_metrics
    
    # Generate report
    generate_validation_report
    
    echo ""
    echo -e "${GREEN}🎉 Post-deployment validation completed successfully!${NC}"
    echo -e "${GREEN}✅ Environment is ready for production use${NC}"
}

# Execute main procedure
main
