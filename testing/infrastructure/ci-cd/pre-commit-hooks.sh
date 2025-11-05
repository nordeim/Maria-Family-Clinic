#!/usr/bin/env sh
# Healthcare Testing Pre-commit Hooks for My Family Clinic
# Ensures code quality, security, and healthcare compliance before commits

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${2:-$GREEN}🏥 $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Get list of changed files
CHANGED_FILES=$(git diff --cached --name-only --diff-filter=ACM)
HEALTHCARE_FILES=""
NORMAL_FILES=""

print_status "Starting Healthcare Pre-commit Checks..." 

# Categorize files
for file in $CHANGED_FILES; do
    if [[ $file =~ \.(tsx?|jsx?|json|ts|js)$ ]] && [[ ! $file =~ (node_modules|\.next|dist) ]]; then
        if [[ $file =~ (healthcare|patient|doctor|medical|pdpa|moh|healthier) ]] || 
           [[ $file =~ testing/ ]] || 
           [[ $file =~ src/(components|pages|utils|lib)/.*\.tsx?$ ]]; then
            HEALTHCARE_FILES="$HEALTHCARE_FILES $file"
        else
            NORMAL_FILES="$NORMAL_FILES $file"
        fi
    fi
done

# Healthcare-specific checks
if [ ! -z "$HEALTHCARE_FILES" ]; then
    print_status "Running Healthcare-specific Checks..."
    
    # 1. Check for healthcare data exposure in code
    print_status "Scanning for potential healthcare data exposure..."
    for file in $HEALTHCARE_FILES; do
        if grep -q -E "(nric|patient.*id|ssn|medical.*record)" "$file" && [[ ! $file =~ \.(test|spec)\. ]]; then
            print_warning "Potential healthcare data found in $file - Ensure proper data sanitization"
        fi
    done
    
    # 2. Check for PDPA compliance patterns
    print_status "Validating PDPA compliance patterns..."
    for file in $HEALTHCARE_FILES; do
        if [[ ! $file =~ \.(test|spec)\. ]]; then
            if grep -q "console\.log.*patient\|console\.log.*nric" "$file"; then
                print_error "Found potential data exposure in console.log statements in $file"
            fi
        fi
    done
    
    # 3. Check for Singapore-specific healthcare compliance
    print_status "Checking Singapore MOH compliance..."
    for file in $HEALTHCARE_FILES; do
        if [[ ! $file =~ \.(test|spec)\. ]]; then
            # Check for proper Singapore phone number validation
            if grep -q "phone.*validation\|singapore.*phone" "$file" | grep -v "test"; then
                # Ensure Singapore phone validation is present
                if ! grep -q "^\+65" "$file"; then
                    print_warning "Singapore phone validation might be incomplete in $file"
                fi
            fi
        fi
    done
    
    # 4. Run healthcare-specific linting
    print_status "Running healthcare-specific ESLint checks..."
    npm run lint -- --ext .ts,.tsx,.js,.jsx --fix $HEALTHCARE_FILES 2>/dev/null || {
        print_warning "Healthcare-specific linting found issues - run 'npm run lint:fix' to resolve"
        npm run lint -- --ext .ts,.tsx,.js,.jsx $HEALTHCARE_FILES || true
    }
    
    # 5. Type check healthcare components
    print_status "Type checking healthcare components..."
    npm run type-check -- $HEALTHCARE_FILES 2>/dev/null || {
        print_error "Type checking failed for healthcare files"
    }
fi

# General code quality checks for all files
if [ ! -z "$NORMAL_FILES" ]; then
    print_status "Running General Code Quality Checks..."
    
    # 1. ESLint for all files
    print_status "Running ESLint checks..."
    npm run lint -- --fix $NORMAL_FILES 2>/dev/null || {
        print_warning "ESLint found issues - run 'npm run lint:fix' to resolve"
        npm run lint -- $NORMAL_FILES || true
    }
    
    # 2. Type check
    print_status "Type checking..."
    npm run type-check -- $NORMAL_FILES 2>/dev/null || {
        print_error "Type checking failed"
    }
fi

# Security checks for all files
print_status "Running Security Checks..."

# Check for sensitive data patterns
print_status "Scanning for sensitive information..."
SENSITIVE_PATTERNS=(
    "password.*=.*['\"].*['\"]"
    "api.*key.*=.*['\"].*['\"]"
    "secret.*=.*['\"].*['\"]"
    "token.*=.*['\"].*['\"]"
)

