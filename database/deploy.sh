#!/bin/bash

# =====================================================
# MY FAMILY CLINIC - DATABASE DEPLOYMENT SCRIPT
# =====================================================
# This script deploys the My Family Clinic database
# to different environments (dev, staging, prod)
# =====================================================

set -e  # Exit on any error

# Configuration
ENVIRONMENT=${1:-dev}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    log_info "Checking requirements..."
    
    if ! command -v psql &> /dev/null; then
        log_error "psql is not installed. Please install PostgreSQL client tools."
        exit 1
    fi
    
    log_success "Requirements check passed"
}

# Load environment configuration
load_env_config() {
    log_info "Loading environment configuration for $ENVIRONMENT..."
    
    case $ENVIRONMENT in
        dev)
            DATABASE_URL="${DATABASE_URL:-postgresql://postgres:password@localhost:5432/myfamilyclinic_dev}"
            ;;
        staging)
            DATABASE_URL="${DATABASE_URL:-postgresql://postgres:password@localhost:5432/myfamilyclinic_staging}"
            ;;
        prod)
            if [[ -z "$DATABASE_URL" ]]; then
                log_error "DATABASE_URL environment variable must be set for production"
                exit 1
            fi
            ;;
        *)
            log_error "Invalid environment: $ENVIRONMENT. Use: dev, staging, or prod"
            exit 1
            ;;
    esac
    
    log_success "Environment configuration loaded for $ENVIRONMENT"
}

# Validate database connection
validate_connection() {
    log_info "Validating database connection..."
    
    if ! PGPASSWORD="${DATABASE_URL#*@*@*:*:/}" psql "${DATABASE_URL}" -c "SELECT 1;" &> /dev/null; then
        log_error "Cannot connect to database. Please check your DATABASE_URL"
        exit 1
    fi
    
    log_success "Database connection validated"
}

# Run database schema
deploy_schema() {
    log_info "Deploying database schema..."
    
    # Check if schema file exists
    if [[ ! -f "$SCRIPT_DIR/complete-schema.sql" ]]; then
        log_error "Schema file not found: $SCRIPT_DIR/complete-schema.sql"
        exit 1
    fi
    
    # Deploy schema
    PGPASSWORD="${DATABASE_URL#*@*@*:*:/}" psql "${DATABASE_URL}" -f "$SCRIPT_DIR/complete-schema.sql" --quiet
    
    if [[ $? -eq 0 ]]; then
        log_success "Database schema deployed successfully"
    else
        log_error "Failed to deploy database schema"
        exit 1
    fi
}

# Initialize development data
init_dev_data() {
    if [[ "$ENVIRONMENT" == "dev" ]]; then
        log_info "Initializing development data..."
        
        if [[ ! -f "$SCRIPT_DIR/local-dev-init.sql" ]]; then
            log_warning "Development data file not found: $SCRIPT_DIR/local-dev-init.sql"
            return
        fi
        
        PGPASSWORD="${DATABASE_URL#*@*@*:*:/}" psql "${DATABASE_URL}" -f "$SCRIPT_DIR/local-dev-init.sql" --quiet
        
        if [[ $? -eq 0 ]]; then
            log_success "Development data initialized successfully"
        else
            log_error "Failed to initialize development data"
            exit 1
        fi
    else
        log_info "Skipping development data initialization for $ENVIRONMENT"
    fi
}

# Run migrations (for future schema changes)
run_migrations() {
    log_info "Checking for pending migrations..."
    
    # Look for migration files
    MIGRATION_DIR="$PROJECT_ROOT/supabase/migrations"
    if [[ -d "$MIGRATION_DIR" ]]; then
        MIGRATION_COUNT=$(find "$MIGRATION_DIR" -name "*.sql" | wc -l)
        if [[ $MIGRATION_COUNT -gt 0 ]]; then
            log_info "Found $MIGRATION_COUNT migration files"
            
            # Apply migrations in order
            find "$MIGRATION_DIR" -name "*.sql" | sort | while read -r migration_file; do
                log_info "Applying migration: $(basename "$migration_file")"
                PGPASSWORD="${DATABASE_URL#*@*@*:*:/}" psql "${DATABASE_URL}" -f "$migration_file" --quiet
                
                if [[ $? -ne 0 ]]; then
                    log_error "Failed to apply migration: $migration_file"
                    exit 1
                fi
            done
            
            log_success "All migrations applied successfully"
        else
            log_info "No pending migrations found"
        fi
    else
        log_info "Migrations directory not found, skipping"
    fi
}

