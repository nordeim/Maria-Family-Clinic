#!/bin/bash
# scripts/cicd/monitoring-checks.sh

set -e

ENVIRONMENT=${1:-production}

echo "📊 Starting pipeline monitoring checks..."

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Monitor pipeline health
monitor_pipeline_health() {
    echo -e "${BLUE}🏥 Checking pipeline health...${NC}"
    
    # Check if recent deployments are successful
    if [ -f "/tmp/last-deployment-status" ]; then
        LAST_STATUS=$(cat /tmp/last-deployment-status)
        if [ "$LAST_STATUS" = "success" ]; then
            echo -e "${GREEN}✅ Last deployment was successful${NC}"
        else
            echo -e "${RED}❌ Last deployment failed${NC}"
            return 1
        fi
    fi
    
    # Check pipeline execution time
    if [ -f "/tmp/pipeline-execution-time" ]; then
        EXEC_TIME=$(cat /tmp/pipeline-execution-time)
        echo -e "${BLUE}⏱️  Pipeline execution time: $EXEC_TIME seconds${NC}"
        
        # Alert if execution time is too long
        if [ "$EXEC_TIME" -gt 1800 ]; then  # 30 minutes
            echo -e "${YELLOW}⚠️  Pipeline execution time is high${NC}"
        fi
    fi
    
    # Check test success rate
    if [ -f "/tmp/test-success-rate" ]; then
        TEST_RATE=$(cat /tmp/test-success-rate)
        echo -e "${BLUE}🧪 Test success rate: $TEST_RATE%${NC}"
        
        if [ "$TEST_RATE" -lt 95 ]; then
            echo -e "${RED}❌ Test success rate is below threshold${NC}"
            return 1
        fi
    fi
    
    echo -e "${GREEN}✅ Pipeline health check passed${NC}"
}

# Monitor deployment performance
monitor_deployment_performance() {
    echo -e "${BLUE}🚀 Checking deployment performance...${NC}"
    
    # Check deployment frequency
    DEPLOY_COUNT=$(find /tmp/deployments -name "*.log" -mtime -7 2>/dev/null | wc -l)
    echo -e "${BLUE}📈 Deployments in last 7 days: $DEPLOY_COUNT${NC}"
    
    # Check mean time to recovery
    if [ -f "/tmp/incident-response-time" ]; then
        MTTR=$(cat /tmp/incident-response-time)
        echo -e "${BLUE}⏰ Mean time to recovery: $MTTR minutes${NC}"
        
        if [ "$MTTR" -gt 15 ]; then
            echo -e "${YELLOW}⚠️  MTTR is above target threshold${NC}"
        fi
    fi
    
    # Check deployment success rate
    if [ -f "/tmp/deployment-success-rate" ]; then
        SUCCESS_RATE=$(cat /tmp/deployment-success-rate)
        echo -e "${BLUE}✅ Deployment success rate: $SUCCESS_RATE%${NC}"
        
        if [ "$SUCCESS_RATE" -lt 98 ]; then
            echo -e "${RED}❌ Deployment success rate is below threshold${NC}"
            return 1
        fi
    fi
    
    echo -e "${GREEN}✅ Deployment performance check passed${NC}"
}

# Monitor code quality metrics
monitor_code_quality() {
    echo -e "${BLUE}📏 Checking code quality metrics...${NC}"
    
    # Check test coverage
    if [ -f "/tmp/test-coverage" ]; then
        COVERAGE=$(cat /tmp/test-coverage)
        echo -e "${BLUE}📊 Test coverage: $COVERAGE%${NC}"
        
        if (( $(echo "$COVERAGE < 85" | bc -l) )); then
            echo -e "${RED}❌ Test coverage is below threshold${NC}"
            return 1
        fi
    fi
    
    # Check code complexity
    if [ -f "/tmp/code-complexity" ]; then
        COMPLEXITY=$(cat /tmp/code-complexity)
        echo -e "${BLUE}🧮 Average code complexity: $COMPLEXITY${NC}"
        
        if [ "$COMPLEXITY" -gt 10 ]; then
            echo -e "${YELLOW}⚠️  Code complexity is above recommended threshold${NC}"
        fi
    fi
    
    # Check security score
    if [ -f "/tmp/security-score" ]; then
        SEC_SCORE=$(cat /tmp/security-score)
        echo -e "${BLUE}🔒 Security score: $SEC_SCORE/100${NC}"
        
        if [ "$SEC_SCORE" -lt 90 ]; then
            echo -e "${RED}❌ Security score is below threshold${NC}"
            return 1
        fi
    fi
    
    echo -e "${GREEN}✅ Code quality check passed${NC}"
}

# Execute monitoring functions
monitor_pipeline_health
monitor_deployment_performance
monitor_code_quality

# Store monitoring results
echo "$(date)" > /tmp/last-monitoring-check
echo "healthy" > /tmp/monitoring-status

echo -e "${GREEN}🎉 Pipeline monitoring completed successfully${NC}"
