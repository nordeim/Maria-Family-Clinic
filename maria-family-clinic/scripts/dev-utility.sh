#!/bin/bash

# My Family Clinic - Development Utility Script
# This script helps with common development tasks

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    # Check Node.js
    if command -v node &> /dev/null; then
        node_version=$(node --version)
        print_success "Node.js found: $node_version"
        
        # Check if version is >= 18
        if node --version | grep -q "v1[89]\." || node --version | grep -q "v2[0-9]\."; then
            print_success "Node.js version is compatible"
        else
            print_error "Node.js version must be >= 18.9.0"
            exit 1
        fi
    else
        print_error "Node.js not found. Please install Node.js 18+"
        exit 1
    fi
    
    # Check npm
    if command -v npm &> /dev/null; then
        npm_version=$(npm --version)
        print_success "npm found: $npm_version"
    else
        print_error "npm not found"
        exit 1
    fi
    
    # Check if .env.local exists
    if [ ! -f ".env.local" ]; then
        print_warning ".env.local not found. Copying from example..."
        cp .env.local.example .env.local
        print_success "Created .env.local from example"
        print_warning "Please update .env.local with your actual environment variables"
    else
        print_success ".env.local exists"
    fi
}

# Install dependencies
install_dependencies() {
    print_header "Installing Dependencies"
    
    if [ ! -d "node_modules" ]; then
        print_warning "Installing all dependencies..."
        npm install
        print_success "Dependencies installed"
    else
        print_success "Dependencies already installed"
    fi
}

# Setup database
setup_database() {
    print_header "Setting up Database"
    
    # Generate Prisma client
    print_warning "Generating Prisma client..."
    npm run db:generate
    print_success "Prisma client generated"
    
    # Run migrations
    print_warning "Running database migrations..."
    npm run db:migrate
    print_success "Migrations completed"
    
    # Seed database
    print_warning "Seeding database with sample data..."
    npm run db:seed
    print_success "Database seeded successfully"
}

# Validate environment
validate_environment() {
    print_header "Validating Environment"
    
    # Check required environment variables
    if grep -q "^NEXT_PUBLIC_SUPABASE_URL=" .env.local && ! grep -q "^NEXT_PUBLIC_SUPABASE_URL=\"\"\?$" .env.local; then
        print_success "Supabase URL configured"
    else
        print_error "NEXT_PUBLIC_SUPABASE_URL not configured in .env.local"
    fi
    
    if grep -q "^NEXT_PUBLIC_SUPABASE_ANON_KEY=" .env.local && ! grep -q "^NEXT_PUBLIC_SUPABASE_ANON_KEY=\"\"\?$" .env.local; then
        print_success "Supabase anon key configured"
    else
        print_error "NEXT_PUBLIC_SUPABASE_ANON_KEY not configured in .env.local"
    fi
    
    if grep -q "^NEXTAUTH_SECRET=" .env.local && ! grep -q "^NEXTAUTH_SECRET=\"\"\?$" .env.local; then
        print_success "NextAuth secret configured"
    else
        print_warning "NEXTAUTH_SECRET not configured (will use development secret)"
    fi
}

# Run quality checks
run_quality_checks() {
    print_header "Running Quality Checks"
    
    # TypeScript check
    print_warning "Running TypeScript type check..."
    npm run type-check
    print_success "TypeScript check passed"
    
    # ESLint check
    print_warning "Running ESLint..."
    npm run lint
    print_success "ESLint check passed"
    
    # Prettier check
    print_warning "Checking code formatting..."
    npm run format:check
    print_success "Code formatting check passed"
}

# Start development server
start_dev_server() {
    print_header "Starting Development Server"
    
    print_success "Starting Next.js development server..."
    print_warning "Open http://localhost:3000 in your browser"
    print_warning "Press Ctrl+C to stop the server"
    
    npm run dev
}

# Create backup
create_backup() {
    print_header "Creating Development Backup"
    
    backup_dir="backup_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"
    
    # Backup database schema
    cp prisma/schema.prisma "$backup_dir/"
    
    # Backup environment files
    cp .env.local* "$backup_dir/" 2>/dev/null || true
    
    # Backup configuration files
    cp *.config.* "$backup_dir/" 2>/dev/null || true
    cp package.json package-lock.json "$backup_dir/" 2>/dev/null || true
    
    print_success "Backup created in $backup_dir"
}

# Reset development environment
reset_environment() {
    print_header "Resetting Development Environment"
    
    print_warning "This will reset the database and reinstall dependencies"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Resetting database..."
        npm run db:reset
        print_success "Database reset completed"
        
        print_warning "Cleaning dependencies..."
        rm -rf node_modules package-lock.json
        npm install
        print_success "Dependencies reinstalled"
        
        print_success "Environment reset completed"
    else
        print_success "Reset cancelled"
    fi
}

# Help function
show_help() {
    echo -e "${BLUE}My Family Clinic - Development Utility Script${NC}\n"
    echo "Usage: ./scripts/dev-utility.sh [command]\n"
    echo "Commands:"
    echo "  setup          - Complete development setup (checks, install, database)"
    echo "  check          - Check prerequisites and environment"
    echo "  install        - Install dependencies"
    echo "  db-setup       - Setup database (migrations and seed)"
    echo "  validate       - Validate environment configuration"
    echo "  quality        - Run quality checks (TS, ESLint, Prettier)"
    echo "  dev            - Start development server"
    echo "  backup         - Create development backup"
    echo "  reset          - Reset development environment"
    echo "  help           - Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./scripts/dev-utility.sh setup      # First time setup"
    echo "  ./scripts/dev-utility.sh dev        # Start development server"
    echo "  ./scripts/dev-utility.sh quality    # Run quality checks"
}

# Main script
main() {
    case "${1:-help}" in
        setup)
            check_prerequisites
            install_dependencies
            setup_database
            validate_environment
            print_success "Development environment setup completed!"
            ;;
        check)
            check_prerequisites
            validate_environment
            ;;
        install)
            install_dependencies
            ;;
        db-setup)
            setup_database
            ;;
        validate)
            validate_environment
            ;;
        quality)
            run_quality_checks
            ;;
        dev)
            start_dev_server
            ;;
        backup)
            create_backup
            ;;
        reset)
            reset_environment
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"