# Verify deployment
verify_deployment() {
    log_info "Verifying deployment..."
    
    # Check if essential tables exist
    TABLES=("users" "clinics" "doctors" "services" "healthier_sg_programs")
    
    for table in "${TABLES[@]}"; do
        RESULT=$(PGPASSWORD="${DATABASE_URL#*@*@*:*:/}" psql "${DATABASE_URL}" -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '$table' AND table_schema = 'public');" | xargs)
        
        if [[ "$RESULT" == "t" ]]; then
            log_success "Table '$table' exists"
        else
            log_error "Table '$table' is missing"
            exit 1
        fi
    done
    
    log_success "Deployment verification passed"
}

# Generate deployment report
generate_report() {
    log_info "Generating deployment report..."
    
    REPORT_FILE="$PROJECT_ROOT/deployment-report-${ENVIRONMENT}-$(date +%Y%m%d-%H%M%S).txt"
    
    {
        echo "My Family Clinic Database Deployment Report"
        echo "=========================================="
        echo "Environment: $ENVIRONMENT"
        echo "Database URL: ${DATABASE_URL%@*}" # Hide password
        echo "Deployment Time: $(date)"
        echo ""
        echo "Database Statistics:"
        echo "-------------------"
        PGPASSWORD="${DATABASE_URL#*@*@*:*:/}" psql "${DATABASE_URL}" -c "
            SELECT 
                schemaname,
                tablename,
                n_tup_ins - n_tup_del as row_count,
                pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
            FROM pg_stat_user_tables 
            WHERE schemaname = 'public'
            ORDER BY n_tup_ins DESC;
        " --quiet
        echo ""
        echo "Tables Created:"
        echo "--------------"
        PGPASSWORD="${DATABASE_URL#*@*@*:*:/}" psql "${DATABASE_URL}" -c "
            SELECT 
                table_name,
                table_type
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        " --quiet
        echo ""
        echo "Deployment completed successfully!"
    } > "$REPORT_FILE"
    
    log_success "Deployment report saved to: $REPORT_FILE"
}

# Cleanup function
cleanup() {
    if [[ $? -ne 0 ]]; then
        log_error "Deployment failed. Please check the logs above for details."
        exit 1
    fi
}

# Main deployment function
main() {
    log_info "Starting My Family Clinic database deployment for $ENVIRONMENT environment"
    
    # Set trap for cleanup
    trap cleanup EXIT
    
    # Run deployment steps
    check_requirements
    load_env_config
    validate_connection
    deploy_schema
    init_dev_data
    run_migrations
    verify_deployment
    generate_report
    
    log_success "Database deployment completed successfully for $ENVIRONMENT!"
    
    # Print next steps
    echo ""
    echo "Next steps:"
    echo "1. Update your application environment variables"
    echo "2. Configure your ORM (Prisma, TypeORM, etc.)"
    echo "3. Run your application tests"
    echo "4. Set up monitoring and backups"
    echo ""
}

# Show usage
show_usage() {
    echo "Usage: $0 [environment]"
    echo ""
    echo "Environments:"
    echo "  dev       - Development (default)"
    echo "  staging   - Staging"
    echo "  prod      - Production"
    echo ""
    echo "Environment Variables:"
    echo "  DATABASE_URL - PostgreSQL connection string"
    echo ""
    echo "Examples:"
    echo "  $0 dev                      # Deploy to development"
    echo "  $0 staging                  # Deploy to staging"
    echo "  DATABASE_URL=\"postgresql://...\" $0 prod  # Deploy to production"
}

# Handle script arguments
case "${1:-}" in
    -h|--help)
        show_usage
        exit 0
        ;;
    *)
        main
        ;;
esac