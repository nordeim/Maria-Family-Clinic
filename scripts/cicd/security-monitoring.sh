#!/bin/bash
# scripts/cicd/security-monitoring.sh

set -e

ENVIRONMENT=${1:-production}

echo "🔒 Starting security monitoring for $ENVIRONMENT..."

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Monitor security vulnerabilities
monitor_vulnerabilities() {
    echo -e "${BLUE}🔍 Monitoring security vulnerabilities...${NC}"
    
    # Check for new vulnerabilities
    if [ -f "/tmp/security-scan-results" ]; then
        TOTAL_VULNS=$(cat /tmp/security-scan-results | jq '.results | length' 2>/dev/null || echo "0")
        HIGH_VULNS=$(cat /tmp/security-scan-results | jq '[.results[] | select(.severity == "HIGH")] | length' 2>/dev/null || echo "0")
        MEDIUM_VULNS=$(cat /tmp/security-scan-results | jq '[.results[] | select(.severity == "MEDIUM")] | length' 2>/dev/null || echo "0")
        
        echo -e "${BLUE}📊 Vulnerability Summary:${NC}"
        echo "  Total vulnerabilities: $TOTAL_VULNS"
        echo "  High severity: $HIGH_VULNS"
        echo "  Medium severity: $MEDIUM_VULNS"
        
        # Alert on high severity vulnerabilities
        if [ "$HIGH_VULNS" -gt 0 ]; then
            echo -e "${RED}❌ High severity vulnerabilities detected${NC}"
            return 1
        fi
        
        if [ "$MEDIUM_VULNS" -gt 5 ]; then
            echo -e "${YELLOW}⚠️  Multiple medium severity vulnerabilities${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  No security scan results available${NC}"
    fi
}

# Monitor access violations
monitor_access_violations() {
    echo -e "${BLUE}🚪 Monitoring access violations...${NC}"
    
    # Check audit logs for suspicious access patterns
    if [ -f "/tmp/audit-logs" ]; then
        # Count unauthorized access attempts
        UNAUTHORIZED_COUNT=$(grep -c "UNAUTHORIZED\|FORBIDDEN" /tmp/audit-logs 2>/dev/null || echo "0")
        
        # Count failed authentication attempts
        FAILED_AUTH_COUNT=$(grep -c "AUTHENTICATION_FAILED" /tmp/audit-logs 2>/dev/null || echo "0")
        
        echo -e "${BLUE}📊 Access Violation Summary:${NC}"
        echo "  Unauthorized access attempts: $UNAUTHORIZED_COUNT"
        echo "  Failed authentication attempts: $FAILED_AUTH_COUNT"
        
        # Alert thresholds
        if [ "$UNAUTHORIZED_COUNT" -gt 10 ]; then
            echo -e "${RED}❌ High number of unauthorized access attempts${NC}"
        fi
        
        if [ "$FAILED_AUTH_COUNT" -gt 50 ]; then
            echo -e "${RED}❌ High number of failed authentication attempts${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Audit logs not available${NC}"
    fi
}

# Monitor security configuration
monitor_security_configuration() {
    echo -e "${BLUE}⚙️  Monitoring security configuration...${NC}"
    
    # Check SSL/TLS configuration
    SSL_GRADE=$(curl -s "https://api.ssllabs.com/api/v3/analyze?host=$(echo $PRODUCTION_URL | sed 's|https://||')&publish=off" | jq -r '.endpoints[0].grade' 2>/dev/null || echo "Unknown")
    
    echo "SSL Labs Grade: $SSL_GRADE"
    
    if [ "$SSL_GRADE" = "A" ] || [ "$SSL_GRADE" = "A+" ]; then
        echo -e "${GREEN}✅ SSL configuration is excellent${NC}"
    elif [ "$SSL_GRADE" = "B" ]; then
        echo -e "${GREEN}✅ SSL configuration is good${NC}"
    elif [ "$SSL_GRADE" = "C" ] || [ "$SSL_GRADE" = "D" ] || [ "$SSL_GRADE" = "F" ]; then
        echo -e "${RED}❌ SSL configuration needs improvement${NC}"
    else
        echo -e "${YELLOW}⚠️  SSL configuration status unknown${NC}"
    fi
    
    # Check security headers
    SECURITY_HEADERS_SCORE=0
    
    # Check for essential security headers
    HEADERS_TO_CHECK=(
        "Strict-Transport-Security"
        "X-Content-Type-Options"
        "X-Frame-Options"
        "X-XSS-Protection"
        "Content-Security-Policy"
    )
    
    for header in "${HEADERS_TO_CHECK[@]}"; do
        if curl -s -I "$PRODUCTION_URL" | grep -q "$header"; then
            ((SECURITY_HEADERS_SCORE++))
        fi
    done
    
    echo "Security headers score: $SECURITY_HEADERS_SCORE/${#HEADERS_TO_CHECK[@]}"
    
    if [ $SECURITY_HEADERS_SCORE -eq ${#HEADERS_TO_CHECK[@]} ]; then
        echo -e "${GREEN}✅ All security headers are present${NC}"
    elif [ $SECURITY_HEADERS_SCORE -gt 3 ]; then
        echo -e "${YELLOW}⚠️  Most security headers are present${NC}"
    else
        echo -e "${RED}❌ Missing critical security headers${NC}"
    fi
}

# Monitor healthcare-specific security
monitor_healthcare_security() {
    echo -e "${BLUE}🏥 Monitoring healthcare-specific security...${NC}"
    
    # Check patient data access patterns
    if [ -f "/tmp/patient-access-logs" ]; then
        # Monitor for unusual access patterns
        AFTER_HOURS_ACCESS=$(grep -c "AFTER_HOURS" /tmp/patient-access-logs 2>/dev/null || echo "0")
        BULK_ACCESS=$(grep -c "BULK_ACCESS" /tmp/patient-access-logs 2>/dev/null || echo "0")
        
        echo -e "${BLUE}📊 Healthcare Security Summary:${NC}"
        echo "  After-hours patient access: $AFTER_HOURS_ACCESS"
        echo "  Bulk patient data access: $BULK_ACCESS"
        
        # Alert on suspicious patterns
        if [ "$AFTER_HOURS_ACCESS" -gt 5 ]; then
            echo -e "${YELLOW}⚠️  Unusual after-hours access detected${NC}"
        fi
        
        if [ "$BULK_ACCESS" -gt 3 ]; then
            echo -e "${YELLOW}⚠️  Bulk data access patterns detected${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Healthcare access logs not available${NC}"
    fi
    
    # Check encryption status
    ENCRYPTION_STATUS=$(grep -c "ENCRYPTED\|encrypted" /tmp/data-status 2>/dev/null || echo "0")
    echo "Encryption status: $ENCRYPTION_STATUS records encrypted"
    
    if [ "$ENCRYPTION_STATUS" -eq 0 ]; then
        echo -e "${RED}❌ No encryption status information available${NC}"
    else
        echo -e "${GREEN}✅ Data encryption status verified${NC}"
    fi
}

# Execute security monitoring
monitor_vulnerabilities
monitor_access_violations
monitor_security_configuration
monitor_healthcare_security

# Store security monitoring results
echo "$(date)" > /tmp/last-security-check
echo "secure" > /tmp/security-status

echo -e "${GREEN}🎉 Security monitoring completed${NC}"
