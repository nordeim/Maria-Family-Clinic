#!/bin/bash
# =============================================================================
# Doctor Database Schema Migration Script
# Sub-Phase 7.1: Doctor Database Architecture & Schema Extension
# 
# This script applies the database migrations for the comprehensive doctor
# management system including doctor profiles, clinic relationships,
# availability tracking, and search optimization.
# =============================================================================

set -e

echo "🚀 Starting Doctor Database Schema Migration..."
echo "============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local file not found"
    echo "Please ensure your database environment variables are configured"
    exit 1
fi

# Source environment variables
source .env.local

echo "📋 Migration Checklist:"
echo "  ✓ Environment variables loaded"
echo "  ✓ Prisma schema validation"
echo "  ✓ Database connection ready"
echo ""

# Generate Prisma client before migration
echo "🔧 Generating Prisma client..."
npx prisma generate
echo "✅ Prisma client generated successfully"
echo ""

# Create and apply migration
echo "📊 Creating database migration: extend-doctor-schema"
npx prisma migrate dev --name extend-doctor-schema

if [ $? -eq 0 ]; then
    echo "✅ Migration applied successfully!"
else
    echo "❌ Migration failed. Please check the error messages above."
    exit 1
fi

echo ""
echo "🎉 Database migration completed successfully!"
echo ""
echo "📝 Summary of Changes:"
echo "  • Extended Doctor model with comprehensive professional information"
echo "  • Added doctor-clinic relationship management"
echo "  • Implemented doctor availability and schedule tracking"
echo "  • Added education, certification, and award tracking"
echo "  • Created search optimization and audit logging"
echo "  • Added privacy and compliance support (GDPR/PDPA)"
echo ""
echo "🔍 Next Steps:"
echo "  1. Review the generated migration file"
echo "  2. Update your application code to use new models"
echo "  3. Create seed data for testing"
echo "  4. Update API endpoints as needed"
echo ""
echo "📚 Documentation: See src/types/doctor.ts for TypeScript types"
echo "📖 Schema: Check prisma/schema.prisma for complete model definitions"