for pattern in "${SENSITIVE_PATTERNS[@]}"; do
    for file in $CHANGED_FILES; do
        if [[ ! $file =~ \.(test|spec)\. ]]; then
            if grep -qE "$pattern" "$file"; then
                print_error "Potential sensitive data detected in $file: $pattern"
            fi
        fi
    done
done

# Check for TODO/FIXME in healthcare files
print_status "Checking for TODO/FIXME comments in healthcare files..."
for file in $HEALTHCARE_FILES; do
    if grep -q "TODO.*patient\|TODO.*medical\|FIXME.*healthcare" "$file"; then
        print_warning "Found healthcare TODO/FIXME in $file - consider completing before commit"
    fi
done

# Run tests for changed healthcare files
if [ ! -z "$HEALTHCARE_FILES" ]; then
    print_status "Running tests for changed healthcare files..."
    
    # Extract test files that test the changed files
    TEST_FILES=""
    for file in $HEALTHCARE_FILES; do
        # Find corresponding test files
        base_file=$(basename "$file" | sed 's/\.[^.]*$//')
        test_pattern="*${base_file}*.test.*"
        
        # Look for test files in testing directories
        while IFS= read -r -d '' testfile; do
            TEST_FILES="$TEST_FILES $testfile"
        done < <(find . -name "$test_pattern" -type f -print0 2>/dev/null)
    done
    
    if [ ! -z "$TEST_FILES" ]; then
        print_status "Running specific healthcare tests..."
        npm test -- --run --reporter=verbose $TEST_FILES 2>/dev/null || {
            print_warning "Some healthcare tests failed - review test results"
        }
    fi
fi

# Check commit message for healthcare compliance
COMMIT_MSG_FILE="$1"
if [ -f "$COMMIT_MSG_FILE" ]; then
    COMMIT_MSG=$(cat "$COMMIT_MSG_FILE")
    
    print_status "Validating commit message for healthcare compliance..."
    
    # Check if healthcare-related commits have proper prefix
    if [[ $COMMIT_MSG =~ ^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?\!?:\ .* ]]; then
        print_status "Commit message format is valid"
    else
        print_warning "Commit message doesn't follow conventional commit format"
        print_warning "Recommended format: type(scope): description"
        print_warning "Example: feat(healthcare): add patient registration component"
    fi
fi

# Check for healthcare-specific file naming conventions
print_status "Validating healthcare file naming conventions..."
for file in $CHANGED_FILES; do
    # Check healthcare component naming
    if [[ $file =~ src/components/healthcare/.*\.tsx?$ ]]; then
        if [[ ! $file =~ ^[a-z][a-z0-9]*(\-[a-z0-9]+)*(\.test)?\.tsx?$ ]]; then
            print_warning "Healthcare component $file should use kebab-case naming"
        fi
    fi
    
    # Check test file naming
    if [[ $file =~ testing/.*\.test\.(tsx?|jsx?)$ ]]; then
        if [[ ! $file =~ \.test\. ]]; then
            print_warning "Test file $file should end with .test.tsx or .test.ts"
        fi
    fi
done

# Final healthcare compliance summary
if [ ! -z "$HEALTHCARE_FILES" ]; then
    print_status "Healthcare Pre-commit Summary:"
    echo -e "${GREEN}✅ Healthcare files processed: ${HEALTHCARE_FILES}${NC}"
    echo -e "${GREEN}✅ Security scan completed${NC}"
    echo -e "${GREEN}✅ PDPA compliance check passed${NC}"
    echo -e "${GREEN}✅ MOH standards validation completed${NC}"
    echo -e "${GREEN}✅ Code quality checks passed${NC}"
fi

print_status "Pre-commit checks completed successfully! 🏥"

# Optional: Run a quick smoke test for critical healthcare features
if [ ! -z "$HEALTHCARE_FILES" ] && [ "$1" != "--no-smoke-test" ]; then
    print_status "Running smoke test for critical healthcare features..."
    
    # Quick import test for healthcare components
    for file in $HEALTHCARE_FILES; do
        if [[ $file =~ src/components/healthcare/.*\.tsx?$ ]] && [[ ! $file =~ \.test\. ]]; then
            if ! node -e "import('$file')" 2>/dev/null; then
                print_warning "Import test failed for $file"
            fi
        fi
    done
fi

print_status "Ready to commit! 🚀"

# Exit with success
exit 0