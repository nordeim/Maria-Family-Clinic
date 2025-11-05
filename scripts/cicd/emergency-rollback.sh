#!/bin/bash
# scripts/cicd/emergency-rollback.sh

set -e

ENVIRONMENT=${1:-production}
BACKUP_VERSION=${2:-latest}

echo "🚨 Initiating emergency rollback for $ENVIRONMENT environment..."

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Immediate notifications
send_rollback_notifications() {
    echo -e "${RED}🚨 Sending rollback notifications...${NC}"
    
    # Slack notification
    SLACK_PAYLOAD=$(cat << EOF
    {
        "text": "🚨 EMERGENCY ROLLBACK INITIATED",
        "attachments": [
            {
                "color": "danger",
                "fields": [
                    {
                        "title": "Environment",
                        "value": "$ENVIRONMENT",
                        "short": true
                    },
                    {
                        "title": "Trigger",
                        "value": "Monitoring failure detected",
                        "short": true
                    },
                    {
                        "title": "Backup Version",
                        "value": "$BACKUP_VERSION",
                        "short": true
                    },
                    {
                        "title": "Timestamp",
                        "value": "$(date -u +"%Y-%m-%d %H:%M:%S UTC")",
                        "short": true
                    }
                ]
            }
        ]
    }
    EOF
    )
    
    # Send to Slack (if webhook is configured)
    if [ -n "$SLACK_WEBHOOK" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "$SLACK_PAYLOAD" \
            "$SLACK_WEBHOOK"
    fi
}

# Stop traffic to affected services
stop_traffic() {
    echo -e "${YELLOW}🛑 Stopping traffic to affected services...${NC}"
    
    # Enable maintenance mode
    if [ -f "./scripts/cicd/maintenance-mode.sh" ]; then
        ./scripts/cicd/maintenance-mode.sh enable
    fi
    
    # Drain load balancer connections
    if command -v kubectl &> /dev/null; then
        kubectl drain nodes --ignore-daemonsets --delete-emptydir-data || true
    fi
    
    echo "✅ Traffic stopped successfully"
}

# Restore database from backup
restore_database() {
    echo -e "${BLUE}💾 Restoring database from backup...${NC}"
    
    if command -v supabase &> /dev/null; then
        # Restore Supabase database
        echo "Restoring Supabase database to version: $BACKUP_VERSION"
        supabase db restore --project-ref "$SUPABASE_PROJECT_ID" --backup-id "$BACKUP_VERSION"
        
        echo "✅ Database restored successfully"
    else
        echo -e "${YELLOW}⚠️  Supabase CLI not available, skipping database restore${NC}"
    fi
}

# Rollback application deployment
rollback_application() {
    echo -e "${BLUE}🔄 Rolling back application deployment...${NC}"
    
    # Rollback to previous version in container registry
    if [ -f "./scripts/cicd/deploy-previous-version.sh" ]; then
        ./scripts/cicd/deploy-previous-version.sh "$ENVIRONMENT" "$BACKUP_VERSION"
    else
        # Fallback to manual rollback
        if command -v kubectl &> /dev/null; then
            kubectl rollout undo deployment/healthcare-app --namespace="$ENVIRONMENT"
        fi
    fi
    
    echo "✅ Application rollback completed"
}

# Validate rollback
validate_rollback() {
    echo -e "${BLUE}🔍 Validating rollback...${NC}"
    
    # Wait for services to be ready
    sleep 30
    
    # Run basic health checks
    if [ -f "./scripts/cicd/health-checks.sh" ]; then
        ./scripts/cicd/health-checks.sh "$ENVIRONMENT"
    fi
    
    # Check critical endpoints
    if [ -n "$PRODUCTION_URL" ]; then
        HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$PRODUCTION_URL/health" || echo "000")
        
        if [ "$HTTP_STATUS" = "200" ]; then
            echo -e "${GREEN}✅ Rollback validation successful${NC}"
        else
            echo -e "${RED}❌ Rollback validation failed (HTTP: $HTTP_STATUS)${NC}"
            return 1
        fi
    fi
}

# Restore traffic
restore_traffic() {
    echo -e "${GREEN}🔓 Restoring traffic to services...${NC}"
    
    # Re-enable load balancer
    if command -v kubectl &> /dev/null; then
        kubectl uncordon nodes || true
    fi
    
    # Disable maintenance mode
    if [ -f "./scripts/cicd/maintenance-mode.sh" ]; then
        ./scripts/cicd/maintenance-mode.sh disable
    fi
    
    echo "✅ Traffic restored successfully"
}

# Send completion notifications
send_completion_notifications() {
    echo -e "${GREEN}✅ Sending rollback completion notifications...${NC}"
    
    COMPLETION_PAYLOAD=$(cat << EOF
    {
        "text": "✅ Emergency Rollback Completed",
        "attachments": [
            {
                "color": "good",
                "fields": [
                    {
                        "title": "Environment",
                        "value": "$ENVIRONMENT",
                        "short": true
                    },
                    {
                        "title": "Status",
                        "value": "Rollback completed successfully",
                        "short": true
                    },
                    {
                        "title": "Duration",
                        "value": "$(($(date +%s) - ROLLBACK_START)) seconds",
                        "short": true
                    }
                ]
            }
        ]
    }
    EOF
    )
    
    # Send to Slack
    if [ -n "$SLACK_WEBHOOK" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "$COMPLETION_PAYLOAD" \
            "$SLACK_WEBHOOK"
    fi
}

# Main rollback procedure
main() {
    ROLLBACK_START=$(date +%s)
    
    echo -e "${RED}🚨 EMERGENCY ROLLBACK INITIATED${NC}"
    echo "Environment: $ENVIRONMENT"
    echo "Backup Version: $BACKUP_VERSION"
    echo "Timestamp: $(date -u +"%Y-%m-%d %H:%M:%S UTC")"
    echo ""
    
    # Execute rollback steps
    send_rollback_notifications
    stop_traffic
    restore_database
    rollback_application
    
    # Validate rollback
    if validate_rollback; then
        restore_traffic
        send_completion_notifications
        
        echo ""
        echo -e "${GREEN}🎉 EMERGENCY ROLLBACK COMPLETED SUCCESSFULLY${NC}"
        echo "Duration: $(($(date +%s) - ROLLBACK_START)) seconds"
    else
        echo ""
        echo -e "${RED}❌ EMERGENCY ROLLBACK VALIDATION FAILED${NC}"
        echo "Manual intervention required!"
        
        # Send failure notification
        FAILURE_PAYLOAD=$(cat << EOF
        {
            "text": "❌ Emergency Rollback Failed",
            "attachments": [
                {
                    "color": "danger",
                    "fields": [
                        {
                            "title": "Environment",
                            "value": "$ENVIRONMENT",
                            "short": true
                        },
                        {
                            "title": "Status",
                            "value": "Rollback validation failed",
                            "short": true
                        }
                    ]
                }
            ]
        }
        EOF
        )
        
        if [ -n "$SLACK_WEBHOOK" ]; then
            curl -X POST -H 'Content-type: application/json' \
                --data "$FAILURE_PAYLOAD" \
                "$SLACK_WEBHOOK"
        fi
        
        exit 1
    fi
}

# Execute main procedure
main
